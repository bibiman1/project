# タービン建屋と甲板の前後の重なり(2026-10-03、作者「金網フェンスは？前後関係」のあと、ほかのマップも見直した)
# タービン建屋: 床に立つ操作盤と、注意の立て看板。甲板: 煙突のついた丸い窯と、ろうそくと、頭の上の帆。背景の絵から切り出す
from PIL import Image, ImageDraw
A = '/home/user/project/field/assets/worlds/takarabune/'

def cut(key, shapes):
    bg = Image.open(A + f'bg_{key}.png').convert('RGBA')
    m = Image.new('L', bg.size, 0); d = ImageDraw.Draw(m)
    for kind, box in shapes:
        {'e': d.ellipse, 'r': d.rectangle, 'p': d.polygon}[kind](box, fill=255)
    fg = Image.new('RGBA', bg.size, (0, 0, 0, 0)); fg.paste(bg, (0, 0), m)
    fg.save(A + f'fg_{key}.png')
    chk = bg.copy(); ov = Image.new('RGBA', bg.size, (255, 0, 0, 0)); ov.putalpha(m.point(lambda v: 110 if v else 0)); chk.alpha_composite(ov)
    chk.save(f'/tmp/claude-0/-home-user-project/e7cb1a9b-b078-5ece-9cdf-0647f5a9d6fa/scratchpad/fgchk_{key}.png')

cut('turbine', [('r', (393, 240, 419, 300)),     # 操作盤
                ('r', (812, 238, 850, 284))])    # 立て看板
cut('deck', [('e', (62, 118, 130, 198)),         # 窯
             ('r', (84, 82, 118, 140)),          # 煙突
             ('r', (143, 85, 161, 113)),         # ろうそく
             ('p', [(331, 48), (343, 48), (360, 58), (381, 82), (392, 112), (392, 160), (378, 200), (358, 236), (343, 250), (331, 250)])])   # 帆と帆桁(頭の上)
print('ok')
