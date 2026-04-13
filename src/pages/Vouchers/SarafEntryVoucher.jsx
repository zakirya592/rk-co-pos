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
  Divider,
} from '@nextui-org/react';
import {
  FaArrowLeft,
  FaFileUpload,
  FaTimes,
  FaSave,
  FaPlus,
  FaTrash,
  FaCalendarAlt,
  FaCoins,
  FaBook,
  FaMoneyBillWave,
  FaExchangeAlt,
} from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from 'react-query';

const emptyEntry = () => ({
  account: '',
  bankAccount: '',
  accountModel: 'BankAccount',
  accountName: '',
  debit: '',
  credit: '',
  currency: '',
  exchangeRate: '1',
  description: '',
});

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
    entries: [emptyEntry(), emptyEntry()],
    description: '',
    notes: '',
  });

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

  const fetchAssets = async () => {
    try {
      const { data } = await userRequest.get('/assets');
      if (data?.data?.assets && Array.isArray(data.data.assets)) return data.data.assets;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching assets:', error);
      return [];
    }
  };

  const fetchIncomes = async () => {
    try {
      const { data } = await userRequest.get('/incomes');
      if (data?.data?.incomes && Array.isArray(data.data.incomes)) return data.data.incomes;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching incomes:', error);
      return [];
    }
  };

  const fetchLiabilities = async () => {
    try {
      const { data } = await userRequest.get('/liabilities');
      if (data?.data?.liabilities && Array.isArray(data.data.liabilities)) return data.data.liabilities;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching liabilities:', error);
      return [];
    }
  };

  const fetchPartnershipAccounts = async () => {
    try {
      const { data } = await userRequest.get('/partnership-accounts');
      if (data?.data?.partnershipAccounts && Array.isArray(data.data.partnershipAccounts))
        return data.data.partnershipAccounts;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching partnership accounts:', error);
      return [];
    }
  };

  const fetchCashBooks = async () => {
    try {
      const { data } = await userRequest.get('/cash-books');
      if (data?.data?.cashBooks && Array.isArray(data.data.cashBooks)) return data.data.cashBooks;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching cash books:', error);
      return [];
    }
  };

  const fetchCapitals = async () => {
    try {
      const { data } = await userRequest.get('/capitals');
      if (data?.data?.capitals && Array.isArray(data.data.capitals)) return data.data.capitals;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching capitals:', error);
      return [];
    }
  };

  const fetchOwners = async () => {
    try {
      const { data } = await userRequest.get('/owners');
      if (data?.data?.owners && Array.isArray(data.data.owners)) return data.data.owners;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching owners:', error);
      return [];
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await userRequest.get('/employees');
      if (data?.data?.employees && Array.isArray(data.data.employees)) return data.data.employees;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  };

  const fetchPropertyAccounts = async () => {
    try {
      const { data } = await userRequest.get('/property-accounts');
      if (data?.data?.propertyAccounts && Array.isArray(data.data.propertyAccounts))
        return data.data.propertyAccounts;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      console.error('Error fetching property accounts:', error);
      return [];
    }
  };

  const { data: bankAccounts = [] } = useQuery(['bank-accounts'], fetchBankAccounts);
  const { data: suppliers = [] } = useQuery(['suppliers'], fetchSuppliers);
  const { data: customers = [] } = useQuery(['customers'], fetchCustomers);
  const { data: currencies = [], isLoading: isLoadingCurrencies } = useQuery(
    ['currencies'],
    fetchCurrencies
  );
  const { data: assets = [] } = useQuery(['assets'], fetchAssets);
  const { data: incomes = [] } = useQuery(['incomes'], fetchIncomes);
  const { data: liabilities = [] } = useQuery(['liabilities'], fetchLiabilities);
  const { data: partnershipAccounts = [] } = useQuery(['partnership-accounts'], fetchPartnershipAccounts);
  const { data: cashBooks = [] } = useQuery(['cash-books'], fetchCashBooks);
  const { data: capitals = [] } = useQuery(['capitals'], fetchCapitals);
  const { data: owners = [] } = useQuery(['owners'], fetchOwners);
  const { data: employees = [] } = useQuery(['employees'], fetchEmployees);
  const { data: propertyAccounts = [] } = useQuery(['property-accounts'], fetchPropertyAccounts);

  const getAccountOptions = (accountModel) => {
    switch (accountModel) {
      case 'BankAccount':
        return Array.isArray(bankAccounts) ? bankAccounts : [];
      case 'Supplier':
        return Array.isArray(suppliers) ? suppliers : [];
      case 'Customer':
        return Array.isArray(customers) ? customers : [];
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEntryChange = (index, field, value) => {
    const updatedEntries = [...formData.entries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value,
    };

    if (field === 'account') {
      const accountModel = updatedEntries[index].accountModel;
      const accounts = getAccountOptions(accountModel);
      const selectedAccount = accounts.find((a) => a._id === value);
      updatedEntries[index].bankAccount = accountModel === 'BankAccount' ? value : '';
      if (selectedAccount) {
        updatedEntries[index].accountName =
          selectedAccount.name ||
          selectedAccount.accountName ||
          selectedAccount.title ||
          selectedAccount.email ||
          '';
      }
    }

    if (field === 'accountModel') {
      updatedEntries[index].account = '';
      updatedEntries[index].bankAccount = '';
      updatedEntries[index].accountName = '';
    }

    setFormData((prev) => ({
      ...prev,
      entries: updatedEntries,
    }));
  };

  const addEntry = () => {
    const defaultCurrency =
      currencies.find((c) => c.code === 'PKR')?._id || currencies[0]?._id || '';
    setFormData((prev) => ({
      ...prev,
      entries: [
        ...prev.entries,
        {
          ...emptyEntry(),
          currency: defaultCurrency,
        },
      ],
    }));
  };

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

  useEffect(() => {
    if (currencies.length === 0) return;
    const defaultId = currencies.find((c) => c.code === 'PKR')?._id || currencies[0]._id;
    setFormData((prev) => ({
      ...prev,
      entries: prev.entries.map((e) => ({
        ...e,
        currency: e.currency || defaultId,
        exchangeRate: e.exchangeRate === '' || e.exchangeRate == null ? '1' : e.exchangeRate,
      })),
    }));
  }, [currencies]);

  const validateEntries = () => {
    for (let i = 0; i < formData.entries.length; i++) {
      const entry = formData.entries[i];
      const debit = parseFloat(entry.debit) || 0;
      const credit = parseFloat(entry.credit) || 0;
      if (debit > 0 && credit > 0) {
        toast.error(`Entry ${i + 1}: Cannot have both debit and credit`);
        return false;
      }
      if (!entry.accountModel || !entry.account) {
        toast.error(`Entry ${i + 1}: Select account type and account`);
        return false;
      }
      if (!entry.currency) {
        toast.error(`Entry ${i + 1}: Select currency`);
        return false;
      }
      const er = parseFloat(entry.exchangeRate);
      if (Number.isNaN(er) || er <= 0) {
        toast.error(`Entry ${i + 1}: Enter a valid exchange rate (> 0)`);
        return false;
      }
      if (debit <= 0 && credit <= 0) {
        toast.error(`Entry ${i + 1}: Enter debit or credit amount`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEntries()) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('voucherDate', formData.voucherDate);
      formDataToSend.append('voucherType', formData.voucherType);
      formDataToSend.append('exchangeType', formData.exchangeType);

      formData.entries.forEach((entry, index) => {
        formDataToSend.append(`entries[${index}][account]`, entry.account);
        formDataToSend.append(
          `entries[${index}][bankAccount]`,
          entry.bankAccount || (entry.accountModel === 'BankAccount' ? entry.account : '')
        );
        formDataToSend.append(`entries[${index}][accountModel]`, entry.accountModel);
        formDataToSend.append(`entries[${index}][accountName]`, entry.accountName || '');
        formDataToSend.append(`entries[${index}][debit]`, entry.debit || '0');
        formDataToSend.append(`entries[${index}][credit]`, entry.credit || '0');
        formDataToSend.append(`entries[${index}][currency]`, entry.currency);
        formDataToSend.append(
          `entries[${index}][exchangeRate]`,
          entry.exchangeRate != null && entry.exchangeRate !== '' ? String(entry.exchangeRate) : '1'
        );
        if (entry.description) {
          formDataToSend.append(`entries[${index}][description]`, entry.description);
        }
      });

      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      if (formData.notes) {
        formDataToSend.append('notes', formData.notes);
      }
      if (attachment) {
        formDataToSend.append('attachment', attachment);
      }

      await userRequest.post('/saraf-entry-vouchers', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Saraf Entry Voucher created successfully');
      queryClient.invalidateQueries(['saraf-entry-vouchers']);
      const defaultId = currencies.find((c) => c.code === 'PKR')?._id || currencies[0]?._id || '';
      setFormData({
        voucherDate: new Date().toISOString().split('T')[0],
        voucherType: 'payment',
        exchangeType: 'buy',
        entries: [
          { ...emptyEntry(), currency: defaultId, exchangeRate: '1' },
          { ...emptyEntry(), currency: defaultId, exchangeRate: '1' },
        ],
        description: '',
        notes: '',
      });
      setAttachment(null);
      setAttachmentPreview(null);
      if (onBack) onBack();
      else navigate('/vouchers');
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast.error(
        error.response?.data?.message || 'Failed to create saraf entry voucher'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalDebit = formData.entries.reduce(
    (sum, entry) => sum + (parseFloat(entry.debit) || 0),
    0
  );
  const totalCredit = formData.entries.reduce(
    (sum, entry) => sum + (parseFloat(entry.credit) || 0),
    0
  );
  const currencyIds = [...new Set(formData.entries.map((e) => e.currency).filter(Boolean))];
  const sameCurrency = currencyIds.length <= 1;
  const isBalanced = sameCurrency && Math.abs(totalDebit - totalCredit) < 0.01;

  const getCurrencySymbol = (currencyId) => {
    const currency = currencies.find((c) => c._id === currencyId);
    return currency?.symbol || '';
  };

  const accountModelSelectItems = (
    <>
      <SelectItem key="BankAccount" value="BankAccount" textValue="Bank Account">
        Bank Account
      </SelectItem>
      <SelectItem key="Supplier" value="Supplier" textValue="Supplier">
        Supplier
      </SelectItem>
      <SelectItem key="Customer" value="Customer" textValue="Customer">
        Customer
      </SelectItem>
      <SelectItem key="Asset" value="Asset" textValue="Asset">
        Asset
      </SelectItem>
      <SelectItem key="Income" value="Income" textValue="Income">
        Income
      </SelectItem>
      <SelectItem key="Liability" value="Liability" textValue="Liability">
        Liability
      </SelectItem>
      <SelectItem key="PartnershipAccount" value="PartnershipAccount" textValue="Partnership Account">
        Partnership Account
      </SelectItem>
      <SelectItem key="CashBook" value="CashBook" textValue="Cash Book">
        Cash Book
      </SelectItem>
      <SelectItem key="Capital" value="Capital" textValue="Capital">
        Capital
      </SelectItem>
      <SelectItem key="Owner" value="Owner" textValue="Owner">
        Owner
      </SelectItem>
      <SelectItem key="Employee" value="Employee" textValue="Employee">
        Employee
      </SelectItem>
      <SelectItem key="PropertyAccount" value="PropertyAccount" textValue="Property Account">
        Property Account
      </SelectItem>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                isIconOnly
                variant="light"
                className="text-white hover:bg-white/20"
                onPress={() => (onBack ? onBack() : navigate('/vouchers'))}
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
                    Journal-style lines with currency per entry (multi-currency)
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-white text-xs font-medium">Balance (same currency)</p>
                <p className="text-amber-100 text-sm font-semibold">
                  {sameCurrency ? (isBalanced ? 'Balanced' : 'Unbalanced') : 'Multi-currency'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <Card className="shadow-xl border-0">
              <CardBody className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="mb-6 pb-4 border-b-2 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 p-2 rounded-lg">
                        <FaBook className="text-amber-600 text-xl" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">New Saraf Entry</h2>
                        <p className="text-sm text-gray-600">
                          Choose accounts like a journal voucher; set currency and rate on each line.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaCalendarAlt className="text-amber-500" />
                      Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        selectedKeys={formData.voucherType ? [formData.voucherType] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || '';
                          setFormData((prev) => ({ ...prev, voucherType: selected }));
                        }}
                        labelPlacement="outside"
                      >
                        <SelectItem key="payment" value="payment">
                          Payment
                        </SelectItem>
                        <SelectItem key="receipt" value="receipt">
                          Receipt
                        </SelectItem>
                        <SelectItem key="transfer" value="transfer">
                          Transfer
                        </SelectItem>
                      </Select>
                      <Select
                        isRequired
                        label="Exchange Type"
                        selectedKeys={formData.exchangeType ? [formData.exchangeType] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || '';
                          setFormData((prev) => ({ ...prev, exchangeType: selected }));
                        }}
                        labelPlacement="outside"
                      >
                        <SelectItem key="buy" value="buy">
                          Buy
                        </SelectItem>
                        <SelectItem key="sell" value="sell">
                          Sell
                        </SelectItem>
                      </Select>
                    </div>
                  </div>

                  <Divider />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-200 flex items-center gap-2 flex-1">
                        <FaBook className="text-amber-500" />
                        Entries (debit / credit per line + currency)
                      </h2>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        className="bg-amber-100 text-amber-900"
                        startContent={<FaPlus />}
                        onPress={addEntry}
                      >
                        Add Entry
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {formData.entries.map((entry, index) => (
                        <Card key={index} className="border-2 border-gray-200 bg-gray-50">
                          <CardBody className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-gray-900">Entry {index + 1}</h3>
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
                                label="Account Model"
                                selectedKeys={entry.accountModel ? [entry.accountModel] : []}
                                onSelectionChange={(keys) => {
                                  const selected = Array.from(keys)[0] || '';
                                  handleEntryChange(index, 'accountModel', selected);
                                }}
                                labelPlacement="outside"
                              >
                                {accountModelSelectItems}
                              </Select>

                              <Select
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
                                      account.title ||
                                      account.email ||
                                      account._id
                                    }
                                  >
                                    {account.name ||
                                      account.accountName ||
                                      account.title ||
                                      account.email ||
                                      account._id}
                                  </SelectItem>
                                ))}
                              </Select>

                              <Select
                                label="Currency (this line)"
                                selectedKeys={entry.currency ? [entry.currency] : []}
                                onSelectionChange={(keys) => {
                                  const selected = Array.from(keys)[0] || '';
                                  handleEntryChange(index, 'currency', selected);
                                }}
                                labelPlacement="outside"
                                placeholder="Currency"
                                isLoading={isLoadingCurrencies}
                              >
                                {currencies.map((currency) => (
                                  <SelectItem
                                    key={currency._id}
                                    value={currency._id}
                                    textValue={`${currency.code} - ${currency.name}`}
                                  >
                                    {currency.code} — {currency.name} ({currency.symbol})
                                  </SelectItem>
                                ))}
                              </Select>

                              <Input
                                type="number"
                                label="Exchange rate (this line)"
                                value={entry.exchangeRate}
                                onChange={(e) =>
                                  handleEntryChange(index, 'exchangeRate', e.target.value)
                                }
                                labelPlacement="outside"
                                placeholder="1"
                                min="0"
                                step="0.0000001"
                                description="Rate for this amount in base/reporting terms"
                              />

                              {index === 0 && (
                                <Input
                                  type="number"
                                  label={`Debit (${getCurrencySymbol(entry.currency) || '—'})`}
                                  value={entry.debit}
                                  onChange={(e) =>
                                    handleEntryChange(index, 'debit', e.target.value)
                                  }
                                  labelPlacement="outside"
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                />
                              )}

                              {index === 1 && (
                                <Input
                                  type="number"
                                  label={`Credit (${getCurrencySymbol(entry.currency) || '—'})`}
                                  value={entry.credit}
                                  onChange={(e) =>
                                    handleEntryChange(index, 'credit', e.target.value)
                                  }
                                  labelPlacement="outside"
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                />
                              )}

                              {index > 1 && (
                                <>
                                  <Input
                                    type="number"
                                    label={`Debit (${getCurrencySymbol(entry.currency) || '—'})`}
                                    value={entry.debit}
                                    onChange={(e) =>
                                      handleEntryChange(index, 'debit', e.target.value)
                                    }
                                    labelPlacement="outside"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                  />
                                  <Input
                                    type="number"
                                    label={`Credit (${getCurrencySymbol(entry.currency) || '—'})`}
                                    value={entry.credit}
                                    onChange={(e) =>
                                      handleEntryChange(index, 'credit', e.target.value)
                                    }
                                    labelPlacement="outside"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                  />
                                </>
                              )}

                              <Textarea
                                className="md:col-span-2"
                                label="Line description"
                                value={entry.description}
                                onChange={(e) =>
                                  handleEntryChange(index, 'description', e.target.value)
                                }
                                labelPlacement="outside"
                                placeholder="Optional"
                                minRows={2}
                              />
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>

                    <Card className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
                      <CardBody className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Total Debit (raw)</p>
                            <p className="text-xl font-bold text-gray-900">{totalDebit.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Total Credit (raw)</p>
                            <p className="text-xl font-bold text-gray-900">{totalCredit.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Check</p>
                            {sameCurrency ? (
                              <p
                                className={`text-xl font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}
                              >
                                {isBalanced ? 'Balanced' : (totalDebit - totalCredit).toFixed(2)}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-700">
                                Different currencies per line — totals are not comparable as one number.
                              </p>
                            )}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>

                  <Divider />

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaMoneyBillWave className="text-amber-500" />
                      Additional Information
                    </h2>
                    <div className="space-y-4">
                      <Textarea
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="Voucher description"
                        minRows={2}
                      />
                      <Textarea
                        label="Notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="Notes"
                        minRows={3}
                      />
                    </div>
                  </div>

                  <Divider />

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
                          Images, PDF, DOC, DOCX
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
                          <Button isIconOnly variant="light" color="danger" onPress={removeAttachment}>
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

                  <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-200">
                    <Button variant="flat" onPress={() => (onBack ? onBack() : navigate('/vouchers'))} size="lg">
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

          <div className="xl:col-span-1">
            <Card className="shadow-xl border-0 sticky top-6">
              <CardBody className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaExchangeAlt className="text-amber-600" />
                  Tips
                </h3>
                <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                  <li>Line 1 is debit-only; line 2 is credit-only (like the journal voucher).</li>
                  <li>From line 3 onward you can enter both debit and credit on the same line.</li>
                  <li>
                    Pick a different currency on each line when you move value between currencies
                    (e.g. bank in USD, customer in AFN).
                  </li>
                  <li>Exchange rate applies to that line, as required by your backend.</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SarafEntryVoucher;
