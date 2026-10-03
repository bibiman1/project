# 上昇の場面の部品: 縦長の空(2 倍)、単結晶(衛星軌道のマップの筒から切り出し、透明に)、地球のふち、手前の雲
from PIL import Image
import numpy as np
D = '/home/user/project/docs/assets/suzuki/rise/'
A = '/home/user/project/field/assets/worlds/suzuki/'
sky = Image.open(D + 'sky_half.png').convert('RGB')
sky.resize((sky.width * 2, sky.height * 2), Image.NEAREST).save(A + 'rise_sky.png')
orb = np.asarray(Image.open(A + 'bg_orbit.png').convert('RGB')).astype(float)
# 筒: 背景は黒い宇宙なので、明るさを不透明さとみなして切り出す(ガラスの色は明るい空色)
tube = orb[64:250, 0:896]
lum = tube.mean(axis=2)
alpha = np.clip((lum - 30) / 170, 0, 1)
alpha[lum < 45] = 0                                  # 星は消す
alpha[:13, 700:840] = 0                              # 右上にかかる月(の下のはし)だけを消す。筒の上の縁は残す(2026-10-03、作者の指摘で直した)
rgb = np.clip(tube / np.maximum(alpha[..., None], 0.35), 0, 255)
out = np.dstack([rgb, alpha * 255]).astype('uint8')
im = Image.fromarray(out, 'RGBA')
im = im.resize((im.width // 2, im.height // 2), Image.BOX)
im.save(A + 'rise_tube.png')
# 地球のふち(衛星軌道のマップの下の帯)
earth = Image.open(A + 'bg_orbit.png').convert('RGBA').crop((0, 248, 896, 320))
earth.resize((480, int(72 * 480 / 896)), Image.BOX).save(A + 'rise_earth.png')
# 手前の雲: 空の絵の雲の帯から、白いところだけ
band = np.asarray(sky.crop((0, 680, 240, 750))).astype(float)
lum = band.mean(axis=2); a = np.clip((lum - 170) / 50, 0, 1) * 0.9
# 帯を横に並べたつなぎ目で、端にかかった雲が縦に切れないよう、左右の端に向かって薄くする(2026-10-03、作者「上昇時に雲がかけている」)
xs = np.arange(a.shape[1]); edge = np.clip(np.minimum(xs, a.shape[1] - 1 - xs) / 28.0, 0, 1)
a = a * edge[None, :]
cl = Image.fromarray(np.dstack([band, a * 255]).astype('uint8'), 'RGBA')
cl.resize((cl.width * 2, cl.height * 2), Image.NEAREST).save(A + 'rise_cloud.png')
print('ok', im.size)
