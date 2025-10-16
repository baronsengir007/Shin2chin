import { PublicKey } from '@solana/web3.js';

/**
 * Pool-based betting types matching the backend shin2chin_pool program
 */

// Bet status enum matching the backend BetStatus enum
export type BetStatus = 'Active' | 'Refunded' | 'Won' | 'Lost' | 'Claimed';

// Pool bet interface matching the backend Bet struct
export interface PoolBet {
  id: string;
  user: PublicKey;
  event: PublicKey;
  amount: number; // in lamports
  team: boolean; // true = team_a, false = team_b
  timestamp: number; // Unix timestamp
  status: BetStatus;
  createdAt: Date;
}

// Pool event interface matching the backend Event struct
export interface PoolEvent {
  teamA: string;
  teamB: string;
  teamAPool: number; // in lamports
  teamBPool: number; // in lamports
  matchStartTime: number; // Unix timestamp
  balanced: boolean;
  settled: boolean;
  winner: boolean | null; // true = team_a won, false = team_b won, null = not settled
  admin: PublicKey;
}

// Extended event interface with additional frontend properties
export interface PoolEventWithId extends PoolEvent {
  id: string;
  pubkey: PublicKey;
}

// Contract instruction types
export interface InitializeEventParams {
  teamA: string;
  teamB: string;
  matchStartTime: number;
}

export interface PlaceBetParams {
  team: boolean;
  amount: number;
}

export interface SettleEventParams {
  winner: boolean;
}

// Contract response types
export interface ContractResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
}

// Pool statistics interface
export interface PoolStats {
  totalPool: number; // teamAPool + teamBPool
  teamAPercentage: number; // (teamAPool / totalPool) * 100
  teamBPercentage: number; // (teamBPool / totalPool) * 100
  isBalanced: boolean;
  imbalancePercentage: number; // |teamAPercentage - teamBPercentage|
}

// User betting summary interface
export interface UserBettingSummary {
  totalBets: number;
  totalAmount: number; // in lamports
  activeBets: number;
  wonBets: number;
  lostBets: number;
  totalWinnings: number; // in lamports
  totalLosses: number; // in lamports
}

// Event creation form data
export interface EventCreationForm {
  teamA: string;
  teamB: string;
  matchStartTime: Date;
}

// Bet placement form data
export interface BetPlacementForm {
  eventId: string;
  team: boolean;
  amount: number; // in SOL
}

// Claim winnings form data
export interface ClaimWinningsForm {
  betId: string;
  eventId: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Event list filters
export interface EventFilters {
  status?: 'upcoming' | 'live' | 'settled';
  teamA?: string;
  teamB?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Bet list filters
export interface BetFilters {
  status?: BetStatus;
  eventId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Pagination interface
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

// Paginated response interface
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error types
export interface PoolError {
  code: string;
  message: string;
  details?: any;
}

// Transaction status types
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface TransactionInfo {
  id: string;
  status: TransactionStatus;
  signature?: string;
  error?: string;
  timestamp: number;
}

// Wallet connection types
export interface WalletInfo {
  publicKey: PublicKey;
  connected: boolean;
  balance: number; // in lamports
  network: 'mainnet-beta' | 'devnet' | 'testnet';
}

// Contract configuration types
export interface ContractConfig {
  programId: string;
  network: 'mainnet-beta' | 'devnet' | 'testnet';
  rpcUrl: string;
}

// Hook return types
export interface UsePoolContractReturn {
  placeBet: (eventPubkey: PublicKey, team: boolean, amount: number) => Promise<string>;
  claimWinnings: (eventPubkey: PublicKey, betPubkey: PublicKey) => Promise<string>;
  fetchEvents: () => Promise<PoolEventWithId[]>;
  fetchUserBets: (userPubkey: PublicKey) => Promise<PoolBet[]>;
}

export interface UseBettingStoreReturn {
  activeBets: PoolBet[];
  bettingHistory: PoolBet[];
  loading: boolean;
  placeBet: (eventPubkey: PublicKey, team: boolean, amount: number) => Promise<void>;
  claimWinnings: (betId: string) => Promise<void>;
  fetchUserBets: (userPubkey: PublicKey) => Promise<void>;
  loadBettingHistory: () => Promise<void>;
}

// Component prop types
export interface SimpleBettorProps {
  event: PoolEvent;
  eventPubkey: PublicKey;
  onBetPlaced?: (betId: string) => void;
}

export interface BetStatusProps {
  bets: PoolBet[];
  onClaimWinnings?: (betId: string) => void;
}

export interface EventListProps {
  events: PoolEventWithId[];
  selectedEvent: PoolEventWithId | null;
  onSelectEvent: (event: PoolEventWithId) => void;
  filters?: EventFilters;
}

// Utility types
export type Lamports = number;
export type SOL = number;

// Conversion utilities
export const LAMPORTS_PER_SOL = 1_000_000_000;

export const lamportsToSOL = (lamports: Lamports): SOL => lamports / LAMPORTS_PER_SOL;
export const solToLamports = (sol: SOL): Lamports => Math.floor(sol * LAMPORTS_PER_SOL);

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface BetValidationResult extends ValidationResult {
  minAmount: number;
  maxAmount: number;
  availableBalance: number;
}

export interface EventValidationResult extends ValidationResult {
  minTimeAdvance: number; // minimum time in advance for event creation
  maxTimeAdvance: number; // maximum time in advance for event creation
}
