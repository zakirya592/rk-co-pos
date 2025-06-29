import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Chip,
  Divider,
  Spinner
} from '@nextui-org/react';
import { FaSearch, FaPlus, FaMinus, FaTrash, FaPrint, FaUser, FaPercent, FaCalculator } from 'react-icons/fa';
import CustomerSelectionModal from './CustomerSelectionModal';
import PaymentModal from "./PaymentModal";
import { useQuery } from "react-query";// Adjust the import based on your file structure
import userRequest from '../../utils/userRequest';


const fetchProducts = async (key, searchTerm, currentPage) => {
  const res = await userRequest.get("/products", {
    params: {
      search: searchTerm,
      page: currentPage,
    },
  });
  return {
    products: res.data.data || [],
    total: res.data.results || 0,
  };
};

const POS = () => {
  const [customers] = useState([
    { id: 1, name: 'Walk-in Customer', contact: '', address: '', type: 'retail' },
    { id: 2, name: 'Ahmad Khan', contact: '03001234567', address: 'Lahore', type: 'wholesale' },
    { id: 3, name: 'Sarah Ahmed', contact: '03009876543', address: 'Karachi', type: 'retail' }
  ]);

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(17); // Default GST
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [categories, setCategories] = useState([]);

  // Fetch products using react-query
  const { data, isLoading } = useQuery(
    ["products", searchTerm, currentPage],
    () => fetchProducts("products", searchTerm, currentPage),
    { keepPreviousData: true }
  );

  const products = data?.products || [];
  const totalProducts = data?.total || 0;

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) 
    // ||
    // product.barcode.includes(searchTerm)
  );

  const addToCart = (product) => {
    const price = selectedCustomer.type === 'wholesale' ? product.wholesalePrice : product.retailPrice;
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1, price }]);
    }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    const product = products.find(p => p.id === id);
    if (newQuantity <= product.stock) {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = ((subtotal - discountAmount) * tax) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const handlePayment = () => {
    setShowPaymentModal(true);
  };

  const addPaymentMethod = () => {
    setPaymentMethods([...paymentMethods, { method: 'cash', amount: 0 }]);
  };

  const updatePaymentMethod = (index, field, value) => {
    const updated = paymentMethods.map((payment, i) =>
      i === index ? { ...payment, [field]: value } : payment
    );
    setPaymentMethods(updated);
    setTotalPaid(updated.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0));
  };

  const completeSale = () => {
    // Here you would typically save the sale to database
    console.log('Sale completed:', {
      customer: selectedCustomer,
      items: cart,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      payments: paymentMethods,
      timestamp: new Date()
    });
    
    // Reset cart
    setCart([]);
    setDiscount(0);
    setPaymentMethods([]);
    setTotalPaid(0);
    setShowPaymentModal(false);
    alert('Sale completed successfully!');
  };

  return (
    <div className="p-4 h-screen overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        {/* Product Search & Selection */}
        <div className="lg:col-span-2 space-y-4 ">
          <Card>
            <CardBody className="p-4">
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Search products by name or scan barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  startContent={<FaSearch className="text-gray-400" />}
                  className="flex-1"
                />
                <Button
                  color="primary"
                  onPress={() => setShowCustomerModal(true)}
                  startContent={<FaUser />}
                >
                  Customer
                </Button>
              </div>

              <div className="text-sm mb-4">
                Customer: <strong>{selectedCustomer.name}</strong> (
                {selectedCustomer.type})
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Spinner color="success" size="lg" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 h-full ">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      isPressable
                      onPress={() => addToCart(product)}
                      className="hover:scale-105 transition-transform"
                    >
                      <CardBody className="p-3">
                        <div className="flex items-center gap-2">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <h4 className="font-semibold text-sm">
                            {product.name}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600">
                          {/* {categoryMap[product.category]?.name || "Unknown"} */}
                          {product?.category?.name || ""}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm font-bold">
                            Rs.{" "}
                            {/* {selectedCustomer.type === "wholesale"
                              ? product.wholesalePrice.toLocaleString()
                              : product.retailPrice.toLocaleString()} */}
                            {product.price.toLocaleString()}
                          </span>
                          <Chip
                            size="sm"
                            color={
                              product.countInStock > 10
                                ? "success"
                                : product.countInStock > 0
                                ? "warning"
                                : "danger"
                            }
                          >
                            {product.countInStock}
                          </Chip>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Cart & Checkout */}
        <div className="space-y-4">
          <Card className="h-full">
            <CardBody className="p-4 flex flex-col">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-4">Shopping Cart</h3>

                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Cart is empty
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.id || ""}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {item.name || ""}
                          </div>
                          <div className="text-xs text-gray-600">
                            Rs. {item.price.toLocaleString() || ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                          >
                            <FaMinus />
                          </Button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <FaPlus />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="light"
                            onPress={() => removeFromCart(item.id)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="mt-4 space-y-3">
                  <Divider />

                  {/* Discount & Tax */}
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      label="Discount %"
                      value={discount}
                      onChange={(e) =>
                        setDiscount(parseFloat(e.target.value) || 0)
                      }
                      startContent={<FaPercent />}
                      size="sm"
                    />
                    <Input
                      type="number"
                      label="Tax %"
                      value={tax}
                      onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                      startContent={<FaCalculator />}
                      size="sm"
                    />
                  </div>

                  {/* Bill Summary */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%):</span>
                      <span>-Rs. {discountAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Tax ({tax}%):</span>
                      <span>Rs. {taxAmount.toLocaleString()}</span>
                    </div>
                    <Divider />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>Rs. {total.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    color="success"
                    size="lg"
                    className="w-full"
                    onPress={handlePayment}
                    startContent={<FaPrint />}
                  >
                    Process Payment
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Customer Selection Modal */}
      <CustomerSelectionModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        customers={customers}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={total}
        paymentMethods={paymentMethods}
        addPaymentMethod={addPaymentMethod}
        updatePaymentMethod={updatePaymentMethod}
        totalPaid={totalPaid}
        completeSale={completeSale}
      />
    </div>
  );
};

export default POS;
