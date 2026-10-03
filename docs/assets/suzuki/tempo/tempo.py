# 鈴木商店の結末のつなぎとテンポの検討(2026-10-03、メモ 15)。今と案を、時間の帯で並べる
from PIL import Image, ImageDraw, ImageFont
F = '/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'
f = lambda s: ImageFont.truetype(F, s)
A = '/home/user/project/field/assets/worlds/suzuki/'
W, H = 1600, 880
im = Image.new('RGB', (W, H), (245, 240, 228)); d = ImageDraw.Draw(im)
INK = (60, 50, 40); RED = (190, 50, 40); MUT = (120, 110, 100)
d.text((20, 12), '鈴木商店の結末: 場面のつなぎと、流れ星 → 爆発のテンポ(検討)', fill=INK, font=f(22))
# 1. 前の絵が一瞬出るわけ
d.text((20, 52), '1. 前の絵が一瞬出るわけ(コードを読んで、画面を撮って確かめた)', fill=INK, font=f(17))
for i, s in enumerate(['・一枚絵を A で閉じると、絵はその場で消える。そのあと暗転が始まるので、暗くなりきるまでの約 0.45 秒、前のマップ(河川敷、上昇の空、宇宙)が見える',
                       '・流れ星の絵を閉じたあとも同じ。宇宙の場面が一瞬もどってから暗くなり、暗いまま約 0.8 秒、明けるのに 1.5 秒。爆発は明けきる前に始まるので、暗さに半分かくれる',
                       '・直し方の案: 一枚絵から次の場面へは、絵を消さずに「絵の上から次の場面へ、じかに重ねて移す(クロスフェード)」。暗転をはさまない。前のマップは出ない']):
    d.text((30, 80 + i * 24), s, fill=INK, font=f(14))
# 2. 場面のつなぎ(全体)
Y = 170
d.text((20, Y), '2. 場面ごとのつなぎ(案)', fill=INK, font=f(17))
rows = [('穴に入る → 筒の中の絵', 'いまのまま(河川敷が暗くなり、絵が浮かぶ)'),
        ('筒の中の絵 → 上昇', '絵から上昇の場面へ、じかに重ねる(暗転なし)。上昇は重なりきってから動きだす'),
        ('上昇 → 筒の中の絵(地球)', 'いまのまま(上昇の上に絵が浮かぶ)'),
        ('筒の中の絵 → 衛星軌道', '絵から衛星軌道へ、じかに重ねる'),
        ('衛星軌道 → 宇宙を遊泳', 'いまのまま(同じ一コマでつなぐ。暗転なし)'),
        ('遊泳 → 流れ星の絵 → 爆発 → クレーター', '3. のとおり。ボタンを待たずに一気に。だんだん速く'),
        ('クレーター(黒こげのきー)', '煙が晴れると、真ん中に黒こげのきー。そこで操作がもどる')]
for i, (a, b) in enumerate(rows):
    y = Y + 28 + i * 24
    d.text((30, y), a, fill=RED if i == 5 else INK, font=f(14)); d.text((380, y), '→ ' + b, fill=INK, font=f(14))
# 3. テンポの帯
Y3 = 380
d.text((20, Y3), '3. 流れ星の絵から爆発まで(秒。上が今、下が案)', fill=INK, font=f(17))
X0, PX = 60, 115   # 1 秒 = 115px
def ruler(y, n):
    for s in range(n + 1):
        d.line((X0 + s * PX, y, X0 + s * PX, y + 6), fill=MUT); d.text((X0 + s * PX - 4, y + 8), str(s), fill=MUT, font=f(12))
def bar(y, t0, t1, label, col, tc=(255, 255, 255)):
    d.rectangle((X0 + t0 * PX, y, X0 + t1 * PX, y + 34), fill=col, outline=INK)
    d.text((X0 + t0 * PX + 4, y + 9), label, fill=tc, font=f(12))
yA = Y3 + 34
d.text((20, yA - 2), '今', fill=INK, font=f(15))
bar(yA, 0, 0.6, '絵が浮く', (60, 70, 120))
bar(yA, 0.6, 3.2, '流れ星の絵(A を押すまで待つ。人による)', (40, 50, 100))
bar(yA, 3.2, 3.65, '宇宙が一瞬', (170, 60, 50))
bar(yA, 3.65, 4.5, '暗いまま', (20, 20, 24))
bar(yA, 4.5, 6.0, '明ける(1.5 秒)', (70, 70, 90))
bar(yA, 4.8, 7.0, '爆発', (200, 120, 40), INK)
yB = yA + 60
d.text((20, yB - 2), '案', fill=RED, font=f(15))
segs = [(0, 0.3, '重ねる', (70, 80, 130)), (0.3, 1.6, '流れ星の絵(少しずつ寄る)', (40, 50, 100)), (1.6, 2.2, '寄る 1', (60, 70, 140)),
        (2.2, 2.5, '寄る2', (80, 90, 160)), (2.5, 2.65, '3', (110, 120, 190)), (2.65, 2.73, '', (255, 255, 255)), (2.73, 4.6, '白が引いて爆発(画面がゆれる)→ 煙が晴れて黒こげのきー', (200, 120, 40))]
for t0, t1, lab, col in segs: bar(yB, t0, t1, lab, col, INK if col[0] > 150 else (255, 255, 255))
d.text((X0 + 2.6 * PX, yB - 18), '白く光る', fill=RED, font=f(12))
ruler(yB + 40, 7)
for i, s in enumerate(['・ボタンを待たない。流れ星の絵 1.3 秒 → 寄った絵 0.6 → 0.3 → 0.15 秒と、切りかえの間を半分ずつ縮める(だんだん速く)',
                       '・寄る先は流れ星の頭。絵の中で右下(着地するほう)へずれながら寄る。新しい絵は描かず、流れ星の絵を大きく切り出す',
                       '・最後に白く光った裏で、夜の河川敷のクレーターに切りかえる。白が引くと、もう火の玉が上がっている(暗転しない)',
                       '・爆発のあいだ画面を小さくゆらす(0.6 秒、だんだん弱く)。煙が晴れると、真ん中に黒こげのきー。そこで操作がもどる',
                       '・流れ星の絵が出てから爆発まで約 2.7 秒(今は人によって 5 秒以上)']):
    d.text((30, yB + 70 + i * 22), s, fill=INK, font=f(14))
# 4. 案の一コマずつ(見本)
Y4 = yB + 200
d.text((20, Y4), '4. 案の一コマずつ(見本。流れ星の絵を切り出しただけ)', fill=INK, font=f(17))
vf = Image.open(A + 'v_fall.png').convert('RGB')
hx, hy = 212, 91
frames = []
for z, dx, dy in [(1.0, 0, 0), (1.12, 2, 1), (1.7, 4, 3), (2.8, 4, 3), (4.5, 3, 2)]:
    w, h = 320 / z, 192 / z
    cx = min(max(hx + dx, w / 2), 320 - w / 2); cy = min(max(hy + dy, h / 2), 192 - h / 2)
    frames.append(vf.crop((int(cx - w / 2), int(cy - h / 2), int(cx + w / 2), int(cy + h / 2))).resize((240, 144), Image.NEAREST))
frames.append(Image.new('RGB', (240, 144), (255, 255, 250)))
cr = Image.open(A + 'bg_crater.png').convert('RGB').crop((14 * 32 - 240, int(5.8 * 32) - 150, 14 * 32 + 240, int(5.8 * 32) + 150)).resize((240, 150))
cd = ImageDraw.Draw(cr); cd.ellipse((90, 45, 150, 85), fill=(255, 190, 90)); cd.ellipse((106, 55, 134, 75), fill=(255, 250, 220))
frames.append(cr.crop((0, 3, 240, 147)))
labs = ['0.3 秒 絵', '1.0 少し寄る', '1.6 寄る 1', '2.2 寄る 2', '2.5 寄る 3', '2.65 白', '2.73 爆発']
for i, (fr, lab) in enumerate(zip(frames, labs)):
    x = 20 + i * 224; im.paste(fr.resize((214, 128)), (x, Y4 + 30)); d.text((x, Y4 + 162), lab, fill=INK, font=f(13))
im.save('/home/user/project/docs/assets/suzuki/tempo/tempo.png')
print('ok')
