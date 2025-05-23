import { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const RequestModal = ({ onClose, onSave, approvedBudgets }) => {
  const [selectedBudget, setSelectedBudget] = useState('');
  const [budgetItems, setBudgetItems] = useState([]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedBudget) {
      fetchBudgetItems(selectedBudget);
    }
  }, [selectedBudget]);

  const fetchBudgetItems = async (budgetId) => {
    try {
      const res = await axios.get(`/api/budgets/${budgetId}`);
      // Only get approved items with remaining quantity
      const approvedItems = res.data.items.filter(
        item => item.status === 'approved' && item.approvedQuantity > 0
      );
      setBudgetItems(approvedItems);
      setItems([]);
    } catch (err) {
      console.error('Error fetching budget items:', err);
      setError('Failed to fetch budget items');
    }
  };

  const handleAddItem = () => {
    if (budgetItems.length === 0) {
      setError('No approved items available in this budget');
      return;
    }
    
    setItems([
      ...items, 
      { 
        budgetItemId: '', 
        itemName: '', 
        quantity: 1, 
        price: 0, 
        amount: 0,
        maxQuantity: 0
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    
    if (field === 'budgetItemId') {
      const selectedItem = budgetItems.find(item => item._id === value);
      if (selectedItem) {
        newItems[index] = {
          budgetItemId: value,
          itemName: selectedItem.itemName,
          quantity: 1,
          price: selectedItem.price,
          amount: selectedItem.price,
          maxQuantity: selectedItem.approvedQuantity
        };
      }
    } else if (field === 'quantity') {
      value = parseInt(value) || 0;
      
      // Don't allow quantity greater than maxQuantity
      if (value > newItems[index].maxQuantity) {
        value = newItems[index].maxQuantity;
      }
      
      newItems[index].quantity = value;
      newItems[index].amount = value * newItems[index].price;
    }
    
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.amount, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedBudget) {
      setError('Please select a budget');
      return;
    }
    
    if (items.length === 0) {
      setError('Please add at least one item');
      return;
    }
    
    for (const item of items) {
      if (!item.budgetItemId) {
        setError('Please select an item for each row');
        return;
      }
      
      if (item.quantity <= 0) {
        setError('Quantity must be greater than 0');
        return;
      }
    }
    
    onSave({
      budgetId: selectedBudget,
      items: items.map(item => ({
        budgetItemId: item.budgetItemId,
        itemName: item.itemName,
        quantity: item.quantity,
        price: item.price,
        amount: item.amount
      }))
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slideIn">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Create New Request</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {approvedBudgets.length === 0 ? (
            <div className="p-6 bg-yellow-50 rounded-md flex items-start mb-6">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">No approved budgets found</p>
                <p className="text-yellow-700">You need to have at least one approved budget before creating a request.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="mb-6">
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Approved Budget
                </label>
                <select
                  id="budget"
                  className="input"
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  required
                >
                  <option value="">Select a budget</option>
                  {approvedBudgets.map((budget) => (
                    <option key={budget._id} value={budget._id}>
                      {budget.budgetId} ({new Date(budget.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedBudget && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-4 py-2 text-sm font-medium text-gray-600">Item</th>
                          <th className="px-4 py-2 text-sm font-medium text-gray-600">Quantity</th>
                          <th className="px-4 py-2 text-sm font-medium text-gray-600">Available</th>
                          <th className="px-4 py-2 text-sm font-medium text-gray-600">Price</th>
                          <th className="px-4 py-2 text-sm font-medium text-gray-600">Amount</th>
                          <th className="px-4 py-2 text-sm font-medium text-gray-600 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="px-4 py-2">
                              <select
                                className="input"
                                value={item.budgetItemId}
                                onChange={(e) => handleItemChange(index, 'budgetItemId', e.target.value)}
                                required
                              >
                                <option value="">Select an item</option>
                                {budgetItems.map((budgetItem) => (
                                  <option key={budgetItem._id} value={budgetItem._id}>
                                    {budgetItem.itemName}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                required
                                min="1"
                                max={item.maxQuantity}
                                className="input"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <span className="text-gray-700">{item.maxQuantity || '-'}</span>
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                readOnly
                                className="input bg-gray-50"
                                value={item.price}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                readOnly
                                className="input bg-gray-50"
                                value={item.amount}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </button>
                    
                    <div className="text-right">
                      <p className="text-gray-600 mb-1">Total Amount:</p>
                      <p className="text-xl font-bold text-gray-900">
                        ${calculateTotal().toFixed(2)}
                      </p>
                    </div>
                  </div>
                </>
              )}
              
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!selectedBudget || items.length === 0}
                >
                  Submit Request
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestModal;