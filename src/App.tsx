/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bot, Sparkles, Sprout } from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { DashboardHero } from './components/DashboardHero';
import { FeatureCards } from './components/FeatureCards';
import { DiseaseDetectionComponent } from './components/DiseaseDetection';
import { EcoPlanGenerator } from './components/EcoPlanGenerator';
import { CompostPlanner } from './components/CompostPlanner';
import { CropRotationPlanner } from './components/CropRotationPlanner';
import { FarmJournal } from './components/FarmJournal';
import { FarmMarketplace } from './components/FarmMarketplace';
import { BioAdvisorModal } from './components/BioAdvisorModal';
import { ProfileModal } from './components/ProfileModal';
import { VoiceAssistant } from './components/VoiceAssistant';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<string>('home');
  const [tabHistory, setTabHistory] = useState<string[]>(['home']);
  const [autoStartCamera, setAutoStartCamera] = useState<boolean>(false);
  const [isBioAdvisorOpen, setIsBioAdvisorOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const handleSelectTab = (tabId: string) => {
    setTabHistory((prev) => [...prev, tabId]);
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBack = () => {
    if (tabHistory.length > 1) {
      const newHistory = [...tabHistory];
      newHistory.pop(); // remove current
      const prev = newHistory[newHistory.length - 1];
      setTabHistory(newHistory);
      setActiveTab(prev || 'home');
    } else {
      setActiveTab('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerCamera = () => {
    setAutoStartCamera(true);
    setTimeout(() => setAutoStartCamera(false), 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF7] text-slate-800 antialiased">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {activeTab === 'home' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            <DashboardHero
              onExploreTools={() => {
                const el = document.getElementById('feature-cards-anchor');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenMarketplace={() => handleSelectTab('marketplace')}
            />

            <div id="feature-cards-anchor">
              <FeatureCards onSelectTab={handleSelectTab} />
            </div>

            {/* Quick Testimonial / Organic Farming Mission Card */}
            <div className="rounded-3xl bg-white border border-slate-200/90 p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Farmer-First Agriculture
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Protect Your Crops Without Expensive Toxic Chemicals
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  AgriSahay diagnoses diseases directly through your smartphone camera and prescribes 100% natural bio-pesticides, sour buttermilk sprays, and fermented compost teas you can brew on your own land.
                </p>
              </div>

              <button
                onClick={() => handleSelectTab('diseaseDetection')}
                className="px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
              >
                Scan a Crop Leaf Now
              </button>
            </div>
          </div>
        )}

        {activeTab === 'diseaseDetection' && (
          <div className="animate-in fade-in duration-300">
            <DiseaseDetectionComponent 
              userId={user?.id || 'guest_farmer'} 
              autoStartCamera={autoStartCamera}
            />
          </div>
        )}

        {activeTab === 'ecoPlan' && (
          <div className="animate-in fade-in duration-300">
            <EcoPlanGenerator />
          </div>
        )}

        {activeTab === 'compost' && (
          <div className="animate-in fade-in duration-300">
            <CompostPlanner />
          </div>
        )}

        {activeTab === 'rotation' && (
          <div className="animate-in fade-in duration-300">
            <CropRotationPlanner />
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="animate-in fade-in duration-300">
            <FarmJournal userId={user?.id || 'guest_farmer'} />
          </div>
        )}

        {activeTab === 'marketplace' && (
          <div className="animate-in fade-in duration-300">
            <FarmMarketplace currentUser={user} />
          </div>
        )}
      </main>

      {/* Floating Bio-Advisor Assistant Button */}
      <button
        onClick={() => setIsBioAdvisorOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black text-xs shadow-xl shadow-emerald-700/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Open Organic Agronomy Advisor"
      >
        <Bot className="h-5 w-5" />
        <span className="hidden sm:inline">Ask Bio-Advisor</span>
      </button>

      {/* Bio-Advisor Modal */}
      <BioAdvisorModal
        isOpen={isBioAdvisorOpen}
        onClose={() => setIsBioAdvisorOpen(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Multilingual AI Voice Assistant */}
      <VoiceAssistant
        onSelectTab={handleSelectTab}
        onGoBack={handleGoBack}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAdvisor={() => setIsBioAdvisorOpen(true)}
        onTriggerCamera={handleTriggerCamera}
      />

      {/* Footer */}
      <Footer onSelectTab={handleSelectTab} />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
