export const ACTION_FEEDBACK={
 equip:{label:'換上今天的搭配',icon:'♙',ms:400},leaveTrace:{label:'把這段話交給旅程',icon:'✧',ms:1100},echoTrace:{label:'送回一份回聲',icon:'♡',ms:500},discoverTrace:{label:'慢慢聆聽留下的話',icon:'✧',ms:700},
 changeJob:{label:'登記職業與工具',icon:'⚒',ms:850},sell:{label:'核對收購數量與貨款',icon:'▣',ms:750},inspectNode:{label:'調查材質與安全方向',icon:'⌕',ms:900},startHarvest:{label:'消耗體力並準備工具',icon:'⚒',ms:1000},workHarvest:{label:'穩定完成一道採集工序',icon:'⚒',ms:1500},buildHouse:{label:'搭設公共房舍',icon:'⌂',ms:2300},
 gather:{label:'細心採集',icon:'♧',ms:1800},craft:{label:'順著木紋加工',icon:'⚒',ms:2100},
 build:{label:'接合橋面',icon:'⚒',ms:2300},donate:{label:'運入工程材料',icon:'▤',ms:800},
 buy:{label:'整理購物包裹',icon:'▣',ms:650},accept:{label:'收好任務委託',icon:'⚑',ms:450},claim:{label:'整理旅程獎勵',icon:'✧',ms:850},
 care:{label:'檢查並整理補給',icon:'☀',ms:1900},survey:{label:'仔細觀察棲地',icon:'♧',ms:2400},
 store:{label:'把物資放上共享架',icon:'▤',ms:600},withdraw:{label:'整理領取的物資',icon:'▤',ms:600},thank:{label:'寫一張感謝小卡',icon:'♡',ms:650},saveMemory:{label:'收存這一刻',icon:'✧',ms:800}
};
export function createActionRunner({onState=()=>{},schedule=requestAnimationFrame,now=()=>performance.now()}={}){
 let current=null;
 return {get busy(){return !!current;},get committing(){return current?.phase==='committing';},
  cancel(){if(current&&current.phase==='working')current.cancelled=true;},
  async run(type,commit){
   if(current)throw Error('還有一件工作正在進行，請稍候');
   const profile=ACTION_FEEDBACK[type];if(!profile)return commit();
   const task={...profile,type,phase:'working',cancelled:false,percent:0};current=task;const start=now();
   try{
    await new Promise((resolve,reject)=>{const step=()=>{if(task.cancelled){reject(Error('已取消工作；尚未扣除或取得材料'));return;}const t=Math.min(1,(now()-start)/task.ms);task.percent=Math.floor(t*95);onState({...task});if(t>=1)resolve();else schedule(step);};step();});
    task.phase='committing';task.percent=95;onState({...task});
    const result=await commit();task.phase='done';task.percent=100;onState({...task});return result;
   }catch(e){onState({...task,phase:task.cancelled?'cancelled':'error',label:task.cancelled?'工作已取消':'這次未完成',message:e.message});throw e;}
   finally{current=null;}
  }
 };
}
