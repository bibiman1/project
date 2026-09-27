import base64,io,json,subprocess,sys,math
from PIL import Image
from inp import b64
seed=int(sys.argv[1])
im=Image.open('gen/banana_moon.png').convert('RGBA'); p=im.load()
CX,CY,R=57,40,19
crop=(0,0,200,120)
mask=Image.new('RGB',(200,120),(0,0,0)); m=mask.load()
for y in range(120):
  for x in range(200):
    if math.hypot(x-CX,y-CY)<=R:
      r,g,b,a=p[x,y]
      if not (g>r+15 and g>b): m[x,y]=(255,255,255)
body={"description":"pixel art, clear pale blue sky with thin wispy clouds, snowy white mountain slopes, no sun","image_size":{"width":200,"height":120},"inpainting_image":{"type":"base64","base64":b64(im.crop(crop))},"mask_image":{"type":"base64","base64":b64(mask)},"seed":seed,"negative_description":"sun, moon, orb, circle, yellow"}
r=subprocess.run(["curl","-sS","-m","180","https://api.pixellab.ai/v2/inpaint","-H","Content-Type: application/json","-d",json.dumps(body)],capture_output=True,text=True)
d=json.loads(r.stdout); out=Image.open(io.BytesIO(base64.b64decode(d['image']['base64']))).convert('RGBA')
full=im.copy(); fp=full.load(); op=out.load()
for y in range(120):
  for x in range(200):
    if m[x,y][0]: fp[x,y]=op[x,y]
full.save(f'gen/nosun{seed}.png')
