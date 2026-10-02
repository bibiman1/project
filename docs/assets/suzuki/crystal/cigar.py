# 宇宙船殻用単結晶 第 2 案(作者: 「両端が狭まった円柱」)
# 東西に寝かせた円柱で、両端が先細りにとがる。斜め上から見下ろすので、上の面(明るい)と南の側面(濃い)が見える
import math
from PIL import Image, ImageDraw
T = 32
L0, L1 = 3.0, 25.0        # 西の先、東の先(マス)
TAPER = 6.0               # 先細りの長さ(マス)
YC, R = 5.5, 2.6          # 軸の高さ(画面の y)、半径(マス)

def radius(x):
    # 胴は一定、両端の TAPER で先がとがる(弾頭のような丸みのある先細り)
    if x <= L0 or x >= L1: return 0.0
    k = min(x - L0, L1 - x) / TAPER
    return R * (1 if k >= 1 else 1 - (1 - k) ** 2)     # 先がとがる弾頭形

def draw(img, ox=0, oy=0, s=T):
    px = img.load(); W, H = img.size
    TOP = (226, 242, 250); MID = (188, 220, 240); LOW = (136, 178, 214); DARK = (104, 146, 188)
    for X in range(W):
        x = (X - ox) / s; r = radius(x)
        if r <= 0: continue
        y0, y1 = YC - r, YC + r
        for Y in range(max(0, int(oy + y0 * s)), min(H, int(oy + y1 * s) + 1)):
            v = ((Y - oy) / s - YC) / r            # -1 上 … +1 下
            if v < -1 or v > 1: continue
            if v < -0.55: c = TOP
            elif v < -0.15: c = MID if v > -0.35 else (210, 232, 246)
            elif v < 0.55: c = LOW if v > 0.2 else MID
            else: c = DARK
            # 上のほうに長い光の筋
            if -0.78 < v < -0.7: c = (246, 252, 255)
            # 西の先ほど夕日
            t = max(0.0, 1 - (x - L0) / 6.0)
            c = tuple(int(c[i] * (1 - 0.55 * t) + (250, 196, 150)[i] * 0.55 * t) for i in range(3))
            px[X, Y] = c + (255,)
    # 輪郭
    d = ImageDraw.Draw(img)
    pts_t = [(ox + x / 4 * s, oy + (YC - radius(x / 4)) * s) for x in range(int(L0 * 4), int(L1 * 4) + 1)]
    pts_b = [(ox + x / 4 * s, oy + (YC + radius(x / 4)) * s) for x in range(int(L1 * 4), int(L0 * 4) - 1, -1)]
    d.line(pts_t + pts_b + pts_t[:1], fill=(92, 132, 172), width=max(1, s // 16))
    return d

if __name__ == '__main__':
    from PIL import ImageFont
    F = ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf', 18)
    im = Image.new('RGBA', (28 * T, 12 * T), (104, 132, 74, 255))
    dd = ImageDraw.Draw(im)
    dd.polygon([(x / 4 * T + 26, (YC + radius(x / 4) * 0.5 + 2.4) * T) for x in range(int(L0 * 4), int(L1 * 4))] + [(L1 * T + 26, (YC + 2.4) * T), (L0 * T + 26, (YC + 2.4) * T)], fill=(70, 80, 60, 255))
    draw(im)
    sheet = Image.new('RGB', (28 * T + 40, 12 * T + 300), (245, 240, 228)); sd = ImageDraw.Draw(sheet)
    sd.text((20, 10), '単結晶 第 2 案: 両端が狭まった円柱(河川敷に東西に寝かせる。マップと同じ斜め上から)', fill=(60, 50, 40), font=F)
    sheet.paste(im.convert('RGB'), (20, 44))
    # 横から見た図と、断面
    side = Image.new('RGBA', (28 * T + 0, 220), (245, 240, 228, 255)); sdd = ImageDraw.Draw(side)
    sdd.text((0, 0), '横(南)から見た形と、断面(円)', fill=(180, 50, 35), font=F)
    pts = [(x / 4 * T - 60, 120 - radius(x / 4) * 30) for x in range(int(L0 * 4), int(L1 * 4) + 1)] + [(x / 4 * T - 60, 120 + radius(x / 4) * 30) for x in range(int(L1 * 4), int(L0 * 4) - 1, -1)]
    sdd.polygon(pts, fill=(200, 228, 244), outline=(92, 132, 172))
    sdd.ellipse((28 * T - 100, 120 - 48, 28 * T - 4, 120 + 48), fill=(200, 228, 244), outline=(92, 132, 172))
    sheet.paste(side.convert('RGB'), (20, 12 * T + 64))
    sheet.save('/home/user/project/docs/record/2026-10-02-suzuki/crystal_cigar_mock.png'); print('ok')
