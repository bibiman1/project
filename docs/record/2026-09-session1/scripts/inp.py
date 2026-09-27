import base64,io,json,subprocess,sys
from PIL import Image, ImageDraw
def b64(i):
  f=io.BytesIO(); i.save(f,'PNG'); return base64.b64encode(f.getvalue()).decode()
def inpaint(im, crop_box, rects, desc, neg="", seed=1):
  cx,cy,cx2,cy2=crop_box; W,H=cx2-cx,cy2-cy
  crop=im.crop(crop_box)
  mask=Image.new('RGB',(W,H),(0,0,0)); d=ImageDraw.Draw(mask)
  for (x0,y0,x1,y1) in rects: d.rectangle((x0-cx,y0-cy,x1-cx,y1-cy),fill=(255,255,255))
  body={"description":desc,"image_size":{"width":W,"height":H},"inpainting_image":{"type":"base64","base64":b64(crop)},"mask_image":{"type":"base64","base64":b64(mask)},"seed":seed}
  if neg: body["negative_description"]=neg
  for _ in range(4):
    r=subprocess.run(["curl","-sS","-m","180","https://api.pixellab.ai/v2/inpaint","-H","Content-Type: application/json","-d",json.dumps(body)],capture_output=True,text=True)
    try:
      d=json.loads(r.stdout); out=Image.open(io.BytesIO(base64.b64decode(d['image']['base64']))).convert('RGBA'); break
    except Exception: print('retry',r.stdout[:200]); import time; time.sleep(15)
  full=im.copy(); full.paste(out,(cx,cy)); return full
