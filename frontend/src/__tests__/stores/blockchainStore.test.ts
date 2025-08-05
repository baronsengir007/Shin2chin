import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PublicKey, AccountInfo } from '@solana/web3.js';
import useBlockchainStore from '../../stores/blockchainStore';
import useWalletStore from '../../stores/walletStore';

describe('BlockchainStore Real-time Tests', () => {
  beforeEach(() => {
    useBlockchainStore.setState({
      programId: null,
      accounts: new Map(),
      subscriptions: new Map(),
    });

    useWalletStore.setState({
      connection: null,
      publicKey: null,
      connected: false,
      balance: 0,
      connecting: false
    });
  });

  test('Initial state verification - Evidence Required', () => {
    const { result } = renderHook(() => useBlockchainStore());
    
    expect(result.current.programId).toBe(null);
    expect(result.current.accounts.size).toBe(0);
    expect(result.current.subscriptions.size).toBe(0);
    
    expect(typeof result.current.subscribeToAccount).toBe('function');
    expect(typeof result.current.unsubscribeFromAccount).toBe('function');
    expect(typeof result.current.cleanup).toBe('function');
  });

  test('Account subscription lifecycle - Evidence Required', async () => {
    const { result } = renderHook(() => useBlockchainStore());
    const testPubkey = new PublicKey('11111111111111111111111111111112');

    const mockConnection = {
      onAccountChange: vi.fn().mockReturnValue(123),
      getAccountInfo: vi.fn().mockResolvedValue({
        lamports: 1000000000,
        data: Buffer.from([]),
        owner: testPubkey,
        executable: false,
        rentEpoch: 200
      } as AccountInfo<Buffer>)
    } as any;

    act(() => {
      useWalletStore.setState({
        connection: mockConnection,
        publicKey: testPubkey,
        connected: true,
        balance: 1.0,
        connecting: false
      });
    });

    expect(result.current.subscriptions.size).toBe(0);
    expect(result.current.accounts.size).toBe(0);

    await act(async () => {
      await result.current.subscribeToAccount(testPubkey);
    });

    expect(result.current.subscriptions.size).toBe(1);
    expect(result.current.subscriptions.has(testPubkey.toString())).toBe(true);
    expect(result.current.subscriptions.get(testPubkey.toString())).toBe(123);
    
    expect(result.current.accounts.size).toBe(1);
    expect(result.current.accounts.has(testPubkey.toString())).toBe(true);

    expect(mockConnection.onAccountChange).toHaveBeenCalledWith(
      testPubkey,
      expect.any(Function),
      'confirmed'
    );
    expect(mockConnection.getAccountInfo).toHaveBeenCalledWith(testPubkey);
  });

  test('Subscription callback functionality - Real Data Flow', async () => {
    const { result } = renderHook(() => useBlockchainStore());
    const testPubkey = new PublicKey('11111111111111111111111111111112');

    let storedCallback: Function | null = null;
    const mockConnection = {
      onAccountChange: vi.fn().mockImplementation((pubkey, callback, commitment) => {
        storedCallback = callback;
        return 456;
      }),
      getAccountInfo: vi.fn().mockResolvedValue(null)
    } as any;

    act(() => {
      useWalletStore.setState({
        connection: mockConnection,
        publicKey: testPubkey,
        connected: true,
        balance: 1.0,
        connecting: false
      });
    });

    await act(async () => {
      await result.current.subscribeToAccount(testPubkey);
    });

    expect(storedCallback).not.toBe(null);

    const updatedAccountInfo: AccountInfo<Buffer> = {
      lamports: 2000000000,
      data: Buffer.from([1, 2, 3]),
      owner: testPubkey,
      executable: false,
      rentEpoch: 201
    };

    act(() => {
      storedCallback!(updatedAccountInfo);
    });

    expect(result.current.accounts.get(testPubkey.toString())).toEqual(updatedAccountInfo);
  });

  test('Memory management - Cleanup verification', async () => {
    const { result } = renderHook(() => useBlockchainStore());
    
    const testPubkey1 = new PublicKey('11111111111111111111111111111112');
    const testPubkey2 = new PublicKey('11111111111111111111111111111113');
    
    const mockConnection = {
      onAccountChange: vi.fn()
        .mockReturnValueOnce(789)
        .mockReturnValueOnce(790),
      getAccountInfo: vi.fn().mockResolvedValue({
        lamports: 1000000000,
        data: Buffer.from([]),
        owner: testPubkey1,
        executable: false,
        rentEpoch: 200
      }),
      removeAccountChangeListener: vi.fn().mockResolvedValue(undefined)
    } as any;

    act(() => {
      useWalletStore.setState({
        connection: mockConnection,
        publicKey: testPubkey1,
        connected: true,
        balance: 1.0,
        connecting: false
      });
    });
    
    await act(async () => {
      await result.current.subscribeToAccount(testPubkey1);
      await result.current.subscribeToAccount(testPubkey2);
    });

    expect(result.current.subscriptions.size).toBe(2);
    expect(result.current.accounts.size).toBe(2);

    act(() => {
      result.current.cleanup();
    });

    expect(result.current.subscriptions.size).toBe(0);
    expect(result.current.accounts.size).toBe(0);
    expect(mockConnection.removeAccountChangeListener).toHaveBeenCalledTimes(2);
  });

  test('Error handling - Connection not available', async () => {
    const { result } = renderHook(() => useBlockchainStore());
    const testPubkey = new PublicKey('11111111111111111111111111111112');

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
        await result.current.subscribeToAccount(testPubkey);
      } catch (error) {
        errorThrown = true;
        expect((error as Error).message).toBe('Wallet not connected');
      }
    });

    expect(errorThrown).toBe(true);
    expect(result.current.subscriptions.size).toBe(0);
    expect(result.current.accounts.size).toBe(0);
  });

  test('Unsubscribe functionality - Evidence Based', async () => {
    const { result } = renderHook(() => useBlockchainStore());
    const testPubkey = new PublicKey('11111111111111111111111111111112');

    const mockConnection = {
      onAccountChange: vi.fn().mockReturnValue(999),
      getAccountInfo: vi.fn().mockResolvedValue({
        lamports: 1000000000,
        data: Buffer.from([]),
        owner: testPubkey,
        executable: false,
        rentEpoch: 200
      })
    } as any;

    act(() => {
      useWalletStore.setState({
        connection: mockConnection,
        publicKey: testPubkey,
        connected: true,
        balance: 1.0,
        connecting: false
      });
    });

    await act(async () => {
      await result.current.subscribeToAccount(testPubkey);
    });

    expect(result.current.subscriptions.size).toBe(1);
    expect(result.current.accounts.size).toBe(1);

    act(() => {
      result.current.unsubscribeFromAccount(testPubkey);
    });

    expect(result.current.subscriptions.size).toBe(0);
    expect(result.current.accounts.size).toBe(0);
  });

  test('Duplicate subscription prevention - Security Pattern', async () => {
    const { result } = renderHook(() => useBlockchainStore());
    const testPubkey = new PublicKey('11111111111111111111111111111112');

    const mockConnection = {
      onAccountChange: vi.fn().mockReturnValue(111),
      getAccountInfo: vi.fn().mockResolvedValue(null)
    } as any;

    act(() => {
      useWalletStore.setState({
        connection: mockConnection,
        publicKey: testPubkey,
        connected: true,
        balance: 1.0,
        connecting: false
      });
    });

    await act(async () => {
      await result.current.subscribeToAccount(testPubkey);
    });

    expect(result.current.subscriptions.size).toBe(1);
    expect(mockConnection.onAccountChange).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.subscribeToAccount(testPubkey);
    });

    expect(result.current.subscriptions.size).toBe(1);
    expect(mockConnection.onAccountChange).toHaveBeenCalledTimes(1);
  });
});