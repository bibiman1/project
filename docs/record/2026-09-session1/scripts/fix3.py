import sys
from PIL import Image
from inp import inpaint
seed=int(sys.argv[1]); D='/home/user/project/field/assets/worlds/haihei/'
NEG="shoji, paper screen, row houses, nagaya, tiled roof, temple roof, text, extra people"
# 焼きそば: 奥の町並み → 中庭と本館
im=Image.open(D+'v_yakisoba.png').convert('RGBA')
BG="pixel art, background of a sunny festival courtyard: gravel ground, a long two-story wooden building with cream painted horizontal clapboard siding, white-framed sash windows, a grey sheet-metal roof and a lean-to veranda with thin posts, a few visitors walking, seen in perspective"
im=inpaint(im,(110,0,310,192),[(112,60,220,142),(228,15,310,165)],BG,NEG,seed)
im=inpaint(im,(120,0,320,192),[(300,15,320,165)],BG,NEG,seed+5)
im.save(f'gen/fx_yakisoba{seed}.png')
# 病室: 障子の窓 → 上げ下げ窓
im=Image.open(D+'v_bed.png').convert('RGBA')
W="pixel art, a white-framed double-hung sash window with clear glass panes showing a pale autumn sky and yellow ginkgo leaves, set in a dark wooden wall"
im=inpaint(im,(0,0,200,192),[(0,18,24,82)],W,NEG,seed)
im=inpaint(im,(120,0,320,192),[(188,18,234,128)],W,NEG,seed+5)
im.save(f'gen/fx_bed{seed}.png')
# 廊下: 左側 → 腰板と漆喰の壁、扉が並ぶ
im=Image.open(D+'v_wheel.png').convert('RGBA')
L="pixel art, the left side wall of a long wooden corridor in one-point perspective: cream plaster upper wall, dark wood wainscot panels below, a row of wooden doors with small glass windows receding into the distance, wooden pillars"
im=inpaint(im,(0,0,200,192),[(0,12,132,152)],L,NEG+", windows, glass wall",seed)
im.save(f'gen/fx_wheel{seed}.png')
# 舞台: 側壁の上半分に窓
im=Image.open('gen/stagefix1.png').convert('RGBA')
S="pixel art, a tall white-framed sash window with small glass panes glowing with daylight, on a dark wooden side wall of an auditorium, seen at an angle"
im=inpaint(im,(0,0,200,192),[(6,26,50,96)],S,"shoji, people, text",seed)
im=inpaint(im,(120,0,320,192),[(270,26,314,96)],S,"shoji, people, text",seed+5)
im.save(f'gen/fx_stage{seed}.png')
