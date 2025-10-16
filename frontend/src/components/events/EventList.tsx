import React from 'react';
import { PublicKey } from '@solana/web3.js';
import { PoolEvent } from '../../stores/types';

interface EventListProps {
  events: Array<PoolEvent & { id: string; pubkey: PublicKey }>;
  selectedEvent: (PoolEvent & { id: string; pubkey: PublicKey }) | null;
  onSelectEvent: (event: PoolEvent & { id: string; pubkey: PublicKey }) => void;
}

export const EventList: React.FC<EventListProps> = ({ 
  events, 
  selectedEvent, 
  onSelectEvent 
}) => {

  const getTimeDisplay = (event: PoolEvent) => {
    const now = Date.now() / 1000;
    const diff = event.matchStartTime - now;
    
    if (event.settled) {
      return 'Completed';
    } else if (event.matchStartTime <= now) {
      return 'LIVE NOW';
    } else {
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      return `Starts in ${hours}h ${minutes}m`;
    }
  };

  const formatPoolSize = (lamports: number) => {
    return (lamports / 1e9).toFixed(2);
  };

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="text-slate-400 text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-light text-slate-600 mb-2">No Events</h3>
        <p className="text-slate-500">Check back later for new matches</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <div
          key={event.id}
          onClick={() => onSelectEvent(event)}
          className={`
            bg-white rounded-2xl p-6 cursor-pointer transition-all
            ${selectedEvent?.id === event.id 
              ? 'ring-2 ring-slate-300 shadow-lg' 
              : 'hover:shadow-md'
            }
          `}
        >
          {/* Event Header - Single Element */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-light text-slate-800 mb-2">
              {event.teamA} vs {event.teamB}
            </h3>
            <div className="text-sm text-slate-500">
              {getTimeDisplay(event)}
            </div>
          </div>

          {/* Pool Information - Second Element */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <div className="text-sm text-slate-600 mb-1">{event.teamA}</div>
              <div className="text-lg font-medium text-slate-800">
                {formatPoolSize(event.teamAPool)} SOL
              </div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <div className="text-sm text-slate-600 mb-1">{event.teamB}</div>
              <div className="text-lg font-medium text-slate-800">
                {formatPoolSize(event.teamBPool)} SOL
              </div>
            </div>
          </div>

          {/* Status - Third Element */}
          <div className="text-center">
            {event.settled && event.winner !== null ? (
              <div className="text-sm text-slate-600">
                Winner: {event.winner ? event.teamA : event.teamB}
              </div>
            ) : (
              <div className="text-sm text-slate-500">
                Total: {formatPoolSize(event.teamAPool + event.teamBPool)} SOL
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};