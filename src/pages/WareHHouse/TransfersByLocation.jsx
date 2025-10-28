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
      const res = await userRequest.get(`/products/location/${locationType}/${locationId}`);
      setProducts(res?.data?.data || []);
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
          <TableColumn>Source</TableColumn>
          <TableColumn>Destination</TableColumn>
          <TableColumn>Items</TableColumn>
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
          {transfers.map((t) => (
            <TableRow key={t._id}>
              <TableCell>{t.transferNumber}</TableCell>
              <TableCell>{new Date(t.transferDate).toLocaleString()}</TableCell>
              <TableCell>
                <Chip color={t.status === "completed" ? "success" : "warning"}>
                  {t.status}
                </Chip>
              </TableCell>
              <TableCell>
                <Chip variant="flat">{t.sourceType}</Chip>
              </TableCell>
              <TableCell>
                <Chip variant="flat">{t.destinationType}</Chip>
              </TableCell>
              <TableCell>
                {(t.items || []).reduce((sum, it) => sum + (it.quantity || 0), 0)}
              </TableCell>
              <TableCell>{t?.user?.name || "-"}</TableCell>
            </TableRow>
          ))}
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


