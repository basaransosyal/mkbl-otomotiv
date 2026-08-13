'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Users,
  UserPlus,
  ShieldCheck,
  Crown,
  KeyRound,
  Edit,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  RefreshCw,
  X,
  Save,
  Check,
  Search,
  UserCheck,
  ShieldAlert,
  Sparkles,
  Info,
  Car,
  Headphones,
  Wrench,
  Briefcase
} from 'lucide-react';
import { getLoggedInAdminUser, LoggedInAdminUser } from '@/lib/auth';

export interface AdminUserItem {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  password?: string;
  role: string;
  title?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [currentUser, setCurrentUser] = useState<LoggedInAdminUser | null>(null);

  // Modals state
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // New User Form State
  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    role: 'SATIŞ',
    title: 'Satış Danışmanı',
    isActive: true,
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    setCurrentUser(getLoggedInAdminUser());
  }, []);

  const isCurrentSuperAdmin = currentUser?.role === 'SÜPER ADMİN';

  const handleToggleActive = async (user: AdminUserItem) => {
    const isTargetSuper = user.role === 'SÜPER ADMİN' || user.username === 'admin';
    if (isTargetSuper && !isCurrentSuperAdmin) {
      alert('Süper Admin kullanıcısının hesabını sadece Süper Admin askıya alabilir veya aktif edebilir!');
      return;
    }

    const newStatus = !user.isActive;
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, isActive: newStatus, requesterRole: currentUser?.role }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u))
        );
      }
    } catch (err) {
      console.error('Toggle user status error:', err);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!newUser.username || !newUser.fullName || !newUser.password) {
      setErrorMessage('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUser, requesterRole: currentUser?.role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Kullanıcı eklenemedi.');
        return;
      }

      setIsAddModalOpen(false);
      setNewUser({
        username: '',
        fullName: '',
        email: '',
        password: '',
        role: 'SATIŞ',
        title: 'Satış Danışmanı',
        isActive: true,
      });
      fetchUsers();
    } catch (err) {
      console.error('Add user error:', err);
      setErrorMessage('Kullanıcı kaydedilirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingUser, requesterRole: currentUser?.role }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Güncelleme yapılamadı.');
        return;
      }

      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Update user error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (user: AdminUserItem) => {
    const isTargetSuper = user.role === 'SÜPER ADMİN' || user.username === 'admin';
    if (isTargetSuper) {
      alert('Süper Admin hesabı silinemez!');
      return;
    }
    if (!confirm(`"${user.fullName}" kullanıcısını silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Delete user error:', err);
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.title && u.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterRole === 'ALL') return matchesSearch;
    return matchesSearch && u.role === filterRole;
  });

  if (currentUser?.role === 'EDİTÖR') {
    return (
      <div className="pt-32 pb-20 max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white font-['Outfit']">Sayfa Erişim Yetkisi Sınırlı</h1>
          <p className="text-xs text-gray-300 leading-relaxed">
            Editör rolündeki kullanıcılar sadece <strong>Formlar ve Talepler</strong> sayfalarına erişebilir. Kullanıcı yönetimi üzerinde düzenleme ve silme yetkiniz bulunmamaktadır.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-400 text-white text-xs font-bold shadow-lg"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Ana Kontrol Paneline Dön</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-blue-500/20 pb-6">
        <div>
          <Link
            href="/admin/settings"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-blue-600/30 text-gray-300 hover:text-white border border-blue-500/30 transition-all text-xs font-semibold shadow-md mb-3"
          >
            <ChevronLeft className="w-4 h-4 text-blue-400" />
            <span>Geri (CMS Ayarlarına Dön)</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold text-white font-['Outfit'] flex items-center space-x-3">
              <Users className="w-8 h-8 text-purple-400" />
              <span>Kullanıcı, Ünvan & Otomatik E-Posta Yönlendirme Paneli</span>
            </h1>
            <span className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/40 text-xs font-bold">
              {users.length} Kayıtlı Kullanıcı
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Satış, SSH ve Müşteri İlişkileri kullanıcıları ekleyerek gelen formların otomatik ilgili birimin e-postasına düşmesini sağlayın.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 via-blue-600 to-sky-400 text-white font-bold text-xs px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Yeni Kullanıcı & Ünvan Ekle</span>
          </button>

          <button
            onClick={fetchUsers}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-blue-500/20 transition-colors"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* FORM E-MAIL ROUTING ROLE KILAVUZU BANNER */}
      <div className="glass-panel p-5 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-blue-950/20 to-transparent grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="flex items-start space-x-3 p-3 rounded-2xl bg-blue-600/10 border border-blue-500/30">
          <Car className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-blue-300 block">SATIŞ Rolü (Test Sürüşü)</span>
            <p className="text-[11px] text-gray-300 mt-0.5">
              Siteden gönderilen tüm <strong>Test Sürüşü</strong> randevu formları bu roldeki kullanıcının e-postasına yönlendirilir.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3 rounded-2xl bg-amber-600/10 border border-amber-500/30">
          <Wrench className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 block">SSH Rolü (Servis Randevusu)</span>
            <p className="text-[11px] text-gray-300 mt-0.5">
              Siteden gönderilen tüm <strong>Yetkili Servis Bakım</strong> randevuları SSH rolündeki kullanıcının e-postasına düşer.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3 rounded-2xl bg-purple-600/10 border border-purple-500/30">
          <Headphones className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-purple-300 block">MÜŞTERİ İLİŞKİLERİ Rolü</span>
            <p className="text-[11px] text-gray-300 mt-0.5">
              Sitedeki <strong>İletişim Formu</strong> mesajları doğrudan Müşteri İlişkileri rolündeki personelin e-postasına iletilir.
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="glass-panel p-4 rounded-2xl border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="İsim, ünvan, kullanıcı adı veya e-posta ara..."
            className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-gray-400 mr-1">Birim / Rol:</span>
          <button
            onClick={() => setFilterRole('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterRole === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            Tümü ({users.length})
          </button>
          <button
            onClick={() => setFilterRole('SATIŞ')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterRole === 'SATIŞ'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            🚗 Satış ({users.filter((u) => u.role === 'SATIŞ').length})
          </button>
          <button
            onClick={() => setFilterRole('SSH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterRole === 'SSH'
                ? 'bg-amber-600 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            🔧 SSH ({users.filter((u) => u.role === 'SSH').length})
          </button>
          <button
            onClick={() => setFilterRole('MÜŞTERİ İLİŞKİLERİ')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterRole === 'MÜŞTERİ İLİŞKİLERİ'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            🎧 Müşteri İlşk. ({users.filter((u) => u.role === 'MÜŞTERİ İLİŞKİLERİ').length})
          </button>
        </div>
      </div>

      {/* USERS TABLE GRID */}
      <div className="glass-panel rounded-3xl p-6 border border-blue-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0D1527] text-gray-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Kullanıcı & Ünvan Bilgileri</th>
                <th className="p-4">Kullanıcı Adı / Giriş</th>
                <th className="p-4">Form Yönlendirme Rolü</th>
                <th className="p-4">Hesap Durumu</th>
                <th className="p-4">E-Posta Adresi</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => {
                const isSuper = u.role === 'SÜPER ADMİN';
                return (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    {/* User Info & Title */}
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                            isSuper
                              ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                              : u.role === 'SATIŞ'
                              ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                              : u.role === 'SSH'
                              ? 'bg-amber-600/20 border-amber-500/40 text-amber-300'
                              : u.role === 'MÜŞTERİ İLİŞKİLERİ'
                              ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                              : 'bg-gray-800 border-gray-700 text-gray-300'
                          }`}
                        >
                          {isSuper ? (
                            <Crown className="w-5 h-5 text-purple-400" />
                          ) : (
                            u.fullName.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center space-x-2">
                            <span>{u.fullName}</span>
                          </div>
                          <div className="text-[11px] text-sky-400 font-semibold flex items-center space-x-1 mt-0.5">
                            <Briefcase className="w-3 h-3 text-sky-400" />
                            <span>{u.title || 'Ünvan Belirtilmedi'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="p-4 font-mono text-blue-400 font-bold">
                      @{u.username}
                    </td>

                    {/* Role Badge */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border shadow-sm ${
                          isSuper
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : u.role === 'SATIŞ'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : u.role === 'SSH'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : u.role === 'MÜŞTERİ İLİŞKİLERİ'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        }`}
                      >
                        {isSuper && <Crown className="w-3 h-3 text-purple-400" />}
                        {u.role === 'SATIŞ' && <Car className="w-3 h-3 text-blue-400" />}
                        {u.role === 'SSH' && <Wrench className="w-3 h-3 text-amber-400" />}
                        {u.role === 'MÜŞTERİ İLİŞKİLERİ' && <Headphones className="w-3 h-3 text-purple-400" />}
                        <span>{u.role}</span>
                      </span>
                    </td>

                    {/* Active Status */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                          u.isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                        }`}
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>{u.isActive ? 'AKTİF HESAP' : 'PASİF (ENGELLİ)'}</span>
                      </button>
                    </td>

                    {/* Email */}
                    <td className="p-4 font-mono text-gray-300 text-[11px]">
                      {u.email ? (
                        <span className="text-emerald-400 font-bold">{u.email}</span>
                      ) : (
                        <span className="text-gray-500 italic">Tanımlanmadı</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      {isSuper && !isCurrentSuperAdmin ? (
                        <span
                          className="px-3 py-1.5 bg-purple-500/10 text-purple-300 rounded-lg text-[11px] font-bold border border-purple-500/20 inline-flex items-center space-x-1"
                          title="Süper Admin kullanıcısını sadece Süper Admin düzenleyebilir."
                        >
                          <Lock className="w-3.5 h-3.5 text-purple-400" />
                          <span>Süper Admin Korumalı</span>
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingUser(u)}
                            className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors text-xs font-semibold inline-flex items-center space-x-1 border border-blue-500/30"
                            title="Ünvan, Rol ve Şifre Düzenle"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Ünvan & Rol Düzenle</span>
                          </button>

                          {u.username !== 'admin' && u.role !== 'SÜPER ADMİN' && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Kullanıcıyı Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD NEW USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-white font-['Outfit'] mb-6 flex items-center space-x-2">
              <UserPlus className="w-6 h-6 text-purple-400" />
              <span>Yeni Yetkili Kullanıcı & Ünvan Ekle</span>
            </h2>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Ad Soyad *</label>
                  <input
                    type="text"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    placeholder="Örn: Ahmet Yılmaz"
                    required
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Kurumsal Ünvan (Job Title) *</label>
                  <input
                    type="text"
                    value={newUser.title}
                    onChange={(e) => setNewUser({ ...newUser, title: e.target.value })}
                    placeholder="Örn: Satış Yöneticisi, SSH Uzmanı vb."
                    required
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-sky-300 font-semibold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Kullanıcı Adı (Giriş) *</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="Örn: ahmetyilmaz"
                    required
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-blue-400 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">E-Posta Adresi (Bildirim Alıcısı) *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Örn: ahmet@mkbloto.com"
                    required
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Giriş Şifresi Belirle *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Güvenli giriş şifresi girin..."
                    required
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 pr-10 text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Kullanıcı Rolü & E-Posta Yönlendirme *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-[#0D1527] border border-purple-500/30 rounded-xl p-3 text-purple-300 font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="SATIŞ">🚗 SATIŞ (Test Sürüşü Formu E-Postalarını Alır)</option>
                  <option value="SSH">🔧 SSH (Servis Randevusu E-Postalarını Alır)</option>
                  <option value="MÜŞTERİ İLİŞKİLERİ">🎧 MÜŞTERİ İLİŞKİLERİ (İletişim Formu E-Postalarını Alır)</option>
                  <option value="YÖNETİCİ">🛡️ YÖNETİCİ (Araçlar, Randevular & Sayfalar)</option>
                  <option value="SÜPER ADMİN">👑 SÜPER ADMİN (Tam Yetkili Yönetici)</option>
                  <option value="EDİTÖR">✏️ EDİTÖR (Kısıtlı İçerik Yönetimi)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-sky-400 text-white font-bold hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Kullanıcıyı Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-white font-['Outfit'] mb-6 flex items-center space-x-2">
              <Edit className="w-6 h-6 text-blue-400" />
              <span>Ünvan, Rol ve Şifre Düzenle: {editingUser.fullName}</span>
            </h2>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Kurumsal Ünvan (Job Title)</label>
                  <input
                    type="text"
                    value={editingUser.title || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, title: e.target.value })}
                    placeholder="Örn: Satış Yöneticisi, SSH Uzmanı vb."
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-sky-300 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Kullanıcı Adı</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-blue-400 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">E-Posta Adresi (Bildirim Alıcısı)</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    placeholder="Örn: ahmet@mkbloto.com"
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Yeni Giriş Şifresi Belirle</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={editingUser.password || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    placeholder="Şifreyi değiştirmek için yeni değer girin (değişmeyecekse boş bırakın)..."
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 pr-10 text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Kullanıcı Rolü & E-Posta Yönlendirmesi</span>
                  {!isCurrentSuperAdmin && (
                    <span className="text-[10px] text-amber-400 font-normal">
                      (Sadece Süper Admin rol değiştirebilir)
                    </span>
                  )}
                </label>
                <select
                  value={editingUser.role}
                  disabled={!isCurrentSuperAdmin}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full bg-[#0D1527] border border-blue-500/30 rounded-xl p-3 text-blue-300 font-bold focus:outline-none focus:border-blue-500 disabled:opacity-50 cursor-not-allowed"
                >
                  <option value="SATIŞ">🚗 SATIŞ (Test Sürüşü Formu E-Postalarını Alır)</option>
                  <option value="SSH">🔧 SSH (Servis Randevusu E-Postalarını Alır)</option>
                  <option value="MÜŞTERİ İLİŞKİLERİ">🎧 MÜŞTERİ İLİŞKİLERİ (İletişim Formu E-Postalarını Alır)</option>
                  <option value="YÖNETİCİ">🛡️ YÖNETİCİ (Araçlar, Randevular & Sayfalar)</option>
                  <option value="SÜPER ADMİN">👑 SÜPER ADMİN (Tam Yetkili Yönetici)</option>
                  <option value="EDİTÖR">✏️ EDİTÖR (Kısıtlı İçerik Yönetimi)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-white/10">
                <label className="flex items-center space-x-2 text-gray-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingUser.isActive}
                    onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Kullanıcı Hesabı Aktif Olsun</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-400 text-white font-bold hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Bilgileri & Rolü Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
