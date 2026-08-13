'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ShieldCheck, ChevronRight, ChevronDown, Car } from 'lucide-react';
import TestDriveModal from './TestDriveModal';
import { Vehicle } from '@/lib/data';
import { ISiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/settings';

export default function Navbar() {
  const [settings, setSettings] = useState<ISiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelsDropdownOpen, setModelsDropdownOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setModelsDropdownOpen(true);
  };

  const handleDropdownMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setModelsDropdownOpen(false);
    }, 200);
  };

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.log('Navbar settings fetch error:', err));
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/vehicles')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVehicles(data);
        }
      })
      .catch((err) => console.log('Vehicles fetch error:', err));
  }, [pathname]);

  // Only published vehicles appear in the public dropdown
  const publishedVehicles = vehicles.filter((v) => v.isPublished !== false);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#080D1A]/95 backdrop-blur-xl border-b border-blue-500/20 py-3 shadow-2xl shadow-blue-950/40'
            : 'bg-gradient-to-b from-[#080D1A]/90 via-[#080D1A]/50 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group shrink-0">
              <div className="h-10 w-auto flex items-center shrink-0 transition-transform group-hover:scale-105">
                <Image
                  src="/images/logo.png"
                  alt="MKBL Otomotiv Logo"
                  width={192}
                  height={40}
                  priority
                  className="h-10 w-auto object-contain object-left"
                />
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-blue-950/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-blue-500/20">
              {/* Ana Sayfa */}
              {settings.navHomeActive !== false && (
                <Link
                  href="/"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    pathname === '/'
                      ? 'bg-blue-600/25 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {settings.navHomeText || 'Ana Sayfa'}
                </Link>
              )}

              {/* MODELLER DROPDOWN BUTTON (HOVER & CLICK TRIGGERED) */}
              {settings.navModelsActive !== false && (
                <div
                  className="relative group"
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                >
                  <button
                    onClick={() => setModelsDropdownOpen(!modelsDropdownOpen)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-1.5 ${
                      pathname.startsWith('/models')
                        ? 'bg-blue-600/25 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/20'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{settings.navModelsText || 'Modeller'}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        modelsDropdownOpen ? 'rotate-180 text-blue-400' : 'text-gray-400'
                      }`}
                    />
                  </button>

                  {/* MODELLER DROPDOWN MENU */}
                  {modelsDropdownOpen && (
                    <div className="absolute top-full left-0 pt-2 w-72 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="glass-panel rounded-2xl p-2 border border-blue-500/30 shadow-2xl shadow-black/80">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 px-3 py-1.5 border-b border-white/5 mb-1">
                          Elektrikli Araç Modelleri
                        </div>

                        {publishedVehicles.length > 0 ? (
                          publishedVehicles.map((v) => (
                            <Link
                              key={v.id}
                              href={`/models/${v.id}`}
                              onClick={() => setModelsDropdownOpen(false)}
                              className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-blue-600/20 hover:border-blue-500/30 border border-transparent transition-all group/item"
                            >
                              <div className="relative w-12 h-8 rounded-lg overflow-hidden bg-[#0A1122] shrink-0 border border-white/10 group-hover/item:border-blue-400">
                                <Image
                                  src={v.images[0] || '/images/karea_official_hero.jpg'}
                                  alt={v.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-white group-hover/item:text-blue-400 transition-colors truncate">
                                  {v.name}
                                </div>
                                <div className="text-[10px] text-gray-400 truncate">
                                  ₺{v.price.toLocaleString('tr-TR')} • {v.rangeKm} km
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover/item:text-blue-400 group-hover/item:translate-x-0.5 transition-all" />
                            </Link>
                          ))
                        ) : (
                          <div className="p-3 text-center text-xs text-gray-400">
                            Yayında olan model bulunamadı.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Servis & Bakım (Only rendered if both module switch & link active are true) */}
              {settings.showServiceModule !== false && settings.navServiceActive !== false && (
                <Link
                  href="/service"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    pathname === '/service'
                      ? 'bg-blue-600/25 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {settings.navServiceText || 'Servis & Bakım'}
                </Link>
              )}

              {/* Showroom & İletişim */}
              {settings.navContactActive !== false && (
                <Link
                  href="/contact"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    pathname === '/contact'
                      ? 'bg-blue-600/25 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {settings.navContactText || 'Showroom & İletişim'}
                </Link>
              )}
            </nav>

            {/* Right Action Buttons */}
            {settings.navCtaButtonActive !== false && (
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 text-white font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center space-x-1.5"
                >
                  <span>{settings.navCtaButtonText || 'Teklif & Sürüş Randevusu Al'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <div className="flex md:hidden items-center space-x-2">
              {settings.navCtaButtonActive !== false && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 text-white font-semibold text-[11px] px-3 py-1.5 rounded-full shadow-md shadow-blue-500/30"
                >
                  Test Sürüşü
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-300 hover:text-white rounded-lg focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-b border-blue-500/20 px-4 pt-3 pb-6 mt-3 space-y-3">
            {settings.navHomeActive !== false && (
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5"
              >
                {settings.navHomeText || 'Ana Sayfa'}
              </Link>
            )}

            {/* Mobile Models Expandable */}
            {settings.navModelsActive !== false && (
              <div className="space-y-1 pl-3 border-l-2 border-blue-500/30">
                <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                  {settings.navModelsText || 'Modeller'}
                </div>
                {publishedVehicles.map((v) => (
                  <Link
                    key={v.id}
                    href={`/models/${v.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-1.5 rounded-lg text-xs text-white hover:bg-blue-600/20"
                  >
                    {v.name}
                  </Link>
                ))}
              </div>
            )}

            {settings.showServiceModule !== false && settings.navServiceActive !== false && (
              <Link
                href="/service"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5"
              >
                {settings.navServiceText || 'Servis & Bakım'}
              </Link>
            )}

            {settings.navContactActive !== false && (
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5"
              >
                {settings.navContactText || 'Showroom & İletişim'}
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Test Drive Booking Popup Modal */}
      <TestDriveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
