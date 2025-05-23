import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, LayoutDashboard, FileText, ArchiveRestore, 
  AlertTriangle, CalendarDays, BarChart3, Users, LogOut,
  ChevronDown, Bell, Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FcDepartment } from 'react-icons/fc';
import logo from '../asstes/logo.png'
import { TbDentalBroken } from 'react-icons/tb';

const DashboardLayout = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Budgets', path: '/budgets', icon: <FileText className="h-5 w-5" /> },
    { name: 'Requests', path: '/requests', icon: <ArchiveRestore className="h-5 w-5" /> },
    { name: 'Emergency', path: '/emergencies', icon: <AlertTriangle className="h-5 w-5" /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 className="h-5 w-5" /> },
  ];

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Academic Years', path: '/admin/academic-years', icon: <CalendarDays className="h-5  w-5" /> },
    { name: 'Departments', path: '/admin/Departments', icon: <FcDepartment className="h-5 w-5" /> },
    { name: 'All Budgets', path: '/admin/budgets', icon: <FileText className="h-5 w-5" /> },
    { name: 'All Requests', path: '/admin/requests', icon: <ArchiveRestore className="h-5 w-5" /> },
    { name: 'All Emergencies', path: '/admin/emergencies', icon: <AlertTriangle className="h-5 w-5" /> },
    { name: 'Users', path: '/admin/users', icon: <Users className="h-5 w-5" /> },
    { name: 'Reports', path: '/admin/reports', icon: <BarChart3 className="h-5 w-5" /> },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for larger screens or when toggled */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:relative lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="px-4 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
              <img src={logo} alt="" className="h-14 w-18 text-blue-600" />
              <div className="">
                <h1 className="ml-2 text-xl font-bold text-gray-800">SIU Oporation</h1>
                <span className="ml-2 text-sm font-bold text-gray-800">Managment System</span>
                </div>
              </div>
              <button
                onClick={toggleSidebar}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`sidebar-link ${
                    location.pathname === item.path ? 'active' : ''
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </a>
              ))}
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                {/* Mobile menu button */}
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden px-4 text-gray-500 focus:outline-none"
                >
                  <Menu className="h-6 w-6" />
                </button>

                {/* Search */}
                <div className="hidden sm:flex sm:items-center ml-4">
                  <div className="relative w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search..."
                      className="input pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                {/* Notifications */}
                <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                  <Bell className="h-6 w-6" />
                  
                </button>

                {/* Profile dropdown */}
                
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {currentUser?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3 hidden md:block">
                      <div className="text-sm font-medium text-gray-700">
                        {currentUser?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {currentUser?.role.charAt(0).toUpperCase() + currentUser?.role.slice(1)}
                      </div>
                    </div>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Custom icon for the graduation cap
const GraduationCapIcon = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);

export default DashboardLayout;