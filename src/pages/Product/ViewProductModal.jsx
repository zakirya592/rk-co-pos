import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { FaImage } from "react-icons/fa";

const getStockColor = (countInStock) => {
  if (countInStock <= 5) return "text-red-600 font-semibold";
  if (countInStock <= 10) return "text-yellow-600 font-semibold";
  return "text-green-600 font-semibold";
};

const ViewProductModal = ({ isOpen, onClose, viewProduct }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="md">
    <ModalContent>
      <ModalHeader>
        <h2 className="text-xl font-bold">Product Details</h2>
      </ModalHeader>
      <ModalBody>
        {viewProduct && (
          <div className="flex flex-col items-center gap-4">
            {viewProduct.image ? (
              <img
                src={viewProduct.image}
                alt={viewProduct.name}
                className="w-32 h-32 object-cover rounded-lg border"
              />
            ) : (
              <FaImage className="text-6xl text-gray-300" />
            )}
            <div className="w-full space-y-1">
              <div className="text-lg">
                <span className="text-blue-700 font-semibold">Name: </span>
                {viewProduct.name}
              </div>
              <div className="mb-2 text-lg">
                <span className="text-blue-700 font-semibold">Category: </span>
                {viewProduct.category}
              </div>
              <div className="text-lg">
                <span className="text-blue-700 font-semibold">Price: </span>
                {viewProduct.price}
              </div>
              <div className="text-lg">
                <span className="text-blue-700 font-semibold">Stock: </span>
                <span className={getStockColor(viewProduct.countInStock)}>
                  {viewProduct.countInStock}
                </span>
              </div>
              <div className="text-lg">
                <span className="text-blue-700 font-semibold">Status: </span>
                <span
                  className={
                    viewProduct.isActive
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {viewProduct.isActive ? "Active" : "No Active"}
                </span>
              </div>
              <div className="text-lg">
                <span className="text-blue-700 font-semibold">Description: </span>
                {viewProduct.description}
              </div>
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button onPress={onClose}>Close</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default ViewProductModal;