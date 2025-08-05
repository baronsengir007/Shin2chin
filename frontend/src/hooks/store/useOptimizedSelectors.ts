import { useMemo } from 'react';
import { useWalletStore } from '../../stores/walletStore';
import { useBlockchainStore } from '../../stores/blockchainStore';
import { useBettingStore } from '../../stores/bettingStore';
import { useUIStore } from '../../stores/uiStore';
import { PublicKey } from '@solana/web3.js';

// Optimized selector for wallet data to prevent unnecessary re-renders
export const useWalletData = () => {
  const publicKey = useWalletStore((state) => state.publicKey);
  const connected = useWalletStore((state) => state.connected);
  const balance = useWalletStore((state) => state.balance);

  return useMemo(() => ({
    publicKey,
    connected,
    balance,
    displayAddress: publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : '',
  }), [publicKey, connected, balance]);
};

// Optimized selector for specific bet data
export const useBetById = (betId: string | null) => {
  const bet = useBettingStore((state) => 
    betId ? state.bets.get(betId) : null
  );

  return useMemo(() => bet, [bet]);
};

// Optimized selector for filtered bets
export const useFilteredBets = (
  filter: 'all' | 'open' | 'matched' | 'settled' | 'user'
) => {
  const bets = useBettingStore((state) => state.bets);
  const publicKey = useWalletStore((state) => state.publicKey);

  return useMemo(() => {
    const allBets = Array.from(bets.values());

    switch (filter) {
      case 'all':
        return allBets;
      case 'open':
        return allBets.filter(bet => bet.status === 'OPEN');
      case 'matched':
        return allBets.filter(bet => bet.status === 'MATCHED');
      case 'settled':
        return allBets.filter(bet => bet.status === 'SETTLED');
      case 'user':
        return publicKey 
          ? allBets.filter(bet => 
              bet.creator.equals(publicKey) || 
              (bet.acceptor && bet.acceptor.equals(publicKey))
            )
          : [];
      default:
        return allBets;
    }
  }, [bets, publicKey, filter]);
};

// Optimized selector for UI state combinations
export const useUIStatus = () => {
  const currentView = useUIStore((state) => state.currentView);
  const error = useUIStore((state) => state.error);
  const loadingStates = useUIStore((state) => state.loadingStates);

  const isAnyLoading = useMemo(() => 
    Array.from(loadingStates.values()).some(state => state),
    [loadingStates]
  );

  return useMemo(() => ({
    currentView,
    hasError: error !== null,
    isLoading: isAnyLoading,
    errorMessage: error?.message,
  }), [currentView, error, isAnyLoading]);
};

// Optimized selector for account subscription data
export const useAccountData = (pubkey: PublicKey | null) => {
  const account = useBlockchainStore((state) => 
    pubkey ? state.accounts.get(pubkey.toBase58()) : null
  );

  return useMemo(() => account, [account]);
};

// Optimized selector for bet statistics
export const useBetStatistics = () => {
  const bets = useBettingStore((state) => state.bets);
  const publicKey = useWalletStore((state) => state.publicKey);

  return useMemo(() => {
    const allBets = Array.from(bets.values());
    const userBets = publicKey 
      ? allBets.filter(bet => 
          bet.creator.equals(publicKey) || 
          (bet.acceptor && bet.acceptor.equals(publicKey))
        )
      : [];

    const userWins = userBets.filter(bet => 
      bet.status === 'SETTLED' && bet.winner?.equals(publicKey!)
    );

    const userLosses = userBets.filter(bet => 
      bet.status === 'SETTLED' && 
      bet.winner && 
      !bet.winner.equals(publicKey!)
    );

    return {
      totalBets: allBets.length,
      openBets: allBets.filter(bet => bet.status === 'OPEN').length,
      matchedBets: allBets.filter(bet => bet.status === 'MATCHED').length,
      settledBets: allBets.filter(bet => bet.status === 'SETTLED').length,
      userTotalBets: userBets.length,
      userWins: userWins.length,
      userLosses: userLosses.length,
      userWinRate: userBets.length > 0 
        ? (userWins.length / userBets.length) * 100 
        : 0,
    };
  }, [bets, publicKey]);
};