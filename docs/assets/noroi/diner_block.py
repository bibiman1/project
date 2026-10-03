# ダイナーの中 下絵(D127、D128)。20×12。斜め上から見下ろす。設計図 settei/diner_design.png に従う
# 真昼: 南の窓(画面の手前、見えない)から光の帯が北へのびる。東西の窓にブラインド。人はいない。レースの日のまま止まった店
from PIL import Image, ImageDraw
import random, json
T = 32; W, H = 20 * T, 12 * T
O = '/home/user/project/docs/assets/noroi/v1/'
R = random.Random(9)
def sh(c, k): return tuple(max(0, min(255, int(v * k))) for v in c[:3])
im = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(im)
# 床: 白黒の市松(色あせ)、ひびと砂
for r in range(2, 12):
    for c in range(20):
        col = (52, 50, 50) if (r + c) % 2 else (214, 206, 188)
        d.rectangle((c * T, r * T, c * T + T - 1, r * T + T - 1), fill=sh(col, R.uniform(0.95, 1.04)))
for _ in range(40):
    x, y = R.randrange(0, W), R.randrange(3 * T, H); d.line((x, y, x + R.randrange(-14, 14), y + R.randrange(-6, 10)), fill=(90, 84, 76))
# 北の壁(rows 0-2): クリームの壁、赤い帯、メッキの縁
d.rectangle((0, 0, W, 2 * T + 8), fill=(206, 194, 168))
d.rectangle((0, 2 * T - 6, W, 2 * T + 8), fill=(180, 60, 52))
d.rectangle((0, 2 * T + 8, W, 2 * T + 12), fill=(196, 200, 206))
# 厨房の窓(配膳台)と、メニューの板、時計
d.rectangle((8 * T, 18, 12 * T, 2 * T - 6), fill=(44, 38, 36), outline=(150, 150, 156), width=3)
d.rectangle((8 * T + 6, 2 * T - 14, 12 * T - 6, 2 * T - 8), fill=(190, 194, 200))
d.rectangle((8 * T + 10, 2, 12 * T - 10, 16), fill=(28, 28, 28), outline=(120, 110, 90))
for k in range(9): d.line((8 * T + 18 + k * 12, 6, 8 * T + 24 + k * 12, 6), fill=(230, 230, 226), width=2); d.line((8 * T + 18 + k * 12, 11, 8 * T + 26 + k * 12, 11), fill=(230, 230, 226), width=2)
d.ellipse((14 * T, 6, 14 * T + 26, 32), fill=(246, 244, 236), outline=(90, 200, 210), width=3)
d.line((14 * T + 13, 19, 14 * T + 13, 9), fill=(40, 40, 40), width=2); d.line((14 * T + 13, 19, 14 * T + 21, 22), fill=(40, 40, 40), width=2)
# クラブの札の列(一つ分あいた釘)
for k in range(6):
    x = 1 * T + 6 + k * 30
    d.ellipse((x + 10, 8, x + 13, 11), fill=(40, 40, 40))
    if k == 4: continue
    d.rounded_rectangle((x, 12, x + 24, 30), 5, fill=(190, 194, 200), outline=(90, 90, 96))
# カレンダーと写真
d.rectangle((6 * T + 22, 10, 6 * T + 46, 40), fill=(240, 236, 226), outline=(110, 100, 90))
for k in range(4): d.line((6 * T + 25, 22 + k * 4, 6 * T + 43, 22 + k * 4), fill=(170, 160, 150))
d.ellipse((6 * T + 36, 32, 6 * T + 43, 38), outline=(200, 40, 40), width=2)
for k in range(3): d.rectangle((15 * T + 10 + k * 26, 10 + (k % 2) * 4, 15 * T + 30 + k * 26, 30 + (k % 2) * 4), fill=(214, 200, 170), outline=(90, 80, 70))
# カウンター(row 2-3、cols 1-13): ステンレスの腰、白いフォーマイカの天板、赤い縁
d.rectangle((1 * T, 2 * T + 6, 14 * T, 2 * T + 22), fill=(236, 232, 222), outline=(120, 120, 126))
d.rectangle((1 * T, 2 * T + 22, 14 * T, 3 * T + 18), fill=(180, 184, 190))
for x in range(1 * T, 14 * T, 8): d.line((x, 2 * T + 24, x, 3 * T + 16), fill=(206, 210, 216))
d.rectangle((1 * T, 2 * T + 20, 14 * T, 2 * T + 23), fill=(180, 60, 52))
# 飲みかけのカップの列、皿、ナプキン入れ、砂糖入れ
for k in range(7):
    x = 2 * T + k * 44; d.ellipse((x, 2 * T + 9, x + 12, 2 * T + 17), fill=(250, 248, 240), outline=(120, 110, 100)); d.ellipse((x + 3, 2 * T + 11, x + 9, 2 * T + 15), fill=(110, 76, 50))
for x in (5 * T + 10, 10 * T + 6): d.rectangle((x, 2 * T + 7, x + 10, 2 * T + 18), fill=(200, 204, 210), outline=(100, 100, 106))
# 丸椅子(row 3-4、cols 1-13)。一つだけ半分回っている
for c in range(1, 14):
    cx, cy = c * T + 16, 3 * T + 30
    d.rectangle((cx - 2, cy, cx + 2, cy + 14), fill=(170, 174, 180)); d.ellipse((cx - 9, cy + 12, cx + 9, cy + 18), fill=(150, 154, 160))
    if c == 9: d.ellipse((cx - 11, cy - 8, cx + 11, cy + 6), fill=(214, 140, 140), outline=(120, 50, 50), width=2); d.line((cx - 6, cy - 4, cx + 7, cy + 2), fill=(250, 220, 220), width=2)
    else: d.ellipse((cx - 11, cy - 6, cx + 11, cy + 6), fill=(196, 96, 96), outline=(110, 40, 40), width=2)
# パイのケース(cols 14-15)
d.rectangle((14 * T + 4, 2 * T + 4, 16 * T - 4, 3 * T + 18), fill=(176, 180, 186), outline=(110, 110, 116))
d.ellipse((14 * T + 14, 2 * T - 8, 16 * T - 14, 2 * T + 22), fill=(220, 236, 240), outline=(150, 170, 176), width=2)
d.polygon([(14 * T + 26, 2 * T + 16), (15 * T + 22, 2 * T + 16), (15 * T + 12, 2 * T + 6)], fill=(200, 150, 90))
# ジュークボックス(cols 17-19, rows 1-5)
jx, jy = 17 * T + 4, 1 * T
d.rounded_rectangle((jx, jy + 20, jx + 3 * T - 12, jy + 4 * T + 10), 6, fill=(150, 90, 50), outline=(60, 34, 20), width=2)
d.pieslice((jx, jy - 10, jx + 3 * T - 12, jy + 70), 180, 360, fill=(240, 200, 120), outline=(60, 34, 20), width=2)
for k in range(4): d.arc((jx + 8 + k * 6, jy - 2 + k * 6, jx + 3 * T - 20 - k * 6, jy + 62 - k * 6), 180, 360, fill=[(240, 90, 60), (250, 200, 80), (90, 200, 120), (90, 160, 230)][k], width=4)
d.rectangle((jx + 16, jy + 52, jx + 3 * T - 28, jy + 84), fill=(60, 40, 30), outline=(200, 200, 206), width=2)
d.ellipse((jx + 26, jy + 58, jx + 58, jy + 80), fill=(30, 30, 30), outline=(120, 120, 120))
for k in range(5): d.line((jx + 10, jy + 96 + k * 8, jx + 3 * T - 22, jy + 96 + k * 8), fill=(200, 200, 206), width=2)
for x in (jx + 6, jx + 3 * T - 18): d.rectangle((x - 4, jy + 30, x + 4, jy + 4 * T), fill=(240, 120, 70), outline=(120, 50, 20))
# 東西の窓(ブラインド)
for x0 in (0, 19 * T + 8):
    d.rectangle((x0, 5 * T, x0 + 24, 12 * T), fill=(214, 220, 222), outline=(110, 110, 116), width=2)
    for y in range(5 * T + 4, 12 * T, 6): d.line((x0 + 2, y, x0 + 22, y + 2), fill=(170, 170, 160), width=2)
# ボックス席(西 cols 1-4、東 cols 16-19)
def booth(x, y, flip):
    d.rectangle((x, y, x + 3 * T, y + 14), fill=(70, 150, 150), outline=(30, 70, 70), width=2)
    d.rectangle((x, y + 2 * T - 4, x + 3 * T, y + 2 * T + 10), fill=(70, 150, 150), outline=(30, 70, 70), width=2)
    d.rectangle((x + 6, y + 18, x + 3 * T - 6, y + 2 * T - 10), fill=(236, 234, 226), outline=(160, 160, 166), width=3)
    d.rectangle((x + 10 if not flip else x + 3 * T - 22, y + 22, x + 22 if not flip else x + 3 * T - 10, y + 36), fill=(200, 204, 210), outline=(90, 90, 96))
for k in range(3): booth(1 * T, 5 * T + 4 + k * 2 * T - 8, False)
for k in range(3): booth(16 * T - 8, 5 * T + 4 + k * 2 * T - 8, True)
# 東の机の上: ひらいた地図、鍵、ストップウォッチ
mx, my = 16 * T + 10, 5 * T + 20
d.polygon([(mx, my), (mx + 40, my - 4), (mx + 44, my + 22), (mx + 4, my + 26)], fill=(232, 220, 180), outline=(150, 130, 100)); d.line((mx + 6, my + 18, mx + 38, my + 4), fill=(200, 60, 50), width=2)
d.ellipse((mx + 50, my + 6, mx + 62, my + 18), fill=(220, 220, 224), outline=(60, 60, 60))
d.line((mx + 22, my + 30, mx + 30, my + 32), fill=(200, 180, 80), width=3)
# 床のサボテン、メニューの落ちた字、砂の吹きだまり、回転草
d.rounded_rectangle((10 * T + 6, 7 * T - 4, 10 * T + 16, 7 * T + 22), 4, fill=(86, 130, 70), outline=(40, 70, 36)); d.rounded_rectangle((10 * T - 4, 7 * T + 2, 10 * T + 6, 7 * T + 12), 3, fill=(86, 130, 70), outline=(40, 70, 36))
for k in range(4): d.rectangle((7 * T + k * 14, 5 * T + 10 + (k % 2) * 8, 7 * T + k * 14 + 6, 5 * T + 18 + (k % 2) * 8), fill=(240, 240, 236))
sand = Image.new('RGBA', im.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(sand)
for k in range(6): sd.ellipse((8 * T - k * 16, 10 * T - k * 6, 12 * T + k * 16, 12 * T + 20), fill=(224, 196, 140, 60))
im.alpha_composite(sand); d = ImageDraw.Draw(im)
d.ellipse((12 * T + 10, 10 * T + 6, 12 * T + 34, 10 * T + 28), outline=(150, 120, 80), width=2)
# 帽子掛け(cols 5-6, row 11)とジャンパー、ピンボール(cols 13-14)
d.rectangle((5 * T + 12, 10 * T, 5 * T + 16, 12 * T), fill=(120, 90, 60)); d.polygon([(5 * T, 10 * T + 8), (6 * T + 4, 10 * T + 8), (6 * T, 11 * T + 16), (5 * T + 4, 11 * T + 16)], fill=(150, 40, 40), outline=(70, 20, 20))
d.rectangle((13 * T + 4, 10 * T + 4, 15 * T - 4, 12 * T), fill=(70, 110, 80), outline=(30, 50, 36), width=2); d.rectangle((13 * T + 10, 10 * T + 8, 15 * T - 10, 11 * T + 10), fill=(220, 120, 60))
# 入口の戸(cols 8-11, row 11)
d.rectangle((8 * T + 8, 11 * T + 8, 12 * T - 8, 12 * T), fill=(120, 90, 66), outline=(60, 40, 30), width=2)
# 光の帯(南の窓から北へ)と、ほこり
light = Image.new('RGBA', im.size, (0, 0, 0, 0)); ld = ImageDraw.Draw(light)
for wx in (3, 7.5, 12.5):
    ld.polygon([(wx * T, H), ((wx + 2) * T, H), ((wx + 2.8) * T, 5 * T), ((wx + 0.8) * T, 5 * T)], fill=(255, 238, 180, 46))
im.alpha_composite(light)
im.save(O + 'diner.png')
grid = [
 '####################',
 '#################..#',
 '#.............######',
 '#..............##..#',
 '#..................#',
 '#....#.......#.....#',
 '#....#...##..#.....#',
 '#....#...##..#.....#',
 '#....#.......#.....#',
 '#..................#',
 '#....#.......#.....#',
 '#####...#..#####.###',
]
g = json.load(open(O + 'grids.json')); g['diner'] = grid; json.dump(g, open(O + 'grids.json', 'w'), indent=1)
v = im.copy(); vd = ImageDraw.Draw(v, 'RGBA')
for r, row in enumerate(grid):
    for c, ch in enumerate(row):
        if ch == '#': vd.rectangle((c * T, r * T, c * T + T - 1, r * T + T - 1), fill=(255, 0, 0, 50))
v.save(O + 'diner_grid.png'); print('ok')
