from PIL import Image
import numpy as np
from edit_async import submit
from poll import poll
up=Image.open('gen/wg5_half.png').convert('RGB').resize((896,512),Image.NEAREST); up.save('gen/wg5_up.png')
WIN=[(x,y) for y in (0,192) for x in (0,192,384)]
d=("Refine this crop of a pixel art RPG map to crisp full-resolution pixel art. Keep EXACTLY the same picture: same shapes, positions, colors, lighting and perspective, "
 "do not add, remove or change any object. Only clean up the chunky pixels into fine detail: riveted rusty metal plates, moss and grass in the seams, lotus leaves, egrets, calm water ripples. No text")
jobs=[]
for i,(x,y) in enumerate(WIN):
  up.crop((x,y,x+512,y+320)).save(f'gen/w6_in{i}.png'); jobs.append((submit(f'gen/w6_in{i}.png',d,31),i))
for j,i in jobs: print(i,poll(j,f'gen/w6_out{i}.png',150))
acc=np.zeros((512,896,3)); wsum=np.zeros((512,896,1))
yy,xx=np.mgrid[0:320,0:512]; wgt=((1-np.abs(xx-255.5)/256)*(1-np.abs(yy-159.5)/160))**4+1e-6
for i,(x,y) in enumerate(WIN):
  o=np.array(Image.open(f'gen/w6_out{i}.png').convert('RGB')).astype(float)
  acc[y:y+320,x:x+512]+=o*wgt[...,None]; wsum[y:y+320,x:x+512]+=wgt[...,None]
Image.fromarray((acc/wsum).astype(np.uint8)).save('gen/wing6_full.png')
