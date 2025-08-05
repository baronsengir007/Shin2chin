import { create } from 'zustand';
import { PublicKey } from '@solana/web3.js';
import { BettingStore, BetProposal, ActiveBet } from './types';
import { validateBetAmount } from './utils/storeUtils';
import useWalletStore from './walletStore';
import useUIStore from './uiStore';

const useBettingStore = create<BettingStore>((set, get) => ({
  activeBets: [],
  betProposals: [],
  bettingHistory: [],
  loading: false,

  createBetProposal: async (proposal: Omit<BetProposal, 'id' | 'status' | 'createdAt'>) => {
    const { publicKey } = useWalletStore.getState();
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!validateBetAmount(proposal.amount)) {
      throw new Error('Invalid bet amount');
    }

    set({ loading: true });
    useUIStore.getState().setLoading(true);

    try {
      const newProposal: BetProposal = {
        ...proposal,
        id: `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        proposer: publicKey,
        status: 'pending',
        createdAt: new Date(),
      };

      const { betProposals } = get();
      set({ 
        betProposals: [...betProposals, newProposal],
        loading: false 
      });
      
      useUIStore.getState().setLoading(false);

    } catch (error) {
      console.error('Bet proposal creation failed:', error);
      set({ loading: false });
      useUIStore.getState().setLoading(false);
      useUIStore.getState().setError('Failed to create bet proposal');
      throw error;
    }
  },

  acceptBet: async (proposalId: string) => {
    const { publicKey } = useWalletStore.getState();
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    const { betProposals } = get();
    const proposal = betProposals.find(p => p.id === proposalId);
    
    if (!proposal) {
      throw new Error('Bet proposal not found');
    }

    if (proposal.status !== 'pending') {
      throw new Error('Bet proposal is no longer available');
    }

    if (proposal.proposer.equals(publicKey)) {
      throw new Error('Cannot accept your own bet proposal');
    }

    set({ loading: true });
    useUIStore.getState().setLoading(true);

    try {
      const activeBet: ActiveBet = {
        id: `active_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        bettor1: proposal.proposer,
        bettor2: publicKey,
        amount: proposal.amount,
        escrowAccount: new PublicKey(new Uint8Array(32)),
        description: proposal.description,
        status: 'active',
        createdAt: new Date(),
      };

      const updatedProposals = betProposals.map(p => 
        p.id === proposalId ? { ...p, status: 'accepted' as const } : p
      );

      const { activeBets } = get();

      set({
        betProposals: updatedProposals,
        activeBets: [...activeBets, activeBet],
        loading: false
      });

      useUIStore.getState().setLoading(false);

    } catch (error) {
      console.error('Bet acceptance failed:', error);
      set({ loading: false });
      useUIStore.getState().setLoading(false);
      useUIStore.getState().setError('Failed to accept bet');
      throw error;
    }
  },

  cancelBetProposal: async (proposalId: string) => {
    const { publicKey } = useWalletStore.getState();
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    const { betProposals } = get();
    const proposal = betProposals.find(p => p.id === proposalId);
    
    if (!proposal) {
      throw new Error('Bet proposal not found');
    }

    if (!proposal.proposer.equals(publicKey)) {
      throw new Error('Can only cancel your own bet proposals');
    }

    if (proposal.status !== 'pending') {
      throw new Error('Can only cancel pending bet proposals');
    }

    set({ loading: true });
    useUIStore.getState().setLoading(true);

    try {
      const updatedProposals = betProposals.map(p => 
        p.id === proposalId ? { ...p, status: 'cancelled' as const } : p
      );

      set({ 
        betProposals: updatedProposals,
        loading: false 
      });

      useUIStore.getState().setLoading(false);

    } catch (error) {
      console.error('Bet cancellation failed:', error);
      set({ loading: false });
      useUIStore.getState().setLoading(false);
      useUIStore.getState().setError('Failed to cancel bet proposal');
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
      const settledBets = activeBets.filter(bet => bet.status === 'settled');
      
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