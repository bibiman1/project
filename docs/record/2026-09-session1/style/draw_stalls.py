import sys, math, random; sys.path.insert(0,'style')
from PIL import Image
from draw_arch import rect, put, WOOD, PL, IRON, AI, SKY, R
NAVY=lambda i: R("紺(着物・布)",i); SHU=lambda i: R("紅葉・朱",i); MOSS=lambda i: R("苔・葉",i); GINK=lambda i: R("銀杏",i)
OUT='/home/user/project/field/assets/worlds/haihei/'
def stall(W,H,cloth,stripe,top=8,ground=None):
  """共通の屋台: 細い柱4本、布の屋根(見下ろし)、染めの幕板、裸電球、折りたたみ机に布"""
  g=ground or H-10
  im=Image.new('RGBA',(W,H),(0,0,0,0))
  # 奥の柱
  for x in (10,W-12): rect(im,x,top+10,x+2,g-22,WOOD(1))
  # 屋根の布(見下ろしの面)
  for y in range(top,top+14):
    inset=int((top+14-y)*0.4)
    for x in range(4+inset,W-4-inset):
      c=cloth(3) if ((x//8)%2==0) else stripe
      if y==top: c=cloth(1)
      put(im,x,y,c)
  # 幕板(前の垂れ、裾は波形)
  for x in range(3,W-3):
    h=8+(2 if (x//6)%2==0 else 0)
    for y in range(top+14,top+14+h):
      put(im,x,y,cloth(2) if y<top+14+h-1 else cloth(0))
    put(im,x,top+14,cloth(3))
  for x in range(8,W-8,24):                       # 白い染め抜きの丸
    for dy in range(-2,3):
      for dx in range(-2,3):
        if dx*dx+dy*dy<=4: put(im,x+dx,top+18+dy,PL(4))
  # 裸電球
  for x in range(14,W-10,22):
    rect(im,x,top+24,x+1,top+28,AI(0)); rect(im,x-1,top+28,x+2,top+31,GINK(3)); put(im,x,top+28,PL(4))
  # 前の柱
  for x in (3,W-5): rect(im,x,top+10,x+2,g,WOOD(2)); rect(im,x,top+10,x+1,g,WOOD(4))
  return im,g
def counter(im,x0,x1,y,g,cloth):
  """折りたたみ机: 天板(見下ろし)と、前に垂らした布"""
  rect(im,x0,y,x1,y+6,WOOD(4)); rect(im,x0,y,x1,y+1,WOOD(5))
  rect(im,x0,y+6,x1,g-4,cloth(2)); rect(im,x0,y+6,x1,y+7,cloth(3)); rect(im,x0,g-5,x1,g-4,cloth(0))
  for x in range(x0+6,x1-2,10): rect(im,x,y+7,x+1,g-5,cloth(1))
  rect(im,x0+2,g-4,x0+4,g,WOOD(0)); rect(im,x1-4,g-4,x1-2,g,WOOD(0))
# ---- 焼きそば(紺の布、赤い提灯、鉄板) ----
im,g=stall(96,96,NAVY,PL(4))
counter(im,10,86,58,g,NAVY)
rect(im,20,50,66,58,IRON(0)); rect(im,21,51,65,57,IRON(1))            # 鉄板
rnd=random.Random(2)
for _ in range(90): put(im,rnd.randrange(24,60),rnd.randrange(52,57),GINK(rnd.choice([1,2,3])))
for (x,y) in [(30,52),(44,53),(52,52)]: put(im,x,y,MOSS(3))           # 青のり
rect(im,68,52,71,57,IRON(3)); rect(im,72,50,74,56,IRON(2))            # へら
for yy in range(40,50):                                                # 湯気
  put(im,36+int(2*math.sin(yy/2)),yy,(236,232,220,150)); put(im,48+int(2*math.cos(yy/2)),yy-2,(236,232,220,120))
for x in (0,90):                                                       # 提灯
  rect(im,x+1,30,x+6,42,SHU(2)); rect(im,x+1,30,x+6,31,AI(0)); rect(im,x+1,41,x+6,42,AI(0)); rect(im,x+2,33,x+5,34,SHU(3))
im.save(OUT+'yakisoba.png')
# ---- 綿あめ(生成りに朱の縞、綿あめ機と袋) ----
im,g=stall(96,96,lambda i: PL(min(4,i+1)),SHU(2))
counter(im,10,86,58,g,lambda i: SHU(i))
for i,c in enumerate([R("夕空(茜→藤)",3),GINK(3),MOSS(3),R("夕空(茜→藤)",2),NAVY(3)]):   # 吊るした袋
  x=16+i*14; rect(im,x,36,x+1,40,AI(0)); rect(im,x-3,40,x+4,49,c); rect(im,x-3,40,x+4,41,PL(4))
rect(im,56,44,80,58,IRON(2)); rect(im,57,45,79,50,IRON(3)); rect(im,58,44,78,45,IRON(1))   # 綿あめ機
for dy in range(-5,4):
  for dx in range(-8,9):
    if (dx/8)**2+(dy/5)**2<=1 and random.Random(dx*7+dy).random()>0.1: put(im,68+dx,42+dy,PL(4) if dy<0 else R("夕空(茜→藤)",3))
rect(im,24,50,25,58,WOOD(3))                                          # 割り箸に刺した綿あめ
for dy in range(-4,4):
  for dx in range(-5,6):
    if (dx/5)**2+(dy/4)**2<=1: put(im,24+dx,46+dy,PL(4) if dx+dy<2 else R("夕空(茜→藤)",3))
im.save(OUT+'wataame.png')
# ---- 射的(苔の緑の布、景品棚、コルク銃) ----
im,g=stall(128,96,MOSS,PL(4))
for k,y in enumerate((34,44,54)):                                      # 景品棚(3段)
  rect(im,16,y+6,112,y+8,WOOD(2))
  for x in range(20,108,9):
    if k==1 and x==56: continue   # 景品の単結晶の場所(光はコードで描く)
    c=[SHU(2),NAVY(3),GINK(2),R("夕空(茜→藤)",2),MOSS(2),PL(4)][(x//9+k)%6]
    rect(im,x,y,x+6,y+6,c); rect(im,x,y,x+6,y+1,PL(4))
counter(im,8,120,66,g,MOSS)
for x in (40,78):                                                      # コルク銃
  rect(im,x,62,x+18,64,WOOD(1)); rect(im,x+14,61,x+22,63,IRON(1)); rect(im,x,64,x+4,67,WOOD(1))
im.save(OUT+'shateki.png')
# ---- 受付(白いテント、白布の机、芳名帳と呼び鈴) ----
im,g=stall(96,64,lambda i: PL(min(4,i+1)),PL(2),top=2,ground=60)
counter(im,8,88,36,60,lambda i: PL(min(4,i+1)))
rect(im,22,31,44,37,PL(4)); rect(im,33,31,34,37,AI(2))                 # 芳名帳
for y in range(32,36,2): rect(im,24,y,31,y+1,AI(3)); rect(im,36,y,43,y+1,AI(3))
rect(im,60,32,66,36,R("宇宙軍(白・金)",3)); put(im,63,31,R("宇宙軍(白・金)",4))   # 呼び鈴
rect(im,72,30,80,37,SHU(2)); rect(im,72,30,80,31,SHU(3))              # 景品の箱
im.save(OUT+'uketsuke.png')
# ---- 舞台(木の額縁、朱の幕、縞の背幕、板の床) ----
W,H=256,96
im=Image.new('RGBA',(W,H),(0,0,0,0))
for x in range(20,W-20):                                               # 背幕(生成りと茜の縞)
  for y in range(10,70): put(im,x,y,PL(3) if (x//6)%2==0 else R("夕空(茜→藤)",3))
for y in range(70,86):                                                 # 床(板張り)
  for x in range(12,W-12): put(im,x,y,WOOD(4) if (y-70)%4 else WOOD(3))
rect(im,12,86,W-12,96,WOOD(1)); rect(im,12,86,W-12,87,WOOD(5))        # 舞台の前面
for x in range(24,W-24,16): rect(im,x,88,x+1,96,WOOD(0))
rect(im,W//2-16,90,W//2+16,96,WOOD(3)); rect(im,W//2-16,90,W//2+16,91,WOOD(5))   # 中央の段
for side in (0,1):                                                     # 袖幕(朱)
  for x in range(0,34):
    xx=20+x if side==0 else W-21-x
    for y in range(8,72-int(x*0.3)):
      put(im,xx,y,SHU(2) if (x//4)%2==0 else SHU(1))
for x in range(12,W-12):                                               # 一文字幕(波形)
  for y in range(4,14+(3 if (x//10)%2==0 else 0)): put(im,x,y,SHU(2) if y<12 else SHU(1))
rect(im,6,0,W-6,5,WOOD(2)); rect(im,6,0,W-6,1,WOOD(5))                # 額縁(上)
for x0 in (6,W-12):                                                    # 額縁(柱)
  rect(im,x0,0,x0+6,86,WOOD(2)); rect(im,x0,0,x0+1,86,WOOD(5)); rect(im,x0+5,0,x0+6,86,WOOD(0))
im.save(OUT+'stage.png')
ns=['yakisoba','wataame','shateki','uketsuke','stage']
s=Image.new('RGBA',(5*300,300),(150,110,80,255))
for i,n in enumerate(ns):
  a=Image.open(OUT+n+'.png'); k=max(1,min(290//a.width,290//a.height)); s.alpha_composite(a.resize((a.width*k,a.height*k),Image.NEAREST),(i*300,0))
s.save('z.png')
