const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [w,h] of [[390,844],[844,390],[390,664],[667,375],[1280,720],[1100,900]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: w<900, isMobile: w<900 });
    const p = await ctx.newPage();
    await p.goto('http://localhost:8765/field/index.html'); await p.waitForTimeout(800);
    const r = await p.evaluate(()=>{const f=document.querySelector('.game-frame').getBoundingClientRect(); const c=document.getElementById('fieldCanvas').getBoundingClientRect(); return {frame:[f.width,f.height].map(Math.round), canvas:[c.width,c.height].map(Math.round), body:document.body.className, vh:innerHeight};});
    console.log(w,h,JSON.stringify(r));
    await ctx.close();
  }
  await b.close(); })();
