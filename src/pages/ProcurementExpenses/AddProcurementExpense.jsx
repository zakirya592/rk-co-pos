import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Divider,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@nextui-org/react';
import { FaPlus, FaTrash, FaArrowLeft, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const AddProcurementExpense = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    supplier: '',
    purchaseOrderNo: '',
    invoiceNo: '',
    productCategory: '',
    currency: 'PKR',
    exchangeRate: 1,
    importDuty: 0,
    packagingCost: 0,
    handlingCost: 0,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    expenseDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    notes: '',
    products: [
      { product: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
    ]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'exchangeRate' || name === 'importDuty' || 
              name === 'packagingCost' || name === 'handlingCost' 
              ? parseFloat(value) || 0 
              : value
    }));
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: field === 'quantity' || field === 'unitPrice' 
        ? parseFloat(value) || 0 
        : value
    };

    // Calculate total price for the row
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : updatedProducts[index].quantity;
      const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : updatedProducts[index].unitPrice;
      updatedProducts[index].totalPrice = quantity * unitPrice;
    }

    // Update product in form data
    setFormData(prev => ({
      ...prev,
      products: updatedProducts
    }));

    // Update total amount
    calculateTotal(updatedProducts);
  };

  const calculateTotal = (products) => {
    const subtotal = products.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
      0
    );
    setTotalAmount(subtotal);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [suppliersRes, productsRes, currenciesRes, categoriesRes] = await Promise.all([
          userRequest.get("/suppliers"),
          userRequest.get("/products"),
          userRequest.get("/currencies"),
          userRequest.get("/categories"),
        ]);
        setSuppliers(suppliersRes.data || []);
        setAvailableProducts(productsRes.data.data || []);
        setCurrencies(currenciesRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [
        ...prev.products,
        { product: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
      ]
    }));
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...formData.products];
    updatedProducts.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      products: updatedProducts
    }));
    calculateTotal(updatedProducts);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Basic validation
    if (!formData.supplier || !formData.purchaseOrderNo || !formData.invoiceNo) {
      toast.error('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    if (formData.products.length === 0) {
      toast.error('Please add at least one product');
      setIsSubmitting(false);
      return;
    }

    try {
      await userRequest.post('/expenses/procurement', formData);
      toast.success('Procurement expense added successfully');
      navigate('/expenses/procurement');
    } catch (error) {
      console.error('Error adding procurement expense:', error);
      toast.error(error.response?.data?.message || 'Failed to add procurement expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <Button
          isIconOnly
          variant="light"
          className="mr-2"
          onPress={() => navigate(-1)}
        >
          <FaArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold">Add Procurement Expense</h1>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold">Basic Information</h2>
              <Divider />

              <Select
                name="supplier"
                label="Supplier"
                placeholder="Select a supplier"
                labelPlacement="outside"
                selectedKeys={formData.supplier ? [formData.supplier] : []}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, supplier: e.target.value }))
                }
              >
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </Select>
              <div className="mt-5">
                <Select
                  name="productCategory"
                  label="Product Category"
                  placeholder="Select category"
                  labelPlacement="outside"
                  value={formData.productCategory}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      productCategory: e.target.value,
                    }))
                  }
                >
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="purchaseOrderNo"
                  label="PO Number"
                  placeholder="PO-2025-001"
                  labelPlacement="outside"
                  value={formData.purchaseOrderNo}
                  onChange={handleInputChange}
                />

                <Input
                  name="invoiceNo"
                  label="Invoice Number"
                  placeholder="INV-2025-001"
                  labelPlacement="outside"
                  value={formData.invoiceNo}
                  onChange={handleInputChange}
                />
              </div>

              <Textarea
                name="notes"
                label="Notes"
                placeholder="Additional notes..."
                labelPlacement="outside"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold">Financial Details</h2>
              <Divider />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  name="paymentMethod"
                  label="Payment Method"
                  placeholder="Select payment method"
                  labelPlacement="outside"
                  selectedKeys={[formData.paymentMethod]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentMethod: e.target.value,
                    }))
                  }
                >
                  <SelectItem key="cash" value="cash">
                    cash
                  </SelectItem>
                  <SelectItem key="bank" value="bank">
                    Bank Transfer
                  </SelectItem>
                  <SelectItem key="credit" value="credit">
                    credit
                  </SelectItem>
                  <SelectItem key="mixed" value="mixed">
                    mixed
                  </SelectItem>
                </Select>

                <Select
                  name="paymentStatus"
                  label="Payment Status"
                  placeholder="Select payment status"
                  labelPlacement="outside"
                  selectedKeys={[formData.paymentStatus]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentStatus: e.target.value,
                    }))
                  }
                >
                  <SelectItem key="pending" value="pending">
                    Pending
                  </SelectItem>
                  <SelectItem key="partial" value="partial">
                    Partial
                  </SelectItem>
                  <SelectItem key="paid" value="paid">
                    Paid
                  </SelectItem>
                  <SelectItem key="overdue" value="overdue">
                    Overdue
                  </SelectItem>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  name="currency"
                  label="Currency"
                  placeholder="Select currency"
                  labelPlacement="outside"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currency: e.target.value,
                    }))
                  }
                >
                  {currencies.map((currency) => (
                    <SelectItem
                      key={currency._id}
                      value={currency._id}
                      textValue={`${currency.name} ${currency.symbol}`}
                    >
                      {currency.name} {currency.symbol}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  type="number"
                  name="exchangeRate"
                  label="Exchange Rate"
                  placeholder="1.0"
                  labelPlacement="outside"
                  min="0"
                  step="0.01"
                  value={formData.exchangeRate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="date"
                  name="expenseDate"
                  label="Expense Date"
                  labelPlacement="outside"
                  value={formData.expenseDate}
                  onChange={handleInputChange}
                />
                <Input
                  type="date"
                  name="dueDate"
                  label="Due Date"
                  labelPlacement="outside"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              </div>
            </CardBody>
          </Card>
        </div>
        <Card className="mb-6">
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Products</h2>
              <Button
                color="primary"
                size="sm"
                startContent={<FaPlus size={14} />}
                onPress={handleAddProduct}
              >
                Add Product
              </Button>
            </div>

            <Table aria-label="Products table" className="mb-4">
              <TableHeader>
                <TableColumn>PRODUCT</TableColumn>
                <TableColumn>QUANTITY</TableColumn>
                <TableColumn>UNIT PRICE</TableColumn>
                <TableColumn>TOTAL</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {formData.products?.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Select
                        size="sm"
                        placeholder="Select product"
                        selectedKeys={
                          formData.products[index]?.product
                            ? [formData.products[index].product]
                            : []
                        }
                        onChange={(e) => {
                          const updatedProducts = [...formData.products];
                          updatedProducts[index] = {
                            ...updatedProducts[index],
                            product: e.target.value,
                            unitPrice: 0,
                          };
                          setFormData((prev) => ({
                            ...prev,
                            products: updatedProducts,
                          }));
                        }}
                      >
                        {availableProducts.map((p) => (
                          <SelectItem key={p._id} value={p._id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        size="sm"
                        value={formData.products[index]?.quantity || 1}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 1;
                          handleProductChange(index, "quantity", value);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        size="sm"
                        value={formData.products[index]?.unitPrice || 0}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          handleProductChange(index, "unitPrice", value);
                        }}
                        startContent={
                          <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">
                              $
                            </span>
                          </div>
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        $
                        {(
                          (product.quantity || 0) * (product.unitPrice || 0)
                        ).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleRemoveProduct(index)}
                      >
                        <FaTrash size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
        <div className="flex justify-end gap-4 mt-6">
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
            startContent={!isSubmitting && <FaSave />}
          >
            {isSubmitting ? "Saving..." : "Save Expense"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProcurementExpense;
