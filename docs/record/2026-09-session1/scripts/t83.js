const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage();
  await p.goto('http://localhost:8765/field/index.html'); await p.waitForTimeout(2000);
  const r = await p.evaluate(()=>{
    const t1='Здравствуй, маленький друг!', t2='Хочешь совершить прогулочный полёт?';
    const c=document.createElement('canvas'); c.width=700; c.height=80; const g=c.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,700,80);
    const P=bogiPix; P.text(g,t1,4,6,1); P.text(g,t2,4,30,1); P.text(g,'Да　Нет',4,54,1);
    return {w1:P.width(t1), w2:P.width(t2), url:c.toDataURL()}; });
  console.log(r.w1, r.w2); require('fs').writeFileSync('cyr.png', Buffer.from(r.url.split(',')[1],'base64'));
  await b.close(); })();
