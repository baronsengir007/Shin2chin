// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

contract Shin2Chin is Initializable, PausableUpgradeable, ReentrancyGuardUpgradeable {
    // Version
    string public constant VERSION = "1.1.0";

    IERC20Upgradeable public usdtToken;

    struct Fighter {
        string name;
        uint256 wins;
        uint256 losses;
        uint256 draws;
    }

    enum FightResultState { Pending, Concluded, Final }

    struct Fight {
        uint256 startTime;
        uint256 endTime;
        uint256 totalMatchedBets;
        uint256 totalBetsA;
        uint256 totalBetsB;
        uint256 settlementTimelock;
        uint256 betCloseTime;
        bool settled;
        FightResultState resultState;
        uint256 conclusionTime;
        uint256 oracleConfirmations;
        bool winner;
        bool disputed;
        Fighter fighterA;
        Fighter fighterB;
    }

    struct Bet {
        address bettor;
        uint256 amount;
        uint256 matchedAmount;
        bool side;
        bool cancelled;
    }

    struct UserStats {
        uint256 totalBets;
        uint256 totalWins;
        uint256 totalAmount;
        uint256 totalPayout;
    }

    struct Dispute {
        address disputeRaiser;
        uint256 raiseTime;
        bool resolved;
        bool resultOverturned;
    }

    // Changed visibility from public to private
    mapping(uint256 => Fight) private fights;
    mapping(uint256 => Bet[]) private matchedBets;
    mapping(uint256 => Bet[]) private unmatchedBets;
    mapping(address => uint256) public userBalances;
    mapping(address => UserStats) private userStats;
    mapping(uint256 => mapping(address => bool)) public userBetStatus;
    mapping(uint256 => Dispute[]) private fightDisputes;

    address public owner1;
    address public owner2;
    mapping(address => bool) public isOracle;
    uint256 public oracleCount;
    uint256 public requiredOracleConfirmations;

    mapping(bytes32 => bool) public pendingActions;
    mapping(bytes32 => uint256) public actionTimestamps;

    uint256 public constant DISPUTE_WINDOW = 2 hours;
    uint256 public constant DISPUTE_RESOLUTION_WINDOW = 48 hours;
    uint256 public constant DISPUTE_STAKE = 100 * 10**6; // 100 USDT
    uint256 public constant BET_CLOSE_TIME = 5 minutes;
    uint256 public constant ACTION_TIMEOUT = 1 days;
    uint256 public constant FEE_PERCENTAGE = 1; // 1% fee
    uint256 public constant MIN_BET_AMOUNT = 1 * 10**6; // 1 USDT
    uint256 public constant MAX_BET_AMOUNT = 10000 * 10**6; // 10,000 USDT

    event FightCreated(uint256 indexed fightId, uint256 startTime);
    event BetPlaced(uint256 indexed fightId, address indexed bettor, uint256 amount, uint256 matchedAmount, bool side);
    event BetMatched(uint256 indexed fightId, uint256 indexed betIndex, uint256 matchedAmount);
    event FightResultSubmitted(uint256 indexed fightId, bool winner);
    event FightResultConcluded(uint256 indexed fightId, bool winner);
    event FightSettled(uint256 indexed fightId, bool winner);
    event FightDisputed(uint256 indexed fightId);
    event DisputeResolved(uint256 indexed fightId, bool finalResult);
    event FundsAdded(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed user, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner, bool isOwner1);
    event ActionProposed(bytes32 indexed actionHash, address proposer);
    event OracleAdded(address indexed oracle);
    event OracleRemoved(address indexed oracle);

    // Custom error messages for better error handling
    error InvalidFightId(uint256 fightId);
    error InvalidBetAmount(uint256 amount);
    error ExceedsMaxBetAmount();
    error InsufficientBalance(address user, uint256 required, uint256 actual);
    error BettingClosed(uint256 fightId);
    error FightNotScheduled(uint256 fightId);
    error DisputeWindowClosed(uint256 fightId);
    error InsufficientDisputeStake(address user, uint256 required, uint256 actual);
    error DisputeAlreadyResolved(uint256 fightId, uint256 disputeIndex);
    error UnauthorizedAction(address user);
    error InvalidTimeInput(uint256 time);
    error ActionExpired(bytes32 actionHash);
    error SameOwnerApproval(address owner);
    error NotAnOracle(address caller);
    error FightResultAlreadyConcluded(uint256 fightId);
    error InconsistentOracleResults(uint256 fightId, bool submittedResult, bool existingResult);
    error FightNotFinalized(uint256 fightId);
    error FightAlreadySettled(uint256 fightId);
    error InvalidRequiredConfirmations(uint256 required, uint256 oracleCount);
    error NotAnOwner(address caller);
    error SameOwnerCannotApproveTwice(address owner);

    modifier onlyOwner(bytes32 _actionHash) {
        if (msg.sender != owner1 && msg.sender != owner2) {
            revert UnauthorizedAction(msg.sender);
        }
        if (!pendingActions[_actionHash]) {
            pendingActions[_actionHash] = true;
            actionTimestamps[_actionHash] = block.timestamp;
            emit ActionProposed(_actionHash, msg.sender);
            return;
        } else {
            if (msg.sender == tx.origin) {
                revert SameOwnerCannotApproveTwice(msg.sender);
            }
            if (block.timestamp > actionTimestamps[_actionHash] + ACTION_TIMEOUT) {
                revert ActionExpired(_actionHash);
            }
            delete pendingActions[_actionHash];
            delete actionTimestamps[_actionHash];
            _;
        }
    }

    modifier onlyOracle() {
        if (!isOracle[msg.sender]) {
            revert NotAnOracle(msg.sender);
        }
        _;
    }

    /**
     * @notice Initializes the contract with the given parameters.
     * @param _usdtToken The address of the USDT token contract.
     * @param _owner1 The address of the first owner.
     * @param _owner2 The address of the second owner.
     */
    function initialize(
        address _usdtToken,
        address _owner1,
        address _owner2
    ) public initializer {
        __Pausable_init();
        __ReentrancyGuard_init();
        usdtToken = IERC20Upgradeable(_usdtToken);
        owner1 = _owner1;
        owner2 = _owner2;
        requiredOracleConfirmations = 2;
    }

    /**
     * @notice Creates a new fight with the given parameters.
     * @param _fightId The unique identifier for the fight.
     * @param _startTime The scheduled start time of the fight.
     * @param _fighterAName The name of fighter A.
     * @param _fighterBName The name of fighter B.
     */
    function createFight(
        uint256 _fightId,
        uint256 _startTime,
        string memory _fighterAName,
        string memory _fighterBName
    ) external onlyOwner(keccak256(abi.encodePacked("createFight", _fightId, _startTime, _fighterAName, _fighterBName))) {
        _validateFightCreation(_fightId, _startTime);

        // Initialize fighterA and fighterB separately to reduce stack depth
        Fighter memory fighterA = Fighter({
            name: _fighterAName,
            wins: 0,
            losses: 0,
            draws: 0
        });

        Fighter memory fighterB = Fighter({
            name: _fighterBName,
            wins: 0,
            losses: 0,
            draws: 0
        });

        // Initialize the Fight struct step by step to avoid stack too deep error
        Fight storage newFight = fights[_fightId];
        newFight.startTime = _startTime;
        newFight.endTime = 0;
        newFight.totalMatchedBets = 0;
        newFight.totalBetsA = 0;
        newFight.totalBetsB = 0;
        newFight.settlementTimelock = 0;
        newFight.betCloseTime = _startTime - BET_CLOSE_TIME;
        newFight.settled = false;
        newFight.resultState = FightResultState.Pending;
        newFight.conclusionTime = 0;
        newFight.oracleConfirmations = 0;
        newFight.winner = false;
        newFight.disputed = false;
        newFight.fighterA = fighterA;
        newFight.fighterB = fighterB;

        emit FightCreated(_fightId, _startTime);
    }

    /**
     * @dev Validates the fight creation parameters.
     * @param _fightId The ID of the fight.
     * @param _startTime The scheduled start time of the fight.
     */
    function _validateFightCreation(uint256 _fightId, uint256 _startTime) internal view {
        if (_startTime <= block.timestamp) {
            revert InvalidTimeInput(_startTime);
        }
        if (fights[_fightId].startTime != 0) {
            revert InvalidFightId(_fightId);
        }
    }

    /**
     * @notice Places a bet on a fight.
     * @param _fightId The ID of the fight.
     * @param _side The side the bettor is betting on (true for Fighter A, false for Fighter B).
     * @param _amount The amount being bet.
     */
    function placeBet(uint256 _fightId, bool _side, uint256 _amount) external nonReentrant whenNotPaused {
        _validateBet(_fightId, _side, _amount);
        _processBet(_fightId, _side, _amount);
    }

    /**
     * @dev Validates the betting parameters.
     * @param _fightId The ID of the fight.
     * @param _side The side the bettor is betting on.
     * @param _amount The amount being bet.
     */
    function _validateBet(uint256 _fightId, bool _side, uint256 _amount) internal view {
        Fight storage fight = fights[_fightId];
        if (fight.resultState != FightResultState.Pending) {
            revert FightNotScheduled(_fightId);
        }
        if (block.timestamp >= fight.betCloseTime) {
            revert BettingClosed(_fightId);
        }
        if (_amount < MIN_BET_AMOUNT || _amount > MAX_BET_AMOUNT) {
            revert InvalidBetAmount(_amount);
        }
        if (userBalances[msg.sender] < _amount) {
            revert InsufficientBalance(msg.sender, _amount, userBalances[msg.sender]);
        }
        if (userBetStatus[_fightId][msg.sender]) {
            revert InvalidFightId(_fightId); // User has already placed a bet on this fight
        }

        // Use _side in validation to ensure total bets do not exceed maximum allowed
        if (_side) {
            if (fight.totalBetsA + _amount > MAX_BET_AMOUNT) {
                revert ExceedsMaxBetAmount();
            }
        } else {
            if (fight.totalBetsB + _amount > MAX_BET_AMOUNT) {
                revert ExceedsMaxBetAmount();
            }
        }
    }

    /**
     * @dev Processes the bet after validation.
     * @param _fightId The ID of the fight.
     * @param _side The side the bettor is betting on.
     * @param _amount The amount being bet.
     */
    function _processBet(uint256 _fightId, bool _side, uint256 _amount) internal {
        Fight storage fight = fights[_fightId];
        userBalances[msg.sender] -= _amount;
        userBetStatus[_fightId][msg.sender] = true;

        uint256 matchedAmount = _calculateMatchedAmount(fight, _side, _amount);

        if (matchedAmount > 0) {
            matchedBets[_fightId].push(Bet(msg.sender, _amount, matchedAmount, _side, false));
            fight.totalMatchedBets += matchedAmount;
        }

        if (matchedAmount < _amount) {
            unmatchedBets[_fightId].push(Bet(msg.sender, _amount - matchedAmount, 0, _side, false));
        }

        if (_side) {
            fight.totalBetsA += _amount;
        } else {
            fight.totalBetsB += _amount;
        }

        userStats[msg.sender].totalBets += 1;
        userStats[msg.sender].totalAmount += _amount;

        emit BetPlaced(_fightId, msg.sender, _amount, matchedAmount, _side);
        _matchUnmatchedBets(_fightId, !_side);
    }

    /**
     * @dev Calculates the amount of the bet that can be matched.
     * @param fight The fight struct.
     * @param _side The side the bettor is betting on.
     * @param _amount The amount being bet.
     * @return The matched amount.
     */
    function _calculateMatchedAmount(Fight storage fight, bool _side, uint256 _amount) internal view returns (uint256) {
        uint256 opposingSideTotalBets = _side ? fight.totalBetsB : fight.totalBetsA;
        uint256 availableToMatch = opposingSideTotalBets - fight.totalMatchedBets;
        return _amount < availableToMatch ? _amount : availableToMatch;
    }

    /**
     * @dev Matches unmatched bets from the opposing side.
     * @param _fightId The ID of the fight.
     * @param _side The side to match against.
     */
    function _matchUnmatchedBets(uint256 _fightId, bool _side) internal {
        Fight storage fight = fights[_fightId];
        uint256 remainingToMatch = _side
            ? fight.totalBetsA - fight.totalMatchedBets
            : fight.totalBetsB - fight.totalMatchedBets;

        uint256 i = 0;
        while (i < unmatchedBets[_fightId].length && remainingToMatch > 0) {
            Bet storage bet = unmatchedBets[_fightId][i];
            if (!bet.cancelled && bet.side == _side && bet.matchedAmount < bet.amount) {
                uint256 toMatch = bet.amount - bet.matchedAmount < remainingToMatch
                    ? bet.amount - bet.matchedAmount
                    : remainingToMatch;
                bet.matchedAmount += toMatch;
                remainingToMatch -= toMatch;
                fight.totalMatchedBets += toMatch;

                if (bet.matchedAmount == bet.amount) {
                    matchedBets[_fightId].push(bet);
                    unmatchedBets[_fightId][i] = unmatchedBets[_fightId][unmatchedBets[_fightId].length - 1];
                    unmatchedBets[_fightId].pop();
                    continue; // Do not increment i
                }

                emit BetMatched(_fightId, i, toMatch);
            }
            i++;
        }
    }

    /**
     * @notice Submits the result of a fight as an oracle.
     * @param _fightId The ID of the fight.
     * @param _winner The winning side (true for Fighter A, false for Fighter B).
     */
    function submitOracleResult(uint256 _fightId, bool _winner) external onlyOracle {
        Fight storage fight = fights[_fightId];

        if (fight.resultState != FightResultState.Pending) {
            revert FightResultAlreadyConcluded(_fightId);
        }

        // If this is the first confirmation, set the winner
        if (fight.oracleConfirmations == 0) {
            fight.winner = _winner;
        } else {
            if (fight.winner != _winner) {
                revert InconsistentOracleResults(_fightId, _winner, fight.winner);
            }
        }

        fight.oracleConfirmations += 1;

        // Check if the required number of confirmations is reached
        if (fight.oracleConfirmations >= requiredOracleConfirmations) {
            fight.resultState = FightResultState.Concluded;
            fight.conclusionTime = block.timestamp;
            emit FightResultConcluded(_fightId, _winner);
        }

        emit FightResultSubmitted(_fightId, _winner);
    }

    /**
     * @dev Checks if the fight can be finalized and settles it if possible.
     * @param _fightId The ID of the fight.
     */
    function checkAndFinalizeFight(uint256 _fightId) internal {
        Fight storage fight = fights[_fightId];
        if (
            fight.resultState == FightResultState.Concluded &&
            !fight.disputed &&
            block.timestamp >= fight.conclusionTime + DISPUTE_WINDOW
        ) {
            fight.resultState = FightResultState.Final;
            _settleFight(_fightId);
        }
    }

    /**
     * @dev Settles the fight by distributing payouts and refunds.
     * @param _fightId The ID of the fight.
     */
    function _settleFight(uint256 _fightId) internal {
        Fight storage fight = fights[_fightId];
        if (fight.resultState != FightResultState.Final) {
            revert FightNotFinalized(_fightId);
        }
        if (fight.settled) {
            revert FightAlreadySettled(_fightId);
        }

        _payoutWinners(_fightId, fight.winner);
        _refundUnmatchedBets(_fightId);

        fight.settled = true;
        emit FightSettled(_fightId, fight.winner);
    }

    /**
     * @dev Pays out winnings to bettors who won.
     * @param _fightId The ID of the fight.
     * @param _winner The winning side.
     */
    function _payoutWinners(uint256 _fightId, bool _winner) internal {
        for (uint256 i = 0; i < matchedBets[_fightId].length; i++) {
            Bet memory bet = matchedBets[_fightId][i];
            if (bet.side == _winner) {
                uint256 payout = bet.matchedAmount * 2;
                uint256 fee = (payout * FEE_PERCENTAGE) / 100;
                uint256 netPayout = payout - fee;
                userBalances[bet.bettor] += netPayout;
                userStats[bet.bettor].totalWins += 1;
                userStats[bet.bettor].totalPayout += netPayout;
            }
        }
    }

    /**
     * @dev Refunds unmatched bet amounts to bettors.
     * @param _fightId The ID of the fight.
     */
    function _refundUnmatchedBets(uint256 _fightId) internal {
        for (uint256 i = 0; i < unmatchedBets[_fightId].length; i++) {
            Bet memory bet = unmatchedBets[_fightId][i];
            userBalances[bet.bettor] += bet.amount - bet.matchedAmount;
        }
    }

    /**
     * @notice Raises a dispute for a fight result.
     * @param _fightId The ID of the fight.
     */
    function raiseFightDispute(uint256 _fightId) external {
        Fight storage fight = fights[_fightId];
        if (fight.resultState != FightResultState.Concluded) {
            revert InvalidFightId(_fightId);
        }
        if (block.timestamp > fight.conclusionTime + DISPUTE_WINDOW) {
            revert DisputeWindowClosed(_fightId);
        }
        if (userBalances[msg.sender] < DISPUTE_STAKE) {
            revert InsufficientDisputeStake(msg.sender, DISPUTE_STAKE, userBalances[msg.sender]);
        }

        userBalances[msg.sender] -= DISPUTE_STAKE;

        fightDisputes[_fightId].push(Dispute(msg.sender, block.timestamp, false, false));
        fight.disputed = true;
        fight.settlementTimelock = block.timestamp + DISPUTE_RESOLUTION_WINDOW;

        emit FightDisputed(_fightId);
    }

    /**
     * @notice Resolves a dispute for a fight.
     * @param _fightId The ID of the fight.
     * @param _disputeIndex The index of the dispute.
     * @param _overturnResult Whether to overturn the fight result.
     */
    function resolveDispute(
        uint256 _fightId,
        uint256 _disputeIndex,
        bool _overturnResult
    ) external onlyOwner(keccak256(abi.encodePacked("resolveDispute", _fightId, _disputeIndex, _overturnResult))) {
        if (_disputeIndex >= fightDisputes[_fightId].length) {
            revert InvalidFightId(_fightId);
        }
        Dispute storage dispute = fightDisputes[_fightId][_disputeIndex];
        if (dispute.resolved) {
            revert DisputeAlreadyResolved(_fightId, _disputeIndex);
        }

        dispute.resolved = true;
        dispute.resultOverturned = _overturnResult;

        if (_overturnResult) {
            fights[_fightId].winner = !fights[_fightId].winner;
        }

        userBalances[dispute.disputeRaiser] += DISPUTE_STAKE;

        fights[_fightId].resultState = FightResultState.Final;
        fights[_fightId].disputed = false;

        _settleFight(_fightId);
        emit DisputeResolved(_fightId, _overturnResult);
    }

    /**
     * @notice Adds funds to the user's balance.
     * @param _amount The amount to add.
     */
    function addFunds(uint256 _amount) external whenNotPaused {
        require(usdtToken.transferFrom(msg.sender, address(this), _amount), "USDT transfer failed");
        userBalances[msg.sender] += _amount;
        emit FundsAdded(msg.sender, _amount);
    }

    /**
     * @notice Withdraws funds from the user's balance.
     * @param _amount The amount to withdraw.
     */
    function withdrawFunds(uint256 _amount) external nonReentrant whenNotPaused {
        if (userBalances[msg.sender] < _amount) {
            revert InsufficientBalance(msg.sender, _amount, userBalances[msg.sender]);
        }
        userBalances[msg.sender] -= _amount;
        require(usdtToken.transfer(msg.sender, _amount), "USDT transfer failed");
        emit FundsWithdrawn(msg.sender, _amount);
    }

    /**
     * @notice Retrieves basic information about a fight.
     * @param _fightId The ID of the fight.
     * @return startTime The start time of the fight.
     * @return resultState The current result state of the fight.
     * @return winner The winner of the fight.
     * @return disputed Whether the fight is disputed.
     */
    function getFightInfo(uint256 _fightId)
        external
        view
        returns (
            uint256 startTime,
            FightResultState resultState,
            bool winner,
            bool disputed
        )
    {
        Fight storage fight = fights[_fightId];
        return (fight.startTime, fight.resultState, fight.winner, fight.disputed);
    }

    /**
     * @notice Retrieves the names of the fighters in a fight.
     * @param _fightId The ID of the fight.
     * @return fighterAName The name of fighter A.
     * @return fighterBName The name of fighter B.
     */
    function getFighterNames(uint256 _fightId)
        external
        view
        returns (string memory fighterAName, string memory fighterBName)
    {
        Fight storage fight = fights[_fightId];
        return (fight.fighterA.name, fight.fighterB.name);
    }

    /**
     * @notice Retrieves user statistics.
     * @param _user The address of the user.
     * @return totalBets Total number of bets placed by the user.
     * @return totalWins Total number of wins by the user.
     * @return totalAmount Total amount bet by the user.
     * @return totalPayout Total payout received by the user.
     */
    function getUserStats(address _user)
        external
        view
        returns (
            uint256 totalBets,
            uint256 totalWins,
            uint256 totalAmount,
            uint256 totalPayout
        )
    {
        UserStats storage stats = userStats[_user];
        return (stats.totalBets, stats.totalWins, stats.totalAmount, stats.totalPayout);
    }

    /**
     * @notice Adds a new oracle.
     * @param _oracle The address of the oracle.
     */
    function addOracle(address _oracle) external onlyOwner(keccak256(abi.encodePacked("addOracle", _oracle))) {
        if (isOracle[_oracle]) {
            revert NotAnOracle(_oracle); // Using the same error for simplicity
        }
        isOracle[_oracle] = true;
        oracleCount += 1;
        emit OracleAdded(_oracle);
    }

    /**
     * @notice Removes an oracle.
     * @param _oracle The address of the oracle.
     */
    function removeOracle(address _oracle) external onlyOwner(keccak256(abi.encodePacked("removeOracle", _oracle))) {
        if (!isOracle[_oracle]) {
            revert NotAnOracle(_oracle);
        }
        isOracle[_oracle] = false;
        oracleCount -= 1;
        emit OracleRemoved(_oracle);
    }

    /**
     * @notice Sets the required number of oracle confirmations.
     * @param _requiredConfirmations The new required number of confirmations.
     */
    function setRequiredOracleConfirmations(uint256 _requiredConfirmations)
        external
        onlyOwner(keccak256(abi.encodePacked("setRequiredOracleConfirmations", _requiredConfirmations)))
    {
        if (_requiredConfirmations == 0 || _requiredConfirmations > oracleCount) {
            revert InvalidRequiredConfirmations(_requiredConfirmations, oracleCount);
        }
        requiredOracleConfirmations = _requiredConfirmations;
    }

    /**
     * @notice Transfers ownership to a new owner.
     * @param _newOwner The address of the new owner.
     * @param _isOwner1 Whether to replace owner1 (true) or owner2 (false).
     */
    function transferOwnership(address _newOwner, bool _isOwner1) external {
        if (msg.sender != owner1 && msg.sender != owner2) {
            revert NotAnOwner(msg.sender);
        }
        address oldOwner;
        if (_isOwner1) {
            oldOwner = owner1;
            owner1 = _newOwner;
        } else {
            oldOwner = owner2;
            owner2 = _newOwner;
        }
        emit OwnershipTransferred(oldOwner, _newOwner, _isOwner1);
    }

    /**
     * @notice Pauses the contract.
     */
    function pause() external onlyOwner(keccak256("pause")) {
        _pause();
    }

    /**
     * @notice Unpauses the contract.
     */
    function unpause() external onlyOwner(keccak256("unpause")) {
        _unpause();
    }
}
