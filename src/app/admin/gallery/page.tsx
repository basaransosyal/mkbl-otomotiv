'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ImageIcon,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  RefreshCw,
  X,
  Check,
  Search,
  Sparkles,
  Lock,
  ArrowUp,
  ArrowDown,
  GripVertical
} from 'lucide-react';
import { GallerySlideItem, Vehicle } from '@/lib/data';
import { getLoggedInAdminUser, LoggedInAdminUser } from '@/lib/auth';

export default function AdminGalleryPage() {
  const [slides, setSlides] = useState<GallerySlideItem[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<LoggedInAdminUser | null>(null);

  // Modals & Upload state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingSlide, setEditingSlide] = useState<GallerySlideItem | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState<boolean>(false);

  const saveNewOrders = async (reorderedSlides: GallerySlideItem[]) => {
    setIsReordering(true);
    try {
      await Promise.all(
        reorderedSlides.map((slide) =>
          fetch(`/api/gallery/${slide.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: slide.order }),
          })
        )
      );
    } catch (err) {
      console.error('Save orders error:', err);
    } finally {
      setIsReordering(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newSlides = [...slides];
    const [moved] = newSlides.splice(draggedIndex, 1);
    newSlides.splice(targetIndex, 0, moved);

    const reordered = newSlides.map((item, i) => ({
      ...item,
      order: i + 1,
    }));

    setSlides(reordered);
    setDraggedIndex(null);
    await saveNewOrders(reordered);
  };

  const moveSlide = async (index: number, direction: 'up' | 'down' | 'top') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;

    const newSlides = [...slides];
    const [moved] = newSlides.splice(index, 1);

    if (direction === 'top') {
      newSlides.unshift(moved);
    } else if (direction === 'up') {
      newSlides.splice(index - 1, 0, moved);
    } else {
      newSlides.splice(index + 1, 0, moved);
    }

    const reordered = newSlides.map((item, i) => ({
      ...item,
      order: i + 1,
    }));

    setSlides(reordered);
    await saveNewOrders(reordered);
  };

  // New Slide Form State
  const [newSlide, setNewSlide] = useState({
    vehicleId: 'karea-fit',
    title: '',
    subtitle: '%100 Elektrikli Karea Fit',
    description: '',
    tagText: '',
    imageUrl: '/images/karea_official_1.jpg',
    order: 1,
    isPublished: true,
  });

  const isEditor = currentUser?.role === 'EDİTÖR';

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const [resGallery, resVehicles] = await Promise.all([
        fetch('/api/gallery'),
        fetch('/api/vehicles'),
      ]);
      const dataGallery = await resGallery.json();
      const dataVehicles = await resVehicles.json();

      const sortedGallery = Array.isArray(dataGallery)
        ? dataGallery.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        : [];
      setSlides(sortedGallery);
      setVehicles(Array.isArray(dataVehicles) ? dataVehicles : []);
    } catch (err) {
      console.error('Fetch gallery admin error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
    setCurrentUser(getLoggedInAdminUser());
  }, []);

  // Image File Upload Handler
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'new' | 'edit'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (target === 'new') {
          setNewSlide((prev) => ({ ...prev, imageUrl: data.url }));
        } else if (editingSlide) {
          setEditingSlide({ ...editingSlide, imageUrl: data.url });
        }
      } else {
        const errData = await res.json();
        alert(errData.error || 'Görsel yüklenemedi.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Görsel yüklenirken sunucu hatası oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  // Add Slide Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlide.title.trim()) {
      alert('Lütfen kart başlığı giriniz.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlide),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewSlide({
          vehicleId: 'karea-fit',
          title: '',
          subtitle: '%100 Elektrikli Karea Fit',
          description: '',
          tagText: '',
          imageUrl: '/images/karea_official_1.jpg',
          order: slides.length + 1,
          isPublished: true,
        });
        fetchGallery();
      }
    } catch (err) {
      console.error('Add slide error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Update Slide Submit
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide || !editingSlide.title.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/gallery/${editingSlide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSlide),
      });

      if (res.ok) {
        setEditingSlide(null);
        fetchGallery();
      }
    } catch (err) {
      console.error('Update slide error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Publish Status
  const handleTogglePublish = async (slide: GallerySlideItem) => {
    if (isEditor) {
      alert('Editör rolündeki kullanıcılar durumları değiştiremez.');
      return;
    }
    const nextVal = !(slide.isPublished !== false);
    try {
      const res = await fetch(`/api/gallery/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: nextVal }),
      });
      if (res.ok) {
        fetchGallery();
      }
    } catch (err) {
      console.error('Toggle publish error:', err);
    }
  };

  // Delete Slide
  const handleDeleteSlide = async (id: string) => {
    if (isEditor) {
      alert('Editör rolündeki kullanıcılar silme yetkisine sahip değildir.');
      return;
    }
    if (!confirm('Bu galeri kartını silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchGallery();
      }
    } catch (err) {
      console.error('Delete slide error:', err);
    }
  };

  const filteredSlides = slides.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.subtitle && s.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isEditor) {
    return (
      <div className="pt-32 pb-20 max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white font-['Outfit']">Sayfa Erişim Yetkisi Sınırlı</h1>
          <p className="text-xs text-gray-300 leading-relaxed">
            Editör rolündeki kullanıcılar sadece <strong>Formlar ve Talepler</strong> sayfalarına erişebilir. Galeri yönetimi üzerinde düzenleme yetkiniz bulunmamaktadır.
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-blue-500/20 pb-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-blue-600/30 text-gray-300 hover:text-white border border-blue-500/30 transition-all text-xs font-semibold shadow-md mb-3"
          >
            <ChevronLeft className="w-4 h-4 text-blue-400" />
            <span>Geri (Admin Paneli)</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold text-white font-['Outfit'] flex items-center space-x-3">
              <ImageIcon className="w-8 h-8 text-blue-400" />
              <span>Dinamik 3D Galeri Kartları Yönetimi</span>
            </h1>
            <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/40 text-xs font-bold">
              {slides.length} Kart Kayıtlı
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Araç model sayfalarındaki 3D dönen galeri kartlarını, görselleri, rozetleri ve alt ürün açıklamalarını buradan ekleyip düzenleyebilirsiniz.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 text-white font-bold text-xs px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yeni Galeri Kartı Ekle</span>
          </button>

          <button
            onClick={fetchGallery}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-blue-500/20 transition-colors"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="glass-panel p-4 rounded-2xl border border-blue-500/20 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Galeri başlığı veya açıklama ara..."
            className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="text-xs text-gray-400 hidden sm:block">
          Sıralama: Gösterim Sırasına Göre (`order`)
        </div>
      </div>

      {/* SLIDES GRID / CARDS TABLE */}
      {isLoading ? (
        <div className="p-12 text-center text-gray-400 space-y-3">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <span>Galeri kartları yükleniyor...</span>
        </div>
      ) : filteredSlides.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-gray-400 space-y-4 border border-blue-500/20">
          <ImageIcon className="w-12 h-12 text-blue-400/40 mx-auto" />
          <p className="text-sm font-semibold">Henüz galeri kartı bulunamadı.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold"
          >
            + İlk Galeri Kartını Ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSlides.map((slide, index) => {
            const isPublished = slide.isPublished !== false;
            const isDragging = draggedIndex === index;
            const isTarget = dragOverIndex === index;
            const isFirstCenterCard = slide.order === 1 || index === 0;
            const isSecondRightCard = slide.order === 2 || index === 1;

            return (
              <div
                key={slide.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                className={`glass-panel rounded-3xl p-5 border transition-all space-y-4 flex flex-col justify-between cursor-grab active:cursor-grabbing ${
                  isDragging ? 'opacity-30 scale-95 border-dashed border-blue-400' : ''
                } ${isTarget ? 'border-sky-400 ring-2 ring-sky-400/50 bg-blue-900/30' : ''} ${
                  isFirstCenterCard
                    ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10 bg-emerald-950/20'
                    : isPublished
                    ? 'border-blue-500/30 hover:border-blue-400'
                    : 'border-gray-800 opacity-60'
                }`}
              >
                <div className="space-y-3">
                  {/* Image Preview & Order Badge */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#0A1122] border border-blue-500/20 group">
                    <Image
                      src={slide.imageUrl || '/images/karea_official_1.jpg'}
                      alt={slide.title}
                      fill
                      className="object-cover"
                    />

                    {/* Drag Grip Overlay Badge */}
                    <div className="absolute top-3 left-3 bg-[#080D1A]/90 backdrop-blur-md text-white border border-blue-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-md">
                      <GripVertical className="w-3.5 h-3.5 text-blue-400" />
                      {isFirstCenterCard ? (
                        <span className="text-emerald-400">Sıra #1 🌟 (CANLI ORTA KART)</span>
                      ) : isSecondRightCard ? (
                        <span className="text-sky-400">Sıra #2 ➡️ (SAĞ KART)</span>
                      ) : (
                        <span>Sıra: #{slide.order || index + 1}</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleTogglePublish(slide)}
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                        isPublished
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-red-500/20 text-red-400 border-red-500/40'
                      }`}
                    >
                      {isPublished ? 'YAYINDA' : 'GİZLİ'}
                    </button>
                  </div>

                  {/* Card Info */}
                  <div className="space-y-1">
                    {slide.subtitle && (
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                        {slide.subtitle}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-white font-['Outfit'] line-clamp-1">
                      {slide.title}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                      {slide.description || 'Açıklama girilmemiş.'}
                    </p>
                    {slide.tagText && slide.tagText.trim() && (
                      <div className="pt-1 text-[10px] text-blue-400 font-medium flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        <span>{slide.tagText}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions & Reorder Controls */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs gap-2">
                  {/* Order Movement Controls */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => moveSlide(index, 'top')}
                      disabled={index === 0}
                      className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="En Başa Al (Orta Kart Yap)"
                    >
                      En Başa
                    </button>
                    <button
                      onClick={() => moveSlide(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Yukarı Taşı"
                    >
                      <ArrowUp className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                    <button
                      onClick={() => moveSlide(index, 'down')}
                      disabled={index === slides.length - 1}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Aşağı Taşı"
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setEditingSlide(slide)}
                      className="p-1.5 rounded-xl bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 transition-colors"
                      title="Düzenle"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD NEW SLIDE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-blue-500/30 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <span>Yeni Galeri Kartı Oluştur</span>
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Kart Ana Başlığı *</label>
                  <input
                    type="text"
                    required
                    value={newSlide.title}
                    onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                    placeholder="Şehir İçi Elektrikli Özgürlük"
                    className="w-full bg-[#0D1527] border border-blue-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Üst Rozet / Alt Başlık</label>
                  <input
                    type="text"
                    value={newSlide.subtitle}
                    onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                    placeholder="%100 Elektrikli Karea Fit"
                    className="w-full bg-[#0D1527] border border-blue-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Kart Alt Açıklaması & Ürün Özelliği Metni *</label>
                <textarea
                  rows={3}
                  required
                  value={newSlide.description}
                  onChange={(e) => setNewSlide({ ...newSlide, description: e.target.value })}
                  placeholder="Ev tipi 220V prizden 2 saatte hızlı şarj (%20-%80) olabilen pratik ve yenilikçi şehir ulaşımı."
                  className="w-full bg-[#0D1527] border border-blue-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Kart Alt Etiket Metni (Dipnot - örn: Karea Özel Donanım)</label>
                <input
                  type="text"
                  value={newSlide.tagText}
                  onChange={(e) => setNewSlide({ ...newSlide, tagText: e.target.value })}
                  placeholder="Karea Özel Donanım veya Güvenlik Donanımı"
                  className="w-full bg-[#0D1527] border border-blue-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="block text-gray-300 font-semibold">Galeri Kart Görseli</label>
                <div className="flex items-center space-x-3">
                  <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-black/40 border border-blue-500/30 shrink-0">
                    <Image src={newSlide.imageUrl} alt="Önizleme" fill className="object-cover" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold transition-all text-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Yükleniyor...' : 'Bilgisayardan Görsel Seç'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'new')}
                        disabled={isUploading}
                      />
                    </label>
                    <input
                      type="text"
                      value={newSlide.imageUrl}
                      onChange={(e) => setNewSlide({ ...newSlide, imageUrl: e.target.value })}
                      placeholder="veya Görsel URL'si girin"
                      className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-2 text-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Gösterim Sırası (`order`)</label>
                  <input
                    type="number"
                    value={newSlide.order}
                    onChange={(e) => setNewSlide({ ...newSlide, order: Number(e.target.value) || 1 })}
                    className="w-full bg-[#0D1527] border border-blue-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">İlişkili Araç Modeli</label>
                  <select
                    value={newSlide.vehicleId}
                    onChange={(e) => setNewSlide({ ...newSlide, vehicleId: e.target.value })}
                    className="w-full bg-[#0D1527] border border-blue-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="karea-fit">Karea Fit</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold"
                >
                  İptal
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-400 text-white font-bold shadow-lg shadow-blue-500/30 flex items-center space-x-2"
                >
                  {isSaving && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Kartı Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SLIDE MODAL */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-blue-500/30 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center space-x-2">
                <Edit className="w-5 h-5 text-blue-400" />
                <span>Galeri Kartını Düzenle</span>
              </h2>
              <button
                onClick={() => setEditingSlide(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Kart Ana Başlığı *</label>
                  <input
                    type="text"
                    required
                    value={editingSlide.title}
                    onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                    className="w-full bg-[#0D1527] border border-blue-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Üst Rozet / Alt Başlık</label>
                  <input
                    type="text"
                    value={editingSlide.subtitle || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                    className="w-full bg-[#0D1527] border border-blue-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Kart Alt Açıklaması & Ürün Özelliği Metni *</label>
                <textarea
                  rows={3}
                  required
                  value={editingSlide.description || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, description: e.target.value })}
                  className="w-full bg-[#0D1527] border border-blue-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Kart Alt Etiket Metni (Dipnot - örn: Karea Özel Donanım)</label>
                <input
                  type="text"
                  value={editingSlide.tagText || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, tagText: e.target.value })}
                  placeholder="Karea Özel Donanım"
                  className="w-full bg-[#0D1527] border border-blue-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="block text-gray-300 font-semibold">Galeri Kart Görseli</label>
                <div className="flex items-center space-x-3">
                  <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-black/40 border border-blue-500/30 shrink-0">
                    <Image src={editingSlide.imageUrl} alt="Önizleme" fill className="object-cover" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold transition-all text-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Yükleniyor...' : 'Görseli Değiştir'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'edit')}
                        disabled={isUploading}
                      />
                    </label>
                    <input
                      type="text"
                      value={editingSlide.imageUrl}
                      onChange={(e) => setEditingSlide({ ...editingSlide, imageUrl: e.target.value })}
                      className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-2 text-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Gösterim Sırası (`order`)</label>
                  <input
                    type="number"
                    value={editingSlide.order}
                    onChange={(e) => setEditingSlide({ ...editingSlide, order: Number(e.target.value) || 1 })}
                    className="w-full bg-[#0D1527] border border-blue-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">İlişkili Araç Modeli</label>
                  <select
                    value={editingSlide.vehicleId || 'karea-fit'}
                    onChange={(e) => setEditingSlide({ ...editingSlide, vehicleId: e.target.value })}
                    className="w-full bg-[#0D1527] border border-blue-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="karea-fit">Karea Fit</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold"
                >
                  İptal
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-400 text-white font-bold shadow-lg shadow-blue-500/30 flex items-center space-x-2"
                >
                  {isSaving && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>Değişiklikleri Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
