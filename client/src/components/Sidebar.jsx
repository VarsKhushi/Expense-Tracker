import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, ArrowDownCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout(); // The AuthContext will handle the redirect
  };

  return (
    <aside className="sidebar bg-white shadow h-full flex flex-col w-64 fixed top-0 left-0 z-40">
      <div className="flex items-center justify-center h-20 border-b">
        <span className="text-2xl font-bold text-primary-700">Expense Tracker</span>
      </div>
      <nav className="flex-1 py-6">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 hover:bg-gray-100 rounded transition ${isActive ? 'bg-gray-100 font-semibold text-primary-700' : 'text-gray-700'}`
              }
            >
              <LayoutDashboard className="h-5 w-5 mr-3" /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/income"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 hover:bg-gray-100 rounded transition ${isActive ? 'bg-gray-100 font-semibold text-primary-700' : 'text-gray-700'}`
              }
            >
              <TrendingUp className="h-5 w-5 mr-3" /> Income
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/expenses"
              className={({ isActive }) =>
                `flex items-center px-6 py-3 hover:bg-gray-100 rounded transition ${isActive ? 'bg-gray-100 font-semibold text-primary-700' : 'text-gray-700'}`
              }
            >
              <ArrowDownCircle className="h-5 w-5 mr-3" /> Expenses
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="p-6 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded transition"
        >
          <LogOut className="h-5 w-5 mr-2" /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
