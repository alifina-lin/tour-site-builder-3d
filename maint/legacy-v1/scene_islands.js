SCENE_TEMPLATES.town=SCENE_TEMPLATES.islands={name:'六角群島',build({THREE,scene,data,colorOf}){
 const V=(x,y,z)=>new THREE.Vector3(x,y,z);
 let seed=7;const rnd=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 const pick=a=>a[Math.floor(rnd()*a.length)],rr=(a,b)=>a+rnd()*(b-a);
 const M=(c,o={})=>new THREE.MeshLambertMaterial(Object.assign({color:c,flatShading:true},o));
 const add=(g,m,x,y,z,p)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);(p||scene).add(o);return o};
 const has2=v=>v!==undefined&&v!==null&&String(v).trim()!=='';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const MC=new Map(),mc=c=>{if(!MC.has(c))MC.set(c,M(c));return MC.get(c)};
 const GC=new Map(),G=(k,f)=>{if(!GC.has(k))GC.set(k,f());return GC.get(k)};
 const BX=(w,h,d)=>G('b'+w+','+h+','+d,()=>new THREE.BoxGeometry(w,h,d));
 const SP=(r,a=10,b=8)=>G('s'+r+','+a+','+b,()=>new THREE.SphereGeometry(r,a,b));
 const CY=(r1,r2,h,s=8)=>G('c'+r1+','+r2+','+h+','+s,()=>new THREE.CylinderGeometry(r1,r2,h,s));
 const cats=data.categories,n=Math.max(1,cats.length);
 const R=7.4,AP=R*Math.cos(Math.PI/6),GAP=3.4,DN=2*AP+GAP;
 scene.add(new THREE.HemisphereLight(0xffffff,0xcfd9c8,1.05));
 const sun=new THREE.DirectionalLight(0xfff3e0,1.1);sun.position.set(12,22,8);scene.add(sun);

 /* ---------- 材質（用程式畫的小圖樣，不需外部圖片） ---------- */
 const tex={},TILE={brick:1.2,wood:1.6,stone:1.5,dirt:4,grass:4};
 const draw={
  brick:g=>{g.fillStyle='#ead9c4';g.fillRect(0,0,128,128);for(let r=0;r<4;r++)for(let k=0;k<2;k++){const x=(k*64+(r%2?32:0))%128,y=r*32+2;g.fillStyle=pick(['#c4795f','#cc8268','#bd7058','#c97d63']);g.fillRect(x+2,y,60,28);if(x+62>128)g.fillRect(x-126,y,60,28)}},
  wood:g=>{for(let r=0;r<4;r++){g.fillStyle=['#c99b6b','#bf9060','#d0a574','#c3955f'][r];g.fillRect(0,r*32,128,32);g.fillStyle='#8f6a42';g.fillRect(0,r*32,128,2);g.fillRect((r*41+20)%128,r*32,2,32)}},
  stone:g=>{g.fillStyle='#bdb7aa';g.fillRect(0,0,128,128);for(let r=0;r<2;r++)for(let k=0;k<2;k++){const x=(k*64+(r?32:0))%128,y=r*64;g.fillStyle=pick(['#dcd7cb','#d3cec2','#e0dbcf']);g.fillRect(x+2,y+2,60,60);if(x+62>128)g.fillRect(x-126,y+2,60,60)}},
  dirt:g=>{g.fillStyle='#e6dcc3';g.fillRect(0,0,128,128);for(let i=0;i<50;i++){g.fillStyle=pick(['#d9ceb2','#efe6cf']);g.fillRect(rnd()*128,rnd()*128,4,3)}},
  grass:g=>{g.fillStyle='#b5d39a';g.fillRect(0,0,128,128);for(let i=0;i<60;i++){g.fillStyle=pick(['#a7c88b','#c3dfa8','#aed094']);g.fillRect(rnd()*128,rnd()*128,5,4)}}};
 const T=k=>tex[k]||(tex[k]=(()=>{const c=document.createElement('canvas');c.width=c.height=128;draw[k](c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t})());
 const TM={},tmat=k=>TM[k]||(TM[k]=new THREE.MeshLambertMaterial({map:T(k)}));
 const scaleUV=(g,sx,sy)=>{const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*sx,uv.getY(i)*sy);return g};
 const stripGeo=(w,l,tile)=>{const g=new THREE.PlaneGeometry(w,l);g.rotateX(-Math.PI/2);return scaleUV(g,w/tile,l/tile)};
 const discGeo=(r,tile)=>{const g=new THREE.CircleGeometry(r,28);g.rotateX(-Math.PI/2);return scaleUV(g,2*r/tile,2*r/tile)};
 const hexPlate=(r,tile)=>{const s=new THREE.Shape();for(let k=0;k<6;k++){const a=Math.PI/2+k*Math.PI/3,x=r*Math.cos(a),y=r*Math.sin(a);k?s.lineTo(x,y):s.moveTo(x,y)}s.closePath();const g=new THREE.ShapeGeometry(s);g.rotateX(-Math.PI/2);return scaleUV(g,1/tile,1/tile)};
 const inst=(geo,list)=>{if(!list.length)return;const m=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),list.length),o=new THREE.Object3D(),c=new THREE.Color();
  list.forEach((it,i)=>{o.position.set(it.x,it.y,it.z);o.rotation.set(0,it.ry||0,0);o.scale.set(it.sx,it.sy,it.sz);o.updateMatrix();m.setMatrixAt(i,o.matrix);m.setColorAt(i,c.set(it.c))});
  m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;scene.add(m);return m};

 /* ---------- 六角群島的排列：每個分類一座島，大小、間距都相同 ---------- */
 const b1=[DN*Math.sin(Math.PI/6),DN*Math.cos(Math.PI/6)],b2=[DN,0];
 const axPos=(q,r)=>[q*b1[0]+r*b2[0],q*b1[1]+r*b2[1]];
 const slots=[[0,0]];
 for(let k=1;slots.length<n&&k<8;k++){const ring=[];for(let q=-k;q<=k;q++)for(let r=-k;r<=k;r++)if(Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r))===k)ring.push([q,r]);
  ring.sort((a,b)=>{const p=axPos(...a),s=axPos(...b);return Math.atan2(p[0],p[1])-Math.atan2(s[0],s[1])});slots.push(...ring)}
 const pos0=slots.slice(0,n).map(s=>axPos(...s));
 const cen=pos0.reduce((a,p)=>[a[0]+p[0]/n,a[1]+p[1]/n],[0,0]);
 const isl=pos0.map((p,i)=>({i,c:V(p[0]-cen[0],0,p[1]-cen[1]),nb:[],doors:[],ents:[]}));
 const Rc=isl.reduce((m,s)=>Math.max(m,s.c.length()),0)+R;
 isl.forEach(a=>isl.forEach(b=>{if(a!==b&&Math.abs(a.c.distanceTo(b.c)-DN)<.05)a.nb.push(b.i)}));
 const dirTo=(a,b)=>{const d=isl[b].c.clone().sub(isl[a].c);return Math.atan2(d.x,d.z)};   /* 由 +z 轉向 +x 的角度 */

 /* ---------- 每座島的樣式（可由類別表的「地面」「邊界」指定；沒填就自動搭配） ---------- */
 const gOf=s=>{s=String(s||'');return /磚|brick/i.test(s)?'brick':/草|grass/i.test(s)?'grass':/木|地板|wood/i.test(s)?'wood':''};
 const eOf=s=>{s=String(s||'');return /籬|綠|hedge/i.test(s)?'hedge':/柵|木|fence/i.test(s)?'fence':/混|mix/i.test(s)?'mix':/原|無|plain|none/i.test(s)?'plain':''};
 const COMBO=[['brick','hedge'],['grass','fence'],['wood','plain'],['grass','mix'],['brick','fence'],['wood','hedge'],['grass','plain'],['brick','mix']];
 const PATHS=['stone','brick','dirt','wood'];
 isl.forEach((s,i)=>{const c=cats[i]||{},d=COMBO[i%COMBO.length];s.ground=gOf(c.ground)||d[0];s.edge=eOf(c.edge)||d[1];
  let p=PATHS[i%4];if(p===s.ground)p=PATHS[(i+1)%4];s.path=p;s.col=colorOf(c.id)});

 /* ---------- 水面與島嶼 ---------- */
 const water=add(new THREE.CircleGeometry(Rc+90,48),M(0x8fc6cc),0,-.7,0);water.rotation.x=-Math.PI/2;
 const hedges=[],posts=[],rails=[],curbs=[],trunks=[],crowns=[];
 const GREEN=[0x6c9e62,0x7fae6e,0x5f9159,0x88b575],TC=[0x7fae6e,0x6c9e62,0x94bd7f];
 isl.forEach(s=>{
  const {x:cx,z:cz}=s.c;
  add(new THREE.CylinderGeometry(R*1.12,R*1.16,.3,6),M(0xb7dcd6),cx,-.5,cz);
  add(new THREE.CylinderGeometry(R,R*.95,.9,6),M(0xd8c6a0),cx,-.45,cz);
  add(hexPlate(R,TILE[s.ground]),tmat(s.ground),cx,.01,cz);
  /* 邊界：每條邊依樣式放綠籬、木柵欄或矮石緣；有道路通過的那一段留出缺口 */
  const open=[0,1,2,3,4,5].map(k=>{const ph=Math.PI/6+k*Math.PI/3;return s.nb.some(j=>Math.abs(Math.atan2(Math.sin(dirTo(s.i,j)-ph),Math.cos(dirTo(s.i,j)-ph)))<.1)});
  for(let k=0;k<6;k++){
   const a1=k*Math.PI/3,a2=(k+1)*Math.PI/3,ins=.93,x1=cx+R*ins*Math.sin(a1),z1=cz+R*ins*Math.cos(a1),x2=cx+R*ins*Math.sin(a2),z2=cz+R*ins*Math.cos(a2);
   const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz),ry=Math.atan2(-dz,dx);
   const sty=s.edge==='mix'?((k+s.i)%2?'hedge':'fence'):s.edge,cnt=Math.round(len/(sty==='hedge'?.9:1.05));
   for(let m=0;m<=cnt;m++){const t=m/cnt;if(open[k]&&Math.abs(t-.5)<.17)continue;const px=x1+dx*t,pz=z1+dz*t;
    if(sty==='hedge'){const h=rr(.5,.8);hedges.push({x:px,y:h/2,z:pz,ry:ry+rr(-.2,.2),sx:1,sy:h,sz:rr(.6,.8),c:pick(GREEN)})}
    else if(sty==='fence'){posts.push({x:px,y:.36,z:pz,ry,sx:.12,sy:.72,sz:.12,c:0xb08a5a});
     if(m<cnt&&!(open[k]&&Math.abs((m+.5)/cnt-.5)<.17)){const mx=x1+dx*(m+.5)/cnt,mz=z1+dz*(m+.5)/cnt;[.26,.52].forEach(h=>rails.push({x:mx,y:h,z:mz,ry,sx:len/cnt,sy:.07,sz:.05,c:0xc9a374}))}}
    else if(m<cnt){const mx=x1+dx*(m+.5)/cnt,mz=z1+dz*(m+.5)/cnt;if(!(open[k]&&Math.abs((m+.5)/cnt-.5)<.17))curbs.push({x:mx,y:.09,z:mz,ry,sx:len/cnt,sy:.18,sz:.32,c:0xe8dfca})}}}
  /* 中央小廣場 */
  add(discGeo(1.55,TILE[s.path]),tmat(s.path),cx,.045,cz);
  s.P=V(cx,0,cz);
 });
 /* 島與島之間的道路：各半段用自己那座島的路面，在中點換樣式 */
 const roads=[];
 isl.forEach(s=>s.nb.forEach(j=>{const ang=dirTo(s.i,j),L=AP+GAP/2,dx=Math.sin(ang),dz=Math.cos(ang);
  const r=add(stripGeo(.95,L,TILE[s.path]),tmat(s.path),s.c.x+dx*L/2,.05,s.c.z+dz*L/2);r.rotation.y=ang;
  if(s.i<j){const bx=s.c.x+dx*(AP+GAP/2),bz=s.c.z+dz*(AP+GAP/2);const b=add(new THREE.BoxGeometry(1.35,.24,GAP+.5),M(0xcdb792),bx,-.1,bz);b.rotation.y=ang;roads.push([s.i,j])}}));

 /* ---------- 建築 ---------- */
 const shapeOf=c=>{const s=(c&&c.shape)||(c&&c.name)||'';
  if(/牆|盾|防|資安|安全/.test(s))return'wall';if(/塔|管線|網路|天線|燈|通訊/.test(s))return'tower';
  if(/圓|穹|球|雲|平台|資料|中心|園/.test(s))return'dome';if(/門|入口|窗口|橋|櫃台|服務台/.test(s))return'gate';return'house'};
 const WALL=0xf7f2e8,anchors={},pickables=[],nodes={},blds=[];
 const idx=id=>{const k=cats.findIndex(c=>c.id===id);return k<0?0:k};
 data.entities.forEach(e=>isl[idx(e.cat)].ents.push(e));
 isl.forEach(s=>{const m=s.ents.length;
  s.ents.forEach((e,q)=>{
   let th,rad;if(m<=6){th=Math.round(q*6/m)*Math.PI/3+(m===1?0:0);rad=m===1?.42*R:.6*R}else{const o=q<6;th=(o?q:q-6)*Math.PI/3+(o?0:Math.PI/6);rad=o?.66*R:.36*R}
   const lx=Math.sin(th)*rad,lz=Math.cos(th)*rad,x=s.c.x+lx,z=s.c.z+lz,a=Math.atan2(lz,lx);
   const col=colorOf(e.cat),g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=-a+Math.PI/2;scene.add(g);
   const roof=M(col,{emissive:0x000000}),wall=M(WALL),sc=(m>6?.8:.9)+rnd()*.2,sh=shapeOf(cats[s.i]);
   const mk=(geo,mm,px,py,pz)=>{const o=add(geo,mm,px,py,pz,g);o.userData.eid=e.id;pickables.push(o);return o};
   let top=2;
   if(sh==='house'){mk(new THREE.BoxGeometry(2.2,1.5,2.2),wall,0,.75,0);const rf=mk(new THREE.ConeGeometry(1.9,1.1,4),roof,0,2.05,0);rf.rotation.y=Math.PI/4;top=2.7}
   else if(sh==='tower'){mk(new THREE.BoxGeometry(1.5,3.4,1.5),wall,0,1.7,0);mk(new THREE.BoxGeometry(1.9,.4,1.9),roof,0,3.6,0);mk(new THREE.CylinderGeometry(.06,.06,1.3,6),roof,0,4.4,0);top=5}
   else if(sh==='wall'){mk(new THREE.BoxGeometry(3.4,1.4,1.1),wall,0,.7,0);mk(new THREE.BoxGeometry(3.6,.28,1.3),roof,0,1.54,0);for(let k=-1;k<=1;k++)mk(new THREE.BoxGeometry(.5,.5,.5),wall,k*1.2,1.95,0);top=2.4}
   else if(sh==='dome'){mk(new THREE.CylinderGeometry(1.5,1.6,1.3,20),wall,0,.65,0);mk(new THREE.SphereGeometry(1.5,16,8,0,Math.PI*2,0,Math.PI/2),roof,0,1.3,0);top=2.9}
   else{[-1.05,1.05].forEach(k=>mk(new THREE.BoxGeometry(.7,2.2,.9),wall,k,1.1,0));mk(new THREE.BoxGeometry(3.0,.55,1.1),roof,0,2.45,0);top=3.1}
   g.scale.setScalar(sc);top*=sc;
   const an=new THREE.Object3D();an.position.set(x,top+.2,z);scene.add(an);anchors[e.id]=an;
   const beam=add(new THREE.CylinderGeometry(.9,.9,12,20,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),x,6,z);
   const flag=new THREE.Group();flag.position.set(x+1.3*sc,0,z);flag.scale.y=.001;scene.add(flag);
   add(new THREE.CylinderGeometry(.04,.04,3.4,6),M(0x8a8f94),0,1.7,0,flag);add(new THREE.BoxGeometry(1.1,.6,.04),M(col),.55,3,0,flag);
   const dir=V(lx,0,lz).normalize();
   nodes[e.id]={g,beam,flag,roof,pos:V(x,0,z),dir,isl:s.i,on:false,k:0};
   const dl=Math.max(.6,rad-1.5);s.doors.push(V(s.c.x+Math.sin(th)*dl,0,s.c.z+Math.cos(th)*dl));
   blds.push({x,z,r:2.6});
   const pl=add(stripGeo(.85,dl,TILE[s.path]),tmat(s.path),s.c.x+Math.sin(th)*dl/2,.045,s.c.z+Math.cos(th)*dl/2);pl.rotation.y=th});
 });
 /* 樹：草地多一點，磚地與木地板少一點；避開建築與道路 */
 const lines=[];isl.forEach(s=>{s.nb.forEach(j=>lines.push([s.c,isl[j].c.clone().sub(s.c).normalize().multiplyScalar(AP)]));s.doors.forEach(d=>lines.push([s.c,d.clone().sub(s.c)]))});
 const dseg=(p,o,v)=>{const px=p.x-o.x,pz=p.z-o.z,l2=v.x*v.x+v.z*v.z||1,t=Math.max(0,Math.min(1,(px*v.x+pz*v.z)/l2));return Math.hypot(px-v.x*t,pz-v.z*t)};
 isl.forEach(s=>{const want=s.ground==='grass'?7:3;for(let k=0,c=0;k<200&&c<want;k++){
  const a=rnd()*Math.PI*2,r=rr(2.6,AP-1.5),p=V(s.c.x+Math.sin(a)*r,0,s.c.z+Math.cos(a)*r);
  if(blds.some(b=>Math.hypot(b.x-p.x,b.z-p.z)<b.r)||lines.some(l=>dseg(p,l[0],l[1])<1.2))continue;
  const sc=rr(.7,1.15);trunks.push({x:p.x,y:.3*sc,z:p.z,sx:sc,sy:sc,sz:sc,c:0x9c8566});crowns.push({x:p.x,y:1.3*sc,z:p.z,sx:sc,sy:sc,sz:sc,c:TC[c%3]});c++}});
 inst(BX(1,1,1),hedges);inst(BX(1,1,1),posts);inst(BX(1,1,1),rails);inst(BX(1,1,1),curbs);
 inst(new THREE.CylinderGeometry(.09,.12,.6,5),trunks);inst(new THREE.ConeGeometry(.65,1.5,6),crowns);

 /* ---------- 人：有頭、軀幹、手腳，會走、跑、騎腳踏車 ---------- */
 const SKIN=[0xf2d3b3,0xe3b894,0xc99066,0x946248],HAIR=[0x2b2420,0x4a3322,0x1d1d22,0x7a5230,0xb89462,0x8c8c92],
  TOP=[0x7b97a8,0xc08a76,0x8fae8a,0xb9a2c4,0xd1b86e,0x6f7f9a,0xd49a8c,0xe3dccb],BOT=[0x4f5d73,0x6a5f55,0x7d8a6f,0x3f4a57,0x8a7a64],BAG=[0xd96f4a,0x4d7fa8,0x5a9a73,0xe0b04c,0x7d6bb0];
 const HAIRSTYLE=['short','long','ponytail','bun','curly'];
 let pc=0;
 const person=(kind)=>{pc++;
  const sp={skin:pick(SKIN),hair:pick(HAIR),top:pick(TOP),bot:pick(BOT),bag:pick(BAG),style:HAIRSTYLE[(pc*2+(rnd()<.5?0:1))%5],sc:rr(.92,1.08)};
  const opts=kind==='run'?['none','backpack','none']:kind==='bike'?['backpack','side','none','backpack']:['backpack','side','book','coffee','backpack','none','book','coffee'];
  sp.item=opts[(pc*3+(rnd()<.5?0:1))%opts.length];
  const g=new THREE.Group(),body=new THREE.Group();g.add(body);
  const bx=(w,h,d,c,x,y,z,p)=>{const m=new THREE.Mesh(BX(w,h,d),mc(c));m.position.set(x,y,z);(p||body).add(m);return m};
  const ball=(r,c,x,y,z,p)=>{const m=new THREE.Mesh(SP(r),mc(c));m.position.set(x,y,z);(p||body).add(m);return m};
  const limb=(x,y)=>{const p=new THREE.Group();p.position.set(x,y,0);body.add(p);return p};
  const legs=[-1,1].map(s=>{const p=limb(s*.1,.5);bx(.14,.42,.14,sp.bot,0,-.21,0,p);bx(.15,.08,.23,0x4a4a52,0,-.46,.04,p);return p});
  const arms=[-1,1].map(s=>{const p=limb(s*.27,.98);bx(.11,.3,.11,sp.top,0,-.15,0,p);bx(.1,.2,.1,sp.skin,0,-.4,0,p);return p});
  bx(.4,.5,.24,sp.top,0,.75,0);
  ball(.18,sp.skin,0,1.2,0);bx(.04,.05,.02,0x2a2a30,-.065,1.2,.17);bx(.04,.05,.02,0x2a2a30,.065,1.2,.17);
  const cap=new THREE.Mesh(G('hc',()=>new THREE.SphereGeometry(.2,10,6,0,Math.PI*2,0,Math.PI*.42)),mc(sp.hair));cap.position.set(0,1.21,-.015);body.add(cap);
  if(sp.style==='long'){bx(.38,.5,.12,sp.hair,0,1.02,-.14);bx(.06,.3,.2,sp.hair,-.19,1.12,-.02);bx(.06,.3,.2,sp.hair,.19,1.12,-.02)}
  else if(sp.style==='ponytail'){ball(.08,sp.hair,0,1.22,-.22);const t=bx(.07,.28,.07,sp.hair,0,1.06,-.27);t.rotation.x=.25}
  else if(sp.style==='bun')ball(.1,sp.hair,0,1.42,-.05);
  else if(sp.style==='curly'){for(let k=0;k<7;k++){const a=k/7*Math.PI*2;ball(.07,sp.hair,Math.sin(a)*.19,1.3+.02*(k%2),Math.cos(a)*.17-.02)}}
  /* 隨身物 */
  if(sp.item==='backpack'){bx(.32,.4,.14,sp.bag,0,.78,-.19);bx(.06,.34,.02,sp.bag,-.13,.8,.125);bx(.06,.34,.02,sp.bag,.13,.8,.125)}
  else if(sp.item==='side'){bx(.22,.2,.09,sp.bag,-.27,.5,.04);const st=bx(.04,.7,.03,sp.bag,0,.76,.125);st.rotation.z=.62}
  else if(sp.item==='book'){const b=bx(.2,.03,.16,sp.bag,0,-.53,.07,arms[1]);b.rotation.x=.1}
  else if(sp.item==='coffee'){const c=new THREE.Mesh(CY(.05,.04,.13,8),mc(0xf4efe6));c.position.set(0,-.53,.05);arms[1].add(c);const l=new THREE.Mesh(CY(.055,.055,.025,8),mc(0x6b4a34));l.position.set(0,-.455,.05);arms[1].add(l)}
  g.scale.setScalar(sp.sc*.95);
  let bike=null;
  if(kind==='bike'){bike=new THREE.Group();g.add(bike);const col=pick(BAG);
   [-.5,.5].forEach(z=>{const w=new THREE.Mesh(G('wh',()=>{const t=new THREE.TorusGeometry(.32,.04,6,16);t.rotateY(Math.PI/2);return t}),mc(0x3d4148));w.position.set(0,.34,z);bike.add(w);bike['w'+(z>0?1:0)]=w});
   const fr=new THREE.Mesh(BX(.05,.05,1.0),mc(col));fr.position.set(0,.5,0);bike.add(fr);const sd=new THREE.Mesh(BX(.05,.32,.05),mc(col));sd.position.set(0,.62,-.2);bike.add(sd);
   const hb=new THREE.Mesh(BX(.5,.04,.04),mc(0x3d4148));hb.position.set(0,.88,.48);bike.add(hb);const fk=new THREE.Mesh(BX(.04,.5,.04),mc(col));fk.position.set(0,.62,.48);bike.add(fk);
   body.position.set(0,.24,-.12)}
  return {g,body,legs,arms,kind,sp,bike,ph:rnd()*6.28,am:0};
 };
 const animPerson=(p,dt,speed,moving)=>{
  const tgt=moving?1:0;p.am+=(tgt-p.am)*Math.min(1,dt*8);
  p.ph+=dt*(p.kind==='run'?speed*3.4:p.kind==='bike'?speed*2.4:speed*4.6)*(moving?1:0);
  const s=Math.sin(p.ph),am=p.am,holdBook=p.sp.item==='book'||p.sp.item==='coffee';
  if(p.kind==='bike'){p.legs[0].rotation.x=-.85+s*.5*am;p.legs[1].rotation.x=-.85-s*.5*am;p.arms[0].rotation.x=-1.05;p.arms[1].rotation.x=-1.05;p.body.rotation.x=.12;
   if(p.bike&&moving){p.bike.w0.rotation.x+=dt*speed*3;p.bike.w1.rotation.x=p.bike.w0.rotation.x}return}
  const A=p.kind==='run'?1.0:.58;
  p.legs[0].rotation.x=s*A*am;p.legs[1].rotation.x=-s*A*am;
  p.arms[0].rotation.x=-s*A*.9*am-(p.kind==='run'?.5*am:0);
  p.arms[1].rotation.x=holdBook?-.95+s*.05*am:s*A*.9*am-(p.kind==='run'?.5*am:0);
  p.body.rotation.x=p.kind==='run'?.2*am:0;p.body.position.y=Math.abs(s)*(p.kind==='run'?.07:.035)*am};

 /* ---------- 貓與鴿子 ---------- */
 const cat=()=>{const c=pick([0xd9a066,0x9aa3ab,0x3a3a40,0xe8e2d6,0xb98550]),g=new THREE.Group(),body=new THREE.Group();g.add(body);
  const bx=(w,h,d,x,y,z,col,p)=>{const m=new THREE.Mesh(BX(w,h,d),mc(col||c));m.position.set(x,y,z);(p||body).add(m);return m};
  bx(.22,.22,.5,0,.3,0);bx(.2,.18,.18,0,.4,.32);bx(.05,.07,.04,-.07,.52,.32);bx(.05,.07,.04,.07,.52,.32);
  const tail=new THREE.Group();tail.position.set(0,.36,-.26);body.add(tail);const tb=bx(.06,.06,.34,0,.06,-.15,null,tail);tb.rotation.x=-.5;
  const legs=[[-.07,.2],[.07,.2],[-.07,-.2],[.07,-.2]].map(([x,z])=>{const p=new THREE.Group();p.position.set(x,.2,z);body.add(p);bx(.06,.2,.06,0,-.1,0,null,p);return p});
  return {g,body,legs,tail,ph:rnd()*6.28,am:0,kind:'cat'}};
 const pigeon=()=>{const g=new THREE.Group(),body=new THREE.Group();g.add(body);
  const bl=(r,c,x,y,z,sx,sy,sz)=>{const m=new THREE.Mesh(SP(r),mc(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);body.add(m);return m};
  bl(.16,0x9aa2ab,0,.22,0,.9,.8,1.3);const head=new THREE.Group();head.position.set(0,.34,.2);body.add(head);
  const hm=new THREE.Mesh(SP(.07),mc(0x8a929b));head.add(hm);const bk=new THREE.Mesh(BX(.025,.025,.06),mc(0xe0a050));bk.position.set(0,-.005,.08);head.add(bk);
  bl(.06,0x6f9a8c,0,.31,.13,1,.8,1);const tl=new THREE.Mesh(BX(.1,.03,.16),mc(0x7d858e));tl.position.set(0,.22,-.24);body.add(tl);
  const wings=[-1,1].map(s=>{const w=new THREE.Group();w.position.set(s*.12,.26,0);body.add(w);const wm=new THREE.Mesh(BX(.2,.02,.2),mc(0x858d96));wm.position.set(s*.1,0,-.02);w.add(wm);return w});
  [-.04,.04].forEach(x=>{const l=new THREE.Mesh(BX(.015,.1,.015),mc(0xd98a8a));l.position.set(x,.06,0);g.add(l)});
  return {g,body,head,wings,ph:rnd()*6.28,state:'peck',timer:rr(2,6),t:0,fly:null}};

 /* ---------- 在道路上移動：廣場 ⇄ 建築門口，或走到隔壁島 ---------- */
 const agents=[],pigeons=[];
 const mkLeg=(a,b,end,to)=>({a:a.clone(),b:b.clone(),len:Math.max(.01,a.distanceTo(b)),end,to});
 const choose=ag=>{const s=isl[ag.i],fav=ag.kind==='walk'?.5:.8;
  const opts=s.nb.filter(j=>j!==ag.last||s.nb.length===1);
  if(opts.length&&(rnd()<fav||!s.doors.length)){const j=pick(opts);ag.leg=mkLeg(s.P,isl[j].P,'cross',j)}
  else if(s.doors.length){ag.leg=mkLeg(s.P,pick(s.doors),'door')}
  else ag.leg=mkLeg(s.P,s.P.clone().add(V(1,0,0)),'door');
  ag.d=0};
 const spawn=(obj,kind,speed,i,extra)=>{const ag=Object.assign({obj,kind,speed,i,last:-1,lane:(rnd()<.5?-1:1)*(kind==='bike'?.38:.3),wait:0,yaw:0,state:'move'},extra||{});
  choose(ag);ag.d=rnd()*ag.leg.len;scene.add(obj.g);const L=ag.leg,d=L.b.clone().sub(L.a).normalize(),p=L.a.clone().add(d.clone().multiplyScalar(ag.d));
  obj.g.position.set(p.x+d.z*ag.lane,.05,p.z-d.x*ag.lane);ag.yaw=Math.atan2(d.x,d.z);obj.g.rotation.y=ag.yaw;agents.push(ag);return ag};
 const nPeople=Math.min(24,n*3);
 const KINDS=['walk','walk','run','bike','walk','bike'];
 for(let k=0;k<nPeople;k++){const kind=KINDS[k%KINDS.length],sp=kind==='run'?3.3:kind==='bike'?4:1.5;spawn(person(kind),kind,sp*rr(.9,1.1),k%n)}
 for(let k=0;k<Math.min(3,Math.max(1,Math.round(n/3)));k++)spawn(cat(),'cat',.9,(k*2+1)%n);
 for(let k=0;k<Math.min(6,n+1);k++){const pg=pigeon(),s=isl[k%n];pg.isl=s.i;const a=rnd()*6.28,r=rr(.4,2);pg.g.position.set(s.P.x+Math.sin(a)*r,.05,s.P.z+Math.cos(a)*r);pg.g.rotation.y=rnd()*6.28;scene.add(pg.g);pigeons.push(pg)}
 const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
 const updAgent=(ag,dt)=>{const o=ag.obj;
  if(ag.state==='wait'){ag.wait-=dt;if(o.kind==='cat'){o.tail.rotation.y=Math.sin(performance.now()*.003+o.ph)*.5;o.am+=(0-o.am)*Math.min(1,dt*8)}else animPerson(o,dt,ag.speed,false);
   if(ag.wait<=0){ag.state='move';if(ag.after==='back'){const s=isl[ag.i];ag.leg=mkLeg(ag.leg.b,s.P,'plaza');ag.d=0}else choose(ag)}return}
  const L=ag.leg;ag.d+=ag.speed*dt;
  if(ag.d>=L.len){ag.d=L.len;
   if(L.end==='door'){ag.state='wait';ag.wait=rr(1.2,3.2);ag.after='back'}
   else if(L.end==='cross'){ag.last=ag.i;ag.i=L.to;if(o.kind==='cat'&&rnd()<.5){ag.state='wait';ag.wait=rr(3,7);ag.after='choose'}else choose(ag)}
   else{if(o.kind==='cat'&&rnd()<.5){ag.state='wait';ag.wait=rr(3,7);ag.after='choose'}else choose(ag)}}
  const L2=ag.leg,d=L2.b.clone().sub(L2.a).normalize(),p=L2.a.clone().add(d.clone().multiplyScalar(ag.d)),tx=p.x+d.z*ag.lane,tz=p.z-d.x*ag.lane,k=Math.min(1,dt*9);
  o.g.position.x+=(tx-o.g.position.x)*k;o.g.position.z+=(tz-o.g.position.z)*k;
  ag.yaw+=wrap(Math.atan2(d.x,d.z)-ag.yaw)*Math.min(1,dt*8);o.g.rotation.y=ag.yaw;
  if(o.kind==='cat'){o.ph+=dt*ag.speed*7;o.am+=(1-o.am)*Math.min(1,dt*8);const s=Math.sin(o.ph)*.7*o.am;o.legs[0].rotation.x=s;o.legs[3].rotation.x=s;o.legs[1].rotation.x=-s;o.legs[2].rotation.x=-s;o.tail.rotation.y=Math.sin(o.ph*.5)*.3}
  else animPerson(o,dt,ag.speed,true)};
 const updPigeon=(pg,dt,t)=>{const s=isl[pg.isl];pg.timer-=dt;
  if(pg.state==='peck'){pg.ph+=dt*6;pg.head.rotation.x=Math.max(0,Math.sin(pg.ph))*.9;pg.wings.forEach((w,k)=>w.rotation.z=(k?-1:1)*.1);
   if(pg.tg){const dx=pg.tg.x-pg.g.position.x,dz=pg.tg.z-pg.g.position.z,dd=Math.hypot(dx,dz);if(dd<.08)pg.tg=null;else{const sp=.45*dt;pg.g.position.x+=dx/dd*sp;pg.g.position.z+=dz/dd*sp;pg.g.rotation.y+=wrap(Math.atan2(dx,dz)-pg.g.rotation.y)*Math.min(1,dt*6);pg.body.position.y=Math.abs(Math.sin(pg.ph))*.015}}
   if(pg.timer<=0){if(rnd()<.35){const a=rnd()*6.28,r=rr(.8,2.6);pg.fly={x0:pg.g.position.x,z0:pg.g.position.z,x1:s.P.x+Math.sin(a)*r,z1:s.P.z+Math.cos(a)*r,t:0};pg.state='fly';pg.tg=null}else{const a=rnd()*6.28,r=rr(.4,2.4);pg.tg={x:s.P.x+Math.sin(a)*r,z:s.P.z+Math.cos(a)*r};pg.timer=rr(2,5)}}}
  else{const f=pg.fly;f.t+=dt/.9;const u=Math.min(1,f.t);pg.g.position.x=f.x0+(f.x1-f.x0)*u;pg.g.position.z=f.z0+(f.z1-f.z0)*u;pg.g.position.y=.05+Math.sin(u*Math.PI)*.8;
   pg.g.rotation.y+=wrap(Math.atan2(f.x1-f.x0,f.z1-f.z0)-pg.g.rotation.y)*Math.min(1,dt*10);pg.wings.forEach((w,k)=>w.rotation.z=(k?-1:1)*Math.sin(t*40)*.9);pg.head.rotation.x=0;
   if(u>=1){pg.state='peck';pg.g.position.y=.05;pg.timer=rr(3,8);pg.body.position.y=0}}};

 /* ---------- 動態元素表（和內容有關的象徵動態） ---------- */
 const dyns=[],dynLabels=[],ids=Object.keys(nodes);
 const place=q0=>{const q=String(q0||'');let id=ids.find(i=>i===q||data.entities.find(e=>e.id===i).name===q);
  if(!id){const c=cats.find(c=>c.id===q||c.name===q);if(c){id=ids.find(i=>data.entities.find(e=>e.id===i).cat===c.id)}}
  return id||ids[Math.floor(rnd()*ids.length)]};
 (data.dynamics||[]).slice(0,12).forEach((d,i)=>{
  const id=place(d.near);if(!id)return;const nd=nodes[id],txt=(d.name||'')+(d.meaning||''),grp=new THREE.Group();scene.add(grp);
  const mats=[],tm=(c,o)=>{const m=new THREE.MeshLambertMaterial(Object.assign({color:c,transparent:true,flatShading:true},o||{}));mats.push(m);return m};
  let kind='float';
  if(/封包|流|資料|水|列車|車流|訊號/.test(txt))kind='flow';else if(/燈|閃|亮|指示/.test(txt))kind='blink';
  else if(/人|走|師生|學生|遊客|行人/.test(txt))kind='walk';else if(/樹|搖|風|旗|雲/.test(txt))kind='sway';else if(/吊車|轉|齒輪|風車|雷達/.test(txt))kind='spin';
  const tan=V(-nd.dir.z,0,nd.dir.x),base=nd.pos.clone().add(tan.clone().multiplyScalar(i%2?2.4:-2.4));
  const s=isl[nd.isl];let upd=()=>{};
  if(kind==='flow'){const to=s.nb.length?isl[s.nb[0]].P:(s.doors[0]||s.P.clone().add(V(2,0,0)));const ps=[0,1,2].map(k=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.15,8,6),tm(0xfff6d8,{emissive:0xffe9a8,emissiveIntensity:.8}));grp.add(m);return{m,o:k/3}});
   upd=t=>ps.forEach(p=>{const u=(t*.12+p.o)%1;p.m.position.set(s.P.x+(to.x-s.P.x)*u,.3,s.P.z+(to.z-s.P.z)*u)})}
  else if(kind==='blink'){const m=new THREE.Mesh(new THREE.BoxGeometry(.28,.28,.28),tm(0xfff0c0,{emissive:0xffd27a}));m.position.copy(anchors[id].position).add(V(.9,-.3,.5));grp.add(m);
   upd=t=>{m.material.emissiveIntensity=.3+.7*(Math.sin(t*2.1+i)>.2?1:0)}}
  else if(kind==='walk'){const kd=['walk','run','bike'][i%3];spawn(person(kd),kd,kd==='run'?3.3:kd==='bike'?4:1.5,nd.isl)}
  else if(kind==='sway'){const tr=new THREE.Group();const c=new THREE.Mesh(new THREE.ConeGeometry(.5,1.3,6),tm(0x7fae6e));c.position.y=1.1;const st=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.5,5),tm(0x9c8566));st.position.y=.25;tr.add(c,st);tr.position.copy(base);grp.add(tr);upd=t=>{tr.rotation.z=Math.sin(t*.9+i)*.06}}
  else if(kind==='spin'){const ar=new THREE.Group();const p=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,1.6,6),tm(0x8a8f94));p.position.y=.8;const b=new THREE.Mesh(new THREE.BoxGeometry(1.6,.07,.12),tm(0xf7f2e8));b.position.y=1.6;ar.add(p,b);ar.position.copy(base);grp.add(ar);upd=t=>{b.rotation.y=t*.35}}
  else{const m=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),tm(0xfff6d8,{emissive:0xffe9a8,emissiveIntensity:.5}));grp.add(m);upd=t=>m.position.set(base.x,2+Math.sin(t*.8+i)*.25,base.z)}
  if(has2(d.label)){const lo=new THREE.Object3D();lo.position.copy(base).setY(1.8);scene.add(lo);dynLabels.push({text:d.label,object:lo})}
  dyns.push({grp,mats,upd,center:base});
 });
 /* 全景鏡位：直向的手機畫面比較窄，要退得比較遠才看得到整群島 */
 const overview=()=>{const asp=innerWidth/Math.max(1,innerHeight),f=Math.max(1,Math.min(2.6,Math.pow(1.6/asp,.8)));return{pos:V(0,(Rc*1.3+9)*f,(Rc*1.5+10)*f),target:V(0,-1,0)}};
 const focusPose=id=>{const nd=nodes[id],a=anchors[id].position;return{pos:a.clone().add(nd.dir.clone().multiplyScalar(13.5)).setY(a.y+5.6),target:V(a.x,a.y-1.5,a.z)}};
 return{anchors,pickables,get overviewPose(){return overview()},focusPose,R:Rc,agents,pigeons,isl,
  setFocus(id){Object.keys(nodes).forEach(k=>{nodes[k].on=k===id})},
  update(t,dt,cam){
   Object.values(nodes).forEach(nd=>{nd.k+=((nd.on?1:0)-nd.k)*Math.min(1,dt*4);nd.beam.material.opacity=nd.k*(.09+.03*Math.sin(t*2));nd.flag.scale.y=Math.max(.001,nd.k);
    const e=nd.k*.38;nd.roof.emissive.setRGB(e*.6,e*.6,e*.6)});
   if(!reduce){agents.forEach(a=>updAgent(a,dt));pigeons.forEach(p=>updPigeon(p,dt,t))}
   dyns.forEach(d=>{d.upd(t);const near=cam.position.distanceTo(d.center)<6.5;d.mats.forEach(m=>{m.opacity+=((near?.12:1)-m.opacity)*Math.min(1,dt*3)})});
  },dynLabels};
}};
