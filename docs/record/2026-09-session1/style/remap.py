import sys; sys.path.insert(0,'style')
import numpy as np
from PIL import Image
from palette import RAMPS, hex2rgb
RESERVED={"宇宙軍(白・金)","計器の青緑","赤(ごく少量)"}
cols=[];fam=[];idx=[]
for k,r in RAMPS.items():
  for i,c in enumerate(r): cols.append(hex2rgb(c)); fam.append(k); idx.append(i)
cols=np.array(cols,float)
def lab(a):
  a=a/255.0; a=np.where(a>0.04045,((a+0.055)/1.055)**2.4,a/12.92)
  M=np.array([[0.4124,0.3576,0.1805],[0.2126,0.7152,0.0722],[0.0193,0.1192,0.9505]])
  xyz=a@M.T/np.array([0.9505,1,1.089])
  f=np.where(xyz>0.008856,np.cbrt(xyz),7.787*xyz+16/116)
  return np.stack([116*f[...,1]-16,500*(f[...,0]-f[...,1]),200*(f[...,1]-f[...,2])],-1)
PL=lab(cols)
PEN=np.array([12.0 if f in RESERVED else 0.0 for f in fam])
def grade(rgb,desat=0.25,warm=True):
  l=(rgb@np.array([0.3,0.59,0.11]))[...,None]
  g=rgb*(1-desat)+l*desat
  if warm: g=g*np.array([1.04,1.0,0.88])
  return np.clip(g,0,255)
def remap(im,desat=0.25,warm=True,keep_reserved=True):
  a=np.array(im.convert('RGBA')).astype(float); rgb=a[...,:3]; al=a[...,3]
  g=grade(rgb,desat,warm); L=lab(g)
  d=np.linalg.norm(L[...,None,:]-PL,axis=-1)+PEN
  ni=d.argmin(-1)
  out=cols[ni]
  H,W=al.shape
  # 輪郭: 透明に接する暗い画素は、内側の隣の色の系統の暗い段に
  lum=rgb@np.array([0.3,0.59,0.11])
  opaque=al>128
  for y in range(H):
    for x in range(W):
      if not opaque[y,x] or lum[y,x]>60: continue
      edge=False; nb=[]
      for dy,dx in ((-1,0),(1,0),(0,-1),(0,1)):
        yy,xx=y+dy,x+dx
        if not(0<=yy<H and 0<=xx<W) or not opaque[yy,xx]: edge=True
        elif lum[yy,xx]>60: nb.append(ni[yy,xx])
      if edge and nb:
        n=max(set(nb),key=nb.count); f=fam[n]; r=RAMPS[f]
        j=max(0,idx[n]-2); out[y,x]=hex2rgb(r[j])
  res=np.dstack([out,al]).astype(np.uint8)
  return Image.fromarray(res,'RGBA')
