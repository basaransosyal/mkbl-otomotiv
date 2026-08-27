'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PiggyBank, Plug, Fuel, Zap, Edit2 } from 'lucide-react';
import { ISiteSettings } from '@/lib/settings';

interface CostCalculatorProps {
  initialSettings?: Partial<ISiteSettings>;
}

export default function CostCalculator({ initialSettings }: CostCalculatorProps) {
  const [monthlyKm, setMonthlyKm] = useState(1200);

  // Editable price inputs
  const [electricityInput, setElectricityInput] = useState('2.75');
  const [gasInput, setGasInput] = useState('44.50');

  // Calculator config
  const [calcTitle, setCalcTitle] = useState('Benzine Karşı Katlarca Yakıt Tasarrufu');
  const [calcSubtitle, setCalcSubtitle] = useState('Aylık ortalama kaç kilometre yol yaptığınızı seçin, MKBL Karea Fit ile her yıl ne kadar tasarruf edeceğinizi hesaplayın.');
  const [evConsump, setEvConsump] = useState(7.4);
  const [gasConsump, setGasConsump] = useState(7.5);

  // Live rates info
  const [liveDataInfo, setLiveDataInfo] = useState<{ isLive: boolean; lastUpdated: string; sourceName: string } | null>(null);

  useEffect(() => {
    // 1. Fetch site settings for title and custom consumptions
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          if (data.calcTitle) setCalcTitle(data.calcTitle);
          if (data.calcSubtitle) setCalcSubtitle(data.calcSubtitle);
          if (data.defaultEvConsump) setEvConsump(data.defaultEvConsump);
          if (data.defaultGasConsump) setGasConsump(data.defaultGasConsump);
          if (data.defaultElectricityRate) setElectricityInput(String(data.defaultElectricityRate));
          if (data.defaultGasPrice) setGasInput(String(data.defaultGasPrice));
        }
      })
      .catch((err) => console.log('Cost calculator settings fetch error:', err));

    // 2. Fetch daily live fuel & electricity rates from API
    fetch('/api/fuel-rates')
      .then((res) => res.json())
      .then((fuelData) => {
        if (fuelData && typeof fuelData === 'object') {
          if (fuelData.electricityRate) setElectricityInput(String(fuelData.electricityRate));
          if (fuelData.gasolinePrice) setGasInput(String(fuelData.gasolinePrice));
          setLiveDataInfo({
            isLive: fuelData.isLive,
            lastUpdated: fuelData.lastUpdated,
            sourceName: fuelData.sourceName,
          });
        }
      })
      .catch((err) => console.log('Live fuel rates fetch error:', err));
  }, []);

  // Parse numeric values (support both comma and dot)
  const parsePrice = (strVal: string, fallback: number): number => {
    if (!strVal) return fallback;
    const normalized = strVal.replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) || parsed < 0 ? fallback : parsed;
  };

  const electricityRate = parsePrice(electricityInput, 2.75);
  const gasPrice = parsePrice(gasInput, 44.50);

  // Math Calculations
  const monthlyEvCost = (monthlyKm / 100) * evConsump * electricityRate;
  const monthlyGasCost = (monthlyKm / 100) * gasConsump * gasPrice;
  const monthlySavings = Math.max(0, monthlyGasCost - monthlyEvCost);
  const yearlySavings = monthlySavings * 12;

  // Percentage along slider track (min: 200, max: 3000)
  const minKm = 200;
  const maxKm = 3000;
  const percentage = Math.min(100, Math.max(0, ((monthlyKm - minKm) / (maxKm - minKm)) * 100));

  // Handler for custom price inputs (limit 3 digits integer + 2 decimals)
  const handlePriceChange = (val: string, setter: (v: string) => void) => {
    let cleaned = val.replace(/[^0-9.,]/g, '');
    const parts = cleaned.split(/[.,]/);
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[0] && parts[0].length > 3) {
      parts[0] = parts[0].slice(0, 3);
    }
    if (parts[1] && parts[1].length > 2) {
      parts[1] = parts[1].slice(0, 2);
    }
    const finalVal = parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
    setter(finalVal);
  };

  return (
    <div className="glass-panel rounded-3xl p-3.5 sm:p-10 px-3 sm:px-10 border border-blue-500/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="space-y-6 sm:space-y-8">
        {/* TOP HEADER TITLE */}
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Karea Fit 220V Ev Şarj Hesaplayıcı</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            {calcTitle}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {calcSubtitle}
          </p>
        </div>

        {/* RESPONSIVE FLEX/GRID: MOBILE HAS SAVINGS BOX FIRST, DESKTOP HAS SLIDER LEFT & SAVINGS RIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* SAVINGS BOX (FIRST ON MOBILE ORDER-1, RIGHT ON DESKTOP ORDER-2) */}
          <div className="order-1 lg:order-2 lg:col-span-5 w-full">
            <div className="p-4 sm:p-8 px-4 sm:px-8 rounded-3xl bg-gradient-to-b from-blue-950/80 via-[#0A1224] to-[#050914] border border-blue-500/40 text-center space-y-5 sm:space-y-6 shadow-2xl relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <PiggyBank className="w-6 h-6" />
              </div>

              <div>
                <div className="text-[11px] sm:text-xs uppercase font-semibold tracking-widest text-emerald-400">Tahmini Yıllık Tasarrufunuz</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit'] mt-1">
                  ₺{Math.round(yearlySavings).toLocaleString('tr-TR')}
                </div>
                <div className="text-xs text-blue-300 mt-1">
                  Aylık Yakıt Tasarrufu: <strong>₺{Math.round(monthlySavings).toLocaleString('tr-TR')}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-2 border-t border-white/10 text-xs">
                <div className="p-2.5 sm:p-3 rounded-xl bg-blue-950/40 border border-blue-500/20">
                  <div className="flex items-center justify-center space-x-1 text-blue-400 font-semibold mb-1 text-[11px] sm:text-xs">
                    <Plug className="w-3.5 h-3.5" />
                    <span>220V Karea Fit</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white font-mono">
                    ₺{Math.round(monthlyEvCost).toLocaleString('tr-TR')}/ay
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl bg-red-950/20 border border-red-500/20">
                  <div className="flex items-center justify-center space-x-1 text-red-400 font-semibold mb-1 text-[11px] sm:text-xs">
                    <Fuel className="w-3.5 h-3.5" />
                    <span>Benzinli Araç</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-gray-300 font-mono">
                    ₺{Math.round(monthlyGasCost).toLocaleString('tr-TR')}/ay
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDER & CUSTOM PRICE INPUTS (SECOND ON MOBILE ORDER-2, LEFT ON DESKTOP ORDER-1) */}
          <div className="order-2 lg:order-1 lg:col-span-7 space-y-6 w-full">
            
            {/* CUSTOM VEHICLE SLIDER TRACK */}
            <div className="space-y-4 p-4 sm:p-6 px-4 sm:px-6 rounded-3xl bg-[#0D1527] border border-blue-500/20 relative">
              <div className="flex items-center justify-between text-xs sm:text-sm min-h-[40px] gap-2">
                <span className="text-gray-300 font-semibold shrink-0 whitespace-nowrap">Aylık Sürüş Mesafesi:</span>
                <span className="text-xl sm:text-2xl font-extrabold text-blue-400 font-['Outfit'] font-mono whitespace-nowrap shrink-0 min-w-[110px] text-right">
                  {monthlyKm.toLocaleString('tr-TR')} km
                </span>
              </div>

              {/* CUSTOM CAR THUMB SLIDER CONTAINER */}
              <div className="relative w-full py-5">
                {/* Track Background */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-3 bg-[#080E1C] rounded-full border border-blue-500/30 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 rounded-full transition-all duration-75"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                {/* DYNAMIC KAREA FIT CAR THUMB HANDLE */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-75 filter drop-shadow-[0_4px_16px_rgba(0,240,255,0.6)]"
                  style={{ left: `${percentage}%` }}
                >
                  <div className="relative w-20 h-14 sm:w-24 sm:h-16 hover:scale-110 transition-transform">
                    <Image
                      src="/images/karea_slider_car.png"
                      alt="MKBL Karea Fit Car Thumb"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>

                {/* HTML5 RANGE INPUT */}
                <input
                  type="range"
                  min={minKm}
                  max={maxKm}
                  step={50}
                  value={monthlyKm}
                  onChange={(e) => setMonthlyKm(Number(e.target.value))}
                  className="relative z-30 w-full h-10 opacity-0 cursor-grab active:cursor-grabbing"
                />
              </div>

              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>200 km</span>
                <span>1.500 km</span>
                <span>3.000 km</span>
              </div>
            </div>

            {/* LIVE DATA HEADER & EDITABLE PRICE INPUTS FOR ELECTRICITY & GASOLINE */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  {liveDataInfo?.isLive ? (
                    <>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 tracking-wide uppercase">
                        Güncel Canlı Piyasa Verileri
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                      </span>
                      <span className="text-[11px] font-bold text-rose-500 tracking-wide uppercase">
                        Güncel Piyasa Verileri (Deaktif - Veri Güncel Değildir)
                      </span>
                    </>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 italic">
                  {liveDataInfo?.isLive
                    ? `Son Güncelleme: ${liveDataInfo?.lastUpdated || new Date().toLocaleDateString('tr-TR')}`
                    : 'Varsayılan Sabit Tarifeler'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Electricity Rate Input */}
                <div className="p-4 rounded-2xl bg-[#0D1527] border border-blue-500/30 space-y-1.5 shadow-lg">
                  <label className="block text-gray-300 font-semibold flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-blue-400 font-bold">
                      <Plug className="w-3.5 h-3.5" />
                      <span>Elektrik Fiyatı (TL/kWh)</span>
                    </span>
                    <span className="text-[10px] text-gray-400 hover:text-white flex items-center space-x-1 cursor-pointer bg-white/5 px-2 py-0.5 rounded-md">
                      <Edit2 className="w-2.5 h-2.5" />
                      <span>Düzenleyin</span>
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      value={electricityInput}
                      onChange={(e) => handlePriceChange(e.target.value, setElectricityInput)}
                      placeholder="3.25"
                      className="w-full bg-[#080E1C] border border-blue-500/40 rounded-xl py-2.5 px-3.5 text-white font-mono font-extrabold text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <span className="absolute right-3 text-xs text-blue-400 font-mono font-bold">₺ / kWh</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="text-blue-300/80 font-medium">EPDK Ev Faturası (KDV + Dağıtım Dahil)</span>
                  </div>
                </div>

                {/* Gasoline Price Input */}
                <div className="p-4 rounded-2xl bg-[#0D1527] border border-red-500/30 space-y-1.5 shadow-lg">
                  <label className="block text-gray-300 font-semibold flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-red-400 font-bold">
                      <Fuel className="w-3.5 h-3.5" />
                      <span>Benzin Fiyatı (TL/Litre)</span>
                    </span>
                    <span className="text-[10px] text-gray-400 hover:text-white flex items-center space-x-1 cursor-pointer bg-white/5 px-2 py-0.5 rounded-md">
                      <Edit2 className="w-2.5 h-2.5" />
                      <span>Düzenleyin</span>
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      value={gasInput}
                      onChange={(e) => handlePriceChange(e.target.value, setGasInput)}
                      placeholder="67.00"
                      className="w-full bg-[#080E1C] border border-red-500/40 rounded-xl py-2.5 px-3.5 text-white font-mono font-extrabold text-sm focus:outline-none focus:border-red-500 transition-colors"
                    />
                    <span className="absolute right-3 text-xs text-red-400 font-mono font-bold">₺ / Litre</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="text-red-300/80 font-medium">Akaryakıt Pompa Fiyatı (KDV + ÖTV Dahil)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
