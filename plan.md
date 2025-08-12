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
) -> Result<()> // 🚧 IMPLEMENTATION COMPLETE, TESTING INCOMPLETE

pub fn place_bet(
    ctx: Context<PlaceBet>, 
    team: bool, // true = team_a, false = team_b
    amount: u64
) -> Result<()> // 🚧 IMPLEMENTATION COMPLETE, TESTING INCOMPLETE

pub fn auto_balance(
    ctx: Context<AutoBalance>
) -> Result<()> // 🚧 IMPLEMENTATION COMPLETE, TESTING INCOMPLETE

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

### Weekend: Testing
- [ ] Test balanced scenario (50-50 split)
- [ ] Test imbalanced → auto-refund
- [ ] Test edge cases (all on one side, cancelled match)
- [ ] Test LIFO refund order

## 📅 Week 2: Frontend Simplification (Nov 14-21, 2024)

### Day 1: Remove P2P Complexity
```bash
# Files to DELETE:
frontend/src/components/betting/P2PBetCreator.tsx
frontend/src/components/betting/BetMatcher.tsx
frontend/src/components/betting/BetProposal.tsx
frontend/src/components/betting/ProposalList.tsx
frontend/src/stores/matchingStore.ts
```

### Day 2: Create Simple Components
```tsx
// NEW component: SimpleBettor.tsx
interface SimpleBettorProps {
  event: Event;
  onBet: (team: boolean, amount: number) => Promise<void>;
}

// Component structure:
// - Show two teams as large buttons
// - Click team → show amount input
// - Confirm → place bet
// - No forms, no complexity
```

### Day 3-4: Integration
- [ ] Connect to new pool contract
- [ ] Update betting store for pool system
- [ ] Remove all P2P logic from stores
- [ ] Test complete flow

### Day 5: Polish & UX
- [ ] Add smooth transitions
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Success feedback (subtle, not modal)

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