import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Spinner,
  Divider
} from '@nextui-org/react';
import { FaArrowLeft, FaPrint, FaCalendarAlt, FaUser, FaBoxes, FaMoneyBill } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from "react-query";
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch invoice details
  const fetchSaleDetails = async () => {
    try {
      const response = await userRequest.get(`/sales/invoice/${id}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch invoice details');
      throw error;
    }
  };

  const { data: invoiceData, isLoading, error } = useQuery(
    ['invoiceDetails', id],
    fetchSaleDetails,
    {
      enabled: !!id,
      onSuccess: (data) => {
        setSale(data.data);
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      }
  });

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const handleGoBack = () => {
    navigate('/sales');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h2>
          <p className="text-gray-600 mb-6">The requested invoice could not be found.</p>
          <Button color="primary" onPress={handleGoBack}>
            Back to Sales
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 print:p-0 print:bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header with Actions */}
        <div className="mb-6 print:hidden">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button
                isIconOnly
                variant="light"
                onPress={handleGoBack}
                startContent={<FaArrowLeft />}
              >
                Back
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Invoice Details</h1>
                <p className="text-gray-600 text-sm">View and manage invoice information</p>
              </div>
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
                variant="flat"
                startContent={<FaPrint />}
                onPress={handlePrint}
              >
                Print Invoice
              </Button>
            </div>
          </div>
        </div>

        {/* Invoice Card */}
        <Card className="shadow-xl border-0">
          <CardBody className="p-6 md:p-8">
            {/* Invoice Header */}
            <div className="border-b-2 border-gray-200 pb-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {sale.invoiceNumber}
                  </h2>
                  {sale.referCode && (
                    <p className="text-lg font-semibold text-blue-600">Refer Code: {sale.referCode}</p>
                  )}
                </div>
                <div className="text-right">
                  <Chip
                    color={getPaymentStatusColor(sale.paymentStatus)}
                    variant="flat"
                    size="lg"
                    className="text-base px-4 py-2"
                  >
                    {sale.paymentStatus?.toUpperCase() || 'UNKNOWN'}
                  </Chip>
                </div>
              </div>
            </div>

            {/* Invoice Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Invoice Dates */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <FaCalendarAlt className="text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Invoice Dates</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600">Invoice Date</p>
                    <p className="font-medium">{formatDate(sale.invoiceDate)}</p>
                  </div>
                  {sale.dueDate && (
                    <div>
                      <p className="text-xs text-gray-600">Due Date</p>
                      <p className="font-medium">{formatDate(sale.dueDate)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <FaUser className="text-green-600" />
                  <h3 className="font-semibold text-gray-900">Bill To</h3>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{sale.customer?.name || 'N/A'}</p>
                  {sale.customer?.email && (
                    <p className="text-sm text-gray-600">{sale.customer.email}</p>
                  )}
                  {sale.customer?.phoneNumber && (
                    <p className="text-sm text-gray-600">{sale.customer.phoneNumber}</p>
                  )}
                  {sale.customer?.address && sale.customer.address !== 'N/A' && (
                    <p className="text-sm text-gray-600">{sale.customer.address}</p>
                  )}
                </div>
              </div>

              {/* Warehouse Information */}
              {sale.warehouse && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FaBoxes className="text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Warehouse</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">{sale.warehouse.name}</p>
                    {sale.warehouse.address && (
                      <p className="text-sm text-gray-600">{sale.warehouse.address}</p>
                    )}
                    {sale.warehouse.phoneNumber && (
                      <p className="text-sm text-gray-600">{sale.warehouse.phoneNumber}</p>
                    )}
                    {sale.warehouse.email && (
                      <p className="text-sm text-gray-600">{sale.warehouse.email}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Barcode</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Quantity</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Unit Price</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items?.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{item.productName || 'N/A'}</p>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <p className="text-sm text-gray-600">{item.barcode || '-'}</p>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <p className="font-medium">{item.quantity}</p>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <p className="font-medium">{formatCurrency(item.price)}</p>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(item.total)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals and Payment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Financial Totals */}
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
                <CardBody className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FaMoneyBill className="text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(sale.totals?.subtotal || 0)}</span>
                    </div>
                    {sale.totals?.discount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span>Discount:</span>
                        <span className="font-semibold">-{formatCurrency(sale.totals.discount)}</span>
                      </div>
                    )}
                    {sale.totals?.tax > 0 && (
                      <div className="flex justify-between items-center text-blue-600">
                        <span>Tax:</span>
                        <span className="font-semibold">{formatCurrency(sale.totals.tax)}</span>
                      </div>
                    )}
                    <Divider className="my-2" />
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xl font-bold text-gray-900">Grand Total:</span>
                      <span className="text-2xl font-bold text-green-600">{formatCurrency(sale.totals?.grandTotal || 0)}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Payment Information */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardBody className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FaMoneyBill className="text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Payment Summary</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Paid:</span>
                      <span className="font-bold text-green-600 text-lg">{formatCurrency(sale.payment?.totalPaid || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Remaining Balance:</span>
                      <span className="font-bold text-red-600 text-lg">{formatCurrency(sale.payment?.remainingBalance || 0)}</span>
                    </div>
                    <Divider className="my-2" />
                    <div className="bg-white p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Payment Status:</span>
                        <Chip
                          color={getPaymentStatusColor(sale.paymentStatus)}
                          variant="flat"
                          size="md"
                        >
                          {sale.paymentStatus?.toUpperCase() || 'UNKNOWN'}
                        </Chip>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SaleDetails;
