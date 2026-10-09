import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode } from '../types';
import { translations, Translations } from '../i18n/translations';
import { api } from '../services/api';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  points?: number;
}

export type TextSize = 'normal' | 'large' | 'xlarge';

interface AppContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  userRole: 'citizen' | 'admin';
  setUserRole: (role: 'citizen' | 'admin') => void;
  toggleUserRole: () => void;
  ecoPoints: number;
  addPoints: (points: number, reason?: string) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  textSize: TextSize;
  cycleTextSize: () => void;
  toast: Toast | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info', points?: number) => void;
  clearToast: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  refreshGamification: () => Promise<void>;
  aiEngineStatus: string;
  showPassport: boolean;
  setShowPassport: (show: boolean) => void;
  showResponsibleAi: boolean;
  setShowResponsibleAi: (show: boolean) => void;
  showCampusInsights: boolean;
  setShowCampusInsights: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [userRole, setUserRoleState] = useState<'citizen' | 'admin'>('citizen');
  const [ecoPoints, setEcoPoints] = useState<number>(580);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [textSize, setTextSize] = useState<TextSize>('normal');
  const [toast, setToast] = useState<Toast | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [aiEngineStatus, setAiEngineStatus] = useState<string>('Offline Knowledge Engine');
  const [showPassport, setShowPassport] = useState<boolean>(false);
  const [showResponsibleAi, setShowResponsibleAi] = useState<boolean>(false);
  const [showCampusInsights, setShowCampusInsights] = useState<boolean>(false);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('ecosort_lang', lang);
  };

  const setUserRole = (role: 'citizen' | 'admin') => {
    setUserRoleState(role);
    localStorage.setItem('ecosort_role', role);
    showToast(`Role switched to ${role === 'admin' ? 'City Administration / Supervisor' : 'Citizen Eco-Guard'}`, 'info');
  };

  const toggleUserRole = () => {
    const next = userRole === 'admin' ? 'citizen' : 'admin';
    setUserRole(next);
  };

  const toggleHighContrast = () => {
    setHighContrast(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('accessibility-high-contrast');
      } else {
        document.documentElement.classList.remove('accessibility-high-contrast');
      }
      return next;
    });
  };

  const cycleTextSize = () => {
    setTextSize(prev => {
      const sizes: TextSize[] = ['normal', 'large', 'xlarge'];
      const nextIdx = (sizes.indexOf(prev) + 1) % sizes.length;
      const nextSize = sizes[nextIdx];
      document.documentElement.classList.remove('text-size-large', 'text-size-xlarge');
      if (nextSize === 'large') document.documentElement.classList.add('text-size-large');
      if (nextSize === 'xlarge') document.documentElement.classList.add('text-size-xlarge');
      localStorage.setItem('ecosort_textSize', nextSize);
      return nextSize;
    });
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', points?: number) => {
    const newToast: Toast = {
      id: `${Date.now()}-${Math.random()}`,
      message,
      type,
      points
    };
    setToast(newToast);
    setTimeout(() => {
      setToast(current => (current?.id === newToast.id ? null : current));
    }, 4500);
  };

  const clearToast = () => setToast(null);

  const addPoints = (pts: number, reason?: string) => {
    setEcoPoints(prev => prev + pts);
    showToast(reason ? `+${pts} Eco Points! ${reason}` : `+${pts} Eco Points earned!`, 'success', pts);
  };

  const refreshGamification = async () => {
    try {
      const data = await api.getGamification();
      if (data && typeof data.userPoints === 'number') {
        setEcoPoints(data.userPoints);
      }
    } catch {
      // Keep state
    }
  };

  const toggleDemoMode = () => {
    setIsDemoMode(prev => !prev);
    showToast(`Hackathon Demo Mode ${!isDemoMode ? 'Enabled' : 'Disabled'}`, 'info');
  };

  // Initial load
  useEffect(() => {
    const savedLang = localStorage.getItem('ecosort_lang') as LanguageCode;
    if (savedLang && ['en', 'kn', 'hi'].includes(savedLang)) {
      setLanguageState(savedLang);
    }

    const savedRole = localStorage.getItem('ecosort_role') as 'citizen' | 'admin';
    if (savedRole && ['citizen', 'admin'].includes(savedRole)) {
      setUserRoleState(savedRole);
    }

    const savedTextSize = localStorage.getItem('ecosort_textSize') as TextSize;
    if (savedTextSize && ['normal', 'large', 'xlarge'].includes(savedTextSize)) {
      setTextSize(savedTextSize);
      if (savedTextSize === 'large') document.documentElement.classList.add('text-size-large');
      if (savedTextSize === 'xlarge') document.documentElement.classList.add('text-size-xlarge');
    }

    // Check health
    api.checkHealth()
      .then(res => {
        if (res.aiEngine) {
          setAiEngineStatus(res.aiEngine);
        }
      })
      .catch(() => {
        setAiEngineStatus('Offline Heuristics (Ready)');
      });

    refreshGamification();
  }, []);

  const value: AppContextType = {
    language,
    setLanguage,
    t: translations[language] || translations.en,
    userRole,
    setUserRole,
    toggleUserRole,
    ecoPoints,
    addPoints,
    highContrast,
    toggleHighContrast,
    textSize,
    cycleTextSize,
    toast,
    showToast,
    clearToast,
    activeTab,
    setActiveTab,
    isDemoMode,
    toggleDemoMode,
    refreshGamification,
    aiEngineStatus,
    showPassport,
    setShowPassport,
    showResponsibleAi,
    setShowResponsibleAi,
    showCampusInsights,
    setShowCampusInsights
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
