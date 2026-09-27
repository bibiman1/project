from PIL import Image, ImageDraw
import math, random
random.seed(7)
W,H=320,192
out=Image.new('RGBA',(W,H),(4,4,10,255));d=ImageDraw.Draw(out)
cx,cy,R=160,96,90
# eyepiece view
view=Image.new('RGBA',(W,H),(0,0,0,0));vd=ImageDraw.Draw(view)
vd.ellipse((cx-R,cy-R,cx+R,cy+R),fill=(14,18,40,255))
out.alpha_composite(view)
for _ in range(60):
  a=random.random()*6.283; r=random.random()**0.5*(R-4)
  x,y=int(cx+math.cos(a)*r),int(cy+math.sin(a)*r)
  out.putpixel((x,y),(random.randint(150,230),)*3+(255,))
# moon
m=Image.open('gen/sv_moonplainb.png').convert('RGBA'); m=m.crop(m.getbbox())
MS=104; m=m.resize((MS,MS),Image.BOX)
mp=m.load()
# quantize-ish: posterize grey
for y in range(MS):
  for x in range(MS):
    r,g,b,a=mp[x,y]
    if a<128: mp[x,y]=(0,0,0,0); continue
    L=(r+g+b)//3; L=(L//24)*24+12; mp[x,y]=(min(255,L+6),min(255,L+4),L,255)
# blast: bite out of upper right limb
bx,by,br=MS*0.80,MS*0.20,MS*0.26
for y in range(MS):
  for x in range(MS):
    dd=math.hypot(x-bx,y-by)+random.uniform(-2.5,2.5)
    if dd<br: mp[x,y]=(0,0,0,0)
    elif dd<br+2.5 and mp[x,y][3]: mp[x,y]=(255,170,90,255) if random.random()<0.6 else (200,110,60,255)
mx,my=cx-MS//2,cy-MS//2
tilt=-0.35; ra,rb=100,20
def ring(front):
  for i in range(900):
    t=random.random()*6.283
    rr=random.gauss(1,0.05)
    x=math.cos(t)*ra*rr; y=math.sin(t)*rb*rr
    X=cx+x*math.cos(tilt)-y*math.sin(tilt); Y=cy+x*math.sin(tilt)+y*math.cos(tilt)
    isfront=math.sin(t)>0
    if isfront!=front: continue
    if math.hypot(X-cx,Y-cy)>R-2: continue
    c=random.choice([(200,190,170),(160,150,135),(230,220,200),(120,112,100)])
    out.putpixel((int(X),int(Y)),c+(255,))
ring(False)
out.alpha_composite(m,(mx,my))
# debris streaming from blast into ring
for i in range(120):
  k=random.random()
  x0,y0=mx+bx,my+by
  x=x0+k*40+random.gauss(0,3); y=y0-k*6+random.gauss(0,3)+k*k*18
  if math.hypot(x-cx,y-cy)<R-2: out.putpixel((int(x),int(y)),random.choice([(230,200,170),(180,160,140),(255,180,110)])+(255,))
ring(True)
# eyepiece rim + outer vignette
d.ellipse((cx-R-2,cy-R-2,cx+R+2,cy+R+2),outline=(40,44,70,255),width=3)
out.save('gen/v_moon_c.png')
out.resize((960,576),Image.NEAREST).save('moonview.png')
