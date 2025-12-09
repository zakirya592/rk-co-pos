import React, { useMemo, useState } from 'react';
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
  Tooltip
} from '@nextui-org/react';
import { FaPlus, FaEye, FaEdit, FaCalendarAlt, FaFilter, FaSearch } from 'react-icons/fa';
import { useQuery } from "react-query";
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Sales = () => {
  const navigate = useNavigate();

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

  const filteredSales = useMemo(() => {
    const normalizedStart = startDate ? new Date(startDate) : null;
    const normalizedEnd = endDate ? new Date(endDate) : null;

    if (normalizedEnd) {
      normalizedEnd.setHours(23, 59, 59, 999); // make end date inclusive
    }

    const term = searchTerm.trim().toLowerCase();

    return sales.filter((sale) => {
      const created = sale.createdAt ? new Date(sale.createdAt) : null;

      const matchesStart = normalizedStart ? (created ? created >= normalizedStart : false) : true;
      const matchesEnd = normalizedEnd ? (created ? created <= normalizedEnd : false) : true;
      const matchesStatus = paymentStatus ? sale.paymentStatus === paymentStatus : true;
      const matchesSearch = term
        ? (sale.invoiceNumber?.toLowerCase().includes(term) ||
          sale.customer?.name?.toLowerCase().includes(term))
        : true;

      return matchesStart && matchesEnd && matchesStatus && matchesSearch;
    });
  }, [sales, startDate, endDate, paymentStatus, searchTerm]);

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

  // Navigate to sale details page
  const viewSaleDetails = (sale) => {
    navigate(`/sales/${sale._id}`);
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
    return `Rs ${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)}`;
  };

  // Get product name safely
  const getProductName = (product) => {
    if (typeof product === 'string') {
      return product;
    }
    if (product && typeof product === 'object') {
      return product.name || product._id || 'Unknown Product';
    }
    return 'N/A';
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
        <div className="flex gap-2">
          <Button
            variant="flat"
            onPress={() => navigate('/Navigation')}
          >
            Dashboard
          </Button>
          <Button
            color="primary"
            size="lg"
            startContent={<FaPlus />}
            onPress={goToPOS}
          >
            Add New Sale
          </Button>
        </div>
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
              Showing {filteredSales.length} of {totalSales} sales
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
                  {filteredSales.map((sale) => (
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
                                {getProductName(item.product)} - Qty: {item.quantity} × {formatCurrency(item.price)}
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
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="light"
                            startContent={<FaEye />}
                            onPress={() => viewSaleDetails(sale)}
                          >
                            View
                          </Button>
                          <Tooltip content="Edit this sale" placement="top">
                            <Button
                              size="sm"
                              variant="solid"
                              color="primary"
                              startContent={<FaEdit />}
                              onPress={() => navigate(`/sales/edit/${sale._id}`)}
                            >
                              Edit
                            </Button>
                          </Tooltip>
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

    </div>
  );
};

export default Sales;
