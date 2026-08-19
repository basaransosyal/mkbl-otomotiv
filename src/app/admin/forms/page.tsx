'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  FileCheck,
  Save,
  Check,
  CheckCircle,
  Calendar,
  ShieldCheck,
  MessageSquare,
  FileText,
  Info
} from 'lucide-react';
import { ISiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/settings';

export default function AdminFormsSettingsPage() {
  const [formData, setFormData] = useState<ISiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setFormData((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error('Fetch settings error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (field: keyof ISiteSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updated = await res.json();
        setFormData(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Save forms settings error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-400 pt-32">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <span>Form ayarları yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 pt-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-500/20 pb-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-blue-600/30 text-gray-300 hover:text-white border border-blue-500/30 transition-all text-xs font-semibold shadow-md mb-3"
          >
            <ChevronLeft className="w-4 h-4 text-blue-400" />
            <span>Ana Kontrol Paneline Dön</span>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white font-['Outfit']">
                Form Ayarları & Rıza Metinleri Yönetimi
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">
                Sitedeki tüm formların pop-up rıza metinlerini, tarih kurallarını ve form başlıklarını buradan yönetebilirsiniz.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2 text-xs disabled:opacity-50"
        >
          {isSaving ? (
            <span>Kaydediliyor...</span>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Ayarlar Kaydedildi!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Form Ayarlarını Kaydet</span>
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl text-xs font-bold animate-in fade-in duration-200 shadow-md">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Form ve rıza onay metinleri başarıyla kaydedildi! Sitedeki tüm formlarda canlıya alındı.</span>
        </div>
      )}

      {/* FORM RULES INFORMATION BOX */}
      <div className="glass-panel rounded-3xl p-6 border border-blue-500/20 space-y-3 bg-gradient-to-r from-blue-950/30 to-purple-950/20">
        <div className="flex items-center space-x-2 text-blue-400 font-bold text-sm font-['Outfit']">
          <Calendar className="w-5 h-5" />
          <span>Aktif Form Kuralları & Tarih Kısıtlamaları</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-1">
            <span className="text-gray-400 block text-[11px]">En Erken Randevu Tarihi:</span>
            <span className="font-bold text-emerald-400">Yarın (Geçmiş & Aynı Gün Engelli)</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-1">
            <span className="text-gray-400 block text-[11px]">En İleri Randevu Tarihi:</span>
            <span className="font-bold text-amber-400">2 Hafta (14 Gün İlerisi Maksimum)</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-1">
            <span className="text-gray-400 block text-[11px]">Lokasyon Alanı:</span>
            <span className="font-bold text-sky-400">Kaldırıldı (Sabit Maslak Showroom)</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: POPUP CONSENT TEXTS */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/30 space-y-6 shadow-xl bg-gradient-to-b from-purple-950/20 to-transparent">
          <div className="border-b border-purple-500/20 pb-4">
            <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              <span>Form Pop-Up Onay & Rıza Metinleri</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Formların altında yer alan tik kutucuklarına tıklandığında açılan yasal pop-up pencerelerindeki metinleri buradan düzenleyebilirsiniz.
            </p>
          </div>

          <div className="space-y-6">
            {/* Consent Text 1: Açık Rıza Beyanı */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-purple-300">
                1. "Kişisel Verilerin İşlenmesine Yönelik Açık Rıza Beyanı" Pop-Up Metni
              </label>
              <textarea
                rows={6}
                value={formData.consentExplicitText}
                onChange={(e) => handleChange('consentExplicitText', e.target.value)}
                className="w-full bg-[#0D1527] border border-purple-500/30 rounded-2xl p-4 text-xs text-gray-200 leading-relaxed font-sans focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Consent Text 2: Ticari İleti Gönderimi */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-purple-300">
                2. "Elektronik Ticari İleti Gönderimine İlişkin Onay" Pop-Up Metni
              </label>
              <textarea
                rows={10}
                value={formData.consentCommercialText}
                onChange={(e) => handleChange('consentCommercialText', e.target.value)}
                className="w-full bg-[#0D1527] border border-purple-500/30 rounded-2xl p-4 text-xs text-gray-200 leading-relaxed font-sans focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: FORM TITLES & BUTTON TEXTS */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-blue-500/30 space-y-6 shadow-xl">
          <div className="border-b border-blue-500/20 pb-4">
            <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span>Form Başlıkları & Onay Buton Yazıları</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Test Sürüşü, Servis Randevusu ve İletişim formlarında görünen başlık ve buton yazılarını özelleştirin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Test Drive Form Settings */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#0D1527] border border-sky-500/30">
              <h3 className="font-bold text-sky-400 text-sm border-b border-white/5 pb-2 flex items-center justify-between">
                <span>Test Sürüşü Formu</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-normal">Pop-up & Modal</span>
              </h3>
              <div>
                <label className="block text-gray-300 mb-1">Form Rozet Etiketi</label>
                <input
                  type="text"
                  value={formData.testDriveFormBadge}
                  onChange={(e) => handleChange('testDriveFormBadge', e.target.value)}
                  className="w-full bg-[#10172A] border border-sky-500/20 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Form Ana Başlığı</label>
                <input
                  type="text"
                  value={formData.testDriveFormTitle}
                  onChange={(e) => handleChange('testDriveFormTitle', e.target.value)}
                  className="w-full bg-[#10172A] border border-sky-500/20 rounded-xl p-2.5 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Form Alt Açıklaması</label>
                <input
                  type="text"
                  value={formData.testDriveFormSubtitle}
                  onChange={(e) => handleChange('testDriveFormSubtitle', e.target.value)}
                  className="w-full bg-[#10172A] border border-sky-500/20 rounded-xl p-2.5 text-gray-300"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Gönder Butonu Yazısı</label>
                <input
                  type="text"
                  value={formData.testDriveFormButtonText}
                  onChange={(e) => handleChange('testDriveFormButtonText', e.target.value)}
                  className="w-full bg-[#10172A] border border-sky-500/20 rounded-xl p-2.5 text-sky-400 font-bold"
                />
              </div>
            </div>

            {/* Showroom Contact Form Settings */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20">
              <h3 className="font-bold text-blue-400 text-sm border-b border-white/5 pb-2 flex items-center justify-between">
                <span>İletişim Formu</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-normal">Showroom</span>
              </h3>
              <div>
                <label className="block text-gray-300 mb-1">Form Rozet Etiketi</label>
                <input
                  type="text"
                  value={formData.contactFormBadge}
                  onChange={(e) => handleChange('contactFormBadge', e.target.value)}
                  className="w-full bg-[#10172A] border border-blue-500/20 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Form Ana Başlığı</label>
                <input
                  type="text"
                  value={formData.contactFormTitle}
                  onChange={(e) => handleChange('contactFormTitle', e.target.value)}
                  className="w-full bg-[#10172A] border border-blue-500/20 rounded-xl p-2.5 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Gönder Butonu Yazısı</label>
                <input
                  type="text"
                  value={formData.contactFormButtonText}
                  onChange={(e) => handleChange('contactFormButtonText', e.target.value)}
                  className="w-full bg-[#10172A] border border-blue-500/20 rounded-xl p-2.5 text-blue-400 font-bold"
                />
              </div>
            </div>

            {/* Service Form Settings */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#0D1527] border border-emerald-500/20">
              <h3 className="font-bold text-emerald-400 text-sm border-b border-white/5 pb-2 flex items-center justify-between">
                <span>Servis Randevusu Formu</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal">Servis</span>
              </h3>
              <div>
                <label className="block text-gray-300 mb-1">Form Rozet Etiketi</label>
                <input
                  type="text"
                  value={formData.serviceFormBadge}
                  onChange={(e) => handleChange('serviceFormBadge', e.target.value)}
                  className="w-full bg-[#10172A] border border-emerald-500/20 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Form Ana Başlığı</label>
                <input
                  type="text"
                  value={formData.serviceFormTitle}
                  onChange={(e) => handleChange('serviceFormTitle', e.target.value)}
                  className="w-full bg-[#10172A] border border-emerald-500/20 rounded-xl p-2.5 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Gönder Butonu Yazısı</label>
                <input
                  type="text"
                  value={formData.serviceFormButtonText}
                  onChange={(e) => handleChange('serviceFormButtonText', e.target.value)}
                  className="w-full bg-[#10172A] border border-emerald-500/20 rounded-xl p-2.5 text-emerald-400 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SAVE BUTTON */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center space-x-2 text-sm disabled:opacity-50"
          >
            {isSaving ? (
              <span>Kaydediliyor...</span>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Tüm Form Ayarlarını Kaydet</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
