#!/bin/bash
# Update program ID across all configuration files
# Usage: ./update-program-id.sh <NEW_PROGRAM_ID>

set -e

if [ -z "$1" ]; then
    echo "Usage: ./update-program-id.sh <PROGRAM_ID>"
    echo "Example: ./update-program-id.sh 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
    exit 1
fi

NEW_PROGRAM_ID="$1"
PROJECT_ROOT="/home/user/Shin2chin"

echo "🔄 Updating Program ID to: $NEW_PROGRAM_ID"
echo ""

# Validate program ID format (basic check - should be base58, 32-44 chars)
if [ ${#NEW_PROGRAM_ID} -lt 32 ] || [ ${#NEW_PROGRAM_ID} -gt 44 ]; then
    echo "❌ Invalid program ID format. Expected base58 string (32-44 chars)"
    exit 1
fi

# Function to update file
update_file() {
    local file=$1
    local pattern=$2
    local replacement=$3

    if [ ! -f "$file" ]; then
        echo "⚠️  File not found: $file"
        return 1
    fi

    # Create backup
    cp "$file" "${file}.backup"

    # Update file
    sed -i "s/${pattern}/${replacement}/" "$file"

    echo "✅ Updated: $file"
}

# 1. Update lib.rs
echo "📝 Updating Rust program..."
update_file \
    "$PROJECT_ROOT/shin2chin-solana/programs/shin2chin_pool/src/lib.rs" \
    'declare_id!(".*")' \
    "declare_id!(\"$NEW_PROGRAM_ID\")"

# 2. Update Anchor.toml
echo "📝 Updating Anchor.toml..."
ANCHOR_TOML="$PROJECT_ROOT/shin2chin-solana/Anchor.toml"
if [ -f "$ANCHOR_TOML" ]; then
    cp "$ANCHOR_TOML" "${ANCHOR_TOML}.backup"

    # Update both localnet and devnet sections
    sed -i "/\[programs.localnet\]/,/^\[/ s/shin2chin_pool = .*/shin2chin_pool = \"$NEW_PROGRAM_ID\"/" "$ANCHOR_TOML"

    if grep -q "\[programs.devnet\]" "$ANCHOR_TOML"; then
        sed -i "/\[programs.devnet\]/,/^\[/ s/shin2chin_pool = .*/shin2chin_pool = \"$NEW_PROGRAM_ID\"/" "$ANCHOR_TOML"
    else
        # Add devnet section
        sed -i "/\[programs.localnet\]/a \\\n[programs.devnet]\nshin2chin_pool = \"$NEW_PROGRAM_ID\"" "$ANCHOR_TOML"
    fi

    echo "✅ Updated: $ANCHOR_TOML"
else
    echo "⚠️  Anchor.toml not found"
fi

# 3. Update frontend config
echo "📝 Updating frontend config..."
update_file \
    "$PROJECT_ROOT/frontend/src/core/config/index.ts" \
    "programId: '.*'" \
    "programId: '$NEW_PROGRAM_ID'"

# 4. Update usePoolContract hook
echo "📝 Updating usePoolContract hook..."
update_file \
    "$PROJECT_ROOT/frontend/src/hooks/usePoolContract.ts" \
    "const PROGRAM_ID = new PublicKey('.*')" \
    "const PROGRAM_ID = new PublicKey('$NEW_PROGRAM_ID')"

# 5. Update .env.devnet if exists
if [ -f "$PROJECT_ROOT/.env.devnet" ]; then
    echo "📝 Updating .env.devnet..."
    cp "$PROJECT_ROOT/.env.devnet" "$PROJECT_ROOT/.env.devnet.backup"
    sed -i "s/PROGRAM_ID=.*/PROGRAM_ID=$NEW_PROGRAM_ID/" "$PROJECT_ROOT/.env.devnet"
    sed -i "s/VITE_PROGRAM_ID=.*/VITE_PROGRAM_ID=$NEW_PROGRAM_ID/" "$PROJECT_ROOT/.env.devnet"
    echo "✅ Updated: .env.devnet"
fi

echo ""
echo "✅ Program ID update complete!"
echo ""
echo "📋 Files updated (backups created with .backup extension):"
echo "  1. shin2chin-solana/programs/shin2chin_pool/src/lib.rs"
echo "  2. shin2chin-solana/Anchor.toml"
echo "  3. frontend/src/core/config/index.ts"
echo "  4. frontend/src/hooks/usePoolContract.ts"
echo "  5. .env.devnet (if exists)"
echo ""
echo "🔄 Next steps:"
echo "  1. Rebuild program: cd shin2chin-solana && anchor build"
echo "  2. Redeploy: anchor deploy --provider.cluster devnet"
echo "  3. Verify: solana program show $NEW_PROGRAM_ID --url devnet"
echo ""
