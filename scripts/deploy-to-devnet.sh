#!/bin/bash
# Shin2Chin DevNet Deployment Script
# Auto-deploys program and updates all configuration files

set -e  # Exit on error

echo "🚀 Shin2Chin DevNet Deployment"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/home/user/Shin2chin"
SOLANA_DIR="$PROJECT_ROOT/shin2chin-solana"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
WALLET_PATH="$HOME/.config/solana/id.json"

# Step 1: Verify environment
echo -e "${BLUE}📋 Step 1: Verifying environment${NC}"

if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Install: sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
    exit 1
fi

if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor CLI not found. Install: cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked"
    exit 1
fi

echo "✅ Solana version: $(solana --version)"
echo "✅ Anchor version: $(anchor --version)"
echo ""

# Step 2: Configure Solana for DevNet
echo -e "${BLUE}📡 Step 2: Configuring Solana CLI for DevNet${NC}"
solana config set --url https://api.devnet.solana.com
solana config set --keypair $WALLET_PATH
echo "✅ Configuration updated"
echo ""

# Step 3: Check wallet balance
echo -e "${BLUE}💰 Step 3: Checking wallet balance${NC}"
BALANCE=$(solana balance)
echo "Wallet balance: $BALANCE"

# Convert to numeric for comparison (remove "SOL" suffix)
BALANCE_NUMERIC=$(echo $BALANCE | awk '{print $1}')

if (( $(echo "$BALANCE_NUMERIC < 2" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Balance low (< 2 SOL). Requesting airdrop...${NC}"
    solana airdrop 2 || echo "⚠️  Airdrop failed. You may need to wait or use a faucet."
    sleep 2
    BALANCE=$(solana balance)
    echo "New balance: $BALANCE"
fi
echo ""

# Step 4: Clean and build program
echo -e "${BLUE}🔨 Step 4: Building Anchor program${NC}"
cd $SOLANA_DIR

echo "Cleaning previous builds..."
anchor clean

echo "Building program (this may take 2-3 minutes)..."
anchor build

# Verify build artifacts
if [ ! -f "target/deploy/shin2chin_pool.so" ]; then
    echo "❌ Build failed: shin2chin_pool.so not found"
    exit 1
fi

if [ ! -f "target/idl/shin2chin_pool.json" ]; then
    echo "❌ Build failed: IDL not generated"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Step 5: Extract program ID
echo -e "${BLUE}🔑 Step 5: Extracting program ID${NC}"
PROGRAM_ID=$(solana address -k target/deploy/shin2chin_pool-keypair.json)
echo "Program ID: $PROGRAM_ID"
echo ""

# Step 6: Update lib.rs with program ID
echo -e "${BLUE}📝 Step 6: Updating lib.rs with program ID${NC}"
LIB_RS_PATH="$SOLANA_DIR/programs/shin2chin_pool/src/lib.rs"

# Backup original
cp $LIB_RS_PATH ${LIB_RS_PATH}.backup

# Update declare_id
sed -i "s/declare_id!(\".*\")/declare_id!(\"$PROGRAM_ID\")/" $LIB_RS_PATH

echo "✅ Updated $LIB_RS_PATH"
echo ""

# Step 7: Rebuild with correct program ID
echo -e "${BLUE}🔨 Step 7: Rebuilding with correct program ID${NC}"
anchor build
echo "✅ Rebuild complete"
echo ""

# Step 8: Deploy to DevNet
echo -e "${BLUE}🚀 Step 8: Deploying to DevNet${NC}"
echo "This may take 1-2 minutes..."

anchor deploy --provider.cluster devnet

echo "✅ Deployment complete"
echo ""

# Step 9: Verify deployment
echo -e "${BLUE}✅ Step 9: Verifying deployment${NC}"
solana program show $PROGRAM_ID --url devnet

PROGRAM_EXISTS=$?
if [ $PROGRAM_EXISTS -ne 0 ]; then
    echo "❌ Deployment verification failed"
    exit 1
fi

echo "✅ Program verified on DevNet"
echo ""

# Step 10: Update Anchor.toml
echo -e "${BLUE}📝 Step 10: Updating Anchor.toml${NC}"
ANCHOR_TOML="$SOLANA_DIR/Anchor.toml"

# Backup
cp $ANCHOR_TOML ${ANCHOR_TOML}.backup

# Update program ID for devnet
if grep -q "\[programs.devnet\]" $ANCHOR_TOML; then
    sed -i "/\[programs.devnet\]/,/^\[/ s/shin2chin_pool = .*/shin2chin_pool = \"$PROGRAM_ID\"/" $ANCHOR_TOML
else
    # Add devnet section if it doesn't exist
    sed -i "/\[programs.localnet\]/a \\\n[programs.devnet]\nshin2chin_pool = \"$PROGRAM_ID\"" $ANCHOR_TOML
fi

# Update cluster to devnet
sed -i 's/cluster = ".*"/cluster = "Devnet"/' $ANCHOR_TOML

echo "✅ Updated $ANCHOR_TOML"
echo ""

# Step 11: Copy IDL to frontend
echo -e "${BLUE}📋 Step 11: Copying IDL to frontend${NC}"
mkdir -p $FRONTEND_DIR/src/idl
cp $SOLANA_DIR/target/idl/shin2chin_pool.json $FRONTEND_DIR/src/idl/
echo "✅ IDL copied to frontend"
echo ""

# Step 12: Update frontend configuration
echo -e "${BLUE}📝 Step 12: Updating frontend configuration${NC}"

# Update config/index.ts
CONFIG_TS="$FRONTEND_DIR/src/core/config/index.ts"
if [ -f "$CONFIG_TS" ]; then
    cp $CONFIG_TS ${CONFIG_TS}.backup
    sed -i "s/programId: '.*'/programId: '$PROGRAM_ID'/" $CONFIG_TS
    echo "✅ Updated $CONFIG_TS"
else
    echo "⚠️  $CONFIG_TS not found, skipping"
fi

# Update usePoolContract.ts
POOL_CONTRACT_HOOK="$FRONTEND_DIR/src/hooks/usePoolContract.ts"
if [ -f "$POOL_CONTRACT_HOOK" ]; then
    cp $POOL_CONTRACT_HOOK ${POOL_CONTRACT_HOOK}.backup
    sed -i "s/const PROGRAM_ID = new PublicKey('.*')/const PROGRAM_ID = new PublicKey('$PROGRAM_ID')/" $POOL_CONTRACT_HOOK
    echo "✅ Updated $POOL_CONTRACT_HOOK"
else
    echo "⚠️  $POOL_CONTRACT_HOOK not found, skipping"
fi
echo ""

# Step 13: Create .env.devnet file
echo -e "${BLUE}📄 Step 13: Creating .env.devnet${NC}"
ENV_DEVNET="$PROJECT_ROOT/.env.devnet"
ADMIN_PUBKEY=$(solana address)

cat > $ENV_DEVNET << EOF
# Shin2Chin DevNet Configuration
# Generated: $(date)

# Solana DevNet
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=$PROGRAM_ID

# Admin Wallet
ADMIN_PUBKEY=$ADMIN_PUBKEY

# Frontend
VITE_SOLANA_NETWORK=devnet
VITE_PROGRAM_ID=$PROGRAM_ID
VITE_RPC_URL=https://api.devnet.solana.com
EOF

echo "✅ Created $ENV_DEVNET"
echo ""

# Step 14: Summary
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "📊 Deployment Summary:"
echo "  Program ID: $PROGRAM_ID"
echo "  Network: Solana DevNet"
echo "  Deployer: $ADMIN_PUBKEY"
echo "  Date: $(date)"
echo ""
echo "📁 Files Updated:"
echo "  ✅ $LIB_RS_PATH"
echo "  ✅ $ANCHOR_TOML"
echo "  ✅ $CONFIG_TS"
echo "  ✅ $POOL_CONTRACT_HOOK"
echo "  ✅ Frontend IDL"
echo ""
echo "🔗 Explorer:"
echo "  https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
echo ""
echo "📝 Next Steps:"
echo "  1. Review deployment: solana program show $PROGRAM_ID --url devnet"
echo "  2. Run tests: cd $SOLANA_DIR && anchor test --skip-build --skip-deploy"
echo "  3. Start frontend: cd $FRONTEND_DIR && npm run dev"
echo "  4. Create test event and place bets"
echo ""
echo "📖 Full guide: $PROJECT_ROOT/WEEK1_DEVNET_DEPLOYMENT_PLAN.md"
echo ""

# Save deployment info
DEPLOYMENT_INFO="$PROJECT_ROOT/DEVNET_DEPLOYMENT_INFO.txt"
cat > $DEPLOYMENT_INFO << EOF
Shin2Chin DevNet Deployment Info
================================

Deployment Date: $(date)
Program ID: $PROGRAM_ID
Network: Solana DevNet
RPC URL: https://api.devnet.solana.com
Deployer Public Key: $ADMIN_PUBKEY

Explorer: https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet

Files Updated:
- shin2chin-solana/programs/shin2chin_pool/src/lib.rs
- shin2chin-solana/Anchor.toml
- frontend/src/core/config/index.ts
- frontend/src/hooks/usePoolContract.ts
- frontend/src/idl/shin2chin_pool.json

Test Command: anchor test --skip-build --skip-deploy
Monitor Command: solana program show $PROGRAM_ID --url devnet

Backup files created with .backup extension
EOF

echo "💾 Deployment info saved to: $DEPLOYMENT_INFO"
echo ""
echo -e "${GREEN}Deployment complete! ✨${NC}"
