const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage();
  await p.goto('http://localhost:8765/field/index.html'); await p.waitForTimeout(1200);
  const hid=()=>p.evaluate(()=>document.getElementById('statusOverlay').hidden);
  await p.keyboard.press('KeyC'); await p.keyboard.press('Enter'); await p.keyboard.press('KeyC');
  console.log('after C in list, hidden =', await hid());
  await p.keyboard.press('KeyC'); console.log('after C on top, hidden =', await hid());
  await b.close(); })();
