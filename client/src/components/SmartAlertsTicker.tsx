import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';
import { api } from '../services/api';
import { SmartAlert } from '../types';

export const SmartAlertsTicker: React.FC = () => {
  const { setActiveTab } = useApp();
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    api.getAlerts()
      .then(res => {
        if (res?.alerts) setAlerts(res.alerts);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (alerts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % alerts.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [alerts.length]);

  if (alerts.length === 0 || dismissed) return null;

  const currentAlert = alerts[currentIndex];

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
      <div
        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs shadow-2xs transition-all ${getAlertBg(
          currentAlert.type
        )}`}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="p-1 rounded-lg bg-white/80 shrink-0">
            <Bell className="w-3.5 h-3.5 text-emerald-700 animate-bounce" />
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 truncate">
            <strong className="font-extrabold shrink-0">{currentAlert.title}</strong>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="truncate text-[11px] font-medium">{currentAlert.message}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (currentAlert.title.includes('Overflowing') || currentAlert.title.includes('Reported')) {
                setActiveTab('reports');
              } else if (currentAlert.title.includes('E-Waste')) {
                setActiveTab('collection');
              } else {
                setActiveTab('dashboard');
              }
            }}
            className="text-[11px] font-bold text-emerald-800 hover:underline px-2 py-0.5 rounded bg-white/60"
          >
            Action Details
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
            aria-label="Dismiss alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

