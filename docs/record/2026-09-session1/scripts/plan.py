from PIL import Image, ImageDraw, ImageFont
F=lambda n: ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf',n)
f12,f14,f16,f20,f26=F(12),F(14),F(16),F(20),F(26)
W,H=1560,1040
im=Image.new('RGB',(W,H),(243,236,221)); d=ImageDraw.Draw(im)
INK=(60,44,32); WOOD=(176,132,86); ROOF=(120,120,128); GRASS=(170,176,120); PATH=(222,204,170); TREE=(110,128,80)
def box(x0,y0,x1,y1,fill,lab=None,fs=f14,col=INK,w=2):
  d.rectangle((x0,y0,x1,y1),fill=fill,outline=col,width=w)
  if lab:
    for i,l in enumerate(lab.split('\n')):
      tw=d.textlength(l,font=fs); d.text(((x0+x1)/2-tw/2,(y0+y1)/2-fs.size*len(lab.split('\n'))/2+i*(fs.size+2)),l,font=fs,fill=col)
def tree(x,y,r=9,c=TREE): d.ellipse((x-r,y-r,x+r,y+r),fill=c,outline=(70,84,52))
# ===== 配置図 =====
d.text((20,14),'① 配置図（北が上。敷地は八ヶ岳のような高原の南斜面）',font=f20,fill=INK)
X0,Y0,X1,Y1=20,50,720,960
d.rectangle((X0,Y0,X1,Y1),fill=GRASS,outline=INK,width=2)
# 裏山・防風林
d.rectangle((X0,Y0,X1,Y0+90),fill=(128,140,96)); d.text((X0+10,Y0+8),'裏山（カラマツと白樺の防風林）',font=f16,fill=(245,240,225))
for i in range(28): tree(X0+20+i*25,Y0+60+(i%3)*8,10,(90,106,70))
for y in range(Y0+100,Y1-40,34): tree(X0+14,y,9); tree(X1-14,y,9)
# 外気舎
d.text((540,160),'外気舎（回復期の小屋）',font=f12,fill=INK)
for (x,y) in [(560,180),(610,200),(660,180),(585,235),(640,250)]: box(x,y,x+34,y+24,(214,196,160))
# 本館と病棟
box(110,300,380,400,(226,214,190),'本館（木造2階・平入り）\n1階：玄関・大広場\n2階：事務室ほか',f14)
box(380,335,440,370,(236,226,204),'渡り\n廊下',f12)
box(440,300,690,400,(226,214,190),'東病棟（木造2階）\n1階：片廊下と個室\n屋根：物干し台',f14)
d.rectangle((110,400,380,418),fill=(200,186,160),outline=INK); d.text((116,401),'下屋の縁側',font=f12,fill=INK)
d.rectangle((440,400,690,418),fill=(200,186,160),outline=INK); d.text((446,401),'下屋の縁側',font=f12,fill=INK)
box(620,270,690,300,(196,170,130),'物干し台',f12)
box(80,250,110,290,(150,120,100),'ボイラー\n煙突',f12)
box(70,320,105,380,(160,176,110),'菜園',f12)
# 中庭
d.rectangle((150,430,560,700),fill=PATH,outline=INK,width=2)
d.text((160,436),'中庭（文化祭の会場）',font=f16,fill=INK)
tree(200,500,26,(226,178,58)); d.text((175,530),'大銀杏',font=f12,fill=INK)
for (x,y,l) in [(260,470,'屋台'),(260,560,'屋台'),(470,470,'射的'),(470,560,'綿あめ')]: box(x,y,x+60,y+34,(236,200,160),l,f12)
box(170,600,210,630,(200,170,120),'掲示板',f12)
d.line((230,455,540,455),fill=(190,60,50),width=2); d.text((330,458),'万国旗（屋台の間）',font=f12,fill=(150,50,40))
# 前庭・門
d.rectangle((300,700,420,900),fill=PATH,outline=INK,width=2)
d.text((306,706),'前庭',font=f16,fill=INK)
box(425,760,480,790,(236,220,190),'受付',f12)
box(295,900,315,930,(170,166,160)); box(405,900,425,930,(170,166,160))
d.text((432,905),'正門（石の門柱）',font=f14,fill=INK)
d.rectangle((330,930,390,960),fill=(150,140,130)); d.text((200,938),'高原の道路へ ↓',font=f14,fill=INK)
d.line((360,420,360,700),fill=(200,180,150),width=0)
# 方位・光
d.text((40,600),'西日 →',font=f16,fill=(190,110,40)); d.text((40,620),'夕方の光は',font=f12,fill=(190,110,40)); d.text((40,636),'左(西)から',font=f12,fill=(190,110,40))
d.text((20,975),'※ 本館の南面に玄関。中庭→玄関→大広場→東へ渡り廊下→病棟の片廊下→突き当たりの階段→物干し台',font=f12,fill=INK)
# ===== 平面図 =====
d.text((750,14),'② 1階平面図（1マス≒0.9m。今のマップ寸法に合わせる）',font=f20,fill=INK)
S=12; ox,oy=750,70
def g(x,y): return ox+x*S,oy+y*S
def gbox(x0,y0,x1,y1,fill,lab=None,fs=f12): box(*g(x0,y0),*g(x1,y1),fill,lab,fs)
# 本館
gbox(0,0,16,12,(236,226,204),None)
gbox(0,0,16,2,(214,196,160),'舞台（北の壁ぎわ）',f12)
d.text(g(1,5),'大広場（講堂兼談話室）',font=f14,fill=INK)
d.text(g(1,7)[0],g(1,7)[1],text='客席の車椅子・盆栽の展示',font=f12,fill=INK) if False else d.text(g(1,7),'客席の車椅子・盆栽の展示',font=f12,fill=INK)
d.text(g(11,3),'テレビ',font=f12,fill=INK)
gbox(6,12,10,14,(214,196,160),'玄関',f12)
# 渡り廊下
gbox(16,6,20,9,(226,214,190),'渡り',f12)
# 病棟
gbox(20,0,56,12,(236,226,204))
rooms=[('病室\n(洋室)',20,26),('窓辺の\n部屋',26,32),('家族の\n部屋1(和)',32,38),('家族の\n部屋2(洋)',38,44),('義肢\n装具室',44,50)]
for (l,a,b) in rooms:
  gbox(a,0,b,6,(214,200,176),l,f12); gbox(a+2.5,5.6,a+3.5,6.4,(150,110,70))
gbox(50,0,56,6,(196,176,140),'階段\n↑物干し台',f12)
gbox(20,6,56,9,(240,232,214)); d.text(g(29,6.9),'片廊下（壁に作品展）',font=f12,fill=INK)
for x in range(20,56,2): d.rectangle((*g(x+0.2,9),*g(x+1.8,9.35)),fill=(160,200,220),outline=INK)
d.text(g(24,9.8),'南側は一面のガラス窓（中庭・縁側に面する）',font=f12,fill=INK)
for (a,b) in [(r[1],r[2]) for r in rooms]:
  for x in (a+1,a+3,a+5): d.rectangle((*g(x-0.4,-0.35),*g(x+0.4,0)),fill=(160,200,220),outline=INK)
d.text(g(20,-1.6),'個室の窓は北の外壁（裏山を向く）',font=f12,fill=INK)
d.text((750,g(0,14)[1]+30),'変更点：個室は幅6マスに揃え、ドアを各部屋の中央に。廊下の南側を窓にして、床に光の帯を落とす。',font=f12,fill=(150,50,40))
d.text((750,g(0,14)[1]+48),'本館の外観は幅16マス(大広場と同じ)にし、中庭の上端に据える。病棟は画面の右外へ続く。',font=f12,fill=(150,50,40))
# ===== 南立面 =====
d.text((750,560),'③ 南立面（案A：木造2階、平入り、下見板張りのペンキ塗り、上げ下げ窓、1階に下屋）',font=f16,fill=INK)
ex,ey=760,600
# 本館
d.polygon([(ex,ey+80),(ex+30,ey+30),(ex+330,ey+30),(ex+360,ey+80)],fill=ROOF,outline=INK)
d.rectangle((ex+10,ey+80,ex+350,ey+230),fill=(232,224,204),outline=INK,width=2)
for y in range(ey+84,ey+230,6): d.line((ex+11,y,ex+349,y),fill=(214,204,180))
for i in range(8):
  x=ex+24+i*41
  for yy in (ey+95,ey+170):
    d.rectangle((x,yy,x+20,yy+40),fill=(150,170,176),outline=(250,248,240),width=2); d.line((x,yy+20,x+20,yy+20),fill=(250,248,240),width=2)
d.polygon([(ex+10,ey+160),(ex+350,ey+160),(ex+362,ey+176),(ex-2,ey+176)],fill=ROOF,outline=INK)
for x in range(ex+20,ex+350,40): d.line((x,ey+176,x,ey+230),fill=WOOD,width=3)
d.rectangle((ex+160,ey+185,ex+200,ey+230),fill=(120,86,56),outline=INK); d.text((ex+164,ey+232),'玄関',font=f12,fill=INK)
d.text((ex+120,ey+40),'本館（大広場）',font=f14,fill=(245,240,230))
# 渡り廊下
d.rectangle((ex+350,ey+185,ex+400,ey+230),fill=(210,196,170),outline=INK); d.text((ex+352,ey+232),'渡り廊下',font=f12,fill=INK)
d.polygon([(ex+350,ey+185),(ex+400,ey+185),(ex+404,ey+178),(ex+346,ey+178)],fill=ROOF,outline=INK)
# 病棟
d.polygon([(ex+400,ey+80),(ex+425,ey+36),(ex+705,ey+36),(ex+730,ey+80)],fill=ROOF,outline=INK)
d.rectangle((ex+408,ey+80,ex+722,ey+230),fill=(232,224,204),outline=INK,width=2)
for y in range(ey+84,ey+230,6): d.line((ex+409,y,ex+721,y),fill=(214,204,180))
for i in range(12):
  x=ex+418+i*25
  for yy in (ey+95,ey+172):
    d.rectangle((x,yy,x+16,yy+34),fill=(150,170,176),outline=(250,248,240),width=2)
d.polygon([(ex+408,ey+160),(ex+722,ey+160),(ex+734,ey+172),(ex+396,ey+172)],fill=ROOF,outline=INK)
d.rectangle((ex+660,ey+14,ex+715,ey+36),outline=WOOD,width=2); d.text((ex+560,ey-6),'物干し台（手すり・望遠鏡）',font=f12,fill=INK)
d.text((ex+500,ey+42),'東病棟',font=f14,fill=(245,240,230))
d.text((760,850),'材料と色：壁=生成りのペンキ塗り下見板 / 窓枠=白 / 屋根=灰色の鉄板葺き（寒冷地）/ 柱・腰板=飴色 / 室内=腰板+漆喰+板床',font=f12,fill=INK)
d.text((760,868),'和の要素：玄関の格子戸、大広場の格天井、和室の障子（部屋の中だけ）、畳。\n洋の要素：上げ下げ窓、ペンキ塗り、真鍮の取っ手、乳白ガラスの吊り電灯',font=f12,fill=INK)
d.text((760,904),'やらないこと：廊下や外観に障子を使う／意味のない長屋／反りの強い寺社風の屋根／日の丸',font=f12,fill=(150,50,40))
im.save('plan_haihei.png')
