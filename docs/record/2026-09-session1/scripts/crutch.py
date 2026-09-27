from PIL import Image, ImageDraw
import math
# 木の松葉杖(横から): 上に脇当て、2本の枝が握りの下で1本の脚にまとまり、先にゴム
def crutch(shade=1.0):
  W,H=13,44
  im=Image.new('RGBA',(W,H),(0,0,0,0)); p=im.load()
  k=lambda c:tuple(int(v*shade) for v in c)+(255,)
  OUT=k((58,36,22)); WD=k((184,130,74)); HI=k((222,176,116)); PAD=k((126,112,98)); RUB=k((40,36,34))
  cells={}
  def put(x,y,c): cells[(x,y)]=c
  # 脇当て(横長のまくら)
  for x in range(2,11):
    for y in range(1,4): put(x,y,PAD if y<3 else k((96,84,74)))
  # 2本の枝: 上で開き(x=3,9)、下で閉じて(x=6)脚になる
  for y in range(4,28):
    t=(y-4)/24
    off=round(3*(1-t))
    for sx in {6-off,6+off}: put(sx,y,HI if sx<6 else WD)
  # 握り
  for x in range(3,10): put(x,14,WD)
  # 脚(1本)
  for y in range(28,40): put(6,y,WD); put(5,y,HI)
  for y in range(40,43): put(5,y,RUB); put(6,y,RUB)
  S=set(cells)
  for (x,y) in S:
    for a in (-1,0,1):
      for b in (-1,0,1):
        q=(x+a,y+b)
        if q not in S and 0<=q[0]<W and 0<=q[1]<H: p[q]=OUT
  for (x,y),c in cells.items(): p[x,y]=c
  return im
near=crutch(1.0); far=crutch(0.72)
near.save('gen/crutch.png'); far.save('gen/crutch_far.png')
# 歩きのアニメ(ふりだし歩行): 杖を前について、からだ(見えない)を前へ振り出す
bg=Image.open('/home/user/project/field/assets/worlds/haihei/wang_yard.png').convert('RGBA').crop((0,0,32,32))
frames=[]
N=24; STEP=22
for i in range(N*2):
  ph=(i%N)/N
  base=(i//N)*STEP
  # 前半: 杖を振り出す(先が前へ、脇は置いたまま)  後半: 杖の先を支点にからだが前へ(脇が前へ)
  if ph<0.5:
    u=ph/0.5; tip=base+STEP*u; top=base; lift=math.sin(u*math.pi)*3
  else:
    u=(ph-0.5)/0.5; tip=base+STEP; top=base+STEP*u; lift=0
  can=Image.new('RGBA',(120,70))
  for yy in range(0,70,32):
    for xx in range(0,120,32): can.alpha_composite(bg,(xx,yy))
  for img,dx in ((far,4),(near,0)):
    ang=math.degrees(math.atan2((tip-top),40))
    r=img.rotate(ang,resample=Image.NEAREST,expand=True,center=(6,2))
    # 脇の位置(top)を固定点に
    x=20+ (top+tip)/2 + dx - r.width/2
    can.alpha_composite(r,(int(x),int(12-lift + (40-40*math.cos(math.radians(ang)))*0)))
  frames.append(can.resize((360,210),Image.NEAREST))
frames[0].save('preview_crutch.gif',save_all=True,append_images=frames[1:],duration=60,loop=0)
Image.open('gen/crutch.png').resize((52,176),Image.NEAREST).save('z.png')
