# スタイルフレームの下絵(D133): スタートの真うしろから見る 2 台と信号(ツリー)。480×288
from PIL import Image, ImageDraw
W, H = 480, 288
im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im)
for y in range(110):
    k = y / 110; d.line((0, y, W, y), fill=(int(96 + 120 * k), int(150 + 80 * k), int(220 + 25 * k)))
for x0, w, h in [(0, 140, 30), (300, 180, 40), (170, 80, 18)]:
    d.polygon([(x0, 110), (x0 + 14, 110 - h), (x0 + w - 14, 110 - h), (x0 + w, 110)], fill=(190, 110, 80))
d.rectangle((0, 110, W, H), fill=(214, 186, 140))
VX, VY = 240, 108
d.polygon([(VX - 6, VY), (VX + 6, VY), (W + 120, H), (-120, H)], fill=(92, 90, 88))      # 道(遠くへ細くなる)
d.line((VX, VY, VX, H), fill=(236, 230, 210), width=3)                                   # 車線の境
for s in (-1, 1): d.line((VX + s * 6, VY, VX + s * 360, H), fill=(240, 240, 236), width=2)
d.line((40, 228, 440, 228), fill=(250, 250, 250), width=4)                               # スタートの白線
for x in range(0, W, 30):                                                                  # 見物のスタンド(左右、人はいない)
    if x < 120 or x > 360: d.rectangle((x, 140 + abs(x - 240) // 8, x + 22, 170 + abs(x - 240) // 8), fill=(180, 170, 160), outline=(120, 110, 100))
d.rectangle((228, 120, 252, 236), fill=(30, 30, 30))                                     # ツリー
for i, c in enumerate([(240, 230, 160)] * 2 + [(255, 180, 40)] * 3 + [(70, 220, 90), (230, 50, 40)]):
    for s in (-1, 1): d.ellipse((240 + s * 7 - 5, 126 + i * 15, 240 + s * 7 + 5, 136 + i * 15), fill=c)
# 2 台(うしろから): 左に赤べこ、右にぼぎカー
d.rectangle((90, 190, 200, 250), fill=(180, 40, 36)); d.rectangle((120, 160, 170, 192), fill=(200, 200, 206))
for x in (80, 190): d.rectangle((x, 220, x + 30, 262), fill=(30, 30, 30))
d.rectangle((290, 214, 380, 252), fill=(70, 46, 30)); d.ellipse((310, 196, 360, 222), fill=(244, 230, 180))
for x in (280, 372): d.rectangle((x, 238, x + 16, 262), fill=(230, 230, 226))
im.save('/home/user/project/docs/assets/noroi/ad/frame_in.png'); print('ok')
