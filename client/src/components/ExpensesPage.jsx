import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { expensesAPI } from '../services/api';
import { Plus, Download, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import ExpenseList from './ExpenseList';
import AddExpenseModal from './AddExpenseModal';
import ExpenseCharts from './ExpenseCharts';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const ExpensesPage = () => {
  const _navigate = useNavigate();
  const { logout: _logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    startDate: '',
    endDate: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [expensesRes, summaryRes] = await Promise.all([
        expensesAPI.getAll(filters),
        expensesAPI.getSummary(filters)
      ]);
      setExpenses(expensesRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('Error fetching expense data:', err);
      toast.error('Failed to fetch expense records');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [filters, fetchData]);

  const handleExport = async () => {
    try {
      const response = await expensesAPI.exportExcel(filters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expenses.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error('Failed to export expenses');
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      await expensesAPI.create(expenseData);
      toast.success('Expense added successfully');
      setShowAddModal(false);
      await fetchData();
    } catch (err) {
      console.error('Error adding expense:', err);
      toast.error('Failed to add expense');
    }
  };

  const handleUpdateExpense = async (id, expenseData) => {
    try {
      await expensesAPI.update(id, expenseData);
      toast.success('Expense updated successfully');
      await fetchData();
    } catch (err) {
      console.error('Error updating expense:', err);
      toast.error('Failed to update expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        await expensesAPI.delete(id);
        toast.success('Expense deleted successfully');
        await fetchData();
      } catch (err) {
        console.error('Error deleting expense:', err);
        toast.error('Failed to delete expense');
      }
    }
  };

  const clearFilters = () => {
    setFilters({ category: 'All', startDate: '', endDate: '' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
              <div className="flex space-x-4">
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Download className="h-4 w-4 mr-2" /> Export
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Expense
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatCurrency(summary.totalExpenses || 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatCurrency(summary.currentMonthExpenses || 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-sm font-medium text-gray-500">Last Month</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {formatCurrency(summary.lastMonthExpenses || 0)}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="All">All Categories</option>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Rent">Rent</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Transport">Transport</option>
                  <option value="Other">Other</option>
                </select>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={filters.startDate}
                    max={filters.endDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    value={filters.endDate}
                    min={filters.startDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <button
                  onClick={clearFilters}
                  disabled={filters.category === 'All' && !filters.startDate && !filters.endDate}
                  className={`text-sm ${filters.category === 'All' && !filters.startDate && !filters.endDate ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'}`}
                >
                  Clear filters
                </button>
              </div>
            </div>

            {/* Expense Distribution Chart */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Expense Distribution</h2>
              <div className="w-full flex justify-center" style={{ height: '300px' }}>
                <div className="w-full max-w-2xl h-full">
                  <ExpenseCharts 
                    categoryData={summary.categoryExpenses || []} 
                    showOnlyPie={true}
                  />
                </div>
              </div>
            </div>

            {/* Expense List */}
            <div className="mt-6">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Expenses</h3>
                </div>
                <ExpenseList 
                  expenses={expenses} 
                  loading={loading} 
                  onEdit={handleUpdateExpense} 
                  onDelete={handleDeleteExpense} 
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {showAddModal && (
        <AddExpenseModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddExpense}
        />
      )}
    </div>
  );
}
export default ExpensesPage;
