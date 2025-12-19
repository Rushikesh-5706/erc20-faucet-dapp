import { ethers } from "ethers"
import FaucetTokenArtifact from "../abis/FaucetToken.json"
import TokenFaucetArtifact from "../abis/TokenFaucet.json"

const FaucetTokenABI = FaucetTokenArtifact.abi
const TokenFaucetABI = TokenFaucetArtifact.abi

export const getProvider = () =>
  new ethers.BrowserProvider(window.ethereum)

export const getSigner = async () => {
  const provider = getProvider()
  return await provider.getSigner()
}

export const getFaucetContract = async () => {
  const signer = await getSigner()

  return new ethers.Contract(
    import.meta.env.VITE_FAUCET_ADDRESS,
    TokenFaucetABI,
    signer
  )
}

export const getTokenContractFromFaucet = async () => {
  const provider = getProvider()

  const faucet = new ethers.Contract(
    import.meta.env.VITE_FAUCET_ADDRESS,
    TokenFaucetABI,
    provider
  )

  const tokenAddress = await faucet.token()

  return new ethers.Contract(
    tokenAddress,
    FaucetTokenABI,
    provider
  )
}

