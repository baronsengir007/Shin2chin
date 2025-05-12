# Shin2Chin Betting Platform

A peer-to-peer betting platform for combat sports built on Ethereum/Arbitrum using Solidity.

## Project Status

This project is currently undergoing a significant redesign to simplify the architecture while preserving core functionality. 

### Versions

- **Main Branch**: Contains the redesigned implementation focusing on simplified architecture, improved gas efficiency, and maintainability.
- **Legacy Branch**: The original implementation is preserved in the `legacy-implementation` branch.

To create the legacy branch (for development team):
```bash
git checkout -b legacy-implementation
git push -u origin legacy-implementation
```

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
   npx hardhat test
   ```

4. Deploy locally
   ```bash
   npx hardhat run scripts/deploy.js
   ```

## Project Structure

- `contracts/`: Smart contract source code
  - `interfaces/`: Contract interfaces
  - `libraries/`: Shared libraries and utilities
- `scripts/`: Deployment and maintenance scripts
- `test/`: Test files
  - `unit/`: Unit tests for individual components
  - `integration/`: Integration tests for full workflows
- `docs/`: Documentation

## License

ISC

## Redesign Initiative

The current redesign focuses on:
1. Simplifying the betting mechanism while preserving P2P functionality
2. Optimizing for gas efficiency
3. Improving maintainability and upgradeability
4. Enhancing testing coverage
5. Streamlining admin functionality

This README will be updated as the redesign progresses.