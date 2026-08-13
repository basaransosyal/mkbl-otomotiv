# 🚀 MKBL Otomotiv (mkbloto.com) - Sunucu Kurulum & Canlıya Alma Rehberi

Bu belge, **MKBL Otomotiv Web Sitesi & Yönetim Paneli** uygulamasının canlı sunucuya (Linux VPS / Dedicated / cPanel / Plesk) kurulumu, veritabanı ilklendirmesi, SSL tanımı ve PM2 / Nginx yayınlama adımlarını içermektedir.

---

## 📋 1. Sunucu Gereksinimleri

- **Node.js**: `v18.x` veya `v20.x LTS` (Önerilen: Node v20+)
- **Paket Yöneticisi**: `npm` v9+ veya `yarn` / `pnpm`
- **Veritabanı**: SQLite (Varsayılan entegre, ek DB kurulumu gerektirmez) veya PostgreSQL / MySQL
- **Web Sunucusu**: Nginx (Reverse Proxy) veya cPanel / Plesk Node.js Passenger
- **Process Manager**: PM2 (`npm install -g pm2`)
- **Domain**: `mkbloto.com` (A kaydı sunucu IP adresine yönlendirilmiş)

---

## 🛠️ 2. Linux (Ubuntu / Debian / AlmaLinux) VPS Kurulum Adımları

### Adım 1: Proje Dosyalarını Sunucuya Aktarma
```bash
cd /var/www
git clone https://github.com/your-repo/mkbl-otomotiv.git mkbloto
# veya FTP/SFTP ile proje dosyalarını /var/www/mkbloto dizinine yükleyin
cd /var/www/mkbloto
```

### Adım 2: Bağımlılıkları Yükleme
```bash
npm install --production=false
```

### Adım 3: Ortam Değişkenlerini (.env) Yapılandırma
Proje kök dizininde `.env` dosyasını oluşturun:
```bash
nano .env
```
Aşağıdaki değişkenleri ekleyin ve kaydedin:
```env
# Canlı Domain URL
NEXT_PUBLIC_SITE_URL=https://mkbloto.com

# SQLite Veritabanı Dosya Yolu
DATABASE_URL="file:./dev.db"

# SMTP E-posta Bildirim Ayarları (Opsiyonel - Admin Panelinden de Düzenlenebilir)
SMTP_HOST="mail.mkbloto.com"
SMTP_PORT=587
SMTP_USER="bildirim@mkbloto.com"
SMTP_PASS="GüçlüSifreniz123!"
SMTP_SENDER="bildirim@mkbloto.com"
```

### Adım 4: Veritabanı Oluşturma ve Seed (Varsayılan Verileri Yükleme)
```bash
# SQLite tablosunu oluşturur ve günceller
npx prisma db push

# Varsayılan site ayarlarını, admin hesabını ve araçları veritabanına işler
npx prisma db seed
```

### Adım 5: Production Build (Üretim Derlemesi)
```bash
npm run build
```

### Adım 6: PM2 ile Uygulamayı Başlatma
```bash
# PM2 servisini başlatma
pm2 start npm --name "mkbl-web" -- start -- -p 3000

# Sunucu yeniden başladığında otomatik çalışması için kaydetme
pm2 save
pm2 startup
```

---

## 🌐 3. Nginx Reverse Proxy & SSL (Let's Encrypt) Kurulumu

### Adım 1: Nginx Konfigürasyonu Dosyası Oluşturma
```bash
sudo nano /etc/nginx/sites-available/mkbloto.com
```
Aşağıdaki Nginx bloğunu yapıştırın:
```nginx
server {
    server_name mkbloto.com www.mkbloto.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ayarı aktif etme ve Nginx'i test etme
sudo ln -s /etc/nginx/sites-available/mkbloto.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Adım 2: Ücretsiz Let's Encrypt SSL Sertifikası Yükleme
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d mkbloto.com -d www.mkbloto.com
```

---

## ⚙️ 4. cPanel / Plesk Node.js Selector Kurulumu

Eğer cPanel veya Plesk kullanıyorsanız:
1. cPanel ekranından **Setup Node.js App** simgesine tıklayın.
2. **Create Application** butonuna basın.
3. Node.js Version: `20.x` veya `18.x` seçin.
4. Application Mode: `Production` yapın.
5. Application Root: `mkbloto` (proje klasörü)
6. Application URL: `mkbloto.com`
7. Application startup file: `node_modules/next/dist/bin/next` veya `server.js`
8. **Run NPM Install** ve `npx prisma db push` komutlarını cPanel terminalinden çalıştırın.

---

## 🔐 5. Yönetici (Admin) Giriş Bilgileri

- **Admin Panel URL**: `https://mkbloto.com/admin`
- **Varsayılan Kullanıcı Adı**: `admin`
- **Varsayılan Şifre**: `mkbl2026`

> **Güvenlik Notu:** Canlıya alındıktan sonra Admin Paneli > **Kullanıcı Yönetimi** ekranından yönetici şifrenizi değiştirmeniz önerilir.

---

## 🚀 6. SEO & Performans Kontrol Listesi

- [x] **Canonical & Domain**: `NEXT_PUBLIC_SITE_URL=https://mkbloto.com` ayarlandı.
- [x] **Sitemap.xml**: `https://mkbloto.com/sitemap.xml` dinamik olarak tüm araçları ve sayfaları içerir.
- [x] **Robots.txt**: `https://mkbloto.com/robots.txt` Google botlarına `/admin` hariç tüm siteyi açar.
- [x] **Schema.org**: `AutoDealer` & `Product` / `Car` JSON-LD zengin sonuç yapısal verileri entegre edildi.
- [x] **Security Headers**: `X-Frame-Options`, `X-Content-Type-Options`, `HSTS` güvenlik başlıkları aktiftir.

---

© 2026 **MKBL Otomotiv A.Ş.** - Tüm Hakları Saklıdır.
