# Solana CLI Installation Script for Windows
# This script downloads and installs Solana CLI v1.18.26 with elevated privileges

Write-Host "Starting Solana CLI installation..." -ForegroundColor Cyan

# Create temporary directory for download
$tempDir = "$env:TEMP\solana-install"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Define download URL and installer path
$installerUrl = "https://github.com/solana-labs/solana/releases/download/v1.18.26/solana-install-init-x86_64-pc-windows-msvc.exe"
$installerPath = "$tempDir\solana-install-init.exe"

Write-Host "Downloading Solana installer from GitHub..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath

Write-Host "Running Solana installer..." -ForegroundColor Cyan
Start-Process -FilePath $installerPath -ArgumentList "v1.18.26" -Wait

# Add Solana to PATH for current session
$solanaBinPath = "$env:LOCALAPPDATA\solana\install\active_release\bin"
$env:PATH = "$solanaBinPath;$env:PATH"

Write-Host "Verifying installation..." -ForegroundColor Cyan
try {
    $solanaVersion = solana --version
    Write-Host "Solana CLI installed successfully!" -ForegroundColor Green
    Write-Host "Version: $solanaVersion" -ForegroundColor Green
    
    # Create Solana config and generate a development keypair
    Write-Host "Setting up Solana configuration..." -ForegroundColor Cyan
    solana config set --url localhost
    solana-keygen new --no-bip39-passphrase --force
    
    Write-Host "Solana installation and setup complete!" -ForegroundColor Green
    Write-Host "Please restart your terminal or run the following command to add Solana to your PATH:" -ForegroundColor Yellow
    Write-Host '$env:PATH = "$env:LOCALAPPDATA\solana\install\active_release\bin;$env:PATH"' -ForegroundColor Yellow
} catch {
    Write-Host "Failed to verify Solana installation. Please check if it was installed correctly." -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}