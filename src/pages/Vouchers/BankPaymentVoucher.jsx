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
  Divider,
} from '@nextui-org/react';
import {
  FaArrowLeft,
  FaFileUpload,
  FaTimes,
  FaSave,
  FaPlus,
  FaInfoCircle,
  FaCalendarAlt,
  FaUniversity,
  FaUser,
  FaMoneyBillWave,
  FaFileInvoice,
} from 'react-icons/fa';
import userRequest from '../../utils/userRequest'; 
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from 'react-query';

const BankPaymentVoucher = ({ onBack }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

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

  // Fetch data
  const fetchBankAccounts = async () => {
    const res = await userRequest.get('/bank-accounts');
    return res?.data?.data?.bankAccounts || res?.data?.data || [];
  };

  const fetchCurrencies = async () => {
    const res = await userRequest.get('/currencies');
    return res.data.data || [];
  };

  const fetchSuppliers = async () => {
    try {
      const res = await userRequest.get('/suppliers');
      const data = res.data?.data || res.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await userRequest.get('/customers');
      const data = res.data?.data || res.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await userRequest.get('/users');
      const data = res.data?.data || res.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const fetchPurchases = async () => {
    const res = await userRequest.get('/purchases?limit=100');
    return res.data?.data || [];
  };

  const fetchSales = async () => {
    const res = await userRequest.get('/sales?limit=100');
    return res.data?.data || [];
  };

  // Financial master data fetchers (from MasterData section)
  const fetchAssets = async () => {
    const { data } = await userRequest.get('/assets');
    if (data?.data?.assets && Array.isArray(data.data.assets)) {
      return data.data.assets;
    }
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  };

  const fetchIncomes = async () => {
    const { data } = await userRequest.get('/incomes');
    if (data?.data?.incomes && Array.isArray(data.data.incomes)) {
      return data.data.incomes;
    }
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  };

  const fetchLiabilities = async () => {
    const { data } = await userRequest.get('/liabilities');
    if (data?.data?.liabilities && Array.isArray(data.data.liabilities)) {
      return data.data.liabilities;
    }
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  };

  const fetchPartnershipAccounts = async () => {
    const { data } = await userRequest.get('/partnership-accounts');
    if (data?.data?.partnershipAccounts && Array.isArray(data.data.partnershipAccounts)) {
      return data.data.partnershipAccounts;
    }
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  };

  const fetchCashBooks = async () => {
    const { data } = await userRequest.get('/cash-books');
    if (data?.data?.cashBooks && Array.isArray(data.data.cashBooks)) {
      return data.data.cashBooks;
    }
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  };

  const fetchCapitals = async () => {
    const { data } = await userRequest.get('/capitals');
    if (data?.data?.capitals && Array.isArray(data.data.capitals)) {
      return data.data.capitals;
    }
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  };

  const fetchOwners = async () => {
    const { data } = await userRequest.get('/owners');
    if (data?.data?.owners && Array.isArray(data.data.owners)) {
      return data.data.owners;
    }
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  };

  const fetchEmployees = async () => {
    const { data } = await userRequest.get('/employees');
    if (data?.data?.employees && Array.isArray(data.data.employees)) {
      return data.data.employees;
    }
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  };

  const fetchPropertyAccounts = async () => {
    const { data } = await userRequest.get('/property-accounts');
    if (data?.data?.propertyAccounts && Array.isArray(data.data.propertyAccounts)) {
      return data.data.propertyAccounts;
    }
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
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

  // Financial master data queries
  const { data: assets = [] } = useQuery(['assets'], fetchAssets);
  const { data: incomes = [] } = useQuery(['incomes'], fetchIncomes);
  const { data: liabilities = [] } = useQuery(['liabilities'], fetchLiabilities);
  const { data: partnershipAccounts = [] } = useQuery(['partnership-accounts'], fetchPartnershipAccounts);
  const { data: cashBooks = [] } = useQuery(['cash-books'], fetchCashBooks);
  const { data: capitals = [] } = useQuery(['capitals'], fetchCapitals);
  const { data: owners = [] } = useQuery(['owners'], fetchOwners);
  const { data: employees = [] } = useQuery(['employees'], fetchEmployees);
  const { data: propertyAccounts = [] } = useQuery(['property-accounts'], fetchPropertyAccounts);

  // Get payee options based on payeeType (includes financial models)
  const getPayeeOptions = () => {
    switch (formData.payeeType) {
      case 'supplier':
        return Array.isArray(suppliers) ? suppliers : [];
      case 'customer':
        return Array.isArray(customers) ? customers : [];
      case 'user':
        return Array.isArray(users) ? users : [];
      case 'Asset':
        return Array.isArray(assets) ? assets : [];
      case 'Income':
        return Array.isArray(incomes) ? incomes : [];
      case 'Liability':
        return Array.isArray(liabilities) ? liabilities : [];
      case 'PartnershipAccount':
        return Array.isArray(partnershipAccounts) ? partnershipAccounts : [];
      case 'CashBook':
        return Array.isArray(cashBooks) ? cashBooks : [];
      case 'Capital':
        return Array.isArray(capitals) ? capitals : [];
      case 'Owner':
        return Array.isArray(owners) ? owners : [];
      case 'Employee':
        return Array.isArray(employees) ? employees : [];
      case 'PropertyAccount':
        return Array.isArray(propertyAccounts) ? propertyAccounts : [];
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

      await userRequest.post('/bank-payment-vouchers', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Bank Payment Voucher created successfully');
      
      // Invalidate queries to refresh the list
      queryClient.invalidateQueries(['bank-payment-vouchers']);
      
      // Reset form
      setFormData({
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
      setAttachment(null);
      setAttachmentPreview(null);
      
      // Go back to vouchers list
      if (onBack) {
        onBack();
      } else {
        navigate('/vouchers');
      }
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast.error(
        error.response?.data?.message || 'Failed to create bank payment voucher'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set default currency
  useEffect(() => {
    if (currencies.length > 0 && !formData.currency) {
      const pkrCurrency = currencies.find((c) => c.code === 'PKR');
      if (pkrCurrency) {
        setFormData((prev) => ({
          ...prev,
          currency: pkrCurrency._id,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          currency: currencies[0]._id,
        }));
      }
    }
  }, [currencies]);

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
                  <FaPlus className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Create Bank Payment Voucher
                  </h1>
                  <p className="text-blue-100 text-sm md:text-base mt-1">
                    Add a new bank payment transaction • Complete all required fields
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-white text-xs font-medium">New Voucher</p>
                <p className="text-blue-100 text-sm font-semibold">Draft Status</p>
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
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FaPlus className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      New Voucher Details
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
                      const selected = Array.from(keys)[0] || '';
                      setFormData((prev) => ({
                        ...prev,
                        bankAccount: selected,
                      }));
                    }}
                    labelPlacement="outside"
                    placeholder="Select bank account"
                    isLoading={isLoadingBanks}
                  >
                    {bankAccounts.map((account) => (
                      <SelectItem 
                        key={account._id} 
                        value={account._id}
                        textValue={`${account.accountName} - ${account.accountNumber}`}
                      >
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
                      const selected = Array.from(keys)[0] || '';
                      setFormData((prev) => ({
                        ...prev,
                        payeeType: selected,
                        payee: '', // Reset payee when type changes
                        payeeName: '',
                      }));
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
                    <SelectItem key="Asset" value="Asset">
                      Asset
                    </SelectItem>
                    <SelectItem key="Income" value="Income">
                      Income
                    </SelectItem>
                    <SelectItem key="Liability" value="Liability">
                      Liability
                    </SelectItem>
                    <SelectItem key="PartnershipAccount" value="PartnershipAccount">
                      Partnership Account
                    </SelectItem>
                    <SelectItem key="CashBook" value="CashBook">
                      Cashbook
                    </SelectItem>
                    <SelectItem key="Capital" value="Capital">
                      Capital
                    </SelectItem>
                    <SelectItem key="Owner" value="Owner">
                      Owner
                    </SelectItem>
                    <SelectItem key="Employee" value="Employee">
                      Employee
                    </SelectItem>
                    <SelectItem key="PropertyAccount" value="PropertyAccount">
                      Property Account
                    </SelectItem>
                  </Select>

                  <Select
                    isRequired
                    label={`Select ${formData.payeeType?.charAt(0).toUpperCase() + formData.payeeType?.slice(1)}`}
                    name="payee"
                    selectedKeys={formData.payee ? [formData.payee] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] || '';
                      const payees = getPayeeOptions();
                      const selectedPayee = payees.find((p) => p._id === selected);
                      setFormData((prev) => ({
                        ...prev,
                        payee: selected,
                        payeeName: selectedPayee?.name || selectedPayee?.email || '',
                      }));
                    }}
                    labelPlacement="outside"
                    placeholder={`Select ${formData.payeeType || 'payee'}`}
                    isDisabled={!formData.payeeType}
                  >
                    {(() => {
                      const payeeOptions = getPayeeOptions();
                      return Array.isArray(payeeOptions) && payeeOptions.length > 0
                        ? payeeOptions.map((payee) => (
                            <SelectItem 
                              key={payee._id} 
                              value={payee._id}
                              textValue={payee.name || payee.email || payee._id}
                            >
                              {payee.name || payee.email || payee._id}
                            </SelectItem>
                          ))
                        : (
                            <SelectItem key="no-options" value="" isDisabled>
                              No {formData.payeeType || 'payee'} available
                            </SelectItem>
                          );
                    })()}
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
                      const selected = Array.from(keys)[0] || '';
                      setFormData((prev) => ({
                        ...prev,
                        currency: selected,
                      }));
                    }}
                    labelPlacement="outside"
                    placeholder="Select currency"
                    isLoading={isLoadingCurrencies}
                  >
                    {currencies.map((currency) => (
                      <SelectItem 
                        key={currency._id} 
                        value={currency._id}
                        textValue={`${currency.code} - ${currency.name} (${currency.symbol})`}
                      >
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
                  <Input
                    label="Payment Method"
                    name="paymentMethod"
                    value="Bank Transfer"
                    disabled
                    labelPlacement="outside"
                    description="Fixed payment method for bank transfer vouchers"
                  />

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
                      <SelectItem 
                        key={purchase._id} 
                        value={purchase._id}
                        textValue={purchase.invoiceNumber || purchase._id}
                      >
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
                      <SelectItem 
                        key={sale._id} 
                        value={sale._id}
                        textValue={sale.invoiceNumber || sale._id}
                      >
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

              {/* Attachment */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Attachment
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
                          Click to upload attachment
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
                  {isSubmitting ? 'Creating...' : 'Create Voucher'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
          </div>

          {/* Right Sidebar - Help & Information */}
          <div className="xl:col-span-1 space-y-6">
            {/* Information Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaInfoCircle className="text-blue-600 text-xl" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Quick Guide
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Required Fields
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Voucher Date</li>
                      <li>• Bank Account</li>
                      <li>• Payee Type & Payee</li>
                      <li>• Amount</li>
                      <li>• Currency</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Optional Fields
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Check Number</li>
                      <li>• Reference Number</li>
                      <li>• Related Transactions</li>
                      <li>• Description & Notes</li>
                      <li>• Attachments</li>
                    </ul>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Tips Card */}
            <Card className="shadow-lg border-0">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaFileInvoice className="text-green-500" />
                  Tips
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Double-check</strong> the bank account and amount before submitting.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Attach</strong> receipts or documents for better record keeping.
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Link</strong> related purchases or sales for better tracking.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Payment Methods Info */}
            <Card className="shadow-lg border-0">
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaMoneyBillWave className="text-orange-500" />
                  Payment Method
                </h3>
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <p className="text-sm font-semibold text-gray-900">
                      Bank Payment
                    </p>
                    <p className="text-xs text-gray-600">
                      This voucher uses bank payment method only. All transactions are processed through bank accounts.
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

export default BankPaymentVoucher;

