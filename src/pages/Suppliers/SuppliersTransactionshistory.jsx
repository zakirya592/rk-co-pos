import {
    Button,
    Card,
    CardBody,
    Chip,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Tooltip,
} from "@nextui-org/react";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import userRequest from "../../utils/userRequest";
import { FaPrint } from "react-icons/fa";


function SuppliersTransactionshistory() {
    const { id } = useParams();

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
    const fetchSupplierPayments = async () => {
        const response = await userRequest.get(`supplier-journey/${id}/payments`);
        return response.data || [];
    };

    const { data: supplierPayments = [], isLoading: isPaymentsLoading } = useQuery(
        ["supplier-payments", id],
        fetchSupplierPayments
    );

    const payments = supplierPayments?.payments || [];
    console.log(supplierPayments, "payments");
    
  const calculateTotal = (products) => {
    if (!products || !Array.isArray(products)) return 0;
    return products.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0);
  };

  const viewReceipt = (transaction) => {
    console.log(transaction);
    
    setSelectedTransaction(transaction);
    setShowReceiptModal(true);
  };


   const printReceipt = () => {
     const content = document.getElementById("receipt").innerHTML;
     const printWindow = window.open("", "", "width=1000,height=1000");

     printWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .text-center { text-align: center; }
          .text-sm { font-size: 0.875rem; }
          .font-bold { font-weight: bold; }
          .border-t { border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px; }
          .border-b { border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .flex { display: flex; justify-content: space-between; margin-top: 5px; }
          .font-semibold { font-weight: 600; }
          .text-lg { font-size: 1.125rem; }
          .text-red-600 { color: #dc2626; }
          .text-green-600 { color: #16a34a; }
          .top-print { display: flex; justify-content: space-between;flex-direction: row; }
          .Right-side { text-align: right; }
        </style>
      </head>
      <body>
        ${content}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        </script>
      </body>
    </html>
  `);

     printWindow.document.close();
   };


    return (
      <div>
        <Card>
          <h3 className="text-lg font-bold mx-3 my-4">Transaction History</h3>
          <CardBody>
            <Table aria-label="Customer Transaction History">
              <TableHeader>
                <TableColumn>#</TableColumn>
                <TableColumn>TRANSACTION ID #</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>PAYMENT METHOD</TableColumn>
                <TableColumn>AMOUNT</TableColumn>
                <TableColumn>Remaining Balance</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>USER</TableColumn>
                {/* <TableColumn>ACTION</TableColumn> */}
              </TableHeader>
              <TableBody
                isLoading={isPaymentsLoading}
                loadingContent={
                  <div className="flex justify-center items-center py-8">
                    <Spinner color="success" size="lg" />
                  </div>
                }
                emptyContent={
                  <div className="text-center text-gray-500 py-8">
                    No transactions found
                  </div>
                }
              >
                {supplierPayments.paymentEntries.map((payment, index) => (
                  <TableRow key={payment._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {payment?.payment?.transactionId || ""}
                    </TableCell>
                    <TableCell>
                      {new Date(
                        payment?.payment?.date || ""
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="capitalize">
                      {payment?.payment?.method || ""}
                    </TableCell>
                    <TableCell>
                      {payment.paidAmount.toLocaleString() || ""}
                    </TableCell>
                    <TableCell>
                      {payment.remainingBalance.toLocaleString() || ""}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={
                          payment.payment.status === "partial"
                            ? "warning"
                            : payment.payment.status === "completed"
                            ? "success"
                            : "default"
                        }
                        variant="flat"
                        className="capitalize"
                      >
                        {payment?.payment?.status || ""}
                      </Chip>
                    </TableCell>
                    <TableCell>{payment.user?.name || "—"}</TableCell>

                    {/* Actions */}
                    {/* <TableCell>
                      <Tooltip content="View Receipt">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="primary"
                          onPress={() => viewReceipt(payment)}
                        >
                          <FaPrint />
                        </Button>
                      </Tooltip>
                    </TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
        {/* Receipt Modal */}
        <Modal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          size="2xl"
          scrollBehavior="inside"
          backdrop="opaque"
          isDismissable={false}
          hideCloseButton={false}
          className="max-h-[calc(100vh-1rem)]"
        >
          <ModalContent>
            <ModalHeader>Transaction Receipt</ModalHeader>
            <ModalBody>
              {selectedTransaction && (
                <div className="space-y-4" id="receipt">
                  {/* Shop Header */}
                  <div className="text-center border-b pb-4">
                    <h2 className="text-2xl font-bold">RK & Co</h2>
                    {/* <p className="text-sm text-gray-600">Point of Sales System</p> */}
                    <p className="text-sm">Contact: +92-XXX-XXXXXXX</p>
                  </div>
                  {/* Transaction Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm top-print">
                    <div>
                      <p>
                        <strong>Invoice Number:</strong>{" "}
                        {selectedTransaction?.transactionId || "N/A"}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(
                          selectedTransaction?.paymentDate
                        ).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Time:</strong>{" "}
                        {new Date(
                          selectedTransaction?.paymentDate
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="Right-side">
                      <p>
                        {/* <strong>Customer:</strong> {supplierInfo?.name || "N/A"} */}
                      </p>
                      <p>
                        <strong>Payment Status:</strong>{" "}
                        {selectedTransaction?.status || "N/A"}
                      </p>
                      <p>
                        <strong>Payment:</strong>{" "}
                        {selectedTransaction?.paymentMethod || "0"}
                      </p>
                    </div>
                  </div>
                  {/* Items */}
                  <div>
                    <h4 className="font-semibold mb-2">Items:</h4>
                   
                  </div>
                  {/* Totals */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>
                        {selectedTransaction?.currency?.symbol || "Rs"}{" "}
                        {calculateTotal(selectedTransaction.products).toFixed(
                          2
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t mt-2 pt-2">
                      <span>TOTAL:</span>
                      <span>
                        {selectedTransaction?.currency?.symbol || "Rs"}{" "}
                        {calculateTotal(selectedTransaction.products).toFixed(
                          2
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="text-center text-sm text-gray-600 border-t pt-4">
                    <p>Thank you for your business!</p>
                    <p>Visit us again soon</p>
                  </div>
                  <div className="text-sm text-gray-600 border-t pt-4">
                    <p>
                      Computer software developed by E&Z Tech Solution (PH:
                      +923499386512 OR +923015199394)
                    </p>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={() => setShowReceiptModal(false)}
              >
                Close
              </Button>
              <Button
                color="primary"
                startContent={<FaPrint />}
                onPress={printReceipt}
              >
                Print Receipt
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    );
}

export default SuppliersTransactionshistory;
