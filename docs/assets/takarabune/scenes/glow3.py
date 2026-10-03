# 最後の絵(D89): 水の中から見上げる。上に水面のゆらぎと宝舟の船底の影(竜頭、外輪)、深いところから青い光が立ちのぼる。月は入れない。480×288
import math, random
from PIL import Image, ImageDraw, ImageFilter
O = '/home/user/project/docs/assets/takarabune/scenes/'
R = random.Random(12)
W, H = 480, 288
img = Image.new('RGBA', (W, H), (2, 8, 22, 255)); d = ImageDraw.Draw(img)
for y in range(H): d.line((0, y, W, y), fill=(2, 8 + y // 24, 22 + y // 10))
def blob(cx, cy, r, col, a, sy=1.0, blur=0.45):
    ov = Image.new('RGBA', img.size); od = ImageDraw.Draw(ov)
    od.ellipse((cx - r, cy - r * sy, cx + r, cy + r * sy), fill=col + (a,))
    img.alpha_composite(ov.filter(ImageFilter.GaussianBlur(r * blur)))
# 水面(下から見る): 明るく揺れる網目(コースティクス)
SY = 58
ov = Image.new('RGBA', img.size); od = ImageDraw.Draw(ov)
od.rectangle((0, 0, W, SY), fill=(40, 110, 170, 255))
for k in range(220):
    x = R.randrange(-20, W); y = R.randrange(0, SY)
    pts = [(x + i * 5, y + 3 * math.sin(i * 0.9 + k)) for i in range(R.randrange(3, 7))]
    od.line(pts, fill=(200, 245, 255, 255), width=2)
img.alpha_composite(ov)
ov = Image.new('RGBA', img.size); od = ImageDraw.Draw(ov)
for y in range(SY, SY + 40): od.line((0, y, W, y), fill=(40, 110, 170, int(200 * (1 - (y - SY) / 40))))
img.alpha_composite(ov)
blob(250, 34, 150, (150, 230, 255), 170, 0.25, 0.5)                          # 光が水面を下から照らす
# 宝舟の船底の影(水面に浮かぶ。舳先は右、竜頭、両舷の外輪が水に沈む)
sh = Image.new('RGBA', img.size); sd = ImageDraw.Draw(sh)
cx, cy = 236, 30
sd.polygon([(cx - 70, cy - 8), (cx + 52, cy - 8), (cx + 74, cy - 2), (cx + 52, cy + 12), (cx - 66, cy + 12), (cx - 76, cy + 2)], fill=(6, 10, 20, 255))
sd.polygon([(cx + 70, cy - 4), (cx + 86, cy - 18), (cx + 96, cy - 14), (cx + 88, cy - 6), (cx + 80, cy)], fill=(6, 10, 20, 255))   # 竜頭(水面の上、影だけ)
for wx in (cx - 14, cx + 14):
    sd.ellipse((wx - 13, cy + 2, wx + 13, cy + 26), fill=(6, 10, 20, 255))
    for a in range(0, 180, 30):
        sd.line((wx, cy + 14, wx + 13 * math.cos(math.radians(a)), cy + 14 + 12 * math.sin(math.radians(a))), fill=(20, 40, 70, 255), width=1)
sd.rectangle((cx - 78, cy - 2, cx - 72, cy + 16), fill=(6, 10, 20, 255))   # 舵
img.alpha_composite(sh)
# 深いところから立ちのぼる青い光(ペレットが沈んでいく。光の柱が水面へ向かって広がる)
px, py = 252, 214
for r, col, a in [(300, (10, 50, 130), 210), (200, (20, 120, 220), 220), (120, (60, 200, 255), 235), (60, (170, 245, 255), 245), (22, (240, 255, 255), 255)]:
    blob(px, py, r, col, a, 0.85)
ov = Image.new('RGBA', img.size); od = ImageDraw.Draw(ov)
for k in range(22):
    x1 = px + R.uniform(-230, 230); w0 = R.uniform(2, 5); w1 = R.uniform(8, 22)
    od.polygon([(px - w0, py), (px + w0, py), (x1 + w1, SY), (x1 - w1, SY)], fill=(150, 230, 255, R.randrange(25, 55)))
img.alpha_composite(ov.filter(ImageFilter.GaussianBlur(2)))
d = ImageDraw.Draw(img)
for _ in range(90):                                                        # 立ちのぼる泡と光の粒
    a = R.uniform(-1.2, 1.2); r = R.uniform(20, 200)
    x = px + r * math.sin(a); y = py - r * math.cos(a) * 0.8
    if y > SY + 4: d.ellipse((x - 1, y - 1, x + 1, y + 1), fill=(210, 250, 255))
d.ellipse((px - 4, py - 4, px + 4, py + 4), fill=(255, 255, 255))           # ペレット
img.save(O + 'glow3_in.png')
print('ok')
