const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Shin2Chin Unit Tests", function () {
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
  
  describe("Initialization", function () {
    it("Should initialize with correct values", async function () {
      const { shin2chin, mockToken, owner, backupAdmin } = await loadFixture(deployContractFixture);
      
      // Check initialization parameters
      expect(await shin2chin.usdtToken()).to.equal(await mockToken.getAddress());
      expect(await shin2chin.admin()).to.equal(owner.address);
      expect(await shin2chin.backupAdmin()).to.equal(backupAdmin.address);
      expect(await shin2chin.VERSION()).to.equal("1.3.0");
    });
  });
  
  describe("Fight Management", function () {
    it("Should create a fight correctly", async function () {
      const { shin2chin, owner } = await loadFixture(deployContractFixture);
      
      const fightId = 1;
      const startTime = await time.latest() + 3600; // 1 hour in the future
      
      await expect(
        shin2chin.connect(owner).createFight(
          fightId,
          startTime,
          "Fighter A",
          "Fighter B"
        )
      )
        .to.emit(shin2chin, "FightCreated")
        .withArgs(fightId, startTime, "Fighter A", "Fighter B");
      
      // Check fight was created correctly
      const fightInfo = await shin2chin.getFightInfo(fightId);
      expect(fightInfo[0]).to.equal(startTime);
      expect(fightInfo[1]).to.equal(0); // FightResultState.Pending
      
      const fighters = await shin2chin.getFighterNames(fightId);
      expect(fighters[0]).to.equal("Fighter A");
      expect(fighters[1]).to.equal("Fighter B");
    });
    
    it("Should revert when non-admin tries to create a fight", async function () {
      const { shin2chin, user1 } = await loadFixture(deployContractFixture);
      
      const fightId = 1;
      const startTime = await time.latest() + 3600;
      
      await expect(
        shin2chin.connect(user1).createFight(
          fightId,
          startTime,
          "Fighter A",
          "Fighter B"
        )
      ).to.be.revertedWithCustomError(shin2chin, "NotAnAdmin");
    });
    
    it("Should revert when creating a fight with past start time", async function () {
      const { shin2chin, owner } = await loadFixture(deployContractFixture);
      
      const fightId = 1;
      const startTime = await time.latest() - 3600; // 1 hour in the past
      
      await expect(
        shin2chin.connect(owner).createFight(
          fightId,
          startTime,
          "Fighter A",
          "Fighter B"
        )
      ).to.be.revertedWithCustomError(shin2chin, "InvalidTimeInput");
    });
  });
  
  describe("Fund Management", function () {
    it("Should add funds to user balance", async function () {
      const { shin2chin, mockToken, user1 } = await loadFixture(deployContractFixture);
      
      const depositAmount = ethers.parseUnits("100", 6); // 100 USDT
      
      // Approve token transfer
      await mockToken.connect(user1).approve(
        await shin2chin.getAddress(),
        depositAmount
      );
      
      // Add funds
      await expect(
        shin2chin.connect(user1).addFunds(depositAmount)
      )
        .to.emit(shin2chin, "FundsAdded")
        .withArgs(user1.address, depositAmount);
      
      // Check balance was updated
      expect(await shin2chin.userBalances(user1.address)).to.equal(depositAmount);
    });
    
    it("Should allow withdrawal of funds", async function () {
      const { shin2chin, mockToken, user1 } = await loadFixture(deployContractFixture);
      
      const depositAmount = ethers.parseUnits("100", 6);
      const withdrawAmount = ethers.parseUnits("50", 6);
      
      // Add funds first
      await mockToken.connect(user1).approve(
        await shin2chin.getAddress(),
        depositAmount
      );
      await shin2chin.connect(user1).addFunds(depositAmount);
      
      // Withdraw funds
      await expect(
        shin2chin.connect(user1).withdrawFunds(withdrawAmount)
      )
        .to.emit(shin2chin, "FundsWithdrawn")
        .withArgs(user1.address, withdrawAmount);
      
      // Check balance was updated
      expect(await shin2chin.userBalances(user1.address))
        .to.equal(depositAmount - withdrawAmount);
    });
    
    it("Should revert when withdrawing more than available balance", async function () {
      const { shin2chin, mockToken, user1 } = await loadFixture(deployContractFixture);
      
      const depositAmount = ethers.parseUnits("100", 6);
      const withdrawAmount = ethers.parseUnits("150", 6);
      
      // Add funds first
      await mockToken.connect(user1).approve(
        await shin2chin.getAddress(),
        depositAmount
      );
      await shin2chin.connect(user1).addFunds(depositAmount);
      
      // Try to withdraw more than available
      await expect(
        shin2chin.connect(user1).withdrawFunds(withdrawAmount)
      ).to.be.revertedWithCustomError(shin2chin, "InsufficientBalance");
    });
  });
  
  // Additional test placeholders to be expanded
  describe("Betting System", function () {
    it("Should place a bet correctly");
    it("Should match bets from opposing sides");
    it("Should revert when betting on a non-existent fight");
  });
  
  describe("Result Submission and Settlement", function () {
    it("Should submit results correctly");
    it("Should pay out winners and refund unmatched bets");
    it("Should update fighter records correctly");
  });
  
  describe("Admin Functions", function () {
    it("Should allow admin to change admin addresses");
    it("Should allow admin to pause/unpause the contract");
    it("Should revert admin functions for non-admins");
  });
});