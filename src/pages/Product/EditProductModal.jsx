import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Button,
  Textarea,
  Switch,
} from "@nextui-org/react";
import {
  FaImage,
  FaTrash,
  FaShoppingCart,
  FaBox,
  FaBoxes,
  FaTruck,
} from "react-icons/fa";

const EditProductModal = ({
  isOpen,
  onClose,
  categories,
  editProduct,
  setEditProduct,
  handleUpdateProduct,
  handleImageChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [isCustompackingUnit, setIsCustompackingUnit] = useState(false);
  const [isCustomQuantityUnit, setIsCustomQuantityUnit] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    await handleUpdateProduct();
    setLoading(false);
  };

  const getCategoryId = () => {
    if (!editProduct.category) return "";
    return typeof editProduct.category === "object"
      ? editProduct.category._id
      : editProduct.category;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      backdrop="opaque"
      isDismissable={false}
      hideCloseButton={false}
    >
      <ModalContent>
        <ModalHeader>
          <h2 className="text-xl font-bold">Edit Product</h2>
        </ModalHeader>

        <ModalBody>
          {editProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Product Name"
                labelPlacement="outside"
                placeholder="Enter product name"
                value={editProduct.name}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, name: e.target.value })
                }
                variant="bordered"
                required
              />

              <Select
                label="Category"
                placeholder="Select category"
                labelPlacement="outside"
                value={getCategoryId()}
                selectedKeys={getCategoryId() ? [getCategoryId()] : []}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, category: e.target.value })
                }
                variant="bordered"
                required
              >
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </Select>

              <Input
                label="Price"
                labelPlacement="outside"
                type="number"
                placeholder="0.00"
                value={editProduct.price}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, price: e.target.value })
                }
                startContent="Rs."
                variant="bordered"
              />

              <Input
                label="Stock Quantity"
                labelPlacement="outside"
                type="number"
                placeholder="0"
                value={editProduct.countInStock}
                onChange={(e) =>
                  setEditProduct({
                    ...editProduct,
                    countInStock: e.target.value,
                  })
                }
                variant="bordered"
              />

              {/* Pricing */}
              <Input
                label="Purchase Rate"
                type="number"
                labelPlacement="outside"
                placeholder="0.00"
                value={editProduct.purchaseRate}
                onChange={(e) =>
                  setEditProduct({
                    ...editProduct,
                    purchaseRate: e.target.value,
                  })
                }
                startContent="Rs."
                variant="bordered"
              />

              <Input
                label="Sale Rate"
                labelPlacement="outside"
                type="number"
                placeholder="0.00"
                value={editProduct.saleRate}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, saleRate: e.target.value })
                }
                startContent="Rs."
                variant="bordered"
              />

              <Input
                label="Whole Sale Rate"
                labelPlacement="outside"
                type="number"
                placeholder="0.00"
                value={editProduct.wholesaleRate}
                onChange={(e) =>
                  setEditProduct({
                    ...editProduct,
                    wholesaleRate: e.target.value,
                  })
                }
                startContent="Rs."
                variant="bordered"
              />

              <Input
                label="Retail Rate"
                type="number"
                labelPlacement="outside"
                placeholder="0.00"
                value={editProduct.retailRate}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, retailRate: e.target.value })
                }
                startContent="Rs."
                variant="bordered"
              />

              {/* Product Details */}
              <Input
                label="Size"
                labelPlacement="outside"
                placeholder="Enter size"
                value={editProduct.size}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, size: e.target.value })
                }
                variant="bordered"
              />

              <Input
                label="Barcode"
                labelPlacement="outside"
                placeholder="Enter barcode"
                value={editProduct.barcode}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, barcode: e.target.value })
                }
                variant="bordered"
              />
              <Input
                label="Available Quantity"
                labelPlacement="outside"
                placeholder="0"
                type="number"
                value={editProduct.availableQuantity}
                onChange={(e) =>
                  setEditProduct({
                    ...editProduct,
                    availableQuantity: e.target.value,
                  })
                }
                variant="bordered"
              />

              <Input
                label="Sold Out Quantity"
                labelPlacement="outside"
                placeholder="0"
                type="number"
                value={editProduct.soldOutQuantity}
                onChange={(e) =>
                  setEditProduct({
                    ...editProduct,
                    soldOutQuantity: e.target.value,
                  })
                }
                variant="bordered"
              />

              {/* Color */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isCustomColor}
                      onChange={() => setIsCustomColor(!isCustomColor)}
                    />
                    <label className="text-sm text-gray-600">
                      Custom Color
                    </label>
                  </div>
                </div>

                {isCustomColor ? (
                  <Input
                    placeholder="Enter custom color"
                    value={editProduct.color}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, color: e.target.value })
                    }
                    variant="bordered"
                  />
                ) : (
                  <Select
                    placeholder="Select color"
                    value={editProduct.color}
                    selectedKeys={editProduct.color ? [editProduct.color] : []}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, color: e.target.value })
                    }
                    variant="bordered"
                  >
                    <SelectItem key="white" value="white">
                      White
                    </SelectItem>
                    <SelectItem key="black" value="black">
                      Black
                    </SelectItem>
                  </Select>
                )}
              </div>

              {/* Packaging Unit */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">
                    Packaging Unit
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isCustompackingUnit}
                      onChange={() =>
                        setIsCustompackingUnit(!isCustompackingUnit)
                      }
                    />
                    <label className="text-sm text-gray-600">Custom</label>
                  </div>
                </div>

                {isCustompackingUnit ? (
                  <Input
                    placeholder="Enter custom packaging unit"
                    value={editProduct.packingUnit}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        packingUnit: e.target.value,
                      })
                    }
                    variant="bordered"
                  />
                ) : (
                  <Select
                    placeholder="Select packaging unit"
                    value={editProduct.packingUnit}
                    selectedKeys={
                      editProduct.packingUnit ? [editProduct.packingUnit] : []
                    }
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        packingUnit: e.target.value,
                      })
                    }
                    variant="bordered"
                  >
                    <SelectItem
                      key="carton"
                      value="carton"
                      startContent={<FaBox className="text-gray-500" />}
                    >
                      Carton
                    </SelectItem>
                    <SelectItem
                      key="nag"
                      value="nag"
                      startContent={<FaBoxes className="text-gray-500" />}
                    >
                      Nag
                    </SelectItem>
                    <SelectItem
                      key="tona"
                      value="tona"
                      startContent={<FaTruck className="text-gray-500" />}
                    >
                      Tona
                    </SelectItem>
                  </Select>
                )}
              </div>

              {/* Quantity Unit */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Quantity Unit</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isCustomQuantityUnit}
                      onChange={() =>
                        setIsCustomQuantityUnit(!isCustomQuantityUnit)
                      }
                    />
                    <label className="text-sm text-gray-600">Custom</label>
                  </div>
                </div>

                {isCustomQuantityUnit ? (
                  <Input
                    placeholder="Enter custom quantity unit"
                    value={editProduct.additionalUnit}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        additionalUnit: e.target.value,
                      })
                    }
                    variant="bordered"
                  />
                ) : (
                  <Select
                    placeholder="Select quantity unit"
                    value={editProduct.additionalUnit}
                    selectedKeys={
                      editProduct.additionalUnit
                        ? [editProduct.additionalUnit]
                        : []
                    }
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        additionalUnit: e.target.value,
                      })
                    }
                    variant="bordered"
                  >
                    <SelectItem
                      key="dozen"
                      value="dozen"
                      startContent={
                        <FaShoppingCart className="text-gray-500" />
                      }
                    >
                      Dozen
                    </SelectItem>
                    <SelectItem
                      key="packet"
                      value="packet"
                      startContent={<FaBox className="text-gray-500" />}
                    >
                      Packet
                    </SelectItem>
                  </Select>
                )}
              </div>

              <Input
                label="Additional Unit"
                labelPlacement="outside"
                type="number"
                placeholder="Enter additional unit"
                value={editProduct.pouchesOrPieces}
                onChange={(e) =>
                  setEditProduct({
                    ...editProduct,
                    pouchesOrPieces: e.target.value,
                  })
                }
                variant="bordered"
              />

              {/* Description */}
              <Textarea
                label="Description"
                labelPlacement="outside"
                placeholder="Enter product description"
                value={editProduct.description}
                onChange={(e) =>
                  setEditProduct({
                    ...editProduct,
                    description: e.target.value,
                  })
                }
                variant="bordered"
                minRows={3}
                className="md:col-span-2"
              />

              {/* Status */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="flex items-center gap-2">
                  <Switch
                    isSelected={editProduct.isActive} // Boolean expected
                    onValueChange={(value) =>
                      setEditProduct({
                        ...editProduct,
                        isActive: value,
                      })
                    }
                  />
                  <span className="text-sm text-gray-600">
                    {editProduct.isActive ? "Active" : "No Active"}
                  </span>
                </div>
              </div>

              {/* Image Upload */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="font-medium text-gray-700">
                  Product Image
                </label>
                <div className="relative">
                  {!editProduct.image ? (
                    <label
                      htmlFor="edit-product-image-upload"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-32 cursor-pointer hover:border-blue-400 transition"
                    >
                      <FaImage className="text-4xl text-gray-300 mb-2" />
                      <span className="text-gray-500">
                        Click to upload image
                      </span>
                      <input
                        id="edit-product-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  ) : (
                    <div className="relative w-32 h-32">
                      <img
                        src={
                          editProduct.image instanceof File
                            ? URL.createObjectURL(editProduct.image)
                            : editProduct.image
                        }
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-100"
                        onClick={() =>
                          setEditProduct({ ...editProduct, image: "" })
                        }
                        title="Remove image"
                      >
                        <FaTrash className="text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            onPress={handleUpdate}
            isLoading={loading}
            disabled={loading}
          >
            Update Product
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditProductModal;
