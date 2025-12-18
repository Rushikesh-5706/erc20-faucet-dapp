import {
  connectWallet,
  getTokenContract,
  getFaucetContract,
} from "./contracts";

window.__EVAL__ = {
  // Connect wallet and return address
  connectWallet: async () => {
    const address = await connectWallet();
    if (!address) throw new Error("Wallet connection failed");
    return address;
  },

  // Request tokens and return tx hash
  requestTokens: async () => {
    try {
      const faucet = await getFaucetContract(true);
      const tx = await faucet.requestTokens();
      await tx.wait();
      return tx.hash;
    } catch (err) {
      throw new Error(err.reason || err.message || "Token request failed");
    }
  },

  // Get ERC20 token balance (string)
  getBalance: async (address) => {
    const token = await getTokenContract();
    return (await token.balanceOf(address)).toString();
  },

  // Check if user can claim
  canClaim: async (address) => {
    const faucet = await getFaucetContract();
    return await faucet.canClaim(address);
  },

  // Get remaining lifetime allowance (string)
  getRemainingAllowance: async (address) => {
    const faucet = await getFaucetContract();
    return (await faucet.remainingAllowance(address)).toString();
  },

  // Return deployed contract addresses
  getContractAddresses: async () => {
    return {
      token: import.meta.env.VITE_TOKEN_ADDRESS,
      faucet: import.meta.env.VITE_FAUCET_ADDRESS,
    };
  },
};

