# Integration Tests

This directory contains integration tests for the Shin2Chin betting platform, focusing on end-to-end workflows and component interactions.

## Purpose

Integration tests verify that different components work together correctly:

1. **Component Interaction** - Test how different parts of the system interact
2. **End-to-End Flows** - Verify complete user journeys function as expected
3. **State Management** - Ensure complex state transitions work correctly
4. **Edge Cases** - Test boundary conditions in real-world scenarios

## Structure

Tests are organized by workflow:

- `BettingFlow.test.js` - End-to-end betting process tests
- `SettlementFlow.test.js` - Tests for fight settlement and payout distribution
- `AdminFlow.test.js` - Administrative workflow tests
- `FundFlow.test.js` - Tests for deposits, withdrawals, and fund management

## Running Tests

```bash
# Run all integration tests
npx hardhat test test/integration/*.test.js

# Run a specific test file
npx hardhat test test/integration/BettingFlow.test.js
```

## Writing Tests

Integration tests should:
- Focus on complete workflows rather than individual functions
- Set up realistic scenarios that mimic real user behavior
- Test the interaction between multiple components
- Verify the final state after a series of operations
- Include error paths and recovery scenarios

## Tests and User Stories

These tests verify end-to-end workflows that fulfill our core user stories. When adding or modifying tests, ensure they validate complete user journeys as defined in `docs/user_stories.md`.

## User Story Workflows

Each integration test validates a complete user journey:

- **BettingFlow.test.js**: Validates the complete betting workflow from fight creation to settlement, covering:
  - Admin user story: Creating fights and submitting results
  - Bettor user story: Depositing funds, placing bets, receiving payouts/refunds
  - Operator user story: Fee collection on winning bets

- **SettlementFlow.test.js**: Validates the settlement process, covering:
  - Admin user story: Submitting results
  - Bettor user story: Receiving winnings and refunds
  - Operator user story: Fee collection and tracking

- **AdminFlow.test.js**: Validates administrative operations, covering:
  - Admin user story: Platform management and emergency controls

- **FundFlow.test.js**: Validates funds movement, covering:
  - Bettor user story: Deposits and withdrawals
  - Operator user story: Platform fund management

### Test Scenarios

Tests include various scenarios to verify acceptance criteria:

1. **Complete betting cycle**
   - Verifies payouts to winning bettors and fee collection
   
2. **Partially matched bets**
   - Verifies refunds for unmatched portions

3. **Multiple users with matched bets**
   - Verifies bet matching across multiple users

When adding new integration tests, ensure they validate specific acceptance criteria from our user stories.