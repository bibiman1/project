from PIL import Image
import math
im=Image.open('gen/v_saturn_fix.png').convert('RGBA'); px=im.load()
W,H=im.size
def cream(c): r,g,b,a=c; return r>215 and g>190
BCX,BCY,BRX,BRY=157,100,77,15.5      # 汁の水面(楕円)
WL=100                                # 土星のまわりの水面の高さ
# 1) 古い土星を消す: 水面より上は同じ行の左の色で埋める
for y in range(52,BCY+2):
    for x in range(120,205):
        if cream(px[x,y]):
            k=x
            while k>100 and cream(px[k,y]): k-=1
            px[x,y]=px[k,y]
# 2) 水面を塗り直す(奥は暗く、手前は明るい。手前に映り込みの線)
for y in range(int(BCY-BRY),int(BCY+BRY)+1):
    for x in range(int(BCX-BRX),int(BCX+BRX)+1):
        d=((x-BCX)/BRX)**2+((y-BCY)/BRY)**2
        if d<=1:
            t=(y-(BCY-BRY))/(2*BRY)
            c=(int(88+44*t),int(40+24*t),int(26+14*t),255)
            if 0.55<d<0.66 and y>BCY: c=(176,104,62,255)
            px[x,y]=c
# 3) 傾いた土星
SCX,SCY,R=157,83,22
TILT=math.radians(-22)
ct,st=math.cos(TILT),math.sin(TILT)
def local(x,y):   # 環の向きにそろえた座標
    dx,dy=x-SCX,y-SCY
    return dx*ct+dy*st, -dx*st+dy*ct
BANDS=[(246,232,196),(232,208,152),(214,178,118),(240,222,176),(206,168,110),(236,214,160)]
OUT=(104,72,44,255)
def sphere(x,y):
    return (x+0.5-SCX)**2+(y+0.5-SCY)**2<=R*R
def sphere_col(x,y):
    u,v=local(x+0.5,y+0.5)
    b=BANDS[int((v+R)/(2*R)*len(BANDS)*1.0)%len(BANDS)]
    sh=((x-SCX)*0.5+(y-SCY)*0.7)/R
    f=1-max(0,sh)*0.28
    if ((x-SCX+7)**2+(y-SCY+8)**2)<30: f=1.08
    return (min(255,int(b[0]*f)),min(255,int(b[1]*f)),min(255,int(b[2]*f)),255)
RO,RI=50,33          # 環の外側/内側の半径(長いほう)
FL=0.24              # つぶれ具合
def ring(x,y):
    u,v=local(x+0.5,y+0.5)
    e=(u/RO)**2+(v/(RO*FL))**2; i=(u/RI)**2+(v/(RI*FL))**2
    if e<=1 and i>1:
        g=math.sqrt(e)
        if g>0.93: c=(120,86,52)
        elif 0.80<g<0.85: c=(150,112,70)   # すき間(カッシーニの間隙)
        elif g>0.85: c=(226,202,146)
        else: c=(244,226,182)
        return c+(255,),v
    return None
under=lambda x,y: y>WL+0.5*abs(x-SCX)/RO*0   # 水面より下は見えない
layer={}
# 環の奥側 → 球 → 環の手前側
for y in range(SCY-R-14,SCY+R+14):
    for x in range(SCX-RO-4,SCX+RO+4):
        r=ring(x,y)
        if r and r[1]<0: layer[(x,y)]=r[0]
for y in range(SCY-R-2,SCY+R+2):
    for x in range(SCX-R-2,SCX+R+2):
        if sphere(x,y):
            edge=not all(sphere(x+a,y+b) for a,b in((1,0),(-1,0),(0,1),(0,-1)))
            layer[(x,y)]=OUT if edge else sphere_col(x,y)
for y in range(SCY-R-14,SCY+R+14):
    for x in range(SCX-RO-4,SCX+RO+4):
        r=ring(x,y)
        if r and r[1]>=0: layer[(x,y)]=r[0]
# 水面より下を隠す(汁は不透明)。水面の線にさざ波の明るい縁
for (x,y),c in layer.items():
    if y<=WL: px[x,y]=c
for (x,y),c in layer.items():
    if y==WL+1: px[x,y]=(186,118,72,255)
# 土星のまわりのさざ波
for i in range(360):
    t=math.radians(i)
    for rx,ry,col in ((R+7,4,(176,104,62,255)),(R+13,6,(150,86,52,255))):
        x=round(SCX+rx*math.cos(t)); y=round(WL+2+ry*math.sin(t))
        if y>WL+1: px[x,y]=col
im.save('gen/v_saturn_tilt.png')
im.resize((W*3,H*3),Image.NEAREST).save('sat_tilt.png')
