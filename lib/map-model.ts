import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { features, paths, parcels, corePaving,centralPlaza,lowerPlaza,lawnOutline,world, SOURCE,type Point,type Feature } from './map-data';
export function createMapModel(scene:T.Scene,software=false){
 const site=new T.Group(),vegetation=new T.Group(),source=new T.Group(),structures=new T.Group();scene.add(site,vegetation,source,structures);
 const materials=new Map<string,T.MeshStandardMaterial>();
 function material(color:string,roughness=.85){const key=color+roughness;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness}));return materials.get(key)!;}
 const stone=material('#e3decc'),plaster=material('#ece5d4'),wood=material('#a1794e'),glass=new T.MeshPhysicalMaterial({color:'#83babc',roughness:.13,metalness:.15,transparent:true,opacity:.58,depthWrite:false,side:T.DoubleSide});
 const roofMat=material('#9c998a'),railMat=material('#526157'),white=material('#f5f0de'),leaves=[material('#436941'),material('#5d803c'),material('#709849'),material('#8dab4a')];
 const textures:T.Texture[]=[];let seed=925;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
 function texture(kind:'grass'|'paving'|'wood'|'water'){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d')!;
  c.fillStyle={grass:'#8daa4e',paving:'#aeafa2',wood:'#ad835b',water:'#1ab6c4'}[kind];c.fillRect(0,0,256,256);
  if(kind==='paving'){for(let y=0;y<256;y+=32)for(let x=-20;x<256;x+=42){c.fillStyle=['#c9c8bb','#dad5c5','#999f96','#c0bcae'][Math.floor(random()*4)];c.beginPath();c.roundRect(x+(y/32%2)*21+2,y+2,38,28,7);c.fill();}}
  if(kind==='wood'){for(let y=0;y<256;y+=32){c.fillStyle='rgba(46,31,17,.25)';c.fillRect(0,y,256,2);for(let i=0;i<12;i++){c.strokeStyle='rgba(66,42,16,.1)';c.beginPath();c.moveTo(0,y+random()*30);c.bezierCurveTo(85,y+random()*30,170,y+random()*30,256,y+random()*30);c.stroke();}}}
  if(kind==='grass'){for(let i=0;i<6500;i++){c.fillStyle=random()>.5?'rgba(30,65,19,.14)':'rgba(220,230,143,.18)';c.fillRect(random()*256,random()*256,1,2);}}
  if(kind==='water'){for(let i=0;i<160;i++){c.strokeStyle=`rgba(207,255,250,${.07+random()*.14})`;c.lineWidth=.5+random();const x=random()*256,y=random()*256;c.beginPath();c.ellipse(x,y,4+random()*15,1+random()*3,-.3,0,Math.PI*2);c.stroke();}}
  const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(kind==='water'?.18:kind==='grass'?.32:.8,kind==='water'?.18:kind==='grass'?.32:.8);t.anisotropy=4;textures.push(t);return t;
 }
 const paving=new T.MeshStandardMaterial({color:'#ffffff',roughness:.95});paving.map=texture('paving');paving.userData.softwareColor='#b7b6a8';const grass=new T.MeshStandardMaterial({color:'#ffffff',roughness:1});grass.map=texture('grass');grass.userData.softwareColor='#8daa4e';const timber=new T.MeshStandardMaterial({color:'#ffffff',roughness:.83});timber.map=texture('wood');timber.userData.softwareColor='#ad835b';
 const water=new T.MeshPhysicalMaterial({color:'#4be3e7',map:texture('water'),roughness:.18,metalness:.08,clearcoat:1,clearcoatRoughness:.12});
 water.userData.softwareColor='#18adb9';
 const unitBox=new T.BoxGeometry(1,1,1),unitCyl=new T.CylinderGeometry(1,1,1,10),leafGeo=new T.IcosahedronGeometry(1,1);
 function box(g:T.Group,x:number,z:number,w:number,d:number,height:number,y:number,m:T.Material,angle=0){const [wx,wz]=world([x,z]);const o=new T.Mesh(unitBox,m);o.position.set(wx,y+height/2,wz);o.scale.set(w*SOURCE.scale,height,d*SOURCE.scale);o.rotation.y=angle;o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 function cylinder(g:T.Group,x:number,z:number,r:number,height:number,y:number,m:T.Material){const [wx,wz]=world([x,z]);const o=new T.Mesh(unitCyl,m);o.position.set(wx,y+height/2,wz);o.scale.set(r*SOURCE.scale,height,r*SOURCE.scale);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 function shape(points:Point[]){const s=new T.Shape();points.forEach((p,i)=>{const [x,z]=world(p);if(i===0)s.moveTo(x,-z);else s.lineTo(x,-z);});s.closePath();return s;}
 function polygon(g:T.Group,points:Point[],y:number,h:number,m:T.Material){const geometry=h?new T.ExtrudeGeometry(shape(points),{depth:h,bevelEnabled:false,curveSegments:1}):new T.ShapeGeometry(shape(points));geometry.rotateX(-Math.PI/2);const mesh=new T.Mesh(geometry,m);mesh.position.y=y;mesh.castShadow=h>.3;mesh.receiveShadow=true;g.add(mesh);return mesh;}
 function line(g:T.Group,points:Point[],y:number,width:number,m:T.Material,closed=false,smooth=false){if(points.length<2)return;let ps=points.map(p=>{const [x,z]=world(p);return new T.Vector3(x,y,z);});if(smooth)ps=new T.CatmullRomCurve3(ps,closed,'centripetal').getPoints(Math.max(32,points.length*7));else if(closed)ps=[...ps,ps[0].clone()];const coords:number[]=[];const uvs:number[]=[];const indices:number[]=[];let length=0;for(let i=0;i<ps.length;i++){const tangent=ps[Math.min(i+1,ps.length-1)].clone().sub(ps[Math.max(0,i-1)]);if(tangent.lengthSq()<.00001)tangent.set(1,0,0);tangent.normalize();const offset=new T.Vector3(-tangent.z,0,tangent.x).multiplyScalar(width*SOURCE.scale/2);for(const sign of[-1,1]){const p=ps[i].clone().addScaledVector(offset,sign);coords.push(p.x,p.y,p.z);uvs.push(sign===-1?0:width*SOURCE.scale,length);}if(i<ps.length-1){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);length+=ps[i+1].distanceTo(ps[i]);}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(coords,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();const mesh=new T.Mesh(geo,m);mesh.receiveShadow=true;g.add(mesh);return mesh;}
 function wall(g:T.Group,a:Point,b:Point,h:number,m=plaster,y=.25,thickness=1.35){const c:Point=[(a[0]+b[0])/2,(a[1]+b[1])/2],length=Math.hypot(b[0]-a[0],b[1]-a[1]);return box(g,c[0],c[1],length,thickness,h,y,m,-Math.atan2(b[1]-a[1],b[0]-a[0]));}
 function tree(x:number,z:number,s=1,palm=false){const [wx,wz]=world([x,z]);const g=new T.Group();vegetation.add(g);g.position.set(wx,0,wz);const trunk=new T.Mesh(unitCyl,wood);trunk.scale.set(.16*s,3.8*s,.16*s);trunk.position.y=1.9*s;g.add(trunk);if(palm){for(let i=0;i<9;i++){const a=i*Math.PI*2/9;const crown=new T.Mesh(leafGeo,leaves[i%3]);crown.position.set(Math.cos(a)*1.3*s,3.9*s,Math.sin(a)*1.3*s);crown.scale.set(1.85*s,.22*s,.6*s);crown.rotation.y=-a;crown.rotation.z=-.17;crown.castShadow=true;g.add(crown);}}else for(let i=0;i<4;i++){const crown=new T.Mesh(leafGeo,leaves[i%3]);crown.position.set(Math.sin(i*2.4)*.65*s,(3.2+i*.34)*s,Math.cos(i*2.4)*.65*s);crown.scale.set(1.3*s,1.45*s,1.2*s);crown.castShadow=true;g.add(crown);}}
 function shrub(x:number,z:number,r=3){cylinder(vegetation,x,z,r,.5,.15,leaves[3]);}
 function furnitureTable(g:T.Group,x:number,y:number,r=3.1){cylinder(g,x,y,.6,.64,.28,railMat);cylinder(g,x,y,r,.12,.92,wood);for(let i=0;i<4;i++){const a=i*Math.PI/2;box(g,x+Math.cos(a)*(r+1.8),y+Math.sin(a)*(r+1.8),2.7,2.7,.43,.28,white);}}
 function bed(g:T.Group,x:number,z:number,angle=0){box(g,x,z,10,11,.45,.26,wood,angle);box(g,x,z,9.5,10.4,.22,.71,white,angle);}
 // Flat ground datum: this particular map has no terrain spot heights.
 parcels.forEach(p=>polygon(site,p.points,-.5,.5,material(p.color)));
 polygon(site,corePaving,.01,.09,material('#e9e5d7'));
 polygon(site,centralPlaza,.12,.08,stone);polygon(site,lowerPlaza,.12,.08,stone);
 polygon(site,features.find(f=>f.id==='garden-lawn')!.points,.13,.09,grass);polygon(site,lawnOutline,.24,.03,material('#8cab38'));
 // Southern paved garden terrace and planted edge, kept within the drawing.
 polygon(site,[[1111,1019],[1254,992],[1241,1038],[1100,1065]],.24,.06,timber);
 for(const p of parcels.slice(0,2))line(site,p.points,.09,1.5,material('#8e9674'),true);
 for(const p of paths){if(p.id==='access-road'){line(site,p.points,.06,p.width+4,stone,false,true);line(site,p.points,.10,p.width,material(p.color),false,true);line(site,p.points,.115,.6,material('#d4d6cc'),false,true);}else if(p.id==='atv'){line(site,p.points,.1,p.width+2,material('#dbc5a1'),p.closed,true);line(site,p.points,.14,p.width,material(p.color),p.closed,true);}else{line(site,p.points,.23,p.width+1.8,stone,p.closed,true);line(site,p.points,.27,p.width,p.color==='#aaa99b'?paving:material(p.color),p.closed,true);}}
 // Fine green strips alongside the original road; the road itself stays clear.
 for(const dy of[-19,19])line(site,paths[0].points.map(p=>[p[0],p[1]+dy] as Point),.12,3.2,leaves[3],false,true);
 const models=new Map<string,{root:T.Group;roof:T.Group;body:T.Group;feature:Feature}>();const selectable:T.Object3D[]=[];
 for(const f of features){const root=new T.Group(),roof=new T.Group(),body=new T.Group();root.userData.building=f.id;root.add(body,roof);structures.add(root);models.set(f.id,{root,roof,body,feature:f});selectable.push(root);const xs=f.points.map(p=>p[0]),ys=f.points.map(p=>p[1]),xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys),cx=(xmin+xmax)/2,cz=(ymin+ymax)/2;
  if(f.kind==='pool'){
   const waterPoints=f.id==='main-pool'?new T.CatmullRomCurve3(f.points.map(p=>new T.Vector3(p[0],0,p[1])),true,'centripetal').getPoints(150).slice(0,-1).map(p=>[p.x,p.z] as Point):f.points;polygon(body,waterPoints,.19,.04,material('#008fa7'));const mesh=polygon(body,waterPoints,.245,0,water);mesh.userData.water=true;line(body,waterPoints,.29,2.5,stone,true);line(body,waterPoints,.265,.65,material('#76e5e8'),true);
  }else if(f.kind==='building'){
   polygon(body,f.points,.24,.12,stone);for(let i=0;i<f.points.length;i++){const a=f.points[i],b=f.points[(i+1)%f.points.length],length=Math.hypot(a[0]-b[0],a[1]-b[1]);
    wall(body,a,b,.58,material(f.color));wall(body,a,b,.22,wood,f.height-.1);if(length<7){wall(body,a,b,f.height,material(f.color));continue;}
    const segments=Math.max(1,Math.round(length/13));for(let j=0;j<segments;j++){const p:Point=[a[0]+(b[0]-a[0])*j/segments,a[1]+(b[1]-a[1])*j/segments];box(body,p[0],p[1],1,1,f.height,.27,wood);const q:Point=[a[0]+(b[0]-a[0])*(j+1)/segments,a[1]+(b[1]-a[1])*(j+1)/segments];wall(body,p,q,f.height-.9,glass,.84,.35);}
   }
   polygon(roof,f.points,f.height+.17,.21,roofMat);line(roof,f.points,f.height+.4,1.1,material('#d5cab0'),true);
   if(f.roof==='hip'&&f.points.length===4){const ps=f.points.map(p=>{const [x,z]=world(p);return new T.Vector3(x,f.height+.38,z);}),center=ps.reduce((a,b)=>a.add(b),new T.Vector3()).multiplyScalar(.25);center.y+=1.5;const vertices:number[]=[];for(let i=0;i<4;i++)[ps[i],ps[(i+1)%4],center].forEach(p=>vertices.push(p.x,p.y,p.z));const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();const m=roofMat.clone();m.side=T.DoubleSide;const mesh=new T.Mesh(geo,m);mesh.castShadow=true;roof.add(mesh);}
   if(f.group&&f.group!=='canopy'){bed(body,cx,cz);}
   if(f.id==='restaurant'){for(let x=1007;x<1080;x+=17)for(let z=507;z<537;z+=15)furnitureTable(body,x,z,2.5);}
   if(f.id==='club-house'){box(body,970,517,18,6,.8,.3,wood);}
   if(f.id==='gym'){for(let i=0;i<4;i++){box(body,1188+i*12,362,6,12,.32,.3,railMat);box(body,1188+i*12,356,6,1,1.2,.5,railMat);}for(let i=0;i<4;i++)box(body,1188+i*12,386,6,12,.06,.37,material('#669e9c'));}
   if(f.id==='yoga'){for(let i=0;i<4;i++)for(let j=0;j<2;j++)box(body,1188+i*13,199+j*16,6,11,.04,.39,material('#8c9971'));}
   if(f.id==='kitchen'){for(const [x,y,w,d] of[[1051,560,8,19],[1082,570,7,30],[1105,560,21,8],[1105,592,21,8]])box(body,x,y,w,d,.9,.36,material('#b2b8b0'));}
   if(f.id==='room-block'){const a=f.points[0],b=f.points[1],c=f.points[2],d=f.points[3];const mix=(a:Point,b:Point,t:number):Point=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];for(const t of[.45,.55])wall(body,mix(a,b,t),mix(d,c,t),2.9);for(let i=1;i<6;i++){const l=mix(a,d,i/6),r=mix(b,c,i/6);wall(body,l,mix(l,r,.45),2.9);wall(body,mix(l,r,.55),r,2.9);}for(let i=0;i<6;i++){const l=mix(a,d,(i+.5)/6),r=mix(b,c,(i+.5)/6);for(const t of[.23,.77]){const p=mix(l,r,t);bed(body,p[0],p[1],.14);}}}
   if(f.group==='studio'){wall(body,[(f.points[0][0]+f.points[1][0])/2,(f.points[0][1]+f.points[1][1])/2],[(f.points[2][0]+f.points[3][0])/2,(f.points[2][1]+f.points[3][1])/2],3.1);for(const dx of[-12,12])bed(body,cx+dx,cz);}
   if(f.id==='east-building'){
    const eastColors=['#dada45','#dada45','#3475a4','#3475a4','#3475a4','#3475a4','#ad6c35','#a671a1'];for(let i=0;i<8;i++){const yy=157+i*28,xx=1557+(yy-141)*.078;box(body,xx,yy,19,24,.025,.375,material(eastColors[i]));box(body,xx+31,yy,21,24,.025,.375,material(eastColors[i]));if(i>0){wall(body,[xx-10,yy-13],[xx+10,yy-13],2.6);wall(body,[xx+20,yy-13],[xx+42,yy-13],2.6);}}for(let x=1582;x<1618;x+=14)for(let z=366;z<399;z+=13)furnitureTable(body,x,z,2.4);
   }
  }else if(f.kind==='canopy'){
   polygon(body,f.points,.24,.12,timber);for(const p of f.points)box(body,p[0],p[1],1.1,1.1,f.height+.7,.25,wood);
   const verts:number[]=[],indices:number[]=[],uv:number[]=[];for(let v=0;v<=16;v++)for(let u=0;u<=16;u++){const a=u/16,b=v/16,p=f.points;const x=(1-b)*(p[0][0]*(1-a)+p[1][0]*a)+b*(p[3][0]*(1-a)+p[2][0]*a),z=(1-b)*(p[0][1]*(1-a)+p[1][1]*a)+b*(p[3][1]*(1-a)+p[2][1]*a);const [wx,wz]=world([x,z]);verts.push(wx,f.height+.9-1.25*Math.sin(a*Math.PI)*Math.sin(b*Math.PI),wz);uv.push(a,b);if(u<16&&v<16){const i=v*17+u;indices.push(i,i+17,i+1,i+1,i+17,i+18);}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();const m=material(f.color).clone();m.side=T.DoubleSide;const mesh=new T.Mesh(geo,m);mesh.castShadow=true;roof.add(mesh);furnitureTable(body,cx,cz,4);
  }else if(f.kind==='court'){
   polygon(body,f.points,.16,.07,material(f.color));line(body,f.points,.25,.6,white,true);
   if(f.id==='paintball'){for(const p of[[993,195],[1079,206],[987,247],[1057,274],[990,320],[1075,332]]){box(body,p[0],p[1],10,5,1.4,.25,wood);box(body,p[0]+4,p[1]+5,5,8,1.1,.25,wood);}}else{
    const x1=xmin+8,x2=xmax-8,z1=ymin+5,z2=ymax-5;line(body,[[x1,z1],[x2,z1],[x2,z2],[x1,z2]],.25,.8,white,true);line(body,[[cx,z1],[cx,z2]],.27,.75,white);line(body,[[x1,cz],[x2,cz]],.27,.65,white);
    wall(body,[cx,ymin+2],[cx,ymax-2],.9,railMat,.28,.28);for(let z=ymin+2;z<=ymax-2;z+=2.6)wall(body,[cx,z],[cx,z+.15],.9,white,.28,.13);
    for(let x=xmin;x<=xmax;x+=18)for(const z of[ymin,ymax])box(body,x,z,.5,.5,f.id==='padel'?3:2.1,.2,railMat);
    if(f.id==='padel')for(let i=0;i<4;i++)wall(body,f.points[i],f.points[(i+1)%4],2.5,glass,.25,.2);
   }
  }else if(f.id==='arrival'){
   polygon(body,f.points,.13,.07,material('#686c69'));const island:Point[]=[];for(let i=0;i<40;i++){const a=i/40*Math.PI*2;island.push([817+25*Math.cos(a),439+22*Math.sin(a)]);}polygon(body,island,.22,.12,stone);for(const [x,z] of[[805,439],[825,433],[821,450]])shrub(x,z,8);
  }else if(f.id==='parking'){
   polygon(body,f.points,.03,.04,material('#dce0d6'));const car=(x:number,z:number,angle:number,i:number)=>{const m=material(['#e6e4d9','#758c9a','#b89476','#d2c7ad'][i%4]);box(body,x,z,9,20,.78,.18,m,angle);box(body,x,z,8,11,.6,.95,material('#59717a'),angle);};
   for(let i=0;i<26;i++){const x=216+i*14,z=180-(x-210)*.081;wall(body,[x,z],[x+2.5,z+32],.02,white,.16,.5);if(i%4!==1)car(x+7,z+16,-.08,i);}
   for(let row=0;row<2;row++)for(let i=0;i<18;i++){const x=267+i*14.8,z=244-(x-267)*.083+row*30;wall(body,[x,z],[x+2.5,z+28],.02,white,.16,.45);if((i+row)%4!==1)car(x+7,z+14,-.08,i+row);}
   for(let i=0;i<8;i++){const z=234+i*14.5,x=168+(z-234)*.13;wall(body,[x-14,z],[x+15,z+4],.02,white,.16,.5);if(i%3)car(x,z+7,Math.PI/2+.14,i);}
  }
 }
 // Traced outdoor furniture and secondary pools.
 for(const [x,z] of[[945,508],[933,525],[919,541],[972,555],[989,555],[1010,557],[1027,574],[1030,594]])furnitureTable(site,x,z,2.7);
 for(const [x,z,a] of[[886,581,.45],[882,601,.4],[889,630,.5],[914,650,-.2],[939,648,-.2],[962,648,0],[983,648,0],[911,561,1.6],[936,566,1.6],[960,565,1.6]]){box(site,x,z,4,10,.33,.26,wood,a);box(site,x,z,3.6,9,.12,.59,white,a);}
 for(const [x,z] of[[879,552],[866,570],[872,647],[896,656],[1009,641]]){cylinder(site,x,z,.3,2.1,.25,wood);const [wx,wz]=world([x,z]);const umbrella=new T.Mesh(new T.ConeGeometry(1.5,.45,8),material('#bc9871'));umbrella.position.set(wx,2.6,wz);site.add(umbrella);}
 line(site,[[897,609],[911,610],[924,619],[932,627]],.65,6,timber,false,true);
 for(const [x,z] of[[905,620],[993,604]]){cylinder(site,x,z,5,.11,.28,material('#c68570'));cylinder(site,x,z,3.8,.02,.40,material('#45bcc2'));}
 line(site,[[928,607],[943,610],[959,616],[964,622],[960,625],[945,620],[932,618]],.45,1.8,material('#c58671'),true,true);
 for(let i=0;i<5;i++)cylinder(site,931+i*5,612+i*1.3,1,.38,.27,wood);
 // Pool terraces on the five western suites.
 for(const f of features.filter(f=>f.group==='west-suite')){const p=f.points;const a=p[1],b=p[2];const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);const n:Point=[dz/len*7,-dx/len*7];polygon(site,[a,[a[0]+n[0],a[1]+n[1]],[b[0]+n[0],b[1]+n[1]],b],.26,0,water);}
 for(const p of[[1128,1032],[1223,1014]])box(site,p[0],p[1],27,22,.13,.34,stone);
 // Planted islands and round basins in the garden, as shown in the map.
 for(const [x,z,r] of[[1069,794,8],[1092,734,5],[1130,734,4],[1202,824,5],[1100,902,6],[1145,894,8],[1129,999,11],[1246,985,6]]){cylinder(site,x,z,r,.22,.24,stone);cylinder(site,x,z,r*.72,.02,.47,material('#49b693'));}
 for(const [x,z] of[[1067,770],[1084,808],[1176,846],[1148,887],[1208,856],[1219,902],[1238,968]])shrub(x,z,5);
 // Sports garden axis, exactly between the western rooms and courts.
 polygon(site,[[1246,208],[1301,208],[1300,276],[1246,275]],.2,.05,stone);line(site,[[1272,213],[1272,269]],.3,15,material('#9877a0'));for(let z=216;z<272;z+=14){furnitureTable(site,1254,z,2.5);furnitureTable(site,1294,z,2.5);}polygon(site,[[1261,291],[1283,291],[1283,313],[1261,313]],.2,.3,stone);for(const p of[[1268,298],[1277,307],[1278,298],[1268,307]])shrub(p[0],p[1],4);
 // Trees are restricted to the source's perimeter planting and planted islands.
 for(const [x,z] of[[1518,121],[1538,112],[1560,106],[1580,102],[1602,98],[1623,99],[1640,92],[1649,455],[1630,454],[1610,450],[1589,456],[1499,426],[1479,427],[1459,424],[1437,420],[1420,416],[953,165],[949,194],[942,227],[936,260],[929,296],[921,330],[979,130],[1000,131],[1021,131],[1041,131],[1061,133]])tree(x,z,.8,true);
 for(const x of[666,690,882,907,1040,1063,1188])for(const z of[378,441])tree(x,z,.8,true);
 for(const [x,z] of[[760,472],[884,466],[910,460],[692,794],[873,792],[859,688],[895,684],[1008,684],[1015,803],[939,821],[1080,759],[1140,767],[1200,795],[1087,861]])shrub(x,z,5);
 // Soft projected shadows retain spatial depth in browsers with WebGL disabled.
 if(software){const hull=(points:Point[])=>{const p=[...points].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cross=(a:Point,b:Point,c:Point)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);const half=(a:Point[])=>{const q:Point[]=[];for(const v of a){while(q.length>1&&cross(q[q.length-2],q[q.length-1],v)<=0)q.pop();q.push(v);}return q.slice(0,-1);};return [...half(p),...half([...p].reverse())];};for(const f of features.filter(f=>f.height>0)){const points=hull([...f.points,...f.points.map(p=>[p[0]+f.height*4,p[1]+f.height*2.5] as Point)]),cx=points.reduce((a,p)=>a+p[0],0)/points.length,cz=points.reduce((a,p)=>a+p[1],0)/points.length;for(let j=0;j<3;j++){const shadow=new T.MeshBasicMaterial({color:'#314335',transparent:true,opacity:[.035,.05,.09][j],depthWrite:false});polygon(site,points.map(p=>[cx+(p[0]-cx)*(1+(2-j)*.017),cz+(p[1]-cz)*(1+(2-j)*.017)] as Point),.345+j*.0001,0,shadow);}}}
 // Source sheet lies in the very same coordinate system as every mesh.
 const sourceMat=new T.MeshBasicMaterial({color:'#ffffff',side:T.DoubleSide});const refGeometry=new T.PlaneGeometry(SOURCE.width*SOURCE.scale,SOURCE.height*SOURCE.scale);refGeometry.rotateX(-Math.PI/2);const reference=new T.Mesh(refGeometry,sourceMat);reference.position.set((SOURCE.width/2-940)*SOURCE.scale,.02,(SOURCE.height/2-650)*SOURCE.scale);reference.userData.reference=true;source.add(reference);source.visible=false;
 const loader=new T.TextureLoader();loader.load(SOURCE.url,t=>{t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;sourceMat.map=t;sourceMat.needsUpdate=true;textures.push(t);reference.userData.referenceImage=t.image;});
 function batch(g:T.Group){g.updateMatrixWorld(true);const inverse=g.matrixWorld.clone().invert(),buckets=new Map<T.Material,T.BufferGeometry[]>(),remove:T.Object3D[]=[];g.traverse(o=>{if(o instanceof T.Mesh&&!Array.isArray(o.material)&&!o.material.transparent&&!o.userData.reference){const list=buckets.get(o.material)??[];let geo=o.geometry.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld));if(geo.index){const unindexed=geo.toNonIndexed();geo.dispose();geo=unindexed;}if(!geo.getAttribute('uv'))geo.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(geo.getAttribute('position').count*2),2));list.push(geo);buckets.set(o.material,list);remove.push(o);}});remove.forEach(o=>o.removeFromParent());for(const [mat,geos]of buckets){const geo=mergeGeometries(geos,false);geos.forEach(g=>g.dispose());if(geo){const mesh=new T.Mesh(geo,mat);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);}}}
 batch(site);batch(vegetation);for(const m of models.values()){batch(m.body);batch(m.roof);}
 return{site,vegetation,source,structures,models,selectable,textures};
}
