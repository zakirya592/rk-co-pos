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
} from '@nextui-org/react';
import {
  FaArrowLeft,
  FaFileUpload,
  FaTimes,
  FaSave,
  FaEdit,
  FaPlus,
  FaTrash,
  FaInfoCircle,
  FaCalendarAlt,
  FaBook,
  FaMoneyBillWave,
  FaBalanceScale,
} from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from 'react-query';

const UpdateOpeningBalanceVoucher = ({ voucherId, onBack }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const actualId = voucherId || id;
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [voucherInfo, setVoucherInfo] = useState(null);

  const [formData, setFormData] = useState({
    voucherDate: new Date().toISOString().split('T')[0],
    financialYear: '',
    periodStartDate: '',
    periodEndDate: '',
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
    description: '',
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
        `Debits (${totalDebit.toFixed(2)}) must equal Credits (${totalCredit.toFixed(2)})`
      );
      return false;
    }
    return true;
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

    if (!validateEntries()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('voucherDate', formData.voucherDate);
      formDataToSend.append('financialYear', formData.financialYear);
      formDataToSend.append('periodStartDate', formData.periodStartDate);
      formDataToSend.append('periodEndDate', formData.periodEndDate);
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append('currencyExchangeRate', formData.currencyExchangeRate || '1');
      formDataToSend.append('referenceNumber', formData.referenceNumber || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('notes', formData.notes || '');
      formDataToSend.append('status', formData.status || 'draft');

      formData.entries.forEach((entry, index) => {
        formDataToSend.append(`entries[${index}][account]`, entry.account);
        formDataToSend.append(`entries[${index}][accountModel]`, entry.accountModel);
        formDataToSend.append(`entries[${index}][accountName]`, entry.accountName);
        formDataToSend.append(`entries[${index}][debit]`, entry.debit || '0');
        formDataToSend.append(`entries[${index}][credit]`, entry.credit || '0');
        if (entry.description) {
          formDataToSend.append(`entries[${index}][description]`, entry.description);
        }
      });

      if (attachment) {
        formDataToSend.append('attachment', attachment);
      }

      await userRequest.put(`/opening-balance-vouchers/${actualId}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Opening Balance Voucher updated successfully');
      queryClient.invalidateQueries(['opening-balance-vouchers']);
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
                    Update Opening Balance Voucher
                  </h1>
                  <p className="text-amber-100 text-sm md:text-base mt-1">
                    {voucherInfo?.voucherNumber || voucherInfo?.referCode || 'Edit opening balance entry'} • Debits must equal Credits
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-white text-xs font-medium">Update Entry</p>
                <p className="text-amber-100 text-sm font-semibold">
                  {hasEntriesWithValues ? (isBalanced ? 'Balanced' : 'Unbalanced') : 'Ready'}
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
                        <FaEdit className="text-amber-600 text-xl" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Edit Opening Balance Entry
                        </h2>
                        <p className="text-sm text-gray-600">
                          Update the voucher information below
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
                      <Input
                        isRequired
                        label="Financial Year"
                        name="financialYear"
                        value={formData.financialYear}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="e.g., 2024-2025"
                        description="Format: YYYY-YYYY"
                      />
                      <Input
                        isRequired
                        type="number"
                        label="Period Start Date"
                        name="periodStartDate"
                        value={formData.periodStartDate}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="e.g., 2024"
                        description="Year (YYYY)"
                      />
                      <Input
                        isRequired
                        type="number"
                        label="Period End Date"
                        name="periodEndDate"
                        value={formData.periodEndDate}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="e.g., 2027"
                        description="Year (YYYY)"
                      />
                    </div>
                  </div>

                  {/* Currency Information */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaMoneyBillWave className="text-amber-500" />
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

                  {/* Journal Entries */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaBook className="text-amber-500" />
                      Journal Entries
                    </h2>
                    <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start gap-2">
                        <FaInfoCircle className="text-amber-600 mt-1" />
                        <div className="text-sm text-amber-800">
                          <p className="font-semibold mb-1">Important:</p>
                          <p>Each entry must have either a debit OR credit amount (not both).</p>
                          <p>Total debits must equal total credits.</p>
                        </div>
                      </div>
                    </div>

                    {formData.entries.map((entry, index) => (
                      <Card key={index} className="mb-4 p-4 border-l-4 border-amber-400 shadow-sm">
                        <CardBody>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-md font-semibold text-gray-800">Entry {index + 1}</h3>
                            {formData.entries.length > 2 && (
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
                            <Select
                              isRequired
                              label="Account Type"
                              name="accountModel"
                              selectedKeys={entry.accountModel ? [entry.accountModel] : []}
                              onSelectionChange={(keys) =>
                                handleEntryChange(index, 'accountModel', Array.from(keys)[0] || '')
                              }
                              labelPlacement="outside"
                              placeholder="Select account type"
                            >
                              <SelectItem key="BankAccount" value="BankAccount">
                                Bank Account
                              </SelectItem>
                              <SelectItem key="Supplier" value="Supplier">
                                Supplier
                              </SelectItem>
                              <SelectItem key="Customer" value="Customer">
                                Customer
                              </SelectItem>
                            </Select>
                            <Select
                              isRequired
                              label={`Select ${entry.accountModel || 'Account'}`}
                              name="account"
                              selectedKeys={entry.account ? [entry.account] : []}
                              onSelectionChange={(keys) =>
                                handleEntryChange(index, 'account', Array.from(keys)[0] || '')
                              }
                              labelPlacement="outside"
                              placeholder={`Select ${entry.accountModel || 'account'}`}
                              isDisabled={!entry.accountModel}
                            >
                              {getAccountOptions(entry.accountModel).map((acc) => (
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
                            value={entry.accountName}
                            onChange={(e) =>
                              handleEntryChange(index, 'accountName', e.target.value)
                            }
                            labelPlacement="outside"
                            placeholder="Auto-filled or enter account name"
                            description="This field is auto-filled based on account selection"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <Input
                              type="number"
                              label="Debit"
                              name="debit"
                              value={entry.debit}
                              onChange={(e) =>
                                handleEntryChange(index, 'debit', e.target.value)
                              }
                              labelPlacement="outside"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              isDisabled={parseFloat(entry.credit) > 0}
                            />
                            <Input
                              type="number"
                              label="Credit"
                              name="credit"
                              value={entry.credit}
                              onChange={(e) =>
                                handleEntryChange(index, 'credit', e.target.value)
                              }
                              labelPlacement="outside"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              isDisabled={parseFloat(entry.debit) > 0}
                            />
                          </div>
                          <Textarea
                            label="Description"
                            name="description"
                            value={entry.description}
                            onChange={(e) =>
                              handleEntryChange(index, 'description', e.target.value)
                            }
                            labelPlacement="outside"
                            placeholder="Enter description for this entry (optional)"
                            className="mt-4"
                          />
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

                  {/* Reference and Description */}
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
                      <Select
                        label="Status"
                        name="status"
                        selectedKeys={formData.status ? [formData.status] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || '';
                          setFormData((prev) => ({
                            ...prev,
                            status: selected,
                          }));
                        }}
                        labelPlacement="outside"
                      >
                        <SelectItem key="draft" value="draft">Draft</SelectItem>
                        <SelectItem key="pending" value="pending">Pending</SelectItem>
                        <SelectItem key="approved" value="approved">Approved</SelectItem>
                        <SelectItem key="completed" value="completed">Completed</SelectItem>
                        <SelectItem key="cancelled" value="cancelled">Cancelled</SelectItem>
                        <SelectItem key="rejected" value="rejected">Rejected</SelectItem>
                      </Select>
                      <Textarea
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="Enter description (optional)"
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
                      isDisabled={shouldDisableButton}
                    >
                      {isSubmitting ? 'Updating...' : 'Update Voucher'}
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
                    <p className="text-sm text-gray-600 mb-1">Total Debit</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalDebit.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Credit</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalCredit.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${
                      isBalanced ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">Balance Status</p>
                    <p
                      className={`text-xl font-bold ${
                        isBalanced ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {isBalanced ? 'Balanced ✓' : 'Unbalanced ✗'}
                    </p>
                    {!isBalanced && (
                      <p className="text-xs text-red-600 mt-1">
                        Difference: {Math.abs(totalDebit - totalCredit).toFixed(2)}
                      </p>
                    )}
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

export default UpdateOpeningBalanceVoucher;

