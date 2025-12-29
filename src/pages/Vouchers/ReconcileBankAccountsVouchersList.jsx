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
  FaFilter,
  FaMoneyBillWave,
  FaChartLine,
  FaCheckCircle,
  FaFileInvoice,
  FaPrint,
  FaExchangeAlt,
} from 'react-icons/fa';
import { useQuery, useQueryClient } from 'react-query';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const ReconcileBankAccountsVouchersList = ({ onAddNew, onView, onEdit }) => {
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
    const response = await userRequest.get('/reconcile-bank-accounts-vouchers');
    return response.data;
  };

  const { data, isLoading, error } = useQuery(
    ['reconcile-bank-accounts-vouchers'],
    fetchVouchers
  );

  const vouchers = data?.data?.vouchers || data?.data || [];

  // Calculate totals
  const totalBookBalance = vouchers.reduce((sum, v) => sum + (parseFloat(v.bookBalance) || 0), 0);
  const totalStatementBalance = vouchers.reduce((sum, v) => sum + (parseFloat(v.statementBalance) || 0), 0);
  const reconciledCount = vouchers.filter((v) => v.status === 'reconciled' || v.status === 'completed').length;
  const pendingCount = vouchers.filter((v) => v.status === 'pending' || v.status === 'unmatched').length;

  // Filter vouchers by search term, status, and date
  const filteredVouchers = vouchers.filter((voucher) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      voucher.voucherNumber?.toLowerCase().includes(searchLower) ||
      voucher.referCode?.toLowerCase().includes(searchLower) ||
      voucher.statementNumber?.toLowerCase().includes(searchLower) ||
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
    const isWholeNumber = numAmount % 1 === 0;
    return `${symbol} ${numAmount.toLocaleString('en-US', {
      minimumFractionDigits: isWholeNumber ? 0 : 2,
      maximumFractionDigits: isWholeNumber ? 0 : 2,
    })}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'reconciled':
      case 'approved':
        return 'success';
      case 'pending':
      case 'unmatched':
        return 'warning';
      case 'completed':
        return 'primary';
      case 'cancelled':
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
        await userRequest.delete(`/reconcile-bank-accounts-vouchers/${voucher._id}`);
        toast.success('Reconcile Bank Accounts Voucher deleted successfully');
        queryClient.invalidateQueries(['reconcile-bank-accounts-vouchers']);
      } catch (error) {
        console.error('Error deleting voucher:', error);
        toast.error(error.response?.data?.message || 'Failed to delete voucher');
      }
    }
  };

  // Handle view
  const handleView = async (voucher) => {
    try {
      setIsLoadingDetails(true);
      const response = await userRequest.get(`/reconcile-bank-accounts-vouchers/${voucher._id}`);
      const voucherData = response.data?.data?.voucher || response.data?.data || response.data;
      setSelectedVoucher(voucherData);
      onOpen();
    } catch (error) {
      console.error('Error fetching voucher details:', error);
      toast.error('Failed to load voucher details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Handle print
  const handlePrint = (voucher) => {
    const printContent = generatePrintContent(voucher);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const generatePrintContent = (voucher) => {
    const difference = parseFloat(voucher.statementBalance || 0) - parseFloat(voucher.bookBalance || 0);
    const currencySymbol = voucher.currency?.symbol || 'Rs';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reconcile Bank Accounts Voucher - ${voucher.voucherNumber || voucher.referCode}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Reconcile Bank Accounts Voucher</h1>
            <h2>${voucher.voucherNumber || voucher.referCode}</h2>
          </div>
          <div class="info">
            <div class="info-row"><strong>Voucher Date:</strong> ${formatDate(voucher.voucherDate)}</div>
            <div class="info-row"><strong>Bank Account:</strong> ${voucher.bankAccount?.accountName || 'N/A'}</div>
            <div class="info-row"><strong>Statement Date:</strong> ${formatDate(voucher.statementDate)}</div>
            <div class="info-row"><strong>Statement Number:</strong> ${voucher.statementNumber || 'N/A'}</div>
            <div class="info-row"><strong>Reference Number:</strong> ${voucher.referenceNumber || 'N/A'}</div>
            <div class="info-row"><strong>Status:</strong> ${voucher.status?.toUpperCase() || 'DRAFT'}</div>
            <div class="info-row"><strong>Currency:</strong> ${voucher.currency?.name || 'N/A'} (${voucher.currency?.code || 'N/A'})</div>
          </div>
          <div class="info">
            <h3>Balances</h3>
            <div class="info-row"><strong>Opening Balance:</strong> ${formatCurrency(voucher.openingBalance, voucher.currency)}</div>
            <div class="info-row"><strong>Closing Balance:</strong> ${formatCurrency(voucher.closingBalance, voucher.currency)}</div>
            <div class="info-row"><strong>Book Balance:</strong> ${formatCurrency(voucher.bookBalance, voucher.currency)}</div>
            <div class="info-row"><strong>Statement Balance:</strong> ${formatCurrency(voucher.statementBalance, voucher.currency)}</div>
            <div class="info-row"><strong>Difference:</strong> ${formatCurrency(difference, voucher.currency)}</div>
          </div>
          <div class="info">
            <h3>Outstanding Items</h3>
            <div class="info-row"><strong>Outstanding Deposits:</strong> ${formatCurrency(voucher.outstandingDeposits, voucher.currency)}</div>
            <div class="info-row"><strong>Outstanding Withdrawals:</strong> ${formatCurrency(voucher.outstandingWithdrawals, voucher.currency)}</div>
            <div class="info-row"><strong>Outstanding Checks:</strong> ${formatCurrency(voucher.outstandingChecks, voucher.currency)}</div>
            <div class="info-row"><strong>Bank Charges:</strong> ${formatCurrency(voucher.bankCharges, voucher.currency)}</div>
            <div class="info-row"><strong>Interest Earned:</strong> ${formatCurrency(voucher.interestEarned, voucher.currency)}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${voucher.entries?.map(entry => `
                <tr>
                  <td>${formatDate(entry.statementDate)}</td>
                  <td>${entry.statementDescription || 'N/A'}</td>
                  <td>${entry.statementAmount ? formatCurrency(entry.statementAmount, voucher.currency) : '-'}</td>
                  <td>${entry.statementType || 'N/A'}</td>
                  <td>${entry.statementReference || '-'}</td>
                  <td>${entry.status || 'N/A'}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          ${voucher.notes ? `<div><strong>Notes:</strong> ${voucher.notes}</div>` : ''}
          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card>
          <CardBody>
            <p className="text-red-500">Error loading vouchers: {error.message}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaExchangeAlt className="text-teal-600" />
              Reconcile Bank Accounts Vouchers
            </h1>
            <p className="text-gray-600 mt-2">
              Reconcile bank account statements with book records
            </p>
          </div>
          <Button
            color="primary"
            size="lg"
            onPress={onAddNew}
            startContent={<FaPlus />}
            className="bg-gradient-to-r from-teal-500 to-cyan-600"
          >
            Add New Voucher
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm">Total Vouchers</p>
                  <p className="text-2xl font-bold">{vouchers.length}</p>
                </div>
                <FaExchangeAlt className="text-3xl opacity-50" />
              </div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Book Balance</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalBookBalance, { symbol: 'Rs' })}
                  </p>
                </div>
                <FaMoneyBillWave className="text-3xl opacity-50" />
              </div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Statement Balance</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalStatementBalance, { symbol: 'Rs' })}
                  </p>
                </div>
                <FaChartLine className="text-3xl opacity-50" />
              </div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Reconciled</p>
                  <p className="text-2xl font-bold">{reconciledCount}</p>
                </div>
                <FaCheckCircle className="text-3xl opacity-50" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search vouchers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<FaSearch className="text-gray-400" />}
                className="flex-1"
              />
              <Button
                variant="flat"
                onPress={() => setShowFilters(!showFilters)}
                startContent={<FaFilter />}
              >
                Filters
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                <Select
                  label="Status"
                  selectedKeys={[statusFilter]}
                  onSelectionChange={(keys) =>
                    setStatusFilter(Array.from(keys)[0] || 'all')
                  }
                >
                  <SelectItem key="all">All</SelectItem>
                  <SelectItem key="draft">Draft</SelectItem>
                  <SelectItem key="pending">Pending</SelectItem>
                  <SelectItem key="unmatched">Unmatched</SelectItem>
                  <SelectItem key="reconciled">Reconciled</SelectItem>
                  <SelectItem key="approved">Approved</SelectItem>
                  <SelectItem key="completed">Completed</SelectItem>
                  <SelectItem key="cancelled">Cancelled</SelectItem>
                </Select>
                <Select
                  label="Date Range"
                  selectedKeys={[dateFilter]}
                  onSelectionChange={(keys) =>
                    setDateFilter(Array.from(keys)[0] || 'all')
                  }
                >
                  <SelectItem key="all">All Time</SelectItem>
                  <SelectItem key="today">Today</SelectItem>
                  <SelectItem key="thisMonth">This Month</SelectItem>
                  <SelectItem key="thisYear">This Year</SelectItem>
                  <SelectItem key="custom">Custom Range</SelectItem>
                </Select>
                {dateFilter === 'custom' && (
                  <div className="grid grid-cols-2 gap-2">
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
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          <Table aria-label="Reconcile Bank Accounts Vouchers">
            <TableHeader>
              <TableColumn>VOUCHER NUMBER</TableColumn>
              <TableColumn>BANK ACCOUNT</TableColumn>
              <TableColumn>STATEMENT NUMBER</TableColumn>
              <TableColumn>STATEMENT DATE</TableColumn>
              <TableColumn>BOOK BALANCE</TableColumn>
              <TableColumn>STATEMENT BALANCE</TableColumn>
              <TableColumn>DIFFERENCE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>VOUCHER DATE</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No reconcile bank accounts vouchers found">
              {filteredVouchers.map((voucher) => {
                const difference = parseFloat(voucher.statementBalance || 0) - parseFloat(voucher.bookBalance || 0);
                return (
                  <TableRow key={voucher._id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="font-medium">{voucher.voucherNumber || 'N/A'}</div>
                      {voucher.transactionId && (
                        <div className="text-xs text-gray-500">{voucher.transactionId}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-teal-600">
                        {voucher.bankAccount?.accountName || 'N/A'}
                      </div>
                      {voucher.bankAccount?.accountNumber && (
                        <div className="text-xs text-gray-500">{voucher.bankAccount.accountNumber}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{voucher.statementNumber || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{formatDate(voucher.statementDate)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {formatCurrency(voucher.bookBalance, voucher.currency)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {formatCurrency(voucher.statementBalance, voucher.currency)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-semibold ${difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(difference, voucher.currency)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip color={getStatusColor(voucher.status)} variant="flat" size="sm" className="font-semibold">
                        {voucher.status?.toUpperCase() || 'DRAFT'}
                      </Chip>
                      {voucher.user && (
                        <div className="text-xs text-gray-500 mt-1">by {voucher.user.name}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{formatDate(voucher.voucherDate)}</div>
                      {voucher.currencyExchangeRate && voucher.currencyExchangeRate !== 1 && (
                        <div className="text-xs text-gray-500">Rate: {voucher.currencyExchangeRate}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Tooltip content="View details">
                          <Button size="sm" variant="light" isIconOnly onPress={() => handleView(voucher)}>
                            <FaEye />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Edit voucher">
                          <Button size="sm" variant="light" color="primary" isIconOnly onPress={() => onEdit(voucher._id)}>
                            <FaEdit />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete voucher">
                          <Button size="sm" variant="light" color="danger" isIconOnly onPress={() => handleDelete(voucher)}>
                            <FaTrash />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* View Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <FaExchangeAlt className="text-teal-600" />
              <span>Reconcile Bank Accounts Voucher Details</span>
            </div>
            <p className="text-sm font-normal text-gray-500">
              {selectedVoucher?.voucherNumber || selectedVoucher?.referCode || 'N/A'}
            </p>
          </ModalHeader>
          <ModalBody>
            {isLoadingDetails ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : selectedVoucher ? (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaCalendarAlt className="text-teal-500" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Voucher Number</p>
                      <p className="font-semibold">{selectedVoucher.voucherNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Refer Code</p>
                      <p className="font-semibold text-teal-600">{selectedVoucher.referCode || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bank Account</p>
                      <p className="font-semibold">{selectedVoucher.bankAccount?.accountName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Statement Number</p>
                      <p className="font-semibold">{selectedVoucher.statementNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Voucher Date</p>
                      <p className="font-semibold">{formatDate(selectedVoucher.voucherDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Statement Date</p>
                      <p className="font-semibold">{formatDate(selectedVoucher.statementDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Chip color={getStatusColor(selectedVoucher.status)} variant="flat" size="sm">
                        {selectedVoucher.status?.toUpperCase() || 'DRAFT'}
                      </Chip>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Currency</p>
                      <p className="font-semibold">
                        {selectedVoucher.currency?.name || 'N/A'} ({selectedVoucher.currency?.code || 'N/A'})
                      </p>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Balances */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaMoneyBillWave className="text-teal-500" />
                    Balances
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Opening Balance</p>
                      <p className="font-semibold">{formatCurrency(selectedVoucher.openingBalance, selectedVoucher.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Closing Balance</p>
                      <p className="font-semibold">{formatCurrency(selectedVoucher.closingBalance, selectedVoucher.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Book Balance</p>
                      <p className="font-semibold">{formatCurrency(selectedVoucher.bookBalance, selectedVoucher.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Statement Balance</p>
                      <p className="font-semibold">{formatCurrency(selectedVoucher.statementBalance, selectedVoucher.currency)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Difference</p>
                      <p className={`font-semibold text-lg ${
                        (parseFloat(selectedVoucher.statementBalance || 0) - parseFloat(selectedVoucher.bookBalance || 0)) === 0
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(
                          parseFloat(selectedVoucher.statementBalance || 0) - parseFloat(selectedVoucher.bookBalance || 0),
                          selectedVoucher.currency
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Outstanding Items */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Outstanding Items</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Outstanding Deposits</p>
                      <p className="font-semibold">{formatCurrency(selectedVoucher.outstandingDeposits, selectedVoucher.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Outstanding Withdrawals</p>
                      <p className="font-semibold">{formatCurrency(selectedVoucher.outstandingWithdrawals, selectedVoucher.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Outstanding Checks</p>
                      <p className="font-semibold">{formatCurrency(selectedVoucher.outstandingChecks, selectedVoucher.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bank Charges</p>
                      <p className="font-semibold">{formatCurrency(selectedVoucher.bankCharges, selectedVoucher.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Interest Earned</p>
                      <p className="font-semibold">{formatCurrency(selectedVoucher.interestEarned, selectedVoucher.currency)}</p>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Entries */}
                {selectedVoucher.entries && selectedVoucher.entries.length > 0 && (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FaFileInvoice className="text-teal-500" />
                        Statement Entries
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border p-2 text-left">Date</th>
                              <th className="border p-2 text-left">Description</th>
                              <th className="border p-2 text-right">Amount</th>
                              <th className="border p-2 text-left">Type</th>
                              <th className="border p-2 text-left">Reference</th>
                              <th className="border p-2 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedVoucher.entries.map((entry, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border p-2">{formatDate(entry.statementDate)}</td>
                                <td className="border p-2">{entry.statementDescription || 'N/A'}</td>
                                <td className="border p-2 text-right">
                                  {entry.statementAmount ? formatCurrency(entry.statementAmount, selectedVoucher.currency) : '-'}
                                </td>
                                <td className="border p-2">{entry.statementType || 'N/A'}</td>
                                <td className="border p-2">{entry.statementReference || '-'}</td>
                                <td className="border p-2">
                                  <Chip color={entry.status === 'reconciled' ? 'success' : 'warning'} variant="flat" size="sm">
                                    {entry.status || 'N/A'}
                                  </Chip>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <Divider />
                  </>
                )}

                {selectedVoucher.notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Notes</h3>
                    <p className="text-gray-700">{selectedVoucher.notes}</p>
                  </div>
                )}

                {selectedVoucher.attachments && selectedVoucher.attachments.length > 0 && (
                  <>
                    <Divider />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Attachments</h3>
                      <div className="space-y-2">
                        {selectedVoucher.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:underline"
                          >
                            <FaFileInvoice />
                            <span>{att.name || 'Attachment'}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Close
            </Button>
            <Button
              color="success"
              onPress={() => handlePrint(selectedVoucher)}
              startContent={<FaPrint />}
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
    </div>
  );
};

export default ReconcileBankAccountsVouchersList;
