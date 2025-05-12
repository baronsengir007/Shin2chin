const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Test helpers for Shin2Chin contract testing
 */
const helpers = {
  /**
   * Create a fight and advance time to betting period
   * @param {Contract} shin2chin - The Shin2Chin contract
   * @param {Signer} admin - The admin signer
   * @param {Number} fightId - The fight ID
   * @param {Number} hoursUntilStart - Hours until fight starts
   * @returns {Promise<Object>} Fight details
   */
  async createFight(shin2chin, admin, fightId, hoursUntilStart = 24) {
    const startTime = await time.latest() + hoursUntilStart * 3600;
    
    await shin2chin.connect(admin).createFight(
      fightId,
      startTime,
      "Fighter A",
      "Fighter B"
    );
    
    return {
      fightId,
      startTime,
      betCloseTime: startTime - (5 * 60) // 5 minutes before start
    };
  },
  
  /**
   * Add funds to a user's balance
   * @param {Contract} shin2chin - The Shin2Chin contract
   * @param {Contract} mockToken - The mock USDT token
   * @param {Signer} user - The user signer
   * @param {BigNumber} amount - The amount to add
   */
  async addFunds(shin2chin, mockToken, user, amount) {
    await mockToken.connect(user).approve(
      await shin2chin.getAddress(),
      amount
    );
    
    await shin2chin.connect(user).addFunds(amount);
  },
  
  /**
   * Place a bet on a fight
   * @param {Contract} shin2chin - The Shin2Chin contract
   * @param {Signer} user - The user signer
   * @param {Number} fightId - The fight ID
   * @param {Boolean} side - The side to bet on (true for Fighter A, false for Fighter B)
   * @param {BigNumber} amount - The amount to bet
   */
  async placeBet(shin2chin, user, fightId, side, amount) {
    await shin2chin.connect(user).placeBet(fightId, side, amount);
  },
  
  /**
   * Setup a complete betting scenario
   * @param {Object} fixture - The test fixture
   * @param {Number} fightId - The fight ID
   * @returns {Promise<Object>} Setup details
   */
  async setupBettingScenario(fixture, fightId = 1) {
    const { shin2chin, mockToken, owner, user1, user2, user3 } = fixture;
    
    // Create fight
    const fight = await helpers.createFight(shin2chin, owner, fightId);
    
    // Add funds to users
    const fundAmount = ethers.parseUnits("1000", 6);
    await helpers.addFunds(shin2chin, mockToken, user1, fundAmount);
    await helpers.addFunds(shin2chin, mockToken, user2, fundAmount);
    await helpers.addFunds(shin2chin, mockToken, user3, fundAmount);
    
    // Place bets
    const betAmount = ethers.parseUnits("100", 6);
    await helpers.placeBet(shin2chin, user1, fightId, true, betAmount); // User1 bets on Fighter A
    await helpers.placeBet(shin2chin, user2, fightId, false, betAmount); // User2 bets on Fighter B
    
    return {
      fight,
      fundAmount,
      betAmount
    };
  },
  
  /**
   * Submit fight result and advance time for settlement
   * @param {Contract} shin2chin - The Shin2Chin contract
   * @param {Signer} admin - The admin signer
   * @param {Number} fightId - The fight ID
   * @param {Boolean} winner - The winning side (true for Fighter A, false for Fighter B)
   */
  async submitResult(shin2chin, admin, fightId, winner) {
    // Advance time past fight start
    const fightInfo = await shin2chin.getFightInfo(fightId);
    const startTime = fightInfo[0];
    await time.increaseTo(startTime.add(3600)); // 1 hour after start
    
    // Submit result
    await shin2chin.connect(admin).submitFightResult(fightId, winner);
  },
  
  /**
   * Convert an amount to a formatted string
   * @param {BigNumber} amount - The amount
   * @param {Number} decimals - The number of decimals
   * @returns {String} Formatted amount
   */
  formatAmount(amount, decimals = 6) {
    return ethers.formatUnits(amount, decimals);
  }
};

module.exports = helpers;