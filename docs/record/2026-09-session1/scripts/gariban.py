from PIL import Image, ImageDraw, ImageFont
import random, math
random.seed(11)
W,H=320,192
out=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(out)
# wooden notice board
d.rectangle((0,0,W-1,H-1),fill=(104,70,44,255))
for y in range(0,H,6): d.line((0,y,W,y),fill=(96,64,40,255))
for _ in range(500): out.putpixel((random.randrange(W),random.randrange(H)),(116,80,50,255))
d.rectangle((0,0,W-1,5),fill=(70,46,30,255)); d.rectangle((0,H-6,W-1,H-1),fill=(70,46,30,255))
ipa='/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'; uni='/usr/share/fonts/opentype/unifont/unifont_jp.otf'
INK=(44,58,112)
def paper(x0,y0,x1,y1,col=(214,204,176),tilt=0):
  p=Image.new('RGBA',(x1-x0,y1-y0),col+(255,)); pd=ImageDraw.Draw(p)
  for _ in range((x1-x0)*(y1-y0)//14):
    pp=(random.randrange(p.width),random.randrange(p.height)); c=random.choice([(204,194,166),(222,212,186),(196,186,158)]); p.putpixel(pp,c+(255,))
  return p
def ink_text(img,t,cx,y,size,font=ipa,scale=1,col=INK):
  f=ImageFont.truetype(font,size)
  tmp=Image.new('RGBA',(420,48),(0,0,0,0)); td=ImageDraw.Draw(tmp); td.fontmode="1"; td.text((2,2),t,font=f,fill=col+(255,))
  bb=tmp.getbbox(); tmp=tmp.crop(bb)
  if scale>1: tmp=tmp.resize((tmp.width*scale,tmp.height*scale),Image.NEAREST)
  # gari-ban: faded dropouts and a little bleed
  tp=tmp.load()
  for yy in range(tmp.height):
    for xx in range(tmp.width):
      if tp[xx,yy][3] and random.random()<(0.08 if size>=11 else 0.015): tp[xx,yy]=(0,0,0,0)
  img.alpha_composite(tmp,(int(cx-tmp.width/2),y))
  return tmp.width
# --- main flyer (藁半紙, indigo one-color) ---
fl=paper(0,0,150,176)
fcx=75
ink_text(fl,"第七回",fcx,5,11)
ink_text(fl,"国立アンバリッド・ホテル",fcx,18,11)
ink_text(fl,"文化祭",fcx,31,16,font=uni,scale=2)
# woodcut ginkgo leaf
leaf=Image.new('RGBA',(60,52),(0,0,0,0)); ld=ImageDraw.Draw(leaf)
cx,cy=30,48
pts=[(cx,cy-4)]
for a in range(200,341,4):
  r=40+ (3 if a%16==0 else 0)
  pts.append((cx+r*math.cos(math.radians(a)), cy+r*math.sin(math.radians(a))*0.95))
ld.polygon(pts,fill=INK+(255,))
ld.polygon([(cx,cy-40),(cx-3,cy-28),(cx+3,cy-28)],fill=(0,0,0,0))   # notch in the middle
for a in range(206,336,9):                                          # carved veins
  ld.line((cx,cy-5,cx+37*math.cos(math.radians(a)),cy+35*math.sin(math.radians(a))),fill=(0,0,0,0),width=1)
ld.line((cx,cy-5,cx,cy+3),fill=INK+(255,),width=2)                  # stem
lp=leaf.load()
for yy in range(leaf.height):
  for xx in range(leaf.width):
    if lp[xx,yy][3] and random.random()<0.07: lp[xx,yy]=(0,0,0,0)
fl.alpha_composite(leaf,(fcx-30,66))
ink_text(fl,"秋晴れの一日、どなたさまも",fcx,119,11)
ink_text(fl,"お越しください",fcx,131,11)
ink_text(fl,"模擬店・作品展・演芸会",fcx,143,11)
ink_text(fl,"十月十日（日）午前十時より",fcx,155,10)
ink_text(fl,"主催　ホテル入居者自治会",fcx+14,165,9)
fl=fl.rotate(-1.2,resample=Image.NEAREST,expand=True)
out.alpha_composite(Image.new('RGBA',fl.size,(40,26,16,110)),(88,9))   # shadow
out.alpha_composite(fl,(85,6))
# --- side notices ---
m=paper(0,0,64,84,(226,222,208)); ink_text(m,"今週の献立",32,5,10,col=(40,40,40))
for i,t in enumerate(["月 すいとん","火 さんま","水 けんちん汁","木 ほうとう","金 カレー"]): ink_text(m,t,32,21+i*12,9,col=(40,40,40))
m=m.rotate(2,resample=Image.NEAREST,expand=True); out.alpha_composite(m,(12,14))
n=paper(0,0,62,60,(232,226,200)); ink_text(n,"消灯",31,6,12,col=(150,30,30)); ink_text(n,"午後九時",31,24,10,col=(40,40,40)); ink_text(n,"面会",31,38,9,col=(40,40,40)); ink_text(n,"午後二時〜四時",31,49,8,col=(40,40,40))
n=n.rotate(-2.5,resample=Image.NEAREST,expand=True); out.alpha_composite(n,(244,20))
o=paper(0,0,58,44,(236,230,214)); ink_text(o,"尋ね人",29,5,10,col=(40,40,40)); ink_text(o,"古タイヤ",29,19,9,col=(40,40,40)); ink_text(o,"見つけたら",29,30,8,col=(40,40,40))
o=o.rotate(1.5,resample=Image.NEAREST,expand=True); out.alpha_composite(o,(248,98))
# thumbtacks
for (x,y) in [(160,9),(92,9),(228,9),(40,16),(274,22),(276,100),(40,100)]:
  d.ellipse((x-2,y-2,x+2,y+2),fill=(200,50,40,255)); d.point((x-1,y-1),fill=(250,160,150,255))
out.save('gen/v_board.png'); out.resize((960,576),Image.NEAREST).save('z.png')
