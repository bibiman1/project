from PIL import Image, ImageDraw, ImageFont
import random
F='/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf'
f=lambda s: ImageFont.truetype(F,s)
W,H=1500,1080
im=Image.new('RGB',(W,H),(242,236,222)); d=ImageDraw.Draw(im)
INK=(60,50,40); RED=(190,60,40)
d.text((20,12),'① 配置図(北が上。南極・キングジョージ島、第三バナナ農園。今、白夜)',fill=INK,font=f(20))
# 地図の枠
X0,Y0,X1,Y1=20,48,960,1050
# 空と氷河(北)
d.rectangle((X0,Y0,X1,Y0+190),fill=(214,226,236))
d.polygon([(X0,Y0+190),(X0+120,Y0+60),(X0+260,Y0+150),(X0+420,Y0+30),(X0+600,Y0+140),(X0+760,Y0+50),(X1,Y0+160),(X1,Y0+190)],fill=(236,242,248),outline=(160,176,190))
d.text((X0+12,Y0+10),'氷河と雪山(島の氷帽)',fill=INK,font=f(15))
d.ellipse((X1-150,Y0+18,X1-110,Y0+58),fill=(250,250,250),outline=(170,170,180))
d.arc((X1-178,Y0+28,X1-82,Y0+48),0,360,fill=(170,170,190))
d.text((X1-200,Y0+64),'欠けて輪のある月(太陽はない)',fill=INK,font=f(13))
# D マンゴーの大木の丘(北)
d.rectangle((X0,Y0+190,X1,Y0+420),fill=(196,206,196))
for i,(y,c) in enumerate([(Y0+220,(206,214,206)),(Y0+280,(198,208,196)),(Y0+340,(190,202,188))]):
    d.rectangle((X0+300-i*60,y,X1-300+i*60,y+60),fill=c,outline=(140,150,140))
d.ellipse((X0+410,Y0+200,X0+530,Y0+280),fill=(70,120,60),outline=(40,70,30))
d.rectangle((X0+462,Y0+270,X0+478,Y0+300),fill=(110,80,50))
for p in [(440,230),(500,238),(470,215)]: d.ellipse((X0+p[0],Y0+p[1],X0+p[0]+12,Y0+p[1]+14),fill=(240,170,40))
d.text((X0+545,Y0+222),'マンゴーの大木(きこりのゴール)',fill=INK,font=f(15))
d.text((X0+12,Y0+200),'氷の段々(ジャンプで上る段差。凍って滑る)',fill=INK,font=f(15))
# C 凍った水路とペンギン
d.rectangle((X0,Y0+420,X1,Y0+470),fill=(178,206,226))
d.text((X0+12,Y0+428),'凍った用水路(つるつる滑る)',fill=INK,font=f(15))
# B 第三バナナ農園(中央)
d.rectangle((X0,Y0+470,X1,Y0+800),fill=(150,168,104))
rnd=random.Random(3)
for row in range(5):
    y=Y0+500+row*58
    for c in range(18):
        x=X0+40+c*48
        if 320<x-X0<420: continue
        d.ellipse((x,y,x+30,y+26),fill=(70,130,60),outline=(40,90,40))
        if rnd.random()<0.4: d.rectangle((x+12,y+14,x+20,y+26),fill=(230,200,60))
d.rectangle((X0+340,Y0+470,X0+400,Y0+800),fill=(200,184,140))
d.text((X0+12,Y0+476),'第三バナナ農園(バナナの列。雪の上にも生えている)',fill=INK,font=f(15))
# 看板・撮影隊・小屋
d.rectangle((X0+420,Y0+740,X0+560,Y0+780),fill=(250,246,236),outline=INK); d.text((X0+428,Y0+750),'第三バナナ農園',fill=INK,font=f(15))
d.rectangle((X0+640,Y0+600,X0+860,Y0+700),fill=(160,120,80),outline=INK); d.text((X0+660,Y0+630),'農具小屋\n(番組の小道具)',fill=(250,250,250),font=f(14))
d.polygon([(X0+560,Y0+660),(X0+600,Y0+640),(X0+600,Y0+680)],fill=(40,40,40)); d.rectangle((X0+452,Y0+688,X0+590,Y0+730),fill=(250,246,236)); d.text((X0+458,Y0+692),'撮影隊のぼぎ\n(カメラと照明)',fill=INK,font=f(13))
d.ellipse((X0+230,Y0+560,X0+256,Y0+584),fill=(240,170,190),outline=RED); d.text((X0+180,Y0+590),'きこり(逃げる)',fill=RED,font=f(13))
d.ellipse((X0+270,Y0+620,X0+290,Y0+640),fill=(250,250,250),outline=(200,150,40)); d.text((X0+250,Y0+645),'ちりん',fill=INK,font=f(13))
# A 浜(南、入口)
d.rectangle((X0,Y0+800,X1,Y1),fill=(210,204,190))
d.rectangle((X0,Y0+900,X1,Y1),fill=(120,150,176))
for i in range(12):
    x=X0+30+i*75; y=Y0+930+(i%3)*30
    d.polygon([(x,y),(x+40,y+6),(x+30,y+20),(x+4,y+16)],fill=(236,242,248),outline=(160,176,190))
d.text((X0+12,Y0+810),'浜(小石と雪。ペンギンの群れ)',fill=INK,font=f(15))
for i in range(7):
    x=X0+560+i*28; y=Y0+840+(i%2)*14
    d.ellipse((x,y,x+14,y+22),fill=(30,30,40)); d.ellipse((x+3,y+6,x+11,y+20),fill=(245,245,245))
d.text((X0+620,Y0+972),'マクスウェル湾(流氷)',fill=(250,252,255),font=f(16))
d.rectangle((X0+340,Y0+800,X0+400,Y0+900),fill=(200,184,140))
d.rectangle((X0+300,Y0+870,X0+580,Y0+896),fill=(250,246,236)); d.text((X0+306,Y0+874),'入口(懲罰空間から来る)',fill=INK,font=f(14))
# 東: 木造の教会(案)
d.polygon([(X1-120,Y0+820),(X1-80,Y0+780),(X1-40,Y0+820)],fill=(120,80,50)); d.rectangle((X1-110,Y0+820,X1-50,Y0+880),fill=(150,100,60),outline=INK)
d.ellipse((X1-90,Y0+755,X1-70,Y0+775),fill=(220,180,60)); d.text((X1-220,Y0+886),'木造の教会(案)',fill=INK,font=f(13))
d.rectangle((X0,Y0,X1,Y1),outline=INK,width=2)
d.text((X1-140,Y0+440),'北 ↑',fill=INK,font=f(16))

# ② 右側
RX=990
d.text((RX,12),'② マップの分け方(案)',fill=INK,font=f(20))
boxes=[('A 浜(入口)','懲罰空間から来る。流氷の湾、ペンギンの群れ。北へ。','形:横長'),
('B 第三バナナ農園','バナナの列、看板、農具小屋、撮影隊。\nきこりが現れ、マンゴーを探して逃げ回る。','形:横長(広い)'),
('C 凍った用水路','氷の上はつるつる滑る(凍った湖の帰り道と同じ)。\nきこりは滑って先へ行く。','形:横長(細い)'),
('D 氷の段々とマンゴーの丘','段差をジャンプで上る(霞ヶ浦で覚えた能力)。\n頂上のマンゴーの大木で、きこりに追いつく。','形:縦長'),
('E 一枚絵','きこりがマンゴーにかぶりつく瞬間を、\n撮影隊のカメラが撮っている(=あの中継)。','形:演出')]
y=48
for t,b,k in boxes:
    d.rectangle((RX,y,W-20,y+96),fill=(250,246,236),outline=INK,width=2)
    d.text((RX+10,y+8),t,fill=INK,font=f(16)); d.text((RX+10,y+34),b,fill=INK,font=f(12)); d.text((RX+10,y+74),k,fill=(110,100,90),font=f(11))
    y+=106
d.text((RX,y+4),'歩く順',fill=INK,font=f(16))
d.text((RX,y+30),'A 浜 → B 農園できこりと出会う → きこりを追う\n→ C 用水路を滑る → D 段々をジャンプで上る\n→ マンゴーの大木で追いつく → E 一枚絵 → 帰る',fill=INK,font=f(12))
y+=100
d.text((RX,y),'決めてほしいこと',fill=RED,font=f(16))
qs=['1. 撮影隊は誰か(おすすめ:ききこり(カメラ)と\n   ごろん(ディレクター)。どちらも既にいる豚のぼぎ。\n   新しい登場人物を足さずに済む)',
'2. 東に実在の木造の教会(キングジョージ島の\n   ロシア正教会)を置くか(おすすめ:置く。\n   実在の固有名で、ミイラさまのロシア語とも響く)',
'3. 次へのカギ(おすすめ:道具「マンゴー」)',
'4. 帰り道(おすすめ:マンゴーの丘から、\n   浜の入口へ戻って出る。自分で出口から出る D41)']
yy=y+26
for q in qs:
    d.text((RX,yy),q,fill=INK,font=f(12)); yy+=q.count('\n')*16+24
im.save('/home/user/project/docs/assets/banana/plan.png')
print(yy)
