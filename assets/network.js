import {entryDefinitions,roomDefinitions,poiDefinitions} from './location-data.js';
export const nodes={};
export const edgeRecords=[];
export const catalog=[];
function node(id,point,name,kind='checkpoint'){nodes[id]={id,point,name,kind,floor:1};return id;}
function edge(a,b,extra={}){edgeRecords.push({a,b,kind:'corridor',verified:true,accessibility:'unknown',...extra});}
function chain(items){items.forEach(([id,x,y,name])=>node(id,[x,y],name||'Hallway checkpoint'));for(let i=1;i<items.length;i++)edge(items[i-1][0],items[i][0]);}
// Main public corridors traced as explicit centerlines. No nearest-room edges.
chain([['w-sw',254,532,'Junction near Room 125'],['w-110',254,512],['w-123',254,472],['w-108',254,442],['w-117',254,438],['w-106',254,398],['w-115',254,388],['w-nw',254,380,'Junction near Room 111']]);
chain([['w-113',254,374],['w-nw',254,380],['w-111',289,380],['w-104',323,380],['w-102',356,380,'Outside Room 102'],['w-ne',402,380,'West wing upper junction'],['w-101',414,380],['bridge-west',477,380,'West–middle connector'],['m-west',570,380,'Middle wing west junction']]);
chain([['w-sw',254,532],['w-112',294,532],['w-114',364,532],['w-se',402,532,'West wing lower junction']]);
chain([['w-ne',402,380],['w-120',402,398],['w-133',402,408],['w-118',402,455],['w-men',402,467],['w-women',402,513],['w-116',402,514],['w-se',402,532]]);
node('w-125',[237,532],'Outside Room 125');edge('w-sw','w-125');
node('w-129',[389,532],'Outside Room 129');edge('w-se','w-129');
node('w-stairs',[245,520],'West stair landing');edge('w-sw','w-stairs');
chain([['m-west',570,380],['m-150',570,334],['m-nw',570,315,'Middle wing upper junction'],['m-165',609,315],['m-148',613,315],['m-146',668,315],['m-ne',712,315,'Middle wing east junction'],['m-144',712,334],['m-east',712,380,'Middle wing east junction'],['m-se',712,468,'Middle wing lower junction'],['m-141',630,468],['m-138',614,468],['m-sw',570,468,'Middle wing lower junction'],['m-136',570,380]]);
edge('m-136','m-west');
chain([['m-east',712,380],['m-161',737,380],['m-elevator-hall',805,380,'Elevator junction'],['e-189',873,380],['e-nw',880,380,'East wing upper junction'],['e-187',938,380],['e-185',1023,380],['e-ne',1046,380,'East wing upper junction']]);
chain([['e-nw',880,380],['e-vending',880,422],['e-men',880,439],['e-women',880,475],['e-170a',880,487],['e-ws',880,514,'171A / 170A corridor'],['e-sw',880,532,'East wing lower junction'],['e-173',997,532],['e-175',1025,532],['e-se',1046,532,'Junction near Room 175']]);
chain([['e-ne',1046,380],['e-east-upper',1046,417],['e-179',1046,430],['e-stairs',1046,512],['e-se',1046,532]]);
node('e-171',[880,532],'Outside Room 171');
// 171A opens south onto the hall, not through its opposite wall.
node('e-171a',[852,550],'171A south threshold approach');
// Its door opens into Room 171: no verified public-corridor connection.
node('c-landing',[805,478],'Lower landing by Entry C');
// Preserve the entrance crossing: approach -> doorway -> inside landing.
// The original (805,514) start was already indoors and skipped this doorway.
node('c-door',[805,522],'Entry C doorway','door');
node('c-inside',[805,514],'Inside Entry C');
edge('c-door','c-inside',{kind:'door',source:'double door gap between x789 and x821 at y522'});
edge('c-inside','c-landing');
// User confirmed 2026-11-11: short stairs connect these landings on Floor 1.
// They do not change floor, and must not qualify for accessible routing.
node('c-upper-landing',[805,423],'Upper landing of the short stairs');
edge('c-landing','c-upper-landing',{kind:'stairs',accessibility:'not-accessible',source:'user-confirmed same-floor passage'});
edge('c-upper-landing','m-elevator-hall');
node('m-157',[712,463],'Outside Room 157');edge('m-se','m-157');
node('m-142',[712,385],'Outside Room 142');edge('m-east','m-142');
node('m-169',[621,315],'Outside Room 169');edge('m-165','m-169');
node('m-elevator',[805,351],'Elevator landing');edge('m-elevator-hall','m-elevator');
// Side rooms 181 and 183 open through the shared east-side alcove.
node('e-181',[1072,417],'East alcove');edge('e-east-upper','e-181');
node('e-183',[1072,417],'East alcove');edge('e-181','e-183');
for(const entry of entryDefinitions){
 node(entry.id,entry.point,entry.name,'entrance');edge(entry.id,entry.anchor);
 catalog.push({...entry,category:'entrance',floor:1,node:entry.id,displayName:entry.name,boundary:null,source:'2011 PNG and user-confirmed C stair passage',routeStatus:'traced'});
}
for(const [number,x,y,dx,dy,anchor] of roomDefinitions){
 const id='room-'+number,point=[x,y],door=dx===undefined?null:[dx,dy];
 if(door){node(id,door,'Room '+number+' doorway','door');edge(anchor,id,{kind:'door'});}
 catalog.push({id,number,displayName:'HOLT '+number,category:'room',usage:'unspecified in source',floor:1,point,boundary:number==='102'?[330,393,367,419]:null,node:door?id:null,door,routeStatus:door?'traced':'door-unverified'});
}
for(const [id,name,category,point,door,anchor] of poiDefinitions){
 if(door){node(id,door,name,category);edge(anchor,id,{kind:category==='stairs'?'stair-approach':'door'});}
 catalog.push({id,displayName:name,category,floor:1,point,boundary:null,node:door?id:null,door,routeStatus:door?'traced':'door-unverified'});
}
export const checkpoints=Object.values(nodes).filter(n=>n.kind==='checkpoint'||n.kind==='entrance');
for(const cp of checkpoints.filter(n=>n.kind==='checkpoint'))catalog.push({id:cp.id,displayName:cp.name+' ('+cp.id+')',category:'landmark',floor:1,point:cp.point,node:cp.id,boundary:null,routeStatus:'traced'});
export const coordinates=Object.fromEntries(Object.entries(nodes).map(([id,n])=>[id,n.point]));
export function routingEdges(accessibleOnly=false){return edgeRecords.filter(e=>e.verified&&(!accessibleOnly||(e.accessibility==='verified'&&e.kind!=='stairs'))).map(e=>[e.a,e.b]);}
export function nearestCheckpoint(point,maxDistance=35){
 return checkpoints.map(cp=>({cp,d:Math.hypot(cp.point[0]-point[0],cp.point[1]-point[1])})).filter(x=>x.d<=maxDistance).sort((a,b)=>a.d-b.d)[0]?.cp||null;
}
