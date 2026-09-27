const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('http://localhost:8765/field/index.html?debug'); await p.waitForTimeout(1200);
  const W=ms=>p.waitForTimeout(ms);
  const st=()=>p.evaluate(()=>bogiDebug.rpg.debug.state());
  const tp=(x,y)=>p.evaluate(([x,y])=>bogiDebug.rpg.debug.teleport(x,y),[x,y]);
  const hold=async(k,ms)=>{await p.keyboard.down(k); await W(ms); await p.keyboard.up(k);};
  const shot=n=>p.locator('.game-frame').screenshot({path:`q_${n}.png`});
  await p.evaluate(()=>bogiDebug.enterWorld('kasumi')); await W(1500);
  await p.evaluate(()=>bogiDebug.rpg.debug.load('wing','hatch')); await W(1200);
  await hold('ArrowRight',600); await W(1500); console.log('cabin?',await st()); await shot('c1');
  await hold('ArrowDown',400); await hold('ArrowRight',3500); await W(300); console.log('walk',await st()); await shot('c2');
  await hold('ArrowUp',800); await W(1500); console.log('cockpit?',await st());
  await hold('ArrowDown',600); await W(1500); console.log('back cabin?',await st()); await shot('c3');
  await hold('ArrowLeft',4000); await hold('ArrowUp',900); await W(1500); console.log('wing?',await st());
  console.log(errs); await b.close(); })();
