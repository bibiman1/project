# ゴールの一枚絵(D133、D134): PixelLab の候補 v_finish_102 の背景(見物人の影のスタンド、メサ)と赤べこを使い、
# ぼぎカーはマップの炎のぼぎカー(三面図どおり。左へ走るので左右を返す)に、きーは正典の形(歩きの絵の描き方で、つぶれて張り付いた楕円)に差し替える
import sys
from PIL import Image, ImageDraw
D = '/home/user/project/docs/assets/noroi/v2/scenes/'
A = '/home/user/project/field/assets/worlds/noroi/'
OUT = (74, 56, 40, 255); BASE = (243, 227, 179, 255); SHADE = (218, 196, 142, 255); HI = (255, 247, 220, 255)
NOSE = (236, 140, 70, 255); NOSE_OUT = (170, 90, 50, 255); EYE = (0, 0, 0, 255)
def ki_stick(rx=19, ry=5.5):
    # 歩きの絵の横向き(draw_ki3)と同じ塗り分け・ふち・くちばし・目で、薄くのばした楕円(張り付く D122、D123)。左向き
    W, H = 52, 18; im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); px = im.load()
    cx, cy = W / 2 + 1, H - ry - 1.5
    m = {(x, y) for x in range(W) for y in range(H) if ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1}
    for (x, y) in m:
        dx = (x + 0.5 - cx) / rx; dy = (y + 0.5 - cy) / ry; c = BASE
        if dx * 0.5 + dy * 0.9 > 0.5: c = SHADE
        if dx * -0.6 + dy * -0.8 > 0.72: c = HI
        px[x, y] = c
    for (x, y) in m:
        if any((x + a, y + b) not in m for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))): px[x, y] = OUT
    ey = int(round(cy)) - 1; nx = int(round(cx + rx)) - 2
    for x in range(nx, nx + 4):
        for y in range(ey - 1, ey + 2): px[x, y] = NOSE
    px[nx + 4, ey] = NOSE_OUT
    for a in (0, 1): px[nx - 6 + a, ey - 1] = EYE
    return im.transpose(Image.FLIP_LEFT_RIGHT)
if __name__ == '__main__':
    stage = sys.argv[1]
    if stage == 'comp':
        base = Image.open(D + 'out/v_finish_102_00.png').convert('RGBA')
        d = ImageDraw.Draw(base)
        # 古いぼぎカーを、同じ行のはしの舗装の色で消す
        for y in range(190, 280):
            c = base.getpixel((8, y))
            d.line((152, y, 306, y), fill=c)
        car = Image.open(A + 'bogicar_e_flame.png').convert('RGBA').transpose(Image.FLIP_LEFT_RIGHT)
        car2 = car.resize((car.width * 2, car.height * 2), Image.NEAREST)
        cx, by = 200, 273
        base.alpha_composite(car2, (cx - car2.width // 2, by - car2.height))
        k = ki_stick(); k2 = k.resize((k.width * 2, k.height * 2), Image.NEAREST)
        KX, KY = cx - k2.width // 2 + 16, by - car2.height + 18 - k2.height
        base.alpha_composite(k2, (KX, KY))
        base.save(D + 'v_finish_comp.png'); k2.save(D + 'ki_stick_side.png')
        print('car', car2.size, 'ki', k2.size, 'ki at', (KX, KY))
    elif stage == 'final':
        im = Image.open(D + sys.argv[2]).convert('RGBA')
        k2 = Image.open(D + 'ki_stick_side.png')
        x, y = int(sys.argv[3]), int(sys.argv[4])
        im.alpha_composite(k2, (x, y)); im.convert('RGB').save(D + 'v_finish_final.png'); print('ok')
