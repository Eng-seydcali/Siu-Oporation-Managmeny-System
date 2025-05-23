import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const BudgetModal = ({ onClose, onSave, academicYear }) => {
  const [items, setItems] = useState([
    { itemName: '', quantity: 1, price: 0, amount: 0 }
  ]);
  const [error, setError] = useState('');

  const handleAddItem = () => {
    setItems([...items, { itemName: '', quantity: 1, price: 0, amount: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    
    if (field === 'quantity' || field === 'price') {
      value = parseFloat(value) || 0;
    }
    
    newItems[index][field] = value;
    
    // Recalculate amount
    if (field === 'quantity' || field === 'price') {
      newItems[index].amount = newItems[index].quantity * newItems[index].price;
    }
    
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.amount, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate items
    if (items.some(item => !item.itemName.trim())) {
      setError('Please enter a name for all items');
      return;
    }

    if (items.some(item => item.quantity <= 0)) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (items.some(item => item.price <= 0)) {
      setError('Price must be greater than 0');
      return;
    }

    onSave({
      academicYearId: academicYear._id,
      items: items.map(item => ({
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
          <h2 className="text-xl font-semibold text-gray-800">Create New Budget</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-4">
            <p className="text-gray-600">
              Academic Year: <span className="font-medium text-gray-800">{academicYear?.year}</span>
            </p>
            <p className="text-gray-600">
              Date: <span className="font-medium text-gray-800">{new Date().toLocaleDateString()}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-2 text-sm font-medium text-gray-600">Item Name</th>
                    <th className="px-4 py-2 text-sm font-medium text-gray-600">Quantity</th>
                    <th className="px-4 py-2 text-sm font-medium text-gray-600">Price</th>
                    <th className="px-4 py-2 text-sm font-medium text-gray-600">Amount</th>
                    <th className="px-4 py-2 text-sm font-medium text-gray-600 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          required
                          className="input"
                          value={item.itemName}
                          onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                          placeholder="Item name"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          required
                          min="1"
                          className="input"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          className="input"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
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
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
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
              >
                Save Budget
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;