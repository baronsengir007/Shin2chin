# Frontend Context - Shin2Chin Betting

## Current State
- Built with React 18, TypeScript, Vite
- State management: Zustand
- Wallet: Phantom integration complete
- UI: Components need simplification

## Required Changes

### Remove (P2P Components)
- P2PBetCreator.tsx
- BetMatcher.tsx
- BetProposal.tsx
- All proposal/matching logic

### Keep & Simplify
- WalletConnection.tsx
- EventDisplay.tsx
- BettingInterface.tsx (rename to SimpleBettor.tsx)

### New Components Needed
- SimpleBettor.tsx - One-click betting
- PoolStatus.tsx - Show pool balance
- RefundNotification.tsx - If bet was refunded

## Component Philosophy
- Maximum 3 interactive elements per screen
- No modals, use inline feedback
- Soft transitions, no jarring animations
- White space is sacred