/* VIZZ shared live map — Leaflet + OSRM road routing.
   Couriers cruise calmly along real Yozgat streets. OSRM requests are queued
   (max 2 concurrent) so the demo server is never burst-rate-limited; on failure
   a single short straight leg is used as fallback. */
(function(){
  const Y = window.VIZZ.YOZGAT;
  const rnd = (a,b)=>a+Math.random()*(b-a);
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

  function beeIcon(emoji,size){return L.divIcon({html:`<div class="vz-courier" style="font-size:${size||22}px">${emoji}</div>`,className:"",iconSize:[size||22,size||22],iconAnchor:[(size||22)/2,(size||22)/2]});}

  // ---- OSRM request queue (max 2 concurrent) ----
  const q=[]; let active=0; const MAX=2;
  function pump(){
    while(active<MAX && q.length){
      const job=q.shift(); active++;
      const url=`https://router.project-osrm.org/route/v1/driving/${job.a[1]},${job.a[0]};${job.b[1]},${job.b[0]}?overview=full&geometries=geojson`;
      fetch(url).then(r=>r.ok?r.json():Promise.reject()).then(j=>{
        active--; job.ok(j.routes[0].geometry.coordinates.map(c=>[c[1],c[0]])); pump();
      }).catch(()=>{active--; job.ok(null); pump();});
    }
  }
  function route(a,b){return new Promise(ok=>{q.push({a,b,ok}); pump();});}
  function straight(a,b,n){const p=[];for(let i=0;i<=n;i++)p.push([a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n]);return p;}
  function cumDist(path){let d=[0];for(let i=1;i<path.length;i++){d.push(d[i-1]+Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]));}return d;}

  window.VIZZ.initMap = function(elId, opts){
    opts = opts || {};
    const map = L.map(elId,{zoomControl:!opts.mini,attributionControl:false,dragging:!opts.lock,scrollWheelZoom:!opts.mini}).setView(Y.center, opts.zoom||Y.zoom);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map);

    if(opts.showRest!==false){
      window.VIZZ.RESTAURANTS.forEach(r=>{
        const z=Y.zones.find(z=>z.n===r.zone)||Y.zones[0];
        L.marker([z.c[0]+rnd(-.001,.001),z.c[1]+rnd(-.001,.001)],{icon:beeIcon("🍽️",18)}).addTo(map).bindTooltip(r.name,{direction:"top"});
      });
    }
    if(opts.showZones){
      Y.zones.forEach(z=>L.marker(z.c,{opacity:0,interactive:false,keyboard:false}).addTo(map)
        .bindTooltip(z.n,{permanent:true,direction:"top",className:"vz-zonetip",offset:[0,4]}));
    }
    // teslimat kapsama poligonu + haritayı bu bölgeye çerçevele (fitBounds)
    const coverage=L.polygon(Y.coverage||[],{color:"#F2A900",weight:2.5,dashArray:"7 6",fillColor:"#FFC400",fillOpacity:.07}).addTo(map);
    if(Y.coverage&&Y.coverage.length){ map.fitBounds(coverage.getBounds(),{padding:opts.mini?[10,10]:[26,26]}); }

    const list = (opts.couriers||window.VIZZ.COURIERS).filter(c=>opts.all?true:c.status!=="break");
    const N = opts.max||list.length;
    const handles=[];
    list.slice(0,N).forEach((c,i)=>{
      const m=L.marker(c.pos.slice(),{icon:beeIcon(c.status==="delivering"?"🛵":"🏍️",opts.iconSize||24)}).addTo(map);
      m.bindTooltip(`${c.name} · ${c.statusTr}`,{direction:"top",offset:[0,-6]});
      const h={courier:c,marker:m,path:null,cum:null,total:0,t:0,dur:1,busy:false};
      handles.push(h);
      setTimeout(()=>newLeg(h), i*350);   // stagger so the queue drains smoothly
    });

    async function newLeg(h){
      if(h.busy) return; h.busy=true;
      const from=h.marker.getLatLng(); const a=[from.lat,from.lng];
      const z=pick(Y.zones); const b=[z.c[0]+rnd(-.0012,.0012), z.c[1]+rnd(-.0012,.0012)];
      let path=await route(a,b);
      if(!path || path.length<2) path=straight(a,b,30);
      h.path=path; h.cum=cumDist(path); h.total=h.cum[h.cum.length-1]||1e-6;
      h.t=0; h.dur=rnd(26,46);            // seconds to traverse the whole leg (calm cruise)
      h.courier.zone=z.n; h.busy=false;
    }

    let last=performance.now();
    function tick(now){
      const dt=Math.min(0.05,(now-last)/1000); last=now;   // clamp dt to avoid jumps after tab-away
      handles.forEach(h=>{
        if(!h.path) return;
        h.t += dt/h.dur;
        if(h.t>=1){ if(!h.busy) newLeg(h); return; }
        const target=h.t*h.total;
        let lo=0,hi=h.cum.length-1;
        while(lo<hi-1){const mid=(lo+hi)>>1; if(h.cum[mid]<target)lo=mid;else hi=mid;}
        const seg=h.cum[hi]-h.cum[lo]||1e-9; const f=(target-h.cum[lo])/seg;
        const p0=h.path[lo],p1=h.path[hi];
        h.marker.setLatLng([p0[0]+(p1[0]-p0[0])*f, p0[1]+(p1[1]-p0[1])*f]);
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    setTimeout(()=>map.invalidateSize(),200);
    return {map,handles};
  };
})();
