from PIL import Image
import sys
OUT=(74,56,40,255)
def pal(hue):
    if hue=='ki': return dict(base=(243,227,179,255),shade=(218,196,142,255),hi=(255,247,220,255),limb=(236,216,160,255))
    return dict(base=(244,176,196,255),shade=(222,140,168,255),hi=(255,220,230,255),limb=(236,160,184,255))
NOSE=(236,140,70,255); NOSE_D=(170,80,40,255); EYE=(0,0,0,255)

def ellipse_mask(cx,cy,rx,ry):
    return {(x,y) for x in range(64) for y in range(64) if ((x+0.5-cx)/rx)**2+((y+0.5-cy)/ry)**2<=1}

def paint(im,mask,P,cx,cy,rx,ry):
    px=im.load()
    for (x,y) in mask:
        dx=(x+0.5-cx)/rx; dy=(y+0.5-cy)/ry
        c=P['base']
        if dx*0.6+dy*0.8>0.45: c=P['shade']
        if dx*-0.7+dy*-0.7>0.75: c=P['hi']
        px[x,y]=c
    for (x,y) in mask:
        if any((x+a,y+b) not in mask for a,b in ((1,0),(-1,0),(0,1),(0,-1))): px[x,y]=OUT

def blob(im,cx,cy,rx,ry,P,col=None):
    m=ellipse_mask(cx,cy,rx,ry); px=im.load()
    for (x,y) in m: px[x,y]=col or P['limb']
    for (x,y) in m:
        if any((x+a,y+b) not in m for a,b in ((1,0),(-1,0),(0,1),(0,-1))): px[x,y]=OUT
    return m

def frame(view,step,hue):
    P=pal(hue); im=Image.new('RGBA',(64,64),(0,0,0,0)); px=im.load()
    bob=[0,1,2,1,0,1,2][step] if step else 0
    lf=[0,-2,-1,0,2,1,0][step]; rf=-lf
    cy=31-bob*0.5
    if view in('south','north'):
        # feet behind body bottom
        blob(im,27,45+min(0,lf)*0.5,4,3,P); blob(im,37,45+min(0,rf)*0.5,4,3,P)
        # arms
        blob(im,18.5,35-bob*0.5+ (lf*0.3 if step else 0),3,3.5,P); blob(im,45.5,35-bob*0.5+(rf*0.3 if step else 0),3,3.5,P)
        m=ellipse_mask(32,cy,13.5,13.5); paint(im,m,P,32,cy,13.5,13.5)
        if view=='south':
            ey=int(round(cy))-1
            for ex in (24,38):
                for a in (0,1):
                    for b in (0,1): px[ex+a,ey+b]=EYE
            for x in range(29,35):
                for y in range(ey-1,ey+3):
                    if not ((x in (29,34)) and (y in (ey-1,ey+2))): px[x,y]=NOSE
            px[30,ey]=NOSE_D; px[33,ey]=NOSE_D
    else:
        s=1 if view=='east' else -1
        def X(x): return x if s==1 else 63-x
        tmp=Image.new('RGBA',(64,64),(0,0,0,0))
        blob(tmp,28+lf,45,4.5,3,P); blob(tmp,36+rf,45,4.5,3,P)
        blob(tmp,44.5+lf*0.4,39-bob*0.5,3.5,3,P)  # 手(体のうしろから前に出る)
        m=ellipse_mask(32,cy+1,15.5,12); paint(tmp,m,P,32,cy+1,15.5,12)
        tp=tmp.load(); ey=int(round(cy))
        # snout on the front edge, eye at the same height
        for x in range(45,50):
            for y in range(ey-1,ey+3):
                if not (x==49 and y in (ey-1,ey+2)): tp[x,y]=NOSE
        tp[49,ey-1]=OUT if tp[49,ey-1][3] else (0,0,0,0)
        for y in range(ey-1,ey+3): tp[50,y]=OUT
        tp[48,ey]=NOSE_D
        for a in (0,1):
            for b in (0,1): tp[40+a,ey+b]=EYE
        if s==-1: tmp=tmp.transpose(Image.FLIP_LEFT_RIGHT)
        im=tmp
    return im

for hue,name in (('ki','ki_walk'),('pi','pi_walk')):
    sheet=Image.new('RGBA',(64*7,64*4))
    for r,v in enumerate(['south','north','east','west']):
        for f in range(7): sheet.paste(frame(v,f,hue),(f*64,r*64))
    sheet.save(f'gen/{name}_v2.png')
b=Image.new('RGBA',(64*7*3,64*8*3),(110,130,110,255))
for i,n in enumerate(['ki_walk_v2','pi_walk_v2']):
    s=Image.open(f'gen/{n}.png'); b.alpha_composite(s.resize((s.width*3,s.height*3),Image.NEAREST),(0,i*64*4*3))
b.save('ki_v2_view.png')
print(Image.open('gen/ki_walk_v2.png').crop((0,0,64,64)).getbbox())
