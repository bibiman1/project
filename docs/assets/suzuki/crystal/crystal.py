# 宇宙船殻用単結晶(作者: 「河川敷の単結晶も、木の葉型。厚みがあるから葉巻型だね。星は品質を表しているので、単結晶には星はいらない。」)
# 上から見ると木の葉(両端がとがる)、横から見ると厚みのある葉巻。南の面は、厚みが 3 段の段になってジャンプで登れる
# 段ごとに「木の葉」を 1 枚ずつ重ねる。各段の葉は、上の面(明るい)と、南に 1 マスの厚み(濃い)を持つ
import math
from PIL import Image, ImageDraw
T = 32
ICE_TOP = [(204, 230, 244), (218, 238, 248), (232, 246, 252)]
ICE_FACE = [(140, 182, 214), (156, 196, 224), (170, 208, 232)]
EDGE = (92, 132, 172); SUN = (250, 204, 158); SUN_FACE = (226, 160, 120)
# 段: (西の先 x, 東の先 x, 北の縁 y, 南の縁 y)。単位はマス。南の縁から 1 マスが厚み
TIERS = [(3.0, 25.0, 1.6, 10.2), (6.5, 21.5, 2.0, 8.2), (9.5, 18.5, 2.3, 6.2)]
P = 2.0   # 葉の形(大きいほど丸く、2 で先がとがる)
BANDS = {1: (7, 8), 2: (5, 6), 3: (3, 4)}   # 段の上で歩ける行

def leaf_pts(x0, x1, yt, yb, n=48):
    xc, a = (x0 + x1) / 2, (x1 - x0) / 2; ym, h = (yt + yb) / 2, (yb - yt) / 2
    top = [(xc + a * u, ym - h * (1 - abs(u) ** P)) for u in [-1 + 2 * i / n for i in range(n + 1)]]
    bot = [(xc + a * u, ym + h * (1 - abs(u) ** P)) for u in [1 - 2 * i / n for i in range(n + 1)]]
    return top + bot

def inside(px, py, x0, x1, yt, yb):
    xc, a = (x0 + x1) / 2, (x1 - x0) / 2; ym, h = (yt + yb) / 2, (yb - yt) / 2
    u = (px - xc) / a
    if abs(u) >= 1: return False
    return abs(py - ym) < h * (1 - abs(u) ** P)

def tier_of(px, py):
    # その点の上にいちばん高い段。厚み(南の縁から 1 マス)の部分は -1
    for k in range(len(TIERS) - 1, -1, -1):
        x0, x1, yt, yb = TIERS[k]
        if inside(px, py, x0, x1, yt, yb):
            return k + 1 if inside(px, py, x0, x1, yt, yb - 1) else -1
    return 0

def draw(img, ox=0, oy=0, s=T, sun=True):
    d = ImageDraw.Draw(img)
    S = lambda pts: [(ox + x * s, oy + y * s) for x, y in pts]
    for k, (x0, x1, yt, yb) in enumerate(TIERS):
        d.polygon(S(leaf_pts(x0, x1, yt, yb)), fill=ICE_FACE[k], outline=EDGE)          # 厚み
        d.polygon(S(leaf_pts(x0, x1, yt, yb - 1)), fill=ICE_TOP[k], outline=EDGE)       # 上の面
        # 長さの向きの切り子の筋(段の上の面に 2 本)
        for f in (0.35, 0.7):
            pts = leaf_pts(x0 + (x1 - x0) * 0.06, x1 - (x1 - x0) * 0.06, yt + (yb - 1 - yt) * f * 0.5, yb - 1 - (yb - 1 - yt) * (1 - f) * 0.5)
            d.line(S(pts[:len(pts) // 2]), fill=(236, 248, 255), width=max(1, s // 16))
    if sun:   # 西の先ほど夕日の橙を映す(結晶の上だけ)
        x0 = TIERS[0][0]
        m = Image.new('L', img.size, 0); md = ImageDraw.Draw(m)
        md.polygon(S(leaf_pts(*TIERS[0])), fill=255)
        tint = Image.new('RGBA', img.size, SUN + (0,)); tp = tint.load(); mp = m.load()
        for X in range(img.width):
            u = ((X - ox) / s - x0) / 6.0
            if 0 <= u < 1:
                a_ = int(170 * (1 - u) ** 1.5)
                for Y in range(img.height):
                    if mp[X, Y]: tp[X, Y] = SUN + (a_,)
        img.alpha_composite(tint)
    return d
