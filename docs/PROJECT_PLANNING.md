# PROJECT PLANNING - AI-Powered Peer-to-Peer Crypto Betting Platform (MVP)

## Executive Summary
- Reduced from 51 to 28 core tasks (45% scope reduction)
- Timeline: 13 weeks (down from 20 weeks)
- Focus: Pure user story delivery, no feature creep
- 5 Milestones: Foundation (7), Gary AI (5), Solana Program (7), Admin & Oracle (6), Testing (3)

## MVP Focus Statement

This plan focuses exclusively on delivering the minimum viable functionality required to satisfy the 5 user stories and their acceptance criteria. It prioritizes:

1. **Direct User Value**: Every task directly contributes to a user story acceptance criterion
2. **Implementation Simplicity**: Each component is implemented in its simplest viable form
3. **Core Functionality Only**: No extra features beyond what's explicitly required
4. **Rapid Time-to-Value**: Reduced complexity enables faster delivery to users

The MVP will deliver:
- A conversational betting interface with ≤3 turns and zero jargon
- One-click wallet connection with direct transactions
- Clear bet confirmation with explicit consent
- Minimalist UI with essential information only
- Simple admin event creation with automatic settlement

## User Story Alignment

### User Story 1: Conversational Betting
*As a crypto-native sports fan, I want to place simple binary bets through natural conversation so that I can express my sports knowledge without navigating complex betting interfaces.*

**Acceptance Criteria:**
- ≤3 Gary conversation turns, 95% first-statement understanding
- Binary betting only (Team A vs Team B)
- Gary validates user confidence ("Nice! You think United's got this one")
- Zero blockchain jargon in UI

### User Story 2: Non-Custodial P2P
*As a crypto wallet holder, I want instant peer-to-peer betting without custodial deposits so that winning feels immediate and I maintain complete control of my funds.*

**Acceptance Criteria:**
- One-click wallet connection (no registration/KYC)
- Direct wallet-to-smart-contract transactions
- 30-second automatic payouts via oracle
- LIFO unmatched bet returns at match start

### User Story 3: Clear Confirmation
*As someone who believes I have betting edge, I want clear confirmation of my stake and potential winnings so that I understand exactly what I'm risking and what I can win.*

**Acceptance Criteria:**
- Gary states bet amount, teams, "winner takes both stakes"
- Explicit "Yes" confirmation required before funds committed
- Immediate confirmation that bet is placed and being matched

### User Story 4: UI Minimalism
*As a user who wants to focus on my bet, I want only essential information visible so that nothing distracts me from my betting decision.*

**Acceptance Criteria:**
- Maximum 3 primary data points visible (match, bet amount, outcome)
- Zero odds/pool sizes/statistics by default
- ≤4 interactive elements per screen for calm experience

### User Story 5: Admin Event Creation
*As a platform admin, I want to easily create betting events so that users have legitimate matches to bet on.*

**Acceptance Criteria:**
- Simple web form (Team A, Team B, start time)
- Events appear immediately in Gary's available matches
- Oracle automatically settles and triggers payouts

## Milestones & Tasks

### Milestone 1: Foundation (7 tasks)
| Task | Description | Priority | Complexity |
|------|-------------|----------|------------|
| 1.1 | Setup Solana & Anchor environment | P3 | Simple |
| 1.2 | Create React TypeScript structure | P3 | Simple |
| 1.3 | Configure HeyAnon SDK | P3 | Medium |
| 1.4 | Configure wallet adapters | P3 | Medium |
| 1.5 | Setup local validator | P3 | Simple |
| 1.6 | Basic error handling | P3 | Simple |
| 1.7 | UI component library with constraints | P2 | Medium |

### Milestone 2: Gary AI & Conversation (5 tasks)
| Task | Description | Priority | Complexity |
|------|-------------|----------|------------|
| 2.1 | Design/implement conversation flow | P1 | Medium |
| 2.2 | Betting intent extraction with sports terminology | P1 | Complex |
| 2.3 | Confidence validation responses | P1 | Medium |
| 2.4 | Bet preview with zero-jargon | P1 | Medium |
| 2.5 | Explicit "Yes" confirmation flow | P1 | Medium |

### Milestone 3: Solana Program & Wallet (7 tasks)
| Task | Description | Priority | Complexity |
|------|-------------|----------|------------|
| 3.1 | Solana program account structure & PDAs | P2 | Complex |
| 3.2 | Event storage instructions & accounts | P1 | Complex |
| 3.3 | Bet placement with transaction building | P1 | Complex |
| 3.4 | Bet matching algorithm | P1 | Complex |
| 3.5 | LIFO unmatched return mechanism | P1 | Medium |
| 3.6 | One-click wallet connection with signing | P1 | Medium |
| 3.7 | Basic state synchronization | P2 | Medium |

### Milestone 4: Admin & Oracle (6 tasks)
| Task | Description | Priority | Complexity |
|------|-------------|----------|------------|
| 4.1 | Select and implement oracle integration | P1 | Complex |
| 4.2 | 30-second timer and payout mechanism | P1 | Complex |
| 4.3 | Simple admin interface with event form | P1 | Medium |
| 4.4 | Event propagation to Gary AI | P1 | Medium |
| 4.5 | Settlement trigger mechanism | P1 | Complex |
| 4.6 | Basic admin authentication | P2 | Simple |

### Milestone 5: Testing & Deployment (3 tasks)
| Task | Description | Priority | Complexity |
|------|-------------|----------|------------|
| 5.1 | Essential unit tests for core components | P2 | Medium |
| 5.2 | Simplified end-to-end betting flow test | P1 | Medium |
| 5.3 | Mainnet deployment process | P3 | Medium |

## Dependencies & Critical Path
- Foundation → Solana Program Design → Bet Matching → Oracle Integration → End-to-End Testing
- Milestone 1 (Foundation) → All subsequent milestones
- Task 3.1 (Solana Program Design) → Tasks 3.2-3.7, 4.1-4.5
- Task 4.1 (Oracle Integration) → Task 4.2, 4.5, 5.2
- Task 5.2 (End-to-End Test) → Requires most previous tasks complete

## Implementation Timeline
- Phase 1: Foundation (Weeks 1-2) - Tasks 1.1-1.7
- Phase 2: Core Systems (Weeks 3-6) - Tasks 2.1-2.5, 3.1
- Phase 3: Betting Logic (Weeks 7-9) - Tasks 3.2-3.7
- Phase 4: Admin & Oracle (Weeks 10-12) - Tasks 4.1-4.6
- Phase 5: Testing & Deployment (Week 13) - Tasks 5.1-5.3

## Removed/Deferred Tasks
- Removed: 11 non-essential tasks (analytics, monitoring, over-engineering)
- Deferred: 8 post-MVP tasks (advanced features)
- Combined: 7 related tasks for simplification
- Simplified: 3 tasks to minimum viable implementation

## Dependency Map

```
                                 +-------------+
                                 | 1.1 Solana  |
                                 | Environment |
                                 +------+------+
                                        |
                          +-------------+-------------+
                          |                           |
                   +------v-------+            +------v------+
                   | 1.5 Test     |            | 3.1 Program |
                   | Validator    |            | Structure   |
                   +------+-------+            +------+------+
                          |                           |
                          |                    +------+------+------+
                          |                    |             |      |
                          |               +----v---+    +----v---+  |
                          |               | 3.2    |    | 3.3    |  |
                          |               | Event  |    | Bet    |  |
                          |               | Storage|    | Place  |  |
                          |               +----+---+    +----+---+  |
                          |                    |             |      |
                          |                    |             |      |
                          |                    |        +----v---+  |
                          |                    |        | 3.4    |  |
                          |                    |        | Bet    |  |
                          |                    |        | Match  |  |
                          |                    |        +----+---+  |
                          |                    |             |      |
                          |                    |        +----v---+  |
                          |                    |        | 3.5    |  |
                          |                    |        | LIFO   |  |
                          |                    |        | Return |  |
                          |                    |        +----+---+  |
                          |                    |             |      |
                          |                    |             |      |
+-------------+    +------v-------+       +----v-------------v------v----+
| 1.2 React   |    | 5.1-5.3      |       | 4.1 Oracle Integration       |
| Application |    | Testing &    |       | 4.2 Timer & Payout          |
+------+------+    | Deployment   |       | 4.5 Settlement Trigger      |
       |           +--------------+       +----------------------------+
       |                                                |
+------v------+                                    +----v---+
| 1.7 UI      |                                    | 4.3    |
| Components  |                                    | Admin  |
+------+------+                                    | UI     |
       |                                           +----+---+
       |                                                |
+------v------+   +-------------+                  +----v---+
| 1.3 HeyAnon |   | 1.4 Wallet  |                  | 4.4    |
| SDK Setup   |   | Adapters    |                  | Event  |
+------+------+   +------+------+                  | Propag.|
       |                  |                        +----+---+
       |                  |                             |
+------v------+    +------v------+                      |
| 2.1-2.5     |    | 3.6 Wallet  |                      |
| Gary AI &   |<---| Connection  |                      |
| Conversation|    | & Signing   |                      |
+------+------+    +------+------+                      |
       |                  |                             |
       |            +-----v------+                      |
       +----------->| 3.7 State  |<---------------------+
                    | Sync       |
                    +------------+
```

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|------------|------------|
| HeyAnon SDK limitations for betting context | High | Medium | Early prototyping with actual SDK |
| Oracle reliability issues | High | Medium | Select established oracle provider |
| Solana program security vulnerabilities | Critical | Medium | Careful design review, basic security testing |
| Complex bet matching edge cases | Medium | High | Focus on common cases first, simplify algorithm |
| Wallet compatibility issues | High | Low | Early testing with actual wallets |
| AI accuracy below 95% target | High | Medium | Focus on limited sports terminology first |

## Success Metrics

The MVP will be considered successful when:
- All 5 user stories are implemented with their acceptance criteria met
- The betting flow works end-to-end from conversation to payout
- The UI maintains the minimalist requirements
- The system can be deployed to Solana mainnet

## Conclusion

This focused MVP plan provides a clear roadmap for delivering the essential functionality required by the 5 user stories. By limiting scope to the 28 most critical tasks, we ensure a streamlined development process that can deliver value to users within 13 weeks.

After MVP completion, subsequent phases can introduce enhancements, analytics, performance optimizations, and advanced features based on user feedback and platform adoption.