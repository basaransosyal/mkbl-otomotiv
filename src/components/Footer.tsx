'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, ShieldCheck, ChevronRight, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
import { ISiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/settings';
import LegalModal from '@/components/LegalModal';

export default function Footer() {
  const [settings, setSettings] = useState<ISiteSettings>(DEFAULT_SITE_SETTINGS);
  const [activeLegalModal, setActiveLegalModal] = useState<{ isOpen: boolean; title: string; content: string }>({
    isOpen: false,
    title: '',
    content: ''
  });

  useEffect(() => {
    const loadSettings = () => {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data === 'object') {
            setSettings((prev) => ({ ...prev, ...data }));
          }
        })
        .catch((err) => console.error('Footer settings fetch error:', err));
    };

    loadSettings();
    window.addEventListener('siteSettingsUpdated', loadSettings);
    return () => window.removeEventListener('siteSettingsUpdated', loadSettings);
  }, []);

  const openLegalModal = (title: string, content: string) => {
    setActiveLegalModal({ isOpen: true, title, content });
  };

  return (
    <>
      <footer className="bg-[#040710] text-gray-400 border-t border-blue-500/20 pt-16 pb-12 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-1 bg-blue-500/40 blur-sm rounded-full"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
            
            {/* Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="inline-block shrink-0">
                <div className="h-10 w-auto flex items-center shrink-0">
                  <Image
                    src="/images/logo.png"
                    alt={`${settings.siteName} Logo`}
                    width={192}
                    height={40}
                    className="h-10 w-auto object-contain object-left"
                  />
                </div>
              </Link>
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                {settings.footerDescription}
              </p>

              {/* Dynamic Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {settings.footerBadge1 && (
                  <div className="px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-500/30 text-[11px] text-gray-300 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                    <span>{settings.footerBadge1}</span>
                  </div>
                )}
                {settings.footerBadge2 && (
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-gray-300">
                    {settings.footerBadge2}
                  </div>
                )}
              </div>

              {/* Social Media Links */}
              <div className="flex items-center space-x-3 pt-2">
                {settings.facebookUrl && (
                  <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white transition-all text-gray-400">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {settings.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-pink-600 hover:text-white transition-all text-gray-400">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {settings.linkedinUrl && (
                  <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-blue-700 hover:text-white transition-all text-gray-400">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {settings.youtubeUrl && (
                  <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-red-600 hover:text-white transition-all text-gray-400">
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-white font-['Outfit'] tracking-wider uppercase mb-4">
                {settings.footerModelLinksTitle}
              </h4>
              <ul className="space-y-2.5 text-xs">
                {settings.footerModelLink1Active !== false && (
                  <li>
                    <Link href={settings.footerModelLink1Url !== undefined ? settings.footerModelLink1Url : '/models/karea-fit'} className="hover:text-blue-400 transition-colors flex items-center space-x-1 font-semibold text-white">
                      <ChevronRight className="w-3 h-3 text-blue-400" />
                      <span>{settings.footerModelLink1 || 'Karea Fit (Teknik Özellikler)'}</span>
                    </Link>
                  </li>
                )}
                {settings.footerModelLink2Active !== false && (
                  <li>
                    <Link href={settings.footerModelLink2Url !== undefined ? settings.footerModelLink2Url : '/models/karea-fit'} className="hover:text-blue-400 transition-colors flex items-center space-x-1">
                      <ChevronRight className="w-3 h-3 text-blue-400" />
                      <span>{settings.footerModelLink2 || '360° Renk Seçenekleri'}</span>
                    </Link>
                  </li>
                )}
                {settings.footerModelLink3Active !== false && (
                  <li>
                    <Link href={settings.footerModelLink3Url !== undefined ? settings.footerModelLink3Url : '/models/karea-fit'} className="hover:text-blue-400 transition-colors flex items-center space-x-1">
                      <ChevronRight className="w-3 h-3 text-blue-400" />
                      <span>{settings.footerModelLink3 || 'Ev Tipi 220V Şarj Gücü'}</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Hizmetler */}
            <div>
              <h4 className="text-sm font-semibold text-white font-['Outfit'] tracking-wider uppercase mb-4">
                {settings.footerServicesTitle}
              </h4>
              <ul className="space-y-2.5 text-xs">
                {settings.footerServiceLink1Active !== false && (
                  <li>
                    <Link href={settings.footerServiceLink1Url !== undefined ? settings.footerServiceLink1Url : '/service'} className="hover:text-blue-400 transition-colors">
                      {settings.footerServiceLink1 || 'Elektrikli Periyodik Bakım'}
                    </Link>
                  </li>
                )}
                {settings.footerServiceLink2Active !== false && (
                  <li>
                    <Link href={settings.footerServiceLink2Url !== undefined ? settings.footerServiceLink2Url : '/service'} className="hover:text-blue-400 transition-colors">
                      {settings.footerServiceLink2 || 'LFP Batarya Health Check-up'}
                    </Link>
                  </li>
                )}
                {settings.footerServiceLink3Active !== false && (
                  <li>
                    <Link href={settings.footerServiceLink3Url !== undefined ? settings.footerServiceLink3Url : '/service'} className="hover:text-blue-400 transition-colors">
                      {settings.footerServiceLink3 || '220V Şarj Güvenlik Kontrolü'}
                    </Link>
                  </li>
                )}
                {settings.footerServiceLink4Active !== false && (
                  <li>
                    <Link href={settings.footerServiceLink4Url !== undefined ? settings.footerServiceLink4Url : '/contact'} className="hover:text-blue-400 transition-colors">
                      {settings.footerServiceLink4 || 'Kepez Showroom & Deneyim'}
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* İletişim */}
            <div>
              <h4 className="text-sm font-semibold text-white font-['Outfit'] tracking-wider uppercase mb-4">
                {settings.footerShowroomTitle}
              </h4>
              <ul className="space-y-3 text-xs">
                <li className="flex items-start space-x-2.5">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{settings.phone}</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{settings.email}</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{settings.workingHours}</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Copyright & Discreet Admin Link (Placed UNDERNEATH copyright text, visible on hover) */}
          <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-500">
            <div className="flex flex-col space-y-1.5 cursor-pointer">
              <p>{settings.copyrightText}</p>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-6 mt-4 sm:mt-0 font-medium items-center">
              <button
                onClick={() => openLegalModal('Gizlilik Politikası', settings.privacyPolicyText)}
                className="hover:text-blue-400 transition-colors cursor-pointer"
              >
                Gizlilik Politikası
              </button>
              <button
                onClick={() => openLegalModal('Kullanım Şartları', settings.termsOfUseText)}
                className="hover:text-blue-400 transition-colors cursor-pointer"
              >
                Kullanım Şartları
              </button>
              <button
                onClick={() => openLegalModal('KVKK Aydınlatma Metni', settings.kvkkText)}
                className="hover:text-blue-400 transition-colors cursor-pointer"
              >
                KVKK Aydınlatma
              </button>
              <button
                onClick={() => window.dispatchEvent(new Event('openCookieSettings'))}
                className="hover:text-blue-400 text-sky-400 transition-colors cursor-pointer flex items-center space-x-1 font-bold"
              >
                <span>Çerez Tercihleri</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* POP-UP LEGAL MODAL */}
      <LegalModal
        isOpen={activeLegalModal.isOpen}
        onClose={() => setActiveLegalModal((prev) => ({ ...prev, isOpen: false }))}
        title={activeLegalModal.title}
        content={activeLegalModal.content}
      />
    </>
  );
}
