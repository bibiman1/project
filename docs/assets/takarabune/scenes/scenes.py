# 一枚絵の下絵(320×192 / 海図は 320×240)。PixelLab で仕上げる前の形
import math, random
from PIL import Image, ImageDraw
O = '/home/user/project/docs/assets/takarabune/scenes/'
KI = Image.open('/home/user/project/field/assets/worlds/lake/ki_walk.png').convert('RGBA')
def ki(row, col=0, s=1):
    k = KI.crop((col * 64, row * 64, col * 64 + 64, row * 64 + 64)); k = k.crop(k.getbbox())
    return k.resize((k.width * s, k.height * s), Image.NEAREST)
R = random.Random(3)
def glow(img, cx, cy, r, col, a=160, sy=0.7):
    ov = Image.new('RGBA', img.size); od = ImageDraw.Draw(ov)
    for k in range(10, 0, -1):
        rr = r * k / 10; od.ellipse((cx - rr, cy - rr * sy, cx + rr, cy + rr * sy), fill=col + (int(a * (1 - k / 11) / 3),))
    img.alpha_composite(ov)

# 鋳造: 鋳物小屋の中。鎖で吊ったるつぼを、きーが鎖を引いて傾け、青銅の湯を砂の鋳型に注ぐ
c = Image.new('RGBA', (320, 192), (30, 22, 20, 255)); d = ImageDraw.Draw(c)
for x in range(0, 320, 10): d.line((x, 0, x, 120), fill=(44, 32, 26))                 # 板壁
d.rectangle((0, 120, 320, 192), fill=(70, 56, 44))                                     # 土間
for _ in range(400): d.point((R.randrange(0, 320), R.randrange(120, 192)), fill=(90, 72, 56))
d.rectangle((10, 40, 80, 130), fill=(60, 50, 46), outline=(20, 16, 14))                # 炉
d.ellipse((24, 70, 66, 112), fill=(255, 120, 30)); glow(c, 45, 92, 70, (255, 120, 40), 200)
d.line((150, 0, 150, 52), fill=(120, 110, 100), width=3)                               # 吊り鎖
for y in range(0, 52, 6): d.ellipse((147, y, 153, y + 6), outline=(150, 140, 130))
d.line((150, 30, 214, 30), fill=(90, 80, 70), width=3); d.line((214, 30, 214, 118), fill=(150, 140, 130), width=2)  # 引き鎖
d.polygon([(124, 52), (176, 46), (172, 92), (132, 96)], fill=(90, 80, 76), outline=(20, 18, 16))       # るつぼ(傾いて)
d.polygon([(130, 56), (172, 51), (168, 60), (132, 64)], fill=(255, 190, 80))
d.line((172, 54, 184, 60), fill=(255, 210, 110), width=4)
for y in range(60, 140, 2): d.line((184 + (y - 60) * 0.05, y, 188 + (y - 60) * 0.05, y), fill=(255, 200 - (y - 60), 70))  # 湯の流れ
glow(c, 186, 120, 60, (255, 170, 60), 220)
d.rectangle((160, 132, 230, 160), fill=(120, 96, 70), outline=(40, 30, 20), width=2)   # 砂の鋳型
d.ellipse((178, 134, 200, 144), fill=(255, 190, 80))
for _ in range(30):
    x, y = 186 + R.randrange(-40, 40), 130 + R.randrange(-30, 10); d.point((x, y), fill=(255, 220, 120))
k = ki(3, 0, 1)                                                                          # 西を向いたきー(鎖を引く)
c.alpha_composite(k, (214 + 4, 150 - k.height))
d.line((214, 118, 222, 136), fill=(150, 140, 130), width=2)
c.save(O + 'cast_in.png')

# 青く光る海: 夜の沖。欠けて輪のある月。宝舟のまわりの海が青白く光って広がる。舳先にきー
g = Image.new('RGBA', (320, 192), (8, 12, 30, 255)); d = ImageDraw.Draw(g)
for y in range(0, 78): d.line((0, y, 320, y), fill=(8 + y // 6, 12 + y // 5, 34 + y // 3))
for _ in range(70): d.point((R.randrange(0, 320), R.randrange(0, 74)), fill=(220, 220, 240))
d.ellipse((40, 14, 66, 40), fill=(240, 236, 214)); d.ellipse((52, 10, 74, 34), fill=(14, 20, 44))   # 欠けた月
d.arc((22, 22, 86, 34), 0, 360, fill=(170, 166, 150))
d.rectangle((0, 78, 320, 192), fill=(10, 20, 44))
glow(g, 190, 140, 170, (60, 200, 255), 255, 0.45); glow(g, 190, 140, 90, (170, 240, 255), 255, 0.45)
for _ in range(160):
    x = R.randrange(0, 320); y = R.randrange(80, 192); w = R.randrange(4, 16)
    dist = math.hypot((x - 190) / 1.0, (y - 140) / 0.45)
    col = (150, 230, 255) if dist < 150 else (40, 70, 110)
    d.line((x, y, x + w, y), fill=col)
# 宝舟(横から。舳先は右、竜頭、外輪、つぎはぎの帆)
hull = [(140, 132), (236, 132), (256, 108), (262, 100), (252, 128), (236, 148), (150, 148), (134, 138)]
d.polygon(hull, fill=(70, 46, 28), outline=(20, 14, 10))
d.polygon([(254, 102), (262, 92), (270, 96), (266, 104), (258, 108)], fill=(90, 60, 34), outline=(20, 14, 10))
d.line((190, 132, 190, 70), fill=(60, 44, 30), width=3)
d.polygon([(172, 74), (210, 72), (208, 118), (174, 120)], fill=(200, 190, 166), outline=(80, 70, 60))
for (x, y, w, h, col) in [(176, 78, 10, 10, (170, 150, 120)), (194, 96, 12, 12, (150, 170, 180))]: d.rectangle((x, y, x + w, y + h), fill=col)
d.rectangle((150, 116, 160, 132), fill=(110, 80, 44)); d.rectangle((152, 100, 156, 116), fill=(50, 50, 50))  # ボイラーと煙突
for k_ in range(4): d.ellipse((148 - k_ * 4, 92 - k_ * 8, 160 - k_ * 2, 100 - k_ * 8), fill=(200, 200, 210))
d.ellipse((200, 132, 224, 152), fill=(60, 40, 24), outline=(20, 14, 10))
k = ki(2, 0, 1); k = k.resize((k.width * 2 // 3, k.height * 2 // 3), Image.NEAREST)
g.alpha_composite(k, (236, 128 - k.height))
g.save(O + 'glow_in.png')

# 白紙の海図: 古い紙。方位盤と、うすい経緯線だけ。陸も文字もない
m = Image.new('RGBA', (320, 240), (40, 32, 24, 255)); d = ImageDraw.Draw(m)
d.rectangle((16, 14, 304, 226), fill=(222, 210, 178), outline=(120, 100, 70), width=2)
d.rectangle((24, 22, 296, 218), outline=(150, 130, 96), width=1)
for x in range(24, 296, 34): d.line((x, 22, x, 218), fill=(200, 186, 150))
for y in range(22, 218, 34): d.line((24, y, 296, y), fill=(200, 186, 150))
cx, cy = 240, 166
for r_ in (30, 24): d.ellipse((cx - r_, cy - r_, cx + r_, cy + r_), outline=(120, 96, 64))
for k_ in range(16):
    ang = k_ * math.pi / 8; L = 34 if k_ % 4 == 0 else 22 if k_ % 2 == 0 else 14
    d.line((cx, cy, cx + L * math.sin(ang), cy - L * math.cos(ang)), fill=(140, 60, 40) if k_ == 0 else (120, 96, 64), width=2 if k_ % 4 == 0 else 1)
for _ in range(500): d.point((R.randrange(18, 302), R.randrange(16, 224)), fill=(206, 192, 160))
d.ellipse((60, 160, 90, 180), fill=(205, 188, 150))                                    # しみ
m.save(O + 'kaizu_in.png')
print('ok')
