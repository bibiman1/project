# 呪いの野犬 下絵(2026-10-03)。配置図 plan.png に従う。斜め上から見下ろす角度。今の真昼(日は高く、影は短く南東へ)
# 当たり判定のマス(grids.json)も、ここで一緒に決める(絵とマスがずれないように)
from PIL import Image, ImageDraw
import random, json, os
T = 32
O = '/home/user/project/docs/assets/noroi/v1/'
os.makedirs(O, exist_ok=True)
R = random.Random(7)
def sh(c, k): return tuple(max(0, min(255, int(v * k))) for v in c[:3])
def noise(d, box, base, var, n, size=2):
    x0, y0, x1, y1 = [int(v) for v in box]
    for _ in range(n):
        x = R.randrange(x0, max(x0 + 1, x1)); y = R.randrange(y0, max(y0 + 1, y1))
        d.rectangle((x, y, x + size - 1, y + size - 1), fill=sh(base, 1 + R.uniform(-var, var)))
def fill(d, box, base, var=0.08, dens=30):
    d.rectangle(box, fill=base); noise(d, box, base, var, int((box[2] - box[0]) * (box[3] - box[1]) / dens))
def shadow(img, poly, a=70):
    ov = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(ov).polygon(poly, fill=(40, 30, 20, a)); img.alpha_composite(ov)
def cedar(d, x, y, s=1.0):           # 杉(上から見た円錐)。x, y は根もと
    h = int(64 * s); w = int(30 * s)
    d.polygon([(x, y - h), (x - w // 2, y - 6), (x + w // 2, y - 6)], fill=sh((46, 84, 52), R.uniform(0.85, 1.1)), outline=(26, 50, 30))
    d.polygon([(x, y - h), (x, y - 6), (x + w // 2, y - 6)], fill=sh((34, 66, 40), R.uniform(0.9, 1.1)))
    d.rectangle((x - 2, y - 8, x + 2, y), fill=(80, 56, 36))
def cactus(d, x, y):
    g = (86, 130, 70); d.rounded_rectangle((x - 4, y - 30, x + 4, y), 4, fill=g, outline=(40, 70, 36))
    d.rounded_rectangle((x - 13, y - 22, x - 6, y - 10), 3, fill=g, outline=(40, 70, 36)); d.rectangle((x - 8, y - 14, x - 4, y - 10), fill=g)
    d.rounded_rectangle((x + 6, y - 26, x + 13, y - 14), 3, fill=g, outline=(40, 70, 36)); d.rectangle((x + 4, y - 18, x + 8, y - 14), fill=g)
def sage(d, x, y): d.ellipse((x - 9, y - 7, x + 9, y + 4), fill=sh((150, 150, 110), R.uniform(0.85, 1.1)), outline=(100, 100, 70))
def guardrail(d, x0, x1, y):
    for x in range(x0, x1, 40): d.rectangle((x, y - 4, x + 4, y + 10), fill=(150, 150, 150), outline=(80, 80, 80))
    d.rectangle((x0, y - 10, x1, y - 2), fill=(214, 214, 210), outline=(110, 110, 110))
    d.line((x0, y - 6, x1, y - 6), fill=(170, 170, 168))
ASPH = (104, 102, 100); DESERT = (220, 190, 140); DIRT = (186, 160, 118)
def road(d, box, line=None, dash=True):
    fill(d, box, ASPH, 0.07, 14)
    for _ in range((box[2] - box[0]) // 40):                       # ひびと、ひびから生えた草
        x = R.randrange(box[0], box[2]); y = R.randrange(box[1], box[3])
        d.line((x, y, x + R.randrange(-14, 14), y + R.randrange(4, 14)), fill=(70, 68, 66))
        if R.random() < 0.5: d.ellipse((x - 3, y - 2, x + 3, y + 3), fill=(110, 140, 70))
    if line:
        for x in range(box[0], box[2], 48 if dash else 1000):
            d.rectangle((x, line - 2, x + (26 if dash else box[2]), line + 2), fill=(222, 196, 90))
grids = {}

# ---------- A 峠のトンネルの出口 28×12 ----------
W, H = 28 * T, 12 * T
a = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(a)
fill(d, (0, 0, W, H), (78, 104, 62), 0.15, 10)                       # 山の斜面(下草)
# 谷(南): ガードレールの向こうは崖。杉のてっぺんが下に見える
fill(d, (0, 9 * T + 8, W, H), (60, 84, 56), 0.2, 8)
for i in range(26): cedar(d, R.randrange(0, W), 11 * T + R.randrange(0, 2 * T), 0.8)
# 北の森
for i in range(46):
    x = R.randrange(0, W); y = R.randrange(10, 3 * T + 10)
    if 2 * T < x < 7 * T or 9 * T + 16 < x < 18 * T + 10 and y > 2 * T: continue
    if 17 * T + 20 < x < 20 * T: continue                                   # 北への小道
    cedar(d, x, y, R.uniform(0.8, 1.15))
# 百合と蔦(扉絵)
for (x, y) in [(8 * T, 3 * T + 20), (19 * T + 30, 2 * T + 30), (22 * T, 3 * T + 18), (24 * T + 10, 3 * T + 26)]:
    d.line((x, y, x + 6, y - 22), fill=(60, 110, 50), width=2); d.polygon([(x + 6, y - 22), (x - 2, y - 30), (x + 14, y - 32)], fill=(248, 246, 236), outline=(160, 150, 130))
# トンネル: 北の崖に口(cols 2-6、口の下は row 4)
fill(d, (1 * T + 16, 0, 7 * T + 16, 4 * T), (150, 146, 136), 0.08, 18)   # 坑門のコンクリート
d.rectangle((1 * T + 16, 0, 7 * T + 16, 10), fill=(120, 116, 108))
d.pieslice((2 * T + 16, 1 * T, 6 * T + 16, 6 * T), 180, 360, fill=(14, 12, 12))
d.rectangle((2 * T + 16, 3 * T + 16, 6 * T + 16, 4 * T + 4), fill=(14, 12, 12))
d.arc((2 * T + 12, 1 * T - 4, 6 * T + 20, 6 * T + 4), 180, 360, fill=(110, 106, 98), width=5)
d.rectangle((3 * T + 30, 1 * T + 10, 5 * T + 2, 1 * T + 24), fill=(170, 166, 156), outline=(90, 86, 80))   # 銘板(字はない)
# 道: トンネルから出て東へ(rows 4-8)、待避所(row 3, cols 10-17)
road(d, (2 * T + 16, 3 * T + 28, 6 * T + 16, 5 * T))
road(d, (0, 5 * T, W, 9 * T), line=7 * T, dash=True)
road(d, (10 * T, 3 * T, 18 * T, 5 * T))
d.rectangle((0, 5 * T, W, 5 * T + 3), fill=(140, 138, 134)); d.rectangle((10 * T, 3 * T, 18 * T, 3 * T + 3), fill=(140, 138, 134))
fill(d, (18 * T + 6, 0, 20 * T - 6, 3 * T), (150, 124, 86), 0.1, 16)     # 北への小道(ぼぎが燃料を運んでくる)
guardrail(d, 0, W, 9 * T + 6)
# 待避所に、ぽんぽんカーの焚き火の跡(桶は別の絵)と、燃料の薪
d.ellipse((15 * T, 4 * T + 6, 17 * T, 5 * T - 2), fill=(70, 64, 60))
for k in range(5): d.rectangle((17 * T + 4 + k * 5, 3 * T + 8, 17 * T + 7 + k * 5, 3 * T + 26), fill=(120, 80, 46), outline=(70, 44, 24))
a.save(O + 'pass.png')
grids['pass'] = [
    '##################..########',
    '##################..########',
    '###...############..########',
    '###...####..........########',
    '##..........................',
    '............................',
    '............................',
    '............................',
    '............................',
    '############################',
    '############################',
    '############################',
]

# ---------- B ドライブイン跡 28×14 ----------
W, H = 28 * T, 14 * T
b = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(b)
fill(d, (0, 0, W, H), DESERT, 0.08, 12)
# 北のはしに峠の杉(混ざる)
for i in range(16): cedar(d, R.randrange(0, 7 * T), R.randrange(16, T + 20), 0.9)
for i in range(6): cactus(d, R.randrange(23 * T, W - 10), R.randrange(T, 2 * T + 20))
# 駐車場のアスファルト(rows 5-11)、消えかけた白線
road(d, (0, 5 * T, W, 12 * T))
for x in range(4 * T, 20 * T, 2 * T): d.line((x, 10 * T, x, 12 * T - 4), fill=(200, 196, 186), width=2)
d.rectangle((0, 7 * T - 2, W, 7 * T + 2), fill=(200, 176, 80))
# ダイナー(cols 8-19, rows 1-4): 銀の外壁、赤い帯、大きな窓、平らな屋根
fill(d, (8 * T, T, 20 * T, 2 * T + 16), (200, 204, 208), 0.04, 30)       # 屋根
d.rectangle((8 * T, 2 * T + 16, 20 * T, 5 * T), fill=(214, 218, 222), outline=(110, 114, 118), width=2)
d.rectangle((8 * T, 2 * T + 22, 20 * T, 2 * T + 34), fill=(200, 50, 46))
for k in range(9):
    x = 8 * T + 12 + k * 42
    if 13 * T - 10 < x < 15 * T: continue
    d.rectangle((x, 3 * T + 6, x + 34, 4 * T + 20), fill=(70, 96, 110), outline=(60, 60, 64), width=2)
    d.line((x + 4, 3 * T + 10, x + 14, 3 * T + 20), fill=(150, 180, 190))
d.rectangle((13 * T + 8, 3 * T + 4, 14 * T + 24, 5 * T), fill=(60, 52, 48), outline=(40, 36, 34), width=2)    # 戸(閉じている)
for x in range(8 * T, 20 * T, 10): d.line((x, 4 * T + 26, x, 5 * T - 1), fill=(170, 174, 178))
shadow(b, [(20 * T, T + 6), (20 * T + 14, T + 14), (20 * T + 14, 5 * T + 8), (8 * T + 10, 5 * T + 8), (8 * T, 5 * T)])
# グーギーの看板の柱(cols 21-22): 細い柱、ブーメラン、星(ネオンは消えている、字はない)
d.rectangle((21 * T + 10, T, 21 * T + 18, 5 * T + 10), fill=(180, 60, 50), outline=(90, 30, 26))
d.polygon([(20 * T + 10, 2 * T), (23 * T + 20, T - 6), (23 * T + 6, T + 14), (21 * T, 2 * T + 18)], fill=(232, 206, 90), outline=(120, 96, 30))
d.polygon([(21 * T + 14, 0), (21 * T + 20, 12), (21 * T + 32, 14), (21 * T + 22, 22), (21 * T + 26, 34), (21 * T + 14, 26), (21 * T + 2, 34), (21 * T + 6, 22), (20 * T + 28, 14), (21 * T + 8, 12)], fill=(240, 240, 230), outline=(140, 140, 130))
for k in range(8): d.ellipse((20 * T + 18 + k * 12, 2 * T + 6 - k * 3, 20 * T + 22 + k * 12, 2 * T + 10 - k * 3), fill=(250, 250, 240))
# 給油所(cols 2-6, rows 2-5): 屋根と、二台の給油機
d.rectangle((3 * T + 14, 4 * T, 6 * T - 6, 4 * T + 22), fill=(170, 170, 170), outline=(90, 90, 90))
for x in (3 * T + 20, 5 * T + 4):
    d.rectangle((x, 3 * T + 10, x + 18, 4 * T + 14), fill=(200, 60, 50), outline=(90, 30, 26), width=2)
    d.ellipse((x + 3, 3 * T + 14, x + 15, 3 * T + 24), fill=(240, 236, 220)); d.line((x + 18, 3 * T + 20, x + 26, 4 * T + 12), fill=(30, 30, 30), width=2)
fill(d, (1 * T + 20, 1 * T + 10, 8 * T - 20, 2 * T + 22), (226, 226, 220), 0.04, 30)   # 給油所の屋根
d.rectangle((1 * T + 20, 2 * T + 16, 8 * T - 20, 2 * T + 24), fill=(200, 50, 46))
for x in (2 * T, 7 * T - 8): d.rectangle((x, 2 * T + 22, x + 6, 4 * T + 16), fill=(200, 200, 196), outline=(110, 110, 110))
# モーテルの矢印の看板(東、cols 24-26): 電球の並んだ矢印(字はない)
d.rectangle((25 * T + 4, 2 * T, 25 * T + 10, 5 * T), fill=(90, 90, 96))
d.polygon([(23 * T + 20, 2 * T + 6), (26 * T + 10, 2 * T + 6), (26 * T + 10, 1 * T + 26), (27 * T + 10, 2 * T + 22), (26 * T + 10, 3 * T + 18), (26 * T + 10, 3 * T + 6), (23 * T + 20, 3 * T + 6)], fill=(70, 150, 140), outline=(30, 70, 66))
for k in range(9): d.ellipse((23 * T + 26 + k * 10, 2 * T + 9, 23 * T + 30 + k * 10, 2 * T + 13), fill=(250, 240, 200))
# 南のはし(rows 12-13): 砂漠、サボテン、低い木の柵
for x in range(0, W, 26): d.rectangle((x, 12 * T + 2, x + 4, 12 * T + 18), fill=(130, 96, 60))
d.line((0, 12 * T + 8, W, 12 * T + 8), fill=(130, 96, 60), width=2)
for i in range(10): cactus(d, R.randrange(10, W - 10), 13 * T + R.randrange(10, 28))
for i in range(20): sage(d, R.randrange(0, W), R.randrange(12 * T + 24, H))
b.save(O + 'drivein.png')
grids['drivein'] = [
    '############################',
    '############################',
    '############################',
    '#..###.#############.#...#..',
    '#..###.#############.#...#..',
    '............................',
    '............................',
    '............................',
    '............................',
    '............................',
    '............................',
    '............................',
    '############################',
    '############################',
]

# ---------- C 旧国道の直線 28×12 ----------
W, H = 28 * T, 12 * T
c = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(c)
fill(d, (0, 0, W, H), DESERT, 0.08, 12)
for i in range(9): cactus(d, R.randrange(0, W), R.randrange(20, 2 * T))
for i in range(18): sage(d, R.randrange(0, W), R.randrange(T, 3 * T))
for x in range(T, W, 5 * T):                                                # 電柱(北)
    d.rectangle((x, 0, x + 5, 2 * T + 20), fill=(110, 80, 52)); d.rectangle((x - 12, 6, x + 17, 10), fill=(110, 80, 52))
d.line((0, 8, W, 12), fill=(50, 40, 34))
fill(d, (0, 3 * T, W, 5 * T), DIRT, 0.1, 14)                                  # 見物の路肩
road(d, (0, 5 * T, W, 9 * T), line=7 * T, dash=False)
d.rectangle((6 * T - 4, 5 * T, 6 * T + 4, 9 * T), fill=(240, 240, 236))      # スタートの白線
for k in range(1, 6): d.rectangle((6 * T + k * 4 * T, 5 * T + 4, 6 * T + k * 4 * T + 3, 5 * T + 10), fill=(220, 220, 214))
for x in range(0, 6 * T, 14): d.line((x + 10, 6 * T + R.randrange(-6, 30), x + 40, 6 * T + R.randrange(0, 40)), fill=(40, 36, 34), width=3)  # タイヤの跡
fill(d, (0, 9 * T, W, H), DIRT, 0.1, 14)
for i in range(14): sage(d, R.randrange(0, W), R.randrange(9 * T + 20, H))
for i in range(6): cactus(d, R.randrange(0, W), R.randrange(10 * T, H))
# 東は陽炎に溶ける(白っぽく)
ov = Image.new('RGBA', c.size, (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
for k in range(60): od.rectangle((20 * T + k * 4, 0, 20 * T + k * 4 + 4, H), fill=(250, 240, 220, int(200 * k / 60)))
c.alpha_composite(ov)
c.save(O + 'strip.png')
grids['strip'] = [
    '############################',
    '############################',
    '############################',
    '########################....',
    '............................',
    '............................',
    '............................',
    '............................',
    '............................',
    '############################',
    '############################',
    '############################',
]
for g in grids.values(): assert all(len(r) == 28 for r in g)
json.dump(grids, open(O + 'grids.json', 'w'), indent=1)
# 確かめ用: マスを重ねた絵
for n, im in (('pass', a), ('drivein', b), ('strip', c)):
    v = im.copy(); vd = ImageDraw.Draw(v, 'RGBA')
    for r, row in enumerate(grids[n]):
        for col, ch in enumerate(row):
            if ch == '#': vd.rectangle((col * T, r * T, col * T + T - 1, r * T + T - 1), fill=(255, 0, 0, 50))
    v.save(O + f'{n}_grid.png')
print('ok')
