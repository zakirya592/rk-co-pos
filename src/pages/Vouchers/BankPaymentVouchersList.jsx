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
    return `${symbol} ${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0)}`;
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

  // Handle view details
  const handleView = (voucher) => {
    setSelectedVoucher(voucher);
    onOpen();
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
                    <div className="text-sm capitalize font-medium">
                      {voucher.paymentMethod?.replace('_', ' ') || 'N/A'}
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
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold">
              {selectedVoucher?.voucherNumber || 'Voucher Details'}
            </h2>
            <p className="text-sm text-gray-500 font-normal">
              {selectedVoucher?.referCode}
            </p>
          </ModalHeader>
          <ModalBody>
            {selectedVoucher && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Voucher Date</p>
                    <p className="font-medium">
                      {formatDate(selectedVoucher.voucherDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Chip
                      color={getStatusColor(selectedVoucher.status)}
                      variant="flat"
                      size="sm"
                    >
                      {selectedVoucher.status?.toUpperCase()}
                    </Chip>
                  </div>
                </div>

                {/* Bank Account */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Bank Account</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">
                      {selectedVoucher.bankAccount?.accountName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedVoucher.bankAccount?.accountNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedVoucher.bankAccount?.bankName}
                    </p>
                  </div>
                </div>

                {/* Payee */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Payee</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">
                      {selectedVoucher.payee?.name || selectedVoucher.payeeName}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      Type: {selectedVoucher.payeeType}
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-bold text-lg">
                      {formatCurrency(selectedVoucher.amount, selectedVoucher.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Currency</p>
                    <p className="font-medium">
                      {selectedVoucher.currency?.code} ({selectedVoucher.currency?.name})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Exchange Rate</p>
                    <p className="font-medium">
                      {selectedVoucher.currencyExchangeRate || '1'}
                    </p>
                  </div>
                </div>

                {/* Payment Details */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Payment Details</p>
                  <div className="bg-gray-50 p-3 rounded space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium capitalize">
                        {selectedVoucher.paymentMethod?.replace('_', ' ')}
                      </span>
                    </div>
                    {selectedVoucher.checkNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check Number:</span>
                        <span className="font-medium">
                          {selectedVoucher.checkNumber}
                        </span>
                      </div>
                    )}
                    {selectedVoucher.referenceNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reference:</span>
                        <span className="font-medium">
                          {selectedVoucher.referenceNumber}
                        </span>
                      </div>
                    )}
                    {selectedVoucher.transactionId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-medium text-blue-600">
                          {selectedVoucher.transactionId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Related Purchase */}
                {selectedVoucher.relatedPurchase && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Related Purchase</p>
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="font-medium text-blue-700">
                        {selectedVoucher.relatedPurchase.invoiceNumber}
                      </p>
                    </div>
                  </div>
                )}

                {/* Description & Notes */}
                {(selectedVoucher.description || selectedVoucher.notes) && (
                  <div className="space-y-3">
                    {selectedVoucher.description && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Description</p>
                        <p className="text-sm">{selectedVoucher.description}</p>
                      </div>
                    )}
                    {selectedVoucher.notes && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Notes</p>
                        <p className="text-sm">{selectedVoucher.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Attachments */}
                {selectedVoucher.attachments &&
                  selectedVoucher.attachments.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Attachments</p>
                      <div className="space-y-2">
                        {selectedVoucher.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 p-3 rounded flex items-center gap-3"
                          >
                            {attachment.type?.startsWith('image/') ? (
                              <img
                                src={attachment.url}
                                alt={attachment.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-blue-100 rounded flex items-center justify-center">
                                <FaFileUpload className="text-2xl text-blue-600" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{attachment.name}</p>
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                View Attachment
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Created By */}
                <div>
                  <p className="text-sm text-gray-600">Created By</p>
                  <p className="font-medium">
                    {selectedVoucher.user?.name || 'N/A'} (
                    {selectedVoucher.user?.email || ''})
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(selectedVoucher.createdAt)}
                  </p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Close
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

