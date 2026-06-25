# 🐝 VIZZ — Ürün Master Planı (v1)

> **Tarih:** 30 Haziran 2026 · **Kapsam:** Yozgat yerel yemek sipariş + esnaf-kurye teslimat platformu
> **Yöntem:** 13 ajanlı derin araştırma (rakip siteleri + global last-mile + yemek-ops + raporlama + özellik katalogları + tasarım sistemi + teknoloji) → sentez → adversaryal eleştiri.
> **Masaüstü modülü:** ÇIKARILDI. Sadece web panel + Flutter mobil.
> **Bu doküman = gerçek ürünün yeniden inşa planı.** Mevcut `VIZZ-tasarim/` = sunum prototipi.

## İçindekiler
1. [Rakip Analizi & Konumlandırma Stratejisi](#1-rakip-analizi--konumlandirma-stratejisi)
2. [Tasarım Sistemi — Çocuksu → Profesyonel](#2-tasarim-sistemi--cocuksu--profesyonel)
3. [Özellik Matrisi & Yol Haritası](#3-ozellik-matrisi--yol-haritasi)
4. [Teknoloji Mimarisi & Projelendirme](#4-teknoloji-mimarisi--projelendirme)
5. [Adversaryal İnceleme & Açık Kararlar](#5-adversaryal-inceleme--acik-kararlar)

---

# 1. RAKİP ANALİZİ & KONUMLANDIRMA STRATEJİSİ

## 🥊 Rakip Teşhisi

| Rakip | Güçlü Yanları | Zayıf Yanları (Saldırı Noktası) |
|-------|---------------|--------------------------------|
| **Maxijett** | En derin: cari hesap+muhasebe, nakit yönetimi, vardiya, restoran/kurye/takım/zaman/lokasyon raporu, yön-bazlı paket istifleme | Rapor metin-ağırlıklı (görsel dashboard yok), persentil/SLA/kohort yok, B2C pazaryeri yok |
| **Hızır Paket** | "Uzay Gemisi" panel, dinamik rota, otomatik finansal yönetim, mobil app yayında | Rapor yüzeysel, tasarım jenerik, açık fiyat yok, müşteri tarafı zayıf |
| **Paketçiniz** | 30+ POS/platform entegrasyonu, gelir-gider+komisyon, esnek panel | Sadece "detaylı raporlama" sloganı (içerik yok), B2B-odaklı, retention/kohort yok |

**Üçünün ORTAK zayıflığı:** raporlama slogan seviyesinde (somut görsel dashboard veren yok) · paneller eski/tablo-ağırlıklı · hiçbiri kendi B2C pazaryeri değil (müşteri retention/RFM/ürün-kârlılık körlüğü) · hepsi fiyatını gizliyor.

## 🎯 Farklılaşma Kaldıraçları
1. **Görsel raporlama derinliği** (KPI dashboard + ısı haritası + persentil + waterfall) — rakiplerin en zayıf+en değerli noktası
2. **Uçtan-uca tek sistem** (B2C pazaryeri + esnaf filo + B2B teslimat) — tek veri modeli
3. **Açıklanabilir atama** ("sipariş neden bu kuryeye gitti") — hiçbirinde yok
4. **Premium dispatch paneli** (NOC/komuta merkezi, sarı-siyah) — tasarımla anında sıçrama
5. **Müşteri canlı takip** (Domino's-tarzı + harita + ETA) — B2C'de net geçiş
6. **Yerel DNA** (Cuma kazanç sayacı, üçlü COD mutabakatı, mahalle bölge fiyatı) — kopyalanması kültürel
7. **Şeffaf fiyat** (stratejik tercihse)

## 📋 Parity (giriş bileti — olmazsa geri görünürüz)
Canlı dispatch haritası · oto+manuel atama · kurye app (POD ile) · restoran paneli · bölge poligon · finansal hakediş/komisyon/mutabakat · vardiya · temel performans raporu · müşteri takip linki · (pazaryeri entegrasyonu = v2).

## 🚀 Leapfrog (onlarda yok — bizi öne çıkarır)
Görsel KPI dashboard · persentil teslimat süresi (P50/P90/P95) · açıklanabilir atama · geçmiş oynatma (route replay) · anomali/alarm motoru · SLA telafi otomasyonu · birim ekonomi · müşteri RFM/kohort · akıllı prep-time çağırma · 86/stok oto-kaldırma · busy mode · Cuma sayacı + üçlü COD mutabakatı · denetim logu.

> **Stratejik tez:** Tek savaş alanı = **Dispatch paneli + raporlama derinliği**. Parity'yi hatasız ver, leapfrog ile kazan. Tasarımı somut fark olarak konumla. **Ama:** rakipleri "özellikle" değil **restoran arzıyla** geçer/kaybedersin — soğuk başlangıç planı şart (bkz. Bölüm 5).

---

# 2. TASARIM SİSTEMİ — ÇOCUKSU → PROFESYONEL

> Eray'ın #1 şikâyeti. Hedef: emoji-SVG + düz renk + amatör his → **veri-yoğun, dark-first lojistik NOC** estetiği. Rakiplerin jenerik template panellerine karşı anında "premium" algısı.

## 2.1 Renk Sistemi
- **Marka korunur, sarı SPOTLIGHT olur** (her yeri sarı yapma → vurgu/aksiyon/seçili için). Siyah taşıyıcı.
- **Dark-pro panel — 4 yüzey katmanı:** `#0B0C0E` (zemin) → `#141619` → `#1C1F24` → `#26282E` (kart), her katman **hairline kenar** (`rgba(255,255,255,.06)`).
- **Sarı tek ton değil:** `#FFC400` (aksiyon) + `#F2A900` (hover) + düşük-vurgu sarı `rgba(255,196,0,.12)` zeminler.
- **Semantik durum renkleri markadan AYRI:** başarı `#1FAE5A`, uyarı `#F5A623`, kritik `#E5484D`, bilgi `#3B82F6` — durum = renk + ikon + etiket (renk körlüğü).
- Yumuşak, az; gölge yerine **katman + hairline + iç parıltı** (premium his).

## 2.2 Tipografi
- **Inter** (veya Geist) — data-dense panel fontu. Başlık ağırlığı + gövde ağırlığı (2 ağırlık yeter).
- **`font-variant-numeric: tabular-nums`** — tablolarda/KPI'larda rakamlar hizalanır (profesyonelliğin gizli detayı).
- 4-6 boyutluk net ölçek; satır yüksekliği data tablolarında sıkı.

## 2.3 Komponent & DataViz & Harita
| Katman | Karar | Neden |
|--------|-------|-------|
| Komponent | **shadcn/ui (Radix) + sarı-siyah token katmanı** | hazır erişilebilir primitives, marka token'la giydirilir |
| Rapor grafikleri | **Tremor** (veya Recharts) | dashboard-odaklı, hızlı, şık |
| Canlı/yoğun grafik | **ECharts (canvas)** | canlı akan veri SVG'de takılır, canvas akıcı |
| Web harita | **MapLibre GL / Mapbox — özel KOYU stil** | jenerik Google görünümü değil, markalı NOC haritası |
| İkonografi | **Lucide** (çizgi ikon seti) | emoji YOK panellerde; emoji çocuksu durur |

## 2.4 "Sunu yap / sunu yapma"
**YAP:** dark-first dispatch (NOC) kompozisyonu · veri yoğunluğu + hiyerarşi · tasarlanmış mikro-durumlar (hover/focus/loading/empty/error) · tabular sayılar · katmanlı yüzeyler · markalı koyu harita · gerçek grafik kütüphanesi.
**YAPMA:** panellerde emoji ikon · düz tek-renk arka plan · her şeyi sarıya boyama · SVG ile canlı grafik · jenerik Google harita · "her kart aynı" template hissi · büyük yuvarlak köşe + bol boşluk (tüketici app'i gibi durur, ops paneli sıkı olmalı).

## 2.5 Yüzey bazında "amatör → profesyonel"
- **Dispatcher:** koyu NOC; sol harita (markalı koyu) + sağ canlı kuyruk + üst KPI şeridi (tabular, sparkline); istisna kartları otomatik en üste; emoji yok, durum nokta+etiket.
- **Restoran KDS:** yüksek kontrast kanban, geri sayım renk geçişi, sesli uyarı, TV-panosu modu.
- **Raporlama:** Tremor kartları + ECharts; gauge/histogram/heatmap/waterfall — tablo değil görsel.
- **Müşteri app (B2C):** burası sıcak/aydınlık kalabilir (tüketici), ama tipografi + boşluk disiplinli; iştah açıcı foto.
- **Kurye app:** koyu mod, tek-el, büyük dokunma (48px), tabular kazanç.

---

# 3. ÖZELLİK MATRİSİ & YOL HARİTASI

> 6 yüzey. **MVP** = yarın hatasız şart · **v1** = parity + ilk farklar · **v2** = olgunlaşma/ML.
> ⚠️ Bölüm 5'teki eleştiri "MVP fazla şişkin" diyor — **gerçek MVP daha dar olmalı** (aşağıda işaretli).

## 3.1 Dispatcher / Operasyon Paneli (%80 odak)
| Özellik | Öncelik | Zorluk | Rakipte? | Fark |
|---|---|---|---|---|
| Canlı komuta haritası (NOC) | MVP | Orta | Kısmen | Tasarım + tek-ekran |
| Oto atama motoru (mesafe+yük+bölge+SLA+performans skoru, mod seçimi) | MVP | Orta | Hepsinde (gizli) | Açıklanabilir + ağırlık ayarı |
| Manuel + yarı-oto atama (sürükle-bırak, top-3 öner) | MVP | Kolay | Kısmi | Öneri akışı |
| Yeniden atama / devir (nedenli, oto-tetik) | MVP | Orta | Manuel var | — |
| SLA/ETA izleme + telafi (sarı→kırmızı, kök neden) | MVP | Orta | **Yüzeysel** | **Ana derinlik farkı** |
| Üst KPI şeridi (canlı, istisna en üstte) | MVP | Orta | Temel | "Sinyal" mimarisi |
| Akıllı prep-time çağırma | v1 | Orta | **Yok** | Wolt mantığı |
| Bölge/poligon yönetimi | v1 | Orta | Var | Parity |
| Anomali/alarm motoru (geofence, hareketsiz, yığılma) | v1 | Orta | **Yok** | — |
| Olay/kaza yönetimi | v1 | Orta | **Yok** | Yapılandırılmış akış |
| Batch/çoklu-pickup | v1 | Orta | Kısmi | Sıcaklık/limit kuralı |
| Kurye iletişimi (in-app, şablon, toplu) | v1 | Orta | Temel | — |
| Restoran hazırlık senkronu | v1 | Orta | **Nadir** | Kurye beklemesini azaltır |
| **Açıklanabilir atama** (gerekçe logu) | v2 | Kolay | **Hiçbiri** | **Özgün fark** |
| Geçmiş oynatma (playback) | v2 | Zor | **Yok** | Premium ayırt edici |
| Surge / yoğunluk primi (kurye-tarafı) | v2 | Zor | **Yok** | — |

**Yapılmaz:** 250+ kısıtlı global VRP optimizasyonu (Yozgat ölçeğinde over-engineering) · MVP'de ML atama (veri yok) · her GPS tick'i DB'ye yazma (son konum Redis'te).

## 3.2 Restoran Paneli
KDS kanban (MVP) · tek-tık kurye çağır (MVP) · menü + opsiyon/modifier yönetimi (MVP) · restoran performans raporu (MVP) · **stok/86'lama** (v1, native fark) · **busy mode/throttling** (v1) · çalışma saati (v1) · kampanya motoru (v1) · finans/üçlü cari (v1) · değerlendirme yönetimi (v1) · **yazıcı/ESC-POS fişi** (v1 — ama zor, bkz. Bölüm 5) · restoran mobil app (v1) · çok-şube (v2, şema baştan) · 3.parti pazaryeri entegrasyonu (v2).

## 3.3 Müşteri App (B2C — yerel rakiplerde yok)
OTP giriş (MVP) · keşfet/arama/filtre (MVP) · sepet+opsiyon (MVP) · **kapıda ödeme MVP / online kart fast-follow** · **Domino's canlı takip** (MVP) · adres yönetimi (MVP) · favoriler/tekrar sipariş (v1) · değerlendirme (v1) · kampanya/bildirim (v1) · canlı destek+iade (v1) · sadakat/VIZZ Puan (v2) · zamanlı sipariş (v2) · abonelik VIZZ+ (v2).

## 3.4 Kurye App
Çevrimiçi toggle + vardiya/puantaj (MVP) · görev kabul/ret + istifleme (MVP) · navigasyon deep-link (MVP) · durum güncelleme (MVP) · **POD foto+GPS (MVP)** / imza-barkod (v1) · tahsilat + kasa mutabakatı (MVP) · kazanç + **Cuma sayacı** (MVP/v1) · performans/rozet (v1) · belge/ruhsat takibi (v1) · mola/kaza (v1) · offline mod (v1) · anonim maskeli arama (v2 — ama bkz. Bölüm 5, aslında erken gerekebilir).
**Teknik:** Flutter tek kod · `flutter_background_geolocation` (force-quit'i yöneten tek olgun çözüm, ~500$/yıl) · ücretsiz alternatifler düşer.

## 3.5 Raporlama / Analitik (en saldırılabilir rakip boşluğu)
Canlı KPI panosu (MVP) · kurye scorecard (MVP) · SLA raporu (MVP) · finansal mutabakat/hakediş (MVP) · **persentil dağılımı P50/P90/P95 + darboğaz** (v1) · ısı/yoğunluk heatmap (v1) · iptal/iade pareto (v1) · **birim ekonomi (sipariş-başı katkı payı)** (v1) · bölge ciro (v1) · **müşteri RFM/kohort/retention** (v1) · talep forecast (v2) · idle/utilization (v2) · özel rapor + export (v2).
> ⚠️ **KIRMIZI ÇİZGİ:** MVP'de **event-log şeması** (zaman damgalı durum geçişleri: oluşturuldu→atandı→kabul→restoranda→yolda→teslim/iptal) + **iptal nedeni zorunlu alan**. Bu olmazsa tüm v1 raporlaması (persentil, SLA, birim ekonomi) **imkânsızlaşır.**

## 3.6 Admin
RBAC (MVP) · **denetim logu/audit trail** (MVP, ucuz+değerli) · kurye/restoran CRUD (MVP) · komisyon/fiyat config (MVP) · hakediş/prim-ceza kuralları (v1) · bildirim/kampanya yönetimi (v1) · sistem sağlık/gözlem (v1) · çoklu-şube/tenant (v2, `branch_id` baştan) · pazaryeri entegrasyon yönetimi (v2).
> ⚠️ `branch_id`/`tenant_id` + opsiyon kuralları + finansal ledger + puan ledger **şemaları MVP'de baştan konmalı** (mantık v2 olsa bile) — sonradan migration acısı en pahalısı.

---

# 4. TEKNOLOJİ MİMARİSİ & PROJELENDİRME

## 4.1 Net Kararlar
| Katman | Karar | Gerekçe |
|--------|-------|---------|
| **Backend** | **Go** (modüler monolit, Echo/Fiber + WS) · yedek **.NET 8** (ekip bulunabilirliği kırmızı çizgiyse) | dispatch fan-out + binlerce WS + PostGIS için öngörülebilir gecikme; tek binary = "hatasız deploy" |
| **Mobil** | **Flutter** (kurye+müşteri tek kod, `--flavor`) | tek kod tabanı, AOT native, akıcı harita/animasyon |
| **Realtime** | MVP: Go-native WS + Redis pub/sub → ölçekte Centrifugo | "1 konum → çok abone"; Centrifugo erken = over-engineering |
| **DB** | **PostgreSQL 16 + PostGIS** → v2'de TimescaleDB | mesafe/poligon/en-yakın-kurye şart; GPS izi birikince Timescale |
| **Harita/Rota** | Mobil **Google Maps SDK** (bedava+TR doğru) · Web **MapLibre koyu** · Rota **OSRM self-host** · Adres **Google Geocoding** | TR kırsal adres OSM'de zayıf (Yozgat kritik) |
| **Ödeme** | **iyzico Pazaryeri** (subMerchant split) | restorana oto dağıtım + komisyon kesinti |
| **Altyapı** | **Hetzner** (compute+DB) + **Cloudflare** (DNS/CDN/R2) + **Docker Compose** | AWS'den %70-90 ucuz; k8s MVP'de gereksiz |
| **Auth** | Kendi JWT (access+refresh) + telefon OTP + RBAC | TR telefon-merkezli |
| **Gözlem** | OpenTelemetry + Prometheus/Grafana/Loki + Sentry | sorun kullanıcıdan önce yüzeye çıksın |
| **CI/CD** | GitHub Actions + Coolify (self-host deploy) | küçük ekip, SSH deploy basitliği |

## 4.2 Mimari Prensip
- **Modüler monolit** (mikroservis DEĞİL). Yozgat tek-şehir yükü tek sunucuda rahat döner; Go `internal/` ile sınır çiz, ihtiyaç olunca böl.
- **5 yüzey + 1 link, TEK backend / TEK veri modeli**, RBAC paylaşımlı API.
- **Fiyat hesabı TEK motor** (backend) — müşteri app + restoran panel + dispatch aynı sonucu vermeli.

## 4.3 Repo / Modül Yapısı (monorepo)
```
vizz/
├── backend/                      # Go — modüler monolit
│   ├── cmd/api/                  # HTTP + WebSocket giriş
│   ├── internal/
│   │   ├── dispatch/             # ATAMA MOTORU (skor, override, gerekçe)
│   │   ├── orders/               # sipariş yaşam döngüsü + event-log
│   │   ├── couriers/             # kurye, vardiya, hakediş
│   │   ├── restaurants/          # menü, stok, kanban
│   │   ├── geo/                  # PostGIS + OSRM + geofence
│   │   ├── payment/              # iyzico Pazaryeri
│   │   ├── realtime/             # WS hub / Redis pubsub
│   │   ├── reporting/            # KPI agregasyon + rollup
│   │   ├── auth/                 # JWT + OTP + RBAC + audit
│   │   └── notify/               # FCM push + SMS (Netgsm)
│   └── migrations/
├── mobile/                       # Flutter — flavor: courier | customer
├── web-dispatcher/               # operasyon paneli (%80 ODAK)
├── web-restaurant/               # restoran paneli
├── web-customer/                 # müşteri web (Cloudflare statik)
├── infra/                        # docker-compose, OSRM, Prometheus
└── packages/shared/              # OpenAPI tipleri, fiyat-hesap spec'i
```

## 4.4 Atama Motoru (sistemin kalbi)
- MVP'de **ML YOK**. Skor = müsaitlik + pickup yakınlık + anlık yük + araç tipi + SLA kalan. Modlar: en-yakın · round-robin · havuza-at. Teklif tek kuryeye → 30-60sn timeout → sıradakine (red cezasız, Wolt modeli). **Manuel override her zaman açık.**
- **Açıklanabilir atama** (v2, kolay): gerekçeyi logla+göster.
- **Prep-time eşleşmeli çağırma** (v1): restoran-bazlı tarihsel ortalama heuristik — ama ilk aylarda veri yok (bkz. Bölüm 5 uyarısı).

## 4.5 Maliyet (MVP, aylık — eleştiri ile düzeltilmiş)
Hetzner ~20-35€ · Google Geocoding ~0-20$ · Maps SDK/OSRM/MapLibre 0$ · `flutter_background_geolocation` ~500$/yıl · iyzico işlem-başı.
> Plan ilk "~50€/ay" demişti; eleştiri haklı olarak **SMS/OTP + iyzico komisyon + Sentry/Grafana saklama + R2** dahil **gerçekte ~150-250€/ay** dedi.

## ✅ Tek Cümlelik Final Stack
**Go + PostgreSQL/PostGIS + Redis · Flutter mobil · Next.js dispatcher · OSRM rota + Google adres + MapLibre web harita · Hetzner+Cloudflare+Docker Compose · JWT/OTP/RBAC · iyzico Pazaryeri · OTel/Grafana/Sentry · GitHub Actions+Coolify. Masaüstü yok.**

---

# 5. ADVERSARYAL İNCELEME & AÇIK KARARLAR

> Bağımsız eleştiri ajanının yakaladığı açıklar. **Bunlar planın en değerli kısmı** — koda başlamadan çözülmeli.

## 🔴 Eksik Kritik Modüller (plana eklendi)
1. **KVKK / veri uyumu yok** — müşteri konum+telefon+adres+ödeme topluyoruz. Açık rıza, aydınlatma metni, saklama/silme, VERBİS kaydı şart. Gerçek hukuki risk.
2. **e-Fatura / e-Arşiv / GİB yok** — komisyon kesip restorana dağıtıyoruz (subMerchant) → VIZZ aracı kurum. Komisyon faturası + hakediş belgesi yasal zorunlu.
3. **Müşteri↔Kurye iletişimi MVP'de YOK** — "kapıda kimse yok/adres bulamadım" durumunda kanal sıfır. Bu MVP blocker (v2 değil).
4. **Sipariş iptali / para iadesi (refund) belirsiz** — iyzico iade/chargeback, kısmi iade, "restoran kabul etmedi → oto iade" tanımsız. MVP şart.
5. **Restoran sipariş REDDİ akışı yok** — reddederse müşteri parası + kurye durumu + oto iade tanımsız.
6. **Bildirim teslim garantisi zayıf** — push düşerse sipariş kaybolur; SMS/çağrı fallback + "görüldü" teyidi yok.

## ⚠️ Gözden Kaçan Riskler
7. **Kurye SGK muvazaası (HUKUKİ):** "esnaf-filo + puantaj + vardiya + ceza + check-in/out" = bağımlı çalışan sayılma riski. Puantaj/ceza özelliği bu riski büyütüyor. **İş hukukçusuna danışılmadan kurgulanmamalı.**
8. **iyzico Pazaryeri onayı kolay değil** — subMerchant başvurusu evrak+onay, gıda+COD karması haftalar sürer; "yarın çalışsın" ile çelişir. Tek ödeme bağımlılığı = tek hata noktası.
9. **COD ana ödeme ama kasa mutabakatı v1'e atılmış = ÇOK GEÇ** — kurye elinde nakit birikir; para kaybı/dolandırıcılık MVP'de patlar. Kasa kapama MVP'ye alınmalı.
10. **Soğuk başlangıç / restoran arzı yok** — plan %100 teknik. Restoran yoksa müşteri yok, müşteri yoksa kurye boş. **Asıl ölüm sebebi bu.** İlk 10 restoran onboarding planı şart.
11. **iOS arka plan konum App Store reddi** riski (kurye app gerekçe ister).
12. **Maliyet iyimser** (düzeltildi: ~150-250€/ay).

## 🚫 "Kolay" sanılan ama zor
13. **ESC/POS termal yazıcı** — web panelden tarayıcı→termal çok sancılı (yerel köprü/agent, OS başına ayrı). v1'de "kolay" değil.
14. **OSRM self-host (TR OSM)** — Yozgat kırsalında yanlış rota → ETA → SLA raporu zincirini bozar. (Çelişki: adres Google ama rota OSM.) Rota için de Google/Mapbox değerlendirilmeli.
15. **Domino's canlı takip "MVP/Orta" değil** — login'siz public link + WS + harita + ETA = MVP'nin **en riskli** teknik parçası.
16. **Prep-time çağırma "basit heuristik %80"** — ilk aylarda veri yok → erken/geç çağırır, güveni baltalar. Veri birikene kadar manuel.

## 🎈 MVP Kapsamı Şişkin — En Önemli Uyarı
- Önerilen "MVP" = 6 yüzey × ~30 özellik aynı anda hatasız = **tam ürün**, MVP değil. "Yarın hatasız" sözüyle taban tabana zıt.
- **GERÇEK MVP (öneri):** 1 dispatcher (harita + manuel/yarı-oto atama + SLA sayacı) · kurye app (kabul/durum/POD foto+GPS/tahsilat/Cuma kazanç) · restoran KDS + menü/stok · müşteri sipariş + Domino's takip · **sadece COD** · **event-log şeması** + audit log · RBAC tek role.
- **v1'e ertelenir:** online kart, derin raporlama dashboard (sadece event-log şeması MVP'de kalsın), heatmap, scorecard, finansal mutabakat derinliği, kampanya, çok-kanal.
- **Haklı tek şey:** event-log + `branch_id` + ledger şemasını baştan koymak. Bunun dışındaki çoğu "MVP" etiketi gerçekte v1.

## 🎯 Açık Kararlar (Eray onayı bekleyen)
- [ ] **MVP'yi daralt mı?** (önerilen dar MVP'yi kabul ediyor muyuz?)
- [ ] **Hukuk:** KVKK + e-Fatura + kurye SGK için uzman/muhasebeci ne zaman devreye girecek?
- [ ] **Ödeme:** iyzico Pazaryeri başvurusu ne zaman başlatılacak (onay süresi uzun)?
- [ ] **Soğuk başlangıç:** ilk 10 restoran + ilk kuryeler operasyon planı kim/ne zaman?
- [ ] **Backend dili:** Go (öneri) mi, .NET 8 (ekip varsa) mı?
- [ ] **Rota motoru:** OSRM mi, maliyetine rağmen Google/Mapbox rota mı (SLA doğruluğu için)?
- [ ] **İlk inşa adımı:** repo iskeleti + veri modeli (event-log/şema) mi, yoksa dispatcher panel tasarım-sistemi prototipi mi?

---

*Bu doküman 13 ajanlı derin araştırma + sentez + adversaryal eleştirinin çıktısıdır. İcra, Eray'ın "Açık Kararlar"ı netleştirmesiyle faz faz başlar. Hukuki başlıklar (KVKK, e-Fatura, kurye statüsü) için uzmana danışılması şarttır; bu doküman hukuki görüş değildir.*
