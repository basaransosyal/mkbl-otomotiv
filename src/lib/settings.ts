export interface ISiteSettings {
  id?: string;
  siteName: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  copyrightText: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  
  // Header Navigation Menu, Buttons & Visibility Flags
  navHomeText: string;
  navHomeActive?: boolean;
  navModelsText: string;
  navModelsActive?: boolean;
  navServiceText: string;
  navServiceActive?: boolean;
  navContactText: string;
  navContactActive?: boolean;
  navCtaButtonText: string;
  navCtaButtonUrl: string;
  navCtaButtonActive?: boolean;

  // Master Service Module Switch
  showServiceModule?: boolean;

  // Hero / Banner
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  ctaButtonText: string;
  ctaButtonUrl: string;

  // Footer Settings
  footerDescription: string;
  footerBadge1: string;
  footerBadge2: string;
  footerModelLinksTitle: string;
  footerServicesTitle: string;
  footerShowroomTitle: string;

  // Footer Column Link Texts & URLs
  // Footer Column Link Texts, URLs & Active Flags
  footerModelLink1: string;
  footerModelLink1Url: string;
  footerModelLink1Active: boolean;
  footerModelLink2: string;
  footerModelLink2Url: string;
  footerModelLink2Active: boolean;
  footerModelLink3: string;
  footerModelLink3Url: string;
  footerModelLink3Active: boolean;
  footerServiceLink1: string;
  footerServiceLink1Url: string;
  footerServiceLink1Active: boolean;
  footerServiceLink2: string;
  footerServiceLink2Url: string;
  footerServiceLink2Active: boolean;
  footerServiceLink3: string;
  footerServiceLink3Url: string;
  footerServiceLink3Active: boolean;
  footerServiceLink4: string;
  footerServiceLink4Url: string;
  footerServiceLink4Active: boolean;
  footerAdminLinkText: string;
  footerAdminLinkUrl: string;
  footerAdminLinkActive: boolean;

  // Calculator
  calcTitle: string;
  calcSubtitle: string;
  defaultElectricityRate: number;
  defaultGasPrice: number;
  defaultGasConsump: number;
  defaultEvConsump: number;
  showCalculator: boolean;
  autoFetchFuelRates?: boolean;
  collectApiKey?: string | null;
  collectApiActive?: boolean;
  epiasUser?: string | null;
  epiasPass?: string | null;
  epiasApiKey?: string | null;
  epiasActive?: boolean;

  // WhatsApp Widget Settings
  whatsappActive?: boolean;
  whatsappPhone?: string;
  whatsappTitle?: string;
  whatsappSubtitle?: string;
  whatsappMessage?: string;
  whatsappQuickOptions?: string;
  whatsappPosition?: string;

  // Showroom & Contact Page Editable Fields
  contactPageBadge: string;
  contactPageTitle: string;
  contactPageSubtitle: string;
  contactInfoTitle: string;
  contactMapName: string;
  contactMapCoords: string;
  contactMapButtonText: string;
  contactMapUrl: string;
  contactMapEmbedUrl: string;
  contactFormBadge: string;
  contactFormTitle: string;
  contactFormSubtitle: string;
  contactFormButtonText: string;

  // Service Page Editable Fields
  servicePageBadge: string;
  servicePageTitle: string;
  servicePageSubtitle: string;
  serviceFormBadge: string;
  serviceFormTitle: string;
  serviceFormSubtitle: string;
  serviceFormButtonText: string;

  // Test Drive Form Editable Fields
  testDriveFormBadge: string;
  testDriveFormTitle: string;
  testDriveFormSubtitle: string;
  testDriveFormButtonText: string;

  // Legal Policies
  privacyPolicyText: string;
  termsOfUseText: string;
  kvkkText: string;

  // Cookie Consent & KVKK Settings
  showCookieBanner?: boolean;
  cookieBannerText?: string;
  cookiePolicyText?: string;

  // Form Consent Texts (Popup Popups)
  consentExplicitText: string;
  consentCommercialText: string;

  // Tracking Scripts
  googleTagManagerId: string;
  googleAdsId: string;
  metaPixelId: string;
  customHeadScripts: string;
  customBodyScripts: string;

  // SMTP Email Settings
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpSender?: string;
  smtpEnableSsl?: boolean;

  // Homepage Sections Layout & Visibility Settings
  homeShowHero?: boolean;
  homeOrderHero?: number;
  homeShowGallery?: boolean;
  homeOrderGallery?: number;
  homeShowCalculator?: boolean;
  homeOrderCalculator?: number;
  homeShowConfigurator?: boolean;
  homeOrderConfigurator?: number;
  homeShowFeatures?: boolean;
  homeOrderFeatures?: number;

  // Maintenance Mode Settings
  isMaintenanceMode?: boolean;
  maintenanceTitle?: string;
  maintenanceSubtitle?: string;
  maintenanceEstimatedTime?: string;
}

export const DEFAULT_SITE_SETTINGS: ISiteSettings = {
  id: 'default',
  siteName: 'MKBL Otomotiv',
  phone: '+90 (242) 310 87 15',
  email: 'info@mkbloto.com',
  address: 'Altınova Sinan Mah. Serik Cad. No:161 Havalimanı Karşısı 07170 Kepez / Antalya',
  workingHours: 'Hafta İçi & Cumartesi: 09:00 - 19:00 | Pazar: 11:00 - 17:00 (Nöbetçi Ekip)',
  copyrightText: '© 2026 MKBL Otomotiv A.Ş. Tüm hakları saklıdır.',
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  linkedinUrl: 'https://linkedin.com',
  youtubeUrl: 'https://youtube.com',

  // Header Nav Defaults
  navHomeText: 'Ana Sayfa',
  navHomeActive: true,
  navModelsText: 'Modeller',
  navModelsActive: true,
  navServiceText: 'Servis & Bakım',
  navServiceActive: false,
  navContactText: 'Showroom & İletişim',
  navContactActive: true,
  navCtaButtonText: 'Teklif & Sürüş Randevusu Al',
  navCtaButtonUrl: '/models/karea-fit',
  navCtaButtonActive: true,

  // Master Service Module Switch (Default OFF as requested - Sales only)
  showServiceModule: false,

  heroTitle: 'Bindiğin Gibi Değil. Karea Fit',
  heroSubtitle: 'Var olan bir sınıftan değil, yeni bir sınıfın ilki. %100 elektrikli Karea Fit, bugün şehir hayatına tam uyum sağlamak için tasarlandı.',
  heroBadge: '🎉 CANLI YAYIN TESTİ BAŞARILI | MKBL Otomotiv %100 Elektrikli',
  ctaButtonText: 'Test Sürüşü Randevusu Al',
  ctaButtonUrl: '/models/karea-fit',

  footerDescription: 'MKBL Otomotiv güvencesiyle temsil edilen %100 elektrikli, ideal şehir aracı Karea Fit. Ev tipi 220V prizden hızlı şarj (%20-%80 2 saat) ile şehir içi pratik ve ekonomik ulaşım.',
  footerBadge1: 'Kepez Showroom Açık',
  footerBadge2: '%100 Elektrikli Karea Fit',
  footerModelLinksTitle: 'Model İnceleme',
  footerServicesTitle: 'Hizmetler',
  footerShowroomTitle: 'Kepez Showroom',

  // Footer Column Link Defaults & Active States
  footerModelLink1: 'Karea Fit (Teknik Özellikler)',
  footerModelLink1Url: '/models/karea-fit',
  footerModelLink1Active: true,
  footerModelLink2: 'Gövde Renk Seçenekleri',
  footerModelLink2Url: '/models/karea-fit',
  footerModelLink2Active: true,
  footerModelLink3: 'Karea Cargo',
  footerModelLink3Url: '/models/karea-cargo',
  footerModelLink3Active: true,
  footerServiceLink1: 'Elektrikli Periyodik Bakım',
  footerServiceLink1Url: '/service',
  footerServiceLink1Active: true,
  footerServiceLink2: 'LFP Batarya Health Check-up',
  footerServiceLink2Url: '/service',
  footerServiceLink2Active: true,
  footerServiceLink3: '2000+ (44) Güvenlik Kontrolü',
  footerServiceLink3Url: '/service',
  footerServiceLink3Active: true,
  footerServiceLink4: 'Kepez Showroom & Deneyim',
  footerServiceLink4Url: '/contact',
  footerServiceLink4Active: true,
  footerAdminLinkText: 'Yönetim Paneli Oturumu',
  footerAdminLinkUrl: '/admin',
  footerAdminLinkActive: true,

  calcTitle: 'Benzine Karşı Katlarca Yakıt Tasarrufu',
  calcSubtitle: 'Aylık ortalama kaç kilometre yol yaptığınızı seçin, Karea Fit ile her yıl ne kadar tasarruf edeceğinizi hesaplayın.',
  defaultElectricityRate: 3.25,
  defaultGasPrice: 67.00,
  defaultGasConsump: 7.5,
  defaultEvConsump: 9.3,
  showCalculator: true,
  autoFetchFuelRates: true,
  collectApiKey: '',
  collectApiActive: false,
  epiasUser: 'mkblsosyal@gmail.com',
  epiasPass: 'Basaran+2026',
  epiasApiKey: '',
  epiasActive: false,

  // WhatsApp Widget Defaults
  whatsappActive: true,
  whatsappPhone: '905321234567',
  whatsappTitle: 'Kepez Showroom Canlı Destek',
  whatsappSubtitle: 'Size nasıl yardımcı olabiliriz?',
  whatsappMessage: 'Merhaba! Karea Fit elektrikli araçlar hakkında bilgi almak istiyorum.',
  whatsappQuickOptions: '["🚗 Karea Fit Test Sürüşü İstiyorum", "💰 Fiyat & Kredi Teklifi Al", "📍 Showroom Konumu İstiyorum", "🔧 Servis & Bakım Randevusu"]',
  whatsappPosition: 'bottom-right',

  // Showroom Contact Page Defaults
  contactPageBadge: 'Showroom & Kepez Yetkili Bayi',
  contactPageTitle: 'Sizi Kepez Showroom’umuza Bekliyoruz',
  contactPageSubtitle: 'Karea Fit modelimizi yakından incelemek, test sürüşü yapmak veya çayımızı içmek için hemen ziyaret edin.',
  contactInfoTitle: 'Showroom & İletişim Bilgileri',
  contactMapName: 'Antalya Kepez Showroom',
  contactMapCoords: 'Altınova Sinan Mah. Serik Cad. No:161 Kepez / Antalya',
  contactMapButtonText: 'Google Haritalar Yol Tarifi Al',
  contactMapUrl: 'https://maps.google.com',
  contactMapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3189.972322301292!2d30.760124315306917!3d36.91497997992451!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14c3905470766e4d%3A0x6b7dbb86377759b4!2sAlt%C4%B1nova%20Sinan%2C%20Serik%20Cd.%20No%3A161%2C%2007170%20Kepez%2FAntalya!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str',
  contactFormBadge: 'Bize Mesaj Gönderin',
  contactFormTitle: 'Sorularınız veya Talepleriniz İçin Formu Doldurun',
  contactFormSubtitle: 'Müşteri temsilcilerimiz en kısa sürede size telefon veya e-posta yoluyla dönüş yapacaktır.',
  contactFormButtonText: 'Mesajı Gönder',

  // Service Page Defaults
  servicePageBadge: 'MKBL Yetkili Servis & Bakım',
  servicePageTitle: 'Elektrikli Aracınız İçin Uzman Bakım Hizmeti',
  servicePageSubtitle: 'Karea Fit aracınızın batarya sağlığı, fren sistemleri ve yazılım güncellemeleri yetkili uzmanlarımızca yapılır.',
  serviceFormBadge: 'Servis Randevu Formu',
  serviceFormTitle: 'Online Servis Randevusu Oluşturun',
  serviceFormSubtitle: 'Uygun gün ve saati seçerek randevunuzu saniyeler içinde planlayın.',
  serviceFormButtonText: 'Servis Randevusunu Onayla',

  // Test Drive Form Defaults
  testDriveFormBadge: 'Ücretsiz Test Sürüşü',
  testDriveFormTitle: 'Karea Fit’i Hemen Deneyimleyin',
  testDriveFormSubtitle: '%100 elektrikli şehir sürüş keyfini keşfetmek için test sürüşü formunu doldurun.',
  testDriveFormButtonText: 'Test Sürüşü Randevusu Al',

  privacyPolicyText: `MKBL Otomotiv Gizlilik Politikası

1. Veri Sorumlusu: MKBL Otomotiv A.Ş. olarak kişisel verilerinizin güvenliğine önem veriyoruz.
2. Toplanan Veriler: İletişim, test sürüşü ve servis randevusu formları aracılığıyla ad, soyad, telefon ve e-posta bilgileriniz işlenmektedir.
3. Veri Kullanım Amacı: Taleplerinizin yanıtlanması, randevu oluşturulması ve yetkili temsilcilerimiz tarafından bilgilendirme yapılması amacıyla kullanılır.
4. Üçüncü Taraflar: Verileriniz yasal zorunluluklar dışında üçüncü taraf kurum veya kuruluşlarla asla paylaşılmaz.`,

  termsOfUseText: `MKBL Otomotiv Kullanım Şartları

1. Genel Kullanım: Bu web sitesinde yer alan tüm içerikler, görseller ve teknik özellikler MKBL Otomotiv A.Ş.'ye aittir.
2. Test Sürüşü ve Randevu: Web sitemiz üzerinden iletilen test sürüşü ve servis randevu talepleri teyit sürecine tabidir.
3. Fiyat ve Teknik Bilgiler: Sitede sunulan fiyatlar ve araç teknik özellikleri bilgilendirme amaçlı olup değişiklik gösterebilir.`,

  kvkkText: `KVKK Aydınlatma Metni (6698 Sayılı Kanun)

6698 Sayılı Kişisel Verilerin Korunması Kanunu uyarınca, MKBL Otomotiv A.Ş. tarafından kişisel verilerinizin işlenme amaçları, aktarıldığı kişiler, toplama yöntemi ve hukuki sebebi hakkında bilgilendirilmektesiniz.

Kişisel Verileri İşleme Haklarınız:
- Verilerinizin işlenip işlenmediğini öğrenme,
- İşlenmişse buna ilişkin bilgi talep etme,
- Verilerin silinmesini veya düzeltilmesini isteme haklarına sahipsiniz.`,

  consentExplicitText: `BAŞARAN OTOMOTİV OTELCİLİK TURİZM İNŞ.SAN.VE TİC.A.Ş tarafından; özel ürünler, hizmetler ve teklifler oluşturulmasını, Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni'nde tarif edildiği gibi kişisel verilerimin satış, pazarlama, tanıtım, etkinlik, faaliyetlerinde kullanılmasını ve bu amaçlarla verilerimin yurt içi ve dışındaki iş ortaklarınızla paylaşılmasını kabul ediyorum.`,

  consentCommercialText: `BAŞARAN OTOMOTİV OTELCİLİK TURİZM İNŞAAT SANAYİ VE TİCARET ANONİM ŞİRKETİ tarafından gerçekleştirilecek aktivite, tanıtım, ürün, hizmet ve kampanyalarla ilgili reklam ve promosyonlardan haberdar olmak için Şirketimiz tarafından şahsınıza ticari elektronik ileti gönderilmesine onay vermeniz gerekmektedir.

İzin verdiğiniz takdirde; BAŞARAN OTOMOTİV OTELCİLİK TURİZM İNŞAAT SANAYİ VE TİCARET ANONİM ŞİRKETİ'nin size kampanya ve tanıtımlarla ilgili bilgi sunmasını ve satış, pazarlama ve benzer amaçlı her türlü iletişim mesajlarını göndermesini, paylaşmış olduğunuz kişisel verilerinizi işleyerek, size telefon, kısa mesaj ve elektronik posta ile ulaşılmasını ve elektronik iletilerin içeriğinin ve diğer kayıtların gerektiğinde ilgili Bakanlığa sunulmak üzere kayıt altına alınarak saklanmasını kabul etmeksiniz.

Bu bilgiler sadece iletilerinizin sağlıklı şekilde teslim edilmesi, telefon, sms ve/veya e-posta yoluyla bildirimlerimizin zamanında ulaştırılabilmesi amacıyla sözleşme ilişkisi içinde olduğumuz 3. kişilerle gerekli ölçüde paylaşılacaktır.

Dilediğiniz zaman, hiçbir gerekçe göstermeksizin bu kullanım şartları kapsamındaki elektronik iletileri almaktan vazgeçebilir, verdiğiniz onayı geri alabilirsiniz. Bu talebinizi Şirketimize çağrı veya iletide yer alan iletişim bilgilerini kullanarak veya Şirketimiz bilgilerindeki iletişim adreslerine ücretsiz olarak iletebilirsiniz.`,

  // Cookie Consent Defaults
  showCookieBanner: true,
  cookieBannerText: `Sitemizde kullanıcı deneyimini iyileştirmek, içerikleri kişiselleştirmek ve trafik analizlerini gerçekleştirmek amacıyla 6698 Sayılı KVKK ve GDPR standartlarına uygun çerezler (cookies) kullanmaktayız.`,
  cookiePolicyText: `MKBL Otomotiv Çerez (Cookie) Politikası ve KVKK Bilgilendirmesi:

1. Çerezlerin Kullanım Amacı: Web sitemizde gezintinizi kolaylaştırmak, oturum tercihlerinizi saklamak, web sitesi kullanım istatistiklerini analiz etmek ve size özel promosyonlar sunmak amacıyla çerezler kullanılmaktadır.

2. Çerez Türleri:
- Zorunlu Çerezler: Sitenin temel işlevlerinin ve güvenlik protokollerinin çalışması için gereklidir.
- Analitik Çerezler: Ziyaretçi trafiğini ve sayfa etkileşimlerini anonim olarak ölçümlememize yarar.
- Pazarlama Çerezleri: İlgi alanlarınıza yönelik reklam ve sosyal medya reklam etiketlerini yönetir.

3. Tercihlerin Yönetimi: Dilediğiniz zaman Çerez Ayarları panelinden tercihlerinizi güncelleyebilirsiniz.`,

  googleTagManagerId: '',
  googleAdsId: '',
  metaPixelId: '',
  customHeadScripts: '',
  customBodyScripts: '',

  // SMTP Email Settings Defaults
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpPass: '',
  smtpSender: 'bildirim@mkbloto.com',
  smtpEnableSsl: false,

  // Homepage Layout Defaults
  homeShowHero: true,
  homeOrderHero: 1,
  homeShowGallery: true,
  homeOrderGallery: 2,
  homeShowCalculator: true,
  homeOrderCalculator: 3,
  homeShowConfigurator: true,
  homeOrderConfigurator: 4,
  homeShowFeatures: true,
  homeOrderFeatures: 5,

  // Maintenance Mode Defaults
  isMaintenanceMode: false,
  maintenanceTitle: 'Sitemiz Bakımdadır',
  maintenanceSubtitle: 'Sizlere daha iyi hizmet verebilmek için sitemizde güncelleme ve bakım çalışmaları yapılmaktadır. En kısa sürede tekrar yayında olacağız.',
  maintenanceEstimatedTime: 'Tahmini Süre: 1-2 Saat',
};

let settingsStore: ISiteSettings = { ...DEFAULT_SITE_SETTINGS };

export const getSiteSettingsStore = () => settingsStore;
export const setSiteSettingsStore = (newSettings: Partial<ISiteSettings>) => {
  settingsStore = { ...settingsStore, ...newSettings };
  return settingsStore;
};
