import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  getSigner,
  getTokenContract,
  getFaucetContract
} from "./utils/contracts";

function App() {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState("0");
  const [canClaim, setCanClaim] = useState(false);
  const [remaining, setRemaining] = useState("0");
  const [error, setError] = useState("");

  // Connect MetaMask wallet
  async function connectWallet() {
    try {
      if (!window.ethereum) throw new Error("MetaMask not found");

      const signer = await getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);
    } catch (err) {
      setError(err.message);
    }
  }

  // Load on-chain data (READS via RPC provider)
  async function loadData(addr) {
    try {
      const provider = new ethers.JsonRpcProvider(
        import.meta.env.VITE_RPC_URL
      );

      const token = getTokenContract(provider);
      const faucet = getFaucetContract(provider);

      const bal = await token.balanceOf(addr);
      const eligible = await faucet.canClaim(addr);
      const remain = await faucet.remainingAllowance(addr);

      setBalance(bal.toString());
      setCanClaim(eligible);
      setRemaining(remain.toString());
    } catch (err) {
      setError(err.message);
    }
  }

async function requestTokens() {
  try {
    setError("");

    const signer = await getSigner();
    const faucet = getFaucetContract(signer);

    const tx = await faucet.requestTokens();
    await tx.wait();

    // reload data after successful claim
    await loadData(address);
  } catch (err) {
    // Surface revert reason cleanly
    setError(err.reason || err.message);
  }
}


  // Reload data when wallet connects
  useEffect(() => {
    if (address) {
      loadData(address);
    }
  }, [address]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>ERC-20 Faucet DApp</h2>

      {!address ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p><b>Connected:</b> {address}</p>
          <p><b>Token Balance:</b> {balance}</p>
          <p><b>Can Claim:</b> {canClaim ? "Yes" : "No"}</p>
          <p><b>Remaining Allowance:</b> {remaining}</p>
          <button onClick={requestTokens} disabled={!canClaim}>
          Request Tokens
          </button>

        </>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;

