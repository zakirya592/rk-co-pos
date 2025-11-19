import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
} from "@nextui-org/react";
import userRequest from "../../utils/userRequest";
import toast from "react-hot-toast";

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

const formatCurrency = (amount, currencyCode = "USD") => {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount) || 0);
};

  const summarizeItems = (items = []) => {
  if (!items.length) return "—";
  return items
    .map((item) => {
      const name = item?.product?.name || item?.productName || "Unknown";
      const qty = item?.quantity ?? item?.returnQuantity ?? 0;
      return `${name} (x${qty})`;
    })
    .join(", ");
};

const summarizeReturnProducts = (products = []) => {
  if (!products.length) return "—";
  return products
    .map((entry) => {
      const name = entry?.product?.name || entry?.productName || "Unknown";
      const qty = entry?.quantity ?? entry?.returnQuantity ?? 0;
      const reason = entry?.returnReason || entry?.reason;
      return `${name} (x${qty}${reason ? `, ${reason}` : ""})`;
    })
    .join("; ");
};

const WarehouseSales = () => {
  const navigate = useNavigate();
  const { type = "warehouse", id } = useParams();
  const locationType = type === "shop" ? "shop" : "warehouse";

  const [sales, setSales] = useState([]);
  const [returns, setReturns] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [salesError, setSalesError] = useState("");
  const [returnsError, setReturnsError] = useState("");
  const [locationInfo, setLocationInfo] = useState(null);
  const [returnModalSale, setReturnModalSale] = useState(null);
  const [returnSelections, setReturnSelections] = useState([]);
  const [returnReason, setReturnReason] = useState("customer_changed_mind");
  const [returnCondition, setReturnCondition] = useState("new");
  const [refundMethod, setRefundMethod] = useState("cash");
  const [returnNotes, setReturnNotes] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  const title = useMemo(() => {
    return `${locationType === "shop" ? "Shop" : "Warehouse"} Sales`;
  }, [locationType]);

  const fetchSales = async () => {
    if (!id) return;
    setSalesLoading(true);
    setSalesError("");
    try {
      const res = await userRequest.get(
        `/sales/by-location/${locationType}/${id}`
      );
      const payload = res?.data || {};
      setSales(payload?.data || []);
      setLocationInfo(payload?.location || payload?.data?.[0]?.warehouse || null);
    } catch (err) {
      setSales([]);
      setSalesError(err?.response?.data?.message || "Failed to load sales");
    }
    setSalesLoading(false);
  };

  const fetchReturns = async () => {
    if (!id) return;
    setReturnsLoading(true);
    setReturnsError("");
    try {
      const res = await userRequest.get(
        `/product-returns/by-location/${locationType}/${id}`
      );
      const payload = res?.data || {};
      const data = payload?.data || [];
      setReturns(data);
      if (!locationInfo && payload?.location) {
        setLocationInfo(payload.location);
      }
    } catch (err) {
      setReturns([]);
      setReturnsError(
        err?.response?.data?.message || "Failed to load return products"
      );
    }
    setReturnsLoading(false);
  };

  useEffect(() => {
    fetchSales();
    fetchReturns();
  }, [locationType, id]);

  useEffect(() => {
    if (!returnModalSale) {
      setReturnSelections([]);
      return;
    }
    const initialSelections = (returnModalSale.items || []).map((item) => {
      const productId = item?.product?._id || item?.product;
      const derivedUnitPrice =
        item?.price ??
        (item?.total && item?.quantity
          ? Number(item.total) / Number(item.quantity || 1)
          : 0);
      const numericPrice =
        typeof derivedUnitPrice === "number"
          ? derivedUnitPrice
          : Number(derivedUnitPrice) || 0;
      const unitPrice = Number(numericPrice.toFixed(2));
      return {
        productId,
        name: item?.product?.name || "Unknown",
        maxQuantity: item?.quantity || 0,
        quantity: 0,
        selected: false,
        unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
        refundTotal: 0,
      };
    });
    setReturnSelections(initialSelections);
    setReturnReason("customer_changed_mind");
    setReturnCondition("new");
    setReturnNotes("");
    setRefundMethod("cash");
  }, [returnModalSale]);

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "success";
      case "partial":
        return "warning";
      case "unpaid":
        return "danger";
      default:
        return "default";
    }
  };

  const getCurrencyCode = (sale) => {
    if (sale?.currency?.code) return sale.currency.code;
    if (sale?.currencyCode) return sale.currencyCode;
    return "USD";
  };

  const handleQuantityChange = (productId, value) => {
    setReturnSelections((prev) =>
      prev.map((entry) =>
        entry.productId === productId
          ? {
              ...entry,
              quantity: Math.min(
                entry.maxQuantity,
                Math.max(0, Number(value) || 0)
              ),
              selected: Number(value) > 0,
            refundTotal:
              Number(value) > 0
                ? Number((entry.unitPrice * Number(value)).toFixed(2))
                : 0,
            }
          : entry
      )
    );
  };

  const toggleProductSelection = (productId, selected) => {
    setReturnSelections((prev) =>
      prev.map((entry) =>
      entry.productId === productId
        ? (() => {
            const newQuantity = selected
              ? entry.quantity || entry.maxQuantity || 0
              : 0;
            return {
              ...entry,
              selected,
              quantity: newQuantity,
              refundTotal: selected
                ? Number((entry.unitPrice * newQuantity).toFixed(2))
                : 0,
            };
          })()
        : entry
      )
    );
  };

const handleRefundTotalChange = (productId, value) => {
  setReturnSelections((prev) =>
    prev.map((entry) =>
      entry.productId === productId
        ? {
            ...entry,
            refundTotal: Math.max(0, Number(value) || 0),
            unitPrice:
              entry.quantity > 0
                ? Number(
                    (
                      Math.max(0, Number(value) || 0) / entry.quantity
                    ).toFixed(2)
                  )
                : entry.unitPrice,
          }
        : entry
    )
  );
};

  const closeReturnModal = () => {
    if (isSubmittingReturn) return;
    setReturnModalSale(null);
  };

  const submitReturnRequest = async () => {
    if (!returnModalSale) return;
    const chosen = returnSelections.filter(
      (entry) => entry.selected && entry.quantity > 0
    );
    if (!chosen.length) {
      toast.error("Select at least one product with quantity.");
      return;
    }

    const payload = {
      customer: returnModalSale.customer?._id || returnModalSale.customer,
      originalSale: returnModalSale._id,
      returnReason,
      products: chosen.map((entry) => ({
        product: entry.productId,
        quantity: entry.quantity,
        originalPrice:
          entry.quantity > 0
            ? Number(
                (
                  (entry.refundTotal || 0) / entry.quantity
                ).toFixed(2)
              )
            : entry.unitPrice,
        returnReason,
        condition: returnCondition,
      })),
      refundMethod,
      customerNotes: returnNotes,
    };

    if (locationType === "warehouse") {
      payload.warehouse = id;
    } else if (locationType === "shop") {
      payload.shop = id;
    }

    setIsSubmittingReturn(true);
    try {
      await userRequest.post("/product-returns", payload);
      toast.success("Return submitted");
      closeReturnModal();
      fetchReturns();
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to submit return request";
      toast.error(message);
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-wrap gap-4 justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          {locationInfo && (
            <p className="text-gray-500 mt-1">
              {locationInfo?.name} {locationInfo?.code && `(${locationInfo.code})`}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="flat" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">Sales Products</h2>
          <p className="text-sm text-gray-500">
            Total Sales: {sales.length}
          </p>
        </div>

        <Table
          aria-label="Sales products table"
          className="w-full overflow-x-auto"
        >
          <TableHeader>
            <TableColumn>Invoice</TableColumn>
            <TableColumn>Customer</TableColumn>
            <TableColumn>Products</TableColumn>
            <TableColumn>Total Qty</TableColumn>
            <TableColumn>Grand Total</TableColumn>
            <TableColumn>Payment</TableColumn>
            <TableColumn>Created</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={salesLoading}
            loadingContent={
              <div className="flex justify-center items-center py-8">
                <Spinner color="success" size="lg" />
              </div>
            }
            emptyContent={
              <div className="text-center text-gray-500 py-8">
                {salesError || "No sales found for this location"}
              </div>
            }
          >
            {sales.map((sale) => {
              const totalQty = (sale.items || []).reduce(
                (sum, item) => sum + (item?.quantity || 0),
                0
              );
              const grandTotal = sale?.grandTotal ?? sale?.totalAmount;
              const currencyCode = getCurrencyCode(sale);

              return (
                <TableRow key={sale._id}>
                  <TableCell className="font-semibold">
                    {sale.invoiceNumber || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {sale.customer?.name || "Walk-in"}
                      {sale.customer?.email && (
                        <div className="text-xs text-gray-500">
                          {sale.customer.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs text-sm">
                    {summarizeItems(sale.items)}
                  </TableCell>
                  <TableCell>{totalQty}</TableCell>
                  <TableCell>
                    {grandTotal !== undefined
                      ? formatCurrency(grandTotal, currencyCode)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={getPaymentStatusColor(sale.paymentStatus)}
                      variant="flat"
                      className="capitalize"
                    >
                      {sale.paymentStatus || "unknown"}
                    </Chip>
                  </TableCell>
                  <TableCell>{formatDateTime(sale.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="flat"
                      onClick={() => setReturnModalSale(sale)}
                    >
                      Process Return
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">Return Products</h2>
          <p className="text-sm text-gray-500">
            Total Returns: {returns.length}
          </p>
        </div>

        <Table
          aria-label="Return products table"
          className="w-full overflow-x-auto"
        >
          <TableHeader>
            <TableColumn>Return #</TableColumn>
            <TableColumn>Customer</TableColumn>
            <TableColumn>Products</TableColumn>
            <TableColumn>Total Qty</TableColumn>
            <TableColumn>Status</TableColumn>
            <TableColumn>Refund</TableColumn>
            <TableColumn>Processed At</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={returnsLoading}
            loadingContent={
              <div className="flex justify-center items-center py-8">
                <Spinner color="success" size="lg" />
              </div>
            }
            emptyContent={
              <div className="text-center text-gray-500 py-8">
                {returnsError || "No return products found for this location"}
              </div>
            }
          >
            {returns.map((entry) => {
              const totalQty = (entry.products || []).reduce(
                (sum, prod) => sum + (prod?.quantity || 0),
                0
              );
              return (
                <TableRow key={entry._id}>
                  <TableCell className="font-semibold">
                    {entry.returnNumber || entry._id}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {entry.customer?.name || "Walk-in"}
                      {entry.customer?.email && (
                        <div className="text-xs text-gray-500">
                          {entry.customer.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm max-w-xs">
                    {summarizeReturnProducts(entry.products)}
                  </TableCell>
                  <TableCell>{totalQty}</TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        entry.status === "processed"
                          ? "success"
                          : entry.status === "pending"
                          ? "warning"
                          : "default"
                      }
                      className="capitalize"
                    >
                      {entry.status || "unknown"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatCurrency(entry.totalRefundAmount)}
                      <div className="text-xs text-gray-500 capitalize">
                        {entry.refundMethod || "credit"} —{" "}
                        {entry.refundStatus || "pending"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDateTime(entry.processedAt || entry.createdAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </section>

      <Modal
        size="2xl"
        isOpen={Boolean(returnModalSale)}
        onOpenChange={closeReturnModal}
        isDismissable={!isSubmittingReturn}
        isKeyboardDismissDisabled={isSubmittingReturn}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Process Return{" "}
            {returnModalSale?.invoiceNumber
              ? `— ${returnModalSale.invoiceNumber}`
              : ""}
          </ModalHeader>
          <ModalBody className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Select products, return quantities, and override refund prices if needed.
              </p>
              <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                {returnSelections.length === 0 && (
                  <p className="text-sm text-gray-400">
                    No products found on this sale.
                  </p>
                )}
                {returnSelections.map((entry) => (
                  <div
                    key={entry.productId}
                    className="flex items-center gap-3 border-b pb-2 last:border-b-0"
                  >
                    <label className="flex items-center gap-2 w-1/2">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4"
                        checked={entry.selected}
                        onChange={(e) =>
                          toggleProductSelection(entry.productId, e.target.checked)
                        }
                      />
                      <span className="text-sm">
                        {entry.name}{" "}
                        <span className="text-xs text-gray-500">
                          (sold: {entry.maxQuantity})
                        </span>
                      </span>
                    </label>
                    <Input
                      type="number"
                      label="Quantity"
                      min={0}
                      max={entry.maxQuantity}
                      value={entry.quantity}
                      disabled={!entry.selected}
                      onChange={(e) =>
                        handleQuantityChange(entry.productId, e.target.value)
                      }
                      className="w-1/4"
                    />
                    <Input
                      type="number"
                      label="Refund Price"
                      min={0}
                      step="0.01"
                      value={entry.originalPrice}
                      disabled={!entry.selected}
                      onChange={(e) =>
                        handlePriceChange(entry.productId, e.target.value)
                      }
                      className="w-1/4"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Select
              label="Return Reason"
              selectedKeys={[returnReason]}
              onChange={(e) => setReturnReason(e.target.value)}
            >
              <SelectItem key="customer_changed_mind">
                Customer changed mind
              </SelectItem>
              <SelectItem key="defective">Defective / damaged</SelectItem>
              <SelectItem key="wrong_item">Wrong item shipped</SelectItem>
              <SelectItem key="other">Other</SelectItem>
            </Select>

            <Select
              label="Condition"
              selectedKeys={[returnCondition]}
              onChange={(e) => setReturnCondition(e.target.value)}
            >
              <SelectItem key="new">New / unopened</SelectItem>
              <SelectItem key="used">Used</SelectItem>
              <SelectItem key="damaged">Damaged</SelectItem>
              <SelectItem key="defective">Defective</SelectItem>
            </Select>

            <Textarea
              label="Notes (optional)"
              placeholder="Any extra detail about this return..."
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
            />

            <Select
              label="Refund Method"
              selectedKeys={[refundMethod]}
              onChange={(e) => setRefundMethod(e.target.value)}
            >
              <SelectItem key="cash">Cash</SelectItem>
              <SelectItem key="credit">Credit</SelectItem>
              <SelectItem key="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem key="store_credit">Store Credit</SelectItem>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onClick={closeReturnModal}
              isDisabled={isSubmittingReturn}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={submitReturnRequest}
              isLoading={isSubmittingReturn}
            >
              Submit Return
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default WarehouseSales;


