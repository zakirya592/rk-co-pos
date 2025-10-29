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
import StockTransferModal from "./StockTransferModal";

const TransfersByLocation = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();

  const locationType = (type === "shop" ? "shop" : "warehouse");
  const locationId = id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transfers, setTransfers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);

  const [products, setProducts] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const title = useMemo(() => {
    return `Stock Transfers — ${locationType === "shop" ? "Shop" : "Warehouse"}`;
  }, [locationType]);

  const fetchTransfers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await userRequest.get(`/stock-transfers/by-location/${locationType}/${locationId}`);
      const payload = res?.data || {};
      setTransfers(payload?.data || []);
      setSummary(payload?.summary || null);
      setLocationInfo(payload?.location || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load transfers");
    }
    setLoading(false);
  };

  const fetchProductsForLocation = async () => {
    try {
      if (locationType === "warehouse") {
        const res = await userRequest.get(`/stock-transfers/by-location/warehouse/${locationId}`);
        const payload = res?.data || {};
        const transfers = payload?.data || [];
        const availableStock = payload?.availableStockByProduct || [];

        const productIdToProduct = new Map();
        transfers.forEach((t) => {
          (t.items || []).forEach((it) => {
            const prod = it?.product;
            if (prod && prod._id && !productIdToProduct.has(prod._id)) {
              productIdToProduct.set(prod._id, prod);
            }
          });
        });

        const derivedProducts = availableStock.map((row) => {
          const prod = productIdToProduct.get(row.product) || { _id: row.product, name: "Unknown" };
          return {
            ...prod,
            availableStockAtWarehouse: row.availableAtLocation ?? 0,
          };
        });

        setProducts(derivedProducts);
      } else if (locationType === "shop") {
        const res = await userRequest.get(`/products/location/shop/${locationId}`);
        setProducts(res?.data?.data || []);
      } else {
        const res = await userRequest.get(`/products/location/${locationType}/${locationId}`);
        setProducts(res?.data?.data || []);
      }
    } catch {
      setProducts([]);
    }
  };

  useEffect(() => {
    if (!locationId) return;
    fetchTransfers();
    fetchProductsForLocation();
  }, [locationType, locationId]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          {locationInfo && (
            <p className="text-gray-500 mt-1">
              {locationInfo?.name} ({locationInfo?.code})
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="flat"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
            onClick={() => setIsAddOpen(true)}
          >
            Add Stock Transfer
          </Button>
        </div>
      </div>

      <Table
        aria-label="Transfers by location"
        className="w-full overflow-x-scroll"
      >
        <TableHeader>
          <TableColumn>Transfer #</TableColumn>
          <TableColumn>Date</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>From</TableColumn>
          <TableColumn>To</TableColumn>
          <TableColumn>Products</TableColumn>
          <TableColumn>Total Qty</TableColumn>
          <TableColumn>User</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={loading}
          loadingContent={
            <div className="flex justify-center items-center py-8">
              <Spinner color="success" size="lg" />
            </div>
          }
          emptyContent={
            <div className="text-center text-gray-500 py-8">
              {error || "No transfers found"}
            </div>
          }
        >
          {transfers.map((t) => {
            // Use the new source/destination objects or fallback to sourceId/destinationId
            const sourceObj = t?.source || (t?.sourceId && typeof t.sourceId === "object" ? t.sourceId : null);
            const destinationObj = t?.destination || (t?.destinationId && typeof t.destinationId === "object" ? t.destinationId : null);

            const formatEntity = (entityType, entity, nameField) => {
              const typeLabel = entityType ? entityType.charAt(0).toUpperCase() + entityType.slice(1) : "-";
              
              // Use the direct name field if available
              if (nameField) {
                return nameField;
              }
              
              if (entity && typeof entity === "object") {
                const name = entity?.name || typeLabel;
                const code = entity?.code ? ` (${entity.code})` : "";
                const branch = entity?.branch ? ` - ${entity.branch}` : "";
                return `${name}${code}${branch}`;
              }
              
              // If API didn't populate entity object, use current location name when it matches this side
              if (locationInfo && entityType === locationType) {
                const name = locationInfo?.name || typeLabel;
                const code = locationInfo?.code ? ` (${locationInfo.code})` : "";
                return `${name}${code}`;
              }
              return typeLabel;
            };

            const formatProducts = (items) => {
              if (!items || items.length === 0) return "No items";
              
              return items.map((item, index) => {
                const productName = item?.product?.name || "Unknown Product";
                const quantity = item?.quantity || 0;
                const available = item?.availableAtLocation;
                return available !== undefined
                  ? `${productName} (${quantity}, avail: ${available})`
                  : `${productName} (${quantity})`;
              }).join(", ");
            };

            const totalQuantity = (t.items || []).reduce((sum, it) => sum + (it.quantity || 0), 0);

            return (
              <TableRow key={t._id}>
                <TableCell>
                  <div className="font-medium">{t.transferNumber}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(t.transferDate).toLocaleDateString()}
                    <div className="text-xs text-gray-500">
                      {new Date(t.transferDate).toLocaleTimeString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip 
                    color={t.status === "completed" ? "success" : t.status === "pending" ? "warning" : "default"}
                    variant="flat"
                  >
                    {t.status?.charAt(0).toUpperCase() + t.status?.slice(1)}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatEntity(t.sourceType, sourceObj, t.sourceName)}
                    <div className="text-xs text-gray-500">{t.sourceType}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatEntity(t.destinationType, destinationObj, t.destinationName)}
                    <div className="text-xs text-gray-500">{t.destinationType}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm max-w-xs">
                    {formatProducts(t.items)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-center">{totalQuantity}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {t?.user?.name || "-"}
                    {t?.user?.email && (
                      <div className="text-xs text-gray-500">{t.user.email}</div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {summary && (
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Incoming: <b>{summary.incomingTransfers}</b></span>
          <span>Outgoing: <b>{summary.outgoingTransfers}</b></span>
          <span>Total: <b>{summary.totalTransfers}</b></span>
        </div>
      )}

      <StockTransferModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        products={products}
        sourceType={locationType}
        fromWarehouseId={locationId}
        apirefresh={() => {
          fetchProductsForLocation();
          fetchTransfers();
        }}
      />
    </div>
  );
};

export default TransfersByLocation;


