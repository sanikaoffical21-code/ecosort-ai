import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Camera,
  Search,
  Layers,
  BarChart3,
  Truck,
  MapPin,
  Trophy,
  BookOpen,
  LayoutDashboard,
  ShieldAlert,
  Globe,
  Sun,
  Menu,
  X,
  Leaf
} from 'lucide-react';
import { LanguageCode } from '../types';

export const Navbar: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    userRole,
    setUserRole,
    ecoPoints,
    highContrast,
    toggleHighContrast,
    activeTab,
    setActiveTab,
    isDemoMode,
    toggleDemoMode
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t.navHome, icon: Leaf },
    { id: 'scanner', label: t.navScanner, icon: Camera, highlight: true },
    { id: 'search', label: t.navSearch, icon: Search },
    { id: 'segregation', label: t.navSegregate, icon: Layers },
    { id: 'impact', label: t.navImpact, icon: BarChart3 },
    { id: 'collection', label: t.navCollections, icon: Truck },
    { id: 'reports', label: t.navReports, icon: MapPin },
    { id: 'gamification', label: t.navChallenges, icon: Trophy },
    { id: 'education', label: t.navEducation, icon: BookOpen },
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'admin', label: t.navAdmin, icon: ShieldAlert, adminBadge: true }
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top micro-bar for Demo Mode & Civic Localities */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4 font-medium flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{t.verifiedLocalities}</span>
          <span className="hidden sm:inline text-emerald-300">|</span>
          <span className="hidden sm:inline text-emerald-300">Indiranagar • Koramangala • Whitefield • RVCE Campus</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDemoMode}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
              isDemoMode
                ? 'bg-emerald-700 text-emerald-100 border border-emerald-500'
                : 'bg-emerald-950 text-emerald-400 hover:text-white'
            }`}
            title="Toggle realistic sample data"
          >
            {isDemoMode ? '⚡ Demo Mode: ON' : 'Demo Mode: OFF'}
          </button>
          <span className="text-emerald-400 text-[11px]">v1.0 (Hackathon Edition)</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl text-slate-900 tracking-tight">{t.appTitle}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Civic AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block line-clamp-1">{t.tagline}</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1" aria-label="Main Navigation">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : item.highlight
                      ? 'text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100'
                      : item.adminBadge
                      ? 'text-amber-800 hover:bg-amber-50'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Eco Points Badge */}
            <button
              onClick={() => handleNavClick('gamification')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200 text-amber-900 px-2.5 py-1.5 rounded-full text-xs font-bold shadow-xs hover:border-amber-400 transition"
              title="Your Eco Points – Click to view leaderboard & challenges"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>{ecoPoints}</span>
              <span className="text-[10px] text-amber-700 hidden sm:inline">pts</span>
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as LanguageCode)}
                aria-label="Select Language"
                className="pl-7 pr-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer font-medium"
              >
                <option value="en">English</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>

            {/* Accessibility Contrast Toggle */}
            <button
              onClick={toggleHighContrast}
              aria-label="Toggle High Contrast Mode"
              className={`p-1.5 rounded-lg border transition ${
                highContrast
                  ? 'bg-slate-900 text-amber-300 border-slate-900'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
              title="High Contrast Accessibility Mode"
            >
              <Sun className="w-4 h-4" />
            </button>

            {/* Role Switcher (Citizen vs Admin) */}
            <button
              onClick={() => {
                const next = userRole === 'citizen' ? 'admin' : 'citizen';
                setUserRole(next);
                if (next === 'admin') setActiveTab('admin');
              }}
              className={`hidden md:flex items-center gap-1 text-[11px] font-bold px-2 py-1.5 rounded-md border transition ${
                userRole === 'admin'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Switch between Citizen view and Community Administrator view"
            >
              <ShieldAlert className="w-3 h-3 text-amber-700" />
              <span>{userRole === 'admin' ? 'Admin Mode' : 'Citizen Mode'}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2 pt-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold text-left transition ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Current Role:</span>
            <button
              onClick={() => {
                setUserRole(userRole === 'citizen' ? 'admin' : 'citizen');
              }}
              className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 rounded-md border border-amber-200"
            >
              Toggle: {userRole === 'admin' ? 'Admin Mode' : 'Citizen Mode'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

