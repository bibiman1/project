# とりぼぎかーの三面図(D120、D121、D129、D137)。実物の写真 docs/assets/noroi/ref/toribogi/(設計図 03 第 3 版)。
# 前: 親鴨の引き車。とっくり形の胴(うしろがくびれて平たい端で桶に当たる)、橙に赤い胸、金と黒の羽、濃い緑茶の玉の頭に赤い輪の目、
#     桃色の短い円柱のくちばし。胴の下に針金の二又と小さな木の円盤の車輪 1 つ。金色の組ひもは針金に結ぶ(グレートアトラクターへ)。
# うしろ: 橙の円筒の桶(上のふちに黒い輪)。中に一段低い円い台と小さな円盤(回転台)。子がも 2 羽(黄土色、とがったくちばし、
#     ほおに赤いぼかし、黒い点の目、お尻に丸い穴 = 吸気口 D121)、別々の向き。
#     桶の下に横の車軸、両はしに大きな木の車輪 2 つ(黒いふち)、車軸のまん中に段つきの糸巻き。三輪。
import math
from vox import Model, mat

ORG = mat('orange', (228, 120, 36), 0.5); RED = mat('red', (200, 52, 40), 0.5); GOLD = mat('gold', (214, 170, 60), 0.6)
BLK = mat('black', (24, 22, 22), 0.4); OLV = mat('olive', (78, 82, 40), 0.55); PINK = mat('pink', (236, 170, 160), 0.3)
OCH = mat('ochre', (204, 168, 90), 0.4); WOOD = mat('wood', (196, 156, 102), 0.3); WOODD = mat('woodd', (150, 112, 70), 0.2)
WIRE = mat('wire', (170, 172, 176), 0.6); CHEEK = mat('cheek', (226, 120, 110), 0.2); STR = mat('string', (230, 196, 80), 0.4)
WHT = mat('white', (240, 236, 226), 0.3)

def build(k=1):
    m = Model('tori', (int(-22 * k), int(22 * k)), (int(-30 * k), int(56 * k)), (0, int(48 * k)))
    # 桶
    ty, R = -12 * k, 14 * k
    m.put(m.cyl('z', 0, ty, R, 9 * k, 30 * k), ORG, '桶')
    m.put(m.cyl('z', 0, ty, R - 2 * k, 14 * k, 31 * k), None, None)
    m.put(m.cyl('z', 0, ty, R + 1 * k, 27 * k, 31 * k) & ~m.cyl('z', 0, ty, R - 2 * k, 0, 99), BLK, '黒い輪')
    m.put(m.cyl('z', 0, ty, R - 2 * k, 14 * k, 21 * k), WOODD, '台')
    m.put(m.cyl('z', 0, ty, 6 * k, 21 * k, 23 * k), WOOD, '回転台')
    # 子がも 2 羽(別々の向き)
    for ang, side in ((math.radians(20), 1), (math.radians(200), -1)):
        cx = 4.5 * k * math.cos(ang); cy = ty + 4.5 * k * math.sin(ang)
        fx, fy = -math.sin(ang), math.cos(ang)           # くちばしの向き(円の接線)
        m.put(m.ell(cx, cy, 27 * k, 4 * k, 4 * k, 4.5 * k), OCH, '子がも')
        hx, hy = cx + fx * 1.5 * k, cy + fy * 1.5 * k
        m.put(m.ell(hx, hy, 34 * k, 3.2 * k, 3.2 * k, 3.8 * k), OCH, '子がも')
        m.put(m.pipe((hx + fx * 2.5 * k, hy + fy * 2.5 * k, 34 * k), (hx + fx * 6 * k, hy + fy * 6 * k, 34 * k), 1.0 * k), OCH, '子がものくちばし')
        m.put(m.ell(cx - fx * 3.8 * k, cy - fy * 3.8 * k, 27 * k, 1.6 * k, 1.6 * k, 1.6 * k), BLK, 'お尻の穴')
        for s2 in (-1, 1):
            px_, py_ = -fy * s2, fx * s2
            m.paint(m.ell(hx + px_ * 2.6 * k + fx * 1.2 * k, hy + py_ * 2.6 * k + fy * 1.2 * k, 33 * k, 1.3 * k, 1.3 * k, 1.0 * k), CHEEK)
            m.paint(m.ell(hx + px_ * 2.8 * k + fx * 1.6 * k, hy + py_ * 2.8 * k + fy * 1.6 * k, 35 * k, 0.7 * k, 0.7 * k, 0.7 * k), BLK)
    # 桶の車軸と車輪 2 つ、糸巻き
    m.put(m.cyl('x', ty, 6 * k, 1.1 * k, -17 * k, 17 * k), WIRE, '車軸')
    for sx in (-1, 1):
        x0 = 13 * k if sx > 0 else -17 * k
        m.put(m.cyl('x', ty, 6 * k, 6 * k, x0, x0 + 4 * k), BLK, '車輪')
        m.put(m.cyl('x', ty, 6 * k, 5 * k, x0, x0 + 4 * k), WOOD, '車輪')
        m.put(m.cyl('x', ty, 6 * k, 3 * k, x0 - 0.3 * k, x0 + 4.3 * k) & ~m.cyl('x', ty, 6 * k, 2.4 * k, -99, 99), WOODD, '車輪')
    m.put(m.cyl('x', ty, 6 * k, 3.4 * k, -2 * k, 2 * k), WOOD, '糸巻き')
    m.put(m.cyl('x', ty, 6 * k, 2.4 * k, -3.5 * k, 3.5 * k), WOODD, '糸巻き')
    # 親鴨(とっくり形の胴)
    by = 18 * k
    body = m.ell(0, by + 4 * k, 14 * k, 8 * k, 14 * k, 9 * k)
    neck = m.cyl('y', 0, 14 * k, 5 * k, 2 * k, by)
    m.put(body | neck, ORG, '親鴨の胴')
    m.paint(body & (m.Y > by + 9 * k) & (m.Z < 17 * k), RED)                           # 赤い胸
    for sx in (-1, 1):                                                               # 金と黒の羽(横腹)
        wing = m.ell(sx * 7.5 * k, by + 1 * k, 17 * k, 2.5 * k, 8 * k, 4 * k)
        m.paint(wing, GOLD)
        m.paint(wing & ((m.Y.astype(int) // max(1, int(2 * k))) % 2 == 0) & (m.Z < 17 * k), BLK)
    m.put(m.ell(0, by + 14 * k, 27 * k, 6.5 * k, 6.5 * k, 6.5 * k), OLV, '親鴨の頭')
    for sx in (-1, 1):
        m.paint(m.ell(sx * 6 * k, by + 15 * k, 28 * k, 1.6 * k, 2.2 * k, 2.2 * k), RED)
        m.paint(m.ell(sx * 6.3 * k, by + 15 * k, 28 * k, 1.2 * k, 1.0 * k, 1.0 * k), BLK)
    m.put(m.cyl('y', 0, 27 * k, 1.8 * k, by + 19 * k, by + 25 * k), PINK, 'くちばし')
    # 針金の二又と小さな車輪
    for sx in (-1, 1):
        m.put(m.pipe((sx * 2 * k, by + 10 * k, 7 * k), (sx * 2 * k, by + 13 * k, 3 * k), 0.6 * k), WIRE, '針金の二又')
    m.put(m.cyl('x', by + 13 * k, 3 * k, 3 * k, -1.2 * k, 1.2 * k), WOOD, '小さな車輪')
    m.put(m.pipe((0, by + 12 * k, 6 * k), (0, 55 * k, 30 * k), 0.5 * k), STR, '組ひも')
    m.note(1, '親鴨の引き車: とっくり形の胴、橙に赤い胸、金と黒の羽。うしろはくびれて平たい端で桶に当たる', (8, 22, 16))
    m.note(2, '頭: 濃い緑茶の玉、赤い輪の目。くちばしは桃色の短い円柱', (0, 32, 31))
    m.note(3, '針金の二又と小さな木の円盤の車輪 1 つ(三輪の前)', (2, 31, 3))
    m.note(4, '金色の組ひも: 針金に結ぶ。空のかなたのグレートアトラクターへのびる(重力トラクター)', (0, 45, 20))
    m.note(5, '桶: 橙の円筒、上のふちに黒い輪。中に一段低い台と回転台', (14, -12, 20))
    m.note(6, '子がも 2 羽: 回転台の上、別々の向き。くちばしから噴いて台が回る。お尻に丸い穴(吸気口)', (0, -12, 34))
    m.note(7, '桶の車軸: 両はしに大きな木の車輪 2 つ(黒いふち)、まん中に段つきの糸巻き', (17, -12, 6))
    return m

if __name__ == '__main__':
    import sys
    from PIL import Image
    from sheet import sheet
    m = build(1)
    ki = Image.open('/home/user/project/field/assets/worlds/lake/ki_walk.png').crop((0, 128, 64, 192)); ki = ki.crop(ki.getbbox())
    sheet(m, sys.argv[1] + '/sanmen_tori.png', '三面図 03  とりぼぎかー(D137)',
          '実物の写真から(D129)。作者「とりぼぎかー、小鴨二匹だった。訂正。写真を生かしてデザインして。設定資料は踏襲。」1 マス = ゲームの 1 ドット',
          ['競争の画面では 2 倍(k = 2)'], ki=ki)
    for kk, nm in ((1, ''), (2, '_x2')):
        mm = build(kk)
        for v in ('o_w', 'o_e', 'o_s', 'o_n', 'rear'):
            im, _ = mm.view(v); im.save(sys.argv[1] + f'/tori{nm}_{v}.png')
    print('ok')
