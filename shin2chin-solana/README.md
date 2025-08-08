# ⚡ Backend (Solana Smart Contracts)

Dit is de **Solana backend** van Shin2Chin Bets.

## 🏗️ Wat zit hier?

- **Solana Smart Contracts** (Anchor framework)
- **Betting Logic** - create events, place bets
- **Oracle Integration** - voor resultaten
- **Backend Services** - hooks en utilities

## 🚀 Hoe te gebruiken?

```bash
# Build smart contracts
anchor build

# Run tests
anchor test

# Deploy to localnet
anchor deploy
```

## 📁 Structuur

```
programs/
├── shin2chin_betting/  # 🎯 HOOFD CONTRACT - Betting logic
├── oracle/             # 🔮 Oracle voor resultaten
└── betting/            # 📊 Extra betting features

app/                    # 🛠️ Backend services & hooks
admin/                  # 🔧 Admin tools
```

## 🔗 Connectie met Frontend

Deze backend wordt aangeroepen door de React app in `../frontend/`
