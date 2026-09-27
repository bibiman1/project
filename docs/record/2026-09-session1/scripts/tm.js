const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ ...devices['iPhone 13'], viewport:{width:844,height:390}, isLandscape:true });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8765/field/index.html?debug');
  await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
  await p.evaluate(()=>bogiDebug.enterWorld('lake')); await p.waitForTimeout(1500);
  await p.screenshot({path:'m_land.png'});
  await b.close();
})();
