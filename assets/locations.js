import {entryDefinitions} from './location-data.js';
export const locations=Object.fromEntries(entryDefinitions.map(e=>[e.id,{node:e.id,label:e.name}]));
const aliases={'holt-f1-entry-125':'holt-entry-d'};
export function readLocation(search){
 const p=new URLSearchParams(search),raw=p.get('location'),id=aliases[raw]||raw;
 if(!id)return {location:null,error:null};
 if(p.get('building')!=='holt'||p.get('floor')!=='1'||!locations[id])return {location:null,error:'Unknown QR location. Choose your start on this floor.'};
 return {location:locations[id],error:null};
}
export function locationURL(base,id){
 if(!locations[id])throw new Error('Unknown QR location');
 const url=new URL(base);url.search='';url.hash='';url.searchParams.set('building','holt');url.searchParams.set('floor','1');url.searchParams.set('location',id);return url.href;
}
