# 原子炉建屋の前後の重なり(2026-10-03、作者「原子炉建屋内の前後関係もみて」)
# 床に立つ回転灯 4 つ、南の標識 4 枚、格納容器の北半分(盛り上がったふち)を、背景の絵から形どおりに切り出す。
# 回転灯と標識は黒いふち取りの内側をとる(ふち取りの外の赤い光は切り出さない)。格納容器はだ円でとる
from collections import deque
import numpy as np
from PIL import Image
A = '/home/user/project/field/assets/worlds/takarabune/'
bg = Image.open(A + 'bg_reactor.png').convert('RGBA')
px = np.array(bg)
H, W = px.shape[:2]
m = np.zeros((H, W), bool)

def outlined(x0, y0, x1, y1, dark=40):
    """箱の中で、黒いふち取りに囲まれた部分(ふち取りをふくむ)"""
    sub = px[y0:y1, x0:x1, :3].astype(int)
    wall = sub.max(axis=2) < dark
    h, w = wall.shape
    out = np.zeros((h, w), bool)
    q = deque((y, x) for y in range(h) for x in (0, w - 1) if not wall[y, x])
    q.extend((y, x) for x in range(w) for y in (0, h - 1) if not wall[y, x])
    for y, x in q: out[y, x] = True
    while q:
        y, x = q.popleft()
        for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= yy < h and 0 <= xx < w and not out[yy, xx] and not wall[yy, xx]:
                out[yy, xx] = True; q.append((yy, xx))
    m[y0:y1, x0:x1] |= ~out

for c, r in ((2, 3), (17, 3), (2, 10), (17, 10)):          # 回転灯
    outlined(c * 32 - 4, r * 32 - 6, c * 32 + 37, r * 32 + 38)
for x0 in (82, 178, 400, 495):                               # 標識(板と柱)
    outlined(x0, 444, x0 + 54, 480)
yy, xx = np.mgrid[0:H, 0:W]                                  # 格納容器の北半分
m |= (((xx - 320) / 163) ** 2 + ((yy - 274) / 144) ** 2 <= 1) & (yy < 274)

fg = px.copy(); fg[..., 3] = np.where(m, px[..., 3], 0)
Image.fromarray(fg).save(A + 'fg_reactor.png')
chk = px.copy(); chk[m, 0] = 255
Image.fromarray(chk).resize((W * 2, H * 2), Image.NEAREST).save('/tmp/claude-0/-home-user-project/e7cb1a9b-b078-5ece-9cdf-0647f5a9d6fa/scratchpad/fgr_chk.png')
print('ok', m.sum())
