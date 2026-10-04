# 歓声の見物人の影(D126、D134): PixelLab の編集(空のスタンドを影の見物人でうめた絵)と背景の差だけを切り出す
import sys
import numpy as np
from PIL import Image, ImageFilter
plate, crowd, out = sys.argv[1:4]
a = np.array(Image.open(plate).convert('RGB')).astype(int)
b = np.array(Image.open(crowd).convert('RGBA'))
diff = np.abs(a - b[..., :3].astype(int)).sum(2)
m = (diff > 60).astype(np.uint8) * 255
m[205:, :] = 0                 # 道とスタートの線から下は使わない
m[:, 205:275] = 0              # ツリーのまわり
mi = Image.new('L', (m.shape[1], m.shape[0])); mi.putdata(m.flatten().tolist())
mi = mi.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
o = Image.fromarray(b); o.putalpha(mi); o.save(out)
print('ok', int((np.array(mi) > 0).sum()))
