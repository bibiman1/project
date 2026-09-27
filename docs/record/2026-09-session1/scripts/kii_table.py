from PIL import Image
import math,sys
def draw(cx,base,out):
  im=Image.open('gen/elbow2.png').convert('RGBA'); px=im.load()
  RX,RY=11,7.5; cy=base-RY
  # 机に落ちる影
  for y in range(base-2,base+3):
    for x in range(cx-13,cx+14):
      if ((x-cx)/13)**2+((y-base)/2.6)**2<=1:
        r,g,b,a=px[x,y]; px[x,y]=(int(r*.72),int(g*.7),int(b*.72),255)
  cells=[(x,y) for y in range(int(cy-RY)-1,base+1) for x in range(cx-RX-1,cx+RX+2)
         if ((x+.5-cx)/RX)**2+((y+.5-cy)/RY)**2<=1]
  S=set(cells)
  for (x,y) in cells:
    for a in (-1,0,1):
      for b in (-1,0,1):
        if (x+a,y+b) not in S: px[x+a,y+b]=(74,50,40,255)
  for (x,y) in cells:
    t=((x+.5-cx)*0.45+(y+.5-cy))/RY   # 左上が明るい
    c=(250,238,196) if t<-0.35 else ((240,222,172) if t<0.45 else (214,188,138))
    px[x,y]=c+(255,)
  ey=int(cy)+1
  for ex in (cx-5,cx+4): px[ex,ey]=(20,14,14,255)
  for x in range(cx-1,cx+2): px[x,ey+1]=(228,128,60,255)
  px[cx,ey+2]=(196,100,48,255)
  im.save(out)
  return im
a=draw(72,153,'gen/vt_left.png'); b=draw(232,153,'gen/vt_right.png')
s=Image.new('RGBA',(960,500),(30,30,30,255))
s.alpha_composite(a.crop((0,98,320,176)).resize((960,234),Image.NEAREST),(0,0))
s.alpha_composite(b.crop((0,98,320,176)).resize((960,234),Image.NEAREST),(0,250))
s.save('z.png')
