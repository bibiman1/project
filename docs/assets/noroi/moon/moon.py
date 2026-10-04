# 呪いの野犬の月を、アンバリッド・ホテルの望遠鏡の月(欠けて輪がある)にそろえる(D90「違う断片でも同じ月」)
# 競争の背景(PixelLab の昼の三日月)を、まわりの空で塗りつぶしてから、望遠鏡の月を縮めて貼る。昼の空なので少しだけ透かす
from PIL import Image
import numpy as np
A = '/home/user/project/field/assets/worlds/noroi/'
D = '/home/user/project/docs/assets/noroi/moon/'
MOON = Image.open('/home/user/project/docs/assets/takarabune/scenes/moon_from_vmoon.png').convert('RGBA')
def small(scale, alpha=1.0):
    w, h = round(MOON.width * scale), round(MOON.height * scale)
    m = MOON.resize((w, h), Image.BOX)
    a = np.asarray(m).astype(float); a[..., 3] = np.where(a[..., 3] > 40, 255 * alpha, 0)
    return Image.fromarray(a.astype('uint8'))
p = Image.open(A + 'rc_plate.png').convert('RGBA')
p.save(D + 'rc_plate_before.png')
x0, y0, x1, y1 = 358, 6, 404, 52
p.paste(p.crop((x0 + 40, y0, x1 + 40, y1)), (x0, y0))
m = small(0.3, 0.92); p.alpha_composite(m, (381 - m.width // 2, 29 - m.height // 2))
p.save(A + 'rc_plate.png')
print(m.size)
