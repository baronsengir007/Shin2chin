import React, { ReactNode, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { useWalletStore } from '../../stores/walletStore';
import { useBlockchainStore } from '../../stores/blockchainStore';
import { useBettingStore } from '../../stores/bettingStore';
import { useUIStore } from '../../stores/uiStore';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Initialize stores on mount
  useEffect(() => {
    const initializeStores = async () => {
      try {
        // Initialize blockchain connection
        const blockchainStore = useBlockchainStore.getState();
        await blockchainStore.connect();

        // Set up store cleanup on unmount
        return () => {
          blockchainStore.disconnect();
          useWalletStore.getState().disconnect();
        };
      } catch (error) {
        useUIStore.getState().setError(
          'Failed to initialize application',
          error as Error
        );
      }
    };

    initializeStores();
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </div>
    </ErrorBoundary>
  );
};