import React, { useEffect, useState } from 'react';

interface Event {
  id: string;
  title: string;
  category: string;
  status: 'upcoming' | 'live' | 'completed';
  participants: string[];
  currentOdds: { [key: string]: number };
  bettingVolume: number;
  lastUpdate: Date;
}

interface OddsVisualizationProps {
  event: Event;
}

interface OddsHistory {
  timestamp: Date;
  odds: { [key: string]: number };
}

export const OddsVisualization: React.FC<OddsVisualizationProps> = ({ event }) => {
  const [oddsHistory, setOddsHistory] = useState<OddsHistory[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '4h' | '24h'>('1h');

  useEffect(() => {
    // Initialize with current odds
    setOddsHistory([{
      timestamp: new Date(),
      odds: { ...event.currentOdds }
    }]);
  }, [event.id]);

  useEffect(() => {
    // Add new odds data point when event updates
    setOddsHistory(prev => {
      const newHistory = [...prev, {
        timestamp: new Date(),
        odds: { ...event.currentOdds }
      }];
      // Keep only last 50 data points
      return newHistory.slice(-50);
    });
  }, [event.lastUpdate]);

  const calculateImpliedProbability = (odds: number) => {
    return (1 / odds) * 100;
  };

  const getOddsChange = (participant: string) => {
    if (oddsHistory.length < 2) return 0;
    const current = event.currentOdds[participant];
    const previous = oddsHistory[oddsHistory.length - 2].odds[participant];
    return ((current - previous) / previous) * 100;
  };

  const getMaxOdds = () => {
    return Math.max(...Object.values(event.currentOdds));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {event.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Real-time Odds Analysis
        </p>
      </div>

      {/* Timeframe Selector */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          {(['1h', '4h', '24h'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`
                px-3 py-1 rounded text-sm font-medium transition-colors
                ${selectedTimeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }
              `}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Odds Display */}
      <div className="p-6 space-y-4">
        {event.participants.map((participant) => {
          const odds = event.currentOdds[participant];
          const change = getOddsChange(participant);
          const probability = calculateImpliedProbability(odds);
          const barWidth = (odds / getMaxOdds()) * 100;

          return (
            <div key={participant} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 dark:text-white">
                  {participant}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {odds.toFixed(2)}x
                  </span>
                  {change !== 0 && (
                    <span className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              
              {/* Odds Bar */}
              <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
                <div className="absolute inset-0 flex items-center px-2">
                  <span className="text-xs font-medium text-white">
                    {probability.toFixed(1)}% implied
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Volume and Activity */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Volume</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {event.bettingVolume.toFixed(2)} SOL
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Last Update</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {event.lastUpdate.toLocaleTimeString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
          <span className={`
            text-sm font-medium
            ${event.status === 'live' ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'}
          `}>
            {event.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Action Button */}
      {event.status !== 'completed' && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Place Bet on This Event
          </button>
        </div>
      )}
    </div>
  );
};