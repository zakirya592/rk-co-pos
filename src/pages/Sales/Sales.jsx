import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Spinner,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@nextui-org/react';
import { FaPlus, FaEye, FaEdit, FaCalendarAlt, FaFilter, FaSearch } from 'react-icons/fa';
import { useQuery } from "react-query";
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Sales = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedSale, setSelectedSale] = useState(null);

  // State for pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch sales data
  const fetchSales = async () => {
    const params = new URLSearchParams();
    params.append('page', currentPage);
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (paymentStatus) params.append('paymentStatus', paymentStatus);
    if (searchTerm) params.append('search', searchTerm);

    const response = await userRequest.get(`/sales?${params.toString()}`);
    return response.data;
  };

  const { data: salesData, isLoading, refetch } = useQuery(
    ['sales', currentPage, startDate, endDate, paymentStatus, searchTerm],
    fetchSales,
    {
      keepPreviousData: true,
      staleTime: 30000,
    }
  );

  const sales = salesData?.data || [];
  const totalPages = salesData?.totalPages || 1;
  const totalSales = salesData?.totalSales || 0;
  const currentPageData = salesData?.currentPage || 1;

  // Handle filter changes
  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filters change
    refetch();
  };

  // Clear all filters
  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setPaymentStatus('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // View sale details
  const viewSaleDetails = (sale) => {
    setSelectedSale(sale);
    onOpen();
  };

  // Navigate to POS for new sale
  const goToPOS = () => {
    navigate('/pos');
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'partial':
        return 'warning';
      case 'unpaid':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600">Manage and view all sales transactions</p>
        </div>
        <Button
          color="primary"
          size="lg"
          startContent={<FaPlus />}
          onPress={goToPOS}
        >
          Add New Sale
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              startContent={<FaCalendarAlt className="text-gray-400" />}
            />
            <Input
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              startContent={<FaCalendarAlt className="text-gray-400" />}
            />
            <Select
              label="Payment Status"
              placeholder="All Status"
              selectedKeys={paymentStatus ? [paymentStatus] : []}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <SelectItem key="paid" value="paid">Paid</SelectItem>
              <SelectItem key="partial" value="partial">Partial</SelectItem>
              <SelectItem key="unpaid" value="unpaid">Unpaid</SelectItem>
            </Select>
            <Input
              placeholder="Search by invoice number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<FaSearch className="text-gray-400" />}
            />
            <div className="flex gap-2">
              <Button
                color="primary"
                variant="flat"
                startContent={<FaFilter />}
                onPress={handleFilterChange}
                className="flex-1"
              >
                Apply Filters
              </Button>
              <Button
                color="default"
                variant="light"
                onPress={clearFilters}
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardBody>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              Showing {sales.length} of {totalSales} sales
            </div>
            <div className="text-sm text-gray-600">
              Page {currentPageData} of {totalPages}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <Table aria-label="Sales table">
                <TableHeader>
                  <TableColumn>INVOICE</TableColumn>
                  <TableColumn>CUSTOMER</TableColumn>
                  <TableColumn>ITEMS</TableColumn>
                  <TableColumn>TOTAL AMOUNT</TableColumn>
                  <TableColumn>PAYMENT STATUS</TableColumn>
                  <TableColumn>DATE</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No sales found">
                  {sales.map((sale) => (
                    <TableRow key={sale._id}>
                      <TableCell>
                        <div className="font-medium">{sale.invoiceNumber}</div>
                        <div className="text-sm text-gray-500">ID: {sale.id}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{sale.customer?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{sale.customer?.email || ''}</div>
                          <div className="text-sm text-gray-500">{sale.customer?.phoneNumber || ''}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {sale.items?.length || 0} item(s)
                          <div className="text-sm text-gray-500">
                            {sale.items?.map((item, index) => (
                              <div key={index}>
                                Qty: {item.quantity} × {formatCurrency(item.price)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(sale.grandTotal)}</div>
                        <div className="text-sm text-gray-500">
                          Subtotal: {formatCurrency(sale.totalAmount)}
                        </div>
                        {sale.discount > 0 && (
                          <div className="text-sm text-green-600">
                            Discount: {formatCurrency(sale.discount)}
                          </div>
                        )}
                        {sale.tax > 0 && (
                          <div className="text-sm text-blue-600">
                            Tax: {formatCurrency(sale.tax)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getPaymentStatusColor(sale.paymentStatus)}
                          variant="flat"
                          size="sm"
                        >
                          {sale.paymentStatus?.toUpperCase() || 'UNKNOWN'}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(sale.createdAt)}</div>
                        {sale.dueDate && (
                          <div className="text-xs text-gray-500">
                            Due: {formatDate(sale.dueDate)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="light"
                            startContent={<FaEye />}
                            onPress={() => viewSaleDetails(sale)}
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={setCurrentPage}
                    showControls
                    showShadow
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Sale Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Sale Details - {selectedSale?.invoiceNumber}
          </ModalHeader>
          <ModalBody>
            {selectedSale && (
              <div className="space-y-4">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p><strong>Name:</strong> {selectedSale.customer?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedSale.customer?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedSale.customer?.phoneNumber || 'N/A'}</p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-semibold mb-2">Items</h3>
                  <div className="space-y-2">
                    {selectedSale.items?.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between">
                          <span>Product ID: {item.product || 'N/A'}</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price: {formatCurrency(item.price)}</span>
                          <span>Total: {formatCurrency(item.total)}</span>
                        </div>
                        {item.discount > 0 && (
                          <div className="text-green-600">
                            Discount: {formatCurrency(item.discount)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedSale.totalAmount)}</span>
                    </div>
                    {selectedSale.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>{formatCurrency(selectedSale.discount)}</span>
                      </div>
                    )}
                    {selectedSale.tax > 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span>Tax:</span>
                        <span>{formatCurrency(selectedSale.tax)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Grand Total:</span>
                      <span>{formatCurrency(selectedSale.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div>
                  <h3 className="font-semibold mb-2">Payment Information</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      <Chip
                        color={getPaymentStatusColor(selectedSale.paymentStatus)}
                        variant="flat"
                      >
                        {selectedSale.paymentStatus?.toUpperCase() || 'UNKNOWN'}
                      </Chip>
                    </div>
                    {selectedSale.dueDate && (
                      <div className="flex justify-between mt-2">
                        <span>Due Date:</span>
                        <span>{formatDate(selectedSale.dueDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Sales;
