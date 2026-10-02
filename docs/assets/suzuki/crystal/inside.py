# 一枚絵の案: 単結晶の中(作者: 「円柱の先端と後端が穴が空いている。透明なトンネルを覗きこむきーが単結晶の中に入る絵をだせる？
# ビンの中にいるような幻想的な絵。飛び上がるオチと差し替える」)
# 一点透視: 透明な筒の中から、奥の穴(夕焼けの河川敷)を見る。ガラスの壁ごしに、ゆがんだ外の景色(空、輪のある月、草)
from PIL import Image, ImageDraw
import math, random
W, H = 320, 192
VX, VY = 166, 84
HX, HY = 24, 21                     # 奥の穴の半径
R = random.Random(3)
# 外の景色(ガラスごしに、ゆがんで見える)
O = Image.new('RGB', (W * 2, H * 2)); od = ImageDraw.Draw(O)
for y in range(H * 2):
    k = y / (H * 2)
    c = (int(64 + 190 * k * 1.6), int(52 + 120 * k * 1.6), int(120 - 30 * k)) if k < .55 else (80, 116, 70)
    od.line((0, y, W * 2, y), fill=tuple(min(255, v) for v in c))
od.ellipse((120, 60, 190, 130), fill=(236, 232, 224)); od.chord((120, 60, 190, 130), 300, 60, fill=(150, 120, 150))
od.arc((80, 84, 230, 106), 0, 360, fill=(220, 206, 220), width=3)
od.rectangle((0, int(H * 2 * .55), W * 2, int(H * 2 * .58)), fill=(220, 150, 110))
im = Image.new('RGB', (W, H)); px = im.load(); op = O.load()
for y in range(H):
    for x in range(W):
        dx, dy = (x - VX) / HX, (y - VY) / HY
        rho = math.hypot(dx, dy); th = math.atan2(dy, dx)
        if rho < 1:
            # 奥の穴: 夕焼けの河川敷
            k = (dy + 1) / 2
            c = (255, int(176 + 50 * (1 - k)), int(116 + 60 * (1 - k))) if k < .62 else (92, 126, 66)
            if math.hypot(dx * 1.2, (dy - 0.15) * 1.6) < 0.32: c = (255, 230, 156)
            px[x, y] = c; continue
        # 壁ごしの外: 遠くほど(穴に近いほど)ゆがみが強い
        depth = 1 / rho
        sx = W + math.cos(th) * (W * 0.9) * (1 - 0.55 * depth) + math.sin(th * 3) * 18 * depth
        sy = H + math.sin(th) * (H * 0.9) * (1 - 0.55 * depth)
        c = op[int(min(W * 2 - 1, max(0, sx))), int(min(H * 2 - 1, max(0, sy)))]
        g = 0.28 + 0.42 * min(1, (rho - 1) / 6)                    # 手前ほどガラスの色が濃い
        c = tuple(int(c[i] * (1 - g) + (176, 226, 240)[i] * g) for i in range(3))
        # 床(下側)は、穴から差しこむ光の模様
        if math.sin(th) > 0.55 and R.random() < 0.05 * min(1, rho / 3): c = (236, 250, 255)
        # 筒の切り子: 長さの向きの稜線(12 本)と、輪
        f = (th / (2 * math.pi) * 12) % 1
        if f < 0.035 * min(3, rho) / 3 + 0.01: c = tuple(min(255, int(v * 1.18 + 20)) for v in c)
        for rr in (1.0, 1.6, 2.5, 3.9, 6.0, 9.3):
            if abs(rho - rr) < 0.035 * rr: c = tuple(min(255, int(v * 1.1 + 26)) for v in c)
        px[x, y] = c
im = im.convert('RGBA'); d = ImageDraw.Draw(im)
d.ellipse((VX - HX, VY - HY, VX + HX, VY + HY), outline=(248, 252, 255), width=2)
# 穴から床へ差す光の筋
for k in range(-3, 4):
    d.line((VX + k * 5, VY + HY - 2, VX + k * 60, H), fill=(250, 226, 180), width=1)
# きー(後ろ姿)。筒の床のまんなかで、奥の穴を見ている
kx, ky = 152, 150
ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(ov).ellipse((kx - 11, ky - 2, kx + 11, ky + 3), fill=(30, 60, 80, 90)); im.alpha_composite(ov)
d = ImageDraw.Draw(im)
d.ellipse((kx - 8, ky - 20, kx + 8, ky - 4), fill=(246, 244, 236), outline=(110, 104, 96))
d.rectangle((kx - 6, ky - 7, kx + 6, ky), fill=(246, 244, 236), outline=(110, 104, 96))
d.line((kx - 6, ky - 7, kx + 6, ky - 7), fill=(246, 244, 236))
im.save('/home/user/project/docs/assets/suzuki/crystal/inside_blockout.png'); print('ok')
