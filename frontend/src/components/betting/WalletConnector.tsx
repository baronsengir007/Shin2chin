import React, { useState, useEffect } from 'react';
import { useWalletConnection, useWalletBalance } from '../../hooks/store/useWalletConnection';
import { useToast } from '../../hooks/store/useUIState';

export const WalletConnector: React.FC = () => {
  const { publicKey, connected, connecting, connect, disconnect } = useWalletConnection();
  const { balance, formattedBalance, isLoading: balanceLoading } = useWalletBalance();
  const { showSuccess, showError } = useToast();
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    // Check if wallet is available
    const checkWallet = () => {
      if (typeof window !== 'undefined' && window.solana) {
        return true;
      }
      return false;
    };

    setIsDetecting(true);
    setTimeout(() => {
      setIsDetecting(false);
    }, 1000);
  }, []);

  const handleConnect = async () => {
    try {
      await connect();
      showSuccess('Wallet connected successfully');
    } catch (error) {
      showError('Failed to connect wallet. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      showSuccess('Wallet disconnected');
    } catch (error) {
      showError('Failed to disconnect wallet');
    }
  };

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      showSuccess('Address copied to clipboard');
    }
  };

  if (isDetecting) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // Wallet not installed
  if (typeof window !== 'undefined' && !window.solana) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Wallet Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please install a Solana wallet to use the betting platform
          </p>
          <a
            href="https://phantom.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <img 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE3LjU1IDEwLjhMMTMuNzMgMy41NkMxMy40MiAzLjA2IDEyLjc1IDIuOTQgMTIuMzEgMy4zMkM5LjQ0IDUuNzggNy4yMSA5LjIxIDYuMTEgMTMuMTJDNS44MSAxNC4yIDYuNjQgMTUuMjQgNy43MiAxNS4yNEgxOC4xNkMxOS4yNCAxNS4yNCAyMC4wNyAxNC4yIDIwLjM3IDEzLjEyQzIwLjQ3IDEyLjc2IDIwLjUyIDEyLjM5IDIwLjUyIDEyQzIwLjUyIDExLjU5IDIwLjQ3IDExLjE5IDIwLjM3IDEwLjhIMTcuNTVaIiBmaWxsPSIjOTk0NUZGIi8+Cjwvc3ZnPgo="
              alt="Phantom"
              className="w-5 h-5 mr-2"
            />
            Install Phantom Wallet
          </a>
        </div>
      </div>
    );
  }

  // Wallet connected
  if (connected && publicKey) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Wallet Connected
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600 dark:text-green-400">Active</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Wallet Address
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-900 dark:text-white">
                {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
              </code>
              <button
                onClick={copyAddress}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Copy address"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Balance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Balance
            </label>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {balanceLoading ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-24 rounded"></div>
              ) : (
                `${formattedBalance} SOL`
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={handleDisconnect}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Disconnect
            </button>
            <button
              onClick={() => window.open(`https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=devnet`, '_blank')}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View on Explorer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Wallet not connected
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
          <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Connect your Solana wallet to start betting on the platform
        </p>
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
        >
          {connecting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            'Connect Wallet'
          )}
        </button>
      </div>
    </div>
  );
};