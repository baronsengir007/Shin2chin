# Shin2Chin MVP Solution Design

## Introduction

This document outlines the solution design for the Shin2Chin platform's Minimal Viable Product (MVP), focusing on core P2P betting functionality. The design prioritizes simplicity, gas efficiency, and essential features while deferring non-critical components to post-MVP phases.

## Table of Contents

- [1. Data Structures](#1-data-structures-review-and-enhancement)
  - [1.1 Optimized Structs](#11-optimized-structs)
  - [1.2 State Variables](#12-state-variables)
- [2. Core Functions](#2-core-functions)
  - [2.1 Fight Management](#21-fight-management)
  - [2.2 Betting System](#22-betting-system)
  - [2.3 Settlement System](#23-settlement-system)
  - [2.4 Fund Management](#24-fund-management)
- [3. State Transitions](#3-state-transitions)
  - [3.1 Fight Lifecycle](#31-fight-lifecycle)
  - [3.2 Bet States](#32-bet-states)
  - [3.3 Fund Flow](#33-fund-flow)
- [4. Security Model](#4-security-model)
  - [4.1 Access Control](#41-access-control)
  - [4.2 Security Mechanisms](#42-security-mechanisms)
- [5. Architecture](#5-architecture-diagram)
  - [5.1 Component Diagram](#51-component-diagram)
  - [5.2 Event Emissions](#52-event-emissions)
- [6. Feature Boundaries](#6-mvp-feature-boundaries)
  - [6.1 Included in MVP](#included-in-mvp)
  - [6.2 Deferred to Post-MVP](#deferred-to-post-mvp)
- [7. Implementation Approach](#7-implementation-approach)

## 1. Data Structures Review and Enhancement

### 1.1 Optimized Structs

The following data structures have been reviewed and enhanced for maximum gas efficiency while maintaining essential functionality:

#### Fight Struct

```solidity
struct Fight {
    // Slot 1: Core timestamps (12 bytes) + flags (20 bytes)
    uint40 startTime;
    uint40 endTime;
    uint40 betCloseTime;
    uint8 status;        // 0=Pending, 1=Active, 2=Completed 
    bool settled;        // Whether payouts have been distributed
    bool winnerSide;     // true=fighterA wins, false=fighterB wins
    uint96 reserved1;    // Reserved for future use (better packing)
    
    // Slot 2: Betting amounts
    uint96 totalBetsA;
    uint96 totalBetsB;
    uint64 totalMatchedBets;
    
    // Slot 3-4: Fighter A (name only for MVP)
    string fighterAName;
    
    // Slot 5-6: Fighter B (name only for MVP)
    string fighterBName;
}
```

**Optimizations:**
- Combined redundant state variables into a single `status` field
- Reduced timestamp sizes to uint40 (sufficient until year 36812)
- Removed unused fields from the original implementation
- Reserved space with explicit padding for future extensibility
- Only stores fighter names, with stats deferred to post-MVP

**Deferred to Post-MVP:**
- Fighter win/loss records
- Fight categorization and metadata
- Dispute-related fields
- Historical analytics data

#### Bet Struct

```solidity
struct Bet {
    // Slot 1: Bettor + amounts (packed for gas efficiency)
    address bettor;      // 20 bytes
    uint88 amount;       // 11 bytes (max ~3e26 - sufficient for any reasonable bet) 
    uint88 matchedAmount;// 11 bytes
    uint8 flags;         // 1 byte for side, cancellation, and future flags
    
    // Flags bit layout:
    // - bit 0: side (0=fighterB, 1=fighterA)
    // - bit 1: cancelled
    // - bits 2-7: reserved for future use
}

// Helper functions for flags
function getSide(uint8 flags) internal pure returns (bool) {
    return (flags & 1) == 1;
}

function isCancelled(uint8 flags) internal pure returns (bool) {
    return (flags & 2) == 2;
}

function setCancelled(uint8 flags) internal pure returns (uint8) {
    return flags | 2;
}
```

**Optimizations:**
- Packed all fields into a single storage slot (32 bytes)
- Used bitflags to store boolean values
- Reduced size of amount fields to uint88, still supporting bets up to 309,485,009 ETH
- Added helper functions for flag manipulation

**Deferred to Post-MVP:**
- Bet timing information
- Complex bet types or conditions
- Partial cancellation options

#### UserStats Struct

```solidity
struct UserStats {
    // Single slot for all core statistics
    uint64 totalBets;
    uint64 totalWins;
    uint64 totalAmount;
    uint64 totalPayout;
}
```

**Optimizations:**
- All fields packed into a single storage slot
- Reduced integer sizes to appropriate values
- Removed unused timestamps from Phase 1 design

**Deferred to Post-MVP:**
- Detailed betting history
- Time-based analytics
- Category-specific performance metrics

### 1.2 State Variables

```solidity
// Core state mappings - essential for MVP
mapping(uint256 => Fight) private fights;
mapping(uint256 => Bet[]) private bets; // Consolidated matched/unmatched into one array
mapping(address => uint256) public userBalances;
mapping(address => UserStats) private userStats;

// Admin addresses
address public admin;
address public backupAdmin;

// Constants
uint256 public constant FEE_PERCENTAGE = 1; // 1% fee
uint256 public constant MIN_BET_AMOUNT = 1 * 10**6; // 1 USDT with 6 decimals
uint256 public constant MAX_BET_AMOUNT = 10000 * 10**6; // 10,000 USDT
uint256 public constant BET_CLOSE_OFFSET = 5 minutes;
```

**Optimizations:**
- Consolidated matched and unmatched bets into a single array for simpler code
- Minimal number of state variables
- Simple admin model with backup admin
- Essential constants only

**Deferred to Post-MVP:**
- Advanced betting constraints
- Variable fee structures
- Complex access control lists
- Specialized bet tracking

## 2. Core Functions

### 2.1 Fight Management

```solidity
/**
 * @notice Creates a new fight with the given parameters
 * @param _fightId The unique identifier for the fight
 * @param _startTime The scheduled start time of the fight
 * @param _fighterAName The name of fighter A
 * @param _fighterBName The name of fighter B
 */
function createFight(
    uint256 _fightId,
    uint256 _startTime,
    string memory _fighterAName,
    string memory _fighterBName
) external onlyAdmin {
    // Validate inputs
    if (fights[_fightId].startTime != 0) revert FightAlreadyExists(_fightId);
    if (_startTime <= block.timestamp) revert InvalidStartTime(_startTime);
    
    // Create fight with minimal fields
    fights[_fightId] = Fight({
        startTime: uint40(_startTime),
        endTime: 0,
        betCloseTime: uint40(_startTime - BET_CLOSE_OFFSET),
        status: 0, // Pending
        settled: false,
        winnerSide: false,
        reserved1: 0,
        totalBetsA: 0,
        totalBetsB: 0,
        totalMatchedBets: 0,
        fighterAName: _fighterAName,
        fighterBName: _fighterBName
    });
    
    emit FightCreated(_fightId, _startTime, _fighterAName, _fighterBName);
}

/**
 * @notice Submits the result of a fight
 * @param _fightId The ID of the fight
 * @param _winner The winning side (true for Fighter A, false for Fighter B)
 */
function submitResult(uint256 _fightId, bool _winner) external onlyAdmin {
    Fight storage fight = fights[_fightId];
    
    // Validate fight status
    if (fight.startTime == 0) revert FightNotFound(_fightId);
    if (fight.status == 2) revert FightAlreadyCompleted(_fightId);
    if (block.timestamp < fight.startTime) revert FightNotStarted(_fightId);
    
    // Update fight with result
    fight.status = 2; // Completed
    fight.winnerSide = _winner;
    fight.endTime = uint40(block.timestamp);
    
    emit FightResultSubmitted(_fightId, _winner);
    
    // Automatically settle the fight
    _settleFight(_fightId);
}
```

**Implementation Notes:**
- Minimalist fight creation with essential parameters only
- Direct admin result submission without oracle complexity
- Automatic settlement triggered on result submission
- Functions limited to what's absolutely needed for MVP

**Deferred to Post-MVP:**
- Fight cancellation/rescheduling
- Detailed fight metadata
- Multi-stage result confirmation
- Fight categorization and filtering

### 2.2 Betting System

```solidity
/**
 * @notice Places a bet on a fight
 * @param _fightId The ID of the fight
 * @param _side The side to bet on (true for Fighter A, false for Fighter B)
 * @param _amount The amount to bet
 */
function placeBet(uint256 _fightId, bool _side, uint256 _amount) external nonReentrant whenNotPaused {
    Fight storage fight = fights[_fightId];
    
    // Validate fight and bet
    if (fight.startTime == 0) revert FightNotFound(_fightId);
    if (fight.status != 0) revert BettingClosed(_fightId);
    if (block.timestamp >= fight.betCloseTime) revert BettingClosed(_fightId);
    if (_amount < MIN_BET_AMOUNT || _amount > MAX_BET_AMOUNT) revert InvalidBetAmount(_amount);
    if (userBalances[msg.sender] < _amount) revert InsufficientBalance();
    
    // Update user balance
    userBalances[msg.sender] -= _amount;
    
    // Calculate how much can be matched right away
    uint256 opposingSideBets = _side ? fight.totalBetsB : fight.totalBetsA;
    uint256 availableToMatch = opposingSideBets > fight.totalMatchedBets ? 
        opposingSideBets - fight.totalMatchedBets : 0;
    uint256 matchedAmount = _amount < availableToMatch ? _amount : availableToMatch;
    
    // Create the bet with appropriate flags
    uint8 flags = _side ? 1 : 0; // Set side flag
    bets[_fightId].push(Bet({
        bettor: msg.sender,
        amount: uint88(_amount),
        matchedAmount: uint88(matchedAmount),
        flags: flags
    }));
    
    // Update fight betting totals
    if (_side) {
        fight.totalBetsA += uint96(_amount);
    } else {
        fight.totalBetsB += uint96(_amount);
    }
    
    if (matchedAmount > 0) {
        fight.totalMatchedBets += uint64(matchedAmount);
    }
    
    // Update user stats
    UserStats storage stats = userStats[msg.sender];
    stats.totalBets++;
    stats.totalAmount += uint64(_amount);
    
    emit BetPlaced(_fightId, msg.sender, _amount, matchedAmount, _side);
    
    // Try to match any previously unmatched bets from the opposite side
    _matchUnmatchedBets(_fightId);
}

/**
 * @dev Attempts to match previously unmatched bets for a fight
 * @param _fightId The ID of the fight
 */
function _matchUnmatchedBets(uint256 _fightId) internal {
    Fight storage fight = fights[_fightId];
    
    // Calculate available amounts to be matched on each side
    uint256 availableA = fight.totalBetsA > fight.totalMatchedBets ? 
        fight.totalBetsA - fight.totalMatchedBets : 0;
    uint256 availableB = fight.totalBetsB > fight.totalMatchedBets ? 
        fight.totalBetsB - fight.totalMatchedBets : 0;
    
    // Nothing to match if either side has no available unmatched amount
    if (availableA == 0 || availableB == 0) return;
    
    uint256 toMatch = availableA < availableB ? availableA : availableB;
    uint256 matchedSoFar = 0;
    
    // Match bets until we've matched the maximum possible amount
    for (uint256 i = 0; i < bets[_fightId].length && matchedSoFar < toMatch; i++) {
        Bet storage bet = bets[_fightId][i];
        
        // Skip bets that are fully matched or cancelled
        if (bet.matchedAmount == bet.amount || isCancelled(bet.flags)) continue;
        
        uint256 unmatchedAmount = bet.amount - bet.matchedAmount;
        uint256 amountToMatch = unmatchedAmount < (toMatch - matchedSoFar) ? 
            unmatchedAmount : (toMatch - matchedSoFar);
        
        if (amountToMatch > 0) {
            bet.matchedAmount += uint88(amountToMatch);
            matchedSoFar += amountToMatch;
            
            emit BetMatched(_fightId, i, amountToMatch);
        }
    }
    
    // Update the total matched bets
    fight.totalMatchedBets += uint64(matchedSoFar);
}
```

**Implementation Notes:**
- Simplified betting with immediate partial matching where possible
- Optimized matching algorithm that works in a single pass
- Consolidated matched/unmatched bets into a single array
- Reduced complexity while maintaining P2P matching functionality
- Gas-efficient implementation with minimal state transitions

**Deferred to Post-MVP:**
- Bet cancellation before fight starts
- Complex matching strategies
- Bet modification options
- Odds or handicap systems

### 2.3 Settlement System

```solidity
/**
 * @dev Settles a fight by distributing payouts
 * @param _fightId The ID of the fight
 */
function _settleFight(uint256 _fightId) internal {
    Fight storage fight = fights[_fightId];
    
    // Validate fight can be settled
    if (fight.status != 2) revert FightNotCompleted(_fightId);
    if (fight.settled) revert FightAlreadySettled(_fightId);
    
    bool winnerSide = fight.winnerSide;
    uint256 platformFees = 0;
    
    // Process all bets
    for (uint256 i = 0; i < bets[_fightId].length; i++) {
        Bet storage bet = bets[_fightId][i];
        
        // Handle matched portion of bet
        if (bet.matchedAmount > 0) {
            if (getSide(bet.flags) == winnerSide) {
                // Winner gets matched amount * 2, minus fee
                uint256 matchedPayout = uint256(bet.matchedAmount) * 2;
                uint256 fee = (matchedPayout * FEE_PERCENTAGE) / 100;
                uint256 netPayout = matchedPayout - fee;
                
                userBalances[bet.bettor] += netPayout;
                platformFees += fee;
                
                // Update user stats
                userStats[bet.bettor].totalWins++;
                userStats[bet.bettor].totalPayout += uint64(netPayout);
                
                emit BetPayout(bet.bettor, netPayout, _fightId);
            }
            // Losers don't get anything for matched portions
        }
        
        // Handle unmatched portion of bet (always refunded)
        uint256 unmatchedAmount = bet.amount - bet.matchedAmount;
        if (unmatchedAmount > 0) {
            userBalances[bet.bettor] += unmatchedAmount;
            emit BetRefund(bet.bettor, unmatchedAmount, _fightId);
        }
    }
    
    // Mark fight as settled
    fight.settled = true;
    
    emit FightSettled(_fightId, winnerSide, platformFees);
}
```

**Implementation Notes:**
- Streamlined settlement process triggered automatically by result submission
- Single-pass payout processing
- Clear distinction between payouts and refunds
- Explicit tracking of platform fees
- Automatic refund of unmatched bet portions

**Deferred to Post-MVP:**
- Tiered fee structures
- Partial settlements
- Reward mechanisms beyond simple payouts
- Complex settlement scenarios (draws, cancellations, etc.)

### 2.4 Fund Management

```solidity
/**
 * @notice Adds funds to the user's balance
 * @param _amount The amount to add
 */
function addFunds(uint256 _amount) external whenNotPaused {
    if (_amount == 0) revert InvalidAmount();
    
    // Transfer tokens from user to contract
    bool success = IERC20Upgradeable(usdtToken).transferFrom(
        msg.sender, 
        address(this), 
        _amount
    );
    if (!success) revert TransferFailed();
    
    // Update user balance
    userBalances[msg.sender] += _amount;
    
    emit FundsAdded(msg.sender, _amount);
}

/**
 * @notice Withdraws funds from the user's balance
 * @param _amount The amount to withdraw
 */
function withdrawFunds(uint256 _amount) external nonReentrant whenNotPaused {
    if (_amount == 0) revert InvalidAmount();
    if (userBalances[msg.sender] < _amount) revert InsufficientBalance();
    
    // Update user balance
    userBalances[msg.sender] -= _amount;
    
    // Transfer tokens from contract to user
    bool success = IERC20Upgradeable(usdtToken).transfer(
        msg.sender, 
        _amount
    );
    if (!success) revert TransferFailed();
    
    emit FundsWithdrawn(msg.sender, _amount);
}
```

**Implementation Notes:**
- Simple deposit and withdrawal functions
- Explicit security measures (nonReentrant, balance checks)
- Clear error handling and event emissions
- Clean integration with ERC20 tokens
- Minimal complexity for basic fund management

**Deferred to Post-MVP:**
- Multiple token support
- Advanced withdrawal options (scheduled, partial)
- Fee-based incentives or penalties
- Deposit/withdrawal limits or tiers

## 3. State Transitions

### 3.1 Fight Lifecycle

```
[Fight Creation] → [Pending] → [Completed] → [Settled]
```

**Streamlined States:**
- **Pending** - Fight created, betting open
- **Completed** - Result submitted, payouts calculated
- **Settled** - Payouts distributed, fight concluded

**Diagram Details:**
- Fight creation: Admin creates fight with basic details
- Pending → Completed: Admin submits result after fight ends
- Completed → Settled: Automatic transition during result submission

**Implementation Note:**
- Uses a single uint8 status field (0=Pending, 2=Completed)
- Settled status tracked separately as it's purely an accounting concern
- Eliminated intermediate states from original complex design
- No dispute process or oracle confirmation stages

**Deferred to Post-MVP:**
- Fight cancellation status
- Multiple state transitions for dispute handling
- Escrow or timelock periods
- Complex state model for multi-phase result verification

### 3.2 Bet States

```
[Bet Placement]
      ↓
[Pending Bet (Partially Matched)] → [Fight Completed]
      ↓                                   ↓
[Matched Portion]                    [Settlement]
      ↓                                   ↓
[Awaiting Result]                [Payout/Refund]
```

**Bet State Notes:**
- Bets are placed and immediately matched where possible
- Unmatched portions can be matched by subsequent opposing bets
- No explicit status field - bet state determined by matchedAmount and fight status
- Bets don't change after fight completion - just processed during settlement

**Implementation Note:**
- Simplifies original implementation by eliminating bet cancellation
- Relies on flag field for minimal state rather than separate statuses
- Matches occur opportunistically, not as separate state transitions

**Deferred to Post-MVP:**
- Bet modification or cancellation flows
- Partial betting/matching scenarios
- Bet expiration mechanisms
- Complex state transitions for advanced betting strategies

### 3.3 Fund Flow

```
User Funds Flow:
[External Wallet] ↔ [Platform Balance] → [Bet Placement] → [Settlement]
                                                              ↓
                                                         [Payout/Refund]

Platform Fees Flow:
[User Winning Payout] → [Fee Collection] → [Platform Treasury]
```

**Flow Notes:**
- Users deposit funds to platform balance
- Platform balance used to place bets
- Payouts and refunds go back to platform balance
- Users can withdraw from platform balance to external wallet
- Platform fees collected during settlement

**Implementation Note:**
- Simplified from original design with fewer steps
- Clear separation of user balance and bet states
- Direct path from bet to settlement to payout

**Deferred to Post-MVP:**
- Multiple token handling
- Fee distribution to stakeholders
- Escrow or vesting mechanisms
- Advanced treasury management

## 4. Security Model

### 4.1 Access Control

```solidity
// Admin functions - platform management
function createFight(...) external onlyAdmin { ... }
function submitResult(...) external onlyAdmin { ... }
function pause() external onlyAdmin { ... }
function unpause() external onlyAdmin { ... }
function changeAdmin(...) external onlyAdmin { ... }
function emergencyWithdraw(...) external onlyAdmin { ... }

// User functions - betting and fund management
function placeBet(...) external nonReentrant whenNotPaused { ... }
function addFunds(...) external whenNotPaused { ... }
function withdrawFunds(...) external nonReentrant whenNotPaused { ... }
function getUserStats(...) external view { ... }
function getFightInfo(...) external view { ... }
```

**Access Control Specifications:**
- Clear separation between admin and user functions
- Admin functions protected by onlyAdmin modifier
- Financial user functions protected by nonReentrant and whenNotPaused modifiers
- View functions accessible to all
- Simplified admin model with backup admin (vs. complex multi-sig in original)

**Critical Invariants:**
1. Only admins can create fights and submit results
2. Users can only bet on valid fights before betting closes
3. Users can only withdraw funds they actually own
4. Fight statuses move forward, never backward
5. All payouts and refunds must equal the amount collected (minus fees)

**Deferred to Post-MVP:**
- Role-based access control with multiple permission levels
- Time-locked admin operations
- Multi-signature requirements for critical functions
- Advanced delegation patterns

### 4.2 Security Mechanisms

```solidity
// Emergency pause
function pause() external onlyAdmin {
    _pause();
    emit Paused(msg.sender);
}

function unpause() external onlyAdmin {
    _unpause();
    emit Unpaused(msg.sender);
}

// Emergency fund recovery (extreme situations only)
function emergencyWithdraw(address _token, uint256 _amount) external onlyAdmin {
    if (_token == address(usdtToken)) {
        // For platform token, ensure we maintain sufficient balance for user funds
        uint256 totalUserBalances = _calculateTotalUserBalances();
        if (_amount > IERC20Upgradeable(_token).balanceOf(address(this)) - totalUserBalances) {
            revert InsufficientWithdrawableBalance();
        }
    }
    
    bool success = IERC20Upgradeable(_token).transfer(admin, _amount);
    if (!success) revert TransferFailed();
    
    emit EmergencyWithdraw(_token, _amount, admin);
}

// ReentrancyGuard on all fund-related functions
function withdrawFunds(uint256 _amount) external nonReentrant whenNotPaused {
    // Implementation with reentrancy protection
}
```

**Security Notes:**
- Pausable functionality for emergency stops
- ReentrancyGuard for all external financial functions
- Strict input validation on all functions
- Balance checks before transfers
- Emergency fund recovery with user balance protection
- Clear error handling and event emissions

**Deferred to Post-MVP:**
- Upgradeable proxy patterns
- Advanced circuit breakers
- Formal verification of critical functions
- Automated security monitoring and alerts

## 5. Architecture Diagram

### 5.1 Component Diagram

```
                     +------------------+
                     |                  |
                     |   Shin2Chin      |
                     |                  |
                     +--------+---------+
                              |
              +---------------+---------------+
              |               |               |
    +---------v------+ +------v--------+ +----v-----------+
    |                | |               | |                |
    | Fight Manager  | | Betting System| | Fund Manager   |
    |                | |               | |                |
    +----------------+ +---------------+ +----------------+
    | - createFight  | | - placeBet    | | - addFunds     |
    | - submitResult | | - matchBets   | | - withdrawFunds|
    | - getFightInfo | | - getUserStats| |                |
    +----------------+ +---------------+ +----------------+
              ^               ^               ^
              |               |               |
    +---------+---------------+---------------+-------+
    |                                                 |
    |             External Interfaces                 |
    | (Admin Panel, User UI, Event Subscribers)       |
    +-------------------------------------------------+
```

**Architecture Notes:**
- Single contract with logical component separation
- Clear responsibilities for each module
- Minimal cross-module dependencies
- Simple external interfaces

**Deferred to Post-MVP:**
- Multiple contract architecture with proxies
- External oracle integrations
- Cross-chain functionality
- Advanced data indexing and analytics

### 5.2 Event Emissions

```solidity
// Essential events for frontend integration
event FightCreated(uint256 indexed fightId, uint256 startTime, string fighterA, string fighterB);
event BetPlaced(uint256 indexed fightId, address indexed bettor, uint256 amount, uint256 matchedAmount, bool side);
event BetMatched(uint256 indexed fightId, uint256 betIndex, uint256 matchedAmount);
event FightResultSubmitted(uint256 indexed fightId, bool winnerSide);
event FightSettled(uint256 indexed fightId, bool winnerSide, uint256 platformFees);
event BetPayout(address indexed bettor, uint256 amount, uint256 indexed fightId);
event BetRefund(address indexed bettor, uint256 amount, uint256 indexed fightId);
event FundsAdded(address indexed user, uint256 amount);
event FundsWithdrawn(address indexed user, uint256 amount);
event Paused(address account);
event Unpaused(address account);
```

**Event Design Notes:**
- Essential indexing for efficient querying
- Clear, specific events for important state changes
- Events designed for frontend synchronization
- Focused on critical user and admin actions

**Deferred to Post-MVP:**
- Detailed analytics events
- Granular state change notifications
- Complex event subscription patterns
- Historical data archiving events

## 6. MVP Feature Boundaries

### Included in MVP
- Create and manage basic fights
- P2P bet placement and matching
- Simple admin result submission
- Automatic settlement and payouts
- Basic fund management (deposit/withdraw)
- Platform fee collection
- Emergency pause mechanisms
- Critical event emissions

### Deferred to Post-MVP
- Fighter statistics and records
- Categorization and metadata
- Complex betting types or conditions
- Tiered fee structures
- Multiple currency support
- Dispute resolution mechanisms
- Advanced admin controls
- Detailed analytics and reporting
- User profiles and preferences
- Fancy UI elements

## 7. Implementation Approach

This solution design prioritizes:
1. **Gas Efficiency** - Optimized data structures, minimal state changes
2. **Security** - Clear invariants, proper modifiers, carefully designed access control
3. **Simplicity** - Minimal viable states and transitions
4. **Core Functionality** - P2P betting, fight management, settlement

The implementation follows our Phase 1 progress - building on the interfaces and data structures already designed while aggressively simplifying to focus on the essential betting experience. By deferring non-essential features to post-MVP phases, we can deliver a working platform faster and with lower complexity.