#!/bin/bash
# Shin2Chin DevNet Monitoring Dashboard
# Displays real-time program status, transactions, and metrics

PROGRAM_ID="${1:-$(cat /home/user/Shin2chin/.env.devnet 2>/dev/null | grep PROGRAM_ID= | cut -d'=' -f2)}"

if [ -z "$PROGRAM_ID" ]; then
    echo "Usage: ./monitor-devnet.sh <PROGRAM_ID>"
    echo "Or ensure .env.devnet exists with PROGRAM_ID set"
    exit 1
fi

RPC_URL="https://api.devnet.solana.com"
ADMIN_WALLET="$HOME/.config/solana/id.json"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

clear_screen() {
    clear
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     📊 Shin2Chin DevNet Monitoring Dashboard 📊               ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "Program ID: ${GREEN}$PROGRAM_ID${NC}"
    echo -e "Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
}

while true; do
    clear_screen

    # Program Status
    echo -e "${YELLOW}━━━ Program Status ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    PROGRAM_INFO=$(solana program show $PROGRAM_ID --url $RPC_URL 2>&1)

    if echo "$PROGRAM_INFO" | grep -q "Program Id:"; then
        echo -e "${GREEN}✅ Program Active${NC}"
        echo "$PROGRAM_INFO" | head -6
    else
        echo -e "${RED}❌ Program not found or error${NC}"
        echo "$PROGRAM_INFO"
    fi
    echo ""

    # RPC Health
    echo -e "${YELLOW}━━━ RPC Health ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    RPC_HEALTH=$(curl -s -X POST $RPC_URL \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' 2>&1)

    if echo "$RPC_HEALTH" | grep -q '"result":"ok"'; then
        echo -e "${GREEN}✅ RPC Healthy${NC}"
    else
        echo -e "${RED}⚠️  RPC Issues Detected${NC}"
        echo "$RPC_HEALTH"
    fi
    echo ""

    # Admin Wallet Balance
    echo -e "${YELLOW}━━━ Admin Wallet ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    if [ -f "$ADMIN_WALLET" ]; then
        BALANCE=$(solana balance $ADMIN_WALLET --url $RPC_URL 2>&1)
        ADMIN_ADDR=$(solana address -k $ADMIN_WALLET 2>&1)

        echo "Address: $ADMIN_ADDR"
        echo -e "Balance: ${GREEN}$BALANCE${NC}"

        # Warn if low
        BALANCE_NUM=$(echo $BALANCE | awk '{print $1}')
        if (( $(echo "$BALANCE_NUM < 1" | bc -l 2>/dev/null || echo 0) )); then
            echo -e "${RED}⚠️  Low balance! Consider airdrop: solana airdrop 2${NC}"
        fi
    else
        echo "Admin wallet not found at $ADMIN_WALLET"
    fi
    echo ""

    # Recent Transactions (if solana-keygen supports it)
    echo -e "${YELLOW}━━━ Quick Stats ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    # Get program data size
    PROGRAM_SIZE=$(echo "$PROGRAM_INFO" | grep "Data Length:" | awk '{print $3, $4}')
    echo "Program Size: ${PROGRAM_SIZE:-Unknown}"

    # Cluster version
    CLUSTER_VERSION=$(solana cluster-version --url $RPC_URL 2>&1 | head -1)
    echo "Cluster Version: $CLUSTER_VERSION"

    # Epoch info
    EPOCH_INFO=$(solana epoch-info --url $RPC_URL 2>&1 | grep "Epoch:" | head -1)
    echo "$EPOCH_INFO"

    echo ""

    # Manual refresh or auto-refresh
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "Refreshing in 30 seconds... (Press Ctrl+C to stop)"
    echo ""
    echo "Quick commands:"
    echo "  View program: solana program show $PROGRAM_ID --url $RPC_URL"
    echo "  Airdrop: solana airdrop 2 --url $RPC_URL"
    echo "  Test: cd /home/user/Shin2chin/shin2chin-solana && anchor test --skip-build"

    sleep 30
done
