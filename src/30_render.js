
/* ============================ rendering & view state ============================ */
const gl=$('#gl');
const renderer=new THREE.WebGLRenderer({canvas:gl,antialias:false,powerPreference:'high-performance'});
renderer.setPixelRatio(1);
let PIX=1;try{PIX=localStorage.getItem('mm_pix')==='0'?0:1;}catch(e){}
function pixScale(){return PIX?.5:Math.min(window.devicePixelRatio||1,1.5);}
gl.style.imageRendering=PIX?'pixelated':'auto';
renderer.outputEncoding=THREE.sRGBEncoding;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x04030a);
scene.fog=new THREE.FogExp2(0x04030a,0.03);
scene.add(new THREE.AmbientLight(0x343852,.62));
scene.add(new THREE.HemisphereLight(0x4a5a90,0x140e0c,.22));
const camera=new THREE.PerspectiveCamera(74,1,.05,140);camera.rotation.order='YXZ';
scene.add(camera);
const headlamp=new THREE.PointLight(0xffe6c0,.5,8,1.6);camera.add(headlamp);headlamp.position.set(0,0,.2);
const flashLight=new THREE.PointLight(0xff2030,0,14,1.4);scene.add(flashLight);
buildWorld(scene);
function resize(){const a=$('#app'),w=a.clientWidth||innerWidth,h=a.clientHeight||innerHeight,s=pixScale();renderer.setSize(Math.floor(w*s),Math.floor(h*s),false);camera.aspect=w/h;camera.updateProjectionMatrix();}
function togglePix(){PIX=PIX?0:1;try{localStorage.setItem('mm_pix',String(PIX));}catch(e){}gl.style.imageRendering=PIX?'pixelated':'auto';resize();}
addEventListener('resize',resize);resize();

/* ---- blocky (Minecraft-style) characters: skin colour = role colour, one hat per role ---- */
const faceCache={};
function faceTexture(skin){
  if(faceCache[skin])return faceCache[skin];
  const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d'),s='#'+new THREE.Color(skin).getHexString();
  x.fillStyle=s;x.fillRect(0,0,16,16);x.fillStyle='rgba(0,0,0,.14)';x.fillRect(0,0,16,3);
  x.fillStyle='#fff';x.fillRect(3,6,3,3);x.fillRect(10,6,3,3);x.fillStyle='#111';x.fillRect(4,7,2,2);x.fillRect(10,7,2,2);
  x.fillStyle='rgba(0,0,0,.45)';x.fillRect(5,11,6,1);x.fillRect(4,10,1,1);x.fillRect(11,10,1,1);
  const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.encoding=THREE.sRGBEncoding;return faceCache[skin]=t;
}
const avGeo={head:new THREE.BoxGeometry(.5,.5,.5),torso:new THREE.BoxGeometry(.52,.74,.28),arm:new THREE.BoxGeometry(.22,.72,.22),leg:new THREE.BoxGeometry(.24,.72,.24)};
function makeAvatar(ci){
  const C=CHARS[ci],skin=C.col,g=new THREE.Group();
  const lam=c=>new THREE.MeshLambertMaterial({color:c});
  const skinM=lam(skin),shirtM=lam(new THREE.Color(skin).multiplyScalar(.4).getHex()),pantsM=lam(0x23283c),darkM=lam(0x111114);
  const faceM=new THREE.MeshLambertMaterial({map:faceTexture(skin)});
  const head=new THREE.Mesh(avGeo.head,[skinM,skinM,skinM,skinM,skinM,faceM]);head.position.y=1.7;g.add(head);
  const torso=new THREE.Mesh(avGeo.torso,shirtM);torso.position.y=1.07;g.add(torso);
  const piv=(geo,mat,x,y)=>{const m=new THREE.Mesh(geo.clone().translate(0,-.36,0),mat);m.position.set(x,y,0);g.add(m);return m;};
  const aL=piv(avGeo.arm,skinM,-.38,1.42),aR=piv(avGeo.arm,skinM,.38,1.42),lL=piv(avGeo.leg,pantsM,-.13,.72),lR=piv(avGeo.leg,pantsM,.13,.72);
  const hat=(w,h,d,c,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),lam(c));m.position.set(x,y,z);g.add(m);return m;};
  let prop=null;
  switch(C.hat){
    case'band':hat(.54,.09,.54,0xffffff,0,1.83,0);hat(.56,.05,.56,0xd9372f,0,1.83,0);break;
    case'mask':hat(.54,.18,.54,0x16203a,0,1.6,0);hat(.54,.1,.1,0x050505,0,1.74,-.26);hat(.5,.14,.5,0x0a0f1e,0,1.95,0);break;
    case'safari':hat(.95,.05,.95,0x6a5a2a,0,1.96,0);hat(.56,.2,.56,0x7a6a32,0,2.06,0);break;
    case'press':hat(.54,.12,.54,0x3a3020,0,1.97,0);hat(.54,.04,.3,0x3a3020,0,1.94,-.36);hat(.16,.1,.02,0xffffff,.2,1.08,-.15);break;
    case'helmet':hat(.6,.18,.6,0xf0d020,0,1.98,0);hat(.56,.12,.56,0xf0d020,0,2.1,0);hat(.1,.06,.3,0xf0d020,0,2.18,0);break;
    case'beret':hat(.56,.1,.56,0x7a2a9a,0,1.96,0);hat(.3,.08,.3,0x7a2a9a,-.08,2.04,0);hat(.06,.5,.06,0x3a2a1a,.4,1.2,-.1);break;
    case'shades':hat(.56,.22,.56,0xf0e0a0,0,1.85,.02);hat(.5,.1,.08,0x050505,0,1.72,-.26);break;
    case'toque':hat(.5,.16,.5,0xffffff,0,1.98,0);hat(.56,.36,.56,0xffffff,0,2.22,0);break;
    case'phones':hat(.6,.06,.12,0x222226,0,1.98,0);hat(.1,.22,.12,0x222226,.3,1.7,0);hat(.1,.22,.12,0x222226,-.3,1.7,0);hat(.46,.1,.06,0x0f3a30,0,1.72,-.26);break;
    case'agent':hat(.54,.12,.54,0x111118,0,1.97,0);hat(.5,.1,.06,0x050505,0,1.72,-.26);hat(.04,.25,.04,0xdddddd,.3,1.6,.1);break;
    case'afro':hat(.76,.5,.76,0x2a1a40,0,1.98,0);break;
    case'antenna':hat(.54,.12,.54,0x5a8a30,0,1.97,0);hat(.04,.4,.04,0xcccccc,0,2.25,0);hat(.1,.1,.1,0xff4040,0,2.48,0);break;
    case'dome':{const m=new THREE.Mesh(new THREE.BoxGeometry(.72,.72,.72),new THREE.MeshLambertMaterial({color:0xbfe8ff,transparent:true,opacity:.35}));m.position.y=1.7;g.add(m);hat(.6,.08,.6,0xeeeeee,0,1.3,0);break;}
    case'surgeon':hat(.56,.14,.56,0x9af0b0,0,1.98,0);hat(.54,.2,.1,0xffffff,0,1.62,-.26);break;
    case'prop':hat(.56,.12,.56,0x7a2a9a,0,1.97,0);hat(.5,.04,.25,0x7a2a9a,0,1.94,-.34);prop=new THREE.Group();prop.add(new THREE.Mesh(new THREE.BoxGeometry(.5,.02,.07),lam(0xffe040)));prop.add(new THREE.Mesh(new THREE.BoxGeometry(.07,.02,.5),lam(0xffe040)));prop.position.y=2.12;g.add(prop);break;
  }
  const knife=new THREE.Mesh(new THREE.BoxGeometry(.05,.05,.5),new THREE.MeshBasicMaterial({color:0xdde4ea}));knife.position.set(.38,.85,-.35);knife.visible=false;g.add(knife);
  const stars=new THREE.Group();for(let i=0;i<3;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.1),new THREE.MeshBasicMaterial({color:0xffe040}));stars.add(s);}stars.position.y=2.35;stars.visible=false;g.add(stars);
  g.scale.setScalar(.94);g.userData={head,aL,aR,lL,lR,prop,knife,stars};return g;
}
const V={on:false,roster:[],my:-1,snap:null,ents:[],bodies:new Map(),zones:new Map(),lastEv:0,over:false,noLock:false,mode:'solo',seenBody:new Set(),lt:-1};
const ME={x:21,y:0,z:15,vy:0,yaw:0,pit:0,crouch:0,eye:1.6,fl:0,step:0,ground:true,tpN:0,h:1.7,gs:1};
let PV=null;
const bodyMat=new THREE.MeshLambertMaterial({color:0x6b0f18});
const fxGroup=new THREE.Group();scene.add(fxGroup);

/* ---- first-person hands ---- */
const VM={g:new THREE.Group(),arm:null,knife:null,t:0,atk:0,ci:-1};
camera.add(VM.g);
function buildViewmodel(ci,murderer){
  VM.g.clear();VM.ci=ci;const C=CHARS[ci];
  const skin=new THREE.MeshLambertMaterial({color:C.col,emissive:new THREE.Color(C.col).multiplyScalar(.2)});
  const arm=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.46),skin);arm.position.set(.3,-.26,-.5);arm.rotation.set(.12,-.12,0);VM.g.add(arm);VM.arm=arm;
  const sleeve=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.2),new THREE.MeshLambertMaterial({color:new THREE.Color(C.col).multiplyScalar(.4).getHex(),emissive:0x0a0a0a}));sleeve.position.set(.3,-.28,-.32);sleeve.rotation.copy(arm.rotation);VM.g.add(sleeve);
  const kn=new THREE.Group();const blade=new THREE.Mesh(new THREE.BoxGeometry(.03,.07,.4),new THREE.MeshBasicMaterial({color:0xdce4ec}));blade.position.z=-.22;kn.add(blade);
  const hd=new THREE.Mesh(new THREE.BoxGeometry(.05,.05,.14),new THREE.MeshLambertMaterial({color:0x2a1a10,emissive:0x0a0604}));kn.add(hd);
  kn.position.set(.3,-.22,-.82);kn.visible=!!murderer;VM.g.add(kn);VM.knife=kn;
}
function updateViewmodel(dt,moving){
  VM.t+=dt*(moving?9:1.6);VM.atk=Math.max(0,VM.atk-dt*3.2);
  const bob=Math.sin(VM.t)*(moving?.014:.004),a=VM.atk;
  VM.g.position.set(Math.cos(VM.t*.5)*(moving?.012:.002),bob,0);
  const sw=Math.sin(a*Math.PI);
  if(VM.arm){VM.arm.rotation.x=.12-sw*1.1;VM.arm.position.y=-.27+sw*.12;}
  if(VM.knife){VM.knife.rotation.x=-sw*1.1;VM.knife.position.y=-.22+sw*.14;VM.knife.position.z=-.82-sw*.25;}
}

function clearView(){
  for(const e of V.ents)scene.remove(e.g);V.ents=[];
  for(const b of V.bodies.values())scene.remove(b);V.bodies.clear();
  for(const z of V.zones.values()){fxGroup.remove(z.m);if(z.col){const k=COL.indexOf(z.col);if(k>=0)COL.splice(k,1);}}V.zones.clear();
  for(const f of FP.list)fxGroup.remove(f.m);FP.list.length=0;
  for(const p of PART.list)fxGroup.remove(p.m);PART.list.length=0;
  for(const r of RINGS)fxGroup.remove(r.m);RINGS.length=0;
}
function startView(roster,my){
  clearView();
  V.roster=roster;V.my=my;V.snap=null;V.lastEv=0;V.over=false;V.seenBody.clear();PV=null;V.lt=-1;V.revealed=false;V.revealOn=false;ME.look=null;V.tl=-1;V.fz=0;ME.h=1.7;
  roster.forEach((r,i)=>{
    const g=makeAvatar(r.c);scene.add(g);
    V.ents.push({g,ci:r.c,x:r.s[0],y:0,z:r.s[1],yaw:0,tx:r.s[0],ty:0,tz:r.s[1],tyaw:0,f:0,step:0,ph:0});
    g.position.set(r.s[0],0,r.s[1]);
  });
  const me=roster[my];ME.x=me.s[0];ME.z=me.s[1];ME.y=0;ME.vy=0;ME.yaw=Math.atan2(-(21.5-ME.x),-(17-ME.z));ME.pit=0;ME.crouch=0;ME.eye=1.6;ME.tpN=0;
  V.ents[my].g.visible=false;buildViewmodel(me.c,false);
  WORLD.exits.forEach(e=>{e.beam.visible=false;});
}

/* ---- footprints (Explorateur) ---- */
const FP={list:[],tex:null};
FP.tex=ctex(32,48,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='#e8c88a';x.beginPath();x.moveTo(16,2);x.lineTo(28,30);x.lineTo(16,24);x.lineTo(4,30);x.closePath();x.fill();});
FP.tex.wrapS=FP.tex.wrapT=THREE.ClampToEdgeWrapping;
const fpGeo=new THREE.PlaneGeometry(.32,.48);fpGeo.rotateX(-Math.PI/2);
function addFootprint(x,y,z,yaw){
  const m=new THREE.Mesh(fpGeo,new THREE.MeshBasicMaterial({map:FP.tex,transparent:true,opacity:.85,depthWrite:false}));
  m.position.set(x,y+.03,z);m.rotation.y=yaw;fxGroup.add(m);FP.list.push({m,t:0});
  if(FP.list.length>90){const o=FP.list.shift();fxGroup.remove(o.m);o.m.material.dispose();}
}

/* ---- particles & rings (action feedback) ---- */
const PART={list:[],geo:new THREE.BoxGeometry(1,1,1)};
function burst(x,y,z,n,col,speed,grav,life,size,up){
  for(let i=0;i<n;i++){
    const m=new THREE.Mesh(PART.geo,new THREE.MeshBasicMaterial({color:Array.isArray(col)?pick(col):col,transparent:true}));
    const s=size*(.6+Math.random()*.8);m.scale.setScalar(s);m.position.set(x+rnd(-.15,.15),y,z+rnd(-.15,.15));fxGroup.add(m);
    const a=Math.random()*6.283,sp=speed*(.3+Math.random());
    PART.list.push({m,vx:Math.cos(a)*sp,vy:(up||0)+Math.random()*speed*.8,vz:Math.sin(a)*sp,g:grav,life,max:life});
  }
  while(PART.list.length>260){const o=PART.list.shift();fxGroup.remove(o.m);o.m.material.dispose();}
}
const RINGS=[];
function ring(x,y,z,col,max){
  const m=new THREE.Mesh(new THREE.TorusGeometry(1,.05,6,28),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.9}));
  m.rotation.x=Math.PI/2;m.position.set(x,y+.15,z);fxGroup.add(m);RINGS.push({m,t:0,max:max||2.4});
}
function updateParticles(dt){
  for(let i=PART.list.length-1;i>=0;i--){const p=PART.list[i];p.life-=dt;
    if(p.life<=0){fxGroup.remove(p.m);p.m.material.dispose();PART.list.splice(i,1);continue;}
    p.vy-=p.g*dt;p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt;p.m.material.opacity=Math.min(1,p.life/p.max*1.6);}
  for(let i=RINGS.length-1;i>=0;i--){const r=RINGS[i];r.t+=dt;const k=r.t/.9;if(k>=1){fxGroup.remove(r.m);r.m.material.dispose();RINGS.splice(i,1);continue;}
    r.m.scale.setScalar(.3+k*r.max);r.m.material.opacity=.9*(1-k);}
  flashLight.intensity=Math.max(0,flashLight.intensity-dt*9);
}
const SHAKE={a:0};

/* ---- audio ---- */
const AU={ctx:null,master:null,noise:null};
function audioInit(){
  if(AU.ctx)return;try{
    AU.ctx=new (window.AudioContext||window.webkitAudioContext)();AU.master=AU.ctx.createGain();AU.master.gain.value=.8;AU.master.connect(AU.ctx.destination);
    const o=AU.ctx.createOscillator(),g=AU.ctx.createGain(),o2=AU.ctx.createOscillator();o.frequency.value=46;o2.frequency.value=48.3;g.gain.value=.05;o.connect(g);o2.connect(g);g.connect(AU.master);o.start();o2.start();
    AU.noise=AU.ctx.createBuffer(1,AU.ctx.sampleRate,AU.ctx.sampleRate);const d=AU.noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  }catch(e){AU.ctx=null;}
}
function tone(f0,f1,dur,type,gain,pan,when){
  const c=AU.ctx,t=c.currentTime+(when||0),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);let n=g;
  if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;g.connect(p);n=p;}n.connect(AU.master);o.start(t);o.stop(t+dur+.05);
}
function nburst(dur,freq,gain,pan,q){
  const c=AU.ctx,t=c.currentTime,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=AU.noise;f.type='bandpass';f.frequency.value=freq;f.Q.value=q||1;
  g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);let n=g;
  if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;g.connect(p);n=p;}n.connect(AU.master);s.start(t,Math.random()*.5,dur+.05);
}
function sfx(kind,x,z,y,r,gain){
  if(!AU.ctx||!V.on)return;gain=gain||1;
  const d=Math.hypot(x-ME.x,z-ME.z)+Math.abs(y-ME.y)*1.5,rr=r*(PV&&PV.r==='m'&&kind==='step'?1.6:1);
  if(d>rr)return;const v=Math.pow(1-d/rr,1.4)*gain;if(v<.02)return;
  const dx=x-ME.x,dz=z-ME.z,dd=Math.hypot(dx,dz)||1,sg=d<.5?0:clamp((dx*Math.cos(ME.yaw)-dz*Math.sin(ME.yaw))/dd,-1,1);
  switch(kind){
    case'step':nburst(.07,500,.45*v,sg,2);break;
    case'run':nburst(.09,700,.8*v,sg,1.5);break;
    case'door':nburst(.22,260,.9*v,sg,1);tone(90,50,.2,'sine',.5*v,sg);break;
    case'click':nburst(.04,3000,.6*v,sg,3);break;
    case'hit':nburst(.12,180,.9*v,sg);tone(120,60,.15,'square',.3*v,sg);break;
    case'kill':tone(240,50,.5,'sawtooth',.5*v,sg);tone(900,300,.35,'sawtooth',.25*v,sg,.05);nburst(.3,150,.8*v,sg);break;
    case'scream':tone(520,1400,.22,'sawtooth',.55*v,sg);tone(1400,700,.5,'sawtooth',.45*v,sg,.2);break;
    case'slash':nburst(.18,2400,.7*v,sg,.6);break;
    case'rg':nburst(.12,2200,1*v,sg,.7);tone(700,80,.35,'sawtooth',.5*v,sg);tone(1200,200,.3,'square',.2*v,sg,.05);break;
    case'shot':nburst(.25,900,1.2*v,sg,.6);tone(140,40,.5,'sawtooth',.6*v,sg);break;
    case'sab':nburst(.4,3000,.7*v,sg,.8);tone(300,80,.5,'square',.3*v,sg);break;
    case'alarm':for(let i=0;i<5;i++)tone(620,880,.22,'square',.18*v,sg,i*.3);break;
    case'chime':tone(880,1320,.3,'sine',.35*v,sg);tone(1320,1760,.35,'sine',.2*v,sg,.1);break;
    case'puff':nburst(.35,1200,.5*v,sg,.4);break;
    case'piano':[261,329,392,523,392,329].forEach((f,i)=>tone(f,f*.98,.5,'triangle',.3*v,sg,i*.14));break;
    case'gramo':[392,440,494,440,392,330,392].forEach((f,i)=>tone(f,f*.99,.28,'square',.12*v,sg,i*.2));nburst(1.4,4000,.15*v,sg,.3);break;
    case'bell':for(let i=0;i<4;i++)tone(880,860,.9,'sine',.4*v,sg,i*.45);break;
    case'tv':nburst(.9,1800,.35*v,sg,.3);tone(200,180,.6,'sawtooth',.1*v,sg);break;
    case'sting':tone(160,150,.6,'sawtooth',.25,0);tone(240,230,.6,'sawtooth',.18,0);break;
  }
}

/* ---- snapshot application ---- */
function applySnap(S){
  V.snap=S;V.lt=S.lt;
  S.dr.forEach((s,i)=>{const d=WORLD.doors[i];d.state=s;d.col.on=s!==0;});
  S.wn.forEach((s,i)=>{const w=WORLD.wins[i];w.state=s;w.col.on=!!s;});
  S.fu.forEach((s,i)=>{const f=WORLD.furn[i];if(f.s!==s)applyFurn(f,s);});
  S.ex.forEach((s,i)=>{const e=WORLD.exits[i];e.active=!!(s&1);e.open=!!(s&2);e.used=!!(s&4);e.col.on=!e.open;e.beam.visible=e.active;});
  S.ob.forEach((s,i)=>{WORLD.objs[i].state=s;});
  V.tl=S.tl;V.fz=S.fz;
  WORLD.vents.forEach((v,i)=>{const op=!!((S.vt>>i)&1);if(op!==v.open){v.open=op;v.col.on=!op;v.mesh.visible=!op;}});
  WORLD.fuses.forEach((f,i)=>{const br=!!((S.fz>>i)&1);f.lamp.material.color.setHex(br?0xff2a2a:0x40ff70);f.broken=br;});
  S.ex.forEach((s,i)=>{WORLD.exits[i].jam=!!(s&8);});
  S.pl.forEach((q,i)=>{const e=V.ents[i];if(!e)return;e.f=q[0];e.tx=q[1];e.ty=q[2];e.tz=q[3];e.tyaw=q[4];
    const want=q[5]>=0?q[5]:V.roster[i].c;
    if(want!==e.ci){const old=e.g;scene.remove(old);e.g=makeAvatar(want);e.ci=want;scene.add(e.g);e.g.visible=old.visible&&i!==V.my;if(i===V.my)e.g.visible=false;}});
  const seen=new Set();
  for(const b of S.bd){seen.add(b[0]);if(!V.bodies.has(b[0])){
      const g=makeAvatar(V.roster[b[0]].c);const wrap=new THREE.Group();g.rotation.x=-Math.PI/2;g.position.set(0,.24,0);wrap.add(g);
      const pool=new THREE.Mesh(new THREE.CircleGeometry(1.1,18),bodyMat);pool.rotation.x=-Math.PI/2;pool.position.y=.03;wrap.add(pool);
      wrap.position.set(b[1],b[2],b[3]);wrap.rotation.y=b[4];scene.add(wrap);V.bodies.set(b[0],wrap);wrap.userData={x:b[1],y:b[2],z:b[3],i:b[0]};}}
  for(const [k,m] of V.bodies)if(!seen.has(k)){scene.remove(m);V.bodies.delete(k);}
  const zs=new Set();
  for(const z of S.zn){zs.add(z[0]);if(!V.zones.has(z[0])){
      const [id,type,x,zz,y,r]=z;let m;
      if(type==='smoke'){m=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),new THREE.MeshBasicMaterial({color:0x8a8f99,transparent:true,opacity:.78,depthWrite:false}));m.position.set(x,y+1.2,zz);}
      else if(type==='gum'){m=new THREE.Mesh(new THREE.SphereGeometry(1.15,14,10),new THREE.MeshLambertMaterial({color:0xff6bd0,emissive:0x5a1248}));m.position.set(x,y+1.15,zz);}
      else if(type==='paint'||type==='acid'){const col=type==='paint'?pick([0xf2d21f,0xe0507a,0x50b0f0]):0x60ff50;m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.05,14),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.7}));m.position.set(x,y+.05,zz);}
      else if(type==='drone'){m=new THREE.Mesh(new THREE.BoxGeometry(.3,.12,.3),new THREE.MeshBasicMaterial({color:0x1fd6a8}));m.position.set(x,y+2.2,zz);}
      else if(type==='beacon'){m=new THREE.Group();const c=new THREE.Mesh(new THREE.CylinderGeometry(.08,.14,1.0,6),new THREE.MeshBasicMaterial({color:0x9adf3a}));c.position.y=.5;m.add(c);m.position.set(x,y,zz);}
      else if(type==='decoy'){m=makeAvatar(z[7]);m.position.set(x,y,zz);}
      else if(type==='speaker'){m=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(.9,1.4,.6),new THREE.MeshLambertMaterial({color:0x16161a}));b.position.y=.7;m.add(b);const c=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.05,10),new THREE.MeshBasicMaterial({color:0xc080ff}));c.rotation.x=Math.PI/2;c.position.set(0,.9,.32);m.add(c);m.position.set(x,y,zz);}
      else{m=new THREE.Group();const dm=new THREE.MeshBasicMaterial({color:0x111111});for(let i=0;i<40;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(.05,4,4),dm);s.position.set(rnd(-r,r),rnd(.2,2),rnd(-r,r));m.add(s);}m.position.set(x,y,zz);}
      fxGroup.add(m);const rec={m,type,x,z:zz,y,r};
      if(type==='gum'&&V.mode==='client')rec.col=addCol(x-1.1,y,zz-1.1,x+1.1,y+2.4,zz+1.1,true);
      V.zones.set(id,rec);}}
  for(const [k,z] of V.zones)if(!zs.has(k)){fxGroup.remove(z.m);if(z.col){const i=COL.indexOf(z.col);if(i>=0)COL.splice(i,1);}V.zones.delete(k);}
  for(const e of S.ev){if(e.i<=V.lastEv)continue;V.lastEv=Math.max(V.lastEv,e.i);onEvent(e);}
  if(S.ov&&!V.over){V.over=true;V.ov=S.ov;V.ro=S.ro;setTimeout(showEnd,2200);}
}
function applyFurn(f,s){f.s=s;const b=f.box[s];f.c.x0=b[0];f.c.z0=b[1];f.c.x1=b[2];f.c.z1=b[3];}
function flashScreen(css,op,ms){const f=$('#fx');f.style.background=css;f.style.opacity=op;f._hold=performance.now()+ms;setTimeout(()=>{if(performance.now()>=f._hold-5){f.style.opacity=0;}},ms);}
function onEvent(e){
  if(e.k==='s'){
    sfx(e.s,e.x,e.z,e.y,e.r);
    if(e.s==='rg'){const d=Math.hypot(e.x-ME.x,e.z-ME.z);if(d<e.r){showPing(Math.atan2(-(e.x-ME.x),-(e.z-ME.z)));banner('Attaque à distance !',1800);SHAKE.a=Math.max(SHAKE.a,.05);}}
    if(e.s==='alarm'&&Math.hypot(e.x-ME.x,e.z-ME.z)<e.r)banner(V.snap&&V.snap.ph>=1?'Alarme !':'Sécurisation terminée',1800);
    if(e.s==='sab'&&Math.hypot(e.x-ME.x,e.z-ME.z)<e.r)logMsg('Un sabotage a été entendu au loin.',1);
    if(e.s==='shot'&&Math.hypot(e.x-ME.x,e.z-ME.z)<e.r){showPing(Math.atan2(-(e.x-ME.x),-(e.z-ME.z)));logMsg('Un coup de feu !',1);}
    if(['piano','gramo','bell','tv'].includes(e.s)&&Math.hypot(e.x-ME.x,e.z-ME.z)<e.r){showPing(Math.atan2(-(e.x-ME.x),-(e.z-ME.z)));logMsg('Un bruit vient de '+({piano:'un piano',gramo:'un gramophone',bell:'une cloche',tv:'un téléviseur'})[e.s]+'.');}
  }else if(e.k==='m'){if(e.to===-1||e.to===V.my)logMsg(e.t,e.b);}
  else if(e.k==='h'){if(e.to===V.my){const h=$('#hitm');h.style.opacity=1;h.style.transform='translate(-50%,-50%) scale(1.25)';setTimeout(()=>{h.style.opacity=0;h.style.transform='translate(-50%,-50%) scale(1)';},260);}}
  else if(e.k==='f')onFx(e);
}
function onFx(e){
  const d=Math.hypot(e.x-ME.x,e.z-ME.z)+Math.abs(e.y-ME.y)*1.5;
  switch(e.f){
    case'kill':{
      V.killT=performance.now();burst(e.x,e.y+1.1,e.z,50,[0xb01020,0xe02030,0x7a0a14],4.5,9,1.1,.06,2.5);burst(e.x,e.y+.2,e.z,14,0x7a0a14,2,4,1.6,.09,1);
      flashLight.position.set(e.x,e.y+1.3,e.z);flashLight.intensity=3.2;ring(e.x,e.y,e.z,0xe02030,3.4);
      if(e.v===V.my){
        banner('VOUS AVEZ ÉTÉ ASSASSINÉ',3600,'kill');flashScreen('radial-gradient(circle,rgba(150,0,16,.7),#2a0008 85%)',1,1700);SHAKE.a=.22;
        const k=V.ents[e.by];if(k){ME.look={x:k.x,z:k.z,t:2.6};}
        if(AU.ctx)sfx('scream',ME.x,ME.z,ME.y,99,1);
      }else if(e.by===V.my){
        banner('ASSASSINAT',2200,'kill');flashScreen('radial-gradient(circle,transparent 35%,rgba(226,57,74,.55))',1,520);SHAKE.a=.08;
      }else if(d<17&&los(ME.x,ME.z,ME.y,e.x,e.z,e.y)&&PV&&PV.al){
        banner('ASSASSINAT !',2400,'kill');flashScreen('radial-gradient(circle,transparent 30%,rgba(226,57,74,.6))',1,650);SHAKE.a=.16;sfx('scream',e.x,e.z,e.y,30,1);
        logMsg('Vous venez de voir un meurtre !',1);
      }else if(d<38){logMsg('Un cri déchirant retentit au loin…',1);sfx('scream',e.x,e.z,e.y,38,.8);}
      break;}
    case'slash':{const a=e.yw||0,fx=-Math.sin(a),fz=-Math.cos(a);
      for(let i=-4;i<=4;i++){const t=i/4*.9;burst(e.x+fx*1.0+Math.cos(a)*t,e.y+1.2-Math.abs(t)*.3,e.z+fz*1.0-Math.sin(a)*t,1,e.rg?0xe02030:0xffffff,1,0,.28,.07);}
      if(d<14)sfx('slash',e.x,e.z,e.y,14,1);break;}
    case'stun':burst(e.x,e.y+2.2,e.z,18,[0xffe040,0xffffff],2.4,3,.9,.06,2);ring(e.x,e.y,e.z,0xffe040,2);sfx('hit',e.x,e.z,e.y,16,1);break;
    case'aura':burst(e.x,e.y+.2,e.z,26,e.c||0xffffff,2.2,-1.5,1.1,.09,1.8);ring(e.x,e.y,e.z,e.c||0xffffff,2.8);sfx('chime',e.x,e.z,e.y,16,.7);break;
    case'bar':burst(e.x,e.y+1.3,e.z,20,[0x8a6a3a,0x5a4a2a],2.4,6,.9,.1,1);break;
    case'note':burst(e.x,e.y,e.z,14,[0xffe0a0,0xff9ac0,0x9ad0ff],1.4,-1.2,1.6,.1,1.2);break;
    case'shot':flashLight.position.set(e.x,e.y+1.4,e.z);flashLight.color.setHex(0xffe0a0);flashLight.intensity=3;setTimeout(()=>flashLight.color.setHex(0xff2030),200);burst(e.x,e.y+1.4,e.z,14,0xffc060,5,0,.25,.08);break;
    case'neut':burst(e.x,e.y+1,e.z,40,[0x60a0ff,0xffffff],5,2,1.2,.1,2.5);ring(e.x,e.y,e.z,0x60a0ff,4);banner('MEURTRIER NEUTRALISÉ',3000,'ok');flashScreen('radial-gradient(circle,transparent 30%,rgba(90,160,255,.5))',1,700);break;
  }
}
