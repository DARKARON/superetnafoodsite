/* Albero 3D "Limone 3D" (modello 001) — estratto da mappa-3d.html del gestionale superetnafood */
(function(){
  var URL3='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', attesa=null;
  function carica(){ if(window.THREE) return Promise.resolve(); if(attesa) return attesa;
    attesa=new Promise(function(ok,ko){ var s=document.createElement('script'); s.src=URL3; s.onload=ok; s.onerror=ko; document.head.appendChild(s); }); return attesa; }
  var GEO=null;
  function costruisci(){
const MODELLO_001 = (()=>{ const V=(a,b,c)=>new THREE.Vector3(a,b,c);
  return { h:2.45, root:0.058*1.35,
    catene:[
      {tipo:1, pts:[V(0,0,0),V(0.05,0.25,0.01),V(0.11,0.5,0.02),V(0.16,0.72,0.02),V(0.24,0.88,0.03),V(0.36,0.97,0.03),V(0.42,1.0,0.02)]},
      {tipo:0, pts:[V(0.42,1.0,0.02),V(0.55,1.2,0.06),V(0.68,1.45,0.08)]},
      {tipo:0, pts:[V(0.42,1.0,0.02),V(0.6,1.08,-0.12),V(0.95,1.14,-0.25)]},
      {tipo:0, pts:[V(0.42,1.0,0.02),V(0.36,1.18,0.2),V(0.22,1.36,0.32)]},
      {tipo:0, pts:[V(0.24,0.88,0.03),V(0.12,1.05,-0.05),V(-0.15,1.3,0.05)]},
      {tipo:0, pts:[V(0.42,1.0,0.02),V(0.5,1.25,-0.2),V(0.42,1.5,-0.3)]}],
    blobs:[{c:V(0.45,1.80,0.05),r:V(1.15,0.55,0.85)},{c:V(1.35,1.45,0.10),r:V(0.65,0.55,0.75)},{c:V(-0.35,1.48,0.15),r:V(0.50,0.38,0.60)},{c:V(0.75,2.05,0.0),r:V(0.55,0.35,0.55)}],
    box:[-0.9,2.05,0.95,2.45,-0.6,1.0], nA:1300, yB:0.95, xL:-0.9, xR:2.05, centro:V(0.5,1.6,0.05), frutti:30, ox:-0.55 };
})();
function specDaFoto(s,T,H,lid,R){
  const V=(a,b,c)=>new THREE.Vector3(a,b,c);
  const bu=T.b[0], bv=T.b[1], S=H/(bv-T.top), rl=lid&&lid[3]?lid[3]:1.9;
  let xL=(T.cr[0]-bu)*S, xR=(T.cr[1]-bu)*S;
  if(T.cr[0]<=40) xL=Math.min(xL,-rl*0.9); if(T.cr[1]>=1120) xR=Math.max(xR,rl*0.9);
  const yB=(bv-T.cr[2])*S, zR=Math.max(0.6,(xR-xL)*0.42);
  const catene=[], fissi=[], blobs=[]; let tr=0, hb=99, rootR=0;
  T.L.forEach(l=>{
    const tipo=l[1], P=[];
    for(let i=2;i<l.length;i+=2) P.push([(l[i]-bu)*S,(bv-l[i+1])*S]);
    const lu=l[l.length-2];
    if(tipo===0&&P.length>1&&(lu<=40||lu>=1120)){
      const a=P[P.length-2], b=P[P.length-1], dx=b[0]-a[0], dy=b[1]-a[1], L=Math.hypot(dx,dy)||1, tgt=(lu<=40?xL:xR)*0.9;
      const k=Math.min(1.6,(tgt-b[0])/(dx/L||1e-3)); if(k>0.05) P.push([b[0]+dx/L*k, b[1]+dy/L*k*0.5]);
    }
    let z0=0, kz, kd;
    if(tipo===0){
      let best=null, bd=1e9; fissi.forEach(n=>{ const d=Math.hypot(n.x-P[0][0],n.y-P[0][1]); if(d<bd){bd=d;best=n;} });
      if(best){ z0=best.z; P[0]=[best.x,best.y]; }
      kz=(R()*2-1)*0.9; kd=(R()*2-1)*0.3; hb=Math.min(hb,P[0][1]);
    } else { z0=(R()-.5)*0.1; kz=(R()-.5)*0.4; kd=(R()-.5)*0.15; P[0][1]=0; tr++; rootR=Math.max(rootR,l[0]/100); }
    const pts=P.map(([px,py])=>V(px, py, z0+(px-P[0][0])*kz+(py-P[0][1])*kd));
    if(tipo!==0) pts.unshift(V(pts[0].x,-0.12,pts[0].z));
    pts.forEach(p=>fissi.push(p));
    catene.push({tipo, pts, r:l[0]/100});
    if(tipo===0){ const e=pts[pts.length-1].clone(); e.y=Math.max(e.y,yB+0.25); blobs.push({c:e,r:V(0.5,0.38,0.5)}); }
  });
  blobs.push({c:V((xL+xR)/2,(yB+H)/2,0), r:V((xR-xL)/2*0.82,(H-yB)/2*0.88,zR*0.82)});
  const nsu=Math.round((s.succ||0)*4);
  for(let i=0;i<nsu;i++) blobs.push({c:V(xL*0.5+(xR-xL)*0.5*R(), H-0.2, (R()-.5)*zR*0.6), r:V(0.14,0.4,0.14)});
  const vol=(xR-xL+0.6)*(H-yB+0.5)*(2*zR+0.6);
  return { h:H, catene, blobs, box:[xL-0.3,xR+0.3,yB-0.15,H+0.3,-zR-0.3,zR+0.3], nA:Math.round(Math.min(1100,Math.max(500,vol*85*(0.6+0.6*(s.dens||0.7))))),
    yB, xL, xR, centro:V((xL+xR)/2,(yB+H)/2+0.1,0), frutti:Math.round((s.frutti||0)*80), ox:0, hb, tr };
}
const CRESCITA = new Map();
function cresci(sp, R){
  const V=THREE.Vector3, rr=(a,b)=>a+(b-a)*R();
  const envF=p=>{ let m=9; for(const b of sp.blobs){ const d=Math.hypot((p.x-b.c.x)/b.r.x,(p.y-b.c.y)/b.r.y,(p.z-b.c.z)/b.r.z); if(d<m) m=d; } return m; };
  const [x0,x1,y0,y1,z0,z1]=sp.box, att=[];
  for(let tries=0; att.length<sp.nA && tries<sp.nA*40; tries++){
    const p=new V(rr(x0,x1),rr(y0,y1),rr(z0,z1)), f=envF(p);
    if(f<1 && R()<0.25+0.75*f) att.push({p,alive:true});
  }
  const nodes=[], cell=0.45, grid=new Map(), key=(a,b,c)=>a+','+b+','+c;
  const addNode=(p,parent,fixed)=>{ const i=nodes.length; nodes.push({p:p.clone(),parent,children:[],fixed:!!fixed,r:0,root:parent>=0?nodes[parent].root:i,rT:0});
    if(parent>=0) nodes[parent].children.push(i);
    const k=key(Math.floor(p.x/cell),Math.floor(p.y/cell),Math.floor(p.z/cell)); (grid.get(k)||grid.set(k,[]).get(k)).push(i); return i; };
  const chainTo=(from,pts,rMin)=>{ let prev=from; const tot=pts.length-1; for(let s=0;s<tot;s++){ const a=pts[s], b=pts[s+1], n=Math.max(1,Math.round(a.distanceTo(b)/0.08)); for(let k=1;k<=n;k++){ prev=addNode(a.clone().lerp(b,k/n),prev,true); if(rMin) nodes[prev].rMin=rMin*(1-0.25*(s+k/n)/tot); } } return prev; };
  sp.catene.forEach(c=>{
    if(c.tipo!==0){ const r0=addNode(c.pts[0],-1,true); nodes[r0].rT=(sp.root|| Math.min(0.065,c.r*1.2)); nodes[r0].rMin=sp.root?0:c.r*1.15; chainTo(r0,c.pts,sp.root?0:c.r); return; }
    let best=-1, bd=1e9; nodes.forEach((n,i)=>{ const d=n.p.distanceTo(c.pts[0]); if(d<bd){bd=d;best=i;} });
    if(best<0) return; const pts=c.pts.slice(); pts[0]=nodes[best].p.clone(); chainTo(best,pts);
  });
  if(!nodes.length) return null;
  const DI=0.5, DK=0.1, STEP=0.075, DI2=DI*DI, DK2=DK*DK;
  for(let it=0; it<130; it++){
    const acc=new Map();
    for(const a of att){ if(!a.alive) continue;
      const cx=Math.floor(a.p.x/cell), cy=Math.floor(a.p.y/cell), cz=Math.floor(a.p.z/cell); let best=-1, bd=DI2;
      for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++) for(let dz=-1;dz<=1;dz++){ const g=grid.get(key(cx+dx,cy+dy,cz+dz)); if(!g) continue;
        for(const i of g){ const d=nodes[i].p.distanceToSquared(a.p); if(d<bd){bd=d;best=i;} } }
      if(best<0) continue; if(bd<DK2){ a.alive=false; continue; }
      const d=a.p.clone().sub(nodes[best].p).normalize(); (acc.get(best)||acc.set(best,new V()).get(best)).add(d);
    }
    if(!acc.size) break;
    for(const [i,d] of acc){ d.normalize().add(new V(rr(-.15,.15),rr(-.05,.2),rr(-.15,.15))).normalize(); addNode(nodes[i].p.clone().addScaledVector(d,STEP),i,false); }
  }
  for(let pass=0;pass<2;pass++) for(const n of nodes){ if(n.fixed||n.parent<0||n.children.length!==1) continue;
    n.p.lerp(nodes[n.parent].p.clone().add(nodes[n.children[0]].p).multiplyScalar(0.5),0.5); }
  for(let i=nodes.length-1;i>=0;i--){ const n=nodes[i]; n.r=n.children.length?Math.pow(n.children.reduce((s,c)=>s+Math.pow(nodes[c].r,2.4),0),1/2.4):0.004; }
  nodes.forEach((n,i)=>{ if(n.parent<0) n.k=(n.rT||0.06)/n.r; });
  for(const n of nodes){ n.tw=n.r*nodes[n.root].k; n.r=Math.max(0.0035, n.tw, n.rMin||0); }
  // catene di legno
  const catene=[], stack=nodes.map((n,i)=>n.parent<0?[i,null]:null).filter(Boolean);
  while(stack.length){ const [start,from]=stack.pop(); const ids=from===null?[start]:[from,start]; let cur=start;
    while(nodes[cur].children.length){ const ch=[...nodes[cur].children].sort((a,b)=>nodes[b].r-nodes[a].r); for(let k=1;k<ch.length;k++) stack.push([ch[k],cur]); cur=ch[0]; ids.push(cur); }
    if(ids.length<2) continue; const rads=ids.map(i=>nodes[i].r);
    if(from!==null) rads[0]=Math.min(rads[0],rads[1]*1.15); else { rads[0]*=1.25; if(rads[1]) rads[1]*=1.08; }
    catene.push({pts:ids.map(i=>nodes[i].p), rads}); }
  // foglie
  const up=new V(0,1,0), foglie=[];
  const xL=sp.xL, xR=sp.xR, secP=x=>{ if(!sp.secco) return 0; const f=(x-xL)/((xR-xL)||1); return sp.secco*(sp.sl===-1?2*(1-f):sp.sl===1?2*f:1); };
  for(const n of nodes){ if(n.tw>=0.011||n.p.y<=sp.yB) continue; if(sp.nb&&n.p.y<sp.yB+sp.nb) continue;
    const out=n.p.clone().sub(sp.centro).normalize(), tip=!n.children.length, cnt=tip?2:1;
    for(let k=0;k<cnt;k++){
      const dir=new V(rr(-1,1),rr(-0.3,1),rr(-1,1)).normalize().addScaledVector(out,0.9).normalize();
      const nrm=up.clone().addScaledVector(dir,-dir.dot(up)).add(new V(rr(-.5,.5),0,rr(-.5,.5))); nrm.addScaledVector(dir,-nrm.dot(dir)).normalize();
      const side=new V().crossVectors(nrm,dir), sc=rr(0.1,0.14);
      const m=new THREE.Matrix4().makeBasis(dir.clone().multiplyScalar(sc),side.multiplyScalar(sc),nrm.multiplyScalar(sc)).setPosition(n.p.clone().addScaledVector(dir,0.012));
      const t=R()<secP(n.p.x)?2:(R()<(tip&&n.p.y>sp.yB+(sp.h-sp.yB)*0.6?0.45:0.18)?1:0);
      foglie.push([m,t]); } }
  // limoni
  const limoni=[], cand=nodes.filter(n=>!n.children.length&&n.p.y>sp.yB+0.05&&envF(n.p)>0.7&&!(sp.nb&&n.p.y<sp.yB+sp.nb+0.15)).sort(()=>R()-0.5), used=[];
  for(let k=0;k<cand.length&&used.length<sp.frutti;k++){ const p=cand[k].p.clone().add(new V(0,-0.055,0)); if(used.some(q=>q.distanceTo(p)<0.25)) continue; used.push(p);
    const s=rr(0.03,0.038), q=new THREE.Quaternion().setFromEuler(new THREE.Euler(rr(-0.5,0.5)+Math.PI,R()*6.28,rr(-0.5,0.5)));
    limoni.push([new THREE.Matrix4().compose(p,q,new V(s,s,s)), R()<0.25?1:0]); }
  return {catene, foglie, limoni};
}
class Costr { constructor(){ this.pos=[]; this.idx=[]; }
  geo(){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(this.pos,3)); g.setIndex(this.idx); g.computeVertexNormals(); return g; }
  add(geo,m){ const base=this.pos.length/3, p=geo.attributes.position, v=new THREE.Vector3(); for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i).applyMatrix4(m); this.pos.push(v.x,v.y,v.z); }
    const ix=geo.index.array; for(let i=0;i<ix.length;i++) this.idx.push(ix[i]+base); } }
const FOGLIA = (()=>{ const pos=[0,0,0], idx=[], ts=[0.15,0.4,0.65,0.88];
  for(const t of ts){ const w=0.24*Math.pow(Math.sin(Math.PI*Math.pow(t,0.85)),0.9), dz=-0.12*t*t; pos.push(t,-w,dz+0.35*w, t,0,dz, t,w,dz+0.35*w); }
  pos.push(1,0,-0.12); const tip=ts.length*3+1; idx.push(0,1,2,0,2,3);
  for(let i=0;i<ts.length-1;i++){ const a=1+i*3, b=a+3; idx.push(a,b,a+1, a+1,b,b+1, a+1,b+1,a+2, a+2,b+1,b+2); }
  const l=1+(ts.length-1)*3; idx.push(l,tip,l+1, l+1,tip,l+2);
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); return g; })();
const LIMONE = (()=>{ const g=new THREE.SphereGeometry(1,12,8), p=g.attributes.position, v=new THREE.Vector3();
  for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); const e=v.y>0?1+0.35*Math.pow(Math.max(0,v.y),6):1+0.12*Math.pow(-v.y,6); p.setXYZ(i,v.x,v.y*1.18*e,v.z); } return g; })();
function tuboSC(pts, rads, w){
  const curve=new THREE.CatmullRomCurve3(pts,false,'centripetal'), n=Math.max(2,pts.length-1), rM=rads[0];
  const seg=rM>0.03?8:rM>0.012?5:3, fr=curve.computeFrenetFrames(n,false), base=w.pos.length/3;
  for(let i=0;i<=n;i++){ const t=i/n, P=curve.getPointAt(t), f=t*(rads.length-1), k=Math.min(rads.length-2,Math.floor(f)), r=rads[k]+(rads[k+1]-rads[k])*(f-k);
    for(let j=0;j<seg;j++){ const a=j/seg*Math.PI*2, bump=r>0.02?1+0.07*Math.sin(3*a+i*0.9)+0.04*Math.sin(7*a-i):1;
      const v=P.clone().addScaledVector(fr.normals[i],Math.cos(a)*r*bump).addScaledVector(fr.binormals[i],Math.sin(a)*r*bump); w.pos.push(v.x,v.y,v.z); } }
  for(let i=0;i<n;i++) for(let j=0;j<seg;j++){ const a=base+i*seg+j, b=base+i*seg+(j+1)%seg; w.idx.push(a,a+seg,b, b,a+seg,b+seg); }
}
const MAT_SC = {
  rami: new THREE.MeshLambertMaterial({color:0x7a6c5a}),
  foglie: [new THREE.MeshLambertMaterial({color:0x2f6b1e, side:THREE.DoubleSide}), new THREE.MeshLambertMaterial({color:0x6faa28, side:THREE.DoubleSide}), new THREE.MeshLambertMaterial({color:0x94803f, side:THREE.DoubleSide})],
  limoni: [new THREE.MeshLambertMaterial({color:0xa8c53c}), new THREE.MeshLambertMaterial({color:0xdfd64a})] };
function geometrieAlbero(out, ox){
  const O=new THREE.Matrix4().makeTranslation(ox||0,0,0), legno=new Costr(), fo=[new Costr(),new Costr(),new Costr()], li=[new Costr(),new Costr()], m=new THREE.Matrix4();
  out.catene.forEach(c=>tuboSC(c.pts.map(p=>p.clone().applyMatrix4(O)), c.rads, legno));
  out.foglie.forEach(([mm,k])=>fo[k].add(FOGLIA, m.multiplyMatrices(O,mm)));
  out.limoni.forEach(([mm,k])=>li[k].add(LIMONE, m.multiplyMatrices(O,mm)));
  const g=b=>b.pos.length?b.geo():null;
  return {legno:g(legno), foglie:fo.map(g), limoni:li.map(g)};
}

    if(!GEO){ var sp=MODELLO_001, R=(function(seed){ var s=(seed*9301+49297)%2147483647; return function(){ s=(s*16807)%2147483647; return (s-1)/2147483646; }; })(1*13+5);
      var out=cresci(sp,R); GEO={geo:geometrieAlbero(out,sp.ox), mat:MAT_SC, h:sp.h, centro:sp.centro}; }
    return GEO;
  }
  function monta(el){
    if(!el||el.__sefMod) return; el.__sefMod=true;
    carica().then(function(){
      var T=THREE, G=costruisci(), W=el.clientWidth||400, H=el.clientHeight||360;
      var ren=new T.WebGLRenderer({antialias:true, alpha:true}); ren.setPixelRatio(Math.min(2,window.devicePixelRatio||1)); ren.setSize(W,H);
      ren.shadowMap.enabled=true; ren.domElement.style.cssText='display:block;width:100%;height:100%;touch-action:none;cursor:grab';
      Array.prototype.slice.call(el.childNodes).forEach(function(n){ if(n.nodeType===3) n.textContent=''; }); el.style.position=el.style.position||'relative'; ren.domElement.style.position='absolute'; ren.domElement.style.inset='0'; el.appendChild(ren.domElement);
      var sc=new T.Scene(), cam=new T.PerspectiveCamera(32,W/H,0.05,100);
      sc.add(new T.HemisphereLight(0xfffbf0,0x8a7a5a,0.95));
      var sun=new T.DirectionalLight(0xffffff,0.75); sun.position.set(3,6,4); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024);
      var sh=sun.shadow.camera; sh.left=sh.bottom=-3; sh.right=sh.top=3; sc.add(sun);
      var grp=new T.Group(), c=G.centro; grp.position.set(-c.x,0,-c.z);
      function mesh(ge,m){ if(!ge) return; var me=new T.Mesh(ge,m); me.castShadow=me.receiveShadow=true; grp.add(me); }
      mesh(G.geo.legno,G.mat.rami); G.geo.foglie.forEach(function(g,i){mesh(g,G.mat.foglie[i]);}); G.geo.limoni.forEach(function(g,i){mesh(g,G.mat.limoni[i]);});
      var piv=new T.Group(); piv.add(grp); sc.add(piv);
      var prato=(function(){ var g=new T.CircleGeometry(2.1,64), p=g.attributes.position, col=[], c=new T.Color(), v=new T.Vector3();
        for(var i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); var r=Math.hypot(v.x,v.y)/2.1, n=0.5+0.5*Math.sin(v.x*7.3+v.y*5.1)*Math.cos(v.x*3.7-v.y*8.9);
          c.setRGB(0.36+0.08*n-0.06*r, 0.56+0.10*n-0.08*r, 0.22+0.04*n); col.push(c.r,c.g,c.b); }
        g.setAttribute('color',new T.Float32BufferAttribute(col,3));
        var m=new T.Mesh(g,new T.MeshLambertMaterial({vertexColors:true})); m.rotation.x=-Math.PI/2; m.receiveShadow=true; return m; })(); sc.add(prato);
      var ciuffi=(function(){ var gr=new T.Group(), mat=new T.MeshLambertMaterial({color:0x5f9a35, side:T.DoubleSide}), mat2=new T.MeshLambertMaterial({color:0x7cb446, side:T.DoubleSide});
        var s=7; function rnd(){ s=(s*16807)%2147483647; return (s-1)/2147483646; }
        var lama=new T.PlaneGeometry(0.025,0.14); lama.translate(0,0.07,0);
        for(var i=0;i<900;i++){ var a=rnd()*6.283, r=0.25+Math.sqrt(rnd())*1.8, b=new T.Mesh(lama, rnd()<0.5?mat:mat2);
          b.position.set(Math.cos(a)*r,0,Math.sin(a)*r); b.rotation.set((rnd()-.5)*0.5, rnd()*6.283, (rnd()-.5)*0.5); b.scale.y=0.6+rnd()*0.9; gr.add(b); }
        return gr; })(); sc.add(ciuffi);
      var suolo=new T.Mesh(new T.CircleGeometry(2.2,48), new T.ShadowMaterial({opacity:0.22})); suolo.rotation.x=-Math.PI/2; suolo.position.y=0.002; suolo.receiveShadow=true; sc.add(suolo);
      var yaw=0.6, pitch=0.18, dist=6.2, tgt=new T.Vector3(0,G.h*0.52,0), drag=null, fermo=0;
      function posa(){ cam.position.set(tgt.x+dist*Math.cos(pitch)*Math.sin(yaw), tgt.y+dist*Math.sin(pitch), tgt.z+dist*Math.cos(pitch)*Math.cos(yaw)); cam.lookAt(tgt); }
      var cv=ren.domElement;
      cv.addEventListener('pointerdown',function(e){ drag={x:e.clientX,y:e.clientY}; cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; });
      cv.addEventListener('pointermove',function(e){ if(!drag) return; yaw-=(e.clientX-drag.x)*0.008; pitch=Math.max(-0.1,Math.min(1.2,pitch+(e.clientY-drag.y)*0.006)); drag={x:e.clientX,y:e.clientY}; fermo=performance.now(); });
      function su(){ drag=null; cv.style.cursor='grab'; } cv.addEventListener('pointerup',su); cv.addEventListener('pointercancel',su);
      cv.addEventListener('wheel',function(e){ e.preventDefault(); dist=Math.max(3.2,Math.min(10,dist*(1+e.deltaY*0.001))); },{passive:false});
      new ResizeObserver(function(){ var w=el.clientWidth, h=el.clientHeight; if(!w||!h) return; ren.setSize(w,h); cam.aspect=w/h; cam.updateProjectionMatrix(); }).observe(el);
      (function giro(){ if(!el.isConnected){ ren.dispose(); return; } if(!drag&&performance.now()-fermo>2500) yaw+=0.004; posa(); ren.render(sc,cam); requestAnimationFrame(giro); })();
    });
  }
  window.SEFModello={monta:monta};
})();
