'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Car, User, Phone, Mail, CheckCircle } from 'lucide-react';
import ConsentModal from './ConsentModal';
import { DEFAULT_SITE_SETTINGS } from '@/lib/settings';
import { getAttributionData, pushDataLayerEvent } from './AttributionTracker';

interface TestDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedVehicleId?: string;
  preselectedVehicleName?: string;
}

export default function TestDriveModal({
  isOpen,
  onClose,
  preselectedVehicleId,
  preselectedVehicleName,
}: TestDriveModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleName, setVehicleName] = useState(preselectedVehicleName || 'Karea Fit');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('14:00');
  const [notes, setNotes] = useState('');
  
  // Consent Checkboxes
  const [consentExplicit, setConsentExplicit] = useState(false);
  const [consentCommercial, setConsentCommercial] = useState(false);

  // Consent Popup Modals
  const [activeConsentModal, setActiveConsentModal] = useState<'EXPLICIT' | 'COMMERCIAL' | null>(null);

  // Dynamic Settings from Settings API with Default Fallbacks
  const [explicitText, setExplicitText] = useState(DEFAULT_SITE_SETTINGS.consentExplicitText);
  const [commercialText, setCommercialText] = useState(DEFAULT_SITE_SETTINGS.consentCommercialText);
  const [formBadge, setFormBadge] = useState('MKBL VIP Deneyim');
  const [formTitle, setFormTitle] = useState('Karea Fit Test Sürüşü Randevusu');
  const [formSubtitle, setFormSubtitle] = useState('Elektrikli ideal şehir aracı Karea Fit\'i Kepez Showroom\'da bizzat deneyimleyin.');
  const [buttonText, setButtonText] = useState('Test Sürüşü Randevusunu Onayla');

  // Dynamic Vehicles List from CMS API
  const [availableVehicles, setAvailableVehicles] = useState<any[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Date picker min (Tomorrow) & max (2 weeks from today)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  const maxDateObj = new Date(today);
  maxDateObj.setDate(maxDateObj.getDate() + 14);
  const maxDateStr = maxDateObj.toISOString().split('T')[0];

  useEffect(() => {
    // Fetch Settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (data.consentExplicitText) setExplicitText(data.consentExplicitText);
          if (data.consentCommercialText) setCommercialText(data.consentCommercialText);
          if (data.testDriveFormBadge) setFormBadge(data.testDriveFormBadge);
          if (data.testDriveFormTitle) setFormTitle(data.testDriveFormTitle);
          if (data.testDriveFormSubtitle) setFormSubtitle(data.testDriveFormSubtitle);
          if (data.testDriveFormButtonText) setButtonText(data.testDriveFormButtonText);
        }
      })
      .catch((err) => console.error('Fetch consent settings error:', err));

    // Fetch Vehicles for dropdown (Only Published & STOKTA)
    fetch('/api/vehicles')
      .then((res) => res.json())
      .then((vehicles) => {
        if (Array.isArray(vehicles)) {
          const publishedInStock = vehicles.filter(
            (v: any) => v.isPublished !== false && v.stockStatus === 'STOKTA'
          );
          setAvailableVehicles(publishedInStock);
          if (publishedInStock.length > 0 && !preselectedVehicleName) {
            setVehicleName(publishedInStock[0].name);
          }
        }
      })
      .catch((err) => console.error('Fetch vehicles error:', err));
  }, [preselectedVehicleName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!preferredDate) {
      setErrorMsg('Lütfen geçerli bir randevu tarihi seçin.');
      return;
    }

    if (!consentExplicit || !consentCommercial) {
      setErrorMsg('Lütfen devam etmek için Açık Rıza ve Ticari İleti onaylarını işaretleyin.');
      return;
    }

    setIsSubmitting(true);

    try {
      const attr = getAttributionData();
      const res = await fetch('/api/test-drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          city: 'Antalya (Kepez Showroom)',
          vehicleId: preselectedVehicleId || 'karea-fit',
          vehicleName,
          preferredDate,
          preferredTime,
          notes,
          ...attr,
        }),
      });

      if (res.ok) {
        // Push GTM DataLayer Custom Event
        pushDataLayerEvent({
          event: 'form_submission_success',
          form_id: 'test_drive_form',
          landing_url: attr.landing_url || (typeof window !== 'undefined' ? window.location.href : ''),
          utm_source: attr.utm_source || 'direct',
          utm_campaign: attr.utm_campaign || 'none',
        });

        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
          setFullName('');
          setPhone('');
          setEmail('');
          setPreferredDate('');
          setNotes('');
          setConsentExplicit(false);
          setConsentCommercial(false);
        }, 2200);
      }
    } catch (error) {
      console.error('Test drive submit error:', error);
      setErrorMsg('Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] p-3 sm:p-6 overflow-y-auto flex justify-center items-start sm:items-center pt-20 sm:pt-8 pb-12 bg-black/80 backdrop-blur-md transition-opacity">
        <div className="relative w-full max-w-lg glass-panel rounded-3xl p-5 sm:p-8 border border-blue-500/30 shadow-2xl shadow-blue-950/50 overflow-hidden my-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mx-auto border border-blue-500/40">
                <CheckCircle className="w-10 h-10 animate-bounce text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white font-['Outfit']">Randevu Talebiniz Alındı!</h3>
              <p className="text-gray-300 text-sm max-w-xs mx-auto">
                MKBL Otomotiv müşteri temsilcimiz Karea Fit test sürüşü randevu teyidi için sizinle iletişime geçecektir.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-6 text-center">
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  {formBadge}
                </span>
                <h2 className="text-2xl font-bold text-white mt-1 font-['Outfit']">
                  {formTitle}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {formSubtitle}
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Vehicle Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Araç Modeli</label>
                  <div className="relative">
                    <Car className="absolute left-3 top-3 w-4 h-4 text-blue-400" />
                    <select
                      value={vehicleName}
                      onChange={(e) => setVehicleName(e.target.value)}
                      className="w-full bg-[#10172A] border border-blue-500/20 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      {availableVehicles.length > 0 ? (
                        availableVehicles.map((v) => (
                          <option key={v.id} value={v.name}>
                            {v.name} ({v.tagline || '%100 Elektrikli Şehir Aracı'})
                          </option>
                        ))
                      ) : (
                        <option value="Karea Fit">Karea Fit (%100 Elektrikli Şehir Aracı)</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Ad Soyad</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        placeholder="Adınız ve Soyadınız"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-[#10172A] border border-blue-500/20 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Telefon</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        required
                        placeholder="0532 000 0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#10172A] border border-blue-500/20 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Email (Full Width - Location Removed) */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">E-Posta</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="ornek@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#10172A] border border-blue-500/20 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Date & Time with Min (Tomorrow) & Max (14 Days) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Tercih Edilen Tarih</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        required
                        min={minDateStr}
                        max={maxDateStr}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full bg-[#10172A] border border-blue-500/20 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      En erken yarın, en fazla 2 hafta sonrası seçilebilir.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Saat</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <select
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full bg-[#10172A] border border-blue-500/20 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="10:00">10:00 - Sabah</option>
                        <option value="11:30">11:30 - Öğleden Önce</option>
                        <option value="14:00">14:00 - Öğleden Sonra</option>
                        <option value="16:00">16:00 - İkindi</option>
                        <option value="17:30">17:30 - Akşamüstü</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* CONSENT CHECKBOXES */}
                <div className="pt-3 border-t border-white/10 space-y-2.5 text-xs text-gray-300">
                  {/* Checkbox 1: Açık Rıza Beyanı */}
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="consent-explicit-td"
                      checked={consentExplicit}
                      onChange={(e) => setConsentExplicit(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-[#10172A] text-blue-500 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="consent-explicit-td" className="cursor-pointer select-none">
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

                  {/* Checkbox 2: Ticari İleti Gönderimi */}
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="consent-commercial-td"
                      checked={consentCommercial}
                      onChange={(e) => setConsentCommercial(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-[#10172A] text-blue-500 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="consent-commercial-td" className="cursor-pointer select-none">
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

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-3 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Gönderiliyor...</span>
                  ) : (
                    <span>{buttonText}</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* CONSENT POPUP MODALS */}
      <ConsentModal
        isOpen={activeConsentModal === 'EXPLICIT'}
        onClose={() => setActiveConsentModal(null)}
        onAccept={() => setConsentExplicit(true)}
        title="Kişisel Verilerin İşlenmesine Yönelik Açık Rıza Beyanı"
        content={explicitText || DEFAULT_SITE_SETTINGS.consentExplicitText}
      />

      <ConsentModal
        isOpen={activeConsentModal === 'COMMERCIAL'}
        onClose={() => setActiveConsentModal(null)}
        onAccept={() => setConsentCommercial(true)}
        title="Ticari Elektronik İleti İzni Onayı"
        content={commercialText || DEFAULT_SITE_SETTINGS.consentCommercialText}
      />
    </>
  );
}
