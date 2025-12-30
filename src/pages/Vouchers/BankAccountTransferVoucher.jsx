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
  FaInfoCircle,
  FaCalendarAlt,
  FaExchangeAlt,
  FaMoneyBillWave,
  FaUniversity,
  FaFileInvoice,
} from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from 'react-query';

const BankAccountTransferVoucher = ({ onBack }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  const [formData, setFormData] = useState({
    voucherDate: new Date().toISOString().split('T')[0],
    voucherType: 'transfer',
    fromBankAccount: '',
    toBankAccount: '',
    amount: '',
    currency: '',
    currencyExchangeRate: '1',
    transferMethod: '',
    transferFee: '',
    referenceNumber: '',
    fromBankTransactionId: '',
    toBankTransactionId: '',
    purpose: '',
    description: '',
    notes: '',
    relatedPurchase: '',
    relatedBankPaymentVoucher: '',
    relatedSale: '',
    relatedPayment: '',
    relatedSupplierPayment: '',
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
      return res.data?.data?.vouchers || res.data?.data || [];
    } catch (error) {
      console.error('Error fetching bank payment vouchers:', error);
      return [];
    }
  };

  const { data: bankAccounts = [], isLoading: isLoadingBanks } = useQuery(
    ['bank-accounts'],
    fetchBankAccounts
  );
  const { data: currencies = [], isLoading: isLoadingCurrencies } = useQuery(
    ['currencies'],
    fetchCurrencies
  );
  const { data: purchases = [] } = useQuery(['purchases'], fetchPurchases);
  const { data: sales = [] } = useQuery(['sales'], fetchSales);
  const { data: bankPaymentVouchers = [] } = useQuery(
    ['bank-payment-vouchers'],
    fetchBankPaymentVouchers
  );

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    if (!formData.fromBankAccount) {
      toast.error('Please select a source bank account');
      return;
    }

    if (!formData.toBankAccount) {
      toast.error('Please select a destination bank account');
      return;
    }

    if (formData.fromBankAccount === formData.toBankAccount) {
      toast.error('Source and destination bank accounts must be different');
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
      formDataToSend.append('voucherDate', formData.voucherDate);
      formDataToSend.append('voucherType', formData.voucherType);
      formDataToSend.append('fromBankAccount', formData.fromBankAccount);
      formDataToSend.append('toBankAccount', formData.toBankAccount);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append('currencyExchangeRate', formData.currencyExchangeRate || '1');
      
      if (formData.transferMethod) {
        formDataToSend.append('transferMethod', formData.transferMethod);
      }
      if (formData.transferFee) {
        formDataToSend.append('transferFee', formData.transferFee || '0');
      }
      if (formData.referenceNumber) {
        formDataToSend.append('referenceNumber', formData.referenceNumber);
      }
      if (formData.fromBankTransactionId) {
        formDataToSend.append('fromBankTransactionId', formData.fromBankTransactionId);
      }
      if (formData.toBankTransactionId) {
        formDataToSend.append('toBankTransactionId', formData.toBankTransactionId);
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
      if (formData.relatedBankPaymentVoucher) {
        formDataToSend.append('relatedBankPaymentVoucher', formData.relatedBankPaymentVoucher);
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

      if (attachment) {
        formDataToSend.append('attachment', attachment);
      }

      await userRequest.post('/bank-account-transfer-vouchers', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Bank Account Transfer Voucher created successfully');
      queryClient.invalidateQueries(['bank-account-transfer-vouchers']);
      onBack();
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast.error(
        error.response?.data?.message || 'Failed to create bank account transfer voucher'
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
                    Create Bank Account Transfer Voucher
                  </h1>
                  <p className="text-teal-100 text-sm md:text-base mt-1">
                    Transfer funds between bank accounts
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-white text-xs font-medium">New Transfer</p>
                <p className="text-teal-100 text-sm font-semibold">
                  {formData.amount ? `${parseFloat(formData.amount || 0).toLocaleString()}` : '0.00'}
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
                          New Bank Transfer Entry
                        </h2>
                        <p className="text-sm text-gray-600">
                          Fill in all required information to create the transfer voucher
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

                  {/* Bank Accounts */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaUniversity className="text-teal-500" />
                      Bank Accounts
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        isRequired
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
                        placeholder="Select source bank account"
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
                        isRequired
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
                        placeholder="Select destination bank account"
                        isLoading={isLoadingBanks}
                      >
                        {bankAccounts
                          .filter((account) => account._id !== formData.fromBankAccount)
                          .map((account) => (
                            <SelectItem
                              key={account._id}
                              value={account._id}
                              textValue={account.accountName || account.name}
                            >
                              {account.accountName || account.name} - {account.accountNumber}
                            </SelectItem>
                          ))}
                      </Select>
                    </div>
                  </div>

                  {/* Transfer Details */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaMoneyBillWave className="text-teal-500" />
                      Transfer Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Select
                        label="Transfer Method"
                        name="transferMethod"
                        selectedKeys={formData.transferMethod ? [formData.transferMethod] : []}
                        onSelectionChange={(keys) => {
                          const selected = Array.from(keys)[0] || '';
                          setFormData((prev) => ({
                            ...prev,
                            transferMethod: selected,
                          }));
                        }}
                        labelPlacement="outside"
                        placeholder="Select transfer method"
                      >
                        <SelectItem key="bank_transfer" value="bank_transfer">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem key="wire_transfer" value="wire_transfer">
                          Wire Transfer
                        </SelectItem>
                        <SelectItem key="online_transfer" value="online_transfer">
                          Online Transfer
                        </SelectItem>
                        <SelectItem key="rtgs" value="rtgs">
                          RTGS
                        </SelectItem>
                        <SelectItem key="neft" value="neft">
                          NEFT
                        </SelectItem>
                        <SelectItem key="other" value="other">
                          Other
                        </SelectItem>
                      </Select>
                      <Input
                        type="number"
                        label="Transfer Fee"
                        name="transferFee"
                        value={formData.transferFee}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Transaction IDs */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <FaFileInvoice className="text-teal-500" />
                      Transaction Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="From Bank Transaction ID"
                        name="fromBankTransactionId"
                        value={formData.fromBankTransactionId}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="Enter transaction ID from source bank"
                      />
                      <Input
                        label="To Bank Transaction ID"
                        name="toBankTransactionId"
                        value={formData.toBankTransactionId}
                        onChange={handleChange}
                        labelPlacement="outside"
                        placeholder="Enter transaction ID from destination bank"
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
                        placeholder="Enter transfer purpose"
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
                    <p className="text-sm text-gray-600 mb-1">Transfer Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {parseFloat(formData.amount || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  {formData.transferFee && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Transfer Fee</p>
                      <p className="text-xl font-bold text-gray-900">
                        {parseFloat(formData.transferFee || 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  )}
                  <div className="p-4 bg-teal-50 rounded-lg">
                    <p className="text-sm font-medium mb-1">Net Amount</p>
                    <p className="text-xl font-bold text-teal-700">
                      {(parseFloat(formData.amount || 0) - parseFloat(formData.transferFee || 0)).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
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

export default BankAccountTransferVoucher;

