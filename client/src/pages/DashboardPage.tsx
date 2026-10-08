import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  BarChart3,
  Leaf,
  Trophy,
  Truck,
  MapPin,
  TrendingUp,
  RefreshCw,
  Camera,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export const DashboardPage: React.FC = () => {
  const { t, ecoPoints, setActiveTab, isDemoMode } = useApp();

  const [communityData, setCommunityData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getCommunityDashboard();
        setCommunityData(data);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Integrated Analytics & Circular Metrics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            EcoSort Community & Citizen Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time tracking of waste diversion, circular recycling, and municipal hotspot resolution.
          </p>
        </div>

        {isDemoMode && (
          <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
            Live Urban Sample Mode
          </span>
        )}
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Diverted */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Waste Diverted</span>
            <Leaf className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {communityData ? `${communityData.totalDivertedKg.toLocaleString()} kg` : '2,705.7 kg'}
          </div>
          <p className="text-[11px] text-slate-400">Total physical waste kept out of landfills</p>
        </div>

        {/* Total CO2e Saved */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-[10px] uppercase font-bold tracking-wider">CO2e Emissions Prevented</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {communityData ? `${communityData.totalCO2SavedKg.toLocaleString()} kg` : '3,490.2 kg'}
          </div>
          <p className="text-[11px] text-slate-400">Greenhouse gas emission offset</p>
        </div>

        {/* Hotspots Resolved */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[10px] uppercase font-bold tracking-wider">Hotspots Cleared</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {communityData ? communityData.resolvedReports : 2} / {communityData ? communityData.totalReports : 5}
          </div>
          <p className="text-[11px] text-slate-400">Public dumping points verified resolved</p>
        </div>

        {/* Citizen Eco Points */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-[10px] uppercase font-bold tracking-wider">Your Eco Points</span>
            <Trophy className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {ecoPoints} pts
          </div>
          <p className="text-[11px] text-slate-400">Level 3 (Eco Guardian status)</p>
        </div>
      </div>

      {/* Waste Category Breakdown Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Material Stream Breakdown</h3>
          <p className="text-xs text-slate-500">Separated quantities processed across community initiatives</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Organic Composting</span>
            <div className="text-xl font-extrabold text-emerald-950">
              {communityData ? communityData.totalOrganicKg : 1250} kg
            </div>
            <p className="text-[10px] text-emerald-700">High-nitrogen kitchen & farm waste</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Paper & Cardboard</span>
            <div className="text-xl font-extrabold text-blue-950">
              {communityData ? communityData.totalPaperKg : 890} kg
            </div>
            <p className="text-[10px] text-blue-700">Recycled via paper pulping mills</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Plastic Packaging</span>
            <div className="text-xl font-extrabold text-amber-950">
              {communityData ? communityData.totalPlasticKg : 420.5} kg
            </div>
            <p className="text-[10px] text-amber-700">PET & HDPE circular granules</p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-100 border border-stone-300 space-y-1">
            <span className="text-[10px] font-bold text-stone-800 uppercase tracking-wider">E-Waste Safely Handled</span>
            <div className="text-xl font-extrabold text-stone-950">
              {communityData ? communityData.totalEWasteKg : 145.2} kg
            </div>
            <p className="text-[10px] text-stone-600">Heavy metals & circuit recovery</p>
          </div>
        </div>

        {/* Visual Monthly Trends Bar Chart */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Monthly Waste Diversion Trend (kg):
          </span>

          <div className="grid grid-cols-5 gap-3 items-end h-44 pt-4 px-4 bg-slate-50 rounded-2xl border border-slate-200">
            {communityData?.monthlyTrends?.map((trend: any, idx: number) => {
              const maxVal = 3000;
              const heightPercent = Math.min(100, Math.round((trend.divertedKg / maxVal) * 100));

              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-bold text-emerald-800 opacity-0 group-hover:opacity-100 transition mb-1">
                    {trend.divertedKg} kg
                  </span>
                  <div
                    className="w-full bg-emerald-600 group-hover:bg-emerald-500 rounded-t-lg transition-all duration-500"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  <span className="text-[11px] font-bold text-slate-600 mt-2">
                    {trend.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Jump Shortcuts */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold">Quick Civic Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setActiveTab('scanner')}
            className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition flex items-center justify-between text-xs font-bold cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Scan New Item</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveTab('collection')}
            className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition flex items-center justify-between text-xs font-bold cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Book Bulk Pickup</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition flex items-center justify-between text-xs font-bold cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Report Waste Hotspot</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

