# 直線の下絵 第 2 版(D140): 競争の画面と同じドラッグストリップ。斜め上から見下ろす角度、真昼(影は短く南東へ)
# 歩けるマスは第 1 版と同じ(grids.json の strip)。北の 0〜2 段: 空っぽの木のスタンド(線路を向いて北へ上がる)。3〜4 段: 路肩(野犬たちが並ぶ)。
# 5〜8 段: 2 車線の舗装、まん中に白い車線の境、外に白い線。スタートの白線は x = 9 マス(並んだマシンの前)。その手前はバーンナウトの黒いタイヤの跡。
# 9 段: コンクリートの低い壁。10〜11 段: 南のスタンド(上から見ると腰かけの板が並ぶ)。東のはし: ゴールの白黒の線と、計時の小屋(北)。陽炎はやめる。
# 色は競争の画面(スタイルフレーム)に寄せる
from PIL import Image, ImageDraw
import random
T = 32; W, H = 28 * T, 12 * T
R = random.Random(11)
ASP = (96, 88, 92); ASPD = (78, 72, 76); LINE = (240, 236, 228); SAND = (222, 184, 138); DIRT = (200, 164, 120)
WTOP = (184, 146, 106); WRIS = (112, 82, 62); WDK = (82, 58, 44); RAIL = (80, 72, 70); CON = (176, 170, 160); COND = (130, 124, 116)
BAN = [(190, 56, 46), (230, 200, 80), (60, 110, 160), (230, 230, 220)]
def sh(c, k): return tuple(max(0, min(255, int(v * k))) for v in c)
im = Image.new('RGB', (W, H), SAND); d = ImageDraw.Draw(im)
for _ in range(2500):
    x, y = R.randrange(W), R.randrange(H); d.point((x, y), fill=sh(SAND, R.uniform(0.9, 1.06)))
def stands(y0, y1, facing_south=True, gaps=()):
    # 腰かけの段(上から見ると、明るい板の面と暗いけこみが交互)
    rows = int((y1 - y0) / 10)
    for k in range(rows):
        yy = y0 + k * 10
        d.rectangle((0, yy, W, yy + 6), fill=sh(WTOP, R.uniform(0.95, 1.05)))
        d.rectangle((0, yy + 6, W, yy + 9), fill=WRIS if facing_south else WDK)
        for x in range(0, W, 16): d.line((x + R.randrange(0, 4), yy, x + R.randrange(0, 4), yy + 6), fill=sh(WTOP, 0.88))  # 板のつぎ目
    for gx in gaps:  # 通路(階段)
        d.rectangle((gx, y0, gx + 20, y1), fill=COND)
        for yy in range(int(y0), int(y1), 5): d.line((gx, yy, gx + 20, yy), fill=sh(COND, 0.8))
# 北のスタンド(0〜2.6 段)、前に手すりと横断幕(字なし)
stands(0, int(2.6 * T), True, gaps=(5 * T, 13 * T, 21 * T))
d.rectangle((0, int(2.6 * T), 24 * T, int(2.6 * T) + 4), fill=RAIL)
for x in range(0, 24 * T, 2 * T): d.rectangle((x, int(2.6 * T) - 10, x + 3, int(2.6 * T) + 4), fill=RAIL)
for i, x in enumerate(range(T, 23 * T, 4 * T)):
    d.rectangle((x, int(2.6 * T) + 4, x + 2 * T, int(2.6 * T) + 14), fill=BAN[i % 4], outline=sh(BAN[i % 4], 0.6))
# 計時の小屋(北東、24〜27 段の上)
d.rectangle((24 * T + 10, 4, 27 * T + 10, int(2.4 * T)), fill=(210, 204, 192), outline=(90, 84, 80))
d.rectangle((24 * T + 10, 4, 27 * T + 10, 22), fill=(170, 60, 50))
for x in range(24 * T + 24, 27 * T, 22): d.rectangle((x, 34, x + 14, 50), fill=(60, 70, 90))
# 路肩(3〜4 段)
d.rectangle((0, 3 * T, W, 5 * T), fill=DIRT)
for _ in range(900):
    x, y = R.randrange(W), R.randrange(3 * T, 5 * T); d.point((x, y), fill=sh(DIRT, R.uniform(0.88, 1.08)))
# 舗装(5〜9 段)
d.rectangle((0, 5 * T, W, 9 * T), fill=ASP)
for _ in range(4000):
    x, y = R.randrange(W), R.randrange(5 * T, 9 * T); d.point((x, y), fill=sh(ASP, R.uniform(0.86, 1.1)))
for _ in range(40):  # ひび
    x, y = R.randrange(W), R.randrange(5 * T, 9 * T)
    for s in range(R.randrange(3, 8)):
        x2, y2 = x + R.randrange(-14, 15), y + R.randrange(-8, 9); d.line((x, y, x2, y2), fill=ASPD); x, y = x2, y2
d.rectangle((0, 5 * T + 2, W, 5 * T + 5), fill=LINE); d.rectangle((0, 9 * T - 5, W, 9 * T - 2), fill=LINE)
d.rectangle((0, 7 * T - 2, W, 7 * T + 1), fill=LINE)                                     # 車線の境
# バーンナウトの黒いタイヤの跡(スタートの手前、2 車線とも)
for lane in (6 * T, 8 * T):
    for k in range(10):
        y = lane + R.randrange(-14, 10)
        d.line((R.randrange(0, 2 * T), y, 9 * T - R.randrange(4, 30), y + R.randrange(-3, 4)), fill=(34, 30, 32), width=R.choice((2, 3)))
d.rectangle((9 * T - 3, 5 * T + 5, 9 * T + 3, 9 * T - 5), fill=LINE)                      # スタートの白線
# ゴール(東のはし): 白黒の市松の線
for k in range(16):
    y = 5 * T + 5 + k * 7
    if y > 9 * T - 6: break
    d.rectangle((25 * T, y, 25 * T + 7, y + 6), fill=LINE if k % 2 == 0 else (30, 28, 30))
    d.rectangle((25 * T + 7, y, 25 * T + 14, y + 6), fill=(30, 28, 30) if k % 2 == 0 else LINE)
# 南のコンクリートの低い壁(9 段)と、南のスタンド(10〜11 段)
d.rectangle((0, 9 * T, W, 9 * T + 12), fill=CON); d.rectangle((0, 9 * T + 12, W, 9 * T + 16), fill=COND)
for x in range(0, W, 3 * T): d.line((x, 9 * T, x, 9 * T + 12), fill=COND)
d.rectangle((0, 9 * T + 16, W, H), fill=SAND)
stands(int(9.8 * T), H, True, gaps=(7 * T, 17 * T))
im.save('/home/user/project/docs/assets/noroi/v2/strip.png')
g = Image.open('/home/user/project/docs/assets/noroi/v2/strip.png').convert('RGBA'); gd = ImageDraw.Draw(g, 'RGBA')
import json
grid = json.load(open('/home/user/project/docs/assets/noroi/v1/grids.json'))['strip']
for r, row in enumerate(grid):
    for c, ch in enumerate(row):
        if ch == '#': gd.rectangle((c * T, r * T, c * T + T - 1, r * T + T - 1), fill=(255, 0, 0, 50))
g.save('/home/user/project/docs/assets/noroi/v2/strip_grid.png')
print('ok')
