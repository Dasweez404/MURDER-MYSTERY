
/* ============================ input ============================ */
const K={};let mapOpen=false,helpOpen=false;
const isHostLocal=()=>V.mode==='solo'||V.mode==='host';
function sendAct(a){
  if(!V.on)return;
  if(isHostLocal()){if(G)hostAct(G.P[V.my],a);}
  else if(NET.nr)NET.nr.emit('act',a).catch(()=>{});
}
function locked(){return document.pointerLockElement===gl;}
function tryLock(){if(V.noLock||!gl.requestPointerLock)return;try{const r=gl.requestPointerLock();if(r&&r.catch)r.catch(()=>{V.noLock=true;});}catch(e){V.noLock=true;}}
document.addEventListener('pointerlockerror',()=>{V.noLock=true;});
document.addEventListener('mousemove',e=>{
  if(!V.on||!locked()||MG.on||mapOpen||V.revealOn||(ME.look&&ME.look.t>0))return;
  ME.yaw-=e.movementX*.0022;ME.pit=clamp(ME.pit-e.movementY*.0022,-1.45,1.45);
});
gl.addEventListener('click',()=>{audioInit();if(V.on&&!locked())tryLock();});
$('#resume').addEventListener('click',()=>{audioInit();tryLock();});
addEventListener('contextmenu',e=>{if(V.on)e.preventDefault();});
addEventListener('mousedown',e=>{
  if(!V.on||!PV||MG.on||mapOpen||V.revealOn||(!locked()&&!V.noLock))return;audioInit();
  const a={yw:ME.yaw,pt:ME.pit};
  if(e.button===0){
    if(PV.r==='m'&&PV.al){a.t='atk';sendAct(a);VM.atk=1;if(PV.ca<=0)SHAKE.a=Math.max(SHAKE.a,.03);}
    else if(PV.al&&CHARS[PV.c].p){a.t='pr';sendAct(a);VM.atk=.6;pulseAb('cp');}
  }else if(e.button===2&&PV.r==='m'&&PV.al){a.t='rg';sendAct(a);VM.atk=.8;pulseAb('cg');}
});
function toggleHelp(force){
  helpOpen=force===undefined?!helpOpen:force;$('#help').style.display=helpOpen?'block':'none';
  try{localStorage.setItem('mm_help',helpOpen?'1':'0');}catch(e){}
  if(helpOpen)renderHelp();
}
$('#helpbtn').addEventListener('click',()=>toggleHelp());
$('#reveal').addEventListener('click',()=>closeReveal());
addEventListener('keydown',e=>{
  if(!V.on)return;
  if(e.target&&e.target.tagName==='INPUT')return;
  if(e.code==='Tab'||e.code==='Space'||e.code.startsWith('Arrow'))e.preventDefault();
  if(V.revealOn){closeReveal();return;}
  if(e.repeat&&!(MG.on))return;
  K[e.code]=true;
  if(e.key&&e.key.toLowerCase()==='m'){mapOpen=!mapOpen;$('#mapov').style.display=mapOpen?'grid':'none';if(mapOpen)drawMap();return;}
  if(e.code==='Tab'||e.code==='KeyH'){toggleHelp();return;}
  if(e.code==='KeyP'){togglePix();return;}
  if(MG.on){mgKey(e);return;}
  if(e.code==='KeyE')pressE();
  if(!PV||!PV.al)return;
  if(e.code==='KeyQ'){sendAct({t:'q',yw:ME.yaw,pt:ME.pit});pulseAb('cq');}
  if(e.code==='KeyF'){sendAct({t:'f',yw:ME.yaw,pt:ME.pit});pulseAb('cf');}
  if(e.code==='KeyR'&&PV.r==='m'){sendAct({t:'sab'});pulseAb('cs');}
  if(e.code==='KeyG'&&CHARS[PV.c].p){sendAct({t:'pr',yw:ME.yaw,pt:ME.pit});VM.atk=.6;pulseAb('cp');}
});
addEventListener('keyup',e=>{K[e.code]=false;});
addEventListener('blur',()=>{for(const k in K)K[k]=false;});
function pulseAb(key){const el=$('#abil').querySelector(`[data-k="${key}"]`);if(!el)return;el.classList.remove('pulse');void el.offsetWidth;el.classList.add('pulse');}

/* ============================ role reveal / help panel ============================ */
function abilityLines(){
  const c=CHARS[PV.c],L=[];
  if(PV.r==='m'){L.push(['Clic G','Assassinat silencieux (portée 2 m, visible seulement des témoins)'],['Clic D','Attraper à distance : bruyant, recharge 14 s'],['R','Saboter l’objectif proche (recharge 25 s)']);}

  if(c.p)L.push([PV.r==='m'?'G':'G / Clic G',c.passive]);
  L.push(['A / Q',c.q.n+' — '+c.q.d],['F',c.f.n+' — '+c.f.d]);
  return L;
}
function showReveal(){
  const c=CHARS[PV.c],m=PV.r==='m';
  $('#rvK').textContent='VOTRE RÔLE';$('#rvR').textContent=m?'Meurtrier':'Innocent';$('#rvR').style.color=m?'var(--blood)':'var(--ok)';
  $('#rvC').innerHTML=`<i style="background:${c.css}"></i>${esc(c.n)} · ${CATS[c.cat]}`;
  $('#rvG').textContent=m?'Éliminez les innocents avant qu’ils ne s’échappent. Isolez vos cibles, sabotez les objectifs, bluffez. Vous pourrez frapper après 20 s.'
    :'Sécurisez 5 des 7 objectifs actifs, ouvrez les sorties au levier puis faites sortir des invités par 2 sorties différentes. Ou neutralisez le meurtrier.';
  $('#rvA').innerHTML=abilityLines().map(l=>`<div><b>${esc(l[0])}</b>${esc(l[1])}</div>`).join('')+(c.p?'':`<div><b>Passif</b>${esc(c.passive)}</div>`);
  $('#reveal').style.display='grid';V.revealOn=true;V.revealT=performance.now();
  if(document.exitPointerLock&&locked())document.exitPointerLock();
}
function closeReveal(){if(!V.revealOn)return;V.revealOn=false;$('#reveal').style.display='none';tryLock();}
function renderHelp(){
  if(!PV||!V.snap)return;
  const c=CHARS[PV.c],m=PV.r==='m',S=V.snap,lvn=y=>y<-2?'Sous-sol':y>2?'Étage':'RDC';
  const obj=OBJS.map((o,i)=>{const s=S.ob[i],col=s===1?'#58c48a':s===2?'#e2394a':s===3?'#666':'#f0a23a',t=s===1?'sécurisé':s===2?'saboté':s===3?'hors tension':'à tenter';
    return `<div class="ol"><i style="background:${col}"></i><span>${esc(o.n)} <span style="color:var(--dim)">· ${lvn(o.y)} · ${t}</span></span></div>`;}).join('');
  $('#help').innerHTML=`<h4>Votre rôle</h4><div class="rl"><span class="sw" style="background:${c.css}"></span><div><div class="rn" style="color:${m?'var(--blood)':'var(--ok)'}">${m?'Meurtrier':'Innocent'}</div><div style="font-size:13px;color:var(--dim)">${esc(c.n)} · ${CATS[c.cat]} — la couleur de peau est votre rôle</div></div></div>
  <h4>But</h4><div style="font-size:13px">${m?'Tuer ou isoler les innocents, saboter les objectifs, empêcher 2 sorties différentes.':'5 objectifs sur 7 actifs → ouvrir des sorties au levier → 2 sorties différentes utilisées. Ou neutraliser le meurtrier (fusil, ou l’assommer puis le menotter).'}</div>
  <h4>Capacités</h4><div class="ab2">${abilityLines().map(l=>`<b>${esc(l[0])}</b><span>${esc(l[1].split(' — ')[0])}</span><em>${esc(l[1].split(' — ')[1]||'')}</em>`).join('')}${c.p?'':`<b>Passif</b><span>${esc(c.passive)}</span>`}</div>
  <h4>Objectifs (10 lieux, 7 actifs)</h4>${obj}
  <h4>Astuces</h4><ul><li>Éteignez les lumières (interrupteurs) pour vous cacher ou piéger.</li><li>Courir fait du bruit ; accroupi, on s’entend à peine.</li><li>Piano, gramophone, cloche : des leurres sonores.</li><li>Deux escaliers montent, deux descendent.</li></ul>`;
}

/* ============================ interactions ============================ */
let CAND=null,HOLD={on:false,kind:'',i:0,t:0,dur:0};
function fwv(){return[-Math.sin(ME.yaw),-Math.cos(ME.yaw)];}
function findInteract(){
  if(!PV||!V.snap||PV.hd>=0)return null;
  const fw=fwv(),out=[],S=V.snap;
  const add=(kind,i,x,z,y,maxd,label,hold)=>{
    const dx=x-ME.x,dz=z-ME.z,d=Math.hypot(dx,dz);if(d>maxd||Math.abs(y-ME.y)>2.3)return;
    const c=(dx*fw[0]+dz*fw[1])/(d||1);if(d>1&&c<.3)return;out.push({kind,i,d,score:d-c*1.5,label,hold});
  };
  const ghost=!PV.al;
  if(!ghost){
    WORLD.doors.forEach((d,i)=>{if(d.state<3)add('door',i,d.cx,d.cz,d.y,2.5,d.state===2?'Porte barricadée':d.state===0?'Fermer la porte':'Ouvrir la porte');});
    WORLD.fuses.forEach((f,i)=>{if(f.broken)add('repf',i,f.x,f.z,f.y,2.6,'Boîte à fusibles : rétablir le courant',true);});
    WORLD.wins.forEach((w,i)=>add('win',i,w.cx,w.cz,0,2.2,w.state?'Ouvrir la fenêtre':'Fermer la fenêtre'));
    WORLD.furn.forEach((f,i)=>{const b=f.box[f.s];add('furn',i,(b[0]+b[2])/2,(b[1]+b[3])/2,f.y,3,'Déplacer : '+f.n);});
    WORLD.hides.forEach((h,i)=>add('hide',i,h.x,h.z,h.y,1.9,'Se cacher (10 s max)'));
    WORLD.switches.forEach((s,i)=>add('sw',i,s.x,s.z,s.y,2.1,((S.lt>>s.room)&1)?'Éteindre la lumière':'Allumer la lumière'));
    WORLD.noise.forEach((n,i)=>add('noise',i,n.def.x,n.def.z,n.def.y,2.4,'Jouer : '+n.def.n+' (bruyant)'));
    WORLD.vents.forEach((v,i)=>add('vent',i,v.cx,v.cz,v.y,2.0,v.open?'Refermer la grille de ventilation':'Ouvrir la grille de ventilation (passage accroupi)'));
    WORLD.tlamps.forEach((l,i)=>add('tl',i,l.x,l.z,l.y,2.2,((S.tl>>i)&1)?'Éteindre : '+l.n:'Allumer : '+l.n));
    WORLD.tports.forEach((t,i)=>{for(const e of [t.def.a,t.def.b])add('tport',i,e.x,e.z,e.y,2.3,t.def.n+' : utiliser');});
    WORLD.doors.forEach((d,i)=>{if(d.state===3)add('repd',i,d.cx,d.cz,d.y,2.6,'Porte coincée : forcer / réparer',true);});
    WORLD.exits.forEach((e,i)=>{if(e.jam&&e.active&&S.ph>=1)add('repl',i,e.lx,e.lz,0,2.4,'Levier coincé : réparer',true);});
    if(PV.rv&&CHARS[PV.c].k==='med')for(const [id,b] of V.bodies)add('rev',id,b.userData.x,b.userData.z,b.userData.y,2.6,'Réanimer ce corps',true);
  }
  OBJS.forEach((d,i)=>{const st=S.ob[i];
    if(st===1)return;
    if(st===3){add('dud',i,d.x,d.z,d.y,2.2,'Hors tension');return;}
    if(st===2){add('rep',i,d.x,d.z,d.y,2.3,ghost?'Réparer (fantôme)':'Réparer le sabotage',true);return;}
    add('obj',i,d.x,d.z,d.y,2.3,(PV.r==='m'?'Faire semblant : ':'Sécuriser : ')+d.n);});
  if(!ghost&&S.ph>=1)WORLD.exits.forEach((e,i)=>{if(e.active&&!e.open)add('lev',i,e.lx,e.lz,0,2.3,'Actionner le levier : '+e.n,true);});
  if(!ghost&&PV.r!=='m')S.pl.forEach((q,i)=>{if(i===V.my||(q[0]&1)||(q[0]&2))return;if(q[0]&4)add('bind',i,q[1],q[3],q[2],2.4,'Menotter l’invité assommé',true);});
  out.sort((a,b)=>a.score-b.score);return out[0]||null;
}
function holdDur(c){
  const k=CHARS[PV.c].k,gk=k==='gee'?.5:1;
  if(c.kind==='rep')return (k==='ing'?2.5:6)*gk;if(c.kind==='repf')return (k==='ing'?2.5:5)*gk;if(c.kind==='repd')return (k==='ing'?1.5:3.5)*gk;if(c.kind==='repl')return (k==='ing'?2.5:5)*gk;
  if(c.kind==='lev')return 5;if(c.kind==='bind')return 2;if(c.kind==='rev')return 4;return 4;}
function pressE(){
  if(!PV||!V.snap)return;
  if(PV.hd>=0){sendAct({t:'hide',i:PV.hd});return;}
  const c=findInteract();if(!c)return;
  switch(c.kind){
    case'door':case'win':case'furn':case'hide':case'sw':case'noise':case'vent':case'tl':case'tport':sendAct({t:c.kind,i:c.i});break;
    case'dud':logMsg('Ce panneau est hors tension.',1);break;
    case'obj':mgStart(c.i);break;
    default:if(c.hold)HOLD={on:true,kind:c.kind,i:c.i,t:0,dur:holdDur(c)*(PV.al?1:2)};
  }
}
function updateHold(dt){
  const bar=$('#prog');
  if(!HOLD.on){bar.style.display='none';return;}
  const c=CAND;
  if(!K.KeyE||!c||c.kind!==HOLD.kind||c.i!==HOLD.i||!PV||PV.st>0){HOLD.on=false;bar.style.display='none';return;}
  HOLD.t+=dt;bar.style.display='block';bar.firstElementChild.style.width=Math.min(100,HOLD.t/HOLD.dur*100)+'%';
  if(HOLD.t>=HOLD.dur){const h=HOLD;HOLD.on=false;bar.style.display='none';sendAct({t:({rep:'rep',repf:'repf',repd:'repd',repl:'repl',lev:'lev',rev:'rev'})[h.kind]||'bind',i:h.i});}
}

/* ============================ mini-games ============================ */
const MG={on:false};
function mgStart(i){
  if(!PV||PV.st>0)return;
  const d=OBJS[i],st=V.snap.ob[i];if(st!==0)return;
  MG.on=true;MG.i=i;MG.type=d.t;MG.t=0;MG.prog=0;
  sendAct({t:'try',i});
  const box=$('#mgbox'),info=MG_INFO[d.t];
  box.innerHTML=`<h3>${d.n}</h3><p>${info[1]}</p><div id="mgbody"></div><div class="note">Échap pour annuler${PV.r==='m'?' · vous pouvez faire semblant, rien ne sera validé':''}</div>`;
  $('#mg').style.display='grid';
  if(document.exitPointerLock&&locked())document.exitPointerLock();
  const b=$('#mgbody');
  if(d.t==='hold'){b.innerHTML='<div id="mgb" style="height:22px"><i style="left:0;width:0;background:var(--brass);opacity:1"></i></div>';MG.need=(PV.al?4:8)*(CHARS[PV.c].k==='gee'?.5:1);}
  else if(d.t==='seq'){MG.seq=Array.from({length:5},()=>ri(4));MG.pos=0;MG.show=2.4;b.innerHTML='<div class="seqrow" id="seqrow"></div><div id="seqmsg" class="note"></div>';drawSeq();}
  else{MG.hits=0;MG.x=0;MG.dir=1;MG.zone=[.38,.62];b.innerHTML='<div id="mgb"><i id="mgz"></i><b id="mgc"></b></div><div id="mgh" class="note">0 / 3</div>';drawTime();}
}
const ARR=['↑','←','↓','→'],ARRK={KeyW:0,ArrowUp:0,KeyA:1,ArrowLeft:1,KeyS:2,ArrowDown:2,KeyD:3,ArrowRight:3};
function drawSeq(){const r=$('#seqrow');if(!r)return;r.innerHTML=MG.seq.map((s,i)=>`<span class="${i<MG.pos?'ok':''}">${MG.show>0||i<MG.pos?ARR[s]:'·'}</span>`).join('');}
function drawTime(){const z=$('#mgz');if(!z)return;z.style.left=MG.zone[0]*100+'%';z.style.width=(MG.zone[1]-MG.zone[0])*100+'%';$('#mgh').textContent=MG.hits+' / 3';}
function mgClose(msg){MG.on=false;$('#mg').style.display='none';if(msg)logMsg(msg,1);if(V.on&&!V.noLock&&!mapOpen)tryLock();}
function mgComplete(){sendAct({t:'obj',i:MG.i});if(PV.r==='m')logMsg('Vous faites semblant de travailler…');mgClose();}
function mgKey(e){
  if(e.code==='Escape'){mgClose();return;}
  if(MG.type==='seq'&&MG.show<=0&&e.code in ARRK){
    if(ARRK[e.code]===MG.seq[MG.pos]){MG.pos++;if(MG.pos>=MG.seq.length)mgComplete();}
    else{MG.pos=0;MG.show=1.6;$('#seqmsg').textContent='Erreur : regardez à nouveau.';}
    drawSeq();
  }else if(MG.type==='time'&&e.code==='Space'){
    if(MG.x>=MG.zone[0]&&MG.x<=MG.zone[1]){MG.hits++;const w=(MG.zone[1]-MG.zone[0])*.72,c=rnd(.25,.75);MG.zone=[c-w/2,c+w/2];if(MG.hits>=3){mgComplete();return;}}
    else{MG.hits=0;MG.zone=[.38,.62];}
    drawTime();
  }
}
function mgUpdate(dt){
  if(!MG.on)return;
  const st=V.snap.ob[MG.i];
  if(st!==0){mgClose(st===3?'Ce panneau est hors tension.':st===2?'Le panneau vient d’être saboté !':'Déjà sécurisé.');return;}
  if(PV.st>0||hyp(ME.x,ME.z,OBJS[MG.i].x,OBJS[MG.i].z)>3.5){mgClose('Vous vous êtes éloigné.');return;}
  if(MG.type==='hold'){
    if(K.KeyE)MG.t+=dt;else MG.t=Math.max(0,MG.t-dt*1.5);
    const i=$('#mgb i');if(i)i.style.width=Math.min(100,MG.t/MG.need*100)+'%';
    if(MG.t>=MG.need)mgComplete();
  }else if(MG.type==='seq'){
    if(MG.show>0){MG.show-=dt;if(MG.show<=0){drawSeq();const m=$('#seqmsg');if(m)m.textContent='À vous : saisissez la séquence.';}}
  }else{
    MG.x+=MG.dir*dt*(.55+MG.hits*.12);if(MG.x>1){MG.x=1;MG.dir=-1;}if(MG.x<0){MG.x=0;MG.dir=1;}
    const c=$('#mgc');if(c)c.style.left=`calc(${MG.x*100}% - 2px)`;
  }
}

/* ============================ local player ============================ */
function moveMe(dt){
  if(!PV)return;
  const hidden=PV.hd>=0,frozen=PV.st>0||MG.on||hidden||!V.on||V.over||PV.es||V.revealOn;
  if(PV.tp!==ME.tpN){ME.tpN=PV.tp;if(PV.tt){ME.x=PV.tt[0];ME.y=PV.tt[1];ME.z=PV.tt[2];ME.vy=0;}}
  if(ME.look&&ME.look.t>0){ // death cam: turn toward the killer
    ME.look.t-=dt;const ty=Math.atan2(-(ME.look.x-ME.x),-(ME.look.z-ME.z));ME.yaw+=angDiff(ty,ME.yaw)*clamp(dt*6,0,1);ME.pit=lerp(ME.pit,-.1,clamp(dt*4,0,1));
  }
  const look=(K.ArrowLeft?1:0)-(K.ArrowRight?1:0),lookv=(K.ArrowUp?1:0)-(K.ArrowDown?1:0);
  if(!MG.on&&!V.revealOn){ME.yaw+=look*dt*2.2;ME.pit=clamp(ME.pit+lookv*dt*1.6,-1.45,1.45);}
  let crouch=!!((K.ControlLeft||K.KeyC)&&!hidden);
  if(!crouch&&ME.h<1.6){for(const c of COL){if(!c.on||c.y0>=ME.y+1.7||c.y1<=ME.y+.05)continue;const nx=clamp(ME.x,c.x0,c.x1),nz=clamp(ME.z,c.z0,c.z1);if(Math.hypot(ME.x-nx,ME.z-nz)<.36){crouch=true;break;}}}
  ME.h=crouch?1.05:1.7;ME.gs=CHARS[PV.c].k==='spa'?.45:1;
  ME.crouch=lerp(ME.crouch,crouch?1:0,clamp(dt*12,0,1));ME.eye=lerp(1.6,1.1,ME.crouch);
  let fl=crouch?1:0,moving=false;
  if(hidden){const h=WORLD.hides[PV.hd];ME.x=h.x;ME.z=h.z;ME.y=h.y;ME.eye=1.5;ME.fl=8;return false;}
  if(!frozen){
    const inv=PV.ix>0?-1:1,f=((K.KeyW?1:0)-(K.KeyS?1:0))*inv,r=((K.KeyD?1:0)-(K.KeyA?1:0))*inv,m=Math.hypot(f,r);
    if(m>0){
      const run=K.ShiftLeft&&!crouch,ath=CHARS[PV.c].k==='ath';
      let sp=crouch?(ath?3.1:BASE.crouch):run?BASE.run:BASE.walk;
      sp*=PV.sp*(PV.r==='m'?1.05:1)*(PV.al?1:.85);
      const fx=-Math.sin(ME.yaw),fz=-Math.cos(ME.yaw),rx=Math.cos(ME.yaw),rz=-Math.sin(ME.yaw);
      const dx=(fx*f+rx*r)/m*sp*dt,dz=(fz*f+rz*r)/m*sp*dt;
      moveEnt(ME,dx,dz);if(run)fl|=2;moving=true;ME.step+=Math.hypot(dx,dz);
      const interval=run?1.7:1.2;if(!crouch&&ME.step>interval){ME.step=0;sfx(run?'run':'step',ME.x,ME.z,ME.y,run?6:4,.35);}
    }
    if(K.Space&&ME.vy===0&&ME.y-floorH(ME.x,ME.z,ME.y)<.02)ME.vy=CHARS[PV.c].k==='spa'?6.4:4.6;
  }
  stepVert(ME,dt);ME.fl=fl;return moving;
}
let lastPres=0;
function sendPresence(now){
  if(V.mode!=='client'||!NET.nr||now-lastPres<66)return;lastPres=now;
  NET.nr.presence({x:r2(ME.x),y:r2(ME.y),z:r2(ME.z),yw:r2(ME.yaw),pt:r2(ME.pit),fl:ME.fl,g:1}).catch(()=>{});
}

/* ============================ entities / world animation ============================ */
const FPstep=new Map();
function updateEnts(dt,t){
  if(!V.snap)return;
  const k=clamp(dt*13,0,1),exp=PV&&CHARS[PV.c].k==='exp';
  V.ents.forEach((e,i)=>{
    if(i===V.my)return;
    const px=e.x,pz=e.z;
    e.x=lerp(e.x,e.tx,k);e.y=lerp(e.y,e.ty,k);e.z=lerp(e.z,e.tz,k);e.yaw+=angDiff(e.tyaw,e.yaw)*k;
    const mv=Math.hypot(e.x-px,e.z-pz),sp=mv/Math.max(dt,.001),f=e.f;
    const dead=f&1,esc=f&2,hid=f&8,invis=f&16,stun=f&4,atk=f&256;
    e.g.visible=!dead&&!esc&&!hid&&!invis;
    e.g.position.set(e.x,e.y,e.z);e.g.rotation.y=e.yaw;
    const ud=e.g.userData,walking=sp>.4&&!stun;
    e.ph+=walking?dt*(sp>4?11:7):0;const sw=walking?Math.sin(e.ph)*(sp>4?.9:.55):0;
    ud.lL.rotation.x=sw;ud.lR.rotation.x=-sw;ud.aL.rotation.x=-sw*.8;ud.aR.rotation.x=sw*.8;
    e.g.scale.y=(f&64)?.72:.94;
    if(f&512){e.g.visible=!dead&&!esc&&!hid;e.g.rotation.x=-Math.PI/2;e.g.position.y=e.y+.24;}else e.g.rotation.x=0;
    if(stun){ud.aL.rotation.x=-2.6;ud.aR.rotation.x=-2.6;}
    if(atk){ud.aR.rotation.x=-2.0-Math.sin(t*30)*.4;ud.knife.visible=true;ud.knife.position.set(.38,1.05,-.45);}else ud.knife.visible=false;
    ud.stars.visible=!!stun;if(stun){ud.stars.rotation.y=t*5;ud.stars.children.forEach((s,j)=>{const a=j*2.09;s.position.set(Math.cos(a)*.35,Math.sin(t*4+j)*.06,Math.sin(a)*.35);});}
    if(ud.prop)ud.prop.rotation.y=t*14;
    const skinM=ud.head.material[0];if(f&128){skinM.emissive.setHex(0x553300);}else skinM.emissive.setHex(0);
    if(walking&&!dead&&!esc&&!hid&&!(f&64)&&!(f&512)){e.step+=mv;const run=sp>4.3,iv=run?1.7:1.2;if(e.step>iv){e.step=0;if(!run&&CHARS[V.roster[i].c].k==='rob')e.step=0;else sfx(run?'run':'step',e.x,e.z,e.y,run?20:9,run?.9:.6);}}
    if(exp&&walking&&!dead&&!esc&&!hid){const a=FPstep.get(i)||{x:e.x,z:e.z,s:0};const d=hyp(a.x,a.z,e.x,e.z);
      if(d>.85){FPstep.set(i,{x:e.x,z:e.z,s:a.s^1});addFootprint(e.x+Math.cos(e.yaw)*(a.s?.12:-.12),e.y,e.z-Math.sin(e.yaw)*(a.s?.12:-.12),e.yaw);}
      else if(!FPstep.has(i))FPstep.set(i,a);}
  });
  for(let j=FP.list.length-1;j>=0;j--){const f=FP.list[j];f.t+=dt;f.m.material.opacity=Math.max(0,.85-f.t/18);if(f.t>18){fxGroup.remove(f.m);f.m.material.dispose();FP.list.splice(j,1);}}
  for(const [id,b] of V.bodies){if(V.seenBody.has(id))continue;const u=b.userData;
    if(Math.abs(u.y-ME.y)<2&&hyp(u.x,u.z,ME.x,ME.z)<9&&los(ME.x,ME.z,ME.y,u.x,u.z,u.y)){V.seenBody.add(id);if(id!==V.my&&performance.now()-(V.killT||0)>3500){banner('Corps découvert !',2400,'kill');logMsg('Vous avez découvert un corps.',1);sfx('sting',ME.x,ME.z,ME.y,99);flashScreen('radial-gradient(circle,transparent 40%,rgba(226,57,74,.35))',1,500);}}}
  for(const d of WORLD.doors){const tg=d.state===0?1:0;d.ang=lerp(d.ang,tg,clamp(dt*8,0,1));d.pv.rotation.y=d.base-d.ang*Math.PI*.5;}
  for(const w of WORLD.wins){const tg=w.state?0:1;w.ang=lerp(w.ang,tg,clamp(dt*6,0,1));w.pv.rotation.y=w.base-w.ang*Math.PI*.45;}
  for(const f of WORLD.furn){const st=f.def.st[f.s],ps=f.pos;
    ps[0]=lerp(ps[0],st.x,clamp(dt*6,0,1));ps[1]=lerp(ps[1],st.z,clamp(dt*6,0,1));ps[2]+=angDiff(st.ry,ps[2])*clamp(dt*6,0,1);f.g.position.set(ps[0],f.y,ps[1]);f.g.rotation.y=ps[2];}
  for(const e of WORLD.exits){e.py=lerp(e.py,e.open?2.7:0,clamp(dt*4,0,1));e.mesh.position.y=1.3+e.py;
    e.sign.material.color.setHex(e.open?(Math.sin(t*8)>0?0xff3030:0x60ff90):e.active?0x2fbf6a:0x662222);
    e.led.material.color.setHex(e.open?0x60ff90:e.active?0xf0a23a:0x552222);e.beam.material.opacity=.25+.12*Math.sin(t*3);}
  WORLD.objs.forEach(o=>{const s=o.state;
    o.lamp.material.color.setHex(s===1?0x58c48a:s===2?(Math.sin(t*9)>0?0xff2a3a:0x40101a):s===3?0x444444:0xf0a23a);
    o.scr.material.color.setHex(s===1?0x124a2e:s===2?0x5a1018:s===3?0x161616:0x5a4514);});
  for(const z of V.zones.values()){if(z.type==='gum')z.m.scale.setScalar(1+Math.sin(t*3+z.x)*.04);if(z.type==='smoke')z.m.rotation.y+=dt*.2;}
  for(let i=0;i<WORLD.fire.length;i++){const m=WORLD.fire[i],f=.65+.35*Math.sin(t*(11+i)+i*3)*Math.sin(t*23+i);
    if(m.material.color.getHex()!==undefined){const base=i===0?[1,.48,.19]:i===1?[1,.54,.19]:[.6,.7,1];m.material.color.setRGB(base[0]*f,base[1]*f,base[2]*f);}}
  for(const n of WORLD.noise)if(n.def.scr)n.def.scr.material.color.setRGB(.3+Math.random()*.3,.45+Math.random()*.3,.55+Math.random()*.4);
  WORLD.switches.forEach(s=>{const on=((V.snap.lt>>s.room)&1);s.mesh.material.color.setHex(on?0xeeeeee:0x333338);});
}

/* ============================ HUD ============================ */
function logMsg(t,bad){const m=$('#msgs'),d=document.createElement('div');d.textContent=t;if(bad)d.className='bad';m.appendChild(d);while(m.children.length>5)m.removeChild(m.firstChild);setTimeout(()=>d.remove(),7200);}
let bannerT=0;function banner(t,ms,kind){const b=$('#banner');b.textContent=t;b.className='hbox'+(kind?' '+kind:'');b.style.display='block';clearTimeout(bannerT);bannerT=setTimeout(()=>{b.style.display='none';},ms||2000);}
let pingT=0;function showPing(yawS){const p=$('#ping');p.style.display='block';const rel=angDiff(yawS,ME.yaw);p.style.transform=`rotate(${-rel}rad)`;clearTimeout(pingT);pingT=setTimeout(()=>{p.style.display='none';},2500);}
const abMax={};
function buildAbil(){
  const c=CHARS[PV.c],items=[];
  if(PV.r==='m')items.push(['LMB','Tuer','ca',1.2],['RMB','Attraper','cg',14],['R','Saboter','cs',25]);
  if(c.p)items.push(['G',c.p.n,'cp',c.p.cd]);
  items.push(['Q',c.q.n,'cq',c.q.cd],['F',c.f.n,'cf',60]);
  const box=$('#abil');box.innerHTML=items.map(it=>`<div class="ab" data-k="${it[2]}" title="${it[1]}"><b>${it[0]}</b><span>${it[1]}</span><i></i></div>`).join('');
  box._items=items;buildViewmodel(PV.c,PV.r==='m');
}
function updateHud(){
  if(!V.snap||!PV)return;const S=V.snap;
  const rem=Math.max(0,S.lim-S.t),mm=Math.floor(rem/60),ss=Math.floor(rem%60);
  $('#clock').textContent=`${mm}:${String(ss).padStart(2,'0')}`;
  $('#phase').textContent=S.ph===0?'PHASE 1 · SÉCURISATION':S.ph===1?'PHASE 2 · ÉVASION':'FIN';
  $('#pips').innerHTML=[0,1,2,3,4].map(i=>`<i class="${i<S.dn?'on':''}"></i>`).join('');
  const ex=S.ex,act=ex.filter(e=>e&1).length,used=ex.filter(e=>e&4).length;
  $('#objS').textContent=S.ph===0?`${S.dn}/5 · 7 actifs parmi 10 emplacements`:`Sorties utilisées : ${used}/2 (différentes) · ${act} actives`;
  const c=CHARS[PV.c];
  $('#roleR').textContent=PV.r==='m'?'Meurtrier':'Innocent';$('#roleR').className='r '+PV.r;
  $('#roleC').innerHTML=`<span style="display:inline-block;width:11px;height:11px;background:${c.css};border:1px solid #000;margin-right:6px"></span>${esc(c.n)}`;
  $('#alive').textContent=c.k==='jou'?`Vivants : ${S.al}`:'';
  const box=$('#abil');if(!box._items||box._sig!==PV.c+PV.r){box._sig=PV.c+PV.r;buildAbil();}
  box.querySelectorAll('.ab').forEach((el,idx)=>{const it=box._items[idx],key=it[2],rv=PV[key];
    if(key==='cf'&&rv<0){el.classList.add('used');el.lastChild.style.height='0';return;}
    const tot=Math.max(abMax[key]||it[3],rv);abMax[key]=tot;
    el.lastChild.style.height=Math.min(100,rv/tot*100)+'%';
    const off=(PV.si>0&&key!=='ca'&&key!=='cg'&&key!=='cs')||rv>0;
    el.classList.toggle('off',off);el.classList.toggle('rdy',!off);});
  const dd=$('#dead');dd.style.display=(!PV.al||PV.es)?'block':'none';
  if(PV.es){dd.firstElementChild.textContent='VOUS ÊTES SORTI';dd.firstElementChild.style.color='var(--ok)';dd.lastElementChild.textContent='Spectateur : il faut encore qu’une 2e sortie différente soit utilisée par un autre invité.';}
  else{dd.firstElementChild.textContent='VOUS ÊTES MORT';dd.firstElementChild.style.color='var(--blood)';dd.lastElementChild.textContent='Fantôme : vous pouvez encore avancer les objectifs (plus lentement). Plus de pouvoirs, plus de communication.';}
  gl.style.filter=(!PV.al)?'grayscale(.85) brightness(1.15)':'';
  const rm=roomAt(ME.x,ME.z,ME.y),dark=rm&&!((S.lt>>rm.idx)&1);
  $('#roomlbl').textContent=(rm?rm.n:'Jardin')+(dark?' · dans le noir':'');$('#dark').style.opacity=dark?1:.65;
  const fx=$('#fx'),now=performance.now();let bg='',op=0;
  if(PV.bl>0){bg='#fff';op=.96;}
  else{let inSmoke=false;for(const z of V.zones.values())if(z.type==='smoke'&&Math.abs(z.y-ME.y)<2&&hyp(z.x,z.z,ME.x,ME.z)<z.r)inSmoke=true;
    if(inSmoke){bg='#6b7079';op=.95;}else if(PV.st>0){bg='radial-gradient(circle,transparent 30%,rgba(120,0,20,.75))';op=1;}
    else if(PV.hd>=0){bg='radial-gradient(circle,rgba(0,0,0,.2) 10%,#000 75%)';op=1;}}
  if(!(fx._hold>now)){fx.style.background=bg;fx.style.opacity=op;}
  CAND=findInteract();const p=$('#prompt');
  if(PV.hd>=0){p.style.display='block';p.innerHTML='<kbd>E</kbd>Sortir de la cachette';}
  else if(CAND&&!MG.on&&!V.over){p.style.display='block';p.innerHTML=`<kbd>E</kbd>${CAND.label}${CAND.hold?' (maintenir)':''}`;}
  else p.style.display='none';
  if(PV.r==='m'&&S.t<20)$('#tip').textContent=`Vous pourrez frapper dans ${Math.ceil(Math.max(0,20-S.t))} s · Tab : capacités`;
  else $('#tip').textContent='M : plan · Tab : rôle & capacités · Échap : libérer la souris';
  $('#resume').style.display=(V.on&&!locked()&&!V.noLock&&!MG.on&&!mapOpen&&!V.over&&!V.revealOn)?'grid':'none';
  if(helpOpen&&(now-(V.helpT||0)>700)){V.helpT=now;renderHelp();}
}
const ovc=document.createElement('canvas');ovc.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';$('#hud').appendChild(ovc);
const ovx=ovc.getContext('2d'),tmpV=new THREE.Vector3();
function drawOverlay(){
  const w=ovc.clientWidth,h=ovc.clientHeight;if(ovc.width!==w||ovc.height!==h){ovc.width=w;ovc.height=h;}
  ovx.clearRect(0,0,w,h);
  if(!PV||!V.snap||PV.sc<=0||!PV.al)return;
  V.snap.pl.forEach((q,i)=>{if(i===V.my||(q[0]&3))return;
    tmpV.set(q[1],q[2]+1.9,q[3]).project(camera);if(tmpV.z>1)return;
    const x=(tmpV.x*.5+.5)*w,y=(-tmpV.y*.5+.5)*h;ovx.strokeStyle='#e8c060';ovx.lineWidth=3;ovx.beginPath();ovx.arc(x,y,14,0,7);ovx.stroke();
    ovx.fillStyle=CHARS[V.roster[i].c].css;ovx.beginPath();ovx.arc(x,y,7,0,7);ovx.fill();});
}

/* ============================ map (3 levels) ============================ */
function drawMap(){
  const c=$('#mapc'),x=c.getContext('2d'),W=c.width,H=c.height;x.clearRect(0,0,W,H);
  const s=8.1,oy=34,gap=26,pw=44*s;
  const S=V.snap;
  const panel=(ox,title,lv)=>{
    x.font='700 13px JetBrains Mono, monospace';x.textBaseline='top';x.fillStyle='#cfa750';x.fillText(title,ox,10);
    for(const r of ROOMS){if(r.lv!==lv||r.void)continue;
      const dark=S&&!((S.lt>>r.idx)&1);
      x.fillStyle=dark?'#0b0a10':'#1d1a26';x.strokeStyle='#4a4358';x.lineWidth=2;
      const rx=ox+r.x0*s,ry=oy+r.z0*s,rw=(r.x1-r.x0)*s,rh=(r.z1-r.z0)*s;x.fillRect(rx,ry,rw,rh);x.strokeRect(rx,ry,rw,rh);
      x.fillStyle='#9d97ab';x.font='600 10px Figtree, sans-serif';x.fillText(r.n,rx+4,ry+3);}
    x.fillStyle='#4a90c0';
    for(const d of DOORS){if(d.lv!==lv)continue;if(d.ax==='x')x.fillRect(ox+d.a*s,oy+d.f*s-2,(d.b-d.a)*s,4);else x.fillRect(ox+d.f*s-2,oy+d.a*s,4,(d.b-d.a)*s);}
    x.fillStyle='#8a6a48';for(const st of STAIRS){const la=st.ya<-2?-1:st.ya>2?1:0,lb=st.yb<-2?-1:st.yb>2?1:0;if(la===lv||lb===lv)x.fillRect(ox+st.x0*s,oy+st.z0*s,(st.x1-st.x0)*s,(st.z1-st.z0)*s);}
    OBJS.forEach((d,i)=>{if((d.y<-2?-1:d.y>2?1:0)!==lv)return;const st=S?S.ob[i]:0;x.fillStyle=st===1?'#58c48a':st===2?'#e2394a':st===3?'#666':'#f0a23a';
      x.beginPath();x.arc(ox+d.x*s,oy+d.z*s,5,0,7);x.fill();});
    if(lv===0&&S)EXITS.forEach((e,i)=>{const fl=S.ex[i];if(!(fl&1))return;const cx=e.ax==='x'?(e.a+e.b)/2:e.f,cz=e.ax==='x'?e.f:(e.a+e.b)/2;
      x.fillStyle=fl&2?'#ff5050':'#58c48a';x.fillRect(ox+cx*s-5,oy+cz*s-5,10,10);});
    if((ME.y<-2?-1:ME.y>2?1:0)===lv){x.fillStyle='#fff';x.beginPath();x.arc(ox+ME.x*s,oy+ME.z*s,6,0,7);x.fill();
      x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.moveTo(ox+ME.x*s,oy+ME.z*s);x.lineTo(ox+ME.x*s-Math.sin(ME.yaw)*18,oy+ME.z*s-Math.cos(ME.yaw)*18);x.stroke();}
  };
  panel(6,'SOUS-SOL',-1);panel(6+pw+gap,'REZ-DE-CHAUSSÉE',0);panel(6+2*(pw+gap),'ÉTAGE',1);
  x.font='500 11px JetBrains Mono, monospace';x.fillStyle='#9d97ab';x.fillText('objectifs : orange libre · vert fait · rouge saboté · gris hors tension   ▭ bleu portes   ■ sorties actives   ○ vous   pièce sombre = lumière éteinte',6,H-18);
}

/* ============================ main loop ============================ */
let lastT=performance.now(),hudT=0,simT=0,mapT=0;
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-lastT)/1000),t=now/1000;lastT=now;
  if(V.on&&PV){
    if(!V.revealed){V.revealed=true;showReveal();
      try{if(localStorage.getItem('mm_help')==='1')toggleHelp(true);}catch(e){}}
    if(V.revealOn&&now-V.revealT>9000)closeReveal();
    const moving=moveMe(dt);mgUpdate(dt);updateHold(dt);sendPresence(now);
    SHAKE.a=Math.max(0,SHAKE.a-dt*.35);const sh=SHAKE.a;
    camera.position.set(ME.x+(Math.random()-.5)*sh,ME.y+ME.eye+(PV.st>0?-.5:0)+(Math.random()-.5)*sh,ME.z+(Math.random()-.5)*sh);
    camera.rotation.set(ME.pit,ME.yaw,PV.st>0?.25:0);
    headlamp.intensity=PV.al?.5:.28;
    VM.g.visible=PV.al&&PV.hd<0&&!V.revealOn;updateViewmodel(dt,moving);
    updateEnts(dt,t);updateParticles(dt);
    updateLamps(ME.x,ME.y+1.6,ME.z,t,V.lt,V.tl,V.fz);
    hudT+=dt;if(hudT>.08){hudT=0;updateHud();}
    if(mapOpen){mapT+=dt;if(mapT>.3){mapT=0;drawMap();}}
    drawOverlay();
  }else if(!V.on){
    const a=t*.1;camera.position.set(22+Math.cos(a)*34,9,17+Math.sin(a)*28);camera.lookAt(22,1.5,17);
    updateLamps(22,1.6,17,t,-1,-1,0);VM.g.visible=false;updateParticles(dt);
  }
  renderer.render(scene,camera);
}
let hostLast=performance.now(),peerGone=new Map();
function getPos(p){
  if(p.i===V.my)return{x:ME.x,y:ME.y,z:ME.z,yw:ME.yaw,pt:ME.pit,fl:PV&&PV.hd>=0?(ME.fl|8):ME.fl};
  if(!NET.nr)return null;const q=NET.nr.peers().find(z=>z.peer===p.peer);
  if(!q){const t=peerGone.get(p.peer)||performance.now();peerGone.set(p.peer,t);if(performance.now()-t>4000){p.bot=true;say(null,'Un joueur a quitté : un bot prend sa place.',1);}return null;}
  peerGone.delete(p.peer);const s=q.presence;if(s.x===undefined)return null;return s;
}
function hostLoop(){
  if(!G||!isHostLocal()||!V.on)return;
  const now=performance.now(),dt=Math.min(.2,(now-hostLast)/1000);hostLast=now;
  const sub=Math.max(1,Math.ceil(dt/.05));for(let i=0;i<sub;i++)hostTick(dt/sub,getPos);
  const me=G.P[V.my];if(!me)return;
  simT+=dt;
  if(simT>=.1){simT=0;const S=snapshot();PV=pvFor(me);applySnap(S);
    if(V.mode==='host'&&NET.nr){if(JSON.stringify(S).length>3800)S.ev=S.ev.slice(-3);NET.nr.emit('st',S).catch(()=>{});
      if(now-(G.lastPv||0)>450){G.lastPv=now;const o={};G.P.forEach(p=>{if(!p.bot&&p.i!==V.my)o[p.i]=pvFor(p);});NET.nr.emit('pv',o).catch(()=>{});}}}
}
setInterval(hostLoop,50);
requestAnimationFrame(frame);
