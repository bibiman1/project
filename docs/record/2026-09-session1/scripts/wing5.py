from edit_async import submit
from poll import poll
d=("Pixel art RPG map background in three-quarter top-down view: a huge old rusty grey ekranoplan flying boat moored on a calm lake at dawn, nose to the right. "
 "Keep EXACTLY the same shapes, positions, perspective and colors and do not add or remove any parts; only render it as polished detailed pixel art: "
 "riveted weathered metal plates, rust streaks and flaking paint, moss and grass growing in the seams, lotus leaves, white egrets, soft water ripples, gentle dawn light from the right. No text, no people")
print(poll(submit('gen/wb3_half.png',d,21),'gen/wg5_half.png',150))
