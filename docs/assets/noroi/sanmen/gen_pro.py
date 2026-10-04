# PixelLab Pro (generate-image-v2): 参考の絵(スケッチ)と、絵柄の見本(ゲームの絵)をつけて生成。出た候補をすべて保存
import base64, io, json, subprocess, sys, time, os
from PIL import Image
def b64(path):
    im = Image.open(path).convert('RGBA'); f = io.BytesIO(); im.save(f, 'PNG')
    return {"base64": base64.b64encode(f.getvalue()).decode()}, im.size
def run(spec, outdir):
    body = {"description": spec['desc'], "image_size": {"width": spec['w'], "height": spec['h']}, "no_background": spec.get('nobg', True)}
    if 'seed' in spec: body['seed'] = spec['seed']
    refs = []
    for r in spec.get('refs', []):
        im, (w, h) = b64(r['path']); refs.append({"image": im, "size": {"width": w, "height": h}, "usage_description": r.get('use')})
    if refs: body['reference_images'] = refs
    if 'style' in spec:
        im, (w, h) = b64(spec['style']); body['style_image'] = {"image": im, "size": {"width": w, "height": h}}
    for _ in range(4):
        tf = f'/tmp/gp_{spec["name"]}.json'; open(tf, 'w').write(json.dumps(body))
        r = subprocess.run(["curl", "-sS", "-m", "300", "https://api.pixellab.ai/v2/generate-image-v2", "-H", "Content-Type: application/json", "-d", "@" + tf], capture_output=True, text=True)
        try: job = json.loads(r.stdout)['background_job_id']; break
        except Exception: print('retry', r.stdout[:300]); time.sleep(15)
    else: return spec['name'] + ' submit fail'
    for _ in range(150):
        r = subprocess.run(["curl", "-sS", "https://api.pixellab.ai/v2/background-jobs/" + job], capture_output=True, text=True)
        try: d = json.loads(r.stdout)
        except Exception: time.sleep(8); continue
        if d.get('status') == 'completed':
            imgs = (d.get('last_response') or {}).get('images') or []
            os.makedirs(outdir, exist_ok=True)
            for k, im in enumerate(imgs):
                b = im.get('base64') if isinstance(im, dict) else im
                Image.open(io.BytesIO(base64.b64decode(b))).save(f'{outdir}/{spec["name"]}_{k:02d}.png')
            return f'{spec["name"]} {len(imgs)}'
        if d.get('status') in ('failed', 'error'): return spec['name'] + ' FAIL ' + json.dumps(d)[:300]
        time.sleep(8)
    return spec['name'] + ' timeout'
if __name__ == '__main__':
    from concurrent.futures import ThreadPoolExecutor
    specs = json.load(open(sys.argv[1])); outdir = sys.argv[2]
    only = sys.argv[3].split(',') if len(sys.argv) > 3 else None
    specs = [s for s in specs if not only or s['name'] in only]
    with ThreadPoolExecutor(4) as ex:
        for r in ex.map(lambda s: run(s, outdir), specs): print(r, flush=True)
