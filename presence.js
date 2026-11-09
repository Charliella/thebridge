import {setServerOffset} from './time.js';
// Ephemeral cosmetics only. Money, stamina, inventory and cooperative work
// remain authoritative Firestore transactions; none can be written here.
export function createPresence({R,db,actor,worldId,onUpdate,onError}){
 R.goOnline(db);
 const base=R.ref(db,'worlds/'+worldId),own=R.ref(db,'worlds/'+worldId+'/presence/'+actor.uid),lastRoster=new Map();let off,connectedOff,timeOff,lastValue=null;
 const fail=e=>onError('即時位置同步暫時中斷；請檢查網路。');
 async function connect(){await R.get(base);setServerOffset(await new Promise((resolve,reject)=>R.onValue(R.ref(db,'.info/serverTimeOffset'),s=>resolve(s.val()||0),reject,{onlyOnce:true})));}
 function subscribe(){timeOff=R.onValue(R.ref(db,'.info/serverTimeOffset'),s=>setServerOffset(s.val()||0));off=R.onValue(base,s=>{const v=s.val()||{};onUpdate(Object.fromEntries(Object.entries(v.presence||{}).map(([uid,p])=>[uid,{...p,uid,seenAt:p.at,name:v.roster?.[uid]?.name||'旅人',look:v.roster?.[uid]?.look||{color:'#c57b4d',hat:'sun',cape:false,equipment:{}}}])));},fail);connectedOff=R.onValue(R.ref(db,'.info/connected'),async s=>{if(s.val()===true){try{await R.onDisconnect(own).remove();if(lastValue)await publish(lastValue);}catch(e){fail(e);}}});return()=>{off?.();connectedOff?.();timeOff?.();};}
 async function publish(value){lastValue=value;await R.set(own,{...value,at:R.serverTimestamp()});}
 async function updateRoster(players){if(actor.role!=='teacher')return;const changes={};for(const p of Object.values(players)){const v={name:p.name,look:{color:p.color,hat:p.hat,cape:p.cape,equipment:p.equipment}},key=JSON.stringify(v);if(lastRoster.get(p.uid)!==key){changes[p.uid]=v;lastRoster.set(p.uid,key);}}if(Object.keys(changes).length)try{await R.update(R.ref(db,'worlds/'+worldId+'/roster'),changes);}catch(e){for(const uid of Object.keys(changes))lastRoster.delete(uid);fail(e);}}
 async function disconnect(){off?.();connectedOff?.();timeOff?.();await Promise.race([R.remove(own).catch(()=>{}),new Promise(resolve=>setTimeout(resolve,500))]);R.goOffline(db);}
 return {connect,subscribe,publish,updateRoster,disconnect};
}
