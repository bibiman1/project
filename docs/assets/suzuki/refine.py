# 半分の大きさの仕上げを 2 倍(NEAREST)にし、512 の窓ごとに原寸でもう一度かけて、端からの距離^4 で混ぜる
import sys, numpy as np
from PIL import Image
sys.path.insert(0, '/tmp/claude-0/-home-user-project/e7cb1a9b-b078-5ece-9cdf-0647f5a9d6fa/scratchpad')
from edit_async import submit
from poll import poll
from concurrent.futures import ThreadPoolExecutor
def refine(half, out, desc, seed=3, win=512):
    im = Image.open(half).convert('RGBA'); im = im.resize((im.width * 2, im.height * 2), Image.NEAREST)
    W, H = im.size
    xs = [0] if W <= win else [0, W - win] if W <= 2 * win - 128 else list(range(0, W - win, win - 128)) + [W - win]
    ys = [0] if H <= win else [0, H - win]
    jobs = []
    for x in xs:
        for y in ys:
            w, h = min(win, W), min(win, H)
            p = out + f'.in_{x}_{y}.png'; im.crop((x, y, x + w, y + h)).save(p); jobs.append((x, y, w, h, p))
    def run(j):
        x, y, w, h, p = j
        q = p.replace('.in_', '.out_'); poll(submit(p, desc, seed), q, 150); return (x, y, w, h, q)
    with ThreadPoolExecutor(4) as ex: res = list(ex.map(run, jobs))
    acc = np.zeros((H, W, 4)); wsum = np.zeros((H, W, 1))
    for x, y, w, h, q in res:
        o = np.asarray(Image.open(q).convert('RGBA').resize((w, h), Image.NEAREST)).astype(float)
        yy, xx = np.mgrid[0:h, 0:w]
        dist = np.minimum.reduce([xx + 1 if x > 0 else np.full_like(xx, 999), w - xx if x + w < W else np.full_like(xx, 999),
                                  yy + 1 if y > 0 else np.full_like(yy, 999), h - yy if y + h < H else np.full_like(yy, 999)]).astype(float)
        wt = (np.minimum(dist, 200) / 200.0) ** 4 + 1e-6
        acc[y:y + h, x:x + w] += o * wt[..., None]; wsum[y:y + h, x:x + w] += wt[..., None]
    Image.fromarray((acc / wsum).round().clip(0, 255).astype('uint8')).save(out)
    print(out, len(jobs))
if __name__ == '__main__':
    refine(sys.argv[1], sys.argv[2], sys.argv[3])
