import base64,io,json,subprocess,sys,time
from PIL import Image
from poll import poll
def b64(im):
  f=io.BytesIO(); im.save(f,'PNG'); return base64.b64encode(f.getvalue()).decode()
def run(srcs,desc,outs,seed=1):
  ims=[Image.open(s).convert('RGBA') for s in srcs]
  W,H=ims[0].size
  body={"method":"edit_with_text","edit_images":[{"image":{"type":"base64","base64":b64(i)},"width":W,"height":H} for i in ims],"image_size":{"width":W,"height":H},"description":desc,"seed":seed}
  for _ in range(4):
    r=subprocess.run(["curl","-sS","-m","300","https://api.pixellab.ai/v2/edit-images-v2","-H","Content-Type: application/json","-d",json.dumps(body)],capture_output=True,text=True)
    try: j=json.loads(r.stdout)['background_job_id']; break
    except Exception: print('retry',r.stdout[:300]); time.sleep(15)
  for _ in range(120):
    r=subprocess.run(["curl","-sS","https://api.pixellab.ai/v2/background-jobs/"+j],capture_output=True,text=True)
    d=json.loads(r.stdout)
    if d.get('status')=='completed':
      imgs=d['last_response'].get('images')
      for im,o in zip(imgs,outs):
        b=im.get('base64') if isinstance(im,dict) else im
        Image.open(io.BytesIO(base64.b64decode(b))).save(o)
      return len(imgs)
    if d.get('status') in ('failed','error'): print(json.dumps(d)[:400]); return 0
    time.sleep(8)
