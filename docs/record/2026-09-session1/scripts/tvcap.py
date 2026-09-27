from PIL import Image, ImageDraw, ImageFont
import sys
ban=Image.open('gen/banana_final.png').convert('RGBA')
f=ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf',12)
def make(place,out):
  W,H=320,192
  v=Image.new('RGBA',(W,H),(18,16,16,255))
  img=ban.copy(); ip=img.load()
  for y in range(0,H,2):
    for x in range(W):
      r,g,b,a=ip[x,y]; ip[x,y]=(int(r*.86),int(g*.86),int(b*.86),255)
  d=ImageDraw.Draw(img)
  d.rectangle((0,H-22,W,H),fill=(10,20,60,235))
  d.text((8,H-18),'第三バナナ農園　けさの気温 ２８℃',font=f,fill=(255,255,255,255))
  d.rectangle((6,6,36,22),fill=(200,30,30,255)); d.text((11,8),'中継',font=f,fill=(255,255,255,255))
  tw=int(d.textlength(place,font=f))
  d.rectangle((36,6,36+tw+10,22),fill=(10,20,60,235)); d.text((41,8),place,font=f,fill=(255,255,255,255))
  mask=Image.new('L',(W,H),0); ImageDraw.Draw(mask).rounded_rectangle((0,0,W-1,H-1),radius=18,fill=255)
  v.paste(img,(0,0),mask); v.save(out); return v
opts=[('A','南極・キングジョージ島'),('B','南極・昭和基地'),('C','南極・ロス棚氷')]
F=ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf',22)
s=Image.new('RGBA',(3*650,440),(30,30,30,255)); d=ImageDraw.Draw(s)
for i,(k,p) in enumerate(opts):
  v=make(p,f'gen/v_tv_{k}.png'); d.text((i*650+6,6),f'案{k}：{p}',font=F,fill='white')
  s.alpha_composite(v.resize((640,384),Image.NEAREST),(i*650,40))
s.save('preview_tvcap.png')
