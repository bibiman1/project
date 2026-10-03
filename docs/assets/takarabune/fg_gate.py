# 正門の前後の重なり(2026-10-03、作者「金網フェンスは？前後関係」)
# 半開きの門扉 2 枚と、守衛所と立て札を、背景の絵から切り出す。
# 門扉は地面に斜めに立つので、細い縦の帯に切って、帯ごとに足もとの y を変える(帯の分け方は worlds.js の TK_GATE_FG)
from collections import deque
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
A = '/home/user/project/field/assets/worlds/takarabune/'
bg = Image.open(A + 'bg_gate.png').convert('RGBA')
px = np.array(bg)
H, W = px.shape[:2]
pm = Image.new('L', (W, H), 0); d = ImageDraw.Draw(pm)
d.polygon([(356, 70), (413, 112), (414, 203), (356, 163)], fill=255)   # 左の門扉
d.polygon([(478, 70), (424, 112), (424, 195), (478, 163)], fill=255)   # 右の門扉
m = np.array(pm) > 0

def outlined(x0, y0, x1, y1, dark=30):
    """箱の中で、暗いふち取りに囲まれた部分(ふち取りをふくむ)"""
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

d.rectangle((537, 125, 649, 152), fill=255)   # 守衛所の屋根
d.rectangle((543, 150, 640, 214), fill=255)   # 守衛所
d.rectangle((646, 174, 677, 200), fill=255)   # 立て札の板
d.rectangle((650, 198, 656, 216), fill=255); d.rectangle((667, 198, 673, 216), fill=255)   # 立て札の脚
m = np.array(pm) > 0
# 門扉は金網なので、うしろのきーが透けて見えるように、網を半分すかす。まわりの枠(ふちから 5 ドット)は透かさない
door = np.zeros((H, W), bool); door[:, 350:482] = True; door &= m
inner = np.array(Image.fromarray((door * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(11))) > 0
alpha = np.where(m, 255, 0)
inner[:, 404:432] |= door[:, 404:432]   # 扉の先(門のすきまの側)の枠も透かす。すきまを通るきーが見えるように
alpha = np.where(inner, 100, alpha)
fg = px.copy(); fg[..., 3] = alpha
Image.fromarray(fg).save(A + 'fg_gate.png')
chk = px.copy(); chk[m, 0] = 255
Image.fromarray(chk).crop((320, 60, 700, 230)).resize((1140, 510), Image.NEAREST).save('/tmp/claude-0/-home-user-project/e7cb1a9b-b078-5ece-9cdf-0647f5a9d6fa/scratchpad/fgg_chk.png')
print('ok', m.sum())
