# きー/ぴー: つぶれた饅頭。正面も横も楕円。手足なし。鼻の穴なし。目は鼻と同じ高さの真っ黒な点。
from PIL import Image
OUT=(74,56,40,255)
PALS={'ki':dict(base=(243,227,179,255),shade=(218,196,142,255),hi=(255,247,220,255)),
      'pi':dict(base=(244,176,196,255),shade=(222,140,168,255),hi=(255,220,230,255))}
NOSE=(236,140,70,255); NOSE_OUT=(170,90,50,255); EYE=(0,0,0,255)
GROUND=47
def emask(cx,cy,rx,ry):
    return {(x,y) for x in range(64) for y in range(64) if ((x+0.5-cx)/rx)**2+((y+0.5-cy)/ry)**2<=1}
def body(px,m,P,cx,cy,rx,ry):
    for (x,y) in m:
        dx=(x+0.5-cx)/rx; dy=(y+0.5-cy)/ry
        c=P['base']
        if dx*0.5+dy*0.9>0.5: c=P['shade']
        if dx*-0.6+dy*-0.8>0.72: c=P['hi']
        px[x,y]=c
    for (x,y) in m:
        if any((x+a,y+b) not in m for a,b in ((1,0),(-1,0),(0,1),(0,-1))): px[x,y]=OUT
# 歩き: 小さく跳ねて、つぶれて伸びる
HOP=[0,1,2,2,1,0,0]; SQ=[0,0,-1,-1,0,1,1]
def frame(view,f,P):
    im=Image.new('RGBA',(64,64),(0,0,0,0)); px=im.load()
    hop=HOP[f] if f else 0; sq=SQ[f] if f else 0
    if view in ('south','north'): rx,ry=16-sq*0.5,11.5+sq*0.6
    else: rx,ry=17-sq*0.5,11+sq*0.6
    cx=32; cy=GROUND-ry-hop+0.5
    # 影は描かない(エンジンが足もとに影を描く)
    m=emask(cx,cy,rx,ry); body(px,m,P,cx,cy,rx,ry)
    ey=int(round(cy))
    if view=='south':
        for ex in (23,39):
            for a in (0,1):
                for b in (0,1): px[ex+a,ey+b]=EYE
        for x in range(29,35):
            for y in range(ey-1,ey+3):
                corner=(x in (29,34)) and (y in (ey-1,ey+2))
                if not corner: px[x,y]=NOSE
        # 鼻の下側だけ少し濃く(鼻の穴は描かない)
        for x in range(30,34): px[x,ey+2]=NOSE_OUT
    elif view in ('east','west'):
        tmp=Image.new('RGBA',(64,64),(0,0,0,0)); tp=tmp.load()
        m=emask(cx,cy,rx,ry); body(tp,m,P,cx,cy,rx,ry)
        nx=int(round(cx+rx))-2
        for x in range(nx,nx+4):
            for y in range(ey-1,ey+3):
                if not (x==nx+3 and y in (ey-1,ey+2)): tp[x,y]=NOSE
        for y in range(ey,ey+2): tp[nx+4,y]=NOSE_OUT
        tp[nx+3,ey-1]=NOSE_OUT; tp[nx+3,ey+2]=NOSE_OUT
        for a in (0,1):
            for b in (0,1): tp[nx-7+a,ey+b]=EYE
        if view=='west': tmp=tmp.transpose(Image.FLIP_LEFT_RIGHT)
        im=tmp
    return im
for hue,name in (('ki','ki_walk'),('pi','pi_walk')):
    sheet=Image.new('RGBA',(64*7,64*4))
    for r,v in enumerate(['south','north','east','west']):
        for f in range(7): sheet.paste(frame(v,f,PALS[hue]),(f*64,r*64))
    sheet.save(f'gen/{name}_v3.png')
b=Image.new('RGBA',(64*7*3,64*8*3),(110,130,110,255))
for i,n in enumerate(['ki_walk_v3','pi_walk_v3']):
    s=Image.open(f'gen/{n}.png'); b.alpha_composite(s.resize((s.width*3,s.height*3),Image.NEAREST),(0,i*64*4*3))
b.crop((0,0,b.width,64*5*3)).save('ki_v3_view.png')
print(Image.open('gen/ki_walk_v3.png').crop((0,0,64,64)).getbbox())
