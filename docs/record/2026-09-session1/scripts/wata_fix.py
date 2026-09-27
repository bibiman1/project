import sys
from PIL import Image
from inp import inpaint
seed=int(sys.argv[1])
im=Image.open('gen/re_wataame_a.png').convert('RGBA')
D="pixel art, a small child about five years old in a red sweater and dark shorts standing in front of a festival stall counter, seen from the side, reaching up with both hands toward a big white cotton candy held out by an old man, happy"
im=inpaint(im,(0,0,200,192),[(56,128,96,180)],D,"extra limbs, extra hands, text, adult",seed)
im.save(f'gen/wata{seed}.png')
