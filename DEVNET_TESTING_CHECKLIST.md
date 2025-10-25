# DevNet Testing Checklist

**Project**: Shin2Chin Betting Platform
**Network**: Solana DevNet
**Date**: _______________
**Tester**: _______________
**Program ID**: _______________

---

## Pre-Testing Setup

- [ ] Solana CLI configured for DevNet (`solana config get`)
- [ ] Anchor version 0.31.1 installed (`anchor --version`)
- [ ] Program deployed successfully
- [ ] All 4 program ID locations updated
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Test wallets created and funded (at least 2 SOL each)
- [ ] Phantom wallet configured for DevNet

---

## Backend Unit Tests (52 tests expected)

```bash
cd /home/user/Shin2chin/shin2chin-solana
anchor test --skip-build --skip-deploy
```

- [ ] All 52 tests passing ✅
- [ ] No timeout errors
- [ ] No RPC connection issues

**Results**:
```
Passed: _____ / 52
Failed: _____
Time: _____ seconds
```

**Failed tests** (if any):
1. _____________________
2. _____________________

---

## Frontend Unit Tests (31 tests expected)

```bash
cd /home/user/Shin2chin/frontend
npm test -- --run
```

- [ ] All 31 tests passing ✅
- [ ] No import/module errors
- [ ] TypeScript compilation successful

**Results**:
```
Passed: _____ / 31
Failed: _____
Time: _____ seconds
```

---

## Security Scan (Semgrep)

```bash
semgrep --config=auto shin2chin-solana/programs/shin2chin_pool/src/ --json
```

- [ ] 0 critical vulnerabilities ✅
- [ ] 0 high vulnerabilities ✅
- [ ] Medium/low findings documented

**Findings**:
- Critical: _____
- High: _____
- Medium: _____
- Low: _____

---

## End-to-End Test 1: Happy Path

**Objective**: Full betting lifecycle from event creation to claiming winnings

### Setup
- [ ] Admin wallet funded (>2 SOL)
- [ ] User1 wallet funded (>1 SOL)
- [ ] User2 wallet funded (>1 SOL)

### Test Steps

**1. Create Event** (Admin)
```bash
# Use admin wallet to create event
Team A: Chelsea
Team B: ManUnited
Match Start: 5 minutes from now
```

- [ ] Event created successfully
- [ ] Event PDA derived correctly
- [ ] Transaction confirmed on DevNet
- [ ] Event visible in Solana Explorer

**Event PDA**: _____________________

**2. Place Bets** (Users)

User1 bets 0.5 SOL on Team A:
- [ ] Transaction submitted successfully
- [ ] Bet account created
- [ ] Pool balance updated (team_a_pool += 0.5 SOL)
- [ ] User balance decreased by 0.5 SOL + fees

User2 bets 0.5 SOL on Team B:
- [ ] Transaction submitted successfully
- [ ] Bet account created
- [ ] Pool balance updated (team_b_pool += 0.5 SOL)
- [ ] User balance decreased by 0.5 SOL + fees

**3. Auto-Balance** (Admin, at match start time)
- [ ] Wait until match start time passes
- [ ] Run auto_balance instruction
- [ ] Pools confirmed balanced (50-50)
- [ ] Event state = "Balanced"

**4. Settle Event** (Admin)
- [ ] Admin runs settle_event with winner=Team A
- [ ] Event.settled = true
- [ ] Event.winner = true (Team A)
- [ ] Settlement version incremented

**5. Update Bet Statuses**
- [ ] Run update_bet_status_settled for User1's bet
- [ ] User1 bet status = Won
- [ ] Run update_bet_status_settled for User2's bet
- [ ] User2 bet status = Lost

**6. Claim Winnings** (User1)
- [ ] User1 balance before claim: _____
- [ ] User1 runs claim_winnings
- [ ] Transaction succeeds
- [ ] User1 balance after claim: _____
- [ ] Expected profit: ~0.475 SOL (0.5 * 1.95 - 0.5)
- [ ] Actual profit: _____ SOL
- [ ] Profit matches expected (within 1%): [ ] Yes [ ] No

**7. Loser Attempts Claim** (User2)
- [ ] User2 attempts claim_winnings
- [ ] Transaction fails with error "BetNotWon" or similar
- [ ] User2 cannot claim (security working)

### Results
- [ ] ✅ Happy path test PASSED
- [ ] ❌ Happy path test FAILED

**Issues found**: _____________________

---

## End-to-End Test 2: LIFO Refund

**Objective**: Test auto-balance refunds when pools are imbalanced

### Test Steps

**1. Create Event**
- [ ] Event created with 3-minute match start time

**2. Create Imbalance**
- [ ] User1 bets 1 SOL on Team A (timestamp: _____)
- [ ] User2 bets 0.5 SOL on Team B (timestamp: _____)
- [ ] User3 bets 0.5 SOL on Team A (timestamp: _____)

**Pool state before auto-balance**:
- Team A pool: 1.5 SOL
- Team B pool: 0.5 SOL
- Imbalance: 3:1 ratio

**3. Auto-Balance**
- [ ] Wait for match start time
- [ ] Run auto_balance
- [ ] Newest bet on Team A refunded (User3 - LIFO)
- [ ] User3 bet status = Refunded
- [ ] Pools balanced: Team A = 1.0 SOL, Team B = 0.5 SOL? (Check threshold)

**4. Refunded User Claims Refund**
- [ ] User3 balance before: _____
- [ ] User3 runs claim (for refunded bet)
- [ ] User3 receives full refund (0.5 SOL minus fees)
- [ ] User3 balance after: _____

**5. Settle and Claim**
- [ ] Settle event (Team A wins)
- [ ] User1 claims (should succeed - Won)
- [ ] User2 cannot claim (Lost)
- [ ] User3 cannot claim again (already claimed refund)

### Results
- [ ] ✅ LIFO refund test PASSED
- [ ] ❌ LIFO refund test FAILED

**Issues found**: _____________________

---

## End-to-End Test 3: Edge Cases

### 3.1: All Bets on One Side
- [ ] Event created
- [ ] User1 bets on Team A
- [ ] User2 bets on Team A (same team)
- [ ] Auto-balance refunds all but smallest bet
- [ ] Settlement works correctly

**Result**: [ ] Pass [ ] Fail

### 3.2: Bet After Match Start (Should Fail)
- [ ] Event created
- [ ] Wait for match start time to pass
- [ ] User attempts to place bet
- [ ] Error: "BettingWindowClosed" or similar
- [ ] Bet rejected successfully

**Result**: [ ] Pass [ ] Fail

### 3.3: Claim Before Settlement (Should Fail)
- [ ] Event created, bets placed
- [ ] User attempts to claim before settle_event
- [ ] Error: "EventNotSettled" or similar
- [ ] Claim rejected successfully

**Result**: [ ] Pass [ ] Fail

### 3.4: Double Claim (Should Fail)
- [ ] Complete happy path
- [ ] Winner claims successfully
- [ ] Winner attempts to claim again
- [ ] Error: "AlreadyClaimed" or similar
- [ ] Second claim rejected

**Result**: [ ] Pass [ ] Fail

### 3.5: Duplicate Bet on Same Team (Should Fail)
- [ ] Event created
- [ ] User1 places bet on Team A
- [ ] User1 attempts second bet on Team A
- [ ] Error: Account already exists (PDA collision)
- [ ] Duplicate bet rejected

**Result**: [ ] Pass [ ] Fail

---

## Frontend Integration Tests

### Setup
```bash
cd /home/user/Shin2chin/frontend
npm run dev
# Open http://localhost:5173 in browser with Phantom wallet
```

### Test Cases

**1. Wallet Connection**
- [ ] Phantom detected automatically
- [ ] Click "Connect Wallet" button
- [ ] Phantom prompts for approval
- [ ] Connection succeeds
- [ ] Wallet address displayed in UI
- [ ] No technical jargon visible

**US4 Score**: ⭐⭐⭐⭐⭐ (1-5 stars)
**Issues**: _____________________

---

**2. View Events**
- [ ] EventList component loads
- [ ] Test event appears (created via CLI)
- [ ] Team names displayed correctly
- [ ] Match time shown
- [ ] Pool sizes visible (Team A: ___ SOL, Team B: ___ SOL)
- [ ] UI is minimal, max 3 elements visible

**US5 Score**: ⭐⭐⭐⭐⭐ (1-5 stars)
**Issues**: _____________________

---

**3. Place Bet (3-Click Flow)**
- [ ] Click 1: Click on Team A button
- [ ] Amount input appears
- [ ] Click 2: Enter 0.1 SOL
- [ ] Confirm button appears
- [ ] Click 3: Click Confirm
- [ ] Phantom prompts for transaction approval
- [ ] Approve transaction
- [ ] Transaction submits
- [ ] Loading state shows
- [ ] Success message appears (non-modal, subtle)
- [ ] Bet appears in BetStatus component

**Total clicks**: _____ (should be 3)
**US1 Score**: ⭐⭐⭐⭐⭐ (1-5 stars)
**Issues**: _____________________

---

**4. Bet Status Display**
- [ ] BetStatus component shows user's bets
- [ ] Bet amount correct
- [ ] Team selection correct
- [ ] Status shows "Active"
- [ ] UI is calm, minimal

**US5 Score**: ⭐⭐⭐⭐⭐ (1-5 stars)
**Issues**: _____________________

---

**5. Claim Winnings** (after settling event via CLI)
- [ ] Settle event via admin CLI
- [ ] Refresh frontend (or wait for auto-update)
- [ ] "Claim" button appears for winning bet
- [ ] Click "Claim" (1 click)
- [ ] Transaction submits
- [ ] Winnings received
- [ ] Balance updated in UI
- [ ] Bet status changes to "Claimed"

**US1 Score** (1-click claim): ⭐⭐⭐⭐⭐ (1-5 stars)
**Issues**: _____________________

---

**6. Error Handling**
- [ ] Disconnect wallet → appropriate message shown
- [ ] Insufficient balance → clear error (no jargon)
- [ ] Network error → retry option available
- [ ] Invalid input → validation message

**Overall Error UX**: [ ] Good [ ] Needs improvement
**Issues**: _____________________

---

## Performance & Load Tests

### Test 1: Concurrent Bets (10 users)
```bash
# Use load test script from plan
./scripts/load-test.sh
```

- [ ] Script executed
- [ ] Total bets attempted: _____
- [ ] Successful bets: _____
- [ ] Success rate: _____ % (target: >90%)
- [ ] Average confirmation time: _____ seconds
- [ ] RPC errors encountered: _____

**Result**: [ ] Pass (>90%) [ ] Fail

---

### Test 2: Frontend RPC Rate Limits
- [ ] Open browser console
- [ ] Rapid-fire 100 fetchEvents() calls
- [ ] Monitor for 429 errors
- [ ] UI remains responsive

**Rate limit errors**: _____
**Result**: [ ] Pass [ ] Fail

---

### Test 3: Network Latency (Slow 3G)
- [ ] Enable "Slow 3G" throttling in DevTools
- [ ] Place bet
- [ ] Loading state appears correctly
- [ ] No UI freezing or confusion
- [ ] Transaction completes

**US5 Score** (calm even on slow network): ⭐⭐⭐⭐⭐
**Result**: [ ] Pass [ ] Fail

---

## User Story Validation Summary

### US1: Effortless Betting ⭐⭐⭐⭐⭐
- [ ] 3 clicks confirmed: See → Click → Confirm
- [ ] No unnecessary forms
- [ ] Smooth transaction flow

**Overall Score**: _____ / 5
**Notes**: _____________________

---

### US2: Instant Events ⭐⭐⭐⭐⭐
- [ ] Admin can create event in ~10 seconds
- [ ] No complex configuration
- [ ] Auto 2x odds (1.95x payout confirmed)

**Overall Score**: _____ / 5
**Notes**: _____________________

---

### US4: Invisible Wallet ⭐⭐⭐⭐⭐
- [ ] One-click connect
- [ ] No blockchain jargon in UI
- [ ] Auto-remember (if implemented)

**Overall Score**: _____ / 5
**Notes**: _____________________

---

### US5: Zen UI ⭐⭐⭐⭐⭐
- [ ] Max 3 elements visible per view
- [ ] Soft colors, white space
- [ ] Calm, non-distracting
- [ ] Works well even on slow networks

**Overall Score**: _____ / 5
**Notes**: _____________________

---

## Final Checklist

- [ ] All backend tests passing (52/52)
- [ ] All frontend tests passing (31/31)
- [ ] Security scan clean (0 critical/high)
- [ ] Happy path E2E successful
- [ ] LIFO refund E2E successful
- [ ] All 5 edge cases handled
- [ ] Frontend integration working
- [ ] All user stories validated
- [ ] Performance tests acceptable (>90% success)
- [ ] Documentation updated

---

## Blockers / Critical Issues

1. _____________________
2. _____________________
3. _____________________

---

## Overall Assessment

**Ready for extended DevNet testing?**: [ ] Yes [ ] No

**Ready for MainNet?**: [ ] Yes [ ] No [ ] After fixes

**Next steps**:
1. _____________________
2. _____________________
3. _____________________

---

**Completed by**: _______________
**Date**: _______________
**Signature**: _______________
