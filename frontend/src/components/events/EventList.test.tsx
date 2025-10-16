import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PublicKey } from '@solana/web3.js';
import { EventList } from './EventList';

const mockEvents = [
  {
    id: 'event1',
    pubkey: new PublicKey('11111111111111111111111111111112'),
    teamA: 'Chelsea',
    teamB: 'Manchester United',
    teamAPool: 1000000000, // 1 SOL in lamports
    teamBPool: 2000000000, // 2 SOL in lamports
    matchStartTime: Date.now() / 1000 + 3600, // 1 hour from now
    balanced: false,
    settled: false,
    winner: null,
    admin: new PublicKey('11111111111111111111111111111112'),
  },
  {
    id: 'event2',
    pubkey: new PublicKey('11111111111111111111111111111113'),
    teamA: 'Arsenal',
    teamB: 'Liverpool',
    teamAPool: 5000000000, // 5 SOL in lamports
    teamBPool: 5000000000, // 5 SOL in lamports
    matchStartTime: Date.now() / 1000 - 3600, // 1 hour ago
    balanced: true,
    settled: true,
    winner: true, // Arsenal won
    admin: new PublicKey('11111111111111111111111111111112'),
  },
];

describe('EventList', () => {
  it('renders without crashing', () => {
    render(
      <EventList 
        events={mockEvents} 
        selectedEvent={null} 
        onSelectEvent={() => {}} 
      />
    );
    
    expect(screen.getByText('Chelsea vs Manchester United')).toBeDefined();
    expect(screen.getByText('Arsenal vs Liverpool')).toBeDefined();
  });

  it('shows pool information correctly', () => {
    render(
      <EventList 
        events={mockEvents} 
        selectedEvent={null} 
        onSelectEvent={() => {}} 
      />
    );
    
    expect(screen.getByText('1.00 SOL')).toBeDefined();
    expect(screen.getByText('2.00 SOL')).toBeDefined();
    expect(screen.getAllByText('5.00 SOL')).toHaveLength(2); // Both teams have 5.00 SOL
  });

  it('shows event status correctly', () => {
    render(
      <EventList 
        events={mockEvents} 
        selectedEvent={null} 
        onSelectEvent={() => {}} 
      />
    );
    
    expect(screen.getByText('Starts in 0h 59m')).toBeDefined();
    expect(screen.getByText('Completed')).toBeDefined();
  });

  it('shows winner for settled events', () => {
    render(
      <EventList 
        events={mockEvents} 
        selectedEvent={null} 
        onSelectEvent={() => {}} 
      />
    );
    
    expect(screen.getByText('Winner: Arsenal')).toBeDefined();
  });

  it('shows empty state when no events', () => {
    render(
      <EventList 
        events={[]} 
        selectedEvent={null} 
        onSelectEvent={() => {}} 
      />
    );
    
    expect(screen.getByText('No Events')).toBeDefined();
    expect(screen.getByText('Check back later for new matches')).toBeDefined();
  });

  it('shows total pool size', () => {
    render(
      <EventList 
        events={mockEvents} 
        selectedEvent={null} 
        onSelectEvent={() => {}} 
      />
    );
    
    expect(screen.getByText('Total: 3.00 SOL')).toBeDefined();
    expect(screen.getByText('Winner: Arsenal')).toBeDefined();
  });

  it('shows balance status', () => {
    render(
      <EventList 
        events={mockEvents} 
        selectedEvent={null} 
        onSelectEvent={() => {}} 
      />
    );
    
    // Balance status is no longer displayed in the simplified Zen UI
    expect(screen.getByText('Total: 3.00 SOL')).toBeDefined();
    expect(screen.getByText('Winner: Arsenal')).toBeDefined();
  });
});
