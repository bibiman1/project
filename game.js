'use strict';
const $=id=>document.getElementById(id),map=$('map'),ctx=map.getContext('2d');
const TYPES={earth:['地球型','#58c98b'],mars:['火星型','#df7658'],gas:['ガス惑星','#68aee8']},FACS={player:['総督府','#5dd7ff'],zora:['ゾラ共同体','#ff7078'],mira:['ミラ交易連盟','#ffd16e'],nox:['ノクス評議会','#ae8cff']};
const NAMES=['プロキオン','アケルナル','ベルダン','トリトン','ルメリア','ガウス','ハルモニア','ネレイド','オルフェ','カノープス','エリダヌス','サガン','テーベ','ミネルヴァ','イオニア','ケプラー','アルカディア','リゲル','セレス','ソラリス'];
const SHIPS={scout:{name:'探査船',hp:45,atk:8,speed:2,maxFuel:38,cost:[600,150]},battleship:{name:'戦艦',hp:130,atk:50,speed:1.2,maxFuel:26,cost:[1500,450]},transport:{name:'輸送船',hp:75,atk:3,speed:1,maxFuel:32,cost:[800,250]}};
let S,sel,timer,route=null,history=[],listState={sort:'distance',filter:'all'};const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,pick=a=>a[rand(0,a.length-1)];
function planet(i){const type=pick(['earth','mars','gas']);return{id:i,name:NAMES[i],x:rand(5,195),y:rand(6,194),type,ore:type==='gas'?0:rand(type==='mars'?70:35,type==='mars'?100:70),deut:rand(type==='gas'?80:type==='mars'?10:35,type==='gas'?120:type==='mars'?35:70),cap:rand(type==='earth'?500:type==='mars'?200:50,type==='earth'?1000:type==='mars'?500:200),pop:0,owner:null,explored:false,defense:rand(10,45),fuel:0,materials:0,usable:Math.random()>=0.22,dock:0,dockPool:[],battery:rand(0,2),security:100,fac:{ore:0,fuel:0,housing:0,defbase:0,dock:0,probe:0,battery:0,storage:0},buildQueue:null,shipQueue:[],homeworld:false}}
function fleet(id,owner,at,types,name){return{id,owner,at,target:null,progress:0,eta:0,burn:0,order:'待機',name,commander:null,ships:types.map((t,i)=>({id:`${id}-${i}`,type:t,hp:SHIPS[t].hp,fuel:SHIPS[t].maxFuel}))}}
function newGame(){let ps=[];for(let i=0;i<20;i++){let p;do{p=planet(i)}while(ps.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<8));ps.push(p)}Object.assign(ps[0],{x:100,y:100,name:'プロキオン首都星',type:'earth',ore:50,deut:50,cap:600,pop:300,owner:'player',explored:true,defense:30,fuel:500,materials:500,usable:true,dock:1,dockPool:[],battery:1,security:100,fac:{ore:0,fuel:0,housing:0,defbase:0,dock:1,probe:0,battery:1,storage:0},buildQueue:null,shipQueue:[],homeworld:false});
 // 初期到達可能な未踏・利用可能・無所属星系を最低3つ、探査船航続圏内に確保する（4-1）
 const scoutRange=SHIPS.scout.maxFuel/Math.max(.5,1-85*.004);const near=ps.slice(1).sort((a,b)=>dist(ps[0],a)-dist(ps[0],b));let secured=0;for(const p of near){if(secured>=3)break;if(dist(ps[0],p)<=scoutRange*0.9){p.usable=true;p.owner=null;secured++}}
 const rest=ps.slice(1).filter(p=>!(dist(ps[0],p)<=scoutRange*0.9&&secured>0)).sort(()=>Math.random()-.5);['zora','mira','nox'].forEach((f,j)=>{const grp=rest.slice(j*3,j*3+3);grp.forEach((p,k)=>{p.owner=f;p.pop=rand(100,Math.min(p.cap,450));p.fuel=300;p.materials=300;p.usable=true;if(k===0)p.homeworld=true})});const people=['アレン・カイ','ミナ・ロウ','トウマ・レン','セラ・ノイン','ユナ・ベル','ガイル・オルド','リオ・サーン','エマ・ヴァル'].map((name,id)=>({id,name,pilot:rand(25,85),force:rand(25,85),diplomacy:rand(25,85),assignment:null,xp:0,rank:0}));const f=fleet(1,'player',0,['scout'],'第1探査艦隊'),best=[...people].sort((a,b)=>b.pilot-a.pilot)[0];f.commander=best.id;best.assignment=f.id;S={version:'2.01',year:1,turn:0,money:3000,planets:ps,fleets:[f],people,relations:{zora:0,mira:0,nox:0},contacted:{},nextFleet:2,nextPerson:people.length,won:false,collapsed:{},allied:{}};['zora','mira','nox'].forEach((fac,j)=>{const home=rest[j*3];S.fleets.push(fleet(100+j,fac,home.id,['battleship','battleship','transport'],`${FACS[fac][0]}防衛艦隊`))});sel={kind:'planet',id:0};route=null;history=[];log('星域統治を開始しました。惑星または艦隊を選択してください。','good');speed(1);render()}
function commander(f){return S.people.find(p=>p.id===f.commander)}function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}function fuelPct(s){return s.fuel/SHIPS[s.type].maxFuel*100}function fleetPct(f){return Math.min(...f.ships.map(fuelPct))}function range(f){const c=commander(f),factor=Math.max(.5,1-(c?c.pilot*.004:0));return Math.floor(Math.min(...f.ships.map(s=>s.fuel))/factor)}function routeInfo(f,pid){const d=dist(fleetMapPosition(f),S.planets[pid]),factor=Math.max(.5,1-(commander(f)?.pilot||0)*.004),need=Math.ceil(d*factor),sp=Math.min(...f.ships.map(s=>SHIPS[s.type].speed));return{d,need,turns:Math.max(2,Math.ceil(d/sp)),ok:d<=range(f)}}
const RANKS=[{name:'候補生',mark:'◇',xp:0},{name:'少尉',mark:'◆',xp:20},{name:'中尉',mark:'◆◆',xp:55},{name:'大尉',mark:'◆◆◆',xp:100},{name:'少佐',mark:'★',xp:170},{name:'中佐',mark:'★★',xp:260},{name:'大佐',mark:'★★★',xp:380}];
function rankOf(p){let r=RANKS[0];for(const x of RANKS)if((p.xp||0)>=x.xp)r=x;return r}
function nextRank(p){const r=rankOf(p),i=RANKS.indexOf(r);return RANKS[Math.min(i+1,RANKS.length-1)]}
function gainXp(fid,amount,reason){const f=S.fleets.find(x=>x.id===fid),p=f&&commander(f);if(!p)return;const before=rankOf(p).name;p.xp=(p.xp||0)+amount;const after=rankOf(p).name;if(before!==after)showResult('昇進',`<div class="resultBox"><span class="rankBadge">${rankOf(p).mark}</span> <b>${p.name}</b><br>${before}から${after}へ昇進しました。<br>${reason}で経験値${amount}を獲得。</div>`,()=>render());else log(`${p.name}が経験値${amount}を獲得しました。`,'info')}
function tick(){if(S.won)return;S.turn++;advanceConstruction();S.planets.filter(p=>p.owner==='player').forEach(p=>{p.materials=Math.min(storageCap(p),p.materials+oreProd(p));p.fuel=Math.min(storageCap(p),p.fuel+fuelProd(p))});S.fleets.forEach(f=>{if(f.target===null)return;if(f.ships.some(s=>s.fuel<f.burn)){f.target=null;f.order='燃料切れ・漂流';log(`${f.name}が燃料切れで漂流しました。`,'bad');return}f.ships.forEach(s=>s.fuel-=f.burn);if(++f.progress>=f.eta){f.at=f.target;f.target=null;f.progress=0;f.burn=0;(f.owner==='player'?arrive:npcArrive)(f)}});npcAI();if(S.turn>=100){S.turn=0;S.year++;let tax=0;S.planets.filter(p=>p.owner==='player').forEach(p=>{p.pop=Math.min(capEff(p),p.pop*1.012);tax+=Math.floor(p.pop/10)*100});S.money+=tax;annualRecruit();log(`${S.year}年。税収${tax}を獲得。`,'good')}if(S.turn%10===0)save(false);checkVictory();render()}
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
 if(f.order==='輸送'&&f.cargo){sel={kind:'planet',id:p.id};route=null;return unloadTransport(f,p)}
 if(f.order==='占領'&&p.owner&&p.owner!=='player'){sel={kind:'fleet',id:f.id};route=null;beginEncounter(f,p);return}f.order='待機';gainXp(f.id,12,'探査任務');sel={kind:'planet',id:p.id};route=null;render();
}
function showResult(title,body,onOk){modal(title,body,[['OK',()=>{closeModal();if(onOk)onOk()}]])}
function send(fid,pid,order){const f=S.fleets.find(x=>x.id===fid);if(f.commander===null)return log('司令官が必要です。司令官を任命してください。','warn');if(order==='輸送')return issueTransport(fid,pid);const r=routeInfo(f,pid);if(!r.ok)return log('航続力不足です。補給可能な惑星へ立ち寄ってください。','warn');f.target=pid;f.progress=0;f.eta=r.turns;f.burn=r.need/r.turns;f.order=order;log(`${f.name}に${order}命令を出しました。`,'info');if(order==='探査')showResult('探査命令',`<div class="resultBox"><b>${f.name}</b><br>${S.planets[pid].explored?S.planets[pid].name:`未踏星系-${pid}`}へ探査命令を出しました。<br>距離 ${r.d.toFixed(1)} / 到着予定 ${r.turns}ターン</div>`,()=>render())}
function contact(fid,p){S.contacted[fid]=true;modal(`${FACS[fid][0]}と接触`,`<p>${p.name}で通信を受信しました。</p><div class="buttons"><button data-c="25">友好的に呼びかける</button><button data-c="5">中立的に観察</button><button data-c="-50">敵対を宣言</button></div>`,[]);$('modalBody').querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{S.relations[fid]=+b.dataset.c;const value=+b.dataset.c;showResult('外交方針を決定',`<div class="resultBox">${FACS[fid][0]}との関係値を <b>${value}</b> に設定しました。</div>`,()=>{log(`関係値を${value}に設定しました。`,'info');finishArrival(S.fleets.find(x=>x.owner==='player'&&x.at===p.id),p)})})}
function render(){stats();draw();fleetList();diplomacy();detail()}function stats(){$('stats').innerHTML=`<span>${S.year}年 ${S.turn}/100</span><span>資金 ${Math.floor(S.money)}</span><span>人口 ${Math.floor(S.planets.filter(p=>p.owner==='player').reduce((n,p)=>n+p.pop,0))}万</span><span>資材 ${Math.floor(S.planets.filter(p=>p.owner==='player').reduce((n,p)=>n+p.materials,0))}</span><span>燃料 ${Math.floor(S.planets.filter(p=>p.owner==='player').reduce((n,p)=>n+p.fuel,0))}</span>`}
function gauge(p){const c=p<20?'low':p<50?'mid':'';return `<div class="fuel ${c}"><i style="width:${p}%"></i></div>`}function fleetList(){$('fleets').innerHTML='';S.fleets.filter(f=>f.owner==='player').forEach(f=>{const b=document.createElement('button');b.className=`card ${sel.kind==='fleet'&&sel.id===f.id?'selected':''}`;b.innerHTML=`<b>${f.name}</b><br>${f.ships.length}隻｜${f.order}<br>司令官：${commander(f)?.name||'未任命'}${gauge(fleetPct(f))}`;b.onclick=()=>{sel={kind:'fleet',id:f.id};route=null;render()};$('fleets').appendChild(b)})}
function diplomacy(){$('diplomacy').innerHTML='';['zora','mira','nox'].forEach(f=>{const b=document.createElement('button');b.className='card';const st=S.collapsed[f]?'崩壊（独立国化）':S.allied[f]?'同盟':S.contacted[f]?`関係 ${S.relations[f]}`:'不明';b.innerHTML=`<b>${S.contacted[f]||S.collapsed[f]?FACS[f][0]:'未接触勢力'}</b><br>${st}`;if(S.contacted[f]&&!S.collapsed[f])b.onclick=()=>openFactionDiplomacy(f);$('diplomacy').appendChild(b)})}
function detail(){if(sel.kind==='fleet'){const f=S.fleets.find(x=>x.id===sel.id),r=route?routeInfo(f,route.pid):null;$('detail').innerHTML=`<h3>${f.name}</h3><div class="row"><span>現在地</span><b>${S.planets[f.at].explored?S.planets[f.at].name:'未確認'}</b></div><div class="row"><span>司令官</span><b>${commander(f)?.name||'未任命'}</b></div><div class="row"><span>航続力</span><b>${range(f)}</b></div><h2>燃料</h2>${f.ships.map(s=>`<div>${SHIPS[s.type].name} ${Math.floor(s.fuel)}/${SHIPS[s.type].maxFuel}${gauge(fuelPct(s))}</div>`).join('')}`;$('actions').innerHTML=`<div class="command"><b>艦隊命令</b><select id="cmd"><option>移動</option><option ${f.ships.some(s=>s.type==='scout')?'':'disabled'}>探査</option><option ${f.ships.some(s=>s.type==='battleship')?'':'disabled'}>惑星防衛</option><option ${f.ships.some(s=>s.type==='transport')?'':'disabled'}>輸送</option><option>占領</option><option ${f.ships.some(s=>s.type==='battleship')?'':'disabled'}>迎撃</option></select><select id="dest"><option value="" ${route?'':'selected'}>目的地を選択</option>${S.planets.map(p=>{const q=routeInfo(f,p.id);return `<option value="${p.id}" ${route?.pid===p.id?'selected':''}>${q.ok?'○':'×'} ${p.explored?p.name:`未踏星系-${p.id}`} 距離${q.d.toFixed(1)}</option>`}).join('')}</select>${r?`<div class="${r.ok?'routeOk':'routeWarning'}">${r.ok?'航続距離内':'警告：航続距離外'}<br>距離 ${r.d.toFixed(1)} / 航続力 ${range(f)} / ${r.turns}T</div>`:'<div class="routeOk">目的地を選択すると航続距離円を表示します。</div>'}<button id="issue" ${r&&r.ok?'':'disabled'}>命令を実行</button></div><button id="assign">司令官を任命</button><button id="closeFleetDetail" class="primary">OK（基本画面に戻る）</button>`;$('dest').onchange=e=>{const pid=+e.target.value;route={fid:f.id,pid};const q=routeInfo(f,pid);if(!q.ok)log(`警告：${S.planets[pid].explored?S.planets[pid].name:`未踏星系-${pid}`}は航続距離外です。選択は保持しますが出航できません。`,'warn');detail();draw()};$('issue').onclick=()=>{if(!$('dest').value)return log('目的地を選択してください。','warn');send(f.id,+$('dest').value,$('cmd').value)};$('assign').onclick=()=>openRoster(f.id);$('closeFleetDetail').onclick=()=>returnToBasicMap(f.at);return}const p=S.planets[sel.id];if(p.explored&&!p.usable){$('detail').innerHTML=`<h3>${p.name}</h3><p class="barren">利用可能な惑星なし</p><div class="row"><span>領有</span><b>不可</b></div><div class="row"><span>補給</span><b>不可</b></div>`;$('actions').innerHTML='';return}$('detail').innerHTML=p.explored?`<h3>${p.name}</h3><div class="row"><span>種類</span><b>${TYPES[p.type][0]}</b></div><div class="row"><span>所属</span><b>${p.owner?FACS[p.owner][0]:'無所属'}</b></div><div class="row"><span>人口</span><b>${Math.floor(p.pop)}万 / ${p.cap}万</b></div><div class="row"><span>鉱石 / 重水素</span><b>${p.ore} / ${p.deut}</b></div><div class="row"><span>補給</span><b>${canRefuel(p)?'可能':'不可'}</b></div>`:`<h3>未踏星系-${p.id}</h3><p>詳細不明</p>`;$('actions').innerHTML=!p.explored?S.fleets.filter(f=>f.owner==='player'&&f.ships.some(s=>s.type==='scout')).map(f=>`<button data-scout="${f.id}">${f.name}で探査</button>`).join(''):'';$('actions').querySelectorAll('[data-scout]').forEach(b=>b.onclick=()=>send(+b.dataset.scout,p.id,'探査'))}
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
function mapScale(w,h){const s=Math.min(w,h)/200;return{s,offX:(w-200*s)/2,offY:(h-200*s)/2}}
function draw(){const w=map.clientWidth,h=map.clientHeight,d=devicePixelRatio||1;map.width=w*d;map.height=h*d;ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);const {s,offX,offY}=mapScale(w,h);const SX=px=>px*s+offX,SY=py=>py*s+offY;for(let i=0;i<100;i++){ctx.fillStyle='#ffffff44';ctx.fillRect((i*137%1000)/1000*w,(i*83%700)/700*h,1,1)}S.planets.forEach(p=>{const x=SX(p.x),y=SY(p.y);ctx.beginPath();ctx.arc(x,y,sel.kind==='planet'&&sel.id===p.id?12:8,0,7);ctx.fillStyle=p.explored?TYPES[p.type][1]:'#718092';ctx.fill();if(p.explored&&p.owner){ctx.strokeStyle=(FACS[p.owner]||['',''])[1]||'#9fb3c2';ctx.lineWidth=3;ctx.stroke()}ctx.fillStyle='#bfd0dc';ctx.font='10px system-ui';ctx.fillText(p.explored?p.name:`未踏星系-${p.id}`,x+11,y+3)});if(sel.kind==='fleet'&&route){const f=S.fleets.find(x=>x.id===sel.id),pos=fleetMapPosition(f),x=SX(pos.x),y=SY(pos.y),radius=range(f)*s;ctx.save();ctx.strokeStyle='#5dd7ffcc';ctx.fillStyle='#5dd7ff12';ctx.setLineDash([6,5]);ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.setLineDash([]);const p=S.planets[route.pid],r=routeInfo(f,p.id);ctx.strokeStyle=r.ok?'#71df9c':'#ff7078';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(SX(p.x),SY(p.y));ctx.stroke();ctx.fillStyle='#5dd7ff';ctx.font='10px system-ui';ctx.fillText(`航続力 ${range(f)}`,x+10,y-radius+12);ctx.restore()}S.fleets.filter(f=>f.owner==='player'||fleetDetectable(f)).forEach(f=>{const pos=fleetMapPosition(f),x=SX(pos.x),y=SY(pos.y),col=(FACS[f.owner]||['','#5dd7ff'])[1]||'#5dd7ff';ctx.fillStyle=f.owner==='player'?'#ffffff':'#0a1622';ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y-8);ctx.lineTo(x+7,y+7);ctx.lineTo(x-7,y+7);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=col;ctx.font='9px system-ui';ctx.fillText(f.owner==='player'?f.name:(FACS[f.owner]||['敵'])[0]+'艦隊',x+9,y+3)})}
function selectPlanet(e){const r=map.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,{s,offX,offY}=mapScale(r.width,r.height);let best=null,bd=16;S.planets.forEach(p=>{const d=Math.hypot(p.x*s+offX-x,p.y*s+offY-y);if(d<bd){best=p;bd=d}});if(!best)return log('惑星の丸印をクリックしてください。','warn');sel={kind:'planet',id:best.id};route=null;log(`${best.explored?best.name:`未踏星系-${best.id}`}を選択しました。`,'info');render()}
function openRoster(fid=null){
 modal('人事名簿',`<table class="roster"><tr><th>階級章</th><th>階級・名前</th><th>経験値</th><th>操艦</th><th>武力</th><th>外交</th><th></th></tr>${S.people.map(p=>{const r=rankOf(p),n=nextRank(p),pct=r===n?100:Math.min(100,((p.xp-r.xp)/(n.xp-r.xp))*100);return `<tr><td><span class="rankBadge">${r.mark}</span></td><td><b>${r.name}</b><br>${p.name}</td><td>${p.xp||0}${r!==n?` / ${n.xp}`:''}<div class="xpbar"><i style="width:${pct}%"></i></div></td><td>${p.pilot}</td><td>${p.force}</td><td>${p.diplomacy}</td><td>${fid!==null?`<button data-person="${p.id}" ${p.assignment?'disabled':''}>任命</button>`:''}</td></tr>`}).join('')}</table>`,[['OK',closeModal]]);
 $('modalBody').querySelectorAll('[data-person]').forEach(b=>b.onclick=()=>{const f=S.fleets.find(x=>x.id===fid),p=S.people.find(x=>x.id===+b.dataset.person);if(f.commander!==null)S.people.find(x=>x.id===f.commander).assignment=null;f.commander=p.id;p.assignment=f.id;showResult('司令官任命',`<div class="resultBox"><span class="rankBadge">${rankOf(p).mark}</span> <b>${rankOf(p).name} ${p.name}</b><br>${f.name}の司令官に任命しました。</div>`,()=>{log(`${p.name}を${f.name}の司令官に任命しました。`,'good');render()})});
}
function openSystems(){const base=sel.kind==='fleet'?S.planets[S.fleets.find(f=>f.id===sel.id).at]:S.planets.find(p=>p.owner==='player'),f=sel.kind==='fleet'?S.fleets.find(x=>x.id===sel.id):null;let rows=S.planets.map(p=>({p,d:dist(base,p)}));const filter=$('sysFilter')?.value||listState.filter,sort=$('sysSort')?.value||listState.sort;listState={filter,sort};if(filter==='mine')rows=rows.filter(x=>x.p.owner==='player');if(filter==='supply')rows=rows.filter(x=>x.p.explored&&canRefuel(x.p));if(filter==='unexplored')rows=rows.filter(x=>!x.p.explored);rows.sort((a,b)=>sort==='name'?(a.p.explored?a.p.name:`未踏星系-${a.p.id}`).localeCompare(b.p.explored?b.p.name:`未踏星系-${b.p.id}`,'ja'):sort==='population'?b.p.pop-a.p.pop:a.d-b.d);modal('星系一覧',`<div class="toolbar"><select id="sysSort"><option value="distance">距離順</option><option value="name" ${sort==='name'?'selected':''}>名前順</option><option value="population" ${sort==='population'?'selected':''}>人口順</option></select><select id="sysFilter"><option value="all">すべて</option><option value="mine" ${filter==='mine'?'selected':''}>自国</option><option value="supply" ${filter==='supply'?'selected':''}>補給可能</option><option value="unexplored" ${filter==='unexplored'?'selected':''}>未探査</option></select><span>距離基準：${base.name}</span></div><div class="systems"><div class="syshead"><span>星系</span><span>所属・種類</span><span>人口</span><span>資源</span><span>距離・航続</span><span></span></div>${rows.map(x=>systemRow(x.p,x.d,f)).join('')}</div>`,[['閉じる',closeModal]]);$('sysSort').onchange=openSystems;$('sysFilter').onchange=openSystems;$('modalBody').querySelectorAll('[data-system]').forEach(b=>b.onclick=()=>{sel={kind:'planet',id:+b.dataset.system};closeModal();render()})}
function systemRow(p,d,f){if(!p.explored)return `<button class="sysrow" data-system="${p.id}"><span><b>未踏星系-${p.id}</b><small>未探査</small></span><span>不明</span><span>不明</span><span>不明</span><span>距離 ${d.toFixed(1)}${f?`<small>${routeInfo(f,p.id).ok?'到達可能':'航続力不足'}</small>`:''}</span><span>選択</span></button>`;if(!p.usable)return `<button class="sysrow" data-system="${p.id}"><span><b>${p.name}</b><small>探査済み</small></span><span>利用可能な惑星なし</span><span>-</span><span>-</span><span>距離 ${d.toFixed(1)}</span><span>選択</span></button>`;return `<button class="sysrow" data-system="${p.id}"><span><b>${p.name}</b></span><span>${p.owner?FACS[p.owner][0]:'無所属'}<small>${TYPES[p.type][0]} / 補給${canRefuel(p)?'可':'不可'}</small></span><span>${Math.floor(p.pop)}万</span><span>鉱${p.ore} / 重${p.deut}<small>防衛${p.defense}</small></span><span>距離 ${d.toFixed(1)}${f?`<small>${routeInfo(f,p.id).ok?'到達可能':'航続力不足'} / ${routeInfo(f,p.id).turns}T</small>`:''}</span><span>選択</span></button>`}
const BUILD_TIME={scout:18,transport:28,battleship:45};
function dockBuildSlots(p){return 1+facLv(p,'dock')}
function build(type,planetId){
 const d=SHIPS[type];const dp=planetId!=null?S.planets[planetId]:S.planets.filter(p=>p.owner==='player'&&facLv(p,'dock')>0).sort((a,b)=>facLv(b,'dock')-facLv(a,'dock'))[0];
 if(!dp||facLv(dp,'dock')<1)return log('造船ドックがありません。造船ドックを建築してください。','warn');
 if(S.money<d.cost[0]||dp.materials<d.cost[1])return log(`資金または資材不足です（必要 資金${d.cost[0]}/資材${d.cost[1]}、${dp.name}保有 資材${Math.floor(dp.materials)}）。`,'warn');
 dp.shipQueue=dp.shipQueue||[];
 if(dp.shipQueue.length>=dockBuildSlots(dp))return log(`${dp.name}の造船枠が埋まっています（${dp.shipQueue.length}/${dockBuildSlots(dp)}）。ドックLvを上げると枠が増えます。`,'warn');
 S.money-=d.cost[0];dp.materials-=d.cost[1];
 dp.shipQueue.push({type,turnsLeft:BUILD_TIME[type]});
 showResult('建造開始',`<div class="resultBox"><b>${d.name}</b>の建造を${dp.name}で開始しました。<br>必要資金 ${d.cost[0]} / 必要資材 ${d.cost[1]}（消費済み）<br>完成まで ${BUILD_TIME[type]}ターン。即時完成はしません。完成後は造船ドックのプールへ収容され、艦隊へは手動補充します。</div>`,()=>render());
}
function openDock(){
 const docks=S.planets.filter(p=>p.owner==='player'&&facLv(p,'dock')>0);
 if(!docks.length){modal('造船ドック','<p>造船ドックがありません。施設建築で「造船ドック」を建てると、建造・収容・補充・修理が可能になります。</p>',[['OK',closeModal]]);return}
 const body=docks.map(p=>{const local=S.fleets.filter(f=>f.owner==='player'&&f.at===p.id&&f.target===null),localOpen=local.filter(f=>f.ships.length<10),pool=p.dockPool||[],q=p.shipQueue||[],damaged=[];local.forEach(f=>f.ships.forEach(s=>{if(s.hp<SHIPS[s.type].hp)damaged.push(1)}));
  return `<h3>${p.name} 造船ドック Lv${facLv(p,'dock')}</h3><div class="dockGrid">`+
   `<div class="dockShip"><div><b>建造</b><br>枠 ${q.length}/${dockBuildSlots(p)}｜保有資材 ${Math.floor(p.materials)}</div><div>`+['scout','battleship','transport'].map(t=>`<button data-buildhere="${t}" data-planet="${p.id}">${SHIPS[t].name}(${BUILD_TIME[t]}T)</button>`).join(' ')+`</div></div>`+
   (q.length?`<div class="dockShip"><div><b>建造中</b><br>${q.map(x=>`${SHIPS[x.type].name} 残${x.turnsLeft}T`).join('<br>')}</div><div>キュー</div></div>`:'')+
   (pool.length?pool.map(ship=>`<div class="dockShip"><div><b>${SHIPS[ship.type].name}</b><br>耐久${ship.hp} / 燃料${ship.fuel}</div><select data-dockship="${ship.id}" data-planet="${p.id}"><option value="">補充先艦隊</option>${localOpen.map(f=>`<option value="${f.id}">${f.name} (${f.ships.length}/10)</option>`).join('')}</select></div>`).join(''):'<div class="dockShip"><div>プール中の船はありません。</div><div></div></div>')+
   (!localOpen.length&&pool.length?'<div class="routeWarning">この惑星に待機中（10隻未満）の自国艦隊がないため補充できません。</div>':'')+
   (damaged.length?`<div class="dockShip"><div><b>修理</b><br>損傷艦 ${damaged.length}隻</div><div><button data-repair="${p.id}">全艦修理（資材消費）</button></div></div>`:'<div class="dockShip"><div><b>修理</b><br>損傷艦なし</div><div></div></div>')+
   `</div>`}).join('');
 modal('造船ドック',body,[['OK',closeModal]]);
 $('modalBody').querySelectorAll('[data-buildhere]').forEach(b=>b.onclick=()=>build(b.dataset.buildhere,+b.dataset.planet));
 $('modalBody').querySelectorAll('[data-dockship]').forEach(sl=>sl.onchange=()=>{if(!sl.value)return;assignDockShip(+sl.dataset.planet,sl.dataset.dockship,+sl.value)});
 $('modalBody').querySelectorAll('[data-repair]').forEach(b=>b.onclick=()=>repairAt(+b.dataset.planet));
}
function assignDockShip(planetId,shipId,fid){
 const p=S.planets[planetId],f=S.fleets.find(x=>x.id===fid);if(!f||f.at!==planetId||f.target!==null)return log('ドックのある惑星に待機中の艦隊が必要です。','warn');if(f.ships.length>=10)return log('艦隊は10隻上限です。','warn');const i=(p.dockPool||[]).findIndex(x=>x.id===shipId);if(i<0)return;const ship=p.dockPool.splice(i,1)[0];f.ships.push(ship);showResult('艦隊補充',`<div class="resultBox"><b>${SHIPS[ship.type].name}</b>を${f.name}へ補充しました。</div>`,()=>render());
}
const SAVE_KEY='planetGovernorV201',OLD_KEYS=['planetGovernorV100'];
function migrateSave(d){if(!d||typeof d!=='object')return d;d.version=d.version||'migrated';d.won=d.won||false;d.allied=d.allied||{};d.collapsed=d.collapsed||{};if(d.nextPerson==null)d.nextPerson=(d.people&&d.people.length)||0;(d.planets||[]).forEach(p=>{p.fac=p.fac||{ore:0,fuel:0,housing:0,defbase:0,dock:p.dock||0,probe:0,battery:0,storage:0};if(p.buildQueue===undefined)p.buildQueue=null;p.shipQueue=p.shipQueue||[];if(p.homeworld===undefined)p.homeworld=false;p.dockPool=p.dockPool||[]});return d}
function save(manual){S.version='2.01';localStorage.setItem(SAVE_KEY,JSON.stringify(S));if(manual)log('ゲームを保存しました。','good')}
function load(){let raw=localStorage.getItem(SAVE_KEY),from=SAVE_KEY;if(!raw){for(const k of OLD_KEYS){const r=localStorage.getItem(k);if(r){raw=r;from=k;break}}}if(!raw)return log('セーブデータがありません。','warn');let d;try{d=JSON.parse(raw)}catch(e){return log('セーブデータが破損しており読み込めません。','bad')}d=migrateSave(d);S=d;closeModal();render();log(`セーブを読み込みました。${from!==SAVE_KEY?'（旧形式を移行）':''}`,'good')}
function saveMenu(){modal('セーブ管理','<p>自動セーブ：10ターンごと（キー：'+SAVE_KEY+'）</p><p>旧v1.3.2セーブは読込時に自動移行します。</p>',[['手動セーブ',()=>{save(true);closeModal()}],['読込',load],['削除',()=>{localStorage.removeItem(SAVE_KEY);OLD_KEYS.forEach(k=>localStorage.removeItem(k));closeModal();log('セーブを削除しました。','warn')}],['閉じる',closeModal]])}
function log(text,kind='info'){history.unshift({text,kind,year:S?.year||1,turn:S?.turn||0});$('notice').innerHTML=`<span class="${kind}">${S?.year||1}年${S?.turn||0}T：${text}</span>`}function modal(title,body,buttons){speed(0);$('modalTitle').textContent=title;$('modalBody').innerHTML=body;$('modalButtons').innerHTML='';buttons.forEach(([t,fn])=>{const b=document.createElement('button');b.textContent=t;b.onclick=fn;$('modalButtons').appendChild(b)});$('modal').classList.remove('hidden')}function closeModal(){$('modal').classList.add('hidden')}function speed(v){clearInterval(timer);document.querySelectorAll('[data-speed]').forEach(b=>b.classList.toggle('active',+b.dataset.speed===v));if(v)timer=setInterval(tick,3000/v)}
// v1.3.2 battle and occupation module
Object.assign(SHIPS.scout,{def:5,accuracy:65,evasion:35,troops:0});
Object.assign(SHIPS.battleship,{def:25,accuracy:75,evasion:10,troops:0});
Object.assign(SHIPS.transport,{def:8,accuracy:50,evasion:15,troops:40});
let battle=null;
function hostile(a,b){if(a===b)return false;if((a==='player'&&S.allied&&S.allied[b])||(b==='player'&&S.allied&&S.allied[a]))return false;if(a==='independent'||b==='independent')return true;if(a==='player')return (S.relations[b]||0)<0;if(b==='player')return (S.relations[a]||0)<0;return true}
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
 battle=null;showResult(title,body,()=>{if(win){gainXp(a.id,15+(enemyDestroyed?8:0),'艦隊戦');if(after)after()}else if(retreated){log(`${a.name}は撤退しました。`,'warn');render()}else{killCommander(a,'艦隊戦敗北');log(`${a.name}は戦闘に敗北しました。`,'bad');render()}});
}
function beginOccupation(f,p){
 if(p.owner==='player'||!p.owner)return showResult('占領不可',`<div class="resultBox">${p.name}は占領対象ではありません（無所属または自国）。</div>`,()=>render());
 if(!f.ships.length)return showResult('占領不可','<div class="resultBox">攻略艦隊に艦艇がありません。</div>',()=>render());
 speed(0);const orbital=(p.battery||0)*100,ground=Math.max(10,p.defense+Math.floor(p.pop/20));battle={kind:'occupation',fleet:f,planet:p,step:'orbital',orbitalHp:orbital,groundHp:ground,round:0,logs:[]};
 if(!f.ships.some(s=>s.type==='transport'))battle.logs.push('警告：輸送船がいないため占領力が低く、失敗の可能性が高いです。');
 renderOccupation();
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
 if(!f.ships.length)return finishOccupation(false,'攻略艦隊が全滅しました。');
 renderOccupation();
}
function damageOne(f,dmg){const target=pick(f.ships);target.hp-=dmg;if(target.hp<=0){f.ships=f.ships.filter(x=>x!==target);battle.logs.push(`${SHIPS[target.type].name}が撃沈された。`)}}
function resolveOccupation(){const b=battle,f=b.fleet,p=b.planet,c=commander(f),troops=f.ships.reduce((n,s)=>n+(SHIPS[s.type].troops||0),0),base=f.ships.length*4,power=(troops+base)*(1+(c?.force||40)/200),resist=Math.max(20,p.pop/15+p.security*.25);finishOccupation(power>=resist,`占領力 ${Math.round(power)} / 抵抗力 ${Math.round(resist)}`)}
function finishOccupation(success,detail){const b=battle,f=b.fleet,p=b.planet,wasHome=p.homeworld,oldOwner=p.owner;battle=null;if(f)f.order='待機';if(success){p.owner='player';p.explored=true;p.homeworld=false;p.pop=Math.max(1,p.pop*(.85+Math.random()*.1));p.defense=10;p.security=30;p.battery=0;p.fac=p.fac||{ore:0,fuel:0,housing:0,defbase:0,dock:0,probe:0,battery:0,storage:0};if(oldOwner&&oldOwner!=='independent')S.relations[oldOwner]=-100;const cap=Math.min(300,Math.floor(20+p.pop/8));p.materials=Math.min(storageCap(p),(p.materials||0)+cap);p.fuel=Math.min(storageCap(p),(p.fuel||0)+cap);gainXp(f.id,30,'惑星占領');showResult('占領成功',`<div class="resultBox"><b>${p.name}を占領しました。</b><br>${detail}<br>人口 ${Math.floor(p.pop)}万 / 治安 ${p.security}<br>鹵獲資材・燃料 各${cap}${wasHome&&oldOwner&&oldOwner!=='independent'?'<br>これは敵勢力の母星でした。':''}</div>`,()=>{if(wasHome&&oldOwner&&oldOwner!=='independent'){collapseFaction(oldOwner);checkVictory()}sel={kind:'planet',id:p.id};render()})}else{killCommander(f,'惑星攻略失敗');showResult('占領失敗',`<div class="resultBox"><b>${p.name}の攻略に失敗しました。</b><br>${detail}</div>`,()=>render())}}
// ================= v2.01 追補モジュール（既存機能は保持、以下は追加） =================
FACS.independent=['独立国','#9fb3c2'];
const FAC={
 ore:{name:'鉱石プラント',cost:[300,120],time:12,desc:'資材生産強化'},
 fuel:{name:'燃料プラント',cost:[300,120],time:12,desc:'燃料生産強化'},
 housing:{name:'居住区',cost:[400,150],time:16,desc:'人口上限増加'},
 defbase:{name:'防衛基地',cost:[350,140],time:14,desc:'惑星防衛力増加'},
 dock:{name:'造船ドック',cost:[600,220],time:20,desc:'造船・収容・修理・枠増加'},
 probe:{name:'探査基地',cost:[350,120],time:14,desc:'敵艦隊探知範囲増加'},
 battery:{name:'軌道砲台',cost:[500,180],time:16,desc:'惑星防衛戦の軌道防衛力増加'},
 storage:{name:'貯蔵ステーション',cost:[300,100],time:12,desc:'備蓄上限増加'}
};
const GAS_OK=['fuel','dock','probe','battery','storage'];
function facAllowed(p,key){return p.type==='gas'?GAS_OK.includes(key):true}
function facLv(p,key){return p&&p.fac?p.fac[key]||0:0}
function oreProd(p){return (p.ore*(1+0.35*facLv(p,'ore')))*.02}
function fuelProd(p){return (p.deut*(1+0.35*facLv(p,'fuel')))*.02}
function storageCap(p){return 1000+400*facLv(p,'storage')}
function capEff(p){return p.cap+150*facLv(p,'housing')}
function advanceConstruction(){S.planets.filter(p=>p.owner==='player').forEach(p=>{
 if(p.buildQueue){if(--p.buildQueue.turnsLeft<=0){const k=p.buildQueue.key;p.fac[k]=(p.fac[k]||0)+1;if(k==='dock')p.dock=p.fac.dock;if(k==='battery')p.battery=(p.battery||0)+1;log(`${p.name}で${FAC[k].name}が完成しました（Lv${p.fac[k]}）。`,'good');p.buildQueue=null;}}
 if(p.shipQueue&&p.shipQueue.length){p.shipQueue.forEach(q=>q.turnsLeft--);const done=p.shipQueue.filter(q=>q.turnsLeft<=0);if(done.length){p.dockPool=p.dockPool||[];done.forEach(q=>{const d=SHIPS[q.type];p.dockPool.push({id:`dock-${Date.now()}-${Math.random()}`,type:q.type,hp:d.hp,fuel:d.maxFuel});log(`${p.name}で${d.name}が完成し、造船ドックプールへ収容しました。`,'good')});p.shipQueue=p.shipQueue.filter(q=>q.turnsLeft>0);}}
})}
function buildFacility(pid,key){const p=S.planets[pid],c=FAC[key];
 if(p.owner!=='player'||!p.explored||!p.usable)return log('自国の探査済み・利用可能な星系にのみ建築できます。','warn');
 if(!facAllowed(p,key))return log(`${TYPES[p.type][0]}には${c.name}を建築できません。`,'warn');
 if(facLv(p,key)>=5)return log(`${c.name}は最大Lv5です。`,'warn');
 if(p.buildQueue)return log(`${p.name}は建築中（${FAC[p.buildQueue.key].name} 残${p.buildQueue.turnsLeft}T）です。1星系につき同時1件です。`,'warn');
 if(S.money<c.cost[0]||p.materials<c.cost[1])return log(`資金または資材不足（必要 資金${c.cost[0]}/資材${c.cost[1]}、${p.name}資材${Math.floor(p.materials)}）。`,'warn');
 S.money-=c.cost[0];p.materials-=c.cost[1];p.buildQueue={key,turnsLeft:c.time,toLv:facLv(p,key)+1};
 showResult('建築開始',`<div class="resultBox">${p.name}で<b>${c.name} Lv${facLv(p,key)+1}</b>の建築を開始しました。<br>必要資金 ${c.cost[0]} / 必要資材 ${c.cost[1]}（消費済み）<br>完成まで ${c.time}ターン。即時完成はしません。</div>`,()=>openFacilities(pid));
}
function openFacilities(pid){const owned=S.planets.filter(p=>p.owner==='player'&&p.explored&&p.usable);if(!owned.length)return modal('施設建築','<p>建築可能な自国星系がありません。</p>',[['OK',closeModal]]);
 let cur=pid!=null?S.planets[pid]:(sel.kind==='planet'&&S.planets[sel.id]&&S.planets[sel.id].owner==='player'?S.planets[sel.id]:owned[0]);if(!owned.includes(cur))cur=owned[0];
 const tabs=owned.map(p=>`<button data-factab="${p.id}" ${p.id===cur.id?'class="active"':''}>${p.name}</button>`).join(' ');
 const q=cur.buildQueue;
 const grid=Object.keys(FAC).map(k=>{const c=FAC[k],lv=facLv(cur,k),allowed=facAllowed(cur,k),max=lv>=5,busy=!!cur.buildQueue,afford=S.money>=c.cost[0]&&cur.materials>=c.cost[1];let reason='';if(!allowed)reason=`${TYPES[cur.type][0]}には建築不可`;else if(max)reason='最大Lv5に到達';else if(busy)reason='建築枠が使用中（同時1件）';else if(!afford)reason=`資金/資材不足（要 資金${c.cost[0]}/資材${c.cost[1]}）`;const canBuild=allowed&&!max&&!busy&&afford;return `<div class="dockShip"><div><b>${c.name}</b> Lv${lv}/5<br><small>${c.desc}｜資金${c.cost[0]}/資材${c.cost[1]}/${c.time}T</small>${reason?`<br><small class="warn">理由：${reason}</small>`:''}</div><div><button data-facbuild="${k}" data-planet="${cur.id}" ${canBuild?'':'disabled'}>${max?'MAX':lv>0?'増設':'建築'}</button></div></div>`}).join('');
 modal('施設建築',`<div class="toolbar">${tabs}</div><div class="resultBox">${cur.name}（${TYPES[cur.type][0]}）｜資材 ${Math.floor(cur.materials)}/${storageCap(cur)}｜燃料 ${Math.floor(cur.fuel)}/${storageCap(cur)}｜人口 ${Math.floor(cur.pop)}/${capEff(cur)}万${q?`<br>建築中：${FAC[q.key].name} Lv${q.toLv} 残${q.turnsLeft}T`:''}</div><div class="dockGrid">${grid}</div>`,[['OK',closeModal]]);
 $('modalBody').querySelectorAll('[data-factab]').forEach(b=>b.onclick=()=>openFacilities(+b.dataset.factab));
 $('modalBody').querySelectorAll('[data-facbuild]').forEach(b=>b.onclick=()=>buildFacility(+b.dataset.planet,b.dataset.facbuild));
}
// ---- 資源輸送（4-12） ----
function transportCapacity(f){return f.ships.filter(s=>s.type==='transport').length*200}
function issueTransport(fid,pid){const f=S.fleets.find(x=>x.id===fid),src=S.planets[f.at],dest=S.planets[pid];
 if(!f.ships.some(s=>s.type==='transport'))return log('輸送には輸送船が必要です。','warn');
 if(src.owner!=='player')return log('積込元が自国星系ではありません。輸送は自国星系間のみ可能です。','warn');
 if(!dest.explored||dest.owner!=='player')return log('輸送先は自国の探査済み星系である必要があります。','warn');
 if(src.id===dest.id)return log('輸送元と輸送先が同一です。','warn');
 const r=routeInfo(f,pid);if(!r.ok)return log('航続力不足です。補給可能な惑星へ立ち寄ってください。','warn');
 const capL=transportCapacity(f);
 modal('資源輸送',`<div class="resultBox">${src.name} → ${dest.name}<br>積載上限 ${capL}<br>輸送元 資材 ${Math.floor(src.materials)} / 燃料 ${Math.floor(src.fuel)}</div><div class="command"><label>資材 <input id="tMat" type="number" value="0" min="0"></label><label>燃料 <input id="tFuel" type="number" value="0" min="0"></label><button id="tGo">積み込んで出航</button></div>`,[['キャンセル',()=>{closeModal();render()}]]);
 $('tGo').onclick=()=>{let mat=Math.max(0,Math.floor(+$('tMat').value||0)),fu=Math.max(0,Math.floor(+$('tFuel').value||0));if(mat+fu<=0)return log('積載量を入力してください。','warn');if(mat+fu>capL)return log(`積載上限 ${capL} を超えています。`,'warn');mat=Math.min(mat,Math.floor(src.materials));fu=Math.min(fu,Math.floor(src.fuel));src.materials-=mat;src.fuel-=fu;f.cargo={mat,fuel:fu,from:src.id,to:dest.id};f.target=pid;f.progress=0;f.eta=r.turns;f.burn=r.need/r.turns;f.order='輸送';closeModal();showResult('輸送開始',`<div class="resultBox">${src.name}から${dest.name}へ 資材${mat} / 燃料${fu} を積載し出航しました。<br>到着まで ${r.turns}ターン。</div>`,()=>render())};
}
function unloadTransport(f,p){const c=f.cargo;f.cargo=null;f.order='待機';if(p.owner!=='player'){log('輸送先が自国ではなくなったため荷降ろしできません。','warn');sel={kind:'planet',id:p.id};route=null;return render()}const mAdd=Math.min(c.mat,Math.max(0,storageCap(p)-p.materials)),fAdd=Math.min(c.fuel,Math.max(0,storageCap(p)-p.fuel));p.materials+=mAdd;p.fuel+=fAdd;const lost=(c.mat-mAdd)+(c.fuel-fAdd);const cm=commander(f);if(cm)cm.xp=(cm.xp||0)+8;showResult('輸送完了',`<div class="resultBox">${(S.planets[c.from]&&S.planets[c.from].name)||'元星系'} → ${p.name}<br>荷降ろし 資材${mAdd} / 燃料${fAdd}${lost>0?`<br>備蓄上限超過で ${lost} を届けられませんでした（積荷は破棄）。`:''}</div>`,()=>{sel={kind:'planet',id:p.id};route=null;render()})}
// ---- 修理（4-6） ----
function repairAt(pid){const p=S.planets[pid],local=S.fleets.filter(f=>f.owner==='player'&&f.at===pid&&f.target===null);const rate=0.5;let cost=0,repaired=0;for(const f of local)for(const s of f.ships){const miss=SHIPS[s.type].hp-s.hp;if(miss<=0)continue;const afford=Math.floor(p.materials/rate),heal=Math.min(miss,afford);if(heal<=0){return showResult('修理不可',`<div class="resultBox">${p.name}の資材が不足しており修理できません。<br>保有資材 ${Math.floor(p.materials)}（耐久1あたり資材${rate}消費）</div>`,()=>openDock())}s.hp+=heal;p.materials-=heal*rate;cost+=heal*rate;repaired+=heal}
 showResult('修理完了',`<div class="resultBox">${p.name}のドックで損傷艦を修理しました。<br>回復耐久 合計 ${Math.round(repaired)} / 消費資材 ${Math.round(cost)}</div>`,()=>openDock())}
// ---- NPC探索AI（4-8） ----
function npcArrive(f){const p=S.planets[f.at],fac=f.owner;if(!p.owner&&p.usable){p.owner=fac;if(p.pop<10)p.pop=rand(20,80);p.fuel=200;p.materials=200}if(p.owner===fac&&p.usable){f.ships.forEach(s=>{const n=SHIPS[s.type].maxFuel-s.fuel,t=Math.min(n,p.fuel||0);s.fuel+=t;p.fuel-=t})}f.order='待機'}
function npcAI(){['zora','mira','nox'].forEach(fac=>{if(S.collapsed[fac])return;S.fleets.filter(f=>f.owner===fac&&f.target===null).forEach(f=>{if(rand(0,1)===0)return;const from=fleetMapPosition(f),cands=S.planets.filter(p=>p.id!==f.at&&!p.owner&&p.usable).map(p=>({p,d:Math.hypot(p.x-from.x,p.y-from.y)})).sort((a,b)=>a.d-b.d);const reach=cands.find(t=>routeInfo(f,t.p.id).ok);if(reach){const r=routeInfo(f,reach.p.id);f.target=reach.p.id;f.progress=0;f.eta=r.turns;f.burn=r.need/r.turns;f.order='探査'}else f.order='哨戒'})})}
// ---- 探知範囲（4-8） ----
function planetDetect(p){return 26+facLv(p,'probe')*24}
function fleetDetectable(f){if(f.owner==='player')return true;const pos=fleetMapPosition(f);return S.planets.some(p=>p.owner==='player'&&Math.hypot(p.x-pos.x,p.y-pos.y)<=planetDetect(p))}
// ---- 人事：年次着任・死亡除隊（4-7） ----
function annualRecruit(){if(S.people.length>=20)return;const n=Math.min(rand(1,3),20-S.people.length),fn=['カイ','レン','ノヴァ','ミオ','サイ','ラン','エル','ジン','ハル','ユウ','リク','ソラ'],ln=['クレイ','ウェン','ロス','ヴィント','タキ','ノル','ダイン','ミル'];for(let i=0;i<n;i++)S.people.push({id:S.nextPerson++,name:`${pick(fn)}・${pick(ln)}`,pilot:rand(20,55),force:rand(20,55),diplomacy:rand(20,55),assignment:null,xp:0,rank:0});log(`${n}名の候補生が着任しました。`,'info')}
function killCommander(f,reason){const c=commander(f);if(!c)return;c.assignment=null;S.people=S.people.filter(p=>p.id!==c.id);f.commander=null;log(`${c.name}が${reason}により戦死・除隊しました。`,'bad')}
// ---- 母星崩壊・勝利（4-11） ----
function collapseFaction(fac){if(S.collapsed[fac])return;S.collapsed[fac]=true;S.allied[fac]=false;S.planets.forEach(p=>{if(p.owner===fac){p.owner='independent';p.homeworld=false}});S.fleets.forEach(f=>{if(f.owner===fac){f.owner='independent';f.target=null;f.order='待機'}});log(`${FACS[fac][0]}の母星が陥落し勢力が崩壊。残存星系・艦隊は独立国となりました。`,'good')}
function checkVictory(){if(S.won)return;const majors=['zora','mira','nox'];if(majors.every(f=>S.collapsed[f]||S.allied[f])){S.won=true;speed(0);const how=majors.map(f=>`${FACS[f][0]}：${S.collapsed[f]?'母星制圧':'同盟'}`).join(' / ');modal('勝利',`<div class="resultBox"><b>星域の統一を達成しました。</b><br>${how}<br>独立国が残っていても勝利に影響しません。</div>`,[['OK',closeModal]]);log('勝利条件を達成しました。','good')}}
// ---- 外交操作（4-11：支援・同盟・敵対） ----
function openFactionDiplomacy(fac){if(S.collapsed[fac])return;const rel=S.relations[fac]||0;modal(`${FACS[fac][0]} 外交`,`<div class="resultBox">現在の関係値 <b>${rel}</b>${S.allied[fac]?' / 同盟締結済み':''}</div><div class="battleControls"><button id="dpSupport">支援（資金500・関係+15）</button><button id="dpAlly" ${rel>=60&&!S.allied[fac]?'':'disabled'}>同盟提携（関係60以上で可）</button><button id="dpHostile">敵対宣言</button></div>`,[['閉じる',closeModal]]);
 $('dpSupport').onclick=()=>{if(S.money<500)return log('資金が不足しています。','warn');S.money-=500;S.relations[fac]=Math.min(100,(S.relations[fac]||0)+15);showResult('支援',`<div class="resultBox">${FACS[fac][0]}を支援しました。関係値 ${S.relations[fac]}。</div>`,()=>render())};
 $('dpAlly').onclick=()=>{if((S.relations[fac]||0)<60)return log('同盟には関係値60以上が必要です。','warn');S.allied[fac]=true;showResult('同盟締結',`<div class="resultBox">${FACS[fac][0]}と同盟を締結しました。</div>`,()=>{checkVictory();render()})};
 $('dpHostile').onclick=()=>{S.relations[fac]=-100;S.allied[fac]=false;showResult('敵対宣言',`<div class="resultBox">${FACS[fac][0]}へ敵対を宣言しました。関係値 -100。</div>`,()=>render())};
}
map.addEventListener('pointerup',selectPlanet);window.addEventListener('resize',draw);document.querySelectorAll('[data-speed]').forEach(b=>b.onclick=()=>speed(+b.dataset.speed));document.querySelectorAll('[data-build]').forEach(b=>b.onclick=()=>build(b.dataset.build));$('roster').onclick=()=>openRoster();$('dockMenu').onclick=openDock;$('facMenu')&&($('facMenu').onclick=()=>openFacilities());$('systemMenu').onclick=openSystems;$('saveMenu').onclick=saveMenu;$('history').onclick=()=>modal('通知履歴',history.map(n=>`<div class="card ${n.kind}">${n.year}年${n.turn}T：${n.text}</div>`).join(''),[['閉じる',closeModal]]);$('newWorld').onclick=()=>modal('新しい星域','<p>現在のゲームを終了し、新しい星域を作成します。</p>',[['作成',()=>{closeModal();newGame()}],['キャンセル',closeModal]]);newGame();
