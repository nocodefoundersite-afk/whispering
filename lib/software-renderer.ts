import * as THREE from 'three';

// A CPU projection of the same real 3D mesh scene for browsers without WebGL.
// It preserves camera navigation and cutaways; GPU lighting/shadows are omitted.
export class SoftwareRenderer {
 readonly domElement=document.createElement('canvas');
 readonly software=true;
 shadowMap={enabled:false,type:THREE.PCFSoftShadowMap};
 outputColorSpace=THREE.SRGBColorSpace;toneMapping=THREE.ACESFilmicToneMapping;toneMappingExposure=1;
 private context:CanvasRenderingContext2D;private width=1;private height=1;private pixelRatio=1;private last='';private frameAt=0;
 private cache=new WeakMap<THREE.Mesh,{world:Float32Array;indices:ArrayLike<number>;colors:string[];double:boolean;opacity:number}>();
 constructor(){const ctx=this.domElement.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas rendering is unavailable.');this.context=ctx;this.domElement.dataset.renderer='software';}
 setPixelRatio(v:number){this.pixelRatio=Math.min(v,1);}
 setSize(w:number,h:number){this.width=w;this.height=h;this.domElement.width=Math.round(w*this.pixelRatio);this.domElement.height=Math.round(h*this.pixelRatio);this.domElement.style.width=w+'px';this.domElement.style.height=h+'px';this.last='';}
 render(scene:THREE.Scene,camera:THREE.PerspectiveCamera){
  scene.updateMatrixWorld();camera.updateMatrixWorld();
  const meshes:THREE.Mesh[]=[];scene.traverseVisible(o=>{if(o instanceof THREE.Mesh&&!o.userData.softwareSkip)meshes.push(o);});
  const key=camera.matrixWorld.elements.map(v=>v.toFixed(3)).join(',')+':'+meshes.map(m=>m.id).join(',')+':'+this.width;
  if(key===this.last||performance.now()-this.frameAt<55)return;this.last=key;this.frameAt=performance.now();
  const ctx=this.context,w=this.width,h=this.height;ctx.setTransform(this.pixelRatio,0,0,this.pixelRatio,0,0);ctx.globalAlpha=1;ctx.fillStyle='#e9ede8';ctx.fillRect(0,0,w,h);
  const projection=new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),e=projection.elements;
  const faces:{x1:number;y1:number;x2:number;y2:number;x3:number;y3:number;z1:number;z2:number;z3:number;depth:number;layer:number;color:string;opacity:number}[]=[];
  const sun=new THREE.Vector3(-.45,.85,.3).normalize(),v=new THREE.Vector3(),n=new THREE.Vector3();
  for(const mesh of meshes){if(Array.isArray(mesh.material))continue;const material=mesh.material as THREE.MeshStandardMaterial;let cached=this.cache.get(mesh);
   if(!cached){const attr=mesh.geometry.getAttribute('position'),normals=mesh.geometry.getAttribute('normal'),vertexColors=mesh.geometry.getAttribute('color');if(!attr)continue;const world=new Float32Array(attr.count*3),normalMatrix=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    for(let i=0;i<attr.count;i++){v.fromBufferAttribute(attr,i).applyMatrix4(mesh.matrixWorld);world[i*3]=v.x;world[i*3+1]=v.y;world[i*3+2]=v.z;}
    const indices=mesh.geometry.index?.array??Uint32Array.from({length:attr.count},(_,i)=>i),colors:string[]=[];
    for(let i=0;i<indices.length;i+=3){if(normals)n.fromBufferAttribute(normals,indices[i]).applyNormalMatrix(normalMatrix);else n.set(0,1,0);const light=.64+.43*Math.max(0,n.dot(sun));const color=(material.color??new THREE.Color('#d8d8cf')).clone().multiplyScalar(light);if(vertexColors&&material.vertexColors){const c=new THREE.Color(0,0,0);for(let k=0;k<3;k++){const j=indices[i+k];c.r+=vertexColors.getX(j)/3;c.g+=vertexColors.getY(j)/3;c.b+=vertexColors.getZ(j)/3;}color.multiply(c);}color.convertLinearToSRGB();colors.push(`rgb(${Math.min(255,Math.round(color.r*255))},${Math.min(255,Math.round(color.g*255))},${Math.min(255,Math.round(color.b*255))})`);}
    cached={world,indices,colors,double:material.side===THREE.DoubleSide,opacity:material.transparent?material.opacity:1};this.cache.set(mesh,cached);
   }
   let owner:THREE.Object3D|null=mesh,isGround=false;while(owner){if(owner.userData.softwareGround)isGround=true;owner=owner.parent;}
   const pos=cached.world,points=new Float32Array(pos.length/3*4);
   for(let i=0,j=0;i<pos.length;i+=3,j+=4){const x=pos[i],y=pos[i+1],z=pos[i+2],cw=e[3]*x+e[7]*y+e[11]*z+e[15];points[j]=((e[0]*x+e[4]*y+e[8]*z+e[12])/cw*.5+.5)*w;points[j+1]=(-(e[1]*x+e[5]*y+e[9]*z+e[13])/cw*.5+.5)*h;points[j+2]=(e[2]*x+e[6]*y+e[10]*z+e[14])/cw;points[j+3]=cw;}
   const idx=cached.indices;for(let i=0;i<idx.length;i+=3){const a=idx[i]*4,b=idx[i+1]*4,c=idx[i+2]*4;if(points[a+3]<.1||points[b+3]<.1||points[c+3]<.1)continue;
    const x1=points[a],y1=points[a+1],x2=points[b],y2=points[b+1],x3=points[c],y3=points[c+1];const cross=(x2-x1)*(y3-y1)-(y2-y1)*(x3-x1);if(!cached.double&&cross>=0)continue;if(Math.abs(cross)<.4)continue;if(Math.max(x1,x2,x3)<0||Math.min(x1,x2,x3)>w||Math.max(y1,y2,y3)<0||Math.min(y1,y2,y3)>h)continue;
    faces.push({x1,y1,x2,y2,x3,y3,z1:points[a+2],z2:points[b+2],z3:points[c+2],layer:isGround?(pos[idx[i]*3+1]+pos[idx[i+1]*3+1]+pos[idx[i+2]*3+1])/3:100,depth:(points[a+2]+points[b+2]+points[c+2])/3,color:cached.colors[i/3],opacity:cached.opacity});
   }
  }
  // A depth buffer prevents large slabs from hiding furniture or nearby walls.
  // Opaque geometry first; transparent glazing is composited back to front.
  faces.sort((a,b)=>(a.opacity===1?0:1)-(b.opacity===1?0:1)||b.depth-a.depth);
  const iw=Math.ceil(w),ih=Math.ceil(h),frame=ctx.createImageData(iw,ih),pixels=frame.data,packed=new Uint32Array(pixels.buffer),depths=new Float32Array(iw*ih);depths.fill(Infinity);packed.fill((255<<24)|(232<<16)|(237<<8)|233);const colors=new Map<string,number[]>();
  for(const f of faces){let rgb=colors.get(f.color);if(!rgb){rgb=f.color.match(/\d+/g)!.map(Number);colors.set(f.color,rgb);}const [r,g,b]=rgb;
   const minX=Math.max(0,Math.floor(Math.min(f.x1,f.x2,f.x3))),maxX=Math.min(iw-1,Math.ceil(Math.max(f.x1,f.x2,f.x3))),minY=Math.max(0,Math.floor(Math.min(f.y1,f.y2,f.y3))),maxY=Math.min(ih-1,Math.ceil(Math.max(f.y1,f.y2,f.y3)));
   const denominator=(f.y2-f.y3)*(f.x1-f.x3)+(f.x3-f.x2)*(f.y1-f.y3);if(Math.abs(denominator)<.05)continue;
   const dax=(f.y2-f.y3)/denominator,day=(f.x3-f.x2)/denominator,dbx=(f.y3-f.y1)/denominator,dby=(f.x1-f.x3)/denominator,za=f.z1-f.z3,zb=f.z2-f.z3;
   let rowA=dax*(minX+.5-f.x3)+day*(minY+.5-f.y3),rowB=dbx*(minX+.5-f.x3)+dby*(minY+.5-f.y3);
   const pixel=(255<<24)|(b<<16)|(g<<8)|r;
   for(let y=minY;y<=maxY;y++){let a=rowA,bb=rowB,index=y*iw+minX;for(let x=minX;x<=maxX;x++,index++,a+=dax,bb+=dbx){if(a<-.00001||bb<-.00001||a+bb>1.00001)continue;const z=f.z3+a*za+bb*zb;if(z>depths[index]+.00000002)continue;if(f.opacity===1){depths[index]=z;packed[index]=pixel;}else{const p=index*4,o=f.opacity;pixels[p]=r*o+pixels[p]*(1-o);pixels[p+1]=g*o+pixels[p+1]*(1-o);pixels[p+2]=b*o+pixels[p+2]*(1-o);}}rowA+=day;rowB+=dby;}
  }
  ctx.setTransform(1,0,0,1,0,0);ctx.putImageData(frame,0,0);ctx.globalAlpha=1;
  scene.traverseVisible(o=>{if(!(o instanceof THREE.Line))return;const attr=o.geometry.getAttribute('position');if(!attr)return;ctx.beginPath();for(let i=0;i<attr.count;i++){v.fromBufferAttribute(attr,i).applyMatrix4(o.matrixWorld).applyMatrix4(projection);const x=(v.x*.5+.5)*w,y=(-v.y*.5+.5)*h;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.strokeStyle='#ad874e';ctx.lineWidth=1.5;ctx.stroke();});
 }
 dispose(){this.cache=new WeakMap();}
}
