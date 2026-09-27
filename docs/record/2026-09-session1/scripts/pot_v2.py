from PIL import Image, ImageDraw
import math
base=Image.open('gen/irva.png').convert('RGBA'); im=base.copy(); px=im.load(); bp=base.load(); d=ImageDraw.Draw(im)
steam=lambda c: (abs(c[0]-c[2])<30 and c[0]>85) or (c[2]-c[0]>20 and c[2]>95)
# 1) 湯気を消す(板目は横なので同じ行の左側の色で埋める)
for y in range(0,64):
  for x in range(135,175):
    if steam(bp[x,y]):
      k=x
      while k>120 and steam(bp[k,y]): k-=1
      px[x,y]=px[k,y]
clean=im.copy(); cp=clean.load()
# 2) 竹筒+鉄棒+？逆さの鉤
OUT=(16,12,14,255); DK=(58,62,74,255); IRON=(96,102,116,255); HI=(186,194,206,255)
cx,cy,RX,RY=160,29,5,5
sx=cx
d.rectangle((sx-5,0,sx+5,9),fill=(150,122,62,255)); d.line((sx-5,0,sx-5,9),fill=(190,160,92,255)); d.line((sx+5,0,sx+5,9),fill=(92,70,34,255))
d.line((sx-5,4,sx+5,4),fill=(92,70,34,255)); d.line((sx-5,5,sx+5,5),fill=(196,168,100,255)); d.rectangle((sx-5,9,sx+5,10),fill=(80,60,30,255))
pts=[(sx,y) for y in range(11,int(cy-RY)+1)]
for i in range(0,251,3):
  a=-math.pi/2-math.radians(i); pts.append((cx+RX*math.cos(a),cy+RY*math.sin(a)))
ex,ey=pts[-1]
for k in range(1,5): pts.append((ex+0.35*k,ey-1.0*k))
cells={}; n=len(pts)
for idx,(x,y) in enumerate(pts):
  w=1.4 if idx<n-3 else 1.4-0.3*(idx-(n-3))
  for yy in range(int(y-3),int(y+4)):
    for xx in range(int(x-3),int(x+4)):
      if math.hypot(xx-x,yy-y)<=w: cells[(xx,yy)]=None
for (x,y) in list(cells):
  L=(x-1,y) not in cells; R=(x+1,y) not in cells; D=(x,y+1) not in cells
  cells[(x,y)]=HI if L and not D else (DK if (R or D) else IRON)
S=set(cells)
for (x,y) in S:
  for a in (-1,0,1):
    for b in (-1,0,1):
      if (x+a,y+b) not in S: px[x+a,y+b]=OUT
for (x,y),c in cells.items(): px[x,y]=c
# 弦(つる)は鉤の先端側では手前を通す
for y in range(29,37):
  for x in range(cx+2,cx+10):
    c=cp[x,y]
    if sum(c[:3])<90: px[x,y]=c
# 3) 傾いた土星の環
SCX,SCY,Rp=160.5,70.5,8.5
T=math.radians(-22); ct,st=math.cos(T),math.sin(T)
RO,RI,FL=17,10.5,0.30
def ring(x,y):
  dx,dy=x+0.5-SCX,y+0.5-SCY; u=dx*ct+dy*st; v=-dx*st+dy*ct
  e=(u/RO)**2+(v/(RO*FL))**2; i=(u/RI)**2+(v/(RI*FL))**2
  if e<=1 and i>1:
    g=math.sqrt(e)
    c=(70,44,30) if (g>0.9 or g<0.74) else ((200,160,100) if 0.84<g<0.9 else (236,212,160))
    return c+(255,),v
sph=lambda x,y:(x+0.5-SCX)**2+(y+0.5-SCY)**2<=Rp*Rp
for y in range(50,92):
  for x in range(138,184):
    r=ring(x,y)
    if r and (not sph(x,y) or r[1]>0): px[x,y]=r[0]
im.save('gen/pot_v2.png')
# 4) 灰の上に散らばった「小さな炎」を消す(灰の上で炎は立たない)
im=Image.open('gen/pot_v2.png').convert('RGBA'); px=im.load()
ember=lambda c: (c[0]>120 and c[0]>c[2]+50) or (c[0]>200 and c[1]>150)
ashy=lambda c: abs(c[0]-c[2])<40 and 60<c[2]<170
for y in range(84,180):
  for x in range(60,262):
    if math.hypot((x-160)*0.9,(y-124)*1.1)<34: continue
    if ember(px[x,y]):
      k=x
      while k>40 and not ashy(px[k,y]): k-=1
      if x-k<8: px[x,y]=px[k,y]
im.save('gen/pot_v2.png')
