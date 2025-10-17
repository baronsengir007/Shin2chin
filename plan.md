# Implementation Plan - Auto-Balance Pool Refactor

## 🎯 Sprint Goal
Transform P2P betting system → Auto-balancing pool system

## 📅 Week 1: Backend Refactor (Nov 7-14, 2024)

### Day 1-2: Setup & Archive
- [x] Archive current P2P contract to `/archived` folder
- [x] Create new Anchor project: `shin2chin_pool`
- [x] Setup basic Anchor framework structure
- [x] Copy reusable code (wallet connection, types) 
- [x] Document why we pivoted (add to changelog)

### Day 3-4: Core Pool Contract Implementation
```rust
// Core instructions to implement:
pub fn initialize_event(
    ctx: Context<InitEvent>, 
    team_a: String, 
    team_b: String,
    match_start_time: i64
) -> Result<()> // ✅ IMPLEMENTATION & TESTING COMPLETE - 5 unit tests passing

pub fn place_bet(
    ctx: Context<PlaceBet>, 
    team: bool, // true = team_a, false = team_b
    amount: u64
) -> Result<()> // ✅ IMPLEMENTATION & TESTING COMPLETE - 8 unit tests passing

pub fn auto_balance(
    ctx: Context<AutoBalance>
) -> Result<()> // ✅ IMPLEMENTATION & TESTING COMPLETE - 9 unit tests passing (Rust lifetime issue remains)

pub fn settle_event(
    ctx: Context<Settle>, 
    winner: bool // true = team_a won
) -> Result<()>

pub fn claim_winnings(
    ctx: Context<Claim>
) -> Result<()>
```

### Day 5: LIFO Refund Mechanism
```rust
// Account structures needed:
#[account]
pub struct Event {
    pub team_a: String,
    pub team_b: String,
    pub team_a_pool: u64,
    pub team_b_pool: u64,
    pub match_start_time: i64,
    pub balanced: bool,
    pub settled: bool,
    pub winner: Option<bool>,
    pub bump: u8,
}

#[account]
pub struct Bet {
    pub user: Pubkey,
    pub event: Pubkey,
    pub amount: u64,
    pub team: bool,
    pub timestamp: i64, // Critical for LIFO
    pub status: BetStatus,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum BetStatus {
    Active,
    Refunded,
    Won,
    Lost,
    Claimed,
}
```

### Weekend: Testing - STATUS UPDATE
- [x] ✅ UNIT TESTS COMPLETE: 22 tests covering all user stories
- [ ] ❌ INTEGRATION TESTS BLOCKED: Anchor toolchain missing build-sbf
- [ ] ❌ Test balanced scenario (50-50 split) - needs integration tests
- [ ] ❌ Test imbalanced → auto-refund - needs integration tests  
- [ ] ❌ Test edge cases (all on one side, cancelled match) - needs integration tests
- [ ] ❌ Test LIFO refund order - needs integration tests

**CRITICAL BLOCKER**: Anchor `build-sbf` command missing - prevents all integration testing

## 📅 Week 2: Frontend Simplification (Nov 14-21, 2024) - ✅ COMPLETE

### Day 1: Remove P2P Complexity ✅
```bash
# Files DELETED:
frontend/src/components/betting/P2PBetCreator.tsx ✅
frontend/src/components/betting/BetMatcher.tsx ✅
frontend/src/components/betting/BetProposal.tsx ✅
frontend/src/components/betting/ProposalList.tsx ✅
frontend/src/stores/matchingStore.ts ✅
# Additional cleanup:
frontend/src/hooks/store/useBettingOperations.ts ✅
frontend/src/hooks/store/useBlockchainData.ts ✅
frontend/src/hooks/store/useOptimizedSelectors.ts ✅
frontend/src/hooks/store/useUIState.ts ✅
frontend/src/hooks/store/useWalletConnection.ts ✅
```

### Day 2: Create Simple Components ✅
```tsx
// ✅ COMPLETED: SimpleBettor.tsx
interface SimpleBettorProps {
  event: Event;
  onBet: (team: boolean, amount: number) => Promise<void>;
}

// ✅ COMPLETED: BetStatus.tsx
interface BetStatusProps {
  bets: PoolBet[];
}

// ✅ COMPLETED: EventList.tsx (updated for pool system)
// Component structure:
// - Show two teams as large buttons
// - Click team → show amount input
// - Confirm → place bet
// - No forms, no complexity
```

### Day 3-4: Integration ✅
- [x] ✅ Connect to new pool contract (usePoolContract.ts hook created)
- [x] ✅ Update betting store for pool system (placeBet, claimWinnings, fetchUserBets)
- [x] ✅ Remove all P2P logic from stores (betProposals, createBetProposal, acceptBet, cancelBetProposal)
- [x] ✅ Test complete flow (31 tests passing)

### Day 5: Polish & UX ✅
- [x] ✅ Add smooth transitions (Zen UI principles applied)
- [x] ✅ Implement error handling (comprehensive error states)
- [x] ✅ Add loading states (isPlacing, loading indicators)
- [x] ✅ Success feedback (subtle, not modal)

### Additional Cleanup Completed ✅
- [x] ✅ Fix Import Issues: AppProvider.tsx, ErrorBoundary.tsx
- [x] ✅ Remove P2P References: useStores.ts cleaned, 5 P2P hook files deleted
- [x] ✅ Fix Type Tests: pool.test.ts imports corrected
- [x] ✅ Delete Old Tests: 5 outdated test files removed
- [x] ✅ Fix TypeScript Errors: All compilation errors resolved
- [x] ✅ Verify Build Success: npm run build (SUCCESS), npm test (31 tests passing)

## 📅 Week 3: Backend Integration (Oct 15-22, 2025) - ✅ INTEGRATION COMPLETE

### Phase 1: MCP-Validated Integration (Days 1-3) ✅ COMPLETE
- [x] ✅ Validate all 7 instructions with Solana MCP
- [x] ✅ Build contract and generate IDL
- [x] ✅ Replace TODO comments in usePoolContract.ts with actual Anchor calls
- [x] ✅ Test placeBet() - Connect SimpleBettor to real contract
- [x] ✅ Test claimWinnings() - Verify payout flow works
- [x] ✅ Test fetchEvents() - Load real events from blockchain
- [x] ✅ Install frontend dependencies (@project-serum/anchor, bn.js)
- [x] ✅ Copy IDL to frontend/src/idl/
- [x] ✅ Run all tests (31 frontend tests passing)

### Phase 2: Security Fixes (Days 4-5) - ✅ COMPLETE
- [x] ✅ Fix initialize_event string overflow vulnerability
- [x] ✅ Add auto_balance verification with EventState enum
- [x] ✅ Fix race conditions with settlement_version and claimed flags
- [x] ✅ Re-validate fixed instructions with MCP
- [x] ✅ All 52 Rust unit tests passing
- [x] ✅ All 31 frontend tests passing

### Phase 3: DevNet Deployment (Weekend)
- [ ] Deploy fixed contract to devnet
- [ ] Test real blockchain transactions
- [ ] Complete betting flow: Create event → Place bet → Settle → Claim
- [ ] Error handling: Network issues, insufficient funds, etc.
- [ ] Performance testing: Multiple users, large pools
- [ ] Mobile testing: Ensure Zen UI works on mobile

## 🔄 Daily Development Workflow

### Session Start Checklist
- [ ] Open plan.md - check current task
- [ ] Read claude.md - refresh context
- [ ] Check changelog.md - review recent decisions
- [ ] Pick first unchecked task from plan

### During Development
- [ ] Work directly on main branch (solo developer)
- [ ] Update task checkboxes as you complete them
- [ ] Add notes to changelog for major decisions
- [ ] Keep changes focused on current task only

### Session End Checklist
- [ ] Check off completed tasks in plan.md
- [ ] Add session summary to changelog.md
- [ ] Commit with descriptive message
- [ ] Push to GitHub main branch

## ⚠️ Known Issues & Blockers
- [ ] No oracle integration yet (admin settles manually)
- [ ] No initial liquidity pool (pure user-funded)
- [ ] No mobile responsiveness (desktop first)

## 📊 Success Metrics
- [ ] Pools always balance to exactly 50-50
- [ ] LIFO refunds process correctly
- [ ] Winners receive exactly 1.95x payout
- [ ] Bet placement takes <3 clicks
- [ ] No P2P code remains in codebase