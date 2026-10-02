# 宝舟と首振りエンジン 設計図(2026-10-02)
import math
from PIL import Image, ImageDraw, ImageFont
F = '/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'
f = lambda s: ImageFont.truetype(F, s)
W, H = 1600, 2600
im = Image.new('RGB', (W, H), (245, 240, 228)); d = ImageDraw.Draw(im)
INK = (60, 50, 40); RED = (180, 50, 35); MUT = (120, 110, 100); WH = (245, 245, 240)
SEA = (40, 56, 90); GND = (120, 116, 106); FLOOR = (176, 172, 160)

def head(x, y, s, w=1560):
    d.text((x, y), s, fill=INK, font=f(17)); d.line((x, y + 26, x + w, y + 26), fill=INK)

def grid(x, y, cw, ch, T, fill, label=None):
    d.rectangle((x, y, x + cw * T, y + ch * T), fill=fill, outline=INK, width=2)
    g = tuple(max(0, c - 18) for c in fill)
    for i in range(1, cw): d.line((x + i * T, y, x + i * T, y + ch * T), fill=g)
    for j in range(1, ch): d.line((x, y + j * T, x + cw * T, y + j * T), fill=g)
    if label: d.text((x, y + ch * T + 4), label, fill=RED, font=f(12))

def r(x, y, T, c0, r0, cw, ch, fill, text=None, tc=INK, size=11):
    d.rectangle((x + c0 * T, y + r0 * T, x + (c0 + cw) * T, y + (r0 + ch) * T), fill=fill, outline=INK)
    if text: d.text((x + c0 * T + 3, y + r0 * T + 2), text, fill=tc, font=f(size))

def door(x, y, T, c, rr, w=1, h=1):
    d.rectangle((x + c * T, y + rr * T, x + (c + w) * T, y + (rr + h) * T), fill=(250, 240, 200), outline=RED, width=2)

def sign(x, y, T, c, rr):
    d.polygon([(x + c * T, y + (rr + 1) * T), (x + (c + 0.5) * T, y + rr * T), (x + (c + 1) * T, y + (rr + 1) * T)], fill=(250, 210, 40), outline=INK)

d.text((20, 12), '③ 設計図(宝舟と首振りエンジン)  寸法はマップのマス(1マス=32px)。ぼぎだぢは約1マス。実物より縮めてある', fill=INK, font=f(20))

# ---------- 1. マップ ----------
head(20, 52, '1. マップの大きさと、中の配置(北が上。1 マス=14px。□=出入口、▲=警告の札)')
T = 14
x0, y0 = 30, 100
# A 漁港 28×14
grid(x0, y0, 28, 14, T, GND, 'A 漁港と岸壁 28×14(西の坂道が入口と帰り道。東の坂道で岬へ)')
r(x0, y0, T, 0, 0, 28, 2, (70, 80, 66), '山すそ(通れない)', WH)
r(x0, y0, T, 2, 2, 7, 4, (160, 110, 80), '鋳物小屋')
r(x0, y0, T, 11, 2, 5, 3, (150, 140, 120), '網小屋')
r(x0, y0, T, 18, 2, 5, 3, (150, 140, 120), '番屋')
door(x0, y0, T, 5, 6); door(x0, y0, T, 0, 5, 1, 3); door(x0, y0, T, 27, 3, 1, 3)
r(x0, y0, T, 3, 6.6, 3, 1.4, (200, 120, 70), '炉', size=9)
r(x0, y0, T, 0, 10, 28, 0.6, (200, 196, 180))
r(x0, y0, T, 0, 10.6, 28, 3.4, SEA, '海(入れない)', WH)
r(x0, y0, T, 9, 10.4, 11, 3, (170, 110, 60), '宝舟(調べて乗る)', WH)
d.text((x0 + 28 * T + 8, y0 + 5 * T), '← 岬へ', fill=RED, font=f(11))
# B 正門 28×10
by = y0 + 14 * T + 40
grid(x0, by, 28, 10, T, (110, 112, 104), 'B 正門 28×10(西から坂道で上がってくる。門を抜けて北へ)')
r(x0, by, T, 0, 0, 28, 3, (130, 136, 126), '敷地の中(荒れた構内)', WH)
r(x0, by, T, 0, 3, 11, 0.6, (90, 90, 90)); r(x0, by, T, 15, 3, 13, 0.6, (90, 90, 90))
d.text((x0 + 3, by + 3.7 * T), 'フェンス(有刺鉄線)', fill=WH, font=f(9))
r(x0, by, T, 11, 2.6, 4, 1.4, (190, 170, 120), '鎖の切れた門', size=9)
r(x0, by, T, 17, 4.5, 3, 2, (170, 160, 140), '守衛所', size=9)
sign(x0, by, T, 9, 4.2)
door(x0, by, T, 0, 6, 1, 3); door(x0, by, T, 12, 0, 2, 1)
# C 管理棟 24×12
cy_ = by + 10 * T + 40
grid(x0, cy_, 24, 12, T, (170, 166, 150), 'C 管理棟 24×12(南の玄関から入り、東の扉から出る)')
r(x0, cy_, T, 0, 0, 24, 1, (120, 116, 106))
r(x0, cy_, T, 2, 1.5, 12, 5, (110, 130, 120), '中央制御室(止まった計器盤)', WH)
r(x0, cy_, T, 16, 1.5, 6, 4, (180, 170, 140), '事務室(散らかった机)', size=9)
r(x0, cy_, T, 0, 7.5, 24, 2.5, (196, 190, 170), '廊下(非常灯だけ点いている)', size=10)
sign(x0, cy_, T, 20, 7.6)
door(x0, cy_, T, 4, 11); door(x0, cy_, T, 23, 7.8, 1, 2)
# D タービン建屋 28×12
dy = cy_ + 12 * T + 40
grid(x0, dy, 28, 12, T, (150, 150, 146), 'D タービン建屋 28×12(西から入り、東の扉から出る)')
r(x0, dy, T, 3, 4, 22, 4, (90, 110, 120), 'タービンと発電機(止まっている。上は通れない)', WH)
r(x0, dy, T, 0, 0, 28, 2, (120, 120, 110), '配管の束、黄と黒の縞', WH, 10)
r(x0, dy, T, 0, 2, 28, 2, (176, 172, 160), '北の通路(2 マス)', size=9)
r(x0, dy, T, 0, 8, 28, 2, (176, 172, 160), '南の通路(2 マス)', size=9)
r(x0, dy, T, 0, 10, 28, 2, (120, 120, 110), '復水器と配管', WH, 10)
for c in (6, 14, 22): sign(x0, dy, T, c, 8.6)
door(x0, dy, T, 0, 8, 1, 2); door(x0, dy, T, 27, 2, 1, 2)
# E 原子炉建屋 20×16 (右列)
ex, ey = 520, 100
grid(ex, ey, 20, 16, T, (150, 140, 136), 'E 原子炉建屋 20×16(西から。北の二重扉 → F)')
d.ellipse((ex + 5 * T, ey + 3 * T, ex + 15 * T, ey + 13 * T), fill=(120, 90, 86), outline=INK, width=2)
d.text((ex + 6.4 * T, ey + 7.5 * T), '格納容器(外側)', fill=WH, font=f(11))
r(ex, ey, T, 8, 0, 4, 2.4, (170, 150, 120), '二重扉', size=9)
door(ex, ey, T, 9, 0, 2, 1); door(ex, ey, T, 0, 12, 1, 3)
for c, rr in [(2, 3), (17, 3), (2, 10), (17, 10)]:
    d.ellipse((ex + c * T, ey + rr * T, ex + (c + 1) * T, ey + (rr + 1) * T), fill=(230, 40, 30))
for c, rr in [(4, 1), (14, 1), (3, 14), (16, 14)]: sign(ex, ey, T, c, rr)
d.text((ex, ey + 16 * T + 20), '● 赤い回転灯(4 つ)。警報が鳴りっぱなし', fill=INK, font=f(11))
# F 炉心 16×14
fx, fy = 520, ey + 16 * T + 50
grid(fx, fy, 16, 14, T, (110, 110, 120), 'F 格納容器の中(炉心)16×14(南から入る。行き止まり)')
d.ellipse((fx + 3 * T, fy + 2 * T, fx + 13 * T, fy + 10 * T), fill=(60, 120, 170), outline=INK, width=2)
d.ellipse((fx + 5.5 * T, fy + 4 * T, fx + 10.5 * T, fy + 8 * T), fill=(150, 220, 255))
d.text((fx + 5.6 * T, fy + 5.4 * T), '炉心(水の底が青白く光る)', fill=INK, font=f(9))
r(fx, fy, T, 7, 10, 2, 1, (180, 240, 255), '燃料', size=8)
r(fx, fy, T, 0, 0, 16, 1.5, (90, 90, 100), '振り切れた計器', WH, 9)
door(fx, fy, T, 7, 13, 2, 1)
d.text((fx, fy + 14 * T + 20), '炉のふちで燃料ペレットを拾う。札はない', fill=INK, font=f(11))
# G 甲板 20×10
gx, gy0 = 830, 100
grid(gx, gy0, 20, 10, T, SEA, 'G 宝舟の甲板 20×10(海が西へ流れる。舳先は東)')
hull = [(1.5, 2.5), (15, 2.5), (18.5, 5), (15, 7.5), (1.5, 7.5), (0.8, 5)]
d.polygon([(gx + a * T, gy0 + b * T) for a, b in hull], fill=(176, 120, 70), outline=(240, 200, 90), width=2)
r(gx, gy0, T, 6, 1.5, 3, 1, (90, 70, 50), '外輪', WH, 8); r(gx, gy0, T, 6, 7.5, 3, 1, (90, 70, 50), '外輪', WH, 8)
r(gx, gy0, T, 6, 3.5, 3, 3, (90, 90, 90), '機関', WH, 9)
r(gx, gy0, T, 10.5, 4, 1, 2, (200, 180, 140), '帆柱', size=7)
r(gx, gy0, T, 1.5, 4, 2, 2, (130, 90, 60), '舵', WH, 9)
d.text((gx + 15 * T, gy0 + 4.4 * T), '舳先', fill=WH, font=f(10))
d.text((gx, gy0 + 10 * T + 20), '舳先で燃料をまく(調べる)→ 一枚絵', fill=INK, font=f(11))
# つながり
tx = 830; ty = 300
d.text((tx, ty), 'つながり', fill=INK, font=f(15))
for i, s in enumerate(['A 西の坂道 ─ 入口・帰り道(海図を持っていると帰れる)',
                       'A 東の坂道 ─ B 正門(西の端)',
                       'B 正門の北 ─ C 管理棟の南の玄関',
                       'C 管理棟の東の扉 ─ D タービン建屋の西',
                       'D タービン建屋の東 ─ E 原子炉建屋の西',
                       'E 北の二重扉 ─ F 炉心',
                       'F 燃料を拾う → 暗転 → A 岸壁の宝舟の前(案)',
                       'A 宝舟を調べる → 燃料をくべる → G 甲板へ',
                       'G 燃料をまく → 一枚絵 → A 岸壁(舵に海図)']):
    d.text((tx, ty + 28 + i * 22), s, fill=INK, font=f(13))
d.text((tx, ty + 240), '発電所の中は奥へ一本道。行き止まりは炉心だけ', fill=MUT, font=f(12))

# ---------- 2. 立面図 ----------
Y2 = 940
head(20, Y2, '2. 建物の立面図(南から見た正面。1 マス=22px)')
T = 22
gl = Y2 + 300
def ground(x, w): d.line((x - 10, gl, x + w * T + 10, gl), fill=INK, width=2)
def label(x, title, lines):
    d.text((x, gl + 6), title, fill=RED, font=f(12))
    for i, s in enumerate(lines): d.text((x, gl + 26 + i * 18), s, fill=INK, font=f(11))
# 鋳物小屋 7×4
sx = 40; ground(sx, 7)
d.rectangle((sx, gl - 3 * T, sx + 7 * T, gl), fill=(150, 110, 84), outline=INK, width=2)
for i in range(0, 7 * T, 8): d.line((sx + i, gl - 3 * T, sx + i, gl), fill=(130, 94, 70))
d.polygon([(sx - 6, gl - 3 * T), (sx + 3.5 * T, gl - 4.3 * T), (sx + 7 * T + 6, gl - 3 * T)], fill=(110, 110, 116), outline=INK)
d.rectangle((sx + 5.6 * T, gl - 6 * T, sx + 6.3 * T, gl - 3.6 * T), fill=(140, 90, 70), outline=INK)
d.rectangle((sx + 2.5 * T, gl - 2.2 * T, sx + 4.5 * T, gl), fill=(50, 30, 24), outline=INK)
d.rectangle((sx + 3 * T, gl - 1 * T, sx + 4 * T, gl - 0.3 * T), fill=(250, 150, 60))
label(sx, '鋳物小屋 7×4 マス・平屋', ['焼けた板壁、トタンの切妻屋根', '煙突 1(火の粉)、開いた大戸 1', '中に炉と鋳型。窓なし'])
# 網小屋 5×3
nx = 260; ground(nx, 5)
d.rectangle((nx, gl - 2.4 * T, nx + 5 * T, gl), fill=(140, 130, 110), outline=INK, width=2)
d.polygon([(nx - 6, gl - 2.4 * T), (nx + 2.5 * T, gl - 3.4 * T), (nx + 5 * T + 6, gl - 2.4 * T)], fill=(100, 96, 90), outline=INK)
for k in range(5): d.arc((nx + k * T, gl - 2.2 * T, nx + (k + 1) * T, gl - 1.2 * T), 0, 180, fill=(80, 70, 60), width=2)
d.rectangle((nx + 2 * T, gl - 1.6 * T, nx + 3 * T, gl), fill=(90, 70, 50), outline=INK)
label(nx, '網小屋 5×3 マス', ['板壁に網と浮き玉', '戸 1(閉まっている)', '入らない'])
# 番屋 5×3
hx = 430; ground(hx, 5)
d.rectangle((hx, gl - 2.6 * T, hx + 5 * T, gl), fill=(150, 136, 110), outline=INK, width=2)
d.polygon([(hx - 6, gl - 2.6 * T), (hx + 2.5 * T, gl - 3.6 * T), (hx + 5 * T + 6, gl - 2.6 * T)], fill=(100, 96, 90), outline=INK)
d.rectangle((hx + 0.6 * T, gl - 1.8 * T, hx + 1.6 * T, gl), fill=(90, 70, 50), outline=INK)
d.rectangle((hx + 2.6 * T, gl - 1.8 * T, hx + 4.2 * T, gl - 0.8 * T), fill=(250, 220, 130), outline=INK)
label(hx, '番屋 5×3 マス', ['板壁、戸 1・窓 1', '窓に灯りが一つ(誰もいない)', '入らない'])
# 正門と守衛所
gx2 = 610; ground(gx2, 8)
for k in range(3): d.rectangle((gx2 + k * 0.35 * T, gl - 2.5 * T, gx2 + k * 0.35 * T + 4, gl), fill=(110, 100, 90))
d.rectangle((gx2 + 1 * T, gl - 2.6 * T, gx2 + 1.4 * T, gl), fill=(120, 110, 100), outline=INK)
d.rectangle((gx2 + 5 * T, gl - 2.6 * T, gx2 + 5.4 * T, gl), fill=(120, 110, 100), outline=INK)
for k in range(6): d.line((gx2 + 1.4 * T + k * 0.7 * T, gl - 2.2 * T, gx2 + 1.4 * T + k * 0.7 * T, gl), fill=(150, 90, 60), width=2)
d.line((gx2 + 1.4 * T, gl - 1.2 * T, gx2 + 3 * T, gl - 0.4 * T), fill=(120, 120, 120), width=3)
d.rectangle((gx2 + 6 * T, gl - 2.4 * T, gx2 + 8 * T, gl), fill=(180, 170, 150), outline=INK)
d.rectangle((gx2 + 6.3 * T, gl - 1.9 * T, gx2 + 7.7 * T, gl - 1.1 * T), fill=(70, 80, 90), outline=INK)
d.rectangle((gx2 + 0 * T, gl - 3.4 * T, gx2 + 1.6 * T, gl - 2.7 * T), fill=(250, 210, 40), outline=INK)
label(gx2, '正門と守衛所', ['錆びた鉄の門扉 2 枚、片方が開いて', '鎖が切れて垂れている', '守衛所の窓は割れている。▲札 1'])
# 管理棟 10×4 三階
kx = 840; ground(kx, 10)
d.rectangle((kx, gl - 4.5 * T, kx + 10 * T, gl), fill=(196, 192, 180), outline=INK, width=2)
for fl in range(3):
    for k in range(8): d.rectangle((kx + (0.5 + k * 1.2) * T, gl - (4.1 - fl * 1.4) * T, kx + (1.3 + k * 1.2) * T, gl - (3.5 - fl * 1.4) * T), fill=(70, 80, 90))
d.rectangle((kx + 4.3 * T, gl - 1.3 * T, kx + 5.7 * T, gl), fill=(100, 110, 110), outline=INK)
label(kx, '管理棟 10×4.5 マス・三階建て', ['灰色のコンクリート、平らな屋根', '窓 8×3(暗い。非常灯の緑だけ)', '玄関はガラスの両開き 1'])
# タービン建屋 14×5
tbx = 1100; ground(tbx, 14)
d.rectangle((tbx, gl - 5 * T, tbx + 14 * T, gl), fill=(170, 176, 180), outline=INK, width=2)
for i in range(0, 14 * T, 10): d.line((tbx + i, gl - 5 * T, tbx + i, gl), fill=(150, 156, 160))
d.rectangle((tbx, gl - 0.6 * T, tbx + 14 * T, gl - 0.2 * T), fill=(240, 200, 40))
for k in range(0, 14 * T, 16): d.line((tbx + k, gl - 0.6 * T, tbx + k + 8, gl - 0.2 * T), fill=INK, width=3)
d.rectangle((tbx + 1 * T, gl - 2.4 * T, tbx + 3 * T, gl - 0.6 * T), fill=(120, 126, 130), outline=INK)
label(tbx, 'タービン建屋 14×5 マス', ['波形の外壁(薄い灰)、平らな屋根', '腰に黄と黒の縞、大きな搬入扉 1', '窓なし。▲札が増える'])
# 原子炉建屋 + 排気筒(2段目)
gl2 = gl + 330
def ground2(x, w): d.line((x - 10, gl2, x + w * T + 10, gl2), fill=INK, width=2)
rx = 40; ground2(rx, 10)
d.rectangle((rx, gl2 - 7 * T, rx + 10 * T, gl2), fill=(200, 196, 186), outline=INK, width=2)
d.rectangle((rx, gl2 - 7 * T, rx + 10 * T, gl2 - 6.4 * T), fill=(150, 160, 180))
d.rectangle((rx + 11.2 * T, gl2 - 11 * T, rx + 11.8 * T, gl2), fill=(200, 80, 70), outline=INK)
for k in range(1, 6): d.rectangle((rx + 11.2 * T, gl2 - k * 2 * T, rx + 11.8 * T, gl2 - k * 2 * T + 6), fill=(240, 240, 240))
for c in (2, 8): d.ellipse((rx + c * T, gl2 - 7.6 * T, rx + (c + 0.6) * T, gl2 - 7 * T), fill=(230, 40, 30), outline=INK)
d.ellipse((rx + 4.4 * T, gl2 - 4 * T, rx + 5.6 * T, gl2 - 2.8 * T), fill=(250, 210, 40), outline=INK)
for a in (90, 210, 330):
    d.pieslice((rx + 4.5 * T, gl2 - 3.9 * T, rx + 5.5 * T, gl2 - 2.9 * T), a - 30, a + 30, fill=INK)
d.rectangle((rx + 0.4 * T, gl2 - 1.6 * T, rx + 1.6 * T, gl2), fill=(130, 130, 130), outline=INK)
d.text((rx, gl2 + 6), '原子炉建屋 10×7 マス と 排気筒(高さ 11 マス)', fill=RED, font=f(12))
for i, s in enumerate(['四角い箱、窓なし。上の帯だけ空色', '屋上に赤い回転灯 2、壁に放射能マーク',
                       '入口は西の鉄の扉 1。紅白の排気筒が隣に立つ', '(日本の沸騰水型の発電所の形。名前・社名は描かない)']):
    d.text((rx, gl2 + 26 + i * 18), s, fill=INK, font=f(11))
# 格納容器の断面
kx2 = 340; ground2(kx2, 9)
d.rectangle((kx2, gl2 - 8 * T, kx2 + 9 * T, gl2), fill=(214, 210, 200), outline=INK, width=2)
fl = [(3.4, 7), (5.6, 7), (5.6, 5.4), (7.6, 2.6), (7.6, 0.6), (1.4, 0.6), (1.4, 2.6), (3.4, 5.4)]
d.polygon([(kx2 + a * T, gl2 - b * T) for a, b in fl], fill=(150, 120, 110), outline=INK, width=2)
d.rectangle((kx2 + 3 * T, gl2 - 6 * T, kx2 + 6 * T, gl2 - 2.2 * T), fill=(60, 120, 170), outline=INK, width=2)
d.rectangle((kx2 + 3.6 * T, gl2 - 4.4 * T, kx2 + 5.4 * T, gl2 - 2.6 * T), fill=(160, 225, 255))
d.text((kx2 + 3.1 * T, gl2 - 5.8 * T), 'ふたが開いた炉', fill=WH, font=f(10))
d.text((kx2 + 9.3 * T, gl2 - 6 * T), '← フラスコ形の格納容器', fill=INK, font=f(11))
d.text((kx2 + 9.3 * T, gl2 - 3.6 * T), '← 炉心(水の底で燃料が', fill=INK, font=f(11))
d.text((kx2 + 9.3 * T, gl2 - 3.6 * T + 16), '   青白く光る)', fill=INK, font=f(11))
d.text((kx2, gl2 + 6), '原子炉建屋の断面(F の舞台)', fill=RED, font=f(12))
for i, s in enumerate(['F は格納容器の中。ふたの開いた炉を上から見下ろす', '水の光(チェレンコフ光)は青白く、まわりを照らす']):
    d.text((kx2, gl2 + 26 + i * 18), s, fill=INK, font=f(11))

# ---------- 3. 宝舟 ----------
Y3 = gl2 + 130
head(20, Y3, '3. 宝舟(七福神の宝船の形を、ぼぎが廃材で片手間に組んだ木造の外輪船)', 960)
T = 22
bx, bl = 60, Y3 + 290
d.line((bx - 20, bl - 1.2 * T, bx + 20 * T, bl - 1.2 * T), fill=(90, 120, 170), width=2)
hull = [(0, 6.5), (2, 3), (14, 3), (17, 5.8), (18.5, 8.6), (16.8, 8.8), (15.5, 5.6), (13, 0), (2.5, 0)]
hp = [(bx + a * T, bl - b * T) for a, b in [(1, 6), (3, 3.2), (14, 3.2), (16.2, 5.6), (17.6, 8.6), (18.4, 8.4), (17, 4.6), (14.6, 0.4), (3, 0.4), (0.4, 5.8)]]
d.polygon(hp, fill=(170, 112, 62), outline=INK, width=2)
for k in range(1, 4): d.line((bx + 1.5 * T, bl - (0.4 + k * 0.7) * T, bx + 15.5 * T, bl - (0.4 + k * 0.7) * T), fill=(130, 84, 46), width=2)
for (a, b, w, h, c) in [(4, 1.2, 2, 1, (150, 150, 120)), (11, 1.6, 2.2, 0.9, (120, 140, 150)), (7, 0.8, 1.6, 0.8, (190, 150, 90))]:
    d.rectangle((bx + a * T, bl - (b + h) * T, bx + (a + w) * T, bl - b * T), fill=c, outline=INK)
d.text((bx + 4 * T, bl - 0.9 * T), 'つぎ板', fill=WH, font=f(9))
d.text((bx + 17.6 * T, bl - 9.6 * T), '竜頭(板の切り抜き)', fill=INK, font=f(11))
d.line((bx + 8.5 * T, bl - 3.2 * T, bx + 8.5 * T, bl - 12 * T), fill=(110, 80, 50), width=5)
d.rectangle((bx + 5.5 * T, bl - 11.6 * T, bx + 11.5 * T, bl - 5 * T), fill=(226, 216, 190), outline=INK, width=2)
for (a, b, w, h, c) in [(5.8, 10.8, 2, 2, (200, 180, 150)), (8.6, 7.6, 2.4, 2.2, (190, 200, 210)), (6.2, 6.6, 1.8, 1.4, (210, 170, 150))]:
    d.rectangle((bx + a * T, bl - b * T, bx + (a + w) * T, bl - (b - h) * T), fill=c, outline=MUT)
d.text((bx + 7.3 * T, bl - 9.4 * T), '宝', fill=INK, font=f(40))
d.ellipse((bx + 11.2 * T, bl - 3 * T, bx + 14.4 * T, bl + 0.2 * T), fill=(120, 90, 60), outline=INK, width=2)
for a in range(0, 360, 45):
    cx_, cy2 = bx + 12.8 * T, bl - 1.4 * T
    d.line((cx_, cy2, cx_ + 1.5 * T * math.cos(math.radians(a)), cy2 + 1.5 * T * math.sin(math.radians(a))), fill=INK, width=2)
d.text((bx + 11.4 * T, bl + 0.6 * T), '外輪(両舷に 1 つずつ)', fill=INK, font=f(11))
d.rectangle((bx + 2.4 * T, bl - 5.2 * T, bx + 4.2 * T, bl - 3.2 * T), fill=(170, 120, 60), outline=INK)
d.rectangle((bx + 3 * T, bl - 7.4 * T, bx + 3.6 * T, bl - 5.2 * T), fill=(70, 70, 70), outline=INK)
d.text((bx - 10, bl - 8.4 * T), 'ボイラーの煙突', fill=INK, font=f(11))
d.text((bx, bl + 0.6 * T), '全長 18 マス・幅 5 マス(甲板)', fill=RED, font=f(12))
for i, s in enumerate(['・舳先が高く反り、竜の頭を板で切り抜いて付けている(七福神の宝船のなごり)',
                       '・帆はつぎはぎの布。「宝」の一字だけが大きく書いてある(宝船の帆の決まり)',
                       '・船腹は色も木目もちがう廃材のつぎ板。釘の頭が見える',
                       '・艫(とも)に青銅のボイラーと煙突。両舷に外輪(屋根なし)',
                       '・宝物(米俵、千両箱など)は積んでいない。空の甲板']):
    d.text((60, bl + 40 + i * 20), s, fill=INK, font=f(13))

# ---------- 4. 首振りエンジン ----------
head(1000, Y3, '4. 首振りエンジン(首振り式・揺動式の蒸気機関)', 580)
ox, oy = 1150, Y3 + 250
d.rectangle((ox - 120, oy + 120, ox + 240, oy + 140), fill=(120, 100, 80), outline=INK)
d.ellipse((ox - 14, oy + 96, ox + 14, oy + 124), fill=(200, 140, 70), outline=INK, width=2)
d.text((ox - 110, oy + 146), '軸(トラニオン)で首を振る', fill=INK, font=f(11))
for ang, col in [(-14, (215, 160, 90)), (0, (196, 136, 64)), (14, (215, 160, 90))]:
    a = math.radians(ang)
    def rot(px, py): return (ox + px * math.cos(a) - py * math.sin(a), oy + 110 + px * math.sin(a) + py * math.cos(a))
    pts = [rot(-22, -150), rot(22, -150), rot(22, 0), rot(-22, 0)]
    d.polygon(pts, outline=col if ang else INK, fill=None if ang else col, width=2 if ang else 3)
a = 0
d.line((ox, oy - 40, ox, oy - 120), fill=INK, width=4)
d.ellipse((ox - 70, oy - 200, ox + 70, oy - 60), outline=INK, width=3)
d.line((ox, oy - 130, ox + 40, oy - 160), fill=INK, width=4)
d.text((ox + 80, oy - 150), 'クランク → 外輪の軸', fill=INK, font=f(11))
d.text((ox + 40, oy - 30), 'シリンダー(青銅)', fill=INK, font=f(11))
d.text((ox + 40, oy + 40), '首を振ると、横の口が', fill=INK, font=f(11))
d.text((ox + 40, oy + 56), '給気・排気に交互に重なる', fill=INK, font=f(11))
d.rectangle((ox + 150, oy + 70, ox + 230, oy + 120), fill=(190, 130, 60), outline=INK)
d.text((ox + 152, oy + 74), 'ボイラー', fill=INK, font=f(11))
d.text((ox + 152, oy + 92), '(燃料が熱源)', fill=INK, font=f(10))
for i, s in enumerate(['・シリンダー 1 本を甲板の上にむき出しで据える(動きが見えるように)',
                       '・動くと、シリンダーがゆっくり左右に首を振り、外輪が回り、',
                       '  煙突から湯気。マップでは 2〜3 コマの動き',
                       '・港の鋳物小屋で鋳たばかり。青銅の地肌は新しく赤っぽい']):
    d.text((1000, Y3 + 420 + i * 20), s, fill=INK, font=f(13))

# ---------- 5. 登場するぼぎだぢ ----------
Y5 = Y3 + 530
head(20, Y5, '5. 登場するぼぎだぢと、確かめたいこと', 1560)
for i, s in enumerate(['・鋳物小屋のぼぎ(仮の絵。作者が差し替える。D70): 設定資料の「ぼぎ」。青銅を溶かして首振りエンジンを鋳ている。',
                       '  きーが調べると、るつぼの湯を鋳型に注ぐのを手伝う(一枚絵か、マップの上の短い動き)。',
                       '・発電所には誰もいない。出てくるのは、きーと鋳物小屋のぼぎだけ']):
    d.text((40, Y5 + 40 + i * 22), s, fill=INK, font=f(13))
qs = ['確かめたいこと(→ はおすすめ)',
      '1 炉心のあと → 燃料を拾ったら暗転して港の宝舟の前へ(5 区画を歩いて戻らない。奥へ進むだけの道にする)',
      '2 宝舟の帆 → 「宝」の一字(七福神の宝船の帆の決まり)。字はゲームの字体で入れる',
      '3 発電所の形 → 日本の沸騰水型(四角い原子炉建屋と紅白の排気筒)。名前・社名・実在の場所は描かない',
      '4 鋳造の手伝い → 一枚絵 1 枚(るつぼから湯を注ぐきー)']
for i, s in enumerate(qs): d.text((40, Y5 + 120 + i * 24), s, fill=RED if i == 0 else INK, font=f(14))
im = im.crop((0, 0, W, Y5 + 260))
im.save('/home/user/project/docs/assets/takarabune/design.png')
print('ok', im.size)
