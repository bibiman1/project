# 鈴木商店の看板 第 2 案(作者: 「白地に黒 / 宇宙船はアーモンド型 / 星は下に五つ、湾曲に沿って配置 / 看板は錆びている」)
from PIL import Image, ImageDraw, ImageFont
import math, random
FONT = '/tmp/claude-0/-home-user-project/e7cb1a9b-b078-5ece-9cdf-0647f5a9d6fa/scratchpad/DG.ttf'
fnt = ImageFont.truetype(FONT, 16)
OUT = '/home/user/project/docs/assets/suzuki/sign/'
BG = '/home/user/project/field/assets/worlds/suzuki/bg_alley.png'
GROUND = (232, 228, 214, 255); INK = (28, 26, 28, 255)
RUST = [(150, 74, 40), (176, 96, 52), (120, 58, 36), (196, 128, 72)]

def text_mask(t, scale=1):
    m = Image.new('L', (len(t) * 16 + 4, 20), 0)
    ImageDraw.Draw(m).text((0, -3), t, fill=255, font=fnt)
    m = m.point(lambda v: 255 if v > 110 else 0); m = m.crop(m.getbbox())
    return m.resize((m.width * scale, m.height * scale), Image.NEAREST) if scale > 1 else m

def mark(col, a=21, b=6):
    # アーモンド型の宇宙船(二つの円の重なり)と、その下の湾曲に沿った五つ星
    R = (a * a + b * b) / (2 * b); dd = R - b
    W, H = 2 * a + 6, 2 * b + 14
    m = Image.new('RGBA', (W, H), (0, 0, 0, 0)); px = m.load()
    cx, cy = W / 2 - 0.5, b + 0.5
    for y in range(H):
        for x in range(W):
            if math.hypot(x - cx, y - (cy + dd)) < R and math.hypot(x - cx, y - (cy - dd)) < R: px[x, y] = col
    STAR = ["..#..", ".###.", "#####", ".###.", ".#.#."]
    for k in range(5):
        dx = (k - 2) * 8                                   # 8 ドットおき
        ycurve = (cy - dd) + math.sqrt(max(0, R * R - dx * dx))  # 船の下の弧
        sx, sy = int(round(cx + dx)) - 2, int(round(ycurve + 3))
        for yy, row in enumerate(STAR):
            for xx, ch in enumerate(row):
                if ch == '#' and 0 <= sx + xx < W and 0 <= sy + yy < H: px[sx + xx, sy + yy] = col
    bb = m.getbbox(); global SHIP_CY; SHIP_CY = cy - bb[1]
    return m.crop(bb)

SHIP_CY = 6
def paste_mask(im, m, x, y, col):
    im.paste(Image.new('RGBA', m.size, col), (x, y), m)

def rust(im, seed=5, amount=1.0):
    # 錆: 縁と四隅のボルトから広がるしみ、上の縁から垂れる筋、ところどころ地の欠け
    R_ = random.Random(seed); W, H = im.size; px = im.load(); d = ImageDraw.Draw(im)
    def dot(x, y, c):
        if 0 <= x < W and 0 <= y < H: px[x, y] = c + (255,)
    for (bx, by) in [(5, 5), (W - 6, 5), (5, H - 6), (W - 6, H - 6), (W // 2, 4)]:
        for _ in range(int(60 * amount)):
            r = abs(R_.gauss(0, 4)); t = R_.random() * 6.28
            dot(int(bx + r * math.cos(t)), int(by + r * math.sin(t)), R_.choice(RUST))
        d.rectangle((bx - 1, by - 1, bx + 1, by + 1), fill=(90, 80, 74, 255))
    for _ in range(int(22 * amount)):   # 垂れる筋
        x = R_.randrange(4, W - 4); y = R_.choice([3, 4, R_.randrange(4, H // 2)]); L = R_.randrange(4, 18)
        c = R_.choice(RUST)
        for k in range(L):
            if R_.random() < 0.85: dot(x, y + k, c)
            if R_.random() < 0.15: x += R_.choice([-1, 1])
    for _ in range(int(14 * amount)):   # しみ
        x, y = R_.randrange(0, W), R_.randrange(0, H); s = R_.randrange(2, 6)
        for _ in range(s * s * 2):
            dot(x + int(R_.gauss(0, s / 2)), y + int(R_.gauss(0, s / 3)), R_.choice(RUST[1:] + [(214, 196, 170)]))
    # 枠は錆びた鉄
    for x in range(W):
        for y in (0, 1, H - 2, H - 1):
            dot(x, y, R_.choice(RUST[:3]) if R_.random() < 0.6 else (92, 80, 72))
    for y in range(H):
        for x in (0, 1, W - 2, W - 1):
            dot(x, y, R_.choice(RUST[:3]) if R_.random() < 0.6 else (92, 80, 72))

def board(rusty=True, seed=5):
    W, H = 312, 80
    im = Image.new('RGBA', (W, H), GROUND)
    l1 = text_mask('宇宙船殻用単結晶　製造・販売・卸'); l3 = text_mask('東京・群馬・水星・北京')
    if rusty:
        px = im.load(); R_ = random.Random(seed + 7)
        for y in range(H):
            for x in range(W):
                k = (y / H) ** 2 * 0.55 + R_.random() * 0.08          # 下ほど黄ばみ、茶色くなる
                r, g, b_, _ = px[x, y]
                px[x, y] = (int(r - 30 * k), int(g - 62 * k), int(b_ - 96 * k), 255)
        rust(im, seed, 3.0)
        dd_ = ImageDraw.Draw(im)
        for _ in range(26):                                       # 下の縁のしみ
            x0 = R_.randrange(0, W); w0 = R_.randrange(6, 26); h0 = R_.randrange(3, 9)
            for _ in range(w0 * h0):
                X = x0 + int(R_.gauss(0, w0 / 3)); Y = H - 3 - int(abs(R_.gauss(0, h0)))
                if 0 <= X < W and 0 <= Y < H: px[X, Y] = R_.choice(RUST) + (255,)
    paste_mask(im, l1, (W - l1.width) // 2, 6, INK)
    a, b = text_mask('鈴木', 2), text_mask('商店', 2); mk = mark(INK)
    gap = 14; tot = a.width + gap + mk.width + gap + b.width; x = (W - tot) // 2
    ty = 25; tc = ty + a.height / 2                       # 字の上下のまんなか
    my = int(round(tc - SHIP_CY))                          # 船体の中心をそこへ(星は下に垂れる)
    paste_mask(im, a, x, ty, INK); im.alpha_composite(mk, (x + a.width + gap, my)); paste_mask(im, b, x + a.width + gap + mk.width + gap, ty, INK)
    paste_mask(im, l3, (W - l3.width) // 2, 60, INK)
    if rusty:   # 字の上にも少しだけ錆が回る
        R_ = random.Random(seed + 1); px = im.load()
        for _ in range(110):
            x, y = R_.randrange(W), R_.randrange(H)
            if px[x, y][:3] == INK[:3]: px[x, y] = R_.choice(RUST) + (255,)
    return im

if __name__ == '__main__':
    bg = Image.open(BG).convert('RGBA')
    F2 = ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf', 18)
    sk = Image.open('/home/user/project/docs/record/2026-10-02-suzuki/author_sign_sketch.jpg').convert('RGB')
    sheet = Image.new('RGB', (1260, 780), (245, 240, 228)); sd = ImageDraw.Draw(sheet)
    sd.text((20, 10), '鈴木商店の看板 第 3 案(宇宙船を字の上下のまんなかに、錆を強く)', fill=(60, 50, 40), font=F2)
    sd.text((20, 44), '作者の下絵', fill=(180, 50, 35), font=F2); sheet.paste(sk.resize((sk.width * 180 // sk.height, 180)), (20, 72))
    mk = mark(INK); big = Image.new('RGBA', mk.size, GROUND); big.alpha_composite(mk)
    sd.text((700, 44), f'マーク {mk.width}×{mk.height} ドットを 8 倍', fill=(180, 50, 35), font=F2)
    sheet.paste(big.resize((mk.width * 8, mk.height * 8), Image.NEAREST).convert('RGB'), (700, 74))
    bd = board()
    sd.text((20, 300), '看板だけを 2 倍', fill=(180, 50, 35), font=F2)
    sheet.paste(bd.resize((bd.width * 2, bd.height * 2), Image.NEAREST).convert('RGB'), (20, 330))
    m = bg.copy(); cx = 607; m.alpha_composite(bd, (cx - bd.width // 2, 126 - bd.height))
    sd.text((680, 300), 'ゲームの路地にのせて(画面と同じ 2 倍)', fill=(180, 50, 35), font=F2)
    sheet.paste(m.crop((cx - 140, 20, cx + 140, 230)).resize((560, 420), Image.NEAREST).convert('RGB'), (680, 330))
    bd.save(OUT + 'sign_v3.png'); sheet.save(OUT + 'sign_mock_v3.png'); print('ok', mk.size)
