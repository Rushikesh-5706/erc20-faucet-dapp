const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 1. Deploy Token FIRST
  const FaucetToken = await hre.ethers.getContractFactory("FaucetToken");
  const token = await FaucetToken.deploy();
  await token.waitForDeployment();

  console.log("Token deployed to:", token.target);

  // 2. Deploy Faucet with Token address
  const TokenFaucet = await hre.ethers.getContractFactory("TokenFaucet");
  const faucet = await TokenFaucet.deploy(token.target);
  await faucet.waitForDeployment();

  console.log("Faucet deployed to:", faucet.target);

  // 3. Link Faucet as minter
  const tx = await token.setFaucet(faucet.target);
  await tx.wait();

  console.log("Faucet authorized as minter ✅");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

