# 🚀 MKBL Otomotiv (mkbloto.com) - IT Sunucu & Canlıya Alma Rehberi (GitHub Entegre)

Bu belge, **MKBL Otomotiv Web Sitesi & Yönetim Paneli** uygulamasının GitHub deposu üzerinden canlı sunucuya (Linux VPS / Dedicated / cPanel) kurulumu, domain yönlendirmeleri, SSL sertifikası, SMTP e-posta yapılandırması ve gelecek güncelleme adımlarını içermektedir.

---

## 📦 1. GitHub Deposu (CI/CD Workflow)

- **Resmi GitHub Depo Adresi**: `https://github.com/basaransosyal/mkbl-otomotiv.git`
- **Ana Dal (Branch)**: `main`

---

## 🌐 2. Domain & DNS Yönlendirmeleri (`mkbloto.com`)

Site canlı domain adresi **`mkbloto.com`** olarak yapılandırılmıştır. IT ekibinin yapacağı DNS A-Kayıtları:

| Kayıt Tipi (Type) | Ad / Host | Değer / Hedef (Value) | Açıklama |
|---|---|---|---|
| `A Kaydı` | `@ (mkbloto.com)` | `SUNUCU_IP_ADRESINIZ` | Sunucunuzun Statik IP adresi |
| `CNAME` | `www` | `mkbloto.com` | WWW yönlendirmesi |
| `MX Kaydı` | `@` | `mail.mkbloto.com` | Kurumsal E-posta sunucu kaydı |

---

## 🛠️ 3. Linux VPS (Ubuntu / Debian / AlmaLinux) Adım Adım Kurulum Kılavuzu

### Adım 1: GitHub Depoundan Projeyi Çekme
```bash
cd /var/www
git clone https://github.com/basaransosyal/mkbl-otomotiv.git mkbloto
cd mkbloto
npm install --production=false
```

### Adım 2: Ortam Değişkenleri (.env) Yapılandırma
Proje kök dizininde `.env` dosyasını oluşturun:
```bash
nano .env
```
Aşağıdaki değişkenleri ekleyip kaydedin:
```env
# Canlı Domain URL
NEXT_PUBLIC_SITE_URL=https://mkbloto.com

# SQLite Veritabanı Dosya Yolu
DATABASE_URL="file:./dev.db"

# SMTP E-posta Bildirim Ayarları (Formların Maile Düşmesi İçin)
SMTP_HOST="mail.mkbloto.com"
SMTP_PORT="587"
SMTP_USER="info@mkbloto.com"
SMTP_PASS="MailSifreniz2026!"
SMTP_SENDER="info@mkbloto.com"
SMTP_ENABLE_SSL="true"
```

### Adım 3: Veritabanı Oluşturma ve Production Build
```bash
# Veritabanı tablolarını ve seed verilerini işler
npx prisma db push

# Üretim derlemesini tamamlar
npm run build
```

### Adım 4: PM2 Process Manager İle Servisi Başlatma
```bash
pm2 start npm --name "mkbl-web" -- start -- -p 3000
pm2 save
pm2 startup
```

### Adım 5: Nginx Reverse Proxy & Certbot SSL Kurulumu
`/etc/nginx/sites-available/mkbloto.com` dosyası oluşturun:
```nginx
server {
    server_name mkbloto.com www.mkbloto.com;

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
Aktifleştirip Ücretsiz Let's Encrypt SSL sertifikasını yükleyin:
```bash
sudo ln -s /etc/nginx/sites-available/mkbloto.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d mkbloto.com -d www.mkbloto.com
```

---

## 📧 4. E-Posta (SMTP) Ayarları & Canlı Panel Yapılandırması

Müşterilerinizin Web Siteden (Servis Randevusu, Test Sürüşü ve Showroom İletişim Formları) gönderdiği maillerin kurumsal kutunuza (`info@mkbloto.com`) düşmesi için 2 yöntem bulunur:

> 💡 **Admin Paneli Kolaylığı:** SMTP sunucu ayarlarını kod değiştirmeden doğrudan canlı sitenizin Admin Paneli ➔ **Site Ayarları ➔ E-Posta & Bildirim Ayarları** sekmesinden tek tıkla yapabilir ve **"E-Posta Gönderimini Test Et"** butonuyla maillerin ulaştığını anında canlıda test edebilirsiniz!

| Mail Sunucu Seçeneği | SMTP Host | Port | Güvenlik |
|---|---|---|---|
| **Kurumsal cPanel Mail** | `mail.mkbloto.com` | `465` veya `587` | SSL / TLS |
| **Yandex Kurumsal Mail** | `smtp.yandex.com` | `465` | SSL |
| **Google Workspace / Gmail** | `smtp.gmail.com` | `587` | STARTTLS |

---

## 🔄 5. Gelecekte Bir Güncelleme Yapıldığında IT Ekibinin Komutları

Yazılım ekibi GitHub deposuna yeni bir özellik veya düzeltme yüklediğinde (`git push`), IT ekibinizin sunucuda sadece şu komutları çalıştırması yeterlidir:

```bash
cd /var/www/mkbloto
git pull origin main
npm run build
pm2 restart mkbl-web
```

---

## 🔐 6. Yönetici Giriş Bilgileri

- **Admin Panel URL**: `https://mkbloto.com/admin`
- **Kullanıcı Adı**: `admin`
- **Şifre**: `mkbl2026`

---

© 2026 **MKBL Otomotiv A.Ş.** - Tüm Hakları Saklıdır.
