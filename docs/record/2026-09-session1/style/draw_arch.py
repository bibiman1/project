import sys, math; sys.path.insert(0,'style')
from PIL import Image
from palette import RAMPS, hex2rgb
def R(f,i): return hex2rgb(RAMPS[f][i])+(255,)
WOOD=lambda i: R("焦げ茶/飴色(木)",i); PL=lambda i: R("生成り(漆喰・紙)",i); IRON=lambda i: R("鉄・ブリキ",i)
AI=lambda i: R("藍鼠(影・夜)",i); SKY=lambda i: R("夕空(茜→藤)",i)
OUT='/home/user/project/field/assets/worlds/haihei/'
def put(p,x,y,c,W=None,H=None):
  if 0<=x<p.size[0] and 0<=y<p.size[1]: p.putpixel((x,y),c)
def rect(p,x0,y0,x1,y1,c):
  for y in range(y0,y1):
    for x in range(x0,x1): put(p,x,y,c)
# ---------- 壁(32x64): 天井見切り / 長押 / 漆喰 / 笠木 / 腰板 / 巾木 ----------
def wall(post=False, window=False, garland=False, seed=0):
  im=Image.new('RGBA',(32,64),(0,0,0,0))
  rect(im,0,0,32,6,WOOD(1)); rect(im,0,6,32,7,WOOD(0))          # 天井の見切り(廻り縁)
  rect(im,0,7,32,40,PL(3))                                       # 漆喰
  for y in range(7,40):                                          # 漆喰のむら(ごく控えめ)
    for x in range((y*7+seed)%11,32,11): put(im,x,y,PL(2) if (x+y)%3 else PL(3))
  rect(im,0,12,32,15,WOOD(3)); rect(im,0,15,32,16,WOOD(1))        # 長押
  rect(im,0,38,32,40,PL(1))                                      # 腰板の上の影
  rect(im,0,40,32,42,WOOD(4)); rect(im,0,42,32,43,WOOD(1))        # 笠木
  rect(im,0,43,32,61,WOOD(3))                                    # 腰板
  for x in range(0,32,8): rect(im,x,43,x+1,61,WOOD(1)); rect(im,x+1,43,x+2,61,WOOD(4))
  rect(im,0,61,32,64,WOOD(0))                                    # 巾木
  if window:   # 上げ下げ窓(白い枠、上下2枚、細い桟)
    x0,x1,y0,y1=8,24,17,38
    rect(im,x0-1,y0-1,x1+1,y1+1,WOOD(1))
    rect(im,x0,y0,x1,y1,PL(4))
    for (a,b) in ((y0+1,(y0+y1)//2-1),((y0+y1)//2+1,y1-1)):
      for y in range(a,b):
        t=(y-y0)/(y1-y0)
        c=SKY(3) if t<0.3 else (SKY(2) if t<0.6 else SKY(1))
        rect(im,x0+1,y,x1-1,y+1,c)
      rect(im,(x0+x1)//2,a,(x0+x1)//2+1,b,PL(4))                 # 縦の桟
    rect(im,x0,(y0+y1)//2-1,x1,(y0+y1)//2+1,PL(4))                # 召し合わせ
    for k in range(3): put(im,x0+2+k,y0+2+k,PL(4))               # ガラスの映り込み
    rect(im,x0-2,y1+1,x1+2,y1+2,WOOD(2))                         # 窓台
  if post:     # 柱(左端)
    rect(im,0,6,5,64,WOOD(2)); rect(im,0,6,1,64,WOOD(4)); rect(im,4,6,5,64,WOOD(0))
  if garland:  # 文化祭の紙の輪飾り(タイルの両端で吊って、たるませる)
    cols=[R("紅葉・朱",2),R("銀杏",2),R("紺(着物・布)",3),R("苔・葉",3),PL(4)]
    for i,x in enumerate(range(0,32,3)):
      y=int(9+6*math.sin(math.pi*x/32))
      c=cols[(i+seed)%len(cols)]
      rect(im,x,y,x+3,y+2,c); put(im,x+1,y,AI(2) if False else c)
      put(im,x,y+2,WOOD(0))
    put(im,0,9,WOOD(0)); put(im,31,9,WOOD(0))
  return im
tiles={'aw':wall(),'aw_g':wall(garland=True),'aw_p':wall(post=True),'aw_pg':wall(post=True,garland=True),'aw_w':wall(window=True),'aw_wg':wall(window=True,garland=True),'aw_pw':wall(post=True,window=True)}
for k,v in tiles.items(): v.save(OUT+k+'.png')
# ---------- 扉(32x64): 洋風の板戸、上に小さなガラス、真鍮の取っ手、枠 ----------
d=Image.new('RGBA',(32,64),(0,0,0,0))
rect(d,4,10,28,62,WOOD(1)); rect(d,6,12,26,62,WOOD(3))
rect(d,6,12,7,62,WOOD(4)); rect(d,25,12,26,62,WOOD(2))
rect(d,9,15,23,27,WOOD(0)); rect(d,10,16,22,26,SKY(1))          # ガラス(向こうの部屋の夕日)
rect(d,15,16,17,26,WOOD(1)); rect(d,10,20,22,22,WOOD(1)); put(d,11,17,PL(4)); put(d,12,18,PL(4))
for (a,b) in ((31,45),(47,59)):
  rect(d,9,a,23,b,WOOD(2)); rect(d,10,a+1,22,b-1,WOOD(3)); rect(d,9,a,23,a+1,WOOD(1))
rect(d,21,40,24,43,R("宇宙軍(白・金)",3)); put(d,21,40,R("宇宙軍(白・金)",4))
rect(d,4,62,28,64,WOOD(0))
# 札(部屋番号の小さな木札)
rect(d,12,5,20,9,PL(3)); rect(d,12,5,20,6,WOOD(1))
d.save(OUT+'door.png')
print('tiles ok')
