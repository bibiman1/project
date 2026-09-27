from edit_async import submit
from poll import poll
d=("Pixel art RPG interior map in three-quarter top-down view (like a classic JRPG room), inside the long narrow fuselage corridor of an old abandoned Soviet ekranoplan, keep EXACTLY the same layout and positions: "
 "the back wall with metal ribs, pipes and cable bundles along the ceiling; at the left a steel ladder going up to an open roof hatch with pale dawn light pouring down; green oxygen bottles in a rack; "
 "the flight engineer station with a panel of round analog gauges and a worn brown leather seat; a round porthole with pink dawn light; the radio operator station with stacked old radio sets and a seat; "
 "a second porthole; a grey locker with a white pressure-suit helmet on its shelf; at the right a round heavy pressure door above a short ladder leading up to the cockpit. "
 "Metal grating floor with a cable along it, a few dry leaves, dust, rust, dim moody light with soft light shafts. Muted palette matching a rusty cockpit, detailed 16-bit pixel art, no text, no people")
J=[(submit('gen/cabin_block.png',d,s),s) for s in (71,72)]
for j,s in J: print(poll(j,f'gen/cabin_{s}.png',150))
