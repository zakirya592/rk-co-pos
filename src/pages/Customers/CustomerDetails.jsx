import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tabs,
  Tab,
  Button,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableRow,
  TableBody,
  TableCell
} from '@nextui-org/react';
import userRequest from '../../utils/userRequest';

const CustomerDetails = ({ isOpen, onClose, customer }) => {

   const [purchaseHistorys, setPurchaseHistory] = useState({ data: [] });
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     const fetchPurchaseHistory = async () => {
       try {
         const response = await userRequest.get(
           `/sales/customer/${customer._id}`
         );
         setPurchaseHistory(response.data);
       } catch (error) {
         console.error("Error fetching purchase history:", error);
       } finally {
         setLoading(false);
       }
     };

     if (customer?._id) {
       fetchPurchaseHistory();
     }
   }, [customer]);

   const { customerInfo, summary, data: transactions } = purchaseHistorys || {}; // Add null check

   console.log(purchaseHistorys);
   
  
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      backdrop="opaque"
      isDismissable={false}
      hideCloseButton={false}
      scrollBehavior="inside"
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
              {/* <Tab key="history" title="Purchase History">
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
                      <div className="overflow-auto">
                        <table className="min-w-full border border-gray-200 text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border px-4 py-2">#</th>
                              <th className="border px-4 py-2">Date</th>
                              <th className="border px-4 py-2">Items</th>
                              <th className="border px-4 py-2">Quantity</th>
                              <th className="border px-4 py-2">PRICE</th>
                              <th className="border px-4 py-2">Total</th>
                              <th className="border px-4 py-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions?.length ? (
                              transactions.map((purchase, index) => (
                                <tr key={purchase._id} className="text-center">
                                  <td className="border px-4 py-2">
                                    {index + 1}
                                  </td>
                                  <td className="border px-4 py-2">
                                    {new Date(
                                      purchase.createdAt
                                    ).toLocaleDateString()}
                                  </td>
                                  <td className="border px-4 py-2">
                                    {purchase.items?.map((item, idx) => (
                                      <div key={idx}>
                                        {item?.product?.name || ""}
                                      </div>
                                    ))}
                                  </td>
                                  <td className="border px-4 py-2">
                                    {purchase?.quantity || "0"}
                                  </td>
                                  <td className="border px-4 py-2">
                                    Rs. {purchase.grandTotal}
                                  </td>
                                  <td>
                                    {purchase?.quantity * purchase?.price ||
                                      "N/A"}
                                  </td>
                                  <td className="border px-4 py-2">
                                    <Chip
                                      size="sm"
                                      color={
                                        purchase.paymentStatus === "paid"
                                          ? "success"
                                          : purchase.paymentStatus === "partial"
                                          ? "warning"
                                          : "danger"
                                      }
                                    >
                                      {purchase.paymentStatus}
                                    </Chip>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  className="border px-4 py-2 text-center"
                                  colSpan="6"
                                >
                                  No transactions found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab> */}
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
