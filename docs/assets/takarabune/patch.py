# 原寸の仕上げで出た余計なもの(船尾の二つ目の竜頭、二つ目の月の映りこみ、増えた灯り、増えた机など)を、
# 半分の大きさの仕上げ(2 倍)で、ぼかした四角の範囲だけ置きかえる
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
V = '/home/user/project/docs/assets/takarabune/v1/'
PATCH = {
    'port': [(250, 300, 345, 448), (340, 60, 520, 240), (690, 150, 840, 430), (590, 180, 770, 240)],
    'gate': [(120, 60, 200, 175)],
    'admin': [(0, 215, 300, 384), (590, 190, 768, 384)],
    'turbine': [(90, 90, 640, 300)],
}
for n, boxes in PATCH.items():
    full = Image.open(V + f'full_{n}.png').convert('RGBA')
    half = Image.open(V + f'half_{n}_s3.png').convert('RGBA').resize(full.size, Image.NEAREST)
    m = Image.new('L', full.size, 0); d = ImageDraw.Draw(m)
    for b in boxes: d.rectangle(b, fill=255)
    m = m.filter(ImageFilter.GaussianBlur(8 if n != 'admin' else 26))
    out = Image.composite(half, full, m)
    out.save(V + f'fix_{n}.png')
print('ok')
