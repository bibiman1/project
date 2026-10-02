# 路地の背景(PixelLab で仕上げた字なしの版 v1/bg_alley_base.png)に、看板と印刷屋の札の字を載せて、ゲームの背景にする
import sys
sys.path.insert(0, '/home/user/project/docs/assets/suzuki/sign')
from sign_v2 import board, text_mask, paste_mask
from PIL import Image
base = Image.open('/home/user/project/docs/assets/suzuki/v1/bg_alley_base.png').convert('RGBA')
bd = board()
cx = 607                                   # 鈴木商店の正面のまんなか
base.alpha_composite(bd, (cx - bd.width // 2, 126 - bd.height))   # 下の縁を壁の上に合わせる
m = text_mask('活版印刷'); paste_mask(base, m, 240, 118, (44, 40, 48, 255))
base.save('/home/user/project/field/assets/worlds/suzuki/bg_alley.png')
print('ok', bd.size)
