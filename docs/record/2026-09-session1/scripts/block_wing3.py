from PIL import Image, ImageDraw, ImageFilter
import numpy as np, random
T=32; W,H=28*T,16*T
rnd=random.Random(4)
# 湖面
base=np.zeros((H,W,3)); 
for y in range(H): base[y]=(104+y*0.03,134+y*0.03,154+y*0.02)
im=Image.fromarray(base.astype(np.uint8)); d=ImageDraw.Draw(im)
for _ in range(260):
  x=rnd.randrange(W); y=rnd.randrange(H); d.line((x,y,x+rnd.randint(6,22),y),fill=(132,160,178))
P=lambda pts:[(x*T,y*T) for x,y in pts]
def poly_mask(pts):
  m=Image.new('L',(W,H),0); ImageDraw.Draw(m).polygon(P(pts),fill=255); return np.array(m)>0
def paint(mask, fn):
  a=np.array(im).astype(float); ys,xs=np.nonzero(mask)
  a[ys,xs]=fn(xs/T,ys/T); im.paste(Image.fromarray(np.clip(a,0,255).astype(np.uint8)))
def cyl(y0,y1,c,hi=1.25,lo=0.6):
  def f(x,y):
    t=np.clip((y-y0)/(y1-y0),0,1); k=np.where(t<0.35,lo+(hi-lo)*(1-abs(t-0.3)/0.35*0.3),hi-(hi-lo)*(t-0.35)/0.65)
    return np.stack([c[0]*k,c[1]*k,c[2]*k],1)
  return f
# 水に落ちる影(光は東=右から)
sh=Image.new('L',(W,H),0); ImageDraw.Draw(sh).polygon(P([(1.2,10.4),(24,10.6),(24,12.6),(1.2,12.4)]),fill=90)
sh=sh.filter(ImageFilter.GaussianBlur(6)); a=np.array(im).astype(float); a*=1-np.array(sh)[...,None]/255*0.5; im=Image.fromarray(a.astype(np.uint8)); d=ImageDraw.Draw(im)
# 北の主翼(奥)
wn=[(11,6),(17,6),(15.6,1.5),(13.2,1.5)]
paint(poly_mask(wn),lambda x,y:np.stack([138+0*x,144+0*x,140+0*x],1)+ (np.stack([x*0,x*0,x*0],1)))
d=ImageDraw.Draw(im); d.line(P([(13.2,1.5),(11,6)]),fill=(176,180,174),width=2); d.line(P([(15.6,1.5),(17,6)]),fill=(96,100,98),width=2)
d.polygon(P([(13.2,1.5),(15.6,1.5),(15.6,1.7),(13.2,1.7)]),fill=(96,100,98))
# 胴体の側面(南の壁)
side=poly_mask([(2,9.6),(23,9.8),(25.4,9.2),(26.2,8.4),(26.2,9.6),(25.2,10.8),(23,11.6),(2.4,11.4)])
paint(side,lambda x,y:np.stack([112-(y-9.6)*16,118-(y-9.6)*16,114-(y-9.6)*14],1))
d=ImageDraw.Draw(im)
for k in range(19): 
  cx=(3.2+k*1.05)*T; d.ellipse((cx-3,10.35*T-3,cx+3,10.35*T+3),fill=(58,66,74)); d.arc((cx-4,10.35*T-4,cx+4,10.35*T+4),200,340,fill=(150,156,152))
d.line(P([(2.4,11.2),(23,11.4)]),fill=(70,60,50),width=3)   # 水線(錆)
# 胴体の上面(円筒の丸み)
top=poly_mask([(2,6.2),(23,6),(24.6,6.6),(25.8,7.4),(26.3,8.2),(25.8,9),(24.6,9.6),(23,9.9),(2,9.7)])
paint(top,cyl(6.0,9.9,(150,156,150),hi=1.14,lo=0.9))
d=ImageDraw.Draw(im)
for k in range(3,23): d.line((k*T,6.1*T,k*T,9.8*T),fill=(122,128,122))
for yy in (7.0,8.0,9.0): d.line((2*T,yy*T,23*T,yy*T),fill=(128,134,128))
# 機首の丸み
nose=poly_mask([(22.4,6.1),(24.6,6.6),(25.8,7.4),(26.3,8.2),(25.8,9),(24.6,9.6),(22.4,9.9)])
paint(nose,lambda x,y:np.stack([150+(x-22)*6-(abs(y-7.6))*10,156+(x-22)*6-(abs(y-7.6))*10,150+(x-22)*5-(abs(y-7.6))*10],1))
d=ImageDraw.Draw(im)
d.polygon(P([(22.4,7.0),(24.3,7.25),(24.6,8.1),(24.3,8.9),(22.4,9.1)]),fill=(96,118,134)); d.line(P([(22.6,7.3),(24.1,7.5)]),fill=(200,214,222),width=2)
for xx in (23.0,23.6): d.line(P([(xx,7.1),(xx,9.0)]),fill=(70,76,80),width=2)
# 南の主翼(手前)
ws=[(11,10),(17.9,10),(17.9,10.9),(15.6,14.8),(13.2,14.8)]
paint(poly_mask(ws),lambda x,y:np.stack([146-(y-10)*1.5,152-(y-10)*1.5,146-(y-10)*1.5],1))
d=ImageDraw.Draw(im)
for yy in np.arange(11,14.8,1.0): d.line(P([(11+ (yy-10)*0.46,yy),(17.9-(yy-10)*0.49,yy)]),fill=(124,130,124))
d.line(P([(11,10),(13.2,14.8)]),fill=(96,100,98),width=2); d.line(P([(17.9,10.9),(15.6,14.8)]),fill=(180,184,178),width=2)
d.polygon(P([(13.2,14.8),(15.6,14.8),(15.6,15.25),(13.2,15.25)]),fill=(92,96,94))
# 背中の発射筒3対(円筒)
for k in range(3):
  x0=8+k*3.1; x1=x0+2.6
  for (y0,y1) in ((6.05,6.85),(8.85,9.65)):
    paint(poly_mask([(x0,y0-0.2),(x1,y0-0.2),(x1,y1-0.2),(x0,y1-0.2)]),cyl(y0-0.2,y1-0.2,(170,172,164),hi=1.2,lo=0.62))
    d=ImageDraw.Draw(im)
    d.ellipse((x1*T-5,(y0-0.2)*T,x1*T+5,(y1-0.2)*T),fill=(96,98,94),outline=(60,62,60))
    for b in (0.6,1.9): d.line(P([(x0+b,y0-0.2),(x0+b,y1-0.2)]),fill=(110,112,106),width=2)
    d.line(P([(x0,y1-0.1),(x1,y1-0.1)]),fill=(70,76,72),width=2)
# 乗降口(ふたが開いて、中が暗い)
d.rectangle((17.2*T,7.5*T,17.9*T,8.5*T),fill=(34,34,34),outline=(80,84,80)); d.rectangle((17.2*T,7.1*T,17.9*T,7.5*T),fill=(120,124,118))
# 機首の横のパイロンと、片側4基のジェット(円筒、吸気口は右)
for y0 in (3.2,10.2):
  d.rectangle((18.3*T,(y0-0.1)*T,20.9*T,(y0+2.55)*T),fill=(112,116,112))
  for k in range(4):
    y=y0+k*0.62
    paint(poly_mask([(18,y),(21.3,y),(21.3,y+0.52),(18,y+0.52)]),cyl(y,y+0.52,(118,120,120),hi=1.3,lo=0.55))
    d=ImageDraw.Draw(im); d.ellipse((21.05*T,y*T,21.6*T,(y+0.52)*T),fill=(150,152,150)); d.ellipse((21.18*T,(y+0.07)*T,21.5*T,(y+0.45)*T),fill=(28,28,30))
    d.ellipse((17.8*T,(y+0.1)*T,18.2*T,(y+0.42)*T),fill=(60,50,44))
# T字尾翼: 胴体に落ちる影、垂直尾翼、その上の水平尾翼
sh=Image.new('L',(W,H),0); ImageDraw.Draw(sh).polygon(P([(1.4,7.2),(5.4,7.2),(6.2,9.6),(2,9.6)]),fill=110)
a=np.array(im).astype(float); a*=1-np.array(sh.filter(ImageFilter.GaussianBlur(3)))[...,None]/255*0.45; im=Image.fromarray(a.astype(np.uint8))
paint(poly_mask([(1.9,8.2),(5.9,8.2),(4.7,4.3),(2.9,4.3)]),lambda x,y:np.stack([140-(x-2)*6,146-(x-2)*6,140-(x-2)*6],1))
paint(poly_mask([(1.3,1.1),(4.9,1.1),(4.9,6.9),(1.3,6.9)]),lambda x,y:np.stack([160-(y-1)*3,166-(y-1)*3,160-(y-1)*3],1))
d=ImageDraw.Draw(im)
for yy in np.arange(2,7,1.0): d.line(P([(1.3,yy),(4.9,yy)]),fill=(134,140,134))
d.rectangle((1.3*T,6.9*T,4.9*T,7.25*T),fill=(98,102,100)); d.line(P([(4.9,1.1),(4.9,6.9)]),fill=(186,190,184),width=2)
# 錆のすじ、苔と草、蓮、白鷺
for _ in range(70):
  c=rnd.uniform(2.5,25); r=rnd.uniform(6.2,11.2)
  d.line((c*T,r*T,c*T+rnd.randint(-2,2),r*T+rnd.randint(6,18)),fill=(140,96,66),width=rnd.choice([1,2]))
for (c,r,s) in [(14,3.2,1.3),(15,12.6,1.2),(9.6,7.9,0.8),(13.4,7.6,0.7),(20,8.8,0.8),(3,4.8,1.0),(6.6,9.2,0.7),(24.8,9.4,0.6)]:
  d.ellipse((c*T,r*T,(c+0.8*s)*T,(r+0.45*s)*T),fill=(104,128,80)); d.ellipse(((c+0.1)*T,(r+0.05)*T,(c+0.5*s)*T,(r+0.25*s)*T),fill=(128,152,92))
for (c,r) in [(13.9,4.4),(14.7,11.6),(8,12.5),(22,13.4),(5,13.2),(20,2),(9,2.5),(25,3)]:
  d.ellipse((c*T,r*T,c*T+18,r*T+10),fill=(96,126,84)); d.ellipse((c*T+5,r*T+1,c*T+11,r*T+6),fill=(222,160,178))
for (c,r) in [(16.2,2.2),(24.3,7.7),(6.2,6.3)]:
  d.ellipse((c*T,r*T,c*T+10,r*T+14),fill=(244,244,238)); d.line((c*T+8,r*T+2,c*T+14,r*T),fill=(230,190,90),width=2)
im.save('gen/wing3_block.png'); im.resize((896,512)).save('z.png')
