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
  FaTrash,
  FaInfoCircle,
  FaCalendarAlt,
  FaBook,
  FaMoneyBillWave,
  FaFileInvoice,
} from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from 'react-query';

const JournalPaymentVoucher = ({ onBack }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  const [formData, setFormData] = useState({
    voucherDate: new Date().toISOString().split('T')[0],
    voucherType: 'journal_entry',
    entries: [
      {
        account: '',
        accountModel: 'BankAccount',
        accountName: '',
        debit: '',
        credit: '',
        description: '',
      },
      {
        account: '',
        accountModel: 'BankAccount',
        accountName: '',
        debit: '',
        credit: '',
        description: '',
      },
    ],
    currency: '',
    currencyExchangeRate: '1',
    referenceNumber: '',
    relatedPurchase: '',
    relatedSale: '',
    relatedPayment: '',
    relatedCashPaymentVoucher: '',
    relatedSupplierPayment: '',
    relatedBankPaymentVoucher: '',
    description: '',
    notes: '',
  });

  // Fetch data
  const fetchBankAccounts = async () => {
    try {
      const res = await userRequest.get('/bank-accounts');
      return res?.data?.data?.bankAccounts || res?.data?.data || [];
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      return [];
    }
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

  const fetchCurrencies = async () => {
    const res = await userRequest.get('/currencies');
    return res.data.data || [];
  };

  const fetchPurchases = async () => {
    const res = await userRequest.get('/purchases?limit=100');
    return res.data?.data || [];
  };

  const fetchSales = async () => {
    const res = await userRequest.get('/sales?limit=100');
    return res.data?.data || [];
  };

  const fetchCashPaymentVouchers = async () => {
    try {
      const res = await userRequest.get('/cash-payment-vouchers?limit=100');
      const vouchers = res.data?.data?.vouchers || res.data?.data || res.data || [];
      return Array.isArray(vouchers) ? vouchers : [];
    } catch (error) {
      console.error('Error fetching cash payment vouchers:', error);
      return [];
    }
  };

  const fetchBankPaymentVouchers = async () => {
    try {
      const res = await userRequest.get('/bank-payment-vouchers?limit=100');
      const vouchers = res.data?.data?.vouchers || res.data?.data || res.data || [];
      return Array.isArray(vouchers) ? vouchers : [];
    } catch (error) {
      console.error('Error fetching bank payment vouchers:', error);
      return [];
    }
  };

  const { data: bankAccounts = [], isLoading: isLoadingBanks } = useQuery(
    ['bank-accounts'],
    fetchBankAccounts
  );

  const { data: suppliers = [] } = useQuery(['suppliers'], fetchSuppliers);
  const { data: customers = [] } = useQuery(['customers'], fetchCustomers);
  const { data: currencies = [], isLoading: isLoadingCurrencies } = useQuery(
    ['currencies'],
    fetchCurrencies
  );
  const { data: purchases = [] } = useQuery(['purchases'], fetchPurchases);
  const { data: sales = [] } = useQuery(['sales'], fetchSales);
  const { data: cashPaymentVouchers = [] } = useQuery(
    ['cash-payment-vouchers'],
    fetchCashPaymentVouchers
  );
  const { data: bankPaymentVouchersData = [] } = useQuery(
    ['bank-payment-vouchers'],
    fetchBankPaymentVouchers
  );

  // Ensure bankPaymentVouchers is always an array
  const bankPaymentVouchers = Array.isArray(bankPaymentVouchersData) ? bankPaymentVouchersData : [];
  const cashPaymentVouchersArray = Array.isArray(cashPaymentVouchers) ? cashPaymentVouchers : [];

  // Get account options based on accountModel
  const getAccountOptions = (accountModel) => {
    switch (accountModel) {
      case 'BankAccount':
        return Array.isArray(bankAccounts) ? bankAccounts : [];
      case 'Supplier':
        return Array.isArray(suppliers) ? suppliers : [];
      case 'Customer':
        return Array.isArray(customers) ? customers : [];
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
  };

  // Handle entry changes
  const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...formData.entries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value,
    };

    // Auto-fill accountName when account is selected
    if (field === 'account') {
      const accountModel = updatedEntries[index].accountModel;
      const accounts = getAccountOptions(accountModel);
      const selectedAccount = accounts.find((a) => a._id === value);
      if (selectedAccount) {
        updatedEntries[index].accountName =
          selectedAccount.name ||
          selectedAccount.accountName ||
          selectedAccount.email ||
          '';
      }
    }

    // Reset account when accountModel changes
    if (field === 'accountModel') {
      updatedEntries[index].account = '';
      updatedEntries[index].accountName = '';
    }

    setFormData((prev) => ({
      ...prev,
      entries: updatedEntries,
    }));
  };

  // Add new entry
  const addEntry = () => {
    setFormData((prev) => ({
      ...prev,
      entries: [
        ...prev.entries,
        {
          account: '',
          accountModel: 'BankAccount',
          accountName: '',
          debit: '',
          credit: '',
          description: '',
        },
      ],
    }));
  };

  // Remove entry
  const removeEntry = (index) => {
    if (formData.entries.length > 2) {
      const updatedEntries = formData.entries.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        entries: updatedEntries,
      }));
    } else {
      toast.error('At least 2 entries are required');
    }
  };

  // Handle attachment file change
  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
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

  // Validate entries (debits must equal credits)
  const validateEntries = () => {
    const totalDebit = formData.entries.reduce(
      (sum, entry) => sum + (parseFloat(entry.debit) || 0),
      0
    );
    const totalCredit = formData.entries.reduce(
      (sum, entry) => sum + (parseFloat(entry.credit) || 0),
      0
    );

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      toast.error(
        `Debits (${totalDebit}) must equal Credits (${totalCredit})`
      );
      return false;
    }

    // Validate each entry
    for (let i = 0; i < formData.entries.length; i++) {
      const entry = formData.entries[i];
      if (!entry.account) {
        toast.error(`Entry ${i + 1}: Please select an account`);
        return false;
      }
      if (!entry.accountName) {
        toast.error(`Entry ${i + 1}: Account name is required`);
        return false;
      }
      const debit = parseFloat(entry.debit) || 0;
      const credit = parseFloat(entry.credit) || 0;
      if (debit === 0 && credit === 0) {
        toast.error(`Entry ${i + 1}: Either debit or credit must be greater than 0`);
        return false;
      }
      if (debit > 0 && credit > 0) {
        toast.error(`Entry ${i + 1}: Cannot have both debit and credit`);
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.currency) {
      toast.error('Please select a currency');
      return;
    }

    if (!validateEntries()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Append basic fields
      formDataToSend.append('voucherDate', formData.voucherDate);
      formDataToSend.append('voucherType', formData.voucherType);
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append(
        'currencyExchangeRate',
        formData.currencyExchangeRate || '1'
      );

      // Append entries array
      formData.entries.forEach((entry, index) => {
        formDataToSend.append(`entries[${index}][account]`, entry.account);
        formDataToSend.append(
          `entries[${index}][accountModel]`,
          entry.accountModel
        );
        formDataToSend.append(
          `entries[${index}][accountName]`,
          entry.accountName
        );
        formDataToSend.append(`entries[${index}][debit]`, entry.debit || '0');
        formDataToSend.append(`entries[${index}][credit]`, entry.credit || '0');
        if (entry.description) {
          formDataToSend.append(
            `entries[${index}][description]`,
            entry.description
          );
        }
      });

      // Append optional fields
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
      if (formData.relatedCashPaymentVoucher) {
        formDataToSend.append(
          'relatedCashPaymentVoucher',
          formData.relatedCashPaymentVoucher
        );
      }
      if (formData.relatedSupplierPayment) {
        formDataToSend.append(
          'relatedSupplierPayment',
          formData.relatedSupplierPayment
        );
      }
      if (formData.relatedBankPaymentVoucher) {
        formDataToSend.append(
          'relatedBankPaymentVoucher',
          formData.relatedBankPaymentVoucher
        );
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

      await userRequest.post('/journal-payment-vouchers', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Journal Payment Voucher created successfully');

      // Invalidate queries
      queryClient.invalidateQueries(['journal-payment-vouchers']);

      // Reset form
      setFormData({
        voucherDate: new Date().toISOString().split('T')[0],
        voucherType: 'journal_entry',
        entries: [
          {
            account: '',
            accountModel: 'BankAccount',
            accountName: '',
            debit: '',
            credit: '',
            description: '',
          },
          {
            account: '',
            accountModel: 'BankAccount',
            accountName: '',
            debit: '',
            credit: '',
            description: '',
          },
        ],
        currency: '',
        currencyExchangeRate: '1',
        referenceNumber: '',
        relatedPurchase: '',
        relatedSale: '',
        relatedPayment: '',
        relatedCashPaymentVoucher: '',
        relatedSupplierPayment: '',
        relatedBankPaymentVoucher: '',
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
        error.response?.data?.message || 'Failed to create journal payment voucher'
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

  // Calculate totals
  const totalDebit = formData.entries.reduce(
    (sum, entry) => sum + (parseFloat(entry.debit) || 0),
    0
  );
  const totalCredit = formData.entries.reduce(
    (sum, entry) => sum + (parseFloat(entry.credit) || 0),
    0
  );
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
  
  // Check if any entries have values
  const hasEntriesWithValues = formData.entries.some(
    (entry) => (parseFloat(entry.debit) || 0) > 0 || (parseFloat(entry.credit) || 0) > 0
  );
  
  // Only disable if entries have values but are not balanced
  const shouldDisableButton = hasEntriesWithValues && !isBalanced;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 shadow-lg">
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
                    Create Journal Payment Voucher
                  </h1>
                  <p className="text-purple-100 text-sm md:text-base mt-1">
                    Add a new journal entry • Debits must equal Credits
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-white text-xs font-medium">New Entry</p>
                <p className="text-purple-100 text-sm font-semibold">
                  {isBalanced ? 'Balanced' : 'Unbalanced'}
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
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <FaPlus className="text-purple-600 text-xl" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          New Journal Entry
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
                      <FaCalendarAlt className="text-purple-500" />
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
                        description="Journal entry type"
                      />
                    </div>
                  </div>

                  <Divider />

                  {/* Journal Entries */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200 flex items-center gap-2 flex-1">
                        <FaBook className="text-purple-500" />
                        Journal Entries
                      </h2>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<FaPlus />}
                        onPress={addEntry}
                      >
                        Add Entry
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {formData.entries.map((entry, index) => (
                        <Card
                          key={index}
                          className="border-2 border-gray-200 bg-gray-50"
                        >
                          <CardBody className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-gray-900">
                                Entry {index + 1}
                              </h3>
                              {formData.entries.length > 2 && (
                                <Button
                                  isIconOnly
                                  size="sm"
                                  color="danger"
                                  variant="light"
                                  onPress={() => removeEntry(index)}
                                >
                                  <FaTrash />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Select
                                isRequired
                                label="Account Model"
                                selectedKeys={entry.accountModel ? [entry.accountModel] : []}
                                onSelectionChange={(keys) => {
                                  const selected = Array.from(keys)[0] || '';
                                  handleEntryChange(index, 'accountModel', selected);
                                }}
                                labelPlacement="outside"
                              >
                                <SelectItem key="BankAccount" value="BankAccount" textValue="Bank Account">
                                  Bank Account
                                </SelectItem>
                                <SelectItem key="Supplier" value="Supplier" textValue="Supplier">
                                  Supplier
                                </SelectItem>
                                <SelectItem key="Customer" value="Customer" textValue="Customer">
                                  Customer
                                </SelectItem>
                              </Select>

                              <Select
                                isRequired
                                label="Account"
                                selectedKeys={entry.account ? [entry.account] : []}
                                onSelectionChange={(keys) => {
                                  const selected = Array.from(keys)[0] || '';
                                  handleEntryChange(index, 'account', selected);
                                }}
                                labelPlacement="outside"
                                placeholder="Select account"
                                isDisabled={!entry.accountModel}
                              >
                                {getAccountOptions(entry.accountModel).map((account) => (
                                  <SelectItem
                                    key={account._id}
                                    value={account._id}
                                    textValue={
                                      account.name ||
                                      account.accountName ||
                                      account.email ||
                                      account._id
                                    }
                                  >
                                    {account.name ||
                                      account.accountName ||
                                      account.email ||
                                      account._id}
                                  </SelectItem>
                                ))}
                              </Select>

                              <Input
                                isRequired
                                label="Account Name"
                                value={entry.accountName}
                                onChange={(e) =>
                                  handleEntryChange(index, 'accountName', e.target.value)
                                }
                                labelPlacement="outside"
                                placeholder="Account name"
                              />

                              <Input
                                type="number"
                                label="Debit"
                                value={entry.debit}
                                onChange={(e) =>
                                  handleEntryChange(index, 'debit', e.target.value)
                                }
                                labelPlacement="outside"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                description={
                                  entry.credit > 0
                                    ? 'Cannot have both debit and credit'
                                    : ''
                                }
                              />

                              <Input
                                type="number"
                                label="Credit"
                                value={entry.credit}
                                onChange={(e) =>
                                  handleEntryChange(index, 'credit', e.target.value)
                                }
                                labelPlacement="outside"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                description={
                                  entry.debit > 0
                                    ? 'Cannot have both debit and credit'
                                    : ''
                                }
                              />

                              <Textarea
                                label="Description"
                                value={entry.description}
                                onChange={(e) =>
                                  handleEntryChange(index, 'description', e.target.value)
                                }
                                labelPlacement="outside"
                                placeholder="Entry description"
                                minRows={2}
                              />
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>

                    {/* Balance Summary */}
                    <Card className="mt-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
                      <CardBody className="p-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Total Debit</p>
                            <p className="text-xl font-bold text-gray-900">
                              {totalDebit.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Total Credit</p>
                            <p className="text-xl font-bold text-gray-900">
                              {totalCredit.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Balance</p>
                            <p
                              className={`text-xl font-bold ${
                                isBalanced ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {(totalDebit - totalCredit).toFixed(2)}
                            </p>
                            {isBalanced ? (
                              <p className="text-xs text-green-600 mt-1">✓ Balanced</p>
                            ) : (
                              <p className="text-xs text-red-600 mt-1">
                                Debits must equal Credits
                              </p>
                            )}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>

                  <Divider />

                  {/* Currency */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaMoneyBillWave className="text-purple-500" />
                      Currency
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  {/* References */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaFileInvoice className="text-orange-500" />
                      References (Optional)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Reference Number"
                        name="referenceNumber"
                        value={formData.referenceNumber}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="Enter reference number"
                      />

                      <Select
                        label="Related Purchase"
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

                      <Select
                        label="Related Cash Payment Voucher"
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
                        {cashPaymentVouchersArray.map((voucher) => (
                          <SelectItem
                            key={voucher._id}
                            value={voucher._id}
                            textValue={voucher.voucherNumber || voucher.referCode || voucher._id}
                          >
                            {voucher.voucherNumber || voucher.referCode || voucher._id}
                          </SelectItem>
                        ))}
                      </Select>

                      <Select
                        label="Related Bank Payment Voucher"
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
                          <SelectItem
                            key={voucher._id}
                            value={voucher._id}
                            textValue={voucher.voucherNumber || voucher.referCode || voucher._id}
                          >
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
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
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
                                <div className="w-16 h-16 bg-purple-100 rounded flex items-center justify-center">
                                  <FaFileUpload className="text-2xl text-purple-600" />
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
                      className="bg-gradient-to-r from-purple-500 to-indigo-600"
                      isDisabled={shouldDisableButton}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Voucher'}
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardBody className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaInfoCircle className="text-purple-600 text-xl" />
                  <h3 className="text-lg font-bold text-gray-900">Quick Guide</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Required Fields
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Voucher Date</li>
                      <li>• At least 2 Entries</li>
                      <li>• Account for each entry</li>
                      <li>• Debit or Credit for each entry</li>
                      <li>• Currency</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Balance Rule
                    </p>
                    <p className="text-xs text-gray-600">
                      Total Debits must equal Total Credits for the entry to be valid.
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

export default JournalPaymentVoucher;

