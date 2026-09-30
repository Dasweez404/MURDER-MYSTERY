
/* ============================ host simulation ============================ */
/* Runs on the solo player's tab or on the hosting player's tab. Clients only send inputs and render snapshots. */
let G=null;
const BASE={walk:3.4,run:5.6,crouch:1.7};
function vfx(f,x,y,z,o){ev(Object.assign({k:'f',f,x:r1(x),y:r1(y),z:r1(z)},o||{}));}
function hit(p){ev({k:'h',to:p.i});}
function ev(o){o.i=++G.eid;o.t0=G.t;G.evs.push(o);}
const SAB_FUSE=7,SAB_JAM=14,SAB_OBJ=16;
function snd(s,x,z,y,r){ev({k:'s',s,x:r1(x),z:r1(z),y:r1(y),r});if(['piano','gramo','bell','tv','rg','shot','scream','swt'].includes(s))G.noiseLast={x,z,y,t:G.t,k:s};
  if(s==='rg'||s==='shot')for(const b of G.P)if(b.bot&&b.alive&&b.role!=='m'&&hyp(b.x,b.z,x,z)<r*.6)b.ai.knows=true;}
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
    const a=i/P.length*Math.PI*2;p.x=21.5+Math.cos(a)*3.0;p.z=17+Math.sin(a)*3.0;p.y=0;p.vy=0;p.yaw=a;p.pit=0;p.fl=0;
    p.alive=true;p.escaped=false;p.hidden=-1;p.hideU=0;p.hideCd=0;p.tpN=0;p.tpTo=null;
    p.stunU=0;p.silU=0;p.invisU=0;p.spU=0;p.spM=1;p.slU=0;p.slM=1;p.invU=0;p.shU=0;p.blU=0;p.scanU=0;
    p.cdQ=0;p.cdF=0;p.cdA=p.role==='m'?20:0;p.cdS=0;p.cdG=0;p.cdP=0;p.linked=-1;
    p.rushU=0;p.invertU=0;p.cuff=-1;p.apU=0;p.apC=-1;p.pills=0;p.still=0;p.seenF=null;p.reviveReady=false;p.reviveUsed=false;p.tpCd=0;p.atkU=0;
    p.ai={path:[],pi:0,goal:null,replan:0,mode:'idle',wait:rnd(.5,3),work:null,knows:false,coolU:0,retarget:0,target:null,stuckT:0,lastX:p.x,lastZ:p.z,seenBody:0,fleeU:0,last:-1,lastShot:0};
  });
  const func=shuffle(OBJS.map((o,i)=>i)).slice(0,7),ea=shuffle([0,1,2,3,4]).slice(0,3);
  G={t:0,eid:0,evs:[],P,mur:P[mi],phase:0,over:false,win:null,why:'',limit:600,
    ob:OBJS.map((o,i)=>({st:0,func:func.includes(i),prev:0})),done:0,
    ea,exUsed:new Set(),zones:[],zid:0,bodies:[],links:[],nextPv:0,nextSnap:0,peerIdx:new Map(),
    lights:(1<<ROOMS.length)-1,vents:0,tl:(1<<WORLD.tlamps.length)-1,fuse:[1,1,1],fuseT:[0,0,0],noiseLast:null,started:Date.now()};
  P.forEach(p=>{if(p.peer)G.peerIdx.set(p.peer,p.i);});
  // reset world state
  WORLD.doors.forEach(d=>{d.state=1;d.col.on=true;d.barU=0;});
  WORLD.wins.forEach(w=>{w.state=1;w.col.on=true;});
  WORLD.exits.forEach((e,i)=>{e.active=ea.includes(i);e.open=false;e.used=false;e.jam=false;e.col.on=true;});
  WORLD.furn.forEach(f=>{f.cdU=0;setFurn(f,0,true);});
  WORLD.noise.forEach(n=>n.cd=0);
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
  snd('kill',v.x,v.z,v.y,10);vfx('kill',v.x,v.y,v.z,{by:k.i,v:v.i});hit(k);
  say(v,'Vous avez été assassiné. Vous restez dans la partie en fantôme.',1);say(k,'Assassinat réussi : '+CHARS[v.ch].n+'.');
  for(const l of G.links){if(l.done)continue;
    if(l.a===v.i||l.b===v.i){const o=G.P[l.a===v.i?l.b:l.a];if(o.alive){l.done=true;o.spU=G.t+10;o.spM=1.5;o.invU=G.t+5;say(o,'Votre lien est mort : bonus de vitesse et insensibilité !');}}}
  // witnesses (bots)
  for(const b of G.P){if(!b.bot||!b.alive||b===k||b.role==='m')continue;
    if((pd(b,k.x,k.z)<14&&los(b.x,b.z,b.y,k.x,k.z,k.y))||(pd(b,v.x,v.z)<10&&los(b.x,b.z,b.y,v.x,v.z,v.y)))b.ai.knows=true;}
  return true;
}
function neutralize(m){
  m.alive=false;G.bodies.push({i:m.i,x:m.x,y:m.y,z:m.z,yaw:m.yaw});G.neut=true;snd('kill',m.x,m.z,m.y,30);vfx('neut',m.x,m.y,m.z);
}
function zoneAdd(type,x,z,y,r,dur,own,ex){
  const z0={id:++G.zid,type,x,z,y,r,until:G.t+dur,own:own===undefined?-1:own,ex:ex||0,np:0};
  if(type==='gum'){z0.col=addCol(x-1.1,y,z-1.1,x+1.1,y+2.4,z+1.1,true);z0.col.dynf=1;DYN.push({c:z0.col,type:'gum'});}
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
      if(d.state===3){say(p,'Porte coincée : il faut la réparer (maintenir E).',1);return;}
      if(d.state===2){say(p,'La porte est barricadée.',1);return;}setDoor(d,d.state===0?1:0);break;}
    case 'win':{const w=WORLD.wins[a.i];if(!w||pd(p,w.cx,w.cz)>2.6||p.y>1)return;w.state=w.state?0:1;w.col.on=!!w.state;snd('door',w.cx,w.cz,0,14);break;}
    case 'furn':{const f=WORLD.furn[a.i];if(!f)return;const c=f.box[f.s],cx=(c[0]+c[2])/2,cz=(c[1]+c[3])/2;if(pd(p,cx,cz)>3.4||Math.abs(p.y-f.y)>2)return;
      if(G.t<(f.cdU||0))return;const s2=1-f.s,b=f.box[s2];
      for(const q of G.P){if(!q.alive||q.escaped||Math.abs(q.y-f.y)>2)continue;if(q.x>b[0]-.5&&q.x<b[2]+.5&&q.z>b[1]-.5&&q.z<b[3]+.5){say(p,'Quelqu’un gêne le meuble.',1);return;}}
      f.cdU=G.t+1.2;setFurn(f,s2);break;}
    case 'try':{const o=G.ob[a.i];if(!o||p.role==='m')return;if(o.st===0&&!o.func){o.st=3;say(p,'Ce panneau est hors tension : un des 3 emplacements inutiles.');}break;}
    case 'obj':doneObj(p,a.i,false);break;
    case 'rep':repObj(p,a.i);break;
    case 'lev':leverAct(p,a.i);break;
    case 'hide':hideAct(p,a.i);break;
    case 'sw':{const s=WORLD.switches[a.i];if(!s||pd(p,s.x,s.z)>3||Math.abs(p.y-s.y)>2)return;if(G.t<(s.cd||0)){say(p,'L’interrupteur grésille… patientez.',1);return;}
      G.lights^=(1<<s.room);s.cd=G.t+7;snd('swt',s.x,s.z,s.y,30);vfx('flash',s.x,s.y+1.4,s.z);
      if(p.role!=='m'){stun(p,1.1);say(p,'Le claquement de l’interrupteur vous trahit !',1);}break;}
    case 'noise':{const n=WORLD.noise[a.i];if(!n||G.t<n.cd||pd(p,n.def.x,n.def.z)>2.8||Math.abs(p.y-n.def.y)>2)return;n.cd=G.t+8;
      snd(n.def.k,n.def.x,n.def.z,n.def.y,n.def.r);vfx('note',n.def.x,n.def.y+1.2,n.def.z);say(p,n.def.n+' : tout le monde a pu l’entendre.');break;}
    case 'atk':{if(p.role!=='m'||G.t<p.cdA||p.hidden>=0)return;p.yaw=a.yw??p.yaw;
      const v=rayTarget(p,p.yaw,1.95,1.3);p.cdA=G.t+1.2;p.atkU=G.t+.45;vfx('slash',p.x,p.y,p.z,{yw:p.yaw});if(v)kill(p,v,p);else say(p,'Coup dans le vide.',1);break;}
    case 'rg':{if(p.role!=='m'||G.t<p.cdG||p.hidden>=0)return;if(G.t<20){say(p,'Patientez encore un peu…',1);return;}
      p.yaw=a.yw??p.yaw;let v=rayTarget(p,p.yaw,16,.5);p.cdG=G.t+(v?11:5);snd('rg',p.x,p.z,p.y,48);
      vfx('slash',p.x,p.y,p.z,{yw:p.yaw,rg:1});
      if(v){vfx('grab',p.x,p.y,p.z,{tx:r1(v.x),tz:r1(v.z),ty:r1(v.y)});const[fx,fz]=fwd(p.yaw);const hx=p.x+fx*1.3,hz=p.z+fz*1.3,ok=walkClear(p.x,p.z,p.y,hx,hz,p.y);stun(v,2.2);tp(v,ok?hx:p.x+fx*.9,ok?hz:p.z+fz*.9,p.y);vfx('stun',v.x,v.y,v.z);hit(p);say(v,'On vous attrape à distance !',1);say(p,'Proie attrapée : frappez vite !');}else say(p,'Raté.',1);break;}
    case 'sab':sabotage(p);break;
    case 'vent':{const v=WORLD.vents[a.i];if(!v||pd(p,v.cx,v.cz)>2.4||Math.abs(p.y-v.y)>2)return;G.vents^=(1<<a.i);snd('door',v.cx,v.cz,v.y,12);break;}
    case 'tl':{const l=WORLD.tlamps[a.i];if(!l||pd(p,l.x,l.z)>2.6||Math.abs(p.y-l.y)>2)return;G.tl^=(1<<a.i);snd('click',l.x,l.z,l.y,8);break;}
    case 'tport':{const t0=WORLD.tports[a.i],t=t0&&t0.def;if(!t||G.t<(p.tpCd||0))return;let s=null,bd=2.6;
      for(const e of [t.a,t.b]){const d=pd(p,e.x,e.z);if(d<bd&&Math.abs(p.y-e.y)<2){bd=d;s=e;}}
      if(!s)return;const o=s===t.a?t.b:t.a;p.tpCd=G.t+3;snd('door',s.x,s.z,s.y,22);vfx('aura',s.x,s.y,s.z,{c:0xcfa750});tp(p,o.x,o.z,o.y);snd('door',o.x,o.z,o.y,22);vfx('aura',o.x,o.y,o.z,{c:0xcfa750});break;}
    case 'repf':{const f=WORLD.fuses[a.i];if(!f||G.fuse[a.i]||pd(p,f.x,f.z)>3.2||Math.abs(p.y-f.y)>2)return;G.fuse[a.i]=1;snd('chime',f.x,f.z,f.y,30);say(null,'Le courant est rétabli.');break;}
    case 'repd':{const d=WORLD.doors[a.i];if(!d||d.state!==3||pd(p,d.cx,d.cz)>3.2||Math.abs(p.y-d.y)>2)return;d.state=1;d.col.on=true;snd('chime',d.cx,d.cz,d.y,18);say(null,'Une porte a été débloquée.');break;}
    case 'repl':{const e=WORLD.exits[a.i];if(!e||!e.jam||pd(p,e.lx,e.lz)>3.2)return;e.jam=false;snd('chime',e.lx,e.lz,0,30);say(null,'Un levier a été réparé.');break;}
    case 'rev':reviveAct(p,a.i);break;
    case 'q':useQ(p,a);break;
    case 'f':useF(p,a);break;
    case 'pr':useTool(p,a);break;
    case 'bind':{const v=G.P[a.i];if(!v||p.role==='m'||!v.alive||pd(p,v.x,v.z)>2.6||G.t>=v.stunU)return;
      if(v.role==='m'){neutralize(v);say(null,'Le meurtrier a été maîtrisé !');}else say(p,'Ce n’était pas le meurtrier…',1);break;}
  }
}
function doneObj(p,i,ghost){
  const o=G.ob[i],d=OBJS[i];if(!o||p.role==='m'&&!ghost&&false)return;
  if(p.role==='m'||o.st!==0||!o.func||pd(p,d.x,d.z)>4||Math.abs(p.y-d.y)>2||G.phase!==0)return;
  o.st=1;G.done++;snd('chime',d.x,d.z,d.y,22);say(null,`${d.n} sécurisé (${G.done}/5).`);
  if(G.done>=5&&G.phase===0){G.phase=1;G.exitsT=G.t;snd('alarm',20,15,0,80);say(null,'Sécurisation terminée ! 3 sorties sont actives : trouvez un levier et ouvrez-les.');}
}
function repObj(p,i){const o=G.ob[i],d=OBJS[i];if(!o||o.st!==2||pd(p,d.x,d.z)>4||Math.abs(p.y-d.y)>2)return;o.st=0;snd('chime',d.x,d.z,d.y,16);say(null,`${d.n} réparé.`);}
function leverAct(p,i){
  const e=WORLD.exits[i];if(!e||G.phase!==1||!e.active||e.open)return;if(pd(p,e.lx,e.lz)>3)return;
  if(e.jam){say(p,'Le levier est coincé : réparez-le d’abord.',1);return;}
  e.open=true;e.openU=G.t+30;e.col.on=false;snd('alarm',e.cx,e.cz,0,90);say(null,`ALARME — ${e.n} ouverte pendant 30 s !`);
}
function hideAct(p,i){
  if(p.hidden>=0){const h=WORLD.hides[p.hidden];tp(p,h.fx,h.fz,h.y);p.hidden=-1;p.hideCd=G.t+8;snd('door',h.x,h.z,h.y,6);return;}
  if(G.t<p.hideCd)return;
  let best=null,bd=2.0;for(const h of WORLD.hides){const d=pd(p,h.x,h.z);if(d<bd&&Math.abs(h.y-p.y)<2){bd=d;best=h;}}
  if(!best)return;p.hidden=best.i;p.hideU=G.t+10;p.x=best.x;p.z=best.z;p.y=best.y;p.tpN++;p.tpTo=[best.x,best.y,best.z];snd('door',best.x,best.z,best.y,6);
}
function sabPick(p){
  const nFuse=G.fuse.filter(f=>!f).length,nDoor=WORLD.doors.filter(d=>d.state===3).length,nLev=WORLD.exits.filter(e=>e.jam).length,nObj=G.ob.filter(o=>o.st===2).length;
  if(nObj+nFuse+nDoor+nLev>=4)return {full:true};
  let best=null,bd=9;
  const cand=(d,fn)=>{if(d<bd){bd=d;best=fn;}};
  if(G.phase===0&&nObj<2)OBJS.forEach((d,i)=>{const dd=pd(p,d.x,d.z);if(dd<3&&Math.abs(p.y-d.y)<2&&G.ob[i].st===0)cand(dd,()=>{G.ob[i].st=2;G.ob[i].sabT=G.t;snd('sab',d.x,d.z,d.y,42);say(p,'Sabotage : '+d.n+'.');});});
  WORLD.fuses.forEach((f,i)=>{const dd=pd(p,f.x,f.z);if(dd<3&&Math.abs(p.y-f.y)<2&&G.fuse[i]&&nFuse<1)cand(dd,()=>{G.fuse[i]=0;G.fuseT[i]=G.t;snd('sab',f.x,f.z,f.y,48);vfx('bar',f.x,f.y,f.z);say(p,'Courant coupé au niveau '+(f.lv<0?'sous-sol':f.lv>0?'étage':'rez-de-chaussée')+'.');});});
  WORLD.doors.forEach((d,i)=>{const dd=pd(p,d.cx,d.cz);if(dd<2.4&&Math.abs(p.y-d.y)<2&&d.state<2&&nDoor<2)cand(dd+.4,()=>{d.state=3;d.col.on=true;d.sabT=G.t;snd('sab',d.cx,d.cz,d.y,34);vfx('bar',d.cx,d.y,d.cz);say(p,'Porte coincée.');});});
  if(G.phase===1)WORLD.exits.forEach(e=>{const dd=pd(p,e.lx,e.lz);if(dd<2.8&&e.active&&!e.open&&!e.jam)cand(dd,()=>{e.jam=true;e.jamT=G.t;snd('sab',e.lx,e.lz,0,44);say(p,'Levier coincé.');});});
  return best?{fn:best}:null;
}
function sabotage(p){
  if(p.role!=='m'||G.t<p.cdS)return;
  const s=sabPick(p);
  if(s&&s.full){say(p,'Déjà quatre sabotages actifs.',1);return;}
  if(!s){say(p,'Rien à saboter ici (objectif, boîte à fusibles, porte ou levier).',1);return;}
  s.fn();p.cdS=G.t+25;
}
function nearestOther(p,r){let b=null,bd=r;for(const t of G.P){if(t===p||!t.alive||t.escaped||t.hidden>=0||Math.abs(t.y-p.y)>2)continue;const d=pd(p,t.x,t.z);if(d<bd){bd=d;b=t;}}return b;}
function pushAway(src,t,dist){let dx=t.x-src.x,dz=t.z-src.z;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;const e={x:t.x,y:t.y,z:t.z};moveEnt(e,dx*dist,dz*dist);tp(t,e.x,e.z,t.y);}
function near(p,r,self){return G.P.filter(t=>t.alive&&!t.escaped&&(self||t!==p)&&Math.abs(t.y-p.y)<2.5&&pd(p,t.x,t.z)<r);}
function useQ(p,a){
  if(G.t<p.cdQ||G.t<p.silU)return;p.yaw=a.yw??p.yaw;const c=CHARS[p.ch],[fx_,fz]=fwd(p.yaw);let ok=false;
  switch(c.k){
    case 'ath':{const t=nearestOther(p,2.6);if(t){if(stun(t,4)){snd('hit',t.x,t.z,t.y,14);vfx('stun',t.x,t.y,t.z);hit(p);say(t,'Vous avez été assommé !',1);say(p,'Gant de boxe : cible assommée !');}ok=true;}else say(p,'Personne à portée.',1);break;}
    case 'esc':zoneAdd('smoke',p.x+fx_*1.6,p.z+fz*1.6,p.y,3.2,8);snd('puff',p.x,p.z,p.y,14);say(p,'Fumigène lancé.');ok=true;break;
    case 'exp':zoneAdd('insect',p.x+fx_*5,p.z+fz*5,p.y,2.4,10);snd('puff',p.x,p.z,p.y,14);say(p,'Nuage d’insectes lâché.');ok=true;break;
    case 'jou':p.scanU=G.t+5;say(p,'Indiscrétion : tous les invités sont visibles 5 s.');ok=true;break;
    case 'ing':{let b=null,bd=4.2;for(const d of WORLD.doors){const dd=pd(p,d.cx,d.cz);if(dd<bd&&Math.abs(d.y-p.y)<2&&d.state<3){bd=dd;b=d;}}
      if(b){setDoor(b,2);b.barU=G.t+18;vfx('bar',b.cx,b.y,b.cz);say(p,'Porte barricadée 18 s.');ok=true;}else say(p,'Aucune porte proche.',1);break;}
    case 'enf':{const t=rayTarget(p,p.yaw,18,.12);if(t){if(G.t>=t.invU){t.blU=G.t+4;say(t,'Un caillou vous aveugle !',1);hit(p);say(p,'Lance-pierre : cible aveuglée !');}ok=true;}else say(p,'Personne dans la ligne de mire.',1);break;}
    case 'art':zoneAdd('paint',p.x,p.z,p.y,1.6,15,p.i);vfx('aura',p.x,p.y,p.z,{c:0xf2d21f});say(p,'Flaque de peinture posée.');ok=true;break;
    case 'sta':{const e={x:p.x,y:p.y,z:p.z};moveEnt(e,fx_*10,fz*10);const k=Math.random()<.5?'scream':'run';snd(k,e.x,e.z,p.y,34);vfx('note',e.x,p.y+1.4,e.z);say(p,'Leurre sonore déclenché.');ok=true;break;}
    case 'che':{for(const t of near(p,4.5,true)){t.spU=G.t+5;t.spM=Math.max(G.t<t.spU?t.spM:1,1.3);}vfx('aura',p.x,p.y,p.z,{c:0xffffff});say(p,'Coup de feu : vitesse ×1,3 pour les proches !');ok=true;break;}
    case 'gee':zoneAdd('drone',p.x,p.z,p.y,6,25,p.i);say(p,'Drone posé : il vous signalera les passages.');ok=true;break;
    case 'cia':{let best=0;for(let d=.5;d<=4;d+=.5){if(walkClear(p.x,p.z,p.y,p.x+fx_*d,p.z+fz*d,p.y))best=d;else break;}
      if(best<1)say(p,'Pas la place pour rouler.',1);else{tp(p,p.x+fx_*best,p.z+fz*best,p.y);p.invU=Math.max(p.invU,G.t+1.5);vfx('aura',p.x,p.y,p.z,{c:0x4b3fd0});ok=true;}break;}
    case 'mus':{const ts=near(p,5);for(const t of ts){pushAway(p,t,2.6);stun(t,.8);vfx('stun',t.x,t.y,t.z);}vfx('aura',p.x,p.y,p.z,{c:0x9b4fe0});snd('hit',p.x,p.z,p.y,20);say(p,ts.length?'Onde de choc : '+ts.length+' invité(s) repoussé(s).':'Onde de choc : personne à portée.');ok=true;break;}
    case 'rob':zoneAdd('beacon',p.x,p.z,p.y,3,40,p.i);p.lastBeacon={x:p.x,z:p.z,y:p.y,until:G.t+40};say(p,'Balise posée (40 s).');ok=true;break;
    case 'spa':{const t=rayTarget(p,p.yaw,14,.14);if(t){t.invertU=G.t+4;if(t.bot)stun(t,1.2);hit(p);vfx('stun',t.x,t.y,t.z);say(t,'Vos commandes sont inversées !',1);say(p,'Détournement : commandes inversées.');ok=true;}else say(p,'Personne dans la ligne de mire.',1);break;}
    case 'med':zoneAdd('acid',p.x+fx_*2.5,p.z+fz*2.5,p.y,2,10,p.i);snd('puff',p.x,p.z,p.y,14);say(p,'Flaque d’acide déposée (10 s).');ok=true;break;
  }
  if(ok)p.cdQ=G.t+c.q.cd;
}
function doUnique(p,key,a){
  const [fx_,fz]=fwd(p.yaw);let ok=false,cd=1e9;
  switch(key){
    case 'ath':p.spU=G.t+6;p.spM=1.6;p.invU=G.t+6;vfx('aura',p.x,p.y,p.z,{c:0xff5a3a});say(p,'Dopage : vitesse ×1,6 et insensible 6 s !');ok=true;break;
    case 'esc':p.invisU=G.t+7;vfx('aura',p.x,p.y,p.z,{c:0x7ab0ff});say(p,'Invisible pendant 7 s.');ok=true;break;
    case 'exp':{const t=rayTarget(p,p.yaw,40,.05);snd('shot',p.x,p.z,p.y,70);ok=true;cd=60;
      if(t){vfx('shot',p.x,p.y,p.z,{yw:p.yaw});if(t.role==='m'){neutralize(t);say(null,'Coup de fusil ! Le meurtrier est neutralisé.');}else{stun(t,6);vfx('stun',t.x,t.y,t.z);say(t,'Touché par erreur ! Vous êtes assommé.',1);say(p,'Mauvaise cible ! Rechargement : 60 s.',1);}}
      else{vfx('shot',p.x,p.y,p.z,{yw:p.yaw});say(p,'Raté ! Rechargement : 60 s.',1);}break;}
    case 'jou':{const t=nearestOther(p,12);if(t){G.links.push({a:p.i,b:t.i,done:false});say(p,'Lien établi avec un invité proche.');ok=true;}else say(p,'Personne à proximité.',1);break;}
    case 'ing':p.shU=G.t+40;vfx('aura',p.x,p.y,p.z,{c:0x40e0f0});say(p,'Protection : une vie supplémentaire (40 s).');ok=true;break;
    case 'enf':zoneAdd('gum',p.x+fx_*3.4,p.z+fz*3.4,p.y,1.4,10);zoneAdd('gum',p.x+fx_*5.6,p.z+fz*5.6,p.y,1.4,10);say(p,'Bulles de chewing-gum déployées.');ok=true;break;
    case 'art':{const c=G.P.filter(t=>t!==p&&t.alive&&!t.escaped);if(c.length){const t=pick(c);p.apC=t.ch;p.apU=G.t+15;vfx('aura',p.x,p.y,p.z,{c:0xf2d21f});say(p,'Déguisement : vous ressemblez à '+CHARS[t.ch].n+' pendant 15 s.');ok=true;}break;}
    case 'sta':zoneAdd('decoy',p.x,p.z,p.y,.8,25,p.i,p.ch);vfx('aura',p.x,p.y,p.z,{c:0xff7eb9});say(p,'Sosie créé (25 s).');ok=true;break;
    case 'che':p.rushU=G.t+5;p.spU=G.t+5;p.spM=1.7;vfx('aura',p.x,p.y,p.z,{c:0xffffff});say(p,'Service en rafale : foncez, vous assommez sur votre passage !');ok=true;break;
    case 'cia':{const t=rayTarget(p,p.yaw,20,.12);if(!t){say(p,'Personne dans la ligne de mire.',1);break;}
      const sus=(t.role==='m')===(Math.random()<.75);say(p,'Sonde : cet invité semble '+(sus?'suspect':'innocent')+' (fiabilité ~75 %).');
      if(p.role==='m')say(p,'Capacités restantes : '+(G.t>=t.cdQ?'Q prête':'Q en recharge')+', '+(t.cdF>=1e8?'F déjà utilisée':'F disponible')+'.');
      ok=true;break;}
    case 'mus':zoneAdd('speaker',p.x+fx_*2.5,p.z+fz*2.5,p.y,4,10,p.i);snd('piano',p.x,p.z,p.y,46);say(p,'Enceinte géante posée : 3 s dedans = assommé.');ok=true;break;
    case 'rob':{const lb=p.lastBeacon;if(lb&&G.t<lb.until){vfx('aura',p.x,p.y,p.z,{c:0x9adf3a});tp(p,lb.x,lb.z,lb.y);vfx('aura',lb.x,lb.y,lb.z,{c:0x9adf3a});say(p,'Téléportation réussie.');ok=true;cd=40;}else say(p,'Posez d’abord une balise (Q).',1);break;}
    case 'spa':{for(const t of near(p,7,true)){t.silU=G.t+4;t.slU=G.t+4;t.slM=.5;}vfx('aura',p.x,p.y,p.z,{c:0xff8a1f});say(p,'Apesanteur : capacités coupées dans la pièce (vous aussi) 4 s.');ok=true;break;}
    case 'med':{if(p.reviveUsed){say(p,'Réanimation déjà utilisée.',1);break;}p.reviveReady=true;say(p,'Réanimation prête : maintenez E sur un corps (4 s).');ok=true;break;}
  }
  return [ok,cd];
}
function useF(p,a){
  if(G.t<p.cdF||G.t<p.silU)return;p.yaw=a.yw??p.yaw;const c=CHARS[p.ch];let key=c.k;
  if(key==='gee'){if(!p.seenF||G.t-p.seenT>60){say(p,'Aucune capacité unique observée récemment.',1);return;}key=p.seenF;}
  const [ok,cd]=doUnique(p,key,a);
  if(ok){p.cdF=G.t+cd;
    if(c.k==='gee')p.seenF=null;
    else for(const g of G.P)if(g!==p&&g.alive&&CHARS[g.ch].k==='gee'&&Math.abs(g.y-p.y)<2.5&&pd(g,p.x,p.z)<22){g.seenF=key;g.seenT=G.t;say(g,'Capacité observée : '+c.f.n+'. Vous pouvez la copier (F).');}}
}
function useTool(p,a){
  const c=CHARS[p.ch];if(!c.p||G.t<p.cdP||G.t<p.silU)return;p.yaw=a.yw??p.yaw;
  switch(c.k){
    case 'esc':{const t=rayTarget(p,p.yaw,9,.18);p.cdP=G.t+22;if(t&&G.t>=t.invU){t.silU=G.t+6;t.slU=G.t+4;t.slM=.5;vfx('stun',t.x,t.y,t.z);hit(p);say(t,'Paralysé ! Capacités coupées.',1);say(p,'Pistolet paralysant : touché !');}else say(p,'Raté.',1);snd('puff',p.x,p.z,p.y,16);break;}
    case 'enf':{const t=rayTarget(p,p.yaw,7,.2);p.cdP=G.t+16;if(t&&G.t>=t.invU){const[fx,fz]=fwd(p.yaw);stun(t,1.5);tp(t,p.x+fx*1.4,p.z+fz*1.4,p.y);vfx('stun',t.x,t.y,t.z);hit(p);say(p,'Yoyo : invité attrapé !');}else say(p,'Raté.',1);break;}
    case 'che':{const t=rayTarget(p,p.yaw,2.4,.6);p.cdP=G.t+10;if(t&&stun(t,3)){vfx('stun',t.x,t.y,t.z);snd('hit',t.x,t.z,t.y,14);hit(p);say(t,'La louche vous assomme !',1);say(p,'Louche : cible assommée (vous êtes ralenti).');p.slU=G.t+3;p.slM=.5;}else{say(p,'Raté.',1);p.cdP=G.t+3;}break;}
    case 'cia':{const t=rayTarget(p,p.yaw,2.4,.5);p.cdP=G.t+14;if(t&&G.t>=t.invU){if(p.cuff!==undefined&&p.cuff>=0){const o=G.P[p.cuff];if(o){o.silU=Math.min(o.silU,G.t);o.slU=Math.min(o.slU,G.t);}}
        p.cuff=t.i;t.silU=G.t+6;t.slU=G.t+6;t.slM=.55;vfx('stun',t.x,t.y,t.z);hit(p);say(t,'Menotté ! Capacités coupées, vous êtes ralenti.',1);say(p,'Menottes posées.');}else say(p,'Raté.',1);break;}
    case 'med':{p.cdP=G.t+6;p.pills=(p.pills||0)+1;const e=ri(6);
      if(e===0){p.spU=G.t+5;p.spM=1.45;say(p,'Pilule : vitesse !');}else if(e===1){p.invisU=G.t+3;say(p,'Pilule : invisibilité 3 s.');}
      else if(e===2){p.shU=G.t+10;say(p,'Pilule : bouclier 10 s.');}else if(e===3){stun(p,1.5);say(p,'Pilule : nausée !',1);}
      else if(e===4){p.blU=G.t+2.5;say(p,'Pilule : vue trouble !',1);}else say(p,'Pilule : sans effet.');
      vfx('aura',p.x,p.y,p.z,{c:0x2f9e44});
      if(p.pills>=3){p.pills=0;p.slU=G.t+10;p.slM=.6;say(p,'Trop de pilules : vous êtes ralenti 10 s.',1);}break;}
  }
}
function reviveAct(p,i){
  if(CHARS[p.ch].k!=='med'||!p.reviveReady)return;
  const v=G.P[i],bi=G.bodies.findIndex(b=>b.i===i);if(!v||v.alive||v.role==='m'||bi<0)return;
  const b=G.bodies[bi];if(pd(p,b.x,b.z)>2.8||Math.abs(p.y-b.y)>2)return;
  G.bodies.splice(bi,1);v.alive=true;v.escaped=false;tp(v,b.x,b.z,b.y);stun(v,1.5);v.invU=G.t+3;
  p.reviveReady=false;p.reviveUsed=true;p.cdF=1e9;vfx('aura',b.x,b.y,b.z,{c:0x2f9e44});snd('chime',b.x,b.z,b.y,30);
  say(v,'Vous avez été réanimé !');say(p,'Réanimation réussie !');
}

/* ---------- simulation tick ---------- */
function speedOf(p){
  let m=1;if(G.t<p.spU)m*=p.spM;if(G.t<p.slU)m*=p.slM;if(CHARS[p.ch].k==='mus')m*=1.12;
  for(const z of G.zones){if(Math.abs(z.y-p.y)>1.5||pd(p,z.x,z.z)>=z.r)continue;
    if(z.type==='insect'){m*=.12;break;}if(z.type==='acid'){m*=.2;break;}if(z.type==='paint'&&z.own!==p.i){m*=.4;break;}}
  return m;
}
function hostTick(dt,getPos){
  if(!G||G.over)return;
  G.t+=dt;
  // sabotage is brief: blackouts and jams wear off by themselves (repairing earlier still works)
  WORLD.fuses.forEach((f,i)=>{if(!G.fuse[i]&&G.t-G.fuseT[i]>SAB_FUSE){G.fuse[i]=1;snd('chime',f.x,f.z,f.y,30);say(null,'Le courant revient.');}});
  WORLD.doors.forEach(d=>{if(d.state===3&&G.t-d.sabT>SAB_JAM){d.state=0;d.col.on=false;snd('chime',d.cx,d.cz,d.y,20);}});
  WORLD.exits.forEach(e=>{if(e.jam&&G.t-e.jamT>SAB_JAM){e.jam=false;snd('chime',e.lx,e.lz,0,24);}});
  G.ob.forEach((o,i)=>{if(o.st===2&&G.t-o.sabT>SAB_OBJ){o.st=0;snd('chime',OBJS[i].x,OBJS[i].z,OBJS[i].y,24);}});
  for(const p of G.P){
    if(!p.bot){const s=getPos(p);if(s){p.x=s.x;p.y=s.y;p.z=s.z;p.yaw=s.yw;p.pit=s.pt;p.fl=s.fl;}}
    else if(p.alive&&!p.escaped)botThink(p,dt);
    if(p.hidden>=0&&G.t>p.hideU){const h=WORLD.hides[p.hidden];tp(p,h.fx,h.fz,h.y);p.hidden=-1;p.hideCd=G.t+15;}
    if(p.linked>=0&&false)0;
  }
  for(const p of G.P){const mv=hyp(p.x,p.z,p.px===undefined?p.x:p.px,p.pz===undefined?p.z:p.pz)/Math.max(dt,.001);p.still=mv<.15?(p.still||0)+dt:0;p.px=p.x;p.pz=p.z;
    if(p.alive&&!p.escaped&&G.t<p.rushU)for(const q of near(p,1.2)){if(G.t>=(q.rushHit||0)){q.rushHit=G.t+1.5;if(stun(q,2.5)){vfx('stun',q.x,q.y,q.z);snd('hit',q.x,q.z,q.y,14);say(q,'Le chef vous a renversé !',1);}}}
    p.inSpk=false;}
  for(const z of G.zones){
    if(z.type==='drone'||z.type==='beacon'){const ow=G.P[z.own];if(ow&&ow.alive&&G.t>=z.np){const q=G.P.find(q=>q.alive&&!q.escaped&&q.i!==z.own&&q.hidden<0&&Math.abs(q.y-z.y)<2&&pd(q,z.x,z.z)<z.r);
      if(q){const rm=roomAt(q.x,q.z,q.y);say(ow,(z.type==='drone'?'Drone':'Balise')+' : un invité passe'+(rm?' ('+rm.n+')':'')+'.');vfx('note',z.x,z.y+1,z.z);z.np=G.t+4;}}}
    else if(z.type==='speaker'){for(const q of G.P)if(q.alive&&!q.escaped&&q.i!==z.own&&Math.abs(q.y-z.y)<2.5&&pd(q,z.x,z.z)<z.r)q.inSpk=true;}
  }
  for(const p of G.P){if(p.inSpk){p.spk=(p.spk||0)+dt;if(p.spk>3){p.spk=0;if(stun(p,4)){vfx('stun',p.x,p.y,p.z);say(p,'L’enceinte vous assomme !',1);}}}else p.spk=Math.max(0,(p.spk||0)-dt);}
  for(const d of WORLD.doors)if(d.state===2&&G.t>d.barU)d.state=1;
  for(const e of WORLD.exits)if(e.open&&G.t>e.openU){e.open=false;e.col.on=true;}
  for(let i=G.zones.length-1;i>=0;i--){const z=G.zones[i];if(G.t>z.until){if(z.col)z.col.on=false;if(z.col){const k=COL.indexOf(z.col);if(k>=0)COL.splice(k,1);const q=DYN.findIndex(d=>d.c===z.col);if(q>=0)DYN.splice(q,1);}G.zones.splice(i,1);}}
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
    ex:WORLD.exits.map(e=>(e.active&&G.phase>=1?1:0)|(e.open?2:0)|(e.used?4:0)|(e.jam?8:0)),
    vt:G.vents,tl:G.tl,fz:G.fuse.reduce((m,f,i)=>m|(f?0:1<<i),0),
    pl:G.P.map(p=>{let f=0;if(!p.alive)f|=1;if(p.escaped)f|=2;if(G.t<p.stunU)f|=4;if(p.hidden>=0)f|=8;if(G.t<p.invisU)f|=16;if(p.fl&1)f|=64;if(p.fl&2)f|=32;if(G.t<p.invU)f|=128;if(G.t<(p.atkU||0))f|=256;
      if(p.alive&&(p.fl&1)&&p.still>.8&&p.hidden<0){const k=CHARS[p.ch].k;if(k==='art')f|=16;else if(k==='sta')f|=512;}
      return [f,r1(p.x),r1(p.y),r1(p.z),Math.round(p.yaw*100)/100,G.t<p.apU?p.apC:-1];}),
    bd:G.bodies.map(b=>[b.i,r1(b.x),r1(b.y),r1(b.z),r2(b.yaw)]),
    zn:G.zones.map(z=>[z.id,z.type,r1(z.x),r1(z.z),r1(z.y),z.r,r1(z.until),z.ex]),
    lt:G.lights,ev:G.evs.filter(e=>e.t0>G.t-2).map(e=>e),al:G.P.filter(p=>p.alive&&!p.escaped).length};
  if(G.over){S.ov=[G.win,G.why,G.mur.i];S.ro=G.P.map(p=>p.role==='m'?1:0);}
  G.evs=G.evs.filter(e=>e.t0>G.t-4);
  return S;
}
function pvFor(p){
  const n=G.t,r=x=>Math.max(0,r1(x-n));
  return {r:p.role,c:p.ch,al:p.alive?1:0,es:p.escaped?1:0,st:r(p.stunU),sp:r2(speedOf(p)),si:r(p.silU),iv:r(p.invU),sh:r(p.shU),bl:r(p.blU),
    cq:r(p.cdQ),cf:p.cdF>=1e8?-1:r(p.cdF),ca:r(p.cdA),cs:r(p.cdS),cg:r(p.cdG),cp:r(p.cdP),hd:p.hidden,sc:r(p.scanU),ic:r(p.invisU),
    ix:r(p.invertU||0),rv:p.reviveReady?1:0,tp:p.tpN,tt:p.tpTo,lk:G.links.some(l=>!l.done&&(l.a===p.i||l.b===p.i))?1:0,hc:r(p.hideCd)};
}

/* ---------- bots ---------- */
function botGo(p,tx,tz,ty,run,dt,stop){
  stop=stop||.6;const a=p.ai;
  if(!a.goal||hyp(a.goal[0],a.goal[1],tx,tz)>1.2||a.goal[2]!==ty||G.t>a.replan){
    a.goal=[tx,tz,ty];a.replan=G.t+2.5;
    const path=planPath(p.x,p.z,p.y,tx,tz,ty,G.t);a.path=path||[];a.pi=0;a.blocked=!path;
  }
  if(a.blocked)return false;
  let wp=null;
  while(a.pi<a.path.length){const n=a.path[a.pi],last=a.pi===a.path.length-1;
    if(hyp(p.x,p.z,n.x,n.z)<(last?stop:.45)&&Math.abs(p.y-n.y)<1.6){a.pi++;continue;}wp=n;break;}
  if(!wp){p.fl=0;return true;}
  const dx=wp.x-p.x,dz=wp.z-p.z,d=Math.hypot(dx,dz),sp=(run?5.2:3.3)*speedOf(p)*dt;
  if(G.t>=p.stunU){
    moveEnt(p,dx/(d||1)*Math.min(sp,d),dz/(d||1)*Math.min(sp,d));
    p.yaw=Math.atan2(-dx,-dz);p.fl=run?2:0;
    for(const dr of WORLD.doors)if(dr.state===1&&Math.abs(dr.y-p.y)<1.5&&hyp(p.x,p.z,dr.cx,dr.cz)<1.9)setDoor(dr,0);
    a.stuckT+=dt;if(a.stuckT>1.2){a.stuckT=0;if(hyp(p.x,p.z,a.lastX,a.lastZ)<.25){a.stuck=(a.stuck||0)+1;a.replan=0;
        const ang=Math.random()*6.28;moveEnt(p,Math.cos(ang)*.8,Math.sin(ang)*.8);}else a.stuck=0;a.lastX=p.x;a.lastZ=p.z;}
  }
  for(const q of G.P){if(q===p||!q.alive||q.escaped||Math.abs(q.y-p.y)>1.5)continue;const ox=p.x-q.x,oz=p.z-q.z,dd=Math.hypot(ox,oz);
    if(dd<.6){const push=(.6-dd)*.5,ux=dd>.01?ox/dd:Math.random()-.5,uz=dd>.01?oz/dd:Math.random()-.5;p.x+=ux*push;p.z+=uz*push;collide(p);}}
  stepVert(p,dt);
  return false;
}
const STAND=OBJS.map(standPoint);
