from edit_async import submit
from poll import poll
d=("Realistic detailed pixel art recreating an old 1960s snapshot photograph, keep EXACTLY the same composition and scale: "
 "a gigantic silver ekranoplan (a huge sea-skimming flying boat, 70 meters long) floats on the lake, moored alongside a concrete pier, its enormous rounded boat-hull nose on the left towers far above the people, "
 "high cockpit windows, jet engines on a pylon on the side of the nose, the fuselage continues out of frame to the right, clear waterline, calm lake water between the hull and the pier. "
 "On the pier in the foreground a small group of ground crew posing for a commemorative photo: mechanics in navy work caps and navy coveralls standing, a young pilot in a white high-altitude pressure suit in the middle, "
 "two mechanics crouching in front, one holding a small carved wooden hawk folk toy. Realistic human proportions, casual natural poses, the people look tiny against the giant hull. "
 "Overcast soft daylight, grainy old photograph feel, no text, no wheels")
J=[(submit('gen/group3_block.png',d,s),s) for s in (51,52)]
for j,s in J: print(poll(j,f'gen/group3_{s}.png',150))
