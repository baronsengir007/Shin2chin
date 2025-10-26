# Shin2Chin DevNet Deployment - Installatie Check Resultaat

**Datum**: October 25, 2025
**Computer**: /home/user/Shin2chin

---

## ✅ Geïnstalleerde Tools

### Node.js & npm ✅
- **Node.js**: v22.20.0 ✅ (Vereist: 18.x of hoger)
- **npm**: 10.9.3 ✅ (Vereist: 9.x of hoger)
- **Status**: Perfect! Nieuwer dan vereist

### Rust & Cargo ✅
- **Cargo**: 1.90.0 ✅
- **Rustc**: 1.90.0 ✅
- **Status**: Perfect! Nodig voor Anchor compilatie

---

## ❌ Ontbrekende Tools

### Solana CLI ❌
- **Status**: NIET GEÏNSTALLEERD
- **Vereist**: 1.18.x of hoger
- **Gebruik**: Deploy naar Solana blockchain, wallet management
- **Prioriteit**: **KRITIEK** - Kan niet deployen zonder

### Anchor CLI ❌
- **Status**: NIET GEÏNSTALLEERD
- **Vereist**: 0.31.1
- **Gebruik**: Build en deploy Solana smart contracts
- **Prioriteit**: **KRITIEK** - Kan niet deployen zonder

### Solana Wallet ❌
- **Status**: Geen wallet gevonden
- **Locatie**: ~/.config/solana/ bestaat niet
- **Gebruik**: Deploy en transacties signeren
- **Prioriteit**: **KRITIEK** - Nodig voor deployment

---

## 📋 Installatie Instructies

### Stap 1: Installeer Solana CLI (5-10 minuten)

```bash
# Download en installeer Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Voeg Solana toe aan je PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Voeg permanent toe aan je shell profile
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verificeer installatie
solana --version
# Verwacht: solana-cli 1.18.x of hoger
```

**Alternatief (als curl niet werkt)**:
```bash
# Download specifieke versie
wget https://github.com/solana-labs/solana/releases/download/v1.18.22/solana-release-x86_64-unknown-linux-gnu.tar.bz2

# Extract
tar jxf solana-release-x86_64-unknown-linux-gnu.tar.bz2

# Verplaats naar installatie directory
mkdir -p ~/.local/share/solana/install
mv solana-release ~/.local/share/solana/install/active_release

# Voeg toe aan PATH (zie hierboven)
```

---

### Stap 2: Installeer Anchor CLI (10-15 minuten)

**Let op**: Anchor installeren kan lang duren (10-15 minuten) omdat het vanaf source compileert.

```bash
# Installeer Anchor 0.31.1 via Cargo
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --tag v0.31.1 --locked

# Verificeer installatie
anchor --version
# Verwacht: anchor-cli 0.31.1
```

**Alternatief (AVM - Anchor Version Manager)**:
```bash
# Installeer AVM
cargo install --git https://github.com/coral-xyz/anchor avm --locked

# Gebruik AVM om Anchor 0.31.1 te installeren
avm install 0.31.1
avm use 0.31.1

# Verificeer
anchor --version
```

**Troubleshooting Anchor installatie**:
Als je errors krijgt tijdens Anchor installatie, probeer:

```bash
# Installeer build dependencies (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y pkg-config build-essential libudev-dev libssl-dev

# Of op macOS
brew install pkg-config openssl
```

---

### Stap 3: Configureer Solana Wallet (5 minuten)

```bash
# Maak Solana config directory
mkdir -p ~/.config/solana

# Genereer nieuwe wallet (of importeer bestaande)
solana-keygen new --outfile ~/.config/solana/id.json

# BELANGRIJK: Schrijf je seed phrase op en bewaar veilig!
# Je kunt je wallet alleen herstellen met deze seed phrase

# Configureer Solana CLI voor DevNet
solana config set --url https://api.devnet.solana.com
solana config set --keypair ~/.config/solana/id.json

# Verificeer configuratie
solana config get
```

**Output zou moeten zijn**:
```
Config File: /root/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /root/.config/solana/id.json
Commitment: confirmed
```

---

### Stap 4: Krijg DevNet SOL (2 minuten)

```bash
# Check je wallet adres
solana address

# Vraag 2 SOL aan van de DevNet faucet
solana airdrop 2

# Wacht 5-10 seconden en check balance
solana balance
# Verwacht: 2 SOL

# Je hebt ~5 SOL nodig voor deployment en testing
# Vraag nog een paar keer aan:
solana airdrop 2
sleep 10
solana balance
# Verwacht: 4 SOL

# Één keer nog
solana airdrop 1
sleep 10
solana balance
# Verwacht: 5 SOL of meer
```

**Als airdrop niet werkt**:
- Wacht 10-15 seconden tussen airdrops
- DevNet faucet heeft rate limiting
- Alternatief: gebruik web faucet https://faucet.solana.com/

---

## 🚀 Volledig Installatie Script (Automatisch)

Ik heb een volledig installatie script voor je gemaakt:

```bash
# Maak het script executable
chmod +x /home/user/Shin2chin/scripts/install-solana-tools.sh

# Run het script
./scripts/install-solana-tools.sh
```

Dit script zal:
1. ✅ Solana CLI installeren
2. ✅ Anchor CLI installeren (0.31.1)
3. ✅ Wallet aanmaken en configureren
4. ✅ DevNet SOL aanvragen
5. ✅ Alles verifiëren

**Tijd**: ~20-30 minuten (vooral Anchor compilatie)

---

## ✅ Verificatie Checklist

Na installatie, run deze checks:

```bash
# 1. Solana CLI
solana --version
# ✅ Moet: solana-cli 1.18.x of hoger

# 2. Anchor CLI
anchor --version
# ✅ Moet: anchor-cli 0.31.1

# 3. Solana Config
solana config get
# ✅ Moet: RPC URL = https://api.devnet.solana.com

# 4. Wallet Balance
solana balance
# ✅ Moet: 5 SOL of meer

# 5. Node.js
node --version
# ✅ Moet: v18.x of hoger (jij hebt v22.20.0)

# 6. npm
npm --version
# ✅ Moet: 9.x of hoger (jij hebt 10.9.3)

# 7. Rust
cargo --version
# ✅ Moet: 1.70.x of hoger (jij hebt 1.90.0)
```

**Alles groen?** Dan kun je deployen! 🚀

---

## 📊 Overzicht

| Tool | Status | Actie Nodig |
|------|--------|-------------|
| Node.js (v22.20.0) | ✅ Geïnstalleerd | Geen |
| npm (10.9.3) | ✅ Geïnstalleerd | Geen |
| Rust (1.90.0) | ✅ Geïnstalleerd | Geen |
| Solana CLI | ❌ Ontbreekt | **INSTALLEREN** |
| Anchor CLI | ❌ Ontbreekt | **INSTALLEREN** |
| Solana Wallet | ❌ Ontbreekt | **AANMAKEN** |
| DevNet SOL | ❌ Ontbreekt | **AIRDROP** |

---

## ⏱️ Geschatte Installatie Tijd

| Taak | Tijd |
|------|------|
| Solana CLI installeren | 5-10 min |
| Anchor CLI installeren | 10-15 min |
| Wallet aanmaken | 5 min |
| DevNet SOL krijgen | 2 min |
| **TOTAAL** | **22-32 min** |

---

## 🎯 Na Installatie

Als alle tools zijn geïnstalleerd:

```bash
# 1. Run de deployment
cd /home/user/Shin2chin
./scripts/deploy-to-devnet.sh

# 2. Volg de testing checklist
cat DEVNET_TESTING_CHECKLIST.md
```

**Week 1 DevNet deployment kan dan beginnen!** 🚀

---

## 🆘 Hulp Nodig?

**Common Issues**:

**1. Solana install script blocked**
```bash
# Check firewall/proxy settings
curl -I https://release.solana.com/stable/install

# Of download manual (zie Alternatief hierboven)
```

**2. Anchor build fails**
```bash
# Installeer missing dependencies
sudo apt-get install -y pkg-config build-essential libudev-dev libssl-dev

# Retry
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --tag v0.31.1 --locked
```

**3. Airdrop rate limited**
```bash
# Wacht 30 seconden tussen airdrops
solana airdrop 2 && sleep 30 && solana airdrop 2

# Of gebruik web faucet
# https://faucet.solana.com/
```

**4. PATH not found after install**
```bash
# Reload shell profile
source ~/.bashrc

# Of herstart je terminal
```

---

## 📞 Contact

Als je vast loopt tijdens installatie, check:
1. Error messages in terminal
2. Solana documentatie: https://docs.solana.com/cli/install-solana-cli-tools
3. Anchor documentatie: https://www.anchor-lang.com/docs/installation

**Status**: Klaar om te installeren!
**Next Step**: Run het installatie script of volg de stappen handmatig.
