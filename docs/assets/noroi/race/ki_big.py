# 競争の画面のきー(D134): 歩きの絵 ki_walk.png の向こう向きを、同じ描き方(draw_ki3 の楕円・塗り分け・ふち)で 2 倍の大きさに描く。
# 使い方: python3 ki_big.py 出力先 field/assets/worlds/lake/ki_walk.png
# 形を足さない(耳・手足・模様なし)。張り付く絵は同じ楕円を薄くのばしただけ。
from PIL import Image
import sys
OUT = (74, 56, 40, 255)
P = dict(base=(243, 227, 179, 255), shade=(218, 196, 142, 255), hi=(255, 247, 220, 255))
def draw(rx, ry, W, H):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); px = im.load()
    cx = W / 2; cy = H - ry - 0.5
    m = {(x, y) for x in range(W) for y in range(H) if ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1}
    for (x, y) in m:
        dx = (x + 0.5 - cx) / rx; dy = (y + 0.5 - cy) / ry
        c = P['base']
        if dx * 0.5 + dy * 0.9 > 0.5: c = P['shade']
        if dx * -0.6 + dy * -0.8 > 0.72: c = P['hi']
        px[x, y] = c
    for (x, y) in m:
        if any((x + a, y + b) not in m for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))): px[x, y] = OUT
    return im.crop(im.getbbox())
out = sys.argv[1]
K = 2   # 1 倍で描いて、ドットのまま 2 倍にする(ぼぎカーの幅 = きーの幅 D122)(ゲームのきーとドットの大きさまで同じ)
def big(im): return im.resize((im.width * K, im.height * K), Image.NEAREST)
big(Image.open(sys.argv[2]).crop((0, 64, 64, 128)).crop(Image.open(sys.argv[2]).crop((0, 64, 64, 128)).getbbox())).save(f'{out}/rc_ki_back.png')  # 立つ = 歩きの絵の向こう向きそのまま
big(draw(19, 5.5, 50, 20)).save(f'{out}/rc_ki_stick.png')          # 張り付く(同じ楕円を薄くのばす)
print('ok')
