from PIL import Image, ImageDraw, ImageFont
import random; random.seed(4)
W,H=320,192
out=Image.new('RGBA',(W,H),(214,198,160,255)); d=ImageDraw.Draw(out)
for _ in range(900): out.putpixel((random.randrange(W),random.randrange(H)),(204,188,150,255))
# poster paper
px0,py0,px1,py1=76,4,244,188
d.rectangle((px0+3,py0+3,px1+3,py1+3),fill=(170,150,114,255))   # shadow
d.rectangle((px0,py0,px1,py1),fill=(246,238,214,255))
for _ in range(300): out.putpixel((random.randint(px0,px1),random.randint(py0,py1)),(238,228,200,255))
d.rectangle((px0+3,py0+3,px1-3,py1-3),outline=(178,44,40,255))
# thumbtacks
for (x,y) in [(px0+4,py0+4),(px1-4,py0+4),(px0+4,py1-4),(px1-4,py1-4)]: d.ellipse((x-2,y-2,x+2,y+2),fill=(200,40,40,255))
ipa='/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'; uni='/usr/share/fonts/opentype/unifont/unifont_jp.otf'
d.fontmode="1"
def text(t,y,size,col,font=ipa,scale=1):
  f=ImageFont.truetype(font,size)
  if scale==1:
    w=d.textlength(t,font=f); d.text(((px0+px1)/2-w/2,y),t,font=f,fill=col); return
  tmp=Image.new('RGBA',(400,40),(0,0,0,0)); td=ImageDraw.Draw(tmp); td.fontmode="1"; td.text((0,0),t,font=f,fill=col)
  tmp=tmp.crop(tmp.getbbox()); tmp=tmp.resize((tmp.width*scale,tmp.height*scale),Image.NEAREST)
  out.alpha_composite(tmp,(int((px0+px1)/2-tmp.width/2),y))
INK=(40,30,26,255); RED=(178,36,32,255)
text("第七回",8,11,INK)
text("国立アンバリッド・ホテル",20,11,INK)
text("文化祭",33,16,RED,font=uni,scale=2)
art=Image.open('gen/pad.png').convert('RGBA')
art=art.crop((0,6,144,62))
out.alpha_composite(art,(int((px0+px1)/2-72),68))
text("秋晴れの一日、どなたさまも",126,11,INK)
text("お越しください",139,11,INK)
text("模擬店・作品展・演芸会",151,11,RED)
text("十月十日（日）午前十時より",163,11,INK)
text("主催　ホテル入居者自治会",174,10,INK)
out.save('gen/poster_v_draft.png')
out.resize((960,576),Image.NEAREST).save('z.png')
