# 荒川の鈴木商店 下絵(2026-10-02)。設計図 design.png に従う。斜め上から見下ろす角度
# 今。雨上がりの夕方。夕日は西(左)から差し、影は東(右)へのびる。濡れた地面に空の橙が映る
from PIL import Image, ImageDraw
import random, math, os
T = 32
O = '/home/user/project/docs/assets/suzuki/v1/'
os.makedirs(O, exist_ok=True)
R = random.Random(7)

def shade(c, k): return tuple(max(0, min(255, int(v * k))) for v in c[:3])
ASPH = (92, 90, 98); ASPH_WET = (74, 72, 84); SKYREF = (232, 150, 96); SKYREF2 = (200, 120, 110)
TOTAN = (150, 158, 164); RUST = (150, 86, 56); WOOD = (150, 112, 78); WOOD_DK = (100, 72, 50)
KAWARA = (78, 80, 92); MORTAR = (196, 186, 168); GLASS = (120, 150, 166); WIN_LIT = (236, 196, 120)
GRASS = (104, 132, 74); GRASS2 = (84, 112, 62); INK = (40, 34, 30)

def noise(d, box, base, var, n, size=2):
    x0, y0, x1, y1 = [int(v) for v in box]
    for _ in range(n):
        x = R.randrange(x0, max(x0 + 1, x1)); y = R.randrange(y0, max(y0 + 1, y1))
        d.rectangle((x, y, x + size - 1, y + size - 1), fill=shade(base, 1 + R.uniform(-var, var)))

def ground(d, box, base=ASPH):
    d.rectangle(box, fill=base)
    noise(d, box, base, 0.08, int((box[2] - box[0]) * (box[3] - box[1]) / 30))

def puddle(d, cx, cy, rw, rh):
    d.ellipse((cx - rw, cy - rh, cx + rw, cy + rh), fill=SKYREF2)
    d.ellipse((cx - rw + 4, cy - rh + 3, cx + rw - 6, cy + rh - 3), fill=SKYREF)
    d.line((cx - rw + 8, cy - 1, cx + rw - 14, cy - 1), fill=(250, 210, 150), width=2)

def shadow(img, box, a=90):
    ov = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(ov).rectangle(box, fill=(30, 20, 50, a))
    img.alpha_composite(ov)

def gable_roof(d, x0, y0, w, h, col, ridge=True, lines=None):
    # 斜め上から見た切妻屋根(手前の斜面が見える)
    d.rectangle((x0, y0, x0 + w, y0 + h), fill=col, outline=shade(col, 0.6))
    d.line((x0, y0 + h // 3, x0 + w, y0 + h // 3), fill=shade(col, 1.25), width=3)
    step = lines or 8
    for x in range(x0 + step, x0 + w, step): d.line((x, y0 + h // 3 + 2, x, y0 + h - 1), fill=shade(col, 0.85))
    d.rectangle((x0, y0, x0 + w, y0 + h // 3), fill=shade(col, 0.8))
    d.line((x0, y0 + h, x0 + w, y0 + h), fill=shade(col, 0.5), width=2)

def wall(d, box, col, plank=None, vert=None):
    d.rectangle(box, fill=col, outline=shade(col, 0.6))
    x0, y0, x1, y1 = box
    if plank:
        for y in range(y0 + plank, y1, plank): d.line((x0, y, x1, y), fill=shade(col, 0.85))
    if vert:
        for x in range(x0 + vert, x1, vert): d.line((x, y0, x, y1), fill=shade(col, 0.85))

def window(d, x, y, w, h, lit=False):
    d.rectangle((x, y, x + w, y + h), fill=WIN_LIT if lit else GLASS, outline=WOOD_DK, width=2)
    d.line((x + w // 2, y, x + w // 2, y + h), fill=WOOD_DK)

def door(d, x, y, w, h, col=WOOD_DK):
    d.rectangle((x, y, x + w, y + h), fill=col, outline=INK)

def pot(d, x, y):
    d.rectangle((x, y, x + 8, y + 8), fill=(170, 96, 64), outline=INK); d.ellipse((x - 3, y - 9, x + 11, y + 2), fill=(70, 130, 64))

def bicycle(d, x, y):
    for cx in (x, x + 22): d.ellipse((cx - 8, y - 8, cx + 8, y + 8), outline=(140, 80, 50), width=2)
    d.line((x, y, x + 10, y - 10, x + 22, y), fill=(150, 90, 56), width=2); d.line((x + 10, y - 10, x + 18, y - 12), fill=(150, 90, 56), width=2)

# ---------- B 町工場と長屋の路地 28×16 ----------
W, H = 28 * T, 16 * T
b = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(b)
ground(d, (0, 0, W, H), ASPH_WET)
# 北の端: 土手の裾(草)と、路地の先の階段(D へ)
d.rectangle((0, 0, W, T), fill=GRASS); noise(d, (0, 0, W, T), GRASS, 0.12, 900)
d.rectangle((12 * T, 0, 15 * T, T + 8), fill=(170, 164, 150))
for y in range(2, T + 8, 6): d.line((12 * T, y, 15 * T, y), fill=(130, 124, 112), width=2)
# 南北の路地(3 マス)、東西の小道(2 マス)、南の裏道(2 マス)
ground(d, (12 * T, T + 8, 15 * T, H), ASPH)
ground(d, (0, 7 * T, W, 9 * T), ASPH)
ground(d, (0, 14 * T, W, H), ASPH)
d.rectangle((13 * T + 14, 15 * T, 13 * T + 18, H), fill=(110, 108, 112))
for (cx, cy, rw, rh) in [(13.5 * T, 3 * T, 22, 8), (5 * T, 8 * T, 30, 9), (20 * T, 7.6 * T, 24, 7), (13 * T, 11.5 * T, 18, 7), (24 * T, 15 * T, 26, 8)]:
    puddle(d, int(cx), int(cy), rw, rh)

def building(x0c, y0r, wc, hr, roof_rows, roof_col, wall_col, plank=None, vert=None, lines=None):
    x0, y0, x1, y1 = x0c * T, y0r * T, (x0c + wc) * T, (y0r + hr) * T
    shadow(b, (x1, y0 + 10, x1 + 22, y1 + 6))
    gable_roof(d, x0 - 4, y0, wc * T + 8, int(roof_rows * T), roof_col, lines=lines)
    wall(d, (x0, y0 + int(roof_rows * T), x1, y1), wall_col, plank, vert)
    return x0, y0 + int(roof_rows * T), x1, y1

# 長屋(北西)
x0, fy, x1, y1 = building(1, 1, 5, 6, 3, KAWARA, (170, 140, 110), plank=8)
d.rectangle((x0 - 4, fy + 22, x1 + 4, fy + 28), fill=KAWARA)
window(d, x0 + 24, fy + 4, 40, 16)
door(d, x0 + 16, fy + 34, 24, 62 - 28 + 28 - 34 + 30); window(d, x0 + 60, fy + 40, 50, 20)
pot(d, x0 + 4, y1 - 10); pot(d, x0 + 48, y1 - 10); bicycle(d, x0 + 120, y1 + 6)
d.rectangle((x0 + 44, fy + 40, x0 + 54, fy + 52), fill=(210, 200, 180), outline=INK)  # 名前の消えた表札
# 印刷屋(看板建築)
x0, fy, x1, y1 = 6 * T, 1 * T, 11 * T, 7 * T
shadow(b, (x1, y0 + 10 if False else fy + 10, x1 + 22, y1 + 6))
d.rectangle((x0, fy, x1, fy + 2.4 * T), fill=(140, 136, 132), outline=(90, 88, 86))
for x in range(x0 + 10, x1, 10): d.line((x, fy + 2, x, fy + 2.4 * T - 2), fill=(120, 118, 116))
wall(d, (x0, int(fy + 2.4 * T), x1, y1), MORTAR)
d.rectangle((x0 - 2, int(fy + 2.4 * T) - 6, x1 + 2, int(fy + 2.4 * T) + 4), fill=(170, 160, 146))
d.rectangle((x0 + 30, int(fy + 2.4 * T) + 10, x1 - 30, int(fy + 2.4 * T) + 28), fill=(238, 232, 214), outline=INK)
for i in range(4): d.rectangle((x0 + 40 + i * 20, int(fy + 2.4 * T) + 15, x0 + 52 + i * 20, int(fy + 2.4 * T) + 23), fill=(60, 60, 70))
gx0 = x0 + 16; d.rectangle((gx0, y1 - 54, x1 - 16, y1), fill=GLASS, outline=WOOD_DK, width=2)
d.line(((gx0 + x1 - 16) // 2, y1 - 54, (gx0 + x1 - 16) // 2, y1), fill=WOOD_DK, width=2)
d.rectangle((gx0 + 14, y1 - 30, gx0 + 50, y1 - 6), fill=(70, 70, 76))  # 中の印刷機
# 鈴木商店(トタンの平屋、立派すぎる看板)
x0, fy, x1, y1 = building(15, 1, 8, 6, 3, RUST, TOTAN, vert=6, lines=6)
sx0, sx1 = x0 - 20, x1 + 20
d.rectangle((sx0, fy - 30, sx1, fy - 2), fill=(26, 36, 78), outline=(220, 186, 84), width=3)
for i in range(16): d.rectangle((sx0 + 18 + i * 17, fy - 22, sx0 + 30 + i * 17, fy - 10), fill=(236, 204, 110))
d.rectangle((x0 + 12, fy + 14, x0 + 108, y1), fill=(140, 146, 150), outline=INK)
for y in range(fy + 20, y1, 6): d.line((x0 + 12, y, x0 + 108, y), fill=(116, 122, 126))
door(d, int(3.6 * T) + x0, fy + 22, 42, y1 - fy - 22)
d.line((int(3.6 * T) + x0 + 21, fy + 22, int(3.6 * T) + x0 + 21, y1), fill=INK)
window(d, x1 - 52, fy + 16, 36, 26, lit=True)
noise(d, (x0, fy, x1, y1), RUST, 0.2, 60, 3)
# 銭湯と煙突
x0, fy, x1, y1 = building(24, 2, 3, 5, 2.6, KAWARA, (200, 170, 150), plank=10)
door(d, x0 + 30, fy + 20, 34, y1 - fy - 20, (60, 60, 120))
cx = x0 + 70
d.rectangle((cx, 0, cx + 16, fy - 10), fill=(160, 112, 92), outline=INK)
for k in range(4): d.line((cx, 10 + k * 18, cx + 16, 10 + k * 18), fill=(120, 80, 64))
# 南の列: 長屋 2、鋳物工場、長屋
for c in (1, 6):
    x0, fy, x1, y1 = building(c, 9, 5, 5, 2.6, KAWARA, (166, 136, 108), plank=8)
    window(d, x0 + 20, fy + 14, 40, 18); door(d, x0 + 90, fy + 10, 26, y1 - fy - 10)
    pot(d, x0 + 70, y1 - 10)
x0, fy, x1, y1 = 15 * T, 9 * T, 21 * T, 14 * T
shadow(b, (x1, fy + 10, x1 + 22, y1 + 6))
for k in range(3):
    xa = x0 + k * 2 * T
    d.polygon([(xa, fy + 2.4 * T), (xa + 2 * T, fy), (xa + 2 * T, fy + 2.4 * T)], fill=(110, 100, 96), outline=INK)
    d.rectangle((xa + 2 * T - 10, fy + 4, xa + 2 * T - 2, fy + 2.4 * T - 4), fill=(160, 170, 180))
wall(d, (x0, int(fy + 2.4 * T), x1, y1), (150, 140, 130), vert=10)
d.rectangle((x0 + 1.5 * T, int(fy + 2.4 * T) + 6, x0 + 4.5 * T, y1), fill=(50, 34, 28), outline=INK)
d.rectangle((x0 + 2 * T, y1 - 26, x0 + 2.8 * T, y1 - 6), fill=(244, 150, 60)); d.rectangle((x0 + 3.2 * T, y1 - 20, x0 + 4.2 * T, y1 - 4), fill=(120, 110, 100))
x0, fy, x1, y1 = building(22, 9, 5, 5, 2.6, KAWARA, (170, 140, 110), plank=8)
window(d, x0 + 20, fy + 14, 40, 18); door(d, x0 + 100, fy + 10, 26, y1 - fy - 10)
# 西の夕日: 建物の西の面に橙の照り
ov = Image.new('RGBA', b.size, (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
for x in range(W): od.line((x, 0, x, H), fill=(255, 150, 70, int(40 * (1 - x / W))))
b.alpha_composite(ov)
b.save(O + 'bg_alley.png')
b.resize((W // 2, H // 2), Image.BOX).save(O + 'half_alley_in.png')
print('ok', b.size)
