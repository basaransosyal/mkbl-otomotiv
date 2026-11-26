'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  BatteryCharging,
  Gauge,
  Sparkles,
  ChevronRight,
  Car
} from 'lucide-react';
import TestDriveModal from './TestDriveModal';
import CostCalculator from './CostCalculator';
import Vehicle360Viewer from './Vehicle360Viewer';
import VehicleGallerySlider from './VehicleGallerySlider';
import { Vehicle, INITIAL_VEHICLES } from '../lib/data';
import { ISiteSettings } from '../lib/settings';

interface HomeClientProps {
  initialVehicles: Vehicle[];
  initialSettings: ISiteSettings;
}

export default function HomeClient({ initialVehicles, initialSettings }: HomeClientProps) {
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>(initialVehicles);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [settings, setSettings] = useState<ISiteSettings>(initialSettings);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/vehicles', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setVehiclesList(data);
        }
      })
      .catch((err) => console.log('Vehicles fetch error:', err));

    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.log('Settings fetch error:', err));
  }, []);

  // Filter vehicles allowed to show on the homepage
  const homepageVehicles = vehiclesList.filter(
    (v) => v.isPublished !== false && v.showOnHomepage !== false
  );

  const activeVehicle =
    homepageVehicles.find((v) => v.id === selectedVehicleId) ||
    homepageVehicles[0] ||
    vehiclesList[0] ||
    INITIAL_VEHICLES[0];

  // Dynamic Homepage Sections Config (Order & Visibility Controlled via Admin Panel)
  const sectionsMap: { [key: string]: { order: number; isVisible: boolean; render: () => React.ReactNode } } = {
    hero: {
      order: settings.homeOrderHero ?? 1,
      isVisible: settings.homeShowHero !== false,
      render: () => (
        <section key="hero" className="relative flex items-center justify-center pt-24 pb-4 overflow-hidden bg-grid-pattern">
          {/* Blue Glow Spheres */}
          <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 w-full relative z-10 space-y-6 sm:space-y-8">
            {/* Multiple Homepage Vehicles Model Switcher Tabs */}
            {homepageVehicles.length > 1 && (
              <div className="flex items-center justify-center space-x-2 bg-blue-950/60 backdrop-blur-md p-1.5 rounded-2xl border border-blue-500/30 max-w-fit mx-auto shadow-xl">
                <span className="text-xs font-bold text-gray-400 px-3 flex items-center space-x-1.5">
                  <Car className="w-3.5 h-3.5 text-blue-400" />
                  <span>Vitrin Modeli:</span>
                </span>
                {homepageVehicles.map((v) => {
                  const isSelected = v.id === activeVehicle.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-600 to-sky-400 text-white shadow-lg shadow-blue-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Content / Mobile Main Order */}
              <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-center lg:text-left flex flex-col">
                {/* 1. Badge, Title, Subtitle */}
                <div className="space-y-4">
                  <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-xs font-semibold text-blue-400 backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>{settings.heroBadge}</span>
                  </div>

                  <h1 className="text-3xl sm:text-6xl font-extrabold text-white font-['Outfit'] tracking-tight leading-[1.1]">
                    {settings.heroTitle}
                  </h1>

                  <p className="text-gray-300 text-sm sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                    {settings.heroSubtitle}
                  </p>
                </div>

                {/* 2. MOBILE ONLY: Vehicle Image & Price Card (Positioned directly between Subtitle and Key Specs Bar on Mobile!) */}
                <div className="block lg:hidden my-2">
                  <div className="rounded-3xl glass-panel p-2.5 border border-blue-500/30 shadow-2xl shadow-blue-950/80 group flex flex-col space-y-2.5">
                    <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#0F1C38] to-[#080E1C] flex items-center justify-center">
                      <Image
                        src={activeVehicle.images[0] || '/images/karea_official_hero.jpg'}
                        alt={activeVehicle.name}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-700"
                        priority
                      />
                    </div>
                    
                    {/* Clean Price Badge Box Below Car */}
                    <div className="p-3.5 rounded-2xl bg-[#091122]/95 backdrop-blur-md border border-blue-500/30 flex items-center justify-between">
                      <div className="text-left">
                        <div className="text-[10px] uppercase font-semibold text-blue-400">{activeVehicle.name} - Başlangıç Fiyatı</div>
                        <div className="text-xl font-bold text-white font-['Outfit']">
                          ₺{activeVehicle.price.toLocaleString('tr-TR')}
                        </div>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                        {activeVehicle.stockStatus}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Key Specs Bar */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-y border-blue-500/20 py-4 max-w-md mx-auto lg:mx-0 w-full">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">{activeVehicle.rangeKm} km</div>
                    <div className="text-[10px] sm:text-[11px] text-gray-400">Şehir İçi Menzil</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-blue-400 font-['Outfit']">{activeVehicle.topSpeed} km/h</div>
                    <div className="text-[10px] sm:text-[11px] text-gray-400">Azami Hız Limit</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-['Outfit']">2 Saat</div>
                    <div className="text-[10px] sm:text-[11px] text-gray-400">%20-%80 220V Şarj</div>
                  </div>
                </div>

                {/* 4. Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2 sm:pt-4">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 text-white font-bold text-sm px-8 py-4 rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>{settings.ctaButtonText}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/models/${activeVehicle.id}`}
                    className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white font-semibold text-sm px-8 py-4 rounded-2xl border border-blue-500/30 transition-all text-center"
                  >
                    360° Modeli İncele
                  </Link>
                </div>
              </div>

              {/* Right Hero Image Card (DESKTOP ONLY) */}
              <div className="hidden lg:block lg:col-span-6 relative">
                <div className="rounded-3xl glass-panel p-3 border border-blue-500/30 shadow-2xl shadow-blue-950/80 group flex flex-col space-y-3">
                  <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#0F1C38] to-[#080E1C] flex items-center justify-center">
                    <Image
                      src={activeVehicle.images[0] || '/images/karea_official_hero.jpg'}
                      alt={activeVehicle.name}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-700"
                      priority
                    />
                  </div>
                  
                  {/* Clean Price Badge Box Below Car */}
                  <div className="p-4 rounded-2xl bg-[#091122]/95 backdrop-blur-md border border-blue-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-blue-400">{activeVehicle.name} - Başlangıç Fiyatı</div>
                      <div className="text-xl font-bold text-white font-['Outfit']">
                        ₺{activeVehicle.price.toLocaleString('tr-TR')}
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                      {activeVehicle.stockStatus}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ),
    },

    gallery: {
      order: settings.homeOrderGallery ?? 2,
      isVisible: settings.homeShowGallery !== false,
      render: () => (
        <section key="gallery" className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <VehicleGallerySlider vehicleId={activeVehicle.id} />
        </section>
      ),
    },

    calculator: {
      order: settings.homeOrderCalculator ?? 3,
      isVisible: settings.homeShowCalculator !== false && settings.showCalculator !== false,
      render: () => (
        <section key="calculator" className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <CostCalculator />
        </section>
      ),
    },

    configurator: {
      order: settings.homeOrderConfigurator ?? 4,
      isVisible: settings.homeShowConfigurator !== false,
      render: () => (
        <section key="configurator" className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <Vehicle360Viewer vehicle={activeVehicle} />
        </section>
      ),
    },

    features: {
      order: settings.homeOrderFeatures ?? 5,
      isVisible: settings.homeShowFeatures !== false,
      render: () => (
        <section key="features" className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <div className="glass-panel p-4 sm:p-12 rounded-3xl border border-blue-500/20 space-y-8 sm:space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Yenilikçi Mühendislik
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold text-white font-['Outfit']">
                Şehir Ulaşımında Yeni Standart
              </h2>
              <p className="text-gray-300 text-xs sm:text-sm">
                Çelik kafes güvenlik mimarisi, LFP batarya hücre ömrü ve şık kompakt gövdesiyle Karea Fit size tam koruma sunar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="p-4 sm:p-6 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit']">Çelik Kafes Şasi</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Kaza anında maksimum darbe emilimi sağlayan güçlendirilmiş çelik şasi kafesi ile yüksek sürücü güvenliği.
                </p>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit'] font-sans">220V Ev Tipi Şarj</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Özel pahalı istasyonlara ihtiyaç duymadan standart ev prizinden 2 saatte %20’den %80’e pratik şarj imkanı.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Gauge className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">Rejeneratif Fren</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Her fren yaptığınızda açığa çıkan kinetik enerjiyi bataryaya geri depolayarak menzilinizi %15 uzatır.
                </p>
              </div>
            </div>
          </div>
        </section>
      ),
    },
  };

  const sortedSections = Object.values(sectionsMap)
    .filter((sec) => sec.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8 sm:space-y-12 pb-20">
      {sortedSections.map((sec) => sec.render())}

      {/* TEST DRIVE MODAL */}
      <TestDriveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
