import React from 'react';
import { useCurrentView } from '../../hooks/store/useUIState';
import { useWalletConnection } from '../../hooks/store/useWalletConnection';

const navItems = [
  { id: 'betting-chat', label: 'Betting Chat', icon: '💬' },
  { id: 'live-events', label: 'Live Events', icon: '📊' },
  { id: 'p2p-betting', label: 'P2P Betting', icon: '🤝' },
  { id: 'create-event', label: 'Create Event', icon: '➕' },
  { id: 'my-bets', label: 'My Bets', icon: '📋' },
];

export const NavBar: React.FC = () => {
  const { currentView, navigateTo } = useCurrentView();
  const { connected, publicKey } = useWalletConnection();

  return (
    <nav className="flex-1 px-2 py-4 space-y-1">
      {/* Logo/Title */}
      <div className="px-3 py-2 mb-6">
        <h2 className="text-lg font-bold text-white">Shin2Chin Bets</h2>
        {connected && publicKey && (
          <p className="text-xs text-gray-400 mt-1">
            {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
          </p>
        )}
      </div>

      {/* Navigation Items */}
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => navigateTo(item.id)}
          className={`
            w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
            ${currentView === item.id
              ? 'bg-gray-900 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }
          `}
        >
          <span className="mr-3 text-lg">{item.icon}</span>
          {item.label}
        </button>
      ))}

      {/* Wallet Connection Status */}
      <div className="mt-auto pt-6 px-3">
        <div className={`
          px-3 py-2 rounded-md text-sm
          ${connected 
            ? 'bg-green-900/20 text-green-400 border border-green-800' 
            : 'bg-red-900/20 text-red-400 border border-red-800'
          }
        `}>
          <div className="flex items-center">
            <div className={`
              w-2 h-2 rounded-full mr-2
              ${connected ? 'bg-green-400' : 'bg-red-400'}
            `} />
            {connected ? 'Wallet Connected' : 'Wallet Disconnected'}
          </div>
        </div>
      </div>
    </nav>
  );
};