# Project Changelog

## November 7, 2024

### 🔄 Major Pivot: P2P Matching → Auto-Balancing Pool
**Decision**: Complete architecture change from peer-to-peer matching to pool-based betting
**Rationale**: 
- P2P matching adds unnecessary complexity
- Users don't care about specific opponents
- Pool system is mathematically sustainable
- Simpler UX - no waiting for matches

**Technical Changes**:
- Remove all bet matching logic
- Implement auto-balance at match start
- Add LIFO refund mechanism
- Fixed 1.95x payouts for all winners

**Impact**:
- Backend: Complete refactor needed
- Frontend: 40% component removal
- Timeline: 2 week implementation
- Benefit: 80% complexity reduction

### 📝 Documentation Structure Created
- Added claude.md for context
- Added plan.md for detailed planning
- Added changelog.md for decision tracking
- Structure follows MCP-Enhanced Development Guide

### 🧹 Repository Cleanup
- Consolidated to single main branch
- Removed 8 feature branches
- Simplified git workflow

## November 8, 2024

### 🏗️ Pool Refactor - Day 1 Progress
**Completed Tasks**:
- ✅ Archived P2P contracts to `/shin2chin-solana/archived/p2p-contracts/`
- ✅ Created new pool contract: `shin2chin_pool`  
- ✅ Setup basic Anchor framework structure
- ✅ Implemented Event and Bet account structures
- ✅ Created stub instructions for all 5 core functions
- ✅ Updated Anchor.toml for new contract

**Architecture Decisions**:
- Event accounts use PDA with seeds: [b"event", admin.key(), team_a, team_b]
- Bet accounts store timestamp for LIFO refund mechanism
- BetStatus enum tracks: Active, Refunded, Won, Lost, Claimed
- Fixed 1.95x payout calculation built into Bet account

**Next Session**: 
- Complete place_bet instruction implementation
- Add proper SOL transfers and bet account creation
- Implement LIFO refund logic