import { useState, useEffect } from 'react';
import { PlusCircle, Search, FileDown, Eye, Filter } from 'lucide-react';
import EmergencyModal from './EmergencyModal';
import ViewEmergencyModal from './ViewEmergencyModal';
import axios from 'axios';

const EmergencyTable = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [academicYear, setAcademicYear] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmergencies();
    fetchActiveAcademicYear();
  }, []);

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/emergencies');
      setEmergencies(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch emergencies');
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
    }
  };

  const handleCreateEmergency = async (emergencyData) => {
    try {
      await axios.post('/api/emergencies', emergencyData);
      
      setShowCreateModal(false);
      fetchEmergencies();
    } catch (err) {
      console.error('Error creating emergency:', err);
      setError(err.response?.data?.msg || 'Failed to create emergency');
    }
  };

  const handleViewEmergency = async (emergencyId) => {
    try {
      const res = await axios.get(`/api/emergencies/${emergencyId}`);
      setSelectedEmergency(res.data);
      setShowViewModal(true);
    } catch (err) {
      console.error('Error fetching emergency:', err);
      setError('Failed to fetch emergency details');
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
      case 'rejected':
        return <span className="status-rejected">Rejected</span>;
      default:
        return <span className="status-pending">Pending</span>;
    }
  };

  const filteredEmergencies = emergencies.filter(emergency => 
    emergency.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emergency.emergencyId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Emergency Requests</h1>
        <p className="text-gray-600 mt-1">Submit emergency funding requests for urgent situations</p>
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
            placeholder="Search emergencies..."
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
                setError('No active academic year found. Cannot create emergency request.');
                return;
              }
              setShowCreateModal(true);
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Emergency
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : emergencies.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No emergency requests found</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                if (!academicYear) {
                  setError('No active academic year found. Cannot create emergency request.');
                  return;
                }
                setShowCreateModal(true);
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Emergency Request
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Emergency ID</th>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmergencies.map((emergency) => (
                  <tr key={emergency._id}>
                    <td>{emergency.emergencyId}</td>
                    <td className="font-medium">{emergency.title}</td>
                    <td>{formatDate(emergency.createdAt)}</td>
                    <td>{formatCurrency(emergency.amount)}</td>
                    <td>{getStatusBadge(emergency.status)}</td>
                    <td>
                      <button
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                        onClick={() => handleViewEmergency(emergency._id)}
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
        <EmergencyModal 
          onClose={() => setShowCreateModal(false)} 
          onSave={handleCreateEmergency}
        />
      )}

      {showViewModal && selectedEmergency && (
        <ViewEmergencyModal
          emergency={selectedEmergency}
          onClose={() => {
            setShowViewModal(false);
            setSelectedEmergency(null);
          }}
        />
      )}
    </div>
  );
};

export default EmergencyTable;