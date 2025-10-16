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

export interface PoolBet {
  id: string;
  user: PublicKey;
  event: PublicKey;
  amount: number;
  team: boolean; // true = team_a, false = team_b
  timestamp: number;
  status: 'Active' | 'Refunded' | 'Won' | 'Lost' | 'Claimed';
  createdAt: Date;
}

export interface PoolEvent {
  teamA: string;
  teamB: string;
  teamAPool: number;
  teamBPool: number;
  matchStartTime: number;
  balanced: boolean;
  settled: boolean;
  winner: boolean | null; // true = team_a won, false = team_b won, null = not settled
  admin: PublicKey;
}

export interface BettingStore {
  activeBets: PoolBet[];
  bettingHistory: PoolBet[];
  loading: boolean;
  placeBet: (eventPubkey: PublicKey, team: boolean, amount: number) => Promise<void>;
  claimWinnings: (betId: string) => Promise<void>;
  fetchUserBets: (userPubkey: PublicKey) => Promise<void>;
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