export function astar(nodes,edges,start,goal){
 if(!nodes[start]||!nodes[goal])return [];
 const distance=(a,b)=>Math.hypot(nodes[a][0]-nodes[b][0],nodes[a][1]-nodes[b][1]);
 const open=new Set([start]),cost=new Map([[start,0]]),parent=new Map();
 while(open.size){const current=[...open].sort((a,b)=>(cost.get(a)+distance(a,goal))-(cost.get(b)+distance(b,goal)))[0];
 if(current===goal){const path=[current];while(parent.has(path[0]))path.unshift(parent.get(path[0]));return path;}
 open.delete(current);
 for(const [a,b] of edges){const next=a===current?b:b===current?a:null;if(!next)continue;const g=cost.get(current)+distance(current,next);if(g<(cost.get(next)??Infinity)){cost.set(next,g);parent.set(next,current);open.add(next);}}
 }return [];
}
