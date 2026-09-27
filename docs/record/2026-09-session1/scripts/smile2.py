from PIL import Image
from collections import deque
import sys
def bone(c): r,g,b,a=c; return a>0 and r>175 and g>165 and b>140 and max(r,g,b)-min(r,g,b)<60
def dark(c): r,g,b,a=c; return a>0 and (r+g+b)/3<85
def process(n):
    im=Image.open(f'gen/{n}.png').convert('RGBA'); px=im.load(); W,H=im.size
    rows=[y for y in range(min(H,34)) if sum(bone(px[x,y]) for x in range(W))>=4]
    y0,y1=min(rows),max(rows)
    xs=[x for y in rows for x in range(W) if bone(px[x,y])]
    x0,x1=min(xs),max(xs)
    seen=set(); comps=[]
    for y in range(y0,y1+1):
        for x in range(x0,x1+1):
            if (x,y) in seen or not dark(px[x,y]): continue
            q=deque([(x,y)]); seen.add((x,y)); comp=[]; bad=False
            while q:
                cx,cy=q.popleft(); comp.append((cx,cy))
                for a,b in((1,0),(-1,0),(0,1),(0,-1)):
                    nx,ny=cx+a,cy+b
                    if not(x0<=nx<=x1 and y0<=ny<=y1): bad=True; continue
                    c=px[nx,ny]
                    if c[3]==0: bad=True
                    if dark(c) and (nx,ny) not in seen: seen.add((nx,ny)); q.append((nx,ny))
            if not bad and len(comp)>=5: comps.append(comp)
    # 目 = 大きい順に2つ(上のほうにあるもの)
    comps.sort(key=lambda c:-len(c))
    eyes=[c for c in comps if sum(y for x,y in c)/len(c) < y0+(y1-y0)*0.7][:2]
    bc=[px[x,y] for y in rows for x in range(x0,x1+1) if bone(px[x,y])]
    bc=sorted(bc,key=lambda c:sum(c[:3]))[len(bc)//2]
    for c in eyes:
        for x,y in c: px[x,y]=bc
        ex=round(sum(x for x,y in c)/len(c)); ey=round(sum(y for x,y in c)/len(c))
        w=max(x for x,y in c)-min(x for x,y in c)+1
        half=2 if w>=5 else 1
        ink=(44,30,26,255)
        for dx in range(-half,half+1):
            px[ex+dx,ey-(half-abs(dx))]=ink
    im.save(f'gen/{n}_s.png'); return len(eyes)
for n in sys.argv[1:]: print(n,process(n))
