import React from 'react';
import { useApp } from '../context/AppContext';
import { Award, Leaf, X, Printer, ShieldCheck, QrCode, Sparkles, TrendingUp } from 'lucide-react';

export const ImpactPassportModal: React.FC = () => {
  const { showPassport, setShowPassport, ecoPoints } = useApp();

  if (!showPassport) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden text-slate-900">
        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-green-900 p-6 text-white relative">
          <button
            onClick={() => setShowPassport(false)}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
              <Leaf className="w-5 h-5 text-emerald-300" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">
              Official Civic Credential
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight">Citizen Eco Passport</h2>
          <p className="text-xs text-emerald-100/80 mt-1">
            Certified Record of Circular Action & Landfill Diversion
          </p>
        </div>

        {/* Passport Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Identity & Level */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-2xl shadow-inner">
                🌱
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Citizen Eco-Guard</h3>
                <p className="text-xs text-slate-500">ID: ECO-KA-2026-9812</p>
                <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Level 3 Eco Guardian</span>
                </div>
              </div>
            </div>

            {/* Mock QR Code for verification */}
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <QrCode className="w-12 h-12 text-slate-800 mx-auto" />
              <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">VERIFIED</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                Total Eco Points
              </span>
              <span className="text-2xl font-black text-emerald-900">{ecoPoints} pts</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                Waste Diverted
              </span>
              <span className="text-2xl font-black text-blue-900">92.5 kg</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                Avoided CO2e
              </span>
              <span className="text-2xl font-black text-teal-900">118.4 kg</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                Active Streak
              </span>
              <span className="text-2xl font-black text-amber-900">6 Days 🔥</span>
            </div>
          </div>

          {/* Unlocked Badges Row */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Earned Civic Badges:
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800">
                <span>🌱</span> Segregation Specialist
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800">
                <span>🍂</span> Compost Hero
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800">
                <span>📍</span> Watchful Citizen
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800">
                <span>⚡</span> Zero-E-Waste
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-600 border border-slate-200 leading-relaxed">
            🌿 <strong>Civic Impact Notice:</strong> Data verified via EcoSort Smart Civic Protocol under municipal circular guidelines. Share this passport during campus competitions or apartment meetings to inspire collective action!
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export Passport Card</span>
            </button>
            <button
              onClick={() => setShowPassport(false)}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

