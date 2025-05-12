const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const helpers = require("../helpers/testHelpers");

describe("Shin2Chin Integration Tests - Betting Flow", function () {
  // Test fixture to deploy contract once and reuse
  async function deployContractFixture() {
    const [owner, backupAdmin, user1, user2, user3] = await ethers.getSigners();
    
    // Deploy mock USDT token for testing
    const MockToken = await ethers.getContractFactory("MockERC20");
    const mockToken = await MockToken.deploy("Mock USDT", "mUSDT", 6);
    await mockToken.waitForDeployment();
    
    // Deploy Shin2Chin contract
    const Shin2Chin = await ethers.getContractFactory("Shin2Chin");
    const shin2chin = await upgrades.deployProxy(
      Shin2Chin,
      [await mockToken.getAddress(), owner.address, backupAdmin.address],
      { initializer: "initialize" }
    );
    await shin2chin.waitForDeployment();
    
    // Mint mock tokens to users
    const mintAmount = ethers.parseUnits("10000", 6); // 10,000 USDT
    await mockToken.mint(user1.address, mintAmount);
    await mockToken.mint(user2.address, mintAmount);
    await mockToken.mint(user3.address, mintAmount);
    
    return { shin2chin, mockToken, owner, backupAdmin, user1, user2, user3 };
  }
  
  describe("End-to-End Betting Workflow", function () {
    it("Should complete the full betting cycle with Fighter A winning", async function () {
      const fixture = await loadFixture(deployContractFixture);
      const { shin2chin, mockToken, owner, user1, user2, user3 } = fixture;
      
      // 1. Create a fight
      const fightId = 1;
      const { startTime } = await helpers.createFight(shin2chin, owner, fightId, 24);
      
      // 2. Users add funds
      const fundAmount = ethers.parseUnits("1000", 6);
      await helpers.addFunds(shin2chin, mockToken, user1, fundAmount);
      await helpers.addFunds(shin2chin, mockToken, user2, fundAmount);
      await helpers.addFunds(shin2chin, mockToken, user3, fundAmount);
      
      // 3. Users place bets
      const betAmount = ethers.parseUnits("100", 6);
      
      // User1 and User3 bet on Fighter A
      await helpers.placeBet(shin2chin, user1, fightId, true, betAmount);
      await helpers.placeBet(shin2chin, user3, fightId, true, betAmount.mul(2)); // User3 bets more
      
      // User2 bets on Fighter B
      await helpers.placeBet(shin2chin, user2, fightId, false, betAmount.mul(3));
      
      // 4. Fight takes place - advance time
      await time.increaseTo(startTime + 3600); // 1 hour after start
      
      // Record balances before result submission
      const user1BalanceBefore = await shin2chin.userBalances(user1.address);
      const user2BalanceBefore = await shin2chin.userBalances(user2.address);
      const user3BalanceBefore = await shin2chin.userBalances(user3.address);
      
      // 5. Admin submits result - Fighter A wins
      await shin2chin.connect(owner).submitFightResult(fightId, true);
      
      // 6. Verify payouts and balances
      // Calculate expected payouts:
      // - Total bet on A: 100 + 200 = 300
      // - Total bet on B: 300
      // - Total matched: 300 (because equal amounts on both sides)
      // - User1 bet 100 and should get 100*2 - fee = 198
      // - User3 bet 200 and should get 200*2 - fee = 396
      // - User2 bet 300 (lost 300, but should get unmatched amount of 0 back)
      
      const fee = ethers.parseUnits("1", 6).div(100); // 1%
      const user1ExpectedPayout = betAmount.mul(2).sub(betAmount.mul(2).mul(fee).div(100));
      const user3ExpectedPayout = betAmount.mul(2).mul(2).sub(betAmount.mul(2).mul(2).mul(fee).div(100));
      
      // Check balances
      const user1BalanceAfter = await shin2chin.userBalances(user1.address);
      const user2BalanceAfter = await shin2chin.userBalances(user2.address);
      const user3BalanceAfter = await shin2chin.userBalances(user3.address);
      
      expect(user1BalanceAfter).to.be.gt(user1BalanceBefore);
      expect(user2BalanceAfter).to.equal(user2BalanceBefore);
      expect(user3BalanceAfter).to.be.gt(user3BalanceBefore);
      
      // 7. Check user stats were updated
      const user1Stats = await shin2chin.getUserStats(user1.address);
      const user2Stats = await shin2chin.getUserStats(user2.address);
      const user3Stats = await shin2chin.getUserStats(user3.address);
      
      expect(user1Stats[0]).to.equal(1); // totalBets
      expect(user1Stats[1]).to.equal(1); // totalWins
      expect(user2Stats[0]).to.equal(1); // totalBets
      expect(user2Stats[1]).to.equal(0); // totalWins
      expect(user3Stats[0]).to.equal(1); // totalBets
      expect(user3Stats[1]).to.equal(1); // totalWins
    });
    
    it("Should handle partially matched bets correctly", async function () {
      const fixture = await loadFixture(deployContractFixture);
      const { shin2chin, mockToken, owner, user1, user2 } = fixture;
      
      // 1. Create a fight
      const fightId = 1;
      const { startTime } = await helpers.createFight(shin2chin, owner, fightId, 24);
      
      // 2. Users add funds
      const fundAmount = ethers.parseUnits("1000", 6);
      await helpers.addFunds(shin2chin, mockToken, user1, fundAmount);
      await helpers.addFunds(shin2chin, mockToken, user2, fundAmount);
      
      // 3. Users place bets with unequal amounts
      const user1BetAmount = ethers.parseUnits("300", 6); // More on Fighter A
      const user2BetAmount = ethers.parseUnits("100", 6); // Less on Fighter B
      
      await helpers.placeBet(shin2chin, user1, fightId, true, user1BetAmount);
      await helpers.placeBet(shin2chin, user2, fightId, false, user2BetAmount);
      
      // Record balances before result submission
      const user1BalanceBefore = await shin2chin.userBalances(user1.address);
      const user2BalanceBefore = await shin2chin.userBalances(user2.address);
      
      // 4. Fight takes place - advance time
      await time.increaseTo(startTime + 3600);
      
      // 5. Admin submits result - Fighter A wins
      await shin2chin.connect(owner).submitFightResult(fightId, true);
      
      // 6. Verify payouts and refunds
      // - User1 bet 300, with 100 matched and 200 unmatched
      // - User1 should get winnings for 100 (100*2 - fee) plus refund of 200
      // - User2 bet 100, all matched and lost, should get 0
      
      const fee = ethers.parseUnits("1", 6).div(100); // 1%
      const matchedAmount = user2BetAmount; // 100 is matched
      const unmatchedAmount = user1BetAmount.sub(matchedAmount); // 200 is unmatched
      
      const user1ExpectedPayout = matchedAmount.mul(2).sub(matchedAmount.mul(2).mul(fee).div(100)).add(unmatchedAmount);
      
      // Check balances
      const user1BalanceAfter = await shin2chin.userBalances(user1.address);
      const user2BalanceAfter = await shin2chin.userBalances(user2.address);
      
      // User1 should get payout for matched amount plus refund
      expect(user1BalanceAfter.sub(user1BalanceBefore)).to.be.closeTo(
        user1ExpectedPayout,
        ethers.parseUnits("1", 3) // Allow small rounding difference
      );
      
      // User2 should get nothing (lost all matched bets)
      expect(user2BalanceAfter).to.equal(user2BalanceBefore);
    });
    
    it("Should successfully match bets from multiple users", async function () {
      const fixture = await loadFixture(deployContractFixture);
      const { shin2chin, mockToken, owner, user1, user2, user3 } = fixture;
      
      // 1. Create a fight
      const fightId = 1;
      await helpers.createFight(shin2chin, owner, fightId, 24);
      
      // 2. Users add funds
      const fundAmount = ethers.parseUnits("1000", 6);
      await helpers.addFunds(shin2chin, mockToken, user1, fundAmount);
      await helpers.addFunds(shin2chin, mockToken, user2, fundAmount);
      await helpers.addFunds(shin2chin, mockToken, user3, fundAmount);
      
      // 3. User1 places a bet on Fighter A
      const betAmount = ethers.parseUnits("200", 6);
      await helpers.placeBet(shin2chin, user1, fightId, true, betAmount);
      
      // 4. User2 places a bet on Fighter B - should be matched with User1's bet
      await helpers.placeBet(shin2chin, user2, fightId, false, betAmount.div(2));
      
      // 5. User3 places another bet on Fighter B - should match the rest of User1's bet
      await helpers.placeBet(shin2chin, user3, fightId, false, betAmount.div(2));
      
      // 6. Check that all bets are fully matched
      // This would require event inspection or specific contract functions
      // For the sake of this test, we'll verify through balance checks after settlement
      
      // 7. Admin submits result - Fighter B wins
      await helpers.submitResult(shin2chin, owner, fightId, false);
      
      // 8. Check user stats to verify wins for User2 and User3
      const user1Stats = await shin2chin.getUserStats(user1.address);
      const user2Stats = await shin2chin.getUserStats(user2.address);
      const user3Stats = await shin2chin.getUserStats(user3.address);
      
      expect(user1Stats[1]).to.equal(0); // User1 should have 0 wins
      expect(user2Stats[1]).to.equal(1); // User2 should have 1 win
      expect(user3Stats[1]).to.equal(1); // User3 should have 1 win
      
      // User2 and User3 should have payouts, User1 should not
      expect(user1Stats[3]).to.equal(0); // No payout for User1
      expect(user2Stats[3]).to.be.gt(0); // User2 got payout
      expect(user3Stats[3]).to.be.gt(0); // User3 got payout
    });
  });
});