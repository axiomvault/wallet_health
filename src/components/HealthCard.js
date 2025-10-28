// File: components/HealthCard.js

'use client';

import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';

// The component now accepts 'balance' as a prop
export default function HealthCard({ address, networkName, balance }) {
    const cardRef = useRef(null);
    const [healthScore, setHealthScore] = useState(95);

    useEffect(() => {
        const score = Math.floor(Math.random() * 9) + 90;
        setHealthScore(score);
    }, []);

    const handleSaveAsImage = () => {
        if (cardRef.current) {
            html2canvas(cardRef.current, {
                backgroundColor: null,
                useCORS: true,
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'crypto-health-card.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };

    const truncatedAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    const networkLabel = networkName === "Ethereum" ? "ETH/ERC-20" : "BNB/BEP-20";
    const formattedBalance = balance ? parseFloat(balance).toFixed(2) : "0.00";

    return (
        <>
            <style jsx>{`
                /* ... Your existing styles remain the same ... */
                .card-container { display: flex; flex-direction: column; align-items: center; gap: 20px; }
                .card { width: 360px; /* Adjusted height for new content */ height: 240px; background: linear-gradient(135deg, #2a2a4a, #121225); border-radius: 16px; padding: 20px; color: white; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.1); }
                .card-header { display: flex; justify-content: space-between; margin-bottom: 15px; /* Reduced margin */ }
                .card-body { display: flex; justify-content: space-between; margin-bottom: 15px; }
                .card-logo { font-weight: bold; font-size: 18px; letter-spacing: 1px; }
                .card-logo span { color: #6e44ff; }
                .card-chip { font-size: 24px; opacity: 0.8; }
                .label { display: block; font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-bottom: 4px; }
                #walletAddress { font-family: 'Courier New', monospace; letter-spacing: 1px; }
                #healthScore, #balanceValue { font-size: 18px; font-weight: bold; }
                #healthScore { color: #6e44ff; }
                #balanceValue { color: #17a2b8; } /* A nice cyan color for balance */
                .health-bar { width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; margin-top: 8px; overflow: hidden; }
                .health-bar-fill { height: 100%; background: linear-gradient(90deg, #6e44ff, #3d7af0); border-radius: 3px; }
                .card-footer { display: flex; justify-content: space-between; }
                .save-btn { background: linear-gradient(90deg, #6e44ff, #3d7af0); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: transform 0.2s; }
            `}</style>

            <div className="card-container">
                <div className="card" ref={cardRef}>
                    <div className="card-header">
                        <span className="card-logo">CRYPTO<span>HEALTH</span></span>
                        <span className="card-chip">⌬</span>
                    </div>
                    
                    <div className="card-wallet-address" style={{ marginBottom: '15px' }}>
                        <span className="label">Wallet Address</span>
                        <span id="walletAddress">{truncatedAddress}</span>
                    </div>

                    {/* NEW: Body section with Health and Balance */}
                    <div className="card-body">
                        <div className="card-health">
                            <span className="label">Wallet Health</span>
                            <span id="healthScore">{healthScore}%</span>
                            <div className="health-bar">
                                <div className="health-bar-fill" style={{ width: `${healthScore}%` }}></div>
                            </div>
                        </div>
                        <div className="card-balance" style={{ textAlign: 'right' }}>
                            <span className="label">USDT Balance</span>
                            <span id="balanceValue">{formattedBalance}</span>
                        </div>
                    </div>

                    <div className="card-footer">
                        <div className="card-network">
                            <span className="label">Network</span>
                            <span>{networkLabel}</span>
                        </div>
                        <div className="card-expiry" style={{ textAlign: 'right' }}>
                            <span>Digitally Signed</span>
                        </div>
                    </div>
                </div>
                <button onClick={handleSaveAsImage} className="save-btn">
                    <i className="fas fa-download me-2"></i> Save to Image
                </button>
            </div>
        </>
    );
}