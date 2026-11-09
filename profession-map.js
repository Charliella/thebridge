import {harvestStatus} from './harvest-rules.js';
import {RESOURCE_ZONES,MATERIALS,HOUSE_PROJECTS,resourceMapPoints,resourceNodes,resourcePaths} from './professions.js';
import {canWalkResource,routeResource} from './resource-navigation.js';
export const resourceCanWalk=canWalkResource;
export const resourceRoute=routeResource;
export function paintResourceWorld(ctx,c,zone,s,p,H){const z=RESOURCE_ZONES[zone],mine=z.kind==='mine',{ellipse,path,label,tree,building}=H;const visible=(x,y,pad=180)=>x>c.x-pad&&x<c.x+c.width+pad&&y>c.y-pad&&y<c.y+c.height+pad;
 ctx.fillStyle=mine?(zone==='ironworks'?'#7e726c':'#717e74'):zone==='ebonywood'?'#c0cdbb':zone==='oldgrowth'?'#c9d7b9':'#dae5c7';ctx.fillRect(c.x,c.y,c.width,c.height);
 for(const r of resourcePaths(zone))path([[r.a.x,r.a.y],[r.b.x,r.b.y]],mine?'#b9b5a1':'#e0d2ad',r.width);
 if(mine)for(const n of resourceMapPoints(zone))if(visible(n.x,n.y))ellipse(n.x,n.y+105,200,180,'#b9b5a1');
 if(!mine){for(let y=Math.floor(c.y/230)*230;y<c.y+c.height;y+=230)for(let x=Math.floor(c.x/240)*240;x<c.x+c.width;x+=240){if(Math.abs(x-z.trunkX)<190||resourceMapPoints(zone).some(a=>Math.hypot(x-a.x,y-a.y)<240))continue;tree(x+Math.sin(y+x)*40,y,zone==='ebonywood'?1.15:.8);}}
 for(const n of resourceNodes(zone)){if(!visible(n.x,n.y))continue;const m=MATERIALS[n.material],status=harvestStatus(s,zone,n.node),recovering=false,active=status.session,hits=active?.hits||0;ctx.save();ctx.globalAlpha=recovering?.42:1;
  if(mine){ellipse(n.x,n.y,90,55,m.color);for(let i=0;i<6;i++)path([[n.x-60+i*23,n.y+20],[n.x-45+i*20,n.y-25]],m.vein,5);for(let i=0;i<hits;i++)path([[n.x-30+i*20,n.y-40],[n.x-10+i*17,n.y+20]],'#45554b',3);}
  else if(n.material==='wood'){for(let i=0;i<5;i++){const x=n.x-48+i*24;path([[x,n.y+15],[x+8,n.y-110+i%2*25]],m.color,7);for(let j=0;j<4;j++)path([[x,n.y-j*26],[x+8,n.y-j*26]],m.vein,2);path([[x+5,n.y-70],[x+30,n.y-85]],'#7c9856',4);}if(hits)path([[n.x-55,n.y-20],[n.x+55,n.y-20]],'#d2b77c',5);}
  else if(n.material==='pine'){path([[n.x,n.y+15],[n.x,n.y-100]],'#7f815b',12);for(let j=0;j<3;j++){ctx.fillStyle=['#6e8a62','#7e996c','#8fa77a'][j];ctx.beginPath();ctx.moveTo(n.x-70+j*14,n.y-20-j*40);ctx.lineTo(n.x,n.y-130-j*20);ctx.lineTo(n.x+70-j*14,n.y-20-j*40);ctx.fill();}if(hits)path([[n.x-12,n.y-7],[n.x+12,n.y+2]],m.vein,5);}
  else{tree(n.x,n.y-30,2.1);path([[n.x,n.y+10],[n.x,n.y-50]],n.material==='ebony'?'#43564d':'#7f895f',23);if(n.material==='ebony')for(let j=0;j<3;j++)path([[n.x-6,n.y-j*17],[n.x+8,n.y-j*17-5]],m.vein,2);for(let j=0;j<3;j++)path([[n.x,n.y],[n.x-45+j*45,n.y+30]],'#7f895f',7);if(hits)path([[n.x-12,n.y-7],[n.x+12,n.y+2]],m.vein,5);}
  ctx.restore();label(`${n.name}${recovering?' · 恢復中':` · ${m.tier} 級${active?' · '+active.members.length+'/2':''}`}`,n.x,n.y+65,recovering);
 }
 for(const [id,plan] of Object.entries(HOUSE_PROJECTS)){if(plan.zone!==zone||!visible(plan.x,plan.y))continue;const work=s.projects?.[id]?.work||0;if(work>=plan.steps)building(plan.x,plan.y,170,110,mine?'#8b9b91':'#92a46e',plan.name);else{ctx.strokeStyle='#a79f77';ctx.lineWidth=3;ctx.setLineDash([8,8]);ctx.strokeRect(plan.x-90,plan.y-65,180,130);ctx.setLineDash([]);if(work)path([[plan.x-75,plan.y+45],[plan.x-75,plan.y-60],[plan.x+75,plan.y-60],[plan.x+75,plan.y+45]],'#b5a17c',12);label(`${plan.name} · ${work}/${plan.steps}`,plan.x,plan.y+95);}}
 for(const a of resourceMapPoints(zone).filter(a=>a.id.startsWith('gate~')||a.id.startsWith('exit~')||a.id==='survey'))if(visible(a.x,a.y)){path([[a.x,a.y-15],[a.x,a.y+45]],'#8a906c',5);label(a.name,a.x,a.y+75);}
 for(const a of resourceMapPoints(zone).filter(a=>a.id.startsWith('view~')))if(visible(a.x,a.y)){if(mine){ellipse(a.x,a.y,90,50,'#c2c8b4');path([[a.x-40,a.y-20],[a.x,a.y-90],[a.x+40,a.y-20]],zone==='golddeep'?'#e8cf7c':'#dce3ca',7);}else building(a.x,a.y,100,65,'#8f9f75',a.name);label(a.name,a.x,a.y+85);}
 if(zone==='pinewood'){for(let i=0;i<3;i++)ellipse(c.x+180+i*380+Math.sin((H.time||0)/9000+i)*25,c.y+130+i*210,155,32,'#f7fff126');}
 if(zone==='ironworks'){for(const r of resourcePaths(zone)){const x=r.a.x,y=r.a.y;if(visible(x,y)){ellipse(x+120,y-80,10,10,'#b8785e');ellipse(x+120,y-80,30,30,'#cf8b5d18');}}}
}
export function paintResourceMinimap(ctx,zone,position,camera,width,height,atlas){const z=RESOURCE_ZONES[zone],sx=width/z.width,sy=height/z.height;ctx.clearRect(0,0,width,height);ctx.fillStyle=z.kind==='mine'?'#879186':zone==='ebonywood'?'#c1d0ba':'#d2dfbc';ctx.fillRect(0,0,width,height);ctx.save();ctx.scale(sx,sy);
 for(const cluster of z.clusters){ctx.fillStyle=z.kind==='mine'?'#9aa391':'#bbcca4';ctx.beginPath();ctx.ellipse(z.width*cluster.fx,cluster.fy===1?z.height-950:z.height*cluster.fy,850,700,0,0,Math.PI*2);ctx.fill();}
 for(const r of resourcePaths(zone)){ctx.strokeStyle='#d8cfac';ctx.lineWidth=r.width;ctx.beginPath();ctx.moveTo(r.a.x,r.a.y);ctx.lineTo(r.b.x,r.b.y);ctx.stroke();}ctx.restore();
 for(const p of resourceMapPoints(zone)){ctx.fillStyle=p.material?MATERIALS[p.material].color:'#ac8755';ctx.beginPath();ctx.arc(p.x*sx,p.y*sy,atlas?4:2.5,0,Math.PI*2);ctx.fill();if(atlas){ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillStyle='#344c3b';ctx.fillText(p.material?String(p.node+1):p.name,p.x*sx,p.y*sy+15);}}
 if(atlas)for(const cluster of z.clusters){ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillStyle='#506548';ctx.fillText(cluster.name,z.width*cluster.fx*sx,(cluster.fy===1?z.height-1200:z.height*cluster.fy-1050)*sy);}
 ctx.strokeStyle='#536f46';ctx.strokeRect(camera.x*sx,camera.y*sy,camera.width*sx,camera.height*sy);ctx.fillStyle='#c2774e';ctx.beginPath();ctx.arc(position.x*sx,position.y*sy,atlas?6:4,0,Math.PI*2);ctx.fill();
}

