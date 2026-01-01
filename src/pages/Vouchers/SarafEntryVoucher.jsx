import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Spinner,
} from '@nextui-org/react';
import {
  FaArrowLeft,
  FaFileUpload,
  FaTimes,
  FaSave,
  FaInfoCircle,
  FaCalendarAlt,
  FaCoins,
  FaMoneyBillWave,
  FaUniversity,
  FaWallet,
  FaExchangeAlt,
} from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from 'react-query';

const SarafEntryVoucher = ({ onBack }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  const [formData, setFormData] = useState({
    voucherDate: new Date().toISOString().split('T')[0],
    voucherType: 'payment',
    exchangeType: 'buy',
    fromCurrency: '',
    fromAmount: '',
    toCurrency: '',
    toAmount: '',
    exchangeRate: '1',
    marketRate: '',
    commission: '',
    commissionPercentage: '',
    fromBankAccount: '',
    toBankAccount: '',
    fromCashAccount: '',
    toCashAccount: '',
    referenceNumber: '',
    sarafName: '',
    sarafContact: '',
    purpose: '',
    description: '',
    notes: '',
    relatedPurchase: '',
    relatedSale: '',
    relatedPayment: '',
    relatedSupplierPayment: '',
    relatedBankPaymentVoucher: '',
    relatedCashPaymentVoucher: '',
  });

  const fetchBankAccounts = async () => {
    try {
      const res = await userRequest.get('/bank-accounts');
      const data = res.data?.data || res.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      return [];
    }
  };

  const fetchCashAccounts = async () => {
    try {
      const res = await userRequest.get('/cash-accounts');
      const data = res.data?.data || res.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching cash accounts:', error);
      return [];
    }
  };

  const fetchCurrencies = async () => {
    const res = await userRequest.get('/currencies');
    return res.data.data || [];
  };

  const fetchPurchases = async () => {
    try {
      const res = await userRequest.get('/purchases?limit=100');
      return res.data?.data || [];
    } catch (error) {
      console.error('Error fetching purchases:', error);
      return [];
    }
  };

  const fetchSales = async () => {
    try {
      const res = await userRequest.get('/sales?limit=100');
      return res.data?.data || [];
    } catch (error) {
      console.error('Error fetching sales:', error);
      return [];
    }
  };

  const fetchBankPaymentVouchers = async () => {
    try {
      const res = await userRequest.get('/bank-payment-vouchers?limit=100');
      const data = res.data?.data?.vouchers || res.data?.data || res.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching bank payment vouchers:', error);
      return [];
    }
  };

  const fetchCashPaymentVouchers = async () => {
    try {
      const res = await userRequest.get('/cash-payment-vouchers?limit=100');
      const data = res.data?.data?.vouchers || res.data?.data || res.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching cash payment vouchers:', error);
      return [];
    }
  };

  const { data: bankAccounts = [], isLoading: isLoadingBanks } = useQuery(
    ['bank-accounts'],
    fetchBankAccounts
  );
  const { data: cashAccounts = [], isLoading: isLoadingCash } = useQuery(
    ['cash-accounts'],
    fetchCashAccounts
  );
  const { data: currencies = [], isLoading: isLoadingCurrencies } = useQuery(
    ['currencies'],
    fetchCurrencies
  );
  const { data: purchases = [] } = useQuery(['purchases'], fetchPurchases);
  const { data: sales = [] } = useQuery(['sales'], fetchSales);
  const { data: bankPaymentVouchersData = [] } = useQuery(
    ['bank-payment-vouchers'],
    fetchBankPaymentVouchers
  );
  const { data: cashPaymentVouchersData = [] } = useQuery(
    ['cash-payment-vouchers'],
    fetchCashPaymentVouchers
  );

  // Ensure arrays
  const bankPaymentVouchers = Array.isArray(bankPaymentVouchersData) ? bankPaymentVouchersData : [];
  const cashPaymentVouchers = Array.isArray(cashPaymentVouchersData) ? cashPaymentVouchersData : [];

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-calculate toAmount when exchangeRate or fromAmount changes
    if (name === 'exchangeRate' || name === 'fromAmount') {
      const rate = parseFloat(formData.exchangeRate || value || 1);
      const amount = name === 'fromAmount' ? parseFloat(value || 0) : parseFloat(formData.fromAmount || 0);
      const calculatedToAmount = amount * rate;
      setFormData((prev) => ({
        ...prev,
        toAmount: calculatedToAmount > 0 ? calculatedToAmount.toFixed(2) : '',
      }));
    }

    // Auto-calculate commission when commissionPercentage or fromAmount changes
    if (name === 'commissionPercentage' || name === 'fromAmount') {
      const percentage = name === 'commissionPercentage' ? parseFloat(value || 0) : parseFloat(formData.commissionPercentage || 0);
      const amount = name === 'fromAmount' ? parseFloat(value || 0) : parseFloat(formData.fromAmount || 0);
      const calculatedCommission = (amount * percentage) / 100;
      setFormData((prev) => ({
        ...prev,
        commission: calculatedCommission > 0 ? calculatedCommission.toFixed(2) : '',
      }));
    }
  };

  // Handle attachment
  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fromCurrency) {
      toast.error('Please select source currency');
      return;
    }

    if (!formData.toCurrency) {
      toast.error('Please select destination currency');
      return;
    }

    if (formData.fromCurrency === formData.toCurrency) {
      toast.error('Source and destination currencies must be different');
      return;
    }

    if (!formData.fromAmount || parseFloat(formData.fromAmount) <= 0) {
      toast.error('Please enter a valid source amount');
      return;
    }

    if (!formData.toAmount || parseFloat(formData.toAmount) <= 0) {
      toast.error('Please enter a valid destination amount');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('voucherDate', formData.voucherDate);
      formDataToSend.append('voucherType', formData.voucherType);
      formDataToSend.append('exchangeType', formData.exchangeType);
      formDataToSend.append('fromCurrency', formData.fromCurrency);
      formDataToSend.append('fromAmount', formData.fromAmount);
      formDataToSend.append('toCurrency', formData.toCurrency);
      formDataToSend.append('toAmount', formData.toAmount);
      formDataToSend.append('exchangeRate', formData.exchangeRate || '1');
      
      if (formData.marketRate) {
        formDataToSend.append('marketRate', formData.marketRate);
      }
      if (formData.commission) {
        formDataToSend.append('commission', formData.commission || '0');
      }
      if (formData.commissionPercentage) {
        formDataToSend.append('commissionPercentage', formData.commissionPercentage || '0');
      }
      if (formData.fromBankAccount) {
        formDataToSend.append('fromBankAccount', formData.fromBankAccount);
      }
      if (formData.toBankAccount) {
        formDataToSend.append('toBankAccount', formData.toBankAccount);
      }
      if (formData.fromCashAccount) {
        formDataToSend.append('fromCashAccount', formData.fromCashAccount);
      }
      if (formData.toCashAccount) {
        formDataToSend.append('toCashAccount', formData.toCashAccount);
      }
      if (formData.referenceNumber) {
        formDataToSend.append('referenceNumber', formData.referenceNumber);
      }
      if (formData.sarafName) {
        formDataToSend.append('sarafName', formData.sarafName);
      }
      if (formData.sarafContact) {
        formDataToSend.append('sarafContact', formData.sarafContact);
      }
      if (formData.purpose) {
        formDataToSend.append('purpose', formData.purpose);
      }
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      if (formData.notes) {
        formDataToSend.append('notes', formData.notes);
      }
      if (formData.relatedPurchase) {
        formDataToSend.append('relatedPurchase', formData.relatedPurchase);
      }
      if (formData.relatedSale) {
        formDataToSend.append('relatedSale', formData.relatedSale);
      }
      if (formData.relatedPayment) {
        formDataToSend.append('relatedPayment', formData.relatedPayment);
      }
      if (formData.relatedSupplierPayment) {
        formDataToSend.append('relatedSupplierPayment', formData.relatedSupplierPayment);
      }
      if (formData.relatedBankPaymentVoucher) {
        formDataToSend.append('relatedBankPaymentVoucher', formData.relatedBankPaymentVoucher);
      }
      if (formData.relatedCashPaymentVoucher) {
        formDataToSend.append('relatedCashPaymentVoucher', formData.relatedCashPaymentVoucher);
      }

      if (attachment) {
        formDataToSend.append('attachment', attachment);
      }

      await userRequest.post('/saraf-entry-vouchers', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Saraf Entry Voucher created successfully');
      queryClient.invalidateQueries(['saraf-entry-vouchers']);
      onBack();
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast.error(
        error.response?.data?.message || 'Failed to create saraf entry voucher'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set default currencies
  useEffect(() => {
    if (currencies.length > 0) {
      if (!formData.fromCurrency) {
        const pkrCurrency = currencies.find((c) => c.code === 'PKR');
        if (pkrCurrency) {
          setFormData((prev) => ({
            ...prev,
            fromCurrency: pkrCurrency._id,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            fromCurrency: currencies[0]._id,
          }));
        }
      }
      if (!formData.toCurrency && currencies.length > 1) {
        const usdCurrency = currencies.find((c) => c.code === 'USD');
        if (usdCurrency) {
          setFormData((prev) => ({
            ...prev,
            toCurrency: usdCurrency._id,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            toCurrency: currencies[1]._id,
          }));
        }
      }
    }
  }, [currencies]);

  // Get currency symbol
  const getCurrencySymbol = (currencyId) => {
    const currency = currencies.find((c) => c._id === currencyId);
    return currency?.symbol || 'Rs';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                isIconOnly
                variant="light"
                className="text-white hover:bg-white/20"
                onPress={onBack}
              >
                <FaArrowLeft className="text-xl" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <FaCoins className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Create Saraf Entry Voucher
                  </h1>
                  <p className="text-amber-100 text-sm md:text-base mt-1">
                    Currency exchange entry management
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-white text-xs font-medium">Exchange Type</p>
                <p className="text-amber-100 text-sm font-semibold capitalize">
                  {formData.exchangeType || 'Buy'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Form - Takes 3 columns */}
          <div className="xl:col-span-3">
            <Card className="shadow-xl border-0">
              <CardBody className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Form Header */}
                  <div className="mb-6 pb-4 border-b-2 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 p-2 rounded-lg">
                        <FaCoins className="text-amber-600 text-xl" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          New Saraf Entry
                        </h2>
                        <p className="text-sm text-gray-600">
                          Fill in all required information to create the voucher
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaCalendarAlt className="text-amber-500" />
                      Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        isRequired
                        type="date"
                        label="Voucher Date"
                        name="voucherDate"
                        value={formData.voucherDate}
                        onChange={handleChange}
                        labelPlacement="outside"
                      />
                      <Select
                        isRequired
                        label="Voucher Type"
                        name="voucherType"
                        selectedKeys={formData.voucherType ? [formData.voucherType] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || '';
                          setFormData((prev) => ({
                            ...prev,
                            voucherType: selected,
                          }));
                        }}
                        labelPlacement="outside"
                        description="Select voucher type"
                      >
                        <SelectItem key="payment" value="payment">Payment</SelectItem>
                        <SelectItem key="receipt" value="receipt">Receipt</SelectItem>
                        <SelectItem key="transfer" value="transfer">Transfer</SelectItem>
                      </Select>
                      <Select
                        isRequired
                        label="Exchange Type"
                        name="exchangeType"
                        selectedKeys={formData.exchangeType ? [formData.exchangeType] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || '';
                          setFormData((prev) => ({
                            ...prev,
                            exchangeType: selected,
                          }));
                        }}
                        labelPlacement="outside"
                      >
                        <SelectItem key="buy" value="buy">Buy</SelectItem>
                        <SelectItem key="sell" value="sell">Sell</SelectItem>
                      </Select>
                    </div>
                  </div>

                  {/* Currency Exchange */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaExchangeAlt className="text-amber-500" />
                      Currency Exchange
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        isRequired
                        label="From Currency"
                        name="fromCurrency"
                        selectedKeys={formData.fromCurrency ? [formData.fromCurrency] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || '';
                          setFormData((prev) => ({
                            ...prev,
                            fromCurrency: selected,
                            toCurrency: prev.toCurrency === selected ? '' : prev.toCurrency,
                          }));
                        }}
                        labelPlacement="outside"
                        placeholder="Select source currency"
                        isLoading={isLoadingCurrencies}
                      >
                        {currencies
                          .filter((c) => c._id !== formData.toCurrency)
                          .map((currency) => (
                            <SelectItem
                              key={currency._id}
                              value={currency._id}
                              textValue={currency.name}
                            >
                              {currency.name} ({currency.code})
                            </SelectItem>
                          ))}
                      </Select>
                      <Select
                        isRequired
                        label="To Currency"
                        name="toCurrency"
                        selectedKeys={formData.toCurrency ? [formData.toCurrency] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || '';
                          setFormData((prev) => ({
                            ...prev,
                            toCurrency: selected,
                            fromCurrency: prev.fromCurrency === selected ? '' : prev.fromCurrency,
                          }));
                        }}
                        labelPlacement="outside"
                        placeholder="Select destination currency"
                        isLoading={isLoadingCurrencies}
                      >
                        {currencies
                          .filter((c) => c._id !== formData.fromCurrency)
                          .map((currency) => (
                            <SelectItem
                              key={currency._id}
                              value={currency._id}
                              textValue={currency.name}
                            >
                              {currency.name} ({currency.code})
                            </SelectItem>
                          ))}
                      </Select>
                      <Input
                        isRequired
                        type="number"
                        label={`From Amount (${getCurrencySymbol(formData.fromCurrency)})`}
                        name="fromAmount"
                        value={formData.fromAmount}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      <Input
                        isRequired
                        type="number"
                        label={`To Amount (${getCurrencySymbol(formData.toCurrency)})`}
                        name="toAmount"
                        value={formData.toAmount}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        readOnly
                        description="Auto-calculated based on exchange rate"
                      />
                      <Input
                        isRequired
                        type="number"
                        label="Exchange Rate"
                        name="exchangeRate"
                        value={formData.exchangeRate}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="1.00"
                        min="0"
                        step="0.0001"
                        description="Rate used for conversion"
                      />
                      <Input
                        type="number"
                        label="Market Rate"
                        name="marketRate"
                        value={formData.marketRate}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="0.00"
                        min="0"
                        step="0.0001"
                        description="Current market exchange rate"
                      />
                    </div>
                  </div>

                  {/* Commission */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaMoneyBillWave className="text-amber-500" />
                      Commission
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="number"
                        label="Commission Percentage (%)"
                        name="commissionPercentage"
                        value={formData.commissionPercentage}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="0.00"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label={`Commission Amount (${getCurrencySymbol(formData.fromCurrency)})`}
                        name="commission"
                        value={formData.commission}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        readOnly
                        description="Auto-calculated based on percentage"
                      />
                    </div>
                  </div>

                  {/* Accounts */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaUniversity className="text-amber-500" />
                      Bank & Cash Accounts
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="From Bank Account"
                        name="fromBankAccount"
                        selectedKeys={formData.fromBankAccount ? [formData.fromBankAccount] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || '';
                          setFormData((prev) => ({
                            ...prev,
                            fromBankAccount: selected,
                          }));
                        }}
                        labelPlacement="outside"
                        placeholder="Select source bank account (optional)"
                        isLoading={isLoadingBanks}
                      >
                        {bankAccounts.map((account) => (
                          <SelectItem
                            key={account._id}
                            value={account._id}
                            textValue={account.accountName || account.name}
                          >
                            {account.accountName || account.name} - {account.accountNumber}
                          </SelectItem>
                        ))}
                      </Select>
                      <Select
                        label="To Bank Account"
                        name="toBankAccount"
                        selectedKeys={formData.toBankAccount ? [formData.toBankAccount] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || '';
                          setFormData((prev) => ({
                            ...prev,
                            toBankAccount: selected,
                          }));
                        }}
                        labelPlacement="outside"
                        placeholder="Select destination bank account (optional)"
                        isLoading={isLoadingBanks}
                      >
                        {bankAccounts.map((account) => (
                          <SelectItem
                            key={account._id}
                            value={account._id}
                            textValue={account.accountName || account.name}
                          >
                            {account.accountName || account.name} - {account.accountNumber}
                          </SelectItem>
                        ))}
                      </Select>
                      <Select
                        label="From Cash Account"
                        name="fromCashAccount"
                        selectedKeys={formData.fromCashAccount ? [formData.fromCashAccount] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || '';
                          setFormData((prev) => ({
                            ...prev,
                            fromCashAccount: selected,
                          }));
                        }}
                        labelPlacement="outside"
                        placeholder="Select source cash account (optional)"
                        isLoading={isLoadingCash}
                      >
                        {cashAccounts.map((account) => (
                          <SelectItem
                            key={account._id}
                            value={account._id}
                            textValue={account.accountName || account.name}
                          >
                            {account.accountName || account.name}
                          </SelectItem>
                        ))}
                      </Select>
                      <Select
                        label="To Cash Account"
                        name="toCashAccount"
                        selectedKeys={formData.toCashAccount ? [formData.toCashAccount] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || '';
                          setFormData((prev) => ({
                            ...prev,
                            toCashAccount: selected,
                          }));
                        }}
                        labelPlacement="outside"
                        placeholder="Select destination cash account (optional)"
                        isLoading={isLoadingCash}
                      >
                        {cashAccounts.map((account) => (
                          <SelectItem
                            key={account._id}
                            value={account._id}
                            textValue={account.accountName || account.name}
                          >
                            {account.accountName || account.name}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {/* Saraf Information */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaCoins className="text-amber-500" />
                      Saraf Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Saraf Name"
                        name="sarafName"
                        value={formData.sarafName}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="Enter saraf name"
                      />
                      <Input
                        label="Saraf Contact"
                        name="sarafContact"
                        value={formData.sarafContact}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="Enter contact number"
                      />
                      <Input
                        label="Reference Number"
                        name="referenceNumber"
                        value={formData.referenceNumber}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="Enter reference number"
                      />
                      <Input
                        label="Purpose"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="Enter purpose"
                      />
                    </div>
                  </div>

                  {/* Related Transactions */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Related Transactions (Optional)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Related Purchase"
                        name="relatedPurchase"
                        selectedKeys={formData.relatedPurchase ? [formData.relatedPurchase] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || '';
                          setFormData((prev) => ({
                            ...prev,
                            relatedPurchase: selected,
                          }));
                        }}
                        labelPlacement="outside"
                        placeholder="Select purchase (optional)"
                      >
                        {purchases.map((purchase) => (
                          <SelectItem key={purchase._id} value={purchase._id}>
                            {purchase.invoiceNumber || purchase._id}
                          </SelectItem>
                        ))}
                      </Select>
                      <Select
                        label="Related Sale"
                        name="relatedSale"
                        selectedKeys={formData.relatedSale ? [formData.relatedSale] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || '';
                          setFormData((prev) => ({
                            ...prev,
                            relatedSale: selected,
                          }));
                        }}
                        labelPlacement="outside"
                        placeholder="Select sale (optional)"
                      >
                        {sales.map((sale) => (
                          <SelectItem key={sale._id} value={sale._id}>
                            {sale.invoiceNumber || sale._id}
                          </SelectItem>
                        ))}
                      </Select>
                      <Select
                        label="Related Bank Payment Voucher"
                        name="relatedBankPaymentVoucher"
                        selectedKeys={formData.relatedBankPaymentVoucher ? [formData.relatedBankPaymentVoucher] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || '';
                          setFormData((prev) => ({
                            ...prev,
                            relatedBankPaymentVoucher: selected,
                          }));
                        }}
                        labelPlacement="outside"
                        placeholder="Select bank payment voucher (optional)"
                      >
                        {bankPaymentVouchers.map((voucher) => (
                          <SelectItem key={voucher._id} value={voucher._id}>
                            {voucher.voucherNumber || voucher.referCode || voucher._id}
                          </SelectItem>
                        ))}
                      </Select>
                      <Select
                        label="Related Cash Payment Voucher"
                        name="relatedCashPaymentVoucher"
                        selectedKeys={formData.relatedCashPaymentVoucher ? [formData.relatedCashPaymentVoucher] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || '';
                          setFormData((prev) => ({
                            ...prev,
                            relatedCashPaymentVoucher: selected,
                          }));
                        }}
                        labelPlacement="outside"
                        placeholder="Select cash payment voucher (optional)"
                      >
                        {cashPaymentVouchers.map((voucher) => (
                          <SelectItem key={voucher._id} value={voucher._id}>
                            {voucher.voucherNumber || voucher.referCode || voucher._id}
                          </SelectItem>
                        ))}
                      </Select>
                      <Input
                        label="Related Payment ID"
                        name="relatedPayment"
                        value={formData.relatedPayment}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="Enter payment ID (optional)"
                      />
                      <Input
                        label="Related Supplier Payment ID"
                        name="relatedSupplierPayment"
                        value={formData.relatedSupplierPayment}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="Enter supplier payment ID (optional)"
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Additional Information
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      <Textarea
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="Enter description (optional)"
                        minRows={2}
                      />
                      <Textarea
                        label="Notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="Enter notes (optional)"
                        minRows={3}
                      />
                    </div>
                  </div>

                  {/* Attachment */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Attachment
                    </h2>
                    {!attachmentPreview ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <FaFileUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                        <input
                          type="file"
                          id="attachment"
                          onChange={handleAttachmentChange}
                          className="hidden"
                          accept="image/*,.pdf,.doc,.docx"
                        />
                        <label
                          htmlFor="attachment"
                          className="cursor-pointer inline-block px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                        >
                          Upload Attachment
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                          Supported formats: Images, PDF, DOC, DOCX
                        </p>
                      </div>
                    ) : (
                      <div className="border-2 border-gray-300 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-amber-100 p-2 rounded">
                              <FaFileUpload className="text-amber-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{attachment.name}</p>
                              <p className="text-sm text-gray-500">
                                {(attachment.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            isIconOnly
                            variant="light"
                            color="danger"
                            onPress={removeAttachment}
                          >
                            <FaTimes />
                          </Button>
                        </div>
                        {attachment.type.startsWith('image/') && (
                          <img
                            src={attachmentPreview}
                            alt="Preview"
                            className="mt-4 rounded-lg max-h-48 w-auto"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-200">
                    <Button variant="flat" onPress={onBack} size="lg">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      color="primary"
                      size="lg"
                      isLoading={isSubmitting}
                      startContent={!isSubmitting && <FaSave />}
                      className="bg-gradient-to-r from-amber-500 to-orange-600"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Voucher'}
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="xl:col-span-1">
            <Card className="shadow-xl border-0 sticky top-6">
              <CardBody className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">From Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getCurrencySymbol(formData.fromCurrency)}{' '}
                      {parseFloat(formData.fromAmount || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">To Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getCurrencySymbol(formData.toCurrency)}{' '}
                      {parseFloat(formData.toAmount || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  {formData.commission && (
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Commission</p>
                      <p className="text-xl font-bold text-amber-700">
                        {getCurrencySymbol(formData.fromCurrency)}{' '}
                        {parseFloat(formData.commission || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      {formData.commissionPercentage && (
                        <p className="text-xs text-gray-500 mt-1">
                          ({formData.commissionPercentage}%)
                        </p>
                      )}
                    </div>
                  )}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Exchange Rate</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formData.exchangeRate || '1.00'}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SarafEntryVoucher;

