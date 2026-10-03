# 三面図の道具(D137)。マシンを 1 ドット = ゲームの 1 ドットの立体(ボクセル)で組み、
# 正面・側面・上面の三面図と、ゲームの向きの下絵を、同じ立体から投影する(どの図でも部品の位置が一致する)。
# 座標: x = マシンの左(+)、y = 前(+)、z = 上(+)。地面は z = 0。
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

MATS = {}  # name -> (rgb, gloss 0..1)
def mat(name, rgb, gloss=0.0):
    MATS[name] = (rgb, gloss)
    return name

class Model:
    def __init__(self, name, xr, yr, zr):
        self.name = name
        self.x0, self.y0, self.z0 = xr[0], yr[0], zr[0]
        self.shape = (xr[1] - xr[0], yr[1] - yr[0], zr[1] - zr[0])
        self.m = np.zeros(self.shape, np.int16)       # 材質の番号(0 = 空)
        self.part = np.zeros(self.shape, np.int16)    # 部品の番号
        self.mats = [None]; self.parts = [None]
        self.notes = []                                # (番号, ことば, 3D の点)
        X, Y, Z = np.meshgrid(np.arange(self.shape[0]) + self.x0 + 0.5, np.arange(self.shape[1]) + self.y0 + 0.5,
                              np.arange(self.shape[2]) + self.z0 + 0.5, indexing='ij')
        self.X, self.Y, self.Z = X, Y, Z
    def _mi(self, m):
        if m not in self.mats: self.mats.append(m)
        return self.mats.index(m)
    def _pi(self, p):
        if p not in self.parts: self.parts.append(p)
        return self.parts.index(p)
    def put(self, mask, m, part):
        if m is None:
            self.m[mask] = 0; self.part[mask] = 0; return
        self.m[mask] = self._mi(m); self.part[mask] = self._pi(part)
    def paint(self, mask, m):  # すでにある所だけ塗りかえる
        mask = mask & (self.m > 0); self.m[mask] = self._mi(m)
    # 形
    def box(self, x0, x1, y0, y1, z0, z1):
        X, Y, Z = self.X, self.Y, self.Z
        return (X >= x0) & (X < x1) & (Y >= y0) & (Y < y1) & (Z >= z0) & (Z < z1)
    def cyl(self, axis, a, b, r, s0, s1):  # axis 方向の円柱。(a, b) は残り 2 軸の中心
        X, Y, Z = self.X, self.Y, self.Z
        if axis == 'x': u, v, s = Y - a, Z - b, X
        elif axis == 'y': u, v, s = X - a, Z - b, Y
        else: u, v, s = X - a, Y - b, Z
        return (u * u + v * v <= r * r) & (s >= s0) & (s < s1)
    def ell(self, cx, cy, cz, rx, ry, rz):
        return ((self.X - cx) / rx) ** 2 + ((self.Y - cy) / ry) ** 2 + ((self.Z - cz) / rz) ** 2 <= 1
    def prism_x(self, poly, x0, x1):  # (y, z) の多角形を x の向きに押し出す
        from PIL import Image as _I, ImageDraw as _D
        ny, nz = self.shape[1], self.shape[2]
        im = _I.new('L', (ny, nz), 0)
        _D.Draw(im).polygon([(y - self.y0 - 0.5, z - self.z0 - 0.5) for y, z in poly], fill=1)
        inside = np.array(im, bool).T          # [y, z]
        return np.broadcast_to(inside, self.shape) & (self.X >= x0) & (self.X < x1)
    def pipe(self, p0, p1, r):
        p0 = np.array(p0, float); p1 = np.array(p1, float); d = p1 - p0; L2 = (d * d).sum()
        t = np.clip(((self.X - p0[0]) * d[0] + (self.Y - p0[1]) * d[1] + (self.Z - p0[2]) * d[2]) / L2, 0, 1)
        qx = p0[0] + t * d[0]; qy = p0[1] + t * d[1]; qz = p0[2] + t * d[2]
        return (self.X - qx) ** 2 + (self.Y - qy) ** 2 + (self.Z - qz) ** 2 <= r * r
    def note(self, n, text, p):
        self.notes.append((n, text, p))

    # 投影。R = 画面の右、S = 画面の下、V = 見る人の方(すべてマシンの座標の向き)
    def render(self, R, S, V, light=None):
        R = np.array(R, float); S = np.array(S, float); V = np.array(V, float); U = np.array([0, 0, 1.0])
        idx = np.nonzero(self.m)
        P = np.stack([self.X[idx], self.Y[idx], self.Z[idx]], 1)
        sx = P @ R; sy = P @ S; near = P @ V
        filled = self.m > 0
        # 法線: ぼかした占有の勾配(段々の縞が出ないように)
        def blur(a, r=2):
            for ax in range(3):
                a = np.pad(a, [(r + 1, r) if i == ax else (0, 0) for i in range(3)], mode='edge')
                c = np.cumsum(a, axis=ax)
                sl = lambda st, en: tuple(slice(st, en) if i == ax else slice(None) for i in range(3))
                n_ = a.shape[ax] - 2 * r - 1
                a = (c[sl(2 * r + 1, 2 * r + 1 + n_)] - c[sl(0, n_)]) / (2 * r + 1)
            return a
        B = blur(filled.astype(float))
        g = np.gradient(B)
        N = -np.stack(g, -1)
        n = N[idx]; nl = np.linalg.norm(n, axis=1); n = n / np.maximum(nl, 1e-6)[:, None]
        L = light if light is not None else (0.8 * U + 0.45 * V - 0.35 * R)
        L = L / np.linalg.norm(L)
        Hh = L + V; Hh = Hh / np.linalg.norm(Hh)
        ix = np.floor(sx).astype(int); iy = np.floor(sy).astype(int)
        ox, oy = ix.min() - 2, iy.min() - 2
        W, H = ix.max() - ox + 3, iy.max() - oy + 3
        lin = (iy - oy) * W + (ix - ox)
        order = np.lexsort((-near, lin))
        lin_s = lin[order]; first = np.ones(len(order), bool); first[1:] = lin_s[1:] != lin_s[:-1]
        sel = order[first]
        mi = self.m[idx][sel]; pi = self.part[idx][sel]; ns = n[sel]; has = nl[sel] > 0
        base = np.array([MATS[self.mats[k]][0] for k in mi], float)
        gl = np.array([MATS[self.mats[k]][1] for k in mi], float)
        dif = np.where(has, np.clip(ns @ L, 0, 1), 0.4)
        sp = np.clip(ns @ Hh, 0, 1) ** 14
        c = np.clip(base * (0.62 + 0.45 * dif[:, None]) + (gl * 255 * sp)[:, None], 0, 255)
        col = np.zeros((H * W, 3)); pid = np.zeros(H * W, int); zb = np.full(H * W, -1e9)
        L_ = lin[sel]; col[L_] = c; pid[L_] = pi * 1000 + mi; zb[L_] = near[sel]
        col = col.reshape(H, W, 3); pid = pid.reshape(H, W); zb = zb.reshape(H, W)
        img = np.zeros((H, W, 4), np.uint8); img[..., :3] = col.astype(np.uint8); img[..., 3] = (pid > 0) * 255
        P2 = np.pad(pid, 1); Z2 = np.pad(zb, 1, constant_values=-1e9)
        edge = np.zeros((H, W), bool)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nb = P2[1 + dy:1 + dy + H, 1 + dx:1 + dx + W]; nz = Z2[1 + dy:1 + dy + H, 1 + dx:1 + dx + W]
            edge |= (nb == 0) | ((nb // 1000 != pid // 1000) & (nz < zb - 1.5))
        edge &= pid > 0
        img[edge, :3] = (img[edge, :3] * 0.35).astype(np.uint8)
        im = Image.fromarray(img, 'RGBA')
        proj = lambda p: (float(np.array(p, float) @ R) - ox, float(np.array(p, float) @ S) - oy)
        return im, proj
    def view(self, name, elev=16):
        U = np.array([0, 0, 1.0])
        if name == 'top': return self.render((0, -1, 0), (1, 0, 0), (0, 0, 1))
        R, V = VIEWS[name]
        R = np.array(R, float); V = np.array(V, float)
        if name.startswith('o_'):
            e = math.radians(elev)
            return self.render(R, -U * math.cos(e) + V * math.sin(e), V * math.cos(e) + U * math.sin(e))
        return self.render(R, -U, V)

VIEWS = {  # 三面図(第三角法)と、ゲームの向き
    'front': ((1, 0, 0), (0, 1, 0)),    # 前から(マシンの左が画面の右)
    'left': ((0, -1, 0), (1, 0, 0)),    # 左の横から(前が画面の左)
    'right': ((0, 1, 0), (-1, 0, 0)),   # 右の横から(前が画面の右)
    'rear': ((-1, 0, 0), (0, -1, 0)),   # うしろから
    # ゲームの向き(斜め上から見下ろす)。o_w = 西へ走る(左の横腹がこちら)、o_e = 東へ(右の横腹)、o_s = こちらへ、o_n = 向こうへ
    'o_w': ((0, -1, 0), (1, 0, 0)), 'o_e': ((0, 1, 0), (-1, 0, 0)),
    'o_s': ((1, 0, 0), (0, 1, 0)), 'o_n': ((-1, 0, 0), (0, -1, 0)),
}
FONT = '/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'
