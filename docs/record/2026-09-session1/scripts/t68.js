const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('http://localhost:8765/field/index.html?debug'); await p.waitForTimeout(1000);
  const W=ms=>p.waitForTimeout(ms);
  const st=()=>p.evaluate(()=>bogiDebug.rpg.debug.state());
  const hold=async(k,ms)=>{await p.keyboard.down(k); await W(ms); await p.keyboard.up(k);};
  await p.evaluate(()=>bogiDebug.enterWorld('kasumi')); await W(1500);
  await p.evaluate(()=>bogiDebug.rpg.debug.load('cabin','aft')); await W(1200);
  await hold('ArrowDown',500); await hold('ArrowRight',4500); await W(1500); console.log('cockpit?',await st());
  await hold('ArrowDown',700); await W(1500); console.log('cabin?',await st());
  await hold('ArrowRight',800); await W(1500); console.log('cockpit again?',await st());
  await p.evaluate(()=>bogiDebug.rpg.debug.teleport(3*32,4.9*32)); await hold('ArrowUp',100); await W(300); await p.keyboard.press('Enter');
  await W(22500); await p.locator('.game-frame').screenshot({path:'q_fin.png'});
  console.log(errs); await b.close(); })();
