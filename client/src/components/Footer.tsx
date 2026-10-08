import React from 'react';
import { Leaf, Heart, Shield, HelpCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setActiveTab, isDemoMode, aiEngineStatus } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">EcoSort AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering households, colleges, and civic bodies with AI-guided waste segregation, hotspot tracking, and circular recycling action.
            </p>
            <div className="pt-2 text-[11px] text-emerald-400 font-mono">
              Engine: {aiEngineStatus}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Core Modules</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('scanner')} className="hover:text-emerald-400 transition">
                  AI Waste Camera Scanner
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('search')} className="hover:text-emerald-400 transition">
                  What Should I Do With This?
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('segregation')} className="hover:text-emerald-400 transition">
                  Smart Segregation Assistant
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('impact')} className="hover:text-emerald-400 transition">
                  Eco Impact & CO2 Calculator
                </button>
              </li>
            </ul>
          </div>

          {/* Community & Civic */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Community Action</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('reports')} className="hover:text-emerald-400 transition">
                  Community Hotspot Map & Reports
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('collection')} className="hover:text-emerald-400 transition">
                  Book E-Waste / Dry Waste Pickup
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('gamification')} className="hover:text-emerald-400 transition">
                  Leaderboards & Eco Challenges
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('education')} className="hover:text-emerald-400 transition">
                  Educational Guides & Myth Busters
                </button>
              </li>
            </ul>
          </div>

          {/* Civic Compliance & Safety Disclaimer */}
          <div className="space-y-2 text-xs text-slate-400">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Safety & Disclaimer</h4>
            <p className="leading-relaxed">
              <span className="text-amber-400 font-semibold">Safety Notice:</span> Never handle chemical solvents, broken glass, or clinical biohazard waste without protective gloves and authorized disposal channels.
            </p>
            <p className="text-[11px] text-slate-500 pt-1">
              Impact calculations are scientific estimates derived from EPA & IPCC Life Cycle Assessment data.
            </p>
            {isDemoMode && (
              <span className="inline-block bg-slate-800 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-slate-700">
                Hackathon Demo Mode Active
              </span>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 EcoSort AI. Built for Sustainable Communities and Zero-Waste Cities.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Privacy Protected
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Heart className="w-3.5 h-3.5 text-rose-400" /> Open Civic Impact
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

