from PIL import Image, ImageDraw, ImageFont
ban=Image.open('gen/banana_moon2.png').convert('RGBA')
f=ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf',10)
W,H=320,192
v=Image.new('RGBA',(W,H),(18,16,16,255))
img=ban.copy(); ip=img.load()
for y in range(0,H,2):
  for x in range(W):
    r,g,b,a=ip[x,y]; ip[x,y]=(int(r*.86),int(g*.86),int(b*.86),255)
d=ImageDraw.Draw(img)
def tag(x,y,text,bg):
  tw=int(d.textlength(text,font=f)); d.rectangle((x,y,x+tw+7,y+13),fill=bg); d.text((x+4,y+1),text,font=f,fill=(255,255,255,255)); return x+tw+7
x=tag(12,10,'中継',(200,30,30,255)); e1=tag(x,10,'南極・キングジョージ島',(10,20,60,255))
e2=tag(12,25,'第三バナナ農園　けさの気温 ２８℃',(10,20,60,255)); print(e1,e2)
mask=Image.new('L',(W,H),0); ImageDraw.Draw(mask).rounded_rectangle((0,0,W-1,H-1),radius=18,fill=255)
v.paste(img,(0,0),mask); v.save('gen/v_tv_top.png')
v.resize((960,576),Image.NEAREST).save('z.png')
