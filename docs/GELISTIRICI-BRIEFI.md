# 🛠️ VIZZ — Geliştirici Brief'i (Final Build Spec)

> **Kime:** VIZZ gerçek ürününü yazacak geliştirici(ler)e.
> **Amaç:** Ne yazacağını, hangi teknolojiyi, hangi modülleri, hangi özellikleri, hangi garantileri **net** anlaman için tek giriş dokümanı. Derinlik için: [MASTER PLAN](VIZZ-URUN-MASTER-PLAN.md) · [MİMARİ KARAR](VIZZ-MIMARI-KARARI.md) · [VIZZ MARKET](VIZZ-MARKET-PLAN.md).
> **Görsel/akış spec'i = CANLI UI PROTOTİPİ:** https://eraycaylak.github.io/vizz/ — bütün ekranlar, akışlar, tasarım dili burada. **Backend'i bu UI'a göre, bu UI'ı koruyarak hayata geçir.** (Prototip statik+mock; sen gerçeğini yazacaksın.)

---

## 0. Proje Özeti
**VIZZ** = Yozgat merkezde, **kendi esnaf kurye filolu** yerel **yemek sipariş + teslimat** platformu (B2C pazaryeri + B2B teslimat) **+ VIZZ Market** (hızlı atıştırmalık q-commerce, aynı filo). Vurgu: **%80 operasyon / %20 son kullanıcı**. Rakipler: Hızır Paket, Paketçiniz, Maxijett. Fark: derin görsel raporlama + **operasyon otomasyonu** (Hızır manuel nöbetle atıyor) + uçtan-uca tek sistem + premium tasarım.

⚠️ **Bu para dönen, gerçek-zamanlı, hata affetmeyen bir sistemdir.** Takılma / veri kaybı / gecikme **kabul edilemez** — binlerce ₺ zarar + piyasa kaybı demek. Aşağıdaki garantiler pazarlık dışıdır.

---

## 1. KESİN Teknoloji Stack (karar verildi — değiştirme)
| Katman | Teknoloji |
|--------|-----------|
| Backend dili | **Go** (modüler monolit; Echo veya Fiber) |
| Backend host | **Hetzner** (stateful), Docker Compose (k8s YOK) |
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
- **`orders`**: `vertical`, `channel`, `branch_id`, müşteri, adres+konum(geography), sepet(items+opsiyon), tutarlar(ara_toplam/teslimat/komisyon/iade), ödeme tipi, durum, **iptal nedeni + sorumluluk (zorunlu alan)**.
- **`branch_id` / `tenant_id`** her tabloda (çoklu-şube v2 olsa bile şema baştan).
- **`ledger`** (çift girişli, immutable): kurye hakediş / restoran hakediş / komisyon / iade / prim-ceza. Para hareketi izsiz olamaz.
- **`courier_score`**: kabul_oranı, zamanında_%, iptal/red_sayısı, arıza_bildirim_sıklığı, idle_süre, güven_skoru (sürekli güncellenir).
- **`couriers/courier_locations`** (son konum Redis; örneklenmiş iz Timescale), **`restaurants/menu/menu_options`**, **`market_products/inventory`**, **`zones`**(PostGIS polygon), **`incidents`**, **`ratings`**, **`customers`**, **`audit_log`**, **`channel_orders`** (eşleştirme).

---

## 5. Yüzeyler & Özellik Kapsamı
> **Görsel + akış referansı = canlı prototip** (her ekran orada). Aşağısı kapsam + öncelik. Detaylı özellik tabloları → MASTER PLAN §3.

| Yüzey | Kapsam | Öncelik |
|------|--------|---------|
| **Dispatcher / Operasyon** (web) | Canlı komuta haritası (kurye+sipariş+bölge), oto+manuel atama, **operasyon otomasyonu**, SLA, görevler/kuryeler/**dükkanlar (cari)**/bölgeler/finans/**derin raporlama** | MVP çekirdek |
| **Kurye App** (Flutter) | Çevrimiçi toggle+vardiya, görev kabul/ret, **anlık konum yayını**, navigasyon, durum, **POD foto+GPS**, tahsilat+kasa, kazanç+Cuma sayacı, performans, belge | MVP çekirdek |
| **Restoran Panel** (web) + Mobil | **KDS kanban**, menü+opsiyon+**stok/86**, kurye çağır, busy-mode, **cari/hakediş**, raporlar | MVP/v1 |
| **Müşteri App** (Flutter) + Web | Keşfet/arama, sepet/opsiyon, ödeme (kapıda MVP/online v1), **Domino's canlı takip+harita**, adres, favoriler, kampanya | MVP/v1 |
| **VIZZ Market** Müşteri (mobil+web) + **Depo/Toplama paneli** | Katalog, hızlı sepet, anlık teslimat takibi; depo: toplama listesi+stok+kurye çağır | v1 (mock hazır) |
| **Admin** | RBAC, audit, kurye/restoran CRUD, komisyon/fiyat config, kanal entegrasyon yönetimi | MVP/v1 |

---

## 6. KRİTİK Gereksinimler (pazarlık dışı)

### 6.1 Kurye anlık konumu (Hızır gibi ekranda canlı)
`flutter_background_geolocation` (hareket-duyarlı adaptif aralık) → WS → **son konum Redis** (her tick DB'ye YAZMA) → pub/sub → dispatcher+müşteri ekranı **<1sn**. İz 10-15sn örnekleme → Timescale.

### 6.2 Gecikmesiz bildirim
**FCM yüksek-öncelik push + WS.** Kurye X sn içinde **ack** vermezse → **SMS/çağrı fallback + sıradaki kuryeye yeniden ata.** Sipariş asla havada kalmaz. Gönderim **outbox** ile atomik (kaybolmaz/çift gitmez).

### 6.3 Entegrasyon (Yemeksepeti / Trendyol Yemek / Getir Yemek)
**`channels` modülü = adapter deseni.** Her platform webhook'u → `orders` tablosuna normalize (`channel` etiketiyle) → direkt dispatcher/restoran ekranına → VIZZ kurye atar → durum platforma geri senkron. *(Resmi partner API + anlaşma gerekir; MVP'de generic webhook + manuel, anlaşmalar geldikçe adapter aktifleşir. `channel` alanı + adapter arayüzü baştan şemada.)*

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
