# 一枚絵と小物を素材に置く。宝舟の帆に「宝」の一字(ゲームの字体、D86)
from PIL import Image, ImageDraw, ImageFont
S = '/home/user/project/docs/assets/takarabune/scenes/'
OUT = '/home/user/project/field/assets/worlds/takarabune/'
fnt = ImageFont.truetype('/tmp/claude-0/-home-user-project/e7cb1a9b-b078-5ece-9cdf-0647f5a9d6fa/scratchpad/DG.ttf', 16)
def glyph(ch, scale=1):
    m = Image.new('L', (16, 20), 0); ImageDraw.Draw(m).text((0, -3), ch, fill=255, font=fnt)
    m = m.point(lambda v: 255 if v > 110 else 0).crop((0, 0, 16, 16))
    return m.resize((16 * scale, 16 * scale), Image.NEAREST)
def stamp(im, ch, x, y, col, scale=1):
    g = glyph(ch, scale); im.paste(Image.new('RGBA', g.size, col + (255,)), (x, y), g)
# (最初の版の最後の絵。D88 で finish_scenes2.py に置きかえ)
# gl = Image.open(S + 'glow_s3.png').convert('RGBA'); stamp(gl, '宝', 184, 86, (70, 40, 30)); gl.save(OUT + 'v_glow.png')
# Image.open(S + 'cast_s3.png').convert('RGBA').save(OUT + 'v_cast.png')
Image.open(S + 'kaizu_s3.png').convert('RGBA').save(OUT + 'v_kaizu.png')
po = Image.open(OUT + 'bg_port.png').convert('RGBA'); stamp(po, '宝', 466, 284, (34, 28, 38), 2); po.save(OUT + 'bg_port.png')
e = Image.open(S + 'sp_engine_5.png').convert('RGBA'); e.crop(e.getbbox()).save(OUT + 'engine.png')
b = Image.open(S + 'sp_bogi.png').convert('RGBA'); b.save(OUT + 'bogi.png')
Image.open(S + 'sp_fuel.png').convert('RGBA').save(OUT + 'fuel.png')
Image.open(S + 'sp_frag.png').convert('RGBA').save('/home/user/project/field/assets/worlds/void/frag_takarabune.png')
print(Image.open(OUT + 'engine.png').size)
