# Shin2Chin Solana - AI-Powered Peer-to-Peer Crypto Betting

## Project Overview
AI-powered peer-to-peer crypto betting platform on Solana blockchain. Users place simple binary bets through natural conversation with Gary AI, maintaining complete control of their funds.

## 5 Core User Stories

### 1. Conversational Betting
*As a crypto-native sports fan, I want to place simple binary bets through natural conversation so that I can express my sports knowledge without navigating complex betting interfaces.*

### 2. Non-Custodial P2P  
*As a crypto wallet holder, I want instant peer-to-peer betting without custodial deposits so that winning feels immediate and I maintain complete control of my funds.*

### 3. Clear Confirmation
*As someone who believes I have betting edge, I want clear confirmation of my stake and potential winnings so that I understand exactly what I'm risking and what I can win.*

### 4. UI Minimalism
*As a user who wants to focus on my bet, I want only essential information visible so that nothing distracts me from my betting decision.*

### 5. Admin Event Creation
*As a platform admin, I want to easily create betting events so that users have legitimate matches to bet on.*

## Technical Stack
- **Blockchain**: Solana
- **Smart Contracts**: Rust + Anchor
- **Frontend**: React + TypeScript  
- **AI Backend**: HeyAnon Automate SDK (Gary)
- **Wallets**: Phantom + Solflare

## Project Structure
- `shin2chin-solana/app/` - Main user interface
- `shin2chin-solana/programs/` - Solana smart contracts
- `shin2chin-solana/admin/` - Admin interface
- `shin2chin-solana/tests/` - Program tests

## Development Status
- ✅ Phase 0: User stories and foundation complete
- 🚧 Phase 1: Architecture design (next)
- ⏳ Phase 2: Implementation
- ⏳ Phase 3: UX design  
- ⏳ Phase 4: Security review
- ⏳ Phase 5: User acceptance testing

## Getting Started
```bash
cd shin2chin-solana
anchor build
cd app && npm install && npm start