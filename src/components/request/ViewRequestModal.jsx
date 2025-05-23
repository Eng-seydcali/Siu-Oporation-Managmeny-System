import { useState } from 'react';
import { X, FileText, AlertTriangle, CheckCircle, Truck } from 'lucide-react';

const ViewRequestModal = ({ request, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
l
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slideIn">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center">
            <Truck className="h-5 w-5 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              Request: {request.requestId}
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
              Request Details
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Budget ID</p>
                  <p className="font-medium">{request.budget.budgetId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Creation Date</p>
                  <p className="font-medium">{formatDate(request.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Department</p>
                  <p className="font-medium">{request.user.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div>{getStatusBadge(request.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${request.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Items</p>
                  <p className="font-medium">{request.items.length} items</p>
                </div>
              </div>
              
              {request.status === 'pending' && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Request is pending approval</p>
                    <p className="text-yellow-700 text-sm">Your request is currently under review. You will be notified once it's approved.</p>
                  </div>
                </div>
              )}
              
              {request.status === 'approved' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Request approved</p>
                    <p className="text-green-700 text-sm">Your request has been approved. You can now collect the requested items.</p>
                  </div>
                </div>
              )}
              
              <h3 className="text-lg font-medium text-gray-900 mb-4">Requested Items</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-2 text-xs font-medium text-gray-600">Item Name</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-600">Quantity</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-600">Price</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-600">Amount</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {request.items.map((item, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-4 py-3 font-medium">{item.itemName}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">${item.price.toFixed(2)}</td>
                        <td className="px-4 py-3">${item.amount.toFixed(2)}</td>
                        <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Request created</p>
                  <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                </div>
              </div>
              
              {request.status !== 'pending' && (
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Request {request.status}</p>
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

export default ViewRequestModal;