import React, { useState, useEffect } from 'react';
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
  AutocompleteItem,
} from "@nextui-org/react";
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const UpdateShipment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [transporters, setTransporters] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    supplier: '',
    transporter: '',
    products: [
      {
        product: '',
        quantity: '',
        unitPrice: ''
      }
    ],
    origin: {
      country: '',
      city: '',
      address: ''
    },
    destination: {
      country: 'Pakistan',
      city: '',
      warehouse: ''
    },
    status: 'pending',
    shipmentDate: '',
    estimatedArrival: '',
    totalWeight: '',
    currency: '',
    notes: ''
  });

  // Fetch shipment data and all necessary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all necessary data in parallel
        const [
          shipmentRes, 
          productsRes, 
          suppliersRes, 
          transportersRes, 
          warehousesRes, 
          currenciesRes
        ] = await Promise.all([
          userRequest.get(`/shipments/${id}`),
          userRequest.get('/products'),
          userRequest.get("/suppliers"),
          userRequest.get('/transporters'),
          userRequest.get('/warehouses'),
          userRequest.get("/currencies")
        ]);

        // Set all the data
        setProducts(productsRes.data.data || []);
        setSuppliers(suppliersRes.data || []);
        setTransporters(transportersRes.data.data || []);
        setWarehouses(warehousesRes.data.data || []);
        setCurrencies(currenciesRes.data.data || []);

        // Set form data with the shipment data
        const shipment = shipmentRes.data.data;
        console.log(shipment, "shipment");

        
        
        if (shipment) {
          const suppliersResid = await userRequest.get(`suppliers/${shipment.supplier?._id || ''}`);
          console.log(suppliersResid, "suppliersResid");
          setFormData({
            supplier: shipment.supplier?._id || '',
            transporter: shipment.transporter?._id || '',
            products: shipment.products?.map(p => ({
              product: p.product?._id || '',
              quantity: p.quantity || '',
              unitPrice: p.unitPrice || ''
            })) || [{ product: '', quantity: '', unitPrice: '' }],
            origin: {
              country: shipment.origin?.country || '',
              city: shipment.origin?.city || '',
              address: shipment.origin?.address || ''
            },
            destination: {
              country: shipment.destination?.country || 'Pakistan',
              city: shipment.destination?.city || '',
              warehouse: shipment.destination?.warehouse?._id || ''
            },
            status: shipment.status || 'pending',
            shipmentDate: shipment.shipmentDate ? new Date(shipment.shipmentDate).toISOString().split('T')[0] : '',
            estimatedArrival: shipment.estimatedArrival ? new Date(shipment.estimatedArrival).toISOString().split('T')[0] : '',
            totalWeight: shipment.totalWeight || '',
            currency: shipment.currency?._id || '',
            notes: shipment.notes || ''
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load shipment data');
        navigate('/shipments');
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

  // Handle nested object changes (origin, destination)
  const handleNestedChange = (parent, e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [name]: value
      }
    });
  };

  // Handle product changes
  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProducts = [...formData.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [name]: value
    };
    
    setFormData({
      ...formData,
      products: updatedProducts
    });
  };

  // Add new product row
  const addProductRow = () => {
    setFormData({
      ...formData,
      products: [
        ...formData.products,
        { product: '', quantity: '', unitPrice: '' }
      ]
    });
  };

  // Remove product row
  const removeProductRow = (index) => {
    if (formData.products.length === 1) return;
    
    const updatedProducts = [...formData.products];
    updatedProducts.splice(index, 1);
    
    setFormData({
      ...formData,
      products: updatedProducts
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submissionData = {
      ...formData,
      products: formData.products.map(p => ({
        product: p.product,
        quantity: Number(p.quantity),
        unitPrice: Number(p.unitPrice)
      })),
      totalWeight: Number(formData.totalWeight)
    };

    console.log(submissionData);
    

    try {
      setIsSubmitting(true);
      const response = await userRequest.put(`/shipments/${id}`, submissionData);
      
      if (response.data.status === 'success') {
        toast.success('Shipment updated successfully!');
        navigate('/shipments');
      } else {
        throw new Error(response.data.message || 'Failed to update shipment');
      }
    } catch (error) {
      console.error('Error updating shipment:', error);
      toast.error(error.response?.data?.message || 'Failed to update shipment');
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
        <h1 className="text-2xl font-bold">Update Shipment</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Supplier Selection */}
          <Select
            label="Supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleInputChange}
            selectedKeys={formData.supplier ? [formData.supplier] : []}
            isRequired
            labelPlacement="outside"
            placeholder="Select a supplier"
          >
            {suppliers.map((supplier) => (
              <SelectItem key={supplier._id} value={supplier._id}>
                {supplier.name}
              </SelectItem>
            ))}
          </Select>

          {/* Transporter Selection */}
          <Select
            label="Transporter"
            name="transporter"
            value={formData.transporter}
            onChange={handleInputChange}
            selectedKeys={formData.transporter ? [formData.transporter] : []}
            isRequired
            labelPlacement="outside"
            placeholder="Select a transporter"
          >
            {transporters.map((transporter) => (
              <SelectItem key={transporter._id} value={transporter._id}>
                {transporter.name}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Products Section */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Products</h2>
              <Button
                size="sm"
                color="primary"
                startContent={<FaPlus />}
                onPress={addProductRow}
              >
                Add Product
              </Button>
            </div>

            {formData.products.map((product, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end"
              >
                <Select
                  label="Product"
                  name="product"
                  value={product.product}
                  onChange={(e) => handleProductChange(index, e)}
                  selectedKeys={product.product ? [product.product] : []}
                  isRequired
                  labelPlacement="outside"
                  placeholder="Select a product"
                >
                  {products.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  type="number"
                  label="Quantity"
                  name="quantity"
                  value={product.quantity}
                  onChange={(e) => handleProductChange(index, e)}
                  isRequired
                  min="1"
                  labelPlacement="outside"
                  placeholder="Enter quantity"
                />

                <Input
                  type="number"
                  label="Unit Price"
                  name="unitPrice"
                  value={product.unitPrice}
                  onChange={(e) => handleProductChange(index, e)}
                  isRequired
                  min="0"
                  step="0.01"
                  labelPlacement="outside"
                  placeholder="Enter unit price"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">$</span>
                    </div>
                  }
                />

                <div className="flex gap-2">
                  {formData.products.length > 1 && (
                    <Button
                      isIconOnly
                      color="danger"
                      variant="flat"
                      onPress={() => removeProductRow(index)}
                    >
                      <FaTrash />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Origin Section */}
        <Card className="mb-6">
          <CardBody>
            <h2 className="text-lg font-semibold mb-4">Origin</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Country"
                name="country"
                value={formData.origin.country}
                onChange={(e) => handleNestedChange("origin", e)}
                isRequired
                labelPlacement="outside"
                placeholder="Enter country"
              />
              <Input
                label="City"
                name="city"
                value={formData.origin.city}
                onChange={(e) => handleNestedChange("origin", e)}
                isRequired
                labelPlacement="outside"
                placeholder="Enter city"
              />
              <Input
                label="Address"
                name="address"
                value={formData.origin.address}
                onChange={(e) => handleNestedChange("origin", e)}
                isRequired
                labelPlacement="outside"
                placeholder="Enter address"
              />
            </div>
          </CardBody>
        </Card>

        {/* Destination Section */}
        <Card className="mb-6">
          <CardBody>
            <h2 className="text-lg font-semibold mb-4">Destination</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Country"
                name="country"
                value={formData.destination.country}
                onChange={(e) => handleNestedChange("destination", e)}
                isRequired
                labelPlacement="outside"
                placeholder="Enter country"
              />
              <Input
                label="City"
                name="city"
                value={formData.destination.city}
                onChange={(e) => handleNestedChange("destination", e)}
                isRequired
                labelPlacement="outside"
                placeholder="Enter city"
              />
              <Select
                label="Warehouse"
                name="warehouse"
                value={formData.destination.warehouse}
                onChange={(e) =>
                  handleNestedChange("destination", {
                    target: { name: "warehouse", value: e.target.value },
                  })
                }
                isRequired
                selectedKeys={formData.destination.warehouse ? [formData.destination.warehouse] : []}
                labelPlacement="outside"
                placeholder="Select warehouse"
              >
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse._id} value={warehouse._id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Shipment Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            selectedKeys={formData.status ? [formData.status] : []}
            labelPlacement="outside"
          >
            <SelectItem key="pending" value="pending">
              Pending
            </SelectItem>
            <SelectItem key="in_transit" value="in_transit">
              In Transit
            </SelectItem>
            <SelectItem key="delivered" value="delivered">
              Delivered
            </SelectItem>
            <SelectItem key="cancelled" value="cancelled">
              Cancelled
            </SelectItem>
          </Select>

          <Input
            type="date"
            label="Shipment Date"
            name="shipmentDate"
            value={formData.shipmentDate}
            onChange={handleInputChange}
            labelPlacement="outside"
          />

          <Input
            type="date"
            label="Estimated Arrival"
            name="estimatedArrival"
            value={formData.estimatedArrival}
            onChange={handleInputChange}
            isRequired
            labelPlacement="outside"
          />

          <Input
            type="number"
            label="Total Weight (kg)"
            name="totalWeight"
            value={formData.totalWeight}
            onChange={handleInputChange}
            isRequired
            min="0"
            step="0.01"
            labelPlacement="outside"
            placeholder="Enter total weight"
          />

          <Select
            label="Currency"
            name="currency"
            value={formData.currency}
            onChange={handleInputChange}
            labelPlacement="outside"
            placeholder="Select currency"
            selectedKeys={formData.currency ? [formData.currency] : []}
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
        </div>

        {/* Notes */}
        <div className="mb-6">
          <Textarea
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            labelPlacement="outside"
            placeholder="Enter any additional notes about this shipment"
            className="w-full"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 mt-8">
          <Button
            type="button"
            variant="flat"
            onPress={() => navigate(-1)}
            isDisabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Shipment"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateShipment;
