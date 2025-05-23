import { useState } from 'react';
import { X, FileText, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

const ViewEmergencyModal = ({ emergency, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [mediaError, setMediaError] = useState(false);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  const renderMedia = () => {
    if (!emergency.mediaFile) return null;

    // Construct the media URL using the emergency ID
    const mediaUrl = `/api/emergencies/${emergency._id}/media`;

    // Determine media type based on contentType
    const isImage = emergency.contentType?.startsWith('image/');
    const isVideo = emergency.contentType?.startsWith('video/');

    if (isImage) {
      return (
        <div className="relative w-full max-h-96 overflow-hidden rounded-lg">
          <img 
            src={mediaUrl}
            alt="Supporting media"
            className="w-full h-auto object-contain"
            onError={() => setMediaError(true)}
          />
          {mediaError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Failed to load image</p>
              </div>
            </div>
          )}
        </div>
      );
    } else if (isVideo) {
      return (
        <div className="relative w-full max-h-96 overflow-hidden rounded-lg">
          <video 
            controls 
            className="w-full h-auto"
            onError={() => setMediaError(true)}
          >
            <source src={mediaUrl} type={emergency.contentType} />
            Your browser does not support the video tag.
          </video>
          {mediaError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Failed to load video</p>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slideIn">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              Emergency: {emergency.emergencyId}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Emergency Details
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
          </nav>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'details' && (
            <>
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Title</p>
                    <p className="font-medium text-lg">{emergency.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Creation Date</p>
                    <p className="font-medium">{formatDate(emergency.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Department</p>
                    <p className="font-medium">{emergency.user?.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <div>{getStatusBadge(emergency.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Amount Requested</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${emergency.amount.toFixed(2)}
                    </p>
                  </div>34t5
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Academic Year</p>
                    <p className="font-medium">{emergency.academicYear?.year}</p>
                  </div>
                </div>
                
                {emergency.status === 'pending' && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Emergency request is pending approval</p>
                      <p className="text-yellow-700 text-sm">Your emergency request is currently under review. You will be notified once it's approved.</p>
                    </div>
                  </div>
                )}
                
                {emergency.status === 'approved' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Emergency request approved</p>
                      <p className="text-green-700 text-sm">Your emergency request has been approved. Funds will be made available as soon as possible.</p>
                    </div>
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <p className="text-gray-700 whitespace-pre-line">{emergency.description}</p>
              </div>
              
              {emergency.mediaFile && (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Supporting Media</h3>
                  <div className="bg-gray-50 p-4 rounded-md mb-6">
                    {renderMedia()}
                  </div>
                </>
              )}
            </>
          )}
          
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Emergency request created</p>
                  <p className="text-xs text-gray-500">{formatDate(emergency.createdAt)}</p>
                </div>
              </div>
              
              {emergency.status !== 'pending' && (
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Emergency request {emergency.status}</p>
                    <p className="text-xs text-gray-500">After review by administration</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmergencyModal;