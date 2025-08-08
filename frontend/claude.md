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

## MCP Integration Points

### Available MCPs:
- **Sequential Thinking MCP**: Systematic analysis
- **Memory MCP**: Context persistence  
- **GitHub MCP**: Version control
- **Solana Development MCP**: Blockchain patterns
- **Semgrep MCP**: Security scanning
- **Claude Task Master**: Task breakdown

### Usage per Phase:
- Phase 0-1: Sequential Thinking + Memory MCP
- Phase 2: All MCPs as needed
- Phase 3-4: Semgrep + Sequential Thinking
- Phase 5: Testing with actual execution