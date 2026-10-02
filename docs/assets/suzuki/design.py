# 荒川の鈴木商店 設計図(2026-10-02)
from PIL import Image, ImageDraw, ImageFont
F = '/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'
f = lambda s: ImageFont.truetype(F, s)
W, H = 1600, 2000
im = Image.new('RGB', (W, H), (245, 240, 228)); d = ImageDraw.Draw(im)
INK = (60, 50, 40); RED = (180, 50, 35); MUT = (120, 110, 100)

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

d.text((20, 12), '③ 設計図(荒川の鈴木商店)  寸法はマップのマス(1マス=32px)。ぼぎだぢは約1マス。実物より縮めてある', fill=INK, font=f(20))

# 1. マップ
head(20, 52, '1. マップの大きさと、中の配置(北が上。この図は 1 マス=14px)')
T = 14
x0, y0 = 30, 100
# D 土手と河川敷 28×14
grid(x0, y0, 28, 14, T, (150, 176, 110), 'D 土手と河川敷 28×14 マス(南の階段から入る)')
r(x0, y0, T, 0, 0, 28, 3, (120, 150, 170), '荒川(入れない。水面に夕日)', (250, 250, 250))
pts = [(5.5, 8.5), (7.5, 4.8), (14, 4.3), (20.5, 4.8), (22.5, 8), (20.5, 9.6), (7, 9.6)]
d.polygon([(x0 + a * T, y0 + b * T) for a, b in pts], fill=(214, 236, 246), outline=(90, 130, 170))
for i, (c0, r0, cw) in enumerate([(6, 8, 15), (8, 6.5, 11), (11, 5, 7)]):
    d.rectangle((x0 + c0 * T, y0 + r0 * T, x0 + (c0 + cw) * T, y0 + (r0 + 1.4) * T), outline=(80, 110, 150), width=2)
    d.text((x0 + (c0 + cw) * T + 4, y0 + r0 * T), f'段{i + 1}', fill=RED, font=f(11))
d.ellipse((x0 + 14 * T, y0 + 4.6 * T, x0 + 15 * T, y0 + 5.6 * T), outline=RED, width=2)
r(x0, y0, T, 2, 9.5, 3, 1, (140, 160, 175), '水たまり', size=9)
r(x0, y0, T, 0, 11, 28, 3, (120, 150, 90))
r(x0, y0, T, 0, 11.8, 28, 1.2, (190, 180, 160), '土手の上の道', size=10)
r(x0, y0, T, 12, 11, 3, 3, (176, 170, 156), '階段', size=10)
# B 路地 28×16
by = y0 + 14 * T + 40
grid(x0, by, 28, 16, T, (170, 166, 160), 'B 町工場と長屋の路地 28×16 マス(南北の路地は 3 マス幅)')
r(x0, by, T, 12, 0, 3, 16, (126, 126, 130))
r(x0, by, T, 0, 7, 28, 2, (150, 146, 140), '東西の小道', size=10)
r(x0, by, T, 1, 1, 5, 4, (196, 180, 150), '長屋')
r(x0, by, T, 6, 1, 5, 4, (196, 180, 150), '印刷屋')
r(x0, by, T, 15, 1, 8, 5, (190, 196, 200), '鈴木商店')
d.rectangle((x0 + 14.5 * T, by + 0.4 * T, x0 + 23.5 * T, by + 1.2 * T), fill=(30, 40, 80), outline=(220, 190, 90))
r(x0, by, T, 24, 1, 3, 4, (200, 170, 150), '銭湯', size=10)
r(x0, by, T, 1, 10, 5, 4, (196, 180, 150), '長屋')
r(x0, by, T, 6, 10, 5, 4, (196, 180, 150), '長屋')
r(x0, by, T, 15, 10, 6, 4, (196, 180, 150), '鋳物工場')
r(x0, by, T, 22, 10, 5, 4, (196, 180, 150), '長屋')
for c, rr in [(18.6, 5.2), (8.1, 4.2)]:
    d.rectangle((x0 + c * T, by + rr * T, x0 + (c + 0.8) * T, by + (rr + 0.8) * T), fill=(250, 240, 200), outline=RED)
d.text((x0 + 28 * T + 10, by + 4.5 * T), '□ = 入口(どれも南の小道に向く)', fill=RED, font=f(11))
# A 停留場 28×10
ay = by + 16 * T + 40
grid(x0, ay, 28, 10, T, (186, 176, 160), 'A 都電の停留場 28×10 マス(入口で出口)')
r(x0, ay, T, 12, 0, 3, 4, (150, 146, 140), '路地へ', size=10)
r(x0, ay, T, 0, 0, 12, 2, (196, 180, 150), '家並み', size=10)
r(x0, ay, T, 15, 0, 13, 2, (196, 180, 150), '家並み', size=10)
r(x0, ay, T, 0, 4, 28, 0.8, (200, 120, 130), 'バラの植え込み', size=9)
r(x0, ay, T, 8, 4.8, 12, 1.4, (210, 200, 180), '停留場のホーム(高さ低い)', size=10)
r(x0, ay, T, 0, 6.2, 28, 2, (120, 110, 100))
r(x0, ay, T, 3, 6.0, 10, 2.4, (230, 220, 180), '都電(一両)', size=11)
r(x0, ay, T, 0, 8.2, 28, 1.8, (196, 180, 150), '線路の向こうも家並み(通れない)', size=10)
# C 店の中 16×12
cx, cy = 560, 100
T2 = 20
grid(cx, cy, 16, 12, T2, (200, 190, 170), 'C 鈴木商店の中 16×12 マス(外の 8×5 より広い)')
r(cx, cy, T2, 0, 0, 16, 2, (160, 150, 140), '奥の壁: 単結晶の見本の棚、設計図、柱時計', size=11)
r(cx, cy, T2, 1, 3, 4, 3, (150, 140, 130), '研磨機', size=11)
r(cx, cy, T2, 11, 3, 4, 3, (150, 140, 130), '結晶炉', size=11)
r(cx, cy, T2, 5, 6, 6, 1.5, (140, 100, 70), 'カウンター', (250, 240, 220), 11)
d.ellipse((cx + 7.5 * T2, cy + 5 * T2, cx + 8.5 * T2, cy + 6 * T2), fill=(40, 40, 40))
d.text((cx + 8.7 * T2, cy + 4.9 * T2), '鉄瓶', fill=INK, font=f(11))
r(cx, cy, T2, 1, 8, 3, 3, (180, 170, 150), '木箱', size=11)
r(cx, cy, T2, 12, 8, 3, 3, (180, 170, 150), '梱包材', size=11)
r(cx, cy, T2, 7, 11.2, 2, 0.8, (250, 240, 200), '入口', size=9)
d.text((cx, cy + 12 * T2 + 22), '南の引き戸から入る。外の路地へ戻るのも同じ戸', fill=INK, font=f(12))
# 右: つながり
tx = 920
d.text((tx, 110), 'つながり', fill=INK, font=f(15))
for i, s in enumerate(['A 停留場 ─北の路地─ B 路地',
                       'B 路地 ─鈴木商店の戸─ C 店の中',
                       'B 路地の北の端 ─土手の階段─ D 河川敷',
                       'D 段3 のてっぺんで荷札を結ぶ → E 一枚絵',
                       'A ホームで都電を調べる → 帰る(納品書を',
                       '   持っているときだけ。それまでは乗れない)']):
    d.text((tx, 140 + i * 24), s, fill=INK, font=f(13))
d.text((tx, 300), '単結晶の段(南極の段々と同じしくみ)', fill=INK, font=f(15))
for i, s in enumerate(['段の手前で北を向いて跳ぶと上がり、南を向くと下りる。',
                       '段1 幅15、段2 幅11、段3 幅7。それぞれ高さ 1 マス。',
                       '荷札がないうちは、てっぺんで調べても何も起きない。']):
    d.text((tx, 328 + i * 22), s, fill=INK, font=f(13))

# 2. 建物の立面図
Y2 = 800
head(20, Y2, '2. 建物の立面図(南から見た正面。1 マス=24px)')
T = 24
gy = Y2 + 300
def ground(x, w): d.line((x - 10, gy, x + w * T + 10, gy), fill=INK, width=2)
# 鈴木商店 8×5 平屋、切妻トタン
sx = 40; ground(sx, 8)
d.rectangle((sx, gy - 4 * T, sx + 8 * T, gy), fill=(186, 192, 196), outline=INK, width=2)
for i in range(0, 8 * T, 6): d.line((sx + i, gy - 4 * T, sx + i, gy), fill=(160, 168, 172))
d.polygon([(sx - 8, gy - 4 * T), (sx + 4 * T, gy - 6 * T), (sx + 8 * T + 8, gy - 4 * T)], fill=(150, 90, 70), outline=INK)
d.rectangle((sx - 24, gy - 5.6 * T, sx + 8 * T + 24, gy - 4.4 * T), fill=(30, 40, 80), outline=(220, 190, 90), width=3)
d.text((sx - 16, gy - 5.4 * T), '宇宙船殻用単結晶 製造販売卸 鈴木商店', fill=(250, 230, 150), font=f(12))
d.rectangle((sx + 0.5 * T, gy - 2.6 * T, sx + 3.5 * T, gy), fill=(150, 156, 160), outline=INK)
for k in range(1, 9): d.line((sx + 0.5 * T, gy - 2.6 * T + k * 7, sx + 3.5 * T, gy - 2.6 * T + k * 7), fill=(120, 126, 130))
d.rectangle((sx + 4.5 * T, gy - 2.4 * T, sx + 6 * T, gy), fill=(120, 90, 60), outline=INK)
d.rectangle((sx + 6.5 * T, gy - 3 * T, sx + 7.5 * T, gy - 2 * T), fill=(220, 210, 160), outline=INK)
d.text((sx, gy + 6), '鈴木商店 8×5 マス・平屋', fill=RED, font=f(12))
for i, s in enumerate(['トタンの壁(灰色、錆すこし)、切妻のトタン屋根(赤茶)',
                       'シャッター 1(閉まっている)、引き戸 1(入口)、窓 1',
                       '看板だけ新しく立派: 紺地に金文字、屋根より幅が広い']):
    d.text((sx, gy + 26 + i * 18), s, fill=INK, font=f(11))
# 長屋 5×4 二階建て
lx = 360; ground(lx, 5)
d.rectangle((lx, gy - 4 * T, lx + 5 * T, gy), fill=(170, 140, 110), outline=INK, width=2)
d.polygon([(lx - 6, gy - 4 * T), (lx + 2.5 * T, gy - 5.2 * T), (lx + 5 * T + 6, gy - 4 * T)], fill=(90, 90, 100), outline=INK)
d.line((lx - 4, gy - 2 * T, lx + 5 * T + 4, gy - 2 * T), fill=(90, 90, 100), width=4)
d.rectangle((lx + 0.6 * T, gy - 1.7 * T, lx + 1.8 * T, gy), fill=(120, 90, 60), outline=INK)
d.rectangle((lx + 2.6 * T, gy - 1.5 * T, lx + 4.4 * T, gy - 0.6 * T), fill=(220, 210, 160), outline=INK)
d.rectangle((lx + 0.8 * T, gy - 3.6 * T, lx + 4.2 * T, gy - 2.6 * T), fill=(220, 210, 160), outline=INK)
d.text((lx, gy + 6), '長屋 5×4 マス・二階建て', fill=RED, font=f(12))
for i, s in enumerate(['板壁、瓦屋根、一階に小さな庇', '戸 1・窓 1、二階に窓 1', '軒先に植木鉢、錆びた自転車、', '名前の消えた表札(ちゃんの痕跡)']):
    d.text((lx, gy + 26 + i * 18), s, fill=INK, font=f(11))
# 印刷屋 5×4
px = 600; ground(px, 5)
d.rectangle((px, gy - 3.6 * T, px + 5 * T, gy), fill=(200, 190, 170), outline=INK, width=2)
d.rectangle((px - 6, gy - 3.6 * T - 10, px + 5 * T + 6, gy - 3.6 * T), fill=(90, 90, 100), outline=INK)
d.rectangle((px + 0.5 * T, gy - 2.2 * T, px + 4.5 * T, gy), fill=(170, 200, 210), outline=INK)
d.line((px + 2.5 * T, gy - 2.2 * T, px + 2.5 * T, gy), fill=INK)
d.rectangle((px + 1 * T, gy - 3.3 * T, px + 4 * T, gy - 2.6 * T), fill=(240, 236, 220), outline=INK)
d.text((px + 1.1 * T, gy - 3.25 * T), '活版印刷', fill=INK, font=f(11))
d.text((px, gy + 6), '印刷屋 5×4 マス・平屋(看板建築)', fill=RED, font=f(12))
for i, s in enumerate(['正面だけ平らな看板建築、モルタル', 'ガラスの引き戸 2 枚(中に活版の印刷機)', '入口は南の小道側']):
    d.text((px, gy + 26 + i * 18), s, fill=INK, font=f(11))
# 鋳物工場 6×4 と銭湯の煙突
ix = 860; ground(ix, 6)
d.rectangle((ix, gy - 3 * T, ix + 6 * T, gy), fill=(150, 140, 130), outline=INK, width=2)
d.polygon([(ix, gy - 3 * T), (ix + 2 * T, gy - 4.2 * T), (ix + 2 * T, gy - 3 * T), (ix + 4 * T, gy - 4.2 * T), (ix + 4 * T, gy - 3 * T), (ix + 6 * T, gy - 4.2 * T), (ix + 6 * T, gy - 3 * T)], fill=(110, 100, 95), outline=INK)
d.rectangle((ix + 1.5 * T, gy - 2.2 * T, ix + 4.5 * T, gy), fill=(60, 40, 30), outline=INK)
d.rectangle((ix + 2 * T, gy - 1 * T, ix + 2.6 * T, gy - 0.4 * T), fill=(240, 150, 60))
d.text((ix, gy + 6), '鋳物の町工場 6×4 マス', fill=RED, font=f(12))
for i, s in enumerate(['のこぎり屋根、開いた大戸 1', '奥で炉の火が赤い。鋳型が積んである']):
    d.text((ix, gy + 26 + i * 18), s, fill=INK, font=f(11))
ex = 1120; ground(ex, 3)
d.rectangle((ex, gy - 3 * T, ex + 3 * T, gy), fill=(200, 170, 150), outline=INK, width=2)
d.polygon([(ex - 6, gy - 3 * T), (ex + 1.5 * T, gy - 4.4 * T), (ex + 3 * T + 6, gy - 3 * T)], fill=(90, 90, 100), outline=INK)
d.rectangle((ex + 2 * T, gy - 10 * T, ex + 2.6 * T, gy - 3.6 * T), fill=(170, 120, 100), outline=INK)
for k in range(3): d.ellipse((ex + 1.8 * T + k * 10, gy - 11 * T - k * 18, ex + 2.9 * T + k * 10, gy - 10.2 * T - k * 18), fill=(235, 235, 235))
d.text((ex, gy + 6), '銭湯 3×4 マス', fill=RED, font=f(12))
for i, s in enumerate(['煙突は高さ 6 マス、', 'まだ湯気が出ている。', '中には入らない']):
    d.text((ex, gy + 26 + i * 18), s, fill=INK, font=f(11))
# 都電
tx2 = 1300; ground(tx2, 9)
d.rectangle((tx2, gy - 2.6 * T, tx2 + 9 * T, gy - 0.3 * T), fill=(236, 226, 186), outline=INK, width=2)
d.rectangle((tx2, gy - 1.2 * T, tx2 + 9 * T, gy - 0.3 * T), fill=(200, 80, 100), outline=INK)
for k in range(6): d.rectangle((tx2 + 0.6 * T + k * 1.4 * T, gy - 2.3 * T, tx2 + 1.6 * T + k * 1.4 * T, gy - 1.5 * T), fill=(170, 200, 210), outline=INK)
d.line((tx2 + 4.5 * T, gy - 2.6 * T, tx2 + 4.5 * T, gy - 3.6 * T), fill=INK, width=2)
d.line((tx2 + 3.5 * T, gy - 3.6 * T, tx2 + 5.5 * T, gy - 3.6 * T), fill=INK, width=2)
d.text((tx2, gy + 6), '都電 一両 9×2.5 マス', fill=RED, font=f(12))
for i, s in enumerate(['実物は長さ約 13m。クリーム色に帯、', '窓 6、パンタグラフ 1。', '車内には入らない']):
    d.text((tx2, gy + 26 + i * 18), s, fill=INK, font=f(11))

# 3. 単結晶
Y3 = 1220
head(20, Y3, '3. 宇宙船殻用単結晶(D の主役。景色として置く)', 760)
cx3, cy3 = 60, Y3 + 60
T = 20
P = [(0, 7), (3, 2), (14, 0), (25, 1.5), (28, 6), (24, 9), (4, 9)]
d.polygon([(cx3 + a * T, cy3 + b * T) for a, b in P], fill=(214, 236, 246), outline=(80, 120, 160))
for a, b in [((3, 2), (4, 9)), ((14, 0), (13, 9)), ((25, 1.5), (24, 9)), ((3, 2), (25, 1.5))]:
    d.line((cx3 + a[0] * T, cy3 + a[1] * T, cx3 + b[0] * T, cy3 + b[1] * T), fill=(160, 200, 222), width=2)
d.polygon([(cx3 + 18 * T, cy3 + 1 * T), (cx3 + 25 * T, cy3 + 1.5 * T), (cx3 + 24 * T, cy3 + 6 * T)], fill=(250, 214, 170))
d.text((cx3 + 7 * T, cy3 + 4.5 * T), '長さ 17 マス × 奥行き 5 マス(地図上)', fill=INK, font=f(13))
for i, s in enumerate(['・透明に近い薄い水色。西に向いた面だけ夕日の橙を映す',
                       '・六角でなく、ダイヤの八面体を横に寝かせた形(切り子面)',
                       '・南の面が 3 段の段になっていて、ジャンプで登れる',
                       '・地面に半分めりこみ、まわりの草が倒れている',
                       '・てっぺんに荷札を結ぶ杭(出荷用の金具)が 1 本']):
    d.text((60, Y3 + 260 + i * 22), s, fill=INK, font=f(13))

# 4. 登場するぼぎだぢ
head(820, Y3, '4. 登場するぼぎだぢ(設定資料にいるものだけ)', 760)
d.ellipse((840, Y3 + 60, 900, Y3 + 110), fill=(40, 40, 40))
d.rectangle((892, Y3 + 72, 912, Y3 + 80), fill=(40, 40, 40))
d.arc((850, Y3 + 44, 890, Y3 + 74), 180, 360, fill=(40, 40, 40), width=4)
for i, s in enumerate(['鉄瓶(店番。絵は仮、作者が差し替える。D70)',
                       '怒れる南部鉄器。黒い鉄、霰(あられ)の粒々の地肌、つる 1 本。',
                       'めったに喋らない(設定資料)。怒ると口から湯気がふき出す。',
                       'カウンターの上に置かれている。大きさ 1 マス。']):
    d.text((930, Y3 + 54 + i * 22), s, fill=INK, font=f(13))
for i, s in enumerate(['ほかに出てくるのは、きーだけ。印刷屋には人がいない',
                       '(下の 5-2 を参照)。']):
    d.text((840, Y3 + 160 + i * 22), s, fill=INK, font=f(13))

# 5. 決めてほしいこと
Y5 = 1640
head(20, Y5, '5. 決めてほしいこと(おすすめつき)')
qs = ['1. マップの大きさと中の配置(A 28×10、B 28×16、C 16×12、D 28×14)で、よいか。',
      '2. 印刷屋に人がいない。伝票を印刷機に差しこむと、印刷機がひとりでに荷札を刷る。',
      '   おすすめ: これにする(新しい登場人物を足さない。ちゃんが去った世界らしさにもなる)。',
      '3. 都電は、納品書を持つまで乗れない(調べると「まだ帰れない」気がする)。おすすめ: これにする。',
      '4. 停留場の名前。おすすめ: 実在の名前は出さない(駅名標の字がにじんで読めない。納品書と同じ)。',
      '5. 鈴木商店の看板は、屋根より幅の広い紺地に金文字。おすすめ: これにする(「立派すぎる」がひと目でわかる)。',
      '6. 鉄瓶が怒っている理由は描かない(湯気がふき出すだけ)。おすすめ: 描かない。']
for i, s in enumerate(qs): d.text((30, Y5 + 44 + i * 26), s, fill=INK, font=f(14))
d.text((30, Y5 + 44 + 8 * 26), '資料メモ: 荒川区は隅田川沿い。隅田川の荒川区のあたりは 1965 年まで正式には「荒川」だった。今の名前の荒川(放水路)は足立区側。',
       fill=MUT, font=f(12))
d.text((30, Y5 + 44 + 9 * 26), '        → 断片名は作者の決めた「荒川」のまま。景色は堤防と広い河川敷(放水路側の姿)で描く。', fill=MUT, font=f(12))
d.text((30, H - 30), '参考: 都電荒川線(8800形など、一両の路面電車)、南部鉄器の鉄瓶、看板建築、のこぎり屋根の町工場', fill=MUT, font=f(11))
im.save('/home/user/project/docs/assets/suzuki/design.png')
print('ok')
