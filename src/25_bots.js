
/* ============================ bot behaviour ============================ */
/* Bots play the whole game: tasks, repairs, lights, hiding, vents, movables, abilities, exits. */
function botThink(p,dt){
  if(!p.alive)return;
  if(G.t<p.stunU){p.fl=0;stepVert(p,dt);return;}
  if(p.role==='m')thinkMur(p,dt);else thinkInn(p,dt);
}
function facePlayer(p,t){p.yaw=Math.atan2(-(t.x-p.x),-(t.z-p.z));}
function roomOf(p){return roomAt(p.x,p.z,p.y);}
function roomLit(r){if(!r)return true;return !!((G.lights>>r.idx)&1)&&!!G.fuse[r.lv+1];}
function ckey(p){return CHARS[p.ch].k;}

/* ---- things to repair (a sabotage becomes known a few seconds later) ---- */
function repairList(p){
  const out=[],ing=ckey(p)==='ing',gee=ckey(p)==='gee',now=G.t;
  const known=(t,x,z,y)=>{if(!t)return false;const far=hyp(p.x,p.z,x,z)+Math.abs(p.y-y)*3>50;return now-t>(far?25:8);};
  G.ob.forEach((o,i)=>{if(o.st===2&&known(o.sabT,OBJS[i].x,OBJS[i].z,OBJS[i].y)){const s=STAND[i];out.push({k:'rep',i,sx:s[0],sz:s[1],sy:s[2],tx:OBJS[i].x,tz:OBJS[i].z,near:1.8,dur:ing?2.5:gee?3:6,act:{t:'rep',i}});}});
  WORLD.fuses.forEach((f,i)=>{if(!G.fuse[i]&&known(G.fuseT[i],f.x,f.z,f.y)){const rm=roomAt(f.x,f.z,f.y)||ROOMS[0];let dx=rm.cx-f.x,dz=rm.cz-f.z;const l=Math.hypot(dx,dz)||1;
    out.push({k:'repf',i,sx:f.x+dx/l*1.1,sz:f.z+dz/l*1.1,sy:f.y,tx:f.x,tz:f.z,near:2,dur:ing?2.5:gee?2.5:5,act:{t:'repf',i}});}});
  WORLD.doors.forEach((d,i)=>{if(d.state===3&&known(d.sabT,d.cx,d.cz,d.y)){
    const nx=d.ax==='x'?0:1,nz=d.ax==='x'?1:0,side=((p.x-d.cx)*nx+(p.z-d.cz)*nz)>=0?1:-1;
    out.push({k:'repd',i,sx:d.cx+nx*side*1.0,sz:d.cz+nz*side*1.0,sy:d.y,tx:d.cx,tz:d.cz,near:2.2,dur:ing?1.5:gee?2:3.5,act:{t:'repd',i}});}});
  if(G.phase===1)WORLD.exits.forEach((e,i)=>{if(e.jam&&e.active&&known(e.jamT,e.lx,e.lz,0))
    out.push({k:'repl',i,sx:e.lx-e.def.dirx,sz:e.lz-e.def.dirz,sy:0,tx:e.lx,tz:e.lz,near:2,dur:ing?2.5:gee?2.5:5,act:{t:'repl',i}});});
  return out;
}
function pickRepair(p){
  const l=repairList(p);if(!l.length)return null;
  let best=null,bs=1e9;for(const r of l){const s=hyp(p.x,p.z,r.sx,r.sz)+Math.abs(p.y-r.sy)*3+rnd(6);if(s<bs){bs=s;best=r;}}
  return best;
}

/* ---- exits: spread over the active exits, avoid the one the murderer is camping ---- */
function pickExit(p){
  const m=G.mur,act=WORLD.exits.filter(e=>e.active);if(!act.length)return null;
  const un=act.filter(e=>!e.used),pool=un.length?un:act;
  let best=null,bs=1e9;
  for(const e of pool){
    let s=hyp(p.x,p.z,e.lx,e.lz)+Math.abs(p.y)*3;
    if(m.alive&&(p.ai.knows||hyp(m.x,m.z,p.x,p.z)<16)&&hyp(m.x,m.z,e.lx,e.lz)<9)s+=40;
    const crowd=G.P.filter(q=>q!==p&&q.alive&&!q.escaped&&q.role!=='m'&&q.ai&&q.ai.work&&q.ai.work.k==='lev'&&q.ai.work.i===e.i).length;s+=crowd*14;
    if(e.jam)s+=25;
    s+=((p.i*7+e.i*3)%5)*1.5;
    if(s<bs){bs=s;best=e;}
  }
  return best;
}

/* ---- abilities: each of the 15 characters knows when to use its powers ---- */
function botAbil(p,m,d,vis,murd){
  const a=p.ai,k=ckey(p);
  const aim=()=>{facePlayer(p,m);return{yw:p.yaw,pt:0};};
  const Q=()=>{if(G.t>=p.cdQ&&G.t>=p.silU)hostAct(p,Object.assign({t:'q'},aim()));};
  const F=()=>{if(G.t>=p.cdF&&G.t>=p.silU)hostAct(p,Object.assign({t:'f'},aim()));};
  const T=()=>{if(G.t>=p.cdP&&G.t>=p.silU)hostAct(p,Object.assign({t:'pr'},aim()));};
  switch(k){
    case 'ath':if(d<2.6)Q();else if(d<7)F();break;
    case 'esc':if(vis&&d<9&&d>1.5)T();if(d<5)Q();else if(d<9)F();break;
    case 'exp':if(vis&&d<18&&G.t>=p.cdF){a.aimT=(a.aimT||0)+.05;if(a.aimT>1.2){a.aimT=0;facePlayer(p,m);if(Math.random()<.5)hostAct(p,{t:'f',yw:p.yaw});else{p.cdF=G.t+60;snd('shot',p.x,p.z,p.y,70);}}}if(d<8)Q();break;
    case 'ing':if(d<6)F();if(d<5)Q();break;
    case 'enf':if(vis&&d<7)T();if(vis&&d<16)Q();if(d<8)F();break;
    case 'art':if(d<9){Q();F();}break;
    case 'sta':if(d<10){Q();F();}break;
    case 'che':if(d<2.4)T();if(d<9)Q();if(d<7)F();break;
    case 'gee':if(p.seenF&&d<8)F();if(d<10)Q();break;
    case 'cia':if(d<2.4)T();if(d<3)Q();if(vis&&d<18&&Math.random()<.02)F();break;
    case 'mus':if(d<4)Q();if(d<8)F();break;
    case 'rob':if(d<9){Q();F();}break;
    case 'spa':if(vis&&d<14)Q();if(d<6)F();break;
    case 'med':if(d<10)Q();break;
    case 'jou':if(d<10&&Math.random()<.03)F();break;
  }
}
function botAbilMur(p,t,d,vis){
  const k=ckey(p),aim=()=>{facePlayer(p,t);return{yw:p.yaw,pt:0};};
  const Q=()=>{if(G.t>=p.cdQ&&G.t>=p.silU)hostAct(p,Object.assign({t:'q'},aim()));};
  const F=()=>{if(G.t>=p.cdF&&G.t>=p.silU)hostAct(p,Object.assign({t:'f'},aim()));};
  const T=()=>{if(G.t>=p.cdP&&G.t>=p.silU)hostAct(p,Object.assign({t:'pr'},aim()));};
  switch(k){
    case 'ath':if(d>5&&d<12&&vis)F();break;
    case 'esc':if(vis&&d<9&&d>2.5)T();if(d>6&&d<14&&vis)F();break;
    case 'exp':if(vis&&d>4&&d<25)F();break;
    case 'ing':if(G.t>40)F();break;
    case 'enf':if(vis&&d>2.4&&d<7)T();if(vis&&d<14)Q();break;
    case 'art':if(G.t>45&&Math.random()<.01)F();break;
    case 'che':if(d<2.4)T();if(d<9&&d>3)F();break;
    case 'cia':if(d<2.4)T();if(vis&&d>4&&d<9)Q();break;
    case 'mus':if(vis&&d<6&&d>2)F();break;
    case 'spa':if(vis&&d<14)Q();if(d<7)F();break;
    case 'sta':if(Math.random()<.004)Q();break;
  }
}

/* ---- escape helpers: hiding, vents, movables ---- */
function botHide(p,dt){
  const a=p.ai;if(p.hidden>=0||G.t<p.hideCd||G.t<(a.hideCd2||0))return false;
  if(!a.hideGoal){
    let best=null,bd=10;for(const h of WORLD.hides){const d=hyp(p.x,p.z,h.x,h.z);if(d<bd&&Math.abs(h.y-p.y)<2&&hyp(G.mur.x,G.mur.z,h.x,h.z)>d+1.5){bd=d;best=h;}}
    if(!best)return false;a.hideGoal=best;
  }
  const h=a.hideGoal;
  if(hyp(p.x,p.z,h.x,h.z)<1.7){hostAct(p,{t:'hide'});a.hideGoal=null;a.hideStay=G.t+rnd(5,9);a.hideCd2=G.t+25;return true;}
  botGo(p,h.fx,h.fz,h.y,true,dt,.5);return true;
}
function botVent(p){
  const a=p.ai;if(G.t<(a.ventCd||0))return false;
  let best=null,bd=2.3;for(const v of WORLD.vents){const d=hyp(p.x,p.z,v.cx,v.cz);if(d<bd&&Math.abs(p.y-v.y)<2){bd=d;best=v;}}
  if(!best)return false;
  if(!((G.vents>>best.i)&1))hostAct(p,{t:'vent',i:best.i});
  const V=VENTS[best.i],nx=V.ax==='x'?0:1,nz=V.ax==='x'?1:0,side=((p.x-best.cx)*nx+(p.z-best.cz)*nz)>=0?1:-1;
  tp(p,best.cx-nx*side*1.5,best.cz-nz*side*1.5,p.y);stun(p,.7);vfx('bar',best.cx,best.y,best.cz);a.ventCd=G.t+14;a.path=[];a.goal=null;return true;
}
function nearVent(p,r){let best=null,bd=r;for(const v of WORLD.vents){const d=hyp(p.x,p.z,v.cx,v.cz);if(d<bd&&Math.abs(p.y-v.y)<2){bd=d;best=v;}}return best;}
function botFurn(p){
  const a=p.ai;if(G.t<(a.furnCd||0))return;
  let best=null,bd=3.4;for(const f of WORLD.furn){if(Math.abs(f.y-p.y)>2)continue;const b=f.box[f.s],d=hyp(p.x,p.z,(b[0]+b[2])/2,(b[1]+b[3])/2);if(d<bd){bd=d;best=f;}}
  if(!best)return;a.furnCd=G.t+15;hostAct(p,{t:'furn',i:best.i});
}

/* ---- work items ---- */
function setWork(p,w){p.ai.work=Object.assign({t:0},w);}
function runWork(p,dt){
  const a=p.ai,w=a.work;
  if(!validWork(w)){a.work=null;a.wait=rnd(.5,2);return;}
  if(botGo(p,w.sx,w.sz,w.sy,!!w.run,dt,.8)||(hyp(p.x,p.z,w.tx,w.tz)<w.near&&Math.abs(p.y-w.sy)<2)){
    w.t+=dt;p.fl=0;p.yaw=Math.atan2(-(w.tx-p.x),-(w.tz-p.z));
    if(w.t>=w.dur){finishWork(p,w);a.work=null;a.wait=rnd(1.5,5);}
  }
}
function validWork(w){
  switch(w.k){
    case 'obj':{const o=G.ob[w.i];return o.st===0;}
    case 'rep':return G.ob[w.i].st===2;
    case 'repf':return !G.fuse[w.i];
    case 'repd':return WORLD.doors[w.i].state===3;
    case 'repl':{const e=WORLD.exits[w.i];return e.jam&&e.active;}
    case 'lev':{const e=WORLD.exits[w.i];return G.phase===1&&e.active&&!e.open&&!e.jam;}
    case 'sw':return true;
    case 'rev':return G.bodies.some(b=>b.i===w.i);
    default:return true;
  }
}
function finishWork(p,w){
  switch(w.k){
    case 'obj':hostAct(p,{t:G.ob[w.i].func?'obj':'try',i:w.i});p.ai.last=w.i;break;
    case 'lev':hostAct(p,{t:'lev',i:w.i});break;
    case 'sw':hostAct(p,{t:'sw',i:w.i});break;
    case 'rev':reviveAct(p,w.i);break;
    case 'inv':break;
    default:hostAct(p,w.act);
  }
}
function workObj(p,i,k){
  const d=OBJS[i],s=STAND[i],gee=ckey(p)==='gee';
  return{k:k||'obj',i,sx:s[0],sz:s[1],sy:s[2],tx:d.x,tz:d.z,near:1.7,dur:k==="rep"?6:(gee?rnd(7,11):rnd(13,22)),act:{t:'rep',i}};
}

/* ============================ innocents ============================ */
function thinkInn(p,dt){
  const a=p.ai,m=G.mur,rm=roomOf(p);
  // hiding: stay still until the coast is clear
  if(p.hidden>=0){p.fl=0;if(G.t>a.hideStay&&(!m.alive||hyp(p.x,p.z,m.x,m.z)>11||Math.abs(m.y-p.y)>2)){hostAct(p,{t:'hide'});a.fleeU=0;}return;}
  const dm=hyp(p.x,p.z,m.x,m.z),lvl=Math.abs(m.y-p.y)<2;
  const vis=m.alive&&visibleTo(p,m)&&lvl&&los(p.x,p.z,p.y,m.x,m.z,m.y);
  const range=a.knows?(roomLit(rm)?13:6):0;
  const sees=vis&&dm<range;
  // news travel: bots who know the murderer tell the ones next to them
  if(a.knows&&G.t>(a.shareT||0)){a.shareT=G.t+5;for(const q of G.P)if(q!==p&&q.bot&&q.alive&&q.role!=='m'&&hyp(p.x,p.z,q.x,q.z)<8)q.ai.knows=true;}
  // the murderer is stunned and known : bind him
  if(a.knows&&m.alive&&G.t<m.stunU&&lvl&&dm<9){
    if(dm<2.3){a.bindT=(a.bindT||0)+dt;p.fl=0;facePlayer(p,m);if(a.bindT>2){a.bindT=0;hostAct(p,{t:'bind',i:m.i});}}
    else{a.bindT=0;botGo(p,m.x,m.z,m.y,true,dt,1.6);}
    return;
  }
  if(sees){a.fleeU=G.t+4;a.work=null;botAbil(p,m,dm,true);}
  else if(a.knows&&m.alive&&lvl&&dm<5&&G.t<a.fleeU)botAbil(p,m,dm,false);
  // desperate exit run: phase 1 for a long time → stop being shy near a lever
  const desperate=G.phase===1&&G.t-(G.exitsT||0)>140;
  if(G.t<a.fleeU&&!(desperate&&WORLD.exits.some(e=>e.active&&!e.open&&hyp(p.x,p.z,e.lx,e.lz)<7&&dm>4))){
    if(botHide(p,dt))return;
    if(dm<9&&!a.ventGoal&&Math.random()<dt*.5){const v=nearVent(p,6);if(v)a.ventGoal=v;}
    if(a.ventGoal){const v=a.ventGoal;if(botVent(p)){a.ventGoal=null;return;}
      const V=VENTS[v.i],nx=V.ax==='x'?0:1,nz=V.ax==='x'?1:0,side=((p.x-v.cx)*nx+(p.z-v.cz)*nz)>=0?1:-1;
      botGo(p,v.cx+nx*side*1.0,v.cz+nz*side*1.0,v.y,true,dt,.5);if(G.t>a.fleeU+3)a.ventGoal=null;return;}
    if(dm<7&&Math.random()<dt*.9)botFurn(p);
    if(!a.fleeGoal||G.t>a.fleeRe){a.fleeRe=G.t+2;let best=null,bs=-1;
      for(const r of ROOMS){if(r.void)continue;const dmr=hyp(r.cx,r.cz,m.x,m.z),dp=hyp(r.cx,r.cz,p.x,p.z);if(Math.abs(r.y-p.y)>6||dp<6||dp>28)continue;
        const s=dmr-dp*.3+rnd(4)+(r.lv===m.y/4?0:3);if(s>bs){bs=s;best={x:r.cx,z:r.cz,y:r.y};}}
      a.fleeGoal=best;}
    if(a.fleeGoal)botGo(p,a.fleeGoal.x,a.fleeGoal.z,a.fleeGoal.y,true,dt,1.2);
    return;
  }
  a.fleeGoal=null;
  // reactions to bodies: panic, go somewhere else
  if(G.t>a.seenBody)for(const b of G.bodies){if(hyp(p.x,p.z,b.x,b.z)<9&&Math.abs(b.y-p.y)<2&&los(p.x,p.z,p.y,b.x,b.z,b.y)){a.seenBody=G.t+25;a.fleeU=G.t+3;a.knows=a.knows||Math.random()<.4;a.alert=G.t+90;break;}}
  if(a.wait>0){a.wait-=dt;p.fl=0;
    if(ckey(p)==='med'&&G.t>(a.pillT||0)){a.pillT=G.t+rnd(20,35);hostAct(p,{t:'pr',yw:p.yaw});}
    return;}
  // current job
  if(a.work){
    if(G.phase>=1&&(a.work.k==='obj'))a.work=null;
    if(a.work&&(a.work.k==='lev'||G.phase===1)){const e=a.work&&a.work.k==='lev'?WORLD.exits[a.work.i]:null;if(e&&(e.open||e.used&&WORLD.exits.some(x=>x.active&&!x.used)))a.work=null;}
    if(a.work){runWork(p,dt);return;}
  }
  // medic: revive
  if(ckey(p)==='med'&&!p.reviveUsed){
    if(!p.reviveReady&&G.bodies.some(b=>G.P[b.i].role!=='m'&&G.P[b.i].alive===false)&&G.t>=p.cdF)hostAct(p,{t:'f',yw:p.yaw});
    if(p.reviveReady){const b=G.bodies.filter(b=>G.P[b.i].role!=='m').sort((x,y)=>hyp(p.x,p.z,x.x,x.z)-hyp(p.x,p.z,y.x,y.z))[0];
      if(b){setWork(p,{k:'rev',i:b.i,sx:b.x+1,sz:b.z,sy:b.y,tx:b.x,tz:b.z,near:2,dur:4});return;}}
  }
  // exit phase
  if(G.phase>=1){
    const ex=WORLD.exits.find(e=>e.open&&(!e.used||WORLD.exits.every(x=>!x.active||x.used||x.i===e.i))&&hyp(p.x,p.z,e.cx,e.cz)<(e.used?12:45)&&Math.abs(p.y-e.def.zx[0]*0)<6);
    if(ex){botGo(p,(ex.def.zx[0]+ex.def.zx[1])/2,(ex.def.zz[0]+ex.def.zz[1])/2,0,true,dt,.4);return;}
    const rp=pickRepair(p);if(rp&&Math.random()<.7){rp.run=true;setWork(p,rp);return;}
    const e=pickExit(p);if(!e){a.wait=2;return;}
    setWork(p,{k:'lev',i:e.i,sx:e.lx-e.def.dirx,sz:e.lz-e.def.dirz,sy:0,tx:e.lx,tz:e.lz,near:1.9,dur:7,run:true});return;
  }
  // phase 0 : repairs first, then lights, then objectives
  const rp=pickRepair(p);if(rp&&Math.random()<.85){setWork(p,rp);return;}
  if(rm&&!roomLit(rm)){const s=WORLD.switches.find(s=>s.room===rm.idx);
    if(s&&G.fuse[rm.lv+1]){setWork(p,{k:'sw',i:WORLD.switches.indexOf(s),sx:s.x,sz:s.z+(rm.cz>s.z?.8:-.8),sy:s.y,tx:s.x,tz:s.z,near:1.6,dur:.6});return;}}
  const nz=G.noiseLast;
  if(nz&&G.t-nz.t<10&&!a.knows&&(nz.k==='piano'||nz.k==='gramo'||nz.k==='bell'||nz.k==='tv')&&hyp(p.x,p.z,nz.x,nz.z)<34&&Math.random()<.35&&G.t>(a.invCd||0)){
    a.invCd=G.t+30;setWork(p,{k:'inv',i:0,sx:nz.x,sz:nz.z+1.2,sy:nz.y,tx:nz.x,tz:nz.z,near:2.5,dur:3});return;}
  let best=-1,bs=1e9;
  OBJS.forEach((d,i)=>{const o=G.ob[i];if(o.st!==0)return;if(i===a.last&&Math.random()<.8)return;
    const crowd=G.P.filter(q=>q!==p&&q.alive&&q.ai&&q.ai.work&&q.ai.work.k==='obj'&&q.ai.work.i===i).length;
    const near=G.P.filter(q=>q!==p&&q.alive&&!q.escaped&&hyp(q.x,q.z,d.x,d.z)<7&&Math.abs(q.y-d.y)<2).length;
    const alerted=G.t<(a.alert||0);
    const s=hyp(p.x,p.z,d.x,d.z)+rnd(14)+(Math.abs(p.y-d.y)>2?8:0)+(alerted?(crowd?-10:0)+(near?-8:10):crowd*10);if(s<bs){bs=s;best=i;}});
  if(best<0){ // nothing left to try : wander to a random room, check switches
    const r=pick(ROOMS.filter(q=>!q.void));setWork(p,{k:'inv',i:0,sx:r.cx,sz:r.cz,sy:r.y,tx:r.cx,tz:r.cz,near:2.5,dur:2});return;}
  setWork(p,workObj(p,best,'obj'));
}

/* ============================ murderer ============================ */
function thinkMur(p,dt){
  const a=p.ai,rm=roomOf(p);
  if(p.hidden>=0){hostAct(p,{t:'hide'});}
  if(G.t<a.coolU){ // after a kill: walk away calmly, sometimes jam a door or cut the light behind
    if(!a.fleeGoal||G.t>a.fleeRe){a.fleeRe=G.t+3;const r=pick(ROOMS.filter(q=>!q.void));a.fleeGoal={x:r.cx,z:r.cz,y:r.y};
      const s=sabPick(p);if(s&&!s.full&&G.t>=p.cdS&&Math.random()<.6){s.fn();p.cdS=G.t+25;}}
    if(a.fleeGoal)botGo(p,a.fleeGoal.x,a.fleeGoal.z,a.fleeGoal.y,false,dt,1.5);return;}
  if(G.t>a.retarget){a.retarget=G.t+1.5;
    let best=null,bs=1e9;if(G.t<24)bs=-1;
    for(const t of G.P){if(t===p||!t.alive||t.escaped||t.hidden>=0||G.t<t.invisU)continue;
      const d=hyp(p.x,p.z,t.x,t.z)+(Math.abs(t.y-p.y)>2?10:0);
      let crowd=0;for(const u of G.P)if(u!==t&&u!==p&&u.alive&&!u.escaped&&hyp(u.x,u.z,t.x,t.z)<6)crowd++;
      const exitBias=G.phase===1?Math.min(...WORLD.exits.filter(e=>e.active).map(e=>hyp(t.x,t.z,e.lx,e.lz)),99)*.3:0;
      const s=d+crowd*7+rnd(6)+exitBias;if(s<bs){bs=s;best=t;}}
    a.target=best?best.i:null;}
  const t=a.target!=null&&G.t>=24?G.P[a.target]:null;
  // opportunistic sabotage of anything in reach
  if(G.t>=p.cdS&&G.t>=24&&Math.random()<dt*.5){const s=sabPick(p);if(s&&!s.full){s.fn();p.cdS=G.t+25;}}
  // lights: cut the light of the room we are in when prey is around
  if(rm&&roomLit(rm)&&Math.random()<dt*.15&&G.P.some(q=>q!==p&&q.alive&&roomOf(q)===rm)){const s=WORLD.switches.find(s=>s.room===rm.idx);if(s&&hyp(p.x,p.z,s.x,s.z)<2.6)hostAct(p,{t:'sw',i:WORLD.switches.indexOf(s)});}
  if(t&&t.alive&&!t.escaped&&t.hidden<0&&G.t>=t.invisU){
    const d=hyp(p.x,p.z,t.x,t.z),vis=Math.abs(t.y-p.y)<2&&los(p.x,p.z,p.y,t.x,t.z,t.y);
    botAbilMur(p,t,d,vis);
    if(vis&&d<1.7&&G.t>=p.cdA){
      let wit=0;for(const u of G.P)if(u!==p&&u!==t&&u.alive&&!u.escaped&&u.hidden<0&&hyp(u.x,u.z,p.x,p.z)<11&&Math.abs(u.y-p.y)<2&&los(u.x,u.z,u.y,p.x,p.z,p.y))wit++;
      if(wit===0||Math.random()<dt*.5){facePlayer(p,t);hostAct(p,{t:'atk',yw:p.yaw});a.coolU=G.t+5;a.target=null;a.retarget=G.t+4;return;}
      p.fl=0;return;}
    if(vis&&d>3.5&&d<11&&G.t>=p.cdG&&G.t>=20&&Math.random()<dt*.6){facePlayer(p,t);hostAct(p,{t:'rg',yw:p.yaw});return;}
    // prey hides: search next to the hiding place
    botGo(p,t.x,t.z,t.y,true,dt,1.0);return;
  }
  // hunting hidden prey : check wardrobes close by
  if(G.t>40&&Math.random()<dt*.05){const h=WORLD.hides.find(h=>G.P.some(q=>q.hidden===h.i)&&hyp(p.x,p.z,h.x,h.z)<14);if(h&&Math.abs(h.y-p.y)<2){a.patrol=[h.fx,h.fz,h.y];a.patrolU=G.t+10;
      const q=G.P.find(q=>q.hidden===h.i);if(q&&hyp(p.x,p.z,h.x,h.z)<2.2&&G.t>=p.cdA){q.hidden=-1;tp(q,h.fx,h.fz,h.y);say(q,'Le meurtrier vous a trouvé !',1);}}}
  // patrol: objectives, fuse boxes, levers, noisemakers
  if(!a.patrol||G.t>a.patrolU||botGo(p,a.patrol[0],a.patrol[1],a.patrol[2],false,dt,1.2)){
    const c=[];
    if(G.phase===0){OBJS.forEach((d,i)=>{if(G.ob[i].st!==1)c.push(STAND[i]);});WORLD.fuses.forEach((f,i)=>{if(G.fuse[i])c.push([f.x+.8,f.z,f.y]);});}
    else WORLD.exits.forEach(e=>{if(e.active)c.push([e.lx-e.def.dirx,e.lz-e.def.dirz,0]);});
    const nz=G.noiseLast;if(nz&&G.t-nz.t<12&&Math.random()<.5)c.push([nz.x,nz.z+1,nz.y]);
    if(Math.random()<.06){const n=pick(WORLD.noise);if(n){a.noiseGo=n;}}
    a.patrol=c.length?pick(c):[21,17,0];a.patrolU=G.t+25;
  }
  if(a.noiseGo){const n=a.noiseGo;if(botGo(p,n.def.x,n.def.z+1.3,n.def.y,false,dt,1)||hyp(p.x,p.z,n.def.x,n.def.z)<2.4){hostAct(p,{t:'noise',i:n.i});a.noiseGo=null;}}
}
