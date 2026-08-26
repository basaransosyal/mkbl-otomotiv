'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car,
  Calendar,
  Wrench,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Lock,
  ChevronRight,
  Mail,
  Settings,
  FileText,
  Users,
  Crown,
  Eye,
  EyeOff,
  X,
  FileCheck,
  ImageIcon
} from 'lucide-react';
import { Vehicle, TestDriveRequest, ServiceAppointment, ContactMessage } from '../../lib/data';
import { isAdminAuthenticated, setAdminAuth, clearAdminAuth, getLoggedInAdminUser, LoggedInAdminUser } from '../../lib/auth';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<LoggedInAdminUser | null>(null);

  // Forgot password modal states
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [isResetDone, setIsResetDone] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [testDrives, setTestDrives] = useState<TestDriveRequest[]>([]);
  const [services, setServices] = useState<ServiceAppointment[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!forgotEmail) return;

    setIsForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || 'Talep işlenemedi.');
        return;
      }

      setForgotSuccess(data.message || 'Şifre sıfırlama bağlantısı e-postanıza gönderildi!');
    } catch (err) {
      setForgotError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetNewPassword) return;

    setIsForgotLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, newPassword: resetNewPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setForgotError(data.error || 'Şifre sıfırlanamadı.');
        return;
      }

      setIsResetDone(true);
      setPassword(resetNewPassword);
    } catch (err) {
      setForgotError('Şifre güncellenirken hata oluştu.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Check 1-hour session on mount
  useEffect(() => {
    if (isAdminAuthenticated()) {
      setIsAuthenticated(true);
      setCurrentUser(getLoggedInAdminUser());
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!username || !password) {
      setLoginError('Lütfen kullanıcı adı ve şifre girin.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Giriş yapılamadı.');
        return;
      }

      setAdminAuth(data.user);
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      setLoginError('');
    } catch (err) {
      console.error('Login submit error:', err);
      setLoginError('Giriş yapılırken bir hata oluştu.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    clearAdminAuth();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const [vRes, tdRes, sRes, mRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/test-drives'),
        fetch('/api/services'),
        fetch('/api/messages'),
      ]);

      if (vRes.ok) setVehicles(await vRes.json());
      if (tdRes.ok) setTestDrives(await tdRes.json());
      if (sRes.ok) setServices(await sRes.json());
      if (mRes.ok) setMessages(await mRes.json());
    } catch (err) {
      console.error('Fetch admin error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-blue-500/30 text-center space-y-6 shadow-2xl shadow-blue-950/80">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/40">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white font-['Outfit']">
              MKBL Otomotiv Admin Girişi
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Yönetici hesabınız ve şifreniz ile güvenli giriş yapabilirsiniz.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs text-left">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Kullanıcı Adı</label>
              <input
                type="text"
                placeholder="Kullanıcı adınızı girin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0D1527] border border-blue-500/30 rounded-2xl p-3.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-gray-300 font-semibold">Giriş Şifresi</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(true);
                    setForgotError('');
                    setForgotSuccess('');
                    setIsResetDone(false);
                  }}
                  className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline font-semibold"
                >
                  Şifremi Unuttum?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Giriş şifrenizi girin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0D1527] border border-blue-500/30 rounded-2xl p-3.5 pr-10 text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 text-white font-bold py-3.5 rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 transition-all text-sm disabled:opacity-50 mt-2"
            >
              {isLoggingIn ? 'Giriş Yapılıyor...' : 'Yönetici Paneline Giriş Yap'}
            </button>
          </form>
        </div>

        {/* FORGOT PASSWORD MODAL */}
        {isForgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl space-y-5 text-left">
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-['Outfit']">Şifremi Unuttum</h2>
                  <p className="text-[11px] text-gray-400">E-posta adresinize şifre sıfırlama bağlantısı gönderilsin.</p>
                </div>
              </div>

              {forgotError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
                  {forgotError}
                </div>
              )}

              {isResetDone ? (
                <div className="space-y-4 text-center">
                  <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold space-y-2">
                    <p>✅ Şifreniz başarıyla sıfırlandı ve güncellendi!</p>
                    <p className="text-[11px] text-gray-300 font-normal">Yeni şifrenizle hemen giriş yapabilirsiniz.</p>
                  </div>
                  <button
                    onClick={() => setIsForgotModalOpen(false)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs"
                  >
                    Giriş Ekranına Dön
                  </button>
                </div>
              ) : forgotSuccess ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                    {forgotSuccess}
                  </div>

                  <form onSubmit={handleResetPasswordSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Yeni Giriş Şifrenizi Belirleyin</label>
                      <input
                        type="password"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder="Yeni güvenli şifre girin..."
                        required
                        className="w-full bg-[#0D1527] border border-blue-500/30 rounded-xl p-3 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all text-xs"
                    >
                      {isForgotLoading ? 'Şifre Güncelleniyor...' : 'Yeni Şifreyi Kaydet & Onayla'}
                    </button>
                  </form>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Kayıtlı E-Posta Veya Kullanıcı Adı</label>
                    <input
                      type="text"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Örn: admin@mkbloto.com veya admin"
                      required
                      className="w-full bg-[#0D1527] border border-blue-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all text-xs disabled:opacity-50"
                  >
                    {isForgotLoading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const pendingTestDrives = testDrives.filter((td) => td.status === 'BEKLEMEDE').length;
  const pendingServices = services.filter((s) => s.status === 'BEKLEMEDE').length;
  const pendingMessages = messages.filter((m) => m.status === 'BEKLEMEDE').length;
  const isEditor = currentUser?.role === 'EDİTÖR';

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-blue-500/20 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/40 text-purple-300 text-[11px] font-bold mb-2 border border-purple-500/40 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Aktif Oturum: {currentUser?.fullName || 'MKBL Admin'} (@{currentUser?.username || 'admin'})</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-black uppercase ml-1">
              {currentUser?.role || 'SÜPER ADMİN'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
            MKBL Dashboard & Özet İstatistikler
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchMetrics}
            className="p-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-blue-500/20 transition-colors"
            title="Verileri Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>

      {isEditor && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center space-x-3 shadow-md">
          <Lock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-extrabold text-amber-200">👁️ EDİTÖR YETKİ SEVİYESİ:</span> Editör rolündeki kullanıcılar sadece <strong>Formlar ve Talepler</strong> sayfalarına (Test Sürüşü, Servis, İletişim Mesajları) erişebilir. Araç, Sayfa ve Site Ayarlarını değiştirme/silme yetkiniz kapalıdır.
          </div>
        </div>
      )}

      {/* 5 MAIN MANAGEMENT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Vehicles CMS */}
        <Link
          href={isEditor ? '#' : '/admin/vehicles'}
          onClick={(e) => {
            if (isEditor) {
              e.preventDefault();
              alert('Editör rolündeki kullanıcılar Araç Yönetimi sayfasına erişemez.');
            }
          }}
          className={`glass-panel p-6 rounded-3xl border transition-all group space-y-4 relative overflow-hidden ${
            isEditor
              ? 'border-gray-800 opacity-60 cursor-not-allowed'
              : 'border-blue-500/20 hover:border-blue-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
              <Car className="w-6 h-6" />
            </div>
            {isEditor ? (
              <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Erişim Yok</span>
              </span>
            ) : (
              <span className="text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform flex items-center">
                Yönet <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">Araç Yönetimi (CMS)</h3>
            <p className="text-xs text-gray-400 mt-1">Karea Fit modelinin fiyat, stok ve 360° görsellerini yönetin.</p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-gray-400">Model Sayısı:</span>
            <span className="font-bold text-white">{vehicles.length} Model</span>
          </div>
        </Link>

        {/* Card 2: Test Drive Requests */}
        <Link
          href="/admin/test-drives"
          className="glass-panel p-6 rounded-3xl border border-blue-500/20 hover:border-blue-500/50 transition-all group space-y-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform flex items-center">
              İncele <ChevronRight className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">Test Sürüşü Talepleri</h3>
            <p className="text-xs text-gray-400 mt-1">Gelen test sürüşü başvurularını ve müşteri mesajlarını takip edin.</p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-gray-400">Bekleyen Başvuru:</span>
            <span className="font-bold text-amber-400">{pendingTestDrives} Talep</span>
          </div>
        </Link>

        {/* Card 3: Service Appointments */}
        <Link
          href="/admin/services"
          className="glass-panel p-6 rounded-3xl border border-blue-500/20 hover:border-blue-500/50 transition-all group space-y-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
              <Wrench className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform flex items-center">
              İncele <ChevronRight className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">Servis Randevuları</h3>
            <p className="text-xs text-gray-400 mt-1">LFP batarya check-up ve servis randevu kayıtlarını inceleyin.</p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-gray-400">Bekleyen Randevu:</span>
            <span className="font-bold text-emerald-400">{pendingServices} Randevu</span>
          </div>
        </Link>

        {/* Card 4: SHOWROOM MESSAGES MODULE */}
        <Link
          href="/admin/messages"
          className="glass-panel p-6 rounded-3xl border border-blue-500/20 hover:border-blue-500/50 transition-all group space-y-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
              <Mail className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform flex items-center">
              İncele <ChevronRight className="w-4 h-4" />
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">İletişim Mesajları</h3>
            <p className="text-xs text-gray-400 mt-1">Showroom & İletişim sayfasından gelen mesajları ve soruları görün.</p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-gray-400">Gelen Mesajlar:</span>
            <span className="font-bold text-sky-400">{messages.length} Mesaj ({pendingMessages} Okunmadı)</span>
          </div>
        </Link>

        {/* Card 5: KULLANICI & YETKİ YÖNETİMİ MODÜLÜ (SÜPER ADMİN) */}
        <Link
          href={isEditor ? '#' : '/admin/users'}
          onClick={(e) => {
            if (isEditor) {
              e.preventDefault();
              alert('Editör rolündeki kullanıcılar Kullanıcı Yönetimi sayfasına erişemez.');
            }
          }}
          className={`glass-panel p-6 rounded-3xl border transition-all group space-y-4 relative overflow-hidden bg-gradient-to-b from-purple-950/20 to-transparent ${
            isEditor
              ? 'border-gray-800 opacity-60 cursor-not-allowed'
              : 'border-purple-500/30 hover:border-purple-500/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/40">
              <Users className="w-6 h-6" />
            </div>
            {isEditor ? (
              <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Erişim Yok</span>
              </span>
            ) : (
              <span className="text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform flex items-center">
                Kullanıcı Ekle & Yönet <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center space-x-2">
              <span>Kullanıcı & Yetki Yönetimi</span>
              <Crown className="w-4 h-4 text-purple-400" />
            </h3>
            <p className="text-xs text-gray-400 mt-1">Yeni yönetici kullanıcılar ekleyin, şifre belirleyin ve rol yetkisi verin.</p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-gray-400">Süper Admin Yetkisi:</span>
            <span className="font-bold text-purple-300">Tam Kontrol</span>
          </div>
        </Link>

        {/* Card 6: SAYFALAR YÖNETİMİ MODÜLÜ */}
        <Link
          href={isEditor ? '#' : '/admin/pages'}
          onClick={(e) => {
            if (isEditor) {
              e.preventDefault();
              alert('Editör rolündeki kullanıcılar Sayfalar Yönetimi sayfasına erişemez.');
            }
          }}
          className={`glass-panel p-6 rounded-3xl border transition-all group space-y-4 relative overflow-hidden bg-gradient-to-b from-sky-950/20 to-transparent ${
            isEditor
              ? 'border-gray-800 opacity-60 cursor-not-allowed'
              : 'border-sky-500/30 hover:border-sky-500/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-sky-600/20 text-sky-400 flex items-center justify-center border border-sky-500/40">
              <FileText className="w-6 h-6" />
            </div>
            {isEditor ? (
              <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Erişim Yok</span>
              </span>
            ) : (
              <span className="text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform flex items-center">
                İncele & Yönet <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">Sayfalar & SEO Yönetimi</h3>
            <p className="text-xs text-gray-400 mt-1">Sitedeki tüm sayfaların yayın durumunu, URL yapılarını ve SEO meta etiketlerini yönetin.</p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-gray-400">Yönetilen Sayfa:</span>
            <span className="font-bold text-sky-300">Tüm Sayfalar Aktif</span>
          </div>
        </Link>

        {/* Card 7: SITE SETTINGS MODULE */}
        <Link
          href={isEditor ? '#' : '/admin/settings'}
          onClick={(e) => {
            if (isEditor) {
              e.preventDefault();
              alert('Editör rolündeki kullanıcılar Site Ayarları sayfasına erişemez.');
            }
          }}
          className={`glass-panel p-6 rounded-3xl border transition-all group space-y-4 relative overflow-hidden bg-gradient-to-b from-[#0F1C38]/40 to-transparent ${
            isEditor
              ? 'border-gray-800 opacity-60 cursor-not-allowed'
              : 'border-blue-500/20 hover:border-blue-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
              <Settings className="w-6 h-6" />
            </div>
            {isEditor ? (
              <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Erişim Yok</span>
              </span>
            ) : (
              <span className="text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform flex items-center">
                Yapılandır <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">Site Genel Ayarları & CMS</h3>
            <p className="text-xs text-gray-400 mt-1">Header, Footer, Canlı Harita embedi ve Google Pixel kodlarını düzenleyin.</p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-gray-400">Gelişmiş Modül:</span>
            <span className="font-bold text-emerald-400">Tam Kontrol</span>
          </div>
        </Link>

        {/* Card 8: FORM & CONSENT SETTINGS MODULE */}
        <Link
          href={isEditor ? '#' : '/admin/forms'}
          onClick={(e) => {
            if (isEditor) {
              e.preventDefault();
              alert('Editör rolündeki kullanıcılar Form Ayarları sayfasına erişemez.');
            }
          }}
          className={`glass-panel p-6 rounded-3xl border transition-all group space-y-4 relative overflow-hidden bg-gradient-to-b from-teal-950/20 to-transparent ${
            isEditor
              ? 'border-gray-800 opacity-60 cursor-not-allowed'
              : 'border-teal-500/30 hover:border-teal-500/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-teal-600/20 text-teal-400 flex items-center justify-center border border-teal-500/40">
              <FileCheck className="w-6 h-6" />
            </div>
            {isEditor ? (
              <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Erişim Yok</span>
              </span>
            ) : (
              <span className="text-xs font-semibold text-teal-400 group-hover:translate-x-1 transition-transform flex items-center">
                Formları Yapılandır <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">Form Ayarları & Rıza Metinleri</h3>
            <p className="text-xs text-gray-400 mt-1">Formların pop-up onay metinlerini, KVKK, ticari ileti metinlerini ve kurallarını düzenleyin.</p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-gray-400">Pop-up Metinleri:</span>
            <span className="font-bold text-teal-300">Açık Rıza & Ticari Onay</span>
          </div>
        </Link>

        {/* Card 9: DİNAMİK 3D GALERİ KARTLARI YÖNETİMİ */}
        <Link
          href={isEditor ? '#' : '/admin/gallery'}
          onClick={(e) => {
            if (isEditor) {
              e.preventDefault();
              alert('Editör rolündeki kullanıcılar Galeri Yönetimi sayfasına erişemez.');
            }
          }}
          className={`glass-panel p-6 rounded-3xl border transition-all group space-y-4 relative overflow-hidden bg-gradient-to-b from-blue-950/40 to-transparent ${
            isEditor
              ? 'border-gray-800 opacity-60 cursor-not-allowed'
              : 'border-blue-500/30 hover:border-blue-400/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
              <ImageIcon className="w-6 h-6" />
            </div>
            {isEditor ? (
              <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Erişim Yok</span>
              </span>
            ) : (
              <span className="text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform flex items-center">
                Kartları Yönet <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">3D Galeri Kartları Yönetimi</h3>
            <p className="text-xs text-gray-400 mt-1">Araç sayfalarındaki 3D dönen galeri görsellerini, rozetleri ve alt ürün detaylarını yönetin.</p>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-gray-400">Modül Durumu:</span>
            <span className="font-bold text-blue-300">Otomatik & İnteraktif</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
