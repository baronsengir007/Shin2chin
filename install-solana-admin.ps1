# Solana CLI Installation Script with Administrative Privileges
# This script must be run as Administrator

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "This script requires administrative privileges. Please run as Administrator." -ForegroundColor Red
    Write-Host "Right-click on PowerShell and select 'Run as Administrator', then run this script again." -ForegroundColor Yellow
    exit
}

Write-Host "Starting Solana CLI installation with administrative privileges..." -ForegroundColor Cyan

# Create temporary directory for download
$tempDir = "C:\solana-installer"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Define download URL and installer path
$installerUrl = "https://github.com/solana-labs/solana/releases/download/v1.18.26/solana-install-init-x86_64-pc-windows-msvc.exe"
$installerPath = "$tempDir\solana-install-init.exe"

Write-Host "Downloading Solana installer from GitHub..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath

# Define installation directory - using system-wide location
$installDir = "C:\Solana"
New-Item -ItemType Directory -Force -Path $installDir | Out-Null

Write-Host "Installing Solana to $installDir..." -ForegroundColor Cyan
& $installerPath v1.18.26 --data-dir $installDir

# Update PATH for the system (requires admin)
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$solanaPath = "$installDir\install\active_release\bin"

if (-not $currentPath.Contains($solanaPath)) {
    Write-Host "Adding Solana to system PATH..." -ForegroundColor Cyan
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$solanaPath", "Machine")
}

# Also update PATH for current session
$env:PATH = "$solanaPath;$env:PATH"

Write-Host "Verifying installation..." -ForegroundColor Cyan
try {
    $solanaVersion = & "$solanaPath\solana.exe" --version
    Write-Host "Solana CLI installed successfully!" -ForegroundColor Green
    Write-Host "Version: $solanaVersion" -ForegroundColor Green
    
    # Create Solana config and generate a development keypair
    Write-Host "Setting up Solana configuration..." -ForegroundColor Cyan
    & "$solanaPath\solana.exe" config set --url localhost
    & "$solanaPath\solana-keygen.exe" new --no-bip39-passphrase --force
    
    Write-Host "Solana installation and setup complete!" -ForegroundColor Green
    Write-Host "Please restart your terminal to use Solana commands directly." -ForegroundColor Yellow
} catch {
    Write-Host "Failed to verify Solana installation. Please check if it was installed correctly." -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Try running commands directly from $solanaPath" -ForegroundColor Yellow
}