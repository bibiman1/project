const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage();
  await p.goto('http://localhost:8765/field/index.html?debug'); await p.waitForTimeout(1000);
  const r = await p.evaluate(()=>{
    const m = window.BOGI_WORLDS.kasumi.maps.wing.map; const T=32;
    const start=[14,13], goal=[17,8]; const seen=new Set([start+'']); const q=[start];
    while(q.length){const [c,r]=q.shift(); if(c===goal[0]&&r===goal[1]) return {ok:true, rows:m};
      for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dc,nr=r+dr; if(m[nr]&&m[nr][nc]==='.'&&!seen.has([nc,nr]+'')){seen.add([nc,nr]+'');q.push([nc,nr]);}}}
    return {ok:false, rows:m};
  });
  console.log(r.ok); console.log(r.rows.join('\n')); await b.close(); })();
