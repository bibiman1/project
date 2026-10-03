# ぼぎカーの三面図(D119、D122、D123、D137)。部品の写真(pic/c1fd15f2.jpg)から取った板の輪郭(settei/plank.json)。
# 前 = 目穴のある高いはし(写真の左)。写真の穴: 目穴 1 つ、ボルトの穴 2 つ(車軸)。
# 厚み(x)は きーの幅くらい(30)。白いナイロンの戸車 4 つ、長いボルトが車軸で、戸車は板の両はし(板の外)。目穴は板をつらぬく。
# k = 大きさの倍率(1 = マップ、2 = 競争の画面)
import json, math
from vox import Model, mat

WAL = mat('walnut', (92, 54, 34), 0.45); WALD = mat('walnutd', (70, 40, 26), 0.3)
NYL = mat('nylon', (236, 236, 228), 0.35); NYLD = mat('nylond', (196, 196, 188), 0.2)
STL = mat('steel', (150, 156, 166), 0.7); HOLE = mat('hole', (26, 16, 10))
P = json.load(open('/home/user/project/docs/assets/noroi/settei/plank.json'))

def build(k=1):
    L = 64 * k; s = L / (776 - 95)
    # 写真の座標 → (y = 前が +、z = 上が +)。前のはし(写真 x=95)を y = L/2
    holes = P['holes']; (ex, ey, _), (ax1, ay1, _), (ax2, ay2, _) = holes
    # 車軸 2 本が同じ高さになるよう、わずかに傾ける
    ang = math.atan2((ay2 - ay1), (ax2 - ax1))
    def tf(px, py):
        x = px - ax1; y = py - ay1
        xr = x * math.cos(-ang) - y * math.sin(-ang); yr = x * math.sin(-ang) + y * math.cos(-ang)
        return xr, yr
    R = 5.5 * k                       # 戸車の半径
    xr0 = min(tf(px, py)[0] for px, py in P['poly'])   # 前のはし
    def to_m(px, py):
        xr, yr = tf(px, py)
        return (L / 2 - (xr - xr0) * s, R - yr * s)
    poly = [to_m(px, py) for px, py in P['poly']]
    W = 15 * k
    m = Model('bogicar', (-int(W + 6 * k), int(W + 6 * k)), (-int(L / 2 + 4), int(L / 2 + 4)), (0, int(30 * k)))
    body = m.prism_x(poly, -W, W)
    m.put(body, WAL, '板')
    # 角を丸める(上の左右のふち)
    import numpy as np
    zt = np.where(body, m.Z, -1).max(axis=2, keepdims=True)
    r = 3.5 * k
    edge = (np.abs(m.X) > W - r) & (m.Z > zt - r)
    keep = ((np.abs(m.X) - (W - r)) ** 2 + (m.Z - (zt - r)) ** 2) <= r * r
    m.put(body & edge & ~keep, None, None)
    zb = np.where(body, m.Z, 1e9).min(axis=2, keepdims=True)
    edgeb = (np.abs(m.X) > W - r) & (m.Z < zb + r)
    keepb = ((np.abs(m.X) - (W - r)) ** 2 + (m.Z - (zb + r)) ** 2) <= r * r
    m.put(body & edgeb & ~keepb, None, None)
    # 木目(横の面に、長い向きの筋)
    for zz in range(int(3 * k), int(26 * k), int(3 * k)):
        m.paint(m.box(-W - 1, -W + 1, -L, L, zz, zz + 1) | m.box(W - 1, W + 1, -L, L, zz, zz + 1), WALD)
    # 目穴(板をつらぬく)
    ey_, ez_ = to_m(ex, ey)
    m.put(m.cyl('x', ey_, ez_, 2.2 * k, -W - 1, W + 1), None, None)
    m.put(m.cyl('x', ey_, ez_, 2.2 * k, -W + 2 * k, W - 2 * k), HOLE, '目穴')
    # 車軸(長いボルト)と戸車(板の両はし)
    for px, py in ((ax1, ay1), (ax2, ay2)):
        ay_, az_ = to_m(px, py)
        m.put(m.cyl('x', ay_, az_, 1.0 * k, -W - 5 * k, W + 5 * k), STL, 'ボルト')
        for sx in (-1, 1):
            x0 = W + 0.5 * k if sx > 0 else -W - 4.5 * k
            m.put(m.cyl('x', ay_, az_, R, x0, x0 + 4 * k), NYL, '戸車')
            m.put(m.cyl('x', ay_, az_, R - 1.5 * k, x0, x0 + 4 * k) & (m.X * sx > W + 3.5 * k), NYLD, '戸車')
            m.put(m.cyl('x', ay_, az_, 1.6 * k, x0 - 0.5 * k, x0 + 4.5 * k), STL, 'ボルト')
    m.ki_pos = to_m(430, 118)          # きーが立つ所(顔のうしろのくぼみ)
    m.note(1, '板: 一枚の反った濃い茶の木(くるみ材風、柿渋のつや)。全長 64、厚み 30(きーの幅)。角は丸い', (0, -10, 14))
    m.note(2, '前 = 目穴のある高いはし。前の縁はへさきのようにうしろへ流れる(垂直の面はない)', (0, 26, 18))
    m.note(3, '目穴: 板を横につらぬく(両側に目)', (W, ey_, ez_))
    m.note(4, '戸車 4 つ: 白いナイロン。板の両はし、板の外。直径 11', (W + 3, to_m(ax1, ay1)[0], R))
    m.note(5, '車軸: 長いボルト 2 本。戸車はボルトの頭とナットで留める', (W + 5, to_m(ax2, ay2)[0], R))
    m.note(6, 'きーが立つ所: 顔のうしろの低いくぼみ。加速するとつぶれて背中に張り付く(粘着駆動 D123)', (0, m.ki_pos[0], m.ki_pos[1]))
    return m

if __name__ == '__main__':
    import sys
    from PIL import Image
    from sheet import sheet
    m = build(1)
    ki = Image.open('/home/user/project/field/assets/worlds/lake/ki_walk.png').crop((0, 128, 64, 192)); ki = ki.crop(ki.getbbox())
    sheet(m, sys.argv[1] + '/sanmen_bogicar.png', '三面図 01  ぼぎカー(D137)',
          '部品の写真の板の輪郭から。前 = 目穴の高いはし(D119)。厚み = きーの幅(D122)。無慣性粘着駆動(D123)。1 マス = ゲームの 1 ドット',
          ['競争の画面では 2 倍(k = 2)で組み、きーは歩きの絵の向こう向きを 2 倍で重ねる(D134)'], ki=ki)
    for kk, nm in ((1, ''), (2, '_x2')):
        mm = build(kk)
        for v in ('o_w', 'o_e', 'o_s', 'o_n', 'rear'):
            im, _ = mm.view(v); im.save(sys.argv[1] + f'/bogicar{nm}_{v}.png')
    print('ok')
