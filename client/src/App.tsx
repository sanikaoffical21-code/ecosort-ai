import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AlertBanner } from './components/AlertBanner';
import { SmartAlertsTicker } from './components/SmartAlertsTicker';
import { ImpactPassportModal } from './components/ImpactPassportModal';
import { ResponsibleAiModal } from './components/ResponsibleAiModal';
import { CampusInsightsModal } from './components/CampusInsightsModal';

import { HomePage } from './pages/HomePage';
import { ScannerPage } from './pages/ScannerPage';
import { SearchPage } from './pages/SearchPage';
import { SegregationPage } from './pages/SegregationPage';
import { ImpactPage } from './pages/ImpactPage';
import { CollectionPage } from './pages/CollectionPage';
import { ReportsPage } from './pages/ReportsPage';
import { GamificationPage } from './pages/GamificationPage';
import { EducationPage } from './pages/EducationPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {activeTab === 'home' && <HomePage />}
      {activeTab === 'scanner' && <ScannerPage />}
      {activeTab === 'search' && <SearchPage />}
      {activeTab === 'segregation' && <SegregationPage />}
      {activeTab === 'impact' && <ImpactPage />}
      {activeTab === 'collection' && <CollectionPage />}
      {activeTab === 'reports' && <ReportsPage />}
      {activeTab === 'gamification' && <GamificationPage />}
      {activeTab === 'education' && <EducationPage />}
      {activeTab === 'dashboard' && <DashboardPage />}
      {activeTab === 'admin' && <AdminPage />}
    </main>
  );
};

export function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <SmartAlertsTicker />
        <MainContent />
        <Footer />
        <AlertBanner />
        <ImpactPassportModal />
        <ResponsibleAiModal />
        <CampusInsightsModal />
      </div>
    </AppProvider>
  );
}

export default App;
