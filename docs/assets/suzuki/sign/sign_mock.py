# 鈴木商店の看板 デザイン案(作者の下絵 docs/record/2026-10-02-suzuki/author_sign_sketch.jpg から)
from PIL import Image, ImageDraw, ImageFont
import subprocess
FONT = '/tmp/claude-0/-home-user-project/e7cb1a9b-b078-5ece-9cdf-0647f5a9d6fa/scratchpad/DG.ttf'
fnt = ImageFont.truetype(FONT, 16)
OUT = '/home/user/project/docs/assets/suzuki/sign/'
BG = '/home/user/project/field/assets/worlds/suzuki/bg_alley.png'

def text_mask(t, scale=1):
    m = Image.new('L', (len(t) * 16 + 4, 20), 0)
    ImageDraw.Draw(m).text((0, -3), t, fill=255, font=fnt)
    m = m.point(lambda v: 255 if v > 110 else 0)
    m = m.crop(m.getbbox() if m.getbbox() else (0, 0, 1, 1))
    if scale > 1: m = m.resize((m.width * scale, m.height * scale), Image.NEAREST)
    return m

# 宇宙船(下絵の黒い丸い船体。右に船首、下に脚)。1 文字 = 1 ドット
SHIP = [
    "..........##########............",
    ".......################.........",
    ".....####################.......",
    "....######################..##..",
    "...########################.###.",
    "..##########################.###",
    ".###############################",
    "################################",
    ".##############################.",
    "...###...............######.....",
    "...##.................###.......",
]
STAR = ["..#..", ".###.", "#####", ".#.#.", "#...#"]

def mark(col):
    w, h = 36, 22
    m = Image.new('RGBA', (w, h), (0, 0, 0, 0)); px = m.load()
    for y, row in enumerate(SHIP):
        for x, ch in enumerate(row):
            if ch == '#': px[x + 2, y + 10] = col
    # 五つ星: 船の上に弧
    for i, (sx, sy) in enumerate([(1, 6), (8, 2), (15, 0), (22, 2), (29, 6)]):
        for y, row in enumerate(STAR):
            for x, ch in enumerate(row):
                if ch == '#' and 0 <= sx + x < w and 0 <= sy + y < h: px[sx + x, sy + y] = col
    return m

def paste_mask(im, m, x, y, col):
    im.paste(Image.new('RGBA', m.size, col), (x, y), m)

def board(kind, colors):
    ground, ink, frame = colors
    if kind == 'A':   # 下絵どおり: 2 行目の「鈴木」「商店」を 2 倍
        W, H = 312, 80
    else:             # 小さめ: 3 行とも同じ大きさ
        W, H = 296, 60
    im = Image.new('RGBA', (W, H), ground); d = ImageDraw.Draw(im)
    d.rectangle((0, 0, W - 1, H - 1), outline=frame, width=3)
    l1 = text_mask('宇宙船殻用単結晶　製造・販売・卸')
    l3 = text_mask('東京・群馬・水星・北京')
    if kind == 'A':
        paste_mask(im, l1, (W - l1.width) // 2, 6, ink)
        a, b = text_mask('鈴木', 2), text_mask('商店', 2)
        mk = mark(ink)
        gap = 18; tot = a.width + gap + mk.width + gap + b.width; x = (W - tot) // 2
        paste_mask(im, a, x, 25, ink); im.alpha_composite(mk, (x + a.width + gap, 26)); paste_mask(im, b, x + a.width + gap + mk.width + gap, 25, ink)
        paste_mask(im, l3, (W - l3.width) // 2, 60, ink)
    else:
        paste_mask(im, l1, (W - l1.width) // 2, 5, ink)
        a, b = text_mask('鈴木'), text_mask('商店')
        mk = mark(ink).resize((27, 16), Image.NEAREST)
        gap = 10; tot = a.width + gap + mk.width + gap + b.width; x = (W - tot) // 2
        paste_mask(im, a, x, 23, ink); im.alpha_composite(mk, (x + a.width + gap, 21)); paste_mask(im, b, x + a.width + gap + mk.width + gap, 23, ink)
        paste_mask(im, l3, (W - l3.width) // 2, 41, ink)
    return im

NAVY = ((26, 36, 78, 255), (240, 206, 110, 255), (220, 186, 84, 255))
WHITE = ((236, 232, 220, 255), (34, 30, 30, 255), (110, 90, 70, 255))
opts = [('A', NAVY, 'A 紺地に金・下絵どおり(2 行目を 2 倍)'), ('A', WHITE, 'A\' 白地に墨・下絵どおり'), ('B', NAVY, 'B 紺地に金・小さめ(3 行同じ大きさ)')]
bg = Image.open(BG).convert('RGBA')
F2 = ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf', 18)
sk = Image.open('/home/user/project/docs/record/2026-10-02-suzuki/author_sign_sketch.jpg').convert('RGB')
sheet = Image.new('RGB', (1260, 3 * 440 + 300), (245, 240, 228)); sd = ImageDraw.Draw(sheet)
sd.text((20, 10), '鈴木商店の看板 デザイン案(左: 看板だけを 1.5 倍 / 右: ゲームの路地にのせて、画面と同じ 2 倍)', fill=(60, 50, 40), font=F2)
sd.text((20, 44), '作者の下絵', fill=(180, 50, 35), font=F2)
sheet.paste(sk.resize((sk.width * 200 // sk.height, 200)), (20, 72))
mk = mark((30, 30, 30, 255)); big = Image.new('RGBA', mk.size, (236, 232, 220, 255)); big.alpha_composite(mk)
sd.text((800, 44), 'マーク(宇宙船と五つ星)36×22 ドット を 6 倍', fill=(180, 50, 35), font=F2)
sheet.paste(big.resize((mk.width * 6, mk.height * 6), Image.NEAREST).convert('RGB'), (800, 80))
for i, (kind, cols, label) in enumerate(opts):
    bd = board(kind, cols); y0 = 300 + i * 440
    sd.text((20, y0), label, fill=(180, 50, 35), font=F2)
    sheet.paste(bd.resize((bd.width * 3 // 2, bd.height * 3 // 2), Image.NEAREST).convert('RGB'), (20, y0 + 34))
    m = bg.copy(); cx = 607
    m.alpha_composite(bd, (cx - bd.width // 2, 126 - bd.height))
    sheet.paste(m.crop((cx - 180, 20, cx + 180, 220)).resize((720, 400), Image.NEAREST).convert('RGB'), (520, y0 + 30))
    bd.save(OUT + f'sign_{i}.png')
sheet.save(OUT + 'sign_mock.png')
print('ok')
