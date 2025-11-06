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
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [key]: value } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, { product: "", quantity: 1, price: 0 }]);
  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

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
              selectedKeys={customer ? [customer] : []}
              onChange={(e) => setCustomer(e.target.value)}
            >
              {/* Expect options to be filled elsewhere or via a separate component; keeping manual input fallback */}
              {customer && <SelectItem key={customer} value={customer}>{customer}</SelectItem>}
            </Select>

            <Input label="Warehouse ID" value={warehouse} onChange={(e) => setWarehouse(e.target.value)} />
            <Input label="Shop ID (optional)" value={shop} onChange={(e) => setShop(e.target.value)} />

            <Select
              label="Payment Status"
              selectedKeys={[paymentStatus]}
              onChange={(e) => setPaymentStatus(e.target.value)}
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
                  <Input
                    label="Product ID"
                    value={it.product}
                    onChange={(e) => updateItem(idx, "product", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label="Qty"
                    type="number"
                    value={String(it.quantity)}
                    onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    label="Price"
                    type="number"
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


