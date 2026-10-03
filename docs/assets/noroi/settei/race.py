# 競争の演出の絵コンテ(D125)。ドラッグレースの手順を下じきに
import math
from PIL import Image, ImageDraw, ImageFont
F = '/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'
f = lambda s: ImageFont.truetype(F, s)
O = '/home/user/project/docs/assets/noroi/settei/'
BG = (22, 44, 82); LN = (230, 240, 250); CY = (150, 210, 240); YL = (255, 214, 110); RD = (255, 120, 100); GR = (140, 230, 150)
W, H = 1800, 2000
im = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(im)
d.text((30, 18), '競争の絵コンテ(ドラッグレース)', fill=LN, font=f(30))
d.text((30, 58), '作者「バーンナウトして、ホイールスピンしながら、大馬力で空気を震わせて走り抜ける、迫力をだしたい」「バンジージャンプのように引き戻される」(D125)。横から見る多重スクロール', fill=CY, font=f(16))
d.line((30, 86, W - 30, 86), fill=LN, width=2)
PW, PH = 560, 300
def panel(k, title, lines_, draw):
    x = 30 + (k % 3) * (PW + 25); y = 110 + (k // 3) * (PH + 200)
    d.rectangle((x, y, x + PW, y + PH), outline=LN, width=2, fill=(30, 56, 98))
    d.line((x, y + PH - 60, x + PW, y + PH - 60), fill=(90, 90, 96), width=2)   # 路面
    d.line((x, y + PH - 30, x + PW, y + PH - 30), fill=(200, 180, 80), width=2)
    draw(x, y)
    d.text((x, y - 0), '', fill=LN)
    d.text((x + 8, y + 8), f'{k + 1}  {title}', fill=YL, font=f(18))
    yy = y + PH + 8
    for t in lines_:
        col = LN
        if t.startswith('!'): col, t = RD, t[1:]
        if t.startswith('+'): col, t = GR, t[1:]
        d.text((x, yy), t, fill=col, font=f(14)); yy += 21
def car(x, y, col=(214, 200, 168), w=110, h=36, nose=0):
    d.polygon([(x, y), (x + w, y - nose), (x + w, y - h - nose), (x + 20, y - h)], fill=col, outline=LN)
    for wx in (x + 18, x + w - 16): d.ellipse((wx - 14, y - 14 - (nose if wx > x + 40 else 0), wx + 14, y + 14 - (nose if wx > x + 40 else 0)), fill=(40, 40, 44), outline=LN)
def smoke(x, y, n=8, r=24):
    for i in range(n): d.ellipse((x - i * 22 - r, y - r - (i % 3) * 10, x - i * 22 + r, y + r - (i % 3) * 10), fill=(220, 222, 226))
def tree(x, y, on):
    d.rectangle((x, y, x + 6, y + 120), fill=(30, 30, 30))
    cols = [(255, 190, 40)] * 3 + [(80, 230, 90), (240, 60, 40)]
    for i, c in enumerate(cols):
        d.ellipse((x - 8, y + 6 + i * 20, x + 14, y + 26 + i * 20), fill=c if on[i] else (40, 36, 34), outline=LN)
G = lambda x, y: (x, y + PH - 60)
panel(0, 'ウォーターボックス', ['後輪を水たまりに入れて濡らす(本物の手順)', '野犬たちが見守る。ぽんぽんカーの黒い線は', 'スタートの脇のドラム缶からのびる'], lambda x, y: (car(x + 300, y + PH - 60), d.rectangle((x + 260, y + PH - 66, x + 360, y + PH - 58), fill=(80, 140, 220)), d.rectangle((x + 30, y + PH - 120, x + 70, y + PH - 60), fill=(110, 110, 116), outline=LN), d.line((x + 70, y + PH - 110, x + 300, y + PH - 80), fill=(10, 10, 10), width=4)))
panel(1, 'バーンナウト', ['+後輪を空転させて白煙。タイヤを温めて路面に粘る', '排気の管から炎、エンジンの音で空気がゆれる(画面がゆれる)', 'ぼぎカーの戸車もナイロンが焦げて煙(柿渋の臭い)'], lambda x, y: (smoke(x + 300, y + PH - 80, 10), car(x + 300, y + PH - 60), [d.polygon([(x + 350 + i * 14, y + PH - 100), (x + 344 + i * 14, y + PH - 130), (x + 356 + i * 14, y + PH - 100)], fill=(255, 150, 50)) for i in range(4)]))
panel(2, 'ステージ', ['白線に前輪をそろえる。信号の上の小さな灯り', '(プリステージ、ステージ)が点く', '二台が並ぶ。エンジンの振動で信号の柱がふるえる'], lambda x, y: (tree(x + 120, y + 100, [0, 0, 0, 0, 0]), car(x + 160, y + PH - 70, w=100), car(x + 160, y + PH - 40, (60, 44, 40), w=80, h=20), d.line((x + 260, y + 60, x + 260, y + PH - 30), fill=LN, width=3)))
panel(3, '信号(スポーツマン・ツリー)', ['黄 → 黄 → 黄(0.5 秒ごと)→ 青で A', '!青より前に出ると赤(フライング)= その場で負け(本物の決まり)', 'いまの初稿と同じ。間合いはゆるめたまま'], lambda x, y: (tree(x + 120, y + 70, [1, 1, 1, 0, 0]), tree(x + 260, y + 70, [0, 0, 0, 1, 0]), tree(x + 400, y + 70, [0, 0, 0, 0, 1]), d.text((x + 100, y + 210), '黄 3 つ', fill=YL, font=f(14)), d.text((x + 250, y + 210), '青 = A', fill=GR, font=f(14)), d.text((x + 380, y + 210), '赤 = 負け', fill=RD, font=f(14))))
panel(4, '発進', ['+ホイールスピン、白煙、鼻を上げてウィリー(ギャッサーの発進)', '+空気がふるえる: 陽炎のゆらぎ、画面のゆれ、小石がはねる', 'ぼぎカー: 無慣性で一瞬で全速。きーがつぶれて背中に張り付く'], lambda x, y: (smoke(x + 200, y + PH - 80, 7), car(x + 220, y + PH - 70, nose=30), car(x + 260, y + PH - 40, (60, 44, 40), w=80, h=20), [d.arc((x + 380 + i * 30, y + 60, x + 420 + i * 30, y + 180), 270, 90, fill=CY, width=2) for i in range(4)]))
panel(5, 'バンジー(ぽんぽんカー)', ['+作者の案: ゴールの直前で黒い線がのびきり、', '+バンジージャンプのように引き戻される', 'ぽんぽんカーはドラム缶の所まで飛んで戻る(ナンセンス)'], lambda x, y: (d.rectangle((x + 20, y + PH - 120, x + 60, y + PH - 60), fill=(110, 110, 116), outline=LN), d.line((x + 60, y + PH - 110, x + 470, y + PH - 100), fill=(10, 10, 10), width=4), car(x + 440, y + PH - 70, w=90), d.arc((x + 120, y + 30, x + 520, y + 260), 200, 340, fill=YL, width=3), d.text((x + 400, y + 60), 'びよーん', fill=YL, font=f(18)), d.line((x + 520, y + 40, x + 520, y + PH - 30), fill=LN, width=4)))
panel(6, 'ゴール', ['ウィンライトが点く。ゴールラインをこえたぼぎに、', '+かつてのちゃんの歓声がきこえてくる(作者 D126)', '野犬はパラシュート、ぼぎカーはぴたっと止まる'], lambda x, y: (car(x + 380, y + PH - 40, (60, 44, 40), w=80, h=20), d.line((x + 360, y + 60, x + 360, y + PH - 30), fill=LN, width=4), d.ellipse((x + 340, y + 50, x + 380, y + 90), fill=(255, 240, 120)), d.text((x + 390, y + 60), 'ウィンライト', fill=YL, font=f(14))))
panel(7, 'タイムスリップ', ['ゴールのあと、時間の紙が出る(作者 D126 で採用)', '反応(青からの秒数)、ET(かかった秒数)、最後の速さ', '字はゲームのドットの字。道具にはしない(クラブの札のまま)'], lambda x, y: (d.rectangle((x + 200, y + 60, x + 360, y + 230), fill=(240, 238, 228), outline=LN), [d.line((x + 215, y + 90 + i * 24, x + 345, y + 90 + i * 24), fill=(120, 120, 120), width=2) for i in range(6)]))
panel(8, 'そのあと', ['ぼぎカーは赤べこと並んで走る。ぽんぽんカーは隣のレーンでバンジー(D126)', '直線に戻って、野犬たちからクラブの札', 'ぽんぽんカーはドラム缶の前で、ぽかんとしている', ''], lambda x, y: (d.rectangle((x + 220, y + 110, x + 330, y + 170), fill=(190, 194, 200), outline=LN), d.text((x + 236, y + 128), 'クラブの札', fill=(40, 40, 40), font=f(14))))
y0 = 110 + 3 * (PH + 200) - 40
lines = ['#調べたこと(ドラッグレース)',
 '・ツリー: 上に小さなプリステージ・ステージの灯り、その下に黄 3 つ、青、赤。スポーツマンは黄が 0.5 秒ごと、プロは黄 3 つが同時で 0.4 秒後に青(NHRA の用語集)',
 '・反応時間: 青から前輪がステージの線をぬけるまでの秒数。0.000 が完ぺき。青より前に出ると赤(フライング)で負け',
 '・バーンナウト: ウォーターボックスで後輪を濡らし、空転させてタイヤを温め、路面に粘らせる。走るたびに毎回やる',
 '・トップフューエルは約 11,000 馬力、0〜160km(100 マイル)を約 0.8 秒、発進は 8G 近い。いまは 1000 フィートまで。止まるのにパラシュート',
 '・1960 年代のギャッサー: 鼻を上げた構え(後輪に重さを乗せる)で、発進で前輪が浮くウィリー。ホットロッドの直線レースの花形',
 '・ホールショット: 遅い車が反応の速さで勝つこと。ウィンライト: 先にゴールした側の灯り。タイムスリップ: 走りの記録の紙']
yy = y0
for t in lines:
    if t.startswith('#'): d.text((30, yy), t[1:], fill=YL, font=f(20)); yy += 32; continue
    d.text((30, yy), t, fill=LN, font=f(15)); yy += 24
im = im.crop((0, 0, W, yy + 30)); im.save(O + 'race_storyboard.png'); print(im.size)
