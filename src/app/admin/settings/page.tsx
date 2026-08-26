'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Settings,
  Save,
  CheckCircle,
  Layout,
  Globe,
  Code2,
  Sparkles,
  Share2,
  Check,
  FileCheck,
  ArrowLeft,
  FileText,
  Calculator,
  Zap,
  Fuel,
  MapPin,
  Building2,
  Navigation,
  Car,
  Users,
  Lock,
  GripVertical,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  MessageCircle,
  Wrench,
  Power,
  AlertTriangle
} from 'lucide-react';
import { ISiteSettings, DEFAULT_SITE_SETTINGS } from '../../../lib/settings';
import { getLoggedInAdminUser, LoggedInAdminUser } from '../../../lib/auth';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'homepage' | 'nav' | 'showroom' | 'service' | 'calculator' | 'whatsapp' | 'contact' | 'legal' | 'tracking' | 'maintenance'>('homepage');
  const [formData, setFormData] = useState<ISiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<LoggedInAdminUser | null>(null);
  const [apiStatus, setApiStatus] = useState<{
    collectApiFlow?: 'ACTIVE' | 'ERROR' | 'OFF';
    epiasFlow?: 'ACTIVE' | 'ERROR' | 'OFF';
    lastUpdated?: string;
    isTesting?: boolean;
  }>({});

  const testApiConnections = () => {
    setApiStatus((prev) => ({ ...prev, isTesting: true }));
    fetch('/api/fuel-rates?refresh=true')
      .then((res) => res.json())
      .then((data) => {
        setApiStatus({
          collectApiFlow: data.collectApiFlow || 'OFF',
          epiasFlow: data.epiasFlow || 'OFF',
          lastUpdated: data.lastUpdated,
          isTesting: false,
        });
      })
      .catch(() => setApiStatus({ collectApiFlow: 'ERROR', epiasFlow: 'ERROR', isTesting: false }));
  };

  useEffect(() => {
    setCurrentUser(getLoggedInAdminUser());
    fetch('/api/settings?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setFormData((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error('Fetch settings error:', err))
      .finally(() => setIsLoading(false));

    testApiConnections();
  }, []);

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const sectionDefinitions = [
    {
      id: 'hero',
      name: 'Hero Vitrin & Genel Bilgiler Bölümü',
      desc: 'Manşet başlıkları, 360 modeli incele ve test sürüşü butonları.',
      badge: null,
      showKey: 'homeShowHero' as keyof ISiteSettings,
      orderKey: 'homeOrderHero' as keyof ISiteSettings,
      defaultOrder: 1,
    },
    {
      id: 'gallery',
      name: '3D Dönen Galeri Kartları Bölümü',
      desc: 'Dönen 3D kart galerisi, görseller ve kart alt detayları.',
      badge: '3D GALERİ',
      showKey: 'homeShowGallery' as keyof ISiteSettings,
      orderKey: 'homeOrderGallery' as keyof ISiteSettings,
      defaultOrder: 2,
    },
    {
      id: 'calculator',
      name: 'Yakıt Tasarruf Hesaplayıcı Modülü',
      desc: 'Aylık mesafe ve benzin/elektrik kıyaslaması yapan tasarruf hesaplama aracı.',
      badge: null,
      showKey: 'homeShowCalculator' as keyof ISiteSettings,
      orderKey: 'homeOrderCalculator' as keyof ISiteSettings,
      defaultOrder: 3,
    },
    {
      id: 'configurator',
      name: 'Renk & Açı Konfigüratörü (360° Viewer)',
      desc: 'İnteraktif gövde renkleri ve ön/yan/arka açı değiştirici.',
      badge: 'TASARRUF ALTINA TAŞINDI',
      showKey: 'homeShowConfigurator' as keyof ISiteSettings,
      orderKey: 'homeOrderConfigurator' as keyof ISiteSettings,
      defaultOrder: 4,
    },
    {
      id: 'features',
      name: 'Şehir Ulaşımı Özellikler Grid Bölümü',
      desc: 'Çelik kafes şasi, 220V şarj ve rejeneratif fren kutuları.',
      badge: null,
      showKey: 'homeShowFeatures' as keyof ISiteSettings,
      orderKey: 'homeOrderFeatures' as keyof ISiteSettings,
      defaultOrder: 5,
    },
  ];

  const orderedSections = [...sectionDefinitions].sort(
    (a, b) =>
      Number(formData[a.orderKey] ?? a.defaultOrder) -
      Number(formData[b.orderKey] ?? b.defaultOrder)
  );

  const moveSection = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= orderedSections.length) return;
    const list = [...orderedSections];
    const [removed] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, removed);

    setFormData((prev) => {
      const updated = { ...prev };
      list.forEach((sec, idx) => {
        (updated as any)[sec.orderKey] = idx + 1;
      });
      return updated;
    });
    setSaveSuccess(false);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    moveSection(draggedIdx, index);
    setDraggedIdx(index);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const handleChange = (field: keyof ISiteSettings, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (typeof window !== 'undefined' && String(field).startsWith('whatsapp')) {
        window.dispatchEvent(new CustomEvent('liveWhatsAppPreview', { detail: { [field]: value } }));
      }
      return updated;
    });
    setSaveSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/settings?t=' + Date.now(), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        cache: 'no-store',
      });

      if (res.ok) {
        const updated = await res.json();
        setFormData(updated);
        setSaveSuccess(true);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('siteSettingsUpdated'));
        }
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Settings save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <span>Site ayarları yükleniyor...</span>
      </div>
    );
  }

  if (currentUser?.role === 'EDİTÖR') {
    return (
      <div className="pt-32 pb-20 max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white font-['Outfit']">Sayfa Erişim Yetkisi Sınırlı</h1>
          <p className="text-xs text-gray-300 leading-relaxed">
            Editör rolündeki kullanıcılar sadece <strong>Formlar ve Talepler</strong> sayfalarına erişebilir. Genel site ayarları üzerinde düzenleme ve silme yetkiniz bulunmamaktadır.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-400 text-white text-xs font-bold shadow-lg"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Ana Kontrol Paneline Dön</span>
        </Link>
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
            <span>Ana Kontrol Paneline Dön (Kutucuklu Görünüm)</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-white font-['Outfit']">
            Site Genel Ayarları & İçerik Yönetimi
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Header menülerinden footer linklerine, canlı haritadan randevu formlarına kadar tüm bilgileri buradan yönetebilirsiniz.
          </p>
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
              <span>Kaydedildi!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Tüm Değişiklikleri Kaydet</span>
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-xl text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Ayarlar Başarıyla Kaydedildi!</span>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-blue-500/20 no-scrollbar">
        <button
          onClick={() => setActiveTab('homepage')}
          className={`px-4 py-3 rounded-t-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'homepage'
              ? 'bg-[#0D1527] text-blue-400 border-t-2 border-x border-blue-500 border-b-transparent'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Ana Sayfa & Hero</span>
        </button>

        <button
          onClick={() => setActiveTab('nav')}
          className={`px-4 py-3 rounded-t-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'nav'
              ? 'bg-[#0D1527] text-blue-400 border-t-2 border-x border-blue-500 border-b-transparent'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Header Menü & Butonlar</span>
        </button>

        <button
          onClick={() => setActiveTab('showroom')}
          className={`px-4 py-3 rounded-t-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'showroom'
              ? 'bg-[#0D1527] text-blue-400 border-t-2 border-x border-blue-500 border-b-transparent'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Showroom & İletişim Sayfası</span>
        </button>

        <button
          onClick={() => setActiveTab('service')}
          className={`px-4 py-3 rounded-t-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'service'
              ? 'bg-[#0D1527] text-blue-400 border-t-2 border-x border-blue-500 border-b-transparent'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Servis & Bakım Sayfası</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-4 py-3 rounded-t-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'calculator'
              ? 'bg-[#0D1527] text-blue-400 border-t-2 border-x border-blue-500 border-b-transparent'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Tasarruf Hesaplayıcı</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-3 rounded-t-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'whatsapp'
              ? 'bg-[#0D1527] text-emerald-400 border-t-2 border-x border-emerald-500 border-b-transparent'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 font-bold">Canlı WhatsApp Widget</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-3 rounded-t-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'contact'
              ? 'bg-[#0D1527] text-blue-400 border-t-2 border-x border-blue-500 border-b-transparent'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Footer & İletişim Bilgileri</span>
        </button>

        <button
          onClick={() => setActiveTab('legal')}
          className={`px-4 py-3 rounded-t-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'legal'
              ? 'bg-[#0D1527] text-blue-400 border-t-2 border-x border-blue-500 border-b-transparent'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Gizlilik & KVKK</span>
        </button>

        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-4 py-3 rounded-t-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'tracking'
              ? 'bg-[#0D1527] text-blue-400 border-t-2 border-x border-blue-500 border-b-transparent'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Google & Meta Pixel</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-3 rounded-t-2xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'maintenance'
              ? 'bg-[#0D1527] text-amber-400 border-t-2 border-x border-amber-500 border-b-transparent'
              : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 font-bold">Site Yayın & Bakım Modu</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: HOMEPAGE & HERO */}
        {activeTab === 'homepage' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/20 space-y-6">
            <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span>Ana Sayfa Hero & Başlık Metinleri</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Slogan Rozet Etiketi (Hero Badge Text)
                </label>
                <input
                  type="text"
                  value={formData.heroBadge}
                  onChange={(e) => handleChange('heroBadge', e.target.value)}
                  placeholder="MKBL Otomotiv Güvencesiyle %100 Elektrikli"
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Ana Sayfa Manşet Başlığı (Hero Title)
                </label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => handleChange('heroTitle', e.target.value)}
                  placeholder="Bindiğin Gibi Değil. MKBL Karea Fit"
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white font-bold text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Ana Sayfa Alt Açıklama Metni (Hero Subtitle)
                </label>
                <textarea
                  rows={3}
                  value={formData.heroSubtitle}
                  onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                  placeholder="Var olan bir sınıftan değil, yeni bir sınıfın ilki..."
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    Ana Buton Metni (Call to Action Button)
                  </label>
                  <input
                    type="text"
                    value={formData.ctaButtonText}
                    onChange={(e) => handleChange('ctaButtonText', e.target.value)}
                    placeholder="Test Sürüşü Randevusu Al"
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    Ana Buton Yönlendirme Linki (URL / Sayfa Yolu)
                  </label>
                  <input
                    type="text"
                    value={formData.ctaButtonUrl || '/models/karea-fit'}
                    onChange={(e) => handleChange('ctaButtonUrl', e.target.value)}
                    placeholder="/models/karea-fit veya https://..."
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* HOMEPAGE SECTIONS DRAG & DROP REORDERING MODULE */}
              <div className="pt-6 border-t border-blue-500/20 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center space-x-2">
                    <Layout className="w-5 h-5 text-blue-400" />
                    <span>Ana Sayfa Bölüm Düzeni & Sürükle-Bırak Sıralama Kontrolü</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Ana sayfadaki bölümleri **sürükleyip bırakarak** veya **Yukarı / Aşağı** butonlarına tıklayarak sıralayabilir, istediğiniz bölümü **AÇIK / KAPALI** duruma getirebilirsiniz.
                  </p>
                </div>

                <div className="space-y-3">
                  {orderedSections.map((sec, idx) => {
                    const isVisible = formData[sec.showKey] !== false;
                    return (
                      <div
                        key={sec.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-grab active:cursor-grabbing select-none ${
                          draggedIdx === idx
                            ? 'bg-blue-600/30 border-blue-400 scale-[1.01] shadow-xl'
                            : isVisible
                            ? 'bg-[#0D1527] border-blue-500/30 hover:border-blue-400/60'
                            : 'bg-[#0A0F1D] border-gray-800 opacity-60'
                        }`}
                      >
                        {/* Drag Handle & Info */}
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white shrink-0" title="Sürükle & Bırak">
                            <GripVertical className="w-5 h-5 text-blue-400" />
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-[10px] font-mono font-bold">
                                Sıra #{idx + 1}
                              </span>
                              <span className="text-xs font-bold text-white">{sec.name}</span>
                              {sec.badge && (
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                                  {sec.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400">{sec.desc}</p>
                          </div>
                        </div>

                        {/* Move Up/Down & Toggle Buttons */}
                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          {/* Move Up */}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveSection(idx, idx - 1)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-blue-600/30 text-gray-300 hover:text-white border border-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Yukarı Taşı"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Move Down */}
                          <button
                            type="button"
                            disabled={idx === orderedSections.length - 1}
                            onClick={() => moveSection(idx, idx + 1)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-blue-600/30 text-gray-300 hover:text-white border border-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Aşağı Taşı"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Visibility Toggle */}
                          <button
                            type="button"
                            onClick={() => handleChange(sec.showKey, !isVisible)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              isVisible
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-red-500/20 text-red-400 border-red-500/40'
                            }`}
                          >
                            {isVisible ? 'AKTİF (YAYINDA)' : 'PASİF (GİZLİ)'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: HEADER NAV MENU & BUTTONS */}
        {activeTab === 'nav' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/20 space-y-6">
            <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-400" />
              <span>Header Menü Linkleri & Üst Buton Yazıları</span>
            </h2>
            <p className="text-xs text-gray-400">
              Web sitesinin en üst menüsünde görünen link isimlerini, görünürlük (Aktif/Pasif) durumlarını ve sağ üstteki teklif/randevu alma butonunun ayarlarını buradan özelleştirebilirsiniz.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* 1. Ana Sayfa */}
              <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-gray-300 font-semibold">1. Menü Metni (Ana Sayfa)</label>
                  <button
                    type="button"
                    onClick={() => handleChange('navHomeActive', formData.navHomeActive === false)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      formData.navHomeActive !== false
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-500/20 text-red-400 border-red-500/40'
                    }`}
                  >
                    {formData.navHomeActive !== false ? 'AKTİF (GÖRÜNÜR)' : 'PASİF (GİZLİ)'}
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.navHomeText || 'Ana Sayfa'}
                  onChange={(e) => handleChange('navHomeText', e.target.value)}
                  className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 2. Modeller */}
              <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-gray-300 font-semibold">2. Menü Metni (Modeller Dropdown)</label>
                  <button
                    type="button"
                    onClick={() => handleChange('navModelsActive', formData.navModelsActive === false)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      formData.navModelsActive !== false
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-500/20 text-red-400 border-red-500/40'
                    }`}
                  >
                    {formData.navModelsActive !== false ? 'AKTİF (GÖRÜNÜR)' : 'PASİF (GİZLİ)'}
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.navModelsText || 'Modeller'}
                  onChange={(e) => handleChange('navModelsText', e.target.value)}
                  className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 3. Servis & Bakım */}
              <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-gray-300 font-semibold">3. Menü Metni (Servis & Bakım)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = formData.navServiceActive === false;
                      handleChange('navServiceActive', nextVal);
                      if (nextVal) handleChange('showServiceModule', true);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      formData.navServiceActive !== false && formData.showServiceModule !== false
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {formData.navServiceActive !== false && formData.showServiceModule !== false
                      ? 'AKTİF (GÖRÜNÜR)'
                      : 'PASİF (GİZLİ - SADECE SATIŞ)'}
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.navServiceText || 'Servis & Bakım'}
                  onChange={(e) => handleChange('navServiceText', e.target.value)}
                  className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 4. Showroom & İletişim */}
              <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-gray-300 font-semibold">4. Menü Metni (Showroom & İletişim)</label>
                  <button
                    type="button"
                    onClick={() => handleChange('navContactActive', formData.navContactActive === false)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      formData.navContactActive !== false
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-500/20 text-red-400 border-red-500/40'
                    }`}
                  >
                    {formData.navContactActive !== false ? 'AKTİF (GÖRÜNÜR)' : 'PASİF (GİZLİ)'}
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.navContactText || 'Showroom & İletişim'}
                  onChange={(e) => handleChange('navContactText', e.target.value)}
                  className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Header Sağ Üst Buton Ayarları
                </h3>
                <button
                  type="button"
                  onClick={() => handleChange('navCtaButtonActive', formData.navCtaButtonActive === false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                    formData.navCtaButtonActive !== false
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-500/20 text-red-400 border-red-500/40'
                  }`}
                >
                  {formData.navCtaButtonActive !== false ? 'BUTON AKTİF (GÖRÜNÜR)' : 'BUTON PASİF (GİZLİ)'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Header Sağ Üst Buton Yazısı</label>
                  <input
                    type="text"
                    value={formData.navCtaButtonText || 'Teklif & Sürüş Randevusu Al'}
                    onChange={(e) => handleChange('navCtaButtonText', e.target.value)}
                    className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Header Sağ Üst Buton Yönlendirme Linki (URL)</label>
                  <input
                    type="text"
                    value={formData.navCtaButtonUrl || '/models/karea-fit'}
                    onChange={(e) => handleChange('navCtaButtonUrl', e.target.value)}
                    placeholder="/models/karea-fit veya https://..."
                    className="w-full bg-black/40 border border-blue-500/20 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SERVICE PAGE CMS */}
        {activeTab === 'service' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/20 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-blue-500/20 pb-4">
              <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <span>Servis & Bakım Modülü ve Sayfa Yönetimi</span>
              </h2>
            </div>

            {/* MASTER MODULE SWITCH FOR SERVICE */}
            <div className="p-5 rounded-2xl bg-[#0D1527] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Servis & Bakım Hizmetlerini Sitede Göster / Gizle</h3>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed max-w-xl">
                  Bu anahtar kapatıldığında (Şu Anki Durum: Sadece Satış), üst menüdeki Servis linki, footer bağlantıları ve servis randevu formları sitede gizlenir. <code>/service</code> sayfasına gelen ziyaretçilere hizmetlerin yakında başlayacağına dair duyuru gösterilir.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextVal = !formData.showServiceModule;
                  handleChange('showServiceModule', nextVal);
                  handleChange('navServiceActive', nextVal);
                }}
                className={`px-5 py-3 rounded-xl text-xs font-extrabold border transition-all shrink-0 shadow-lg ${
                  formData.showServiceModule
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                }`}
              >
                {formData.showServiceModule ? 'SİTEDE AKTİF (AÇIK)' : 'SİTEDE GİZLİ (KAPALI - SADECE SATIŞ)'}
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Sayfa Üst Rozet Metni</label>
                <input
                  type="text"
                  value={formData.servicePageBadge || 'MKBL OTOMOTİV YETKİLİ SERVİS'}
                  onChange={(e) => handleChange('servicePageBadge', e.target.value)}
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Sayfa Ana Başlığı</label>
                <input
                  type="text"
                  value={formData.servicePageTitle || 'Elektrikli Araç Bakım & Servis Hizmetleri'}
                  onChange={(e) => handleChange('servicePageTitle', e.target.value)}
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white font-bold text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Sayfa Alt Açıklama Metni</label>
                <textarea
                  rows={2}
                  value={formData.servicePageSubtitle || 'Karea Fit aracınızın periyodik bakımı...'}
                  onChange={(e) => handleChange('servicePageSubtitle', e.target.value)}
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-3">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  Servis Randevu Formu Başlıkları
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Form Rozet Metni</label>
                    <input
                      type="text"
                      value={formData.serviceFormBadge || 'RANDEVU ALIN'}
                      onChange={(e) => handleChange('serviceFormBadge', e.target.value)}
                      className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Form Ana Başlığı</label>
                    <input
                      type="text"
                      value={formData.serviceFormTitle || 'Servis Randevusu Oluşturun'}
                      onChange={(e) => handleChange('serviceFormTitle', e.target.value)}
                      className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Form Gönder Buton Yazısı</label>
                  <input
                    type="text"
                    value={formData.serviceFormButtonText || 'Servis Randevusunu Onayla'}
                    onChange={(e) => handleChange('serviceFormButtonText', e.target.value)}
                    className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SHOWROOM & CONTACT PAGE CMS */}
        {activeTab === 'showroom' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/20 space-y-6">
            <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              <span>Showroom & İletişim Sayfası Tüm İçerik Düzenleyicisi</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-3">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                  İletişim Sayfası Üst Başlıkları
                </h3>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Sayfa Üst Rozet Metni</label>
                  <input
                    type="text"
                    value={formData.contactPageBadge}
                    onChange={(e) => handleChange('contactPageBadge', e.target.value)}
                    className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Sayfa Ana Başlığı</label>
                  <input
                    type="text"
                    value={formData.contactPageTitle}
                    onChange={(e) => handleChange('contactPageTitle', e.target.value)}
                    className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Sayfa Alt Açıklama Metni</label>
                  <textarea
                    rows={2}
                    value={formData.contactPageSubtitle}
                    onChange={(e) => handleChange('contactPageSubtitle', e.target.value)}
                    className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Showroom Map & Address */}
              <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  Showroom Harita & Lokasyon Bilgileri
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Plaza / Showroom Adı</label>
                    <input
                      type="text"
                      value={formData.contactMapName}
                      onChange={(e) => handleChange('contactMapName', e.target.value)}
                      className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Harita Buton Metni</label>
                    <input
                      type="text"
                      value={formData.contactMapButtonText}
                      onChange={(e) => handleChange('contactMapButtonText', e.target.value)}
                      className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Google Maps Yönlendirme Linki (URL)</label>
                  <input
                    type="text"
                    value={formData.contactMapUrl}
                    onChange={(e) => handleChange('contactMapUrl', e.target.value)}
                    className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Canlı Google Harita Embed URL (`&lt;iframe src="..."&gt;` içindeki link)</label>
                  <input
                    type="text"
                    value={formData.contactMapEmbedUrl || ''}
                    onChange={(e) => handleChange('contactMapEmbedUrl', e.target.value)}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-gray-400 block mt-1">Google Maps'ten kopyaladığınız Embed Iframe `src` linkini buraya yapıştırabilirsiniz.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-blue-400" />
                <span>Tasarruf Hesaplayıcı Modülü Ayarları</span>
              </h2>

              <button
                type="button"
                onClick={() => handleChange('showCalculator', !(formData.showCalculator !== false))}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all ${
                  formData.showCalculator !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${formData.showCalculator !== false ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                <span>{formData.showCalculator !== false ? 'Sitede Yayında (Tüm Sayfalar)' : 'Yayından Kaldırıldı (Gizli)'}</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Hesaplayıcı Ana Başlığı</label>
                <input
                  type="text"
                  value={formData.calcTitle}
                  onChange={(e) => handleChange('calcTitle', e.target.value)}
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white font-bold text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Hesaplayıcı Alt Açıklaması</label>
                <textarea
                  rows={2}
                  value={formData.calcSubtitle}
                  onChange={(e) => handleChange('calcSubtitle', e.target.value)}
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div className="space-y-2 pt-2">
                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-300 flex items-center justify-between">
                  <span className="font-semibold">📌 Varsayılan Sabit Fiyat Ayarları</span>
                  <span className="text-[10px] text-gray-400">API'ler PASİF olduğunda veya veri akışı kesildiğinde buradaki fiyatlar kullanılır.</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-2">
                    <label className="block text-blue-400 font-bold flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Varsayılan Elektrik Birim Fiyatı (TL / kWh)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.defaultElectricityRate}
                      onChange={(e) => handleChange('defaultElectricityRate', parseFloat(e.target.value) || 0)}
                      className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[10px] text-gray-400 block">API pasif/kesintide iken hesaplayıcıda görünecek ev elektrik kwh tarifesi. (Örn: 3.25)</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0D1527] border border-red-500/20 space-y-2">
                    <label className="block text-red-400 font-bold flex items-center space-x-2">
                      <Fuel className="w-4 h-4" />
                      <span>Varsayılan Benzin Litre Fiyatı (TL / Litre)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.defaultGasPrice}
                      onChange={(e) => handleChange('defaultGasPrice', parseFloat(e.target.value) || 0)}
                      className="w-full bg-black/40 border border-red-500/30 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:border-red-500"
                    />
                    <span className="text-[10px] text-gray-400 block">API pasif/kesintide iken hesaplayıcıda görünecek benzin litre pompa fiyatı. (Örn: 67.00)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Karea Fit Tüketimi (kWh / 100km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.defaultEvConsump}
                    onChange={(e) => handleChange('defaultEvConsump', parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Ortalama Benzinli Tüketimi (Litre / 100km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.defaultGasConsump}
                    onChange={(e) => handleChange('defaultGasConsump', parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* LIVE API DATA FLOW TEST BUTTON */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-purple-950/30 to-transparent border border-blue-500/30 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                    <span>⚡ Canlı API Veri Akış Kontrol Paneli</span>
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    Dış API entegrasyonlarınızın anlık veri akışı durumunu buradan test edebilirsiniz.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={testApiConnections}
                  disabled={apiStatus.isTesting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${apiStatus.isTesting ? 'animate-spin' : ''}`} />
                  <span>{apiStatus.isTesting ? 'Test Ediliyor...' : 'Veri Akışını Test Et'}</span>
                </button>
              </div>

              {/* COLLECT API AKARYAKIT İNTEGRASYONU */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-red-950/20 to-transparent border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-purple-300">CollectAPI Canlı Akaryakıt (Benzin) API Anahtarı</span>
                    <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">collectapi.com/tr/api/gasPrice</span>
                  </div>
                  {/* ON/OFF TOGGLE SWITCH */}
                  <label className="relative inline-flex items-center cursor-pointer space-x-2">
                    <span className={`text-[11px] font-extrabold ${formData.collectApiActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formData.collectApiActive ? '● API AKTİF' : '○ PASİF (VARSAYILAN)'}
                    </span>
                    <input
                      type="checkbox"
                      checked={!!formData.collectApiActive}
                      onChange={(e) => handleChange('collectApiActive', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[22px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* DATA AKIŞ SÜTUNU / BİLGİ ALANI */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#080E1C] border border-purple-500/20 text-xs">
                  <span className="text-gray-400 font-semibold">Data Akış Sinyali:</span>
                  {!formData.collectApiActive ? (
                    <span className="text-gray-400 font-bold flex items-center space-x-1">
                      <span>⚪ Pasif (API Kapalı - Varsayılan Fiyat Kullanılıyor)</span>
                    </span>
                  ) : apiStatus.collectApiFlow === 'ACTIVE' ? (
                    <span className="text-emerald-400 font-bold flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                      <span>🟢 Veri Akışı Aktif (Canlı Pompa Fiyatı Alınıyor)</span>
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                      <span>🔴 Veri Akışı Kesildi (Otomatik Son Kayıtlı Fiyat Kullanılıyor)</span>
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  value={formData.collectApiKey || ''}
                  onChange={(e) => handleChange('collectApiKey', e.target.value)}
                  placeholder="apikey 1234567890abcdef..."
                  className={`w-full bg-[#080E1C] border ${formData.collectApiActive ? 'border-purple-500/50' : 'border-gray-800 opacity-60'} rounded-xl p-3 text-sky-300 font-mono text-xs focus:outline-none focus:border-purple-500`}
                />
                <p className="text-[10px] text-gray-400">
                  {formData.collectApiActive
                    ? '🟢 Aktif: Benzin fiyatı otomatik olarak CollectAPI üzerindeki canlı verilerden çekilmektedir. Kesinti durumunda son bilinen fiyat otomatik korunur.'
                    : '🔴 Pasif: Dış API kullanılmaz. Yukarıda tanımlı olan varsayılan benzin fiyatı (67.00 TL) geçerli olur.'}
                </p>
              </div>

              {/* EPİAŞ ŞEFFAFLIK API İNTEGRASYONU */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-sky-950/20 to-transparent border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-sky-300">EPİAŞ Şeffaflık Portalı V2 Elektrik API Hesabı</span>
                    <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">seffaflik.epias.com.tr</span>
                  </div>
                  {/* ON/OFF TOGGLE SWITCH */}
                  <label className="relative inline-flex items-center cursor-pointer space-x-2">
                    <span className={`text-[11px] font-extrabold ${formData.epiasActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formData.epiasActive ? '● API AKTİF' : '○ PASİF (VARSAYILAN)'}
                    </span>
                    <input
                      type="checkbox"
                      checked={!!formData.epiasActive}
                      onChange={(e) => handleChange('epiasActive', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[22px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* DATA AKIŞ SÜTUNU / BİLGİ ALANI */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#080E1C] border border-blue-500/20 text-xs">
                  <span className="text-gray-400 font-semibold">Data Akış Sinyali:</span>
                  {!formData.epiasActive ? (
                    <span className="text-gray-400 font-bold flex items-center space-x-1">
                      <span>⚪ Pasif (API Kapalı - Varsayılan Tarifeler Kullanılıyor)</span>
                    </span>
                  ) : apiStatus.epiasFlow === 'ACTIVE' ? (
                    <span className="text-emerald-400 font-bold flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                      <span>🟢 Veri Akışı Aktif (EPİAŞ Canlı Tarife Alınıyor)</span>
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                      <span>🔴 Veri Akışı Kesildi (Otomatik Son Kayıtlı Fatura Fiyatı Kullanılıyor)</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-300 font-semibold mb-1">EPİAŞ Kullanıcı Adı (E-Posta)</label>
                    <input
                      type="text"
                      value={formData.epiasUser || 'mkblsosyal@gmail.com'}
                      onChange={(e) => handleChange('epiasUser', e.target.value)}
                      placeholder="mkblsosyal@gmail.com"
                      className={`w-full bg-[#080E1C] border ${formData.epiasActive ? 'border-blue-500/50' : 'border-gray-800 opacity-60'} rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 font-semibold mb-1">EPİAŞ Giriş Şifresi</label>
                    <input
                      type="password"
                      value={formData.epiasPass || 'Basaran+2026'}
                      onChange={(e) => handleChange('epiasPass', e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full bg-[#080E1C] border ${formData.epiasActive ? 'border-blue-500/50' : 'border-gray-800 opacity-60'} rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-300 font-semibold mb-1 flex items-center justify-between">
                    <span>EPİAŞ Şeffaflık API Anahtarı (API Key / TGT Token)</span>
                    <span className="text-[10px] text-gray-400 font-normal">seffaflik.epias.com.tr</span>
                  </label>
                  <input
                    type="text"
                    value={formData.epiasApiKey || ''}
                    onChange={(e) => handleChange('epiasApiKey', e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className={`w-full bg-[#080E1C] border ${formData.epiasActive ? 'border-blue-500/50' : 'border-gray-800 opacity-60'} rounded-xl p-2.5 text-sky-300 font-mono text-xs focus:outline-none focus:border-blue-500`}
                  />
                </div>
                <p className="text-[10px] text-gray-400">
                  {formData.epiasActive
                    ? '🟢 Aktif: Elektrik birim fiyatı EPİAŞ Şeffaflık Portalı resmi API hesabınızla canlı çekilmektedir. Kesinti durumunda son kayıtlı fiyat korunur.'
                    : '🔴 Pasif: Dış API kullanılmaz. Yukarıda tanımlı olan varsayılan elektrik birim fiyatı (3.25 TL) geçerli olur.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: WHATSAPP CANLI DESTEK WIDGET AYARLARI */}
        {activeTab === 'whatsapp' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 space-y-6 bg-gradient-to-b from-[#0B1528] to-[#070D1C]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <span>Canlı WhatsApp Destek Widget Ayarları</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Müşterilerinizin sitenin sağ alt köşesinden Kepez Showroom satış ekibinizle anında WhatsApp sohbeti başlatmasını sağlayan canlı widget ayarları.
                </p>
              </div>

              {/* ON/OFF TOGGLE SWITCH */}
              <label className="relative inline-flex items-center cursor-pointer space-x-3 bg-[#080E1C] px-4 py-2 rounded-2xl border border-emerald-500/30">
                <span className={`text-xs font-extrabold ${formData.whatsappActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formData.whatsappActive ? '● WIDGET AKTİF (SİTEDE GÖRÜNÜR)' : '○ PASİF (SİTEDE GİZLİ)'}
                </span>
                <input
                  type="checkbox"
                  checked={!!formData.whatsappActive}
                  onChange={(e) => handleChange('whatsappActive', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[22px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* SAVE REMINDER BANNER */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Değişiklik yaptıktan sonra sol/sağ alt konumun ve açma/kapatma durumunun kaydedilmesi için sağ üstteki <strong>"Tüm Değişiklikleri Kaydet"</strong> butonuna tıklayınız.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* WhatsApp Telefon Numarası */}
              <div className="p-5 rounded-2xl bg-[#0D1527] border border-emerald-500/20 space-y-2">
                <label className="block text-xs font-bold text-emerald-300">
                  WhatsApp Telefon Numarası (Ülke Kodu Dahil, Boşluksuz)
                </label>
                <input
                  type="text"
                  value={formData.whatsappPhone || ''}
                  onChange={(e) => handleChange('whatsappPhone', e.target.value)}
                  placeholder="905321234567"
                  className="w-full bg-[#080E1C] border border-emerald-500/30 rounded-xl p-3 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-gray-400 block">
                  Örnek: <code>905321234567</code> (Başında + işareti veya boşluk bırakmadan ülke kodu ile yazın).
                </span>
              </div>

              {/* Ekran Pozisyonu */}
              <div className="p-5 rounded-2xl bg-[#0D1527] border border-emerald-500/20 space-y-2">
                <label className="block text-xs font-bold text-emerald-300">
                  Widget Ekran Pozisyonu
                </label>
                <select
                  value={formData.whatsappPosition || 'bottom-right'}
                  onChange={(e) => handleChange('whatsappPosition', e.target.value)}
                  className="w-full bg-[#080E1C] border border-emerald-500/30 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="bottom-right">Sağ Alt Köşe (Standart & Önerilen)</option>
                  <option value="bottom-left">Sol Alt Köşe</option>
                </select>
                <span className="text-[10px] text-gray-400 block">
                  Butonun sitede hangi köşede sabitleneceğini belirler.
                </span>
              </div>

              {/* Pencere Başlığı */}
              <div className="p-5 rounded-2xl bg-[#0D1527] border border-slate-700/60 space-y-2">
                <label className="block text-xs font-bold text-gray-300">
                  Sohbet Penceresi Başlığı
                </label>
                <input
                  type="text"
                  value={formData.whatsappTitle || ''}
                  onChange={(e) => handleChange('whatsappTitle', e.target.value)}
                  placeholder="Kepez Showroom Canlı Destek"
                  className="w-full bg-[#080E1C] border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Pencere Alt Başlığı */}
              <div className="p-5 rounded-2xl bg-[#0D1527] border border-slate-700/60 space-y-2">
                <label className="block text-xs font-bold text-gray-300">
                  Sohbet Penceresi Alt Açıklaması
                </label>
                <input
                  type="text"
                  value={formData.whatsappSubtitle || ''}
                  onChange={(e) => handleChange('whatsappSubtitle', e.target.value)}
                  placeholder="Size nasıl yardımcı olabiliriz?"
                  className="w-full bg-[#080E1C] border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Varsayılan Mesaj Şablonu */}
            <div className="p-5 rounded-2xl bg-[#0D1527] border border-slate-700/60 space-y-2">
              <label className="block text-xs font-bold text-gray-300">
                Varsayılan Mesaj Metni (Hazır Gönderilecek Mesaj)
              </label>
              <textarea
                rows={2}
                value={formData.whatsappMessage || ''}
                onChange={(e) => handleChange('whatsappMessage', e.target.value)}
                placeholder="Merhaba! Karea Fit elektrikli araçlar hakkında bilgi almak istiyorum."
                className="w-full bg-[#080E1C] border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none font-sans"
              ></textarea>
              <span className="text-[10px] text-gray-400 block">
                Müşteri WhatsApp'a yönlendirildiğinde yazma alanına otomatik doldurulacak ilk mesaj.
              </span>
            </div>

            {/* Hızlı Butonlar JSON Array */}
            <div className="p-5 rounded-2xl bg-[#0D1527] border border-slate-700/60 space-y-2">
              <label className="block text-xs font-bold text-gray-300">
                Hızlı Seçenek Butonları (JSON Formatında Liste)
              </label>
              <textarea
                rows={4}
                value={formData.whatsappQuickOptions || ''}
                onChange={(e) => handleChange('whatsappQuickOptions', e.target.value)}
                placeholder='["🚗 Karea Fit Test Sürüşü İstiyorum", "💰 Fiyat & Kredi Teklifi Al", "📍 Showroom Konumu İstiyorum", "🔧 Servis & Bakım Randevusu"]'
                className="w-full bg-[#080E1C] border border-slate-700 rounded-xl p-3 text-sky-300 font-mono text-xs focus:outline-none focus:border-emerald-500 resize-none"
              ></textarea>
              <span className="text-[10px] text-gray-400 block">
                Pencere açıldığında tek tıkla gönderilebilecek hızlı butonların listesi (JSON array formatında).
              </span>
            </div>
          </div>
        )}

        {/* TAB 4: CONTACT, HEADER & FOOTER */}
        {activeTab === 'contact' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/20 space-y-6">
            <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-400" />
              <span>Header, Footer & İletişim Bilgileri</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Firma / Site Adı</label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => handleChange('siteName', e.target.value)}
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Müşteri Hizmetleri Telefonu</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">E-Posta Adresi</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Çalışma Saatleri</label>
                <input
                  type="text"
                  value={formData.workingHours}
                  onChange={(e) => handleChange('workingHours', e.target.value)}
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Showroom Açık Adresi</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Footer Açıklama Metni</label>
                <textarea
                  rows={2}
                  value={formData.footerDescription}
                  onChange={(e) => handleChange('footerDescription', e.target.value)}
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Footer Rozet 1 (Durum Badge)</label>
                  <input
                    type="text"
                    value={formData.footerBadge1}
                    onChange={(e) => handleChange('footerBadge1', e.target.value)}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Footer Rozet 2 (Model Badge)</label>
                  <input
                    type="text"
                    value={formData.footerBadge2}
                    onChange={(e) => handleChange('footerBadge2', e.target.value)}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Sütun 1 Başlığı</label>
                  <input
                    type="text"
                    value={formData.footerModelLinksTitle}
                    onChange={(e) => handleChange('footerModelLinksTitle', e.target.value)}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Sütun 2 Başlığı</label>
                  <input
                    type="text"
                    value={formData.footerServicesTitle}
                    onChange={(e) => handleChange('footerServicesTitle', e.target.value)}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Sütun 3 Başlığı</label>
                  <input
                    type="text"
                    value={formData.footerShowroomTitle}
                    onChange={(e) => handleChange('footerShowroomTitle', e.target.value)}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Model İnceleme Sütunu Link Metinleri & Linkleri */}
              <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-4">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                  Model İnceleme Sütunu Alt Link Metinleri & Yönlendirme Linkleri
                </h3>
                <div className="space-y-4">
                  {/* Model Link 1 */}
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-300">1. Model Linki</span>
                      <button
                        type="button"
                        onClick={() => handleChange('footerModelLink1Active', !(formData.footerModelLink1Active !== false))}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 transition-all ${
                          formData.footerModelLink1Active !== false
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${formData.footerModelLink1Active !== false ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                        <span>{formData.footerModelLink1Active !== false ? 'Aktif (Yayında)' : 'Pasif (Gizli)'}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1">Link Metni</label>
                        <input
                          type="text"
                          value={formData.footerModelLink1 !== undefined ? formData.footerModelLink1 : ''}
                          onChange={(e) => handleChange('footerModelLink1', e.target.value)}
                          placeholder="Karea Fit (Teknik Özellikler)"
                          className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Link Yönlendirme URL'si</label>
                        <input
                          type="text"
                          value={formData.footerModelLink1Url !== undefined ? formData.footerModelLink1Url : ''}
                          onChange={(e) => handleChange('footerModelLink1Url', e.target.value)}
                          placeholder="/models/karea-fit"
                          className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Model Link 2 */}
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-300">2. Model Linki</span>
                      <button
                        type="button"
                        onClick={() => handleChange('footerModelLink2Active', !(formData.footerModelLink2Active !== false))}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 transition-all ${
                          formData.footerModelLink2Active !== false
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${formData.footerModelLink2Active !== false ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                        <span>{formData.footerModelLink2Active !== false ? 'Aktif (Yayında)' : 'Pasif (Gizli)'}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1">Link Metni</label>
                        <input
                          type="text"
                          value={formData.footerModelLink2 !== undefined ? formData.footerModelLink2 : ''}
                          onChange={(e) => handleChange('footerModelLink2', e.target.value)}
                          placeholder="360° Renk Seçenekleri"
                          className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Link Yönlendirme URL'si</label>
                        <input
                          type="text"
                          value={formData.footerModelLink2Url !== undefined ? formData.footerModelLink2Url : ''}
                          onChange={(e) => handleChange('footerModelLink2Url', e.target.value)}
                          placeholder="/models/karea-fit"
                          className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Model Link 3 */}
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-300">3. Model Linki</span>
                      <button
                        type="button"
                        onClick={() => handleChange('footerModelLink3Active', !(formData.footerModelLink3Active !== false))}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 transition-all ${
                          formData.footerModelLink3Active !== false
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${formData.footerModelLink3Active !== false ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                        <span>{formData.footerModelLink3Active !== false ? 'Aktif (Yayında)' : 'Pasif (Gizli)'}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1">Link Metni</label>
                        <input
                          type="text"
                          value={formData.footerModelLink3 !== undefined ? formData.footerModelLink3 : ''}
                          onChange={(e) => handleChange('footerModelLink3', e.target.value)}
                          placeholder="Ev Tipi 220V Şarj Gücü"
                          className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Link Yönlendirme URL'si</label>
                        <input
                          type="text"
                          value={formData.footerModelLink3Url !== undefined ? formData.footerModelLink3Url : ''}
                          onChange={(e) => handleChange('footerModelLink3Url', e.target.value)}
                          placeholder="/models/karea-fit"
                          className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hizmetler Sütunu Link Metinleri & Linkleri */}
              <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  Hizmetler Sütunu Alt Link Metinleri & Yönlendirme Linkleri
                </h3>
                <div className="space-y-4">
                  {/* Service Link 1 */}
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-300">1. Hizmet Linki</span>
                      <button
                        type="button"
                        onClick={() => handleChange('footerServiceLink1Active', !(formData.footerServiceLink1Active !== false))}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 transition-all ${
                          formData.footerServiceLink1Active !== false
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${formData.footerServiceLink1Active !== false ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                        <span>{formData.footerServiceLink1Active !== false ? 'Aktif (Yayında)' : 'Pasif (Gizli)'}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1">Hizmet Link Metni</label>
                        <input
                          type="text"
                          value={formData.footerServiceLink1 !== undefined ? formData.footerServiceLink1 : ''}
                          onChange={(e) => handleChange('footerServiceLink1', e.target.value)}
                          placeholder="Elektrikli Periyodik Bakım"
                          className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Hizmet Link URL'si</label>
                        <input
                          type="text"
                          value={formData.footerServiceLink1Url !== undefined ? formData.footerServiceLink1Url : ''}
                          onChange={(e) => handleChange('footerServiceLink1Url', e.target.value)}
                          placeholder="/service"
                          className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Link 2 */}
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-300">2. Hizmet Linki</span>
                      <button
                        type="button"
                        onClick={() => handleChange('footerServiceLink2Active', !(formData.footerServiceLink2Active !== false))}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 transition-all ${
                          formData.footerServiceLink2Active !== false
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${formData.footerServiceLink2Active !== false ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                        <span>{formData.footerServiceLink2Active !== false ? 'Aktif (Yayında)' : 'Pasif (Gizli)'}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1">Hizmet Link Metni</label>
                        <input
                          type="text"
                          value={formData.footerServiceLink2 !== undefined ? formData.footerServiceLink2 : ''}
                          onChange={(e) => handleChange('footerServiceLink2', e.target.value)}
                          placeholder="LFP Batarya Health Check-up"
                          className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Hizmet Link URL'si</label>
                        <input
                          type="text"
                          value={formData.footerServiceLink2Url !== undefined ? formData.footerServiceLink2Url : ''}
                          onChange={(e) => handleChange('footerServiceLink2Url', e.target.value)}
                          placeholder="/service"
                          className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Link 3 */}
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-300">3. Hizmet Linki</span>
                      <button
                        type="button"
                        onClick={() => handleChange('footerServiceLink3Active', !(formData.footerServiceLink3Active !== false))}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 transition-all ${
                          formData.footerServiceLink3Active !== false
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${formData.footerServiceLink3Active !== false ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                        <span>{formData.footerServiceLink3Active !== false ? 'Aktif (Yayında)' : 'Pasif (Gizli)'}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1">Hizmet Link Metni</label>
                        <input
                          type="text"
                          value={formData.footerServiceLink3 !== undefined ? formData.footerServiceLink3 : ''}
                          onChange={(e) => handleChange('footerServiceLink3', e.target.value)}
                          placeholder="220V Şarj Güvenlik Kontrolü"
                          className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Hizmet Link URL'si</label>
                        <input
                          type="text"
                          value={formData.footerServiceLink3Url !== undefined ? formData.footerServiceLink3Url : ''}
                          onChange={(e) => handleChange('footerServiceLink3Url', e.target.value)}
                          placeholder="/service"
                          className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Link 4 */}
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-300">4. Hizmet Linki</span>
                      <button
                        type="button"
                        onClick={() => handleChange('footerServiceLink4Active', !(formData.footerServiceLink4Active !== false))}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 transition-all ${
                          formData.footerServiceLink4Active !== false
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${formData.footerServiceLink4Active !== false ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                        <span>{formData.footerServiceLink4Active !== false ? 'Aktif (Yayında)' : 'Pasif (Gizli)'}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1">Hizmet Link Metni</label>
                        <input
                          type="text"
                          value={formData.footerServiceLink4 !== undefined ? formData.footerServiceLink4 : ''}
                          onChange={(e) => handleChange('footerServiceLink4', e.target.value)}
                          placeholder="Kepez Showroom & Deneyim"
                          className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Hizmet Link URL'si</label>
                        <input
                          type="text"
                          value={formData.footerServiceLink4Url !== undefined ? formData.footerServiceLink4Url : ''}
                          onChange={(e) => handleChange('footerServiceLink4Url', e.target.value)}
                          placeholder="/contact"
                          className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Admin Link 5 */}
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-300">5. Admin Giriş Linki</span>
                      <button
                        type="button"
                        onClick={() => handleChange('footerAdminLinkActive', !(formData.footerAdminLinkActive !== false))}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1.5 transition-all ${
                          formData.footerAdminLinkActive !== false
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${formData.footerAdminLinkActive !== false ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                        <span>{formData.footerAdminLinkActive !== false ? 'Aktif (Yayında)' : 'Pasif (Gizli)'}</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1">Admin Giriş Buton Metni</label>
                        <input
                          type="text"
                          value={formData.footerAdminLinkText !== undefined ? formData.footerAdminLinkText : ''}
                          onChange={(e) => handleChange('footerAdminLinkText', e.target.value)}
                          placeholder="Yönetim Paneli (Admin)"
                          className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Admin Giriş Link URL'si</label>
                        <input
                          type="text"
                          value={formData.footerAdminLinkUrl !== undefined ? formData.footerAdminLinkUrl : ''}
                          onChange={(e) => handleChange('footerAdminLinkUrl', e.target.value)}
                          placeholder="/admin"
                          className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Footer Telif Metni (Copyright Text)</label>
                <input
                  type="text"
                  value={formData.copyrightText}
                  onChange={(e) => handleChange('copyrightText', e.target.value)}
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LEGAL POLICIES & COOKIE CONSENT */}
        {activeTab === 'legal' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center space-x-2">
                  <FileCheck className="w-5 h-5 text-blue-400" />
                  <span>Gizlilik Politikası, Çerez Yönetimi & KVKK Metinleri</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">6698 KVKK ve GDPR çerez bildirim bantlarını ve yasal politikaları düzenleyin.</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-300 font-semibold">Çerez Bandı:</span>
                <button
                  type="button"
                  onClick={() => handleChange('showCookieBanner', !(formData.showCookieBanner !== false))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    formData.showCookieBanner !== false
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-500/20 text-red-400 border-red-500/40'
                  }`}
                >
                  {formData.showCookieBanner !== false ? 'AKTİF (YAYINDA)' : 'PASİF (GİZLİ)'}
                </button>
              </div>
            </div>

            <div className="space-y-5 text-xs">
              {/* COOKIE BANNER TEXT */}
              <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-2">
                <label className="block text-xs font-bold text-sky-400">
                  Çerez Bildirim Bandı Açıklama Metni (Sitenin Altında Kayan Alan)
                </label>
                <textarea
                  rows={3}
                  value={formData.cookieBannerText || ''}
                  onChange={(e) => handleChange('cookieBannerText', e.target.value)}
                  placeholder="Sitemizde kullanıcı deneyimini iyileştirmek..."
                  className="w-full bg-[#080D1A] border border-blue-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none font-sans text-xs"
                ></textarea>
              </div>

              {/* COOKIE POLICY TEXT */}
              <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-2">
                <label className="block text-xs font-bold text-sky-400">
                  Çerez Politikası Detaylı Aydınlatma Metni (6698 KVKK Standardı)
                </label>
                <textarea
                  rows={6}
                  value={formData.cookiePolicyText || ''}
                  onChange={(e) => handleChange('cookiePolicyText', e.target.value)}
                  placeholder="MKBL Otomotiv Çerez Politikası..."
                  className="w-full bg-[#080D1A] border border-blue-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none font-mono text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Gizlilik Politikası Pop-up Metni</label>
                <textarea
                  rows={6}
                  value={formData.privacyPolicyText}
                  onChange={(e) => handleChange('privacyPolicyText', e.target.value)}
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none font-mono text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Kullanım Şartları Pop-up Metni</label>
                <textarea
                  rows={6}
                  value={formData.termsOfUseText}
                  onChange={(e) => handleChange('termsOfUseText', e.target.value)}
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none font-mono text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">KVKK Aydınlatma Metni</label>
                <textarea
                  rows={6}
                  value={formData.kvkkText}
                  onChange={(e) => handleChange('kvkkText', e.target.value)}
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none font-mono text-xs"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: TRACKING CODES & E-MAIL SMTP CONFIGURATION */}
        {activeTab === 'tracking' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/20 space-y-6">
            <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center space-x-2 border-b border-white/10 pb-4">
              <Code2 className="w-5 h-5 text-blue-400" />
              <span>SMTP E-Posta Sunucu Ayarları ve Analitik Kodları</span>
            </h2>

            <div className="space-y-6 text-xs">
              {/* SMTP CONFIGURATION SECTION */}
              <div className="p-5 rounded-2xl bg-[#0D1527] border border-blue-500/30 space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-sky-400"></span>
                  <h3 className="text-sm font-bold text-white">SMTP Kurumsal E-Posta Sunucusu Entegrasyonu</h3>
                </div>
                <p className="text-gray-400 text-[11px]">
                  Sitedeki formların (Satış, SSH, Müşteri İlişkileri) otomatik e-posta olarak iletilmesi için kurumunuza ait SMTP sunucu bilgilerini giriniz.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">SMTP Sunucu Adresi (Host)</label>
                    <input
                      type="text"
                      value={formData.smtpHost || ''}
                      onChange={(e) => handleChange('smtpHost', e.target.value)}
                      placeholder="mail.mkbloto.com veya smtp.gmail.com"
                      className="w-full bg-[#080D1A] border border-blue-500/30 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">SMTP Port</label>
                    <input
                      type="number"
                      value={formData.smtpPort || 587}
                      onChange={(e) => handleChange('smtpPort', Number(e.target.value))}
                      placeholder="587 veya 465"
                      className="w-full bg-[#080D1A] border border-blue-500/30 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Gönderen E-Posta Adresi (From)</label>
                    <input
                      type="text"
                      value={formData.smtpSender || ''}
                      onChange={(e) => handleChange('smtpSender', e.target.value)}
                      placeholder="bildirim@mkbloto.com"
                      className="w-full bg-[#080D1A] border border-blue-500/30 rounded-xl p-3 text-sky-300 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">SMTP Kullanıcı Adı (Username)</label>
                    <input
                      type="text"
                      value={formData.smtpUser || ''}
                      onChange={(e) => handleChange('smtpUser', e.target.value)}
                      placeholder="bildirim@mkbloto.com"
                      className="w-full bg-[#080D1A] border border-blue-500/30 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">SMTP Giriş Şifresi (Password)</label>
                    <input
                      type="password"
                      value={formData.smtpPass || ''}
                      onChange={(e) => handleChange('smtpPass', e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#080D1A] border border-blue-500/30 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* ANALYTICS SECTION */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Google Tag Manager ID</label>
                  <input
                    type="text"
                    value={formData.googleTagManagerId}
                    onChange={(e) => handleChange('googleTagManagerId', e.target.value)}
                    placeholder="GTM-XXXXXXX"
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Google Ads Dönüşüm ID</label>
                  <input
                    type="text"
                    value={formData.googleAdsId}
                    onChange={(e) => handleChange('googleAdsId', e.target.value)}
                    placeholder="AW-XXXXXXXXX"
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Meta Pixel (Facebook) ID</label>
                  <input
                    type="text"
                    value={formData.metaPixelId}
                    onChange={(e) => handleChange('metaPixelId', e.target.value)}
                    placeholder="123456789012345"
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Özel Head Script Kodları (`&lt;head&gt;` içerisine eklenir)
                </label>
                <textarea
                  rows={4}
                  value={formData.customHeadScripts}
                  onChange={(e) => handleChange('customHeadScripts', e.target.value)}
                  placeholder="// Buraya özel JavaScript veya HTML script kodlarını yapıştırabilirsiniz..."
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-emerald-400 font-mono text-xs focus:outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Özel Body Script Kodları (`&lt;body&gt;` içerisine eklenir)
                </label>
                <textarea
                  rows={4}
                  value={formData.customBodyScripts}
                  onChange={(e) => handleChange('customBodyScripts', e.target.value)}
                  placeholder="// Buraya body sonuna eklenecek canlı sohbet widget vb. scriptlerini ekleyebilirsiniz..."
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-emerald-400 font-mono text-xs focus:outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SITE MAINTENANCE MODE */}
        {activeTab === 'maintenance' && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 space-y-8 bg-[#0D1527]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-white font-['Outfit'] flex items-center space-x-2">
                  <Wrench className="w-6 h-6 text-amber-400" />
                  <span>Site Yayın Durumu & Bakım Modu</span>
                </h2>
                <p className="text-xs text-gray-400">
                  Sitenizi istediğiniz zaman yayından kaldırabilir, bakım moduna alabilir ve özel bakım mesajınızı yayınlayabilirsiniz.
                </p>
              </div>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5"
              >
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Sitede Test Et</span>
              </a>
            </div>

            {/* TOGGLE SWITCH CARD */}
            <div className={`p-6 rounded-3xl border transition-all ${
              formData.isMaintenanceMode
                ? 'bg-amber-950/30 border-amber-500/50 shadow-2xl shadow-amber-950/50'
                : 'bg-emerald-950/20 border-emerald-500/40 shadow-xl'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                      formData.isMaintenanceMode ? 'bg-amber-600 shadow-lg shadow-amber-950' : 'bg-emerald-600 shadow-lg shadow-emerald-950'
                    }`}>
                      <Power className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-white font-['Outfit']">
                        {formData.isMaintenanceMode ? '🔴 SİTE BAKIM MODUNDA (YAYINDAN KALDIRILDI)' : '🟢 SİTE YAYINDA (CANLI & AKTİF)'}
                      </h3>
                      <p className="text-xs text-gray-300">
                        {formData.isMaintenanceMode
                          ? 'Ziyaretçiler siteye girdiğinde özel Bakım Ekranı ile karşılaşır. Yönetim paneline erişiminiz açık kalır.'
                          : 'Siteniz tüm ziyaretçilere açıktır. Normal yayın akışı devam etmektedir.'}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, isMaintenanceMode: !prev.isMaintenanceMode }))}
                  className={`px-8 py-4 rounded-2xl font-extrabold text-sm shadow-2xl transition-all flex items-center space-x-3 shrink-0 cursor-pointer ${
                    formData.isMaintenanceMode
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-950/60 scale-105'
                      : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-950/60'
                  }`}
                >
                  <Power className="w-5 h-5" />
                  <span>{formData.isMaintenanceMode ? '✅ SİTEYİ TEKRAR YAYINA AL' : '⛔ SİTEYİ BAKIMA AL (YAYINDAN KALDIR)'}</span>
                </button>
              </div>
            </div>

            {/* MAINTENANCE MESSAGE CUSTOMIZATION */}
            <div className="space-y-4 text-xs pt-4 border-t border-slate-800">
              <h3 className="text-sm font-extrabold text-white font-['Outfit'] flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Bakım Modu Sayfa Metinleri & Süre Ayarı</span>
              </h3>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Bakım Ekranı Ana Başlığı:
                </label>
                <input
                  type="text"
                  value={formData.maintenanceTitle || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maintenanceTitle: e.target.value }))}
                  placeholder="Sitemiz Bakımdadır"
                  className="w-full bg-[#060A14] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Bakım Açıklama Metni:
                </label>
                <textarea
                  rows={3}
                  value={formData.maintenanceSubtitle || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maintenanceSubtitle: e.target.value }))}
                  placeholder="Sizlere daha iyi hizmet verebilmek için sitemizde güncelleme ve bakım çalışmaları yapılmaktadır..."
                  className="w-full bg-[#060A14] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                ></textarea>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Tahmini Tamamlanma Süresi:
                </label>
                <input
                  type="text"
                  value={formData.maintenanceEstimatedTime || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maintenanceEstimatedTime: e.target.value }))}
                  placeholder="Tahmini Süre: 1-2 Saat"
                  className="w-full bg-[#060A14] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 hover:from-blue-500 hover:to-sky-300 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/30 transition-all flex items-center space-x-2 text-sm disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>Tüm Değişiklikleri Kaydet & Canlıya Al</span>
          </button>
        </div>
      </form>
    </div>
  );
}
