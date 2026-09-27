const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage();
  await p.goto('http://localhost:8765/field/index.html'); await p.waitForTimeout(2000);
  const r = await p.evaluate(()=>{
    const out=[];
    for (const t of ['Hi Hey Win！','はい　へい　うぃん','カン','とどかない']) {
      const w = bogiPix.width(t); const c = bogiPix.glyphs(t);
      const d = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
      let maxx=0, maxy=0; for(let y=0;y<c.height;y++) for(let x=0;x<c.width;x++) if(d[(y*c.width+x)*4+3]) {maxx=Math.max(maxx,x); maxy=Math.max(maxy,y);}
      out.push([t,w,c.width,maxx,maxy, document.fonts.check('16px DotGothic16')]);
    }
    return out;});
  console.log(r); await b.close(); })();
