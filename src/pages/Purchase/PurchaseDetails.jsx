import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Divider,
  Spinner,
} from '@nextui-org/react';
import { FaArrowLeft, FaPrint, FaCalendarAlt, FaUser, FaMoneyBill, FaWarehouse } from 'react-icons/fa';
import { useQuery } from "react-query";
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const PurchaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch invoice details
  const fetchPurchaseDetails = async () => {
    try {
      const response = await userRequest.get(`/purchases/invoice/${id}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch invoice details');
      throw error;
    }
  };

  const { data: invoiceData, isLoading, error } = useQuery(
    ['purchaseInvoiceDetails', id],
    fetchPurchaseDetails,
    {
      enabled: !!id,
      onSuccess: (data) => {
        setPurchase(data.data);
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      }
  });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount, symbol = 'Rs') => {
    return `${symbol} ${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const handleGoBack = () => {
    navigate('/purchases');
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

  if (error || !purchase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h2>
          <p className="text-gray-600 mb-6">The requested invoice could not be found.</p>
          <Button color="primary" onPress={handleGoBack}>
            Back to Purchases
          </Button>
        </div>
      </div>
    );
  }

  const currencySymbol = purchase.currency?.symbol || 'Rs';

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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Purchase Invoice</h1>
                <p className="text-gray-600 text-sm">View and manage purchase invoice information</p>
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
                    {purchase.invoiceNumber}
                  </h2>
                  {purchase.referCode && (
                    <p className="text-lg font-semibold text-blue-600">Refer Code: {purchase.referCode}</p>
                  )}
                </div>
                <div className="text-right">
                  <Chip
                    color={getStatusColor(purchase.status)}
                    variant="flat"
                    size="lg"
                    className="text-base px-4 py-2"
                  >
                    {purchase.status?.toUpperCase() || 'N/A'}
                  </Chip>
                </div>
              </div>
            </div>

            {/* Invoice Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Purchase Date */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <FaCalendarAlt className="text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Purchase Date</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600">Date</p>
                    <p className="font-medium">{formatDate(purchase.purchaseDate)}</p>
                  </div>
                  {purchase.currency && (
                    <div>
                      <p className="text-xs text-gray-600">Currency</p>
                      <p className="font-medium">{purchase.currency.name} ({purchase.currency.code})</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Supplier Information */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <FaUser className="text-green-600" />
                  <h3 className="font-semibold text-gray-900">Supplier</h3>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{purchase.supplier?.name || 'N/A'}</p>
                  {purchase.supplier?.email && (
                    <p className="text-sm text-gray-600">{purchase.supplier.email}</p>
                  )}
                  {purchase.supplier?.phoneNumber && (
                    <p className="text-sm text-gray-600">{purchase.supplier.phoneNumber}</p>
                  )}
                  {purchase.supplier?.address && purchase.supplier.address !== 'N/A' && (
                    <p className="text-sm text-gray-600">{purchase.supplier.address}</p>
                  )}
                </div>
              </div>

              {/* Warehouse Information */}
              {purchase.warehouse && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <FaWarehouse className="text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Warehouse</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">{purchase.warehouse.name}</p>
                    {purchase.warehouse.address && (
                      <p className="text-sm text-gray-600">{purchase.warehouse.address}</p>
                    )}
                    {purchase.warehouse.phoneNumber && (
                      <p className="text-sm text-gray-600">{purchase.warehouse.phoneNumber}</p>
                    )}
                    {purchase.warehouse.email && (
                      <p className="text-sm text-gray-600">{purchase.warehouse.email}</p>
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
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Purchase Rate</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Retail Rate</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Wholesale Rate</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchase.items?.map((item, index) => (
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
                          <p className="font-medium">{formatCurrency(item.purchaseRate, currencySymbol)}</p>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <p className="font-medium">{formatCurrency(item.retailRate, currencySymbol)}</p>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <p className="font-medium">{formatCurrency(item.wholesaleRate, currencySymbol)}</p>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(item.total, currencySymbol)}</p>
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
                      <span className="text-gray-600">Total Quantity:</span>
                      <span className="font-semibold text-gray-900">{purchase.totals?.totalQuantity || 0} items</span>
                    </div>
                    <Divider className="my-2" />
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xl font-bold text-gray-900">Total Amount:</span>
                      <span className="text-2xl font-bold text-green-600">{formatCurrency(purchase.totals?.totalAmount || 0, currencySymbol)}</span>
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
                      <span className="font-bold text-green-600 text-lg">{formatCurrency(purchase.payment?.totalPaid || 0, currencySymbol)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Remaining Balance:</span>
                      <span className="font-bold text-red-600 text-lg">{formatCurrency(purchase.payment?.remainingBalance || 0, currencySymbol)}</span>
                    </div>
                    {purchase.payment?.payments && purchase.payment.payments.length > 0 && (
                      <>
                        <Divider className="my-2" />
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700">Payment Methods:</p>
                          {purchase.payment.payments.map((payment, index) => (
                            <div key={index} className="bg-white p-2 rounded text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">{payment.method?.toUpperCase() || 'N/A'}</span>
                                <span className="font-medium">{formatCurrency(payment.amount, currencySymbol)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
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

export default PurchaseDetails;
