
/* ============================ host simulation ============================ */
/* Runs on the solo player's tab or on the hosting player's tab. Clients only send inputs and render snapshots. */
let G=null;
const BASE={walk:3.4,run:5.6,crouch:1.7};
function ev(o){o.i=++G.eid;o.t0=G.t;G.evs.push(o);}
function snd(s,x,z,y,r){ev({k:'s',s,x:r1(x),z:r1(z),y:r1(y),r});}
function say(p,t,bad){ev({k:'m',to:p?p.i:-1,t,b:bad?1:0});}
const pd=(p,x,z)=>hyp(p.x,p.z,x,z);
const fwd=yw=>[-Math.sin(yw),-Math.cos(yw)];
function standPoint(d){const rm=roomAt(d.x,d.z,d.y)||ROOMS[0],cx=(rm.x0+rm.x1)/2,cz=(rm.z0+rm.z1)/2,dx=cx-d.x,dz=cz-d.z,l=Math.hypot(dx,dz)||1;return[d.x+dx/l*1.15,d.z+dz/l*1.15,d.y];}

function newGame(cfg){
  // cfg.humans: [{peer,name,pf:'i'|'n'|'m',ct:'fuite'|'enq'|'deb'|'any'}], cfg.total
  const humans=cfg.humans,total=clamp(cfg.total,Math.max(4,humans.length),15),P=[];
  const pool=shuffle(CHARS.map((c,i)=>i)),used=new Set();
  const take=ct=>{
    let c=pool.filter(i=>!used.has(i)&&(ct==='any'||CHARS[i].cat===ct));
    if(!c.length)c=pool.filter(i=>ct==='any'||CHARS[i].cat===ct);
    if(!c.length)c=pool;const i=pick(c);used.add(i);if(used.size>=CHARS.length)used.clear();return i;
  };
  humans.forEach(h=>P.push({peer:h.peer,name:h.name||'Invité',bot:false,pf:h.pf,ct:h.ct}));
  for(let i=humans.length;i<total;i++)P.push({peer:null,name:pick(['Alice','Bruno','Chloé','Damien','Elsa','Farid','Gaëlle','Hugo','Inès','Jules','Karim','Lola','Marius','Nina','Oscar'])+'*',bot:true,pf:'n',ct:'any'});
  // murderer vote: weight by preference
  const w=P.map(p=>p.pf==='m'?4:p.pf==='i'?.15:1),sum=w.reduce((a,b)=>a+b,0);let r=Math.random()*sum,mi=0;
  for(let i=0;i<P.length;i++){r-=w[i];if(r<=0){mi=i;break;}}
  P.forEach((p,i)=>{
    p.i=i;p.ch=take(p.ct);p.role=i===mi?'m':'i';
    const a=i/P.length*Math.PI*2;p.x=21.2+Math.cos(a)*3.0;p.z=15+Math.sin(a)*3.2;p.y=0;p.vy=0;p.yaw=a;p.pit=0;p.fl=0;
    p.alive=true;p.escaped=false;p.hidden=-1;p.hideU=0;p.hideCd=0;p.tpN=0;p.tpTo=null;
    p.stunU=0;p.silU=0;p.invisU=0;p.spU=0;p.spM=1;p.slU=0;p.slM=1;p.invU=0;p.shU=0;p.blU=0;p.scanU=0;
    p.cdQ=0;p.cdF=0;p.cdA=p.role==='m'?20:0;p.cdS=0;p.cdG=0;p.cdP=0;p.linked=-1;
    p.ai={path:[],pi:0,goal:null,replan:0,mode:'idle',wait:rnd(.5,3),work:null,knows:false,coolU:0,retarget:0,target:null,stuckT:0,lastX:p.x,lastZ:p.z,seenBody:0,fleeU:0,last:-1,lastShot:0};
  });
  const func=shuffle(OBJS.map((o,i)=>i)).slice(0,7),ea=shuffle([0,1,2,3,4]).slice(0,3);
  G={t:0,eid:0,evs:[],P,mur:P[mi],phase:0,over:false,win:null,why:'',limit:600,
    ob:OBJS.map((o,i)=>({st:0,func:func.includes(i),prev:0})),done:0,
    ea,exUsed:new Set(),zones:[],zid:0,bodies:[],links:[],nextPv:0,nextSnap:0,peerIdx:new Map(),
    started:Date.now()};
  P.forEach(p=>{if(p.peer)G.peerIdx.set(p.peer,p.i);});
  // reset world state
  WORLD.doors.forEach(d=>{d.state=1;d.col.on=true;d.barU=0;});
  WORLD.wins.forEach(w=>{w.state=1;w.col.on=true;});
  WORLD.exits.forEach((e,i)=>{e.active=ea.includes(i);e.open=false;e.used=false;e.col.on=true;});
  WORLD.furn.forEach(f=>{setFurn(f,0,true);});
  G.zones.forEach(z=>z.col&&(z.col.on=false));
  return G;
}
function setDoor(d,st){d.state=st;d.col.on=st!==0;snd('door',d.cx,d.cz,d.y,18);}
function setFurn(f,s,silent){
  f.s=s;const b=f.box[s];f.c.x0=b[0];f.c.z0=b[1];f.c.x1=b[2];f.c.z1=b[3];if(!silent)snd('door',f.box[s][0],f.box[s][1],0,16);
}
function aliveP(){return G.P.filter(p=>p.alive&&!p.escaped);}
function visibleTo(p,t){return t.alive&&!t.escaped&&t.hidden<0&&G.t>=t.invisU;}
function rayTarget(p,yw,range,cone,needAlive=true){
  const [fx,fz]=fwd(yw);let best=null,bd=1e9;
  for(const t of G.P){
    if(t===p||!t.alive||t.escaped||t.hidden>=0||Math.abs(t.y-p.y)>2)continue;
    const dx=t.x-p.x,dz=t.z-p.z,d=Math.hypot(dx,dz);if(d>range||d<.1)continue;
    const cos=(dx*fx+dz*fz)/d;if(cos<Math.cos(cone))continue;
    if(!los(p.x,p.z,p.y,t.x,t.z,t.y))continue;
    if(d<bd){bd=d;best=t;}
  }
  return best;
}
function stun(t,dur){if(G.t<t.invU)return false;t.stunU=Math.max(t.stunU,G.t+dur);return true;}
function tp(t,x,z,y){t.x=x;t.z=z;t.y=y;t.vy=0;t.tpN++;t.tpTo=[r1(x),r1(y),r1(z)];}
function kill(k,v,how){
  if(!v.alive)return false;
  if(G.t<v.invU){say(k,'La cible est insensible !',1);k.cdA=G.t+3;return false;}
  if(G.t<v.shU){v.shU=0;stun(v,1.5);stun(k,1.0);say(v,'Votre protection a absorbé le coup !');say(k,'Une protection a absorbé le coup.',1);k.cdA=G.t+4;snd('hit',v.x,v.z,v.y,14);return false;}
  v.alive=false;v.hidden=-1;
  G.bodies.push({i:v.i,x:v.x,y:v.y,z:v.z,yaw:v.yaw});
  snd('kill',v.x,v.z,v.y,8);
  say(v,'Vous avez été tué. Vous restez dans la partie en fantôme.',1);
  for(const l of G.links){if(l.done)continue;
    if(l.a===v.i||l.b===v.i){const o=G.P[l.a===v.i?l.b:l.a];if(o.alive){l.done=true;o.spU=G.t+10;o.spM=1.5;o.invU=G.t+5;say(o,'Votre lien est mort : bonus de vitesse et insensibilité !');}}}
  // witnesses (bots)
  for(const b of G.P){if(!b.bot||!b.alive||b===k||b.role==='m')continue;
    if((pd(b,k.x,k.z)<14&&los(b.x,b.z,b.y,k.x,k.z,k.y))||(pd(b,v.x,v.z)<10&&los(b.x,b.z,b.y,v.x,v.z,v.y)))b.ai.knows=true;}
  return true;
}
function neutralize(m){
  m.alive=false;G.bodies.push({i:m.i,x:m.x,y:m.y,z:m.z,yaw:m.yaw});G.neut=true;snd('kill',m.x,m.z,m.y,30);
}
function zoneAdd(type,x,z,y,r,dur){
  const z0={id:++G.zid,type,x,z,y,r,until:G.t+dur};
  if(type==='gum'){z0.col=addCol(x-1.1,y,z-1.1,x+1.1,y+2.4,z+1.1,true);}
  G.zones.push(z0);return z0;
}

function hostAct(p,a){
  if(!G||G.over||!p)return;
  const t=a.t;
  if(p.escaped)return;
  if(!p.alive){ // ghosts: progress only
    if(t==='obj')return doneObj(p,a.i,true);
    if(t==='rep')return repObj(p,a.i);
    return;
  }
  if(G.t<p.stunU&&t!=='hide'){return;}
  switch(t){
    case 'door':{const d=WORLD.doors[a.i];if(!d||pd(p,d.cx,d.cz)>3.2||Math.abs(p.y-d.y)>2)return;
      if(d.state===2){say(p,'La porte est barricadée.',1);return;}setDoor(d,d.state===0?1:0);break;}
    case 'win':{const w=WORLD.wins[a.i];if(!w||pd(p,w.cx,w.cz)>2.6||p.y>1)return;w.state=w.state?0:1;w.col.on=!!w.state;snd('door',w.cx,w.cz,0,14);break;}
    case 'furn':{const f=WORLD.furn[a.i];if(!f)return;const c=f.box[f.s],cx=(c[0]+c[2])/2,cz=(c[1]+c[3])/2;if(pd(p,cx,cz)>3.4)return;
      if(G.t<(f.cdU||0))return;const s2=1-f.s,b=f.box[s2];
      for(const q of G.P){if(!q.alive||q.escaped||Math.abs(q.y)>2)continue;if(q.x>b[0]-.5&&q.x<b[2]+.5&&q.z>b[1]-.5&&q.z<b[3]+.5){say(p,'Quelqu’un gêne le meuble.',1);return;}}
      f.cdU=G.t+1.2;setFurn(f,s2);break;}
    case 'try':{const o=G.ob[a.i];if(!o||p.role==='m')return;if(o.st===0&&!o.func){o.st=3;say(p,'Ce panneau est hors tension : un des 3 emplacements inutiles.');}break;}
    case 'obj':doneObj(p,a.i,false);break;
    case 'rep':repObj(p,a.i);break;
    case 'lev':leverAct(p,a.i);break;
    case 'hide':hideAct(p,a.i);break;
    case 'atk':{if(p.role!=='m'||G.t<p.cdA||p.hidden>=0)return;p.yaw=a.yw??p.yaw;
      const v=rayTarget(p,p.yaw,1.95,1.3);p.cdA=G.t+1.2;if(v)kill(p,v);break;}
    case 'rg':{if(p.role!=='m'||G.t<p.cdG||p.hidden>=0)return;if(G.t<20){say(p,'Patientez encore un peu…',1);return;}
      p.yaw=a.yw??p.yaw;const v=rayTarget(p,p.yaw,12,.16);p.cdG=G.t+14;snd('rg',p.x,p.z,p.y,48);
      if(v){const[fx,fz]=fwd(p.yaw);stun(v,1.6);tp(v,p.x+fx*1.25,p.z+fz*1.25,p.y);}break;}
    case 'sab':sabotage(p);break;
    case 'q':useQ(p,a);break;
    case 'f':useF(p,a);break;
    case 'pr':usePrimary(p,a);break;
    case 'bind':{const v=G.P[a.i];if(!v||p.role==='m'||!v.alive||pd(p,v.x,v.z)>2.6||G.t>=v.stunU)return;
      if(v.role==='m'){neutralize(v);say(null,'Le meurtrier a été maîtrisé !');}else say(p,'Ce n’était pas le meurtrier…',1);break;}
  }
}
function doneObj(p,i,ghost){
  const o=G.ob[i],d=OBJS[i];if(!o||p.role==='m'&&!ghost&&false)return;
  if(p.role==='m'||o.st!==0||!o.func||pd(p,d.x,d.z)>4||Math.abs(p.y-d.y)>2||G.phase>1)return;
  o.st=1;G.done++;snd('chime',d.x,d.z,d.y,22);say(null,`${d.n} sécurisé (${G.done}/5).`);
  if(G.done>=5&&G.phase===0){G.phase=1;G.exitsT=G.t;snd('alarm',20,15,0,80);say(null,'Sécurisation terminée ! 3 sorties sont actives : trouvez un levier et ouvrez-les.');}
}
function repObj(p,i){const o=G.ob[i],d=OBJS[i];if(!o||o.st!==2||pd(p,d.x,d.z)>4||Math.abs(p.y-d.y)>2)return;o.st=0;snd('chime',d.x,d.z,d.y,16);say(null,`${d.n} réparé.`);}
function leverAct(p,i){
  const e=WORLD.exits[i];if(!e||G.phase!==1||!e.active||e.open||p.role==='m'&&false)return;if(pd(p,e.lx,e.lz)>3)return;
  e.open=true;e.openU=G.t+30;e.col.on=false;snd('alarm',e.cx,e.cz,0,90);say(null,`ALARME — ${e.n} ouverte pendant 30 s !`);
}
function hideAct(p,i){
  if(p.hidden>=0){const h=WORLD.hides[p.hidden];tp(p,h.fx,h.fz,h.y);p.hidden=-1;p.hideCd=G.t+8;snd('door',h.x,h.z,h.y,6);return;}
  if(G.t<p.hideCd)return;
  let best=null,bd=2.0;for(const h of WORLD.hides){const d=pd(p,h.x,h.z);if(d<bd&&Math.abs(h.y-p.y)<2){bd=d;best=h;}}
  if(!best)return;p.hidden=best.i;p.hideU=G.t+10;p.x=best.x;p.z=best.z;p.y=best.y;p.tpN++;p.tpTo=[best.x,best.y,best.z];snd('door',best.x,best.z,best.y,6);
}
function sabotage(p){
  if(p.role!=='m'||G.t<p.cdS||G.phase!==0)return;
  if(G.ob.filter(o=>o.st===2).length>=2){say(p,'Déjà deux sabotages actifs.',1);return;}
  let bi=-1,bd=3;OBJS.forEach((d,i)=>{const dd=pd(p,d.x,d.z);if(dd<bd&&Math.abs(p.y-d.y)<2&&G.ob[i].st===0){bd=dd;bi=i;}});
  if(bi<0){say(p,'Aucun objectif à saboter ici.',1);return;}
  G.ob[bi].st=2;p.cdS=G.t+25;snd('sab',OBJS[bi].x,OBJS[bi].z,OBJS[bi].y,42);say(p,'Sabotage effectué.');
}
function nearestOther(p,r){let b=null,bd=r;for(const t of G.P){if(t===p||!t.alive||t.escaped||t.hidden>=0||Math.abs(t.y-p.y)>2)continue;const d=pd(p,t.x,t.z);if(d<bd){bd=d;b=t;}}return b;}
function useQ(p,a){
  if(G.t<p.cdQ||G.t<p.silU)return;p.yaw=a.yw??p.yaw;const c=CHARS[p.ch],[fx,fz]=fwd(p.yaw);let ok=false;
  switch(c.k){
    case 'ath':{const t=nearestOther(p,2.6);if(t){if(stun(t,4)){snd('hit',t.x,t.z,t.y,14);say(t,'Vous avez été assommé !',1);}ok=true;}else say(p,'Personne à portée.',1);break;}
    case 'esc':zoneAdd('smoke',p.x+fx*1.6,p.z+fz*1.6,p.y,3.2,8);snd('puff',p.x,p.z,p.y,14);ok=true;break;
    case 'exp':zoneAdd('insect',p.x+fx*5,p.z+fz*5,p.y,2.4,10);snd('puff',p.x,p.z,p.y,14);ok=true;break;
    case 'jou':p.scanU=G.t+5;ok=true;break;
    case 'ing':{let b=null,bd=4.2;for(const d of WORLD.doors){const dd=pd(p,d.cx,d.cz);if(dd<bd&&Math.abs(d.y-p.y)<2){bd=dd;b=d;}}
      if(b){setDoor(b,2);b.barU=G.t+18;ok=true;}else say(p,'Aucune porte proche.',1);break;}
    case 'enf':{const t=rayTarget(p,p.yaw,18,.12);if(t){if(G.t>=t.invU){t.blU=G.t+4;say(t,'Un caillou vous aveugle !',1);}ok=true;}else say(p,'Personne dans la ligne de mire.',1);break;}
  }
  if(ok)p.cdQ=G.t+c.q.cd;
}
function useF(p,a){
  if(G.t<p.cdF||G.t<p.silU)return;p.yaw=a.yw??p.yaw;const c=CHARS[p.ch],[fx,fz]=fwd(p.yaw);let ok=false,cd=1e9;
  switch(c.k){
    case 'ath':p.spU=G.t+6;p.spM=1.6;p.invU=G.t+6;ok=true;break;
    case 'esc':p.invisU=G.t+7;ok=true;break;
    case 'exp':{const t=rayTarget(p,p.yaw,40,.05);snd('shot',p.x,p.z,p.y,70);ok=true;cd=60;
      if(t){if(t.role==='m'){neutralize(t);say(null,'Coup de fusil ! Le meurtrier est neutralisé.');}else{stun(t,6);say(p,'Mauvaise cible ! Rechargement : 60 s.',1);}}
      else say(p,'Raté ! Rechargement : 60 s.',1);break;}
    case 'jou':{const t=nearestOther(p,12);if(t){G.links.push({a:p.i,b:t.i,done:false});say(p,'Lien établi avec un invité proche.');ok=true;}else say(p,'Personne à proximité.',1);break;}
    case 'ing':p.shU=G.t+40;ok=true;break;
    case 'enf':zoneAdd('gum',p.x+fx*3.4,p.z+fz*3.4,p.y,1.4,10);zoneAdd('gum',p.x+fx*5.6,p.z+fz*5.6,p.y,1.4,10);ok=true;break;
  }
  if(ok)p.cdF=G.t+cd;
}
function usePrimary(p,a){
  if(p.role==='m'||G.t<p.cdP||G.t<p.silU)return;p.yaw=a.yw??p.yaw;const c=CHARS[p.ch];
  if(c.k==='esc'){const t=rayTarget(p,p.yaw,9,.18);p.cdP=G.t+22;if(t&&G.t>=t.invU){t.silU=G.t+6;t.slU=G.t+4;t.slM=.5;say(t,'Paralysé ! Capacités coupées.',1);}snd('puff',p.x,p.z,p.y,16);}
  else if(c.k==='enf'){const t=rayTarget(p,p.yaw,7,.2);p.cdP=G.t+16;if(t&&G.t>=t.invU){const[fx,fz]=fwd(p.yaw);stun(t,1.5);tp(t,p.x+fx*1.4,p.z+fz*1.4,p.y);}}
}

/* ---------- simulation tick ---------- */
function speedOf(p){
  let m=1;if(G.t<p.spU)m*=p.spM;if(G.t<p.slU)m*=p.slM;
  for(const z of G.zones)if(z.type==='insect'&&z.y===p.y&&pd(p,z.x,z.z)<z.r){m*=.12;break;}
  return m;
}
function hostTick(dt,getPos){
  if(!G||G.over)return;
  G.t+=dt;
  for(const p of G.P){
    if(!p.bot){const s=getPos(p);if(s){p.x=s.x;p.y=s.y;p.z=s.z;p.yaw=s.yw;p.pit=s.pt;p.fl=s.fl;}}
    else if(p.alive&&!p.escaped)botThink(p,dt);
    if(p.hidden>=0&&G.t>p.hideU){const h=WORLD.hides[p.hidden];tp(p,h.fx,h.fz,h.y);p.hidden=-1;p.hideCd=G.t+15;}
    if(p.linked>=0&&false)0;
  }
  for(const d of WORLD.doors)if(d.state===2&&G.t>d.barU)d.state=1;
  for(const e of WORLD.exits)if(e.open&&G.t>e.openU){e.open=false;e.col.on=true;}
  for(let i=G.zones.length-1;i>=0;i--){const z=G.zones[i];if(G.t>z.until){if(z.col)z.col.on=false;if(z.col){const k=COL.indexOf(z.col);if(k>=0)COL.splice(k,1);}G.zones.splice(i,1);}}
  // escape
  for(const p of G.P){if(!p.alive||p.escaped||p.role==='m')continue;
    for(const e of WORLD.exits){if(!e.open)continue;const d=e.def;
      if(p.x>d.zx[0]&&p.x<d.zx[1]&&p.z>d.zz[0]&&p.z<d.zz[1]&&p.y<1.5){
        p.escaped=true;p.escU=G.t;e.used=true;G.exUsed.add(e.i);snd('chime',p.x,p.z,p.y,40);say(p,G.exUsed.size<2?'Vous êtes sorti ! Il faut qu’une 2e sortie différente soit utilisée.':'Vous vous êtes échappé !');
        if(!p.bot)say(null,`Un invité s’est échappé par ${e.n} (${G.exUsed.size}/2 sorties).`);else say(null,`Un invité s’est échappé par ${e.n} (${G.exUsed.size}/2 sorties).`);}}}
  // win
  const m=G.mur;
  if(!m.alive)endGame('inn','Le meurtrier a été neutralisé.');
  else if(G.exUsed.size>=2)endGame('inn','Deux sorties différentes ont été utilisées : évasion réussie.');
  else if(!G.P.some(p=>p.role!=='m'&&p.alive&&!p.escaped))endGame('mur','Plus aucun innocent ne peut s’échapper.');
  else if(G.t>G.limit)endGame('mur','Le temps est écoulé : personne n’est sorti.');
}
function endGame(w,why){if(G.over)return;G.over=true;G.win=w;G.why=why;G.overAt=G.t;}

function snapshot(){
  const S={t:r1(G.t),ph:G.phase,dn:G.done,lim:G.limit,
    ob:G.ob.map(o=>o.st),dr:WORLD.doors.map(d=>d.state),wn:WORLD.wins.map(w=>w.state),fu:WORLD.furn.map(f=>f.s),
    ex:WORLD.exits.map(e=>(e.active&&G.phase>=1?1:0)|(e.open?2:0)|(e.used?4:0)),
    pl:G.P.map(p=>{let f=0;if(!p.alive)f|=1;if(p.escaped)f|=2;if(G.t<p.stunU)f|=4;if(p.hidden>=0)f|=8;if(G.t<p.invisU)f|=16;if(p.fl&1)f|=64;if(p.fl&2)f|=32;if(G.t<p.invU)f|=128;
      return [f,r1(p.x),r1(p.y),r1(p.z),Math.round(p.yaw*100)/100];}),
    bd:G.bodies.map(b=>[b.i,r1(b.x),r1(b.y),r1(b.z),r2(b.yaw)]),
    zn:G.zones.map(z=>[z.id,z.type,r1(z.x),r1(z.z),r1(z.y),z.r,r1(z.until)]),
    ev:G.evs.filter(e=>e.t0>G.t-2).map(e=>e),al:G.P.filter(p=>p.alive&&!p.escaped).length};
  if(G.over){S.ov=[G.win,G.why,G.mur.i];S.ro=G.P.map(p=>p.role==='m'?1:0);}
  G.evs=G.evs.filter(e=>e.t0>G.t-4);
  return S;
}
function pvFor(p){
  const n=G.t,r=x=>Math.max(0,r1(x-n));
  return {r:p.role,c:p.ch,al:p.alive?1:0,es:p.escaped?1:0,st:r(p.stunU),sp:r2(speedOf(p)),si:r(p.silU),iv:r(p.invU),sh:r(p.shU),bl:r(p.blU),
    cq:r(p.cdQ),cf:p.cdF>=1e8?-1:r(p.cdF),ca:r(p.cdA),cs:r(p.cdS),cg:r(p.cdG),cp:r(p.cdP),hd:p.hidden,sc:r(p.scanU),ic:r(p.invisU),
    tp:p.tpN,tt:p.tpTo,lk:G.links.some(l=>!l.done&&(l.a===p.i||l.b===p.i))?1:0,hc:r(p.hideCd)};
}

/* ---------- bots ---------- */
function botGo(p,tx,tz,ty,run,dt,stop=.6){
  const a=p.ai;
  if(!a.goal||hyp(a.goal[0],a.goal[1],tx,tz)>1.2||G.t>a.replan||a.goal[2]!==ty){
    a.goal=[tx,tz,ty];a.replan=G.t+2.5;
    const s=nearestNode(p.x,p.z,p.y),g=nearestNode(tx,tz,ty),path=(s>=0&&g>=0)?findPath(s,g):null;
    a.path=path||[];a.pi=0;a.blocked=!path;
    if(a.path.length>1){ // skip a node that we are already past
      const n0=NODES[a.path[0]],n1=NODES[a.path[1]];
      if(hyp(p.x,p.z,n1.x,n1.z)<hyp(n0.x,n0.z,n1.x,n1.z)&&los(p.x,p.z,p.y,n1.x,n1.z,n1.y))a.pi=1;}
  }
  if(a.blocked&&(!los(p.x,p.z,p.y,tx,tz,ty)||Math.abs(p.y-ty)>1.5))return false;
  let wx=tx,wz=tz;
  while(a.pi<a.path.length){const n=NODES[a.path[a.pi]];if(hyp(p.x,p.z,n.x,n.z)<.55){a.pi++;continue;}wx=n.x;wz=n.z;break;}
  const dx=wx-p.x,dz=wz-p.z,d=Math.hypot(dx,dz);
  if(a.pi>=a.path.length&&d<stop){p.fl=0;return true;}
  const sp=(run?5.2:3.3)*speedOf(p)*dt;
  if(G.t>=p.stunU){
    const ox=p.x,oz=p.z;
    moveEnt(p,dx/(d||1)*Math.min(sp,d),dz/(d||1)*Math.min(sp,d));
    p.yaw=Math.atan2(-dx,-dz);p.fl=run?2:0;
    // open doors on the way
    for(const dr of WORLD.doors)if(dr.state===1&&Math.abs(dr.y-p.y)<1.5&&hyp(p.x,p.z,dr.cx,dr.cz)<1.9)setDoor(dr,0);
    // stuck
    a.stuckT+=dt;if(a.stuckT>1.2){a.stuckT=0;if(hyp(p.x,p.z,a.lastX,a.lastZ)<.25){a.stuck=(a.stuck||0)+1;a.replan=0;
        const ang=Math.random()*6.28;moveEnt(p,Math.cos(ang)*.8,Math.sin(ang)*.8);
        if(a.stuck>3){const ni=nearestNode(p.x,p.z,p.y),n=NODES[ni];p.x=n.x;p.z=n.z;p.y=n.y;a.stuck=0;}}else a.stuck=0;a.lastX=p.x;a.lastZ=p.z;}
  }
  stepVert(p,dt);
  return false;
}
const STAND=OBJS.map(standPoint);
function botThink(p,dt){
  if(!p.alive)return;
  if(G.t<p.stunU){p.fl=0;stepVert(p,dt);return;}
  if(p.role==='m')thinkMur(p,dt);else thinkInn(p,dt);
}
function facePlayer(p,t){p.yaw=Math.atan2(-(t.x-p.x),-(t.z-p.z));}
function thinkInn(p,dt){
  const a=p.ai,m=G.mur;
  // fear
  const seesM=m.alive&&visibleTo(p,m)&&pd(p,m.x,m.z)<(a.knows?13:0)&&Math.abs(m.y-p.y)<2&&los(p.x,p.z,p.y,m.x,m.z,m.y);
  if(seesM){
    a.fleeU=G.t+4;a.work=null;
    if(G.t>=p.cdF&&G.t>=p.silU&&pd(p,m.x,m.z)<6){facePlayer(p,m);const k=CHARS[p.ch].k;if(k==='ath'||k==='esc'||k==='ing')hostAct(p,{t:'f',yw:p.yaw});}
    if(CHARS[p.ch].k==='exp'&&G.t>=p.cdF&&pd(p,m.x,m.z)<18){a.aimT=(a.aimT||0)+dt;
      if(a.aimT>1.4){a.aimT=0;facePlayer(p,m);if(Math.random()<.45)hostAct(p,{t:'f',yw:p.yaw});else{p.cdF=G.t+60;snd('shot',p.x,p.z,p.y,70);}}}
  }
  if(G.t<a.fleeU){
    if(!a.fleeGoal||G.t>a.fleeRe){a.fleeRe=G.t+2;let best=null,bs=-1;
      for(const n of NODES){if(n.id[0]==='d'||n.id[0]==='P'||n.id[0]==='X'||n.id[0]==='O')continue;const dm=hyp(n.x,n.z,m.x,m.z),dp=hyp(n.x,n.z,p.x,p.z);
        if(dp<6||dp>26)continue;const s=dm-dp*.3+rnd(4);if(s>bs){bs=s;best=n;}}
      a.fleeGoal=best;}
    if(a.fleeGoal)botGo(p,a.fleeGoal.x,a.fleeGoal.z,a.fleeGoal.y,true,dt,1.2);return;
  }
  // bodies
  if(G.t>a.seenBody)for(const b of G.bodies){if(pd(p,b.x,b.z)<9&&Math.abs(b.y-p.y)<2&&los(p.x,p.z,p.y,b.x,b.z,b.y)){a.seenBody=G.t+25;a.fleeU=G.t+5;a.fleeGoal=null;break;}}
  if(a.wait>0){a.wait-=dt;p.fl=0;return;}
  if(G.phase>=1){
    if(a.work&&a.work.k!=='lev')a.work=null;
    let ex=WORLD.exits.find(e=>e.open&&(!e.used||WORLD.exits.every(x=>!x.active||x.used||x.i===e.i))&&pd(p,e.cx,e.cz)<(e.used?10:40)&&findPath(nearestNode(p.x,p.z,p.y),NAV['O'+e.i]));
    if(ex){botGo(p,ex.def.zx[0]*.5+ex.def.zx[1]*.5,ex.def.zz[0]*.5+ex.def.zz[1]*.5,0,true,dt,.4);return;}
    if(!a.work){
      const un=WORLD.exits.filter(x=>x.active&&!x.used),pool=un.length?un:WORLD.exits.filter(x=>x.active);
      const e=pool[p.i%pool.length];if(!e){a.wait=2;return;}
      a.work={k:'lev',i:e.i,t:0,dur:5};}
    if(WORLD.exits[a.work.i].used&&WORLD.exits.some(x=>x.active&&!x.used))a.work=null;
    if(!a.work)return;
    const e=WORLD.exits[a.work.i];
    if(e.open||!e.active){a.work=null;return;}
    if(botGo(p,e.lx-e.def.dirx,e.lz-e.def.dirz,0,true,dt,.7)||pd(p,e.lx,e.lz)<1.9){a.work.t+=dt;p.fl=0;if(a.work.t>=a.work.dur){hostAct(p,{t:'lev',i:e.i});a.work=null;}}
    return;
  }
  // phase 0: objectives
  if(!a.work){
    let best=-1,bs=1e9;
    OBJS.forEach((d,i)=>{const o=G.ob[i];if(o.st===1||o.st===3)return;if(i===a.last&&Math.random()<.8)return;
      const s=hyp(p.x,p.z,d.x,d.z)+rnd(14)+(Math.abs(p.y-d.y)>2?8:0);if(s<bs){bs=s;best=i;}});
    if(best<0){a.wait=3;return;}
    a.work={k:G.ob[best].st===2?'rep':'obj',i:best,t:0,dur:G.ob[best].st===2?(CHARS[p.ch].k==='ing'?2.5:6):rnd(5,9)};
  }
  const w=a.work,o=G.ob[w.i],sp=STAND[w.i];
  if(o.st===1||o.st===3||(w.k==='obj'&&o.st===2)||(w.k==='rep'&&o.st!==2)){a.work=null;a.wait=rnd(1,3);return;}
  if(botGo(p,sp[0],sp[1],sp[2],false,dt,.9)||pd(p,OBJS[w.i].x,OBJS[w.i].z)<1.7){
    w.t+=dt;p.fl=0;const d=OBJS[w.i];p.yaw=Math.atan2(-(d.x-p.x),-(d.z-p.z));
    if(w.t>=w.dur){a.last=w.i;
      if(w.k==='rep')hostAct(p,{t:'rep',i:w.i});else{if(!o.func){hostAct(p,{t:'try',i:w.i});}else hostAct(p,{t:'obj',i:w.i});}
      a.work=null;a.wait=rnd(1,4);}
  }
}
function thinkMur(p,dt){
  const a=p.ai;
  if(G.t<a.coolU){ // walk away calmly
    if(!a.fleeGoal||G.t>a.fleeRe){a.fleeRe=G.t+3;a.fleeGoal=pick(NODES.filter(n=>/^[A-Z]/.test(n.id)&&n.id.length<=3&&n.id[0]!=='L'&&n.id[0]!=='X'&&n.id[0]!=='O'&&n.id[0]!=='R'&&n.id[0]!=='P'));}
    if(a.fleeGoal)botGo(p,a.fleeGoal.x,a.fleeGoal.z,a.fleeGoal.y,false,dt,1.5);return;}
  if(G.t>a.retarget){a.retarget=G.t+1.5;
    let best=null,bs=1e9;
    for(const t of G.P){if(t===p||!t.alive||t.escaped||t.hidden>=0||G.t<t.invisU)continue;
      const d=pd(p,t.x,t.z)+(Math.abs(t.y-p.y)>2?10:0);
      let crowd=0;for(const u of G.P)if(u!==t&&u!==p&&u.alive&&!u.escaped&&hyp(u.x,u.z,t.x,t.z)<6)crowd++;
      const s=d+crowd*7+rnd(6);if(s<bs){bs=s;best=t;}}
    a.target=best?best.i:null;}
  const t=a.target!=null&&G.t>=24?G.P[a.target]:null;
  // sabotage opportunistically
  if(G.phase===0&&G.t>=p.cdS&&Math.random()<dt*.35)for(let i=0;i<OBJS.length;i++){const d=OBJS[i];if(G.ob[i].st===0&&pd(p,d.x,d.z)<2.6&&Math.abs(p.y-d.y)<2){hostAct(p,{t:'sab'});break;}}
  if(t&&t.alive&&!t.escaped&&t.hidden<0&&G.t>=t.invisU){
    const d=pd(p,t.x,t.z),vis=Math.abs(t.y-p.y)<2&&los(p.x,p.z,p.y,t.x,t.z,t.y);
    if(vis&&d<1.7&&G.t>=p.cdA){
      let wit=0;for(const u of G.P)if(u!==p&&u!==t&&u.alive&&!u.escaped&&u.hidden<0&&pd(u,p.x,p.z)<11&&Math.abs(u.y-p.y)<2&&los(u.x,u.z,u.y,p.x,p.z,p.y))wit++;
      if(wit===0||Math.random()<dt*.5){facePlayer(p,t);hostAct(p,{t:'atk',yw:p.yaw});a.coolU=G.t+5;a.target=null;a.retarget=G.t+4;return;}
      p.fl=0;return;}
    if(vis&&d>3.5&&d<11&&G.t>=p.cdG&&G.t>=20&&Math.random()<dt*.6){facePlayer(p,t);hostAct(p,{t:'rg',yw:p.yaw});return;}
    botGo(p,t.x,t.z,t.y,true,dt,1.0);return;
  }
  // patrol objectives / exits
  if(!a.patrol||G.t>a.patrolU||botGo(p,a.patrol[0],a.patrol[1],a.patrol[2],false,dt,1.2)){
    const cands=G.phase===0?OBJS.map((d,i)=>G.ob[i].st===1?null:STAND[i]).filter(Boolean):WORLD.exits.filter(e=>e.active).map(e=>[e.lx,e.lz,0]);
    a.patrol=cands.length?pick(cands):[20,15,0];a.patrolU=G.t+25;
  }
}
