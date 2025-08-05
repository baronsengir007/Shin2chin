import React, { useState } from 'react';
import { useActiveBets, useBetMatching } from '../../hooks/store/useBettingOperations';
import { useWalletConnection } from '../../hooks/store/useWalletConnection';
import { TransactionFlow } from './TransactionFlow';
import { PublicKey } from '@solana/web3.js';

export const BetMatcher: React.FC = () => {
  const { availableBets, userBets } = useActiveBets();
  const { matchBet, isMatching } = useBetMatching();
  const { connected, publicKey } = useWalletConnection();
  const [selectedBet, setSelectedBet] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleMatchBet = async (betPubkey: PublicKey) => {
    const success = await matchBet(betPubkey);
    if (success) {
      setShowConfirm(false);
      setSelectedBet(null);
    }
  };

  if (!connected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect your wallet to view and match available bets
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Available Bets */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Available Bets to Match
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {availableBets.length} bets waiting for counterparties
          </p>
        </div>

        <div className="p-6">
          {availableBets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No available bets to match at the moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableBets.map((bet) => (
                <div
                  key={bet.pubkey.toBase58()}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {bet.betOn}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        By {bet.creator.toBase58().slice(0, 8)}...{bet.creator.toBase58().slice(-4)}
                      </p>
                    </div>
                    <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-sm font-medium">
                      {bet.odds}x odds
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Bet Amount</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {(bet.amount / 1e9).toFixed(2)} SOL
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Potential Win</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {((bet.amount * bet.odds) / 1e9).toFixed(2)} SOL
                      </p>
                    </div>
                  </div>

                  {bet.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {bet.description}
                    </p>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedBet(bet);
                        setShowConfirm(true);
                      }}
                      disabled={isMatching}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isMatching ? 'Matching...' : 'Match This Bet'}
                    </button>
                    <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Your Active Bets */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Your Active Bets
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {userBets.length} bets you've created or matched
          </p>
        </div>

        <div className="p-6">
          {userBets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                You haven't created or matched any bets yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userBets.map((bet) => (
                <div
                  key={bet.pubkey.toBase58()}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {bet.betOn}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {bet.creator.equals(publicKey!) ? 'Created by you' : 'Matched by you'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      bet.status === 'OPEN' 
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                        : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                    }`}>
                      {bet.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {(bet.amount / 1e9).toFixed(2)} SOL
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Odds</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {bet.odds}x
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {bet.status === 'OPEN' ? 'Waiting' : 'Active'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && selectedBet && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Bet Match
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Betting on:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {selectedBet.betOn}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Required stake:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {(selectedBet.amount / 1e9).toFixed(2)} SOL
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Potential win:</span>
                <span className="text-green-600 dark:text-green-400 font-bold">
                  {((selectedBet.amount * selectedBet.odds) / 1e9).toFixed(2)} SOL
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedBet(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMatchBet(selectedBet.pubkey)}
                disabled={isMatching}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isMatching ? 'Matching...' : 'Confirm Match'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};