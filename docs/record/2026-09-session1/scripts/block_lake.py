from PIL import Image, ImageDraw
import random
W,H=480,320
rnd=random.Random(5)
im=Image.new('RGB',(W,H),(120,128,88)); d=ImageDraw.Draw(im)
# 田(蓮田と刈り取り後の田んぼ)の格子
for y in range(0,H,14):
  for x in range(0,W,22):
    c=rnd.choice([(128,134,90),(150,138,96),(112,130,86),(96,120,82)])
    d.rectangle((x+1,y+1,x+21,y+13),fill=c)
# 林と集落
for _ in range(40):
  x,y=rnd.randrange(W),rnd.randrange(H); d.ellipse((x,y,x+rnd.randint(10,26),y+rnd.randint(8,18)),fill=(70,92,64))
for _ in range(25):
  x,y=rnd.randrange(W),rnd.randrange(H)
  for k in range(4): d.rectangle((x+k*5,y+(k%2)*4,x+k*5+3,y+(k%2)*4+3),fill=(150,120,100))
# 湖(西浦: 北西に土浦入り、北に高浜入り)
lake=[(40,300),(20,250),(46,200),(30,150),(60,120),(40,70),(70,40),(120,60),(150,110),(190,120),(215,60),(250,20),(290,30),(270,90),(300,130),(360,120),(420,150),(460,200),(470,260),(440,300),(380,320),(120,320)]
d.polygon(lake,fill=(122,146,168))
d.polygon([(p[0]*0.97+8,p[1]*0.97+6) for p in lake],fill=(128,152,172))
# 岸の葦原
d.line(lake+[lake[0]],fill=(150,150,110),width=4)
# 南岸の基地跡(斜路と格納庫)
d.rectangle((200,292,262,320),fill=(150,146,134)); d.rectangle((208,298,236,316),fill=(110,100,92)); d.rectangle((244,284,252,300),fill=(160,156,146))
# 白い帆の釣り舟(帆引き船)
for x,y in [(140,200),(330,180),(260,240)]:
  d.polygon([(x,y),(x+10,y-2),(x+10,y+6)],fill=(236,236,230)); d.line((x-3,y+8,x+14,y+8),fill=(80,70,60),width=2)
im.save('gen/lake_block.png'); im.resize((960,640),0).save('z.png')
