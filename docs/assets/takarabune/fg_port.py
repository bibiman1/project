# 漁港の前後の重なり(2026-10-03、作者「背景の前後関係を整えて。バナナの時みたいに」)
# 宝舟は岸壁より手前(南の水の上)にあるので、帆・帆柱・竜頭・煙突は、岸壁を歩くきーより手前に描く。背景の絵から形どおりに切り出す
from PIL import Image, ImageDraw, ImageFilter
A = '/home/user/project/field/assets/worlds/takarabune/'
bg = Image.open(A + 'bg_port.png').convert('RGBA')
m = Image.new('L', bg.size, 0); d = ImageDraw.Draw(m)
d.polygon([(416, 260), (470, 256), (546, 262), (541, 300), (546, 357), (420, 360), (414, 300)], fill=255)   # 帆
d.rectangle((474, 250, 483, 395), fill=255)                                                              # 帆柱
d.polygon([(674, 262), (688, 249), (712, 247), (730, 257), (738, 270), (728, 284), (712, 292), (700, 300), (684, 300), (674, 284)], fill=255)   # 竜頭
d.polygon([(684, 294), (702, 298), (692, 318), (674, 338), (652, 354), (630, 368), (614, 364), (636, 346), (658, 326), (674, 306)], fill=255)   # 首(舳先の反り)
d.rectangle((318, 320, 338, 380), fill=255)                                                              # 煙突
# 竜頭と首は、上の多角形が細かった(首のふちが外れて、きーが首の上に乗って見えた。2026-10-03、作者「クビの後ろになってない」)。
# 多角形を 10 ドット太らせて、その中の暗い色(岸壁の青より暗い、青みの弱い色)を竜頭と首に足す
import numpy as np
dm = Image.new('L', bg.size, 0); dd = ImageDraw.Draw(dm)
dd.polygon([(674, 262), (688, 249), (712, 247), (730, 257), (738, 270), (728, 284), (712, 292), (700, 300), (684, 300), (674, 284)], fill=255)
dd.polygon([(684, 294), (702, 298), (692, 318), (674, 338), (652, 354), (630, 368), (614, 364), (636, 346), (658, 326), (674, 306)], fill=255)
dm = dm.filter(ImageFilter.MaxFilter(21))
px = np.array(bg)[..., :3].astype(int)
dark = px[..., 2] < 82
dark[:250] = False   # 竜頭より上は奥の小屋の壁(壁の看板は足さない)
add = Image.fromarray(np.where((np.array(dm) > 0) & dark, 255, 0).astype(np.uint8))
add = add.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))   # たてがみの明るい点のすきまをうめる
m = Image.fromarray(np.where((np.array(m) > 0) | ((np.array(add) > 0) & (np.array(dm) > 0)), 255, 0).astype(np.uint8))
fg = Image.new('RGBA', bg.size, (0, 0, 0, 0)); fg.paste(bg, (0, 0), m)
fg.save(A + 'fg_port.png')
chk = bg.copy(); ov = Image.new('RGBA', bg.size, (255, 0, 0, 0)); ov.putalpha(m.point(lambda v: 90 if v else 0)); chk.alpha_composite(ov)
chk.crop((280, 220, 760, 420)).resize((960, 400), Image.NEAREST).save('/tmp/claude-0/-home-user-project/e7cb1a9b-b078-5ece-9cdf-0647f5a9d6fa/scratchpad/fgchk.png')
print('ok')
