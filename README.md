# Shin2Chin Betting Platform

A peer-to-peer betting platform for combat sports built on Ethereum/Base using Solidity.

> **Note:** This project is being developed by a single developer with the assistance of coding assistants, following a documented redesign process.

## Project Status

This project has successfully completed Phase 1 (Cleanup & Foundation) of our redesign initiative, which focused on simplifying the architecture while preserving core P2P betting functionality.

### Official Documentation

- [Solution Design Document](docs/solution_design.md) - The official blueprint for our implementation
- [Project Board](docs/project_board.md) - Tracking phases, tasks, and progress

### Versions

- **Main Branch**: Contains the redesigned implementation focusing on simplified architecture, improved gas efficiency, and maintainability.
- **Legacy Branch**: The original implementation is preserved in the `legacy-implementation` branch.

## Core Features

- User-to-user (P2P) betting on fighting matches
- Multiple concurrent fights management
- Automatic matching of bets between opposing sides
- Secure fund management using USDT
- Automated payout distribution

## Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/shin2chin_bets.git
   cd shin2chin_bets
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Run tests
   ```bash
   npm run test               # Run all tests
   npm run test:coverage      # Run tests with coverage report
   npm run test:gas           # Run tests with gas reporting
   ```

4. Linting and formatting
   ```bash
   npm run lint               # Check code with solhint
   npm run lint:fix           # Fix linting issues
   npm run prettier           # Format code
   ```

5. Deployment
   ```bash
   npm run deploy:local       # Deploy to local Hardhat network
   npm run deploy:testnet     # Deploy to Base testnet
   ```

## Project Structure

- `contracts/`: Smart contract source code
  - `interfaces/`: Contract interfaces
  - `libraries/`: Shared libraries and utilities
  - `test/`: Test contracts like mocks
- `scripts/`: Deployment and maintenance scripts
- `test/`: Test files
  - `unit/`: Unit tests for individual components
  - `integration/`: Integration tests for full workflows
  - `helpers/`: Test helper functions
- `docs/`: Documentation files
- `.github/workflows/`: CI/CD configuration

## Implementation Approach

Our implementation follows the phased approach outlined in the [Project Board](docs/project_board.md):

1. **Phase 1: Cleanup & Foundation** ✅
   - Project structure and backup
   - Simplified contract design
   - Testing framework and CI/CD

2. **Phase 2: Core Contract Refactoring** 🔄
   - Implementing core betting functionality
   - Fight management
   - P2P bet matching

3. **Phase 3: Testing & Security** ⏱️
   - Comprehensive test coverage
   - Gas optimization
   - Security auditing

4. **Phase 4: Documentation & Deployment** ⏱️
   - Technical documentation
   - Deployment scripts
   - End-to-end testing

## License

ISC