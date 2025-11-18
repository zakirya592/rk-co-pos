import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Chip,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import userRequest from "../../utils/userRequest";

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
      setReturns(payload?.data || []);
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
            <TableColumn>Product</TableColumn>
            <TableColumn>Customer</TableColumn>
            <TableColumn>Quantity</TableColumn>
            <TableColumn>Reason</TableColumn>
            <TableColumn>Reference</TableColumn>
            <TableColumn>Created</TableColumn>
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
            {returns.map((entry) => (
              <TableRow key={entry._id}>
                <TableCell>
                  {entry.product?.name ||
                    entry.productName ||
                    entry.item?.product?.name ||
                    "Unknown"}
                </TableCell>
                <TableCell>
                  {entry.customer?.name ||
                    entry.customerName ||
                    entry.sale?.customer?.name ||
                    "Walk-in"}
                </TableCell>
                <TableCell>
                  {entry.quantity ??
                    entry.returnQuantity ??
                    entry.item?.quantity ??
                    0}
                </TableCell>
                <TableCell>{entry.reason || entry.notes || "—"}</TableCell>
                <TableCell>
                  {entry.sale?.invoiceNumber ||
                    entry.referenceNumber ||
                    entry?.saleId ||
                    "—"}
                </TableCell>
                <TableCell>{formatDateTime(entry.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
};

export default WarehouseSales;


