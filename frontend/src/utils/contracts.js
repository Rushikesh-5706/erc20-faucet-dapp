import { ethers } from "ethers";

const RPC_URL = import.meta.env.VITE_RPC_URL;
const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS;
const FAUCET_ADDRESS = import.meta.env.VITE_FAUCET_ADDRESS;

let provider;
let signer;

const tokenAbi = [
  "function balanceOf(address) view returns (uint256)"
];

const faucetAbi = [
  "function requestTokens()",
  "function canClaim(address) view returns (bool)",
  "function remainingAllowance(address) view returns (uint256)"
];

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  return await signer.getAddress();
}

export function getProvider() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_URL);
  }
  return provider;
}

export async function getSigner() {
  if (!signer) {
    await connectWallet();
  }
  return signer;
}

export async function getTokenContract() {
  return new ethers.Contract(
    TOKEN_ADDRESS,
    tokenAbi,
    getProvider()
  );
}

export async function getFaucetContract(withSigner = false) {
  const baseProvider = withSigner ? await getSigner() : getProvider();
  return new ethers.Contract(
    FAUCET_ADDRESS,
    faucetAbi,
    baseProvider
  );
}

