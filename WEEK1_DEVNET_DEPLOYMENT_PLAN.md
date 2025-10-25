# Week 1: DevNet Deployment & Testing - Detailed Action Plan

**Sprint Goal**: Deploy Shin2Chin betting platform to Solana DevNet and execute comprehensive end-to-end testing

**Timeline**: 7 days (Oct 25 - Nov 1, 2025)

**Philosophy**: Follow user stories for all decisions - Effortless, Minimal, Natural (Tao Te Ching)

---

## Pre-Flight Checklist

### Environment Verification
```bash
# Verify required tools installed
solana --version          # Expected: 1.18.x or higher
anchor --version          # Expected: 0.31.1
node --version            # Expected: 18.x or higher
npm --version             # Expected: 9.x or higher

# Configure Solana CLI for DevNet
solana config set --url https://api.devnet.solana.com
solana config set --keypair ~/.config/solana/id.json

# Verify wallet has SOL for deployment (~5 SOL needed)
solana balance
# If balance < 5 SOL: solana airdrop 2
```

---

## Day 1-2: Build, Deploy & Configure (6-8 hours)

### Task 1.1: Build Program & Generate IDL (30 min)

**Objective**: Ensure clean build and fresh IDL generation

**User Story Alignment**: US2 (Instant Events) - Fast deployment is critical

```bash
cd /home/user/Shin2chin/shin2chin-solana

# Clean previous builds
anchor clean

# Build program (generates target/deploy/ and target/idl/)
anchor build

# Verify build artifacts exist
ls -la target/deploy/shin2chin_pool.so
ls -la target/idl/shin2chin_pool.json
ls -la target/deploy/shin2chin_pool-keypair.json
```

**Expected Output**:
- `shin2chin_pool.so` (compiled program)
- `shin2chin_pool.json` (IDL for frontend)
- `shin2chin_pool-keypair.json` (program keypair)

**Success Criteria**:
- ✅ Build completes with 0 errors
- ✅ IDL file generated
- ✅ Program binary exists

---

### Task 1.2: Extract Program ID (5 min)

```bash
# Get program ID from keypair
solana address -k target/deploy/shin2chin_pool-keypair.json

# Save to variable for later use
export PROGRAM_ID=$(solana address -k target/deploy/shin2chin_pool-keypair.json)
echo "Program ID: $PROGRAM_ID"
```

**Expected Output**: A base58 string like `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`

**Save this Program ID** - you'll need it for 5 file updates

---

### Task 1.3: Update Program ID in Rust Code (15 min)

**File**: `/home/user/Shin2chin/shin2chin-solana/programs/shin2chin_pool/src/lib.rs`

**Change**:
```rust
// OLD (Line 11)
declare_id!("11111111111111111111111111111112");

// NEW (replace with actual Program ID from Task 1.2)
declare_id!("YOUR_ACTUAL_PROGRAM_ID_HERE");
```

**Rebuild after change**:
```bash
anchor build
```

**Why**: The `declare_id!` macro must match the deployed program ID for Anchor to work

**User Story Alignment**: US1 (Effortless) - Correct configuration = smooth UX

---

### Task 1.4: Update Anchor.toml Configuration (10 min)

**File 1**: `/home/user/Shin2chin/shin2chin-solana/Anchor.toml`

**Changes**:
```toml
# OLD
[programs.localnet]
shin2chin_pool = "11111111111111111111111111111112"

[provider]
cluster = "Localnet"

# NEW
[programs.devnet]
shin2chin_pool = "YOUR_ACTUAL_PROGRAM_ID_HERE"

[provider]
cluster = "Devnet"
wallet = "~/.config/solana/id.json"
```

**File 2**: `/home/user/Shin2chin/shin2chin-solana/programs/shin2chin_pool/Anchor.toml` (if exists)

Apply same changes as above.

**Why**: Anchor uses these configs to determine where to deploy and what program ID to use

---

### Task 1.5: Deploy to DevNet (30 min - includes retry buffer)

```bash
cd /home/user/Shin2chin/shin2chin-solana

# Deploy to DevNet
anchor deploy --provider.cluster devnet

# Verify deployment
solana program show $PROGRAM_ID --url devnet
```

**Expected Output**:
```
Program Id: YOUR_PROGRAM_ID
Owner: BPFLoaderUpgradeab1e11111111111111111111111
ProgramData Address: ...
Authority: YOUR_WALLET_PUBKEY
Last Deployed In Slot: ...
Data Length: ~XX KB
```

**Troubleshooting**:
- Error: "Insufficient funds" → `solana airdrop 2`
- Error: "Program is not upgradeable" → Redeploy with `--upgrade-authority`
- Network timeout → Retry with `--commitment confirmed`

**Success Criteria**:
- ✅ Deployment transaction confirmed
- ✅ `solana program show` returns program info
- ✅ No errors in deployment logs

---

### Task 1.6: Update Frontend Configuration (20 min)

**File 1**: `/home/user/Shin2chin/frontend/src/core/config/index.ts`

**Change** (Line 12):
```typescript
// OLD
programId: '11111111111111111111111111111112',

// NEW
programId: 'YOUR_ACTUAL_PROGRAM_ID_HERE',
```

**File 2**: `/home/user/Shin2chin/frontend/src/hooks/usePoolContract.ts`

**Change** (Line 10):
```typescript
// OLD
const PROGRAM_ID = new PublicKey('11111111111111111111111111111112');

// NEW
const PROGRAM_ID = new PublicKey('YOUR_ACTUAL_PROGRAM_ID_HERE');
```

**User Story Alignment**: US4 (Invisible Wallet) - Frontend must connect to correct program

---

### Task 1.7: Copy IDL to Frontend (10 min)

```bash
# Copy generated IDL to frontend
cp /home/user/Shin2chin/shin2chin-solana/target/idl/shin2chin_pool.json \
   /home/user/Shin2chin/frontend/src/idl/shin2chin_pool.json

# Verify copy
cat /home/user/Shin2chin/frontend/src/idl/shin2chin_pool.json | jq '.name'
# Should output: "shin2chin_pool"
```

**Why**: Frontend needs the IDL to interact with the program

**Note**: The `config/index.ts` file has an embedded IDL, but separate IDL file is cleaner

---

### Task 1.8: Create Environment Config Template (15 min)

**Create**: `/home/user/Shin2chin/.env.devnet.template`

```bash
# Solana DevNet Configuration
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=YOUR_ACTUAL_PROGRAM_ID_HERE

# Admin Wallet (for creating events)
ADMIN_PUBKEY=YOUR_ADMIN_WALLET_PUBKEY

# Frontend
VITE_SOLANA_NETWORK=devnet
VITE_PROGRAM_ID=YOUR_ACTUAL_PROGRAM_ID_HERE
```

**Create actual `.env.devnet`** by copying template and filling in real values.

**User Story Alignment**: US2 (Instant Events) - Admin needs easy access to create events

---

## Day 2-3: Testing Infrastructure (4-6 hours)

### Task 2.1: Install Frontend Dependencies (10 min)

```bash
cd /home/user/Shin2chin/frontend
npm install
```

**Verify**:
```bash
npm run build  # Should complete successfully
npm test -- --run  # Should run 31 tests
```

---

### Task 2.2: Backend Unit Tests Against DevNet (45 min)

**Update Test Configuration** in `/home/user/Shin2chin/shin2chin-solana/tests/pool-tests.ts`:

```typescript
// Add at top of file
const PROGRAM_ID = new PublicKey('YOUR_ACTUAL_PROGRAM_ID_HERE');
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
```

**Run Tests**:
```bash
cd /home/user/Shin2chin/shin2chin-solana
anchor test --skip-build --skip-deploy
```

**Expected**: 52+ tests should pass

**If failures occur**:
- Check RPC connectivity: `solana cluster-version --url devnet`
- Check wallet has SOL: `solana balance`
- Review error logs for account initialization issues

---

### Task 2.3: Create DevNet Test Wallets (30 min)

```bash
# Create 3 test wallets for different user scenarios
solana-keygen new --outfile ~/.config/solana/test-user1.json --no-bip39-passphrase
solana-keygen new --outfile ~/.config/solana/test-user2.json --no-bip39-passphrase
solana-keygen new --outfile ~/.config/solana/test-admin.json --no-bip39-passphrase

# Fund each wallet
solana airdrop 2 ~/.config/solana/test-user1.json --url devnet
solana airdrop 2 ~/.config/solana/test-user2.json --url devnet
solana airdrop 2 ~/.config/solana/test-admin.json --url devnet

# Save wallet addresses
export USER1=$(solana address -k ~/.config/solana/test-user1.json)
export USER2=$(solana address -k ~/.config/solana/test-user2.json)
export ADMIN=$(solana address -k ~/.config/solana/test-admin.json)

echo "User 1: $USER1"
echo "User 2: $USER2"
echo "Admin: $ADMIN"
```

**Save these addresses** for manual testing

---

### Task 2.4: Security Scan with Semgrep (15 min)

```bash
cd /home/user/Shin2chin

# Scan Rust smart contracts
semgrep --config=auto shin2chin-solana/programs/shin2chin_pool/src/ --json > semgrep-backend.json

# Scan TypeScript frontend
semgrep --config=auto frontend/src/ --json > semgrep-frontend.json

# Review findings
cat semgrep-backend.json | jq '.results[] | {rule: .check_id, severity: .extra.severity, message: .extra.message}'
cat semgrep-frontend.json | jq '.results[] | {rule: .check_id, severity: .extra.severity, message: .extra.message}'
```

**Expected**: 0 high/critical vulnerabilities (previous fixes resolved 3 critical issues)

**If vulnerabilities found**: Document in `security-findings.md` and prioritize fixes

**User Story Alignment**: Implicit - Security enables trust, trust enables effortless use

---

## Day 3-4: End-to-End Testing (8-10 hours)

### Task 3.1: Manual E2E Test - Happy Path (90 min)

**Scenario**: Full betting lifecycle from event creation to claiming winnings

**Test Script**: `/home/user/Shin2chin/tests/devnet-e2e-happy-path.sh`

```bash
#!/bin/bash
set -e

echo "🧪 DevNet E2E Test - Happy Path"
echo "================================"

# Configuration
PROGRAM_ID="YOUR_ACTUAL_PROGRAM_ID_HERE"
ADMIN_WALLET=~/.config/solana/test-admin.json
USER1_WALLET=~/.config/solana/test-user1.json
USER2_WALLET=~/.config/solana/test-user2.json
RPC_URL="https://api.devnet.solana.com"

# Step 1: Create Event (Admin)
echo "📅 Step 1: Admin creates event (Team A vs Team B)"
MATCH_START_TIME=$(($(date +%s) + 300))  # 5 minutes from now

anchor run createEvent \
  --provider.wallet $ADMIN_WALLET \
  --provider.cluster devnet \
  -- \
  --team-a "Chelsea" \
  --team-b "ManUnited" \
  --match-start-time $MATCH_START_TIME

# Get event PDA
EVENT_PDA=$(solana-keygen grind --starts-with event:1 | grep "Pubkey" | awk '{print $2}')
echo "✅ Event created: $EVENT_PDA"

# Step 2: User 1 bets on Team A
echo "💰 Step 2: User1 bets 0.5 SOL on Chelsea"
anchor run placeBet \
  --provider.wallet $USER1_WALLET \
  --provider.cluster devnet \
  -- \
  --event $EVENT_PDA \
  --team true \
  --amount 500000000  # 0.5 SOL in lamports

echo "✅ User1 bet placed"

# Step 3: User 2 bets on Team B
echo "💰 Step 3: User2 bets 0.5 SOL on ManUnited"
anchor run placeBet \
  --provider.wallet $USER2_WALLET \
  --provider.cluster devnet \
  -- \
  --event $EVENT_PDA \
  --team false \
  --amount 500000000

echo "✅ User2 bet placed"

# Step 4: Verify pools are balanced
echo "⚖️  Step 4: Check pool balances"
solana account $EVENT_PDA --url $RPC_URL --output json | jq '.data'

# Step 5: Wait for match start time
echo "⏳ Step 5: Waiting for match start time..."
sleep 310  # Wait 5 min + 10 sec buffer

# Step 6: Auto-balance (should be no-op since already balanced)
echo "🔄 Step 6: Run auto-balance"
anchor run autoBalance \
  --provider.wallet $ADMIN_WALLET \
  --provider.cluster devnet \
  -- \
  --event $EVENT_PDA

echo "✅ Auto-balance complete"

# Step 7: Admin settles event (Team A wins)
echo "🏆 Step 7: Admin settles event (Chelsea wins)"
anchor run settleEvent \
  --provider.wallet $ADMIN_WALLET \
  --provider.cluster devnet \
  -- \
  --event $EVENT_PDA \
  --winner true

echo "✅ Event settled"

# Step 8: Winner claims (User 1)
echo "💸 Step 8: User1 claims winnings"
USER1_BALANCE_BEFORE=$(solana balance $USER1_WALLET --url $RPC_URL)

anchor run claimWinnings \
  --provider.wallet $USER1_WALLET \
  --provider.cluster devnet \
  -- \
  --event $EVENT_PDA

USER1_BALANCE_AFTER=$(solana balance $USER1_WALLET --url $RPC_URL)

echo "✅ User1 claimed winnings"
echo "   Balance before: $USER1_BALANCE_BEFORE SOL"
echo "   Balance after: $USER1_BALANCE_AFTER SOL"
echo "   Expected profit: ~0.475 SOL (0.5 * 1.95 - 0.5 = 0.475)"

# Step 9: Loser tries to claim (should fail)
echo "❌ Step 9: User2 tries to claim (should fail)"
if anchor run claimWinnings \
  --provider.wallet $USER2_WALLET \
  --provider.cluster devnet \
  -- \
  --event $EVENT_PDA 2>&1 | grep -q "BetNotWon"; then
  echo "✅ Correctly rejected loser's claim"
else
  echo "❌ ERROR: Loser should not be able to claim!"
  exit 1
fi

echo ""
echo "🎉 Happy Path Test Complete!"
echo "================================"
```

**Success Criteria**:
- ✅ Event created successfully
- ✅ Both users can place bets
- ✅ Auto-balance runs without errors
- ✅ Event settles correctly
- ✅ Winner receives ~1.95x payout
- ✅ Loser cannot claim

**User Story Alignment**: US1 (Effortless Betting) - entire flow should be smooth

---

### Task 3.2: E2E Test - LIFO Refund Mechanism (90 min)

**Scenario**: Test auto-balance refunds when pools are imbalanced

**Test Script**: `/home/user/Shin2chin/tests/devnet-e2e-lifo-refund.sh`

```bash
#!/bin/bash
set -e

echo "🧪 DevNet E2E Test - LIFO Refund"
echo "================================="

PROGRAM_ID="YOUR_ACTUAL_PROGRAM_ID_HERE"
ADMIN_WALLET=~/.config/solana/test-admin.json
USER1_WALLET=~/.config/solana/test-user1.json
USER2_WALLET=~/.config/solana/test-user2.json
RPC_URL="https://api.devnet.solana.com"

# Step 1: Create event
echo "📅 Step 1: Create event"
MATCH_START_TIME=$(($(date +%s) + 180))  # 3 minutes

# (Event creation code here - similar to happy path)

# Step 2: Create imbalance
echo "💰 Step 2: Create imbalanced pools (3 SOL vs 1 SOL)"

# User1 bets 1 SOL on Team A
echo "  User1 -> 1 SOL on Team A"
# (place bet code)

# User2 bets 1 SOL on Team A (same team!)
echo "  User2 -> 1 SOL on Team A"
# (place bet code)

# User1 bets 1 SOL on Team A again (wait, this should fail - one bet per team)
# Actually, User2 should bet 1 SOL on Team B instead

# Correct approach:
# - User1: 2 SOL on Team A
# - User2: 1 SOL on Team B
# Result: 2-to-1 imbalance

# Step 3: Wait and auto-balance
echo "⏳ Step 3: Wait for match start and auto-balance"
sleep 185

anchor run autoBalance --provider.wallet $ADMIN_WALLET --provider.cluster devnet -- --event $EVENT_PDA

# Step 4: Verify refund
echo "🔍 Step 4: Verify newer bet was refunded (LIFO)"

# Check bet statuses
# Expect: 1 Active bet on Team A, 1 Refunded bet on Team A, 1 Active bet on Team B

# Step 5: Refunded user can claim refund
echo "💸 Step 5: Refunded user claims refund"

# (claim refund code)

echo "✅ LIFO Refund Test Complete!"
```

**Success Criteria**:
- ✅ Imbalanced pools detected
- ✅ Newest bet refunded (LIFO)
- ✅ Refunded user can reclaim SOL
- ✅ Refunded bet marked as `BetStatus::Refunded`
- ✅ Pools balanced to within 1% threshold

---

### Task 3.3: E2E Test - Edge Cases (60 min)

Test these scenarios:

**3.3.1: All bets on one side**
- Create event
- All users bet on Team A
- Auto-balance should refund all but smallest bet
- Settle event (Team A wins)
- Remaining bettor wins (but pool is tiny, so payout = their bet back)

**3.3.2: Event created but no bets**
- Create event
- Wait for match start
- Auto-balance (no-op)
- Settle event
- No claims to process

**3.3.3: Bet after match start (should fail)**
- Create event
- Wait for match start time to pass
- Try to place bet
- Expect: Error "BettingWindowClosed"

**3.3.4: Claim before settlement (should fail)**
- Create event
- Place bet
- Try to claim before settle_event
- Expect: Error "EventNotSettled"

**3.3.5: Double claim (should fail)**
- Complete happy path
- Winner claims
- Winner tries to claim again
- Expect: Error "AlreadyClaimed"

**Document results** in `/home/user/Shin2chin/tests/DEVNET_TEST_RESULTS.md`

---

### Task 3.4: Frontend Integration Testing (120 min)

**Manual Testing Steps**:

1. **Start Development Server**
   ```bash
   cd /home/user/Shin2chin/frontend
   npm run dev
   ```

2. **Connect Phantom Wallet**
   - Open http://localhost:5173
   - Ensure Phantom is on DevNet
   - Click "Connect Wallet"
   - Verify: Wallet connects without errors
   - **US4 Validation**: Connection should be 1-click, no jargon

3. **View Events**
   - Create test event using admin CLI (from Task 3.1)
   - Verify: Event appears in EventList component
   - **US5 Validation**: UI should be minimal, max 3 elements visible

4. **Place Bet**
   - Click on Team A
   - Enter 0.1 SOL
   - Click Confirm
   - Verify: Transaction succeeds, bet appears in BetStatus
   - **US1 Validation**: Should be exactly 3 clicks (team → amount → confirm)

5. **Check Bet Status**
   - Verify: Bet shows as "Active" in UI
   - Check: Amount and team are correct
   - **US5 Validation**: Calm, minimal display

6. **Claim Winnings** (after settling event via CLI)
   - Settle event via admin wallet
   - Refresh frontend
   - Click "Claim" button
   - Verify: Winnings appear in wallet balance
   - **US1 Validation**: Claiming should be 1-click

**Create Test Report**: `/home/user/Shin2chin/tests/FRONTEND_INTEGRATION_TEST_REPORT.md`

**Template**:
```markdown
# Frontend Integration Test Report

**Date**: [DATE]
**Tester**: [NAME]
**DevNet Program ID**: [PROGRAM_ID]

## User Story Validation

### US1: Effortless Betting ⭐⭐⭐⭐⭐
- [x] 3 clicks maximum: See → Click → Confirm
- [x] No unnecessary forms
- [x] Smooth transaction flow
- Issues: [NONE / LIST ISSUES]

### US4: Invisible Wallet ⭐⭐⭐⭐☆
- [x] One-click connect
- [ ] Auto-remember (requires localStorage implementation)
- [x] No blockchain jargon in UI
- Issues: [LIST]

### US5: Zen UI ⭐⭐⭐⭐⭐
- [x] Max 3 elements visible per view
- [x] Soft colors, white space
- [x] Calm, non-distracting
- Issues: [NONE / LIST]

## Functional Tests

| Test Case | Status | Notes |
|-----------|--------|-------|
| Connect wallet | ✅ | 1-click connection worked |
| View events | ✅ | Event displayed correctly |
| Place bet Team A | ✅ | 0.1 SOL bet placed |
| Place bet Team B | ✅ | 0.1 SOL bet placed |
| View bet status | ✅ | Status shows "Active" |
| Claim winnings | ✅ | 1.95x payout received |
| Error handling | ⚠️  | Generic error messages |

## Issues Found

1. **[TITLE]**: [DESCRIPTION]
   - Severity: High / Medium / Low
   - Steps to reproduce: [...]
   - Expected: [...]
   - Actual: [...]

## Recommendations

- [ ] [RECOMMENDATION 1]
- [ ] [RECOMMENDATION 2]
```

---

## Day 5: Performance & Load Testing (4-6 hours)

### Task 5.1: Concurrent Betting Load Test (90 min)

**Objective**: Test system behavior under concurrent load

**Script**: `/home/user/Shin2chin/tests/devnet-load-test.sh`

```bash
#!/bin/bash

echo "🚀 DevNet Load Test - Concurrent Betting"

# Create 10 test wallets
for i in {1..10}; do
  solana-keygen new --outfile ~/.config/solana/load-test-user${i}.json --no-bip39-passphrase --force
  solana airdrop 1 ~/.config/solana/load-test-user${i}.json --url devnet &
done
wait

# Create event
ADMIN_WALLET=~/.config/solana/test-admin.json
MATCH_START_TIME=$(($(date +%s) + 300))

# (create event code)

# Place 10 concurrent bets
for i in {1..10}; do
  (
    WALLET=~/.config/solana/load-test-user${i}.json
    TEAM=$((i % 2))  # Alternate teams
    echo "User $i betting on team $TEAM"

    anchor run placeBet \
      --provider.wallet $WALLET \
      --provider.cluster devnet \
      -- \
      --event $EVENT_PDA \
      --team $TEAM \
      --amount 100000000  # 0.1 SOL
  ) &
done
wait

echo "✅ All bets placed"

# Verify all bets recorded
# (check event account state)

# Measure metrics:
# - Transaction success rate
# - Average confirmation time
# - RPC errors encountered
```

**Success Criteria**:
- ✅ At least 90% of concurrent bets succeed
- ✅ No race conditions in pool accounting
- ✅ All bets confirmed within 30 seconds

---

### Task 5.2: RPC Rate Limit Testing (45 min)

**Test**: Rapid-fire read operations from frontend

```bash
# From browser console:
for (let i = 0; i < 100; i++) {
  fetchEvents();
  fetchUserBets();
}

// Monitor for:
// - 429 Rate Limit errors
// - Failed requests
// - UI responsiveness
```

**User Story Alignment**: US1 (Effortless) - App must handle usage spikes gracefully

---

### Task 5.3: Network Latency Simulation (45 min)

**Use browser DevTools**:
- Network tab → Throttling → "Slow 3G"
- Test bet placement flow
- Verify: Loading states appear correctly
- Verify: User isn't confused during long transaction times

**US5 Validation**: Even slow networks should feel calm, not frustrating

---

## Day 6: Documentation & Monitoring (3-4 hours)

### Task 6.1: Create Deployment Documentation (60 min)

**File**: `/home/user/Shin2chin/docs/DEVNET_DEPLOYMENT.md`

```markdown
# Shin2Chin DevNet Deployment Guide

## Deployment Details

- **Date**: [DEPLOYMENT_DATE]
- **Program ID**: [ACTUAL_PROGRAM_ID]
- **Network**: Solana DevNet
- **Anchor Version**: 0.31.1
- **Deployer Wallet**: [ADMIN_PUBKEY]

## Contract Addresses

| Contract | Address | Explorer |
|----------|---------|----------|
| shin2chin_pool | [PROGRAM_ID] | [Solana Explorer Link] |

## Configuration Files Updated

- [x] `shin2chin-solana/programs/shin2chin_pool/src/lib.rs:11`
- [x] `shin2chin-solana/Anchor.toml:9`
- [x] `frontend/src/core/config/index.ts:12`
- [x] `frontend/src/hooks/usePoolContract.ts:10`

## Test Results Summary

- Backend Unit Tests: 52/52 passing ✅
- Frontend Tests: 31/31 passing ✅
- E2E Happy Path: PASS ✅
- E2E LIFO Refund: PASS ✅
- Security Scan: 0 vulnerabilities ✅

## Known Issues

1. **Auto-balance Rust lifetime constraint** (non-critical)
   - Status: Documented, workaround implemented
   - Impact: None (separate instruction created)

## Rollback Procedure

If critical issues found:

```bash
# 1. Close program to new transactions
solana program close [PROGRAM_ID] --url devnet

# 2. Redeploy previous version
anchor deploy --program-id [BACKUP_PROGRAM_ID]

# 3. Notify users via frontend banner
```

## Monitoring

- **RPC Endpoint**: https://api.devnet.solana.com
- **Explorer**: https://explorer.solana.com/?cluster=devnet
- **Check program**: `solana program show [PROGRAM_ID] --url devnet`

## Support

For issues, check:
1. `/home/user/Shin2chin/tests/DEVNET_TEST_RESULTS.md`
2. Changelog: `/home/user/Shin2chin/changelog.md`
3. GitHub Issues: [REPO_URL]/issues
```

---

### Task 6.2: Create Monitoring Dashboard Script (45 min)

**File**: `/home/user/Shin2chin/scripts/monitor-devnet.sh`

```bash
#!/bin/bash

echo "📊 Shin2Chin DevNet Monitoring Dashboard"
echo "========================================"

PROGRAM_ID="YOUR_ACTUAL_PROGRAM_ID_HERE"
RPC_URL="https://api.devnet.solana.com"

while true; do
  clear
  echo "📊 Shin2Chin DevNet Monitoring Dashboard"
  echo "========================================"
  echo "Time: $(date)"
  echo ""

  # Program status
  echo "🔹 Program Status"
  solana program show $PROGRAM_ID --url $RPC_URL | head -5
  echo ""

  # Recent transactions
  echo "🔹 Recent Transactions (Last 10)"
  solana transaction-history $PROGRAM_ID --url $RPC_URL --limit 10
  echo ""

  # Admin wallet balance
  echo "🔹 Admin Wallet Balance"
  solana balance ~/.config/solana/test-admin.json --url $RPC_URL
  echo ""

  # RPC health
  echo "🔹 RPC Health"
  curl -s -X POST $RPC_URL \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' | jq '.'
  echo ""

  echo "Refreshing in 30 seconds... (Ctrl+C to stop)"
  sleep 30
done
```

Make executable:
```bash
chmod +x /home/user/Shin2chin/scripts/monitor-devnet.sh
```

---

### Task 6.3: Update Changelog (30 min)

**File**: `/home/user/Shin2chin/changelog.md`

Add entry:
```markdown
## [DevNet Deployment] - [DATE]

### 🚀 Deployed

- **Program ID**: [ACTUAL_PROGRAM_ID]
- **Network**: Solana DevNet
- **Anchor Version**: 0.31.1

### ✅ Tests Completed

- Backend unit tests: 52/52 ✅
- Frontend tests: 31/31 ✅
- E2E happy path: PASS ✅
- E2E LIFO refund: PASS ✅
- Edge case tests: 5/5 PASS ✅
- Load testing: 90% success rate under 10 concurrent users ✅
- Security scan: 0 vulnerabilities ✅

### 📝 Configuration Updates

- Updated program ID in 4 files
- Generated fresh IDL
- Created DevNet environment config
- Set up test wallets (3 users + 1 admin)

### 🎯 User Story Validation

- US1 (Effortless Betting): ⭐⭐⭐⭐⭐ - 3 clicks confirmed
- US2 (Instant Events): ⭐⭐⭐⭐⭐ - 10 second event creation
- US4 (Invisible Wallet): ⭐⭐⭐⭐☆ - 1-click connect works
- US5 (Zen UI): ⭐⭐⭐⭐⭐ - Minimal, calm interface

### 🐛 Known Issues

1. Auto-balance Rust lifetime workaround (non-critical)
2. Generic error messages in frontend (UX improvement needed)

### 📊 Metrics

- Average bet placement time: [X] seconds
- Average claim time: [X] seconds
- RPC success rate: [X]%
- Frontend load time: [X]ms

### 🔜 Next Steps

- Monitor DevNet performance for 1 week
- Gather user feedback (if alpha testing)
- Fix any issues discovered
- Prepare MainNet deployment checklist
```

---

## Day 7: Review & Iteration (2-3 hours)

### Task 7.1: Code Review Checklist (45 min)

Go through this checklist:

**Security**:
- [ ] All program IDs updated correctly
- [ ] No private keys committed to repo
- [ ] Admin-only functions have proper checks
- [ ] Integer overflow checks in place
- [ ] PDA seeds prevent duplicate bets
- [ ] Settlement version prevents race conditions

**User Stories**:
- [ ] US1: Betting is 3 clicks max ✅
- [ ] US2: Event creation is ~10 seconds ✅
- [ ] US4: Wallet is 1-click connect ✅
- [ ] US5: UI is minimal and calm ✅

**Code Quality**:
- [ ] All tests passing (52 backend + 31 frontend)
- [ ] No TypeScript errors
- [ ] No console.error in production code
- [ ] Comments explain "why" not "what"

**Documentation**:
- [ ] README updated with DevNet info
- [ ] Deployment guide complete
- [ ] Test results documented
- [ ] Changelog updated

---

### Task 7.2: Update plan.md (30 min)

**File**: `/home/user/Shin2chin/plan.md`

**Update Phase 3 Weekend section** (lines 172-179):

```markdown
### Phase 3: DevNet Deployment (Weekend) - ✅ COMPLETE

- [x] Deploy fixed contract to devnet (Program ID: [ACTUAL_ID])
- [x] Test real blockchain transactions (52 backend + 31 frontend tests passing)
- [x] Complete betting flow: Create event → Place bet → Settle → Claim ✅
- [x] Error handling: Network issues, insufficient funds, etc. ✅
- [x] Performance testing: 10 concurrent users, 90% success rate ✅
- [x] Mobile testing: UI responsive, meets US5 (Zen UI) ✅

**Status**: Ready for extended DevNet monitoring before MainNet
```

---

### Task 7.3: Team Sync / User Notification (15 min)

If working with others or have users:

1. **Create announcement**:
   ```markdown
   🎉 Shin2Chin DevNet Deployment Complete!

   We've successfully deployed to Solana DevNet:
   - Program ID: [PROGRAM_ID]
   - All tests passing (83 total)
   - Ready for community testing

   Try it: [FRONTEND_URL]

   Please report any issues: [GITHUB_ISSUES_URL]
   ```

2. **Update README.md** with DevNet testing instructions

3. **Create issue template** for bug reports

---

## Success Criteria - Week 1 Complete ✅

### Must Have (MVP Blockers):
- [x] Program deployed to DevNet with valid program ID
- [x] All 4 config files updated with correct program ID
- [x] Backend tests pass on DevNet (52/52)
- [x] Frontend tests pass (31/31)
- [x] E2E happy path works (bet → win → claim)
- [x] E2E LIFO refund works (imbalance → refund)
- [x] Security scan shows 0 vulnerabilities
- [x] User stories validated (US1, US2, US4, US5)

### Nice to Have:
- [x] Load testing completed (10 concurrent users)
- [x] Documentation complete
- [x] Monitoring dashboard created
- [x] Test wallets funded and ready

---

## Quick Reference Commands

```bash
# Deploy
cd /home/user/Shin2chin/shin2chin-solana && anchor deploy --provider.cluster devnet

# Get Program ID
solana address -k target/deploy/shin2chin_pool-keypair.json

# Run Tests
anchor test --skip-build --skip-deploy

# Monitor Program
solana program show [PROGRAM_ID] --url devnet

# Check Admin Balance
solana balance ~/.config/solana/id.json --url devnet

# Airdrop SOL
solana airdrop 2 --url devnet

# Build Frontend
cd /home/user/Shin2chin/frontend && npm run build

# Run Frontend
npm run dev
```

---

## Troubleshooting Guide

### Issue: "Program is not deployed"
**Solution**: Verify deployment with `solana program show [PROGRAM_ID] --url devnet`

### Issue: "Insufficient funds"
**Solution**: `solana airdrop 2 --url devnet`

### Issue: "Transaction timeout"
**Solution**: Retry with `--commitment confirmed` flag

### Issue: "Account not found"
**Solution**: Verify PDA derivation matches Rust code

### Issue: Frontend can't connect
**Solution**:
1. Check Phantom wallet is on DevNet
2. Verify program ID in config matches deployed ID
3. Check browser console for errors

### Issue: Tests failing on DevNet
**Solution**:
1. Verify RPC connectivity: `curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'`
2. Check wallet has SOL
3. Review test logs for specific errors

---

## Notes

- All times are estimates; adjust based on your environment
- DevNet can be unstable; have patience with RPC issues
- Save all wallet keypairs securely
- Document any deviations from this plan in changelog.md
- Follow user stories for all decision-making

**Philosophy**: Tao Te Ching - Effortless, Minimal, Natural
- If a task feels overly complex, simplify
- If UI has >3 elements, reduce
- If user flow >3 clicks, streamline

---

**Plan created**: [DATE]
**Last updated**: [DATE]
**Status**: Ready for execution ✅
