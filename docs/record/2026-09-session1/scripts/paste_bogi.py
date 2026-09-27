from PIL import Image
ki=Image.open('gen/ki_walk_v3.png').convert('RGBA')
KI=ki.crop((16,25,48,47))              # 正面
KIS=ki.crop((16,25+128,48,47+128))     # 横(右向き) row2 = east
pi=Image.open('gen/pi_walk_v3.png').convert('RGBA')
PI=pi.crop((16,25,48,47))
def paste(name,out,items):
    im=Image.open(f'gen/{name}.png').convert('RGBA')
    for spr,x,y,s in items:
        sp=spr if s==1 else spr.resize((int(spr.width*s),int(spr.height*s)),Image.NEAREST)
        im.alpha_composite(sp,(x,y))
    im.save(f'gen/{out}.png')
    return im
paste('hv_stall','hv_stall_k',[(KI,214,112,1)])
paste('hv_carver','hv_carver_k',[(KI,168,118,1)])
paste('hv_stage','hv_stage_k',[(KI,132,118,1),(PI,172,120,1)])
paste('hv_wheel','hv_wheel_k',[(KI,150,110,0.5),(PI,163,110,0.5)])
# コックピットの御守り: 吊られた丸いマスコットに、ぼぎの顔を描く
im=Image.open('gen/hv_cockpit.png').convert('RGBA'); px=im.load()
cx,cy=177,56
for a in (0,1):
    for b in (0,1):
        px[cx-5+a,cy+b]=(0,0,0,255); px[cx+4+a,cy+b]=(0,0,0,255)
for x in range(cx-1,cx+3):
    for y in range(cy,cy+2): px[x,y]=(236,140,70,255)
im.save('gen/hv_cockpit_k.png')
sheet=Image.new('RGBA',(1300,1180),(60,60,60,255))
for i,n in enumerate(['hv_stall_k','hv_carver_k','hv_stage_k','hv_wheel_k','hv_cockpit_k','hv_roof']):
  sheet.alpha_composite(Image.open(f'gen/{n}.png').convert('RGBA').resize((640,384),Image.NEAREST),(10+(i%2)*650,10+(i//2)*392))
sheet.save('hvk.png')
paste('hv_uketsuke','hv_uketsuke_k',[(KI,236,128,1)])
paste('hv_yakisoba','hv_yakisoba_k',[(KI,262,136,1)])
paste('hv_bed','hv_bed_k',[(KI,140,122,1),(PI,176,124,1)])
sheet=Image.new('RGBA',(1960,400),(60,60,60,255))
for i,n in enumerate(['hv_uketsuke_k','hv_yakisoba_k','hv_bed_k']):
  sheet.alpha_composite(Image.open(f'gen/{n}.png').convert('RGBA').resize((640,384),Image.NEAREST),(10+i*650,8))
sheet.save('hv7k.png')
