import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Spinner,
  Divider
} from '@nextui-org/react';
import { FaArrowLeft, FaPrint, FaEdit, FaCalendarAlt, FaUser, FaBoxes, FaMoneyBill } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from "react-query";
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch sale details
  const fetchSaleDetails = async () => {
    try {
      const response = await userRequest.get(`/sales/${id}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch sale details');
      throw error;
    }
  };

  const { data: saleData, isLoading, error } = useQuery(
    ['saleDetails', id],
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
          <p className="mt-4 text-gray-600">Loading sale details...</p>
        </div>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sale Not Found</h2>
          <p className="text-gray-600 mb-6">The requested sale could not be found.</p>
          <Button color="primary" onPress={handleGoBack}>
            Back to Sales
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
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
                <h1 className="text-3xl font-bold text-gray-900">{sale.invoiceNumber}</h1>
                <p className="text-gray-600">Sale ID: {sale.id}</p>
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
                Print
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sale Status Card */}
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Sale Information</h2>
                  <Chip
                    color={getPaymentStatusColor(sale.paymentStatus)}
                    variant="flat"
                    size="lg"
                  >
                    {sale.paymentStatus?.toUpperCase() || 'UNKNOWN'}
                  </Chip>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium">{formatDate(sale.createdAt)}</p>
                    </div>
                  </div>
                  {sale.updatedAt && sale.updatedAt !== sale.createdAt && (
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600">Updated</p>
                        <p className="font-medium">{formatDate(sale.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                  {sale.dueDate && (
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-600">Due Date</p>
                        <p className="font-medium">{formatDate(sale.dueDate)}</p>
                      </div>
                    </div>
                  )}
                  {sale.user && (
                    <div className="flex items-center gap-3">
                      <FaUser className="text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-600">Created By</p>
                        <p className="font-medium">{sale.user.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaUser className="text-blue-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-lg">{sale.customer?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{sale.customer?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{sale.customer?.phoneNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{sale.customer?.address || 'N/A'}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Items */}
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaBoxes className="text-green-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Items ({sale.items?.length || 0})</h2>
                </div>
                <div className="space-y-4">
                  {sale.items?.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Product</p>
                          <div className="flex items-center gap-2">
                            {item.product && typeof item.product === 'object' && item.product.image && (
                              <img 
                                src={item.product.image} 
                                alt={item.product.name}
                                className="w-8 h-8 rounded object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <p className="font-medium">{getProductName(item.product)}</p>
                              {item.product && typeof item.product === 'object' && item.product._id && (
                                <p className="text-xs text-gray-500">ID: {item.product._id}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Quantity</p>
                          <p className="font-medium text-lg">{item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Unit Price</p>
                          <p className="font-medium">{formatCurrency(item.price)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="font-bold text-xl text-green-600">{formatCurrency(item.total)}</p>
                        </div>
                      </div>
                      {item.discount > 0 && (
                        <div className="mt-3 p-2 bg-green-100 rounded text-green-700">
                          <strong>Discount:</strong> {formatCurrency(item.discount)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <Card>
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaMoneyBill className="text-green-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Financial Summary</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(sale.totalAmount)}</span>
                  </div>
                  {sale.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span className="font-medium">{formatCurrency(sale.discount)}</span>
                    </div>
                  )}
                  {sale.tax > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Tax:</span>
                      <span className="font-medium">{formatCurrency(sale.tax)}</span>
                    </div>
                  )}
                  <Divider />
                  <div className="flex justify-between font-bold text-2xl text-gray-900">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(sale.grandTotal)}</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardBody className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <Chip
                      color={getPaymentStatusColor(sale.paymentStatus)}
                      variant="flat"
                      size="lg"
                    >
                      {sale.paymentStatus?.toUpperCase() || 'UNKNOWN'}
                    </Chip>
                  </div>

                  {/* Payment Summary */}
                  {sale.payments?.summary && (
                    <div className="space-y-3">
                      <Divider />
                      <h3 className="font-semibold text-gray-700">Payment Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Paid:</span>
                          <span className="font-bold text-green-600">{formatCurrency(sale.payments.summary.totalPaid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Remaining:</span>
                          <span className="font-bold text-red-600">{formatCurrency(sale.payments.summary.remainingBalance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Percentage:</span>
                          <span className="font-bold text-blue-600">{sale.payments.summary.paymentPercentage}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Records */}
                  {sale.payments?.records && sale.payments.records.length > 0 && (
                    <div className="space-y-3">
                      <Divider />
                      <h3 className="font-semibold text-gray-700">Payment Records</h3>
                      <div className="space-y-2">
                        {sale.payments.records.map((payment, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded border">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{formatCurrency(payment.amount)}</p>
                                <p className="text-sm text-gray-600">{payment.method}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm">{formatDate(payment.createdAt)}</p>
                                <Chip size="sm" color={payment.status === 'completed' ? 'success' : 'warning'}>
                                  {payment.status}
                                </Chip>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetails;
