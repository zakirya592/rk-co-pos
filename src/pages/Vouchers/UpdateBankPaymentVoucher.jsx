import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Spinner,
  Divider,
} from '@nextui-org/react';
import {
  FaArrowLeft,
  FaFileUpload,
  FaTimes,
  FaSave,
  FaEdit,
  FaInfoCircle,
  FaCalendarAlt,
  FaUniversity,
  FaUser,
  FaMoneyBillWave,
  FaFileInvoice,
  FaEye,
} from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from 'react-query';

const UpdateBankPaymentVoucher = ({ voucherId, onBack }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const actualId = voucherId || id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [voucherInfo, setVoucherInfo] = useState(null);

  const [formData, setFormData] = useState({
    voucherDate: new Date().toISOString().split('T')[0],
    voucherType: 'payment',
    bankAccount: '',
    payeeType: 'supplier',
    payee: '',
    payeeName: '',
    amount: '',
    currency: '',
    currencyExchangeRate: '1',
    paymentMethod: 'bank_transfer',
    checkNumber: '',
    referenceNumber: '',
    relatedPurchase: '',
    relatedSale: '',
    relatedPayment: '',
    relatedSupplierPayment: '',
    description: '',
    notes: '',
  });

  // Fetch voucher data
  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        setIsLoading(true);
        const response = await userRequest.get(`/bank-payment-vouchers/${actualId}`);
        const voucher = response.data.data;

        // Store full voucher info for display
        setVoucherInfo(voucher);

        setFormData({
          voucherDate: voucher.voucherDate
            ? new Date(voucher.voucherDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          voucherType: voucher.voucherType || 'payment',
          bankAccount: voucher.bankAccount?._id || '',
          payeeType: voucher.payeeType || 'supplier',
          payee: voucher.payee?._id || '',
          payeeName: voucher.payeeName || voucher.payee?.name || '',
          amount: voucher.amount || '',
          currency: voucher.currency?._id || '',
          currencyExchangeRate: voucher.currencyExchangeRate?.toString() || '1',
          paymentMethod: voucher.paymentMethod || 'bank_transfer',
          checkNumber: voucher.checkNumber || '',
          referenceNumber: voucher.referenceNumber || '',
          relatedPurchase: voucher.relatedPurchase?._id || '',
          relatedSale: voucher.relatedSale?._id || '',
          relatedPayment: voucher.relatedPayment || '',
          relatedSupplierPayment: voucher.relatedSupplierPayment || '',
          description: voucher.description || '',
          notes: voucher.notes || '',
        });

        if (voucher.attachments && voucher.attachments.length > 0) {
          setExistingAttachments(voucher.attachments);
        }
      } catch (error) {
        console.error('Error fetching voucher:', error);
        toast.error('Failed to load voucher data');
      } finally {
        setIsLoading(false);
      }
    };

    if (actualId) {
      fetchVoucher();
    }
  }, [actualId]);

  // Fetch data (same as create form)
  const fetchBankAccounts = async () => {
    const res = await userRequest.get('/bank-accounts');
    return res?.data?.data?.bankAccounts || res?.data?.data || [];
  };

  const fetchCurrencies = async () => {
    const res = await userRequest.get('/currencies');
    return res.data.data || [];
  };

  const fetchSuppliers = async () => {
    const res = await userRequest.get('/suppliers');
    return res.data || [];
  };

  const fetchCustomers = async () => {
    const res = await userRequest.get('/customers');
    return res.data || [];
  };

  const fetchUsers = async () => {
    const res = await userRequest.get('/users');
    return res.data?.data || res.data || [];
  };

  const fetchPurchases = async () => {
    const res = await userRequest.get('/purchases?limit=100');
    return res.data?.data || [];
  };

  const fetchSales = async () => {
    const res = await userRequest.get('/sales?limit=100');
    return res.data?.data || [];
  };

  const { data: bankAccounts = [], isLoading: isLoadingBanks } = useQuery(
    ['bank-accounts'],
    fetchBankAccounts
  );

  const { data: currencies = [], isLoading: isLoadingCurrencies } = useQuery(
    ['currencies'],
    fetchCurrencies
  );

  const { data: suppliers = [] } = useQuery(['suppliers'], fetchSuppliers);
  const { data: customers = [] } = useQuery(['customers'], fetchCustomers);
  const { data: users = [] } = useQuery(['users'], fetchUsers);
  const { data: purchases = [] } = useQuery(['purchases'], fetchPurchases);
  const { data: sales = [] } = useQuery(['sales'], fetchSales);

  // Get payee options based on payeeType
  const getPayeeOptions = () => {
    switch (formData.payeeType) {
      case 'supplier':
        return suppliers;
      case 'customer':
        return customers;
      case 'user':
        return users;
      default:
        return [];
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update payeeName when payee changes
    if (name === 'payee') {
      const payees = getPayeeOptions();
      const selectedPayee = payees.find((p) => p._id === value);
      if (selectedPayee) {
        setFormData((prev) => ({
          ...prev,
          payeeName: selectedPayee.name || selectedPayee.email || '',
        }));
      }
    }

    // Reset payee when payeeType changes
    if (name === 'payeeType') {
      setFormData((prev) => ({
        ...prev,
        payee: '',
        payeeName: '',
      }));
    }
  };

  // Handle attachment file change
  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachmentPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachmentPreview(null);
      }
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.bankAccount) {
      toast.error('Please select a bank account');
      return;
    }
    if (!formData.payee) {
      toast.error('Please select a payee');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!formData.currency) {
      toast.error('Please select a currency');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Append all form fields
      formDataToSend.append('voucherDate', formData.voucherDate);
      formDataToSend.append('voucherType', formData.voucherType);
      formDataToSend.append('bankAccount', formData.bankAccount);
      formDataToSend.append('payeeType', formData.payeeType);
      formDataToSend.append('payee', formData.payee);
      formDataToSend.append('payeeName', formData.payeeName);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append('currencyExchangeRate', formData.currencyExchangeRate || '1');
      formDataToSend.append('paymentMethod', formData.paymentMethod);

      if (formData.checkNumber) {
        formDataToSend.append('checkNumber', formData.checkNumber);
      }
      if (formData.referenceNumber) {
        formDataToSend.append('referenceNumber', formData.referenceNumber);
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
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      if (formData.notes) {
        formDataToSend.append('notes', formData.notes);
      }

      // Append attachment if exists
      if (attachment) {
        formDataToSend.append('attachment', attachment);
      }

      await userRequest.put(`/bank-payment-vouchers/${actualId}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Bank Payment Voucher updated successfully');
      
      // Invalidate queries to refresh the list
      queryClient.invalidateQueries(['bank-payment-vouchers']);
      
      // Go back to vouchers list
      if (onBack) {
        onBack();
      } else {
        navigate('/vouchers');
      }
    } catch (error) {
      console.error('Error updating voucher:', error);
      toast.error(
        error.response?.data?.message || 'Failed to update bank payment voucher'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount, currency) => {
    if (!amount) return 'N/A';
    const symbol = currency?.symbol || 'Rs';
    return `${symbol} ${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                isIconOnly
                variant="light"
                className="text-white hover:bg-white/20"
                onPress={() => (onBack ? onBack() : navigate('/vouchers'))}
                startContent={<FaArrowLeft />}
              >
                Back
              </Button>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <FaEdit className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Update Bank Payment Voucher
                  </h1>
                  <p className="text-blue-100 text-sm md:text-base mt-1">
                    {voucherInfo?.voucherNumber || voucherInfo?.referCode || 'Edit voucher details'}
                  </p>
                </div>
              </div>
            </div>
            {voucherInfo && (
              <div className="hidden md:flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-white text-xs font-medium">Current Status</p>
                  <p className="text-blue-100 text-sm font-semibold capitalize">
                    {voucherInfo.status || 'Draft'}
                  </p>
                </div>
              </div>
            )}
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
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FaEdit className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Edit Voucher Details
                    </h2>
                    <p className="text-sm text-gray-600">
                      Update the information below and save changes
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-500" />
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

                  <Input
                    label="Voucher Type"
                    name="voucherType"
                    value={formData.voucherType}
                    disabled
                    labelPlacement="outside"
                    description="Payment voucher type"
                  />
                </div>
              </div>

              <Divider />

              {/* Bank Account & Payee */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                  <FaUniversity className="text-green-500" />
                  Payment Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    isRequired
                    label="Bank Account"
                    name="bankAccount"
                    selectedKeys={formData.bankAccount ? [formData.bankAccount] : []}
                    onSelectionChange={(keys) => {
                      const [selected] = Array.from(keys);
                      handleChange({ target: { name: 'bankAccount', value: selected || '' } });
                    }}
                    labelPlacement="outside"
                    placeholder="Select bank account"
                    isLoading={isLoadingBanks}
                  >
                    {bankAccounts.map((account) => (
                      <SelectItem key={account._id} value={account._id}>
                        {account.accountName} - {account.accountNumber}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    isRequired
                    label="Payee Type"
                    name="payeeType"
                    selectedKeys={formData.payeeType ? [formData.payeeType] : []}
                    onSelectionChange={(keys) => {
                      const [selected] = Array.from(keys);
                      handleChange({ target: { name: 'payeeType', value: selected || '' } });
                    }}
                    labelPlacement="outside"
                  >
                    <SelectItem key="supplier" value="supplier">
                      Supplier
                    </SelectItem>
                    <SelectItem key="customer" value="customer">
                      Customer
                    </SelectItem>
                    <SelectItem key="user" value="user">
                      User
                    </SelectItem>
                  </Select>

                  <Select
                    isRequired
                    label={`Select ${formData.payeeType?.charAt(0).toUpperCase() + formData.payeeType?.slice(1)}`}
                    name="payee"
                    selectedKeys={formData.payee ? [formData.payee] : []}
                    onSelectionChange={(keys) => {
                      const [selected] = Array.from(keys);
                      handleChange({ target: { name: 'payee', value: selected || '' } });
                    }}
                    labelPlacement="outside"
                    placeholder={`Select ${formData.payeeType || 'payee'}`}
                    isDisabled={!formData.payeeType}
                  >
                    {getPayeeOptions().map((payee) => (
                      <SelectItem key={payee._id} value={payee._id}>
                        {payee.name || payee.email || payee._id}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    label="Payee Name"
                    name="payeeName"
                    value={formData.payeeName}
                    disabled
                    labelPlacement="outside"
                    description="Auto-filled from selected payee"
                  />
                </div>
              </div>

              <Divider />

              {/* Amount & Currency */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                  <FaMoneyBillWave className="text-purple-500" />
                  Amount & Currency
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    isRequired
                    type="number"
                    label="Amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    labelPlacement="outside"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />

                  <Select
                    isRequired
                    label="Currency"
                    name="currency"
                    selectedKeys={formData.currency ? [formData.currency] : []}
                    onSelectionChange={(keys) => {
                      const [selected] = Array.from(keys);
                      handleChange({ target: { name: 'currency', value: selected || '' } });
                    }}
                    labelPlacement="outside"
                    placeholder="Select currency"
                    isLoading={isLoadingCurrencies}
                  >
                    {currencies.map((currency) => (
                      <SelectItem key={currency._id} value={currency._id}>
                        {currency.code} - {currency.name} ({currency.symbol})
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    type="number"
                    label="Currency Exchange Rate"
                    name="currencyExchangeRate"
                    value={formData.currencyExchangeRate}
                    onChange={handleChange}
                    labelPlacement="outside"
                    placeholder="1.00"
                    min="0"
                    step="0.0001"
                  />
                </div>
              </div>

              <Divider />

              {/* Payment Method & References */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                  <FaFileInvoice className="text-orange-500" />
                  Payment Method & References
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Payment Method"
                    name="paymentMethod"
                    selectedKeys={formData.paymentMethod ? [formData.paymentMethod] : []}
                    onSelectionChange={(keys) => {
                      const [selected] = Array.from(keys);
                      handleChange({ target: { name: 'paymentMethod', value: selected || '' } });
                    }}
                    labelPlacement="outside"
                  >
                    <SelectItem key="bank_transfer" value="bank_transfer">
                      Bank Transfer
                    </SelectItem>
                    <SelectItem key="check" value="check">
                      Check
                    </SelectItem>
                    <SelectItem key="online_payment" value="online_payment">
                      Online Payment
                    </SelectItem>
                    <SelectItem key="wire_transfer" value="wire_transfer">
                      Wire Transfer
                    </SelectItem>
                    <SelectItem key="dd" value="dd">
                      Demand Draft (DD)
                    </SelectItem>
                    <SelectItem key="other" value="other">
                      Other
                    </SelectItem>
                  </Select>

                  <Input
                    label="Check Number"
                    name="checkNumber"
                    value={formData.checkNumber}
                    onChange={handleChange}
                    labelPlacement="outside"
                    placeholder="Enter check number"
                  />

                  <Input
                    label="Reference Number"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleChange}
                    labelPlacement="outside"
                    placeholder="Enter reference number"
                  />
                </div>
              </div>

              <Divider />

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
                      const [selected] = Array.from(keys);
                      handleChange({ target: { name: 'relatedPurchase', value: selected || '' } });
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
                      const [selected] = Array.from(keys);
                      handleChange({ target: { name: 'relatedSale', value: selected || '' } });
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

              <Divider />

              {/* Description & Notes */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Additional Information
                </h2>
                <div className="space-y-4">
                  <Textarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    labelPlacement="outside"
                    placeholder="Enter description"
                    minRows={2}
                  />

                  <Textarea
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    labelPlacement="outside"
                    placeholder="Enter additional notes"
                    minRows={3}
                  />
                </div>
              </div>

              <Divider />

              {/* Existing Attachments */}
              {existingAttachments.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Existing Attachments
                  </h2>
                  <div className="space-y-2">
                    {existingAttachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
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
                          <div>
                            <p className="font-medium text-gray-900">
                              {attachment.name}
                            </p>
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Divider />

              {/* New Attachment */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Add New Attachment (Optional)
                </h2>
                <div className="space-y-4">
                  {!attachment ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        id="attachment"
                        onChange={handleAttachmentChange}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx"
                      />
                      <label
                        htmlFor="attachment"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <FaFileUpload className="text-4xl text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Click to upload new attachment
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          Supports: Images, PDF, DOC, DOCX
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {attachmentPreview ? (
                            <img
                              src={attachmentPreview}
                              alt="Preview"
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-blue-100 rounded flex items-center justify-center">
                              <FaFileUpload className="text-2xl text-blue-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {attachment.name}
                            </p>
                            <p className="text-xs text-gray-500">
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
                    </div>
                  )}
                </div>
              </div>

              <Divider />

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <Button
                  variant="flat"
                  size="lg"
                  onPress={() => (onBack ? onBack() : navigate('/vouchers'))}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  size="lg"
                  isLoading={isSubmitting}
                  startContent={!isSubmitting && <FaSave />}
                  className="bg-gradient-to-r from-blue-500 to-blue-600"
                >
                  {isSubmitting ? 'Updating...' : 'Update Voucher'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
          </div>

          {/* Right Sidebar - Voucher Information */}
          <div className="xl:col-span-1 space-y-6">
            {/* Current Voucher Info */}
            {voucherInfo && (
              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardBody className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FaInfoCircle className="text-blue-600 text-xl" />
                    <h3 className="text-lg font-bold text-gray-900">
                      Voucher Information
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Voucher Number</p>
                      <p className="font-bold text-lg text-blue-600">
                        {voucherInfo.voucherNumber || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Refer Code</p>
                      <p className="font-semibold text-gray-900">
                        {voucherInfo.referCode || 'N/A'}
                      </p>
                    </div>
                    {voucherInfo.transactionId && (
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Transaction ID</p>
                        <p className="font-medium text-sm text-gray-700 break-all">
                          {voucherInfo.transactionId}
                        </p>
                      </div>
                    )}
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Current Amount</p>
                      <p className="font-bold text-xl text-green-600">
                        {formatCurrency(voucherInfo.amount, voucherInfo.currency)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {voucherInfo.currency?.code || ''}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            voucherInfo.status === 'approved'
                              ? 'bg-green-500'
                              : voucherInfo.status === 'pending'
                              ? 'bg-yellow-500'
                              : voucherInfo.status === 'rejected'
                              ? 'bg-red-500'
                              : 'bg-gray-500'
                          }`}
                        ></div>
                        <p className="font-semibold capitalize text-gray-900">
                          {voucherInfo.status || 'Draft'}
                        </p>
                      </div>
                    </div>
                    {voucherInfo.user && (
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Created By</p>
                        <p className="font-medium text-gray-900">
                          {voucherInfo.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {voucherInfo.user.email}
                        </p>
                      </div>
                    )}
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Created Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(voucherInfo.createdAt)}
                      </p>
                      {voucherInfo.updatedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Updated: {formatDate(voucherInfo.updatedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="shadow-lg border-0">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaFileInvoice className="text-purple-500" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="flat"
                    className="w-full justify-start"
                    onPress={() => {
                      if (voucherInfo) {
                        window.open(
                          `/vouchers/view/${voucherInfo._id}`,
                          '_blank'
                        );
                      }
                    }}
                  >
                    <FaEye className="mr-2" />
                    View Details
                  </Button>
                  <Button
                    variant="flat"
                    color="primary"
                    className="w-full justify-start"
                    onPress={() => {
                      // Duplicate voucher functionality
                      toast.info('Duplicate functionality coming soon');
                    }}
                  >
                    <FaFileUpload className="mr-2" />
                    Duplicate Voucher
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Payment Summary */}
            {voucherInfo && (
              <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-600" />
                    Payment Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-sm text-gray-600">Amount</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(voucherInfo.amount, voucherInfo.currency)}
                      </span>
                    </div>
                    {voucherInfo.paymentMethod && (
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-600">Method</span>
                        <span className="font-medium text-gray-900">
                          {(() => {
                            const methodMap = {
                              'bank_transfer': 'Bank Transfer',
                              'check': 'Check',
                              'online_payment': 'Online Payment',
                              'wire_transfer': 'Wire Transfer',
                              'dd': 'Demand Draft (DD)',
                              'other': 'Other',
                            };
                            return methodMap[voucherInfo.paymentMethod] || voucherInfo.paymentMethod.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          })()}
                        </span>
                      </div>
                    )}
                    {voucherInfo.checkNumber && (
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-600">Check #</span>
                        <span className="font-medium text-gray-900">
                          {voucherInfo.checkNumber}
                        </span>
                      </div>
                    )}
                    {voucherInfo.referenceNumber && (
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-600">Reference</span>
                        <span className="font-medium text-gray-900">
                          {voucherInfo.referenceNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Bank Account Info */}
            {voucherInfo?.bankAccount && (
              <Card className="shadow-lg border-0">
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaUniversity className="text-blue-500" />
                    Bank Account
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-semibold text-gray-900">
                        {voucherInfo.bankAccount.accountName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {voucherInfo.bankAccount.accountNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {voucherInfo.bankAccount.bankName}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Payee Info */}
            {voucherInfo?.payee && (
              <Card className="shadow-lg border-0">
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaUser className="text-green-500" />
                    Payee Information
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="font-semibold text-gray-900">
                        {voucherInfo.payee.name || voucherInfo.payeeName}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        Type: {voucherInfo.payeeType}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateBankPaymentVoucher;

