import React from 'react';
import { ImCross } from "react-icons/im";

function History({closePopups}) {
  return (
<div className="fixed inset-0 flex items-end justify-center bg-transparent bg-opacity-40 backdrop-blur-sm z-50" onClick={closePopups}>
  <div
    className="bg-[#1B1A1A] w-full sm:max-w-lg p-2 sm:p-6 rounded-t-3xl shadow-xl relative"
    onClick={(e) => e.stopPropagation()}
  >
    <button
      onClick={closePopups}
      className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 focus:outline-none transition duration-300"
    >
      <ImCross size={18} />
    </button>

    <h2 className="text-base sm:text-xl font-semibold text-center mb-3 text-[#E0E0E0]">
      Transaction History
    </h2>

    <div className="container">
      {/* Scrollable table container for transaction history */}
      <div className="overflow-y-auto max-h-[300px] sm:max-h-[400px]">
        <table className="w-full bg-[#2C2C2C] rounded-lg overflow-hidden shadow-lg my-4">
          <thead className="text-[#E0E0E0]">
            <tr className="bg-[#3A3A3A]">
              <th className="p-2 text-left text-xs">Transaction ID</th>
              <th className="p-2 text-left text-xs">Date</th>
              <th className="p-2 text-left text-xs">Amount</th>
              <th className="p-2 text-left text-xs">Type</th>
              <th className="p-2 text-left text-xs">Status</th>
            </tr>
          </thead>
          <tbody>
            {/* Example transaction rows */}
            {[
              { id: 'TXN12345', date: '2024-10-10', amount: '500', type: 'Deposit', status: 'Completed' },
              { id: 'TXN12346', date: '2024-10-09', amount: '300', type: 'Withdrawal', status: 'Pending' },
              { id: 'TXN12347', date: '2024-10-08', amount: '1000', type: 'Deposit', status: 'Failed' },
              { id: 'TXN12348', date: '2024-10-07', amount: '1500', type: 'Withdrawal', status: 'Completed' }
            ].map((transaction, index) => (
              <tr className="border-b border-[#505050]" key={index}>
                <td className="p-2 text-[#E0E0E0] text-xs truncate">{transaction.id}</td>
                <td className="p-2 text-[#E0E0E0] text-xs">{transaction.date}</td>
                <td className="p-2 text-[#E0E0E0] text-xs">{transaction.amount} Coins</td>
                <td className="p-2 text-[#E0E0E0] text-xs">{transaction.type}</td>
                <td className={`p-2 text-xs ${transaction.status === 'Completed' ? 'text-green-400' : transaction.status === 'Pending' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {transaction.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>








  )
}

export default History