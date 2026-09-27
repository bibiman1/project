import base64,io,json,subprocess,sys,time
from PIL import Image
from poll import poll
def b64(im):
  f=io.BytesIO(); im.save(f,'PNG'); return base64.b64encode(f.getvalue()).decode()
def submit(src,desc,seed=1):
  im=Image.open(src).convert('RGBA')
  body={"method":"edit_with_text","edit_images":[{"image":{"type":"base64","base64":b64(im)},"width":im.width,"height":im.height}],"image_size":{"width":im.width,"height":im.height},"description":desc,"seed":seed}
  for _ in range(4):
    r=subprocess.run(["curl","-sS","-m","300","https://api.pixellab.ai/v2/edit-images-v2","-H","Content-Type: application/json","-d",json.dumps(body)],capture_output=True,text=True)
    try: d=json.loads(r.stdout); return d['background_job_id']
    except Exception: print('retry',r.stdout[:200]); time.sleep(15)
if __name__=='__main__':
  src,desc,out=sys.argv[1],sys.argv[2],sys.argv[3]; seed=int(sys.argv[4]) if len(sys.argv)>4 else 1
  j=submit(src,desc,seed); print(out, poll(j,out,120))
