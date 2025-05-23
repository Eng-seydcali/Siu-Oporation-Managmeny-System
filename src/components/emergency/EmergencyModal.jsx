import { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';

const EmergencyModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    mediaFile: null
  });
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          setError('File size must be less than 5MB');
          return;
        }
        
        setFormData({ ...formData, mediaFile: file });
        
        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (name === 'amount') {
      const amount = parseFloat(value) || '';
      setFormData({ ...formData, [name]: amount });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    
    if (!formData.amount || formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    // Create FormData object for file upload
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('amount', formData.amount);
    if (formData.mediaFile) {
      submitData.append('mediaFile', formData.mediaFile);
    }
    
    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slideIn">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Create Emergency Request</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="input"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief title for the emergency"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                required
                className="input"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed explanation of the emergency situation"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount Requested ($) *
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                className="input"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supporting Media (optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="mediaFile" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input
                        id="mediaFile"
                        name="mediaFile"
                        type="file"
                        accept="image/*,video/*"
                        className="sr-only"
                        onChange={handleChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF, MP4 up to 5MB
                  </p>
                </div>
              </div>
              
              {preview && (
                <div className="mt-4">
                  {formData.mediaFile?.type.startsWith('image/') ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-48 rounded-lg mx-auto"
                    />
                  ) : formData.mediaFile?.type.startsWith('video/') ? (
                    <video
                      src={preview}
                      controls
                      className="max-h-48 rounded-lg mx-auto"
                    />
                  ) : null}
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Emergency requests are for urgent situations not covered by your regular budget. 
                These requests will be reviewed with higher priority.
              </p>
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
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmergencyModal;