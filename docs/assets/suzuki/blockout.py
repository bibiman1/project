# 荒川の鈴木商店 下絵(2026-10-02)。設計図 design.png に従う。斜め上から見下ろす角度
# 今。雨上がりの夕方。夕日は西(左)から差し、影は東(右)へのびる。濡れた地面に空の橙が映る
from PIL import Image, ImageDraw
import random, math, os
T = 32
O = "/home/user/project/docs/assets/suzuki/v1/"
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

import json

def plain_wall(d, box, col):
    d.rectangle(box, fill=col, outline=shade(col, 0.6))

def house_row(img, d, x0, x1, y_top, y_bot, roof_rows=1.2):
    # 奥の家並み(屋根と、正面の壁)。幅 4〜6 マスの家を並べる
    x = x0
    while x < x1:
        w = min(x1 - x, R.choice([4, 5, 6]) * T)
        rh = int(roof_rows * T)
        gable_roof(d, x, y_top, w, rh, R.choice([KAWARA, (96, 86, 84), (120, 74, 60)]))
        wall(d, (x, y_top + rh, x + w, y_bot), R.choice([(170, 140, 110), (186, 176, 160), (160, 150, 140)]), plank=8)
        if y_bot - y_top - rh > 20: window(d, x + w // 2 - 16, y_top + rh + 6, 32, 14, lit=R.random() < 0.4)
        x += w

def sign_text(img, x, y, text, col, size=16):
    # ゲームの字体 DotGothic16 を 16 ドットの升目で、2 値で描く
    from PIL import ImageFont
    fnt = ImageFont.truetype('/tmp/claude-0/-home-user-project/e7cb1a9b-b078-5ece-9cdf-0647f5a9d6fa/scratchpad/sz/DotGothic16.ttf', size)
    m = Image.new('L', (len(text) * size + 4, size + 6), 0)
    ImageDraw.Draw(m).text((0, 0), text, fill=255, font=fnt)
    m = m.point(lambda v: 255 if v > 110 else 0)
    img.paste(Image.new('RGBA', m.size, col), (x, y), m)

def rows(spec, c, r, fill='#'):
    g = [['.'] * c for _ in range(r)]
    for (c0, r0, c1, r1, ch) in spec:
        for rr in range(r0, r1 + 1):
            for cc in range(c0, c1 + 1): g[rr][cc] = ch
    return [''.join(x) for x in g]

GRIDS = {}
SIGNS = []   # 仕上げのあとに字を載せる場所 (マップ名, x, y, 文字, 色)

# ================= A 都電の停留場 28×10 =================
W, H = 28 * T, 10 * T
a = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(a)
ground(d, (0, 0, W, H), ASPH_WET)
house_row(a, d, 0, 12 * T, 0, 2 * T, 1.0)
house_row(a, d, 15 * T, W, 0, 2 * T, 1.0)
ground(d, (12 * T, 0, 15 * T, 2 * T), ASPH)
for (cx, cy, rw, rh) in [(5 * T, 3 * T, 30, 8), (13.5 * T, 1 * T, 18, 6), (22 * T, 2.8 * T, 26, 7)]: puddle(d, int(cx), int(cy), rw, rh)
# バラの植え込み(ホームへの入口だけ切れている)
for (c0, c1) in [(0, 10), (18, 28)]:
    d.rectangle((c0 * T, 4 * T, c1 * T, int(4.8 * T)), fill=(60, 100, 56), outline=(40, 70, 40))
    for _ in range((c1 - c0) * 5):
        x = R.randrange(c0 * T + 3, c1 * T - 3); y = R.randrange(4 * T + 3, int(4.8 * T) - 3)
        d.ellipse((x - 3, y - 3, x + 3, y + 3), fill=R.choice([(214, 70, 90), (236, 120, 140), (190, 40, 70)]))
# ホーム(低い)
d.rectangle((7 * T, int(4.8 * T), 22 * T, int(6.2 * T)), fill=(196, 190, 176), outline=(120, 114, 104))
d.rectangle((7 * T, int(6.0 * T), 22 * T, int(6.2 * T)), fill=(230, 210, 90))
d.rectangle((10 * T, 4 * T, 18 * T, int(4.8 * T)), fill=(176, 170, 156))
# 待合の屋根(西)と駅名標(東、字はにじむ)
d.rectangle((7 * T, int(4.3 * T), 9 * T, int(4.6 * T)), fill=(110, 120, 130), outline=INK)
for px in (7 * T + 4, 9 * T - 8): d.rectangle((px, int(4.6 * T), px + 4, int(5.8 * T)), fill=(90, 96, 104))
d.rectangle((7 * T + 6, int(5.2 * T), 9 * T - 6, int(5.6 * T)), fill=(130, 100, 70))
d.rectangle((20 * T + 4, int(4.4 * T), 21 * T + 20, int(5.2 * T)), fill=(240, 240, 236), outline=INK)
for k in range(3): d.line((20 * T + 10, int(4.55 * T) + k * 6, 21 * T + 14, int(4.55 * T) + k * 6), fill=(150, 160, 190), width=3)
d.rectangle((21 * T, int(5.2 * T), 21 * T + 4, int(6.0 * T)), fill=(90, 96, 104))
# 線路(砂利と枕木とレール)
d.rectangle((0, int(6.2 * T), W, 8 * T + 8), fill=(120, 112, 104))
noise(d, (0, int(6.2 * T), W, 8 * T + 8), (120, 112, 104), 0.15, 2500)
for x in range(0, W, 14): d.rectangle((x, int(6.6 * T), x + 7, int(7.8 * T)), fill=(92, 72, 60))
for y in (int(6.8 * T), int(7.5 * T)): d.line((0, y, W, y), fill=(210, 206, 214), width=3)
# 都電(一両): クリームの車体に帯、窓 6、パンタグラフ
tx0, tx1, ty0, ty1 = 9 * T + 8, 18 * T + 8, int(5.9 * T), int(8.0 * T)
d.rectangle((tx0, ty0, tx1, ty0 + 14), fill=(200, 200, 196), outline=INK)           # 屋根
d.rectangle((tx0, ty0 + 14, tx1, ty1), fill=(236, 226, 186), outline=INK)
d.rectangle((tx0, ty1 - 16, tx1, ty1 - 6), fill=(200, 80, 100))
for k in range(6): d.rectangle((tx0 + 18 + k * 44, ty0 + 20, tx0 + 46 + k * 44, ty0 + 36), fill=WIN_LIT if k in (1, 4) else GLASS, outline=INK)
d.line((tx0 + 140, ty0 - 14, tx0 + 140, ty0), fill=INK, width=2); d.line((tx0 + 120, ty0 - 14, tx0 + 160, ty0 - 14), fill=INK, width=2)
d.rectangle((tx0 + 4, ty0 + 18, tx0 + 12, ty0 + 30), fill=(250, 240, 180))           # 前照灯
# 線路の向こうの家並み
house_row(a, d, 0, W, 8 * T + 8, H, 0.8)
GRIDS['stop'] = rows([(0, 0, 11, 1, '#'), (15, 0, 27, 1, '#'), (0, 4, 9, 4, '#'), (18, 4, 27, 4, '#'),
                      (0, 5, 8, 5, '#'), (9, 5, 18, 5, '#'), (20, 5, 27, 5, '#'), (0, 6, 27, 9, '#')], 28, 10)
a.save(O + 'stop.png')

# ================= B 町工場と長屋の路地 28×16 =================
W, H = 28 * T, 16 * T
b = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(b)
ground(d, (0, 0, W, H), ASPH_WET)
d.rectangle((0, 0, W, T), fill=GRASS); noise(d, (0, 0, W, T), GRASS, 0.12, 900)
d.rectangle((12 * T, 0, 15 * T, T + 8), fill=(170, 164, 150))
for y in range(2, T + 8, 6): d.line((12 * T, y, 15 * T, y), fill=(130, 124, 112), width=2)
ground(d, (12 * T, T + 8, 15 * T, H), ASPH)
ground(d, (0, 7 * T, W, 9 * T), ASPH)
ground(d, (0, 14 * T, W, H), ASPH)
for (cx, cy, rw, rh) in [(13.5 * T, 3 * T, 22, 8), (5 * T, 8 * T, 30, 9), (20 * T, 7.6 * T, 24, 7), (13 * T, 11.5 * T, 18, 7), (24 * T, 15 * T, 26, 8)]:
    puddle(d, int(cx), int(cy), rw, rh)

def building(x0c, y0r, wc, hr, roof_rows, roof_col, wall_col, plank=None, vert=None, lines=None):
    x0, y0, x1, y1 = x0c * T, y0r * T, (x0c + wc) * T, (y0r + hr) * T
    shadow(b, (x1, y0 + 10, x1 + 22, y1 + 6))
    gable_roof(d, x0 - 4, y0, wc * T + 8, int(roof_rows * T), roof_col, lines=lines)
    wall(d, (x0, y0 + int(roof_rows * T), x1, y1), wall_col, plank, vert)
    return x0, y0 + int(roof_rows * T), x1, y1

x0, fy, x1, y1 = building(1, 1, 5, 6, 3, KAWARA, (170, 140, 110), plank=8)
d.rectangle((x0 - 4, fy + 22, x1 + 4, fy + 28), fill=KAWARA)
window(d, x0 + 24, fy + 4, 40, 16)
door(d, x0 + 16, fy + 34, 24, 62); window(d, x0 + 60, fy + 40, 50, 20)
pot(d, x0 + 4, y1 - 10); pot(d, x0 + 48, y1 - 10); bicycle(d, x0 + 120, y1 + 6)
d.rectangle((x0 + 44, fy + 40, x0 + 54, fy + 52), fill=(210, 200, 180), outline=INK)
x0, fy, x1, y1 = 6 * T, 1 * T, 11 * T, 7 * T
shadow(b, (x1, fy + 10, x1 + 22, y1 + 6))
d.rectangle((x0, fy, x1, fy + 2.4 * T), fill=(140, 136, 132), outline=(90, 88, 86))
for x in range(x0 + 10, x1, 10): d.line((x, fy + 2, x, fy + 2.4 * T - 2), fill=(120, 118, 116))
wall(d, (x0, int(fy + 2.4 * T), x1, y1), MORTAR)
d.rectangle((x0 - 2, int(fy + 2.4 * T) - 6, x1 + 2, int(fy + 2.4 * T) + 4), fill=(170, 160, 146))
d.rectangle((x0 + 30, int(fy + 2.4 * T) + 10, x1 - 30, int(fy + 2.4 * T) + 30), fill=(238, 232, 214), outline=INK)
SIGNS.append(('alley', x0 + 48, int(fy + 2.4 * T) + 12, '活版印刷', (40, 40, 48, 255)))
gx0 = x0 + 16; d.rectangle((gx0, y1 - 54, x1 - 16, y1), fill=GLASS, outline=WOOD_DK, width=2)
d.line(((gx0 + x1 - 16) // 2, y1 - 54, (gx0 + x1 - 16) // 2, y1), fill=WOOD_DK, width=2)
d.rectangle((gx0 + 14, y1 - 30, gx0 + 50, y1 - 6), fill=(70, 70, 76))
# 鈴木商店: 赤茶のトタン屋根(波板)、トタンの壁、看板
x0, fy, x1, y1 = building(15, 1, 8, 6, 3, RUST, TOTAN, vert=6, lines=4)
for x in range(x0, x1, 4): d.line((x, 1 * T + T, x, fy - 1), fill=(170, 100, 66))
sx0, sx1 = x0 - 20, x1 + 20
d.rectangle((sx0, fy - 30, sx1, fy - 2), fill=(26, 36, 78), outline=(220, 186, 84), width=3)
SIGNS.append(('alley', sx0 + 5, fy - 24, '宇宙船殻用単結晶製造販売卸鈴木商店', (240, 206, 110, 255)))
d.rectangle((x0 + 12, fy + 14, x0 + 108, y1), fill=(140, 146, 150), outline=INK)
for y in range(fy + 20, y1, 6): d.line((x0 + 12, y, x0 + 108, y), fill=(116, 122, 126))
door(d, int(3.6 * T) + x0, fy + 22, 42, y1 - fy - 22)
d.line((int(3.6 * T) + x0 + 21, fy + 22, int(3.6 * T) + x0 + 21, y1), fill=INK)
window(d, x1 - 52, fy + 16, 36, 26, lit=True)
noise(d, (x0, fy, x1, y1), RUST, 0.2, 60, 3)
# 銭湯: しっくいの壁、のれん、高い煙突
x0, fy, x1, y1 = building(24, 2, 3, 5, 2.6, KAWARA, (226, 218, 200))
d.rectangle((x0 + 26, fy + 20, x0 + 70, fy + 40), fill=(40, 60, 130))
door(d, x0 + 30, fy + 40, 36, y1 - fy - 40, (110, 84, 60))
cx = x0 + 74
d.rectangle((cx, 0, cx + 16, fy - 10), fill=(160, 112, 92), outline=INK)
for k in range(4): d.line((cx, 10 + k * 18, cx + 16, 10 + k * 18), fill=(120, 80, 64))
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
ov = Image.new('RGBA', b.size, (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
for x in range(W): od.line((x, 0, x, H), fill=(255, 150, 70, int(40 * (1 - x / W))))
b.alpha_composite(ov)
GRIDS['alley'] = rows([(0, 0, 11, 0, '#'), (15, 0, 27, 0, '#'), (0, 1, 11, 6, '#'), (15, 1, 27, 6, '#'),
                       (4, 7, 5, 7, '#'), (0, 9, 11, 13, '#'), (15, 9, 27, 13, '#')], 28, 16)
b.save(O + 'alley.png')

# ================= C 鈴木商店の中 16×12 =================
W, H = 16 * T, 12 * T
c = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(c)
d.rectangle((0, 0, W, H), fill=(150, 130, 108))
for y in range(0, H, 16): d.line((0, y, W, y), fill=(136, 116, 96))
for y in range(0, H, 16):
    for x in range((y // 16 % 2) * 24, W, 48): d.line((x, y, x, y + 16), fill=(136, 116, 96))
noise(d, (0, 0, W, H), (150, 130, 108), 0.06, 2000)
# 奥の壁(トタンの内側、梁): 見本の棚、設計図、柱時計
wall(d, (0, 0, W, int(2.2 * T)), (130, 136, 140), vert=6)
d.rectangle((0, int(2.2 * T) - 6, W, int(2.2 * T)), fill=(90, 70, 54))
for sx in (16, 3 * T + 16):
    d.rectangle((sx, 10, sx + 2.6 * T, 2 * T - 4), fill=(110, 80, 56), outline=INK)
    for k in range(3):
        d.line((sx, 10 + k * 18 + 16, sx + 2.6 * T, 10 + k * 18 + 16), fill=(80, 58, 40), width=2)
        for j in range(4): d.polygon([(sx + 8 + j * 20, 10 + k * 18 + 15), (sx + 14 + j * 20, 10 + k * 18 + 4), (sx + 20 + j * 20, 10 + k * 18 + 15)], fill=(200, 230, 246), outline=(120, 160, 190))
d.rectangle((7 * T, 12, 10 * T, 2 * T - 6), fill=(60, 90, 150), outline=INK)
for k in range(5): d.line((7 * T + 8, 22 + k * 8, 10 * T - 8, 22 + k * 8), fill=(200, 220, 240))
d.polygon([(8 * T, 2 * T - 14), (8.5 * T, 22), (9 * T, 2 * T - 14)], outline=(230, 240, 250))
d.rectangle((11 * T + 10, 6, 12 * T + 6, 2 * T), fill=(120, 80, 50), outline=INK); d.ellipse((11 * T + 13, 10, 12 * T + 3, 34), fill=(240, 232, 210), outline=INK)
d.rectangle((13 * T, 10, 15 * T + 16, 2 * T - 4), fill=(110, 80, 56), outline=INK)
for j in range(3): d.rectangle((13 * T + 8 + j * 22, 2 * T - 24, 13 * T + 24 + j * 22, 2 * T - 8), fill=(180, 160, 120), outline=INK)
# 研磨機(西)と結晶炉(東)
d.rectangle((1 * T, 3 * T, 5 * T, 6 * T), fill=(120, 124, 130), outline=INK)
d.ellipse((1.6 * T, 3.3 * T, 3.4 * T, 5.1 * T), fill=(170, 176, 184), outline=INK); d.ellipse((2.2 * T, 3.9 * T, 2.8 * T, 4.5 * T), fill=(90, 94, 100))
d.rectangle((3.8 * T, 3.4 * T, 4.6 * T, 5.4 * T), fill=(90, 96, 104), outline=INK)
d.rectangle((11 * T, 3 * T, 15 * T, 6 * T), fill=(96, 84, 80), outline=INK)
d.rectangle((11.6 * T, 3.6 * T, 14.4 * T, 5.4 * T), fill=(60, 44, 40), outline=INK)
d.rectangle((12.2 * T, 4.0 * T, 13.8 * T, 5.0 * T), fill=(250, 170, 80)); d.ellipse((12.7 * T, 4.1 * T, 13.3 * T, 4.9 * T), fill=(220, 240, 250))
# カウンター
d.rectangle((5 * T, int(6.0 * T), 11 * T, int(7.4 * T)), fill=(130, 90, 60), outline=INK)
d.rectangle((5 * T, int(6.0 * T), 11 * T, int(6.5 * T)), fill=(160, 116, 80), outline=INK)
d.rectangle((5.6 * T, 6.05 * T, 6.6 * T, 6.4 * T), fill=(240, 236, 220), outline=INK)   # 伝票(のちに納品書)
# 木箱と梱包材
for (bx, by) in [(1 * T, 8 * T), (2.5 * T, 8.6 * T), (1.2 * T, 9.6 * T)]:
    d.rectangle((bx, by, bx + 1.4 * T, by + 1.2 * T), fill=(176, 140, 96), outline=INK); d.line((bx, by + 0.6 * T, bx + 1.4 * T, by + 0.6 * T), fill=(120, 90, 60))
d.rectangle((12 * T, 8 * T, 15 * T, 11 * T), fill=(200, 196, 180), outline=INK)
for k in range(10): d.ellipse((12 * T + R.randrange(4, 80), 8 * T + R.randrange(4, 80), 12 * T + R.randrange(84, 92), 8 * T + R.randrange(84, 92)), outline=(170, 166, 150))
# 入口(南の引き戸)
d.rectangle((0, 11 * T + 8, W, H), fill=(110, 116, 120))
d.rectangle((7 * T, 11 * T, 9 * T, H), fill=(190, 150, 110), outline=INK)
d.rectangle((0, 2 * T, 8, 11 * T), fill=(110, 116, 120)); d.rectangle((W - 8, 2 * T, W, 11 * T), fill=(110, 116, 120))
GRIDS['shop'] = rows([(0, 0, 15, 1, '#'), (0, 2, 0, 10, '#'), (15, 2, 15, 10, '#'), (1, 3, 4, 5, '#'), (11, 3, 14, 5, '#'),
                      (5, 6, 10, 6, '#'), (1, 8, 3, 10, '#'), (12, 8, 14, 10, '#'), (0, 11, 6, 11, '#'), (9, 11, 15, 11, '#')], 16, 12)
c.save(O + 'shop.png')

import sys; sys.path.insert(0, '/home/user/project/docs/assets/suzuki/crystal')
# ================= D 土手と河川敷 28×14(単結晶あり / 夜のクレーター) =================
def riverbank(with_crystal):
    W, H = 28 * T, 14 * T
    e = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(e)
    d.rectangle((0, 0, W, H), fill=GRASS); noise(d, (0, 0, W, H), GRASS, 0.12, 9000)
    for _ in range(300):
        x = R.randrange(0, W); y = R.randrange(2 * T, 12 * T)
        d.line((x, y, x + 1, y - 4), fill=GRASS2)
    # 川(北)。向こう岸の堤防がうっすら
    d.rectangle((0, 0, W, 2 * T), fill=(120, 100, 120))
    d.rectangle((0, 0, W, 10), fill=(90, 110, 80))
    for j in range(12, 2 * T, 5): d.line((0, j, W, j), fill=(150, 116, 120) if (j // 5) % 2 else (176, 130, 116))
    for _ in range(40):
        x = R.randrange(0, W); y = R.randrange(14, 2 * T - 4)
        d.line((x, y, x + R.randrange(10, 26), y), fill=(250, 190, 120))
    d.rectangle((0, 2 * T - 4, W, 2 * T + 4), fill=(140, 130, 110))
    # 草野球のホームベースと、水たまり
    d.polygon([(25 * T, 10 * T), (25.4 * T, 10 * T), (25.4 * T, 10.3 * T), (25.2 * T, 10.5 * T), (25 * T, 10.3 * T)], fill=(240, 240, 236))
    d.arc((22 * T, 7 * T, 28 * T, 13 * T), 200, 340, fill=(190, 160, 120), width=6)
    puddle(d, int(2.5 * T), int(10.5 * T), 34, 9); puddle(d, int(24.5 * T), int(4 * T), 26, 8)
    # 土手(南): 斜面と、上の道、階段
    d.rectangle((0, 12 * T, W, 13 * T), fill=(84, 116, 66)); noise(d, (0, 12 * T, W, 13 * T), (84, 116, 66), 0.15, 1200)
    d.rectangle((0, 13 * T, W, H), fill=(178, 170, 150)); noise(d, (0, 13 * T, W, H), (178, 170, 150), 0.08, 800)
    d.rectangle((12 * T, 12 * T, 15 * T, 13 * T), fill=(170, 164, 150))
    for y in range(12 * T + 3, 13 * T, 6): d.line((12 * T, y, 15 * T, y), fill=(130, 124, 112), width=2)
    import sys; sys.path.insert(0, '/home/user/project/docs/assets/suzuki/crystal')
    import cigar as CG
    if with_crystal:
        # 単結晶: 両端が狭まった円柱(作者)。先と後ろに穴が空いている(docs/assets/suzuki/crystal/cigar.py)。星(きらめき)は描かない
        sh_ = Image.new('RGBA', e.size, (0, 0, 0, 0))
        ImageDraw.Draw(sh_).polygon([((x / 4 + 0.6) * T, (CG.YC + CG.radius(x / 4) * 0.55 + 1.9) * T) for x in range(int(CG.L0 * 4), int(CG.L1 * 4) + 1)]
                                    + [(CG.L1 * T + 20, (CG.YC + 1.9) * T), (CG.L0 * T + 20, (CG.YC + 1.9) * T)], fill=(30, 20, 50, 80))
        e.alpha_composite(sh_)
        CG.draw(e)
        d = ImageDraw.Draw(e)
        for x in range(int(5 * T), int(23 * T), 9): d.line((x, 8.3 * T + 2, x + 6, 8.3 * T + 8), fill=GRASS2, width=2)
        ov = Image.new('RGBA', e.size, (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
        for x in range(W): od.line((x, 0, x, H), fill=(255, 150, 70, int(46 * (1 - x / W))))
        e.alpha_composite(ov)
    else:
        # 夜。単結晶が寝ていた所が、流れ星の落ちたクレーターになっている
        d.polygon([((x / 4) * T, (CG.YC - CG.radius(x / 4) * 1.05) * T) for x in range(int(CG.L0 * 4), int(CG.L1 * 4) + 1)]
                  + [((x / 4) * T, (CG.YC + CG.radius(x / 4) * 1.05) * T) for x in range(int(CG.L1 * 4), int(CG.L0 * 4) - 1, -1)], fill=(92, 74, 56))
        d.ellipse((6 * T, 3.6 * T, 22 * T, 7.6 * T), fill=(70, 56, 44))
        d.ellipse((9 * T, 4.4 * T, 19 * T, 7.0 * T), fill=(56, 44, 36))
        for _ in range(140):   # 掘り返された土のかたまり(ふち)
            a_ = R.random() * 6.283; rr = 1.0 + R.random() * 0.25
            x_ = 14 * T + math.cos(a_) * 11.5 * T * rr; y_ = 5.5 * T + math.sin(a_) * 3.2 * T * rr
            d.ellipse((x_ - 3, y_ - 2, x_ + 3, y_ + 2), fill=R.choice([(120, 96, 70), (90, 72, 54), (140, 116, 84)]))
        px_ = e.load()
        for y_ in range(H):          # 夜の色(月あかり)
            for x_ in range(W):
                r_, g_, b_, a_ = px_[x_, y_]
                px_[x_, y_] = (int(r_ * 0.32 + 14), int(g_ * 0.36 + 18), int(b_ * 0.5 + 52), 255)
        d = ImageDraw.Draw(e)
        for _ in range(26):          # 川に映る月の光
            x_ = R.randrange(int(18 * T), int(24 * T)); y_ = R.randrange(14, 2 * T - 6)
            d.line((x_, y_, x_ + R.randrange(6, 16), y_), fill=(200, 210, 230))
        ov = Image.new('RGBA', e.size, (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
        od.ellipse((11 * T, 4.6 * T, 17 * T, 6.6 * T), fill=(255, 170, 90, 50))   # クレーターの底が、まだほんのり熱い
        e.alpha_composite(ov)
    return e

e = riverbank(True); e.save(O + 'river.png')
# 当たり判定: 単結晶(円柱)の形から計算する(# 通れない、. 歩ける)
import sys; sys.path.insert(0, '/home/user/project/docs/assets/suzuki/crystal')
import cigar as CG
gr = []
for r_ in range(14):
    row = ''
    for c_ in range(28):
        if r_ <= 1 or (r_ == 12 and not 12 <= c_ <= 14): row += '#'; continue
        if r_ >= 12: row += '.'; continue
        x_, y_ = c_ + .5, r_ + .5
        row += '#' if CG.radius(x_) > 0 and abs(y_ - CG.YC) < CG.radius(x_) + 0.2 else '.'
    gr.append(row)
GRIDS['river'] = gr
e2 = riverbank(False); e2.save(O + 'crater.png')
GRIDS['crater'] = rows([(0, 0, 27, 1, '#'), (0, 12, 11, 12, '#'), (15, 12, 27, 12, '#')], 28, 14)

# ================= 衛星軌道: 単結晶の中 28×10(星空、下に地球、輪のある月) =================
W, H = 28 * T, 10 * T
o = Image.new('RGBA', (W, H), (6, 8, 20, 255)); d = ImageDraw.Draw(o)
for _ in range(260):
    x_, y_ = R.randrange(W), R.randrange(H); c_ = R.choice([(200, 200, 220), (150, 150, 180), (255, 240, 220)])
    d.point((x_, y_), fill=c_)
# 地球のふち(下)と大気の青い光
d.ellipse((-6 * W, 8.0 * T, 7 * W, 8.0 * T + 40 * W), fill=(40, 90, 170))
d.arc((-6 * W, 8.0 * T - 3, 7 * W, 8.0 * T + 40 * W), 250, 290, fill=(140, 200, 255), width=5)
for _ in range(60):
    x_ = R.randrange(W); y_ = R.randrange(int(8.4 * T), H)
    d.ellipse((x_ - R.randrange(6, 20), y_ - 3, x_ + R.randrange(6, 20), y_ + 3), fill=(230, 236, 246))
# 欠けて輪をまとった月(右上)
d.ellipse((23 * T, 0.4 * T, 25 * T, 2.4 * T), fill=(236, 232, 224)); d.chord((23 * T, 0.4 * T, 25 * T, 2.4 * T), 300, 60, fill=(60, 56, 70))
d.arc((22 * T, 1.1 * T, 26 * T, 1.7 * T), 0, 360, fill=(190, 180, 200), width=2)
# 単結晶(透明な筒)を横から。床は歩ける
glass = Image.new('RGBA', (W, H), (0, 0, 0, 0)); gp = glass.load()
YC2, R2 = 5.0, 2.6
def rad2(x):
    k = min(x - 1.0, 27.0 - x) / 5.0
    if x <= 1.0 or x >= 27.0: return 0
    return R2 * (0.42 + 0.58 * (1 if k >= 1 else 1 - (1 - k) ** 2))
for X in range(W):
    r2 = rad2(X / T)
    if r2 <= 0: continue
    for Y in range(H):
        v = (Y / T - YC2) / r2
        if -1 <= v <= 1:
            a_ = 70 + int(80 * abs(v) ** 3)
            c_ = (190, 230, 246) if v < 0.25 else (210, 238, 250)
            if 0.25 <= v <= 0.85: a_ = 120          # 床(内側の下の面)
            gp[X, Y] = c_ + (a_,)
o.alpha_composite(glass); d = ImageDraw.Draw(o)
pts_t = [(x / 4 * T, (YC2 - rad2(x / 4)) * T) for x in range(4, 108 + 1)]
pts_b = [(x / 4 * T, (YC2 + rad2(x / 4)) * T) for x in range(108, 3, -1)]
d.line(pts_t + pts_b + pts_t[:1], fill=(236, 248, 255), width=2)
d.line([(x / 4 * T, (YC2 + rad2(x / 4) * 0.25) * T) for x in range(8, 105)], fill=(236, 248, 255), width=1)   # 床のへり
for xe in (1.0, 27.0):     # 両端の穴
    r0 = R2 * 0.42
    d.ellipse(((xe - 0.3) * T, (YC2 - r0) * T, (xe + 0.3) * T, (YC2 + r0) * T), fill=(6, 8, 20), outline=(236, 248, 255), width=2)
o.save(O + 'orbit.png')
GRIDS['orbit'] = rows([(0, 0, 27, 9, '#'), (0, 5, 27, 6, '.')], 28, 10)

# ================= 流れ星: 夜の下町の屋根の上を、流れ星が横切る 320×192 =================
W, H = 320, 192
v = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(v)
for y in range(H):
    k = y / H
    d.line((0, y, W, y), fill=(int(14 + 30 * k), int(18 + 34 * k), int(48 + 50 * k)))
for _ in range(90):
    d.point((R.randrange(W), R.randrange(120)), fill=R.choice([(200, 200, 220), (150, 150, 180)]))
d.ellipse((40, 22, 60, 42), fill=(236, 232, 224)); d.chord((40, 22, 60, 42), 300, 60, fill=(24, 28, 60))
d.arc((28, 29, 72, 35), 0, 360, fill=(170, 164, 190))
for k in range(26):       # 流れ星(右上から左下へ、尾は長く)
    t_ = k / 25
    x_, y_ = 300 - 190 * t_, 20 + 70 * t_
    w_ = int(1 + 3 * t_)
    d.ellipse((x_ - w_, y_ - w_, x_ + w_, y_ + w_), fill=(int(160 + 95 * t_), int(180 + 70 * t_), 255))
d.ellipse((104, 84, 116, 96), fill=(255, 250, 230))
# 屋根の影(長屋、トタン、銭湯の煙突)と、灯りのともる窓
x_ = 0
while x_ < W:
    w_ = R.randrange(30, 60); h_ = R.randrange(26, 48)
    d.polygon([(x_, H - h_ + 10), (x_ + w_ // 2, H - h_), (x_ + w_, H - h_ + 10), (x_ + w_, H), (x_, H)], fill=(18, 18, 30))
    if R.random() < 0.6: d.rectangle((x_ + 8, H - h_ + 18, x_ + 14, H - h_ + 24), fill=(240, 196, 120))
    x_ += w_
d.rectangle((228, 96, 236, H), fill=(18, 18, 30))
v.save(O + 'fall.png')

json.dump(GRIDS, open(O + 'grids.json', 'w'), indent=1)
for name, im in [('stop', a), ('alley', b), ('shop', c), ('river', e), ('crater', e2), ('orbit', o)]:
    g = GRIDS[name]; o = im.copy(); m = Image.new('RGBA', im.size, (0, 0, 0, 0)); md = ImageDraw.Draw(m)
    for r_, row in enumerate(g):
        for c_, ch in enumerate(row):
            if ch == '#': md.rectangle((c_ * T, r_ * T, c_ * T + T - 1, r_ * T + T - 1), fill=(255, 0, 0, 70))
    o.alpha_composite(m); o.save(O + name + '_grid.png')
    im.resize((im.width // 2, im.height // 2), Image.BOX).save(O + 'half_' + name + '_in.png')
json.dump(SIGNS, open(O + 'signs.json', 'w'), ensure_ascii=False)
print('ok')
