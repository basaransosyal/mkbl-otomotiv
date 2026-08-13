# MKBL Otomotiv - Yazılım Mimarisi & Teknik Doküman

Bu doküman, MKBL Otomotiv Kepez Showroom web uygulamasının yazılım mimarisini, dizin yapısını ve teknik altyapısını açıklayan geliştirici kılavuzudur.

---

## 1. Proje Genel Tanımı & Teknolojiler

- **Framework:** Next.js 14 (App Router)
- **Dil:** TypeScript (Strict Mode)
- **Kütüphaneler:** React 18, Tailwind CSS, Lucide React Icons
- **Veritabanı & ORM:** Prisma ORM, SQLite (varsayılan) / PostgreSQL / MySQL
- **E-Posta Servisi:** Nodemailer (SMTP Support)

---

## 2. Dizin Yapısı & Kod Organizasyonu

```
MKBL Web Site/
├── prisma/
│   └── schema.prisma           # Prisma veritabanı veri modelleri
├── public/                     # Statik dosyalar, görseller ve HTML rehberler
│   ├── TEKNIK_DOKUMAN_VE_MIMARI.html
│   └── CANLIYA_ALMA_VE_KURULUM_REHBERI.html
├── src/
│   ├── app/                    # Next.js 14 App Router Sayfa ve API Rotaları
│   │   ├── admin/              # Şifreli Yönetim Paneli
│   │   ├── api/                # Backend REST API endpointleri
│   │   └── page.tsx            # Vitrin Ana Sayfa
│   ├── components/             # Reusable UI Bileşenleri
│   │   ├── CostCalculator.tsx  # Canlı Yakıt Tasarruf Hesaplama Modülü
│   │   ├── Vehicle3DRotator.tsx# 360 Derece Araç İnceleme Modülü
│   │   └── Navbar.tsx / Footer.tsx
│   └── lib/                    # Yardımcı Servisler & Veritabanı Bağlantıları
│       ├── fuelService.ts      # EPİAŞ CAS & CollectAPI Canlı Veri Servisi
│       ├── mail.ts             # Nodemailer SMTP E-Posta Gönderim Servisi
│       ├── prisma.ts           # PrismaClient Singleton Nesnesi
│       └── settings.ts         # Varsayılan Site Ayarları & Tip Tanımları
```

---

## 3. Canlı API Entegrasyon Mimarisi (EPİAŞ & CollectAPI)

### EPİAŞ Elektrik API Servisi (Teknik Kılavuz v1.15.15 Uyumlu)
- **CAS TGT Kimlik Doğrulama:** `https://giris.epias.com.tr/cas/v1/tickets` endpoint'ine `application/x-www-form-urlencoded` formatında `username` ve `password` gönderilerek 2 saat geçerli `TGT-xxxx` bileti alınır.
- **PTF Fiyat Sorgulama:** Alınan TGT bileti `TGT` başlığı olarak `https://seffaflik.epias.com.tr/electricity-service/v1/markets/dam/data/mcp` endpoint'ine gönderilir ve güncel piyasa takas fiyatı (TL/MWh) çekilerek mesken tarifesine dönüştürülür.
- **Manuel API Key Desteği:** Admin panelinden girilen özel TGT bilet anahtarı varsa sistem login yapmadan doğrudan sorgu atar.

### CollectAPI Akaryakıt (Benzin) Servisi
- `https://api.collectapi.com/gasPrice/turkeyGasoline?city=antalya` üzerinden canlı Antalya benzin fiyatı çekilir.

### Veri Güvenliği & Kesinti Koruması (Failover & Rate Limit Guard)
- **3.5 Saniye AbortController Zaman Aşımı:** Dış API yanıt vermezse sunucu kilitlenmez.
- **Son Kayıtlı Fiyat Koruması:** Bağlantı koparsa veri sıfırlanmaz, kesintiden önceki son geçerli fiyat otomatik devreye girer.
- **24 Saatlik Önbellek:** Günde sadece 1 kez sorgu atılarak IP engellemesi (WAF Rate Limit) önlenir.
- **Manuel Admin Varsayılanı:** API kapalıyken Admin Paneli'nde belirlenen sabit tarifeler gösterilir.

---

## 4. Veritabanı Modelleri Summary

- `SiteSettings`: Tüm sitenin dinamik ayarları ve API bilgileri.
- `Vehicle`: Araç katalog modelleri ve teknik özellikleri.
- `ServiceBooking`: Online servis ve bakım randevusu talepleri.
- `TestDriveRequest`: Test sürüşü başvuru kayıtları.
- `Message`: İletişim formu mesajları.
- `User`: Admin paneli yetkili kullanıcıları.
