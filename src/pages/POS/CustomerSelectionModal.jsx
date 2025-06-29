import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Card, CardBody, Chip } from "@nextui-org/react";

const CustomerSelectionModal = ({
  isOpen,
  onClose,
  customers,
  selectedCustomer,
  setSelectedCustomer,
}) => (
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
      <ModalHeader>Select Customer</ModalHeader>
      <ModalBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
          {customers.map((customer) => (
            <Card
              key={customer.id}
              isPressable
              onPress={() => {
                setSelectedCustomer(customer);
                onClose();
              }}
              className={
                selectedCustomer.id === customer.id
                  ? "border-2 border-primary"
                  : ""
              }
            >
              <CardBody className="p-3">
                <div className="font-semibold">{customer.name}</div>
                <div className="text-sm text-gray-600">{customer.contact}</div>
                <Chip
                  size="sm"
                  color={
                    customer.type === "wholesale" ? "secondary" : "primary"
                  }
                >
                  {customer.type}
                </Chip>
              </CardBody>
            </Card>
          ))}
        </div>
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default CustomerSelectionModal;