import { useState } from 'react';
import { Edit, Trash2, Calendar, Tag } from 'lucide-react';
import EditExpenseModal from './EditExpenseModal';

const ExpenseList = ({ expenses, onDelete, onUpdate }) => {
  const [editingExpense, setEditingExpense] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      Food: 'bg-orange-100 text-orange-800',
      Travel: 'bg-blue-100 text-blue-800',
      Rent: 'bg-red-100 text-red-800',
      Utilities: 'bg-yellow-100 text-yellow-800',
      Entertainment: 'bg-purple-100 text-purple-800',
      Shopping: 'bg-pink-100 text-pink-800',
      Healthcare: 'bg-green-100 text-green-800',
      Education: 'bg-indigo-100 text-indigo-800',
      Transport: 'bg-gray-100 text-gray-800',
      Other: 'bg-slate-100 text-slate-800'
    };
    return colors[category] || colors.Other;
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Tag className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
        <p className="text-gray-600">Start tracking your expenses by adding your first one.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr key={expense._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {expense.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(expense.category)}`}>
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(expense.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(expense.date)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(expense._id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSubmit={(data) => {
            onUpdate(editingExpense._id, data);
            setEditingExpense(null);
          }}
        />
      )}
    </div>
  );
};

export default ExpenseList; 