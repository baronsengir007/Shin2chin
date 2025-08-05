import { useCallback, useEffect } from 'react';
import { useWalletStore } from '../../stores/walletStore';
import { useUIStore } from '../../stores/uiStore';
import { PublicKey } from '@solana/web3.js';

export const useWalletConnection = () => {
  const wallet = useWalletStore();
  const setError = useUIStore((state) => state.setError);

  const connect = useCallback(async () => {
    try {
      useUIStore.getState().setLoading('wallet-connect', true);
      await wallet.connect();
    } catch (error) {
      setError('Failed to connect wallet', error as Error);
    } finally {
      useUIStore.getState().setLoading('wallet-connect', false);
    }
  }, [wallet, setError]);

  const disconnect = useCallback(async () => {
    try {
      useUIStore.getState().setLoading('wallet-disconnect', true);
      await wallet.disconnect();
    } catch (error) {
      setError('Failed to disconnect wallet', error as Error);
    } finally {
      useUIStore.getState().setLoading('wallet-disconnect', false);
    }
  }, [wallet, setError]);

  return {
    publicKey: wallet.publicKey,
    connected: wallet.connected,
    connecting: useUIStore((state) => state.loadingStates.get('wallet-connect') || false),
    balance: wallet.balance,
    connect,
    disconnect,
  };
};

export const useWalletBalance = () => {
  const balance = useWalletStore((state) => state.balance);
  const publicKey = useWalletStore((state) => state.publicKey);
  const updateBalance = useWalletStore((state) => state.updateBalance);

  useEffect(() => {
    if (publicKey) {
      updateBalance();
    }
  }, [publicKey, updateBalance]);

  return {
    balance,
    formattedBalance: (balance / 1e9).toFixed(4),
    isLoading: balance === null,
  };
};

export const useWalletPublicKey = (): PublicKey | null => {
  return useWalletStore((state) => state.publicKey);
};

export const useWalletConnected = (): boolean => {
  return useWalletStore((state) => state.connected);
};