# こけしのカフェレーサーの三面図(D119、設計図 05、D137)。初稿 field/assets/worlds/noroi/kokeshi*.png を土台に。
# 1960 年代イギリスのカフェレーサー。クリップオンの低いハンドル、小さな風よけ、ひざのへこんだタンク(ろくろの輪と菊)、
# こぶのある一人乗りの座席と丸いゼッケン、はね上げたメガホンの排気管(メッキ)、うしろ寄りの足のせ、アルミのリムと細いスポーク。
# 乗り手のこけしは手足がないので、胴をタンクに沿わせて伏せ、頭をハンドルの上に出す。
from vox import Model, mat

RED = mat('lacq', (192, 40, 34), 0.75); GOLD = mat('gold', (220, 176, 70), 0.6); BLK = mat('black', (26, 22, 22), 0.4)
CHR = mat('chrome', (200, 208, 220), 0.95); ALU = mat('alu', (176, 182, 190), 0.6); TIRE = mat('tire', (36, 34, 34), 0.15)
WOOD = mat('wood', (232, 206, 160), 0.4); HAIR = mat('hair', (20, 18, 18), 0.5); WHT = mat('white', (240, 236, 226), 0.3)
ENG = mat('engine', (120, 124, 130), 0.5); SCR = mat('screen', (190, 220, 240), 0.9)

def build(k=1):
    m = Model('kokeshi', (int(-10 * k), int(10 * k)), (int(-36 * k), int(36 * k)), (0, int(46 * k)))
    for cy in (-22 * k, 22 * k):  # 車輪: アルミのリム、細いスポーク
        m.put(m.cyl('x', cy, 12 * k, 12 * k, -2 * k, 2 * k) & ~m.cyl('x', cy, 12 * k, 9.5 * k, -3 * k, 3 * k), TIRE, '車輪')
        m.put(m.cyl('x', cy, 12 * k, 9.5 * k, -1.5 * k, 1.5 * k) & ~m.cyl('x', cy, 12 * k, 8.5 * k, -3 * k, 3 * k), ALU, '車輪')
        for a in range(0, 180, 30):
            import math
            dy, dz = math.cos(math.radians(a)) * 8.5 * k, math.sin(math.radians(a)) * 8.5 * k
            m.put(m.pipe((0, cy - dy, 12 * k - dz), (0, cy + dy, 12 * k + dz), 0.6 * k), ALU, '車輪')
        m.put(m.cyl('x', cy, 12 * k, 2 * k, -2.5 * k, 2.5 * k), ALU, '車輪')
    # フレームとフォーク
    m.put(m.pipe((0, 22 * k, 12 * k), (0, 15 * k, 30 * k), 1.0 * k), CHR, 'フォーク')
    m.put(m.pipe((0, 15 * k, 30 * k), (0, -16 * k, 26 * k), 0.9 * k) | m.pipe((0, -16 * k, 26 * k), (0, -22 * k, 12 * k), 0.9 * k), BLK, 'フレーム')
    m.put(m.box(-5 * k, 5 * k, -6 * k, 8 * k, 6 * k, 20 * k), ENG, 'エンジン(単気筒)')
    for z in range(10, 20, 2): m.paint(m.box(-5.5 * k, 5.5 * k, -4 * k, 6 * k, z * k, (z + 1) * k), ALU)
    # タンク(ひざのへこみ、ろくろの輪と菊)
    tank = m.ell(0, 5 * k, 27 * k, 6 * k, 10 * k, 5 * k) & ~(m.ell(0, 0, 25 * k, 9 * k, 3 * k, 3 * k) & (abs(m.X) > 4.5 * k))
    m.put(tank, RED, 'タンク')
    m.paint(tank & ((m.Y.astype(int) % max(2, int(4 * k))) == 0), GOLD)
    # 座席(こぶ)とゼッケン
    m.put(m.box(-4 * k, 4 * k, -18 * k, -6 * k, 25 * k, 28 * k), BLK, '座席')
    m.put(m.ell(0, -18 * k, 28 * k, 4 * k, 4 * k, 4 * k) & (m.Z > 25 * k), RED, '座席のこぶ')
    for sx in (-1, 1):
        m.paint(m.cyl('x', -18 * k, 28 * k, 2.5 * k, sx * 3 * k - 2 * k, sx * 3 * k + 2 * k) & (m.X * sx > 3 * k), WHT)
    # メガホンの排気管(右、はね上げ)
    m.put(m.pipe((-5 * k, 6 * k, 10 * k), (-6 * k, -6 * k, 9 * k), 1.2 * k) | m.pipe((-6 * k, -6 * k, 9 * k), (-6 * k, -26 * k, 20 * k), 1.6 * k), CHR, 'メガホンの排気管')
    m.put(m.pipe((-6 * k, -22 * k, 18 * k), (-6 * k, -30 * k, 22 * k), 2.6 * k), CHR, 'メガホンの排気管')
    # クリップオンのハンドルと小さな風よけ
    m.put(m.pipe((-7 * k, 15 * k, 30 * k), (7 * k, 15 * k, 30 * k), 0.7 * k), CHR, 'クリップオン')
    m.put(m.box(-3 * k, 3 * k, 17 * k, 18 * k, 31 * k, 36 * k), SCR, '風よけ')
    for sx in (-1, 1): m.put(m.pipe((sx * 3 * k, -10 * k, 14 * k), (sx * 6 * k, -10 * k, 14 * k), 0.6 * k), CHR, '足のせ')
    # こけし(伏せる): 胴はタンクに沿い、頭はハンドルの上
    m.put(m.cyl('y', 0, 33 * k, 4.5 * k, -12 * k, 10 * k), RED, 'こけしの胴')
    m.paint(m.cyl('y', 0, 33 * k, 4.6 * k, -12 * k, 10 * k) & ((m.Y.astype(int) % max(3, int(6 * k))) == 0), GOLD)
    m.put(m.ell(0, 15 * k, 36 * k, 6 * k, 6 * k, 6 * k), WOOD, 'こけしの頭')
    m.paint(m.ell(0, 14 * k, 37.5 * k, 6.3 * k, 6.3 * k, 5.5 * k) & ((m.Y < 15 * k) | (m.Z > 38 * k)), HAIR)
    m.note(1, 'こけし: 手足がないので胴をタンクに沿わせて伏せ、頭をハンドルの上へ(風の抵抗を減らす)', (0, 0, 37))
    m.note(2, 'タンク: 赤い漆、ろくろの輪と菊。ひざの当たる所をへこませる', (6, 5, 27))
    m.note(3, '座席: こぶのある一人乗り、丸い白いゼッケン', (4, -18, 28))
    m.note(4, 'メガホンの排気管: 右、うしろへはね上げる(メッキ)', (-6, -28, 21))
    m.note(5, 'クリップオンの低いハンドル、小さな風よけ', (7, 16, 31))
    m.note(6, '車輪: アルミのリムと細いスポーク(直径 24)', (2, 22, 12))
    m.note(7, 'エンジン: 単気筒(パラララ)', (5, 0, 14))
    return m

if __name__ == '__main__':
    import sys
    from PIL import Image
    from sheet import sheet
    m = build(1)
    ki = Image.open('/home/user/project/field/assets/worlds/lake/ki_walk.png').crop((0, 128, 64, 192)); ki = ki.crop(ki.getbbox())
    sheet(m, sys.argv[1] + '/sanmen_kokeshi.png', '三面図 06  こけしのカフェレーサー(D137)',
          '作者「こけしバイクはとてもいいのでのこす。でもカスタムカフェレーサーなのでかっこよくモディファイ」(D119)。1 マス = ゲームの 1 ドット',
          ['競争には出ない(反対の山で赤べこに負ける)'], ki=ki)
    for v in ('o_w', 'o_e', 'o_s', 'o_n'):
        im, _ = m.view(v); im.save(sys.argv[1] + f'/kokeshi_{v}.png')
    print('ok')
