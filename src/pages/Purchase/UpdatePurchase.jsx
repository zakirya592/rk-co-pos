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
  Spinner,
  Chip,
  Divider,
} from "@nextui-org/react";
import { FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const UpdatePurchase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    supplier: "",
    warehouse: "",
    currency: "PKR",

    paymentMethod: "cash",
    items: [
      {
        product: "",
        quantity: "",
        purchaseRate: "",
        retailRate: "",
        wholesaleRate: "",
      },
    ],
    purchaseDate: new Date().toISOString().split("T")[0],
    invoiceNumber: "",
    notes: "",
  });

  // Fetch purchase data and related data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch purchase data
        const purchaseRes = await userRequest.get(`/purchases/${id}`);
        const purchaseData = purchaseRes.data.data;
        
        // Format the purchase data for the form
        
        setFormData({
          supplier: purchaseData.supplier?._id || "",
          warehouse: purchaseData.warehouse?._id || "",
          currency: purchaseData.currency?._id || "",
          paymentMethod: purchaseData.paymentMethod || "cash",
          items: purchaseData.items?.map((item) => ({
            product: item.product?._id || "",
            quantity: item.quantity || "",
            purchaseRate: item.purchaseRate || "",
            retailRate: item.retailRate || "",
            wholesaleRate: item.wholesaleRate || "",
          })) || [
            {
              product: "",
              quantity: "",
              purchaseRate: "",
              retailRate: "",
              wholesaleRate: "",
            },
          ],
          purchaseDate: purchaseData.purchaseDate
            ? new Date(purchaseData.purchaseDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          invoiceNumber: purchaseData.invoiceNumber || "",
          notes: purchaseData.notes || "",
        });

        // Fetch related data
        const [
          productsRes,
          suppliersRes,
          warehousesRes,
          currenciesRes
        ] = await Promise.all([
          userRequest.get('/products?limit=1000'),
          userRequest.get('/suppliers'),
          userRequest.get('/warehouses'),
          userRequest.get('/currencies')
        ]);

        setProducts(productsRes.data.data || []);
        setSuppliers(suppliersRes.data || []);
        setWarehouses(warehousesRes.data.data || []);
        setCurrencies(currenciesRes.data.data || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load purchase data');
        navigate('/purchases');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle item changes
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [name]: value
    };
    
    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  // Add new item row
  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { product: '', quantity: '', purchaseRate: '', retailRate: '', wholesaleRate: '' }
      ]
    });
  };

  // Remove item row
  const removeItemRow = (index) => {
    if (formData.items.length === 1) return; 
    
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    
    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare the data for submission
    const submissionData = {
      ...formData,
      items: formData.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        purchaseRate: Number(item.purchaseRate),
        retailRate: Number(item.retailRate),
        wholesaleRate: Number(item.wholesaleRate)
      }))
    };

    try {
      setIsSubmitting(true);
      const response = await userRequest.put(`/purchases/${id}`, submissionData);
      
      if (response.data.status === 'success') {
        toast.success('Purchase updated successfully!');
        navigate('/purchases');
      } else {
        throw new Error(response.data.message || 'Failed to update purchase');
      }
    } catch (error) {
      console.error('Error updating purchase:', error);
      toast.error(error.response?.data?.message || 'Failed to update purchase');
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
            <h1 className="text-2xl font-bold">Update Purchase</h1>
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
              {isSubmitting ? "Updating..." : "Update Purchase"}
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
                selectedKeys={formData.supplier ? [formData.supplier] : []}
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
                selectedKeys={formData.warehouse ? [formData.warehouse] : []}
                onChange={handleInputChange}
                placeholder="Select Warehouse"
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

              <Input
                label="Invoice Number"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                placeholder="Enter invoice number"
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
                    selectedKeys={item.product ? [item.product] : []}
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
};

export default UpdatePurchase;
