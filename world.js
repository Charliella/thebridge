import {TRACE_SITES} from './journey-content.js';
// Geography grows independently of character size and the viewport.
import {RESOURCE_ZONES,BRIDGE_STOPS,resourceMapPoints} from './professions.js';
import {resourceCanWalk,resourceRoute,paintResourceWorld,paintResourceMinimap} from './profession-map.js';
export const GEO_SCALE=3;
export const WORLD={width:36864,height:27648,tile:32};
export const MOVEMENT={factor:.6,walk:147,run:252,navigation:252};
export const SPAWN={x:12600,y:13500};
export const LANDMARKS=[
 ...Object.entries(TRACE_SITES).filter(([,q])=>q.scene==='town').map(([id,q])=>({...q,id:`trace~${id}`})),
 {id:'forest',name:'青葉森林',x:5400,y:6000,icon:'♧'},
 {id:'quests',name:'任務中心',x:12000,y:9900,icon:'⚑'},
 {id:'hall',name:'集會所',x:15600,y:10800,icon:'☀'},
 {id:'shop',name:'河畔商店',x:10200,y:14400,icon:'⌂'},
 {id:'mine',name:'石語礦場',x:5100,y:21300,icon:'◇'},
 {id:'bridge',name:'跨心大橋',x:21600,y:13800,icon:'≋'}
];
export const BRIDGE={shore:22500,y:13800,halfWidth:120,firstSpan:4500,span:3300};
export function bridgeEnd(n){return n<=0?BRIDGE.shore:BRIDGE.shore+BRIDGE.firstSpan+(n-1)*BRIDGE.span;}
export function islandFor(n){return {id:['grove','wetland','highland'][n-1]||`island-${n}`,name:BRIDGE_STOPS[n-1]?.name||`沿河小島 ${n}`,x:bridgeEnd(n),y:BRIDGE.y+(n%2?-1400:1400),rx:850,ry:620,n};}
export const GATES=[1,2,3].map(islandFor);
export const REGIONS={grove:{width:18432,height:13824,spawn:{x:9000,y:12300}},wetland:{width:18432,height:13824,spawn:{x:9000,y:12300}},highland:{width:18432,height:13824,spawn:{x:9000,y:12300}}};
export function bounds(scene,completed=0){return scene==='town'?{...WORLD,width:Math.max(WORLD.width,bridgeEnd(completed+1)+2400)}:RESOURCE_ZONES[scene]||REGIONS[scene];}
export function islandsFor(completed,includeNext=true){return Array.from({length:Math.max(0,completed)+(includeNext?1:0)},(_,i)=>islandFor(i+1));}
export function regionPoints(scene){if(RESOURCE_ZONES[scene])return resourceMapPoints(scene);return [{id:'return',name:'返回橋頭',x:9000,y:12600},...(scene==='grove'?[{id:'gate~pinewood',name:'霧語森林入口',x:8200,y:11200},{id:'care',name:'林地補給亭',x:12600,y:5700}]:scene==='wetland'?[{id:'survey',name:'礦坑安全調查',x:12000,y:6300},{id:'gate~ironworks',name:'紅眼礦坑入口',x:8200,y:11200},{id:'care',name:'礦坑補給亭',x:5400,y:9600}]:[{id:'gate~oldgrowth',name:'古根硬木林入口',x:8200,y:11200},{id:'gate~silverdeep',name:'月痕銀礦窟入口',x:10000,y:11200},{id:'care',name:'高原補給亭',x:5100,y:7800}])];}
export function cameraAt(position,scene,zoom=1,completed=0){const b=bounds(scene,completed);return {x:Math.max(0,Math.min(b.width-1000/zoom,position.x-500/zoom)),y:Math.max(0,Math.min(b.height-760/zoom,position.y-380/zoom)),width:1000/zoom,height:760/zoom,zoom};}
export function screenToWorld(x,y,camera){return {x:camera.x+x/camera.zoom,y:camera.y+y/camera.zoom};}
export function islandAt(x,y,completed){
 const nearest=Math.round((x-bridgeEnd(1))/BRIDGE.span)+1;
 for(let n=Math.max(1,nearest-1);n<=Math.min(completed,nearest+1);n++){const i=islandFor(n);const land=((x-i.x)/i.rx)**2+((y-i.y)/i.ry)**2<=1;const dock=Math.abs(x-i.x)<=65&&y>=Math.min(i.y,BRIDGE.y)&&y<=Math.max(i.y,BRIDGE.y);if(land||dock)return i;}
 return null;
}
export function canWalk(x,y,scene,completed){if(RESOURCE_ZONES[scene])return resourceCanWalk(x,y,scene);const b=bounds(scene,completed);if(x<40||x>b.width-40||y<60||y>b.height-40)return false;if(scene!=='town'||x<=BRIDGE.shore)return true;
 if(completed>0&&x<=bridgeEnd(completed)&&Math.abs(y-BRIDGE.y)<=BRIDGE.halfWidth)return true;
 return !!islandAt(x,y,completed);
}
export function routeTo(from,to,scene,completed){
 if(RESOURCE_ZONES[scene])return resourceRoute(from,to,scene);
 if(!canWalk(to.x,to.y,scene,completed))throw Error('這裡是巨河水面或未開放的小島，請先連通橋段。');
 if(scene!=='town'||from.x<=BRIDGE.shore&&to.x<=BRIDGE.shore)return [to];
 const route=[],fromIsland=islandAt(from.x,from.y,completed),toIsland=islandAt(to.x,to.y,completed);
 if(fromIsland){route.push({x:fromIsland.x,y:from.y},{x:fromIsland.x,y:BRIDGE.y});}
 else if(from.x<=BRIDGE.shore)route.push({x:BRIDGE.shore-140,y:BRIDGE.y});
 else route.push({x:from.x,y:BRIDGE.y});
 if(toIsland)route.push({x:toIsland.x,y:BRIDGE.y},{x:toIsland.x,y:to.y},to);
 else if(to.x<=BRIDGE.shore)route.push({x:BRIDGE.shore-140,y:BRIDGE.y},to);
 else route.push({x:to.x,y:BRIDGE.y},to);
 return route;
}
function hash(n){const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function distanceLine(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
function visible(x,y,c,pad=180){return x>c.x-pad&&x<c.x+c.width+pad&&y>c.y-pad&&y<c.y+c.height+pad;}
const townRoads=LANDMARKS.map(p=>[SPAWN,{x:p.x,y:SPAWN.y},{x:p.x,y:p.y+100}]);
function road(points,H,width=78){const a=points.map(p=>[p.x,p.y]);H.path(a,'#c5c4a2',width+16);H.path(a,'#e1d5b4',width);}
function vegetation(c,scene,H){
 // Stable, independent 256-unit chunks. Enlarging the world does not allocate a giant tree list.
 const points=scene==='town'?LANDMARKS:regionPoints(scene),roads=scene==='town'?townRoads:points.map(p=>[{x:9000,y:9900},{x:p.x,y:9900},p]);
 for(let gy=Math.floor((c.y-150)/256);gy<=(c.y+c.height+150)/256;gy++)for(let gx=Math.floor((c.x-150)/256);gx<=(c.x+c.width+150)/256;gx++){
  for(let k=0;k<6;k++){const seed=gx*8971+gy*12907+k*1093,x=gx*256+hash(seed)*256,y=gy*256+hash(seed+1)*256;
   if(scene==='town'&&x>BRIDGE.shore-100)continue;
   if(scene==='town'&&Math.hypot(x-SPAWN.x,y-SPAWN.y)<650)continue;
   if(points.some(p=>Math.hypot(x-p.x,y-p.y)<250)||roads.some(r=>r.some((p,j)=>j&&distanceLine({x,y},r[j-1],p)<90)))continue;
   if(scene==='wetland'){if(k%3===0){H.ellipse(x,y,85,30,'#a8c0af');for(let j=0;j<7;j++)H.path([[x-60+j*20,y+15],[x-64+j*20,y-35]],'#8fa172',3);}continue;}
   if(scene==='highland'||scene==='town'&&y>19000&&x<8000){if(k<2){H.ellipse(x,y,35+hash(seed+3)*25,23,'#b1b9a7');H.path([[x-10,y-6],[x+13,y-18]],'#d3d5c1',3);}continue;}
   const dense=scene==='grove'||x<8000&&y<10000;if(dense||hash(seed+2)>.72)H.tree(x,y,.8+hash(seed+3)*.9);
  }
 }
}
function drawBridge(ctx,c,completed,H){
 const {path,label,ellipse,tree,building}=H;
 const start=Math.max(1,Math.floor((c.x-BRIDGE.shore-BRIDGE.firstSpan)/BRIDGE.span)+1),last=Math.min(completed+1,Math.ceil((c.x+c.width-BRIDGE.shore)/BRIDGE.span)+2);
 for(let n=start;n<=last;n++){const x=bridgeEnd(n-1),end=bridgeEnd(n),done=n<=completed;
  if(end>=c.x&&x<=c.x+c.width){ctx.fillStyle=done?'#b7a17b':'#a9c2b755';ctx.fillRect(x,BRIDGE.y-120,end-x,240);
   for(let px=Math.max(x,Math.floor(c.x/32)*32);px<Math.min(end,c.x+c.width+32);px+=32)path([[px,BRIDGE.y-115],[px,BRIDGE.y+115]],done?'#e2cf9d':'#cbdad344',done?3:1);
   path([[x,BRIDGE.y-120],[end,BRIDGE.y-120]],done?'#8d805c':'#bed2c555',10);path([[x,BRIDGE.y+120],[end,BRIDGE.y+120]],done?'#8d805c':'#bed2c555',10);
   const lx=Math.max(c.x+170,Math.min(c.x+c.width-170,(x+end)/2));label(`第 ${n} 橋段 · ${done?'已連通':'待共築'}`,lx,BRIDGE.y+155,!done);
  }
  const i=islandFor(n);if(!visible(i.x,i.y,c,1000))continue;
  path([[i.x,BRIDGE.y],[i.x,i.y]],done?'#b49e74':'#bfd2bc77',130);
  ellipse(i.x,i.y,i.rx+35,i.ry+28,'#c8d3ad');ellipse(i.x,i.y,i.rx,i.ry,done?'#d6dfbc':'#c3d1b3');
  road([{x:i.x,y:BRIDGE.y},{x:i.x,y:i.y+105}],H,85);
  if(done){for(let k=0;k<7;k++){const a=k/7*Math.PI*2;const x=i.x+Math.cos(a)*600,y=i.y+Math.sin(a)*390;if(visible(x,y,c))tree(x,y,1.2);}
   if(visible(i.x,i.y,c))building(i.x,i.y-50,150,100,n===2?'#83a391':'#8b9b71',i.name);
  }
  if(visible(i.x,i.y+165,c))label(`${done?'':'🔒 '}${i.name} · 第 ${n} 階段`,i.x,i.y+165,!done);
  if(visible(i.x,i.y+215,c))label(done?(n<=3?'E 進入島上區域':'E 進入小島驛站'):'從大橋接續開拓',i.x,i.y+215,!done);
 }
}
export function paintWorld(ctx,c,scene,completed,time,H){const {ellipse,path,building,label}=H;
 if(RESOURCE_ZONES[scene]){paintResourceWorld(ctx,c,scene,H.state,H.player,{...H,time});return;}
 ctx.fillStyle=scene==='town'?'#9dbdb5':scene==='wetland'?'#d2ddc0':'#dfe5cb';ctx.fillRect(c.x,c.y,c.width,c.height);
 if(scene==='town'){
  ctx.fillStyle='#dfe5cb';ctx.fillRect(c.x,c.y,Math.max(0,Math.min(c.width,BRIDGE.shore-c.x)),c.height);
  if(c.x<=BRIDGE.shore&&c.x+c.width>=BRIDGE.shore){ctx.fillStyle='#c6d2b5';ctx.fillRect(BRIDGE.shore-35,c.y,45,c.height);}
  for(let gy=Math.floor(c.y/130);gy<(c.y+c.height)/130;gy++)for(let gx=Math.floor(Math.max(BRIDGE.shore,c.x)/180);gx<(c.x+c.width)/180;gx++){const x=gx*180+hash(gy+gx)*50,y=gy*130;path([[x,y+Math.sin(time/2000+gx)*3],[x+55,y]],'#deece05a',2);}
 }
 for(let gy=Math.floor(c.y/64);gy<(c.y+c.height)/64;gy++)for(let gx=Math.floor(c.x/64);gx<(c.x+c.width)/64;gx++){if(scene==='town'&&gx*64>BRIDGE.shore-30)continue;const seed=gx*913+gy*293,x=gx*64+hash(seed)*50,y=gy*64+hash(seed+1)*50;ctx.fillStyle=hash(seed+2)>.15?'#8f9c651d':'#fff4d3';ctx.fillRect(x,y,3,3);}
 if(scene==='town'){
  townRoads.forEach(p=>road(p,H));road([{x:SPAWN.x,y:SPAWN.y},{x:21600,y:13800},{x:BRIDGE.shore,y:BRIDGE.y}],H);
  vegetation(c,scene,H);
  ellipse(SPAWN.x,SPAWN.y,430,305,'#c4caa6');ellipse(SPAWN.x,SPAWN.y,390,270,'#dcd5b4');ellipse(SPAWN.x,SPAWN.y,335,225,'#e7ddbd');
  ellipse(SPAWN.x,SPAWN.y-70,55,35,'#9daa99');ellipse(SPAWN.x,SPAWN.y-78,43,25,'#b5cdc1');
  for(let i=0;i<4;i++){const x=SPAWN.x-250+i*160;path([[x,SPAWN.y+200],[x+65,SPAWN.y+200]],'#a28f65',13);}
  if(visible(SPAWN.x+240,SPAWN.y-320,c))building(SPAWN.x+240,SPAWN.y-320,130,95,'#87956a','中央驛站');
  if(visible(SPAWN.x,SPAWN.y+320,c))label('共築廣場 · 每個人都有位置',SPAWN.x,SPAWN.y+320);
  for(const p of LANDMARKS){if(p.id.startsWith('trace~')||!visible(p.x,p.y,c,280))continue;
   if(p.id==='forest'){for(let j=0;j<8;j++)H.tree(p.x-170+hash(j+440)*340,p.y-85+hash(j+480)*120,1.4);building(p.x+130,p.y+30,110,80,'#879568','森林工坊');label('青葉森林 · 林間拾枝',p.x,p.y+145);}
   else if(p.id==='mine'){for(let j=0;j<12;j++){const x=p.x-200+hash(j+100)*400,y=p.y-80+hash(j+120)*160;ellipse(x,y,28+hash(j)*26,20,'#a8ada0');}building(p.x+200,p.y+30,100,75,'#8e8d76','礦區補給棚');label('石語礦場 · 石系採集區',p.x,p.y+145);}
   else if(p.id==='bridge'){building(p.x-140,p.y-100,135,85,'#a58b63','橋頭工務所');label('跨心大橋 · 巨河沒有可見的終點',p.x,p.y+135);}
   else{building(p.x,p.y,p.id==='hall'?260:185,p.id==='hall'?155:125,{shop:'#af8560',quests:'#9b795b',hall:'#7e8f69'}[p.id],p.name);}
  }
  for(const [x,y,title] of [[17400,21300,'南風草原'],[17100,5100,'晨光花坡'],[3600,13500,'林緣休息地'],[10800,24600,'石語丘陵'],[19200,9000,'河岸觀景台']])if(visible(x,y,c)){ellipse(x,y,140,80,'#cbd2ac');building(x,y,90,60,'#8a9570',title);}
  drawBridge(ctx,c,completed,H);
 }else{
  const points=regionPoints(scene);road([{x:9000,y:13824},{x:9000,y:9900},{x:9000,y:7200}],H);for(const p of points)road([{x:9000,y:9900},{x:p.x,y:9900},p],H);
  vegetation(c,scene,H);for(const p of points)if(visible(p.x,p.y,c)){if(p.id==='care')building(p.x,p.y-35,125,85,'#87966f',p.name);else if(p.id==='gatherwood')H.tree(p.x,p.y-45,1.7);else if(p.id==='gatherstone')ellipse(p.x,p.y-35,100,45,'#a8b09f');else if(p.id==='survey'){ellipse(p.x,p.y,140,60,'#a5bfb1');label('需要態度 2',p.x,p.y-85);}label(p.name,p.x,p.y+70);}
 }
}
export function paintMinimap(ctx,scene,position,camera,completed,width=200,height=150,atlas=false){if(RESOURCE_ZONES[scene]){paintResourceMinimap(ctx,scene,position,camera,width,height,atlas);return;}const b=bounds(scene,completed),sx=width/b.width,sy=height/b.height;ctx.clearRect(0,0,width,height);ctx.fillStyle=scene==='town'?'#9dbdb5':'#dce4c8';ctx.fillRect(0,0,width,height);ctx.save();ctx.scale(sx,sy);
 const line=(p,color,w)=>{ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();p.forEach((v,i)=>i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y));ctx.stroke();};
 let points;
 if(scene==='town'){
  ctx.fillStyle='#dce4c8';ctx.fillRect(0,0,BRIDGE.shore,b.height);
  ctx.fillStyle='#b5c99d';ctx.beginPath();ctx.ellipse(5400,5700,4000,4000,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#c8cbb0';ctx.beginPath();ctx.ellipse(5100,21750,3000,2700,0,0,Math.PI*2);ctx.fill();
  for(const r of townRoads)line(r,'#ecdfb7',atlas?90:180);
  line([SPAWN,{x:BRIDGE.shore,y:BRIDGE.y}],'#e5d3a7',160);
  if(completed)line([{x:BRIDGE.shore,y:BRIDGE.y},{x:bridgeEnd(completed),y:BRIDGE.y}],'#9e815d',200);
  const islands=islandsFor(completed);for(const i of islands){line([{x:i.x,y:BRIDGE.y},i],i.n<=completed?'#af966a':'#b6cac0',120);ctx.fillStyle=i.n<=completed?'#cbd9ac':'#b6cbb7';ctx.beginPath();ctx.ellipse(i.x,i.y,i.rx,i.ry,0,0,Math.PI*2);ctx.fill();}
  points=[...LANDMARKS,...islands];
 }else points=regionPoints(scene);
 ctx.restore();for(const p of points){const locked=p.n&&completed<p.n;ctx.fillStyle=locked?'#829d90':'#607b50';ctx.beginPath();ctx.arc(p.x*sx,p.y*sy,atlas?5:2.5,0,Math.PI*2);ctx.fill();if(atlas){ctx.font='12px "Noto Sans TC",sans-serif';ctx.textAlign='center';ctx.fillStyle='#344b38';ctx.fillText((locked?'🔒 ':'')+p.name,p.x*sx,p.y*sy+22);}}
 if(atlas&&scene==='town'){ctx.fillStyle='#416d66';ctx.textAlign='right';ctx.font='12px sans-serif';ctx.fillText('巨河仍向遠方延伸 →',width-14,28);}
 ctx.strokeStyle='#526d4b';ctx.lineWidth=1;ctx.strokeRect(camera.x*sx,camera.y*sy,camera.width*sx,camera.height*sy);ctx.fillStyle='#ba704b';ctx.beginPath();ctx.arc(position.x*sx,position.y*sy,atlas?6:4,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff5d9';ctx.lineWidth=2;ctx.stroke();if(atlas){ctx.font='12px sans-serif';ctx.fillStyle='#7f553b';ctx.textAlign='center';ctx.fillText('你在這裡',position.x*sx,position.y*sy-12);}
}
