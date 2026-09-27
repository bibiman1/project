from PIL import Image
from collections import deque
def dark(c): return c[3]>0 and sum(c[:3])/3<85
manual={'carver':[(29,22),(39,22)],'band2':[(25,25),(35,25)],'wheel':[(31,21),(38,21)],'scope':[(25,18),(33,18)]}
def sockets(px,W,H):
  # connected dark components in the head region that don't touch transparency
  seen=set();out=[]
  for y in range(4,34):
    for x in range(W):
      if (x,y) in seen or not dark(px[x,y]): continue
      q=deque([(x,y)]);seen.add((x,y));comp=[];bad=False
      while q:
        cx,cy=q.popleft();comp.append((cx,cy))
        for a,b in((1,0),(-1,0),(0,1),(0,-1)):
          nx,ny=cx+a,cy+b
          if not(0<=nx<W and 0<=ny<H) or px[nx,ny][3]==0: bad=True;continue
          if dark(px[nx,ny]) and (nx,ny) not in seen: seen.add((nx,ny));q.append((nx,ny))
      if not bad and 6<=len(comp)<=60: out.append(comp)
  out.sort(key=lambda c:-len(c));return out[:2]
for n in ['uketsuke','shateki','yakisoba','carver','band1','band2','wheel','bedman','scope']:
  im=Image.open(f'gen/jf_{n}.png').convert('RGBA');px=im.load();W,H=im.size
  if n in manual: cs=manual[n]
  else:
    cs=[]
    for c in sockets(px,W,H):
      cs.append((round(sum(x for x,y in c)/len(c)),round(sum(y for x,y in c)/len(c))+1))
  LIGHT=(240,232,210,255)
  for cx,cy in cs:
    for dx in (-1,0,1): px[cx+dx,cy-(1-abs(dx))]=LIGHT
  print(n,cs); im.save(f'gen/jf_{n}_e.png')
s=Image.new('RGBA',(1800,180),(150,150,150,255));x=0
for n in ['uketsuke','shateki','yakisoba','carver','band1','band2','wheel','bedman','scope']:
  im=Image.open(f'gen/jf_{n}_e.png').convert('RGBA');im=im.crop((0,0,im.width,40)).resize((im.width*3,120),Image.NEAREST);s.alpha_composite(im,(x,10));x+=im.width+4
s.save('je.png')
