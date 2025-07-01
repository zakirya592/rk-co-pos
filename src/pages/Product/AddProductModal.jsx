import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select, SelectItem, Button, Textarea, Switch } from "@nextui-org/react";
import { FaImage, FaTrash, FaShoppingCart, FaBox, FaBoxes, FaTruck } from "react-icons/fa";

const AddProductModal = ({
  isOpen,
  onClose,
  categories,
  newProduct,
  setNewProduct,
  handleAddProduct,
  handleImageChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [isCustompackingUnit, setIsCustompackingUnit] = useState(false);
  const [isCustomQuantityUnit, setIsCustomQuantityUnit] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    await handleAddProduct();
    setLoading(false);
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
          <h2 className="text-xl font-bold">Add New Product</h2>
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              labelPlacement="outside"
              placeholder="Enter product name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              variant="bordered"
              required
            />
            <Select
              label="Category"
              labelPlacement="outside"
              placeholder="Select category"
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
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
              label="price"
              labelPlacement="outside"
              placeholder="0.00"
              type="number"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
              startContent="Rs."
              variant="bordered"
            />

            <Input
              label="Stock Quantity"
              labelPlacement="outside"
              placeholder="0"
              type="number"
              value={newProduct.countInStock}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  countInStock: e.target.value,
                })
              }
              variant="bordered"
            />

            {/* Pricing */}
            <Input
              label="Purchase Rate"
              labelPlacement="outside"
              placeholder="0.00"
              type="number"
              value={newProduct.purchaseRate}
              onChange={(e) =>
                setNewProduct({ ...newProduct, purchaseRate: e.target.value })
              }
              startContent="Rs."
              variant="bordered"
            />
            <Input
              label="Sale Rate"
              labelPlacement="outside"
              placeholder="0.00"
              type="number"
              value={newProduct.saleRate}
              onChange={(e) =>
                setNewProduct({ ...newProduct, saleRate: e.target.value })
              }
              startContent="Rs."
              variant="bordered"
            />
            <Input
              labelPlacement="outside"
              label="Whole Sale Rate"
              placeholder="0.00"
              type="number"
              value={newProduct.wholesaleRate}
              onChange={(e) =>
                setNewProduct({ ...newProduct, wholesaleRate: e.target.value })
              }
              startContent="Rs."
              variant="bordered"
            />
            <Input
              labelPlacement="outside"
              label="Retail Rate"
              placeholder="0.00"
              type="number"
              value={newProduct.retailRate}
              onChange={(e) =>
                setNewProduct({ ...newProduct, retailRate: e.target.value })
              }
              startContent="Rs."
              variant="bordered"
            />

            {/* Product Details */}
            <Input
              labelPlacement="outside"
              label="Size"
              placeholder="Enter size"
              value={newProduct.size}
              onChange={(e) =>
                setNewProduct({ ...newProduct, size: e.target.value })
              }
              variant="bordered"
            />

            <Input
              label="Barcode"
              labelPlacement="outside"
              placeholder="Enter barcode"
              value={newProduct.barcode}
              onChange={(e) =>
                setNewProduct({ ...newProduct, barcode: e.target.value })
              }
              variant="bordered"
            />
            <Input
              label="Available Quantity"
              labelPlacement="outside"
              placeholder="0"
              type="number"
              value={newProduct.availableQuantity}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
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
              value={newProduct.soldOutQuantity}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  soldOutQuantity: e.target.value,
                })
              }
              variant="bordered"
            />

            {/* Inside your ModalBody */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="custom-color-toggle"
                    checked={isCustomColor}
                    onChange={() => setIsCustomColor(!isCustomColor)}
                  />
                  <label
                    htmlFor="custom-color-toggle"
                    className="text-sm text-gray-600"
                  >
                    Custom Color
                  </label>
                </div>
              </div>

              {isCustomColor ? (
                <Input
                  labelPlacement="outside"
                  placeholder="Enter custom color"
                  value={newProduct.color}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, color: e.target.value })
                  }
                  variant="bordered"
                />
              ) : (
                <Select
                  placeholder="Select color"
                  value={newProduct.color}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, color: e.target.value })
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

            {/* Packaging */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">Packaging Unit</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="custom-packaging-unit-toggle"
                    checked={isCustompackingUnit}
                    onChange={() =>
                      setIsCustompackingUnit(!isCustompackingUnit)
                    }
                    className="cursor-pointer"
                  />
                  <label
                    htmlFor="custom-packaging-unit-toggle"
                    className="text-sm text-gray-600"
                  >
                    Custom
                  </label>
                </div>
              </div>

              {isCustompackingUnit ? (
                <Input
                  placeholder="Enter custom packaging unit"
                  value={newProduct.packingUnit}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      packingUnit: e.target.value,
                    })
                  }
                  variant="bordered"
                />
              ) : (
                <Select
                  placeholder="Select packaging unit"
                  value={newProduct.packingUnit}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
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

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">Quantity Unit </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isCustomQuantityUnit}
                    onChange={() =>
                      setIsCustomQuantityUnit(!isCustomQuantityUnit)
                    }
                    className="ml-2 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">Custom</span>
                </div>
              </div>

              {isCustomQuantityUnit ? (
                <Input
                  placeholder="Enter custom quantity unit"
                  value={newProduct.additionalUnit}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      additionalUnit: e.target.value,
                    })
                  }
                  variant="bordered"
                />
              ) : (
                <Select
                  placeholder="Select quantity unit"
                  value={newProduct.additionalUnit}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      additionalUnit: e.target.value,
                    })
                  }
                  variant="bordered"
                >
                  <SelectItem
                    key="dozen"
                    value="dozen"
                    startContent={<FaShoppingCart className="text-gray-500" />}
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
              placeholder="Enter custom additional unit"
              value={newProduct.pouchesOrPieces}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
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
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
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
                  isSelected={newProduct.isActive === "active"}
                  onValueChange={(value) =>
                    setNewProduct({
                      ...newProduct,
                      isActive: value ? "active" : "inactive",
                    })
                  }
                />
                <span className="text-sm text-gray-600">
                  {newProduct.isActive === "active" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Image upload */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-medium text-gray-700">Product Image</label>
              <div className="relative">
                {!newProduct.image ? (
                  <label
                    htmlFor="product-image-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-32 cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <FaImage className="text-4xl text-gray-300 mb-2" />
                    <span className="text-gray-500">Click to upload image</span>
                    <input
                      id="product-image-upload"
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
                        newProduct.image instanceof File
                          ? URL.createObjectURL(newProduct.image)
                          : newProduct.image
                      }
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-100 transition-colors"
                      onClick={() =>
                        setNewProduct({ ...newProduct, image: "" })
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
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            onPress={handleAdd}
            isLoading={loading}
            disabled={loading}
          >
            Add Product
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddProductModal;