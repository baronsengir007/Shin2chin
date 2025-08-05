import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PublicKey } from '@solana/web3.js';
import useBettingStore from '../../stores/bettingStore';
import useWalletStore from '../../stores/walletStore';
import useUIStore from '../../stores/uiStore';

describe('BettingStore Business Logic Tests', () => {
  beforeEach(() => {
    useBettingStore.setState({
      activeBets: [],
      betProposals: [],
      bettingHistory: [],
      loading: false,
    });

    useWalletStore.setState({
      connection: null,
      publicKey: null,
      connected: false,
      balance: 0,
      connecting: false
    });

    useUIStore.setState({
      currentView: 'home',
      showModal: false,
      modalType: null,
      loading: false,
      error: null,
    });
  });

  test('Initial state verification - Evidence Required', () => {
    const { result } = renderHook(() => useBettingStore());
    
    expect(result.current.activeBets).toEqual([]);
    expect(result.current.betProposals).toEqual([]);
    expect(result.current.bettingHistory).toEqual([]);
    expect(result.current.loading).toBe(false);
    
    expect(typeof result.current.createBetProposal).toBe('function');
    expect(typeof result.current.acceptBet).toBe('function');
    expect(typeof result.current.cancelBetProposal).toBe('function');
    expect(typeof result.current.loadBettingHistory).toBe('function');
  });

  test('Create bet proposal - Evidence-Based Verification', async () => {
    const { result } = renderHook(() => useBettingStore());
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

    const proposalData = {
      amount: 1.5,
      description: 'Test bet proposal',
      odds: 2.0
    };

    expect(result.current.betProposals.length).toBe(0);

    await act(async () => {
      await result.current.createBetProposal(proposalData);
    });

    expect(result.current.betProposals.length).toBe(1);
    expect(result.current.loading).toBe(false);

    const createdProposal = result.current.betProposals[0];
    expect(createdProposal.amount).toBe(1.5);
    expect(createdProposal.description).toBe('Test bet proposal');
    expect(createdProposal.odds).toBe(2.0);
    expect(createdProposal.proposer).toEqual(mockPublicKey);
    expect(createdProposal.status).toBe('pending');
    expect(createdProposal.id).toMatch(/^bet_\d+_[a-z0-9]+$/);
    expect(createdProposal.createdAt).toBeInstanceOf(Date);
  });

  test('Accept bet proposal - State Transition Verification', async () => {
    const { result } = renderHook(() => useBettingStore());
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
      await result.current.createBetProposal({
        amount: 2.0,
        description: 'Accept test bet',
        odds: 1.8
      });
    });

    const proposalId = result.current.betProposals[0].id;
    expect(result.current.activeBets.length).toBe(0);

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
      await result.current.acceptBet(proposalId);
    });

    expect(result.current.betProposals[0].status).toBe('accepted');
    expect(result.current.activeBets.length).toBe(1);

    const activeBet = result.current.activeBets[0];
    expect(activeBet.bettor1).toEqual(proposerKey);
    expect(activeBet.bettor2).toEqual(acceptorKey);
    expect(activeBet.amount).toBe(2.0);
    expect(activeBet.description).toBe('Accept test bet');
    expect(activeBet.status).toBe('active');
    expect(activeBet.id).toMatch(/^active_\d+_[a-z0-9]+$/);
  });

  test('Cancel bet proposal - Authorization and State Cleanup', async () => {
    const { result } = renderHook(() => useBettingStore());
    const proposerKey = new PublicKey('11111111111111111111111111111112');

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
      await result.current.createBetProposal({
        amount: 1.0,
        description: 'Cancel test bet',
        odds: 3.0
      });
    });

    const proposalId = result.current.betProposals[0].id;
    expect(result.current.betProposals[0].status).toBe('pending');

    await act(async () => {
      await result.current.cancelBetProposal(proposalId);
    });

    expect(result.current.betProposals[0].status).toBe('cancelled');
    expect(result.current.loading).toBe(false);
  });

  test('Error handling - Wallet not connected', async () => {
    const { result } = renderHook(() => useBettingStore());

    act(() => {
      useWalletStore.setState({
        connection: null,
        publicKey: null,
        connected: false,
        balance: 0,
        connecting: false
      });
    });

    let errorThrown = false;
    await act(async () => {
      try {
        await result.current.createBetProposal({
          amount: 1.0,
          description: 'Error test bet',
          odds: 2.0
        });
      } catch (error) {
        errorThrown = true;
        expect((error as Error).message).toBe('Wallet not connected');
      }
    });

    expect(errorThrown).toBe(true);
    expect(result.current.betProposals.length).toBe(0);
  });

  test('Input validation - Invalid bet amount', async () => {
    const { result } = renderHook(() => useBettingStore());
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

    let errorThrown = false;
    await act(async () => {
      try {
        await result.current.createBetProposal({
          amount: -1.0,
          description: 'Invalid amount test',
          odds: 2.0
        });
      } catch (error) {
        errorThrown = true;
        expect((error as Error).message).toBe('Invalid bet amount');
      }
    });

    expect(errorThrown).toBe(true);
    expect(result.current.betProposals.length).toBe(0);
  });

  test('Self-bet prevention - Security Validation', async () => {
    const { result } = renderHook(() => useBettingStore());
    const userKey = new PublicKey('11111111111111111111111111111112');

    act(() => {
      useWalletStore.setState({
        connection: {} as any,
        publicKey: userKey,
        connected: true,
        balance: 5.0,
        connecting: false
      });
    });

    await act(async () => {
      await result.current.createBetProposal({
        amount: 1.0,
        description: 'Self bet test',
        odds: 2.0
      });
    });

    const proposalId = result.current.betProposals[0].id;

    let errorThrown = false;
    await act(async () => {
      try {
        await result.current.acceptBet(proposalId);
      } catch (error) {
        errorThrown = true;
        expect((error as Error).message).toBe('Cannot accept your own bet proposal');
      }
    });

    expect(errorThrown).toBe(true);
    expect(result.current.activeBets.length).toBe(0);
  });

  test('Cancel unauthorized bet - Security Pattern', async () => {
    const { result } = renderHook(() => useBettingStore());
    const proposerKey = new PublicKey('11111111111111111111111111111112');
    const otherUserKey = new PublicKey('11111111111111111111111111111113');

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
      await result.current.createBetProposal({
        amount: 1.0,
        description: 'Unauthorized cancel test',
        odds: 2.0
      });
    });

    const proposalId = result.current.betProposals[0].id;

    act(() => {
      useWalletStore.setState({
        connection: {} as any,
        publicKey: otherUserKey,
        connected: true,
        balance: 3.0,
        connecting: false
      });
    });

    let errorThrown = false;
    await act(async () => {
      try {
        await result.current.cancelBetProposal(proposalId);
      } catch (error) {
        errorThrown = true;
        expect((error as Error).message).toBe('Can only cancel your own bet proposals');
      }
    });

    expect(errorThrown).toBe(true);
    expect(result.current.betProposals[0].status).toBe('pending');
  });

  test('Load betting history - Data Management', async () => {
    const { result } = renderHook(() => useBettingStore());
    const mockPublicKey = new PublicKey('11111111111111111111111111111112');

    const settledBet = {
      id: 'settled_123',
      bettor1: mockPublicKey,
      bettor2: new PublicKey('11111111111111111111111111111113'),
      amount: 2.0,
      escrowAccount: new PublicKey('11111111111111111111111111111114'),
      description: 'Settled bet',
      status: 'settled' as const,
      createdAt: new Date(),
      settledAt: new Date()
    };

    act(() => {
      useWalletStore.setState({
        connection: {} as any,
        publicKey: mockPublicKey,
        connected: true,
        balance: 5.0,
        connecting: false
      });

      useBettingStore.setState({
        activeBets: [settledBet],
        betProposals: [],
        bettingHistory: [],
        loading: false,
      });
    });

    expect(result.current.bettingHistory.length).toBe(0);

    await act(async () => {
      await result.current.loadBettingHistory();
    });

    expect(result.current.bettingHistory.length).toBe(1);
    expect(result.current.bettingHistory[0]).toEqual(settledBet);
    expect(result.current.loading).toBe(false);
  });
});