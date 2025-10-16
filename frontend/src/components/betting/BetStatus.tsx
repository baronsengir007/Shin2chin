import React from 'react';
import { PoolBet } from '../../stores/types';
import useBettingStore from '../../stores/bettingStore';
import useWalletStore from '../../stores/walletStore';
import useUIStore from '../../stores/uiStore';

interface BetStatusProps {
  bets: PoolBet[];
}

export const BetStatus: React.FC<BetStatusProps> = ({ bets }) => {
  const { claimWinnings } = useBettingStore();
  const { connected, publicKey } = useWalletStore();
  const { setError, setLoading } = useUIStore();

  const handleClaimWinnings = async (betId: string) => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);

    try {
      await claimWinnings(betId);
      setError(null);
    } catch (error) {
      console.error('Claim winnings failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to claim winnings');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (lamports: number) => {
    return (lamports / 1e9).toFixed(2);
  };

  const getStatusColor = (status: PoolBet['status']) => {
    switch (status) {
      case 'Active':
        return 'text-blue-600 dark:text-blue-400';
      case 'Won':
        return 'text-green-600 dark:text-green-400';
      case 'Lost':
        return 'text-red-600 dark:text-red-400';
      case 'Refunded':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'Claimed':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: PoolBet['status']) => {
    switch (status) {
      case 'Active':
        return '⏳';
      case 'Won':
        return '🎉';
      case 'Lost':
        return '❌';
      case 'Refunded':
        return '↩️';
      case 'Claimed':
        return '✅';
      default:
        return '❓';
    }
  };

  if (bets.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="text-slate-400 text-6xl mb-4">📊</div>
        <h3 className="text-xl font-light text-slate-600 mb-2">No Bets</h3>
        <p className="text-slate-500">Start betting to see your activity here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8">
      {/* Header - Single Element */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-light text-slate-800 mb-2">Your Bets</h2>
        <div className="text-slate-500">{bets.length} active</div>
      </div>

      {/* Bet List - Second Element */}
      <div className="space-y-4 mb-8">
        {bets.map((bet) => (
          <div key={bet.id} className="border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getStatusIcon(bet.status)}</span>
                <div>
                  <div className="font-medium text-slate-800">
                    {formatAmount(bet.amount)} SOL
                  </div>
                  <div className="text-sm text-slate-500">
                    {bet.team ? 'Team A' : 'Team B'}
                  </div>
                </div>
              </div>
              <div className={`text-sm font-medium ${getStatusColor(bet.status)}`}>
                {bet.status}
              </div>
            </div>

            {bet.status === 'Won' && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-600">Payout</div>
                    <div className="font-medium text-slate-800">
                      {formatAmount(bet.amount * 1.95)} SOL
                    </div>
                  </div>
                  <button
                    onClick={() => handleClaimWinnings(bet.id)}
                    className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-medium transition-all"
                  >
                    Claim
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary - Third Element */}
      <div className="border-t border-slate-200 pt-6">
        <div className="grid grid-cols-2 gap-6 text-center">
          <div>
            <div className="text-sm text-slate-500">Total</div>
            <div className="font-medium text-slate-800">
              {formatAmount(bets.reduce((sum, bet) => sum + bet.amount, 0))} SOL
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Won</div>
            <div className="font-medium text-slate-800">
              {bets.filter(bet => bet.status === 'Won').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetStatus;
