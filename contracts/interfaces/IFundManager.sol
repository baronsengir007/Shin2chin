// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title IFundManager
 * @dev Interface for funds management in the Shin2Chin betting platform
 */
interface IFundManager {
    /**
     * @notice Adds funds to the user's balance
     * @param _amount The amount to add
     */
    function addFunds(uint256 _amount) external;

    /**
     * @notice Withdraws funds from the user's balance
     * @param _amount The amount to withdraw
     */
    function withdrawFunds(uint256 _amount) external;

    /**
     * @notice Gets the balance of a user
     * @param _user The address of the user
     * @return The balance of the user
     */
    function getUserBalance(address _user) external view returns (uint256);

    /**
     * @notice Gets the token used for funds
     * @return The address of the token contract
     */
    function getToken() external view returns (address);
    
    /**
     * @notice Event emitted when a user adds funds
     */
    event FundsAdded(address indexed user, uint256 amount);

    /**
     * @notice Event emitted when a user withdraws funds
     */
    event FundsWithdrawn(address indexed user, uint256 amount);

    /**
     * @notice Event emitted when a user receives a payout
     */
    event PayoutReceived(address indexed user, uint256 amount, uint256 indexed fightId);

    /**
     * @notice Event emitted when a user receives a refund for unmatched bets
     */
    event UnmatchedBetRefunded(address indexed user, uint256 amount, uint256 indexed fightId);
}