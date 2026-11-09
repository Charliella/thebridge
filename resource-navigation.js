import {RESOURCE_ZONES,resourceMapPoints,resourcePaths} from './professions.js';
function projection(p,s){const dx=s.b.x-s.a.x,dy=s.b.y-s.a.y,t=Math.max(0,Math.min(1,((p.x-s.a.x)*dx+(p.y-s.a.y)*dy)/(dx*dx+dy*dy||1)));return {x:s.a.x+t*dx,y:s.a.y+t*dy};}
export function canWalkResource(x,y,zone){const z=RESOURCE_ZONES[zone];if(x<40||y<60||x>z.width-40||y>z.height-40)return false;if(z.kind!=='mine')return true;const p={x,y};if(resourcePaths(zone).some(s=>{const q=projection(p,s);return Math.hypot(q.x-x,q.y-y)<=s.width/2;}))return true;return resourceMapPoints(zone).some(n=>((x-n.x)/200)**2+((y-n.y-105)/180)**2<=1);}
export function routeResource(from,to,zone){
 if(!canWalkResource(to.x,to.y,zone))throw Error('這裡是岩壁，請選擇礦道、作業坪或採集節點');
 if(RESOURCE_ZONES[zone].kind!=='mine')return [to];
 const paths=resourcePaths(zone),points=new Map(),key=p=>`${p.x.toFixed(4)},${p.y.toFixed(4)}`;
 const add=p=>{points.set(key(p),p);return key(p);};
 const nearest=p=>paths.map(s=>projection(p,s)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
 const start=nearest(from),end=nearest(to);add(start);add(end);
 for(const s of paths){add(s.a);add(s.b);}
 for(let i=0;i<paths.length;i++)for(let j=i+1;j<paths.length;j++){const a=paths[i],b=paths[j];const v=a.a.x===a.b.x?a:b,h=v===a?b:a;if(v.a.x!==v.b.x||h.a.y!==h.b.y)continue;const x=v.a.x,y=h.a.y;if(x>=Math.min(h.a.x,h.b.x)&&x<=Math.max(h.a.x,h.b.x)&&y>=Math.min(v.a.y,v.b.y)&&y<=Math.max(v.a.y,v.b.y))add({x,y});}
 const graph=new Map([...points.keys()].map(k=>[k,[]]));
 for(const s of paths){const line=[...points.values()].filter(p=>s.a.x===s.b.x?Math.abs(p.x-s.a.x)<.001&&p.y>=Math.min(s.a.y,s.b.y)&&p.y<=Math.max(s.a.y,s.b.y):Math.abs(p.y-s.a.y)<.001&&p.x>=Math.min(s.a.x,s.b.x)&&p.x<=Math.max(s.a.x,s.b.x)).sort((a,b)=>s.a.x===s.b.x?a.y-b.y:a.x-b.x);for(let i=1;i<line.length;i++){const a=key(line[i-1]),b=key(line[i]),d=Math.hypot(line[i].x-line[i-1].x,line[i].y-line[i-1].y);if(a!==b){graph.get(a).push([b,d]);graph.get(b).push([a,d]);}}}
 const source=key(start),dest=key(end),dist=new Map([[source,0]]),previous=new Map(),pending=new Set(graph.keys());
 while(pending.size){let best=null,cost=Infinity;for(const id of pending){const d=dist.get(id)??Infinity;if(d<cost){best=id;cost=d;}}if(best===null)break;pending.delete(best);if(best===dest)break;for(const [next,d] of graph.get(best)){if(cost+d<(dist.get(next)??Infinity)){dist.set(next,cost+d);previous.set(next,best);}}}
 if(!dist.has(dest))throw Error('找不到連通礦道，請先返回入口');
 const route=[];for(let id=dest;id;id=previous.get(id)){route.unshift(points.get(id));if(id===source)break;}
 route.push(to);return route.filter((p,i)=>!i||Math.hypot(p.x-route[i-1].x,p.y-route[i-1].y)>.1);
}
