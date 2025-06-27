import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select, SelectItem, Button } from "@nextui-org/react";
import { FaImage, FaTrash } from "react-icons/fa";

const AddProductModal = ({isOpen,onClose,categories,newProduct,setNewProduct,handleAddProduct,handleImageChange}) => (
  
  <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
    <ModalContent>
      <ModalHeader>
        <h2 className="text-xl font-bold">Add New Product</h2>
      </ModalHeader>
      <ModalBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Product Name"
            placeholder="Enter product name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            variant="bordered"
            required
          />
          <Select
            label="Category"
            placeholder="Select category"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
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
            placeholder="0.00"
            type="number"
            value={newProduct.retailPrice}
            onChange={(e) => setNewProduct({ ...newProduct, retailPrice: e.target.value })}
            startContent="Rs."
            variant="bordered"
            required
          />
          <Input
            label="Wholesale Price"
            placeholder="0.00"
            type="number"
            value={newProduct.wholesalePrice}
            onChange={(e) => setNewProduct({ ...newProduct, wholesalePrice: e.target.value })}
            startContent="Rs."
            variant="bordered"
            required
          />
          <Input
            label="Stock Quantity"
            placeholder="0"
            type="number"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            variant="bordered"
            required
          />
          <Input
            label="Barcode"
            placeholder="Enter barcode"
            value={newProduct.barcode}
            onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
            variant="bordered"
          />
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
                    src={newProduct.image}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-100 transition-colors"
                    onClick={() => setNewProduct({ ...newProduct, image: "" })}
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
          onPress={handleAddProduct}
        >
          Add Product
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default AddProductModal;