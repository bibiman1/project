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
im, d = sheet(1800, 1500, 'BUILD SHEET 01  ぼぎカー(きーの車)  第 2 版', '作者「ぼぎかーの厚みは…きーの幅と同じくらい。きーはぼぎかーに載って加速すると、つぶれてぼぎかーの背中に張り付き、空気抵抗を減らす」(D122)')
pk = json.load(open(O + 'plank.json'))
def plank(ox, oy, k):
    xs = [p[0] for p in pk['poly']]; x0, x1 = min(xs), max(xs)
    tr = lambda x, y: (ox + (x1 - x), oy + (y - 60) * k) if False else (ox + (x1 - x) * k, oy + (y - 60) * k)
    d.polygon([tr(*p) for p in pk['poly']], outline=LN, fill=(60, 44, 40))
    hx, hy, hr = pk['holes'][0]; c = tr(hx, hy); d.ellipse((c[0] - hr * k, c[1] - hr * k, c[0] + hr * k, c[1] + hr * k), outline=LN, width=2, fill=BG)
    for hx, hy, hr in pk['holes'][1:]:
        c = tr(hx, hy); wheel(d, c[0], c[1] + 6, 44, fill=(200, 200, 196)); d.ellipse((c[0] - 7, c[1] - 1, c[0] + 7, c[1] + 13), fill=(120, 120, 120))
    return tr
ki = Image.open('/tmp/claude-0/-home-user-project/e7cb1a9b-b078-5ece-9cdf-0647f5a9d6fa/scratchpad/ki_east.png')
# 参考
ref(im, P + 'pic/218717_1007375048_31large.jpg', (30, 110), 230, crop=(340, 0, 640, 230), cap='漫画「ぼぎかー」: 頭を上げた板、きーはうしろの低い所に立つ', d=d)
ref(im, P + 'pic/218717_1008773116_59large.jpg', (370, 110), 230, crop=(0, 190, 330, 417), cap='漫画「無慣性粘着駆動」: きーがつぶれて背中に張り付く', d=d)
ref(im, P + 'pic/218717_1010141439_134large.jpg', (750, 110), 230, crop=(500, 230, 640, 417), cap='漫画(競争): 車体はきーの幅ほど厚い', d=d)
text(d, 960, 110, [
    '#漫画をこう読んだ',
    '1 帯の字は「無慣性粘着駆動」(私は「推進」と読み違えていた)',
    '2 加速すると、きーはつぶれて薄くのび、',
    '   背中に張り付く(粘着)。顔は前(目穴の側)',
    '3 止まっているとき、きーは顔のうしろの低い所に立つ',
    '4 競争のコマで、車体は厚い塊。厚みはきーの幅くらい',
    '5 目穴は板をつらぬくので、両側に目がある',
], s=15, gap=6)
# 横から: ふだんと、加速
for row, (title, acc) in enumerate([('横から: ふだん(東へ進む。前 = 目穴の高いはし)', False), ('横から: 加速(無慣性粘着駆動)', True)]):
    ox, oy, k = 120, 470 + row * 330, 0.75
    d.text((40, oy - 70), title, fill=CY, font=f(18))
    tr = plank(ox, oy, k)
    top = pk['top']
    if not acc:
        kp = tr(395, 124); kk = ki.resize((37 * 3, 21 * 3), Image.NEAREST); im.paste(kk, (int(kp[0]) - 55, int(kp[1]) - 52), kk)
        label(d, (int(kp[0]), int(kp[1]) - 30), (int(kp[0]) + 120, oy - 60), 'きーは顔のうしろの低い所に立つ(漫画)', GR)
    else:
        pts = [tr(x, y) for x, y in top if 160 < x < 560]
        upper = [(x, y - 16) for x, y in pts]
        d.polygon(pts + upper[::-1], fill=(244, 230, 180), outline=(120, 100, 70))
        fx, fy = upper[0]
        d.ellipse((fx + 6, fy + 4, fx + 12, fy + 10), fill=(20, 20, 20)); d.polygon([(fx - 2, fy + 8), (fx - 14, fy + 12), (fx - 2, fy + 14)], fill=(230, 140, 60))
        for j in range(5): d.line((ox - 80 - j * 18, oy + 40 + j * 22, ox - 10 - j * 18, oy + 40 + j * 22), fill=CY, width=2)
        label(d, (pts[len(pts) // 2][0], pts[len(pts) // 2][1] - 10), (ox + 200, oy - 60), 'きーがつぶれて背中に張り付く。顔は前。空気抵抗を減らす(作者)', GR)
        arrow(d, (ox + 600, oy + 60), (ox + 700, oy + 60)); d.text((ox + 600, oy + 74), '0〜100km 0.3 秒', fill=GR, font=f(15))
    label(d, tr(215, 138), (ox + 640, oy + 10), '目穴(顔の目)。板をつらぬく', YL)
# 上から: 厚い板(きーの幅くらい)
X, Y = 1140, 470
d.text((X, Y - 70), '上から(厚み = きーの幅くらい)', fill=CY, font=f(18))
L, Wd = 480, 240
d.rounded_rectangle((X, Y, X + L, Y + Wd), 60, outline=LN, fill=(60, 44, 40), width=3)
d.ellipse((X + L - 120, Y + 20, X + L - 20, Y + Wd - 20), outline=(120, 90, 70), width=2)
for wx in (X + 70, X + L - 90):
    for sy in (Y - 26, Y + Wd + 4): d.rectangle((wx - 40, sy, wx + 40, sy + 22), outline=LN, width=2, fill=(200, 200, 196))
    d.line((wx, Y - 32, wx, Y + Wd + 32), fill=(170, 170, 170), width=5)
kt = ki.rotate(0).resize((37 * 4, 21 * 4), Image.NEAREST)
_k = ki.resize((37 * 4, 21 * 4), Image.NEAREST); im.paste(_k, (X + 150, Y + 80), _k)
arrow(d, (X + L + 20, Y + Wd // 2), (X + L + 110, Y + Wd // 2))
label(d, (X + 210, Y + 90), (X + 60, Y + Wd + 110), 'きー(正面の幅 32 ドット)と同じくらいの厚み', YL)
label(d, (X + 70, Y - 30), (X + 300, Y - 50), '長いボルトが車軸。戸車は両はしに', YL)
# 前から
FX, FY = 1250, 990
d.text((FX - 120, FY - 70), '前から(顔)', fill=CY, font=f(18))
d.rounded_rectangle((FX - 110, FY, FX + 110, FY + 170), 50, outline=LN, fill=(60, 44, 40), width=3)
for s2 in (-1, 1): d.rectangle((FX + s2 * 130 - 16, FY + 120, FX + s2 * 130 + 16, FY + 200), outline=LN, width=2, fill=(200, 200, 196))
d.line((FX - 150, FY + 160, FX + 150, FY + 160), fill=(170, 170, 170), width=5)
text(d, 40, 1200, [
    '#ビルダーの仕様',
    '形: 写真の板の輪郭(横から)。厚みはきーの幅くらいの、角の丸い塊。目穴は板をつらぬき、両側に目',
    '足まわり: 白いナイロンの戸車 4 つ。長いボルトが車軸で、戸車は両はしに。柿渋(つやのある濃い茶、臭い)。炎はみとんのカスタム',
    '無慣性(作者): 言葉どおり。光速でも直角に曲がる。押した瞬間に全速、ぴたっと止まり、傾かない・すべらない',
    '粘着駆動(作者、ダブルミーニング): 車輪が摩擦で路面をけって進む / きーが車体に粘着して空気抵抗を減らす',
    '#ゲームの絵: 全長 約 64、厚み 約 30、高さ 約 24 ドット。4 方向。空 / きーが立つ / きーが張り付く。炎あり・炎なし。戸車 2 コマ',
], s=16, gap=7)
im.save(O + 'build1_bogicar.png')

# ================= ぽんぽんカー =================
im, d = sheet(1800, 1500, 'BUILD SHEET 02  ぽんぽんカー(呪いの野犬の頭)  第 2 版', '作者「そもそもぼぎなので、ひとがのるすぺーすがいらない。車体にでかいV8が搭載されているだけでいい」。扉絵 pic/218717_989129975_3 を読み直した')
ref(im, P + 'pic/218717_989129975_3large.jpg', (30, 110), 360, crop=(60, 250, 420, 560), cap='作者のスケッチ(扉絵)', d=d)
text(d, 470, 110, [
    '#扉絵をこう読んだ',
    '1 体は、正面から見て低く横に広いドーム(つぶれた饅頭のよう)。屋根も座席もない',
    '2 前の面に帯。丸いライトの目 2 つ、まん中に大きな丸い鼻',
    '3 V8 は天板のまん中の穴に沈む。前にクランクの丸い滑車。上にブロアー',
    '4 ブロアーの上の吸気口(中に丸い筒 3 つ)は前を向く',
    '5 排気の管は、エンジンの左右から上と外へ 4 本ずつ(短い管)',
    '6 黒い線は、エンジンの右から出て、横のドラム缶の火の中へ垂れる',
    '7 ドラム缶(輪 2 本)で木の葉が燃える。れんが 2 つの上(荷車ではない)(作者 D124)',
    '8 前輪は溝のある太いタイヤ。体の下に半分かくれる',
    '!第 1 版の誤り: 桶を荷車で引く形にしていた(作者: 桶ではなくドラム缶)。排気の管をうしろ向きにしていた',
], s=16, gap=7)
# 前から(扉絵どおり)
FX, FY = 500, 900
d.text((FX - 260, FY - 400), '前から(扉絵どおり)', fill=CY, font=f(18))
d.chord((FX - 230, FY - 230, FX + 230, FY + 90), 180, 360, outline=LN, fill=(214, 200, 168), width=3)
d.rectangle((FX - 230, FY - 70, FX + 230, FY + 40), outline=LN, fill=(214, 200, 168), width=3)
d.rounded_rectangle((FX - 180, FY - 60, FX + 180, FY + 30), 30, outline=LN, fill=(230, 220, 196), width=3)
for sx in (-1, 1): d.ellipse((FX + sx * 120 - 24, FY - 40, FX + sx * 120 + 24, FY + 8), outline=LN, width=3, fill=(240, 240, 232))
d.ellipse((FX - 46, FY - 44, FX + 46, FY + 20), outline=LN, width=3, fill=(220, 90, 70))
d.polygon([(FX - 80, FY - 70), (FX - 50, FY - 170), (FX + 50, FY - 170), (FX + 80, FY - 70)], outline=LN, fill=(150, 150, 156), width=2)
d.ellipse((FX - 26, FY - 120, FX + 26, FY - 72), outline=LN, width=3)
d.rectangle((FX - 46, FY - 230, FX + 46, FY - 170), outline=LN, fill=(200, 200, 206), width=2)
d.polygon([(FX - 60, FY - 290), (FX + 60, FY - 290), (FX + 46, FY - 230), (FX - 46, FY - 230)], outline=YL, fill=(30, 30, 34), width=2)
for k in range(3): d.ellipse((FX - 40 + k * 28, FY - 280, FX - 16 + k * 28, FY - 256), outline=LN, width=2)
for sx in (-1, 1):
    for k in range(4):
        bx0 = FX + sx * (100 + k * 26); d.line((bx0, FY - 100 - k * 8, bx0 + sx * 18, FY - 150 - k * 8), fill=LN, width=8); d.line((bx0, FY - 100 - k * 8, bx0 + sx * 18, FY - 150 - k * 8), fill=(170, 170, 176), width=4)
for sx in (-1, 1): d.rectangle((FX + sx * 150 - 40, FY + 30, FX + sx * 150 + 40, FY + 110), outline=LN, width=2, fill=(40, 40, 44))
d.line((FX + 70, FY - 110, FX + 200, FY - 120, FX + 300, FY - 60, FX + 330, FY + 10), fill=(20, 20, 20), width=6)
d.rectangle((FX + 290, FY - 10, FX + 410, FY + 120), outline=LN, fill=(110, 110, 116), width=3)
for yy in (FY + 25, FY + 85): d.line((FX + 288, yy, FX + 412, yy), fill=(170, 170, 176), width=6)
for k in range(6): d.ellipse((FX + 296 + k * 18, FY - 22 - (k % 3) * 6, FX + 312 + k * 18, FY - 10 - (k % 3) * 6), fill=(140, 120, 50), outline=(90, 70, 30))
for k in range(5): d.polygon([(FX + 296 + k * 22, FY - 10), (FX + 306 + k * 22, FY - 60 - (k % 2) * 20), (FX + 316 + k * 22, FY - 10)], fill=(255, 150, 50))
for bx0 in (FX + 280, FX + 360): d.rectangle((bx0, FY + 120, bx0 + 60, FY + 150), outline=LN, fill=(170, 80, 60))
label(d, (FX, FY - 260), (FX - 330, FY - 340), '吸気口(筒 3 つ)は前', YL)
label(d, (FX + 160, FY - 140), (FX + 230, FY - 330), '排気の管 左右 4 本ずつ、上と外へ', YL)
label(d, (FX, FY - 96), (FX - 330, FY - 200), 'クランクの丸い滑車', YL)
label(d, (FX, FY - 12), (FX - 330, FY + 140), '大きな丸い鼻、ライトの目 2 つ', YL)
label(d, (FX + 250, FY - 100), (FX + 160, FY + 190), '黒い線: エンジンの右からドラム缶へ(熱を吸い込む)', YL)
label(d, (FX + 390, FY + 135), (FX + 300, FY + 230), 'ドラム缶はれんがの上。木の葉が燃える', YL)
# 上から
TX, TY = 1290, 820
d.text((TX - 200, TY - 300), '上から(前 = 下)', fill=CY, font=f(18))
d.ellipse((TX - 200, TY - 240, TX + 200, TY + 200), outline=LN, fill=(214, 200, 168), width=3)
d.rectangle((TX - 80, TY - 140, TX + 80, TY + 100), outline=LN, fill=(150, 150, 156), width=2)
d.rectangle((TX - 40, TY - 100, TX + 40, TY + 80), outline=LN, fill=(200, 200, 206), width=2)
d.rectangle((TX - 50, TY + 80, TX + 50, TY + 120), outline=YL, fill=(30, 30, 34))
for sx in (-1, 1):
    for k in range(4): d.ellipse((TX + sx * 110 - 9, TY - 110 + k * 50 - 9, TX + sx * 110 + 9, TY - 110 + k * 50 + 9), outline=LN, width=3)
d.rounded_rectangle((TX - 150, TY + 150, TX + 150, TY + 200), 20, outline=LN, width=2)
arrow(d, (TX, TY + 220), (TX, TY + 300)); d.text((TX + 10, TY + 260), '進む向き', fill=GR, font=f(15))
label(d, (TX + 110, TY - 60), (TX + 230, TY - 140), '排気の管の口', YL)
text(d, 40, 1260, [
    '#ビルダーの仕様',
    '体: 低く横に広いドームの殻に、でかい V8 が沈んで載るだけ。前の帯に顔(ライトの目 2 つ、大きな丸い鼻)。塗りはクリームに赤のブリキ(作者「任せる」D120)',
    'エンジン: V8 とブロアー、吸気口は前(筒 3 つ)。排気の管は左右 4 本ずつ、上と外へ。前輪は溝のある太いタイヤ',
    '熱: 黒い線がエンジンの右から、れんがの上のドラム缶の火へ。熱エネルギーを動力として吸い込む(原理は作者もよくわからない。説明しない)',
    '木の葉のぼぎ: 木の葉をかごで運んでくる友好的なぼぎ。役に立ちたいのか焚火あそびなのか、真意はわからない(「もってきた　ぽんぽんカー　もってきた」)',
], s=16, gap=7)
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
im, d = sheet(1800, 1560, 'BUILD SHEET 04  車箪笥(みとんの家であり乗物)  第 2 版', '作者「引き出しがあるほうが正面じゃなくて、STPのステッカーがあるほうが正面。進行方向が９０度ちがうから、ブロアーの吸入口も進行方向」(D122)')
w = ref(im, P + 'pic/218717_989130033_182large.jpg', (30, 110), 330, crop=(90, 280, 310, 520), cap='スケッチ A', d=d)
w2 = ref(im, P + 'pic/218717_989129983_28large.jpg', (50 + w, 110), 330, crop=(30, 280, 280, 640), cap='スケッチ B', d=d)
text(d, 90 + w + w2, 110, [
    '#調べたこと',
    '・車箪笥は、四方に大ぶりの車輪を付けた箪笥。火事のとき、貴重品を入れたまま',
    '  引いて逃げるためのもの(ラフジュ「車箪笥とは」)',
    '・綱を通す鉄の環が側面・四隅にあり、綱で引いて転がした(Zentner Collection)',
    '・車輪は樫や杉などの木、鉄の輪をはめたものもある。台車(台輪)に車軸を通す',
    '!・どちらへ転がるかを、はっきり書いた文は見つからなかった',
    '  (ページの本文は、この環境の通信の制限で開けなかった)',
    '#スケッチから読んだ車輪',
    '・A: 四隅の車輪は、引き出しの面から丸く見える → 車軸は奥行きの向き',
    '  → 車輪は長い向きに転がる(引き出しの面に沿って、左右へ)',
    '・B: 短い面(ナンバー)から見ると、車輪は細く(横から)見える',
    '+結論: 進む向きは長い向き。前は STP とナンバーの短い面(作者 D122)',
    '+引き出しは横腹。ブロアーの吸気口は前(STP の側)へ口を開ける',
], s=15, gap=6)
# 上から(前 = 右)
X, Y = 60, 560
d.text((X, Y - 110), '上から(前 = 右、東へ進む)', fill=CY, font=f(18))
d.rectangle((X, Y, X + 460, Y + 190), outline=LN, fill=(110, 70, 44), width=3)
for k in range(3): d.rectangle((X + 30 + k * 140, Y - 12, X + 150 + k * 140, Y), outline=YL, fill=(90, 56, 36))
d.text((X + 140, Y - 40 + 2), '', fill=YL)
d.rectangle((X + 300, Y + 40, X + 430, Y + 150), outline=LN, fill=(150, 150, 156), width=2)
d.rectangle((X + 320, Y + 60, X + 410, Y + 130), outline=LN, fill=(200, 200, 206), width=2)
d.polygon([(X + 410, Y + 60), (X + 456, Y + 50), (X + 456, Y + 140), (X + 410, Y + 130)], outline=YL, fill=(30, 30, 34), width=2)
for (cx, cy) in [(X + 60, Y - 30), (X + 400, Y - 30), (X + 60, Y + 220), (X + 400, Y + 220)]:
    d.rectangle((cx - 50, cy - 10, cx + 50, cy + 10), outline=LN, fill=(150, 110, 70), width=2)
for cx in (X + 60, X + 400): d.line((cx, Y - 40, cx, Y + 230), fill=(170, 170, 170), width=4)
for (cx, cy) in [(X + 470, Y + 95), (X - 10, Y + 95)]: d.ellipse((cx - 9, cy - 9, cx + 9, cy + 9), outline=YL, width=3)
arrow(d, (X + 500, Y + 95), (X + 600, Y + 95))
label(d, (X + 230, Y - 6), (X + 280, Y - 70), '引き出し(横腹。進む向きの左側)', YL)
label(d, (X + 60, Y + 220), (X + 120, Y + 300), '大きな木の車輪(鉄の輪)。車軸は奥行きの向き → 長い向きに転がる', YL)
label(d, (X + 440, Y + 95), (X + 300, Y + 330), '吸気口の口は前(STP の側)', YL)
label(d, (X + 470, Y + 95), (X + 520, Y + 160), '綱を通す鉄の環(前とうしろ)', YL)
# 4 方向の見え方
VX, VY = 820, 560
d.text((VX, VY - 40), 'ゲームの 4 方向(斜め上から)', fill=CY, font=f(18))
def chest(x, y, mode):
    if mode in ('W', 'E'):
        d.rectangle((x, y, x + 220, y + 120), outline=LN, fill=(110, 70, 44), width=3)
        if mode == 'W':
            for k in range(3): d.rectangle((x + 14, y + 10 + k * 36, x + 206, y + 40 + k * 36), outline=YL, width=2)
        else:
            for k in range(4): d.line((x + 10, y + 26 + k * 26, x + 210, y + 26 + k * 26), fill=(80, 50, 30), width=2)
        for wx in (x + 30, x + 190): wheel(d, wx, y + 130, 22, fill=(150, 110, 70))
        fx = x if mode == 'W' else x + 220
        d.ellipse((fx - 18 if mode == 'W' else fx - 4, y + 56, fx + 4 if mode == 'W' else fx + 18, y + 80), outline=LN, width=2)
        ex = x + 30 if mode == 'W' else x + 150
        d.rectangle((ex, y - 40, ex + 40, y), outline=LN, fill=(200, 200, 206), width=2)
        mx = ex - 12 if mode == 'W' else ex + 40
        d.rectangle((mx, y - 56, mx + 12, y - 30), fill=(20, 20, 24), outline=YL)
    else:
        d.rectangle((x + 50, y, x + 170, y + 120), outline=LN, fill=(110, 70, 44), width=3)
        if mode == 'S':
            d.ellipse((x + 80, y + 40, x + 140, y + 70), outline=LN, width=2); d.text((x + 94, y + 46), 'STP', fill=LN, font=f(14))
            d.rectangle((x + 85, y + 86, x + 135, y + 104), outline=LN, fill=(220, 220, 210))
            d.rectangle((x + 80, y - 40, x + 140, y), outline=LN, fill=(200, 200, 206), width=2)
            d.rectangle((x + 74, y - 60, x + 146, y - 38), outline=YL, fill=(20, 20, 24))
            for k in range(3): d.ellipse((x + 80 + k * 22, y - 56, x + 96 + k * 22, y - 42), outline=LN)
            d.line((x + 172, y + 6, x + 172, y + 116), fill=YL, width=3)
        else:
            d.rectangle((x + 80, y - 40, x + 140, y), outline=LN, fill=(200, 200, 206), width=2)
            d.line((x + 48, y + 6, x + 48, y + 116), fill=YL, width=3)
        for wx in (x + 54, x + 166): d.rectangle((wx - 6, y + 112, wx + 6, y + 146), outline=LN, fill=(150, 110, 70))
for k, (m, t) in enumerate([('W', '西へ: 引き出しの面(左に STP、口も左)'), ('E', '東へ: 背板の面(引き出しなし。右に STP、口も右)'), ('S', 'こちらへ: STP とナンバーの面、口がこちら'), ('N', '向こうへ: うしろの面')]):
    x = VX + (k % 2) * 480; y = VY + 70 + (k // 2) * 330
    chest(x + 60, y, m); d.text((x, y + 170), t, fill=YL, font=f(15))
d.text((VX, VY + 650), '黄色の線 = 引き出しの面の端(こちら・向こうから見ると、横腹の引き出しが細く見える)', fill=CY, font=f(14))
text(d, 40, 1300, [
    '#ビルダーの仕様',
    '!PixelLab の見本(前回)の誤り: 吸気口の口と車輪が、引き出しの面を正面として作られていた。車輪も小さなキャスターだった',
    '前: STP とナンバーの短い面。引き出しは進む向きの左側の横腹(右側は背板)。東へ走る絵は、西の絵の反転ではなく背板の面',
    '車輪: 四隅に大きな木の車輪(鉄の輪)。車軸は奥行きの向きで、長い向きに転がる。前後の短い面に綱を通す鉄の環',
    'エンジン: 天板の前寄りに沈めた V8 とブロアー。吸気口の口は前。引き出しの下にルーバー。ゼッケン「1」、STP',
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
