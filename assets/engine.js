import {coordinates,routingEdges,catalog,nodes} from './network.js';
import {astar} from './pathfinding.js';
export class NavigationEngine{
 constructor(){this.start=null;this.destination=null;this.accessible=false;this.phase='idle';this.path=[];this.index=0;this.message='Choose your starting position.';}
 plan(){this.phase='preview';this.index=0;this.path=[];
 if(!this.start){this.message='Choose and confirm your starting position.';return;}
 if(!this.destination){this.message='Choose a destination.';return;}
 if(!this.destination.node){this.message='Route unavailable for this destination. Choose another location.';return;}
 this.path=astar(coordinates,routingEdges(this.accessible),this.start,this.destination.node);
 this.message=this.path.length?'Your route is ready.':this.accessible?'Accessible routing is not available for this journey.':'No first-floor route is available between these locations.';
 }
 setStart(id){if(!nodes[id])throw new Error('Unknown start');this.start=id;this.plan();}
 setDestination(id){const item=catalog.find(l=>l.id===id);if(!item)throw new Error('Unknown destination');this.destination=item;this.plan();}
 begin(){if(!this.path.length)return;this.index=0;this.phase=this.path.length===1?'arrived':'running';}
 next(){if(this.phase!=='running')return;this.index++;if(this.index===this.path.length-1)this.phase='arrived';}
 pause(){if(this.phase==='running')this.phase='paused';}
 resume(){if(this.phase==='paused')this.phase='running';}
 restart(){this.index=0;this.phase='preview';}
 clear(){this.destination=null;this.path=[];this.index=0;this.phase='idle';this.plan();}
}
