# Scripts

This directory contains deployment and utility scripts for the Shin2Chin betting platform.

## Purpose

Scripts automate common tasks such as:

1. **Deployment** - Scripts for deploying contracts to different networks
2. **Verification** - Automating contract verification on blockchain explorers
3. **Migration** - Tools for migrating between contract versions
4. **Maintenance** - Administrative functions and platform management

## Contents

- `deploy.js` - Main deployment script for the platform
- `verify.js` - Script for verifying contracts on block explorers
- `utils.js` - Common utilities used by other scripts

## Usage

Scripts can be executed using Hardhat task runner:

```bash
# Deploy to local network
npm run deploy:local

# Deploy to testnet
npm run deploy:testnet

# Custom deployment
npx hardhat run scripts/deploy.js --network <network_name>