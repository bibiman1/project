# 上昇の背景: 縦に長い空(下が荒川の町、上が宇宙)。半分の大きさ 240×1200 で描き、PixelLab で仕上げてから 2 倍(480×2400)にする
from PIL import Image, ImageDraw
import random
W, TALL = 240, 1200
R = random.Random(4)
sky = Image.new('RGB', (W, TALL)); d = ImageDraw.Draw(sky)
stops = [(0, (4, 6, 16)), (250, (6, 10, 26)), (330, (14, 20, 52)), (420, (24, 50, 120)), (640, (50, 110, 196)), (840, (130, 130, 190)), (1000, (236, 160, 120)), (1110, (252, 196, 130)), (TALL, (255, 206, 140))]
for y in range(TALL):
    for (y0, c0), (y1, c1) in zip(stops, stops[1:]):
        if y0 <= y <= y1:
            t = (y - y0) / max(1, y1 - y0); d.line((0, y, W, y), fill=tuple(int(c0[i] * (1 - t) + c1[i] * t) for i in range(3)))
for _ in range(160): d.point((R.randrange(W), R.randrange(0, 330)), fill=R.choice([(220, 220, 240), (160, 160, 190)]))
# 熱圏: 緑と青のうすい光の帯
d.rectangle((0, 360, W, 364), fill=(60, 180, 140)); d.rectangle((0, 364, W, 370), fill=(70, 120, 210))
# 成層圏の下の雲の海と、夕焼けの雲
for _ in range(26):
    x = R.randrange(-20, W + 20); y = R.randrange(690, 740); d.ellipse((x - 26, y - 5, x + 26, y + 5), fill=(232, 236, 246))
for _ in range(18):
    x = R.randrange(-20, W + 20); y = R.randrange(860, 1000); d.ellipse((x - 22, y - 4, x + 22, y + 4), fill=(250, 214, 196))
# 地上: 荒川の土手と、町の屋根、銭湯の煙突(夕焼けの逆光)
base = TALL - 46
d.rectangle((0, base, W, TALL), fill=(76, 100, 62)); d.rectangle((0, base - 8, W, base), fill=(230, 150, 110))
x = 0
while x < W:
    w_ = R.randrange(12, 26); h_ = R.randrange(10, 26)
    d.polygon([(x, base - 8 - h_ + 4), (x + w_ // 2, base - 8 - h_), (x + w_, base - 8 - h_ + 4), (x + w_, base - 8), (x, base - 8)], fill=(72, 58, 84)); x += w_
d.rectangle((170, base - 70, 174, base - 8), fill=(72, 58, 84))
sky.save('/home/user/project/docs/assets/suzuki/rise/sky_half_in.png'); print('ok')
