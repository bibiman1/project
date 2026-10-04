# ぽんぽんカーの三面図(D119、D124、D125、D137)。扉絵 pic/218717_989129975_3 の読み直し(設計図 02 第 2 版)。
# 体: 低く横に広いドーム、屋根も座席もない。前の帯に丸いライトの目 2 つと大きな丸い鼻。
# V8 は天板のまん中の穴に沈み、前にクランクの丸い滑車、上にブロアー、吸気口(筒 3 つ)は前。
# 排気の管は左右 4 本ずつ、上と外へ。黒い線はエンジンの右から(ドラム缶の火へ。熱を吸い込む D124)。
# 車輪は溝のある太いタイヤ、体の下に半分かくれる。塗りはクリームに赤のブリキ、メッキ(D120)。
from vox import Model, mat

TIN = mat('tin', (234, 222, 188), 0.5); TINR = mat('tinred', (186, 40, 36), 0.55); TIND = mat('tind', (206, 192, 156), 0.3)
CHR = mat('chrome', (196, 204, 216), 0.95); CHRD = mat('chromed', (120, 128, 142), 0.6); BLK = mat('black', (22, 22, 26))
TIRE = mat('tire', (40, 38, 40), 0.15); GLASS = mat('glass', (250, 246, 222), 0.8); NOSE = mat('nose', (226, 84, 50), 0.5)
CAB = mat('cable', (18, 18, 20), 0.2)

def build(k=1):
    m = Model('ponpon', (int(-46 * k), int(34 * k)), (int(-38 * k), int(40 * k)), (0, int(58 * k)))
    rx, ry = 30 * k, 33 * k
    # 車輪(体の下に半分かくれる、溝のある太いタイヤ)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cx, cy = sx * 19 * k, sy * 18 * k
            m.put(m.cyl('x', cy, 8 * k, 8 * k, cx - 5 * k, cx + 5 * k), TIRE, '車輪')
            for g in range(-4, 5, 2):  # 溝
                m.paint(m.cyl('x', cy, 8 * k, 8 * k, cx + g * k, cx + g * k + 0.6 * k) & ~m.cyl('x', cy, 8 * k, 7 * k, cx - 6 * k, cx + 6 * k), BLK)
            m.put(m.cyl('x', cy, 8 * k, 3 * k, cx - 5.2 * k, cx + 5.2 * k) & (m.X * sx > (19 + 4) * k), CHR, '車輪')
    # 体: 帯(だ円の筒)とドーム
    band = (((m.X / rx) ** 2 + (m.Y / ry) ** 2) <= 1) & (m.Z >= 7 * k) & (m.Z < 19 * k)
    dome = m.ell(0, 0, 19 * k, rx, ry, 16 * k) & (m.Z >= 19 * k)
    m.put(band | dome, TIN, '体')
    m.paint((((m.X / rx) ** 2 + (m.Y / ry) ** 2) <= 1) & (m.Z >= 18 * k) & (m.Z < 20 * k), TINR)   # 赤い帯の線
    m.paint(band & (m.Z < 8 * k), TINR)
    # 顔(前の帯): 丸いライトの目 2 つ(メッキの輪)、大きな丸い鼻
    for sx in (-1, 1):
        m.put(m.cyl('y', sx * 17 * k, 13 * k, 4.5 * k, 26 * k, 33.5 * k) & (m.Y > 0), CHR, '目(ライト)')
        m.put(m.cyl('y', sx * 17 * k, 13 * k, 3.2 * k, 26 * k, 34 * k) & (m.Y > 0), GLASS, '目(ライト)')
    m.put(m.ell(0, 32 * k, 12 * k, 7 * k, 5 * k, 6 * k), NOSE, '鼻')
    # エンジン: 天板のまん中の穴に沈んだ V8
    m.put(m.box(-10 * k, 10 * k, -10 * k, 12 * k, 22 * k, 38 * k), CHRD, 'V8')
    m.put(m.box(-13 * k, -3 * k, -9 * k, 11 * k, 34 * k, 40 * k) | m.box(3 * k, 13 * k, -9 * k, 11 * k, 34 * k, 40 * k), CHR, 'V8')
    m.put(m.cyl('y', 0, 30 * k, 5 * k, 12 * k, 14 * k), CHR, 'クランクの滑車')
    m.put(m.box(-7 * k, 7 * k, -5 * k, 10 * k, 40 * k, 50 * k), CHR, 'ブロアー')
    for z in range(42, 50, 2): m.paint(m.box(-7 * k, 7 * k, -5 * k, 10 * k, z * k, (z + 1) * k), CHRD)
    m.put(m.box(-10 * k, 10 * k, -2 * k, 12 * k, 50 * k, 57 * k), CHR, '吸気口')
    for sx in (-6, 0, 6):  # 筒 3 つの口(前)
        m.put(m.cyl('y', sx * k, 53.5 * k, 2.4 * k, 10 * k, 12.5 * k), BLK, '吸気口')
    # 排気の管(左右 4 本ずつ、上と外へ)
    for sx in (-1, 1):
        for yy in (-7, -2, 3, 8):
            m.put(m.pipe((sx * 11 * k, yy * k, 33 * k), (sx * 21 * k, yy * k, 45 * k), 1.3 * k), CHR, '排気の管')
    # 黒い線(エンジンの右から、ドラム缶の火へ)
    m.put(m.pipe((-10 * k, 2 * k, 30 * k), (-26 * k, 2 * k, 34 * k), 1.0 * k) | m.pipe((-26 * k, 2 * k, 34 * k), (-44 * k, 2 * k, 14 * k), 1.0 * k), CAB, '黒い線')
    m.note(1, '体: 低く横に広いドーム(幅 60、長さ 66)。屋根も座席もない。クリームのブリキ、赤の線、メッキ', (0, -16, 30))
    m.note(2, '顔: 前の帯に丸いライトの目 2 つ(メッキの輪)と、大きな丸い鼻', (0, 34, 12))
    m.note(3, 'V8: 天板のまん中の穴に沈む。前にクランクの丸い滑車', (0, 12, 30))
    m.note(4, 'ブロアー(GMC 6-71)と吸気口: 筒 3 つの口は前', (0, 12, 53))
    m.note(5, '排気の管: 左右 4 本ずつ、上と外へ', (21, 0, 45))
    m.note(6, '車輪 4 つ: 溝のある太いタイヤ。体の下に半分かくれる', (24, 18, 8))
    m.note(7, '黒い線: エンジンの右から、ドラム缶の木の葉の火へ(熱を吸い込む。原理は説明しない D124)', (-30, 2, 30))
    return m

if __name__ == '__main__':
    import sys
    from PIL import Image
    from sheet import sheet
    m = build(1)
    ki = Image.open('/home/user/project/field/assets/worlds/lake/ki_walk.png').crop((0, 128, 64, 192)); ki = ki.crop(ki.getbbox())
    sheet(m, sys.argv[1] + '/sanmen_ponpon.png', '三面図 02  ぽんぽんカー(D137)',
          '扉絵の読み直し(設計図 02 第 2 版)。作者「車体にでかいV8が搭載されているだけでいい」。1 マス = ゲームの 1 ドット',
          ['競争の画面では 2 倍(k = 2)。線は画面の外の峠のドラム缶からのびて、のびきるとバンジーで引き戻される(D125)'], ki=ki)
    for kk, nm in ((1, ''), (2, '_x2')):
        mm = build(kk)
        for v in ('o_w', 'o_e', 'o_s', 'o_n', 'rear'):
            im, _ = mm.view(v); im.save(sys.argv[1] + f'/ponpon{nm}_{v}.png')
    print('ok')
