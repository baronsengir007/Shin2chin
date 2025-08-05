import React, { useState } from 'react';
import { ProgressiveDisclosure } from './ProgressiveDisclosure';
import { useCurrentView } from '../../hooks/store/useUIState';
import { useWalletConnection } from '../../hooks/store/useWalletConnection';

interface MinimalLayoutProps {
  children: React.ReactNode;
  title?: string;
  showAdvanced?: boolean;
}

export const MinimalLayout: React.FC<MinimalLayoutProps> = ({ 
  children, 
  title, 
  showAdvanced = false 
}) => {
  const [advancedMode, setAdvancedMode] = useState(showAdvanced);
  const { currentView } = useCurrentView();
  const { connected, balance } = useWalletConnection();

  const getViewTitle = () => {
    if (title) return title;
    
    const titles: { [key: string]: string } = {
      'betting-chat': 'Chat & Bet',
      'live-events': 'Live Events',
      'p2p-betting': 'P2P Betting',
      'create-event': 'Create Event',
      'my-bets': 'My Bets',
    };
    
    return titles[currentView] || 'Betting Platform';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Minimal Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {getViewTitle()}
            </h1>
            
            {/* Minimal Status Indicator */}
            <div className="flex items-center space-x-3">
              {connected && (
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {balance !== null ? `${(balance / 1e9).toFixed(2)} SOL` : 'Connected'}
                  </span>
                </div>
              )}
              
              {/* Advanced Mode Toggle */}
              <button
                onClick={() => setAdvancedMode(!advancedMode)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                title={advancedMode ? 'Switch to Simple Mode' : 'Switch to Advanced Mode'}
              >
                {advancedMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Progressive Disclosure */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <ProgressiveDisclosure
          advancedMode={advancedMode}
          onToggleMode={() => setAdvancedMode(!advancedMode)}
        >
          {children}
        </ProgressiveDisclosure>
      </main>

      {/* Minimal Footer */}
      <footer className="mt-auto py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="max-w-4xl mx-auto px-4">
          {!advancedMode && (
            <p>Simple mode • <button onClick={() => setAdvancedMode(true)} className="text-blue-600 hover:underline">Show more options</button></p>
          )}
        </div>
      </footer>
    </div>
  );
};