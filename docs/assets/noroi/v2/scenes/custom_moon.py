# 炎を塗る一枚絵(D132 → D136 で作り直し)。PixelLab の候補 v_custom_101 の空の三日月を、望遠鏡の月(D90)に差し替える
from PIL import Image
import numpy as np
D = '/home/user/project/docs/assets/noroi/v2/scenes/'
MOON = Image.open('/home/user/project/docs/assets/takarabune/scenes/moon_from_vmoon.png').convert('RGBA')
v = Image.open(D + 'out/v_custom_101_00.png').convert('RGBA')
x0, y0, x1, y1 = 360, 10, 402, 50
v.paste(v.crop((x0 - 60, y0, x1 - 60, y1)), (x0, y0))
w, h = round(MOON.width * 0.26), round(MOON.height * 0.26)
m = MOON.resize((w, h), Image.BOX); a = np.asarray(m).astype(float); a[..., 3] = np.where(a[..., 3] > 40, 255 * 0.92, 0)
m = Image.fromarray(a.astype('uint8')); v.alpha_composite(m, (381 - w // 2, 30 - h // 2))
v.convert('RGB').save(D + 'v_custom_final.png'); print(m.size)
