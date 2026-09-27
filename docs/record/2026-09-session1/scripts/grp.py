from edit_async import submit
from poll import poll
d=("Detailed pixel art, an old commemorative group photograph, keep EXACTLY the same composition: five people standing in a straight row facing the camera on a concrete seaplane slipway, "
 "in the middle a young pilot in a white high-altitude pressure suit holding his helmet, two ground crew mechanics on each side in navy work caps and navy coveralls standing at attention, "
 "the mechanic on the far right holds a small carved wooden hawk folk toy (otaka poppo) in his hand. Behind them a brand-new silver ekranoplan flying boat floating on the lake seen exactly from the side, "
 "hull sitting in the water with no wheels and no landing gear, high T-tail, row of jet engines behind the cockpit, launch tubes on its back. Blue summer lake, green hills, cumulus clouds, one white sail. "
 "Realistic proportions, small modest faces, natural soft light, no text")
J=[(submit('gen/group_block.png',d,s),s) for s in (31,32)]
for j,s in J: print(poll(j,f'gen/group_{s}.png',150))
