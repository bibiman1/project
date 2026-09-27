# ガイコツの目の穴を、^_^ の笑い目に描きかえる
from PIL import Image
import sys
def bone(c): r,g,b,a=c; return a>0 and r>175 and g>165 and b>140 and max(r,g,b)-min(r,g,b)<60
def dark(c): r,g,b,a=c; return a>0 and (r+g+b)/3<85
def process(src,dst):
    im=Image.open(src).convert('RGBA'); px=im.load(); W,H=im.size
    bones=[(x,y) for x in range(W) for y in range(H) if bone(px[x,y])]
    if not bones: print('no bone',src); im.save(dst); return
    # 頭蓋骨 = 骨色のいちばん上のかたまり(上から20ドット以内)
    top=min(y for x,y in bones)
    skull=[(x,y) for x,y in bones if y<=top+14]
    x0=min(x for x,y in skull); x1=max(x for x,y in skull); y0=top; y1=max(y for x,y in skull)
    cx=(x0+x1)/2
    # 目の穴: 頭蓋骨の範囲の中の暗い点(左右に分ける)
    eyes={'L':[],'R':[]}
    for x in range(x0+1,x1):
        for y in range(y0+2,y0+12):
            if dark(px[x,y]):
                # まわりに骨があること(輪郭線ではない)
                n=sum(bone(px[x+a,y+b]) for a,b in((1,0),(-1,0),(0,1),(0,-1)) if 0<=x+a<W and 0<=y+b<H)
                if n>=1: eyes['L' if x<cx else 'R'].append((x,y))
    bc=px[skull[len(skull)//2]]
    fill=(236,226,200,255)
    for k,pts in eyes.items():
        if not pts: continue
        ex=sum(x for x,y in pts)/len(pts); ey=sum(y for x,y in pts)/len(pts)
        for x,y in pts: px[x,y]=fill
        ex=round(ex); ey=round(ey)
        ink=(40,28,24,255)
        for dx,dy in ((-2,1),(-1,0),(0,-1),(1,0),(2,1)):
            if 0<=ex+dx<W and 0<=ey+dy<H: px[ex+dx,ey+dy]=ink
    im.save(dst)
for n in sys.argv[1:]:
    process(f'gen/{n}.png',f'gen/{n}_s.png')
