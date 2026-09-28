from PIL import Image, ImageDraw, ImageFont
F='/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'
f=lambda s: ImageFont.truetype(F,s)
W,H=1600,1300
im=Image.new('RGB',(W,H),(245,240,228)); d=ImageDraw.Draw(im)
INK=(60,50,40); RED=(180,50,35); T=24  # 図の 1 マス = 24px(ゲームでは 32px)
def head(x,y,s,w=720):
    d.text((x,y),s,fill=INK,font=f(17)); d.line((x,y+26,x+w,y+26),fill=INK)
def grid(x,y,cw,ch,fill,label=None):
    d.rectangle((x,y,x+cw*T,y+ch*T),fill=fill,outline=INK,width=2)
    for i in range(1,cw): d.line((x+i*T,y,x+i*T,y+ch*T),fill=tuple(max(0,c-18) for c in fill))
    for j in range(1,ch): d.line((x,y+j*T,x+cw*T,y+j*T),fill=tuple(max(0,c-18) for c in fill))
    if label: d.text((x,y+ch*T+4),label,fill=RED,font=f(12))
d.text((20,12),'③ 設計図(南極のバナナ農園)  寸法はマップのマス(1マス=32px)。ぼぎだぢは約1マス。実物より縮めてある',fill=INK,font=f(20))

# 1. マップの大きさ
head(20,52,'1. マップの大きさと、つながり(北が上。この図は 1 マス=12px)',1560)
T=12
x0,y0=30,100
grid(x0,y0,28,5,(178,206,226),'C 凍った用水路 28×5 マス(氷の上は滑る。西から東へ)')
grid(x0,y0+5*T+34,28,14,(150,168,104),'B 第三バナナ農園 28×14 マス(バナナ 5 列、中央に南北の道)')
grid(x0,y0+19*T+68,28,8,(210,204,190),'A 浜 28×8 マス(南半分は湾と流氷。入口は南の道の先)')
ax=x0+28*T+24
d.text((ax,y0+19*T+80),'↑ 北へ(農園の中央の道)',fill=INK,font=f(13))
d.text((ax,y0+5*T+44),'↑ 用水路へ(農園の北の端、東寄り)',fill=INK,font=f(13))
d.text((ax,y0+4),'→ 段々へ(用水路の東の端から北へ)',fill=INK,font=f(13))
# D 縦長(1 マス=16px)
T=16
dx,dy=820,100
grid(dx,dy,14,20,(196,206,196),'D 氷の段々とマンゴーの丘 14×20 マス(南の端から入る)')
for i,(w,y) in enumerate([(12,14),(10,10),(8,6)]):
    l=dx+(14-w)//2*T
    d.rectangle((l,dy+y*T,l+w*T,dy+(y+4)*T),outline=(80,100,120),width=3)
    d.text((l+w*T+8 if i==0 else dx+14*T+8,dy+(y+2)*T-6),f'段 {i+1}:高さ 1 マス。ジャンプで上る',fill=RED,font=f(12))
d.ellipse((dx+4*T,dy+0.5*T,dx+10*T,dy+5*T),fill=(70,120,60),outline=INK)
d.rectangle((dx+6.6*T,dy+4.5*T,dx+7.4*T,dy+6*T),fill=(110,80,50))
d.text((dx+14*T+8,dy+2*T),'マンゴーの大木 6×6 マス(いちばん上の段)',fill=INK,font=f(12))
T=24

# 2. 登場するぼぎだぢ
Y2=545
head(20,Y2,'2. 登場するぼぎだぢ(すべて設定資料にいる。新しい登場人物は足さない)',1560)
chars=[('きこり','最古のぼぎ。リモコンの豚\n(ぶたのぬいぐるみの中に\nリモコンが仕込んである)。\n素早く気まぐれ。\n喋らず、短い鳴き声。\n1マス。ピンク',(240,170,190)),
('ちりん','最古のぼぎ。割れた所を\n漆で金継ぎされた風鈴。\nきこりに執着する。\nきーと一緒にきこりを追う。\n0.7マス。白いガラスに金の線',(250,250,250)),
('ききこり(カメラ係)','最古のぼぎ。電動の豚。\n自分の大きさに執着する。\n古いテレビカメラを\n三脚ごと抱えている。\n1.5マス(大きい)',(230,190,200)),
('ごろん(ディレクター)','最古のぼぎ。ピギーバンク\n(豚の貯金箱)。\nメガホンと台本(案)。\n1マス',(200,170,140)),
('ペンギン','ジェンツー(赤いくちばし、\n目の上に白い帯)。\n浜に群れ。本物の動物。\n0.7マス',(40,40,50))]
for i,(n,t,c) in enumerate(chars):
    x=30+i*310; y=Y2+44
    d.ellipse((x,y,x+60,y+44),fill=c,outline=INK,width=2)
    d.text((x+72,y),n,fill=INK,font=f(15)); d.text((x+72,y+24),t,fill=INK,font=f(12))

# 3. 物
Y3=765
head(20,Y3,'3. 置く物',760)
items=['バナナ(実物は高さ3〜5m):2×3マス。大きな葉、下向きの房、先に赤紫の花。\n  雪の上にも生えている(やる気のある植物)',
'マンゴーの大木:6×6マス。実は長い柄の先に下がる(橙と赤)。',
'看板「第三バナナ農園」:手書きの木の看板。',
'農具小屋:4×3マス。扉1・窓1。番組の小道具(ゴム長、竹かご、テロップの板)。',
'撮影の道具:三脚のテレビカメラ(赤い録画ランプが点いている)、\n  銀のレフ板、照明、ケーブル。',
'凍った用水路:幅3マス。両側に雪の土手。',
'流氷:湾に白い氷のかけら。']
yy=Y3+40
for s in items: d.text((30,yy),s,fill=INK,font=f(13)); yy+=s.count('\n')*18+26

# 4. 教会
X4=820
head(X4,Y3,'4. 木造の教会(実在:ロシア正教会「トリニティ教会」)',760)
cx,cy=X4+40,Y3+60
d.rectangle((cx+20,cy+120,cx+140,cy+240),fill=(160,110,60),outline=INK,width=2)
for j in range(cy+124,cy+240,10): d.line((cx+20,j,cx+140,j),fill=(130,85,45))
d.polygon([(cx+10,cy+120),(cx+80,cy+70),(cx+150,cy+120)],fill=(120,90,70),outline=INK)
d.rectangle((cx+62,cy+30,cx+98,cy+80),fill=(150,100,55),outline=INK)
d.ellipse((cx+58,cy-4,cx+102,cy+40),fill=(140,150,150),outline=INK)
d.line((cx+80,cy-30,cx+80,cy-4),fill=(210,170,50),width=4); d.line((cx+70,cy-20,cx+90,cy-20),fill=(210,170,50),width=4)
d.rectangle((cx+68,cy+190,cx+92,cy+240),fill=(80,50,30))
d.text((cx+170,cy),'シベリアの杉とカラマツの丸太で組んだ小さな教会。\n高さ約15m、約30人が入れる。2004年に聖別。\n南極でいちばん南の正教会。\n\n・丸太の壁、玉ねぎ形の屋根(ポプラの板で葺く)、金の十字架\n・強風に備えて、中に鉄の鎖が通してある\n・基地を見下ろす岩の丘の上に建つ\n\nゲームでは:浜の東の丘に 4×7マス。\n中には入らない(遠景)。',fill=INK,font=f(12))

# 5. 決めてほしいこと
Y5=1095
head(20,Y5,'5. 決めてほしいこと',1560)
qs=['1. マップの大きさとつながり(A 浜 → B 農園 → C 用水路 → D 段々)で、よいか。',
'2. ききこりは「自分の大きさに執着する」ので、カメラ係の中でいちばん大きく描く(1.5マス)、でよいか。',
'3. ちりんに豚の形を入れるか(設定案「ブタをモチーフにした風鈴」)。おすすめ:入れない(用語集の「金継ぎされた風鈴」だけにする)。',
'4. 教会は遠景だけ(中に入らない)でよいか。']
yy=Y5+40
for q in qs: d.text((30,yy),q,fill=INK,font=f(14)); yy+=28
d.text((30,H-30),'参考:Trinity Church (Wikipedia/Atlas Obscura)、ジェンツーペンギン、バナナとマンゴーの樹形',fill=(120,110,100),font=f(11))
im.save('/home/user/project/docs/assets/banana/design.png')
