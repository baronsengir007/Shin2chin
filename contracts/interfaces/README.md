# Interfaces

This directory contains interface definitions for the Shin2Chin betting platform components.

## Purpose

Interfaces define the contract shapes and required functions without implementation details. They provide:

1. **Clear API Boundaries** - Establish expected behavior and function signatures
2. **Decoupling** - Allow different implementations to satisfy the same interface
3. **Documentation** - Self-documenting contracts with function definitions and parameter names

## Contents

- `IFightManager.sol` - Interface for fight creation and management functionality (supports Admin user story)
- `IBettingSystem.sol` - Interface for bet placement and matching functionality (supports Bettor user story)
- `IFundManager.sol` - Interface for funds management functionality (supports Bettor and Operator user stories)

## User Story Mapping

Each interface supports one or more of our core user stories:

- **IBettingSystem.sol**: Defines betting functionality for the Bettor user story
- **IFightManager.sol**: Defines fight management for the Admin user story
- **IFundManager.sol**: Defines fund operations for both Bettor and Operator user stories

For full user story details, see `docs/user_stories.md`.

## Usage

Interfaces are implemented by the main Shin2Chin contract and can be used by other contracts to interact with specific functionality of the platform.

```solidity
// Example usage
interface IFightManager {
    function createFight(uint256 _fightId, uint256 _startTime, string memory _fighterAName, string memory _fighterBName) external;
    function getFightInfo(uint256 _fightId) external view returns (uint256 startTime, bool winner, bool disputed);
}