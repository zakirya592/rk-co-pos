import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tabs,
  Tab,
  Button,
  Chip
} from '@nextui-org/react';

const CustomerDetails = ({ isOpen, onClose, customer, purchaseHistory }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      backdrop="opaque"
      isDismissable={false}
      hideCloseButton={false}
      scrollBehavior='inside'
    >
      <ModalContent>
        <ModalHeader>Customer Details</ModalHeader>
        <ModalBody>
          {customer && (
            <Tabs>
              <Tab key="info" title="Information">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-700">Name</h4>
                      <p>{customer.name}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">Contact</h4>
                      <p>{customer.phoneNumber}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">Email</h4>
                      <p>{customer.email}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Type</h4>
                      <Chip
                        color={
                          customer.customerType === "wholesale"
                            ? "secondary"
                            : "primary"
                        }
                      >
                        {customer.customerType}
                      </Chip>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-gray-700">Address</h4>
                      <p>{customer.address}</p>
                    </div>
                  </div>
                </div>
              </Tab>
              <Tab key="history" title="Purchase History">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-700">Balance</h4>
                      <span
                        className={
                          customer.balance >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        Rs. {Math.abs(customer.balance)}
                        {customer.balance < 0 && " (Due)"}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700">
                        Total Purchases
                      </h4>
                      <p>Rs. {customer.totalPurchases}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-gray-700">
                        Last Purchase
                      </h4>
                      <p>
                        {customer.lastPurchase
                          ? new Date(customer.lastPurchase).toLocaleDateString()
                          : "Never"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Purchase History
                    </h4>
                    <div className="space-y-3">
                      {purchaseHistory.map((purchase) => (
                        <div
                          key={purchase.id}
                          className="grid grid-cols-1 md:grid-cols-4 gap-4"
                        >
                          <div>
                            <h5 className="text-sm text-gray-500">Date</h5>
                            <p>
                              {new Date(purchase.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-sm text-gray-500">Items</h5>
                            <p>{purchase.items}</p>
                          </div>
                          <div>
                            <h5 className="text-sm text-gray-500">Amount</h5>
                            <p>Rs. {purchase.amount}</p>
                          </div>
                          <div>
                            <h5 className="text-sm text-gray-500">Status</h5>
                            <Chip
                              size="sm"
                              color={
                                purchase.payment === "paid"
                                  ? "success"
                                  : "warning"
                              }
                            >
                              {purchase.payment}
                            </Chip>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Tab>
            </Tabs>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onPress={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomerDetails;
