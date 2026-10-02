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
d.polygon([(21 * T + 10, 10 * T - 20), (21 * T + 24, 10 * T - 34), (21 * T + 30, 10 * T - 18), (21 * T + 16, 10 * T - 8)], fill=(160, 110, 60), outline=(40, 26, 16))
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
shadow(a, (0, 0, W, H), 40)
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
for n, im in [('port', a), ('reactor', e)]:
    im.resize((im.width // 2, im.height // 2), Image.LANCZOS).save(O + f'half_{n}_in.png')
print('ok')
