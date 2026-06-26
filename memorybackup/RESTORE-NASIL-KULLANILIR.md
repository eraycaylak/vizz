# 🧠 VIZZ Hafıza Yedeği — Geri Yükleme & Kullanım Kılavuzu

> Bu klasör, VIZZ projesinin **ruflo/Claude hafızasını** ("beyin") içerir. Yani: tüm mimari kararlar, neden öyle karar verildiği, UI'daki her modülün ne işe yaradığı, entegrasyon stratejisi, yüksek-erişilebilirlik (HA) kararı, kurye otomasyonu/güven-skoru, kasa, raporlar... Claude bunu okuyunca **projeyi sıfırdan anlatmana gerek kalmadan** bağlamı bilir.

## 📦 İçindekiler
| Dosya | Ne |
|-------|-----|
| `vizz-projesi.md` | **Asıl beyin** — projenin tüm hafızası (frontmatter + içerik). Tek dosya, kendi içinde tam. |
| `MEMORY.md` | Hafıza indeksi (Claude her oturumda bunu okur; tek satır VIZZ işaretçisi). |
| `RESTORE-NASIL-KULLANILIR.md` | Bu dosya. |

> Not: `vizz-projesi.md` içinde `[[duzen-takintisi]]` gibi köşeli-parantez çapraz-referanslar var — bunlar proje sahibinin **kişisel çalışma-tarzı** notlarına işaret eder, **gizlilik için dahil edilmedi**. Dangling görünmeleri sorun değil, sadece "ileride yazılabilir" işaretidir.

## 🔧 Hafıza sistemi nasıl çalışıyor (kısa)
- Claude Code / ruflo, her projede `~/.claude/projects/<proje-yolu-kodlanmış>/memory/` altında **dosya-tabanlı hafıza** tutar.
- Her `.md` = **bir hafıza** (üstte `--- name/description/metadata ---` frontmatter + altında içerik).
- `MEMORY.md` = **indeks**; her yeni oturumda otomatik bağlama yüklenir (tek satır/dosya).
- Yol kodlaması: projenin mutlak yolundaki `/` → `-`. Örn. `/Users/ali/vizz-backend` → klasör adı `-Users-ali-vizz-backend`.

## ✅ Geri yükleme — 3 yol (en kolaydan)

### Yol 1 — En basit: Claude'a dosyayı ver
Projende Claude Code'u aç, bu dosyayı sürükle/işaret et ve de ki:
> "Bu `vizz-projesi.md` VIZZ projesinin hafızası. İçeriğini kendi hafızana (`~/.claude/projects/.../memory/vizz-projesi.md`) kaydet ve `MEMORY.md` indeksine bir satır işaretçi ekle."

Claude gerisini halleder. (Çoğu kişi için yeterli.)

### Yol 2 — Elle kopyala (kalıcı, garantili)
1. Projende Claude Code'u **bir kez** çalıştır → `~/.claude/projects/<proje-yolu>/memory/` klasörü oluşur. (Yoksa elle oluştur.)
2. `vizz-projesi.md` dosyasını o `memory/` klasörüne **kopyala**.
3. O klasördeki `MEMORY.md` indeksine şu satırı ekle (yoksa MEMORY.md'yi oluştur, bizimkini referans al):
   ```
   - [VIZZ projesi](vizz-projesi.md) — Yozgat yemek+market teslimat platformu (mimari/UI/HA/entegrasyon/otomasyon)
   ```
4. **Yeni bir Claude oturumu** başlat → indeks yüklenir → "VIZZ" deyince tüm bağlamı hatırlar.

### Yol 3 — ruflo / claude-flow kullanıyorsan (vektör hafızaya da basmak için)
Dosya-tabanlı (Yol 2) zaten yeter; ayrıca claude-flow vektör hafızasına da eklemek istersen:
```bash
npx @claude-flow/cli@latest memory store \
  --namespace project \
  --key vizz-projesi \
  --value "$(cat vizz-projesi.md)"
# Arama: npx @claude-flow/cli@latest memory search --query "VIZZ mimari HA"
```
(MCP kullanıyorsan: `memory_store` / `memory_import` araçları.)

## 🎯 Geri yükledikten sonra
Claude'a "VIZZ projesinde neredeyiz?" / "mimari kararımız ne?" diye sor — dosyada her şey yazılı:
- Stack: **Go modüler monolit (yatay-ölçeklenebilir, ≥2 instance+LB) + Postgres/PostGIS(primary+replica+failover) + Redis(Sentinel)**, Hetzner; Flutter mobil; Cloudflare yalnız frontend.
- **HA / SPOF-yok**: her katman ≥2 kopya + oto-failover + blue-green; `realtime/channels/notify/reporting` baskı gelince servise ayrılır, **ledger çekirdekte kalır**.
- UI'daki her modül → backend modülü eşlemesi, veri modeli, kritik gereksinimler.

> **Tam ürün spesifikasyonu için** (bu hafızanın yanında): VIZZ-tasarim projesindeki `docs/` klasörü (GELISTIRICI-BRIEFI.md, VIZZ-MIMARI-KARARI.md, ENTEGRASYON-STRATEJISI.md…) + canlı prototip: https://eraycaylak.github.io/vizz/
