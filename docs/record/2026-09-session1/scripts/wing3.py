from edit_async import submit
from poll import poll
d=("Pixel art RPG map background in three-quarter top-down view (seen from above at an angle from the south, like a classic JRPG map): "
 "a huge rusty grey ekranoplan flying boat floating on a calm grey-blue lake at dawn, nose to the right, keep EXACTLY the same layout, shapes and positions and do not add anything: "
 "flat top of the wide fuselage, the south side wall of the hull with a row of portholes and a waterline, two plain swept wings with nothing on them, "
 "three pairs of raised launch tubes on the back, one dark square boarding hatch on top, cockpit glass on the nose, two banks of four jet engines beside the nose only, "
 "a T-tail at the left. Weathered riveted grey metal, rust streaks, moss and lotus leaves in dents, white egrets, soft ripples. Muted pastel palette, no text, no people")
print(poll(submit('gen/wb2_half.png',d,12),'gen/wg3_half.png',150))
