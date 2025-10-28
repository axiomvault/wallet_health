// File: app/api/transfer/route.js

import { ethers } from 'ethers';
import { NextResponse } from 'next/server';

// --- Multi-Chain Configuration ---
const chainConfigs = {
  // Ethereum Mainnet
  1: {
    rpcUrl: process.env.ETHEREUM_RPC_URL,
    decimals: 6, // USDT on Ethereum has 6 decimals
  },
  // BNB Smart Chain
  56: {
    rpcUrl: process.env.BSC_RPC_URL,
    decimals: 18, // USDT on BSC has 18 decimals
  },
};

// ABI for YOUR TransferProxy contract's executeTransfer function
const PROXY_ABI = ["function executeTransfer(address _userAddress, address _recipient, uint256 _amount)"];

export async function POST(req) {
    // Destructure the request body
    const { userAddress, recipientAddress, amountString, chainId } = await req.json();

    // Validate inputs
    if (!userAddress || !recipientAddress || !amountString || !chainId) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Select the correct chain configuration
    const config = chainConfigs[chainId];
    // Get the single, unified proxy address from environment variables
    const proxyAddress = process.env.PROXY_CONTRACT_ADDRESS;

    if (!config || !proxyAddress) {
        return NextResponse.json({ error: "Unsupported chain or proxy contract not configured." }, { status: 400 });
    }

    try {
        // Set up the connection to the blockchain
        const provider = new ethers.JsonRpcProvider(config.rpcUrl);
        
        // Securely load the admin wallet from the private key
        const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
        if (!adminPrivateKey) {
            throw new Error("Admin private key is not configured on the server.");
        }
        const adminWallet = new ethers.Wallet(adminPrivateKey, provider);

        // Create an instance of YOUR proxy contract, signed by the admin
        const proxyContract = new ethers.Contract(proxyAddress, PROXY_ABI, adminWallet);
        
        // Format the amount string into the correct unit (wei/satoshi)
        const amountToTransfer = ethers.parseUnits(amountString, config.decimals);

        // Call the `executeTransfer` function on your deployed proxy contract
        const tx = await proxyContract.executeTransfer(userAddress, recipientAddress, amountToTransfer);
        
        // Wait for the transaction to be confirmed
        await tx.wait();

        // Return a success response with the transaction hash
        return NextResponse.json({ success: true, txHash: tx.hash });

    } catch (error) {
        console.error("Backend Transfer Error:", error);
        // Return a detailed error message
        return NextResponse.json({ error: error.reason || "An error occurred during the transfer." }, { status: 500 });
    }
}