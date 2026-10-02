# 一枚絵の下絵その 2(D88): 鋳造(ペレットの熱で青白く燃える炉)と、青く光る海(描き直し)。480×288
# 月と輪は、アンバリッド・ホテルの望遠鏡の絵(haihei/v_moon.png)から切り出して使う(同じ月。仕上げのあとで貼り戻す)
import math, random
import numpy as np
from PIL import Image, ImageDraw
O = '/home/user/project/docs/assets/takarabune/scenes/'
F = '/home/user/project/field/assets/worlds/'
R = random.Random(9)
KI = Image.open(F + 'lake/ki_walk.png').convert('RGBA')
def ki(row, col=0, s=1.0):
    k = KI.crop((col * 64, row * 64, col * 64 + 64, row * 64 + 64)); k = k.crop(k.getbbox())
    return k.resize((max(1, int(k.width * s)), max(1, int(k.height * s))), Image.NEAREST)
def glow(img, cx, cy, r, col, a=160, sy=0.7):
    ov = Image.new('RGBA', img.size); od = ImageDraw.Draw(ov)
    for k in range(12, 0, -1):
        rr = r * k / 12; od.ellipse((cx - rr, cy - rr * sy, cx + rr, cy + rr * sy), fill=col + (int(a * (1 - k / 13) / 3),))
    img.alpha_composite(ov)

# 月(望遠鏡の絵から): 円の中は背景と違う色だけ、円の外は輪のつぶ(明るい点)だけを残す
vm = np.asarray(Image.open(F + 'haihei/v_moon.png').convert('RGBA')).astype(int)
H_, W_ = vm.shape[:2]; yy, xx = np.mgrid[0:H_, 0:W_]
bg = np.array([14, 18, 40])
diff = np.abs(vm[..., :3] - bg).sum(2)
lum = vm[..., :3].sum(2)
inside = (xx - 161) ** 2 + (yy - 95) ** 2 <= 53 ** 2
ringband = np.abs((yy - 95) - (xx - 161) * -0.33) < 22
alpha = np.where(inside, diff > 40, (lum > 330) & ringband & ((xx - 161) ** 2 + (yy - 95) ** 2 <= 95 ** 2))
moon = vm.copy(); moon[..., 3] = np.where(alpha, 255, 0)
MOON = Image.fromarray(moon.astype('uint8')).crop((60, 30, 262, 165))
MOON.save(O + 'moon_from_vmoon.png')

# ---------- 青く光る海 480×288 ----------
W, H = 480, 288
g = Image.new('RGBA', (W, H), (6, 10, 26, 255)); d = ImageDraw.Draw(g)
HZ = 104
for y in range(HZ): d.line((0, y, W, y), fill=(6 + y // 8, 10 + y // 7, 28 + y // 4))
for _ in range(140): d.point((R.randrange(0, W), R.randrange(0, HZ - 6)), fill=R.choice([(230, 230, 245), (180, 190, 220), (140, 150, 190)]))
d.rectangle((0, HZ, W, H), fill=(8, 18, 40))
for y in range(HZ, H, 3):                                                   # 遠くほど細かい波
    for _ in range(3 + (y - HZ) // 14):
        x = R.randrange(0, W); w = 3 + (y - HZ) // 10
        d.line((x, y, x + w, y), fill=(22, 40, 74))
mx = MOON.resize((MOON.width // 2, MOON.height // 2), Image.NEAREST)
g.alpha_composite(mx, (54, 4))
for k in range(20):                                                         # 水平線に月の映り
    y = HZ + 2 + k * 3; w = 14 - k // 2
    if w > 0: d.line((104 - w, y, 104 + w, y), fill=(120, 130, 150))
# 底から青い光: 大きな輪、ひげのような光の筋、明るい芯(ペレットが沈んだところ)
cx, cy = 300, 206
for _ in range(2):
    glow(g, cx, cy, 320, (30, 110, 210), 255, 0.42)
    glow(g, cx, cy, 210, (50, 190, 255), 255, 0.42)
    glow(g, cx, cy, 110, (150, 240, 255), 255, 0.45)
    glow(g, cx + 6, cy + 2, 50, (230, 255, 255), 255, 0.5)
ov = Image.new('RGBA', g.size); od = ImageDraw.Draw(ov)
for k in range(40):                                                         # 水の中でゆらぐ光のすじ(短く、ばらばらに)
    a = R.uniform(0, math.tau); r0 = R.uniform(20, 120); L = R.uniform(10, 40)
    x0 = cx + r0 * math.cos(a); y0 = cy + r0 * 0.42 * math.sin(a)
    od.line((x0, y0, x0 + L * math.cos(a), y0 + L * 0.42 * math.sin(a)), fill=(170, 240, 255, 60), width=2)
for _ in range(220):                                                        # 光る波がしら
    a = R.uniform(0, math.tau); r_ = R.uniform(10, 230)
    x = cx + r_ * math.cos(a); y = cy + r_ * 0.42 * math.sin(a)
    if y > HZ + 4: od.line((x, y, x + R.randrange(3, 9), y), fill=(200, 250, 255, 200))
g.alpha_composite(ov)
# 宝舟(甲板の絵を小さく): 光の輪の中、少し左。舳先は東。舳先にきー
deck = Image.open(F + 'takarabune/bg_deck.png').convert('RGBA')
bs = deck.resize((200, 100), Image.NEAREST)
shadow = Image.new('RGBA', bs.size, (0, 0, 0, 0)); shadow.putalpha(bs.getchannel('A').point(lambda v: 90 if v else 0))
g.alpha_composite(shadow, (cx - 168, cy - 50 + 8))
g.alpha_composite(bs, (cx - 170, cy - 56))
k = ki(2, 0, 0.5); g.alpha_composite(k, (cx + 2, cy - 14 - k.height + 8))
glow(g, cx + 30, cy - 10, 40, (200, 250, 255), 200)
g.save(O + 'glow2_in.png')

# ---------- 鋳造 480×288 ----------
W, H = 480, 288
c = Image.new('RGBA', (W, H), (28, 22, 22, 255)); d = ImageDraw.Draw(c)
for x in range(0, W, 12): d.line((x, 0, x, 150), fill=(40, 30, 26))         # 板壁
d.rectangle((0, 150, W, H), fill=(60, 50, 44))                             # 砂の土間
for _ in range(1600): d.point((R.randrange(0, W), R.randrange(150, H)), fill=R.choice([(76, 64, 54), (48, 40, 34)]))
for k, x in enumerate(range(250, 440, 20)):                                # 壁の道具(トング、シャンク)
    d.line((x, 20, x, 80), fill=(110, 110, 116), width=3)
    if k % 2: d.ellipse((x - 8, 74, x + 8, 90), outline=(120, 120, 126), width=3)
d.rectangle((24, 22, 90, 70), fill=(24, 34, 60), outline=(60, 44, 30), width=4)  # 窓
# 床に埋めたるつぼ炉: ペレットの熱で青白く燃える
fx, fy = 92, 214
d.ellipse((fx - 70, fy - 34, fx + 70, fy + 40), fill=(100, 64, 46), outline=(40, 26, 18), width=3)
d.ellipse((fx - 48, fy - 22, fx + 48, fy + 26), fill=(180, 240, 255))
d.ellipse((fx - 30, fy - 12, fx + 30, fy + 16), fill=(240, 255, 255))
glow(c, fx, fy, 180, (80, 200, 255), 255)
# 鎖で吊ったるつぼ(炉から上げて、鋳枠の上で傾ける)
d.line((250, 0, 250, 70), fill=(150, 150, 150), width=3)
for y in range(0, 70, 7): d.ellipse((246, y, 254, y + 7), outline=(170, 170, 170))
d.line((214, 74, 286, 74), fill=(120, 120, 124), width=4)
d.polygon([(218, 84), (278, 76), (282, 132), (230, 140)], fill=(96, 86, 82), outline=(24, 20, 18))
d.polygon([(220, 86), (278, 78), (276, 92), (224, 98)], fill=(255, 196, 90))
d.line((278, 84, 296, 96), fill=(255, 220, 120), width=6)
for y in range(96, 196, 2):                                                # 湯の流れ
    xx_ = 296 + (y - 96) * 0.04; d.line((xx_ - 3, y, xx_ + 3, y), fill=(255, max(120, 220 - (y - 96)), 70))
glow(c, 298, 190, 110, (255, 170, 60), 255)
# 砂の床の鋳枠(上枠)。湯口に湯が入る。ほかの鋳枠
def flask(x, y, w, h):
    d.rectangle((x, y + 8, x + w, y + h + 8), fill=(90, 62, 36)); d.rectangle((x, y, x + w, y + h), fill=(150, 108, 62), outline=(60, 40, 22), width=3)
    d.rectangle((x + 6, y + 6, x + w - 6, y + h - 6), fill=(60, 52, 46))
flask(250, 196, 100, 46); d.ellipse((288, 204, 306, 214), fill=(255, 200, 90)); d.ellipse((322, 210, 332, 216), fill=(30, 24, 20))
flask(370, 220, 70, 36); flask(176, 238, 60, 32)
for _ in range(50):
    x, y = 298 + R.randrange(-50, 50), 196 + R.randrange(-40, 10); d.point((x, y), fill=(255, 230, 140))
# きー: 鎖を引いて、るつぼを傾ける(西を向く)
k = ki(3, 0, 1.0)
c.alpha_composite(k, (380, 200 - k.height))
d.line((286, 74, 392, 74), fill=(160, 160, 160), width=2); d.line((392, 74, 392, 186), fill=(160, 160, 160), width=2)
c.save(O + 'cast2_in.png')
print('ok', MOON.size)
