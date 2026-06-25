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
function mkChart(elId){ const c=echarts.init(document.getElementById(elId),null,{renderer:'canvas'}); charts.push(c); return c; }
window.addEventListener('resize',()=>charts.forEach(c=>c.resize()));
const axisBase={ axisLine:{lineStyle:{color:C.line}}, axisTick:{show:false}, splitLine:{lineStyle:{color:C.line}},
  axisLabel:{color:C.tx3,fontSize:10}, nameTextStyle:{color:C.tx3} };
const baseTip={ backgroundColor:'#1C2026', borderColor:'rgba(255,255,255,.12)', textStyle:{color:'#E9EBEE',fontSize:12}, padding:[8,11] };

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
  $('#kpis').innerHTML = KPI.map((k,i)=>`<div class="kpi${k.accent?' accent':''}"><div class="lab">${k.lab}</div><div class="val">${k.val}</div><div class="sub">${k.sub}</div><div class="spark" id="sp${i}"></div></div>`).join('');
  KPI.forEach((k,i)=>{ const c=mkChart('sp'+i);
    c.setOption({ grid:{left:0,right:0,top:6,bottom:0}, xAxis:{type:'category',show:false,data:k.data.map((_,j)=>j)}, yAxis:{type:'value',show:false,scale:true},
      series:[k.spark==='bar'
        ? {type:'bar',data:k.data,itemStyle:{color:k.col,borderRadius:[2,2,0,0]},barWidth:'55%'}
        : {type:'line',data:k.data,smooth:true,symbol:'none',lineStyle:{color:k.col,width:2},areaStyle:{color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:k.col+'55'},{offset:1,color:k.col+'00'}])}}] }); });
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

function initMap(){
  if(map){ setTimeout(()=>map.invalidateSize(),60); return; }
  map=L.map('noc',{zoomControl:false,attributionControl:false}).setView(Y.center,Y.zoom);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map);
  const cov=L.polygon(Y.coverage,{color:C.y,weight:2,dashArray:'7 6',fillColor:C.y,fillOpacity:.05}).addTo(map);
  map.fitBounds(cov.getBounds(),{padding:[30,30]});
  Y.zones.forEach(z=>L.marker(z.c,{opacity:0,interactive:false}).addTo(map).bindTooltip(z.n,{permanent:true,direction:'top',className:'zone-lbl'}));
  D.RESTAURANTS.forEach(r=>{const z=Y.zones.find(x=>x.n===r.zone)||Y.zones[0];L.marker([z.c[0]+rnd(-.001,.001),z.c[1]+rnd(-.001,.001)],{icon:restIcon()}).addTo(map).bindTooltip(r.name,{direction:'top'});});
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
  const list = filter==='wait'?orders.filter(o=>!o.courier):orders;
  $('#queue').innerHTML = list.map(o=>`<div class="ord ${o.status==='Atanıyor'?'live':''}">
    <div class="r1"><span class="id">${o.id}</span><span class="badge ${slaCls(o.status)}"><span class="dot"></span>${o.status}</span></div>
    <div class="meta"><span>🍽 <b>${o.rest}</b></span><span>📍 ${o.zone}</span><span>${o.items} ürün · <b class="num">₺${o.total}</b></span><span>${o.pay}</span></div>
    ${o.courier
      ? `<div class="sla" style="color:var(--info)"><svg class="ic ic-sm" viewBox="0 0 24 24"><circle cx="5.5" cy="17" r="3"/><circle cx="18.5" cy="17" r="3"/><path d="M8.5 17h6l-2.5-6H8"/></svg> ${o.courier} · ${o.min} dk · <span class="muted">SLA güvenli</span></div>`
      : `<div class="act"><button class="btn btn-y" onclick="VZ.assign('${o.id}')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="m13 2-3 7h6l-5 13 2-9H7l4-11Z"/></svg>Otomatik Ata</button><button class="btn" onclick="VZ.toast('Manuel atama paneli — kurye seç')">Manuel</button></div>`}
  </div>`).join('') || '<div class="dim" style="text-align:center;padding:28px;font-size:12px">Kuyruk temiz 🐝</div>';
}
function assign(id){ const o=orders.find(x=>x.id===id); const free=D.COURIERS.filter(c=>c.status==='online'); const k=free[Math.floor(Math.random()*free.length)]||D.COURIERS[0];
  o.courier=k.name; o.status='Kurye yolda'; o.min=Math.floor(rnd(5,13)); renderQueue(curFilter);
  toast(`<b>${id}</b> → ${k.name} atandı · gerekçe: en yakın + düşük yük`); }
let curFilter='all';
$('#q-all').onclick=()=>{curFilter='all';$('#q-all').classList.add('on');$('#q-wait').classList.remove('on');renderQueue('all');};
$('#q-wait').onclick=()=>{curFilter='wait';$('#q-wait').classList.add('on');$('#q-all').classList.remove('on');renderQueue('wait');};

/* ---------- canlı kurye listesi ---------- */
function renderCouriers(){
  $('#courierList').innerHTML = D.COURIERS.map(c=>{
    const st = c.status==='delivering'?'busy':c.status==='online'?'on':'off';
    const col = c.status==='delivering'?'b-y':c.status==='online'?'b-ok':'b-mute';
    return `<div style="display:flex;align-items:center;gap:11px;padding:9px 4px;border-bottom:1px solid var(--line);cursor:pointer" onclick="VZ.courierDrawer(${c.id})">
      <div class="av ${st}">${c.name.split(' ').map(p=>p[0]).join('')}</div>
      <div style="flex:1;min-width:0"><div style="display:flex;gap:7px;align-items:center"><b style="color:var(--tx);font-size:12.5px">${c.name}</b><span class="badge ${col}" style="font-size:10px;padding:2px 7px">${c.statusTr}</span></div>
        <div class="dim" style="font-size:11px;margin-top:2px">${c.zone} · ⭐ ${c.rate} · kabul %${c.accept}</div></div>
      <div style="text-align:right"><div class="num" style="color:var(--y);font-weight:700;font-size:13px">₺${c.earn}</div><div class="dim" style="font-size:10.5px">${c.today} teslimat</div></div>
    </div>`; }).join('');
}

/* ---------- RAPORLAR (leapfrog dashboard) ---------- */
let reportsBuilt=false;
function buildReports(){
  if(reportsBuilt) return; reportsBuilt=true;
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
    progress:{show:true,width:14,roundCap:true,itemStyle:{color:C.ok}}, axisLine:{lineStyle:{width:14,color:[[1,C.s3]]}},
    pointer:{show:false},axisTick:{show:false},splitLine:{show:false},axisLabel:{show:false},
    anchor:{show:false}, title:{show:false},
    detail:{valueAnimation:true,fontSize:30,fontWeight:800,color:'#E9EBEE',offsetCenter:[0,'-2%'],formatter:'%{value}'},
    data:[{value:94}]}]});
  // Ciro trend
  mkChart('r-rev').setOption({tooltip:{trigger:'axis',...baseTip},grid:{left:6,right:14,top:14,bottom:6,containLabel:true},
    xAxis:{type:'category',data:['10','11','12','13','14','15','16','17','18','19'],...axisBase},
    yAxis:{type:'value',...axisBase,axisLabel:{...axisBase.axisLabel,formatter:'₺{value}K'}},
    series:[{type:'line',smooth:true,symbol:'none',data:[2.1,3.4,5.2,6.0,4.1,3.2,4.8,6.4,8.1,9.2],lineStyle:{color:C.y,width:2.5},
      areaStyle:{color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(255,196,0,.30)'},{offset:1,color:'rgba(255,196,0,0)'}])}}]});
  // Persentil histogram
  const bins=['10','15','20','25','30','35','40','45+'], cnt=[4,11,24,31,22,14,7,3];
  mkChart('r-pct').setOption({tooltip:{trigger:'axis',...baseTip},grid:{left:6,right:14,top:30,bottom:6,containLabel:true},
    xAxis:{type:'category',data:bins,...axisBase,name:'dk',nameLocation:'end',nameGap:6},yAxis:{type:'value',...axisBase},
    series:[{type:'bar',data:cnt.map((v,i)=>({value:v,itemStyle:{color:i<4?C.info:i<6?C.warn:C.bad,borderRadius:[3,3,0,0]}})),barWidth:'62%',
      markLine:{symbol:'none',label:{color:C.tx2,fontSize:10,formatter:'{b}'},lineStyle:{color:C.tx3,type:'dashed'},
        data:[{xAxis:2,name:'P50 24dk'},{xAxis:5,name:'P90 36dk'},{xAxis:6,name:'P95 41dk'}]}}]});
  // Aşama darboğazı (bar yatay)
  mkChart('r-stage').setOption({tooltip:{trigger:'axis',...baseTip,formatter:p=>p[0].name+': <b>'+p[0].value+' dk</b>'},grid:{left:6,right:18,top:10,bottom:6,containLabel:true},
    xAxis:{type:'value',...axisBase,axisLabel:{...axisBase.axisLabel,formatter:'{value}dk'}},
    yAxis:{type:'category',data:['Teslim','Pickup→yol','Kurye→rest.','Hazırlık','Onay'],...axisBase},
    series:[{type:'bar',data:[ {value:7,itemStyle:{color:C.info}},{value:9,itemStyle:{color:C.y}},{value:5,itemStyle:{color:C.ok}},{value:14,itemStyle:{color:C.bad}},{value:2,itemStyle:{color:C.tx3}} ],barWidth:'58%',itemStyle:{borderRadius:[0,4,4,0]},
      label:{show:true,position:'right',color:C.tx2,fontSize:10,formatter:'{c}dk'}}]});
  // İptal pareto
  const cn=['Restoran kapalı','Stok yok','Müşteri iptal','Adres hatalı','Kurye yok'],cv=[34,21,15,9,6];
  let acc=0,tot=cv.reduce((a,b)=>a+b,0),cumP=cv.map(v=>Math.round((acc+=v)/tot*100));
  mkChart('r-cancel').setOption({tooltip:{trigger:'axis',...baseTip},grid:{left:6,right:30,top:14,bottom:6,containLabel:true},
    xAxis:{type:'category',data:cn,...axisBase,axisLabel:{...axisBase.axisLabel,rotate:18,fontSize:9}},
    yAxis:[{type:'value',...axisBase},{type:'value',max:100,...axisBase,axisLabel:{...axisBase.axisLabel,formatter:'{value}%'}}],
    series:[{type:'bar',data:cv,barWidth:'52%',itemStyle:{color:C.bad,borderRadius:[3,3,0,0]}},
      {type:'line',yAxisIndex:1,data:cumP,smooth:true,symbol:'circle',symbolSize:5,lineStyle:{color:C.y,width:2},itemStyle:{color:C.y}}]});
  // Heatmap saat × mahalle
  const hrs=['11','12','13','14','17','18','19','20','21'], zns=['Çapanoğlu','Cumhuriyet','Medrese','Köseoğlu','Fatih','Bahçelievler'];
  const hd=[]; for(let i=0;i<zns.length;i++)for(let j=0;j<hrs.length;j++){const base=(j>3?7:3); hd.push([j,i,Math.round(rnd(0,5)+base*(0.5+Math.random()))]);}
  mkChart('r-heat').setOption({tooltip:{...baseTip,formatter:p=>zns[p.value[1]]+' · '+hrs[p.value[0]]+':00 → <b>'+p.value[2]+' sipariş</b>'},
    grid:{left:6,right:10,top:10,bottom:22,containLabel:true},
    xAxis:{type:'category',data:hrs,...axisBase,splitArea:{show:false}},yAxis:{type:'category',data:zns,...axisBase},
    visualMap:{min:0,max:18,calculable:false,orient:'horizontal',left:'center',bottom:0,itemWidth:10,itemHeight:90,textStyle:{color:C.tx3,fontSize:9},inRange:{color:['#15181D','#3a3417','#7a6a14','#F2A900','#FFC400']}},
    series:[{type:'heatmap',data:hd,itemStyle:{borderColor:'#0B0C0E',borderWidth:2},emphasis:{itemStyle:{borderColor:C.y,borderWidth:1.5}}}]});
  // Birim ekonomi (waterfall)
  const ue=[{n:'Sepet',v:178,c:C.ok},{n:'Yemek mly',v:-86,c:C.bad},{n:'Kurye',v:-34,c:C.bad},{n:'Komisyon',v:-21,c:C.bad},{n:'Ödeme',v:-4,c:C.bad},{n:'Katkı',v:33,c:C.y}];
  let run=0; const helper=ue.map((x,i)=>{ if(i===0||i===ue.length-1){const v=run; run+= x.v; return 0;} const base=run; run+=x.v; return x.v<0?run:base; });
  mkChart('r-unit').setOption({tooltip:{...baseTip,trigger:'axis',formatter:p=>{const x=ue[p[1]?p[1].dataIndex:p[0].dataIndex];return x.n+': <b>₺'+x.v+'</b>';}},grid:{left:6,right:12,top:14,bottom:22,containLabel:true},
    xAxis:{type:'category',data:ue.map(x=>x.n),...axisBase,axisLabel:{...axisBase.axisLabel,rotate:18,fontSize:9}},yAxis:{type:'value',...axisBase,axisLabel:{...axisBase.axisLabel,formatter:'₺{value}'}},
    series:[{type:'bar',stack:'t',itemStyle:{color:'transparent'},data:helper},
      {type:'bar',stack:'t',barWidth:'55%',data:ue.map(x=>({value:Math.abs(x.v),itemStyle:{color:x.c,borderRadius:2}})),label:{show:true,position:'top',color:C.tx2,fontSize:9,formatter:(p)=>'₺'+ue[p.dataIndex].v}}]});
  // Bölge ciro
  const zc=[['Çapanoğlu',4200],['Cumhuriyet',3850],['Köseoğlu',3100],['Fatih',2600],['Medrese',2200],['Bahçelievler',1800]].sort((a,b)=>a[1]-b[1]);
  mkChart('r-zone').setOption({tooltip:{trigger:'axis',...baseTip,formatter:p=>p[0].name+': <b>₺'+p[0].value.toLocaleString('tr')+'</b>'},grid:{left:6,right:16,top:10,bottom:6,containLabel:true},
    xAxis:{type:'value',...axisBase,axisLabel:{...axisBase.axisLabel,formatter:v=>'₺'+(v/1000)+'K'}},yAxis:{type:'category',data:zc.map(x=>x[0]),...axisBase},
    series:[{type:'bar',data:zc.map((x,i)=>({value:x[1],itemStyle:{color:i===zc.length-1?C.y:'#3a4048',borderRadius:[0,4,4,0]}})),barWidth:'60%',label:{show:true,position:'right',color:C.tx2,fontSize:10,formatter:p=>'₺'+(p.value/1000).toFixed(1)+'K'}}]});
  // Kurye performans scatter
  const sc=D.COURIERS.slice(0,12).map(c=>[c.today, 86+(c.id*3)%14, c.earn]);
  mkChart('r-perf').setOption({tooltip:{...baseTip,formatter:p=>'Teslimat: <b>'+p.value[0]+'</b><br>Zamanında: <b>%'+p.value[1]+'</b><br>Kazanç: <b>₺'+p.value[2]+'</b>'},grid:{left:6,right:14,top:14,bottom:6,containLabel:true},
    xAxis:{type:'value',name:'teslimat',...axisBase},yAxis:{type:'value',name:'zamanında %',min:80,max:100,...axisBase},
    series:[{type:'scatter',data:sc,symbolSize:v=>8+v[2]/90,itemStyle:{color:C.y,opacity:.85,borderColor:'#0B0C0E',borderWidth:1}}]});

  setTimeout(()=>charts.forEach(c=>c.resize()),60);
}

/* ---------- diğer görünümler ---------- */
function buildGorevler(){
  $('#v-gorevler').innerHTML = `<div class="rhead"><div><h2>Tüm Görevler</h2><p>canlı sipariş akışı · filtrele, ata, izle</p></div>
    <div class="seg"><button class="on">Tümü</button><button>Aktif</button><button>Bekleyen</button><button>Tamamlanan</button></div></div>
    <div class="card"><div style="overflow:auto;max-height:calc(100vh - 150px)"><table class="grid"><thead><tr>
    <th>Sipariş</th><th>Restoran</th><th>Müşteri</th><th>Bölge</th><th>Durum</th><th>Kurye</th><th>Tutar</th><th>SLA</th><th></th></tr></thead><tbody>`+
    orders.concat([
      {id:'VZ-7744',rest:'Honey Burger House',cust:'E. Şahin',zone:'Bahçelievler',items:4,total:295,pay:'Kapıda Kart',status:'Teslim edildi',min:0,courier:'Caner T.'},
      {id:'VZ-7740',rest:'Sarı Kovan Kahvaltı',cust:'K. Öz',zone:'Köseoğlu',items:2,total:430,pay:'Online',status:'Hazırlanıyor',min:14,courier:null},
    ]).map(o=>`<tr><td><b>${o.id}</b></td><td>${o.rest}</td><td>${o.cust||'—'}</td><td>${o.zone}</td>
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
  const c=D.COURIERS.find(x=>x.id===id); const d=$('#drawer');
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
  ch.setOption({grid:{left:4,right:8,top:12,bottom:4,containLabel:true},xAxis:{type:'category',data:['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'],...axisBase},yAxis:{type:'value',...axisBase},
    series:[{type:'bar',data:[8,11,9,13,16,19,c.today],itemStyle:{color:C.y,borderRadius:[3,3,0,0]},barWidth:'55%'}]});
  setTimeout(()=>ch.resize(),50);
}
function closeDrawer(){$('#scrim').classList.remove('on');$('#drawer').classList.remove('on');}
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

/* ---------- görünüm yönetimi ---------- */
const names={komuta:'Komuta',gorevler:'Görevler',kuryeler:'Kuryeler',bolgeler:'Bölgeler',finans:'Finans',raporlar:'Raporlar',ayarlar:'Ayarlar'};
const built={};
function go(v){
  document.querySelectorAll('.rail .ni').forEach(n=>n.classList.toggle('on',n.dataset.v===v));
  document.querySelectorAll('.content > section').forEach(s=>s.classList.remove('on'));
  $('#v-'+v).classList.add('on'); $('#viewName').textContent='· '+names[v];
  if(v==='komuta') initMap();
  if(v==='raporlar') buildReports();
  if(!built[v]){ built[v]=true; ({gorevler:buildGorevler,kuryeler:buildKuryeler,finans:buildFinans,bolgeler:buildBolgeler,ayarlar:buildAyarlar}[v]||(()=>{}))(); }
  setTimeout(()=>charts.forEach(c=>c.resize()),80);
}
document.querySelectorAll('.rail .ni').forEach(n=>n.onclick=()=>go(n.dataset.v));
$('#alertChip').onclick=()=>toast('3 uyarı: 1 kurye 6dk hareketsiz · VZ-7743 SLA riski · Bozok Lahmacun yavaş hazırlık');

/* init */
renderKPIs(); renderQueue('all'); renderCouriers(); initMap();
window.VZ={assign,toast,courierDrawer,closeDrawer};
})();
