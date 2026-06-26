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
$('#courierCnt').textContent=online+' aktif';

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
  $('#kpis').innerHTML = KPI.map((k,i)=>`<div class="kpi${k.accent?' accent':''}"><div class="lab">${k.lab}</div><div class="val">${k.val}</div><div class="sub">${k.sub}</div><div class="spark" id="sp${i}"></div></div>`).join('');
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
let orders = D.ORDERS.map(o=>({...o}));
const slaCls=s=>s==='Hazırlanıyor'?'b-warn':s==='Atanıyor'?'b-bad':s==='Kurye yolda'?'b-info':'b-ok';
function renderQueue(filter){
  const list = filter==='wait' ? orders.filter(o=>!o.courier) : filter==='market' ? orders.filter(o=>o.vertical==='market') : orders;
  $('#queue').innerHTML = list.map(o=>{
    const isM=o.vertical==='market';
    return `<div class="ord ${o.status==='Atanıyor'?'live':''}">
    <div class="r1"><span class="id">${o.id}</span><span style="display:flex;gap:6px;align-items:center"><span class="badge ${isM?'b-y':'b-mute'}" style="font-size:10px"><span class="dot"></span>${isM?'Market':'Yemek'}</span><span class="badge ${slaCls(o.status)}"><span class="dot"></span>${o.status}</span></span></div>
    <div class="meta"><span>${isM?'🛒':'🍽'} <b>${o.rest}</b></span><span>📍 ${o.zone}</span><span>${o.items} ürün · <b class="num">₺${o.total}</b></span><span>${o.pay}</span></div>
    ${o.courier
      ? `<div class="sla" style="color:var(--info)"><svg class="ic ic-sm" viewBox="0 0 24 24"><circle cx="5.5" cy="17" r="3"/><circle cx="18.5" cy="17" r="3"/><path d="M8.5 17h6l-2.5-6H8"/></svg> ${o.courier} · ${o.min} dk · <span class="muted">${isM?'market SLA 15-25 dk':'SLA güvenli'}</span></div>`
      : `<div class="act"><button class="btn btn-y" onclick="VZ.assign('${o.id}')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="m13 2-3 7h6l-5 13 2-9H7l4-11Z"/></svg>Otomatik Ata</button><button class="btn" onclick="VZ.toast('${isM?'Market':'Yemek'} manuel atama paneli — kurye seç')">Manuel</button></div>`}
  </div>`}).join('') || '<div class="dim" style="text-align:center;padding:28px;font-size:12px">Kuyruk temiz 🐝</div>';
}
function assign(id){ const o=orders.find(x=>x.id===id); const free=D.COURIERS.filter(c=>c.status==='online'); const k=free[Math.floor(Math.random()*free.length)]||D.COURIERS[0];
  o.courier=k.name; o.status='Kurye yolda'; o.min=Math.floor(rnd(5,13)); renderQueue(curFilter);
  toast(`<b>${id}</b> → ${k.name} atandı · gerekçe: en yakın + düşük yük`); }
let curFilter='all';
function qseg(id){ ['q-all','q-wait','q-market'].forEach(x=>$('#'+x)?.classList.toggle('on',x===id)); }
$('#q-all').onclick=()=>{curFilter='all';qseg('q-all');renderQueue('all');};
$('#q-wait').onclick=()=>{curFilter='wait';qseg('q-wait');renderQueue('wait');};
$('#q-market').onclick=()=>{curFilter='market';qseg('q-market');renderQueue('market');};

/* ---------- canlı kurye listesi ---------- */
function renderCouriers(){
  const isDemoPenalty = localStorage.getItem('vizz_courier_penalty_demo') === 'true';
  let list = [...D.COURIERS];
  if(isDemoPenalty) {
    const c1 = list.find(x=>x.id===1);
    if(c1) {
      list = list.filter(x=>x.id!==1);
      list.push(c1); // Sıra sonuna at
    }
  }

  $('#courierList').innerHTML = list.map(c=>{
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
  ];
  $('#reportGrid').innerHTML = cards.map(c=>`<div class="card col-${c.col}"><div class="card-h"><div class="t">${c.t}</div><span class="dim" style="font-size:11px">${c.s}</span></div><div style="padding:10px 12px 12px;flex:1;display:flex"><div class="chart" id="${c.id}" style="height:${c.h}px"></div></div></div>`).join('');

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

  setTimeout(()=>charts.forEach(c=>c.resize()),60);
}

/* ---------- diğer görünümler ---------- */
function buildGorevler(){
  $('#v-gorevler').innerHTML = `<div class="rhead"><div><h2>Tüm Görevler</h2><p>canlı sipariş akışı · filtrele, ata, izle</p></div>
    <div class="seg"><button class="on">Tümü</button><button>Aktif</button><button>Bekleyen</button><button>Tamamlanan</button></div></div>
    <div class="card"><div style="overflow:auto;max-height:calc(100vh - 150px)"><table class="grid"><thead><tr>
    <th>Sipariş</th><th>Dikey</th><th>Restoran</th><th>Müşteri</th><th>Bölge</th><th>Durum</th><th>Kurye</th><th>Tutar</th><th>SLA</th><th></th></tr></thead><tbody>`+
    orders.concat([
      {id:'VZ-7744',rest:'Honey Burger House',cust:'E. Şahin',zone:'Bahçelievler',items:4,total:295,pay:'Kapıda Kart',status:'Teslim edildi',min:0,courier:'Caner T.'},
      {id:'VZ-7740',rest:'Sarı Kovan Kahvaltı',cust:'K. Öz',zone:'Köseoğlu',items:2,total:430,pay:'Online',status:'Hazırlanıyor',min:14,courier:null},
    ]).map(o=>`<tr><td><b>${o.id}</b></td><td><span class="badge ${o.vertical==='market'?'b-y':'b-mute'}" style="font-size:10px">${o.vertical==='market'?'Market':'Yemek'}</span></td><td>${o.rest}</td><td>${o.cust||'—'}</td><td>${o.zone}</td>
      <td><span class="badge ${slaCls(o.status)}"><span class="dot"></span>${o.status}</span></td>
      <td>${o.courier||'<span class="dim">—</span>'}</td><td class="num"><b>₺${o.total}</b></td>
      <td>${o.min?`<span class="num" style="color:${o.min<6?'var(--bad)':'var(--ok)'}">${o.min} dk</span>`:'<span class="dim">—</span>'}</td>
      <td><button class="btn btn-ghost btn-icon" onclick="VZ.toast('${o.id} detayı')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></button></td></tr>`).join('')+
    `</tbody></table></div></div>`;
}
function buildKuryeler(){
  $('#v-kuryeler').innerHTML = `<div class="rhead"><div><h2>Kuryeler</h2><p>${online} aktif · esnaf filo · puantaj + performans</p></div>
    <button class="btn btn-y"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Kurye Ekle</button></div>
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
  activeCourierId = id;
  activeDukkanId = null;
  const c=D.COURIERS.find(x=>x.id===id); const d=$('#drawer');
  const s=getThemeStyles();
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

function buildFinans(){
  $('#v-finans').innerHTML=`<div class="rhead"><div><h2>Finans & Mutabakat</h2><p>Cuma ödeme · COD kasa · komisyon — üçlü cari</p></div>
    <button class="btn btn-y" onclick="VZ.toast('💸 Cuma ödeme listesi onaylandı — IBAN aktarımı başladı')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>Tümünü Onayla & Öde</button></div>
    <div class="kstrip" style="grid-template-columns:repeat(4,1fr);margin-bottom:14px">
      <div class="kpi"><div class="lab">Bu hafta hakediş</div><div class="val">₺<span class="num">42.8K</span></div><div class="sub up">▲ %9</div></div>
      <div class="kpi"><div class="lab">COD toplanan nakit</div><div class="val">₺<span class="num">11.2K</span></div><div class="sub flat">14 kurye</div></div>
      <div class="kpi"><div class="lab">VIZZ komisyon</div><div class="val">₺<span class="num">6.4K</span></div><div class="sub up">%8 ort.</div></div>
      <div class="kpi accent"><div class="lab">Cuma ödenecek net</div><div class="val">₺<span class="num">31.6K</span></div><div class="sub">14 kuryeye</div></div></div>
    <div class="card"><div class="card-h"><div class="t">Cuma Ödeme Listesi — bu hafta</div><span class="badge b-y">Esnaf kurye hakedişi</span></div>
    <div style="overflow:auto;max-height:calc(100vh - 320px)"><table class="grid"><thead><tr><th>Kurye</th><th>Teslimat</th><th>Paket başı</th><th>Prim</th><th>Tahsil nakit</th><th>Net (Cuma)</th><th>Durum</th></tr></thead><tbody>`+
    D.COURIERS.map(c=>{const pkt=c.today*6*22,prim=c.today>12?180:c.today>8?90:0,nakit=c.id%2?c.today*6*40:0;return `<tr><td><b>${c.name}</b></td><td class="num">${c.today*6}</td><td class="num">₺${pkt}</td><td class="num">₺${prim}</td><td class="num">${nakit?'₺'+nakit+' <span class="dim">(mahsup)</span>':'—'}</td><td class="num"><b style="color:var(--y)">₺${pkt+prim}</b></td><td><span class="badge ${c.id%4===0?'b-warn':'b-ok'}">${c.id%4===0?'Bekliyor':'Hazır'}</span></td></tr>`;}).join('')+
    `</tbody></table></div></div>`;
}
function buildBolgeler(){
  $('#v-bolgeler').innerHTML=`<div class="rhead"><div><h2>Bölge Yönetimi</h2><p>${Y.zones.length} mahalle · kapsama · bölge bazlı yoğunluk & fiyat</p></div>
    <button class="btn btn-y"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M9 3 4 5v16l5-2 6 2 5-2V3l-5 2-6-2Z"/></svg>Yeni Bölge Çiz</button></div>
    <div class="card"><div style="overflow:auto"><table class="grid"><thead><tr><th>Mahalle</th><th>Bugün sipariş</th><th>Aktif kurye</th><th>Ort. süre</th><th>Yoğunluk</th><th>Fiyat çarpanı</th><th>Durum</th></tr></thead><tbody>`+
    Y.zones.map((z,i)=>{const ord=Math.round(rnd(8,40)),kur=Math.round(rnd(0,4)),sure=Math.round(rnd(22,38)),yog=Math.round(rnd(20,100));return `<tr><td><b>${z.n}</b></td><td class="num">${ord}</td><td class="num">${kur}</td><td class="num">${sure} dk</td><td><div class="bar-mini" style="width:90px"><i style="width:${yog}%;background:${yog>70?'var(--bad)':yog>40?'var(--y)':'var(--ok)'}"></i></div></td><td class="num">×${(1+i%3*0.1).toFixed(1)}</td><td><span class="badge b-ok">Aktif</span></td></tr>`;}).join('')+
    `</tbody></table></div></div>`;
}
function buildAyarlar(){
  $('#v-ayarlar').innerHTML=`<div class="rhead"><div><h2>Atama Motoru Ayarları</h2><p>çok-kriterli skor ağırlıkları · açıklanabilir atama</p></div></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:840px">
    <div class="card" style="padding:16px"><div class="t" style="margin-bottom:14px">Skor Ağırlıkları</div>
      ${[['Mesafe / ETA',45],['Anlık kurye yükü',20],['Geçmiş performans',15],['Bölge uyumu',12],['Adalet (gün içi denge)',8]].map(w=>`<div style="margin-bottom:13px"><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:6px"><span class="muted">${w[0]}</span><b class="num">%${w[1]}</b></div><div class="bar-mini" style="height:8px"><i style="width:${w[1]*2}%"></i></div></div>`).join('')}</div>
    <div class="card" style="padding:16px"><div class="t" style="margin-bottom:14px">Atama Modu</div>
      <div class="seg" style="width:100%"><button class="on" style="flex:1">En yakın</button><button style="flex:1">En az yüklü</button><button style="flex:1">Round-robin</button></div>
      <div style="margin-top:16px;font-size:12.5px" class="muted">⏱ Teklif zaman aşımı: <b class="hl">45 sn</b><br>🔁 Otomatik yeniden atama: <b style="color:var(--ok)">Açık</b><br>🧠 Açıklanabilir atama (gerekçe logu): <b style="color:var(--ok)">Açık</b><br>🛡 Manuel override: <b style="color:var(--ok)">Her zaman</b></div></div>
  </div>`;
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
    <button class="btn btn-y"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Dükkan Ekle</button></div>
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
const names={komuta:'Komuta',gorevler:'Görevler',kuryeler:'Kuryeler',dukkanlar:'Dükkanlar',otomasyon:'Otomasyon',bolgeler:'Bölgeler',finans:'Finans',raporlar:'Raporlar',ayarlar:'Ayarlar'};
const built={};
function go(v){
  document.querySelectorAll('.rail .ni').forEach(n=>n.classList.toggle('on',n.dataset.v===v));
  document.querySelectorAll('.content > section').forEach(s=>s.classList.remove('on'));
  $('#v-'+v).classList.add('on'); $('#viewName').textContent='· '+names[v];
  if(v==='komuta') initMap();
  if(v==='raporlar') buildReports();
  if(!built[v]){ built[v]=true; ({gorevler:buildGorevler,kuryeler:buildKuryeler,dukkanlar:buildDukkanlar,otomasyon:buildOtomasyon,finans:buildFinans,bolgeler:buildBolgeler,ayarlar:buildAyarlar}[v]||(()=>{}))(); }
  setTimeout(()=>charts.forEach(c=>c.resize()),80);
}
document.querySelectorAll('.rail .ni').forEach(n=>n.onclick=()=>go(n.dataset.v));
$('#alertChip').onclick=()=>toast('3 uyarı: 1 kurye 6dk hareketsiz · VZ-7743 SLA riski · Bozok Lahmacun yavaş hazırlık');

/* init */
renderKPIs(); renderQueue('all'); renderCouriers(); initMap();

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

window.VZ={assign,toast,courierDrawer,closeDrawer,dukkanDrawer,oto:toast};
})();
