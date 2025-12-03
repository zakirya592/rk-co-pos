
import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Spinner,
  Tooltip
} from '@nextui-org/react';
import { FaSearch, FaEye, FaPrint, FaCalendarAlt } from 'react-icons/fa';
import { useQuery } from 'react-query';
import userRequest from '../../utils/userRequest';
import * as XLSX from "xlsx";
import { useNavigate } from 'react-router-dom';
import { TbListDetails } from "react-icons/tb";



const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const navigate = useNavigate();

  const fetchSales = async (key, searchTerm,invoiceNumber) => {
    const res = await userRequest.get("/sales/by-customer", {
      params: {
        startDate: startDate,
        endDate: endDate,
        paymentStatus: statusFilter === "all" ? "" : statusFilter,
        minTotalAmount: '',
        maxTotalAmount: '',
        minTotalDue: '',
        maxTotalDue: '',
        invoiceNumber: invoiceNumber,
        customer: searchTerm,
      },
    });
    return {
      transactions: res.data.data || [],
      total: res.data.results || 0,
    };
  };


  const { data, isLoading } = useQuery(
    ["sales", searchTerm,dateFilter,startDate,endDate,statusFilter,invoiceNumber],
    () => fetchSales("sales", searchTerm,invoiceNumber),
    { keepPreviousData: true }
  );
  const transactions = data?.transactions || [];
  
  
  
  const filteredTransactions = transactions.filter(transaction => {

     if (!searchTerm && !invoiceNumber && !startDate && !endDate && !statusFilter) {
      return true;
    }
    const matchesSearch =
      transaction?.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoiceNumber && transaction.invoiceNumber?.toLowerCase().includes(invoiceNumber.toLowerCase()))
    //    ||
    //   (invoiceNumber && transaction.totalAmount?.toString().includes(invoiceNumber)) ||
    // (invoiceNumber && transaction.dueAmount?.toString().includes(invoiceNumber)) ||
    // (invoiceNumber && transaction.paidAmount?.toString().includes(invoiceNumber));

    // console.log(matchesSearch, "matchesSearch");
    

    const matchesDate = dateFilter === 'all' ||
      (dateFilter === 'today' && new Date(transaction.lastPurchaseDate).toDateString() === new Date().toDateString()) ||
      (dateFilter === 'yesterday' && new Date(transaction.lastPurchaseDate).toDateString() === new Date(Date.now() - 86400000).toDateString()) ||
      (dateFilter === 'week' && new Date(transaction.lastPurchaseDate) >= new Date(Date.now() - 604800000)) ||
      (dateFilter === 'custom' && 
        (startDate === '' || new Date(transaction.lastPurchaseDate) >= new Date(startDate)) &&
        (endDate === '' || new Date(transaction.lastPurchaseDate) <= new Date(endDate))
      );

    // const matchesStatus = statusFilter === 'all' ||
    //   (statusFilter === 'paid' && transaction.paidAmount >= transaction.totalAmount) ||
    //   (statusFilter === 'unpaid' && transaction.paidAmount === 0) ||
    //   (statusFilter === 'partial' && transaction.paidAmount > 0 && transaction.paidAmount < transaction.totalAmount);

    return matchesSearch && matchesDate ;
  });

  const viewReceipt = (transaction) => {
    setSelectedTransaction(transaction);
    setShowReceiptModal(true);
  };

  // const printReceipt = () => {
  //   window.print();
  // };

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

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredTransactions.map((t) => ({
        Invoice: t.lastInvoice,
        Date: new Date(t.lastPurchaseDate).toLocaleDateString(),
        Time: new Date(t.lastPurchaseDate).toLocaleTimeString(),
        Customer: t.customerName || "N/A",
        Total: t.totalAmount,
        // Paid: t.totalPaid,
        // Due: t.totalDue,
        // Payment: t.paymentMethod,
        // Status: t.paymentStatus,
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "Transactions.xlsx");
  };

  return (
    <div className="p-1 sm:p-1 md:p-6 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Transaction History
          </h1>
          <p className="text-gray-600">View and manage sales transactions</p>
        </div>

        <div className="text-right space-y-2 flex flex-row flex-wrap">
          <div className="mt-7 me-3">
            <Button
              variant="flat"
              onPress={() => navigate('/Navigation')}
            >
              Dashboard
            </Button>
          </div>
          <div className="mt-7 me-3">
            <Button color="success" onPress={exportToExcel}>
              Export Excel
            </Button>
          </div>

          <div className="mx-3 text-start mt-2">
            <div className="text-sm text-gray-600">Sales</div>
            <div className="text-2xl font-bold text-green-600">
              Rs.
              {transactions
                .reduce((sum, txn) => sum + txn.totalAmount, 0)
                .toLocaleString()}
            </div>
          </div>
          {/* <div className="ms-3 text-start">
            <div className="text-sm text-gray-600">Total Paid</div>
            <div className="text-2xl font-bold text-blue-600">
              Rs.
              {transactions
                .reduce((sum, txn) => sum + txn.totalPaid, 0)
                .toLocaleString()}
            </div>
          </div> */}

          {/* <div className="ms-3 text-start">
            <div className="text-sm text-gray-600">Total Due</div>
            <div className="text-2xl font-bold text-red-600">
              Rs.
              {transactions.reduce((sum, txn) => sum + txn.totalDue, 0).toLocaleString()}
            </div> */}
          {/* </div> */}

        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search by customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<FaSearch className="text-gray-400" />}
              className="flex-1 min-w-64"
            />
            <Input
              placeholder="Search by invoice number..."
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              startContent={<FaSearch className="text-gray-400" />}
              className="flex-1 min-w-64"
            />

            <div className="flex gap-2">
              <Select
                placeholder="Date Range"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  if (e.target.value === "custom") {
                    setStartDate("");
                    setEndDate("");
                  }
                }}
                className="w-64"
                startContent={<FaCalendarAlt />}
              >
                <SelectItem key="all" value="all">
                  All Dates
                </SelectItem>
                <SelectItem key="today" value="today">
                  Today
                </SelectItem>
                <SelectItem key="yesterday" value="yesterday">
                  Yesterday
                </SelectItem>
                <SelectItem key="week" value="week">
                  This Week
                </SelectItem>
                <SelectItem key="custom" value="custom">
                  Custom Range
                </SelectItem>
              </Select>

              {dateFilter === "custom" && (
                <>
                  <div className="felx">
                    <p>Start Date</p>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <div className="felx">
                    <p>End Date</p>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </>
              )}
            </div>

            {/* <Select
              placeholder="Status Filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-64"
              startContent={<FaFilter />}
            >
              <SelectItem key="all" value="all">
                All Status
              </SelectItem>
              <SelectItem key="paid" value="paid">
                Paid
              </SelectItem>
              <SelectItem key="unpaid" value="unpaid">
                Unpaid
              </SelectItem>
              <SelectItem key="partial" value="partial">
                Partial
              </SelectItem>
            </Select> */}
          </div>
        </CardBody>
      </Card>

      {/* Transactions Table */}
      <div className="h-[400px] overflow-y-auto w-full overflow-x-scroll">
        <Table
          aria-label="Transactions table"
          className="w-full min-w-[1400px]"
        >
          <TableHeader>
            <TableColumn>Sl No</TableColumn>
            <TableColumn>INVOICE NUMBER</TableColumn>
            <TableColumn>DATE & TIME</TableColumn>
            <TableColumn>CUSTOMER</TableColumn>
            <TableColumn>ITEMS</TableColumn>
            {/* <TableColumn>SUBTOTAL</TableColumn> */}
            <TableColumn>TOTAL</TableColumn>
            {/* <TableColumn>DUE AMOUNT</TableColumn>
            <TableColumn>PAID AMOUNT</TableColumn> */}
            {/* <TableColumn>PAYMENT</TableColumn>
            <TableColumn>STATUS</TableColumn> */}
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={isLoading}
            loadingContent={
              <div className="flex justify-center items-center py-8">
                <Spinner color="success" size="lg" />
              </div>
            }
            emptyContent={
              <div className="text-center text-gray-500 py-8">
                No Transaction found
              </div>
            }
          >
            {filteredTransactions.map((transaction, index) => (
              <TableRow key={transaction.lastInvoice}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-mono font-semibold">
                  {transaction.lastInvoice}
                </TableCell>
                <TableCell>
                  <div>
                    <div>
                      {new Date(transaction.lastPurchaseDate).toLocaleString()}
                    </div>
                    {/* <div className="text-sm text-gray-500">
                      {transaction.time}
                    </div> */}
                  </div>
                </TableCell>
                <TableCell>{transaction?.customerName}</TableCell>
                {/* <TableCell>
                  <div className="text-sm">
                    {transaction?.items?.length} item(s)
                    <div className="text-xs text-gray-500">
                      {transaction?.items?.[0]?.product?.name || ""}
                      {transaction?.items?.length > 1 &&
                        ` +${transaction?.items?.length - 1} more`}
                    </div>
                  </div>
                </TableCell> */}
                <TableCell className="font-semibold">
                  {transaction.totalSales}
                </TableCell>
                <TableCell className="font-semibold">
                  Rs. {transaction.totalAmount}
                </TableCell>
                {/* <TableCell className="font-semibold">
                  Rs. {transaction.grandTotal}
                </TableCell> */}
                {/* <TableCell className="font-semibold">
                  Rs. {transaction.totalDue}
                </TableCell>
                <TableCell className="font-semibold">
                  Rs. {transaction.totalPaid}
                </TableCell> */}

                {/* <TableCell>
                  <Chip size="sm" variant="flat">
                    {transaction.paymentMethod}
                  </Chip>
                </TableCell>
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
                </TableCell> */}

                <TableCell>
                  <div className="flex gap-2">
                    {/* <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="primary"
                      onPress={() => viewReceipt(transaction)}
                    >
                      <FaEye />
                    </Button> */}
                    <Tooltip content="View Details">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="primary"
                      onPress={() => navigate(`/customers/${transaction._id}`)}
                    >
                      <TbListDetails />
                    </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
                    <p>
                      <strong>Payment:</strong>{" "}
                      {selectedTransaction?.paymentMethod || "N/A"}
                    </p>
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
                    <span>Rs. {selectedTransaction.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>Rs. {selectedTransaction?.discount || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Direct Discount:</span>
                    <span>Rs. {selectedTransaction?.tax || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t mt-2 pt-2">
                    <span>TOTAL:</span>
                    <span>Rs. {selectedTransaction.grandTotal}</span>
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
    </div>
  );
};

export default History;
