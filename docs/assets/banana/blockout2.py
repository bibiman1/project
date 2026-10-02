# 南極のバナナ農園 下絵 第2版(2026-10-01)
# 「熱帯雨林に一日だけドカ雪が積もった」。どのマップも画面(15x9.4 マス)より大きくし、
# 出入口は踏み固めた雪の道が、密林の切れ目から画面の外へ続く絵にする。
# 当たり判定の表(grids.json)も、ここで置いた物の位置から書き出す。
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import random, math, json, os
T = 32
O = '/home/user/project/docs/assets/banana/v2/'
os.makedirs(O, exist_ok=True)

def shade(c, k): return tuple(max(0, min(255, int(v * k))) for v in c[:3])
SNOW = (236, 241, 248); SNOW_SH = (198, 210, 230); SNOW_DK = (170, 186, 214)
PATH = (196, 196, 204); PATH_DK = (164, 160, 168)
LEAF = (58, 132, 66); LEAF2 = (36, 96, 52); LEAF3 = (24, 70, 44); LEAF_HI = (110, 176, 88)
TRUNK = (112, 84, 62); TRUNK_DK = (78, 58, 44)
SEA = (34, 108, 120); SEA2 = (48, 128, 136)
STONE = (128, 118, 108)

class Grid:
    def __init__(s, c, r): s.c, s.r = c, r; s.g = [['.'] * c for _ in range(r)]
    def solid(s, c0, r0, c1=None, r1=None):
        c1 = c0 if c1 is None else c1; r1 = r0 if r1 is None else r1
        for r in range(max(0, r0), min(s.r, r1 + 1)):
            for c in range(max(0, c0), min(s.c, c1 + 1)): s.g[r][c] = '#'
    def clear(s, c0, r0, c1=None, r1=None):
        c1 = c0 if c1 is None else c1; r1 = r0 if r1 is None else r1
        for r in range(max(0, r0), min(s.r, r1 + 1)):
            for c in range(max(0, c0), min(s.c, c1 + 1)): s.g[r][c] = '.'
    def at(s, px, py): s.solid(int(px // T), int(py // T))
    def rows(s): return [''.join(r) for r in s.g]

def noise(d, box, base, var, n, size=2, rnd=None):
    rnd = rnd or random
    x0, y0, x1, y1 = [int(v) for v in box]
    for _ in range(n):
        x = rnd.randrange(x0, max(x0 + 1, x1)); y = rnd.randrange(y0, max(y0 + 1, y1))
        d.rectangle((x, y, x + size - 1, y + size - 1), fill=shade(base, 1 + rnd.uniform(-var, var)))

def blob(d, cx, cy, rw, rh, fill, rnd, n=14, j=0.25):
    pts = [(cx + math.cos(a) * rw * (1 - j + rnd.random() * j), cy + math.sin(a) * rh * (1 - j + rnd.random() * j))
           for a in [i * 2 * math.pi / n for i in range(n)]]
    d.polygon(pts, fill=fill); return pts

def snow_ground(img, rnd, box=None):
    d = ImageDraw.Draw(img)
    box = [int(v) for v in (box or (0, 0, img.width, img.height))]
    d.rectangle(box, fill=SNOW)
    noise(d, box, SNOW, 0.03, int((box[2] - box[0]) * (box[3] - box[1]) / 40), 2, rnd)
    # ふきだまりの青い影
    for _ in range(int((box[2] - box[0]) * (box[3] - box[1]) / 9000)):
        x = rnd.randrange(box[0], box[2]); y = rnd.randrange(box[1], box[3])
        d.arc((x, y, x + rnd.randrange(30, 80), y + rnd.randrange(8, 18)), 200, 340, fill=SNOW_SH, width=2)

def peek_plants(img, rnd, box, n):
    # 雪から顔を出す下草(シダ、赤い花)
    d = ImageDraw.Draw(img)
    box = [int(v) for v in box]
    for _ in range(n):
        x = rnd.randrange(box[0], box[2]); y = rnd.randrange(box[1], box[3])
        k = rnd.random()
        if k < 0.6:  # シダの葉先
            for a in (-40, -15, 15, 40):
                r = math.radians(a - 90); l = rnd.randrange(7, 12)
                d.line((x, y, x + math.cos(r) * l, y + math.sin(r) * l), fill=rnd.choice([LEAF, LEAF2]), width=2)
            d.ellipse((x - 6, y - 2, x + 6, y + 3), fill=SNOW)
        elif k < 0.85:  # ヘリコニア(赤い花)
            d.line((x, y, x, y - 12), fill=LEAF2, width=2)
            for j in range(3):
                yy = y - 4 - j * 4; dx = 4 if j % 2 else -4
                d.polygon([(x, yy), (x + dx, yy - 2), (x, yy - 3)], fill=(222, 60, 50))
            d.point((x, y - 13), fill=SNOW)
        else:  # 大きな葉が一枚、雪をのせて
            d.ellipse((x - 9, y - 6, x + 9, y + 4), fill=LEAF2)
            d.ellipse((x - 7, y - 7, x + 7, y - 1), fill=SNOW)

def shadow(img, box, a=70):
    m = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(m).ellipse(box, fill=(60, 70, 110, a)); img.alpha_composite(m)

def jungle_tree(img, x, y, r, rnd, trunk=True):
    """熱帯の大木。x,y は幹の根もと。r は樹冠の半径。樹冠の上半分に雪がのる"""
    if trunk:
        shadow(img, (x - r * 0.9, y - 8, x + r * 0.9, y + 10), 80)
        d = ImageDraw.Draw(img)
        tw = max(8, r // 4)
        d.polygon([(x - tw, y), (x - tw * 0.6, y - r * 0.9), (x + tw * 0.6, y - r * 0.9), (x + tw, y)], fill=TRUNK, outline=TRUNK_DK)
        for k in (-1, 1):  # 板根
            d.polygon([(x + k * tw * 0.4, y - 18), (x + k * (tw + 12), y + 2), (x + k * tw * 0.4, y + 2)], fill=shade(TRUNK, 0.9), outline=TRUNK_DK)
        d.line((x - 2, y - 4, x - 1, y - r * 0.85), fill=shade(TRUNK, 1.2), width=2)
        d.line((x + tw * 0.6 - 1, y - r * 0.7, x + tw * 0.6 - 1, y - 4), fill=(250, 252, 255), width=1)
    cy = y - r * 1.25
    lay = Image.new('RGBA', img.size, (0, 0, 0, 0)); ld = ImageDraw.Draw(lay)
    blobs = [(0, 0, 1.0)] + [(rnd.uniform(-0.6, 0.6), rnd.uniform(-0.45, 0.25), rnd.uniform(0.45, 0.7)) for _ in range(5)]
    for bx, by, s in blobs:
        blob(ld, x + bx * r, cy + by * r, r * s, r * s * 0.78, LEAF3, rnd)
    for bx, by, s in blobs:
        blob(ld, x + bx * r - 2, cy + by * r - 3, r * s * 0.82, r * s * 0.62, LEAF2, rnd)
    for bx, by, s in blobs[:4]:
        blob(ld, x + bx * r - 5, cy + by * r - 7, r * s * 0.45, r * s * 0.3, LEAF, rnd)
    # 雪: 各かたまりの上の縁にのる
    sn = Image.new('RGBA', img.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(sn)
    for bx, by, s in blobs:
        blob(sd, x + bx * r, cy + by * r - r * s * 0.55, r * s * 0.8, r * s * 0.3, SNOW, rnd, j=0.12)
        sd.arc((x + bx * r - r * s * 0.7, cy + by * r - r * s * 0.5, x + bx * r + r * s * 0.7, cy + by * r - r * s * 0.0), 20, 160, fill=SNOW_SH, width=2)
    sn.putalpha(ImageChops.multiply(sn.getchannel('A'), lay.getchannel('A')))
    lay.alpha_composite(sn)
    # 葉の粒
    ld = ImageDraw.Draw(lay)
    for _ in range(int(r * r / 6)):
        a = rnd.uniform(0, 6.28); rr = rnd.uniform(0.2, 0.95) * r
        px = x + math.cos(a) * rr; py = cy + math.sin(a) * rr * 0.7 + r * 0.15
        if lay.getpixel((int(px) % img.width, int(py) % img.height))[1] in (LEAF2[1], LEAF3[1]):
            ld.point((px, py), fill=shade(LEAF, rnd.uniform(0.8, 1.2)))
    # つる と つらら
    for _ in range(rnd.randint(1, 3)):
        vx = x + rnd.uniform(-0.7, 0.7) * r; vy0 = cy + r * 0.45; vy1 = vy0 + rnd.randrange(14, 30)
        ld.line((vx, vy0, vx + rnd.randint(-3, 3), vy1), fill=LEAF3, width=2)
        ld.polygon([(vx - 2, vy1), (vx + 2, vy1), (vx, vy1 + 7)], fill=(196, 226, 244))
    img.alpha_composite(lay)

def palm(img, x, y, h, rnd, lean=None):
    """ヤシ。x,y は根もと。葉の上に雪"""
    lean = rnd.uniform(-0.35, 0.35) if lean is None else lean
    shadow(img, (x - 18, y - 5, x + 18, y + 7), 70)
    d = ImageDraw.Draw(img)
    pts = [(x + lean * h * (i / 8) ** 1.6 * 1.0, y - h * i / 8) for i in range(9)]
    for i in range(8):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        w = 6 - i * 0.35
        d.polygon([(x0 - w, y0), (x1 - w + 0.6, y1), (x1 + w - 0.6, y1), (x0 + w, y0)], fill=(146, 118, 84), outline=(96, 74, 52))
        d.line((x0 - w + 1, y0 - 1, x0 + w - 1, y0 - 1), fill=(110, 86, 60))
    tx, ty = pts[-1]
    for a in [rnd.uniform(0, 360) for _ in range(2)] + [150, 200, 250, 290, 340, 30]:
        r = math.radians(a); l = h * rnd.uniform(0.42, 0.55)
        ex = tx + math.cos(r) * l; ey = ty + math.sin(r) * l * 0.55 + l * 0.25
        mx = (tx + ex) / 2; my = (ty + ey) / 2 - l * 0.22
        d.line([(tx, ty), (mx, my), (ex, ey)], fill=LEAF2, width=3)
        for t_ in [i / 7 for i in range(1, 7)]:
            px = (1 - t_) ** 2 * tx + 2 * (1 - t_) * t_ * mx + t_ ** 2 * ex
            py = (1 - t_) ** 2 * ty + 2 * (1 - t_) * t_ * my + t_ ** 2 * ey
            ll = 9 * (1 - t_ * 0.6)
            d.line((px, py, px - math.sin(r) * ll, py + math.cos(r) * ll * 0.6 + 4), fill=LEAF, width=2)
            d.line((px, py, px + math.sin(r) * ll, py - math.cos(r) * ll * 0.6 + 4), fill=LEAF2, width=2)
        d.line([(tx, ty - 2), (mx, my - 2), (ex, ey - 2)], fill=SNOW, width=2)  # 葉の背の雪
    d.ellipse((tx - 7, ty - 5, tx + 7, ty + 5), fill=(120, 96, 60))
    d.ellipse((tx - 6, ty - 7, tx + 6, ty - 1), fill=SNOW)

def banana(img, x, y, rnd, s=1.0):
    """バナナ。x,y は根もと(1 マス)。葉に雪"""
    shadow(img, (x - 24, y - 6, x + 26, y + 8))
    d = ImageDraw.Draw(img)
    d.rectangle((x - 5, y - 46, x + 5, y), fill=(120, 140, 70), outline=(84, 98, 50))
    d.line((x - 2, y - 44, x - 2, y - 2), fill=(150, 172, 90))
    rot = rnd.uniform(-18, 18)
    leaves = [(200, 40), (330, 40), (250, 44), (290, 44), (170, 36), (10, 36), (270, 30)]
    rnd.shuffle(leaves)
    for a, l in leaves[:rnd.randint(5, 7)]:
        a += rot; l *= s * rnd.uniform(0.85, 1.1)
        r = math.radians(a); tx = x + math.cos(r) * l; ty = y - 48 + math.sin(r) * l * 0.8
        nx = -math.sin(r) * 9; ny = math.cos(r) * 9 * 0.8
        c = rnd.choice([LEAF, LEAF2])
        d.polygon([(x, y - 48), (tx + nx, ty + ny), (tx, ty), (tx - nx, ty - ny)], fill=c, outline=shade(c, 0.7))
        d.line((x, y - 48, tx, ty), fill=shade(c, 1.25))
        # 雪は葉の上側の半分に
        up = (tx - nx, ty - ny) if ny > 0 else (tx + nx, ty + ny)
        d.polygon([(x, y - 49), up, (tx, ty - 1), ((x + tx) / 2, (y - 48 + ty) / 2 - 2)], fill=SNOW)
    d.rectangle((x + 5, y - 42, x + 17, y - 26), fill=(206, 196, 70), outline=(150, 140, 50))
    for j in range(3): d.line((x + 6, y - 39 + j * 4, x + 16, y - 39 + j * 4), fill=(230, 220, 110))
    d.rectangle((x + 5, y - 44, x + 17, y - 41), fill=SNOW)
    d.ellipse((x + 7, y - 26, x + 17, y - 14), fill=(120, 40, 70), outline=(80, 20, 50))

def penguin(d, x, y):
    d.ellipse((x + 2, y + 18, x + 18, y + 24), fill=(150, 160, 190))
    d.ellipse((x, y + 2, x + 20, y + 22), fill=(28, 30, 38)); d.ellipse((x + 5, y + 8, x + 15, y + 21), fill=(246, 246, 246))
    d.ellipse((x + 4, y - 4, x + 16, y + 8), fill=(28, 30, 38)); d.line((x + 6, y - 1, x + 14, y - 1), fill=(246, 246, 246), width=2)
    d.polygon([(x + 10, y + 2), (x + 16, y + 4), (x + 10, y + 5)], fill=(230, 90, 40)); d.rectangle((x + 5, y + 22, x + 8, y + 24), fill=(230, 120, 40)); d.rectangle((x + 12, y + 22, x + 15, y + 24), fill=(230, 120, 40))

def church(img, x, y):
    shadow(img, (x + 4, y + 196, x + 150, y + 226), 90)
    d = ImageDraw.Draw(img)
    LOG = (150, 98, 58)
    d.polygon([(x + 6, y + 120), (x + 64, y + 86), (x + 122, y + 120), (x + 64, y + 140)], fill=SNOW, outline=SNOW_DK)
    d.polygon([(x + 64, y + 140), (x + 122, y + 120), (x + 122, y + 132), (x + 64, y + 152)], fill=(96, 86, 80))
    d.rectangle((x + 10, y + 140, x + 118, y + 214), fill=LOG, outline=(90, 56, 30))
    for j in range(y + 144, y + 214, 8):
        d.line((x + 10, j, x + 118, j), fill=(118, 74, 40)); d.line((x + 10, j + 2, x + 118, j + 2), fill=(172, 118, 72))
    d.rectangle((x + 54, y + 176, x + 74, y + 214), fill=(70, 42, 24), outline=(40, 24, 12))
    for wx in (x + 22, x + 92): d.rectangle((wx, y + 160, wx + 12, y + 178), fill=(60, 70, 90), outline=(40, 26, 14))
    d.rectangle((x + 50, y + 40, x + 78, y + 100), fill=LOG, outline=(90, 56, 30))
    for j in range(y + 44, y + 100, 7): d.line((x + 50, j, x + 78, j), fill=(118, 74, 40))
    d.polygon([(x + 44, y + 42), (x + 64, y + 30), (x + 84, y + 42)], fill=SNOW)
    d.ellipse((x + 46, y + 2, x + 82, y + 40), fill=(150, 160, 160), outline=(90, 96, 96))
    d.chord((x + 46, y + 2, x + 82, y + 40), 190, 350, fill=SNOW)
    d.polygon([(x + 56, y + 6), (x + 64, y - 10), (x + 72, y + 6)], fill=(150, 160, 160), outline=(90, 96, 96))
    d.line((x + 64, y - 30, x + 64, y - 8), fill=(226, 184, 60), width=4); d.line((x + 56, y - 22, x + 72, y - 22), fill=(226, 184, 60), width=3); d.line((x + 58, y - 14, x + 70, y - 17), fill=(226, 184, 60), width=2)

def trodden_path(img, pts, w, rnd):
    """踏み固めた雪の道。pts はマスの座標。足跡つき"""
    d = ImageDraw.Draw(img)
    P = [(px * T, py * T) for px, py in pts]
    for i in range(len(P) - 1):
        d.line((P[i], P[i + 1]), fill=PATH, width=int(w * T))
        d.ellipse((P[i][0] - w * T / 2, P[i][1] - w * T / 2, P[i][0] + w * T / 2, P[i][1] + w * T / 2), fill=PATH)
    for i in range(len(P) - 1):
        (x0, y0), (x1, y1) = P[i], P[i + 1]
        n = int(math.hypot(x1 - x0, y1 - y0) / 9)
        for k in range(n):
            t_ = k / max(1, n); x = x0 + (x1 - x0) * t_; y = y0 + (y1 - y0) * t_
            ox = (5 if k % 2 else -5) + rnd.randint(-3, 3)
            d.ellipse((x + ox - 2, y - 3, x + ox + 2, y + 3), fill=PATH_DK)
    # 道の縁の雪の盛り上がり
    for i in range(len(P) - 1):
        (x0, y0), (x1, y1) = P[i], P[i + 1]
        L = math.hypot(x1 - x0, y1 - y0) or 1; nx = -(y1 - y0) / L; ny = (x1 - x0) / L
        for sgn in (-1, 1):
            o = sgn * w * T / 2
            d.line((x0 + nx * o, y0 + ny * o, x1 + nx * o, y1 + ny * o), fill=SNOW_SH, width=2)

# ---- 前後の重なり用: 背の高い物を描いたときに変わった画素を、根もとの高さと一緒に覚えておく ----
# (きーが根もとより奥にいるときは、この部分をきーの上に重ねて描く。影は含めない)
import numpy as np
FG = {}            # マップ名 -> [(mask, base_y)]
CUR = [None]       # いま描いているマップ
_after_shadow = [None]
_shadow0 = shadow
def shadow(img, box, a=70):
    _shadow0(img, box, a)
    _after_shadow[0] = np.asarray(img).copy()
def _take(img, ref, base):
    m = np.any(np.asarray(img) != ref, axis=2)
    m[int(base):, :] = False
    if m.any(): FG.setdefault(CUR[0], []).append((m, int(base)))
def _rec(fn, base_of):
    def w(img, *a, **k):
        base = base_of(*a, **k)
        if CUR[0] is None or base is None: return fn(img, *a, **k)
        before = np.asarray(img).copy(); _after_shadow[0] = None
        r = fn(img, *a, **k)
        _take(img, _after_shadow[0] if _after_shadow[0] is not None else before, base)
        return r
    return w
banana = _rec(banana, lambda x, y, *r, **k: y)
palm = _rec(palm, lambda x, y, *r, **k: y)
jungle_tree = _rec(jungle_tree, lambda x, y, r, rnd, trunk=True: y if trunk else None)
def _block_start(img): _after_shadow[0] = None; return np.asarray(img).copy()
def _block_end(img, before, base):
    _take(img, _after_shadow[0] if _after_shadow[0] is not None else before, base)

# ===================== A 浜 28x11 =====================
CUR[0] = 'shore'
R = random.Random(21)
W, H = 28 * T, 11 * T
a = Image.new('RGBA', (W, H)); snow_ground(a, R)
ga = Grid(28, 11)
d = ImageDraw.Draw(a)
# 南: あたたかい海(雪は水に落ちて消える)
SEA_Y = 8 * T
d.rectangle((0, SEA_Y, W, H), fill=SEA)
for j in range(SEA_Y, H, 6): d.line((0, j, W, j), fill=SEA2 if (j // 6) % 2 else SEA)
for _ in range(60):
    x = R.randrange(0, W); y = R.randrange(SEA_Y + 8, H - 4)
    d.line((x, y, x + R.randrange(8, 20), y), fill=(110, 170, 176))
# 波打ち際(砂利の上に雪)
pts = [(x, SEA_Y - 6 + math.sin(x / 40) * 4) for x in range(0, W + 8, 8)]
d.polygon(pts + [(W, SEA_Y + 4), (0, SEA_Y + 4)], fill=(150, 140, 128))
noise(d, (0, SEA_Y - 10, W, SEA_Y + 4), (150, 140, 128), 0.2, 900, 2, R)
d.line(pts, fill=SNOW, width=3)
d.line([(x, y + 12) for x, y in pts], fill=(220, 240, 240), width=2)
ga.solid(0, 8, 27, 10)
# 北: 密林のへり(真ん中に農園へ続く道の切れ目)
trodden_path(a, [(14, -0.5), (14, 3), (14, 8.2)], 1.6, R)
for cx in [0.5, 2.3, 4.2, 6.0, 7.9, 9.8, 11.6, 16.4, 18.2, 20.1, 22.0]:
    jungle_tree(a, cx * T + R.randint(-6, 6), 2.6 * T + R.randint(-4, 6), R.randrange(34, 46), R)
ga.solid(0, 0, 12, 2); ga.solid(15, 0, 22, 2)
# 浜のヤシ
for (px, py) in [(3.0, 6.6), (7.5, 7.0), (10.4, 5.4), (17.2, 6.8), (20.6, 5.8)]:
    palm(a, px * T, py * T, R.randrange(70, 92), R)
    ga.at(px * T, py * T - 4)
peek_plants(a, R, (0, 3.2 * T, 22 * T, 7.6 * T), 70)
# 東の岩の丘と木造の教会
d = ImageDraw.Draw(a)
d.polygon([(22 * T, 8 * T), (22.4 * T, 5.4 * T), (23.6 * T, 3.0 * T), (W, 2.6 * T), (W, 8 * T)], fill=STONE, outline=(90, 84, 78))
noise(d, (22.6 * T, 3 * T, W, 8 * T), STONE, 0.15, 500, 3, R)
for _ in range(14):
    x = R.randrange(int(22.6 * T), W); y = R.randrange(int(3.2 * T), int(7.6 * T))
    blob(d, x, y, R.randrange(10, 24), R.randrange(4, 8), SNOW, R)
jungle_tree(a, 25.6 * T, 2.0 * T, 40, R)
cimg = Image.new('RGBA', (160, 270), (0, 0, 0, 0)); church(cimg, 6, 38)
cimg = cimg.resize((int(160 * 0.62), int(270 * 0.62)), Image.LANCZOS)
a.alpha_composite(cimg, (int(23.4 * T), int(2.2 * T)))
ga.solid(22, 0, 27, 7); ga.solid(23, 3, 27, 7)
# ペンギン(暑さにも雪にも慣れない顔で、海の近くに寄っている)
d = ImageDraw.Draw(a)
for i in range(7): penguin(d, 17 * T + (i % 4) * 28 + R.randrange(-4, 4), int(4.0 * T) + (i // 4) * 30 + R.randrange(-4, 4))
# 桟橋(南の入口)
d.rectangle((13 * T + 6, SEA_Y - 6, 15 * T - 6, H), fill=(146, 112, 78), outline=(90, 66, 44))
for j in range(SEA_Y, H, 10): d.line((13 * T + 6, j, 15 * T - 6, j), fill=(110, 82, 56))
d.rectangle((13 * T + 6, SEA_Y - 6, 15 * T - 6, SEA_Y - 2), fill=SNOW)
for j in range(SEA_Y + 4, H, 20): d.rectangle((13 * T + 9, j, 15 * T - 9, j + 3), fill=SNOW)
for px in (13 * T + 6, 15 * T - 12): d.rectangle((px, H - 24, px + 6, H), fill=(80, 60, 40))
ga.clear(13, 8, 14, 10); ga.clear(13, 0, 14, 2)
a.save(O + 'shore.png')

# ===================== B 第三バナナ農園 28x14 =====================
CUR[0] = 'farm'
R = random.Random(22)
W, H = 28 * T, 14 * T
b = Image.new('RGBA', (W, H)); snow_ground(b, R)
gb = Grid(28, 14)
# 道: 南の浜へ(中央)と、北西の用水路へ
trodden_path(b, [(14, 14.5), (14, 8), (12.5, 8), (12.5, 3.2), (7, 3.2), (4.5, 1.5), (4.5, -0.5)], 1.5, R)
trodden_path(b, [(14, 8), (14, 3.2), (12.5, 3.2)], 1.5, R)
# 北のへり: 密林(北西に切れ目)
for cx in [0.6, 8.0, 10.0, 12.0, 14.0, 16.0, 18.0, 20.0, 22.0, 24.0, 26.0, 27.6]:
    jungle_tree(b, cx * T + R.randint(-6, 6), 1.0 * T + R.randint(-2, 4), R.randrange(26, 34), R)
gb.solid(0, 0, 1, 0); gb.solid(7, 0, 27, 0)
# 東と西のへりに大木
for (cx, cy) in [(0.3, 5.0), (0.2, 9.5), (27.7, 4.4), (27.8, 9.2), (0.4, 13.6), (27.5, 13.8)]:
    jungle_tree(b, cx * T, cy * T, R.randrange(32, 40), R)
    gb.at(min(W - 1, max(0, cx * T)), min(H - 1, cy * T - 4))
# バナナの列
rr = random.Random(5)
rows = [2.2, 5.4, 9.2, 12.4]
for ry in rows:
    for cx in list(range(1, 12, 2)) + list(range(17, 27, 2)):
        if 16 <= cx <= 25 and 4 <= ry <= 9: continue
        if 16 <= cx <= 21 and ry == 9.2: continue  # 撮影隊(ききこり・ごろん)の立つ所をあける
        if rr.random() < 0.12: continue
        x = cx * T + T // 2 + rr.randint(-5, 5); y = int(ry * T) + rr.randint(-3, 3)
        c_, r_ = x // T, (y - 6) // T
        on_path = (3 <= c_ <= 6 and r_ <= 3) or (4 <= c_ <= 14 and 2 <= r_ <= 4) or (11 <= c_ <= 15 and 2 <= r_ <= 9) or (12 <= c_ <= 15 and r_ >= 7)
        if on_path: continue
        banana(b, x, y, rr, rr.uniform(0.85, 1.15))
        gb.at(x, y - 6)
peek_plants(b, R, (0, T, W, H), 80)
# 農具小屋(東)
d = ImageDraw.Draw(b)
x0, y0 = 21 * T, 4 * T
_bk = _block_start(b)
shadow(b, (x0 + 10, y0 + 90, x0 + 150, y0 + 110), 80)
d = ImageDraw.Draw(b)
d.polygon([(x0, y0 + 30), (x0 + 64, y0), (x0 + 128, y0 + 30)], fill=SNOW, outline=SNOW_DK)
d.line((x0, y0 + 30, x0 + 128, y0 + 30), fill=(150, 70, 50), width=4)
d.rectangle((x0 + 4, y0 + 32, x0 + 124, y0 + 96), fill=(170, 130, 86), outline=(100, 70, 40))
for i in range(x0 + 10, x0 + 124, 12): d.line((i, y0 + 34, i, y0 + 96), fill=(146, 108, 70))
d.rectangle((x0 + 50, y0 + 58, x0 + 76, y0 + 96), fill=(96, 66, 40)); d.rectangle((x0 + 90, y0 + 48, x0 + 112, y0 + 66), fill=(70, 86, 106), outline=(90, 60, 30))
for i in range(x0 + 6, x0 + 124, 9): d.polygon([(i, y0 + 32), (i + 4, y0 + 32), (i + 2, y0 + 40)], fill=(200, 230, 246))
_block_end(b, _bk, y0 + 96)
gb.solid(21, 5, 24, 6)
# 撮影の道具(小屋の西、きこりの道に掛からない所)
cx, cy = int(18.2 * T), int(4.2 * T)
_bk = _block_start(b)
d.line((cx, cy + 30, cx - 10, cy + 60), fill=(40, 40, 40), width=3); d.line((cx, cy + 30, cx + 10, cy + 60), fill=(40, 40, 40), width=3); d.line((cx, cy + 30, cx, cy + 62), fill=(40, 40, 40), width=3)
d.rectangle((cx - 18, cy + 8, cx + 22, cy + 32), fill=(70, 72, 78), outline=(30, 30, 34)); d.rectangle((cx - 30, cy + 14, cx - 18, cy + 26), fill=(40, 42, 48)); d.ellipse((cx - 34, cy + 14, cx - 26, cy + 26), fill=(90, 120, 160))
d.rectangle((cx - 18, cy + 6, cx + 22, cy + 10), fill=SNOW)
d.ellipse((cx + 12, cy + 10, cx + 18, cy + 16), fill=(230, 40, 40))
d.ellipse((cx + 34, cy - 6, cx + 74, cy + 34), fill=(226, 228, 232), outline=(150, 150, 156)); d.line((cx + 54, cy + 34, cx + 54, cy + 64), fill=(60, 60, 60), width=2)
d.polygon([(cx - 60, cy + 4), (cx - 40, cy - 2), (cx - 40, cy + 22), (cx - 60, cy + 16)], fill=(250, 240, 200), outline=(120, 110, 80)); d.line((cx - 50, cy + 20, cx - 50, cy + 62), fill=(60, 60, 60), width=2)
d.line([(cx, cy + 60), (cx + 30, cy + 80), (cx + 90, cy + 74), (x0 + 10, y0 + 90)], fill=(30, 30, 30), width=2)
_block_end(b, _bk, cy + 62)
gb.solid(16, 5, 20, 5)
# 看板(南の道のわき)
sx, sy = 15 * T + 8, 11 * T + 8
_bk = _block_start(b)
d.rectangle((sx + 6, sy + 20, sx + 10, sy + 54), fill=(100, 70, 40)); d.rectangle((sx + 54, sy + 20, sx + 58, sy + 54), fill=(100, 70, 40))
d.rectangle((sx, sy, sx + 64, sy + 28), fill=(226, 206, 160), outline=(110, 80, 50), width=2)
d.rectangle((sx, sy - 4, sx + 64, sy + 2), fill=SNOW)
for k in range(5): d.rectangle((sx + 6 + k * 11, sy + 8, sx + 14 + k * 11, sy + 18), fill=(60, 40, 30))
_block_end(b, _bk, sy + 54)
gb.solid(15, 13, 16, 13)
gb.clear(13, 7, 14, 13); gb.clear(4, 0, 5, 3); gb.clear(5, 3, 13, 3); gb.clear(12, 3, 13, 8)
b.save(O + 'farm.png')

# ===================== C 雪に埋もれかけた用水路 28x10 =====================
CUR[0] = 'canal'
R = random.Random(23)
W, H = 28 * T, 10 * T
c = Image.new('RGBA', (W, H)); snow_ground(c, R)
gc = Grid(28, 10)
d = ImageDraw.Draw(c)
# 水路(東西に流れる。ふちに雪のひさし)
WY0, WY1 = 4 * T + 6, 6 * T - 6
top = [(x, WY0 + math.sin(x / 55) * 4) for x in range(0, W + 8, 8)]
bot = [(x, WY1 + math.sin(x / 47 + 1) * 4) for x in range(0, W + 8, 8)]
d.polygon(top + bot[::-1], fill=(52, 92, 108))
for _ in range(90):
    x = R.randrange(0, W); y = R.randrange(WY0 + 6, WY1 - 4)
    d.line((x, y, x + R.randrange(10, 28), y), fill=(84, 130, 144))
for _ in range(25):  # 流れていく雪のかたまり
    x = R.randrange(0, W); y = R.randrange(WY0 + 8, WY1 - 8)
    blob(d, x, y, R.randrange(5, 10), R.randrange(3, 5), (226, 236, 246), R)
d.line(top, fill=SNOW, width=5); d.line([(x, y + 4) for x, y in top], fill=(36, 70, 86), width=3)
d.line(bot, fill=(120, 150, 170), width=2); d.line([(x, y + 3) for x, y in bot], fill=SNOW, width=4)
gc.solid(0, 4, 27, 5)
# 丸木橋
bx = 12 * T
d.rectangle((bx + 4, 3.6 * T, bx + 2 * T - 4, 6.5 * T), fill=(132, 100, 70), outline=(84, 62, 42))
for i in range(4): d.line((bx + 4 + i * 14, 3.6 * T, bx + 4 + i * 14, 6.5 * T), fill=(104, 78, 54))
d.rectangle((bx + 6, 3.6 * T, bx + 2 * T - 6, 3.6 * T + 5), fill=SNOW)
for j in range(int(3.8 * T), int(6.4 * T), 22): d.ellipse((bx + 14, j, bx + 24, j + 6), fill=SNOW)
gc.clear(12, 4, 13, 5)
# 道: 南西(農園から)→ 橋 → 北東(段々へ)
trodden_path(c, [(4.5, 10.5), (4.5, 7.3), (12.9, 7.3), (12.9, 6.6)], 1.4, R)
trodden_path(c, [(12.9, 3.4), (12.9, 2.6), (25.5, 2.6), (25.5, -0.5)], 1.4, R)
# 北と南のへりの密林、岸の木
for cx in [0.5, 2.4, 4.4, 6.3, 8.3, 10.3, 12.3, 14.3, 16.2, 18.2, 20.2, 22.2]:
    jungle_tree(c, cx * T + R.randint(-5, 5), 1.0 * T + R.randint(-2, 4), R.randrange(26, 34), R)
jungle_tree(c, 27.6 * T, 1.2 * T, 30, R)
gc.solid(0, 0, 23, 0); gc.solid(27, 0, 27, 1)
for cx in [0.4, 7.6, 9.6, 11.4, 15.6, 17.6, 19.6, 21.6, 23.6, 25.6, 27.6]:
    jungle_tree(c, cx * T + R.randint(-4, 4), 9.9 * T, R.randrange(30, 38), R)
gc.solid(0, 9, 2, 9); gc.solid(7, 9, 27, 9)
for (px, py) in [(2.0, 3.4), (8.0, 2.0), (17.6, 3.6), (21.4, 3.7), (7.6, 7.8), (18.5, 7.6), (23.8, 7.0)]:
    if (px, py) in [(8.0, 2.0)]:
        jungle_tree(c, px * T, py * T, 26, R)
    else:
        palm(c, px * T, py * T, R.randrange(64, 84), R)
    gc.at(px * T, py * T - 4)
peek_plants(c, R, (0, 1.4 * T, W, 3.8 * T), 40)
peek_plants(c, R, (0, 6.4 * T, W, 9.2 * T), 40)
gc.clear(3, 6, 5, 9); gc.clear(24, 0, 26, 2); gc.clear(5, 7, 12, 7); gc.clear(13, 2, 25, 2)
c.save(O + 'canal.png')

# ===================== D 雪の棚田とマンゴーの丘 16x20 =====================
CUR[0] = 'steps'
R = random.Random(24)
W, H = 16 * T, 20 * T
e = Image.new('RGBA', (W, H)); snow_ground(e, R)
gd = Grid(16, 20)
d = ImageDraw.Draw(e)
# 北の空: 白夜の空と、輪のある割れた月。遠くの雪をかぶった密林の山
d.rectangle((0, 0, W, 2 * T), fill=(214, 220, 236))
for i in range(0, 2 * T, 4): d.line((0, i, W, i), fill=shade((214, 220, 236), 1 - i / 600))
d.ellipse((W - 92, 10, W - 60, 42), fill=(250, 250, 246)); d.polygon([(W - 76, 10), (W - 70, 26), (W - 78, 42)], fill=(214, 220, 236))
d.arc((W - 116, 20, W - 36, 34), 0, 360, fill=(196, 196, 214), width=2)
for cx in range(-10, W + 40, 34):
    jungle_tree(e, cx + R.randint(-6, 6), 2.2 * T, R.randrange(22, 30), R, trunk=False)
# 棚田: 上から 3 段。石垣の崖(高さ 1 マス)に雪、段の上は雪に埋まった田んぼ(稲の先が出る)
def terrace(img, x0, y0, w, h, face=T):
    d = ImageDraw.Draw(img)
    d.rectangle((x0, y0, x0 + w, y0 + h), fill=SNOW)
    noise(d, (x0, y0, x0 + w, y0 + h), SNOW, 0.03, int(w * h / 50), 2, R)
    for yy in range(int(y0 + 10), int(y0 + h - 4), 10):  # あぜと稲の先
        for xx in range(int(x0 + 8), int(x0 + w - 6), 7):
            if R.random() < 0.55: d.line((xx, yy, xx + R.randint(-1, 1), yy - 4), fill=rnd_leaf())
    d.rectangle((x0, y0 + h, x0 + w, y0 + h + face), fill=(132, 118, 104))
    for yy in range(int(y0 + h + 4), int(y0 + h + face), 9):
        off = 0 if (yy // 9) % 2 else 9
        for xx in range(int(x0 + off), int(x0 + w), 18):
            d.rectangle((xx, yy, xx + 16, yy + 7), fill=shade((132, 118, 104), R.uniform(0.85, 1.15)), outline=(96, 86, 76))
    d.rectangle((x0, y0 + h - 2, x0 + w, y0 + h + 5), fill=SNOW)
    for xx in range(int(x0 + 4), int(x0 + w), 12):  # つらら
        d.polygon([(xx, y0 + h + 5), (xx + 4, y0 + h + 5), (xx + 2, y0 + h + 5 + R.randrange(5, 12))], fill=(200, 228, 246))
    m = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(m).rectangle((x0, y0 + h + face, x0 + w, y0 + h + face + 10), fill=(60, 80, 120, 60)); img.alpha_composite(m)
def rnd_leaf(): return R.choice([LEAF, LEAF2, LEAF_HI])
terrace(e, 1 * T, 11 * T, 14 * T, 3 * T)   # 段 1(11〜13 行が上面、14 行が崖)
terrace(e, 2 * T, 7 * T, 12 * T, 3 * T)    # 段 2(7〜9 行、10 行が崖)
terrace(e, 3 * T, 3 * T, 10 * T, 3 * T)    # 段 3(3〜5 行、6 行が崖。マンゴーの木)
# 西と東のへり: 密林の斜面
for (cx, cy, r) in [(0.4, 6.0, 30), (0.2, 10.4, 30), (0.5, 15.0, 32), (0.3, 19.6, 30), (15.6, 6.2, 30), (15.8, 10.6, 30), (15.5, 15.2, 32), (15.7, 19.8, 30), (1.6, 8.6, 22), (14.4, 8.8, 22)]:
    jungle_tree(e, cx * T, cy * T, r, R)
for (px, py) in [(3.2, 17.4), (12.6, 17.0), (2.6, 13.2), (13.4, 13.0)]:
    palm(e, px * T, py * T, R.randrange(60, 74), R)
# マンゴーの大木(段 3 の上)
mx, my = 7 * T, 7 * T + 4
_bk = _block_start(e)
shadow(e, (mx - 80, my - 12, mx + 80, my + 14), 80)
d = ImageDraw.Draw(e)
d.polygon([(mx - 12, my), (mx - 8, my - 70), (mx + 10, my - 70), (mx + 14, my)], fill=(112, 82, 58), outline=(80, 58, 40))
d.line((mx - 4, my - 66, mx - 2, my - 4), fill=(140, 106, 78), width=2)
jungle_tree(e, mx, my - 30, 74, R, trunk=False)
d = ImageDraw.Draw(e)
for px, py in [(-58, -96), (-30, -84), (30, -88), (58, -104), (-70, -116), (12, -78), (-8, -92)]:
    d.line((mx + px, my + py - 10, mx + px, my + py), fill=(90, 80, 40))
    d.ellipse((mx + px - 6, my + py, mx + px + 6, my + py + 14), fill=(236, 150, 40), outline=(170, 80, 30))
    d.ellipse((mx + px - 5, my + py + 2, mx + px - 1, my + py + 7), fill=(220, 70, 50))
    d.rectangle((mx + px - 4, my + py - 1, mx + px + 4, my + py + 2), fill=SNOW)
_block_end(e, _bk, my)
peek_plants(e, R, (1 * T, 15.4 * T, 15 * T, 19.4 * T), 30)
# 南の入口の道
trodden_path(e, [(8, 20.5), (8, 16.2)], 1.4, R)
# 当たり判定(旧版の 14 幅を 1 列ずらしたもの)
for r in range(20):
    for col in range(16):
        s = (r <= 6 or (7 <= r <= 10 and (col < 3 or col > 12 or r == 10)) or
             (11 <= r <= 14 and (col < 2 or col > 13 or r == 14)) or
             (r >= 15 and (col < 1 or col > 14)) or (r == 7 and col in (6, 7)))
        if s: gd.solid(col, r)
for (px, py) in [(3.2, 17.4), (12.6, 17.0)]: gd.at(px * T, py * T - 4)
e.save(O + 'steps.png')

json.dump({'shore': ga.rows(), 'farm': gb.rows(), 'canal': gc.rows(), 'steps': gd.rows()}, open(O + 'grids.json', 'w'), indent=1)

# まとめ(確認用)。当たり判定を赤くかぶせた版も
def overlay(im, g):
    o = im.copy(); m = Image.new('RGBA', im.size, (0, 0, 0, 0)); md = ImageDraw.Draw(m)
    for r, row in enumerate(g.rows()):
        for col, ch in enumerate(row):
            if ch == '#': md.rectangle((col * T, r * T, col * T + T - 1, r * T + T - 1), fill=(255, 0, 0, 70))
    o.alpha_composite(m); return o
for name, im, g in [('shore', a, ga), ('farm', b, gb), ('canal', c, gc), ('steps', e, gd)]:
    overlay(im, g).save(O + name + '_grid.png')
sheet = Image.new('RGB', (28 * T + 16 * T + 30, (11 + 14 + 10) * T + 40), (245, 240, 228))
yy = 0
for im in (c, b, a):
    sheet.paste(im, (0, yy)); yy += im.height + 20
sheet.paste(e, (28 * T + 30, 0))
sheet.save(O + 'blockout_all.png')
print('ok')

# ---- 前後の重なり用の絵(fg_*.png)と、物ごとの位置と根もと(fg.json) ----
# 仕上げ済みの背景(PixelLab)から、下絵で覚えた形のところだけを一つずつ切り出し、横に並べた一枚の絵にする。
# 形は 1 画素ふくらませる。fg.json の一件は [絵の中の x, y, 幅, 高さ, マップの x, y, 根もとの y]
from PIL import ImageFilter as _IF
FA = '/home/user/project/field/assets/worlds/banana/'
fgj = {}
for name, items in FG.items():
    bg = Image.open(FA + 'bg_' + name + '.png').convert('RGBA')
    crops = []
    for m, base in sorted(items, key=lambda v: v[1]):
        mi = Image.fromarray((m * 255).astype('uint8')).filter(_IF.MaxFilter(3))
        ma = np.asarray(mi) > 0; ma[base:, :] = False
        ys, xs = np.where(ma)
        if len(xs) == 0: continue
        x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
        c = Image.new('RGBA', (x1 - x0, y1 - y0), (0, 0, 0, 0))
        c.paste(bg.crop((x0, y0, x1, y1)), (0, 0), Image.fromarray((ma[y0:y1, x0:x1] * 255).astype('uint8')))
        crops.append((c, x0, y0, base))
    # 棚に詰める(幅 1024)
    AW = 1024; ax = ay = rowh = 0; lst = []
    for c, x0, y0, base in crops:
        if ax + c.width > AW: ax = 0; ay += rowh + 1; rowh = 0
        lst.append([ax, ay, c.width, c.height, x0, y0, base]); ax += c.width + 1; rowh = max(rowh, c.height)
    atlas = Image.new('RGBA', (AW, ay + rowh), (0, 0, 0, 0))
    for (c, *_), e_ in zip(crops, lst): atlas.paste(c, (e_[0], e_[1]))
    atlas.save(FA + 'fg_' + name + '.png', optimize=True)
    fgj[name] = lst
json.dump(fgj, open(O + 'fg.json', 'w'))
print('fg', {k: len(v) for k, v in fgj.items()})
