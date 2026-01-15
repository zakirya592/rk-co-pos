import React, { useState, useEffect } from 'react';
import {
  Button,
  Spinner,
} from '@nextui-org/react';
import { FaArrowLeft, FaPrint } from 'react-icons/fa';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from "react-query";
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAutoPrinted, setHasAutoPrinted] = useState(false);

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

  // Auto-print when invoice is loaded and accessed from POS/purchase completion
  useEffect(() => {
    if (sale && !hasAutoPrinted && !loading && !isLoading) {
      const shouldAutoPrint = new URLSearchParams(location.search).get('print') === 'true' 
        || sessionStorage.getItem('autoPrintSale') === id;
      
      if (shouldAutoPrint) {
        setTimeout(() => {
          window.print();
          setHasAutoPrinted(true);
          sessionStorage.removeItem('autoPrintSale');
        }, 500);
      }
    }
  }, [sale, hasAutoPrinted, loading, isLoading, id, location.search]);

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
  const formatCurrency = (amount) => {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
    return formatted.replace(/,/g, '.');
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

  const currencySymbol = sale.currency?.symbol || 'Rs';
  const subtotal = sale.totals?.subtotal || 0;
  const tax = sale.totals?.tax || 0;
  const discount = sale.totals?.discount || 0;
  const grandTotal = sale.totals?.grandTotal || subtotal + tax - discount;

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
                {(sale.warehouse || sale.shop) && (
                  <p className="text-sm text-teal-600 mt-1">
                    {sale.warehouse ? `Warehouse: ${sale.warehouse.name || sale.warehouse}` : ''}
                    {sale.shop ? `Shop: ${sale.shop.name || sale.shop}` : ''}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Issued To and Invoice Details */}
          <div className="flex justify-between mb-8">
            <div className="flex-1">
              <p className="text-xs uppercase text-teal-700 font-semibold mb-2">ISSUED TO</p>
              <p className="text-xl font-bold text-teal-700 mb-1">{sale.customer?.name || 'N/A'}</p>
              {sale.customer?.email && (
                <p className="text-sm text-teal-700">{sale.customer.email}</p>
              )}
              {sale.customer?.phoneNumber && (
                <p className="text-sm text-teal-700">{sale.customer.phoneNumber}</p>
              )}
              {sale.customer?.address && sale.customer.address !== 'N/A' && (
                <p className="text-sm text-teal-700">{sale.customer.address}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs uppercase text-teal-700 font-semibold mb-2">INVOICE</p>
              <p className="text-xl font-bold text-teal-700 mb-4">{sale.invoiceNumber || 'N/A'}</p>
              <p className="text-xs uppercase text-teal-700 font-semibold mb-2">DATE ISSUED</p>
              <p className="text-lg font-medium text-teal-700">{formatDate(sale.invoiceDate)}</p>
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
              {sale.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-4 border-b border-teal-700">
                  <div className="flex-1">
                    <p className="text-base text-teal-700 font-medium">{item.productName || 'N/A'}</p>
                    {item.barcode && (
                      <p className="text-xs text-teal-600 mt-1">Barcode: {item.barcode}</p>
                    )}
                    <p className="text-xs text-teal-600 mt-1">Qty: {item.quantity} × {currencySymbol} {formatCurrency(item.price)}</p>
                  </div>
                  <p className="text-base font-bold text-teal-700 ml-4">{currencySymbol} {formatCurrency(item.total)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Section */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-teal-700">SUBTOTAL</span>
                <span className="text-base font-medium text-teal-700">{currencySymbol} {formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-teal-700">DISCOUNT</span>
                  <span className="text-base font-medium text-teal-700">-{currencySymbol} {formatCurrency(discount)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-teal-700">TAX</span>
                  <span className="text-base font-medium text-teal-700">{currencySymbol} {formatCurrency(tax)}</span>
                </div>
              )}
              <div className="border-t-2 border-teal-700 my-3"></div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold uppercase text-teal-700">TOTAL</span>
                <span className="text-xl font-bold text-teal-700">{currencySymbol} {formatCurrency(grandTotal)}</span>
              </div>
              <div className="border-t-2 border-teal-700 mt-3"></div>
            </div>
          </div>

          {/* Payment and Contact Details */}
          <div className="flex justify-between items-start mt-12">
            <div>
              <p className="text-sm font-bold uppercase text-teal-700 mb-2">PAYMENT DETAILS :</p>
              {sale.payment?.payments && sale.payment.payments.length > 0 && (
                <div className="space-y-1">
                  {sale.payment.payments.map((payment, index) => (
                    <div key={index}>
                      <span className="text-sm text-teal-700 capitalize">{payment.method?.replace(/_/g, ' ')} : </span>
                      <span className="text-sm text-teal-700">{currencySymbol} {formatCurrency(payment.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <p className="text-sm text-teal-700">Total Paid: <span className="font-semibold">{currencySymbol} {formatCurrency(sale.payment?.totalPaid || 0)}</span></p>
                {sale.payment?.remainingBalance > 0 && (
                  <p className="text-sm text-teal-700">Remaining: <span className="font-semibold">{currencySymbol} {formatCurrency(sale.payment.remainingBalance)}</span></p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-teal-700 font-semibold">RK & Co</p>
              {(sale.warehouse || sale.shop) && (
                <p className="text-sm text-teal-700">
                  {sale.warehouse ? `Warehouse: ${sale.warehouse.name || sale.warehouse}` : ''}
                  {sale.shop ? `Shop: ${sale.shop.name || sale.shop}` : ''}
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

export default SaleDetails;
