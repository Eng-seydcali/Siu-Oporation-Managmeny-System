import { useState, useEffect, useRef } from 'react';
import { FileDown, Printer, FileSpreadsheet, RefreshCw, Filter } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departmentUsers, setDepartmentUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('all');
  const [activeTab, setActiveTab] = useState('approved');
  const reportRef = useRef();

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment !== 'all') {
      const users = summary?.departments[selectedDepartment]?.users || [];
      setDepartmentUsers(users);
      setSelectedUser('all'); // Reset selected user when department changes
    } else {
      setDepartmentUsers([]);
      setSelectedUser('all');
    }
  }, [selectedDepartment, summary]);

  useEffect(() => {
    fetchReportData();
  }, [selectedDepartment, selectedUser]);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/api/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      let url = '/api/reports/admin-summary';
      if (selectedDepartment !== 'all') {
        url += `?department=${selectedDepartment}`;
      }
      if (selectedUser !== 'all') {
        url += `${url.includes('?') ? '&' : '?'}userId=${selectedUser}`;
      }
      const res = await axios.get(url);
      setSummary(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch report data');
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
  });

  const downloadExcel = () => {
    if (!summary) return;

    const wb = XLSX.utils.book_new();
    
    // Create sheets for filtered data
    const reportData = [
      [`${activeTab === 'approved' ? 'Approved' : 'Pending'} Items Report`],
      ['Department', selectedDepartment === 'all' ? 'All Departments' : selectedDepartment],
      ['User', selectedUser === 'all' ? 'All Users' : departmentUsers.find(u => u.id === selectedUser)?.name],
      [],
      ['Item Name', 'Department', 'User', 'Requested Qty', activeTab === 'approved' ? 'Approved Qty' : 'Pending Qty', 'Price', 'Total Amount']
    ];

    // Add budget items
    Object.entries(summary.departments).forEach(([dept, data]) => {
      data.budgets?.forEach(budget => {
        if (selectedUser === 'all' || budget.user.id === selectedUser) {
          budget.items
            .filter(item => {
              if (activeTab === 'approved') {
                return item.approvedQuantity > 0;
              } else {
                return item.quantity - (item.approvedQuantity || 0) > 0;
              }
            })
            .forEach(item => {
              const pendingQty = item.quantity - (item.approvedQuantity || 0);
              reportData.push([
                item.itemName,
                dept,
                budget.user.name,
                item.quantity,
                activeTab === 'approved' ? item.approvedQuantity : pendingQty,
                item.price,
                activeTab === 'approved' ? item.approvedQuantity * item.price : pendingQty * item.price
              ]);
            });
        }
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(reportData);
    XLSX.utils.book_append_sheet(wb, ws, `${activeTab} Items`);
    XLSX.writeFile(wb, `Admin_Budget_Report_${selectedDepartment}_${selectedUser}_${activeTab}.xlsx`);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(`${activeTab === 'approved' ? 'Approved' : 'Pending'} Items Report`, 14, 15);
    
    // Add filters info
    doc.setFontSize(12);
    doc.text(`Department: ${selectedDepartment === 'all' ? 'All Departments' : selectedDepartment}`, 14, 25);
    doc.text(`User: ${selectedUser === 'all' ? 'All Users' : departmentUsers.find(u => u.id === selectedUser)?.name}`, 14, 32);

    const tableData = [];
    Object.entries(summary.departments).forEach(([dept, data]) => {
      data.budgets?.forEach(budget => {
        if (selectedUser === 'all' || budget.user.id === selectedUser) {
          budget.items
            .filter(item => {
              if (activeTab === 'approved') {
                return item.approvedQuantity > 0;
              } else {
                return item.quantity - (item.approvedQuantity || 0) > 0;
              }
            })
            .forEach(item => {
              const pendingQty = item.quantity - (item.approvedQuantity || 0);
              tableData.push([
                item.itemName,
                dept,
                budget.user.name,
                item.quantity,
                activeTab === 'approved' ? item.approvedQuantity : pendingQty,
                formatCurrency(item.price),
                formatCurrency(activeTab === 'approved' ? item.approvedQuantity * item.price : pendingQty * item.price)
              ]);
            });
        }
      });
    });

    doc.autoTable({
      head: [['Item', 'Department', 'User', 'Requested Qty', activeTab === 'approved' ? 'Approved Qty' : 'Pending Qty', 'Price', 'Total']],
      body: tableData,
      startY: 40,
    });

    doc.save(`Admin_Budget_Report_${selectedDepartment}_${selectedUser}_${activeTab}.pdf`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateTotalAmount = () => {
    return Object.entries(summary.departments).reduce((total, [dept, data]) => {
      return total + (data.budgets || []).reduce((deptTotal, budget) => {
        if (selectedUser === 'all' || budget.user.id === selectedUser) {
          return deptTotal + budget.items
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
        }
        return deptTotal;
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
        <p>{error}</p>
        <button 
          onClick={fetchReportData}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Try Again
        </button>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
        <p>No report data available. Please ensure there is an active academic year set.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive budget and request reports</p>
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

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>
          
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              className="input"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
            
            
          </div>
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
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === 'approved' ? 'Approved' : 'Pending'} Items Report
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {activeTab === 'approved' ? 'Approved' : 'Pending'} Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price Per Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary.departments).map(([dept, data]) =>
                  (data.budgets || [])
                    .filter(budget => selectedUser === 'all' || budget.user.id === selectedUser)
                    .map(budget =>
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
                            <tr key={`${budget._id}-${index}`} className="border-t border-gray-200">
                              <td className="px-6 py-4 whitespace-nowrap">{item.itemName}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{dept}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{budget.user.name}</td>
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
                    )
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 font-semibold">
                  <td colSpan="6" className="px-6 py-4 text-right">Total:</td>
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