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