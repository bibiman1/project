# ダイナーの中の仕上げ: 原寸の仕上げに、サボテンとジャンパーの直しを戻す
from PIL import Image, ImageFilter
V = '/home/user/project/docs/assets/noroi/v1/'
im = Image.open(V + 'full_diner.png').convert('RGBA')
for name, (x, y) in (('cactus', (288, 192)), ('jacket', (140, 312))):
    p = Image.open(V + f'fix_{name}_out.png').convert('RGBA').resize((64, 64), Image.NEAREST)
    m = Image.new('L', (64, 64), 0); m.paste(255, (6, 6, 58, 58)); m = m.filter(ImageFilter.GaussianBlur(4))
    im.paste(p, (x, y), m)
im.save('/home/user/project/field/assets/worlds/noroi/bg_diner.png')
print('ok')
