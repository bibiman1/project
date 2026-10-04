# 車箪笥のドットの下絵(D135、D136)。作者のスケッチ A・B と設定どおり:
# 前 = STP とナンバーの短い面。長い向きに転がる。引き出しは進む向きの左の横腹だけ(反対は背板)。
# 車輪は箱の下の四隅(外へつき出さない)。すそにアーチの切り欠きがあり、そこから車輪がのぞく。アーチのあいだはルーバー。
# エンジン(V8 とブロアー)は天板の前寄りに沈め、吸気口の口は前。前とうしろの短い面に綱の鉄の環。菱形の鉄の金具、角の三角の金具。
# 出力: tansu_w_under.png(引き出しの面、前は左)、tansu_e_under.png(背板の面、前は右)。1 ドット = ゲームの 1 ドット
import sys
from PIL import Image, ImageDraw
out = sys.argv[1]
W, H = 120, 96
OUT = (46, 26, 18); WD = (84, 48, 30); WM = (108, 64, 40); WL = (138, 88, 56); WH = (168, 116, 76)
IR = (38, 38, 42); IRH = (98, 98, 106)
CH = (232, 238, 246); CM = (176, 184, 196); CD = (104, 112, 126); CK = (40, 44, 52)
WHL = (122, 82, 52); WHD = (86, 56, 36)
def side(drawers):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    x0, x1 = 8, 111                # 箱の左右(前は左)
    top, y0, y1 = 24, 32, 80       # 天板の奥のふち、横腹の上、すその下
    # 車輪(箱の下の四隅。すその切り欠きからのぞく)。先に描いて、すそで隠す
    for cx in (24, 95):
        d.ellipse((cx - 9, 70, cx + 9, 88), fill=IR)
        d.ellipse((cx - 7, 72, cx + 7, 86), fill=WHL)
        d.ellipse((cx - 3, 76, cx + 3, 82), fill=WHD); d.point((cx, 79), fill=IRH)
    # 天板(斜め上から見える細い面)
    d.polygon([(x0, y0), (x0 + 6, top), (x1, top), (x1, y0)], fill=WL, outline=OUT)
    for x in range(x0 + 10, x1 - 8, 9): d.line((x, top + 2, x + 6, top + 2), fill=WH)
    # 横腹
    d.rectangle((x0, y0, x1, 72), fill=WM, outline=OUT)
    # すそ(台): アーチの切り欠き 2 つ、あいだにルーバー
    d.rectangle((x0, 72, x1, y1), fill=WD, outline=OUT)
    for cx in (24, 95):
        d.rectangle((cx - 11, 74, cx + 11, y1), fill=(0, 0, 0, 0))
        d.pieslice((cx - 11, 72, cx + 11, 90), 180, 360, fill=(0, 0, 0, 0))
        d.arc((cx - 11, 72, cx + 11, 90), 180, 360, fill=OUT)
        for bx in (cx - 13, cx + 13): d.point((bx, 76), fill=IRH)       # 角のびょう
    for cx in (24, 95):                                                 # 車輪をアーチの中へ描き直す
        d.ellipse((cx - 9, 70, cx + 9, 88), fill=IR); d.ellipse((cx - 7, 72, cx + 7, 86), fill=WHL)
        d.ellipse((cx - 3, 76, cx + 3, 82), fill=WHD); d.point((cx, 79), fill=IRH)
        d.rectangle((cx - 11, 70, cx + 11, 72), fill=WD); d.line((cx - 11, 72, cx + 11, 72), fill=OUT)
    for y in range(75, y1, 2): d.line((38, y, 81, y), fill=OUT)        # ルーバー
    if drawers:
        for k, (a, b) in enumerate(((34, 45), (47, 58), (60, 71))):
            d.rectangle((x0 + 4, a, x1 - 4, b), fill=WM, outline=OUT)
            d.line((x0 + 5, a + 1, x1 - 5, a + 1), fill=WL)
            for cx, r in ((x0 + 22, 5), ((x0 + x1) // 2, 7), (x1 - 22, 5)):  # 菱形の鉄の金具(まん中は大きく、引き手つき)
                cy = (a + b) // 2
                d.polygon([(cx - r, cy), (cx, cy - 3), (cx + r, cy), (cx, cy + 3)], fill=IR, outline=OUT)
                d.point((cx, cy), fill=IRH)
            for cx in (x0 + 6, x1 - 6):                                      # 角の三角の金具
                d.polygon([(cx - 2, a + 2), (cx + 2, a + 2), (cx, a + 4)], fill=IR)
    else:
        for y in range(40, 72, 8): d.line((x0 + 1, y, x1 - 1, y), fill=WD)  # 背板(横の板目だけ)
    # 綱を通す鉄の環(前とうしろの短い面)
    for cx in (x0 - 3, x1 + 3):
        d.ellipse((cx - 3, 46, cx + 3, 52), outline=IR, width=2)
    # エンジン: 天板の前寄り(左)に沈めた V8、上にブロアー、吸気口の口は前(左)
    ex = 22
    d.rectangle((ex, 16, ex + 26, 26), fill=CD, outline=CK)                 # V8 の頭(天板から少し出る)
    for k in range(4): d.line((ex + 3 + k * 6, 18, ex + 3 + k * 6, 24), fill=CM)
    d.rectangle((ex + 4, 6, ex + 22, 16), fill=CM, outline=CK)              # ブロアー
    for y in range(8, 15, 2): d.line((ex + 6, y, ex + 20, y), fill=CH)
    d.polygon([(ex + 2, 0), (ex + 24, 2), (ex + 24, 7), (ex + 2, 7)], fill=CM, outline=CK)  # 吸気のスクープ
    d.rectangle((ex + 2, 1, ex + 5, 6), fill=CK)                             # 口(前 = 左を向く)
    return im
side(True).save(f'{out}/tansu_w_under.png')
side(False).transpose(Image.FLIP_LEFT_RIGHT).save(f'{out}/tansu_e_under.png')
print('ok')
