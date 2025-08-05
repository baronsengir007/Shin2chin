import { useCallback, useEffect, useState } from 'react';
import { useBlockchainStore } from '../../stores/blockchainStore';
import { PublicKey } from '@solana/web3.js';
import { BettingAccount } from '../../types';

export const useAccountSubscription = (pubkey: PublicKey | null) => {
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
  const subscribe = useBlockchainStore((state) => state.subscribe);
  const unsubscribe = useBlockchainStore((state) => state.unsubscribe);
  const accounts = useBlockchainStore((state) => state.accounts);

  useEffect(() => {
    if (!pubkey) return;

    const key = pubkey.toBase58();
    const id = subscribe(pubkey, (accountInfo) => {
      // Subscription callback handled by store
    });

    setSubscriptionId(id);

    return () => {
      if (id !== null) {
        unsubscribe(key);
      }
    };
  }, [pubkey, subscribe, unsubscribe]);

  const account = pubkey ? accounts.get(pubkey.toBase58()) : null;

  return {
    account,
    subscriptionId,
    isSubscribed: subscriptionId !== null,
  };
};

export const useTransactionStatus = (signature: string | null) => {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed' | null>(null);
  const connection = useBlockchainStore((state) => state.connection);

  useEffect(() => {
    if (!signature || !connection) return;

    let cancelled = false;

    const checkStatus = async () => {
      try {
        const result = await connection.getSignatureStatus(signature);
        if (cancelled) return;

        if (result.value === null) {
          setStatus('pending');
        } else if (result.value.err) {
          setStatus('failed');
        } else if (result.value.confirmationStatus === 'finalized' || 
                   result.value.confirmationStatus === 'confirmed') {
          setStatus('confirmed');
        } else {
          setStatus('pending');
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('failed');
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [signature, connection]);

  return status;
};

export const useBettingAccounts = () => {
  const accounts = useBlockchainStore((state) => state.accounts);
  const programId = useBlockchainStore((state) => state.programId);

  const bettingAccounts = Array.from(accounts.entries())
    .filter(([_, accountInfo]) => accountInfo.owner.equals(programId))
    .map(([pubkey, accountInfo]) => ({
      pubkey: new PublicKey(pubkey),
      account: accountInfo,
    }));

  return bettingAccounts;
};

export const useConnection = () => {
  return useBlockchainStore((state) => state.connection);
};

export const useProgramId = () => {
  return useBlockchainStore((state) => state.programId);
};