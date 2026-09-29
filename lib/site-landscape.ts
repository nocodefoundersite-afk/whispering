import * as THREE from 'three';
import { byId, type Building } from './project';
type P=[number,number,number?];
const materials=new Map<string,THREE.MeshStandardMaterial>();
const material=(color:string)=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.82,side:THREE.DoubleSide}));return materials.get(color)!;};
const stone=material('#d7d2c4'),basalt=material('#67706b'),timber=material('#987049'),roofMat=material('#777d82'),lawn=material('#92ad70'),white=material('#f2ede1');
const cube=new THREE.BoxGeometry(1,1,1),trunk=new THREE.CylinderGeometry(1,1,1,8),leafGeo=new THREE.IcosahedronGeometry(1,0);
function box(g:THREE.Group,x:number,y:number,z:number,w:number,h:number,d:number,m:THREE.Material){const o=new THREE.Mesh(cube,m);o.position.set(x+w/2,y+h/2,-z-d/2);o.scale.set(w,h,d);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
function cylinder(g:THREE.Group,x:number,y:number,z:number,r:number,h:number,m:THREE.Material){const o=new THREE.Mesh(trunk,m);o.position.set(x,y+h/2,-z);o.scale.set(r,h,r);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
function beam(g:THREE.Group,a:THREE.Vector3,b:THREE.Vector3,r:number,m:THREE.Material){const o=new THREE.Mesh(trunk,m);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());o.scale.set(r,a.distanceTo(b),r);o.castShadow=true;g.add(o);}
function smooth(points:P[],closed=true,n=100){return new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p[0],p[2]??0,-p[1])),closed,'catmullrom',.2).getPoints(n).map(p=>[p.x,-p.z,p.y] as P);}
function shape(points:P[],curved=true){const list=curved?smooth(points):points;const s=new THREE.Shape();list.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();return s;}
function slab(g:THREE.Group,points:P[],top:number,depth:number,m:THREE.Material,curved=true){const geo=new THREE.ExtrudeGeometry(shape(points,curved),{depth,bevelEnabled:false,curveSegments:40});geo.rotateX(-Math.PI/2);const mesh=new THREE.Mesh(geo,m);mesh.position.y=top-depth;mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);return mesh;}
function ribbon(g:THREE.Group,points:P[],width:number,m:THREE.Material,closed=false,n=100){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p[0],p[2]??.57,-p[1])),closed,'catmullrom',.2);const v:number[]=[],ix:number[]=[];
 for(let i=0;i<=n;i++){const p=curve.getPoint(i/n),t=curve.getTangent(i/n),side=new THREE.Vector3(t.z,0,-t.x).normalize().multiplyScalar(width/2);v.push(p.x+side.x,p.y,p.z+side.z,p.x-side.x,p.y,p.z-side.z);if(i<n)ix.push(i*2,i*2+1,i*2+2,i*2+1,i*2+3,i*2+2);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ix);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,m);mesh.receiveShadow=true;g.add(mesh);return curve;
}
function retaining(g:THREE.Group,points:P[],bottom:number,top:number,closed=false){const ps=smooth(points,closed,100);const v:number[]=[];
 for(let i=0;i<ps.length-1;i++){const a=ps[i],b=ps[i+1];v.push(a[0],bottom,-a[1],b[0],bottom,-b[1],a[0],top,-a[1],b[0],bottom,-b[1],b[0],top,-b[1],a[0],top,-a[1]);}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.computeVertexNormals();const m=new THREE.Mesh(geo,basalt);m.castShadow=true;m.receiveShadow=true;geo.dispose();ribbon(g,points.map(p=>[p[0],p[1],top+.04]),.5,stone,closed);ribbon(g,points.map(p=>[p[0],p[1],bottom+.28]),.11,material('#87918a'),closed);
}
function foliage(g:THREE.Group,x:number,z:number,y:number,s=1,color='#657f4e'){const o=new THREE.Mesh(leafGeo,material(color));o.position.set(x,y,-z);o.scale.set(s,s*.7,s);o.castShadow=true;g.add(o);}
function tree(g:THREE.Group,x:number,z:number,y=.5,s=1){cylinder(g,x,y,z,.16*s,3.7*s,timber);foliage(g,x,z,y+4.5*s,1.9*s,'#607b4e');foliage(g,x+.9*s,z+.5*s,y+3.7*s,1.6*s,'#7d965b');foliage(g,x-1.1*s,z-.4*s,y+3.8*s,1.5*s,'#577450');}
function palm(g:THREE.Group,x:number,z:number,y:number,s=1){cylinder(g,x,y,z,.14*s,5*s,timber);for(let i=0;i<7;i++){const a=i*Math.PI*2/7,dx=Math.cos(a),dz=Math.sin(a),p=new THREE.Vector3(x,y+5*s,-z),tip=new THREE.Vector3(x+dx*3*s,y+4.4*s,-z+dz*3*s),mid=p.clone().lerp(tip,.5);mid.y+=.7*s;const side=new THREE.Vector3(-dz*.5*s,0,dx*.5*s);const vs=[p,mid.clone().add(side),tip,p,tip,mid.clone().sub(side)];const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs.flatMap(v=>[v.x,v.y,v.z]),3));geo.computeVertexNormals();g.add(new THREE.Mesh(geo,material(i%2?'#456f49':'#759750')));}}
function hedge(g:THREE.Group,points:P[],width=.65){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p[0],(p[2]??.5)+.55,-p[1])),false,'catmullrom',.2);const geo=new THREE.TubeGeometry(curve,70,width,5,false);const m=new THREE.Mesh(geo,material('#657e45'));m.castShadow=true;g.add(m);}
function flowerBorder(g:THREE.Group,points:P[],count=36){const ps=smooth(points,false,count);ps.forEach((p,i)=>{foliage(g,p[0],p[1],(p[2]??.5)+.5,.55,['#93a65c','#b5b970','#98777f','#d0c39a','#607d4d'][i%5]);});}
function steps(g:THREE.Group,x:number,z:number,w:number,run:number,base:number,rise:number){const n=Math.ceil(rise/.175);for(let i=0;i<n;i++)box(g,x,base,z+i*run/n,w,rise*(i+1)/n,run/n+.01,stone);}
function loungers(g:THREE.Group,x:number,z:number,y:number,count:number,alongX=true){for(let i=0;i<count;i++){const xx=x+(alongX?i*1.9:0),zz=z+(alongX?0:i*2.8);box(g,xx,y,zz,.72,.26,1.9,timber);box(g,xx+.04,y+.26,zz+.05,.64,.12,1.78,white);const back=box(g,xx+.04,y+.39,zz+1.24,.64,.08,.57,white);back.rotation.x=-.35;}}
export function pitchedRoof(g:THREE.Group,w:number,d:number,form='gable',rise?:number){
 const e=.55,h=rise??Math.min(6,w*.56),y=.26;const geo=new THREE.BufferGeometry();let v:number[]=[];const face=(...ps:number[][])=>{for(let i=1;i<ps.length-1;i++)v.push(...ps[0],...ps[i],...ps[i+1]);};
 if(form==='hip'||form==='pyramid'){
  const a=[-e,y,e],b=[w+e,y,e],c=[w+e,y,-d-e],dd=[-e,y,-d-e];
  if(form==='pyramid'){const p=[w/2,y+h,-d/2];face(a,b,p);face(b,c,p);face(c,dd,p);face(dd,a,p);}else{const inset=Math.min(d*.3,w*.4),r1=[w/2,y+h,-inset],r2=[w/2,y+h,-d+inset];face(a,b,r1);face(b,c,r2,r1);face(c,dd,r2);face(dd,a,r1,r2);}
 }else{face([-e,y,e],[w/2,y+h,e],[w/2,y+h,-d-e],[-e,y,-d-e]);face([w/2,y+h,e],[w+e,y,e],[w+e,y,-d-e],[w/2,y+h,-d-e]);
  for(const z of[e,-d-e]){const glassGeo=new THREE.BufferGeometry();glassGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,y,z,w/2,y+h,z,w,y,z],3));glassGeo.computeVertexNormals();g.add(new THREE.Mesh(glassGeo,material('#9cb7b2')));beam(g,new THREE.Vector3(0,y,z),new THREE.Vector3(w/2,y+h,z),.12,timber);beam(g,new THREE.Vector3(w,y,z),new THREE.Vector3(w/2,y+h,z),.12,timber);beam(g,new THREE.Vector3(w/2,y,z),new THREE.Vector3(w/2,y+h,z),.1,timber);}
 }
 geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,roofMat);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);
 // Raised standing seams make the slope legible without a dense wireframe.
 if(form==='gable')for(let z=.7;z<d;z+=1.4){beam(g,new THREE.Vector3(-e,y+.035,-z),new THREE.Vector3(w/2,y+h+.035,-z),.025,material('#898f92'));beam(g,new THREE.Vector3(w/2,y+h+.035,-z),new THREE.Vector3(w+e,y+.035,-z),.025,material('#898f92'));}
}
export function createSite(scene:THREE.Scene){
 const ground=new THREE.Group(),vegetation=new THREE.Group(),plant=new THREE.Group();ground.userData.softwareGround=true;scene.add(ground,vegetation,plant);
 const main:P[]=[[-68,-43],[-69,27],[-40,34],[-24,63],[-9,99],[10,105],[64,84],[72,49],[61,4],[48,-43]];
 slab(ground,main,.5,3,material('#a3b48b'),false);slab(ground,main,.52,.04,lawn,false);
 const extension:P[]=[[57,-65],[103,-68],[145,-4],[147,44],[140,89],[153,163],[133,183],[100,147],[81,62],[68,-10]];slab(ground,extension,.12,1.8,material('#a3b48b'),false);
 const lower:P[]=[[-43,22],[-25,12],[-7,11],[12,20],[30,24],[42,28],[58,30],[61,47],[54,76],[-16,80],[-39,47]];
 slab(ground,lower,2.6,2.1,basalt);slab(ground,lower,2.62,.02,lawn);retaining(ground,lower,.5,2.6,true);
 const upper:P[]=[[-25,60],[-5,50],[17,54],[54,61],[60,80],[9,100],[-8,89]];slab(ground,upper,4.8,2.2,basalt);slab(ground,upper,4.82,.02,material('#9aaf75'));retaining(ground,upper,2.6,4.8,true);
 // Stone-edged, curved guest promenade and a distinct outer service lane.
 const loop:P[]=[[56,19,.57],[40,18,.57],[36,0,.57],[38,-12,.57],[22,-39,.57],[-4,-36,.57],[-18,-30,.57],[-17,-8,.57],[-24,3,.57],[-30,17,1.4],[-43,33,2.67],[-40,49,2.67],[-29,59,4.87],[-25,82,4.87],[-8,94,4.87],[20,93,4.87],[50,81,4.87],[58,67,4.87],[60,47,2.67],[58,30,2.67]];
 ribbon(ground,loop,3.4,stone,true,170);ribbon(ground,loop.map(p=>[p[0],p[1],p[2]!+.015]),2.8,material('#a8afaa'),true,170);
 ribbon(ground,[[-61,-42,.6],[-61,-29,.6],[-65,-2,.6],[-66,27,.6],[-46,31,1.3],[-41,44,2.7],[-28,51,2.7]],3.2,material('#b6b2a2'));
 ribbon(ground,[[38,-11,.6],[27,6,.6],[30,15,.6],[32,23,.6]],2.4,stone);
 ribbon(ground,[[-24,3,.6],[-15,8,1],[-6,12,2.67],[0,21,2.67],[-4,26,2.67],[-7,36,2.67],[0,52,2.67]],2.2,stone);
 ribbon(ground,[[-24,81,4.86],[-7,66,4.86],[12,70,4.86],[26,69,4.86],[42,65,4.86],[58,68,4.86]],2.1,stone);
 ribbon(ground,[[-57,-8,.58],[-50,-15,.58],[-38,-18,.58],[-22,-20,.58],[-17,-29,.58]],1.7,stone);
 const road:P[]=[[50,-62,.2],[60,-45,.2],[70,-15,.2],[75,12,.2],[78,40,.2],[85,69,.2],[95,102,.2],[111,142,.2],[119,172,.2]];
 ribbon(ground,road,7.5,stone,false,160);ribbon(ground,road.map(p=>[p[0],p[1],.23]),6.6,material('#989d96'),false,160);
 ribbon(ground,[[103,118,.25],[112,120,.25],[122,123,.25]],5,stone);
 ribbon(ground,[[74,19,.27],[68,18,.57],[64,13,.57],[62,9,.57]],5,stone);
 slab(ground,[[60,6],[69,9],[72,17],[68,26],[58,29],[56,24],[63,21],[65,15],[62,11]],.57,.08,stone);
 hedge(vegetation,[[65,7,.6],[70,11,.6],[70,21,.6],[64,27,.6]],.65);
 steps(ground,26,18,4.2,6.5,.5,2.1);steps(ground,22,50,3.4,6,2.6,2.2);steps(ground,-21,8,2.8,5,.5,2.1);
 // Layered planting encloses lawn rooms, with low borders preserving views.
 hedge(vegetation,[[-54,-36,.5],[-33,-35,.5],[-12,-37,.5],[7,-37,.5],[16,-33,.5]],.5);
 hedge(vegetation,[[17,-29,.5],[10,-20,.5],[6,-12,.5]],.55);
 flowerBorder(vegetation,[[15,-28,.5],[8,-20,.5],[4,-12,.5]],30);
 hedge(vegetation,[[1,-10,.5],[-7,-14,.5],[-14,-22,.5]],.55);
 hedge(vegetation,[[38,30,2.6],[32,35,2.6],[31,43,2.6],[37,50,2.6]],.55);
 flowerBorder(vegetation,[[40,30,2.6],[34,35,2.6],[33,43,2.6],[39,50,2.6]],30);
 // An upper lawn and planted edges echo the terraces in the aerial reference.
 hedge(vegetation,[[-38,21,2.6],[-23,13,2.6],[-6,14,2.6],[12,22,2.6],[25,25,2.6]],.7);
 flowerBorder(vegetation,[[-38,23,2.6],[-23,15,2.6],[-6,16,2.6],[12,24,2.6],[25,27,2.6]],42);
 hedge(vegetation,[[-22,60,4.8],[-3,52,4.8],[17,56,4.8],[42,62,4.8]],.65);
 flowerBorder(vegetation,[[-60,-38,.5],[-35,-37,.5],[-12,-39,.5],[12,-38,.5],[26,-41,.5]],48);
 flowerBorder(vegetation,[[39,-11,.5],[35,5,.5],[36,13,.5],[42,22,.5],[48,28,2.6]],30);
 const boundary=smooth(main,true,76);boundary.forEach((p,i)=>{if(i%2===0)tree(vegetation,p[0]+.7,p[1],.5,.8+(i%4)*.07);});
 [[-59,-34,.5],[-53,-19,.5],[-22,-34,.5],[1,-25,.5],[14,-30,.5],[43,-36,.5],[63,-25,.5],[-46,43,2.6],[-28,48,2.6],[28,31,2.6],[29,43,2.6],[38,55,2.6],[3,91,4.8],[23,89,4.8],[52,80,4.8],[94,63,.2],[105,92,.2],[132,112,.2],[140,137,.2]].forEach(([x,z,y],i)=>tree(vegetation,x,z,y,.8+(i%3)*.12));
 [[7,6,.5],[16,17,.5],[40,11,.5],[-7,8,.5],[-8,30,2.6],[18,38,2.6],[56,29,2.6]].forEach(([x,z,y])=>palm(vegetation,x,z,y,.85));
 // Existing peripheral functions from the survey image.
 box(plant,102,.15,86,11,.12,12,stone);for(let i=0;i<5;i++)for(let j=0;j<4;j++)foliage(vegetation,103+i*2,87+j*2.5,.8,.65,'#6e8f54');
 const shed=new THREE.Group();shed.position.set(124,.16,-88);plant.add(shed);box(shed,0,0,0,8,3.2,13,material('#c0b8a4'));const shedRoof=new THREE.Group();shedRoof.position.y=3.2;shed.add(shedRoof);pitchedRoof(shedRoof,8,13,'gable',2.5);
 // A narrow drain follows the western and lower boundary.
 ribbon(ground,[[-72,30,.05],[-73,-7,.05],[-71,-45,.05],[-25,-47,.05],[21,-47,.05],[46,-46,.05]],1.1,material('#829a90'));
 return {ground,vegetation,plant};
}
const waterMat=new THREE.MeshPhysicalMaterial({color:'#ffffff',vertexColors:true,roughness:.27,metalness:.04,clearcoat:.8,clearcoatRoughness:.24,side:THREE.DoubleSide});
const glintMat=new THREE.MeshBasicMaterial({color:'#e3ffff',transparent:true,opacity:.2,depthWrite:false,side:THREE.DoubleSide});
function basin(g:THREE.Group,points:P[],level=.4){
 const edge=smooth(points,true,72).slice(0,-1),cx=edge.reduce((s,p)=>s+p[0],0)/edge.length,cz=edge.reduce((s,p)=>s+p[1],0)/edge.length;
 slab(g,points,level-.12,.32,material('#588c8b'));
 const outer=edge.map(p=>[cx+(p[0]-cx)*1.055,cz+(p[1]-cz)*1.055] as P),ring=shape(outer,false),hole=new THREE.Path();edge.forEach((p,i)=>i?hole.lineTo(p[0],p[1]):hole.moveTo(p[0],p[1]));hole.closePath();ring.holes.push(hole);
 const copingGeo=new THREE.ExtrudeGeometry(ring,{depth:.3,bevelEnabled:false});copingGeo.rotateX(-Math.PI/2);const coping=new THREE.Mesh(copingGeo,stone);coping.position.y=level-.1;coping.castShadow=true;coping.receiveShadow=true;g.add(coping);
 const pos:number[]=[],cols:number[]=[],idx:number[]=[],N=edge.length,R=20,deep=new THREE.Color('#249bac'),shallow=new THREE.Color('#70d6d4');
 for(let r=0;r<=R;r++)for(let i=0;i<N;i++){const f=r/R,p=edge[i],x=cx+(p[0]-cx)*f,z=cz+(p[1]-cz)*f;pos.push(x,level,-z);const c=deep.clone().lerp(shallow,Math.pow(f,3)*.9+.04*Math.sin(x*1.1+z));cols.push(c.r,c.g,c.b);if(r<R){const a=r*N+i,b=r*N+(i+1)%N,cc=(r+1)*N+i,d=(r+1)*N+(i+1)%N;idx.push(a,cc,b,b,cc,d);}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));geo.setIndex(idx);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,waterMat);mesh.receiveShadow=true;g.add(mesh);
 // Small ripples remain above the water and below the coping; no solid slab covers the water.
 for(let j=0;j<7;j++){const a=edge[Math.floor(j*N/7)],f=.25+(j%3)*.13,x=cx+(a[0]-cx)*f,z=cz+(a[1]-cz)*f;ribbon(g,[[x-1,z,level+.013],[x-.2,z+.08,level+.014],[x+.75,z-.06,level+.013]],.028,glintMat,false,8);}
}
function round(cx:number,cz:number,rx:number,rz=rx):P[]{return Array.from({length:16},(_,i)=>[cx+Math.cos(i*Math.PI/8)*rx,cz+Math.sin(i*Math.PI/8)*rz]);}
export function createAmenities(outdoor:(b:Building)=>THREE.Group,vegetation:THREE.Group){
 const pool=outdoor(byId.pool);
 slab(pool,[[0,1],[8,-1],[21,0],[26,6],[27,18],[23,25],[10,25],[-1,19],[-2,9]],.14,.14,stone);
 basin(pool,[[3,4],[10,3],[17,2.5],[23,7],[23,13],[18,18],[10,19],[3,15],[1,9]],.46);
 basin(pool,round(21.8,21.2,2.4,2.2),.88);basin(pool,round(8.4,22,2.5,1.9),.75);
 // Planted island inside the freeform water.
 slab(pool,[[3.5,8],[4.1,6.2],[6.4,6.1],[7,7.6],[6.1,9.1],[4.3,9.8]],.79,.48,stone);slab(pool,[[4,8],[4.4,6.7],[6,6.6],[6.5,7.7],[5.8,8.7],[4.6,9.2]],.84,.08,lawn);palm(pool,5.1,7.6,.84,.65);
 loungers(pool,4,.2,.17,7);loungers(pool,25,6,.17,4,false);
 // A second rectangular lap pool and three cabanas on the lower terrace.
 const lap=new THREE.Group();lap.position.set(-22,0,2);pool.add(lap);box(lap,-1,0,-1,18,.14,16,stone);basin(lap,[[1,1],[15,1],[15,12],[1,12]],.43);loungers(lap,2,13,.16,6);
 for(let i=0;i<3;i++){const cab=new THREE.Group();cab.position.set(-4,0,-i*5);lap.add(cab);box(cab,0,0,0,3.1,.18,3.4,timber);for(const x of[0,2.9])for(const z of[0,3.2])box(cab,x,.18,z,.16,2.5,.16,timber);const cap=new THREE.Group();cap.position.y=2.6;cab.add(cap);pitchedRoof(cap,3.1,3.4,'gable',1.7);box(cab,.35,.25,1,2.3,.35,1.8,white);}
 // The shared upper pool belongs to the Bali cluster and follows its elevation.
 const bali=new THREE.Group();bali.position.set(-13,2.1,-37);pool.add(bali);box(bali,-1,0,-1,11,.15,13,stone);basin(bali,[[0,0],[9,0],[9,11],[0,11]],.39);loungers(bali,10,1,.18,3,false);
 const amph=outdoor(byId.amphitheatre);slab(amph,[[0,0],[26,0],[26,13],[0,13]],.06,.06,lawn,false);box(amph,1,.08,4.5,4.5,.36,4,timber);
 for(let i=0;i<5;i++){const r=5+i*2.5,s=new THREE.Shape();s.absellipse(0,0,r+1.45,(r+1.45)*.36,-Math.PI/2,Math.PI/2,false,0);s.absellipse(0,0,r,r*.36,Math.PI/2,-Math.PI/2,true,0);s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth:.3*(i+1),bevelEnabled:false,curveSegments:30});geo.rotateX(-Math.PI/2);const m=new THREE.Mesh(geo,stone);m.position.set(7,.08,-6.5);m.castShadow=true;amph.add(m);}
 const kids=outdoor(byId.kids);box(kids,0,0,0,byId.kids.w,.12,15,material('#c9b895'));box(kids,2,.12,3,2.4,1.15,2.5,timber);box(kids,2,1.27,3,2.4,.12,2.5,white);
 const posts:P[]=[[1,1,5.5],[14,2,3.8],[13,13,5.6],[2,13,3.6]];posts.forEach(p=>cylinder(kids,p[0],0,p[1],.09,p[2]!,basalt));
 const [a,b,c,d]=posts.map(p=>new THREE.Vector3(p[0],p[2],-p[1]));const surface=(u:number,v:number)=>a.clone().lerp(b,u).lerp(d.clone().lerp(c,u),v).add(new THREE.Vector3(0,-1.1*Math.sin(u*Math.PI)*Math.sin(v*Math.PI),0));const vs:number[]=[];
 for(let i=0;i<12;i++)for(let j=0;j<12;j++){const aa=surface(i/12,j/12),bb=surface((i+1)/12,j/12),cc=surface((i+1)/12,(j+1)/12),dd=surface(i/12,(j+1)/12);[aa,bb,dd,bb,cc,dd].forEach(v=>vs.push(v.x,v.y,v.z));}
 const sailGeo=new THREE.BufferGeometry();sailGeo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));sailGeo.computeVertexNormals();const sail=new THREE.Mesh(sailGeo,white);sail.castShadow=true;kids.add(sail);
 for(let i=0;i<7;i++)cylinder(kids,6+i*.9,.12,9+Math.sin(i),.34,.25+i*.045,timber);
 beam(kids,new THREE.Vector3(7,0,-3),new THREE.Vector3(8,3,-4),.1,timber);beam(kids,new THREE.Vector3(9,0,-3),new THREE.Vector3(8,3,-4),.1,timber);beam(kids,new THREE.Vector3(8,3,-4),new THREE.Vector3(12,3,-4),.1,timber);beam(kids,new THREE.Vector3(11,0,-3),new THREE.Vector3(12,3,-4),.1,timber);beam(kids,new THREE.Vector3(13,0,-3),new THREE.Vector3(12,3,-4),.1,timber);
 const adv=outdoor(byId.adventure);slab(adv,[[0,1],[52,0],[54,42],[8,46],[-2,26]],.04,.1,material('#a7af81'));
 ribbon(adv,[[4,9,.12],[13,3,.12],[28,4,.12],[35,10,.12],[29,18,.12],[35,26,.12],[25,39,.12],[9,37,.12],[4,26,.12],[10,19,.12]],3,material('#ac9270'),true,140);
 const pump=new THREE.CatmullRomCurve3([[40,7,.7],[48,6,.7],[50,13,.8],[47,24,.7],[40,25,.8],[37,18,.6]].map(p=>new THREE.Vector3(p[0],p[2],-p[1])),true,'catmullrom',.25);const pumpMesh=new THREE.Mesh(new THREE.TubeGeometry(pump,120,.9,6,true),material('#7c8475'));adv.add(pumpMesh);
 box(adv,40,.1,33,10,.12,7,stone);box(adv,41,.2,38,8,4.8,.55,timber);for(let i=0;i<32;i++)box(adv,41.3+(i%8)*.95,.6+Math.floor(i/8),37.85,.16,.16,.2,i%2?stone:material('#4a6357'));
 // Western courtyard accommodation: paired room wings and a shared veranda.
 const lodge=outdoor(byId.lodge);box(lodge,0,0,0,22,.17,22,stone);box(lodge,9,.18,2,4,.05,18,lawn);
 for(const x of[0,14]){box(lodge,x,.18,0,8,3.2,22,white);const cap=new THREE.Group();cap.position.set(x,3.38,0);lodge.add(cap);pitchedRoof(cap,8,22,'gable',3.8);for(let i=0;i<6;i++){box(lodge,x+.5,.45,i*3.5+.5,7,2.4,.1,material('#8ba7a3'));box(lodge,x+3.8,.2,i*3.5,.16,3.1,.16,timber);}}box(lodge,8,.18,0,6,.15,2.2,timber);
 const parking=outdoor(byId.parking);box(parking,0,0,0,27,.08,43,material('#b6b6a4'));ribbon(parking,[[12,-4,.12],[12,47,.12]],6,material('#949e96'));
 for(let row=0;row<2;row++)for(let i=0;i<12;i++){const x=row?18:1,z=1+i*3.3;box(parking,x,.1,z,7,.015,.06,white);if(i%3!==1){box(parking,x+1,.15,z+.65,4.1,.72,1.85,material(['#d8ded7','#8c9fa0','#ad8d78'][i%3]));box(parking,x+1.9,.87,z+.8,2.1,.5,1.5,material('#526a69'));}}
 for(let i=0;i<6;i++)tree(vegetation,138,123+i*6,.15,.7);
 const service=outdoor(byId.service);box(service,0,0,0,24,.12,10,stone);box(service,7,.12,0,17,3,7,white);const staffRoof=new THREE.Group();staffRoof.position.set(7,3.12,0);service.add(staffRoof);pitchedRoof(staffRoof,17,7,'hip',3);cylinder(service,3,.12,3,2.2,2.6,material('#aeb9b0'));
}
