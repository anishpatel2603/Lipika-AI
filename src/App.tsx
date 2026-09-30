import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { Hero } from './components/Hero.js';
import { HowItWorks } from './components/HowItWorks.js';
import { FeaturesAndUseCases } from './components/FeaturesAndUseCases.js';
import { TextWorkspace } from './components/TextWorkspace.js';
import { CameraWorkspace } from './components/CameraWorkspace.js';
import { HistoryView } from './components/HistoryView.js';
import { AboutView } from './components/AboutView.js';
import { AgentChatDrawer } from './components/AgentChatDrawer.js';
import { Footer } from './components/Footer.js';
import { HistoryItem } from './types/index.js';
import { MessageSquareText } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'transliterate' | 'camera' | 'history' | 'about'>('home');
  const [workspaceInitialText, setWorkspaceInitialText] = useState('');
  const [isAgentChatOpen, setIsAgentChatOpen] = useState(false);

  // Sync hash routing if present
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (['home', 'transliterate', 'camera', 'history', 'about'].includes(hash)) {
        setActiveTab(hash as any);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as any);
    window.location.hash = `#/${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setWorkspaceInitialText(item.originalText);
    handleTabChange('transliterate');
  };

  const handleSelectSample = (sample: string) => {
    setWorkspaceInitialText(sample);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFB] text-slate-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenAgentChat={() => setIsAgentChatOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div>
            <Hero
              onStartTransliteration={() => handleTabChange('transliterate')}
              onStartCamera={() => handleTabChange('camera')}
              onSelectSampleText={handleSelectSample}
            />
            <HowItWorks />
            <FeaturesAndUseCases />
          </div>
        )}

        {activeTab === 'transliterate' && (
          <TextWorkspace
            initialText={workspaceInitialText}
            onNavigateToCamera={() => handleTabChange('camera')}
          />
        )}

        {activeTab === 'camera' && <CameraWorkspace />}

        {activeTab === 'history' && (
          <HistoryView onSelectHistoryItem={handleSelectHistoryItem} />
        )}

        {activeTab === 'about' && <AboutView />}
      </main>

      {/* Floating Agent Assistant Toggle */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsAgentChatOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-slate-700/50"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <MessageSquareText className="w-4 h-4 text-amber-400" />
          <span>Ask AI Agent</span>
        </button>
      </div>

      {/* AI Agent Chat Drawer */}
      <AgentChatDrawer
        isOpen={isAgentChatOpen}
        onClose={() => setIsAgentChatOpen(false)}
        currentOriginalText={workspaceInitialText || 'Welcome to Mumbai'}
        onApplyTransliteration={(newText) => {
          setWorkspaceInitialText(newText);
          handleTabChange('transliterate');
        }}
      />

      {/* Footer */}
      <Footer setActiveTab={handleTabChange} />
    </div>
  );
}
