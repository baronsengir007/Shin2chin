# Shin2Chin Development Guide

This guide provides instructions for setting up the development environment and working with the Shin2Chin betting platform.

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

### 1. Start Local Validator
```bash
# In a separate terminal
solana-test-validator
```

### 2. Build and Deploy Programs
```bash
anchor build
anchor deploy
```

### 3. Run Tests
```bash
anchor test
```

### 4. Run Frontend Application
```bash
cd app
npm start
```

### 5. Run Admin Interface
```bash
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