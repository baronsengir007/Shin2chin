# Shin2Chin Betting Platform: Foundation Prompt

## Project Overview

Shin2Chin is a peer-to-peer betting platform for combat sports/fighting matches built on the Ethereum/Base blockchain. It allows users to place bets on fighters in scheduled matches, with bets automatically matched between opposing sides. The platform handles fight creation, bet matching, result submission, and automated payout distribution, all while maintaining the security of user funds.

The platform's core value proposition is its P2P betting mechanism - users bet against each other rather than against a house, with the platform taking only a small fee on winnings. This creates a more equitable betting experience while ensuring the platform's sustainability through fee collection.

## Architecture

### Current Architecture

The current implementation uses a single upgradeable smart contract with the following components:

1. **Fight Management**: Creates and stores fight information, including fighters, start times, and states
2. **Betting System**: Handles bet placement with a consolidated array-based storage mechanism
3. **P2P Matching Engine**: Matches bets from opposing sides automatically
4. **Admin-Based Result Submission**: Allows admins to submit and finalize fight results
5. **Settlement System**: Automatically distributes payouts and refunds after result submission
6. **Fund Management**: Handles user deposits and withdrawals using USDT tokens
7. **Admin Controls**: Manages platform operation with appropriate access controls

The contract leverages OpenZeppelin's upgradeability pattern, allowing future improvements without losing state.

### Target Simplified Architecture

The redesign maintains the single-contract architecture but further simplifies components while preserving core P2P functionality:

1. **Storage Optimization**: 
   - Optimized structs with packed variables to reduce gas costs
   - Simplified state transitions with minimal enumeration
   - Consolidated bet storage and matching logic

2. **Process Streamlining**:
   - Direct admin result submission (no oracle complexity)
   - Immediate settlement upon result submission
   - Simplified security model with primary and backup admins

3. **Enhanced Event System**:
   - Detailed event emissions for frontend synchronization
   - Clear tracking of all state changes and financial transactions

4. **Gas Efficiency**:
   - Batch processing for bet matching
   - Optimized storage layouts
   - Efficient iteration patterns

## User Stories

The platform is built around three core user stories:

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

These user stories drive our architecture and implementation priorities. Each component and function in the system directly supports one or more of these stories, ensuring we remain focused on delivering user value throughout development.

## Core Use Cases

### Priority 1: Betting Workflow
1. User deposits USDT tokens to platform balance
2. User views available fights and odds
3. User places bet on Fighter A or Fighter B
4. System matches bet with opposing bets
5. After fight concludes, system automatically:
   - Pays out winners (matched bet amount × 2, minus small fee)
   - Refunds any unmatched portion of bets

### Priority 2: Fight Management
1. Admin creates fight with fighters, scheduled time
2. System automatically closes betting before fight starts
3. Admin submits fight result after conclusion
4. System finalizes result and distributes payouts
5. Admin can view platform statistics and fee collection

### Priority 3: Fund Management
1. User deposits funds to platform balance
2. User places bets using platform balance
3. User receives winnings to platform balance
4. User withdraws funds to external wallet
5. Admin can perform emergency functions in critical situations

## Technical Specifications

### Blockchain Platform
- **Primary Chain**: Ethereum
- **Scaling Solution**: Base (Layer 2)
- **Contract Type**: Upgradeable proxy pattern

### Language & Frameworks
- **Smart Contract Language**: Solidity 0.8.17
- **Development Framework**: Hardhat
- **Testing Framework**: Mocha/Chai with ethers.js
- **Contract Libraries**: OpenZeppelin contracts-upgradeable (v4.9.6)

### Key Dependencies
- **Token Standard**: ERC20 (USDT) for all financial transactions
- **Security Components**: 
  - ReentrancyGuard for transaction safety
  - Pausable for emergency stops
  - Custom access control for admin functions

### Testing & Deployment
- **Local Testing**: Hardhat Network
- **Staging Environment**: Base Testnet
- **CI/CD**: GitHub Actions workflow
- **Documentation**: Solidity docgen + Markdown

## Development Status

### Current State
Phase 1 (Cleanup & Foundation) is complete:
- Project structure established
- Interface definitions created
- Data structures optimized
- Unnecessary components removed (oracle system, complex dispute resolution)
- Testing framework implemented
- CI/CD pipeline established

### Redesign Goals
1. **Phase 2**: Core Contract Refactoring
   - Implement base contract with upgradeability
   - Create fight management module
   - Build simplified P2P betting system
   - Implement admin result submission
   - Develop fund management system

2. **Phase 3**: Testing & Security
   - Develop comprehensive test suite (>90% coverage)
   - Optimize for gas efficiency
   - Conduct security audit
   - Address edge cases and vulnerabilities

3. **Phase 4**: Documentation & Deployment
   - Create technical documentation
   - Develop deployment scripts
   - Prepare migration plan
   - Conduct end-to-end testing

## Coding Standards

### Architecture Patterns
- **Separation of Concerns**: Clear delineation between fight management, betting, and fund handling
- **Minimalism**: Only implement what's necessary for core functionality
- **Gas Optimization**: Storage packing, efficient loops, batch processing
- **Defensive Programming**: Validate all inputs, handle edge cases
- **Fail Early**: Check preconditions at the start of functions

### Security Considerations
- **Access Control**: Clear role-based restrictions on administrative functions
- **Fund Security**: Reentrancy protection on all financial transactions
- **Input Validation**: Thorough validation of all user inputs
- **Emergency Measures**: Pause functionality and admin recovery options
- **Upgradeability**: Carefully managed state variables for proxy compatibility

### Testing Requirements
- **Unit Testing**: Each component tested in isolation
- **Integration Testing**: End-to-end workflows tested
- **Gas Reporting**: Track gas costs for optimization
- **Coverage**: Aim for >90% test coverage

## Implementation Guidelines

### Key Principles
1. **Simplicity Over Complexity**: 
   - Choose the simplest approach that satisfies requirements
   - Avoid premature optimization or unnecessary features
   - Maintain readability over clever code

2. **Security First**:
   - Consider attack vectors for every function
   - Apply consistent security patterns
   - Never trust external inputs

3. **Gas Efficiency**:
   - Optimize storage layout
   - Minimize state changes
   - Batch operations where possible

4. **Clear Documentation**:
   - NatSpec comments for all functions
   - Event emissions for all state changes
   - Thorough documentation of assumptions and limitations

5. **Future-Proofing**:
   - Maintain upgradeability compatibility
   - Use constants for configurable values
   - Design with extensibility in mind

### Implementation Approach
- Follow the phased implementation plan from the project board
- Maintain comprehensive test coverage throughout development
- Regularly review gas costs and optimize as needed
- Document architectural decisions and trade-offs
- Prioritize core P2P betting functionality over peripheral features

This foundation prompt provides the essential context for developing the Shin2Chin betting platform, focusing on maintaining the core P2P betting functionality while simplifying the architecture and ensuring security and gas efficiency.