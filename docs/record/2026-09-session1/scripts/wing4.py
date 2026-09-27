from edit_async import submit
from poll import poll
d=("Refine this pixel art RPG map to crisp full-resolution detail, keep EXACTLY the same picture, colors, layout, lighting and perspective, change nothing else: "
 "sharpen the riveted metal plates, rust streaks and portholes; the two blocks beside the nose are banks of four round jet engine pods with dark round intakes facing right; "
 "the tall block at the left is a T-tail (vertical fin with a horizontal stabilizer on top). Soft water ripples, lotus leaves. Detailed 16-bit pixel art, no text")
J=[(submit(f'gen/wg3_{k}.png',d,13),k) for k in 'LR']
for j,k in J: print(k,poll(j,f'gen/wg4_{k}.png',150))
