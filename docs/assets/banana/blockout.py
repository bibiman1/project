from PIL import Image, ImageDraw, ImageFilter
import random, math
T=32
O='/home/user/project/docs/assets/banana/'
R=random.Random(7)
def shade(c,k): return tuple(max(0,min(255,int(v*k))) for v in c)
SNOW=(232,238,246); SNOW_SH=(196,208,226); SOIL=(150,118,86); SOIL2=(126,98,72)
PEBBLE=(158,156,152); SEA=(56,96,120); SEA2=(70,112,138); ICE=(214,232,242)
LEAF=(78,150,72); LEAF2=(52,112,52); LEAF_HI=(128,190,100); STEM=(120,140,70)
def noise_fill(d,box,base,var,n,size=(2,2),rnd=R):
    x0,y0,x1,y1=box
    for _ in range(n):
        x=rnd.randrange(int(x0),int(x1)); y=rnd.randrange(int(y0),int(y1)); k=1+rnd.uniform(-var,var)
        d.rectangle((x,y,x+size[0],y+size[1]),fill=shade(base,k))
def snow_patch(d,cx,cy,rw,rh,rnd=R):
    pts=[(cx+math.cos(a)*rw*(0.75+rnd.random()*0.3),cy+math.sin(a)*rh*(0.75+rnd.random()*0.3)) for a in [i*math.pi/7 for i in range(14)]]
    d.polygon(pts,fill=SNOW); d.line(pts[7:12],fill=SNOW_SH,width=2)
def shadow(img,box,alpha=70):
    m=Image.new('RGBA',img.size,(0,0,0,0)); md=ImageDraw.Draw(m); md.ellipse(box,fill=(40,50,80,alpha)); img.alpha_composite(m)
def banana(img,x,y,rnd=R,s=1.0):
    # 2x3 マス: 下 1 マスに幹、上に大きな葉。斜め上から。房は下向き、先に赤紫の花
    shadow(img,(x+10,y+80,x+72,y+98))
    d=ImageDraw.Draw(img)
    d.rectangle((x+28,y+48,x+38,y+92),fill=STEM,outline=shade(STEM,0.7))
    d.line((x+31,y+50,x+31,y+90),fill=shade(STEM,1.2))
    rot=rnd.uniform(-18,18)
    leaves=[(200,40,LEAF2),(330,40,LEAF2),(250,44,LEAF),(290,44,LEAF),(170,36,LEAF),(10,36,LEAF),(270,30,LEAF_HI)]
    rnd.shuffle(leaves); leaves=sorted(leaves,key=lambda v: v[2]!=LEAF2)
    for a,l,c in leaves[:rnd.randint(5,7)]:
        a+=rot; l*=s*rnd.uniform(0.85,1.1)
        r=math.radians(a); tx=x+33+math.cos(r)*l; ty=y+44+math.sin(r)*l*0.8
        nx=-math.sin(r)*9; ny=math.cos(r)*9*0.8
        d.polygon([(x+33,y+44),(tx+nx,ty+ny),(tx,ty),(tx-nx,ty-ny)],fill=c,outline=shade(c,0.7))
        d.line((x+33,y+44,tx,ty),fill=shade(c,1.25))
    # 房と花
    d.rectangle((x+38,y+52,x+50,y+68),fill=(206,196,70),outline=(150,140,50))
    for j in range(3): d.line((x+39,y+55+j*4,x+49,y+55+j*4),fill=(230,220,110))
    d.ellipse((x+40,y+68,x+50,y+80),fill=(120,40,70),outline=(80,20,50))
def mango_tree(img,x,y):
    shadow(img,(x+20,y+150,x+200,y+196),80)
    d=ImageDraw.Draw(img)
    d.polygon([(x+92,y+110),(x+104,y+188),(x+124,y+188),(x+118,y+110)],fill=(112,82,58),outline=(80,58,40))
    d.line((x+104,y+120,x+110,y+186),fill=(140,106,78),width=2)
    for cx,cy,r,c in [(60,90,54,LEAF2),(160,92,52,LEAF2),(110,70,70,LEAF2),(80,56,48,LEAF),(140,52,50,LEAF),(110,40,44,LEAF),(96,30,28,LEAF_HI),(130,34,22,LEAF_HI)]:
        d.ellipse((x+cx-r,y+cy-r*0.8,x+cx+r,y+cy+r*0.8),fill=c)
    rnd=random.Random(11)
    for _ in range(500):
        a=rnd.uniform(0,6.28); rr=rnd.uniform(0,90); px=x+110+math.cos(a)*rr; py=y+70+math.sin(a)*rr*0.6
        d.point((px,py),fill=shade(LEAF,rnd.uniform(0.8,1.3)))
    for px,py in [(60,112),(92,120),(150,116),(176,98),(40,96),(126,124)]:
        d.line((x+px,y+py-10,x+px,y+py),fill=(90,80,40))
        d.ellipse((x+px-6,y+py,x+px+6,y+py+14),fill=(236,150,40),outline=(170,80,30)); d.point((x+px-2,y+py+4),fill=(250,220,120))
        d.ellipse((x+px-5,y+py+2,x+px-1,y+py+7),fill=(220,70,50))
def penguin(d,x,y):
    d.ellipse((x+2,y+18,x+18,y+24),fill=(90,100,130))
    d.ellipse((x,y+2,x+20,y+22),fill=(28,30,38)); d.ellipse((x+5,y+8,x+15,y+21),fill=(246,246,246))
    d.ellipse((x+4,y-4,x+16,y+8),fill=(28,30,38)); d.line((x+6,y-1,x+14,y-1),fill=(246,246,246),width=2)
    d.polygon([(x+10,y+2),(x+16,y+4),(x+10,y+5)],fill=(230,90,40)); d.rectangle((x+5,y+22,x+8,y+24),fill=(230,120,40)); d.rectangle((x+12,y+22,x+15,y+24),fill=(230,120,40))
def church(img,x,y):
    # 4x7 マス、斜め上から。丸太の壁、切妻、細い胴の上に玉ねぎ屋根、金の十字架
    shadow(img,(x+4,y+196,x+150,y+226),90)
    d=ImageDraw.Draw(img)
    LOG=(150,98,58)
    # 本体の屋根(上面が見える)
    d.polygon([(x+6,y+120),(x+64,y+86),(x+122,y+120),(x+64,y+140)],fill=(122,110,104),outline=(70,60,56))
    d.polygon([(x+64,y+140),(x+122,y+120),(x+122,y+132),(x+64,y+152)],fill=(96,86,80))
    d.rectangle((x+10,y+140,x+118,y+214),fill=LOG,outline=(90,56,30))
    for j in range(y+144,y+214,8):
        d.line((x+10,j,x+118,j),fill=(118,74,40)); d.line((x+10,j+2,x+118,j+2),fill=(172,118,72))
    d.rectangle((x+54,y+176,x+74,y+214),fill=(70,42,24),outline=(40,24,12))
    for wx in (x+22,x+92): d.rectangle((wx,y+160,wx+12,y+178),fill=(60,70,90),outline=(40,26,14))
    # 塔と玉ねぎ屋根
    d.rectangle((x+50,y+40,x+78,y+100),fill=LOG,outline=(90,56,30))
    for j in range(y+44,y+100,7): d.line((x+50,j,x+78,j),fill=(118,74,40))
    d.polygon([(x+44,y+42),(x+64,y+30),(x+84,y+42)],fill=(122,110,104))
    d.ellipse((x+46,y+2,x+82,y+40),fill=(150,160,160),outline=(90,96,96))
    d.polygon([(x+56,y+6),(x+64,y-10),(x+72,y+6)],fill=(150,160,160),outline=(90,96,96))
    for k in range(3): d.arc((x+50,y+8+k*10,x+78,y+24+k*10),0,180,fill=(120,128,130))
    d.line((x+64,y-30,x+64,y-8),fill=(226,184,60),width=4); d.line((x+56,y-22,x+72,y-22),fill=(226,184,60),width=3); d.line((x+58,y-14,x+70,y-17),fill=(226,184,60),width=2)
def cliff(img,x0,y0,w,h,face=T):
    # 氷の段: 上面(雪)と、手前の氷の崖面(高さ 1 マス)
    d=ImageDraw.Draw(img)
    d.rectangle((x0,y0,x0+w,y0+h),fill=SNOW)
    noise_fill(d,(x0,y0,x0+w,y0+h),SNOW,0.04,int(w*h/60))
    d.rectangle((x0,y0+h,x0+w,y0+h+face),fill=(150,190,214))
    for i in range(0,w,6):
        d.line((x0+i,y0+h,x0+i+R.randint(-2,2),y0+h+face),fill=(126,170,200))
    d.line((x0,y0+h,x0+w,y0+h),fill=(250,252,255),width=2)
    d.line((x0,y0+h+face,x0+w,y0+h+face),fill=(92,130,160),width=2)
    m=Image.new('RGBA',img.size,(0,0,0,0)); md=ImageDraw.Draw(m); md.rectangle((x0,y0+h+face,x0+w,y0+h+face+10),fill=(60,80,120,60)); img.alpha_composite(m)

# ---- A 浜 28x8 ----
W,H=28*T,8*T
a=Image.new('RGBA',(W,H),PEBBLE); d=ImageDraw.Draw(a)
noise_fill(d,(0,0,W,5*T),PEBBLE,0.18,2600,(2,2))
for _ in range(10): snow_patch(d,R.randrange(0,W),R.randrange(10,4*T),R.randrange(20,50),R.randrange(8,16))
# 北の端: 農園の土手とバナナの葉先
d.rectangle((0,0,W,12),fill=SNOW); d.line((0,12,W,12),fill=SNOW_SH,width=3)
# 波打ち際と湾
d.rectangle((0,5*T,W,H),fill=SEA)
for j in range(5*T,H,6): d.line((0,j,W,j),fill=SEA2 if (j//6)%2 else SEA)
d.line((0,5*T,W,5*T),fill=(236,242,248),width=3)
for i in range(16):
    x=R.randrange(0,W); y=R.randrange(5*T+12,H-10); w=R.randrange(22,60)
    d.polygon([(x,y),(x+w,y+3),(x+w-6,y+12),(x+4,y+10)],fill=ICE,outline=(170,196,214))
    d.line((x+4,y+10,x+w-6,y+12),fill=(150,180,200),width=2)
# 中央の道と桟橋
d.rectangle((13*T,0,15*T,5*T),fill=SOIL); noise_fill(d,(13*T,0,15*T,5*T),SOIL,0.12,300)
d.rectangle((13*T+6,5*T-4,15*T-6,H),fill=(146,112,78),outline=(90,66,44))
for j in range(5*T,H,10): d.line((13*T+6,j,15*T-6,j),fill=(110,82,56))
for px in (13*T+6,15*T-12): d.rectangle((px,H-24,px+6,H),fill=(80,60,40))
# ペンギン
for i in range(9): penguin(d,17*T+(i%5)*28+R.randrange(-4,4),2*T+(i//5)*30+R.randrange(-4,4))
# 東の岩の丘と教会
d.polygon([(22*T,5*T),(22.6*T,3.4*T),(24*T,2.6*T),(27*T,2.5*T),(W,3*T),(W,5*T)],fill=(120,116,112),outline=(80,76,72))
noise_fill(d,(23*T,2.7*T,W,5*T),(120,116,112),0.15,400,(3,3))
snow_patch(d,26.5*T,4.3*T,30,8)
cimg=Image.new('RGBA',(160,270),(0,0,0,0)); church(cimg,6,38)
cimg=cimg.resize((int(160*0.62),int(270*0.62)),Image.LANCZOS)
a.alpha_composite(cimg,(int(23.6*T),6))
a.save(O+'shore_blockout.png')

# ---- B 第三バナナ農園 28x14 ----
W,H=28*T,14*T
b=Image.new('RGBA',(W,H),SOIL); d=ImageDraw.Draw(b)
noise_fill(d,(0,0,W,H),SOIL,0.15,5000,(2,2))
for _ in range(26): snow_patch(d,R.randrange(0,W),R.randrange(0,H),R.randrange(16,44),R.randrange(6,14))
# 北の雪の土手(西寄りに用水路への切れ目)
d.rectangle((0,0,W,T),fill=SNOW); d.line((0,T,W,T),fill=SNOW_SH,width=3)
d.rectangle((3*T,0,6*T,T),fill=SOIL)
# 中央の道
d.rectangle((13*T,0,15*T,H),fill=(184,160,120)); noise_fill(d,(13*T,0,15*T,H),(184,160,120),0.1,500)
# バナナの列(5 列)
rows=[1.2,4.4,7.6,10.8]   # 株の列は 1 マス幅、あいだに 2 マス以上の通り道
rr=random.Random(5)
for ry in rows:
    for cx in list(range(0,12,2))+list(range(16,28,2)):
        if 20<=cx<=25 and 3<=ry<=9: continue
        if rr.random()<0.12: continue
        banana(b,cx*T+rr.randint(-5,5),int(ry*T)-T-rr.randint(0,6),rr,rr.uniform(0.85,1.15))
# 農具小屋 4x3(東、中央)
x0,y0=21*T,4*T
shadow(b,(x0+10,y0+90,x0+150,y0+110),80)
d=ImageDraw.Draw(b)
d.polygon([(x0,y0+30),(x0+64,y0),(x0+128,y0+30)],fill=(150,70,50),outline=(100,40,30))
d.rectangle((x0+4,y0+30,x0+124,y0+96),fill=(170,130,86),outline=(100,70,40))
for i in range(x0+10,x0+124,12): d.line((i,y0+32,i,y0+96),fill=(146,108,70))
d.rectangle((x0+50,y0+58,x0+76,y0+96),fill=(96,66,40)); d.rectangle((x0+90,y0+48,x0+112,y0+66),fill=(70,86,106),outline=(90,60,30))
d.rectangle((x0+10,y0+80,x0+30,y0+96),fill=(40,40,44))  # ゴム長
# 撮影の道具(小屋の西): 三脚のテレビカメラ、レフ板、照明、ケーブル
cx,cy=18*T,5*T
d.line((cx,cy+30,cx-10,cy+60),fill=(40,40,40),width=3); d.line((cx,cy+30,cx+10,cy+60),fill=(40,40,40),width=3); d.line((cx,cy+30,cx,cy+62),fill=(40,40,40),width=3)
d.rectangle((cx-18,cy+8,cx+22,cy+32),fill=(70,72,78),outline=(30,30,34)); d.rectangle((cx-30,cy+14,cx-18,cy+26),fill=(40,42,48)); d.ellipse((cx-34,cy+14,cx-26,cy+26),fill=(90,120,160))
d.ellipse((cx+12,cy+10,cx+18,cy+16),fill=(230,40,40))
d.ellipse((cx+34,cy-6,cx+74,cy+34),fill=(226,228,232),outline=(150,150,156)); d.line((cx+54,cy+34,cx+54,cy+64),fill=(60,60,60),width=2)
d.polygon([(cx-60,cy+4),(cx-40,cy-2),(cx-40,cy+22),(cx-60,cy+16)],fill=(250,240,200),outline=(120,110,80)); d.line((cx-50,cy+20,cx-50,cy+62),fill=(60,60,60),width=2)
d.line([(cx,cy+60),(cx+30,cy+80),(cx+90,cy+74),(x0+10,y0+90)],fill=(30,30,30),width=2)
# 看板(南の道のわき)
sx,sy=15*T+8,12*T
d.rectangle((sx+6,sy+20,sx+10,sy+54),fill=(100,70,40)); d.rectangle((sx+54,sy+20,sx+58,sy+54),fill=(100,70,40))
d.rectangle((sx,sy,sx+64,sy+28),fill=(226,206,160),outline=(110,80,50),width=2)
for k in range(5): d.rectangle((sx+6+k*11,sy+8,sx+14+k*11,sy+18),fill=(60,40,30))
b.save(O+'farm_blockout.png')

# ---- C 凍った用水路 28x5 ----
W,H=28*T,5*T
c=Image.new('RGBA',(W,H),SNOW); d=ImageDraw.Draw(c)
noise_fill(d,(0,0,W,H),SNOW,0.04,1500)
d.rectangle((0,T,W,4*T),fill=(170,208,228))
for i in range(40):
    x=R.randrange(0,W); y=R.randrange(T+6,4*T-6); d.line((x,y,x+R.randrange(20,70),y+R.randrange(-4,4)),fill=(230,244,252),width=2)
d.line((0,T,W,T),fill=(120,160,190),width=4); d.line((0,4*T,W,4*T),fill=(250,252,255),width=3)
m=Image.new('RGBA',c.size,(0,0,0,0)); md=ImageDraw.Draw(m); md.rectangle((0,T+4,W,T+16),fill=(60,90,130,60)); c.alpha_composite(m); d=ImageDraw.Draw(c)
# 南西の入口と北東の出口の切れ目
d.rectangle((3*T,4*T,6*T,H),fill=SOIL); d.rectangle((24*T,0,27*T,T),fill=(200,214,230))
d.line((0,4*T+10,W,4*T+10),fill=SNOW_SH,width=2)
c.save(O+'canal_blockout.png')

# ---- D 氷の段々とマンゴーの丘 14x20 ----
W,H=14*T,20*T
GROUND=(206,216,232)
e=Image.new('RGBA',(W,H),GROUND); d=ImageDraw.Draw(e)
noise_fill(d,(0,0,W,H),GROUND,0.05,2500)
for _ in range(14):
    x=R.randrange(0,W); y=R.randrange(2*T,H)
    d.polygon([(x,y),(x+10,y-18),(x+18,y+2)],fill=(170,200,222),outline=(120,160,190))
# 遠くの雪山と空(北の端)
d.rectangle((0,0,W,2*T),fill=(208,216,232))
d.polygon([(0,2*T),(80,20),(170,50),(260,6),(360,40),(W,24),(W,2*T)],fill=(240,244,250),outline=(180,192,210))
d.ellipse((W-80,8,W-50,38),fill=(250,250,250)); d.arc((W-100,16,W-30,30),0,360,fill=(200,200,214))
for (w,y) in [(12,11),(10,7),(8,3)]:
    l=(14-w)//2*T
    cliff(e,l,y*T,w*T,3*T,T)
mango_tree(e,3*T-8,2*T-10)
d=ImageDraw.Draw(e)
d.rectangle((6*T,18*T,8*T,H),fill=(184,160,120))
e.save(O+'steps_blockout.png')

# まとめ(確認用)
sheet=Image.new('RGB',(28*T+14*T+30,max(8+14+5,20)*T+60),(245,240,228))
yy=0
for im in (c,b,a):
    sheet.paste(im,(0,yy)); yy+=im.height+20
sheet.paste(e,(28*T+30,0))
sheet.save(O+'blockout_all.png')
print('ok')
