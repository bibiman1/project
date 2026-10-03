# 霞ヶ浦の前後の重なり(2026-10-03、作者「重ね合わせみてね」)
# 床に立つ物を背景の絵から切り出す(fg_<map>.png)。きーとの前後は worlds.js で足もとの y で決める
# 切り出し方: r = 長方形、p = 多角形、l = 線、a = だ円の弧、g = 箱のふちから地面を塗り広げて(となりの色との差が tol 未満なら地面)、塗れなかった所。小さなかけらは捨てる
from collections import deque
import numpy as np
from PIL import Image, ImageDraw
A = '/home/user/project/field/assets/worlds/kasumi/'
CHK = '/tmp/claude-0/-home-user-project/e7cb1a9b-b078-5ece-9cdf-0647f5a9d6fa/scratchpad/'

def outlined(px, box, dark):
    x0, y0, x1, y1 = box
    wall = px[y0:y1, x0:x1, :3].astype(int).max(axis=2) < dark
    h, w = wall.shape
    out = np.zeros((h, w), bool)
    q = deque((y, x) for y in range(h) for x in (0, w - 1) if not wall[y, x])
    q.extend((y, x) for x in range(w) for y in (0, h - 1) if not wall[y, x])
    for y, x in q: out[y, x] = True
    while q:
        y, x = q.popleft()
        for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= yy < h and 0 <= xx < w and not out[yy, xx] and not wall[yy, xx]:
                out[yy, xx] = True; q.append((yy, xx))
    return ~out

def grown(px, box, tol, keep=60):
    x0, y0, x1, y1 = box
    sub = px[y0:y1, x0:x1, :3].astype(int)
    h, w = sub.shape[:2]
    out = np.zeros((h, w), bool)
    q = deque([(y, x) for y in range(h) for x in (0, w - 1)] + [(y, x) for x in range(w) for y in (0, h - 1)])
    for y, x in q: out[y, x] = True
    while q:
        y, x = q.popleft()
        for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= yy < h and 0 <= xx < w and not out[yy, xx] and np.abs(sub[yy, xx] - sub[y, x]).sum() < tol:
                out[yy, xx] = True; q.append((yy, xx))
    obj = ~out
    seen = np.zeros_like(obj); res = np.zeros_like(obj)
    for sy in range(h):
        for sx in range(w):
            if obj[sy, sx] and not seen[sy, sx]:
                comp = [(sy, sx)]; seen[sy, sx] = True; i = 0
                while i < len(comp):
                    y, x = comp[i]; i += 1
                    for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                        if 0 <= yy < h and 0 <= xx < w and obj[yy, xx] and not seen[yy, xx]:
                            seen[yy, xx] = True; comp.append((yy, xx))
                if len(comp) >= keep:
                    for y, x in comp: res[y, x] = True
    return res

def cut(key, shapes):
    bg = Image.open(A + f'bg_{key}.png').convert('RGBA')
    px = np.array(bg)
    H, W = px.shape[:2]
    m = np.zeros((H, W), bool)
    for s in shapes:
        kind, box = s[0], s[1]
        if kind in 'rp':
            pm = Image.new('L', (W, H), 0); d = ImageDraw.Draw(pm)
            (d.rectangle if kind == 'r' else d.polygon)(box, fill=255)
            m |= np.array(pm) > 0
        elif kind == 'a':   # だ円の弧(box, 太さ, 始まりの角度, 終わりの角度)
            pm = Image.new('L', (W, H), 0); ImageDraw.Draw(pm).arc(box, s[3], s[4], fill=255, width=s[2])
            m |= np.array(pm) > 0
        elif kind == 'l':
            pm = Image.new('L', (W, H), 0); ImageDraw.Draw(pm).line(box, fill=255, width=s[2])
            m |= np.array(pm) > 0
        elif kind == 'o':
            x0, y0, x1, y1 = box
            m[y0:y1, x0:x1] |= outlined(px, box, s[2])
        elif kind == 't':   # 木: 地面を塗り広げたあと、根の広がり(幹より下の、幹の外)を外す
            x0, y0, x1, y1 = box
            g = grown(px, box, s[2])
            yy, xx = np.mgrid[y0:y1, x0:x1]
            g &= ~((yy > 168) & ((xx < 347) | (xx > 364)))
            m[y0:y1, x0:x1] |= g
        elif kind == 'gp':  # g と同じ塗り広げを、多角形の中だけに
            x0, y0, x1, y1 = box
            pm = Image.new('L', (W, H), 0); ImageDraw.Draw(pm).polygon(s[3], fill=255)
            m[y0:y1, x0:x1] |= grown(px, box, s[2]) & (np.array(pm)[y0:y1, x0:x1] > 0)
        elif kind == 'g':
            x0, y0, x1, y1 = box
            m[y0:y1, x0:x1] |= grown(px, box, s[2])
        elif kind == 'c':   # 地面の色(ref)から離れた色だけ
            x0, y0, x1, y1 = box
            sub = px[y0:y1, x0:x1, :3].astype(int)
            ref = np.array(s[2])
            m[y0:y1, x0:x1] |= np.abs(sub - ref).sum(axis=2) > s[3]
    fg = px.copy(); fg[..., 3] = np.where(m, px[..., 3], 0)
    Image.fromarray(fg).save(A + f'fg_{key}.png')
    chk = px.copy(); chk[m, 0] = 255; chk[m, 1] //= 2
    Image.fromarray(chk).save(CHK + f'fgk_{key}.png')

if __name__ == '__main__':
    cut('shore', [
        ('r', (463, 500, 488, 555)), ('r', (533, 500, 559, 555)),   # 門柱 2 本(あいだは道。看板ではない)
        ('r', (603, 489, 709, 557)),                                                         # 衛兵所
        ('r', (799, 318, 877, 341)), ('r', (801, 338, 871, 373)),                            # 見張り台の屋根と見張り所
        ('r', (801, 338, 808, 459)), ('r', (811, 370, 817, 479)), ('r', (849, 370, 856, 461)), ('r', (857, 370, 864, 477)),   # 脚
        ('l', [(817, 377), (862, 417), (817, 457)], 4),                                      # すじかい
        ('r', (941, 320, 949, 453)), ('p', [(946, 318), (1012, 322), (1012, 345), (946, 340)]),   # 吹き流し
    ])
    cut('hangar', [
        ('gp', (318, 86, 392, 182), 60, [(355, 87), (340, 91), (330, 99), (324, 111), (323, 125), (329, 135), (344, 143), (350, 150), (360, 150), (368, 142), (382, 133), (388, 120), (386, 105), (377, 94), (366, 88)]),   # 木の葉: 葉の形の中で、地面を塗り広げて残った所(葉のすきまから、うしろのきーが顔を出す。光の筋は入れない。2026-10-03、作者「ここおかしい」「キーが葉っぱから顔を出すのはのこしてほしい」)
        ('r', (349, 140, 362, 179)),          # 幹(地面に広がる根は入れない)
        ('g', (156, 186, 258, 234), 60),      # 整備台
        ('g', (266, 200, 416, 272), 60),      # ゴンドラ
    ])
    cut('cabin', [
        ('g', (98, 30, 154, 152), 60),        # 酸素ボンベの架台
        ('g', (163, 90, 222, 166), 60),       # 機関士の座席
        ('g', (268, 30, 344, 166), 60),       # 通信機の台と腰掛け
        ('g', (381, 8, 427, 156), 60),        # ロッカー
    ])
    cut('cockpit', [
        ('g', (44, 70, 132, 198), 24),        # 機長席(ミイラさま)
        ('g', (188, 94, 278, 198), 24),       # 右の席
    ])
    print('ok')
