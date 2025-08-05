import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Connection, PublicKey } from '@solana/web3.js';
import useWalletStore from '../../stores/walletStore';

describe('WalletStore Functionality Tests', () => {
  beforeEach(() => {
    useWalletStore.setState({
      connection: null,
      publicKey: null,
      connected: false,
      balance: 0,
      connecting: false
    });
  });

  test('Initial state verification - Evidence Required', () => {
    const { result } = renderHook(() => useWalletStore());
    
    expect(result.current.connected).toBe(false);
    expect(result.current.connection).toBe(null);
    expect(result.current.publicKey).toBe(null);
    expect(result.current.balance).toBe(0);
    expect(result.current.connecting).toBe(false);
    
    expect(typeof result.current.connect).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
    expect(typeof result.current.updateBalance).toBe('function');
  });

  test('Connection state management - Real Implementation Test', async () => {
    const { result } = renderHook(() => useWalletStore());
    
    const mockPublicKey = new PublicKey('11111111111111111111111111111112');
    
    Object.defineProperty(window, 'solana', {
      value: {
        isPhantom: true,
        connect: vi.fn().mockResolvedValue({
          publicKey: mockPublicKey
        }),
        disconnect: vi.fn().mockResolvedValue({}),
        on: vi.fn(),
        off: vi.fn()
      },
      writable: true
    });

    const mockConnection = {
      getBalance: vi.fn().mockResolvedValue(1000000000)
    } as any;

    vi.spyOn(Connection.prototype, 'constructor' as any).mockImplementation(() => mockConnection);
    vi.spyOn(Connection.prototype, 'getBalance').mockResolvedValue(1000000000);

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.connecting).toBe(false);
    expect(result.current.connected).toBe(true);
    expect(result.current.publicKey).toEqual(mockPublicKey);
    expect(result.current.connection).not.toBe(null);
  });

  test('Disconnect functionality - State Reset Verification', () => {
    const { result } = renderHook(() => useWalletStore());
    
    const mockPublicKey = new PublicKey('11111111111111111111111111111112');
    
    useWalletStore.setState({
      connection: {} as Connection,
      publicKey: mockPublicKey,
      connected: true,
      balance: 1.5,
      connecting: false
    });

    Object.defineProperty(window, 'solana', {
      value: {
        disconnect: vi.fn().mockResolvedValue({})
      },
      writable: true
    });

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.connected).toBe(false);
    expect(result.current.connection).toBe(null);
    expect(result.current.publicKey).toBe(null);
    expect(result.current.balance).toBe(0);
    expect(result.current.connecting).toBe(false);
  });

  test('Connection failure handling - Error State Management', async () => {
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
      }
    });

    expect(errorThrown).toBe(true);
    expect(result.current.connected).toBe(false);
    expect(result.current.connecting).toBe(false);
    expect(result.current.connection).toBe(null);
  });

  test('Phantom wallet detection - Security Validation', async () => {
    const { result } = renderHook(() => useWalletStore());

    Object.defineProperty(window, 'solana', {
      value: undefined,
      writable: true
    });

    let errorThrown = false;
    await act(async () => {
      try {
        await result.current.connect();
      } catch (error) {
        errorThrown = true;
        expect((error as Error).message).toContain('Phantom wallet not found');
      }
    });

    expect(errorThrown).toBe(true);
    expect(result.current.connected).toBe(false);
  });

  test('Balance update functionality - Real Data Flow', async () => {
    const { result } = renderHook(() => useWalletStore());
    
    const mockPublicKey = new PublicKey('11111111111111111111111111111112');
    const getBalanceMock = vi.fn().mockResolvedValue(2500000000);
    
    const mockConnection = {
      getBalance: getBalanceMock
    } as any;

    act(() => {
      useWalletStore.setState({
        connection: mockConnection,
        publicKey: mockPublicKey,
        connected: true,
        balance: 0,
        connecting: false
      });
    });

    await act(async () => {
      await result.current.updateBalance();
    });

    await new Promise(resolve => setTimeout(resolve, 1100));

    expect(getBalanceMock).toHaveBeenCalledWith(mockPublicKey);
    expect(result.current.balance).toBe(2.5);
  });
});