
/* ============================ rendering & view state ============================ */
const gl=$('#gl');
const renderer=new THREE.WebGLRenderer({canvas:gl,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
renderer.outputEncoding=THREE.sRGBEncoding;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x06050a);
scene.fog=new THREE.FogExp2(0x06050a,0.03);
const camera=new THREE.PerspectiveCamera(74,1,.05,140);camera.rotation.order='YXZ';
scene.add(camera);
const headlamp=new THREE.PointLight(0xffe6c0,.55,9,1.6);camera.add(headlamp);headlamp.position.set(0,0,.2);
buildWorld(scene);
function resize(){const a=$('#app'),w=a.clientWidth||innerWidth,h=a.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();

function makeAvatar(col){
  const g=new THREE.Group(),cm=new THREE.MeshLambertMaterial({color:col}),sk=new THREE.MeshLambertMaterial({color:0xe0b894}),dk=new THREE.MeshLambertMaterial({color:0x22202a});
  const part=(geo,mat,x,y,z,py)=>{const m=new THREE.Mesh(geo,mat);if(py!==undefined){geo.translate(0,-py,0);}m.position.set(x,y,z);g.add(m);return m;};
  part(new THREE.BoxGeometry(.52,.72,.3),cm,0,1.06,0);
  part(new THREE.SphereGeometry(.18,12,10),sk,0,1.58,0);
  part(new THREE.BoxGeometry(.4,.1,.36),dk,0,1.74,0);
  const lL=part(new THREE.BoxGeometry(.2,.72,.22),dk,-.13,.72,0,.36),lR=part(new THREE.BoxGeometry(.2,.72,.22),dk,.13,.72,0,.36);
  const aL=part(new THREE.BoxGeometry(.13,.62,.13),cm,-.34,1.38,0,.31),aR=part(new THREE.BoxGeometry(.13,.62,.13),cm,.34,1.38,0,.31);
  g.userData={lL,lR,aL,aR};return g;
}
const V={on:false,roster:[],my:-1,snap:null,ents:[],bodies:new Map(),zones:new Map(),lastEv:0,over:false,noLock:false,mode:'solo',t0:0,seenBody:new Set()};
const ME={x:21,y:0,z:15,vy:0,yaw:0,pit:0,crouch:0,eye:1.6,fl:0,step:0,ground:true};
let PV=null;
const bodyMat=new THREE.MeshLambertMaterial({color:0x6b0f18});
const fxGroup=new THREE.Group();scene.add(fxGroup);

function clearView(){
  for(const e of V.ents)scene.remove(e.g);V.ents=[];
  for(const b of V.bodies.values())scene.remove(b);V.bodies.clear();
  for(const z of V.zones.values()){fxGroup.remove(z.m);if(z.col){const k=COL.indexOf(z.col);if(k>=0)COL.splice(k,1);}}V.zones.clear();
  for(const f of FP.list)fxGroup.remove(f.m);FP.list.length=0;
}
function startView(roster,my){
  clearView();
  V.roster=roster;V.my=my;V.snap=null;V.lastEv=0;V.over=false;V.seenBody.clear();PV=null;
  roster.forEach((r,i)=>{
    const g=makeAvatar(CHARS[r.c].col);scene.add(g);
    V.ents.push({g,x:r.s[0],y:0,z:r.s[1],yaw:0,tx:r.s[0],ty:0,tz:r.s[1],tyaw:0,f:0,step:0,ph:0,pvx:r.s[0],pvz:r.s[1],vis:true});
    g.position.set(r.s[0],0,r.s[1]);
  });
  const me=roster[my];ME.x=me.s[0];ME.z=me.s[1];ME.y=0;ME.vy=0;ME.yaw=Math.PI*.0+Math.atan2(-(20-ME.x),-(15-ME.z));ME.pit=0;ME.crouch=0;ME.eye=1.6;
  V.ents[my].g.visible=false;
  WORLD.exits.forEach(e=>{e.beam.visible=false;});
}

/* ---- footprints (Explorateur) ---- */
const FP={list:[],tex:null,acc:new Map()};
FP.tex=ctex(32,48,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='#e8c88a';x.beginPath();x.moveTo(16,2);x.lineTo(28,30);x.lineTo(16,24);x.lineTo(4,30);x.closePath();x.fill();});
FP.tex.wrapS=FP.tex.wrapT=THREE.ClampToEdgeWrapping;
const fpGeo=new THREE.PlaneGeometry(.32,.48);fpGeo.rotateX(-Math.PI/2);
function addFootprint(x,y,z,yaw){
  const m=new THREE.Mesh(fpGeo,new THREE.MeshBasicMaterial({map:FP.tex,transparent:true,opacity:.85,depthWrite:false}));
  m.position.set(x,y+.03,z);m.rotation.y=yaw;fxGroup.add(m);FP.list.push({m,t:0});
  if(FP.list.length>90){const o=FP.list.shift();fxGroup.remove(o.m);o.m.material.dispose();}
}

/* ---- audio ---- */
const AU={ctx:null,master:null,drone:null};
function audioInit(){
  if(AU.ctx)return;try{
    AU.ctx=new (window.AudioContext||window.webkitAudioContext)();AU.master=AU.ctx.createGain();AU.master.gain.value=.8;AU.master.connect(AU.ctx.destination);
    const o=AU.ctx.createOscillator(),g=AU.ctx.createGain(),o2=AU.ctx.createOscillator();o.frequency.value=48;o2.frequency.value=50.5;g.gain.value=.05;o.connect(g);o2.connect(g);g.connect(AU.master);o.start();o2.start();
    AU.noise=AU.ctx.createBuffer(1,AU.ctx.sampleRate*1,AU.ctx.sampleRate);const d=AU.noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  }catch(e){AU.ctx=null;}
}
function tone(f0,f1,dur,type,gain,pan,when=0){
  const c=AU.ctx,t=c.currentTime+when,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);let n=g;
  if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;g.connect(p);n=p;}n.connect(AU.master);o.start(t);o.stop(t+dur+.05);
}
function burst(dur,freq,gain,pan,q=1){
  const c=AU.ctx,t=c.currentTime,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=AU.noise;f.type='bandpass';f.frequency.value=freq;f.Q.value=q;
  g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);let n=g;
  if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;g.connect(p);n=p;}n.connect(AU.master);s.start(t,Math.random()*.5,dur+.05);
}
function sfx(kind,x,z,y,r,gain=1){
  if(!AU.ctx||!V.on)return;
  let d=Math.hypot(x-ME.x,z-ME.z)+Math.abs(y-ME.y)*1.5,rr=r*(PV&&PV.r==='m'&&kind==='step'?1.6:1);
  if(d>rr)return;let v=Math.pow(1-d/rr,1.4)*gain;if(v<.02)return;
  const dx=x-ME.x,dz=z-ME.z,dd=Math.hypot(dx,dz)||1,pan=d<.5?0:clamp((dx*Math.cos(ME.yaw)-dz*Math.sin(ME.yaw))/dd,-1,1),sgn=pan;
  switch(kind){
    case 'step':burst(.07,500,.45*v,sgn,2);break;
    case 'run':burst(.09,700,.8*v,sgn,1.5);break;
    case 'door':burst(.22,260,.9*v,sgn,1);tone(90,50,.2,'sine',.5*v,sgn);break;
    case 'hit':burst(.12,180,.9*v,sgn);tone(120,60,.15,'square',.3*v,sgn);break;
    case 'kill':tone(200,40,.4,'sawtooth',.4*v,sgn);burst(.25,150,.6*v,sgn);break;
    case 'rg':burst(.12,2200,1*v,sgn,.7);tone(700,80,.35,'sawtooth',.5*v,sgn);tone(1200,200,.3,'square',.2*v,sgn,.05);break;
    case 'shot':burst(.25,900,1.2*v,sgn,.6);tone(140,40,.5,'sawtooth',.6*v,sgn);break;
    case 'sab':burst(.4,3000,.7*v,sgn,.8);tone(300,80,.5,'square',.3*v,sgn);break;
    case 'alarm':for(let i=0;i<5;i++){tone(620,880,.22,'square',.18*v,sgn,i*.3);}break;
    case 'chime':tone(880,1320,.3,'sine',.35*v,sgn);tone(1320,1760,.35,'sine',.2*v,sgn,.1);break;
    case 'puff':burst(.35,1200,.5*v,sgn,.4);break;
    case 'sting':tone(160,150,.6,'sawtooth',.25,0);tone(240,230,.6,'sawtooth',.18,0);break;
  }
}

/* ---- snapshot application ---- */
function applySnap(S){
  V.snap=S;
  // world states
  S.dr.forEach((s,i)=>{const d=WORLD.doors[i];if(d.state!==s&&V.mode==='client'&&false)0;d.state=s;d.col.on=s!==0;d.tgt=s===0?1:0;});
  S.wn.forEach((s,i)=>{const w=WORLD.wins[i];w.state=s;w.col.on=!!s;w.tgt=s?0:1;});
  S.fu.forEach((s,i)=>{const f=WORLD.furn[i];if(f.s!==s)applyFurn(f,s);f.tg=s;});
  S.ex.forEach((s,i)=>{const e=WORLD.exits[i];e.active=!!(s&1);e.open=!!(s&2);e.used=!!(s&4);e.col.on=!e.open;e.beam.visible=e.active;});
  S.ob.forEach((s,i)=>{WORLD.objs[i].state=s;});
  // players
  S.pl.forEach((q,i)=>{const e=V.ents[i];if(!e)return;e.f=q[0];e.tx=q[1];e.ty=q[2];e.tz=q[3];e.tyaw=q[4];});
  // bodies
  const seen=new Set();
  for(const b of S.bd){seen.add(b[0]);if(!V.bodies.has(b[0])){
      const g=makeAvatar(CHARS[V.roster[b[0]].c].col);
      const wrap=new THREE.Group();g.rotation.x=-Math.PI/2;g.position.set(0,.22,0);wrap.add(g);
      const pool=new THREE.Mesh(new THREE.CircleGeometry(.9,16),bodyMat);pool.rotation.x=-Math.PI/2;pool.position.y=.03;wrap.add(pool);
      wrap.position.set(b[1],b[2],b[3]);wrap.rotation.y=b[4];scene.add(wrap);V.bodies.set(b[0],wrap);wrap.userData={x:b[1],y:b[2],z:b[3],i:b[0]};}}
  for(const [k,m] of V.bodies)if(!seen.has(k)){scene.remove(m);V.bodies.delete(k);}
  // zones
  const zs=new Set();
  for(const z of S.zn){zs.add(z[0]);if(!V.zones.has(z[0])){
      const [id,type,x,zz,y,r]=z;let m;
      if(type==='smoke'){m=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),new THREE.MeshBasicMaterial({color:0x8a8f99,transparent:true,opacity:.78,depthWrite:false}));m.position.set(x,y+1.2,zz);}
      else if(type==='gum'){m=new THREE.Mesh(new THREE.SphereGeometry(1.15,14,10),new THREE.MeshLambertMaterial({color:0xff6bd0,emissive:0x5a1248}));m.position.set(x,y+1.15,zz);}
      else{m=new THREE.Group();const dm=new THREE.MeshBasicMaterial({color:0x111111});for(let i=0;i<40;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(.05,4,4),dm);s.position.set(rnd(-r,r),rnd(.2,2),rnd(-r,r));m.add(s);}m.position.set(x,y,zz);}
      fxGroup.add(m);const rec={m,type,x,z:zz,y,r};
      if(type==='gum'&&V.mode==='client')rec.col=addCol(x-1.1,y,zz-1.1,x+1.1,y+2.4,zz+1.1,true);
      V.zones.set(id,rec);}}
  for(const [k,z] of V.zones)if(!zs.has(k)){fxGroup.remove(z.m);if(z.col){const i=COL.indexOf(z.col);if(i>=0)COL.splice(i,1);}V.zones.delete(k);}
  // events
  for(const e of S.ev){if(e.i<=V.lastEv)continue;V.lastEv=Math.max(V.lastEv,e.i);onEvent(e);}
  if(S.ov&&!V.over){V.over=true;V.ov=S.ov;V.ro=S.ro;setTimeout(showEnd,1800);}
}
function onEvent(e){
  if(e.k==='s'){
    sfx(e.s,e.x,e.z,e.y,e.r);
    if(e.s==='rg'){const d=Math.hypot(e.x-ME.x,e.z-ME.z);if(d<e.r){showPing(Math.atan2(-(e.x-ME.x),-(e.z-ME.z)));banner('Attaque à distance !',1800);}}
    if(e.s==='alarm'&&Math.hypot(e.x-ME.x,e.z-ME.z)<e.r)banner(V.snap&&V.snap.ph>=1?'Alarme !':'Sécurisation terminée',1800);
    if(e.s==='sab'&&Math.hypot(e.x-ME.x,e.z-ME.z)<e.r)logMsg('Un sabotage a été entendu au loin.',1);
  }else if(e.k==='m'){if(e.to===-1||e.to===V.my)logMsg(e.t,e.b);}
}
function applyFurn(f,s){f.s=s;const b=f.box[s];f.c.x0=b[0];f.c.z0=b[1];f.c.x1=b[2];f.c.z1=b[3];}
