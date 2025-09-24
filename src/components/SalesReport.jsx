
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
  Select,
  SelectItem,
  Spinner,
  Tooltip
} from '@nextui-org/react';
import { FaSearch, FaPrint, FaCalendarAlt, FaEye, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { TbListDetails } from "react-icons/tb";
import userRequest from '../utils/userRequest';
import { exportTableToExcel, exportTableToPdf, viewTablePdfInNewTab } from '../utils/exportUtils';



const SalesReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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

    const matchesDate = dateFilter === 'all' ||
      (dateFilter === 'today' && new Date(transaction.lastPurchaseDate).toDateString() === new Date().toDateString()) ||
      (dateFilter === 'yesterday' && new Date(transaction.lastPurchaseDate).toDateString() === new Date(Date.now() - 86400000).toDateString()) ||
      (dateFilter === 'week' && new Date(transaction.lastPurchaseDate) >= new Date(Date.now() - 604800000)) ||
      (dateFilter === 'custom' && 
        (startDate === '' || new Date(transaction.lastPurchaseDate) >= new Date(startDate)) &&
        (endDate === '' || new Date(transaction.lastPurchaseDate) <= new Date(endDate))
      );

    return matchesSearch && matchesDate ;
  });

  const handleExport = (type) => {
    // Define headers consistent with the visible table
    const headers = [
      'Customer',
      'Email',
      'Phone',
      'Last Invoice',
      'Last Purchase',
      'Sales Count',
      'Total Amount',
    ];
    const rows = filteredTransactions.map((t) => [
      t.customerName || '—',
      t.customerEmail || '—',
      t.customerPhone || '—',
      t.lastInvoice || '—',
      t.lastPurchaseDate ? new Date(t.lastPurchaseDate).toLocaleDateString() : '—',
      Number(t.totalSales || 0),
      Number(t.totalAmount || 0).toLocaleString(),
    ]);

    const title = 'Sales Report';
    const filename = 'sales_report';

    if (type === 'excel') {
      exportTableToExcel(headers, rows, filename, 'Sales');
    } else if (type === 'pdf') {
      const doc = exportTableToPdf(headers, rows, title);
      doc.save(`${filename}.pdf`);
    } else if (type === 'view') {
      viewTablePdfInNewTab(headers, rows, title);
    }
  };

  return (
    <div className=" space-y-5">
      {/* Header */}

      <div className="flex justify-between items-center flex-wrap">
        <h1 className="text-2xl font-bold text-gray-700">Sales Report</h1>
        <div className="text-right space-y-2 flex flex-row flex-wrap gap-3 items-end">
          <Button
            variant="flat"
            color="primary"
            startContent={<FaEye />}
            onPress={() => handleExport("view")}
          >
            View
          </Button>
          <Button
            variant="flat"
            color="primary"
            startContent={<FaFileExcel />}
            onPress={() => handleExport("excel")}
          >
            Excel
          </Button>
          <Button
            variant="flat"
            color="primary"
            startContent={<FaFilePdf />}
            onPress={() => handleExport("pdf")}
          >
            PDF
          </Button>
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
          </div>
        </CardBody>
      </Card>

      {/* Transactions Table */}
      <div className=" w-full overflow-x-scroll">
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
            <TableColumn>TOTAL</TableColumn>
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
                No Sales Report
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
                  </div>
                </TableCell>
                <TableCell>{transaction?.customerName}</TableCell>

                <TableCell className="font-semibold">
                  {transaction.totalSales}
                </TableCell>
                <TableCell className="font-semibold">
                  {transaction.totalAmount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SalesReport;
