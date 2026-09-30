
/* ============================ network, lobby, menus ============================ */
const NET={base:null,nr:null,code:'',isHost:false,myPeer:null,hostPeer:null,unsub:[],ready:false};
const L={pf:'n',ct:'any',total:8,name:'Invité',solo:true};
function show(id){for(const s of ['#menu','#lobby','#endscr'])$(s).hidden=(s!==id);$('#hud').hidden=true;}
function hideScreens(){for(const s of ['#menu','#lobby','#endscr'])$(s).hidden=true;$('#hud').hidden=false;}
(async()=>{
  try{if(window.claude&&window.claude.use)NET.base=await window.claude.use('room');}catch(e){NET.base=null;}
  NET.ready=true;
  if(!NET.base){$('#bHost').disabled=true;$('#bJoin').disabled=true;$('#joinCode').disabled=true;
    $('#netNote').textContent='Multijoueur indisponible dans cette vue (il faut ouvrir l’artifact publié, connecté). Le mode bots fonctionne partout.';}
})();
const pname=()=>($('#pseudo').value||'Invité').trim().slice(0,14)||'Invité';
function segBind(id,key){
  const seg=$(id);seg.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    L[key]=b.dataset.v;seg.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));lobbySync();renderLobby();});
}
segBind('#segPref','pf');segBind('#segCat','ct');
$('#total').addEventListener('input',e=>{L.total=+e.target.value;$('#totalV').textContent=L.total;lobbySync();renderLobby();});
function catNote(){
  const n=$('#catNote');
  n.textContent=L.ct==='any'?'Un personnage est tiré au sort parmi les 6 (couleur = identité).':'Vous recevrez au hasard : '+CHARS.filter(c=>c.cat===L.ct).map(c=>c.n).join(' ou ')+'.';
}
function lobbySync(){
  catNote();
  if(NET.nr)NET.nr.presence({n:pname(),pf:L.pf,ct:L.ct,h:NET.isHost?1:0,tot:L.total}).catch(()=>{});
}
function lobbyPlayers(){
  if(L.solo)return[{me:true,n:pname(),pf:L.pf,ct:L.ct,h:1}];
  return NET.nr.peers().filter(p=>p.kind==='viewer'&&p.presence&&p.presence.n).map(p=>({me:p.isMe&&p.sameTab,peer:p.peer,n:String(p.presence.n).slice(0,14),pf:p.presence.pf||'n',ct:p.presence.ct||'any',h:p.presence.h?1:0,tot:p.presence.tot}))
    .sort((a,b)=>(b.h-a.h)||a.n.localeCompare(b.n));
}
function renderLobby(){
  const ps=lobbyPlayers(),host=ps.find(p=>p.h),total=NET.isHost||L.solo?L.total:(host&&host.tot)||8;
  const bots=Math.max(0,total-ps.length),sum=ps.reduce((a,p)=>a+(p.pf==='m'?4:p.pf==='i'?.15:1),0)+bots;
  $('#plist').innerHTML=ps.map(p=>{const w=(p.pf==='m'?4:p.pf==='i'?.15:1)/sum*100;
    return `<li><span class="nm">${esc(p.n)}${p.me?' <span class="tag">vous</span>':''}${p.h?' <span class="tag h">hôte</span>':''}</span>
    <span><span class="tag ${p.pf}">${p.pf==='m'?'veut meurtrier':p.pf==='i'?'veut innocent':'indifférent'}</span> <span class="tag">${p.ct==='any'?'hasard':CATS[p.ct]}</span></span>
    <div class="bar" title="Chance d’être meurtrier"><i style="width:${Math.min(100,w*2.4)}%"></i></div></li>`;}).join('')
    +(bots?`<li><span class="nm">+ ${bots} bot${bots>1?'s':''}</span><span class="tag">IA</span></li>`:'');
  $('#lobInfo').textContent=`${ps.length} joueur${ps.length>1?'s':''} + ${bots} bot${bots>1?'s':''} = ${ps.length+bots} invités. La jauge montre la chance de tirer le rôle de meurtrier (votes pondérés : ×4 « meurtrier », ×0,15 « innocent »).`;
  $('#hostBox').style.display=(L.solo||NET.isHost)?'':'none';
  $('#bStart').disabled=!(L.solo||NET.isHost);
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function openLobby(title,code){
  show('#lobby');$('#lobMode').textContent=title;$('#lobCode').textContent=code||'SOLO';$('#lobCode').style.display=code?'':'none';
  catNote();renderLobby();
}
$('#bSolo').onclick=()=>{audioInit();L.solo=true;V.mode='solo';NET.isHost=false;openLobby('PARTIE SOLO · VOUS CONTRE LES BOTS');};
function genCode(){const a='ABCDEFGHJKMNPQRSTUVWXYZ';return Array.from({length:4},()=>a[ri(a.length)]).join('');}
async function enterRoom(code,host){
  if(!NET.base)return;L.solo=false;NET.isHost=host;NET.code=code;
  try{NET.nr=await NET.base.join('mm-'+code.toLowerCase());}catch(e){$('#netNote').textContent='Impossible de rejoindre la salle ('+(e&&e.code||'erreur')+').';return;}
  V.mode=host?'host':'client';
  const pe=NET.nr.peers().find(p=>p.isMe&&p.sameTab);NET.myPeer=pe&&pe.peer;
  NET.unsub.forEach(f=>f());NET.unsub=[];
  NET.unsub.push(NET.nr.onPeers(()=>{if(!$('#lobby').hidden)renderLobby();
    if(!NET.myPeer){const q=NET.nr.peers().find(p=>p.isMe&&p.sameTab);if(q)NET.myPeer=q.peer;}}));
  NET.unsub.push(NET.nr.on('go',m=>{if(NET.isHost||m.isMe)return;if(!m.data||!Array.isArray(m.data.roster))return;
    NET.hostPeer=m.peer;const my=m.data.roster.findIndex(r=>r.p===NET.myPeer);if(my<0){logMsg('Partie en cours : vous ne faites pas partie de cette manche.',1);return;}
    V.mode='client';startView(m.data.roster,my);V.on=true;hideScreens();buildAbilReset();tryLock();}));
  NET.unsub.push(NET.nr.on('st',m=>{if(NET.isHost||!V.on||m.peer!==NET.hostPeer)return;applySnap(m.data);}));
  NET.unsub.push(NET.nr.on('pv',m=>{if(NET.isHost||!V.on||m.peer!==NET.hostPeer||!m.data)return;const o=m.data[V.my];if(o)PV=o;}));
  NET.unsub.push(NET.nr.on('act',m=>{if(!NET.isHost||!G||m.isMe)return;const i=G.peerIdx.get(m.peer);if(i==null||!m.data||typeof m.data.t!=='string')return;hostAct(G.P[i],m.data);}));
  NET.unsub.push(NET.nr.on('lob',m=>{if(NET.isHost||m.peer!==NET.hostPeer)return;toLobby(true);}));
  lobbySync();
  openLobby(host?'VOUS HÉBERGEZ · PARTAGEZ LE CODE':'SALON DE '+code,code);
  if(!host)setTimeout(()=>{if(!$('#lobby').hidden&&!lobbyPlayers().some(p=>p.h))$('#lobInfo').textContent='Aucun hôte trouvé pour ce code. Vérifiez le code ou demandez à l’hôte de créer la partie.';},3500);
}
$('#bHost').onclick=()=>{audioInit();enterRoom(genCode(),true);};
$('#bJoin').onclick=()=>{audioInit();const c=($('#joinCode').value||'').trim().toUpperCase();if(c.length<4){$('#netNote').textContent='Entrez le code à 4 lettres donné par l’hôte.';return;}enterRoom(c,false);};
function buildAbilReset(){$('#abil')._sig='';for(const k in abMax)delete abMax[k];$('#msgs').innerHTML='';}
$('#bLeave').onclick=()=>{leaveRoom();show('#menu');};
function leaveRoom(){
  NET.unsub.forEach(f=>f());NET.unsub=[];if(NET.nr){NET.nr.presence({n:null}).catch(()=>{});NET.nr.leave().catch(()=>{});}NET.nr=null;NET.isHost=false;L.solo=true;
}
function launch(){
  // host/solo: build the game and broadcast the roster
  if(!L.solo&&!NET.myPeer){const q=NET.nr.peers().find(p=>p.isMe&&p.sameTab);NET.myPeer=q&&q.peer;}
  const ps=lobbyPlayers();
  const humans=L.solo?[{peer:'me',name:pname(),pf:L.pf,ct:L.ct}]:ps.map(p=>({peer:p.me?NET.myPeer:p.peer,name:p.n,pf:p.pf,ct:p.ct}));
  G=newGame({humans,total:L.total});
  const roster=G.P.map(p=>({p:p.peer,n:p.name,c:p.ch,b:p.bot?1:0,s:[r1(p.x),r1(p.z)]}));
  const my=G.P.findIndex(p=>p.peer===(L.solo?'me':NET.myPeer));
  V.mode=L.solo?'solo':'host';
  startView(roster,my);V.on=true;hideScreens();buildAbilReset();hostLast=performance.now();simT=.1;
  PV=pvFor(G.P[my]);
  if(V.mode==='host'&&NET.nr){NET.hostPeer=NET.myPeer;NET.nr.emit('go',{roster}).catch(()=>{});}
  audioInit();tryLock();
  logMsg(PV.r==='m'?'Isolez vos cibles. Vous pourrez frapper dans 20 s.':'Sécurisez 5 objectifs puis ouvrez les sorties. Méfiez-vous de tout le monde.');
}
$('#bStart').onclick=()=>{if(L.solo||NET.isHost)launch();};
function showEnd(){
  if(document.exitPointerLock&&locked())document.exitPointerLock();
  if(mapOpen){mapOpen=false;$('#mapov').style.display='none';}if(MG.on)mgClose();
  const [w,why,mi]=V.ov,mine=PV?PV.r:'i',win=(w==='inn')===(mine==='i');
  $('#endWho').textContent=(mine==='m'?'VOUS ÉTIEZ LE MEURTRIER':'VOUS ÉTIEZ INNOCENT')+' · '+CHARS[PV.c].n.toUpperCase();
  $('#endTitle').textContent=win?'Victoire':'Défaite';$('#endTitle').style.color=win?'var(--ok)':'var(--blood)';
  $('#endWhy').textContent=(w==='inn'?'Les innocents l’emportent. ':'Le meurtrier l’emporte. ')+why;
  const S=V.snap;
  $('#endList').innerHTML=V.roster.map((r,i)=>{const f=S.pl[i][0],st=f&2?'échappé':f&1?'mort':'survivant';
    return `<div>${V.ro[i]?'🔪 ':''}<b style="color:${CHARS[r.c].css}">${esc(r.n)}</b> · ${CHARS[r.c].n} · ${V.ro[i]?'meurtrier':'innocent'} · ${st}</div>`;}).join('');
  $('#bAgain').textContent=(L.solo||NET.isHost)?'Retour au salon':'Retour au salon';
  $('#endscr').hidden=false;$('#hud').hidden=true;
}
function toLobby(fromHost){
  V.on=false;V.over=false;G=null;PV=null;gl.style.filter='';for(const k in K)K[k]=false;V.revealOn=false;$('#reveal').style.display='none';ME.look=null;toggleHelp(false);
  $('#fx').style.opacity=0;$('#mg').style.display='none';clearView();
  if(NET.nr){openLobby(NET.isHost?'VOUS HÉBERGEZ · PARTAGEZ LE CODE':'SALON DE '+NET.code,NET.code);lobbySync();}
  else openLobby('PARTIE SOLO · VOUS CONTRE LES BOTS');
}
$('#bAgain').onclick=()=>{if(NET.isHost&&NET.nr)NET.nr.emit('lob',{}).catch(()=>{});toLobby();};
/* test hooks */
window.__mm={updateLamps,ROOMS,DOORS,STAIRS,get G(){return G;},V,ME,get PV(){return PV;},launch,L,hostTick,newGame,snapshot,pvFor,COL,WORLD,hostAct,planPath,gDyn,GN,los,OBJS,STAIRS,EXITS,HIDES,get NET(){return NET;},toLobby};
