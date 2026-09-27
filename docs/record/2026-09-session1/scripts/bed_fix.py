import sys
from PIL import Image
from inp import inpaint
seed=int(sys.argv[1])
im=Image.open('gen/fx_bed2.png').convert('RGBA')
D="pixel art, view through a large glass window with thin white wooden frames: an autumn hillside forest of golden larch trees and white birch trunks close behind the building, soft daylight"
im=inpaint(im,(0,0,200,192),[(30,14,182,86)],D,"ginkgo, big single tree, people, text",seed)
im=inpaint(im,(120,0,320,192),[(192,16,230,88)],D,"ginkgo, people, text",seed+5)
im.save(f'gen/bedv{seed}.png')
