from PIL import Image
import math,random
im=Image.open('gen/banana_e.png').convert('RGBA'); px=im.load()
CX,CY,R=158,36,11
T=math.radians(-18); ct,st=math.cos(T),math.sin(T)
RO,RI,FL=27,17,0.2
HAZE=0.5   # 空気遠近法: 空の色へ寄せる
def mix(c,x,y,k=HAZE):
  s=px[x,y]; return (int(c[0]*(1-k)+s[0]*k),int(c[1]*(1-k)+s[1]*k),int(c[2]*(1-k)+s[2]*k),255)
def loc(x,y):
  dx,dy=x+.5-CX,y+.5-CY; return dx*ct+dy*st,-dx*st+dy*ct
# 欠け: 右上をぎざぎざにえぐる
random.seed(4)
def bitten(x,y):
  dx,dy=x+.5-CX,y+.5-CY
  a=math.atan2(dy,dx); r=math.hypot(dx,dy)
  # えぐれの中心は右上(-40度)
  bx,by=CX+R*0.9*math.cos(math.radians(-40)),CY+R*0.9*math.sin(math.radians(-40))
  jag=7+1.6*math.sin(a*7)+1.2*math.sin(a*13+1)+0.7*math.sin(a*23)
  return math.hypot(x+.5-bx,y+.5-by)<jag
def moon(x,y): return math.hypot(x+.5-CX,y+.5-CY)<=R and not bitten(x,y)
def ring(x,y):
  u,v=loc(x,y); e=(u/RO)**2+(v/(RO*FL))**2; i=(u/RI)**2+(v/(RI*FL))**2
  return (e<=1 and i>1), v
orig=im.copy(); op=orig.load()
def put(x,y,c,k=HAZE):
  s=op[x,y]; px[x,y]=(int(c[0]*(1-k)+s[0]*k),int(c[1]*(1-k)+s[1]*k),int(c[2]*(1-k)+s[2]*k),255)
RC=(246,248,250)
for y in range(10,64):
  for x in range(118,205):
    r,v=ring(x,y)
    if r and v<0: put(x,y,RC,0.5)          # 環の奥側
for y in range(10,64):
  for x in range(118,205):
    if moon(x,y):
      d=math.hypot(x+.5-CX+3,y+.5-CY+3)/R
      c=(250,250,252) if d<0.7 else (226,232,240)
      # 割れ口は少し影
      if any(bitten(x+a,y+b) for a in (-1,0,1) for b in (-1,0,1)): c=(196,204,216)
      put(x,y,c,0.25)
for (x,y) in [(165,32),(168,30),(171,28),(174,29),(177,31),(181,33),(148,42),(143,44),(138,45)]:
  put(x,y,(236,240,246),0.3); put(x+1,y,(220,228,238),0.3)   # 環に混じる破片
for y in range(10,64):
  for x in range(118,205):
    r,v=ring(x,y)
    if r and v>=0: put(x,y,RC,0.38)         # 環の手前側
im.save('gen/banana_moon.png')
im.crop((110,10,210,70)).resize((600,360),Image.NEAREST).save('z.png')
