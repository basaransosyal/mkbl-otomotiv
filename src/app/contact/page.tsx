'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  Building2,
  Navigation
} from 'lucide-react';
import { ISiteSettings, DEFAULT_SITE_SETTINGS } from '../../lib/settings';
import ConsentModal from '../../components/ConsentModal';
import { getAttributionData, pushDataLayerEvent } from '@/components/AttributionTracker';

export default function ContactPage() {
  const [settings, setSettings] = useState<ISiteSettings>(DEFAULT_SITE_SETTINGS);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Karea Fit Fiyat & Teklif');
  const [message, setMessage] = useState('');
  
  // Consent Checkboxes & Modals State
  const [consentExplicit, setConsentExplicit] = useState(false);
  const [consentCommercial, setConsentCommercial] = useState(false);
  const [activeConsentModal, setActiveConsentModal] = useState<'EXPLICIT' | 'COMMERCIAL' | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error('Contact page settings fetch error:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!consentExplicit || !consentCommercial) {
      setErrorMsg('Lütfen devam etmek için Açık Rıza Beyanı ve Ticari İleti onaylarını işaretleyin.');
      return;
    }

    setIsSubmitting(true);

    try {
      const attr = getAttributionData();
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          email,
          phone,
          subject,
          message,
          ...attr,
        }),
      });

      if (res.ok) {
        // Push GTM DataLayer Custom Event
        pushDataLayerEvent({
          event: 'form_submission_success',
          form_id: 'contact_form',
          landing_url: attr.landing_url || (typeof window !== 'undefined' ? window.location.href : ''),
          utm_source: attr.utm_source || 'direct',
          utm_campaign: attr.utm_campaign || 'none',
        });

        setIsSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      }
    } catch (err) {
      console.error('Contact submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to extract or generate live Google Maps embed iframe URL
  const getMapEmbedUrl = () => {
    if (settings.contactMapEmbedUrl && settings.contactMapEmbedUrl.trim()) {
      const raw = settings.contactMapEmbedUrl.trim();
      if (raw.includes('src=')) {
        const match = raw.match(/src=["']([^"']+)["']/);
        if (match && match[1]) return match[1];
      }
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        return raw;
      }
    }

    if (settings.contactMapCoords && settings.contactMapCoords.trim()) {
      const coords = settings.contactMapCoords.trim();
      return `https://maps.google.com/maps?q=${encodeURIComponent(coords)}&z=15&output=embed`;
    }

    const fallbackQuery = settings.address || 'Maslak Istanbul';
    return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&z=15&output=embed`;
  };

  const mapEmbedUrl = getMapEmbedUrl();

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          {settings.contactPageBadge || `${settings.siteName} Maslak Showroom`}
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit']">
          {settings.contactPageTitle || 'Bize Ulaşın & Showroomumuzu Ziyaret Edin'}
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          {settings.contactPageSubtitle || 'Karea Fit %100 elektrikli ideal şehir aracımızı bizzat test etmek, fiyat ve teslimat teklifi almak için Maslak showroomumuza davetlisiniz.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Address & Live Map Area */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-3xl p-8 border border-blue-500/20 space-y-6">
            <h2 className="text-2xl font-bold text-white font-['Outfit'] flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <span>{settings.contactInfoTitle || 'Showroom İletişim Bilgileri'}</span>
            </h2>

            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-[#0D1527] border border-blue-500/10">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Adres:</div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    {settings.address}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-[#0D1527] border border-blue-500/10">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Telefon:</div>
                  <div className="text-xs text-gray-400 font-mono">{settings.phone}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-[#0D1527] border border-blue-500/10">
                <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">E-Posta:</div>
                  <div className="text-xs text-gray-400">{settings.email}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-[#0D1527] border border-blue-500/10">
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Çalışma Saatleri:</div>
                  <div className="text-xs text-gray-400">
                    {settings.workingHours}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* REAL INTERACTIVE GOOGLE MAP EMBED */}
          <div className="glass-panel rounded-3xl p-4 border border-blue-500/20 space-y-3">
            <div className="relative aspect-[16/11] w-full rounded-2xl overflow-hidden bg-[#0A1122] border border-blue-500/30 group shadow-inner">
              <iframe
                title="MKBL Showroom Canlı Harita"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full rounded-2xl filter contrast-[1.05]"
              ></iframe>

              {/* Floating Location Tag Pill on Top Left of Map */}
              <div className="absolute top-3 left-3 bg-[#080D1A]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-500/30 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg pointer-events-none z-10">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{settings.contactMapName || 'MKBL Showroom Plaza'}</span>
              </div>
            </div>

            <a
              href={settings.contactMapUrl || 'https://maps.google.com/?q=Maslak+Istanbul'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-blue-600/30 to-sky-500/30 hover:from-blue-600/50 hover:to-sky-500/50 text-white text-xs font-semibold py-3 rounded-xl border border-blue-500/40 transition-all flex items-center justify-center space-x-2 shadow-md"
            >
              <Navigation className="w-4 h-4 text-blue-400" />
              <span>{settings.contactMapButtonText || "Google Maps'te Yol Tarifi Al"}</span>
            </a>
          </div>
        </div>

        {/* Right Contact Form */}
        <div className="lg:col-span-7">
          <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-blue-500/20 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                {settings.contactFormBadge || 'BİZE YAZIN'}
              </span>
              <h2 className="text-2xl font-bold text-white font-['Outfit'] mt-1">
                {settings.contactFormTitle || 'İletişim & Karea Fit Teklif Formu'}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {settings.contactFormSubtitle || 'Formu doldurarak merak ettiğiniz tüm soruları iletebilir, uzman ekibimizden detaylı yanıt alabilirsiniz.'}
              </p>
            </div>

            {isSuccess ? (
              <div className="p-8 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-blue-400 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-white font-['Outfit']">
                  Mesajınız Alındı!
                </h3>
                <p className="text-xs text-gray-300 max-w-sm mx-auto">
                  Talebiniz maslak showroom müşteri temsilcilerimize iletildi. En kısa sürede sizinle iletişime geçilecektir.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="mt-2 text-xs font-semibold text-blue-400 hover:underline"
                >
                  Yeni bir mesaj gönder
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Adınız Soyadınız *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ahmet Yılmaz"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Telefon Numaranız *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+90 5XX XXX XX XX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">E-Posta Adresiniz *</label>
                    <input
                      type="email"
                      required
                      placeholder="ahmet@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Konu</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="MKBL Karea Fit Fiyat & Teklif">MKBL Karea Fit Fiyat & Teklif</option>
                      <option value="Test Sürüşü Bilgisi">Test Sürüşü Bilgisi</option>
                      <option value="Servis & Bakım Danışmanlığı">Servis & Bakım Danışmanlığı</option>
                      <option value="Diğer Sorular">Diğer Sorular</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Mesajınız / Notunuz *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Merak ettiğiniz konuları, randevu saatinizi veya sorularınızı yazabilirsiniz..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  ></textarea>
                </div>

                {/* CONSENT CHECKBOXES */}
                <div className="pt-3 border-t border-white/10 space-y-2.5 text-xs text-gray-300">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="consent-explicit-cnt"
                      checked={consentExplicit}
                      onChange={(e) => setConsentExplicit(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-[#0D1527] text-blue-500 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="consent-explicit-cnt" className="cursor-pointer select-none">
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
                      id="consent-commercial-cnt"
                      checked={consentCommercial}
                      onChange={(e) => setConsentCommercial(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-[#0D1527] text-blue-500 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="consent-commercial-cnt" className="cursor-pointer select-none">
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
                  className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 text-white font-bold text-sm py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Gönderiliyor...' : (settings.contactFormButtonText || 'Mesaj Gönder')}</span>
                </button>
              </form>
            )}
          </div>
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
