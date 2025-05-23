import { useState, useEffect } from 'react';
import { 
  FileText, Clock, CheckCircle, DollarSign, 
  ArchiveRestore, AlertTriangle, RefreshCw
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/reports/user-summary');
      setSummary(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      setLoading(false);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <p>{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Try Again
        </button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
        <p>No dashboard data available. This could be because no active academic year has been set.</p>
      </div>
    );
  }

  // Format currency values
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Chart data for budget status
  const budgetStatusData = {
    labels: ['Approved', 'Partially Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [
          summary.budgetsByStatus.approved, 
          summary.budgetsByStatus.partiallyApproved, 
          summary.budgetsByStatus.pending, 
          summary.budgetsByStatus.rejected
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(139, 92, 246, 0.6)',
          'rgba(250, 204, 21, 0.6)',
          'rgba(239, 68, 68, 0.6)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(250, 204, 21, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for budget amounts
  const budgetAmountsData = {
    labels: ['Total Budget', 'Approved', 'Pending'],
    datasets: [
      {
        label: 'Amount ($)',
        data: [summary.totalBudget, summary.approvedBudget, summary.pendingBudget],
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(250, 204, 21, 0.6)',
        ],
      },
    ],
  };

  const budgetAmountsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Budget Amounts',
      },
    },
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your budgets and requests for {summary.academicYear}</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-md mr-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Budgets</p>
              <p className="text-xl font-semibold">{summary.budgetCount}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-start">
            <div className="bg-green-100 p-2 rounded-md mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Approved Budget</p>
              <p className="text-xl font-semibold">{formatCurrency(summary.approvedBudget)}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-start">
            <div className="bg-yellow-100 p-2 rounded-md mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Budget</p>
              <p className="text-xl font-semibold">{formatCurrency(summary.pendingBudget)}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-start">
            <div className="bg-purple-100 p-2 rounded-md mr-4">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-xl font-semibold">{formatCurrency(summary.totalBudget)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Second row of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-4">
          <div className="flex items-start">
            <div className="bg-indigo-100 p-2 rounded-md mr-4">
              <ArchiveRestore className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Requests</p>
              <p className="text-xl font-semibold">{summary.requestCount}</p>
              <p className="text-sm text-gray-500 mt-1">
                Total: {formatCurrency(summary.totalRequests)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-start">
            <div className="bg-orange-100 p-2 rounded-md mr-4">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Emergency Requests</p>
              <p className="text-xl font-semibold">{summary.emergencyCount}</p>
              <p className="text-sm text-gray-500 mt-1">
                Total: {formatCurrency(summary.totalEmergencies)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">Academic Year</p>
              <p className="text-xl font-semibold">{summary.academicYear}</p>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Active</p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Budget Status</h2>
          <div className="h-64">
            <Pie data={budgetStatusData} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm">Approved: {summary.budgetsByStatus.approved}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
              <span className="text-sm">Partially: {summary.budgetsByStatus.partiallyApproved}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-sm">Pending: {summary.budgetsByStatus.pending}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm">Rejected: {summary.budgetsByStatus.rejected}</span>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Budget Amounts</h2>
          <div className="h-64">
            <Bar data={budgetAmountsData} options={budgetAmountsOptions} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm">Total</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm">Approved</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-sm">Pending</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="/budgets" className="card p-4 hover:bg-gray-50 flex items-center">
            <FileText className="h-5 w-5 text-blue-600 mr-3" />
            <span className="font-medium">Create New Budget</span>
          </a>
          <a href="/requests" className="card p-4 hover:bg-gray-50 flex items-center">
            <ArchiveRestore className="h-5 w-5 text-indigo-600 mr-3" />
            <span className="font-medium">Submit Request</span>
          </a>
          <a href="/emergencies" className="card p-4 hover:bg-gray-50 flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
            <span className="font-medium">Emergency Request</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;