# 鈴木商店の月を、アンバリッド・ホテルの望遠鏡の絵の月(欠けて輪がある)にそろえる(D90)
# 古い月(丸い月に輪)を、まわりの夜空で塗りつぶしてから、望遠鏡の月を縮めて貼る
from PIL import Image
import numpy as np
A = '/home/user/project/field/assets/worlds/suzuki/'
D = '/home/user/project/docs/assets/suzuki/moon/'
MOON = Image.open('/home/user/project/docs/assets/takarabune/scenes/moon_from_vmoon.png').convert('RGBA')
def small(scale):
    w, h = round(MOON.width * scale), round(MOON.height * scale)
    m = MOON.resize((w, h), Image.BOX)
    a = np.asarray(m).astype(int); a[..., 3] = np.where(a[..., 3] > 110, 255, 0)
    return Image.fromarray(a.astype('uint8'))
def cover(im, box, src_dx):
    # box の夜空を、src_dx だけ横にずらした夜空(星のある空)で置きかえる
    x0, y0, x1, y1 = box
    patch = im.crop((x0 + src_dx, y0, x1 + src_dx, y1))
    im.paste(patch, (x0, y0))
# 衛星軌道(宇宙の遊泳の場面も、この絵の右上を使う)
o = Image.open(A + 'bg_orbit.png').convert('RGBA')
o.save(D + 'bg_orbit_before.png')
cover(o, (690, 0, 845, 76), -170)
m = small(0.52); o.alpha_composite(m, (716, -4))
o.save(A + 'bg_orbit.png')
# 流れ星の絵
v = Image.open(A + 'v_fall.png').convert('RGBA')
v.save(D + 'v_fall_before.png')
cover(v, (244, 16, 298, 48), -60)
m2 = small(0.26); v.alpha_composite(m2, (271 - m2.width // 2, 32 - m2.height // 2))
v.save(A + 'v_fall.png')
print(m.size, m2.size)
