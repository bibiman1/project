from edit_async import submit
from poll import poll
d=("Detailed pixel art illustration with realistic human proportions, like a candid 1960s snapshot, keep the same composition and perspective: "
 "summer noon at Lake Kasumigaura, a brand-new polished silver ekranoplan ground-effect craft seen at a three-quarter angle, its long nose close on the left and the fuselage receding to the right with a high T-tail, "
 "a row of jet engines behind the cockpit windows and launch tubes on its back, moored at a concrete seaplane slipway. White-sailed fishing boats on the blue lake, green hills, big cumulus clouds. "
 "A mechanic on a wooden ladder polishing the nose. In the foreground a young pilot in a white high-altitude pressure suit with his helmet under his arm, laughing, turned toward a mechanic in navy work cap and navy coveralls "
 "who proudly holds up a small hand-carved wooden hawk folk toy (otaka poppo, painted red, black and green). Natural poses, modest faces, soft warm light, detailed shading, no text")
J=[(submit('gen/summer2_block.png',d,s),s) for s in (21,22)]
for j,s in J: print(poll(j,f'gen/summer2_{s}.png',150))
