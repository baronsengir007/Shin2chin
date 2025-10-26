#!/bin/bash
# Shin2Chin - Deployment Readiness Check
# Verifies all code and configuration before deployment

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Shin2Chin Deployment Readiness Check"
echo "========================================"
echo ""

READY=true

# Check 1: Frontend tests
echo -n "Frontend Tests (31 tests)... "
cd /home/user/Shin2chin/frontend
TEST_RESULT=$(npm test -- --run 2>&1 | grep "31 passed")
if [ -n "$TEST_RESULT" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
    READY=false
fi

# Check 2: Frontend build
echo -n "Frontend Build... "
BUILD_RESULT=$(npm run build 2>&1 | grep "built in")
if [ -n "$BUILD_RESULT" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
    READY=false
fi

# Check 3: Scripts executable
echo -n "Deployment Scripts... "
if [ -x "/home/user/Shin2chin/scripts/deploy-to-devnet.sh" ] && \
   [ -x "/home/user/Shin2chin/scripts/install-solana-tools.sh" ] && \
   [ -x "/home/user/Shin2chin/scripts/monitor-devnet.sh" ]; then
    echo -e "${GREEN}✅ READY${NC}"
else
    echo -e "${RED}❌ NOT EXECUTABLE${NC}"
    READY=false
fi

# Check 4: Smart contract files
echo -n "Smart Contract Files... "
if [ -f "/home/user/Shin2chin/shin2chin-solana/programs/shin2chin_pool/src/lib.rs" ] && \
   [ -f "/home/user/Shin2chin/shin2chin-solana/Cargo.toml" ]; then
    echo -e "${GREEN}✅ PRESENT${NC}"
else
    echo -e "${RED}❌ MISSING${NC}"
    READY=false
fi

# Check 5: Documentation
echo -n "Deployment Documentation... "
if [ -f "/home/user/Shin2chin/WEEK1_DEVNET_DEPLOYMENT_PLAN.md" ] && \
   [ -f "/home/user/Shin2chin/DEVNET_TESTING_CHECKLIST.md" ]; then
    echo -e "${GREEN}✅ COMPLETE${NC}"
else
    echo -e "${RED}❌ INCOMPLETE${NC}"
    READY=false
fi

echo ""
echo "========================================"

if [ "$READY" = true ]; then
    echo -e "${GREEN}✅ DEPLOYMENT READY${NC}"
    echo ""
    echo "Next steps (in environment with Solana tools):"
    echo "1. ./scripts/install-solana-tools.sh"
    echo "2. ./scripts/deploy-to-devnet.sh"
    echo "3. Follow DEVNET_TESTING_CHECKLIST.md"
else
    echo -e "${RED}❌ NOT READY - Fix issues above${NC}"
fi

echo ""
