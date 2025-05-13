# Unit Tests

This directory contains unit tests for individual components of the Shin2Chin betting platform.

## Purpose

Unit tests focus on testing isolated pieces of functionality:

1. **Isolation** - Test individual functions and components in isolation
2. **Coverage** - Ensure all code paths are exercised
3. **Regression Prevention** - Catch bugs early during development
4. **Documentation** - Serve as executable examples of how functions should behave

## Structure

Tests are organized by component:

- `FightManager.test.js` - Tests for fight creation and management
- `BettingSystem.test.js` - Tests for bet placement and matching
- `FundManager.test.js` - Tests for funds management
- `Admin.test.js` - Tests for administrative functions

## Running Tests

```bash
# Run all unit tests
npx hardhat test test/unit/*.test.js

# Run a specific test file
npx hardhat test test/unit/FightManager.test.js
```

## Writing Tests

Tests should:
- Focus on a single functionality
- Be independent and idempotent
- Include both positive and negative test cases
- Have clear assertions and meaningful error messages

## Tests and User Stories

These tests verify that the implementation fulfills our core user stories. When adding or modifying tests, ensure they validate specific acceptance criteria from our user stories as defined in `docs/user_stories.md`.

## User Story Coverage

Each test suite focuses on verifying specific aspects of our user stories:

- **Bettor Story**: Tests for deposit, bet placement, matching, payouts, refunds, and withdrawal
- **Admin Story**: Tests for fight creation, result submission, and platform control
- **Operator Story**: Tests for fee collection, tracking, and management

### Test Organization

Tests are organized by architectural component, each mapped to user stories:

- **Initialization**: Basic setup and configuration
- **Fight Management**: Admin user story (fight creation and management)
- **Betting System**: Bettor user story (bet placement and matching)
- **Result Submission**: Admin user story (result submission) and Bettor user story (winning determination)
- **Settlement System**: Bettor user story (payouts and refunds) and Operator user story (fee collection)
- **Fund Management**: Bettor user story (deposits and withdrawals)
- **Admin Functions**: Admin user story (platform control functions)

When adding new tests, please tag them with the user story they verify.