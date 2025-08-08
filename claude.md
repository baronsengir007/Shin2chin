# Shin2Chin Betting Platform - Master Context

## 🎯 What We're Building
A betting platform on Solana where users can bet with 1 click.
Philosophy: Tao Te Ching - effortless, minimal, natural.

## 📚 User Stories (LOCKED - DO NOT MODIFY)

### US1: Effortless Betting
**As a** user **I want to** bet on a team with 1 click **so that** it's as simple as possible.
- See match (Chelsea vs Man United)
- Click on team
- Enter amount
- Done

### US2: Instant Events
**As an** admin **I want to** create an event in 10 seconds **so that** content is available quickly.
- Team A + Team B + Time
- Auto 2x odds
- Publish

### US3: Natural Language
**As a** user **I want to** type "50 on Chelsea" **so that** I don't need to learn anything.
- Parse natural language
- Show confirmation
- 1 click confirm

### US4: Invisible Wallet
**As a** user **I want** my wallet to just work **so that** I never think about blockchain.
- One-click connect
- Auto-remember
- No technical jargon

### US5: Zen UI
**As a** user **I want** a calm, minimal interface **so that** nothing distracts from betting.
- Max 3 elements visible
- Soft colors
- Sacred white space

## 🏗️ Architecture: Auto-Balancing Pool

### Why Pool (not P2P)
- P2P matching = too complex
- Pool = everyone bets against the pot
- Auto-balance = always 50-50 at start

### How It Works
1. Users bet on Team A or Team B
2. At match start: auto-balance to 50-50
3. LIFO refunds (last bets refunded first)
4. Winners get 1.95x (2x minus 2.5% fee)

### Technical Implementation
- Accept all bets during betting period
- At match_start_time: calculate imbalance
- Refund excess from larger pool (LIFO based on timestamp)
- Result: perfectly balanced pools
- Payout: fixed 1.95x for all winners

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript, Zustand, Vite
- **Backend**: Solana, Anchor Framework
- **Wallet**: Phantom
- **UI**: TailwindCSS, Minimal components
- **Deploy**: Devnet → Mainnet

## 📊 Development Phases (MCP Guide)
- Phase 0: Product Strategy ✅ COMPLETE
- Phase 1: Architecture ✅ COMPLETE
- Phase 2: Implementation 🚧 CURRENT
- Phase 3: UX Polish ⏳ TODO
- Phase 4: Security ⏳ TODO
- Phase 5: Testing ⏳ TODO

## 🚨 Current Status
**PROBLEM**: Backend is P2P, needs to be Pool
**SOLUTION**: Refactor to auto-balancing pool
**IMPACT**: 2 weeks of work
**PRIORITY**: Backend refactor → Frontend simplification → Integration