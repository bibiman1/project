import base64,io,json,subprocess,sys,time
from PIL import Image
def b64(im):
  f=io.BytesIO(); im.save(f,'PNG'); return base64.b64encode(f.getvalue()).decode()
def run(init,desc,out,size,strength=350,seed=1):
  im=Image.open(init).convert('RGBA')
  body={"description":desc,"image_size":{"width":size[0],"height":size[1]},"no_background":True,"init_image":{"type":"base64","base64":b64(im)},"init_image_strength":strength,
        "view":"high top-down","shading":"medium shading","detail":"highly detailed","outline":"single color outline","seed":seed}
  for _ in range(4):
    r=subprocess.run(["curl","-sS","-m","200","https://api.pixellab.ai/v2/create-image-pixflux","-H","Content-Type: application/json","-d",json.dumps(body)],capture_output=True,text=True)
    try:
      d=json.loads(r.stdout); Image.open(io.BytesIO(base64.b64decode(d['image']['base64']))).save(out); return
    except Exception: print('retry',r.stdout[:200]); time.sleep(15)
if __name__=='__main__':
  run(sys.argv[1],sys.argv[2],sys.argv[3],(64,64),int(sys.argv[4]) if len(sys.argv)>4 else 350)
