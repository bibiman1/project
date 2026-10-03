# 仕上げその 2(D88): 鋳造工房と機関室。炉と火室は、ペレットを入れるまで冷えている(PixelLab が赤く燃やしたので、その範囲の暖色を、冷えた鉄と灰の色に置きかえる)
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
V = '/home/user/project/docs/assets/takarabune/v1/'
OUT = '/home/user/project/field/assets/worlds/takarabune/'
def cool(im, box, lo=False):
    a = np.asarray(im).astype(float)
    x0, y0, x1, y1 = box
    sub = a[y0:y1, x0:x1]
    r, g, b = sub[..., 0], sub[..., 1], sub[..., 2]
    warm = ((r > 70) & (r - b > 20)) if lo else ((r > 120) & (r - b > 50))
    lum = (0.3 * r + 0.5 * g + 0.2 * b)
    k = (np.clip((r - b - 20) / 50, 0, 1) if lo else np.clip((r - b - 50) / 80, 0, 1)) * warm
    dark = np.stack([lum * 0.32 + 20, lum * 0.3 + 18, lum * 0.3 + 22], -1)
    sub[..., :3] = sub[..., :3] * (1 - k[..., None]) + dark * k[..., None]
    a[y0:y1, x0:x1] = sub
    return Image.fromarray(a.round().clip(0, 255).astype('uint8'))
ws = Image.open(V + 'full_workshop.png').convert('RGBA')
ws = cool(ws, (40, 80, 140, 170))
ws.save(OUT + 'bg_workshop.png')
er = Image.open(V + 'full_engineroom.png').convert('RGBA')
half = Image.open(V + 'half_engineroom_s3.png').convert('RGBA').resize(er.size, Image.NEAREST)
m = Image.new('L', er.size, 0); ImageDraw.Draw(m).rectangle((228, 58, 334, 250), fill=255)
er = Image.composite(half, er, m.filter(ImageFilter.GaussianBlur(6)))
er = cool(er, (50, 150, 110, 210))
er.save(OUT + 'bg_engineroom.png')
print('ok')
# 港の鋳物小屋の大戸の奥の火も、ペレットを渡すまでは冷えている
po = Image.open(OUT + 'bg_port.png').convert('RGBA')
po = cool(po, (128, 118, 228, 200), lo=True)
# 大戸の奥は暗がりにする(元の絵の明るさを 3 割に落とした暗い色)
a = np.asarray(po).astype(float); x0, y0, x1, y1 = 140, 132, 212, 196
sub = a[y0:y1, x0:x1, :3]; lum = sub.mean(2, keepdims=True)
a[y0:y1, x0:x1, :3] = np.concatenate([lum * 0.22 + 12, lum * 0.2 + 12, lum * 0.24 + 18], 2)
po = Image.fromarray(a.round().clip(0, 255).astype('uint8'))
po.save(OUT + 'bg_port.png')
print('port ok')
