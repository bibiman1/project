# 仕上げ: 警告の札に字(DotGothic16、白黒 2 値)を入れ、甲板を船の形で切り抜き、海を横につながる絵にして、ゲームの素材に置く
import json, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
V = '/home/user/project/docs/assets/takarabune/v1/'
OUT = '/home/user/project/field/assets/worlds/takarabune/'
fnt = ImageFont.truetype('/tmp/claude-0/-home-user-project/e7cb1a9b-b078-5ece-9cdf-0647f5a9d6fa/scratchpad/DG.ttf', 16)
R = random.Random(5)
def text_row(t, adv=15, space=7):
    cells = []
    for ch in t:
        if ch in '　 ': cells.append((None, space)); continue
        m = Image.new('L', (16, 20), 0); ImageDraw.Draw(m).text((0, -3), ch, fill=255, font=fnt)
        cells.append((m.point(lambda v: 255 if v > 110 else 0).crop((0, 0, 16, 16)), adv))
    out = Image.new('L', (sum(a for _, a in cells) + 1, 16), 0); x = 0
    for m, a in cells:
        if m is not None: out.paste(m, (x, 0))
        x += a
    return out.crop(out.getbbox())
src = {n: (V + f'fix_{n}.png' if n in ('port', 'gate', 'admin', 'turbine') else V + f'full_{n}.png') for n in ('port', 'gate', 'admin', 'turbine', 'reactor', 'core', 'deck', 'sea')}
ims = {n: Image.open(p).convert('RGBA') for n, p in src.items()}
# 札: 少し汚れた黄色の板、上に赤い帯、黒い字
DIM = {'gate': 0.55, 'admin': 0.5, 'turbine': 0.62, 'reactor': 0.8}
for s in json.load(open(V + 'signs.json')):
    im = ims[s['map']]; d = ImageDraw.Draw(im)
    x, y, w, h = s['x'], s['y'], s['w'], s['h']
    k = DIM[s['map']]
    yel = tuple(int(c * k) for c in (226, 188, 44)); dark = tuple(int(c * k) for c in (24, 20, 10))
    d.rectangle((x, y, x + w, y + h), fill=yel, outline=dark, width=2)
    d.rectangle((x + 3, y + 3, x + w - 3, y + 5), fill=tuple(int(c * k) for c in (176, 40, 30)))
    for _ in range(w * h // 18):                                    # 錆と汚れ
        px, py = R.randrange(x + 2, x + w - 2), R.randrange(y + 2, y + h - 2)
        d.point((px, py), fill=tuple(int(c * k * R.uniform(0.7, 0.95)) for c in (200, 150, 50)))
    t = text_row(s['text'])
    tx = x + (w - t.width) // 2; ty = y + 7
    ink = Image.new('RGBA', t.size, dark + (255,)); im.paste(ink, (tx, ty), t)
# 甲板: 下絵の船の形(少し太らせる)で切り抜く
deck = ims['deck']
a = Image.open(V + 'deck.png').getchannel('A').filter(ImageFilter.MaxFilter(5))
deck.putalpha(a.point(lambda v: 255 if v > 0 else 0))
ims['deck'] = deck
# 海: 左右のはしを重ねて、横につながるようにする
sea = np.asarray(ims['sea']).astype(float); W = sea.shape[1]; B = 96
out = sea[:, :W - B].copy()
wgt = np.linspace(0, 1, B)[None, :, None]
out[:, :B] = sea[:, W - B:] * (1 - wgt) + sea[:, :B] * wgt
ims['sea'] = Image.fromarray(out.round().astype('uint8'))
for n, im in ims.items():
    im.save(OUT + ('sea.png' if n == 'sea' else f'bg_{n}.png'))
print({n: im.size for n, im in ims.items()})
