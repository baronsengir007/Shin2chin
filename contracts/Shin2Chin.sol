// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

/**
 * @title Shin2Chin
 * @dev P2P betting platform for combat sports/fighting matches
 * @notice This contract has been simplified to focus on core functionality
 * by removing the oracle system, complex dispute resolution mechanism,
 * and consolidating bet storage for improved gas efficiency
 */
contract Shin2Chin is Initializable, PausableUpgradeable, ReentrancyGuardUpgradeable {
    // Version
    string public constant VERSION = "1.3.0";

    IERC20Upgradeable public usdtToken;

    struct Fighter {
        string name;
        uint256 wins;
        uint256 losses;
        uint256 draws;
    }

    enum FightResultState { Pending, Final }

    struct Fight {
        uint256 startTime;
        uint256 endTime;
        uint256 totalMatchedBets;
        uint256 totalBetsA;
        uint256 totalBetsB;
        uint256 betCloseTime;
        bool settled;
        FightResultState resultState;
        bool winner; // true for A, false for B
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

    // State variables
    mapping(uint256 => Fight) private fights;
    // Consolidated bet storage: single array per fight to simplify logic
    mapping(uint256 => Bet[]) private bets;
    mapping(address => uint256) public userBalances;
    mapping(address => UserStats) private userStats;
    mapping(uint256 => mapping(address => bool)) public userBetStatus;

    address public admin;
    address public backupAdmin;
    
    // Constants
    uint256 public constant BET_CLOSE_TIME = 5 minutes;
    uint256 public constant FEE_PERCENTAGE = 1; // 1% fee
    uint256 public constant MIN_BET_AMOUNT = 1 * 10**6; // 1 USDT
    uint256 public constant MAX_BET_AMOUNT = 10000 * 10**6; // 10,000 USDT

    // Events
    event FightCreated(uint256 indexed fightId, uint256 startTime, string fighterA, string fighterB);
    event BetPlaced(uint256 indexed fightId, address indexed bettor, uint256 amount, uint256 matchedAmount, bool side);
    event BetMatched(uint256 indexed fightId, uint256 indexed betIndex, uint256 matchedAmount);
    event FightResultSubmitted(uint256 indexed fightId, bool winner);
    event FightSettled(uint256 indexed fightId, bool winner, uint256 platformFees);
    event BetPayout(address indexed bettor, uint256 amount, uint256 indexed fightId);
    event BetRefund(address indexed bettor, uint256 amount, uint256 indexed fightId);
    event FundsAdded(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed user, uint256 amount);
    event AdminChanged(address indexed previousAdmin, address indexed newAdmin);

    // Custom error messages
    error InvalidFightId(uint256 fightId);
    error InvalidBetAmount(uint256 amount);
    error ExceedsMaxBetAmount();
    error InsufficientBalance(address user, uint256 required, uint256 actual);
    error BettingClosed(uint256 fightId);
    error FightNotFound(uint256 fightId);
    error FightNotStarted(uint256 fightId);
    error UnauthorizedAction(address user);
    error InvalidTimeInput(uint256 time);
    error FightAlreadySettled(uint256 fightId);
    error NotAnAdmin(address caller);
    error FightResultAlreadySubmitted(uint256 fightId);
    error InvalidResultSubmission(uint256 fightId);
    error FightAlreadyExists(uint256 fightId);
    error FightNotCompleted(uint256 fightId);
    error TransferFailed();
    error InvalidAmount();

    modifier onlyAdmin() {
        if (msg.sender != admin && msg.sender != backupAdmin) {
            revert NotAnAdmin(msg.sender);
        }
        _;
    }

    /**
     * @notice Initializes the contract with the given parameters.
     * @param _usdtToken The address of the USDT token contract.
     * @param _admin The address of the primary admin.
     * @param _backupAdmin The address of the backup admin.
     */
    function initialize(
        address _usdtToken,
        address _admin,
        address _backupAdmin
    ) public initializer {
        __Pausable_init();
        __ReentrancyGuard_init();
        usdtToken = IERC20Upgradeable(_usdtToken);
        admin = _admin;
        backupAdmin = _backupAdmin;
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
    ) external onlyAdmin {
        // Validate inputs
        if (fights[_fightId].startTime != 0) revert FightAlreadyExists(_fightId);
        if (_startTime <= block.timestamp) revert InvalidTimeInput(_startTime);
        
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
        newFight.betCloseTime = _startTime - BET_CLOSE_TIME;
        newFight.settled = false;
        newFight.resultState = FightResultState.Pending;
        newFight.winner = false;
        newFight.fighterA = fighterA;
        newFight.fighterB = fighterB;

        emit FightCreated(_fightId, _startTime, _fighterAName, _fighterBName);
    }

    /**
     * @notice Places a bet on a fight.
     * @param _fightId The ID of the fight.
     * @param _side The side the bettor is betting on (true for Fighter A, false for Fighter B).
     * @param _amount The amount being bet.
     */
    function placeBet(uint256 _fightId, bool _side, uint256 _amount) external nonReentrant whenNotPaused {
        Fight storage fight = fights[_fightId];
        
        // Validate fight and bet
        if (fight.startTime == 0) revert FightNotFound(_fightId);
        if (fight.resultState != FightResultState.Pending) revert BettingClosed(_fightId);
        if (block.timestamp >= fight.betCloseTime) revert BettingClosed(_fightId);
        if (_amount < MIN_BET_AMOUNT || _amount > MAX_BET_AMOUNT) revert InvalidBetAmount(_amount);
        if (userBalances[msg.sender] < _amount) revert InsufficientBalance(msg.sender, _amount, userBalances[msg.sender]);
        if (userBetStatus[_fightId][msg.sender]) revert InvalidFightId(_fightId); // User has already placed a bet on this fight

        // Update user balance
        userBalances[msg.sender] -= _amount;
        userBetStatus[_fightId][msg.sender] = true;

        // Calculate how much can be matched right away
        uint256 opposingSideTotalBets = _side ? fight.totalBetsB : fight.totalBetsA;
        uint256 availableToMatch = opposingSideTotalBets > fight.totalMatchedBets ? 
            opposingSideTotalBets - fight.totalMatchedBets : 0;
        uint256 matchedAmount = _amount < availableToMatch ? _amount : availableToMatch;
        
        // Create the bet and store it
        bets[_fightId].push(Bet({
            bettor: msg.sender,
            amount: _amount,
            matchedAmount: matchedAmount,
            side: _side,
            cancelled: false
        }));
        
        // Update fight betting totals
        if (_side) {
            fight.totalBetsA += _amount;
        } else {
            fight.totalBetsB += _amount;
        }
        
        if (matchedAmount > 0) {
            fight.totalMatchedBets += matchedAmount;
        }
        
        // Update user stats
        UserStats storage stats = userStats[msg.sender];
        stats.totalBets += 1;
        stats.totalAmount += _amount;
        
        emit BetPlaced(_fightId, msg.sender, _amount, matchedAmount, _side);
        
        // Try to match any previously unmatched bets from the opposite side
        _matchUnmatchedBets(_fightId);
    }

    /**
     * @dev Matches previously unmatched bets for a fight.
     * @param _fightId The ID of the fight.
     */
    function _matchUnmatchedBets(uint256 _fightId) internal {
        Fight storage fight = fights[_fightId];
        
        // Calculate available amounts to be matched on each side
        uint256 availableA = fight.totalBetsA > fight.totalMatchedBets ? 
            fight.totalBetsA - fight.totalMatchedBets : 0;
        uint256 availableB = fight.totalBetsB > fight.totalMatchedBets ? 
            fight.totalBetsB - fight.totalMatchedBets : 0;
        
        // Nothing to match if either side has no available unmatched amount
        if (availableA == 0 || availableB == 0) return;
        
        uint256 toMatch = availableA < availableB ? availableA : availableB;
        uint256 matchedSoFar = 0;
        
        // Match bets until we've matched the maximum possible amount
        for (uint256 i = 0; i < bets[_fightId].length && matchedSoFar < toMatch; i++) {
            Bet storage bet = bets[_fightId][i];
            
            // Skip bets that are fully matched or cancelled
            if (bet.matchedAmount == bet.amount || bet.cancelled) continue;
            
            uint256 unmatchedAmount = bet.amount - bet.matchedAmount;
            if (unmatchedAmount > 0) {
                // Determine if this is a bet we can match more of
                bool canMatch = (bet.side && availableB > 0) || (!bet.side && availableA > 0);
                
                if (canMatch) {
                    uint256 amountToMatch = unmatchedAmount < (toMatch - matchedSoFar) ? 
                        unmatchedAmount : (toMatch - matchedSoFar);
                    
                    if (amountToMatch > 0) {
                        bet.matchedAmount += amountToMatch;
                        matchedSoFar += amountToMatch;
                        
                        emit BetMatched(_fightId, i, amountToMatch);
                    }
                }
            }
        }
        
        // Update the total matched bets
        fight.totalMatchedBets += matchedSoFar;
    }

    /**
     * @notice Submits the result of a fight by an admin.
     * @param _fightId The ID of the fight.
     * @param _winner The winning side (true for Fighter A, false for Fighter B).
     */
    function submitFightResult(uint256 _fightId, bool _winner) external onlyAdmin {
        Fight storage fight = fights[_fightId];

        // Validate fight
        if (fight.startTime == 0) revert FightNotFound(_fightId);
        if (fight.resultState != FightResultState.Pending) revert FightResultAlreadySubmitted(_fightId);
        if (block.timestamp < fight.startTime) revert FightNotStarted(_fightId);

        // Update fight with result
        fight.resultState = FightResultState.Final;
        fight.winner = _winner;
        fight.endTime = block.timestamp;
        
        // Update fighter records
        if (_winner) {
            fight.fighterA.wins += 1;
            fight.fighterB.losses += 1;
        } else {
            fight.fighterB.wins += 1;
            fight.fighterA.losses += 1;
        }
        
        emit FightResultSubmitted(_fightId, _winner);
        
        // Immediately settle the fight
        _settleFight(_fightId);
    }

    /**
     * @dev Settles the fight by distributing payouts and refunds.
     * @param _fightId The ID of the fight.
     */
    function _settleFight(uint256 _fightId) internal {
        Fight storage fight = fights[_fightId];
        
        // Validate fight can be settled
        if (fight.resultState != FightResultState.Final) revert FightNotCompleted(_fightId);
        if (fight.settled) revert FightAlreadySettled(_fightId);

        bool winnerSide = fight.winner;
        uint256 platformFees = 0;
        
        // Process all bets
        for (uint256 i = 0; i < bets[_fightId].length; i++) {
            Bet storage bet = bets[_fightId][i];
            
            // Handle matched portion of bet
            if (bet.matchedAmount > 0) {
                if (bet.side == winnerSide) {
                    // Winner gets matched amount * 2, minus fee
                    uint256 matchedPayout = bet.matchedAmount * 2;
                    uint256 fee = (matchedPayout * FEE_PERCENTAGE) / 100;
                    uint256 netPayout = matchedPayout - fee;
                    
                    userBalances[bet.bettor] += netPayout;
                    platformFees += fee;
                    
                    // Update user stats
                    userStats[bet.bettor].totalWins += 1;
                    userStats[bet.bettor].totalPayout += netPayout;
                    
                    emit BetPayout(bet.bettor, netPayout, _fightId);
                }
                // Losers don't get anything for matched portions
            }
            
            // Handle unmatched portion of bet (always refunded)
            uint256 unmatchedAmount = bet.amount - bet.matchedAmount;
            if (unmatchedAmount > 0) {
                userBalances[bet.bettor] += unmatchedAmount;
                emit BetRefund(bet.bettor, unmatchedAmount, _fightId);
            }
        }
        
        // Mark fight as settled
        fight.settled = true;
        
        emit FightSettled(_fightId, winnerSide, platformFees);
    }

    /**
     * @notice Adds funds to the user's balance.
     * @param _amount The amount to add.
     */
    function addFunds(uint256 _amount) external whenNotPaused {
        if (_amount == 0) revert InvalidAmount();
        
        // Transfer tokens from user to contract
        bool success = IERC20Upgradeable(usdtToken).transferFrom(
            msg.sender, 
            address(this), 
            _amount
        );
        if (!success) revert TransferFailed();
        
        // Update user balance
        userBalances[msg.sender] += _amount;
        
        emit FundsAdded(msg.sender, _amount);
    }

    /**
     * @notice Withdraws funds from the user's balance.
     * @param _amount The amount to withdraw.
     */
    function withdrawFunds(uint256 _amount) external nonReentrant whenNotPaused {
        if (_amount == 0) revert InvalidAmount();
        if (userBalances[msg.sender] < _amount) revert InsufficientBalance(msg.sender, _amount, userBalances[msg.sender]);
        
        // Update user balance
        userBalances[msg.sender] -= _amount;
        
        // Transfer tokens from contract to user
        bool success = IERC20Upgradeable(usdtToken).transfer(
            msg.sender, 
            _amount
        );
        if (!success) revert TransferFailed();
        
        emit FundsWithdrawn(msg.sender, _amount);
    }

    /**
     * @notice Retrieves basic information about a fight.
     * @param _fightId The ID of the fight.
     * @return startTime The start time of the fight.
     * @return resultState The current result state of the fight.
     * @return winner The winner of the fight.
     */
    function getFightInfo(uint256 _fightId)
        external
        view
        returns (
            uint256 startTime,
            FightResultState resultState,
            bool winner
        )
    {
        Fight storage fight = fights[_fightId];
        return (fight.startTime, fight.resultState, fight.winner);
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
     * @notice Changes the admin address.
     * @param _newAdmin The address of the new admin.
     * @param _isBackupAdmin Whether to replace the backup admin (true) or primary admin (false).
     */
    function changeAdmin(address _newAdmin, bool _isBackupAdmin) external onlyAdmin {
        address oldAdmin;
        if (_isBackupAdmin) {
            oldAdmin = backupAdmin;
            backupAdmin = _newAdmin;
        } else {
            oldAdmin = admin;
            admin = _newAdmin;
        }
        emit AdminChanged(oldAdmin, _newAdmin);
    }

    /**
     * @notice Pauses the contract.
     */
    function pause() external onlyAdmin {
        _pause();
    }

    /**
     * @notice Unpauses the contract.
     */
    function unpause() external onlyAdmin {
        _unpause();
    }

    /**
     * @notice Emergency withdrawal of funds (admin only).
     * @param _token The token to withdraw.
     * @param _amount The amount to withdraw.
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyAdmin {
        if (_token == address(usdtToken)) {
            // For platform token, ensure we maintain sufficient balance for user funds
            // This calculation is simplified and should be improved for production
            uint256 balance = IERC20Upgradeable(_token).balanceOf(address(this));
            if (_amount > balance) revert InvalidAmount();
        }
        
        bool success = IERC20Upgradeable(_token).transfer(admin, _amount);
        if (!success) revert TransferFailed();
    }
}