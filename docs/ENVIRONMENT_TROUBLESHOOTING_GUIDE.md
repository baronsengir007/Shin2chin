# Shin2Chin Solana Environment Troubleshooting Guide

This guide addresses common issues encountered during the setup and validation of the Solana development environment for the Shin2Chin betting platform. Refer to this document when you encounter problems with the development environment.

## Installation Issues

### Rust/Cargo Installation Problems

#### Rust not installed or not in PATH

**Symptoms:**
- `rustc: command not found` or `cargo: command not found`
- Build errors with Anchor

**Solutions:**
1. Install Rust using rustup:
   ```bash
   # Windows (in PowerShell with Admin privileges)
   winget install Rustlang.Rustup
   # OR
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
   
2. Restart your terminal or run:
   ```bash
   # Windows
   refreshenv
   # Linux/macOS
   source $HOME/.cargo/env
   ```
   
3. Verify installation:
   ```bash
   rustc --version
   cargo --version
   ```

### Solana CLI Installation Issues

**Symptoms:**
- `solana: command not found`
- Unable to interact with local validator
- CloudFront CDN error 525 when downloading from release.solana.com
- Installation permission issues on Windows

**CloudFront CDN Error 525 Solutions:**

If you encounter error 525 when trying to download from release.solana.com, use one of these alternative methods:

1. **GitHub Release Method** (recommended):
   ```powershell
   # Download using the GitHub release directly
   Invoke-WebRequest -Uri "https://github.com/solana-labs/solana/releases/download/v1.18.26/solana-install-init-x86_64-pc-windows-msvc.exe" -OutFile "$env:TEMP\solana-install.exe"
   
   # Run installer with admin privileges (right-click PowerShell, select "Run as Administrator")
   & "$env:TEMP\solana-install.exe" v1.18.26
   
   # Add to PATH for current session
   $env:PATH = "$env:LOCALAPPDATA\solana\install\active_release\bin;$env:PATH"
   ```

2. **Direct Binary Installation** (no admin required):
   ```powershell
   # Use the provided user-level installation script
   .\install-solana-user.ps1
   ```

3. **WSL2 Method** (fallback):
   ```bash
   # In WSL2 terminal
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   ```

4. **Important Notes**:
   - The npm package (`npm install -g solana`) is NOT the official Solana CLI and lacks essential components
   - Always verify installation with `solana --version`
   - If you get permission errors during installation, try the user-level script or WSL2 method

**Standard Installation (when CDN is working):**
1. Install Solana CLI:
   ```bash
   # Windows
   curl https://release.solana.com/v1.18.26/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe --create-dirs
   C:\solana-install-tmp\solana-install-init.exe v1.18.26
   
   # Linux/macOS
   sh -c "$(curl -sSfL https://release.solana.com/v1.18.26/install)"
   ```

2. Add to PATH and restart terminal or run:
   ```bash
   # Windows - Add to PATH manually through system properties
   # Linux/macOS
   source ~/.profile
   ```

3. Verify installation:
   ```bash
   solana --version
   ```

### Anchor Framework Installation Issues

**Symptoms:**
- `anchor: command not found`
- Unable to build or deploy programs

**Solutions:**
1. Install Anchor via Cargo:
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked
   avm install latest
   avm use latest
   ```
   
2. Alternatively, install via npm (not recommended for development):
   ```bash
   npm install -g @coral-xyz/anchor-cli
   ```
   
3. Verify installation:
   ```bash
   anchor --version
   ```

## Build and Deployment Issues

### Anchor Build Failures

**Symptoms:**
- Errors during `anchor build`
- Missing dependencies in Rust

**Solutions:**
1. Check Rust version compatibility:
   ```bash
   rustup update
   ```
   
2. Clean build artifacts:
   ```bash
   rm -rf ./target
   anchor clean
   ```
   
3. Ensure correct Solana program dependencies:
   ```bash
   # Check Cargo.toml for anchor-lang and solana-program versions
   ```

### Program ID Mismatch

**Symptoms:**
- Program ID in Anchor.toml doesn't match deployed program
- Transaction simulation errors

**Solutions:**
1. Get the generated program ID:
   ```bash
   solana address -k ./target/deploy/betting-keypair.json
   ```
   
2. Update Anchor.toml with the correct program ID
   
3. Update the declare_id! macro in lib.rs to match

### Local Validator Issues

**Symptoms:**
- Unable to start local validator
- Connection refused errors

**Solutions:**
1. Check if validator is already running:
   ```bash
   ps aux | grep solana-test-validator
   # OR on Windows
   tasklist | findstr solana
   ```
   
2. Kill existing validator if needed:
   ```bash
   # Linux/macOS
   pkill solana-test-validator
   # Windows
   taskkill /F /IM solana-test-validator.exe
   ```
   
3. Start with clean ledger:
   ```bash
   solana-test-validator --reset
   ```

## Dependency Issues

### npm Dependency Installation Failures

**Symptoms:**
- npm install errors
- Missing node_modules

**Solutions:**
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
   
2. Use legacy peer dependencies flag for older projects:
   ```bash
   npm install --legacy-peer-deps
   ```
   
3. Check for conflicting dependencies:
   ```bash
   npm ls
   ```

### Missing Wallet Adapter Components

**Symptoms:**
- Wallet connection errors
- Missing wallet providers

**Solutions:**
1. Ensure all wallet adapter dependencies are installed:
   ```bash
   npm install \
     @solana/wallet-adapter-base \
     @solana/wallet-adapter-react \
     @solana/wallet-adapter-react-ui \
     @solana/wallet-adapter-wallets
   ```

## Platform-Specific Issues

### Windows-Specific Issues

**Symptoms:**
- Command chaining with `&&` not working
- Path issues with Solana tools

**Solutions:**
1. Use PowerShell command chaining with semicolons:
   ```powershell
   cd shin2chin-solana; npm install; anchor build
   ```
   
2. Ensure Windows build tools are installed:
   ```powershell
   npm install --global --production windows-build-tools
   ```
   
3. For WSL users, consider running Solana development in WSL instead of native Windows

### macOS-Specific Issues

**Symptoms:**
- Missing build tools
- Permissions issues

**Solutions:**
1. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
   
2. Fix permissions:
   ```bash
   sudo chown -R $(whoami) ~/.cargo ~/.rustup
   ```

## Testing and Verification Issues

### Test Failures

**Symptoms:**
- Tests fail with timeout errors
- Transaction simulation errors

**Solutions:**
1. Increase test timeout in Anchor.toml:
   ```toml
   [scripts]
   test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
   ```
   
2. Check for correctly setup PDA seeds in tests
   
3. Ensure test validator is running with required programs:
   ```bash
   solana-test-validator --bpf-program <PROGRAM_ID> <PROGRAM_SO_PATH>
   ```

### Frontend Connection Issues

**Symptoms:**
- Unable to connect to local programs
- RPC connection errors

**Solutions:**
1. Verify RPC URL in app configuration:
   ```javascript
   const connection = new Connection("http://localhost:8899");
   ```
   
2. Check for correct program ID usage in frontend:
   ```javascript
   const programId = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
   ```

## Recovery Steps

If your environment becomes severely corrupted or you encounter persistent issues:

1. Back up any custom code or configuration
2. Remove the entire project directory
3. Re-clone the repository
4. Reinstall all dependencies following the setup checklist
5. Rebuild and redeploy the programs

## Additional Resources

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework Documentation](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Anchor Discord Community](https://discord.com/invite/PDeRXyVURd)
- [Solana StackExchange](https://solana.stackexchange.com/)