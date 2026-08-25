'use strict';
const $=id=>document.getElementById(id),map=$('map'),ctx=map.getContext('2d');
const TYPES={earth:['地球型','#58c98b'],mars:['火星型','#df7658'],gas:['ガス惑星','#68aee8']},FACS={player:['総督府','#5dd7ff'],zora:['ゾラ共同体','#ff7078'],mira:['ミラ交易連盟','#ffd16e'],nox:['ノクス評議会','#ae8cff']};
const NAMES=['プロキオン','アケルナル','ベルダン','トリトン','ルメリア','ガウス','ハルモニア','ネレイド','オルフェ','カノープス','エリダヌス','サガン','テーベ','ミネルヴァ','イオニア','ケプラー','アルカディア','リゲル','セレス','ソラリス'];
const SHIPS={scout:{name:'探査船',hp:45,atk:8,def:5,speed:2,maxFuel:38,cost:[600,150],turns:18},battleship:{name:'戦艦',hp:130,atk:50,def:25,speed:1.2,maxFuel:26,cost:[1500,450],turns:45},transport:{name:'輸送船',hp:75,atk:3,def:8,speed:1,maxFuel:32,cost:[800,250],turns:28}};
const FAC={orePlant:['鉱石プラント','ground',500,120,20],fuelPlant:['燃料プラント','ground',500,120,20],habitat:['居住区','ground',650,150,25],defense:['防衛基地','ground',800,200,30],dock:['造船ドック','orbital',1000,250,35],sensor:['探査基地','orbital',700,160,24],battery:['軌道砲台','orbital',1100,280,38],storage:['貯蔵ステーション','orbital',750,180,26]};
const RANKS=[['候補生','◇',0],['少尉','◆',20],['中尉','◆◆',55],['大尉','◆◆◆',100],['少佐','★',170],['中佐','★★',260],['大佐','★★★',380],['少将','❖',520],['中将','❖❖',700],['大将','❖❖❖',920]];
let S,sel,route,timer,history=[],activeFleetId=null,focus=false;const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,pick=a=>a[rand(0,a.length-1)];
function makePlanet(i){const type=pick(['earth','mars','gas']);return{id:i,name:NAMES[i],x:rand(5,195),y:rand(6,194),type,ore:type==='gas'?0:rand(type==='mars'?70:35,type==='mars'?100:70),deut:rand(type==='gas'?80:type==='mars'?10:35,type==='gas'?120:type==='mars'?35:70),cap:rand(type==='earth'?500:type==='mars'?200:50,type==='earth'?1000:type==='mars'?500:200),pop:0,owner:null,explored:false,usable:Math.random()>=.22,materials:0,fuel:0,defense:rand(10,45),dock:0,dockPool:[],buildQueue:[],facilities:{orePlant:0,fuelPlant:0,habitat:0,defense:0,dock:0,sensor:0,battery:0,storage:0},facilityQueue:null,independent:false}}
function makeFleet(id,owner,at,types,name){return{id,owner,at,target:null,progress:0,eta:0,burn:0,order:'待機',name,commander:null,ships:types.map((t,i)=>({id:`${id}-${i}`,type:t,hp:SHIPS[t].hp,fuel:SHIPS[t].maxFuel,level:1,upgrade:{weapon:0,armor:0,tank:0}}))}}
function pruneEmptyFleets(){const removed=S.fleets.filter(f=>!f.ships.length);removed.forEach(f=>{if(f.commander!=null){const c=S.people.find(p=>p.id===f.commander);if(c)c.assignment=null}if(f.owner==='player'&&typeof activeFleetId!=='undefined'&&activeFleetId===f.id)activeFleetId=null;if(f.owner==='player')log(`${f.name}は全艦を失い解隊されました。`,'bad')});if(removed.length)S.fleets=S.fleets.filter(f=>f.ships.length)}
function newGame(){let ps=[];for(let i=0;i<20;i++){let p;do{p=makePlanet(i)}while(ps.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<8));ps.push(p)}Object.assign(ps[0],{x:100,y:100,name:'プロキオン首都星',type:'earth',ore:50,deut:50,cap:600,pop:300,owner:'player',explored:true,usable:true,materials:500,fuel:500,dock:1,facilities:{orePlant:1,fuelPlant:1,habitat:0,defense:0,dock:1,sensor:1,battery:1,storage:0}});[20,27,34].forEach((d,i)=>{const p=ps[i+1],a=[25,145,265][i]*Math.PI/180;Object.assign(p,{x:100+Math.cos(a)*d,y:100+Math.sin(a)*d,owner:null,usable:true,explored:false})});const rest=ps.slice(4).sort(()=>Math.random()-.5);['zora','mira','nox'].forEach((o,j)=>rest.slice(j*3,j*3+3).forEach(p=>{p.owner=o;p.pop=rand(100,300)}));const xp=[180,110,65,25,0,0,0,0],names=['アレン・カイ','ミナ・ロウ','トウマ・レン','セラ・ノイン','ユナ・ベル','ガイル・オルド','リオ・サーン','エマ・ヴァル'],people=names.map((name,id)=>{const r=rankByXp(xp[id]),tier=RANKS.indexOf(r);return{id,name,xp:xp[id],pilot:rand(18+tier*10,38+tier*12),force:rand(18+tier*10,38+tier*12),diplomacy:rand(18+tier*10,38+tier*12),assignment:null,alive:true}});const f=makeFleet(1,'player',0,['scout'],'第1探査艦隊'),best=[...people].sort((a,b)=>b.pilot-a.pilot)[0];f.commander=best.id;best.assignment=f.id;S={year:1,turn:0,money:3000,planets:ps,fleets:[f],people,relations:{zora:0,mira:0,nox:0},contacted:{},nextFleet:2,npcKnown:{zora:[],mira:[],nox:[]}};['zora','mira','nox'].forEach((fac,j)=>{const home=rest[j*3];S.npcKnown[fac]=[home.id];S.fleets.push(makeFleet(100+j,fac,home.id,['scout','battleship','transport'],`${FACS[fac][0]}第1艦隊`))});sel={kind:'planet',id:0};route=null;history=[];log('星域統治を開始しました。','good');speed(1);render()}
function rankByXp(x){let r=RANKS[0];for(const a of RANKS)if(x>=a[2])r=a;return r}function rankIndexByXp(x){let i=0;for(let k=0;k<RANKS.length;k++)if(x>=RANKS[k][2])i=k;return i}function personRank(p){if(p&&p.killed&&typeof p.postRankIndex==='number')return RANKS[Math.min(p.postRankIndex,RANKS.length-1)];return rankByXp(p?p.xp:0)}function commander(f){return S.people.find(p=>p.id===f.commander&&p.alive!==false)}function currentPos(f){const a=S.planets[f.at];if(f.target===null)return{x:a.x,y:a.y};const b=S.planets[f.target],t=f.progress/f.eta;return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t}}function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}function range(f){return Math.floor(Math.min(...f.ships.map(s=>s.fuel))/Math.max(.5,1-(commander(f)?.pilot||0)*.004))}function routeInfo(f,pid){const d=distance(currentPos(f),S.planets[pid]),sp=Math.min(...f.ships.map(s=>SHIPS[s.type].speed));return{d,turns:Math.max(2,Math.ceil(d/sp)),ok:d<=range(f)}}
function stockCapacity(p){return 1000+(p.facilities?.storage||0)*1000}
function materialProduction(p){return p.owner==='player'&&p.usable?p.ore*.02*(1+(p.facilities?.orePlant||0)*.25):0}
function fuelProduction(p){return p.owner==='player'&&p.usable?p.deut*.02*(1+(p.facilities?.fuelPlant||0)*.25):0}
function updateStarResources(){S.planets.filter(p=>p.owner==='player'&&p.usable).forEach(p=>{const cap=stockCapacity(p);p.materials=Math.min(cap,Math.max(0,(p.materials||0)+materialProduction(p)));p.fuel=Math.min(cap,Math.max(0,(p.fuel||0)+fuelProduction(p)))})}
function resourcePercent(value,cap){return Math.max(0,Math.min(100,value/cap*100))}
function resourceMeters(p){const cap=stockCapacity(p),mp=materialProduction(p),fp=fuelProduction(p);return `<div class="resourceMeters"><div class="resourceMeter"><b>資材 ${Math.floor(p.materials||0)} / ${cap}</b><span class="resourceDelta"> +${mp.toFixed(1)}/T</span><div class="resourceBar"><i style="width:${resourcePercent(p.materials||0,cap)}%"></i></div></div><div class="resourceMeter"><b>燃料 ${Math.floor(p.fuel||0)} / ${cap}</b><span class="resourceDelta"> +${fp.toFixed(1)}/T</span><div class="resourceBar fuel"><i style="width:${resourcePercent(p.fuel||0,cap)}%"></i></div></div></div>`}
function tick(){S.turn++;processFacilities();processShips();if(S.turn%15===0)npcOrders();updateStarResources();S.fleets.forEach(f=>{if(f.target===null)return;if(f.ships.some(s=>s.fuel<f.burn)){f.target=null;f.order='燃料切れ・漂流';return log(`${f.name}が漂流しました。`,'bad')}f.ships.forEach(s=>s.fuel-=f.burn);if(++f.progress>=f.eta){f.at=f.target;f.target=null;f.progress=0;f.burn=0;f.order='待機';arrive(f)}});pruneEmptyFleets();if(S.turn>=100){S.turn=0;S.year++;annualRecruit();S.money+=S.planets.filter(p=>p.owner==='player').reduce((n,p)=>n+Math.floor(p.pop/10)*100,0)}if(S.turn%10===0)save(false);render()}
function npcOrders(){
 for(const f of S.fleets.filter(x=>x.owner!=='player'&&!String(x.owner).startsWith('independent-')&&x.target===null&&x.ships.length)){
  const here=S.planets[f.at],candidates=S.planets.filter(p=>p.id!==here.id&&distance(here,p)<=Math.max(36,range(f)));
  if(!candidates.length)continue;
  const fac=f.owner,hostile=(S.relations[fac]||0)<0,hasWar=f.ships.some(s=>s.type==='battleship');
  if(hostile&&hasWar){
   const known=S.npcKnown[fac]||[];
   const playerTargets=candidates.filter(p=>p.owner==='player'&&known.includes(p.id)).map(p=>({p,r:routeInfo(f,p.id)})).filter(x=>x.r.ok).sort((a,b)=>a.r.d-b.r.d);
   if(playerTargets.length&&Math.random()<0.7){const t=playerTargets[0];f.target=t.p.id;f.progress=0;f.eta=t.r.turns;f.burn=Math.ceil(t.r.d*.8)/t.r.turns;f.order='侵攻航行';continue}
  }
  const unexplored=candidates.filter(p=>!(S.npcKnown[fac]||[]).includes(p.id));
  const targets=unexplored.length?unexplored:candidates.filter(p=>!p.owner||p.owner===fac);
  const target=pick(targets.length?targets:candidates),r=routeInfo(f,target.id);if(!r.ok)continue;
  f.target=target.id;f.progress=0;f.eta=r.turns;f.burn=Math.ceil(r.d*.8)/r.turns;f.order=unexplored.includes(target)?'探査航行':'哨戒航行';
 }
}
let fleetBattle=null;
function startFleetBattle(player,enemy,planet){
 speed(0);fleetBattle={player,enemy,planet,round:0,logs:[],playerMax:player.ships.reduce((n,x)=>n+SHIPS[x.type].hp,0),enemyMax:enemy.ships.reduce((n,x)=>n+SHIPS[x.type].hp,0)};renderFleetBattle();
}
function battleHp(f){return f.ships.reduce((n,x)=>n+Math.max(0,x.hp),0)}
function renderFleetBattle(){const b=fleetBattle,p=b.player,e=b.enemy,pp=Math.max(0,battleHp(p)/b.playerMax*100),ep=Math.max(0,battleHp(e)/b.enemyMax*100);$('modal').classList.remove('hidden');$('modalTitle').textContent=`艦隊戦 第${b.round+1}ラウンド`;$('modalBody').innerHTML=`<div class="fleetBattleGrid"><div class="fleetBattlePanel"><b>${p.name}</b>${gauge(pp)}残存 ${p.ships.length}隻</div><div class="fleetBattlePanel enemy"><b>${e.name}</b>${gauge(ep)}残存 ${e.ships.length}隻</div></div><div class="fleetBattleLog">${b.logs.slice(-10).map(x=>`<div>${x}</div>`).join('')||'敵艦隊を確認しました。'}</div><div class="defenseControls"><button id="fleetNext">次のラウンド</button><button id="fleetAuto">自動進行</button><button id="fleetRetreat">撤退</button></div>`;$('modalButtons').innerHTML='';$('fleetNext').onclick=fleetBattleRound;$('fleetAuto').onclick=()=>{let n=20;while(fleetBattle&&n--)fleetBattleRound()};$('fleetRetreat').onclick=()=>finishFleetBattle(false,true)}
function fleetBattleRound(){const b=fleetBattle;if(!b)return;b.round++;fleetVolley(b.player,b.enemy,'自軍');if(b.enemy.ships.length)fleetVolley(b.enemy,b.player,'敵軍');if(!b.player.ships.length||!b.enemy.ships.length||b.round>=10)return finishFleetBattle(b.player.ships.length&&(!b.enemy.ships.length||battleHp(b.player)>=battleHp(b.enemy)),false);renderFleetBattle()}
function fleetVolley(a,d,label){for(const ship of [...a.ships]){if(!d.ships.length)break;const target=pick(d.ships),sd=SHIPS[ship.type],td=SHIPS[target.type],damage=Math.max(1,Math.round(sd.atk*(.7+Math.random()*.6)-td.def*.45));target.hp-=damage;fleetBattle.logs.push(`${label} ${sd.name}が${td.name}へ${damage}ダメージ。`);if(target.hp<=0){d.ships=d.ships.filter(x=>x!==target);fleetBattle.logs.push(`${td.name}を撃沈。`)}}}
function finishFleetBattle(win,retreat){const b=fleetBattle,p=b.player,e=b.enemy,planet=b.planet;fleetBattle=null;pruneEmptyFleets();if(retreat)return result('撤退',`敵艦隊との戦闘を離脱しました。<br>自軍残存 ${p.ships.length}隻`,()=>render());if(win)return result('艦隊戦勝利',`${e.name}を撃破しました。<br>自軍残存 ${p.ships.length}隻`,()=>{if(planet.owner&&planet.owner!=='player')arrivalDialog(p,planet);else render()});result('艦隊戦敗北',`${p.name}は敗北しました。<br>自軍残存 ${p.ships.length}隻`,()=>render())}
function occupationProblems(f,p){const a=[];if(!f)a.push('対象艦隊がありません');if(!p)a.push('対象星系がありません');if(p&&!p.explored)a.push('対象星系が未探査です');if(p&&!p.usable)a.push('利用可能な惑星がありません');if(p&&!p.owner)a.push('無所属星系です');if(p&&p.owner==='player')a.push('すでに自国星系です');if(f&&p&&f.at!==p.id)a.push('艦隊が対象星系に到着していません');if(f&&f.target!==null)a.push('艦隊が航行中です');if(f&&!f.ships.length)a.push('艦艇がありません');return a}function canOccupy(f,p){return occupationProblems(f,p).length===0}
function occupationPower(f){return f.ships.filter(s=>s.type==='scout').length*28+f.ships.filter(s=>s.type==='battleship').length*55+f.ships.filter(s=>s.type==='transport').length*40+(commander(f)?.force||0)}
function occupationResistance(p){return Math.max(30,p.defense+Math.floor(p.pop/12))}
let defenseBattle=null;
function occupyPlanet(fid,pid){
 const f=S.fleets.find(x=>x.id===fid),p=S.planets[pid];
 if(!canOccupy(f,p)){const problems=occupationProblems(f,p);return result('占領不可',`${problems.map(x=>`・${x}`).join('<br>')}<br><br>占領には対象星系で待機中の艦隊が必要です。探査船1隻でも占領を試みられます。`,()=>render())}
 speed(0);
 defenseBattle={fleet:f,planet:p,round:0,stage:'orbital',orbitalHp:Math.max(40,(p.facilities?.battery||0)*90+p.defense*.5),groundHp:Math.max(30,p.defense+Math.floor(p.pop/15)),fleetMax:f.ships.reduce((n,x)=>n+SHIPS[x.type].hp,0),logs:[]};
 renderDefenseBattle();
}
function fleetCurrentHp(f){return f.ships.reduce((n,x)=>n+Math.max(0,x.hp),0)}
function renderDefenseBattle(){
 const b=defenseBattle;if(!b)return;const f=b.fleet,p=b.planet,fp=Math.max(0,fleetCurrentHp(f)/b.fleetMax*100),targetMax=b.stage==='orbital'?Math.max(40,(p.facilities?.battery||0)*90+p.defense*.5):Math.max(30,p.defense+Math.floor(p.pop/15)),tp=Math.max(0,(b.stage==='orbital'?b.orbitalHp:b.groundHp)/targetMax*100);
 $('modal').classList.remove('hidden');$('modalTitle').textContent=`${p.name} 防衛戦 第${b.round+1}ラウンド`;
 $('modalBody').innerHTML=`<div class="defenseStage"><b>段階：</b>${b.stage==='orbital'?'軌道防衛網との戦闘':'惑星防衛軍との戦闘'}</div><div class="defenseGrid"><div class="defensePanel"><b>${f.name}</b><div class="fuel defenseBar"><i style="width:${fp}%;background:var(--green)"></i></div>残存艦：${f.ships.length}隻<br>攻撃力：${occupationPower(f)}</div><div class="defensePanel"><b>${p.name}</b><div class="fuel defenseBar"><i style="width:${tp}%"></i></div>${b.stage==='orbital'?`軌道防衛耐久：${Math.max(0,Math.ceil(b.orbitalHp))}`:`地上防衛力：${Math.max(0,Math.ceil(b.groundHp))}`}<br>人口：${Math.floor(p.pop)}万</div></div><div class="defenseLog">${b.logs.slice(-10).map(x=>`<div>${x}</div>`).join('')||'攻撃開始を待っています。'}</div><div class="defenseControls"><button id="defenseNext">次のラウンド</button><button id="defenseAuto">自動進行</button><button id="defenseAbort">攻略中止</button></div>`;
 $('modalButtons').innerHTML='';$('defenseNext').onclick=defenseRound;$('defenseAuto').onclick=autoDefense;$('defenseAbort').onclick=()=>{defenseBattle=null;closeModal();log('占領作戦を中止しました。','warn');render()};
}
function defenseRound(){
 const b=defenseBattle;if(!b)return;const f=b.fleet,p=b.planet;b.round++;
 if(!f.ships.length)return finishDefense(false,'攻略艦隊が全滅しました。');
 const shipAttack=f.ships.reduce((sum,ship)=>sum+SHIPS[ship.type].atk,0);
 const attack=Math.max(3,Math.round(shipAttack*(.35+Math.random()*.25)+(commander(f)?.force||0)*.25));
 if(b.stage==='orbital'){
  b.orbitalHp-=attack;b.logs.push(`攻略艦隊が軌道防衛網へ${attack}ダメージ。`);
  if(b.orbitalHp<=0){b.logs.push('軌道防衛網を突破。惑星防衛軍との戦闘へ移行。');b.stage='ground';return renderDefenseBattle()}
  planetaryCounterattack(f,Math.max(4,Math.round((p.facilities?.battery||1)*14+p.defense*.08)),'軌道砲台');
 }else{
  b.groundHp-=attack;b.logs.push(`攻略艦隊が惑星防衛軍へ${attack}ダメージ。`);
  if(b.groundHp<=0)return resolveLanding();
  planetaryCounterattack(f,Math.max(3,Math.round(p.defense*.12+p.pop/80)),'惑星防衛軍');
 }
 if(!f.ships.length)return finishDefense(false,'攻略艦隊が全滅しました。');renderDefenseBattle();
}
function planetaryCounterattack(f,base,label){const target=pick(f.ships),damage=Math.max(1,Math.round(base*(.7+Math.random()*.6)));target.hp-=damage;defenseBattle.logs.push(`${label}の反撃。${SHIPS[target.type].name}へ${damage}ダメージ。`);if(target.hp<=0){f.ships=f.ships.filter(x=>x!==target);defenseBattle.logs.push(`${SHIPS[target.type].name}が撃沈されました。`)}}
function autoDefense(){let guard=30;while(defenseBattle&&guard--)defenseRound()}
function resolveLanding(){const b=defenseBattle,f=b.fleet,p=b.planet,attack=occupationPower(f),resist=occupationResistance(p);b.logs.push(`降下部隊を投入。占領力${attack}、最終抵抗力${resist}。`);finishDefense(attack>=resist,attack>=resist?'惑星防衛軍が降伏しました。':'降下部隊が撃退されました。')}
function finishDefense(success,message){const b=defenseBattle;if(!b)return;const f=b.fleet,p=b.planet;defenseBattle=null;if(success){p.owner='player';p.pop=Math.max(1,Math.floor(p.pop*.9));p.defense=10;p.fuel=rand(20,60);p.materials=rand(80,160);if(p.facilities)p.facilities.battery=0;result('占領成功',`${p.name}を占領しました。<br>${message}<br>残存艦：${f.ships.length}隻`,()=>{sel={kind:'planet',id:p.id};route=null;log(`${p.name}を占領しました。`,'good');render()})}else result('占領失敗',`${p.name}の占領に失敗しました。<br>${message}<br>残存艦：${f.ships.length}隻`,()=>{log(`${p.name}の占領に失敗しました。`,'bad');render()})}
function arrivalDialog(f,p){const buttons=[];if(canOccupy(f,p))buttons.push(['占領する',()=>{closeModal();occupyPlanet(f.id,p.id)}]);buttons.push(['OK',()=>{closeModal();sel={kind:'planet',id:p.id};route=null;render()}]);modal('星系到着',`<div class="routeOk"><b>${f.name}</b><br>${p.name}へ到着しました。${canOccupy(f,p)?`<br>${f.ships.every(s=>s.type==='scout')?'<span class="scoutOccupation">探査船のみでも占領可能ですが、戦闘力は低くなります。</span>':'占領を選択できます。'}`:''}</div>`,buttons)}
function arrive(f){
 const p=S.planets[f.at];
 if(f.owner!=='player')return npcArrive(f,p);
 const enemy=S.fleets.find(x=>x.owner!=='player'&&x.at===p.id&&x.target===null&&x.ships.length);
 if(enemy)return startFleetBattle(f,enemy,p);
 if(f.ships.some(s=>s.type==='scout')){
  p.explored=true;
  if(!p.usable)return result('探査結果',`${p.name}<br>利用可能な惑星はありません。`,()=>render());
  if(!p.owner){p.owner='player';p.pop=10;p.materials=Math.max(p.materials||0,220);p.fuel=Math.max(p.fuel||0,160);refuelAtOwnedStar(f,p);return result('探査完了',`${p.name}を自国へ編入しました。<br>開拓用資材220・燃料160を確保しました。<br>${f.name}は${p.name}で燃料補給しました。`,()=>{sel={kind:'planet',id:p.id};route=null;render()})}
 }
 refuelAtOwnedStar(f,p);
 arrivalDialog(f,p);
}
function npcArrive(f,p){
 const known=S.npcKnown[f.owner]||(S.npcKnown[f.owner]=[]);if(!known.includes(p.id))known.push(p.id);
 const playerFleet=S.fleets.find(x=>x.owner==='player'&&x.at===p.id&&x.target===null&&x.ships.length);
 if(playerFleet&&(S.relations[f.owner]||0)<0)return startFleetBattle(playerFleet,f,p);
 if(p.owner==='player'&&(S.relations[f.owner]||0)<0&&f.ships.some(s=>s.type==='battleship')){return npcAssault(f,p)}
 if(f.ships.some(s=>s.type==='scout')&&p.usable&&!p.owner){p.owner=f.owner;p.pop=rand(8,20);p.fuel=80;p.materials=80;f.order='新星系調査完了'}else f.order='哨戒';
 f.target=null;f.progress=0;f.burn=0;
}
function npcAssault(f,p){
 const atk=f.ships.filter(s=>s.type==='battleship').length*30+f.ships.length*4+(f.commander!=null?15:0);
 const def=Math.max(20,p.defense+(p.facilities?.battery||0)*40+Math.floor(p.pop/12));
 if(atk>=def){const old=p.owner;p.owner=f.owner;p.pop=Math.max(1,Math.floor(p.pop*.85));p.defense=Math.max(5,Math.floor(p.defense*.5));if(p.facilities)p.facilities.battery=0;f.order='占領駐留';log(`【被侵攻】${FACS[f.owner]?FACS[f.owner][0]:f.owner}が${p.name}を占領しました。`,'bad')}
 else{p.defense=Math.max(5,p.defense-6);f.ships.forEach(s=>{s.hp-=Math.max(2,Math.round(def*.15*Math.random()))});f.ships=f.ships.filter(s=>s.hp>0);f.order='侵攻失敗・後退';log(`【防衛】${p.name}への${FACS[f.owner]?FACS[f.owner][0]:f.owner}の侵攻を撃退しました。`,'good')}
 f.target=null;f.progress=0;f.burn=0;pruneEmptyFleets();
}
function canRefuel(p){return p.owner==='player'||(p.owner&&S.relations[p.owner]>=60)}function refuelAtOwnedStar(f,p){if(!canRefuel(p))return 0;if(p.owner==='player'&&(p.fuel||0)<80)p.fuel=80;let supplied=0;f.ships.forEach(ship=>{const max=SHIPS[ship.type].maxFuel+(ship.upgrade?.tank||0)*5,need=Math.max(0,max-ship.fuel),amount=Math.min(need,p.fuel||0);ship.fuel+=amount;p.fuel-=amount;supplied+=amount});if(supplied>0)log(`${f.name}が${p.name}で燃料${Math.floor(supplied)}を補給しました。`,'good');return supplied}function send(fid,pid,order){const f=S.fleets.find(x=>x.id===fid),r=routeInfo(f,pid);if(!r.ok)return log('航続距離外です。','warn');f.target=pid;f.progress=0;f.eta=r.turns;f.burn=Math.ceil(r.d*Math.max(.5,1-(commander(f)?.pilot||0)*.004))/r.turns;f.order=order;if(order==='探査')result('探査命令',`${f.name}<br>未踏星系-${pid}へ向かいます。`,()=>render())}
function annualRecruit(){const active=S.people.filter(p=>p.alive!==false);if(active.length>=20)return;for(let i=0;i<Math.min(rand(1,3),20-active.length);i++){const id=Math.max(...S.people.map(p=>p.id))+1;S.people.push({id,name:`候補生-${id}`,xp:0,pilot:rand(15,35),force:rand(15,35),diplomacy:rand(15,35),assignment:null,alive:true})}}
function facilityAllowed(p,k){if(p.type!=='gas')return true;return k==='fuelPlant'||FAC[k][1]==='orbital'}
function facilityCost(p,k){const lv=p.facilities[k]+1,m=2**(lv-1),d=FAC[k];return{lv,money:d[2]*m,materials:d[3]*m,turns:d[4]+(lv-1)*10}}
function facilityProblem(p,k){
 const c=facilityCost(p,k),problems=[];
 if(p.owner!=='player')problems.push('自国星系ではありません');
 if(!p.explored)problems.push('未探査星系です');
 if(!p.usable)problems.push('利用可能な惑星がありません');
 if(!facilityAllowed(p,k))problems.push('この惑星タイプでは建築できません');
 if(p.facilityQueue)problems.push(`現在、${FAC[p.facilityQueue.k][0]}を建築中です`);
 if(p.facilities[k]>=5)problems.push('最大レベルです');
 if(S.money<c.money)problems.push(`資金が${Math.ceil(c.money-S.money)}不足`);
 if(p.materials<c.materials)problems.push(`${p.name}の資材が${Math.ceil(c.materials-p.materials)}不足`);
 return problems;
}
function transferConstructionMaterials(p,needed){const capital=S.planets.find(x=>x.owner==='player'&&x.id!==p.id&&x.materials>0);if(!capital)return 0;const amount=Math.min(needed,capital.materials);capital.materials-=amount;p.materials+=amount;if(amount>0)log(`${capital.name}から${p.name}へ建築資材${Math.floor(amount)}を移送しました。`,'info');return amount}
function startFacility(pid,k){
 const p=S.planets[pid],c=facilityCost(p,k);if(p.materials<c.materials)transferConstructionMaterials(p,c.materials-p.materials);const problems=facilityProblem(p,k);
 if(problems.length)return result('建築できません',`<b>${FAC[k][0]} Lv${c.lv}</b><br>${problems.map(x=>`・${x}`).join('<br>')}<br><br>現在：資金${Math.floor(S.money)} / ${p.name}資材${Math.floor(p.materials)}<br>必要：資金${c.money} / 資材${c.materials}`,()=>openFacilities(pid));
 S.money-=c.money;p.materials=Math.max(0,p.materials-c.materials);log(`${p.name}で建築資材${c.materials}を消費しました。残量${Math.floor(p.materials)}。`,'info');p.facilityQueue={k,remaining:c.turns,total:c.turns,lv:c.lv};
 result('建築開始',`${p.name}<br>${FAC[k][0]} Lv${c.lv}<br>資金${c.money}・資材${c.materials}を使用しました。<br>完成まで${c.turns}ターン`,()=>{render();openFacilities(pid)});
}
function processFacilities(){S.planets.filter(p=>p.facilityQueue).forEach(p=>{const q=p.facilityQueue;if(--q.remaining>0)return;p.facilities[q.k]=q.lv;if(q.k==='dock')p.dock=q.lv;if(q.k==='habitat')p.cap+=100;if(q.k==='defense')p.defense+=50;if(q.k==='storage'){p.materials=Math.min(stockCapacity(p),p.materials);p.fuel=Math.min(stockCapacity(p),p.fuel)}p.facilityQueue=null;log(`${p.name}で${FAC[q.k][0]}が完成しました。`,'good')})}
function openFacilities(pid=sel.kind==='planet'?sel.id:0){
 const p=S.planets[pid];if(!p||p.owner!=='player')return result('建築できません','自国星系を選択してください。',closeModal);
 const cards=Object.keys(FAC).map(k=>{const d=FAC[k],c=facilityCost(p,k),problems=facilityProblem(p,k),typeAllowed=facilityAllowed(p,k),hardDisabled=!typeAllowed||p.facilities[k]>=5||!!p.facilityQueue;return `<div class="facilityCard ${typeAllowed?'':'blocked'}"><div><b>${d[0]} Lv${p.facilities[k]}</b><small>${d[1]==='orbital'?'軌道施設':'地上施設'}</small>${problems.length?`<span class="shortage">${problems.join(' / ')}</span>`:'<span class="available">建築可能</span>'}</div><button data-fac="${k}" ${hardDisabled?'disabled':''}>${p.facilities[k]?'強化':'建築'}<small>資金${c.money}/資材${c.materials}/${c.turns}T</small></button></div>`}).join('');
 modal('施設建築',`<h3>${p.name} / ${TYPES[p.type][0]}</h3><div class="resourceSummary"><div>全体資金<br><b>${Math.floor(S.money)}</b></div><div>備蓄上限<br><b>${stockCapacity(p)}</b></div><div>建築枠<br><b>${p.facilityQueue?'使用中':'空き'}</b></div></div>${resourceMeters(p)}${p.type==='gas'?'<div class="routeOk">燃料プラントと軌道施設を建築できます。</div>':''}${p.materials<120?`<div class="routeWarning">${p.name}の資材が不足しています。施設建築には、この星系へ資材を輸送する必要があります。</div>`:''}${p.facilityQueue?`<div class="buildQueue">建築中：${FAC[p.facilityQueue.k][0]} / 残り${p.facilityQueue.remaining}T</div>`:''}<div class="facilityGrid">${cards}</div>`,[['OK',closeModal]]);
 $('modalBody').querySelectorAll('[data-fac]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();startFacility(pid,button.dataset.fac)}));
}
function processShips(){S.planets.filter(p=>p.buildQueue.length).forEach(p=>{const q=p.buildQueue[0];if(--q.remaining<=0&&p.dockPool.length<p.dock*4){p.dockPool.push(q.ship);p.buildQueue.shift();log(`${SHIPS[q.ship.type].name}が完成しました。`,'good')}})}function build(t){const p=S.planets.find(x=>x.owner==='player'&&x.dock),d=SHIPS[t];if(!p||S.money<d.cost[0]||p.materials<d.cost[1])return log('造船資源不足です。','warn');if(p.dockPool.length+p.buildQueue.length>=p.dock*4)return log('ドック上限です。','warn');S.money-=d.cost[0];p.materials=Math.max(0,p.materials-d.cost[1]);log(`${p.name}で造船資材${d.cost[1]}を消費しました。残量${Math.floor(p.materials)}。`,'info');p.buildQueue.push({ship:{id:`s${Date.now()}`,type:t,hp:d.hp,fuel:d.maxFuel,level:1,upgrade:{}},remaining:d.turns,total:d.turns});result('建造開始',`${d.name}<br>完成まで${d.turns}ターン`,()=>render())}
function render(){stats();draw();fleetList();detail();$('diplomacy').innerHTML=''}function stats(){$('stats').innerHTML=`<span>${S.year}年 ${S.turn}/100</span><span>資金 ${Math.floor(S.money)}</span>`}function gauge(p){return `<div class="fuel"><i style="width:${p}%"></i></div>`}function fleetList(){$('fleets').innerHTML='';S.fleets.filter(f=>f.owner==='player').forEach(f=>{const b=document.createElement('button');b.className=`card ${activeFleetId===f.id?'selected':''}`;b.innerHTML=`<b>${f.name}</b><br>${f.order}${gauge(Math.min(...f.ships.map(s=>s.fuel/SHIPS[s.type].maxFuel*100)))}`;b.onclick=()=>{activeFleetId=f.id;focus=true;sel={kind:'planet',id:f.at};route={fid:f.id,pid:f.at};render()};$('fleets').appendChild(b)})}
function playerFleets(){return S.fleets.filter(f=>f.owner==='player')}
function activeFleet(){return S.fleets.find(x=>x.id===activeFleetId&&x.owner==='player')||null}
function fleetSummary(f){return `${f.name}｜${f.ships.length}隻｜司令官${commander(f)?commander(f).name:'未任命'}`}
function pickBestFleet(pid,preferScout){const cand=playerFleets().filter(f=>f.ships.length);if(!cand.length)return null;const scored=cand.map(f=>{const info=routeInfo(f,pid),hasCmd=!!commander(f),hasScout=f.ships.some(s=>s.type==='scout');let sc=0;if(info.ok)sc+=1000;if(hasCmd)sc+=200;if(preferScout&&hasScout)sc+=400;if(!preferScout)sc+=100;sc-=info.d;return{f,sc}});scored.sort((a,b)=>b.sc-a.sc);return scored[0].f}
function ensureActiveFor(pid,preferScout){let f=activeFleet();if(!f){f=pickBestFleet(pid,preferScout);activeFleetId=f?f.id:null}return f}
function contextVerb(f,p){if(!p.explored)return{key:'explore',label:'探査へ向かう',order:'探査',preferScout:true};if(p.owner&&p.owner!=='player')return{key:'occupy',label:'占領へ向かう',order:'移動',preferScout:false};return{key:'move',label:'移動',order:'移動',preferScout:false}}
function verbReason(f,p,verb){if(!f)return '実行できる自国艦隊がありません';if(!commander(f))return '実行艦隊に司令官が必要です（下の「司令官を任命・交代」から任命してください）';if(verb.key==='explore'&&!f.ships.some(s=>s.type==='scout'))return '探査には探査船を含む艦隊が必要です';const info=routeInfo(f,p.id);if(!info.ok)return `航続距離外です（距離${info.d.toFixed(1)} / 航続力${range(f)}）`;return ''}
function detail(){
 let tp=(route&&route.pid!=null)?route.pid:(sel&&sel.kind==='planet'?sel.id:(activeFleet()?activeFleet().at:0));
 const p=S.planets[tp];
 const preCtx=contextVerb(null,p);
 let f=ensureActiveFor(tp,preCtx.preferScout);
 route=(focus&&f)?{fid:f.id,pid:tp}:null;
 const verb=contextVerb(f,p);
 const reach=f?routeInfo(f,tp):null;
 const ownerLabel=p.owner==='player'?'自国':(String(p.owner).startsWith('independent-')?'独立国':(FACS[p.owner]?FACS[p.owner][0]:p.owner)||'無所属');
 const targetHtml=p.explored
  ?`<h3>${p.name}</h3><div class="row"><span>所属</span><b>${ownerLabel}</b></div><div class="row"><span>種類</span><b>${TYPES[p.type][0]}</b></div>${p.owner==='player'?resourceMeters(p):''}`
  :`<h3>未踏星系-${p.id}</h3><div class="row"><span>状態</span><b>未探査</b></div>`;
 const meta=f?`<div class="${reach.ok?'routeOk':'routeWarning'}">対象まで 距離${reach.d.toFixed(1)} / 航続力${range(f)}${reach.ok?` / 到着${reach.turns}T`:' / 航続距離外'}</div>`:'<div class="routeWarning">実行できる自国艦隊がありません</div>';
 $('detail').innerHTML=`<div class="targetBlock"><div class="blockLabel">① 対象（星系）</div>${targetHtml}${meta}</div>`;
 const fleetOpts=playerFleets().map(x=>`<option value="${x.id}" ${f&&x.id===f.id?'selected':''}>${fleetSummary(x)}</option>`).join('');
 const reason=verbReason(f,p,verb);
 const atTarget=f&&f.at===tp&&f.target===null;
 const isOwn=p.owner==='player';
 const isEnemyExplored=p.explored&&p.owner&&p.owner!=='player';
 const hasTransport=f&&f.ships.some(s=>s.type==='transport');
 let a=`<div class="execFleet"><div class="blockLabel">② 実行艦隊</div><select id="actFleet">${fleetOpts||'<option>自国艦隊なし</option>'}</select></div>`;
 a+=`<div class="verbBlock"><div class="blockLabel">③ 行動</div><button id="verbGo" ${reason?'disabled':''}>${verb.label}</button>${reason?`<div class="routeWarning">${reason}</div>`:''}`;
 if(atTarget&&isEnemyExplored){const occIssues=occupationProblems(f,p);a+=`<button id="occupyNow" ${occIssues.length?'disabled':''}>占領する（この星系）</button>${occIssues.length?`<div class="routeWarning">${occIssues.join(' / ')}</div>`:(f.ships.every(s=>s.type==='scout')?'<div class="scoutOccupation">探査船のみでも占領できますが、成功率は低めです。</div>':'')}`}
 a+=`<button id="verbTransport" ${hasTransport?'':'disabled'}>資源輸送</button>${hasTransport?'':'<div class="routeWarning">輸送には輸送船を含む実行艦隊が必要です</div>'}`;
 if(isOwn&&p.explored&&p.usable)a+=`<button id="verbBuild">この星系に施設を建築</button>`;
 const stationedHere=f&&f.at===tp&&f.target===null;const canSupply=stationedHere&&canRefuel(p)&&p.usable;const fuelFull=f&&f.ships.every(s=>s.fuel>=SHIPS[s.type].maxFuel+(s.upgrade?.tank||0)*5-0.001);const supplyReason=!f?'実行艦隊がありません':!stationedHere?'補給は現在地に停泊中の艦隊のみ可能です':!canRefuel(p)?'この星系では補給できません（自国または友好勢力の星系が必要）':!p.usable?'利用可能な惑星がなく補給できません':fuelFull?'すでに満タンです':'';
 a+=`<button id="verbSupply" ${supplyReason?'disabled':''}>補給</button>${supplyReason&&stationedHere?`<div class="routeWarning">${supplyReason}</div>`:''}`;
 const isStranded=f&&f.order==='燃料切れ・漂流';
 if(isStranded)a+=`<button id="verbScuttle" class="danger">艦隊を自沈</button><div class="routeWarning">燃料切れで漂流中です。自沈すると艦隊を失いますが、司令官は生還します（1階級降格・能力低下）。</div>`;
 a+=`</div><div class="manageBlock"><button id="verbAssign">司令官を任命・交代</button><button id="verbRepair">修理</button><button id="verbOK" class="primary">OK（星系マップへ）</button></div>`;
 $('actions').innerHTML=a;
 $('actFleet').onchange=e=>{activeFleetId=+e.target.value;focus=true;route={fid:activeFleetId,pid:tp};detail();draw()};
 $('verbGo').onclick=()=>{if(!f)return;const rr=verbReason(f,p,verb);if(rr)return log(rr,'warn');focus=true;send(f.id,tp,verb.order)};
 if($('occupyNow'))$('occupyNow').onclick=()=>occupyPlanet(f.id,tp);
 if($('verbTransport'))$('verbTransport').onclick=()=>{if(hasTransport)openTransport(f);else log('輸送には輸送船を含む実行艦隊が必要です。','warn')};
 if($('verbBuild'))$('verbBuild').onclick=()=>openFacilities(tp);
 $('verbAssign').onclick=()=>openRoster(f?f.id:null);
 if($('verbSupply'))$('verbSupply').onclick=()=>{if(!f)return log('実行艦隊がありません。','warn');if(!(f.at===tp&&f.target===null))return log('補給は現在地に停泊中の艦隊のみ可能です。','warn');if(!canRefuel(p)||!p.usable)return log('この星系では補給できません。','warn');const got=refuelAtOwnedStar(f,p);if(got<=0)log('補給する燃料がありません（星系の燃料が不足、または既に満タンです）。','warn');detail();draw()};
 if($('verbScuttle'))$('verbScuttle').onclick=()=>{if(!f)return;modal('艦隊を自沈',`<div class="routeWarning">${f.name}を自沈します。<br>艦隊は失われますが、司令官${commander(f)?`（${commander(f).name}）`:''}は生還し、1階級降格・能力低下となります。<br>よろしいですか？</div>`,[['自沈する',()=>{closeModal();scuttleFleet(f.id)}],['キャンセル',()=>closeModal()]])};
 $('verbRepair').onclick=()=>{if(f)repairFleet(f);else log('実行艦隊がありません。','warn')};
 $('verbOK').onclick=()=>{focus=false;route=null;log('選択を解除し、星系マップへ戻りました。','info');render()};
}
function transform(){const w=map.clientWidth,h=map.clientHeight,scale=Math.min(w,h)/200;return{w,h,scale,ox:(w-200*scale)/2,oy:(h-200*scale)/2}}function screen(p,t=transform()){return{x:t.ox+p.x*t.scale,y:t.oy+p.y*t.scale}}function draw(){const t=transform(),d=devicePixelRatio||1;map.width=t.w*d;map.height=t.h*d;ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,t.w,t.h);S.planets.forEach(p=>{const q=screen(p,t);ctx.beginPath();ctx.arc(q.x,q.y,8,0,7);ctx.fillStyle=p.explored?TYPES[p.type][1]:'#718092';ctx.fill();ctx.fillStyle='#bfd0dc';ctx.fillText(p.explored?p.name:`未踏星系-${p.id}`,q.x+11,q.y+3)});const __af=activeFleet();if(__af&&route&&route.pid!=null){const f=__af,q=screen(currentPos(f),t),r=range(f)*t.scale;ctx.strokeStyle='#5dd7ff';ctx.setLineDash([6,5]);ctx.beginPath();ctx.arc(q.x,q.y,r,0,7);ctx.stroke();ctx.setLineDash([]);const z=screen(S.planets[route.pid],t);ctx.strokeStyle=routeInfo(f,route.pid).ok?'#71df9c':'#ff7078';ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(z.x,z.y);ctx.stroke()}S.fleets.filter(f=>f.owner==='player'||detectFleet(f)).forEach(f=>{const q=screen(currentPos(f),t);ctx.fillStyle=f.owner==='player'?'#fff':(FACS[f.owner]?.[1]||'#b7c0c8');ctx.beginPath();ctx.moveTo(q.x,q.y-8);ctx.lineTo(q.x+7,q.y+7);ctx.lineTo(q.x-7,q.y+7);ctx.fill();if(f.owner==='player'&&f.id===activeFleetId){ctx.strokeStyle='#5dd7ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y+2,11,0,7);ctx.stroke()}})}
function selectMap(e){const rect=map.getBoundingClientRect(),t=transform(),sx=e.clientX-rect.left,sy=e.clientY-rect.top;let bestF=null,bfd=13;playerFleets().forEach(f=>{const q=screen(currentPos(f),t),d=Math.hypot(q.x-sx,q.y-sy);if(d<bfd){bestF=f;bfd=d}});let bestP=null,bpd=1e9;S.planets.forEach(p=>{const q=screen(p,t),d=Math.hypot(q.x-sx,q.y-sy);if(d<bpd){bestP=p;bpd=d}});const planetHit=bestP&&bpd<=14;if(bestF&&bfd<=13&&(!planetHit||bfd<=bpd)){activeFleetId=bestF.id;focus=true;sel={kind:'planet',id:bestF.at};route={fid:bestF.id,pid:bestF.at};log(`${bestF.name}を実行艦隊に選択しました。星をクリックで目的地を指定できます。`,'info');return render()}if(planetHit){focus=true;sel={kind:'planet',id:bestP.id};const v=contextVerb(null,bestP);const f=ensureActiveFor(bestP.id,v.preferScout);route=f?{fid:f.id,pid:bestP.id}:null;return render()}}
// ===== v2.1.5 手続き生成 海軍軍人風 顔アバター（SVG・画像生成なし） =====
function avatarRng(seed){let a=(seed>>>0)||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function avatarFeatures(p){
 // 属性ごとに独立シードで確定。id のみに依存し、階級・年齢などの分岐に消費順が影響しないため、
 // 昇進・降格・戦死などで idx が変わっても、肌・髪・性別・年齢・髭は不変（同一人物で一貫）。
 const base=(p.id+1)*2654435761;
 const seedFor=k=>{let h=base^Math.imul(k,0x9E3779B1);h=Math.imul(h^h>>>15,0x85EBCA77);h=Math.imul(h^h>>>13,0xC2B2AE3D);return(h^h>>>16)>>>0};
 const val=k=>seedFor(k)/4294967296; // 0..1（属性kごとに独立・決定論的）
 const chooseFrom=(k,arr)=>arr[Math.floor(val(k)*arr.length)];
 const skins=['#f2c9a0','#e7b78f','#d69c6e','#bd7f4f','#9c6438','#7c4a28'];
 const youngHair=['#2b2b2b','#3a2a18','#5a3a20','#6b4a25','#101010','#8a6a3a'];
 const greyHair=['#c9c9c9','#b3b3b3','#9c9c9c','#e2e2e2'];
 const gender=val(1)<0.5?'f':'m';
 const ageRoll=val(2);const age=ageRoll<0.34?'young':ageRoll<0.7?'mid':'senior';
 const skin=chooseFrom(3,skins);
 const isGrey=age==='senior'&&val(4)<0.7;
 const hair=isGrey?chooseFrom(5,greyHair):chooseFrom(6,youngHair);
 let beard='none';
 if(gender==='m'&&age!=='young'&&val(7)<0.55)beard=chooseFrom(8,['stubble','mustache','full']);
 else if(gender==='m'&&val(9)<0.2)beard='stubble';
 const idx=RANKS.indexOf(personRank(p)); // 表示用（帽装飾の量）にのみ使用。色属性には非関与。
 // 顔の細部ゆらぎ用の決定論的乱数（描画装飾のみ。色・性別・年齢には影響しない）
 const detail=avatarRng(seedFor(99));
 return{skin,hair,gender,age,beard,idx,r:detail}
}
function esc(n){return Math.round(n*100)/100}
function star(cx,cy,r,fill){let pts='';for(let i=0;i<5;i++){const a=-Math.PI/2+i*2*Math.PI/5,ax=cx+Math.cos(a)*r,ay=cy+Math.sin(a)*r;const b=a+Math.PI/5,bx=cx+Math.cos(b)*r*0.45,by=cy+Math.sin(b)*r*0.45;pts+=`${esc(ax)},${esc(ay)} ${esc(bx)},${esc(by)} `}return `<polygon points="${pts.trim()}" fill="${fill}"/>`}
function avatarSVG(p,opts={}){
 const f=avatarFeatures(p);const killed=!!p.killed;const idx=f.idx;
 // 参照画像（画像生成）を基にした比率。viewBox 120x132（縦長）。
 const C={white:'#f3f4f6',band:'#0e1524',visor:'#0b1220',uni:'#152238',uniDk:'#0e1a2c',uniHi:'#1d2e49',gold:'#e6b93a',goldDk:'#b78e28',line:'#0a1220',collarWhite:'#eef2f7'};
 const skin=f.skin, hair=f.hair;
 // 肌の陰影色（skinを少し暗く）
 const shade=(hex,amt)=>{const n=parseInt(hex.slice(1),16);let r=(n>>16)&255,g=(n>>8)&255,b=n&255;r=Math.max(0,Math.round(r*amt));g=Math.max(0,Math.round(g*amt));b=Math.max(0,Math.round(b*amt));return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)};
 const skinSh=shade(skin,0.86), skinLo=shade(skin,0.78);
 let s=`<svg class="avatar${killed?' killed':''}" viewBox="0 0 120 132" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${personRank(p)[0]} ${p.name}">`;
 s+=`<rect x="0" y="0" width="120" height="132" rx="10" fill="#0a1626"/>`;

 // ===== 制服の胴・肩（詰襟。参照どおり肩幅広め・いかり肩） =====
 s+=`<path d="M6 132 L6 108 C6 96 16 90 30 89 C40 88 50 90 60 92 C70 90 80 88 90 89 C104 90 114 96 114 108 L114 132 Z" fill="${C.uni}" stroke="${C.line}" stroke-width="1.5"/>`;
 // 胴のハイライト
 s+=`<path d="M60 92 C70 90 80 88 90 89 C100 90 108 94 111 102" fill="none" stroke="${C.uniHi}" stroke-width="1" opacity="0.5"/>`;

 // ===== 首 =====
 s+=`<path d="M48 84 C48 92 48 96 60 98 C72 96 72 92 72 84 Z" fill="${skin}"/>`;
 s+=`<path d="M48 88 C52 95 68 95 72 88" fill="${skinSh}" opacity="0.5"/>`;

 // ===== 詰襟（スタンドカラー：白縁＋濃紺の立ち襟＋前立て＋金ボタン） =====
 // 立ち襟（首を囲む。顎下から）
 s+=`<path d="M42 93 C48 86 72 86 78 93 L79 104 C72 96 48 96 41 104 Z" fill="${C.uni}" stroke="${C.line}" stroke-width="1.4"/>`;
 // 白の襟縁（V字に開く内側の白）
 s+=`<path d="M48 92 L60 100 L72 92" fill="none" stroke="${C.collarWhite}" stroke-width="2.4"/>`;
 // 前立て（中央の縦ライン）
 s+=`<path d="M60 100 L60 130" stroke="${C.collarWhite}" stroke-width="1.8"/>`;
 s+=`<path d="M60 100 L60 130" stroke="${C.line}" stroke-width="0.6" opacity="0.6"/>`;
 // 金ボタン3つ（前立て上に）
 [107,116,125].forEach(y=>{s+=`<circle cx="60" cy="${y}" r="2.6" fill="${C.gold}" stroke="${C.goldDk}" stroke-width="0.6"/>`});

 // ===== 顔（縦長の卵型・顎あり） =====
 // 耳（顔の輪郭に接して配置）
 s+=`<ellipse cx="34" cy="60" rx="4.5" ry="6.5" fill="${skin}" stroke="${C.line}" stroke-width="0.8"/><ellipse cx="86" cy="60" rx="4.5" ry="6.5" fill="${skin}" stroke="${C.line}" stroke-width="0.8"/>`;
 s+=`<path d="M33 57 q2.5 2.5 1.5 6" fill="none" stroke="${skinLo}" stroke-width="1"/><path d="M87 57 q-2.5 2.5 -1.5 6" fill="none" stroke="${skinLo}" stroke-width="1"/>`;
 // 顔輪郭
 s+=`<path d="M34 52 C34 34 46 24 60 24 C74 24 86 34 86 52 C86 68 78 82 60 86 C42 82 34 68 34 52 Z" fill="${skin}" stroke="${C.line}" stroke-width="1.4"/>`;
 // 頬の陰影
 s+=`<path d="M36 54 C38 66 46 78 60 82 C50 78 44 66 42 54 Z" fill="${skinSh}" opacity="0.5"/>`;
 // あご下の陰
 s+=`<path d="M50 80 C54 84 66 84 70 80 C66 86 54 86 50 80 Z" fill="${skinLo}" opacity="0.4"/>`;

 // 眉（太め・やや直線でキリッと）
 const brow=f.age==='senior'?'#9a9a9a':shade(hair,0.9);
 s+=`<path d="M40 50 Q48 46 55 49 L54 51 Q48 48.5 41 52 Z" fill="${brow}"/>`;
 s+=`<path d="M80 50 Q72 46 65 49 L66 51 Q72 48.5 79 52 Z" fill="${brow}"/>`;

 // 目（白目＋黒目＋上まぶた）
 s+=`<ellipse cx="48" cy="57" rx="5.4" ry="3.4" fill="#fff"/><ellipse cx="72" cy="57" rx="5.4" ry="3.4" fill="#fff"/>`;
 s+=`<circle cx="49" cy="57" r="2.2" fill="#20232a"/><circle cx="71" cy="57" r="2.2" fill="#20232a"/>`;
 s+=`<circle cx="49.7" cy="56.3" r="0.6" fill="#fff"/><circle cx="71.7" cy="56.3" r="0.6" fill="#fff"/>`;
 // 上まぶたライン
 s+=`<path d="M42.6 55 Q48 52.4 53.4 55" fill="none" stroke="${C.line}" stroke-width="1.1"/>`;
 s+=`<path d="M66.6 55 Q72 52.4 77.4 55" fill="none" stroke="${C.line}" stroke-width="1.1"/>`;
 if(f.gender==='f'){s+=`<path d="M42.6 55 l-1.4 -0.6 M77.4 55 l1.4 -0.6" stroke="${C.line}" stroke-width="1"/>`}

 // 鼻（鼻筋の陰影＋小鼻）
 s+=`<path d="M60 58 L57 68 Q60 70 63 68" fill="none" stroke="${skinLo}" stroke-width="1.4"/>`;
 s+=`<path d="M60 60 L61.5 67" fill="none" stroke="${skinSh}" stroke-width="1" opacity="0.6"/>`;

 // 口（中立・真一文字。ニコニコさせない）
 s+=`<path d="M52 76 Q60 78 68 76" fill="none" stroke="${shade(skin,0.55)}" stroke-width="1.6" stroke-linecap="round"/>`;
 s+=`<path d="M53 74.6 Q60 73.6 67 74.6" fill="none" stroke="${skinLo}" stroke-width="0.9" opacity="0.5"/>`;

 // 髭
 if(f.beard==='mustache'){s+=`<path d="M50 73 Q60 77 70 73 Q66 71 60 72 Q54 71 50 73 Z" fill="${hair}"/>`}
 else if(f.beard==='full'){s+=`<path d="M36 64 C38 78 48 86 60 86 C72 86 82 78 84 64 C78 76 42 76 36 64 Z" fill="${hair}" opacity="0.92"/>`;s+=`<path d="M52 76 Q60 78 68 76" fill="none" stroke="${shade(skin,0.5)}" stroke-width="1.4"/>`}
 else if(f.beard==='stubble'){s+=`<g fill="${hair}" opacity="0.3">`;for(let i=0;i<26;i++){s+=`<circle cx="${esc(42+f.r()*36)}" cy="${esc(72+f.r()*12)}" r="0.7"/>`}s+=`</g>`}

 // ===== 髪（顔・目鼻口の前、制帽の後ろ。頭頂ドームで帽子との隙間を無くす） =====
 // 頭頂ドーム：顔上部を広く覆う（上端はクラウン内へ、下端はこめかみ）。帽子で上半分は隠れる。
 s+=`<path d="M30 52 C28 28 44 20 60 20 C76 20 92 28 90 52 C86 40 78 33 60 33 C42 33 34 40 30 52 Z" fill="${hair}"/>`;
 if(f.gender==='f'){
  // サイド：頬の外側に沿って肩近くまで下ろす
  s+=`<path d="M30 48 C26 62 28 78 36 86 L41 84 C35 74 34 60 35 48 Z" fill="${hair}"/>`;
  s+=`<path d="M90 48 C94 62 92 78 84 86 L79 84 C85 74 86 60 85 48 Z" fill="${hair}"/>`;
 } else {
  // 短髪：こめかみのもみあげ（耳の内側）
  s+=`<path d="M31 50 C29 57 30 63 33 67 L37 65 C35 59 35 53 36 48 Z" fill="${hair}"/>`;
  s+=`<path d="M89 50 C91 57 90 63 87 67 L83 65 C85 59 85 53 84 48 Z" fill="${hair}"/>`;
 }
 // 生え際のハイライト
 s+=`<path d="M34 50 C40 40 80 40 86 50" fill="none" stroke="${shade(hair,0.8)}" stroke-width="1" opacity="0.5"/>`;

 // 老年：しわ（顔の上・帽子の下に見える範囲）
 if(f.age==='senior'){s+=`<path d="M42 66 q-2 5 0 9" stroke="#00000022" stroke-width="0.9" fill="none"/><path d="M78 66 q2 5 0 9" stroke="#00000022" stroke-width="0.9" fill="none"/><path d="M53 68 q-2 3 -1 6 M67 68 q2 3 1 6" stroke="#00000022" stroke-width="0.8" fill="none"/>`}

 // ===== 制帽（顔の上に被せる。生え際〜額を隠す位置） =====
 // バイザー（黒・つや）：前方に垂れ下がるつば（下向きの弧）
 s+=`<path d="M26 42 C34 44 86 44 94 42 C92 49 80 53 60 53 C40 53 28 49 26 42 Z" fill="${C.visor}" stroke="${C.line}" stroke-width="1.3"/>`;
 s+=`<path d="M32 49 C42 51 78 51 88 49" fill="none" stroke="#33405e" stroke-width="1" opacity="0.7"/>`;
 // バンド（濃紺）：つばの上、額を隠す。上辺y33・下辺y45で確実に塗り潰す（透けなし）
 s+=`<path d="M22 33 C22 27 98 27 98 33 L98 45 C98 51 22 51 22 45 Z" fill="${C.band}" stroke="${C.line}" stroke-width="1.3"/>`;
 // クラウン（白・横に広く前へせり出す高いドーム）：下辺はバンド上端(y34)に沿ってまっすぐ閉じる（塗り潰し・透けなし）
 s+=`<path d="M16 34 C16 9 104 9 104 34 L104 34 C104 36 96 37 60 37 C24 37 16 36 16 34 Z" fill="${C.white}" stroke="${C.line}" stroke-width="1.6"/>`;
 // 上部ハイライト（塗りなしの線のみ）
 s+=`<path d="M24 24 C38 15 82 15 96 24" fill="none" stroke="#dbe1ea" stroke-width="1.4"/>`;
 // 帽章（濃紺だ円に金の錨）：バンド中央に配置
 s+=`<ellipse cx="60" cy="37" rx="8.5" ry="6.5" fill="${C.band}" stroke="${C.goldDk}" stroke-width="0.7"/>`;
 s+=`<path d="M60 33 a1.4 1.4 0 1 0 0.01 0 M60 34.4 L60 41 M55.5 38 Q60 42.6 64.5 38 M56.5 35.6 L63.5 35.6" fill="none" stroke="${C.gold}" stroke-width="1.2"/>`;
 // 帽章脇の金モール（将官・佐官）：バンド内（y38付近）に収める
 if(idx>=7){for(let i=0;i<10;i++){const bx=26+i*7;s+=`<path d="M${bx} 37.5 q3 2.6 6 0" stroke="${C.gold}" stroke-width="1.5" fill="none"/>`}s+=`<path d="M24 39 q36 4 72 0" stroke="${C.gold}" stroke-width="1.2" fill="none"/>`}
 else if(idx>=4){for(let i=0;i<8;i++){const bx=29+i*7.4;s+=`<path d="M${bx} 38 q2.8 2.2 5.6 0" stroke="${C.gold}" stroke-width="1.2" fill="none" opacity="0.9"/>`}}
 // バイザー端の金ボタン
 s+=`<circle cx="26" cy="42.5" r="1.7" fill="${C.gold}"/><circle cx="94" cy="42.5" r="1.7" fill="${C.gold}"/>`;

 // ===== 肩章（長方形・角丸・金縁。参照どおり肩の上に平ら） =====
 const shoulderStripes=idx<=0?0:Math.min(4,Math.max(1,idx-2));
 const shoulderStars=Math.max(0,Math.min(3,idx-6));
 [[14,'L'],[106,'R']].forEach(([cxb,side])=>{
  const w=22,h=8,x=cxb-w/2,y=88;
  s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${C.visor}" stroke="${C.gold}" stroke-width="1.1"/>`;
  for(let i=0;i<shoulderStripes;i++){const yy=y+2.2+i*1.7;s+=`<line x1="${x+2.5}" y1="${esc(yy)}" x2="${x+w-2.5}" y2="${esc(yy)}" stroke="${C.gold}" stroke-width="1.1"/>`}
  for(let i=0;i<shoulderStars;i++){const sx=x+4.5+i*4.2,sy=y+h/2;s+=star(sx,sy,2,C.gold)}
 });

 // ===== 戦死者：減光＋喪章 =====
 if(killed){s+=`<rect x="0" y="0" width="120" height="132" rx="10" fill="#0a0f16" opacity="0.42"/>`;s+=`<rect x="86" y="6" width="30" height="8" rx="1.5" transform="rotate(35 101 10)" fill="#111"/>`}

 s+=`</svg>`;
 return s;
}
function openRoster(fid=null){
 const target=fid===null?null:S.fleets.find(f=>f.id===fid);const living=S.people.filter(p=>p.alive!==false&&!p.killed),fallen=S.people.filter(p=>p.killed);const rowOf=p=>{const r=personRank(p),assignedFleet=S.fleets.find(f=>f.id===p.assignment),isCurrent=target&&target.commander===p.id,available=!p.assignment||isCurrent;return `<tr><td class="avatarCell">${avatarSVG(p)}</td><td><span class="rankBadge">${r[1]}</span></td><td><b>${r[0]} ${p.name}</b><span class="assignmentState ${available?'free':'busy'}">${isCurrent?'現在の司令官':assignedFleet?`${assignedFleet.name}に任命中`:'無任所'}</span></td><td>操艦 ${p.pilot}</td><td>武力 ${p.force}</td><td>外交 ${p.diplomacy}</td><td>${target?`<button data-assignperson="${p.id}" ${available&&!isCurrent?'':'disabled'}>${isCurrent?'任命中':'任命'}</button>`:''}</td></tr>`};const fallenRowOf=p=>{const r=personRank(p);return `<tr class="killed"><td class="avatarCell">${avatarSVG(p)}</td><td><span class="rankBadge">${r[1]}</span></td><td><b>${r[0]} ${p.name}</b><span class="killedMark">戦死（二階級特進）</span></td><td>操艦 ${p.pilot}</td><td>武力 ${p.force}</td><td>外交 ${p.diplomacy}</td><td>—</td></tr>`};const rows=living.map(rowOf).join('')+(fallen.length?`<tr class="rosterDivider"><td colspan="7">━━ 戦死者（名簿記録・任命不可） ━━</td></tr>`+fallen.map(fallenRowOf).join(''):'');
 modal(target?`${target.name} 司令官任命`:'人事名簿',`<table class="roster"><tr><th>顔</th><th>階級章</th><th>階級・氏名・任務</th><th>操艦</th><th>武力</th><th>外交</th><th></th></tr>${rows}</table>`,[['OK',closeModal]]);
 $('modalBody').querySelectorAll('[data-assignperson]').forEach(button=>button.addEventListener('click',()=>assignCommander(fid,+button.dataset.assignperson)));
}
function assignCommander(fid,pid){
 const f=S.fleets.find(x=>x.id===fid),person=S.people.find(x=>x.id===pid&&x.alive!==false&&!x.killed);if(!f||!person)return result('任命できません','艦隊または人物が見つかりません。',()=>render());
 if(person.assignment&&person.assignment!==fid){const other=S.fleets.find(x=>x.id===person.assignment);return result('任命できません',`${person.name}は${other?.name||'別任務'}に任命中です。`,()=>openRoster(fid))}
 const former=commander(f);if(former&&former.id!==person.id)former.assignment=null;
 f.commander=person.id;person.assignment=f.id;
 result('司令官任命',`${personRank(person)[0]} ${person.name}を${f.name}の司令官に任命しました。`,()=>{log(`${person.name}を${f.name}へ任命しました。`,'good');sel={kind:'fleet',id:f.id};route={fid:f.id,pid:f.at};render()});
}
function openSystems(){modal('星系一覧',`<div class="systems">${S.planets.map(p=>`<button class="sysrow" data-p="${p.id}"><span>${p.explored?p.name:`未踏星系-${p.id}`}</span><span>${p.owner||'不明'}</span><span>${Math.floor(p.pop)}</span><span>${p.explored?`資材${Math.floor(p.materials||0)} / 燃料${Math.floor(p.fuel||0)}`:`鉱${p.ore}/重${p.deut}`}</span><span>距離${distance(S.planets[0],p).toFixed(1)}</span><span>選択</span></button>`).join('')}</div>`,[['OK',closeModal]]);$('modalBody').querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{sel={kind:'planet',id:+b.dataset.p};closeModal();render()})}function openDock(){
 const p=S.planets.find(x=>x.owner==='player'&&x.dock);if(!p)return result('造船ドック','造船ドックがありません。',closeModal);
 const local=S.fleets.filter(f=>f.owner==='player'&&f.at===p.id&&f.target===null&&f.ships.length<10);
 const queue=p.buildQueue.map(q=>`<div class="buildQueue">${SHIPS[q.ship.type].name} 建造中 / 残${q.remaining}T</div>`).join('');
 const pool=p.dockPool.map(ship=>`<div class="dockAssign"><div><b>${SHIPS[ship.type].name}</b><br>耐久${Math.ceil(ship.hp)} / 燃料${Math.floor(ship.fuel)}</div><select data-assignship="${ship.id}"><option value="">補充先を選択</option>${local.map(f=>`<option value="${f.id}">${f.name} (${f.ships.length}/10)</option>`).join('')}<option value="new">新しい艦隊を編成</option></select></div>`).join('');
 modal('造船ドック',`<h3>${p.name} Lv${p.dock}</h3><div class="routeOk">完成船 ${p.dockPool.length} / 収容上限 ${p.dock*4}</div>${queue}${pool||'<p>完成済みの船はありません。</p>'}`,[['OK',closeModal]]);
 $('modalBody').querySelectorAll('[data-assignship]').forEach(select=>select.addEventListener('change',()=>{if(select.value)assignDockShip(p.id,select.dataset.assignship,select.value)}));
}
function assignDockShip(pid,shipId,target){
 const p=S.planets[pid],idx=p.dockPool.findIndex(s=>s.id===shipId);if(idx<0)return;
 let f;if(target==='new'){f=makeFleet(S.nextFleet++,'player',pid,[],`第${S.nextFleet-1}艦隊`);S.fleets.push(f)}else f=S.fleets.find(x=>x.id===+target);
 if(!f||f.at!==pid||f.target!==null)return result('補充不可','造船ドックと同じ星系で待機中の艦隊だけ補充できます。',()=>openDock());
 if(f.ships.length>=10)return result('補充不可','艦隊は最大10隻です。',()=>openDock());
 const ship=p.dockPool.splice(idx,1)[0];f.ships.push(ship);result('艦隊補充',`${SHIPS[ship.type].name}を${f.name}へ補充しました。`,()=>{render();openDock()});
}
function openShips(){const a=[];S.fleets.filter(f=>f.owner==='player').forEach(f=>f.ships.forEach(s=>a.push([s,f.name])));S.planets.filter(p=>p.owner==='player').forEach(p=>(p.dockPool||[]).forEach(s=>a.push([s,p.name+'ドック'])));modal('宇宙船ステータス',`<div class="routeOk">自国の艦隊所属船と自国造船ドック収容船のみ表示しています。</div><div class="shipGrid">${a.map(([s,p])=>`<div class="shipCard"><b>${SHIPS[s.type].name}</b><br>${p}<br>耐久${Math.ceil(s.hp)}/${SHIPS[s.type].hp}<br>攻撃${SHIPS[s.type].atk}<br>防御${SHIPS[s.type].def}<br>燃料${Math.floor(s.fuel)}/${SHIPS[s.type].maxFuel}</div>`).join('')||'<p>自国の宇宙船はありません。</p>'}</div>`,[['OK',closeModal]])}
function log(text,k='info'){history.unshift({text,k});$('notice').innerHTML=`<span class="${k}">${text}</span>`}function modal(t,b,buttons){speed(0);$('modalTitle').textContent=t;$('modalBody').innerHTML=b;$('modalButtons').innerHTML='';buttons.forEach(([x,f])=>{const b=document.createElement('button');b.textContent=x;b.onclick=f;$('modalButtons').appendChild(b)});$('modal').classList.remove('hidden')}function closeModal(){$('modal').classList.add('hidden')}function result(t,b,f){modal(t,`<div class="routeOk">${b}</div>`,[['OK',()=>{closeModal();if(f)f()}]])}function speed(v){clearInterval(timer);if(v)timer=setInterval(tick,3000/v)}function save(m){localStorage.setItem('pg150',JSON.stringify(S));if(m)log('保存しました。','good')}function load(){const d=localStorage.getItem('pg150');if(d){S=JSON.parse(d);closeModal();render()}}
// v2.0.0 regression recovery and integrated behavior
const SAVE_KEY='planetGovernorIntegrated';
let currentSpeed=1,modalResumeSpeed=0,modalShouldResume=true;
const baseNewGame=newGame;
newGame=function(){baseNewGame();migrateState();currentSpeed=1;speed(1)};
function migrateState(){
 S.saveVersion='2.1.0';S.defeated=S.defeated||{zora:false,mira:false,nox:false};S.victory=!!S.victory;S.nextFleet=S.nextFleet||2;S.npcKnown=S.npcKnown||{zora:[],mira:[],nox:[]};
 S.planets.forEach(p=>{p.dockPool=p.dockPool||[];p.buildQueue=p.buildQueue||[];p.facilities=Object.assign({orePlant:0,fuelPlant:0,habitat:0,defense:0,dock:p.dock||0,sensor:0,battery:0,storage:0},p.facilities||{});p.facilityQueue=p.facilityQueue||null;p.materials=Number(p.materials||0);p.fuel=Number(p.fuel||0);p.independent=!!p.independent});
 ['zora','mira','nox'].forEach(f=>{const worlds=S.planets.filter(p=>p.owner===f);if(worlds.length&&!worlds.some(p=>p.homeworld===f))worlds[0].homeworld=f});
 S.planets[0].homeworld='player';
 S.fleets.forEach(f=>{f.ships=f.ships||[];f.target=f.target??null;f.commander=f.commander??null;f.ships.forEach(sh=>{sh.level=sh.level||1;sh.upgrade=Object.assign({weapon:0,armor:0,tank:0},sh.upgrade||{})})});
 S.people.forEach(p=>{p.xp=Number(p.xp||0);p.killed=!!p.killed;p.alive=p.killed?false:(p.alive!==false);p.assignment=p.assignment??null;if(p.killed&&typeof p.postRankIndex!=='number')p.postRankIndex=Math.min(rankIndexByXp(p.xp)+2,RANKS.length-1)});
}
const legacySpeed=speed;
speed=function(v){clearInterval(timer);currentSpeed=v;document.querySelectorAll('[data-speed]').forEach(b=>b.classList.toggle('active',Number(b.dataset.speed)===v));if(v)timer=setInterval(tick,3000/v)};
const legacyModal=modal;
modal=function(title,body,buttons,options={}){modalResumeSpeed=currentSpeed;modalShouldResume=options.resume!==false;speed(0);$('modalTitle').textContent=title;$('modalBody').innerHTML=body;$('modalButtons').innerHTML='';buttons.forEach(([text,fn])=>{const b=document.createElement('button');b.textContent=text;b.onclick=fn;$('modalButtons').appendChild(b)});$('modal').classList.remove('hidden')};
closeModal=function(resume=true){$('modal').classList.add('hidden');if(resume&&modalShouldResume&&modalResumeSpeed>0)speed(modalResumeSpeed)};
result=function(title,body,after){modal(title,`<div class="routeOk">${body}</div>`,[['OK',()=>{const resume=modalResumeSpeed;closeModal(false);if(after)after();if($('modal').classList.contains('hidden')&&resume>0)speed(resume)}]])};
save=function(manual){S.saveVersion='2.1.0';localStorage.setItem(SAVE_KEY,JSON.stringify(S));if(manual)log('ゲームを保存しました。','good')};
load=function(){const raw=localStorage.getItem(SAVE_KEY)||localStorage.getItem('pg150');if(!raw)return result('読込不可','セーブデータがありません。',()=>render());try{S=JSON.parse(raw);migrateState();closeModal(false);sel={kind:'planet',id:S.planets.findIndex(p=>p.owner==='player')};route=null;render();speed(1);log('セーブデータを読み込みました。','good')}catch(e){result('読込エラー','セーブデータを読み込めません。新しい星域を開始してください。',()=>render())}};
function gainXp(f,amount,reason){const p=commander(f);if(!p)return;const before=personRank(p)[0];p.xp+=amount;const after=personRank(p)[0];log(`${p.name}が${reason}で経験値${amount}を獲得しました。`,'info');if(before!==after)result('昇進',`${p.name}は${after}へ昇進しました。`,()=>render())}
function commanderCasualty(f,reason){const p=commander(f);if(!p)return;const idx=rankIndexByXp(p.xp),post=Math.min(idx+2,RANKS.length-1);p.postRankIndex=post;p.killed=true;p.alive=false;p.assignment=null;f.commander=null;log(`${p.name}は${reason}により戦死。二階級特進で${RANKS[post][0]}となりました（名簿に記録）。`,'bad')}
function commanderDemote(f,reason){const p=commander(f);if(!p)return null;const before=personRank(p)[0],idx=rankIndexByXp(p.xp),newIdx=Math.max(0,idx-1);p.xp=RANKS[newIdx][2];p.pilot=Math.max(5,Math.round(p.pilot*.85));p.force=Math.max(5,Math.round(p.force*.85));p.diplomacy=Math.max(5,Math.round(p.diplomacy*.85));const after=personRank(p)[0];p.assignment=null;f.commander=null;log(`${p.name}は${reason}の責任を問われ${before}から${after}へ降格。能力が低下しました。`,'warn');return{before,after,person:p}}
function scuttleFleet(fid){const f=S.fleets.find(x=>x.id===fid);if(!f)return;if(f.owner!=='player')return;if(f.order!=='燃料切れ・漂流')return log('自沈できるのは燃料切れで漂流中の艦隊のみです。','warn');const demo=commanderDemote(f,'艦隊の自沈');f.ships=[];pruneEmptyFleets();const body=`漂流していた${f.name}を自沈処分しました。`+(demo?`<br>司令官 ${demo.person.name} は生還し、${demo.before}から${demo.after}へ降格（能力低下）となりました。`:'<br>司令官はいませんでした。');result('艦隊を自沈',body,()=>{sel={kind:'planet',id:f.at};route=null;activeFleetId=(typeof activeFleetId!=='undefined'&&activeFleetId===fid)?null:activeFleetId;render()})}
function hostileToPlayer(owner){return owner&&owner!=='player'&&!String(owner).startsWith('independent-')&&(S.relations[owner]||0)<0}
function detectFleet(f){if(f.owner==='player')return true;const pos=currentPos(f);return S.planets.some(p=>p.owner==='player'&&p.explored&&distance(pos,p)<=10+(p.facilities?.sensor||0)*18)}
function collapseFaction(faction,captured){if(!['zora','mira','nox'].includes(faction))return;S.defeated[faction]=true;S.planets.filter(p=>p.owner===faction&&p.id!==captured.id).forEach(p=>{p.owner=`independent-${p.id}`;p.independent=true;p.homeworld=null});S.fleets.filter(f=>f.owner===faction).forEach(f=>{f.owner=`independent-${f.at}`;f.order='独立防衛'});log(`${FACS[faction][0]}は母星喪失により崩壊しました。残存星系は独立国となりました。`,'good')}
function checkVictory(){if(S.victory)return;if(['zora','mira','nox'].every(f=>S.defeated[f]||(S.relations[f]||0)>=60)){S.victory=true;result('勝利','主要3勢力を同盟化または母星制圧しました。独立国は勝利条件の対象外です。',()=>{speed(0);render()})}}
const originalSend=send;
send=function(fid,pid,order){const f=S.fleets.find(x=>x.id===fid);if(!commander(f))return result('命令できません','出航には司令官の任命が必要です。',()=>{sel={kind:'fleet',id:fid};route={fid,pid:f.at};render()});return originalSend(fid,pid,order)};
arrive=function(f){
 const p=S.planets[f.at];
 if(f.owner!=='player')return npcArrive(f,p);
 if(f.ships.some(s=>s.type==='scout'))p.explored=true;
 const enemy=S.fleets.find(x=>x.owner!=='player'&&x.at===p.id&&x.target===null&&x.ships.length&&hostileToPlayer(x.owner));
 if(enemy)return startFleetBattle(f,enemy,p);
 if(f.ships.some(s=>s.type==='scout')){
  if(!p.usable)return result('探査結果',`${p.name}<br>利用可能な惑星はありません。`,()=>{sel={kind:'planet',id:p.id};route=null;render()});
  if(!p.owner){p.owner='player';p.pop=10;p.materials=Math.max(p.materials,220);p.fuel=Math.max(p.fuel,160);refuelAtOwnedStar(f,p);gainXp(f,12,'探査任務');return result('探査完了',`${p.name}を自国へ編入しました。<br>開拓用資材220・燃料160を確保しました。`,()=>{sel={kind:'planet',id:p.id};route=null;render()})}
 }
 refuelAtOwnedStar(f,p);arrivalDialog(f,p);
};
const originalFinishFleetBattle=finishFleetBattle;
finishFleetBattle=function(win,retreat){const b=fleetBattle,p=b?.player;if(win&&p)gainXp(p,15,'艦隊戦勝利');if(!win&&!retreat&&p)commanderCasualty(p,'艦隊戦敗北');return originalFinishFleetBattle(win,retreat)};
finishDefense=function(success,message){const b=defenseBattle;if(!b)return;const f=b.fleet,p=b.planet,old=p.owner;defenseBattle=null;pruneEmptyFleets();if(success){if(['zora','mira','nox'].includes(old)&&p.homeworld!==old){S.relations[old]=Math.min(S.relations[old]||0,-60)}p.owner='player';p.pop=Math.max(1,Math.floor(p.pop*.9));p.defense=10;p.fuel=rand(20,60);p.materials=rand(80,160);if(p.facilities)p.facilities.battery=0;if(p.homeworld===old)collapseFaction(old,p);gainXp(f,30,'惑星占領');checkVictory();result('占領成功',`${p.name}を占領しました。<br>${message}<br>残存艦：${f.ships.length}隻`,()=>{sel={kind:'planet',id:p.id};route=null;render()})}else{commanderCasualty(f,'惑星攻略失敗');result('占領失敗',`${p.name}の占領に失敗しました。<br>${message}<br>残存艦：${f.ships.length}隻`,()=>render())}};
function repairFleet(f){const p=S.planets[f.at];if(p.owner!=='player'||!(p.dock||p.facilities?.dock))return result('修理不可','自国の造船ドックがある星系で待機してください。',()=>render());let need=0;f.ships.forEach(s=>need+=Math.ceil((SHIPS[s.type].hp-s.hp)*.5));if(need<=0)return result('修理不要','全艦が完全な状態です。',()=>render());if(p.materials<need)return result('修理不可',`${p.name}の資材が${need-p.materials}不足しています。`,()=>render());p.materials-=need;f.ships.forEach(s=>s.hp=SHIPS[s.type].hp);result('修理完了',`資材${need}を使用し、${f.name}を修理しました。`,()=>render())}
function transferResources(fromId,toId,materials,fuel){const a=S.planets[fromId],b=S.planets[toId];const m=Math.min(materials,a.materials),fu=Math.min(fuel,a.fuel);a.materials-=m;a.fuel-=fu;b.materials=Math.min(stockCapacity(b),b.materials+m);b.fuel=Math.min(stockCapacity(b),b.fuel+fu);log(`${a.name}から${b.name}へ資材${Math.floor(m)}・燃料${Math.floor(fu)}を輸送しました。`,'info')}
function openTransport(f){const from=S.planets[f.at],targets=S.planets.filter(p=>p.owner==='player'&&p.id!==from.id);if(!f.ships.some(s=>s.type==='transport'))return result('輸送不可','輸送船が必要です。',()=>render());modal('資源輸送',`<div class="auditBanner">積載元：${from.name}　資材${Math.floor(from.materials)}　燃料${Math.floor(from.fuel)}</div><label>輸送先 <select id="transportTo">${targets.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select></label><label>資材 <input id="transportMat" type="number" min="0" max="300" value="0"></label><label>燃料 <input id="transportFuel" type="number" min="0" max="300" value="0"></label>`,[['輸送実行',()=>{const to=+$('transportTo').value,m=Math.min(300,+$('transportMat').value||0),fu=Math.min(300-m,+$('transportFuel').value||0);transferResources(from.id,to,m,fu);closeModal();render()}],['閉じる',closeModal]])}
openSystems=function(){const base=sel.kind==='fleet'?currentPos(S.fleets.find(f=>f.id===sel.id)):S.planets.find(p=>p.owner==='player');modal('星系一覧',`<div class="systems"><div class="syshead"><span>星系</span><span>所属・種類</span><span>人口</span><span>資源</span><span>距離</span><span></span></div>${S.planets.map(p=>{const d=distance(base,p).toFixed(1);if(!p.explored)return `<button class="sysrow" data-p="${p.id}"><span>未踏星系-${p.id}</span><span class="secret">未探査</span><span class="secret">不明</span><span class="secret">不明</span><span>${d}</span><span>選択</span></button>`;const owner=p.owner==='player'?'自国':FACS[p.owner]?.[0]||(p.independent?'独立国':p.owner||'無所属');return `<button class="sysrow" data-p="${p.id}"><span>${p.name}</span><span>${owner}<small>${TYPES[p.type][0]}</small></span><span>${Math.floor(p.pop)}万</span><span>資材${Math.floor(p.materials)} / 燃料${Math.floor(p.fuel)}</span><span>${d}</span><span>選択</span></button>`}).join('')}</div>`,[['閉じる',closeModal]]);$('modalBody').querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{sel={kind:'planet',id:+b.dataset.p};closeModal();render()})};
const originalOpenFacilities=openFacilities;
openFacilities=function(pid=sel.kind==='planet'?sel.id:S.planets.findIndex(p=>p.owner==='player')){const own=S.planets.filter(p=>p.owner==='player'&&p.explored&&p.usable);const p=S.planets[pid]&&S.planets[pid].owner==='player'?S.planets[pid]:own[0];if(!p)return result('施設建築','建築可能な自国星系がありません。',()=>render());originalOpenFacilities(p.id);const tabs=document.createElement('div');tabs.className='facilityTabs';tabs.innerHTML=own.map(x=>`<button data-facplanet="${x.id}" ${x.id===p.id?'class="active"':''}>${x.name}</button>`).join('');$('modalBody').prepend(tabs);tabs.querySelectorAll('[data-facplanet]').forEach(b=>b.onclick=()=>openFacilities(+b.dataset.facplanet))};
openDock=function(pid=null){const docks=S.planets.filter(p=>p.owner==='player'&&(p.dock||p.facilities?.dock));if(!docks.length)return result('造船ドック','造船ドックがありません。',()=>render());const p=pid===null?docks[0]:S.planets[pid],local=S.fleets.filter(f=>f.owner==='player'&&f.at===p.id&&f.target===null&&f.ships.length<10);modal('造船ドック',`<div class="dockTabs">${docks.map(x=>`<button data-dockplanet="${x.id}" ${x.id===p.id?'class="active"':''}>${x.name}</button>`).join('')}</div><h3>${p.name} Lv${p.dock||p.facilities.dock}</h3>${p.buildQueue.map(q=>`<div class="buildQueue">${SHIPS[q.ship.type].name} 残${q.remaining}T</div>`).join('')}${p.dockPool.map(ship=>`<div class="dockAssign"><div>${SHIPS[ship.type].name}</div><select data-assignship="${ship.id}"><option value="">補充先</option>${local.map(f=>`<option value="${f.id}">${f.name}</option>`).join('')}<option value="new">新艦隊</option></select></div>`).join('')||'<p>完成船はありません。</p>'}`,[['閉じる',closeModal]]);$('modalBody').querySelectorAll('[data-dockplanet]').forEach(b=>b.onclick=()=>openDock(+b.dataset.dockplanet));$('modalBody').querySelectorAll('[data-assignship]').forEach(x=>x.onchange=()=>{if(x.value)assignDockShip(p.id,x.dataset.assignship,x.value)})};
function renderDiplomacy(){const host=$('diplomacy');host.innerHTML=['zora','mira','nox'].map(f=>{const known=S.contacted?.[f]||S.planets.some(p=>p.explored&&p.owner===f),v=S.relations[f]||0;return `<div class="card"><b>${known?FACS[f][0]:'未接触勢力'}</b><br>関係 ${known?v:'不明'}${known?`<div><button data-dip="${f}" data-delta="10">支援</button><button data-ally="${f}" ${v>=50?'':'disabled'}>同盟</button><button data-war="${f}">敵対</button></div>`:''}</div>`}).join('');host.querySelectorAll('[data-dip]').forEach(b=>b.onclick=()=>{const f=b.dataset.dip;if(S.money<300)return log('支援資金が不足しています。','warn');S.money-=300;S.relations[f]=Math.min(100,(S.relations[f]||0)+10);render()});host.querySelectorAll('[data-ally]').forEach(b=>b.onclick=()=>{S.relations[b.dataset.ally]=60;checkVictory();render()});host.querySelectorAll('[data-war]').forEach(b=>b.onclick=()=>{S.relations[b.dataset.war]=-100;render()})}
const originalRender=render;
render=function(){originalRender();renderDiplomacy()};
map.onpointerup=selectMap;window.onresize=draw;document.querySelectorAll('[data-speed]').forEach(b=>b.onclick=()=>speed(+b.dataset.speed));document.querySelectorAll('[data-build]').forEach(b=>b.onclick=()=>build(b.dataset.build));$('facilityMenu').onclick=()=>openFacilities();$('roster').onclick=openRoster;$('systemMenu').onclick=openSystems;$('dockMenu').onclick=openDock;$('shipStatusMenu').onclick=openShips;$('saveMenu').onclick=()=>modal('セーブ管理','',[['保存',()=>save(true)],['読込',load],['OK',closeModal]]);$('history').onclick=()=>modal('通知履歴',history.map(x=>`<div class="card ${x.k}">${x.text}</div>`).join(''),[['OK',closeModal]]);$('newWorld').onclick=()=>modal('新しい星域','<div class="routeWarning">現在のゲームを終了し、新しい星域を作成します。<br>この操作は元に戻せません。よろしいですか？</div>',[['作成する',()=>{closeModal();newGame()}],['キャンセル',()=>closeModal()]]);try{if(typeof ResizeObserver!=='undefined'){const __ro=new ResizeObserver(()=>{try{draw()}catch(e){}});__ro.observe(map)}}catch(e){}newGame();
