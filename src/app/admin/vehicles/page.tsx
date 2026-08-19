'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  Plus,
  Trash2,
  Edit,
  X,
  RefreshCw,
  Save,
  Palette,
  Upload,
  Eye,
  EyeOff,
  Car,
  GripHorizontal,
  ArrowLeft,
  ArrowRight,
  Globe,
  ChevronDown,
  Lock,
  Check
} from 'lucide-react';
import { Vehicle, VehicleColor, normalizeVehiclePrice } from '@/lib/data';
import { getLoggedInAdminUser, LoggedInAdminUser } from '@/lib/auth';

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [uploadingColorIdx, setUploadingColorIdx] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<LoggedInAdminUser | null>(null);

  // Quick edit states
  const [editingPriceVehicleId, setEditingPriceVehicleId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');
  const [activeStockDropdownId, setActiveStockDropdownId] = useState<string | null>(null);
  const [uploadingCoverVehicleId, setUploadingCoverVehicleId] = useState<string | null>(null);

  // Drag and Drop reordering state
  const draggedItemRef = useRef<{ colorIdx: number; imgIdx: number } | null>(null);

  useEffect(() => {
    fetchVehicles();
    setCurrentUser(getLoggedInAdminUser());
  }, []);

  // New vehicle form state
  const [newVehicle, setNewVehicle] = useState({
    name: 'Karea ',
    tagline: 'İdeal Şehir Aracı.',
    category: 'City' as const,
    price: 485000,
    rangeKm: 135,
    topSpeed: 90,
    chargeTime: '%20’den %80’e 2 Saat (3.3 kW/s Ev Tipi 220V Priz)',
    battery: '9.98 kWh LFP (Lityum Demir Fosfat)',
    licenseType: 'B / B1 (16 Yaş ve Üzeri)',
    motorPower: '12 kW (Peak Motor Gücü)',
    images: ['/images/karea_official_hero.jpg'],
    stockStatus: 'STOKTA' as const,
    isPublished: true,
    colors: [
      {
        name: 'Okyanus Mavisi',
        badge: 'Okyanus Mavisi',
        hex: '#2563EB',
        angleImages: ['/images/karea_official_hero.jpg']
      }
    ],
    features: ['Çelik Kafes Şasi', '220V Priz Şarj', 'Klima & Isıtıcı', 'Rejeneratif Fren']
  });

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/vehicles');
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch vehicles error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Toggle vehicle publication state (Yayında / Taslak)
  const handleTogglePublish = async (vehicle: Vehicle) => {
    const newStatus = vehicle.isPublished === false ? true : false;
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vehicle, isPublished: newStatus }),
      });

      if (res.ok) {
        setVehicles((prev) =>
          prev.map((v) => (v.id === vehicle.id ? { ...v, isPublished: newStatus } : v))
        );
      }
    } catch (err) {
      console.error('Toggle publish error:', err);
    }
  };

  // Quick Cover Image Upload (Requirements 1)
  const handleQuickCoverUpload = async (vehicle: Vehicle, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCoverVehicleId(vehicle.id);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        const existingImages = Array.isArray(vehicle.images) ? vehicle.images : [];
        const updatedImages = [url, ...existingImages.filter((img) => img !== url)];

        const updateRes = await fetch(`/api/vehicles/${vehicle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...vehicle, images: updatedImages }),
        });

        if (updateRes.ok) {
          setVehicles((prev) =>
            prev.map((v) => (v.id === vehicle.id ? { ...v, images: updatedImages } : v))
          );
        }
      }
    } catch (err) {
      console.error('Quick cover upload error:', err);
    } finally {
      setUploadingCoverVehicleId(null);
    }
  };

  // Quick Price Save (Requirement 2)
  const handleQuickPriceSave = async (vehicle: Vehicle, rawPriceInput: string | number) => {
    const newPriceVal = normalizeVehiclePrice(rawPriceInput);
    if (newPriceVal <= 0) return;
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vehicle, price: newPriceVal }),
      });

      if (res.ok) {
        setVehicles((prev) =>
          prev.map((v) => (v.id === vehicle.id ? { ...v, price: newPriceVal } : v))
        );
        setEditingPriceVehicleId(null);
      }
    } catch (err) {
      console.error('Quick price save error:', err);
    }
  };

  // Quick Stock Status Save (Requirement 3)
  const handleQuickStockStatus = async (vehicle: Vehicle, newStatus: 'STOKTA' | 'ÖN SİPARİŞ' | 'TÜKENDİ') => {
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vehicle, stockStatus: newStatus }),
      });

      if (res.ok) {
        setVehicles((prev) =>
          prev.map((v) => (v.id === vehicle.id ? { ...v, stockStatus: newStatus } : v))
        );
        setActiveStockDropdownId(null);
      }
    } catch (err) {
      console.error('Quick stock status error:', err);
    }
  };

  // Quick Toggle Homepage Display
  const handleToggleShowOnHomepage = async (vehicle: Vehicle) => {
    if (currentUser?.role === 'EDİTÖR') {
      alert('Editör rolündeki kullanıcılar durumlarda değişiklik yapamaz.');
      return;
    }
    const nextVal = !(vehicle.showOnHomepage !== false);
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vehicle, showOnHomepage: nextVal }),
      });

      if (res.ok) {
        setVehicles((prev) =>
          prev.map((v) => (v.id === vehicle.id ? { ...v, showOnHomepage: nextVal } : v))
        );
      }
    } catch (err) {
      console.error('Quick showOnHomepage error:', err);
    }
  };

  // Save changes to existing vehicle
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    const payload = {
      ...editingVehicle,
      price: normalizeVehiclePrice(editingVehicle.price),
    };

    try {
      const res = await fetch(`/api/vehicles/${editingVehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditingVehicle(null);
        fetchVehicles();
      }
    } catch (err) {
      console.error('Update vehicle error:', err);
    }
  };

  // Add new vehicle submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...newVehicle,
      price: normalizeVehiclePrice(newVehicle.price),
    };
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        fetchVehicles();
      }
    } catch (err) {
      console.error('Add vehicle error:', err);
    }
  };

  // Delete vehicle
  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Bu aracı ve tüm görsellerini silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchVehicles();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Upload file for a specific color in editingVehicle
  const handleFileUpload = async (colorIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingVehicle) return;

    setUploadingColorIdx(colorIndex);

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          newUrls.push(data.url);
        }
      }

      const updatedColors = [...editingVehicle.colors];
      const existingAngles = updatedColors[colorIndex].angleImages || [];
      updatedColors[colorIndex] = {
        ...updatedColors[colorIndex],
        angleImages: [...existingAngles, ...newUrls],
      };

      setEditingVehicle({
        ...editingVehicle,
        colors: updatedColors,
      });
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploadingColorIdx(null);
    }
  };

  // Move angle image left or right
  const handleMoveAngleImage = (colorIndex: number, fromIndex: number, toIndex: number) => {
    if (!editingVehicle) return;
    const updatedColors = [...editingVehicle.colors];
    const angles = [...(updatedColors[colorIndex].angleImages || [])];
    
    if (toIndex < 0 || toIndex >= angles.length) return;

    const temp = angles[fromIndex];
    angles[fromIndex] = angles[toIndex];
    angles[toIndex] = temp;

    updatedColors[colorIndex] = {
      ...updatedColors[colorIndex],
      angleImages: angles,
    };

    setEditingVehicle({
      ...editingVehicle,
      colors: updatedColors,
    });
  };

  // Drag and Drop Handlers
  const onDragStartHandler = (colorIdx: number, imgIdx: number) => {
    draggedItemRef.current = { colorIdx, imgIdx };
  };

  const onDragOverHandler = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDropHandler = (colorIdx: number, targetImgIdx: number) => {
    if (!draggedItemRef.current || !editingVehicle) return;
    const srcColorIdx = draggedItemRef.current.colorIdx;
    const srcImgIdx = draggedItemRef.current.imgIdx;

    if (srcColorIdx !== colorIdx || srcImgIdx === targetImgIdx) return;

    handleMoveAngleImage(colorIdx, srcImgIdx, targetImgIdx);
    draggedItemRef.current = null;
  };

  // Remove single angle image thumbnail
  const handleRemoveAngleImage = (colorIndex: number, imageIndex: number) => {
    if (!editingVehicle) return;
    const updatedColors = [...editingVehicle.colors];
    const currentAngles = updatedColors[colorIndex].angleImages || [];
    const filteredAngles = currentAngles.filter((_, idx) => idx !== imageIndex);
    updatedColors[colorIndex] = {
      ...updatedColors[colorIndex],
      angleImages: filteredAngles,
    };
    setEditingVehicle({
      ...editingVehicle,
      colors: updatedColors,
    });
  };

  const handleAddColor = () => {
    if (!editingVehicle) return;
    const newColor: VehicleColor = {
      name: 'Yeni Renk',
      badge: 'Yeni Renk',
      hex: '#2563EB',
      angleImages: []
    };
    setEditingVehicle({
      ...editingVehicle,
      colors: [...editingVehicle.colors, newColor]
    });
  };

  const handleRemoveColor = (index: number) => {
    if (!editingVehicle) return;
    const updated = editingVehicle.colors.filter((_, i) => i !== index);
    setEditingVehicle({ ...editingVehicle, colors: updated });
  };

  const handleColorFieldChange = (index: number, field: keyof VehicleColor, value: any) => {
    if (!editingVehicle) return;
    const updated = [...editingVehicle.colors];
    updated[index] = { ...updated[index], [field]: value };
    setEditingVehicle({ ...editingVehicle, colors: updated });
  };

  if (currentUser?.role === 'EDİTÖR') {
    return (
      <div className="pt-32 pb-20 max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 shadow-xl">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white font-['Outfit']">Sayfa Erişim Yetkisi Sınırlı</h1>
          <p className="text-xs text-gray-300 leading-relaxed">
            Editör rolündeki kullanıcılar sadece <strong>Formlar ve Talepler</strong> sayfalarına erişebilir. Araç yönetimi ve diğer sayfalarda düzenleme/silme yetkiniz bulunmamaktadır.
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
            href="/admin/settings"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-blue-600/30 text-gray-300 hover:text-white border border-blue-500/30 transition-all text-xs font-semibold shadow-md mb-3"
          >
            <ChevronLeft className="w-4 h-4 text-blue-400" />
            <span>Geri (CMS Ayarlarına Dön)</span>
          </Link>
          <h1 className="text-3xl font-bold text-white font-['Outfit']">
            MKBL Araç & 360° Modeller Yönetimi
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Sitede üst gezinti barındaki <strong>"Modeller"</strong> açılır menüsünde sadece <strong>"YAYINDA"</strong> olarak işaretli araçlar görünür.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 text-white font-bold text-xs px-5 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yeni Araç Ekle</span>
          </button>
          <button
            onClick={fetchVehicles}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-blue-500/20 transition-colors"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Vehicles Table with Publish Status Switch */}
      <div className="glass-panel rounded-3xl p-6 border border-blue-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0D1527] text-gray-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Görsel & Model</th>
                <th className="p-4">Site Yayın Durumu</th>
                <th className="p-4">360° Renkler</th>
                <th className="p-4">Fiyat</th>
                <th className="p-4">Menzil / Hız</th>
                <th className="p-4">Stok Durumu</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vehicles.map((v) => {
                const published = v.isPublished !== false;
                return (
                  <tr key={v.id} className="hover:bg-white/5 transition-colors">
                    {/* COVER IMAGE & MODEL NAME (REQUIREMENT 1: QUICK COVER CHANGE) */}
                    <td className="p-4 font-semibold text-white flex items-center space-x-3">
                      <div
                        onClick={() => document.getElementById(`cover-file-input-${v.id}`)?.click()}
                        className="relative w-14 h-9 rounded-lg overflow-hidden bg-[#0A1122] shrink-0 border border-blue-500/30 group cursor-pointer hover:border-blue-400 transition-all shadow-md"
                        title="Kapak Görselini Değiştirmek İçin Tıklayın"
                      >
                        {uploadingCoverVehicleId === v.id ? (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                          </div>
                        ) : (
                          <>
                            <Image
                              src={v.images[0] || '/images/karea_official_hero.jpg'}
                              alt={v.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Upload className="w-3.5 h-3.5 text-blue-300" />
                            </div>
                          </>
                        )}
                      </div>
                      <input
                        id={`cover-file-input-${v.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleQuickCoverUpload(v, e)}
                      />
                      <div>
                        <div className="font-bold text-white text-sm">{v.name}</div>
                        <div className="text-[10px] text-gray-400 font-normal">{v.tagline}</div>
                      </div>
                    </td>

                    {/* PUBLISH TOGGLE & HOMEPAGE TOGGLE BUTTONS */}
                    <td className="p-4">
                      <div className="flex flex-col space-y-1.5 items-start">
                        <button
                          onClick={() => handleTogglePublish(v)}
                          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                            published
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 shadow-sm shadow-emerald-500/20'
                              : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-gray-200'
                          }`}
                          title="Tıklayarak Sitede Yayınla / Yayından Kaldır"
                        >
                          {published ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>YAYINDA</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                              <span>TASLAK (KAPALI)</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleToggleShowOnHomepage(v)}
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                            v.showOnHomepage !== false
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30'
                              : 'bg-gray-800/80 text-gray-400 border-gray-700 hover:bg-gray-700'
                          }`}
                          title="Tıklayarak Ana Sayfada Göster / Gizle"
                        >
                          <Globe className="w-3 h-3 text-blue-400" />
                          <span>{v.showOnHomepage !== false ? 'ANA SAYFADA' : 'SADECE CMS'}</span>
                        </button>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center space-x-1.5">
                        {v.colors?.map((c, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border border-white/30"
                            style={{ backgroundColor: c.hex }}
                            title={`${c.name} (${c.angleImages?.length || 0} Açı)`}
                          />
                        ))}
                        <span className="text-[10px] text-gray-400 ml-1">({v.colors?.length || 0} Renk)</span>
                      </div>
                    </td>

                    {/* PRICE CELL (REQUIREMENT 2: QUICK INLINE PRICE EDIT) */}
                    <td className="p-4 font-bold text-blue-400 text-sm">
                      {editingPriceVehicleId === v.id ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs text-gray-400">₺</span>
                          <input
                            type="text"
                            value={editingPriceValue}
                            onChange={(e) => setEditingPriceValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleQuickPriceSave(v, editingPriceValue);
                              if (e.key === 'Escape') setEditingPriceVehicleId(null);
                            }}
                            autoFocus
                            placeholder="749.000"
                            className="w-28 bg-[#070D19] border border-blue-400 rounded-lg px-2 py-1 text-white font-bold text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                          <button
                            onClick={() => handleQuickPriceSave(v, editingPriceValue)}
                            className="p-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-md border border-emerald-500/40 cursor-pointer"
                            title="Kaydet (Enter)"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          </button>
                          <button
                            onClick={() => setEditingPriceVehicleId(null)}
                            className="p-1 bg-white/5 text-gray-400 hover:text-white rounded-md cursor-pointer"
                            title="İptal (Esc)"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingPriceVehicleId(v.id);
                            setEditingPriceValue(v.price.toString());
                          }}
                          className="group/price flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl hover:bg-blue-600/20 border border-transparent hover:border-blue-500/30 transition-all text-left cursor-pointer"
                          title="Fiyatı Değiştirmek İçin Tıklayın"
                        >
                          <span>₺{v.price.toLocaleString('tr-TR')}</span>
                          <Edit className="w-3 h-3 text-blue-400/50 group-hover/price:text-blue-400 transition-colors shrink-0" />
                        </button>
                      )}
                    </td>

                    <td className="p-4">
                      <div>{v.rangeKm} km menzil</div>
                      <div className="text-[10px] text-gray-400">{v.topSpeed} km/s azami hız</div>
                    </td>

                    {/* STOCK STATUS (REQUIREMENT 3: INTERACTIVE DROPDOWN MENU) */}
                    <td className="p-4 relative">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setActiveStockDropdownId(activeStockDropdownId === v.id ? null : v.id)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border flex items-center space-x-1.5 cursor-pointer shadow-sm ${
                            v.stockStatus === 'STOKTA'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                              : v.stockStatus === 'ÖN SİPARİŞ'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                          }`}
                          title="Stok Durumunu Değiştirmek İçin Tıklayın"
                        >
                          <span>{v.stockStatus || 'STOKTA'}</span>
                          <ChevronDown className="w-3 h-3 opacity-70" />
                        </button>

                        {activeStockDropdownId === v.id && (
                          <div className="absolute top-full left-0 mt-1.5 w-36 glass-panel rounded-2xl p-1.5 border border-blue-500/30 shadow-2xl shadow-black/90 z-40 animate-in fade-in duration-150 space-y-1">
                            <button
                              onClick={() => handleQuickStockStatus(v, 'STOKTA')}
                              className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-bold flex items-center justify-between transition-colors"
                            >
                              <span>STOKTA</span>
                              {v.stockStatus === 'STOKTA' && <Check className="w-3 h-3 text-emerald-400" />}
                            </button>

                            <button
                              onClick={() => handleQuickStockStatus(v, 'ÖN SİPARİŞ')}
                              className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center justify-between transition-colors"
                            >
                              <span>ÖN SİPARİŞ</span>
                              {v.stockStatus === 'ÖN SİPARİŞ' && <Check className="w-3 h-3 text-amber-400" />}
                            </button>

                            <button
                              onClick={() => handleQuickStockStatus(v, 'TÜKENDİ')}
                              className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-rose-500/20 text-rose-300 text-[11px] font-bold flex items-center justify-between transition-colors"
                            >
                              <span>TÜKENDİ</span>
                              {v.stockStatus === 'TÜKENDİ' && <Check className="w-3 h-3 text-rose-400" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setEditingVehicle(v)}
                        className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors text-xs font-semibold inline-flex items-center space-x-1 border border-blue-500/30"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>360° & Renkleri Düzenle</span>
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(v.id)}
                        className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Aracı Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* YENİ ARAÇ EKLE MODAL */}
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
              <Car className="w-6 h-6 text-blue-400" />
              <span>Yeni Araç Modeli Ekle</span>
            </h2>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Model Adı</label>
                  <input
                    type="text"
                    required
                    placeholder="MKBL Karea Fit"
                    value={newVehicle.name}
                    onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Fiyat (TL)</label>
                  <input
                    type="number"
                    required
                    value={newVehicle.price}
                    onChange={(e) => setNewVehicle({ ...newVehicle, price: Number(e.target.value) })}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-medium">Slogan / Açıklama</label>
                <input
                  type="text"
                  required
                  placeholder="Bindiğin gibi değil. İdeal Şehir Aracı."
                  value={newVehicle.tagline}
                  onChange={(e) => setNewVehicle({ ...newVehicle, tagline: e.target.value })}
                  className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Menzil (km)</label>
                  <input
                    type="number"
                    required
                    value={newVehicle.rangeKm}
                    onChange={(e) => setNewVehicle({ ...newVehicle, rangeKm: Number(e.target.value) })}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Azami Hız (km/s)</label>
                  <input
                    type="number"
                    required
                    value={newVehicle.topSpeed}
                    onChange={(e) => setNewVehicle({ ...newVehicle, topSpeed: Number(e.target.value) })}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Stok Durumu</label>
                  <select
                    value={newVehicle.stockStatus}
                    onChange={(e) => setNewVehicle({ ...newVehicle, stockStatus: e.target.value as any })}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="STOKTA">STOKTA</option>
                    <option value="ÖN SİPARİŞ">ÖN SİPARİŞ</option>
                    <option value="TÜKENDİ">TÜKENDİ</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 text-sm"
              >
                Yeni Araç Modelini Kaydet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT VEHICLE & 360 COLOR ANGLES MODAL */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl glass-panel rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setEditingVehicle(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-white font-['Outfit'] mb-6 flex items-center space-x-2">
              <Palette className="w-6 h-6 text-blue-400" />
              <span>360° Görselleri & Renk Yönetimi ({editingVehicle.name})</span>
            </h2>

            <form onSubmit={handleUpdateSubmit} className="space-y-6 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Model Adı</label>
                  <input
                    type="text"
                    value={editingVehicle.name}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, name: e.target.value })}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Fiyat (TL)</label>
                  <input
                    type="number"
                    value={editingVehicle.price}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, price: Number(e.target.value) })}
                    className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* TECHNICAL SPECIFICATIONS CMS BLOCK */}
              <div className="p-5 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                  <Car className="w-4 h-4 text-blue-400" />
                  <span>Resmi Teknik Bilgiler (Model Detay Sayfası Tablosu)</span>
                </h3>

                <div>
                  <label className="block text-gray-300 mb-1 font-medium">Slogan / Açıklama Metni</label>
                  <input
                    type="text"
                    value={editingVehicle.tagline || ''}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, tagline: e.target.value })}
                    placeholder="Bindiğin gibi değil. İdeal Şehir Aracı."
                    className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Peak Motor Gücü</label>
                    <input
                      type="text"
                      value={editingVehicle.motorPower || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, motorPower: e.target.value })}
                      placeholder="12 kW (Peak Motor Gücü)"
                      className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Batarya Tipi & Kapasitesi</label>
                    <input
                      type="text"
                      value={editingVehicle.battery || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, battery: e.target.value })}
                      placeholder="9.98 kWh LFP (Lityum Demir Fosfat)"
                      className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Menzil (km)</label>
                    <input
                      type="number"
                      value={editingVehicle.rangeKm || 0}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, rangeKm: Number(e.target.value) })}
                      className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Azami Hız (km/s)</label>
                    <input
                      type="number"
                      value={editingVehicle.topSpeed || 0}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, topSpeed: Number(e.target.value) })}
                      className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Ehliyet Tipi</label>
                    <input
                      type="text"
                      value={editingVehicle.licenseType || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, licenseType: e.target.value })}
                      placeholder="B / B1 (16 Yaş ve Üzeri)"
                      className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Boyutlar (U x G x Y)</label>
                    <input
                      type="text"
                      value={editingVehicle.dimensions || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, dimensions: e.target.value })}
                      placeholder="2.631 mm x 1.498 mm x 1.621 mm"
                      className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Şarj Alım Gücü</label>
                    <input
                      type="text"
                      value={editingVehicle.chargePower || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, chargePower: e.target.value })}
                      placeholder="3,3 kW/s Ev Tipi 220V"
                      className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Şarj Süresi</label>
                    <input
                      type="text"
                      value={editingVehicle.chargeTime || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, chargeTime: e.target.value })}
                      placeholder="2 Saat (%20 - %80)"
                      className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Kapı / Koltuk / Bagaj Hacmi</label>
                    <input
                      type="text"
                      value={editingVehicle.capacityDetails || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, capacityDetails: e.target.value })}
                      placeholder="3 Kapı / 2 Koltuk / 184 L"
                      className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 font-medium">Jant Çapı</label>
                    <input
                      type="text"
                      value={editingVehicle.rimSize || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, rimSize: e.target.value })}
                      placeholder="13 inç Alaşım Jant"
                      className="w-full bg-black/40 border border-blue-500/30 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 360 Degree Colors Management Section */}
              <div className="p-5 rounded-2xl bg-[#0D1527] border border-blue-500/20 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-blue-400" />
                      <span>Renk Seçenekleri & 360° Açı Görselleri</span>
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Görselleri sağa/sola sürükleyerek veya sol/sağ ok butonları ile sıralarını değiştirebilirsiniz.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-500/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni Renk Ekle</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {editingVehicle.colors.map((c, colorIdx) => (
                    <div key={colorIdx} className="p-4 rounded-2xl bg-[#080E1A] border border-blue-500/15 space-y-4">
                      
                      {/* Color Header Inputs */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={c.hex}
                            onChange={(e) => handleColorFieldChange(colorIdx, 'hex', e.target.value)}
                            className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                            title="Renk Seçici"
                          />
                          <div>
                            <span className="text-[10px] text-gray-400 block mb-0.5">Renk Adı:</span>
                            <input
                              type="text"
                              placeholder="Renk Adı (örn. Akşam Güneşi)"
                              value={c.name}
                              onChange={(e) => handleColorFieldChange(colorIdx, 'name', e.target.value)}
                              className="bg-[#141E33] border border-white/10 rounded-lg p-2 text-white text-xs w-36 font-semibold"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block mb-0.5">Rozet Metni:</span>
                            <input
                              type="text"
                              placeholder="Rozet Metni"
                              value={c.badge || c.name}
                              onChange={(e) => handleColorFieldChange(colorIdx, 'badge', e.target.value)}
                              className="bg-[#141E33] border border-white/10 rounded-lg p-2 text-white text-xs w-40"
                            />
                          </div>
                        </div>

                        {/* File Upload Button for this color */}
                        <div className="flex items-center space-x-2">
                          <label className="cursor-pointer px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-500 hover:opacity-90 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-500/20">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadingColorIdx === colorIdx ? 'Yükleniyor...' : 'Görsel Yükle (PC)'}</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(colorIdx, e)}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handleRemoveColor(colorIdx)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                            title="Rengi Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 360 Degree Angle Image Preview Thumbnails Grid with DRAG & DROP + ARROWS */}
                      <div className="space-y-2 pt-1 border-t border-white/5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-300 font-semibold flex items-center space-x-1">
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                            <span>Yüklü 360° Açı Görselleri Ön İzleme ({c.angleImages?.length || 0} Açı):</span>
                          </span>
                          <span className="text-gray-400 text-[10px] font-normal flex items-center space-x-1">
                            <GripHorizontal className="w-3 h-3 text-blue-400" />
                            <span>Sıralamayı değiştirmek için kutuları sağa/sola sürükleyin</span>
                          </span>
                        </div>

                        {c.angleImages && c.angleImages.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {c.angleImages.map((imgUrl, imgIdx) => (
                              <div
                                key={imgIdx}
                                draggable
                                onDragStart={() => onDragStartHandler(colorIdx, imgIdx)}
                                onDragOver={onDragOverHandler}
                                onDrop={() => onDropHandler(colorIdx, imgIdx)}
                                className="group relative aspect-square rounded-xl overflow-hidden bg-[#141E33] border border-blue-500/30 flex items-center justify-center cursor-grab active:cursor-grabbing hover:border-blue-400 transition-all shadow-md hover:shadow-blue-500/30"
                              >
                                <Image
                                  src={imgUrl}
                                  alt={`Açı #${imgIdx + 1}`}
                                  fill
                                  draggable={false}
                                  className="object-contain p-1 select-none"
                                />
                                
                                {/* Angle Number Badge */}
                                <span className="absolute top-1 left-1 bg-black/80 text-blue-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-500/30">
                                  #{imgIdx + 1}
                                </span>

                                {/* Move Left/Right Controls on Hover */}
                                <div className="absolute inset-x-0 bottom-0 bg-black/80 p-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    disabled={imgIdx === 0}
                                    onClick={() => handleMoveAngleImage(colorIdx, imgIdx, imgIdx - 1)}
                                    className="p-1 hover:text-blue-400 disabled:opacity-30 disabled:hover:text-gray-400"
                                    title="Sola Taşı"
                                  >
                                    <ArrowLeft className="w-3 h-3" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAngleImage(colorIdx, imgIdx)}
                                    className="p-1 text-red-400 hover:text-red-300"
                                    title="Açıyı Sil"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>

                                  <button
                                    type="button"
                                    disabled={imgIdx === (c.angleImages?.length || 0) - 1}
                                    onClick={() => handleMoveAngleImage(colorIdx, imgIdx, imgIdx + 1)}
                                    className="p-1 hover:text-blue-400 disabled:opacity-30 disabled:hover:text-gray-400"
                                    title="Sağa Taşı"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-gray-500 text-xs">
                            Henüz bu renk için 360° açı görseli yüklenmedi. Görsel Yükle butonunu kullanarak resimleri ekleyebilirsiniz.
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center space-x-2 text-sm"
              >
                <Save className="w-4 h-4" />
                <span>360° Sıralaması & Tüm Değişiklikleri Kaydet</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
