'use strict';
const $=id=>document.getElementById(id),map=$('map'),ctx=map.getContext('2d');
const TYPES={earth:['地球型','#58c98b'],mars:['火星型','#df7658'],gas:['ガス惑星','#68aee8']},FACS={player:['総督府','#5dd7ff'],zora:['ゾラ共同体','#ff7078'],mira:['ミラ交易連盟','#ffd16e'],nox:['ノクス評議会','#ae8cff']};
const NAMES=['プロキオン','アケルナル','ベルダン','トリトン','ルメリア','ガウス','ハルモニア','ネレイド','オルフェ','カノープス','エリダヌス','サガン','テーベ','ミネルヴァ','イオニア','ケプラー','アルカディア','リゲル','セレス','ソラリス'];
const SHIPS={scout:{name:'探査船',hp:45,atk:8,speed:2,maxFuel:38,cost:[600,150]},battleship:{name:'戦艦',hp:130,atk:50,speed:1.2,maxFuel:26,cost:[1500,450]},transport:{name:'輸送船',hp:75,atk:3,speed:1,maxFuel:32,cost:[800,250]}};
let S,sel,timer,route=null,history=[],listState={sort:'distance',filter:'all'};const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,pick=a=>a[rand(0,a.length-1)];
function planet(i){const type=pick(['earth','mars','gas']);return{id:i,name:NAMES[i],x:rand(5,195),y:rand(6,194),type,ore:type==='gas'?0:rand(type==='mars'?70:35,type==='mars'?100:70),deut:rand(type==='gas'?80:type==='mars'?10:35,type==='gas'?120:type==='mars'?35:70),cap:rand(type==='earth'?500:type==='mars'?200:50,type==='earth'?1000:type==='mars'?500:200),pop:0,owner:null,explored:false,defense:rand(10,45),fuel:0,materials:0,usable:Math.random()>=0.22,dock:0,dockPool:[],battery:rand(0,2),security:100}}
function fleet(id,owner,at,types,name){return{id,owner,at,target:null,progress:0,eta:0,burn:0,order:'待機',name,commander:null,ships:types.map((t,i)=>({id:`${id}-${i}`,type:t,hp:SHIPS[t].hp,fuel:SHIPS[t].maxFuel}))}}
function newGame(){let ps=[];for(let i=0;i<20;i++){let p;do{p=planet(i)}while(ps.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<8));ps.push(p)}Object.assign(ps[0],{x:100,y:100,name:'プロキオン首都星',type:'earth',ore:50,deut:50,cap:600,pop:300,owner:'player',explored:true,defense:30,fuel:500,materials:500,usable:true,dock:1,dockPool:[],battery:1,security:100});const rest=ps.slice(1).sort(()=>Math.random()-.5);['zora','mira','nox'].forEach((f,j)=>rest.slice(j*3,j*3+3).forEach(p=>{p.owner=f;p.pop=rand(100,Math.min(p.cap,450));p.fuel=300;p.materials=300}));const people=['アレン・カイ','ミナ・ロウ','トウマ・レン','セラ・ノイン','ユナ・ベル','ガイル・オルド','リオ・サーン','エマ・ヴァル'].map((name,id)=>({id,name,pilot:rand(25,85),force:rand(25,85),diplomacy:rand(25,85),assignment:null,xp:0,rank:0}));const f=fleet(1,'player',0,['scout'],'第1探査艦隊'),best=[...people].sort((a,b)=>b.pilot-a.pilot)[0];f.commander=best.id;best.assignment=f.id;S={year:1,turn:0,money:3000,planets:ps,fleets:[f],people,relations:{zora:0,mira:0,nox:0},contacted:{},nextFleet:2};['zora','mira','nox'].forEach((fac,j)=>{const home=rest[j*3];S.fleets.push(fleet(100+j,fac,home.id,['battleship','battleship','transport'],`${FACS[fac][0]}防衛艦隊`))});sel={kind:'planet',id:0};route=null;history=[];log('星域統治を開始しました。惑星または艦隊を選択してください。','good');speed(1);render()}
function commander(f){return S.people.find(p=>p.id===f.commander)}function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}function fuelPct(s){return s.fuel/SHIPS[s.type].maxFuel*100}function fleetPct(f){return Math.min(...f.ships.map(fuelPct))}function range(f){const c=commander(f),factor=Math.max(.5,1-(c?c.pilot*.004:0));return Math.floor(Math.min(...f.ships.map(s=>s.fuel))/factor)}function routeInfo(f,pid){const d=dist(fleetMapPosition(f),S.planets[pid]),factor=Math.max(.5,1-(commander(f)?.pilot||0)*.004),need=Math.ceil(d*factor),sp=Math.min(...f.ships.map(s=>SHIPS[s.type].speed));return{d,need,turns:Math.max(2,Math.ceil(d/sp)),ok:d<=range(f)}}
const RANKS=[{name:'候補生',mark:'◇',xp:0},{name:'少尉',mark:'◆',xp:20},{name:'中尉',mark:'◆◆',xp:55},{name:'大尉',mark:'◆◆◆',xp:100},{name:'少佐',mark:'★',xp:170},{name:'中佐',mark:'★★',xp:260},{name:'大佐',mark:'★★★',xp:380}];
function rankOf(p){let r=RANKS[0];for(const x of RANKS)if((p.xp||0)>=x.xp)r=x;return r}
function nextRank(p){const r=rankOf(p),i=RANKS.indexOf(r);return RANKS[Math.min(i+1,RANKS.length-1)]}
function gainXp(fid,amount,reason){const f=S.fleets.find(x=>x.id===fid),p=f&&commander(f);if(!p)return;const before=rankOf(p).name;p.xp=(p.xp||0)+amount;const after=rankOf(p).name;if(before!==after)showResult('昇進',`<div class="resultBox"><span class="rankBadge">${rankOf(p).mark}</span> <b>${p.name}</b><br>${before}から${after}へ昇進しました。<br>${reason}で経験値${amount}を獲得。</div>`,()=>render());else log(`${p.name}が経験値${amount}を獲得しました。`,'info')}
function tick(){S.turn++;S.planets.filter(p=>p.owner==='player').forEach(p=>{p.materials=Math.min(1000,p.materials+p.ore*.02);p.fuel=Math.min(1000,p.fuel+p.deut*.02)});S.fleets.forEach(f=>{if(f.target===null)return;if(f.ships.some(s=>s.fuel<f.burn)){f.target=null;f.order='燃料切れ・漂流';log(`${f.name}が燃料切れで漂流しました。`,'bad');return}f.ships.forEach(s=>s.fuel-=f.burn);if(++f.progress>=f.eta){f.at=f.target;f.target=null;f.progress=0;f.burn=0;f.order='待機';arrive(f)}});if(S.turn>=100){S.turn=0;S.year++;let tax=0;S.planets.filter(p=>p.owner==='player').forEach(p=>{p.pop=Math.min(p.cap,p.pop*1.012);tax+=Math.floor(p.pop/10)*100});S.money+=tax;log(`${S.year}年。税収${tax}を獲得。`,'good')}if(S.turn%10===0)save(false);render()}
function canRefuel(p){return p.owner==='player'||(p.owner&&S.relations[p.owner]>=60)}
function arrive(f){
 const p=S.planets[f.at],wasUnexplored=!p.explored;
 if(f.ships.some(s=>s.type==='scout')){
  p.explored=true;
  if(wasUnexplored&&!p.usable){
   p.owner=null;p.pop=0;p.ore=0;p.deut=0;p.fuel=0;p.materials=0;
   showResult('探査結果',`<div class="resultBox"><b>${p.name}</b><br>利用可能な惑星は発見されませんでした。<br>この星系は領有・開発・補給に利用できません。</div>`,()=>finishArrival(f,p));
   return;
  }
  if(!p.owner){p.owner='player';p.pop=10;showResult('探査完了',`<div class="resultBox"><b>${p.name}</b><br>${TYPES[p.type][0]}を発見し、自国へ編入しました。<br>鉱石指数 ${p.ore} / 重水素指数 ${p.deut}</div>`,()=>finishArrival(f,p));return}
  if(p.owner!=='player'&&!S.contacted[p.owner]){contact(p.owner,p);return}
 }
 finishArrival(f,p);
}
function finishArrival(f,p){
 if(p.usable&&canRefuel(p)){f.ships.forEach(s=>{const n=SHIPS[s.type].maxFuel-s.fuel,t=Math.min(n,p.fuel);s.fuel+=t;p.fuel-=t});log(`${f.name}は${p.name}で補給しました。`,'good')}
 else if(p.usable)log(`${p.name}では補給できません。`,'warn');
 if(f.order==='占領'&&p.owner&&p.owner!=='player'){sel={kind:'fleet',id:f.id};route=null;beginEncounter(f,p);return}gainXp(f.id,12,'探査任務');sel={kind:'planet',id:p.id};route=null;render();
}
function showResult(title,body,onOk){modal(title,body,[['OK',()=>{closeModal();if(onOk)onOk()}]])}
function send(fid,pid,order){const f=S.fleets.find(x=>x.id===fid);if(f.commander===null)return log('司令官が必要です。','warn');const r=routeInfo(f,pid);if(!r.ok)return log('航続力不足です。補給可能な惑星へ立ち寄ってください。','warn');f.target=pid;f.progress=0;f.eta=r.turns;f.burn=r.need/r.turns;f.order=order;log(`${f.name}に${order}命令を出しました。`,'info');if(order==='探査')showResult('探査命令',`<div class="resultBox"><b>${f.name}</b><br>${S.planets[pid].explored?S.planets[pid].name:`未踏星系-${pid}`}へ探査命令を出しました。<br>距離 ${r.d.toFixed(1)} / 到着予定 ${r.turns}ターン</div>`,()=>render())}
function contact(fid,p){S.contacted[fid]=true;modal(`${FACS[fid][0]}と接触`,`<p>${p.name}で通信を受信しました。</p><div class="buttons"><button data-c="25">友好的に呼びかける</button><button data-c="5">中立的に観察</button><button data-c="-50">敵対を宣言</button></div>`,[]);$('modalBody').querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{S.relations[fid]=+b.dataset.c;const value=+b.dataset.c;showResult('外交方針を決定',`<div class="resultBox">${FACS[fid][0]}との関係値を <b>${value}</b> に設定しました。</div>`,()=>{log(`関係値を${value}に設定しました。`,'info');finishArrival(S.fleets.find(x=>x.owner==='player'&&x.at===p.id),p)})})}
function render(){stats();draw();fleetList();diplomacy();detail()}function stats(){$('stats').innerHTML=`<span>${S.year}年 ${S.turn}/100</span><span>資金 ${Math.floor(S.money)}</span><span>人口 ${Math.floor(S.planets.filter(p=>p.owner==='player').reduce((n,p)=>n+p.pop,0))}万</span><span>資材 ${Math.floor(S.planets.filter(p=>p.owner==='player').reduce((n,p)=>n+p.materials,0))}</span><span>燃料 ${Math.floor(S.planets.filter(p=>p.owner==='player').reduce((n,p)=>n+p.fuel,0))}</span>`}
function gauge(p){const c=p<20?'low':p<50?'mid':'';return `<div class="fuel ${c}"><i style="width:${p}%"></i></div>`}function fleetList(){$('fleets').innerHTML='';S.fleets.filter(f=>f.owner==='player'||S.planets[f.at]?.explored).forEach(f=>{const b=document.createElement('button');b.className=`card ${sel.kind==='fleet'&&sel.id===f.id?'selected':''}`;b.innerHTML=`<b>${f.name}</b><br>${f.ships.length}隻｜${f.order}<br>司令官：${commander(f)?.name||'未任命'}${gauge(fleetPct(f))}`;b.onclick=()=>{sel={kind:'fleet',id:f.id};route=null;render()};$('fleets').appendChild(b)})}
function diplomacy(){$('diplomacy').innerHTML=['zora','mira','nox'].map(f=>`<div class="card"><b>${S.contacted[f]?FACS[f][0]:'未接触勢力'}</b><br>関係 ${S.contacted[f]?S.relations[f]:'不明'}</div>`).join('')}
function detail(){if(sel.kind==='fleet'){const f=S.fleets.find(x=>x.id===sel.id),r=route?routeInfo(f,route.pid):null;$('detail').innerHTML=`<h3>${f.name}</h3><div class="row"><span>現在地</span><b>${S.planets[f.at].explored?S.planets[f.at].name:'未確認'}</b></div><div class="row"><span>司令官</span><b>${commander(f)?.name||'未任命'}</b></div><div class="row"><span>航続力</span><b>${range(f)}</b></div><h2>燃料</h2>${f.ships.map(s=>`<div>${SHIPS[s.type].name} ${Math.floor(s.fuel)}/${SHIPS[s.type].maxFuel}${gauge(fuelPct(s))}</div>`).join('')}`;$('actions').innerHTML=`<div class="command"><b>艦隊命令</b><select id="cmd"><option>移動</option><option ${f.ships.some(s=>s.type==='scout')?'':'disabled'}>探査</option><option ${f.ships.some(s=>s.type==='battleship')?'':'disabled'}>惑星防衛</option><option ${f.ships.some(s=>s.type==='transport')?'':'disabled'}>輸送</option><option ${f.ships.some(s=>s.type==='battleship')&&f.ships.some(s=>s.type==='transport')?'':'disabled'}>占領</option><option ${f.ships.some(s=>s.type==='battleship')?'':'disabled'}>迎撃</option></select><select id="dest"><option value="" ${route?'':'selected'}>目的地を選択</option>${S.planets.map(p=>{const q=routeInfo(f,p.id);return `<option value="${p.id}" ${route?.pid===p.id?'selected':''}>${q.ok?'○':'×'} ${p.explored?p.name:`未踏星系-${p.id}`} 距離${q.d.toFixed(1)}</option>`}).join('')}</select>${r?`<div class="${r.ok?'routeOk':'routeWarning'}">${r.ok?'航続距離内':'警告：航続距離外'}<br>距離 ${r.d.toFixed(1)} / 航続力 ${range(f)} / ${r.turns}T</div>`:'<div class="routeOk">目的地を選択すると航続距離円を表示します。</div>'}<button id="issue" ${r&&r.ok?'':'disabled'}>命令を実行</button></div><button id="assign">司令官を任命</button><button id="closeFleetDetail" class="primary">OK（基本画面に戻る）</button>`;$('dest').onchange=e=>{const pid=+e.target.value;route={fid:f.id,pid};const q=routeInfo(f,pid);if(!q.ok)log(`警告：${S.planets[pid].explored?S.planets[pid].name:`未踏星系-${pid}`}は航続距離外です。選択は保持しますが出航できません。`,'warn');detail();draw()};$('issue').onclick=()=>{if(!$('dest').value)return log('目的地を選択してください。','warn');send(f.id,+$('dest').value,$('cmd').value)};$('assign').onclick=()=>openRoster(f.id);$('closeFleetDetail').onclick=()=>returnToBasicMap(f.at);return}const p=S.planets[sel.id];if(p.explored&&!p.usable){$('detail').innerHTML=`<h3>${p.name}</h3><p class="barren">利用可能な惑星なし</p><div class="row"><span>領有</span><b>不可</b></div><div class="row"><span>補給</span><b>不可</b></div>`;$('actions').innerHTML='';return}$('detail').innerHTML=p.explored?`<h3>${p.name}</h3><div class="row"><span>種類</span><b>${TYPES[p.type][0]}</b></div><div class="row"><span>所属</span><b>${p.owner?FACS[p.owner][0]:'無所属'}</b></div><div class="row"><span>人口</span><b>${Math.floor(p.pop)}万 / ${p.cap}万</b></div><div class="row"><span>鉱石 / 重水素</span><b>${p.ore} / ${p.deut}</b></div><div class="row"><span>補給</span><b>${canRefuel(p)?'可能':'不可'}</b></div>`:`<h3>未踏星系-${p.id}</h3><p>詳細不明</p>`;$('actions').innerHTML=!p.explored?S.fleets.filter(f=>f.owner==='player'&&f.ships.some(s=>s.type==='scout')).map(f=>`<button data-scout="${f.id}">${f.name}で探査</button>`).join(''):'';$('actions').querySelectorAll('[data-scout]').forEach(b=>b.onclick=()=>send(+b.dataset.scout,p.id,'探査'))}
function returnToBasicMap(planetId){
 sel={kind:'planet',id:planetId};route=null;
 const right=document.querySelector('aside.right');if(right)right.scrollTop=0;
 log('艦隊操作を終了し、星系マップへ戻りました。','info');
 render();
}
function fleetMapPosition(f){
 const a=S.planets[f.at];
 if(f.target===null)return{x:a.x,y:a.y};
 const b=S.planets[f.target],t=Math.max(0,Math.min(1,f.progress/f.eta));
 return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
}
function draw(){const w=map.clientWidth,h=map.clientHeight,d=devicePixelRatio||1;map.width=w*d;map.height=h*d;ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);for(let i=0;i<100;i++){ctx.fillStyle='#ffffff44';ctx.fillRect((i*137%1000)/1000*w,(i*83%700)/700*h,1,1)}S.planets.forEach(p=>{const x=p.x*w/200,y=p.y*h/200;ctx.beginPath();ctx.arc(x,y,sel.kind==='planet'&&sel.id===p.id?12:8,0,7);ctx.fillStyle=p.explored?TYPES[p.type][1]:'#718092';ctx.fill();if(p.explored&&p.owner){ctx.strokeStyle=FACS[p.owner][1];ctx.lineWidth=3;ctx.stroke()}ctx.fillStyle='#bfd0dc';ctx.font='10px system-ui';ctx.fillText(p.explored?p.name:`未踏星系-${p.id}`,x+11,y+3)});if(sel.kind==='fleet'&&route){const f=S.fleets.find(x=>x.id===sel.id),pos=fleetMapPosition(f),x=pos.x*w/200,y=pos.y*h/200,radius=range(f)*Math.min(w,h)/200;ctx.save();ctx.strokeStyle='#5dd7ffcc';ctx.fillStyle='#5dd7ff12';ctx.setLineDash([6,5]);ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.setLineDash([]);const p=S.planets[route.pid],r=routeInfo(f,p.id);ctx.strokeStyle=r.ok?'#71df9c':'#ff7078';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(p.x*w/200,p.y*h/200);ctx.stroke();ctx.fillStyle='#5dd7ff';ctx.font='10px system-ui';ctx.fillText(`航続力 ${range(f)}`,x+10,y-radius+12);ctx.restore()}S.fleets.filter(f=>f.owner==='player').forEach(f=>{const a=S.planets[f.at],b=f.target===null?a:S.planets[f.target],t=f.target===null?0:f.progress/f.eta,x=(a.x+(b.x-a.x)*t)*w/200,y=(a.y+(b.y-a.y)*t)*h/200;ctx.fillStyle='#ffffff';ctx.strokeStyle=FACS[f.owner]?.[1]||'#5dd7ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y-8);ctx.lineTo(x+7,y+7);ctx.lineTo(x-7,y+7);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=FACS[f.owner]?.[1]||'#5dd7ff';ctx.font='9px system-ui';ctx.fillText(f.name,x+9,y+3)})}
function selectPlanet(e){const r=map.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best=null,bd=29;S.planets.forEach(p=>{const d=Math.hypot(p.x*r.width/200-x,p.y*r.height/200-y);if(d<bd){best=p;bd=d}});if(!best)return log('惑星の丸印をクリックしてください。','warn');sel={kind:'planet',id:best.id};route=null;log(`${best.explored?best.name:`未踏星系-${best.id}`}を選択しました。`,'info');render()}
function openRoster(fid=null){
 modal('人事名簿',`<table class="roster"><tr><th>階級章</th><th>階級・名前</th><th>経験値</th><th>操艦</th><th>武力</th><th>外交</th><th></th></tr>${S.people.map(p=>{const r=rankOf(p),n=nextRank(p),pct=r===n?100:Math.min(100,((p.xp-r.xp)/(n.xp-r.xp))*100);return `<tr><td><span class="rankBadge">${r.mark}</span></td><td><b>${r.name}</b><br>${p.name}</td><td>${p.xp||0}${r!==n?` / ${n.xp}`:''}<div class="xpbar"><i style="width:${pct}%"></i></div></td><td>${p.pilot}</td><td>${p.force}</td><td>${p.diplomacy}</td><td>${fid!==null?`<button data-person="${p.id}" ${p.assignment?'disabled':''}>任命</button>`:''}</td></tr>`}).join('')}</table>`,[['OK',closeModal]]);
 $('modalBody').querySelectorAll('[data-person]').forEach(b=>b.onclick=()=>{const f=S.fleets.find(x=>x.id===fid),p=S.people.find(x=>x.id===+b.dataset.person);if(f.commander!==null)S.people.find(x=>x.id===f.commander).assignment=null;f.commander=p.id;p.assignment=f.id;showResult('司令官任命',`<div class="resultBox"><span class="rankBadge">${rankOf(p).mark}</span> <b>${rankOf(p).name} ${p.name}</b><br>${f.name}の司令官に任命しました。</div>`,()=>{log(`${p.name}を${f.name}の司令官に任命しました。`,'good');render()})});
}
function openSystems(){const base=sel.kind==='fleet'?S.planets[S.fleets.find(f=>f.id===sel.id).at]:S.planets.find(p=>p.owner==='player'),f=sel.kind==='fleet'?S.fleets.find(x=>x.id===sel.id):null;let rows=S.planets.map(p=>({p,d:dist(base,p)}));const filter=$('sysFilter')?.value||listState.filter,sort=$('sysSort')?.value||listState.sort;listState={filter,sort};if(filter==='mine')rows=rows.filter(x=>x.p.owner==='player');if(filter==='supply')rows=rows.filter(x=>x.p.explored&&canRefuel(x.p));if(filter==='unexplored')rows=rows.filter(x=>!x.p.explored);rows.sort((a,b)=>sort==='name'?(a.p.explored?a.p.name:`未踏星系-${a.p.id}`).localeCompare(b.p.explored?b.p.name:`未踏星系-${b.p.id}`,'ja'):sort==='population'?b.p.pop-a.p.pop:a.d-b.d);modal('星系一覧',`<div class="toolbar"><select id="sysSort"><option value="distance">距離順</option><option value="name" ${sort==='name'?'selected':''}>名前順</option><option value="population" ${sort==='population'?'selected':''}>人口順</option></select><select id="sysFilter"><option value="all">すべて</option><option value="mine" ${filter==='mine'?'selected':''}>自国</option><option value="supply" ${filter==='supply'?'selected':''}>補給可能</option><option value="unexplored" ${filter==='unexplored'?'selected':''}>未探査</option></select><span>距離基準：${base.name}</span></div><div class="systems"><div class="syshead"><span>星系</span><span>所属・種類</span><span>人口</span><span>資源</span><span>距離・航続</span><span></span></div>${rows.map(x=>systemRow(x.p,x.d,f)).join('')}</div>`,[['閉じる',closeModal]]);$('sysSort').onchange=openSystems;$('sysFilter').onchange=openSystems;$('modalBody').querySelectorAll('[data-system]').forEach(b=>b.onclick=()=>{sel={kind:'planet',id:+b.dataset.system};closeModal();render()})}
function systemRow(p,d,f){if(!p.explored)return `<button class="sysrow" data-system="${p.id}"><span><b>未踏星系-${p.id}</b><small>未探査</small></span><span>不明</span><span>不明</span><span>不明</span><span>距離 ${d.toFixed(1)}${f?`<small>${routeInfo(f,p.id).ok?'到達可能':'航続力不足'}</small>`:''}</span><span>選択</span></button>`;if(!p.usable)return `<button class="sysrow" data-system="${p.id}"><span><b>${p.name}</b><small>探査済み</small></span><span>利用可能な惑星なし</span><span>-</span><span>-</span><span>距離 ${d.toFixed(1)}</span><span>選択</span></button>`;return `<button class="sysrow" data-system="${p.id}"><span><b>${p.name}</b></span><span>${p.owner?FACS[p.owner][0]:'無所属'}<small>${TYPES[p.type][0]} / 補給${canRefuel(p)?'可':'不可'}</small></span><span>${Math.floor(p.pop)}万</span><span>鉱${p.ore} / 重${p.deut}<small>防衛${p.defense}</small></span><span>距離 ${d.toFixed(1)}${f?`<small>${routeInfo(f,p.id).ok?'到達可能':'航続力不足'} / ${routeInfo(f,p.id).turns}T</small>`:''}</span><span>選択</span></button>`}
function build(type){
 const d=SHIPS[type],dockPlanet=S.planets.find(p=>p.owner==='player'&&p.dock>0);
 if(!dockPlanet)return log('造船ドックがありません。','warn');
 if(S.money<d.cost[0]||dockPlanet.materials<d.cost[1])return log('資金または資材不足です。','warn');
 S.money-=d.cost[0];dockPlanet.materials-=d.cost[1];
 dockPlanet.dockPool=dockPlanet.dockPool||[];
 dockPlanet.dockPool.push({id:`dock-${Date.now()}-${Math.random()}`,type,hp:d.hp,fuel:d.maxFuel});
 showResult('建造完了',`<div class="resultBox"><b>${d.name}</b>を${dockPlanet.name}の造船ドックへ収容しました。<br>艦隊へ自動編入はされません。</div>`,()=>render());
}
function openDock(){
 const docks=S.planets.filter(p=>p.owner==='player'&&p.dock>0),body=docks.map(p=>{const local=S.fleets.filter(f=>f.owner==='player'&&f.at===p.id&&f.target===null&&f.ships.length<10),pool=p.dockPool||[];return `<h3>${p.name} 造船ドック</h3><div class="dockGrid">${pool.length?pool.map(ship=>`<div class="dockShip"><div><b>${SHIPS[ship.type].name}</b><br>耐久${ship.hp} / 燃料${ship.fuel}</div><select data-dockship="${ship.id}" data-planet="${p.id}"><option value="">補充先艦隊</option>${local.map(f=>`<option value="${f.id}">${f.name} (${f.ships.length}/10)</option>`).join('')}</select></div>`).join(''):'<p>プール中の船はありません。</p>'}${!local.length&&pool.length?'<div class="routeWarning">この惑星に待機中の自国艦隊がないため補充できません。</div>':''}</div>`}).join('');
 modal('造船ドック',body,[['OK',closeModal]]);
 $('modalBody').querySelectorAll('[data-dockship]').forEach(sel=>sel.onchange=()=>{if(!sel.value)return;assignDockShip(+sel.dataset.planet,sel.dataset.dockship,+sel.value)});
}
function assignDockShip(planetId,shipId,fid){
 const p=S.planets[planetId],f=S.fleets.find(x=>x.id===fid);if(!f||f.at!==planetId||f.target!==null)return log('ドックのある惑星に待機中の艦隊が必要です。','warn');if(f.ships.length>=10)return log('艦隊は10隻上限です。','warn');const i=(p.dockPool||[]).findIndex(x=>x.id===shipId);if(i<0)return;const ship=p.dockPool.splice(i,1)[0];f.ships.push(ship);showResult('艦隊補充',`<div class="resultBox"><b>${SHIPS[ship.type].name}</b>を${f.name}へ補充しました。</div>`,()=>render());
}
function save(manual){localStorage.setItem('planetGovernorV100',JSON.stringify(S));if(manual)log('ゲームを保存しました。','good')}function load(){const d=localStorage.getItem('planetGovernorV100');if(!d)return log('セーブデータがありません。','warn');S=JSON.parse(d);closeModal();render();log('セーブを読み込みました。','good')}function saveMenu(){modal('セーブ管理','<p>自動セーブ：10ターンごと</p>',[['手動セーブ',()=>{save(true);closeModal()}],['読込',load],['削除',()=>{localStorage.removeItem('planetGovernorV100');closeModal();log('セーブを削除しました。','warn')}],['閉じる',closeModal]])}
function log(text,kind='info'){history.unshift({text,kind,year:S?.year||1,turn:S?.turn||0});$('notice').innerHTML=`<span class="${kind}">${S?.year||1}年${S?.turn||0}T：${text}</span>`}function modal(title,body,buttons){speed(0);$('modalTitle').textContent=title;$('modalBody').innerHTML=body;$('modalButtons').innerHTML='';buttons.forEach(([t,fn])=>{const b=document.createElement('button');b.textContent=t;b.onclick=fn;$('modalButtons').appendChild(b)});$('modal').classList.remove('hidden')}function closeModal(){$('modal').classList.add('hidden')}function speed(v){clearInterval(timer);document.querySelectorAll('[data-speed]').forEach(b=>b.classList.toggle('active',+b.dataset.speed===v));if(v)timer=setInterval(tick,3000/v)}

// v1.3.2 battle and occupation module
Object.assign(SHIPS.scout,{def:5,accuracy:65,evasion:35,troops:0});
Object.assign(SHIPS.battleship,{def:25,accuracy:75,evasion:10,troops:0});
Object.assign(SHIPS.transport,{def:8,accuracy:50,evasion:15,troops:40});
let battle=null;
function hostile(a,b){if(a===b)return false;if(a==='player')return (S.relations[b]||0)<0;if(b==='player')return (S.relations[a]||0)<0;return true}
function fleetHp(f){return f.ships.reduce((n,x)=>n+Math.max(0,x.hp),0)}
function fleetMaxHp(f){return f.ships.reduce((n,x)=>n+SHIPS[x.type].hp,0)||1}
function combatPower(f,stance='standard'){const c=commander(f),mult=1+(c?.force||40)/200,stanceMult=stance==='attack'?1.25:stance==='defend'?.8:1;return f.ships.reduce((n,x)=>n+SHIPS[x.type].atk,0)*mult*stanceMult}
function enemyAt(planetId,owner){return S.fleets.find(f=>f.owner===owner&&f.at===planetId&&f.target===null&&f.ships.length)}
function beginEncounter(playerFleet,planet){
 const defender=planet.owner&&enemyAt(planet.id,planet.owner);
 if(defender&&hostile(playerFleet.owner,defender.owner))return openBattleSetup(playerFleet,defender,()=>beginOccupation(playerFleet,planet));
 beginOccupation(playerFleet,planet);
}
function openBattleSetup(a,b,after){
 speed(0);battle={a,b,after,round:0,stance:'standard',logs:[],aMax:fleetMaxHp(a),bMax:fleetMaxHp(b)};
 modal('艦隊戦',`<div class="battleSummary"><div><b>自軍</b><br>${a.name}<br>${shipComposition(a)}</div><div><b>敵軍</b><br>${b.name}<br>${shipComposition(b)}</div></div><p>戦闘方針を選択してください。</p><div class="battleControls"><button data-stance="standard">標準戦闘</button><button data-stance="attack">全力攻撃</button><button data-stance="defend">防御重視</button><button data-stance="retreat">撤退</button></div>`,[]);
 $('modalBody').querySelectorAll('[data-stance]').forEach(btn=>btn.onclick=()=>{const st=btn.dataset.stance;if(st==='retreat')return attemptRetreat();battle.stance=st;renderBattle()});
}
function shipComposition(f){return Object.keys(SHIPS).map(t=>`${SHIPS[t].name}${f.ships.filter(s=>s.type===t).length}`).filter(x=>!x.endsWith('0')).join(' / ')||'艦艇なし'}
function renderBattle(){
 const a=battle.a,b=battle.b,ap=Math.max(0,fleetHp(a)/battle.aMax*100),bp=Math.max(0,fleetHp(b)/battle.bMax*100);
 $('modalTitle').textContent=`艦隊戦 第${battle.round+1}ラウンド`;
 $('modalBody').innerHTML=`<div class="battleStage"><div class="battleSide"><b>${a.name}</b><div class="fuel hpBig"><i style="width:${ap}%"></i></div><div class="battleFleet">${battleShips(a)}</div></div><div class="battleSide enemy"><b>${b.name}</b><div class="fuel hpBig low"><i style="width:${bp}%"></i></div><div class="battleFleet">${battleShips(b)}</div></div></div><div class="battleLog">${battle.logs.slice(-8).map(x=>`<div>${x}</div>`).join('')||'戦闘開始命令を待っています。'}</div><div class="battleControls"><button id="nextRound">次のラウンド</button><button id="autoBattle">自動進行</button><button id="retreatBattle">撤退</button></div>`;
 $('modalButtons').innerHTML='';$('nextRound').onclick=battleRound;$('autoBattle').onclick=autoBattle;$('retreatBattle').onclick=attemptRetreat;
}
function battleShips(f){return f.ships.map(s=>`<div class="battleShip ${s.type}" title="${SHIPS[s.type].name} HP${Math.ceil(s.hp)}"></div>`).join('')||'<span class="loss">全滅</span>'}
function battleRound(){
 if(!battle)return;battle.round++;
 const a=battle.a,b=battle.b,stance=battle.stance;
 dealVolley(a,b,stance,'自軍');if(b.ships.length)dealVolley(b,a,'standard','敵軍');
 if(!a.ships.length||!b.ships.length||battle.round>=10)return finishBattle();
 renderBattle();
}
function dealVolley(attacker,defender,stance,label){
 const ac=commander(attacker),pilot=commander(defender)?.pilot||40;
 for(const ship of [...attacker.ships]){
  if(!defender.ships.length)break;
  const target=pick(defender.ships),sd=SHIPS[ship.type],td=SHIPS[target.type],hit=Math.max(15,Math.min(95,sd.accuracy+(ac?.force||40)*.1-td.evasion-pilot*.05));
  if(Math.random()*100>hit){battle.logs.push(`${label} ${sd.name}の攻撃は回避された。`);continue}
  const stanceAtk=stance==='attack'?1.25:stance==='defend'?.8:1,stanceDef=stance==='attack'?.85:stance==='defend'?1.25:1;
  const damage=Math.max(1,Math.round((sd.atk*(1+(ac?.force||40)/200)*stanceAtk*(.8+Math.random()*.4))-td.def*stanceDef));
  target.hp-=damage;battle.logs.push(`${label} ${sd.name}が${td.name}へ${damage}ダメージ。`);
  if(target.hp<=0){defender.ships=defender.ships.filter(x=>x!==target);battle.logs.push(`${td.name}を撃沈。`)}
 }
}
function autoBattle(){let guard=12;while(battle&&battle.a.ships.length&&battle.b.ships.length&&battle.round<10&&guard--)battleRound()}
function attemptRetreat(){if(!battle)return;const chance=Math.min(90,35+(commander(battle.a)?.pilot||30)*.6);if(Math.random()*100<chance){battle.logs.push('自軍は戦場から離脱した。');gainXp(battle.a.id,5,'撤退成功');finishBattle(true)}else{battle.logs.push('撤退に失敗し、敵の追撃を受けた。');dealVolley(battle.b,battle.a,'attack','敵軍');if(!battle.a.ships.length)finishBattle();else renderBattle()}}
function finishBattle(retreated=false){
 const {a,b,after}=battle,win=!retreated&&a.ships.length&&(!b.ships.length||fleetHp(a)>fleetHp(b)),enemyDestroyed=!b.ships.length;
 S.fleets=S.fleets.filter(f=>f.ships.length);
 const title=retreated?'撤退完了':win?'艦隊戦勝利':'艦隊戦敗北',body=`<div class="resultBox"><b>${title}</b><br>自軍残存：${shipComposition(a)}<br>敵軍残存：${b.ships.length?shipComposition(b):'全滅'}<br>経過ラウンド：${battle.round}</div>`;
 battle=null;showResult(title,body,()=>{if(win){gainXp(a.id,15+(enemyDestroyed?8:0),'艦隊戦');if(after)after()}else{log(`${a.name}は戦闘を継続できません。`,'bad');render()}});
}
function beginOccupation(f,p){
 if(p.owner==='player'||!p.owner)return showResult('占領不可','<div class="resultBox">占領対象ではありません。</div>',()=>render());
 if(!f.ships.some(s=>s.type==='battleship')||!f.ships.some(s=>s.type==='transport'))return showResult('占領不可','<div class="resultBox">占領には戦艦と輸送船が必要です。</div>',()=>render());
 speed(0);const orbital=(p.battery||0)*100,ground=Math.max(10,p.defense+Math.floor(p.pop/20));battle={kind:'occupation',fleet:f,planet:p,step:'orbital',orbitalHp:orbital,groundHp:ground,round:0,logs:[]};renderOccupation();
}
function renderOccupation(){
 const b=battle,f=b.fleet,p=b.planet,orb=b.orbitalHp,ground=b.groundHp;
 $('modal').classList.remove('hidden');$('modalTitle').textContent=`${p.name} 占領戦`;
 $('modalBody').innerHTML=`<div class="occupationStep"><b>段階：</b>${b.step==='orbital'?'軌道防衛戦':b.step==='ground'?'惑星防衛戦':'降下・占領判定'}</div><div class="battleSummary"><div>攻略艦隊<br>${shipComposition(f)}<br>耐久 ${fleetHp(f)}</div><div>軌道砲台 ${Math.max(0,Math.ceil(orb))}<br>惑星防衛力 ${Math.max(0,Math.ceil(ground))}<br>人口 ${Math.floor(p.pop)}万</div></div><div class="battleLog">${b.logs.slice(-8).map(x=>`<div>${x}</div>`).join('')||'攻略開始命令を待っています。'}</div><div class="battleControls"><button id="occupationNext">次の段階</button><button id="occupationAuto">自動進行</button><button id="occupationAbort">攻略中止</button></div>`;
 $('modalButtons').innerHTML='';$('occupationNext').onclick=occupationRound;$('occupationAuto').onclick=()=>{let n=20;while(battle?.kind==='occupation'&&n--)occupationRound()};$('occupationAbort').onclick=()=>{battle=null;closeModal();log('惑星攻略を中止しました。','warn');render()};
}
function occupationRound(){
 if(!battle||battle.kind!=='occupation')return;const b=battle,f=b.fleet,p=b.planet;b.round++;
 if(b.step==='orbital'){
  if(b.orbitalHp<=0){b.step='ground';b.logs.push('軌道砲台を制圧。惑星防衛戦へ移行。');return renderOccupation()}
  const atk=Math.round(combatPower(f,'standard')*(.35+Math.random()*.2));b.orbitalHp-=atk;b.logs.push(`軌道砲台へ${atk}ダメージ。`);
  if(b.orbitalHp>0){const ret=Math.max(2,Math.round((p.battery||1)*18*Math.random()));damageOne(f,ret);b.logs.push(`軌道砲台の反撃で${ret}ダメージ。`)}
 }else if(b.step==='ground'){
  if(b.groundHp<=0){b.step='landing';b.logs.push('惑星防衛網を沈黙。降下作戦へ移行。');return renderOccupation()}
  const atk=Math.round(combatPower(f,'standard')*(.25+Math.random()*.2));b.groundHp-=atk;b.logs.push(`惑星防衛力へ${atk}ダメージ。`);
  const ret=Math.max(1,Math.round(p.defense*.15*Math.random()));damageOne(f,ret);b.logs.push(`地上防衛の反撃で${ret}ダメージ。`)
 }else return resolveOccupation();
 if(!f.ships.some(s=>s.type==='battleship')||!f.ships.some(s=>s.type==='transport'))return finishOccupation(false,'攻略に必要な艦種を失いました。');
 renderOccupation();
}
function damageOne(f,dmg){const target=pick(f.ships);target.hp-=dmg;if(target.hp<=0){f.ships=f.ships.filter(x=>x!==target);battle.logs.push(`${SHIPS[target.type].name}が撃沈された。`)}}
function resolveOccupation(){const b=battle,f=b.fleet,p=b.planet,c=commander(f),power=f.ships.filter(s=>s.type==='transport').reduce((n,s)=>n+(SHIPS[s.type].troops||0),0)*(1+(c?.force||40)/200),resist=Math.max(20,p.pop/15+p.security*.25);finishOccupation(power>=resist,`占領力 ${Math.round(power)} / 抵抗力 ${Math.round(resist)}`)}
function finishOccupation(success,detail){const b=battle,f=b.fleet,p=b.planet;battle=null;if(success){const old=p.owner;p.owner='player';p.pop=Math.max(1,p.pop*(.85+Math.random()*.1));p.defense=10;p.security=30;p.battery=0;S.relations[old]=-100;gainXp(f.id,30,'惑星占領');showResult('占領成功',`<div class="resultBox"><b>${p.name}を占領しました。</b><br>${detail}<br>人口 ${Math.floor(p.pop)}万 / 治安 ${p.security}</div>`,()=>{sel={kind:'planet',id:p.id};render()})}else showResult('占領失敗',`<div class="resultBox"><b>${p.name}の攻略に失敗しました。</b><br>${detail}</div>`,()=>render())}
map.addEventListener('pointerup',selectPlanet);window.addEventListener('resize',draw);document.querySelectorAll('[data-speed]').forEach(b=>b.onclick=()=>speed(+b.dataset.speed));document.querySelectorAll('[data-build]').forEach(b=>b.onclick=()=>build(b.dataset.build));$('roster').onclick=()=>openRoster();$('dockMenu').onclick=openDock;$('systemMenu').onclick=openSystems;$('saveMenu').onclick=saveMenu;$('history').onclick=()=>modal('通知履歴',history.map(n=>`<div class="card ${n.kind}">${n.year}年${n.turn}T：${n.text}</div>`).join(''),[['閉じる',closeModal]]);$('newWorld').onclick=()=>modal('新しい星域','<p>現在のゲームを終了し、新しい星域を作成します。</p>',[['作成',()=>{closeModal();newGame()}],['キャンセル',closeModal]]);newGame();
