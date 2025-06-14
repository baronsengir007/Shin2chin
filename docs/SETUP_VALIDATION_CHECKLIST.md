# Shin2Chin Development Environment Setup Validation Checklist

## Purpose
This checklist provides a systematic approach to verify that your development environment is properly configured for working on the Shin2Chin Solana betting platform. Complete each step in order to ensure all components are correctly installed and functioning.

## Prerequisites Validation

### 1. Node.js and npm
- [ ] Check Node.js installation: `node --version` (should be v16+ or later)
- [ ] Check npm installation: `npm --version` (should be v7+ or later)
- [ ] Verify npm can install packages: `npm -g ls --depth=0`

### 2. Rust and Cargo
- [ ] Check Rust installation: `rustc --version` (should be 1.60+ or later)
- [ ] Check Cargo installation: `cargo --version`
- [ ] Verify Rust can compile: `rustc --version`

### 3. Solana CLI
- [ ] Check Solana CLI installation: `solana --version` (should match target cluster version)
- [ ] Check Solana configuration: `solana config get`
- [ ] Verify local wallet setup: `solana address`

### 4. Anchor Framework
- [ ] Check Anchor CLI installation: `anchor --version` (should be 0.28.0 to match project)
- [ ] Verify Anchor can build: `anchor --help`

## Project Setup Validation

### 5. Repository Structure
- [ ] Verify correct directory structure exists:
  ```
  shin2chin-solana/
  ├── Anchor.toml
  ├── package.json
  ├── admin/
  ├── app/
  ├── programs/
  │   ├── betting/
  │   └── oracle/
  ├── sdk/
  └── tests/
  ```

### 6. Dependencies Installation
- [ ] Install root dependencies: `cd shin2chin-solana && npm install`
- [ ] Install app dependencies: `cd app && npm install`
- [ ] Install admin dependencies: `cd admin && npm install`
- [ ] Verify node_modules exists in each directory

### 7. Build Verification
- [ ] Build Solana programs: `anchor build`
- [ ] Verify build artifacts in target directory
- [ ] Check program IDs match Anchor.toml

### 8. Test Execution
- [ ] Run tests: `anchor test`
- [ ] Verify tests execute without errors (even if they're placeholders)

### 9. Local Deployment
- [ ] Start local validator: `solana-test-validator`
- [ ] Deploy to localnet: `anchor deploy`
- [ ] Verify program deployment: `solana program show --programs`

### 10. Frontend Validation
- [ ] Start app: `cd app && npm start`
- [ ] Verify app loads in browser
- [ ] Check wallet connection functionality

## Troubleshooting Common Issues

### Anchor CLI not found
```bash
# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest
```

### Solana CLI not found
```bash
# Install Solana CLI
curl -sSfL https://release.solana.com/v1.16.0/install | sh
# Add to PATH in your shell profile
```

### Program ID mismatch
```bash
# After anchor build, copy the new program ID
solana address -k ./target/deploy/betting-keypair.json
# Update in Anchor.toml
```

### Build failures
```bash
# Check Rust version compatibility
rustup update
# Clear build artifacts and retry
rm -rf ./target
anchor clean
anchor build
```

## Platform-Specific Notes

### Windows
- Use PowerShell with appropriate command separators (`;` instead of `&&`)
- Ensure PATH variables include Rust and Solana binaries
- May need to run as Administrator for some operations

### macOS/Linux
- Ensure shell environment sources the correct PATH variables
- May need to install build tools: `apt-get install build-essential` (Ubuntu) or `xcode-select --install` (macOS)

## Completion Verification
After completing all steps, run a final validation:

```bash
cd shin2chin-solana
anchor build
anchor test
cd app && npm start
```

If all commands execute without errors, your environment is correctly configured for Shin2Chin development.