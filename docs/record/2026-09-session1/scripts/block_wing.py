from PIL import Image, ImageDraw
import random
T=32; C,R=28,16; W,H=C*T,R*T
im=Image.new('RGB',(W,H),(112,142,160)); d=ImageDraw.Draw(im)
rnd=random.Random(3)
for _ in range(160):
  x=rnd.randrange(W); y=rnd.randrange(H); d.line((x,y,x+rnd.randint(6,20),y),fill=(150,176,190))
HULL=(126,134,126); DK=(96,102,96); P=lambda pts: [(x*T,y*T) for x,y in pts]
cy=8
# 主翼(左右)
d.polygon(P([(11,cy-1.4),(17,cy-1.4),(15.6,1.2),(13.2,1.2)]),fill=HULL)
d.polygon(P([(11,cy+1.4),(17,cy+1.4),(15.6,14.8),(13.2,14.8)]),fill=HULL)
# 機首の横のエンジン台(片側4基)
for sgn in (-1,1):
  d.polygon(P([(18,cy+sgn*1.4),(21,cy+sgn*1.4),(20.6,cy+sgn*4.2),(18.4,cy+sgn*4.2)]),fill=HULL)
  for k in range(4):
    x=18.3+k*0.62; y0,y1=(cy-4.1,cy-1.6) if sgn<0 else (cy+1.6,cy+4.1)
    d.rectangle((x*T,y0*T,(x+0.5)*T,y1*T),fill=(80,86,82))
# 水平尾翼
d.polygon(P([(1.5,cy-0.3),(5.8,cy-0.3),(5.4,cy-4),(1.9,cy-4)]),fill=HULL); d.polygon(P([(1.5,cy+0.3),(5.8,cy+0.3),(5.4,cy+4),(1.9,cy+4)]),fill=HULL)
# 胴体
d.polygon(P([(2,cy),(3,cy-1.4),(22,cy-1.5),(25,cy-0.9),(26.4,cy),(25,cy+0.9),(22,cy+1.5),(3,cy+1.4)]),fill=(134,142,134))
d.line((2*T,cy*T,26*T,cy*T),fill=(110,116,110))
# 垂直尾翼(上から見ると細い)
d.rectangle((2*T,(cy-0.2)*T,5.4*T,(cy+0.2)*T),fill=DK)
# 背中の発射筒3対
for k in range(3):
  for sgn in (-1,1):
    y0,y1=(cy-1.2,cy-0.3) if sgn<0 else (cy+0.3,cy+1.2)
    d.rectangle(((8+k*3.1)*T,y0*T,(10.6+k*3.1)*T,y1*T),fill=(150,154,146),outline=(80,84,80))
# 乗降ハッチ(エンジンの手前)
d.rectangle((17.2*T,(cy-0.5)*T,17.9*T,(cy+0.5)*T),fill=(60,62,60),outline=(30,30,30))
# 操縦席の窓
d.polygon(P([(22,cy-0.7),(24.3,cy-0.6),(24.3,cy+0.6),(22,cy+0.7)]),fill=(170,196,210))
d.polygon(P([(25,cy-0.9),(26.4,cy),(25,cy+0.9)]),fill=(200,200,190))
# 自然: 草、蓮、白鷺
for (c,r) in [(14,3),(15,12.5),(6,cy+0.8),(12,cy-0.2),(3.5,5.5),(4,10.5),(19.5,11)]:
  d.ellipse((c*T,r*T,c*T+22,r*T+12),fill=(118,140,84))
for (c,r) in [(13.8,5),(14.6,11),(20,5.6)]: d.ellipse((c*T,r*T,c*T+16,r*T+10),fill=(210,150,170))
for (c,r) in [(3,4.6),(16,2),(24,cy-0.5)]: d.ellipse((c*T,r*T,c*T+10,r*T+14),fill=(244,244,238))
# 南の岸壁(斜路のふち)
d.rectangle((0,15.3*T,W,H),fill=(150,146,134))
for x in range(0,W,T): d.line((x,15.3*T,x,H),fill=(120,116,106))
# 錆
for _ in range(40):
  c=rnd.uniform(3,25); r=rnd.uniform(cy-1.2,cy+1.2); d.ellipse((c*T,r*T,c*T+rnd.randint(6,16),r*T+rnd.randint(3,8)),fill=(150,100,68))
im.save('gen/wing_block.png'); im.resize((W//2,H//2),Image.NEAREST).save('gen/wing_block_half.png'); im.resize((896,512)).save('z.png')
