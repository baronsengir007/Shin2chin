import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PublicKey } from '@solana/web3.js';
import useWalletStore from '../../stores/walletStore';
import useBettingStore from '../../stores/bettingStore';
import useUIStore from '../../stores/uiStore';
import { validateBetAmount } from '../../stores/utils/storeUtils';

describe('Error Handling and Security Tests', () => {
  beforeEach(() => {
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

    useUIStore.setState({
      currentView: 'home',
      showModal: false,
      modalType: null,
      loading: false,
      error: null
    });
  });

  test('Connection failure handling - Real Error Simulation', async () => {
    const { result } = renderHook(() => useWalletStore());

    Object.defineProperty(window, 'solana', {
      value: {
        isPhantom: true,
        connect: vi.fn().mockRejectedValue(new Error('Connection failed'))
      },
      writable: true
    });

    let errorThrown = false;
    await act(async () => {
      try {
        await result.current.connect();
      } catch (error) {
        errorThrown = true;
        expect((error as Error).message).toBe('Connection failed');
      }
    });

    expect(errorThrown).toBe(true);
    expect(result.current.connected).toBe(false);
    expect(result.current.connecting).toBe(false);
    expect(result.current.connection).toBe(null);
  });

  test('Input validation - Bet amount security', () => {
    expect(validateBetAmount(1.0)).toBe(true);
    expect(validateBetAmount(0.1)).toBe(true);
    expect(validateBetAmount(1000)).toBe(true);

    expect(validateBetAmount(-1.0)).toBe(false);
    expect(validateBetAmount(0)).toBe(false);
    expect(validateBetAmount(NaN)).toBe(false);
    expect(validateBetAmount(Infinity)).toBe(false);
    expect(validateBetAmount(-Infinity)).toBe(false);
    expect(validateBetAmount(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
  });

  test('State validation - Input sanitization', async () => {
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
          amount: -100,
          description: '',
          odds: 0
        });
      } catch (error) {
        errorThrown = true;
        expect((error as Error).message).toBe('Invalid bet amount');
      }
    });

    expect(errorThrown).toBe(true);
    expect(result.current.betProposals.length).toBe(0);
  });

  test('Authorization checks - Self-betting prevention', async () => {
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

  test('Ownership validation - Cancel permission check', async () => {
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
        description: 'Ownership test bet',
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

  test('State integrity - Status validation', async () => {
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
        amount: 1.0,
        description: 'Status validation test',
        odds: 2.0
      });
    });

    const proposalId = result.current.betProposals[0].id;

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

    let errorThrown = false;
    await act(async () => {
      try {
        await result.current.acceptBet(proposalId);
      } catch (error) {
        errorThrown = true;
        expect((error as Error).message).toBe('Bet proposal is no longer available');
      }
    });

    expect(errorThrown).toBe(true);
    expect(result.current.activeBets.length).toBe(1);
  });

  test('Network error handling - Connection resilience', async () => {
    const { result } = renderHook(() => useWalletStore());

    Object.defineProperty(window, 'solana', {
      value: {
        isPhantom: true,
        connect: vi.fn().mockRejectedValue(new Error('Network timeout'))
      },
      writable: true
    });

    let networkError = false;
    await act(async () => {
      try {
        await result.current.connect();
      } catch (error) {
        networkError = true;
        expect((error as Error).message).toBe('Network timeout');
      }
    });

    expect(networkError).toBe(true);
    expect(result.current.connected).toBe(false);
    expect(result.current.balance).toBe(0);
  });

  test('Phantom wallet absence - Security fallback', async () => {
    const { result } = renderHook(() => useWalletStore());

    Object.defineProperty(window, 'solana', {
      value: undefined,
      writable: true
    });

    let securityError = false;
    await act(async () => {
      try {
        await result.current.connect();
      } catch (error) {
        securityError = true;
        expect((error as Error).message).toContain('Phantom wallet not found');
      }
    });

    expect(securityError).toBe(true);
    expect(result.current.connected).toBe(false);
  });

  test('Balance update failure - Error recovery', async () => {
    const { result } = renderHook(() => useWalletStore());
    const mockPublicKey = new PublicKey('11111111111111111111111111111112');
    
    const mockConnection = {
      getBalance: vi.fn().mockRejectedValue(new Error('RPC error'))
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

    const originalBalance = result.current.balance;

    await act(async () => {
      await result.current.updateBalance();
    });

    await new Promise(resolve => setTimeout(resolve, 1100));

    expect(result.current.balance).toBe(originalBalance);
    expect(mockConnection.getBalance).toHaveBeenCalledWith(mockPublicKey);
  });

  test('Missing data validation - Null checks', async () => {
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
        await result.current.acceptBet('non-existent-id');
      } catch (error) {
        errorThrown = true;
        expect((error as Error).message).toBe('Bet proposal not found');
      }
    });

    expect(errorThrown).toBe(true);
  });

  test('Type safety - Invalid data handling', async () => {
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

    let typeError = false;
    await act(async () => {
      try {
        await result.current.createBetProposal({
          amount: 'invalid' as any,
          description: 'Type test',
          odds: 2.0
        });
      } catch (error) {
        typeError = true;
        expect((error as Error).message).toBe('Invalid bet amount');
      }
    });

    expect(typeError).toBe(true);
    expect(result.current.betProposals.length).toBe(0);
  });

  test('Error state propagation - UI integration', async () => {
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

    let errorPropagated = false;
    await act(async () => {
      try {
        await bettingResult.current.createBetProposal({
          amount: 1.0,
          description: 'Error propagation test',
          odds: 2.0
        });
      } catch {
        errorPropagated = true;
      }
    });

    expect(errorPropagated).toBe(true);
    expect(bettingResult.current.loading).toBe(false);
  });
});