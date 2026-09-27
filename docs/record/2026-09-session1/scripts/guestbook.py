from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random
random.seed(21)
W,H=320,192
out=Image.new('RGBA',(W,H),(58,40,28,255)); d=ImageDraw.Draw(out)
for _ in range(600): out.putpixel((random.randrange(W),random.randrange(H)),(66,46,32,255))
# open notebook (two pages), bound on the right like a Japanese book
bx0,by0,bx1,by1=24,14,296,180
d.rectangle((bx0+4,by0+5,bx1+4,by1+5),fill=(30,20,14,255))
d.rectangle((bx0,by0,bx1,by1),fill=(226,214,184,255))
for _ in range(1400): out.putpixel((random.randint(bx0,bx1),random.randint(by0,by1)),random.choice([(216,204,172),(232,222,194),(208,194,160)])+(255,))
mid=(bx0+bx1)//2
d.line((mid,by0,mid,by1),fill=(176,160,126,255)); d.line((mid+1,by0,mid+1,by1),fill=(244,236,212,255))
# ruled vertical columns
for x in range(bx0+12,bx1-6,18):
  if abs(x-mid)<5: continue
  d.line((x,by0+8,x,by1-8),fill=(196,168,150,255))
f=ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf',11)
def column(txt,x,y,fade):
  layer=Image.new('RGBA',(W,H),(0,0,0,0)); ld=ImageDraw.Draw(layer)
  yy=y
  for ch in txt:
    if ch==' ': yy+=7; continue
    ld.text((x,yy),ch,font=f,fill=(36,30,44,255))
    yy+=12
  layer=layer.filter(ImageFilter.GaussianBlur(0.35))
  lp=layer.load()
  for j in range(H):
    for i in range(W):
      if lp[i,j][3]:
        a=lp[i,j][3]
        if random.random()<fade: a=0
        else: a=int(a*random.uniform(0.55,1.0))
        lp[i,j]=(lp[i,j][0],lp[i,j][1],lp[i,j][2],a)
  out.alpha_composite(layer)
# right page first (read right to left)
cols=[
 ("第一宇宙海軍 第四十二連隊",0.18),
 ("　　　　佐藤 ■■",0.45),
 ("月面基地 補給廠 一同",0.3),
 ("第七飛行隊 有志",0.35),
 ("宇宙海軍病院 看護婦会",0.4),
 ("遺族会 ■■ ハル",0.55),
 ]
x=bx1-24
for t,fd in cols:
  column(t,x,by0+10,fd); x-=18
  if abs(x-mid)<14: x-=10
# faint unreadable entries on the left page (smudged strokes)
sc=Image.new('RGBA',(W,H),(0,0,0,0)); sd=ImageDraw.Draw(sc)
xx=mid-22
while xx>bx0+10:
  for yy in range(by0+12,by1-20,12):
    if random.random()<0.6:
      sd.line((xx+2,yy+2,xx+8,yy+random.randint(3,9)),fill=(60,50,66,random.randint(40,90)))
      if random.random()<0.5: sd.point((xx+5,yy+6),fill=(60,50,66,80))
  xx-=18
out.alpha_composite(sc)
out.save('gen/v_guestbook.png'); out.resize((960,576),Image.NEAREST).save('z.png')
