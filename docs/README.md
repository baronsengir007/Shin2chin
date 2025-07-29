# Shin2Chin Betting Platform Documentation

## Project Status: Phase A - Foundation (Week 1 of 13)

### Phase-Based Development Structure
The project follows a **4-phase development approach** with parallel development streams for maximum efficiency:

- **Phase A (Weeks 1-3):** Foundation - Solana programs + Anchor client ← *Current*
- **Phase B (Weeks 4-6):** Integration - MVBP with wallet connection
- **Phase C (Weeks 7-10):** Core Features - Gary AI + User Stories 1&3  
- **Phase D (Weeks 11-13):** Advanced - Oracle integration + Full automation

**Target:** Working demo (MVBP) by Week 6, full platform by Week 13

### Essential Documentation
- [Phase Roadmap](./PHASE_ROADMAP.md) - Complete phase-based development plan
- [MVBP Specification](./MVBP_SPECIFICATION.md) - 6-week target definition
- [Project Status](./PROJECT_STATUS.md) - Current phase progress
- [Development Guide](./DEVELOPMENT_GUIDE.md) - Phase A workflow and setup
- [User Stories](./USER_STORIES.md) - Core requirements
- [Architecture](./ARCHITECTURE.md) - System design
- [Project Planning](./PROJECT_PLANNING.md) - Archived linear plan + restructuring notes

### Current Phase A Focus
**Priority Stream:** Solana program implementation (70% effort)
- Complete betting program with PDAs
- Basic settlement logic
- Devnet deployment and testing

**Support Stream:** Frontend mock services (30% effort)
- React TypeScript structure completion
- Mock service layer for development
- Basic UI components without wallet integration

### Phase A Quick Start
All tools installed and verified:
- Solana CLI 1.18.26
- Anchor 0.31.1  
- Rust 1.87.0
- Node.js 22.15.0

**For Solana Development (Primary Focus):**
```bash
# Setup and build programs
git clone <repository-url>
cd shin2chin-solana
npm install
anchor build

# Start local validator (separate terminal)
solana-test-validator

# Deploy and test programs
anchor deploy
anchor test --skip-local-validator
```

**For Frontend Development (Mock Services):**
```bash
# Install and run with mock data
cd app
npm install
npm start
# Note: No wallet connection required in Phase A
```

See [Development Guide](./DEVELOPMENT_GUIDE.md) for detailed Phase A workflow.

### Project Structure
```
shin2chin-solana/
├── programs/            # Solana smart contracts
│   ├── betting/         # P2P betting program
│   └── oracle/          # Result verification program
├── app/                 # User-facing frontend
├── admin/               # Admin interface
├── sdk/                 # TypeScript SDK
└── tests/               # Integration tests
```

### Next Development Steps
**Phase A Priorities (Current):**
1. Complete Solana betting program implementation
2. Setup Program Derived Accounts (PDAs)  
3. Implement basic settlement logic
4. Deploy and test on devnet

See [Phase Roadmap](./PHASE_ROADMAP.md) for complete development plan and [Project Status](./PROJECT_STATUS.md) for current progress tracking.