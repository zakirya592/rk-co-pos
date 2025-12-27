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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              isIconOnly
              variant="light"
              onPress={() => (onBack ? onBack() : navigate('/vouchers'))}
              startContent={<FaArrowLeft />}
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Update Bank Payment Voucher
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Edit bank payment voucher details
              </p>
            </div>
          </div>
        </div>

        {/* Form Card - Same structure as create form */}
        <Card className="shadow-xl border-0">
          <CardBody className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
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
                    <SelectItem key="online" value="online">
                      Online
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
              <div className="flex justify-end gap-4">
                <Button
                  variant="flat"
                  onPress={() => (onBack ? onBack() : navigate('/vouchers'))}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={isSubmitting}
                  startContent={!isSubmitting && <FaSave />}
                >
                  {isSubmitting ? 'Updating...' : 'Update Voucher'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default UpdateBankPaymentVoucher;

