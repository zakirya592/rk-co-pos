import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
  Select,
  SelectItem,
  Input,
} from '@nextui-org/react';
import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaSearch,
  FaFileUpload,
  FaFilter,
  FaDownload,
  FaMoneyBillWave,
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaUniversity,
  FaFileInvoice,
  FaPrint,
} from 'react-icons/fa';
import { useQuery, useQueryClient } from 'react-query';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const BankPaymentVouchersList = ({ onAddNew, onView, onEdit }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Fetch vouchers
  const fetchVouchers = async () => {
    const response = await userRequest.get('/bank-payment-vouchers');
    return response.data;
  };

  const { data, isLoading, error } = useQuery(
    ['bank-payment-vouchers'],
    fetchVouchers
  );

  const vouchers = data?.data?.vouchers || [];

  // Calculate totals
  const totalAmount = vouchers.reduce((sum, v) => sum + (parseFloat(v.amount) || 0), 0);
  const approvedAmount = vouchers
    .filter((v) => v.status === 'approved')
    .reduce((sum, v) => sum + (parseFloat(v.amount) || 0), 0);
  const pendingAmount = vouchers
    .filter((v) => v.status === 'pending')
    .reduce((sum, v) => sum + (parseFloat(v.amount) || 0), 0);

  // Filter vouchers by search term, status, and date
  const filteredVouchers = vouchers.filter((voucher) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      voucher.voucherNumber?.toLowerCase().includes(searchLower) ||
      voucher.referCode?.toLowerCase().includes(searchLower) ||
      voucher.payeeName?.toLowerCase().includes(searchLower) ||
      voucher.bankAccount?.accountName?.toLowerCase().includes(searchLower) ||
      voucher.referenceNumber?.toLowerCase().includes(searchLower) ||
      voucher.transactionId?.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === 'all' || voucher.status === statusFilter;

    let matchesDate = true;
    if (dateFilter === 'custom' && (startDate || endDate)) {
      const voucherDate = new Date(voucher.voucherDate);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (voucherDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (voucherDate > end) matchesDate = false;
      }
    } else if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const voucherDate = new Date(voucher.voucherDate);
      voucherDate.setHours(0, 0, 0, 0);
      matchesDate = voucherDate.getTime() === today.getTime();
    } else if (dateFilter === 'thisMonth') {
      const now = new Date();
      const voucherDate = new Date(voucher.voucherDate);
      matchesDate =
        voucherDate.getMonth() === now.getMonth() &&
        voucherDate.getFullYear() === now.getFullYear();
    } else if (dateFilter === 'thisYear') {
      const now = new Date();
      const voucherDate = new Date(voucher.voucherDate);
      matchesDate = voucherDate.getFullYear() === now.getFullYear();
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount, currency) => {
    const symbol = currency?.symbol || 'Rs';
    const numAmount = parseFloat(amount || 0);
    // Check if amount is a whole number
    const isWholeNumber = numAmount % 1 === 0;
    return `${symbol} ${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: isWholeNumber ? 0 : 2,
      maximumFractionDigits: isWholeNumber ? 0 : 2,
    }).format(numAmount)}`;
  };

  // Format payment method name
  const formatPaymentMethod = (method) => {
    if (!method) return 'N/A';
    const methodMap = {
      'bank_transfer': 'Bank Transfer',
      'check': 'Check',
      'online_payment': 'Online Payment',
      'wire_transfer': 'Wire Transfer',
      'dd': 'Demand Draft (DD)',
      'other': 'Other',
    };
    return methodMap[method] || method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'draft':
        return 'default';
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  // Handle delete
  const handleDelete = async (voucher) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete voucher ${voucher.voucherNumber || voucher.referCode}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await userRequest.delete(`/bank-payment-vouchers/${voucher._id}`);
        toast.success('Voucher deleted successfully');
        queryClient.invalidateQueries(['bank-payment-vouchers']);
      } catch (error) {
        console.error('Error deleting voucher:', error);
        toast.error(
          error.response?.data?.message || 'Failed to delete voucher'
        );
      }
    }
  };

  // Fetch voucher details by ID
  const fetchVoucherDetails = async (voucherId) => {
    try {
      setIsLoadingDetails(true);
      const response = await userRequest.get(`/bank-payment-vouchers/${voucherId}`);
      // API returns { status: "success", data: { voucher: {...} } }
      return response.data?.data?.voucher || response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching voucher details:', error);
      toast.error('Failed to load voucher details');
      return null;
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Handle view details
  const handleView = async (voucher) => {
    onOpen();
    // First show the voucher from list, then fetch full details
    setSelectedVoucher(voucher);
    
    // Fetch complete details from API
    const fullDetails = await fetchVoucherDetails(voucher._id);
    if (fullDetails) {
      setSelectedVoucher(fullDetails);
    }
  };

  // Handle print voucher
  const handlePrint = (voucher) => {
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintContent(voucher);
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // Generate print-friendly HTML content
  const generatePrintContent = (voucher) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bank Payment Voucher - ${voucher.voucherNumber || voucher.referCode}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 1cm;
              }
              body {
                margin: 0;
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.6;
              color: #333;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .header p {
              font-size: 14px;
              color: #666;
            }
            .voucher-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }
            .info-section {
              background: #f9f9f9;
              padding: 15px;
              border: 1px solid #ddd;
            }
            .info-section h3 {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 10px;
              border-bottom: 2px solid #333;
              padding-bottom: 5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
              border-bottom: 1px dotted #ccc;
            }
            .info-label {
              font-weight: bold;
              color: #555;
            }
            .info-value {
              text-align: right;
            }
            .amount-section {
              background: #e8f4f8;
              padding: 20px;
              border: 2px solid #0066cc;
              margin: 30px 0;
              text-align: center;
            }
            .amount-section h2 {
              font-size: 16px;
              margin-bottom: 10px;
              color: #0066cc;
            }
            .amount-value {
              font-size: 32px;
              font-weight: bold;
              color: #0066cc;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #000;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
            .signature-section {
              margin-top: 50px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 50px;
            }
            .signature-box {
              border-top: 1px solid #000;
              padding-top: 10px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BANK PAYMENT VOUCHER</h1>
            <p>${voucher.voucherNumber || voucher.referCode || 'N/A'}</p>
          </div>

          <div class="voucher-info">
            <div class="info-section">
              <h3>Voucher Information</h3>
              <div class="info-row">
                <span class="info-label">Voucher Number:</span>
                <span class="info-value">${voucher.voucherNumber || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Refer Code:</span>
                <span class="info-value">${voucher.referCode || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Voucher Date:</span>
                <span class="info-value">${formatDate(voucher.voucherDate)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">${(voucher.status || 'Draft').toUpperCase()}</span>
              </div>
              ${voucher.transactionId ? `
              <div class="info-row">
                <span class="info-label">Transaction ID:</span>
                <span class="info-value">${voucher.transactionId}</span>
              </div>
              ` : ''}
            </div>

            <div class="info-section">
              <h3>Bank Account</h3>
              <div class="info-row">
                <span class="info-label">Account Name:</span>
                <span class="info-value">${voucher.bankAccount?.accountName || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Account Number:</span>
                <span class="info-value">${voucher.bankAccount?.accountNumber || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Bank Name:</span>
                <span class="info-value">${voucher.bankAccount?.bankName || 'N/A'}</span>
              </div>
              ${voucher.bankAccount?.branchName ? `
              <div class="info-row">
                <span class="info-label">Branch:</span>
                <span class="info-value">${voucher.bankAccount.branchName}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <div class="voucher-info">
            <div class="info-section">
              <h3>Payee Information</h3>
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${voucher.payee?.name || voucher.payeeName || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Type:</span>
                <span class="info-value">${(voucher.payeeType || 'N/A').toUpperCase()}</span>
              </div>
              ${voucher.payee?.email ? `
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${voucher.payee.email}</span>
              </div>
              ` : ''}
              ${voucher.payee?.phoneNumber ? `
              <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">${voucher.payee.phoneNumber}</span>
              </div>
              ` : ''}
            </div>

            <div class="info-section">
              <h3>Payment Details</h3>
              <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">${formatPaymentMethod(voucher.paymentMethod)}</span>
              </div>
              ${voucher.checkNumber ? `
              <div class="info-row">
                <span class="info-label">Check Number:</span>
                <span class="info-value">${voucher.checkNumber}</span>
              </div>
              ` : ''}
              ${voucher.referenceNumber ? `
              <div class="info-row">
                <span class="info-label">Reference Number:</span>
                <span class="info-value">${voucher.referenceNumber}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <div class="amount-section">
            <h2>Total Amount</h2>
            <div class="amount-value">${formatCurrency(voucher.amount, voucher.currency)}</div>
            <p style="margin-top: 10px; font-size: 14px;">
              Currency: ${voucher.currency?.code || 'N/A'} (${voucher.currency?.name || ''})
              ${voucher.currencyExchangeRate && voucher.currencyExchangeRate !== 1 ? ` | Exchange Rate: ${voucher.currencyExchangeRate}` : ''}
            </p>
          </div>

          ${voucher.description || voucher.notes ? `
          <div class="info-section" style="margin: 20px 0;">
            <h3>Additional Information</h3>
            ${voucher.description ? `
            <div style="margin-bottom: 10px;">
              <strong>Description:</strong><br>
              ${voucher.description}
            </div>
            ` : ''}
            ${voucher.notes ? `
            <div>
              <strong>Notes:</strong><br>
              ${voucher.notes}
            </div>
            ` : ''}
          </div>
          ` : ''}

          ${voucher.relatedPurchase || voucher.relatedSale ? `
          <div class="info-section" style="margin: 20px 0;">
            <h3>Related Transactions</h3>
            ${voucher.relatedPurchase ? `
            <div class="info-row">
              <span class="info-label">Related Purchase:</span>
              <span class="info-value">${voucher.relatedPurchase.invoiceNumber || voucher.relatedPurchase._id || 'N/A'}</span>
            </div>
            ` : ''}
            ${voucher.relatedSale ? `
            <div class="info-row">
              <span class="info-label">Related Sale:</span>
              <span class="info-value">${voucher.relatedSale.invoiceNumber || voucher.relatedSale._id || 'N/A'}</span>
            </div>
            ` : ''}
          </div>
          ` : ''}

          <div class="footer">
            <div style="margin-bottom: 30px;">
              <p><strong>Created By:</strong> ${voucher.user?.name || 'N/A'} (${voucher.user?.email || ''})</p>
              <p><strong>Created Date:</strong> ${formatDate(voucher.createdAt)}</p>
              ${voucher.updatedAt && voucher.updatedAt !== voucher.createdAt ? `
              <p><strong>Last Updated:</strong> ${formatDate(voucher.updatedAt)}</p>
              ` : ''}
            </div>

            <div class="signature-section">
              <div class="signature-box">
                <p style="margin-bottom: 40px;">Prepared By</p>
                <p>_________________________</p>
              </div>
              <div class="signature-box">
                <p style="margin-bottom: 40px;">Approved By</p>
                <p>_________________________</p>
              </div>
            </div>

            <p style="margin-top: 30px; font-size: 9px;">
              This is a computer-generated document. No signature is required.
            </p>
          </div>
        </body>
      </html>
    `;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load vouchers</p>
        <Button
          color="primary"
          variant="flat"
          className="mt-4"
          onPress={() => queryClient.invalidateQueries(['bank-payment-vouchers'])}
        >
          Retry
        </Button>
      </div>
    );
  }

  // Calculate additional stats
  const avgAmount = vouchers.length > 0 ? totalAmount / vouchers.length : 0;
  const rejectedCount = vouchers.filter((v) => v.status === 'rejected').length;
  const rejectedAmount = vouchers
    .filter((v) => v.status === 'rejected')
    .reduce((sum, v) => sum + (parseFloat(v.amount) || 0), 0);
  
  // Get recent vouchers (last 5)
  const recentVouchers = [...vouchers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Get top payees
  const payeeStats = vouchers.reduce((acc, v) => {
    const payeeName = v.payee?.name || v.payeeName || 'Unknown';
    if (!acc[payeeName]) {
      acc[payeeName] = { count: 0, total: 0 };
    }
    acc[payeeName].count++;
    acc[payeeName].total += parseFloat(v.amount) || 0;
    return acc;
  }, {});
  const topPayees = Object.entries(payeeStats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  return (
    <>
      <div className="space-y-6 w-full">
        {/* Enhanced Stats Cards - Extended to 6 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">
                    Total Vouchers
                  </p>
                  <p className="text-3xl font-bold">{data?.totalVouchers || 0}</p>
                  <p className="text-blue-100 text-xs mt-1">
                    {filteredVouchers.length} shown
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-4">
                  <FaFileUpload className="text-3xl" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">
                    Approved
                  </p>
                  <p className="text-3xl font-bold">
                    {vouchers.filter((v) => v.status === 'approved').length}
                  </p>
                  <p className="text-green-100 text-xs mt-1">
                    {formatCurrency(approvedAmount, vouchers[0]?.currency)}
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-4">
                  <FaCheckCircle className="text-3xl" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium mb-1">
                    Pending
                  </p>
                  <p className="text-3xl font-bold">
                    {vouchers.filter((v) => v.status === 'pending').length}
                  </p>
                  <p className="text-yellow-100 text-xs mt-1">
                    {formatCurrency(pendingAmount, vouchers[0]?.currency)}
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-4">
                  <FaClock className="text-3xl" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-gray-600 to-gray-700 text-white shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-200 text-sm font-medium mb-1">Draft</p>
                  <p className="text-3xl font-bold">
                    {vouchers.filter((v) => v.status === 'draft').length}
                  </p>
                  <p className="text-gray-200 text-xs mt-1">In progress</p>
                </div>
                <div className="bg-white/20 rounded-full p-4">
                  <FaEdit className="text-3xl" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium mb-1">
                    Rejected
                  </p>
                  <p className="text-3xl font-bold">{rejectedCount}</p>
                  <p className="text-red-100 text-xs mt-1">
                    {formatCurrency(rejectedAmount, vouchers[0]?.currency)}
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-4">
                  <FaTimesCircle className="text-3xl" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm font-medium mb-1">
                    Avg Amount
                  </p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(avgAmount, vouchers[0]?.currency)}
                  </p>
                  <p className="text-indigo-100 text-xs mt-1">Per voucher</p>
                </div>
                <div className="bg-white/20 rounded-full p-4">
                  <FaChartLine className="text-3xl" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Total Amount and Additional Info - Expanded */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl lg:col-span-2">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-indigo-100 text-sm font-medium mb-2">
                    Total Amount
                  </p>
                  <p className="text-4xl font-bold mb-4">
                    {formatCurrency(totalAmount, vouchers[0]?.currency)}
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-indigo-100 mb-1">Transactions</p>
                      <p className="text-xl font-bold">{vouchers.length}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-indigo-100 mb-1">Average</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(avgAmount, vouchers[0]?.currency)}
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-indigo-100 mb-1">This Month</p>
                      <p className="text-xl font-bold">
                        {vouchers.filter((v) => {
                          const voucherDate = new Date(v.voucherDate);
                          const now = new Date();
                          return voucherDate.getMonth() === now.getMonth() &&
                                 voucherDate.getFullYear() === now.getFullYear();
                        }).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 rounded-full p-6 ml-4">
                  <FaMoneyBillWave className="text-5xl" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Insights Card */}
          <Card className="bg-white shadow-xl">
            <CardBody className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Insights
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Approval Rate</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {vouchers.length > 0
                        ? Math.round(
                            (vouchers.filter((v) => v.status === 'approved').length /
                              vouchers.length) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                  <FaCheckCircle className="text-3xl text-blue-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Completion</p>
                    <p className="text-2xl font-bold text-green-600">
                      {vouchers.length > 0
                        ? Math.round(
                            ((vouchers.filter((v) => v.status !== 'draft').length /
                              vouchers.length) *
                              100)
                          )
                        : 0}
                      %
                    </p>
                  </div>
                  <FaChartLine className="text-3xl text-green-500" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main Content Area - Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Table - Takes 3 columns */}
          <div className="xl:col-span-3">
            <Card className="shadow-lg border-0">
              <CardBody className="p-6">
            {/* Header with Search, Filters and Add Button */}
            <div className="mb-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                <div className="flex-1 w-full lg:w-auto">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                    <input
                      type="text"
                      placeholder="Search by voucher number, refer code, payee, or reference..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="flat"
                    startContent={<FaFilter />}
                    onPress={() => setShowFilters(!showFilters)}
                    className={showFilters ? 'bg-blue-100' : ''}
                  >
                    Filters
                  </Button>
                  <Button
                    variant="flat"
                    startContent={<FaDownload />}
                    onPress={() => toast.info('Export functionality coming soon')}
                  >
                    Export
                  </Button>
                  <Button
                    color="primary"
                    size="lg"
                    startContent={<FaPlus />}
                    onPress={onAddNew}
                    className="bg-gradient-to-r from-blue-500 to-blue-600"
                  >
                    Add New Voucher
                  </Button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <Card className="mb-4 bg-gray-50">
                  <CardBody className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Select
                        label="Status"
                        placeholder="All Status"
                        selectedKeys={statusFilter ? [statusFilter] : []}
                        onSelectionChange={(keys) => {
                          const [selected] = Array.from(keys);
                          setStatusFilter(selected || 'all');
                        }}
                        size="sm"
                      >
                        <SelectItem key="all" value="all">
                          All Status
                        </SelectItem>
                        <SelectItem key="approved" value="approved">
                          Approved
                        </SelectItem>
                        <SelectItem key="pending" value="pending">
                          Pending
                        </SelectItem>
                        <SelectItem key="draft" value="draft">
                          Draft
                        </SelectItem>
                        <SelectItem key="rejected" value="rejected">
                          Rejected
                        </SelectItem>
                      </Select>

                      <Select
                        label="Date Range"
                        placeholder="All Time"
                        selectedKeys={dateFilter ? [dateFilter] : []}
                        onSelectionChange={(keys) => {
                          const [selected] = Array.from(keys);
                          setDateFilter(selected || 'all');
                        }}
                        size="sm"
                      >
                        <SelectItem key="all" value="all">
                          All Time
                        </SelectItem>
                        <SelectItem key="today" value="today">
                          Today
                        </SelectItem>
                        <SelectItem key="thisMonth" value="thisMonth">
                          This Month
                        </SelectItem>
                        <SelectItem key="thisYear" value="thisYear">
                          This Year
                        </SelectItem>
                        <SelectItem key="custom" value="custom">
                          Custom Range
                        </SelectItem>
                      </Select>

                      {dateFilter === 'custom' && (
                        <>
                          <Input
                            type="date"
                            label="Start Date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            size="sm"
                          />
                          <Input
                            type="date"
                            label="End Date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            size="sm"
                          />
                        </>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Results Summary */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredVouchers.length}</span> of{' '}
                <span className="font-semibold">{vouchers.length}</span> vouchers
              </p>
              {filteredVouchers.length !== vouchers.length && (
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDateFilter('all');
                    setStartDate('');
                    setEndDate('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            <Divider className="mb-4" />

            {/* Table */}
            <div className="overflow-x-auto">
              <Table
                aria-label="Bank Payment Vouchers table"
                selectionMode="none"
                classNames={{
                  wrapper: 'min-h-[500px]',
                }}
                isStriped
              >
            <TableHeader>
              <TableColumn>VOUCHER NUMBER</TableColumn>
              <TableColumn>REFER CODE</TableColumn>
              <TableColumn>BANK ACCOUNT</TableColumn>
              <TableColumn>PAYEE</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
              <TableColumn>PAYMENT METHOD</TableColumn>
              <TableColumn>REFERENCE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>VOUCHER DATE</TableColumn>
              <TableColumn>CREATED DATE</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No vouchers found">
              {filteredVouchers.map((voucher, index) => (
                <TableRow
                  key={voucher._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell>
                    <div className="font-medium">{voucher.voucherNumber || 'N/A'}</div>
                    {voucher.transactionId && (
                      <div className="text-xs text-gray-500">
                        {voucher.transactionId}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-blue-600">
                      {voucher.referCode || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {voucher.bankAccount?.accountName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {voucher.bankAccount?.accountNumber || ''}
                      </div>
                      <div className="text-xs text-gray-400">
                        {voucher.bankAccount?.bankName || ''}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {voucher.payee?.name || voucher.payeeName || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {voucher.payeeType || ''}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">
                      {formatCurrency(voucher.amount, voucher.currency)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {voucher.currency?.code || ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {formatPaymentMethod(voucher.paymentMethod)}
                    </div>
                    {voucher.checkNumber && (
                      <div className="text-xs text-gray-500 mt-1">
                        Check: {voucher.checkNumber}
                      </div>
                    )}
                    {voucher.transactionId && (
                      <div className="text-xs text-blue-600 mt-1 truncate max-w-[150px]">
                        {voucher.transactionId}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {voucher.referenceNumber && (
                        <div className="text-sm font-medium text-gray-900">
                          {voucher.referenceNumber}
                        </div>
                      )}
                      {voucher.relatedPurchase && (
                        <div className="text-xs text-blue-600">
                          Purchase: {voucher.relatedPurchase.invoiceNumber || 'N/A'}
                        </div>
                      )}
                      {!voucher.referenceNumber && !voucher.relatedPurchase && (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(voucher.status)}
                      variant="flat"
                      size="sm"
                      className="font-semibold"
                    >
                      {voucher.status?.toUpperCase() || 'DRAFT'}
                    </Chip>
                    {voucher.user && (
                      <div className="text-xs text-gray-500 mt-1">
                        by {voucher.user.name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{formatDate(voucher.voucherDate)}</div>
                    {voucher.currencyExchangeRate && voucher.currencyExchangeRate !== 1 && (
                      <div className="text-xs text-gray-500">
                        Rate: {voucher.currencyExchangeRate}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(voucher.createdAt)}</div>
                    {voucher.updatedAt && voucher.updatedAt !== voucher.createdAt && (
                      <div className="text-xs text-gray-400">
                        Updated: {formatDate(voucher.updatedAt)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Tooltip content="View details">
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          onPress={() => handleView(voucher)}
                        >
                          <FaEye />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Edit voucher">
                        <Button
                          size="sm"
                          variant="light"
                          color="primary"
                          isIconOnly
                          onPress={() => onEdit(voucher._id)}
                        >
                          <FaEdit />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Delete voucher">
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          isIconOnly
                          onPress={() => handleDelete(voucher)}
                        >
                          <FaTrash />
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
            </div>

            {/* Empty State Enhancement */}
            {filteredVouchers.length === 0 && vouchers.length > 0 && (
              <div className="text-center py-12">
                <FaSearch className="text-5xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">No vouchers found</p>
                <p className="text-sm text-gray-500 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button
                  variant="flat"
                  onPress={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDateFilter('all');
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}

            {filteredVouchers.length === 0 && vouchers.length === 0 && (
              <div className="text-center py-12">
                <FaFileUpload className="text-5xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">No vouchers yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Get started by creating your first bank payment voucher
                </p>
                <Button
                  color="primary"
                  startContent={<FaPlus />}
                  onPress={onAddNew}
                  className="bg-gradient-to-r from-blue-500 to-blue-600"
                >
                  Create First Voucher
                </Button>
              </div>
            )}

            {/* Summary Footer */}
            {filteredVouchers.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Filtered Results</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {filteredVouchers.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(
                        filteredVouchers.reduce((sum, v) => sum + (parseFloat(v.amount) || 0), 0),
                        vouchers[0]?.currency
                      )}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Approved in Filter</p>
                    <p className="text-2xl font-bold text-green-600">
                      {filteredVouchers.filter((v) => v.status === 'approved').length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(
                        filteredVouchers
                          .filter((v) => v.status === 'approved')
                          .reduce((sum, v) => sum + (parseFloat(v.amount) || 0), 0),
                        vouchers[0]?.currency
                      )}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Pending in Filter</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {filteredVouchers.filter((v) => v.status === 'pending').length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(
                        filteredVouchers
                          .filter((v) => v.status === 'pending')
                          .reduce((sum, v) => sum + (parseFloat(v.amount) || 0), 0),
                        vouchers[0]?.currency
                      )}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Average Amount</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {filteredVouchers.length > 0
                        ? formatCurrency(
                            filteredVouchers.reduce((sum, v) => sum + (parseFloat(v.amount) || 0), 0) /
                              filteredVouchers.length,
                            vouchers[0]?.currency
                          )
                        : formatCurrency(0, vouchers[0]?.currency)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Per voucher</p>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
          </div>

          {/* Right Sidebar - Additional Information */}
          <div className="xl:col-span-1 space-y-6">
            {/* Recent Vouchers */}
            <Card className="shadow-lg border-0">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaClock className="text-blue-500" />
                  Recent Vouchers
                </h3>
                <div className="space-y-3">
                  {recentVouchers.length > 0 ? (
                    recentVouchers.map((voucher) => (
                      <div
                        key={voucher._id}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => handleView(voucher)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-sm text-gray-900">
                            {voucher.voucherNumber || voucher.referCode}
                          </p>
                          <Chip
                            color={getStatusColor(voucher.status)}
                            variant="flat"
                            size="sm"
                          >
                            {voucher.status?.toUpperCase() || 'DRAFT'}
                          </Chip>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          {formatCurrency(voucher.amount, voucher.currency)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(voucher.createdAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No recent vouchers
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Top Payees */}
            <Card className="shadow-lg border-0">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaMoneyBillWave className="text-green-500" />
                  Top Payees
                </h3>
                <div className="space-y-3">
                  {topPayees.length > 0 ? (
                    topPayees.map(([payeeName, stats], index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-sm text-gray-900 truncate flex-1">
                            {payeeName}
                          </p>
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600">
                            {stats.count} voucher{stats.count !== 1 ? 's' : ''}
                          </p>
                          <p className="text-sm font-bold text-green-600">
                            {formatCurrency(stats.total, vouchers[0]?.currency)}
                          </p>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{
                              width: `${(stats.total / totalAmount) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No payee data available
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Payment Methods Breakdown */}
            <Card className="shadow-lg border-0">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaChartLine className="text-purple-500" />
                  Payment Methods
                </h3>
                <div className="space-y-3">
                  {(() => {
                    const methodStats = vouchers.reduce((acc, v) => {
                      const method = v.paymentMethod || 'unknown';
                      if (!acc[method]) {
                        acc[method] = { count: 0, total: 0 };
                      }
                      acc[method].count++;
                      acc[method].total += parseFloat(v.amount) || 0;
                      return acc;
                    }, {});
                    return Object.entries(methodStats).length > 0 ? (
                      Object.entries(methodStats)
                        .sort((a, b) => b[1].total - a[1].total)
                        .map(([method, stats]) => (
                          <div
                            key={method}
                            className="p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-sm text-gray-900 capitalize">
                                {method.replace('_', ' ')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {stats.count}x
                              </p>
                            </div>
                            <p className="text-sm font-bold text-purple-600">
                              {formatCurrency(stats.total, vouchers[0]?.currency)}
                            </p>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No payment method data
                      </p>
                    );
                  })()}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
            <div className="flex items-center justify-between w-full">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedVoucher?.voucherNumber || 'Voucher Details'}
                </h2>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  {selectedVoucher?.referCode}
                </p>
              </div>
              {selectedVoucher?.status && (
                <Chip
                  color={getStatusColor(selectedVoucher.status)}
                  variant="flat"
                  size="lg"
                  className="font-semibold"
                >
                  {selectedVoucher.status?.toUpperCase()}
                </Chip>
              )}
            </div>
          </ModalHeader>
          <ModalBody>
            {isLoadingDetails ? (
              <div className="flex justify-center items-center py-12">
                <Spinner size="lg" />
                <p className="ml-4 text-gray-600">Loading voucher details...</p>
              </div>
            ) : selectedVoucher ? (
              <div className="space-y-6">
                {/* Enhanced Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">Voucher Date</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(selectedVoucher.voucherDate)}
                    </p>
                  </div>
                  {selectedVoucher.transactionId && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <p className="text-xs text-gray-600 mb-1">Transaction ID</p>
                      <p className="font-semibold text-purple-700 text-sm break-all">
                        {selectedVoucher.transactionId}
                      </p>
                    </div>
                  )}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Created Date</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(selectedVoucher.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Bank Account & Payee - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaUniversity className="text-blue-500" />
                      Bank Account
                    </p>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <p className="font-bold text-gray-900 text-lg">
                        {selectedVoucher.bankAccount?.accountName || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        Account: {selectedVoucher.bankAccount?.accountNumber || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedVoucher.bankAccount?.bankName || ''}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FaUser className="text-green-500" />
                      Payee Information
                    </p>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <p className="font-bold text-gray-900 text-lg">
                        {selectedVoucher.payee?.name || selectedVoucher.payeeName || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-700 mt-1 capitalize">
                        Type: {selectedVoucher.payeeType || 'N/A'}
                      </p>
                      {selectedVoucher.payee?.email && (
                        <p className="text-sm text-gray-600 mt-1">
                          {selectedVoucher.payee.email}
                        </p>
                      )}
                      {selectedVoucher.payee?.phoneNumber && (
                        <p className="text-sm text-gray-600">
                          {selectedVoucher.payee.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount - Enhanced */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-indigo-100 text-sm font-medium mb-1">Total Amount</p>
                      <p className="text-4xl font-bold">
                        {formatCurrency(selectedVoucher.amount, selectedVoucher.currency)}
                      </p>
                    </div>
                    <div className="bg-white/20 rounded-full p-4">
                      <FaMoneyBillWave className="text-4xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                    <div>
                      <p className="text-indigo-100 text-xs mb-1">Currency</p>
                      <p className="font-semibold">
                        {selectedVoucher.currency?.code || 'N/A'}
                      </p>
                      <p className="text-xs text-indigo-100">
                        {selectedVoucher.currency?.name || ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-indigo-100 text-xs mb-1">Exchange Rate</p>
                      <p className="font-semibold text-lg">
                        {selectedVoucher.currencyExchangeRate || '1'}
                      </p>
                    </div>
                    <div>
                      <p className="text-indigo-100 text-xs mb-1">Symbol</p>
                      <p className="font-semibold text-lg">
                        {selectedVoucher.currency?.symbol || 'Rs'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Details - Enhanced */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaFileInvoice className="text-orange-500" />
                    Payment Details
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <p className="text-xs text-gray-600 mb-1">Payment Method</p>
                      <p className="font-bold text-lg text-gray-900">
                        {formatPaymentMethod(selectedVoucher.paymentMethod)}
                      </p>
                    </div>
                    {selectedVoucher.checkNumber && (
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <p className="text-xs text-gray-600 mb-1">Check Number</p>
                        <p className="font-bold text-lg text-gray-900">
                          {selectedVoucher.checkNumber}
                        </p>
                      </div>
                    )}
                    {selectedVoucher.referenceNumber && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-xs text-gray-600 mb-1">Reference Number</p>
                        <p className="font-bold text-lg text-gray-900">
                          {selectedVoucher.referenceNumber}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Related Transactions */}
                {(selectedVoucher.relatedPurchase || selectedVoucher.relatedSale) && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FaFileInvoice className="text-indigo-500" />
                      Related Transactions
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedVoucher.relatedPurchase && (
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                          <p className="text-xs text-gray-600 mb-1">Related Purchase</p>
                          <p className="font-bold text-lg text-indigo-700">
                            {selectedVoucher.relatedPurchase.invoiceNumber || 'N/A'}
                          </p>
                          {selectedVoucher.relatedPurchase._id && (
                            <p className="text-xs text-gray-500 mt-1">
                              ID: {selectedVoucher.relatedPurchase._id}
                            </p>
                          )}
                        </div>
                      )}
                      {selectedVoucher.relatedSale && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <p className="text-xs text-gray-600 mb-1">Related Sale</p>
                          <p className="font-bold text-lg text-green-700">
                            {selectedVoucher.relatedSale.invoiceNumber || selectedVoucher.relatedSale._id || 'N/A'}
                          </p>
                          {selectedVoucher.relatedSale._id && (
                            <p className="text-xs text-gray-500 mt-1">
                              ID: {selectedVoucher.relatedSale._id}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description & Notes - Enhanced */}
                {(selectedVoucher.description || selectedVoucher.notes) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedVoucher.description && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {selectedVoucher.description}
                        </p>
                      </div>
                    )}
                    {selectedVoucher.notes && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Notes</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {selectedVoucher.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Attachments - Enhanced */}
                {selectedVoucher.attachments &&
                  selectedVoucher.attachments.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FaFileUpload className="text-blue-500" />
                        Attachments ({selectedVoucher.attachments.length})
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedVoucher.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="bg-white border-2 border-gray-200 p-4 rounded-lg hover:border-blue-400 transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              {attachment.type?.startsWith('image/') ? (
                                <img
                                  src={attachment.url}
                                  alt={attachment.name}
                                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center border border-gray-200">
                                  <FaFileUpload className="text-3xl text-blue-600" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900 mb-1 truncate">
                                  {attachment.name}
                                </p>
                                <p className="text-xs text-gray-500 mb-2">
                                  {attachment.type || 'Unknown type'}
                                </p>
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                                >
                                  View Full Size →
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Created By & Metadata - Enhanced */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-2">Created By</p>
                    <p className="font-semibold text-gray-900">
                      {selectedVoucher.user?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {selectedVoucher.user?.email || ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {formatDate(selectedVoucher.createdAt)}
                    </p>
                  </div>
                  {selectedVoucher.updatedAt && selectedVoucher.updatedAt !== selectedVoucher.createdAt && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">Last Updated</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(selectedVoucher.updatedAt)}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {Math.round(
                          (new Date(selectedVoucher.updatedAt) -
                            new Date(selectedVoucher.createdAt)) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        days after creation
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No voucher selected</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Close
            </Button>
            <Button
              color="default"
              variant="flat"
              startContent={<FaPrint />}
              onPress={() => {
                if (selectedVoucher) {
                  handlePrint(selectedVoucher);
                }
              }}
            >
              Print
            </Button>
            <Button
              color="primary"
              onPress={() => {
                onClose();
                onEdit(selectedVoucher._id);
              }}
            >
              Edit Voucher
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default BankPaymentVouchersList;

