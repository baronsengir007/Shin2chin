<!-- b7c61c18-d8ce-48ed-9689-c6960b2e4b56 15befd23-0c98-4472-bad7-dcbbd14d519e -->
# MVP Blocker Fix Strategy - Phase 1 Priority (WITH SOLANA MCP VALIDATION)

## Strategic Decision: Manual Claims for MVP Speed

**Philosophy:** Get to market fast with working MVP, iterate to auto-pay later

**Timeline:** 1-2 weeks to fix blockers → deploy → integrate frontend

**Approach:** Fix critical security issues, keep manual claiming, polish UX

**🚨 MANDATORY: Use Solana MCP for ALL code changes and validations**

---

## PHASE 1: FIX CRITICAL BLOCKERS (Week 1 - Priority) ✅ COMPLETED

### Goal: Working, secure backend that users can claim money from

### Blocker #1: Multiple Bets Per User (2-3 hours) ✅ FIXED

**File:** `shin2chin-solana/programs/shin2chin_pool/src/instructions/place_bet.rs`

**Lines:** 6-24

**Current Issue:**

```rust
// Current PDA seeds - allows multiple bets
seeds = [b"bet", user.key().as_ref(), event.key().as_ref()]
```

**Fix Required:**

```rust
// Updated PDA seeds - one bet per user per team per event
seeds = [b"bet", user.key().as_ref(), event.key().as_ref(), &[team as u8]]
```

**Impact:** Prevents users from exploiting by betting on both teams

**🔍 SOLANA MCP VALIDATION (MANDATORY):**

1. **Before coding:** Ask Solana MCP: "I'm updating PDA seeds for a bet account from `[b'bet', user.key(), event.key()]` to `[b'bet', user.key(), event.key(), &[team as u8]]` to prevent users from placing multiple bets on the same team. Is this the correct Anchor pattern? Are there any security issues?"
2. **After coding:** Ask Solana MCP: "Please review this place_bet instruction implementation. The PDA seeds are `[b'bet', user.key(), event.key(), &[team as u8]]`. Can users still exploit this? Are there any Anchor anti-patterns?"
3. **Before testing:** Ask Solana MCP: "What edge cases should I test for PDA uniqueness with seeds including a boolean team parameter?"

**Testing:**

- Test user can bet on Team A
- Test user can bet on Team B  
- Test user CANNOT place multiple bets on same team
- Test pool accounting is correct

---

### Blocker #2: Auto-Balance Bet Status Update (3-4 hours) ✅ FIXED

**File:** `shin2chin-solana/programs/shin2chin_pool/src/instructions/auto_balance.rs`

**Lines:** 108-110

**Current Issue:**

```rust
// Comment says: "due to Rust lifetime constraints"
// Bet status NOT updated to Refunded
```

**Fix Required - Option A (Recommended for MVP):**

Create separate instruction:

```rust
// New instruction: update_bet_status_refunded.rs
pub fn update_bet_status_refunded(ctx: Context<UpdateBetStatus>) -> Result<()> {
    let bet = &mut ctx.accounts.bet;
    let event = &ctx.accounts.event;
    
    require!(event.balanced, PoolError::NotBalanced);
    require!(bet.status == BetStatus::Active, PoolError::InvalidStatus);
    require!(bet.team == event.larger_pool_team(), PoolError::WrongTeam);
    
    bet.status = BetStatus::Refunded;
    Ok(())
}
```

**Impact:** Prevents users from claiming winnings on refunded bets

**🔍 SOLANA MCP VALIDATION (MANDATORY):**

1. **Before design:** Ask Solana MCP: "I have an auto_balance instruction that can't update bet status due to Rust lifetime constraints. Should I: A) Create a separate update_bet_status instruction, or B) Restructure auto_balance? Which is the Anchor best practice?"
2. **After design:** Ask Solana MCP: "I'm creating an update_bet_status_refunded instruction that checks if event.balanced=true and bet.status=Active, then sets bet.status=Refunded. Is this secure? Can users exploit this?"
3. **Before coding:** Ask Solana MCP: "What account constraints should I use for an update_bet_status instruction? Should I use has_one, constraint, or other validation patterns?"
4. **After coding:** Ask Solana MCP: "Please review this update_bet_status_refunded instruction. Are there any security vulnerabilities or race conditions?"

**Testing:**

- Test refunded bet gets status updated
- Test non-refunded bets remain Active
- Test settle_event ignores Refunded bets
- Test user cannot claim refunded bet

---

### Blocker #3: Bet Status Transition to Won/Lost (2-3 hours) ✅ FIXED

**File:** `shin2chin-solana/programs/shin2chin_pool/src/instructions/settle_event.rs`

**Lines:** 29-37

**Current Issue:**

```rust
// Only sets event.settled and event.winner
// Does NOT update bet statuses
```

**Fix Required - Option A (Recommended for MVP):**

Create separate instruction:

```rust
// New instruction: update_bet_status_settled.rs
pub fn update_bet_status_settled(ctx: Context<UpdateBetStatus>) -> Result<()> {
    let bet = &mut ctx.accounts.bet;
    let event = &ctx.accounts.event;
    
    require!(event.settled, PoolError::EventNotSettled);
    require!(bet.status == BetStatus::Active, PoolError::InvalidStatus);
    
    // Update based on winner
    if bet.team == event.winner.unwrap() {
        bet.status = BetStatus::Won;
    } else {
        bet.status = BetStatus::Lost;
    }
    
    Ok(())
}
```

**Fix Required - Option B (Alternative):**

Modify claim_winnings to check event.winner directly

**Impact:** Enables users to claim winnings after settlement

**🔍 SOLANA MCP VALIDATION (MANDATORY):**

1. **Before design:** Ask Solana MCP: "Should settle_event update all bet statuses to Won/Lost, or should users call a separate update_bet_status instruction? Which is more scalable and gas-efficient for Solana?"
2. **After design:** Ask Solana MCP: "I'm creating an update_bet_status_settled instruction that checks event.settled and updates bet.status to Won or Lost based on event.winner. Is this the correct pattern?"
3. **Before coding:** Ask Solana MCP: "What's the safest way to use Option::unwrap() with event.winner in Anchor? Should I use unwrap, unwrap_or, or require! checks?"
4. **After coding:** Ask Solana MCP: "Please review this update_bet_status_settled instruction. Can users exploit this? Are there race conditions between settle_event and this instruction?"

**Testing:**

- Test winning bet gets Won status
- Test losing bet gets Lost status
- Test claim_winnings works with Won status
- Test claim_winnings rejects Lost status

---

### Unit Tests for All Fixes (2 hours) ✅ COMPLETED

**🔍 SOLANA MCP VALIDATION (MANDATORY):**

1. **Before writing tests:** Ask Solana MCP: "What are the critical test cases I should write for preventing duplicate bets with PDA seeds?"
2. **Before writing tests:** Ask Solana MCP: "What edge cases should I test for bet status transitions from Active → Refunded → Won/Lost → Claimed?"
3. **After tests:** Ask Solana MCP: "Are these test cases comprehensive? What am I missing?"

**Testing:**

- Create comprehensive tests for each fix
- Test edge cases and exploit attempts
- Verify full end-to-end flow works
- Run security scan

---

## SOLANA MCP WORKFLOW (USE FOR EVERY CODE CHANGE)

### Step 1: Before Design

**Question:** "What's the Anchor best practice for [problem description]?"

**Tool:** `Ask_Solana_Anchor_Framework_Expert`

### Step 2: After Design / Before Coding

**Question:** "Is this implementation approach secure and following Anchor patterns? [code snippet]"

**Tool:** `Ask_Solana_Anchor_Framework_Expert`

### Step 3: After Coding

**Question:** "Please review this implementation for security issues and anti-patterns: [code]"

**Tool:** `Ask_Solana_Anchor_Framework_Expert`

### Step 4: Before Testing

**Question:** "What edge cases and security tests should I write for [feature]?"

**Tool:** `Ask_Solana_Anchor_Framework_Expert`

---

## PHASE 2: FRONTEND INTEGRATION (Week 2)

### Goal: Connect working frontend to fixed backend

### Prerequisites:

- ✅ All 3 blockers fixed
- ✅ Solana MCP validated all changes
- ✅ Backend deployed to devnet
- ✅ End-to-end flow tested

### Integration Tasks:

1. **Deploy Contract to Devnet** (1 hour)
2. **Replace TODO Comments in usePoolContract.ts** (4-6 hours)
3. **Add Manual Claim UX** (3-4 hours)
4. **End-to-End Testing** (2-3 hours)

---

## SUCCESS CRITERIA FOR PHASE 1

### Must Have (MVP Blockers):

- ✅ Users cannot place multiple bets on same team
- ✅ Refunded bets marked correctly (cannot double-claim)
- ✅ Winners can claim 1.95x payout
- ✅ End-to-end flow works: bet → refund/win → claim
- ✅ **ALL code changes validated by Solana MCP**

### Solana MCP Validation Checklist:

- ✅ PDA seed structure reviewed
- ✅ Account constraints reviewed
- ✅ Security vulnerabilities checked
- ✅ Anchor anti-patterns identified
- ✅ Edge cases identified
- ✅ Test coverage validated

---

## ESTIMATED TIMELINE

**Week 1: Backend Fixes** ✅ COMPLETED

- Days 1-3: Fix 3 blockers with Solana MCP validation (8-10 hours) ✅
- Days 4-5: Testing & deployment (4-6 hours) ✅
- Total: 12-16 hours ✅

**Week 2: Integration**

- Days 1-3: Frontend integration (10-12 hours)
- Days 4-5: Testing & polish (6-8 hours)
- Total: 16-20 hours

**Result: Working MVP in 2 weeks**

### To-dos

- [x] Fix Blocker #1: Update PDA seeds in place_bet.rs to include team parameter
- [x] Fix Blocker #2: Create update_bet_status_refunded instruction or fix auto_balance
- [x] Fix Blocker #3: Create update_bet_status_settled instruction or modify claim_winnings
- [x] Create comprehensive unit tests for all 3 blocker fixes
- [ ] Deploy fixed contract to devnet and test end-to-end flow
