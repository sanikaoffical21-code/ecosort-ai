import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, X, Sparkles } from 'lucide-react';

export const AlertBanner: React.FC = () => {
  const { toast, clearToast } = useApp();

  if (!toast) return null;

  const icons = {
    success: CheckCircle2,
    error: AlertTriangle,
    info: Info
  };

  const bgColors = {
    success: 'bg-emerald-900/95 border-emerald-500 text-emerald-100',
    error: 'bg-rose-900/95 border-rose-500 text-rose-100',
    info: 'bg-blue-900/95 border-blue-500 text-blue-100'
  };

  const Icon = icons[toast.type] || Info;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md ${bgColors[toast.type]}`}>
        <Icon className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
        <div className="flex-1 pr-2">
          <p className="text-sm font-medium leading-snug">{toast.message}</p>
          {toast.points && (
            <div className="mt-1 flex items-center gap-1 text-xs text-amber-300 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{toast.points} Eco Points added to profile!</span>
            </div>
          )}
        </div>
        <button
          onClick={clearToast}
          className="text-slate-400 hover:text-white p-1 rounded transition"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

