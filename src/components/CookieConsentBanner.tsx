'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Cookie,
  ShieldCheck,
  Check,
  X,
  Settings2,
  Sliders,
  ChevronUp,
  Info,
  Lock,
  FileCheck
} from 'lucide-react';
import { ISiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/settings';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

const loadSavedPreferences = (): CookiePreferences => {
  try {
    const savedConsent = localStorage.getItem('mkbl_cookie_consent');
    if (savedConsent) {
      const parsed = JSON.parse(savedConsent);
      if (parsed?.preferences) {
        return {
          ...DEFAULT_PREFERENCES,
          ...parsed.preferences,
          necessary: true,
        };
      }
    }
  } catch (e) {
    // Ignore storage/parse errors and fall back to defaults
  }
  return DEFAULT_PREFERENCES;
};

export default function CookieConsentBanner() {
  const [settings, setSettings] = useState<ISiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isSlideIn, setIsSlideIn] = useState<boolean>(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState<boolean>(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.log('Cookie settings fetch error:', err));
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    try {
      const savedConsent = localStorage.getItem('mkbl_cookie_consent');
      if (!savedConsent) {
        setIsVisible(true);
        // Wait exactly 5 seconds (5000ms) after page load before sliding up smoothly
        timer = setTimeout(() => {
          setIsSlideIn(true);
        }, 5000);
      } else {
        setPreferences(loadSavedPreferences());
        setIsVisible(false);
        setIsSlideIn(false);
      }
    } catch (e) {
      setIsVisible(true);
      timer = setTimeout(() => {
        setIsSlideIn(true);
      }, 5000);
    }

    // Event listener for opening cookie settings from Footer or anywhere
    const handleOpenSettings = () => {
      setPreferences(loadSavedPreferences());
      setIsVisible(true);
      setIsSlideIn(true);
      setIsPreferencesModalOpen(true);
    };

    window.addEventListener('openCookieSettings', handleOpenSettings);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('openCookieSettings', handleOpenSettings);
    };
  }, []);

  const saveConsent = (updatedPreferences: CookiePreferences) => {
    setPreferences(updatedPreferences);
    try {
      localStorage.setItem(
        'mkbl_cookie_consent',
        JSON.stringify({
          timestamp: new Date().toISOString(),
          preferences: updatedPreferences,
        })
      );
    } catch (e) {
      console.warn('LocalStorage cookie error:', e);
    }
    setIsSlideIn(false);
    setTimeout(() => {
      setIsVisible(false);
      setIsPreferencesModalOpen(false);
    }, 500);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    saveConsent(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    saveConsent(onlyNecessary);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  if (!isVisible || settings.showCookieBanner === false) {
    return null;
  }

  return (
    <>
      {/* SLIDE-UP BOTTOM COOKIE BANNER (5 SECONDS DELAYED ANIMATION) */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 transition-all duration-1000 ease-out transform ${
          isSlideIn ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto glass-panel p-5 sm:p-6 rounded-3xl border border-blue-500/40 bg-[#080D1A]/95 backdrop-blur-xl shadow-2xl shadow-blue-950/90 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* LEFT SIDE: Cookie Description & Policy Text */}
          <div className="flex items-start space-x-4 w-full lg:w-2/3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0 mt-0.5">
              <Cookie className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>

            <div className="space-y-1 text-left">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Çerez (Cookie) Kullanımı ve KVKK Aydınlatması
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  6698 KVKK UYUMLU
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {settings.cookieBannerText ||
                  'Sitemizde kullanıcı deneyimini iyileştirmek, içerikleri kişiselleştirmek ve trafik analizlerini gerçekleştirmek amacıyla 6698 Sayılı KVKK ve GDPR standartlarına uygun çerezler kullanılmaktadır.'}
              </p>

              <button
                onClick={() => setIsPolicyModalOpen(true)}
                className="text-[11px] font-bold text-blue-400 hover:text-sky-300 underline inline-flex items-center space-x-1 pt-1 transition-colors"
              >
                <span>Çerez Politikası ve Metnini Detaylı İncele</span>
                <Info className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: 3 Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 w-full lg:w-auto shrink-0">
            {/* Reject All Button */}
            <button
              onClick={handleRejectAll}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all"
            >
              Tümünü Reddet
            </button>

            {/* Cookie Settings Button */}
            <button
              onClick={() => {
                setPreferences(loadSavedPreferences());
                setIsPreferencesModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-blue-500/30 text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Çerez Ayarları</span>
            </button>

            {/* Accept All Button */}
            <button
              onClick={handleAcceptAll}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 hover:shadow-lg hover:shadow-blue-500/30 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Tümünü Kabul Et</span>
            </button>
          </div>
        </div>
      </div>

      {/* DETAILED COOKIE PREFERENCES MODAL */}
      {isPreferencesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-blue-500/40 bg-[#080D1A] space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-['Outfit']">Çerez Tercihleri Yönetimi</h2>
                  <p className="text-[11px] text-gray-400">Gizlilik tercihlerinize göre çerez kategorilerini düzenleyin.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPreferences(loadSavedPreferences());
                  setIsPreferencesModalOpen(false);
                }}
                className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs max-h-[60vh] overflow-y-auto pr-1">
              {/* Category 1: Strictly Necessary */}
              <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-xs">Zorunlu Çerezler (Strictly Necessary)</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30 flex items-center space-x-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Zorunlu</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Sitenin güvenli çalışması, form iletileri ve temel fonksiyonlar için kilit olan zorunlu çerezlerdir. Devre dışı bırakılamaz.
                  </p>
                </div>
                <div className="shrink-0">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-5 h-5 accent-blue-500 rounded cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Category 2: Performance & Analytics */}
              <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-white text-xs block">Performans ve Analiz Çerezleri</span>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Google Analytics / Tag Manager ile sayfa ziyaret sayılarını ve trafikteki etkileşimleri anonim ölçümlememize yarar.
                  </p>
                </div>
                <div className="shrink-0">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="w-5 h-5 accent-blue-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Category 3: Marketing & Targetings */}
              <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-white text-xs block">Pazarlama ve Hedefleme Çerezleri</span>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Meta Pixel ve Google Ads ile ilgi alanlarınıza özel kampanya, duyuru ve reklam etiketlerinin çalışmasını sağlar.
                  </p>
                </div>
                <div className="shrink-0">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="w-5 h-5 accent-blue-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Category 4: Functionality & Preferences */}
              <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-white text-xs block">İşlevsellik ve Tercih Çerezleri</span>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Dil seçeneği, seçili araç vitrini ve kişiselleştirilmiş site görünüm ayarlarınızı hatırlamak amacıyla kullanılır.
                  </p>
                </div>
                <div className="shrink-0">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                    className="w-5 h-5 accent-blue-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRejectAll}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold"
              >
                Sadece Zorunluları Kabul Et
              </button>

              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-400 text-white text-xs font-bold shadow-lg shadow-blue-500/30 flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Seçimleri Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL LEGAL COOKIE POLICY MODAL */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-blue-500/40 bg-[#080D1A] space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-['Outfit']">Çerez (Cookie) Politikası Metni</h2>
                  <p className="text-[11px] text-gray-400">6698 Sayılı KVKK Uyarınca Yasal Bilgilendirme</p>
                </div>
              </div>
              <button
                onClick={() => setIsPolicyModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 text-xs text-gray-300 leading-relaxed whitespace-pre-wrap max-h-[55vh] overflow-y-auto font-sans">
              {settings.cookiePolicyText || settings.kvkkText}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-end">
              <button
                onClick={() => setIsPolicyModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
