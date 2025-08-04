# Shin2Chin Frontend

A React TypeScript frontend for the Shin2Chin betting platform built on Solana.

## 🏗️ Architecture Status

**Layer 1: Core Foundation** ✅ **COMPLETE**
- Vite + React 18 + TypeScript
- Solana development environment
- Core configuration and utilities
- Project structure established

**Layer 2: State Management** 🔄 **PENDING**
- Zustand state management
- Blockchain integration
- Account subscriptions

**Layer 3: Components** 🔄 **PENDING**
- User story components
- UI component library
- Security patterns

**Layer 4: Integrations** 🔄 **PENDING**
- HeyAnon SDK integration
- Wallet adapters
- External services

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Solana CLI
- Local Solana validator (for development)

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development Scripts
```bash
# Frontend development
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # TypeScript type checking
npm run lint         # ESLint code linting

# Solana integration
npm run solana:build    # Build Solana programs
npm run solana:test     # Run Solana tests
npm run solana:localnet # Start local validator
```

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── core/           # Layer 1: Foundation
│   │   ├── config/     # Environment configuration
│   │   ├── types/      # TypeScript definitions
│   │   └── utils/      # Core utilities
│   ├── blockchain/     # Layer 2: Solana integration (pending)
│   ├── state/          # Layer 2: State management (pending)
│   ├── components/     # Layer 3: UI components (pending)
│   ├── pages/          # Layer 3: Route components (pending)
│   └── integrations/   # Layer 4: External APIs (pending)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🔧 Configuration

### Environment Variables
- `NODE_ENV`: Environment (development/production)
- Custom variables can be added to `src/core/config/index.ts`

### Solana Configuration
- **Development**: Uses devnet by default
- **Production**: Uses mainnet-beta
- **Local**: Can connect to local validator at `http://127.0.0.1:8899`

## 🧪 Development Workflow

1. **Layer 1**: Core foundation (COMPLETE)
2. **Layer 2**: State management and blockchain integration
3. **Layer 3**: Component development and UI
4. **Layer 4**: External integrations and services

## 📝 Layer 1 Implementation Details

### Technology Stack
- **Build System**: Vite for fast development and optimized builds
- **Framework**: React 18 with TypeScript strict mode
- **Styling**: CSS with responsive design patterns
- **Package Management**: npm with optimized dependency resolution

### Core Features
- **Configuration Management**: Centralized config with environment detection
- **Logging**: Structured logging utility for development and debugging
- **Type Safety**: Comprehensive TypeScript definitions
- **Error Handling**: Standardized error creation and handling utilities

### Solana Integration Preparation
- **@coral-xyz/anchor**: Ready for program interaction
- **@solana/web3.js**: Configured for wallet and transaction handling
- **IDL Support**: Vite configured for JSON module resolution

## 🔗 Integration Points

### Backend Integration
- Solana programs at `../shin2chin-solana/programs/`
- Build scripts coordinate with Anchor development workflow
- IDL files will be imported for type-safe program interaction

### Future Integrations
- **HeyAnon SDK**: Prepared integration points for conversational AI
- **Wallet Adapters**: Ready for Phantom, Solflare, and other Solana wallets
- **Real-time Updates**: Architecture prepared for account subscriptions

---

**Status**: Layer 1 Foundation Complete ✅
**Next**: Layer 2 State Management Implementation