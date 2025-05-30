# User Stories - AI Betting Platform

## MVP User Stories (Phase 0 Complete)

### 1. Conversational Betting
**Story**: As a crypto-native sports fan, I want to place simple binary bets through natural conversation so that I can express my sports knowledge without navigating complex betting interfaces.

**Acceptance Criteria:**
- ≤3 Gary conversation turns, 95% first-statement understanding  
- Binary betting only (Team A vs Team B)
- Gary validates user confidence ("Nice! You think United's got this one")
- Zero blockchain jargon in UI

### 2. Non-Custodial P2P
**Story**: As a crypto wallet holder, I want instant peer-to-peer betting without custodial deposits so that winning feels immediate and I maintain complete control of my funds.

**Acceptance Criteria:**
- One-click wallet connection (no registration/KYC)
- Direct wallet-to-smart-contract transactions  
- 30-second automatic payouts via oracle
- LIFO unmatched bet returns at match start

### 3. Clear Confirmation  
**Story**: As someone who believes I have betting edge, I want clear confirmation of my stake and potential winnings so that I understand exactly what I'm risking and what I can win.

**Acceptance Criteria:**
- Gary states bet amount, teams, "winner takes both stakes"
- Explicit "Yes" confirmation required before funds committed
- Immediate confirmation that bet is placed and being matched

### 4. UI Minimalism
**Story**: As a user who wants to focus on my bet, I want only essential information visible so that nothing distracts me from my betting decision.

**Acceptance Criteria:**
- Maximum 3 primary data points visible (match, bet amount, outcome)
- Zero odds/pool sizes/statistics by default  
- ≤4 interactive elements per screen for calm experience

### 5. Admin Event Creation
**Story**: As a platform admin, I want to easily create betting events so that users have legitimate matches to bet on.

**Acceptance Criteria:**
- Simple web form (Team A, Team B, start time)
- Events appear immediately in Gary's available matches
- Oracle automatically settles and triggers payouts

## Out of Scope (MVP)
- Complex betting markets
- Multiple sports  
- Live betting
- Social features
- Mobile app
- Fiat integration
- Bet history
- Monetization/fees