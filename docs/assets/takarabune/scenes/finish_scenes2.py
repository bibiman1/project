# 一枚絵その 2(D88)を素材に置く。最後の絵の月と輪は、望遠鏡の絵(v_moon)から切り出したものを、仕上げのあとで同じ位置に貼り戻す(同じ月)
from PIL import Image
S = '/home/user/project/docs/assets/takarabune/scenes/'
OUT = '/home/user/project/field/assets/worlds/takarabune/'
moon = Image.open(S + 'moon_from_vmoon.png').convert('RGBA')
mx = moon.resize((moon.width // 2, moon.height // 2), Image.NEAREST)
g = Image.open(S + 'glow2_s1.png').convert('RGBA')
# PixelLab が描き直した月のまわり(と、空の黒いしみ)は、下絵の空に戻してから、望遠鏡の月を貼る
bo = Image.open(S + 'glow2_in.png').convert('RGBA')
from PIL import ImageDraw, ImageFilter
m = Image.new('L', g.size, 0); md = ImageDraw.Draw(m)
md.ellipse((44, -6, 166, 80), fill=255); md.ellipse((188, 8, 216, 34), fill=255)
g = Image.composite(bo, g, m.filter(ImageFilter.GaussianBlur(4)))
g.alpha_composite(mx, (54, 4))
g.save(OUT + 'v_glow.png')
Image.open(S + 'cast2b_s5.png').convert('RGBA').save(OUT + 'v_cast.png')
print('ok')
# 最後の絵は、構図案 C(水の中から見上げる)に描き直した(D89)。月は入れない。上の版を置きかえる
Image.open(S + 'glow3_s5.png').convert('RGBA').save(OUT + 'v_glow.png')
print('v_glow = glow3_s5')
