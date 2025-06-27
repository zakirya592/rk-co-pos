import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select, SelectItem, Button } from "@nextui-org/react";
import { FaImage, FaTrash } from "react-icons/fa";

const EditProductModal = ({
  isOpen,
  onClose,
  categories,
  editProduct,
  setEditProduct,
  handleUpdateProduct
}) => (
  <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
    <ModalContent>
      <ModalHeader>
        <h2 className="text-xl font-bold">Edit Product</h2>
      </ModalHeader>
      <ModalBody>
        {editProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              value={editProduct.name}
              onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
              variant="bordered"
              required
            />
            <Select
              label="Category"
              value={editProduct.category}
              onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
              variant="bordered"
              required
            >
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </Select>
            <Input
              label="Retail Price"
              type="number"
              value={editProduct.retailPrice}
              onChange={(e) => setEditProduct({ ...editProduct, retailPrice: e.target.value })}
              startContent="Rs."
              variant="bordered"
              required
            />
            <Input
              label="Wholesale Price"
              type="number"
              value={editProduct.wholesalePrice}
              onChange={(e) => setEditProduct({ ...editProduct, wholesalePrice: e.target.value })}
              startContent="Rs."
              variant="bordered"
              required
            />
            <Input
              label="Stock Quantity"
              type="number"
              value={editProduct.stock}
              onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
              variant="bordered"
              required
            />
            <Input
              label="Barcode"
              value={editProduct.barcode}
              onChange={(e) => setEditProduct({ ...editProduct, barcode: e.target.value })}
              variant="bordered"
            />
            {/* Image upload for edit */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-medium text-gray-700">Product Image</label>
              <div className="relative">
                {!editProduct.image ? (
                  <label
                    htmlFor="edit-product-image-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-32 cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <FaImage className="text-4xl text-gray-300 mb-2" />
                    <span className="text-gray-500">Click to upload image</span>
                    <input
                      id="edit-product-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditProduct({ ...editProduct, image: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                ) : (
                  <div className="relative w-36 h-32">
                    <img
                      src={editProduct.image}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-100 transition-colors"
                      onClick={() => setEditProduct({ ...editProduct, image: "" })}
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
          onPress={handleUpdateProduct}
        >
          Update Product
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default EditProductModal;