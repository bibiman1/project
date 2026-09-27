const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage();
  await p.goto('http://localhost:8765/field/index.html'); await p.waitForTimeout(2000);
  console.log(await p.evaluate(()=>{
    const out={};
    for (const f of ['16px "DotGothic16"','16px "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif']) {
      const c=document.createElement('canvas'); c.width=80; c.height=40; const g=c.getContext('2d'); g.font=f; g.textBaseline='top'; g.fillStyle='#fff'; g.fillText('漢あAgy',1,8);
      const d=g.getImageData(0,0,80,40).data; let top=99,bot=-1; for(let y=0;y<40;y++)for(let x=0;x<80;x++) if(d[(y*80+x)*4+3]>110){top=Math.min(top,y);bot=Math.max(bot,y);}
      const m=g.measureText('漢'); out[f]={top,bot, asc:m.fontBoundingBoxAscent, desc:m.fontBoundingBoxDescent};
    } return out;}));
  await b.close(); })();
