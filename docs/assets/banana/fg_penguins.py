# 南極の浜のペンギン 7 羽を、背景の絵から切り出す(fg_shore2.png)。きーとの前後は worlds.js で足もとの y で決める
# 2026-10-03、作者「おかしい」(きーがペンギンの上に乗って見える画面写真つき)
# 切り出し方は docs/assets/kasumi/fg_kasumi.py と同じ(g = 箱のふちから雪を塗り広げて、塗れなかった所)
import sys
sys.path.insert(0, '/home/user/project/docs/assets/kasumi')
import fg_kasumi as K
from PIL import Image
K.A = '/home/user/project/field/assets/worlds/banana/'
PEN = [(542, 118, 566, 158), (569, 116, 595, 152), (596, 124, 623, 158), (625, 124, 651, 158),   # うしろの列
       (544, 152, 571, 187), (569, 152, 595, 187), (596, 154, 623, 188)]                         # 手前の列
K.cut('shore', [('g', b, 60) for b in PEN])
# fg_shore.png はほかの切り出しの束(B_FG)なので、別の名前にする
import os
os.replace(K.A + 'fg_shore.png', K.A + 'fg_shore2.png')
print('ok')
