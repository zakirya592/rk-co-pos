import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Select, SelectItem } from "@nextui-org/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
} from "@nextui-org/react";
import userRequest from "../../utils/userRequest";
import toast from "react-hot-toast";

const StockTransferModal = ({
  isOpen,
  onClose,
  products = [],
  sourceType: propSourceType,
  fromWarehouseId,
  apirefresh,
}) => {
  const params = useParams();
  
  let sourceType = propSourceType;
  if (!sourceType) {
    if (params?.type === "warehouse") sourceType = "warehouse";
    else if (params?.type === "shop") sourceType = "shop";
    else sourceType = "warehouse";
  }
  
  const [loading, setLoading] = useState(false);
  const [transferTo, setTransferTo] = useState("");
  const [transferOptions, setTransferOptions] = useState([]);
  const [selectedTransferTo, setSelectedTransferTo] = useState("");
  const [rows, setRows] = useState([{ productId: "", quantity: 1 }]); // default one row
  const [notes, setNotes] = useState("");

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

  const handleAddRow = () => {
    setRows([...rows, { productId: "", quantity: 1 }]);
  };

  const handleRemoveRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  const handleChangeRow = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const handleAdd = async () => {
    try {
      setLoading(true);

      const items = rows
        .filter((row) => row.productId) // only valid rows
        .map((row) => {
          const product = products.find((p) => p._id === row.productId);
          const qty = Math.max(1, Math.min(product.currentStock, row.quantity));
          return {
            product: row.productId,
            quantity: qty,
            notes: "Transfer item",
          };
        });

      if (items.length === 0) {
        toast.error("Please select at least one product");
        setLoading(false);
        return;
      }

      const payload = {
        sourceType,
        sourceId: fromWarehouseId,
        destinationType: transferTo,
        destinationId: selectedTransferTo,
        transferDate: new Date().toISOString(),
        items,
        notes,
      };

      await userRequest.post("/stock-transfers", payload);
      apirefresh();

      // reset
      setRows([{ productId: "", quantity: 1 }]);
      setTransferTo("");
      setSelectedTransferTo("");
      setNotes("");
      setTransferOptions([]);

      toast.success("Stock Transfer successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to transfer", err.response);
      toast.error(
        err?.response?.data?.message || err.message || "Failed to transfer"
      );
    } finally {
      setLoading(false);
    }
  };

  // Collect all selected product IDs
  const selectedProductIds = rows.map((row) => row.productId).filter(Boolean);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      backdrop="blur"
      isDismissable={false}
      classNames={{ wrapper: "flex items-center justify-center min-h-screen" }}
    >
      <ModalContent className="rounded-xl shadow-2xl border border-gray-200 bg-white">
        <ModalHeader className="text-2xl font-bold text-blue-700 border-b pb-2">
          Stock Transfer
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* Destination Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Destination
                </h3>
                <Select
                  placeholder="Select Transfer To"
                  selectedKeys={transferTo ? [transferTo] : []}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="w-full"
                >
                  <SelectItem key="warehouse" value="warehouse">
                    Warehouse
                  </SelectItem>
                  <SelectItem key="shop" value="shop">
                    Shop
                  </SelectItem>
                </Select>
              </div>

              {/* Destination Entity */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Select {transferTo === "shop" ? "Shop" : "Warehouse"}
                </h3>
                <Select
                  placeholder={`Select ${
                    transferTo === "shop" ? "Shop" : "Warehouse"
                  }`}
                  selectedKeys={selectedTransferTo ? [selectedTransferTo] : []}
                  onChange={(e) => setSelectedTransferTo(e.target.value)}
                  isDisabled={!transferTo || loading}
                  className="w-full"
                >
                  {transferOptions.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Products List */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Products</h3>
              {rows.map((row, index) => {
                const product = products.find((p) => p._id === row.productId);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 mb-3 border-b pb-2"
                  >
                    {/* Product Select */}
                    <Select
                      placeholder="Select Product"
                      selectedKeys={
                        row.productId ? new Set([row.productId]) : new Set()
                      }
                      onSelectionChange={(keys) => {
                        const selectedId = Array.from(keys)[0]; // get first selected
                        handleChangeRow(index, "productId", selectedId);
                      }}
                      className="flex-1"
                      isDisabled={
                        products.length === selectedProductIds.length &&
                        !row.productId
                      }
                    >
                      {products.map((p) => (
                        <SelectItem
                          key={p._id}
                          textValue={p.name} // required for accessibility
                          isDisabled={
                            selectedProductIds.includes(p._id) &&
                            p._id !== row.productId
                          }
                        >
                          {p.name} (In stock: {p.currentStock})
                        </SelectItem>
                      ))}
                    </Select>

                    {/* Quantity Input */}
                    <Input
                      type="number"
                      min={1}
                      max={product ? product.currentStock : 9999}
                      value={row.quantity}
                      className="w-24"
                      onChange={(e) =>
                        handleChangeRow(
                          index,
                          "quantity",
                          Math.max(
                            1,
                            Math.min(
                              product ? product.currentStock : 9999,
                              Number(e.target.value)
                            )
                          )
                        )
                      }
                    />

                    {/* Remove button (not on first row) */}
                    {index > 0 && (
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => handleRemoveRow(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                );
              })}

              {/* Add New Product Button */}
              <Button
                size="sm"
                variant="bordered"
                className="mt-2"
                onPress={handleAddRow}
                isDisabled={products.length === selectedProductIds.length}
              >
                + Add Product
              </Button>
            </div>

            {/* Notes */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
              <Input
                placeholder="Add transfer notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-end gap-4 border-t pt-4">
          <Button
            variant="light"
            onPress={onClose}
            isDisabled={loading}
            className="rounded-md"
          >
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md shadow-md hover:scale-105 transition-transform"
            onPress={handleAdd}
            isLoading={loading}
            disabled={loading}
          >
            Transfer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StockTransferModal;
