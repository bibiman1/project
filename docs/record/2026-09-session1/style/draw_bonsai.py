import sys, math, random; sys.path.insert(0,'style')
from PIL import Image
from draw_arch import rect, put, WOOD, PL, IRON, AI, R
MOSS=lambda i: R("苔・葉",i); MAPLE=lambda i: R("紅葉・朱",i); GINK=lambda i: R("銀杏",i); NAVY=lambda i: R("紺(着物・布)",i)
def blob(im,cx,cy,rx,ry,ramp,seed):
  rnd=random.Random(seed)
  for y in range(int(cy-ry)-1,int(cy+ry)+2):
    for x in range(int(cx-rx)-1,int(cx+rx)+2):
      d=((x-cx)/rx)**2+((y-cy)/ry)**2
      if d<=1 and rnd.random()>0.08:
        t=(x-cx)/rx*0.6+(y-cy)/ry*0.8          # 左上が明るい
        put(im,x,y,ramp(3) if t<-0.5 else (ramp(2) if t<0.3 else ramp(1)))
  # 下の縁に影
  for x in range(int(cx-rx)+1,int(cx+rx)):
    put(im,x,int(cy+ry),ramp(0))
def trunk(im,pts,w=2):
  for (x0,y0),(x1,y1) in zip(pts,pts[1:]):
    n=max(abs(x1-x0),abs(y1-y0))+1
    for i in range(n):
      x=round(x0+(x1-x0)*i/n); y=round(y0+(y1-y0)*i/n)
      for k in range(w): put(im,x+k,y,WOOD(1) if k==w-1 else WOOD(2))
def pot(im,cx,y,w,glaze):
  rect(im,cx-w//2,y,cx+w//2,y+4,glaze(1)); rect(im,cx-w//2,y,cx+w//2,y+1,glaze(2))
  rect(im,cx-w//2+1,y+4,cx-w//2+3,y+5,WOOD(0)); rect(im,cx+w//2-3,y+4,cx+w//2-1,y+5,WOOD(0))
  rect(im,cx-w//2+1,y-1,cx+w//2-1,y,WOOD(1))                 # 土
def bonsai(im,cx,base,kind,seed):
  if kind=='pine':      # 黒松: 曲がった幹に、緑の葉の段
    pot(im,cx,base-5,16,lambda i: NAVY(i+1))
    trunk(im,[(cx-1,base-6),(cx-3,base-11),(cx+1,base-15),(cx-1,base-19)])
    blob(im,cx-5,base-13,5,2.2,MOSS,seed); blob(im,cx+4,base-16,5,2.2,MOSS,seed+1); blob(im,cx-1,base-21,4,2.4,MOSS,seed+2)
  if kind=='maple':     # もみじ: 丸い樹冠が朱に色づく
    pot(im,cx,base-5,14,lambda i: IRON(i+1))
    trunk(im,[(cx,base-6),(cx-1,base-12)],3)
    blob(im,cx,base-16,7,5,MAPLE,seed)
  if kind=='ginkgo':    # 銀杏: すっと立つ幹に黄色
    pot(im,cx,base-5,12,lambda i: WOOD(i+1))
    trunk(im,[(cx,base-6),(cx,base-12)],3)
    trunk(im,[(cx,base-11),(cx-4,base-15)],1); trunk(im,[(cx+2,base-12),(cx+5,base-16)],1)
    blob(im,cx-4,base-17,4,3,GINK,seed); blob(im,cx+4,base-18,4,3,GINK,seed+1); blob(im,cx,base-21,4,3,GINK,seed+2)
  if kind=='cascade':   # 懸崖の五葉松: 鉢から垂れ下がる
    rect(im,cx-5,base-10,cx+5,base-2,NAVY(2)); rect(im,cx-5,base-10,cx+5,base-9,NAVY(3)); rect(im,cx-4,base-11,cx+4,base-10,WOOD(1))
    trunk(im,[(cx,base-11),(cx+4,base-13),(cx+8,base-9),(cx+10,base-3)])
    blob(im,cx-2,base-14,4,2,MOSS,seed); blob(im,cx+9,base-6,3,3,MOSS,seed+1)
  if kind=='satsuki':   # さつき: 丸く刈り込んだ緑に、桃色の花
    pot(im,cx,base-5,16,lambda i: WOOD(i+1))
    trunk(im,[(cx-1,base-6),(cx-1,base-10)],3)
    blob(im,cx,base-14,8,4.5,MOSS,seed)
    rnd=random.Random(seed)
    for _ in range(14):
      x=cx+rnd.randint(-7,7); y=base-14+rnd.randint(-4,3)
      if ((x-cx)/8)**2+((y-(base-14))/4.5)**2<0.9: put(im,x,y,R("夕空(茜→藤)",2)); put(im,x,y-1,R("夕空(茜→藤)",3)) if rnd.random()<0.4 else None
  if kind=='shimpaku':  # 真柏: 白い舎利(枯れた幹)と灰緑の葉
    pot(im,cx,base-5,14,lambda i: IRON(i+1))
    for (x,y) in [(cx,base-6),(cx+1,base-8),(cx,base-10),(cx-1,base-12),(cx,base-14)]:
      put(im,x,y,PL(4)); put(im,x+1,y,PL(2))
    blob(im,cx+4,base-12,4,2.2,MOSS,seed); blob(im,cx-4,base-16,4,2.4,MOSS,seed+3)
def table(kinds,seed):
  W,H=128,48
  im=Image.new('RGBA',(W,H),(0,0,0,0))
  # 長机に白い布(天板を見下ろし、手前に布が垂れる)
  ty=24
  rect(im,1,ty,W-1,ty+10,PL(4)); rect(im,1,ty,W-1,ty+1,PL(3))
  rect(im,1,ty+10,W-1,ty+20,PL(3))
  for x in range(4,W-2,9): rect(im,x,ty+10,x+1,ty+20,PL(2))       # 布のひだ
  rect(im,1,ty+20,W-1,ty+21,PL(1))
  rect(im,4,ty+21,8,ty+24,WOOD(0)); rect(im,W-8,ty+21,W-4,ty+24,WOOD(0))   # 脚
  # 名札(小さな白い札)
  for i,k in enumerate(kinds):
    cx=16+i*32
    bonsai(im,cx,ty+8,k,seed+i*7)
    rect(im,cx-3,ty+7,cx+3,ty+9,PL(2)) if False else None
  return im
OUT='/home/user/project/field/assets/worlds/haihei/'
table(['pine','maple','ginkgo','satsuki'],1).save(OUT+'bonsai_table1.png')
table(['shimpaku','ginkgo','pine','maple'],5).save(OUT+'bonsai_table2.png')
a=Image.open(OUT+'bonsai_table1.png'); b=Image.open(OUT+'bonsai_table2.png')
s=Image.new('RGBA',(128*4,48*4*2+20),(120,80,50,255)); s.alpha_composite(a.resize((512,192),Image.NEAREST),(0,0)); s.alpha_composite(b.resize((512,192),Image.NEAREST),(0,212)); s.save('z.png')
