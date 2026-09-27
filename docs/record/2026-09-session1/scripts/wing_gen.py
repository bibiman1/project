import sys
from edit_async import submit
from poll import poll
d=("top-down pixel art game background seen from directly above: a large rusty grey ekranoplan (ground-effect sea plane) moored on a calm grey-blue lake, "
 "keep EXACTLY the same layout, shapes and positions: fuselage, swept wings, tail planes, row of jet engines, twin launch tubes on the back, dark square hatch, cockpit glass at the nose. "
 "Weathered riveted metal panels with rust streaks, moss and lotus leaves grown on the wings, a few white egrets, calm water with soft ripples, concrete quay at the bottom edge. "
 "Soft muted pastel palette, detailed 16-bit pixel art, no text, no people")
jobs=[(submit(f'gen/wb_{k}.png',d,7),k) for k in 'LR']
for j,k in jobs: print(k,poll(j,f'gen/wg_{k}.png',150))
