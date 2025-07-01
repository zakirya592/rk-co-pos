import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
} from "@nextui-org/react";
import { FaImage } from "react-icons/fa";

const getStockColor = (countInStock) => {
  if (countInStock <= 5) return "bg-red-100 text-red-700";
  if (countInStock <= 10) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
};

const ViewProductModal = ({ isOpen, onClose, viewProduct }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="lg"
    isDismissable={false}
    hideCloseButton={false}
    scrollBehavior="inside"
    className="p-2"
  >
    <ModalContent>
      <ModalHeader className="flex justify-between items-center border-b pb-2">
        <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>
      </ModalHeader>
      <ModalBody>
        {viewProduct && (
          <div className="flex flex-col items-center gap-5">
            {viewProduct.image ? (
              <img
                src={viewProduct.image}
                alt={viewProduct.name}
                className="w-36 h-36 object-cover rounded-xl border shadow"
              />
            ) : (
              <div className="w-36 h-36 flex items-center justify-center bg-gray-100 rounded-xl border">
                <FaImage className="text-6xl text-gray-300" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 w-full">
              <Info label="Name" value={viewProduct.name} />
              <Info label="Category" value={viewProduct.category?.name} />
              <Info label="Price" value={`Rs. ${viewProduct.price}`} />
              <Info
                label="Stock"
                value={
                  <span
                    className={`px-2 py-1 rounded-md text-sm ${getStockColor(
                      viewProduct.countInStock
                    )} font-semibold`}
                  >
                    {viewProduct.countInStock} in stock
                  </span>
                }
              />
              <Info label="Purchase Rate" value={viewProduct.purchaseRate} />
              <Info label="Sale Rate" value={viewProduct.saleRate} />
              <Info label="Wholesale Rate" value={viewProduct.wholesaleRate} />
              <Info label="Retail Rate" value={viewProduct.retailRate} />
              <Info label="Size" value={viewProduct.size} />
              <Info label="Color" value={viewProduct.color} />
              <Info label="Barcode" value={viewProduct.barcode} />
              <Info
                label="Available Quantity"
                value={viewProduct.availableQuantity}
              />
              <Info
                label="SoldOut Quantity"
                value={viewProduct.soldOutQuantity}
              />
              <Info label="Packing Unit" value={viewProduct.packingUnit} />
              <Info
                label="Additional Unit"
                value={viewProduct.additionalUnit}
              />
              <Info
                label="Status"
                value={
                  <Chip
                    color={viewProduct.isActive ? "success" : "danger"}
                    variant="flat"
                  >
                    {viewProduct.isActive ? "Active" : "Inactive"}
                  </Chip>
                }
              />
              <div className="col-span-2">
                <p className="text-gray-600 font-medium mb-1">Description:</p>
                <p className="text-gray-700">{viewProduct.description}</p>
              </div>
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onPress={onClose}>
          Close
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

const Info = ({ label, value }) => (
  <div>
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="text-gray-800 font-semibold">{value}</p>
  </div>
);

export default ViewProductModal;
