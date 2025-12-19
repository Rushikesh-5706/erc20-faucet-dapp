import { ethers } from "ethers"
import {
  getFaucetContract,
  getTokenContractFromFaucet,
} from "./contracts"

window.__EVAL__ = {
  connectWallet: async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask not found")
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await provider.send("eth_requestAccounts", [])
    return accounts[0]
  },

  requestTokens: async () => {
    const faucet = await getFaucetContract()
    const tx = await faucet.requestTokens()
    await tx.wait()
    return tx.hash
  },

  getBalance: async (address) => {
    const token = await getTokenContractFromFaucet()
    const bal = await token.balanceOf(address)
    return bal.toString()
  },

  canClaim: async (address) => {
    const faucet = await getFaucetContract()
    return await faucet.canClaim(address)
  },

  getRemainingAllowance: async (address) => {
    const faucet = await getFaucetContract()
    const remaining = await faucet.remainingAllowance(address)
    return remaining.toString()
  },

  getContractAddresses: async () => {
    const faucet = await getFaucetContract()
    const token = await faucet.token()
    return {
      token,
      faucet: import.meta.env.VITE_FAUCET_ADDRESS,
    }
  },
}

