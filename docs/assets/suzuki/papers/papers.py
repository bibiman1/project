# 伝票・荷札・納品書の一枚絵(作者: 「伝票と荷札はスタンプ台紙やポスターのように画像にしてほしい」→ 文面はおすすめ通り)
# 1) 紙だけの下絵(base_*.png)を描く → 2) PixelLab で紙の質感をつける(tex_*.png) → 3) 罫線・字・マーク・判を上から描く(field の v_*.png)
import sys
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, '/home/user/project/docs/assets/suzuki/sign')
from sign_v2 import text_mask, text_row, mark, paste_mask
D = '/home/user/project/docs/assets/suzuki/papers/'
A = '/home/user/project/field/assets/worlds/suzuki/'
W, H = 320, 240
BG = (38, 32, 30, 255); PAPER = (236, 230, 212, 255); INK = (34, 30, 30, 255); RED = (196, 52, 40, 255); RULE = (150, 140, 120, 255)

def base(kind):
    im = Image.new('RGBA', (W, H), BG); d = ImageDraw.Draw(im)
    if kind == 'nifuda':   # 荷札: 上の角を落とした札、穴と紐
        x0, y0, x1, y1 = 60, 10, 260, 232
        d.polygon([(x0 + 22, y0), (x1 - 22, y0), (x1, y0 + 22), (x1, y1), (x0, y1), (x0, y0 + 22)], fill=PAPER)
        d.ellipse((W // 2 - 7, y0 + 8, W // 2 + 7, y0 + 22), fill=(200, 190, 160, 255))
        d.ellipse((W // 2 - 4, y0 + 11, W // 2 + 4, y0 + 19), fill=BG)
        d.line((W // 2, 0, W // 2, y0 + 15), fill=(176, 140, 90, 255), width=3)
    else:
        d.rectangle((10, 6, W - 10, H - 6), fill=PAPER)
    return im

def ink(im, t, x, y, col=INK, scale=1, row=False):
    m = text_row(t) if row else text_mask(t, scale)
    paste_mask(im, m, x, y, col); return m.width

def stamp(im, cx, cy, r=18):
    d = ImageDraw.Draw(im)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=RED, width=2)
    m = text_mask('鈴木'); paste_mask(im, m, cx - m.width // 2, cy - m.height // 2, RED)

def rows(im, items, x0, y0, step=20, vx=84):
    d = ImageDraw.Draw(im)
    for i, (k, v) in enumerate(items):
        y = y0 + i * step
        ink(im, k, x0, y)
        if v is None: d.line((vx, y + 15, vx + 150, y + 15), fill=INK, width=1)
        else: ink(im, v, vx, y, row=True)
        d.line((x0, y + 18, W - 22, y + 18), fill=RULE)

def denpyo(im, bet=True):
    d = ImageDraw.Draw(im)
    ink(im, '出荷伝票', 20, 12)
    nw = text_mask('No.').width; dw = text_row('〇〇〇壱').width
    ink(im, 'No.', W - 20 - dw - nw - 4, 12); ink(im, '〇〇〇壱', W - 20 - dw, 12, row=True)
    im.alpha_composite(mark(INK), (20, 34)); ink(im, '鈴木商店', 66, 36)
    ink(im, '宇宙船殻用単結晶　製造・販売・卸', 20, 56, row=True)
    ink(im, '東京・群馬・水星・北京', 20, 74, row=True)
    d.line((18, 94, W - 18, 94), fill=INK, width=2)
    rows(im, [('品名', '宇宙船殻用単結晶'), ('数量', '壱本'), ('寸法', '船体　一隻分'), ('荷姿', 'はだか（荷札をつけること）'), ('便', '上り'), ('届け先', None)], 20, 100)
    stamp(im, W - 46, H - 30)

def nifuda(im):
    d = ImageDraw.Draw(im)
    im.alpha_composite(mark(INK), (W // 2 - 20, 36))
    ink(im, '荷　札', W // 2 - text_mask('荷　札', 2).width // 2, 60, scale=2)
    x0 = 76
    for i, (k, v) in enumerate([('品名', '宇宙船殻用単結晶'), ('発', '荒川区　鈴木商店'), ('着', None)]):
        y = 104 + i * 26
        ink(im, k, x0, y)
        if v is None: d.line((x0 + 44, y + 15, x0 + 168, y + 15), fill=INK)
        else: ink(im, v, x0 + 40, y, row=True)
    d.rectangle((x0 + 4, 186, W - x0 - 4, 212), outline=RED, width=2)
    t = '取扱注意　天地無用'; m = text_row(t); paste_mask(im, m, W // 2 - m.width // 2, 191, RED)

def nouhin(im):
    d = ImageDraw.Draw(im)
    ink(im, '納　品　書', W // 2 - text_mask('納　品　書', 2).width // 2, 14, scale=2)
    d.line((18, 52, W - 18, 52), fill=INK, width=2)
    ink(im, '品名', 20, 62); ink(im, '宇宙船殻用単結晶　壱本', 84, 62, row=True)
    d.line((20, 80, W - 22, 80), fill=RULE)
    ink(im, '右のとおり納品いたしました', 20, 92, row=True)
    ink(im, '宛先', 20, 126)
    # 宛先: 字がにじんで読めない(書いてから、にじませる)
    sm = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    paste_mask(sm, text_row('靉靆鬮鬯　瓱竃畺　鷽鸞'), 84, 126, (60, 50, 70, 255))
    sm = sm.filter(ImageFilter.GaussianBlur(2.2)); im.alpha_composite(sm)
    d.line((84, 145, W - 22, 145), fill=RULE)
    im.alpha_composite(mark(INK), (20, 178)); ink(im, '鈴木商店', 66, 180)
    ink(im, '東京・群馬・水星・北京', 20, 202, row=True)
    stamp(im, W - 46, H - 34)

if __name__ == '__main__':
    step = sys.argv[1] if len(sys.argv) > 1 else 'base'
    for kind, fn in [('denpyo', denpyo), ('nifuda', nifuda), ('nouhin', nouhin)]:
        if step == 'base':
            base(kind).save(D + f'base_{kind}.png')
        else:
            try: im = Image.open(D + f'tex_{kind}.png').convert('RGBA').resize((W, H), Image.NEAREST)
            except FileNotFoundError: im = base(kind)
            fn(im); im.save(A + f'v_{kind}.png')
    print('ok', step)
