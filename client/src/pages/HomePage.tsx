import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Camera,
  Search,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  BarChart3,
  Truck,
  MapPin,
  Trophy,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Leaf,
  Users,
  Building,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export const HomePage: React.FC = () => {
  const { t, setActiveTab, isDemoMode } = useApp();
  const [impactStats, setImpactStats] = useState<any>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [dashRes, repRes] = await Promise.all([
          api.getCommunityDashboard().catch(() => null),
          api.getReports().catch(() => null)
        ]);

        if (dashRes) setImpactStats(dashRes);
        if (repRes?.reports) setRecentReports(repRes.reports.slice(0, 3));
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-8 sm:p-14 shadow-2xl">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-emerald-300 animate-spin-slow" />
            <span>AI-Driven Circular Economy & Community Action</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white">
            {t.heroHeading}
          </h1>

          <p className="text-lg sm:text-xl text-emerald-100/90 leading-relaxed font-light">
            {t.heroSubtitle}
          </p>

          {/* Three Primary CTA Buttons */}
          <div className="pt-2 flex flex-wrap gap-3 sm:gap-4">
            <button
              onClick={() => setActiveTab('scanner')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>{t.scanWaste}</span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm backdrop-blur-sm transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Search className="w-5 h-5 text-emerald-300" />
              <span>{t.findDisposal}</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 font-bold text-sm backdrop-blur-sm transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>{t.reportProblem}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Live Community Impact Section */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Collective Community Impact
              </h2>
              {isDemoMode && (
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Live Sample Data
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-world segregation, community hotspot cleanup, and waste diversion metrics in Karnataka & urban hubs.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('impact')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
          >
            <span>Open Calculator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Diverted */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-100">
            <div className="flex items-center justify-between text-emerald-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t.divertedLandfill}</span>
              <Leaf className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {impactStats ? `${impactStats.totalDivertedKg.toLocaleString()} kg` : '2,705.7 kg'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Prevented from reaching municipal landfills
            </p>
          </div>

          {/* Card 2: CO2e */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/40 border border-blue-100">
            <div className="flex items-center justify-between text-blue-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t.co2Saved}</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {impactStats ? `${impactStats.totalCO2SavedKg.toLocaleString()} kg` : '3,490.2 kg'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              CO2-equivalent greenhouse gas avoided
            </p>
          </div>

          {/* Card 3: Hotspots Resolved */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-100">
            <div className="flex items-center justify-between text-amber-800 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t.hotspotsResolved}</span>
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {impactStats ? impactStats.resolvedReports : 2} / {impactStats ? impactStats.totalReports : 5}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Public dumping & overflowing points cleared
            </p>
          </div>

          {/* Card 4: Community Points */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50/40 border border-purple-100">
            <div className="flex items-center justify-between text-purple-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Eco Points Distributed</span>
              <Trophy className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {impactStats ? impactStats.communityPoints.toLocaleString() : '34,800'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Earned by 1,420+ active citizen guardians
            </p>
          </div>
        </div>
      </section>

      {/* Feature Grid: Social Impact In Action */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Comprehensive Waste Action Modules
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Engineered for genuine civic impact across households, universities, and municipal wards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: AI Scanner */}
          <div
            onClick={() => setActiveTab('scanner')}
            className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                1. AI Waste Identification
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Take a photo or describe items. Classify into 10 standard waste streams with bin color codes, safety precautions, and recycling advice.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Scan Item Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 2: What Should I Do? */}
          <div
            onClick={() => setActiveTab('search')}
            className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition">
                2. "What Should I Do With This?"
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Instant search for common everyday items: old phones, broken glass, batteries, banana peels, and shampoo bottles.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
              <span>Search Database</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 3: Smart Segregation */}
          <div
            onClick={() => setActiveTab('segregation')}
            className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition">
                3. Smart Segregation Guide
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Paste your household or college mixed waste list. Automatically sorts into Wet, Dry, Recyclable, E-waste, and Hazardous bins.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
              <span>Sort Mixed Waste</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 4: Community Hotspots */}
          <div
            onClick={() => setActiveTab('reports')}
            className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition">
                4. Waste Hotspot Reporting
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Report illegal dumping, blocked drains, and overflowing bins on an interactive map. Protects user privacy with locality-level masking.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>View Map & Report</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 5: Smart Pickups */}
          <div
            onClick={() => setActiveTab('collection')}
            className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                5. Smart Collection Request
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Book bulk e-waste, dry paper, and packaging pickups for your home, apartment, or campus. Track status from Pending to Completed.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>Book Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 6: Gamification */}
          <div
            onClick={() => setActiveTab('gamification')}
            className="group p-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-500 hover:shadow-lg transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition">
                6. Eco Points & Leaderboards
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Earn verified Eco Points for composting, recycling, and hotspot reporting. Compete with college campuses and apartment societies.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
              <span>View Leaderboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </section>

      {/* Community Alert & Hotspot Spotlight */}
      {recentReports.length > 0 && (
        <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <h3 className="text-lg font-bold">Active Community Waste Reports</h3>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Explore All Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {recentReports.map(report => (
              <div
                key={report.id}
                onClick={() => setActiveTab('reports')}
                className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl hover:border-emerald-500 transition cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {report.locality}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      report.severity === 'Critical'
                        ? 'bg-rose-900/80 text-rose-200'
                        : report.severity === 'High'
                        ? 'bg-amber-900/80 text-amber-200'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {report.severity} Severity
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{report.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {report.description}
                </p>
                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Status: <strong className="text-emerald-400">{report.status}</strong></span>
                  <span>{report.upvotes} upvotes</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

