# 競争の背景(D134): PixelLab の候補 plate_1〜3 から、灯りの消えたツリーの背景と、灯りの状態の小片を作る。
# 灯りは 5 段 × 2 列(左のレーン、右のレーン)。上からステージ、黄 3 つ、青。赤(フライング)は青の位置に出す。
import sys
from PIL import Image, ImageDraw
src = sys.argv[1]; out = sys.argv[2]
P = {i: Image.open(f'{src}/plate_{i}.png').convert('RGBA') for i in (1, 2, 3)}
XS = (232, 247); YS = (130, 146, 162, 177, 192); R = 8
def patch(i, x, y): return P[i].crop((x - R, y - R, x + R, y + R))
mask = Image.new('L', (2 * R, 2 * R), 0); ImageDraw.Draw(mask).ellipse((1, 1, 2 * R - 2, 2 * R - 2), fill=255)
off = patch(3, 247, 130); offg = patch(1, 247, 192)
stage = patch(2, 232, 130); amber = patch(3, 247, 162); green = patch(2, 247, 192)
red = amber.copy(); px = red.load()
for y in range(red.height):
    for x in range(red.width):
        r, g, b, a = px[x, y]
        if r > 150 and g > 90 and r > b + 40: px[x, y] = (min(255, r + 10), int(g * 0.35), int(b * 0.5), a)  # 黄の灯りの色を赤へ
base = P[1].copy()
for y in YS:
    for x in XS:
        base.paste(offg if y == YS[-1] else off, (x - R, y - R), mask)
base.save(f'{out}/rc_plate.png')
strip = Image.new('RGBA', (2 * R * 6, 2 * R), (0, 0, 0, 0))
for k, im in enumerate([off, offg, stage, amber, green, red]):
    cut = Image.new('RGBA', im.size, (0, 0, 0, 0)); cut.paste(im, (0, 0), mask)   # 丸く切り抜いて、灯りだけを重ねる
    strip.paste(cut, (k * 2 * R, 0))
strip.save(f'{out}/rc_lamps.png')
print('ok', XS, YS, R)
