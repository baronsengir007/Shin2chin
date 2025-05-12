# Libraries

This directory contains utility libraries and shared code for the Shin2Chin betting platform.

## Purpose

Libraries in Solidity provide reusable code that can be deployed once and used by multiple contracts. They offer:

1. **Code Reuse** - Shared functionality without code duplication
2. **Gas Efficiency** - Deploy code once and reuse it across multiple contracts
3. **Modularity** - Separation of concerns for better code organization

## Contents

- `DataStructures.sol` - Core data structures and helper functions used throughout the platform

## Usage

Libraries are imported into the main contract and used to provide utility functions or data structure definitions.

```solidity
// Example usage
import {DataStructures} from "./libraries/DataStructures.sol";

contract Shin2Chin {
    using DataStructures for DataStructures.Fight;
    
    // Contract implementation using library
    // ...
}