import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePoolContract } from './usePoolContract';

// Mock the stores
vi.mock('../../stores/walletStore', () => ({
  default: {
    getState: () => ({
      connection: { rpcEndpoint: 'https://api.devnet.solana.com' },
      publicKey: { toString: () => '11111111111111111111111111111112' },
      signTransaction: vi.fn(),
    }),
  },
}));

vi.mock('../../stores/uiStore', () => ({
  default: {
    getState: () => ({
      setError: vi.fn(),
      setLoading: vi.fn(),
    }),
  },
}));

describe('usePoolContract', () => {
  it('should provide all contract methods', () => {
    const { result } = renderHook(() => usePoolContract());
    
    expect(typeof result.current.placeBet).toBe('function');
    expect(typeof result.current.claimWinnings).toBe('function');
    expect(typeof result.current.fetchEvents).toBe('function');
    expect(typeof result.current.fetchUserBets).toBe('function');
  });

  it('should be importable without errors', () => {
    expect(usePoolContract).toBeDefined();
    expect(typeof usePoolContract).toBe('function');
  });
});
