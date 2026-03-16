import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
} from '@nextui-org/react';
import {
  FaArrowLeft,
  FaSave,
  FaCalendarAlt,
  FaBook,
  FaMoneyBillWave,
  FaBalanceScale,
} from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import { useQuery } from 'react-query';

const OpeningBalanceVoucher = ({ onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    voucherDate: new Date().toISOString().split('T')[0],
    voucherType: 'start',
    financialYear: '',
    periodStartDate: '',
    periodEndDate: '',
    account: '',
    accountModel: 'Customer',
    accountName: '',
    amount: '',
    currency: '',
    description: '',
    notes: '',
  });

  const fetchBankAccounts = async () => {
    const res = await userRequest.get('/bank-accounts');
    const data = res.data?.data || res.data || [];
    return Array.isArray(data) ? data : [];
  };

  const fetchSuppliers = async () => {
    const res = await userRequest.get('/suppliers');
    const data = res.data?.data || res.data || [];
    return Array.isArray(data) ? data : [];
  };

  const fetchCustomers = async () => {
    const res = await userRequest.get('/customers');
    const data = res.data?.data || res.data || [];
    return Array.isArray(data) ? data : [];
  };

  const fetchCurrencies = async () => {
    const res = await userRequest.get('/currencies');
    return res.data.data || [];
  };

  const { data: bankAccounts = [] } = useQuery(['bank-accounts'], fetchBankAccounts);
  const { data: suppliers = [] } = useQuery(['suppliers'], fetchSuppliers);
  const { data: customers = [] } = useQuery(['customers'], fetchCustomers);
  const { data: currencies = [], isLoading: isLoadingCurrencies } = useQuery(
    ['currencies'],
    fetchCurrencies
  );

  const getAccountOptions = (accountModel) => {
    switch (accountModel) {
      case 'Customer':
        return Array.isArray(customers) ? customers : [];
      case 'Supplier':
        return Array.isArray(suppliers) ? suppliers : [];
      case 'BankAccount':
        return Array.isArray(bankAccounts) ? bankAccounts : [];
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.currency) {
      toast.error('Please select a currency');
      return;
    }
    if (!formData.financialYear) {
      toast.error('Please enter financial year');
      return;
    }
    if (!formData.periodStartDate) {
      toast.error('Please enter period start date');
      return;
    }
    if (!formData.periodEndDate) {
      toast.error('Please enter period end date');
      return;
    }
    if (!formData.account) {
      toast.error('Please select an account');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        voucherDate: formData.voucherDate,
        financialYear: formData.financialYear,
        periodStartDate: formData.periodStartDate,
        periodEndDate: formData.periodEndDate,
        account: formData.account,
        accountModel: formData.accountModel,
        accountName: formData.accountName,
        voucherType: formData.voucherType,
        amount: Number(formData.amount),
        currency: formData.currency,
        description: formData.description || '',
        notes: formData.notes || '',
      };

      await userRequest.post('/opening-balance-vouchers', payload);

      toast.success('Opening balance voucher created successfully');
      onBack();
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast.error(
        error.response?.data?.message || 'Failed to create opening balance voucher'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (currencies.length > 0 && !formData.currency) {
      const pkrCurrency = currencies.find((c) => c.code === 'PKR');
      setFormData((prev) => ({
        ...prev,
        currency: (pkrCurrency || currencies[0])._id,
      }));
    }
  }, [currencies, formData.currency]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
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
                  <FaBalanceScale className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Create Opening Balance Voucher
                  </h1>
                  <p className="text-amber-100 text-sm md:text-base mt-1">
                    Set opening balances for accounts
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Form */}
          <div className="xl:col-span-3">
            <Card className="shadow-xl border-0">
              <CardBody className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Form Header */}
                  <div className="mb-6 pb-4 border-b-2 border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 p-2 rounded-lg">
                        <FaBook className="text-amber-600 text-xl" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          New Opening Balance Voucher
                        </h2>
                        <p className="text-sm text-gray-600">
                          Fill in all required information to create the opening balance
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
                        placeholder="Select voucher type"
                      >
                        <SelectItem key="start" value="start">
                          Opening (Start)
                        </SelectItem>
                        <SelectItem key="end" value="end">
                          Closing (End)
                        </SelectItem>
                      </Select>
                      <Input
                        isRequired
                        label="Financial Year"
                        name="financialYear"
                        value={formData.financialYear}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="e.g., 2026-2027"
                      />
                      <Input
                        isRequired
                        type="date"
                        label="Period Start Date"
                        name="periodStartDate"
                        value={formData.periodStartDate}
                        onChange={handleChange}
                        labelPlacement="outside"
                      />
                      <Input
                        isRequired
                        type="date"
                        label="Period End Date"
                        name="periodEndDate"
                        value={formData.periodEndDate}
                        onChange={handleChange}
                        labelPlacement="outside"
                      />
                    </div>
                  </div>

                  {/* Currency & Amount */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaMoneyBillWave className="text-amber-500" />
                      Currency & Amount
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
                            textValue={currency.name}
                          >
                            {currency.name} ({currency.code})
                          </SelectItem>
                        ))}
                      </Select>
                      <Input
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
                    </div>
                  </div>

                  {/* Account Information */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaBook className="text-amber-500" />
                      Account Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        isRequired
                        label="Account Type"
                        name="accountModel"
                        selectedKeys={formData.accountModel ? [formData.accountModel] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || '';
                          setFormData((prev) => ({
                            ...prev,
                            accountModel: selected,
                            account: '',
                            accountName: '',
                          }));
                        }}
                        labelPlacement="outside"
                        placeholder="Select account type"
                      >
                        <SelectItem key="Customer" value="Customer">
                          Customer
                        </SelectItem>
                        <SelectItem key="Supplier" value="Supplier">
                          Supplier
                        </SelectItem>
                        <SelectItem key="BankAccount" value="BankAccount">
                          Bank Account
                        </SelectItem>
                      </Select>
                      <Select
                        isRequired
                        label={`Select ${formData.accountModel || 'Account'}`}
                        name="account"
                        selectedKeys={formData.account ? [formData.account] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || '';
                          const accounts = getAccountOptions(formData.accountModel);
                          const selectedAccount = accounts.find((a) => a._id === selected);
                          setFormData((prev) => ({
                            ...prev,
                            account: selected,
                            accountName:
                              selectedAccount?.name ||
                              selectedAccount?.accountName ||
                              selectedAccount?.email ||
                              '',
                          }));
                        }}
                        labelPlacement="outside"
                        placeholder={`Select ${formData.accountModel || 'account'}`}
                        isDisabled={!formData.accountModel}
                      >
                        {getAccountOptions(formData.accountModel).map((acc) => (
                          <SelectItem
                            key={acc._id}
                            value={acc._id}
                            textValue={acc.name || acc.accountName || acc.email || acc._id}
                          >
                            {acc.name || acc.accountName || acc.email || acc._id}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    <Input
                      isRequired
                      label="Account Name"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleChange}
                      labelPlacement="outside"
                      placeholder="Auto-filled or enter account name"
                      className="mt-4"
                    />
                  </div>

                  {/* Description & Notes */}
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
                        placeholder="Opening balance description"
                      />
                      <Textarea
                        label="Notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="Notes (optional)"
                      />
                    </div>
                  </div>

                  {/* Submit */}
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
                      isDisabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Voucher'}
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1">
            <Card className="shadow-xl border-0 sticky top-6">
              <CardBody className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-lg ${
                      formData.amount && Number(formData.amount) > 0 ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">Amount Status</p>
                    <p
                      className={`text-xl font-bold ${
                        formData.amount && Number(formData.amount) > 0
                          ? 'text-green-700'
                          : 'text-red-700'
                      }`}
                    >
                      {formData.amount && Number(formData.amount) > 0
                        ? 'Valid amount ✓'
                        : 'Enter amount ✗'}
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

export default OpeningBalanceVoucher;

