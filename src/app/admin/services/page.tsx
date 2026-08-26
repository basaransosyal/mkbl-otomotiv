'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Wrench,
  Phone,
  Mail,
  RefreshCw,
  Search,
  MessageSquare,
  FileSpreadsheet,
  FileText,
  Trash2,
  AlertTriangle,
  CheckSquare,
  Square,
  ShieldAlert,
  X
} from 'lucide-react';
import { ServiceAppointment } from '../../../lib/data';
import { exportToCSV, exportToExcel } from '../../../lib/exportUtils';
import { getLoggedInAdminUser, isSuperAdminUser, LoggedInAdminUser } from '../../../lib/auth';

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentUser, setCurrentUser] = useState<LoggedInAdminUser | null>(null);

  // Selection & Bulk Actions State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; mode: 'single' | 'bulk'; targetId?: string }>({
    isOpen: false,
    mode: 'single',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const isEditor = currentUser?.role === 'EDİTÖR';
  const isSuperAdmin = isSuperAdminUser(currentUser);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch services error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    setCurrentUser(getLoggedInAdminUser());
  }, []);

  const handleStatusChange = async (id: string, newStatus: ServiceAppointment['status']) => {
    if (isEditor) {
      alert('Editör rolündeki kullanıcılar durumlarda değişiklik yapamaz. Sadece okuma yetkiniz bulunmaktadır.');
      return;
    }
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setServices((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
        );
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const filtered = services.filter((srv) => {
    const matchesSearch =
      srv.fullName.toLowerCase().includes(search.toLowerCase()) ||
      srv.phone.includes(search) ||
      srv.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
      srv.vehicleModel.toLowerCase().includes(search.toLowerCase()) ||
      (srv.userNotes && srv.userNotes.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = filterStatus === 'ALL' || srv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Checkbox Selection Logic
  const isAllSelected = filtered.length > 0 && filtered.every((item) => selectedIds.includes(item.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((item) => item.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Delete Action Handlers
  const handleOpenDeleteModal = (mode: 'single' | 'bulk', targetId?: string) => {
    if (!isSuperAdmin) {
      alert('Bu işlemi yapmaya yetkiniz yoktur. Form silme yetkisi sadece Süper Admin yetkisine sahip kullanıcılardadır.');
      return;
    }
    setDeleteModal({ isOpen: true, mode, targetId });
  };

  const handleConfirmDelete = async () => {
    if (!isSuperAdmin) return;
    setIsDeleting(true);

    try {
      if (deleteModal.mode === 'single' && deleteModal.targetId) {
        const res = await fetch(`/api/services/${deleteModal.targetId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setServices((prev) => prev.filter((s) => s.id !== deleteModal.targetId));
          setSelectedIds((prev) => prev.filter((id) => id !== deleteModal.targetId));
        }
      } else if (deleteModal.mode === 'bulk' && selectedIds.length > 0) {
        const res = await fetch('/api/services', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds }),
        });
        if (res.ok) {
          setServices((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
          setSelectedIds([]);
        }
      }
    } catch (err) {
      console.error('Delete service error:', err);
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, mode: 'single' });
    }
  };

  // Export functions
  const getExportData = () => {
    const headers = ['Müşteri Adı', 'Plaka', 'Telefon', 'E-Posta', 'Model', 'Servis İşlemi', 'Randevu Tarihi', 'Saat', 'Servis Notu / Arıza', 'Durum'];
    const rows = filtered.map((s) => [
      s.fullName,
      s.licensePlate,
      s.phone,
      s.email,
      s.vehicleModel,
      s.serviceType,
      s.appointmentDate,
      s.appointmentTime,
      s.userNotes || '',
      s.status
    ]);
    return { headers, rows };
  };

  const handleExportCSV = () => {
    const { headers, rows } = getExportData();
    exportToCSV('Servis_Randevulari', headers, rows);
  };

  const handleExportExcel = () => {
    const { headers, rows } = getExportData();
    exportToExcel('Servis_Randevulari', 'ServisRandevuları', headers, rows);
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-blue-500/20 pb-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-blue-600/30 text-gray-300 hover:text-white border border-blue-500/30 transition-all text-xs font-semibold shadow-md mb-3"
          >
            <ChevronLeft className="w-4 h-4 text-blue-400" />
            <span>Geri (Admin Paneline Dön)</span>
          </Link>
          <h1 className="text-3xl font-bold text-white font-['Outfit']">
            Servis Randevuları Yönetimi
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Müşterilerinizin servis randevusu alırken ilettiği tüm şikayet, arıza ve bakım notları aşağıda listelenmektedir.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Buttons */}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            title="CSV Formatında İndir"
          >
            <FileText className="w-4 h-4" />
            <span>CSV İndir (.csv)</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            title="Excel Formatında İndir"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel İndir (.xlsx)</span>
          </button>

          <button
            onClick={fetchServices}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-blue-500/20 transition-colors cursor-pointer"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-blue-500/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Müşteri adı, plaka veya servis notu ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0D1527] border border-blue-500/20 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'BEKLEMEDE', 'ONAYLANDI', 'TAMAMLANDI', 'İPTAL'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                filterStatus === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'Tümü' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Selection & Bulk Delete Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between animate-in fade-in-50 duration-200">
          <div className="flex items-center space-x-3 text-xs font-bold text-rose-200">
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/30 border border-rose-500/50">
              {selectedIds.length} Kayıt Seçildi
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-gray-400 hover:text-white underline text-[11px]"
            >
              Seçimi Temizle
            </button>
          </div>

          <div>
            {isSuperAdmin ? (
              <button
                onClick={() => handleOpenDeleteModal('bulk')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold text-xs shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Seçilen {selectedIds.length} Kaydı Sil</span>
              </button>
            ) : (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Form silme yetkisi sadece Süper Admin rolündedir</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Services Table */}
      <div className="glass-panel rounded-3xl p-6 border border-blue-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0D1527] text-gray-400 uppercase text-[10px]">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-slate-700 bg-[#091122] text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="p-4">Müşteri & Plaka</th>
                <th className="p-4">Araç Modeli</th>
                <th className="p-4">Servis İşlemi</th>
                <th className="p-4">Tarih & Saat</th>
                <th className="p-4 min-w-[280px]">Servis / Arıza Notu</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">Durum Değiştir</th>
                <th className="p-4 text-center w-16">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-500 italic">
                    Kayıtlı servis randevusu bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map((srv) => {
                  const isSelected = selectedIds.includes(srv.id);
                  return (
                    <tr
                      key={srv.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-rose-950/20' : 'hover:bg-white/5'
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(srv.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-[#091122] text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{srv.fullName}</div>
                        <div className="font-mono text-blue-400 font-bold text-xs mt-0.5">
                          {srv.licensePlate}
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-white">{srv.vehicleModel}</td>
                      <td className="p-4 text-gray-300">{srv.serviceType}</td>
                      <td className="p-4">
                        <div className="font-semibold text-white">{srv.appointmentDate}</div>
                        <div className="text-[10px] text-amber-400">Saat: {srv.appointmentTime}</div>
                      </td>

                      {/* VISIBLE SERVICE / CUSTOMER USER NOTES WITH BREAK-WORDS FIX */}
                      <td className="p-4 max-w-md">
                        {srv.userNotes ? (
                          <div className="p-3 rounded-2xl bg-[#0D1527] border border-blue-500/20 text-gray-200 text-xs flex items-start space-x-2 max-w-full overflow-hidden">
                            <MessageSquare className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                            <div className="leading-relaxed whitespace-pre-wrap break-words break-all overflow-hidden flex-1">
                              {srv.userNotes}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic text-[11px]">Not bırakılmadı</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            srv.status === 'BEKLEMEDE'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : srv.status === 'ONAYLANDI'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : srv.status === 'TAMAMLANDI'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {srv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={srv.status}
                          onChange={(e) =>
                            handleStatusChange(srv.id, e.target.value as ServiceAppointment['status'])
                          }
                          className="bg-[#0D1527] border border-blue-500/20 text-white rounded-lg p-1.5 text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value="BEKLEMEDE">BEKLEMEDE</option>
                          <option value="ONAYLANDI">ONAYLANDI</option>
                          <option value="TAMAMLANDI">TAMAMLANDI</option>
                          <option value="İPTAL">İPTAL</option>
                        </select>
                      </td>

                      {/* SINGLE DELETE BUTTON COLUMN (SUPER ADMIN ONLY) */}
                      <td className="p-4 text-center">
                        {isSuperAdmin ? (
                          <button
                            onClick={() => handleOpenDeleteModal('single', srv.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                            title="Servis Kaydını Sil (Süper Admin)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="p-2 rounded-xl bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed opacity-40"
                            title="Silme yetkisi sadece Süper Admin rolündedir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION DELETE MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in-50 duration-200">
          <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-rose-500/40 space-y-6 text-center shadow-2xl bg-[#0B132B]">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-xl">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white font-['Outfit']">
                {deleteModal.mode === 'bulk'
                  ? `${selectedIds.length} Servis Kaydı Silinecek`
                  : 'Servis Randevu Kaydı Silinecek'}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Bu servis randevu kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, mode: 'single' })}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold text-xs shadow-lg flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                {isDeleting ? (
                  <span>Siliniyor...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Evet, Kalıcı Olarak Sil</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
