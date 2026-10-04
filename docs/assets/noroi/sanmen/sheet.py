# 三面図のシートを描く(D137)。上面図の下に左側面図、その右に正面図とうしろの図。下の段にゲームの向きの下絵
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from vox import FONT

BG = (22, 40, 78); GRID = (34, 56, 100); INK = (232, 238, 246); Y = (255, 214, 100); G = (140, 230, 170)
Z = 4

def sheet(model, out, title, sub, spec, ki=None, game=('o_w', 'o_e', 'o_s', 'o_n'), rear=True):
    f = ImageFont.truetype(FONT, 22); fs = ImageFont.truetype(FONT, 16)
    views = {k: model.view(k) for k in ('top', 'left', 'front', 'rear', 'right')}
    gv = {k: model.view(k) for k in game}
    xs = np.nonzero(model.m)
    xr = (xs[0].min() + model.x0, xs[0].max() + model.x0 + 1)
    yr = (xs[1].min() + model.y0, xs[1].max() + model.y0 + 1)
    zr = (xs[2].min() + model.z0, xs[2].max() + model.z0 + 1)
    W = 1800
    tl, tp = views['top']; ll, lp = views['left']; fl, fp = views['front']; rl, rp = views['rear']; ril, rip = views['right']
    hT, hL = tl.height * Z, ll.height * Z
    gh = max(im.height for im, _ in gv.values()) * Z
    H = 150 + hT + 70 + hL + 110 + gh + 90 + 40 + 26 * (len(model.notes) + len(spec)) + 40
    im = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(im)
    for x in range(0, W, 20): d.line((x, 0, x, H), fill=GRID)
    for y in range(0, H, 20): d.line((0, y, W, y), fill=GRID)
    d.text((30, 20), title, font=ImageFont.truetype(FONT, 30), fill=INK)
    d.text((30, 62), sub, font=fs, fill=(150, 200, 255))
    d.line((30, 92, W - 30, 92), fill=INK, width=2)
    def put(img, x, y, label):
        big = img.resize((img.width * Z, img.height * Z), Image.NEAREST)
        im.paste(big, (x, y), big)
        d.text((x, y - 30), label, font=f, fill=(150, 200, 255))
        return big.size
    X0 = 60; Yt = 150
    put(tl, X0, Yt, '上面図(前 = 左、マシンの左 = 下)')
    Yl = Yt + hT + 70
    put(ll, X0, Yl, '左側面図(前 = 左)')
    # 投影の線(上面図と側面図で前後の位置がそろうこと)
    for yy in (yr[0], yr[1]):
        xa = X0 + tp((0, yy, 0))[0] * Z
        d.line((xa, Yt + hT, xa, Yl), fill=(90, 120, 170), width=1)
    Xf = X0 + ll.width * Z + 80
    put(fl, Xf, Yl, '正面図')
    Xr = Xf + fl.width * Z + 60
    if rear: put(rl, Xr, Yl, 'うしろ')
    Xri = Xr + (rl.width * Z + 60 if rear else 0)
    if Xri + ril.width * Z < W - 20: put(ril, Xri, Yl, '右側面図(前 = 右)')
    # 寸法(ドット)
    ya = Yl + hL + 24
    xa0 = X0 + lp((0, yr[1], 0))[0] * Z; xa1 = X0 + lp((0, yr[0], 0))[0] * Z
    d.line((xa0, ya, xa1, ya), fill=Y, width=2); d.text(((xa0 + xa1) / 2 - 40, ya + 6), f'全長 {yr[1]-yr[0]}', font=fs, fill=Y)
    xb0 = Xf + fp((xr[0], 0, 0))[0] * Z; xb1 = Xf + fp((xr[1], 0, 0))[0] * Z
    d.line((xb0, ya, xb1, ya), fill=Y, width=2); d.text(((xb0 + xb1) / 2 - 30, ya + 6), f'幅 {xr[1]-xr[0]}', font=fs, fill=Y)
    xh = X0 - 24; yh0 = Yl + lp((0, 0, zr[1]))[1] * Z; yh1 = Yl + lp((0, 0, zr[0]))[1] * Z
    d.line((xh, yh0, xh, yh1), fill=Y, width=2); d.text((xh - 20, yh1 + 6), f'高さ {zr[1]-zr[0]}', font=fs, fill=Y)
    d.line((X0 - 10, yh1, Xf + fl.width * Z + 10, yh1), fill=(120, 160, 120), width=1)  # 地面
    # 部品の番号(左側面図と正面図と上面図に)
    for n, text, p in model.notes:
        for (ox, oy, pr) in ((X0, Yl, lp), (Xf, Yl, fp), (X0, Yt, tp)):
            px, py = pr(p); px = ox + px * Z; py = oy + py * Z
            d.ellipse((px - 11, py - 11, px + 11, py + 11), fill=(255, 214, 100), outline=BG)
            d.text((px - (5 if n < 10 else 10), py - 9), str(n), font=fs, fill=BG)
    # ゲームの向き
    yg = Yl + hL + 110
    d.text((30, yg - 40), 'ゲームの向きの下絵(斜め上から。同じ立体から投影)', font=f, fill=G)
    x = X0
    lab = {'o_w': '西へ', 'o_e': '東へ', 'o_s': 'こちらへ', 'o_n': '向こうへ', 'rear': 'うしろ(競争)'}
    for k, (g, _) in gv.items():
        put(g, x, yg + 10, lab.get(k, k)); x += g.width * Z + 40
    if ki is not None:
        kb = ki.resize((ki.width * Z, ki.height * Z), Image.NEAREST)
        im.paste(kb, (x, yg + 10 + gh - kb.height), kb); d.text((x, yg - 20), 'きー(大きさの見本)', font=fs, fill=(150, 200, 255))
    yy = yg + gh + 50
    for n, text, p in model.notes:
        d.text((40, yy), f'{n}  {text}', font=fs, fill=INK); yy += 26
    yy += 10
    for line in spec:
        d.text((40, yy), line, font=fs, fill=Y); yy += 26
    im.save(out)
    return im
