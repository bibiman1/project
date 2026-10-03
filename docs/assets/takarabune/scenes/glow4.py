# 最後の絵(D92): 船は描かない。深い海の中を、ペレットがまばゆい青い光をまとって沈んでいく。上にうっすら水面の明るさ、通ったあとに光の尾、まわりに光の輪と粒。480×288
import math, random
from PIL import Image, ImageDraw, ImageFilter
O = '/home/user/project/docs/assets/takarabune/scenes/'
R = random.Random(31)
W, H = 480, 288
img = Image.new('RGBA', (W, H)); d = ImageDraw.Draw(img)
for y in range(H):                                                          # 上ほど明るい深い青
    k = y / H
    d.line((0, y, W, y), fill=(int(14 - 12 * k), int(46 - 40 * k), int(92 - 70 * k)))
def lay(fn, blur):
    ov = Image.new('RGBA', img.size); fn(ImageDraw.Draw(ov)); img.alpha_composite(ov.filter(ImageFilter.GaussianBlur(blur)) if blur else ov)
# 水面のゆらぎ(うっすら、上のはし)
def surf(od):
    for _ in range(160):
        x = R.randrange(-20, W); y = R.randrange(0, 22)
        od.line([(x + i * 6, y + 2 * math.sin(i + x)) for i in range(4)], fill=(120, 190, 230, 120), width=1)
lay(surf, 0)
# 水面から差しこむ、うすい光の筋(斜め)
def rays(od):
    for k in range(9):
        x0 = 40 + k * 52 + R.uniform(-10, 10)
        od.polygon([(x0, 0), (x0 + 16, 0), (x0 + 70, H), (x0 + 40, H)], fill=(90, 160, 220, 22))
lay(rays, 3)
px, py = 236, 150
# 光の尾(沈んできた道すじ: 上から少しゆらぎながら)
def trail(od):
    pts = [(px - 26 * math.sin(t * 2.2) * (1 - t), 0 + (py - 6) * t) for t in [i / 30 for i in range(31)]]
    for w, a in [(40, 70), (20, 120), (8, 220)]:
        od.line(pts, fill=(120, 230, 255, a), width=w)
lay(trail, 4)
# まわりの光(芯からひろがる)と、光の輪
def halo(od):
    for r, col, a in [(190, (20, 110, 220), 150), (120, (40, 190, 255), 200), (66, (120, 235, 255), 235), (30, (230, 255, 255), 255)]:
        od.ellipse((px - r, py - r, px + r, py + r), fill=col + (a,))
lay(halo, 18)
def rings(od):
    for r in (40, 70, 104):
        od.ellipse((px - r, py - r * 0.5, px + r, py + r * 0.5), outline=(170, 240, 255, 90), width=2)
# 光の筋(芯から四方へ、短く)
def spikes(od):
    for k in range(16):
        a = k / 16 * math.tau; L = 50 if k % 2 else 90
        od.line((px, py, px + L * math.cos(a), py + L * math.sin(a)), fill=(210, 252, 255, 90), width=2)
lay(spikes, 3)
# 光の粒と泡
d = ImageDraw.Draw(img)
for _ in range(160):
    a = R.uniform(0, math.tau); r = R.uniform(14, 190)
    x = px + r * math.cos(a); y = py + r * 0.8 * math.sin(a)
    c = (220, 252, 255) if r < 90 else (120, 200, 240)
    d.point((x, y), fill=c)
    if R.random() < 0.15: d.ellipse((x - 1, y - 1, x + 1, y + 1), outline=c)
# ペレット(小さな円柱。白く光る芯)
d.rectangle((px - 4, py - 6, px + 4, py + 6), fill=(240, 255, 255), outline=(150, 230, 255))
img.save(O + 'glow4_in.png')
print('ok')
