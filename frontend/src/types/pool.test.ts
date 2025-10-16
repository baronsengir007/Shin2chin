import { describe, it, expect } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { 
  PoolBet, 
  PoolEvent, 
  BetStatus, 
  PoolEventWithId,
  EventFilters,
  BetFilters
} from './pool';

describe('Pool Type Definitions', () => {
  describe('PoolBet', () => {
    it('should have all required properties', () => {
      const bet: PoolBet = {
        id: 'bet-123',
        user: new PublicKey('So11111111111111111111111111111111111111112'),
        event: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        amount: 1.5,
        team: true,
        timestamp: Date.now(),
        status: 'Active',
        createdAt: new Date()
      };

      expect(bet.id).toBe('bet-123');
      expect(bet.user).toBeInstanceOf(PublicKey);
      expect(bet.event).toBeInstanceOf(PublicKey);
      expect(bet.amount).toBe(1.5);
      expect(bet.team).toBe(true);
      expect(bet.timestamp).toBeTypeOf('number');
      expect(bet.status).toBe('Active');
      expect(bet.createdAt).toBeInstanceOf(Date);
    });

    it('should accept all valid BetStatus values', () => {
      const statuses: BetStatus[] = ['Active', 'Refunded', 'Won', 'Lost', 'Claimed'];
      
      statuses.forEach(status => {
        const bet: PoolBet = {
          id: 'bet-123',
          user: new PublicKey('So11111111111111111111111111111111111111112'),
          event: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
          amount: 1.0,
          team: false,
          timestamp: Date.now(),
          status,
          createdAt: new Date()
        };
        expect(bet.status).toBe(status);
      });
    });
  });

  describe('PoolEvent', () => {
    it('should have all required properties', () => {
      const event: PoolEvent = {
        teamA: 'Team Alpha',
        teamB: 'Team Beta',
        teamAPool: 10.5,
        teamBPool: 8.2,
        matchStartTime: Date.now() + 3600000, // 1 hour from now
        balanced: false,
        settled: false,
        winner: null,
        admin: new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
      };

      expect(event.teamA).toBe('Team Alpha');
      expect(event.teamB).toBe('Team Beta');
      expect(event.teamAPool).toBe(10.5);
      expect(event.teamBPool).toBe(8.2);
      expect(event.matchStartTime).toBeTypeOf('number');
      expect(event.balanced).toBe(false);
      expect(event.settled).toBe(false);
      expect(event.winner).toBe(null);
      expect(event.admin).toBeInstanceOf(PublicKey);
    });

    it('should handle settled events with winner', () => {
      const event: PoolEvent = {
        teamA: 'Team Alpha',
        teamB: 'Team Beta',
        teamAPool: 15.0,
        teamBPool: 12.0,
        matchStartTime: Date.now() - 3600000, // 1 hour ago
        balanced: true,
        settled: true,
        winner: true, // Team A won
        admin: new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
      };

      expect(event.settled).toBe(true);
      expect(event.winner).toBe(true);
    });
  });

  describe('PoolEventWithId', () => {
    it('should extend PoolEvent with id and pubkey', () => {
      const eventWithId: PoolEventWithId = {
        id: 'event-456',
        pubkey: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
        teamA: 'Team Alpha',
        teamB: 'Team Beta',
        teamAPool: 5.0,
        teamBPool: 5.0,
        matchStartTime: Date.now(),
        balanced: true,
        settled: false,
        winner: null,
        admin: new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')
      };

      expect(eventWithId.id).toBe('event-456');
      expect(eventWithId.pubkey).toBeInstanceOf(PublicKey);
      expect(eventWithId.teamA).toBe('Team Alpha');
    });
  });


  describe('EventFilters', () => {
    it('should allow filtering by team names', () => {
      const filters: EventFilters = {
        teamA: 'Alpha',
        teamB: 'Beta',
        status: 'upcoming'
      };

      expect(filters.teamA).toBe('Alpha');
      expect(filters.teamB).toBe('Beta');
      expect(filters.status).toBe('upcoming');
    });
  });

  describe('BetFilters', () => {
    it('should allow filtering by status and event', () => {
      const filters: BetFilters = {
        eventId: 'event-123',
        status: 'Active'
      };

      expect(filters.eventId).toBe('event-123');
      expect(filters.status).toBe('Active');
    });
  });

  describe('Type Safety', () => {
    it('should enforce correct types for all properties', () => {
      // Test that TypeScript enforces correct types
      const bet: PoolBet = {
        id: 'string-id',
        user: new PublicKey('So11111111111111111111111111111111111111112'),
        event: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        amount: 1.5, // number
        team: true, // boolean
        timestamp: Date.now(), // number
        status: 'Active', // BetStatus
        createdAt: new Date() // Date
      };

      // These should compile without errors
      expect(typeof bet.id).toBe('string');
      expect(typeof bet.amount).toBe('number');
      expect(typeof bet.team).toBe('boolean');
      expect(typeof bet.timestamp).toBe('number');
      expect(typeof bet.status).toBe('string');
      expect(bet.createdAt).toBeInstanceOf(Date);
    });
  });
});