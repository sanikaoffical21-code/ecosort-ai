import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Leaf,
  Droplets,
  Zap,
  TrendingUp,
  Info,
  Sparkles,
  Save,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../services/api';
import { ImpactCalculation, ImpactLog } from '../types';

export const ImpactPage: React.FC = () => {
  const { t, addPoints, showToast } = useApp();

  const [plasticKg, setPlasticKg] = useState<number>(3.5);
  const [paperKg, setPaperKg] = useState<number>(10.0);
  const [eWasteKg, setEWasteKg] = useState<number>(1.5);
  const [organicKg, setOrganicKg] = useState<number>(14.0);

  const [calc, setCalc] = useState<ImpactCalculation | null>(null);
  const [logs, setLogs] = useState<ImpactLog[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showHowWeCalculate, setShowHowWeCalculate] = useState<boolean>(false);

  // Recalculate on inputs change
  useEffect(() => {
    let active = true;
    api.calculateImpact({ plasticKg, paperKg, eWasteKg, organicKg })
      .then(res => {
        if (active) setCalc(res);
      })
      .catch(err => console.error(err));

    return () => {
      active = false;
    };
  }, [plasticKg, paperKg, eWasteKg, organicKg]);

  // Load past logs
  useEffect(() => {
    api.getImpactLogs()
      .then(res => {
        if (res.logs) setLogs(res.logs);
      })
      .catch(() => {});
  }, []);

  const handleLogImpact = async () => {
    if (plasticKg + paperKg + eWasteKg + organicKg <= 0) {
      showToast('Please enter at least some waste diversion amount.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.logImpact({ plasticKg, paperKg, eWasteKg, organicKg });
      if (res.success && res.log) {
        setLogs(prev => [res.log, ...prev]);
        addPoints(res.earnedPoints, 'Impact logged successfully! Carbon footprint offset.');
        showToast(`Impact saved! You earned +${res.earnedPoints} Eco Points.`, 'success');
      }
    } catch (err: any) {
      console.error('Log error:', err);
      showToast('Could not save impact log.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Life Cycle Assessment (LCA) Model • Transparent Coefficients</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.impactTitle}
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          {t.impactSubtitle}
        </p>
      </div>

      {/* Calculator Inputs Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            Enter Segregated & Recycled Waste Quantities:
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] tracking-wider uppercase">
            ESTIMATE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plastic */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-amber-900">
              <span>🧴 Plastic Recycled</span>
              <span className="text-sm font-extrabold">{plasticKg} kg</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="0.5"
              value={plasticKg}
              onChange={e => setPlasticKg(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-amber-700/80">
              <span>0 kg</span>
              <span>25 kg</span>
              <span>50 kg</span>
            </div>
          </div>

          {/* Paper / Cardboard */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-blue-900">
              <span>📦 Paper & Cardboard Recycled</span>
              <span className="text-sm font-extrabold">{paperKg} kg</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={paperKg}
              onChange={e => setPaperKg(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-blue-700/80">
              <span>0 kg</span>
              <span>50 kg</span>
              <span>100 kg</span>
            </div>
          </div>

          {/* E-waste */}
          <div className="p-4 rounded-2xl bg-stone-100 border border-stone-300 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-stone-900">
              <span>🔋 E-Waste Safely Diverted</span>
              <span className="text-sm font-extrabold">{eWasteKg} kg</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="0.5"
              value={eWasteKg}
              onChange={e => setEWasteKg(parseFloat(e.target.value))}
              className="w-full accent-stone-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-600">
              <span>0 kg</span>
              <span>15 kg</span>
              <span>30 kg</span>
            </div>
          </div>

          {/* Organic / Composting */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-emerald-900">
              <span>🍂 Organic Waste Composted</span>
              <span className="text-sm font-extrabold">{organicKg} kg</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={organicKg}
              onChange={e => setOrganicKg(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-emerald-700/80">
              <span>0 kg</span>
              <span>50 kg</span>
              <span>100 kg</span>
            </div>
          </div>
        </div>

        {/* Real-time Impact Results Grid */}
        {calc && (
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Calculated Ecological Savings:
              </h3>
              <span className="text-[11px] text-slate-500 font-semibold">
                Always Labeled: <strong>ESTIMATE</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Diverted */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Landfill Diverted
                </span>
                <div className="text-2xl font-black text-white">
                  {calc.divertedLandfillKg} kg
                </div>
                <p className="text-[10px] text-slate-400">Total physical waste kept out of dumps</p>
              </div>

              {/* CO2e */}
              <div className="p-4 rounded-2xl bg-emerald-600 text-white space-y-1">
                <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">
                  CO2e Avoided
                </span>
                <div className="text-2xl font-black text-white">
                  {calc.co2SavingsKg} kg
                </div>
                <p className="text-[10px] text-emerald-100">Greenhouse gas emission offset</p>
              </div>

              {/* Trees */}
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 space-y-1">
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>Trees Preserved</span>
                </span>
                <div className="text-2xl font-black text-teal-900">
                  {calc.treesEquivalent}
                </div>
                <p className="text-[10px] text-teal-700">Avoided virgin wood chemical pulping</p>
              </div>

              {/* Water */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>Water Conserved</span>
                </span>
                <div className="text-2xl font-black text-blue-900">
                  {calc.waterSavedLiters} L
                </div>
                <p className="text-[10px] text-blue-700">Fresh water saved in manufacturing loops</p>
              </div>
            </div>

            {/* "How We Calculate" Expandable Panel */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowHowWeCalculate(!showHowWeCalculate)}
                className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600" />
                  <span>How We Calculate: Scientific Life Cycle Assessment (LCA) Sources & Multipliers</span>
                </div>
                {showHowWeCalculate ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showHowWeCalculate && (
                <div className="p-5 bg-white border-t border-slate-200 text-xs text-slate-700 space-y-3 leading-relaxed">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <strong className="text-slate-900 block">Plastic (1.50 kg CO2e / kg):</strong>
                      <span className="text-[11px] text-slate-600">
                        Source: <em>EPA WARM v15 (2020)</em>. Accounts for avoided fossil naphtha extraction and high-pressure polymerization energy.
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <strong className="text-slate-900 block">Paper & Cardboard (0.90 kg CO2e / kg):</strong>
                      <span className="text-[11px] text-slate-600">
                        Source: <em>Defra UK & CPCB Guidelines (2023)</em>. Accounts for avoided chemical kraft pulping and landfill anaerobic methane. 17 trees saved per 1,000 kg.
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <strong className="text-slate-900 block">E-Waste (2.80 kg CO2e / kg):</strong>
                      <span className="text-[11px] text-slate-600">
                        Source: <em>UNEP Global E-waste Monitor (2022)</em>. "Urban mining" avoids carbon-intensive open-cast ore mining for copper, gold, and lithium.
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <strong className="text-slate-900 block">Composting (0.50 kg CO2e / kg):</strong>
                      <span className="text-[11px] text-slate-600">
                        Source: <em>IPCC 2019 Refinement</em>. Aerobic composting eliminates fugitive landfill methane (CH4 has 28x the global warming potential of CO2).
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic pt-1">
                    * Disclaimer: Real-world municipal savings vary depending on regional electricity grid mix and transport distances to certified recycling facilities.
                  </p>
                </div>
              )}
            </div>

            {/* Log Impact Button */}
            <div className="pt-2">
              <button
                onClick={handleLogImpact}
                disabled={isSaving}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Logging to Profile...' : t.logImpact}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Trend Visual Strip */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">4-Week Diversion Trend</h3>
          </div>
          <span className="text-xs text-slate-500">Consistent Weekly Progress</span>
        </div>

        {/* Responsive CSS Bar Chart */}
        <div className="pt-4 flex items-end justify-between gap-4 h-36 px-4 pb-2 border-b border-slate-200">
          <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-[10px] font-bold text-slate-600">30.1 kg</span>
            <div className="w-full max-w-[48px] bg-emerald-200 rounded-t-lg h-[45%]"></div>
            <span className="text-[10px] text-slate-500">Week 1</span>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-[10px] font-bold text-slate-600">35.9 kg</span>
            <div className="w-full max-w-[48px] bg-emerald-300 rounded-t-lg h-[55%]"></div>
            <span className="text-[10px] text-slate-500">Week 2</span>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-[10px] font-bold text-slate-600">40.2 kg</span>
            <div className="w-full max-w-[48px] bg-emerald-500 rounded-t-lg h-[70%]"></div>
            <span className="text-[10px] text-slate-500">Week 3</span>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-[10px] font-bold text-emerald-800">48.5 kg</span>
            <div className="w-full max-w-[48px] bg-emerald-600 rounded-t-lg h-[92%] shadow-sm"></div>
            <span className="text-[10px] font-bold text-emerald-900">This Week</span>
          </div>
        </div>
      </div>

      {/* History Log Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Personal Impact History</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">{logs.length} record(s)</span>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No impact records logged yet. Use the calculator above to record your first contribution!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Plastic (kg)</th>
                  <th className="py-2.5 px-3">Paper (kg)</th>
                  <th className="py-2.5 px-3">E-Waste (kg)</th>
                  <th className="py-2.5 px-3">Compost (kg)</th>
                  <th className="py-2.5 px-3 text-right">Diverted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {logs.map(log => {
                  const total = +(log.plasticKg + log.paperKg + log.eWasteKg + log.organicKg).toFixed(1);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 text-slate-500">{log.date}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{log.user}</td>
                      <td className="py-2.5 px-3">{log.plasticKg}</td>
                      <td className="py-2.5 px-3">{log.paperKg}</td>
                      <td className="py-2.5 px-3">{log.eWasteKg}</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-bold">{log.organicKg}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                        {total} kg
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
