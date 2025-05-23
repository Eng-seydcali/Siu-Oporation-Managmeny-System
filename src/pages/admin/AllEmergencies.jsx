import { useState, useEffect } from 'react';
import { Search, FileDown, Filter, Eye, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const AllEmergencies = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/emergencies/all');
      // Filter out emergencies with missing user data
      const validEmergencies = res.data.filter(emergency => emergency.user && emergency.user.department);
      setEmergencies(validEmergencies);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch emergencies');
      setLoading(false);
    }
  };

  const handleStatusChange = async (emergencyId, status) => {
    try {
      await axios.put(`/api/emergencies/${emergencyId}/status`, { status });
      fetchEmergencies();
    } catch (err) {
      setError('Failed to update emergency status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      case 'rejected':
        return <span className="status-rejected">Rejected</span>;
      default:
        return <span className="status-pending">Pending</span>;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Emergency Requests</h1>
        <p className="text-gray-600 mt-1">Manage and review all emergency funding requests</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search emergencies..."
            className="input pl-10"
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
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Emergency ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {emergencies.map((emergency) => (
                  <tr key={emergency._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium">{emergency.emergencyId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {emergency.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {emergency.user?.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {emergency.user?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(emergency.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(emergency.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(emergency.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedEmergency(emergency);
                            setShowViewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {emergency.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(emergency._id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(emergency._id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Emergency Modal */}
      {showViewModal && selectedEmergency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Emergency Request Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedEmergency(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Emergency ID</p>
                  <p className="font-medium">{selectedEmergency.emergencyId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{selectedEmergency.user?.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Requested By</p>
                  <p className="font-medium">{selectedEmergency.user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(selectedEmergency.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">{formatCurrency(selectedEmergency.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div>{getStatusBadge(selectedEmergency.status)}</div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-2">Title</h4>
                <p className="text-gray-700">{selectedEmergency.title}</p>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-line">{selectedEmergency.description}</p>
              </div>

              {selectedEmergency.mediaUrl && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Supporting Media</h4>
                  {selectedEmergency.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
                    <img
                      src={selectedEmergency.mediaUrl}
                      alt="Supporting media"
                      className="max-w-full h-auto rounded-md"
                    />
                  ) : selectedEmergency.mediaUrl.match(/\.(mp4|webm|ogg)$/) ? (
                    <video
                      controls
                      className="max-w-full h-auto rounded-md"
                    >
                      <source src={selectedEmergency.mediaUrl} />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <a
                      href={selectedEmergency.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View attached media
                    </a>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3">
                {selectedEmergency.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedEmergency._id, 'approved');
                        setShowViewModal(false);
                      }}
                      className="btn btn-success"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedEmergency._id, 'rejected');
                        setShowViewModal(false);
                      }}
                      className="btn btn-danger"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedEmergency(null);
                  }}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEmergencies;