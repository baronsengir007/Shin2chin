// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title IBettingSystem
 * @dev Interface for bet placement and matching functionality in the Shin2Chin betting platform
 */
interface IBettingSystem {
    /**
     * @notice Places a bet on a fight
     * @param _fightId The ID of the fight
     * @param _side The side the bettor is betting on (true for Fighter A, false for Fighter B)
     * @param _amount The amount being bet
     */
    function placeBet(uint256 _fightId, bool _side, uint256 _amount) external;

    /**
     * @notice Checks if a user has already placed a bet on a specific fight
     * @param _fightId The ID of the fight
     * @param _user The address of the user
     * @return Whether the user has already placed a bet on this fight
     */
    function hasUserPlacedBet(uint256 _fightId, address _user) external view returns (bool);

    /**
     * @notice Retrieves user betting statistics
     * @param _user The address of the user
     * @return totalBets Total number of bets placed by the user
     * @return totalWins Total number of wins by the user
     * @return totalAmount Total amount bet by the user
     * @return totalPayout Total payout received by the user
     */
    function getUserStats(address _user)
        external
        view
        returns (
            uint256 totalBets,
            uint256 totalWins,
            uint256 totalAmount,
            uint256 totalPayout
        );

    /**
     * @notice Gets the current bet amounts for both sides of a fight
     * @param _fightId The ID of the fight
     * @return totalBetsA Total amount bet on Fighter A
     * @return totalBetsB Total amount bet on Fighter B
     * @return totalMatchedBets Total amount of matched bets
     */
    function getFightBetInfo(uint256 _fightId)
        external
        view
        returns (
            uint256 totalBetsA,
            uint256 totalBetsB,
            uint256 totalMatchedBets
        );

    /**
     * @notice Event emitted when a bet is placed
     */
    event BetPlaced(uint256 indexed fightId, address indexed bettor, uint256 amount, uint256 matchedAmount, bool side);

    /**
     * @notice Event emitted when a bet is matched
     */
    event BetMatched(uint256 indexed fightId, uint256 indexed betIndex, uint256 matchedAmount);

    /**
     * @notice Minimum and maximum bet constraints
     */
    function getMinBetAmount() external pure returns (uint256);
    function getMaxBetAmount() external pure returns (uint256);
    function getFeePercentage() external pure returns (uint256);
}