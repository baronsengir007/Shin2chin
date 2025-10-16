import { create } from 'zustand';
import { PublicKey } from '@solana/web3.js';
import { BettingStore, PoolBet } from './types';
import { validateBetAmount } from './utils/storeUtils';
import useWalletStore from './walletStore';
import useUIStore from './uiStore';

const useBettingStore = create<BettingStore>((set, get) => ({
  activeBets: [],
  bettingHistory: [],
  loading: false,

  // Pool-based betting methods
  placeBet: async (eventPubkey: PublicKey, team: boolean, amount: number) => {
    const { publicKey } = useWalletStore.getState();
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!validateBetAmount(amount)) {
      throw new Error('Invalid bet amount');
    }

    set({ loading: true });
    useUIStore.getState().setLoading(true);

    try {
      // TODO: Call shin2chin_pool.place_bet instruction
      // This will be implemented when we create the pool contract hook
      
      const newBet: PoolBet = {
        id: `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user: publicKey,
        event: eventPubkey,
        amount,
        team,
        timestamp: Date.now(),
        status: 'Active',
        createdAt: new Date(),
      };

      const { activeBets } = get();
      set({ 
        activeBets: [...activeBets, newBet],
        loading: false 
      });
      
      useUIStore.getState().setLoading(false);
      useUIStore.getState().setError(null);

    } catch (error) {
      console.error('Bet placement failed:', error);
      set({ loading: false });
      useUIStore.getState().setLoading(false);
      useUIStore.getState().setError('Failed to place bet');
      throw error;
    }
  },

  claimWinnings: async (betId: string) => {
    const { publicKey } = useWalletStore.getState();
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    const { activeBets } = get();
    const bet = activeBets.find(b => b.id === betId);
    
    if (!bet) {
      throw new Error('Bet not found');
    }

    if (bet.status !== 'Won') {
      throw new Error('Can only claim winnings for won bets');
    }

    set({ loading: true });
    useUIStore.getState().setLoading(true);

    try {
      // TODO: Call shin2chin_pool.claim_winnings instruction
      // This will be implemented when we create the pool contract hook
      
      const updatedBets = activeBets.map(b => 
        b.id === betId ? { ...b, status: 'Claimed' as const } : b
      );

      set({ 
        activeBets: updatedBets,
        loading: false 
      });

      useUIStore.getState().setLoading(false);
      useUIStore.getState().setError(null);

    } catch (error) {
      console.error('Claim winnings failed:', error);
      set({ loading: false });
      useUIStore.getState().setLoading(false);
      useUIStore.getState().setError('Failed to claim winnings');
      throw error;
    }
  },

  fetchUserBets: async (_userPubkey: PublicKey) => {
    set({ loading: true });
    useUIStore.getState().setLoading(true);

    try {
      // TODO: Query all bet accounts for user from shin2chin_pool
      // This will be implemented when we create the pool contract hook
      
      set({ 
        activeBets: [], // Will be populated from contract
        loading: false 
      });

      useUIStore.getState().setLoading(false);

    } catch (error) {
      console.error('Failed to fetch user bets:', error);
      set({ loading: false });
      useUIStore.getState().setLoading(false);
      useUIStore.getState().setError('Failed to fetch user bets');
      throw error;
    }
  },

  loadBettingHistory: async () => {
    const { publicKey } = useWalletStore.getState();
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    set({ loading: true });
    useUIStore.getState().setLoading(true);

    try {
      const { activeBets } = get();
      const settledBets = activeBets.filter(bet => 
        bet.status === 'Won' || bet.status === 'Lost' || bet.status === 'Claimed'
      );
      
      set({ 
        bettingHistory: settledBets,
        loading: false 
      });

      useUIStore.getState().setLoading(false);

    } catch (error) {
      console.error('Failed to load betting history:', error);
      set({ loading: false });
      useUIStore.getState().setLoading(false);
      useUIStore.getState().setError('Failed to load betting history');
      throw error;
    }
  },
}));

export default useBettingStore;