import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicKey } from '@solana/web3.js';
import { SimpleBettor } from './SimpleBettor';

// Mock the stores
vi.mock('../../stores/bettingStore', () => ({
  default: () => ({
    placeBet: vi.fn(),
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

const mockEvent = {
  teamA: 'Chelsea',
  teamB: 'Manchester United',
  teamAPool: 1000000000, // 1 SOL in lamports
  teamBPool: 2000000000, // 2 SOL in lamports
  matchStartTime: Date.now() / 1000 + 3600, // 1 hour from now
  balanced: false,
  settled: false,
  winner: null,
  admin: new PublicKey('11111111111111111111111111111112'),
};

const mockEventPubkey = new PublicKey('11111111111111111111111111111112');

describe('SimpleBettor', () => {
  it('renders without crashing', () => {
    render(<SimpleBettor event={mockEvent} eventPubkey={mockEventPubkey} />);
    
    expect(screen.getByText('Chelsea vs Manchester United')).toBeDefined();
    expect(screen.getByText('1.00 vs 2.00 SOL')).toBeDefined();
  });

  it('shows team selection buttons', () => {
    render(<SimpleBettor event={mockEvent} eventPubkey={mockEventPubkey} />);
    
    expect(screen.getByText('Chelsea')).toBeDefined();
    expect(screen.getByText('Manchester United')).toBeDefined();
  });

  it('shows betting closed message for settled events', () => {
    const settledEvent = { ...mockEvent, settled: true };
    
    render(<SimpleBettor event={settledEvent} eventPubkey={mockEventPubkey} />);
    
    expect(screen.getByText('Event has been settled')).toBeDefined();
  });
});
