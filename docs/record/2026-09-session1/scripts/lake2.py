from edit_async import submit
from poll import poll
d=("Detailed pixel art bird's-eye view (oblique aerial view from high above the south shore looking north) of Lake Kasumigaura at late autumn dawn, keep EXACTLY the same layout and perspective: "
 "a wide calm lake reflecting the pink dawn sky filling the middle, two inlets in the far distance, patchwork of harvested rice fields and dry lotus paddies and small farm villages with woods around the shore getting smaller toward the horizon, "
 "reed beds along the shore, four white-sailed sail fishing boats on the lake (smaller in the distance), the twin-peaked Mount Tsukuba on the horizon, thin low morning mist, "
 "an old concrete seaplane base with a slipway, a hangar and a wooden lookout tower at the bottom center on the near shore. Soft muted pastel palette, no text")
J=[(submit('gen/lake2_block.png',d,s),s) for s in (61,)]
for j,s in J: print(poll(j,f'gen/lake2_{s}.png',150))
