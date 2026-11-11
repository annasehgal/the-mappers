import {coordinates as nodes,nodes as metadata,edgeRecords} from './network.js';
export const metricCalibration={metresPerPixel:null,walkingSpeedMetresPerSecond:1.2};
export function length(path,from=0){return path.slice(from+1).reduce((sum,id,i)=>{const a=nodes[path[from+i]],b=nodes[id];return sum+Math.hypot(b[0]-a[0],b[1]-a[1]);},0);}
export function distanceText(path,from=0){const pixels=length(path,from),scale=metricCalibration.metresPerPixel;return scale?Math.round(pixels*scale)+' m · about '+Math.max(1,Math.ceil(pixels*scale/metricCalibration.walkingSpeedMetresPerSecond/60))+' min':Math.round(pixels)+' plan units · physical scale uncalibrated';}
export function instruction(path,index,destination){
 if(index>=path.length-1)return {icon:'✓',text:'You have arrived at '+destination.displayName+'.'};
 const edge=edgeRecords.find(e=>(e.a===path[index]&&e.b===path[index+1])||(e.b===path[index]&&e.a===path[index+1]));
 if(edge?.kind==='stairs')return {icon:'↗',text:'Use the short stairs, then continue along the hallway.'};
 const target=path[index+1],last=index===path.length-2;
 if(index===0)return {icon:'↑',text:last?'Your destination is just ahead.':'Head straight along the hallway.'};
 const a=nodes[path[index-1]],b=nodes[path[index]],c=nodes[target],u=[b[0]-a[0],b[1]-a[1]],v=[c[0]-b[0],c[1]-b[1]];
 const cross=u[0]*v[1]-u[1]*v[0],dot=u[0]*v[0]+u[1]*v[1],angle=Math.atan2(cross,dot)*180/Math.PI;
 const turn=Math.abs(angle)<25?'Continue straight':Math.abs(angle)>155?'Turn around':angle>0?'Turn right':'Turn left';
 return {icon:Math.abs(angle)<25?'↑':Math.abs(angle)>155?'↶':angle>0?'↱':'↰',text:last?(Math.abs(angle)<25?'Your destination is ahead.':turn+'. Your destination is here.'):turn+(Math.abs(angle)<25?' along the hallway.':' at the junction.')};
}
