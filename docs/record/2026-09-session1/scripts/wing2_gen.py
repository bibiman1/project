from edit_async import submit
from poll import poll
d=("Pixel art RPG map background in three-quarter top-down view (seen from above at an angle from the south, like a classic JRPG town map): "
 "a huge rusty grey ekranoplan flying boat floating on a calm grey-blue lake at dawn, nose to the right, keep EXACTLY the same layout, shapes and positions: "
 "flat walkable top of the wide fuselage with a centre seam, the long south side wall of the hull visible below it with a row of portholes and a dark waterline, swept wings, "
 "three pairs of raised launch tubes on the back, one dark square boarding hatch, cockpit glass on the nose, two banks of four jet engines on pylons beside the nose, "
 "a tall T-tail at the left with the horizontal stabilizer on top of the fin. Weathered riveted metal plates, rust streaks, moss and lotus leaves growing in the dents, a few white egrets, soft ripples. "
 "Muted pastel palette, detailed 16-bit pixel art, no text, no people")
J=[(submit(f'gen/wb2_{k}.png',d,9),k) for k in 'LR']
for j,k in J: print(k,poll(j,f'gen/wg2_{k}.png',150))
