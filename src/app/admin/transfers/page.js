'use client';

import { useEffect, useState } from 'react';

export default function TransferLogs() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    async function fetchTransfers() {
      try {
        const res = await fetch('https://tradeinusdt.com/api_wallet_health_vercel/get_transfers.php');
        const data = await res.json();
        setTransfers(data.transfers || []);
      } catch (err) {
        console.error('Error fetching transfers:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTransfers();
  }, []);

  // Filter transfers based on search term
  const filteredTransfers = transfers.filter(transfer =>
    transfer.from_wallet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.to_wallet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.tx_hash?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort transfers
  const sortedTransfers = [...filteredTransfers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'asc' 
        ? parseFloat(aValue) - parseFloat(bValue)
        : parseFloat(bValue) - parseFloat(aValue);
    }
    
    if (sortConfig.key === 'date_time') {
      return sortConfig.direction === 'asc'
        ? new Date(aValue) - new Date(bValue)
        : new Date(bValue) - new Date(aValue);
    }
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const getAmountColor = (amount) => {
    const numAmount = parseFloat(amount);
    if (numAmount > 1000) return 'text-green-600 font-semibold';
    if (numAmount > 100) return 'text-blue-600';
    return 'text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4 shadow-lg">
            <span className="text-2xl text-white">🧾</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Transfer Logs</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Monitor all USDT transfers with real-time transaction details and blockchain verification
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-gray-800">{transfers.length}</div>
            <div className="text-gray-600 text-sm">Total Transfers</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500">
            <div className="text-2xl font-bold text-gray-800">
              {transfers.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0).toFixed(2)}
            </div>
            <div className="text-gray-600 text-sm">Total USDT</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-500">
            <div className="text-2xl font-bold text-gray-800">
              {transfers.length > 0 ? (transfers.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0) / transfers.length).toFixed(2) : 0}
            </div>
            <div className="text-gray-600 text-sm">Avg. Amount</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-500">
            <div className="text-2xl font-bold text-gray-800">
              {new Set(transfers.map(tx => tx.from_wallet)).size}
            </div>
            <div className="text-gray-600 text-sm">Unique Wallets</div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search by wallet address or transaction hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
              Showing {sortedTransfers.length} of {transfers.length} transfers
            </div>
          </div>
        </div>

        {/* Transfer Table */}
        {loading ? (
          <div className="bg-white rounded-xl p-12 shadow-md text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <span className="text-2xl text-blue-500 animate-pulse">⏳</span>
            </div>
            <p className="text-gray-600 text-lg">Loading transfers...</p>
            <p className="text-gray-400 text-sm mt-2">Fetching the latest transaction data</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <tr>
                    {[
                      { key: 'from_wallet', label: 'From Wallet' },
                      { key: 'to_wallet', label: 'To Wallet' },
                      { key: 'amount', label: 'Amount (USDT)' },
                      { key: 'tx_hash', label: 'Transaction Hash' },
                      { key: 'date_time', label: 'Date & Time (IST)' }
                    ].map(({ key, label }) => (
                      <th 
                        key={key}
                        className="py-4 px-6 text-left font-semibold cursor-pointer hover:bg-blue-700 transition-colors duration-200"
                        onClick={() => handleSort(key)}
                      >
                        <div className="flex items-center gap-2">
                          {label}
                          <span className="text-sm">{getSortIcon(key)}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedTransfers.length > 0 ? (
                    sortedTransfers.map((tx, idx) => (
                      <tr 
                        key={idx} 
                        className="hover:bg-blue-50 transition-colors duration-200 group"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              <span className="text-blue-600 text-sm">👤</span>
                            </div>
                            <code className="font-mono text-sm text-gray-800 bg-gray-100 px-2 py-1 rounded">
                              {tx.from_wallet?.slice(0, 8)}...{tx.from_wallet?.slice(-6)}
                            </code>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                              <span className="text-green-600 text-sm">🎯</span>
                            </div>
                            <code className="font-mono text-sm text-gray-800 bg-gray-100 px-2 py-1 rounded">
                              {tx.to_wallet?.slice(0, 8)}...{tx.to_wallet?.slice(-6)}
                            </code>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`text-lg font-semibold ${getAmountColor(tx.amount)}`}>
                            {parseFloat(tx.amount).toFixed(4)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <a
                            href={`https://bscscan.com/tx/${tx.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 group/link"
                          >
                            <span className="font-mono bg-blue-50 px-3 py-1 rounded-lg group-hover/link:bg-blue-100 transition-colors">
                              {tx.tx_hash?.slice(0, 12)}...
                            </span>
                            <span className="text-sm opacity-0 group-hover/link:opacity-100 transition-opacity">
                              🔗
                            </span>
                          </a>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-gray-700">
                            <span>📅</span>
                            <span>{tx.date_time}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                          <span className="text-2xl text-gray-400">📭</span>
                        </div>
                        <p className="text-gray-500 text-lg">No transfers found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchTerm ? 'Try adjusting your search terms' : 'No transfer data available'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Data updates in real-time • All times in IST • Powered by BSC Scan</p>
        </div>
      </div>
    </div>
  );
}