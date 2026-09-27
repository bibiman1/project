import sys
from PIL import Image
from inp import inpaint
seed=int(sys.argv[1])
im=Image.open('/home/user/project/field/assets/worlds/haihei/v_carver.png').convert('RGBA')
D="pixel art, tall white-framed glass sash windows with clear glass panes and thin white wooden frames, bright warm sunlight shining in through the glass, seen from inside a wooden hall"
im=inpaint(im,(0,0,200,192),[(15,5,88,112),(118,5,186,94),(144,94,186,114),(88,5,118,50)],D,"shoji, paper screen, lattice paper, people, text",seed)
im.save(f'gen/carverfix{seed}.png')
