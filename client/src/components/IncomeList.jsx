import { useState } from 'react';
import { Edit, Trash2, Calendar, Tag } from 'lucide-react';
import EditIncomeModal from './EditIncomeModal';

const IncomeList = ({ incomes, onDelete, onUpdate }) => {
  const [editingIncome, setEditingIncome] = useState(null);

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
      Salary: 'bg-green-100 text-green-800',
      Business: 'bg-blue-100 text-blue-800',
      Investments: 'bg-yellow-100 text-yellow-800',
      Gifts: 'bg-purple-100 text-purple-800',
      Other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {incomes.map((income) => (
              <tr key={income._id} className="group hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(income.date)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(income.category)}`}>
                    {income.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{income.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-700">
                  {formatCurrency(income.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex gap-3 justify-end">
                    <button 
                      className="p-1.5 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingIncome(income);
                      }}
                      title="Edit income"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this income?')) {
                          onDelete(income._id);
                        }
                      }}
                      title="Delete income"
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
      {editingIncome && (
        <EditIncomeModal
          income={editingIncome}
          onClose={() => setEditingIncome(null)}
          onSubmit={(data) => {
            onUpdate(editingIncome._id, data);
            setEditingIncome(null);
          }}
        />
      )}
    </div>
  );
};

export default IncomeList;
