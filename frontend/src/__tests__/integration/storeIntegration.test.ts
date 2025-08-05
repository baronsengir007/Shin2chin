import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PublicKey } from '@solana/web3.js';
import useWalletStore from '../../stores/walletStore';
import useBlockchainStore from '../../stores/blockchainStore';
import useBettingStore from '../../stores/bettingStore';
import useUIStore from '../../stores/uiStore';
import { useStores } from '../../hooks/useStores';

describe('Cross-Store Integration Tests', () => {
  beforeEach(() => {
    useWalletStore.setState({
      connection: null,
      publicKey: null,
      connected: false,
      balance: 0,
      connecting: false
    });

    useBlockchainStore.setState({
      programId: null,
      accounts: new Map(),
      subscriptions: new Map()
    });

    useBettingStore.setState({
      activeBets: [],
      betProposals: [],
      bettingHistory: [],
      loading: false
    });

    useUIStore.setState({
      currentView: 'home',
      showModal: false,
      modalType: null,
      loading: false,
      error: null
    });
  });

  test('useStores hook - Aggregate State Access', () => {
    const { result } = renderHook(() => useStores());
    
    expect(result.current.wallet).toBeDefined();
    expect(result.current.blockchain).toBeDefined();
    expect(result.current.betting).toBeDefined();
    expect(result.current.ui).toBeDefined();

    expect(result.current.wallet.connected).toBe(false);
    expect(result.current.blockchain.subscriptions.size).toBe(0);
    expect(result.current.betting.betProposals.length).toBe(0);
    expect(result.current.ui.currentView).toBe('home');
  });

  test('Wallet to Blockchain integration - Evidence Based', async () => {
    const { result: walletResult } = renderHook(() => useWalletStore());
    const { result: blockchainResult } = renderHook(() => useBlockchainStore());

    const mockPublicKey = new PublicKey('11111111111111111111111111111112');
    const mockConnection = {
      onAccountChange: vi.fn().mockReturnValue(555),
      getAccountInfo: vi.fn().mockResolvedValue({
        lamports: 1000000000,
        data: Buffer.from([]),
        owner: mockPublicKey,
        executable: false,
        rentEpoch: 200
      }),
      getBalance: vi.fn().mockResolvedValue(2000000000)
    } as any;

    Object.defineProperty(window, 'solana', {
      value: {
        isPhantom: true,
        connect: vi.fn().mockResolvedValue({
          publicKey: mockPublicKey
        }),
        on: vi.fn(),
        off: vi.fn()
      },
      writable: true
    });

    act(() => {
      useWalletStore.setState({
        connection: mockConnection,
        publicKey: mockPublicKey,
        connected: true,
        balance: 2.0,
        connecting: false
      });
    });

    expect(walletResult.current.connected).toBe(true);
    expect(walletResult.current.connection).toBe(mockConnection);

    await act(async () => {
      await blockchainResult.current.subscribeToAccount(mockPublicKey);
    });

    expect(blockchainResult.current.subscriptions.size).toBe(1);
    expect(blockchainResult.current.accounts.size).toBe(1);
    expect(mockConnection.onAccountChange).toHaveBeenCalledWith(
      mockPublicKey,
      expect.any(Function),
      'confirmed'
    );
  });

  test('Wallet to Betting integration - Authorization Flow', async () => {
    const { result: walletResult } = renderHook(() => useWalletStore());
    const { result: bettingResult } = renderHook(() => useBettingStore());

    const mockPublicKey = new PublicKey('11111111111111111111111111111112');

    act(() => {
      useWalletStore.setState({
        connection: {} as any,
        publicKey: mockPublicKey,
        connected: true,
        balance: 5.0,
        connecting: false
      });
    });

    expect(walletResult.current.connected).toBe(true);
    expect(bettingResult.current.betProposals.length).toBe(0);

    await act(async () => {
      await bettingResult.current.createBetProposal({
        amount: 1.5,
        description: 'Integration test bet',
        odds: 2.5
      });
    });

    expect(bettingResult.current.betProposals.length).toBe(1);
    expect(bettingResult.current.betProposals[0].proposer).toEqual(mockPublicKey);
  });

  test('Betting to UI integration - Error State Propagation', async () => {
    const { result: bettingResult } = renderHook(() => useBettingStore());
    const { result: uiResult } = renderHook(() => useUIStore());

    act(() => {
      useWalletStore.setState({
        connection: null,
        publicKey: null,
        connected: false,
        balance: 0,
        connecting: false
      });
    });

    expect(uiResult.current.error).toBe(null);
    expect(uiResult.current.loading).toBe(false);

    let errorCaught = false;
    await act(async () => {
      try {
        await bettingResult.current.createBetProposal({
          amount: 1.0,
          description: 'Error test bet',
          odds: 2.0
        });
      } catch {
        errorCaught = true;
      }
    });

    expect(errorCaught).toBe(true);
    expect(uiResult.current.loading).toBe(false);
  });

  test('Full betting workflow - Multi-store Integration', async () => {
    const { result: walletResult } = renderHook(() => useWalletStore());
    const { result: bettingResult } = renderHook(() => useBettingStore());
    const { result: uiResult } = renderHook(() => useUIStore());

    const proposerKey = new PublicKey('11111111111111111111111111111112');
    const acceptorKey = new PublicKey('11111111111111111111111111111113');

    act(() => {
      useWalletStore.setState({
        connection: {} as any,
        publicKey: proposerKey,
        connected: true,
        balance: 5.0,
        connecting: false
      });
    });

    await act(async () => {
      await bettingResult.current.createBetProposal({
        amount: 2.0,
        description: 'Full workflow test',
        odds: 1.8
      });
    });

    expect(bettingResult.current.betProposals.length).toBe(1);
    expect(bettingResult.current.activeBets.length).toBe(0);
    const proposalId = bettingResult.current.betProposals[0].id;

    act(() => {
      useWalletStore.setState({
        connection: {} as any,
        publicKey: acceptorKey,
        connected: true,
        balance: 3.0,
        connecting: false
      });
    });

    await act(async () => {
      await bettingResult.current.acceptBet(proposalId);
    });

    expect(bettingResult.current.betProposals[0].status).toBe('accepted');
    expect(bettingResult.current.activeBets.length).toBe(1);
    expect(bettingResult.current.activeBets[0].bettor1).toEqual(proposerKey);
    expect(bettingResult.current.activeBets[0].bettor2).toEqual(acceptorKey);
    expect(uiResult.current.loading).toBe(false);
  });

  test('Store cleanup integration - Memory Management', async () => {
    const { result: walletResult } = renderHook(() => useWalletStore());
    const { result: blockchainResult } = renderHook(() => useBlockchainStore());

    const mockPublicKey = new PublicKey('11111111111111111111111111111112');
    const mockConnection = {
      onAccountChange: vi.fn().mockReturnValue(777),
      getAccountInfo: vi.fn().mockResolvedValue({
        lamports: 1000000000,
        data: Buffer.from([]),
        owner: mockPublicKey,
        executable: false,
        rentEpoch: 200
      }),
      removeAccountChangeListener: vi.fn().mockResolvedValue(undefined)
    } as any;

    act(() => {
      useWalletStore.setState({
        connection: mockConnection,
        publicKey: mockPublicKey,
        connected: true,
        balance: 2.0,
        connecting: false
      });
    });

    await act(async () => {
      await blockchainResult.current.subscribeToAccount(mockPublicKey);
    });

    expect(blockchainResult.current.subscriptions.size).toBe(1);

    act(() => {
      walletResult.current.disconnect();
    });

    expect(walletResult.current.connected).toBe(false);
    expect(walletResult.current.connection).toBe(null);

    act(() => {
      blockchainResult.current.cleanup();
    });

    expect(blockchainResult.current.subscriptions.size).toBe(0);
  });

  test('UI state coordination - View and Modal Management', () => {
    const { result: uiResult } = renderHook(() => useUIStore());
    const { result: bettingResult } = renderHook(() => useBettingStore());

    act(() => {
      uiResult.current.setCurrentView('betting');
      uiResult.current.openModal('bet-proposal');
    });

    expect(uiResult.current.currentView).toBe('betting');
    expect(uiResult.current.showModal).toBe(true);
    expect(uiResult.current.modalType).toBe('bet-proposal');

    act(() => {
      uiResult.current.setLoading(true);
    });

    expect(uiResult.current.loading).toBe(true);
    expect(bettingResult.current.loading).toBe(false);

    act(() => {
      uiResult.current.setError('UI coordination test');
    });

    expect(uiResult.current.error).toBe('UI coordination test');
    expect(uiResult.current.showModal).toBe(true);
  });

  test('State synchronization - Data Consistency', async () => {
    const { result: allStores } = renderHook(() => useStores());

    const mockPublicKey = new PublicKey('11111111111111111111111111111112');

    act(() => {
      useWalletStore.setState({
        connection: {} as any,
        publicKey: mockPublicKey,
        connected: true,
        balance: 10.0,
        connecting: false
      });
    });

    expect(allStores.current.wallet.connected).toBe(true);
    expect(allStores.current.wallet.publicKey).toEqual(mockPublicKey);
    expect(allStores.current.wallet.balance).toBe(10.0);

    await act(async () => {
      await allStores.current.betting.createBetProposal({
        amount: 3.0,
        description: 'Sync test bet',
        odds: 2.2
      });
    });

    expect(allStores.current.betting.betProposals.length).toBe(1);
    expect(allStores.current.betting.betProposals[0].proposer).toEqual(mockPublicKey);
    expect(allStores.current.betting.betProposals[0].amount).toBe(3.0);

    expect(allStores.current.wallet.connected).toBe(true);
    expect(allStores.current.ui.loading).toBe(false);
  });
});