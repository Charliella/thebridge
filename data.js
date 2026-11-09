import {createPresence} from './presence.js';
import {createCloudStore} from './cloud-data.js';
import {CLASS_ROSTER,CLASS_TEACHER_UID} from './class-roster.js';
import {config} from './config.js';
import {initial,reduce} from './domain.js';
import {normalizeWorld} from './professions.js';
const KEY='zhuqiao-world-v1',listeners=new Set();let activeWorldId=null,actor=null,db,auth,cloud,presenceFeed,presenceOff,presenceState={},lastWorld,api,unsub;
const read=()=>normalizeWorld(JSON.parse(localStorage.getItem(KEY)||'null')||initial());
const notify=()=>listeners.forEach(f=>f(read()));
addEventListener('storage',e=>{if(e.key===KEY)notify();});
export const repository={
 mode:config.mode,
 get worldId(){return activeWorldId||config.worldId;},
 async login(username,password){
  if(config.mode==='firebase'){
   const [app,A,D,R]=await Promise.all([import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js'),import('https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js')]);
   const instance=app.getApps()[0]||app.initializeApp(config.firebase);auth=A.getAuth(instance);db=D.getFirestore(instance);api={A,D};await A.setPersistence(auth,A.browserSessionPersistence);
   if(!username.includes('@'))throw Error('請輸入完整 Email，以免登入同學的帳號');
   const credential=await A.signInWithEmailAndPassword(auth,username,password);actor={uid:credential.user.uid,role:credential.user.uid===CLASS_TEACHER_UID?'teacher':'student',level:credential.user.uid===CLASS_TEACHER_UID?1:9};
   const requestedWorld=new URLSearchParams(location.search).get('qaWorld');const worldId=(['localhost','127.0.0.1'].includes(location.hostname)&&/^qa-[a-z0-9-]{1,50}$/.test(requestedWorld||''))?requestedWorld:config.worldId;
   activeWorldId=worldId;cloud=createCloudStore({db,D,actor,worldId,roster:CLASS_ROSTER,onError:e=>window.dispatchEvent(new CustomEvent('dataerror',{detail:e}))});await cloud.bootstrap();presenceFeed=createPresence({R,db:R.getDatabase(instance),actor,worldId,onUpdate:p=>{presenceState=p;if(lastWorld)listeners.forEach(f=>f({...lastWorld,presence:p},{presenceOnly:true}));},onError:detail=>window.dispatchEvent(new CustomEvent('dataerror',{detail}))});await presenceFeed.connect();return actor;
  }
  const accounts={teacher:{password:'Bridge@2026',role:'teacher',level:1},test:{password:'Test@2026',role:'student',level:9}};
  const account=accounts[username];if(!account||password!==account.password)throw Error('帳號或密碼不正確');actor={uid:username,role:account.role,level:account.level};if(!localStorage.getItem(KEY))localStorage.setItem(KEY,JSON.stringify(initial()));return actor;
 },
 subscribe(fn){if(config.mode==='firebase'){listeners.add(fn);presenceOff=presenceFeed.subscribe();unsub=cloud.subscribe(s=>{lastWorld=s;presenceFeed.updateRoster(s.players);listeners.forEach(f=>f({...s,presence:presenceState}));});return()=>{unsub?.();presenceOff?.();listeners.delete(fn);};}listeners.add(fn);fn(read());return()=>listeners.delete(fn);},
 async dispatch(action){if(!actor)throw Error('請先登入');action.id||=crypto.randomUUID();if(config.mode==='firebase'){await cloud.dispatch(action);return;}
  const run=()=>{const next=reduce(read(),actor,action);localStorage.setItem(KEY,JSON.stringify(next));notify();};
  if(navigator.locks)await navigator.locks.request(KEY,run);else throw Error('此瀏覽器不支援安全的本機存檔，請改用新版 Chrome 或 Edge');
 },
 async export(){if(actor?.role!=='teacher')throw Error('需要教師權限');if(config.mode==='firebase')return cloud.export();return read();},
 async restore(value){if(actor?.role!=='teacher')throw Error('需要教師權限');if(config.mode==='firebase')throw Error('雲端還原請使用管理腳本，避免覆寫在線世界');if(value.version!==1||!value.players?.teacher||!value.players?.test||!Array.isArray(value.bridge?.completed)||!Array.isArray(value.events)||!Array.isArray(value.memories)||!Array.isArray(value.receipts)||!value.warehouse)throw Error('備份格式不相容');await navigator.locks.request(KEY,()=>{const current=read();value.revision=current.revision+1;localStorage.setItem(KEY,JSON.stringify(value));notify();});},
 async presence(value){if(presenceFeed)await presenceFeed.publish(value);},
 async logout(){if(presenceFeed)await presenceFeed.disconnect().catch(()=>{});presenceOff?.();lastWorld=null;presenceState={};unsub?.();listeners.clear();if(auth)await api.A.signOut(auth);actor=null;}
};
