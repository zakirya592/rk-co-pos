import React, { useEffect, useState, useMemo } from "react";
import {
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Card,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaExclamationTriangle } from "react-icons/fa";
import userRequest from "../../utils/userRequest";

const DamageProducts = () => {
  const { type, id } = useParams(); // type will be 'warehouse' or 'shop'
  const navigate = useNavigate();
  const [damageProducts, setDamageProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [totalDamages, setTotalDamages] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locationProducts, setLocationProducts] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [form, setForm] = useState({
    product: "",
    quantity: "",
    damageType: "transport_damage",
    damageReason: "",
    damageDescription: "",
    estimatedLoss: "",
    currency: "",
    disposalMethod: "destroy",
    disposalNotes: "",
    images: [],
  });

  const totalLoss = useMemo(() => {
    const sum = (damageProducts || []).reduce((acc, item) => acc + (Number(item.estimatedLoss) || 0), 0);
    return sum;
  }, [damageProducts]);
  const headerCurrency = damageProducts?.[0]?.currency;

  const fetchDamageProducts = async () => {
    setLoading(true);
    try {
      const endpoint = `/product-damages/by-location/${type}/${id}`;
      const res = await userRequest.get(endpoint);
      const productsData = res.data?.data || [];
      setDamageProducts(productsData);
      setLocationInfo(res.data?.location || null);
      setTotalDamages(res.data?.totalDamages || productsData.length);
    } catch (err) {
      console.error("Failed to fetch damage products:", err);
      setError("Failed to fetch damage products");
    }
    setLoading(false);
  };

  const fetchLocationProducts = async () => {
    try {
      const res = await userRequest.get(`/products/location/${type}/${id}`);
      setLocationProducts(res.data?.data || []);
    } catch (e) {
      console.error("Failed to fetch location products", e);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const res = await userRequest.get(`/currencies`);
      setCurrencies(res.data?.data || []);
    } catch (e) {
      console.error("Failed to fetch currencies", e);
    }
  };

  useEffect(() => {
    fetchDamageProducts();
    fetchLocationProducts();
    fetchCurrencies();
  }, [type, id]);

  const handleBack = () => {
    if (type === "warehouse") {
      navigate(`/warehousedetails/warehouse/${id}`);
    } else if (type === "shop") {
      navigate(`/shopdetails/shop/${id}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FaExclamationTriangle className="text-red-500" />
              Damage Products
            </h1>
            <p className="text-gray-600 mt-1">
              {(locationInfo?.name || `${type} ${id}`)} - {totalDamages} damaged products found
            </p>
            <p className="text-gray-700 mt-1 font-semibold">
              Total Loss: {headerCurrency?.symbol} {Number(totalLoss || 0).toLocaleString()} {headerCurrency?.code}
            </p>
          </div>
        </div>
        <div>
          <Button
            className="bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold"
            onClick={() => setIsAddOpen(true)}
          >
            Add Damage Product
          </Button>
        </div>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardBody>
            <p className="text-red-600">{error}</p>
          </CardBody>
        </Card>
      )}

      <Table
        aria-label="Damage Products"
        className="w-full overflow-x-scroll"
      >
        <TableHeader>
          <TableColumn>Product</TableColumn>
          <TableColumn>Quantity</TableColumn>
          <TableColumn>Damage Type</TableColumn>
          <TableColumn>Reason</TableColumn>
          <TableColumn>Description</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Estimated Loss</TableColumn>
          <TableColumn>Currency</TableColumn>
          <TableColumn>Reported By</TableColumn>
          <TableColumn>Approved By</TableColumn>
          <TableColumn>Disposal</TableColumn>
          <TableColumn>Disposal Notes</TableColumn>
          <TableColumn>Date</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={loading}
          loadingContent={
            <div className="flex justify-center items-center py-8">
              <Spinner color="danger" size="lg" />
            </div>
          }
          emptyContent={
            <div className="text-center text-gray-500 py-8">
              <FaExclamationTriangle className="mx-auto mb-2 text-4xl text-gray-300" />
              <p>No damaged products found</p>
              <p className="text-sm">All products are in good condition</p>
            </div>
          }
        >
          {damageProducts.map((item) => (
            <TableRow key={item._id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{item.product?.name || "Unknown Product"}</span>
                  <Chip color="danger" size="sm" variant="flat">
                    Damaged
                  </Chip>
                </div>
              </TableCell>
              <TableCell>
                <Chip color="danger" variant="flat">{item.quantity}</Chip>
              </TableCell>
              <TableCell>{item.damageType?.replace(/_/g, " ") || "-"}</TableCell>
              <TableCell>{item.damageReason || "-"}</TableCell>
              <TableCell>{item.damageDescription || "-"}</TableCell>
              <TableCell>
                <Chip color={item.status === "approved" ? "success" : item.status === "rejected" ? "danger" : "warning"} variant="flat">
                  {item.status}
                </Chip>
              </TableCell>
              <TableCell>
                <span className="text-red-600 font-semibold">{item.estimatedLoss ?? 0}</span>
              </TableCell>
              <TableCell>{item.currency?.symbol} {item.currency?.code}</TableCell>
              <TableCell>{item.reportedBy?.name || "-"}</TableCell>
              <TableCell>{item.approvedBy?.name || "-"}</TableCell>
              <TableCell>{item.disposalMethod || "-"}</TableCell>
              <TableCell>{item.disposalNotes || "-"}</TableCell>
              <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Add Damage Product</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Product"
                    selectedKeys={form.product ? [form.product] : []}
                    onChange={(e) => setForm({ ...form, product: e.target.value })}
                    placeholder="Select product"
                    isRequired
                  >
                    {locationProducts.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    type="number"
                    label="Quantity"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="Enter quantity"
                    isRequired
                  />

                  <Select
                    label="Damage Type"
                    selectedKeys={[form.damageType]}
                    onChange={(e) => setForm({ ...form, damageType: e.target.value })}
                  >
                    {[
                      "transport_damage",
                      "storage_damage",
                      "handling_damage",
                      "manufacturing_defect",
                      "expired",
                      "other",
                    ].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Currency"
                    selectedKeys={form.currency ? [form.currency] : []}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    placeholder="Select currency"
                    isRequired
                  >
                    {currencies.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.symbol} {c.code}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    type="number"
                    label="Estimated Loss"
                    value={form.estimatedLoss}
                    onChange={(e) => setForm({ ...form, estimatedLoss: e.target.value })}
                    placeholder="Enter estimated loss"
                  />

                  <Select
                    label="Disposal Method"
                    selectedKeys={[form.disposalMethod]}
                    onChange={(e) => setForm({ ...form, disposalMethod: e.target.value })}
                  >
                    {["destroy", "return_to_supplier", "repair", "sell_as_is", "recycle"].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    type="file"
                    label="Images"
                    multiple
                    onChange={(e) => setForm({ ...form, images: Array.from(e.target.files || []) })}
                  />

                  <Input
                    label="Damage Reason"
                    value={form.damageReason}
                    onChange={(e) => setForm({ ...form, damageReason: e.target.value })}
                    placeholder="Enter reason"
                    isRequired
                  />

                  <Textarea
                    label="Damage Description"
                    value={form.damageDescription}
                    onChange={(e) => setForm({ ...form, damageDescription: e.target.value })}
                    placeholder="Describe the damage"
                    minRows={3}
                  />

                  <Textarea
                    label="Disposal Notes"
                    value={form.disposalNotes}
                    onChange={(e) => setForm({ ...form, disposalNotes: e.target.value })}
                    placeholder="Notes about disposal"
                    minRows={2}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onClick={onClose} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold"
                  isLoading={submitting}
                  onClick={async () => {
                    if (!form.product || !form.quantity || !form.currency) {
                      setError("Please fill required fields: product, quantity, currency");
                      return;
                    }
                    setSubmitting(true);
                    setError(null);
                    try {
                      const fd = new FormData();
                      fd.append("product", form.product);
                      if (type === "warehouse") {
                        fd.append("warehouse", id);
                      } else if (type === "shop") {
                        fd.append("shop", id);
                      }
                      fd.append("quantity", String(form.quantity));
                      fd.append("damageType", form.damageType);
                      fd.append("damageReason", form.damageReason);
                      fd.append("damageDescription", form.damageDescription);
                      fd.append("estimatedLoss", String(form.estimatedLoss || 0));
                      fd.append("currency", form.currency);
                      fd.append("disposalMethod", form.disposalMethod);
                      fd.append("disposalNotes", form.disposalNotes);
                      (form.images || []).forEach((file) => fd.append("images", file));

                      await userRequest.post(`/product-damages`, fd, {
                        headers: { "Content-Type": "multipart/form-data" },
                      });

                      await fetchDamageProducts();
                      setIsAddOpen(false);
                      setForm({
                        product: "",
                        quantity: "",
                        damageType: "transport_damage",
                        damageReason: "",
                        damageDescription: "",
                        estimatedLoss: "",
                        currency: "",
                        disposalMethod: "destroy",
                        disposalNotes: "",
                        images: [],
                      });
                    } catch (e) {
                      console.error("Failed to create product damage", e);
                      setError(e?.response?.data?.message || "Failed to create damage record");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  Save Damage
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DamageProducts;
