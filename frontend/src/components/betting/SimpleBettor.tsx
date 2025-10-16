import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { PoolEvent } from '../../stores/types';
import useBettingStore from '../../stores/bettingStore';
import useWalletStore from '../../stores/walletStore';
import useUIStore from '../../stores/uiStore';

interface SimpleBettorProps {
  event: PoolEvent;
  eventPubkey: PublicKey;
}

export const SimpleBettor: React.FC<SimpleBettorProps> = ({ event, eventPubkey }) => {
  const [selectedTeam, setSelectedTeam] = useState<boolean | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [isPlacing, setIsPlacing] = useState(false);

  const { placeBet } = useBettingStore();
  const { connected, publicKey } = useWalletStore();
  const { setError, setLoading } = useUIStore();

  const handleTeamSelect = (team: boolean) => {
    setSelectedTeam(team);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handlePlaceBet = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (selectedTeam === null) {
      setError('Please select a team');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid bet amount');
      return;
    }

    setIsPlacing(true);
    setLoading(true);

    try {
      await placeBet(eventPubkey, selectedTeam, parseFloat(amount) * 1e9); // Convert SOL to lamports
      
      // Reset form
      setSelectedTeam(null);
      setAmount('');
      
      // Show success (will be handled by UI store)
      setError(null);
      
    } catch (error) {
      console.error('Bet placement failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to place bet');
    } finally {
      setIsPlacing(false);
      setLoading(false);
    }
  };

  const formatPoolSize = (lamports: number) => {
    return (lamports / 1e9).toFixed(2);
  };

  const isBettingOpen = event.matchStartTime > Date.now() / 1000 && !event.settled;

  if (!isBettingOpen) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          {event.settled ? 'Event has been settled' : 'Betting is closed'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 max-w-sm mx-auto">
      {/* Event Header - Single Element */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-light text-gray-800 mb-2">
          {event.teamA} vs {event.teamB}
        </h2>
        <div className="text-sm text-gray-500">
          {formatPoolSize(event.teamAPool)} vs {formatPoolSize(event.teamBPool)} SOL
        </div>
      </div>

      {/* Team Selection - Second Element */}
      <div className="mb-8">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleTeamSelect(true)}
            className={`p-6 rounded-xl transition-all ${
              selectedTeam === true
                ? 'bg-slate-100 border-2 border-slate-300'
                : 'bg-white border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="font-medium text-gray-800 text-lg">
              {event.teamA}
            </div>
          </button>
          
          <button
            onClick={() => handleTeamSelect(false)}
            className={`p-6 rounded-xl transition-all ${
              selectedTeam === false
                ? 'bg-slate-100 border-2 border-slate-300'
                : 'bg-white border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="font-medium text-gray-800 text-lg">
              {event.teamB}
            </div>
          </button>
        </div>
      </div>

      {/* Amount Input & Bet Button - Third Element */}
      {selectedTeam !== null && (
        <div className="space-y-4">
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Amount (SOL)"
            className="w-full p-4 text-center text-lg border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
          />
          
          <button
            onClick={handlePlaceBet}
            disabled={isPlacing || !connected || !amount}
            className={`w-full p-4 text-lg font-medium rounded-xl transition-all ${
              isPlacing || !connected || !amount
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-900 text-white'
            }`}
          >
            {isPlacing ? 'Placing...' : 'Place Bet'}
          </button>
        </div>
      )}

      {/* Wallet Connection Prompt */}
      {!connected && (
        <div className="text-center text-slate-500 text-sm">
          Connect wallet to bet
        </div>
      )}
    </div>
  );
};

export default SimpleBettor;
