import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Divider,
  Spinner,
  Select,
  SelectItem
} from '@nextui-org/react';
import { FaSearch, FaPlus, FaMinus, FaTrash, FaPrint, FaUser, FaPercent, FaCalculator } from 'react-icons/fa';
import CustomerSelectionModal from './CustomerSelectionModal';
import PaymentModal from "./PaymentModal";
import { useQuery } from "react-query";
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';


const fetchProducts = async (key, searchTerm, currentPage, locationType, locationId) => {
  let endpoint = "/products";
  const params = {
    search: searchTerm,
    page: currentPage,
  };

  if (locationType && locationId) {
    endpoint = `/products/location/${locationType}/${locationId}`;
  }

  const res = await userRequest.get(endpoint);
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

    const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [customerPage, setCustomerPage] = useState(1);

  const [selectedTransferTo, setSelectedTransferTo] = useState("");
  const [transferOptions, setTransferOptions] = useState([]);

  const [transferTo, setTransferTo] = useState("");
  const [saleDataadd, setSaleDataadd] = useState({
    note: "",
    description: "",
    currency: "",
    paymentDate: new Date().toISOString().slice(0, 16),
    transactionId: "",
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

  // Fetch shops or warehouses when transferTo changes
  useEffect(() => {
    if (!transferTo) return;
    setTransferOptions([]);
    setSelectedTransferTo("");
    const endpoint = transferTo === "shop" ? "/shops" : "/warehouses";
    userRequest
      .get(endpoint)
      .then((data) => {
        setTransferOptions(data?.data?.data || []);
      })
      .catch(() => console.log("Failed to fetch transfer options"));
  }, [transferTo]);

  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]);
  const [discount, setDiscount] = useState(0);
  const [directDiscount, setDirectDiscount] = useState(0); // Direct Discount amount
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);

  // Fetch products using react-query
  const { data, isLoading, refetch } = useQuery(
    ["products", searchTerm, currentPage, transferTo, selectedTransferTo],
    () =>
      fetchProducts(
        "products",
        searchTerm,
        currentPage,
        transferTo,
        selectedTransferTo
      ),
    {
      keepPreviousData: true,
      enabled: !!transferTo && !!selectedTransferTo, // Only fetch when both type and ID are selected
    }
  );

  const products = data?.products || [];
  const totalProducts = data?.total || 0;

  const filteredProducts = products.filter(
    (product) => product.name.toLowerCase().includes(searchTerm.toLowerCase())
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

    const existingItem = cart.find((item) => item._id === product._id);

    if (existingItem) {
      // Allow adding if stock is available, for all customer customerType
      if (existingItem.quantity < product.currentStock) {
        setCart(
          cart.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
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

    const product = products.find((p) => p._id === _id);
    if (product && newQuantity <= product.currentStock) {
      setCart(
        cart.map((item) =>
          item._id === _id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (_id) => {
    const newCart = cart.filter((item) => item._id !== _id);
    setCart(newCart);
  };

  const subtotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [cart]
  );
  
  const discountAmount = useMemo(() => (subtotal * discount) / 100, [subtotal, discount]);
  const directDiscountAmount = directDiscount;
  const total = subtotal - discountAmount - directDiscountAmount;
  const totalCartItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

// {{ ... }}
  const handlePayment = () => {
    setShowPaymentModal(true);
  };

  const addPaymentMethod = () => {
    setPaymentMethods([
      ...paymentMethods,
      { method: "cash", amount: 0, bankAccount: "", proofFile: null },
    ]);
  };

  const updatePaymentMethod = (index, field, value) => {
    const updated = paymentMethods.map((payment, i) =>
      i === index ? { ...payment, [field]: value } : payment
    );
    setPaymentMethods(updated);
    setTotalPaid(
      updated.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0)
    );
  };

  const handleSalepaymets = async (saleId) => {
    const validPayments = paymentMethods.filter(
      (p) => p.amount && parseFloat(p.amount) > 0
    );

    if (!validPayments.length) {
      throw new Error("Please add at least one payment method with amount");
    }

    for (const payment of validPayments) {
      if (
        payment.method === "bank_transfer" ||
        payment.method === "online_payment" ||
        payment.method === "bank"
      ) {
        if (!payment.bankAccount) {
          throw new Error("Please select a bank account for bank/online payment");
        }
      }
    }

    const status =
      totalPaid === total
        ? "completed"
        : totalPaid > 0
        ? "partial"
        : "pending";

    const paymentDateIso = saleDataadd.paymentDate
      ? new Date(saleDataadd.paymentDate).toISOString()
      : new Date().toISOString();

    const paymentsPayload = validPayments.map((payment) => ({
      method: payment.method,
      amount: Number(payment.amount),
      ...(payment.bankAccount
        ? { bankAccount: payment.bankAccount }
        : undefined),
    }));

    const formData = new FormData();
    formData.append("paymentType", "sale_payment");
    if (saleId) formData.append("sale", saleId);
    if (selectedCustomer?._id) formData.append("customer", selectedCustomer._id);
    formData.append("payments", JSON.stringify(paymentsPayload));
    formData.append("paymentDate", paymentDateIso);
    if (saleDataadd.transactionId) {
      formData.append("transactionId", saleDataadd.transactionId);
    }
    formData.append("status", status);
    if (saleDataadd.description) {
      formData.append("notes", saleDataadd.description);
    }
    if (saleDataadd.currency) {
      formData.append("currency", saleDataadd.currency);
    }
    formData.append("isAdvancePayment", "false");
    const metadata = {
      source: "pos",
      deviceInfo: navigator?.platform || "pos-device",
      ipAddress: saleDataadd.ipAddress || "",
      userAgent: navigator?.userAgent || "",
    };
    formData.append("metadata", JSON.stringify(metadata));

    const paymentsWithProof = validPayments.filter((p) => p.proofFile);
    if (paymentsWithProof.length) {
      paymentsWithProof.forEach((payment) => {
        formData.append("attachments", payment.proofFile);
      });
      const attachmentsMeta = paymentsWithProof.map((payment) => ({
        name: payment.proofFile?.name,
        type: payment.proofFile?.type || "application/octet-stream",
        method: payment.method,
      }));
      formData.append("attachmentsMeta", JSON.stringify(attachmentsMeta));
    }

    await userRequest.post("/payments", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const completeSale = async () => {
    try {
      const saleData = {
        customer: selectedCustomer?._id,
        [transferTo]: selectedTransferTo,
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
          // Include warehouse reference if available on the cart item
          warehouse: item?.warehouse?._id || undefined,
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

      const response = await userRequest.post("/sales", saleData);

      const saleId = response?.data?.data?._id || response?.data?._id;
      if (!saleId) {
        throw new Error("Sale created but no sale id returned.");
      }

      await handleSalepaymets(saleId);
      refetch();
      setCart([]);
      setDiscount(0);
      setPaymentMethods([]);
      setTotalPaid(0);
      setSaleDataadd((prev) => ({
        ...prev,
        description: "",
        transactionId: "",
        paymentDate: new Date().toISOString().slice(0, 16),
      }));
      setShowPaymentModal(false);
      navigate("/Navigation");
      toast.success("Sale and payment completed successfully!");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to complete sale. Please try again."
      );
    }
  };

  // Reusable inline CurrencyName component
  const CurrencyName = ({ currencyId, label, color }) => {
    const { data, isLoading } = useQuery(
      ["currency", currencyId],
      () =>
        userRequest.get(`/currencies/${currencyId}`).then((res) => res.data),
      { enabled: !!currencyId }
    );

    return (
      <Chip color={color} variant="flat" className="text-xs">
        {isLoading ? "Loading..." : `${label}: ${data?.data?.symbol || "N/A"}`}
      </Chip>
    );
  };

  // Reusable inline WarehouseName component
  const WarehouseName = ({ warehouseId, label, color }) => {
    const { data, isLoading } = useQuery(
      ["warehouse", warehouseId],
      () =>
        userRequest.get(`/warehouses/${warehouseId}`).then((res) => res.data),
      { enabled: !!warehouseId }
    );

    return (
      <Chip color={color} variant="flat" className="text-xs">
        {isLoading
          ? "Loading..."
          : `${label}: ${data?.data?.name || data?.name || "-"}`}
      </Chip>
    );
  };

  const [itemRows, setItemRows] = useState([
    { productId: "", price: "", quantity: 1 },
  ]);

  
  const handleAddItemRow = () => {
    setItemRows([...itemRows, { productId: "", price: "", quantity: 1 }]);
  };

  const handleRemoveItemRow = (index) => {
    setItemRows(itemRows.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItemRows(
      itemRows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
    // Optionally, update price when product changes
    if (field === "productId") {
      const product = filteredProducts.find((p) => p._id === value);
      if (product) {
        setItemRows((rows) =>
          rows.map((row, i) =>
            i === index ? { ...row, price: product.price || "" } : row
          )
        );
      }
    }
  };
  

  return (
    <div className="p-4 ">
      <div className="flex justify-end mb-4">
        <Button
          variant="flat"
          onPress={() => navigate('/Navigation')}
        >
          Dashboard
        </Button>
      </div>
      <div className=" h-full">
        {/* Product Search & Selection */}
        <div className="space-y-4 ">
          <Card>
            <CardBody className="p-4">
              <div className="flex gap-4 mb-4">
                {/* <Input
                  placeholder="Search products by name or scan barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  startContent={<FaSearch className="text-gray-400" />}
                  className="flex-1"
                /> */}
                {/* <Button
                  color="primary"
                  onPress={() => setShowCustomerModal(true)}
                  startContent={<FaUser />}
                >
                  Customer
                </Button> */}
                <CustomerSelectionModal
                  // isOpen={showCustomerModal}
                  // onClose={() => setShowCustomerModal(false)}
                  customers={customers}
                  selectedCustomer={selectedCustomer}
                  setSelectedCustomer={setSelectedCustomer}
                />
              </div>
              <div className="flex justify-between flex-col md:flex-row sm:flex-col lg:flex-row mb-3 gap-2">
                <div className="text-sm w-full my-auto">
                  Customer:{" "}
                  <strong>{selectedCustomer?.name || "Select Customer"}</strong>{" "}
                  ({selectedCustomer?.customerType || ""})
                </div>
                {/* <div className="flex items-center gap-2 my-auto w-full"> */}
                <Select
                  placeholder="Select Shop or Warehouse"
                  selectedKeys={transferTo ? [transferTo] : []}
                  onChange={(e) => setTransferTo(e.target.value)}
                  // className="w-full"
                >
                  <SelectItem key="warehouse" value="warehouse">
                    Warehouse
                  </SelectItem>
                  <SelectItem key="shop" value="shop">
                    Shop
                  </SelectItem>
                </Select>
                <Select
                  placeholder={`Select ${
                    transferTo === "shop" ? "Shop" : "Warehouse"
                  }`}
                  selectedKeys={selectedTransferTo ? [selectedTransferTo] : []}
                  onChange={(e) => setSelectedTransferTo(e.target.value)}
                  // isDisabled={!transferTo || isLoading}
                  // className="w-full"
                >
                  {transferOptions.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </Select>
                <div className="bg-gradient-to-r w-full from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow font-semibold text-sm">
                  Total Products: {filteredProducts.length || "0"}
                </div>
              </div>

              <div className="flex w-full justify-end">
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<FaPlus />}
                  onPress={handleAddItemRow}
                >
                  Add Item
                </Button>
              </div>
              {itemRows.map((row, index) => {
                const selectedProduct = filteredProducts.find(
                  (p) => p._id === row.productId
                );

                return (
                  <div className="flex gap-2 my-2" key={index}>
                    <Select
                      label="Select Product"
                      placeholder="Search products by name"
                      className="w-full"
                      labelPlacement="outside"
                      variant="bordered"
                      scrollShadowProps={{ isEnabled: false }}
                      selectedKeys={row.productId ? [row.productId] : []}
                      onSelectionChange={(keys) => {
                        const selectedId = Array.from(keys)[0];
                        const product = filteredProducts.find(
                          (p) => p._id === selectedId
                        );
                        if (product) {
                          // Add the product to cart
                          addToCart({
                            ...product,
                            price:
                              selectedCustomer?.customerType === "wholesale"
                                ? product.wholesalePrice ??
                                  product.wholesaleRate ??
                                  product.price
                                : selectedCustomer?.customerType === "retail"
                                ? product.retailRate ??
                                  product.retailRate ??
                                  product.price
                                : product.price,
                            quantity: 1,
                            _id: product._id,
                          });

                          // Update the row with selected product details
                          const updatedRows = [...itemRows];
                          updatedRows[index] = {
                            ...updatedRows[index],
                            productId: selectedId,
                            price:
                              selectedCustomer?.customerType === "wholesale"
                                ? product.wholesalePrice ??
                                  product.wholesaleRate ??
                                  product.price
                                : selectedCustomer?.customerType === "retail"
                                ? product.retailRate ??
                                  product.retailRate ??
                                  product.price
                                : product.price,
                            quantity: 1,
                          };
                          setItemRows(updatedRows);
                        }
                      }}
                    >
                      {filteredProducts.map((product) => {
                        // Calculate display price based on customer type
                        let displayPrice = product.price;
                        if (selectedCustomer?.customerType === "wholesale") {
                          displayPrice =
                            product.wholesalePrice ??
                            product.wholesaleRate ??
                            product.price;
                        } else if (
                          selectedCustomer?.customerType === "retail"
                        ) {
                          displayPrice =
                            product.retailRate ??
                            product.retailRate ??
                            product.price;
                        }

                        return (
                          <SelectItem
                            key={product._id}
                            value={product._id}
                            textValue={`${product.name} - ${displayPrice}`}
                          >
                            <div className="flex flex-col">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">
                                  {product.name}
                                </span>
                                <span className="text-sm font-bold">
                                  {displayPrice}
                                  <CurrencyName
                                    currencyId={product?.currency}
                                    label=""
                                    color="warning"
                                  />
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>Stock: {product.currentStock}</span>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </Select>

                    {/* Price Input - Read Only */}
                    <div className="w-28">
                      <label className="text-sm text-foreground-500 mb-1">
                        Price
                      </label>
                      <div className="flex items-center px-3 border-2 border-default-200 rounded-lg">
                        {selectedProduct?.currency && (
                          <span className="ml-1 text-xs text-foreground-400">
                            <CurrencyName
                              currencyId={selectedProduct.currency}
                              label=""
                              color="default"
                            />
                          </span>
                        )}
                        <span className="text-sm font-medium">
                          {row.price ? Number(row.price).toFixed(2) : "0.00"}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Input */}
                    <Input
                      label="Qty"
                      labelPlacement="outside"
                      type="number"
                      placeholder="1"
                      value={row.quantity === undefined || row.quantity === null ? "" : row.quantity}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        
                        // Allow empty input for smooth editing
                        if (inputValue === "") {
                          const updatedRows = [...itemRows];
                          updatedRows[index] = {
                            ...updatedRows[index],
                            quantity: "",
                          };
                          setItemRows(updatedRows);
                          return;
                        }
                        
                        const newQty = parseInt(inputValue);
                        
                        // Validate if it's a valid number
                        if (isNaN(newQty) || newQty < 1) {
                          return;
                        }
                        
                        if (
                          selectedProduct &&
                          newQty > selectedProduct.currentStock
                        ) {
                          toast.error(
                            `Only ${selectedProduct.currentStock} items available in stock`
                          );
                          return;
                        }
                        
                        // Update itemRows
                        const updatedRows = [...itemRows];
                        updatedRows[index] = {
                          ...updatedRows[index],
                          quantity: newQty,
                        };
                        setItemRows(updatedRows);
                        
                        // Also update the cart
                        if (row.productId) {
                          setCart(cart.map(item => 
                            item._id === row.productId 
                              ? { ...item, quantity: newQty }
                              : item
                          ));
                        }
                      }}
                      onBlur={(e) => {
                        // Set default to 1 if empty when user leaves the field
                        const inputValue = e.target.value;
                        if (inputValue === "" || isNaN(parseInt(inputValue)) || parseInt(inputValue) < 1) {
                          const updatedRows = [...itemRows];
                          updatedRows[index] = {
                            ...updatedRows[index],
                            quantity: 1,
                          };
                          setItemRows(updatedRows);
                          
                          // Also update the cart
                          if (row.productId) {
                            setCart(cart.map(item => 
                              item._id === row.productId 
                                ? { ...item, quantity: 1 }
                                : item
                            ));
                          }
                        }
                      }}
                      min="1"
                      max={selectedProduct?.currentStock || 9999}
                      variant="bordered"
                    />
                    <div className="my-auto">
                      <Input value={(row.quantity || 1) * (row.price || 0)} variant="bordered"
                      readOnly 
                      label='Total'
                      placeholder='Total'
                      labelPlacement='outside'
                      ></Input>
                    </div>

                    <Button
                      isIconOnly
                      color="danger"
                      variant="light"
                      className="my-auto"
                      onPress={() => handleRemoveItemRow(index)}
                      isDisabled={itemRows.length === 1}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                );
              })}
            </CardBody>
          </Card>
          <div className="mt-4 space-y-3">
            <Divider />

            {/* Discount & Tax */}
            <Card>
              <CardBody>
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
              </CardBody>
            </Card>

            <div className="flex justify-end">
              <Button
                color="success"
                size="lg"
                // className="w-full"
                onPress={handlePayment}
                startContent={<FaPrint />}
              >
                Process Payment
              </Button>
            </div>
          </div>
        </div>
      </div>

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
