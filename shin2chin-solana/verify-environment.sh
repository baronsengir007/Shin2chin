#!/bin/bash
# Environment Verification Script for Shin2Chin Solana Project
# This script validates that all required components for development are properly installed and configured

echo "===== SHIN2CHIN SOLANA ENVIRONMENT VERIFICATION ====="
echo "Running verification on $(date)"
echo ""

# Create a results log file
LOG_FILE="environment-verification-$(date +%Y%m%d%H%M%S).log"
touch $LOG_FILE
echo "Logging results to $LOG_FILE"

# Function to check command availability
check_command() {
  echo -n "Checking for $1... "
  if command -v $1 &>/dev/null; then
    echo "✅ FOUND: $($1 --version 2>&1 | head -n 1)"
    echo "✅ $1 FOUND: $($1 --version 2>&1 | head -n 1)" >> $LOG_FILE
    return 0
  else
    echo "❌ NOT FOUND"
    echo "❌ $1 NOT FOUND" >> $LOG_FILE
    return 1
  fi
}

# Function to check directory existence
check_directory() {
  echo -n "Checking for $1... "
  if [ -d "$1" ]; then
    echo "✅ FOUND"
    echo "✅ $1 DIRECTORY FOUND" >> $LOG_FILE
    return 0
  else
    echo "❌ NOT FOUND"
    echo "❌ $1 DIRECTORY NOT FOUND" >> $LOG_FILE
    return 1
  fi
}

# Check core development tools
echo "===== CHECKING CORE DEVELOPMENT TOOLS ====="
check_command rustc
check_command cargo
check_command solana
check_command anchor

# Check project dependencies
echo ""
echo "===== CHECKING PROJECT DEPENDENCIES ====="
check_directory "node_modules"
check_directory "app/node_modules"
check_directory "admin/node_modules"

# Check program structure
echo ""
echo "===== CHECKING PROGRAM STRUCTURE ====="
check_directory "programs/betting/src"
check_directory "programs/oracle/src"

# Attempt to build the programs
echo ""
echo "===== ATTEMPTING PROGRAM BUILD ====="
echo -n "Building Anchor programs... "
BUILD_OUTPUT=$(anchor build 2>&1)
if [ $? -eq 0 ]; then
  echo "✅ SUCCESS"
  echo "✅ ANCHOR BUILD SUCCEEDED" >> $LOG_FILE
  echo "$BUILD_OUTPUT" >> $LOG_FILE
else
  echo "❌ FAILED"
  echo "❌ ANCHOR BUILD FAILED" >> $LOG_FILE
  echo "$BUILD_OUTPUT" >> $LOG_FILE
fi

# Check for Anchor test
echo ""
echo -n "Testing Anchor programs... "
TEST_OUTPUT=$(anchor test --skip-build 2>&1)
if [ $? -eq 0 ]; then
  echo "✅ SUCCESS"
  echo "✅ ANCHOR TEST SUCCEEDED" >> $LOG_FILE
  echo "$TEST_OUTPUT" >> $LOG_FILE
else
  echo "❌ FAILED"
  echo "❌ ANCHOR TEST FAILED" >> $LOG_FILE
  echo "$TEST_OUTPUT" >> $LOG_FILE
fi

# Validate local validator
echo ""
echo "===== CHECKING LOCAL VALIDATOR ====="
echo -n "Starting local validator (will terminate after check)... "
VALIDATOR_OUTPUT=$(solana-test-validator --log -q 2>&1 & sleep 5; pkill solana-test-validator 2>&1)
if [ $? -eq 0 ]; then
  echo "✅ SUCCESS"
  echo "✅ LOCAL VALIDATOR STARTED SUCCESSFULLY" >> $LOG_FILE
else
  echo "❌ FAILED"
  echo "❌ LOCAL VALIDATOR FAILED TO START" >> $LOG_FILE
  echo "$VALIDATOR_OUTPUT" >> $LOG_FILE
fi

# Summary
echo ""
echo "===== VERIFICATION SUMMARY ====="
echo "See $LOG_FILE for detailed output"

# Windows PowerShell version
echo '
# Environment Verification Script (Windows PowerShell Version)
# Run this script from the shin2chin-solana directory

Write-Host "===== SHIN2CHIN SOLANA ENVIRONMENT VERIFICATION ====="
Write-Host "Running verification on $(Get-Date)"
Write-Host ""

# Create a results log file
$LOG_FILE="environment-verification-$(Get-Date -Format 'yyyyMMddHHmmss').log"
New-Item -Path $LOG_FILE -ItemType File -Force | Out-Null
Write-Host "Logging results to $LOG_FILE"

# Function to check command availability
function Check-Command {
    param (
        [string]$command
    )
    
    Write-Host "Checking for $command... " -NoNewline
    if (Get-Command $command -ErrorAction SilentlyContinue) {
        $version = & $command --version 2>&1 | Select-Object -First 1
        Write-Host "✅ FOUND: $version"
        Add-Content -Path $LOG_FILE -Value "✅ $command FOUND: $version"
        return $true
    } else {
        Write-Host "❌ NOT FOUND"
        Add-Content -Path $LOG_FILE -Value "❌ $command NOT FOUND"
        return $false
    }
}

# Function to check directory existence
function Check-Directory {
    param (
        [string]$directory
    )
    
    Write-Host "Checking for $directory... " -NoNewline
    if (Test-Path $directory -PathType Container) {
        Write-Host "✅ FOUND"
        Add-Content -Path $LOG_FILE -Value "✅ $directory DIRECTORY FOUND"
        return $true
    } else {
        Write-Host "❌ NOT FOUND"
        Add-Content -Path $LOG_FILE -Value "❌ $directory DIRECTORY NOT FOUND"
        return $false
    }
}

# Check core development tools
Write-Host "===== CHECKING CORE DEVELOPMENT TOOLS ====="
Check-Command "rustc"
Check-Command "cargo"
Check-Command "solana"
Check-Command "anchor"

# Check project dependencies
Write-Host ""
Write-Host "===== CHECKING PROJECT DEPENDENCIES ====="
Check-Directory "node_modules"
Check-Directory "app\node_modules"
Check-Directory "admin\node_modules"

# Check program structure
Write-Host ""
Write-Host "===== CHECKING PROGRAM STRUCTURE ====="
Check-Directory "programs\betting\src"
Check-Directory "programs\oracle\src"

# Attempt to build the programs
Write-Host ""
Write-Host "===== ATTEMPTING PROGRAM BUILD ====="
Write-Host "Building Anchor programs... " -NoNewline
try {
    $buildOutput = & anchor build 2>&1
    Write-Host "✅ SUCCESS"
    Add-Content -Path $LOG_FILE -Value "✅ ANCHOR BUILD SUCCEEDED"
    Add-Content -Path $LOG_FILE -Value $buildOutput
} catch {
    Write-Host "❌ FAILED"
    Add-Content -Path $LOG_FILE -Value "❌ ANCHOR BUILD FAILED"
    Add-Content -Path $LOG_FILE -Value $_.Exception.Message
}

# Summary
Write-Host ""
Write-Host "===== VERIFICATION SUMMARY ====="
Write-Host "See $LOG_FILE for detailed output"
' > verify-environment.ps1

echo "Environment verification script created."
echo "For Windows, use verify-environment.ps1"
echo "For Unix/Mac, use verify-environment.sh"