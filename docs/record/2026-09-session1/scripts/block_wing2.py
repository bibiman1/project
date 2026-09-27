from PIL import Image, ImageDraw
import random
T=32; W,H=28*T,16*T
rnd=random.Random(3)
im=Image.new('RGB',(W,H),(112,142,160)); d=ImageDraw.Draw(im)
for _ in range(160):
  x=rnd.randrange(W); y=rnd.randrange(H); d.line((x,y,x+rnd.randint(6,20),y),fill=(140,168,184))
P=lambda pts:[(x*T,y*T) for x,y in pts]
TOP=(150,156,150); SIDE=(104,110,106); DK=(70,74,72)
# 北の主翼(奥)
d.polygon(P([(11,6),(17,6),(15.6,1.5),(13.2,1.5)]),fill=(140,146,140))
d.polygon(P([(13.2,1.5),(15.6,1.5),(15.6,1.8),(13.2,1.8)]),fill=SIDE)
# 胴体の南の側面(手前に見える壁)。舷窓と水線
d.polygon(P([(2,10),(23,10),(25.2,9),(26.2,8.2),(26.2,9.4),(25,10.6),(23,11.5),(2,11.5)]),fill=SIDE)
for k in range(18): d.ellipse(((3+k*1.1)*T,10.5*T,(3+k*1.1)*T+6,10.5*T+6),fill=(60,70,80))
d.line((2*T,11.5*T,23*T,11.5*T),fill=(60,64,62),width=3)
# 胴体の上面(歩ける)
d.polygon(P([(2,6.2),(23,6),(25.2,7),(26.2,8),(25.2,9),(23,10),(2,9.8)]),fill=TOP)
d.line((6*T,8*T,22*T,8*T),fill=(128,134,128))
# 南の主翼(手前)と、先端の厚み
d.polygon(P([(11,10),(17,10),(15.6,14.8),(13.2,14.8)]),fill=(144,150,144))
d.polygon(P([(13.2,14.8),(15.6,14.8),(15.6,15.2),(13.2,15.2)]),fill=SIDE)
# 背中の発射筒3対(一段高い筒)
for k in range(3):
  x0=8+k*3.1; x1=x0+2.6
  for (y0,y1) in ((6.2,7.0),(9.0,9.8)):
    d.rectangle((x0*T,(y0-0.25)*T,x1*T,(y1-0.25)*T),fill=(176,180,172),outline=(96,100,96))
    d.rectangle((x0*T,(y1-0.25)*T,x1*T,y1*T),fill=(120,124,118))
# 乗降口
d.rectangle((17.2*T,7.5*T,17.9*T,8.5*T),fill=(54,56,54),outline=(30,30,30))
# 操縦席の窓(機首の上)
d.polygon(P([(22.2,7.1),(24.2,7.3),(24.2,8.7),(22.2,8.9)]),fill=(168,194,208))
# 機首の両脇のパイロンと、片側4基のジェット(高い位置)
for (y0,sgn) in ((3.3,-1),(10.1,1)):
  d.rectangle((18.2*T,(y0-0.3)*T,21*T,(y0+2.5)*T),fill=(118,122,118))
  for k in range(4):
    y=y0+k*0.62
    d.rectangle((18*T,y*T,21.4*T,(y+0.5)*T),fill=(88,92,96),outline=(50,52,54))
    d.ellipse((21.1*T,y*T,21.6*T,(y+0.5)*T),fill=(40,42,46))
# T字尾翼: 垂直尾翼が立ち上がり、上に水平尾翼
d.polygon(P([(1.8,8),(5.8,8),(4.6,4.2),(2.8,4.2)]),fill=(126,132,126))
d.polygon(P([(1.4,1.2),(4.8,1.2),(4.8,7.0),(1.4,7.0)]),fill=(160,166,160))
d.rectangle((1.4*T,7.0*T,4.8*T,7.3*T),fill=SIDE)
# 草、蓮、白鷺、錆
for (c,r) in [(14,3),(15,12.5),(9.5,8.3),(13.6,6.6),(20,9.2),(3,5)]:
  d.ellipse((c*T,r*T,c*T+22,r*T+12),fill=(118,140,84))
for (c,r) in [(13.8,4.4),(14.6,11.4)]: d.ellipse((c*T,r*T,c*T+16,r*T+10),fill=(210,150,170))
for (c,r) in [(16,2.2),(24,7.6)]: d.ellipse((c*T,r*T,c*T+10,r*T+14),fill=(244,244,238))
for _ in range(40):
  c=rnd.uniform(3,25); r=rnd.uniform(6.2,11.2); d.ellipse((c*T,r*T,c*T+rnd.randint(6,16),r*T+rnd.randint(3,8)),fill=(150,100,68))
im.save('gen/wing2_block.png'); im.crop((0,0,512,512)).save('gen/wb2_L.png'); im.crop((384,0,896,512)).save('gen/wb2_R.png')
im.resize((896,512)).save('z.png')
