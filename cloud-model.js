import {initial,player,reduce} from './domain.js';
import {normalizeWorld,MATERIALS,resourceNodes,jobLevel,zoneAccess} from './professions.js';
export const META_KEYS=['version','schemaVersion','cohort','paused','bridge','warehouse','projects','uses','thanks','activity'];
export function cloudMeta(state){return Object.fromEntries(META_KEYS.map(k=>[k,state[k]]));}
export function makeCloudPlayer(uid,name,cohort){return {...normalizeWorld({...initial(),players:{[uid]:player(uid,name,cohort)}}).players[uid],clock:{},traceSlots:{capsule0:null,capsule1:null,capsule2:null,whisper0:null,whisper1:null,whisper2:null},lastOperation:null};}
export function runKey(h){return h?.cycleId||null;}
export function millis(value){return value?.toMillis?value.toMillis():value?.seconds!==undefined?value.seconds*1000+Math.floor((value.nanoseconds||0)/1e6):Number(value||0);}
export function cloudAction(state,actor,action,now,node=null,run=null){
 const s=normalizeWorld(state),p=s.players[actor.uid],a=action,fail=m=>{throw Error(m);};
 const result={state:s,node:undefined,run:undefined,claim:null};
 if(s.paused&&actor.role!=='teacher'&&!['visit','wear','equip','withdrawMemory','withdrawTrace','startRest','finishRest','cancelRest','claimHarvest','clearHarvest'].includes(a.type))fail('世界休息中，請稍後再試');
 if(['startHarvest','workHarvest','abandonHarvest','claimHarvest','clearHarvest'].includes(a.type)){
  const h=p.harvest;if(!h)fail('請先調查採集節點');
  const material=resourceNodes(h.zone)[h.node]?.material,m=MATERIALS[material],session=node?.session;
  if(a.type==='startHarvest'){
   if(h.phase!=='surveyed')fail('先調查採集節點');const access=zoneAccess(s,p,h.zone);if(!access.ok)fail(access.reason);
   if(p.job!==m.job||jobLevel(p)<m.tier)fail('職業或職級不符');if(p.stamina<3)fail('體力不足 3 點，請回集會所休息');if(p.restUntil)fail('先完成休息');
   const active=session&&now-millis(node.lastStepAt)<120000?session:null;
   if(active&&(active.members.length>=2||active.hits>0||active.members.includes(p.uid)))fail('節點已滿或已開始作業');
   const next=active?{...active,members:[...active.members,p.uid],mode:'coop',needed:m.hits*2,updatedAt:now}:{members:[p.uid],mode:'solo',hits:0,needed:m.hits,lastActor:null,lastHit:0,updatedAt:now,cycleId:a.id,legacy:false};
   p.stamina-=3;p.harvest={...h,phase:'working',cycleId:next.cycleId,startedAt:now,hits:next.hits,needed:next.needed};
   result.node={zone:h.zone,node:h.node,material,session:next};
  }else if(a.type==='workHarvest'){
   if(h.phase!=='working'||!session||session.cycleId!==h.cycleId||!session.members.includes(p.uid))fail('作業已結束或解散');
   if(now-millis(node.lastStepAt)>=120000)fail('作業閒置逾時，請重新調查');if(now-millis(node.lastStepAt)<900)fail('請穩定操作，稍候再採集');if(session.mode==='coop'&&session.lastActor===p.uid)fail('請等待夥伴操作，兩人必須輪流');
   const next={...session,hits:session.hits+1,lastActor:p.uid,lastHit:now,updatedAt:now};p.harvest={...h,hits:next.hits,needed:next.needed,lastHit:now};
   result.node={zone:h.zone,node:h.node,material,session:next.hits>=next.needed?null:next};
   if(next.hits>=next.needed)result.run={cycleId:session.cycleId,zone:h.zone,node:h.node,material,members:session.members,quantity:m.yield+(session.mode==='coop'?1:0)};
  }else if(a.type==='claimHarvest'){
   if(!run||run.cycleId!==h.cycleId||!run.members.includes(p.uid))fail('尚未完成這次採集');
   const reward=MATERIALS[run.material];p.bag[run.material]+=run.quantity;p.professionXP[reward.job]+=3;p[reward.family==='wood'?'gatherWood':'gatherStone']+=run.quantity;p.harvest=null;result.claim=run.cycleId;
   s.events.push({id:a.id,type:'harvest',actor:p.uid,name:p.name,cohort:p.cohort,time:now,text:`完成${run.members.length===2?'雙人':'單人'}採集，取得 ${run.quantity} 份${reward.name}`});
  }else{
   if(a.type==='clearHarvest'&&((session?.cycleId===h.cycleId&&now-millis(node.lastStepAt)<120000)||run))fail('採集作業仍在進行或尚待收取');
   p.harvest=null;if(a.type==='abandonHarvest'&&session&&session.cycleId===h.cycleId)result.node={zone:h.zone,node:h.node,material,session:null};
  }
  return result;
 }
 const clean={...s,harvestNodes:{},receipts:[],events:[]};result.state=reduce(clean,actor,a,now);return result;
}
