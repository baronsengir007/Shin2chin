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