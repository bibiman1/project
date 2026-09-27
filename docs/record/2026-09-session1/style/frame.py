import sys; sys.path.insert(0,'style')
from PIL import Image
from draw_arch import rect, put, WOOD, PL, AI, R
def framed(pic, kind='wood'):
  """作品の一枚絵: 漆喰の壁に掛かった額。絵は縮めずに中央を切り抜く。kind: wood(絵画) / photo(写真の黒い台紙)"""
  W,H=320,192
  im=Image.new('RGBA',(W,H),PL(3))
  for y in range(H):
    for x in range((y*7)%11,W,11): put(im,x,y,PL(2))
  M=10; F=7 if kind=='wood' else 4
  x0,y0,x1,y1=M,M,W-M,H-M
  rect(im,x0+3,y0+3,x1+3,y1+3,PL(1))                          # 壁に落ちる影
  if kind=='wood':
    rect(im,x0,y0,x1,y1,WOOD(3)); rect(im,x0,y0,x1,y0+1,WOOD(5)); rect(im,x0,y0,x0+1,y1,WOOD(5))
    rect(im,x0+F-1,y0+F-1,x1-F+1,y1-F+1,WOOD(1)); rect(im,x1-1,y0,x1,y1,WOOD(1)); rect(im,x0,y1-1,x1,y1,WOOD(1))
    ix0,iy0,ix1,iy1=x0+F,y0+F,x1-F,y1-F
  else:
    rect(im,x0,y0,x1,y1,AI(0)); rect(im,x0+F,y0+F,x1-F,y1-F,PL(4))   # 黒い台紙に白い余白
    ix0,iy0,ix1,iy1=x0+F+5,y0+F+5,x1-F-5,y1-F-5
  pw,ph=ix1-ix0,iy1-iy0
  p=pic.convert('RGBA'); cx=(p.width-pw)//2; cy=(p.height-ph)//2
  im.alpha_composite(p.crop((cx,cy,cx+pw,cy+ph)),(ix0,iy0))
  return im
def thumb(pic, kind='wood'):
  """マップの壁に掛ける小さな額(32x32、下半分は透明)"""
  im=Image.new('RGBA',(32,32),(0,0,0,0))
  x0,y0,x1,y1=1,4,31,24
  if kind=='wood':
    rect(im,x0,y0,x1,y1,WOOD(3)); rect(im,x0,y0,x1,y0+1,WOOD(5)); rect(im,x1-1,y0,x1,y1,WOOD(1)); rect(im,x0,y1-1,x1,y1,WOOD(1))
    ix0,iy0,ix1,iy1=x0+2,y0+2,x1-2,y1-2
  else:
    rect(im,x0,y0,x1,y1,AI(0)); rect(im,x0+1,y0+1,x1-1,y1-1,PL(4)); ix0,iy0,ix1,iy1=x0+3,y0+3,x1-3,y1-3
  s=pic.convert('RGB').resize((ix1-ix0,iy1-iy0),Image.LANCZOS)
  im.paste(s,(ix0,iy0))
  rect(im,x0+2,y1,x1+1,y1+1,(0,0,0,60))
  return im
def framed_fit(pic, kind='wood'):
  """絵の大きさに合わせて額を描く(縮めない)。壁の中央に掛ける"""
  W,H=320,192
  im=Image.new('RGBA',(W,H),PL(3))
  for y in range(H):
    for x in range((y*7)%11,W,11): put(im,x,y,PL(2))
  pw,ph=pic.size
  F=7 if kind=='wood' else 4; mat=0 if kind=='wood' else 5
  x0=(W-pw)//2-F-mat; y0=(H-ph)//2-F-mat; x1=x0+pw+2*(F+mat); y1=y0+ph+2*(F+mat)
  rect(im,x0+3,y0+3,x1+3,y1+3,PL(1))
  if kind=='wood':
    rect(im,x0,y0,x1,y1,WOOD(3)); rect(im,x0,y0,x1,y0+1,WOOD(5)); rect(im,x0,y0,x0+1,y1,WOOD(5))
    rect(im,x0+F-1,y0+F-1,x1-F+1,y1-F+1,WOOD(1)); rect(im,x1-1,y0,x1,y1,WOOD(1)); rect(im,x0,y1-1,x1,y1,WOOD(1))
  else:
    rect(im,x0,y0,x1,y1,AI(0)); rect(im,x0+F,y0+F,x1-F,y1-F,PL(4))
  im.alpha_composite(pic.convert('RGBA'),(x0+F+mat,y0+F+mat))
  return im
