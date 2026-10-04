# 赤べこのホットロッドの三面図(D118 作者「イメージ通り」の初稿 field/assets/worlds/noroi/akabeko*.png を基準。D137)。
# 会津の張り子の牛が胴。箱形の赤い胴、横腹に金と黒の模様、背に黒い斑点。首は胴の前の穴に差してあって上下にゆれる。
# 背中から V8 とブロアー。太いタイヤ 4 つは胴の四隅の外(ホットロッド)。
from vox import Model, mat

RED = mat('candy', (196, 34, 30), 0.85); REDD = mat('candyd', (140, 22, 20), 0.5); GOLD = mat('gold', (220, 176, 70), 0.7)
BLK = mat('black', (26, 20, 20), 0.4); CHR = mat('chrome', (198, 206, 218), 0.95); CHRD = mat('chromed', (118, 126, 140), 0.6)
TIRE = mat('tire', (38, 34, 34), 0.15); RIM = mat('rim', (200, 160, 70), 0.6); WHT = mat('white', (240, 236, 226), 0.4)

def build(k=1):
    m = Model('akabeko', (int(-24 * k), int(24 * k)), (int(-30 * k), int(36 * k)), (0, int(44 * k)))
    # 胴(張り子の箱形、角は丸い)
    body = m.box(-12 * k, 12 * k, -22 * k, 18 * k, 8 * k, 24 * k)
    rr = 3 * k
    for sx in (-1, 1):
        for sz, zc in ((1, 24 * k - rr), (-1, 8 * k + rr)):
            corner = (m.X * sx > 12 * k - rr) & ((m.Z - zc) * sz > 0)
            keep = ((m.X * sx - (12 * k - rr)) ** 2 + (m.Z - zc) ** 2) <= rr * rr
            body &= ~(corner & ~keep)
    m.put(body, RED, '胴')
    for sx in (-1, 1):  # 横腹の金と黒の模様
        m.paint(m.box(sx * 11 * k - 1 * k, sx * 11 * k + 1 * k + 1, -18 * k, 14 * k, 13 * k, 20 * k) & (m.X * sx > 11 * k), GOLD)
        for yy in range(-17, 14, 4):
            m.paint(m.box(-13 * k, 13 * k, yy * k, (yy + 2) * k, 14 * k, 19 * k) & (m.X * sx > 11 * k), BLK)
    for (yy, xx) in ((-14, -5), (-8, 6), (4, -6), (10, 4)):  # 背の黒い斑点
        m.paint(m.cyl('z', xx * k, yy * k, 2 * k, 23 * k, 25 * k), BLK)
    # 首と頭(胴の前の穴に差してある。上下にゆれる)
    m.put(m.cyl('y', 0, 18 * k, 4 * k, 16 * k, 22 * k), REDD, '首')
    m.put(m.ell(0, 25 * k, 17 * k, 8 * k, 8 * k, 7 * k), RED, '頭')
    m.put(m.ell(0, 31 * k, 14 * k, 6 * k, 3.5 * k, 4.5 * k), RED, '頭')
    for sx in (-1, 1):
        m.put(m.pipe((sx * 5 * k, 24 * k, 23 * k), (sx * 8 * k, 23 * k, 27 * k), 1.3 * k), REDD, '角')
        m.paint(m.ell(sx * 6.5 * k, 28 * k, 19 * k, 1.5 * k, 1.5 * k, 1.5 * k), WHT)
        m.paint(m.ell(sx * 7 * k, 28.5 * k, 19 * k, 1 * k, 1 * k, 1 * k), BLK)
    m.paint(m.ell(0, 30 * k, 15 * k, 7 * k, 3 * k, 1.2 * k), GOLD)  # 口のまわりの金の線
    # エンジン(背中から)
    m.put(m.box(-8 * k, 8 * k, -10 * k, 6 * k, 22 * k, 30 * k), CHRD, 'V8')
    m.put(m.box(-10 * k, -3 * k, -9 * k, 5 * k, 27 * k, 32 * k) | m.box(3 * k, 10 * k, -9 * k, 5 * k, 27 * k, 32 * k), CHR, 'V8')
    m.put(m.box(-6 * k, 6 * k, -7 * k, 4 * k, 32 * k, 40 * k), CHR, 'ブロアー')
    for z in range(33, 40, 2): m.paint(m.box(-6 * k, 6 * k, -7 * k, 4 * k, z * k, (z + 1) * k), CHRD)
    m.put(m.box(-7 * k, 7 * k, -6 * k, 6 * k, 40 * k, 44 * k), CHR, '吸気のスクープ')
    m.put(m.box(-5 * k, 5 * k, 5 * k, 7 * k, 41 * k, 43 * k), BLK, '吸気のスクープ')
    for sx in (-1, 1):  # 排気の管(左右 4 本、上とうしろへ)
        for yy in (-8, -4, 0, 4):
            m.put(m.pipe((sx * 9 * k, yy * k, 27 * k), (sx * 15 * k, (yy - 4) * k, 33 * k), 1.2 * k), CHR, '排気の管')
    # 太いタイヤ(胴の四隅の外)
    for sx in (-1, 1):
        for cy, r, w in ((-15 * k, 9 * k, 9 * k), (13 * k, 8 * k, 7 * k)):
            x0 = 12.5 * k if sx > 0 else -12.5 * k - w
            m.put(m.cyl('x', cy, r, r, x0, x0 + w), TIRE, 'タイヤ')
            xf = x0 + w - 1 * k if sx > 0 else x0
            m.put(m.cyl('x', cy, r, r * 0.55, xf, xf + 1.2 * k), RIM, 'タイヤ')
            m.put(m.cyl('x', cy, r, r * 0.2, xf - 0.5 * k, xf + 1.7 * k), CHR, 'タイヤ')
    m.note(1, '胴: 会津の張り子の牛。箱形、角は丸い。キャンディレッドのつや。横腹に金と黒の模様、背に黒い斑点', (12, -4, 16))
    m.note(2, '首と頭: 胴の前の穴に差してある(首振り)。小さな角、白目に黒い目、口のまわりに金の線', (0, 30, 20))
    m.note(3, 'V8 とブロアー: 背中から。吸気のスクープの口は前', (0, 0, 40))
    m.note(4, '排気の管: 左右 4 本ずつ、上とうしろへ', (15, -6, 33))
    m.note(5, 'タイヤ 4 つ: 胴の四隅の外。うしろは太く大きい(直径 18)、前は直径 16', (21, -15, 9))
    return m

if __name__ == '__main__':
    import sys
    from PIL import Image
    from sheet import sheet
    m = build(1)
    ki = Image.open('/home/user/project/field/assets/worlds/lake/ki_walk.png').crop((0, 128, 64, 192)); ki = ki.crop(ki.getbbox())
    sheet(m, sys.argv[1] + '/sanmen_akabeko.png', '三面図 05  赤べこのホットロッド(D137)',
          '作者「赤べこと車ダンスはとてもイメージ通り」(D118)の初稿を基準に。1 マス = ゲームの 1 ドット',
          ['競争の画面では 2 倍(k = 2)。発進で鼻を上げる(ウィリー)、首がゆれる'], ki=ki)
    for kk, nm in ((1, ''), (2, '_x2')):
        mm = build(kk)
        for v in ('o_w', 'o_e', 'o_s', 'o_n', 'rear'):
            im, _ = mm.view(v); im.save(sys.argv[1] + f'/akabeko{nm}_{v}.png')
    print('ok')
