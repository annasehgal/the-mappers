import assert from 'node:assert/strict';
import {NavigationEngine} from '../engine.js';
import {coordinates,edgeRecords,routingEdges,catalog} from '../network.js';
import {instruction} from '../navigation.js';

assert.deepEqual(coordinates['holt-entry-c'],[805,532]);
assert.deepEqual(coordinates['c-door'],[805,522]);
assert.deepEqual(coordinates['c-inside'],[805,514]);
const destinations=['room-102','room-123','room-173','restroom-east-men','restroom-west-women'];
for(const id of destinations){
 const engine=new NavigationEngine();engine.setStart('holt-entry-c');engine.setDestination(id);
 assert.deepEqual(engine.path.slice(0,4),['holt-entry-c','c-door','c-inside','c-landing']);
 assert.ok(engine.path.includes('c-upper-landing'));
 engine.begin();let stairs=false;
 while(engine.phase==='running'){
  stairs ||= instruction(engine.path,engine.index,engine.destination).text.includes('short stairs');
  engine.next();
 }
 assert.ok(stairs);assert.equal(engine.phase,'arrived');
 assert.equal(instruction(engine.path,engine.index,engine.destination).icon,'✓');
}
const stair=edgeRecords.find(e=>e.a==='c-landing'&&e.b==='c-upper-landing');
assert.equal(stair.kind,'stairs');
assert.ok(!routingEdges(true).some(([a,b])=>a===stair.a&&b===stair.b));
let tested=0;
const connectedRooms=catalog.filter(room=>{
 if(room.category!=='room'||!room.node)return false;
 const engine=new NavigationEngine();engine.setStart('holt-entry-d');engine.setDestination(room.id);
 return engine.path.length>0;
});
for(const start of connectedRooms)for(const destination of connectedRooms){
 const engine=new NavigationEngine();engine.setStart(start.node);engine.setDestination(destination.id);
 assert.ok(engine.path.length,start.id+' → '+destination.id);tested++;
}
console.log('PASS: Entry C doorway, five C destinations, stairs exclusion for accessibility, '+tested+' room-to-room combinations.');
