# 🔌 VIZZ — Platform Entegrasyon Stratejisi (Yemeksepeti / Trendyol / Getir)

> Araştırma: 26 Haz 2026 (gerçek kaynaklar, aşağıda). Amaç: "sipariş düştüğü anda VIZZ panelinde görünsün" hedefini en hızlı + sağlam nasıl kuracağımız.

## Özet karar
**Aggregator-first.** Tek aracı API'ye bağlan → anında 4 platform. Trendyol+Getir'i paralelde kendin bağla (kolay). Yemeksepeti direkt partnerliği hacim büyüyünce.

## Platformların resmi durumu
| Platform | Erişim | Zorluk | Notlar |
|----------|--------|--------|--------|
| **Yemeksepeti** (Delivery Hero) | Partner başvurusu **zorunlu**: NDA → teknik onay → **PGP** ile credential talebi → test → pilot → prod | 🔴 Zor | 2 API: *Integration Middleware* + senin *Plugin*'in. Webhook: yeni/iptal sipariş, kabul/red, "hazırlandı", menü, mağaza durumu |
| **Trendyol Yemek** (*Trendyol GO by Uber Eats*) | **Self-service**: `partner.trendyol.com → Firma > Entegrasyon Bilgileri` → API Key + Secret + Cari ID + Restoran ID | 🟢 Kolay | Webhook + REST |
| **Getir Yemek** | `developers.getir.com` — webhook (HTTP POST) | 🟢 Kolay | Yeni sipariş: müşteri/adres/ürün/tutar/orderID |

## Aggregator (entegratör) firmalar — pratik yol
4 platformu **tek normalize JSON webhook**'ta toplamış hazır servisler. NDA derdi yok:
| Firma | Model |
|-------|-------|
| **Posentegra** | Yemeksepeti+Getir+Trendyol+Migros → tek webhook. Müşteri = yazılım/kurye firmaları. **~$14-16/ay**, otomatik onay + yanıt yoksa **tekrar gönderme** + menü senkron. 130K+ sipariş/gün |
| **API Merkezi** | POS/restoran yazılımlarına REST + webhook |
| **Entegre.app · Dresoft** | AI destekli / adaptör altyapı |

## Maxijett/Hızır aslında nasıl alıyor (kanıt)
POS sistemlerinde (Menulux, JaviPos, Optimus) **kurye entegrasyon hedefi** olarak listeleniyorlar ("siparişi doğrudan Maxijett'e yönlendir"). Minijett'te gördüğümüz **Mağaza Ayarları → Entegrasyon Kodu (790559) + Harici Sistem Mağaza ID** tam bu kanca:
```
Yemeksepeti/Getir/Trendyol
   → Restoranın POS'u VEYA aggregator çeker
   → Maxijett'in entegrasyon koduyla panele düşer
   → Maxijett kuryeye atar
```
→ Maxijett **çoğunlukla aracı (POS/aggregator) üzerinden** alıyor; büyük hacimde Yemeksepeti'ye direkt partner de olabilir.

## VIZZ uygulama planı (`channels` modülü + UI)
1. **MVP:** Aggregator'a bağlan → tek webhook → `channels` adaptörü normalize → `orders` (`channel` etiketli) → dispatcher/restoran ekranına düşer → kurye atanır → durum platforma geri senkron.
2. **Paralel:** Trendyol + Getir self-service credential (ücretsiz).
3. **Sonra:** Yemeksepeti direkt partnerlik (NDA+PGP).
4. **POS köprüsü:** Restoran panelindeki **Entegrasyon Kodu** (UI'da var) → POS'u hazır restoranlar oradan yönlendirir.
- Garanti: idempotency (çift sipariş yok) + outbox + auto-retry + `channel_orders` eşleştirme tablosu.

## Kaynaklar
- Yemeksepeti: https://integration.yemeksepeti.com/ · https://developers.deliveryhero.com/documentation/pos.html
- Trendyol GO: https://developers.tgoapps.com/ · https://partner.trendyol.com/
- Getir: https://developers.getir.com/
- Aggregator: https://posentegra.com/ · https://www.apimerkezi.com/
- Kurye-POS entegrasyon kanıtı: https://www.menulux.com/restoran-otomasyonu/pos-sistemleri/pos-entegrasyonlari · https://www.paketmatik.com/
