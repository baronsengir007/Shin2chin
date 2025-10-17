import { useCallback } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import { BN } from 'bn.js';
import { PoolEvent, PoolBet } from '../stores/types';
import useWalletStore from '../stores/walletStore';
import useUIStore from '../stores/uiStore';
import IDL from '../idl/shin2chin_pool.json';

const PROGRAM_ID = new PublicKey('11111111111111111111111111111112');

export const usePoolContract = () => {
  const { connection, publicKey } = useWalletStore();
  const { setError, setLoading } = useUIStore();

  // Helper function to initialize Anchor program
  const getProgram = (connection: web3.Connection, wallet: any) => {
    const provider = new AnchorProvider(connection, wallet, {});
    return new Program(IDL as any, PROGRAM_ID, provider);
  };

  const placeBet = useCallback(async (
    eventPubkey: PublicKey,
    team: boolean,
    amount: number
  ): Promise<string> => {
    if (!connection || !publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);

    try {
      const program = getProgram(connection, { publicKey });

      // Derive bet PDA (includes team to prevent duplicate bets - Blocker #1 fix)
      const [betPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('bet'),
          publicKey.toBuffer(),
          eventPubkey.toBuffer(),
          Buffer.from([team ? 1 : 0])
        ],
        PROGRAM_ID
      );

      const tx = await program.methods
        .placeBet(team, new BN(amount))
        .accounts({
          event: eventPubkey,
          bet: betPda,
          user: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      setLoading(false);
      return tx;

    } catch (error) {
      console.error('Place bet failed:', error);
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to place bet');
      throw error;
    }
  }, [connection, publicKey, setError, setLoading]);

  const claimWinnings = useCallback(async (
    eventPubkey: PublicKey,
    betPubkey: PublicKey
  ): Promise<string> => {
    if (!connection || !publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);

    try {
      const program = getProgram(connection, { publicKey });

      const tx = await program.methods
        .claimWinnings()
        .accounts({
          event: eventPubkey,
          bet: betPubkey,
          user: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      setLoading(false);
      return tx;

    } catch (error) {
      console.error('Claim winnings failed:', error);
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to claim winnings');
      throw error;
    }
  }, [connection, publicKey, setError, setLoading]);

  const fetchEvents = useCallback(async (): Promise<Array<PoolEvent & { id: string; pubkey: PublicKey }>> => {
    if (!connection) {
      throw new Error('Connection not available');
    }

    setLoading(true);

    try {
      const program = getProgram(connection, { publicKey: PublicKey.default });

      const events = await program.account.event.all();

      const mappedEvents = events.map(event => {
        const account = event.account as any;
        return {
          id: event.publicKey.toString(),
          pubkey: event.publicKey,
          teamA: account.teamA as string,
          teamB: account.teamB as string,
          teamAPool: account.teamAPool.toNumber(),
          teamBPool: account.teamBPool.toNumber(),
          matchStartTime: account.matchStartTime.toNumber(),
          balanced: account.balanced as boolean,
          settled: account.settled as boolean,
          winner: account.winner as boolean | null,
          admin: account.admin as PublicKey,
        };
      });
      
      setLoading(false);
      return mappedEvents;

    } catch (error) {
      console.error('Fetch events failed:', error);
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to fetch events');
      throw error;
    }
  }, [connection, setError, setLoading]);

  const fetchUserBets = useCallback(async (userPubkey: PublicKey): Promise<PoolBet[]> => {
    if (!connection) {
      throw new Error('Connection not available');
    }

    setLoading(true);

    try {
      const program = getProgram(connection, { publicKey: PublicKey.default });

      // Fetch all user bets
      const bets = await program.account.bet.all([
        {
          memcmp: {
            offset: 8,
            bytes: userPubkey.toBase58()
          }
        }
      ]);

      // Map bets and automatically update stale statuses (Option B: invisible to user)
      const updatedBets = await Promise.all(bets.map(async (bet) => {
        const account = bet.account as any;
        let status = account.status as string;
        
        // Fetch event data to check if status needs updating
        const eventData = await program.account.event.fetch(account.event as PublicKey);
        const eventAccount = eventData as any;
        
        // Option B: Automatically update status if needed (invisible to user)
        if (account.status === 'Active') {
          try {
            // If event is settled, update bet status to Won/Lost
            if (eventAccount.settled && eventAccount.winner !== null) {
              await updateBetStatusSettled(account.event as PublicKey, bet.publicKey);
              // Determine new status based on winner
              status = account.team === eventAccount.winner ? 'Won' : 'Lost';
            }
            // If event is balanced and user was on larger pool, update to Refunded
            else if (eventAccount.balanced && !eventAccount.settled) {
              const [largerPoolIsTeamA] = eventAccount.teamAPool.toNumber() > eventAccount.teamBPool.toNumber() 
                ? [true] : [false];
              if (account.team === largerPoolIsTeamA) {
                await updateBetStatusRefunded(account.event as PublicKey, bet.publicKey);
                status = 'Refunded';
              }
            }
          } catch (error) {
            // Status update failed, keep original status
            console.warn('Failed to update bet status:', error);
          }
        }
        
        return {
          id: bet.publicKey.toString(),
          user: account.user as PublicKey,
          event: account.event as PublicKey,
          amount: account.amount.toNumber(),
          team: account.team as boolean,
          timestamp: account.timestamp.toNumber(),
          status: status as "Active" | "Refunded" | "Won" | "Lost" | "Claimed",
          createdAt: new Date(account.timestamp.toNumber() * 1000),
        };
      }));
      
      setLoading(false);
      return updatedBets;

    } catch (error) {
      console.error('Fetch user bets failed:', error);
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to fetch user bets');
      throw error;
    }
  }, [connection, setError, setLoading]);

  // Status update helper functions (used internally by fetchUserBets)
  const updateBetStatusRefunded = useCallback(async (
    eventPubkey: PublicKey,
    betPubkey: PublicKey
  ): Promise<string> => {
    if (!connection || !publicKey) {
      throw new Error('Wallet not connected');
    }

    const program = getProgram(connection, { publicKey });

    const tx = await program.methods
      .updateBetStatusRefunded()
      .accounts({
        event: eventPubkey,
        bet: betPubkey,
        user: publicKey,
      })
      .rpc();

    return tx;
  }, [connection, publicKey]);

  const updateBetStatusSettled = useCallback(async (
    eventPubkey: PublicKey,
    betPubkey: PublicKey
  ): Promise<string> => {
    if (!connection || !publicKey) {
      throw new Error('Wallet not connected');
    }

    const program = getProgram(connection, { publicKey });

    const tx = await program.methods
      .updateBetStatusSettled()
      .accounts({
        event: eventPubkey,
        bet: betPubkey,
        user: publicKey,
      })
      .rpc();

    return tx;
  }, [connection, publicKey]);

  return {
    placeBet,
    claimWinnings,
    fetchEvents,
    fetchUserBets,
    updateBetStatusRefunded,
    updateBetStatusSettled,
  };
};

export default usePoolContract;
