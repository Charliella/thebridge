import {gameNow} from './time.js';
import {FEED_TEXT} from './feed-text.js';
import {initial} from './domain.js';
import {normalizeWorld} from './professions.js';
import {cloudAction,cloudMeta,makeCloudPlayer,millis} from './cloud-model.js';

// All gameplay writes use an atomic transaction. Security Rules independently
// validate the operation; this client is never a source of authority.
export function createCloudStore({db,D,actor,worldId,roster,onError=()=>{}}){
 const ref=(col,id)=>D.doc(db,'worlds',worldId,col,id),col=c=>D.collection(db,'worlds',worldId,c),own=ref('players',actor.uid);
 let stopped=false,callback,cache={...initial(),players:{},events:[],memories:[],traces:[],harvestNodes:{}},unsubs=[],parts=new Map(),runUnsub,watchedRun=null,settling=false;
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const emit=()=>{if(!stopped&&callback&&cache.players[actor.uid])callback(normalizeWorld(cache));};
 const error=e=>onError(e.code==='permission-denied'?'資料權限檢查未通過，請重新登入；若仍發生請聯絡教師。':e.message);
 function mergeParts(kind){const values=new Map();for(const [key,rows] of parts)if(key.startsWith(kind+':'))for(const row of rows)values.set(row.id,row);cache[kind]=[...values.values()].sort((a,b)=>a.time-b.time);emit();}
 async function hydrateTraces(){
  const version=cache.traces;for(const t of version){const open=t.kind==='whisper'||(t.unlockMode==='bridge'?cache.bridge.completed.length>=t.unlockSegment:gameNow()>=t.openAt);
   if(t.text!==undefined||!(actor.role==='teacher'||t.uid===actor.uid||(t.status==='approved'&&open)))continue;
   try{const body=await D.getDoc(ref('traceBodies',t.id));if(!stopped&&body.exists()&&cache.traces===version){t.text=body.data().text;emit();}}catch(e){if(e.code!=='permission-denied')error(e);}
  }
 }
 function watchQuery(key,q,kind){unsubs.push(D.onSnapshot(q,s=>{parts.set(key,s.docs.map(d=>({...d.data(),id:d.id})));mergeParts(kind);if(kind==='traces')hydrateTraces();},error));}
 async function settle(){
  if(stopped||settling)return;const h=cache.players[actor.uid]?.harvest;if(h?.phase!=='working')return;
  settling=true;try{const r=await D.getDoc(ref('runs',h.cycleId));if(r.exists())await dispatch({type:'claimHarvest'});else {const n=await D.getDoc(ref('nodes',h.zone+':'+h.node));const s=n.data()?.session;if(!s||s.cycleId!==h.cycleId||gameNow()-millis(n.data()?.lastStepAt)>=120000)await dispatch({type:'clearHarvest'});}}catch(e){error(e);}finally{settling=false;}
 }
 function watchRun(){const h=cache.players[actor.uid]?.harvest,id=h?.phase==='working'?h.cycleId:null;if(id===watchedRun)return;runUnsub?.();watchedRun=id;if(id)runUnsub=D.onSnapshot(ref('runs',id),s=>{if(s.exists())settle();},error);}
 async function bootstrap(){
  if(actor.role!=='teacher'){const p=await D.getDoc(own);if(!p.exists())throw Error('教師尚未初始化班級，請先由教師登入一次。');return;}
  const meta=await D.getDoc(ref('public','state'));if(meta.exists())return;
  await D.runTransaction(db,async tx=>{const current=await tx.get(ref('public','state'));if(current.exists())return;const state=normalizeWorld(initial());tx.set(ref('public','state'),{...cloudMeta(state),revision:0,lastOperation:null});for(const p of roster)tx.set(ref('players',p.uid),makeCloudPlayer(p.uid,p.name,state.cohort));});
 }
 function subscribe(fn){callback=fn;stopped=false;
  unsubs.push(D.onSnapshot(ref('public','state'),s=>{if(s.exists()){Object.assign(cache,s.data());emit();hydrateTraces();}},error));
  const profile=s=>{if(s.exists())cache.players[actor.uid]=s.data();emit();watchRun();};
  if(actor.role==='teacher')unsubs.push(D.onSnapshot(col('players'),s=>{cache.players=Object.fromEntries(s.docs.map(d=>[d.id,d.data()]));emit();watchRun();},error));else unsubs.push(D.onSnapshot(own,profile,error));
  unsubs.push(D.onSnapshot(D.query(col('nodes'),D.where('session','!=',null)),s=>{cache.harvestNodes=Object.fromEntries(s.docs.map(d=>[d.id,d.data()]));emit();settle();},error));
  watchQuery('events:public',D.query(col('events'),D.orderBy('time','desc'),D.limit(100)),'events');
  if(actor.role==='teacher')watchQuery('events:admin',D.query(col('audit'),D.orderBy('time','desc'),D.limit(100)),'events');
  for(const kind of ['memories','traces']){
   if(actor.role==='teacher')watchQuery(kind+':all',col(kind),kind);
   else {watchQuery(kind+':own',D.query(col(kind),D.where('uid','==',actor.uid)),kind);watchQuery(kind+':public',D.query(col(kind),D.where('status','==','approved'),...(kind==='memories'?[D.where('scope','==','class')]:[])),kind);}
  }
  const timer=setInterval(()=>{hydrateTraces();settle();},15000);return ()=>{stopped=true;unsubs.splice(0).forEach(u=>u());runUnsub?.();clearInterval(timer);};
 }
 async function dispatch(action){
  const a={...action,id:action.id||crypto.randomUUID()};if(!/^[a-zA-Z0-9_-]{1,100}$/.test(a.id))throw Error('操作識別格式錯誤');
  return D.runTransaction(db,async tx=>{
   const operationId=actor.uid+'_'+a.id,operationRef=ref('operations',operationId);
   const [os,ms,ps]=await Promise.all([tx.get(operationRef),tx.get(ref('public','state')),tx.get(own)]);if(os.exists())return;
   if(!ms.exists()||!ps.exists())throw Error('班級角色尚未建立');const raw=ps.data(),now=gameNow();
   const state={...initial(),...ms.data(),players:{[actor.uid]:raw},events:[],receipts:[],harvestNodes:{},memories:[],traces:cache.traces.filter(t=>t.uid===actor.uid)};
   const reads=[];let node=null,run=null,targetRaw=null,targetNode=null;
   const h=raw.harvest;
   if(h&&['startHarvest','workHarvest','abandonHarvest','clearHarvest','claimHarvest'].includes(a.type)){
    const n=await tx.get(ref('nodes',h.zone+':'+h.node));node=n.exists()?n.data():null;
    if(h.cycleId){const r=await tx.get(ref('runs',h.cycleId));run=r.exists()?r.data():null;}
   }
   if(a.type==='editPlayer'||a.type==='support'){const t=await tx.get(ref('players',a.uid));if(!t.exists())throw Error('找不到學生');targetRaw=t.data();state.players[a.uid]=targetRaw;if(targetRaw.harvest?.phase==='working'){const h=targetRaw.harvest;const n=await tx.get(ref('nodes',h.zone+':'+h.node));if(n.exists()&&n.data().session?.cycleId===h.cycleId)targetNode={id:n.id,data:n.data()};}}
   const memoryId=['moderate','withdrawMemory'].includes(a.type)?a.memory:null;
   const traceId=['moderateTrace','withdrawTrace','discoverTrace','echoTrace'].includes(a.type)?a.trace:null;
   if(memoryId){const s=await tx.get(ref('memories',memoryId));if(s.exists())state.memories=[s.data()];}
   if(traceId){const s=await tx.get(ref('traces',traceId));if(s.exists()){state.traces=state.traces.filter(t=>t.id!==traceId);state.traces.push(s.data());}}
   if(a.type==='leaveTrace'){
    const keys=[0,1,2].map(i=>a.kind+i),old=[];for(const key of keys){const id=raw.traceSlots[key];if(id){const t=await tx.get(ref('traces',id));old.push([key,t.data()]);}else old.push([key,null]);}
    a.slot=old.find(([,t])=>!t||['withdrawn','rejected'].includes(t.status))?.[0];if(!a.slot)throw Error('每種痕跡最多保留三則，請先撤回舊內容');
    state.traces=old.map(([,t])=>t).filter(Boolean);
   }
   const result=cloudAction(state,actor,a,now,node,run),next=result.state;
   const stamp=D.serverTimestamp();tx.set(operationRef,{uid:actor.uid,at:stamp,clientNow:now,action:a});
   const profile={...next.players[actor.uid],clock:{...raw.clock,[a.type]:stamp},lastOperation:operationId};
   if(a.type==='leaveTrace')profile.traceSlots={...raw.traceSlots,[a.slot]:a.id};
   tx.set(own,profile);
   if(targetNode)tx.set(ref('nodes',targetNode.id),{...targetNode.data,session:null,lastStepAt:stamp,lastOperation:operationId});
   if(targetRaw&&a.uid!==actor.uid)tx.set(ref('players',a.uid),{...next.players[a.uid],clock:targetRaw.clock,lastOperation:operationId});
   const meta=cloudMeta(next);if(!same(meta,cloudMeta(state)))tx.set(ref('public','state'),{...meta,revision:ms.data().revision+1,lastOperation:operationId});
   if(result.node!==undefined)tx.set(ref('nodes',h.zone+':'+h.node),{...result.node,lastStepAt:stamp,lastOperation:operationId});
   if(result.run)tx.set(ref('runs',result.run.cycleId),{...result.run,completedAt:stamp,lastOperation:operationId});
   if(result.claim)tx.set(ref('claims',actor.uid+'_'+result.claim),{uid:actor.uid,cycleId:result.claim,at:stamp,lastOperation:operationId});
   if(a.type==='memory'||memoryId){const m=next.memories.find(m=>m.id===(memoryId||a.id));if(m)tx.set(ref('memories',m.id),{...m,lastOperation:operationId});}
   if(a.type==='leaveTrace'||traceId){const t=next.traces.find(t=>t.id===(traceId||a.id));if(t){const {text,...header}=t;tx.set(ref('traces',t.id),{...header,...(a.type==='leaveTrace'?{slot:a.slot}:{}),lastOperation:operationId});if(a.type==='leaveTrace')tx.set(ref('traceBodies',t.id),{uid:actor.uid,text});}}
   next.events.forEach((e,i)=>tx.set(ref(e.type==='admin'?'audit':'events',operationId+'_'+i),{...e,text:e.type==='admin'?e.text:FEED_TEXT[e.type],id:operationId+'_'+i,lastOperation:operationId}));
  });
 }
 async function exportWorld(){if(actor.role!=='teacher')throw Error('需要教師權限');const out={projectId:db.app.options.projectId,worldId,exportedAt:new Date().toISOString(),collections:{public:{state:(await D.getDoc(ref('public','state'))).data()}}};for(const kind of ['players','nodes','runs','claims','operations','events','audit','memories','traces','traceBodies']){const s=await D.getDocs(col(kind));out.collections[kind]=Object.fromEntries(s.docs.map(d=>[d.id,d.data()]));}return out;}
 return {bootstrap,subscribe,dispatch,export:exportWorld};
}
