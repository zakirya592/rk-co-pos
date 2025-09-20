import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const EditProcurementExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Form state
  // Format date to DD/MM/YYYY
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`; // yyyy-MM-dd format for input[type=date]
  };

  // Parse date from DD/MM/YYYY to Date object
  const parseDateFromInput = (inputValue) => {
    if (!inputValue) return null;
    const [year, month, day] = inputValue.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
  };

  const [formData, setFormData] = useState({
    supplier: '',
    purchaseOrderNo: '',
    invoiceNo: '',
    productCategory: '',
    currency: 'PKR',
    exchangeRate: 1,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    expenseDate: formatDateForInput(new Date()),
    dueDate: formatDateForInput(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)), // 5 days from now
    notes: '',
    products: [
      { product: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
    ]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'exchangeRate' ? parseFloat(value) || 0 : value
    }));
  };

  // Handle date input changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        const [expenseRes, suppliersRes, productsRes, currenciesRes, categoriesRes] = await Promise.all([
          userRequest.get(`/expenses/procurement/${id}`),
          userRequest.get("/suppliers"),
          userRequest.get("/products"),
          userRequest.get("/currencies"),
          userRequest.get("/categories"),
        ]);

        const expenseData = expenseRes.data.data;
        const categoriesData = categoriesRes.data.data || [];

        setSuppliers(suppliersRes.data || []);
        setAvailableProducts(productsRes.data.data || []);
        setCurrencies(currenciesRes.data.data || []);
        setCategories(categoriesData);

        // Format dates for display
        setFormData({
          ...expenseData,
          supplier: expenseData.supplier?._id || '',
          productCategory: expenseData.productCategory?._id || '',
          currency: expenseData.currency?._id || 'PKR',
          expenseDate: formatDateForInput(expenseData.expenseDate || new Date()),
          dueDate: formatDateForInput(expenseData.dueDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
          products: expenseData.products?.map(p => ({
            ...p,
            product: p.product?._id || '',
            quantity: p.quantity || 1,
            unitPrice: p.unitPrice || 0,
            totalPrice: (p.quantity || 1) * (p.unitPrice || 0)
          })) || [{ product: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]
        });

        setTotalAmount(expenseData.amountInPKR || 0);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load expense data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

    // Format dates for submission
    const submissionData = {
      ...formData,
      expenseDate: formData.expenseDate ? parseDateFromInput(formData.expenseDate).toISOString() : null,
      dueDate: formData.dueDate ? parseDateFromInput(formData.dueDate).toISOString() : null
    };

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
      const response = await userRequest.put(
        `/expenses/procurement/${id}`,
        submissionData
      );
      toast.success('Procurement expense updated successfully');
      navigate(`/expenses/procurement`);
    } catch (error) {
      console.error('Error updating procurement expense:', error);
      toast.error(error.response?.data?.message || 'Failed to update procurement expense');
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
        <h1 className="text-2xl font-bold">Edit Procurement Expense</h1>
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
                placeholder="Select supplier"
                labelPlacement="outside"
                isRequired
                selectedKeys={formData.supplier ? [formData.supplier] : []}
                onChange={(e) =>
                  handleInputChange({
                    target: { name: "supplier", value: e.target.value },
                  })
                }
              >
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </Select>

              <div className="mt-4">
                <Select
                  name="productCategory"
                  label="Product Category"
                  placeholder="Select category"
                  labelPlacement="outside"
                  selectedKeys={formData.productCategory ? [formData.productCategory] : []}
                  value={formData.productCategory}
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "productCategory",
                        value: e.target.value,
                      },
                    })
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
                <div className="mt-4">
                  <Input
                    name="purchaseOrderNo"
                    label="PO Number"
                    placeholder="Enter PO number"
                    labelPlacement="outside"
                    isRequired
                    value={formData.purchaseOrderNo}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mt-4">
                  <Input
                    name="invoiceNo"
                    label="Invoice Number"
                    placeholder="Enter invoice number"
                    labelPlacement="outside"
                    isRequired
                    value={formData.invoiceNo}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <Textarea
                name="notes"
                label="Notes"
                placeholder="Enter any additional notes"
                labelPlacement="outside"
                className="w-full"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold">Additional Information</h2>
              <Divider />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  name="paymentMethod"
                  label="Payment Method"
                  placeholder="Select payment method"
                  labelPlacement="outside"
                  isRequired
                  selectedKeys={
                    formData.paymentMethod ? [formData.paymentMethod] : []
                  }
                  onChange={(e) =>
                    handleInputChange({
                      target: { name: "paymentMethod", value: e.target.value },
                    })
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
                  isRequired
                  selectedKeys={
                    formData.paymentStatus ? [formData.paymentStatus] : []
                  }
                  onChange={(e) =>
                    handleInputChange({
                      target: { name: "paymentStatus", value: e.target.value },
                    })
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

                <Input
                  name="expenseDate"
                  type="date"
                  label="Expense Date (DD/MM/YYYY)"
                  placeholder="Select expense date"
                  labelPlacement="outside"
                  isRequired
                  value={formData.expenseDate}
                  onChange={handleDateChange}
                />

                <Input
                  name="dueDate"
                  type="date"
                  label="Due Date (DD/MM/YYYY)"
                  placeholder="Select due date"
                  labelPlacement="outside"
                  isRequired
                  value={formData.dueDate}
                  onChange={handleDateChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mt-4">
                  <Select
                    name="currency"
                    label="Currency"
                    placeholder="Select currency"
                    labelPlacement="outside"
                    isRequired
                    selectedKeys={formData.currency ? [formData.currency] : []}
                    onChange={(e) =>
                      handleInputChange({
                        target: { name: "currency", value: e.target.value },
                      })
                    }
                  >
                    {currencies.map((currency) => (
                      <SelectItem key={currency._id} value={currency._id}>
                        {`${currency.code} - ${currency.name}`}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="mt-4">
                  <Input
                    name="exchangeRate"
                    type="number"
                    min="0"
                    step="0.01"
                    label="Exchange Rate"
                    placeholder="Enter exchange rate"
                    labelPlacement="outside"
                    isRequired
                    value={formData.exchangeRate}
                    onChange={handleInputChange}
                  />
                </div>
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
                startContent={<FaPlus />}
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
                <TableColumn width="50">ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {formData.products?.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Select
                        placeholder="Select product"
                        className="w-full"
                        isRequired
                        selectedKeys={product.product ? [product.product] : []}
                        onChange={(e) =>
                          handleProductChange(index, "product", e.target.value)
                        }
                      >
                        {availableProducts.map((prod) => (
                          <SelectItem key={prod._id} value={prod._id}>
                            {prod.name}
                          </SelectItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        className="w-24"
                        isRequired
                        value={product.quantity}
                        onChange={(e) =>
                          handleProductChange(index, "quantity", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-32"
                        startContent={
                          <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">
                              $
                            </span>
                          </div>
                        }
                        isRequired
                        value={product.unitPrice}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "unitPrice",
                            e.target.value
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${(product.quantity * product.unitPrice).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        isIconOnly
                        variant="light"
                        color="danger"
                        onPress={() => handleRemoveProduct(index)}
                        isDisabled={formData.products.length <= 1}
                      >
                        <FaTrash />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* <div className="flex justify-end items-center gap-4 mt-4">
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Subtotal</div>
                <div className="text-2xl font-bold">
                  ${totalAmount.toFixed(2)}
                </div>
              </div>
            </div> */}
          </CardBody>
        </Card>

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
            startContent={!isSubmitting && <FaSave />}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProcurementExpense;
