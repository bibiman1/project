# 宝舟と首振りエンジン 下絵その 2(D88): 鋳造工房と、宝舟の機関室。斜め上から見下ろす角度、今の夜
# 鋳造工房は、小さな青銅の鋳物工場(るつぼ炉、トング、注湯のシャンク、二つ割の木の鋳枠と砂型、湯口と押し湯、込め棒、ふるい、型ばらしの格子、仕上げ台)
# 機関室は、舳先が東。ボイラー(西)→ 蒸気管 → 首振りエンジンの台(真ん中。クランク軸は南北に通り、両舷の外輪へ)→ はしご(東)
from PIL import Image, ImageDraw
import random, math, os
T = 32
O = "/home/user/project/docs/assets/takarabune/v1/"
R = random.Random(21)
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
def planks(d, box, col, step=10, vert=True):
    x0, y0, x1, y1 = box; d.rectangle(box, fill=col)
    if vert:
        for x in range(x0, x1, step): d.line((x, y0, x, y1), fill=sh(col, 0.8))
    else:
        for y in range(y0, y1, step): d.line((x0, y, x1, y), fill=sh(col, 0.8))
    noise(d, box, col, 0.1, (x1 - x0) * (y1 - y0) // 40)
def flask(d, x, y, w, h, cup=True):
    # 二つ割の木の鋳枠(上枠を上から見る)。砂の面に湯口と押し湯の穴
    d.rectangle((x, y + 6, x + w, y + h + 6), fill=(90, 62, 36))
    d.rectangle((x, y, x + w, y + h), fill=(150, 108, 62), outline=(60, 40, 22), width=2)
    d.rectangle((x + 5, y + 5, x + w - 5, y + h - 5), fill=(70, 60, 54))
    noise(d, (x + 5, y + 5, x + w - 5, y + h - 5), (70, 60, 54), 0.15, w * h // 12)
    for k in (x - 4, x + w - 2):
        d.rectangle((k, y + h // 2 - 4, k + 6, y + h // 2 + 4), fill=(110, 110, 110), outline=(40, 40, 40))   # 枠のかすがい
    if cup:
        d.ellipse((x + w // 3 - 6, y + h // 2 - 6, x + w // 3 + 6, y + h // 2 + 6), fill=(30, 24, 20), outline=(110, 90, 70))   # 湯口
        d.ellipse((x + 2 * w // 3 - 4, y + h // 2 - 4, x + 2 * w // 3 + 4, y + h // 2 + 4), fill=(30, 24, 20))   # 押し湯

# ---------- 鋳造工房 16×12 ----------
W, H = 16 * T, 12 * T
w = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(w)
fill(d, (0, 0, W, H), (66, 56, 48), 0.12, 10)                              # 土間(黒い砂まじり)
planks(d, (0, 0, W, int(1.8 * T)), (70, 50, 36), 9)                         # 奥の板壁
d.rectangle((0, int(1.8 * T), W, int(1.8 * T) + 4), fill=(40, 28, 20))
for x0 in (0, W - 12): planks(d, (x0, 0, x0 + 12, H), (60, 44, 32), 6, False)
d.rectangle((0, H - 10, W, H), fill=(60, 44, 32))
# 道具掛け(壁): トング、注湯のシャンク(担ぎ棒の輪)、湯くみ、のろかき
for k, x in enumerate(range(6 * T, 11 * T, 22)):
    d.line((x, 12, x, 46), fill=(120, 120, 124), width=3)
    if k % 3 == 0: d.ellipse((x - 7, 40, x + 7, 54), outline=(130, 130, 134), width=3)
    elif k % 3 == 1: d.line((x - 5, 46, x + 5, 46), fill=(130, 130, 134), width=3)
    else: d.ellipse((x - 5, 44, x + 5, 52), fill=(90, 90, 94))
d.ellipse((11 * T + 10, 10, 13 * T, 54), outline=(130, 130, 134), width=4); d.line((11 * T, 32, 13 * T + 20, 32), fill=(130, 130, 134), width=3)  # 大きなシャンク
# 木型の棚(シリンダーの木型)
d.rectangle((13 * T + 24, 8, W - 16, 50), fill=(110, 80, 50), outline=(40, 28, 18))
d.rounded_rectangle((13 * T + 30, 14, W - 24, 28), radius=6, fill=(196, 160, 110)); d.rounded_rectangle((13 * T + 30, 32, W - 24, 44), radius=6, fill=(196, 160, 110))
# 窓(暗い)
d.rectangle((T, 10, 3 * T, 44), fill=(28, 36, 56), outline=(40, 28, 18), width=3); d.line((2 * T, 10, 2 * T, 44), fill=(40, 28, 18), width=2)
# るつぼ炉(床に埋めた丸い炉、ふたは開いている)と、送風機
cx, cy = 3 * T, 4 * T
d.ellipse((cx - 50, cy - 38, cx + 50, cy + 42), fill=(110, 70, 50), outline=(40, 26, 18), width=3)
for k in range(14):
    a = k / 14 * math.tau; d.line((cx + 44 * math.cos(a), cy + 2 + 34 * math.sin(a), cx + 50 * math.cos(a), cy + 2 + 40 * math.sin(a)), fill=(70, 44, 30), width=2)
d.ellipse((cx - 34, cy - 24, cx + 34, cy + 28), fill=(26, 20, 18))
d.ellipse((cx - 18, cy - 14, cx + 18, cy + 16), fill=(90, 84, 80), outline=(30, 26, 24), width=2)           # るつぼ
for _ in range(16):                                                                                         # るつぼの中の金属くず
    x = cx + R.randrange(-12, 10); y = cy + R.randrange(-8, 8); d.rectangle((x, y, x + R.randrange(3, 7), y + R.randrange(2, 5)), fill=R.choice([(170, 120, 60), (190, 140, 70), (150, 90, 50), (200, 160, 90)]))
d.ellipse((cx + 40, cy - 64, cx + 96, cy - 30), fill=(90, 90, 96), outline=(30, 30, 30), width=2)          # 開いたふた
d.line((cx - 50, cy + 4, cx - 80, cy + 4), fill=(120, 120, 126), width=8)                                   # 送風管
d.ellipse((cx - 104, cy - 14, cx - 70, cy + 20), fill=(110, 110, 116), outline=(30, 30, 30), width=2)      # 手回しの送風機
d.line((cx - 87, cy + 3, cx - 98, cy - 8), fill=(60, 60, 60), width=3)
# 炉の上の梁と鎖(チェーンブロック)
d.rectangle((T, 2 * T - 4, 6 * T, 2 * T + 4), fill=(80, 60, 40))
for y in range(2 * T + 4, cy - 20, 6): d.ellipse((cx - 3, y, cx + 3, y + 6), outline=(150, 150, 150))
# 鋳込み場(砂の床)と、鋳枠 3 組。真ん中の大きいのがシリンダーの型
fill(d, (5 * T + 16, 5 * T, 11 * T, 9 * T + 16), (96, 82, 66), 0.12, 8)
flask(d, 6 * T, 5 * T + 12, 2 * T + 8, 2 * T - 4)
flask(d, 8 * T + 24, 5 * T + 12, T + 24, T + 20)
flask(d, 6 * T + 10, 7 * T + 26, T + 20, T + 12)
flask(d, 8 * T + 20, 7 * T + 24, 2 * T, T + 16, cup=False)
# 込め台(砂、込め棒、ふるい、木型の半分)
d.rectangle((11 * T + 16, 2 * T + 16, 15 * T, 4 * T + 10), fill=(120, 90, 58), outline=(40, 28, 18), width=2)
fill(d, (11 * T + 24, 2 * T + 24, 13 * T + 20, 4 * T), (80, 68, 58), 0.15, 8)
d.ellipse((13 * T + 26, 2 * T + 22, 14 * T + 26, 3 * T + 22), fill=(150, 130, 100), outline=(60, 50, 40), width=3)
for k in range(5): d.line((13 * T + 30 + k * 6, 2 * T + 26, 13 * T + 30 + k * 6, 3 * T + 18), fill=(90, 80, 60))
d.line((12 * T, 4 * T + 2, 13 * T + 20, 3 * T + 8), fill=(150, 110, 70), width=5); d.ellipse((13 * T + 14, 3 * T + 2, 13 * T + 28, 3 * T + 14), fill=(90, 90, 90))
# 鋳物砂の山とスコップ
d.ellipse((12 * T, 5 * T + 16, 15 * T + 16, 8 * T + 8), fill=(54, 46, 40)); noise(d, (12 * T + 10, 5 * T + 24, 15 * T + 6, 8 * T), (60, 50, 44), 0.2, 600)
d.line((13 * T, 6 * T, 14 * T + 10, 7 * T + 10), fill=(140, 100, 60), width=4); d.polygon([(14 * T + 6, 7 * T + 6), (14 * T + 22, 7 * T + 10), (14 * T + 14, 7 * T + 24)], fill=(120, 120, 124))
# 型ばらしの格子と、仕上げ台(万力、やすり)、湯口のついたままの鋳物
d.rectangle((11 * T + 16, 9 * T + 8, 13 * T + 16, 10 * T + 24), fill=(50, 50, 52), outline=(20, 20, 20), width=2)
for x in range(11 * T + 22, 13 * T + 16, 8): d.line((x, 9 * T + 10, x, 10 * T + 22), fill=(90, 90, 94), width=2)
d.rectangle((13 * T + 24, 8 * T + 30, 15 * T + 8, 10 * T + 24), fill=(120, 90, 58), outline=(40, 28, 18), width=2)
d.rectangle((14 * T, 9 * T, 14 * T + 16, 9 * T + 12), fill=(80, 80, 84)); d.line((14 * T + 20, 10 * T, 15 * T, 9 * T + 20), fill=(160, 160, 160), width=2)
d.rectangle((14 * T + 10, 10 * T, 14 * T + 22, 10 * T + 16), fill=(176, 120, 56)); d.rectangle((14 * T + 14, 9 * T + 26, 14 * T + 18, 10 * T), fill=(176, 120, 56))
# くず入れ(真鍮のバルブ、銅管)と、地金、焼き入れの水おけ
d.rectangle((T, 8 * T, 3 * T, 10 * T), fill=(90, 66, 44), outline=(40, 28, 18), width=2)
for _ in range(30):
    x = T + R.randrange(6, 56); y = 8 * T + R.randrange(6, 56); d.rectangle((x, y, x + R.randrange(3, 9), y + R.randrange(3, 7)), fill=R.choice([(176, 120, 56), (196, 150, 80), (160, 90, 60)]))
for k in range(4): d.rectangle((3 * T + 14, 8 * T + 6 + k * 12, 4 * T + 18, 8 * T + 14 + k * 12), fill=(186, 130, 64), outline=(80, 50, 24))
d.ellipse((T + 4, 5 * T + 24, 2 * T + 20, 7 * T + 4), fill=(80, 56, 36), outline=(30, 20, 12), width=2); d.ellipse((T + 10, 5 * T + 30, 2 * T + 14, 6 * T + 30), fill=(30, 40, 56))
# 南の戸口(港へ)
d.rectangle((7 * T, H - 10, 9 * T, H), fill=(30, 40, 60))
# 明かり: 窓からの月明かりだけ(炉は冷えている。ペレットを入れると青白く燃える)
w.alpha_composite(Image.new('RGBA', w.size, (6, 8, 24, 110)))
glow(w, 2 * T, T + 20, 90, (120, 150, 220), 120)
glow(w, 8 * T, H - 8, 80, (90, 110, 170), 100)
w.save(O + 'workshop.png')

# ---------- 機関室 16×10(舳先は東)----------
W, H = 16 * T, 10 * T
e = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(e)
planks(d, (0, 0, W, H), (92, 64, 40), 12, False)                            # 床板
planks(d, (0, 0, W, int(1.8 * T)), (76, 52, 32), 9)                         # 北舷の内張り(肋材)
for x in range(16, W, 2 * T): d.rectangle((x, 0, x + 10, int(1.8 * T)), fill=(56, 38, 24))
d.rectangle((0, int(1.8 * T), W, int(1.8 * T) + 4), fill=(40, 28, 18))
d.rectangle((0, H - 14, W, H), fill=(56, 38, 24))                          # 南舷
for x in range(16, W, 2 * T): d.rectangle((x, H - 14, x + 10, H), fill=(40, 28, 18))
for k in range(3): d.ellipse((2 * T + k * 5 * T, 14, 2 * T + k * 5 * T + 18, 32), fill=(30, 40, 60), outline=(150, 120, 60), width=3)  # 舷窓
# ボイラー(西): 立てた丸い缶。前に火室の扉、圧力計、上に安全弁と煙突
bx, by = 2 * T + 16, 5 * T
d.rectangle((bx - 40, by - 70, bx + 40, by + 36), fill=(150, 96, 50), outline=(40, 26, 12), width=2)
d.ellipse((bx - 40, by - 86, bx + 40, by - 54), fill=(176, 120, 64), outline=(40, 26, 12), width=2)
for y in range(by - 60, by + 36, 18): d.line((bx - 40, y, bx + 40, y), fill=(120, 76, 40), width=2)
for y in range(by - 60, by + 36, 18):
    for x in range(bx - 34, bx + 36, 12): d.point((x, y + 3), fill=(220, 180, 120))
d.rectangle((bx - 20, by + 4, bx + 20, by + 32), fill=(40, 30, 26), outline=(20, 16, 12), width=2)          # 火室の扉
d.line((bx - 14, by + 18, bx + 14, by + 18), fill=(90, 80, 70), width=2)
d.ellipse((bx - 12, by - 40, bx + 12, by - 16), fill=(230, 226, 210), outline=(30, 30, 30), width=2)       # 圧力計
d.rectangle((bx + 10, by - 100, bx + 22, by - 76), fill=(170, 130, 70), outline=(40, 26, 12))             # 安全弁
d.rectangle((bx - 14, by - 120, bx + 4, by - 80), fill=(50, 50, 54), outline=(20, 20, 20))                 # 煙突(天井へ)
d.rectangle((bx - 50, by + 36, bx + 50, by + 44), fill=(70, 70, 74))
# 蒸気管(ボイラーの上から東へ、エンジンの台の軸受けへ)
d.line((bx + 40, by - 50, 8 * T, by - 50), fill=(180, 130, 70), width=7); d.line((8 * T, by - 50, 8 * T, 6 * T + 20), fill=(180, 130, 70), width=7)
# 首振りエンジンの台: 鋳鉄の A 字の台(前から見る)。下にシリンダーの軸受け(トラニオン)、上にクランク軸の軸受け
ex, ey0, ey1 = 9 * T, int(2.3 * T), int(7.2 * T)
d.rectangle((ex - 60, ey1, ex + 60, ey1 + 12), fill=(60, 60, 64), outline=(20, 20, 20), width=2)          # 台の土台
d.polygon([(ex - 56, ey1), (ex - 12, ey0 + 6), (ex - 4, ey0 + 6), (ex - 44, ey1)], fill=(70, 72, 78), outline=(20, 20, 20))
d.polygon([(ex + 56, ey1), (ex + 12, ey0 + 6), (ex + 4, ey0 + 6), (ex + 44, ey1)], fill=(70, 72, 78), outline=(20, 20, 20))
d.ellipse((ex - 12, ey0 - 6, ex + 12, ey0 + 18), fill=(90, 92, 98), outline=(20, 20, 20), width=2)         # クランク軸の軸受け
d.rectangle((ex - 30, ey1 - 26, ex + 30, ey1 - 6), fill=(80, 82, 88), outline=(20, 20, 20), width=2)      # トラニオンの台
d.ellipse((ex - 8, ey1 - 24, ex + 8, ey1 - 8), fill=(110, 112, 118), outline=(20, 20, 20), width=2)
# クランク軸(南北に通る。北舷と南舷の外輪へ)
d.rectangle((ex - 5, int(1.8 * T), ex + 5, ey0), fill=(130, 130, 136), outline=(30, 30, 30))
d.rectangle((ex - 5, ey1 + 12, ex + 5, H - 14), fill=(130, 130, 136), outline=(30, 30, 30))
# はしご(東、甲板へ)
lx = 13 * T + 8
d.rectangle((lx, int(1.8 * T) - 30, lx + 4, 4 * T + 10), fill=(120, 86, 50)); d.rectangle((lx + 36, int(1.8 * T) - 30, lx + 40, 4 * T + 10), fill=(120, 86, 50))
for y in range(int(1.8 * T) - 24, 4 * T + 10, 10): d.line((lx, y, lx + 40, y), fill=(140, 100, 60), width=3)
d.rectangle((lx - 6, 0, lx + 46, 10), fill=(30, 30, 40))
# 道具と油さし、ロープ
d.rectangle((11 * T, 7 * T, 12 * T + 10, 7 * T + 20), fill=(110, 80, 50), outline=(40, 28, 18))
d.ellipse((12 * T + 20, 7 * T + 2, 12 * T + 34, 7 * T + 16), fill=(170, 130, 60))
d.ellipse((14 * T, 7 * T, 15 * T + 10, 8 * T + 6), outline=(150, 120, 80), width=4)
e.alpha_composite(Image.new('RGBA', e.size, (6, 8, 24, 90)))
glow(e, 6 * T, 2 * T, 120, (220, 170, 90), 90)                                # 吊りランプ
e.save(O + 'engineroom.png')
for n, im in [('workshop', w), ('engineroom', e)]:
    im.resize((im.width // 2, im.height // 2), Image.LANCZOS).save(O + f'half_{n}_in.png')
print('ok')
