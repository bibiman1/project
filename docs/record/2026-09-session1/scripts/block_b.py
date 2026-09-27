from PIL import Image, ImageDraw
import random
t=16; W,H=32*t,20*t
im=Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
R=lambda c0,r0,c1,r1,col: d.rectangle((c0*t,r0*t,c1*t-1,r1*t-1),fill=col)
LAKE=(120,150,168); MIST=(206,214,214); SHORE=(150,146,120); CONC=(176,172,160); GRASS=(132,146,92); HULL=(116,124,118)
R(0,0,32,8.6,LAKE)
for r in (0.6,2.2,6.8): R(0,r,32,r+0.6,MIST)
R(0,0,32,0.6,(150,160,150))                      # 対岸
R(0,8.6,32,9.4,SHORE)                            # 護岸
R(0,9.4,32,17,CONC)
rnd=random.Random(2)
for _ in range(60):
  c=rnd.uniform(0,32); r=rnd.uniform(9.4,17); d.ellipse((c*t,r*t,c*t+rnd.randint(8,26),r*t+rnd.randint(4,10)),fill=GRASS)
R(0,17,32,20,(150,140,96))                       # 蓮田
for c in range(0,32):
  for r in (17.6,18.6,19.4): d.line((c*t+4,r*t,c*t+6,r*t-6),fill=(100,92,60))
# 塀と門
d.line((0,17*t,14.6*t,17*t),fill=(90,84,76),width=2); d.line((17.4*t,17*t,W,17*t),fill=(90,84,76),width=2)
R(14.6,16.2,15.2,17.4,(170,166,158)); R(16.8,16.2,17.4,17.4,(170,166,158))
R(15.2,17,16.8,20,(200,184,150))                 # あぜ道
# 衛兵所(3/4: 屋根+南面)
R(19,15.4,22,16.2,(120,120,116)); R(19,16.2,22,17.2,(190,176,150)); R(19.5,16.4,20.2,17.2,(100,80,60)); R(20.8,16.4,21.6,16.9,(170,196,210))
# 傾斜路
d.polygon([(15*t,16.2*t),(18*t,16.2*t),(18*t,8*t),(15*t,8*t)],fill=(160,160,152))
for r in range(9,16): d.line((15*t,r*t,18*t,r*t),fill=(140,140,132))
d.line((16.5*t,8*t,16.3*t,7.4*t),fill=(110,80,50),width=3)   # 落ちた渡り板
# 格納庫(西、3/4: 屋根の面+南の壁)
R(1,9.8,14,13,(128,130,128)); d.line((1*t,11.4*t,14*t,11.4*t),fill=(150,152,150))   # 切妻屋根
R(1,13,14,16,(196,190,176))
for k in range(4):
  c=1.5+k*3.1
  if k==2: d.polygon([(c*t,13.6*t),(c*t+3*t,13.4*t),(c*t+2.6*t,16*t),(c*t+0.6*t,16*t)],fill=(100,100,96))
  else: R(c,13.4,c+2.9,16,(96,96,92) if k<2 else (116,116,110))
for k in range(5): R(1.8+k*2.6,13.05,2.6+k*2.6,13.35,(170,196,210))
d.ellipse((3*t,9.6*t,6*t,11*t),fill=(160,176,96))   # 屋根の穴から伸びる木
# 燃料ドラム
for k in range(5): d.ellipse(((20+k*0.9)*t,13.4*t,(20.8+k*0.9)*t,14.3*t),fill=(150,80,54))
# 見張り台(3/4)
R(25,10,27.4,11,(120,120,116)); R(25.2,11,27.2,11.6,(180,150,110))
for c in (25.4,26.9): d.line((c*t,11.6*t,c*t,15*t),fill=(150,108,70),width=3)
# 吹き流し
d.line((29.5*t,10*t,29.5*t,14*t),fill=(90,90,90),width=2); d.polygon([(29.5*t,10*t),(31.5*t,10.3*t),(29.5*t,10.6*t)],fill=(220,120,80))
# エクラノプラン(上からやや斜め: 上面を主に、南の側面を少し)
cy=4.0
d.polygon([(4*t,cy*t),(5*t,(cy-0.9)*t),(24*t,(cy-1.0)*t),(27*t,(cy-0.6)*t),(28*t,cy*t),(27*t,(cy+0.9)*t),(24*t,(cy+1.3)*t),(5*t,(cy+1.2)*t)],fill=HULL)
d.polygon([(5*t,(cy+0.6)*t),(24*t,(cy+0.8)*t),(27*t,(cy+0.9)*t),(24*t,(cy+1.3)*t),(5*t,(cy+1.2)*t)],fill=(98,104,100))   # 南の側面
for sgn,dy in ((-1,-1.0),(1,1.1)):
  d.polygon([(13*t,(cy+dy)*t),(19*t,(cy+dy)*t),(17.4*t,(cy+dy+sgn*(3.0 if sgn>0 else 3.6))*t),(15.2*t,(cy+dy+sgn*(3.0 if sgn>0 else 3.6))*t)],fill=(106,114,108))
  d.polygon([(20*t,(cy+dy)*t),(23*t,(cy+dy)*t),(22.6*t,(cy+dy+sgn*1.6)*t),(20.4*t,(cy+dy+sgn*1.6)*t)],fill=(106,114,108))
  for k in range(4): R(20.2+k*0.7,cy+dy+(sgn*0.1 if sgn>0 else -0.5),20.7+k*0.7,cy+dy+(0.5 if sgn>0 else -0.1),(84,90,86))
  d.polygon([(3*t,(cy+sgn*0.2)*t),(8*t,(cy+sgn*0.2)*t),(7.6*t,(cy+sgn*2.4)*t),(3.4*t,(cy+sgn*2.4)*t)],fill=(106,114,108))
for k in range(3):
  for sgn in (-1,1): R(12+k*3.2,cy+(sgn*0.15 if sgn>0 else -0.55),14.6+k*3.2,cy+(0.55 if sgn>0 else -0.15),(140,146,140))
d.polygon([(23.4*t,(cy-0.5)*t),(25.8*t,(cy-0.45)*t),(25.8*t,(cy+0.45)*t),(23.4*t,(cy+0.5)*t)],fill=(170,196,210))
# 自然: 翼の上の草、機体のくぼみの蓮、渡り鳥
for (c,r) in [(15.5,6.5),(16.8,7.4),(15.9,2.5),(9,4.2),(21,3.6)]: d.ellipse((c*t,r*t,c*t+14,r*t+8),fill=GRASS)
for (c,r) in [(11,4.6),(18,4.3)]: d.ellipse((c*t,r*t,c*t+10,r*t+6),fill=(200,150,160))
for (c,r) in [(6,1.4),(6.6,1.7),(26,7.2),(26.8,7.5),(27.4,7.1)]: d.line((c*t,r*t,c*t+5,r*t-3),fill=(240,240,236),width=2); d.line((c*t+5,r*t-3,c*t+10,r*t),fill=(240,240,236),width=2)
# 霧を機体の足もとに少し
d.rectangle((0,7.6*t,W,8.2*t),fill=MIST)
im.save('gen/block_b.png'); im.resize((1024,640),Image.NEAREST).save('z.png')
