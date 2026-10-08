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

interface AppContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  userRole: 'citizen' | 'admin';
  setUserRole: (role: 'citizen' | 'admin') => void;
  ecoPoints: number;
  addPoints: (points: number, reason?: string) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  toast: Toast | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info', points?: number) => void;
  clearToast: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  refreshGamification: () => Promise<void>;
  aiEngineStatus: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [userRole, setUserRole] = useState<'citizen' | 'admin'>('citizen');
  const [ecoPoints, setEcoPoints] = useState<number>(460);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [aiEngineStatus, setAiEngineStatus] = useState<string>('Offline Heuristic Engine');

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('ecosort_lang', lang);
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
      // Keep local state
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
    t: translations[language],
    userRole,
    setUserRole,
    ecoPoints,
    addPoints,
    highContrast,
    toggleHighContrast,
    toast,
    showToast,
    clearToast,
    activeTab,
    setActiveTab,
    isDemoMode,
    toggleDemoMode,
    refreshGamification,
    aiEngineStatus
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

