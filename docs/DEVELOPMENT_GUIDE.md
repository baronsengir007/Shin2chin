# Shin2Chin Development Guide

This guide provides instructions for setting up the development environment and working with the Shin2Chin betting platform using our phase-based development approach.

## Phase-Based Development Approach

The project follows a structured 4-phase development model with parallel development streams:

- **Phase A (Weeks 1-3):** Foundation - Solana programs + Anchor client
- **Phase B (Weeks 4-6):** Integration - MVBP with wallet connection
- **Phase C (Weeks 7-10):** Core Features - Gary AI + User Stories 1&3
- **Phase D (Weeks 11-13):** Advanced - Oracle integration + Full automation

### Current Phase: Phase A - Foundation

**Priority Focus:** Solana program implementation and basic Anchor client setup
**Target:** Working event creation and betting on devnet by Week 3

### Parallel Development Streams

#### Stream 1: Solana Development (Primary focus in Phase A)
- Complete betting program implementation
- Set up Program Derived Accounts (PDAs)
- Deploy and test on devnet
- Basic settlement logic

#### Stream 2: Frontend Development (Mock services in Phase A)
- React TypeScript structure
- Mock service layer for development
- Basic UI components without wallet integration
- Local development setup

#### Stream 3: Support Systems
- Testing framework setup
- Documentation updates
- Development tooling

## Prerequisites

- **Rust & Cargo (v1.87.0+)** - For Solana program development
- **Solana CLI (v1.18.x)** - For blockchain interaction
- **Anchor Framework (v0.31.x)** - For smart contract development
- **Node.js (v18+) & npm** - For frontend development

## Installation

### 1. Install Rust and Cargo
```bash
# Windows (PowerShell)
Invoke-WebRequest -Uri https://sh.rustup.rs -UseBasicParsing | Invoke-Expression
# or
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Verify installation
rustc --version
cargo --version
```

### 2. Install Solana CLI Tools
```bash
# Windows (PowerShell) - using GitHub release (recommended)
Invoke-WebRequest -Uri "https://github.com/solana-labs/solana/releases/download/v1.18.26/solana-install-init-x86_64-pc-windows-msvc.exe" -OutFile "$env:TEMP\solana-install.exe"
& "$env:TEMP\solana-install.exe" v1.18.26

# Add to PATH
$env:PATH = "$env:LOCALAPPDATA\solana\install\active_release\bin;$env:PATH"

# Verify installation
solana --version
```

### 3. Install Anchor Framework
```bash
# Using cargo
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked --tag v0.30.1

# Verify installation
anchor --version
```

### 4. Configure Solana for Local Development
```bash
solana config set --url localhost
solana-keygen new --no-bip39-passphrase
```

### 5. Project Setup
```bash
# Clone repository
git clone <repository-url>
cd shin2chin-solana

# Install project dependencies
npm install

# Install frontend dependencies
cd app
npm install
cd ../admin
npm install
cd ..

# Build Solana programs
anchor build
```

## Development Workflow

### Phase A Workflow (Current)

#### For Solana Development (Primary Stream)
```bash
# 1. Start Local Validator
solana-test-validator

# 2. Build and Deploy Programs
anchor build
anchor deploy

# 3. Run Solana-specific Tests
anchor test --skip-local-validator
```

#### For Frontend Development (Mock Services)
```bash
# 1. Run Frontend with Mock Services
cd app
npm start

# 2. Use mock data for development
# (No wallet connection required in Phase A)
```

#### Parallel Stream Coordination
- **Daily standups:** Sync between Solana and Frontend streams
- **Weekly demos:** Show Phase A progress to stakeholders
- **Integration points:** Test mock services against real Solana programs

### Standard Development Commands

#### General Development
```bash
# Start Local Validator
solana-test-validator

# Build and Deploy Programs
anchor build
anchor deploy

# Run Tests
anchor test

# Run Frontend Application
cd app
npm start

# Run Admin Interface
cd admin
npm start
```

## Project Structure

```
shin2chin-solana/
├── programs/               # Solana smart contracts
│   ├── betting/            # P2P betting program
│   │   ├── src/
│   │   │   ├── lib.rs      # Program entry point
│   │   │   ├── state.rs    # Account definitions
│   │   │   ├── errors.rs   # Error definitions
│   │   │   └── instructions/  # Instruction handlers
│   │   └── Cargo.toml      # Rust dependencies
│   └── oracle/             # Result verification program
├── app/                    # User-facing frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # Service integrations
│   │   │   ├── ai/         # Gary AI integration
│   │   │   └── program/    # Solana program integration
│   │   └── pages/          # App pages
│   └── package.json        # Frontend dependencies
├── admin/                  # Admin interface
├── sdk/                    # TypeScript SDK
├── tests/                  # Integration tests
│   ├── betting.ts          # Betting program tests
│   └── integration.ts      # End-to-end tests
└── Anchor.toml             # Anchor configuration
```

## Development Standards

### Package Naming
- Use `@coral-xyz/anchor` instead of `@project-serum/anchor` (updated package)
- Use `@solana/web3.js` for Solana blockchain interaction

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

## Known Issues and Workarounds

### Solana CLI Installation
- If the default installer fails, try installing directly from GitHub releases
- Windows users may need to run the installer with administrator privileges

### Anchor Build Issues
- Ensure Rust version is at least 1.87.0
- Anchor version is locked at 0.30.1 for compatibility

### Gary AI Integration
- The HeyAnon SDK integration is currently stubbed
- Development can proceed with the placeholder implementation

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