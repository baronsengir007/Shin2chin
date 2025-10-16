import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicKey } from '@solana/web3.js';
import { BetStatus } from './BetStatus';

// Mock the stores
vi.mock('../../stores/bettingStore', () => ({
  default: () => ({
    claimWinnings: vi.fn(),
  }),
}));

vi.mock('../../stores/walletStore', () => ({
  default: () => ({
    connected: true,
    publicKey: new PublicKey('11111111111111111111111111111112'),
  }),
}));

vi.mock('../../stores/uiStore', () => ({
  default: () => ({
    setError: vi.fn(),
    setLoading: vi.fn(),
  }),
}));

const mockBets = [
  {
    id: 'bet1',
    user: new PublicKey('11111111111111111111111111111112'),
    event: new PublicKey('11111111111111111111111111111113'),
    amount: 1000000000, // 1 SOL in lamports
    team: true,
    timestamp: Date.now(),
    status: 'Active' as const,
    createdAt: new Date(),
  },
  {
    id: 'bet2',
    user: new PublicKey('11111111111111111111111111111112'),
    event: new PublicKey('11111111111111111111111111111114'),
    amount: 2000000000, // 2 SOL in lamports
    team: false,
    timestamp: Date.now(),
    status: 'Won' as const,
    createdAt: new Date(),
  },
];

describe('BetStatus', () => {
  it('renders without crashing', () => {
    render(<BetStatus bets={mockBets} />);
    
    expect(screen.getByText('Your Bets')).toBeDefined();
    expect(screen.getByText('2 active')).toBeDefined();
  });

  it('shows empty state when no bets', () => {
    render(<BetStatus bets={[]} />);
    
    expect(screen.getByText('No Bets')).toBeDefined();
    expect(screen.getByText('Start betting to see your activity here')).toBeDefined();
  });

  it('displays bet information correctly', () => {
    render(<BetStatus bets={mockBets} />);
    
    expect(screen.getByText('1.00 SOL')).toBeDefined();
    expect(screen.getByText('2.00 SOL')).toBeDefined();
    expect(screen.getByText('Team A')).toBeDefined();
    expect(screen.getByText('Team B')).toBeDefined();
  });

  it('shows claim button for won bets', () => {
    render(<BetStatus bets={mockBets} />);
    
    expect(screen.getByText('Claim')).toBeDefined();
    expect(screen.getByText('3.90 SOL')).toBeDefined(); // 2 SOL * 1.95
  });

  it('shows correct status icons and colors', () => {
    render(<BetStatus bets={mockBets} />);
    
    expect(screen.getByText('⏳')).toBeDefined(); // Active bet
    expect(screen.getByText('🎉')).toBeDefined(); // Won bet
  });
});
