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
  FaUniversity,
} from 'react-icons/fa';
import { useQuery, useQueryClient } from 'react-query';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const BankAccountTransferVouchersList = ({ onAddNew, onView, onEdit }) => {
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
    const response = await userRequest.get('/bank-account-transfer-vouchers');
    return response.data;
  };

  const { data, isLoading, error } = useQuery(
    ['bank-account-transfer-vouchers'],
    fetchVouchers
  );

  const vouchers = data?.data?.vouchers || data?.data || [];

  // Calculate totals
  const totalAmount = vouchers.reduce((sum, v) => sum + (parseFloat(v.amount) || 0), 0);
  const totalFee = vouchers.reduce((sum, v) => sum + (parseFloat(v.transferFee) || 0), 0);
  const netAmount = totalAmount - totalFee;
  const completedCount = vouchers.filter((v) => v.status === 'completed' || v.status === 'approved').length;
  const pendingCount = vouchers.filter((v) => v.status === 'pending' || v.status === 'draft').length;

  // Filter vouchers by search term, status, and date
  const filteredVouchers = vouchers.filter((voucher) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      voucher.voucherNumber?.toLowerCase().includes(searchLower) ||
      voucher.referCode?.toLowerCase().includes(searchLower) ||
      voucher.fromBankAccount?.accountName?.toLowerCase().includes(searchLower) ||
      voucher.toBankAccount?.accountName?.toLowerCase().includes(searchLower) ||
      voucher.referenceNumber?.toLowerCase().includes(searchLower) ||
      voucher.fromBankTransactionId?.toLowerCase().includes(searchLower) ||
      voucher.toBankTransactionId?.toLowerCase().includes(searchLower);

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
      case 'completed':
      case 'approved':
        return 'success';
      case 'pending':
      case 'draft':
        return 'warning';
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
        await userRequest.delete(`/bank-account-transfer-vouchers/${voucher._id}`);
        toast.success('Bank Account Transfer Voucher deleted successfully');
        queryClient.invalidateQueries(['bank-account-transfer-vouchers']);
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
      const response = await userRequest.get(`/bank-account-transfer-vouchers/${voucher._id}`);
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
    const netAmount = parseFloat(voucher.amount || 0) - parseFloat(voucher.transferFee || 0);
    const currencySymbol = voucher.currency?.symbol || 'Rs';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bank Account Transfer Voucher - ${voucher.voucherNumber || voucher.referCode}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .footer { margin-top: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Bank Account Transfer Voucher</h1>
            <h2>${voucher.voucherNumber || voucher.referCode}</h2>
          </div>
          <div class="info">
            <div class="info-row"><strong>Voucher Date:</strong> ${formatDate(voucher.voucherDate)}</div>
            <div class="info-row"><strong>From Bank Account:</strong> ${voucher.fromBankAccount?.accountName || 'N/A'} - ${voucher.fromBankAccount?.accountNumber || ''}</div>
            <div class="info-row"><strong>To Bank Account:</strong> ${voucher.toBankAccount?.accountName || 'N/A'} - ${voucher.toBankAccount?.accountNumber || ''}</div>
            <div class="info-row"><strong>Transfer Method:</strong> ${voucher.transferMethod || 'N/A'}</div>
            <div class="info-row"><strong>Reference Number:</strong> ${voucher.referenceNumber || 'N/A'}</div>
            <div class="info-row"><strong>From Transaction ID:</strong> ${voucher.fromBankTransactionId || 'N/A'}</div>
            <div class="info-row"><strong>To Transaction ID:</strong> ${voucher.toBankTransactionId || 'N/A'}</div>
            <div class="info-row"><strong>Purpose:</strong> ${voucher.purpose || 'N/A'}</div>
            <div class="info-row"><strong>Status:</strong> ${voucher.status?.toUpperCase() || 'DRAFT'}</div>
            <div class="info-row"><strong>Currency:</strong> ${voucher.currency?.name || 'N/A'} (${voucher.currency?.code || 'N/A'})</div>
          </div>
          <div class="info">
            <h3>Transfer Details</h3>
            <div class="info-row"><strong>Amount:</strong> ${formatCurrency(voucher.amount, voucher.currency)}</div>
            <div class="info-row"><strong>Transfer Fee:</strong> ${formatCurrency(voucher.transferFee, voucher.currency)}</div>
            <div class="info-row"><strong>Net Amount:</strong> ${formatCurrency(netAmount, voucher.currency)}</div>
            <div class="info-row"><strong>Exchange Rate:</strong> ${voucher.currencyExchangeRate || '1.00'}</div>
          </div>
          ${voucher.description ? `<div class="info"><strong>Description:</strong> ${voucher.description}</div>` : ''}
          ${voucher.notes ? `<div class="info"><strong>Notes:</strong> ${voucher.notes}</div>` : ''}
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
              Bank Account Transfer Vouchers
            </h1>
            <p className="text-gray-600 mt-2">
              Transfer funds between bank accounts
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
                  <p className="text-teal-100 text-sm">Total Transfers</p>
                  <p className="text-2xl font-bold">{vouchers.length}</p>
                </div>
                <FaExchangeAlt className="text-4xl opacity-50" />
              </div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Amount</p>
                  <p className="text-2xl font-bold">
                    {vouchers.length > 0 && vouchers[0].currency
                      ? formatCurrency(totalAmount, vouchers[0].currency)
                      : `Rs ${totalAmount.toLocaleString()}`}
                  </p>
                </div>
                <FaMoneyBillWave className="text-4xl opacity-50" />
              </div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Completed</p>
                  <p className="text-2xl font-bold">{completedCount}</p>
                </div>
                <FaCheckCircle className="text-4xl opacity-50" />
              </div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Pending</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
                <FaChartLine className="text-4xl opacity-50" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardBody className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <Input
                placeholder="Search vouchers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<FaSearch className="text-gray-400" />}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Select
                  selectedKeys={[statusFilter]}
                  onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0])}
                  className="w-40"
                  placeholder="Status"
                >
                  <SelectItem key="all" value="all">All Status</SelectItem>
                  <SelectItem key="draft" value="draft">Draft</SelectItem>
                  <SelectItem key="pending" value="pending">Pending</SelectItem>
                  <SelectItem key="completed" value="completed">Completed</SelectItem>
                  <SelectItem key="approved" value="approved">Approved</SelectItem>
                  <SelectItem key="cancelled" value="cancelled">Cancelled</SelectItem>
                </Select>
                <Select
                  selectedKeys={[dateFilter]}
                  onSelectionChange={(keys) => setDateFilter(Array.from(keys)[0])}
                  className="w-40"
                  placeholder="Date"
                >
                  <SelectItem key="all" value="all">All Dates</SelectItem>
                  <SelectItem key="today" value="today">Today</SelectItem>
                  <SelectItem key="thisMonth" value="thisMonth">This Month</SelectItem>
                  <SelectItem key="thisYear" value="thisYear">This Year</SelectItem>
                  <SelectItem key="custom" value="custom">Custom Range</SelectItem>
                </Select>
                <Button
                  variant="flat"
                  onPress={() => setShowFilters(!showFilters)}
                  startContent={<FaFilter />}
                >
                  Filters
                </Button>
              </div>
            </div>
            {showFilters && dateFilter === 'custom' && (
              <div className="flex gap-4 mt-4">
                <Input
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1"
                />
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardBody>
          <Table aria-label="Bank Account Transfer Vouchers">
            <TableHeader>
              <TableColumn>VOUCHER #</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>FROM ACCOUNT</TableColumn>
              <TableColumn>TO ACCOUNT</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
              <TableColumn>FEE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No vouchers found">
              {filteredVouchers.map((voucher) => (
                <TableRow key={voucher._id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{voucher.voucherNumber || voucher.referCode || 'N/A'}</p>
                      {voucher.referenceNumber && (
                        <p className="text-xs text-gray-500">Ref: {voucher.referenceNumber}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(voucher.voucherDate)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FaUniversity className="text-teal-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {voucher.fromBankAccount?.accountName || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {voucher.fromBankAccount?.accountNumber || ''}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FaUniversity className="text-green-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {voucher.toBankAccount?.accountName || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {voucher.toBankAccount?.accountNumber || ''}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(voucher.amount, voucher.currency)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {formatCurrency(voucher.transferFee || 0, voucher.currency)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(voucher.status)}
                      variant="flat"
                      size="sm"
                    >
                      {voucher.status?.toUpperCase() || 'DRAFT'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tooltip content="View Details">
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          onPress={() => handleView(voucher)}
                        >
                          <FaEye className="text-blue-500" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Edit">
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          onPress={() => onEdit(voucher._id)}
                        >
                          <FaEdit className="text-green-500" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Print">
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          onPress={() => handlePrint(voucher)}
                        >
                          <FaPrint className="text-purple-500" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Delete">
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          onPress={() => handleDelete(voucher)}
                        >
                          <FaTrash className="text-red-500" />
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* View Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <FaExchangeAlt className="text-teal-600" />
              <div>
                <h2>Bank Account Transfer Voucher Details</h2>
                <p className="text-sm text-gray-500 font-normal">
                  {selectedVoucher?.voucherNumber || selectedVoucher?.referCode || 'N/A'}
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            {isLoadingDetails ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : selectedVoucher ? (
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaCalendarAlt className="text-teal-500" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Voucher Date</p>
                      <p className="font-semibold">{formatDate(selectedVoucher.voucherDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Chip color={getStatusColor(selectedVoucher.status)} variant="flat" size="sm">
                        {selectedVoucher.status?.toUpperCase() || 'DRAFT'}
                      </Chip>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reference Number</p>
                      <p className="font-semibold">{selectedVoucher.referenceNumber || 'N/A'}</p>
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

                {/* Bank Accounts */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaUniversity className="text-teal-500" />
                    Bank Accounts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-red-50">
                      <CardBody className="p-4">
                        <p className="text-sm text-gray-600 mb-2">From Account</p>
                        <p className="font-bold text-lg">
                          {selectedVoucher.fromBankAccount?.accountName || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedVoucher.fromBankAccount?.accountNumber || ''}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedVoucher.fromBankAccount?.bankName || ''}
                        </p>
                      </CardBody>
                    </Card>
                    <Card className="bg-green-50">
                      <CardBody className="p-4">
                        <p className="text-sm text-gray-600 mb-2">To Account</p>
                        <p className="font-bold text-lg">
                          {selectedVoucher.toBankAccount?.accountName || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedVoucher.toBankAccount?.accountNumber || ''}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedVoucher.toBankAccount?.bankName || ''}
                        </p>
                      </CardBody>
                    </Card>
                  </div>
                </div>

                <Divider />

                {/* Transfer Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaMoneyBillWave className="text-teal-500" />
                    Transfer Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-bold text-xl text-green-600">
                        {formatCurrency(selectedVoucher.amount, selectedVoucher.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Transfer Fee</p>
                      <p className="font-semibold text-lg">
                        {formatCurrency(selectedVoucher.transferFee || 0, selectedVoucher.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Net Amount</p>
                      <p className="font-bold text-xl text-teal-600">
                        {formatCurrency(
                          parseFloat(selectedVoucher.amount || 0) - parseFloat(selectedVoucher.transferFee || 0),
                          selectedVoucher.currency
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Transfer Method</p>
                      <p className="font-semibold">{selectedVoucher.transferMethod || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Exchange Rate</p>
                      <p className="font-semibold">{selectedVoucher.currencyExchangeRate || '1.00'}</p>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Transaction IDs */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaFileInvoice className="text-teal-500" />
                    Transaction Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">From Transaction ID</p>
                      <p className="font-semibold">{selectedVoucher.fromBankTransactionId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">To Transaction ID</p>
                      <p className="font-semibold">{selectedVoucher.toBankTransactionId || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Purpose</p>
                      <p className="font-semibold">{selectedVoucher.purpose || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {(selectedVoucher.description || selectedVoucher.notes) && (
                  <>
                    <Divider />
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                      {selectedVoucher.description && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Description</p>
                          <p className="text-sm">{selectedVoucher.description}</p>
                        </div>
                      )}
                      {selectedVoucher.notes && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Notes</p>
                          <p className="text-sm">{selectedVoucher.notes}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p>No voucher details available</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Close
            </Button>
            {selectedVoucher && (
              <Button
                color="primary"
                onPress={() => {
                  onClose();
                  handlePrint(selectedVoucher);
                }}
                startContent={<FaPrint />}
              >
                Print
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default BankAccountTransferVouchersList;

