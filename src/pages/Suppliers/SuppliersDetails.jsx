import React, { useState, useEffect } from "react";
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
} from "@nextui-org/react";
import * as XLSX from "xlsx";
import {
  FaUser,
  FaShoppingCart,
  FaMoneyBill,
  FaChartLine,
  FaClock,
  FaPhone,
  FaMapMarkerAlt,
  FaPrint,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import userRequest from "../../utils/userRequest";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
// import UpdateSaleModal from "./UpdateSaleModal";
// import Updatepayment from "./Updatepayment";
// import Transactionshistory from "./Transactionshistory";
import { useQuery } from "react-query";
import SuppliersTransactionshistory from "./SuppliersTransactionshistory";

const SuppliersDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [PurchaseHistory, setPurchaseHistory] = useState([])

  const viewReceipt = (transaction) => {
    console.log(transaction,'ta');
    
    setSelectedTransaction(transaction);
    setShowReceiptModal(true);
  };

  const handleshowUpdatepaymentModal = (payment) => {
    setSelectedPayment(payment);
    setshowUpdatepaymentModal(true);
  };

  const fetchCustomerHistory = async () => {
    try {
      const response = await userRequest.get(`/supplier-journey/${id}/summary`);
      setCustomerData(response.data);
      const totalSalesAmount =
        response.data?.data?.reduce(
          (sum, transaction) => sum + (transaction.grandTotal || 0),
          0
        ) || 0;
      setGrandTotal(totalSalesAmount);
    } catch (error) {
      console.error("Error fetching suppliers history:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerPaymentHistory = async () => {
    try {
      const response = await userRequest.get(
        `/supplier-payments/supplier/${id}`
      );
      const datas = response?.data || "";
      console.log(datas, "datas");
      
      setPurchaseHistory(datas)
    } catch (error) {
      console.error("Error fetching suppliers history:", error);
    }
  };

  const fetchCustomerTransactionsss = async () => {
    try {
      const response = await userRequest.get(
        `/payments/customer/${id}/transactions`
      );
      const datas = response?.data?.data || "";
      console.log(datas.financialSummary, "datas");
      settotalRevenuetop(datas.financialSummary);
    } catch (error) {
      console.error("Error fetching suppliers history:", error);
    }
  };

  const fetchbothgetapi = () => {
    fetchCustomerHistory();
    fetchCustomerPaymentHistory();
    fetchCustomerTransactionsss();
  };

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
          toast.error(
            error?.response?.data?.message || "Failed to apply advance payment."
          );
        }
      }
    });
  };

  useEffect(() => {
    if (id) {
      fetchbothgetapi();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading suppliers history...</p>
        </div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="mb-4">No suppliers data available</div>
            <Button onPress={() => navigate(-1)}>Back</Button>
          </div>
        </div>
      </div>
    );
  }

//   const { data: transactions } = customerData;

  // ---------- Derived safe arrays ----------
  const supplierInfo = customerData?.supplier || customerData?.customerInfo;
  const summary = customerData?.summary || {};
  const transactions = customerData?.data || customerData?.transactions || []; // purchase history (if your API provides)
  const recentActivity = customerData?.recentActivity || [];

  // Delete customer
  const handleDeletesuppliers = (transaction) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover this ${
        transaction?.customer?.name || ""
      }`,
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
          toast.success("The suppliers has been deleted.");
        } catch (error) {
          toast.error(
            error?.response?.data?.message || "Failed to delete the suppliers."
          );
        }
      }
    });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      PurchaseHistory.payments.map((t) => ({
        Invoice: t.transactionId,
        Date: new Date(t.paymentDate).toLocaleDateString(),
        Time: new Date(t.paymentDate).toLocaleTimeString(),
        // Customer: t.customer.name || "N/A",
        Total:`${t?.currency?.symbol || "Rs"}. ${t.amount}`,
        Payment: t.paymentMethod,
        Status: t.status,
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
        <title>suppliers Report</title>
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
        <h1>suppliers Transaction Report</h1>
        <h3>${supplierInfo?.name || "N/A"}</h3>
        <p>Date: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}</p>

        <div class="summary">
          <h3>Summary</h3>
           <div class="topprint">
          <div><strong>Total Item Sales:</strong> ${
            PurchaseHistory?.count || "0"
          }</div>
           <div><strong>Total :</strong> ${
             PurchaseHistory?.totalPayments || "0"
           }</div>
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
              <th>Status</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            ${PurchaseHistory.payments
              .map(
                (t, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${t.transactionId}</td>
                <td>${new Date(t.paymentDate).toLocaleDateString()}</td>
                <td>${t?.currency?.symbol || "Rs"}. ${t.amount}</td>
                <td>${t.status}</td>
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

  {
    /* Calculate totals */
  }
  const calculatedTotal = selectedTransaction?.products?.reduce((sum, item) => {
    const quantity = Number(item?.quantity) || 0;
    const amount = Number(item?.amount) || 0;
    return sum + quantity * amount;
  }, 0);


  return (
    <div className="p-1 sm:p-1 md:p-5 lg:p-5 space-y-6">
      {/* suppliers Information Header */}
      <Card className="mb-8">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <Avatar
              size="xl"
              src="https://via.placeholder.com/150"
              alt={supplierInfo.name}
            />
            <div>
              <p className="text-2xl font-bold">{supplierInfo.name}</p>
              <p className="text-sm text-gray-600">
                Supplier ID: {supplierInfo.id}
              </p>
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#CFD1D4] text-[#236FC7] rounded-lg">
              <FaUser />
              <span>{supplierInfo.email}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-[#CFD1D4] text-[#236FC7] rounded-lg">
              <FaPhone />
              <span>{supplierInfo.phoneNumber}</span>
            </div>

            {/* <div className="flex items-center gap-2 px-3 py-1 bg-[#CFD1D4] text-[#236FC7] rounded-lg">
              <FaMapMarkerAlt />
              <span>{customerInfo.address}</span>
            </div> */}
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
                  {PurchaseHistory?.count || "0"}
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
                  {PurchaseHistory?.totalPayments || "0"}
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
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h3 className="text-lg font-bold">Purchase History</h3>
            <div className="flex flex-row gap-2">
              {/* <Button
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
              </Button> */}
              {/* <Button
                color="primary"
                variant="flat"
                onPress={() => handleshowUpdatepaymentModal(totalSales)}
              >
                Payment
              </Button> */}
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
          <Table aria-label="suppliers Transaction History">
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>Invoice #</TableColumn>
              <TableColumn>Date</TableColumn>
              <TableColumn>Items</TableColumn>
              <TableColumn>Total</TableColumn>
              <TableColumn>User</TableColumn>
              {/* <TableColumn>Paid Amount</TableColumn>
              <TableColumn>Due Amount</TableColumn> */}
              <TableColumn>Payment Status</TableColumn>
              {/* <TableColumn>Payment Method</TableColumn> */}
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {PurchaseHistory.payments.map((transaction, index) => {
                const isPayment = !!transaction.payment;
                const userdata = !!transaction.user || transaction.user;

                return (
                  <TableRow key={index + 1}>
                    {/* Index */}
                    <TableCell>{index + 1}</TableCell>

                    {/* Invoice or Transaction ID */}
                    <TableCell>{transaction?.transactionId || "-"}</TableCell>

                    {/* Date */}
                    <TableCell>
                      {new Date(transaction.paymentDate).toLocaleDateString() ||
                        "-"}
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {transaction?.products?.length} item(s)
                        <div className="text-xs text-gray-500">
                          {transaction?.products?.[0]?.product?.name || ""}
                          {transaction?.products?.length > 1 &&
                            ` +${transaction?.products?.length - 1} more`}
                        </div>
                      </div>
                    </TableCell>

                    {/* Amount */}
                    <TableCell>{transaction?.amount || "0"}</TableCell>
                    {/* user */}
                    <TableCell>
                      {userdata
                        ? transaction.user.name
                        : transaction?.grandTotal || ""}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Chip
                        size="sm"
                        color={
                          transaction.status === "completed"
                            ? "success"
                            : transaction.status === "pending"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {transaction.status}
                      </Chip>
                    </TableCell>

                    {/* Actions */}
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

                      {/* <Tooltip content="Delete">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => handleDeletesuppliers(transaction)}
                        >
                          <FaTrash />
                        </Button>
                      </Tooltip> */}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <SuppliersTransactionshistory />

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
                      <strong>Customer:</strong> {supplierInfo?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Payment Status:</strong>{" "}
                      {selectedTransaction?.status || "N/A"}
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
                      {/* <TableColumn>TOTAL</TableColumn> */}
                    </TableHeader>
                    <TableBody>
                      {selectedTransaction.products.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product?.name || "N/A"}</TableCell>
                          <TableCell>{item?.quantity || "N/A"}</TableCell>
                          <TableCell>{item?.amount || "N/A"}</TableCell>
                          {/* <TableCell>
                            {item?.quantity * item?.price || "N/A"}
                          </TableCell> */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>
                      {selectedTransaction?.currency?.symbol || "Rs"}.{" "}
                      {calculatedTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t mt-2 pt-2">
                    <span>TOTAL:</span>
                    <span>
                      {selectedTransaction?.currency?.symbol || "Rs"}.{" "}
                      {calculatedTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-600 border-t pt-4">
                  <p>Thank you for your business!</p>
                  <p>Visit us again soon</p>
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

      {/* <UpdateSaleModal
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
      /> */}
    </div>
  );
};

export default SuppliersDetails;
