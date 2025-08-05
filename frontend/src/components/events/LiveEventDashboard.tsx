import React, { useState, useEffect } from 'react';
import { EventList } from './EventList';
import { EventFilters } from './EventFilters';
import { OddsVisualization } from './OddsVisualization';
import { useAccountSubscription } from '../../hooks/store/useBlockchainData';
import { useLoadingStates } from '../../hooks/store/useUIState';

interface LiveEvent {
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

export const LiveEventDashboard: React.FC = () => {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);
  const [filter, setFilter] = useState<{
    category: string;
    status: string;
    search: string;
  }>({
    category: 'all',
    status: 'all',
    search: '',
  });

  const { isLoading } = useLoadingStates();

  // Simulate real-time event updates
  useEffect(() => {
    const mockEvents: LiveEvent[] = [
      {
        id: 'event-1',
        title: 'Lakers vs Warriors',
        category: 'Basketball',
        status: 'live',
        startTime: new Date(),
        participants: ['Lakers', 'Warriors'],
        currentOdds: { 'Lakers': 1.85, 'Warriors': 2.10 },
        bettingVolume: 15420.5,
        lastUpdate: new Date(),
      },
      {
        id: 'event-2',
        title: 'Bitcoin Price > $70k by EOD',
        category: 'Crypto',
        status: 'live',
        startTime: new Date(Date.now() - 3600000),
        participants: ['Yes', 'No'],
        currentOdds: { 'Yes': 3.20, 'No': 1.35 },
        bettingVolume: 8932.0,
        lastUpdate: new Date(),
      },
      {
        id: 'event-3',
        title: 'Manchester United vs Chelsea',
        category: 'Soccer',
        status: 'upcoming',
        startTime: new Date(Date.now() + 7200000),
        participants: ['Man United', 'Chelsea', 'Draw'],
        currentOdds: { 'Man United': 2.40, 'Chelsea': 2.80, 'Draw': 3.10 },
        bettingVolume: 5210.0,
        lastUpdate: new Date(),
      },
    ];

    setEvents(mockEvents);

    // Simulate odds updates
    const interval = setInterval(() => {
      setEvents(prev => prev.map(event => {
        if (event.status === 'live') {
          const updatedOdds = { ...event.currentOdds };
          Object.keys(updatedOdds).forEach(key => {
            const change = (Math.random() - 0.5) * 0.1;
            updatedOdds[key] = Math.max(1.01, updatedOdds[key] + change);
          });
          return {
            ...event,
            currentOdds: updatedOdds,
            bettingVolume: event.bettingVolume + Math.random() * 100,
            lastUpdate: new Date(),
          };
        }
        return event;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter(event => {
    if (filter.category !== 'all' && event.category !== filter.category) return false;
    if (filter.status !== 'all' && event.status !== filter.status) return false;
    if (filter.search && !event.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Live Event Monitoring
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track real-time odds and betting activity across all events
        </p>
      </div>

      {/* Filters */}
      <EventFilters filter={filter} onFilterChange={setFilter} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event List */}
        <div className="lg:col-span-2">
          <EventList
            events={filteredEvents}
            selectedEvent={selectedEvent}
            onSelectEvent={setSelectedEvent}
          />
        </div>

        {/* Odds Visualization */}
        <div className="lg:col-span-1">
          {selectedEvent ? (
            <OddsVisualization event={selectedEvent} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-center text-gray-500 dark:text-gray-400">
                Select an event to view detailed odds
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Live Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{events.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Live Now</p>
          <p className="text-2xl font-bold text-green-600">
            {events.filter(e => e.status === 'live').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {events.reduce((sum, e) => sum + e.bettingVolume, 0).toFixed(0)} SOL
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Bettors</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.floor(events.reduce((sum, e) => sum + e.bettingVolume, 0) / 50)}
          </p>
        </div>
      </div>
    </div>
  );
};