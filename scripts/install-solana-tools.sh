#!/bin/bash
# Shin2Chin - Automatic Solana & Anchor Installation
# Installs all required tools for Week 1 DevNet deployment

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Shin2Chin DevNet - Solana & Anchor Installatie Script      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if already installed
echo -e "${YELLOW}📋 Checking huidige installatie...${NC}"
echo ""

SOLANA_INSTALLED=false
ANCHOR_INSTALLED=false

if command -v solana &> /dev/null; then
    SOLANA_VERSION=$(solana --version)
    echo -e "${GREEN}✅ Solana CLI al geïnstalleerd: $SOLANA_VERSION${NC}"
    SOLANA_INSTALLED=true
else
    echo -e "${RED}❌ Solana CLI niet gevonden${NC}"
fi

if command -v anchor &> /dev/null; then
    ANCHOR_VERSION=$(anchor --version)
    echo -e "${GREEN}✅ Anchor CLI al geïnstalleerd: $ANCHOR_VERSION${NC}"
    ANCHOR_INSTALLED=true
else
    echo -e "${RED}❌ Anchor CLI niet gevonden${NC}"
fi

echo ""

# Install Solana CLI
if [ "$SOLANA_INSTALLED" = false ]; then
    echo -e "${BLUE}📦 Stap 1/4: Solana CLI installeren...${NC}"
    echo "Dit kan 5-10 minuten duren..."
    echo ""

    # Download and install
    sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

    # Add to PATH for current session
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

    # Add to shell profile for future sessions
    if [ -f "$HOME/.bashrc" ]; then
        if ! grep -q "solana/install/active_release/bin" "$HOME/.bashrc"; then
            echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
        fi
    fi

    if [ -f "$HOME/.zshrc" ]; then
        if ! grep -q "solana/install/active_release/bin" "$HOME/.zshrc"; then
            echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.zshrc
        fi
    fi

    # Verify installation
    if command -v solana &> /dev/null; then
        SOLANA_VERSION=$(solana --version)
        echo -e "${GREEN}✅ Solana CLI succesvol geïnstalleerd: $SOLANA_VERSION${NC}"
    else
        echo -e "${RED}❌ Solana CLI installatie gefaald${NC}"
        echo "Probeer handmatig te installeren: zie INSTALLATIE_CHECK.md"
        exit 1
    fi
else
    echo -e "${BLUE}⏭️  Stap 1/4: Solana CLI al geïnstalleerd, skip${NC}"
fi

echo ""

# Install Anchor CLI
if [ "$ANCHOR_INSTALLED" = false ]; then
    echo -e "${BLUE}📦 Stap 2/4: Anchor CLI installeren...${NC}"
    echo "⚠️  Dit kan 10-15 minuten duren (compileert vanaf source)"
    echo "Je kunt koffie gaan halen ☕"
    echo ""

    # Check for build dependencies
    echo "Checking build dependencies..."

    # Try to install dependencies (sudo might not be available)
    if command -v apt-get &> /dev/null; then
        echo "Detected Debian/Ubuntu system"
        if [ "$EUID" -eq 0 ]; then
            apt-get update -qq
            apt-get install -y pkg-config build-essential libudev-dev libssl-dev 2>/dev/null || true
        else
            echo -e "${YELLOW}⚠️  Cannot install dependencies (no sudo). Anchor install might fail.${NC}"
            echo "If it fails, run: sudo apt-get install -y pkg-config build-essential libudev-dev libssl-dev"
        fi
    fi

    # Install Anchor using cargo
    echo "Installing Anchor 0.31.1..."
    cargo install --git https://github.com/coral-xyz/anchor anchor-cli --tag v0.31.1 --locked

    # Verify installation
    if command -v anchor &> /dev/null; then
        ANCHOR_VERSION=$(anchor --version)
        echo -e "${GREEN}✅ Anchor CLI succesvol geïnstalleerd: $ANCHOR_VERSION${NC}"
    else
        echo -e "${RED}❌ Anchor CLI installatie gefaald${NC}"
        echo "Probeer handmatig te installeren: zie INSTALLATIE_CHECK.md"
        exit 1
    fi
else
    echo -e "${BLUE}⏭️  Stap 2/4: Anchor CLI al geïnstalleerd, skip${NC}"
fi

echo ""

# Configure Solana CLI
echo -e "${BLUE}⚙️  Stap 3/4: Solana configureren voor DevNet...${NC}"

# Create config directory
mkdir -p ~/.config/solana

# Check if wallet exists
if [ ! -f "$HOME/.config/solana/id.json" ]; then
    echo "Genereer nieuwe wallet..."
    echo ""
    echo -e "${YELLOW}⚠️  BELANGRIJK: Schrijf je seed phrase op en bewaar veilig!${NC}"
    echo -e "${YELLOW}⚠️  Dit is de ENIGE manier om je wallet te herstellen!${NC}"
    echo ""
    read -p "Druk op Enter om door te gaan..."

    solana-keygen new --outfile ~/.config/solana/id.json

    echo ""
    echo -e "${GREEN}✅ Wallet aangemaakt${NC}"
else
    echo -e "${GREEN}✅ Wallet bestaat al: ~/.config/solana/id.json${NC}"
fi

# Configure for DevNet
echo "Configureer voor DevNet..."
solana config set --url https://api.devnet.solana.com
solana config set --keypair ~/.config/solana/id.json

# Show configuration
echo ""
echo "Solana configuratie:"
solana config get

echo ""
echo -e "${GREEN}✅ Solana configuratie compleet${NC}"

echo ""

# Get DevNet SOL
echo -e "${BLUE}💰 Stap 4/4: DevNet SOL aanvragen...${NC}"

WALLET_ADDRESS=$(solana address)
echo "Wallet adres: $WALLET_ADDRESS"
echo ""

INITIAL_BALANCE=$(solana balance | awk '{print $1}')
echo "Huidige balance: $INITIAL_BALANCE SOL"

if (( $(echo "$INITIAL_BALANCE < 5" | bc -l) )); then
    echo "Requesting airdrops (doel: 5 SOL voor deployment)..."
    echo ""

    # Request multiple airdrops with delays
    for i in {1..3}; do
        echo "Airdrop #$i..."
        solana airdrop 2 2>&1 || echo "⚠️  Airdrop failed, mogelijk rate limited"
        echo "Wachten 15 seconden voor volgende airdrop..."
        sleep 15

        CURRENT_BALANCE=$(solana balance | awk '{print $1}')
        echo "Balance: $CURRENT_BALANCE SOL"

        if (( $(echo "$CURRENT_BALANCE >= 5" | bc -l) )); then
            echo -e "${GREEN}✅ Genoeg SOL ontvangen!${NC}"
            break
        fi
    done

    echo ""
    FINAL_BALANCE=$(solana balance)
    echo "Finale balance: $FINAL_BALANCE"

    if (( $(echo "$FINAL_BALANCE < 2" | bc -l) )); then
        echo -e "${YELLOW}⚠️  Balance nog steeds laag. Mogelijk rate limited.${NC}"
        echo "Probeer later: solana airdrop 2"
        echo "Of gebruik web faucet: https://faucet.solana.com/"
    fi
else
    echo -e "${GREEN}✅ Balance is voldoende: $INITIAL_BALANCE SOL${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ INSTALLATIE COMPLEET! ✅                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verification summary
echo "📊 Installatie Overzicht:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v solana &> /dev/null; then
    echo -e "${GREEN}✅ Solana CLI: $(solana --version)${NC}"
else
    echo -e "${RED}❌ Solana CLI: Niet geïnstalleerd${NC}"
fi

if command -v anchor &> /dev/null; then
    echo -e "${GREEN}✅ Anchor CLI: $(anchor --version)${NC}"
else
    echo -e "${RED}❌ Anchor CLI: Niet geïnstalleerd${NC}"
fi

if [ -f "$HOME/.config/solana/id.json" ]; then
    echo -e "${GREEN}✅ Wallet: $(solana address)${NC}"
else
    echo -e "${RED}❌ Wallet: Niet gevonden${NC}"
fi

BALANCE=$(solana balance 2>/dev/null || echo "0 SOL")
echo -e "${GREEN}✅ Balance: $BALANCE${NC}"

if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
fi

if command -v npm &> /dev/null; then
    echo -e "${GREEN}✅ npm: $(npm --version)${NC}"
fi

if command -v cargo &> /dev/null; then
    echo -e "${GREEN}✅ Rust: $(cargo --version)${NC}"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Next steps
echo -e "${BLUE}🚀 Volgende Stappen:${NC}"
echo ""
echo "1️⃣  Herstart je terminal (of run: source ~/.bashrc)"
echo ""
echo "2️⃣  Verificeer installatie:"
echo "    solana --version"
echo "    anchor --version"
echo "    solana balance"
echo ""
echo "3️⃣  Deploy naar DevNet:"
echo "    cd /home/user/Shin2chin"
echo "    ./scripts/deploy-to-devnet.sh"
echo ""
echo "4️⃣  Volg testing checklist:"
echo "    cat DEVNET_TESTING_CHECKLIST.md"
echo ""

# Save installation info
INSTALL_LOG="/home/user/Shin2chin/installation-log.txt"
cat > $INSTALL_LOG << EOF
Shin2Chin - Solana Tools Installation Log
=========================================

Installation Date: $(date)
Installation User: $(whoami)

Installed Tools:
- Solana CLI: $(solana --version 2>/dev/null || echo "Not installed")
- Anchor CLI: $(anchor --version 2>/dev/null || echo "Not installed")
- Node.js: $(node --version 2>/dev/null || echo "Not installed")
- npm: $(npm --version 2>/dev/null || echo "Not installed")
- Rust: $(cargo --version 2>/dev/null || echo "Not installed")

Wallet Configuration:
- Wallet Address: $(solana address 2>/dev/null || echo "Not configured")
- Network: $(solana config get | grep "RPC URL" | awk '{print $3}' 2>/dev/null || echo "Not configured")
- Balance: $(solana balance 2>/dev/null || echo "0 SOL")

Next Steps:
1. Restart terminal or run: source ~/.bashrc
2. Verify: solana --version && anchor --version
3. Deploy: ./scripts/deploy-to-devnet.sh
4. Test: Follow DEVNET_TESTING_CHECKLIST.md
EOF

echo -e "${GREEN}📝 Installation log opgeslagen: $INSTALL_LOG${NC}"
echo ""
echo -e "${GREEN}Alles staat klaar voor Week 1 DevNet deployment! 🎉${NC}"
