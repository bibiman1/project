import sys, math; sys.path.insert(0,'style')
from PIL import Image
from draw_arch import rect, put, WOOD, PL, IRON, AI, R
OUT='/home/user/project/field/assets/worlds/haihei/'
MOSS=lambda i: R("苔・葉",i); RED=lambda i: R("赤(ごく少量)",i)
# 長椅子(壁ぎわ。見下ろしで座面と、手前の脚)
b=Image.new('RGBA',(64,32),(0,0,0,0))
rect(b,2,4,62,9,WOOD(2)); rect(b,2,4,62,5,WOOD(4))            # 背もたれ(壁に沿う)
rect(b,2,12,62,19,WOOD(4)); rect(b,2,12,62,13,WOOD(5)); rect(b,2,18,62,19,WOOD(1))   # 座面
for x in (6,56): rect(b,x,9,x+2,12,WOOD(1)); rect(b,x,19,x+3,28,WOOD(1)); rect(b,x,19,x+1,28,WOOD(3))
b.save(OUT+'bench.png')
# 柱時計(振り子、止まったまま)
c=Image.new('RGBA',(16,32),(0,0,0,0))
rect(c,1,0,15,30,WOOD(1)); rect(c,2,1,14,29,WOOD(3))
for y in range(3,13):
  for x in range(3,13):
    if (x-7.5)**2+(y-7.5)**2<=20: put(c,x,y,PL(4))
for y in range(3,13):
  for x in range(3,13):
    d=(x-7.5)**2+(y-7.5)**2
    if 20<d<=26: put(c,x,y,R("宇宙軍(白・金)",3))
rect(c,7,5,8,8,AI(0)); rect(c,8,7,11,8,AI(0))                  # 針(止まっている)
rect(c,4,15,12,27,AI(1)); rect(c,5,16,11,26,PL(1))             # 振り子の窓
rect(c,7,16,8,23,R("宇宙軍(白・金)",3)); rect(c,6,22,9,25,R("宇宙軍(白・金)",4))
c.save(OUT+'clock.png')
# 防火用水(赤いバケツを台に3つ)
f=Image.new('RGBA',(32,32),(0,0,0,0))
rect(f,2,20,30,23,WOOD(3)); rect(f,2,20,30,21,WOOD(4)); rect(f,4,23,6,30,WOOD(1)); rect(f,26,23,28,30,WOOD(1))
for i,x in enumerate((4,13,22)):
  rect(f,x,10,x+7,20,RED(1)); rect(f,x,10,x+7,11,RED(0)); rect(f,x+1,11,x+2,19,(200,90,80,255))
  rect(f,x,9,x+7,10,IRON(1)); put(f,x+3,7,IRON(2)); put(f,x+1,8,IRON(2)); put(f,x+5,8,IRON(2))
f.save(OUT+'firebucket.png')
# 葉蘭の鉢
g=Image.new('RGBA',(32,32),(0,0,0,0))
rect(g,10,22,22,30,R("紅葉・朱",0)); rect(g,9,21,23,23,R("紅葉・朱",1))
for k,ang in enumerate([-60,-35,-15,5,25,45,65]):
  a=math.radians(ang-90); L=12+(k%3)*2
  for t in range(L):
    x=16+math.cos(a)*t; y=21+math.sin(a)*t
    w=1 if t<3 or t>L-3 else 2
    for dx in range(w): put(g,int(x)+dx,int(y),MOSS(2 if dx==0 else 3))
g.save(OUT+'plant.png')
s=Image.new('RGBA',(4*80,40*2),(200,170,120,255))
for i,n in enumerate(['bench','clock','firebucket','plant']):
  im=Image.open(OUT+n+'.png'); s.alpha_composite(im,(i*80,4))
s.resize((1280,320),Image.NEAREST).save('z.png')
