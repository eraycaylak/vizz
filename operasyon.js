/* VIZZ Operasyon Merkezi — mock prototip (dark NOC + ECharts + Leaflet) */
(function(){
const $ = s => document.querySelector(s);
const D = window.VIZZ;
document.getElementById('logo').src = D.LOGO;
document.getElementById('logo2').src = D.LOGO;

const C = { y:'#FFC400', y2:'#F2A900', ok:'#26C281', warn:'#F5A623', bad:'#FF5A52', info:'#4C8DFF', purple:'#A98BFF',
  tx2:'#A4AAB3', tx3:'#70767E', line:'rgba(255,255,255,.07)', s3:'#1C2026' };
const rnd=(a,b)=>a+Math.random()*(b-a);
const charts=[];
let activeCourierId = null;
let activeDukkanId = null;
let reportsBuilt = false;

function getThemeStyles() {
  const isLight = document.body.classList.contains('light-theme');
  const line = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,.07)';
  const tx3 = isLight ? '#64748b' : '#70767E';
  const tx2 = isLight ? '#334155' : '#A4AAB3';
  const s3 = isLight ? '#f1f5f9' : '#1C2026';
  return {
    isLight,
    y: isLight ? '#d97706' : '#FFC400',
    y2: isLight ? '#b45309' : '#F2A900',
    ok: '#26C281',
    warn: '#F5A623',
    bad: '#FF5A52',
    info: '#4C8DFF',
    purple: '#A98BFF',
    tx2,
    tx3,
    line,
    s3,
    tip: {
      backgroundColor: isLight ? '#ffffff' : '#1C2026',
      borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,.12)',
      textStyle: { color: isLight ? '#0f172a' : '#E9EBEE', fontSize: 12 },
      padding: [8, 11]
    },
    axis: {
      axisLine: { lineStyle: { color: line } },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: line } },
      axisLabel: { color: tx3, fontSize: 10 },
      nameTextStyle: { color: tx3 }
    }
  };
}

function mkChart(elId){ const c=echarts.init(document.getElementById(elId),null,{renderer:'canvas'}); charts.push(c); return c; }
window.addEventListener('resize',()=>charts.forEach(c=>c.resize()));

let tt; function toast(m){ const e=$('#toast'); e.innerHTML='<svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="m9 11 3 3L22 4"/></svg>'+m; e.classList.add('on'); clearTimeout(tt); tt=setTimeout(()=>e.classList.remove('on'),2200); }

/* ---------- saat / online ---------- */
function clock(){ const d=new Date(); $('#clock').textContent=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }
clock(); setInterval(clock,15000);
const online = D.COURIERS.filter(c=>c.status!=='break').length;
$('#onlineN').textContent=online;
(function(){const cc=$('#courierCnt'); if(cc) cc.textContent=online+' aktif';})();

/* ---------- KPI şeridi + sparkline ---------- */
const KPI=[
 {lab:'Aktif Sipariş', val:'<span class="num">5</span>', sub:'<span class="up">▲ 2</span> son saat', spark:'bar', data:[3,4,2,5,6,4,7,5], col:C.y},
 {lab:'Sahadaki Kurye', val:'<span class="num">10</span><small>/15</small>', sub:'<span class="up">▲ 3</span> yoğun saat', spark:'line', data:[7,8,8,9,10,9,11,10], col:C.ok},
 {lab:'Ort. Teslimat', val:'<span class="num">27</span><small> dk</small>', sub:'<span class="up">▼ hedef altı</span>', spark:'line', data:[31,30,29,28,27,28,26,27], col:C.info},
 {lab:'SLA Zamanında', val:'<span class="num">%94</span>', sub:'hedef %90 <span class="up">✓</span>', spark:'line', data:[88,90,92,91,93,94,93,94], col:C.ok, accent:true},
 {lab:'Bekleyen Atama', val:'<span class="num">2</span>', sub:'<span class="flat">ort. 38sn</span>', spark:'bar', data:[1,3,2,1,4,2,1,2], col:C.warn},
 {lab:'Bugünkü Ciro', val:'₺<span class="num">18.4</span><small>K</small>', sub:'<span class="up">▲ %12</span> dün', spark:'line', data:[6,9,11,13,15,16,17,18.4], col:C.y},
];
function renderKPIs(){
  const s = getThemeStyles();
  const KKEYS=['aktif','saha','teslimat','sla','bekleyen','ciro'];
  $('#kpis').innerHTML = KPI.map((k,i)=>`<div class="kpi clk${k.accent?' accent':''}" onclick="VZ.kpiModal('${KKEYS[i]}')"><div class="more"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M7 7h10v10M7 17 17 7"/></svg></div><div class="lab">${k.lab}</div><div class="val">${k.val}</div><div class="sub">${k.sub}</div><div class="spark" id="sp${i}"></div></div>`).join('');
  KPI.forEach((k,i)=>{ const c=mkChart('sp'+i);
    const col = (k.col === C.y || k.col === '#FFC400') ? s.y : k.col;
    c.setOption({ grid:{left:0,right:0,top:6,bottom:0}, xAxis:{type:'category',show:false,data:k.data.map((_,j)=>j)}, yAxis:{type:'value',show:false,scale:true},
      series:[k.spark==='bar'
        ? {type:'bar',data:k.data,itemStyle:{color:col,borderRadius:[2,2,0,0]},barWidth:'55%'}
        : {type:'line',data:k.data,smooth:true,symbol:'none',lineStyle:{color:col,width:2},areaStyle:{color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:col+'55'},{offset:1,color:col+'00'}])}}] }); });
}

/* ---------- NOC harita (koyu) ---------- */
const Y=D.YOZGAT; let map, heatLayer=null, courierHandles=[];
const oq=[]; let active=0;
function pump(){ while(active<2 && oq.length){ const j=oq.shift(); active++;
  fetch(`https://router.project-osrm.org/route/v1/driving/${j.a[1]},${j.a[0]};${j.b[1]},${j.b[0]}?overview=full&geometries=geojson`)
    .then(r=>r.ok?r.json():Promise.reject()).then(d=>{active--;j.ok(d.routes[0].geometry.coordinates.map(c=>[c[1],c[0]]));pump();})
    .catch(()=>{active--;j.ok(null);pump();}); } }
const route=(a,b)=>new Promise(ok=>{oq.push({a,b,ok});pump();});
const straight=(a,b,n)=>{const p=[];for(let i=0;i<=n;i++)p.push([a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n]);return p;};
const cum=p=>{let d=[0];for(let i=1;i<p.length;i++)d.push(d[i-1]+Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]));return d;};
const bike='<svg viewBox="0 0 24 24"><circle cx="5.5" cy="17" r="3"/><circle cx="18.5" cy="17" r="3"/><path d="M8.5 17h6l-2.5-6H8m6.5 6 2-6h2.5"/></svg>';
function courierIcon(c){return L.divIcon({className:'',html:`<div class="cm ${c.status==='delivering'?'deliver':'idle'}"><div class="pin">${bike}</div></div>`,iconSize:[26,26],iconAnchor:[13,13]});}
function restIcon(){return L.divIcon({className:'',html:'<div class="rest-pin"><svg viewBox="0 0 24 24"><path d="M4 3v7a2 2 0 0 0 2 2h0V3M6 3v18M14 3c-1 1-2 3-2 6s2 4 3 4v8"/></svg></div>',iconSize:[16,16],iconAnchor:[8,8]});}
function marketIcon(){return L.divIcon({className:'',html:'<div class="rest-pin" style="width:22px;height:22px;border-radius:8px;background:var(--y);color:#15140F;font-size:13px;font-weight:900">🛒</div>',iconSize:[22,22],iconAnchor:[11,11]});}

const TILE_DARK='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_LIGHT='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
let tileLayer=null;
function getTileUrl(){ return document.body.classList.contains('light-theme') ? TILE_LIGHT : TILE_DARK; }
function swapTiles(){ if(tileLayer) tileLayer.setUrl(getTileUrl()); }
function initMap(){
  if(map){ setTimeout(()=>map.invalidateSize(),60); swapTiles(); return; }
  map=L.map('noc',{zoomControl:false,attributionControl:false}).setView(Y.center,Y.zoom);
  tileLayer=L.tileLayer(getTileUrl(),{maxZoom:19}).addTo(map);
  const cov=L.polygon(Y.coverage,{color:C.y,weight:2,dashArray:'7 6',fillColor:C.y,fillOpacity:.05}).addTo(map);
  map.fitBounds(cov.getBounds(),{padding:[30,30]});
  Y.zones.forEach(z=>L.marker(z.c,{opacity:0,interactive:false}).addTo(map).bindTooltip(z.n,{permanent:true,direction:'top',className:'zone-lbl'}));
  D.RESTAURANTS.forEach(r=>{const z=Y.zones.find(x=>x.n===r.zone)||Y.zones[0];L.marker([z.c[0]+rnd(-.001,.001),z.c[1]+rnd(-.001,.001)],{icon:restIcon()}).addTo(map).bindTooltip(r.name,{direction:'top'});});
  const mz=Y.zones.find(x=>x.n==='Cumhuriyet')||Y.zones[6]; L.marker([mz.c[0]+.0008,mz.c[1]-.0009],{icon:marketIcon()}).addTo(map).bindTooltip('VIZZ Market Deposu',{direction:'top'});
  D.COURIERS.filter(c=>c.status!=='break').forEach((c,i)=>{ const m=L.marker(c.pos.slice(),{icon:courierIcon(c)}).addTo(map).bindTooltip(`${c.name} · ${c.statusTr}`,{direction:'top',offset:[0,-8]});
    const h={c,m,path:null,cum:null,t:0,dur:1,total:0,busy:false}; courierHandles.push(h); setTimeout(()=>leg(h),i*320); });
  requestAnimationFrame(tick);
  // heat toggle
  $('#t-heat').onclick=function(){ this.classList.toggle('on');
    if(heatLayer){map.removeLayer(heatLayer);heatLayer=null;return;}
    heatLayer=L.layerGroup(); Y.zones.forEach((z,i)=>{const w=[.9,.6,.4,.75,.5,.3][i%6]; L.circle(z.c,{radius:340*(0.6+w),color:'transparent',fillColor:C.y,fillOpacity:.07+w*.10}).addTo(heatLayer);}); heatLayer.addTo(map); };
  $('#t-fit').onclick=()=>map.fitBounds(cov.getBounds(),{padding:[30,30]});
  setTimeout(()=>map.invalidateSize(),120);
}
async function leg(h){ if(h.busy)return; h.busy=true; const f=h.m.getLatLng(); const a=[f.lat,f.lng];
  const z=Y.zones[Math.floor(Math.random()*Y.zones.length)]; const b=[z.c[0]+rnd(-.0012,.0012),z.c[1]+rnd(-.0012,.0012)];
  let p=await route(a,b); if(!p||p.length<2)p=straight(a,b,30); h.path=p; h.cum=cum(p); h.total=h.cum[h.cum.length-1]||1e-6; h.t=0; h.dur=rnd(28,48); h.busy=false; }
let last=performance.now();
function tick(now){ const dt=Math.min(.05,(now-last)/1000); last=now;
  courierHandles.forEach(h=>{ if(!h.path)return; h.t+=dt/h.dur; if(h.t>=1){if(!h.busy)leg(h);return;}
    const tg=h.t*h.total; let lo=0,hi=h.cum.length-1; while(lo<hi-1){const md=(lo+hi)>>1; if(h.cum[md]<tg)lo=md;else hi=md;}
    const sg=h.cum[hi]-h.cum[lo]||1e-9, fr=(tg-h.cum[lo])/sg, p0=h.path[lo],p1=h.path[hi];
    h.m.setLatLng([p0[0]+(p1[0]-p0[0])*fr,p0[1]+(p1[1]-p0[1])*fr]); });
  requestAnimationFrame(tick); }

/* ---------- atama kuyruğu ---------- */
/* ---------- entegrasyon kanalları (çok-kanal) ---------- */
const CHAN={
  vizz:{n:'VIZZ App',c:'#FFC400',bg:'rgba(255,196,0,.14)'},
  tel:{n:'Telefon',c:'#4C8DFF',bg:'rgba(76,141,255,.14)'},
  ys:{n:'Yemeksepeti',c:'#FA0050',bg:'rgba(250,0,80,.14)'},
  trendyol:{n:'Trendyol Yemek',c:'#F27A1A',bg:'rgba(242,122,26,.14)'},
  getir:{n:'Getir Yemek',c:'#7B5CF0',bg:'rgba(123,92,240,.16)'},
};
function chanBadge(k){ const c=CHAN[k]; if(!c)return ''; return `<span class="chan" style="color:${c.c};background:${c.bg};border-color:${c.c}55"><span class="dot" style="background:${c.c}"></span>${c.n}</span>`; }
/* sipariş zenginleştirme: müşteri tam ad + telefon + tam adres + ödeme tipi */
const STREETS=['Lise Cad.','Atatürk Bul.','Gazi Cad.','Şehit Pilot Sok.','Sakarya Cad.','Bağdat Sok.','Çamlık Cad.','Hükümet Cad.','İstasyon Cad.','Yeni Çarşı Sok.'];
const CUSTF=['Ahmet Yılmaz','Mehmet Demir','Elif Kaya','Selin Çelik','Zeynep Arslan','Burak Şahin','Kerem Doğan','Hülya Aydın','Ali Demir','Sema Kaya','Hasan Çelik','Kübra Öz','Emre Şahin','Zehra Aydın'];
function payInfo(p){ if(/Nakit/i.test(p||''))return{n:'Nakit',c:'#26C281',ic:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>'};
  if(/Kart|POS/i.test(p||''))return{n:'Kapıda POS',c:'#4C8DFF',ic:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>'};
  return{n:'Online (ödendi)',c:'#FFC400',ic:'<circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/>'}; }
function enrichOrder(o,i){ const idn=Math.abs(parseInt(String(o.id).replace(/\D/g,''))||i||0);
  return {...o, custFull:CUSTF[idn%CUSTF.length],
    phone:'+90 53'+(idn%9)+' '+(100+idn%899)+' '+(10+idn%89)+' '+(10+(idn*7)%89),
    addr:o.zone+' Mah. '+STREETS[idn%STREETS.length]+' No:'+(2+idn%88)+' D:'+(1+idn%6)}; }
let orders = D.ORDERS.map((o,i)=>enrichOrder({...o, channel:o.vertical==='market'?'vizz':['vizz','tel','ys','vizz','getir','trendyol'][i%6]}, i));
const slaCls=s=>s==='Hazırlanıyor'?'b-warn':s==='Atanıyor'?'b-bad':s==='Kurye yolda'?'b-info':'b-ok';
function renderQueue(filter){
  const list = filter==='wait' ? orders.filter(o=>!o.courier) : filter==='market' ? orders.filter(o=>o.vertical==='market') : orders;
  $('#queue').innerHTML = list.map(o=>{
    const isM=o.vertical==='market';
    const p=payInfo(o.pay);
    return `<div class="ord ${o.status==='Atanıyor'?'live':''}" style="cursor:pointer" onclick="VZ.orderDetail('${o.id}')">
    <div class="r1"><span class="id">${o.id}</span><span style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end">${chanBadge(o.channel)}<span class="badge ${isM?'b-y':'b-mute'}" style="font-size:10px"><span class="dot"></span>${isM?'Market':'Yemek'}</span><span class="badge ${slaCls(o.status)}"><span class="dot"></span>${o.status}</span></span></div>
    <div class="meta"><span>${isM?'🛒':'🍽'} <b>${o.rest}</b></span><span>👤 ${o.custFull}</span><span>📍 ${o.zone}</span><span>${o.items} ürün · <b class="num">₺${o.total}</b></span><span style="color:${p.c}">${p.n}</span></div>
    ${o.courier
      ? `<div class="sla" style="color:var(--info)"><svg class="ic ic-sm" viewBox="0 0 24 24"><circle cx="5.5" cy="17" r="3"/><circle cx="18.5" cy="17" r="3"/><path d="M8.5 17h6l-2.5-6H8"/></svg> ${o.courier} · ${o.min} dk · <span class="muted">${isM?'market SLA 15-25 dk':'SLA güvenli'}</span></div>`
      : (autoOn
        ? `<div class="sla" style="color:var(--y);display:flex;align-items:center;gap:8px"><svg class="ic ic-sm pulse" viewBox="0 0 24 24"><path d="m13 2-3 7h6l-5 13 2-9H7l4-11Z"/></svg> Otomatik atanıyor… <span class="muted">en yakın + skor</span><button class="btn btn-ghost" style="margin-left:auto;padding:4px 9px;font-size:11px" onclick="event.stopPropagation();VZ.assign('${o.id}')">Hemen</button><button class="btn btn-ghost" style="padding:4px 9px;font-size:11px" onclick="event.stopPropagation();VZ.toast('Override — kurye seç (manuel)')">Override</button></div>`
        : `<div class="act"><button class="btn btn-y" onclick="event.stopPropagation();VZ.assign('${o.id}')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>Ata</button><button class="btn" onclick="event.stopPropagation();VZ.toast('${isM?'Market':'Yemek'} manuel — kurye seç')">Kurye Seç</button></div>`)}
  </div>`}).join('') || '<div class="dim" style="text-align:center;padding:28px;font-size:12px">Kuyruk temiz 🐝</div>';
}
function assign(id){ const o=orders.find(x=>x.id===id); const free=D.COURIERS.filter(c=>c.status==='online'); const k=free[Math.floor(Math.random()*free.length)]||D.COURIERS[0];
  o.courier=k.name; o.status='Kurye yolda'; o.min=Math.floor(rnd(5,13)); renderQueue(curFilter);
  toast(`<b>${id}</b> → ${k.name} atandı · gerekçe: en yakın + düşük yük`); }
let curFilter='all', autoOn=true;
function autoAssignTick(){ setInterval(()=>{ if(!autoOn)return;
  const pend=orders.filter(o=>!o.courier && o.status==='Atanıyor'); if(!pend.length)return;
  assign(pend[pend.length-1].id); // motor en eski bekleyeni otomatik atar (gerçek üründe atama motoru)
}, 2600); }
function toggleAuto(){ autoOn=!autoOn; const b=$('#autoTgl'); if(b){ b.classList.toggle('on',autoOn); b.querySelector('span').textContent=autoOn?'Oto AÇIK':'Manuel mod'; }
  renderQueue(curFilter); toast(autoOn?'<b>Otomatik atama AÇIK</b> — motor en yakın+skor ile atıyor':'Otomatik atama KAPALI — siparişleri sen atıyorsun (manuel mod)'); }
function qseg(id){ ['q-all','q-wait','q-market'].forEach(x=>$('#'+x)?.classList.toggle('on',x===id)); }
$('#q-all').onclick=()=>{curFilter='all';qseg('q-all');renderQueue('all');};
$('#q-wait').onclick=()=>{curFilter='wait';qseg('q-wait');renderQueue('wait');};
$('#q-market').onclick=()=>{curFilter='market';qseg('q-market');renderQueue('market');};

/* ---------- canlı kurye listesi ---------- */
function courierListHTML(){
  const isDemoPenalty = localStorage.getItem('vizz_courier_penalty_demo') === 'true';
  let list = [...D.COURIERS];
  if(isDemoPenalty) {
    const c1 = list.find(x=>x.id===1);
    if(c1) {
      list = list.filter(x=>x.id!==1);
      list.push(c1); // Sıra sonuna at
    }
  }

  return list.map(c=>{
    const st = c.status==='delivering'?'busy':c.status==='online'?'on':'off';
    let col = c.status==='delivering'?'b-y':c.status==='online'?'b-ok':'b-mute';
    let tr = c.statusTr;
    let rankAlert = '';

    if(isDemoPenalty && c.id===1) {
      col = 'b-bad';
      tr = 'Cezalı (Sıra Sonu)';
      rankAlert = '<div style="color:var(--bad);font-size:10px;margin-top:2px;font-weight:600">⚠️ Görev reddetti, sıra sonuna atıldı</div>';
    }

    return `<div style="display:flex;align-items:center;gap:11px;padding:9px 4px;border-bottom:1px solid var(--line);cursor:pointer" onclick="VZ.courierDrawer(${c.id})">
      <div class="av ${st}">${c.name.split(' ').map(p=>p[0]).join('')}</div>
      <div style="flex:1;min-width:0"><div style="display:flex;gap:7px;align-items:center"><b style="color:var(--tx);font-size:12.5px">${c.name}</b><span class="badge ${col}" style="font-size:10px;padding:2px 7px">${tr}</span></div>
        <div class="dim" style="font-size:11px;margin-top:2px">${c.zone} · ⭐ ${c.rate} · kabul %${c.accept}</div>${rankAlert}</div>
      <div style="text-align:right"><div class="num" style="color:var(--y);font-weight:700;font-size:13px">₺${c.earn}</div><div class="dim" style="font-size:10.5px">${c.today} teslimat</div></div>
    </div>`; }).join('');
}
function renderCouriers(){ const el=$('#courierList'); if(el) el.innerHTML=courierListHTML(); if($('#modal').classList.contains('on') && $('#modal').dataset.k==='saha'){ const mb=$('#modal .mbody'); if(mb) mb.innerHTML=courierListHTML(); } }
window.addEventListener('storage', () => renderCouriers());

/* ---------- RAPORLAR (leapfrog dashboard) ---------- */
function buildReports(){
  if(reportsBuilt) return; reportsBuilt=true;
  const s = getThemeStyles();
  const cards=[
    {id:'r-sla',col:6,t:'SLA — Zamanında Teslim',s:'söz verilen pencerede teslim oranı',h:150},
    {id:'r-rev',col:6,t:'Ciro Trendi (bugün, saatlik)',s:'canlı gelir akışı',h:150},
    {id:'r-pct',col:4,t:'Teslimat Süresi Dağılımı',s:'ORTALAMA değil — P50 / P90 / P95',h:180},
    {id:'r-stage',col:4,t:'Aşama Darboğazı',s:'sipariş→onay→hazır→pickup→teslim',h:180},
    {id:'r-cancel',col:4,t:'İptal Nedenleri (Pareto)',s:'sorumluluk + birikimli %',h:180},
    {id:'r-heat',col:8,t:'Yoğunluk Isı Haritası',s:'saat × mahalle sipariş yoğunluğu',h:230},
    {id:'r-unit',col:4,t:'Birim Ekonomi (sipariş başı)',s:'katkı payı kırılımı — CFO görünümü',h:230},
    {id:'r-zone',col:6,t:'Mahalle Bazlı Ciro',s:'en çok ciro üreten bölgeler',h:200},
    {id:'r-perf',col:6,t:'Kurye Performansı',s:'teslimat × zamanında % (balon = kazanç)',h:200},
    {id:'r-peak',col:7,t:'Yoğun Saatler × Restoran',s:'hangi saatte hangi restoran kaç paket atıyor',h:240},
    {id:'r-dist',col:5,t:'Mesafe Dağılımı (km)',s:'ort. 2.4 km · teslimat başına mesafe',h:240},
    {id:'r-speed',col:12,t:'Kurye Hız Sıralaması',s:'km/saat · en hızlı kurye üstte (ort. teslimat dk ↓)',h:260},
  ];
  // 🍯 DÜKKAN EKONOMİSİ — tek kaynaktan (arı peteği): her dükkanın tarifesi → gelir−kurye−komisyon−vergi = net
  const deko=D.econDukkan(), eFmt=n=>'₺'+Math.round(n).toLocaleString('tr-TR');
  const eTot=deko.reduce((a,r)=>({adet:a.adet+r.adet,tes:a.tes+r.tarife*r.adet,kom:a.kom+r.komisyon,kur:a.kur+r.kuryeGider,net:a.net+r.net}),{adet:0,tes:0,kom:0,kur:0,net:0});
  const dukkanCard=`<div class="card col-12"><div class="card-h"><div class="t">🍯 Dükkan Ekonomisi — tek kaynak (arı peteği)</div><span class="dim" style="font-size:11px">her dükkanın kendi tarifesi → teslimat geliri + komisyon − kurye − vergi = net · tüm raporlar tek motordan</span></div>
    <div style="overflow:auto;padding:2px 6px 8px"><table class="grid"><thead><tr><th>Dükkan</th><th>Bölge</th><th>Teslimat tarifesi</th><th>Bugün sipariş</th><th>Teslimat geliri</th><th>Komisyon</th><th>Kurye gideri</th><th>Net kâr</th><th>Net/sipariş</th></tr></thead><tbody>`+
    deko.map(r=>`<tr style="cursor:pointer" onclick="VZ.dukkanDrawer(${r.id})"><td><b>${r.name}</b></td><td class="dim">${r.zone}</td><td class="num">₺${r.tarife}</td><td class="num">${r.adet}</td><td class="num">${eFmt(r.tarife*r.adet)}</td><td class="num">${eFmt(r.komisyon)}</td><td class="num" style="color:var(--bad)">−${eFmt(r.kuryeGider)}</td><td class="num"><b style="color:var(--ok)">${eFmt(r.net)}</b></td><td class="num dim">₺${Math.round(r.net/r.adet)}</td></tr>`).join('')+
    `</tbody><tfoot><tr style="border-top:2px solid var(--line-2)"><td><b>TOPLAM</b></td><td></td><td></td><td class="num"><b>${eTot.adet}</b></td><td class="num"><b>${eFmt(eTot.tes)}</b></td><td class="num"><b>${eFmt(eTot.kom)}</b></td><td class="num" style="color:var(--bad)"><b>−${eFmt(eTot.kur)}</b></td><td class="num" style="color:var(--ok)"><b>${eFmt(eTot.net)}</b></td><td></td></tr></tfoot></table></div></div>`;
  $('#reportGrid').innerHTML = dukkanCard + cards.map(c=>`<div class="card col-${c.col}"><div class="card-h"><div class="t">${c.t}</div><span class="dim" style="font-size:11px">${c.s}</span></div><div style="padding:10px 12px 12px;flex:1;display:flex"><div class="chart" id="${c.id}" style="height:${c.h}px"></div></div></div>`).join('');

  // SLA gauge
  mkChart('r-sla').setOption({series:[{type:'gauge',startAngle:200,endAngle:-20,min:0,max:100,radius:'96%',center:['50%','72%'],
    progress:{show:true,width:14,roundCap:true,itemStyle:{color:s.ok}}, axisLine:{lineStyle:{width:14,color:[[1,s.s3]]}},
    pointer:{show:false},axisTick:{show:false},splitLine:{show:false},axisLabel:{show:false},
    anchor:{show:false}, title:{show:false},
    detail:{valueAnimation:true,fontSize:30,fontWeight:800,color:s.isLight ? '#0f172a' : '#E9EBEE',offsetCenter:[0,'-2%'],formatter:'%{value}'},
    data:[{value:94}]}]});
  // Ciro trend
  mkChart('r-rev').setOption({tooltip:{trigger:'axis',...s.tip},grid:{left:6,right:14,top:14,bottom:6,containLabel:true},
    xAxis:{type:'category',data:['10','11','12','13','14','15','16','17','18','19'],...s.axis},
    yAxis:{type:'value',...s.axis,axisLabel:{...s.axis.axisLabel,formatter:'₺{value}K'}},
    series:[{type:'line',smooth:true,symbol:'none',data:[2.1,3.4,5.2,6.0,4.1,3.2,4.8,6.4,8.1,9.2],lineStyle:{color:s.y,width:2.5},
      areaStyle:{color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:s.isLight?'rgba(217,119,6,.25)':'rgba(255,196,0,.30)'},{offset:1,color:'rgba(0,0,0,0)'}])}}]});
  // Persentil histogram
  const bins=['10','15','20','25','30','35','40','45+'], cnt=[4,11,24,31,22,14,7,3];
  mkChart('r-pct').setOption({tooltip:{trigger:'axis',...s.tip},grid:{left:6,right:14,top:30,bottom:6,containLabel:true},
    xAxis:{type:'category',data:bins,...s.axis,name:'dk',nameLocation:'end',nameGap:6},yAxis:{type:'value',...s.axis},
    series:[{type:'bar',data:cnt.map((v,i)=>({value:v,itemStyle:{color:i<4?s.info:i<6?s.warn:s.bad,borderRadius:[3,3,0,0]}})),barWidth:'62%',
      markLine:{symbol:'none',label:{color:s.tx2,fontSize:10,formatter:'{b}'},lineStyle:{color:s.tx3,type:'dashed'},
        data:[{xAxis:2,name:'P50 24dk'},{xAxis:5,name:'P90 36dk'},{xAxis:6,name:'P95 41dk'}]}}]});
  // Aşama darboğazı (bar yatay)
  mkChart('r-stage').setOption({tooltip:{trigger:'axis',...s.tip,formatter:p=>p[0].name+': <b>'+p[0].value+' dk</b>'},grid:{left:6,right:18,top:10,bottom:6,containLabel:true},
    xAxis:{type:'value',...s.axis,axisLabel:{...s.axis.axisLabel,formatter:'{value}dk'}},
    yAxis:{type:'category',data:['Teslim','Pickup→yol','Kurye→rest.','Hazırlık','Onay'],...s.axis},
    series:[{type:'bar',data:[ {value:7,itemStyle:{color:s.info}},{value:9,itemStyle:{color:s.y}},{value:5,itemStyle:{color:s.ok}},{value:14,itemStyle:{color:s.bad}},{value:2,itemStyle:{color:s.tx3}} ],barWidth:'58%',itemStyle:{borderRadius:[0,4,4,0]},
      label:{show:true,position:'right',color:s.tx2,fontSize:10,formatter:'{c}dk'}}]});
  // İptal pareto
  const cn=['Restoran kapalı','Stok yok','Müşteri iptal','Adres hatalı','Kurye yok'],cv=[34,21,15,9,6];
  let acc=0,tot=cv.reduce((a,b)=>a+b,0),cumP=cv.map(v=>Math.round((acc+=v)/tot*100));
  mkChart('r-cancel').setOption({tooltip:{trigger:'axis',...s.tip},grid:{left:6,right:30,top:14,bottom:6,containLabel:true},
    xAxis:{type:'category',data:cn,...s.axis,axisLabel:{...s.axis.axisLabel,rotate:18,fontSize:9}},
    yAxis:[{type:'value',...s.axis},{type:'value',max:100,...s.axis,axisLabel:{...s.axis.axisLabel,formatter:'{value}%'}}],
    series:[{type:'bar',data:cv,barWidth:'52%',itemStyle:{color:s.bad,borderRadius:[3,3,0,0]}},
      {type:'line',yAxisIndex:1,data:cumP,smooth:true,symbol:'circle',symbolSize:5,lineStyle:{color:s.y,width:2},itemStyle:{color:s.y}}]});
  // Heatmap saat × mahalle
  const hrs=['11','12','13','14','17','18','19','20','21'], zns=['Çapanoğlu','Cumhuriyet','Medrese','Köseoğlu','Fatih','Bahçelievler'];
  const hd=[]; for(let i=0;i<zns.length;i++)for(let j=0;j<hrs.length;j++){const base=(j>3?7:3); hd.push([j,i,Math.round(rnd(0,5)+base*(0.5+Math.random()))]);}
  mkChart('r-heat').setOption({tooltip:{...s.tip,formatter:p=>zns[p.value[1]]+' · '+hrs[p.value[0]]+':00 → <b>'+p.value[2]+' sipariş</b>'},
    grid:{left:6,right:10,top:10,bottom:22,containLabel:true},
    xAxis:{type:'category',data:hrs,...s.axis,splitArea:{show:false}},yAxis:{type:'category',data:zns,...s.axis},
    visualMap:{min:0,max:18,calculable:false,orient:'horizontal',left:'center',bottom:0,itemWidth:10,itemHeight:90,textStyle:{color:s.tx3,fontSize:9},
      inRange:{color:s.isLight ? ['#f8fafc', '#fef3c7', '#fde68a', '#f59e0b', '#d97706'] : ['#15181D','#3a3417','#7a6a14','#F2A900','#FFC400']}},
    series:[{type:'heatmap',data:hd,itemStyle:{borderColor:s.isLight ? '#ffffff' : '#0B0C0E',borderWidth:2},emphasis:{itemStyle:{borderColor:s.y,borderWidth:1.5}}}]});
  // Birim ekonomi (waterfall)
  const ue=[{n:'Sepet',v:178,c:s.ok},{n:'Yemek mly',v:-86,c:s.bad},{n:'Kurye',v:-34,c:s.bad},{n:'Komisyon',v:-21,c:s.bad},{n:'Ödeme',v:-4,c:s.bad},{n:'Katkı',v:33,c:s.y}];
  let run=0; const helper=ue.map((x,i)=>{ if(i===0||i===ue.length-1){const v=run; run+= x.v; return 0;} const base=run; run+=x.v; return x.v<0?run:base; });
  mkChart('r-unit').setOption({tooltip:{...s.tip,trigger:'axis',formatter:p=>{const x=ue[p[1]?p[1].dataIndex:p[0].dataIndex];return x.n+': <b>₺'+x.v+'</b>';}},grid:{left:6,right:12,top:14,bottom:22,containLabel:true},
    xAxis:{type:'category',data:ue.map(x=>x.n),...s.axis,axisLabel:{...s.axis.axisLabel,rotate:18,fontSize:9}},yAxis:{type:'value',...s.axis,axisLabel:{...s.axis.axisLabel,formatter:'₺{value}'}},
    series:[{type:'bar',stack:'t',itemStyle:{color:'transparent'},data:helper},
      {type:'bar',stack:'t',barWidth:'55%',data:ue.map(x=>({value:Math.abs(x.v),itemStyle:{color:x.c,borderRadius:2}})),label:{show:true,position:'top',color:s.tx2,fontSize:9,formatter:(p)=>'₺'+ue[p.dataIndex].v}}]});
  // Bölge ciro
  const zc=[['Çapanoğlu',4200],['Cumhuriyet',3850],['Köseoğlu',3100],['Fatih',2600],['Medrese',2200],['Bahçelievler',1800]].sort((a,b)=>a[1]-b[1]);
  mkChart('r-zone').setOption({tooltip:{trigger:'axis',...s.tip,formatter:p=>p[0].name+': <b>₺'+p[0].value.toLocaleString('tr')+'</b>'},grid:{left:6,right:16,top:10,bottom:6,containLabel:true},
    xAxis:{type:'value',...s.axis,axisLabel:{...s.axis.axisLabel,formatter:v=>'₺'+(v/1000)+'K'}},yAxis:{type:'category',data:zc.map(x=>x[0]),...s.axis},
    series:[{type:'bar',data:zc.map((x,i)=>({value:x[1],itemStyle:{color:i===zc.length-1?s.y:(s.isLight?'#cbd5e1':'#3a4048'),borderRadius:[0,4,4,0]}})),barWidth:'60%',label:{show:true,position:'right',color:s.tx2,fontSize:10,formatter:p=>'₺'+(p.value/1000).toFixed(1)+'K'}}]});
  // Kurye performans scatter
  const sc=D.COURIERS.slice(0,12).map(c=>[c.today, 86+(c.id*3)%14, c.earn]);
  mkChart('r-perf').setOption({tooltip:{...s.tip,formatter:p=>'Teslimat: <b>'+p.value[0]+'</b><br>Zamanında: <b>%'+p.value[1]+'</b><br>Kazanç: <b>₺'+p.value[2]+'</b>'},grid:{left:6,right:14,top:14,bottom:6,containLabel:true},
    xAxis:{type:'value',name:'teslimat',...s.axis},yAxis:{type:'value',name:'zamanında %',min:80,max:100,...s.axis},
    series:[{type:'scatter',data:sc,symbolSize:v=>8+v[2]/90,itemStyle:{color:s.y,opacity:.85,borderColor:s.isLight ? '#ffffff' : '#0B0C0E',borderWidth:1}}]});

  // Yoğun saatler × restoran (stacked bar — hangi saatte hangi restoran kaç paket)
  const PHRS=['11','12','13','14','17','18','19','20','21'], topR=D.RESTAURANTS.slice(0,4);
  const palette=[s.y,s.info,s.ok,s.purple];
  const peakSeries=topR.map((r,ri)=>({name:r.name,type:'bar',stack:'p',barWidth:'58%',itemStyle:{color:palette[ri]},
    data:PHRS.map((h,hi)=>{const base=(hi===1||hi===2||hi>=5)?6:2; return Math.round(base+((r.id*7+hi*3)%6)+(hi>4?3:0));})}));
  mkChart('r-peak').setOption({tooltip:{trigger:'axis',...s.tip,axisPointer:{type:'shadow'}},legend:{show:true,top:0,textStyle:{color:s.tx3,fontSize:9},itemWidth:9,itemHeight:9,icon:'circle'},
    grid:{left:6,right:10,top:26,bottom:6,containLabel:true},xAxis:{type:'category',data:PHRS.map(h=>h+':00'),...s.axis,axisLabel:{...s.axis.axisLabel,fontSize:9}},yAxis:{type:'value',name:'paket',...s.axis},series:peakSeries});

  // Mesafe dağılımı (km histogram)
  const dbins=['0-1','1-2','2-3','3-4','4-5','5+'], dcnt=[9,28,34,19,8,4];
  mkChart('r-dist').setOption({tooltip:{trigger:'axis',...s.tip,formatter:p=>p[0].name+' km · <b>'+p[0].value+' teslimat</b>'},grid:{left:6,right:12,top:28,bottom:6,containLabel:true},
    xAxis:{type:'category',data:dbins,...s.axis,name:'km',nameLocation:'end',nameGap:6},yAxis:{type:'value',...s.axis},
    series:[{type:'bar',data:dcnt.map((v,i)=>({value:v,itemStyle:{color:i<2?s.ok:i<4?s.y:s.bad,borderRadius:[3,3,0,0]}})),barWidth:'62%',markLine:{symbol:'none',label:{color:s.tx2,fontSize:10,formatter:'ort 2.4km'},lineStyle:{color:s.tx3,type:'dashed'},data:[{xAxis:2}]}}]});

  // Kurye hız sıralaması (km/saat, en hızlı üstte)
  const spd=D.COURIERS.slice(0,10).map(c=>{const ci=c.id,ortTes=22+(ci*3)%16;return {n:c.name,v:+(60/ortTes*(2.4+(ci%5)*0.45)).toFixed(1),tes:ortTes};}).sort((a,b)=>a.v-b.v);
  mkChart('r-speed').setOption({tooltip:{trigger:'axis',...s.tip,formatter:p=>p[0].name+': <b>'+p[0].value+' km/s</b><br>ort. teslimat '+spd[p[0].dataIndex].tes+' dk'},grid:{left:6,right:30,top:8,bottom:6,containLabel:true},
    xAxis:{type:'value',name:'km/saat',...s.axis},yAxis:{type:'category',data:spd.map(x=>x.n),...s.axis},
    series:[{type:'bar',data:spd.map((x,i)=>({value:x.v,itemStyle:{color:i===spd.length-1?s.y:(s.isLight?'#cbd5e1':'#3a4048'),borderRadius:[0,4,4,0]}})),barWidth:'62%',label:{show:true,position:'right',color:s.tx2,fontSize:10,formatter:'{c} km/s'}}]});

  setTimeout(()=>charts.forEach(c=>c.resize()),60);
}

/* ---------- diğer görünümler ---------- */
const KAYNAK=[['VIZZ App','b-y'],['Telefon','b-info'],['Yemeksepeti','b-bad'],['Web','b-mute'],['Trendyol','b-warn'],['Getir','b-ok']];
function buildGorevler(){
  const all=orders.concat([
      {id:'VZ-7744',rest:'Honey Burger House',cust:'E. Şahin',zone:'Bahçelievler',items:4,total:295,pay:'Kapıda Kart',status:'Teslim edildi',min:0,courier:'Caner T.'},
      {id:'VZ-7740',rest:'Sarı Kovan Kahvaltı',cust:'K. Öz',zone:'Köseoğlu',items:2,total:430,pay:'Online',status:'Hazırlanıyor',min:14,courier:null},
      {id:'VZ-7739',rest:'Bozok Lahmacun',cust:'A. Yıldız',zone:'Medrese',items:6,total:185,pay:'Online',status:'İptal',min:0,courier:null,vertical:'market'},
    ]);
  const pill=['Tümü','Hazırlanıyor','Atanıyor','Kurye yolda','Teslim edildi','İptal'];
  $('#v-gorevler').innerHTML = `<div class="rhead"><div><h2>Siparişler</h2><p>geçmiş ve aktif tüm siparişler — filtrele, ata, izle, dışa aktar</p></div>
    <div style="display:flex;gap:9px;align-items:center">
      <div class="selbox" style="width:auto;padding:9px 13px" onclick="VZ.toast('Tarih aralığı seç')"><svg class="ic ic-sm" viewBox="0 0 24 24" style="color:var(--tx-3);margin-right:7px"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>26 Haz 2026<svg class="ic ic-sm" viewBox="0 0 24 24" style="color:var(--tx-3)"><path d="M6 9l6 6 6-6"/></svg></div>
      <button class="btn" onclick="VZ.toast('Filtre paneli')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M4 4h16l-6 8v6l-4 2v-8L4 4Z"/></svg>Filtreler</button>
      <button class="btn btn-y" onclick="VZ.toast('CSV indiriliyor — '+${all.length}+' sipariş')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>CSV İndir</button></div></div>
    <div class="seg" style="margin-bottom:18px;flex-wrap:wrap">${pill.map((p,i)=>`<button class="${i===0?'on':''}" onclick="VZ.gorevFilter(this,'${p}')">${p}</button>`).join('')}</div>
    <div class="card"><div style="overflow:auto;max-height:calc(100vh - 230px)"><table class="grid"><thead><tr>
    <th>Sipariş</th><th>Kaynak</th><th>Restoran</th><th>Müşteri</th><th>Bölge</th><th>Durum</th><th>Kurye</th><th>Taşıma Ücr.</th><th>Ödeme</th><th>Tutar</th><th>SLA</th><th></th></tr></thead><tbody id="gorevBody">`+
    all.map((o,i)=>{const k=KAYNAK[i%KAYNAK.length];const tas=29+(i*7)%20;return `<tr data-st="${o.status}"><td><b>${o.id}</b></td><td><span class="badge ${k[1]}" style="font-size:10px">${k[0]}</span></td><td>${o.rest}</td><td>${o.cust||'—'}</td><td>${o.zone}</td>
      <td><span class="badge ${slaCls(o.status)}"><span class="dot"></span>${o.status}</span></td>
      <td>${o.courier||'<span class="dim">—</span>'}</td><td class="num">₺${tas}</td><td class="dim">${o.pay}</td><td class="num"><b>₺${o.total}</b></td>
      <td>${o.min?`<span class="num" style="color:${o.min<6?'var(--bad)':'var(--ok)'}">${o.min} dk</span>`:'<span class="dim">—</span>'}</td>
      <td><button class="btn btn-ghost btn-icon" onclick="VZ.orderDetail('${o.id}')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></button></td></tr>`;}).join('')+
    `</tbody></table></div><div style="padding:14px 22px;border-top:1px solid var(--line);font-size:12px;color:var(--tx-3)">${all.length} sipariş gösteriliyor</div></div>`;
}
function buildKuryeler(){
  $('#v-kuryeler').innerHTML = `<div class="rhead"><div><h2>Kuryeler</h2><p>${online} aktif · esnaf filo · puantaj + performans</p></div>
    <button class="btn btn-y" onclick="VZ.formModal('kurye')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Kurye Ekle</button></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:13px">`+
    D.COURIERS.map(c=>{const st=c.status==='delivering'?'busy':c.status==='online'?'on':'off';const col=c.status==='delivering'?'b-y':c.status==='online'?'b-ok':'b-mute';
    return `<div class="card" style="padding:14px;cursor:pointer" onclick="VZ.courierDrawer(${c.id})">
      <div style="display:flex;gap:11px;align-items:center"><div class="av ${st}" style="width:38px;height:38px;border-radius:11px">${c.name.split(' ').map(p=>p[0]).join('')}</div>
        <div style="flex:1"><b style="color:var(--tx);font-size:13.5px">${c.name}</b><div class="dim" style="font-size:11px;margin-top:2px">${c.zone}</div></div>
        <span class="badge ${col}">${c.statusTr}</span></div>
      <div style="display:flex;gap:14px;margin-top:13px">
        <div><div class="dim" style="font-size:10px">BUGÜN</div><div class="num" style="font-weight:700;font-size:15px">${c.today}</div></div>
        <div><div class="dim" style="font-size:10px">KAZANÇ</div><div class="num hl" style="font-weight:700;font-size:15px">₺${c.earn}</div></div>
        <div><div class="dim" style="font-size:10px">PUAN</div><div class="num" style="font-weight:700;font-size:15px">${c.rate}</div></div>
        <div><div class="dim" style="font-size:10px">KABUL</div><div class="num" style="font-weight:700;font-size:15px">%${c.accept}</div></div>
      </div></div>`;}).join('')+`</div>`;
}
function courierDrawer(id){
  closeModal();
  activeCourierId = id;
  activeDukkanId = null;
  const c=D.COURIERS.find(x=>x.id===id); const d=$('#drawer');
  const s=getThemeStyles();
  const ci=c.id, nakit=250+(ci*173)%1400, posT=300+(ci*97)%900, limit=2000, fill=Math.min(100,Math.round(nakit/limit*100));
  const kasaDur = nakit>=limit?['Limit doldu — yeni sipariş DURDU','b-bad','var(--bad)'] : nakit>=limit*0.85?['Limite yaklaşıyor','b-warn','var(--warn)'] : ['Normal','b-ok','var(--ok)'];
  const ortTes=22+(ci*3)%16, km=(1.8+(ci%6)*0.5).toFixed(1), hiz=(60/ortTes*(2.4+(ci%5)*0.45)).toFixed(1);
  d.innerHTML = `<div class="card-h" style="border-radius:0"><div class="t"><div class="av busy" style="width:34px;height:34px">${c.name.split(' ').map(p=>p[0]).join('')}</div> ${c.name}</div>
    <button class="btn btn-ghost btn-icon" onclick="VZ.closeDrawer()"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
    <div style="overflow:auto;padding:16px;flex:1">
      <div style="display:flex;gap:8px;margin-bottom:14px"><span class="badge b-ok">${c.statusTr}</span><span class="badge b-mute">📍 ${c.zone}</span><span class="badge b-y">⭐ ${c.rate}</span></div>
      <div class="kstrip" style="grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px">
        <div class="kpi"><div class="lab">Bugün</div><div class="val num">${c.today}</div></div>
        <div class="kpi"><div class="lab">Hafta Kazanç</div><div class="val num">₺${c.earn*6}</div></div>
        <div class="kpi"><div class="lab">Kabul</div><div class="val num">%${c.accept}</div></div>
      </div>
      <div class="card" style="margin-bottom:13px"><div class="card-h"><div class="t">Son 7 gün teslimat</div></div><div style="padding:10px"><div class="chart" id="dc1" style="height:140px"></div></div></div>
      <div class="card" style="margin-bottom:13px"><div class="card-h"><div class="t">Performans</div></div><div style="padding:12px 14px">
        ${[['Zamanında teslim',96,'var(--ok)'],['Kabul oranı',c.accept,'var(--y)'],['Müşteri puanı',c.rate*20,'var(--info)']].map(p=>`<div style="margin-bottom:11px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px"><span class="muted">${p[0]}</span><b class="num">${p[0]==='Müşteri puanı'?c.rate:'%'+Math.round(p[1])}</b></div><div class="bar-mini" style="height:7px"><i style="width:${p[1]}%;background:${p[2]}"></i></div></div>`).join('')}
      </div></div>
      <div class="card" style="margin-bottom:13px"><div class="card-h"><div class="t">Kasa Mutabakatı</div><span class="badge ${kasaDur[1]}"><span class="dot"></span>${kasaDur[0]}</span></div>
        <div style="padding:12px 14px">
          <div style="display:flex;gap:10px;margin-bottom:13px">
            <div style="flex:1"><div class="dim" style="font-size:10px">CEBİNDEKİ NAKİT</div><div class="num" style="font-size:17px;font-weight:800;color:${kasaDur[2]}">₺${nakit}</div></div>
            <div style="flex:1"><div class="dim" style="font-size:10px">POS TAHSİLAT</div><div class="num" style="font-size:17px;font-weight:800;color:var(--info)">₺${posT}</div></div>
            <div style="flex:1"><div class="dim" style="font-size:10px">VIZZ'E TESLİM</div><div class="num" style="font-size:17px;font-weight:800">₺${nakit}</div></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:5px"><span class="muted">Kasa limiti · ₺${limit}</span><b class="num" style="color:${kasaDur[2]}">%${fill}</b></div>
          <div class="bar-mini" style="height:8px"><i style="width:${fill}%;background:${kasaDur[2]}"></i></div>
          ${nakit>=limit?'<div style="font-size:11px;color:var(--bad);margin-top:8px">⚠️ Limit aşıldı — kurye nakit teslim edene kadar yeni sipariş alamaz</div>':''}
          <button class="btn btn-y" style="width:100%;padding:9px;margin-top:11px" onclick="VZ.toast('${c.name} kasa teslim alındı · ₺${nakit} (4 haneli kod onayı)')">Nakit Teslim Al</button>
        </div></div>
      <div class="card" style="margin-bottom:13px"><div class="card-h"><div class="t">Hız & Mesafe</div></div><div style="padding:12px 14px;display:flex;gap:10px">
        <div style="flex:1"><div class="dim" style="font-size:10px">ORT. TESLİMAT</div><div class="num" style="font-size:16px;font-weight:800">${ortTes} dk</div></div>
        <div style="flex:1"><div class="dim" style="font-size:10px">ORT. MESAFE</div><div class="num" style="font-size:16px;font-weight:800">${km} km</div></div>
        <div style="flex:1"><div class="dim" style="font-size:10px">HIZ</div><div class="num" style="font-size:16px;font-weight:800;color:var(--y)">${hiz} km/s</div></div>
      </div></div>
      <div class="card"><div class="card-h"><div class="t">Belgeler</div><span class="badge b-ok">Geçerli</span></div><div style="padding:12px 14px;font-size:12px" class="muted">Ehliyet ✓ · MYK Seviye-3 ✓ · SRC ✓ · Trafik sigortası ✓ · Vergi levhası ✓</div></div>
    </div>
    <div style="padding:13px;border-top:1px solid var(--line);display:flex;gap:8px"><button class="btn btn-y" style="flex:1" onclick="VZ.toast('${c.name} aranıyor…')">Ara</button><button class="btn" style="flex:1" onclick="VZ.toast('Mesaj gönderildi')">Mesaj</button></div>`;
  $('#scrim').classList.add('on'); d.classList.add('on');
  const ch=echarts.init(document.getElementById('dc1')); charts.push(ch);
  ch.setOption({grid:{left:4,right:8,top:12,bottom:4,containLabel:true},xAxis:{type:'category',data:['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'],...s.axis},yAxis:{type:'value',...s.axis},
    series:[{type:'bar',data:[8,11,9,13,16,19,c.today],itemStyle:{color:s.y,borderRadius:[3,3,0,0]},barWidth:'55%'}]});
  setTimeout(()=>ch.resize(),50);
}
function closeDrawer(){
  $('#scrim').classList.remove('on');
  $('#drawer').classList.remove('on');
  activeCourierId = null;
  activeDukkanId = null;
}
$('#scrim').onclick=closeDrawer;

function funnelRow(lab,v,h){return `<div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span>${lab}</span><span><b style="color:var(--ok)">${v}</b> <span class="dim">/ ${h} hedef</span></span></div><div class="bar-mini" style="width:100%"><i style="width:${Math.min(100,v/h*100)}%;background:var(--ok)"></i></div></div>`;}
function etkiRow(lab,val){return `<div style="display:flex;justify-content:space-between;align-items:center"><span class="dim" style="font-size:12.5px">${lab}</span><span style="font-weight:800;color:var(--tx)">${val}</span></div>`;}
function buildBuyume(){
  const G=D.GROWTH, f=n=>'₺'+Math.round(n).toLocaleString('tr-TR');
  const bar=(h,b,c)=>`<div class="bar-mini" style="width:130px"><i style="width:${Math.min(100,h/b*100)}%;background:${c}"></i></div>`;
  const kpi=(lab,val,sub,acc)=>`<div class="kpi${acc?' accent':''}"><div class="lab">${lab}</div><div class="val">${val}</div><div class="sub ${acc?'':'flat'}">${sub}</div></div>`;
  const row=k=>`<tr><td><b>${k.ikon} ${k.ad}</b></td><td><span class="badge ${k.tip==='kurye'?'b-y':'b-info'}">${k.tip==='kurye'?'Kurye':'İşletme'}</span></td><td class="dim" style="max-width:360px;font-size:11.5px">${k.desc}</td><td class="num" style="white-space:nowrap">${f(k.harcanan)} <span class="dim">/ ${f(k.butce)}</span><div style="margin-top:5px">${bar(k.harcanan,k.butce,k.harcanan/k.butce>.8?'var(--bad)':'var(--y)')}</div></td><td><div class="sw ${k.aktif?'on':''}" onclick="this.classList.toggle('on');VZ.toast('${k.ikon} <b>${k.ad}</b> '+(this.classList.contains('on')?'açıldı':'kapatıldı')+' · prototip')"><i></i></div></td></tr>`;
  $('#v-buyume').innerHTML=`<div class="rhead"><div><h2>Büyüme & Rakipten Kazanım</h2><p>${G.rakip} şehirde <b style="color:var(--bad)">%${G.rakipPay}</b> — kurye ödülleri + işletme teşvikleriyle pay al</p></div>
    <button class="btn btn-y" onclick="VZ.formModal('kampanya')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Yeni Kampanya</button></div>
    <div class="kstrip" style="grid-template-columns:repeat(4,1fr);margin-bottom:14px">
      ${kpi('VIZZ pazar payı','%'+G.vizzPay,'▲ hedef %25 · '+G.rakip+' %'+G.rakipPay)}
      ${kpi('Bu ay geçen dükkan',G.gecenDukkanAy+'<small> /'+G.hedefDukkanAy+'</small>',G.rakip+"'dan kazanıldı")}
      ${kpi('Bu ay geçen kurye',G.gecenKuryeAy+'<small> /'+G.hedefKuryeAy+'</small>',G.rakip+"'dan kazanıldı")}
      ${kpi('Teşvik gideri (ay)',f(G.toplamHarcanan),'bütçe '+f(G.toplamButce),true)}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
      <div class="card"><div class="card-h"><div class="t">Rakipten Kazanım — ${G.rakip}</div><span class="badge b-bad">%${G.rakipPay} onlarda</span></div>
        <div style="padding:14px 16px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px"><span style="color:var(--y);font-weight:700">VIZZ %${G.vizzPay}</span><span class="dim">${G.rakip} %${G.rakipPay}</span></div>
          <div class="bar-mini" style="width:100%;height:14px"><i style="width:${G.vizzPay}%;background:var(--y)"></i></div>
          <div style="margin-top:16px;display:grid;gap:13px">${funnelRow('Dükkan geçişi (bu ay)',G.gecenDukkanAy,G.hedefDukkanAy)}${funnelRow('Kurye geçişi (bu ay)',G.gecenKuryeAy,G.hedefKuryeAy)}</div>
          <div class="hint" style="margin-top:14px">Hedef: 6 ayda pazar payını <b>%25</b>'e çıkar — ayda ${G.hedefDukkanAy} dükkan + ${G.hedefKuryeAy} kurye geçişi.</div></div></div>
      <div class="card"><div class="card-h"><div class="t">Maliyet & Etki</div><span class="dim" style="font-size:11px">teşvik → econ peteğine bağlı</span></div>
        <div style="padding:16px;display:grid;gap:13px">
          ${etkiRow('Aktif kampanya',G.kampanyalar.filter(k=>k.aktif).length+' / '+G.kampanyalar.length)}
          ${etkiRow('Toplam teşvik gideri (ay)',f(G.toplamHarcanan))}
          ${etkiRow('Kazanım başına maliyet (CAC)',f(G.toplamHarcanan/(G.gecenDukkanAy+G.gecenKuryeAy)))}
          ${etkiRow('Sipariş başı ek maliyet','~₺'+(G.toplamHarcanan/30/382).toFixed(1))}
          <div class="hint">Teşvikler Finans'ta gider olarak işlenir, Dükkan Ekonomisi net kârından düşülür — <b>hepsi tek motordan</b>.</div></div></div></div>
    ${(()=>{const e=G.rewardEcon(),m=n=>'₺'+(Math.round(n*10)/10).toLocaleString('tr-TR');
      const c=(l,v,s,col)=>`<div style="flex:1;min-width:115px;background:var(--s2);border:1px solid var(--line);border-radius:12px;padding:11px 13px"><div style="font-size:11px;color:var(--tx-3)">${l}</div><div style="font-size:19px;font-weight:800;color:${col||'var(--tx)'};margin-top:3px">${v}</div><div style="font-size:10px;color:var(--tx-3);margin-top:1px">${s}</div></div>`;
      return `<div class="card" style="margin-bottom:14px"><div class="card-h"><div class="t">🎁 Ödül Motoru — Maliyet (sahip görünümü)</div><span class="badge b-ok">net'in ~%${Math.round((1-e.netPct)*100)}'i · sürdürülebilir</span></div>
      <div style="padding:13px 15px">
        <div style="font-size:12px;color:var(--tx-2);margin-bottom:12px;line-height:1.5"><b style="color:var(--y)">Model:</b> her teslimat <b>+₺2-4 anında bonus</b> · <b>%0.1 jackpot ₺30</b> · hedefler (100 paket → +₺50, 250 → +₺150). Kurye'ye oran/şeffaflık gösterilmez — tek "Şanslı Teslimat" butonu + hedef barları.</div>
        <div style="display:flex;gap:9px;flex-wrap:wrap;margin-bottom:12px">
          ${c('Ort. net kâr/teslimat',m(e.avgNet),'tek motordan','var(--ok)')}
          ${c('Anında bonus','~'+m(e.miniAvg),'2-4₺ ort./teslimat','var(--y)')}
          ${c('Hedef primleri','~'+m(e.hedefEV),'100 teslimat ufku')}
          ${c('Jackpot maliyeti',m(e.jackpotEV),'%0.1 × ₺30')}
          ${c('Toplam ödül gideri',m(e.evTeslimat),'teslimat başı','var(--bad)')}
          ${c('Ödül sonrası net',m(e.netSonra),'%'+Math.round(e.netPct*100)+' bize kalır','var(--ok)')}
        </div>
        <div class="ebox" style="background:var(--s1);border:1px solid var(--line);border-radius:12px;padding:11px 14px;font-size:12px">
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span class="dim">Günlük ödül gideri (${e.totAdet} teslimat)</span><b>${m(e.gunlukGider)}</b></div>
          <div style="display:flex;justify-content:space-between;padding:3px 0"><span class="dim">Hedefler</span><b>50→₺25 · 100→₺50 · 250→₺150 · 500→₺350</b></div>
          <div class="hint" style="margin-top:7px">Anında bonus motivasyonu yüksek tutar; jackpot heyecan katar; hedefler kuryeyi bağlar. Toplam gider net kârın ~%${Math.round((1-e.netPct)*100)}'i → <b>sürdürülebilir</b>. Parametreler operasyondan ayarlanır.</div>
        </div>
      </div></div>`;})()}
    <div class="card"><div class="card-h"><div class="t">Aktif Kampanyalar</div><span class="badge b-y">${G.kampanyalar.filter(k=>k.aktif).length} aktif</span></div>
      <div style="overflow:auto"><table class="grid"><thead><tr><th>Kampanya</th><th>Hedef</th><th>Açıklama</th><th>Bütçe kullanımı</th><th>Durum</th></tr></thead><tbody>${G.kampanyalar.map(row).join('')}</tbody></table></div></div>`;
}
function buildFinans(){
  $('#v-finans').innerHTML=`<div class="rhead"><div><h2>Finans & Mutabakat</h2><p>Cuma ödeme · COD kasa · komisyon — üçlü cari</p></div>
    <button class="btn btn-y" onclick="VZ.toast('💸 Cuma ödeme listesi onaylandı — IBAN aktarımı başladı')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>Tümünü Onayla & Öde</button></div>
    ${(()=>{const de=D.econDukkan();const T=de.reduce((a,r)=>({g:a.g+r.gelir,kom:a.kom+r.komisyon,kur:a.kur+r.kuryeGider,net:a.net+r.net,ad:a.ad+r.adet}),{g:0,kom:0,kur:0,net:0,ad:0});const k=n=>(n/1000).toFixed(1)+'K';
      return `<div class="kstrip" style="grid-template-columns:repeat(4,1fr);margin-bottom:14px">
      <div class="kpi"><div class="lab">Bugün VIZZ geliri</div><div class="val">₺<span class="num">${k(T.g)}</span></div><div class="sub flat">${T.ad} sipariş · teslimat+komisyon</div></div>
      <div class="kpi"><div class="lab">Kurye hakedişi (bugün)</div><div class="val">₺<span class="num">${k(T.kur)}</span></div><div class="sub flat">${D.COURIERS.length} kurye</div></div>
      <div class="kpi"><div class="lab">Yemek komisyonu · %8</div><div class="val">₺<span class="num">${k(T.kom)}</span></div><div class="sub up">tek motordan</div></div>
      <div class="kpi accent"><div class="lab">Net kâr (bugün, vergi sonrası)</div><div class="val">₺<span class="num">${k(T.net)}</span></div><div class="sub">Dükkan Ekonomisi ile aynı</div></div></div>`;})()}
    <div class="card"><div class="card-h"><div class="t">Cuma Ödeme Listesi — bu hafta</div><span class="badge b-y">Esnaf kurye hakedişi</span></div>
    <div style="overflow:auto;max-height:calc(100vh - 320px)"><table class="grid"><thead><tr><th>Kurye</th><th>Teslimat</th><th>Paket başı</th><th>Prim</th><th>Tahsil nakit</th><th>Net (Cuma)</th><th>Durum</th></tr></thead><tbody>`+
    D.COURIERS.map(c=>{const pkt=c.today*6*22,prim=c.today>12?180:c.today>8?90:0,nakit=c.id%2?c.today*6*40:0;return `<tr><td><b>${c.name}</b></td><td class="num">${c.today*6}</td><td class="num">₺${pkt}</td><td class="num">₺${prim}</td><td class="num">${nakit?'₺'+nakit+' <span class="dim">(mahsup)</span>':'—'}</td><td class="num"><b style="color:var(--y)">₺${pkt+prim}</b></td><td><span class="badge ${c.id%4===0?'b-warn':'b-ok'}">${c.id%4===0?'Bekliyor':'Hazır'}</span></td></tr>`;}).join('')+
    `</tbody></table></div></div>`;
}
function buildBolgeler(){
  $('#v-bolgeler').innerHTML=`<div class="rhead"><div><h2>Bölge Yönetimi</h2><p>${Y.zones.length} mahalle · kapsama · bölge bazlı yoğunluk & fiyat</p></div>
    <button class="btn btn-y" onclick="VZ.formModal('bolge')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M9 3 4 5v16l5-2 6 2 5-2V3l-5 2-6-2Z"/></svg>Yeni Bölge Çiz</button></div>
    <div class="card"><div style="overflow:auto"><table class="grid"><thead><tr><th>Mahalle</th><th>Bugün sipariş</th><th>Aktif kurye</th><th>Ort. süre</th><th>Yoğunluk</th><th>Fiyat çarpanı</th><th>Durum</th></tr></thead><tbody>`+
    Y.zones.map((z,i)=>{const ord=Math.round(rnd(8,40)),kur=Math.round(rnd(0,4)),sure=Math.round(rnd(22,38)),yog=Math.round(rnd(20,100));return `<tr><td><b>${z.n}</b></td><td class="num">${ord}</td><td class="num">${kur}</td><td class="num">${sure} dk</td><td><div class="bar-mini" style="width:90px"><i style="width:${yog}%;background:${yog>70?'var(--bad)':yog>40?'var(--y)':'var(--ok)'}"></i></div></td><td class="num">×${(1+i%3*0.1).toFixed(1)}</td><td><span class="badge b-ok">Aktif</span></td></tr>`;}).join('')+
    `</tbody></table></div></div>`;
}
let ayarTab='operasyonel';
function buildAyarlar(){
  const sw=(lab,desc,on)=>`<div class="setrow"><div><div class="lab">${lab}</div>${desc?`<div class="desc">${desc}</div>`:''}</div><div class="swwrap"><span class="st ${on?'on':''}">${on?'AÇIK':'KAPALI'}</span><div class="sw ${on?'on':''}" onclick="VZX.sw(this)"><i></i></div></div></div>`;
  const sel=(lab,val,hint)=>`<div class="field"><label>${lab}</label><div class="selbox" onclick="VZX&&VZX.toast('${lab}')">${val}<svg class="ic ic-sm" viewBox="0 0 24 24" style="color:var(--tx-3)"><path d="M6 9l6 6 6-6"/></svg></div>${hint?`<div class="hint">${hint}</div>`:''}</div>`;
  const inpRow=(lab,desc,val,suf)=>`<div class="setrow"><div><div class="lab">${lab}</div>${desc?`<div class="desc">${desc}</div>`:''}</div><div style="display:flex;align-items:center;gap:8px"><div class="inp" style="width:90px;text-align:center">${val}</div>${suf?`<span class="dim">${suf}</span>`:''}</div></div>`;
  let body='';
  if(ayarTab==='operasyonel'){
    body=`<div class="setcard"><div class="sectitle">Mola Kuralları</div>
      ${sw('Kuryeler kendileri molaya çıkabilir mi?','Hayır seçilirse kuryeleri ancak kurye şefleri ve yöneticiler molaya çıkarabilir.',true)}
      ${inpRow('Mola süresi','Bir kuryenin toplam günlük mola hakkı.','30','dk')}
      ${sw('Yoğun saatte mola talebi yapılabilir mi?','Kapalıyken yoğun saat aralıklarında molaya çıkılamaz.',false)}
      <div class="setrow"><div style="flex:1"><div class="lab">Yoğun saat aralıkları</div><div class="desc">Mola yasağının uygulanacağı saatler.</div>
        <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">
          <span class="badge b-warn" style="padding:8px 14px">Öğle · 11:30 – 14:00</span>
          <span class="badge b-warn" style="padding:8px 14px">Akşam · 19:00 – 22:00</span></div></div></div></div>
    <div class="setcard"><div class="sectitle">Sipariş Kuralları</div>
      ${sw('Teslim alırken fiş fotoğrafı zorunlu','Kurye paketi restorandan alırken fişin fotoğrafını çekmek zorunda.',true)}
      ${sw('Restoran siparişe telefon eklemek zorunda','Müşteri telefonu olmadan sipariş açılamaz.',false)}
      ${sw('Kurye almadan adres değiştirilebilsin','Restoran, kurye paketi almadan önce teslim adresini düzeltebilir.',true)}</div>
    <div class="setcard"><div class="sectitle">Çalışma Aralığı</div>
      ${sel('Bayi çalışma saatleri','00:00 – 23:59','Operasyonun açık olduğu saat aralığı.')}</div>
    <button class="btn btn-y" style="width:100%;padding:14px" onclick="VZX&&VZX.save('Operasyonel ayarlar kaydedildi')">Kaydet</button>`;
  } else if(ayarTab==='konum'){
    body=`<div class="setcard"><div class="sectitle">Görünürlük</div>
      ${sw('Firmalar kurye konumunu görebilsin','Restoran paneli canlı kurye konumunu haritada görebilir.',true)}
      ${sel('Kuryeler adresi ne zaman görsün?','Yola çıktıktan sonra','Müşteri mahremiyeti: adres erken görünmez. (Atandığında · Pakete giderken · Yola çıktıktan sonra)')}
      ${inpRow('Konum güncelleme sıklığı','Kurye GPS konumunun sunucuya gönderilme aralığı.','5','sn')}
      ${sw('Geofence teslim doğrulama','Teslim onayı yalnızca kurye müşteri adresine yakınken geçerli — sahte teslimi engeller.',true)}</div>
    <button class="btn btn-y" style="width:100%;padding:14px" onclick="VZX&&VZX.save('Konum ayarları kaydedildi')">Kaydet</button>`;
  } else {
    body=`<div class="setcard"><div class="sectitle">Komisyon & Ödeme</div>
      ${inpRow('VIZZ komisyon oranı','Yemek dikeyinde restoran cirosundan kesilen oran.','8','%')}
      ${sel('Kurye ödeme günü','Cuma 18:00','Haftalık hakediş bu gün IBAN’a aktarılır.')}
      ${inpRow('COD nakit limiti','Kuryenin üzerinde taşıyabileceği max tahsilat.','2.000','₺')}
      ${sw('Otomatik hakediş hesapla','Hafta sonu paket başı + prim − iade otomatik hesaplanır.',true)}
      ${sw('e-Fatura entegrasyonu','Komisyon faturaları GİB üzerinden otomatik kesilir.',false)}</div>
    <button class="btn btn-y" style="width:100%;padding:14px" onclick="VZX&&VZX.save('Mali ayarlar kaydedildi')">Kaydet</button>`;
  }
  $('#v-ayarlar').innerHTML=`<div class="rhead"><div><h2>Ayarlar</h2><p>kuryeler ve restoranlar için operasyonel kurallar, konum ve mali parametreler</p></div></div>
    <div class="tabs">${[['operasyonel','Operasyonel Ayarlar'],['konum','Konum Ayarları'],['mali','Mali Ayarlar']].map(t=>`<button class="${t[0]===ayarTab?'on':''}" onclick="VZ.ayarTab('${t[0]}')">${t[1]}</button>`).join('')}</div>${body}`;
}

/* ---------- DÜKKANLAR (restoranlar) ---------- */
function rfin(r){
  const s=r.id;
  const paket=20+(s*11)%42;                       // bugün paket/siparis
  const avg=110+(s*19)%90;                         // ort sepet
  const ciro=paket*avg;
  const komOran=[8,10,7,9,8,10,7,9][s%8]/100;      // komisyon orani
  const komisyon=Math.round(ciro*komOran);
  const iade=Math.round(ciro*(0.01+(s%3)*0.01));
  const hakedis=ciro-komisyon-iade;                // net hakedis (cari)
  const haz=(parseInt(r.time)||20)+(s%6);          // ort hazirlik
  const durum=paket>50?['Yoğun','b-y']:['Aktif','b-ok'];
  return {paket,avg,ciro,komOran,komisyon,iade,hakedis,haz,durum};
}
function buildDukkanlar(){
  const fins=D.RESTAURANTS.map(r=>({r,f:rfin(r)}));
  const totalCiro=fins.reduce((a,x)=>a+x.f.ciro,0), totalKom=fins.reduce((a,x)=>a+x.f.komisyon,0);
  const totalPaket=fins.reduce((a,x)=>a+x.f.paket,0), aktif=fins.filter(x=>x.f.durum[0]!=='Kapalı').length;
  $('#v-dukkanlar').innerHTML=`<div class="rhead"><div><h2>Dükkanlar</h2><p>${D.RESTAURANTS.length} işletme · Yozgat · paket, ciro, komisyon, cari hakediş</p></div>
    <button class="btn btn-y" onclick="VZ.formModal('dukkan')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Dükkan Ekle</button></div>
   <div class="kstrip" style="grid-template-columns:repeat(4,1fr);margin-bottom:14px">
     <div class="kpi"><div class="lab">Toplam dükkan</div><div class="val num">${D.RESTAURANTS.length}</div><div class="sub flat">${aktif} aktif</div></div>
     <div class="kpi"><div class="lab">Bugünkü toplam ciro</div><div class="val">₺<span class="num">${(totalCiro/1000).toFixed(1)}K</span></div><div class="sub up">▲ %14 dün</div></div>
     <div class="kpi accent"><div class="lab">VIZZ komisyon</div><div class="val">₺<span class="num">${(totalKom/1000).toFixed(1)}K</span></div><div class="sub">ort %8.5</div></div>
     <div class="kpi"><div class="lab">Toplam paket</div><div class="val num">${totalPaket}</div><div class="sub up">▲ bugün</div></div></div>
   <div class="card"><div style="overflow:auto;max-height:calc(100vh - 250px)"><table class="grid"><thead><tr>
     <th>Dükkan</th><th>Kategori</th><th>Bölge</th><th>Bugün paket</th><th>Ciro</th><th>Komisyon</th><th>Net hakediş (cari)</th><th>Ort. hazırlık</th><th>Puan</th><th>Durum</th><th></th></tr></thead><tbody>`+
     fins.map(({r,f})=>`<tr style="cursor:pointer" onclick="VZ.dukkanDrawer(${r.id})">
       <td><div style="display:flex;align-items:center;gap:10px"><img src="${D.IMG(r.cover)}" onerror="VIZZ.imgFallback(this,'${r.cover}')" style="width:30px;height:30px;border-radius:8px;object-fit:cover;flex:none"><b>${r.name}</b></div></td>
       <td>${r.cat}</td><td>${r.zone}</td><td class="num"><b>${f.paket}</b></td>
       <td class="num"><b>₺${f.ciro.toLocaleString('tr')}</b></td>
       <td class="num">₺${f.komisyon.toLocaleString('tr')} <span class="dim">%${Math.round(f.komOran*100)}</span></td>
       <td class="num"><b style="color:var(--ok)">₺${f.hakedis.toLocaleString('tr')}</b></td>
       <td class="num">${f.haz} dk</td><td class="num">${r.rate}</td>
       <td><span class="badge ${f.durum[1]}"><span class="dot"></span>${f.durum[0]}</span></td>
       <td><svg class="ic ic-sm" viewBox="0 0 24 24" style="color:var(--tx-3)"><path d="M9 18l6-6-6-6"/></svg></td></tr>`).join('')+
     `</tbody></table></div></div>`;
}
function dukkanDrawer(id){
  activeCourierId = null;
  activeDukkanId = id;
  const r=D.RESTAURANTS.find(x=>x.id===id); const f=rfin(r); const d=$('#drawer');
  const s=getThemeStyles();
  const items=r.menu.map((m,i)=>({n:m[0],c:Math.max(1,Math.round(f.paket*(0.45-i*0.09)))})).sort((a,b)=>b.c-a.c).slice(0,4);
  const maxc=Math.max(...items.map(x=>x.c),1);
  d.innerHTML=`<div class="card-h" style="border-radius:0"><div class="t"><img src="${D.IMG(r.cover)}" onerror="VIZZ.imgFallback(this,'${r.cover}')" style="width:32px;height:32px;border-radius:9px;object-fit:cover"> ${r.name}</div>
    <button class="btn btn-ghost btn-icon" onclick="VZ.closeDrawer()"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
   <div style="overflow:auto;padding:16px;flex:1">
     <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap"><span class="badge ${f.durum[1]}">${f.durum[0]}</span><span class="badge b-mute">${r.cat}</span><span class="badge b-mute">📍 ${r.zone}</span><span class="badge b-y">★ ${r.rate}</span></div>
     <div class="kstrip" style="grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
       <div class="kpi"><div class="lab">Bugün paket</div><div class="val num">${f.paket}</div></div>
       <div class="kpi"><div class="lab">Bugün ciro</div><div class="val">₺<span class="num">${(f.ciro/1000).toFixed(1)}K</span></div></div>
       <div class="kpi"><div class="lab">Komisyon</div><div class="val">₺<span class="num">${f.komisyon}</span></div></div>
       <div class="kpi"><div class="lab">Ort. hazırlık</div><div class="val"><span class="num">${f.haz}</span><small> dk</small></div></div></div>
     <div class="card" style="margin-bottom:13px"><div class="card-h"><div class="t">Son 7 gün ciro</div></div><div style="padding:10px"><div class="chart" id="dk1" style="height:140px"></div></div></div>
     <div class="card" style="margin-bottom:13px"><div class="card-h"><div class="t">En çok satan</div></div><div style="padding:12px 14px">
       ${items.map(it=>`<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px"><span class="muted">${it.n}</span><b class="num">${it.c} adet</b></div><div class="bar-mini" style="height:7px"><i style="width:${Math.round(it.c/maxc*100)}%"></i></div></div>`).join('')}</div></div>
     <div class="card"><div class="card-h"><div class="t">Cari Hesap (bugün)</div></div><div style="padding:10px 14px 12px;font-size:12.5px">
       <div style="display:flex;justify-content:space-between;padding:5px 0"><span class="muted">Brüt ciro</span><b class="num">₺${f.ciro.toLocaleString('tr')}</b></div>
       <div style="display:flex;justify-content:space-between;padding:5px 0"><span class="muted">VIZZ komisyon (%${Math.round(f.komOran*100)})</span><b class="num" style="color:var(--bad)">−₺${f.komisyon.toLocaleString('tr')}</b></div>
       <div style="display:flex;justify-content:space-between;padding:5px 0"><span class="muted">İade / iptal</span><b class="num" style="color:var(--bad)">−₺${f.iade.toLocaleString('tr')}</b></div>
       <div style="display:flex;justify-content:space-between;padding:9px 0 2px;border-top:1px dashed var(--line-2);margin-top:4px"><b>Net hakediş</b><b class="num" style="color:var(--ok);font-size:16px">₺${f.hakedis.toLocaleString('tr')}</b></div></div></div>
   </div>
   <div style="padding:13px;border-top:1px solid var(--line);display:flex;gap:8px"><button class="btn btn-y" style="flex:1" onclick="VZ.toast('${r.name} menüsü')">Menüyü Gör</button><button class="btn" style="flex:1" onclick="VZ.toast('${r.name} aranıyor…')">Ara</button></div>`;
  $('#scrim').classList.add('on'); d.classList.add('on');
  const ch=echarts.init(document.getElementById('dk1')); charts.push(ch);
  ch.setOption({grid:{left:4,right:10,top:12,bottom:4,containLabel:true},xAxis:{type:'category',data:['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'],...s.axis},yAxis:{type:'value',...s.axis,axisLabel:{...s.axis.axisLabel,formatter:v=>'₺'+(v/1000).toFixed(0)+'K'}},
    series:[{type:'bar',data:[.7,.85,.8,.95,1,1.2,1.1].map(k=>Math.round(f.ciro*k)),itemStyle:{color:s.y,borderRadius:[3,3,0,0]},barWidth:'55%'}]});
  setTimeout(()=>ch.resize(),50);
}

/* ---------- OTOMASYON (kural+skor motoru · güven skoru · anomali) ---------- */
function ctrust(c){
  const i=c.id;
  const onTime=84+(i*3)%15;                 // zamanında teslim %
  const gps=80+(i*13)%20;                   // GPS/rota tutarlılık %
  let cancel=(i*7)%5;                        // kabul sonrası hızlı iptal
  const accept=c.accept, rate=+c.rate;
  const penalty=localStorage.getItem('vizz_courier_penalty_demo')==='true' && i===1;
  if(penalty) cancel=Math.max(cancel,4);
  let trust=Math.round(0.30*onTime+0.30*accept+0.20*(rate*20)+0.20*gps - cancel*6 - (gps<88?(88-gps)*0.5:0));
  if(penalty) trust-=15;
  trust=Math.max(48,Math.min(98,trust));
  const flags=[];
  if(cancel>=3) flags.push('kabul→iptal '+cancel+'×');
  if(gps<86) flags.push('GPS '+(100-gps)+'% sapma');
  if(accept<85) flags.push('düşük kabul %'+accept);
  if(penalty) flags.unshift('görev reddi → sıra sonu');
  const lvl=trust>=85?['Güvenilir','b-ok']:trust>=72?['İzleniyor','b-warn']:['Riskli','b-bad'];
  return {trust,onTime,gps,cancel,accept,rate,flags,lvl,penalty};
}
let otoBuilt=false;
function buildOtomasyon(){
  const s=getThemeStyles();
  const scored=D.COURIERS.map(c=>({c,s:ctrust(c)})).sort((a,b)=>a.s.trust-b.s.trust);
  const flagged=scored.filter(x=>x.s.flags.length);
  const f0=flagged[0]?.c.name||'Mehmet K.', f1=flagged[1]?.c.name||'Okan V.', f2=flagged[2]?.c.name||'Serkan O.';
  const decisions=[
   {t:'19:24',tag:'Sıra-sonu',tc:'b-bad',d:`VZ-7748 · kurye reddetti → kuyruk sonuna alındı, en yakın 2. kuryeye teklif`,r:'kural: red → ceza'},
   {t:'19:21',tag:'Eskalasyon',tc:'b-warn',d:'VZ-7743 · kalan SLA 4 dk → süpervizöre bildirim + öncelik +1',r:'SLA < 5 dk'},
   {t:'19:18',tag:'Yeniden ata',tc:'b-info',d:`${f0} arıza beyanı ("lastik") → görev Caner T.'ye taşındı, güven skoru gözden geçir`,r:'arıza → reassign'},
   {t:'19:12',tag:'Soğuk zincir',tc:'b-y',d:'VZ-M207 Market · termal sepetli en yakın kuryeye yönlendirildi',r:'market SLA 15-25 dk'},
   {t:'19:05',tag:'Bölge dengele',tc:'b-ok',d:'Çapanoğlu yoğunluk +40% → 2 boş kurye otomatik bölgeye kaydırıldı',r:'yük dengeleme'},
   {t:'18:58',tag:'Otomatik ata',tc:'b-mute',d:'VZ-7746 · en yakın + düşük yük → Emre B. (gerekçe loglandı)',r:'skor motoru'},
  ];
  const radar=[
   {sev:'b-bad',sevT:'Yüksek',ttl:'İşi sallama şüphesi',who:f0,d:'Kabul→iptal 90 sn içinde ×3, "lastik patladı" beyanı ama GPS 11 dk sabit',act:'Görüşme aç',id:flagged[0]?.c.id},
   {sev:'b-bad',sevT:'Yüksek',ttl:'Geofence dışı teslim',who:'VZ-7740',d:'Teslim onayı müşteri adresine 280 m uzakta verildi — sahte teslim riski',act:'İncele'},
   {sev:'b-warn',sevT:'Orta',ttl:'Hareketsizlik',who:f1,d:'"Yolda" durumunda 7 dk konum değişmedi (beklenen rota 1.2 km)',act:'Uyar',id:flagged[1]?.c.id},
   {sev:'b-warn',sevT:'Orta',ttl:'Mola ihlali',who:f2,d:'Mola süresini 2× aştı (48 dk / hedef 20 dk)',act:'Bildir',id:flagged[2]?.c.id},
  ];
  $('#v-otomasyon').innerHTML=`<div class="rhead"><div><h2>Operasyon Otomasyonu</h2><p>kural + skor motoru · açıklanabilir kararlar · kurye güven skoru + anomali radarı</p></div>
    <div style="display:flex;gap:9px;align-items:center"><span class="badge b-ok"><span class="dot pulse"></span>Motor çalışıyor</span><button class="btn" onclick="VZ.oto('Motor duraklatıldı — atamalar manuel moda geçti')">Motoru Duraklat</button></div></div>
   <div class="kstrip" style="grid-template-columns:repeat(5,1fr);margin-bottom:14px">
     <div class="kpi"><div class="lab">Bugün otomasyon kararı</div><div class="val num">148</div><div class="sub up">▲ %12 dün</div></div>
     <div class="kpi accent"><div class="lab">Otomatik atama oranı</div><div class="val">%<span class="num">92</span></div><div class="sub flat">manuel %8</div></div>
     <div class="kpi"><div class="lab">Ort. atama süresi</div><div class="val"><span class="num">38</span><small> sn</small></div><div class="sub up">▼ hedef altı</div></div>
     <div class="kpi"><div class="lab">SLA eskalasyonu</div><div class="val num">6</div><div class="sub flat">otomatik müdahale</div></div>
     <div class="kpi"><div class="lab">Yakalanan anomali</div><div class="val num" style="color:var(--bad)">${radar.length}</div><div class="sub down">güven motoru</div></div></div>
   <div style="display:grid;grid-template-columns:1.45fr 1fr;gap:14px;margin-bottom:14px">
     <div class="card"><div class="card-h"><div class="t"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/></svg> Canlı Otomasyon Kararları</div><span class="dim" style="font-size:11px">her karar gerekçe loglu</span></div>
       <div style="padding:6px 14px 12px;max-height:330px;overflow:auto">${decisions.map(x=>`<div style="display:flex;gap:11px;padding:10px 0;border-bottom:1px solid var(--line)">
         <div class="num dim" style="font-size:11px;min-width:34px;padding-top:1px">${x.t}</div>
         <div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:7px;margin-bottom:3px"><span class="badge ${x.tc}" style="font-size:10px">${x.tag}</span><span class="dim" style="font-size:10.5px">${x.r}</span></div>
           <div style="font-size:12.5px;color:var(--tx-2);line-height:1.4">${x.d}</div></div></div>`).join('')}</div>
       <div style="padding:4px 14px 14px"><div class="t" style="font-size:12px;margin-bottom:6px;color:var(--tx-3)">Karar tipleri · bugün</div><div class="chart" id="otoDonut" style="height:160px"></div></div></div>
     <div class="card" style="border-color:rgba(255,90,82,.22)"><div class="card-h"><div class="t"><svg class="ic ic-sm" viewBox="0 0 24 24" style="color:var(--bad)"><path d="M12 2 2 7v6c0 5 4 8 10 9 6-1 10-4 10-9V7L12 2Z"/><path d="M12 8v5M12 16h.01"/></svg> Anomali & Sahtekârlık Radarı</div><span class="badge b-bad" style="font-size:10px">${radar.length} aktif</span></div>
       <div style="padding:8px 12px 12px;display:flex;flex-direction:column;gap:9px">${radar.map(x=>`<div style="border:1px solid var(--line);border-radius:11px;padding:11px 12px;background:var(--s1)">
         <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px"><b style="font-size:12.5px;color:var(--tx)">${x.ttl}</b><span class="badge ${x.sev}" style="font-size:9.5px">${x.sevT}</span></div>
         <div style="font-size:11.5px;color:var(--tx-2);line-height:1.45;margin-bottom:8px">${x.d}</div>
         <div style="display:flex;align-items:center;justify-content:space-between"><span class="dim" style="font-size:11px">› ${x.who}</span>${x.id?`<button class="btn btn-icon" style="width:auto;height:28px;padding:0 11px;font-size:11px" onclick="VZ.courierDrawer(${x.id})">${x.act}</button>`:`<button class="btn btn-icon" style="width:auto;height:28px;padding:0 11px;font-size:11px" onclick="VZ.oto('${x.ttl} · ${x.who} → inceleme açıldı')">${x.act}</button>`}</div></div>`).join('')}</div></div></div>
   <div class="card"><div class="card-h"><div class="t"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-4Z"/><path d="M9 12l2 2 4-4"/></svg> Kurye Güven Skoru</div><span class="dim" style="font-size:11px">en riskli üstte · GPS + kabul + zamanında + iptal sinyalleri</span></div>
     <div style="overflow:auto;max-height:calc(100vh - 250px)"><table class="grid"><thead><tr><th>Kurye</th><th>Güven skoru</th><th>Zamanında</th><th>Kabul</th><th>GPS tutarlılık</th><th>Şüpheli iptal</th><th>Sinyaller</th><th>Durum</th><th></th></tr></thead><tbody>`+
     scored.map(({c,s:t})=>{const bc=t.trust>=85?'var(--ok)':t.trust>=72?'var(--y)':'var(--bad)';return `<tr style="cursor:pointer" onclick="VZ.courierDrawer(${c.id})">
       <td><div style="display:flex;align-items:center;gap:9px"><div class="av ${c.status==='delivering'?'busy':c.status==='online'?'on':'off'}">${c.name.split(' ').map(p=>p[0]).join('')}</div><b>${c.name}</b></div></td>
       <td><div style="display:flex;align-items:center;gap:9px;min-width:120px"><div class="bar-mini" style="flex:1;height:7px"><i style="width:${t.trust}%;background:${bc}"></i></div><b class="num" style="color:${bc};min-width:24px">${t.trust}</b></div></td>
       <td class="num">%${t.onTime}</td><td class="num">%${t.accept}</td>
       <td class="num" style="color:${t.gps<86?'var(--warn)':'var(--tx-2)'}">%${t.gps}</td>
       <td class="num" style="color:${t.cancel>=3?'var(--bad)':'var(--tx-2)'}">${t.cancel}</td>
       <td>${t.flags.length?t.flags.slice(0,2).map(fl=>`<span class="badge b-bad" style="font-size:9.5px;margin:1px 2px 1px 0">${fl}</span>`).join(''):'<span class="dim">temiz</span>'}</td>
       <td><span class="badge ${t.lvl[1]}"><span class="dot"></span>${t.lvl[0]}</span></td>
       <td><svg class="ic ic-sm" viewBox="0 0 24 24" style="color:var(--tx-3)"><path d="M9 18l6-6-6-6"/></svg></td></tr>`;}).join('')+
     `</tbody></table></div></div>`;
  const dn=echarts.init(document.getElementById('otoDonut')); charts.push(dn);
  dn.setOption({tooltip:{...s.tip,trigger:'item',formatter:'{b}: <b>{c}</b> (%{d})'},legend:{show:true,bottom:0,textStyle:{color:s.tx3,fontSize:10},itemWidth:9,itemHeight:9,icon:'circle'},
    series:[{type:'pie',radius:['44%','70%'],center:['50%','44%'],avoidLabelOverlap:true,itemStyle:{borderColor:s.isLight?'#fff':'#15181D',borderWidth:2},label:{show:false},
      data:[{value:118,name:'Otomatik atama',itemStyle:{color:s.y}},{value:14,name:'Yeniden atama',itemStyle:{color:s.info}},{value:6,name:'SLA eskalasyon',itemStyle:{color:s.warn}},{value:4,name:'Sıra-sonu ceza',itemStyle:{color:s.bad}},{value:6,name:'Bölge dengeleme',itemStyle:{color:s.ok}}]}]});
  setTimeout(()=>dn.resize(),50);
  otoBuilt=true;
}

/* ---------- görünüm yönetimi ---------- */
const names={komuta:'Komuta',gorevler:'Siparişler',kuryeler:'Kuryeler',dukkanlar:'Dükkanlar',atama:'Atama Ayarları',otomasyon:'Otomasyon',buyume:'Büyüme & Ödüller',bolgeler:'Bölgeler',tasima:'Taşıma Ücretleri',finans:'Finans & Hakediş',kontor:'Kontör / Bakiye',kullanicilar:'Kullanıcılar',raporlar:'Raporlar',duyurular:'Duyurular',ayarlar:'Ayarlar',destek:'Destek Merkezi'};
const built={};
function go(v){
  document.querySelectorAll('.rail .ni').forEach(n=>n.classList.toggle('on',n.dataset.v===v));
  document.querySelectorAll('.content > section').forEach(s=>s.classList.remove('on'));
  $('#v-'+v).classList.add('on'); $('#viewName').textContent='· '+names[v];
  if(v==='komuta') initMap();
  if(v==='raporlar') buildReports();
  if(!built[v]){ built[v]=true; ({gorevler:buildGorevler,kuryeler:buildKuryeler,dukkanlar:buildDukkanlar,otomasyon:buildOtomasyon,buyume:buildBuyume,finans:buildFinans,bolgeler:buildBolgeler,ayarlar:buildAyarlar}[v] || (window.VZEXT&&window.VZEXT[v]) || (()=>{}))(); }
  setTimeout(()=>charts.forEach(c=>c.resize()),80);
}
document.querySelectorAll('.rail .ni').forEach(n=>n.onclick=()=>go(n.dataset.v));
$('#alertChip').onclick=()=>toast('3 uyarı: 1 kurye 6dk hareketsiz · VZ-7743 SLA riski · Bozok Lahmacun yavaş hazırlık');

/* ---------- sabit üst KPI şeridi (her sayfada) ---------- */
function renderKpiBar(){
  const bar=$('#kpibar'); if(!bar)return;
  const pills=[
    {dot:C.ok, lab:'Bugün teslim', val:'142'},
    {dot:C.ok, lab:'Aktif kurye', val:online+'/15'},
    {dot:C.tx3, lab:'Max paket', val:'2'},
    {dot:C.y, lab:'Oto atama', val:'Açık'},
    {dot:C.info, lab:'Bakiye', val:'₺48.2K'},
    {dot:C.ok, lab:'SLA', val:'%94'},
    {dot:C.warn, lab:'Yoğunluk', val:'Orta'},
    {dot:C.purple, lab:'Hazırlık', val:'18 dk'},
  ];
  bar.innerHTML=pills.map(p=>`<div class="pill"><span class="dot" style="background:${p.dot}"></span><span class="lab">${p.lab}</span><span class="val num">${p.val}</span></div>`).join('')+'<div class="grow"></div>';
}

/* init */
/* ---------- CANLI KANAL AKIŞI (entegrasyon demosu) ---------- */
let feedSeq=7760; const FEED_CH=['getir','ys','trendyol','vizz','tel'];
const NAMES_C=['A. Yılmaz','M. Demir','E. Kaya','S. Çelik','Z. Arslan','B. Şahin','K. Doğan','H. Aydın'];
function channelFeed(){
  setInterval(()=>{
    const ch=FEED_CH[Math.floor(Math.random()*FEED_CH.length)];
    const r=D.RESTAURANTS[Math.floor(Math.random()*D.RESTAURANTS.length)];
    const z=Y.zones[Math.floor(Math.random()*Y.zones.length)];
    const pays=['Kapıda Nakit','Kapıda Kart','Online'];
    const o=enrichOrder({id:'VZ-'+(feedSeq++),rest:r.name,cust:NAMES_C[Math.floor(Math.random()*NAMES_C.length)],zone:z.n,
      items:1+Math.floor(Math.random()*4),total:85+Math.floor(Math.random()*330),pay:pays[Math.floor(Math.random()*3)],
      status:'Atanıyor',min:1,courier:null,channel:ch}, feedSeq);
    orders.unshift(o); if(orders.length>16) orders.pop();
    renderQueue(curFilter);
    const card=$('#queue .ord'); if(card){ card.classList.add('newdrop'); setTimeout(()=>card.classList.remove('newdrop'),1700); }
    const an=$('#alertN'); if(an) an.textContent=parseInt(an.textContent||'0')+1;
    toast(`<b style="color:${CHAN[ch].c}">${CHAN[ch].n}</b> · ${r.name} — yeni sipariş düştü`);
  }, 6000+Math.floor(Math.random()*3500));
}

/* init */
renderKPIs(); renderQueue('all'); renderCouriers(); renderKpiBar(); initMap(); channelFeed(); autoAssignTick();

window.addEventListener('vizz-theme-change', () => {
  charts.forEach(c => c.dispose());
  charts.length = 0;
  reportsBuilt = false;
  renderKPIs();
  swapTiles();
  if ($('#v-raporlar').classList.contains('on')) {
    buildReports();
  }
  if ($('#v-otomasyon').classList.contains('on')) {
    buildOtomasyon();
  }
  if (activeCourierId !== null) {
    courierDrawer(activeCourierId);
  } else if (activeDukkanId !== null) {
    dukkanDrawer(activeDukkanId);
  }
});

/* ---------- KPI tıkla → modal ---------- */
function openModal(key,title,html,icon){ const m=$('#modal'); m.dataset.k=key||'';
  m.innerHTML=`<div class="mcard"><div class="mhead"><div class="t"><svg class="ic" viewBox="0 0 24 24">${icon||'<circle cx="12" cy="12" r="9"/>'}</svg>${title}</div>
    <button class="btn btn-ghost btn-icon" onclick="VZ.closeModal()"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div><div class="mbody">${html}</div></div>`;
  m.classList.add('on'); m.onclick=e=>{ if(e.target===m) closeModal(); }; }
function closeModal(){ const m=$('#modal'); m.classList.remove('on'); m.innerHTML=''; m.dataset.k=''; }
/* ---------- genel FORM MODAL (ekle/düzenle) ---------- */
const RZONE=['Çapanoğlu','Cumhuriyet','Medrese','Köseoğlu','Fatih','Bahçelievler','Aşağınohutlu','Karşıyaka'];
const RNAMES=D.RESTAURANTS.map(r=>r.name);
const FORMS={
  kurye:{t:'Yeni Kurye Ekle',f:[['Ad Soyad','text','Örn. Caner Tunç'],['Telefon','tel','(5__) ___ __ __'],['Bölge','select',RZONE],['Araç','select',['Motosiklet','Bisiklet','Araba']],['Ehliyet / belge no','text','']]},
  dukkan:{t:'Yeni Dükkan Ekle',f:[['İşletme adı','text',''],['Kategori','select',['Kebap','Pide','Lahmacun','Burger','Kahvaltı','Tatlı','Market']],['Adres','text',''],['Telefon','tel',''],['Ort. hazırlık (dk)','number','15'],['Komisyon (%)','number','8']]},
  kullanici:{t:'Yeni Kullanıcı',f:[['Ad Soyad','text',''],['E-posta','email',''],['Telefon','tel',''],['Rol','select',['Sahip','Operasyon Müdürü','Mağaza Yöneticisi','Muhasebe']],['Mağaza','select',['Tümü',...RNAMES]]]},
  tarife:{t:'Yeni Taşıma Ücreti',f:[['Restoran','select',RNAMES],['Ücret tipi','select',['Sabit','Mesafeli']],['Restoran ücreti (₺)','number','48'],['Kurye ücreti (₺)','number','29'],['Geçerlilik başlangıcı','text','01.07.2026']]},
  kampanya:{t:'Yeni Kampanya',note:'Teşvik gideri Finans + Dükkan Ekonomisi net kârına otomatik işlenir.',f:[['Kampanya adı','text','Hafta Sonu Bonusu'],['Hedef kitle','select',['Kurye','İşletme']],['Tip','select',['Teslimat başı bonus','Şanslı çekiliş','Komisyon indirimi','Hacim primi']],['Tutar (₺)','number','30'],['Aylık bütçe (₺)','number','10000']]},
  duyuru:{t:'Yeni Duyuru',f:[['Başlık','text',''],['Mesaj','textarea','Duyuru metni…'],['Hedef','select',['Tüm ekip','Kuryeler','Yöneticiler']],['Durum','select',['Aktif','Pasif']]]},
  bolge:{t:'Yeni Bölge',f:[['Bölge adı','text',''],['Fiyat çarpanı','number','1.0'],['Kurye havuzu','select',['Tümü','Sadece sabit kuryeler']]],note:'Gerçek üründe haritada poligon çizilir; burada bölge bilgileri.'},
};
function formModal(kind,editTitle){
  const F=FORMS[kind]; if(!F)return; const TITLE=editTitle||F.t;
  const fields=F.f.map(([lab,type,opt])=>{
    let inp;
    if(type==='select') inp=`<select class="inp">${(opt||[]).map(o=>`<option>${o}</option>`).join('')}</select>`;
    else if(type==='textarea') inp=`<textarea class="inp" rows="3" placeholder="${opt||''}" style="resize:vertical"></textarea>`;
    else inp=`<input class="inp" type="${type}" placeholder="${opt||''}">`;
    return `<div class="field"><label>${lab}</label>${inp}</div>`;
  }).join('');
  const note=F.note?`<div class="hint" style="margin:-6px 0 16px">${F.note}</div>`:'';
  const foot=`<div style="display:flex;gap:9px;margin-top:6px"><button class="btn" style="flex:1" onclick="VZ.closeModal()">İptal</button><button class="btn btn-y" style="flex:1.4" onclick="VZ.formSave('${TITLE}')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>Kaydet</button></div>`;
  openModal('form',TITLE,fields+note+foot,'<path d="M12 5v14M5 12h14"/>');
}
function formSave(t){ closeModal(); toast(`<b>${t||'Kayıt'}</b> tamam · prototip (gerçek üründe API'ye yazılır)`); }
function orderDetail(id){
  const o=orders.find(x=>x.id===id); if(!o)return; const p=payInfo(o.pay); const isM=o.vertical==='market';
  const stages=['Alındı','Hazırlanıyor','Atandı','Yolda','Teslim'];
  const cur=o.status==='İptal'?-1:o.status==='Teslim edildi'?5:o.courier?3:o.status==='Hazırlanıyor'?1:2;
  const tl=stages.map((s,i)=>`<div style="display:flex;align-items:center;gap:10px;padding:6px 0"><span style="width:18px;height:18px;border-radius:50%;display:grid;place-items:center;background:${i<cur?'var(--ok)':i===cur?'var(--y)':'var(--s4)'};color:#0b0c0e;font-size:10px;font-weight:800;flex:none">${i<cur?'✓':''}</span><span style="font-size:12.5px;color:${i<=cur?'var(--tx)':'var(--tx-3)'};font-weight:${i===cur?700:400}">${s}</span><span class="dim num" style="margin-left:auto;font-size:11px">${i<=cur&&cur>=0?('18:'+String((10+i*9)%60).padStart(2,'0')):''}</span></div>`).join('');
  const row=(lab,val)=>`<div style="display:flex;justify-content:space-between;gap:14px;padding:10px 0;border-bottom:1px solid var(--line)"><span class="dim" style="font-size:12px;flex:none">${lab}</span><span style="font-size:13px;color:var(--tx);font-weight:600;text-align:right">${val}</span></div>`;
  const html=`<div style="display:flex;align-items:center;gap:7px;margin-bottom:14px;flex-wrap:wrap">${chanBadge(o.channel)}<span class="badge ${isM?'b-y':'b-mute'}" style="font-size:10px">${isM?'Market':'Yemek'}</span><span class="badge ${slaCls(o.status)}"><span class="dot"></span>${o.status}</span></div>
    ${row('Müşteri',o.custFull)}
    ${row('Telefon',`<span style="color:var(--info)">•••• ••• •• ${String(o.phone).slice(-2)}</span> <span class="badge b-mute" style="font-size:9px">proxy maskeli</span> <button class="btn" style="padding:3px 10px;font-size:11px;margin-left:4px" onclick="VZ.toast('📞 Gizli arama başlatıldı — kurye ↔ müşteri numaraları maskeli (proxy)')">Gizli Ara</button>`)}
    ${row('Adres',`<span style="max-width:280px;display:inline-block">${o.addr}</span>`)}
    ${row(isM?'Depo':'Restoran',o.rest+' · '+o.zone)}
    ${row('Ödeme',`<span style="color:${p.c}"><svg class="ic ic-sm" viewBox="0 0 24 24" style="display:inline;vertical-align:-3px">${p.ic}</svg> ${p.n}</span>`)}
    ${row('Tutar',`<b style="color:var(--y);font-size:15px">₺${o.total}</b> <span class="dim">· ${o.items} ürün</span>`)}
    ${row('Kurye',o.courier?`${o.courier} · ${o.min} dk yolda`:'<span style="color:var(--bad)">henüz atanmadı</span>')}
    ${(()=>{const ec=D.econOrder(o.rest,o.total);const eRow=(l,v,c)=>`<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px"><span class="dim">${l}</span><span style="color:${c||'var(--tx)'};font-weight:700">${v}</span></div>`;
      return `<div class="sectitle" style="margin:16px 0 4px">VIZZ Ekonomisi · bu sipariş <span class="dim" style="font-weight:400;font-size:11px">— tek motordan</span></div>
      <div style="background:var(--s2);border:1px solid var(--line);border-radius:12px;padding:9px 13px">
      ${eRow('Teslimat tarifesi (dükkandan)','+₺'+ec.tarife,'var(--ok)')}
      ${eRow('Yemek komisyonu · %8','+₺'+ec.komisyon,'var(--ok)')}
      ${eRow('Kurye ücreti','−₺'+ec.kurye,'var(--bad)')}
      ${eRow('Sabit gider (PSP/app/destek)','−₺'+ec.sabit,'var(--bad)')}
      ${eRow('Vergi (KDV + kurumlar)','−₺'+(ec.kdv+ec.kv),'var(--bad)')}
      <div style="display:flex;justify-content:space-between;padding:8px 0 2px;margin-top:3px;border-top:1px solid var(--line-2)"><span style="font-weight:800;font-size:12.5px">NET KÂR</span><span style="font-weight:900;color:${ec.net>=0?'var(--ok)':'var(--bad)'};font-size:15px">₺${ec.net}</span></div></div>`;})()}
    <div class="sectitle" style="margin:16px 0 4px">Sipariş Akışı</div>${tl}
    <div style="display:flex;gap:9px;margin-top:16px">${o.courier?`<button class="btn btn-y" style="flex:1" onclick="VZ.toast('${o.courier} aranıyor…')">Kuryeyi Ara</button>`:`<button class="btn btn-y" style="flex:1" onclick="VZ.assign('${o.id}');VZ.orderDetail('${o.id}')">Hemen Ata</button>`}<button class="btn" style="flex:1" onclick="VZ.toast('Müşteri aranıyor…')">Müşteriyi Ara</button></div>`;
  openModal('order',o.id+' · Sipariş Detayı',html,'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 13h6"/>');
}
function activeOrdersHTML(){ const act=orders.filter(o=>o.status!=='Teslim edildi'&&o.status!=='İptal');
  return `<div class="dim" style="font-size:12px;margin-bottom:12px">${act.length} aktif sipariş · tüm restoranlar · tıkla → detay</div>`+act.map(o=>{const p=payInfo(o.pay);return `<div class="mrow" style="cursor:pointer" onclick="VZ.orderDetail('${o.id}')"><div style="flex:1;min-width:0"><div><b style="color:var(--tx)">${o.id}</b> <span class="dim">· ${o.rest}</span></div><div class="dim" style="font-size:11.5px;margin-top:3px">${o.custFull} · 📍 ${o.zone} · <span style="color:${p.c}">${p.n}</span></div></div><div style="text-align:right;flex:none"><div><b class="num" style="color:var(--y)">₺${o.total}</b></div><div style="margin-top:4px"><span class="badge ${slaCls(o.status)}" style="font-size:9.5px"><span class="dot"></span>${o.status}</span></div></div></div>`;}).join(''); }
function teslimatHTML(){ return `<div class="kstrip" style="grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">
  <div class="kpi"><div class="lab">P50</div><div class="val"><span class="num">24</span><small> dk</small></div></div>
  <div class="kpi"><div class="lab">P90</div><div class="val"><span class="num">36</span><small> dk</small></div></div>
  <div class="kpi"><div class="lab">P95</div><div class="val"><span class="num">41</span><small> dk</small></div></div></div>
  <div class="dim" style="font-size:12.5px;line-height:1.6">Bugünkü ortalama <b class="hl">27 dk</b> — hedefin (30 dk) altında. En büyük darboğaz: <b style="color:var(--bad)">hazırlık 14 dk</b>. Aşama kırılımı için Raporlar → Aşama Darboğazı.</div>`; }
function slaHTML(){ return `<div style="text-align:center;padding:6px 0 16px"><div style="font-size:46px;font-weight:800;color:var(--ok);line-height:1">%94</div><div class="dim" style="margin-top:6px">zamanında teslim · hedef %90 <span style="color:var(--ok)">✓</span></div></div>
  <div class="mrow"><span style="flex:1">Zamanında</span><b class="num" style="color:var(--ok)">132 · %94</b></div>
  <div class="mrow"><span style="flex:1">Geç teslim</span><b class="num" style="color:var(--bad)">8 · %6</b></div>
  <div class="mrow"><span style="flex:1">Son 1 saat trend</span><b class="num" style="color:var(--ok)">▲ %2</b></div>`; }
function bekleyenHTML(){ const wait=orders.filter(o=>!o.courier);
  if(!wait.length)return `<div class="dim" style="text-align:center;padding:34px">Kuyruk temiz 🐝</div>`;
  return wait.map(o=>`<div class="mrow"><div style="flex:1"><b style="color:var(--tx)">${o.id}</b> <span class="dim">· ${o.rest}</span><div class="dim" style="font-size:11.5px;margin-top:2px">📍 ${o.zone} · bekleme ~38 sn</div></div><button class="btn btn-y" style="padding:7px 12px" onclick="VZ.assign('${o.id}');VZ.kpiModal('bekleyen')">Hemen Ata</button></div>`).join(''); }
function ciroHTML(){ return `<div style="text-align:center;padding:4px 0 14px"><div style="font-size:42px;font-weight:800;color:var(--y);line-height:1">₺18.4K</div><div class="dim" style="margin-top:6px">bugün · <span style="color:var(--ok)">▲ %12</span> düne göre</div></div>
  <div class="sectitle" style="margin-top:4px">Dikey kırılımı</div>
  <div class="mrow"><span style="flex:1">🍽 Yemek</span><b class="num">₺14.9K · %81</b></div>
  <div class="mrow"><span style="flex:1">🛒 Market</span><b class="num">₺3.5K · %19</b></div>
  <div class="sectitle" style="margin-top:14px">En çok ciro · bölge</div>
  ${[['Çapanoğlu',4200],['Cumhuriyet',3850],['Köseoğlu',3100]].map(z=>`<div class="mrow"><span style="flex:1">${z[0]}</span><b class="num">₺${z[1].toLocaleString('tr')}</b></div>`).join('')}`; }
function kpiModal(key){
  const M={
    aktif:['Aktif Siparişler','<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 13h6"/>',activeOrdersHTML],
    saha:['Sahadaki Kurye · '+online+'/15','<circle cx="12" cy="7" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',courierListHTML],
    teslimat:['Teslimat Süresi','<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',teslimatHTML],
    sla:['SLA — Zamanında Teslim','<path d="M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-4Z"/><path d="M9 12l2 2 4-4"/>',slaHTML],
    bekleyen:['Bekleyen Atama','<path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="9"/>',bekleyenHTML],
    ciro:['Bugünkü Ciro','<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',ciroHTML],
  }[key]; if(!M)return; openModal(key,M[0],M[2](),M[1]);
}
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });

function gorevFilter(btn,st){ btn.parentNode.querySelectorAll('button').forEach(b=>b.classList.remove('on')); btn.classList.add('on');
  document.querySelectorAll('#gorevBody tr').forEach(tr=>{ tr.style.display=(st==='Tümü'||tr.dataset.st===st)?'':'none'; }); }
function ayarTabFn(t){ ayarTab=t; buildAyarlar(); }
window.VZ={assign,toast,courierDrawer,closeDrawer,dukkanDrawer,oto:toast,gorevFilter,ayarTab:ayarTabFn,kpiModal,closeModal,formModal,formSave,orderDetail,toggleAuto};
})();
