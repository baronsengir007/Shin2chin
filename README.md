# Shin2Chin Bets - AI-Powered P2P Crypto Betting

## 🏗️ Project Structure

```
Shin2Chin_bets/
├── frontend/                    # 🎨 React Frontend Application
│   ├── src/
│   │   ├── components/         # UI Components (betting, events, wallet)
│   │   ├── stores/            # Zustand state management
│   │   ├── hooks/             # Custom React hooks
│   │   └── core/              # Configuration & utilities
│   └── package.json           # Frontend dependencies
│
├── shin2chin-solana/           # ⚡ Solana Backend (Smart Contracts)
│   ├── programs/
│   │   ├── shin2chin_betting/ # Main betting contract
│   │   ├── oracle/            # Oracle for results
│   │   └── betting/           # Additional betting features
│   ├── app/                   # Backend services & hooks
│   └── admin/                 # Admin tools
│
└── README.md                  # This file
```

## 🚀 Quick Start

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Solana Development
```bash
cd shin2chin-solana
anchor build
anchor test
```

## 🎯 Development Philosophy

- **Solo Development**: Everything in `main` branch for simplicity
- **Clear Separation**: Frontend (React) ↔ Backend (Solana)
- **Modern Stack**: Vite + React 18 + TypeScript + Zustand + Anchor
