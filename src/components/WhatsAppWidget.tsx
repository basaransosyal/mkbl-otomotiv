'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { ISiteSettings } from '@/lib/settings';

export default function WhatsAppWidget() {
  const [settings, setSettings] = useState<ISiteSettings | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [quickOptions, setQuickOptions] = useState<string[]>([]);

  const loadSettings = () => {
    fetch('/api/settings?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setSettings(data);
          if (!message) {
            setMessage(data.whatsappMessage || 'Merhaba! Karea Fit elektrikli araçlar hakkında bilgi almak istiyorum.');
          }
          if (data.whatsappQuickOptions) {
            try {
              const parsed = typeof data.whatsappQuickOptions === 'string' 
                ? JSON.parse(data.whatsappQuickOptions) 
                : data.whatsappQuickOptions;
              if (Array.isArray(parsed)) setQuickOptions(parsed);
            } catch (e) {
              setQuickOptions([
                '🚗 Karea Fit Test Sürüşü',
                '💰 Fiyat Teklifi Al',
                '📍 Showroom Konumu',
                '🔧 Servis Randevusu',
              ]);
            }
          }
        }
      })
      .catch(() => null);
  };

  useEffect(() => {
    loadSettings();

    const handleSettingsUpdated = () => {
      loadSettings();
    };

    const handleLivePreview = (e: CustomEvent) => {
      if (e.detail) {
        setSettings((prev) => (prev ? { ...prev, ...e.detail } : e.detail));
      }
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdated as EventListener);
    window.addEventListener('siteSettingsUpdated', handleSettingsUpdated as EventListener);
    window.addEventListener('liveWhatsAppPreview', handleLivePreview as EventListener);

    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdated as EventListener);
      window.removeEventListener('siteSettingsUpdated', handleSettingsUpdated as EventListener);
      window.removeEventListener('liveWhatsAppPreview', handleLivePreview as EventListener);
    };
  }, []);

  // Determine active status cleanly (boolean or string check)
  const isWidgetActive = settings?.whatsappActive === true || settings?.whatsappActive === ('true' as any);

  // Hide widget if not active or settings not loaded yet
  if (!settings || !isWidgetActive) {
    return null;
  }

  const phone = settings.whatsappPhone ? String(settings.whatsappPhone).replace(/[^0-9]/g, '') : '905321234567';
  const title = settings.whatsappTitle || 'Kepez Showroom Canlı Destek';
  const subtitle = settings.whatsappSubtitle || 'Size nasıl yardımcı olabiliriz?';
  const isLeft = settings.whatsappPosition === 'bottom-left';

  const handleSend = (textToSend?: string) => {
    const finalMsg = textToSend || message || 'Merhaba!';
    const encoded = encodeURIComponent(finalMsg);
    const whatsappUrl = `https://wa.me/${phone}?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        left: isLeft ? '24px' : 'auto',
        right: isLeft ? 'auto' : '24px',
        zIndex: 9999,
      }}
      className="select-none font-sans transition-all duration-300"
    >
      {/* POPUP CHAT DIALOG - COMPACT ZERO-SCROLL UI */}
      {isOpen && (
        <div className="mb-3 w-[330px] sm:w-[370px] rounded-3xl bg-[#0b1329]/95 backdrop-blur-xl border border-emerald-500/30 shadow-2xl shadow-emerald-950/60 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-250">
          {/* COMPACT HEADER */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-between relative overflow-hidden">
            <div className="flex items-center space-x-3 relative z-10">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-300 border-2 border-[#0b1329] rounded-full animate-pulse"></span>
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white tracking-wide">{title}</h4>
                <p className="text-[10px] text-emerald-100/90 font-medium flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping"></span>
                  <span>MKBL Otomotiv • Çevrimiçi</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-all relative z-10"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-lg pointer-events-none"></div>
          </div>

          {/* CHAT BODY - ALL VISIBLE WITHOUT ANY SCROLLBAR */}
          <div className="p-4 space-y-3">
            {/* Compact Welcome Bubble */}
            <div className="px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-gray-200">
              <p className="text-gray-300 leading-snug">
                {subtitle} Hazır konulardan seçin veya mesajınızı aşağıya yazıp anında gönderin.
              </p>
            </div>

            {/* Quick Options 2x2 Grid */}
            {quickOptions.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 block px-0.5">
                  Hızlı Konular
                </span>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {quickOptions.slice(0, 4).map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setMessage(opt);
                        handleSend(opt);
                      }}
                      className="text-left px-2.5 py-2 rounded-xl bg-[#111a36] hover:bg-emerald-900/40 border border-slate-700/60 hover:border-emerald-500/50 text-[11px] text-gray-200 hover:text-emerald-300 font-medium transition-all flex items-center justify-between group shadow-sm"
                    >
                      <span className="truncate pr-1">{opt}</span>
                      <Send className="w-3 h-3 text-gray-400 group-hover:text-emerald-400 transition-all flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Message Textarea & Prominent Send Button */}
            <div className="space-y-2 pt-0.5">
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mesajınızı yazın..."
                className="w-full bg-[#070d1c] border border-slate-700/80 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all resize-none font-sans"
              ></textarea>
              <button
                onClick={() => handleSend()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center space-x-2 active:scale-98"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp'ta Sohbet Başlat</span>
              </button>
            </div>
          </div>

          {/* FOOTER BADGE */}
          <div className="px-4 py-2 bg-[#070c18] border-t border-slate-800 text-[10px] text-gray-400 text-center flex items-center justify-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Yanıt Süresi: Genellikle Birkaç Dakika İçi</span>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center space-x-3 p-3.5 sm:p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.45)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.55)] hover:scale-105 active:scale-95 transition-all duration-300"
        title="Canlı WhatsApp Desteği"
      >
        {/* Pulsing ring (Tight spread, original opacity, 20% slower rhythm) */}
        <span 
          style={{ animationDuration: '2.4s' }}
          className="absolute -inset-0.5 rounded-full bg-emerald-500/40 animate-ping opacity-75 group-hover:opacity-100"
        ></span>

        <MessageCircle className="w-7 h-7 text-white relative z-10" />
        
        {/* Text Badge for desktop */}
        <span className="hidden sm:inline-block font-extrabold text-xs tracking-wider pr-1 relative z-10 text-white">
          Canlı WhatsApp Desteği
        </span>

        {/* Unread dot */}
        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 border-2 border-[#0B0F17] rounded-full z-20"></span>
      </button>
    </div>
  );
}
