import { create } from 'zustand';
import { PublicKey, AccountInfo } from '@solana/web3.js';
import { BlockchainStore } from './types';
import { WebSocketManager } from './utils/storeUtils';
import useWalletStore from './walletStore';

const wsManager = new WebSocketManager();

const useBlockchainStore = create<BlockchainStore>((set, get) => ({
  programId: null,
  accounts: new Map<string, AccountInfo<Buffer>>(),
  subscriptions: new Map<string, number>(),

  subscribeToAccount: async (pubkey: PublicKey) => {
    const { connection } = useWalletStore.getState();
    if (!connection) {
      throw new Error('Wallet not connected');
    }

    const key = pubkey.toString();
    const { subscriptions } = get();

    if (subscriptions.has(key)) {
      console.warn(`Already subscribed to account: ${key}`);
      return;
    }

    try {
      const subscriptionId = await wsManager.subscribeToAccount(
        connection,
        pubkey,
        (accountInfo: AccountInfo<Buffer>) => {
          const { accounts } = get();
          const newAccounts = new Map(accounts);
          newAccounts.set(key, accountInfo);
          set({ accounts: newAccounts });
        }
      );

      const newSubscriptions = new Map(subscriptions);
      newSubscriptions.set(key, subscriptionId);
      set({ subscriptions: newSubscriptions });

      const accountInfo = await connection.getAccountInfo(pubkey);
      if (accountInfo) {
        const { accounts } = get();
        const newAccounts = new Map(accounts);
        newAccounts.set(key, accountInfo);
        set({ accounts: newAccounts });
      }

    } catch (error) {
      console.error('Account subscription failed:', error);
      throw error;
    }
  },

  unsubscribeFromAccount: (pubkey: PublicKey) => {
    const { connection } = useWalletStore.getState();
    if (!connection) return;

    const key = pubkey.toString();
    const { subscriptions, accounts } = get();

    if (subscriptions.has(key)) {
      wsManager.unsubscribeFromAccount(connection, pubkey);
      
      const newSubscriptions = new Map(subscriptions);
      const newAccounts = new Map(accounts);
      
      newSubscriptions.delete(key);
      newAccounts.delete(key);
      
      set({ 
        subscriptions: newSubscriptions,
        accounts: newAccounts 
      });
    }
  },

  cleanup: () => {
    const { subscriptions } = get();
    const { connection } = useWalletStore.getState();

    if (connection) {
      subscriptions.forEach(async (subscriptionId, key) => {
        try {
          await connection.removeAccountChangeListener(subscriptionId);
        } catch (error) {
          console.error(`Failed to remove subscription for ${key}:`, error);
        }
      });
    }

    wsManager.cleanup();
    
    set({
      accounts: new Map(),
      subscriptions: new Map(),
    });
  },
}));

export default useBlockchainStore;