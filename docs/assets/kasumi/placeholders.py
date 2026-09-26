# 霞ヶ浦の仮素材(PixelLab の回数が戻ったら、設計図と下絵から生成して差し替える)
from PIL import Image, ImageDraw
import math, random
O='/home/user/project/field/assets/worlds/kasumi/'
shore=Image.open(O+'bg_shore_wip.png').convert('RGB')
T=32
# ---- A 蓮田のあぜ道(12x14) ----
W,H=12*T,14*T
a=Image.new('RGB',(W,H))
strip=shore.crop((0,556,1024,640))   # 岸の地図の下端の蓮田
for y in range(0,H,strip.height):
  for x in range(0,W,strip.width): a.paste(strip,(x-200,y))
d=ImageDraw.Draw(a)
d.rectangle((5*T,0,7*T,H),fill=(172,150,112))
rnd=random.Random(1)
for _ in range(260): x=rnd.randrange(5*T,7*T); y=rnd.randrange(0,H); d.point((x,y),fill=(150,128,94))
for x in (5*T,7*T-1): d.line((x,0,x,H),fill=(120,100,70))
m=Image.new('RGBA',(W,H),(0,0,0,0)); md=ImageDraw.Draw(m)
for y in range(0,H,64): md.rectangle((0,y+20,W,y+34),fill=(226,230,232,70))
a=Image.alpha_composite(a.convert('RGBA'),m)
d=ImageDraw.Draw(a)
# 門柱(北の端)
for x in (4.4*T,7.1*T): d.rectangle((x,0,x+0.5*T,1.2*T),fill=(170,166,158),outline=(90,86,80))
a.save(O+'bg_lotus.png')
# 案山子
s=Image.new('RGBA',(32,48),(0,0,0,0)); d=ImageDraw.Draw(s)
d.line((16,14,17,47),fill=(110,80,50),width=2); d.line((4,20,28,17),fill=(110,80,50),width=2)
d.polygon([(8,18),(24,16),(22,32),(10,33)],fill=(60,70,100)); d.ellipse((10,3,22,15),fill=(220,200,160),outline=(90,70,50)); d.polygon([(7,6),(25,4),(22,0),(10,1)],fill=(200,170,90))
s=s.rotate(8,resample=Image.NEAREST,expand=False); s.save(O+'scarecrow.png')
# ---- C 格納庫の中(14x10) ----
W,H=14*T,10*T
c=Image.new('RGB',(W,H),(150,146,138)); d=ImageDraw.Draw(c)
d.rectangle((0,0,W,2*T),fill=(96,98,100))
for x in range(0,W,T): d.line((x,0,x+T,2*T),fill=(120,122,124),width=2); d.line((x+T,0,x,2*T),fill=(120,122,124),width=2)
for k in range(5): d.rectangle((1*T+k*2.6*T,0.5*T,1.7*T+k*2.6*T,1.1*T),fill=(200,196,160))
for y in range(2*T,H,T): d.line((0,y,W,y),fill=(140,136,128))
for x in range(0,W,2*T): d.line((x,2*T,x,H),fill=(140,136,128))
rnd=random.Random(3)
for _ in range(20): x=rnd.randrange(W); y=rnd.randrange(2*T,H); d.ellipse((x,y,x+rnd.randint(10,30),y+rnd.randint(4,10)),fill=(132,140,100))
d.rectangle((6*T,H-6,8*T,H),fill=(210,196,160))   # 入口の光
c.save(O+'bg_hangar.png')
def obj(w,h,fn,draw):
  im=Image.new('RGBA',(w,h),(0,0,0,0)); draw(ImageDraw.Draw(im)); im.save(O+fn)
obj(128,64,'plane.png',lambda d:(d.polygon([(4,40),(90,34),(124,40),(90,46)],fill=(150,150,120),outline=(60,60,50)),d.polygon([(40,38),(70,38),(80,8),(60,8)],fill=(140,140,112),outline=(60,60,50)),d.polygon([(40,42),(70,42),(56,60),(46,60)],fill=(120,120,96),outline=(60,60,50)),d.ellipse((114,34,124,46),fill=(80,80,70))))
obj(96,48,'workbench.png',lambda d:(d.rectangle((4,18,92,28),fill=(150,108,70),outline=(70,50,34)),d.rectangle((8,28,14,46),fill=(110,80,50)),d.rectangle((82,28,88,46),fill=(110,80,50)),d.rectangle((20,10,34,18),fill=(120,124,130)),d.rectangle((60,12,72,18),fill=(170,60,50))))
obj(96,48,'drums.png',lambda d:[d.rounded_rectangle((4+k*22,10,22+k*22,44),radius=3,fill=(150,80,54),outline=(80,40,30)) for k in range(4)])
obj(160,72,'gondola.png',lambda d:(d.rounded_rectangle((4,14,156,62),radius=22,fill=(196,186,156),outline=(90,80,60)),[d.rectangle((22+k*16,24,32+k*16,36),fill=(170,196,210),outline=(90,80,60)) for k in range(8)],d.rectangle((136,38,148,62),fill=(110,90,70))))
# 地上ぼぎクルー(笹野一刀彫: お鷹ぽっぽ・せきれい・鶏)
def carving(fn,body,beak,head_off=0,tail=False):
  im=Image.new('RGBA',(32,48),(0,0,0,0)); d=ImageDraw.Draw(im)
  d.rounded_rectangle((9,16,23,46),radius=7,fill=body,outline=(90,70,50))
  d.ellipse((10,4+head_off,22,17+head_off),fill=body,outline=(90,70,50))
  d.polygon([(21,10+head_off),(27,12+head_off),(21,14+head_off)],fill=beak)
  d.point((18,9+head_off),fill=(20,16,14))
  for k in range(4): d.arc((1+k*2,18+k*5,17+k*2,30+k*5),200,330,fill=(222,196,150),width=2)
  if tail:
    for k in range(3): d.arc((0,30+k*3,14,44+k*3),180,280,fill=(222,196,150),width=2)
  d.rectangle((10,2+head_off,22,6+head_off),fill=(50,60,90))
  im.save(O+fn)
carving('crew_hawk.png',(230,210,170),(230,180,60))
carving('crew_wagtail.png',(210,200,190),(60,60,60),2)
carving('crew_rooster.png',(240,230,214),(230,170,60),0,True)
# ---- D 操縦席(10x7) ----
W,H=10*T,7*T
dd=Image.new('RGB',(W,H),(70,74,72)); d=ImageDraw.Draw(dd)
d.rectangle((0,0,W,2.2*T),fill=(40,44,46))
for k in range(4): d.polygon([(1*T+k*2*T,0.2*T),(2.8*T+k*2*T,0.2*T),(2.6*T+k*2*T,1.4*T),(1.2*T+k*2*T,1.4*T)],fill=(214,190,170))
d.rectangle((0,1.5*T,W,2.6*T),fill=(58,62,60))
rnd=random.Random(5)
for k in range(22):
  x=0.5*T+k*0.42*T; d.ellipse((x,1.7*T,x+10,1.7*T+10),fill=(30,32,30),outline=(150,150,140)); d.line((x+5,1.7*T+5,x+5+rnd.randint(-4,4),1.7*T+1),fill=(220,220,200))
for y in range(3*T,H,T): d.line((0,y,W,y),fill=(64,68,66))
dd.save(O+'bg_cockpit.png')
obj(48,64,'seat.png',lambda d:(d.rounded_rectangle((8,4,40,40),radius=6,fill=(96,70,52),outline=(40,30,24)),d.rectangle((6,40,42,56),fill=(80,60,44),outline=(40,30,24))))
def mummy(d):
  d.rounded_rectangle((8,4,40,40),radius=6,fill=(96,70,52),outline=(40,30,24)); d.rectangle((6,40,42,56),fill=(80,60,44),outline=(40,30,24))
  d.ellipse((14,2,34,22),fill=(200,196,180),outline=(80,80,70)); d.ellipse((17,6,31,18),fill=(60,50,40)); d.ellipse((19,8,29,16),fill=(150,120,90))
  d.rounded_rectangle((12,20,36,46),radius=6,fill=(170,150,90),outline=(80,70,40)); d.rectangle((20,26,28,32),fill=(120,120,110))
  d.line((22,22,30,40),fill=(90,90,80),width=2)
obj(48,64,'mummy.png',mummy)
# ---- E 遊覧飛行の層 ----
W,H=480,300
sky=Image.new('RGB',(W,H)); d=ImageDraw.Draw(sky)
for y in range(H):
  u=y/H; c=(int(120+120*u),int(130+80*u),int(170-20*u)); d.line((0,y,W,y),fill=c)
d.ellipse((330,90,390,150),fill=(255,226,170)); sky.save(O+'fl_sky.png')
hills=Image.new('RGBA',(960,90),(0,0,0,0)); d=ImageDraw.Draw(hills)
pts=[(0,90)]+[(x,60-24*math.sin(x/70)-10*math.sin(x/23)) for x in range(0,961,8)]+[(960,90)]
d.polygon(pts,fill=(96,104,128)); hills.save(O+'fl_hills.png')
water=Image.new('RGB',(960,130)); d=ImageDraw.Draw(water)
for y in range(130):
  u=y/130; d.line((0,y,960,y),fill=(int(150-50*u),int(160-40*u),int(180-30*u)))
rnd=random.Random(8)
for _ in range(500):
  x=rnd.randrange(960); y=rnd.randrange(130); L=4+int(y/10); d.line((x,y,x+L,y),fill=(230,210,180) if rnd.random()<0.3 else (190,200,210))
water.save(O+'fl_water.png')
mist=Image.new('RGBA',(960,40),(0,0,0,0)); d=ImageDraw.Draw(mist)
for x in range(0,960,6): d.ellipse((x,10+8*math.sin(x/40),x+60,30+8*math.sin(x/40)),fill=(236,236,236,40))
mist.save(O+'fl_mist.png')
ek=Image.new('RGBA',(220,80),(0,0,0,0)); d=ImageDraw.Draw(ek)
d.polygon([(6,50),(20,36),(180,34),(206,44),(214,54),(200,62),(120,70),(20,66)],fill=(118,126,120),outline=(50,54,52))
d.polygon([(10,36),(30,36),(22,4),(10,4)],fill=(108,116,110),outline=(50,54,52)); d.rectangle((2,2,34,6),fill=(108,116,110))
d.polygon([(166,36),(190,36),(188,42),(166,42)],fill=(170,196,210),outline=(50,54,52))
for k in range(4): d.rectangle((140+k*6,22,144+k*6,32),fill=(84,90,86))
d.polygon([(80,52),(130,52),(128,58),(80,58)],fill=(96,104,98))
for (x,y) in [(60,38),(100,40),(150,44)]: d.ellipse((x,y-6,x+10,y),fill=(120,150,80))
ek.save(O+'fl_ekrano.png')
# 仮のキメ絵
v=sky.resize((320,192)).convert('RGBA'); v.alpha_composite(hills.crop((0,0,320,90)),(0,70)); v.paste(water.crop((0,0,320,60)),(0,132))
e2=ek.resize((176,64),Image.NEAREST); v.alpha_composite(e2,(70,86)); v.save(O+'v_flight.png')
# 懲罰空間の台座の模型
ic=Image.new('RGBA',(48,48),(0,0,0,0)); d=ImageDraw.Draw(ic)
d.polygon([(4,30),(10,24),(38,23),(44,28),(38,32),(10,34)],fill=(118,126,120),outline=(50,54,52)); d.polygon([(6,24),(12,24),(10,12),(6,12)],fill=(108,116,110)); d.polygon([(20,28),(30,28),(34,40),(26,40)],fill=(108,116,110))
ic.save('/home/user/project/field/assets/worlds/void/frag_kasumi.png')
print('ok')
