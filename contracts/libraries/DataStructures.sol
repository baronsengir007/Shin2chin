// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title DataStructures
 * @dev Library containing optimized data structures for the Shin2Chin betting platform
 */
library DataStructures {
    /**
     * @dev Enum representing the state of a fight result
     * Pending: No result yet, betting is open
     * Concluded: Result submitted but not finalized (dispute window active)
     * Final: Result finalized and immutable
     */
    enum FightResultState { Pending, Concluded, Final }

    /**
     * @dev Struct representing a fighter in a match
     * @param name Fighter's name
     * @param record Fighter's win-loss-draw record (packed in one uint256 for gas efficiency)
     *  - bits 0-79: wins
     *  - bits 80-159: losses
     *  - bits 160-239: draws
     */
    struct Fighter {
        string name;
        uint256 record; // Packed record: wins | losses | draws
    }

    /**
     * @dev Helper functions to get/set fighter record components
     */
    function getWins(uint256 record) internal pure returns (uint80) {
        return uint80(record);
    }

    function getLosses(uint256 record) internal pure returns (uint80) {
        return uint80(record >> 80);
    }

    function getDraws(uint256 record) internal pure returns (uint80) {
        return uint80(record >> 160);
    }

    function packRecord(uint80 wins, uint80 losses, uint80 draws) internal pure returns (uint256) {
        return uint256(wins) | (uint256(losses) << 80) | (uint256(draws) << 160);
    }

    /**
     * @dev Struct representing a fight between two fighters
     * Gas-optimized by:
     * - Using packed booleans
     * - Merging related timestamps
     * - Ordering fields by size to minimize storage slots
     */
    struct Fight {
        // Slot 1: Timestamps
        uint64 startTime;
        uint64 endTime;
        uint64 conclusionTime;
        uint32 betCloseOffset; // Seconds before startTime when betting closes
        
        // Slot 2: Bet totals
        uint96 totalBetsA;
        uint96 totalBetsB;
        uint64 totalMatchedBets;
        
        // Slot 3: Fight state (packed into a single uint256)
        FightResultState resultState; // 8 bits
        bool winner;                  // 8 bits (true = fighter A, false = fighter B)
        bool settled;                 // 8 bits
        uint8 adminConfirmations;     // 8 bits (for admin consensus)
        uint32 blockNumber;           // 32 bits (block when fight was created)
        uint32 flags;                 // 32 bits (for future extensibility)
        
        // Slot 4-5: Fighter A data
        Fighter fighterA;
        
        // Slot 6-7: Fighter B data
        Fighter fighterB;
    }

    /**
     * @dev Struct representing a bet placed by a user
     * Gas-optimized by:
     * - Using smaller uint types where possible
     * - Packing booleans together
     */
    struct Bet {
        address bettor;    // Address of the person placing the bet
        uint128 amount;    // Total amount bet
        uint128 matchedAmount; // Amount that has been matched
        
        // Packed into a single byte:
        // - bit 0: side (0 = fighter B, 1 = fighter A)
        // - bit 1: cancelled flag
        // - bits 2-7: reserved for future use
        uint8 flags;
    }

    /**
     * @dev Helper functions to get/set bet flags
     */
    function getSide(uint8 flags) internal pure returns (bool) {
        return (flags & 1) == 1;
    }

    function setCancelled(uint8 flags, bool cancelled) internal pure returns (uint8) {
        return cancelled ? flags | 2 : flags & ~2;
    }

    function isCancelled(uint8 flags) internal pure returns (bool) {
        return (flags & 2) == 2;
    }

    /**
     * @dev Struct to track user betting statistics
     * Gas-optimized by using appropriate-sized integers
     */
    struct UserStats {
        uint64 totalBets;      // Count of bets placed
        uint64 totalWins;      // Count of winning bets
        uint128 totalAmount;   // Total amount wagered
        uint128 totalPayout;   // Total amount won
        uint32 firstBetTime;   // Timestamp of first bet (for user analytics)
        uint32 lastBetTime;    // Timestamp of most recent bet
    }

    /**
     * @dev Constants used throughout the platform
     */
    uint256 constant MIN_BET_AMOUNT = 1 * 10**6;     // 1 USDT (6 decimals)
    uint256 constant MAX_BET_AMOUNT = 10000 * 10**6; // 10,000 USDT
    uint256 constant FEE_PERCENTAGE = 1;             // 1% fee
    uint256 constant DISPUTE_WINDOW = 2 hours;
    uint256 constant DEFAULT_BET_CLOSE_TIME = 5 minutes;
}