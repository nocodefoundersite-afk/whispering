import {features,world,byFeature} from './map-data';
export type Room={name:string;x:number;y:number;w:number;h:number;kind:string};
export type Plan={key:string;title:string;w:number;h:number;rooms:Room[];links:number[][];entries:(string|number)[][];windows:number[][]};
export const buildings=features.map((f,i)=>{const xs=f.points.map(p=>p[0]),ys=f.points.map(p=>p[1]),p=world([Math.min(...xs),Math.min(...ys)]);return{id:f.id,name:f.name,short:f.name,category:f.category,description:f.note,material:f.kind==='pool'?'Aqua water · pale stone coping':f.kind==='canopy'?'Yellow tensile fabric · timber columns':f.kind==='court'?'Court surface · perimeter fencing':'Pale plaster · timber · stone',code:String(i+1).padStart(2,'0'),x:p[0],y:p[1],w:(Math.max(...xs)-Math.min(...xs))*.18,h:(Math.max(...ys)-Math.min(...ys))*.18,height:f.height,plans:[] as string[],elevation:0,group:f.group,kind:f.kind};});
export type Building=typeof buildings[number];
export const listedBuildings=buildings.filter(b=>!b.group||buildings.find(x=>x.group===b.group)?.id===b.id);
export const byId=Object.fromEntries(buildings.map(b=>[b.id,b]));
export const floors=(b:Building)=>[{id:'exterior',label:'Exterior'},...(byFeature[b.id]?.kind==='building'?[{id:'0',label:'Roof off'}]:[])];
export function planFor(_id:string,_level:string):Plan|undefined{return undefined;}
