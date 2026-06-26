---
name: vizz-projesi
description: VIZZ — Yozgat yerel yemek sipariş + teslimat platformu (+VIZZ Market q-commerce dikeyi); marka sarı-siyah arı maskotu
metadata:
  node_type: memory
  type: project
  originSessionId: 8b434ae8-055d-4103-94e3-c842366d9d81
---

# VIZZ — proje hafızası (güncel: 27 Haz 2026)

**Ne:** Yozgat merkezde, **kendi esnaf kurye filolu** yerel **yemek sipariş + teslimat platformu** (B2C pazaryeri + B2B teslimat). Rakipler: **Hızır Paket, Paketçiniz, Maxijett** (TR kurye SaaS) + Getir/Yemeksepeti. **%80 operasyon / %20 son kullanıcı** vurgusu. İkinci dikey: **VIZZ Market** (hızlı atıştırmalık q-commerce). Detaylı master spec sohbette (Bölüm 0-11).

**Marka:** **arı (bee) maskotu**, altıgen rozet + "VIZZ" wordmark. Renk **SARI #FFC400 + SİYAH #111 + beyaz** (mavi DEĞİL — Eray sarı-siyah istedi). Arı = hız + "vızz" sesi + yerellik.

**KONUM:** `Desktop/Github-Projelerim/VIZZ-tasarim/` (masaüstü temiz kalsın diye — bkz. [[duzen-takintisi]]). **CANLI:** https://eraycaylak.github.io/vizz/ (GitHub Pages, repo github.com/eraycaylak/vizz, public, statik). Güncelleme = klasörde düzenle → `git add -A && git commit && git push`. Pages TR'de çalışıyor. Anahtar repoda YOK. **Not:** GitHub Pages + tarayıcı önbelleği → JS/CSS değişince cache-bust (`?v=`) + kullanıcıya hard-refresh (Cmd+Shift+R) söyle.

## Klasör düzeni
Kök = site (Pages yayınlar). `img/` (yemek/market fotoları + müzik), `models/` (4 optimize .glb quantize), `marka/` (logo + kıyafet + sepet), `3d-referans-fotolar/` (Meshy multi-view), `docs/` (planlar), `_arsiv/` (gitignored — eski sürümler + gen scriptleri + ham modeller). Kökte Eray'ın görsel-çekme scriptleri kalmış olabilir (`fetch_images*.js`, `patch_data.js`, `wiki_images.json`) — temizlenebilir.

## Yüzeyler — HEPSİ PRO (vizz-pro.css dark sistem)
Sunum prototipi: `index.html` = **hub** (kare kartlar → cihaz çerçevesinde iframe canlı aç, tek sekme). Tüm yüzeyler **`vizz-pro.css`** profesyonel **dark-NOC** sisteminde (4-katman koyu yüzey + sarı spotlight + çizgi-ikon, **emoji-UI yok** + `tabular-nums` + **ECharts gerçek grafik** + **CARTO koyu harita**):
- `operasyon.html`+`operasyon.js` = **Operasyon Merkezi (Dispatcher, asıl odak)**. Görünümler: Komuta(NOC: koyu Yozgat haritası+kuryeler+kapsama) · Görevler(tablo) · Kuryeler(grid+scorecard drawer) · **Dükkanlar**(8 işletme: bugün paket/ciro/komisyon/**cari net hakediş**/hazırlık/puan/durum + tıkla→drawer: 7-gün ciro chart+en çok satan+cari hesap) · **Otomasyon**(26 Haz eklendi — yatırımcı farkı: kural+skor motoru canlı karar feed'i [red→sıra-sonu, arıza→reassign, SLA eskalasyon, bölge dengele] + karar-tipi donut + **Kurye Güven Skoru tablosu** [GPS/kabul/zamanında/şüpheli-iptal sinyalleri, 4 risk katmanı: Riskli/İzleniyor/Güvenilir, `ctrust()` deterministik skor] + **Anomali & Sahtekârlık Radarı** [işi-sallama/geofence-dışı-teslim/hareketsizlik]; satır→kurye drawer reuse) · Bölgeler · Finans(Cuma+COD) · **Raporlar**(leapfrog: SLA gauge, persentil P50/P90/P95, aşama darboğazı, ısı haritası, iptal pareto, birim ekonomi waterfall, bölge ciro, kurye scatter) · Ayarlar. **(27 Haz çok genişledi — aşağıdaki "27 Haz" bölümüne bak; cache `?v=ferah8`.)**
- `musteri-mobil.html` (premium koyu tüketici app + Domino's takip; sekmeler: Keşfet/Restoran/Sepet/Takip/Hesap + **26 Haz eklenen 4 alt-ekran: Favoriler · Geçmiş Siparişler [tekrar-sipariş/değerlendir] · Kampanyalar [kupon kodlu fırsat kartları] · Adres Yönetimi**; profil'de hızlı-erişim grid, `parentTab` highlight + lazy build, keşfet zili→kampanyalar) · `musteri-web.html` (premium koyu + koyu Yozgat haritası) · `kurye-mobil.html` (pro koyu kurye app + **Cuma sayacı** + ECharts kazanç + görev makinesi) · `restoran-panel.html` (koyu merchant konsolu, KDS kanban + ECharts rapor + **26 Haz: Finans & Cari görünümü** — komisyon şeffaflığı, brüt−komisyon−iade=net hakediş, haftalık ciro/net chart, Cuma ödeme + ödeme geçmişi) · `restoran-mobil.html`.
- `modeller.html` = 3D galeri (4 model: arı maskotu, kurye+motor, top-case, koleksiyon; quantize ~7-22MB).
- Paylaşımlı: `vizz-data.js` (mock data + base64 logo + 34 gerçek Yozgat mahallesi, yayılmış koordinat + ~4km kapsama poligonu), `vizz-map.js` (Leaflet + OSRM yol rotalama, fitBounds çerçeveleme), `vizz.css` (eski hub teması).

## VIZZ Market (2. dikey — q-commerce atıştırmalık)
Plan: `docs/VIZZ-MARKET-PLAN.md`. Mantık: mevcut filo + dispatcher + termal sepet + Go backend + tasarım sistemini yeniden kullan; **boş kalan kuryeyi (meal-rush dışı) paraya çevir**. Model: **kendi mini-deposu** (öneri), ~250-400 atıştırmalık SKU (çikolata/cips/içecek/dondurma…), büyük market DEĞİL. Yüzeyler: müşteri mobil+web + depo/toplama paneli + dispatcher'a `Market` etiketi. **Eray bu yüzeyleri kurdu:** `market-mobil.html`, `market-web.html`, `market-depo.html`. **Data `window.VIZZ.MARKET`** (depo/cats/products[51]/fee/minBasket/freeOver) zaten vizz-data.js'te. **26 Haz fix:** market-mobil tanımsız `syncBar()` IIFE'yi satır-62'deki render'dan önce çökertiyordu → tüm app boştu; `syncBar` tanımlandı (alt sepet barı), 51 ürün+kategori+sepet+ödeme+takip artık çalışıyor. market-web/depo zaten sağlamdı. **Sağlık taraması (26 Haz):** 9 yüzeyin hepsi açılışta-ölü JS taramasından geçti — tek ölü yüzey market-mobil'di, düzeltildi.

## Eray'ın 26 Haz manuel eklemeleri (kendi yaptı)
Hub'a: **intro video overlay** + **arka plan müzik** (artık `img/vizz2.mp3` — eskisi whatsapp-rap, _arsiv'e alındı; vizz2 aslında `.jpeg` adıyla geliyordu ama MP3'tü, `.mp3` yapıldı) · **arı + bal kavanozu özel cursor** (tüm app) · arı maskot kanat-çırpma animasyonu · tıkla→arı saçılma efekti · yüzen **chatbot maskot (beeBot)** · **aydınlık/koyu harita teması** · Wikimedia market ürün fotoları · sipariş reddi cezası (kuyruk sonuna at). Genel his eğlenceli; yatırımcı sunumunda bazı oyunsu öğeler (otomatik müzik, NOC panelde arı-cursor/saçılma) profesyonelliği zedeleyebilir — incelenebilir.

## Operasyon — Minijett'ten ferah genişletme (26 Haz)
Rakip **Minijett-kokpit (Maxijett ürünü, `kokpit.minijett.com.tr`)** incelendi (kayıtlı DOM + canlı Chrome) → `docs/MINIJETT-ANALIZ.md`. Onlar: Vite+React+Tailwind+Leaflet, **#F5C518 altın-sarı + siyah**, 11px ultra-kompakt ama **ferah whitespace**, 52px rail, **her sayfada sabit KPI şeridi**, 2-algoritma atama (Sıralı/En Yakın), kontör/prepaid model, RBAC, 8 rapor tipi. **Zayıf: akıllı/öğrenen yok, anomali/güven-skoru yok, çok-kanal/tüketici yok = VIZZ farkı.**
Eray "operasyon çok sıkış tıkış, onlarınki ferah" dedi → **operasyon ferahlatıldı + 6 yeni modül + sabit KPI bandı:**
- **Ferah layout:** `.view` içerik **1260px ortalanmış kolon** + cömert padding (36/59px), 24px başlık, ferah kart/tablo. Komuta haritası tam genişlik kaldı.
- **Sabit üst KPI pill şeridi** (`.kpibar`, her sayfada): Bugün teslim/Aktif kurye/Max/Oto/Bakiye/SLA/Yoğunluk/Hazırlık (renkli nokta + dikey bölme).
- **Rail 15 modül** (kaydırılabilir), Görevler→**Siparişler** (tarih+filtre+CSV+durum pipeline+Kaynak[Yemeksepeti/Trendyol/Getir]+Taşıma Ücr.).
- **`operasyon-ext.js` (yeni dosya) 6 modül:** **Atama Ayarları**(3 sekme: Genel[**Akıllı Skor VIZZ önerilen** + Sıralı/En Yakın, sıralama kriteri, kümeleme, kapasite, mesafe limiti, sabitleme, manuel transfer/havuz]/Bölgeler/Kısıtlamalar) · **Taşıma Ücretleri**(restoran vs kurye ücreti = marj) · **Kontör/Bakiye**(prepaid + otomatik yükleme + işlem geçmişi) · **Kullanıcılar**(RBAC rol+izin: Sahip/Operasyon/Mağaza/Muhasebe) · **Duyurular** · **Destek Merkezi**.
- **Ayarlar** 3 sekmeye genişledi (Operasyonel[mola kuralları+yoğun saat+sipariş kuralları]/Konum[görünürlük+geofence]/Mali[komisyon+Cuma ödeme+COD+e-Fatura]).
- **Yeni ferah bileşenler (operasyon.html CSS):** `.setcard/.setrow/.tabs/.sw(AÇIK-KAPALI metin etiketli sarı toggle)/.selbox/.field/.inp`. Mimari: `operasyon.js` go() yeni view'leri **`window.VZEXT`** (=ext'in VZX'i) üzerinden çağırır; aksiyonlar `window.VZX` (tab/sw/save/toast). Cache-bust `?v=ferah8` (güncel).

## Master plan & teknoloji (`docs/VIZZ-URUN-MASTER-PLAN.md`)
13 ajanlı derin araştırma çıktısı (rakip analizi + özellik matrisi + tasarım sistemi + tech mimarisi + adversaryal eleştiri). **Eleştirinin sert gerçekleri (Eray sonra halledecek):** KVKK · e-Fatura/GİB · **kurye SGK muvazaası** · **soğuk başlangıç (ilk 10 restoran arzı)** · "MVP aslında tam ürün, daralt". **Masaüstü modülü ÇIKARILDI** (web panel + Flutter mobil).
**TEKNOLOJİ KARARI VERİLDİ (26 Haz 2026)** → `docs/VIZZ-MIMARI-KARARI.md`: **Go (modüler monolit) + PostgreSQL/PostGIS + Redis, Hetzner'de stateful çekirdek; Flutter mobil (kurye+müşteri); Cloudflare YALNIZCA frontend (DNS/CDN/DDoS/Pages statik/R2)**. Gerçek-zaman = Go-WS+Redis pub/sub. Bildirim = FCM yüksek-öncelik + WS + **ack-yoksa SMS/çağrı+yeniden-ata**. Ödeme iyzico Pazaryeri. **Cloudflare Workers tek-başına backend DEĞİL** (D1'de PostGIS yok, ledger için transactional zayıf, stateful WS = DO ayrı paradigma → küçük ekipte risk). Entegrasyon (Yemeksepeti/Trendyol/Getir) = **`channels` adapter modülü** (webhook→`orders.channel` normalize→VIZZ ekranına; resmi API+anlaşma gerekir, mimari hazır). **Operasyon ajanı = kural+skor motoru (MVP, "AI deme—açıklanabilir otomasyon"): red→kuyruk sonu, arıza→yeniden ata, SLA eskalasyon, kurye güven skoru + GPS/geofence ile sahtekârlık/"işi sallama" yakalama; ML/LLM v2.** Veri-kaybı garantisi: Postgres ACID+WAL+PITR+replika+idempotency+outbox+event-log. **KIRMIZI ÇİZGİ:** event-log + channel + ledger + `branch_id` + courier_score şemaları MVP'de baştan.

**YENİ YÖN (26 Haz):** Yazılımı **dış geliştirici** yapacak. Biz = (a) **UI'ı eksiksiz/net bitir** (canlı prototip = görsel+akış spec'i), (b) geliştiriciye **detaylı final brief** → `docs/GELISTIRICI-BRIEFI.md`. Karar onayları: stack kesinleşti ✓ · ops kural+skor MVP/ML-v2 ✓.

## 27 Haz — restoran panel + canlı kanal + bug-fix + sipariş detay/kasa/derin rapor + entegrasyon araştırması
**Cache:** `operasyon.js?v=ferah8` + `operasyon-ext.js` (operasyon.html'de). restoran-panel/musteri-web inline script (cache-bust yok, hard-refresh yeter).

**(1) Minijett İŞLETME paneli keşfi (canlı Chrome) → `docs/MINIJETT-ANALIZ.md` Bölüm 3.** Aynı kokpit, restoran rolü (light tema, 6 modül). Bizden alınanlar restoran-panel'e eklendi (daha iyisiyle).

**(2) restoran-panel.html zenginleşti:**
- Üst bar: **cari bakiye pill** + **Kurye Çağır** (Sipariş Oluştur drawer: müşteri/telefon/adres+haritadan seç/fiyat/ödeme/hazırlık/araç/not + **VIZZ farkı: canlı tahmini ücret + en yakın kurye ETA**) + **Ödeme Al** (kurye+tutar→**4 haneli onay kodu** nakit mutabakat).
- Yeni **Canlı Takip** rail sekmesi: sol canlı sipariş listesi + sağ **Leaflet koyu Yozgat haritası** (restoran+kurye marker + Yolda için kesikli teslim rotası). Kanban (Panel) korundu = ikisi de var. Leaflet eklendi.
- **Yeni Ürün** drawer (`RP.urunEkle`: ad/açıklama/kategori/fiyat/hazırlık/opsiyon/görsel/vitrin) + menü düzenle açıyor.
- Ayarlar → **Entegrasyon & Kanallar** kartı: entegrasyon kodu(790559) + Yemeksepeti/Trendyol/Getir kanal eşleme + harici POS.

**(3) operasyon Komuta — CANLI ÇOK-KANAL DEMOSU (yatırımcı için):** Atama Kuyruğu üstünde "Canlı kanal akışı · Getir/Yemeksepeti/Trendyol/VIZZ App · bağlı" şeridi + her ~6-9sn rastgele kanaldan **yeni sipariş otomatik düşer** (slide-in `.newdrop` + marka renkli kanal rozeti + toast). `CHAN` renkleri: Getir mor #7B5CF0, Yemeksepeti pembe #FA0050, Trendyol turuncu #F27A1A, VIZZ App sarı, Telefon mavi. `channelFeed()` init'te başlar (document.hidden guard YOK — cap 16).
- **Saha—Canlı Kurye paneli KALDIRILDI**, Atama Kuyruğu tam yükseklik. Kurye listesi artık **"Sahadaki Kurye" KPI kartına tıkla → modal**. 6 KPI kartı tıklanabilir → ortalı **modal** (`openModal/closeModal`, #modal): aktif sipariş / saha kurye / teslimat P50-90-95 / SLA / bekleyen(ata butonlu) / ciro kırılımı.

**(4) BUG-FIX turu:** ekle/düzenle modalları açılmıyordu → reusable **`VZ.formModal(kind,editTitle)`** (6 tip: kurye/dukkan/kullanici/tarife/duyuru/bolge) tüm "Ekle"+"Düzenle" butonlarına bağlandı. restoran "Yeni Ürün" drawer. **müşteri-web sepet blur bug'ı:** `.cart` z-index 90→**110** (scrim 100'ün üstüne). **müşteri-web'de profil/adres yoktu** → nav'a **"Hesabım"** drawer (profil + Kayıtlı Adresler + **Yeni Adres Ekle** formu + Geçmiş Siparişler + Çıkış); scrim/Esc tüm overlay kapatır.

**(5) Sipariş veri + detay (Eray "müşteri/telefon/adres/ödeme/kurye lazım" dedi):** `enrichOrder()` → müşteri tam ad + telefon + tam adres; `payInfo()` Nakit/Kapıda POS/Online ikon+renk. **Sipariş DETAY MODALI** (`VZ.orderDetail`): müşteri/telefon/adres/restoran/ödeme/tutar/kurye + **sipariş akışı zaman çizelgesi**. Kuyruk kartı + Aktif Siparişler modalı + Siparişler tablosu → tıkla → detay. (Aktif Siparişler = tüm restoranlar, global.)

**(6) Kurye kasa + hız (araştırma temelli — son-mil KPI + COD kasa yönetimi):** kurye scorecard drawer'a **Kasa Mutabakatı** (cebindeki nakit + POS tahsilat + VIZZ'e teslim + **kasa limiti %bar; limit dolunca yeni sipariş durur** = fraud kontrolü + Nakit Teslim Al) + **Hız & Mesafe** (ort. teslimat dk / ort. km / km/saat). **Raporlar +3 grafik:** Yoğun Saatler×Restoran (stacked bar), Mesafe Dağılımı (km histogram), Kurye Hız Sıralaması (km/saat leaderboard). **Fix:** `reportsBuilt` deklaresizdi → ilk açılışta Raporlar boştu, `let reportsBuilt=false` eklendi.

**(7) Entegrasyon stratejisi araştırması → `docs/ENTEGRASYON-STRATEJISI.md`:** Yemeksepeti resmi partner (NDA+PGP+onay, zor) · Trendyol/Getir self-service (kolay) · **aggregator firmalar (Posentegra/API Merkezi ~$15/ay, tek webhook=4 platform — pratik yol)** · Maxijett çoğunlukla POS/aggregator üzerinden alıyor (entegrasyon kodu kancası). **VIZZ planı: aggregator-first → Trendyol/Getir kendin → Yemeksepeti sonra → POS köprüsü.** `docs/GELISTIRICI-BRIEFI.md` prototiple senkronlandı (§5.1 ekran ekran modül envanteri + §6.3 entegrasyon stratejisi).

## 27 Haz — Mimari: Yüksek Erişilebilirlik / SPOF-yok (yazılımcı geri bildirimi)
Yazılımcı "para dönüyor, microservice + yedekli sunucu/backend olmalı, sunucu çökse başka ayağa kalksın, 1 saat kesinti tüm trafiği kilitler" dedi. **Çekirdek kaygı %100 haklı** → SPOF-yok pazarlık dışı gereksinim oldu. **AMA dürüst nüans verildi:** HA ≠ microservices; HA = çok-kopya+failover+replikasyon (monolit'te de aynı). Microservice bedeli para için tehlikeli (**dağıtık transaction → ledger tutarsızlığı**, +DevOps, küçük ekipte erken microservice = daha çok kesinti). **Karar: yatay-ölçeklenebilir MODÜLER MONOLİT + net servis sınırları** (Shopify/Stripe yolu): ≥2 app instance+LB, Postgres primary+replica+Patroni oto-failover+PITR, Redis Sentinel, blue-green deploy, her katman ≥2 kopya. **Servis çıkarma yol haritası (baskı gelince):** `realtime/channels/notify/reporting` ayrılır (★); **ledger çekirdekte kalır, bölünmez.** → `docs/VIZZ-MIMARI-KARARI.md §HA` + `GELISTIRICI-BRIEFI.md §6.6`. Yeni UI özellikleri (kasa/sipariş-detay-alanları/yoğun-saat/mesafe/hız) de modül+veri modeline işlendi. **Dürüst öneri: saf microservice'i çok-şehir trafiği patlayınca yap.**

## 27 Haz (2) — operasyon mobil + restoran yüksek-hacim liste + handoff
- **`operasyon-mobil.html` (YENİ yüzey):** cepten dispatcher — device frame + 4 KPI + **Atama Kuyruğu** (kanal rozetli sipariş kartları, müşteri/bölge/ödeme + tek-tık Otomatik Ata) + **canlı kanal akışı** (her ~7sn yeni sipariş düşer) + tab'lar: Akış/Harita(Leaflet)/Kuryeler(kasa rozetli)/Daha. `index.html` hub'a kart eklendi. (Eray "mobilde hiç yokuz" dedi.)
- **restoran-panel Sipariş Panosu: Kanban ↔ Liste(hepsi) toggle** — Eray "100 sipariş alt alta sığmaz, Minijett gibi hepsini gör" dedi → Liste modu = tek kompakt `table.grid` (id/kanal/müşteri/ürün/tutar/durum/SLA/kurye/aksiyon), stage'e göre sıralı, advance çalışır. `RP.panoView('kanban'|'liste')`, `refreshPano()`.
- **Geliştirici devri:** repo **public kalsın** kararı (Eray). `docs/` + canlı prototip + **`memorybackup/` klasörü repoya konuldu** (github.com/eraycaylak/vizz/tree/main/memorybackup): `vizz-projesi.md` + `MEMORY.md` + `RESTORE-NASIL-KULLANILIR.md` (3 geri-yükleme yolu). Sadece VIZZ hafızası (kişisel/diğer-proje hariç).

## 27 Haz (5) — Büyüme & Ödül motoru (Hızır'dan pay al) + rakip-gap'ler
- **Bağlam:** Şehirde **Hızır %95** pazar payı. Eray: "ellerinden biraz almalıyız — kurye ödülleri (1 teslimat +30₺), işletmeye günlük şanslı sipariş indirimi, kurye/işletme ekranda görsün, şanslı gün vb. sen karar ver."
- **Tek kaynak `GROWTH` (vizz-data.js):** kampanyalar {tip:kurye/dükkan, bonus, bütçe, harcanan, aktif}. Teşvik = maliyet → econ peteğine bağlı (Finans gideri + net kârdan düşer).
- **operasyon "Büyüme" modülü (yeni rail):** Rakipten Kazanım funnel (VIZZ %5 vs Hızır %95 + geçen dükkan 14/40, kurye 23/50) + Aktif Kampanyalar tablosu (aç/kapa) + Maliyet&Etki (CAC ₺1.246). `buildBuyume()`, FORMS.kampanya.
- **Kurye app (kurye-mobil):** home'da **VIZZ Ödülleri kartı** — Geçiş Bonusu (ilk 100 teslimat +30₺), Günün Primi (+5₺), Haftalık Seri (5/7), **🍀 Şanslı Teslimat çevir** (random +₺, kutlama pop). Kurye geçiş sebebini GÖRÜYOR.
- **Restoran panel:** Pano'da **🎰 Şanslı Gün banner'ı** (rastgele 1 siparişe ₺0 teslimat + Geçiş Paketi ilk 30 gün komisyon %0).
- **Rakip-gap'ler:** proxy numara maskeleme ✅ (sipariş detayı: maskeli no + Gizli Ara). POD/batching/suç-atfı/status-page/bayilik/WhatsApp → brief'te **planlı** işaretlendi. Cache `vizz-data.js?v=3`.

## 27 Haz (4) — Ekonomi tek-motor "arı peteği" (Eray'ın net istediği örüntü)
- Eray: "her dükkana farklı tarife tanımlıyoruz (100/60/150...), tüm operasyon + raporlar **net + birbirine bağlı, arı peteği gibi** olmalı." → tek gerçek kaynak (single source of truth).
- **Sorun:** Finans/Bölge/Raporlar ayrı ayrı uydurma sayılardı (paket başı 22, komisyon 6.4K hardcode), bağ yoktu.
- **Uygulandı (`vizz-data.js`):** `RESTAURANTS[].tarife` + `.kuryePay` (dükkana özel: 85–140₺) + `ECON` sabitleri (KDV20/stopaj1/KV25/sabit6/komisyon8) + **tek fonksiyon `econOrder(restoran,yemekTutarı)`** → {tarife,komisyon,gelir,kurye,kdv,kv,net} + `econDukkan()` (dükkan bazlı günlük toplam). `VIZZ.econOrder/econDukkan/feeOf` export.
- **Tüm görünümler buradan okuyor:** sipariş detayı (VIZZ Ekonomisi mini-defter, satırlar net'e tam denk), Raporlar **Dükkan Ekonomisi tablosu** (col-12, TOPLAM satırı), Finans KPI'ları. **Doğrulandı:** Dükkan TOPLAM net ₺9.431 = Finans net = Σ econOrder.net (birebir tutuyor). Cache `vizz-data.js?v=3` (12 yüzeyde bumplandı).
- **Ders:** rapor başına ayrı hesap yazma → tek ledger/motor, her hücre komşusuna bağlı. Eray bu "örüntülü/bağlı" netliğe çok önem veriyor (bkz [[duzen-takintisi]]).

## 27 Haz (3) — Atama modeli düzeltmesi (Eray'ın yakaladığı ürün hatası)
- Eray: "otomasyon yaptık (en yakın/yüksek puan/sıradaki) ama niye her siparişe **Otomatik Ata** tıklıyorum? mantıksız." → **HAKLI.**
- **Doğru model:** varsayılan **Oto AÇIK** → motor sipariş düştüğü an otomatik atar (en yakın+skor), dispatcher sadece **izler**. **Manuel = istisna** (Hemen/Override butonları + header'da Oto AÇIK/KAPALI anahtarı; KAPALI=tam manuel).
- **Uygulandı:** `operasyon.js` + `operasyon-mobil.html` → `autoOn=true`, `autoAssignTick()` bekleyenleri tek tek otomatik atar, kart "Otomatik atanıyor… en yakın+skor" gösterir, `toggleAuto()` + ⚡Oto AÇIK toggle. Eski "Otomatik Ata" butonları → "Hemen Ata" (override). Brief §①.1'e kritik kural yazıldı.
- **Ders:** otomasyon varsa varsayılan otomatik olmalı; insana her olay için tıklatmak otomasyonu boşa çıkarır. [[asistan-tasarim-prensibi]] (modeli akıllı bırak) ile aynı çizgi.

## Eray'ın merak ettiği (cevaplandı, eklenmedi)
WhatsApp Business API ile sipariş/onay akışı kurulabilir AMA canlı konum takibi WhatsApp'la olmaz (sadece anlık pin, sürekli stream yok) → kendi app şart. WhatsApp = MVP/yedek bildirim kanalı; operasyon zekası WhatsApp'a sığmaz. Hibrit en iyisi.

## Sıradaki adımlar
1. UI büyük ölçüde bitti (10 yüzey canlı 200, brief senkron). Kalan: kurye-mobil belge/destek ekranı (mikro), müşteri-web profil parite tamamlandı.
2. VIZZ Market cila. 3. Hukuk/soğuk-başlangıç + **entegrasyon anlaşmaları** (aggregator ile başla) = Eray.

İlgili: [[duzen-takintisi]], [[guncel-teknoloji-oner]], [[asistan-tasarim-prensibi]].
