from PIL import Image, ImageDraw, ImageFont
tv=Image.open('/home/user/project/field/assets/worlds/haihei/tv.png').convert('RGBA'); p=tv.load()
scr=[(x,y) for y in range(11,26) for x in range(11,30) if p[x,y][1]>=p[x,y][0] and p[x,y][1]>p[x,y][2]-10 and p[x,y][3]>0]
ban=Image.open('gen/banana_e.png').convert('RGBA')
# 画面つき(ON)
on=tv.copy(); o=on.load()
small=ban.resize((19,15),Image.LANCZOS).load()
for (x,y) in scr:
  r,g,b,a=small[x-11,y-11]
  if y%2==0: r,g,b=int(r*.85),int(g*.85),int(b*.85)
  o[x,y]=(min(255,r+10),min(255,g+10),min(255,b+14),255)
on.save('gen/tv_on.png')
# 消えた画面(OFF): 暗いガラスに少し映り込み
off=tv.copy(); q=off.load()
for (x,y) in scr:
  c=(34,40,44,255)
  if (x-y) in (2,3) and y<19: c=(64,72,78,255)
  q[x,y]=c
off.save('gen/tv_off.png')
# 画面の絵(ブラウン管らしく): 走査線 + 角丸 + 字幕
W,H=320,192
v=Image.new('RGBA',(W,H),(18,16,16,255))
img=ban.copy(); ip=img.load()
for y in range(0,H,2):
  for x in range(W):
    r,g,b,a=ip[x,y]; ip[x,y]=(int(r*.86),int(g*.86),int(b*.86),255)
f=ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf',12)
d=ImageDraw.Draw(img)
d.rectangle((0,H-22,W,H),fill=(10,20,60,235))
d.text((8,H-18),'南極・第三バナナ農園　けさの気温 ２８℃',font=f,fill=(255,255,255,255))
d.rectangle((6,6,36,22),fill=(200,30,30,255)); d.text((11,8),'中継',font=f,fill=(255,255,255,255))
mask=Image.new('L',(W,H),0); ImageDraw.Draw(mask).rounded_rectangle((0,0,W-1,H-1),radius=18,fill=255)
v.paste(img,(0,0),mask)
v.save('gen/v_tv.png')
s=Image.new('RGBA',(W*3+20,H*3+180),(40,40,40,255))
s.alpha_composite(v.resize((W*3,H*3),Image.NEAREST),(0,0))
s.alpha_composite(on.resize((144,144),Image.NEAREST),(0,H*3+20)); s.alpha_composite(off.resize((144,144),Image.NEAREST),(170,H*3+20))
s.save('preview_tv.png')
