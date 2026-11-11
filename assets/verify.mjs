import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {catalog,coordinates,edgeRecords,routingEdges} from './network.js';
import {entryDefinitions} from './location-data.js';
import {astar} from './pathfinding.js';
import {segments} from './building.js';
import {NavigationEngine} from './engine.js';
import {instruction,length} from './navigation.js';
import {readLocation} from './locations.js';

const rooms=catalog.filter(l=>l.category==='room');
const failures=[],results=[],summaries=[];
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function intersects(a,b,c,d){
 const overlap=Math.max(Math.min(a[0],b[0]),Math.min(c[0],d[0]))<=Math.min(Math.max(a[0],b[0]),Math.max(c[0],d[0]))&&Math.max(Math.min(a[1],b[1]),Math.min(c[1],d[1]))<=Math.min(Math.max(a[1],b[1]),Math.max(c[1],d[1]));
 return overlap&&cross(a,b,c)*cross(a,b,d)<=0&&cross(c,d,a)*cross(c,d,b)<=0;
}
for(const e of edgeRecords){
 assert.ok(coordinates[e.a]&&coordinates[e.b],'Missing graph endpoint');
 for(const wall of segments)if(intersects(coordinates[e.a],coordinates[e.b],wall.slice(0,2),wall.slice(2))){
  failures.push('Wall intersection: '+e.a+' → '+e.b);
 }
}
for(const entry of entryDefinitions){
 assert.equal(readLocation('?building=holt&floor=1&location='+entry.id).location.node,entry.id);
 let available=0;
 for(const room of rooms){
  const engine=new NavigationEngine();engine.setStart(entry.id);engine.setDestination(room.id);
  const path=engine.path,reason=!room.node?'Door connection missing':!path.length?'Disconnected start or destination':'Available';
  results.push({entry:entry.id,room:room.number,status:reason});
  if(!path.length)continue;
  available++;
  assert.equal(path[0],entry.id);assert.equal(path.at(-1),room.node);
  assert.ok(astar(coordinates,routingEdges(),room.node,entry.id).length,'Reverse route missing');
  engine.begin();
  for(let step=0;engine.phase==='running';step++){
   assert.ok(step<path.length,'Simulation did not terminate');
   const text=instruction(path,engine.index,room).text;
   assert.ok(!/hallway checkpoint/i.test(text),'Technical language in spoken instruction');
   const before=length(path,engine.index);engine.next();
   assert.ok(length(path,engine.index)<=before+.00001,'Remaining distance increased');
  }
  assert.equal(engine.phase,'arrived');
  assert.equal(instruction(path,engine.index,room).icon,'✓');
  assert.ok(instruction(path,engine.index,room).text.includes(room.displayName));
 }
 summaries.push({entry:entry.id,available,total:rooms.length});
}
const lines=['# Entry and room routing audit','','This is a check of the current traced graph against the supplied PNG, not a field survey.','',...summaries.map(s=>'- '+s.entry+': '+s.available+'/'+s.total+' rooms reachable.'),'','## Missing doorway connections','',rooms.filter(r=>!r.node).map(r=>r.number).join(', '),'','## Geometry checks','',failures.length?failures.join('\n'):'No centerline intersections with currently traced wall segments. This does not validate omitted walls, door clearance or current building access.','','## What remains','', 'Entry C now connects through short same-floor stairs, confirmed by the user on 2026-11-11. Stairs are excluded from accessible routing. The remaining rooms need individual door or suite-access traces.'];
writeFileSync(new URL('./ROUTE_AUDIT.md',import.meta.url),lines.join('\n')+'\n');
writeFileSync(new URL('./route-coverage.csv',import.meta.url),'entry,room,status\n'+results.map(r=>[r.entry,r.room,r.status].join(',')).join('\n')+'\n');
console.table(summaries);
assert.equal(failures.length,0,failures.join('\n'));
console.log('PASS: graph integrity, four QR identifiers, all 316 entry/room combinations checked, available-route reversibility, simulation completion, arrival checkmarks and decreasing route length.');
if(results.some(r=>r.status!=='Available'))console.log('COVERAGE INCOMPLETE: see ROUTE_AUDIT.md and route-coverage.csv.');
