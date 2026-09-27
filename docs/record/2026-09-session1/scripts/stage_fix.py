import sys
from PIL import Image
from inp import inpaint
seed=int(sys.argv[1])
im=Image.open('/home/user/project/field/assets/worlds/haihei/v_stage.png').convert('RGBA')
D="pixel art, interior side wall of a 1930s Japanese wooden school auditorium: a tall white-framed double-hung sash window with small glass panes showing blue autumn sky, cream plaster wall around it, dark wood wainscot panels on the lower wall, a square wooden pillar"
N="shoji, paper screen, sliding door, lattice paper, people, text"
im=inpaint(im,(0,0,200,192),[(0,18,64,124)],D,N,seed)
im=inpaint(im,(120,0,320,192),[(262,18,320,124)],D,N,seed+10)
im.save(f'gen/stagefix{seed}.png')
