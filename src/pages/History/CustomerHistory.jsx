import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  Badge,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
} from '@nextui-org/react';
import * as XLSX from "xlsx";
import { FaUser, FaShoppingCart, FaMoneyBill, FaChartLine, FaClock, FaPhone, FaMapMarkerAlt, FaPrint, FaTrash, FaEdit } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import UpdateSaleModal from './UpdateSaleModal';
import Updatepayment from './Updatepayment';
import Transactionshistory from './Transactionshistory';
import { useQuery } from 'react-query';

const CustomerHistory = () => {

  const { id } = useParams();
  const navigate = useNavigate()
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showUpdatepaymentModal, setshowUpdatepaymentModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [totalSales, setTotalSales] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [totalRevenuetop, settotalRevenuetop] = useState(0);

  const viewReceipt = (transaction) => {
    setSelectedTransaction(transaction);
    setShowReceiptModal(true);
  };

  const handleshowUpdatepaymentModal = (payment) => {
    setSelectedPayment(payment);
    setshowUpdatepaymentModal(true);
  };

  const fetchCustomerHistory = async () => {
    try {
      const response = await userRequest.get(`/sales/customer/${id}`);
      setCustomerData(response.data);
      const total = response.data?.data?.reduce((sum, transaction) => sum + (transaction.paidAmount || 0), 0) || 0;
      // setTotalRevenue(total);
      const due = response.data?.data?.reduce((sum, transaction) => sum + (transaction.dueAmount || 0), 0) || 0;
      // setDueamout(due);
      // setTotalSales(response.data?.totalSales || 0);
      const totalSalesAmount = response.data?.data?.reduce((sum, transaction) => sum + (transaction.grandTotal || 0), 0) || 0;
      setGrandTotal(totalSalesAmount);
    } catch (error) {
      console.error('Error fetching customer history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerPaymentHistory = async () => {
    try {
      const response = await userRequest.get(`/payments/customer/${id}/journey`);
      const datas = response?.data?.data || "";
      setTotalSales(datas);
    } catch (error) {
      console.error('Error fetching customer history:', error);
    }
  };

  const fetchCustomerTransactionsss = async () => {
    try {
      const response = await userRequest.get(`/payments/customer/${id}/transactions`);
      const datas = response?.data?.data || "";
      console.log(datas.financialSummary, "datas");
      settotalRevenuetop(datas.financialSummary)
    } catch (error) {
      console.error('Error fetching customer history:', error);
    }
  };

  const fetchbothgetapi = () => {
    fetchCustomerHistory();
    fetchCustomerPaymentHistory();
    fetchCustomerTransactionsss();
  }

  const handleAdvancePayment = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: `You will apply advance payment for this ${id || ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, apply it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userRequest.post(`/payments/apply-customer-advance`, {
            customerId: id,
          });
          fetchbothgetapi();
          toast.success("Advance payment applied successfully!");
        } catch (error) {
          fetchbothgetapi();
          toast.error(error?.response?.data?.message || "Failed to apply advance payment.");
        }
      }
    });



  };

  useEffect(() => {
    if (id) {
      fetchbothgetapi()
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading customer history...</p>
        </div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="mb-4">No customer data available</div>
            <Button onPress={() => navigate(-1)}>Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const { customerInfo, summary, data: transactions } = customerData;

  // Delete customer
  const handleDeletecustomer = (transaction) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover this ${transaction?.customer?.name || ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userRequest.delete(`/sales/${transaction?._id}`);
          fetchbothgetapi();
          toast.success("The customer has been deleted.");
        } catch (error) {
          toast.error(error?.response?.data?.message || "Failed to delete the customer.");
        }
      }
    });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      transactions.map((t) => ({
        Invoice: t.invoiceNumber,
        Date: new Date(t.createdAt).toLocaleDateString(),
        Time: new Date(t.createdAt).toLocaleTimeString(),
        Customer: t.customer.name || "N/A",
        Total: t.grandTotal,
        Paid: t.paidAmount,
        Due: t.dueAmount,
        Payment: t.paymentMethod,
        Status: t.paymentStatus,
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "Transactions.xlsx");
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

  const printCustomerReport = () => {
    const today = new Date();
    const content = `
    <html>
      <head>
        <title>Customer Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1, h2, h3 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
          .summary { margin-top: 20px; }
          .summary div { margin-bottom: 5px; }
          .topprint { display: flex; justify-content: space-between;flex-direction: row; }
        </style>
      </head>
      <body>
        <h1>Customer Transaction Report</h1>
        <h3>${customerData.customerInfo?.name || "N/A"}</h3>
        <p>Date: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}</p>

        <div class="summary">
          <h3>Summary</h3>
           <div class="topprint">
          <div><strong>Total Item Sales:</strong> ${totalSales?.summary?.totalSales || "0"}</div>
          <div><strong>Total Sales Amount:</strong> ${grandTotal.toFixed(2)}</div>
          </div>
          <div class="topprint">
          <div><strong>Total Paid:</strong> ${totalSales?.summary?.totalPaid || "0"}</div>
          <div><strong>Due Amount:</strong> ${Math.max(totalSales?.summary?.currentOutstandingBalance || 0, 0)}</div>
          </div>
         
        </div>

        <h3>Transaction History</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Invoice</th>
              <th>Date</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Status</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            ${transactions
        .map(
          (t, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${t.invoiceNumber}</td>
                <td>${new Date(t.createdAt).toLocaleDateString()}</td>
                <td>Rs. ${t.grandTotal}</td>
                <td>Rs. ${t.paidAmount}</td>
                <td>Rs. ${t.dueAmount}</td>
                <td>${t.paymentStatus}</td>
                <td>${t.paymentMethod}</td>
              </tr>
            `
        )
        .join("")}
          </tbody>
        </table>

        <div style="text-align: center; margin-top: 30px;">
          <p>Thank you for your business!</p>
          <p>Visit us again!</p>
        </div>
      </body>
    </html>
  `;

    const printWindow = window.open("", "", "width=1000,height=1000");
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <div className="p-1 sm:p-1 md:p-5 lg:p-5 space-y-6">
      {/* Customer Information Header */}
      <Card className="mb-8">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <Avatar
              size="xl"
              src="https://via.placeholder.com/150"
              alt={customerInfo.name}
            />
            <div>
              <p className="text-2xl font-bold">{customerInfo.name}</p>
              <p className="text-sm text-gray-600">
                Customer ID: {customerInfo._id}
              </p>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#CFD1D4] text-[#236FC7] rounded-lg">
              <FaUser />
              <span>{customerInfo.email}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-[#CFD1D4] text-[#236FC7] rounded-lg">
              <FaPhone />
              <span>{customerInfo.phoneNumber}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-[#CFD1D4] text-[#236FC7] rounded-lg">
              <FaMapMarkerAlt />
              <span>{customerInfo.address}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <div>
          <Card>
            <CardBody>
              <div className="flex flex-col items-center">
                <FaShoppingCart className="text-4xl text-blue-500 mb-2" />
                <p className="text-xl font-bold">
                  {totalSales?.summary?.totalSales || "0"}
                </p>
                <p color="$text" size="$sm">
                  Total Item Sales
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        <div>
          <Card>
            <CardBody>
              <div className="flex flex-col items-center">
                <FaMoneyBill className="text-4xl text-yellow-500 mb-2" />
                <p className="text-xl font-bold">
                  {totalSales?.summary?.totalInvoiced || "0"}
                </p>
                <p color="$text" size="$sm">
                  Total Invoiced
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
        <div>
          <Card>
            <CardBody>
              <div className="flex flex-col items-center">
                <FaMoneyBill className="text-4xl text-green-500 mb-2" />
                <p className="text-xl font-bold">
                  {/* {totalSales?.summary?.totalPaid || "0"} */}
                  {totalRevenuetop?.totalPaid || "0"}
                </p>
                <p color="$text" size="$sm">
                  Total Paid
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
        <div>
          <Card>
            <CardBody>
              <div className="flex flex-col items-center">
                <FaClock className="text-4xl text-red-500 mb-2" />
                <p className="text-xl font-bold">
                  {Math.max(totalRevenuetop?.totalRemaining || 0, 0)}
                  {/* {Math.max(totalSales?.summary?.currentOutstandingBalance || 0, 0)} */}
                </p>
                <p color="$text" size="$sm">
                  Due Amount
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
        <div>
          <Card>
            <CardBody>
              <div className="flex flex-col items-center">
                <FaMoneyBill className="text-4xl text-orange-500 mb-2" />
                <p className="text-xl font-bold">
                  {/* {totalSales?.summary?.totalAdvanceAmount || "0"} */}
                  {totalRevenuetop?.currentAdvanceBalance || "0"}
                </p>
                <p color="$text" size="$sm">
                  Total Advance Amount
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* <div>
          <Card>
            <CardBody>
              <div className="flex flex-col items-center">
                <FaClock className="text-4xl text-purple-500 mb-2" />
                <p className="text-xl font-bold">
                  {new Date(
                    customerData?.data[0]?.createdAt
                  ).toLocaleDateString()}
                </p>
                <p color="$text" size="$sm">
                  Days Since Last Purchase
                </p>
              </div>
            </CardBody>
          </Card>
        </div> */}
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-bold">Purchase History</h3>
            <div className="flex flex-row gap-2">
              <Button
                color="primary"
                variant="flat"
                disabled={totalRevenuetop.currentAdvanceBalance === 0}
                // onPress={handleAdvancePayment}
                onPress={
                  totalRevenuetop.currentAdvanceBalance !== 0
                    ? handleAdvancePayment
                    : undefined
                }
                title={
                  totalRevenuetop.currentAdvanceBalance === 0
                    ? "Current advance balance is 0"
                    : ""
                }
                className={
                  totalRevenuetop.currentAdvanceBalance === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              >
                Advance Payment
              </Button>
              <Button
                color="primary"
                variant="flat"
                onPress={() => handleshowUpdatepaymentModal(totalSales)}
              >
                Payment
              </Button>
              <Button
                color="primary"
                variant="flat"
                onPress={printCustomerReport}
              >
                Print Report
              </Button>
              <Button color="primary" variant="flat" onPress={exportToExcel}>
                Export to Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Customer Transaction History">
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>Invoice #</TableColumn>
              <TableColumn>Date</TableColumn>
              <TableColumn>Items</TableColumn>
              <TableColumn>Total</TableColumn>
              {/* <TableColumn>Paid Amount</TableColumn>
              <TableColumn>Due Amount</TableColumn> */}
              <TableColumn>Payment Status</TableColumn>
              {/* <TableColumn>Payment Method</TableColumn> */}
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={transaction._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{transaction.invoiceNumber}</TableCell>
                  <TableCell>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {transaction?.items?.length} item(s)
                      <div className="text-xs text-gray-500">
                        {transaction?.items?.[0]?.product?.name || ""}
                        {transaction?.items?.length > 1 &&
                          ` +${transaction?.items?.length - 1} more`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{transaction?.grandTotal || ""}</TableCell>
                  {/* <TableCell>{transaction?.paidAmount || ""}</TableCell> */}
                  {/* <TableCell>{transaction?.dueAmount || ""}</TableCell> */}
                  <TableCell>
                    <Chip
                      size="sm"
                      color={
                        transaction.paymentStatus === "paid"
                          ? "success"
                          : transaction.paymentStatus === "partial"
                          ? "warning"
                          : "danger"
                      }
                    >
                      {transaction.paymentStatus}
                    </Chip>
                  </TableCell>
                  {/* <TableCell>{transaction.paymentMethod}</TableCell> */}
                  <TableCell>
                    <Tooltip content="View Receipt">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                        onPress={() => viewReceipt(transaction)}
                      >
                        <FaPrint />
                      </Button>
                    </Tooltip>
                    {/* <Tooltip content="Update Sale">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="warning"
                        onPress={() => handleUpdateSale(transaction)}
                      >
                        <FaEdit />
                      </Button>
                    </Tooltip> */}
                    <Tooltip content="Delete Customer" placement="top">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleDeletecustomer(transaction)}
                      >
                        <FaTrash />
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Transactionshistory />

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
                      {selectedTransaction?.invoiceNumber || "N/A"}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(
                        selectedTransaction?.createdAt
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Time:</strong>{" "}
                      {new Date(
                        selectedTransaction?.createdAt
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="Right-side">
                    <p>
                      <strong>Customer:</strong>{" "}
                      {selectedTransaction?.customer?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Payment Status:</strong>{" "}
                      {selectedTransaction?.paymentStatus || "N/A"}
                    </p>
                    {/* <p>
                      <strong>Payment:</strong>{" "}
                      {selectedTransaction?.paymentMethod || "0"}
                    </p> */}
                  </div>
                </div>
                {/* Items */}
                <div>
                  <h4 className="font-semibold mb-2">Items:</h4>
                  <Table aria-label="Receipt items" removeWrapper>
                    <TableHeader>
                      <TableColumn>ITEM</TableColumn>
                      <TableColumn>QTY</TableColumn>
                      <TableColumn>PRICE</TableColumn>
                      <TableColumn>TOTAL</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {selectedTransaction.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product?.name || "N/A"}</TableCell>
                          <TableCell>{item?.quantity || "N/A"}</TableCell>
                          <TableCell>Rs. {item?.price || "N/A"}</TableCell>
                          <TableCell>
                            Rs. {item?.quantity * item?.price || "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rs. {selectedTransaction?.totalAmount || "0"}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>Rs. {selectedTransaction?.discount || "0"}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Direct Discount:</span>
                    <span>Rs. {selectedTransaction?.tax || "0"}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t mt-2 pt-2">
                    <span>TOTAL:</span>
                    <span>Rs. {selectedTransaction?.grandTotal || "0"}</span>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-600 border-t pt-4">
                  <p>Thank you for your business!</p>
                  <p>Visit us again soon</p>
                </div>
                <div className="text-sm text-gray-600 border-t pt-4">
                  <p>Computer software developed by E&Z Tech Solution (PH: +923499386512 OR +923015199394)</p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowReceiptModal(false)}>
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

      <UpdateSaleModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        saleId={selectedSale?._id}
        saleData={selectedSale}
        refetch={fetchCustomerHistory}
      />

      <Updatepayment
        isOpen={showUpdatepaymentModal}
        onClose={() => setshowUpdatepaymentModal(false)}
        // saleId={selectedSale?._id}
        selectedPayment={selectedPayment}
        refetch={fetchbothgetapi}
      />
    </div>
  );
};

export default CustomerHistory;
