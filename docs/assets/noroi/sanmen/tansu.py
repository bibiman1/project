# 車箪笥の三面図(D122、D123、D135、D136、D137)。作者のスケッチ A・B(pic/218717_989130033_182large.jpg、pic/218717_989129983_28large.jpg)
# 決まり: 前 = STP とナンバーの短い面。長い向き(y)に転がる。引き出しは進む向きの左の横腹(+x)だけ、右(-x)は背板。
# 車輪は箱の下の四隅(箱の外へつき出さない D136)。すそはアーチの切り欠きで、車輪がのぞく。アーチのあいだはルーバー(スケッチ A)。
# エンジンは天板の前寄りに沈めた V8、上にブロアー、吸気のスクープの口は前。前とうしろの短い面に綱の鉄の環。菱形の鉄の金具、角の三角の金具。
from vox import Model, mat

WOOD = mat('wood', (112, 66, 40), 0.25); WOODD = mat('woodd', (78, 44, 26), 0.1); WOODL = mat('woodl', (140, 92, 58), 0.3)
IRON = mat('iron', (44, 44, 50), 0.15); CHR = mat('chrome', (190, 198, 210), 0.9); CHRD = mat('chromed', (110, 118, 132), 0.6)
WHL = mat('wheel', (128, 86, 54), 0.1); RIM = mat('rim', (40, 40, 44), 0.2); BLK = mat('black', (20, 20, 24))
STP = mat('stp', (200, 40, 40), 0.3); STPW = mat('stpw', (240, 240, 236), 0.2); PLATE = mat('plate', (226, 222, 206), 0.2)
DRW = mat('drawer', (124, 74, 46), 0.3)

def build():
    m = Model('tansu', (-26, 26), (-56, 56), (0, 92))
    L, Wd = 50, 22              # 箱: 長さ 100(y)、幅 44(x)
    zb, zt = 16, 62             # 箱の下と上(高さ 46)
    # 車輪: 箱の下の四隅(x は箱の内側)。木の円盤に鉄の輪。車軸は x の向き(長い向きに転がる)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cx, cy = sx * 15, sy * 35
            m.put(m.cyl('x', cy, 9, 9, cx - 2.5, cx + 2.5), RIM, '車輪')
            m.put(m.cyl('x', cy, 9, 7.5, cx - 2.5, cx + 2.5), WHL, '車輪')
            m.put(m.cyl('x', cy, 9, 1.6, cx - 3, cx + 3), IRON, '車輪')
    for sy in (-1, 1):
        m.put(m.cyl('x', sy * 35, 9, 1.2, -15, 15), IRON, '車軸')
    # すそ(台): 箱の外まわり、高さ 8。四隅の下にアーチの切り欠き
    m.put(m.box(-Wd, Wd, -L, L, 8, zb), WOODD, 'すそ')
    m.put(m.box(-Wd + 3, Wd - 3, -L + 3, L - 3, 8, zb), None, None)      # 中は空(車輪が入る)
    for sy in (-1, 1):
        arch = m.cyl('x', sy * 35, 8, 11, -Wd - 1, Wd + 1) | m.box(-Wd - 1, Wd + 1, sy * 35 - 11, sy * 35 + 11, 0, 8)
        m.put(arch & m.box(-Wd, Wd, -L, L, 0, zb), None, None)
    m.put(m.box(-Wd + 3, Wd - 3, -L + 3, L - 3, zb - 2, zb), WOODD, 'すそ')  # 底板
    for z in range(9, 15, 2):  # ルーバー(引き出しの側のすそ、アーチのあいだ)
        m.paint(m.box(Wd - 1, Wd, -20, 20, z, z + 1), BLK)
    # 箱
    m.put(m.box(-Wd, Wd, -L, L, zb, zt), WOOD, '箱')
    m.put(m.box(-Wd, Wd, -L, L, zt - 2, zt), WOODL, '天板')
    # 引き出し 3 段(+x の面だけ)
    rows = [(46, 58), (32, 44), (18, 30)]
    for a, b in rows:
        m.paint(m.box(Wd - 1, Wd, -L + 4, L - 4, a, b), DRW)
        m.paint(m.box(Wd - 1, Wd, -L + 4, L - 4, b, b + 1), WOODD)
        m.paint(m.box(Wd - 1, Wd, -L + 4, L - 4, a - 1, a), WOODD)
        cz = (a + b) / 2
        for cy, r in ((-30, 5), (0, 7), (30, 5)):  # 菱形の鉄の金具(まん中は大きく、引き手)
            for k in range(-r, r + 1):
                h = 3 * (1 - abs(k) / (r + 0.5))
                m.paint(m.box(Wd - 1, Wd + 1, cy + k, cy + k + 1, cz - h, cz + h + 0.5), IRON)
        for cy in (-L + 5, L - 7):  # 角の三角の金具
            m.paint(m.box(Wd - 1, Wd, cy, cy + 2, b - 3, b), IRON)
    for z in (24, 34, 44, 54):  # 背板(-x の面): 横の板目
        m.paint(m.box(-Wd, -Wd + 1, -L, L, z, z + 1), WOODD)
    # 前の面(+y): ナンバーの板と STP のステッカー(スケッチ A: 板が上、STP が下)
    m.paint(m.box(-12, 12, L - 1, L, 40, 48), PLATE)
    for k in range(-9, 10):
        h = 5 * (1 - (k / 9.5) ** 2) ** 0.5
        m.paint(m.box(k, k + 1, L - 1, L, 28 - h, 28 + h), STPW)
        if abs(k) < 9: m.paint(m.box(k, k + 1, L - 1, L, 28 - h + 1, 28 + h - 1), STP)
    # 綱を通す鉄の環(前とうしろの面のまん中)
    for sy in (-1, 1):
        ring = m.cyl('x', sy * (L + 3), 38, 3.2, -1, 1) & ~m.cyl('x', sy * (L + 3), 38, 1.6, -1, 1)
        m.put(ring, IRON, '綱の環')
    # エンジン: 天板の前寄りに穴、V8 を沈める
    ey0, ey1 = 14, 40
    m.put(m.box(-12, 12, ey0, ey1, 50, 66), CHRD, 'V8')                          # ブロック(天板から 4 出る)
    for sx in (-1, 1):
        m.put(m.box(3 if sx > 0 else -12, 12 if sx > 0 else -3, ey0 + 2, ey1 - 2, 62, 69), CHR, 'V8')  # 左右のバンク
    m.put(m.cyl('y', 0, 58, 5, ey1, ey1 + 2), CHR, 'クランクの滑車')
    m.put(m.box(-7, 7, ey0 + 3, ey1 - 3, 66, 78), CHR, 'ブロアー')
    for z in range(68, 77, 2): m.paint(m.box(-7, 7, ey0 + 3, ey1 - 3, z, z + 1), CHRD)
    m.put(m.box(-8, 8, ey0 + 2, ey1 + 2, 78, 86), CHR, '吸気のスクープ')
    m.put(m.box(-6, 6, ey1 - 1, ey1 + 3, 79, 85), BLK, '吸気のスクープ')        # 口は前
    m.note(1, '箱(長さ 100、幅 44、高さ 46)。濃い木、柿渋のつや', (0, -20, 50))
    m.note(2, '引き出し 3 段(進む向きの左の横腹だけ)。菱形の鉄の金具 3 つずつ、角の三角の金具', (22, 0, 38))
    m.note(3, '前の面: ナンバーの板(上)と STP(下)', (0, 50, 30))
    m.note(4, '車輪 4 つ: 箱の下の四隅(外へ出さない)。直径 18、木に鉄の輪。車軸は横、長い向きに転がる', (15, 35, 9))
    m.note(5, 'すそ: 四隅の下にアーチの切り欠き。あいだにルーバー', (22, 0, 11))
    m.note(6, 'V8: 天板の前寄りの穴に沈める。上にブロアー', (0, 27, 66))
    m.note(7, '吸気のスクープ: 口は前', (0, 42, 82))
    m.note(8, '綱を通す鉄の環: 前とうしろの面のまん中', (0, 53, 38))
    return m

if __name__ == '__main__':
    import sys
    from PIL import Image
    from sheet import sheet
    m = build()
    ki = Image.open('/home/user/project/field/assets/worlds/lake/ki_walk.png').crop((0, 128, 64, 192)); ki = ki.crop(ki.getbbox())
    sheet(m, sys.argv[1] + '/sanmen_tansu.png', '三面図 04  車箪笥(D137)',
          '作者「たいやが側面にないの。下なの。」(D136)「機械設計の三面図ぐらいまで突き詰めてから外注に出すようにして」(D137)。1 マス = ゲームの 1 ドット',
          ['決まり: 前 = STP とナンバーの短い面(D122)。長い向きに転がる、引き出しは左の横腹だけ(D123)。車輪は箱の下(D136)',
           'PixelLab には、この下絵の形と部品だけを描かせる。足さない(D135)'], ki=ki)
    for k in ('o_w', 'o_e', 'o_s', 'o_n'):
        im, _ = m.view(k); im.save(sys.argv[1] + f'/tansu_{k}.png')
    print('ok')
