# 鈴木商店の前後の重なり(2026-10-03、作者「重ね合わせみてね」のあと、のこりの断片も見直した)
# 川原の輪(木の輪)、クレーターの石のアーチと小さな柱を、背景の絵から切り出す(fg_<map>.png)
# 切り出し方は docs/assets/kasumi/fg_kasumi.py と同じ(g = 箱のふちから地面を塗り広げて、塗れなかった所)
import sys
sys.path.insert(0, '/home/user/project/docs/assets/kasumi')
import fg_kasumi as K
K.A = '/home/user/project/field/assets/worlds/suzuki/'
K.cut('river', [('a', (710, 221, 896, 370), 13, 180, 360), ('r', (708, 284, 722, 294)), ('r', (882, 284, 898, 294))])   # 木の輪(細いので弧で囲む)
K.cut('crater', [('g', (704, 218, 898, 318), 40), ('g', (788, 314, 822, 362), 40)])
print('ok')
