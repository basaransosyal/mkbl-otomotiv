'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  BatteryCharging,
  Zap,
  Calendar,
  Clock,
  Car,
  User,
  Phone,
  Mail,
  CheckCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ISiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/settings';
import ConsentModal from '@/components/ConsentModal';

export default function ServicePage() {
  const router = useRouter();
  const [settings, setSettings] = useState<ISiteSettings>(DEFAULT_SITE_SETTINGS);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('Karea Fit');
  const [serviceType, setServiceType] = useState('Batarya Check-up & LFP Testi');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('10:00');
  const [userNotes, setUserNotes] = useState('');
  
  // Consent Checkboxes & Modals State
  const [consentExplicit, setConsentExplicit] = useState(false);
  const [consentCommercial, setConsentCommercial] = useState(false);
  const [activeConsentModal, setActiveConsentModal] = useState<'EXPLICIT' | 'COMMERCIAL' | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [errorMsg, setErrorMsg] = useState('');
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error('Service page settings fetch error:', err));

    fetch('/api/vehicles')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const publishedInStock = data.filter(
            (v: any) => v.isPublished !== false && v.stockStatus === 'STOKTA'
          );
          setAvailableVehicles(publishedInStock);
        }
      })
      .catch((err) => console.error('Service page vehicles fetch error:', err));
  }, []);

  // Countdown Redirect Effect on Success
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess) {
      setCountdown(4);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSuccess, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!consentExplicit || !consentCommercial) {
      setErrorMsg('Lütfen devam etmek için Açık Rıza Beyanı ve Ticari İleti onaylarını işaretleyin.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          licensePlate,
          vehicleModel,
          serviceType,
          appointmentDate,
          appointmentTime,
          userNotes,
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
        setFullName('');
        setPhone('');
        setEmail('');
        setLicensePlate('');
        setUserNotes('');
      }
    } catch (err) {
      console.error('Service appointment error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (settings.showServiceModule === false) {
    return (
      <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 text-center space-y-8">
        <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-amber-500/30 bg-[#080D1A]/90 space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 shadow-xl">
            <Wrench className="w-10 h-10 animate-pulse" />
          </div>
          <div className="space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
              MKBL OTOMOTİV KEPEZ SHOWROOM & SATIŞ
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
              Servis & Bakım Hizmetlerimiz Yakında Başlayacaktır
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              MKBL Otomotiv olarak şu anda tüm kapasitemizle %100 Elektrikli Karea Fit araçlarımızın satış, VIP test sürüşü ve Kepez showroom hizmetlerine odaklanmış bulunmaktayız. Servis ve bakım departmanımız yakın zamanda hizmetinizde olacaktır.
            </p>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/models/karea-fit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-400 text-white font-bold text-xs shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              Karea Fit Aracını İncele
            </a>
            <a
              href="/contact"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-all"
            >
              Showroom & İletişim
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          {settings.servicePageBadge || 'MKBL OTOMOTİV YETKİLİ SERVİS'}
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit']">
          {settings.servicePageTitle || 'MKBL Karea Fit Servis & Bakım Hizmetleri'}
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          {settings.servicePageSubtitle || 'Karea Fit elektrikli mikro aracınız için uzman teknik ekibimiz, 9.98 kWh LFP batarya teşhis cihazlarımız ve 220V şarj güvenlik kontrollerimizle hizmetinizdeyiz.'}
        </p>
      </div>

      {/* 3 Main Services Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel rounded-3xl p-6 border border-blue-500/20 space-y-4 hover:border-blue-500/40 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
            <BatteryCharging className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white font-['Outfit']">
            {settings.footerServiceLink2 || 'LFP Batarya Health Check-up'}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            9.98 kWh LFP batarya hücre voltaj dengesi, BMS yazılım güncellemeleri ve maksimum menzil performans testi dijital cihazlarla gerçekleştirilir.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-blue-500/20 space-y-4 hover:border-blue-500/40 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white font-['Outfit']">
            {settings.footerServiceLink1 || 'Elektrikli Periyodik Bakım'}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Fren hidroliği, balata kontrolü, bağımsız süspansiyon sistemleri ve 220V şarj muhafaza tesisatının periyodik güvenlik kontrolleri yapılır.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-blue-500/20 space-y-4 hover:border-blue-500/40 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white font-['Outfit']">
            {settings.footerServiceLink3 || '220V Şarj Güvenlik Kontrolü'}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Evinizdeki 220V priz hattının 3.3 kW/s akım güvenliği kontrolü ve aracınızın klimasının uzaktan eşleştirmeleri gerçekleştirilir.
          </p>
        </div>
      </div>

      {/* Online Service Appointment Booking Form */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-blue-500/30 relative overflow-hidden">
        <div className="max-w-3xl mx-auto">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              {settings.serviceFormBadge || 'RANDEVU ALIN'}
            </span>
            <h2 className="text-3xl font-bold text-white font-['Outfit']">
              {settings.serviceFormTitle || 'Online Servis Randevu Formu'}
            </h2>
            <p className="text-sm text-gray-400">
              {settings.serviceFormSubtitle || 'Uygun olduğunuz gün ve saati seçerek Maslak servis merkezimizden randevunuzu kolayca oluşturun.'}
            </p>
          </div>

          {isSuccess ? (
            <div className="py-12 text-center space-y-6 bg-blue-600/10 border border-blue-500/30 rounded-3xl p-8 shadow-2xl animate-in fade-in duration-300">
              <div className="w-20 h-20 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mx-auto border border-blue-500/40 shadow-inner">
                <CheckCircle className="w-12 h-12 animate-bounce text-blue-400" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Teşekkür Ederiz</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                  Servis Randevunuz Başarıyla Oluşturuldu!
                </h3>
                <p className="text-gray-300 text-sm max-w-md mx-auto leading-relaxed">
                  Servis danışmanımız verilen iletişim bilgilerinden sizinle irtibata geçerek randevu saatini teyit edecektir.
                </p>
              </div>

              {/* Countdown and Redirection Bar */}
              <div className="pt-4 border-t border-white/10 max-w-xs mx-auto space-y-2">
                <p className="text-xs text-blue-300 font-medium">
                  <span className="font-bold text-white bg-blue-600/40 px-2.5 py-0.5 rounded-md border border-blue-500/30 mr-1.5">{countdown}</span>
                  saniye sonra Ana Sayfaya yönlendiriliyorsunuz...
                </p>
                <div className="w-full h-1.5 bg-blue-950 rounded-full overflow-hidden border border-blue-500/20">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-1000 ease-linear"
                    style={{ width: `${(countdown / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Ad Soyad
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ahmet Yılmaz"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Telefon Numarası
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+90 5XX XXX XX XX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email & License Plate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    E-Posta Adresi
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="ahmet@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Araç Plakası
                  </label>
                  <div className="relative">
                    <Car className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="34 KRA 2026"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 uppercase font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Model & Service Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Araç Modeli
                  </label>
                  <select
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {availableVehicles.length > 0 ? (
                      availableVehicles.map((v) => (
                        <option key={v.id} value={v.name}>
                          {v.name} ({v.tagline || '%100 Elektrikli'})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Karea Fit">Karea Fit (%100 Elektrikli)</option>
                        <option value="Karea City">Karea City</option>
                        <option value="Karea Cargo">Karea Cargo</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Talep Edilen Servis İşlemi
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Batarya Check-up & LFP Testi">Batarya Check-up & LFP Testi</option>
                    <option value="Periyodik Yıllık Bakım">Periyodik Yıllık Bakım</option>
                    <option value="220V Şarj Tesisatı Kontrolü">220V Şarj Tesisatı Kontrolü</option>
                    <option value="Klima & PTC Isıtıcı Kontrolü">Klima & PTC Isıtıcı Kontrolü</option>
                    <option value="Fren & Bağımsız Süspansiyon Kontrolü">Fren & Bağımsız Süspansiyon Kontrolü</option>
                  </select>
                </div>
              </div>

              {/* Preferred Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Randevu Tarihi
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      required
                      min={(() => {
                        const t = new Date();
                        t.setDate(t.getDate() + 1);
                        return t.toISOString().split('T')[0];
                      })()}
                      max={(() => {
                        const t = new Date();
                        t.setDate(t.getDate() + 14);
                        return t.toISOString().split('T')[0];
                      })()}
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    En erken yarın, en fazla 2 hafta sonrası seçilebilir.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Tercih Edilen Saat
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="09:30">09:30 - Sabah</option>
                      <option value="11:00">11:00 - Öğleden Önce</option>
                      <option value="14:00">14:00 - Öğleden Sonra</option>
                      <option value="16:00">16:00 - İkindi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* User Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Notlar / Açıklama (İsteğe Bağlı)
                </label>
                <textarea
                  rows={3}
                  placeholder="Aracınızdaki özel istek, ses veya servis beklentinizi belirtebilirsiniz..."
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* CONSENT CHECKBOXES */}
              <div className="pt-3 border-t border-white/10 space-y-2.5 text-xs text-gray-300">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="consent-explicit-srv"
                    checked={consentExplicit}
                    onChange={(e) => setConsentExplicit(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-[#0D1527] text-blue-500 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="consent-explicit-srv" className="cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => setActiveConsentModal('EXPLICIT')}
                      className="text-blue-400 hover:underline font-medium text-left"
                    >
                      Kişisel Verilerin İşlenmesine Yönelik Açık Rıza Beyanı
                    </button>
                    <span className="text-gray-400 ml-1 font-normal">'nı okudum ve kabul ediyorum.</span>
                  </label>
                </div>

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="consent-commercial-srv"
                    checked={consentCommercial}
                    onChange={(e) => setConsentCommercial(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-[#0D1527] text-blue-500 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="consent-commercial-srv" className="cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => setActiveConsentModal('COMMERCIAL')}
                      className="text-blue-400 hover:underline font-medium text-left"
                    >
                      Elektronik Ticari İleti Gönderimine İlişkin Onay
                    </button>
                    <span className="text-gray-400 ml-1 font-normal">'nı okudum ve kabul ediyorum.</span>
                  </label>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Randevu Oluşturuluyor...</span>
                ) : (
                  <span>{settings.serviceFormButtonText || 'Servis Randevusu Onayla'}</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* CONSENT POPUP MODALS */}
      <ConsentModal
        isOpen={activeConsentModal === 'EXPLICIT'}
        onClose={() => setActiveConsentModal(null)}
        onAccept={() => setConsentExplicit(true)}
        title="Kişisel Verilerin İşlenmesine Yönelik Açık Rıza Beyanı"
        content={settings.consentExplicitText || DEFAULT_SITE_SETTINGS.consentExplicitText}
      />

      <ConsentModal
        isOpen={activeConsentModal === 'COMMERCIAL'}
        onClose={() => setActiveConsentModal(null)}
        onAccept={() => setConsentCommercial(true)}
        title="Ticari Elektronik İleti İzni Onayı"
        content={settings.consentCommercialText || DEFAULT_SITE_SETTINGS.consentCommercialText}
      />
    </div>
  );
}
