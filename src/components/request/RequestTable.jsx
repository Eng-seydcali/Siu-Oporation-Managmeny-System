import { useState, useEffect } from 'react';
import { PlusCircle, Search, FileDown, Eye, Filter } from 'lucide-react';
import RequestModal from './RequestModal';
import ViewRequestModal from './ViewRequestModal';
import axios from 'axios';

const RequestTable = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [approvedBudgets, setApprovedBudgets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchApprovedBudgets();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/requests');
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch requests');
      setLoading(false);
      console.error(err);
    }
  };

  const fetchApprovedBudgets = async () => {
    try {
      const res = await axios.get('/api/budgets');
      const approved = res.data.filter(budget => 
        budget.status === 'approved' || budget.status === 'partially_approved'
      );
      setApprovedBudgets(approved);
    } catch (err) {
      console.error('Error fetching budgets:', err);
    }
  };

  const handleCreateRequest = async (requestData) => {
    try {
      await axios.post('/api/requests', {
        budgetId: requestData.budgetId,
        items: requestData.items
      });
      
      setShowCreateModal(false);
      fetchRequests();
    } catch (err) {
      console.error('Error creating request:', err);
      setError(err.response?.data?.msg || 'Failed to create request');
    }
  };

  const handleViewRequest = async (requestId) => {
    try {
      const res = await axios.get(`/api/requests/${requestId}`);
      setSelectedRequest(res.data);
      setShowViewModal(true);
    } catch (err) {
      console.error('Error fetching request:', err);
      setError('Failed to fetch request details');
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

  const filteredRequests = requests.filter(request => 
    request.requestId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Requests</h1>
        <p className="text-gray-600 mt-1">Request items from your approved budgets</p>
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
            placeholder="Search requests..."
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
              if (approvedBudgets.length === 0) {
                setError('No approved budgets found. Cannot create request.');
                return;
              }
              setShowCreateModal(true);
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Request
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No requests found</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                if (approvedBudgets.length === 0) {
                  setError('No approved budgets found. Cannot create request.');
                  return;
                }
                setShowCreateModal(true);
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Request
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request._id}>
                    <td className="font-medium">{request.requestId}</td>
                    <td>{formatDate(request.createdAt)}</td>
                    <td>{formatCurrency(request.totalAmount)}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>
                      <button
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                        onClick={() => handleViewRequest(request._id)}
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
        <RequestModal 
          onClose={() => setShowCreateModal(false)} 
          onSave={handleCreateRequest}
          approvedBudgets={approvedBudgets}
        />
      )}

      {showViewModal && selectedRequest && (
        <ViewRequestModal
          request={selectedRequest}
          onClose={() => {
            setShowViewModal(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
};

export default RequestTable;