import { useEffect, useState } from "react"
import { ethers } from "ethers"
import {
  getProvider,
  getFaucetContract,
  getTokenContractFromFaucet,
} from "./utils/contracts"

function App() {
  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState("0.0")
  const [canClaim, setCanClaim] = useState(false)
  const [remaining, setRemaining] = useState("0")
  const [loading, setLoading] = useState(false)

  /* -------------------- WALLET CONNECT -------------------- */
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not found")
      return
    }

    const provider = getProvider()
    const accounts = await provider.send("eth_requestAccounts", [])
    setAccount(accounts[0])
  }

  /* -------------------- LOAD BALANCE -------------------- */
  const loadBalance = async () => {
    if (!account) return

    const token = await getTokenContractFromFaucet()
    const bal = await token.balanceOf(account)
    setBalance(ethers.formatUnits(bal, 18))
  }

  /* -------------------- LOAD FAUCET STATE -------------------- */
  const loadFaucetState = async () => {
    if (!account) return

    const faucet = await getFaucetContract()

    const eligible = await faucet.canClaim(account)
    setCanClaim(eligible)

    const remainingAmount = await faucet.remainingAllowance(account)
    setRemaining(ethers.formatUnits(remainingAmount, 18))
  }

  /* -------------------- REQUEST TOKENS -------------------- */
  const requestTokens = async () => {
    try {
      setLoading(true)

      const faucet = await getFaucetContract()
      const tx = await faucet.requestTokens()

      await tx.wait()

      await loadBalance()
      await loadFaucetState()
    } catch (err) {
      console.error(err)
      alert("Transaction failed or rejected")
    } finally {
      setLoading(false)
    }
  }

  /* -------------------- EFFECTS -------------------- */
  useEffect(() => {
    if (account) {
      loadBalance()
      loadFaucetState()
    }
  }, [account])

  /* -------------------- UI -------------------- */
  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>ERC-20 Faucet (Sepolia)</h1>

      {!account ? (
        <button onClick={connectWallet}>
          Connect MetaMask
        </button>
      ) : (
        <>
          <p><strong>Connected:</strong> {account}</p>
          <p><strong>Token Balance:</strong> {balance}</p>
          <p><strong>Remaining Allowance:</strong> {remaining}</p>

          <button
            onClick={requestTokens}
            disabled={!canClaim || loading}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              cursor: canClaim ? "pointer" : "not-allowed",
            }}
          >
            {loading
              ? "Requesting..."
              : canClaim
              ? "Request Tokens"
              : "Cooldown Active"}
          </button>
        </>
      )}
    </div>
  )
}

export default App

