# 仕上げ: 原寸の仕上げで描き足された物(峠の 2 つ目のトンネル、駐車場の矢印の看板)を、半分の大きさの仕上げ(2 倍)で置きかえて、ゲームの素材に置く
from PIL import Image, ImageFilter
V = '/home/user/project/docs/assets/noroi/v1/'
OUT = '/home/user/project/field/assets/worlds/noroi/'
def patch(n, box, seed=3):
    f = Image.open(V + f'full_{n}.png').convert('RGBA'); h = Image.open(V + f'half_{n}_s{seed}.png').convert('RGBA')
    h2 = h.resize((h.width * 2, h.height * 2), Image.NEAREST)
    m = Image.new('L', f.size, 0); m.paste(255, box); m = m.filter(ImageFilter.GaussianBlur(6))
    return Image.composite(h2, f, m)
def patch2(f, n, box, seed=3):
    h = Image.open(V + f'half_{n}_s{seed}.png').convert('RGBA'); h2 = h.resize((h.width * 2, h.height * 2), Image.NEAREST)
    m = Image.new('L', f.size, 0); m.paste(255, box); m = m.filter(ImageFilter.GaussianBlur(6))
    return Image.composite(h2, f, m)
im = patch('pass', (380, 0, 560, 92)); im = patch2(im, 'pass', (395, 222, 540, 384)); im.save(OUT + 'bg_pass.png')  # 窓のつなぎ目の、木の二重写し
im = patch('drivein', (6, 270, 180, 440)); im.save(OUT + 'bg_drivein.png')
print('ok')
# 直線: 原寸の仕上げは右の窓に 2 本目の白線が描き足されるので、左(x < 400)だけ使い、右は半分の大きさの仕上げ(2 倍)
f = Image.open(V + 'full_strip.png').convert('RGBA'); h = Image.open(V + 'half_strip_s7.png').convert('RGBA')
h2 = h.resize((h.width * 2, h.height * 2), Image.NEAREST)
m = Image.new('L', f.size, 0); m.paste(255, (410, 0, f.width, f.height)); m = m.filter(ImageFilter.GaussianBlur(14))
Image.composite(h2, f, m).save(OUT + 'bg_strip.png')
print('strip ok')
