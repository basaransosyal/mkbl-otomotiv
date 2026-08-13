# 🚀 MKBL Otomotiv Web Sitesi & Yönetim Paneli - Yazılımcı Mimari & Sunucu Kurulum Rehberi (Deployment Guide)

Bu doküman, projeyi teslim alacak yazılımcıların kod mimarisini kolayca anlaması, güvenlik standartlarını incelemesi ve canlı sunucuya (Vercel, VPS, Docker, PM2) sorunsuz aktarması için hazırlanmıştır.

---

## 1. 🏗️ Proje Mimarisi ve Teknoloji Yığını (Tech Stack)

- **Framework:** Next.js 14 (App Router) & React 18
- **Dil:** TypeScript (Tip Güvenlikli)
- **Stil & Tasarım:** Tailwind CSS & Lucide Icons (Glassmorphism Dark Theme)
- **Veritabanı & ORM:** SQLite & Prisma ORM (`prisma/schema.prisma`)
- **API Mimarisi:** Next.js App Router Server Route Handlers (`src/app/api/...`)
- **İçerik Saklama:** Dosya yüklemeleri `public/uploads/` dizinine güvenli uzantı kontrolü ile kaydedilmektedir.

---

## 2. 📁 Klasör Yapısı ve Yazılımcı Rehberi

```text
MKBL Web Site/
├── prisma/
│   └── schema.prisma         # Veritabanı tabloları (Vehicles, Users, Requests, Settings)
├── public/
│   ├── images/               # Sabit site görselleri ve logo
│   └── uploads/              # Admin paneli üzerinden yüklenen medya dosyaları
├── src/
│   ├── app/
│   │   ├── (public)/         # Ziyaretçi sayfaları (Ana Sayfa, Modeller, Servis, İletişim)
│   │   ├── admin/            # Yönetim Paneli Modülleri
│   │   │   ├── forms/        # Form & Pop-up Açık Rıza Metinleri Yönetimi
│   │   │   ├── messages/     # Gelen İletişim Mesajları
│   │   │   ├── pages/        # Sayfa & SEO İçerik Modülü
│   │   │   ├── services/     # Servis Randevu Talepleri
│   │   │   ├── settings/     # Site Genel Ayarları & Link Aktif/Pasif Yönetimi
│   │   │   ├── test-drives/  # Test Sürüşü Randevu Talepleri
│   │   │   ├── users/        # Kullanıcı & Rol Yönetimi (Süper Admin / Editör)
│   │   │   └── vehicles/     # Araç Yönetimi CMS & Ana Sayfa Vitrin Seçimi
│   │   └── api/              # Backend API Uç Noktaları (REST API)
│   ├── components/           # Reusable UI Bileşenleri (Navbar, Footer, 360Viewer, Calculator, Modal)
│   └── lib/                  # Veritabanı istemcisi (`prisma.ts`), Ayarlar (`settings.ts`), Auth (`auth.ts`)
├── .env.example              # Ortam değişkenleri şablonu
├── next.config.js            # Next.js yapılandırması
└── package.json              # Proje bağımlılıkları ve npm komutları
```

---

## 3. 🛡️ Güvenlik ve Koruma Önlemleri (Security Features)

1. **Görsel Yükleme Güvenliği (File Upload Validation):**
   - `/api/upload` rotasında sadece `image/*` MIME tipine ve `.jpg, .jpeg, .png, .webp, .svg, .gif` uzantılarına izin verilir.
   - Zararlı script/çalıştırılabilir dosya yüklemeleri engellenmiştir.
2. **Rol Tabanlı Yetkilendirme (RBAC):**
   - **SÜPER ADMİN:** Tüm kullanıcı yönetimi, roller, şifre sıfırlama, silme ve ayar değiştirme yetkilerine sahiptir.
   - **EDİTÖR:** Yalnızca Formlar ve Talepler (Test Sürüşü, Servis, Mesajlar) sayfalarını **sadece okuma** yetkisi ile görüntüleyebilir; silme veya rol değiştirme yapamaz.
3. **Süper Admin Koruma Kalkanı:**
   - Süper Admin bilgileri ve rolü, diğer kullanıcılar veya editörler tarafından değiştirilemez.
4. **XSS ve Girdi Temizleme:**
   - Kullanıcı girdileri sanitizasyondan geçirilerek veritabanına kaydedilir.
5. **SEO & Meta Güvenliği:**
   - Dynamic SSR meta etiketleri ve duyarlı robot yönlendirmeleri mevcut.

---

## 4. 🚀 Sunucuya Aktarma ve Yayına Alma Komutları (Deployment)

### Yöntem A: Vercel / Netlify Üzerinde Yayınlama (Tavsiye Edilen)
1. Proje reposunu GitHub / GitLab hesabınıza yükleyin.
2. Vercel dashboard üzerinden projeyi içe aktarın.
3. Build komutu: `npm run build`
4. Output directory: `.next`
5. Vercel üzerinde ortam değişkenlerini ekleyin (`.env.example` referans alarak).

### Yöntem B: VPS Ubuntu Sunucuda Yayınlama (Node.js + PM2 + Nginx)

1. **Sunucuda Repoyu Klonlayın ve Bağımlılıkları Yükleyin:**
   ```bash
   git clone <repo-url>
   cd "MKBL Web Site"
   npm install
   ```

2. **Veritabanı Şemasını Uygulayın:**
   ```bash
   npx prisma db push
   ```

3. **Üretim Derlemesini Oluşturun:**
   ```bash
   npm run build
   ```

4. **PM2 ile Servisi Başlatın:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "mkbl-website" -- start
   pm2 save
   pm2 startup
   ```

5. **Nginx Reverse Proxy Ayarı (Örnek `/etc/nginx/sites-available/default`):**
   ```nginx
   server {
       listen 80;
       server_name mkblotomotiv.com.tr www.mkblotomotiv.com.tr;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **SSL Sertifikası (Let's Encrypt / Certbot):**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d mkblotomotiv.com.tr -d www.mkblotomotiv.com.tr
   ```

---

## 🔑 Varsayılan Giriş Bilgileri

- **Yönetim Paneli Giriş URL:** `/admin` veya `/admin/settings`
- **Süper Admin Kullanıcı Adı:** `admin` (veya `mkbl`)
- **Süper Admin Şifresi:** `mkbl2026`
