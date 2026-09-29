import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { SoftwareRenderer } from './software-renderer';
import { createSite, createAmenities, pitchedRoof } from './site-landscape';
import { buildings, byId, data, planFor, type Building, type Plan, type Room } from './project';

type FloorParts={root:THREE.Group;shell:THREE.Group;inside:THREE.Group};
type Model={root:THREE.Group;floors:FloorParts[];roof:THREE.Group;roofCap?:THREE.Group};
export type SceneAPI={select:(id:string,level:string)=>void;view:(v:'aerial'|'plan'|'site')=>void;zoom:(amount:number)=>void;labels:(v:boolean)=>void;landscape:(v:boolean)=>void;isolate:(v:boolean)=>void;snapshot:()=>HTMLCanvasElement;dispose:()=>void;};
export function createScene(host:HTMLElement,labelsHost:HTMLElement,onSelect:(id:string)=>void):SceneAPI {
 const scene=new THREE.Scene();scene.background=new THREE.Color('#e9ede8');
 let renderer:THREE.WebGLRenderer|SoftwareRenderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});}catch{renderer=new SoftwareRenderer();}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
 renderer.domElement.setAttribute('aria-label','Interactive 3D resort model. Drag to rotate, scroll to zoom. Select a building in the project panel to inspect it.');renderer.domElement.tabIndex=0;host.appendChild(renderer.domElement);
 const camera=new THREE.PerspectiveCamera(38,1,1,1500);const controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=!(renderer instanceof SoftwareRenderer);controls.dampingFactor=.1;controls.minDistance=14;controls.maxDistance=650;controls.maxPolarAngle=Math.PI*.47;controls.target.set(42,0,-22);camera.position.set(144,132,139);controls.update();
 scene.add(new THREE.HemisphereLight('#fffaf0','#869084',2.1));
 const sun=new THREE.DirectionalLight('#fff3d8',2.4);sun.position.set(-30,130,35);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-112,right:112,top:110,bottom:-110,near:.5,far:300});sun.shadow.bias=-.00035;sun.shadow.normalBias=.12;sun.target.position.set(35,0,-20);scene.add(sun,sun.target);
 const fill=new THREE.DirectionalLight('#dce8f3',.8);fill.position.set(100,40,-100);scene.add(fill);
 const mats:Record<string,THREE.MeshStandardMaterial>={};
 const mat=(name:string,color:string,roughness=.8)=>mats[name]??(mats[name]=new THREE.MeshStandardMaterial({color,roughness}));
 const stone=mat('stone','#d7d1bf'),wall=mat('wall','#e8e3d7'),wood=mat('wood','#98704c'),dark=mat('dark','#40534b'),metal=mat('metal','#35473e'),cushion=mat('cushion','#f6f0df'),grass=mat('grass','#a7b28d'),path=mat('path','#d6cfb9'),earth=mat('earth','#ad9473'),white=mat('white','#f8f6ee'),wet=mat('wet','#b6cbc7');
 const glass=new THREE.MeshPhysicalMaterial({color:'#96c0bd',transparent:true,opacity:.53,roughness:.22,metalness:.12,depthWrite:false,side:THREE.DoubleSide});
 const water=new THREE.MeshPhysicalMaterial({color:'#4ba6ad',roughness:.2,metalness:.22,clearcoat:1,clearcoatRoughness:.15});
 const unitBox=new THREE.BoxGeometry(1,1,1),unitCylinder=new THREE.CylinderGeometry(1,1,1,12),treeGeo=new THREE.IcosahedronGeometry(1,1);
 function box(g:THREE.Group,x:number,y:number,z:number,w:number,h:number,d:number,m:THREE.Material){const o=new THREE.Mesh(unitBox,m);o.position.set(x+w/2,y+h/2,-z-d/2);o.scale.set(w,h,d);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 function cyl(g:THREE.Group,x:number,y:number,z:number,r:number,h:number,m:THREE.Material){const o=new THREE.Mesh(unitCylinder,m);o.position.set(x,y+h/2,-z);o.scale.set(r,h,r);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 function beam(g:THREE.Group,a:THREE.Vector3,b:THREE.Vector3,r:number,m:THREE.Material){const o=new THREE.Mesh(unitCylinder,m);o.position.copy(a).add(b).multiplyScalar(.5);o.scale.set(r,a.distanceTo(b),r);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());o.castShadow=true;g.add(o);}
 function batch(g:THREE.Group){g.updateMatrixWorld(true);const inverse=g.matrixWorld.clone().invert(),buckets=new Map<THREE.Material,THREE.BufferGeometry[]>();const remove:THREE.Object3D[]=[];
  g.traverse(o=>{if(o instanceof THREE.Mesh&&!Array.isArray(o.material)&&!o.material.transparent){const a=buckets.get(o.material)??[];let geo=o.geometry.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld));if(geo.index){const expanded=geo.toNonIndexed();geo.dispose();geo=expanded;}geo.deleteAttribute('uv');geo.deleteAttribute('uv1');a.push(geo);buckets.set(o.material,a);remove.push(o);}});
  remove.forEach(o=>o.removeFromParent());buckets.forEach((geos,m)=>{const merged=mergeGeometries(geos,false);geos.forEach(g=>g.dispose());if(merged){const mesh=new THREE.Mesh(merged,m);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}});
 }
 const {ground,vegetation,plant}=createSite(scene);
 const leaves=[mat('leaf0','#70825e'),mat('leaf1','#889a6a'),mat('leaf2','#526f57'),mat('leaf3','#9aa77b')];
 function planter(g:THREE.Group,x:number,y:number,z:number,w=1.1){box(g,x,y,z,w,.5,w,stone);const o=new THREE.Mesh(treeGeo,leaves[2]);o.position.set(x+w/2,y+.9,-z-w/2);o.scale.set(w*.6,.55,w*.6);g.add(o);}
 function pergola(g:THREE.Group,x:number,y:number,z:number,w:number,d:number,h=2.8){for(const xx of [x,x+w-.18])for(const zz of[z,z+d-.18])box(g,xx,y,zz,.18,h,.18,wood);box(g,x,y+h,z,w,.22,.24,wood);box(g,x,y+h,z+d-.24,w,.22,.24,wood);for(let xx=x;xx<x+w;xx+=.52)box(g,xx,y+h+.22,z,.11,.2,d,wood);}
 function chair(g:THREE.Group,x:number,y:number,z:number,angle=0){const c=new THREE.Group();c.position.set(x,y,-z);c.rotation.y=angle;box(c,-.28,.38,-.28,.56,.14,.56,cushion);box(c,-.28,.48,.21,.56,.55,.09,wood);for(const xx of[-.22,.19])for(const zz of[-.2,.2])box(c,xx,0,zz,.055,.38,.055,wood);g.add(c);}
 function table(g:THREE.Group,x:number,y:number,z:number,large=false){cyl(g,x,y+.68,z,large?.85:.56,.13,wood);cyl(g,x,y,z,.12,.68,metal);chair(g,x-1,y,z,-Math.PI/2);chair(g,x+1,y,z,Math.PI/2);if(large){chair(g,x,y,z-1,Math.PI);chair(g,x,y,z+1,0);}}
 function sofa(g:THREE.Group,x:number,y:number,z:number,w=2){box(g,x,y,z,w,.25,.85,wood);box(g,x+.08,y+.25,z+.08,w-.16,.25,.72,cushion);box(g,x,y+.5,z+.68,w,.48,.16,cushion);box(g,x,y+.25,z,.15,.42,.85,cushion);box(g,x+w-.15,y+.25,z,.15,.42,.85,cushion);}
 function lounger(g:THREE.Group,x:number,y:number,z:number){box(g,x,y,z,.72,.28,1.85,wood);box(g,x+.04,y+.28,z+.04,.64,.13,1.74,cushion);const back=box(g,x+.04,y+.43,z+1.15,.64,.08,.6,cushion);back.rotation.x=-.32;}
 function furniture(g:THREE.Group,r:Room){const x=r.x,z=r.y,w=r.w,d=r.h,n=r.name.toLowerCase();
  if(n.includes('stair')){const stepCount=12,run=Math.min(d-1,3.5);for(let i=0;i<stepCount;i++)box(g,x+.5,.08,z+.5+run*i/stepCount,1.05,.17*(i+1),run/stepCount,stone);for(let i=0;i<stepCount;i++)box(g,x+1.65,.08,z+.5+run*(stepCount-1-i)/stepCount,1.05,2.04+.17*(i+1),run/stepCount,stone);return;}
  if(n.includes('lift')){box(g,x+.5,.08,z+.4,Math.min(w-1,1.8),1.15,1.7,metal);box(g,x+.6,.15,z+2.08,Math.min(w-1.2,1.6),.9,.025,mat('steel','#8d9e96'));return;}
  if(/sleeping/.test(n)){box(g,x+.8,.08,z+.9,2.1,.36,2.3,wood);box(g,x+.85,.44,z+.95,2,.23,2.2,cushion);box(g,x+.8,.2,z+.75,2.1,.9,.14,wood);box(g,x+1,.69,z+1.02,.75,.13,.45,white);box(g,x+1.95,.69,z+1.02,.75,.13,.45,white);sofa(g,x+w-3,.08,z+d-1.3,2);cyl(g,x+w-2,.08,z+d-2.2,.5,.42,wood);return;}
  if(/treatment/.test(n)){const count=n.includes('couples')?2:1;for(let i=0;i<count;i++){box(g,x+.9+i*2,.08,z+.8,.85,.6,1.95,wood);box(g,x+.87+i*2,.68,z+.77,.91,.16,2.01,cushion);box(g,x+.95+i*2,.84,z+.87,.72,.1,.32,white);}box(g,x+w-.7,.08,z+.4,.45,.8,d-.8,wood);return;}
  if(/strength/.test(n)){for(let i=0;i<3;i++){box(g,x+.7+i*2.6,.08,z+.6,.85,.2,1.7,dark);box(g,x+.7+i*2.6,.28,z+.65,.09,1.1,.09,metal);box(g,x+1.46+i*2.6,.28,z+.65,.09,1.1,.09,metal);box(g,x+.7+i*2.6,1.24,z+.64,.85,.18,.18,dark);}for(let i=0;i<4;i++)box(g,x+.7+i*2,.08,z+d-2,1,.06,1.6,mat('mat','#a1b1a9'));return;}
  if(/mobility/.test(n)){for(let i=0;i<3;i++)for(let j=0;j<2;j++)box(g,x+.8+i*2.7,.08,z+1+j*3,1.2,.04,1.8,mat('mat','#a1b1a9'));return;}
  if(/hot desks/.test(n)){for(let i=0;i<4;i++){box(g,x+.65,.74,z+1+i*1.8,2.65,.1,.75,wood);for(let xx of[x+1.25,x+2.7]){chair(g,xx,.08,z+2+i*1.8);box(g,xx-.22,.84,z+1.16,.44,.3,.055,dark);}}return;}
  if(/meeting|office/.test(n)){box(g,x+w/2-.55,.74,z+d/2-1.5,1.1,.12,3,wood);for(let i=0;i<3;i++){chair(g,x+w/2-1,.08,z+d/2-1+i,-Math.PI/2);chair(g,x+w/2+1,.08,z+d/2-1+i,Math.PI/2);}return;}
  if(/retail/.test(n)){box(g,x+.3,.08,z+.5,.45,1.4,d-1,wood);box(g,x+w-1.5,.08,z+d-2,1.2,.85,1.5,wood);for(let j=0;j<3;j++){box(g,x+w/2-.5,.08,z+1.5+j*2.1,1,.65,.7,cushion);}return;}
  if(/dining/.test(n)){for(let xx=x+1.7;xx<x+w-1;xx+=3.6)for(let zz=z+1.7;zz<z+d-1;zz+=3.8)table(g,xx,.08,zz,true);return;}
  if(/kitchen|pantry|servery|stores|stock/.test(n)){box(g,x+.25,.08,z+.25,w-.5,.88,.65,wood);box(g,x+.3,.08,z+1,.6,.88,Math.max(.7,d-1.5),stone);return;}
  if(/bathroom/.test(n)){cyl(g,x+.65,.08,z+.95,.25,.42,white);box(g,x+.34,.08,z+.32,.62,.8,.2,white);box(g,x+w-1.55,.08,z+d-1.55,1.3,.08,1.3,white);box(g,x+w-1.6,.16,z+d-1.55,.055,1.7,1.3,glass);box(g,x+w-1.5,.78,z+.3,1.2,.12,.55,stone);cyl(g,x+w-.9,.89,z+.56,.22,.08,white);return;}
  if(/wc|bathroom|wet prep/.test(n)){for(let i=0;i<Math.floor(w/1.4);i++){cyl(g,x+.65+i*1.4,.08,z+1,.25,.42,white);box(g,x+.32+i*1.4,.08,z+.3,.6,.8,.2,white);}box(g,x+.3,.78,z+d-.8,w-.6,.12,.55,stone);return;}
  if(/change/.test(n)&&r.kind==='wet'){box(g,x+.25,.08,z+.3,.48,1.35,d-.6,wood);box(g,x+1,.08,z+1,.45,.42,Math.max(1,d-2),stone);return;}
  if(/reception desk/.test(n)){box(g,x+.4,.08,z+1,w-.8,1,.8,wood);return;}
  if(/lounge|recovery|relaxation|reception|welcome/.test(n)){sofa(g,x+.5,.08,z+.5,Math.min(w-1,2.4));cyl(g,x+Math.min(w/2,1.7),.08,z+2.1,.52,.45,wood);if(w>4.5)sofa(g,x+w-2.5,.08,z+d-1.3,2);planter(g,x+w-1.1,.08,z+.3,.7);}
 }
 function partitions(plan:Plan,g:THREE.Group){
  const edges:{axis:'h'|'v';line:number;a:number;b:number}[]=[];const gaps:{axis:'h'|'v';line:number;a:number;b:number}[]=[];
  for(const r of plan.rooms){edges.push({axis:'h',line:r.y,a:r.x,b:r.x+r.w},{axis:'h',line:r.y+r.h,a:r.x,b:r.x+r.w},{axis:'v',line:r.x,a:r.y,b:r.y+r.h},{axis:'v',line:r.x+r.w,a:r.y,b:r.y+r.h});}
  for(const [ai,bi] of plan.links){const a=plan.rooms[ai],b=plan.rooms[bi];if(!a||!b)continue;let axis:'h'|'v',line,start,end;
   if(Math.abs(a.x+a.w-b.x)<.01||Math.abs(b.x+b.w-a.x)<.01){axis='v';line=Math.abs(a.x+a.w-b.x)<.01?b.x:a.x;start=Math.max(a.y,b.y);end=Math.min(a.y+a.h,b.y+b.h);}else if(Math.abs(a.y+a.h-b.y)<.01||Math.abs(b.y+b.h-a.y)<.01){axis='h';line=Math.abs(a.y+a.h-b.y)<.01?b.y:a.y;start=Math.max(a.x,b.x);end=Math.min(a.x+a.w,b.x+b.w);}else continue;
   if(end>start){const center=(start+end)/2,width=Math.min(1.2,(end-start)*.75);gaps.push({axis,line,a:center-width/2,b:center+width/2});}
  }
  for(const e of plan.entries){const axis=e[2] as 'h'|'v',center=Number(axis==='h'?e[0]:e[1]);gaps.push({axis,line:Number(axis==='h'?e[1]:e[0]),a:center-Number(e[3])/2,b:center+Number(e[3])/2});}
  const keys=[...new Set(edges.map(e=>e.axis+':'+e.line.toFixed(3)))];
  for(const key of keys){const [axis,ls]=key.split(':'),line=Number(ls);const es=edges.filter(e=>e.axis===axis&&Math.abs(e.line-line)<.001),gs=gaps.filter(e=>e.axis===axis&&Math.abs(e.line-line)<.001);const stops=[...new Set([...es.flatMap(e=>[e.a,e.b]),...gs.flatMap(e=>[e.a,e.b])])].sort((a,b)=>a-b);
   for(let i=0;i<stops.length-1;i++){const a=stops[i],b=stops[i+1],mid=(a+b)/2;if(!es.some(e=>mid>e.a-.001&&mid<e.b+.001)||gs.some(e=>mid>e.a&&mid<e.b))continue;
    if(axis==='h')box(g,a,.1,line-.075,b-a,1.05,.15,wall);else box(g,line-.075,.1,a,.15,1.05,b-a,wall);
   }
  }
 }
 function shell(plan:Plan,g:THREE.Group,height:number,b:Building){
  // Study curtain walls for social elevations; service edges retain solid panels.
  box(g,0,0,0,plan.w,.18,plan.h,stone);
  for(const side of ['front','back','left','right']){
   const horizontal=side==='front'||side==='back',length=horizontal?plan.w:plan.h,line=side==='back'?plan.h:side==='right'?plan.w:0;
   const bays=Math.ceil(length/3.2),bay=length/bays;
   for(let i=0;i<bays;i++){const a=i*bay;const solid=(side==='left'&&(b.id==='restaurant'||b.id==='spa'))||(side==='back'&&b.id!=='gym'&&!b.group);
    if(horizontal){box(g,a,.18,line-.085,bay,height-.36,.17,solid?wall:glass);box(g,a,.18,line-.12,.12,height-.25,.24,wood);}else{box(g,line-.085,.18,a,.17,height-.36,bay,solid?wall:glass);box(g,line-.12,.18,a,.24,height-.25,.12,wood);}
   }
  }
  if(b.id==='restaurant'){
   for(const z of[-.11,plan.h-.1]){box(g,0,.18,z,plan.w,.75,.22,wall);box(g,0,height-.72,z,plan.w,.5,.22,wall);}
   for(const x of[-.11,plan.w-.1]){box(g,x,.18,0,.22,.75,plan.h,wall);box(g,x,height-.72,0,.22,.5,plan.h,wall);}
   for(let x=0;x<plan.w;x+=plan.w/4)box(g,x,.18,-.12,.45,height-.36,.24,wall);
   for(let z=0;z<plan.h;z+=plan.h/5)box(g,plan.w-.12,.18,z,.24,height-.36,.45,wall);
  }
  box(g,-.3,height-.22,-.3,plan.w+.6,.25,plan.h+.6,stone);
  if(b.id==='spa'||!!b.group)for(let z=1;z<plan.h-1;z+=.65)box(g,plan.w+.15,.3,z,.18,height-.5,.12,wood);
 }
 const models=new Map<string,Model>();const selectable:THREE.Object3D[]=[];
 for(const b of buildings.filter(b=>b.plans.length)){
  const root=new THREE.Group();root.position.set(b.x,b.elevation+.12,-b.y);root.rotation.y=b.rotation??0;root.userData.building=b.id;scene.add(root);selectable.push(root);
  box(root,-.35,-.07,-.35,b.w+.7,.2,b.h+.7,stone);
  const fl:FloorParts[]=[];
  for(let level=0;level<b.plans.length;level++){
   const plan=data.models[b.plans[level]],fg=new THREE.Group();fg.position.y=level*b.height;root.add(fg);const outer=new THREE.Group(),inner=new THREE.Group();fg.add(outer,inner);
   box(inner,0,0,0,b.w,.12,b.h,stone);
   for(const room of plan.rooms){const fm=room.kind==='wet'?wet:room.kind==='core'?mat('core','#c9c8b9'):room.kind==='service'?mat('serviceFloor','#c4c1b3'):room.kind==='corridor'?mat('circulation','#e7dfca'):mat('guestFloor','#e4d7bc');box(inner,room.x+.04,.12,room.y+.04,room.w-.08,.025,room.h-.08,fm);furniture(inner,room);}
   partitions(plan,inner);shell(plan,outer,b.height,b);batch(inner);batch(outer);fl.push({root:fg,shell:outer,inside:inner});
  }
  const roof=new THREE.Group();roof.position.y=b.height*b.plans.length;root.add(roof);box(roof,-.3,0,-.3,b.w+.6,.22,b.h+.6,stone);
  const roofCap=new THREE.Group();roof.add(roofCap);
  if(b.roof){const rp=data.models[b.roof];
   for(const r of rp.rooms){if(r.kind==='outdoor'){box(roof,r.x,.23,r.y,r.w,.025,r.h,mat('deck','#bb9c74'));if(/dining/.test(r.name))for(let x=r.x+1.7;x<r.x+r.w-1;x+=3.5)for(let z=r.y+1.7;z<r.y+r.h-1;z+=3.8)table(roof,x,.26,z,true);if(/lounge/.test(r.name))sofa(roof,r.x+.5,.25,r.y+1,2.3);}
    else{box(roof,r.x,.23,r.y,r.w,1.05,r.h,wall);box(roofCap,r.x,.23,r.y,r.w,2.6,r.h,wall);}}
   for(const z of[0,b.h-.1])box(roof,0,.24,z,b.w,.9,.08,glass);for(const x of[0,b.w-.1])box(roof,x,.24,0,.08,.9,b.h,glass);
   if(b.id==='restaurant'){
    for(const [x,z,w,d] of[[0,0,5.6,11],[5.5,6,5,12],[10.5,0,5.5,11]]){const g=new THREE.Group();g.position.set(x,2.8,-z);roofCap.add(g);pitchedRoof(g,w,d,'hip',3.6);}
   }else{const g=new THREE.Group();g.position.set(0,2.8,-7);roofCap.add(g);pitchedRoof(g,b.w,b.h-7,'gable',5.2);}
  }else{
   pitchedRoof(roofCap,b.w,b.h,b.form??'gable',b.group==='bali'?5.8:undefined);
   if(b.group){const d=2.5;box(root,0,0,-d,b.w,.18,d,wood);for(const xx of[0,b.w-.18])box(root,xx,.18,-d,.16,2.6,.16,wood);sofa(root,.5,.2,-2.1,2);planter(root,b.w-1,.18,-1.7,.7);}
   if(b.id==='reception')pergola(root,0,.18,-3.5,b.w,3.5,3.5);
  }
  batch(roofCap);
  // Keep the roof core separate so a rooftop cutaway reveals its plan.
  const savedCap=roofCap;if(savedCap)roof.remove(savedCap);batch(roof);if(savedCap)roof.add(savedCap);
  models.set(b.id,{root,floors:fl,roof,roofCap});
 }
 function outdoor(b:Building){const g=new THREE.Group();g.userData.building=b.id;g.position.set(b.x,b.elevation+.04,-b.y);scene.add(g);selectable.push(g);models.set(b.id,{root:g,floors:[],roof:new THREE.Group()});return g;}
 createAmenities(outdoor,vegetation);
 batch(ground);batch(vegetation);
 const highlight=new THREE.Group();scene.add(highlight);const lineMat=new THREE.LineBasicMaterial({color:'#a0773c',depthTest:false,transparent:true,opacity:1});
 const labels:{el:HTMLButtonElement;point:THREE.Vector3;id:string;room?:boolean}[]=[];let selected='',level='exterior',labelsEnabled=true,isolateEnabled=false,disposed=false,raf=0;
 const markerBuildings=buildings.filter(b=>b.listed!==false);
 function worldPoint(b:Building,x:number,z:number,h:number){return new THREE.Vector3(x,h,-z).applyAxisAngle(new THREE.Vector3(0,1,0),b.rotation??0).add(new THREE.Vector3(b.x,b.elevation+.12,-b.y));}
 for(const b of markerBuildings){const el=document.createElement('button');el.className='model-label';el.textContent=b.short;el.setAttribute('aria-label',`Select ${b.name}`);el.addEventListener('click',()=>onSelect(b.id));labelsHost.appendChild(el);labels.push({el,point:worldPoint(b,b.w/2,b.h/2,b.plans.length*b.height+(b.plans.length?5:1)),id:b.id});}
 let goalPosition:THREE.Vector3|undefined,goalTarget:THREE.Vector3|undefined;
 function animateTo(pos:THREE.Vector3,target:THREE.Vector3){if(renderer instanceof SoftwareRenderer){goalPosition=undefined;goalTarget=undefined;camera.position.copy(pos);controls.target.copy(target);controls.update();return;}goalPosition=pos;goalTarget=target;}
 controls.addEventListener('start',()=>{goalPosition=undefined;goalTarget=undefined;});
 function focus(b:Building,l:string){const target=worldPoint(b,b.w/2,b.h/2,l==='exterior'?3:l==='roof'?b.plans.length*b.height:Number(l)*b.height+1);let extent=Math.max(b.w,b.h)*1.45;const aspect=host.clientWidth/host.clientHeight;if(aspect<1)extent*=1.55;animateTo(target.clone().add(l==='exterior'?new THREE.Vector3(extent*.8,extent*.85,extent*1.12):new THREE.Vector3(extent*.25,extent*1.18,extent*.85)),target);}
 function refreshVisibility(){for(const [id,m] of models){m.root.visible=!isolateEnabled||!selected||id===selected;const active=id===selected&&level!=='exterior';m.floors.forEach((f,i)=>{f.root.visible=!active||level==='roof'||i<=Number(level);f.shell.visible=!(active&&(level==='roof'?false:i===Number(level)));f.inside.visible=renderer instanceof SoftwareRenderer?(active&&(level==='roof'?false:i===Number(level))):true;});m.roof.visible=!active||level==='roof';if(m.roofCap)m.roofCap.visible=!(active&&level==='roof');}vegetation.visible=vegetation.userData.enabled!==false&&!isolateEnabled;ground.visible=!isolateEnabled;plant.visible=!isolateEnabled;}
 function setSelection(id:string,l:string){selected=id;level=l;labels.filter(x=>x.room).forEach(x=>x.el.remove());for(let i=labels.length-1;i>=0;i--)if(labels[i].room)labels.splice(i,1);while(highlight.children.length){const o=highlight.children[0] as THREE.Line;o.geometry.dispose();highlight.remove(o);}refreshVisibility();
  const b=byId[id];if(!b){overview('aerial');return;}
  const pts=[[-.6,-.6],[b.w+.6,-.6],[b.w+.6,b.h+.6],[-.6,b.h+.6],[-.6,-.6]].map(([x,z])=>worldPoint(b,x,z,.2));const outline=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lineMat);outline.renderOrder=9;highlight.add(outline);
  const plan=planFor(id,l);if(plan)for(const r of plan.rooms){if(r.kind==='core'||r.w<2.2||r.w*r.h<13)continue;const el=document.createElement('button');el.className='room-label';el.textContent=r.name;el.disabled=true;labelsHost.appendChild(el);labels.push({el,point:worldPoint(b,r.x+r.w/2,r.y+r.h/2,(l==='roof'?b.plans.length:Number(l))*b.height+1),id,room:true});}
  focus(b,l);
 }
 function overview(v:'aerial'|'plan'|'site'){
  const b=byId[selected],mobile=host.clientWidth<host.clientHeight;
  if(v==='site'){const t=new THREE.Vector3(33,0,-52),extent=mobile?320:220;animateTo(t.clone().add(new THREE.Vector3(extent*.6,extent*1.35,extent*1.22)),t);return;}
  const target=b?worldPoint(b,b.w/2,b.h/2,level==='roof'?b.plans.length*b.height:level==='exterior'?3:Number(level)*b.height):new THREE.Vector3(0,2,-22);
  const extent=b?Math.max(b.w,b.h)*(mobile?2.3:1.6):(mobile?135:95);
  if(v==='plan')animateTo(target.clone().add(new THREE.Vector3(0,extent*2.1,.1)),target);else if(b)focus(b,level);else animateTo(target.clone().add(new THREE.Vector3(extent*.65,extent*1.28,extent*1.45)),target);
 }
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down={x:0,y:0};
 const pointerDown=(e:PointerEvent)=>{down={x:e.clientX,y:e.clientY};};const pointerUp=(e:PointerEvent)=>{if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5||e.button!==0)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(selectable,true);for(const h of hits){let o:THREE.Object3D|null=h.object,visible=true,id='';while(o){if(!o.visible)visible=false;if(o.userData.building)id=o.userData.building;o=o.parent;}if(id&&visible){onSelect(id);break;}}};
 renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);
 function zoom(amount:number){goalPosition=undefined;goalTarget=undefined;const offset=camera.position.clone().sub(controls.target);offset.multiplyScalar(amount);offset.clampLength(controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(offset);controls.update();}
 const keyDown=(e:KeyboardEvent)=>{if(['+','=','-','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='+'||e.key==='=')zoom(.8);else if(e.key==='-')zoom(1.25);else {const delta=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(delta);if(e.key==='ArrowLeft')s.theta-=.12;if(e.key==='ArrowRight')s.theta+=.12;if(e.key==='ArrowUp')s.phi=Math.max(.08,s.phi-.1);if(e.key==='ArrowDown')s.phi=Math.min(Math.PI*.47,s.phi+.1);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));controls.update();}}};renderer.domElement.addEventListener('keydown',keyDown);
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};const ro=new ResizeObserver(resize);ro.observe(host);resize();overview('aerial');
 const projected=new THREE.Vector3();let frame=0;
 function render(){if(disposed)return;raf=requestAnimationFrame(render);if(goalPosition&&goalTarget){camera.position.lerp(goalPosition,.085);controls.target.lerp(goalTarget,.085);if(camera.position.distanceTo(goalPosition)<.02){goalPosition=undefined;goalTarget=undefined;}}controls.update();renderer.render(scene,camera);
  if(frame++%2===0){const w=host.clientWidth,h=host.clientHeight;const occupied:{x:number;y:number;w:number;h:number}[]=[];
   for(const label of labels){const show=labelsEnabled&&(label.room?selected===label.id&&level!=='exterior':(!selected||selected===label.id)&&level==='exterior');projected.copy(label.point).project(camera);const x=(projected.x*.5+.5)*w,y=(-projected.y*.5+.5)*h;const lw=label.el.offsetWidth||100,lh=label.el.offsetHeight||25;const overlap=occupied.some(p=>Math.abs(x-p.x)<(lw+p.w)/2+3&&Math.abs(y-p.y)<(lh+p.h)/2+3);const visible=show&&!overlap&&projected.z<1&&x>10&&x<w-10&&y>5&&y<h-20;label.el.style.display=visible?'block':'none';if(visible){label.el.style.transform=`translate(${x}px,${y}px) translate(-50%,-100%)`;occupied.push({x,y,w:lw,h:lh});}label.el.classList.toggle('selected',selected===label.id);}
  }
 }
 refreshVisibility();
 render();
 return {select:setSelection,view:overview,zoom,labels(v){labelsEnabled=v;},landscape(v){vegetation.userData.enabled=v;refreshVisibility();},isolate(v){isolateEnabled=v;refreshVisibility();},snapshot(){renderer.render(scene,camera);return renderer.domElement;},dispose(){disposed=true;cancelAnimationFrame(raf);ro.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);renderer.domElement.removeEventListener('keydown',keyDown);const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Line){geometries.add(o.geometry);if(Array.isArray(o.material))o.material.forEach(m=>materials.add(m));else materials.add(o.material);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();host.replaceChildren();labelsHost.replaceChildren();}};
}
