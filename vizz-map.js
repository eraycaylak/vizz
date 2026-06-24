/* VIZZ shared live map — Leaflet + OSRM road routing.
   Couriers drive along real Yozgat streets; falls back to straight paths offline. */
(function(){
  const Y = window.VIZZ.YOZGAT;
  const rnd = (a,b)=>a+Math.random()*(b-a);
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

  function beeIcon(emoji,size){return L.divIcon({html:`<div class="vz-courier" style="font-size:${size||22}px">${emoji}</div>`,className:"",iconSize:[size||22,size||22],iconAnchor:[(size||22)/2,(size||22)/2]});}

  async function osrmRoute(a,b){
    // a,b = [lat,lng]; OSRM wants lng,lat
    const url=`https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`;
    const r=await fetch(url); if(!r.ok) throw 0;
    const j=await r.json();
    return j.routes[0].geometry.coordinates.map(c=>[c[1],c[0]]); // ->[lat,lng]
  }
  function straight(a,b,n){const pts=[];for(let i=0;i<=n;i++){pts.push([a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n]);}return pts;}

  function cumDist(path){let d=[0];for(let i=1;i<path.length;i++){const dx=path[i][0]-path[i-1][0],dy=path[i][1]-path[i-1][1];d.push(d[i-1]+Math.hypot(dx,dy));}return d;}

  window.VIZZ.initMap = function(elId, opts){
    opts = opts || {};
    const map = L.map(elId,{zoomControl:!opts.mini,attributionControl:false,dragging:!opts.lock,scrollWheelZoom:!opts.mini}).setView(Y.center, opts.zoom||Y.zoom);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map);

    // restaurant markers
    if(opts.showRest!==false){
      window.VIZZ.RESTAURANTS.forEach(r=>{
        const z=Y.zones.find(z=>z.n===r.zone)||Y.zones[0];
        L.marker([z.c[0]+rnd(-.001,.001),z.c[1]+rnd(-.001,.001)],{icon:beeIcon("🍽️",18)}).addTo(map).bindTooltip(r.name,{direction:"top"});
      });
    }
    // zone labels
    if(opts.showZones){
      Y.zones.forEach(z=>L.marker(z.c,{icon:L.divIcon({html:`<span class="vz-zonelbl">${z.n}</span>`,className:"",iconSize:[10,10]})}).addTo(map));
    }
    // delivery zone polygon (hull-ish around zones)
    const hull=[[39.829,34.801],[39.827,34.817],[39.819,34.819],[39.812,34.815],[39.813,34.802],[39.820,34.798]];
    L.polygon(hull,{color:"#F2A900",weight:2,dashArray:"6 6",fillColor:"#FFC400",fillOpacity:.06}).addTo(map);

    // couriers
    const list = (opts.couriers||window.VIZZ.COURIERS).filter(c=>opts.all?true:c.status!=="break");
    const N = opts.max||list.length;
    const handles=[];
    list.slice(0,N).forEach((c,i)=>{
      const emoji = c.status==="delivering" ? "🛵" : "🛵";
      const m=L.marker(c.pos.slice(),{icon:beeIcon(c.status==="delivering"?"🛵":"🏍️",opts.iconSize||24)}).addTo(map);
      m.bindTooltip(`${c.name} · ${c.statusTr}`,{direction:"top",offset:[0,-6]});
      const h={courier:c,marker:m,path:null,cum:null,pos:0,speed:rnd(.6,1.3)*(opts.speed||1)};
      handles.push(h);
      newLeg(h,i*250);
    });

    async function newLeg(h,delay){
      const from = h.marker.getLatLng(); const a=[from.lat,from.lng];
      const to = pick(Y.zones).c; const b=[to[0]+rnd(-.0015,.0015),to[1]+rnd(-.0015,.0015)];
      let path;
      try{ path = await osrmRoute(a,b); if(!path||path.length<2) throw 0; }
      catch(e){ path = straight(a,b,40); }
      h.path=path; h.cum=cumDist(path); h.pos=0; h.total=h.cum[h.cum.length-1];
      h.courier.zone = to.__|| (Y.zones.find(z=>z.c===to)?.n)||h.courier.zone;
    }

    let last=performance.now();
    function tick(now){
      const dt=(now-last)/1000; last=now;
      handles.forEach(h=>{
        if(!h.path) return;
        h.pos += h.speed*0.00012*dt*60;
        if(h.pos>=h.total){ newLeg(h); return; }
        // find segment
        let lo=0,hi=h.cum.length-1;
        while(lo<hi-1){const mid=(lo+hi)>>1; if(h.cum[mid]<h.pos)lo=mid;else hi=mid;}
        const seg=h.cum[hi]-h.cum[lo]||1e-9; const t=(h.pos-h.cum[lo])/seg;
        const p0=h.path[lo],p1=h.path[hi];
        h.marker.setLatLng([p0[0]+(p1[0]-p0[0])*t, p0[1]+(p1[1]-p0[1])*t]);
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    setTimeout(()=>map.invalidateSize(),200);
    return {map,handles};
  };
})();
