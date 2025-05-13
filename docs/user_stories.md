# Shin2Chin User Stories & Architecture Mapping

This document connects our core user stories to the Shin2Chin platform architecture, ensuring our development remains focused on user needs.

## Core User Stories

### User Story 1: Placing Bets on Fighters

**As a bettor**, I want to place bets on fighters in scheduled matches so that I can earn money if my prediction is correct.

**Acceptance Criteria:**
1. I can deposit USDT tokens to my platform balance
2. I can view available fights including fighter names and scheduled times
3. I can place a bet of at least 1 USDT and up to 10,000 USDT on either Fighter A or Fighter B
4. My bet is automatically matched with existing bets from the opposing side when possible
5. After the fight concludes, I automatically receive payouts (original bet × 2, minus 1% fee) for winning bets
6. I receive refunds for any unmatched portions of my bets regardless of the fight outcome
7. I can withdraw my balance (including winnings) to my external wallet at any time

### User Story 2: Managing Fight Events

**As a platform admin**, I want to manage fights and control platform operations so that users can bet on legitimate matches and the platform runs securely.

**Acceptance Criteria:**
1. I can create fights with unique IDs, fighter names, and future start times
2. I can ensure betting automatically closes 5 minutes before the scheduled fight start
3. I can submit fight results (declaring either Fighter A or Fighter B as winner) after the fight concludes
4. The system automatically settles all bets and distributes payouts/refunds when I submit results
5. I can pause/unpause all platform operations in emergency situations
6. I can change admin addresses to ensure continuous platform management
7. I can perform emergency withdrawals in critical situations while protecting user funds

### User Story 3: Platform Fee Management

**As a platform operator**, I want to collect fees on winning bets so that the platform can sustainably operate while providing a fair P2P betting experience.

**Acceptance Criteria:**
1. The system automatically collects a 1% fee on all winning payouts
2. Total platform fees are tracked and reported when fights are settled
3. All fee transactions are transparent and emitted as events
4. Collected fees are securely stored in the contract until withdrawn by admins
5. Fee structure is clearly documented and consistently applied

## Architecture-to-User Story Mapping

### Component Mapping

| Component | Description | Bettor | Admin | Operator |
|-----------|-------------|:------:|:-----:|:--------:|
| Fight Management | Creates and manages fights | ✓ | ✓ |  |
| Betting System | Handles bet placement and storage | ✓ |  | ✓ |
| P2P Matching Engine | Matches opposing bets | ✓ |  |  |
| Result Submission | Submits and finalizes results |  | ✓ |  |
| Settlement System | Distributes payouts and refunds | ✓ |  | ✓ |
| Fund Management | Handles deposits and withdrawals | ✓ | ✓ |  |
| Admin Controls | Platform management functions |  | ✓ | ✓ |
| Event System | Event emissions for tracking | ✓ | ✓ | ✓ |

### Contract Methods by User Story

#### Bettor Story Implementation

- `addFunds`: Deposit tokens (AC1)
- `getFightInfo`, `getFighterNames`: View fights (AC2)
- `placeBet`: Place bets (AC3)
- `_matchUnmatchedBets`: Match with opposing bets (AC4)
- `_settleFight`: Distribute payouts (AC5) and refunds (AC6)
- `withdrawFunds`: Withdraw balance (AC7)

#### Admin Story Implementation

- `createFight`: Create fights (AC1)
- Fight struct with betCloseTime: Auto-close betting (AC2)
- `submitFightResult`: Submit results (AC3)
- Call to `_settleFight`: Auto-settlement (AC4)
- `pause`/`unpause`: Emergency controls (AC5)
- `changeAdmin`: Update admins (AC6)
- `emergencyWithdraw`: Emergency withdrawal (AC7)

#### Operator Story Implementation

- Fee calculation in `_settleFight`: Fee collection (AC1)
- Fee tracking in `_settleFight`: Fee reporting (AC2)
- Event emissions: Transparency (AC3)
- Contract security: Secure storage (AC4)
- Constants: Consistent fee structure (AC5)

## User Story Development Process

### Feature Evaluation Checklist

When adding new features or making changes, check:

1. **User Story Alignment**
   - Which user story does this feature support?
   - Which acceptance criteria does it address?
   - Does it conflict with any other user story?

2. **Implementation Focus**
   - Keep changes minimal and focused on user story requirements
   - Update tests to verify user story acceptance criteria
   - Document the user story connection in code comments

### Code Review Questions

When reviewing code changes, ask:

1. Does this change clearly support one or more user stories?
2. Is the implementation aligned with acceptance criteria?
3. Is the relationship to user stories documented?
4. Are there appropriate tests verifying user story requirements?

### User Story Maintenance

Conduct quarterly reviews to:

1. Validate that user stories still accurately represent user needs
2. Update acceptance criteria based on feedback or changing requirements
3. Evaluate architecture for continued alignment with user stories
4. Refine the backlog to ensure user-story-centric prioritization

By maintaining this connection between architecture and user stories, we ensure the platform development remains focused on delivering value to our users.