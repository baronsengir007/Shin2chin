import React from 'react';

interface Event {
  id: string;
  title: string;
  category: string;
  status: 'upcoming' | 'live' | 'completed';
  startTime: Date;
  participants: string[];
  currentOdds: { [key: string]: number };
  bettingVolume: number;
  lastUpdate: Date;
}

interface EventListProps {
  events: Event[];
  selectedEvent: Event | null;
  onSelectEvent: (event: Event) => void;
}

export const EventList: React.FC<EventListProps> = ({ 
  events, 
  selectedEvent, 
  onSelectEvent 
}) => {
  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'live':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTimeDisplay = (event: Event) => {
    const now = new Date();
    const diff = event.startTime.getTime() - now.getTime();
    
    if (event.status === 'live') {
      return 'LIVE NOW';
    } else if (event.status === 'upcoming') {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `Starts in ${hours}h ${minutes}m`;
    } else {
      return 'Completed';
    }
  };

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <p className="text-center text-gray-500 dark:text-gray-400">
          No events found matching your criteria
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          onClick={() => onSelectEvent(event)}
          className={`
            bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer transition-all
            ${selectedEvent?.id === event.id 
              ? 'ring-2 ring-blue-500 shadow-lg' 
              : 'hover:shadow-md'
            }
          `}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {event.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {event.category}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                {event.status.toUpperCase()}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {getTimeDisplay(event)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {event.participants.map((participant) => (
              <div key={participant} className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {participant}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {event.currentOdds[participant]?.toFixed(2)}x
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Volume: {event.bettingVolume.toFixed(0)} SOL
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Updated: {event.lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};