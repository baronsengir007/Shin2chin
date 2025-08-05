import useWalletStore from '../stores/walletStore';
import useBlockchainStore from '../stores/blockchainStore';
import useBettingStore from '../stores/bettingStore';
import useUIStore from '../stores/uiStore';

export const useStores = () => ({
  wallet: useWalletStore(),
  blockchain: useBlockchainStore(),
  betting: useBettingStore(),
  ui: useUIStore(),
});

export const useWallet = () => useWalletStore();
export const useBlockchain = () => useBlockchainStore();
export const useBetting = () => useBettingStore();
export const useUI = () => useUIStore();

export const useWalletState = () => {
  const { connection, publicKey, connected, balance, connecting } = useWalletStore();
  return { connection, publicKey, connected, balance, connecting };
};

export const useWalletActions = () => {
  const { connect, disconnect, updateBalance } = useWalletStore();
  return { connect, disconnect, updateBalance };
};

export const useBlockchainState = () => {
  const { programId, accounts, subscriptions } = useBlockchainStore();
  return { programId, accounts, subscriptions };
};

export const useBlockchainActions = () => {
  const { subscribeToAccount, unsubscribeFromAccount, cleanup } = useBlockchainStore();
  return { subscribeToAccount, unsubscribeFromAccount, cleanup };
};

export const useBettingState = () => {
  const { activeBets, betProposals, bettingHistory, loading } = useBettingStore();
  return { activeBets, betProposals, bettingHistory, loading };
};

export const useBettingActions = () => {
  const { createBetProposal, acceptBet, cancelBetProposal, loadBettingHistory } = useBettingStore();
  return { createBetProposal, acceptBet, cancelBetProposal, loadBettingHistory };
};

export const useUIState = () => {
  const { currentView, showModal, modalType, loading, error } = useUIStore();
  return { currentView, showModal, modalType, loading, error };
};

export const useUIActions = () => {
  const { setCurrentView, openModal, closeModal, setLoading, setError } = useUIStore();
  return { setCurrentView, openModal, closeModal, setLoading, setError };
};