import sys, math; sys.path.insert(0,'style')
from PIL import Image
from palette import RAMPS, hex2rgb
from draw_arch import rect, put, WOOD, PL, IRON, AI, SKY, R
W,H=512,176
FULL=544
im=Image.new('RGBA',(FULL,H),(0,0,0,0))
# --- 屋根(灰色の鉄板葺き、寄棟。見下ろしなので前の斜面が帯に見える) ---
RT,RB=2,54         # 棟と軒
for y in range(RT,RB):
  t=(y-RT)/(RB-RT)
  inset=int((1-t)*34)            # 寄棟の隅棟: 上ほど内側
  for x in range(inset,W-inset):
    c=IRON(2) if t<0.5 else IRON(1)
    if x%8==0: c=IRON(3)                       # 瓦棒(縦の継ぎ目)
    if x<inset+ (40 if False else 0): pass
    put(im,x,y,c)
  # 隅棟の斜面(左は西日で明るく、右は暗い)
  for x in range(0,inset):
    if x>=inset-34 and x>=int((1-t)*0): pass
for y in range(RT,RB):
  t=(y-RT)/(RB-RT); inset=int((1-t)*34)
  for x in range(max(0,inset-34+int(t*34)),inset): pass
# 妻側の三角(左右の隅棟の面)
for y in range(RT,RB):
  t=(y-RT)/(RB-RT); inset=int((1-t)*34)
  for x in range(0,inset):
    if x>= (inset - int(t*0)) : continue
  # 左の面: 軒から棟へ向かう三角
  for x in range(int(34*(1-t))-int(34*(1-t)),int(34*(1-t))):
    pass
# わかりやすく描き直す: 隅棟の三角面
for y in range(RT,RB):
  t=(y-RT)/(RB-RT); inset=int((1-t)*34)
  for x in range(0,inset):
    if x >= inset*(1-t)*0 and x < inset and x >= int((RB-y)*0): 
      if x > inset - 1 - int(t*0): pass
for y in range(RT,RB):
  t=(y-RT)/(RB-RT); inset=int((1-t)*34)
  lx=int(t*0)
  for x in range(0,inset):
    if x>= 34-inset-0 and False: pass
# 左右の隅の面は、軒のところで全幅、棟のところで幅0の三角
for y in range(RT,RB):
  t=(y-RT)/(RB-RT); inset=int((1-t)*34)
  for x in range(34-int(34*t) - (34-inset) , inset) if False else []: pass
for y in range(RT,RB):
  t=(y-RT)/(RB-RT); inset=int((1-t)*34)
  for x in range(inset-inset, inset):
    # 三角: x が inset より左で、(inset - x) < inset*... 軒に近いほど広い
    if x >= inset - int(34*t): put(im,x,y,IRON(3) if x<inset-1 else IRON(0))
  for x in range(W-inset, W-inset+int(34*t)):
    if x<W: put(im,x,y,IRON(0) if x>W-inset else IRON(1))
rect(im,34,RT,W-34,RT+2,IRON(3))                                  # 棟
rect(im,0,RB,W,RB+3,IRON(0)); rect(im,0,RB,W,RB+1,IRON(3))        # 軒先
# 煙突(ボイラー)
rect(im,64,0,74,22,R("紅葉・朱",0)); rect(im,64,0,66,22,R("紅葉・朱",1)); rect(im,62,0,76,3,IRON(1))
# --- 壁(生成りのペンキ塗り下見板) ---
def clap(y0,y1):
  for y in range(y0,y1):
    c=PL(3) if (y-y0)%4<3 else PL(1)
    if (y-y0)%4==0: c=PL(4)
    rect(im,4,y,W-4,y+1,c)
  rect(im,4,y0,6,y1,PL(4)); rect(im,W-6,y0,W-4,y1,PL(1))            # 隅の見切り
clap(RB+3,106)     # 2階
clap(120,160)      # 1階
def sash(x,y,h):   # 上げ下げ窓(白い枠)
  rect(im,x-1,y-1,x+15,y+h+1,WOOD(1)); rect(im,x,y,x+14,y+h,PL(4))
  for yy in range(y+1,y+h-1):
    if yy in (y+h//2-1,y+h//2): continue
    t=(yy-y)/h; c=SKY(3) if t<0.35 else (SKY(2) if t<0.7 else AI(3))
    rect(im,x+1,yy,x+7,yy+1,c); rect(im,x+8,yy,x+13,yy+1,c)
  rect(im,x,y+h//2-1,x+14,y+h//2+1,PL(4))
  put(im,x+2,y+2,PL(4)); put(im,x+3,y+3,PL(4))
  rect(im,x-2,y+h+1,x+16,y+h+2,PL(1))
for i in range(16):
  x=9+i*32
  sash(x,64,30)                       # 2階の窓
  if not (7<=i<=8): sash(x,126,26)    # 1階の窓(中央は玄関)
# --- 下屋(1階の庇、鉄板) ---
for y in range(106,120):
  t=(y-106)/14
  for x in range(0,W): put(im,x,y,IRON(2) if t<0.6 else IRON(1))
for x in range(0,W,8): rect(im,x,106,x+1,118,IRON(3))
rect(im,0,118,W,121,IRON(0)); rect(im,0,118,W,119,IRON(3))
# --- 玄関(格子戸) ---
gx0,gx1=232,280
rect(im,gx0-3,121,gx1+3,162,WOOD(1))
rect(im,gx0,124,gx1,162,WOOD(2))
for x in range(gx0+2,gx1-1,4): rect(im,x,126,x+1,160,WOOD(0))         # 縦格子
for y in (134,146): rect(im,gx0,y,gx1,y+1,WOOD(0))
rect(im,(gx0+gx1)//2,124,(gx0+gx1)//2+1,162,WOOD(0))
for x in range(gx0+1,gx1): 
  for y in range(126,160):
    if im.getpixel((x,y))==WOOD(2) and (x+y)%2==0: put(im,x,y,SKY(0))  # 格子の奥の暗がり
rect(im,gx0-6,121,gx1+6,124,WOOD(3))                                  # 鴨居
# 表札(縦の白い板)
rect(im,gx1+8,126,gx1+13,150,PL(4)); rect(im,gx1+8,126,gx1+13,127,WOOD(1))
for y in range(129,148,3): rect(im,gx1+10,y,gx1+11,y+2,AI(2))
# --- 下屋の柱と縁側 ---
for x in range(6,W,64):
  if gx0-8<x<gx1+8: continue
  rect(im,x,119,x+4,166,WOOD(2)); rect(im,x,119,x+1,166,WOOD(4)); rect(im,x+3,119,x+4,166,WOOD(0))
for x in (gx0-10,gx1+16):
  rect(im,x,119,x+4,166,WOOD(2)); rect(im,x,119,x+1,166,WOOD(4))
rect(im,0,160,W,166,WOOD(3))                                           # 縁側の板
for x in range(0,W,12): rect(im,x,160,x+1,166,WOOD(2))
rect(im,0,166,W,168,WOOD(0))
# 基礎の石と、玄関の石段
for x in range(0,W,16): rect(im,x+2,168,x+13,172,R("鉄・ブリキ",2)); rect(im,x+2,168,x+13,169,R("鉄・ブリキ",3))
rect(im,gx0-6,166,gx1+6,171,IRON(2)); rect(im,gx0-10,171,gx1+10,176,IRON(2)); rect(im,gx0-10,171,gx1+10,172,IRON(3))
# --- 渡り廊下(東の病棟へ。低い鉄板の屋根、細い柱、板の床。画面の外へ続く) ---
for y in range(112,124):
  for x in range(W,FULL): put(im,x,y,IRON(2) if y<120 else IRON(1))
for x in range(W,FULL,8): rect(im,x,112,x+1,122,IRON(3))
rect(im,W,122,FULL,125,IRON(0)); rect(im,W,122,FULL,123,IRON(3))
for x in (W+8,W+26):
  rect(im,x,125,x+3,166,WOOD(2)); rect(im,x,125,x+1,166,WOOD(4))
rect(im,W,160,FULL,166,WOOD(3)); rect(im,W,166,FULL,168,WOOD(0))
for x in range(W,FULL,12): rect(im,x,160,x+1,166,WOOD(2))
rect(im,W,146,FULL,148,WOOD(2))                      # 手すり
im.save('/home/user/project/field/assets/worlds/haihei/facade.png')
b=Image.new('RGBA',(FULL,H+20),(196,160,110,255)); b.alpha_composite(im,(0,10)); b.resize((FULL*2,(H+20)*2),Image.NEAREST).save('z.png')
