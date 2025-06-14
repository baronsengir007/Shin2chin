# Solana CLI Installation Script - User Level (No Admin Required)
# This script installs Solana CLI to the user's home directory

Write-Host "Starting Solana CLI user-level installation..." -ForegroundColor Cyan

# Create installation directory in user's home
$userSolanaDir = "$env:USERPROFILE\.solana"
New-Item -ItemType Directory -Force -Path $userSolanaDir | Out-Null

# Change to the installation directory
Set-Location $userSolanaDir

Write-Host "Downloading Solana binaries directly..." -ForegroundColor Cyan

# Download the release directly from GitHub
$releaseUrl = "https://github.com/solana-labs/solana/releases/download/v1.18.26/solana-release-x86_64-pc-windows-msvc.tar.bz2"
$archivePath = "$userSolanaDir\solana-release.tar.bz2"

try {
    Invoke-WebRequest -Uri $releaseUrl -OutFile $archivePath
    
    Write-Host "Extracting Solana binaries..." -ForegroundColor Cyan
    
    # Use 7-Zip if available, otherwise try tar command
    if (Get-Command "7z" -ErrorAction SilentlyContinue) {
        7z x $archivePath -so | 7z x -aoa -si -ttar -o"$userSolanaDir"
    } else {
        # Try using built-in tar if on Windows 10 or newer
        tar -xf $archivePath
    }
    
    # Find the bin directory (it's inside a nested directory created by extraction)
    $binDir = Get-ChildItem -Path $userSolanaDir -Directory | Where-Object { $_.Name -like "solana-release*" } | Select-Object -ExpandProperty FullName
    $binDir = "$binDir\bin"
    
    # Update PATH for current session
    $env:PATH = "$binDir;$env:PATH"
    
    Write-Host "Verifying installation..." -ForegroundColor Cyan
    
    # Test if solana command is accessible
    $solanaVersion = & "$binDir\solana.exe" --version
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Solana CLI installed successfully!" -ForegroundColor Green
        Write-Host "Version: $solanaVersion" -ForegroundColor Green
        
        # Configure Solana
        Write-Host "Setting up Solana configuration..." -ForegroundColor Cyan
        & "$binDir\solana.exe" config set --url localhost
        & "$binDir\solana-keygen.exe" new --no-bip39-passphrase --force
        
        # Create a batch file to add Solana to PATH
        $batchPath = "$userSolanaDir\add-solana-to-path.bat"
        @"
@echo off
echo Adding Solana to PATH for this session...
set PATH=$binDir;%PATH%
echo Solana is now available in this terminal session.
"@ | Out-File -FilePath $batchPath -Encoding ascii
        
        Write-Host "Solana installation complete!" -ForegroundColor Green
        Write-Host "To use Solana in future terminal sessions, run: $batchPath" -ForegroundColor Yellow
        Write-Host "Or add the following directory to your PATH permanently:" -ForegroundColor Yellow
        Write-Host "$binDir" -ForegroundColor Yellow
        
        # Return to original directory
        Set-Location -
        
        return $true
    } else {
        Write-Host "Solana installation failed - command not found after extraction." -ForegroundColor Red
    }
} catch {
    Write-Host "Error during Solana installation: $_" -ForegroundColor Red
}

Write-Host "Trying alternative method: WSL2 installation..." -ForegroundColor Cyan
Write-Host "Please run the following command in a WSL2 terminal:" -ForegroundColor Yellow
Write-Host "sh -c `"$(curl -sSfL https://release.solana.com/stable/install)`"" -ForegroundColor Yellow

# Return to original directory
Set-Location -

return $false