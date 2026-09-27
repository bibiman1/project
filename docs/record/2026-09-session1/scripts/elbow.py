import sys
from PIL import Image
from inp import inpaint
seed=int(sys.argv[1])
im=Image.open('gen/v_table3.png').convert('RGBA')
out=inpaint(im,(20,40,220,192),[(84,112,132,158)],
 "pixel art, woman in beige sweater eating noodles at a low wooden table, her right arm bent, sweater sleeve and elbow resting on the table edge, forearm raised up holding chopsticks to her mouth, dark wooden wall behind, nothing else on the table",
 "toy, doll, plush, animal, extra hand, extra arm, object, text", seed)
out.save(f'gen/elbow{seed}.png')
