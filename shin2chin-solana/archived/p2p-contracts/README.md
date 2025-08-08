# Archived P2P Contracts

## Why Archived
These contracts were part of the original P2P (peer-to-peer) betting implementation that was archived on November 8, 2024.

## Reason for Change
**From**: P2P matching system where users had to find specific opponents
**To**: Auto-balancing pool system where all users bet against a shared pool

## What's Archived
- `shin2chin_betting/` - Main P2P betting contract
- `oracle/` - Oracle system for P2P results
- `tests/` - Original P2P test files

## Problems with P2P Approach
1. **Complex matching**: Users had to wait for opponents
2. **Poor UX**: Too many steps to place a bet
3. **Scalability**: Hard to manage many simultaneous matches
4. **User confusion**: Users don't care about specific opponents

## New Pool Approach
1. **Instant betting**: No waiting for matches
2. **Simple UX**: Click team, enter amount, done
3. **Auto-balancing**: Pools always start 50-50 at match time
4. **Fair payouts**: Everyone gets 1.95x if they win

## Date Archived
November 8, 2024

## Status
**DEPRECATED** - Do not use these contracts for new development
Use the new `shin2chin_pool` contract instead.