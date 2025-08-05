import { Connection, PublicKey, AccountInfo } from '@solana/web3.js';

export interface WalletStore {
  connection: Connection | null;
  publicKey: PublicKey | null;
  connected: boolean;
  balance: number;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  updateBalance: () => Promise<void>;
}

export interface BlockchainStore {
  programId: PublicKey | null;
  accounts: Map<string, AccountInfo<Buffer>>;
  subscriptions: Map<string, number>;
  subscribeToAccount: (pubkey: PublicKey) => Promise<void>;
  unsubscribeFromAccount: (pubkey: PublicKey) => void;
  cleanup: () => void;
}

export interface BetProposal {
  id: string;
  proposer: PublicKey;
  amount: number;
  description: string;
  odds: number;
  status: 'pending' | 'accepted' | 'cancelled';
  createdAt: Date;
}

export interface ActiveBet {
  id: string;
  bettor1: PublicKey;
  bettor2: PublicKey;
  amount: number;
  escrowAccount: PublicKey;
  description: string;
  status: 'active' | 'settled' | 'disputed';
  createdAt: Date;
  settledAt?: Date;
}

export interface BettingStore {
  activeBets: ActiveBet[];
  betProposals: BetProposal[];
  bettingHistory: ActiveBet[];
  loading: boolean;
  createBetProposal: (proposal: Omit<BetProposal, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  acceptBet: (proposalId: string) => Promise<void>;
  cancelBetProposal: (proposalId: string) => Promise<void>;
  loadBettingHistory: () => Promise<void>;
}

export interface UIStore {
  currentView: 'home' | 'betting' | 'history' | 'profile';
  showModal: boolean;
  modalType: 'bet-proposal' | 'bet-acceptance' | 'error' | null;
  loading: boolean;
  error: string | null;
  setCurrentView: (view: UIStore['currentView']) => void;
  openModal: (type: UIStore['modalType']) => void;
  closeModal: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}