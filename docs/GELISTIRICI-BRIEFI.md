# 🛠️ VIZZ — Geliştirici Brief'i (Final Build Spec)

> **Güncel:** 26 Haz 2026 — canlı prototiple birebir senkron.
> **Kime:** VIZZ gerçek ürününü yazacak geliştirici(ler)e.
> **Amaç:** Ne yazacağını, hangi teknolojiyi, hangi modülleri, hangi özellikleri, hangi garantileri **net** anlaman için tek giriş dokümanı.
> **Derinlik için:** [MASTER PLAN](VIZZ-URUN-MASTER-PLAN.md) · [MİMARİ KARAR](VIZZ-MIMARI-KARARI.md) · [VIZZ MARKET](VIZZ-MARKET-PLAN.md) · [ENTEGRASYON STRATEJİSİ](ENTEGRASYON-STRATEJISI.md) · [RAKİP ANALİZİ (Minijett/Maxijett)](MINIJETT-ANALIZ.md).
> **Görsel/akış spec'i = CANLI UI PROTOTİPİ:** https://eraycaylak.github.io/vizz/ — bütün ekranlar, modüller, akışlar, tasarım dili burada. **Backend'i bu UI'a göre, bu UI'ı koruyarak hayata geçir.** Prototip statik+mock; sen gerçeğini yazacaksın. **§5'teki modül envanteri prototipteki her ekranı listeler.**

---

## 0. Proje Özeti
**VIZZ** = Yozgat merkezde, **kendi esnaf kurye filolu** yerel **yemek sipariş + teslimat** platformu (B2C pazaryeri + B2B teslimat) **+ VIZZ Market** (hızlı atıştırmalık q-commerce, aynı filo). Vurgu: **%80 operasyon / %20 son kullanıcı**. Rakipler: Hızır Paket, Paketçiniz, Maxijett. Fark: derin görsel raporlama + **operasyon otomasyonu** (Hızır manuel nöbetle atıyor) + uçtan-uca tek sistem + premium tasarım.

⚠️ **Bu para dönen, gerçek-zamanlı, hata affetmeyen bir sistemdir.** Takılma / veri kaybı / gecikme **kabul edilemez** — binlerce ₺ zarar + piyasa kaybı demek. Aşağıdaki garantiler pazarlık dışıdır.

---

## 1. KESİN Teknoloji Stack (karar verildi — değiştirme)
| Katman | Teknoloji |
|--------|-----------|
| Backend dili | **Go** (modüler monolit; Echo veya Fiber) |
| Backend host | **Hetzner** (stateful) · **≥2 app instance + yük dengeleyici + oto-failover** (SPOF yok, §6.6/§HA). k8s MVP'de gerekmez, Docker/systemd + LB yeter |
| DB | **PostgreSQL 16 + PostGIS** (+ v2 TimescaleDB iz için) |
| Cache / pub-sub | **Redis** (son konum + WS yayını + kuyruk) |
| Gerçek-zaman | **Go-native WebSocket + Redis pub/sub** |
| Bildirim | **FCM** (yüksek öncelik) + WS + SMS (Netgsm) fallback |
| Mobil | **Flutter** (tek kod tabanı, flavor: `courier` \| `customer`), `flutter_background_geolocation` |
| Web frontend (dispatcher/restoran/müşteri/market) | **React/Next.js** → **Cloudflare Pages** (statik) |
| Harita | Mobil **Google Maps SDK** · Web **MapLibre GL** (koyu) · Rota **OSRM self-host** · Adres **Google Geocoding** |
| Ödeme | **iyzico Pazaryeri** (subMerchant/alt-üye split) |
| Auth | Kendi **JWT** (access+refresh) + telefon **OTP** + **RBAC** |
| Gözlem | OpenTelemetry + Prometheus/Grafana + **Sentry** |
| CI/CD | GitHub Actions + Coolify (SSH deploy) |

> **Cloudflare yalnızca:** DNS + CDN + DDoS + Pages(statik frontend) + R2(foto). **Stateful para+geo+gerçek-zaman çekirdeği Cloudflare Workers'da DEĞİL** — gerekçe MİMARİ KARAR dokümanında (D1'de PostGIS yok, transactional zayıf). Sapma yapma.

---

## 2. Mimari Prensipler
- **Modüler monolit** (mikroservis değil). Go `internal/` paketleriyle sınır çiz.
- **5 yüzey + market + entegrasyonlar = TEK backend / TEK veri modeli**, RBAC paylaşımlı API.
- **Fiyat/komisyon/ücret hesabı TEK motor** (backend) — müşteri app + restoran panel + dispatcher aynı sonucu vermeli. Client tekrar yazmaz.
- **⚠️ EKONOMİ TEK-MOTOR = "ARI PETEĞİ" (kritik):** Her dükkanın **kendi teslimat tarifesi** var (`restaurant.tarife` + `restaurant.kuryePay`, dükkana göre farklı: 85–140₺). TEK fonksiyon `econOrder(restoran, yemekTutarı)` her siparişin tam kırılımını üretir → **teslimat tarifesi + komisyon(%8) − kurye ücreti − sabit gider − vergi(KDV+kurumlar) = NET KÂR**. **Tüm raporlar/finans bu motordan okur** — sipariş detayı, Dükkan Ekonomisi tablosu, Finans KPI'ları, birim ekonomi hepsi aynı kaynaktan → sayılar **her yerde birbirini tutar** (prototipte doğrulandı: Dükkan Ekonomisi TOPLAM = Finans net = Σ econOrder.net). **Veri modeli:** `restaurant.tarife → order.delivery_fee + order.commission → ledger(order){gelir, kurye_gider, vergi, net} → reports`. Asla rapor başına ayrı hesap yazma — tek ledger, her hücre komşusuna bağlı.
- **Her sipariş `vertical: food | market` ve `channel: vizz | telefon | yemeksepeti | trendyol | getir`** — tek `orders` çekirdeği iki dikeye + tüm kanallara hizmet eder.
- **Olay-güdümlü:** her durum geçişi event-log'a yazılır (raporlama + otomasyon bunu okur).

---

## 3. Backend Modülleri (`backend/internal/`)
| Modül | Sorumluluk |
|-------|------------|
| `dispatch` | **Atama motoru** — çok-kriterli skor (mesafe/ETA + yük + performans + bölge + SLA), modlar (en-yakın/round-robin/havuza-at), teklif→timeout→sıradaki, **açıklanabilir atama** (gerekçe logu), manuel override |
| `ops_automation` | **Operasyon ajanı** — red→kuyruk sonu, arıza/kaza→yeniden ata, SLA eskalasyon, **kurye güven skoru**, anomali/sahtekârlık flag (bkz. §6) |
| `orders` | Sipariş yaşam döngüsü + **EVENT-LOG** (zaman damgalı durum geçişleri) + iptal/iade akışı + restoran-reddi akışı |
| `couriers` | Kurye, vardiya/puantaj, hakediş, belge takibi, **güven skoru** |
| `restaurants` | Menü, opsiyon/modifier, **stok/86**, KDS, busy-mode, çalışma saati |
| `market` | Katalog, **envanter/stok**, depo **toplama (picking)** akışı |
| `geo` | PostGIS (en-yakın kurye, poligon/bölge, mesafe) + OSRM client + **geofence** |
| `realtime` | WS hub + Redis pub/sub (konum + sipariş durumu yayını) |
| `channels` | **Entegrasyon adaptörleri** (yemeksepeti/trendyol/getir webhook → normalize → orders) |
| `payment` | iyzico Pazaryeri + **ledger** (idempotent, üçlü cari: restoran-kurye-VIZZ) + COD mutabakat |
| `notify` | FCM push + SMS + **outbox** (garantili teslim) |
| `auth` | JWT + OTP + RBAC + **audit trail** (append-only) |
| `reporting` | KPI agregasyon + rollup (persentil, SLA, ısı, birim ekonomi, kohort) |

---

## 4. Veri Modeli — ZORUNLU Baştan (sonradan eklemek en pahalı migration)
- **`order_events`** (append-only): `order_id, type(created/assigned/accepted/at_restaurant/picked/on_the_way/delivered/cancelled), at(timestamp), actor, lat/lng, reason`. → SLA, persentil, darboğaz, otomasyon, anlaşmazlık hepsi buna bağlı. **ATLAMA.**
- **`orders`**: `vertical`, `channel`, `branch_id`, **müşteri (ad + telefon)**, **tam adres + konum(geography)**, sepet(items+opsiyon), tutarlar(ara_toplam/teslimat/komisyon/iade), **ödeme tipi (nakit/kapıda_pos/online)**, durum, atanan kurye, **iptal nedeni + sorumluluk (zorunlu alan)**. *(UI'da: sipariş detay modalı bu alanları gösterir + akış zaman çizelgesi=order_events.)*
- **`branch_id` / `tenant_id`** her tabloda (çoklu-şube v2 olsa bile şema baştan).
- **`ledger`** (çift girişli, immutable): kurye hakediş / restoran hakediş / komisyon / iade / prim-ceza. Para hareketi izsiz olamaz.
- **`courier_score`**: kabul_oranı, zamanında_%, iptal/red_sayısı, arıza_bildirim_sıklığı, idle_süre, güven_skoru (sürekli güncellenir).
- **`courier_cash` / kasa** (COD mutabakat): kurye başına **cebindeki nakit**, **POS tahsilat**, **kasa limiti** (eşik aşılınca yeni sipariş otomatik durur), teslim/depozit kaydı, discrepancy. + **hız/mesafe metrikleri** (ort_teslimat_dk, ort_mesafe_km, km_saat) — UI: kurye scorecard kasası + Raporlar (kurye hız sıralaması, mesafe dağılımı).
- **`delivery_metrics` / rollup**: yoğun-saat × restoran (paket/saat), mesafe dağılımı, kurye hızı, SLA persentil — `reporting` modülü replikadan üretir.
- **`couriers/courier_locations`** (son konum Redis; örneklenmiş iz Timescale), **`restaurants/menu/menu_options`**, **`market_products/inventory`**, **`zones`**(PostGIS polygon), **`incidents`**, **`ratings`**, **`customers`**, **`audit_log`**, **`channel_orders`** (eşleştirme).

---

## 5. Yüzeyler & Öncelik
| Yüzey | Dosya (prototip) | Öncelik |
|------|--------|---------|
| **Dispatcher / Operasyon** (web) | `operasyon.html` | MVP çekirdek |
| **Operasyon Mobil** (dispatcher cep) | `operasyon-mobil.html` — web ile paritede: canlı atama kuyruğu + **sipariş detay alt-sheet** (müşteri/proxy telefon/adres/timeline/**ekonomi kırılımı**/gizli ara) + **kurye detay sheet** (kasa nakit/POS+limit bar, hız/mesafe, güven skoru, ara) + Daha sekmesi (bugün ekonomi özeti + Büyüme/teşvik özeti + modül linkleri) + harita + kanal akışı | MVP/v1 |
| **Kurye App** (Flutter) | `kurye-mobil.html` | MVP çekirdek |
| **Restoran Panel** (web) + Mobil | `restoran-panel.html` · `restoran-mobil.html` | MVP/v1 |
| **Müşteri App** (Flutter) + Web | `musteri-mobil.html` · `musteri-web.html` | MVP/v1 |
| **VIZZ Market** (mobil+web+depo) | `market-mobil.html` · `market-web.html` · `market-depo.html` | v1 (mock hazır) |
| **Sunum hub'ı** | `index.html` | — |

### 5.1 Prototip Modül Envanteri (ekran ekran — backend bunları beslemeli)
**Tasarım dili:** koyu NOC (`vizz-pro.css`), sarı `#FFC400` spotlight, çizgi-ikon (emoji-UI yok), ECharts grafik, Leaflet+CARTO koyu harita. Operasyon **ferah** düzen (1260px ortalı kolon) + **her sayfada sabit üst KPI şeridi** + light/dark tema.

**① Dispatcher / Operasyon — 16 modül (sol rail):**
1. **Komuta** — NOC harita (kurye+restoran+bölge poligonu) + KPI şeridi + **Atama Kuyruğu** + **Canlı Kanal Akışı** (Getir/Yemeksepeti/Trendyol/VIZZ App marka rozetli sipariş düşüşü). KPI kartları → tıkla → modal (aktif sipariş/saha kurye/SLA/ciro…).
   - **⚠️ ATAMA MODELİ (kritik — dispatcher her siparişi TIKLAMAZ):** Varsayılan **Oto AÇIK** → sipariş düştüğü an **motor otomatik atar** (en yakın + skor + sıradaki); dispatcher sadece **izler**. Sipariş kuyrukta kısa süre `Atanıyor → [otomatik]` gösterir, saniyeler içinde kurye atanır. **Manuel = istisna:** "Hemen" (zorla şimdi at) / "Override" (belirli kurye seç) butonları sadece gerektiğinde. Header'da **Oto AÇIK/KAPALI** anahtarı — KAPALI = tam manuel mod (her siparişi dispatcher atar). Prototipte canlı: `autoAssignTick()` motoru bekleyenleri tek tek atıyor, kart "Otomatik atanıyor… en yakın+skor" gösteriyor. *Otomasyon yaptıysak dispatcher'a her sipariş için tıklatmak yanlıştır.*
2. **Siparişler** — tüm sipariş geçmişi: tarih aralığı + filtre + **CSV** + durum pipeline filtresi + **Kaynak** (kanal) + Taşıma Ücr. + Ödeme kolonları.
3. **Kuryeler** — grid + tıkla→scorecard drawer (7-gün teslimat, performans barları, belgeler).
4. **Dükkanlar** — işletme tablosu (bugün paket/ciro/komisyon/**net hakediş=cari**/hazırlık/puan) + drawer (ciro chart + en çok satan + cari hesap).
5. **Atama Ayarları** — 3 sekme: **Genel** (Otomatik Atama, Algoritma [Akıllı Skor/Sıralı/En Yakın], Sıralama Kriteri, Kümeleme, kapasite, mesafe limiti, kurye-restoran sabitleme, manuel transfer/havuzdan çekme) · **Bölgeler** (harita poligon) · **Kısıtlamalar** (kurye×restoran engelle).
6. **Otomasyon** — ⭐ VIZZ farkı: kural+skor motoru canlı karar feed'i + karar-tipi donut + **Kurye Güven Skoru tablosu** (GPS/kabul/zamanında/şüpheli-iptal → 4 risk katmanı) + **Anomali & Sahtekârlık Radarı** (işi-sallama/geofence-dışı-teslim/hareketsizlik).
7. **Bölgeler** — mahalle bazlı yoğunluk/fiyat çarpanı.
8. **Taşıma Ücretleri** — restoran ücreti vs kurye ücreti tablosu (fark = VIZZ marjı).
9. **Finans & Hakediş** — Cuma ödeme listesi + COD kasa + komisyon (üçlü cari).
10. **Kontör / Bakiye** — prepaid bakiye opsiyonu (yüklenen/tüketilen/hediye + işlem geçmişi + otomatik yükleme). *(Gelir modeli opsiyonu — bkz. MİMARİ KARAR.)*
11. **Kullanıcılar** — RBAC: roller (Sahip/Operasyon/Mağaza/Muhasebe) + granüler izinler.
12. **Raporlar** — 9 ECharts kart (SLA gauge, persentil P50/P90/P95, aşama darboğazı, ısı haritası, iptal pareto, birim ekonomi waterfall, bölge ciro, kurye scatter).
13. **Duyurular** — ekip/kurye bilgilendirme.
14. **Ayarlar** — 3 sekme: **Operasyonel** (mola kuralları+yoğun saat, sipariş kuralları: fiş fotoğrafı/telefon/adres) · **Konum** (görünürlük, kurye adresi ne zaman görsün, **geofence teslim doğrulama**) · **Mali** (komisyon, Cuma ödeme, COD limiti, e-Fatura).
15. **Destek** — canlı destek/telefon/talep + SSS.
16. **Büyüme & Ödüller** — ⭐ rakipten pay alma motoru: **Rakipten Kazanım funnel** (rakip pazar payı vs VIZZ + bu ay geçen dükkan/kurye → hedef), **Aktif Kampanyalar** tablosu (kurye+işletme, bütçe kullanımı bar + aç/kapa toggle), **Maliyet & Etki** (CAC, sipariş başı ek maliyet — econ peteğine bağlı). Yeni Kampanya formu.

### 🐝 Büyüme & Teşvik Motoru — "Hızır'dan pay al" (rakip %95)
**Veri:** `GROWTH` (vizz-data.js) tek kaynak → kampanyalar {tip:kurye/dükkan, bonus, bütçe, harcanan, aktif}. Teşvik = **maliyet** → Finans gideri + Dükkan Ekonomisi net kârından düşülür (econ peteğine bağlı, ayrı hesap yok).
- **Kurye ödülleri (kurye app'te görünür — geçiş sebebi):** 🎁 Geçiş Bonusu (Hızır'dan gelene ilk 100 teslimat +30₺ — **CAC/pazarlama yatırımı**, marj değil, kurye ömür-boyu değerinden geri kazanılır) · ⚡ Günün Primi (yoğun saat) · 🍀 Şanslı Teslimat · 🔥 Haftalık Seri. Kurye home'da **VIZZ Ödülleri kartı**.
- **⚠️ Şanslı Teslimat — bütçe-farkında ödül havuzu algoritması (kritik, `GROWTH.reward`/`rewardEcon`/`luckyDraw`):** Sabit 30/50/100₺ **VERİLMEZ** (paket net kârımız ~25₺, batarız). Bunun yerine: her teslimatın **%P (varsayılan %10) kazanma şansı**; kazanan kurye **o teslimatın net kârını** alır (≈1 paket kârı). → **Beklenen maliyet/teslimat = P × ortNet = net'in %P'si** (₺2,5); net'in %(100−P)'i bize kalır. Havuz gerçekleşen kârdan finanse edilir, **havuz bakiye + aylık tavan** dolunca kazanma otomatik durur. **EV = havuz payı → matematiksel olarak zarar imkânsız.** Üretimde: ödül havuzu ledger'da ayrı hesap, kazanan seçimi sunucuda (client'a güvenme), idempotent.
- **İşletme teşvikleri (restoran panelde görünür):** 🎰 Şanslı Gün (her gün rastgele 1 siparişin teslimatı VIZZ'ten — dükkana ₺0) · 🤝 Geçiş Paketi (Hızır'dan gelene ilk 30 gün komisyon %0) · 📈 Hacim Primi (günde 30+ sipariş → ertesi gün tarife %15 indirim). Panoda **Şanslı Gün banner'ı**.

### ✅ Rakip-gap özellikleri — durum (pazar analizi sonrası)
| Özellik | Durum |
|---|---|
| Proxy numara maskeleme (gizli arama) | ✅ prototipte (sipariş detayı: maskeli no + Gizli Ara) |
| Kurye net kazanç şeffaflığı (önce göster) | ✅ kurye app ödül kartı + econ kırılım |
| COD kasa mutabakatı · güven skoru · hız/mesafe | ✅ (önceden) |
| **POD (foto+imza+GPS teslim kanıtı)** | ✅ kurye app teslim akışı: 3-kanıt zorunlu (geofence GPS otomatik doğrulama "adrese 12 m" + foto + imza pad canvas) → üçü tamamlanmadan "Teslim ettim" kilitli (sahte teslimi önler) |
| **Order batching (çoklu-pickup)** | 🟡 planlı — atama motoruna kümeleme (Atama Ayarları'nda "Kümeleme" var, algoritma eklenecek) |
| **Suç atfı (geç pickup kanıtlı)** | 🟡 planlı — sipariş zaman damgalı event-log'dan |
| **Status page / outage şeffaflığı** | 🟡 planlı — HA altyapısıyla (bkz. MİMARİ §HA) |
| **Bayilik / white-label** | 🟡 planlı iş modeli — Maxijett tarzı, başka ilçeye VIZZ'i kirala |
| **WhatsApp sipariş/takip linki** | 🟡 planlı — bildirim kanalı (sipariş değil) |

**② Kurye App:** durum (çevrimiçi toggle) + görev kabul/ret makinesi + anlık konum yayını + **kazanç + Cuma ödeme sayacı** (ECharts) + performans + profil/belge.

**③ Restoran Panel:** **Sipariş Panosu** (KDS kanban: Yeni/Hazırlanıyor/Hazır/Kuryede/Tamamlandı + kanal rozeti · **Kanban ↔ Liste(hepsi) görünüm toggle** — yüksek hacimde 100+ sipariş tek kompakt tabloda taranır: id/kanal/müşteri/ürün/tutar/durum/SLA/kurye/aksiyon) · **Canlı Takip** (sol sipariş listesi + sağ Leaflet harita: restoran+kurye+teslim rotası) · Menü (opsiyon+**stok/86**) · Kurye · Raporlar · **Finans & Cari** · Ayarlar (+**Entegrasyon & Kanallar:** entegrasyon kodu + Yemeksepeti/Trendyol/Getir eşleme). Üst bar: **cari bakiye** + **Kurye Çağır** (manuel sipariş drawer: müşteri/telefon/adres+haritadan seç/fiyat/ödeme/hazırlık/araç/not + canlı tahmini ücret+en yakın kurye ETA) + **Ödeme Al** (kurye+tutar → **4 haneli onay kodu** nakit mutabakat).

**④ Müşteri App:** Keşfet/arama · Restoran/menü/opsiyon · Sepet/kupon · **Canlı Takip** (Domino's tarzı + harita) · Hesap + alt-ekranlar: **Favoriler · Geçmiş Siparişler (tekrar sipariş) · Kampanyalar (kupon) · Adres Yönetimi**. **Web:** keşfet + koyu Yozgat haritası + menü modal + sepet drawer.

**⑤ VIZZ Market:** Müşteri mobil (katalog+kategori+hızlı sepet+canlı takip) · web · **Depo/Toplama paneli** (toplama listesi + stok + kurye çağır + KPI).

---

## 6. KRİTİK Gereksinimler (pazarlık dışı)

### 6.1 Kurye anlık konumu (Hızır gibi ekranda canlı)
`flutter_background_geolocation` (hareket-duyarlı adaptif aralık) → WS → **son konum Redis** (her tick DB'ye YAZMA) → pub/sub → dispatcher+müşteri ekranı **<1sn**. İz 10-15sn örnekleme → Timescale.

### 6.2 Gecikmesiz bildirim
**FCM yüksek-öncelik push + WS.** Kurye X sn içinde **ack** vermezse → **SMS/çağrı fallback + sıradaki kuryeye yeniden ata.** Sipariş asla havada kalmaz. Gönderim **outbox** ile atomik (kaybolmaz/çift gitmez).

### 6.3 Entegrasyon (Yemeksepeti / Trendyol Yemek / Getir Yemek) → tam strateji: [ENTEGRASYON-STRATEJISI.md](ENTEGRASYON-STRATEJISI.md)
**`channels` modülü = adapter deseni.** Webhook → `orders`'a normalize (`channel` etiketli) → dispatcher/restoran ekranına → VIZZ kurye atar → durum platforma geri senkron. Prototipte canlı: Komuta'da **kanal akışı**, restoran panelinde **entegrasyon kodu + kanal eşleme**.
**Sıra (araştırma sonucu):** (1) **Aggregator** (Posentegra/API Merkezi) — tek webhook = anında 4 platform, NDA yok, ~$15/ay → MVP. (2) **Trendyol + Getir** self-service credential (ücretsiz, `partner.trendyol.com` / `developers.getir.com`). (3) **Yemeksepeti** direkt partnerlik (NDA+PGP+onay) hacim büyüyünce. (4) **POS köprüsü:** restoran panelindeki entegrasyon kodu → POS'u hazır restoranlar yönlendirir. `channel_orders` eşleştirme + idempotency + outbox + auto-retry **baştan**.

### 6.4 Operasyon Otomasyonu (`ops_automation`)
**Katman A — Kural+Skor (MVP, "AI deme — açıklanabilir otomasyon"):**
- Oto-atama (skor), **red→kuyruk sonu**, **arıza/kaza→anında en yakın müsait kuryeye devret** + incident, SLA riski→eskalasyon/yeniden-ata, kurye yoksa→şeffaf bildir + dispatcher'a yükselt. **Manuel override hep açık.**

**Katman B — Kurye Güven Skoru & Sahtekârlık (Eray'ın "işi sallayanı yakala"):**
- Skor: kabul/red/iptal, **arıza-bildirim sıklığı**, zamanında_%, idle. 
- Tespit: sürekli "arıza" diyen + **GPS/geofence ile ev yakınında çevrimdışı olan** → flag. Yoğun/kârsız siparişte red paterni → flag.
- Aksiyon: düşük skor → **atama önceliğinde geri** (iyi çalışan iyi iş alır) + ops panosunda "izlenecek personel" (uyar/askıya al = insan).
- **v2:** ML — talep tahmini, sahte-mazeret paterni, güvenilirlik tahmini, LLM olay özeti.

### 6.5 Veri kaybı / takılma YOK (mühendislik garantileri)
PostgreSQL **senkron WAL + günlük + PITR yedek + replika/failover** · **idempotency** (çift sipariş/atama/tahsilat yok) · **outbox** · **event-log + audit** · son-konum-Redis (DB boğulmaz) · **Sentry/Prometheus alarm** (kullanıcıdan önce yakala) · Docker health+auto-restart.

### 6.6 Yüksek Erişilebilirlik / SPOF YOK (yazılımcının haklı kaygısı) → tam tasarım: [MİMARİ §HA](VIZZ-MIMARI-KARARI.md)
**Para sistemi = tek hata noktası olamaz.** Her katman **≥2 kopya + otomatik failover:** App **≥2 instance + yük dengeleyici** (stateless, biri çökerse kesintisiz) · Postgres **primary+replika+oto-failover (Patroni)** · Redis **Sentinel** · **blue-green deploy** + oto geri-alma · PITR yedek ayrı lokasyon. **Mimari kararı: yatay-ölçeklenebilir modüler monolit** (net modül sınırı); baskı gelince `realtime/channels/notify/reporting` **servise ayrılır**, ledger çekirdekte kalır. *Saf microservice şart değil — HA, redundancy ile gelir; ledger'ı bölme (dağıtık transaction riski).*

---

## 7. Faz Planı
- **MVP (dar, "yarın hatasız"):** Dispatcher (harita+manuel/yarı-oto atama+SLA+otomasyon kuralları) · Kurye app (kabul/durum/POD/tahsilat/konum) · Restoran KDS+menü/stok · Müşteri sipariş+takip · **sadece COD** · event-log+audit+RBAC · iyzico kapıda işaretleme. Online kart, derin rapor dashboard, market = v1.
- **v1:** Online kart(3DS), derin raporlama (persentil/heatmap/birim-ekonomi/RFM), bölge poligon, finansal mutabakat (COD kasa), VIZZ Market, kanal entegrasyonları, kurye güven skoru derinleşme.
- **v2:** ML ops ajanı, surge, çoklu-şube, sadakat/abonelik, talep tahmini, pazaryeri tam entegrasyon.

---

## 8. Kapsam Dışı / İş Tarafı (geliştirici sorumluluğu değil ama bağımlılık)
**KVKK/VERBİS · e-Fatura/GİB · kurye SGK/muvazaa · iyzico Pazaryeri başvurusu · soğuk başlangıç (restoran arzı) · platform entegrasyon anlaşmaları** = Eray + hukukçu/muhasebeci. Yazılım bunlara **hazır** olmalı (rıza akışı, fatura API kancası, channel adapter) ama içeriği iş tarafı sağlar.

---

## 9. Definition of Done (her özellik için)
(1) Çalışır · (2) hata/edge durumları ele alınmış · (3) **idempotent + event-log'a yazıyor** · (4) RBAC/yetki doğru · (5) gerçek cihaz/gerçek akış test edildi · (6) gözlemlenebilir (log/metrik) · (7) UI prototipiyle tutarlı.

> **İlk teslim sırası:** repo iskeleti + **veri modeli (order_events/channel/ledger/courier_score/branch_id)** → auth/RBAC → orders+dispatch+realtime (kurye konumu+atama) → kurye app + dispatcher MVP → restoran KDS → müşteri sipariş+takip. Para = COD-only başla.
