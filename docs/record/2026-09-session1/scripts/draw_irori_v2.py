from PIL import Image, ImageDraw
import math, random
random.seed(5)
W,H=128,176
im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im); px=im.load()
OUT=(26,16,14,255)
# ---- hearth (robuchi + ash pit), 3/4 top-down ----
fx0,fy0,fx1,fy1=16,72,112,168       # outer frame
bw=8                                 # frame width
# frame top face
d.rectangle((fx0,fy0,fx1,fy1),fill=(92,52,34,255),outline=OUT)
d.rectangle((fx0+1,fy0+1,fx1-1,fy0+2),fill=(132,82,52,255))       # highlight near edge
for y in range(fy0+3,fy1-1,3):
  for x in (fx0+2,fx1-3): px[x,y]=(110,66,42,255)                    # wood grain
for x in range(fx0+4,fx1-3,5):
  px[x,fy0+4]=(110,66,42,255); px[x,fy1-3]=(76,42,28,255)
# frame front face (thickness) at the bottom
d.rectangle((fx0,fy1-1,fx1,fy1+5),fill=(62,34,22,255),outline=OUT)
# pit
px0,py0,px1,py1=fx0+bw,fy0+bw,fx1-bw,fy1-bw
d.rectangle((px0,py0,px1,py1),fill=(44,30,26,255))
# far inner wall (visible in 3/4 view)
d.rectangle((px0,py0,px1,py0+6),fill=(58,40,32,255)); d.line((px0,py0+6,px1,py0+6),fill=(30,20,18,255))
# ash bed
ax0,ay0,ax1,ay1=px0+1,py0+7,px1-1,py1-1
d.rectangle((ax0,ay0,ax1,ay1),fill=(150,146,142,255))
for _ in range(260):
  x=random.randint(ax0,ax1); y=random.randint(ay0,ay1); c=random.choice([(136,132,128),(164,160,156),(124,120,116)])
  px[x,y]=c+(255,)
d.line((ax0,ay0,ax1,ay0),fill=(104,100,98,255))                      # shadow under far wall
# ash raked pattern (灰模様) lines
for yy in range(ay0+4,ay1-2,6):
  d.line((ax0+3,yy,ax0+12,yy),fill=(130,126,122,255)); d.line((ax1-12,yy,ax1-3,yy),fill=(130,126,122,255))
# ---- fire: split logs pointing to the center, embers, flames ----
cx,cy=64,128
logs=[(-26,10),(26,12),(-20,-8),(22,-6)]
for (dx,dy) in logs:
  x0,y0=cx+dx,cy+dy; x1,y1=cx+dx*0.25,cy+dy*0.25
  d.line((x0,y0,x1,y1),fill=OUT,width=5); d.line((x0,y0,x1,y1),fill=(120,78,48,255),width=3)
  d.line((x0,y0-1,x1,y1-1),fill=(150,104,64,255),width=1)
  d.ellipse((x0-2,y0-2,x0+2,y0+2),fill=(172,130,84,255),outline=OUT)   # cut end
  d.ellipse((x1-2,y1-2,x1+2,y1+2),fill=(230,90,40,255))               # burning end
d.ellipse((cx-9,cy-5,cx+9,cy+5),fill=(200,60,30,255))
for _ in range(30):
  x=cx+random.randint(-8,8); y=cy+random.randint(-4,4); px[x,y]=random.choice([(255,190,80),(250,120,40),(160,40,24)])+(255,)
# small flames
for (fx,h) in [(-4,9),(1,12),(5,8)]:
  d.polygon([(cx+fx-2,cy),(cx+fx,cy-h),(cx+fx+2,cy)],fill=(250,150,40,255)); d.line((cx+fx,cy-1,cx+fx,cy-h+3),fill=(255,230,140,255))
# hibashi (fire tongs) stuck in the ash, front-right corner
d.line((98,152,104,140),fill=(60,60,66,255),width=1); d.line((100,153,106,141),fill=(60,60,66,255),width=1)
d.line((98,152,100,153),fill=(40,40,44,255))
# ---- jizai-kagi: bamboo tube from the beam, iron rod, hook ----
rx=64
# bamboo tube
d.rectangle((rx-3,0,rx+2,50),fill=(150,122,62,255)); d.line((rx-3,0,rx-3,50),fill=(186,158,90,255)); d.line((rx+2,0,rx+2,50),fill=(96,74,36,255))
for y in (6,22,38): d.line((rx-3,y,rx+2,y),fill=(96,74,36,255)); d.line((rx-3,y+1,rx+2,y+1),fill=(190,164,96,255))
d.rectangle((rx-3,50,rx+2,52),fill=(80,60,30,255))
# iron rod coming out of the tube
# ---- iron pot hung by its bail (tsuru) ----
pcx,pty=64,114         # rim center
rxp,ryp=18,6
# bail handle (semicircle up to the hook)

# pot body (round bottom) below rim
d.ellipse((pcx-rxp-1,pty-6,pcx+rxp+1,pty+16),fill=(34,34,40,255),outline=OUT)
d.arc((pcx-rxp+2,pty-3,pcx+rxp-6,pty+12),110,200,fill=(84,86,96,255),width=1)      # sheen
# lugs (ears) where the bail attaches
d.rectangle((pcx-rxp-2,pty-1,pcx-rxp,pty+1),fill=(40,40,46,255)); d.rectangle((pcx+rxp,pty-1,pcx+rxp+2,pty+1),fill=(40,40,46,255))
# rim + broth
d.ellipse((pcx-rxp,pty-ryp,pcx+rxp,pty+ryp),fill=(60,60,68,255),outline=OUT)
d.ellipse((pcx-rxp+2,pty-ryp+1,pcx+rxp-2,pty+ryp-1),fill=(116,70,40,255))
for (x,y) in [(52,114),(74,112),(56,117),(76,116)]: px[x,y]=(160,108,64,255)
# bail (tsuru): thin iron arc from the two lugs up to the hook
for i in range(0,181):
  t=math.radians(180+i)
  X=pcx+math.cos(t)*(rxp+1); Y=pty+math.sin(t)*(pty-97)
  px[int(round(X)),int(round(Y))]=(44,44,50,255)
  if i%12==0: px[int(round(X)),int(round(Y))-1]=(110,112,122,255)
# jizai-kagi hook (upside-down "?"): the bail is a plain arc; its apex rests in the hook's curve
IR=(96,100,112,255); IH=(186,192,204,255); IDK=(58,62,74,255)
hcx,hcy,HR=64,95,4.6
hp=[(64,y) for y in range(52,int(hcy-HR)+1)]
for k in range(0,221,3):
  a=-math.pi/2-math.radians(k)
  hp.append((hcx+HR*math.cos(a),hcy+HR*math.sin(a)))
ex,ey=hp[-1]
for k in range(1,5): hp.append((ex+0.25*k,ey-1.0*k))
lay=Image.new('RGBA',im.size,(0,0,0,0)); ldw=ImageDraw.Draw(lay)
ldw.line([(round(x),round(y)) for (x,y) in hp],fill=(34,34,40,255),width=2)   # 2px: dark iron
ldw.line([(round(x)-0,round(y)) for (x,y) in hp],fill=(120,124,136,255),width=1) # 1px highlight core
im.alpha_composite(lay)
px=im.load()
# fish-shaped lever (kozaru): the iron rod passes through a hole at the fish's head end;
# the tail end is tied with a cord to the bamboo tube. The pot's weight tilts it (head down), which locks the rod.
lay=Image.new('RGBA',(64,32),(0,0,0,0)); fd=ImageDraw.Draw(lay)
fcx,fcy=30,16
fishp=[(fcx-15,fcy),(fcx-10,fcy-4),(fcx-1,fcy-5),(fcx+7,fcy-3),(fcx+11,fcy-1),(fcx+11,fcy+1),(fcx+7,fcy+3),(fcx-1,fcy+5),(fcx-10,fcy+4)]
fd.polygon(fishp,fill=(128,78,44,255),outline=OUT)
fd.polygon([(fcx+11,fcy),(fcx+17,fcy-5),(fcx+15,fcy),(fcx+17,fcy+5)],fill=(108,64,36,255),outline=OUT)
fd.line((fcx-9,fcy-2,fcx+7,fcy-2),fill=(170,116,70,255))
for x in range(fcx-4,fcx+8,4): fd.arc((x-2,fcy-1,x+2,fcy+3),200,340,fill=(90,54,30,255))
fd.point((fcx-12,fcy-1),fill=(240,224,190,255)); fd.point((fcx-12,fcy),fill=OUT)
fd.ellipse((fcx-9,fcy-2,fcx-5,fcy+2),fill=(40,26,18,255))      # hole near the head
lay=lay.rotate(16,resample=Image.NEAREST,center=(fcx-7,fcy))      # tail up, head down
# place so the hole sits on the rod (x=64) just below the tube
im.alpha_composite(lay,(64-(fcx-7),60-fcy))
px=im.load()
# rod passes through the hole (redraw the rod over the hole)
for y in range(56,65): px[64,y]=(62,64,74,255)
# cord from the tail up to the bottom of the bamboo tube
d.line((87,52,66,46),fill=(206,186,146,255)); d.point((66,46),fill=(120,100,70,255))
# the bail passes in front of the hook's tip side (it rests inside the curve)
for i in range(90,181):
  t=math.radians(180+i)
  X=int(round(pcx+math.cos(t)*(rxp+1))); Y=int(round(pty+math.sin(t)*(pty-97)))
  if X>=65: px[X,Y]=(44,44,50,255)
# saturn tilted in the broth
sx,sy,R=64,111,5
ang=math.radians(-28); ra,rb=11.5,3
def ring(front):
  for i in range(240):
    t=2*math.pi*i/240; x=math.cos(t)*ra; y=math.sin(t)*rb
    X=int(round(sx+x*math.cos(ang)-y*math.sin(ang))); Y=int(round(sy+x*math.sin(ang)+y*math.cos(ang)))
    if (math.sin(t)>0)==front:
      px[X,Y+1]=OUT if px[X,Y+1][:3]!=(248,232,186) else px[X,Y+1]
      px[X,Y]=(248,232,186,255)
ring(False)
for yy in range(-R-1,R+2):
  for xx in range(-R-1,R+2):
    d2=xx*xx+yy*yy
    if d2<=R*R+1: px[sx+xx,sy+yy]=[(252,220,140),(236,176,92),(252,228,160),(220,150,80),(246,204,120)][((yy+R)//2)%5]+(255,)
    elif d2<=(R+1)**2+1 and yy<3: px[sx+xx,sy+yy]=OUT
px[sx-2,sy-2]=(255,246,214,255)
for xx in range(-R,R+1): px[sx+xx,sy+3]=(116,70,40,255); px[sx+xx,sy+4]=(116,70,40,255)
ring(True)
# steam
for (x,y) in [(54,104),(53,101),(54,98),(74,103),(75,100),(74,97)]: px[x,y]=(236,232,226,190)
im.save('gen/irori_v2.png')
b=Image.new('RGBA',im.size,(120,90,70,255)); b.alpha_composite(im); b.resize((W*4,H*4),Image.NEAREST).save('z.png')
