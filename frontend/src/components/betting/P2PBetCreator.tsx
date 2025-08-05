import React, { useState } from 'react';
import { useBetMatching } from '../../hooks/store/useBettingOperations';
import { useWalletConnection } from '../../hooks/store/useWalletConnection';
import { useToast } from '../../hooks/store/useUIState';

interface BetForm {
  amount: string;
  odds: string;
  betOn: string;
  eventId: string;
  description: string;
}

export const P2PBetCreator: React.FC = () => {
  const [form, setForm] = useState<BetForm>({
    amount: '',
    odds: '2.0',
    betOn: '',
    eventId: '',
    description: '',
  });
  const [step, setStep] = useState<'form' | 'review' | 'confirm'>('form');

  const { createNewBet, isCreating } = useBetMatching();
  const { connected, balance, formattedBalance } = useWalletConnection();
  const { showSuccess, showError } = useToast();

  const handleInputChange = (field: keyof BetForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!form.amount || parseFloat(form.amount) <= 0) {
      errors.push('Amount must be greater than 0');
    }
    
    if (balance !== null && parseFloat(form.amount) > balance / 1e9) {
      errors.push('Insufficient balance');
    }
    
    if (!form.odds || parseFloat(form.odds) < 1.01) {
      errors.push('Odds must be at least 1.01');
    }
    
    if (!form.betOn.trim()) {
      errors.push('Please specify what you are betting on');
    }
    
    if (!form.description.trim()) {
      errors.push('Please provide a description');
    }
    
    return errors;
  };

  const handleNext = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      showError(errors[0]);
      return;
    }
    setStep('review');
  };

  const handleConfirm = async () => {
    try {
      setStep('confirm');
      const betPubkey = await createNewBet(
        parseFloat(form.amount),
        parseFloat(form.odds),
        form.betOn,
        form.eventId || `event-${Date.now()}`
      );

      if (betPubkey) {
        showSuccess('Bet created successfully!');
        // Reset form
        setForm({
          amount: '',
          odds: '2.0',
          betOn: '',
          eventId: '',
          description: '',
        });
        setStep('form');
      }
    } catch (error) {
      showError('Failed to create bet');
      setStep('review');
    }
  };

  const potentialWinnings = parseFloat(form.amount || '0') * parseFloat(form.odds || '0');
  const requiredMargin = parseFloat(form.amount || '0') * 0.05; // 5% margin

  if (!connected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect your wallet to create P2P bets
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Create P2P Bet
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Step {step === 'form' ? '1' : step === 'review' ? '2' : '3'} of 3
        </p>
      </div>

      {/* Step Indicator */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step === 'form' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
          }`}>
            {step === 'form' ? '1' : '✓'}
          </div>
          <div className={`flex-1 h-1 mx-4 ${
            step === 'form' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-green-600'
          }`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step === 'review' ? 'bg-blue-600 text-white' : 
            step === 'confirm' ? 'bg-green-600 text-white' :
            'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            {step === 'confirm' ? '✓' : '2'}
          </div>
          <div className={`flex-1 h-1 mx-4 ${
            step === 'confirm' ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
          }`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step === 'confirm' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            3
          </div>
        </div>
      </div>

      <div className="p-6">
        {step === 'form' && (
          <div className="space-y-6">
            {/* Bet Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bet Amount (SOL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 sm:text-sm">SOL</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Available: {formattedBalance} SOL
              </p>
            </div>

            {/* Odds */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Odds (Multiplier)
              </label>
              <input
                type="number"
                step="0.1"
                min="1.01"
                value={form.odds}
                onChange={(e) => handleInputChange('odds', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2.0"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Higher odds = higher risk, higher reward
              </p>
            </div>

            {/* Betting On */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Betting On
              </label>
              <input
                type="text"
                value={form.betOn}
                onChange={(e) => handleInputChange('betOn', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Lakers to win, Bitcoin > $70k"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide additional details about your bet..."
              />
            </div>

            {/* Potential Winnings Preview */}
            {form.amount && form.odds && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                  Bet Summary
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-400">Your stake:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-300">
                      {form.amount} SOL
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-400">Potential win:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {potentialWinnings.toFixed(2)} SOL
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-400">Total return:</span>
                    <span className="font-bold text-blue-900 dark:text-blue-300">
                      {(potentialWinnings + parseFloat(form.amount || '0')).toFixed(2)} SOL
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Review Bet
            </button>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Review Your Bet</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="text-gray-900 dark:text-white">{form.amount} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Odds:</span>
                  <span className="text-gray-900 dark:text-white">{form.odds}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Betting on:</span>
                  <span className="text-gray-900 dark:text-white">{form.betOn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Potential win:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {potentialWinnings.toFixed(2)} SOL
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {form.description}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('form')}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Back to Edit
              </button>
              <button
                onClick={handleConfirm}
                disabled={isCreating}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? 'Creating Bet...' : 'Confirm & Create'}
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Creating your bet on the blockchain...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};