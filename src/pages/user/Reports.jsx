import { useState, useEffect, useRef } from 'react';
import { FileDown, Printer, FileSpreadsheet } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import axios from 'axios';
import * as XLSX from 'xlsx';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [budgets, setBudgets] = useState([]);
  const [activeTab, setActiveTab] = useState('approved');
  const reportRef = useRef();

  useEffect(() => {
    fetchBudgets();
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
    }
  };

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
  });

  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();
    
    const data = [
      [`${activeTab === 'approved' ? 'Approved' : 'Pending'} Items Report`],
      [
        'Item Name',
        'Requested Quantity',
        activeTab === 'approved' ? 'Approved Quantity' : 'Pending Quantity',
        'Price Per Unit',
        'Total Amount'
      ],
      ...budgets.flatMap(budget => 
        budget.items
          .filter(item => {
            if (activeTab === 'approved') {
              return item.approvedQuantity > 0;
            } else {
              return item.quantity - (item.approvedQuantity || 0) > 0;
            }
          })
          .map(item => [
            item.itemName,
            item.quantity,
            activeTab === 'approved' 
              ? item.approvedQuantity 
              : (item.quantity - (item.approvedQuantity || 0)),
            item.price,
            activeTab === 'approved'
              ? item.approvedQuantity * item.price
              : (item.quantity - (item.approvedQuantity || 0)) * item.price
          ])
      )
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, `${activeTab === 'approved' ? 'Approved' : 'Pending'} Items`);
    XLSX.writeFile(wb, `Budget_Report_${activeTab}.xlsx`);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const tableData = budgets.flatMap(budget => 
      budget.items
        .filter(item => {
          if (activeTab === 'approved') {
            return item.approvedQuantity > 0;
          } else {
            return item.quantity - (item.approvedQuantity || 0) > 0;
          }
        })
        .map(item => [
          item.itemName,
          item.quantity,
          activeTab === 'approved' 
            ? item.approvedQuantity 
            : (item.quantity - (item.approvedQuantity || 0)),
          formatCurrency(item.price),
          formatCurrency(
            activeTab === 'approved'
              ? item.approvedQuantity * item.price
              : (item.quantity - (item.approvedQuantity || 0)) * item.price
          )
        ])
    );

    doc.setFontSize(16);
    doc.text(`${activeTab === 'approved' ? 'Approved' : 'Pending'} Items Report`, 14, 15);
    
    doc.setFontSize(10);
    doc.autoTable({
      head: [['Item Name', 'Requested Qty', activeTab === 'approved' ? 'Approved Qty' : 'Pending Qty', 'Price', 'Total']],
      body: tableData,
      startY: 25,
    });

    doc.save(`Budget_Report_${activeTab}.pdf`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

    const calculateTotalAmount = () => {
    return budgets.reduce((total, budget) => {
      return total + budget.items
        .filter(item => {
          if (activeTab === 'approved') {
            return item.approvedQuantity > 0;
          } else {
            return item.quantity - (item.approvedQuantity || 0) > 0;
          }
        })
        .reduce((itemTotal, item) => {
          const quantity = activeTab === 'approved' 
            ? item.approvedQuantity 
            : (item.quantity - (item.approvedQuantity || 0));
          return itemTotal + (quantity * item.price);
        }, 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Reports</h1>
          <p className="text-gray-600 mt-1">View and export your budget reports</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="btn btn-secondary"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          
          <button 
            onClick={downloadExcel}
            className="btn btn-secondary"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </button>
          
          <button 
            onClick={downloadPDF}
            className="btn btn-primary"
          >
            <FileDown className="h-4 w-4 mr-2" />
            PDF
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'approved'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('approved')}
            >
              Approved Items
            </button>
            <button
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Items
            </button>
          </nav>
        </div>
      </div>

      <div ref={reportRef}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {activeTab === 'approved' ? 'Approved' : 'Pending'} Items
          </h2>
           <div className="text-right">
              <p className="text-sm text-gray-600">Total Amount:</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(calculateTotalAmount())}</p>
            </div>
           </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {activeTab === 'approved' ? 'Approved' : 'Pending'} Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price Per Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {budgets.flatMap(budget => 
                  budget.items
                    .filter(item => {
                      if (activeTab === 'approved') {
                        return item.approvedQuantity > 0;
                      } else {
                        return item.quantity - (item.approvedQuantity || 0) > 0;
                      }
                    })
                    .map((item, index) => {
                      const pendingQuantity = item.quantity - (item.approvedQuantity || 0);
                      return (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="px-6 py-4 whitespace-nowrap">{item.itemName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {activeTab === 'approved' ? item.approvedQuantity : pendingQuantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(item.price)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatCurrency(
                              activeTab === 'approved'
                                ? item.approvedQuantity * item.price
                                : pendingQuantity * item.price
                            )}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 font-semibold">
                  <td colSpan="5" className="px-6 py-4 text-right">Total:</td>
                  <td className="px-6 py-4">{formatCurrency(calculateTotalAmount())}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;