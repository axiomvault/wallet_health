'use client';

import { useEffect, useState } from 'react';

export default function TransferLogs() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">🧾 Transfer Logs</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading transfers...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-3 px-4">From Wallet</th>
                <th className="text-left py-3 px-4">To Wallet</th>
                <th className="text-left py-3 px-4">Amount (USDT)</th>
                <th className="text-left py-3 px-4">Tx Hash</th>
                <th className="text-left py-3 px-4">Date & Time (IST)</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length > 0 ? (
                transfers.map((tx, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 font-mono text-sm">{tx.from_wallet}</td>
                    <td className="py-2 px-4 font-mono text-sm">{tx.to_wallet}</td>
                    <td className="py-2 px-4">{parseFloat(tx.amount).toFixed(4)}</td>
                    <td className="py-2 px-4 text-blue-600 underline">
                      <a
                        href={`https://bscscan.com/tx/${tx.tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {tx.tx_hash.slice(0, 10)}...
                      </a>
                    </td>
                    <td className="py-2 px-4">{tx.date_time}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No transfers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
