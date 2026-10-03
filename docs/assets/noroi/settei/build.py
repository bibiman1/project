# 呪いの野犬 マシンの設計図(2026-10-03、D119)。ビルダーとしての組み立て図。青焼き風。PixelLab に出す前の確認用
import json, math
from PIL import Image, ImageDraw, ImageFont
F = '/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'
f = lambda s: ImageFont.truetype(F, s)
P = '/home/user/project/'
O = P + 'docs/assets/noroi/settei/'
G = P + 'field/assets/worlds/noroi/'
BG = (22, 44, 82); LN = (230, 240, 250); CY = (150, 210, 240); YL = (255, 214, 110); RD = (255, 120, 100); GR = (140, 230, 150)
def sheet(w, h, title, sub):
    im = Image.new('RGB', (w, h), BG); d = ImageDraw.Draw(im)
    for x in range(0, w, 40): d.line((x, 0, x, h), fill=(30, 56, 98))
    for y in range(0, h, 40): d.line((0, y, w, y), fill=(30, 56, 98))
    d.text((30, 18), title, fill=LN, font=f(30)); d.text((30, 58), sub, fill=CY, font=f(16))
    d.line((30, 86, w - 30, 86), fill=LN, width=2)
    return im, d
def label(d, xy, txy, t, col=YL, s=15):
    d.line((xy, txy), fill=col, width=1); d.ellipse((xy[0] - 3, xy[1] - 3, xy[0] + 3, xy[1] + 3), fill=col)
    d.text((txy[0] + 4, txy[1] - s // 2 - 1), t, fill=col, font=f(s))
def box(d, xy, t):
    d.text(xy, t, fill=CY, font=f(18))
def text(d, x, y, items, s=16, gap=7, w=None):
    for it in items:
        col = LN
        if it.startswith('!'): col, it = RD, it[1:]
        if it.startswith('+'): col, it = GR, it[1:]
        if it.startswith('#'): d.text((x, y), it[1:], fill=YL, font=f(s + 4)); y += s + 12 + gap; continue
        d.text((x, y), it, fill=col, font=f(s)); y += s + gap
    return y
def ref(im, src, xy, h, crop=None, cap=None, d=None):
    s = Image.open(src).convert('RGB')
    if crop: s = s.crop(crop)
    k = h / s.height; s = s.resize((int(s.width * k), h), Image.LANCZOS)
    im.paste(s, xy); ImageDraw.Draw(im).rectangle((xy[0], xy[1], xy[0] + s.width, xy[1] + h), outline=CY)
    if cap: ImageDraw.Draw(im).text((xy[0], xy[1] + h + 4), cap, fill=CY, font=f(13))
    return s.width
def arrow(d, a, b, col=GR, w=3):
    d.line((a, b), fill=col, width=w); ang = math.atan2(b[1] - a[1], b[0] - a[0])
    for s in (-0.5, 0.5): d.line((b, (b[0] - 16 * math.cos(ang + s), b[1] - 16 * math.sin(ang + s))), fill=col, width=w)
def wheel(d, cx, cy, r, col=LN, hub=True, fill=None):
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=col, width=2, fill=fill)
    if hub: d.ellipse((cx - r * 0.35, cy - r * 0.35, cx + r * 0.35, cy + r * 0.35), outline=col, width=2)

# ================= ぼぎカー =================
im, d = sheet(1800, 1240, 'BUILD SHEET 01  ぼぎカー(きーの車)', 'ビルダーの組み立て図。作者の写真(pic/627c157c.jpg、c1fd15f2.jpg)から板の輪郭をそのまま取った。全部を描く(初稿は左はしが切れた)')
pk = json.load(open(O + 'plank.json'))
def plank(ox, oy, k, flip=False, flames=False):
    xs = [p[0] for p in pk['poly']]; x0, x1 = min(xs), max(xs)
    tr = lambda x, y: (ox + ((x1 - (x - x0) - x0) if flip else (x - x0)) * k, oy + (y - 60) * k)
    d.polygon([tr(*p) for p in pk['poly']], outline=LN, fill=(60, 44, 40))
    for hx, hy, hr in pk['holes'][:1]: c = tr(hx, hy); d.ellipse((c[0] - hr * k, c[1] - hr * k, c[0] + hr * k, c[1] + hr * k), outline=LN, width=2, fill=BG)
    return tr
# 横から(前 = 目穴のある高いはし。右へ進む)
ox, oy, k = 560, 150, 1.2
tr = plank(ox, oy, k, flip=True)
for hx, hy, hr in pk['holes'][1:]:
    c = tr(hx, hy); wheel(d, c[0], c[1] + 8, 60, fill=(200, 200, 196)); d.ellipse((c[0] - 9, c[1] - 1, c[0] + 9, c[1] + 17), fill=(120, 120, 120))
box(d, (ox, 120), '横から(東へ進む)')
eye = tr(*pk['holes'][0][:2])
label(d, eye, (eye[0] + 60, eye[1] - 60), '目穴(顔の目)。この高いはしが「前」', YL)
label(d, tr(640, 120), (600, 470), '一枚の反った板。柿渋(つやのある濃い茶)、木目は長さの向き')
c = tr(252, 246); label(d, (c[0] + 30, c[1] + 40), (c[0] + 60, c[1] + 120), '白いナイロンの戸車(中にベアリング)')
c = tr(690, 268); label(d, (c[0], c[1] + 8), (c[0] + 40, c[1] + 120), 'ボルトが車軸。座金とナット')
arrow(d, (1420, 210), (1520, 210)); d.text((1424, 222), '進む向き', fill=GR, font=f(15))
# きーの乗り方
ki = Image.open('/tmp/claude-0/-home-user-project/e7cb1a9b-b078-5ece-9cdf-0647f5a9d6fa/scratchpad/ki_east.png').resize((37 * 4, 21 * 4), Image.NEAREST)
kp = tr(395, 124); im.paste(ki, (int(kp[0]) - 74, int(kp[1]) - 72), ki)
label(d, (int(kp[0]), int(kp[1]) - 30), (int(kp[0]) - 120, 112), 'きーは顔のうしろのくぼみに、うつぶせ(作者のスケッチ)', GR)
# 上から・前から
ty = 640; box(d, (560, ty - 30), '上から')
L = 685 * 1.2 * 0.9; tx = 560
d.rectangle((tx, ty + 34, tx + L, ty + 50), outline=LN, fill=(60, 44, 40), width=2)
for wx in (tx + 60, tx + L - 70):
    for s in (-1, 1):
        d.rectangle((wx - 24, ty + 42 + s * 34 - 9, wx + 24, ty + 42 + s * 34 + 9), outline=LN, width=2, fill=(200, 200, 196))
    d.line((wx, ty + 42 - 46, wx, ty + 42 + 46), fill=(170, 170, 170), width=4)
label(d, (tx + 60, ty + 42 - 46), (tx + 120, ty - 6), 'ボルトの頭とナットが外に出る')
label(d, (tx + 300, ty + 42), (tx + 320, ty + 110), '板の厚み(約 2 センチ相当)。戸車は板の両側に 2 つずつ')
fx = 1500; box(d, (fx - 60, ty - 30), '前から(顔)')
d.rectangle((fx - 8, ty + 0, fx + 8, ty + 90), outline=LN, fill=(60, 44, 40), width=2)
d.ellipse((fx - 5, ty + 20, fx + 5, ty + 30), outline=LN)
for s in (-1, 1): d.rectangle((fx + s * 34 - 9, ty + 66, fx + s * 34 + 9, ty + 114), outline=LN, width=2, fill=(200, 200, 196))
d.line((fx - 46, ty + 90, fx + 46, ty + 90), fill=(170, 170, 170), width=4)
# 参考
w1 = ref(im, P + 'pic/627c157c.jpg', (30, 110), 200, crop=(40, 110, 380, 290), cap='作者の写真(組み立て後)', d=d)
ref(im, P + 'pic/c1fd15f2.jpg', (30, 340), 230, cap='部品(板、ボルト 2、戸車 4、ナット、座金)', d=d)
text(d, 30, 820, [
    '#ビルダーの仕様',
    '形: 写真の板の輪郭そのまま。両はしまで描く。目穴は前の高いはしに一つ',
    '足まわり: 白いナイロンの戸車 4 つ(戸板用のベアリング)。2 本のボルトが車軸で、板の両側に戸車',
    '仕上げ: 柿渋(つやのある濃い茶、臭い)。みとんのカスタムで炎: 顔(前)から後ろへ流れる赤・橙・黄、細い白のピンストライプで縁どる',
    '走り: 無慣性推進駆動(0〜100km 0.3 秒、作者)。出るときも止まるときも傾かない・ゆれない。ほこりだけが遅れてついてくる',
    '#ゲームの絵',
    '大きさ: 全長 約 64 ドット、高さ 約 22(タイヤ込み)。きーは 37×21 ドット',
    '向き: 東(横)、西(東の反転)、北(うしろ)、南(顔)。炎あり・炎なし。戸車が回る 2 コマ。きーが乗った絵と、空の絵',
    '!初稿の直し: 左はしが切れていた / 進む向きが逆だった(低いはしを前にしていた)→ 目穴の高いはしを前にする',
], s=17, gap=8)
im.save(O + 'build1_bogicar.png')

# ================= ぽんぽんカー =================
im, d = sheet(1800, 1240, 'BUILD SHEET 02  ぽんぽんカー(呪いの野犬の頭)', '作者「そもそもぼぎなので、ひとがのるすぺーすがいらない。車体にでかいV8が搭載されているだけでいい」。扉絵 pic/218717_989129975_3 から')
ref(im, P + 'docs/assets/noroi/ref/ponpon.png', (30, 110), 300, cap='作者のスケッチ(扉絵)', d=d)
# 横から
bx, by = 760, 600
d.rounded_rectangle((bx, by - 90, bx + 420, by), 40, outline=LN, fill=(214, 200, 168), width=3)   # 低い桶の車体
d.line((bx + 20, by - 50, bx + 400, by - 50), fill=(200, 60, 50), width=6)
# V8 のブロック(車体からはみ出す)
d.rectangle((bx + 110, by - 160, bx + 330, by - 90), outline=LN, fill=(150, 150, 156), width=2)
for k in range(4): d.rectangle((bx + 120 + k * 52, by - 186, bx + 166 + k * 52, by - 160), outline=LN, fill=(190, 190, 196))   # ヘッドのフィン
d.rectangle((bx + 150, by - 250, bx + 300, by - 186), outline=LN, fill=(200, 200, 206), width=2)   # ブロアー
for k in range(9): d.line((bx + 156 + k * 16, by - 246, bx + 156 + k * 16, by - 190), fill=(150, 150, 156))
d.polygon([(bx + 170, by - 250), (bx + 300, by - 250), (bx + 300, by - 300), (bx + 200, by - 300)], outline=LN, fill=(220, 220, 226))   # 吸気口(前向き)
d.rectangle((bx + 288, by - 298, bx + 300, by - 252), fill=(20, 20, 24))   # 吸気口の口(前を向く)
for k in range(4):  # 排気の管(ゾーミー)
    x = bx + 140 + k * 48; d.line((x, by - 110, x - 40, by - 140), fill=LN, width=6); d.ellipse((x - 48, by - 148, x - 32, by - 132), outline=LN, width=2)
d.ellipse((bx + 390, by - 280, bx + 420, by - 250), outline=YL, width=2)   # ベルト(前)
d.line((bx + 300, by - 230, bx + 405, by - 265), fill=YL, width=3)
wheel(d, bx + 70, by + 10, 70, fill=(40, 40, 44)); wheel(d, bx + 370, by + 30, 40, fill=(40, 40, 44))
d.ellipse((bx + 400, by - 70, bx + 440, by - 30), outline=LN, width=3, fill=(220, 220, 210))    # 目(ライト)
d.ellipse((bx + 420, by - 30, bx + 452, by + 2), outline=LN, width=3, fill=(200, 60, 50))        # 鼻(バンパー)
# 桶の火と荷車
d.line((bx - 10, by - 30, bx - 120, by - 30), fill=LN, width=4)
d.rectangle((bx - 240, by - 130, bx - 120, by - 20), outline=LN, fill=(130, 90, 54), width=3)
for yy in (by - 110, by - 50): d.line((bx - 240, yy, bx - 120, yy), fill=(60, 60, 60), width=4)
for k in range(5): d.polygon([(bx - 230 + k * 22, by - 130), (bx - 220 + k * 22, by - 175 - (k % 2) * 20), (bx - 210 + k * 22, by - 130)], fill=(255, 150, 50))
wheel(d, bx - 210, by + 4, 22); wheel(d, bx - 150, by + 4, 22)
d.line((bx - 130, by - 120, bx - 60, by - 150, bx + 110, by - 140), fill=(30, 30, 30), width=6); d.line((bx - 130, by - 120, bx - 60, by - 150, bx + 110, by - 140), fill=LN, width=1)
box(d, (bx - 240, 130), '横から(東へ進む)')
arrow(d, (bx + 470, by - 160), (bx + 570, by - 160))
label(d, (bx + 294, by - 280), (bx + 120, by - 380), '吸気口(バグキャッチャー)の口は進む向き(前)')
label(d, (bx + 225, by - 220), (bx - 300, by - 380), 'ブロアー(GMC 6-71 の銀の箱)。前のベルトで回す')
label(d, (bx + 220, by - 125), (bx + 300, by + 195), 'V8: 左右 4 本ずつの排気の管(ゾーミー)')
label(d, (bx + 250, by - 30), (bx + 60, by + 130), '低い桶の車体。人の乗る所はない。V8 が載っているだけ')
label(d, (bx + 440, by - 15), (bx + 300, by + 165), '顔: ライトの目、丸いバンパーの鼻')
label(d, (bx + 70, by + 10), (bx - 20, by + 110), '太い後輪(スリック)')
label(d, (bx - 60, by - 150), (bx - 300, by - 290), '桶の火から黒いホースで熱(ポンポン船の仕組み)')
# 前から(V のバンク)
fx, fy = 1560, 640; box(d, (fx - 120, 290), '前から(顔)')
d.rounded_rectangle((fx - 120, fy - 90, fx + 120, fy), 40, outline=LN, fill=(214, 200, 168), width=3)
d.polygon([(fx - 110, fy - 90), (fx - 30, fy - 170), (fx - 10, fy - 170), (fx - 50, fy - 90)], outline=LN, fill=(150, 150, 156))
d.polygon([(fx + 110, fy - 90), (fx + 30, fy - 170), (fx + 10, fy - 170), (fx + 50, fy - 90)], outline=LN, fill=(150, 150, 156))
d.rectangle((fx - 50, fy - 250, fx + 50, fy - 170), outline=LN, fill=(200, 200, 206), width=2)
d.rectangle((fx - 50, fy - 300, fx + 50, fy - 250), outline=LN, fill=(30, 30, 34), width=2)
for k in range(3): d.ellipse((fx - 40 + k * 28, fy - 290, fx - 16 + k * 28, fy - 262), outline=LN, width=2)
for s in (-1, 1): d.ellipse((fx + s * 60 - 22, fy - 70, fx + s * 60 + 22, fy - 26), outline=LN, width=3, fill=(220, 220, 210))
d.ellipse((fx - 18, fy - 40, fx + 18, fy - 4), outline=LN, width=3, fill=(200, 60, 50))
for s in (-1, 1): d.rectangle((fx + s * 150 - 30, fy - 60, fx + s * 150 + 30, fy + 60), outline=LN, width=2, fill=(40, 40, 44))
for s in (-1, 1): d.rectangle((fx + s * 110 - 12, fy - 10, fx + s * 110 + 12, fy + 40), outline=LN, width=2, fill=(40, 40, 44))
text(d, 30, 820, [
    '#ビルダーの仕様',
    '!初稿の直し: フォルクスワーゲンの形(屋根と座席)だった → 屋根も座席もない。低い桶の車体に、でかい V8 がどんと載る',
    '車体: 低い桶(バスタブ)型の丸い箱。日本製のアメ車のブリキのおもちゃの塗り(クリームに赤い線、メッキ)',
    'エンジン: 車体より大きく見えるほどの V8。上にブロアーと吸気口。吸気口の口は進む向き。左右 4 本ずつの排気の管',
    '顔: 前の面に丸いライトの目 2 つ、丸い赤いバンパーの鼻(きーの鼻と同じ形)',
    '熱: うしろに引く荷車の桶で火を焚き、黒いホースでエンジンへ。排気の管から「ポン　ポン」と煙の輪',
    '#ゲームの絵',
    '大きさ: 車体 約 64×24 ドット、ブロアーまで高さ 約 52。桶の荷車は別の絵(約 36×40)でうしろにつなぐ',
    '向き: 東・西・北・南。動き: 止まり(ブロアーのベルト、エンジンの振動 2 コマ)、走る(車輪 2 コマ、煙の輪)',
], s=17, gap=8)
im.save(O + 'build2_ponpon.png')

# ================= とりぼぎかー =================
im, d = sheet(1800, 1500, 'BUILD SHEET 03  とりぼぎかー(呪いの野犬)  第 2 版', '作者「こがもは３匹いる。上から見て円形のだいざにならんでいる。とりぼぎかーが前進すると子鴨のくちばしからじぇっとがでて回転する」')
ref(im, P + 'pic/218717_1007375036_214large.jpg', (30, 110), 260, crop=(0, 0, 640, 417), cap='スケッチ: 全体の図解', d=d)
ref(im, P + 'pic/218717_1007375036_214large.jpg', (450, 110), 260, crop=(395, 0, 560, 120), cap='子がもの内部図解(とがった方が噴射口)', d=d)
ref(im, P + 'pic/218717_1008773116_59large.jpg', (840, 110), 260, crop=(330, 120, 640, 417), cap='漫画「シュッ」: 桶の上で子がもが回る', d=d)
text(d, 1180, 110, [
    '#スケッチをこう読んだ',
    '1 図解の子がもは、まるい方に吸気口、とがった方に噴射口',
    '   とがった方 = くちばし。ジェットはくちばしから出る',
    '2 子がも 2 の顔の丸い輪は、くちばしの噴射口を前から見た所',
    '3 「回転」の矢印は、子がもの乗った台座が回ること',
    '4 漫画「シュッ」で、桶の上の子がもが流れる線で回っている',
    '   丸が上下 2 段に 3 つずつ = 子がも 3 羽の頭と胴',
    '5 桶のま下に車輪が 1 つ。台座の軸の線上にある',
    '6 ひもは鴨の前の下から、宇宙の引力源へのびる',
], s=15, gap=6)
# 上から: 円形の台座に 3 羽、くちばしは接線の向き
cx, cy, R = 330, 640, 150
d.text((40, 420), '上から(台座と子がも 3 羽)', fill=CY, font=f(18))
d.ellipse((cx - R - 30, cy - R - 30, cx + R + 30, cy + R + 30), outline=LN, width=3, fill=(150, 104, 64))
d.ellipse((cx - R, cy - R, cx + R, cy + R), outline=YL, width=2, fill=(120, 90, 60))
d.ellipse((cx - 10, cy - 10, cx + 10, cy + 10), outline=YL, width=2)
for k in range(3):
    a0 = -math.pi / 2 + k * 2 * math.pi / 3
    px, py = cx + 95 * math.cos(a0), cy + 95 * math.sin(a0)
    tx, ty = -math.sin(a0), math.cos(a0)          # 接線(時計回りの向き)
    d.ellipse((px - 34, py - 34, px + 34, py + 34), outline=LN, width=2, fill=(236, 214, 150))
    hx, hy = px + tx * 42, py + ty * 42
    d.ellipse((hx - 20, hy - 20, hx + 20, hy + 20), outline=LN, width=2, fill=(236, 214, 150))
    bx2, by2 = hx + tx * 26, hy + ty * 26
    d.polygon([(hx + tx * 18 - ty * 7, hy + ty * 18 + tx * 7), (bx2, by2), (hx + tx * 18 + ty * 7, hy + ty * 18 - tx * 7)], fill=(230, 150, 60))
    for j in range(4): d.line((bx2 + tx * (8 + j * 14), by2 + ty * (8 + j * 14), bx2 + tx * (16 + j * 14), by2 + ty * (16 + j * 14)), fill=(255, 170, 80), width=5 - j)
    d.text((px - 12, py - 8), str(k + 1), fill=(60, 40, 20), font=f(16))
    qx, qy = px - tx * 34, py - ty * 34                       # 尾の吸気口(ジェットエンジンのような穴、D121)
    d.ellipse((qx - 11, qy - 11, qx + 11, qy + 11), outline=LN, width=2, fill=(20, 20, 24))
    for j in range(6):
        aa = j * math.pi / 3; d.line((qx, qy, qx + 9 * math.cos(aa), qy + 9 * math.sin(aa)), fill=(150, 160, 170), width=1)
d.arc((cx - R - 60, cy - R - 60, cx + R + 60, cy + R + 60), 200, 320, fill=GR, width=4)
ang = math.radians(200); ex, ey = cx + (R + 60) * math.cos(ang), cy + (R + 60) * math.sin(ang)
arrow(d, (ex + 30, ey - 40), (ex, ey))
d.text((cx - 190, cy + R + 40), '台座の回る向き(ジェットと逆)', fill=GR, font=f(15))
label(d, (cx + 30, cy - 160), (cx + 200, cy - 230), 'くちばし(噴射口)は円の接線の向き', YL)
label(d, (cx - 60, cy - 70), (cx + 200, cy - 190), '尾の吸気口は穴が開く(ジェットエンジンのよう、作者)', YL)
label(d, (cx, cy), (cx + 220, cy + 30), '中心の軸(燃料も通る)', YL)
# 横から
dx, dy = 1320, 860
d.text((760, 450), '横から(東へ進む)', fill=CY, font=f(18))
d.line((dx + 150, dy - 10, dx + 400, dy - 330), fill=(255, 240, 160), width=2)
d.text((dx + 260, dy - 260), '≈', fill=(255, 240, 160), font=f(30)); arrow(d, (dx + 340, dy - 260), (dx + 400, dy - 330), (255, 240, 160), 2)
d.text((dx + 190, dy - 340), 'ひも → 宇宙の引力源', fill=(255, 240, 160), font=f(15))
d.ellipse((dx - 20, dy - 120, dx + 150, dy - 10), outline=LN, fill=(170, 110, 60), width=3)
d.ellipse((dx + 70, dy - 210, dx + 150, dy - 120), outline=LN, fill=(170, 110, 60), width=3)
d.ellipse((dx + 100, dy - 190, dx + 126, dy - 164), outline=LN, fill=(240, 240, 230)); d.ellipse((dx + 108, dy - 182, dx + 120, dy - 170), fill=(20, 20, 20))
d.polygon([(dx + 148, dy - 170), (dx + 200, dy - 160), (dx + 148, dy - 148)], outline=LN, fill=(220, 160, 60))
d.arc((dx, dy - 100, dx + 110, dy - 30), 200, 340, fill=LN, width=2)
wheel(d, dx + 100, dy + 6, 30, fill=(150, 100, 60))
d.line((dx - 20, dy - 40, dx - 110, dy - 40), fill=LN, width=6)
tx0, ty0 = dx - 330, dy
d.rectangle((tx0, ty0 - 130, tx0 + 220, ty0 - 20), outline=LN, fill=(150, 104, 64), width=3)
for yy in (ty0 - 112, ty0 - 40): d.line((tx0, yy, tx0 + 220, yy), fill=(60, 60, 60), width=5)
d.rectangle((tx0 + 10, ty0 - 150, tx0 + 210, ty0 - 132), outline=YL, fill=(120, 90, 60), width=2)
d.line((tx0 + 110, ty0 - 132, tx0 + 110, ty0 + 4), fill=YL, width=4)
d.rectangle((tx0 + 40, ty0 - 80, tx0 + 90, ty0 - 50), outline=CY, width=2); d.text((tx0 + 44, ty0 - 78), '燃料', fill=CY, font=f(13))
wheel(d, tx0 + 110, ty0 + 20, 30, fill=(150, 100, 60))
for k, (px, face) in enumerate([(tx0 + 50, 1), (tx0 + 110, 0), (tx0 + 170, -1)]):
    d.ellipse((px - 30, ty0 - 205, px + 30, ty0 - 150), outline=LN, fill=(236, 214, 150), width=2)
    hx = px + face * 22
    d.ellipse((hx - 17, ty0 - 236, hx + 17, ty0 - 202), outline=LN, fill=(236, 214, 150), width=2)
    if face: d.polygon([(hx + face * 15, ty0 - 224), (hx + face * 34, ty0 - 219), (hx + face * 15, ty0 - 212)], fill=(230, 150, 60))
    else: d.ellipse((hx - 6, ty0 - 224, hx + 6, ty0 - 212), outline=(230, 150, 60), width=3)
d.line((tx0 + 225, ty0 - 219, tx0 + 280, ty0 - 219), fill=(255, 170, 80), width=4)
d.line((tx0 - 5, ty0 - 219, tx0 - 60, ty0 - 219), fill=(255, 170, 80), width=4)
d.text((tx0 + 40, ty0 - 290), 'シュッ', fill=(255, 200, 120), font=f(22))
label(d, (tx0 + 110, ty0 - 141), (tx0 - 200, ty0 - 330), '円形の台座。子がも 3 羽が並ぶ', YL)
label(d, (tx0 + 110, ty0 - 210), (tx0 - 200, ty0 - 370), '真ん中の子がもは、くちばしの噴射口をこちらへ向けた所(子がも 2 の丸い輪)', YL)
label(d, (tx0 + 110, ty0 - 10), (tx0 - 200, ty0 + 80), '解釈: 台座の軸は桶の中を通って、ま下の車輪を回す(確かめたい)', RD)
label(d, (tx0 + 65, ty0 - 65), (tx0 - 200, ty0 + 40), '燃料のタンク(桶の中)', YL)
label(d, (dx - 65, dy - 40), (dx - 70, dy + 40), '引き棒', YL)
label(d, (dx + 60, dy - 60), (dx + 160, dy + 70), '木の鴨の引き車(柿渋)', YL)
# 子がもの断面
cx, cy = 300, 1110
d.text((40, 1290), '子がもの断面(作者の図解。とがった方 = くちばし = 噴射口)', fill=CY, font=f(18))
d.ellipse((cx - 150, cy - 60, cx + 150, cy + 60), outline=LN, width=3)
for k in range(5): d.line((cx - 110 + k * 12, cy - 44, cx - 110 + k * 12, cy + 44), fill=CY, width=3)
d.rectangle((cx - 30, cy - 34, cx + 60, cy + 34), outline=RD, width=2)
d.polygon([(cx + 60, cy - 34), (cx + 150, cy - 10), (cx + 150, cy + 10), (cx + 60, cy + 34)], outline=LN, width=2)
d.polygon([(cx + 150, cy - 10), (cx + 220, cy), (cx + 150, cy + 10)], fill=(255, 170, 80))
d.ellipse((cx - 168, cy - 36, cx - 132, cy + 36), outline=LN, width=3, fill=(20, 20, 24))   # 尾の穴(D121)
for j in range(8): aa = j * math.pi / 4; d.line((cx - 150, cy, cx - 150 + 14 * math.cos(aa), cy + 30 * math.sin(aa)), fill=(150, 160, 170))
d.line((cx, cy + 60, cx, cy + 100), fill=YL, width=3); d.rectangle((cx - 50, cy + 100, cx + 50, cy + 140), outline=YL, width=2)
for (xy, t, txy) in [((cx - 150, cy), '吸気口(尾)', (cx - 260, cy - 90)), ((cx - 100, cy - 44), '圧縮機', (cx - 130, cy - 120)), ((cx + 15, cy - 34), '燃焼室', (cx + 10, cy - 110)), ((cx + 200, cy), '噴射口(くちばし)「シュッ」', (cx + 150, cy - 80)), ((cx, cy + 80), '燃料噴射装置', (cx + 70, cy + 80)), ((cx, cy + 120), '燃料', (cx + 70, cy + 125))]:
    label(d, xy, txy, t, YL, 14)
text(d, 760, 1000, [
    '#しくみ(ビルダーの読み)',
    '1 グレートアトラクターに、ひもで引かれて前へ進む(メイン動力: 重力トラクター)',
    '2 前へ進むと、走る風が子がもの尾の吸気口から入る',
    '3 圧縮機で押しこみ、燃焼室で燃料を燃やす',
    '4 くちばしの噴射口からジェット「シュッ」',
    '5 くちばしは円の接線の向きなので、噴射の反動で台座が回る',
    '   (ヘロンの蒸気機関や、回る散水機と同じ)',
    '!6 解釈: 台座の回転が軸を通って桶の下の車輪を回す = サブ動力(確かめたい)',
    '#ゲームの絵',
    '鴨と桶で 約 80×56 ドット。4 方向。台座が回る(4 コマ)、くちばしのジェット(2 コマ)、ひもは空へのびる光る線',
], s=16, gap=7)
im.save(O + 'build3_toribogi.png')

# ================= 車箪笥 =================
im, d = sheet(1800, 1300, 'BUILD SHEET 04  車箪笥(みとんの家であり乗物)', '作者「車箪笥の進行方向と、ブロアーの空気注入口の向きはよく観察、考えて」。スケッチ 2 枚を観察した')
w = ref(im, P + 'pic/218717_989130033_182large.jpg', (30, 110), 380, crop=(90, 280, 310, 520), cap='スケッチ A(pic/218717_989130033_182)', d=d)
w2 = ref(im, P + 'pic/218717_989129983_28large.jpg', (60 + w, 110), 380, crop=(30, 280, 280, 640), cap='スケッチ B(pic/218717_989129983_28)', d=d)
text(d, 120 + w + w2, 110, [
    '#観察',
    'A: 短い面(左)に「STP」と、四角い板。四角い板はナンバープレートの場所',
    'A: 天板の左(STP の側)に穴があり、エンジンが沈めて載っている',
    'A: ブロアーの上の吸気口は、平たい口を STP の側(左)へ向けている',
    'A: 引き出しは長い面。いちばん下の段の下に横線(ルーバー)',
    'B: 短い面を正面から見た絵。下に四角い板(ナンバー)と車輪',
    'B: 吸気口の口(中に 3 つの丸 = 吸気の筒)が、こちら(短い面)を向く',
    'B: 引き出しは右の長い面に見える',
    '#結論',
    '+進む向きは長い向き。前は、ナンバーと STP のある短い面',
    '+引き出しは車の横腹(ドアの位置)。エンジンは天板の前寄り',
    '+吸気口は、進む向き(前)に口を開けて、走る風を飲む',
    '江戸の車箪笥も、長い向きに引いて火事から逃げた',
], s=16, gap=7)
# 上から
X, Y = 120, 620
d.text((X, Y - 30), '上から(前 = 右)', fill=CY, font=f(18))
d.rectangle((X, Y, X + 420, Y + 180), outline=LN, fill=(110, 70, 44), width=3)
d.rectangle((X + 280, Y + 40, X + 400, Y + 140), outline=LN, fill=(150, 150, 156), width=2)
d.rectangle((X + 300, Y + 60, X + 380, Y + 120), outline=LN, fill=(200, 200, 206), width=2)
d.polygon([(X + 380, Y + 60), (X + 420, Y + 52), (X + 420, Y + 128), (X + 380, Y + 120)], outline=YL, fill=(30, 30, 34), width=2)
arrow(d, (X + 440, Y + 90), (X + 560, Y + 90)); d.text((X + 450, Y + 104), '進む向き', fill=GR, font=f(15))
for (cx, cy) in [(X + 30, Y - 8), (X + 390, Y - 8), (X + 30, Y + 188), (X + 390, Y + 188)]: d.rectangle((cx - 22, cy - 8, cx + 22, cy + 8), outline=LN, fill=(60, 60, 64))
d.ellipse((X + 20, Y + 20, X + 44, Y + 44), outline=LN, width=2)
label(d, (X + 410, Y + 90), (X + 470, Y + 160), '吸気口の口は前へ', YL)
label(d, (X + 340, Y + 120), (X + 120, Y + 250), 'エンジンは天板の前寄りに沈める(スケッチ A)', YL)
label(d, (X + 32, Y + 32), (X - 60, Y + 290), '排気の煙突(スケッチ B の左上の管)はうしろの角', YL)
# 横から(承認ずみの初稿の絵の向き)
X2, Y2 = 800, 600
d.text((X2 - 60, Y2 - 10), '横から: 初稿の絵(○)。左の短い面に STP = 前 → この絵は西向き', fill=CY, font=f(18))
s2 = Image.open(G + 'tansu.png').convert('RGBA'); s2 = s2.resize((s2.width * 4, s2.height * 4), Image.NEAREST)
im.paste(s2, (X2, Y2 + 30), s2)
arrow(d, (X2 - 20, Y2 + 150), (X2 - 120, Y2 + 150))
label(d, (X2 + 120, Y2 + 50), (X2 + 260, Y2 + 30), '吸気口の口を前(左)へ向ける', RD)
label(d, (X2 + 30, Y2 + 230), (X2 + 260, Y2 + 260), '前の面(STP)。東へ走るときは左右を反転', YL)
# 前から
X3, Y3 = 1350, 700
d.text((X3 - 40, Y3 - 160), '前から(南へ来るとき)', fill=CY, font=f(18))
d.rectangle((X3, Y3, X3 + 200, Y3 + 240), outline=LN, fill=(110, 70, 44), width=3)
d.rectangle((X3 + 60, Y3 + 190, X3 + 140, Y3 + 220), outline=LN, fill=(220, 220, 210), width=2)
d.ellipse((X3 + 50, Y3 + 120, X3 + 150, Y3 + 170), outline=LN, width=2); d.text((X3 + 78, Y3 + 133), 'STP', fill=LN, font=f(18))
d.rectangle((X3 + 50, Y3 - 70, X3 + 150, Y3), outline=LN, fill=(200, 200, 206), width=2)
d.rectangle((X3 + 40, Y3 - 110, X3 + 160, Y3 - 70), outline=YL, fill=(30, 30, 34), width=2)
for k in range(3): d.ellipse((X3 + 52 + k * 36, Y3 - 104, X3 + 80 + k * 36, Y3 - 76), outline=LN, width=2)
for sx in (X3 - 10, X3 + 190): d.rectangle((sx, Y3 + 220, sx + 20, Y3 + 262), outline=LN, fill=(60, 60, 64))
label(d, (X3 + 100, Y3 - 90), (X3 + 220, Y3 - 40), '吸気口の口と 3 本の筒')
label(d, (X3 + 100, Y3 + 205), (X3 + 220, Y3 + 230), 'ナンバーの板(字はない)')
text(d, 30, 1060, [
    '#ゲームの絵',
    '西: 初稿の絵(○ 作者「イメージ通り」。左の短い面に STP があるので西向き)。東はその左右反転。吸気口の口は進む向き',
    '南: 前の面(ナンバー、STP、吸気口の口と筒)。北: うしろの面(排気の煙突)',
    '動き: 止まり = ドッドッドッと箪笥ごとゆれる、ブロアーのベルトが回る。走る = 鉄の車輪。下の引き出しが開く(ぼぎカーが出る)',
], s=16, gap=7)
im.save(O + 'build4_tansu.png')

# ================= こけしバイクと、みとん =================
im, d = sheet(1800, 1240, 'BUILD SHEET 05  こけしのカフェレーサーと、みとん', '作者「こけしバイクはとてもいいのでのこす。でもカスタムカフェレーサーなのでかっこよくモディファイ」「みとんは、首をしぼらなくて寸胴でいい」')
s3 = Image.open(G + 'kokeshi.png').convert('RGBA'); s3 = s3.resize((s3.width * 6, s3.height * 6), Image.NEAREST)
im.paste(s3, (60, 140), s3)
d.text((60, 110), '初稿(○ 残す。これを土台にモディファイ)', fill=CY, font=f(16))
X, Y = 560, 420
d.text((X + 470, 400), 'モディファイ(横から)', fill=CY, font=f(18))
wheel(d, X + 40, Y, 64); wheel(d, X + 380, Y, 64)
for k in range(12):
    a = k * math.pi / 6
    for cxw in (X + 40, X + 380): d.line((cxw, Y, cxw + 60 * math.cos(a), Y + 60 * math.sin(a)), fill=(120, 140, 170))
d.line((X + 40, Y, X + 150, Y - 70, X + 300, Y - 70, X + 380, Y), fill=LN, width=4)    # フレーム
d.ellipse((X + 170, Y - 150, X + 330, Y - 80), outline=LN, fill=(200, 60, 50), width=3)  # タンク(こけしの胴)
d.polygon([(X + 60, Y - 110), (X + 170, Y - 116), (X + 170, Y - 86), (X + 70, Y - 86), (X + 40, Y - 130)], outline=LN, fill=(30, 30, 30), width=2)   # 座席とこぶ
d.ellipse((X + 60, Y - 124, X + 92, Y - 94), outline=YL, width=2)
d.ellipse((X + 300, Y - 210, X + 380, Y - 130), outline=LN, fill=(240, 222, 190), width=3)  # こけしの頭
d.chord((X + 300, Y - 214, X + 380, Y - 160), 180, 360, fill=(20, 20, 20))
d.line((X + 360, Y - 120, X + 420, Y - 110), fill=LN, width=5)   # クリップオン
d.line((X + 120, Y - 40, X - 40, Y - 70), fill=(220, 220, 230), width=8); d.polygon([(X - 40, Y - 82), (X - 80, Y - 90), (X - 80, Y - 50), (X - 40, Y - 58)], outline=LN, fill=(220, 220, 230))
d.line((X + 140, Y - 60, X + 120, Y - 20), fill=LN, width=4)     # バックステップ
d.arc((X + 360, Y - 200, X + 440, Y - 120), 270, 360, fill=CY, width=3)   # 風よけ
for (xy, t, txy) in [((X + 400, Y - 112), 'クリップオンの低いハンドル', (X + 470, Y - 150)), ((X + 420, Y - 180), '小さな風よけ(フライスクリーン)', (X + 470, Y - 210)),
                     ((X + 250, Y - 115), 'タンク: ろくろの輪の線と菊。ひざの当たる所をへこませる', (X + 220, Y - 300)),
                     ((X + 76, Y - 109), 'こぶのある一人乗りの座席。丸いゼッケン(菊の紋)', (X - 60, Y - 240)),
                     ((X - 60, Y - 70), '後ろへはね上げたメガホンの排気管(メッキ)', (X - 120, Y + 90)), ((X + 130, Y - 40), 'うしろ寄りの足のせ(バックステップ)', (X + 100, Y + 120)),
                     ((X + 380, Y + 50), 'アルミのリムと細いスポーク', (X + 420, Y + 110))]:
    label(d, xy, txy, t, YL, 15)
text(d, 30, 640, [
    '#ビルダーの仕様(こけしのカフェレーサー)',
    '形: 1960 年代イギリスのカフェレーサー(エース・カフェのトンアップ・ボーイズ)。低く、細く、前のめり',
    '乗り手: こけし。手足がないので、胴をタンクに沿わせて伏せ、頭をハンドルの上に出す(風の抵抗を減らす伏せの姿勢)',
    '色: こけしの赤と黒、菊の模様、メッキ。鳴子こけしは首を回すとキュッキュッと鳴る → 止まると首がキュッと回る',
    '音: パラララ(単気筒)、キュッキュッ。ゲームの絵: 約 64×44、4 方向、車輪 2 コマ',
])
# みとん(寸胴)
MX, MY = 1250, 650
d.text((MX, MY - 90), 'みとん(寸胴。前と横)', fill=CY, font=f(18))
for k, ox in enumerate((MX, MX + 260)):
    d.rectangle((ox, MY + 60, ox + 140, MY + 420), outline=LN, fill=(236, 220, 186), width=3)   # 寸胴の体
    d.rectangle((ox, MY, ox + 140, MY + 130), outline=LN, fill=(236, 200, 196), width=3)        # 頭(体と同じ幅)
    d.polygon([(ox + 6, MY + 6), (ox + 20, MY - 40), (ox + 40, MY + 6)], outline=LN, fill=(236, 200, 196))
    d.polygon([(ox + 100, MY + 6), (ox + 120, MY - 40), (ox + 134, MY + 6)], outline=LN, fill=(236, 200, 196))
    if k == 0:
        d.ellipse((ox + 40, MY + 66, ox + 100, MY + 112), outline=LN, fill=(240, 150, 160), width=3)
        for sx in (ox + 56, ox + 76): d.ellipse((sx, MY + 82, sx + 10, MY + 96), fill=(120, 40, 50))
        for sx in (ox + 18, ox + 82): d.ellipse((sx, MY + 30, sx + 40, MY + 64), outline=LN, width=3)
        d.line((ox + 58, MY + 47, ox + 82, MY + 47), fill=LN, width=2)
        for sx in (ox + 34, ox + 92): d.ellipse((sx, MY + 42, sx + 8, MY + 50), fill=(20, 20, 20))
        for kk in range(9): d.ellipse((ox + 8 + kk * 14, MY + 140 + abs(kk - 4) * 3, ox + 20 + kk * 14, MY + 152 + abs(kk - 4) * 3), outline=LN, fill=(250, 250, 245))
    else:
        d.ellipse((ox + 130, MY + 66, ox + 170, MY + 112), outline=LN, fill=(240, 150, 160), width=3)
        d.ellipse((ox + 90, MY + 30, ox + 130, MY + 64), outline=LN, width=3)
    for sx in (ox + 20, ox + 90): d.rectangle((sx, MY + 420, sx + 30, MY + 440), outline=LN, fill=(200, 180, 150))
label(d, (MX + 44, MY + 90), (MX - 330, MY + 90), 'ピンクの大きな丸い鼻、鼻の穴 2 つ', YL)
label(d, (MX + 14, MY - 20), (MX - 330, MY - 20), 'とがった豚の耳', YL)
label(d, (MX + 20, MY + 47), (MX - 330, MY + 40), '丸い眼鏡', YL)
label(d, (MX + 8, MY + 146), (MX - 330, MY + 150), '真珠の首飾り', YL)
label(d, (MX, MY + 300), (MX - 330, MY + 300), '首をしぼらない寸胴(作者)。頭と体が同じ幅', GR)
text(d, 1240, 1110, ['ゲームの絵: 約 26×58 ドット。4 方向の歩き、立ち(まばたき)、塗る(細い筆)'], s=15)
im.save(O + 'build5_kokeshi_miton.png')
print('ok')
