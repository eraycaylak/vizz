# ⚙️ VIZZ — Mimari & Teknoloji Kararı (ADR)

> **Karar tarihi:** 26 Haz 2026 · **Bağlam:** Para dönen, gerçek-zamanlı, veri-kaybı affetmeyen yemek+market teslimat platformu (Yozgat pilot). Master plan ([VIZZ-URUN-MASTER-PLAN.md](VIZZ-URUN-MASTER-PLAN.md)) tech bölümünün **kesin kararı**.
> **Eray'ın kırmızı çizgileri:** kurye anlık konum (Hızır gibi ekranda canlı) · kurye çağrılınca **gecikmesiz bildirim** · **Yemeksepeti/Trendyol Yemek/Getir Yemek entegrasyonu** (sipariş direkt VIZZ ekranına) · **operasyonu yöneten otomasyon/AI ajanı** (manuel atama yok, red/arıza yönetimi, işi sallayan kurye yakalama) · **takılma/veri kaybı YOK** (hata = binlerce ₺ + piyasa kaybı).

---

## 🎯 NET KARAR (tek bakışta)

| Katman | KARAR | Neden (Eray'ın çizgisine bağlı) |
|--------|-------|----------------------------------|
| **Backend dili** | **Go** (modüler monolit) | Dispatch fan-out + binlerce eşzamanlı WebSocket + PostGIS için en öngörülebilir gecikme; tek-binary = "hatasız deploy". Senin sezgin doğru. |
| **Backend host** | **Stateful sunucu (Hetzner)** + Docker Compose | Para+geo+gerçek-zaman çekirdeği **kalıcı süreç** ister. K8s MVP'de gereksiz. |
| **DB** | **PostgreSQL 16 + PostGIS** (+v2 TimescaleDB) | **Veri kaybı YOK** çizgisinin tek garantisi: ACID + WAL + PITR backup + replica. En-yakın-kurye/bölge sorgusu = PostGIS şart. |
| **Gerçek-zaman** | **Go WebSocket + Redis pub/sub** | "1 kurye konumu → tüm dispatcher+müşteri ekranlarına" <100ms yayın. |
| **Bildirim** | **FCM (yüksek öncelik) + WS + ack-yoksa-yeniden-ata** | Push uygulamayı kapalıyken uyandırır; WS açıkken canlı; teyit gelmezse SMS/çağrı + reassign. |
| **Mobil** | **Flutter** (kurye + müşteri tek kod) | Arka plan konum + native performans; `flutter_background_geolocation` (force-quit'i yöneten tek olgun çözüm). |
| **Frontend (panel/web)** | React/Next.js → **Cloudflare Pages** statik | Senin Cloudflare sezgin BURADA doğru. |
| **Cloudflare'in rolü** | **DNS + CDN + DDoS + Pages (statik frontend) + R2 (foto)** | Cloudflare'i kullan — ama **edge/frontend için**, stateful para+geo çekirdeği için DEĞİL. |
| **Entegrasyon** | **Kanal Adaptörü modülü** (webhook → normalize → `orders.channel`) | Yemeksepeti/Trendyol/Getir siparişi VIZZ ekranına düşer. Anlaşma gerekir; mimari günden hazır. |
| **Operasyon otomasyonu** | **Kural+skor motoru (MVP)** → ML/LLM ajanı (v2) | Hızır'ın manuel gece-nöbeti zaafını otomasyon ile geç. |
| **Ödeme** | iyzico Pazaryeri (subMerchant) | Restorana oto dağıtım + komisyon. |
| **Gözlem** | OpenTelemetry + Prometheus/Grafana + Sentry | Sorun kullanıcıdan önce yüzeye çıksın. |

---

## 🔴 Cloudflare Workers'ı TEK BAŞINA backend yapmayalım — neden? (dürüst eleştiri)

Cloudflare Pages+Workers harika ama **bizim çekirdeğimiz için yanlış araç:**

| Sorun | Açıklama |
|------|----------|
| **D1'de PostGIS YOK** | Cloudflare DB'si (D1) SQLite tabanlı; "en yakın müsait kurye", "bu poligon içinde mi" gibi **geo sorguları yok**. Atama motorunun kalbi bu. (Haversine'i app'te yazarsın ama PostGIS gücünü kaybedersin.) |
| **Para/ledger için zayıf transactional** | "Veri kaybı YOK" çizgin için **Postgres ACID + WAL + PITR** lazım. SQLite/D1 bu seviyede değil. |
| **Stateful WebSocket → Durable Objects gerekir** | Workers stateless+kısa ömürlü. Canlı konum yayını için **Durable Objects** şart (var ve iyi) AMA ayrı bir paradigma. |
| **3 paradigma = küçük ekipte risk** | Workers(API) + Durable Objects(real-time) + harici Postgres(data) = 3 ayrı zihin modeli. **Tek Go servisi** daha az hareketli parça = daha az hata = senin "takılma yok" çizgin. |
| **Tek şehir = edge-scale gereksiz** | Workers'ın asıl gücü global edge. Yozgat tek-şehirde buna ihtiyaç yok; **basitlik + güvenilirlik** öncelikli. |

> **Özet:** Cloudflare'i **kullanıyoruz** (DNS, CDN, DDoS koruması, müşteri web'i Pages'te, fotoğraflar R2'de). Ama **stateful para+geo+gerçek-zaman çekirdeği = Go + Postgres + Redis, kendi sunucumuzda (Hetzner).** Bu, "edge sihirbazlığı" yerine **kanıtlanmış, hata yapmayan** mimari.
> *(Alternatif: gerçek-zaman katmanını Cloudflare **Durable Objects**'e taşıyabiliriz — genuinely iyi. Ama tek-sistem basitliği için Go+Redis öneriyorum. İstersen DO'yu real-time için ekleriz, çekirdek yine Go+Postgres.)*

---

## 📍 Gereksinim 1 — Kurye Anlık Konum (Hızır gibi ekranda canlı)

- **Kurye app (Flutter):** `flutter_background_geolocation` — hareket-duyarlı, adaptif aralık (aktifken ~5-10sn, beklerken seyrek → pil dengesi). iOS/Android force-quit'te bile çalışan tek olgun çözüm (~500$/yıl lisans).
- **Akış:** kurye konumu → WS (veya HTTP batch) → backend → **son konum Redis'te** (her tick Postgres'e YAZILMAZ) → Redis pub/sub → dispatcher haritası + müşteri takip ekranı **<1sn**.
- **İz/geçmiş:** 10-15sn örnekleme ile Postgres/Timescale (route replay + anlaşmazlık + ajanın davranış analizi için).
- **Kritik:** Her GPS tick'ini DB'ye yazma = sistemi boğar. Son-konum-Redis + örneklenmiş-iz-Postgres deseni.

## 🔔 Gereksinim 2 — Gecikmesiz Bildirim (kurye çağrılınca)

- **İki katman:** (1) **FCM yüksek-öncelik push** → app kapalı/arkaplanda bile uyandırır (sesli/titreşim). (2) **WebSocket** → app açıkken anlık.
- **Garanti:** push düşebilir/gecikebilir → **ack mekanizması:** kurye X sn içinde "gördüm/kabul" demezse → otomatik **SMS + sesli çağrı fallback** + **sıradaki kuryeye yeniden ata**. Sipariş asla "havada kalmaz".
- **Outbox pattern:** bildirim/olay gönderimi DB transaction'ıyla atomik (kaybolmaz, çift gitmez).

## 🔌 Gereksinim 3 — Yemeksepeti / Trendyol Yemek / Getir Yemek Entegrasyonu

- **Hedef:** o platformlardan gelen sipariş **direkt VIZZ ekranına** düşsün (restoran/dispatcher panosu) → VIZZ kurye atasın → durum geri senkron.
- **Mimari — "Kanal Adaptörü" modülü:** her platform = bir adapter. Webhook'la `siparis oluştu/güncellendi/iptal` alır → **VIZZ `orders` tablosuna normalize** eder (`channel: 'vizz' | 'telefon' | 'yemeksepeti' | 'trendyol' | 'getir'`). Tek veri modeli → her sipariş aynı dispatch/harita/atama. Durum (hazırlanıyor/yolda/teslim) platformun API'sine geri yazılır.
- **Gerçek dünya:** Bu platformların **resmi entegrasyon/partner API'leri var** AMA **anlaşma + onay + restoran bazlı API anahtarı** gerekir (Paketçiniz'in "30+ entegrasyon"u böyle). Yani:
  - **MVP:** generic webhook alıcı + manuel/yarı-otomatik giriş (telefon kanalı zaten var).
  - **v1-v2:** resmi API anlaşmaları yapıldıkça adapter'lar aktifleşir.
- **Kararı kalıcı kılan şey:** `channel` alanı + adapter arayüzü **günden bire şemada** olacak → sonradan eklemek = sadece yeni adapter, çekirdek değişmez.

## 🤖 Gereksinim 4 — Operasyonu Yöneten Ajan (Hızır'ın manuel zaafını geç)

> Hızır gece-gündüz nöbetle **elle** atıyor. VIZZ farkı = **otomasyon.** Ama dürüst olalım: bu iki katman:

### Katman A — Kural + Skor Motoru (MVP, "operasyon ajanı")
Deterministik, hata yapmaz, %95'i halleder — manuel nöbete gerek bırakmaz:
- **Oto-atama:** skor (mesafe+yük+performans+bölge+SLA) → en uygun kuryeye teklif.
- **Red/iptal → kuyruk sonu + yeniden ata** (zaten protot'te var).
- **Arıza/kaza ("lastiğim patladı"):** o siparişi **anında en yakın müsait kuryeye** devret + olay kaydı + kuryeyi flag'le.
- **SLA riski:** eşik aşımı → eskalasyon + (gerekirse) yeniden ata.
- **Müsait kurye yoksa:** restorana/müşteriye şeffaf süre + dispatcher'a yükselt (asla sessiz kalma).
- **Manuel override her zaman açık** (insan ezebilir).

### Katman B — Kurye Güven Skoru & Anomali/Sahtekârlık Yakalama (senin "işi sallayan personeli yakalama")
- **Güven skoru (sürekli):** kabul oranı, zamanında %, iptal/red sayısı, **"arıza" bildirimi sıklığı**, idle (boş bekleme) süresi.
- **Davranış/sahtekârlık tespiti:**
  - Sürekli "lastiğim patladı / arıza" diyen kurye → flag. **Çapraz kontrol:** GPS gerçekten durmuş/eve mi gitmiş? **Geofence** — çağrılınca tekrar tekrar ev yakınında çevrimdışı oluyorsa → şüpheli.
  - Yoğun/kârsız siparişte red, kolay siparişte kabul paterni → flag.
- **Sonuç aksiyonu:** güven skoru düşük kurye **atama önceliğinde geriye düşer** (teşvik hizalaması: iyi çalışan iyi iş alır) + ops panosunda **"izlenecek personel"** olarak işaretlenir (uyar/askıya al kararı insanda).
- **MVP'de:** kural-tabanlı yeter (red oranı > %X, idle > Y, arıza > Z → flag). **v2'de:** ML — geçmiş veriyle güvenilirlik tahmini, sahte-mazeret paterni, talep tahmini, LLM ile olay özeti/şüpheli rapor.

> ⚠️ **Dürüst not:** MVP'ye "AI" deme — bu bir **kural+skor otomasyon motoru** (güvenilir, açıklanabilir). Gerçek ML/LLM ajanı **veri birikince (v2)**. Ama "manuel nöbet yok" hedefi MVP'de kurallarla zaten gerçekleşir — asıl Hızır-üstü fark bu.

---

## 🛡️ "Veri Kaybı / Takılma YOK" — Mühendislik Garantileri (senin #1 korkun)

| Risk | Önlem |
|------|-------|
| Veri kaybı | **PostgreSQL: senkron WAL + günlük + PITR yedek + okuma replikası/failover.** SQLite/D1 değil. |
| Çift sipariş / çift atama / çift tahsilat | **Idempotency anahtarları** her para/sipariş mutasyonunda. |
| Olay/bildirim kaybı | **Outbox pattern** (DB tx ile atomik) → FCM/SMS/kanal adapter'ına garantili teslim. |
| "Ne oldu" belirsizliği | **Append-only event-log + audit trail** (her durum geçişi kayıtlı — raporlamayı da besler). KIRMIZI ÇİZGİ: MVP'de baştan. |
| Takılma/yavaşlama | Go derlenmiş + öngörülebilir gecikme; son-konum Redis'te (DB boğulmaz); tek-binary izlenebilir. |
| Sessiz hata | OTel trace + Prometheus alarm + Sentry → kullanıcıdan önce yakala. |
| Sunucu çökmesi | Docker Compose + sağlık kontrolü + otomatik restart; replika + yedekten hızlı dönüş. |

---

## 🧱 Repo / Modül Yapısı (monorepo)
```
vizz/
├── backend/                  # Go modüler monolit
│   └── internal/
│       ├── dispatch/         # ATAMA MOTORU + kural motoru
│       ├── ops_automation/   # operasyon ajanı: red/arıza/SLA + kurye güven skoru + anomali
│       ├── orders/           # sipariş yaşam döngüsü + EVENT-LOG
│       ├── couriers/         # kurye, vardiya, hakediş, güven skoru
│       ├── restaurants/      # menü, stok, KDS
│       ├── geo/              # PostGIS + OSRM + geofence
│       ├── realtime/         # WS hub + Redis pubsub
│       ├── channels/         # ENTEGRASYON adapterleri (yemeksepeti/trendyol/getir)
│       ├── payment/          # iyzico Pazaryeri + ledger (idempotent)
│       ├── notify/           # FCM + SMS + outbox
│       └── auth/             # JWT + OTP + RBAC + audit
├── mobile/                   # Flutter (flavor: courier | customer)
├── web-dispatcher/ web-restaurant/ web-customer/   # → Cloudflare Pages
└── infra/                    # docker-compose, OSRM, Prometheus, backup
```

---

## ✅ Tek Cümlelik Final Karar
**Go (modüler monolit) + PostgreSQL/PostGIS + Redis, Hetzner'de stateful çekirdek; Flutter mobil; Cloudflare yalnızca DNS/CDN/DDoS/Pages(statik frontend)/R2; gerçek-zaman Go-WS+Redis; bildirim FCM+WS+ack-fallback; entegrasyon kanal-adaptörü; operasyon = kural+skor otomasyon motoru (ML v2); veri-kaybı = Postgres ACID+WAL+PITR+idempotency+outbox+event-log. Cloudflare Workers tek-başına backend DEĞİL — para+geo+stateful çekirdek için yanlış araç.**

*Sonraki adım: bu karar onaylanınca → repo iskeleti + veri modeli (event-log/channel/ledger şemaları baştan).*
