# 🚀 MKBL Otomotiv (mkbloto.com) - cPanel & Linux Sunucu Kurulum Kılavuzu (Türkticaret.Net Uyumlu)

Bu belge, **MKBL Otomotiv Web Sitesi & Yönetim Paneli** uygulamasının Türkticaret.Net cPanel Python/Node.js Hosting ve Linux VPS sunucuları üzerinde adım adım canlıya alınması, domain yönlendirmeleri, cPanel Setup Node.js App adımları ve SMTP e-posta yapılandırmasını içermektedir.

---

## 📦 1. GitHub Deposu (CI/CD Workflow)

- **Resmi GitHub Depo Adresi**: `https://github.com/basaransosyal/mkbl-otomotiv.git`
- **Ana Dal (Branch)**: `main`

---

## 🌐 2. Domain & DNS Yönlendirmeleri (`mkbloto.com`)

Site canlı domain adresi **`mkbloto.com`** olarak yapılandırılmıştır. IT ekibinin yapacağı DNS A-Kayıtları:

| Kayıt Tipi (Type) | Ad / Host | Değer / Hedef (Value) | Açıklama |
|---|---|---|---|
| `A Kaydı` | `@ (mkbloto.com)` | `SUNUCU_IP_ADRESINIZ` | Hosting IP adresi |
| `CNAME` | `www` | `mkbloto.com` | WWW yönlendirmesi |
| `MX Kaydı` | `@` | `mail.mkbloto.com` | Kurumsal E-posta sunucu kaydı |

---

## 🛠️ 3. cPanel Node.js Hosting Adım Adım Kurulum Kılavuzu (Türkticaret.Net)

Türkticaret.Net üzerindeki **Python/Node.js Hosting cPanel** paketi üzerinden canlıya alma adımları:

### Adım 3.1: cPanel'de Node.js Uygulaması Oluşturma
1. cPanel kontrol paneline giriş yapın.
2. **Software (Yazılım)** kategorisi altındaki **"Setup Node.js App"** menüsüne tıklayın.
3. **"Create Application"** butonuna basın.
4. **Node.js Version**: `20.x` veya `18.x` seçin.
5. **Application Mode**: `Production` seçin.
6. **Application Root**: `mkbloto` (proje klasör adı) girin.
7. **Application URL**: `mkbloto.com` alan adını seçin.
8. **Create** butonuna basarak uygulamayı oluşturun.

### Adım 3.2: Kodları cPanel'e Yükleme / GitHub'dan Çekme
cPanel **Terminal** menüsünden veya **Git Version Control** aracından:
```bash
cd /home/kullaniciadi/public_html
git clone https://github.com/basaransosyal/mkbl-otomotiv.git .
```
Veya hazırladığımız `MKBL_Web_Site_Sunucu_Kurulum_Paketi.zip` dosyasını cPanel File Manager ile yükleyip **Extract** edin.

### Adım 3.3: Ortam Değişkenleri (.env) Dosyasını Oluşturma
Proje dizininde `.env` dosyasını oluşturun ve kaydedin:
```env
# Canlı Domain URL
NEXT_PUBLIC_SITE_URL=https://mkbloto.com

# Veritabanı Bağlantısı (SQLite varsayılandır)
DATABASE_URL="file:./dev.db"

# SMTP E-Posta Bildirim Ayarları (Formların Maile Düşmesi İçin)
SMTP_HOST="mail.mkbloto.com"
SMTP_PORT="587"
SMTP_USER="info@mkbloto.com"
SMTP_PASS="MailSifreniz2026!"
SMTP_SENDER="info@mkbloto.com"
SMTP_ENABLE_SSL="true"
```

### Adım 3.4: Bağımlılıkları Yükleme & Build İşlemi
1. cPanel **Setup Node.js App** ekranındaki **"Run NPM Install"** butonuna basın.
2. cPanel Terminal ekranında veritabanını ve canlı sürümü derleyin:
   ```bash
   npx prisma db push
   npm run build
   ```
3. cPanel sayfasındaki **"Restart Application"** butonuna basarak uygulamayı canlıda başlatın.

---

## 💻 4. Linux VPS Sunucu Kurulum Kılavuzu (Alternatif / Dedicated)

```bash
cd /var/www
git clone https://github.com/basaransosyal/mkbl-otomotiv.git mkbloto
cd mkbloto
npm install --production=false
npx prisma db push
npm run build
pm2 start npm --name "mkbl-web" -- start -- -p 3000
pm2 save && pm2 startup
```

---

## 📧 5. E-Posta (SMTP) Ayarları & Canlı Panel Yapılandırması

Müşterilerinizin Web Siteden (Servis Randevusu, Test Sürüşü ve Showroom İletişim Formları) gönderdiği maillerin kurumsal kutunuza (`info@mkbloto.com`) düşmesi için 2 yöntem bulunur:

> 💡 **Admin Paneli Kolaylığı:** SMTP sunucu ayarlarını koda dokunmadan doğrudan canlı sitenizin Admin Paneli ➔ **Site Ayarları ➔ E-Posta & Bildirim Ayarları** sekmesinden tek tıkla yapabilir ve **"E-Posta Gönderimini Test Et"** butonuyla maillerin ulaştığını anında canlıda test edebilirsiniz!

| Mail Sunucu Seçeneği | SMTP Host | Port | Güvenlik |
|---|---|---|---|
| **Türkticaret / cPanel Mail** | `mail.mkbloto.com` | `465` veya `587` | SSL / TLS |
| **Yandex Kurumsal Mail** | `smtp.yandex.com` | `465` | SSL |
| **Google Workspace / Gmail** | `smtp.gmail.com` | `587` | STARTTLS |

---

## 🔄 6. Sitede Bir Güncelleme Yapıldığında IT Ekibinin Komutları

Yazılım ekibi GitHub deposuna yeni bir özellik veya düzeltme yüklediğinde (`git push`), IT ekibinizin sunucuda sadece şu komutları çalıştırması yeterlidir:

```bash
cd /home/kullaniciadi/public_html
git pull origin main
npm run build
```
veya cPanel **Setup Node.js App** ekranındaki **"Restart Application"** butonuna basılması yeterlidir.

---

## 🔐 7. Yönetici Giriş Bilgileri

- **Admin Panel URL**: `https://mkbloto.com/admin`
- **Kullanıcı Adı**: `admin`
- **Şifre**: `mkbl2026`

---

© 2026 **MKBL Otomotiv A.Ş.** - Tüm Hakları Saklıdır.
