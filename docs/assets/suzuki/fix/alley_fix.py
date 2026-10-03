# 路地の背景の手直し(2026-10-03、作者「マンホールがかけている。活版印刷を鈴木印刷に変えて」)
# 1. 印刷屋の看板の字「活版印刷」を消して、同じ字体(DotGothic16、16 ドット)と同じ色で「鈴木印刷」と書く
# 2. 道の上のマンホールのふたの右半分が欠けていたので、左半分を左右に返して写す
import numpy as np
from PIL import Image, ImageDraw, ImageFont
P = '/home/user/project/field/assets/worlds/suzuki/bg_alley.png'
FONT = '/tmp/claude-0/-home-user-project/e7cb1a9b-b078-5ece-9cdf-0647f5a9d6fa/scratchpad/DG.ttf'
im = Image.open(P).convert('RGBA')
a = np.array(im).astype(int)

# 1. 看板
x0, y0, x1, y1 = 238, 115, 306, 136
reg = a[y0:y1, x0:x1, :3]
light = reg.sum(axis=2) > 450
plate = np.median(reg[light], axis=0).astype(int)
ink = reg[reg.sum(axis=2) < 200]
ink = np.median(ink, axis=0).astype(int) if len(ink) else np.array([40, 40, 48])
far = np.abs(reg - plate).sum(axis=2) > 45
reg[far] = plate
a[y0:y1, x0:x1, :3] = reg
im = Image.fromarray(a.astype(np.uint8))
fnt = ImageFont.truetype(FONT, 16)
m = Image.new('L', (4 * 16 + 4, 22), 0)
ImageDraw.Draw(m).text((0, 0), '鈴木印刷', fill=255, font=fnt)
m = m.point(lambda v: 255 if v > 110 else 0)
im.paste(Image.new('RGBA', m.size, tuple(int(v) for v in ink) + (255,)), (240, 117), m)

# 2. マンホール(だ円の中で、中心より右を、左半分を返したもので置きかえる)
a = np.array(im).astype(int)
cx, cy, rx, ry = 431, 96, 26, 12
for y in range(cy - ry - 2, cy + ry + 3):
    for x in range(cx + 1, cx + rx + 6):
        inside = ((x - cx) / (rx + 1)) ** 2 + ((y - cy) / (ry + 1)) ** 2 <= 1
        if inside:
            a[y, x] = a[y, 2 * cx - x]
        else:
            # だ円の外の、欠けた縁のかけらは、同じ行で、うめる範囲のすぐ右の道の色でうめる(道は右ほど明るいので、となりから)
            t = 1 - ((y - cy) / (ry + 3)) ** 2
            if t > 0 and ((x - cx) / (rx + 6)) ** 2 + ((y - cy) / (ry + 3)) ** 2 <= 1:
                a[y, x] = a[y, int(cx + (rx + 6) * t ** 0.5) + 1]
Image.fromarray(a.astype(np.uint8)).save(P)
print('plate', plate, 'ink', ink)
