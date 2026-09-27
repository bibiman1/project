import sys; sys.path.insert(0,'style')
from remap import remap
from PIL import Image, ImageDraw, ImageFont
D='/home/user/project/field/assets/worlds/haihei/'
names=['bed_f','bed','wheelchair','d_wheel','bonsai3','radio','tricycle','wx_chair','d_band2','kyodai','telescope','tv_off']
f=ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf',12)
cell=140
s=Image.new('RGBA',(len(names)//2*cell*2,4*(cell)+40),(150,120,86,255)); d=ImageDraw.Draw(s)
for i,n in enumerate(names):
  im=Image.open(D+n+'.png').convert('RGBA'); r=remap(im)
  k=max(1,min(cell//im.width,cell//im.height))
  x=(i%6)*cell*2; y=(i//6)*(2*cell+20)
  for j,img in enumerate((im,r)):
    z=img.resize((img.width*k,img.height*k),Image.NEAREST)
    s.alpha_composite(z,(x+j*cell+(cell-z.width)//2,y+(cell-z.height)//2+14))
  d.text((x+4,y),n+'  (左:今 右:変換)',font=f,fill='white')
s.save('style/test_remap.png')
