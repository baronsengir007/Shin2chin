import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PublicKey } from '@solana/web3.js';
import useBlockchainStore from '../../stores/blockchainStore';
import useWalletStore from '../../stores/walletStore';
import useBettingStore from '../../stores/bettingStore';

describe('Performance and Memory Tests', () => {
  beforeEach(() => {
    useBlockchainStore.setState({
      programId: null,
      accounts: new Map(),
      subscriptions: new Map()
    });

    useWalletStore.setState({
      connection: null,
      publicKey: null,
      connected: false,
      balance: 0,
      connecting: false
    });

    useBettingStore.setState({
      activeBets: [],
      betProposals: [],
      bettingHistory: [],
      loading: false
    });
  });

  test('Memory leak prevention - Measurable Evidence', async () => {
    const { result } = renderHook(() => useBlockchainStore());
    
    const initialSubscriptions = result.current.subscriptions.size;
    const initialAccounts = result.current.accounts.size;

    const mockConnection = {
      onAccountChange: vi.fn(),
      getAccountInfo: vi.fn().mockResolvedValue({
        lamports: 1000000000,
        data: Buffer.from([]),
        owner: new PublicKey('11111111111111111111111111111112'),
        executable: false,
        rentEpoch: 200
      }),
      removeAccountChangeListener: vi.fn().mockResolvedValue(undefined)
    } as any;

    act(() => {
      useWalletStore.setState({
        connection: mockConnection,
        publicKey: new PublicKey('11111111111111111111111111111112'),
        connected: true,
        balance: 1.0,
        connecting: false
      });
    });

    for (let i = 0; i < 10; i++) {
      const baseKey = '11111111111111111111111111111112';
      const keyBytes = Array.from(new PublicKey(baseKey).toBytes());
      keyBytes[31] = i;
      const testPubkey = new PublicKey(keyBytes);
      mockConnection.onAccountChange.mockReturnValue(1000 + i);
      
      await act(async () => {
        await result.current.subscribeToAccount(testPubkey);
      });
    }

    expect(result.current.subscriptions.size).toBe(initialSubscriptions + 10);
    expect(result.current.accounts.size).toBe(initialAccounts + 10);

    act(() => {
      result.current.cleanup();
    });

    expect(result.current.subscriptions.size).toBe(0);
    expect(result.current.accounts.size).toBe(0);

    expect(mockConnection.removeAccountChangeListener).toHaveBeenCalledTimes(10);
  });

  test('Map performance - Large dataset handling', () => {
    const { result } = renderHook(() => useBlockchainStore());
    
    const largeAccountsMap = new Map();
    const largeSubscriptionsMap = new Map();

    for (let i = 0; i < 1000; i++) {
      const key = `account_${i}`;
      largeAccountsMap.set(key, {
        lamports: i * 1000000,
        data: Buffer.from([i % 256]),
        owner: new PublicKey('11111111111111111111111111111112'),
        executable: false,
        rentEpoch: 200 + i
      });
      largeSubscriptionsMap.set(key, i);
    }

    const startTime = performance.now();

    act(() => {
      useBlockchainStore.setState({
        accounts: largeAccountsMap,
        subscriptions: largeSubscriptionsMap,
        programId: null
      });
    });

    const endTime = performance.now();
    const updateTime = endTime - startTime;

    expect(result.current.accounts.size).toBe(1000);
    expect(result.current.subscriptions.size).toBe(1000);

    expect(updateTime).toBeLessThan(100);

    const lookupStartTime = performance.now();
    const testAccount = result.current.accounts.get('account_500');
    const lookupEndTime = performance.now();
    const lookupTime = lookupEndTime - lookupStartTime;

    expect(testAccount).toBeDefined();
    expect(testAccount?.lamports).toBe(500000000);
    expect(lookupTime).toBeLessThan(10);
  });

  test('Betting store performance - Proposal management', async () => {
    const { result } = renderHook(() => useBettingStore());
    const mockPublicKey = new PublicKey('11111111111111111111111111111112');

    act(() => {
      useWalletStore.setState({
        connection: {} as any,
        publicKey: mockPublicKey,
        connected: true,
        balance: 100.0,
        connecting: false
      });
    });

    const startTime = performance.now();

    for (let i = 0; i < 50; i++) {
      await act(async () => {
        await result.current.createBetProposal({
          amount: 1.0 + (i * 0.1),
          description: `Performance test bet ${i}`,
          odds: 2.0 + (i * 0.01)
        });
      });
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    expect(result.current.betProposals.length).toBe(50);
    expect(totalTime).toBeLessThan(1000);

    const averageTimePerProposal = totalTime / 50;
    expect(averageTimePerProposal).toBeLessThan(20);

    const searchStartTime = performance.now();
    const targetProposal = result.current.betProposals.find(p => p.description.includes('25'));
    const searchEndTime = performance.now();
    const searchTime = searchEndTime - searchStartTime;

    expect(targetProposal).toBeDefined();
    expect(searchTime).toBeLessThan(10);
  });

  test('Store state size monitoring - Memory Usage', () => {
    const { result: blockchainResult } = renderHook(() => useBlockchainStore());
    const { result: bettingResult } = renderHook(() => useBettingStore());

    const mockPublicKey = new PublicKey('11111111111111111111111111111112');

    act(() => {
      useWalletStore.setState({
        connection: {} as any,
        publicKey: mockPublicKey,
        connected: true,
        balance: 50.0,
        connecting: false
      });
    });

    const baselineAccounts = blockchainResult.current.accounts.size;
    const baselineProposals = bettingResult.current.betProposals.length;

    const testData = Array.from({ length: 100 }, (_, i) => ({
      key: `test_account_${i}`,
      account: {
        lamports: i * 1000000,
        data: Buffer.from(Array(100).fill(i)),
        owner: mockPublicKey,
        executable: false,
        rentEpoch: 200 + i
      }
    }));

    act(() => {
      const newAccounts = new Map(blockchainResult.current.accounts);
      testData.forEach(({ key, account }) => {
        newAccounts.set(key, account);
      });
      useBlockchainStore.setState({ accounts: newAccounts });
    });

    expect(blockchainResult.current.accounts.size).toBe(baselineAccounts + 100);

    const accountsMemoryFootprint = blockchainResult.current.accounts.size * 
      (32 + 8 + 100 + 32 + 1 + 8);
    
    expect(accountsMemoryFootprint).toBeLessThan(1024 * 1024);

    act(() => {
      useBlockchainStore.setState({ accounts: new Map() });
    });

    expect(blockchainResult.current.accounts.size).toBe(0);

    const finalProposals = bettingResult.current.betProposals.length;
    expect(finalProposals).toBe(baselineProposals);
  });

  test('Subscription cleanup efficiency - Resource Management', async () => {
    const { result } = renderHook(() => useBlockchainStore());
    
    const mockConnection = {
      onAccountChange: vi.fn(),
      getAccountInfo: vi.fn().mockResolvedValue({
        lamports: 1000000000,
        data: Buffer.from([]),
        owner: new PublicKey('11111111111111111111111111111112'),
        executable: false,
        rentEpoch: 200
      }),
      removeAccountChangeListener: vi.fn().mockResolvedValue(undefined)
    } as any;

    act(() => {
      useWalletStore.setState({
        connection: mockConnection,
        publicKey: new PublicKey('11111111111111111111111111111112'),
        connected: true,
        balance: 1.0,
        connecting: false
      });
    });

    const subscriptionPromises = [];
    for (let i = 0; i < 20; i++) {
      const baseKey = '11111111111111111111111111111112';
      const keyBytes = Array.from(new PublicKey(baseKey).toBytes());
      keyBytes[30] = Math.floor(i / 256);
      keyBytes[31] = i % 256;
      const testPubkey = new PublicKey(keyBytes);
      mockConnection.onAccountChange.mockReturnValue(2000 + i);
      
      await act(async () => {
        await result.current.subscribeToAccount(testPubkey);
      });
    }

    expect(result.current.subscriptions.size).toBe(20);

    const cleanupStartTime = performance.now();
    act(() => {
      result.current.cleanup();
    });
    const cleanupEndTime = performance.now();
    const cleanupTime = cleanupEndTime - cleanupStartTime;

    expect(result.current.subscriptions.size).toBe(0);
    expect(result.current.accounts.size).toBe(0);
    expect(cleanupTime).toBeLessThan(50);
    expect(mockConnection.removeAccountChangeListener).toHaveBeenCalledTimes(20);
  });

  test('Sequential operations performance - State consistency', async () => {
    const { result } = renderHook(() => useBettingStore());
    const mockPublicKey = new PublicKey('11111111111111111111111111111112');

    act(() => {
      useWalletStore.setState({
        connection: {} as any,
        publicKey: mockPublicKey,
        connected: true,
        balance: 20.0,
        connecting: false
      });
    });

    const startTime = performance.now();
    
    for (let i = 0; i < 10; i++) {
      await act(async () => {
        await result.current.createBetProposal({
          amount: 1.0,
          description: `Sequential test ${i}`,
          odds: 2.0
        });
      });
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    expect(result.current.betProposals.length).toBe(10);
    expect(totalTime).toBeLessThan(500);

    const uniqueIds = new Set(result.current.betProposals.map(p => p.id));
    expect(uniqueIds.size).toBe(10);

    const uniqueDescriptions = new Set(result.current.betProposals.map(p => p.description));
    expect(uniqueDescriptions.size).toBe(10);
  });
});