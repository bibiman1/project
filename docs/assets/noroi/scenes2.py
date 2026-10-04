# 一枚絵の下絵 第 2 版(D132): 新しいみとん・車箪笥・ぼぎカー・赤べこ・ぽんぽんカーを並べる
from PIL import Image, ImageDraw
G = '/home/user/project/field/assets/worlds/noroi/'; V = '/home/user/project/docs/assets/noroi/v1/'
def up(n, k):
    im = Image.open(G + n + '.png').convert('RGBA'); return im.resize((int(im.width * k), int(im.height * k)), Image.NEAREST)
# みとんが、ぼぎカーに炎を塗る(ドライブイン跡、車箪笥の前)
bg = Image.open(G + 'bg_drivein.png').crop((560, 150, 800, 294)).resize((480, 288), Image.NEAREST).convert('RGBA')
t = up('tansu_w', 2.2); bg.alpha_composite(t, (250, 262 - t.height))
c = up('bogicar_e', 3.0); bg.alpha_composite(c, (150, 284 - c.height))
m = up('miton_e', 3.0); bg.alpha_composite(m, (40, 280 - m.height))
d = ImageDraw.Draw(bg)
d.rectangle((24, 250, 48, 278), fill=(200, 60, 40), outline=(60, 20, 10), width=2); d.ellipse((24, 244, 48, 256), fill=(250, 170, 40))
bg.save(V + 'custom2_in.png')
# ゴール: きーが張り付いたぼぎカーが先に白黒の線をこえる。うしろに赤べこ(ウィリー)、奥でぽんぽんカーが線に引き戻されて宙を飛ぶ
bg = Image.open(V + 'race_s7.png').convert('RGBA').crop((0, 6, 480, 294))
cr = Image.open(G + 'rc_crowd.png').convert('RGBA'); cr.putalpha(cr.getchannel('A').point(lambda v: v * 0.6)); bg.alpha_composite(cr, (0, 288 - cr.height - 2))
d = ImageDraw.Draw(bg)
for k in range(12): d.rectangle((330, 190 + k * 8, 340, 198 + k * 8), fill=(20, 20, 20) if k % 2 else (244, 242, 234))
for k in range(12): d.rectangle((340, 190 + k * 8, 350, 198 + k * 8), fill=(244, 242, 234) if k % 2 else (20, 20, 20))
a = up('akabeko_e', 1.8).rotate(10, expand=True); bg.alpha_composite(a, (90, 236 - a.height))
p = up('ponpon_e', 1.0).rotate(-25, expand=True); bg.alpha_composite(p, (40, 70))
d.line((0, 150, 40, 110, 70, 100), fill=(20, 18, 16), width=2)
k = up("bogicar_e_stick", 2.4); bg.alpha_composite(k, (220, 284 - k.height))
for i in range(10): d.ellipse((200 + i * 9, 250 - i % 3 * 6, 236 + i * 9, 278 - i % 3 * 6), fill=(222, 216, 200))
bg.save(V + 'finish2_in.png')
print('ok')
