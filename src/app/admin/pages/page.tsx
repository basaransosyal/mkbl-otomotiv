'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Search,
  CheckCircle,
  Globe,
  Sparkles,
  RefreshCw,
  X,
  Save,
  Check,
  SearchCheck,
  Shield,
  Layers,
  ArrowRight,
  Lock
} from 'lucide-react';
import { getLoggedInAdminUser, LoggedInAdminUser } from '@/lib/auth';

export interface CustomPageItem {
  id: string;
  slug: string;
  title: string;
  path: string;
  metaTitle?: string;
  metaDescription?: string;
  content?: string;
  isPublished: boolean;
  isIndexable: boolean;
  pageType: 'SİSTEM' | 'MODEL' | 'ÖZEL';
  cmsTabTarget?: string;
  updatedAt?: string;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<CustomPageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [currentUser, setCurrentUser] = useState<LoggedInAdminUser | null>(null);

  useEffect(() => {
    fetchPages();
    setCurrentUser(getLoggedInAdminUser());
  }, []);
  
  // Modals state
  const [editingPage, setEditingPage] = useState<CustomPageItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Page State
  const [newPage, setNewPage] = useState({
    title: '',
    path: '',
    metaTitle: '',
    metaDescription: '',
    content: '',
    isPublished: true,
    isIndexable: true,
    pageType: 'ÖZEL' as const
  });

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      setPages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch pages error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleTogglePublish = async (page: CustomPageItem) => {
    const newStatus = !page.isPublished;
    try {
      const res = await fetch(`/api/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...page, isPublished: newStatus }),
      });
      if (res.ok) {
        setPages((prev) =>
          prev.map((p) => (p.id === page.id ? { ...p, isPublished: newStatus } : p))
        );
      }
    } catch (err) {
      console.error('Toggle publish error:', err);
    }
  };

  const handleToggleIndexable = async (page: CustomPageItem) => {
    const newStatus = !page.isIndexable;
    try {
      const res = await fetch(`/api/pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...page, isIndexable: newStatus }),
      });
      if (res.ok) {
        setPages((prev) =>
          prev.map((p) => (p.id === page.id ? { ...p, isIndexable: newStatus } : p))
        );
      }
    } catch (err) {
      console.error('Toggle indexable error:', err);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/pages/${editingPage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPage),
      });

      if (res.ok) {
        setEditingPage(null);
        fetchPages();
      }
    } catch (err) {
      console.error('Update page error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPage.title || !newPage.path) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPage),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewPage({
          title: '',
          path: '',
          metaTitle: '',
          metaDescription: '',
          content: '',
          isPublished: true,
          isIndexable: true,
          pageType: 'ÖZEL'
        });
        fetchPages();
      }
    } catch (err) {
      console.error('Add page error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Bu sayfayı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPages();
      }
    } catch (err) {
      console.error('Delete page error:', err);
    }
  };

  // Filtered pages list
  const filteredPages = pages.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.metaTitle && p.metaTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterStatus === 'PUBLISHED') return matchesSearch && p.isPublished;
    if (filterStatus === 'DRAFT') return matchesSearch && !p.isPublished;
    return matchesSearch;
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
            Editör rolündeki kullanıcılar sadece <strong>Formlar ve Talepler</strong> sayfalarına erişebilir. Sayfalar yönetimi üzerinde düzenleme ve silme yetkiniz bulunmamaktadır.
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
            <h1 className="text-3xl font-extrabold text-white font-['Outfit']">
              Sayfalar & İçerik Yönetim Modülü
            </h1>
            <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/40 text-xs font-bold">
              {pages.length} Sayfa Kayıtlı
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Sitede oluşturulan tüm sayfaların yayın durumunu, URL yapılarını, SEO meta başlıklarını ve içeriklerini tek noktadan yönetebilirsiniz.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 text-white font-bold text-xs px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yeni Sayfa Ekle</span>
          </button>

          <button
            onClick={fetchPages}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-blue-500/20 transition-colors"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* QUICK MANAGEMENT SHORTCUT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/settings?tab=homepage"
          className="glass-panel p-4 rounded-2xl border border-sky-500/30 hover:border-sky-400/60 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center border border-sky-500/30 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">Ana Sayfa Bölüm Düzeni</h3>
              <p className="text-[11px] text-gray-400">3D Galeri, Renk Konfigüratörü ve Hesaplayıcının sırasını & yayın durumunu yönetin.</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-sky-400 shrink-0 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/vehicles"
          className="glass-panel p-4 rounded-2xl border border-blue-500/30 hover:border-blue-400/60 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">Araç Vitrin Modelleri</h3>
              <p className="text-[11px] text-gray-400">Ana sayfada hangi araç modellerinin gösterileceğini "Araç Yönetimi (CMS)" panelinden seçin.</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-blue-400 shrink-0 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/settings?tab=calculator"
          className="glass-panel p-4 rounded-2xl border border-emerald-500/30 hover:border-emerald-400/60 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">Tasarruf Hesaplayıcı</h3>
              <p className="text-[11px] text-gray-400">Ana sayfa ve model sayfalarındaki yakıt tasarruf hesap aracını düzenleyin veya gizleyin.</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="glass-panel p-4 rounded-2xl border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sayfa adı veya URL ara..."
            className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-gray-400 mr-2">Durum Filtresi:</span>
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            Tümü ({pages.length})
          </button>
          <button
            onClick={() => setFilterStatus('PUBLISHED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === 'PUBLISHED'
                ? 'bg-emerald-600 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            Yayında ({pages.filter((p) => p.isPublished).length})
          </button>
          <button
            onClick={() => setFilterStatus('DRAFT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === 'DRAFT'
                ? 'bg-amber-600 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            Taslak ({pages.filter((p) => !p.isPublished).length})
          </button>
        </div>
      </div>

      {/* PAGES LIST TABLE GRID */}
      <div className="glass-panel rounded-3xl p-6 border border-blue-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0D1527] text-gray-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Sayfa Adı & Tipi</th>
                <th className="p-4">URL Yapısı (Path)</th>
                <th className="p-4">Yayın Durumu</th>
                <th className="p-4">SEO & Google İndeks</th>
                <th className="p-4">Açıklama / Meta Başlık</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPages.map((p) => {
                return (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    {/* Sayfa Adı & Tipi */}
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{p.title}</div>
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                                p.pageType === 'SİSTEM'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : p.pageType === 'MODEL'
                                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {p.pageType} SAYFASI
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* URL Yapısı (Path) */}
                    <td className="p-4 font-mono text-blue-400">
                      <div className="flex items-center space-x-1.5">
                        <Globe className="w-3.5 h-3.5 text-blue-400/60" />
                        <span>{p.path}</span>
                      </div>
                    </td>

                    {/* Yayın Durumu Toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => handleTogglePublish(p)}
                        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                          p.isPublished
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 shadow-sm shadow-emerald-500/20'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                        }`}
                        title="Tıklayarak Sitede Yayınla / Yayından Kaldır"
                      >
                        {p.isPublished ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>YAYINDA</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                            <span>TASLAK (GİZLİ)</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Google SEO İndeksleme */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleIndexable(p)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                          p.isIndexable
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                            : 'bg-gray-800 text-gray-400 border-gray-700'
                        }`}
                        title="Google Arama Motorlarında İndekslenebilirlik Durumu"
                      >
                        <SearchCheck className="w-3 h-3 text-blue-400" />
                        <span>{p.isIndexable ? 'İndekslenebilir' : 'No-Index'}</span>
                      </button>
                    </td>

                    {/* Meta Title & Description Preview */}
                    <td className="p-4 max-w-xs truncate">
                      <div className="text-white font-medium truncate">{p.metaTitle || p.title}</div>
                      <div className="text-[10px] text-gray-400 truncate mt-0.5">
                        {p.metaDescription || p.content || 'Meta açıklama eklenmedi.'}
                      </div>
                    </td>

                    {/* İşlemler Buttons */}
                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={p.path}
                        target="_blank"
                        className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors inline-flex items-center border border-white/10"
                        title="Sitede İncele (Yeni Sekmede Aç)"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                      </Link>

                      <Link
                        href={`/admin/pages/builder/${p.id}`}
                        className="px-2.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 rounded-lg transition-colors text-xs font-bold inline-flex items-center space-x-1 border border-purple-500/40 shadow-sm"
                        title="Görsel Sürükle-Bırak Sayfa Düzenleyiciyi Aç"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Görsel Düzenleyici</span>
                      </Link>

                      {p.cmsTabTarget && (
                        <Link
                          href={`/admin/settings?tab=${p.cmsTabTarget}`}
                          className="px-2.5 py-1.5 bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white rounded-lg transition-colors text-xs font-semibold inline-flex items-center space-x-1 border border-blue-500/30"
                          title="Bu Sayfanın CMS Modülünü Aç"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>CMS Modülü</span>
                        </Link>
                      )}

                      <button
                        onClick={() => setEditingPage(p)}
                        className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors inline-flex items-center border border-blue-500/30"
                        title="Sayfa İçeriği & SEO Düzenle"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {p.pageType === 'ÖZEL' && (
                        <button
                          onClick={() => handleDeletePage(p.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Sayfayı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT PAGE MODAL */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingPage(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-white font-['Outfit'] mb-6 flex items-center space-x-2">
              <Edit className="w-5 h-5 text-blue-400" />
              <span>Sayfa Düzenle: {editingPage.title}</span>
            </h2>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Sayfa Başlığı</label>
                  <input
                    type="text"
                    value={editingPage.title}
                    onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">URL Yolu (Path)</label>
                  <input
                    type="text"
                    value={editingPage.path}
                    onChange={(e) => setEditingPage({ ...editingPage, path: e.target.value })}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-blue-400 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Google SEO Meta Başlığı (`&lt;title&gt;`)</label>
                <input
                  type="text"
                  value={editingPage.metaTitle || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, metaTitle: e.target.value })}
                  placeholder="Arama motorlarında gözükecek başlık..."
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Google SEO Meta Açıklaması (`&lt;meta name="description"&gt;`)</label>
                <textarea
                  rows={3}
                  value={editingPage.metaDescription || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, metaDescription: e.target.value })}
                  placeholder="Google arama sonuçlarında görünecek 150-160 karakterlik açıklama..."
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Sayfa İçeriği / Açıklama Metni</label>
                <textarea
                  rows={4}
                  value={editingPage.content || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                  placeholder="Sayfa hakkında özet içerik metni..."
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none font-mono text-xs"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <label className="flex items-center space-x-2 text-gray-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPage.isPublished}
                    onChange={(e) => setEditingPage({ ...editingPage, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Sitede Yayınlansın (Yayında)</span>
                </label>

                <label className="flex items-center space-x-2 text-gray-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPage.isIndexable}
                    onChange={(e) => setEditingPage({ ...editingPage, isIndexable: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Google İndeklesin (Indexable)</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
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
                  <span>Değişiklikleri Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW PAGE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-white font-['Outfit'] mb-6 flex items-center space-x-2">
              <Plus className="w-6 h-6 text-blue-400" />
              <span>Yeni Özel Sayfa Oluştur</span>
            </h2>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Sayfa Adı / Başlığı *</label>
                  <input
                    type="text"
                    value={newPage.title}
                    onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                    placeholder="Örn: Sıkça Sorulan Sorular"
                    required
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">URL Yolu (Path) *</label>
                  <input
                    type="text"
                    value={newPage.path}
                    onChange={(e) => setNewPage({ ...newPage, path: e.target.value })}
                    placeholder="Örn: /sss veya /kampanyalar"
                    required
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-blue-400 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Google SEO Meta Başlığı</label>
                <input
                  type="text"
                  value={newPage.metaTitle}
                  onChange={(e) => setNewPage({ ...newPage, metaTitle: e.target.value })}
                  placeholder="Örn: Sıkça Sorulan Sorular - MKBL Otomotiv"
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Google SEO Meta Açıklaması</label>
                <textarea
                  rows={3}
                  value={newPage.metaDescription}
                  onChange={(e) => setNewPage({ ...newPage, metaDescription: e.target.value })}
                  placeholder="Google arama sonuçlarında görünecek açıklama..."
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                ></textarea>
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
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-400 text-white font-bold hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Sayfayı Oluştur & Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
