import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Divider,
  Spinner
} from '@nextui-org/react';
import { FaSearch, FaPlus, FaMinus, FaTrash, FaPrint, FaUser, FaPercent, FaCalculator } from 'react-icons/fa';
import CustomerSelectionModal from './CustomerSelectionModal';
import PaymentModal from "./PaymentModal";
import { useQuery } from "react-query";
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';


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

const fetchCustomers = async (search = '', page = 1) => {
  const res = await userRequest.get(`/customers?search=${search}&page=${page}`);
  return res.data;
};

const POS = () => {
  const [customers, setCustomers] = useState([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerPage, setCustomerPage] = useState(1);
  const [saleDataadd, setSaleDataadd] = useState({
    note: "",
    description: "",
    currency: "",
  });
  // Fetch customers using react-query
  const { data: customerData, isLoading: customersLoading } = useQuery(
    ["customers", customerSearchTerm, customerPage],
    () => fetchCustomers(customerSearchTerm, customerPage),
    { keepPreviousData: true }
  );

  useEffect(() => {
    if (customerData) {
      setCustomers(customerData?.data || []);
    }
  }, [customerData]);

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]);
  const [discount, setDiscount] = useState(0);
  const [directDiscount, setDirectDiscount] = useState(0); // Direct Discount amount
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);

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
    // Use wholesalePrice for wholesale customers, otherwise use price
    const price =
      selectedCustomer.customerType === "wholesale"
        ? product.wholesalePrice ?? product.wholesaleRate
        : selectedCustomer.customerType === "retail"
          ? product.retailRate ?? product.retailRate
          : product.price;

    const existingItem = cart.find(item => item._id === product._id);

    if (existingItem) {
      // Allow adding if stock is available, for all customer customerType
      if (existingItem.quantity < product.countInStock) {
        setCart(cart.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1, price }]);
    }
  };

  const updateQuantity = (_id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(_id);
      return;
    }

    const product = products.find(p => p._id === _id);
    if (product && newQuantity <= product.countInStock) {
      setCart(cart.map(item =>
        item._id === _id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (_id) => {
    setCart(cart.filter(item => item._id !== _id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const directDiscountAmount = directDiscount;
  const total = subtotal - discountAmount - directDiscountAmount;
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

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

  const handleSalepaymets = () => {
    try {
      userRequest.post("/payments/customer", {
        customerId: selectedCustomer?._id,
        amount: totalPaid,
        paymentMethod: paymentMethods[0]?.method || "cash",
        status:
          totalPaid === total ? "completed" : totalPaid > 0 ? "partial" : "pending",
        currency: saleDataadd.currency,
        notes: saleDataadd.description,
        distributionStrategy: "oldest-first",
      });
      toast.success("Sale completed successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to add customer.");
    }
  };

  const completeSale = async () => {
    try {
      const saleData = {
        customer: selectedCustomer?._id,
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
          discount: 0,
          total: item.price * item.quantity - 0,
        })),
        totalAmount: subtotal,
        tax: directDiscountAmount,
        grandTotal: total,
        discount: discountAmount,
        // paymentMethod: paymentMethods[0]?.method || "cash",
        // paymentStatus: totalPaid === total ? "paid" : totalPaid > 0 ? "partial" : "unpaid",
        // paidAmount: totalPaid,
        // notes: saleDataadd.description,
        // subtotal: subtotal,
      };

      const response = await userRequest.post('/sales', saleData);

       // Call handleSalepaymets after successful sale
      await handleSalepaymets();

      setCart([]);
      setDiscount(0);
      setPaymentMethods([]);
      setTotalPaid(0);
      setShowPaymentModal(false);
      console.log(response.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to complete sale. Please try again.");
    }
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

              <div className="flex items-center justify-between mb-4">
                <div className="text-sm">
                  Customer:{" "}
                  <strong>{selectedCustomer?.name || "Select Customer"}</strong>{" "}
                  ({selectedCustomer?.customerType || ""})
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow font-semibold text-sm">
                  Total Products: {totalProducts}
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Spinner color="success" size="lg" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 h-full ">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product._id}
                      isPressable
                      onPress={() => addToCart(product)}
                      className="hover:scale-105 transition-transform"
                    >
                      <CardBody className="p-3">
                        <div className="flex items-center gap-2">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-400">-</span>
                            </div>
                          )}
                          <h4 className="font-semibold text-sm">
                            {product.name}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600">
                          {product?.category?.name || ""}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm font-bold">
                            {product?.currency?.symbol || ""} {product.price}
                          </span>
                          <Chip
                            size="sm"
                            color={
                              product.countInStock <= 5
                                ? "danger"
                                : product.countInStock <= 10
                                ? "warning"
                                : "success"
                            }
                          >
                            {product.countInStock}
                          </Chip>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm font-bold">
                            Purchase Rate
                          </span>
                          <span>{product.purchaseRate}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm font-bold">Sale Rate</span>
                          <span>{product.saleRate}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm font-bold">Retail Rate</span>
                          <span>{product.retailRate}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm font-bold">
                            Wholesale Rate
                          </span>
                          <span>{product.wholesaleRate}</span>
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
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  Shopping Cart
                  <span className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow">
                    {totalCartItems} item{totalCartItems !== 1 ? "s" : ""}
                  </span>
                </h3>

                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Cart is empty
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item._id || ""}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {item.name || ""}
                          </div>
                          <div className="text-xs text-gray-600">
                            {item.currency?.symbol || ""} {item.price || ""}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() =>
                              updateQuantity(item._id, item.quantity - 1)
                            }
                          >
                            <FaMinus />
                          </Button>
                          <input
                            type="number"
                            min="1"
                            className="w-24 h-8 text-center border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              updateQuantity(item._id, newQuantity);
                            }}
                            onFocus={(e) => e.target.select()}
                          />
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() =>
                              updateQuantity(item._id, item.quantity + 1)
                            }
                          >
                            <FaPlus />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="light"
                            onPress={() => removeFromCart(item._id)}
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
                      label="Direct Discount"
                      value={directDiscount}
                      onChange={(e) =>
                        setDirectDiscount(parseFloat(e.target.value) || 0)
                      }
                      startContent={<FaCalculator />}
                      size="sm"
                    />
                  </div>

                  {/* Bill Summary */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span> {subtotal}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%):</span>
                      <span> {discountAmount}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Direct ({directDiscount}%):</span>
                      <span> {directDiscountAmount}</span>
                    </div>
                    <Divider />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span> {total}</span>
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
        saleData={saleDataadd}
        updateSaleData={setSaleDataadd}
        selectedCustomer={selectedCustomer}
      />
    </div>
  );
};

export default POS;
