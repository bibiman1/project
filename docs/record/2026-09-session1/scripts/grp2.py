from edit_async import submit
from poll import poll
d=("Realistic detailed pixel art recreating an old 1960s snapshot photograph of an aircraft factory crew, keep EXACTLY the same composition: "
 "a huge silver ekranoplan flying boat fills the upper half of the picture seen at a three-quarter angle, its big rounded nose close to the camera on the left, cockpit windows and a row of jet engines on top, "
 "fuselage receding to the right to a tall T-tail, a wing reaching toward the camera on the right, the boat hull resting on a concrete seaplane slipway with no wheels. "
 "Under the nose a small group huddled for the photo: back row standing mechanics in navy work caps and navy coveralls, a young pilot in a white high-altitude pressure suit holding his helmet in the middle, "
 "front row two mechanics crouching, one of them holding up a small carved wooden hawk folk toy. Realistic human body proportions, casual natural poses, small faces, "
 "hangar roof and a wooden lookout tower in the background, overcast soft daylight, grainy old photo feel, no text")
J=[(submit('gen/group2_block.png',d,s),s) for s in (41,42)]
for j,s in J: print(poll(j,f'gen/group2_{s}.png',150))
