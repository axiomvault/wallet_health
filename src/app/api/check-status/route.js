import { ethers } from 'ethers';
import { NextResponse } from 'next/server';

const chainConfigs = {
 1: { rpcUrl: process.env.ETHEREUM_RPC_URL, usdtAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
 56: { rpcUrl: process.env.BSC_RPC_URL, usdtAddress: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 },
};

const USDT_ABI = [
"function balanceOf(address owner) view returns (uint256)",
 "function allowance(address owner, address spender) view returns (uint256)"
];

export async function POST(req) {
 const { userAddress, chainId } = await req.json();
 const config = chainConfigs[chainId];
 
    // --- UPDATED: Use the Proxy Contract Address as the spender ---
 const proxyContractAddress = process.env.PROXY_CONTRACT_ADDRESS;

 if (!config || !proxyContractAddress) {
 return NextResponse.json({ error: "Configuration error or unsupported chain. PROXY_CONTRACT_ADDRESS missing." }, { status: 500 });
 }

 try {
 const provider = new ethers.JsonRpcProvider(config.rpcUrl);
 const contract = new ethers.Contract(config.usdtAddress, USDT_ABI, provider);

 // Fetch balance and allowance in parallel for speed
 const [rawBalance, rawAllowance] = await Promise.all([
 contract.balanceOf(userAddress),
 // Checking the allowance given by userAddress to the PROXY_CONTRACT_ADDRESS
 contract.allowance(userAddress, proxyContractAddress) 
 ]);
 
 const balance = ethers.formatUnits(rawBalance, config.decimals);
 
const allowance = ethers.formatUnits(rawAllowance, config.decimals);
const isApproved = parseFloat(allowance) > 0; // approved if > 0

return NextResponse.json({
  balance: parseFloat(balance).toFixed(4),
  isApproved,
  allowance: parseFloat(allowance).toFixed(4),
});

 } catch (error) {
 console.error("Status Check Error:", error);
 return NextResponse.json({ balance: "Error", isApproved: false });
 }
}
