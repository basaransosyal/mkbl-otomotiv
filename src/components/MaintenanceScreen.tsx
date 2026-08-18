'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Wrench, Clock, PhoneCall, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';
import { ISiteSettings } from '@/lib/settings';

interface MaintenanceScreenProps {
  settings: ISiteSettings;
}

export default function MaintenanceScreen({ settings }: MaintenanceScreenProps) {
  return (
    <div className="min-h-screen bg-[#050A16] text-white flex flex-col items-center justify-between p-4 sm:p-8 font-sans relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* TOP BRAND HEADER */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between pt-4 relative z-10">
        <div className="h-10 w-auto flex items-center shrink-0">
          <Image
            src="/images/logo.png"
            alt={`${settings.siteName || 'MKBL Otomotiv'} Logo`}
            width={176}
            height={40}
            className="h-10 w-auto object-contain object-left"
            priority
          />
        </div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>BAKIM ÇALIŞMASI MEVCUT</span>
        </div>
      </header>

      {/* CENTER MAINTENANCE CARD */}
      <main className="max-w-2xl w-full mx-auto my-auto text-center space-y-8 relative z-10 py-12">
        {/* Animated Wrench Icon Container */}
        <div className="relative inline-block">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-950 border border-blue-400/30 relative">
            <Wrench className="w-12 h-12 sm:w-14 sm:h-14 text-blue-300 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-lg border-2 border-[#050A16]">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-['Outfit'] tracking-tight">
            {settings.maintenanceTitle || 'Sitemiz Bakımdadır'}
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            {settings.maintenanceSubtitle ||
              'Sizlere daha iyi hizmet verebilmek için sitemizde güncelleme ve bakım çalışmaları yapılmaktadır. En kısa sürede tekrar yayında olacağız.'}
          </p>
        </div>

        {/* Estimated Time Badge */}
        {settings.maintenanceEstimatedTime && (
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-[#0C172E] border border-blue-500/30 text-blue-300 text-xs sm:text-sm font-bold shadow-xl">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{settings.maintenanceEstimatedTime}</span>
          </div>
        )}

        {/* Action Buttons / Showroom Contact */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <a
            href={`tel:${settings.phone || '02423108715'}`}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs shadow-xl shadow-blue-950/50 flex items-center space-x-2 transition-all hover:scale-105"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Müşteri Hizmetleri ({settings.phone || '+90 242 310 87 15'})</span>
          </a>

          <a
            href="https://wa.me/905321234567"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center space-x-2 transition-all"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Canlı Destek</span>
          </a>
        </div>
      </main>

      {/* FOOTER & DISCREET ADMIN LOGIN LINK */}
      <footer className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 pt-6 border-t border-slate-800/80 relative z-10 gap-2">
        <p>{settings.copyrightText || '© 2026 MKBL Otomotiv A.Ş. Tüm hakları saklıdır.'}</p>

        <Link
          href="/mkbl-kontrol-77"
          className="text-gray-400 hover:text-blue-400 flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all"
        >
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Yönetim Paneli Girişi</span>
        </Link>
      </footer>
    </div>
  );
}
