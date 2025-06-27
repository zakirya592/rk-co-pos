import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { FaImage } from "react-icons/fa";

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
            <div className="w-full">
              <div className="font-bold text-lg">{viewProduct.name}</div>
              <div className="text-gray-600 mb-2">{viewProduct.category}</div>
              <div>Retail Price: Rs. {viewProduct.retailPrice}</div>
              <div>Wholesale Price: Rs. {viewProduct.wholesalePrice}</div>
              <div>Stock: {viewProduct.stock}</div>
              <div>Barcode: {viewProduct.barcode}</div>
              <div>Description: {viewProduct.description}</div>
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