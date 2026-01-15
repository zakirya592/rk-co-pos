import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Button,
  Spinner,
} from '@nextui-org/react';
import { FaArrowLeft, FaPrint } from 'react-icons/fa';
import { useQuery } from "react-query";
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const PurchaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAutoPrinted, setHasAutoPrinted] = useState(false);

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

  // Auto-print when invoice is loaded and accessed from purchase completion
  useEffect(() => {
    if (purchase && !hasAutoPrinted && !loading && !isLoading) {
      const shouldAutoPrint = new URLSearchParams(location.search).get('print') === 'true' 
        || sessionStorage.getItem('autoPrintPurchase') === id;
      
      if (shouldAutoPrint) {
        setTimeout(() => {
          window.print();
          setHasAutoPrinted(true);
          sessionStorage.removeItem('autoPrintPurchase');
        }, 500);
      }
    }
  }, [purchase, hasAutoPrinted, loading, isLoading, id, location.search]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '.');
  };

  // Format currency
  const formatCurrency = (amount, symbol = 'Rs') => {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
    return formatted.replace(/,/g, '.');
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
  const totalAmount = purchase.totals?.totalAmount || 0;
  const totalPaid = purchase.payment?.totalPaid || 0;
  const remainingBalance = purchase.payment?.remainingBalance || 0;

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-container, .invoice-container * {
            visibility: visible;
          }
          .invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-white p-4 md:p-6 print:p-0">
        {/* Header with Actions */}
        <div className="mb-6 no-print print:hidden">
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

        {/* Invoice Container */}
        <div className="invoice-container max-w-4xl mx-auto bg-white p-8 print:p-8">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-start gap-4">
              {/* Logo Placeholder */}
              <div className="w-16 h-16 bg-teal-700 flex-shrink-0"></div>
              <div>
                <h1 className="text-5xl font-bold text-teal-700 mb-2">INVOICE</h1>
                <p className="text-lg text-teal-700 font-medium">RK & Co</p>
                {purchase.warehouse && (
                  <p className="text-sm text-teal-600 mt-1">
                    Warehouse: {purchase.warehouse.name || purchase.warehouse}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Issued To and Invoice Details */}
          <div className="flex justify-between mb-8">
            <div className="flex-1">
              <p className="text-xs uppercase text-teal-700 font-semibold mb-2">ISSUED TO</p>
              <p className="text-xl font-bold text-teal-700 mb-1">{purchase.supplier?.name || 'N/A'}</p>
              {purchase.supplier?.email && (
                <p className="text-sm text-teal-700">{purchase.supplier.email}</p>
              )}
              {purchase.supplier?.phoneNumber && (
                <p className="text-sm text-teal-700">{purchase.supplier.phoneNumber}</p>
              )}
              {purchase.supplier?.address && purchase.supplier.address !== 'N/A' && (
                <p className="text-sm text-teal-700">{purchase.supplier.address}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs uppercase text-teal-700 font-semibold mb-2">INVOICE</p>
              <p className="text-xl font-bold text-teal-700 mb-4">{purchase.invoiceNumber || 'N/A'}</p>
              <p className="text-xs uppercase text-teal-700 font-semibold mb-2">DATE ISSUED</p>
              <p className="text-lg font-medium text-teal-700">{formatDate(purchase.purchaseDate)}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-teal-700 mb-6"></div>

          {/* Items Table */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-bold uppercase text-teal-700">DESCRIPTION</p>
              <p className="text-sm font-bold uppercase text-teal-700">FEES</p>
            </div>
            <div className="border-t border-teal-700">
              {purchase.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-4 border-b border-teal-700">
                  <div className="flex-1">
                    <p className="text-base text-teal-700 font-medium">{item.productName || 'N/A'}</p>
                    {item.barcode && (
                      <p className="text-xs text-teal-600 mt-1">Barcode: {item.barcode}</p>
                    )}
                    <p className="text-xs text-teal-600 mt-1">
                      Qty: {item.quantity} × {currencySymbol} {formatCurrency(item.purchaseRate, currencySymbol)}
                    </p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-xs text-teal-600">Retail: {currencySymbol} {formatCurrency(item.retailRate, currencySymbol)}</span>
                      <span className="text-xs text-teal-600">Wholesale: {currencySymbol} {formatCurrency(item.wholesaleRate, currencySymbol)}</span>
                    </div>
                  </div>
                  <p className="text-base font-bold text-teal-700 ml-4">{currencySymbol} {formatCurrency(item.total, currencySymbol)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Section */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-teal-700">SUBTOTAL</span>
                <span className="text-base font-medium text-teal-700">{currencySymbol} {formatCurrency(totalAmount, currencySymbol)}</span>
              </div>
              <div className="border-t-2 border-teal-700 my-3"></div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold uppercase text-teal-700">TOTAL</span>
                <span className="text-xl font-bold text-teal-700">{currencySymbol} {formatCurrency(totalAmount, currencySymbol)}</span>
              </div>
              <div className="border-t-2 border-teal-700 mt-3"></div>
            </div>
          </div>

          {/* Payment and Contact Details */}
          <div className="flex justify-between items-start mt-12">
            <div>
              <p className="text-sm font-bold uppercase text-teal-700 mb-2">PAYMENT DETAILS :</p>
              {purchase.payment?.payments && purchase.payment.payments.length > 0 && (
                <div className="space-y-1">
                  {purchase.payment.payments.map((payment, index) => (
                    <div key={index}>
                      <span className="text-sm text-teal-700 capitalize">{payment.method?.replace(/_/g, ' ')} : </span>
                      <span className="text-sm text-teal-700">{currencySymbol} {formatCurrency(payment.amount, currencySymbol)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <p className="text-sm text-teal-700">Total Paid: <span className="font-semibold">{currencySymbol} {formatCurrency(totalPaid, currencySymbol)}</span></p>
                {remainingBalance > 0 && (
                  <p className="text-sm text-teal-700">Remaining: <span className="font-semibold">{currencySymbol} {formatCurrency(remainingBalance, currencySymbol)}</span></p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-teal-700 font-semibold">RK & Co</p>
              {purchase.warehouse && (
                <p className="text-sm text-teal-700">
                  Warehouse: {purchase.warehouse.name || purchase.warehouse}
                </p>
              )}
              <p className="text-sm text-teal-700">www.rkco.com</p>
              <p className="text-sm text-teal-700">contact@rkco.com</p>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="w-full h-16 bg-teal-700 mt-12 print:mt-12"></div>
        </div>
      </div>
    </>
  );
};

export default PurchaseDetails;
