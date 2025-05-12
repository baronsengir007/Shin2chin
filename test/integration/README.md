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