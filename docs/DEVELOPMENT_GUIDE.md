# Development Guide

## Development Workflow

### Prerequisites
- Solana CLI tools
- Anchor Framework
- Node.js and npm
- Rust and Cargo

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shin2chin-solana
   ```

2. **Install dependencies**
   ```bash
   # Root dependencies
   npm install
   
   # App dependencies
   cd app
   npm install
   
   # Admin dependencies
   cd ../admin
   npm install
   ```

3. **Setup local Solana validator**
   ```bash
   solana-test-validator
   ```

4. **Build Solana programs**
   ```bash
   anchor build
   ```

5. **Deploy to local network**
   ```bash
   anchor deploy
   ```

6. **Run frontend application**
   ```bash
   cd app
   npm start
   ```

7. **Run admin interface**
   ```bash
   cd admin
   npm start
   ```

## Development Standards

### Code Organization
- **Frontend**: Follow React component best practices with separation of concerns
- **Smart Contracts**: Modular Rust code with clear state/instruction separation
- **Tests**: Unit tests for each component, integration tests for workflows

### Commit Standards
Follow conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `test:` for test additions or changes
- `refactor:` for code refactoring

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Submit PR with descriptive title and details
4. Wait for CI checks and code review
5. Merge after approval

## Key Architectural Principles

1. **Conversational First**: All user interactions should be possible through Gary AI
2. **Non-Custodial**: No user funds held in smart contract beyond active bets
3. **Minimal UI**: Focus on essential information only
4. **Direct Wallet Integration**: Seamless wallet connection and transaction flow
5. **Oracle Automation**: All settlements through verified oracles

## Testing Strategy

### Unit Tests
- Smart contract instruction tests
- React component tests
- Service/hook tests

### Integration Tests
- End-to-end betting flows
- Wallet connection flows
- Settlement and payout flows

### Test Environment
- Local Solana validator
- Mock HeyAnon API for testing
- Simulated wallet connections