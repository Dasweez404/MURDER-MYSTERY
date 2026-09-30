
/* ============================ world builder ============================ */
const T=0.3;
let WORLD=null;
function ctex(w,h,draw){
  const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t;
}
function noise(x,w,h,n,a){for(let i=0;i<n;i++){const v=Math.random()<.5?0:255;x.fillStyle=`rgba(${v},${v},${v},${a})`;x.fillRect(Math.random()*w,Math.random()*h,2,2);}}
function buildTextures(){
  const T={};
  const wall=(base,stripe)=>ctex(128,256,(x,w,h)=>{
    x.fillStyle=base;x.fillRect(0,0,w,h);x.fillStyle=stripe;for(let i=0;i<w;i+=16)x.fillRect(i,0,6,h*.68);
    x.fillStyle='#1b1410';x.fillRect(0,h*.7,w,h*.3);x.fillStyle='#2a1f18';for(let i=0;i<w;i+=64)x.fillRect(i+6,h*.74,52,h*.19);
    x.fillStyle='#4a382a';x.fillRect(0,h*.69,w,h*.022);x.fillStyle='#0c0909';x.fillRect(0,h*.97,w,h*.03);
    x.fillStyle='rgba(0,0,0,.3)';x.fillRect(0,0,w,h*.025);noise(x,w,h,200,.04);});
  T.wall=[wall('#4a2832','rgba(255,255,255,.06)'),wall('#23382f','rgba(255,255,255,.05)'),wall('#2b2f48','rgba(255,255,255,.055)')];
  T.stonewall=ctex(128,256,(x,w,h)=>{x.fillStyle='#34343a';x.fillRect(0,0,w,h);
    for(let r=0;r<16;r++){const off=(r%2)*16;for(let c=-1;c<5;c++){x.fillStyle=`hsl(240,6%,${17+Math.random()*10}%)`;x.fillRect(c*32+off+1,r*16+1,30,14);}}noise(x,w,h,500,.06);});
  T.parq=ctex(128,128,(x,w,h)=>{for(let r=0;r<8;r++)for(let c=-1;c<2;c++){const o=(r%2)*32;x.fillStyle=`hsl(24,${40+Math.random()*12}%,${17+Math.random()*9}%)`;x.fillRect(c*64+o,r*16,63,15);}noise(x,w,h,300,.05);});
  T.carpet=ctex(64,64,(x,w,h)=>{x.fillStyle='#4a1a26';x.fillRect(0,0,w,h);noise(x,w,h,500,.07);x.strokeStyle='rgba(0,0,0,.25)';x.strokeRect(0,0,w,h);});
  T.carpetd=ctex(64,64,(x,w,h)=>{x.fillStyle='#1f2c3a';x.fillRect(0,0,w,h);noise(x,w,h,500,.07);x.strokeStyle='rgba(0,0,0,.3)';x.strokeRect(0,0,w,h);});
  T.conc=ctex(128,128,(x,w,h)=>{x.fillStyle='#45474c';x.fillRect(0,0,w,h);noise(x,w,h,700,.08);x.strokeStyle='rgba(0,0,0,.4)';x.strokeRect(0,0,w,h);});
  T.stone=ctex(128,128,(x,w,h)=>{x.fillStyle='#2a2a30';x.fillRect(0,0,w,h);for(let i=0;i<8;i++)for(let j=0;j<8;j++){x.fillStyle=`hsl(240,5%,${12+Math.random()*9}%)`;x.fillRect(i*16+1,j*16+1,14,14);}noise(x,w,h,400,.06);});
  T.tile=ctex(128,128,(x,w,h)=>{for(let i=0;i<2;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?'#17161c':'#c9c3b7';x.fillRect(i*64,j*64,64,64);}noise(x,w,h,300,.05);});
  T.tile2=ctex(64,64,(x,w,h)=>{x.fillStyle='#7f9490';x.fillRect(0,0,w,h);x.strokeStyle='rgba(0,0,0,.4)';x.strokeRect(0,0,w,h);noise(x,w,h,160,.05);});
  T.grass2=ctex(64,64,(x,w,h)=>{x.fillStyle='#2b3f2c';x.fillRect(0,0,w,h);x.strokeStyle='rgba(0,0,0,.4)';x.strokeRect(0,0,w,h);noise(x,w,h,200,.06);});
  T.grass=ctex(128,128,(x,w,h)=>{x.fillStyle='#12241a';x.fillRect(0,0,w,h);for(let i=0;i<900;i++){x.fillStyle=`hsl(${110+Math.random()*30},40%,${8+Math.random()*10}%)`;x.fillRect(Math.random()*w,Math.random()*h,2,3);}});
  T.books=ctex(128,64,(x,w,h)=>{x.fillStyle='#1a100a';x.fillRect(0,0,w,h);for(let r=0;r<2;r++){let px=0;while(px<w){const bw=4+Math.random()*7;x.fillStyle=`hsl(${Math.random()*360},${30+Math.random()*30}%,${22+Math.random()*22}%)`;x.fillRect(px,r*32+2+Math.random()*4,bw-1,28);px+=bw;}}});
  T.wine=ctex(128,64,(x,w,h)=>{x.fillStyle='#120c08';x.fillRect(0,0,w,h);for(let r=0;r<4;r++)for(let c=0;c<8;c++){x.fillStyle=(c+r)%3?'#3a1420':'#1c2a1a';x.beginPath();x.arc(8+c*16,8+r*16,6,0,7);x.fill();x.fillStyle='#d8c890';x.fillRect(5+c*16,6+r*16,6,2);}});
  T.stairs=ctex(64,64,(x,w,h)=>{x.fillStyle='#4a3324';x.fillRect(0,0,w,h);for(let i=0;i<8;i++){x.fillStyle=i%2?'#5a3f2c':'#3c281b';x.fillRect(0,i*8,w,7);x.fillStyle='#8a6a48';x.fillRect(0,i*8,w,1);}});
  T.frame=ctex(64,64,(x,w,h)=>{x.fillStyle='#2a1a10';x.fillRect(0,0,w,h);const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#3a4a5a');g.addColorStop(1,'#6a4a3a');x.fillStyle=g;x.fillRect(6,6,w-12,h-12);x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.arc(w/2,h*.42,10,0,7);x.fill();x.fillRect(w/2-14,h*.55,28,16);});
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
  const tx=buildTextures(),W={doors:[],wins:[],furn:[],objs:[],exits:[],hides:[],switches:[],noise:[],lamps:[],pool:[],zones:new Map()};
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
        else wb(y0+2.6,top);
        i=j+1;
      }
    }
  }
  // ---------- floors / ceilings ----------
  FLOORS.length=0;RAMPS.length=0;
  FLOORS.push({x0:-8,z0:-8,x1:52,z1:42,y:0,ground:true});
  const gm=new THREE.Mesh(new THREE.PlaneGeometry(240,240),lam(0xffffff,{map:tx.grass}));
  gm.geometry.attributes.uv.array.forEach((v,i,a)=>a[i]=v*80);gm.rotation.x=-Math.PI/2;gm.position.set(22,-0.03,17);grp.add(gm);
  const floorTile={parq:3,carpet:3,carpetd:3,conc:4,tile:4,tile2:2,grass2:3,stone:2};
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
    keep(s.x0-.3,s.z0-.3,s.x1+.3,s.z1+.3,s.ya<0?0:s.ya);
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
    else{const c=new THREE.Mesh(new THREE.BoxGeometry(.95,2.1,.65),lam(h.k==='locker'?0x4a5560:0x3a2a1e));c.position.y=1.05;g.add(c);
      const ln=new THREE.Mesh(new THREE.PlaneGeometry(.04,1.8),new THREE.MeshBasicMaterial({color:0x140e0a}));ln.position.set(0,1.05,.33);g.add(ln);}
    let dx=(rm?rm.cx:22)-h.x,dz=(rm?rm.cz:17)-h.z;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
    g.position.set(h.x,h.y,h.z);g.rotation.y=Math.atan2(dx,dz);grp.add(g);
    addCol(h.x-.5,h.y,h.z-.5,h.x+.5,h.y+2.1,h.z+.5,true);keep(h.x-.9,h.z-.9,h.x+.9,h.z+.9,h.y);
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
  // ---------- lamps + light switches ----------
  const lampRooms=new Set();
  LAMPS.forEach(l=>{
    const r=RID[l[0]];lampRooms.add(r.id);
    const o={room:r.idx,x:l[1],y:l[2],z:l[3],col:l[4],int:l[5],dist:l[6],fl:l[7],cone:l[8],on:true,ph:Math.random()*6.28,lvl:r.y,cur:1};
    const b=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),new THREE.MeshBasicMaterial({color:o.col}));b.position.set(o.x,o.y,o.z);grp.add(b);o.bulb=b;
    if(o.cone){const c=new THREE.Mesh(new THREE.ConeGeometry(2.3,o.y-r.y-.3,16,1,true),new THREE.MeshBasicMaterial({color:o.col,transparent:true,opacity:.055,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
      c.position.set(o.x,(o.y+r.y+.3)/2,o.z);grp.add(c);o.coneM=c;}
    W.lamps.push(o);
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
  STAIRS.forEach(s=>{const y=s.ya<0?0:s.ya;keep(s.x0-.3,s.z0-2.4,s.x1+.3,s.z0,y);keep(s.x0-.3,s.z1,s.x1+.3,s.z1+2.4,y);});
  function blocked(x0,z0,x1,z1,y){
    for(const k of KEEP){if(Math.abs(k.y-y)<2.5&&x1+.15>k.x0&&x0-.15<k.x1&&z1+.15>k.z0&&z0-.15<k.z1)return true;}
    return false;
  }
  const DK={n:0,skip:0,log:[]};window.__DK=DK;
  function D(x,z,w,d,h,c,y0,o){
    y0=y0||0;o=o||{};const rm=roomAt(x,z,y0+.1),y=rm?rm.y:y0;
    const coll=h>.3&&o.c!==false&&!o.yy;
    if(coll&&blocked(x-w/2,z-d/2,x+w/2,z+d/2,y)){DK.skip++;DK.log.push(['D',x,z,y]);return null;}
    const mat=o.emis?new THREE.MeshBasicMaterial({color:c}):lam(c);
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y+(o.yy||0)+h/2,z);if(o.ry)m.rotation.y=o.ry;grp.add(m);
    if(coll)addCol(x-w/2,y,z-d/2,x+w/2,y+h,z+d/2,true);DK.n++;return m;
  }
  function Cy(x,z,r,h,c,y0,o){
    y0=y0||0;o=o||{};const rm=roomAt(x,z,y0+.1),y=rm?rm.y:y0;
    if(o.c!==false&&h>.3&&blocked(x-r,z-r,x+r,z+r,y)){DK.skip++;DK.log.push(['C',x,z,y]);return null;}
    const m=new THREE.Mesh(new THREE.CylinderGeometry(o.r2===undefined?r:o.r2,r,h,o.seg||10),o.emis?new THREE.MeshBasicMaterial({color:c}):lam(c));
    m.position.set(x,y+(o.yy||0)+h/2,z);grp.add(m);if(o.c!==false&&h>.3)addCol(x-r,y,z-r,x+r,y+h,z+r,true);DK.n++;return m;
  }
  function Shelf(x0,z0,x1,z1,face,map,y0){ // bookshelf/wine rack against a wall; face: 'n','s','e','w' = direction the front looks at
    const w=Math.abs(x1-x0),d=Math.abs(z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2;
    const m=D(cx,cz,w,d,2.5,0x3b2618,y0);if(!m)return;
    const y=m.position.y-1.25,fw=face==='n'||face==='s'?w:d;
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(fw-.1,2.2),lam(0xffffff,{map:tx[map||'books']}));
    const uv=pl.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*fw/1.6,uv.getY(i)*1.4);
    const off=(face==='n'||face==='s'?d:w)/2+.02;
    if(face==='s'){pl.position.set(cx,y+1.35,cz+off);}else if(face==='n'){pl.position.set(cx,y+1.35,cz-off);pl.rotation.y=Math.PI;}
    else if(face==='e'){pl.position.set(cx+off,y+1.35,cz);pl.rotation.y=Math.PI/2;}else{pl.position.set(cx-off,y+1.35,cz);pl.rotation.y=-Math.PI/2;}
    grp.add(pl);
  }
  function Frame(x,y,z,face,w,h){ // painting
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w||.9,h||1.2),lam(0xffffff,{map:tx.frame,emissive:0x1a1208}));m.position.set(x,y,z);
    m.rotation.y={s:0,n:Math.PI,e:Math.PI/2,w:-Math.PI/2}[face];grp.add(m);
  }
  const Em=(x,y,z,w,h,d,c)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color:c}));m.position.set(x,y,z);grp.add(m);return m;};
  W.fire=[];
  // -- Bibliothèque
  Shelf(1,.2,12,1,'s');Shelf(.2,1,1,6,'e');D(7,4.6,2,1,.78,0x4a3020);D(4,4.5,1,1,.9,0x552233);D(10,7.4,1,1,.9,0x26443a);Cy(11.3,4,.35,1.2,0x2a4a6a);D(5,8.3,2.6,.5,.4,0x2a1a10,0,{c:false});
  Frame(6.5,2.3,9.83,'n');
  // -- Bureau
  D(16.6,3.2,2.4,1.1,.8,0x4a3a2a);D(16.6,2.3,.6,.6,.45,0x33261c,0,{c:false});Em(16.9,1.35,3,.25,.3,.25,0xa8ff98);D(18.6,7.2,1.2,.7,1.6,0x33261c);D(14.2,6.6,.8,1.5,1.9,0x33261c);Shelf(13.2,4.2,14,6,'e');
  Cy(19.6,3.4,.4,1.0,0x3a2a1a);Frame(17,2.4,7.83,'n');
  // -- Fumoir
  D(22.5,2,1.3,1.3,.9,0x5a2a2a);D(25.3,2,1.3,1.3,.9,0x5a2a2a);Cy(24,3.3,.5,.7,0x3a2a1a);Shelf(21.3,7,26.8,7.8,'n','wine');
  const fp1=Em(24,.8,.3,1.4,.6,.2,0xff7a30);W.fire.push(fp1);D(24,.45,2.4,.6,1.6,0x33261c);
  // -- Galerie des portraits
  for(let i=0;i<6;i++){Frame(14.5+i*2.4,2.0,8.15,'s',.8,1.0);Frame(14.5+i*2.4,2.0,10.85,'n',.8,1.0);}
  D(14,9.5,.6,.6,1.6,0x8a8578);D(26,9.5,.6,.6,1.6,0x8a8578);
  // -- Garage
  D(36,2.4,4.2,1.9,1.1,0x7a1f25);D(36,2.4,2.4,1.6,.5,0x1a1a1f,0,{yy:1.1});D(40.4,10,4.0,1.9,1.1,0x1f3a6a,0,{ry:0});D(43.4,7.5,.8,3,1.0,0x5a4a3a);
  Cy(29,9.8,.45,.9,0x2a4a7a);Cy(30.2,10.6,.45,.9,0x7a2a2a);D(28.8,4,.6,3,.05,0x181818,0,{c:false});Em(31,3.9,.3,1.6,.12,.1,0xbcd8ff);
  D(42.6,1.8,1.6,1.0,1.0,0x5a4632);Cy(34,9.8,.4,.8,0x3a3a3a);
  // -- Salon
  W.fire.push(Em(3.5,1.0,10.35,1.6,.8,.3,0xff8a30));D(3.5,10.7,2.6,.7,1.7,0x5a4a44);
  D(5,15.5,1.6,.9,.45,0x3a2a1a);D(3.5,17.8,1.0,1.0,.85,0x4a2a30);D(9.5,19,1.0,1.0,.85,0x4a2a30);Shelf(6,21.2,12.6,21.8,'n');D(11.6,16.5,.7,.7,1.1,0x33261c);Frame(1,2.4,19,'e');Frame(6,2.4,10.3,'s');
  // -- Grand hall
  D(23.5,14,.8,.8,3.8,0x8a8578);D(14.6,21,.7,.7,3.8,0x8a8578);D(25.4,21.2,.7,.7,3.8,0x8a8578);D(25.6,12.5,.6,.6,1.9,0x5a3a22,0,{c:true});
  D(20,17,3.6,9,.03,0x7a1222,0,{c:false});Cy(21.6,21.8,.5,1.6,0x9a9588);Cy(18.4,21.8,.5,1.6,0x9a9588);
  Frame(20,3,11.25,'s',1.6,1.2);Frame(20,3,22.75,'n',1.6,1.2);Frame(13.25,3,20,'e',1.2,1.6);Frame(26.75,3,20,'w',1.2,1.6);
  // chandelier
  {const c=new THREE.Group();const r=new THREE.Mesh(new THREE.TorusGeometry(1,.06,6,16),new THREE.MeshBasicMaterial({color:0xffe0a0}));r.rotation.x=Math.PI/2;c.add(r);const ch=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.9,4),lam(0x222222));ch.position.y=.45;c.add(ch);c.position.set(20,6.6,17);grp.add(c);}
  // -- Salle à manger
  D(36.3,15,3.2,1.4,.85,0x4a3020);D(29.5,22.8,2.2,.7,1.0,0x33261c);D(36.3,13.5,.5,.5,.5,0x5a3a22);D(36.3,16.5,.5,.5,.5,0x5a3a22);Em(36.3,1.0,15,.12,.3,.12,0xffe0a0);
  Frame(33,2.5,12.25,'s',1.6,1.0);Shelf(37.3,22.6,38.6,23.8,'w','wine');
  // -- Cellier
  Shelf(39.3,20,40,23.5,'e');D(43.3,22,1,1.4,1.4,0x7a5a3a);D(43,16,1,1,1.0,0x7a5a3a);Cy(39.7,22.6,.4,.9,0x6a4a2a);
  // -- Cuisine
  D(33.5,27.4,2.6,1.0,.95,0x8a8f96);D(38.5,27.4,1.8,1.0,.95,0x8a8f96);D(30.5,33.4,4,.7,.95,0x8a8f96);D(37,33.4,3,.7,.95,0x8a8f96);D(43.3,33.3,1.2,1.2,1.6,0xc8ccd0);D(35.6,24.7,1.6,.6,1.0,0x8a8f96);
  Cy(33.5,27.4,.3,.5,0x6a6a72,.95,{c:false});
  // -- Serre
  for(let i=0;i<5;i++){D(14.8+i*2.3,25.4,1.4,.8,.5,0x3a2a1a);Cy(14.8+i*2.3,25.4,.45,1.3,0x1e5a2a,.5,{c:false,r2:.05,seg:6});}
  for(let i=0;i<4;i++){D(16+i*2.6,32.6,1.4,.8,.5,0x3a2a1a);Cy(16+i*2.6,32.6,.5,1.6,0x2a7a3a,.5,{c:false,r2:.05,seg:6});}
  Cy(25.4,25,.6,1.6,0x2a6a3a);Cy(14.6,31,.5,1.5,0x2a6a3a);Cy(20,30.5,.9,.5,0x22404a,0,{c:false});Cy(20,30.5,.25,.9,0x4a8aa0,.5,{c:false,emis:1});
  // -- Cinéma
  W.fire.push(Em(11,1.9,33.8,3,1.8,.1,0x9ab0ff));
  for(let r=0;r<2;r++)for(let c=0;c<3;c++)D(6.5+c*1.6,25+r*1.7,1.1,.9,.9,0x5a1a2a);D(12.3,23,1.2,1.2,1.8,0x7a2a1a);
  // -- Suite (étage)
  D(17,32,2.4,2.2,.6,0x5a2a3a,4);D(17,30.7,2.4,.3,1.2,0x3a1a24,4);D(25.8,25,1.2,.8,1.8,0x3a2a1e,4);D(24.3,25.3,1.6,.6,.9,0x4a3a2a,4);D(14.2,25.4,.8,1.6,1.9,0x33261c,4);Cy(23.6,31.5,.5,.8,0x2a2a4a,4);
  // -- Salle de musique
  D(31,30,2.2,1.2,.9,0x2a2a30,4);Cy(41,26,.45,.9,0x6a2a2a,4);Cy(41.8,27.2,.4,.6,0x2a6a6a,4);D(29,25.2,1.0,.6,1.6,0x16161a,4);D(42.5,33,1,.6,1.6,0x16161a,4);
  // -- Salle de jeux
  D(30,21.5,1.6,1.6,.8,0x5a3a22,4);D(28.5,21.6,.5,.5,.5,0x3a2414,4);D(31.5,21.6,.5,.5,.5,0x3a2414,4);D(35,22.5,3,.7,1.0,0x33261c,4);Cy(28.2,13.5,.4,1.0,0x7a2a2a,4);
  // -- Palier / chambres
  Cy(40.2,22.8,.35,.9,0x2a5a2a,4);D(6,14,2.2,2.0,.6,0x2a3a5a,4);D(11.5,11,1,1.6,1.9,0x33261c,4);D(2,19.6,1.6,.7,.9,0x4a3a2a,4);
  D(3,28.5,2,1.6,.6,0x5a5a3a,4);D(9,28.5,2,1.6,.6,0x5a3a3a,4);D(6,32.5,1.6,.6,.9,0x4a3a2a,4);D(12,26,.8,1.6,1.9,0x33261c,4);
  // -- Sous-sol : cave, chaufferie, tunnel, labo, crypte, archives, garde-manger
  Shelf(27.3,13.2,35,14,'s','wine',-4);Shelf(27.3,22,35,22.8,'n','wine',-4);Shelf(38,16,38.7,22,'w','wine',-4);
  for(let i=0;i<4;i++)Cy(30+i*1.6,17+((i%2)*1.5),.55,1.2,0x5a3a1e,-4);D(33,18,2.2,1.0,.85,0x33261c,-4);
  Cy(41.5,21,1.3,3.2,0x6a6a72,-4);Cy(41.5,21,.9,.3,0xff6a20,-4,{c:false,emis:1,yy:2.5});D(43,14,1,1.6,.8,0x1a1a1a,-4);D(40,22,1.2,1,.8,0x1a1a1a,-4);Em(40.4,-3.4,14,.2,.3,.05,0xff5a10);
  D(15.5,15.9,.9,.8,1.0,0x5a4a3a,-4);D(25.4,14.5,.8,.8,.9,0x5a4a3a,-4);Em(20,-2.4,14.15,.3,.15,.05,0xff2020);
  D(3,12,1.6,.9,.9,0x9aa0a8,-4);D(6,19.5,1.6,.9,.9,0x9aa0a8,-4);D(10,12.5,1.0,1.0,.9,0x9aa0a8,-4);Cy(9.6,20,.4,1.4,0x40ff90,-4,{emis:1,seg:12});Cy(4,19.4,.35,1.3,0x40ff90,-4,{emis:1,seg:12});Em(3,-2.6,12,.7,.4,.05,0x70ffb0);
  for(const x of[15.5,24.5])for(const z of[19,23])Cy(x,z,.45,3.6,0x55555a,-4);D(18,24.6,2.2,1,.8,0x4a4a52,-4);D(22,24.6,2.2,1,.8,0x4a4a52,-4);
  Em(17.6,-3.0,24.5,.12,.2,.12,0xffb040);Em(21.6,-3.0,24.5,.12,.2,.12,0xffb040);
  Shelf(.3,24,1,31,'e','books',-4);Shelf(5,33,11,33.8,'n','books',-4);D(8,25,2,1,.9,0x4a3a2a,-4);D(12,30,.8,1.4,1.4,0x7a7a82,-4);
  D(34,27,3,1,.95,0xc8d0d8,-4);D(40,27,1.6,1.8,1.9,0xc8d0d8,-4);D(32,33,1,1,1.0,0xc8d0d8,-4);D(43,31,1,1.6,1.9,0xc8d0d8,-4);
  // -- extérieur : bancs et buissons dans le jardin
  [[-3,8],[-3,26],[47,14],[47,20],[10,-3],[31,-3],[8,37],[32,37]].forEach(p=>{Cy(p[0],p[1],.9,.9,0x143a1a,0,{c:false,seg:7});});
  console.log('decor',DK.n,'skipped',DK.skip);
  gBuild();
  return W;
}

/* ---------- lamp pool: a few real lights follow the camera, weighted by distance; the rest are glowing bulbs ---------- */
function updateLamps(cx,cy,cz,t,lightMask){
  const W=WORLD,sc=[];
  for(let i=0;i<W.lamps.length;i++){
    const l=W.lamps[i];
    const on=l.room<0||!!(lightMask&(1<<l.room));
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
