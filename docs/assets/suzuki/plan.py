# 荒川の鈴木商店 配置図(2026-10-02)。北が上
from PIL import Image, ImageDraw, ImageFont
F = '/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'
f = lambda s: ImageFont.truetype(F, s)
W, H = 1560, 1100
im = Image.new('RGB', (W, H), (242, 236, 222)); d = ImageDraw.Draw(im)
INK = (60, 50, 40); RED = (190, 60, 40); MUT = (120, 110, 100)
d.text((20, 12), '① 配置図(北が上。荒川区の下町。今、雨上がりの夕方)', fill=INK, font=f(20))
X0, Y0, X1, Y1 = 20, 48, 980, 1080
# 空と川(北)
d.rectangle((X0, Y0, X1, Y0 + 120), fill=(236, 186, 140))
d.rectangle((X0, Y0 + 60, X1, Y0 + 120), fill=(226, 160, 120))
d.ellipse((X0 + 40, Y0 + 70, X0 + 110, Y0 + 140), fill=(250, 200, 110))
d.text((X0 + 120, Y0 + 88), '夕日(西)', fill=INK, font=f(14))
d.ellipse((X1 - 120, Y0 + 14, X1 - 84, Y0 + 50), fill=(250, 248, 240), outline=(170, 160, 150))
d.arc((X1 - 150, Y0 + 24, X1 - 54, Y0 + 42), 0, 360, fill=(160, 150, 150))
d.text((X1 - 220, Y0 + 56), '欠けて輪のある月', fill=INK, font=f(13))
d.rectangle((X0, Y0 + 120, X1, Y0 + 200), fill=(120, 150, 170))
d.text((X0 + 12, Y0 + 128), '荒川(水面に夕日)', fill=(250, 250, 250), font=f(15))
# D 河川敷と単結晶
d.rectangle((X0, Y0 + 200, X1, Y0 + 420), fill=(150, 176, 110))
d.text((X0 + 12, Y0 + 208), 'D 河川敷(草野球のグラウンド、水たまり)', fill=INK, font=f(15))
pts = [(X0 + 260, Y0 + 300), (X0 + 330, Y0 + 240), (X0 + 640, Y0 + 230), (X0 + 740, Y0 + 290), (X0 + 670, Y0 + 370), (X0 + 320, Y0 + 372)]
d.polygon(pts, fill=(214, 236, 246), outline=(110, 150, 180))
for a, b in [(1, 5), (2, 4), (1, 4)]: d.line((pts[a], pts[b]), fill=(160, 200, 222), width=2)
d.text((X0 + 380, Y0 + 290), '宇宙船殻用単結晶', fill=INK, font=f(18))
d.text((X0 + 380, Y0 + 314), '(船体ほどの大きさ。夕日で光る)', fill=INK, font=f(13))
for i, (x, y) in enumerate([(X0 + 340, Y0 + 356), (X0 + 420, Y0 + 300), (X0 + 520, Y0 + 262)]):
    d.text((x, y - 18), f'段{i + 1}', fill=RED, font=f(13))
d.ellipse((X0 + 600, Y0 + 238, X0 + 618, Y0 + 256), outline=RED, width=3)
d.text((X0 + 624, Y0 + 236), '荷札を結ぶ(てっぺん)', fill=RED, font=f(13))
# 土手
d.rectangle((X0, Y0 + 420, X1, Y0 + 470), fill=(120, 150, 90))
d.rectangle((X0, Y0 + 438, X1, Y0 + 452), fill=(190, 180, 160))
d.text((X0 + 12, Y0 + 434), '土手の上の道', fill=INK, font=f(14))
d.rectangle((X0 + 450, Y0 + 420, X0 + 510, Y0 + 470), fill=(176, 170, 156))
d.text((X0 + 520, Y0 + 452), '階段', fill=INK, font=f(13))
# B 町工場の路地
d.rectangle((X0, Y0 + 470, X1, Y0 + 840), fill=(170, 166, 160))
d.rectangle((X0 + 440, Y0 + 470, X0 + 520, Y0 + 840), fill=(126, 126, 130))
d.text((X0 + 12, Y0 + 478), 'B 町工場と長屋の路地(雨上がり、水たまり、植木鉢、自転車)', fill=INK, font=f(15))
def box(x, y, w, h, label, c=(196, 180, 150), sub=None):
    d.rectangle((x, y, x + w, y + h), fill=c, outline=(90, 80, 70), width=2)
    d.text((x + 6, y + 6), label, fill=INK, font=f(14))
    if sub: d.text((x + 6, y + 26), sub, fill=MUT, font=f(12))
box(X0 + 60, Y0 + 510, 160, 100, '長屋')
box(X0 + 240, Y0 + 510, 180, 100, '印刷屋', sub='荷札を刷ってもらう')
box(X0 + 540, Y0 + 516, 240, 114, '鈴木商店', c=(190, 196, 200), sub='トタンの町工場')
d.rectangle((X0 + 530, Y0 + 492, X0 + 790, Y0 + 512), fill=(30, 40, 80), outline=(220, 190, 90), width=2)
d.text((X0 + 536, Y0 + 494), '宇宙船殻用単結晶 製造販売卸 鈴木商店', fill=(250, 230, 150), font=f(12))
box(X0 + 800, Y0 + 520, 150, 100, '銭湯の煙突', c=(200, 170, 150))
box(X0 + 60, Y0 + 680, 200, 110, '長屋')
box(X0 + 280, Y0 + 680, 140, 110, '長屋')
box(X0 + 560, Y0 + 680, 180, 110, '鋳物の町工場', sub='火の粉、鋳型')
box(X0 + 760, Y0 + 680, 190, 110, '長屋')
# A 都電の停留場
d.rectangle((X0, Y0 + 840, X1, Y1), fill=(186, 176, 160))
d.rectangle((X0, Y0 + 920, X1, Y0 + 960), fill=(120, 110, 100))
for x in range(X0, X1, 24): d.line((x, Y0 + 920, x, Y0 + 960), fill=(150, 140, 120), width=3)
d.line((X0, Y0 + 928, X1, Y0 + 928), fill=(200, 200, 210), width=3); d.line((X0, Y0 + 952, X1, Y0 + 952), fill=(200, 200, 210), width=3)
d.rectangle((X0 + 380, Y0 + 880, X0 + 600, Y0 + 918), fill=(210, 200, 180), outline=(90, 80, 70))
d.text((X0 + 390, Y0 + 888), '停留場のホーム', fill=INK, font=f(14))
d.rectangle((X0 + 150, Y0 + 916, X0 + 330, Y0 + 966), fill=(230, 220, 180), outline=(80, 70, 60), width=2)
d.text((X0 + 170, Y0 + 930), '都電(一両)', fill=INK, font=f(14))
d.text((X0 + 12, Y0 + 848), 'A 都電の停留場(入口。都電で着き、都電で帰る)。線路沿いにバラの植え込み', fill=INK, font=f(15))
d.text((X0 + 12, Y0 + 980), '南: 線路の向こうも家並み(通れない)', fill=MUT, font=f(13))
# 右: 流れとマップ
RX = 1000
d.text((RX, 60), '② 流れ', fill=INK, font=f(20))
steps = [
    'A 停留場に都電が着く(入口)',
    'B 路地の奥に、立派すぎる看板',
    'C 鈴木商店の中: 鉄瓶が湯気を噴いて怒っている。',
    '   カウンターに出荷の伝票 → 道具「伝票」',
    'B 印刷屋で荷札を刷ってもらう',
    '   (伝票を見せる)',
    'D 土手を越えて河川敷へ。単結晶の切り子面を',
    '   ジャンプで 3 段上がり、てっぺんに荷札を結ぶ',
    'E 一枚絵: 単結晶が浮かび上がり、',
    '   夕焼けの空へ出荷されていく',
    'C 店に戻ると、カウンターに「納品書」',
    '   (宛先がにじんで読めない)→ 条件達成',
    'A 都電に乗って帰る',
]
for i, s in enumerate(steps): d.text((RX, 100 + i * 28), s, fill=INK, font=f(15))
d.text((RX, 480), '③ マップ(どれも画面 15×9.4 マスより大きく)', fill=INK, font=f(18))
maps = ['A 停留場と線路      28×10', 'B 町工場の路地      28×16', 'C 鈴木商店の中      16×12', 'D 土手と河川敷      28×14']
for i, s in enumerate(maps): d.text((RX, 516 + i * 26), s, fill=INK, font=f(15))
d.text((RX, 640), '④ 作者が採用した AI の案(D74)', fill=RED, font=f(18))
ideas = [
    '・店の中は外より広い(看板と同じく、ありえない)',
    '・鉄瓶はしゃべらない。怒ると湯気がふき出す',
    '・長屋の軒先に、ちゃんの痕跡(錆びた自転車、',
    '  名前の消えた表札)',
    '・銭湯の煙突から、まだ湯気が出ている',
    '・ジャンプで単結晶を登る(霞ヶ浦で覚えた能力)',
]
for i, s in enumerate(ideas): d.text((RX, 676 + i * 26), s, fill=INK, font=f(15))
im.save('/home/user/project/docs/assets/suzuki/plan.png')
print('ok')
