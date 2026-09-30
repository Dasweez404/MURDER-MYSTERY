
/* ============================ decor: furnished rooms, room by room ============================ */
/* Every piece is placed through slot(): it must sit inside its room, stay off doorways / stairs / interactive objects
   (KEEP zones) and never overlap another piece. Anything that does not fit is skipped, so rooms stay walkable. */
function buildDecor(C){
  const {grp,lam,tx,blocked,W}=C;
  const DK={n:0,skip:0,log:[]};window.__DK=DK;
  const OC=[],MC={};
  let Y=0;
  const DIR={n:[0,-1],s:[0,1],e:[1,0],w:[-1,0]};
  const shade=(c,f)=>{const r=(c>>16&255)*f,g=(c>>8&255)*f,b=(c&255)*f;return (Math.min(255,r)<<16)|(Math.min(255,g)<<8)|Math.min(255,b);};
  const mat=(c,e)=>{const k=c+(e?'e':'');return MC[k]||(MC[k]=e?new THREE.MeshBasicMaterial({color:c}):lam(c,{map:tx.noise}));};
  const bx=(w,h,d,c,x,y,z,e)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,e));m.position.set(x,y,z);grp.add(m);return m;};
  const cyl=(r,h,c,x,y,z,e,seg,r2)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r2===undefined?r:r2,r,h,seg||10),mat(c,e));m.position.set(x,y,z);grp.add(m);return m;};
  const sph=(r,c,x,y,z,e)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),mat(c,e));m.position.set(x,y,z);grp.add(m);return m;};
  function slot(cx,cz,w,d,h,coll,yy){
    const rm=roomAt(cx,cz,Y+.1);if(!rm){DK.skip++;DK.log.push(['noroom',cx,cz,Y]);return null;}
    const y=rm.y,x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
    if(x0<rm.x0+.16||x1>rm.x1-.16||z0<rm.z0+.16||z1>rm.z1-.16){DK.skip++;DK.log.push(['wall',cx,cz,y]);return null;}
    if(coll){
      if(blocked(x0,z0,x1,z1,y)){DK.skip++;DK.log.push(['keep',cx,cz,y]);return null;}
      const ya=y+(yy||0),yb=ya+h;
      for(const o of OC)if(x1>o.x0+.02&&x0<o.x1-.02&&z1>o.z0+.02&&z0<o.z1-.02&&yb>o.y0+.02&&ya<o.y1-.02){DK.skip++;DK.log.push(['overlap',cx,cz,y]);return null;}
      OC.push({x0,x1,z0,z1,y0:ya,y1:yb});addCol(x0,ya,z0,x1,yb,z1,true);
    }
    DK.n++;return y;
  }
  // --- furniture builders (each registers one collider) ---
  function tableD(x,z,w,d,h,col){const y=slot(x,z,w,d,h,true);if(y===null)return false;
    bx(w,.09,d,col,x,y+h-.045,z);for(const sx of[-1,1])for(const sz of[-1,1])bx(.09,h-.09,.09,shade(col,.6),x+sx*(w/2-.1),y+(h-.09)/2,z+sz*(d/2-.1));return true;}
  function chairD(x,z,face,col){const y=slot(x,z,.5,.5,.95,true);if(y===null)return false;const o=DIR[face];
    bx(.44,.06,.44,col,x,y+.45,z);bx(o[0]?.06:.44,.5,o[1]?.06:.44,col,x-o[0]*.2,y+.72,z-o[1]*.2);
    for(const sx of[-1,1])for(const sz of[-1,1])bx(.05,.45,.05,shade(col,.5),x+sx*.18,y+.22,z+sz*.18);return true;}
  function bedD(x,z,head,col,blanket){const ns=head==='n'||head==='s',w=ns?1.7:2.2,d=ns?2.2:1.7,y=slot(x,z,w,d,.75,true);if(y===null)return false;
    const hd=DIR[head],L=ns?d:w;
    bx(w,.3,d,0x3a2414,x,y+.25,z);bx(w-.08,.2,d-.08,0xe8e0d0,x,y+.46,z);
    bx(ns?w-.06:L*.62,.12,ns?L*.62:d-.06,blanket||col,x-hd[0]*L*.17,y+.6,z-hd[1]*L*.17);
    for(const s of[-1,1])bx(ns?.6:.4,.14,ns?.4:.6,0xf4f0e6,x+hd[0]*(L/2-.35)+(ns?s*.4:0),y+.63,z+hd[1]*(L/2-.35)+(ns?0:s*.4));
    bx(ns?w:.1,.95,ns?.1:d,shade(col,.7),x+hd[0]*(L/2-.05),y+.7,z+hd[1]*(L/2-.05));return true;}
  function sofaD(x,z,face,len,col){const ns=face==='n'||face==='s',w=ns?len:.95,d=ns?.95:len,y=slot(x,z,w,d,1.05,true);if(y===null)return false;const o=DIR[face];
    bx(w,.45,d,col,x,y+.25,z);bx(ns?w:.22,.55,ns?.22:d,shade(col,.8),x-o[0]*.36,y+.75,z-o[1]*.36);
    for(const s of[-1,1])bx(ns?.2:.85,.4,ns?.85:.2,shade(col,.75),x+(ns?s*(len/2-.1):0),y+.55,z+(ns?0:s*(len/2-.1)));return true;}
  function cabD(x,z,w,d,h,col,topc){const y=slot(x,z,w,d,h,true);if(y===null)return false;
    bx(w,h-.06,d,col,x,y+(h-.06)/2,z);bx(w+.05,.06,d+.05,topc||shade(col,.55),x,y+h-.03,z);return true;}
  function plantD(x,z,kind){const y=slot(x,z,.7,.7,1.3,true);if(y===null)return false;
    cyl(.3,.45,0x6a3a22,x,y+.22,z);if(kind==='tree'){cyl(.12,.9,0x4a3020,x,y+.9,z);bx(.9,.7,.9,0x1e5a2a,x,y+1.5,z);bx(.6,.5,.6,0x2a7a3a,x,y+1.95,z);}
    else if(kind==='fern'){for(let i=0;i<5;i++){const a=i*1.26;bx(.08,.7,.08,0x2a7a3a,x+Math.cos(a)*.18,y+.75,z+Math.sin(a)*.18);}bx(.5,.3,.5,0x1e5a2a,x,y+.75,z);}
    else{bx(.6,.6,.6,0x1e5a2a,x,y+.75,z);bx(.4,.4,.4,0x2f8a3a,x,y+1.15,z);}return true;}
  function barrelD(x,z,col){const y=slot(x,z,.86,.86,1.0,true);if(y===null)return false;cyl(.42,1.0,col||0x5a3a1e,x,y+.5,z);for(const h of[.2,.8])cyl(.44,.05,0x2a2a2e,x,y+h,z);return true;}
  function crateD(x,z,n,col){n=n||1;const y=slot(x,z,.95,.95,.9*n,true);if(y===null)return false;for(let i=0;i<n;i++)bx(.9,.88,.9,col||0x8a6a3a,x,y+.45+i*.9,z),bx(.92,.08,.92,shade(col||0x8a6a3a,.7),x,y+.25+i*.9,z);return true;}
  function pillarD(x,z,h){const y=slot(x,z,.75,.75,h,true);if(y===null)return false;bx(.75,.3,.75,0x7a7568,x,y+.15,z);cyl(.3,h-.6,0x9a9588,x,y+h/2,z);bx(.75,.3,.75,0x7a7568,x,y+h-.15,z);return true;}
  function statueD(x,z,col){const y=slot(x,z,.8,.8,2.3,true);if(y===null)return false;col=col||0x9a9a9e;bx(.7,.8,.7,0x6a6a70,x,y+.4,z);cyl(.22,.9,col,x,y+1.25,z);sph(.17,col,x,y+1.9,z);bx(.6,.14,.14,col,x,y+1.5,z);return true;}
  function armorD(x,z){const y=slot(x,z,.6,.6,2.0,true);if(y===null)return false;bx(.5,.25,.5,0x3a3a40,x,y+.12,z);bx(.3,.8,.2,0x8a8f98,x,y+.75,z);bx(.5,.6,.3,0x9aa0a8,x,y+1.4,z);bx(.26,.3,.26,0x9aa0a8,x,y+1.85,z);return true;}
  function rugD(x,z,w,d,col){const rm=roomAt(x,z,Y+.1);if(!rm)return;const y=rm.y;bx(w,.025,d,shade(col,.55),x,y+.02,z);bx(w-.35,.03,d-.35,col,x,y+.03,z);bx(w-.9,.035,d-.9,shade(col,1.25),x,y+.035,z);}
  function fireD(x,z,face,w,col){const ns=face==='n'||face==='s',y=slot(x,z,ns?w:.65,ns?.65:w,1.9,true);if(y===null)return false;const o=DIR[face];
    bx(ns?w:.65,1.9,ns?.65:w,col||0x5a4a44,x,y+.95,z);bx(ns?w-.9:.2,1.0,ns?.2:w-.9,0x120c0a,x+o[0]*.3,y+.55,z+o[1]*.3);
    const f=bx(ns?w-1.1:.12,.6,ns?.12:w-1.1,0xff8a30,x+o[0]*.36,y+.45,z+o[1]*.36,true);W.fire.push(f);
    bx(ns?w+.3:.75,.12,ns?.75:w+.3,shade(col||0x5a4a44,.6),x,y+1.92,z);return true;}
  function carD(x,z,along,col){const ax=along==='x',L=4.4,Wd=1.9,y=slot(x,z,ax?L:Wd,ax?Wd:L,1.4,true);if(y===null)return false;
    bx(ax?L:Wd,.65,ax?Wd:L,col,x,y+.6,z);bx(ax?2.3:Wd-.2,.55,ax?Wd-.2:2.3,shade(col,.7),x,y+1.15,z);bx(ax?2.0:Wd-.3,.4,ax?Wd-.3:2.0,0x16202a,x,y+1.17,z);
    for(const sx of[-1,1])for(const sz of[-1,1])cyl(.34,.25,0x111111,x+(ax?sx*1.4:sz*(Wd/2)),y+.34,z+(ax?sz*(Wd/2):sx*1.4)).rotation[ax?'x':'z']=Math.PI/2;
    bx(ax?.08:.4,.15,ax?.4:.08,0xffe8a0,x+(ax?L/2:0),y+.65,z+(ax?0:L/2),true);bx(ax?.08:.4,.15,ax?.4:.08,0xff3030,x-(ax?L/2:0),y+.65,z-(ax?0:L/2),true);return true;}
  function shelfD(x,z,w,d,h,col,items){const y=slot(x,z,w,d,h,true);if(y===null)return false;bx(w,h,d,col||0x5a5e66,x,y+h/2,z);
    for(let i=1;i<4;i++){bx(w+.02,.05,d+.02,0x2a2c30,x,y+i*h/4,z);}
    for(let i=0;i<(items||6);i++)bx(.25,.25,.25,pick([0x8a2a2a,0x2a6a8a,0xc8a040,0x5a8a3a]),x+rnd(-w/2+.2,w/2-.2),y+h/4*(1+i%3)+.15,z+rnd(-d/2+.15,d/2-.15));return true;}
  function screenD(x,y,z,face,w,h,col){const o=DIR[face];bx(o[0]?.06:w+.1,h+.1,o[1]?.06:w+.1,0x111114,x,y,z);const s=bx(o[0]?.03:w,h,o[1]?.03:w,col||0x6a9ac0,x+o[0]*.04,y,z+o[1]*.04,true);W.fire.push(s);return s;}
  function Shelf(x0,z0,x1,z1,face,map){
    const w=Math.abs(x1-x0),d=Math.abs(z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2,y=slot(cx,cz,w,d,2.5,true);if(y===null)return false;
    bx(w,2.5,d,0x3b2618,cx,y+1.25,cz);
    const faces=face==='ns'?['n','s']:face==='ew'?['e','w']:[face];
    for(const f of faces){const fw=f==='n'||f==='s'?w:d,pl=new THREE.Mesh(new THREE.PlaneGeometry(fw-.1,2.2),lam(0xffffff,{map:tx[map||'books']}));
      const uv=pl.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*fw/2,uv.getY(i)*2);
      const off=(f==='n'||f==='s'?d:w)/2+.02;
      if(f==='s')pl.position.set(cx,y+1.35,cz+off);else if(f==='n'){pl.position.set(cx,y+1.35,cz-off);pl.rotation.y=Math.PI;}
      else if(f==='e'){pl.position.set(cx+off,y+1.35,cz);pl.rotation.y=Math.PI/2;}else{pl.position.set(cx-off,y+1.35,cz);pl.rotation.y=-Math.PI/2;}
      grp.add(pl);}
    return true;
  }
  function Frame(x,y,z,face,w,h){const m=new THREE.Mesh(new THREE.PlaneGeometry(w||.9,h||1.2),lam(0xffffff,{map:tx.frame,emissive:0x1a1208}));m.position.set(x,y,z);m.rotation.y={s:0,n:Math.PI,e:Math.PI/2,w:-Math.PI/2}[face];grp.add(m);}
  const small=(w,h,d,c,x,y,z,e)=>bx(w,h,d,c,x,y,z,e); // tabletop items, no collider
  const pipe=(x0,z0,x1,z1,y,r,c)=>{const l=Math.hypot(x1-x0,z1-z0),m=cyl(r||.08,l,c||0x7a6a5a,(x0+x1)/2,y,(z0+z1)/2,false,6);if(Math.abs(x1-x0)>=Math.abs(z1-z0))m.rotation.z=Math.PI/2;else m.rotation.x=Math.PI/2;return m;};
  const egg=(x,y,z,c)=>sph(.14,c,x,y,z,true);

  /* ===================== RDC ===================== */
  Y=0;
  // -- Bibliothèque : rayonnages, table de lecture, coin fauteuils
  rugD(7,5.2,5.6,3.8,0x5a2230);
  Shelf(1.2,.2,5.6,1.0,'s');Shelf(8.6,.2,11.0,1.0,'s');Shelf(.2,4,1.0,6.2,'e');
  tableD(7,4.6,2.4,1.1,.78,0x4a3020);chairD(6.2,3.7,'s',0x552233);chairD(7.8,5.5,'n',0x552233);small(.5,.03,.35,0xc8b080,6.3,.8,4.6);small(.3,.2,.25,0x7a2a2a,6.6,.88,4.7);
  sofaD(3.4,8.5,'n',1.1,0x26443a);sofaD(9.2,8.6,'n',1.1,0x26443a);tableD(4.7,8.6,.6,.6,.6,0x3a2a1a);
  cyl(.06,1.0,0x3a2a1a,10.6,.5,6.5);sph(.3,0x2a4a6a,10.6,1.25,6.5);
  bx(.55,2.4,.08,0x6a4a2a,9.9,1.35,1.12);for(let i=0;i<6;i++)bx(.5,.04,.12,0x6a4a2a,9.9,.4+i*.4,1.12);
  Frame(3.2,2.3,9.83,'n');Frame(10.0,2.3,9.83,'n',.8,1.0);
  // -- Bureau de Mr Bills
  rugD(17,4.4,4.6,3.4,0x24402c);
  tableD(16.6,3.4,2.4,1.1,.8,0x4a3a2a);chairD(16.6,2.3,'s',0x1f1f24);chairD(15.9,4.6,'n',0x5a2a2a);chairD(17.3,4.6,'n',0x5a2a2a);
  small(.45,.3,.35,0x22222a,15.6,.95,3.4);small(.5,.03,.3,0xd8d0b0,16.2,.82,3.3);small(.12,.25,.12,0x8a2a2a,16.0,.93,3.7);
  Shelf(13.2,3.3,14.0,4.9,'e');Shelf(13.4,7.15,15.6,7.8,'n');statueD(19.8,2.3);
  cyl(.06,1.0,0x3a2a1a,19.7,.5,4.9);sph(.3,0x8a6a3a,19.7,1.25,4.9);
  Frame(14.4,2.4,7.83,'n');Frame(20.83,2.5,2.0,'w');
  // -- Fumoir
  rugD(24.6,3.6,3.4,3.4,0x1f2c3a);fireD(24.6,.5,'s',2.4,0x4a3030);
  tableD(24.6,3.4,1.0,.8,.45,0x3a2a1a);sofaD(23.3,3.4,'e',1.0,0x5a2a2a);sofaD(25.9,3.4,'w',1.0,0x5a2a2a);sofaD(24.6,5.1,'n',2.0,0x3a2a2a);
  cabD(26.45,2.0,.6,2.4,1.1,0x4a2c18);Shelf(26.15,4.6,26.8,7.6,'w','wine');small(.3,.1,.2,0x6a4a2a,24.6,.5,3.4);Frame(21.17,2.3,1.5,'e',.7,.9);
  // -- Galerie des portraits
  rugD(20,9.5,11,1.6,0x5a1a28);
  for(let i=0;i<6;i++){Frame(14.6+i*2.3,2.0,8.17,'s',.8,1.0);Frame(14.6+i*2.3,2.0,10.83,'n',.8,1.0);}
  cabD(15.1,8.55,.9,.45,.8,0x4a2c18);cabD(25.2,10.45,.9,.45,.8,0x4a2c18);armorD(17.2,10.45);armorD(22.8,10.45);plantD(26.1,10.4,'fern');small(.15,.3,.15,0x4a7ac0,15.1,.95,8.55);small(.15,.3,.15,0xc04a4a,25.2,.95,10.45);
  // -- Garage
  rugD(36,6.4,10,.18,0xc8b020);carD(35.8,3.5,'x',0x7a1f25);carD(40.2,8.1,'z',0x1f3a6a);
  cabD(40.0,.75,3.4,.8,1.0,0x5a4632);small(.5,.15,.3,0xc04a2a,39.0,1.08,.75);small(.3,.1,.5,0x9aa0a8,40.6,1.05,.7);bx(3.2,1.2,.05,0x2a2a2e,40.0,2.0,.2);for(let i=0;i<6;i++)bx(.08,.5,.03,0xb0b4bc,38.8+i*.5,2.0,.25);
  for(let i=0;i<3;i++)cyl(.42,.28,0x1a1a1a,30.8,.16+i*.28,4.6);shelfD(27.6,3.0,.7,3.6,2.0,0x5a5e66,9);
  barrelD(28.7,6.4,0x2a4a7a);barrelD(29.6,6.9,0x7a2a2a);barrelD(30.6,6.2,0x2a4a7a);
  bx(1.4,.06,.8,0x44464c,31.6,.03,7.2);
  // -- Salon
  rugD(6.6,15.4,5.6,4.4,0x4a2230);fireD(3.5,10.5,'s',2.6,0x5a4a44);
  sofaD(4.0,14.4,'n',2.4,0x6b2a3a);tableD(4.0,12.3,1.4,.8,.45,0x3a2a1a);sofaD(6.9,12.5,'w',1.0,0x4a2a30);
  Shelf(7.6,21.15,12.4,21.8,'n');cabD(12.3,17.6,.7,2.2,1.1,0x33261c);small(.12,.3,.12,0x2a6a3a,12.3,1.25,17.0);small(.12,.3,.12,0x8a2a2a,12.3,1.25,17.9);
  tableD(9.4,15.6,.8,.8,.7,0x3a2a1a);chairD(8.6,15.6,'e',0x4a2a30);chairD(10.2,15.6,'w',0x4a2a30);small(.3,.04,.3,0xe8e0c8,9.4,.72,15.6);
  Frame(.17,2.3,11.2,'e');Frame(.17,2.3,21.0,'e',.7,.9);Frame(6.5,2.4,10.3,'s',.9,.9);plantD(12.0,11.0,'palm');
  // -- Grand hall
  rugD(20,17,3.4,10.6,0x7a1222);
  pillarD(18.4,14.2,3.8);pillarD(23.6,14.2,3.8);pillarD(18.4,20.2,3.8);pillarD(23.6,20.2,3.8);
  statueD(13.95,21.9);statueD(25.4,19.6);
  cabD(26.5,19.5,.6,.5,2.2,0x5a3a22);bx(.5,.5,.02,0xe8e0c0,26.2,2.0,19.5,true);
  sofaD(22.1,22.3,'n',1.6,0x3a2a1a);tableD(20,17,1.2,1.2,.9,0x2a1a10);small(.15,.4,.15,0x4a7ac0,20,1.1,17);
  plantD(23.6,12.6,'palm');
  Frame(15.5,3.0,11.17,'s',1.4,1.0);Frame(24.5,3.0,11.17,'s',1.4,1.0);Frame(13.17,3.0,19.0,'e',1.1,1.5);Frame(26.83,3.0,21.0,'w',1.1,1.5);Frame(13.17,3.0,15.5,'e',.9,1.2);
  // -- Salle à manger
  rugD(33.3,18,7.6,3.6,0x3a1a1a);tableD(33.3,18,5.4,1.6,.8,0x4a3020);
  for(const x of[31.2,32.6,34,35.4]){chairD(x,16.55,'s',0x5a2a2a);chairD(x,19.45,'n',0x5a2a2a);}
  chairD(30.0,18,'e',0x5a2a2a);chairD(36.6,18,'w',0x5a2a2a);
  cyl(.08,.5,0xc8a040,33.3,1.05,18);egg(33.3,1.4,18,0xffd080);for(const x of[31.4,35.2])for(const z of[17.6,18.4]){small(.3,.03,.3,0xf0f0e8,x,.82,z);cyl(.04,.12,0x888,x+.05,.88,z);}
  cabD(29.4,12.65,1.8,.6,1.0,0x33261c);cabD(38.0,23.3,1.4,.6,1.0,0x33261c);plantD(27.9,13.0,'palm');plantD(38.0,22.4,'fern');
  Frame(33,2.5,12.17,'s',1.6,1.0);Frame(31,2.5,23.83,'n',1.2,.9);Frame(27.17,2.4,14.0,'w',.9,1.1);
  // -- Cellier
  Shelf(39.15,19.8,39.8,23.6,'e','wine');Shelf(43.15,16.6,43.8,20.6,'w','wine');
  for(const p of[[42.9,22.4],[42.3,23.1],[43.4,23.0]])bx(.6,.7,.45,0xc8b088,p[0],.4,p[1]);
  // -- Cuisine
  cabD(37.3,33.3,1.4,.7,.95,0x8a8f96);cabD(38.7,33.3,1.4,.7,.95,0x44484e);
  for(const p of[[38.4,33.1],[39.0,33.1],[38.4,33.5],[39.0,33.5]])cyl(.12,.03,0xff6a20,p[0],.97,p[1],true);bx(1.6,.5,.6,0x9aa0a8,38.7,2.3,33.5);
  cabD(40.2,33.3,1.6,.7,.95,0x8a8f96);bx(.7,.05,.45,0x2a4a6a,40.2,.97,33.3);cyl(.03,.3,0xc8ccd0,40.2,1.1,33.6);
  cabD(41.4,33.3,.8,.7,.95,0x8a8f96);cabD(34.0,28.3,2.8,1.1,.95,0x6a6f76);small(.4,.3,.4,0xb87a2a,33.4,1.1,28.3);small(.3,.2,.3,0xc8ccd0,34.8,1.05,28.2);
  for(const x of[33.0,34.0,35.0])chairD(x,29.3,'n',0x6a4a2a);cabD(43.2,27.4,.9,.9,1.9,0xdadde0);cabD(38.9,24.55,1.2,.5,.9,0x8a8f96);
  bx(3.2,.05,.05,0x2a2a2e,35,3.2,33.2);for(let i=0;i<5;i++){cyl(.12,.14,0xb0b4bc,33.8+i*.6,2.95,33.2);}
  // -- Serre
  rugD(20,28.5,7,5,0x22402a);
  cyl(1.5,.5,0x6a6a70,20,.25,28.5);cyl(1.3,.06,0x3a8ac0,20,.5,28.5,true);cyl(.15,1.2,0x8a8a90,20,.85,28.5);
  for(const p of[[17.0,26.8,2.8],[23.6,25.4,2.8]]){const y=slot(p[0],p[1],p[2],.9,.6,true);if(y===null)continue;bx(p[2],.55,.9,0x3a2a1a,p[0],y+.28,p[1]);bx(p[2]-.1,.1,.8,0x2a1a10,p[0],y+.58,p[1]);
    for(let i=0;i<Math.floor(p[2]/.7);i++)bx(.5,.5+Math.random()*.4,.5,pick([0x1e5a2a,0x2f8a3a,0x2a7a4a]),p[0]-p[2]/2+.4+i*.7,y+.9,p[1]);}
  plantD(25.6,24.6,'tree');plantD(14.5,25.0,'tree');plantD(14.6,31.8,'palm');plantD(25.6,31.7,'fern');
  sofaD(16.2,29.0,'e',1.8,0x5a4a2a);sofaD(24.0,29.0,'w',1.8,0x5a4a2a);
  for(let i=0;i<4;i++)cyl(.14,.3,0x6a3a22,15.6+i*3,3.3,30.5);
  // -- Cinéma
  rugD(8.7,27.6,1.6,6.2,0x5a1a28);
  for(const z of[25.8,27.5,29.2])for(const x of[6.0,7.1,8.2,9.3,10.4])chairD(x,z,'s',0x5a1a2a);
  screenD(11.0,2.0,33.78,'n',3.2,1.9,0x9ab0ff);bx(.5,.3,.6,0x22222a,8.6,3.4,24.4);bx(.14,.14,.05,0xfff0c0,8.6,3.4,24.65,true);
  cabD(12.3,31.6,.8,.8,1.6,0x9a2a1a);bx(.6,.5,.6,0xd8e8f0,12.3,1.4,31.6,true);
  Frame(9.5,2.3,22.17,'s',.8,1.1);Frame(.17,2.3,23.4,'e',.8,1.1);Frame(12.83,2.3,25.6,'w',.8,1.1);Frame(12.83,2.3,32.2,'w',.8,1.1);

  /* ===================== ÉTAGE ===================== */
  Y=4;
  // -- Suite de Mr Bills
  rugD(20,28.4,5.4,4.4,0x3a1a30);
  bedD(23,32.7,'s',0x7a2a3a,0xc8a040);tableD(21.4,32.6,.5,.5,.65,0x4a3020);tableD(24.4,32.6,.5,.5,.65,0x4a3020);
  cabD(14.45,31.9,.6,1.8,.9,0x4a3a2a);Frame(13.17,6.2,31.9,'e',.7,1.0);
  fireD(26.5,26.0,'w',2.2,0x5a4a44);sofaD(24.3,25.2,'e',1.0,0x4a2a30);sofaD(24.3,26.9,'e',1.0,0x4a2a30);tableD(22.9,26.0,.7,.7,.5,0x3a2a1a);
  tableD(17.6,33.0,2.0,.7,.75,0x4a3a2a);chairD(17.6,32.2,'s',0x1f1f24);plantD(14.6,24.6,'tree');
  Frame(20,6.2,23.17,'s',1.5,1.1);Frame(24.6,6.2,23.17,'s',.9,1.2);
  // -- Salle de musique
  rugD(38,28.6,9,5.2,0x2a1a3a);bx(7.4,.22,2.8,0x3a2a1a,37.8,4.11,32.3);
  cabD(33.8,31.0,.8,.6,1.5,0x16161a);cabD(42.0,31.0,.8,.6,1.5,0x16161a);
  for(const p of[[35.6,32.4],[34.8,32.8]]){cyl(.3,.4,0x3a3a42,p[0],4.6,p[1]);}cyl(.04,1.4,0xc8ccd0,35.6,5.0,32.4);
  bx(.5,.02,.5,0xf0c030,35.2,5.5,32.4,true);cyl(.04,1.6,0x2a2a2e,39.6,4.8,30.8);sofaD(28.3,26.6,'e',2.0,0x3a1a4a);sofaD(40.6,26.8,'s',2.0,0x3a1a4a);
  for(const x of[31,34,37,40])bx(.5,.1,.5,0xc080ff,x,7.6,28.6,true);Frame(33.0,6.2,33.83,'n',1.2,.9);Frame(27.17,6.2,31.5,'w',.9,1.1);
  // -- Salle de jeux
  rugD(33,18,6.6,4.4,0x1a2a3a);tableD(31,19.6,1.6,1.6,.78,0x1f5a34);for(const p of[[31,18.4,'s'],[31,20.8,'n'],[29.8,19.6,'e'],[32.2,19.6,'w']])chairD(p[0],p[1],p[2],0x5a2a2a);
  small(.3,.03,.4,0xffffff,30.7,4.82,19.6);small(.3,.03,.4,0xffffff,31.4,4.82,19.4);
  cabD(27.85,14.6,.7,3.0,1.1,0x33261c);for(const z of[13.6,14.6,15.6])chairD(28.9,z,'w',0x7a2a2a);Frame(34,6.2,12.17,'s',.7,.7);
  sofaD(29.0,22.3,'n',2.4,0x4a2a30);for(const z of[15.0,16.6,18.2]){cabD(38.4,z,.7,.8,1.8,0x1a1a4a);screenD(38.03,5.4+0,z,'w',.5,.5,0x40ff90);}
  plantD(27.9,23.0,'fern');
  // -- Palier
  plantD(39.8,21.7,'palm');plantD(43.2,22.2,'fern');
  // -- Chambre bleue
  rugD(5.4,16,4.4,3.6,0x22304a);bedD(1.3,18.6,'w',0x2a3a5a,0x4a6ab0);tableD(1.0,16.5,.5,.5,.6,0x4a3a2a);
  cabD(6.6,10.6,2.4,.6,2.1,0x3a2a1e);Shelf(.2,12.3,1.0,14.6,'e');tableD(12.0,14.6,.8,1.9,.78,0x4a3a2a);chairD(11.0,14.6,'e',0x2a3a5a);small(.4,.28,.3,0x22222a,12.0,4.95,14.3);
  cabD(3.6,21.3,1.0,.6,.6,0x5a3a22);sofaD(9.4,19.4,'w',1.0,0x2a3a5a);Frame(12.83,6.2,17.5,'w',.8,1.0);Frame(6.5,6.2,10.17,'s',1.0,.8);
  // -- Chambre d'amis
  rugD(6,28,5,4,0x4a3a1a);bedD(1.3,26.0,'w',0x5a5a3a,0xc8a060);bedD(1.3,30.4,'w',0x5a3a3a,0xb06a5a);tableD(2.9,28.2,.5,.5,.6,0x4a3a2a);
  cabD(6.5,33.3,2.2,.6,1.0,0x4a3a2a);sofaD(10.6,31.6,'w',1.0,0x5a4a2a);tableD(10.8,29.2,.6,.6,.5,0x3a2a1a);Shelf(11.1,22.2,12.8,22.85,'s');Frame(6.4,6.2,33.83,'n',.9,.9);

  /* ===================== SOUS-SOL ===================== */
  Y=-4;
  // -- Cave à vin
  Shelf(28.3,12.2,36.2,13.0,'s','wine');Shelf(27.3,22.85,31.4,23.8,'n','wine');Shelf(37.95,18.6,38.8,22.8,'w','wine');
  barrelD(30.0,16.6);barrelD(31.2,17.1);barrelD(30.6,18.2);barrelD(29.4,17.6,0x3a2a1a);
  tableD(33,18,2.2,1.0,.9,0x33261c);chairD(32.0,19.1,'n',0x4a3020);chairD(34.0,19.1,'n',0x4a3020);chairD(33,16.9,'s',0x4a3020);
  for(const x of[32.4,33.2,33.8])small(.1,.3,.1,pick([0x2a5a2a,0x5a1a2a]),x,-2.95,18.0);crateD(37.2,20.5,2,0x6a4a2a);
  // -- Chaufferie
  cyl(1.0,3.2,0x5a5e66,41.6,-2.4,14.9);cyl(.8,.25,0xff6a20,41.6,-3.3,14.9,true);bx(.7,.7,.08,0xff5a10,41.6,-3.3,13.85,true);cyl(1.05,.12,0x2a2c30,41.6,-1.3,14.9);
  pipe(41.6,14.9,41.6,22.4,-1.0,.14,0x7a6a5a);pipe(39.3,22.4,43.8,22.4,-1.0,.1,0x7a6a5a);pipe(39.3,13.1,43.8,13.1,-1.6,.1,0x7a6a5a);
  bx(1.4,.5,1.2,0x1a1a1e,43.0,-3.75,16.5);cyl(.18,.05,0xc0c0c8,39.6,-2.4,15.0).rotation.x=Math.PI/2;crateD(40.0,22.3,1,0x5a4a2a);crateD(40.0,20.5,1,0x5a4a2a);
  // -- Tunnel
  pipe(13.4,14.3,26.6,14.3,-1.4,.09,0x7a6a5a);pipe(13.4,16.7,26.6,16.7,-1.8,.07,0x6a7a8a);pipe(13.4,14.3,26.6,14.3,-1.0,.06,0xaa4a3a);
  crateD(15.7,16.3,1,0x5a4a2a);crateD(23.8,14.7,2,0x5a4a2a);rugD(20,15.5,1.6,.8,0x1c2a3a);
  // -- Laboratoire secret
  cabD(6.5,10.65,7.2,.9,.95,0x9aa0a8);for(const p of[[2.6,10.6,0x40ff90],[4.0,10.6,0x60d0ff],[9.6,10.6,0xff60c0]])cyl(.16,.5,p[2],p[0],-2.6,p[1],true);
  tableD(6.5,16.0,1.2,2.4,.9,0xc8d0d8);small(.3,.3,.3,0x40ff90,6.3,-2.95,15.4,true);small(.3,.3,.3,0x60d0ff,6.7,-2.95,16.4,true);
  cabD(2.2,19.6,1.6,.9,.9,0x6a7078);cabD(4.4,19.6,1.6,.9,.9,0x6a7078);small(.6,.4,.5,0x9a9aa0,2.2,-2.6,19.6);small(.6,.4,.5,0x9a9aa0,4.4,-2.6,19.6);
  tableD(11.9,18.6,.8,2.4,.8,0x5a5e66);screenD(11.6,-2.6,18.0,'w',.6,.45,0x40ff90);screenD(11.6,-2.6,19.2,'w',.6,.45,0x60d0ff);chairD(10.9,18.6,'e',0x2a2a30);
  Shelf(.2,17,1.0,21.4,'e','books');cyl(.3,1.6,0x9aa0a8,10.8,-3.2,12.6);
  // -- Crypte
  for(const p of[[15.4,19.3],[15.4,21.6],[15.4,24.4]]){const y=slot(p[0],p[1],1.1,2.3,1.2,true);if(y===null)continue;bx(1.1,.7,2.3,0x6a6a72,p[0],y+.35,p[1]);bx(1.2,.25,2.4,0x8a8a92,p[0],y+.85,p[1]);bx(.14,.06,.7,0xcfa750,p[0],y+1.0,p[1]);}
  pillarD(17.6,21.6,3.8);pillarD(22.4,21.6,3.8);tableD(20,22.4,1.6,.8,1.0,0x5a5a62);cyl(.04,.3,0xe8e0c0,19.4,-2.85,22.4,true);cyl(.04,.3,0xe8e0c0,20.6,-2.85,22.4,true);bx(.06,.5,.06,0xcfa750,20,-2.75,22.5);
  for(const p of[[15,18.1],[25.4,25.4],[15,25.4]])cyl(.05,.35,0xe8e0c0,p[0],-3.8,p[1],true);
  // -- Archives
  Shelf(7.0,26.35,12.0,26.85,'ns','books');Shelf(8.6,28.4,12.0,28.9,'ns','books');
  tableD(10.5,31.8,1.8,.9,.78,0x4a3a2a);chairD(10.5,32.7,'n',0x3a2a1a);small(.4,.03,.3,0xd8d0b0,10.2,-3.2,31.8);
  cabD(.6,23.4,.6,1.8,1.2,0x5a5a62);
  Frame(9,-1.8,22.17,'s',.8,1.0);crateD(12.0,32.8,1,0x6a4a2a);
  // -- Garde-manger froid
  Shelf(43.15,26.4,43.8,32.6,'w','wine');Shelf(31.0,33.1,41.5,33.8,'n','wine');
  cabD(36.0,29.0,3.0,1.2,.9,0xc8d0d8);cabD(39.4,25.0,1.0,.7,1.1,0xd8dde2);
  bx(3.4,.05,.05,0x8a8f96,36,-1.0,29.0);for(const x of[34.8,35.6,36.4,37.2])cyl(.06,.4,0x8a8f96,x,-1.4,29.0),sph(.22,0xb02a3a,x,-1.75,29.0);
  crateD(31.5,32.6,2,0x6a7a8a);crateD(41.8,32.8,1,0x6a7a8a);crateD(40.6,30.2,1,0x6a7a8a);
  // -- salle secrète : autel rituel, coffres, table de cartes
  cyl(.7,.9,0x2a2a32,20,-3.55,30);cyl(.5,.1,0xff4060,20,-3.05,30,true);tableD(16.0,28.4,1.6,1.0,.9,0x3a2a1e);small(.6,.03,.4,0xd8c8a0,16.0,-3.08,28.4);
  for(const p of[[14.9,31.2],[25.2,32.6],[25.4,28.0]]){const y=slot(p[0],p[1],1.0,.7,.8,true);if(y===null)continue;bx(1.0,.5,.7,0x5a3a1a,p[0],y+.25,p[1]);bx(1.04,.3,.74,0x6a4a24,p[0],y+.65,p[1]);bx(.12,.14,.05,0xcfa750,p[0],y+.6,p[1]+.37);}
  crateD(14.6,33.0,1,0x5a4424);crateD(22.6,33.0,2,0x5a4424);barrelD(25.4,26.8);
  for(const x of[15.0,25.0])for(const z of[27.5,33.2])cyl(.15,1.2,0xd8d0b0,x,-3.4,z,false,6);
  console.log('decor',DK.n,'skipped',DK.skip);
  // -- extérieur : haies, bancs, buissons
  Y=0;
  [[-3,8],[-3,26],[47,14],[47,20],[10,-3],[31,-3],[8,37],[32,37],[-3,2],[47,34],[2,37],[46,2]].forEach(p=>{const m=cyl(.9,.9,0x143a1a,p[0],.45,p[1],false,7);});
  for(const p of[[-2.2,22],[47.2,6],[47.2,30],[16,-2.4]]){bx(1.8,.12,.5,0x5a3a22,p[0],.5,p[1]);bx(1.8,.4,.08,0x5a3a22,p[0],.75,p[1]-.22);bx(.1,.5,.1,0x2a1a10,p[0]-.8,.25,p[1]);bx(.1,.5,.1,0x2a1a10,p[0]+.8,.25,p[1]);}
  return DK;
}
