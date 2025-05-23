import { useState } from 'react';
import { X, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

const ViewBudgetModal = ({ budget, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slideIn">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              Budget: {budget.budgetId}
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
              Budget Details
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
                  <p className="text-sm text-gray-500 mb-1">Academic Year</p>
                  <p className="font-medium">{budget.academicYear.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Creation Date</p>
                  <p className="font-medium">{formatDate(budget.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Department</p>
                  <p className="font-medium">{budget.user.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div>{getStatusBadge(budget.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${budget.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Items</p>
                  <p className="font-medium">{budget.items.length} items</p>
                </div>
              </div>
              
              {budget.status === 'pending' && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Budget is pending approval</p>
                    <p className="text-yellow-700 text-sm">Your budget is currently under review. You will be notified once it's approved.</p>
                  </div>
                </div>
              )}
              
              {(budget.status === 'approved' || budget.status === 'partially_approved') && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">
                      {budget.status === 'approved' ? 'Budget approved' : 'Budget partially approved'}
                    </p>
                    <p className="text-green-700 text-sm">
                      {budget.status === 'approved' 
                        ? 'Your budget has been fully approved. You can now create requests.'
                        : 'Some items in your budget have been approved. You can create requests for approved items.'}
                    </p>
                  </div>
                </div>
              )}
              
              <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Items</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-2 text-xs font-medium text-gray-600">Item Name</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-600">Requested Qty</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-600">Approved Qty</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-600">Price</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-600">Amount</th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budget.items.map((item, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-4 py-3 font-medium">{item.itemName}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">
                          {item.status === 'approved' 
                            ? item.approvedQuantity 
                            : '-'}
                        </td>
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
                  <p className="text-sm font-medium">Budget created</p>
                  <p className="text-xs text-gray-500">{formatDate(budget.createdAt)}</p>
                </div>
              </div>
              
              {budget.status !== 'pending' && (
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Budget {budget.status}</p>
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

export default ViewBudgetModal;