import base64,io,json,subprocess,sys,time
from PIL import Image
def b64(im):
  f=io.BytesIO(); im.save(f,'PNG'); return base64.b64encode(f.getvalue()).decode()
def edit(src,desc,out,seed=1):
  im=Image.open(src).convert('RGBA')
  body={"method":"edit_with_text","edit_images":[{"image":{"type":"base64","base64":b64(im)},"width":im.width,"height":im.height}] ,"image_size":{"width":im.width,"height":im.height},"description":desc,"seed":seed}
  for attempt in range(3):
    r=subprocess.run(["curl","-sS","-m","300","https://api.pixellab.ai/v2/edit-images-v2","-H","Content-Type: application/json","-d",json.dumps(body)],capture_output=True,text=True)
    try:
      d=json.loads(r.stdout)
    except Exception:
      print('bad',r.stdout[:300]); time.sleep(10); continue
    if 'images' in d or 'image' in d:
      imgs=d.get('images') or [d['image']]
      Image.open(io.BytesIO(base64.b64decode(imgs[0]['base64']))).save(out); return d
    print(json.dumps(d)[:600]); return d
if __name__=='__main__':
  edit(sys.argv[1],sys.argv[2],sys.argv[3],int(sys.argv[4]) if len(sys.argv)>4 else 1)
