'use client';

import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  title: string;
  content: string;
}

export default function ConsentModal({
  isOpen,
  onClose,
  onAccept,
  title,
  content,
}: ConsentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel bg-[#0B132B] text-white rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl shadow-blue-950/80 space-y-5 max-h-[85vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Icon */}
        <div className="flex items-center space-x-3.5 border-b border-blue-500/20 pb-4 pr-8 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/40 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
              MKBL Otomotiv Yasal Bilgilendirme
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight font-['Outfit'] mt-0.5">
              {title}
            </h2>
          </div>
        </div>

        {/* Scrollable Text Content Container */}
        <div className="overflow-y-auto pr-2 p-4 rounded-2xl bg-[#0D1527] border border-blue-500/20 text-xs sm:text-sm text-gray-300 leading-relaxed font-sans whitespace-pre-wrap flex-1 scrollbar-thin scrollbar-thumb-blue-600/40 scrollbar-track-transparent">
          {content}
        </div>

        {/* Corporate Blue Accept & Close Button */}
        <div className="pt-2 shrink-0">
          <button
            onClick={() => {
              onAccept();
              onClose();
            }}
            className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 text-white font-bold py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.99] flex items-center justify-center space-x-2"
          >
            <span>Kabul Et ve Kapat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
