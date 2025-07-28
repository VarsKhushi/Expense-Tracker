import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { expensesAPI, incomeAPI, exportAllExcel } from '../services/api';
import { Plus, TrendingUp, IndianRupee, Calendar, Filter, ArrowDownCircle, Download, User, LogOut } from 'lucide-react';
import ProfileEditor from './ProfileEditor';
import toast from 'react-hot-toast';
import ExpenseList from './ExpenseList';
import AddExpenseModal from './AddExpenseModal';
import ExpenseCharts from './ExpenseCharts';
import IncomeCharts from './IncomeCharts';
import RecentTransactions from './RecentTransactions';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  
  const toggleProfileMenu = () => setShowProfileMenu(!showProfileMenu);
  
  const { updateUser } = useAuth();
  
  const handleProfileUpdate = (updatedUser) => {
    // Update the user in the auth context
    if (updateUser) {
      updateUser(updatedUser);
    }
    console.log('Profile updated:', updatedUser);
    // Removed duplicate toast.success() as it's already handled in ProfileEditor
  };
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await exportAllExcel({
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = url;
      
      // Set the download filename
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      link.setAttribute('download', `expense-tracker-export-${dateStr}.xlsx`);
      
      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      link.remove();
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(error.response?.data?.message || 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };
  
  const [filters, setFilters] = useState({
    category: 'All',
    startDate: '',
    endDate: ''
  });

  const clearFilters = () => {
    const newFilters = { category: 'All', startDate: '', endDate: '' };
    setFilters(newFilters);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Removed unused date variables
      
      const apiFilters = {
        ...(filters.category !== 'All' && { category: filters.category }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      };

      // Fetch expenses, expense summary, and income data in parallel
      const [expensesRes, expenseSummaryRes, incomeRes] = await Promise.all([
        expensesAPI.getAll(apiFilters),
        expensesAPI.getSummary(apiFilters),
        incomeAPI.getSummary(apiFilters)
      ]);

      setExpenses(expensesRes.data);
      
      // Process the data
      const expenseData = expensesRes.data || [];
      const expenseSummary = expenseSummaryRes.data || {};
      const incomeData = incomeRes.data || {};
      
      console.log('Raw Expense Summary Data:', expenseSummary);
      console.log('Raw Income Data:', incomeData);
      
      const totalExpenses = expenseData.reduce((sum, exp) => sum + exp.amount, 0);
      const totalIncome = incomeData.totalIncome || 0;
      
      // Ensure we have the expected data structure
      const summaryData = {
        // Expense data
        categoryExpenses: Array.isArray(expenseSummary.categoryExpenses) 
          ? expenseSummary.categoryExpenses 
          : [],
        monthlyExpenses: Array.isArray(expenseSummary.monthlyExpenses)
          ? expenseSummary.monthlyExpenses.map(item => ({
              _id: {
                month: item._id?.month || new Date().getMonth() + 1,
                year: item._id?.year || new Date().getFullYear()
              },
              total: item.total || 0
            }))
          : [],
        dailyExpenses: Array.isArray(expenseSummary.dailyExpenses) 
          ? expenseSummary.dailyExpenses 
          : [],
        
        // Income data
        categoryIncome: Array.isArray(incomeData.categoryIncome) 
          ? incomeData.categoryIncome 
          : [],
        monthlyIncome: Array.isArray(incomeData.monthlyIncome) 
          ? incomeData.monthlyIncome 
          : [],
        dailyIncome: Array.isArray(incomeData.dailyIncome) 
          ? incomeData.dailyIncome 
          : [],
        recentIncome: Array.isArray(incomeData.recentIncome) 
          ? incomeData.recentIncome 
          : [],
        
        // Calculated values
        totalExpenses,
        totalIncome,
        balance: totalIncome - totalExpenses,
        monthlyTransactions: expenseData.length + (incomeData.recentIncome?.length || 0)
      };
      
      console.log('Processed Summary Data:', summaryData);
      setSummary(summaryData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 min-h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Welcome back! Here's your financial overview</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex items-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
                </button>
                
                <div className="relative">
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <span className="hidden md:inline-block font-medium">
                      {user?.name || 'My Profile'}
                    </span>
                  </button>
                  
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowProfileEditor(true);
                          setShowProfileMenu(false);
                        }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        My Profile
                      </a>
                      <div className="border-t border-gray-100 my-1"></div>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                        onClick={(e) => {
                          e.preventDefault();
                          logout();
                          navigate('/login');
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Balance Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-gray-100 rounded-md p-3">
                      <IndianRupee className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 truncate">Balance</p>
                      <p className={`text-xl font-semibold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(summary.balance || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Income Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 truncate">Income</p>
                      <p className="text-xl font-semibold text-gray-900">{formatCurrency(summary.totalIncome || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expenses Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-50 rounded-md p-3">
                      <ArrowDownCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 truncate">Expenses</p>
                      <p className="text-xl font-semibold text-gray-900">{formatCurrency(summary.totalExpenses || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Monthly Transactions */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Transactions This Month</p>
                      <p className="text-xl font-semibold text-gray-900">{summary.monthlyTransactions || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="All">All Categories</option>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Rent">Rent</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Salary">Salary</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Other">Other</option>
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filters.startDate}
                    max={filters.endDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    value={filters.endDate}
                    min={filters.startDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
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

            {/* Debug summary data */}
            {console.log('Summary data in Dashboard:', summary)}
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side - Line Graphs */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Expenses</h3>
                  <div className="h-96 w-full">
                    {Array.isArray(summary.monthlyExpenses) && summary.monthlyExpenses.length > 0 ? (
                      <div className="h-full w-full p-1">
                        <ExpenseCharts 
                          monthlyData={summary.monthlyExpenses}
                          showOnlyLine={true}
                        />
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        {!summary.monthlyExpenses ? 'Loading...' : 'No monthly expense data available'}
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Income</h3>
                  <div className="h-96 w-full">
                    {summary.monthlyIncome && summary.monthlyIncome.length > 0 ? (
                      <div className="h-full w-full p-1">
                        <IncomeCharts 
                          monthlyData={Array.isArray(summary.monthlyIncome) ? summary.monthlyIncome : []}
                          showOnlyLine={true}
                        />
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        No monthly income data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right Side - Pie Charts */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Expense by Category</h3>
                  <div className="h-96 w-full">
                    <div className="h-full w-full flex items-center justify-center">
                      {summary.categoryExpenses && summary.categoryExpenses.length > 0 ? (
                        <div className="w-full h-full flex items-center justify-center p-2">
                          <div className="w-full h-full max-w-md">
                            <ExpenseCharts 
                              categoryData={Array.isArray(summary.categoryExpenses) ? summary.categoryExpenses : []}
                              showOnlyPie={true}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          No expense category data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Income by Category</h3>
                  <div className="h-96 w-full">
                    <div className="h-full w-full flex items-center justify-center">
                      {summary.categoryIncome && summary.categoryIncome.length > 0 ? (
                        <div className="w-full h-full flex items-center justify-center p-2">
                          <div className="w-full h-full max-w-md">
                            <IncomeCharts 
                              categoryData={Array.isArray(summary.categoryIncome) ? summary.categoryIncome : []}
                              showOnlyPie={true}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          No income category data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="mt-6">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  <RecentTransactions
                    expenses={Array.isArray(expenses) ? expenses : []}
                    incomeSummary={summary || {}}
                    max={10}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <ProfileEditor 
        isOpen={showProfileEditor} 
        onClose={() => setShowProfileEditor(false)}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default Dashboard;
