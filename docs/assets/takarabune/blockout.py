# 宝舟と首振りエンジン 下絵(2026-10-02)。設計図 design.png に従う。斜め上から見下ろす角度
# 今の夜。月明かり(青白)は北西から。暖かい灯りは鋳物小屋の炉と番屋の窓だけ。発電所の中は非常灯と赤い回転灯
from PIL import Image, ImageDraw, ImageFilter
import random, math, os
T = 32
O = "/home/user/project/docs/assets/takarabune/v1/"
os.makedirs(O, exist_ok=True)
R = random.Random(11)
def sh(c, k): return tuple(max(0, min(255, int(v * k))) for v in c[:3])
def noise(d, box, base, var, n, size=2):
    x0, y0, x1, y1 = [int(v) for v in box]
    for _ in range(n):
        x = R.randrange(x0, max(x0 + 1, x1)); y = R.randrange(y0, max(y0 + 1, y1))
        d.rectangle((x, y, x + size - 1, y + size - 1), fill=sh(base, 1 + R.uniform(-var, var)))
def fill(d, box, base, var=0.08, dens=30):
    d.rectangle(box, fill=base); noise(d, box, base, var, int((box[2] - box[0]) * (box[3] - box[1]) / dens))
def glow(img, cx, cy, r, col, a=120):
    ov = Image.new('RGBA', img.size, (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    for k in range(8, 0, -1):
        rr = r * k / 8; od.ellipse((cx - rr, cy - rr * 0.7, cx + rr, cy + rr * 0.7), fill=col + (int(a * (1 - k / 9) / 3),))
    img.alpha_composite(ov)
def shadow(img, box, a=90):
    ov = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(ov).rectangle(box, fill=(10, 10, 30, a)); img.alpha_composite(ov)
def roof(d, x0, y0, w, h, col, step=8):
    d.rectangle((x0, y0, x0 + w, y0 + h), fill=col, outline=sh(col, 0.6))
    d.rectangle((x0, y0, x0 + w, y0 + h // 3), fill=sh(col, 0.8))
    d.line((x0, y0 + h // 3, x0 + w, y0 + h // 3), fill=sh(col, 1.3), width=3)
    for x in range(x0 + step, x0 + w, step): d.line((x, y0 + h // 3 + 2, x, y0 + h - 1), fill=sh(col, 0.85))
    d.line((x0, y0 + h, x0 + w, y0 + h), fill=sh(col, 0.5), width=2)
def wall(d, box, col, vert=None, plank=None):
    d.rectangle(box, fill=col, outline=sh(col, 0.6)); x0, y0, x1, y1 = box
    if vert:
        for x in range(x0 + vert, x1, vert): d.line((x, y0, x, y1), fill=sh(col, 0.82))
    if plank:
        for y in range(y0 + plank, y1, plank): d.line((x0, y, x1, y), fill=sh(col, 0.82))

# ---------- A 漁港と岸壁 28×14 ----------
W, H = 28 * T, 14 * T
a = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(a)
QUAY = (88, 92, 100); SEA = (26, 38, 66); HILL = (34, 44, 40)
fill(d, (0, 0, W, 2 * T + 8), HILL, 0.2, 14)
for i in range(30):                       # 山すその松
    x = R.randrange(0, W); y = R.randrange(-8, 2 * T - 10)
    d.ellipse((x - 14, y, x + 14, y + 20), fill=sh((40, 58, 46), R.uniform(0.8, 1.2)))
fill(d, (0, 2 * T, W, 10 * T), QUAY, 0.1, 20)
# 西の坂道(入口)と東の坂道(岬へ)
fill(d, (0, 5 * T, 3 * T, 8 * T), (120, 116, 104), 0.08, 20)
fill(d, (24 * T, 2 * T, W, 6 * T + 16), (116, 112, 100), 0.08, 20)
for k in range(5): d.line((25 * T + k * 12, 2 * T, 25 * T + k * 12 + 30, 6 * T), fill=(100, 96, 86))
# 鋳物小屋 cols 2-9
roof(d, 2 * T, 2 * T - 6, 7 * T, 2 * T, (92, 94, 104))
wall(d, (2 * T, 4 * T - 6, 9 * T, 6 * T + 8), (96, 70, 54), vert=6)
d.rectangle((4 * T + 12, 4 * T + 6, 6 * T + 20, 6 * T + 8), fill=(40, 22, 16))
glow(a, 5 * T + 16, 6 * T, 80, (255, 140, 50), 200)
d.rectangle((5 * T, 5 * T + 10, 6 * T + 6, 6 * T + 4), fill=(255, 150, 60))
d.rectangle((7 * T + 16, T - 4, 8 * T + 4, 3 * T), fill=(90, 64, 54), outline=(40, 30, 26))
for k in range(6): d.point((8 * T + R.randrange(-10, 10), T - 10 - k * 6), fill=(255, 180, 80))
# 小屋の前の炉とるつぼ、鋳型
d.ellipse((3 * T, 6 * T + 18, 5 * T + 8, 8 * T), fill=(70, 60, 56), outline=(30, 26, 24))
d.ellipse((3 * T + 14, 6 * T + 26, 4 * T + 26, 7 * T + 20), fill=(255, 120, 40))
glow(a, 4 * T + 4, 7 * T + 8, 60, (255, 120, 40), 160)
for k in range(3): d.rectangle((6 * T + k * 22, 7 * T, 6 * T + k * 22 + 18, 7 * T + 14), fill=(150, 120, 90), outline=(60, 50, 40))
# 網小屋 cols 11-16
roof(d, 11 * T, 2 * T - 4, 5 * T, int(1.4 * T), (80, 84, 90))
wall(d, (11 * T, 3 * T + 10, 16 * T, 5 * T + 8), (104, 96, 82), vert=7)
for k in range(5): d.arc((11 * T + k * T, 3 * T + 16, 12 * T + k * T, 4 * T + 16), 0, 180, fill=(60, 54, 46), width=2)
for k in range(4): d.ellipse((11 * T + 14 + k * 36, 4 * T + 18, 11 * T + 24 + k * 36, 4 * T + 28), fill=(170, 160, 120))
d.rectangle((13 * T + 6, 4 * T, 14 * T, 5 * T + 8), fill=(60, 48, 38))
# 番屋 cols 18-23
roof(d, 18 * T, 2 * T - 4, 5 * T, int(1.4 * T), (80, 84, 90))
wall(d, (18 * T, 3 * T + 10, 23 * T, 5 * T + 8), (110, 100, 84), vert=7)
d.rectangle((18 * T + 18, 4 * T, 19 * T + 16, 5 * T + 8), fill=(60, 48, 38))
d.rectangle((20 * T + 18, 4 * T, 22 * T + 4, 4 * T + 22), fill=(250, 214, 120), outline=(60, 48, 38), width=2)
glow(a, 21 * T + 10, 5 * T + 10, 60, (250, 210, 120), 140)
# 岸壁の小物: 魚箱、係船柱、ドラム缶、網
for (c, rr) in [(10, 7), (10.6, 7.2), (17, 8), (22, 7.5)]:
    d.rectangle((c * T, rr * T, c * T + 26, rr * T + 18), fill=(70, 110, 140), outline=(30, 40, 50))
for c in (4, 9, 15, 21, 26): d.ellipse((c * T, 9 * T + 14, c * T + 14, 9 * T + 28), fill=(50, 50, 56), outline=(20, 20, 24))
d.rectangle((24 * T, 7 * T, 24 * T + 18, 8 * T), fill=(120, 60, 50), outline=(40, 20, 20))
# 岸壁の縁と海
fill(d, (0, 10 * T, W, 10 * T + 18), (150, 148, 140), 0.06, 20)
fill(d, (0, 10 * T + 18, W, H), SEA, 0.12, 12)
for k in range(40):
    x = R.randrange(0, W); y = R.randrange(11 * T, H)
    d.line((x, y, x + R.randrange(8, 24), y), fill=(70, 90, 130))
for k in range(14):                       # 月の映りこみ
    y = 11 * T + k * 8; w = 40 - k * 2
    d.line((4 * T - w, y, 4 * T + w, y), fill=(190, 200, 220), width=2)
# 宝舟 cols 9-20 rows 10.4-13.4(舳先は東)
hull = [(9 * T, 11 * T + 8), (19 * T, 11 * T), (21 * T + 10, 10 * T - 20), (20 * T + 10, 12 * T + 8), (19 * T, 13 * T + 16), (9 * T + 10, 13 * T + 16), (8 * T + 20, 12 * T + 12)]
d.polygon(hull, fill=(130, 84, 48), outline=(40, 26, 16))
d.polygon([(9 * T + 10, 11 * T + 14), (19 * T, 11 * T + 6), (20 * T + 4, 12 * T + 4), (19 * T, 12 * T + 26), (9 * T + 14, 12 * T + 26)], fill=(170, 124, 78))
for k in range(1, 6): d.line((9 * T + 14, 11 * T + 10 + k * 7, 19 * T + 6, 11 * T + 4 + k * 7), fill=(140, 100, 62))
for (x, y, w, h, c) in [(11 * T, 13 * T, 40, 12, (110, 100, 80)), (15 * T, 13 * T + 2, 30, 12, (150, 90, 60)), (17 * T, 12 * T + 30, 24, 14, (100, 90, 74))]:
    d.rectangle((x, y, x + w, y + h), fill=c, outline=(40, 26, 16))
# 竜頭(板の切り抜き): 大きく、はっきりした横顔
DR = [(21 * T + 4, 10 * T - 14), (21 * T + 10, 9 * T - 10), (21 * T + 30, 9 * T - 26), (22 * T + 18, 9 * T - 22), (22 * T + 26, 9 * T - 8),
      (22 * T + 10, 9 * T - 4), (22 * T + 20, 9 * T + 6), (22 * T + 2, 9 * T + 10), (21 * T + 22, 9 * T + 4), (21 * T + 20, 10 * T + 2)]
d.polygon(DR, fill=(176, 120, 64), outline=(30, 20, 12))
d.polygon([(21 * T + 26, 9 * T - 26), (21 * T + 20, 8 * T - 4), (21 * T + 36, 9 * T - 22)], fill=(150, 100, 54), outline=(30, 20, 12))
d.polygon([(21 * T + 12, 9 * T - 14), (21 * T, 8 * T + 8), (21 * T + 20, 9 * T - 20)], fill=(150, 100, 54), outline=(30, 20, 12))
d.ellipse((22 * T + 2, 9 * T - 20, 22 * T + 10, 9 * T - 12), fill=(250, 220, 120), outline=(30, 20, 12))
d.line((22 * T + 10, 9 * T + 2, 22 * T + 22, 9 * T + 4), fill=(30, 20, 12), width=2)
d.ellipse((13 * T, 13 * T + 2, 15 * T + 6, 14 * T + 10), fill=(90, 66, 44), outline=(30, 20, 14))
for ang in range(0, 180, 30):
    cx, cy = 14 * T + 3, 13 * T + 24
    d.line((cx, cy, cx + 34 * math.cos(math.radians(ang + 180)), cy + 18 * math.sin(math.radians(ang + 180))), fill=(30, 20, 14), width=2)
d.rectangle((9 * T + 20, 11 * T + 22, 10 * T + 26, 12 * T + 22), fill=(150, 110, 60), outline=(40, 26, 16))
d.rectangle((10 * T, 10 * T + 6, 10 * T + 12, 11 * T + 24), fill=(60, 60, 64))
d.rectangle((15 * T - 3, 8 * T, 15 * T + 3, 12 * T + 10), fill=(110, 80, 50))
d.polygon([(13 * T, 8 * T + 10), (17 * T, 8 * T + 4), (17 * T - 6, 11 * T), (13 * T + 6, 11 * T + 6)], fill=(214, 204, 178), outline=(90, 80, 66))
for (x, y, w, h, c) in [(13 * T + 10, 8 * T + 20, 30, 26, (190, 170, 140)), (15 * T + 20, 9 * T + 26, 34, 30, (176, 190, 200)), (13 * T + 20, 10 * T + 10, 26, 20, (200, 160, 140))]:
    d.rectangle((x, y, x + w, y + h), fill=c, outline=(150, 140, 120))
shadow(a, (0, 0, W, H), 70)
a.save(O + 'port.png')

# ---------- E 原子炉建屋 20×16 ----------
W, H = 20 * T, 16 * T
e = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(e)
FLOOR = (84, 112, 96); WALLC = (150, 150, 144)
fill(d, (0, 0, W, H), FLOOR, 0.08, 18)
for x in range(0, W, 2 * T): d.line((x, 0, x, H), fill=sh(FLOOR, 0.9))
for y in range(0, H, 2 * T): d.line((0, y, W, y), fill=sh(FLOOR, 0.9))
wall(d, (0, 0, W, int(1.6 * T)), WALLC, plank=12)
for k in range(3): d.line((0, 10 + k * 10, W, 10 + k * 10), fill=(120, 110, 90), width=5)
wall(d, (0, 0, 16, H), WALLC); wall(d, (W - 16, 0, W, H), WALLC)
# 北の二重扉
d.rectangle((8 * T, 0, 12 * T, int(2.2 * T)), fill=(120, 110, 96), outline=(40, 36, 30), width=2)
d.rectangle((9 * T, 10, 11 * T, int(2.2 * T)), fill=(80, 84, 88), outline=(30, 30, 30), width=2)
d.ellipse((10 * T - 10, T - 2, 10 * T + 10, T + 18), fill=(150, 150, 150), outline=(40, 40, 40), width=2)
for k in range(0, 4 * T, 12): d.line((8 * T + k, int(2.2 * T), 8 * T + k + 6, int(2.2 * T) + 8), fill=(240, 200, 30), width=4)
# 格納容器(円)
cx, cy, rr = 10 * T, 8 * T + 8, 5 * T
d.ellipse((cx - rr, cy - rr * 0.82 + 20, cx + rr, cy + rr * 0.82 + 20), fill=(70, 66, 64))
d.ellipse((cx - rr, cy - rr * 0.82, cx + rr, cy + rr * 0.82), fill=(140, 120, 112), outline=(50, 44, 40), width=3)
d.ellipse((cx - rr + 26, cy - rr * 0.82 + 22, cx + rr - 26, cy + rr * 0.82 - 22), fill=(120, 104, 98), outline=(80, 70, 66), width=2)
for k in range(0, 360, 30):
    x1 = cx + (rr - 10) * math.cos(math.radians(k)); y1 = cy + (rr - 10) * 0.82 * math.sin(math.radians(k))
    d.ellipse((x1 - 3, y1 - 3, x1 + 3, y1 + 3), fill=(70, 60, 56))
d.ellipse((cx - 22, cy - 18, cx + 22, cy + 18), fill=(240, 200, 30), outline=(40, 30, 10), width=2)
for ang in (90, 210, 330): d.pieslice((cx - 18, cy - 15, cx + 18, cy + 15), ang - 30, ang + 30, fill=(30, 26, 20))
d.ellipse((cx - 5, cy - 4, cx + 5, cy + 4), fill=(30, 26, 20))
# 西の入口
d.rectangle((0, 12 * T, 16, 15 * T), fill=(70, 70, 76), outline=(240, 200, 30), width=2)
# 配管
for y in (3 * T, 3 * T + 12): d.line((16, y, 4 * T, y), fill=(170, 170, 160), width=6)
for y in (3 * T, 3 * T + 12): d.line((16 * T, y, W - 16, y), fill=(170, 170, 160), width=6)
d.line((W - 30, 5 * T, W - 30, 14 * T), fill=(200, 120, 60), width=8)
# 警告の札(字は後でゲームの字体)
for (c, rr2) in [(4, 1), (14, 1), (3, 14), (16, 14)]:
    d.rectangle((c * T, rr2 * T + 4, c * T + 40, rr2 * T + 26), fill=(240, 210, 40), outline=(40, 30, 10), width=2)
    d.rectangle((c * T + 2, rr2 * T + 6, c * T + 38, rr2 * T + 12), fill=(200, 40, 30))
# 床の縞
for (x0, y0, x1, y1) in [(2 * T, 15 * T, 18 * T, 15 * T + 12), (2 * T, 2 * T + 20, 7 * T, 2 * T + 30), (13 * T, 2 * T + 20, 18 * T, 2 * T + 30)]:
    d.rectangle((x0, y0, x1, y1), fill=(240, 200, 30))
    for k in range(x0, x1, 14): d.line((k, y0, k + 8, y1), fill=(30, 26, 20), width=4)
# 回転灯と赤い光
shadow(e, (0, 0, W, H), 110)
for (c, rr2) in [(2, 3), (17, 3), (2, 10), (17, 10)]:
    x, y = c * T + 16, rr2 * T + 16
    glow(e, x, y, 110, (255, 40, 30), 220)
    ImageDraw.Draw(e).ellipse((x - 9, y - 9, x + 9, y + 9), fill=(255, 70, 50), outline=(60, 10, 10), width=2)
glow(e, 10 * T, int(1.6 * T), 70, (120, 255, 150), 120)
e.save(O + 'reactor.png')

# 警告の札(黄色の板)。字は PixelLab のあとでゲームの字体で入れる(signs.json)
SIGNS = []
def plate(d, mp, x, y, text):
    w = len(text) * 15 + 14 - (7 if '\u3000' in text or ' ' in text else 0); h = 24
    d.rectangle((x, y, x + w, y + h), fill=(236, 200, 40), outline=(30, 24, 10), width=2)
    d.rectangle((x + 3, y + 3, x + w - 3, y + 6), fill=(190, 40, 30))
    SIGNS.append(dict(map=mp, x=x, y=y, w=w, h=h, text=text))

def stripes(d, box):
    x0, y0, x1, y1 = box
    d.rectangle(box, fill=(236, 196, 30))
    for k in range(x0 - (y1 - y0), x1, 14): d.line((k, y1, k + (y1 - y0), y0), fill=(30, 26, 20), width=5)
    d.rectangle(box, outline=(30, 26, 20))

def red_lamp(img, x, y, r=110):
    glow(img, x, y, r, (255, 40, 30), 220)
    dd = ImageDraw.Draw(img); dd.ellipse((x - 9, y - 9, x + 9, y + 9), fill=(255, 70, 50), outline=(60, 10, 10), width=2)

# 札をいれ直す: 原子炉建屋の 4 枚は、字が入る幅にする
SIGNS_E = [(3 * T, T + 2), (12 * T, T + 2), (2 * T, 14 * T + 2), (12 * T, 14 * T + 2)]

# ---------- B 正門 28×10 ----------
W, H = 28 * T, 10 * T
b = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(b)
fill(d, (0, 0, W, H), (78, 84, 80), 0.12, 16)                     # 荒れた舗装
for k in range(60):
    x = R.randrange(0, W); y = R.randrange(2 * T, H - T)
    d.ellipse((x, y, x + R.randrange(6, 16), y + R.randrange(4, 8)), fill=(64, 84, 56))  # 割れ目の草
# 奥(北): 構内の建物の壁と配管
wall(d, (0, 0, 11 * T, 2 * T), (120, 124, 122), plank=10); wall(d, (15 * T, 0, W, 2 * T), (120, 124, 122), plank=10)
for y in (14, 26): d.line((0, y, 11 * T, y), fill=(150, 150, 140), width=5); d.line((15 * T, y, W, y), fill=(150, 150, 140), width=5)
fill(d, (11 * T, 0, 15 * T, 3 * T), (96, 100, 96), 0.08, 20)           # 門の先の道
# フェンス(有刺鉄線)
for x0, x1 in [(0, 11 * T), (15 * T, W)]:
    d.rectangle((x0, 3 * T, x1, 3 * T + 26), fill=(60, 66, 64))
    for x in range(x0, x1, 10): d.line((x, 3 * T, x + 10, 3 * T + 26), fill=(140, 150, 150)); d.line((x + 10, 3 * T, x, 3 * T + 26), fill=(140, 150, 150))
    for x in range(x0, x1, 2 * T): d.rectangle((x, 3 * T - 10, x + 5, 3 * T + 30), fill=(90, 90, 90))
    for x in range(x0, x1, 6): d.point((x, 3 * T - 6 + (x // 6) % 3), fill=(170, 170, 170))
# 門柱と、片方が開いた錆びた門扉、垂れた鎖
d.rectangle((11 * T - 10, 2 * T + 10, 11 * T + 4, 4 * T), fill=(130, 120, 110), outline=(40, 36, 30))
d.rectangle((15 * T - 4, 2 * T + 10, 15 * T + 10, 4 * T), fill=(130, 120, 110), outline=(40, 36, 30))
d.polygon([(11 * T + 4, 3 * T), (11 * T + 4, 3 * T + 26), (12 * T, 4 * T + 26), (12 * T, 4 * T)], fill=(150, 80, 50), outline=(60, 30, 20))
for k in range(4): d.line((11 * T + 8 + k * 6, 3 * T + 4 + k * 6, 11 * T + 8 + k * 6, 3 * T + 26 + k * 6), fill=(110, 56, 36), width=2)
d.rectangle((14 * T + 4, 3 * T, 15 * T - 4, 3 * T + 26), fill=(150, 80, 50), outline=(60, 30, 20))
for k in range(8): d.ellipse((14 * T + k * 3, 3 * T + 12 + k * 4, 14 * T + 6 + k * 3, 3 * T + 18 + k * 4), outline=(160, 160, 160))
# 守衛所
roof(d, 17 * T - 6, 4 * T, 3 * T + 12, 22, (90, 92, 96))
wall(d, (17 * T, 4 * T + 22, 20 * T, 6 * T + 20), (150, 146, 136), plank=10)
d.rectangle((17 * T + 10, 5 * T, 18 * T + 26, 5 * T + 22), fill=(40, 48, 56), outline=(30, 30, 30), width=2)
for k in range(5): d.line((17 * T + 14 + k * 9, 5 * T + 2, 17 * T + 20 + k * 7, 5 * T + 20), fill=(150, 170, 180))
d.rectangle((19 * T + 4, 5 * T, 19 * T + 26, 6 * T + 20), fill=(70, 60, 50))
# 坂道(西)と、南の崖(海が見える)
fill(d, (0, 6 * T, 3 * T, 9 * T), (104, 100, 92), 0.08, 20)
fill(d, (0, 9 * T, W, H), (40, 52, 76), 0.1, 14)
d.line((0, 9 * T, W, 9 * T), fill=(60, 66, 64), width=4)
plate(d, 'gate', 6 * T, 3 * T + 30, '関係者以外立入禁止')
shadow(b, (0, 0, W, H), 80)
b.save(O + 'gate.png')

# ---------- C 管理棟 24×12 ----------
W, H = 24 * T, 12 * T
c = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(c)
fill(d, (0, 0, W, H), (120, 122, 112), 0.07, 22)                    # リノリウムの床
for x in range(0, W, T): d.line((x, 0, x, H), fill=(112, 114, 104))
for y in range(0, H, T): d.line((0, y, W, y), fill=(112, 114, 104))
wall(d, (0, 0, W, 2 * T), (150, 150, 140), plank=16)
wall(d, (0, 0, 14, H), (150, 150, 140)); wall(d, (W - 14, 0, W, H), (150, 150, 140)); wall(d, (0, 11 * T, W, H), (150, 150, 140))
# 中央制御室の計器盤(壁ぞい、止まった針と消えたランプ)
d.rectangle((2 * T, 2 * T - 10, 14 * T, 4 * T), fill=(90, 120, 110), outline=(30, 40, 36), width=2)
for k in range(24):
    x = 2 * T + 8 + k * 16
    d.ellipse((x, 2 * T, x + 12, 2 * T + 12), fill=(220, 220, 200), outline=(30, 30, 30)); d.line((x + 6, 2 * T + 6, x + 2, 2 * T + 3), fill=(180, 30, 30))
    d.rectangle((x + 2, 3 * T, x + 10, 3 * T + 6), fill=(60, 70, 60))
d.rectangle((4 * T, 4 * T + 6, 12 * T, 5 * T), fill=(110, 120, 116), outline=(30, 40, 36))   # 操作卓
for k in range(10): d.rectangle((4 * T + 10 + k * 24, 4 * T + 12, 4 * T + 20 + k * 24, 4 * T + 20), fill=(70, 80, 76))
# 事務室: 散らかった机、倒れた椅子、書類
for (x, y) in [(16 * T, 3 * T), (19 * T, 3 * T)]:
    d.rectangle((x, y, x + 2 * T + 10, y + T + 10), fill=(140, 130, 110), outline=(50, 44, 36))
    for k in range(6):
        px, py = x + R.randrange(0, 70), y + R.randrange(0, 34); d.rectangle((px, py, px + 12, py + 9), fill=(230, 226, 210))
for k in range(30):
    x = R.randrange(15 * T, 22 * T); y = R.randrange(5 * T, 7 * T); d.rectangle((x, y, x + 10, y + 7), fill=(220, 216, 200))
d.ellipse((17 * T, 5 * T, 17 * T + 22, 5 * T + 14), fill=(60, 60, 64))
# 廊下と、非常灯(緑)、床の矢印
d.rectangle((14, 8 * T, W - 14, 10 * T), fill=(132, 134, 124))
for x in range(3 * T, 22 * T, 3 * T): d.polygon([(x, 9 * T - 6), (x + 14, 9 * T), (x, 9 * T + 6)], fill=(230, 200, 40))
d.rectangle((4 * T, 11 * T, 6 * T, H), fill=(80, 90, 96), outline=(40, 40, 40))     # 南の玄関
d.rectangle((W - 14, 8 * T, W, 10 * T), fill=(80, 90, 96), outline=(40, 40, 40))     # 東の扉
plate(d, 'admin', 16 * T, 7 * T + 2, 'この先 管理区域')
shadow(c, (0, 0, W, H), 120)
for x, y in [(W - 30, 7 * T + 6), (5 * T, 11 * T - 10), (9 * T, T + 6)]:
    glow(c, x, y, 70, (90, 255, 140), 160); ImageDraw.Draw(c).rectangle((x - 10, y - 4, x + 10, y + 4), fill=(140, 255, 170))
c.save(O + 'admin.png')

# ---------- D タービン建屋 28×12 ----------
W, H = 28 * T, 12 * T
t2 = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(t2)
fill(d, (0, 0, W, H), (110, 116, 112), 0.08, 20)
for x in range(0, W, 2 * T): d.line((x, 0, x, H), fill=(100, 106, 102))
for (y0, y1) in [(0, 2 * T), (10 * T, H)]:
    d.rectangle((0, y0, W, y1), fill=(84, 90, 92))
    for k in range(5): d.line((0, y0 + 6 + k * 12, W, y0 + 6 + k * 12), fill=sh((150, 150, 140), 0.8 + 0.1 * (k % 3)), width=7)
    for x in range(T, W, 3 * T): d.rectangle((x, y0 + 2, x + 10, y1 - 2), fill=(70, 70, 74))
stripes(d, (0, 2 * T - 6, W, 2 * T)); stripes(d, (0, 10 * T, W, 10 * T + 6))
# タービンと発電機(長い胴、継ぎ目、ボルト)
d.rounded_rectangle((3 * T, 4 * T, 25 * T, 8 * T), radius=40, fill=(70, 96, 110), outline=(26, 34, 40), width=3)
d.rounded_rectangle((3 * T + 8, 4 * T + 8, 25 * T - 8, 5 * T + 4), radius=20, fill=(100, 130, 146))
for x in range(5 * T, 25 * T, 3 * T):
    d.line((x, 4 * T + 4, x, 8 * T - 4), fill=(30, 40, 46), width=3)
    for yy in range(4 * T + 10, 8 * T - 6, 12): d.point((x + 4, yy), fill=(160, 170, 176))
d.rounded_rectangle((19 * T, 4 * T - 6, 24 * T, 8 * T + 6), radius=24, fill=(140, 60, 50), outline=(40, 20, 16), width=3)  # 発電機
for k in range(3): d.ellipse((7 * T + k * 4 * T, 3 * T + 18, 7 * T + k * 4 * T + 18, 4 * T + 4), fill=(200, 200, 190), outline=(40, 40, 40))
# 床の水たまり(雨もり)と放射能マーク
for (x, y) in [(10 * T, 9 * T), (21 * T, 3 * T), (4 * T, 2 * T + 20)]:
    d.ellipse((x, y, x + 50, y + 16), fill=(70, 80, 90))
for x in (2 * T, 26 * T):
    d.ellipse((x - 14, 6 * T - 14, x + 14, 6 * T + 14), fill=(236, 196, 30), outline=(30, 26, 20), width=2)
    for ang in (90, 210, 330): d.pieslice((x - 12, 6 * T - 12, x + 12, 6 * T + 12), ang - 30, ang + 30, fill=(30, 26, 20))
d.rectangle((0, 8 * T, 10, 10 * T), fill=(70, 70, 76)); d.rectangle((W - 10, 2 * T, W, 4 * T), fill=(70, 70, 76))
for (x, y) in [(4 * T, 8 * T + 4), (13 * T, 8 * T + 4), (22 * T, 2 * T + 4)]: plate(d, 'turbine', x, y, '放射線管理区域')
shadow(t2, (0, 0, W, H), 120)
for x in (6 * T, 16 * T):
    glow(t2, x, 2 * T + 6, 60, (255, 120, 40), 160); ImageDraw.Draw(t2).ellipse((x - 6, 2 * T, x + 6, 2 * T + 10), fill=(255, 150, 60))
t2.save(O + 'turbine.png')

# ---------- F 格納容器の中(炉心)16×14 ----------
W, H = 16 * T, 14 * T
f = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(f)
fill(d, (0, 0, W, H), (92, 96, 104), 0.08, 18)                     # 鋼の床(格子)
for x in range(0, W, 12): d.line((x, 0, x, H), fill=(80, 84, 92))
for y in range(0, H, 12): d.line((0, y, W, y), fill=(80, 84, 92))
wall(d, (0, 0, W, 2 * T), (110, 106, 112), plank=12)
for k in range(10):                                                   # 振り切れた計器
    x = 12 + k * 48; d.ellipse((x, 14, x + 26, 40), fill=(220, 220, 200), outline=(30, 30, 30), width=2)
    d.line((x + 13, 27, x + 24, 18), fill=(220, 30, 30), width=2)
# 炉: ふたの開いた円い穴。水の底で燃料が青白く光る
cx, cy = 8 * T, 6 * T
d.ellipse((cx - 5 * T, cy - 4 * T + 10, cx + 5 * T, cy + 4 * T + 10), fill=(60, 60, 66))
d.ellipse((cx - 5 * T, cy - 4 * T, cx + 5 * T, cy + 4 * T), fill=(130, 130, 136), outline=(40, 40, 46), width=3)
d.ellipse((cx - 4 * T, cy - 3 * T, cx + 4 * T, cy + 3 * T), fill=(30, 90, 150))
d.ellipse((cx - 3 * T, cy - 2 * T - 6, cx + 3 * T, cy + 2 * T + 6), fill=(60, 150, 220))
for gx in range(-5, 6):                                               # 燃料集合体の格子
    for gy in range(-3, 4):
        if (gx * 0.8) ** 2 + (gy * 1.3) ** 2 < 14:
            d.rectangle((cx + gx * 14 - 5, cy + gy * 12 - 4, cx + gx * 14 + 5, cy + gy * 12 + 4), fill=(170, 230, 255))
for k in range(16):
    ang = k / 16 * math.tau; d.ellipse((cx + 4.5 * T * math.cos(ang) - 4, cy + 3.5 * T * math.sin(ang) - 4, cx + 4.5 * T * math.cos(ang) + 4, cy + 3.5 * T * math.sin(ang) + 4), fill=(60, 60, 66))
d.rectangle((7 * T, 13 * T, 9 * T, H), fill=(80, 84, 92), outline=(240, 200, 30), width=2)
f.alpha_composite(Image.new('RGBA', f.size, (0, 0, 20, 120)))
glow(f, cx, cy, 8 * T, (120, 210, 255), 255); glow(f, cx, cy, 4 * T, (200, 240, 255), 200)
f.save(O + 'core.png')

# ---------- G 宝舟の甲板 20×10(船だけ。海は別の絵で流す)----------
W, H = 20 * T, 10 * T
g = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(g)
HULL = [(int(1.2 * T), int(2.4 * T)), (15 * T, int(2.4 * T)), (int(18.8 * T), 5 * T), (15 * T, int(7.6 * T)), (int(1.2 * T), int(7.6 * T)), (int(0.6 * T), 5 * T)]
d.polygon([(x, y + 14) for x, y in HULL], fill=(60, 40, 26))
d.polygon(HULL, fill=(120, 80, 46), outline=(30, 20, 12))
inner = [(int(1.6 * T), int(2.8 * T)), (15 * T - 6, int(2.8 * T)), (int(18.2 * T), 5 * T), (15 * T - 6, int(7.2 * T)), (int(1.6 * T), int(7.2 * T)), (int(1.1 * T), 5 * T)]
d.polygon(inner, fill=(168, 122, 76))
pl = Image.new('RGBA', g.size); pd = ImageDraw.Draw(pl)
for y in range(int(2.8 * T) + 8, int(7.2 * T), 9): pd.line((int(1.4 * T), y, 18 * T, y), fill=(146, 104, 62))
mk = Image.new('L', g.size, 0); ImageDraw.Draw(mk).polygon(inner, fill=255)
g.paste(pl, (0, 0), Image.composite(pl, Image.new('RGBA', g.size), mk).getchannel('A'))
for (x, y, w, h, col) in [(3 * T, 3 * T, 40, 20, (130, 110, 80)), (11 * T, 6 * T, 50, 18, (176, 140, 90)), (13 * T, 3 * T + 8, 30, 22, (150, 96, 64))]:
    d.rectangle((x, y, x + w, y + h), fill=col, outline=(90, 66, 40))
# 竜頭(舳先)
d.polygon([(int(18.6 * T), 5 * T - 8), (19 * T + 20, 4 * T), (20 * T - 4, 4 * T + 18), (19 * T + 14, 5 * T + 6), (int(18.6 * T), 5 * T + 8)], fill=(176, 120, 64), outline=(30, 20, 12))
d.ellipse((19 * T + 16, 4 * T + 8, 19 * T + 22, 4 * T + 14), fill=(250, 220, 120))
# 外輪の箱(両舷)
for y in (int(1.6 * T), int(7.4 * T)):
    d.rectangle((6 * T, y, 9 * T, y + T - 4), fill=(96, 70, 46), outline=(30, 20, 12), width=2)
    for k in range(6): d.line((6 * T + 6 + k * 16, y + 4, 6 * T + 6 + k * 16, y + T - 8), fill=(60, 44, 30), width=3)
# ボイラー(艫)と、機関の台(首振りエンジンは別の絵で動かす)
d.ellipse((2 * T, 4 * T - 6, 4 * T + 8, 6 * T + 6), fill=(150, 100, 50), outline=(40, 26, 12), width=2)
d.ellipse((2 * T + 12, 4 * T + 6, 4 * T - 4, 6 * T - 6), fill=(176, 120, 60))
d.ellipse((3 * T - 4, 5 * T - 14, 3 * T + 22, 5 * T + 10), fill=(50, 50, 54), outline=(20, 20, 20), width=2)  # 煙突の口
d.rectangle((5 * T + 16, 4 * T, 9 * T, 6 * T), fill=(110, 100, 90), outline=(40, 34, 30), width=2)
d.line((5 * T + 16, 5 * T, 9 * T, 5 * T), fill=(80, 70, 60), width=4)
# 帆柱と帆(上から見ると、たたまれた横木)
d.ellipse((10 * T + 6, 5 * T - 10, 10 * T + 26, 5 * T + 10), fill=(110, 80, 50), outline=(30, 20, 12), width=2)
d.rectangle((10 * T + 12, 3 * T, 10 * T + 20, 7 * T), fill=(214, 204, 178), outline=(110, 100, 80))
# 舵(艫)
d.rectangle((int(0.9 * T), 5 * T - 6, 2 * T - 4, 5 * T + 6), fill=(110, 80, 50), outline=(30, 20, 12))
d.ellipse((T + 4, 4 * T + 10, T + 30, 5 * T + 16), outline=(110, 80, 50), width=4)
g.save(O + 'deck.png')

# 流れる夜の海(横につながる 640×320)
SW, SH = 20 * T, 10 * T
s_ = Image.new('RGBA', (SW, SH)); d = ImageDraw.Draw(s_)
fill(d, (0, 0, SW, SH), (24, 36, 64), 0.12, 10)
for k in range(140):
    x = R.randrange(0, SW); y = R.randrange(0, SH); w = R.randrange(8, 30)
    col = (60, 84, 126) if R.random() < 0.8 else (150, 170, 210)
    d.line((x, y, x + w, y), fill=col); d.line((x - SW, y, x - SW + w, y), fill=col)
s_.save(O + 'sea.png')

# 原子炉建屋の札を、字の入る幅で入れ直す
d = ImageDraw.Draw(e)
for x, y in SIGNS_E: plate(d, 'reactor', x, y, '高線量区域 立入禁止')
e.save(O + 'reactor.png')

import json
json.dump(SIGNS, open(O + 'signs.json', 'w'), ensure_ascii=False, indent=0)
ims = dict(port=a, gate=b, admin=c, turbine=t2, reactor=e, core=f, deck=g, sea=s_)
for n, im in ims.items():
    im.resize((im.width // 2, im.height // 2), Image.LANCZOS).save(O + f'half_{n}_in.png')
print('ok')
