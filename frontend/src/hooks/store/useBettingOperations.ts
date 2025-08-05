import { useCallback } from 'react';
import { useBettingStore } from '../../stores/bettingStore';
import { useWalletStore } from '../../stores/walletStore';
import { useUIStore } from '../../stores/uiStore';
import { BetProposal, Bet } from '../../types';
import { PublicKey } from '@solana/web3.js';

export const useActiveBets = () => {
  const bets = useBettingStore((state) => state.bets);
  const publicKey = useWalletStore((state) => state.publicKey);

  const activeBets = Array.from(bets.values()).filter(bet => 
    bet.status === 'OPEN' || bet.status === 'MATCHED'
  );

  const userBets = publicKey 
    ? activeBets.filter(bet => 
        bet.creator.equals(publicKey) || bet.acceptor?.equals(publicKey)
      )
    : [];

  const availableBets = publicKey
    ? activeBets.filter(bet => 
        bet.status === 'OPEN' && !bet.creator.equals(publicKey)
      )
    : activeBets.filter(bet => bet.status === 'OPEN');

  return {
    allActive: activeBets,
    userBets,
    availableBets,
    totalCount: activeBets.length,
  };
};

export const useBetMatching = () => {
  const createBet = useBettingStore((state) => state.createBet);
  const acceptBet = useBettingStore((state) => state.acceptBet);
  const setError = useUIStore((state) => state.setError);
  const setLoading = useUIStore((state) => state.setLoading);

  const matchBet = useCallback(async (betPubkey: PublicKey) => {
    try {
      setLoading('bet-match', true);
      await acceptBet(betPubkey);
    } catch (error) {
      setError('Failed to match bet', error as Error);
    } finally {
      setLoading('bet-match', false);
    }
  }, [acceptBet, setError, setLoading]);

  const createNewBet = useCallback(async (
    amount: number,
    odds: number,
    betOn: string,
    eventId: string
  ) => {
    try {
      setLoading('bet-create', true);
      const betPubkey = await createBet(amount, odds, betOn, eventId);
      return betPubkey;
    } catch (error) {
      setError('Failed to create bet', error as Error);
      return null;
    } finally {
      setLoading('bet-create', false);
    }
  }, [createBet, setError, setLoading]);

  return {
    matchBet,
    createNewBet,
    isMatching: useUIStore((state) => state.loadingStates.get('bet-match') || false),
    isCreating: useUIStore((state) => state.loadingStates.get('bet-create') || false),
  };
};

export const useBetProposals = () => {
  const proposals = useBettingStore((state) => state.proposals);
  const publicKey = useWalletStore((state) => state.publicKey);

  const userProposals = publicKey
    ? proposals.filter(proposal => proposal.proposer.equals(publicKey))
    : [];

  const receivedProposals = publicKey
    ? proposals.filter(proposal => 
        proposal.counterparty && proposal.counterparty.equals(publicKey)
      )
    : [];

  return {
    all: proposals,
    sent: userProposals,
    received: receivedProposals,
    count: proposals.length,
  };
};

export const useBettingHistory = () => {
  const bets = useBettingStore((state) => state.bets);
  const publicKey = useWalletStore((state) => state.publicKey);

  const completedBets = Array.from(bets.values()).filter(bet =>
    bet.status === 'SETTLED' || bet.status === 'CANCELLED'
  );

  const userHistory = publicKey
    ? completedBets.filter(bet =>
        bet.creator.equals(publicKey) || bet.acceptor?.equals(publicKey)
      )
    : [];

  const wins = userHistory.filter(bet => {
    if (!publicKey || !bet.winner) return false;
    return bet.winner.equals(publicKey);
  });

  const losses = userHistory.filter(bet => {
    if (!publicKey || !bet.winner) return false;
    return !bet.winner.equals(publicKey) && 
           (bet.creator.equals(publicKey) || bet.acceptor?.equals(publicKey));
  });

  return {
    history: userHistory,
    wins: wins.length,
    losses: losses.length,
    totalBets: userHistory.length,
    winRate: userHistory.length > 0 ? (wins.length / userHistory.length) * 100 : 0,
  };
};