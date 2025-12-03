import React, { useState, useEffect } from 'react'
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Spinner,
  Chip,
  Divider,
  Autocomplete,
  AutocompleteItem
} from '@nextui-org/react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa'
import userRequest from '../../utils/userRequest'
import toast from 'react-hot-toast'

const AddPurchase = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [currencies, setCurrencies] = useState([])
  const [bankAccounts, setBankAccounts] = useState([])
  const [transactionReceipt, setTransactionReceipt] = useState(null)
  // Form state
  const [formData, setFormData] = useState({
    supplier: '',
    warehouse: '',
    currency: 'PKR',
    items: [
      {
        product: '',
        quantity: '',
        purchaseRate: '',
        retailRate: '',
        wholesaleRate: ''
      }
    ],
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: ''
  })

  // Multiple payments state
  const [payments, setPayments] = useState([
    {
      method: 'cash',
      amount: '',
      bankAccount: ''
    }
  ])

  // Fetch all necessary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch products
        const productsRes = await userRequest.get('/products?limit=1000')
        setProducts(productsRes.data.data || [])

        // Fetch suppliers
        const suppliersRes = await userRequest.get('/suppliers')
        setSuppliers(suppliersRes.data || [])

        // Fetch warehouses
        const warehousesRes = await userRequest.get('/warehouses')
        setWarehouses(warehousesRes.data.data || [])

        // Fetch currencies
        const currenciesRes = await userRequest.get('/currencies')
        setCurrencies(currenciesRes.data.data || [])

        // Fetch bank accounts
        const bankAccountsRes = await userRequest.get('/bank-accounts')
        setBankAccounts(bankAccountsRes.data.data?.bankAccounts || [])
      } catch (error) {
        toast.error('Failed to load required data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle input changes
  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Handle item changes
  const handleItemChange = (index, e) => {
    const { name, value } = e.target
    const updatedItems = [...formData.items]
    updatedItems[index] = {
      ...updatedItems[index],
      [name]: value
    }

    setFormData({
      ...formData,
      items: updatedItems
    })
  }

  // Add new item row
  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product: '',
          quantity: '',
          purchaseRate: '',
          retailRate: '',
          wholesaleRate: ''
        }
      ]
    })
  }

  // Remove item row
  const removeItemRow = index => {
    if (formData.items.length === 1) return

    const updatedItems = [...formData.items]
    updatedItems.splice(index, 1)

    setFormData({
      ...formData,
      items: updatedItems
    })
  }

  // Calculate total paid amount from all payments
  const calculateTotalPaid = () => {
    return payments.reduce((sum, payment) => {
      return sum + (parseFloat(payment.amount) || 0);
    }, 0);
  };

  // Calculate remaining balance
  const calculateRemainingBalance = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.purchaseRate) || 0;
      return sum + (quantity * rate);
    }, 0);
    return subtotal - calculateTotalPaid();
  };

  // Handle payment changes
  const handlePaymentChange = (index, field, value) => {
    const updatedPayments = [...payments];
    updatedPayments[index] = {
      ...updatedPayments[index],
      [field]: value,
      // Reset bankAccount when method changes away from bank/online
      ...(field === 'method' && value !== 'bank' && value !== 'online' 
        ? { bankAccount: '' } 
        : {})
    };
    setPayments(updatedPayments);
  };

  // Add new payment method
  const addPaymentMethod = () => {
    setPayments([
      ...payments,
      {
        method: 'cash',
        amount: '',
        bankAccount: ''
      }
    ]);
  };

  // Remove payment method
  const removePaymentMethod = (index) => {
    if (payments.length === 1) return;
    const updatedPayments = payments.filter((_, i) => i !== index);
    setPayments(updatedPayments);
  };

  // Map payment method to supplier-payments API format
  const mapPaymentMethod = (method) => {
    const methodMap = {
      'cash': 'cash',
      'bank': 'bank_transfer',
      'credit': 'credit_card',
      'check': 'bank_transfer',
      'online': 'online_payment',
      'mobile': 'mobile_payment'
    };
    return methodMap[method] || 'cash';
  };

  // Handle file change for transaction receipt
  const handleReceiptChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setTransactionReceipt(file)
    }
  }

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault()

    // Validate payments
    const validPayments = payments.filter(p => p.amount && parseFloat(p.amount) > 0);
    if (validPayments.length === 0) {
      toast.error('Please add at least one payment method with amount');
      return;
    }

    // Validate bank accounts for bank/online methods
    for (const payment of validPayments) {
      if ((payment.method === 'bank' || payment.method === 'online') && !payment.bankAccount) {
        toast.error(`Please select a bank account for ${payment.method} payment`);
        return;
      }
    }

    // Calculate remaining balance
    const remainingBalance = calculateRemainingBalance();
    
    // Prepare FormData for multipart request
    const formDataToSend = new FormData()
    
    // Append basic form fields
    formDataToSend.append('supplier', formData.supplier)
    if (formData.warehouse) {
      formDataToSend.append('warehouse', formData.warehouse)
    }
    if (formData.currency) {
      formDataToSend.append('currency', formData.currency)
    }
    formDataToSend.append('purchaseDate', formData.purchaseDate)
    if (formData.notes) {
      formDataToSend.append('notes', formData.notes)
    }
    
    // Append items as JSON string
    formDataToSend.append('items', JSON.stringify(
      formData.items.map(item => ({
        product: item.product,
        quantity: Number(item.quantity),
        purchaseRate: Number(item.purchaseRate),
        retailRate: Number(item.retailRate),
        wholesaleRate: Number(item.wholesaleRate)
      }))
    ))
    
    // Append payments array (multiple payment methods)
    const paymentsArray = validPayments.map(payment => {
      const paymentObj = {
        method: payment.method,
        amount: parseFloat(payment.amount)
      };
      if (payment.bankAccount && (payment.method === 'bank' || payment.method === 'online')) {
        paymentObj.bankAccount = payment.bankAccount;
      }
      return paymentObj;
    });
    formDataToSend.append('payments', JSON.stringify(paymentsArray));
    
    // Append transaction receipt if exists
    if (transactionReceipt) {
      formDataToSend.append('transactionReceipt', transactionReceipt)
    }

    try {
      setIsSubmitting(true)
      
      // Create the purchase with multipart/form-data
      const purchaseResponse = await userRequest.post('/purchases', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (purchaseResponse.data.status === 'success') {
        // Create supplier payments for each payment method
        const totalPaid = calculateTotalPaid();
        if (totalPaid > 0) {
          // Create a single supplier payment record with total amount
          // You can modify this to create multiple payment records if needed
          const paymentData = {
            supplier: formData.supplier,
            amount: totalPaid,
            paymentMethod: mapPaymentMethod(validPayments[0].method), // Use first payment method
            status: remainingBalance <= 0 ? "completed" : "partial",
            notes:
              formData.notes ||
              `Payment for purchase #${purchaseResponse.data.data._id}`,
            currency: formData.currency,
          };

          await userRequest.post('/supplier-payments', paymentData)
        }

        toast.success('Purchase and payment processed successfully!')
        navigate('/purchases')
      } else {
        throw new Error(purchaseResponse.data.message || 'Failed to create purchase')
      }
    } catch (error) {
      console.error('Error processing purchase:', error)
      toast.error(error.response?.data?.message || 'Failed to process purchase')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Spinner size='lg' />
      </div>
    )
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between">
          <div className="flex items-center mb-6">
            <Button
              isIconOnly
              variant="light"
              className="mr-2"
              onPress={() => navigate(-1)}
            >
              <FaArrowLeft />
            </Button>
            <h1 className="text-2xl font-bold">Add New Purchase</h1>
          </div>
          <div className="flex justify-end gap-4">
            <Button
              variant="flat"
              onPress={() => navigate('/Navigation')}
              isDisabled={isSubmitting}
            >
              Dashboard
            </Button>
            <Button
              variant="flat"
              onPress={() => navigate(-1)}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Purchase"}
            </Button>
          </div>
        </div>
        <Card className="mb-4">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Select
                label="Supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                isRequired
                labelPlacement="outside"
                placeholder="Select Supplier"
              >
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Warehouse"
                name="warehouse"
                value={formData.warehouse}
                onChange={handleInputChange}
                placeholder="Select Warehous"
                labelPlacement="outside"
              >
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse._id} value={warehouse._id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Currency"
                name="currency"
                labelPlacement="outside"
                selectedKeys={formData.currency ? [formData.currency] : []}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, currency: e.target.value }))
                }
                placeholder="Select currency"
                isLoading={isLoading}
              >
                {currencies.map((currency) => (
                  <SelectItem
                    key={currency._id}
                    value={currency._id}
                    textValue={`${currency.name} ${currency.symbol}`}
                  >
                    {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </Select>


              <Input
                type="date"
                label="Purchase Date"
                placeholder="Purchase Date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleInputChange}
                labelPlacement="outside"
              />
            </div>

            <Divider className="my-6" />

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Items</h2>
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<FaPlus />}
                  onPress={addItemRow}
                >
                  Add Item
                </Button>
              </div>

              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 items-end"
                >
                  <Select
                    label="Product"
                    name="product"
                    value={item.product}
                    onChange={(e) => handleItemChange(index, e)}
                    labelPlacement="outside"
                    placeholder="Select product"
                    isRequired
                  >
                    {products.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    type="number"
                    label="Quantity"
                    name="quantity"
                    value={item.quantity}
                    placeholder="Enter quantity"
                    onChange={(e) => handleItemChange(index, e)}
                    min="1"
                    isRequired
                    labelPlacement="outside"
                  />

                  <Input
                    type="number"
                    label="Purchase Rate"
                    isRequired
                    placeholder="Enter Purchase Rate"
                    name="purchaseRate"
                    value={item.purchaseRate}
                    onChange={(e) => handleItemChange(index, e)}
                    min="0"
                    step="0.01"
                    labelPlacement="outside"
                  />

                  <Input
                    type="number"
                    label="Retail Rate"
                    name="retailRate"
                    placeholder="Enter Retail Rate"
                    isRequired
                    value={item.retailRate}
                    onChange={(e) => handleItemChange(index, e)}
                    min="0"
                    step="0.01"
                    labelPlacement="outside"
                  />

                  <Input
                    type="number"
                    label="Wholesale Rate"
                    name="wholesaleRate"
                    isRequired
                    placeholder="Enter Wholesale Rate"
                    value={item.wholesaleRate}
                    onChange={(e) => handleItemChange(index, e)}
                    min="0"
                    step="0.01"
                    labelPlacement="outside"
                  />

                  <Button
                    isIconOnly
                    color="danger"
                    variant="light"
                    onPress={() => removeItemRow(index)}
                    isDisabled={formData.items.length === 1}
                  >
                    <FaTrash />
                  </Button>
                </div>
              ))}
            </div>

            <Divider className="my-6" />

            {/* Payment Methods Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Payment Methods</h2>
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<FaPlus />}
                  onPress={addPaymentMethod}
                >
                  Add Payment Method
                </Button>
              </div>

              <div className="space-y-4">
                {payments.map((payment, index) => (
                  <Card key={index} className="p-4">
                    <CardBody className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4">
                          <Select
                            label="Payment Method"
                            placeholder="Select payment method"
                            labelPlacement="outside"
                            selectedKeys={[payment.method]}
                            onChange={(e) => handlePaymentChange(index, 'method', e.target.value)}
                          >
                            <SelectItem key="cash" value="cash">
                              Cash
                            </SelectItem>
                            <SelectItem key="bank" value="bank">
                              Bank Transfer
                            </SelectItem>
                            <SelectItem key="credit" value="credit">
                              Credit
                            </SelectItem>
                            <SelectItem key="check" value="check">
                              Check
                            </SelectItem>
                            <SelectItem key="online" value="online">
                              Online
                            </SelectItem>
                          </Select>
                        </div>

                        <div className="md:col-span-3">
                          <Input
                            type="number"
                            label="Amount"
                            placeholder="Enter amount"
                            labelPlacement="outside"
                            value={payment.amount}
                            onChange={(e) => handlePaymentChange(index, 'amount', e.target.value)}
                            min="0"
                            step="0.01"
                            isRequired
                          />
                        </div>

                        {(payment.method === 'bank' || payment.method === 'online') && (
                          <div className="md:col-span-4">
                            <Select
                              label="Bank Account"
                              placeholder="Select bank account"
                              labelPlacement="outside"
                              selectedKeys={payment.bankAccount ? new Set([payment.bankAccount]) : new Set()}
                              onSelectionChange={(keys) => {
                                const selectedKey = Array.from(keys)[0]
                                handlePaymentChange(index, 'bankAccount', selectedKey || '')
                              }}
                              isRequired
                            >
                              {bankAccounts.map((account) => {
                                const displayText = `${account.bankName} - ${account.accountName} (${account.branchCode})`
                                return (
                                  <SelectItem 
                                    key={account._id} 
                                    value={account._id}
                                    textValue={displayText}
                                  >
                                    {displayText}
                                  </SelectItem>
                                )
                              })}
                            </Select>
                          </div>
                        )}

                        <div className="md:col-span-1">
                          <Button
                            isIconOnly
                            color="danger"
                            variant="light"
                            onPress={() => removePaymentMethod(index)}
                            isDisabled={payments.length === 1}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>

            <Divider className="my-6" />

            {/* Summary Section */}
            <Card className="mb-6">
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
                <div className="flex flex-col gap-3">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">
                      {formData.items
                        .reduce((sum, item) => {
                          const quantity = parseFloat(item.quantity) || 0;
                          const rate = parseFloat(item.purchaseRate) || 0;
                          return sum + quantity * rate;
                        }, 0)
                        .toFixed(2)}
                    </span>
                  </div>

                  {/* Total Paid Amount */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Paid:</span>
                    <span className="font-semibold text-green-600">
                      {calculateTotalPaid().toFixed(2)}
                    </span>
                  </div>

                  {/* Payment Breakdown */}
                  {payments.filter(p => p.amount && parseFloat(p.amount) > 0).length > 0 && (
                    <div className="mt-2 pt-3 border-t">
                      <p className="text-sm text-gray-500 mb-2">Payment Breakdown:</p>
                      {payments
                        .filter(p => p.amount && parseFloat(p.amount) > 0)
                        .map((payment, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm mb-1">
                            <span className="text-gray-500 capitalize">
                              {payment.method}:
                            </span>
                            <span className="font-medium">
                              {parseFloat(payment.amount || 0).toFixed(2)}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Remaining Balance */}
                  <div className="flex justify-between items-center border-t pt-3 mt-2">
                    <span className="text-gray-800 font-semibold">
                      Remaining Balance:
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        calculateRemainingBalance() > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {calculateRemainingBalance().toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Transaction Receipt Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Receipt (Optional)
              </label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={handleReceiptChange}
                className="cursor-pointer"
              />
              {transactionReceipt && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {transactionReceipt.name}
                </p>
              )}
            </div>

            <Divider className="my-6" />

            <div className="mb-6">
              <Textarea
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter any additional notes"
                labelPlacement="outside"
                minRows={3}
              />
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  );
}

export default AddPurchase
