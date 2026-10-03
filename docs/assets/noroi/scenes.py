# 一枚絵の下絵(480×288)。ゲームの絵を拡大して並べ、PixelLab に「同じ配置のまま仕上げて」と頼む
from PIL import Image, ImageDraw
O = '/home/user/project/field/assets/worlds/noroi/'; V = '/home/user/project/docs/assets/noroi/v1/'
def up(n, k): im = Image.open(O + n + '.png'); return im.resize((int(im.width * k), int(im.height * k)), Image.NEAREST)
# みとんが、ぼぎカーに炎を塗る(ドライブイン跡の駐車場、車箪笥の前)
bg = Image.open(O + 'bg_drivein.png').crop((620, 150, 860, 294)).resize((480, 288), Image.NEAREST).convert('RGBA')
t = up('tansu', 3); bg.alpha_composite(t, (250, 250 - t.height))
m = up('miton', 3); bg.alpha_composite(m, (120, 268 - m.height))
c = up('bogicar_f', 3.2); bg.alpha_composite(c, (170, 286 - c.height))
d = ImageDraw.Draw(bg)
d.rectangle((60, 246, 84, 272), fill=(200, 60, 40), outline=(60, 20, 10), width=2); d.ellipse((60, 240, 84, 252), fill=(250, 170, 40))   # 塗料の缶
d.line((150, 200, 196, 236), fill=(120, 80, 40), width=3)                                                                     # 筆
bg.save(V + 'custom_in.png')
# ゴール: ぼぎカー(きー)が白黒の線を先に越える。うしろに、桶を引いたぽんぽんカー
bg = Image.open(V + 'race_s7.png').convert('RGBA').crop((0, 6, 480, 294))
d = ImageDraw.Draw(bg)
for k in range(12): d.rectangle((300, 190 + k * 8, 310, 198 + k * 8), fill=(20, 20, 20) if k % 2 else (244, 242, 234))
for k in range(12): d.rectangle((310, 190 + k * 8, 320, 198 + k * 8), fill=(244, 242, 234) if k % 2 else (20, 20, 20))
p = up('rc_ponpon', 1.6); bg.alpha_composite(p, (60, 222 - p.height))
k = up('rc_bogi', 2.6); bg.alpha_composite(k, (270, 280 - k.height))
for i in range(14): d.ellipse((200 + i * 6 - 30, 250 - i % 3 * 6, 230 + i * 6 - 30, 270 - i % 3 * 6), fill=(222, 214, 196))
bg.save(V + 'finish_in.png')
print('ok')
