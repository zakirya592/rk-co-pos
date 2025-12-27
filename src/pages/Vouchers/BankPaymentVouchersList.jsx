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
} from '@nextui-org/react';
import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaSearch,
  FaFileUpload,
} from 'react-icons/fa';
import { useQuery, useQueryClient } from 'react-query';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const BankPaymentVouchersList = ({ onAddNew, onView, onEdit }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filter vouchers by search term
  const filteredVouchers = vouchers.filter((voucher) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      voucher.voucherNumber?.toLowerCase().includes(searchLower) ||
      voucher.referCode?.toLowerCase().includes(searchLower) ||
      voucher.payeeName?.toLowerCase().includes(searchLower) ||
      voucher.bankAccount?.accountName?.toLowerCase().includes(searchLower) ||
      voucher.referenceNumber?.toLowerCase().includes(searchLower) ||
      voucher.transactionId?.toLowerCase().includes(searchLower)
    );
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

  return (
    <>
      <Card className="shadow-lg border-0">
        <CardBody className="p-6">
          {/* Header with Search and Add Button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by voucher number, refer code, payee, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
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

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Vouchers</p>
              <p className="text-2xl font-bold text-blue-600">
                {data?.totalVouchers || 0}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {vouchers.filter((v) => v.status === 'approved').length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {vouchers.filter((v) => v.status === 'pending').length}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-600">
                {vouchers.filter((v) => v.status === 'draft').length}
              </p>
            </div>
          </div>

          {/* Table */}
          <Table aria-label="Bank Payment Vouchers table">
            <TableHeader>
              <TableColumn>VOUCHER NUMBER</TableColumn>
              <TableColumn>REFER CODE</TableColumn>
              <TableColumn>BANK ACCOUNT</TableColumn>
              <TableColumn>PAYEE</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
              <TableColumn>PAYMENT METHOD</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No vouchers found">
              {filteredVouchers.map((voucher) => (
                <TableRow key={voucher._id}>
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
                    <div className="text-sm capitalize">
                      {voucher.paymentMethod?.replace('_', ' ') || 'N/A'}
                    </div>
                    {voucher.checkNumber && (
                      <div className="text-xs text-gray-500">
                        Check: {voucher.checkNumber}
                      </div>
                    )}
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
                    <div className="text-sm">{formatDate(voucher.voucherDate)}</div>
                    <div className="text-xs text-gray-500">
                      {formatDate(voucher.createdAt)}
                    </div>
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
        </CardBody>
      </Card>

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

