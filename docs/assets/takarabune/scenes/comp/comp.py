# 最後の絵の構図案(2026-10-03、メモ 15)。下絵の段階の見本。480×288
import math, random
from PIL import Image, ImageDraw, ImageFilter
O = '/home/user/project/docs/assets/takarabune/scenes/comp/'
R = random.Random(4)
def blob(img, cx, cy, r, col, a, sy=1.0):
    ov = Image.new('RGBA', img.size); od = ImageDraw.Draw(ov)
    od.ellipse((cx - r, cy - r * sy, cx + r, cy + r * sy), fill=col + (a,))
    img.alpha_composite(ov.filter(ImageFilter.GaussianBlur(r * 0.45)))
def boat_top(img, cx, cy, s):
    d = ImageDraw.Draw(img)
    pts = [(-1, -0.35), (0.55, -0.35), (1, 0), (0.55, 0.35), (-1, 0.35)]
    d.polygon([(cx + x * s, cy + y * s) for x, y in pts], fill=(60, 40, 26), outline=(20, 14, 8))
    d.rectangle((cx - 0.2 * s, cy - 0.5 * s, cx + 0.05 * s, cy - 0.35 * s), fill=(50, 36, 24)); d.rectangle((cx - 0.2 * s, cy + 0.35 * s, cx + 0.05 * s, cy + 0.5 * s), fill=(50, 36, 24))
    d.point((cx + 0.75 * s, cy), fill=(240, 228, 190))                # きー(点)
def waves(d, y0, y1, n, col):
    for _ in range(n):
        x = R.randrange(0, 480); y = R.randrange(y0, y1); d.line((x, y, x + R.randrange(3, 10), y), fill=col)

# 案 A: 真上から引く。月なし。黒い海いっぱいに青い光が花のように広がり、真ん中に小さな宝舟
a = Image.new('RGBA', (480, 288), (4, 10, 24, 255)); d = ImageDraw.Draw(a)
waves(d, 0, 288, 500, (14, 26, 50))
for k, (r, col, al) in enumerate([(240, (20, 70, 150), 200), (170, (30, 140, 230), 220), (110, (70, 210, 255), 230), (60, (170, 245, 255), 240), (26, (240, 255, 255), 255)]):
    blob(a, 240, 150, r, col, al, 0.8)
ov = Image.new('RGBA', a.size); od = ImageDraw.Draw(ov)
for k in range(60):                                                        # 光の触手(ゆらぐすじ)
    ang = R.uniform(0, math.tau); L = R.uniform(60, 200); pts = []
    for u in range(12):
        t = u / 11; rr = 20 + L * t
        pts.append((240 + rr * math.cos(ang + 0.4 * math.sin(t * 5 + k)), 150 + rr * 0.8 * math.sin(ang + 0.4 * math.sin(t * 5 + k))))
    od.line(pts, fill=(150, 235, 255, 70), width=2)
a.alpha_composite(ov.filter(ImageFilter.GaussianBlur(1)))
boat_top(a, 236, 150, 11)
a.save(O + 'comp_A.png')

# 案 B: 高い所から引く。水平線を上のはしに細く(月はほんの小さく、右上)。光は手前に大きく、船は光の端に小さく
b = Image.new('RGBA', (480, 288), (6, 12, 30, 255)); d = ImageDraw.Draw(b)
for y in range(0, 40): d.line((0, y, 480, y), fill=(8 + y // 5, 12 + y // 4, 34 + y // 2))
for _ in range(50): d.point((R.randrange(0, 480), R.randrange(0, 36)), fill=(200, 205, 230))
d.ellipse((420, 10, 430, 20), fill=(230, 226, 205)); d.arc((410, 13, 440, 17), 0, 360, fill=(150, 146, 130))
d.rectangle((0, 40, 480, 288), fill=(8, 18, 40)); waves(d, 42, 288, 600, (20, 36, 66))
for r, col, al in [(300, (20, 80, 170), 190), (200, (30, 150, 235), 220), (120, (80, 215, 255), 230), (55, (190, 248, 255), 245)]:
    blob(b, 250, 230, r, col, al, 0.42)
boat_top(b, 180, 190, 8)
b.save(O + 'comp_B.png')

# 案 C: 水の中から見上げる。上に水面の明るいゆらぎと、宝舟の小さな影。下の深いところから青い光が立ちのぼる(月も空もない)
c = Image.new('RGBA', (480, 288), (2, 8, 22, 255)); d = ImageDraw.Draw(c)
for y in range(0, 50): d.line((0, y, 480, y), fill=(20 + y // 3, 50 + y // 2, 90 + y // 2))
for _ in range(120):
    x = R.randrange(0, 480); y = R.randrange(4, 46); d.line((x, y, x + R.randrange(6, 20), y), fill=(120, 180, 220))
d.polygon([(200, 30), (280, 30), (300, 38), (280, 46), (200, 46), (192, 38)], fill=(10, 14, 24))      # 船底の影
for k in range(2): d.rectangle((228 + k * 0, 46, 252, 52), fill=(10, 14, 24))
for r, col, al in [(260, (10, 60, 140), 200), (170, (20, 140, 230), 220), (90, (90, 220, 255), 235), (36, (220, 255, 255), 255)]:
    blob(c, 240, 300, r, col, al, 0.9)
ov = Image.new('RGBA', c.size); od = ImageDraw.Draw(ov)
for k in range(18):                                                        # 立ちのぼる光の柱
    x0 = 240 + R.uniform(-60, 60); x1 = 240 + R.uniform(-200, 200)
    od.polygon([(x0 - 3, 288), (x0 + 3, 288), (x1 + 8, 50), (x1 - 8, 50)], fill=(150, 230, 255, 40))
c.alpha_composite(ov.filter(ImageFilter.GaussianBlur(2)))
for _ in range(70):                                                        # 泡と光の粒
    x = R.randrange(100, 380); y = R.randrange(60, 280); d2 = ImageDraw.Draw(c); d2.point((x, y), fill=(220, 250, 255))
c.save(O + 'comp_C.png')

# 3 案を並べた見本
sheet = Image.new('RGBA', (480 * 3 + 40, 288 + 40), (245, 240, 228, 255))
for i, im in enumerate([a, b, c]): sheet.paste(im, (10 + i * 490, 30))
sd = ImageDraw.Draw(sheet)
from PIL import ImageFont
f = ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf', 16)
for i, t in enumerate(['A 真上から引く(月なし。光が主題、船は真ん中に小さく)', 'B 高い所から(水平線を上に細く、月は豆粒。光は手前)', 'C 水の中から見上げる(船底の影と、立ちのぼる光)']):
    sd.text((10 + i * 490, 6), t, fill=(60, 50, 40), font=f)
sheet.save(O + 'comp_sheet.png')
print('ok')
