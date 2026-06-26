# Minijett (Maxijett) Kokpit — Rakip Analizi

> Kaynak: Masaüstü `minijett/` klasöründeki 14 kayıtlı sayfa (render edilmiş DOM, `.txt` ama HTML).
> Ürün adı: **minijett-kokpit** · Sağlayıcı: **Maxijett** (destek: `maxijett-support-center.web.app`).
> Analiz: 26 Haz 2026. Bölüm 2 (canlı Chrome keşfi) ayrıca eklenecek.

## 1. Teknoloji & Mimari
| Konu | Tespit |
|------|--------|
| Frontend | **Vite + React SPA** (`index-*.js` chunk hash, `<div id="root">`) |
| CSS | **Tailwind** (arbitrary values: `bg-[#F9FAFB]`, `w-[52px]`, `dark:` modu) |
| Harita | **Leaflet + OpenStreetMap** tile (kendi harita altyapısı, Google Maps değil) |
| Tema | Light `#F9FAFB` / Dark `#0a0a0b` — "Koyu Tema" toggle |
| Model | **Çok-kiracılı (multi-tenant)** — bayi/zincir operatör paneli, kontör (prepaid) bazlı |

## 2. Tasarım Sistemi (bayıldığımız "duruş")
| Token | Değer |
|-------|-------|
| **Marka sarısı** | `#F5C518` (IMDb altını) + varyant `#E0B416 #FFD500 #E5B816` |
| Koyu yüzeyler | `#0a0a0b` (en koyu) · `#111113` · `#1A1A1A` (sidebar/kart) · border `#333` |
| Açık zemin | `#F9FAFB` |
| Vurgu | mavi `#4C7BE1` · kırmızı `#E30A17` (uyarı) |
| **Tipografi** | **Aşırı kompakt — `text-[11px]` baskın (548×!)**, 10px/12px. Yoğun bilgi = pro terminal hissi |
| Köşe | `rounded-md` (kart) · `rounded-full` (pill/rozet) · `rounded-lg` |
| Boşluk | sıkı: `px-2.5 py-1 gap-1.5` |
| Gölge | popover/pane için `shadow-xl` |
| Sidebar | **`w-[52px]` ince ikon-rail**, `bg-[#1A1A1A]`, sağ kenar `border-[#333]` |
| Font ağırlığı | `font-medium` baskın |

**Özet his:** Ultra-kompakt, yoğun, 11px metin, 52px ince rail, altın-on-siyah, ince border'lı küçük `rounded-md` kartlar, header'da dikey-bölmeli (`border-l`) KPI şeridi. "Kokpit/NOC" estetiği — VIZZ'den bile daha sıkı/dense.

## 3. Kalıcı Üst Header KPI Şeridi (HER sayfada sabit)
Kompakt `Etiket: değer` formatı + tooltip, dikey çizgiyle bölünmüş:
- Bugünkü teslim edilen sipariş sayısı · Aktif kurye sayısı
- **Max:** 2 (kurye başına max paket) · **Oto:** Açık (otomatik atama)
- **Kontör:** 5000 (bakiye) · **Kalite:** (zamanında teslim %)
- **Yoğunluk:** Uygun · **Hazırlık:** (ort. hazırlama süresi)
- Sağ: Sayfayı Yenile · Koyu Tema · Destek · kullanıcı avatarı (EÇ)

→ **VIZZ dersi:** her ekranda görünen, tek satırlık canlı operasyon nabzı. Bizde Komuta'da var ama her sayfada yok.

## 4. Sol Menü (12 modül)
`Panel · Siparişler · Organizasyon · Kontör Yönetimi · Taşıma Ücretleri · Atama Ayarları · Hakedişler · Kullanıcılar · Raporlar · Duyurular · Ayarlar · Destek Merkezi`

## 5. Sayfa Sayfa Yapı

### Panel (Ana Sayfa) — canlı operasyon
- Leaflet harita + global KPI şeridi + canlı sipariş listesi
- Liste kontrol: **Sıralama: Zaman ↓ · Grupla · Hazır / Kritik / İleri T.** filtreleri
- Tablo: `# · Firma · Durum · Kurye · Adres · Müşteri · ETA · Tutar · Zaman`
- "0 AKTİF" kurye rozeti · boş: "Sipariş bulunamadı"

### Siparişler — tüm sipariş geçmişi
- Tarih aralığı · **Filtreler · CSV İndir**
- Durum hattı: `Hazırlanıyor · Atandı · Sürücüye atandı · Paket için yolda · Firmada bekliyor · Teslimatta · Teslim edildi · İptal`
- Tablo: `Durum · Restoran · Kurye · Adres · Taşıma Ücreti · Ödeme · Tarih · Kaynak · Not`

### Organizasyon — varlık yönetimi
- Sekmeler: **Restoranlar · Kuryeler · Araçlar · Coğrafi Sınırlar**
- Filtre: Aktif/Pasif/Tümü · **İşletme Ekle**
- Restoran tablosu: `Ad · Entegrasyon Kodu · Adres · Telefon · Mağaza Tipi · Sipariş Tipi · Hazırlık · Durum`

### Kontör Yönetimi — prepaid bakiye (gelir modeli)
- Kartlar: **Mevcut Bakiye · Toplam Satın Alınan · Toplam Tüketilen · Toplam Hediye Edilen**
- Kontör İşlemleri tablosu: `Tarih · İşlem Tipi · Miktar · Sipariş Sayısı · Açıklama` (örn. "Hediye +5000")
- → **Model:** sipariş başına kontör düşülür; bakiye bitince durur. (VIZZ komisyon modelinden farklı — kontör/prepaid.)

### Taşıma Ücretleri — teslimat ücret tanımları
- Geçerlilik tarihi · **Geçmişi Göster · Yeni Tanım**
- Tablo: `Restoran · Durum · Ücret Tipi · Restoran Ücreti · Kurye Ücreti · Geçerlilik · İşlemler`
- → Restoran ücreti ile kurye ücreti AYRI (marj = fark).

### Atama Ayarları — ⭐ ATAMA ALGORİTMASI (3 sekme, en kritik modül)
**Genel Ayarlar:**
- Otomatik Atama aç/kapa (zincir bazlı)
- **Atama Algoritması:** Sıralı Atama
- **Sıralama Kriteri:** En Az Siparişli
- **Kümeleme Algoritması:** Kümeleme Yok (paket gruplama)
- Varsayılan (Az Yoğun) kurye kapasitesi (aynı anda max paket)
- Mesafe Limiti Uygula (Limit yok)
- **Kurye–Restoran Sabitleme** (kurye sabitleme)
- **Restoran Bazlı Sipariş Kümeleme**
- Manuel Atama: **Kurye Arası Transfer** · **Havuzdan Paket Çekme** (kurye atanmamış paketi kendine çeker)

**Atama Bölgeleri:** Leaflet harita üstünde bölge çizimi · 0/100 · Yeni Bölge

**Atama Kısıtlamaları:** belirli kuryeyi belirli restorandan engelle (`Kurye ara · Restoranlar · Engelle`)

→ **VIZZ dersi:** Bizim "Otomasyon" görünümümüz bunun karşılığı; onlar **konfigürasyon** sunuyor (algoritma/kriter/kümeleme/bölge/sabitleme/kısıtlama), bizdeki **kural+skor + anomali radarı** onlarda YOK = farkımız. İkisini birleştir: konfigürasyon + akıllı otomasyon + güven skoru.

### Hakedişler — muhasebe/ödeme
- Sekmeler: **İşletme Muhasebe · Kurye Muhasebe · Kurye Hesap Hareketleri**
- Dönem: Günlük/Haftalık/Aylık · tarih aralığı · durum filtresi (Aktif/Aktif Değil/Silinmiş)

### Kullanıcılar — RBAC (rol/izin)
- **Yeni Kullanıcı** · filtre (Rol, Durum)
- Tablo: `Ad Soyad · Kullanıcı adı · E-posta · Mağaza · Son Değişiklik · İşlemler`
- **Granüler izin editörü:** rol (Mağaza Yöneticisi) + İzinler: **Faturalar · Tarifeler · Mağaza raporu · Genel rapor · Müşteri yorumları** (tekil toggle, "Tümünü seç/Temizle", "2/2" sayaçları)
- Profil: Ad/Soyad/Telefon (TR), Dil, Aktif

### Raporlar — ⭐ 8 rapor tipi (derinlik farkı)
Sekmeler: **Günlük Özet · Saatlik Dağılım · Teslimat Performansı · Bayi Kâr/Zarar · Kurye Karnesi · Mağaza Marjı · Kurye Detay · Kontör Kullanımı**
- Metrikler: Toplam/Teslim Edilen (%)/İptal/Teslimat Başarısız sipariş · Ort. Teslimat · Ort. Mesafe
- "Veriler 25 Haziran 2026'a kadar güncel" (gün sonu batch)
- → **VIZZ Raporlar zaten güçlü (ECharts leapfrog); onların 8 sekmesini eşleştir:** Bayi K/Z, Mağaza Marjı, Kurye Karnesi bizde var/benzer.

### Duyurular — duyuru yönetimi
- Tarih aralığı · Aktif/Pasif/Silinmiş/Tümü · **Yeni Duyuru**

### Ayarlar — operasyon kuralları (4 sekme)
Sekmeler: **Operasyonel · Konum · Mali · Mola Kuralları**
- **Mola Kuralları:** kurye kendi molaya çıkabilir mi (Açık) · mola süresi (dk) · yoğun saatte mola talebi (Kapalı) · **yoğun saat aralıkları** (Öğle 10:00–14:59 / Akşam 16:00–20:59 — başlangıç:bitiş)
- **Görünürlük:** firmalar kurye konumunu görsün mü · kuryeler adresi ne zaman görsün (**Yola çıktıktan sonra**)
- **Sipariş Kuralları:** kurye teslim alırken **fiş fotoğrafı zorunlu mu** · restoran telefon eklemek zorunda mı · restoran kurye almadan adres değiştirebilsin mi
- **Bayi Çalışma Aralığı:** 00:00–23:59

### Destek Merkezi
- `maxijett-support-center.web.app` (Firebase) — ayrı destek sitesi

## 6. VIZZ İçin Ana Çıkarımlar
1. **Her sayfada kalıcı KPI şeridi** — operasyon nabzı her ekranda (kompakt Etiket:değer).
2. **Ultra-kompakt 11px tipografi** + 52px ince rail = daha fazla bilgi/ekran. (VIZZ 13px; daha sıkı varyant düşünülebilir.)
3. **Atama Ayarları konfigürasyonu** — algoritma/kriter/kümeleme/bölge/sabitleme/kısıtlama. Bizdeki akıllı otomasyon + güven skoru + anomali ile BİRLEŞTİR = üstünlük.
4. **Kontör (prepaid) gelir modeli** — onların yolu; VIZZ komisyon + kontör opsiyonu düşünülebilir.
5. **Taşıma ücreti: restoran ücreti vs kurye ücreti ayrı** — marj şeffaflığı.
6. **Granüler RBAC** — rol + tekil izin toggle.
7. **8 rapor tipi** — Bayi K/Z, Mağaza Marjı, Kurye Karnesi, Kontör Kullanımı.
8. **Operasyon kuralları derinliği** — mola, yoğun saat, görünürlük, fiş fotoğrafı, adres-değiştirme kuralı.
9. **Zayıf yanları (VIZZ fırsatı):** akıllı/öğrenen otomasyon yok (manuel konfig), anomali/sahtekârlık radarı yok, kurye güven skoru yok, çok-kanallı (Yemeksepeti/Trendyol/Getir) entegrasyon görünmüyor, tüketici tarafı (müşteri app/web) bu panelde yok — onlar B2B dispatch, biz B2C+B2B+Market.

---

# Bölüm 2 — Canlı Chrome Keşfi (kokpit.minijett.com.tr)

> 26 Haz 2026 · Google Chrome (Browser 1, EÇ oturumu) · test hesabı **Denizli** merkez · veri boş (0 sipariş/kurye).
> Salt-okuma keşif: hiçbir kayıt oluşturulmadı/değiştirilmedi.

## Doğrulanan / yeni detaylar
- **Canlı URL:** `https://kokpit.minijett.com.tr` · React route'ları: `/dashboard /orders /organization /credits /delivery-fees /assignment-settings /invoices /users /reports /announces /settings /support-center`
- **İki tema canlı:** Light (#F9FAFB) ve Dark (#0a0a0b) — alt-rail ay ikonuyla geçiş. Dark = imza görünüm (sarı-aktif nav).
- **Üst KPI şeridi (her sayfada):** yeşil noktalı pill'ler — `Bugün teslim · Aktif kurye · Max:2 · Oto:Açık` (+ tooltip'te Kontör/Kalite/Yoğunluk/Hazırlık). Sağ: bildirim çanı · Destek · EÇ avatar.
- **Sol rail (52px):** Dashboard · Organizasyon · Kontör · Taşıma Ücretleri · Atama · Hakediş(fatura ikonu) · Kullanıcılar · Raporlar · Duyurular · Ayarlar · Destek + altta **Yenile** & **Tema** ikonları. Aktif = **sarı ikon**.

## Dashboard (canlı)
- Harita (Leaflet/OSM) sağda, sol panel solda — ayraç (resize handle) ortada.
- Harita kontrolleri: **Katmanlar · Tam Ekran · Sipariş Özeti · Kurye Durumları** (sağ üst) + zoom.
- Sol panel: arama (firma/müşteri/kurye/adres/fiyat/ödeme), **0 AKTİF**, Sıralama:Zaman↓, Grupla, **Hazır/Kritik/İleri T.** sekmeli filtre, tablo (#·Firma·Durum·Kurye·Adres·Müşteri·ETA·Tutar·Zaman).

## ⭐ Atama Ayarları (canlı — tam doğrulama)
- **Atama Algoritması dropdown:** sadece **2 seçenek** → `Sıralı Atama` · `En Yakın Kurye`. (Basit! VIZZ skill-based/öngörücü ile fark atar.)
- **Sıralama Kriteri:** `En Az Siparişli` · `En Uzun Süredir Boşta` (2 seçenek)
- **Kümeleme Algoritması:** `Kümeleme Yok` (+ muhtemel başka seçenekler)
- **Genel Parametreler:** Kurye Kapasitesi (max paket) · Mesafe Limiti Uygula (checkbox, "Limit yok")
- **Kurye–Restoran Sabitleme:** toggle — "sabit kuryelere atanır, uygun yoksa sipariş bekletilir"
- **Restoran Bazlı Kümeleme:** toggle — aynı restorandan paketleri aynı kuryeye toplama
- **Manuel Atama Usulleri:** `Kurye Arası Transfer` (kapalı) · `Havuzdan Paket Çekme` (açık)
- Altta full-width **Kaydet**. Setting deseni: kart(başlık+açıklama+sağda kontrol). Toggle: **sarı=açık / gri=kapalı**.

## Raporlar (canlı)
- 8 sekme doğrulandı. Günlük Özet: Mağaza dropdown + Tarih picker + "Veriler X tarihine kadar güncel" chip.
- **Stat kartları:** renkli ikon-rozeti (rounded-md) + büyük rakam + etiket → Toplam Sipariş(mavi) · Teslim Edilen(yeşil ✓) · İptal(kırmızı ✗) · Teslimat Başarısız(uyarı) · Ort. Teslimat(turuncu saat) · Ort. Mesafe(pin).

## Ayarlar (canlı)
- 3 sekme: **Operasyonel · Konum · Mali Ayarlar**.
- **Mola Kuralları:** "Kuryeler kendileri molaya çıkabilir mi?" toggle + **metin durum etiketi (AÇIK/KAPALI)** · Mola süresi input (30 **dk** suffix) · "yoğun saatte mola talebi" toggle (KAPALI) · **Yoğun saat aralıkları:** Öğle (Başlangıç 11:30 — Bitiş 14:00, saat ikonu + aralık ipucu 10:00–14:59) · Akşam yoğun saati.
- → Toggle'da metin durum etiketi + saat-aralığı input deseni çok cilalı, kopyalanabilir.

## Kullanıcılar (canlı)
- Başlık + "rol ve izinlerini düzenle" · **Yeni Kullanıcı** · filtre (Ara/Rol/Durum) · tablo **BÜYÜK-HARF başlıklar** (AD SOYAD·KULLANICI ADI·E-POSTA·ROL·MAĞAZA·DURUM·SON DEĞİŞİKLİK·İŞLEMLER) · sayfalama (1-1/1).
- RBAC izin editörü "Yeni Kullanıcı" modalında (kayıtlı DOM: rol + Faturalar/Tarifeler/Mağaza raporu/Genel rapor/Müşteri yorumları tekil toggle).

## Henüz canlı açılmayanlar (yapı kayıtlı DOM'dan biliniyor, aynı dark kart/tablo/sekme dili)
Kontör Yönetimi · Taşıma Ücretleri · Hakedişler(/invoices) · Duyurular · Destek Merkezi — hepsi boş (test hesabı), istenirse tek tek açılır.

## Net tasarım dersleri (VIZZ'e taşınacak)
1. **Her sayfada sabit üst KPI pill şeridi** (yeşil nokta + Etiket:değer + tooltip).
2. **Setting kartı deseni:** kart = başlık + 1 satır açıklama + sağda kontrol; toggle **sarı/gri** + opsiyonel **AÇIK/KAPALI metin etiketi**.
3. **Renkli ikon-rozetli stat kartları** (mavi/yeşil/kırmızı/turuncu rounded-md chip).
4. **İki tema** birinci sınıf (light + dark, anında geçiş).
5. **Sekmeli alt-navigasyon** (sarı alt-çizgi aktif) modül içi: Organizasyon(4), Atama(3), Ayarlar(3), Hakediş(3), Raporlar(8).
6. **Saat-aralığı input** (saat ikonu + canlı aralık ipucu) — operasyon kuralları için.
7. **VIZZ üstünlüğü netleşti:** onların atama motoru 2 algoritma + manuel toggle = statik kural. Bizim **akıllı kural+skor + kurye güven skoru + anomali/sahtekârlık radarı + çok-kanal entegrasyon + tüketici/market dikeyi** onlarda YOK.

---

# Bölüm 3 — İşletme (Restoran) Paneli · canlı Chrome keşfi (26 Haz)
Aynı `kokpit.minijett.com.tr` ama **restoran rolüyle** giriş → çok farklı, sade görünüm (light tema). VIZZ karşılığı = **restoran-panel.html**.

## Rail (6 modül): Dashboard · Siparişler · Raporlar · Duyurular · Destek · **Mağaza Ayarları**
## Üst bar: logo · 0 aktif · **2× bakiye pill (₺0.00 cüzdan + ₺0.00 kart)** · bildirim · **Sipariş Oluştur**(sarı) · **Ödeme Al** · Destek · avatar

## ⭐ Sipariş Oluştur (sağ drawer) — restoranın KURYE ÇAĞIRMA formu (en kritik)
- Sekme: **Anlık** / **İleri Tarihli**
- Müşteri: Ad* · Soyad
- Telefon* (TR bayrak + maske)
- Adres: arama (sokak/cadde/mahalle) + **"Haritadan seç"**
- Sipariş Detayı: **Fiyat*** · **Ödeme Tipi**(Nakit) · **Hazırlama Süresi**(15 dk) · **Araç**(Motosiklet)
- Sipariş Notu (textarea) · İptal / Gönder

## ⭐ Ödeme Al (sağ drawer) — nakit mutabakat
- "Kuryeyi seç + tahsil tutarı gir → **4 haneli onay kodu**; kurye kendi app'inde onaylayınca ödeme tamamlanır."
- "Elinde nakit olan kurye bulunmuyor" boş durumu · İptal / **Kod Oluştur**
- **BUGÜNKÜ TAHSİLATLAR** listesi

## Dashboard: harita (kendi kuryeleri/siparişleri) + canlı sipariş tablosu (#·Firma·Durum·Kurye·Adres·Müşteri·ETA·Tutar·Zaman) + Hazır/İleri T. filtre + arama
## Raporlar: 3 sekme (Günlük Özet·Saatlik Dağılım·Teslimat Performansı) + renkli stat kartları (operatördeki 8 değil)
## Mağaza Ayarları: **Entegrasyon Kodu** (790559, kopyala — harici POS/sipariş sistemine mağaza tanımı) + **Harici Sistem Eşlemesi** (Entegrasyon Tipi + Harici Mağaza ID)

## VIZZ restoran-panel'e taşınacak (DAHA İYİSİ):
1. **Kurye Çağır (Sipariş Oluştur) drawer** — bizde YOK. Ekle + VIZZ farkı: canlı tahmini ücret + en yakın kurye ETA göster.
2. **Ödeme Al (nakit mutabakat) drawer** — 4 haneli kod akışı. Ekle.
3. **Bakiye/Kontör pill'leri** üst barda.
4. **Mağaza Ayarları → Entegrasyon Kodu + POS/kanal eşleme** (Yemeksepeti/Trendyol/Getir). Bizde Ayarlar var, entegrasyon kodu ekle.
5. Bizde zaten ONLARDA OLMAYAN: **KDS kanban · Menü yönetimi · Finans/Cari · ECharts rapor** → koru, üstüne bunları ekle = net üstünlük.
