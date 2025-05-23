import { useState, useEffect } from 'react';
import { 
  FileText, Clock, CheckCircle, DollarSign, 
  ArchiveRestore, AlertTriangle, RefreshCw, Users,
  TrendingUp, Building, Calendar
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement,
  LineElement,
  Title, 
  Tooltip, 
  Legend
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/reports/admin-summary');
      setSummary(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      setLoading(false);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Chart configurations
  const budgetStatusData = {
    labels: ['Approved', 'Partially Approved', 'Pending', 'Rejected'],
    datasets: [{
      data: [
        summary.budgetsByStatus.approved,
        summary.budgetsByStatus.partiallyApproved,
        summary.budgetsByStatus.pending,
        summary.budgetsByStatus.rejected
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const departmentBudgetData = {
    labels: Object.keys(summary.departments),
    datasets: [{
      label: 'Total Budget',
      data: Object.values(summary.departments).map(dept => dept.totalBudget),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
    }]
  };

  const departmentBudgetOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Department Budget Distribution',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value)
        }
      }
    }
  };

  // Mock data for trend chart (replace with real data when available)
  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Budget Utilization',
        data: [65, 75, 70, 80, 85, 90],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const trendOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Budget Utilization Trend',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + '%'
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Financial overview for {summary.academicYear}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            className="input"
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          
          <button 
            onClick={fetchDashboardData}
            className="btn btn-secondary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
        <div className="bg-[#456C33] rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Total Budget</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {formatCurrency(summary.totalBudget)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-yellow-500 font-medium">12%</span>
            <span className="text-white ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-[#4196CB] rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Departments</p>
              <p className="text-2xl font-bold text-red- mt-1">
                {Object.keys(summary.departments).length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Building className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Active departments</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.userCount}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">8%</span>
            <span className="text-gray-500 ml-2">growth rate</span>
          </div>
        </div>

        <div className="bg-[#D6552B] rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Academic Year</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.academicYear}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
              <span className="w-1 h-1 mr-1 rounded-full bg-green-500"></span>
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-6">Budget Status Distribution</h3>
          <div className="h-64">
            <Pie 
              data={budgetStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      usePointStyle: true,
                      padding: 20
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Department Budget Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-6">Department Budget Allocation</h3>
          <div className="h-64">
            <Bar 
              data={departmentBudgetData}
              options={departmentBudgetOptions}
            />
          </div>
        </div>

        {/* Budget Utilization Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-6">Budget Utilization Trend</h3>
          <div className="h-64">
            <Line 
              data={trendData}
              options={trendOptions}
            />
          </div>
        </div>
      </div>

      {/* Department Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Department Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(summary.departments).map(([dept, data]) => {
                const utilization = (data.approvedBudget / data.totalBudget) * 100;
                return (
                  <tr key={dept}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{dept}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(data.totalBudget)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(data.approvedBudget)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(data.pendingBudget)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${utilization}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {Math.round(utilization)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;