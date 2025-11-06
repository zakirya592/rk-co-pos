import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Spinner,
  Textarea,
} from "@nextui-org/react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import userRequest from "../../utils/userRequest";
import toast from "react-hot-toast";

const UpdateSale = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sale, setSale] = useState(null);

  // Editable fields
  const [customer, setCustomer] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [shop, setShop] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);

  // Fetch customers
  const { data: customersData } = useQuery(
    ["customers"],
    async () => {
      const res = await userRequest.get("/customers");
      return res.data?.data || [];
    },
    { keepPreviousData: true }
  );
  const customers = customersData || [];

  // Fetch products
  const { data: productsData } = useQuery(
    ["products"],
    async () => {
      const res = await userRequest.get("/products");
      return res.data?.data || [];
    },
    { keepPreviousData: true }
  );
  const products = productsData || [];

  // Fetch warehouses
  const { data: warehousesData } = useQuery(
    ["warehouses"],
    async () => {
      const res = await userRequest.get("/warehouses");
      return res.data?.data || [];
    },
    { keepPreviousData: true }
  );
  const warehouses = warehousesData || [];

  // Fetch shops
  const { data: shopsData } = useQuery(
    ["shops"],
    async () => {
      const res = await userRequest.get("/shops");
      return res.data?.data || [];
    },
    { keepPreviousData: true }
  );
  const shops = shopsData || [];

  useEffect(() => {
    const fetchSale = async () => {
      try {
        setLoading(true);
        const res = await userRequest.get(`/sales/${id}`);
        const s = res?.data?.data || res?.data;
        setSale(s);

        setCustomer(s?.customer?._id || s?.customer || "");
        setWarehouse(s?.warehouse || "");
        setShop(s?.shop || "");
        setTotalAmount(Number(s?.totalAmount || 0));
        setDiscount(Number(s?.discount || 0));
        setTax(Number(s?.tax || 0));
        setGrandTotal(Number(s?.grandTotal || 0));
        setPaymentStatus(s?.paymentStatus || "unpaid");
        setDueDate(s?.dueDate ? new Date(s.dueDate).toISOString().slice(0, 10) : "");
        setNotes(s?.notes || "");
        setItems(
          (s?.items || []).map((it) => ({
            product: typeof it.product === "object" ? it.product._id : it.product,
            quantity: it.quantity,
            price: it.price,
          }))
        );
      } catch (e) {
        toast.error("Failed to load sale");
      } finally {
        setLoading(false);
      }
    };
    fetchSale();
  }, [id]);

  const calculatedGrandTotal = useMemo(() => {
    const subtotal = items.reduce((sum, it) => sum + Number(it.quantity || 0) * Number(it.price || 0), 0);
    const afterDiscount = subtotal - Number(discount || 0);
    const afterTax = afterDiscount + Number(tax || 0);
    return afterTax;
  }, [items, discount, tax]);

  useEffect(() => {
    setTotalAmount(items.reduce((sum, it) => sum + Number(it.quantity || 0) * Number(it.price || 0), 0));
    setGrandTotal(calculatedGrandTotal);
  }, [items, calculatedGrandTotal]);

  const updateItem = (index, key, value) => {
    setItems((prev) => {
      const updated = prev.map((it, i) => {
        if (i === index) {
          const newItem = { ...it, [key]: value };
          // If product changed, update price from product data
          if (key === "product" && value) {
            const selectedProduct = products.find((p) => p._id === value);
            if (selectedProduct) {
              newItem.price = selectedProduct.price || selectedProduct.retailRate || 0;
            }
          }
          return newItem;
        }
        return it;
      });
      return updated;
    });
  };

  const addItem = () => setItems((prev) => [...prev, { product: "", quantity: 1, price: 0 }]);
  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  // Get display name helpers
  const getCustomerName = (customerId) => {
    if (!customerId) return "";
    const found = customers.find((c) => c._id === customerId);
    return found ? found.name : customerId;
  };

  const getProductName = (productId) => {
    if (!productId) return "";
    const found = products.find((p) => p._id === productId);
    return found ? found.name : productId;
  };

  const getWarehouseName = (warehouseId) => {
    if (!warehouseId) return "";
    const found = warehouses.find((w) => w._id === warehouseId);
    return found ? found.name : warehouseId;
  };

  const getShopName = (shopId) => {
    if (!shopId) return "";
    const found = shops.find((s) => s._id === shopId);
    return found ? found.name : shopId;
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        customer,
        totalAmount: Number(totalAmount),
        discount: Number(discount),
        tax: Number(tax),
        grandTotal: Number(grandTotal),
        paymentStatus,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        shop: shop || undefined,
        warehouse,
        notes,
        items: items.map((it) => ({
          product: it.product,
          quantity: Number(it.quantity),
          price: Number(it.price),
        })),
      };

      await userRequest.put(`/sales/${id}`, payload);
      toast.success("Sale updated successfully");
      navigate(`/sales/${id}`);
    } catch (e) {
      const message = e?.response?.data?.message || "Failed to update sale";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Sale</h1>
          <p className="text-gray-600">Invoice: {sale?.invoiceNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="flat" onPress={() => navigate(-1)}>Back</Button>
          <Button color="primary" isLoading={submitting} onPress={handleSubmit}>Save Changes</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardBody className="grid gap-4">
            <Select
              label="Customer"
              placeholder="Select customer"
              selectedKeys={customer ? [customer] : []}
              onSelectionChange={(keys) => {
                const selectedId = Array.from(keys)[0];
                setCustomer(selectedId || "");
              }}
            >
              {customers.map((cust) => (
                <SelectItem key={cust._id} value={cust._id} textValue={cust.name}>
                  {cust.name} {cust.phoneNumber ? `(${cust.phoneNumber})` : ""}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Warehouse"
              placeholder="Select warehouse"
              selectedKeys={warehouse ? [warehouse] : []}
              onSelectionChange={(keys) => {
                const selectedId = Array.from(keys)[0];
                setWarehouse(selectedId || "");
              }}
            >
              {warehouses.map((wh) => (
                <SelectItem key={wh._id} value={wh._id} textValue={wh.name}>
                  {wh.name}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Shop (optional)"
              placeholder="Select shop"
              selectedKeys={shop ? [shop] : []}
              onSelectionChange={(keys) => {
                const selectedId = Array.from(keys)[0];
                setShop(selectedId || "");
              }}
            >
              {shops.map((s) => (
                <SelectItem key={s._id} value={s._id} textValue={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Payment Status"
              selectedKeys={[paymentStatus]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                setPaymentStatus(selected || "unpaid");
              }}
            >
              <SelectItem key="paid" value="paid">Paid</SelectItem>
              <SelectItem key="partially_paid" value="partially_paid">Partially Paid</SelectItem>
              <SelectItem key="unpaid" value="unpaid">Unpaid</SelectItem>
            </Select>

            <Input type="date" label="Due Date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </CardBody>
        </Card>

        <Card>
          <CardBody className="grid gap-4">
            <Input
              label="Subtotal"
              type="number"
              value={String(totalAmount)}
              onChange={(e) => setTotalAmount(Number(e.target.value))}
              isReadOnly
            />
            <Input
              label="Discount"
              type="number"
              value={String(discount)}
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
            <Input
              label="Tax"
              type="number"
              value={String(tax)}
              onChange={(e) => setTax(Number(e.target.value))}
            />
            <Input
              label="Grand Total"
              type="number"
              value={String(grandTotal)}
              onChange={(e) => setGrandTotal(Number(e.target.value))}
              isReadOnly
            />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardBody>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Items</h2>
            <Button size="sm" variant="flat" onPress={addItem}>Add Item</Button>
          </div>
          <div className="grid gap-4">
            {items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Select
                    label="Product"
                    placeholder="Select product"
                    selectedKeys={it.product ? [it.product] : []}
                    onSelectionChange={(keys) => {
                      const selectedId = Array.from(keys)[0];
                      updateItem(idx, "product", selectedId || "");
                    }}
                  >
                    {products.map((prod) => (
                      <SelectItem key={prod._id} value={prod._id} textValue={prod.name}>
                        {prod.name} - {prod.price || prod.retailRate || 0}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="col-span-2">
                  <Input
                    label="Qty"
                    type="number"
                    min="1"
                    value={String(it.quantity)}
                    onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    label="Price"
                    type="number"
                    min="0"
                    value={String(it.price)}
                    onChange={(e) => updateItem(idx, "price", Number(e.target.value))}
                  />
                </div>
                <div className="col-span-2 flex gap-2">
                  <Button color="danger" variant="light" onPress={() => removeItem(idx)}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default UpdateSale;


