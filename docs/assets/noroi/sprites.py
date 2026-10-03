# PixelLab の 8 方向の物から、ゲーム用の 4 方向の絵を切り出す(record/2026-10-03-noroi/obj/)
# 向きの対応は絵ごとに目で確かめた(PixelLab の東西は絵によって逆になる)
from PIL import Image
D = '/home/user/project/docs/record/2026-10-03-noroi/obj/'
G = '/home/user/project/field/assets/worlds/noroi/'
ORDER = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']
def sheet_cell(name, d):
    sh = Image.open(D + name + '_sheet.png').convert('RGBA'); c = sh.height if name != 'akabeko' else 85
    k = ORDER.index(d); im = sh.crop((k * c, 0, (k + 1) * c, c)); return im.crop(im.getbbox())
MAP = {  # ゲームの向き -> PixelLab の向き
    'ponpon8': {'e': 'east', 'w': 'west', 's': 'south', 'n': 'north'},
    'akabeko': {'e': 'east', 'w': 'west', 's': 'south', 'n': 'north'},
    'tansu2': {'e': 'west', 'w': 'east', 's': 'south', 'n': 'north'},   # 東へ = 背板の面、西へ = 引き出しの面(D122)
    'tori8': {'e': 'west', 'w': 'east', 's': 'south', 'n': 'north'},    # PixelLab の東は頭が左
    'miton8': {'e': 'east', 'w': 'west', 's': 'south', 'n': 'north'},
}
OUT = {'ponpon8': 'ponpon', 'akabeko': 'akabeko', 'tansu2': 'tansu', 'tori8': 'tori', 'miton8': 'miton'}
for src, m in MAP.items():
    for g, p in m.items(): sheet_cell(src, p).save(G + f'{OUT[src]}_{g}.png')
# こけし(8 回転: 0 = 右向き、2 = うしろ、4 = 左向き、6 = 顔)
for g, k in (('e', 0), ('n', 2), ('w', 4), ('s', 6)):
    im = Image.open(D + f'kokeshi_rot_{k}.png').convert('RGBA'); im.crop(im.getbbox()).save(G + f'kokeshi_{g}.png')
# ぼぎカー
for g, n in (('e', 'east'), ('w', 'west'), ('s', 'south'), ('n', 'north')):
    Image.open(D + f'bogicar_{n}.png').save(G + f'bogicar_{g}.png')
Image.open(D + 'bogicar_east_ki.png').save(G + 'bogicar_e_ki.png')
Image.open(D + 'bogicar_east_stick_cut.png').save(G + 'bogicar_e_stick.png')
Image.open(D + 'bogicar_east_flame_cut.png').save(G + 'bogicar_e_flame.png')
# 赤べこの走る動き(4 方向 × 7 コマ)を横に並べた絵
import json
lay = json.load(open(D + 'akabeko_layout.json')); sh = Image.open(D + 'akabeko_sheet.png').convert('RGBA'); c = 85
for r in lay['spritesheet']['rows']:
    if r['type'] != 'animation': continue
    g = {'south': 's', 'east': 'e', 'north': 'n', 'west': 'w'}[r['direction']]
    fr = [sh.crop((k * c, r['row'] * c, (k + 1) * c, (r['row'] + 1) * c)) for k in range(r['frame_count'])]
    strip = Image.new('RGBA', (c * len(fr), c)); [strip.alpha_composite(f, (i * c, 0)) for i, f in enumerate(fr)]
    strip.save(G + f'akabeko_run_{g}.png')
# ドラム缶、木の葉のぼぎ、こけし(横、競争用)
C = '/home/user/project/docs/record/2026-10-03-noroi/cand3/'
for src, dst in (('drum_03', 'drum'), ('fueler2_10', 'fueler'), ('kokeshi2_00', 'kokeshi_side')):
    im = Image.open(C + src + '.png').convert('RGBA'); im.crop(im.getbbox()).save(G + dst + '.png')
for f in sorted(__import__('os').listdir(G)):
    if f.endswith('.png') and '_' in f and not f.startswith(('bg_', 'v_', 'rc_')): pass
print('ok')
