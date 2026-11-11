import {catalog,nodes,coordinates,checkpoints,nearestCheckpoint} from './network.js';
import {NavigationEngine} from './engine.js';
import {instruction,distanceText} from './navigation.js';
import {readLocation} from './locations.js';
import {createAudio} from './audio.js';
import {createMap} from './renderer.js';

const $=id=>document.getElementById(id);
const engine=new NavigationEngine(),audio=createAudio();
let map,pending=null,picking=false;
const categories=[['entrance','Entrances'],['landmark','Hallway checkpoints'],['room','Room doorways'],['restroom','Restrooms'],['stairs','Stair approaches'],['elevator','Elevator'],['vending','Vending']];
for(const [category,label] of categories){
 const group=document.createElement('optgroup');group.label=label;
 for(const loc of catalog.filter(l=>l.category===category&&l.node)){const option=document.createElement('option');option.value=loc.node;option.textContent=loc.displayName;group.append(option);}
 $('start').append(group);
}
function replan(){audio.stop();engine.plan();render();}
function render(announce=false){
 const active=engine.phase==='running'||engine.phase==='paused',arrived=engine.phase==='arrived';
 document.body.dataset.phase=engine.phase;document.body.dataset.start=engine.start||'';document.body.dataset.current=engine.path[engine.index]||engine.start||'';
 document.body.dataset.destination=engine.destination?.id||'none';
 $('title').textContent=arrived?'You’ve arrived':engine.destination?.displayName||'Choose where to begin';
 $('start').value=engine.start||'';$('start').disabled=active;$('search').disabled=active;$('category').disabled=active;$('pick').disabled=active;$('accessible').disabled=active;
 $('go').disabled=!engine.path.length||engine.phase==='paused';
 $('go').textContent=arrived?'✓ Done':engine.phase==='running'?'Next checkpoint':'Start simulation';
 $('pause').hidden=!active;$('pause').textContent=engine.phase==='paused'?'Resume':'Pause';$('restart').hidden=!active&&!arrived;
 $('replay').disabled=!active&&!arrived;
 const steps=engine.path.slice(0,-1).map((_,i)=>instruction(engine.path,i,engine.destination));
 $('instructions').replaceChildren(...steps.map(d=>{const li=document.createElement('li');li.textContent=d.text;return li;}));
 $('progress').max=Math.max(1,engine.path.length-1);$('progress').value=engine.index;
 $('metrics').textContent=engine.path.length?distanceText(engine.path,engine.index):'';
 if(active||arrived){const d=instruction(engine.path,engine.index,engine.destination);$('direction').textContent=d.icon;$('status').textContent=(engine.phase==='paused'?'Paused. ':'')+d.text;$('checkpoint').textContent=arrived?'Destination reached':'Checkpoint '+(engine.index+1)+' of '+engine.path.length+' · Simulated position';if(announce)audio.speak(d.text);}
 else{$('direction').textContent='⌖';$('status').textContent=engine.message;$('checkpoint').textContent=engine.start?'Start: '+nodes[engine.start].name:'No starting position selected';}
 map?.show(engine.destination,engine.path.map(id=>coordinates[id]),engine.index,engine.start?coordinates[engine.start]:null,arrived);
}
function frame(){if(engine.path.length)map.fitRoute(engine.path.map(id=>coordinates[id]));else map.fit(engine.destination?.point||(engine.start?coordinates[engine.start]:undefined));}
function setDestination(loc){audio.stop();engine.setDestination(loc.id);$('search').value=loc.displayName;$('results').replaceChildren();render();frame();}
function setStart(id){audio.stop();engine.setStart(id);render();frame();}
function recenter(){const id=engine.path[engine.index]||engine.start;if(id)map.follow(coordinates[id],coordinates[engine.path[engine.index+1]]);else map.fit();}
function search(){
 const query=$('search').value.trim().toLowerCase().replace(/^holt\s*/,'');
 const category=$('category').value;
 const hits=catalog.filter(l=>(!category||l.category===category)&&(!query||l.displayName.toLowerCase().includes(query)||l.number===query));
 $('results').replaceChildren();
 if(!query&&!category)return;
 for(const loc of hits.slice(0,35)){const button=document.createElement('button');button.textContent=loc.displayName;button.onclick=()=>setDestination(loc);$('results').append(button);}
 if(!hits.length)$('results').textContent='No matching first-floor location.';
}
function openLocation(loc,note=''){
 if(!loc||engine.phase==='running'||engine.phase==='paused')return;
 pending=loc;map.pending(loc.node?coordinates[loc.node]:loc.point);$('location-title').textContent=loc.displayName;$('location-note').textContent=note||'Choose this location as your start or destination.';
 $('confirm-start').disabled=!loc.node;$('confirm-destination').hidden=picking;$('location-dialog').showModal();
}
function endPick(){picking=false;map?.pick(false);map?.pending(null);$('pick').setAttribute('aria-pressed','false');$('location-dialog').close();pending=null;}
$('confirm-start').onclick=()=>{const id=pending.node;endPick();setStart(id);};
$('confirm-destination').onclick=()=>{const loc=pending;endPick();setDestination(loc);};
$('cancel-location').onclick=endPick;$('location-dialog').addEventListener('cancel',endPick);
$('pick').onclick=()=>{picking=!picking;map.pick(picking);$('pick').setAttribute('aria-pressed',String(picking));$('status').textContent=picking?'Tap near a hallway checkpoint. Confirm the snapped position before continuing.':engine.message;};
$('start').onchange=()=>{if($('start').value)setStart($('start').value);else{engine.start=null;replan();}};
$('search').addEventListener('input',search);$('category').onchange=search;
$('go').onclick=()=>{if(engine.phase==='arrived'){audio.stop();engine.clear();$('search').value='';render();frame();return;}if(engine.phase==='running')engine.next();else engine.begin();render(true);recenter();};
$('pause').onclick=()=>{audio.stop();if(engine.phase==='paused')engine.resume();else engine.pause();render();};
$('restart').onclick=()=>{audio.stop();engine.restart();render();frame();};
$('reset').onclick=()=>{audio.stop();engine.clear();$('search').value='';$('results').replaceChildren();render();map.fit();};
$('accessible').onchange=()=>{engine.accessible=$('accessible').checked;replan();frame();};
$('expand').onclick=()=>{$('details').hidden=!$('details').hidden;$('expand').setAttribute('aria-expanded',String(!$('details').hidden));};
$('audio').textContent=audio.available?'Audio on':'Visual only';$('audio').disabled=!audio.available;
$('audio').onclick=()=>{$('audio').textContent=audio.toggle()?'Audio on':'Audio off';$('audio').setAttribute('aria-pressed',String(audio.enabled));};
$('replay').onclick=()=>audio.speak(instruction(engine.path,engine.index,engine.destination).text);
window.addEventListener('pagehide',()=>audio.stop());
document.addEventListener('visibilitychange',()=>{if(document.hidden){audio.stop();engine.pause();render();}});
const qr=readLocation(location.search);
if(qr.location){engine.setStart(qr.location.node);$('entry-note').textContent='QR start: '+qr.location.label+'. Confirm or change this position before simulation.';}else if(qr.error)$('entry-note').textContent=qr.error;
try{
 const layout=new ResizeObserver(()=>{const main=document.querySelector('main').getBoundingClientRect();const header=document.querySelector('header').getBoundingClientRect();const sheet=$('sheet').getBoundingClientRect();document.querySelector('main').style.setProperty('--map-top',(header.bottom-main.top+8)+'px');document.querySelector('main').style.setProperty('--map-bottom',(main.bottom-sheet.top+8)+'px');});
 layout.observe(document.querySelector('header'));layout.observe($('sheet'));
 map=await createMap($('map'),openLocation,catalog,point=>{
  const cp=nearestCheckpoint(point);
  if(!cp){map.pending(point);$('status').textContent='No traced corridor checkpoint is close enough. Tap closer to a checkpoint or use the list.';return;}
  const loc=catalog.find(l=>l.id===cp.id);openLocation(loc,'Snapped to a traced corridor checkpoint. Confirm that this matches your approximate position.');
 });
 $('mode').onclick=()=>{$('mode').textContent=map.toggle()?'2D':'3D';};
 $('plus').onclick=()=>map.zoom(1.3);$('minus').onclick=()=>map.zoom(1/1.3);$('recenter').onclick=recenter;
 $('fit').onclick=()=>map.fit();$('checkpoints').onclick=()=>{$('checkpoints').setAttribute('aria-pressed',String(map.checkpoints()));};
 $('source').onclick=()=>{$('source').textContent=map.source()?'Show model':'Source plan';};
 render();document.body.dataset.ready='true';
}catch(error){$('status').textContent='Map could not load. Reload to try again.';console.error(error);}
