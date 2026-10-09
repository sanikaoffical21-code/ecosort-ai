import React from 'react';
import { useApp } from '../context/AppContext';
import { Building2, X, TrendingUp, AlertTriangle, CheckCircle2, Lightbulb, Users, Download } from 'lucide-react';

export const CampusInsightsModal: React.FC = () => {
  const { showCampusInsights, setShowCampusInsights } = useApp();

  if (!showCampusInsights) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white relative">
          <button
            onClick={() => setShowCampusInsights(false)}
            aria-label="Close modal"
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Institutional Civic Intelligence</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Weekly Campus & Apartment Insights Briefing
          </h2>
          <p className="text-sm text-blue-100/80 mt-1">
            Automated waste trend analytics for colleges, residential welfare associations (RWAs), and corporate parks.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Executive Summary */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between text-indigo-900 text-xs font-bold uppercase tracking-wider">
              <span>Executive Trend Summary</span>
              <span>Week 40 • October 2026</span>
            </div>
            <p className="text-sm text-indigo-950 font-medium leading-relaxed">
              Overall institutional segregation compliance reached <strong>84.2%</strong> across participating university hostels and Koramangala apartment blocks. Plastic waste diversion increased by <strong>18% week-on-week</strong> following student peer segregation audits.
            </p>
          </div>

          {/* Key Trend Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Positive Trend: Composting Surge</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Campus cafeteria organic waste collection reached 1,250 kg this month, converted 100% into on-campus landscaping humus.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Attention Area: Hostels E-Waste</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                4 dead laptop chargers and multiple batteries were dumped in dry bins in Block C. Recommend placing an e-waste kiosk near Tech Tower lobby.
              </p>
            </div>
          </div>

          {/* Recommended Action Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Recommended Action Items for Facilities Management:</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Deploy Dedicated E-Waste Drop Box:</strong> Place a clearly labeled brown e-waste drop kiosk in the main library and student cafeteria.</span>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Pre-Monsoon Drain Clearance:</strong> Schedule community clean-up drive around north boundary culverts to remove trapped soft plastics.</span>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Inter-Hostel Segregation Challenge:</strong> Launch a 7-day Zero-Single-Use challenge to boost student participation before semester exams.</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Auto-generated by EcoSort Institutional Analytics</span>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Briefing PDF</span>
              </button>
              <button
                onClick={() => setShowCampusInsights(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

