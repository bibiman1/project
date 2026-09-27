import sys; sys.path.insert(0,'style')
from palette import RAMPS, hex2rgb
from PIL import Image, ImageDraw, ImageFont
f=ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf',16)
s=Image.new('RGB',(620,34*len(RAMPS)+20),(236,228,210)); d=ImageDraw.Draw(s)
for i,(k,r) in enumerate(RAMPS.items()):
  y=10+i*34; d.text((10,y+6),k,font=f,fill=(50,40,30))
  for j,c in enumerate(r): d.rectangle((210+j*66,y,270+j*66,y+28),fill=hex2rgb(c))
s.save('style/palette.png'); print(sum(len(r) for r in RAMPS.values()),'colors')
