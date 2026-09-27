from PIL import Image, ImageDraw, ImageFont
import math
F=lambda n: ImageFont.truetype('/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf',n)
f12,f14,f16,f20=F(12),F(14),F(16),F(20)
W,H=1500,1060
im=Image.new('RGB',(W,H),(243,236,221)); d=ImageDraw.Draw(im)
INK=(50,40,32); RED=(160,50,40)
LAKE=(150,178,196); FOG=(214,224,230); SHORE=(196,184,150); CONC=(180,176,168); LOTUS=(150,140,96); PATH=(214,196,160)
def label(x,y,t,f=f14,c=INK): d.text((x,y),t,font=f,fill=c)
def box(x0,y0,x1,y1,fill,t=None,f=f14):
  d.rectangle((x0,y0,x1,y1),fill=fill,outline=INK,width=2)
  if t:
    ls=t.split('\n')
    for i,l in enumerate(ls):
      tw=d.textlength(l,font=f); d.text(((x0+x1)/2-tw/2,(y0+y1)/2-len(ls)*f.size/2+i*(f.size+2)),l,font=f,fill=INK)
label(20,12,'① 配置図（北が上。霞ヶ浦の南岸、海軍航空基地の跡。晩秋の明け方）',f20)
X0,Y0,X1,Y1=20,48,960,1030
# 湖
d.rectangle((X0,Y0,X1,Y0+360),fill=LAKE)
for y in range(Y0+20,Y0+340,26): d.line((X0+10,y,X1-10,y+6),fill=FOG,width=6)
label(X0+12,Y0+8,'霞ヶ浦（朝霧が低く這う）',f16)
label(X1-260,Y0+8,'対岸の低い山なみと町の影',f14)
# 岸
d.rectangle((X0,Y0+360,X1,Y0+400),fill=SHORE); label(X0+12,Y0+368,'護岸（崩れかけたコンクリート）',f12)
# 傾斜路と桟橋
d.polygon([(520,Y0+400),(600,Y0+400),(612,Y0+250),(508,Y0+250)],fill=CONC,outline=INK)
for y in range(Y0+260,Y0+400,14): d.line((510,y,610,y),fill=(160,156,148))
label(470,Y0+404,'水上機の傾斜路（スロープ）',f12)
# エクラノプラン(上から見た形)
cx,cy=560,Y0+150
d.polygon([(cx-230,cy),(cx-200,cy-22),(cx+170,cy-26),(cx+240,cy-8),(cx+240,cy+8),(cx+170,cy+26),(cx-200,cy+22)],fill=(120,128,120),outline=INK)
d.polygon([(cx-60,cy-26),(cx+40,cy-26),(cx+10,cy-110),(cx-40,cy-110)],fill=(110,118,110),outline=INK)   # 主翼(左)
d.polygon([(cx-60,cy+26),(cx+40,cy+26),(cx+10,cy+110),(cx-40,cy+110)],fill=(110,118,110),outline=INK)
d.polygon([(cx-230,cy),(cx-250,cy-60),(cx-215,cy-60),(cx-190,cy-18)],fill=(110,118,110),outline=INK)   # 尾翼
d.polygon([(cx-230,cy),(cx-250,cy+60),(cx-215,cy+60),(cx-190,cy+18)],fill=(110,118,110),outline=INK)
d.polygon([(cx+100,cy-26),(cx+150,cy-26),(cx+140,cy-66),(cx+118,cy-66)],fill=(110,118,110),outline=INK)
d.polygon([(cx+100,cy+26),(cx+150,cy+26),(cx+140,cy+66),(cx+118,cy+66)],fill=(110,118,110),outline=INK)
for k in range(4):
  d.rectangle((cx+112,cy-34-k*9,cx+150,cy-28-k*9),fill=(80,86,82),outline=INK); d.rectangle((cx+112,cy+28+k*9,cx+150,cy+34+k*9),fill=(80,86,82),outline=INK)
for k in range(3): d.rectangle((cx-40+k*50,cy-8,cx-10+k*50,cy+8),fill=(150,150,140),outline=INK)
d.ellipse((cx+196,cy-8,cx+212,cy+8),fill=(200,220,230),outline=INK)
label(cx-150,cy-12,'エクラノプラン（錆びて半ば水に浸かる）',f12,(250,248,240))
label(cx+120,cy-88,'機首の左右に8基のジェット',f12); label(cx-40,cy-24-14,'背中の発射筒3対',f12,(250,248,240))
label(cx+190,cy+14,'操縦席',f12,RED)
d.line((560,Y0+176,560,Y0+250),fill=INK,width=3); label(566,Y0+206,'渡り板',f12)
# 陸側
d.rectangle((X0,Y0+400,X1,Y0+620),fill=(186,176,140))
label(X0+12,Y0+404,'基地跡（草の生えたコンクリートの駐機場）',f14)
box(60,Y0+430,330,Y0+600,(176,168,156),'格納庫\n（扉が半分落ちている）\n中に整備台、燃料ドラム\n奥にツェッペリンのゴンドラ？',f14)
d.rectangle((150,Y0+430,240,Y0+440),fill=(80,70,60)); label(150,Y0+442,'↑ 扉は湖向き',f12)
box(760,Y0+440,830,Y0+520,(170,150,120),'見張り台\n（はしご）',f12)
d.line((880,Y0+420,880,Y0+480),fill=INK,width=2); d.polygon([(880,Y0+420),(930,Y0+428),(880,Y0+436)],fill=(220,120,80)); label(870,Y0+484,'吹き流し',f12)
for i in range(6): d.ellipse((380+i*16,Y0+560,394+i*16,Y0+574),fill=(150,70,50),outline=INK)
label(370,Y0+578,'錆びた燃料ドラム',f12)
# 門と塀
d.line((X0,Y0+620,X1,Y0+620),fill=INK,width=3)
d.rectangle((520,Y0+612,540,Y0+630),fill=(150,146,140)); d.rectangle((580,Y0+612,600,Y0+630),fill=(150,146,140))
label(606,Y0+606,'崩れた門柱と、倒れた有刺鉄線',f12)
box(620,Y0+640,690,Y0+690,(196,186,160),'衛兵所',f12)
# 蓮田
d.rectangle((X0,Y0+630,X1,Y1),fill=LOTUS)
for y in range(Y0+650,Y1,24):
  for x in range(X0+10,X1,22):
    if not (520<x<600): d.line((x,y,x+4,y-8),fill=(100,92,60)); d.ellipse((x+2,y-12,x+8,y-6),fill=(120,110,70))
d.rectangle((530,Y0+630,590,Y1),fill=PATH); d.rectangle((604,Y1-66,880,Y1-40),fill=(250,246,236)); label(610,Y1-62,'あぜ道（入口。懲罰空間から来る）',f14)
label(X0+12,Y0+640,'枯れた蓮田（水が張ってある）',f14)
d.line((300,Y0+760,300,Y0+800),fill=INK,width=2); d.line((288,Y0+772,312,Y0+772),fill=INK,width=2); d.ellipse((294,Y0+750,306,Y0+762),fill=(210,190,150),outline=INK)
label(250,Y0+804,'傾いた案山子',f12)
d.rectangle((X1-190,Y0+690,X1-10,Y0+740),fill=(250,246,236),outline=INK); label(X1-180,Y0+694,'東 → 朝日',f16,(200,120,40)); label(X1-180,Y0+718,'光は右（東）から',f12,(200,120,40))
# 右側: マップの分け方と歩く順
label(990,12,'② マップの分け方（案）',f20)
rows=[('A 蓮田のあぜ道','入口。朝霧の蓮田を北へ。案山子。','縦長'),('B 基地跡の岸','門→駐機場→格納庫・見張り台→傾斜路→渡り板','横長（湖が画面の上）'),('C 格納庫の中','整備台、燃料ドラム、ゴンドラ。飛ぶのに必要な物がある','部屋'),('D 機内・操縦席','ミイラさま（与圧服）。計器盤。ここで飛ぶ','部屋'),('E 遊覧飛行','操縦席から湖へ。背景と水面の二重スクロール→キメの一枚絵','演出（歩けない）')]
y=50
for t,dsc,sz in rows:
  d.rectangle((990,y,1480,y+86),outline=INK,width=2,fill=(250,246,236))
  label(1000,y+6,t,f16); label(1000,y+32,dsc,f12); label(1000,y+56,'形：'+sz,f12,(110,100,90)); y+=96
label(990,y+10,'歩く順',f16)
label(990,y+36,'A 蓮田 → B 門 → B 格納庫（C）で必要な物 → B 傾斜路',f12)
label(990,y+56,'→ 渡り板 → D 操縦席のミイラさま → E 遊覧飛行 → 懲罰空間へ',f12)
label(990,y+100,'決めてほしいこと',f16,RED)
qs=['1. 飛ぶのに必要な物（Claude案）：','   廃兵院の「宇宙船殻用単結晶」を、割れた計器の','   ガラスに収める / 格納庫で見つける燃料の栓 など','2. 格納庫の奥のツェッペリンのゴンドラは入れるか','3. 対岸に、廃兵院の物干し台を見せるか','4. エクラノプランの向き（機首は東の朝日へ）']
for i,q in enumerate(qs): label(990,y+126+i*20,q,f12)
im.save('plan_kasumi.png')
