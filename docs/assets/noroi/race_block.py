# 競争の場面の下絵(横から見る、480×300)。空と遠いメサ(動かない)と、道(流れる)
from PIL import Image, ImageDraw
import random
R = random.Random(3)
O = '/home/user/project/docs/assets/noroi/v1/'
im = Image.new('RGBA', (480, 300)); d = ImageDraw.Draw(im)
for y in range(170):                                        # 真昼の空(上が濃い)
    k = y / 170; d.line((0, y, 480, y), fill=(int(110 + 110 * k), int(170 + 60 * k), int(225 + 20 * k)))
d.ellipse((360, 30, 384, 54), fill=(250, 250, 250)); d.ellipse((368, 26, 390, 50), fill=(146, 192, 236))   # 欠けた月
d.arc((340, 38, 404, 48), 0, 360, fill=(230, 236, 244))
for x0, w, h in [(0, 120, 40), (150, 70, 28), (260, 160, 46), (430, 90, 30)]:   # 遠いメサ
    d.polygon([(x0, 170), (x0 + 12, 170 - h), (x0 + w - 12, 170 - h), (x0 + w, 170)], fill=(196, 120, 90), outline=(150, 90, 70))
    d.line((x0 + 14, 170 - h + 6, x0 + w - 14, 170 - h + 6), fill=(170, 100, 76))
d.rectangle((0, 150, 480, 170), fill=(222, 196, 150))
d.rectangle((0, 170, 480, 196), fill=(206, 176, 128))      # 路肩
for i in range(16):
    x = R.randrange(0, 480); d.ellipse((x - 8, 176, x + 8, 188), fill=(150, 150, 110))
d.rectangle((0, 196, 480, 270), fill=(100, 98, 96))         # アスファルト
for x in range(0, 480, 60): d.rectangle((x, 231, x + 30, 234), fill=(226, 200, 90))
for i in range(30):
    x = R.randrange(0, 480); y = R.randrange(200, 268); d.line((x, y, x + R.randrange(-10, 10), y + 4), fill=(76, 74, 72))
d.rectangle((0, 270, 480, 300), fill=(212, 182, 134))      # 手前の路肩
for i in range(14):
    x = R.randrange(0, 480); d.ellipse((x - 10, 280, x + 10, 296), fill=(140, 140, 100))
im.save(O + 'race.png')
print('ok')
