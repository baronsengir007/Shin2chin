# Week 1 DevNet Deployment - Quick Start Guide

**Project**: Shin2Chin Betting Platform
**Goal**: Deploy to Solana DevNet and complete comprehensive testing
**Estimated Time**: 27-37 hours (3-7 days)

---

## 📋 Before You Start

### Required Tools
```bash
# Check installations
solana --version          # Need: 1.18.x or higher
anchor --version          # Need: 0.31.1
node --version            # Need: 18.x or higher
npm --version             # Need: 9.x or higher
```

### Install Missing Tools
```bash
# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked

# Node/npm (if needed)
# Use nvm: https://github.com/nvm-sh/nvm
```

### Prepare Wallet
```bash
# Configure for DevNet
solana config set --url https://api.devnet.solana.com
solana config set --keypair ~/.config/solana/id.json

# Get some SOL (need ~5 SOL for deployment + testing)
solana airdrop 2
solana balance  # Verify
```

---

## 🚀 Option 1: Automated Deployment (Recommended)

**One-command deployment** that handles everything:

```bash
cd /home/user/Shin2chin
./scripts/deploy-to-devnet.sh
```

This script will:
1. ✅ Build the Anchor program
2. ✅ Extract program ID
3. ✅ Update all 4 configuration files
4. ✅ Deploy to DevNet
5. ✅ Copy IDL to frontend
6. ✅ Create .env.devnet file
7. ✅ Verify deployment

**Time**: ~20-30 minutes

**Output**:
- Program deployed to DevNet
- All configs updated
- `DEVNET_DEPLOYMENT_INFO.txt` created with details

---

## 📖 Option 2: Manual Deployment (Step-by-Step)

Follow the complete guide:
```bash
# Open in your favorite editor
cat WEEK1_DEVNET_DEPLOYMENT_PLAN.md
```

Or follow online: [Link to plan file]

**Time**: ~2-3 hours (first time)

---

## 🧪 Testing (After Deployment)

### 1. Backend Tests (10 minutes)
```bash
cd shin2chin-solana
anchor test --skip-build --skip-deploy
```
**Expected**: 52 tests passing ✅

### 2. Frontend Tests (10 minutes)
```bash
cd frontend
npm install
npm test -- --run
```
**Expected**: 31 tests passing ✅

### 3. End-to-End Tests (2-3 hours)

**Use the comprehensive checklist**:
```bash
cat DEVNET_TESTING_CHECKLIST.md
```

**Print and check off** as you complete each test.

**Key tests**:
- Happy path: Event → Bet → Settle → Claim
- LIFO refund: Imbalanced pools → Auto-refund
- Edge cases: Late bets, double claims, etc.

### 4. Frontend Integration (1-2 hours)
```bash
cd frontend
npm run dev
# Open http://localhost:5173
```

**Test with Phantom wallet**:
1. Connect wallet (ensure it's on DevNet)
2. View events
3. Place a bet (should be 3 clicks max)
4. Check bet status
5. Claim winnings (after settling via CLI)

---

## 📊 Monitoring

### Real-time Dashboard
```bash
./scripts/monitor-devnet.sh <PROGRAM_ID>
```

**Shows**:
- Program status
- RPC health
- Admin wallet balance
- Quick stats

**Refreshes**: Every 30 seconds

### Manual Checks
```bash
# View program details
solana program show <PROGRAM_ID> --url devnet

# Check wallet balance
solana balance --url devnet

# View in explorer
# https://explorer.solana.com/address/<PROGRAM_ID>?cluster=devnet
```

---

## 🛠️ Common Issues & Fixes

### Issue: "solana: command not found"
```bash
# Add Solana to PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Or reinstall
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

### Issue: "anchor: command not found"
```bash
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
```

### Issue: "Insufficient funds"
```bash
# Request airdrop (can do multiple times)
solana airdrop 2 --url devnet

# Wait 10 seconds between airdrops if rate limited
```

### Issue: "Transaction timeout"
```bash
# Retry with explicit commitment
anchor deploy --provider.cluster devnet --provider.commitment confirmed

# Or increase timeout
anchor deploy --provider.cluster devnet -- --commitment confirmed --timeout 300
```

### Issue: "Program is not upgradeable"
```bash
# Deploy as new program
anchor deploy --provider.cluster devnet

# Or specify upgrade authority
solana program deploy ... --upgrade-authority <KEYPAIR>
```

### Issue: "Frontend can't connect to program"
**Check**:
1. Phantom wallet is on DevNet (not MainNet)
2. Program ID in frontend matches deployed program
3. Browser console for errors (F12 → Console)

**Fix**:
```bash
# Update program ID in frontend
./scripts/update-program-id.sh <CORRECT_PROGRAM_ID>

# Rebuild frontend
cd frontend && npm run build
```

---

## ✅ Success Checklist

After completing Week 1, you should have:

- [x] Program deployed to DevNet with valid program ID
- [x] 52 backend tests passing on DevNet
- [x] 31 frontend tests passing
- [x] E2E happy path tested and working
- [x] E2E LIFO refund tested and working
- [x] All edge cases handled
- [x] Frontend integration working
- [x] User stories validated:
  - US1 (Effortless): 3 clicks ⭐⭐⭐⭐⭐
  - US2 (Instant Events): ~10 sec ⭐⭐⭐⭐⭐
  - US4 (Invisible Wallet): 1-click ⭐⭐⭐⭐☆
  - US5 (Zen UI): Minimal ⭐⭐⭐⭐⭐
- [x] Documentation updated (changelog, plan.md)
- [x] Deployment info saved (DEVNET_DEPLOYMENT_INFO.txt)

---

## 📝 Documentation Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `WEEK1_QUICKSTART.md` | Quick start guide | **Start here** |
| `WEEK1_DEVNET_DEPLOYMENT_PLAN.md` | Complete 7-day plan | Detailed deployment guide |
| `DEVNET_TESTING_CHECKLIST.md` | Testing checklist | During testing phase |
| `scripts/deploy-to-devnet.sh` | Automated deployment | For quick deployment |
| `scripts/update-program-id.sh` | Update program IDs | If redeploying |
| `scripts/monitor-devnet.sh` | Monitoring dashboard | Post-deployment monitoring |

---

## 🔜 After Week 1

**If all tests pass**:
1. Monitor DevNet for 1 week
2. Gather feedback (if alpha testing)
3. Create MainNet deployment checklist
4. Plan MainNet launch

**If issues found**:
1. Document in `changelog.md`
2. Prioritize critical fixes
3. Redeploy to DevNet
4. Re-test

---

## 🆘 Getting Help

**Check documentation first**:
1. Read error message carefully
2. Check "Common Issues" section above
3. Review relevant plan section
4. Search changelog.md for similar issues

**Still stuck?**
- Review smart contract code in `shin2chin-solana/programs/shin2chin_pool/src/`
- Check DevNet explorer: https://explorer.solana.com/?cluster=devnet
- Verify Solana cluster health: `solana cluster-version --url devnet`

---

## 📈 Time Estimates

| Task | Quick Path | Thorough Path |
|------|-----------|---------------|
| Deployment | 20 min | 2-3 hours |
| Backend tests | 10 min | 1 hour |
| Frontend tests | 10 min | 1 hour |
| E2E testing | 1 hour | 8-10 hours |
| Load testing | 30 min | 4-6 hours |
| Documentation | 30 min | 3-4 hours |
| Review | 30 min | 2-3 hours |
| **TOTAL** | **3-4 hours** | **27-37 hours** |

**Recommended**: Thorough path for production-bound projects

---

## 🎯 Philosophy (Tao Te Ching)

All decisions guided by user stories:
- **Effortless**: Automated scripts, 3-click betting
- **Minimal**: Focused scope, clear documentation
- **Natural**: Step-by-step flow, intuitive UX

---

**Ready to start?**

```bash
# Let's go! 🚀
cd /home/user/Shin2chin
./scripts/deploy-to-devnet.sh
```

**Good luck!** 🍀
