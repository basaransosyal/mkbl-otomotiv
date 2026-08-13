'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, Image as ImageIcon, Eye } from 'lucide-react';
import { GallerySlideItem } from '@/lib/data';

interface VehicleGallerySliderProps {
  vehicleId?: string;
  initialSlides?: GallerySlideItem[];
  title?: string;
  subtitle?: string;
}

export default function VehicleGallerySlider({
  vehicleId,
  initialSlides,
  title = 'Fotoğraf & Özellik Galerisi',
  subtitle = 'Sürücü odaklı tasarım, gelişmiş teknoloji ve detayları keşfetmek için kartları sağa/sola kaydırın.',
}: VehicleGallerySliderProps) {
  const [slides, setSlides] = useState<GallerySlideItem[]>(initialSlides || []);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(!initialSlides);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);

  // Drag & Swipe states
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch published slides
  const fetchSlides = useCallback(async () => {
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data: GallerySlideItem[] = await res.json();
        let published = (data || []).filter(
          (s) =>
            s.isPublished !== false &&
            (!vehicleId || !s.vehicleId || s.vehicleId === vehicleId || vehicleId.includes(s.vehicleId) || s.vehicleId.includes(vehicleId))
        );
        if (published.length === 0) {
          published = (data || []).filter((s) => s.isPublished !== false);
        }
        if (published.length > 0) {
          setSlides(published);
        }
      }
    } catch (err) {
      console.error('Fetch gallery slides error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  // Next & Prev slide handlers
  const handleNext = useCallback(() => {
    if (slides.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    if (slides.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Autoplay Logic
  const startAutoplay = useCallback(() => {
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    autoPlayTimerRef.current = setInterval(() => {
      handleNext();
    }, 3500);
  }, [handleNext]);

  const stopAutoplay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  }, []);

  const triggerUserInteraction = useCallback(() => {
    setIsInteracting(true);
    stopAutoplay();

    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      setIsInteracting(false);
      startAutoplay();
    }, 4000);
  }, [startAutoplay, stopAutoplay]);

  useEffect(() => {
    if (!isInteracting && slides.length > 1) {
      startAutoplay();
    }
    return () => {
      stopAutoplay();
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [isInteracting, slides.length, startAutoplay, stopAutoplay]);

  // Mouse / Touch Drag Handlers
  const handleDragStart = (clientX: number) => {
    triggerUserInteraction();
    isDraggingRef.current = true;
    setDragStartX(clientX);
    setDragOffset(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDraggingRef.current || dragStartX === null) return;
    const diff = clientX - dragStartX;
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (Math.abs(dragOffset) > 40) {
      if (dragOffset < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setDragStartX(null);
    setDragOffset(0);
  };

  if (isLoading) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center text-gray-400 space-y-3 border border-blue-500/20">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-xs">Galeri yükleniyor...</p>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-blue-500/20 relative overflow-hidden space-y-8 select-none">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2 relative z-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Modeller & Donanım Detayları</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl mx-auto">
          {subtitle}
        </p>
      </div>

      {/* 3D CAROUSEL CONTAINER */}
      <div
        className="relative w-full py-8 min-h-[480px] sm:min-h-[520px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
      >
        <div className="relative w-full max-w-5xl h-[420px] sm:h-[460px] flex items-center justify-center perspective-[1200px]">
          {slides.map((slide, index) => {
            // Calculate relative offset from activeIndex
            const count = slides.length;
            let offset = (index - activeIndex + count) % count;
            if (offset > count / 2) offset -= count;

            // Distance calculation
            const absOffset = Math.abs(offset);
            const isActive = offset === 0;

            // Compute 3D Styles
            const translateX = offset * 260 + (isActive ? dragOffset * 0.3 : 0);
            const scale = isActive ? 1.05 : Math.max(0.75, 1 - absOffset * 0.15);
            const opacity = isActive ? 1 : Math.max(0.2, 1 - absOffset * 0.35);
            const zIndex = 30 - absOffset * 10;
            const rotateY = offset * -12;

            // Hide cards beyond 2 steps away
            if (absOffset > 2 && count > 4) return null;

            return (
              <div
                key={slide.id}
                onClick={() => {
                  triggerUserInteraction();
                  setActiveIndex(index);
                }}
                className={`absolute transition-all duration-500 ease-out transform-gpu rounded-3xl overflow-hidden glass-panel border ${
                  isActive
                    ? 'border-blue-400 shadow-2xl shadow-blue-500/30'
                    : 'border-blue-500/20 hover:border-blue-400/40 cursor-pointer'
                }`}
                style={{
                  transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                  opacity: opacity,
                  zIndex: zIndex,
                  width: 'min(90vw, 360px)',
                  height: '420px',
                }}
              >
                {/* Image Section */}
                <div className="relative w-full h-[250px] sm:h-[270px] bg-[#0A1122]">
                  <Image
                    src={slide.imageUrl || '/images/karea_official_1.jpg'}
                    alt={slide.title}
                    fill
                    sizes="(max-width: 768px) 90vw, 360px"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority={isActive}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080D1A] via-transparent to-transparent opacity-90"></div>

                  {/* Top Badge */}
                  {slide.subtitle && (
                    <div className="absolute top-3 left-3 bg-[#080D1A]/80 backdrop-blur-md text-blue-400 border border-blue-500/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {slide.subtitle}
                    </div>
                  )}
                </div>

                {/* Content Section (Attached below card) */}
                <div className="p-5 bg-[#080D1A]/95 border-t border-blue-500/20 space-y-2 flex flex-col justify-between h-[150px]">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit'] line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {slide.title}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-3 mt-1">
                      {slide.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-gray-400">
                    {slide.tagText && slide.tagText.trim() ? (
                      <span className="flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="line-clamp-1">{slide.tagText}</span>
                      </span>
                    ) : (
                      <span></span>
                    )}
                    <span className="text-blue-400 font-semibold shrink-0 ml-2">{index + 1} / {slides.length}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER CONTROLS & PAGINATION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-blue-500/20 relative z-10">
        {/* Pagination Dots */}
        <div className="flex items-center space-x-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                triggerUserInteraction();
                setActiveIndex(i);
              }}
              className={`transition-all duration-300 rounded-full ${
                i === activeIndex
                  ? 'w-8 h-2.5 bg-gradient-to-r from-blue-500 to-sky-400 shadow-md shadow-blue-500/40'
                  : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
              }`}
              title={`Slayt ${i + 1}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              triggerUserInteraction();
              handlePrev();
            }}
            className="w-10 h-10 rounded-full bg-blue-950/80 hover:bg-blue-600/30 text-white border border-blue-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
            title="Önceki Slayt (Sol)"
          >
            <ChevronLeft className="w-5 h-5 text-blue-400" />
          </button>

          <span className="text-xs text-gray-400 font-mono">
            {activeIndex + 1} / {slides.length}
          </span>

          <button
            onClick={() => {
              triggerUserInteraction();
              handleNext();
            }}
            className="w-10 h-10 rounded-full bg-blue-950/80 hover:bg-blue-600/30 text-white border border-blue-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
            title="Sonraki Slayt (Sağ)"
          >
            <ChevronRight className="w-5 h-5 text-blue-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
