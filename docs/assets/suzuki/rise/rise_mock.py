# 上昇の動きの見本(作者: 「上昇している感がないなあ」)
# 外から見る。単結晶は画面のまんなかに止まり、背景(荒川の町 → 夕焼けの雲 → 成層圏 → 熱圏 → 宇宙)が下へ流れていく。
# 雲は手前ほど速く流れる(多重スクロール)。最後は地球のふちが下に見える
import sys, math, random
sys.path.insert(0, '/home/user/project/docs/assets/suzuki/crystal')
from PIL import Image, ImageDraw
import cigar as CG
W, H = 320, 192
TALL = 1800
R = random.Random(4)
# 縦に長い空(下が地上、上が宇宙)
sky = Image.new('RGB', (W, TALL)); d = ImageDraw.Draw(sky)
stops = [(0, (4, 6, 16)), (380, (6, 10, 26)), (560, (20, 30, 70)), (700, (30, 70, 150)), (980, (60, 120, 200)), (1250, (150, 140, 190)), (1500, (250, 170, 110)), (TALL, (255, 200, 130))]
for y in range(TALL):
    for (y0, c0), (y1, c1) in zip(stops, stops[1:]):
        if y0 <= y <= y1:
            t = (y - y0) / (y1 - y0); d.line((0, y, W, y), fill=tuple(int(c0[i] * (1 - t) + c1[i] * t) for i in range(3)))
for _ in range(220): d.point((R.randrange(W), R.randrange(0, 520)), fill=(220, 220, 240))
d.rectangle((0, 600, W, 606), fill=(70, 200, 150)); d.rectangle((0, 606, W, 612), fill=(90, 150, 240))    # 熱圏の光の帯
for _ in range(40): x = R.randrange(W); y = R.randrange(1000, 1080); d.ellipse((x - 30, y - 6, x + 30, y + 6), fill=(236, 240, 248))   # 成層圏の下の雲海
# 地上(いちばん下): 荒川と町の影
d.rectangle((0, TALL - 60, W, TALL), fill=(70, 100, 60)); d.rectangle((0, TALL - 80, W, TALL - 60), fill=(220, 140, 110))
x = 0
while x < W:
    w_ = R.randrange(14, 30); h_ = R.randrange(14, 40); d.rectangle((x, TALL - 80 - h_, x + w_ - 2, TALL - 80), fill=(70, 56, 80)); x += w_
d.rectangle((210, TALL - 150, 216, TALL - 80), fill=(70, 56, 80))
CLOUDS = [(R.randrange(W), R.randrange(700, 1600), R.randrange(20, 60)) for _ in range(40)]
# 単結晶(横から)。中に、きー
def crystal(img, cx, cy, s=7):
    CG.draw(img, ox=cx - 14 * s, oy=cy - CG.YC * s, s=s)     # 透明な筒: 後ろの空が透ける
    dd = ImageDraw.Draw(img); dd.ellipse((cx - 4, cy - 2, cx + 4, cy + 6), fill=(246, 240, 210), outline=(110, 100, 90))
frames = []
N = 48
for f in range(N):
    t = f / (N - 1)
    pos = (TALL - H) * (1 - (t ** 1.6))                  # はじめはゆっくり、だんだん速く
    fr = sky.crop((0, int(pos), W, int(pos) + H)).convert('RGBA')
    fd = ImageDraw.Draw(fr)
    for (cx, cy, r) in CLOUDS:                            # 手前の雲は、背景より速く下へ
        yy = (cy - pos) * 1.4 + H * 0.2              # 雲は空より 1.4 倍の速さで流れる(手前にある)
        if -20 < yy < H + 20: fd.ellipse((cx - r, yy - r / 4, cx + r, yy + r / 4), fill=(250, 240, 240, 230))
    if t > 0.75:                                          # 宇宙: 下に地球のふち
        k = (t - 0.75) / 0.25
        fd.ellipse((-400, H - 30 * k, W + 400, H + 900), fill=(40, 90, 170)); fd.arc((-400, H - 30 * k, W + 400, H + 900), 250, 290, fill=(140, 200, 255), width=3)
    shake = int(round(math.sin(f * 1.7) * 1.5))
    crystal(fr, W // 2 + shake, H // 2)
    for k in range(6):                                    # 下へ流れる光の筋(速さの線)
        x = (k * 53 + f * 17) % W; y = (f * 31 + k * 40) % H
        fd.line((x, y, x, y + 10 + 20 * t), fill=(255, 255, 255, 90))
    frames.append(fr.convert('RGB').resize((W * 2, H * 2), Image.NEAREST))
frames[0].save('/home/user/project/docs/record/2026-10-02-suzuki/rise_motion_mock.gif', save_all=True, append_images=frames[1:], duration=120, loop=0)
strip = Image.new('RGB', (W * 2 * 4 + 30, H * 2), 'white')
for i, f in enumerate([0, 16, 32, 47]): strip.paste(frames[f], (i * (W * 2 + 10), 0))
strip.save('/home/user/project/docs/record/2026-10-02-suzuki/rise_motion_mock_strip.png'); print('ok')
