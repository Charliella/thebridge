export const MAX_STAMINA=100,HARVEST_STAMINA=3,REST_MS=8000;
export const CLOTHING_SLOTS={hat:'帽子',top:'上衣',bottom:'下裝',shoes:'鞋子',accessory:'配件'};
export const CLOTHES={
 sun:{name:'晴日草帽',slot:'hat',price:20,color:'#cfb171',shape:'brim'},
 blue:{name:'河藍小帽',slot:'hat',price:25,color:'#789aaa',shape:'cap'},
 mossBeret:{name:'苔綠貝雷帽',slot:'hat',price:35,color:'#839369',shape:'beret'},
 berryBeanie:{name:'莓果針織帽',slot:'hat',price:35,color:'#aa7783',shape:'knit'},
 linenShirt:{name:'亞麻白襯衫',slot:'top',price:30,color:'#e1dbc6',pattern:'buttons'},
 riverShirt:{name:'河藍條紋衫',slot:'top',price:35,color:'#7ca0a4',pattern:'stripes'},
 mossVest:{name:'苔綠背心',slot:'top',price:40,color:'#82916c',pattern:'vest'},
 clayJacket:{name:'陶土工作外套',slot:'top',price:45,color:'#bc876a',pattern:'pockets'},
 plumSweater:{name:'暮紫針織衫',slot:'top',price:40,color:'#9a829e',pattern:'stripes'},
 craftApron:{name:'暖棕工坊圍裙',slot:'top',price:45,color:'#ae9471',pattern:'apron'},
 sandPants:{name:'沙色長褲',slot:'bottom',price:25,color:'#b7a587'},
 navyPants:{name:'深藍工作褲',slot:'bottom',price:30,color:'#58717a'},
 mossShorts:{name:'青苔短褲',slot:'bottom',price:25,color:'#8a9673',shape:'shorts'},
 plumSkirt:{name:'暮紫百褶裙',slot:'bottom',price:35,color:'#9b7d91',shape:'skirt'},
 brownBoots:{name:'栗棕短靴',slot:'shoes',price:30,color:'#866b55',shape:'boots'},
 creamShoes:{name:'米白帆布鞋',slot:'shoes',price:25,color:'#d5cbb2',shape:'sneakers'},
 riverBoots:{name:'河青雨靴',slot:'shoes',price:35,color:'#638a88',shape:'boots'},
 sunScarf:{name:'日光小領巾',slot:'accessory',price:20,color:'#d1b465',shape:'scarf'},
 redScarf:{name:'磚紅長圍巾',slot:'accessory',price:30,color:'#b87867',shape:'scarf'},
 leafBag:{name:'葉綠斜背包',slot:'accessory',price:40,color:'#81946c',shape:'bag'}
};
export function appearance(p){
 const e=p.equipment||{},top=CLOTHES[e.top],bottom=CLOTHES[e.bottom],shoes=CLOTHES[e.shoes],accessory=CLOTHES[e.accessory];
 return {top:top?.color||p.color,pattern:top?.pattern||'',bottom:bottom?.color||'#52604c',bottomShape:bottom?.shape||'pants',shoes:shoes?.color||'#4b5947',shoeShape:shoes?.shape||'sneakers',hat:CLOTHES[p.hat]?.color||(p.hat==='leaf'?'#81955b':'#cfb171'),hatShape:CLOTHES[p.hat]?.shape||'brim',accessory};
}
export const TRACE_SITES={
 hall:{name:'集會所老樹',scene:'town',visit:'hall',stage:0,x:16000,y:11100,description:'樹蔭下的土壤，留給今天與未來的相約。'},
 bridge:{name:'橋頭回聲碑',scene:'town',visit:'bridge',stage:0,x:21300,y:14100,description:'讓正在修橋與後來走過的人，隔著時間說一句話。'},
 bamboo:{name:'竹風聽雨石',scene:'bamboo',visit:'bamboo',stage:0,x:3072,y:3500,description:'竹葉搖動的聲音，會把話帶給下一位旅人。'},
 copper:{name:'赤銅礦燈台',scene:'copper',visit:'copper',stage:0,x:3072,y:3500,description:'留一盞燈，給晚一步抵達礦坑的人。'},
 pinewood:{name:'霧語樹洞',scene:'pinewood',visit:'pinewood',stage:1,x:4096,y:5100,description:'在霧中，把一段話交給森林保管。'},
 ironworks:{name:'紅眼礦壁刻記',scene:'ironworks',visit:'ironworks',stage:2,x:4096,y:5100,description:'礦壁記得你來過，也記得你給夥伴的祝福。'}
};
export const CAPSULE_DELAYS={'ten-minutes':600000,day:86400000,week:604800000};
export function traceOpen(trace,state,now=Date.now()){return trace.kind==='whisper'||(trace.unlockMode==='bridge'?state.bridge.completed.length>=trace.unlockSegment:now>=trace.openAt);}
