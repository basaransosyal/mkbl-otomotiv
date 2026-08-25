'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, RotateCw, MoveHorizontal, Check, AlertCircle } from 'lucide-react';
import { Vehicle } from '@/lib/data';

export interface ColorOption {
  name: string;
  badge?: string;
  hex: string;
  image?: string;
  angleImages?: string[];
}

interface Vehicle360ViewerProps {
  vehicle?: Vehicle;
  colors?: ColorOption[];
  onColorChange?: (colorName: string) => void;
}

export default function Vehicle360Viewer({ vehicle, colors: customColors, onColorChange }: Vehicle360ViewerProps) {
  const colors = customColors || vehicle?.colors || [];
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState(false);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);

  const currentColor = colors[selectedColorIndex] || colors[0];

  const rawAngleImages = (currentColor?.angleImages && currentColor.angleImages.length > 0)
    ? currentColor.angleImages.filter((img) => img && typeof img === 'string' && img.trim() !== '')
    : (currentColor?.image
        ? [currentColor.image]
        : (vehicle?.images && vehicle.images.length > 0
            ? vehicle.images
            : ['/images/karea_official_hero.jpg']));

  const angleImages = rawAngleImages.length > 0 ? rawAngleImages : ['/images/karea_official_hero.jpg'];
  const totalAngles = angleImages.length;

  useEffect(() => {
    setImageError(false);
  }, [selectedColorIndex, currentAngleIndex]);

  const handleNextAngle = () => {
    setImageError(false);
    setCurrentAngleIndex((prev) => (prev + 1) % totalAngles);
  };

  const handlePrevAngle = () => {
    setImageError(false);
    setCurrentAngleIndex((prev) => (prev - 1 + totalAngles) % totalAngles);
  };

  const handleSelectColor = (index: number) => {
    setSelectedColorIndex(index);
    setCurrentAngleIndex(0);
    setImageError(false);
    if (onColorChange && colors[index]) {
      onColorChange(colors[index].name);
    }
  };

  // TOUCH & MOUSE SWIPE / DRAG HANDLERS FOR 360 INTERACTION
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || totalAngles <= 1) return;
    currentXRef.current = e.touches[0].clientX;
    const diffX = currentXRef.current - startXRef.current;

    if (diffX > 40) {
      handlePrevAngle();
      startXRef.current = currentXRef.current;
    } else if (diffX < -40) {
      handleNextAngle();
      startXRef.current = currentXRef.current;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || totalAngles <= 1) return;
    currentXRef.current = e.clientX;
    const diffX = currentXRef.current - startXRef.current;

    if (diffX > 40) {
      handlePrevAngle();
      startXRef.current = currentXRef.current;
    } else if (diffX < -40) {
      handleNextAngle();
      startXRef.current = currentXRef.current;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="glass-panel p-3.5 sm:p-10 rounded-3xl border border-blue-500/20 space-y-6 sm:space-y-8 select-none">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-xs font-semibold text-blue-400">
            <RotateCw className="w-3.5 h-3.5 animate-spin-slow text-blue-400" />
            <span>360° Etkileşimli Araç Görünümü</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white font-['Outfit'] mt-2">
            Karea Fit Renk & Açı Konfigüratörü
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Renk seçimi yapıp parmağınızla/farenizle kaydırarak ya da oklara basarak aracı 360° inceleyin.
          </p>
        </div>

        {/* Mobile Swipe Guidance Badge */}
        <div className="flex sm:flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300 w-fit">
          <MoveHorizontal className="w-4 h-4 text-blue-400" />
          <span>Sağa / Sola Kaydırarak Çevirin</span>
        </div>
      </div>

      {/* MAIN 360 DISPLAY BOX */}
      <div
        className="relative aspect-[4/3] sm:aspect-[16/9] min-h-[280px] sm:min-h-[420px] w-full max-w-4xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-[#0F1C38] via-[#091122] to-[#040710] border border-blue-500/30 shadow-2xl flex items-center justify-center group cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background Radial Glow */}
        <div className="absolute inset-0 bg-radial-glow opacity-80 pointer-events-none"></div>

        {/* VEHICLE IMAGE DISPLAY OR CLEAN EMPTY STATE */}
        {totalAngles > 0 && !imageError ? (
          <>
            {/* Top Floating Overhead 360 Indicator */}
            <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 z-10 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-blue-500/30 text-[10px] sm:text-[11px] font-semibold text-white flex items-center space-x-1.5">
              <RotateCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
              <span>Açı {currentAngleIndex + 1} / {totalAngles}</span>
            </div>

            {/* Active Color Badge */}
            <div className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4 z-10 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-blue-500/30 text-[10px] sm:text-[11px] font-semibold text-blue-300">
              {currentColor?.badge || currentColor?.name}
            </div>

            <div className="relative w-full h-full p-1 sm:p-6 flex items-center justify-center">
              <Image
                src={angleImages[currentAngleIndex] || angleImages[0]}
                alt={`Karea Fit - ${currentColor?.name || ''} - Açı ${currentAngleIndex + 1}`}
                fill
                className="object-contain p-0.5 sm:p-2 transition-all duration-300 pointer-events-none scale-105 sm:scale-100"
                priority
                onError={() => setImageError(true)}
              />
            </div>

            {totalAngles > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevAngle();
                  }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/70 hover:bg-blue-600/80 text-white flex items-center justify-center border border-white/20 hover:border-blue-400 transition-all backdrop-blur-md shadow-lg"
                  title="Önceki Açı"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextAngle();
                  }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/70 hover:bg-blue-600/80 text-white flex items-center justify-center border border-white/20 hover:border-blue-400 transition-all backdrop-blur-md shadow-lg"
                  title="Sonraki Açı"
                >
                  <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-3 z-10">
            <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-blue-400" />
            </div>
            <div className="font-bold text-white text-sm font-['Outfit']">Görsel Henüz Yüklenmedi</div>
            <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
              "{currentColor?.name || 'Seçilen Renk'}" için henüz 360° açı görseli yüklenmemiştir. Sitede yüklenmeyen hiçbir varsayılan görsel gösterilmez. Admin panelinden yükleyebilirsiniz.
            </p>
          </div>
        )}

        {/* BOTTOM ANGLE PAGINATION DOTS */}
        {totalAngles > 1 && !imageError && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
            {angleImages.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setImageError(false);
                  setCurrentAngleIndex(idx);
                }}
                className={`h-2 rounded-full transition-all ${
                  currentAngleIndex === idx
                    ? 'w-6 bg-blue-400'
                    : 'w-2 bg-gray-600 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* COLOR PICKER SELECTION BUTTONS */}
      {colors.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              GÖVDE RENK SEÇENEKLERİ
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {colors.map((color, index) => {
              const isSelected = selectedColorIndex === index;
              return (
                <button
                  key={index}
                  onClick={() => handleSelectColor(index)}
                  className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105 border border-blue-400'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 hover:text-white'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white/40 shadow-inner shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span>{color.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 ml-1 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
