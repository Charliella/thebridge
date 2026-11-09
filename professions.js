import {MAX_STAMINA,TRACE_SITES} from './journey-content.js';
// Shared content catalog. Node material and unlocks are authoritative, not client choices.
export const JOBS={none:{name:'旅人',icon:'♙',description:'自由探索、補給、加工、交易與捐助'},lumberjack:{name:'樵夫',icon:'♧',description:'辨識竹節、伐採木系資源'},miner:{name:'礦工',icon:'◇',description:'辨識礦脈、鑿採礦系資源'},builder:{name:'建築工',icon:'⚒',description:'施工橋面與建造公共房舍'}};
export const JOB_CHANGE_COST=500;
export const JOB_XP_THRESHOLDS=[0,36,120,300];
export const BRIDGE_STOPS=[{id:'grove',name:'霧語森林',zone:'pinewood'},{id:'wetland',name:'紅眼礦坑',zone:'ironworks'},{id:'highland',name:'雲背高原'},{id:'island-4',name:'星紋洲'}];
export const MATERIALS={
 wood:{name:'竹子',family:'wood',tier:1,job:'lumberjack',sell:1,yield:3,hits:2,color:'#7e9858',vein:'#c9d994'},
 stone:{name:'銅礦',family:'stone',tier:1,job:'miner',sell:2,yield:3,hits:3,color:'#a58c72',vein:'#c58b56'},
 pine:{name:'松木',family:'wood',tier:2,job:'lumberjack',sell:4,yield:3,hits:3,color:'#77936a',vein:'#d3bb87'},
 iron:{name:'鐵礦',family:'stone',tier:2,job:'miner',sell:5,yield:3,hits:4,color:'#87938e',vein:'#566e68'},
 hardwood:{name:'硬木',family:'wood',tier:3,job:'lumberjack',sell:9,yield:2,hits:4,color:'#718765',vein:'#c7ac79'},
 silver:{name:'銀礦',family:'stone',tier:3,job:'miner',sell:11,yield:2,hits:5,color:'#a5b5af',vein:'#e5eddc'},
 ebony:{name:'星紋烏木',family:'wood',tier:4,job:'lumberjack',sell:18,yield:2,hits:5,color:'#4c675b',vein:'#bdc5a1'},
 gold:{name:'金礦',family:'stone',tier:4,job:'miner',sell:20,yield:2,hits:6,color:'#a1936e',vein:'#ead17a'}
};
const repeat=(id,n)=>Array(n).fill(id);
export const RESOURCE_ZONES={
 bamboo:{name:'竹風林場',kind:'forest',material:'wood',stage:0,origin:'forest',width:6144,height:4608,next:'pinewood',description:'起始竹林。南方作業坪、西側溪竹坡、北方育竹帶相連；只出產一級竹子。',clusters:[{name:'入口竹道',fx:.5,fy:1,items:repeat('wood',6)},{name:'溪竹坡',fx:.28,fy:.54,items:repeat('wood',3)},{name:'育竹作業帶',fx:.74,fy:.36,items:repeat('wood',3)}]},
 copper:{name:'赤銅淺坑',kind:'mine',material:'stone',stage:0,origin:'mine',width:6144,height:4608,next:'ironworks',description:'起始銅礦坑。中央運礦道連接東西支坑與北側通風廊，岩壁不能穿越；只出產銅礦。',clusters:[{name:'入口銅層',fx:.5,fy:1,items:repeat('stone',6)},{name:'西銅支坑',fx:.28,fy:.54,items:repeat('stone',3)},{name:'北銅支坑',fx:.74,fy:.36,items:repeat('stone',3)}]},
 pinewood:{name:'霧語森林',kind:'forest',material:'pine',stage:1,island:'grove',origin:'forest',width:8192,height:6144,next:'oldgrowth',description:'跨心大橋第一節點。入口霧竹徑與西側竹坡仍有大量竹子，松木集中於東北霧松高地。',clusters:[{name:'霧竹徑',fx:.5,fy:1,items:repeat('wood',8)},{name:'溪霧竹坡',fx:.28,fy:.54,items:repeat('wood',8)},{name:'霧松高地',fx:.74,fy:.36,items:repeat('pine',8)}]},
 ironworks:{name:'紅眼礦坑',kind:'mine',material:'iron',stage:2,island:'wetland',origin:'mine',width:8192,height:6144,next:'silverdeep',description:'跨心大橋第二節點。銅礦留在入口與西支坑，鐵礦出現在東北紅鐵深層；紅眼是礦壁燈與含鐵岩層的地名。',clusters:[{name:'入口銅層',fx:.5,fy:1,items:repeat('stone',6)},{name:'西銅支坑',fx:.28,fy:.54,items:repeat('stone',6)},{name:'紅鐵深層',fx:.74,fy:.36,items:repeat('iron',8)}]},
 oldgrowth:{name:'古根硬木林',kind:'forest',material:'hardwood',stage:3,island:'highland',origin:'forest',width:10240,height:7680,next:'ebonywood',description:'第三橋段雲背高原的古根林。入口松木、溪邊竹子與深處硬木分區生長，保留根廊與年輪觀察庭。',clusters:[{name:'松根前林',fx:.5,fy:1,items:repeat('pine',8)},{name:'溪根交界',fx:.28,fy:.54,items:[...repeat('wood',4),...repeat('hardwood',4)]},{name:'古根深林',fx:.74,fy:.36,items:repeat('hardwood',8)}]},
 silverdeep:{name:'月痕銀礦窟',kind:'mine',material:'silver',stage:3,island:'highland',origin:'mine',width:10240,height:7680,next:'golddeep',description:'第三橋段的銀礦洞窟。入口銅鐵層、月痕分流站與北方銀晶廳形成環形運礦路線。',clusters:[{name:'銅鐵前層',fx:.5,fy:1,items:[...repeat('stone',4),...repeat('iron',2)]},{name:'月痕分流層',fx:.28,fy:.54,items:[...repeat('iron',4),...repeat('silver',2)]},{name:'銀晶深層',fx:.74,fy:.36,items:repeat('silver',8)}]},
 ebonywood:{name:'星紋烏木林',kind:'forest',material:'ebony',stage:4,island:'island-4',origin:'forest',width:12288,height:9216,description:'第四橋段星紋洲的深林。星紋烏木是本世界設定的珍稀深色木材，淡色紋理藏在深處樹心；不會出現在起始林場。',clusters:[{name:'硬木前林',fx:.5,fy:1,items:repeat('hardwood',8)},{name:'星溪交界',fx:.28,fy:.54,items:[...repeat('wood',4),...repeat('hardwood',2),...repeat('ebony',2)]},{name:'星紋核心林',fx:.74,fy:.36,items:repeat('ebony',8)}]},
 golddeep:{name:'日耀金礦脈',kind:'mine',material:'gold',stage:4,island:'island-4',origin:'mine',width:12288,height:9216,description:'第四橋段星紋洲的金礦區。由鐵層、銀層逐步深入日耀金層，金礦只在最後的指定礦脈出現。',clusters:[{name:'鐵層入口',fx:.5,fy:1,items:repeat('iron',8)},{name:'銀光分流層',fx:.28,fy:.54,items:repeat('silver',8)},{name:'日耀金層',fx:.74,fy:.36,items:repeat('gold',8)}]}
};
for(const z of Object.values(RESOURCE_ZONES)){z.trunkX=z.width/2;z.spawn={x:z.trunkX,y:z.height-480};}
export const HOUSE_PROJECTS={bambooShelter:{name:'竹風休息屋',zone:'bamboo',wood:3,stone:2,plank:1,coins:5,steps:2,x:4900,y:3500},copperShelter:{name:'礦工補給屋',zone:'copper',wood:3,stone:2,plank:1,coins:5,steps:2,x:4900,y:3500}};
export const RESOURCE_LANDMARKS={
 bamboo:[{name:'育竹保留區',fx:.14,fy:.20,text:'幼竹與根莖保留，不列為採集節點。作業竹叢與保留區分開。'},{name:'溪畔整理台',fx:.82,fy:.26,text:'整理竹材與辨認竹節的休息點。南方工坊可加工竹板。'}],
 copper:[{name:'通風檢查站',fx:.82,fy:.24,text:'南方入口、中央運礦道、兩側支坑與通風站構成安全動線。'},{name:'礦道休息坪',fx:.18,fy:.72,text:'初始淺坑只有銅礦，不會隨機掉出鐵、銀或金。'}],
 pinewood:[{name:'霧語觀林台',fx:.85,fy:.16,text:'霧語森林共有十六處竹叢、八處松木。職級一也能在這裡採竹，松木需要樵夫二級。'},{name:'溪霧保留帶',fx:.17,fy:.72,text:'霧只是氣氛效果，不遮住路標，不降低操作判定。'}],
 ironworks:[{name:'紅眼通風站',fx:.84,fy:.18,text:'第二橋段才會連通這座礦坑。紅眼只是地名，這裡沒有怪物或戰鬥。'},{name:'中央裝卸台',fx:.18,fy:.72,text:'十二處銅礦與八處鐵礦分層放置，礦工一級能採銅，二級才能採鐵。'}],
 oldgrowth:[{name:'古根步道',fx:.84,fy:.18,text:'粗樹幹與根廊旁留出步道，硬木需要三級樵夫。'},{name:'年輪觀察庭',fx:.17,fy:.72,text:'由松木前林逐步深入古根深林，較低級材料仍可取得。'}],
 silverdeep:[{name:'月光晶廳',fx:.84,fy:.18,text:'灰白銀脈需要三級礦工，每次完整收取需五道工序。'},{name:'地下觀測台',fx:.17,fy:.72,text:'中央主道與左右回環廊連接各分區，岩壁不能抄近路穿越。'}],
 ebonywood:[{name:'星紋觀察庭',fx:.84,fy:.18,text:'星紋烏木是遊戲中的四級珍稀木材；此分級不代表現實所有木材的價值排名。'},{name:'護根平台',fx:.17,fy:.72,text:'四級樵夫才能採伐星紋烏木，未達資格仍能在前林採較低級材料。'}],
 golddeep:[{name:'日耀金晶廳',fx:.84,fy:.18,text:'四級礦工才能處理金礦，需六道工序；完成立即釋放節點，不需等待重生。'},{name:'深層補給站',fx:.17,fy:.72,text:'入口保留鐵礦，分流層保留銀礦；不是每一處礦脈都變成金礦。'}]
};
for(const [id,points] of Object.entries(RESOURCE_LANDMARKS)){const z=RESOURCE_ZONES[id];for(const p of points){p.x=Math.round(z.width*p.fx);p.y=Math.round(z.height*p.fy);}}
export function jobLevel(p,job=p.job){const xp=p.professionXP?.[job]||0;return JOB_XP_THRESHOLDS.filter(n=>xp>=n).length;}
export function nextJobXP(p,job=p.job){return JOB_XP_THRESHOLDS[jobLevel(p,job)]??null;}
export function zoneAccess(s,p,id){const z=RESOURCE_ZONES[id];if(!z)return {ok:false,reason:'未知採集區'};if(z.stage&&s.bridge.completed.length<z.stage)return {ok:false,reason:`需完成第 ${z.stage} 橋段`};if(z.island&&!p.visits.includes(z.island))return {ok:false,reason:`需先親自抵達${BRIDGE_STOPS.find(i=>i.id===z.island)?.name||z.island}`};return {ok:true,reason:'可前往'};}
const offsets=[[0,0],[-280,-150],[280,-150],[-340,-480],[340,-480],[0,-700],[-680,-300],[680,-300]];
const nodeCache=new Map();
export function resourceNodes(zone){if(nodeCache.has(zone))return nodeCache.get(zone);const z=RESOURCE_ZONES[zone];if(!z)return [];const nodes=[];for(const cluster of z.clusters){const cx=Math.round(z.width*cluster.fx),cy=cluster.fy===1?z.height-720:Math.round(z.height*cluster.fy);for(let i=0;i<cluster.items.length;i++){const material=cluster.items[i],m=MATERIALS[material],node=nodes.length;nodes.push({x:cx+offsets[i][0],y:cy+offsets[i][1],id:`node~${zone}~${node}`,node,zone,material,cluster:cluster.name,name:`${m.name}${z.kind==='forest'?'叢':'脈'} ${node+1}`});}}nodeCache.set(zone,nodes);return nodes;}
export function nodeMaterial(zone,index){return MATERIALS[resourceNodes(zone).find(n=>n.node===index)?.material];}
export function zoneSummary(zone){const counts={};for(const n of resourceNodes(zone))counts[n.material]=(counts[n.material]||0)+1;return Object.entries(counts).map(([id,n])=>`${MATERIALS[id].name} ${n} 處`).join('、');}
export function resourceMapPoints(zone){const z=RESOURCE_ZONES[zone];if(!z)return [];return [...Object.entries(TRACE_SITES).filter(([,q])=>q.scene===zone).map(([id,q])=>({...q,id:`trace~${id}`})),...resourceNodes(zone),{id:`exit~${zone}`,name:z.stage?'返回跨心大橋':`返回${z.origin==='forest'?'青葉林場':'石語礦場'}`,x:z.trunkX,y:z.height-180},...(z.next?[{id:`gate~${z.next}`,name:`通往${RESOURCE_ZONES[z.next].name}`,x:z.trunkX,y:320}]:[]),...Object.entries(HOUSE_PROJECTS).filter(([,p])=>p.zone===zone).map(([id,p])=>({id:`house~${id}`,name:p.name,x:p.x,y:p.y})),...(RESOURCE_LANDMARKS[zone]||[]).map((p,i)=>({...p,id:`view~${zone}~${i}`})),...(zone==='ironworks'?[{id:'survey',name:'礦坑安全調查',x:Math.round(z.width*.6),y:Math.round(z.height*.7)}]:[])];}
const pathCache=new Map();
export function resourcePaths(zone){if(pathCache.has(zone))return pathCache.get(zone);const z=RESOURCE_ZONES[zone],mine=z.kind==='mine',paths=[{a:{x:z.trunkX,y:200},b:{x:z.trunkX,y:z.height-40},width:mine?430:100}];const cross=[z.height-1000,Math.round(z.height*.55),Math.round(z.height*.24)],left=Math.round(z.width*.20),right=Math.round(z.width*.80);for(const y of cross)paths.push({a:{x:left,y},b:{x:right,y},width:mine?240:85});for(const x of [left,right])paths.push({a:{x,y:cross[2]},b:{x,y:cross[0]},width:mine?200:70});for(const p of resourceMapPoints(zone))paths.push({a:{x:z.trunkX,y:p.y+105},b:{x:p.x,y:p.y+105},width:mine?230:65});pathCache.set(zone,paths);return paths;}
export function normalizeWorld(input){
 const s=structuredClone(input),legacy=(s.schemaVersion||0)<4;s.schemaVersion=5;s.harvestNodes||={};s.traces||=[];s.projects||={};
 for(const id of Object.keys(HOUSE_PROJECTS))s.projects[id]||={work:0,contributors:{},completedAt:null};
 for(const p of Object.values(s.players)){
  p.job=Object.hasOwn(JOBS,p.job)?p.job:'none';p.professionXP={lumberjack:0,miner:0,builder:0,...p.professionXP};p.stamina=Number.isInteger(p.stamina)?Math.max(0,Math.min(MAX_STAMINA,p.stamina)):MAX_STAMINA;p.restUntil??=null;p.location||='town';p.traceVisits||=[];p.equipment={top:'default',bottom:'default',shoes:'default',accessory:'none',...p.equipment};p.harvest??=null;p.owned||=['none','sun'];
  delete p.nodeCooldowns;
  for(const item of Object.keys(MATERIALS))p.bag[item]??=0;
  if(p.harvest&&RESOURCE_ZONES[p.harvest.zone]){const h=p.harvest,nodes=resourceNodes(h.zone);if(nodes[h.node]?.material!==h.material){const match=nodes.find(n=>n.material===h.material);if(match)h.node=match.node;else p.harvest=null;}}
 }
 if(legacy)for(const p of Object.values(s.players)){const h=p.harvest;if(h?.phase==='working'){const key=`${h.zone}:${h.node}`;s.harvestNodes[key]||={session:null};if(!s.harvestNodes[key].session)s.harvestNodes[key].session={members:[p.uid],mode:'solo',hits:h.hits,needed:h.needed,lastActor:null,lastHit:h.lastHit||0,updatedAt:h.lastHit||h.startedAt||0,legacy:true};else p.harvest=null;}}
 for(const [key,pool] of Object.entries(s.harvestNodes)){delete pool.readyAt;if(!pool.session)delete s.harvestNodes[key];}
 for(const item of Object.keys(MATERIALS))s.warehouse[item]??=0;return s;
}
