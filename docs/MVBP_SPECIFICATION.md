# MVBP (Minimum Viable Betting Platform) Specification

## Overview
The MVBP represents the core functionality needed to demonstrate a working betting platform, targeted for completion by Week 6 (Phase B completion). This specification defines exactly what is included and excluded to maintain focus on the 6-week deliverable.

## Target Timeline
- **Development Period:** Weeks 4-6 (Phase B)
- **Success Criteria:** First real bet through wallet connection
- **Demo Date:** End of Week 6

## Included Features

### 1. Admin Event Management
- **Web-based admin interface** for event creation
- **Basic event fields:**
  - Event title and description
  - Binary betting options (Yes/No, Team A/Team B, etc.)
  - Event deadline
  - Manual settlement capability
- **Event status management** (Active, Closed, Settled)
- **Simple event listing** for admin review

### 2. User Betting Interface
- **Wallet connection** using Solana wallet adapters
- **Browse active events** in a simple list view
- **Place binary bets** with SOL tokens
- **Basic bet confirmation** flow
- **View user's active bets** in simple list

### 3. Core Betting Logic
- **Simple 1:1 matching system**
  - Users bet against the house or other users
  - No complex market making or odds calculation
- **Binary outcomes only** (Yes/No, Win/Lose)
- **Fixed bet amounts** (e.g., 0.1 SOL, 0.5 SOL, 1 SOL)
- **Basic escrow** functionality using Solana programs

### 4. Manual Settlement
- **Admin settlement interface**
  - Mark events as complete
  - Select winning outcome
  - Trigger payout distribution
- **Automatic payout calculation**
  - Winners receive their stake + matched amount
  - Losers forfeit their stake
- **Transaction confirmation** for all payouts

### 5. Basic UI/UX
- **Clean, functional interface** (not polished)
- **Mobile-responsive** basic layout
- **Essential user feedback**
  - Loading states
  - Success/error messages
  - Transaction confirmations
- **Wallet connection status** indicator

## Explicitly Excluded Features

### 1. Advanced Betting Features
- ❌ Complex odds calculation
- ❌ Market making algorithms
- ❌ Live betting or real-time odds
- ❌ Multiple bet types (only binary)
- ❌ Bet cancellation or modification

### 2. Oracle Integration
- ❌ Automated event result verification
- ❌ External data feeds
- ❌ Chainlink or other oracle services
- ❌ Real-time event monitoring

### 3. Gary AI Features
- ❌ Conversational betting interface
- ❌ AI-powered recommendations
- ❌ Natural language processing
- ❌ Intelligent bet suggestions

### 4. Advanced UI/UX
- ❌ Polished design system
- ❌ Advanced animations
- ❌ Real-time notifications
- ❌ Social features or chat
- ❌ Advanced analytics or dashboards

### 5. HeyAnon SDK
- ❌ Anonymous betting features
- ❌ Advanced privacy features
- ❌ SDK integration
- ❌ Third-party integrations

### 6. Advanced Technical Features
- ❌ Complex matching algorithms
- ❌ Multi-token support (SOL only)
- ❌ Advanced program optimizations
- ❌ Sophisticated error handling

## Technical Implementation

### Solana Program Requirements
```rust
// Core accounts needed for MVBP
pub struct Event {
    pub admin: Pubkey,
    pub title: String,
    pub description: String,
    pub option_a: String,
    pub option_b: String,
    pub deadline: i64,
    pub status: EventStatus,
    pub total_pool_a: u64,
    pub total_pool_b: u64,
}

pub struct Bet {
    pub user: Pubkey,
    pub event: Pubkey,
    pub amount: u64,
    pub option: BetOption,
    pub timestamp: i64,
}

pub enum EventStatus {
    Active,
    Closed,
    Settled { winner: BetOption },
}

pub enum BetOption {
    OptionA,
    OptionB,
}
```

### Frontend Requirements
- **React TypeScript structure** (already in progress)
- **Solana wallet adapter integration**
  - Support for Phantom, Solflare, and other major wallets
- **Anchor client integration** for program interaction
- **Basic state management** (Context API or simple state)
- **Essential components:**
  - WalletConnectionButton
  - EventList
  - BetForm
  - UserBets
  - AdminEventForm

### API Requirements
- **No backend server needed** (direct blockchain interaction)
- **RPC endpoint configuration** for Solana connection
- **Program deployment** on testnet for MVBP demo

## Success Metrics

### Week 6 Demo Requirements
1. **Admin can create a new event** via web interface
2. **User can connect wallet** (Phantom or similar)
3. **User can place a bet** on an active event with SOL
4. **Bet is recorded** on Solana blockchain (visible in explorer)
5. **Admin can settle event** and mark winner
6. **Winner receives payout** automatically to their wallet
7. **All transactions** are confirmed and visible

### Technical Validation
- [ ] Local validator deployment working
- [ ] Testnet deployment successful
- [ ] Wallet connection functional
- [ ] Bet placement completes end-to-end
- [ ] Settlement and payout working
- [ ] No critical bugs in core flow

### User Experience Validation
- [ ] Non-technical user can place a bet
- [ ] Error messages are clear and helpful
- [ ] Loading states provide feedback
- [ ] Mobile interface is usable
- [ ] Wallet integration feels secure

## Risk Mitigation

### Technical Risks
- **Solana program complexity:** Keep program logic minimal
- **Wallet integration issues:** Test with multiple wallet types
- **Transaction failures:** Implement basic retry logic
- **Testnet instability:** Have backup local validator demo

### Scope Risks
- **Feature creep:** Strict adherence to included/excluded lists
- **UI perfectionism:** Focus on functionality over aesthetics
- **Over-engineering:** Use simplest working implementation

### Timeline Risks
- **Integration delays:** Start integration testing early in Phase B
- **Testing overhead:** Limit testing to core happy path flows
- **Deployment issues:** Practice deployment process regularly

## Post-MVBP Evolution

### Phase C Additions (Weeks 7-10)
- Gary AI integration
- Enhanced UI/UX
- User Stories 1&3 implementation
- Real-time features

### Phase D Additions (Weeks 11-13)
- Oracle automation
- HeyAnon SDK integration
- Advanced betting features
- Production optimizations

## Definition of Done

The MVBP is considered complete when:

1. ✅ A complete end-to-end betting flow works from event creation to payout
2. ✅ Real SOL tokens are successfully escrowed and distributed
3. ✅ The demo can be shown to stakeholders without developer intervention
4. ✅ All core functionality works on Solana testnet
5. ✅ Basic error handling prevents system crashes
6. ✅ Code is documented sufficiently for Phase C development to continue

**Success Statement:** "A user with a Solana wallet can bet real SOL on admin-created events and receive payouts when they win."