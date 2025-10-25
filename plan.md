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

### Phase 3: DevNet Deployment (Weekend) - 📋 DETAILED PLAN CREATED

**Status**: Ready for execution - see WEEK1_DEVNET_DEPLOYMENT_PLAN.md for complete guide

**Quick Start**:
```bash
# Automated deployment (requires Solana/Anchor CLI)
./scripts/deploy-to-devnet.sh

# Or follow manual steps in WEEK1_DEVNET_DEPLOYMENT_PLAN.md
```

**Day 1-2: Build, Deploy & Configure** (6-8 hours)
- [ ] Verify environment (Solana CLI, Anchor 0.31.1, wallet funded)
- [ ] Build program: `cd shin2chin-solana && anchor build`
- [ ] Extract program ID: `solana address -k target/deploy/shin2chin_pool-keypair.json`
- [ ] Update lib.rs with program ID (Line 11: declare_id!)
- [ ] Update Anchor.toml for devnet cluster
- [ ] Deploy to DevNet: `anchor deploy --provider.cluster devnet`
- [ ] Copy IDL to frontend: `cp target/idl/shin2chin_pool.json frontend/src/idl/`
- [ ] Update frontend config (4 files: config/index.ts, usePoolContract.ts)
- [ ] Create .env.devnet with deployment info
- [ ] Verify deployment: `solana program show <PROGRAM_ID> --url devnet`

**Day 2-3: Testing Infrastructure** (4-6 hours)
- [ ] Install frontend dependencies: `cd frontend && npm install`
- [ ] Run backend tests: `cd shin2chin-solana && anchor test --skip-build --skip-deploy`
- [ ] Verify 52 tests passing ✅
- [ ] Run frontend tests: `cd frontend && npm test -- --run`
- [ ] Verify 31 tests passing ✅
- [ ] Create test wallets (3 users + 1 admin): `solana-keygen new --outfile ~/.config/solana/test-userX.json`
- [ ] Fund test wallets: `solana airdrop 2 <wallet> --url devnet`
- [ ] Run security scan: `semgrep --config=auto shin2chin-solana/programs/shin2chin_pool/src/`
- [ ] Verify 0 critical/high vulnerabilities ✅

**Day 3-4: End-to-End Testing** (8-10 hours)
- [ ] E2E Test 1: Happy Path (Create event → Bet → Settle → Claim)
  - [ ] Admin creates event with 5min match start time
  - [ ] User1 bets 0.5 SOL on Team A
  - [ ] User2 bets 0.5 SOL on Team B
  - [ ] Wait for match start, run auto_balance
  - [ ] Admin settles event (Team A wins)
  - [ ] Update bet statuses (update_bet_status_settled)
  - [ ] User1 claims winnings (~0.975 SOL payout = 0.5 * 1.95)
  - [ ] User2 cannot claim (loses bet)
  - [ ] Verify User1 profit: ~0.475 SOL (within 1%)
- [ ] E2E Test 2: LIFO Refund (Imbalanced pools → Auto-refund)
  - [ ] Create event
  - [ ] User1 bets 1 SOL on Team A
  - [ ] User2 bets 0.5 SOL on Team B
  - [ ] User3 bets 0.5 SOL on Team A (creates 1.5:0.5 imbalance)
  - [ ] Auto-balance refunds User3 (newest bet, LIFO)
  - [ ] User3 claims refund successfully
  - [ ] Settle event, remaining users claim/lose
- [ ] E2E Test 3: Edge Cases
  - [ ] Test: Bet after match start (should fail)
  - [ ] Test: Claim before settlement (should fail)
  - [ ] Test: Double claim (should fail)
  - [ ] Test: Duplicate bet on same team (should fail)
  - [ ] Test: All bets on one side (auto-balance refunds correctly)
- [ ] Frontend Integration Testing (Manual)
  - [ ] Start dev server: `npm run dev`
  - [ ] Connect Phantom wallet to DevNet
  - [ ] Verify wallet connection (1-click - US4)
  - [ ] View events (Zen UI - US5: max 3 elements visible)
  - [ ] Place bet (3 clicks max - US1: Team → Amount → Confirm)
  - [ ] Check bet status in UI
  - [ ] Claim winnings after settlement
  - [ ] Verify error handling (disconnect wallet, insufficient balance)

**Day 5: Performance & Load Testing** (4-6 hours)
- [ ] Concurrent betting load test (10 users)
  - [ ] Create 10 test wallets
  - [ ] Place 10 concurrent bets
  - [ ] Target: >90% success rate
  - [ ] Measure: Average confirmation time
  - [ ] Document: RPC errors encountered
- [ ] Frontend RPC rate limit testing
  - [ ] Rapid-fire 100 fetchEvents() calls
  - [ ] Monitor for 429 errors
  - [ ] Verify UI remains responsive
- [ ] Network latency simulation (Slow 3G)
  - [ ] Enable DevTools throttling
  - [ ] Place bet, verify loading states
  - [ ] US5 validation: Calm UI even on slow networks

**Day 6: Documentation & Monitoring** (3-4 hours)
- [ ] Create DEVNET_DEPLOYMENT.md with:
  - [ ] Deployment date and program ID
  - [ ] Test results summary (all tests passing)
  - [ ] Known issues and workarounds
  - [ ] Rollback procedure
- [ ] Set up monitoring: `./scripts/monitor-devnet.sh <PROGRAM_ID>`
- [ ] Update changelog.md with deployment results
- [ ] Create deployment info file: DEVNET_DEPLOYMENT_INFO.txt

**Day 7: Review & Validation** (2-3 hours)
- [ ] User Story Validation Checklist
  - [ ] US1 (Effortless Betting): 3 clicks confirmed ⭐⭐⭐⭐⭐
  - [ ] US2 (Instant Events): ~10 sec event creation ⭐⭐⭐⭐⭐
  - [ ] US4 (Invisible Wallet): 1-click connect ⭐⭐⭐⭐☆
  - [ ] US5 (Zen UI): Minimal, calm interface ⭐⭐⭐⭐⭐
- [ ] Code review checklist (security, quality, documentation)
- [ ] Update plan.md with completion status (mark this section complete)
- [ ] Prepare MainNet deployment checklist (if DevNet successful)

**Tools Created**:
- ✅ `WEEK1_DEVNET_DEPLOYMENT_PLAN.md` - Complete day-by-day guide (500+ lines)
- ✅ `DEVNET_TESTING_CHECKLIST.md` - Comprehensive testing checklist (300+ lines)
- ✅ `scripts/deploy-to-devnet.sh` - Automated deployment (200+ lines)
- ✅ `scripts/update-program-id.sh` - Program ID updates (100+ lines)
- ✅ `scripts/monitor-devnet.sh` - Monitoring dashboard (100+ lines)

**Success Criteria**:
- [ ] Program deployed to DevNet with valid ID
- [ ] All 52 backend + 31 frontend tests passing on DevNet
- [ ] E2E happy path works (100% success)
- [ ] E2E LIFO refund works (100% success)
- [ ] All 5 edge cases handled correctly
- [ ] Load test >90% success rate (10 concurrent users)
- [ ] Security scan: 0 critical/high vulnerabilities
- [ ] All user stories validated (4+ stars)

**Estimated Time**: 27-37 hours total (can be compressed to 3-4 days with focus)

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