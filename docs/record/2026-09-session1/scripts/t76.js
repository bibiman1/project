const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('http://localhost:8765/field/index.html?debug');
  await p.evaluate(()=>{localStorage.clear(); localStorage.setItem('bogidachi.field.v1', JSON.stringify({items:[],words:[],cleared:[],flags:{'void.found.haihei':true}}));});
  await p.reload(); await p.waitForTimeout(1800);
  const shot=n=>p.locator('.game-frame').screenshot({path:`q_${n}.png`});
  await shot('u1');
  await p.evaluate(()=>bogiDebug.rpg.debug.teleport(33*32,22.3*32)); await p.keyboard.down('ArrowUp'); await p.waitForTimeout(100); await p.keyboard.up('ArrowUp'); await p.waitForTimeout(900);
  console.log(await p.evaluate(()=>bogiDebug.rpg.debug.state())); await p.keyboard.press('Enter'); await p.waitForTimeout(700); await shot('u2');
  await p.keyboard.press('Escape');
  // 霞ヶ浦: 吹き出しと知らせ
  await p.evaluate(()=>bogiDebug.enterWorld('kasumi')); await p.waitForTimeout(1500);
  await p.evaluate(()=>bogiDebug.rpg.debug.load('hangar','door')); await p.waitForTimeout(1300);
  await p.evaluate(()=>bogiDebug.rpg.debug.teleport(6.2*32,7.6*32)); await p.keyboard.down('ArrowUp'); await p.waitForTimeout(120); await p.keyboard.up('ArrowUp'); await p.waitForTimeout(300);
  await p.keyboard.press('Enter'); await p.waitForTimeout(2400); await shot('u3');
  await p.evaluate(()=>bogiDebug.rpg.debug.load('shore','slip')); await p.waitForTimeout(1300);
  await p.keyboard.down('ArrowUp'); await p.waitForTimeout(80); await p.keyboard.up('ArrowUp'); await p.keyboard.press('Enter'); await p.waitForTimeout(400); await shot('u4');
  console.log(errs); await b.close(); })();
