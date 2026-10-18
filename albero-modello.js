/* Albero 3D "Limone 3D" (modello 001) — estratto da mappa-3d.html del gestionale superetnafood */
(function(){
  var URL3='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', attesa=null;
  function carica(){ if(window.THREE) return Promise.resolve(); if(attesa) return attesa;
    attesa=new Promise(function(ok,ko){ var s=document.createElement('script'); s.src=URL3; s.onload=ok; s.onerror=ko; document.head.appendChild(s); }); return attesa; }
  var GEO={};
  var TRACCE={"2":{"b":[225,700],"top":80,"cr":[0,450,560],"L":[[7,1,225,700,228,650,232,600],[2.5,0,232,600,270,578,330,560,375,545,400,505],[3,0,228,595,205,530,190,450,170,360,150,260],[2.5,0,235,595,245,510,245,420,240,320,230,200],[1.5,0,190,450,140,410,100,350],[1.5,0,245,420,300,380,350,320],[1.2,0,400,505,430,470],[1.5,0,240,320,280,250,300,180]]},"3":{"b":[232,800],"top":200,"cr":[0,450,560],"L":[[6,1,232,800,232,750,230,700],[3,0,230,700,212,650,195,600,160,550,130,480,105,400,100,300],[3,0,232,700,260,650,300,605,335,570,350,520,345,440,360,350],[1.5,0,160,550,190,490,225,450],[1.5,0,300,605,290,540,300,470],[1.2,0,105,400,60,350,40,300],[1.2,0,345,440,400,400,430,350],[1,0,100,300,110,230]]},"4":{"b":[185,820],"top":120,"cr":[0,450,560],"L":[[4.5,1,185,820,190,760,198,700,207,650],[2,0,207,650,192,600,180,550,165,500,148,450,155,400,150,330],[2,0,207,650,222,600,240,550,262,500,270,450,260,380],[1.5,0,222,612,260,598,300,580],[1.2,0,148,450,110,420,60,400],[1.2,0,262,500,300,470,340,440],[1,0,270,450,300,380,330,320],[1,0,155,400,140,300,110,220]]},"5":{"b":[160,820],"top":80,"cr":[0,450,470],"L":[[7,1,160,820,165,740,172,660,182,600],[4,0,182,600,230,545,280,490,320,445,355,410,390,390,425,360],[3,0,178,600,155,540,130,485,115,450,110,380],[2,0,320,445,335,385,345,330,330,280],[1.5,0,130,485,85,430,40,390],[1.5,0,110,380,120,300,140,220],[1.5,0,345,330,300,260,270,180],[1.2,0,390,390,420,320,440,240],[1.2,0,230,545,240,470,250,400,245,320]]},"6":{"b":[210,690],"top":170,"cr":[0,450,420],"L":[[5,1,170,690,174,610,180,530,198,470],[5,1,250,670,258,600,272,530,290,470],[2.5,0,198,470,195,425,172,380,160,330,140,260],[2.5,0,180,530,150,470,120,420,100,380],[2.5,0,290,470,292,420,300,385,350,398,400,410,445,412],[2,0,290,470,280,410,270,350,260,280],[1.2,0,120,420,80,370,40,340],[1.2,0,160,330,120,250,110,200],[1.2,0,270,350,300,290,330,240]]},"7":{"b":[165,750],"top":140,"cr":[0,450,560],"L":[[5,1,165,750,180,700,198,640,215,590,228,560],[2.5,0,228,560,255,525,295,500,330,480,380,470,420,440],[2.5,0,222,560,208,500,190,455,170,410,160,330],[1.5,0,295,500,315,450,335,400,340,330],[1.5,0,190,455,140,400,100,345,60,300],[1.2,0,160,330,180,260,230,170],[1.2,0,160,330,120,260,80,210],[1.2,0,335,400,380,350,420,310]]},"8":{"b":[258,690],"top":190,"cr":[0,450,560],"L":[[6,1,258,690,254,640,248,595],[2,0,248,595,228,565,212,520,205,470,200,400,190,320],[2,0,245,590,205,550,160,515,115,500,60,470],[2,0,252,595,245,530,252,460,262,390,270,300],[2,0,255,595,285,570,310,540,318,490,340,440],[1.2,0,190,320,160,260,140,210],[1.2,0,270,300,300,250,320,210],[1.2,0,340,440,380,380,420,320],[1.2,0,115,500,80,420,60,350]]},"9":{"b":[330,800],"top":180,"cr":[0,450,560],"L":[[5,1,330,800,322,740,305,690,287,650],[2.5,0,287,650,245,632,218,600,214,550,195,510,172,470,145,430,100,402,55,390],[2,0,214,550,228,500,232,430,240,370,235,300],[2,0,287,650,280,580,282,500,290,440,285,360],[2.5,0,292,640,325,605,348,560,345,505,330,470,320,420,325,360],[1.5,0,345,505,380,475,420,462,445,440],[1.2,0,325,360,340,300,350,250],[1.2,0,145,430,150,350,160,260,155,190],[1.2,0,380,475,395,410,410,350]]},"10":{"b":[225,770],"top":220,"cr":[0,450,530],"L":[[6,1,225,770,228,710,235,655],[2.5,0,232,655,216,600,200,568,186,520,180,480,162,452,120,420],[2.5,0,238,655,254,610,262,560,270,510,288,490,308,465,322,430,330,380],[1.5,0,270,510,252,470,230,440,210,400],[1.5,0,300,488,340,470,380,455,420,430],[1.2,0,180,480,150,400,140,330],[1.2,0,330,380,310,310,280,260],[1.2,0,210,400,220,320,225,240]]},"11":{"b":[205,680],"top":120,"cr":[0,450,480],"L":[[5,1,205,680,210,620,214,560,212,510],[2.5,0,212,510,180,478,150,452,115,440,70,430],[2,0,150,452,120,392,80,372,35,350,10,310],[2.5,0,214,505,238,462,245,420,236,372,218,342,235,310,260,300],[1.5,0,245,420,280,390,320,360],[1.5,0,218,342,180,355,150,350],[1.2,0,260,300,280,240,300,180],[1.2,0,236,372,230,280,220,200,210,140]]},"14":{"b":[262,700],"top":50,"cr":[0,450,500],"L":[[6,1,262,700,252,630,232,565,216,522],[2.5,0,216,522,182,500,150,480,118,462,80,440,40,420],[3,0,216,522,222,462,236,418,252,370,272,320,290,270,300,210],[2,0,222,462,202,400,192,330,200,250,220,170],[1.5,0,150,480,130,410,110,330,100,250],[1.5,0,272,320,320,290,370,260,410,220],[1.5,0,252,370,300,390,350,380,400,360],[1.2,0,220,170,235,100,238,60]]},"15":{"b":[245,750],"top":140,"cr":[0,450,480],"L":[[6,1,245,750,248,700,255,660],[2.5,0,250,662,230,630,212,600,198,568,178,545,155,528,150,470,140,410,120,350],[2.5,0,258,662,278,605,290,560,305,530,325,510,355,490,385,470,405,440,395,380,380,300],[2,0,290,560,288,470,262,412,222,372,200,330],[2,0,290,610,340,585,385,562,445,550],[1.5,0,405,440,420,410,445,390],[1.2,0,120,350,110,280,120,220],[1.2,0,222,372,210,300,215,230],[1.2,0,380,300,370,240]]},"16":{"b":[215,665],"top":110,"cr":[0,450,520],"L":[[5,1,215,665,216,620,220,590],[2,0,218,590,205,560,196,530,186,500,170,472,140,452,100,430],[2,0,224,588,255,570,278,548,296,518,312,480,320,430],[2,0,200,530,215,470,222,410,234,355,250,318,260,260],[1.5,0,222,560,240,510,260,490,290,470],[1.2,0,140,452,120,380,110,300],[1.2,0,320,430,340,360,350,290],[1.2,0,260,260,240,190,230,130]]},"17":{"b":[235,790],"top":30,"cr":[0,450,420],"L":[[6,1,235,790,238,700,236,610,228,545,226,505],[2.5,0,224,505,198,472,176,450,160,420,146,380,132,330,120,270],[3,0,230,505,250,462,266,432,280,410,286,380,280,345,276,315,270,260],[2,0,280,410,312,398,340,376,365,358,410,340],[1.5,0,240,500,244,430,240,380,230,320],[1.5,0,120,270,100,200,60,160],[1.5,0,270,260,250,190,220,130,210,60],[1.2,0,270,260,320,200,360,160],[1.2,0,230,320,200,260,180,200]]},"19":{"b":[240,705],"top":80,"cr":[0,450,620],"L":[[6,1,240,705,236,680,232,660],[2.5,0,232,662,200,648,165,630,132,610,110,580],[3,0,236,665,268,640,298,612,328,582,348,552,355,520,345,470],[2,0,234,660,244,612,250,560,256,520,250,450],[2,0,228,660,220,600,212,550,200,490,165,450,130,420,105,380],[1.5,0,348,552,380,580,405,580,440,560],[1.5,0,250,450,230,380,215,300],[1.5,0,345,470,320,400,300,330],[1.2,0,105,380,90,320,80,250],[1.2,0,300,330,340,260,380,200],[1.2,0,215,300,210,200,215,120]]},"20":{"b":[182,725],"top":0,"cr":[0,450,540],"L":[[5,1,175,725,178,680,182,640],[4,1,190,725,200,680,212,630],[2,0,182,640,180,590,166,540,150,500,140,440,120,380],[2.5,0,212,630,228,598,256,570,286,542,302,520,320,500,326,470,330,400,345,330,355,260],[1.5,0,256,570,264,520,256,472,262,430,255,350],[1.2,0,326,470,370,460,410,440],[1.2,0,120,380,100,300,90,200],[1.2,0,255,350,240,250,230,150],[1.2,0,355,260,360,170,370,100]]},"21":{"b":[190,800],"top":0,"cr":[0,450,560],"L":[[8,1,190,800,190,700,194,610,205,570],[2.5,0,200,572,178,522,160,470,140,420,120,380,90,330],[2.5,0,210,568,244,540,280,515,312,490,360,462,410,450,445,440],[2,0,250,532,268,482,285,440,300,380],[2,0,205,565,215,480,222,400,225,330],[1.2,0,90,330,80,250,90,170],[1.2,0,300,380,320,300,330,220],[1.2,0,225,330,230,230,240,130],[1.2,0,360,462,380,400,400,330]]},"22":{"b":[225,672],"top":30,"cr":[0,450,560],"L":[[5,1,225,672,228,620,235,580,240,540],[2.5,0,236,534,210,512,186,500,165,480,150,460,125,420,100,400,70,380],[2.5,0,242,534,240,480,240,430,236,400,224,370,208,350,200,320,195,250],[2,0,236,400,250,370,268,350,300,340,330,330],[2,0,252,530,290,510,322,498,352,480,390,468,425,458],[1.5,0,208,350,165,350,130,370],[1.2,0,195,250,180,170,170,100],[1.2,0,330,330,360,270,380,210],[1.2,0,125,420,90,340,60,280]]}};
  function scala(x){ var k=1160/450, f=function(v){return Math.round(v*k);}; return {b:x.b.map(f), top:f(x.top), cr:x.cr.map(f), L:x.L.map(function(l){ return [l[0],l[1]].concat(l.slice(2).map(f)); })}; }
  function scheda(n){ if(window.SEF3D&&window.SEF3D.scheda) return window.SEF3D.scheda(n); return {n:n,h:2.6,w:2.6,hb:0.5,tr:1,lean:6,forma:'globo',dens:0.8,col:'medio',succ:0.25,frutti:0.3}; }
  function costruisci(n){
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
function specDaScheda(s, R){
  const V=(a,b,c)=>new THREE.Vector3(a,b,c), rr=(a,b)=>a+(b-a)*R();
  const H=s.h||2.5, W=s.w||2.4, hb=Math.max(0.25,Math.min(H*0.45,s.hb||0.55)), tr=Math.max(1,Math.min(3,s.tr||1)), forma=s.forma||'globo';
  const lean=(s.lean||6)*Math.PI/180, a0=R()*6.283, catene=[], tops=[];
  for(let i=0;i<tr;i++){
    const az=a0+(tr>1?i/tr*6.283+rr(-0.3,0.3):0), tilt=lean+(tr>1?rr(0.22,0.4):0), h=hb*rr(0.9,1.12);
    const bx=(tr>1?Math.cos(az)*0.05:0)+rr(-0.02,0.02), bz=(tr>1?Math.sin(az)*0.05:0)+rr(-0.02,0.02), pts=[V(bx,-0.1,bz)];
    for(let k=1;k<=6;k++){ const f=k/6, off=Math.sin(tilt)*h*Math.pow(f,1.35)*1.15, w=k<6?rr(-0.025,0.025):0;
      pts.push(V(bx+Math.cos(az)*off+w, h*f, bz+Math.sin(az)*off+w)); }
    catene.push({tipo:1, pts}); tops.push(pts);
  }
  const cx=tops.reduce((a,p)=>a+p[6].x,0)/tr, cz=tops.reduce((a,p)=>a+p[6].z,0)/tr;
  const yB=Math.max(0.3,hb*(forma==='cespuglio'?0.7:0.88)), rx=W/2, ry=(H-yB)/2, rz=rx*rr(0.78,0.92), cy=yB+ry;
  const nS={vaso:5,ombrello:5,globo:4,cespuglio:5,eretto:3}[forma]||4, ang={vaso:0.62,ombrello:1.0,globo:0.55,cespuglio:0.85,eretto:0.26}[forma]||0.55;
  const blobs=[], sc=Math.max(0.75,Math.min(1.25,W/2.6)), ends=[];
  let j=0; tops.forEach((P,ti)=>{ const k=Math.max(2,Math.round(nS/tr)+(R()<0.4?1:0));
    for(let q=0;q<k;q++,j++){
      const st=q===0?P[6].clone():P[R()<0.5?5:4].clone(), az=a0+j/(k*tr)*6.283+ti*1.1+rr(-0.35,0.35), el=ang*rr(0.78,1.2);
      const rh=rx*rr(0.42,0.72), dy=Math.min(rh/Math.max(0.2,Math.tan(el)), H-0.35-st.y);
      const e=V(st.x+Math.cos(az)*rh, st.y+Math.max(0.12,dy), st.z+Math.sin(az)*rh*rz/rx);
      const m=st.clone().lerp(e,0.5).add(V(rr(-0.08,0.08),rr(0,0.12),rr(-0.08,0.08)));
      catene.push({tipo:0, pts:[st,m,e]}); ends.push(e);
      if(R()<0.55){ const a2=az+rr(-0.9,0.9), f=m.clone().lerp(e,0.4), e2=V(f.x+Math.cos(a2)*rh*0.5, f.y+rr(0.15,0.35), f.z+Math.sin(a2)*rh*0.5); catene.push({tipo:0, pts:[f,f.clone().lerp(e2,0.5).add(V(0,0.04,0)),e2]}); ends.push(e2); }
    } });
  if(forma==='vaso'){ ends.forEach(e=>{ const a=Math.atan2(e.z-cz,e.x-cx); blobs.push({c:V(cx+Math.cos(a)*rx*0.5,cy+ry*0.05,cz+Math.sin(a)*rz*0.5), r:V(rx*0.55,ry*0.85,rz*0.55)}); }); blobs.push({c:V(cx,cy+ry*0.55,cz), r:V(rx*0.6,ry*0.4,rz*0.6)}); }
  else if(forma==='ombrello') blobs.push({c:V(cx,cy+ry*0.22,cz), r:V(rx*0.95,ry*0.62,rz*0.95)},{c:V(cx,cy-ry*0.3,cz), r:V(rx*0.6,ry*0.35,rz*0.6)});
  else if(forma==='cespuglio') blobs.push({c:V(cx,cy-ry*0.08,cz), r:V(rx*0.95,ry*0.82,rz*0.9)},{c:V(cx+rx*0.45,yB+ry*0.5,cz), r:V(rx*0.5,ry*0.5,rz*0.55)},{c:V(cx-rx*0.45,yB+ry*0.55,cz), r:V(rx*0.5,ry*0.5,rz*0.55)});
  else if(forma==='eretto') blobs.push({c:V(cx,cy,cz), r:V(rx*0.82,ry*0.95,rz*0.78)},{c:V(cx,H-ry*0.35,cz), r:V(rx*0.5,ry*0.4,rz*0.5)});
  else blobs.push({c:V(cx,cy,cz), r:V(rx*0.9,ry*0.9,rz*0.9)},{c:V(cx+rr(-0.2,0.2),H-ry*0.3,cz), r:V(rx*0.55,ry*0.35,rz*0.55)});
  ends.forEach(e=>{ const c=e.clone(); c.y=Math.max(c.y,yB+0.25); blobs.push({c, r:V(0.45*sc,0.36*sc,0.45*sc)}); });
  const nsu=Math.round((s.succ||0)*4);
  for(let i=0;i<nsu;i++) blobs.push({c:V(cx+rr(-0.5,0.5)*rx, H-0.2, cz+rr(-0.3,0.3)*rz), r:V(0.14,0.4,0.14)});
  const vol=(2*rx+0.6)*(H-yB+0.5)*(2*rz+0.6);
  return { h:H, root:Math.min(0.085,(0.04+0.016*H)/Math.sqrt(tr)), catene, blobs, box:[cx-rx-0.35,cx+rx+0.35,yB-0.15,H+0.35,cz-rz-0.35,cz+rz+0.35],
    nA:Math.round(Math.min(1250,Math.max(600,vol*90*(0.6+0.6*(s.dens||0.7))))), yB, xL:cx-rx, xR:cx+rx, centro:V(cx,cy+0.1,cz), frutti:Math.max(4,Math.round((s.frutti||0)*80)), ox:0 };
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

    var k=+n||1;
    if(!GEO[k]){ var R=(function(seed){ var s=(seed*9301+49297)%2147483647; return function(){ s=(s*16807)%2147483647; return (s-1)/2147483646; }; })(k*13+5);
      var sc=k===1?null:scheda(k), sp=k===1?MODELLO_001:(TRACCE[k]?specDaFoto(sc,scala(TRACCE[k]),sc.h||2.5,[0,0,0,Math.max(1.2,(sc.w||2.4)/2)],R):specDaScheda(sc,R)), mat=MAT_SC;
      if(sc&&sc.col&&sc.col!=='medio') mat={rami:MAT_SC.rami, foglie:[new THREE.MeshLambertMaterial({color:sc.col==='chiaro'?0x3f7f24:0x24541a, side:THREE.DoubleSide}), MAT_SC.foglie[1], MAT_SC.foglie[2]], limoni:MAT_SC.limoni};
      var out=cresci(sp,R); GEO[k]={geo:geometrieAlbero(out,sp.ox), mat:mat, h:sp.h, centro:sp.centro, s:Math.max(sp.h,(sp.xR-sp.xL)||0)}; }
    return GEO[k];
  }
  function monta(el, n){
    n=+n||1;
    if(!el||el.__sefN===n) return;
    if(el.__sefStop) el.__sefStop();
    el.__sefN=n;
    carica().then(function(){
      if(el.__sefN!==n) return;
      var T=THREE, G=costruisci(n), W=el.clientWidth||400, H=el.clientHeight||360;
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
      var yaw=0, pitch=0.18, dist=Math.max(6.2,G.s*2.25), tgt=new T.Vector3(0,G.h*0.52,0), drag=null, fermo=0;
      function posa(){ cam.position.set(tgt.x+dist*Math.cos(pitch)*Math.sin(yaw), tgt.y+dist*Math.sin(pitch), tgt.z+dist*Math.cos(pitch)*Math.cos(yaw)); cam.lookAt(tgt); }
      var cv=ren.domElement;
      cv.addEventListener('pointerdown',function(e){ drag={x:e.clientX,y:e.clientY}; cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; });
      cv.addEventListener('pointermove',function(e){ if(!drag) return; yaw-=(e.clientX-drag.x)*0.008; pitch=Math.max(-0.1,Math.min(1.2,pitch+(e.clientY-drag.y)*0.006)); drag={x:e.clientX,y:e.clientY}; fermo=performance.now(); });
      function su(){ drag=null; cv.style.cursor='grab'; } cv.addEventListener('pointerup',su); cv.addEventListener('pointercancel',su);
      cv.addEventListener('wheel',function(e){ e.preventDefault(); dist=Math.max(3.2,Math.min(10,dist*(1+e.deltaY*0.001))); },{passive:false});
      var ro=new ResizeObserver(function(){ var w=el.clientWidth, h=el.clientHeight; if(!w||!h) return; ren.setSize(w,h); cam.aspect=w/h; cam.updateProjectionMatrix(); }); ro.observe(el); var vivo=true;
      (function giro(){ if(!vivo) return; if(!el.isConnected){ vivo=false; ro.disconnect(); ren.dispose(); el.__sefN=null; el.__sefStop=null; return; } if(!drag&&performance.now()-fermo>2500) yaw+=0.004; posa(); ren.render(sc,cam); requestAnimationFrame(giro); })();
      el.__sefStop=function(){ vivo=false; ro.disconnect(); if(cv.parentNode) cv.parentNode.removeChild(cv); ren.dispose(); el.__sefStop=null; };
    });
  }
  window.SEFModello={monta:monta};
})();
