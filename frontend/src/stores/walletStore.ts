import { create } from 'zustand';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { WalletStore } from './types';
import { formatBalance, debounce } from './utils/storeUtils';

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
      signAllTransactions: (transactions: any[]) => Promise<any[]>;
      on: (event: string, handler: (args: any) => void) => void;
      off: (event: string, handler: (args: any) => void) => void;
      request: (method: string, params?: any) => Promise<any>;
    };
  }
}

const useWalletStore = create<WalletStore>((set, get) => ({
  connection: null,
  publicKey: null,
  connected: false,
  balance: 0,
  connecting: false,

  connect: async () => {
    const { connecting } = get();
    if (connecting) return;

    set({ connecting: true });

    try {
      if (!window.solana || !window.solana.isPhantom) {
        throw new Error('Phantom wallet not found. Please install Phantom wallet.');
      }

      const response = await window.solana.connect();
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

      set({
        connection,
        publicKey: response.publicKey,
        connected: true,
        connecting: false,
      });

      await get().updateBalance();

      window.solana.on('accountChanged', (publicKey: PublicKey | null) => {
        if (publicKey) {
          set({ publicKey });
          get().updateBalance();
        } else {
          get().disconnect();
        }
      });

      window.solana.on('disconnect', () => {
        get().disconnect();
      });

    } catch (error) {
      console.error('Wallet connection failed:', error);
      set({ connecting: false });
      throw error;
    }
  },

  disconnect: () => {
    if (window.solana) {
      window.solana.disconnect().catch(console.error);
    }

    set({
      connection: null,
      publicKey: null,
      connected: false,
      balance: 0,
      connecting: false,
    });
  },

  updateBalance: debounce(async () => {
    const { connection, publicKey } = get();
    
    if (!connection || !publicKey) return;

    try {
      const balance = await connection.getBalance(publicKey);
      set({ balance: formatBalance(balance) });
    } catch (error) {
      console.error('Balance update failed:', error);
    }
  }, 1000),
}));

export default useWalletStore;