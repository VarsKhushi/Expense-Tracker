import React, { useEffect, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

/**
 * RecentTransactions component displays a merged, sorted list of recent income and expense transactions.
 * @param {Array} expenses - Array of expense objects.
 * @param {Object} incomeSummary - Contains recent income records under incomeSummary.recentIncome (array).
 * @param {number} max - Maximum number of transactions to display.
 */
const RecentTransactions = ({ expenses = [], incomeSummary = {}, max = 10 }) => {
  const [recentIncome, setRecentIncome] = useState([]);

  useEffect(() => {
    // If backend provides recentIncome array, use it. Otherwise, fallback to empty.
    setRecentIncome(Array.isArray(incomeSummary.recentIncome) ? incomeSummary.recentIncome : []);
  }, [incomeSummary]);

  // Normalize and merge
  const normalizedExpenses = expenses.map(exp => ({
    ...exp,
    type: 'expense',
    amount: exp.amount,
    category: exp.category,
    description: exp.description,
    date: exp.date,
    _id: exp._id
  }));
  const normalizedIncome = recentIncome.map(inc => ({
    ...inc,
    type: 'income',
    amount: inc.amount,
    category: inc.category,
    description: inc.description,
    date: inc.date,
    _id: inc._id
  }));
  const all = [...normalizedExpenses, ...normalizedIncome];
  all.sort((a, b) => new Date(b.date) - new Date(a.date));
  const top = all.slice(0, max);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-gray-500">
            <th className="py-2 px-4 text-left">Type</th>
            <th className="py-2 px-4 text-left">Amount</th>
            <th className="py-2 px-4 text-left">Category</th>
            <th className="py-2 px-4 text-left">Description</th>
            <th className="py-2 px-4 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {top.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center text-gray-400 py-4">No recent transactions.</td>
            </tr>
          ) : (
            top.map((item) => (
              <tr key={item._id} className="hover:bg-gray-100 transition">
                <td className="py-2 px-4 flex items-center gap-2">
                  {item.type === 'income' ? (
                    <ArrowUpCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className={item.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                </td>
                <td className="py-2 px-4 font-semibold">
                  ₹{item.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-4">{item.category}</td>
                <td className="py-2 px-4">{item.description}</td>
                <td className="py-2 px-4">{new Date(item.date).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecentTransactions;
