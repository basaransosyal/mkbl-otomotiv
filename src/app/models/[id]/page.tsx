'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BatteryCharging,
  Gauge,
  Zap,
  CheckCircle2,
  ChevronLeft,
  Calendar,
  Shield,
  Sparkles,
  Info,
  PhoneCall,
  Building2
} from 'lucide-react';
import TestDriveModal from '../../../components/TestDriveModal';
import Vehicle360Viewer from '../../../components/Vehicle360Viewer';
import CostCalculator from '../../../components/CostCalculator';
import VehicleGallerySlider from '../../../components/VehicleGallerySlider';
import BankCard from '../../../components/BankCard';
import { Vehicle, INITIAL_VEHICLES } from '../../../lib/data';
import { ISiteSettings, DEFAULT_SITE_SETTINGS } from '../../../lib/settings';

const FULL_DEFAULT_FEATURES = [
  'Çelik Kafes Şasi Güvenlik Yapısı',
  '3.3 kW/s Ev Tipi Standart 220V Priz Şarjı (%20-%80 2 Saat)',
  '90 km/s Azami Hız & 135 km Şehir İçi Menzil',
  'İklimlendirme Kliması & PTC Isıtıcı',
  'Rejeneratif Frenleme (Enerji Geri Kazanımı)',
  'Elektrik Destekli Direksiyon & Hidrolik Disk Fren',
  'Geri Görüş Kamerası & Park Sensörü',
  'Dokunmatik Multimedya Ekran & Bluetooth',
  'Elektrikli Camlar & Uzaktan Kumandalı Merkezi Kilit',
  '2 Koltuk / 3 Kapı / 184 Litre Bagaj Hacmi'
];

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [settings, setSettings] = useState<ISiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customBlocks, setCustomBlocks] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.log('Settings fetch error:', err));
  }, []);

  useEffect(() => {
    fetch(`/api/vehicles/${params.id}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Vehicle not found');
      })
      .then((data) => {
        setVehicle(data);
      })
      .catch(() => {
        fetch('/api/vehicles')
          .then((res) => res.json())
          .then((list) => {
            if (Array.isArray(list) && list.length > 0) {
              const matched = list.find((v) => v.id === params.id) || list[0];
              setVehicle(matched);
            } else {
              setVehicle(INITIAL_VEHICLES[0]);
            }
          })
          .catch(() => setVehicle(INITIAL_VEHICLES[0]));
      });

    // Check if CustomPage has custom blocks for this model
    fetch('/api/pages')
      .then((res) => res.json())
      .then((pagesList: any[]) => {
        if (Array.isArray(pagesList)) {
          const targetId = params.id.toLowerCase();
          const match = pagesList.find((p: any) => {
            const pPath = (p.path || '').toLowerCase();
            const pSlug = (p.slug || '').toLowerCase();
            const pTitle = (p.title || '').toLowerCase();
            return (
              pPath === `/models/${targetId}` ||
              pPath.endsWith(`/${targetId}`) ||
              pSlug === `model-${targetId}` ||
              pSlug === targetId ||
              targetId.includes(pSlug.replace('model-', '')) ||
              (vehicle && (
                pPath.includes(vehicle.id.toLowerCase()) ||
                pSlug.includes(vehicle.id.toLowerCase()) ||
                pTitle.includes(vehicle.name.toLowerCase())
              ))
            );
          });

          if (match && match.content) {
            try {
              const parsed = JSON.parse(match.content);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setCustomBlocks(parsed);
              }
            } catch (e) {}
          }
        }
      })
      .catch(() => {});
  }, [params.id, vehicle]);

  if (!vehicle) {
    return (
      <div className="pt-32 pb-20 text-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <span>Araç detayları yükleniyor...</span>
      </div>
    );
  }

  const featuresList =
    vehicle.features && vehicle.features.length >= 6
      ? vehicle.features
      : FULL_DEFAULT_FEATURES;

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Back Button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-400 hover:text-blue-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Ana Sayfaya Dön</span>
        </Link>
      </div>

      {/* Top Header & Pricing Summary (Only rendered if no custom hero block exists) */}
      {!customBlocks.some((b: any) => b.type === 'hero') && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-blue-500/20 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              MKBL OTOMOTİV GÜVENCESİYLE %100 ELEKTRİKLİ
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Outfit'] mt-1">
              {vehicle.name}
            </h1>
            <p className="text-gray-300 text-sm sm:text-base mt-1">{vehicle.tagline}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/30 flex items-center space-x-6">
            <div>
              <span className="text-xs text-gray-400 block">Anahtar Teslim Fiyatı</span>
              <span className="text-3xl font-extrabold text-blue-400 font-['Outfit']">
                ₺{vehicle.price.toLocaleString('tr-TR')}
              </span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-sky-400 text-white font-bold text-xs px-6 py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer"
            >
              Test Sürüşü Al
            </button>
          </div>
        </div>
      )}

      {/* IF CUSTOM VISUAL BUILDER BLOCKS EXIST */}
      {customBlocks.length > 0 ? (
        <div className="grid grid-cols-12 gap-6">
          {customBlocks.map((block: any, index: number) => {
            const bgClass =
              block.bgTheme === 'emerald'
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : block.bgTheme === 'glass'
                ? 'bg-[#0D1527]/80 backdrop-blur-xl border-blue-500/20'
                : block.bgTheme === 'slate'
                ? 'bg-[#091122] border-slate-700/60'
                : 'bg-transparent border-transparent';

            const roundedClass =
              block.borderRadius === 'lg' ? 'rounded-xl' : 'rounded-3xl';
            const paddingClass =
              block.paddingSize === 'small'
                ? 'p-4 sm:p-5'
                : block.paddingSize === 'large'
                ? 'p-8 sm:p-12'
                : 'p-6 sm:p-8';
            const colSpanClass =
              block.width === 'half'
                ? 'col-span-12 md:col-span-6'
                : block.width === 'third'
                ? 'col-span-12 md:col-span-4'
                : block.width === 'twothirds'
                ? 'col-span-12 md:col-span-8'
                : 'col-span-12';

            return (
              <div
                key={block.id || index}
                className={`${colSpanClass} ${paddingClass} ${roundedClass} border shadow-xl transition-all duration-300 ${bgClass}`}
              >
                {/* HERO BANNER */}
                {block.type === 'hero' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-4">
                    <div className="lg:col-span-7 space-y-4">
                      <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-xs font-semibold text-blue-400">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>{block.title || 'MKBL OTOMOTİV GÜVENCESİYLE %100 ELEKTRİKLİ'}</span>
                      </div>
                      <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-['Outfit'] tracking-tight">
                        {block.heading || vehicle.name}
                      </h2>
                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                        {block.text || vehicle.tagline}
                      </p>
                      <div className="grid grid-cols-3 gap-3 border-y border-blue-500/20 py-3">
                        <div>
                          <div className="text-xl font-extrabold text-white font-['Outfit']">{vehicle.rangeKm} km</div>
                          <div className="text-[10px] text-gray-400">Şehir İçi Menzil</div>
                        </div>
                        <div>
                          <div className="text-xl font-extrabold text-blue-400 font-['Outfit']">{vehicle.topSpeed} km/h</div>
                          <div className="text-[10px] text-gray-400">Azami Hız Limit</div>
                        </div>
                        <div>
                          <div className="text-xl font-extrabold text-emerald-400 font-['Outfit']">2 Saat</div>
                          <div className="text-[10px] text-gray-400">%20-%80 220V Şarj</div>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-5 relative">
                      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden glass-panel p-2 border border-blue-500/30 shadow-xl bg-gradient-to-b from-[#0F1C38] to-[#080E1C]">
                        <img
                          src={(vehicle.images && vehicle.images[0]) || '/images/karea_official_hero.jpg'}
                          alt={vehicle.name}
                          className="w-full h-full object-contain p-2"
                        />
                        <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-[#091122]/90 backdrop-blur-md border border-blue-500/30 flex items-center justify-between">
                          <div>
                            <div className="text-[9px] uppercase font-semibold text-blue-400">{vehicle.name} - BAŞLANGIÇ FİYATI</div>
                            <div className="text-base font-bold text-white font-['Outfit']">
                              ₺{vehicle.price.toLocaleString('tr-TR')}
                            </div>
                          </div>
                          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            {vehicle.stockStatus || 'STOKTA'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 360 COLOR CONFIGURATOR */}
                {block.type === 'configurator360' && (
                  <div className="space-y-4">
                    {block.heading && (
                      <h2 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-white">
                        {block.heading}
                      </h2>
                    )}
                    <Vehicle360Viewer vehicle={vehicle} colors={vehicle.colors} />
                  </div>
                )}

                {/* 3D PHOTO GALLERY */}
                {block.type === 'gallery360' && (
                  <div className="space-y-4">
                    {block.heading && (
                      <h2 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-white">
                        {block.heading}
                      </h2>
                    )}
                    <VehicleGallerySlider vehicleId={vehicle.id} />
                  </div>
                )}

                {/* OFFICIAL SPECS TABLE */}
                {block.type === 'specsTable' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white font-['Outfit'] flex items-center space-x-2">
                      <Info className="w-5 h-5 text-blue-400" />
                      <span>{block.heading || 'Resmi Teknik Bilgiler'}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm divide-y md:divide-y-0 divide-white/5">
                      <div className="space-y-4">
                        <div className="flex justify-between py-2.5 border-b border-white/5">
                          <span className="text-gray-400">Peak Motor Gücü</span>
                          <span className="font-semibold text-white">{vehicle.motorPower || '12 kW (Peak Motor Gücü)'}</span>
                        </div>
                        <div className="flex justify-between py-2.5 border-b border-white/5">
                          <span className="text-gray-400">Batarya Tipi & Kapasitesi</span>
                          <span className="font-semibold text-blue-400">{vehicle.battery || '9.98 kWh LFP (Lityum Demir Fosfat)'}</span>
                        </div>
                        <div className="flex justify-between py-2.5 border-b border-white/5">
                          <span className="text-gray-400">Şehir İçi Menzil</span>
                          <span className="font-semibold text-blue-400">{vehicle.rangeKm} km</span>
                        </div>
                        <div className="flex justify-between py-2.5 border-b border-white/5">
                          <span className="text-gray-400">Azami Hız</span>
                          <span className="font-semibold text-white">{vehicle.topSpeed} km/h</span>
                        </div>
                        <div className="flex justify-between py-2.5 border-b border-white/5">
                          <span className="text-gray-400">Ehliyet Tipi</span>
                          <span className="font-semibold text-emerald-400">{vehicle.licenseType || 'B / B1 (16 Yaş ve Üzeri)'}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between py-2.5 border-b border-white/5">
                          <span className="text-gray-400">Boyutlar (U x G x Y)</span>
                          <span className="font-semibold text-white">{vehicle.dimensions || '2.631 mm x 1.498 mm x 1.621 mm'}</span>
                        </div>
                        <div className="flex justify-between py-2.5 border-b border-white/5">
                          <span className="text-gray-400">Şarj Alım Gücü</span>
                          <span className="font-semibold text-emerald-400">{vehicle.chargePower || '3,3 kW/s Ev Tipi 220V'}</span>
                        </div>
                        <div className="flex justify-between py-2.5 border-b border-white/5">
                          <span className="text-gray-400">Şarj Süresi (%20 - %80)</span>
                          <span className="font-semibold text-emerald-400">{vehicle.chargeTime || '%20’den %80’e 2 Saat (3.3 kW/s Ev Tipi 220V Priz)'}</span>
                        </div>
                        <div className="flex justify-between py-2.5 border-b border-white/5">
                          <span className="text-gray-400">Kapı / Koltuk / Bagaj</span>
                          <span className="font-semibold text-white">{vehicle.capacityDetails || '3 Kapı / 2 Koltuk / 184 L'}</span>
                        </div>
                        <div className="flex justify-between py-2.5 border-b border-white/5">
                          <span className="text-gray-400">Jant Çapı</span>
                          <span className="font-semibold text-white">{vehicle.rimSize || '13 inç Alaşım Jant'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* COST CALCULATOR */}
                {block.type === 'calculator' && (
                  <CostCalculator initialSettings={settings || undefined} />
                )}

                {/* FEATURES GRID */}
                {block.type === 'featuresGrid' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white font-['Outfit']">
                      {block.heading || 'Donanım ve Teknik Özellikler'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {featuresList.map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/10 flex items-center space-x-3"
                        >
                          <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                          <span className="text-xs text-gray-200 font-medium">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VIP TEST DRIVE CARD */}
                {block.type === 'testDriveCard' && (
                  <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/40 text-center space-y-4">
                    <h3 className="text-2xl font-extrabold text-white font-['Outfit']">
                      {block.heading || `${vehicle.name} VIP Test Sürüşü`}
                    </h3>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs shadow-xl cursor-pointer"
                    >
                      Test Sürüşü Randevusu Alın
                    </button>
                  </div>
                )}

                {/* BANK CARD */}
                {block.type === 'bank' && (
                  <BankCard bank={{
                    bankName: 'Garanti BBVA',
                    branchName: 'Antalya Ticaret Şubesi',
                    branchCode: '014',
                    accountNo: '6203060 (TL)',
                    iban: 'TR25 0006 2000 0140 0006 2030 60',
                    accountHolder: 'BAŞARAN OTOMOTİV OTELCİLİK TURİZM İNŞ. A.Ş.',
                    logoBg: 'from-[#008752] to-[#005c38]',
                  }} />
                )}

                {/* TEXT BLOCK */}
                {block.type === 'text' && (
                  <div className="space-y-3">
                    {block.heading && (
                      <h2 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-white">
                        {block.heading}
                      </h2>
                    )}
                    {block.text && (
                      <div
                        className="text-gray-300 text-sm leading-relaxed whitespace-pre-line"
                        dangerouslySetInnerHTML={{ __html: block.text }}
                      ></div>
                    )}
                  </div>
                )}

                {/* IMAGE BLOCK */}
                {block.type === 'image' && block.imageUrl && (
                  <div className="space-y-2">
                    <img
                      src={block.imageUrl}
                      alt={block.caption || vehicle.name}
                      className="w-full h-auto object-cover rounded-2xl max-h-[500px]"
                    />
                    {block.caption && (
                      <p className="text-center text-xs text-gray-400 italic">{block.caption}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* DEFAULT HIGH-END MODEL LAYOUT */
        <>
          {/* 360 DEGREE INTERACTIVE COLOR & ANGLE VIEWER COMPONENT */}
          <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-blue-500/30 shadow-2xl shadow-blue-950/50">
            <Vehicle360Viewer vehicle={vehicle} colors={vehicle.colors} />
          </div>

          {/* 3D DYNAMIC GALLERY SLIDER COMPONENT */}
          <VehicleGallerySlider vehicleId={vehicle.id} />

          {/* Official Technical Specifications Table from karea.com */}
          <div className="glass-panel rounded-3xl p-8 border border-blue-500/20 space-y-6">
            <h2 className="text-2xl font-bold text-white font-['Outfit'] flex items-center space-x-2">
              <Info className="w-5 h-5 text-blue-400" />
              <span>Resmi Teknik Bilgiler (Karea.com Verileri)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm divide-y md:divide-y-0 divide-white/5">
              <div className="space-y-4">
                <div className="flex justify-between py-2.5 border-b border-white/5">
                  <span className="text-gray-400">Peak Motor Gücü</span>
                  <span className="font-semibold text-white">{vehicle.motorPower || '12 kW (Peak Motor Gücü)'}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-white/5">
                  <span className="text-gray-400">Batarya Tipi & Kapasitesi</span>
                  <span className="font-semibold text-blue-400">{vehicle.battery || '9.98 kWh LFP (Lityum Demir Fosfat)'}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-white/5">
                  <span className="text-gray-400">Şehir İçi Menzil</span>
                  <span className="font-semibold text-blue-400">{vehicle.rangeKm} km</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-white/5">
                  <span className="text-gray-400">Azami Hız</span>
                  <span className="font-semibold text-white">{vehicle.topSpeed} km/h</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-white/5">
                  <span className="text-gray-400">Ehliyet Tipi</span>
                  <span className="font-semibold text-emerald-400">{vehicle.licenseType || 'B / B1 (16 Yaş ve Üzeri)'}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-2.5 border-b border-white/5">
                  <span className="text-gray-400">Boyutlar (U x G x Y)</span>
                  <span className="font-semibold text-white">{vehicle.dimensions || '2.631 mm x 1.498 mm x 1.621 mm'}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-white/5">
                  <span className="text-gray-400">Şarj Alım Gücü</span>
                  <span className="font-semibold text-emerald-400">{vehicle.chargePower || '3,3 kW/s Ev Tipi 220V'}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-white/5">
                  <span className="text-gray-400">Şarj Süresi (%20 - %80)</span>
                  <span className="font-semibold text-emerald-400">{vehicle.chargeTime || '%20’den %80’e 2 Saat (3.3 kW/s Ev Tipi 220V Priz)'}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-white/5">
                  <span className="text-gray-400">Kapı / Koltuk / Bagaj</span>
                  <span className="font-semibold text-white">{vehicle.capacityDetails || '3 Kapı / 2 Koltuk / 184 L'}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-white/5">
                  <span className="text-gray-400">Jant Çapı</span>
                  <span className="font-semibold text-white">{vehicle.rimSize || '13 inç Alaşım Jant'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* COST SAVINGS CALCULATOR SECTION */}
          {settings.showCalculator !== false && (
            <div className="pt-2">
              <CostCalculator />
            </div>
          )}

          {/* Equipment & Features List */}
          <div className="glass-panel rounded-3xl p-8 border border-blue-500/20 space-y-6">
            <h2 className="text-2xl font-bold text-white font-['Outfit'] flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span>Konfor, Güvenlik & Teknoloji Donanımları</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {featuresList.map((feat, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/10 flex items-center space-x-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                  <span className="text-xs text-gray-200 font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Test Drive Modal */}
      <TestDriveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preselectedVehicleId={vehicle.id}
        preselectedVehicleName={vehicle.name}
      />
    </div>
  );
}
