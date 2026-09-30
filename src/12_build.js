
/* ============================ world builder ============================ */
const T=0.3;
let WORLD=null;
function ctex(w,h,draw){
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;draw(x,w,h);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;
  t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t;
}
const rc=a=>a[Math.floor(Math.random()*a.length)];
function speck(x,w,h,n,cols){for(let i=0;i<n;i++){x.fillStyle=rc(cols);x.fillRect(Math.floor(Math.random()*w),Math.floor(Math.random()*h),1,1);}}
// pixel-art textures: 16 texels per metre, tiny palettes, hand-placed highlights
function buildTextures(){
  const T={};
  const wall=(c1,c2,c3)=>ctex(32,64,(x,w,h)=>{
    x.fillStyle=c1;x.fillRect(0,0,w,h);
    for(let i=0;i<w;i+=8){x.fillStyle=c2;x.fillRect(i,3,3,41);x.fillStyle=c3;x.fillRect(i+3,3,1,41);}
    x.fillStyle=c3;for(let j=6;j<44;j+=12)for(let i=4;i<w;i+=8){x.fillRect(i,j,1,1);x.fillRect(i-1,j+1,3,1);x.fillRect(i,j+2,1,1);}
    x.fillStyle='#15090d';x.fillRect(0,0,w,2);x.fillStyle='#4a3828';x.fillRect(0,2,w,1);
    x.fillStyle='#2a1c14';x.fillRect(0,44,w,20);x.fillStyle='#4a3324';x.fillRect(0,44,w,1);x.fillStyle='#7a5636';x.fillRect(0,45,w,1);
    for(let i=0;i<w;i+=16){x.fillStyle='#3a271a';x.fillRect(i+2,48,12,12);x.fillStyle='#1f140d';x.fillRect(i+2,48,12,1);x.fillRect(i+2,48,1,12);x.fillStyle='#55392a';x.fillRect(i+3,59,11,1);x.fillRect(i+13,49,1,10);}
    x.fillStyle='#120c08';x.fillRect(0,62,w,2);speck(x,w,44,30,['rgba(0,0,0,.18)','rgba(255,255,255,.06)']);
  });
  T.wall=[wall('#5a2a36','#6a3442','#7a4050'),wall('#27402f','#31503c','#3d6049'),wall('#2e3250','#383d60','#444a74')];
  T.stonewall=ctex(32,64,(x,w,h)=>{x.fillStyle='#14141a';x.fillRect(0,0,w,h);const P=['#34343e','#3c3c47','#444450','#2e2e38'];
    for(let r=0;r<16;r++){const off=(r%2)*8;for(let c=-1;c<4;c++){x.fillStyle=rc(P);x.fillRect(c*16+off+1,r*4+1,15,3);x.fillStyle='rgba(255,255,255,.12)';x.fillRect(c*16+off+1,r*4+1,15,1);}}
    speck(x,w,h,40,['rgba(0,0,0,.3)','rgba(120,140,100,.15)']);});
  T.parq=ctex(32,32,(x,w,h)=>{const P=['#4a2c18','#55331c','#3e2412','#5e3a20'];
    for(let r=0;r<8;r++){const off=(r%2)*8;for(let c=-1;c<3;c++){x.fillStyle=rc(P);x.fillRect(c*16+off,r*4,16,4);x.fillStyle='#22130a';x.fillRect(c*16+off,r*4+3,16,1);x.fillRect(c*16+off+15,r*4,1,4);x.fillStyle='rgba(255,220,160,.15)';x.fillRect(c*16+off+1,r*4,14,1);}}});
  T.carpet=ctex(16,16,(x,w,h)=>{x.fillStyle='#5a1a28';x.fillRect(0,0,w,h);x.fillStyle='#7a2a3a';x.fillRect(0,0,w,1);x.fillRect(0,0,1,h);x.fillStyle='#3a0f1a';x.fillRect(w-1,0,1,h);x.fillRect(0,h-1,w,1);
    x.fillStyle='#8a3848';for(const p of[[4,4],[12,4],[8,8],[4,12],[12,12]]){x.fillRect(p[0],p[1],1,1);x.fillRect(p[0]-1,p[1]+1,3,1);x.fillRect(p[0],p[1]+2,1,1);}speck(x,w,h,20,['#4a1420','#6a2232']);});
  T.carpetd=ctex(16,16,(x,w,h)=>{x.fillStyle='#1d2a3c';x.fillRect(0,0,w,h);x.fillStyle='#2c3e56';x.fillRect(0,0,w,1);x.fillRect(0,0,1,h);x.fillStyle='#121c2a';x.fillRect(w-1,0,1,h);x.fillRect(0,h-1,w,1);
    x.fillStyle='#3a5070';for(const p of[[4,4],[12,4],[8,8],[4,12],[12,12]]){x.fillRect(p[0],p[1],1,1);x.fillRect(p[0]-1,p[1]+1,3,1);x.fillRect(p[0],p[1]+2,1,1);}speck(x,w,h,20,['#17222f','#26364c']);});
  T.conc=ctex(32,32,(x,w,h)=>{x.fillStyle='#46484e';x.fillRect(0,0,w,h);speck(x,w,h,140,['#3a3c42','#52555c','#34363c']);x.fillStyle='#2c2e33';x.fillRect(0,0,w,1);x.fillRect(0,0,1,h);x.fillRect(9,14,6,1);x.fillRect(14,15,1,4);});
  T.stone=ctex(32,32,(x,w,h)=>{x.fillStyle='#16161c';x.fillRect(0,0,w,h);const P=['#2c2c34','#34343e','#282830'];for(let i=0;i<2;i++)for(let j=0;j<2;j++){x.fillStyle=rc(P);x.fillRect(i*16+1,j*16+1,14,14);x.fillStyle='rgba(255,255,255,.1)';x.fillRect(i*16+1,j*16+1,14,1);}speck(x,w,h,30,['rgba(0,0,0,.3)']);});
  T.tile=ctex(32,32,(x,w,h)=>{for(let i=0;i<2;i++)for(let j=0;j<2;j++){const l=(i+j)%2;x.fillStyle=l?'#17161c':'#c9c3b7';x.fillRect(i*16,j*16,16,16);x.fillStyle=l?'#24232b':'#e6e0d4';x.fillRect(i*16,j*16,16,1);x.fillRect(i*16,j*16,1,16);x.fillStyle=l?'#0d0c10':'#a8a296';x.fillRect(i*16+15,j*16,1,16);x.fillRect(i*16,j*16+15,16,1);}speck(x,w,h,24,['rgba(0,0,0,.15)']);});
  T.tile2=ctex(16,16,(x,w,h)=>{x.fillStyle='#57706c';x.fillRect(0,0,w,h);for(let i=0;i<2;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?'#7f9490':'#8aa09c';x.fillRect(i*8+1,j*8+1,7,7);}speck(x,w,h,10,['rgba(255,255,255,.12)']);});
  T.grass2=ctex(32,32,(x,w,h)=>{x.fillStyle='#1c2e20';x.fillRect(0,0,w,h);for(let i=0;i<2;i++)for(let j=0;j<2;j++){x.fillStyle=rc(['#2b4a30','#33563a','#274228']);x.fillRect(i*16+1,j*16+1,14,14);}speck(x,w,h,50,['#3f6b44','#1a3020']);});
  T.grass=ctex(32,32,(x,w,h)=>{x.fillStyle='#10301a';x.fillRect(0,0,w,h);speck(x,w,h,140,['#1b4a26','#0c2414','#245a30']);for(let i=0;i<14;i++){x.fillStyle='#2f6a3a';const px=Math.floor(Math.random()*w),py=Math.floor(Math.random()*h);x.fillRect(px,py,1,2);}});
  T.books=ctex(64,32,(x,w,h)=>{x.fillStyle='#1a100a';x.fillRect(0,0,w,h);for(let r=0;r<2;r++){let px=0;while(px<w){const bw=2+Math.floor(Math.random()*3),bh=10+Math.floor(Math.random()*5);
      x.fillStyle=rc(['#7a1f2a','#2a4a7a','#2a6a3a','#8a6a2a','#5a2a6a','#6a3a1a','#3a3a3a']);x.fillRect(px,r*16+15-bh,bw-1,bh);x.fillStyle='rgba(255,255,255,.2)';x.fillRect(px,r*16+15-bh,1,bh);px+=bw;}x.fillStyle='#3a2414';x.fillRect(0,r*16+15,w,1);}});
  T.wine=ctex(64,32,(x,w,h)=>{x.fillStyle='#120c08';x.fillRect(0,0,w,h);for(let r=0;r<4;r++)for(let c=0;c<8;c++){x.fillStyle=(c+r)%3?'#4a1a28':'#1c3a22';x.fillRect(c*8+1,r*8+1,6,6);x.fillStyle='#8a4a5a';x.fillRect(c*8+2,r*8+2,1,1);x.fillStyle='#d8c890';x.fillRect(c*8+2,r*8+4,4,1);}});
  T.stairs=ctex(32,32,(x,w,h)=>{for(let i=0;i<8;i++){x.fillStyle=i%2?'#5a3f2c':'#46301f';x.fillRect(0,i*4,w,4);x.fillStyle='#8a6a48';x.fillRect(0,i*4,w,1);x.fillStyle='#2a1a10';x.fillRect(0,i*4+3,w,1);}});
  T.frame=ctex(32,32,(x,w,h)=>{x.fillStyle='#3a2410';x.fillRect(0,0,w,h);x.fillStyle='#7a5a2a';x.fillRect(1,1,w-2,1);x.fillRect(1,1,1,h-2);x.fillStyle='#1a1008';x.fillRect(w-2,2,1,h-3);x.fillRect(2,h-2,w-3,1);
    const g=['#2a3a4a','#34485a','#3e566a'];for(let j=3;j<h-3;j++){x.fillStyle=g[Math.floor(j/9)%3];x.fillRect(3,j,w-6,1);}
    x.fillStyle='#c8a880';x.fillRect(12,8,8,9);x.fillStyle='#2a1a10';x.fillRect(11,7,10,3);x.fillStyle='#14202a';x.fillRect(9,18,14,10);x.fillStyle='#000';x.fillRect(14,11,1,1);x.fillRect(17,11,1,1);});
  T.noise=ctex(8,8,(x,w,h)=>{x.fillStyle='#e8e8e8';x.fillRect(0,0,w,h);speck(x,w,h,14,['#cfcfcf','#b8b8b8','#f8f8f8']);});
  return T;
}
function uvScale(g,w,h,d,u,y0){
  const uv=g.attributes.uv,dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
  for(let f=0;f<6;f++)for(let i=0;i<4;i++){const k=f*4+i,a=dims[f][0],b=dims[f][1];
    if(f===2||f===3)uv.setXY(k,uv.getX(k)*a/u,uv.getY(k)*b/u);else uv.setXY(k,uv.getX(k)*a/u,(uv.getY(k)*b+((y0%4)+4)%4)/4);}
  return g;
}
function rectMinus(r,holes){
  let list=[r];
  for(const h of holes){const nl=[];
    for(const q of list){
      if(h.x1<=q.x0||h.x0>=q.x1||h.z1<=q.z0||h.z0>=q.z1){nl.push(q);continue;}
      const ox0=Math.max(q.x0,h.x0),ox1=Math.min(q.x1,h.x1);
      if(q.x0<h.x0)nl.push({x0:q.x0,z0:q.z0,x1:h.x0,z1:q.z1});
      if(q.x1>h.x1)nl.push({x0:h.x1,z0:q.z0,x1:q.x1,z1:q.z1});
      if(q.z0<h.z0)nl.push({x0:ox0,z0:q.z0,x1:ox1,z1:h.z0});
      if(q.z1>h.z1)nl.push({x0:ox0,z0:h.z1,x1:ox1,z1:q.z1});
    }list=nl;}
  return list;
}
function genEdges(lv){
  const cells=new Map(),rs=ROOMS.filter(r=>r.lv===lv);let mnx=1e9,mxx=-1e9,mnz=1e9,mxz=-1e9;
  for(const r of rs){mnx=Math.min(mnx,r.x0);mxx=Math.max(mxx,r.x1);mnz=Math.min(mnz,r.z0);mxz=Math.max(mxz,r.z1);
    for(let x=r.x0;x<r.x1;x++)for(let z=r.z0;z<r.z1;z++)cells.set(x+','+z,r);}
  const out=[];
  for(let f=mnz;f<=mxz;f++)for(let u=mnx;u<mxx;u++){const a=cells.get(u+','+(f-1)),b=cells.get(u+','+f);if(a!==b)out.push({o:'x',f,u,a,b});}
  for(let f=mnx;f<=mxx;f++)for(let u=mnz;u<mxz;u++){const a=cells.get((f-1)+','+u),b=cells.get(f+','+u);if(a!==b)out.push({o:'z',f,u,a,b});}
  return out;
}
function edgeKind(e){const a=e.a,b=e.b;if(a&&b&&a.void&&b.void)return'none';if((a&&a.void&&b&&b.rail)||(b&&b.void&&a&&a.rail))return'rail';return'wall';}

function buildWorld(scene){
  const tx=buildTextures(),W={doors:[],wins:[],furn:[],objs:[],exits:[],hides:[],switches:[],noise:[],lamps:[],pool:[],vents:[],fuses:[],tlamps:[],tports:[],zones:new Map()};
  WORLD=W;
  const lam=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));
  const wallMats=tx.wall.map(t=>lam(0xffffff,{map:t})),stoneWall=lam(0xffffff,{map:tx.stonewall});
  const ceilM=lam(0x141217,{side:THREE.DoubleSide});
  const grp=new THREE.Group();scene.add(grp);W.group=grp;
  const KEEP=[];
  const keep=(x0,z0,x1,z1,y)=>KEEP.push({x0,z0,x1,z1,y});
  function box(x0,y0,z0,x1,y1,z1,mat,coll,tile){
    const w=x1-x0,h=y1-y0,d=z1-z0,g=uvScale(new THREE.BoxGeometry(w,h,d),w,h,d,tile||2,y0);
    const m=new THREE.Mesh(g,mat);m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);grp.add(m);
    return coll?addCol(x0,y0,z0,x1,y1,z1):null;
  }
  // ---------- walls from room cells ----------
  const gaps=new Map();
  const addGap=(lv,ax,f,a,b,kind)=>{for(let u=a;u<b;u++)gaps.set(lv+':'+ax+':'+f+':'+u,kind);};
  DOORS.forEach(d=>addGap(d.lv,d.ax,d.f,d.a,d.b,'door'));addGap(PASSAGE.lv,PASSAGE.ax,PASSAGE.f,PASSAGE.a,PASSAGE.b,'pass');
  addGap(PASSAGE2.lv,PASSAGE2.ax,PASSAGE2.f,PASSAGE2.a,PASSAGE2.b,'pass');
  VENTS.forEach(v=>addGap(v.lv,v.ax,v.f,v.a,v.b,'vent'));LOWS.forEach(v=>addGap(v.lv,v.ax,v.f,v.a,v.b,'low'));
  WINS.forEach(w=>addGap(0,w.ax,w.f,w.a,w.b,'win'));EXITS.forEach(e=>addGap(0,e.ax,e.f,e.a,e.b,'exit'));
  STAIR_GAPS.forEach(g=>addGap(g.lv,g.ax,g.f,g.a,g.b,g.kind));
  const tallSet=new Set(),tk=e=>e.o+':'+e.f+':'+e.u;
  const edgesBy={};for(const lv of [-1,0,1])edgesBy[lv]=genEdges(lv);
  const upCells=new Map();for(const r of ROOMS)if(r.lv===1)for(let x=r.x0;x<r.x1;x++)for(let z=r.z0;z<r.z1;z++)upCells.set(x+','+z,r);
  const isTall=e=>{ // a wall is full height (0..8) only where the tall room has no upper floor on its side
    const side=(r,cx,cz)=>{if(!r||!r.tall)return false;const u=upCells.get(cx+','+cz);return !(u&&!u.void);};
    const ca=e.o==='x'?[e.u,e.f-1]:[e.f-1,e.u],cb=e.o==='x'?[e.u,e.f]:[e.f,e.u];
    return side(e.a,ca[0],ca[1])||side(e.b,cb[0],cb[1]);};
  for(const e of edgesBy[0])if(isTall(e))tallSet.add(tk(e));
  for(const lv of [-1,0,1]){
    const y0=BASEY[lv],groups=new Map();
    for(const e of edgesBy[lv]){const k=e.o+':'+e.f;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(e);}
    for(const arr of groups.values()){
      arr.sort((p,q)=>p.u-q.u);
      const info=e=>({kind:edgeKind(e),gk:gaps.get(lv+':'+e.o+':'+e.f+':'+e.u)||null,tall:lv===0&&tallSet.has(tk(e))});
      const skip=(e,inf)=>inf.kind==='none'||(lv===1&&inf.kind==='wall'&&tallSet.has(tk(e)));
      let i=0;
      while(i<arr.length){
        const e0=arr[i],in0=info(e0);if(skip(e0,in0)){i++;continue;}
        let j=i;
        while(j+1<arr.length&&arr[j+1].u===arr[j].u+1){const n=arr[j+1],inn=info(n);if(skip(n,inn)||inn.kind!==in0.kind||inn.gk!==in0.gk||inn.tall!==in0.tall)break;j++;}
        const u0=e0.u,u1=arr[j].u+1,top=y0+(in0.tall?8:4),gk=in0.gk;
        const gapAt=u=>gaps.has(lv+':'+e0.o+':'+e0.f+':'+u);
        const s=u0-((gk||gapAt(u0-1))?0:T/2),e=u1+((gk||gapAt(u1))?0:T/2);
        const mat=lv===-1?stoneWall:wallMats[Math.abs(Math.floor(e0.f*.37+u0*.61))%3];
        const wb=(ya,yb,th)=>{if(yb-ya<.01)return;const h=th||T/2;
          if(e0.o==='x')box(s,ya,e0.f-h,e,yb,e0.f+h,mat,true);else box(e0.f-h,ya,s,e0.f+h,yb,e,mat,true);};
        if(in0.kind==='rail'){if(!gk)wb(y0,y0+1.1,.05);}
        else if(!gk)wb(y0,top);
        else if(gk==='win'){wb(y0,y0+.55);wb(y0+2.6,top);}
        else if(gk==='stair'){wb(y0,y0+3.6);wb(y0+6.6,top);}
        else if(gk==='vent'||gk==='low')wb(y0+1.25,top);
        else wb(y0+2.6,top);
        i=j+1;
      }
    }
  }
  // ---------- floors / ceilings ----------
  FLOORS.length=0;RAMPS.length=0;
  FLOORS.push({x0:-8,z0:-8,x1:52,z1:42,y:0,ground:true});
  const gm=new THREE.Mesh(new THREE.PlaneGeometry(240,240),lam(0xffffff,{map:tx.grass}));
  gm.geometry.attributes.uv.array.forEach((v,i,a)=>a[i]=v*120);gm.rotation.x=-Math.PI/2;gm.position.set(22,-0.03,17);grp.add(gm);
  const floorTile={parq:2,carpet:1,carpetd:1,conc:2,tile:2,tile2:1,grass2:2,stone:2};
  for(const r of ROOMS){
    if(r.void)continue;
    if(r.lv!==0)FLOORS.push({x0:r.x0,z0:r.z0,x1:r.x1,z1:r.z1,y:r.y});
    const pieces=r.lv===0?rectMinus(r,HOLES):[r],t=floorTile[r.f];
    const m=lam(0xffffff,{map:tx[r.f],side:THREE.DoubleSide});
    for(const p of pieces){const w=p.x1-p.x0,d=p.z1-p.z0;if(w<.05||d<.05)continue;
      const g=new THREE.PlaneGeometry(w,d),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/t+p.x0/t,uv.getY(i)*d/t+p.z0/t);
      const mm=new THREE.Mesh(g,m);mm.rotation.x=-Math.PI/2;mm.position.set((p.x0+p.x1)/2,r.y+.01,(p.z0+p.z1)/2);grp.add(mm);}
    // ceiling
    let cy=null;
    if(r.lv===1)cy=8;else if(r.lv===0){if(r.tall)cy=8;else if(!ROOMS.some(o=>o.lv===1&&!o.void&&o.x0<=r.cx&&o.x1>=r.cx&&o.z0<=r.cz&&o.z1>=r.cz))cy=4;}
    if(cy!==null){const c=new THREE.Mesh(new THREE.PlaneGeometry(r.x1-r.x0,r.z1-r.z0),ceilM);c.rotation.x=Math.PI/2;c.position.set(r.cx,cy,r.cz);grp.add(c);}
  }
  // atrium ceiling (void room over hall is covered by the hall's own ceiling at y=8; stairwell likewise)
  // fence + trees
  const fenceM=lam(0x2a2a30);
  box(-6,0,-6.15,50,2.6,-5.85,fenceM,true);box(-6,0,39.85,50,2.6,40.15,fenceM,true);box(-6.15,0,-6,-5.85,2.6,40,fenceM,true);box(49.85,0,-6,50.15,2.6,40,fenceM,true);
  for(let i=0;i<46;i++){const a=i/46*Math.PI*2,rx=38+Math.random()*6,rz=31+Math.random()*5;
    const tr=new THREE.Group(),h=3+Math.random()*3;
    const tm=new THREE.Mesh(new THREE.CylinderGeometry(.2,.3,h,6),lam(0x2b1d12));tm.position.y=h/2;tr.add(tm);
    const cm=new THREE.Mesh(new THREE.ConeGeometry(1.6+Math.random(),h*1.4,7),lam(0x0c2616));cm.position.y=h+.8;tr.add(cm);
    tr.position.set(22+Math.cos(a)*rx,0,17+Math.sin(a)*rz);grp.add(tr);}
  // ---------- stairs ----------
  STAIRS.forEach(s=>{
    RAMPS.push({x0:s.x0,x1:s.x1,z0:s.z0,z1:s.z1,ya:s.ya,yb:s.yb});
    const dz=s.z1-s.z0,dy=s.yb-s.ya,len=Math.hypot(dz,dy),w=s.x1-s.x0;
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,.3,len),lam(0xffffff,{map:tx.stairs}));
    const uv=m.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*2,uv.getY(i)*3);
    m.position.set((s.x0+s.x1)/2,(s.ya+s.yb)/2-.15,(s.z0+s.z1)/2);m.rotation.x=-Math.atan2(dy,dz);grp.add(m);
    const sideM=lam(0x33261c),slope=Math.abs(dy)/dz,lead=.9/slope;
    if(s.up){
      box(s.x0-.05,s.ya,s.z0+lead,s.x0+.05,s.yb+.2,s.z1,sideM,true);box(s.x1-.05,s.ya,s.z0+lead,s.x1+.05,s.yb+.2,s.z1,sideM,true);
      if(s.ew)box(s.x0-.05,s.ya,s.z1-.05,s.x1+.05,s.yb-.5,s.z1+.05,sideM,true);
    }else{
      box(s.x0-.05,s.ya,s.z0,s.x0+.05,1.1,s.z1-lead,sideM,true);box(s.x1-.05,s.ya,s.z0,s.x1+.05,1.1,s.z1-lead,sideM,true);
    }
    keep(s.x0-.3,s.z0-.3,s.x1+.3,s.z1+.3,0);if(s.ya<0)keep(s.x0-.3,s.z0-.3,s.x1+.3,s.z1+.3,s.ya);
  });
  // ---------- doors ----------
  DOORS.forEach((d,i)=>{
    const y=BASEY[d.lv],o={i,lv:d.lv,ax:d.ax,f:d.f,a:d.a,b:d.b,y,state:1,ang:0};
    o.cx=d.ax==='x'?(d.a+d.b)/2:d.f;o.cz=d.ax==='x'?d.f:(d.a+d.b)/2;
    const len=d.b-d.a,pv=new THREE.Group();
    const pm=new THREE.Mesh(new THREE.BoxGeometry(len-.06,2.6,.1),lam(0x6a4428));pm.position.set((len-.06)/2,1.3,0);pv.add(pm);
    const hd=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),lam(0xcfa750));hd.position.set(len-.25,1.2,.08);pv.add(hd);
    if(d.ax==='x')pv.position.set(d.a,y,d.f);else{pv.position.set(d.f,y,d.a);pv.rotation.y=-Math.PI/2;}
    o.base=d.ax==='x'?0:-Math.PI/2;o.pv=pv;grp.add(pv);
    o.col=d.ax==='x'?addCol(d.a,y,d.f-.06,d.b,y+2.6,d.f+.06,true):addCol(d.f-.06,y,d.a,d.f+.06,y+2.6,d.b,true);
    o.col.dynf=1;DYN.push({c:o.col,type:'door',o});
    W.doors.push(o);
  });
  // ---------- windows ----------
  WINS.forEach((w,i)=>{
    const o={i,ax:w.ax,f:w.f,a:w.a,b:w.b,n:w.n,state:1,ang:0,y:0};o.cx=w.ax==='x'?(w.a+w.b)/2:w.f;o.cz=w.ax==='x'?w.f:(w.a+w.b)/2;
    const len=w.b-w.a,pv=new THREE.Group();
    const gl=new THREE.Mesh(new THREE.BoxGeometry(len,1.9,.04),new THREE.MeshLambertMaterial({color:0x7aa0c8,transparent:true,opacity:.3,emissive:0x10203a}));gl.position.set(len/2,1.5,0);pv.add(gl);
    const fr=new THREE.Mesh(new THREE.BoxGeometry(len+.1,.06,.08),lam(0x2a1d14));fr.position.set(len/2,.55,0);pv.add(fr);
    if(w.ax==='x')pv.position.set(w.a,0,w.f);else{pv.position.set(w.f,0,w.a);pv.rotation.y=-Math.PI/2;}
    o.base=w.ax==='x'?0:-Math.PI/2;o.pv=pv;grp.add(pv);
    o.col=w.ax==='x'?addCol(w.a,.55,w.f-.05,w.b,2.6,w.f+.05,true):addCol(w.f-.05,.55,w.a,w.f+.05,2.6,w.b,true);
    o.col.dynf=1;DYN.push({c:o.col,type:'win',o});
    W.wins.push(o);
  });
  // ---------- exits ----------
  EXITS.forEach((e,i)=>{
    const o={i,n:e.n,open:false,active:false,used:false,py:0,def:e},len=e.b-e.a;
    const cx=e.ax==='x'?(e.a+e.b)/2:e.f,cz=e.ax==='x'?e.f:(e.a+e.b)/2;
    const dm=new THREE.Mesh(new THREE.BoxGeometry(e.ax==='x'?len-.05:.16,2.6,e.ax==='x'?.16:len-.05),lam(0x5b626c,{emissive:0x150505}));
    dm.position.set(cx,1.3,cz);grp.add(dm);o.mesh=dm;o.cx=cx;o.cz=cz;
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.4),new THREE.MeshBasicMaterial({color:0x662222}));
    sign.position.set(cx-e.dirx*.22,2.9,cz-e.dirz*.22);sign.rotation.y=Math.atan2(-e.dirx,-e.dirz);grp.add(sign);o.sign=sign;
    o.col=e.ax==='x'?addCol(e.a,0,e.f-.08,e.b,2.6,e.f+.08,true):addCol(e.f-.08,0,e.a,e.f+.08,2.6,e.b,true);
    const lv=new THREE.Group(),lb=new THREE.Mesh(new THREE.BoxGeometry(.5,1.1,.3),lam(0x2a2d33));lb.position.y=.55;lv.add(lb);
    const ll=new THREE.Mesh(new THREE.SphereGeometry(.1,10,8),new THREE.MeshBasicMaterial({color:0x552222}));ll.position.set(0,1.2,0);lv.add(ll);o.led=ll;
    lv.position.set(e.lx,0,e.lz);grp.add(lv);o.lever=lv;o.lx=e.lx;o.lz=e.lz;
    addCol(e.lx-.25,0,e.lz-.2,e.lx+.25,1.1,e.lz+.2,true);keep(e.lx-.6,e.lz-.6,e.lx+.6,e.lz+.6,0);
    const bm=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,40,8,1,true),new THREE.MeshBasicMaterial({color:0x58c48a,transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false}));
    bm.position.set(cx+e.dirx*3,20,cz+e.dirz*3);bm.visible=false;grp.add(bm);o.beam=bm;
    o.col.dynf=1;DYN.push({c:o.col,type:'exit',o});
    W.exits.push(o);
  });
  // ---------- interactive furniture ----------
  FURN.forEach((f,i)=>{
    const o={i,n:f.n,s:0,def:f},g=new THREE.Group();
    const body=(w,h,d,c,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),lam(c));m.position.set(x||0,y===undefined?h/2:y,z||0);g.add(m);return m;};
    switch(f.kind){
      case'shelf':case'rack':case'closet':{body(f.w,f.h,f.d,f.col);const bm=new THREE.Mesh(new THREE.PlaneGeometry(f.w-.2,f.h-.3),lam(0xffffff,{map:f.kind==='shelf'?tx.books:tx.wine}));bm.position.set(0,f.h/2,f.d/2+.01);if(f.kind==='closet')bm.material=lam(0x24180f);g.add(bm);break;}
      case'sofa':{body(f.w,.5,f.d,f.col,0,.25);body(f.w,.6,.25,0x4d1c29,0,.75,-f.d/2+.12);body(.25,.35,f.d*.8,0x4d1c29,-f.w/2+.12,.6,0);body(.25,.35,f.d*.8,0x4d1c29,f.w/2-.12,.6,0);break;}
      case'pool':{body(f.w,.12,f.d,0x1f7a44,0,.95);body(f.w+.1,.14,.12,0x3a2414,0,.96,f.d/2);body(f.w+.1,.14,.12,0x3a2414,0,.96,-f.d/2);for(const sx of[-1,1])for(const sz of[-1,1])body(.14,.9,.14,0x3a2414,sx*(f.w/2-.15),.45,sz*(f.d/2-.15));break;}
      case'crate':{body(1.1,1.0,1.1,f.col,-.6,.5,0);body(1.1,1.0,1.1,f.col,.55,.5,.05);body(.9,.6,.9,0x9a7a48,0,1.3,0);break;}
      case'dresser':{body(f.w,f.h,f.d,f.col);body(f.w-.1,.06,f.d+.1,0x2a1a10,0,f.h+.03,0);for(const x of[-.5,.5]){body(.5,.3,.04,0x1a1008,x,f.h*.7,f.d/2+.02);body(.5,.3,.04,0x1a1008,x,f.h*.35,f.d/2+.02);}break;}
      case'buffet':{body(f.w,f.h,f.d,f.col);body(f.w-.1,.06,f.d+.1,0x2a1a10,0,f.h+.03,0);body(.04,.9,.04,0xcfa750,-.3,.7,f.d/2+.03);body(.04,.9,.04,0xcfa750,.3,.7,f.d/2+.03);break;}
      case'bench':{body(f.w,.45,f.d,f.col,0,.3);body(f.w,.55,.15,0x4d1c29,0,.8,-f.d/2+.08);for(const x of[-1.1,1.1])body(.12,.25,.6,0x2a1a10,x,.12);break;}
      case'cart':{body(f.w,.08,f.d,f.col,0,.55);body(f.w,.08,f.d,f.col,0,1.1);for(const sx of[-1,1])for(const sz of[-1,1])body(.06,1.1,.06,0x555a62,sx*(f.w/2-.05),.55,sz*(f.d/2-.05));body(.5,.35,.4,0xc8ccd0,.4,1.3,0);break;}
      case'archrack':{body(f.w,f.h,f.d,f.col);for(let i=0;i<4;i++)body(f.w-.1,.04,f.d+.04,0x2a2a30,0,.35+i*.45,0);const bm=new THREE.Mesh(new THREE.PlaneGeometry(f.w-.2,f.h-.3),lam(0xffffff,{map:tx.books}));bm.position.set(0,f.h/2,f.d/2+.03);g.add(bm);break;}
      case'sarco':{body(f.w,.7,f.d,f.col);body(f.w+.1,.25,f.d+.1,new THREE.Color(f.col).multiplyScalar(1.3).getHex(),0,.85);body(.5,.06,.12,0xcfa750,0,1.0,0);break;}
      case'barrel':{for(const x of[-.6,.6]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,1.2,10),lam(f.col));c.position.set(x,.6,0);g.add(c);}break;}
    }
    grp.add(g);o.g=g;
    o.box=[0,1].map(s=>{const st=f.st[s],rot=Math.abs(Math.sin(st.ry))>.5,hw=(rot?f.d:f.w)/2,hd=(rot?f.w:f.d)/2;return[st.x-hw,st.z-hd,st.x+hw,st.z+hd];});
    o.ry=f.st.map(s=>s.ry);
    const b=o.box[0];o.c=addCol(b[0],0,b[1],b[2],f.h,b[3],true);
    g.position.set(f.st[0].x,0,f.st[0].z);g.rotation.y=o.ry[0];o.pos=[f.st[0].x,f.st[0].z,o.ry[0]];
    o.y=BASEY[f.lv||0];o.c.y0=o.y;o.c.y1=o.y+f.h;g.position.y=o.y;
    o.box.forEach(b=>keep(b[0]-.05,b[1]-.05,b[2]+.05,b[3]+.05,o.y));
    o.c.dynf=1;DYN.push({c:o.c,type:'furn',o});
    W.furn.push(o);
  });
  // ---------- hiding places ----------
  HIDES.forEach((h,i)=>{
    const g=new THREE.Group(),rm=roomAt(h.x,h.z,h.y);
    if(h.k==='barrel'){const c=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,1.6,12),lam(0x5a3a1e));c.position.y=.8;g.add(c);}
    else if(h.k==='crate'){const c=new THREE.Mesh(new THREE.BoxGeometry(1.1,1.3,1.0),lam(0x8a6a3a));c.position.y=.65;g.add(c);const s=new THREE.Mesh(new THREE.BoxGeometry(1.12,.08,1.02),lam(0x5a4424));s.position.y=.9;g.add(s);}
    else if(h.k==='bed'){const c=new THREE.Mesh(new THREE.BoxGeometry(1.0,.7,2.0),lam(0x3a4a6a));c.position.y=.55;g.add(c);for(const sx of[-.45,.45])for(const sz of[-.95,.95]){const l=new THREE.Mesh(new THREE.BoxGeometry(.1,.2,.1),lam(0x2a1a10));l.position.set(sx,.1,sz);g.add(l);}}
    else if(h.k==='curtain'){const c=new THREE.Mesh(new THREE.BoxGeometry(1.3,2.4,.25),lam(0x7a1a2a));c.position.y=1.2;g.add(c);for(let i=-2;i<=2;i++){const f=new THREE.Mesh(new THREE.BoxGeometry(.08,2.4,.3),lam(0x5a0f1c));f.position.set(i*.25,1.2,0);g.add(f);}}
    else if(h.k==='coffin'){const c=new THREE.Mesh(new THREE.BoxGeometry(.9,.9,2.0),lam(0x3a2a1e));c.position.y=.9;g.add(c);const s=new THREE.Mesh(new THREE.BoxGeometry(.5,.06,.12),lam(0xcfa750));s.position.set(0,1.36,0);g.add(s);}
    else{const c=new THREE.Mesh(new THREE.BoxGeometry(.95,2.1,.65),lam(h.k==='locker'?0x4a5560:0x3a2a1e));c.position.y=1.05;g.add(c);
      const ln=new THREE.Mesh(new THREE.PlaneGeometry(.04,1.8),new THREE.MeshBasicMaterial({color:0x140e0a}));ln.position.set(0,1.05,.33);g.add(ln);}
    let dx=(rm?rm.cx:22)-h.x,dz=(rm?rm.cz:17)-h.z;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
    g.position.set(h.x,h.y,h.z);g.rotation.y=Math.atan2(dx,dz);grp.add(g);
    addCol(h.x-.5,h.y,h.z-.5,h.x+.5,h.y+(h.k==='bed'?1.0:2.1),h.z+.5,true);keep(h.x-.9,h.z-.9,h.x+.9,h.z+.9,h.y);
    W.hides.push({i,k:h.k,x:h.x,z:h.z,y:h.y,fx:h.x+dx*1.2,fz:h.z+dz*1.2});
  });
  // ---------- objective consoles ----------
  OBJS.forEach((d,i)=>{
    const o={i,def:d,state:0},g=new THREE.Group();
    const bd=new THREE.Mesh(new THREE.BoxGeometry(.9,1.3,.5),lam(0x23252b));bd.position.y=.65;g.add(bd);
    const sc=new THREE.Mesh(new THREE.PlaneGeometry(.6,.4),new THREE.MeshBasicMaterial({color:0x3a2e10}));sc.position.set(0,.95,.26);g.add(sc);o.scr=sc;
    const lp=new THREE.Mesh(new THREE.SphereGeometry(.09,10,8),new THREE.MeshBasicMaterial({color:0xf0a23a}));lp.position.set(0,1.5,0);g.add(lp);o.lamp=lp;
    const rm=roomAt(d.x,d.z,d.y)||ROOMS[0];g.rotation.y=Math.atan2(rm.cx-d.x,rm.cz-d.z);g.position.set(d.x,d.y,d.z);grp.add(g);
    addCol(d.x-.45,d.y,d.z-.4,d.x+.45,d.y+1.3,d.z+.4,true);keep(d.x-1,d.z-1,d.x+1,d.z+1,d.y);
    W.objs.push(o);
  });
  // ---------- noisemakers ----------
  NOISE.forEach((n,i)=>{
    const g=new THREE.Group(),col={piano:0x15151a,gramo:0x5a3a22,bell:0xb8902a,tv:0x2a2a30}[n.k];
    const b=new THREE.Mesh(new THREE.BoxGeometry(n.w,n.h,n.d),lam(col));b.position.y=n.h/2;g.add(b);
    if(n.k==='piano'){const k=new THREE.Mesh(new THREE.BoxGeometry(n.w-.1,.06,.3),lam(0xeeeeee));k.position.set(0,n.h+.03,-n.d/2+.3);g.add(k);}
    if(n.k==='bell'){const c=new THREE.Mesh(new THREE.ConeGeometry(.25,.4,10),lam(0xd4aa3a));c.position.y=n.h+.2;g.add(c);}
    if(n.k==='tv'){const s=new THREE.Mesh(new THREE.PlaneGeometry(.6,.5),new THREE.MeshBasicMaterial({color:0x6a8aa0}));s.position.set(0,.45,n.d/2+.01);g.add(s);n.scr=s;}
    const rm=roomAt(n.x,n.z,n.y);g.rotation.y=Math.atan2((rm?rm.cx:22)-n.x,(rm?rm.cz:17)-n.z);g.position.set(n.x,n.y,n.z);grp.add(g);
    addCol(n.x-n.w/2,n.y,n.z-n.d/2,n.x+n.w/2,n.y+n.h,n.z+n.d/2,true);keep(n.x-n.w/2-.4,n.z-n.d/2-.4,n.x+n.w/2+.4,n.z+n.d/2+.4,n.y);
    W.noise.push({i,def:n,cd:0});
  });
  // ---------- vents (crawl spaces with a removable grille) ----------
  const slatTex=ctex(16,16,(x,w,h)=>{x.fillStyle='#1c1e23';x.fillRect(0,0,w,h);x.fillStyle='#3a3d45';for(let i=0;i<16;i+=4)x.fillRect(0,i+1,w,2);});
  VENTS.forEach((v,i)=>{
    const y=BASEY[v.lv],cx=v.ax==='x'?(v.a+v.b)/2:v.f,cz=v.ax==='x'?v.f:(v.a+v.b)/2,o={i,lv:v.lv,cx,cz,y,open:false};
    const gm=new THREE.Mesh(new THREE.BoxGeometry(v.ax==='x'?.86:.36,1.1,v.ax==='x'?.36:.86),new THREE.MeshLambertMaterial({map:slatTex}));gm.position.set(cx,y+.6,cz);grp.add(gm);o.mesh=gm;
    o.col=v.ax==='x'?addCol(v.a+.05,y,v.f-.18,v.b-.05,y+1.2,v.f+.18,true):addCol(v.f-.18,y,v.a+.05,v.f+.18,y+1.2,v.b-.05,true);o.col.dynf=1;
    keep(cx-1.0,cz-1.0,cx+1.0,cz+1.0,y);W.vents.push(o);
  });
  LOWS.forEach(v=>{const y=BASEY[v.lv],cx=v.ax==='x'?(v.a+v.b)/2:v.f,cz=v.ax==='x'?v.f:(v.a+v.b)/2;keep(cx-1.0,cz-1.0,cx+1.0,cz+1.0,y);
    const m=new THREE.Mesh(new THREE.BoxGeometry(v.ax==='x'?1.1:.4,.12,v.ax==='x'?.4:1.1),lam(0x181818));m.position.set(cx,y+1.3,cz);grp.add(m);});
  // ---------- fuse boxes (sabotage / repair) ----------
  FUSES.forEach((f,i)=>{
    const g=new THREE.Group(),bd=new THREE.Mesh(new THREE.BoxGeometry(.75,.95,.22),lam(0x3a3f48));bd.position.y=1.5;g.add(bd);
    const lp=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),new THREE.MeshBasicMaterial({color:0x40ff70}));lp.position.set(0,1.88,.13);g.add(lp);
    const sl=new THREE.Mesh(new THREE.BoxGeometry(.5,.35,.02),new THREE.MeshBasicMaterial({color:0x6a4a10}));sl.position.set(0,1.5,.12);g.add(sl);
    const rm=roomAt(f.x,f.z,f.y)||ROOMS[0];g.rotation.y=Math.atan2(rm.cx-f.x,rm.cz-f.z);g.position.set(f.x,f.y,f.z);grp.add(g);
    addCol(f.x-.4,f.y+1,f.z-.4,f.x+.4,f.y+2.1,f.z+.4,true);keep(f.x-1,f.z-1,f.x+1,f.z+1,f.y);
    W.fuses.push({i,lv:f.lv,x:f.x,z:f.z,y:f.y,lamp:lp,scr:sl});
  });
  // ---------- teleporters: monte-charge and trapdoor ----------
  TPORTS.forEach((t,i)=>{
    const o={i,def:t};
    for(const e of [t.a,t.b]){
      const g=new THREE.Group();
      if(t.k==='dumb'){const m=new THREE.Mesh(new THREE.BoxGeometry(1.1,1.2,.12),lam(0x8a8f96));m.position.y=1.1;g.add(m);const r=new THREE.Mesh(new THREE.BoxGeometry(.5,.08,.05),lam(0x33363c));r.position.set(0,1.75,.08);g.add(r);}
      else{const m=new THREE.Mesh(new THREE.BoxGeometry(1.3,.06,1.3),lam(0x5a3a22));m.position.y=.04;g.add(m);const r=new THREE.Mesh(new THREE.TorusGeometry(.14,.03,6,10),lam(0xcfa750));r.rotation.x=Math.PI/2;r.position.y=.09;g.add(r);}
      const rm=roomAt(e.x,e.z,e.y)||ROOMS[0];if(t.k==='dumb')g.rotation.y=Math.atan2(rm.cx-e.x,rm.cz-e.z);
      g.position.set(e.x,e.y,e.z);grp.add(g);keep(e.x-1.2,e.z-1.2,e.x+1.2,e.z+1.2,e.y);
      if(t.k==='dumb')addCol(e.x-.55,e.y+.5,e.z-.3,e.x+.55,e.y+1.7,e.z+.3,true);
    }
    W.tports.push(o);
  });
  // ---------- lamps + light switches ----------
  const lampRooms=new Set();
  LAMPS.forEach(l=>{
    const r=RID[l[0]];lampRooms.add(r.id);
    const o={room:r.idx,x:l[1],y:l[2],z:l[3],col:l[4],int:l[5],dist:l[6],fl:l[7],cone:l[8],on:true,ph:Math.random()*6.28,lvl:r.y,lv:r.lv,cur:1};
    const b=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),new THREE.MeshBasicMaterial({color:o.col}));b.position.set(o.x,o.y,o.z);grp.add(b);o.bulb=b;
    if(o.cone){const c=new THREE.Mesh(new THREE.ConeGeometry(2.3,o.y-r.y-.3,16,1,true),new THREE.MeshBasicMaterial({color:o.col,transparent:true,opacity:.055,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
      c.position.set(o.x,(o.y+r.y+.3)/2,o.z);grp.add(c);o.coneM=c;}
    W.lamps.push(o);
  });
  TLAMPS.forEach((t,i)=>{
    const rm=roomAt(t.x,t.z,t.y<0?-4:t.y>3?4:0)||ROOMS[0];
    const o={room:-2,tl:i,x:t.x,y:t.y+.45,z:t.z,col:t.col,int:t.int,dist:t.dist,fl:.04,cone:0,on:true,ph:Math.random()*6.28,lvl:rm.y,lv:rm.lv,cur:1,nofuse:t.n==='Bougeoir'};
    const base=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,.3,6),lam(0x2a2018));base.position.set(t.x,t.y+.15,t.z);grp.add(base);
    const b=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),new THREE.MeshBasicMaterial({color:o.col}));b.position.set(o.x,o.y,o.z);grp.add(b);o.bulb=b;
    W.lamps.push(o);W.tlamps.push({i,x:t.x,z:t.z,y:rm.y,n:t.n,lamp:o});
  });
  GARDEN_LAMPS.forEach(g=>{
    const o={room:-1,x:g[0],y:g[1],z:g[2],col:0xb8c8ff,int:.9,dist:15,fl:.05,cone:0,on:true,ph:Math.random()*6.28,lvl:0,cur:1};
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,g[1],6),lam(0x1a1a1f));pole.position.set(g[0],g[1]/2,g[2]);grp.add(pole);
    const b=new THREE.Mesh(new THREE.SphereGeometry(.2,8,6),new THREE.MeshBasicMaterial({color:o.col}));b.position.set(o.x,o.y,o.z);grp.add(b);o.bulb=b;W.lamps.push(o);
  });
  for(let i=0;i<9;i++){const p=new THREE.PointLight(0xffffff,0,10,1.6);scene.add(p);W.pool.push({l:p,lamp:-1});}
  ROOMS.forEach(r=>{
    if(!lampRooms.has(r.id))return;
    // switch next to the first door on the room boundary
    let pos=null;
    for(const d of DOORS){if(d.lv!==r.lv)continue;
      const onx=d.ax==='x'&&(d.f===r.z0||d.f===r.z1)&&d.a>=r.x0&&d.b<=r.x1,onz=d.ax==='z'&&(d.f===r.x0||d.f===r.x1)&&d.a>=r.z0&&d.b<=r.z1;
      if(!onx&&!onz)continue;
      const s=(d.b+.6<(onx?r.x1:r.z1)-.4)?d.b+.6:d.a-.6,lo=onx?r.x0:r.z0,hi=onx?r.x1:r.z1;if(s<lo+.4||s>hi-.4)continue;
      pos=onx?{x:s,z:d.f+(r.cz>d.f?.3:-.3),ry:r.cz>d.f?0:Math.PI}:{x:d.f+(r.cx>d.f?.3:-.3),z:s,ry:r.cx>d.f?Math.PI/2:-Math.PI/2};break;}
    if(!pos)pos={x:r.x0+.5,z:r.z0+.3,ry:0};
    const m=new THREE.Mesh(new THREE.BoxGeometry(.14,.22,.06),new THREE.MeshBasicMaterial({color:0xdddddd}));m.position.set(pos.x,r.y+1.35,pos.z);m.rotation.y=pos.ry;grp.add(m);
    W.switches.push({room:r.idx,rid:r.id,x:pos.x,z:pos.z,y:r.y,mesh:m,n:'Interrupteur : '+r.n});
  });
  // ---------- decor: skips anything that would sit on an interactive object or block a doorway / stair / lever ----------
  DOORS.forEach(d=>{const y=BASEY[d.lv],p=1.3;
    if(d.ax==='x')keep(d.a,d.f-p,d.b,d.f+p,y);else keep(d.f-p,d.a,d.f+p,d.b,y);});
  WINS.forEach(w=>{if(w.ax==='x')keep(w.a,w.f-.8,w.b,w.f+.8,0);else keep(w.f-.8,w.a,w.f+.8,w.b,0);});
  EXITS.forEach(e=>{if(e.ax==='x')keep(e.a-.3,e.f-1.6,e.b+.3,e.f+1.6,0);else keep(e.f-1.6,e.a-.3,e.f+1.6,e.b+.3,0);});
  STAIRS.forEach(s=>{keep(s.x0-.3,s.z0-2.4,s.x1+.3,s.z0,s.ya);keep(s.x0-.3,s.z1,s.x1+.3,s.z1+2.4,s.yb);});
  function blocked(x0,z0,x1,z1,y){
    for(const k of KEEP){if(Math.abs(k.y-y)<2.5&&x1+.08>k.x0&&x0-.08<k.x1&&z1+.08>k.z0&&z0-.08<k.z1)return true;}
    return false;
  }
  W.fire=[];
  const DK=buildDecor({grp,lam,tx,blocked,W});
  gBuild();
  return W;
}

/* ---------- lamp pool: a few real lights follow the camera, weighted by distance; the rest are glowing bulbs ---------- */
function updateLamps(cx,cy,cz,t,lightMask,tlMask,fz){
  const W=WORLD,sc=[];fz=fz||0;
  for(let i=0;i<W.lamps.length;i++){
    const l=W.lamps[i],brk=((fz>>(l.lv+1))&1)&&!l.nofuse&&l.room!==-1;
    const on=l.room===-1?true:l.room===-2?(!!((tlMask>>l.tl)&1)&&!brk):(!!((lightMask>>l.room)&1)&&!brk);
    if(on!==l.on){l.on=on;l.bulb.material.color.setHex(on?l.col:0x1c1c20);if(l.coneM)l.coneM.visible=on;}
    if(!on)continue;
    const dy=Math.abs(l.y-cy);if(dy>4.2)continue;
    const d=Math.hypot(l.x-cx,l.z-cz)+dy*1.3,w=clamp(1-(d-7)/l.dist,0,1);if(w<=0)continue;
    sc.push([d,i,w]);
  }
  sc.sort((a,b)=>a[0]-b[0]);const chosen=new Map();for(let k=0;k<Math.min(W.pool.length,sc.length);k++)chosen.set(sc[k][1],sc[k][2]);
  for(const s of W.pool)if(s.lamp>=0&&!chosen.has(s.lamp))s.lamp=-1;
  const used=new Set(W.pool.map(s=>s.lamp));
  for(const [li] of chosen){if(used.has(li))continue;const s=W.pool.find(p=>p.lamp<0);if(!s)break;s.lamp=li;used.add(li);const l=W.lamps[li];s.l.position.set(l.x,l.y,l.z);s.l.color.setHex(l.col);s.l.distance=l.dist;}
  for(const s of W.pool){
    if(s.lamp<0){s.l.intensity=lerp(s.l.intensity,0,.2);continue;}
    const l=W.lamps[s.lamp],w=chosen.get(s.lamp)||0;
    const f=1+l.fl*(Math.sin(t*13+l.ph)*.5+Math.sin(t*29+l.ph*2.1)*.5);
    s.l.intensity=lerp(s.l.intensity,l.int*w*f,.3);
  }
}
