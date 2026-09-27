from PIL import Image, ImageDraw, ImageFont
F=lambda n: ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf',n)
f11,f12,f14,f16,f20=F(11),F(12),F(14),F(16),F(20)
W,H=1600,1500
im=Image.new('RGB',(W,H),(246,241,228)); d=ImageDraw.Draw(im)
INK=(40,36,32); RED=(170,50,40); HULL=(126,134,128); RUST=(150,96,64); GLASS=(170,196,210); WATER=(150,178,196); CONC=(182,178,170); WOOD=(150,108,70)
T=lambda x,y,t,f=f12,c=INK: d.text((x,y),t,font=f,fill=c)
def title(x,y,t): T(x,y,t,f16); d.line((x,y+22,x+700,y+22),fill=INK)
def dim(x0,y0,x1,y1,t):
  d.line((x0,y0,x1,y1),fill=RED); d.line((x0,y0-4,x0,y0+4) if y0==y1 else (x0-4,y0,x0+4,y0),fill=RED); d.line((x1,y1-4,x1,y1+4) if y0==y1 else (x1-4,y1,x1+4,y1),fill=RED)
  T((x0+x1)/2-d.textlength(t,font=f11)/2,(y0+y1)/2-14 if y0==y1 else (y0+y1)/2-6,t,f11,RED)
T(20,10,'③ 設計図（霞ヶ浦のエクラノプラン）　寸法はマップのマス（1マス＝32px）。実物より縮めてある',f20)
# ---- 1 エクラノプラン 側面図 ----
title(20,50,'1. エクラノプラン　側面図（右が機首＝東）。モデル：ルン級（実物 全長73m・幅44m・高さ19m）')
ox,oy=100,130; S=18  # 1マス=18px(図上)
L=24  # 全長24マス
wl=oy+7*S  # 水線
d.rectangle((ox-20,wl,ox+L*S+40,wl+60),fill=WATER)
hull=[(ox,wl-2*S),(ox+2*S,wl-3.2*S),(ox+20*S,wl-3.4*S),(ox+23*S,wl-2.6*S),(ox+24*S,wl-1.6*S),(ox+23.4*S,wl-0.6*S),(ox+14*S,wl+0.8*S),(ox+13.4*S,wl+0.2*S),(ox+3*S,wl+0.2*S),(ox,wl-0.8*S)]
d.polygon(hull,fill=HULL,outline=INK)
d.line((ox+13.7*S,wl+0.8*S,ox+13.7*S,wl+0.2*S),fill=INK,width=2); T(ox+13.2*S,wl+14,'段（ステップ）',f11)
# 尾翼(T字)
d.polygon([(ox+1*S,wl-3.2*S),(ox+4*S,wl-3.3*S),(ox+2.6*S,wl-8.6*S),(ox+0.6*S,wl-8.6*S)],fill=HULL,outline=INK)
d.rectangle((ox-1*S,wl-9*S,ox+4*S,wl-8.5*S),fill=HULL,outline=INK); d.ellipse((ox+3.6*S,wl-9.1*S,ox+4.4*S,wl-8.4*S),fill=(200,200,190),outline=INK)
T(ox+4.6*S,wl-9*S,'尾翼の先にレドーム',f11)
# 主翼(側面では薄い板)
d.polygon([(ox+9*S,wl-1.4*S),(ox+15*S,wl-1.6*S),(ox+15*S,wl-1.2*S),(ox+9*S,wl-1.0*S)],fill=(110,118,112),outline=INK)
# 背中の発射筒3対
for k in range(3):
  x=ox+(8+k*3.2)*S; d.polygon([(x,wl-3.4*S),(x+2.6*S,wl-3.5*S),(x+2.8*S,wl-4.3*S),(x+0.2*S,wl-4.2*S)],fill=(140,146,140),outline=INK)
T(ox+9*S,wl-5.2*S,'背中の発射筒 3対（6本）',f11)
# 操縦席キャノピー
d.polygon([(ox+19.4*S,wl-3.4*S),(ox+21.6*S,wl-3.3*S),(ox+22.3*S,wl-2.8*S),(ox+19.4*S,wl-2.9*S)],fill=GLASS,outline=INK)
for k in range(4): x=ox+(19.8+k*0.6)*S; d.line((x,wl-3.35*S,x,wl-2.9*S),fill=INK)
T(ox+20*S,wl-5.6*S,'操縦席（2人並び）。窓4枚',f11,RED); d.line((ox+21*S,wl-5*S,ox+20.8*S,wl-3.4*S),fill=RED)
# 機首レドーム
d.polygon([(ox+23*S,wl-2.6*S),(ox+24*S,wl-1.6*S),(ox+23.4*S,wl-0.6*S)],fill=(200,200,190),outline=INK); T(ox+24.3*S,wl-2.2*S,'機首レドーム',f11)
# エンジン(操縦席のすぐ後ろ、片側4基)
d.polygon([(ox+16*S,wl-3.4*S),(ox+19*S,wl-3.4*S),(ox+18.6*S,wl-4.8*S),(ox+16.4*S,wl-4.8*S)],fill=(110,118,112),outline=INK)
for k in range(4): d.rectangle((ox+16.2*S+k*0.62*S,wl-5.8*S,ox+16.7*S+k*0.62*S,wl-4.8*S),fill=(90,96,92),outline=INK)
T(ox+14.8*S,wl-6.8*S,'操縦席のすぐ後ろに ジェット4基（反対側にも4基）',f11)
# 乗降口
d.rectangle((ox+17.2*S,wl-2.4*S,ox+17.9*S,wl-1.2*S),fill=(80,80,76),outline=INK); T(ox+16*S,wl-0.9*S,'乗降口（扉1）',f11,RED)
# 錆
for (x,y) in [(6,-1),(11,-2),(15,-0.5),(21,-1.5),(3,-2.5)]: d.ellipse((ox+x*S,wl+y*S,ox+x*S+14,wl+y*S+8),fill=RUST)
T(ox+2*S,wl+30,'水線。船体の下半分は水に浸かり、錆が流れている',f11)
dim(ox,wl+70,ox+24*S,wl+70,'全長 24マス')
d.line((ox-2*S,wl-9*S,ox-2*S,wl),fill=RED); T(ox-2*S+4,wl+36,'',f11); T(ox+2*S,wl+84,'高さ 9マス（水面から尾翼の先まで。左端の赤線）',f11,RED)
# ---- 2 上面図 ----
title(20,440,'2. エクラノプラン　上面図（北が上）')
ox2,oy2=100,590
cx=oy2
d.polygon([(ox2,cx),(ox2+1*S,cx-1.2*S),(ox2+20*S,cx-1.4*S),(ox2+23*S,cx-0.8*S),(ox2+24*S,cx),(ox2+23*S,cx+0.8*S),(ox2+20*S,cx+1.4*S),(ox2+1*S,cx+1.2*S)],fill=HULL,outline=INK)
for sgn in (-1,1):
  d.polygon([(ox2+9*S,cx+sgn*1.4*S),(ox2+15*S,cx+sgn*1.4*S),(ox2+13.6*S,cx+sgn*6*S),(ox2+11.4*S,cx+sgn*6*S)],fill=(110,118,112),outline=INK)
  d.polygon([(ox2+16*S,cx+sgn*1.4*S),(ox2+19*S,cx+sgn*1.4*S),(ox2+18.6*S,cx+sgn*3*S),(ox2+16.4*S,cx+sgn*3*S)],fill=(110,118,112),outline=INK)
  for k in range(4): d.rectangle((ox2+16.2*S+k*0.62*S,cx+sgn*1.6*S-(8 if sgn<0 else 0),ox2+16.7*S+k*0.62*S,cx+sgn*1.6*S+(0 if sgn<0 else 8)),fill=(90,96,92))
  d.polygon([(ox2-1*S,cx+sgn*0.2*S),(ox2+4*S,cx+sgn*0.2*S),(ox2+3.6*S,cx+sgn*3*S),(ox2-0.6*S,cx+sgn*3*S)],fill=(110,118,112),outline=INK)
for k in range(3):
  for sgn in (-1,1): d.rectangle((ox2+(8+k*3.2)*S,cx+sgn*0.2*S-(10 if sgn<0 else 0),ox2+(10.6+k*3.2)*S,cx+sgn*0.2*S+(0 if sgn<0 else 10)),fill=(140,146,140),outline=INK)
d.polygon([(ox2+19.4*S,cx-0.6*S),(ox2+21.6*S,cx-0.5*S),(ox2+21.6*S,cx+0.5*S),(ox2+19.4*S,cx+0.6*S)],fill=GLASS,outline=INK)
T(ox2+12.9*S,cx+5*S,'翼幅 12マス',f11,RED)
T(ox2+14*S,cx+3.2*S,'← 翼の上に跳び乗る（渡り板が落ちている）',f11,RED)
# ---- 3 格納庫 ----
title(820,50,'3. 格納庫　正面（北＝湖に向く）と平面')
hx,hy=860,120; S2=16
d.polygon([(hx,hy+4*S2),(hx+7*S2,hy),(hx+14*S2,hy+4*S2)],fill=(140,140,136),outline=INK)
d.rectangle((hx,hy+4*S2,hx+14*S2,hy+12*S2),fill=(196,190,176),outline=INK)
for k in range(4):
  x=hx+(1+k*3)*S2; col=(96,96,92) if k in (0,1) else (120,120,114)
  if k==2: d.polygon([(x,hy+6*S2),(x+3*S2,hy+5*S2),(x+3*S2,hy+12*S2),(x+1*S2,hy+12*S2)],fill=(110,110,104),outline=INK)
  else: d.rectangle((x,hy+5*S2,x+3*S2,hy+12*S2),fill=col,outline=INK)
T(hx+15*S2,hy+5*S2,'引き戸 4枚。右から2枚目が外れて傾いている',f11,RED)
T(hx+15*S2,hy+6.2*S2,'（入口は、そのすき間1か所）',f11,RED)
for k in range(5): d.rectangle((hx+(1+k*2.6)*S2,hy+4.3*S2,hx+(2+k*2.6)*S2,hy+4.8*S2),fill=GLASS,outline=INK)
T(hx+15*S2,hy+3.9*S2,'妻壁の高窓 5つ',f11,RED)
T(hx+2*S2,hy+1.5*S2,'切妻の鉄板屋根',f11)
dim(hx,hy+13*S2,hx+14*S2,hy+13*S2,'幅 14マス')
# 平面
px,py=860,360
d.rectangle((px,py,px+14*S2,py+10*S2),outline=INK,width=2,fill=(236,230,216))
T(px+4,py+4,'（北・引き戸）',f11)
d.rectangle((px+1*S2,py+3*S2,px+5*S2,py+6*S2),fill=(170,150,120),outline=INK); T(px+1.2*S2,py+4*S2,'整備台と',f11); T(px+1.2*S2,py+5*S2,'折れた翼の機体',f11)
d.rounded_rectangle((px+8*S2,py+6*S2,px+13*S2,py+9*S2),radius=8,fill=(190,180,150),outline=INK); T(px+8.4*S2,py+7*S2,'ツェッペリンの',f11); T(px+8.4*S2,py+8*S2,'ゴンドラ（奥）',f11)
for k in range(4): d.ellipse((px+(7+k)*S2,py+2*S2,px+(7.8+k)*S2,py+2.8*S2),fill=(150,70,50))
T(px+7*S2,py+3*S2,'燃料ドラム',f11)
d.ellipse((px+3*S2,py+7.4*S2,px+4.4*S2,py+8.8*S2),fill=(214,180,120),outline=INK); T(px+4.6*S2,py+7.8*S2,'地上ぼぎクルー',f11,RED)
T(px,py+10*S2+4,'床はコンクリート、天井は鉄骨トラス。窓は北の妻壁の高窓だけ',f11)
# ---- 4 見張り台・傾斜路・門 ----
title(820,560,'4. 見張り台／傾斜路／門と衛兵所')
wx,wy=860,620
d.polygon([(wx,wy+30),(wx+60,wy+30),(wx+50,wy+14),(wx+10,wy+14)],fill=(120,120,116),outline=INK)
d.rectangle((wx+6,wy+30,wx+54,wy+46),fill=(180,150,110),outline=INK)
for x in (wx+10,wx+50): d.line((x,wy+46,x+(-8 if x<wx+30 else 8),wy+180),fill=WOOD,width=4)
for y in range(wy+60,wy+180,30): d.line((wx+6,y,wx+56,y+20),fill=WOOD,width=2); d.line((wx+56,y,wx+6,y+20),fill=WOOD,width=2)
d.line((wx+26,wy+46,wx+26,wy+180),fill=INK); d.line((wx+34,wy+46,wx+34,wy+180),fill=INK)
for y in range(wy+50,wy+180,8): d.line((wx+26,y,wx+34,y),fill=INK)
T(wx+70,wy+20,'見張り台：木の櫓、高さ5マス',f11); T(wx+70,wy+36,'はしご1本（登れない。飾り）',f11,RED)
# 傾斜路
sx,sy=1100,640
d.polygon([(sx,sy+120),(sx+90,sy+120),(sx+80,sy),(sx+10,sy)],fill=CONC,outline=INK)
d.rectangle((sx-20,sy-10,sx+110,sy+30),fill=WATER)
d.polygon([(sx,sy+120),(sx+90,sy+120),(sx+80,sy+30),(sx+10,sy+30)],fill=CONC,outline=INK)
for y in range(sy+40,sy+120,10): d.line((sx+8,y,sx+84,y),fill=(160,156,148))
for x in (sx+4,sx+86): d.ellipse((x-4,sy+100,x+4,sy+108),fill=(90,90,86))
d.line((sx+44,sy+30,sx+30,sy+6),fill=WOOD,width=4); T(sx+100,sy+40,'傾斜路：幅3マス、長さ6マス',f11)
T(sx+100,sy+56,'先端で渡り板が落ちて水に',f11,RED); T(sx+100,sy+72,'浸かっている → ジャンプで翼へ',f11,RED)
T(sx+100,sy+88,'両脇に係留柱（ボラード）',f11)
# 門と衛兵所
gx,gy=860,860
for x in (gx,gx+80): d.rectangle((x,gy,x+14,gy+60),fill=(170,166,158),outline=INK)
d.line((gx+14,gy+50,gx+80,gy+60),fill=(90,80,70),width=2); T(gx+100,gy,'門：コンクリートの門柱2本（扉なし）',f11)
T(gx+100,gy+16,'倒れた有刺鉄線',f11)
d.polygon([(gx+200,gy+20),(gx+240,gy+4),(gx+280,gy+20)],fill=(120,120,116),outline=INK)
d.rectangle((gx+204,gy+20,gx+276,gy+60),fill=(190,176,150),outline=INK)
d.rectangle((gx+214,gy+30,gx+232,gy+60),fill=(100,80,60),outline=INK); d.rectangle((gx+246,gy+30,gx+266,gy+46),fill=GLASS,outline=INK)
T(gx+290,gy+24,'衛兵所：扉1・窓1',f11,RED)
# ---- 5 地上ぼぎクルー / ゴンドラ ----
title(20,720,'5. 地上ぼぎクルー（笹野一刀彫）と、ツェッペリンのゴンドラ')
T(30,760,'笹野一刀彫：山形県米沢の木彫。コシアブラの丸木をサルキリで削り、削りかけ（薄く巻いた削りくず）で羽や尾をつくる。',f12)
T(30,778,'代表はお鷹ぽっぽ。ほかに鶏、せきれい、もちつきウサギ、恵比寿・大黒など。',f12)
cx0,cy0=120,900
d.rounded_rectangle((cx0,cy0,cx0+60,cy0+110),radius=26,fill=(236,220,180),outline=INK)
d.ellipse((cx0+8,cy0-40,cx0+52,cy0+8),fill=(236,220,180),outline=INK)
d.polygon([(cx0+44,cy0-18),(cx0+64,cy0-10),(cx0+44,cy0-6)],fill=(230,190,60),outline=INK)
d.ellipse((cx0+30,cy0-26,cx0+38,cy0-18),fill=INK)
for k in range(5): d.arc((cx0-30+k*6,cy0+10+k*10,cx0+10+k*6,cy0+50+k*10),200,340,fill=(210,180,130),width=3)
d.rectangle((cx0+6,cy0-46,cx0+54,cy0-36),fill=(60,70,90),outline=INK)
d.line((cx0+60,cy0+60,cx0+96,cy0+40),fill=(120,124,130),width=5)
T(cx0+110,cy0-40,'案A：お鷹ぽっぽ型の一刀彫。削りかけの翼。',f12)
T(cx0+110,cy0-22,'紺の作業帽をかぶり、スパナを持つ（整備員）。',f12)
T(cx0+110,cy0-4,'大きさ：きーと同じくらい（64px）。',f12)
T(cx0+110,cy0+14,'きーにジャンプの仕方を教える。',f12,RED)
T(cx0+110,cy0+40,'案B：複数体（鷹・せきれい・鶏）が隊を組んでいる',f12)
# ゴンドラ
zx,zy=500,900
d.rounded_rectangle((zx,zy,zx+220,zy+60),radius=26,fill=(200,190,160),outline=INK)
for k in range(8): d.rectangle((zx+22+k*22,zy+14,zx+36+k*22,zy+30),fill=GLASS,outline=INK)
d.rectangle((zx+180,zy+34,zx+196,zy+60),fill=(110,90,70),outline=INK)
T(zx,zy+70,'ツェッペリンのゴンドラ（操縦室）：窓8・扉1。',f12)
T(zx,zy+88,'1929年に霞ヶ浦に来たグラーフ・ツェッペリン号にちなむ',f12)
T(zx,zy+106,'（Claude案、作者採用）。格納庫の奥に、機体はなくゴンドラだけ。',f12)
# ---- 6 決めてほしいこと ----
title(20,1180,'6. 決めてほしいこと')
qs=['1. 地上ぼぎクルーは案A（お鷹ぽっぽ型の1体）か案B（複数体の隊）か。',
    '2. ジャンプを教わる場所：格納庫の中（整備台の上で練習）でよいか。',
    '3. エクラノプランへは「落ちた渡り板のかわりに、傾斜路の先から翼へ跳び乗る」でよいか。',
    '4. エクラノプランの大きさ（全長24マス。画面の幅の約1.5倍）でよいか。',
    '5. 操縦席は2人並びで、ミイラさまは左席（機長席）。右席にきーが座る、でよいか。']
for i,q in enumerate(qs): T(30,1214+i*24,q,f14)
T(30,1360,'参考：笹野一刀彫 - Wikipedia／Lun-class ekranoplan - Wikipedia／霞ヶ浦海軍航空隊と予科練（予科練平和記念館）',f11,(110,100,90))
im.save('design_kasumi.png')
