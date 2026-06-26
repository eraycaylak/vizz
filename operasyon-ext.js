/* VIZZ Operasyon — EK MODÜLLER (Minijett'ten taşınan, ferah dil)
   Atama Ayarları · Taşıma Ücretleri · Kontör · Kullanıcılar · Duyurular · Destek
   operasyon.js'ten sonra yüklenir; go() bunları window.VZEXT üzerinden çağırır. */
(function(){
const $=s=>document.querySelector(s), D=window.VIZZ;
const fmt=n=>Number(n).toLocaleString('tr-TR');
const toast=m=>{ try{ window.VZ && window.VZ.toast && window.VZ.toast(m); }catch(e){} };

/* ---- ortak yapı taşları ---- */
function head(title,sub,right){return `<div class="rhead"><div><h2>${title}</h2><p>${sub}</p></div>${right||''}</div>`;}
function tabsBar(mod,items,active){return `<div class="tabs">${items.map(([k,n])=>`<button class="${k===active?'on':''}" onclick="VZX.tab('${mod}','${k}')">${n}</button>`).join('')}</div>`;}
function toggleRow(lab,desc,on){return `<div class="setrow"><div><div class="lab">${lab}</div>${desc?`<div class="desc">${desc}</div>`:''}</div>
  <div class="swwrap"><span class="st ${on?'on':''}">${on?'AÇIK':'KAPALI'}</span><div class="sw ${on?'on':''}" onclick="VZX.sw(this)"><i></i></div></div></div>`;}
function selField(lab,val,hint,rec){return `<div class="field"><label>${lab}</label><div class="selbox" onclick="VZX.toast('${lab} — seçenekler')">${val}${rec?' <span class="badge b-y" style="font-size:10px;margin-left:8px">önerilen</span>':''}<svg class="ic ic-sm" viewBox="0 0 24 24" style="color:var(--tx-3)"><path d="M6 9l6 6 6-6"/></svg></div>${hint?`<div class="hint">${hint}</div>`:''}</div>`;}
const T={atama:'genel',tasima:'aktif'};

/* ============ ATAMA AYARLARI (3 sekme) ============ */
function buildAtama(){
  const tab=T.atama;
  let body='';
  if(tab==='genel'){
    body=`
    <div class="setcard accent"><div class="setrow" style="border:none;padding:6px 0">
      <div><div class="lab">Otomatik Atama</div><div class="desc">Kapalıysa bu zincir için otomatik atama tamamen durur, tüm paketler manuel atanır.</div></div>
      <div class="swwrap"><span class="st on">AÇIK</span><div class="sw on" onclick="VZX.sw(this)"><i></i></div></div></div></div>

    <div class="setcard"><div class="sectitle">Atama Algoritması</div>
      ${selField('Algoritma','Akıllı Skor (VIZZ)','Kurye güven skoru + mesafe/ETA + anlık yük + bölge uyumu + adalet ağırlıklı çok-kriterli skor. Açıklanabilir gerekçe loglanır. (Klasik seçenekler: Sıralı Atama · En Yakın Kurye)',true)}
      ${selField('Sıralama Kriteri','En Az Siparişli','Eşit skorda öncelik: en az siparişli veya en uzun süredir boşta olan kurye.')}
    </div>

    <div class="setcard"><div class="sectitle">Kümeleme</div>
      ${selField('Kümeleme Algoritması','Restoran Bazlı Kümeleme','Aynı restorandan/komşu adrese giden paketleri tek kuryede toplar — km ve süre düşer. (Yok · Restoran Bazlı · Coğrafi Yakınlık)')}
    </div>

    <div class="setcard"><div class="sectitle">Genel Parametreler</div>
      <div class="setrow" style="border:none"><div><div class="lab">Kurye Kapasitesi</div><div class="desc">Her kuryenin aynı anda taşıyabileceği maksimum paket sayısı.</div></div>
        <div class="inp" style="width:90px;text-align:center" contenteditable="false">2</div></div>
      ${toggleRow('Mesafe Limiti Uygula','Restorana X km üstündeki kuryelere atama yapma. (Şu an: limit yok)',false)}
    </div>

    <div class="setcard"><div class="sectitle">Sabitleme & Kısıt</div>
      ${toggleRow('Kurye–Restoran Sabitleme','Sabitlenmiş restoranın siparişleri yalnızca sabit kuryelere atanır. Uygun kurye yoksa sipariş bekletilir.',false)}
      ${toggleRow('Restoran Bazlı Kümeleme','Açıkken sistem aynı restorandan gelen paketleri mümkün olduğunca aynı kuryeye verir.',true)}
    </div>

    <div class="setcard"><div class="sectitle">Manuel Atama Usulleri</div>
      ${toggleRow('Kurye Arası Transfer','Bir kuryenin paketini başka bir kuryeye aktarmaya izin verir.',false)}
      ${toggleRow('Havuzdan Paket Çekme','Kuryenin havuzdaki atanmamış paketleri kendine çekmesine izin verir.',true)}
    </div>

    <div class="setcard" style="background:linear-gradient(120deg,rgba(76,141,255,.10),var(--s2) 60%);border-color:rgba(76,141,255,.25)">
      <div style="display:flex;gap:13px;align-items:flex-start"><svg class="ic" viewBox="0 0 24 24" style="color:var(--info);flex:none;margin-top:2px"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
        <div><div class="lab" style="margin-bottom:3px">VIZZ farkı — Akıllı Skor motoru</div><div class="desc" style="max-width:none">Bu algoritma <b>Otomasyon</b> sekmesindeki kurye güven skoru + GPS/geofence anomali radarını kullanır: işi sallayan/şüpheli kuryeyi skora yansıtır, SLA riskinde otomatik eskalasyon yapar. Rakipte yok.</div></div></div>
    </div>

    <button class="btn btn-y" style="width:100%;padding:14px;font-size:14px" onclick="VZX.save('Atama ayarları kaydedildi')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>Kaydet</button>`;
  } else if(tab==='bolgeler'){
    body=`<div class="setcard"><div class="rhead" style="margin-bottom:14px"><div><h2 style="font-size:17px">Atama Bölgeleri</h2><p>Harita üstünde poligon çiz → her bölgeye kurye havuzu + fiyat çarpanı ata. (0/100 bölge)</p></div>
      <button class="btn btn-y" onclick="VZX.toast('Harita çizim modu — yeni bölge')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Yeni Bölge</button></div>
      <div style="height:280px;border-radius:14px;border:1px dashed var(--line-2);background:radial-gradient(circle at 50% 40%,rgba(255,196,0,.06),var(--s1));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center">
        <svg class="ic" viewBox="0 0 24 24" style="width:46px;height:46px;color:var(--tx-4)"><path d="M9 3 4 5v16l5-2 6 2 5-2V3l-5 2-6-2Z"/><path d="M9 3v16M15 5v16"/></svg>
        <div><div style="font-size:15px;font-weight:700;color:var(--tx)">Bu zincirde henüz bölge yok</div><div class="desc" style="margin:6px auto 0">Yozgat haritası üzerinde ilk teslimat bölgeni çizerek başla.</div></div>
        <button class="btn btn-y" onclick="VZX.toast('Harita çizim modu')">İlk Bölgeyi Oluştur</button></div></div>`;
  } else {
    body=`<div class="setcard"><div class="rhead" style="margin-bottom:14px"><div><h2 style="font-size:17px">Atama Kısıtlamaları</h2><p>Belirli kuryelerin belirli restoranlardan paket almasını engelle (hijyen şikâyeti, anlaşmazlık vb.).</p></div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:12px;align-items:end;margin-bottom:18px">
        <div class="field" style="margin:0"><label>Kurye</label><div class="selbox" onclick="VZX.toast('Kurye seç')">Kurye ara…<svg class="ic ic-sm" viewBox="0 0 24 24" style="color:var(--tx-3)"><path d="M6 9l6 6 6-6"/></svg></div></div>
        <div class="field" style="margin:0"><label>Restoran</label><div class="selbox" onclick="VZX.toast('Restoran seç')">Restoran ara…<svg class="ic ic-sm" viewBox="0 0 24 24" style="color:var(--tx-3)"><path d="M6 9l6 6 6-6"/></svg></div></div>
        <button class="btn btn-y" style="height:46px" onclick="VZX.toast('Kısıtlama eklendi')">Engelle</button></div>
      <div style="text-align:center;padding:34px;color:var(--tx-3);font-size:13px;border-top:1px solid var(--line)">Henüz hariç tutma tanımlanmamış.</div></div>`;
  }
  $('#v-atama').innerHTML=head('Atama Ayarları','kural motoru konfigürasyonu · açıklanabilir atama')+
    tabsBar('atama',[['genel','Genel Ayarlar'],['bolgeler','Atama Bölgeleri'],['kisit','Atama Kısıtlamaları']],tab)+body;
}

/* ============ TAŞIMA ÜCRETLERİ ============ */
function buildTasima(){
  const rows=D.RESTAURANTS.map((r,i)=>{const rest=39+(i*7)%26, kur=22+(i*5)%18; return {name:r.name,zone:r.zone,tip:i%2?'Sabit':'Mesafeli',rest,kur,gec:'01.06.2026 →',durum:i%5===0?['Pasif','b-mute']:['Aktif','b-ok']};});
  $('#v-tasima').innerHTML=head('Taşıma Ücretleri','restoran ücreti & kurye ücreti — aradaki fark VIZZ marjı',
    `<button class="btn btn-y" onclick="VZ.formModal('tarife')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Yeni Tanım</button>`)+
    tabsBar('tasima',[['aktif','Aktif Tanımlar'],['gecmis','Geçmiş']],T.tasima)+
    `<div class="kstrip" style="grid-template-columns:repeat(3,1fr)">
       <div class="kpi"><div class="lab">Ort. restoran ücreti</div><div class="val">₺<span class="num">48</span></div><div class="sub flat">paket başı</div></div>
       <div class="kpi"><div class="lab">Ort. kurye ücreti</div><div class="val">₺<span class="num">29</span></div><div class="sub flat">paket başı</div></div>
       <div class="kpi accent"><div class="lab">Ort. VIZZ marjı</div><div class="val">₺<span class="num">19</span></div><div class="sub up">▲ %39 marj</div></div></div>
     <div class="card"><div style="overflow:auto"><table class="grid"><thead><tr><th>Restoran</th><th>Bölge</th><th>Ücret Tipi</th><th>Restoran Ücreti</th><th>Kurye Ücreti</th><th>Marj</th><th>Geçerlilik</th><th>Durum</th><th></th></tr></thead><tbody>`+
     rows.map(x=>`<tr><td><b>${x.name}</b></td><td>${x.zone}</td><td><span class="badge b-mute" style="font-size:10px">${x.tip}</span></td>
       <td class="num">₺${x.rest}</td><td class="num">₺${x.kur}</td><td class="num"><b style="color:var(--ok)">₺${x.rest-x.kur}</b></td>
       <td class="dim">${x.gec}</td><td><span class="badge ${x.durum[1]}"><span class="dot"></span>${x.durum[0]}</span></td>
       <td><button class="btn btn-ghost btn-icon" onclick="VZ.formModal('tarife','${x.name} — Ücret Düzenle')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button></td></tr>`).join('')+
     `</tbody></table></div></div>`;
}

/* ============ KONTÖR / BAKİYE ============ */
function buildKontor(){
  const tx=[
    {d:'26.06.2026',t:'Sipariş kesintisi',m:-318,n:53,a:'Bugünkü 53 teslimat · paket başı kontör'},
    {d:'24.06.2026',t:'Bakiye yükleme',m:25000,n:'—',a:'Havale/EFT · onaylandı'},
    {d:'20.06.2026',t:'Sipariş kesintisi',m:-402,n:67,a:'Haftalık toplu kesinti'},
    {d:'18.06.2026',t:'Hediye kontör',m:5000,n:'—',a:'Kampanya · ilk ay hediyesi'},
    {d:'12.06.2026',t:'Bakiye yükleme',m:25000,n:'—',a:'Kredi kartı · iyzico'},
  ];
  $('#v-kontor').innerHTML=head('Kontör / Bakiye','platform ön-ödemeli bakiye · her teslimattan kontör düşülür',
    `<button class="btn btn-y" onclick="VZX.toast('Kontör yükleme — iyzico')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Kontör Yükle</button>`)+
    `<div class="kstrip" style="grid-template-columns:repeat(4,1fr)">
       <div class="kpi accent"><div class="lab">Mevcut bakiye</div><div class="val">₺<span class="num">48.240</span></div><div class="sub flat">~7.560 teslimat</div></div>
       <div class="kpi"><div class="lab">Toplam yüklenen</div><div class="val">₺<span class="num">125.000</span></div><div class="sub up">▲ bu ay 50K</div></div>
       <div class="kpi"><div class="lab">Toplam tüketilen</div><div class="val">₺<span class="num">81.760</span></div><div class="sub flat">13.6K teslimat</div></div>
       <div class="kpi"><div class="lab">Hediye kontör</div><div class="val">₺<span class="num">5.000</span></div><div class="sub up">kampanya</div></div></div>
     <div class="setcard accent" style="display:flex;align-items:center;justify-content:space-between;gap:16px">
       <div style="display:flex;gap:13px;align-items:center"><svg class="ic" viewBox="0 0 24 24" style="color:var(--y)"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
         <div><div class="lab">Otomatik yükleme</div><div class="desc">Bakiye ₺10.000 altına inince kayıtlı kartından ₺25.000 otomatik yükle.</div></div></div>
       <div class="swwrap"><span class="st on">AÇIK</span><div class="sw on" onclick="VZX.sw(this)"><i></i></div></div></div>
     <div class="card"><div class="card-h"><div class="t">Kontör İşlemleri</div><span class="dim" style="font-size:11px">son 30 gün</span></div>
       <div style="overflow:auto"><table class="grid"><thead><tr><th>Tarih</th><th>İşlem Tipi</th><th>Miktar</th><th>Sipariş Sayısı</th><th>Açıklama</th></tr></thead><tbody>`+
       tx.map(x=>`<tr><td class="dim num">${x.d}</td><td><b>${x.t}</b></td><td class="num"><b style="color:${x.m<0?'var(--bad)':'var(--ok)'}">${x.m<0?'−':'+'}₺${fmt(Math.abs(x.m))}</b></td><td class="num">${x.n}</td><td class="dim">${x.a}</td></tr>`).join('')+
       `</tbody></table></div></div>`;
}

/* ============ KULLANICILAR (RBAC) ============ */
function buildKullanicilar(){
  const roles={Sahip:'b-y',Operasyon:'b-info',Mağaza:'b-ok',Muhasebe:'b-mute'};
  const users=[
    {n:'Eray Çaylak',u:'eray',e:'eray@vizz.com',rol:'Sahip',mag:'Tümü',d:['Aktif','b-ok'],son:'2 dk önce'},
    {n:'Caner Tunç',u:'caner.t',e:'caner@vizz.com',rol:'Operasyon',mag:'Tümü',d:['Aktif','b-ok'],son:'1 sa önce'},
    {n:'Selin Kaya',u:'selin',e:'selin@cap.com',rol:'Mağaza',mag:'Çapanoğlu Köft.',d:['Aktif','b-ok'],son:'Dün'},
    {n:'Murat Demir',u:'murat',e:'murat@vizz.com',rol:'Muhasebe',mag:'Tümü',d:['Pasif','b-mute'],son:'12 Haz'},
  ];
  $('#v-kullanicilar').innerHTML=head('Kullanıcılar','rol & izin yönetimi · kim neyi görebilir/yapabilir',
    `<button class="btn btn-y" onclick="VZ.formModal('kullanici')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Yeni Kullanıcı</button>`)+
    `<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:14px;margin-bottom:20px">
      ${[['Sahip','Tam yetki','b-y'],['Operasyon Müdürü','Atama·kurye·rapor','b-info'],['Mağaza Yöneticisi','Kendi mağazası','b-ok'],['Muhasebe','Finans·fatura·hakediş','b-mute']].map(r=>`<div class="setcard" style="margin:0;padding:16px"><span class="badge ${r[2]}" style="margin-bottom:9px">${r[0]}</span><div class="desc" style="margin-top:8px">${r[1]}</div></div>`).join('')}
    </div>
    <div class="card"><div class="card-h"><div class="t">Sistemdeki Kullanıcılar</div>
      <div style="display:flex;gap:9px"><div class="selbox" style="width:150px" onclick="VZX.toast('Rol filtresi')">Tüm roller<svg class="ic ic-sm" viewBox="0 0 24 24" style="color:var(--tx-3)"><path d="M6 9l6 6 6-6"/></svg></div></div></div>
      <div style="overflow:auto"><table class="grid"><thead><tr><th>Ad Soyad</th><th>Kullanıcı Adı</th><th>E-posta</th><th>Rol</th><th>Mağaza</th><th>Durum</th><th>Son Aktivite</th><th>İşlemler</th></tr></thead><tbody>`+
      users.map(x=>`<tr><td><div style="display:flex;align-items:center;gap:10px"><div class="av on">${x.n.split(' ').map(p=>p[0]).join('')}</div><b>${x.n}</b></div></td>
        <td class="dim">@${x.u}</td><td class="dim">${x.e}</td><td><span class="badge ${roles[x.rol]}">${x.rol}</span></td><td>${x.mag}</td>
        <td><span class="badge ${x.d[1]}"><span class="dot"></span>${x.d[0]}</span></td><td class="dim">${x.son}</td>
        <td><div style="display:flex;gap:5px"><button class="btn btn-ghost btn-icon" onclick="VZ.formModal('kullanici','${x.n} — Düzenle')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button><button class="btn btn-ghost btn-icon" onclick="VZX.toast('${x.n} pasife al')"><svg class="ic ic-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M5 5l14 14"/></svg></button></div></td></tr>`).join('')+
      `</tbody></table></div></div>`;
}

/* ============ DUYURULAR ============ */
function buildDuyurular(){
  const list=[
    {t:'Yoğun saat primi başladı',d:'25 Haz 2026',b:'19:00–22:00 arası tamamlanan her teslimat için +₺8 prim. Otomatik hakedişe yansır.',s:['Aktif','b-ok'],to:'Kuryeler'},
    {t:'Yeni restoran: Çapanoğlu Köftecisi',d:'23 Haz 2026',b:'Çapanoğlu bölgesine yeni işletme eklendi. Hazırlık süresi ~18 dk.',s:['Aktif','b-ok'],to:'Tüm ekip'},
    {t:'Bakım penceresi',d:'20 Haz 2026',b:'Pazar 03:00–04:00 arası kısa bakım yapılacak; atama 60 sn durabilir.',s:['Pasif','b-mute'],to:'Yöneticiler'},
  ];
  $('#v-duyurular').innerHTML=head('Duyurular','ekip & kurye bilgilendirmeleri',
    `<button class="btn btn-y" onclick="VZ.formModal('duyuru')"><svg class="ic ic-sm" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Yeni Duyuru</button>`)+
    `<div style="display:flex;flex-direction:column;gap:14px;max-width:840px">`+
    list.map(x=>`<div class="setcard" style="margin:0">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px">
        <div style="display:flex;gap:13px"><div style="width:42px;height:42px;border-radius:12px;background:var(--y-soft);display:grid;place-items:center;flex:none"><svg class="ic" viewBox="0 0 24 24" style="color:var(--y)"><path d="M3 11v2a1 1 0 0 0 1 1h2l9 5V5L6 10H4a1 1 0 0 0-1 1Z"/><path d="M18 8.5a4 4 0 0 1 0 7"/></svg></div>
          <div><div style="font-size:15px;font-weight:700;color:var(--tx)">${x.t}</div><div class="desc" style="max-width:none;margin-top:5px">${x.b}</div>
            <div style="display:flex;gap:8px;margin-top:10px"><span class="badge b-mute" style="font-size:10px">${x.to}</span><span class="dim" style="font-size:11px">${x.d}</span></div></div></div>
        <span class="badge ${x.s[1]}"><span class="dot"></span>${x.s[0]}</span></div></div>`).join('')+`</div>`;
}

/* ============ DESTEK MERKEZİ ============ */
function buildDestek(){
  const faq=[['Atama nasıl çalışıyor?','Akıllı Skor motoru kurye güven skoru + mesafe + yük + bölgeye göre en uygun kuryeyi seçer.'],
    ['Kontör nasıl yüklerim?','Kontör sayfasından kart veya havale ile yükleyebilir, otomatik yüklemeyi açabilirsin.'],
    ['Kurye hakedişi ne zaman ödenir?','Her Cuma 18:00 — Finans > Cuma Ödeme Listesi onayından sonra IBAN’a aktarılır.'],
    ['İşi sallayan kuryeyi nasıl yakalarım?','Otomasyon > Anomali Radarı GPS/geofence + iptal desenini izler, güven skorunu düşürür.']];
  $('#v-destek').innerHTML=head('Destek Merkezi','7/24 yardım · sık sorulanlar · talep oluştur','')+
    `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:22px">
      ${[['Canlı Destek','Ortalama yanıt 2 dk','M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z','Sohbeti Başlat'],
         ['Telefon Hattı','Hafta içi 09:00–21:00','M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13 1 .4 1.9.74 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.85.6 2.8.74A2 2 0 0 1 22 16.9Z','0850 000 00 00'],
         ['Talep Oluştur','Teknik / fatura / öneri','M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 0v6h6M9 13h6M9 17h4','Yeni Talep']]
        .map(c=>`<div class="setcard" style="margin:0;text-align:center;padding:24px 18px"><div style="width:50px;height:50px;border-radius:14px;background:var(--y-soft);display:grid;place-items:center;margin:0 auto 14px"><svg class="ic" viewBox="0 0 24 24" style="width:24px;height:24px;color:var(--y)"><path d="${c[2]}"/></svg></div>
          <div style="font-size:15px;font-weight:700;color:var(--tx)">${c[0]}</div><div class="desc" style="margin:6px auto 14px">${c[1]}</div>
          <button class="btn btn-y" onclick="VZX.toast('${c[0]}')">${c[3]}</button></div>`).join('')}
    </div>
    <div class="card" style="max-width:840px"><div class="card-h"><div class="t">Sık Sorulan Sorular</div></div>
      <div style="padding:6px 0">${faq.map(f=>`<div class="setrow" style="padding:16px 22px;cursor:pointer" onclick="VZX.toast('${f[0]}')">
        <div style="flex:1"><div class="lab">${f[0]}</div><div class="desc" style="max-width:none;margin-top:5px">${f[1]}</div></div>
        <svg class="ic ic-sm" viewBox="0 0 24 24" style="color:var(--tx-3);flex:none"><path d="M9 18l6-6-6-6"/></svg></div>`).join('')}</div></div>`;
}

/* ---- aksiyonlar + view kayıt ---- */
window.VZX={
  atama:buildAtama, tasima:buildTasima, kontor:buildKontor, kullanicilar:buildKullanicilar, duyurular:buildDuyurular, destek:buildDestek,
  tab(mod,t){ T[mod]=t; ({atama:buildAtama,tasima:buildTasima}[mod]||(()=>{}))(); },
  sw(el){ el.classList.toggle('on'); const st=el.parentNode.querySelector('.st'); if(st){const on=el.classList.contains('on'); st.textContent=on?'AÇIK':'KAPALI'; st.classList.toggle('on',on);} toast('Ayar güncellendi'); },
  save(m){ toast(m||'Kaydedildi'); },
  toast
};
/* go() view→build map'i VZEXT üzerinden çağırıyor (view adıyla indexlenir) */
window.VZEXT=window.VZX;
})();
