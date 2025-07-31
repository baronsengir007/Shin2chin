# Shin2Chin - AI-Powered P2P Crypto Betting on Solana

> **🚀 Now on Solana Blockchain** - Migrated from Ethereum for better performance and lower costs

## Overview

Shin2Chin is an AI-powered, non-custodial, peer-to-peer crypto betting platform built on Solana. The platform allows users to place binary bets on combat sports events through natural conversation with Gary, our AI betting assistant.

## 🎯 Key Features

- **🤖 AI-Powered Betting**: Chat with Gary in natural language to place bets
- **🔒 Non-Custodial**: Individual escrow PDAs - your SOL stays secure
- **⚡ Peer-to-Peer**: Direct user-to-user betting without intermediaries
- **🎲 Binary Betting**: Simple Team A vs Team B wagering
- **⏱️ Instant Settlement**: Automated payouts via oracle integration
- **🔐 Solana Security**: Built with Anchor framework best practices

## 🏗️ Architecture

### Solana Programs
- **Betting Program**: Core betting logic with individual PDA escrow
- **Oracle Program**: Automated event settlement and payouts
- **Event Management**: Admin-controlled event creation and management

### Frontend (React + TypeScript)
- **Gary AI Interface**: Natural language betting conversation
- **Wallet Integration**: Phantom, Solflare, and other Solana wallets
- **Admin Dashboard**: Event creation and management interface

## 📊 Current Status: Phase A Complete

✅ **Event Account Structure** - Complete PDA system with oracle integration  
✅ **Create Event Instruction** - Admin event creation with full validation  
✅ **Bet Account Structure** - Individual SOL escrow mechanism  
✅ **Place Bet Instruction** - Complete betting flow with security validation  
✅ **Comprehensive Testing** - 450+ lines of TypeScript test coverage  
✅ **Security Analysis** - Passed Semgrep security validation  

**Next: Phase B Integration** - Frontend wallet connection and Gary AI

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Rust & Cargo
- Solana CLI tools
- Anchor Framework 0.31+

### Quick Start

```bash
# Clone repository
git clone https://github.com/baronsengir007/Shin2chin.git
cd Shin2chin/shin2chin-solana

# Install dependencies
npm install

# Build Solana programs
anchor build

# Run tests
anchor test
```

## 🧪 Testing

Comprehensive test suite covering:
- ✅ Event creation and validation
- ✅ Bet placement with SOL escrow
- ✅ Security attack vectors
- ✅ Integration scenarios
- ✅ Error handling coverage

```bash
cd shin2chin-solana
anchor test
```

## 🚀 Deployment

Built for Solana mainnet deployment with:
- Production-ready Anchor programs
- Comprehensive security validations
- Gas-optimized instructions
- Oracle integration ready

## 🔒 Security

- **Individual Escrow**: Each bet creates its own PDA
- **Admin Restrictions**: Admins cannot bet on own events
- **Overflow Protection**: Safe arithmetic operations
- **Input Validation**: Comprehensive parameter checking
- **Oracle Validation**: Secure settlement mechanisms

## 🤝 Contributing

Built with Claude Code AI assistance following Solana and Anchor best practices.

## 📄 License

ISC License - Built for the Solana ecosystem

---

**🌟 Shin2Chin: Where AI meets P2P betting on Solana**