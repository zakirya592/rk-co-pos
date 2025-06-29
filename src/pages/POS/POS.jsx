import React, { useState, useEffect } from 'react';
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
  Divider
} from '@nextui-org/react';
import { FaSearch, FaPlus, FaMinus, FaTrash, FaPrint, FaUser, FaPercent, FaCalculator } from 'react-icons/fa';

const POS = () => {
  // Sample products with barcode support
  const [products] = useState([
    {
      id: 1,
      name: 'Laptop Dell XPS 13',
      category: 'Electronics',
      retailPrice: 85000,
      wholesalePrice: 80000,
      stock: 15,
      barcode: '1234567890123'
    },
    {
      id: 2,
      name: 'Office Chair',
      category: 'Furniture',
      retailPrice: 12000,
      wholesalePrice: 10000,
      stock: 8,
      barcode: '1234567890124'
    },
    {
      id: 3,
      name: 'iPhone 15',
      category: 'Electronics',
      retailPrice: 250000,
      wholesalePrice: 240000,
      stock: 5,
      barcode: '1234567890125'
    },
    {
      id: 4,
      name: 'iPhone 15',
      category: 'Electronics',
      retailPrice: 250000,
      wholesalePrice: 240000,
      stock: 5,
      barcode: '1234567890125'
    },
    {
      id: 5,
      name: 'iPhone 15',
      category: 'Electronics',
      retailPrice: 250000,
      wholesalePrice: 240000,
      stock: 5,
      barcode: '1234567890125'
    },
    {
      id: 6,
      name: 'iPhone 15',
      category: 'Electronics',
      retailPrice: 250000,
      wholesalePrice: 240000,
      stock: 5,
      barcode: '1234567890125'
    }
  ]);

  const [customers] = useState([
    { id: 1, name: 'Walk-in Customer', contact: '', address: '', type: 'retail' },
    { id: 2, name: 'Ahmad Khan', contact: '03001234567', address: 'Lahore', type: 'wholesale' },
    { id: 3, name: 'Sarah Ahmed', contact: '03009876543', address: 'Karachi', type: 'retail' }
  ]);

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(17); // Default GST
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 h-full ">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    isPressable
                    onPress={() => addToCart(product)}
                    className="hover:scale-105 transition-transform"
                  >
                    <CardBody className="p-3">
                      <h4 className="font-semibold text-sm">{product.name}</h4>
                      <p className="text-xs text-gray-600">
                        {product.category}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-bold">
                          Rs.{" "}
                          {selectedCustomer.type === "wholesale"
                            ? product.wholesalePrice.toLocaleString()
                            : product.retailPrice.toLocaleString()}
                        </span>
                        <Chip
                          size="sm"
                          color={
                            product.stock > 10
                              ? "success"
                              : product.stock > 0
                              ? "warning"
                              : "danger"
                          }
                        >
                          {product.stock}
                        </Chip>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
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
                        key={item.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            Rs. {item.price.toLocaleString()}
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
      <Modal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Select Customer</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
              {customers.map((customer) => (
                <Card
                  key={customer.id}
                  isPressable
                  onPress={() => {
                    setSelectedCustomer(customer);
                    setShowCustomerModal(false);
                  }}
                  className={
                    selectedCustomer.id === customer.id
                      ? "border-2 border-primary"
                      : ""
                  }
                >
                  <CardBody className="p-3">
                    <div className="font-semibold">{customer.name}</div>
                    <div className="text-sm text-gray-600">
                      {customer.contact}
                    </div>
                    <Chip
                      size="sm"
                      color={
                        customer.type === "wholesale" ? "secondary" : "primary"
                      }
                    >
                      {customer.type}
                    </Chip>
                  </CardBody>
                </Card>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        size="2xl"
      >
        <ModalContent>
          <ModalHeader>Payment Details</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded">
                <div className="text-lg font-bold">
                  Total Amount: Rs. {total.toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Payment Methods</h4>
                  <Button
                    size="sm"
                    onPress={addPaymentMethod}
                    startContent={<FaPlus />}
                  >
                    Add Payment
                  </Button>
                </div>

                {paymentMethods.map((payment, index) => (
                  <div key={index} className="flex gap-2">
                    <Select
                      placeholder="Payment Method"
                      value={payment.method}
                      onChange={(e) =>
                        updatePaymentMethod(index, "method", e.target.value)
                      }
                      className="flex-1"
                    >
                      <SelectItem key="cash" value="cash">
                        Cash
                      </SelectItem>
                      <SelectItem key="card" value="card">
                        Card
                      </SelectItem>
                      <SelectItem key="bank" value="bank">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem key="easypaisa" value="easypaisa">
                        EasyPaisa
                      </SelectItem>
                      <SelectItem key="jazzcash" value="jazzcash">
                        JazzCash
                      </SelectItem>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={payment.amount}
                      onChange={(e) =>
                        updatePaymentMethod(index, "amount", e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                ))}

                <div className="bg-blue-50 p-2 rounded">
                  <div className="flex justify-between">
                    <span>Total Paid:</span>
                    <span className="font-bold">
                      Rs. {totalPaid.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Balance:</span>
                    <span
                      className={`font-bold ${
                        total - totalPaid > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      Rs. {(total - totalPaid).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowPaymentModal(false)}>
              Cancel
            </Button>
            <Button
              color="success"
              onPress={completeSale}
              isDisabled={totalPaid < total}
            >
              Complete Sale
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default POS;
