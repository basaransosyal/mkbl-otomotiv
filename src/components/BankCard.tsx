'use client';

import React, { useState } from 'react';
import { Copy, Check, Building2, ShieldCheck } from 'lucide-react';

interface BankCardProps {
  bank: {
    bankName: string;
    branchName?: string;
    branchCode?: string;
    accountNo?: string;
    iban: string;
    accountHolder?: string;
    logoBg?: string;
  };
}

export default function BankCard({ bank }: BankCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(bank.iban.replace(/\s/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0F1A30] to-[#0A1122] border border-blue-500/20 shadow-xl space-y-4 hover:border-emerald-500/40 transition-all group relative overflow-hidden">
      {/* Top Header & Bank Name */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${bank.logoBg || 'from-emerald-600 to-teal-800'} flex items-center justify-center text-white shadow-md border border-white/20`}>
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white font-['Outfit'] group-hover:text-emerald-400 transition-colors">
              {bank.bankName}
            </h3>
            <p className="text-[11px] text-gray-400 font-medium">{bank.branchName || 'Kurumsal Şube'}</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3" />
          <span>ONAYLI HESAP</span>
        </span>
      </div>

      {/* Account Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs text-gray-300 bg-[#070D1B] p-3.5 rounded-2xl border border-slate-800">
        <div>
          <span className="text-[10px] text-gray-500 uppercase font-bold block">Şube Kodu:</span>
          <span className="font-mono text-gray-200 font-bold">{bank.branchCode || '-'}</span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 uppercase font-bold block">Hesap No:</span>
          <span className="font-mono text-gray-200 font-bold">{bank.accountNo || '-'}</span>
        </div>
        <div className="col-span-2 pt-1 border-t border-slate-800/60">
          <span className="text-[10px] text-gray-500 uppercase font-bold block">Hesap Sahibi (Alıcı Unvanı):</span>
          <span className="font-semibold text-emerald-300 text-[11px] block truncate">
            {bank.accountHolder || 'BAŞARAN OTOMOTİV OTELCİLİK TURİZM İNŞ. A.Ş.'}
          </span>
        </div>
      </div>

      {/* IBAN Box with Instant Copy Button */}
      <div className="space-y-1.5 pt-1">
        <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">
          IBAN Numarası:
        </label>
        <div className="flex items-center justify-between bg-[#060A14] border border-slate-700/80 rounded-2xl p-2.5 sm:p-3 space-x-2">
          <span className="font-mono text-xs sm:text-sm font-extrabold text-white tracking-wide truncate">
            {bank.iban}
          </span>
          <button
            onClick={handleCopy}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
              copied
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
            }`}
            title="IBAN Kopyala"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Kopyala</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
