import {gameNow} from './time.js';
import {MATERIALS,resourceNodes} from './professions.js';
export const HARVEST_LEASE_MS=120000;
export function harvestKey(zone,node){return `${zone}:${node}`;}
export function harvestStatus(state,zone,node,now=gameNow()){
 const pool=state.harvestNodes?.[harvestKey(zone,node)],session=pool?.session;
 return {session:session&&(session.legacy||now-session.updatedAt<HARVEST_LEASE_MS)?session:null};
}
export function releaseHarvest(state,zone,node){
 const key=harvestKey(zone,node),pool=state.harvestNodes[key];
 for(const p of Object.values(state.players))if(p.harvest?.zone===zone&&p.harvest.node===node)p.harvest=null;
 if(pool)delete state.harvestNodes[key];
}
export function expireHarvestSessions(state,now){
 for(const [key,pool] of Object.entries(state.harvestNodes))if(pool.session&&!pool.session.legacy&&now-pool.session.updatedAt>=HARVEST_LEASE_MS){const split=key.lastIndexOf(':');releaseHarvest(state,key.slice(0,split),Number(key.slice(split+1)));}
}
export function harvestMaterial(zone,node){return MATERIALS[resourceNodes(zone)[node]?.material];}
