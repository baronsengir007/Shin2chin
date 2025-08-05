import React, { useState, useEffect } from 'react';
import { InputValidation } from '../../utils/validation/inputValidation';

interface OddsConfigurationProps {
  participants: string[];
  initialOdds: { [key: string]: number };
  onOddsChange: (odds: { [key: string]: number }) => void;
}

export const OddsConfiguration: React.FC<OddsConfigurationProps> = ({
  participants,
  initialOdds,
  onOddsChange,
}) => {
  const [odds, setOdds] = useState<{ [key: string]: number }>(initialOdds);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [autoBalance, setAutoBalance] = useState(true);

  // Initialize odds for new participants
  useEffect(() => {
    const newOdds = { ...odds };
    participants.forEach(participant => {
      if (!newOdds[participant]) {
        newOdds[participant] = 2.0;
      }
    });
    
    // Remove odds for participants that no longer exist
    Object.keys(newOdds).forEach(key => {
      if (!participants.includes(key)) {
        delete newOdds[key];
      }
    });

    setOdds(newOdds);
  }, [participants]);

  // Update parent component when odds change
  useEffect(() => {
    onOddsChange(odds);
  }, [odds, onOddsChange]);

  const handleOddsChange = (participant: string, value: string) => {
    const numValue = parseFloat(value);
    
    // Validate the odds
    const validation = InputValidation.validateOdds(value);
    const newErrors = { ...errors };
    
    if (!validation.isValid) {
      newErrors[participant] = validation.error!;
    } else {
      delete newErrors[participant];
    }
    
    setErrors(newErrors);

    if (!isNaN(numValue) && numValue > 0) {
      const newOdds = { ...odds, [participant]: numValue };
      
      // Auto-balance other odds if enabled
      if (autoBalance && participants.length === 2) {
        const otherParticipant = participants.find(p => p !== participant);
        if (otherParticipant) {
          // Simple inverse relationship for 2-participant events
          const impliedProb = 1 / numValue;
          const otherImpliedProb = Math.max(0.01, Math.min(0.99, 1 - impliedProb));
          newOdds[otherParticipant] = Math.max(1.01, 1 / otherImpliedProb);
        }
      }
      
      setOdds(newOdds);
    }
  };

  const calculateImpliedProbability = (oddsValue: number): number => {
    return (1 / oddsValue) * 100;
  };

  const getTotalImpliedProbability = (): number => {
    return Object.values(odds).reduce((sum, oddsValue) => sum + (1 / oddsValue), 0) * 100;
  };

  const normalizeOdds = () => {
    const totalImplied = getTotalImpliedProbability() / 100;
    const normalized: { [key: string]: number } = {};
    
    Object.entries(odds).forEach(([participant, oddsValue]) => {
      const impliedProb = 1 / oddsValue;
      const normalizedProb = impliedProb / totalImplied;
      normalized[participant] = Math.max(1.01, 1 / normalizedProb);
    });
    
    setOdds(normalized);
  };

  const resetToEven = () => {
    const evenOdds = participants.length;
    const newOdds: { [key: string]: number } = {};
    participants.forEach(participant => {
      newOdds[participant] = evenOdds;
    });
    setOdds(newOdds);
  };

  const presetOdds = (preset: 'favorite' | 'underdog' | 'close') => {
    const newOdds: { [key: string]: number } = {};
    
    switch (preset) {
      case 'favorite':
        participants.forEach((participant, index) => {
          newOdds[participant] = index === 0 ? 1.5 : 2.8;
        });
        break;
      case 'underdog':
        participants.forEach((participant, index) => {
          newOdds[participant] = index === 0 ? 3.5 : 1.3;
        });
        break;
      case 'close':
        participants.forEach((participant, index) => {
          newOdds[participant] = index === 0 ? 1.9 : 2.1;
        });
        break;
    }
    
    setOdds(newOdds);
  };

  const totalProbability = getTotalImpliedProbability();
  const isValid = totalProbability > 90 && totalProbability < 110; // Allow 10% margin

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Configure Initial Odds
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Set the starting odds for each participant. These can be adjusted later.
        </p>
      </div>

      {/* Auto-balance toggle */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="auto-balance"
          checked={autoBalance}
          onChange={(e) => setAutoBalance(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="auto-balance" className="text-sm text-gray-700 dark:text-gray-300">
          Auto-balance odds (for 2-participant events)
        </label>
      </div>

      {/* Odds Configuration */}
      <div className="space-y-4">
        {participants.map((participant, index) => (
          <div key={participant} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {participant}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Option {index + 1}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Odds Multiplier
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  value={odds[participant]?.toFixed(2) || '2.00'}
                  onChange={(e) => handleOddsChange(participant, e.target.value)}
                  className={`
                    w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${errors[participant] ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'}
                  `}
                />
                {errors[participant] && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {errors[participant]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Implied Probability
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white">
                  {odds[participant] ? calculateImpliedProbability(odds[participant]).toFixed(1) : '0.0'}%
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payout on 1 SOL
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white">
                  {odds[participant] ? (odds[participant]).toFixed(2) : '0.00'} SOL
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Odds Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Odds Summary
          </h4>
          <div className={`
            px-2 py-1 rounded text-xs font-medium
            ${isValid 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
            }
          `}>
            {isValid ? 'Valid' : 'Needs adjustment'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Total Implied Probability:</span>
            <span className={`ml-2 font-medium ${
              isValid 
                ? 'text-gray-900 dark:text-white'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {totalProbability.toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">House Edge:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {Math.max(0, totalProbability - 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {!isValid && (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              ⚠️ Total implied probability should be close to 100%. 
              {totalProbability > 110 ? ' Consider lowering some odds.' : ' Consider raising some odds.'}
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={resetToEven}
          className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Even Odds
        </button>
        <button
          onClick={() => presetOdds('favorite')}
          className="px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
        >
          Favorite Setup
        </button>
        <button
          onClick={() => presetOdds('close')}
          className="px-3 py-2 text-sm bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
        >
          Close Match
        </button>
        <button
          onClick={normalizeOdds}
          className="px-3 py-2 text-sm bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors"
        >
          Normalize
        </button>
      </div>
    </div>
  );
};