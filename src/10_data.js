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
// skin = character colour (the colour IS the role), hat = accessory that makes each role readable at a glance
const CHARS=[
 {k:'ath',n:'Athlète olympique',cat:'fuite',col:0xd9372f,css:'#d9372f',hat:'band',
  passive:'Rapide et silencieux accroupi.',
  q:{n:'Gant de boxe',d:'Assomme un invité à moins de 2,6 m pendant 4 s.',cd:18},
  f:{n:'Dopage',d:'Vitesse ×1,6 et insensible pendant 6 s.'}},
 {k:'esc',n:'Escroc braqueur',cat:'fuite',col:0x2f6fe0,css:'#2f6fe0',hat:'mask',
  passive:'Pistolet paralysant (G) : coupe les capacités d’une cible 6 s.',
  q:{n:'Bombe fumigène',d:'Nuage opaque pendant 8 s.',cd:25},
  f:{n:'Invisibilité',d:'Invisible 7 s.'},p:{n:'Pistolet',cd:22}},
 {k:'exp',n:'Explorateur braconnier',cat:'enq',col:0x8a5a2b,css:'#8a5a2b',hat:'safari',
  passive:'Voit les traces de pas (temporaires, avec direction).',
  q:{n:'Nuage d’insectes',d:'Tétanise ceux qui le traversent, 10 s.',cd:25},
  f:{n:'Fusil',d:'Une balle. Neutralise le meurtrier ; un tir raté = recharge de 60 s.'}},
 {k:'jou',n:'Journaliste ragoteur',cat:'enq',col:0xc7962b,css:'#c7962b',hat:'press',
  passive:'Connaît le nombre de personnes vivantes.',
  q:{n:'Indiscrétion',d:'Voit où se trouvent tous les joueurs 5 s.',cd:30},
  f:{n:'Lien',d:'Lie deux joueurs : si l’un meurt, l’autre reçoit un bonus puissant.'}},
 {k:'ing',n:'Ingénieur bricoleur',cat:'deb',col:0x2bb7c4,css:'#2bb7c4',hat:'helmet',
  passive:'Répare les sabotages en 2,5 s au lieu de 6 s.',
  q:{n:'Barricade',d:'Verrouille la porte proche pendant 18 s.',cd:25},
  f:{n:'Protection',d:'Une vie supplémentaire (40 s).'}},
 {k:'enf',n:'Enfant pourri gâté',cat:'deb',col:0xd13fae,css:'#d13fae',hat:'prop',
  passive:'Yoyo (G) : attrape un invité à moins de 7 m.',
  q:{n:'Lance-pierre',d:'Aveugle la cible visée pendant 4 s.',cd:20},
  f:{n:'Chewing-gum',d:'Bulles géantes qui bloquent un passage 10 s.'},p:{n:'Yoyo',cd:16}},
 {k:'art',n:'Artiste inspiré',cat:'fuite',col:0xf2d21f,css:'#f2d21f',hat:'beret',
  passive:'Accroupi et immobile : prend la texture du mur et se camoufle.',
  q:{n:'Flaque de peinture',d:'Pose une flaque qui ralentit (15 s).',cd:20},
  f:{n:'Déguisement',d:'Prend l’apparence d’un autre invité 15 s (sans ses pouvoirs).'}},
 {k:'sta',n:'Star hollywoodienne',cat:'fuite',col:0xff7eb9,css:'#ff7eb9',hat:'shades',
  passive:'Accroupie et immobile : joue le cadavre.',
  q:{n:'Leurre sonore',d:'Un cri ou des pas résonnent à distance.',cd:20},
  f:{n:'Sosie',d:'Crée une version immobile d’elle-même pendant 25 s.'}},
 {k:'che',n:'Chef étoilé',cat:'deb',col:0xf0f0f0,css:'#f0f0f0',hat:'toque',
  passive:'Louche (G) : assomme un invité, mais vous ralentit ensuite.',
  q:{n:'Coup de feu',d:'Vitesse ×1,3 pour vous et les alliés proches pendant 5 s.',cd:25},
  f:{n:'Service en rafale',d:'Court 5 s sans s’arrêter et assomme sur son passage.'},p:{n:'Louche',cd:10}},
 {k:'gee',n:'Geek bidouilleur',cat:'enq',col:0x1fd6a8,css:'#1fd6a8',hat:'phones',
  passive:'Tâches et réparations beaucoup plus rapides.',
  q:{n:'Drone espion',d:'Pose un drone (25 s) qui signale les passages.',cd:22},
  f:{n:'Copie',d:'Imite la dernière capacité unique que vous avez vue utiliser.'}},
 {k:'cia',n:'Patron de la CIA',cat:'enq',col:0x4b3fd0,css:'#4b3fd0',hat:'agent',
  passive:'Menottes (G) : entrave un invité (une personne à la fois).',
  q:{n:'Roulade',d:'Roulade de 4 m avec 1,5 s d’insensibilité.',cd:15},
  f:{n:'Détection',d:'Sonde l’invité visé : verdict imparfait.'},p:{n:'Menottes',cd:14}},
 {k:'mus',n:'Musicien mégalo',cat:'deb',col:0x9b4fe0,css:'#9b4fe0',hat:'afro',
  passive:'Plus rapide que la moyenne.',
  q:{n:'Onde de choc',d:'Repousse les invités proches.',cd:18},
  f:{n:'Enceinte géante',d:'Zone assommante 10 s : 3 s à l’intérieur = assommé.'}},
 {k:'rob',n:'Robot-valet',cat:'fuite',col:0x9adf3a,css:'#9adf3a',hat:'antenna',
  passive:'Silencieux en marchant, bruyant en courant.',
  q:{n:'Balise',d:'Pose une balise (40 s) qui signale les passages.',cd:20},
  f:{n:'Téléportation',d:'Se téléporte vers la dernière balise posée.'}},
 {k:'spa',n:'Spationaute déconnecté',cat:'deb',col:0xff8a1f,css:'#ff8a1f',hat:'dome',
  passive:'Flotte en sautant : saut haut, chute lente.',
  q:{n:'Détournement',d:'Inverse les commandes de la cible visée 4 s.',cd:22},
  f:{n:'Apesanteur',d:'Coupe les capacités de la pièce (vous aussi) 4 s.'}},
 {k:'med',n:'Médecin pharmaceutique',cat:'fuite',col:0x2f9e44,css:'#2f9e44',hat:'surgeon',
  passive:'Pilules (G) : effet aléatoire ; ralenti après 3 prises.',
  q:{n:'Bombe d’acide',d:'Flaque d’acide (10 s) qui bloque le passage.',cd:22},
  f:{n:'Réanimation',d:'Réanime un mort : maintenez E sur son corps (4 s).'},p:{n:'Pilule',cd:6}},
];
const OBJS=[
 {n:'Disjoncteur du garage',t:'hold',x:30,z:.75,y:0},
 {n:'Coffre du bureau',t:'time',x:20.25,z:6.4,y:0},
 {n:'Terminal de la bibliothèque',t:'seq',x:.75,z:7.5,y:0},
 {n:'Four de la cuisine',t:'hold',x:43.25,z:25.5,y:0},
 {n:'Projecteur du cinéma',t:'time',x:8.5,z:33.25,y:0},
 {n:'Chaudière',t:'hold',x:43.25,z:19.5,y:-4},
 {n:'Ordinateur du laboratoire',t:'seq',x:.75,z:14,y:-4},
 {n:'Coffre-fort de la suite',t:'time',x:20,z:33.25,y:4},
 {n:'Synthé de la salle de musique',t:'hold',x:43.25,z:29,y:4},
 {n:'Standard de la salle de jeux',t:'seq',x:31,z:12.75,y:4},
];
const MG_INFO={hold:['Maintenez E','Gardez la touche E enfoncée jusqu’à la fin de la jauge.'],
  seq:['Mémorisez la séquence','Retenez les flèches, puis saisissez-les avec ZQSD / flèches.'],
  time:['Synchronisation','Appuyez sur Espace quand le curseur est dans la zone verte (3 fois).']};
const BASEY={'-1':-4,'0':0,'1':4};
function R(id,n,lv,x0,z0,x1,z1,f,o){return Object.assign({id,n,lv,x0,z0,x1,z1,f,y:BASEY[lv],cx:(x0+x1)/2,cz:(z0+z1)/2},o||{});}
const ROOMS=[
 // --- rez-de-chaussée
 R('lib','Bibliothèque',0,0,0,13,10,'parq'),R('study','Bureau de Mr Bills',0,13,0,21,8,'carpet'),R('fum','Fumoir',0,21,0,27,8,'carpetd'),
 R('gar','Garage',0,27,0,44,12,'conc'),R('cor','Galerie des portraits',0,13,8,27,11,'carpet'),R('salon','Salon',0,0,10,13,22,'parq'),
 R('hall','Grand hall',0,13,11,27,23,'tile',{tall:1}),R('din','Salle à manger',0,27,12,39,24,'parq'),
 R('pan','Cellier',0,39,12,44,24,'tile2',{tall:1,cx:40,cz:18.5}),R('kit','Cuisine',0,27,24,44,34,'tile2'),
 R('serre','Serre',0,13,23,27,34,'grass2'),R('cin','Cinéma',0,0,22,13,34,'carpetd'),
 // --- étage
 R('atr','Atrium',1,13,11,27,23,'parq',{void:1}),R('suite','Suite de Mr Bills',1,13,23,27,34,'carpet'),
 R('music','Salle de musique',1,27,24,44,34,'parq'),R('jeux','Salle de jeux',1,27,12,39,24,'carpetd'),
 R('palier','Palier',1,39,21,44,24,'carpet'),R('stw','Cage d’escalier',1,39,12,44,21,'parq',{void:1}),
 R('chW','Chambre bleue',1,0,10,13,22,'carpet'),R('chSW','Chambre d’amis',1,0,22,13,34,'parq'),
 // --- sous-sol
 R('cave','Cave à vin',-1,27,12,39,24,'stone'),R('chauf','Chaufferie',-1,39,12,44,24,'conc'),R('tun','Tunnel',-1,13,14,27,17,'stone'),
 R('lab','Laboratoire secret',-1,0,10,13,22,'tile2'),R('crypt','Crypte',-1,13,17,27,26,'stone'),
 R('arch','Archives',-1,0,22,13,34,'parq'),R('garde','Garde-manger froid',-1,27,24,44,34,'tile2'),R('sec','Salle secrète',-1,13,26,27,34,'stone'),
];
ROOMS.forEach((r,i)=>r.idx=i);
const RID={};ROOMS.forEach(r=>RID[r.id]=r);
function roomAt(x,z,y){
  const lv=y<-2?-1:y>2?1:0;
  for(const r of ROOMS)if(r.lv===lv&&!r.void&&x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1)return r;
  return null;
}
// door gaps: ax 'x' = wall along x at z=f (gap a..b along x) ; 'z' = wall along z at x=f (gap a..b along z)
const DOORS=[
 {lv:0,ax:'x',f:10,a:5,b:7},{lv:0,ax:'z',f:13,a:1,b:3},{lv:0,ax:'z',f:13,a:8,b:10},{lv:0,ax:'z',f:21,a:3,b:5},
 {lv:0,ax:'x',f:8,a:16,b:18},{lv:0,ax:'x',f:8,a:23,b:25},{lv:0,ax:'z',f:27,a:8,b:10},{lv:0,ax:'x',f:11,a:19,b:21},
 {lv:0,ax:'z',f:13,a:12,b:14},{lv:0,ax:'x',f:22,a:5,b:7},{lv:0,ax:'z',f:27,a:16,b:18},{lv:0,ax:'x',f:23,a:19,b:21},
 {lv:0,ax:'x',f:12,a:31,b:33},{lv:0,ax:'x',f:12,a:39,b:41},{lv:0,ax:'z',f:39,a:17,b:19},{lv:0,ax:'x',f:24,a:32,b:34},
 {lv:0,ax:'x',f:24,a:40,b:42},{lv:0,ax:'z',f:27,a:28,b:30},{lv:0,ax:'z',f:13,a:28,b:30},
 {lv:1,ax:'z',f:13,a:28,b:30},{lv:1,ax:'z',f:27,a:28,b:30},{lv:1,ax:'z',f:39,a:22,b:24},{lv:1,ax:'x',f:24,a:32,b:34},
 {lv:1,ax:'x',f:24,a:41,b:43},{lv:1,ax:'x',f:22,a:5,b:7},
 {lv:-1,ax:'z',f:27,a:14,b:16},{lv:-1,ax:'z',f:13,a:14,b:16},{lv:-1,ax:'x',f:17,a:19,b:21},{lv:-1,ax:'z',f:13,a:23,b:25},
 {lv:-1,ax:'x',f:22,a:5,b:7},{lv:-1,ax:'z',f:39,a:16,b:18},{lv:-1,ax:'x',f:24,a:32,b:34},{lv:-1,ax:'x',f:24,a:41,b:43},
 {lv:-1,ax:'z',f:27,a:24,b:26},
];
const PASSAGE={lv:0,ax:'z',f:13,a:5,b:7}; // hidden behind the sliding bookshelf
const PASSAGE2={lv:-1,ax:'x',f:26,a:19,b:21}; // hidden behind the pivoting sarcophagus
// crawl-only openings: vents have a removable grille, arches are open. Crouch to pass (players only).
const VENTS=[
 {lv:0,ax:'z',f:21,a:6,b:7},{lv:0,ax:'x',f:12,a:36,b:37},{lv:0,ax:'x',f:22,a:1,b:2},{lv:0,ax:'x',f:23,a:24,b:25},
 {lv:0,ax:'x',f:24,a:35,b:36},{lv:0,ax:'x',f:24,a:43,b:44},{lv:-1,ax:'x',f:24,a:37,b:38},{lv:-1,ax:'x',f:22,a:10,b:11},
 {lv:-1,ax:'z',f:27,a:28,b:29},{lv:1,ax:'z',f:13,a:24,b:25},{lv:1,ax:'x',f:24,a:37,b:38},
];
const LOWS=[{lv:-1,ax:'x',f:24,a:35,b:36},{lv:0,ax:'z',f:39,a:13,b:14},{lv:1,ax:'x',f:22,a:9,b:10}];
const FUSES=[{lv:-1,x:43.3,z:22.6,y:-4},{lv:0,x:13.8,z:19.6,y:0},{lv:1,x:13.9,z:26.6,y:4}];
const TLAMPS=[
 {n:'Lampe de bureau',x:17.3,z:3.3,y:.8,col:0xa8ff98,int:.8,dist:10},{n:'Lampe de lecture',x:7.8,z:4.7,y:.78,col:0xffc27a,int:.8,dist:10},
 {n:'Lampe de chevet',x:19.2,z:31.4,y:4.6,col:0xffd8a0,int:.8,dist:10},{n:'Lampe de chevet',x:2.4,z:33.2,y:4.6,col:0xffe090,int:.8,dist:10},
 {n:'Bougeoir',x:33,z:18.1,y:-3.1,col:0xffa040,int:.9,dist:10},{n:'Bougeoir',x:20,z:30,y:-3.0,col:0xffa040,int:.9,dist:10},
];
const TPORTS=[
 {k:'dumb',n:'Monte-charge',a:{x:37,z:24.75,y:0},b:{x:37,z:24.75,y:4}},
 {k:'hatch',n:'Trappe secrète',a:{x:3.3,z:1.9,y:0},b:{x:6.6,z:30.4,y:-4}},
];
const WINS=[
 {ax:'x',f:0,a:6,b:8,n:'Fenêtre de la bibliothèque'},{ax:'z',f:0,a:18,b:20,n:'Fenêtre du salon'},{ax:'x',f:0,a:33,b:35,n:'Fenêtre du garage'},
 {ax:'x',f:34,a:14,b:16,n:'Fenêtre de la serre'},{ax:'x',f:34,a:31,b:33,n:'Fenêtre de la cuisine'},{ax:'z',f:44,a:14,b:16,n:'Fenêtre du cellier'},
];
const EXITS=[
 {n:'Porte de service (garage)',ax:'z',f:44,a:4,b:6,lx:42.9,lz:8,dirx:1,dirz:0,zx:[44.6,47.5],zz:[3,7]},
 {n:'Porte de la cuisine',ax:'z',f:44,a:28,b:30,lx:42.9,lz:31.8,dirx:1,dirz:0,zx:[44.6,47.5],zz:[27,31]},
 {n:'Issue du salon',ax:'z',f:0,a:14,b:16,lx:1.1,lz:17.2,dirx:-1,dirz:0,zx:[-3.5,-.6],zz:[13,17]},
 {n:'Porte de la serre',ax:'x',f:34,a:19,b:21,lx:23.2,lz:32.9,dirx:0,dirz:1,zx:[18,22],zz:[34.6,37.5]},
 {n:'Issue du bureau',ax:'x',f:0,a:16,b:18,lx:19.8,lz:1.1,dirx:0,dirz:-1,zx:[15,19],zz:[-3.5,-.6]},
];
// stairs: axis z only. y goes from ya at z0 to yb at z1. nodes: approach points for bots
const STAIRS=[
 {id:'S1',n:'Grand escalier',x0:15,x1:17,z0:15,z1:23,ya:0,yb:4,
  nodes:[['a',18.8,13.4,0],['lo',16,14.2,0],['hi',16,24.4,4]],chain:['r:hall','a','lo','hi','r:suite'],up:1,ew:0},
 {id:'S4',n:'Escalier de service',x0:41,x1:43,z0:13,z1:21,ya:0,yb:4,
  nodes:[['a',40,13.4,0],['lo',42,12.75,0],['hi',42,22.4,4]],chain:['r:pan','a','lo','hi','r:palier'],up:1,ew:1},
 {id:'S2',n:'Escalier de la cave',x0:28,x1:30,z0:25,z1:32,ya:-4,yb:0,
  nodes:[['lo',29,24.6,-4],['hi',29,32.9,0],['a',32.2,31.6,0]],chain:['r:garde','lo','hi','a','r:kit'],up:0},
 {id:'S3',n:'Escalier des archives',x0:2,x1:4,z0:25,z1:32,ya:-4,yb:0,
  nodes:[['pre',5.5,23.6,-4],['lo',3,23.9,-4],['hi',3,32.9,0],['a',6,31,0]],chain:['r:arch','pre','lo','hi','a','r:cin'],up:0},
];
const STAIR_GAPS=[{lv:0,ax:'x',f:23,a:15,b:17,kind:'stair'},{lv:1,ax:'x',f:21,a:41,b:43,kind:'open'}];
const HOLES=[{x0:28,z0:25,x1:30,z1:32},{x0:2,z0:25,x1:4,z1:32}];
const FURN=[
 {n:'Bibliothèque coulissante',kind:'shelf',w:2,d:.95,h:2.4,col:0x4a2c18,st:[{x:12.35,z:6,ry:-Math.PI/2},{x:12.35,z:4.1,ry:-Math.PI/2}]},
 {n:'Canapé',kind:'sofa',w:2.8,d:1,h:1.1,col:0x6b2a3a,st:[{x:9,z:10.75,ry:0},{x:12.3,z:13,ry:-Math.PI/2}]},
 {n:'Étagère métallique',kind:'rack',w:2.8,d:1,h:2,col:0x6d7480,st:[{x:34.4,z:33.3,ry:0},{x:41,z:24.8,ry:0}]},
 {n:'Grande armoire',kind:'closet',w:2.8,d:1,h:2.3,col:0x3a2a1e,st:[{x:10.8,z:22.7,ry:0},{x:6,z:22.7,ry:0}]},
 {n:'Table de billard',lv:1,kind:'pool',w:2.6,d:1.3,h:1,col:0x1f5a34,st:[{x:36.5,z:14.3,ry:Math.PI/2},{x:38,z:23,ry:Math.PI/2}]},
 {n:'Caisses',kind:'crate',w:2.4,d:1.2,h:1.3,col:0x8a6a3a,st:[{x:29.4,z:11,ry:0},{x:28.4,z:9,ry:Math.PI/2}]},
 {n:'Tonneaux',lv:-1,kind:'barrel',w:2.4,d:1.2,h:1.3,col:0x6a4a2a,st:[{x:37.6,z:12.95,ry:0},{x:28.4,z:15,ry:Math.PI/2}]},
 {n:'Commode du hall',kind:'dresser',w:2.2,d:.8,h:1.25,col:0x5a3a22,st:[{x:26.4,z:14.4,ry:-Math.PI/2},{x:20,z:11.75,ry:0}]},
 {n:'Buffet',kind:'buffet',w:2.4,d:.9,h:1.3,col:0x4a2c18,st:[{x:29.6,z:23.45,ry:Math.PI},{x:27.75,z:17,ry:Math.PI/2}]},
 {n:'Banquette',kind:'bench',w:2.6,d:.8,h:1.1,col:0x6b2a3a,st:[{x:21.4,z:8.6,ry:0},{x:13.75,z:9.5,ry:Math.PI/2}]},
 {n:'Chariot de service',kind:'cart',w:2.4,d:1,h:1.25,col:0x8a8f96,st:[{x:37.5,z:24.85,ry:0},{x:28,z:29,ry:Math.PI/2}]},
 {n:'Commode',lv:1,kind:'dresser',w:2.2,d:.8,h:1.25,col:0x4a3a2a,st:[{x:2.4,z:10.65,ry:0},{x:6,z:21.6,ry:Math.PI}]},
 {n:'Étagère d’archives',lv:-1,kind:'archrack',w:2.6,d:.9,h:2,col:0x5a5a64,st:[{x:8,z:33.2,ry:Math.PI},{x:12.3,z:24,ry:-Math.PI/2}]},
 {n:'Sarcophage pivotant',lv:-1,kind:'sarco',w:2.4,d:1,h:1.25,col:0x6a6a72,st:[{x:20,z:25.3,ry:0},{x:23.4,z:25.3,ry:0}]},
 {n:'Cercueil',lv:-1,kind:'sarco',w:2.4,d:1,h:1.25,col:0x3a2a1e,st:[{x:25.9,z:21.5,ry:Math.PI/2},{x:20,z:18,ry:0}]},
];
const HIDES=[
 {k:'wardrobe',x:12.3,z:1.2,y:0},{k:'wardrobe',x:12.3,z:21,y:0},{k:'locker',x:43.2,z:1.2,y:0},{k:'wardrobe',x:27.9,z:23,y:0},
 {k:'locker',x:35,z:33.2,y:0},{k:'wardrobe',x:12.2,z:24,y:0},{k:'barrel',x:43.2,z:13.2,y:-4},{k:'barrel',x:27.9,z:23,y:-4},
 {k:'wardrobe',x:25.8,z:33,y:4},{k:'wardrobe',x:1,z:33,y:4},
 {k:'curtain',x:1,z:21,y:0},{k:'crate',x:43.3,z:11,y:0},{k:'bed',x:11.6,z:19,y:4},{k:'coffin',x:25.6,z:18.6,y:-4},{k:'locker',x:13.9,z:1.1,y:0},
 {k:'curtain',x:26.2,z:22.2,y:0},{k:'barrel',x:43.2,z:33,y:-4},{k:'crate',x:14,z:33,y:-4},{k:'locker',x:38.3,z:13,y:4},
];
const NOISE=[
 {k:'piano',n:'Piano',x:38,z:32.6,y:4,w:2.2,d:1.2,h:1.0,r:42},
 {k:'gramo',n:'Gramophone',x:1.1,z:12,y:0,w:.8,d:.8,h:1.0,r:30},
 {k:'bell',n:'Cloche d’alarme',x:26.2,z:12,y:0,w:.5,d:.5,h:1.4,r:48},
 {k:'tv',n:'Vieux téléviseur',x:1.2,z:30,y:0,w:.9,d:.9,h:.9,r:26},
];
// lamps: room, pos, colour, intensity, distance, flicker, cone
const LAMPS=[
 ['hall',20,7.2,17,0xffe2b0,1.25,24,0,1],['hall',14.4,3,13,0xffb070,.45,9,.2,0],['hall',26.4,3,20,0xffb070,.45,9,.2,0],
 ['lib',6,3.3,5,0xffb866,1.0,15,0,0],['lib',2,1.3,2,0xff9a40,.5,7,.35,0],
 ['study',17,3.2,4,0xa8e8a0,.95,13,0,1],['fum',24,3.2,4,0xff5a40,.75,11,.15,0],['cor',20,3.3,9.5,0xffc890,.55,12,0,0],
 ['gar',31,3.5,4,0xbcd8ff,.95,16,.3,1],['gar',38,3.5,8,0xbcd8ff,.7,12,.25,0],
 ['salon',6.5,3.3,16,0xffc27a,1.0,15,0,0],['salon',9,1.3,10.9,0xff8a30,.75,9,.45,0],
 ['din',33,3.6,18,0xffd8a0,1.05,17,.05,1],['pan',41,3.4,18,0xffc890,.5,12,.1,0],
 ['kit',34,3.4,29,0xe8f0ff,.95,16,.08,0],['serre',20,3.4,28,0x9affc0,.85,16,0,0],['cin',6,3.4,28,0xa070ff,.45,13,.3,0],['cin',8.5,2,33.3,0x70a0ff,.6,9,.5,0],
 ['suite',20,7.3,28,0xffd0a0,1.05,16,0,1],['music',36,7.3,29,0xc080ff,.9,16,.1,0],['jeux',33,7.3,18,0x90ff90,.9,16,0,0],
 ['palier',41.5,7.3,22.5,0xffc890,.5,10,0,0],['chW',6,7.3,16,0x80a8ff,.7,14,0,0],['chSW',6,7.3,28,0xffe090,.7,14,0,0],
 ['cave',33,-.7,18,0xffb060,.9,15,.25,0],['chauf',41.5,-.7,18,0xff7020,1.0,13,.4,0],['tun',16,-.7,15.5,0xff3030,.55,10,.2,0],['tun',24,-.7,15.5,0xff3030,.55,10,.2,0],
 ['lab',6.5,-.7,16,0x40ff90,.9,14,.15,1],['sec',20,-.7,30,0xff4060,.8,14,.3,1],['crypt',20,-.7,21.5,0x6080ff,.75,14,.1,0],['arch',6.5,-.7,28,0xffe080,.7,13,.1,0],['garde',36,-.7,29,0xc8e8ff,.8,15,.1,0],
];
const GARDEN_LAMPS=[[-3,3,-3],[47,3,-3],[-3,3,37],[47,3,37],[22,3,-3.5],[22,3,37.5]];

/* ============================ colliders & movement ============================ */
const COL=[];
function addCol(x0,y0,z0,x1,y1,z1,on=true){const c={x0,y0,z0,x1,y1,z1,on};COL.push(c);return c;}
function collide(e,r=0.35){
  // r is the walker radius; e.h = body height (1.7 standing, ~1.0 crouching)
  for(let it=0;it<3;it++){
    let hit=false;
    for(let i=0;i<COL.length;i++){const c=COL[i];if(!c.on)continue;
      if(c.y0>=e.y+(e.h||1.7)||c.y1<=e.y+0.05)continue;
      if(e.x<c.x0-r||e.x>c.x1+r||e.z<c.z0-r||e.z>c.z1+r)continue;
      const nx=clamp(e.x,c.x0,c.x1),nz=clamp(e.z,c.z0,c.z1),dx=e.x-nx,dz=e.z-nz,d2=dx*dx+dz*dz;
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
  e.x=clamp(e.x,-5.6,49.6);e.z=clamp(e.z,-5.6,39.6);
}
const FLOORS=[];const RAMPS=[];
function floorH(x,z,cy){
  let best=-99;
  for(let i=0;i<FLOORS.length;i++){const f=FLOORS[i];
    if(x>=f.x0&&x<=f.x1&&z>=f.z0&&z<=f.z1&&f.y<=cy+0.6&&f.y>best){
      if(f.y===0&&f.ground){let h=false;for(const o of HOLES)if(x>=o.x0&&x<=o.x1&&z>=o.z0&&z<=o.z1){h=true;break;}if(h)continue;}
      best=f.y;}}
  for(const r of RAMPS){if(x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1){const h=r.ya+(z-r.z0)/(r.z1-r.z0)*(r.yb-r.ya);if(h<=cy+0.6&&h>best)best=h;}}
  return best<-50?0:best;
}
function stepVert(e,dt){
  const t=floorH(e.x,e.z,e.y);e.fell=0;
  if(e.vy>0||e.y-t>0.35){e.vy-=14*(e.vy<0?(e.gs||1):1)*dt;e.y+=e.vy*dt;if(e.y<=t){if(e.vy<-8)e.fell=1;e.y=t;e.vy=0;}}
  else{e.y=Math.abs(e.y-t)<0.01?t:lerp(e.y,t,clamp(dt*20,0,1));e.vy=0;}
}
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

/* ============================ grid navigation (A*) ============================ */
const DYN=[]; // dynamic colliders: {c, type, o}; type decides whether they block walkers right now
const GN={cs:.5,x0:-6,z0:-6,W:112,H:92,walk:[null,null,null],st:[null,null,null],dyn:[null,null,null],portals:new Map(),dynT:-9,ready:false};
const LVY=[-4,0,4];
const lvIdx=y=>y<-2?0:y>2?2:1;
const gcx=x=>Math.floor((x-GN.x0)/GN.cs),gcz=z=>Math.floor((z-GN.z0)/GN.cs);
const gx=c=>GN.x0+(c+.5)*GN.cs,gz=c=>GN.z0+(c+.5)*GN.cs;
function gBuild(){
  const W=GN.W,H=GN.H,R=.42;
  for(let l=0;l<3;l++){GN.walk[l]=new Uint8Array(W*H);GN.st[l]=new Uint8Array(W*H);GN.dyn[l]=new Uint8Array(W*H);}
  const lvOf=[-1,0,1];
  for(let l=0;l<3;l++){
    const w=GN.walk[l],lv=lvOf[l];
    for(let cz=0;cz<H;cz++)for(let cx=0;cx<W;cx++){
      const x=gx(cx),z=gz(cz);let ok=false;
      if(lv===0)ok=x>-5.4&&x<49.4&&z>-5.4&&z<39.4;
      else for(const r of ROOMS)if(r.lv===lv&&!r.void&&x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1){ok=true;break;}
      if(ok){for(const h of HOLES)if(lv===0&&x>h.x0&&x<h.x1&&z>h.z0&&z<h.z1){ok=false;break;}}
      if(ok)for(const s of STAIRS){if(x>s.x0&&x<s.x1&&z>s.z0&&z<s.z1){const low=s.ya<0?-1:0,high=s.ya<0?0:1;if(lv===low||lv===high){ok=false;break;}}}
      w[cz*W+cx]=ok?1:0;
    }
  }
  const mark=(arr,c,l)=>{
    const y=LVY[l],x0=Math.max(0,gcx(c.x0-R)),x1=Math.min(W-1,gcx(c.x1+R)),z0=Math.max(0,gcz(c.z0-R)),z1=Math.min(H-1,gcz(c.z1+R));
    if(c.y0>=y+1.7||c.y1<=y+.05)return;
    for(let cz=z0;cz<=z1;cz++)for(let cx=x0;cx<=x1;cx++){
      const px=gx(cx),pz=gz(cz),nx=clamp(px,c.x0,c.x1),nz=clamp(pz,c.z0,c.z1);
      if(Math.hypot(px-nx,pz-nz)<R)arr[cz*W+cx]=1;}
  };
  for(const c of COL){if(c.dynf)continue;for(let l=0;l<3;l++)mark(GN.st[l],c,l);}
  // portals from stair end points
  GN.portals.clear();
  const free=(l,x,z)=>{let best=-1,bd=9;const cx0=gcx(x),cz0=gcz(z);
    for(let dz=-3;dz<=3;dz++)for(let dx=-3;dx<=3;dx++){const cx=cx0+dx,cz=cz0+dz;if(cx<0||cz<0||cx>=W||cz>=H)continue;const i=cz*W+cx;
      if(GN.walk[l][i]&&!GN.st[l][i]){const d=Math.hypot(gx(cx)-x,gz(cz)-z);if(d<bd){bd=d;best=i;}}}
    return best;};
  const add=(a,b,cost)=>{if(!GN.portals.has(a))GN.portals.set(a,[]);GN.portals.get(a).push([b,cost]);};
  STAIRS.forEach(s=>{
    const lo=s.nodes.find(n=>n[0]==='lo'),hi=s.nodes.find(n=>n[0]==='hi');
    const la=lvIdx(s.ya),lb=lvIdx(s.yb),ia=free(la,lo[1],lo[2]),ib=free(lb,hi[1],hi[2]);
    if(ia<0||ib<0){console.warn('portal',s.id,ia,ib);return;}
    const cost=Math.hypot(s.z1-s.z0,s.yb-s.ya)+2;
    add(la*W*H+ia,lb*W*H+ib,cost);add(lb*W*H+ib,la*W*H+ia,cost);
    s.portal=[la,ia,lb,ib];
  });
  GN.ready=true;
}
function gDyn(){
  const W=GN.W,H=GN.H,R=.42;
  for(let l=0;l<3;l++)GN.dyn[l].fill(0);
  for(const d of DYN){
    let b=false;
    switch(d.type){case'door':b=d.o.state>=2;break;case'win':b=true;break;case'exit':b=!d.o.open;break;default:b=true;}
    if(!b||!d.c.on)continue;
    const c=d.c;
    for(let l=0;l<3;l++){const y=LVY[l];if(c.y0>=y+1.7||c.y1<=y+.05)continue;
      const x0=Math.max(0,gcx(c.x0-R)),x1=Math.min(W-1,gcx(c.x1+R)),z0=Math.max(0,gcz(c.z0-R)),z1=Math.min(H-1,gcz(c.z1+R));
      for(let cz=z0;cz<=z1;cz++)for(let cx=x0;cx<=x1;cx++){const px=gx(cx),pz=gz(cz),nx=clamp(px,c.x0,c.x1),nz=clamp(pz,c.z0,c.z1);
        if(Math.hypot(px-nx,pz-nz)<R)GN.dyn[l][cz*W+cx]=1;}}
  }
}
function gFree(l,cx,cz){if(cx<0||cz<0||cx>=GN.W||cz>=GN.H)return false;const i=cz*GN.W+cx;return GN.walk[l][i]&&!GN.st[l][i]&&!GN.dyn[l][i];}
function gLine(l,ax,az,bx,bz){
  const n=Math.ceil(Math.hypot(bx-ax,bz-az)/.25);
  for(let i=1;i<n;i++){const t=i/n;if(!gFree(l,gcx(ax+(bx-ax)*t),gcz(az+(bz-az)*t)))return false;}
  return true;
}
function gNearest(l,x,z){
  const cx0=gcx(x),cz0=gcz(z);let best=-1,bd=1e9;
  for(let r=0;r<=6&&best<0;r++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){
    if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;const cx=cx0+dx,cz=cz0+dz;if(!gFree(l,cx,cz))continue;
    const d=Math.hypot(gx(cx)-x,gz(cz)-z);if(d<bd){bd=d;best=cz*GN.W+cx;}}
  return best;
}
// returns waypoint list [{x,z,y}] or null. Doors (closed) are passable: walkers open them.
function planPath(x,z,y,tx,tz,ty,now){
  if(!GN.ready)return null;
  if(now===undefined||now-GN.dynT>.4){gDyn();GN.dynT=now===undefined?-9:now;}
  const W=GN.W,H=GN.H,N=W*H,la=lvIdx(y),lb=lvIdx(ty);
  const s=gNearest(la,x,z),g=gNearest(lb,tx,tz);if(s<0||g<0)return null;
  const S=la*N+s,Gl=lb*N+g,gxp=gx(g%W),gzp=gz(Math.floor(g/W));
  const dist=new Map(),prev=new Map(),heap=[[0,S]];dist.set(S,0);
  const h=(st)=>{const l=Math.floor(st/N),i=st%N;return Math.hypot(gx(i%W)-gxp,gz(Math.floor(i/W))-gzp)+(l!==lb?2:0);};
  const push=(it)=>{heap.push(it);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;}};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){let l=2*i+1,r=l+1,m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m;}}return top;};
  let found=false,it=0;const closed=new Set();
  const DX=[1,-1,0,0,1,1,-1,-1],DZ=[0,0,1,-1,1,-1,1,-1];
  while(heap.length&&it++<40000){
    const [,cur]=pop();if(closed.has(cur))continue;closed.add(cur);if(cur===Gl){found=true;break;}
    const l=Math.floor(cur/N),i=cur%N,cx=i%W,cz=Math.floor(i/W),gc=dist.get(cur);
    for(let k=0;k<8;k++){
      const nx=cx+DX[k],nz=cz+DZ[k];if(!gFree(l,nx,nz))continue;
      if(k>=4&&(!gFree(l,cx+DX[k],cz)||!gFree(l,cx,cz+DZ[k])))continue;
      const ns=l*N+nz*W+nx,nc=gc+(k<4?1:1.414)*GN.cs;
      if(nc<(dist.get(ns)??1e9)){dist.set(ns,nc);prev.set(ns,cur);push([nc+h(ns),ns]);}
    }
    const po=GN.portals.get(cur);if(po)for(const [ns,c] of po){const nc=gc+c;if(nc<(dist.get(ns)??1e9)){dist.set(ns,nc);prev.set(ns,cur);push([nc+h(ns),ns]);}}
  }
  if(!found)return null;
  const cells=[];for(let c=Gl;c!==undefined;c=prev.get(c))cells.push(c);cells.reverse();
  // string-pull per level, portals keep both ends
  const pts=cells.map(c=>({l:Math.floor(c/N),x:gx((c%N)%W),z:gz(Math.floor((c%N)/W))}));
  const out=[];let a=0;
  while(a<pts.length-1){
    let b=a+1;
    if(pts[b].l===pts[a].l){while(b+1<pts.length&&pts[b+1].l===pts[a].l&&gLine(pts[a].l,pts[a].x,pts[a].z,pts[b+1].x,pts[b+1].z))b++;}
    out.push({x:pts[b].x,z:pts[b].z,y:LVY[pts[b].l]});a=b;
  }
  if(out.length)out[out.length-1]={x:tx,z:tz,y:ty};else out.push({x:tx,z:tz,y:ty});
  return out;
}
