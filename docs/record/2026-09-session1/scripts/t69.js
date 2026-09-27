const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('http://localhost:8765/field/index.html?debug');
  await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1500);
  const r = await p.evaluate(()=>window.BOGI_WORLDS.void.maps.void.objects.filter(o=>o.id&&o.id.startsWith('frag_')).map(o=>[o.id, !o.hidden || !o.hidden(bogiDebug.rpg.api||{cleared:()=>false,flag:()=>false})]));
  console.log(r, errs); await b.close(); })();
