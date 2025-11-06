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
  const [amountpay, setamountpay] = useState('');
  const [bankAccount, setBankAccount] = useState('')
  const [transactionReceipt, setTransactionReceipt] = useState(null)
  // Form state
  const [formData, setFormData] = useState({
    supplier: '',
    warehouse: '',
    currency: 'PKR',
    paymentMethod: 'cash',
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

  // Reset bank fields when payment method changes away from bank
  useEffect(() => {
    if (formData.paymentMethod !== 'bank') {
      setBankAccount('')
      setTransactionReceipt(null)
    }
  }, [formData.paymentMethod])

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

  // Calculate remaining balance
  const calculateRemainingBalance = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.purchaseRate) || 0;
      return sum + (quantity * rate);
    }, 0);
    return subtotal - parseFloat(amountpay || 0);
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

    // Calculate remaining balance
    const remainingBalance = calculateRemainingBalance();
    
    // Prepare FormData for multipart request
    const formDataToSend = new FormData()
    
    // Append basic form fields
    formDataToSend.append('supplier', formData.supplier)
    formDataToSend.append('warehouse', formData.warehouse)
    formDataToSend.append('currency', formData.currency)
    formDataToSend.append('paymentMethod', formData.paymentMethod)
    formDataToSend.append('purchaseDate', formData.purchaseDate)
    if (formData.notes) {
      formDataToSend.append('notes', formData.notes)
    }
    
    // Append items as JSON string (or you can append each item separately)
    formDataToSend.append('items', JSON.stringify(
      formData.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        purchaseRate: Number(item.purchaseRate),
        retailRate: Number(item.retailRate),
        wholesaleRate: Number(item.wholesaleRate)
      }))
    ))
    
    // Append bank transfer specific fields if payment method is bank
    if (formData.paymentMethod === 'bank') {
      if (bankAccount) {
        formDataToSend.append('bankAccount', bankAccount)
      }
      if (transactionReceipt) {
        formDataToSend.append('transactionReceipt', transactionReceipt)
      }
    }

    try {
      setIsSubmitting(true)
      
      // First, create the purchase with multipart/form-data
      const purchaseResponse = await userRequest.post('/purchases', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (purchaseResponse.data.status === 'success') {
        // Prepare supplier payment data
        const paymentData = {
          supplier: formData.supplier,
          amount: parseFloat(amountpay || 0),
          paymentMethod: mapPaymentMethod(formData.paymentMethod),
          status: remainingBalance <= 0 ? "completed" : "partial",
          notes:
            formData.notes ||
            `Payment for purchase #${purchaseResponse.data.data._id}`,
          currency: formData.currency,
        };
        // products: formData.items.map((item) => ({
        //   product: item.product,
        //   quantity: Number(item.quantity),
        //   amount: Number(item.purchaseRate),
        // })),

        // Make the supplier payment if amount is greater than 0
        if (paymentData.amount > 0) {
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

              <Select
                label="Payment Method"
                placeholder="Select payment method"
                labelPlacement="outside"
                selectedKeys={[formData.paymentMethod]}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, paymentMethod: e.target.value }))
                }
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
                  check
                </SelectItem>
                <SelectItem key="online" value="online">
                  online
                </SelectItem>
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

            {/* Summary Section */}
            <div className="flex justify-between gap-3">
              <Input
                type="number"
                label="Amount"
                placeholder="Amount you pay"
                name="amount"
                labelPlacement="outside"
                value={amountpay}
                onChange={(e) => setamountpay(e.target.value)}
                isRequired
              />
            <div className="flex flex-col gap-4 mb-6 w-full">
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

              {/* Paid Amount */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Paid Amount:</span>
                <span className="font-semibold">
                  {parseFloat(amountpay || 0).toFixed(2)}
                </span>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center border-t pt-2 mt-2">
                <span className="text-gray-800 font-semibold">
                  Remaining Balance:
                </span>
                <span
                  className={`text-lg font-bold ${
                    formData.items.reduce((sum, item) => {
                      const quantity = parseFloat(item.quantity) || 0;
                      const rate = parseFloat(item.purchaseRate) || 0;
                      return sum + quantity * rate;
                    }, 0) -
                      parseFloat(amountpay || 0) >
                    0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {(
                    formData.items.reduce((sum, item) => {
                      const quantity = parseFloat(item.quantity) || 0;
                      const rate = parseFloat(item.purchaseRate) || 0;
                      return sum + quantity * rate;
                    }, 0) - parseFloat(amountpay || 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
            </div>

            {/* Bank Transfer specific fields */}
            {formData.paymentMethod === 'bank' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-6">
                <Select
                  label="Bank Account"
                  placeholder="Select bank account"
                  labelPlacement="outside"
                  selectedKeys={bankAccount ? new Set([bankAccount]) : new Set()}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0]
                    setBankAccount(selectedKey || '')
                  }}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Receipt
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
              </div>
            )}

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
