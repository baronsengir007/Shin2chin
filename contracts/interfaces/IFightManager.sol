// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title IFightManager
 * @dev Interface for fight creation and management in the Shin2Chin betting platform
 */
interface IFightManager {
    /**
     * @dev Enum representing the state of a fight result
     */
    enum FightResultState { Pending, Concluded, Final }

    /**
     * @notice Creates a new fight with the given parameters
     * @param _fightId The unique identifier for the fight
     * @param _startTime The scheduled start time of the fight
     * @param _fighterAName The name of fighter A
     * @param _fighterBName The name of fighter B
     */
    function createFight(
        uint256 _fightId,
        uint256 _startTime,
        string memory _fighterAName,
        string memory _fighterBName
    ) external;

    /**
     * @notice Submits the result of a fight
     * @param _fightId The ID of the fight
     * @param _winner The winning side (true for Fighter A, false for Fighter B)
     */
    function submitFightResult(uint256 _fightId, bool _winner) external;

    /**
     * @notice Retrieves basic information about a fight
     * @param _fightId The ID of the fight
     * @return startTime The start time of the fight
     * @return resultState The current result state of the fight
     * @return winner The winner of the fight
     * @return disputed Whether the fight is disputed
     */
    function getFightInfo(uint256 _fightId)
        external
        view
        returns (
            uint256 startTime,
            FightResultState resultState,
            bool winner,
            bool disputed
        );

    /**
     * @notice Retrieves the names of the fighters in a fight
     * @param _fightId The ID of the fight
     * @return fighterAName The name of fighter A
     * @return fighterBName The name of fighter B
     */
    function getFighterNames(uint256 _fightId)
        external
        view
        returns (string memory fighterAName, string memory fighterBName);

    /**
     * @notice Pauses all betting operations
     */
    function pause() external;

    /**
     * @notice Unpauses all betting operations
     */
    function unpause() external;

    /**
     * @notice Event emitted when a new fight is created
     */
    event FightCreated(uint256 indexed fightId, uint256 startTime);

    /**
     * @notice Event emitted when a fight result is submitted
     */
    event FightResultSubmitted(uint256 indexed fightId, bool winner);

    /**
     * @notice Event emitted when a fight result is finalized
     */
    event FightResultFinalized(uint256 indexed fightId, bool winner);

    /**
     * @notice Event emitted when a fight is settled
     */
    event FightSettled(uint256 indexed fightId, bool winner);
}