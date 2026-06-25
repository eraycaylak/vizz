# 🛒 VIZZ Market — Aşama Aşama Plan

> **Ne:** VIZZ'in ikinci dikeyi — **hızlı atıştırmalık teslimatı** (çikolata, cips, içecek, dondurma…). Büyük market alışverişi DEĞİL; küçük, anlık, "canım çekti" siparişleri.
> **Neden:** Elimizde zaten kurye ağı + dispatcher + termal motor sepeti var. Bunları **yemek yoğunluğu dışındaki boş saatlerde** kullanmak = kuryeye ek kazanç, VIZZ'e yeni gelir, ~sıfır ek altyapı.
> **Yüzeyler:** Müşteri Mobil + Müşteri Web (ayrı "VIZZ Market" deneyimi) + arka tarafta Depo/Toplama paneli + mevcut Dispatcher'a entegrasyon.
> **Tarih:** 30 Haz 2026 · Mevcut master plan ([VIZZ-URUN-MASTER-PLAN.md](VIZZ-URUN-MASTER-PLAN.md)) ile aynı tech/tasarım sistemini paylaşır.

---

## 1. 🎯 Stratejik Mantık — Neden Bizim İçin Doğal?

| Elimizde olan | VIZZ Market'e katkısı |
|---|---|
| **Esnaf kurye filosu** | Yemek pik saatleri (12-14, 19-22) dışında **atıl**. Market siparişleri bu çukurları (öğleden sonra, gece atıştırmalık) doldurur → **kurye utilization ↑, kazanç ↑, filo bağlılığı ↑** |
| **Dispatcher / atama motoru** | Market siparişi = sisteme düşen başka bir sipariş tipi. Aynı harita, aynı atama. **Sıfır yeni operasyon altyapısı** |
| **Termal motor sepeti** | Dondurma/soğuk içecek soğuk zinciri **hazır** |
| **vizz-pro tasarım sistemi + Go backend + Flutter** | Aynı altyapı; sadece yeni modüller (katalog, stok, toplama) |
| **Yozgat'ta yerleşik marka + müşteri** | Yemek müşterisine market cross-sell; tek uygulama ekosistemi |

**Tek cümle tez:** Yemek dikeyi pik saatlerde kazandırır; Market dikeyi **boş saatleri paraya çevirir** ve aynı filoyu daha verimli kullanır. İkisi birbirini dengeler.

---

## 2. 🏪 Operasyon Modeli (en kritik karar)

| Model | Artı | Eksi | Karar |
|---|---|---|---|
| **A) Kendi mini-depo (dark store)** | Tam kontrol, hız, stok/kalite, marj | Kira + stok yatırımı + 1-2 toplayıcı | ✅ **ÖNERİ (Faz 1)** |
| B) Partner bakkal/büfe | Asset-light, stok yok | Kontrol yok, stok/fiyat dağınık, kalite riski | v2 genişleme |

**Öneri:** Yozgat merkezde **tek VIZZ mini-deposu** (~40-80 m²). Yaklaşık **250-400 hızlı dönen SKU** (atıştırmalık ağırlıklı). 1-2 toplayıcı. Hedef teslimat **15-25 dk**.

**SKU kategorileri (atıştırmalık odaklı, büyük market değil):**
🍫 Çikolata & Gofret · 🥔 Cips & Çerez · 🍪 Bisküvi & Kraker · 🥤 İçecek (gazlı/su/enerji/meyve suyu/soğuk kahve) · 🍦 Dondurma · 🍬 Şeker & Sakız · 🥜 Kuruyemiş · 🌭 Anlık atıştırmalık (sandviç/börek) · 🔋 Acil ihtiyaç (çakmak, pil, mum) · _(ops.)_ 🚬 Sigara & Tütün → **yaş doğrulama zorunlu** (Faz 2, hukuk).

**Fiyat & teslimat:**
- Düşük/sıfır min sepet (anlık satın alma psikolojisi); küçük teslimat ücreti, **₺X üstü ücretsiz**.
- Ürün marjı (perakende) = ana gelir; teslimat ücreti = kurye payı.
- Hedef AOV düşük, **sıklık yüksek** (klasik q-commerce).

---

## 3. 🧩 Mevcut Yapıdan Yeniden Kullanım

| Katman | Yemek dikeyi | VIZZ Market |
|---|---|---|
| Kurye filosu + dispatcher | ✅ aynı | ✅ aynı (market siparişi = order type:'market') |
| Atama motoru / harita | ✅ aynı | ✅ aynı |
| Go backend | sipariş/kurye/ödeme modülleri | + **catalog, inventory, picking** modülleri |
| Ödeme (iyzico) | ✅ aynı | ✅ aynı |
| Auth / müşteri | ✅ aynı hesap | ✅ aynı hesap (tek VIZZ ID) |
| vizz-pro tasarım | ✅ aynı | ✅ aynı + "VIZZ Market" alt-marka rozeti (sepet ikonu) |
| Termal sepet | sıcak yemek | soğuk zincir (dondurma) |

> **Mimari karar:** Sipariş tablosuna `vertical: 'food' | 'market'` alanı + `inventory`/`picking` modülleri **baştan** eklenir. Aynı `orders`/`dispatch`/`couriers` çekirdeği iki dikeye de hizmet eder.

---

## 4. 📱 Yüzeyler

1. **VIZZ Market — Müşteri Mobil** (q-commerce app): kategori grid, ürün, hızlı sepet, anlık teslimat takibi.
2. **VIZZ Market — Müşteri Web**: aynısının masaüstü/web sürümü.
3. **Depo / Toplama Paneli** (operasyon, web): sipariş düşünce **toplama listesi** (pick list), stok düş, "hazır → kurye çağır".
4. **Dispatcher entegrasyonu**: market siparişleri mevcut komuta haritası/kuyruğunda `Market` etiketiyle görünür; aynı atama.

---

## 5. ✨ Özellikler (yüzey × faz)

### Müşteri (Mobil + Web)
| Özellik | Faz |
|---|---|
| Kategori grid + ürün kartları (foto/fiyat/gramaj) | MVP |
| Arama + filtre (kategori, indirimli) | MVP |
| Hızlı sepet (tek dokunuş ekle, adet, çapraz öneri "yanına?") | MVP |
| Min sepet / teslimat ücreti / ETA ("~18 dk") | MVP |
| Ödeme (online + kapıda) | MVP (kapıda) |
| **Anlık teslimat takibi** (hazırlanıyor→toplandı→yolda→kapında) | MVP |
| Adres + kapsama kontrolü | MVP |
| Favoriler / tekrar al / "son aldıkların" | v1 |
| Kampanya, kupon, paket fırsatları (2 al 1 öde) | v1 |
| Stok-yok rozeti + alternatif öneri | v1 |
| Sadakat / VIZZ Puan (yemekle ortak) | v2 |
| Yaş doğrulama (sigara/tütün) | v2 |

### Depo / Toplama Paneli
| Özellik | Faz |
|---|---|
| Gelen sipariş → **toplama listesi** (raf sırasına göre) | MVP |
| Tek-tık "toplandı/paketlendi → kurye çağır" | MVP |
| Stok düş + düşük stok uyarısı + 86'lama | MVP/v1 |
| Ürün/katalog yönetimi (kategori/fiyat/foto/gramaj/raf) | MVP/v1 |
| Stok sayım + tedarik/giriş | v1 |
| Performans (toplama süresi, fire) | v1 |

### Dispatcher (mevcut panele küçük ekleme)
| Özellik | Faz |
|---|---|
| Market siparişleri haritada/kuyrukta `Market` etiketi | MVP |
| Dikey filtresi (Yemek / Market / Hepsi) | MVP |
| Market için ayrı SLA hedefi (daha hızlı) | v1 |

---

## 6. 🗺️ Aşama Aşama Yol Haritası

### 🟣 Faz 0 — Karar & Kurgu (kod yok)
- Operasyon modeli onayı: **kendi mini-depo** (öneri).
- Depo lokasyonu (merkez), ~250-400 SKU listesi, ilk tedarikçiler.
- Fiyatlandırma + min sepet + teslimat ücreti politikası.
- Alt-marka kimliği: "VIZZ Market" (sepetli arı rozeti).

### 🟡 Faz 1 — MVP (önce **tıklanabilir mock**, sonra gerçek)
- **VIZZ Market Müşteri Mobil + Web** (mock): katalog → sepet → kapıda ödeme → anlık takip.
- **Depo/Toplama paneli** (mock): toplama listesi + hazır→kurye çağır + temel stok.
- **Dispatcher**'a `Market` etiketi + dikey filtresi.
- Backend: `vertical` alanı + `catalog`/`inventory`/`picking` modül iskeleti (gerçek faza geçince).

### 🟠 Faz 2 — v1 (olgunlaşma)
- Online kart, kampanya/kupon, favoriler, stok yönetimi derinliği, düşük-stok/86, performans raporları, market analitiği (en çok satan SKU, saat bazlı talep, fire).
- Sadakat (yemekle ortak puan), abonelik.

### 🔴 Faz 3 — Genişleme
- Partner bakkal/büfe modeli (asset-light kapsama), ikinci depo, yeni dikeyler (eczane-dışı, çiçek), yaş doğrulamalı ürünler, talep tahmini.

---

## 7. ⚠️ Kararlar & Riskler

| Konu | Not |
|---|---|
| **Dark-store vs partner** | Öneri: kendi depo (kontrol + filo sinerjisi). Partner = Faz 3. |
| **SKU sayısı** | Az ama doğru (250-400). "Büyük market" tuzağına düşme — atıştırmalık odak. |
| **Soğuk zincir** | Dondurma/soğuk içecek → termal sepet zorunlu; sıcak yaz kritik. |
| **Stok doğruluğu** | Oversell riski → gerçek-zamanlı stok düşümü + 86 şart. |
| **Sigara/tütün/yaş** | Yasal yaş doğrulama + ruhsat → Faz 2, hukukçuyla. |
| **Filo çakışması** | Pik saatte yemek mi market mi önceliği → dispatcher'da dikey-öncelik kuralı (v1). |
| **Min sepet ekonomisi** | Çok küçük sepet kurye maliyetini karşılamaz → akıllı min sepet / batch teslimat. |

---

## ✅ Özet Karar
**VIZZ Market = aynı filo + dispatcher + tasarım sistemi + Go backend üzerine kurulan ikinci q-commerce dikeyi.** Kendi mini-deposuyla başla; mock prototip (müşteri mobil+web + depo paneli) → onay → gerçek modüller. En büyük silah: **boş kalan kuryeyi paraya çevirmek.**

*Sonraki adım: Eray onayıyla (a) mock yüzeyleri kur (VIZZ Market mobil+web+depo paneli) veya (b) önce operasyon modeli/SKU/fiyat netleştir.*
