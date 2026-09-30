<script>
'use strict';
/* ============================ utils ============================ */
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a);
const ri=n=>Math.floor(Math.random()*n);
const pick=a=>a[ri(a.length)];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=ri(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const hyp=(ax,az,bx,bz)=>Math.hypot(ax-bx,az-bz);
const angDiff=(a,b)=>{let d=(a-b)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d};
const r1=v=>Math.round(v*10)/10;
const r2=v=>Math.round(v*100)/100;

/* ============================ game data ============================ */
const CATS={fuite:'Fuite',enq:'Enquête',deb:'Débarras'};
const CHARS=[
 {k:'ath',n:'Athlète olympique',cat:'fuite',col:0xd9372f,css:'#d9372f',
  passive:'Escalade et vitesse accroupi : reste rapide ET silencieux.',
  q:{n:'Gant de boxe',d:'Assomme un invité à moins de 2,6 m pendant 4 s.',cd:18},
  f:{n:'Dopage',d:'Vitesse ×1,6 et insensible pendant 6 s.'}},
 {k:'esc',n:'Escroc braqueur',cat:'fuite',col:0x2f6fe0,css:'#2f6fe0',
  passive:'Pistolet paralysant (clic gauche) : coupe les capacités d’une cible 6 s.',
  q:{n:'Bombe fumigène',d:'Nuage opaque pendant 8 s.',cd:25},
  f:{n:'Invisibilité',d:'Invisible 7 s.'}},
 {k:'exp',n:'Explorateur braconnier',cat:'enq',col:0x8a5a2b,css:'#8a5a2b',
  passive:'Voit les traces de pas (temporaires, avec direction).',
  q:{n:'Nuage d’insectes',d:'Tétanise ceux qui le traversent, 10 s.',cd:25},
  f:{n:'Fusil',d:'Une balle. Neutralise le meurtrier ; un tir raté = recharge de 60 s.'}},
 {k:'jou',n:'Journaliste ragoteur',cat:'enq',col:0xc7962b,css:'#c7962b',
  passive:'Connaît le nombre de personnes vivantes.',
  q:{n:'Indiscrétion',d:'Voit où se trouvent tous les joueurs 5 s.',cd:30},
  f:{n:'Lien',d:'Lie deux joueurs : si l’un meurt, l’autre reçoit un bonus puissant.'}},
 {k:'ing',n:'Ingénieur bricoleur',cat:'deb',col:0x2bb7c4,css:'#2bb7c4',
  passive:'Répare les sabotages en 2,5 s au lieu de 6 s.',
  q:{n:'Barricade',d:'Verrouille la porte proche pendant 18 s.',cd:25},
  f:{n:'Protection',d:'Une vie supplémentaire (40 s).'}},
 {k:'enf',n:'Enfant pourri gâté',cat:'deb',col:0xd13fae,css:'#d13fae',
  passive:'Yoyo (clic gauche) : attrape un invité à moins de 7 m.',
  q:{n:'Lance-pierre',d:'Aveugle la cible visée pendant 4 s.',cd:20},
  f:{n:'Chewing-gum',d:'Bulles géantes qui bloquent un passage 10 s.'}},
];
const OBJS=[
 {n:'Disjoncteur du garage',t:'hold',x:29,z:0.75,y:0},
 {n:'Coffre du bureau',t:'time',x:16.5,z:0.75,y:0},
 {n:'Terminal de la bibliothèque',t:'seq',x:4.75,z:8.2,y:0},
 {n:'Four de la cuisine',t:'hold',x:35.25,z:24,y:0},
 {n:'Vanne de la serre',t:'hold',x:15,z:28.75,y:0},
 {n:'Standard téléphonique',t:'seq',x:28.4,z:10.75,y:0},
 {n:'Projecteur du cinéma',t:'time',x:12.5,z:29.25,y:0},
 {n:'Radio du salon',t:'seq',x:11.5,z:19.25,y:0},
 {n:'Coffre-fort de la suite',t:'time',x:20,z:29.25,y:4},
 {n:'Synthé de la salle de musique',t:'hold',x:35.25,z:25,y:4},
];
const MG_INFO={hold:['Maintenez E','Gardez la touche E enfoncée jusqu’à la fin de la jauge.'],
  seq:['Mémorisez la séquence','Retenez les flèches, puis saisissez-les avec ZQSD / flèches.'],
  time:['Synchronisation','Appuyez sur Espace quand le curseur est dans la zone verte (3 fois).']};
// exits: door gap, lever (interior), trigger zone outside
const EXITS=[
 {n:'Porte de service (garage)',ax:'z',f:36,a:4,b:6,lx:34.9,lz:8.2,zx:[36.6,39],zz:[3,7],dirx:1,dirz:0},
 {n:'Sortie de secours (salle à manger)',ax:'z',f:36,a:14,b:16,lx:34.9,lz:18.3,zx:[36.6,39],zz:[13,17],dirx:1,dirz:0},
 {n:'Porte de la cuisine',ax:'x',f:30,a:30,b:32,lx:33.6,lz:28.9,zx:[29,33],zz:[30.6,33],dirx:0,dirz:1},
 {n:'Porte de la serre',ax:'x',f:30,a:19,b:21,lx:24.2,lz:28.9,zx:[18,22],zz:[30.6,33],dirx:0,dirz:1},
 {n:'Issue du cinéma',ax:'z',f:4,a:24,b:26,lx:5.15,lz:28.3,zx:[1,3.4],zz:[23,27],dirx:-1,dirz:0},
];
const DOORS=[ // ax 'x': wall along x at z=f ; 'z': along z at x=f
 {id:'CB',ax:'x',f:10,a:7,b:9,y:0},{id:'FH',ax:'x',f:10,a:19,b:21,y:0},{id:'ID',ax:'x',f:10,a:31,b:33,y:0},
 {id:'BH',ax:'x',f:20,a:7,b:9,y:0},{id:'HG',ax:'x',f:20,a:19,b:21,y:0},{id:'DE',ax:'x',f:20,a:31,b:33,y:0},
 {id:'CF',ax:'z',f:14,a:4,b:6,y:0},{id:'BA',ax:'z',f:14,a:14,b:16,y:0},{id:'HGw',ax:'z',f:14,a:24,b:26,y:0},
 {id:'FI',ax:'z',f:26,a:4,b:6,y:0},{id:'AD',ax:'z',f:26,a:14,b:16,y:0},{id:'GE',ax:'z',f:26,a:24,b:26,y:0},
 {id:'UG',ax:'x',f:20,a:19,b:21,y:4},{id:'U12',ax:'z',f:14,a:24,b:26,y:4},{id:'U23',ax:'z',f:26,a:24,b:26,y:4},
];
const WINS=[
 {ax:'x',f:0,a:8,b:9.6,n:'Fenêtre de la bibliothèque'},{ax:'x',f:0,a:19.2,b:20.8,n:'Fenêtre du bureau'},
 {ax:'z',f:4,a:13,b:14.6,n:'Fenêtre du salon'},{ax:'z',f:36,a:11,b:12.6,n:'Fenêtre de la salle à manger'},
];
const FURN=[
 {n:'Bibliothèque coulissante',h:2.4,w:1.6,d:.95,col:0x4a2c18,
  st:[{x:13.375,z:8.8},{x:13.375,z:7.2}],kind:'shelf'},
 {n:'Canapé',h:1.1,w:2.8,d:1.0,col:0x6b2a3a,
  st:[{x:4.95,z:16.8},{x:13.05,z:15}],kind:'sofa'},
 {n:'Étagère métallique',h:2.0,w:2.8,d:1.0,col:0x6d7480,
  st:[{x:35.1,z:22.1,rot:1},{x:32,z:20.75}],kind:'rack'},
];
FURN[0].rot=[1,1]; // along z
FURN[1].rot=[1,1];
FURN[2].rot=[1,0];
const HIDES=[
 {x:5.3,z:18.7,y:0,fx:6.4,fz:18.5},{x:24.6,z:1.0,y:0,fx:24.2,fz:2.2},{x:27.2,z:19.3,y:0,fx:27.9,fz:18.3},
 {x:27.2,z:9.3,y:0,fx:27.9,fz:8.3},{x:35.3,z:29.3,y:0,fx:34.6,fz:28.3},
 {x:5.3,z:21.2,y:4,fx:6.4,fz:22.0},{x:35.2,z:21.0,y:4,fx:34.3,fz:22.0},
];
const ROOMS=[
 {id:'C',n:'Bibliothèque',x0:4,z0:0,x1:14,z1:10,y:0,f:'parq'},{id:'F',n:'Bureau de Mr Bills',x0:14,z0:0,x1:26,z1:10,y:0,f:'carpet'},
 {id:'I',n:'Garage',x0:26,z0:0,x1:36,z1:10,y:0,f:'conc'},{id:'B',n:'Salon',x0:4,z0:10,x1:14,z1:20,y:0,f:'parq'},
 {id:'A',n:'Grand hall',x0:14,z0:10,x1:26,z1:20,y:0,f:'tile'},{id:'D',n:'Salle à manger',x0:26,z0:10,x1:36,z1:20,y:0,f:'parq'},
 {id:'H',n:'Cinéma',x0:4,z0:20,x1:14,z1:30,y:0,f:'carpet'},{id:'G',n:'Serre',x0:14,z0:20,x1:26,z1:30,y:0,f:'tile2'},
 {id:'E',n:'Cuisine',x0:26,z0:20,x1:36,z1:30,y:0,f:'tile2'},
 {id:'U1',n:'Chambre d’amis',x0:4,z0:20,x1:14,z1:30,y:4,f:'parq'},{id:'U2',n:'Suite de Mr Bills',x0:14,z0:20,x1:26,z1:30,y:4,f:'carpet'},
 {id:'U3',n:'Salle de musique',x0:26,z0:20,x1:36,z1:30,y:4,f:'parq'},{id:'GAL',n:'Galerie',x0:14,z0:17.5,x1:26,z1:20,y:4,f:'carpet'},
];
function roomAt(x,z,y){
  for(const r of ROOMS){ if(Math.abs(r.y-y)<2&&x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1){ if(r.id==='A'&&y>2&&z>=17.5)return ROOMS[12]; return r; } }
  return null;
}
// navigation nodes (x,z,y)
const NODES=[]; const NAV={}; const EDGES=[];
function N(id,x,z,y=0){NAV[id]=NODES.length;NODES.push({id,x,z,y,adj:[]});}
function E(a,b,gate){const i=NAV[a],j=NAV[b];const w=hyp(NODES[i].x,NODES[i].z,NODES[j].x,NODES[j].z);const e={a:i,b:j,w,gate};EDGES.push(e);NODES[i].adj.push(e);NODES[j].adj.push(e);}

/* ============================ colliders & movement ============================ */
const COL=[];
function addCol(x0,y0,z0,x1,y1,z1,on=true){const c={x0,y0,z0,x1,y1,z1,on};COL.push(c);return c;}
function collide(e,r=0.35){
  for(let it=0;it<3;it++){
    let hit=false;
    for(let i=0;i<COL.length;i++){const c=COL[i]; if(!c.on)continue;
      if(c.y0>=e.y+1.7||c.y1<=e.y+0.05)continue;
      if(e.x<c.x0-r||e.x>c.x1+r||e.z<c.z0-r||e.z>c.z1+r)continue;
      const nx=clamp(e.x,c.x0,c.x1),nz=clamp(e.z,c.z0,c.z1);
      const dx=e.x-nx,dz=e.z-nz,d2=dx*dx+dz*dz;
      if(d2<r*r){
        if(d2>1e-9){const d=Math.sqrt(d2),p=(r-d)/d;e.x+=dx*p;e.z+=dz*p;}
        else{const l=e.x-c.x0,rr=c.x1-e.x,t=e.z-c.z0,b=c.z1-e.z,m=Math.min(l,rr,t,b);
          if(m===l)e.x=c.x0-r;else if(m===rr)e.x=c.x1+r;else if(m===t)e.z=c.z0-r;else e.z=c.z1+r;}
        hit=true;
      }
    }
    if(!hit)break;
  }
}
function moveEnt(e,dx,dz){
  const len=Math.hypot(dx,dz),n=Math.max(1,Math.ceil(len/0.18));
  for(let i=0;i<n;i++){e.x+=dx/n;e.z+=dz/n;collide(e);}
  e.x=clamp(e.x,-1.6,41.6);e.z=clamp(e.z,-5.6,35.6);
}
function floorH(x,z,cy){
  let best=0;
  if(((x>=4&&x<=36&&z>=20&&z<=30)||(x>=14&&x<=26&&z>=17.5&&z<=20))&&4<=cy+0.6)best=4;
  if(x>=15&&x<=17.5&&z>=10.5&&z<=17.5){const h=(z-10.5)/7*4;if(h<=cy+0.6&&h>best)best=h;}
  return best;
}
function stepVert(e,dt){
  const t=floorH(e.x,e.z,e.y);
  e.fell=0;
  if(e.vy>0||e.y-t>0.35){
    e.vy-=14*dt;e.y+=e.vy*dt;
    if(e.y<=t){if(e.vy<-8)e.fell=1;e.y=t;e.vy=0;}
  }else{
    e.y=Math.abs(e.y-t)<0.01?t:lerp(e.y,t,clamp(dt*20,0,1));e.vy=0;
  }
}
// segment vs axis boxes, only colliders at eye height
function los(ax,az,ay,bx,bz,by){
  if(Math.abs(ay-by)>1.5)return false;
  const eye=Math.min(ay,by)+1.3,dx=bx-ax,dz=bz-az;
  for(let i=0;i<COL.length;i++){const c=COL[i];
    if(!c.on||c.y0>eye||c.y1<eye)continue;
    let t0=0,t1=1;
    if(Math.abs(dx)<1e-9){if(ax<c.x0||ax>c.x1)continue;}
    else{let a=(c.x0-ax)/dx,b=(c.x1-ax)/dx;if(a>b){const t=a;a=b;b=t;}t0=Math.max(t0,a);t1=Math.min(t1,b);}
    if(Math.abs(dz)<1e-9){if(az<c.z0||az>c.z1)continue;}
    else{let a=(c.z0-az)/dz,b=(c.z1-az)/dz;if(a>b){const t=a;a=b;b=t;}t0=Math.max(t0,a);t1=Math.min(t1,b);}
    if(t0<=t1)return false;
  }
  return true;
}

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
    x.fillStyle='#1b1410';x.fillRect(0,h*.7,w,h*.3);x.fillStyle='#2a1f18';
    for(let i=0;i<w;i+=64)x.fillRect(i+6,h*.74,52,h*.19);
    x.fillStyle='#4a382a';x.fillRect(0,h*.69,w,h*.022);x.fillStyle='#0c0909';x.fillRect(0,h*.97,w,h*.03);
    x.fillStyle='rgba(0,0,0,.3)';x.fillRect(0,0,w,h*.025);noise(x,w,h,200,.04);});
  T.wall=[wall('#3a2530','rgba(255,255,255,.05)'),wall('#22332e','rgba(255,255,255,.045)'),wall('#2b2d3f','rgba(255,255,255,.05)')];
  T.parq=ctex(128,128,(x,w,h)=>{for(let r=0;r<8;r++){for(let c=-1;c<2;c++){const o=(r%2)*32;x.fillStyle=`hsl(24,${40+Math.random()*12}%,${20+Math.random()*9}%)`;x.fillRect(c*64+o,r*16,63,15);}}noise(x,w,h,300,.05);});
  T.carpet=ctex(64,64,(x,w,h)=>{x.fillStyle='#4a1a26';x.fillRect(0,0,w,h);noise(x,w,h,500,.07);x.strokeStyle='rgba(0,0,0,.25)';x.strokeRect(0,0,w,h);});
  T.conc=ctex(128,128,(x,w,h)=>{x.fillStyle='#4b4d52';x.fillRect(0,0,w,h);noise(x,w,h,700,.08);x.strokeStyle='rgba(0,0,0,.4)';x.strokeRect(0,0,w,h);});
  T.tile=ctex(128,128,(x,w,h)=>{for(let i=0;i<2;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?'#1c1b22':'#cfc9bd';x.fillRect(i*64,j*64,64,64);}noise(x,w,h,300,.05);});
  T.tile2=ctex(64,64,(x,w,h)=>{x.fillStyle='#8fa4a0';x.fillRect(0,0,w,h);x.strokeStyle='rgba(0,0,0,.35)';x.strokeRect(0,0,w,h);noise(x,w,h,160,.05);});
  T.grass=ctex(128,128,(x,w,h)=>{x.fillStyle='#16291a';x.fillRect(0,0,w,h);for(let i=0;i<900;i++){x.fillStyle=`hsl(${110+Math.random()*30},40%,${10+Math.random()*12}%)`;x.fillRect(Math.random()*w,Math.random()*h,2,3);}});
  T.books=ctex(128,64,(x,w,h)=>{x.fillStyle='#1a100a';x.fillRect(0,0,w,h);for(let r=0;r<2;r++){let px=0;while(px<w){const bw=4+Math.random()*7;x.fillStyle=`hsl(${Math.random()*360},${30+Math.random()*30}%,${22+Math.random()*22}%)`;x.fillRect(px,r*32+2+Math.random()*4,bw-1,28);px+=bw;}}});
  T.stairs=ctex(64,64,(x,w,h)=>{x.fillStyle='#4a3324';x.fillRect(0,0,w,h);for(let i=0;i<8;i++){x.fillStyle=i%2?'#5a3f2c':'#3c281b';x.fillRect(0,i*8,w,7);x.fillStyle='#8a6a48';x.fillRect(0,i*8,w,1);}});
  return T;
}
function uvScale(g,w,h,d,u,y0){
  const uv=g.attributes.uv,dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
  for(let f=0;f<6;f++)for(let i=0;i<4;i++){
    const k=f*4+i,a=dims[f][0],b=dims[f][1];
    if(f===2||f===3){uv.setXY(k,uv.getX(k)*a/u,uv.getY(k)*b/u);}
    else{uv.setXY(k,uv.getX(k)*a/u,(uv.getY(k)*b+((y0%4)+4)%4)/4);}
  }
  return g;
}
function buildWorld(scene){
  const tx=buildTextures(),W={doors:[],wins:[],furn:[],objs:[],exits:[],hides:[],zones:new Map(),anim:[],lamps:[]};
  WORLD=W;
  const lam=(c,o={})=>new THREE.MeshLambertMaterial(Object.assign({color:c},o));
  const wallMats=tx.wall.map(t=>lam(0xffffff,{map:t}));
  const ceilM=lam(0x17141b),darkM=lam(0x1b1a20);
  const grp=new THREE.Group();scene.add(grp);
  function box(x0,y0,z0,x1,y1,z1,mat,collide=false,tile=2){
    const w=x1-x0,h=y1-y0,d=z1-z0,g=uvScale(new THREE.BoxGeometry(w,h,d),w,h,d,tile,y0);
    const m=new THREE.Mesh(g,mat);m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);grp.add(m);
    return collide?addCol(x0,y0,z0,x1,y1,z1):null;
  }
  function wallBox(x0,y0,z0,x1,y1,z1){const k=(Math.floor((x0+x1)*0.37+(z0+z1)*0.61))%3;box(x0,y0,z0,x1,y1,z1,wallMats[Math.abs(k)],true);}
  function wallLine(ax,f,a,b,y0,y1,gaps,dh=2.6){
    gaps=gaps.slice().sort((p,q)=>p[0]-q[0]);let cur=a-T/2;
    const seg=(s,e,ya,yb)=>{if(e-s<.01)return;ax==='x'?wallBox(s,ya,f-T/2,e,yb,f+T/2):wallBox(f-T/2,ya,s,f+T/2,yb,e);};
    for(const g of gaps){seg(cur,g[0],y0,y1);if(y0+dh<y1)seg(g[0],g[1],y0+dh,y1);cur=g[1];}
    seg(cur,b+T/2,y0,y1);
  }
  const GL=[['x',0,4,36,[[8,9.6],[19.2,20.8]]],['x',10,4,36,[[7,9],[19,21],[31,33]]],['x',20,4,36,[[7,9],[19,21],[31,33]]],['x',30,4,36,[[30,32],[19,21]]],
    ['z',4,0,30,[[13,14.6],[24,26]]],['z',14,0,30,[[4,6],[8,9.6],[14,16],[24,26]]],['z',26,0,30,[[4,6],[14,16],[24,26]]],['z',36,0,30,[[4,6],[14,16],[11,12.6]]]];
  for(const l of GL)wallLine(l[0],l[1],l[2],l[3],0,4,l[4]);
  const UL=[['x',20,4,36,[[19,21]]],['x',30,4,36,[]],['z',4,20,30,[]],['z',36,20,30,[]],['z',14,20,30,[[24,26]]],['z',26,20,30,[[24,26]]],
    ['x',10,14,26,[]],['z',14,10,20,[]],['z',26,10,20,[]]];
  for(const l of UL)wallLine(l[0],l[1],l[2],l[3],4,8,l[4]);
  // window sills
  for(const w of WINS){w.ax==='x'?wallBox(w.a,0,w.f-T/2,w.b,0.55,w.f+T/2):wallBox(w.f-T/2,0,w.a,w.f+T/2,0.55,w.b);}
  // slabs / roofs
  box(3.7,3.85,19.85,36.3,4.05,30.3,ceilM);box(14,3.85,17.5,26,4.05,20,ceilM);
  box(3.7,3.9,-0.3,36.3,4.1,9.85,ceilM);box(3.7,3.9,10.15,14,4.1,19.85,ceilM);box(26,3.9,10.15,36.3,4.1,19.85,ceilM);
  box(14,7.9,10.15,26,8.1,19.85,ceilM);box(3.7,7.9,20.15,36.3,8.1,30.3,ceilM);
  // fence + ground
  const gm=new THREE.Mesh(new THREE.PlaneGeometry(240,240),lam(0xffffff,{map:tx.grass}));
  gm.geometry.attributes.uv.array.forEach((v,i,a)=>a[i]=v*80);gm.rotation.x=-Math.PI/2;gm.position.set(20,-0.02,15);grp.add(gm);
  tx.grass.repeat.set(1,1);
  const fenceM=lam(0x2a2a30);
  box(-2,0,-6.15,42,2.6,-5.85,fenceM,true);box(-2,0,35.85,42,2.6,36.15,fenceM,true);box(-2.15,0,-6,-1.85,2.6,36,fenceM,true);box(41.85,0,-6,42.15,2.6,36,fenceM,true);
  for(let i=0;i<34;i++){const a=i/34*Math.PI*2,r=34+Math.random()*6;
    const tr=new THREE.Group(),h=3+Math.random()*3;
    const tm=new THREE.Mesh(new THREE.CylinderGeometry(.2,.3,h,6),lam(0x2b1d12));tm.position.y=h/2;tr.add(tm);
    const cm=new THREE.Mesh(new THREE.ConeGeometry(1.6+Math.random(),h*1.4,7),lam(0x10301c));cm.position.y=h+.8;tr.add(cm);
    tr.position.set(20+Math.cos(a)*r*1.15,0,15+Math.sin(a)*r*.9);grp.add(tr);}
  // floors
  for(const r of ROOMS){
    const w=r.x1-r.x0,d=r.z1-r.z0,g=new THREE.PlaneGeometry(w,d),uv=g.attributes.uv;
    const tile=r.f==='tile'?4:r.f==='tile2'?2:r.f==='carpet'?3:3;
    for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/tile,uv.getY(i)*d/tile);
    const m=new THREE.Mesh(g,lam(0xffffff,{map:tx[r.f]}));m.rotation.x=-Math.PI/2;m.position.set((r.x0+r.x1)/2,r.y+0.01,(r.z0+r.z1)/2);grp.add(m);
  }
  // doors
  for(const d of DOORS){
    const o={id:d.id,ax:d.ax,f:d.f,a:d.a,b:d.b,y:d.y,state:0,ang:0,tgt:0};
    o.cx=d.ax==='x'?(d.a+d.b)/2:d.f;o.cz=d.ax==='x'?d.f:(d.a+d.b)/2;
    const len=d.b-d.a,pv=new THREE.Group();
    const pm=new THREE.Mesh(new THREE.BoxGeometry(len-.06,2.6,.1),lam(0x5a3a22));pm.position.set((len-.06)/2,1.3,0);pv.add(pm);
    const hd=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),lam(0xcfa750));hd.position.set(len-.25,1.2,.08);pv.add(hd);
    if(d.ax==='x'){pv.position.set(d.a,d.y,d.f);}else{pv.position.set(d.f,d.y,d.a);pv.rotation.y=-Math.PI/2;o.base=-Math.PI/2;}
    o.base=o.base||0;o.pv=pv;grp.add(pv);
    o.col=d.ax==='x'?addCol(d.a,d.y,d.f-.06,d.b,d.y+2.6,d.f+.06,true):addCol(d.f-.06,d.y,d.a,d.f+.06,d.y+2.6,d.b,true);
    o.state=1;o.tgt=0;W.doors.push(o);
  }
  // windows
  for(const w of WINS){
    const o={ax:w.ax,f:w.f,a:w.a,b:w.b,n:w.n,state:1,ang:0,tgt:0};o.cx=w.ax==='x'?(w.a+w.b)/2:w.f;o.cz=w.ax==='x'?w.f:(w.a+w.b)/2;
    const len=w.b-w.a,pv=new THREE.Group();
    const gl=new THREE.Mesh(new THREE.BoxGeometry(len,1.9,.04),new THREE.MeshLambertMaterial({color:0x7aa0c8,transparent:true,opacity:.28}));gl.position.set(len/2,1.5,0);pv.add(gl);
    const fr=new THREE.Mesh(new THREE.BoxGeometry(len+.1,.06,.08),lam(0x2a1d14));fr.position.set(len/2,.55,0);pv.add(fr);
    if(w.ax==='x'){pv.position.set(w.a,0,w.f);}else{pv.position.set(w.f,0,w.a);pv.rotation.y=-Math.PI/2;o.base=-Math.PI/2;}
    o.base=o.base||0;o.pv=pv;grp.add(pv);
    o.col=w.ax==='x'?addCol(w.a,.55,w.f-.05,w.b,2.6,w.f+.05,true):addCol(w.f-.05,.55,w.a,w.f+.05,2.6,w.b,true);
    W.wins.push(o);
  }
  // exits
  EXITS.forEach((e,i)=>{
    const o={i,n:e.n,state:0,open:false,active:false,used:false,py:0,def:e};
    const len=e.b-e.a;
    const dm=new THREE.Mesh(new THREE.BoxGeometry(e.ax==='x'?len-.05:.16,2.6,e.ax==='x'?.16:len-.05),lam(0x5b626c,{emissive:0x150505}));
    dm.position.set(e.ax==='x'?(e.a+e.b)/2:e.f,1.3,e.ax==='x'?e.f:(e.a+e.b)/2);grp.add(dm);
    o.mesh=dm;o.cx=dm.position.x;o.cz=dm.position.z;
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.4),new THREE.MeshBasicMaterial({color:0x662222}));
    sign.position.set(o.cx-(e.ax==='z'?e.dirx*.2:0)*-1,2.85,o.cz-(e.ax==='x'?e.dirz*.2:0)*-1);
    sign.position.x=o.cx-(e.ax==='z'?e.dirx*.22:0);sign.position.z=o.cz-(e.ax==='x'?e.dirz*.22:0);
    if(e.ax==='z')sign.rotation.y=e.dirx>0?-Math.PI/2:Math.PI/2;else sign.rotation.y=e.dirz>0?Math.PI:0;
    grp.add(sign);o.sign=sign;
    o.col=e.ax==='x'?addCol(e.a,0,e.f-.08,e.b,2.6,e.f+.08,true):addCol(e.f-.08,0,e.a,e.f+.08,2.6,e.b,true);
    // lever
    const lv=new THREE.Group();const lb=new THREE.Mesh(new THREE.BoxGeometry(.5,1.1,.3),lam(0x2a2d33));lb.position.y=.55;lv.add(lb);
    const ll=new THREE.Mesh(new THREE.SphereGeometry(.1,10,8),new THREE.MeshBasicMaterial({color:0x552222}));ll.position.set(0,1.2,0);lv.add(ll);o.led=ll;
    lv.position.set(e.lx,0,e.lz);grp.add(lv);o.lever=lv;o.lx=e.lx;o.lz=e.lz;
    addCol(e.lx-.25,0,e.lz-.2,e.lx+.25,1.1,e.lz+.2,true);
    // beam (shown when active)
    const bm=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,40,8,1,true),new THREE.MeshBasicMaterial({color:0x58c48a,transparent:true,opacity:.35,side:THREE.DoubleSide}));
    bm.position.set(o.cx+e.dirx*3,20,o.cz+e.dirz*3);bm.visible=false;grp.add(bm);o.beam=bm;
    W.exits.push(o);
  });
  // furniture (interactive, two states)
  FURN.forEach((f,i)=>{
    const o={i,n:f.n,s:0,def:f,anim:0};
    const g=new THREE.Group();
    const along=f.rot[0]?'z':'x',sx=along==='z'?f.d:f.w,sz=along==='z'?f.w:f.d;
    const body=new THREE.Mesh(new THREE.BoxGeometry(f.w,f.h,f.d),lam(f.col));body.position.y=f.h/2;g.add(body);
    if(f.kind==='sofa'){const bk=new THREE.Mesh(new THREE.BoxGeometry(f.w,.5,.25),lam(0x4d1c29));bk.position.set(0,f.h-.25,-f.d/2+.12);g.add(bk);body.scale.y=.5;body.position.y=.28;}
    if(f.kind==='shelf'||f.kind==='rack'){const bm=new THREE.Mesh(new THREE.PlaneGeometry(f.w-.2,f.h-.3),lam(0xffffff,{map:tx.books}));bm.position.set(0,f.h/2,f.d/2+.01);g.add(bm);}
    grp.add(g);o.g=g;
    // orientation per state: state 0 uses f.r0, state 1 uses f.r1 (radians); box is authored with width along local x
    o.ry=[f.kind==='shelf'?-Math.PI/2:f.kind==='sofa'?Math.PI/2:0, f.kind==='shelf'?-Math.PI/2:f.kind==='sofa'?Math.PI/2:0];
    if(f.kind==='rack'){o.ry=[-Math.PI/2,0];}
    o.box=[0,1].map(s=>{const st=f.st[s];const rot=Math.abs(Math.sin(o.ry[s]))>.5;const hw=(rot?f.d:f.w)/2,hd=(rot?f.w:f.d)/2;return [st.x-hw,st.z-hd,st.x+hw,st.z+hd];});
    const b=o.box[0];o.c=addCol(b[0],0,b[1],b[2],f.h,b[3],true);
    g.position.set(f.st[0].x,0,f.st[0].z);g.rotation.y=o.ry[0];
    o.pos=[f.st[0].x,f.st[0].z,o.ry[0]];
    W.furn.push(o);
  });
  // hides
  HIDES.forEach((h,i)=>{
    const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.BoxGeometry(.9,2.1,.6),lam(0x3a2a1e)));g.children[0].position.y=1.05;
    const ln=new THREE.Mesh(new THREE.PlaneGeometry(.04,1.8),new THREE.MeshBasicMaterial({color:0x1a120c}));ln.position.set(0,1.05,.31);g.add(ln);
    g.position.set(h.x,h.y,h.z);const cx=h.fx-h.x,cz=h.fz-h.z;g.rotation.y=Math.atan2(cx,cz);grp.add(g);
    addCol(h.x-.45,h.y,h.z-.45,h.x+.45,h.y+2.1,h.z+.45,true);
    W.hides.push({i,x:h.x,z:h.z,y:h.y,fx:h.fx,fz:h.fz,busy:0});
  });
  // objective consoles
  OBJS.forEach((d,i)=>{
    const o={i,def:d,state:0,lamp:null};
    const g=new THREE.Group(),bd=new THREE.Mesh(new THREE.BoxGeometry(.9,1.3,.5),lam(0x23252b));bd.position.y=.65;g.add(bd);
    const sc=new THREE.Mesh(new THREE.PlaneGeometry(.6,.4),new THREE.MeshBasicMaterial({color:0x3a2e10}));sc.position.set(0,.95,.26);g.add(sc);o.scr=sc;
    const lp=new THREE.Mesh(new THREE.SphereGeometry(.09,10,8),new THREE.MeshBasicMaterial({color:0xf0a23a}));lp.position.set(0,1.5,0);g.add(lp);o.lamp=lp;
    // face the room center
    const rm=roomAt(d.x,d.z,d.y)||ROOMS[0],cx=(rm.x0+rm.x1)/2,cz=(rm.z0+rm.z1)/2;
    g.rotation.y=Math.atan2(cx-d.x,cz-d.z);g.position.set(d.x,d.y,d.z);grp.add(g);
    addCol(d.x-.45,d.y,d.z-.4,d.x+.45,d.y+1.3,d.z+.4,true);
    W.objs.push(o);
  });
  // decor
  function deco(x,z,w,d,h,c,y=0,coll=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),lam(c));m.position.set(x,y+h/2,z);grp.add(m);if(coll&&h>.3)addCol(x-w/2,y,z-d/2,x+w/2,y+h,z+d/2,true);return m;}
  function shelfWall(x0,z0,x1,z1,face){ // bookshelf against wall
    const w=Math.abs(x1-x0)||.7,d=Math.abs(z1-z0)||.7;deco((x0+x1)/2,(z0+z1)/2,w,d,2.6,0x3b2618);
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(face==='z'?w-.1:d-.1,2.3),lam(0xffffff,{map:tx.books}));
    const uv=pl.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*((face==='z'?w:d)/1.6),uv.getY(i)*1.5);
    if(face==='z'){pl.position.set((x0+x1)/2,1.4,z1+.02);}else{pl.position.set(x1+.02,1.4,(z0+z1)/2);pl.rotation.y=Math.PI/2;}grp.add(pl);
  }
  shelfWall(5,.3,13,1.0,'z');shelfWall(4.3,1,5,7,'x');deco(8,3.3,1.5,.8,.75,0x4a3020);deco(11.8,2.4,1,1,.9,0x552233);
  deco(15.4,3.0,1.2,1.2,.9,0x26443a);deco(22.4,2.3,2.2,1,.78,0x4a3a2a);deco(25.3,8.5,.8,1.4,1.6,0x33261c);
  deco(6.3,16.0,1,1,.8,0x3a2a30,0,false);deco(7.2,13.4,1.2,.7,.45,0x2a1e18);deco(11,11,3,.7,1.0,0x2c2018);
  deco(33.3,12.6,1.4,2,.8,0x4a3020);deco(28.6,18.2,2,1,.8,0x4a3020);
  deco(33.3,2.2,3.6,1.6,1.0,0x7a1f25);deco(33.3,2.2,2,1.3,.55,0x1a1a1f,1.0,false);deco(29.6,9.2,1.6,1.0,1.0,0x5a4632);
  deco(29,28.3,2.4,.9,.95,0x8a8f96);deco(27.8,29.5,2.6,.6,.9,0x8a8f96);
  deco(17.2,29,2,.9,.6,0x2f2418);deco(15.3,21.6,1.2,1.2,1.0,0x1e4a2a);deco(24.7,21.5,1.2,1.2,1.0,0x1e4a2a);
  deco(13.3,21,1,1,1.6,0x7a2a1a);deco(8,29.7,4,.15,2.2,0x0a0a10,0,false);
  deco(15,11,.6,.6,3.8,0x8a8578);deco(25,11,.6,.6,3.8,0x8a8578);deco(25,19,.6,.6,3.8,0x8a8578);deco(25.4,16.7,.6,.8,1.9,0x5a3a22);
  deco(20,14.5,3,8,.02,0x7a1222,0.02,false);
  deco(6.3,27.6,2.0,1.6,.6,0x5a2a3a,4);deco(16.6,27.9,2.2,1.6,.6,0x2a3a5a,4);deco(24.8,22.4,1.6,.8,.78,0x4a3020,4);deco(33,28.3,2.2,1.4,1.0,0x111114,4);
  // stair wedge
  const sl=Math.hypot(7,4),st=new THREE.Mesh(new THREE.BoxGeometry(2.5,.3,sl),lam(0xffffff,{map:tx.stairs}));
  { const uv=st.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*2,uv.getY(i)*3);}
  st.position.set(16.25,2-.15,14);st.rotation.x=Math.atan2(4,7)*-1;grp.add(st);
  deco(16.25,14,2.5,.01,.01,0,0,false);
  const sideM=lam(0x33261c);
  box(14.95,0,12.1,15.05,4,17.5,sideM,true);box(17.45,0,12.1,17.55,4,17.5,sideM,true);
  box(14.95,0,17.45,17.55,3.5,17.6,sideM,true);
  // gallery railings
  const rail=lam(0x2a1d14);box(14,4,17.45,15,5.1,17.55,rail,true);box(17.5,4,17.45,26,5.1,17.55,rail,true);
  // lights
  const LP=[[20,6.4,14.5,0xffe2b0,1.1,22],[9,3.3,5,0xffb866,.9,14],[9,3.3,15,0xffc27a,.9,14],[20,3.3,5,0xa8e0a0,.85,15],[31,3.3,15,0xffc27a,.9,15],
    [31,3.3,25,0xdfeaff,.95,14],[31,3.3,5,0x9ab8ff,.85,14],[20,3.3,25,0xa8ffb8,.85,15],[9,3.3,25,0xc8a0ff,.85,14],[20,7.2,25,0xffd7a0,1.0,26]];
  for(const l of LP){const p=new THREE.PointLight(l[3],l[4],l[5],1.6);p.position.set(l[0],l[1],l[2]);scene.add(p);
    const b=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),new THREE.MeshBasicMaterial({color:l[3]}));b.position.copy(p.position);grp.add(b);W.lamps.push(p);}
  scene.add(new THREE.AmbientLight(0x4a4d6a,.85));
  const hemi=new THREE.HemisphereLight(0x6a78b0,0x1a1410,.35);scene.add(hemi);
  const moon=new THREE.DirectionalLight(0x6f86c0,.35);moon.position.set(-20,40,10);scene.add(moon);
  buildNav();
  return W;
}
function buildNav(){
  if(NODES.length)return;
  const D=id=>WORLD.doors.find(d=>d.id===id);
  const dg=id=>{const d=D(id);return()=>d.state!==2;};
  const C={C:[9,5],F:[20,5],I:[31,5],B:[9,15],A:[20,15],D:[31,15],H:[9,25],G:[20,25],E:[31,25]};
  for(const k in C)N(k,C[k][0],C[k][1]);
  N('U1',9,25,4);N('U2',20,25,4);N('U3',31,25,4);N('GAL',20,18.6,4);N('RT',16.25,18.3,4);N('RB',16.25,10.9,0);
  const dn=(id,x,z,y=0)=>N('d'+id,x,z,y);
  dn('CB',8,10);dn('FH',20,10);dn('ID',32,10);dn('BH',8,20);dn('HG',20,20);dn('DE',32,20);dn('CF',14,5);dn('BA',14,15);dn('HGw',14,25);dn('FI',26,5);dn('AD',26,15);dn('GE',26,25);
  dn('UG',20,20,4);dn('U12',14,25,4);dn('U23',26,25,4);
  const conn=(id,a,b)=>{E(a,'d'+id,dg(id));E('d'+id,b,dg(id));};
  conn('CB','C','B');conn('FH','F','A');conn('ID','I','D');conn('BH','B','H');conn('HG','A','G');conn('DE','D','E');
  conn('CF','C','F');conn('BA','B','A');conn('HGw','H','G');conn('FI','F','I');conn('AD','A','D');conn('GE','G','E');
  conn('UG','GAL','U2');conn('U12','U1','U2');conn('U23','U2','U3');
  N('RBa',19,11.2);E('A','RBa');E('RBa','RB');E('RB','RT');E('RT','GAL');
  // secret passage (bookshelf)
  N('Pin',12.2,8.8);N('P',14,8.8);N('Pout',15.6,8.8);const f0=WORLD.furn[0];
  E('C','Pin');E('Pin','P',()=>f0.s===1);E('P','Pout',()=>f0.s===1);E('Pout','F');
  // exits
  const exRoom=['I','D','E','G','H'];
  EXITS.forEach((e,i)=>{
    const o=WORLD.exits[i];N('L'+i,e.lx-e.dirx,e.lz-e.dirz);E(exRoom[i],'L'+i);
    const dx=e.ax==='x'?(e.a+e.b)/2:e.f,dz=e.ax==='x'?e.f:(e.a+e.b)/2;
    N('Xa'+i,dx-e.dirx*1.3,dz-e.dirz*1.3);N('X'+i,dx,dz);N('O'+i,dx+e.dirx*2.2,dz+e.dirz*2.2);
    E('L'+i,'Xa'+i);E('Xa'+i,'X'+i,()=>o.open);E('X'+i,'O'+i);
  });
  // sofa / rack gates: edges through blocked doors
  const sofa=WORLD.furn[1],rack=WORLD.furn[2];
  for(const e of EDGES){const n1=NODES[e.a].id,n2=NODES[e.b].id;
    if(n1==='dBA'||n2==='dBA'){const old=e.gate;if(NODES[e.a].id==='B'||NODES[e.b].id==='B')e.gate=()=>(!old||old())&&sofa.s!==1;}
    if(n1==='dDE'||n2==='dDE'){const old=e.gate;if(NODES[e.a].id==='E'||NODES[e.b].id==='E')e.gate=()=>(!old||old())&&rack.s!==1;}}
}
function findPath(from,to,ignoreGates){
  const n=NODES.length,dist=new Array(n).fill(1e9),prev=new Array(n).fill(-1),done=new Array(n).fill(false);
  dist[from]=0;
  for(let k=0;k<n;k++){
    let u=-1,b=1e9;for(let i=0;i<n;i++)if(!done[i]&&dist[i]<b){b=dist[i];u=i;}
    if(u<0)break;done[u]=true;if(u===to)break;
    for(const e of NODES[u].adj){if(!ignoreGates&&e.gate&&!e.gate())continue;const v=e.a===u?e.b:e.a;const nd=dist[u]+e.w;if(nd<dist[v]){dist[v]=nd;prev[v]=u;}}
  }
  if(dist[to]>=1e9)return null;
  const p=[];for(let c=to;c>=0;c=prev[c])p.push(c);return p.reverse();
}
function nearestNode(x,z,y){
  let bi=-1,bd=1e9;
  for(let i=0;i<NODES.length;i++){const n=NODES[i];if(Math.abs(n.y-y)>2)continue;const d=hyp(x,z,n.x,n.z);
    if(d<bd&&(d<1.2||los(x,z,y,n.x,n.z,n.y))){bd=d;bi=i;}}
  if(bi<0){for(let i=0;i<NODES.length;i++){const n=NODES[i];if(Math.abs(n.y-y)>2)continue;const d=hyp(x,z,n.x,n.z);if(d<bd){bd=d;bi=i;}}}
  return bi;
}
