from PIL import Image
import colorsys
picks={'uketsuke':('b','c'),'shateki':('a','c'),'yakisoba':('b','c'),'carver':('c','c'),'band1':('b','c'),'band2':('b','c'),'band3':('e','c'),
 'band4':('a','c'),'band5':('e','c'),'wheel':('b','c'),'scope':('c','w'),'bedman':('b','c'),'family':('b','c'),'visitors':('a','c')}
def person(c,mode):
  r,g,b,a=c
  if a==0: return False
  h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255)
  if mode=='w': return s<0.14 and v>0.78
  return 0.45<=h<=0.62 and s>0.3 and v>0.3
out={}
for k,(v,mode) in picks.items():
  im=Image.open(f'gen/gh_{k}{v}.png').convert('RGBA'); px=im.load(); W,H=im.size
  mask=[[person(px[x,y],mode) for y in range(H)] for x in range(W)]
  res=Image.new('RGBA',(W,H),(0,0,0,0)); rp=res.load()
  for y in range(H):
    for x in range(W):
      c=px[x,y]
      if c[3]==0: continue
      if mask[x][y]:
        vv=colorsys.rgb_to_hsv(c[0]/255,c[1]/255,c[2]/255)[2]
        f=0.82+0.25*vv
        rp[x,y]=(int(176*f),int(168*f),int(160*f),150)
      else:
        # dark outline pixel that only borders the silhouette → part of the ghost
        nb=[(x+dx,y+dy) for dx,dy in((1,0),(-1,0),(0,1),(0,-1)) if 0<=x+dx<W and 0<=y+dy<H]
        dark=sum(c[:3])<200
        if dark and any(mask[a][b] for a,b in nb) and all(mask[a][b] or px[a,b][3]==0 for a,b in nb):
          rp[x,y]=(96,90,86,120)
        else:
          rp[x,y]=c
  res.save(f'gen/ghost_{k}.png'); out[k]=res
s=Image.new('RGBA',(14*150,220),(150,120,90,255))
for i,(k,im) in enumerate(out.items()):
  sc=3 if im.width<=64 else 2; s.alpha_composite(im.resize((im.width*sc,im.height*sc),Image.NEAREST),(i*150,10))
s.save('ghost.png')
