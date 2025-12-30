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
  FaCoins,
  FaExchangeAlt,
} from 'react-icons/fa';
import { useQuery, useQueryClient } from 'react-query';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const SarafEntryVouchersList = ({ onAddNew, onView, onEdit }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [exchangeTypeFilter, setExchangeTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Fetch vouchers
  const fetchVouchers = async () => {
    const response = await userRequest.get('/saraf-entry-vouchers');
    return response.data;
  };

  const { data, isLoading, error } = useQuery(
    ['saraf-entry-vouchers'],
    fetchVouchers
  );

  const vouchers = data?.data?.vouchers || data?.data || [];

  // Calculate totals
  const totalFromAmount = vouchers.reduce((sum, v) => sum + (parseFloat(v.fromAmount) || 0), 0);
  const totalToAmount = vouchers.reduce((sum, v) => sum + (parseFloat(v.toAmount) || 0), 0);
  const totalCommission = vouchers.reduce((sum, v) => sum + (parseFloat(v.commission) || 0), 0);
  const buyCount = vouchers.filter((v) => v.exchangeType === 'buy').length;
  const sellCount = vouchers.filter((v) => v.exchangeType === 'sell').length;

  // Filter vouchers by search term, exchange type, and date
  const filteredVouchers = vouchers.filter((voucher) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      voucher.voucherNumber?.toLowerCase().includes(searchLower) ||
      voucher.referCode?.toLowerCase().includes(searchLower) ||
      voucher.fromCurrency?.name?.toLowerCase().includes(searchLower) ||
      voucher.toCurrency?.name?.toLowerCase().includes(searchLower) ||
      voucher.sarafName?.toLowerCase().includes(searchLower) ||
      voucher.referenceNumber?.toLowerCase().includes(searchLower);

    const matchesExchangeType =
      exchangeTypeFilter === 'all' || voucher.exchangeType === exchangeTypeFilter;

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

    return matchesSearch && matchesExchangeType && matchesDate;
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
        await userRequest.delete(`/saraf-entry-vouchers/${voucher._id}`);
        toast.success('Saraf Entry Voucher deleted successfully');
        queryClient.invalidateQueries(['saraf-entry-vouchers']);
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
      const response = await userRequest.get(`/saraf-entry-vouchers/${voucher._id}`);
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
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Saraf Entry Voucher - ${voucher.voucherNumber || voucher.referCode}</title>
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
            <h1>Saraf Entry Voucher</h1>
            <h2>${voucher.voucherNumber || voucher.referCode}</h2>
          </div>
          <div class="info">
            <div class="info-row"><strong>Voucher Date:</strong> ${formatDate(voucher.voucherDate)}</div>
            <div class="info-row"><strong>Exchange Type:</strong> ${voucher.exchangeType?.toUpperCase() || 'N/A'}</div>
            <div class="info-row"><strong>From Currency:</strong> ${voucher.fromCurrency?.name || 'N/A'} (${voucher.fromCurrency?.code || 'N/A'})</div>
            <div class="info-row"><strong>To Currency:</strong> ${voucher.toCurrency?.name || 'N/A'} (${voucher.toCurrency?.code || 'N/A'})</div>
            <div class="info-row"><strong>Exchange Rate:</strong> ${voucher.exchangeRate || '1.00'}</div>
            <div class="info-row"><strong>Market Rate:</strong> ${voucher.marketRate || 'N/A'}</div>
            <div class="info-row"><strong>Reference Number:</strong> ${voucher.referenceNumber || 'N/A'}</div>
            <div class="info-row"><strong>Saraf Name:</strong> ${voucher.sarafName || 'N/A'}</div>
            <div class="info-row"><strong>Saraf Contact:</strong> ${voucher.sarafContact || 'N/A'}</div>
            <div class="info-row"><strong>Purpose:</strong> ${voucher.purpose || 'N/A'}</div>
          </div>
          <div class="info">
            <h3>Exchange Details</h3>
            <div class="info-row"><strong>From Amount:</strong> ${formatCurrency(voucher.fromAmount, voucher.fromCurrency)}</div>
            <div class="info-row"><strong>To Amount:</strong> ${formatCurrency(voucher.toAmount, voucher.toCurrency)}</div>
            <div class="info-row"><strong>Commission:</strong> ${formatCurrency(voucher.commission || 0, voucher.fromCurrency)}</div>
            ${voucher.commissionPercentage ? `<div class="info-row"><strong>Commission Percentage:</strong> ${voucher.commissionPercentage}%</div>` : ''}
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
              <FaCoins className="text-amber-600" />
              Saraf Entry Vouchers
            </h1>
            <p className="text-gray-600 mt-2">
              Currency exchange entry management
            </p>
          </div>
          <Button
            color="primary"
            size="lg"
            onPress={onAddNew}
            startContent={<FaPlus />}
            className="bg-gradient-to-r from-amber-500 to-orange-600"
          >
            Add New Voucher
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Total Entries</p>
                  <p className="text-2xl font-bold">{vouchers.length}</p>
                </div>
                <FaCoins className="text-4xl opacity-50" />
              </div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Buy Transactions</p>
                  <p className="text-2xl font-bold">{buyCount}</p>
                </div>
                <FaExchangeAlt className="text-4xl opacity-50" />
              </div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Sell Transactions</p>
                  <p className="text-2xl font-bold">{sellCount}</p>
                </div>
                <FaChartLine className="text-4xl opacity-50" />
              </div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Commission</p>
                  <p className="text-xl font-bold">
                    {vouchers.length > 0 && vouchers[0].fromCurrency
                      ? formatCurrency(totalCommission, vouchers[0].fromCurrency)
                      : `Rs ${totalCommission.toLocaleString()}`}
                  </p>
                </div>
                <FaMoneyBillWave className="text-4xl opacity-50" />
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
                  selectedKeys={[exchangeTypeFilter]}
                  onSelectionChange={(keys) => setExchangeTypeFilter(Array.from(keys)[0])}
                  className="w-40"
                  placeholder="Type"
                >
                  <SelectItem key="all" value="all">All Types</SelectItem>
                  <SelectItem key="buy" value="buy">Buy</SelectItem>
                  <SelectItem key="sell" value="sell">Sell</SelectItem>
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
          <Table aria-label="Saraf Entry Vouchers">
            <TableHeader>
              <TableColumn>VOUCHER #</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>FROM CURRENCY</TableColumn>
              <TableColumn>TO CURRENCY</TableColumn>
              <TableColumn>FROM AMOUNT</TableColumn>
              <TableColumn>TO AMOUNT</TableColumn>
              <TableColumn>COMMISSION</TableColumn>
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
                    <Chip
                      color={voucher.exchangeType === 'buy' ? 'success' : 'warning'}
                      variant="flat"
                      size="sm"
                    >
                      {voucher.exchangeType?.toUpperCase() || 'N/A'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {voucher.fromCurrency?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {voucher.fromCurrency?.code || ''}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {voucher.toCurrency?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {voucher.toCurrency?.code || ''}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-red-600">
                      {formatCurrency(voucher.fromAmount, voucher.fromCurrency)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(voucher.toAmount, voucher.toCurrency)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {formatCurrency(voucher.commission || 0, voucher.fromCurrency)}
                    </p>
                    {voucher.commissionPercentage && (
                      <p className="text-xs text-gray-500">
                        ({voucher.commissionPercentage}%)
                      </p>
                    )}
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
              <FaCoins className="text-amber-600" />
              <div>
                <h2>Saraf Entry Voucher Details</h2>
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
                    <FaCalendarAlt className="text-amber-500" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Voucher Date</p>
                      <p className="font-semibold">{formatDate(selectedVoucher.voucherDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Exchange Type</p>
                      <Chip
                        color={selectedVoucher.exchangeType === 'buy' ? 'success' : 'warning'}
                        variant="flat"
                        size="sm"
                      >
                        {selectedVoucher.exchangeType?.toUpperCase() || 'N/A'}
                      </Chip>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reference Number</p>
                      <p className="font-semibold">{selectedVoucher.referenceNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Exchange Rate</p>
                      <p className="font-semibold">{selectedVoucher.exchangeRate || '1.00'}</p>
                    </div>
                    {selectedVoucher.marketRate && (
                      <div>
                        <p className="text-sm text-gray-600">Market Rate</p>
                        <p className="font-semibold">{selectedVoucher.marketRate}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Divider />

                {/* Currency Exchange */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaExchangeAlt className="text-amber-500" />
                    Currency Exchange
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-red-50">
                      <CardBody className="p-4">
                        <p className="text-sm text-gray-600 mb-2">From Currency</p>
                        <p className="font-bold text-lg">
                          {selectedVoucher.fromCurrency?.name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedVoucher.fromCurrency?.code || ''}
                        </p>
                      </CardBody>
                    </Card>
                    <Card className="bg-green-50">
                      <CardBody className="p-4">
                        <p className="text-sm text-gray-600 mb-2">To Currency</p>
                        <p className="font-bold text-lg">
                          {selectedVoucher.toCurrency?.name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedVoucher.toCurrency?.code || ''}
                        </p>
                      </CardBody>
                    </Card>
                  </div>
                </div>

                <Divider />

                {/* Exchange Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaMoneyBillWave className="text-amber-500" />
                    Exchange Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">From Amount</p>
                      <p className="font-bold text-xl text-red-600">
                        {formatCurrency(selectedVoucher.fromAmount, selectedVoucher.fromCurrency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">To Amount</p>
                      <p className="font-bold text-xl text-green-600">
                        {formatCurrency(selectedVoucher.toAmount, selectedVoucher.toCurrency)}
                      </p>
                    </div>
                    {selectedVoucher.commission && (
                      <div>
                        <p className="text-sm text-gray-600">Commission</p>
                        <p className="font-semibold text-lg text-amber-600">
                          {formatCurrency(selectedVoucher.commission, selectedVoucher.fromCurrency)}
                        </p>
                        {selectedVoucher.commissionPercentage && (
                          <p className="text-xs text-gray-500">
                            ({selectedVoucher.commissionPercentage}%)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Saraf Information */}
                {(selectedVoucher.sarafName || selectedVoucher.sarafContact || selectedVoucher.purpose) && (
                  <>
                    <Divider />
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FaCoins className="text-amber-500" />
                        Saraf Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedVoucher.sarafName && (
                          <div>
                            <p className="text-sm text-gray-600">Saraf Name</p>
                            <p className="font-semibold">{selectedVoucher.sarafName}</p>
                          </div>
                        )}
                        {selectedVoucher.sarafContact && (
                          <div>
                            <p className="text-sm text-gray-600">Saraf Contact</p>
                            <p className="font-semibold">{selectedVoucher.sarafContact}</p>
                          </div>
                        )}
                        {selectedVoucher.purpose && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">Purpose</p>
                            <p className="font-semibold">{selectedVoucher.purpose}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

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

export default SarafEntryVouchersList;

