const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Shin2Chin", function () {
  let shin2Chin;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const Shin2Chin = await ethers.getContractFactory("Shin2Chin");
    shin2Chin = await Shin2Chin.deploy();
    await shin2Chin.deployed();

    // Initialize the contract
    await shin2Chin.initialize(
      "0x1234567890123456789012345678901234567890", // Replace with a valid USDT token address
      owner.address,
      addr1.address
    );
  });

  it("Should deploy the contract and set the correct owner", async function () {
    expect(await shin2Chin.owner1()).to.equal(owner.address);
    expect(await shin2Chin.owner2()).to.equal(addr1.address);
  });
});