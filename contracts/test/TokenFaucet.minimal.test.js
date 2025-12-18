const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenFaucet – minimal spec-aligned tests", function () {
  let token, faucet, owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("FaucetToken");
    const Faucet = await ethers.getContractFactory("TokenFaucet");

    // Deploy token with a dummy faucet address (owner)
    token = await Token.deploy(owner.address);
    await token.waitForDeployment();

    // Deploy faucet with token address
    faucet = await Faucet.deploy(token.target);
    await faucet.waitForDeployment();
  });

  it("deployer is admin", async function () {
    expect(await faucet.admin()).to.equal(owner.address);
  });

  it("is not paused by default", async function () {
    expect(await faucet.isPaused()).to.equal(false);
  });

  it("only admin can pause", async function () {
    await expect(
      faucet.connect(user).setPaused(true)
    ).to.be.revertedWith("Only admin can pause");

    await faucet.setPaused(true);
    expect(await faucet.isPaused()).to.equal(true);
  });

  it("canClaim returns false when paused", async function () {
    await faucet.setPaused(true);
    expect(await faucet.canClaim(user.address)).to.equal(false);
  });
});

