'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BatteryCharging, Gauge, Zap, Check, ChevronRight, Shield } from 'lucide-react';
import TestDriveModal from '../../components/TestDriveModal';
import { Vehicle, INITIAL_VEHICLES } from '../../lib/data';

export default function ModelsPage() {
  const [vehicle, setVehicle] = useState<Vehicle>(INITIAL_VEHICLES[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/vehicles')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setVehicle(data[0]);
        }
      })
      .catch((err) => console.log('Fetch vehicles error:', err));
  }, []);

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          MKBL Otomotiv Elektrikli Araç Modeli
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit']">
          İdeal Şehir Aracı Karea Fit
        </h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          Tek model, on renk, sıfır karmaşa. Ev tipi 220V prizden şarj olabilen, kompakt boyutlarıyla park sorunu yaşatmayan %100 elektrikli Karea Fit'i keşfedin.
        </p>
      </div>

      {/* Single Vehicle Hero Card */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-blue-500/30 shadow-2xl shadow-blue-950/50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Image */}
          <div className="lg:col-span-7 relative">
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#0A1122]">
              <Image
                src={vehicle.images[0] || '/images/hero.jpg'}
                alt={vehicle.name}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-blue-950/80 backdrop-blur-md text-blue-400 border border-blue-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase">
                İdeal Şehir Aracı
              </div>
              <div className="absolute top-4 right-4 bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-3 py-1 rounded-full">
                {vehicle.stockStatus}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold text-white font-['Outfit']">{vehicle.name}</h2>
              <p className="text-sm text-gray-300 mt-1">{vehicle.tagline}</p>
            </div>

            {/* Price Badge */}
            <div className="p-4 rounded-2xl bg-[#0C1427] border border-blue-500/30">
              <span className="text-xs text-gray-400 block">Anahtar Teslim Fiyatı</span>
              <span className="text-3xl font-extrabold text-blue-400 font-['Outfit']">
                ₺{vehicle.price.toLocaleString('tr-TR')}
              </span>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0C1427] border border-white/5">
                <div className="text-gray-400 text-[10px]">Menzil</div>
                <div className="font-bold text-white text-sm">{vehicle.rangeKm} km</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0C1427] border border-white/5">
                <div className="text-gray-400 text-[10px]">Azami Hız</div>
                <div className="font-bold text-blue-400 text-sm">{vehicle.topSpeed} km/s</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0C1427] border border-white/5">
                <div className="text-gray-400 text-[10px]">220V Şarj Süresi</div>
                <div className="font-bold text-emerald-400 text-xs truncate">
                  %20-%80 2 Saat
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0C1427] border border-white/5">
                <div className="text-gray-400 text-[10px]">Batarya Kapasitesi</div>
                <div className="font-bold text-white text-xs">
                  9.98 kWh LFP
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/models/karea-fit"
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs py-3.5 rounded-xl border border-blue-500/30 transition-colors text-center"
              >
                Detaylı İncele & Renkler
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-sky-400 text-white font-bold text-xs py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all text-center"
              >
                Test Sürüşü Al
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
      <TestDriveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preselectedVehicleId={vehicle.id}
        preselectedVehicleName={vehicle.name}
      />
    </div>
  );
}
