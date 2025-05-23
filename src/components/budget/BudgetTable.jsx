import { useState, useEffect } from 'react';
import { PlusCircle, Search, FileDown, Eye, Filter } from 'lucide-react';
import BudgetModal from './BudgetModal';
import ViewBudgetModal from './ViewBudgetModal';
import axios from 'axios';

const BudgetTable = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [academicYear, setAcademicYear] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBudgets();
    fetchActiveAcademicYear();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/budgets');
      setBudgets(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch budgets');
      setLoading(false);
      console.error(err);
    }
  };

  const fetchActiveAcademicYear = async () => {
    try {
      const res = await axios.get('/api/academic-years/active');
      setAcademicYear(res.data);
    } catch (err) {
      console.error('No active academic year found:', err);
      setError('No active academic year found. Cannot create budgets.');
    }
  };

  const handleCreateBudget = async (budgetData) => {
    try {
      setError('');
      await axios.post('/api/budgets', budgetData);
      setShowCreateModal(false);
      fetchBudgets();
    } catch (err) {
      console.error('Error creating budget:', err);
      setError(err.response?.data?.msg || 'Failed to create budget');
    }
  };

  const handleViewBudget = async (budgetId) => {
    try {
      const res = await axios.get(`/api/budgets/${budgetId}`);
      setSelectedBudget(res.data);
      setShowViewModal(true);
    } catch (err) {
      console.error('Error fetching budget:', err);
      setError('Failed to fetch budget details');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="status-approved">Approved</span>;
      case 'partially_approved':
        return <span className="status-partially_approved">Partially Approved</span>;
      case 'rejected':
        return <span className="status-rejected">Rejected</span>;
      default:
        return <span className="status-pending">Pending</span>;
    }
  };

  const filteredBudgets = budgets.filter(budget => 
    budget.budgetId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
        <p className="text-gray-600 mt-1">Manage your budget requests for the academic year</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search budgets..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="btn btn-secondary">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </button>
          
          <button className="btn btn-secondary">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={() => {
              if (!academicYear) {
                setError('No active academic year found. Cannot create budget.');
                return;
              }
              setShowCreateModal(true);
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Budget
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : budgets.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No budgets found</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                if (!academicYear) {
                  setError('No active academic year found. Cannot create budget.');
                  return;
                }
                setShowCreateModal(true);
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Budget
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Budget ID</th>
                  <th>Academic Year</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBudgets.map((budget) => (
                  <tr key={budget._id}>
                    <td className="font-medium">{budget.budgetId}</td>
                    <td>{budget.academicYear?.year}</td>
                    <td>{formatDate(budget.createdAt)}</td>
                    <td>{formatCurrency(budget.totalAmount)}</td>
                    <td>{getStatusBadge(budget.status)}</td>
                    <td>
                      <button
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                        onClick={() => handleViewBudget(budget._id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View & Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <BudgetModal 
          onClose={() => setShowCreateModal(false)} 
          onSave={handleCreateBudget}
          academicYear={academicYear}
        />
      )}

      {showViewModal && selectedBudget && (
        <ViewBudgetModal
          budget={selectedBudget}
          onClose={() => {
            setShowViewModal(false);
            setSelectedBudget(null);
          }}
        />
      )}
    </div>
  );
};

export default BudgetTable;