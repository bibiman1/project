import sys, math, random; sys.path.insert(0,'style')
from PIL import Image, ImageDraw, ImageFont
from draw_arch import PL, WOOD, AI, R
G='/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'
f=lambda n: ImageFont.truetype(G,n)
SHU=(186,52,40)
def seal(label,seed):
  S=64; im=Image.new('RGBA',(S,S),(0,0,0,0)); d=ImageDraw.Draw(im)
  d.ellipse((4,4,S-4,S-4),outline=SHU+(255,),width=4)
  d.ellipse((10,10,S-10,S-10),outline=SHU+(255,),width=1)
  fo=f(17); tw=d.textlength(label,font=fo); d.text(((S-tw)/2,S/2-11),label,font=fo,fill=SHU+(255,))
  fo2=f(9); t2='済'; d.text((S/2-4,S/2+8),t2,font=fo2,fill=SHU+(255,))
  im=im.rotate(random.Random(seed).uniform(-14,14),resample=Image.BICUBIC)
  # 朱肉のかすれ
  p=im.load(); rnd=random.Random(seed)
  for y in range(S):
    for x in range(S):
      r,g,b,a=p[x,y]
      if a>0 and rnd.random()<0.16: p[x,y]=(r,g,b,int(a*0.35))
  return im
def card(mask):
  W,H=320,192
  im=Image.new('RGBA',(W,H),(58,40,30,255)); d=ImageDraw.Draw(im)   # 机の上
  for y in range(0,H,6): d.line((0,y,W,y),fill=(66,46,34,255))
  # 台紙(藁半紙の色、少し傾けて置く)
  c=Image.new('RGBA',(260,150),(233,221,190,255)); cd=ImageDraw.Draw(c)
  rnd=random.Random(3)
  for _ in range(900): cd.point((rnd.randrange(260),rnd.randrange(150)),fill=(214,200,166,255))
  cd.rectangle((6,6,253,143),outline=(60,72,120,255),width=2)
  cd.text((16,14),'国立アンバリッド・ホテル　第七回 文化祭',font=f(12),fill=(60,72,120,255))
  cd.text((16,32),'スタンプラリー',font=f(20),fill=(60,72,120,255))
  labels=['屋台','展示','舞台']
  for i,l in enumerate(labels):
    cx=48+i*82; cy=94
    for a in range(0,360,12):
      x=cx+28*math.cos(math.radians(a)); y=cy+28*math.sin(math.radians(a)); cd.point((x,y),fill=(120,120,140,255)); cd.point((x+1,y),fill=(120,120,140,255))
    cd.text((cx-12,cy+31),l,font=f(11),fill=(60,72,120,255))
    if mask>>i & 1: c.alpha_composite(seal(l,i*11+5),(cx-32,cy-32))
  cd.text((172,34),'三つそろったら',font=f(9),fill=(60,72,120,255)); cd.text((172,46),'受付で景品と交換',font=f(9),fill=(60,72,120,255))
  c=c.rotate(-2.5,resample=Image.BICUBIC,expand=True,fillcolor=(0,0,0,0))
  im.alpha_composite(Image.new('RGBA',c.size,(0,0,0,70)),(34,26)) if False else None
  sh=Image.new('RGBA',c.size,(0,0,0,0)); sh.paste((20,12,8,110),(0,0),c.getchannel('A')); im.alpha_composite(sh,(33,25))
  im.alpha_composite(c,(28,18))
  return im
OUT='/home/user/project/field/assets/worlds/haihei/'
import os
for n in range(4):
  p=OUT+f'v_card{n}.png'
  if os.path.exists(p): os.remove(p)
for m in range(8): card(m).save(OUT+f'v_card_{m}.png')
s=Image.new('RGBA',(640,192*2))
for k,m in enumerate([0,2,5,7]): s.alpha_composite(Image.open(OUT+f'v_card_{m}.png'),((k%2)*320,(k//2)*192))
s.resize((1280,768),Image.NEAREST).save('z.png')
