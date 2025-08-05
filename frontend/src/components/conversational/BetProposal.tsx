import React, { useState } from 'react';
import { useBetMatching } from '../../hooks/store/useBettingOperations';
import { useWalletConnection } from '../../hooks/store/useWalletConnection';
import { useToast } from '../../hooks/store/useUIState';

interface BetProposalProps {
  proposal: {
    amount: number;
    odds: number;
    betOn: string;
    eventId: string;
  };
}

export const BetProposal: React.FC<BetProposalProps> = ({ proposal }) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { createNewBet, isCreating } = useBetMatching();
  const { connected } = useWalletConnection();
  const { showSuccess, showError } = useToast();

  const handleConfirm = async () => {
    if (!connected) {
      showError('Please connect your wallet first');
      return;
    }

    setIsConfirming(true);
    try {
      const betPubkey = await createNewBet(
        proposal.amount,
        proposal.odds,
        proposal.betOn,
        proposal.eventId
      );

      if (betPubkey) {
        showSuccess('Bet created successfully!');
      }
    } catch (error) {
      showError('Failed to create bet');
    } finally {
      setIsConfirming(false);
    }
  };

  const potentialWinnings = proposal.amount * proposal.odds;

  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
        Bet Proposal Detected
      </h4>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Betting on:</span>
          <span className="font-medium text-gray-900 dark:text-white">{proposal.betOn}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Amount:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {proposal.amount} SOL
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Odds:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {proposal.odds}x
          </span>
        </div>
        
        <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
          <span className="text-gray-600 dark:text-gray-400">Potential Win:</span>
          <span className="font-semibold text-green-600 dark:text-green-400">
            {potentialWinnings.toFixed(2)} SOL
          </span>
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <button
          onClick={handleConfirm}
          disabled={isCreating || isConfirming}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating || isConfirming ? 'Creating...' : 'Confirm Bet'}
        </button>
        
        <button
          className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};