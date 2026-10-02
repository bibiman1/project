# 一枚絵の案: 単結晶の中(作者: 「円柱の先端と後端が穴が空いている。透明なトンネルを覗きこむきーが単結晶の中に入る絵をだせる？
# ビンの中にいるような幻想的な絵。飛び上がるオチと差し替える」)
# 一点透視: 透明な筒の中から、奥の穴(夕焼けの河川敷)を見る。ガラスの壁ごしに、ゆがんだ外の景色(空、輪のある月、草)
from PIL import Image, ImageDraw
import math, random
W, H = 320, 192
VX, VY = 166, 84
HX, HY = 24, 21                     # 奥の穴の半径
R = random.Random(3)
# 外の景色(ガラスごしに、ゆがんで見える)。場面ごとに変わる
import sys
PHASE = sys.argv[1] if len(sys.argv) > 1 else 'sunset'
def outside(phase):
    O = Image.new('RGB', (W * 2, H * 2)); od = ImageDraw.Draw(O); h2 = H * 2
    for y in range(h2):
        k = y / h2
        if phase == 'sunset':
            c = (int(64 + 190 * k * 1.6), int(52 + 120 * k * 1.6), int(120 - 30 * k)) if k < .55 else (80, 116, 70)
        elif phase == 'strato':     # 濃い青の空、ずっと下に雲の海
            c = (int(20 + 60 * k), int(50 + 110 * k), int(120 + 110 * k)) if k < .6 else (236, 240, 248)
        elif phase == 'thermo':     # 黒い空、地平に青い大気の光と、緑のうすい光
            c = (4, 6, 18) if k < .5 else ((60, 200, 140) if k < .53 else ((90, 160, 255) if k < .58 else (30, 60, 130)))
        else:                       # 衛星軌道: 星空と、下に丸い地球
            c = (4, 6, 16) if k < .55 else ((140, 200, 255) if k < .57 else (40, 90, 170))
        od.line((0, y, W * 2, y), fill=tuple(min(255, v) for v in c))
    if phase == 'strato':
        for _ in range(60): x = R.randrange(W * 2); y = R.randrange(int(h2 * .6), h2); od.ellipse((x - 14, y - 4, x + 14, y + 4), fill=(210, 220, 236))
    if phase in ('thermo', 'orbit'):
        for _ in range(140): od.point((R.randrange(W * 2), R.randrange(int(h2 * .48))), fill=(220, 220, 240))
    if phase == 'orbit':
        for _ in range(40): x = R.randrange(W * 2); y = R.randrange(int(h2 * .6), h2); od.ellipse((x - 10, y - 3, x + 10, y + 3), fill=(230, 236, 246))
    return O
HOLE = {
    'sunset': lambda k: (255, int(176 + 50 * (1 - k)), int(116 + 60 * (1 - k))) if k < .62 else (92, 126, 66),
    'strato': lambda k: (int(30 + 80 * k), int(70 + 100 * k), int(170 + 70 * k)) if k < .7 else (236, 240, 248),
    'thermo': lambda k: (4, 6, 18) if k < .55 else ((80, 210, 150) if k < .6 else (90, 150, 240)),
    'orbit': lambda k: (4, 6, 16) if k < .62 else ((140, 200, 255) if k < .66 else (40, 90, 170)),
}[PHASE]
O = outside(PHASE)
im = Image.new('RGB', (W, H)); px = im.load(); op = O.load()
for y in range(H):
    for x in range(W):
        dx, dy = (x - VX) / HX, (y - VY) / HY
        rho = math.hypot(dx, dy); th = math.atan2(dy, dx)
        if rho < 1:
            # 奥の穴: 夕焼けの河川敷
            k = (dy + 1) / 2
            c = HOLE(k)
            if PHASE != 'orbit' and math.hypot(dx * 1.2, (dy - 0.15) * 1.6) < 0.32: c = (255, 230, 156) if PHASE == 'sunset' else (255, 255, 236)
            px[x, y] = c; continue
        # 壁ごしの外: 遠くほど(穴に近いほど)ゆがみが強い
        depth = 1 / rho
        sx = W + math.cos(th) * (W * 0.9) * (1 - 0.55 * depth) + math.sin(th * 3) * 18 * depth
        sy = H + math.sin(th) * (H * 0.9) * (1 - 0.55 * depth)
        c = op[int(min(W * 2 - 1, max(0, sx))), int(min(H * 2 - 1, max(0, sy)))]
        g = (0.28 + 0.42 * min(1, (rho - 1) / 6)) * (1 if PHASE in ('sunset', 'strato') else 0.4)   # 手前ほどガラスの色が濃い。宇宙では外の暗さが透ける
        c = tuple(int(c[i] * (1 - g) + (176, 226, 240)[i] * g) for i in range(3))
        # 床(下側)は、穴から差しこむ光の模様
        if PHASE == 'sunset' and math.sin(th) > 0.55 and R.random() < 0.05 * min(1, rho / 3): c = (236, 250, 255)
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
    d.line((VX + k * 5, VY + HY - 2, VX + k * 60, H), fill=(250, 226, 180) if PHASE == 'sunset' else (200, 220, 255), width=1)
im.save(f'/home/user/project/docs/assets/suzuki/crystal/inside_{PHASE}.png'); print('ok')
