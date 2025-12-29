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
  FaPlus,
  FaTrash,
  FaInfoCircle,
  FaCalendarAlt,
  FaBook,
  FaMoneyBillWave,
  FaExchangeAlt,
} from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from 'react-query';

const ReconcileBankAccountsVoucher = ({ onBack }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  const [formData, setFormData] = useState({
    voucherDate: new Date().toISOString().split('T')[0],
    bankAccount: '',
    statementDate: '',
    statementNumber: '',
    openingBalance: '',
    closingBalance: '',
    bookBalance: '',
    statementBalance: '',
    entries: [
      {
        statementDate: '',
        statementDescription: '',
        statementAmount: '',
        statementType: 'credit',
        statementReference: '',
        status: 'unmatched',
      },
    ],
    outstandingDeposits: '',
    outstandingWithdrawals: '',
    outstandingChecks: '',
    bankCharges: '',
    interestEarned: '',
    currency: '',
    currencyExchangeRate: '1',
    referenceNumber: '',
    notes: '',
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

  const fetchCurrencies = async () => {
    const res = await userRequest.get('/currencies');
    return res.data.data || [];
  };

  const { data: bankAccounts = [], isLoading: isLoadingBanks } = useQuery(
    ['bank-accounts'],
    fetchBankAccounts
  );
  const { data: currencies = [], isLoading: isLoadingCurrencies } = useQuery(
    ['currencies'],
    fetchCurrencies
  );

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
          statementDate: '',
          statementDescription: '',
          statementAmount: '',
          statementType: 'credit',
          statementReference: '',
          status: 'unmatched',
        },
      ],
    }));
  };

  // Remove entry
  const removeEntry = (index) => {
    if (formData.entries.length > 1) {
      setFormData((prev) => ({
        ...prev,
        entries: prev.entries.filter((_, i) => i !== index),
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

    if (!formData.bankAccount) {
      toast.error('Please select a bank account');
      return;
    }

    if (!formData.currency) {
      toast.error('Please select a currency');
      return;
    }

    if (!formData.statementDate) {
      toast.error('Please enter statement date');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('voucherDate', formData.voucherDate);
      formDataToSend.append('bankAccount', formData.bankAccount);
      formDataToSend.append('statementDate', formData.statementDate);
      formDataToSend.append('statementNumber', formData.statementNumber || '');
      formDataToSend.append('openingBalance', formData.openingBalance || '0');
      formDataToSend.append('closingBalance', formData.closingBalance || '0');
      formDataToSend.append('bookBalance', formData.bookBalance || '0');
      formDataToSend.append('statementBalance', formData.statementBalance || '0');
      formDataToSend.append('outstandingDeposits', formData.outstandingDeposits || '0');
      formDataToSend.append('outstandingWithdrawals', formData.outstandingWithdrawals || '0');
      formDataToSend.append('outstandingChecks', formData.outstandingChecks || '0');
      formDataToSend.append('bankCharges', formData.bankCharges || '0');
      formDataToSend.append('interestEarned', formData.interestEarned || '0');
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append('currencyExchangeRate', formData.currencyExchangeRate || '1');
      formDataToSend.append('referenceNumber', formData.referenceNumber || '');
      formDataToSend.append('notes', formData.notes || '');

      formData.entries.forEach((entry, index) => {
        formDataToSend.append(`entries[${index}][statementDate]`, entry.statementDate);
        formDataToSend.append(`entries[${index}][statementDescription]`, entry.statementDescription || '');
        formDataToSend.append(`entries[${index}][statementAmount]`, entry.statementAmount || '0');
        formDataToSend.append(`entries[${index}][statementType]`, entry.statementType || 'credit');
        formDataToSend.append(`entries[${index}][statementReference]`, entry.statementReference || '');
        formDataToSend.append(`entries[${index}][status]`, entry.status || 'unmatched');
      });

      if (attachment) {
        formDataToSend.append('attachment', attachment);
      }

      await userRequest.post('/reconcile-bank-accounts-vouchers', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Reconcile Bank Accounts Voucher created successfully');
      queryClient.invalidateQueries(['reconcile-bank-accounts-vouchers']);
      onBack();
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast.error(
        error.response?.data?.message || 'Failed to create reconcile bank accounts voucher'
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

  // Calculate difference
  const difference = parseFloat(formData.statementBalance || 0) - parseFloat(formData.bookBalance || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 shadow-lg">
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
                  <FaExchangeAlt className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Create Reconcile Bank Accounts Voucher
                  </h1>
                  <p className="text-teal-100 text-sm md:text-base mt-1">
                    Reconcile bank account statements with book records
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-white text-xs font-medium">New Reconciliation</p>
                <p className="text-teal-100 text-sm font-semibold">
                  {difference === 0 ? 'Balanced' : `Difference: ${difference.toFixed(2)}`}
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
                      <div className="bg-teal-100 p-2 rounded-lg">
                        <FaPlus className="text-teal-600 text-xl" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          New Bank Reconciliation Entry
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
                      <FaCalendarAlt className="text-teal-500" />
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
                            textValue={account.accountName || account.name}
                          >
                            {account.accountName || account.name} - {account.accountNumber}
                          </SelectItem>
                        ))}
                      </Select>
                      <Input
                        isRequired
                        type="datetime-local"
                        label="Statement Date"
                        name="statementDate"
                        value={formData.statementDate}
                        onChange={handleChange}
                        labelPlacement="outside"
                      />
                      <Input
                        label="Statement Number"
                        name="statementNumber"
                        value={formData.statementNumber}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="e.g., STMT-2024-01"
                      />
                    </div>
                  </div>

                  {/* Balance Information */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaMoneyBillWave className="text-teal-500" />
                      Balance Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="number"
                        label="Opening Balance"
                        name="openingBalance"
                        value={formData.openingBalance}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="Closing Balance"
                        name="closingBalance"
                        value={formData.closingBalance}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="Book Balance"
                        name="bookBalance"
                        value={formData.bookBalance}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="0.00"
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="Statement Balance"
                        name="statementBalance"
                        value={formData.statementBalance}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Outstanding Items */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Outstanding Items
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="number"
                        label="Outstanding Deposits"
                        name="outstandingDeposits"
                        value={formData.outstandingDeposits}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="Outstanding Withdrawals"
                        name="outstandingWithdrawals"
                        value={formData.outstandingWithdrawals}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="Outstanding Checks"
                        name="outstandingChecks"
                        value={formData.outstandingChecks}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="Bank Charges"
                        name="bankCharges"
                        value={formData.bankCharges}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      <Input
                        type="number"
                        label="Interest Earned"
                        name="interestEarned"
                        value={formData.interestEarned}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Statement Entries */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaBook className="text-teal-500" />
                      Statement Entries
                    </h2>
                    <div className="mb-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                      <div className="flex items-start gap-2">
                        <FaInfoCircle className="text-teal-600 mt-1" />
                        <div className="text-sm text-teal-800">
                          <p className="font-semibold mb-1">Statement Entries:</p>
                          <p>Add all transactions from the bank statement that need to be reconciled.</p>
                        </div>
                      </div>
                    </div>

                    {formData.entries.map((entry, index) => (
                      <Card key={index} className="mb-4 p-4 border-l-4 border-teal-400 shadow-sm">
                        <CardBody>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-md font-semibold text-gray-800">Entry {index + 1}</h3>
                            {formData.entries.length > 1 && (
                              <Button
                                isIconOnly
                                color="danger"
                                variant="light"
                                size="sm"
                                onPress={() => removeEntry(index)}
                              >
                                <FaTrash />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <Input
                              type="datetime-local"
                              label="Statement Date"
                              name="statementDate"
                              value={entry.statementDate}
                              onChange={(e) =>
                                handleEntryChange(index, 'statementDate', e.target.value)
                              }
                              labelPlacement="outside"
                            />
                            <Input
                              label="Statement Description"
                              name="statementDescription"
                              value={entry.statementDescription}
                              onChange={(e) =>
                                handleEntryChange(index, 'statementDescription', e.target.value)
                              }
                              labelPlacement="outside"
                              placeholder="Enter description"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <Input
                              type="number"
                              label="Statement Amount"
                              name="statementAmount"
                              value={entry.statementAmount}
                              onChange={(e) =>
                                handleEntryChange(index, 'statementAmount', e.target.value)
                              }
                              labelPlacement="outside"
                              placeholder="0.00"
                              step="0.01"
                            />
                            <Select
                              label="Statement Type"
                              name="statementType"
                              selectedKeys={entry.statementType ? [entry.statementType] : []}
                              onSelectionChange={(keys) =>
                                handleEntryChange(index, 'statementType', Array.from(keys)[0] || 'credit')
                              }
                              labelPlacement="outside"
                            >
                              <SelectItem key="credit" value="credit">Credit</SelectItem>
                              <SelectItem key="debit" value="debit">Debit</SelectItem>
                            </Select>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Statement Reference"
                              name="statementReference"
                              value={entry.statementReference}
                              onChange={(e) =>
                                handleEntryChange(index, 'statementReference', e.target.value)
                              }
                              labelPlacement="outside"
                              placeholder="Enter reference"
                            />
                            <Select
                              label="Status"
                              name="status"
                              selectedKeys={entry.status ? [entry.status] : []}
                              onSelectionChange={(keys) =>
                                handleEntryChange(index, 'status', Array.from(keys)[0] || 'unmatched')
                              }
                              labelPlacement="outside"
                            >
                              <SelectItem key="unmatched" value="unmatched">Unmatched</SelectItem>
                              <SelectItem key="matched" value="matched">Matched</SelectItem>
                              <SelectItem key="reconciled" value="reconciled">Reconciled</SelectItem>
                            </Select>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                    <Button
                      color="secondary"
                      variant="flat"
                      onPress={addEntry}
                      startContent={<FaPlus />}
                      className="mt-4"
                    >
                      Add Another Entry
                    </Button>
                  </div>

                  {/* Currency Information */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaMoneyBillWave className="text-teal-500" />
                      Currency Information
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
                        label="Currency Exchange Rate"
                        name="currencyExchangeRate"
                        value={formData.currencyExchangeRate}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="1.00"
                        min="0"
                        step="0.0001"
                        description="Default: 1.00"
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Additional Information
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        label="Reference Number"
                        name="referenceNumber"
                        value={formData.referenceNumber}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="Enter reference number (optional)"
                      />
                      <Textarea
                        label="Notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="Enter notes (optional)"
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
                          className="cursor-pointer inline-block px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
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
                            <div className="bg-teal-100 p-2 rounded">
                              <FaFileUpload className="text-teal-600" />
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
                      className="bg-gradient-to-r from-teal-500 to-cyan-600"
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
                    <p className="text-sm text-gray-600 mb-1">Book Balance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {parseFloat(formData.bookBalance || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Statement Balance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {parseFloat(formData.statementBalance || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${
                      difference === 0 ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">Difference</p>
                    <p
                      className={`text-xl font-bold ${
                        difference === 0 ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {difference === 0 ? 'Balanced ✓' : `${difference.toFixed(2)} ✗`}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Entries Count</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formData.entries.length}
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

export default ReconcileBankAccountsVoucher;

