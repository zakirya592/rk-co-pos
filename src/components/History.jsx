
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
  Chip,
  Tabs,
  Tab
} from '@nextui-org/react';
import { FaSearch, FaEye, FaPrint, FaCalendarAlt, FaFilter } from 'react-icons/fa';

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Sample transaction history
  const transactions = [
    {
      id: 'TXN-001',
      date: '2024-01-20',
      time: '14:30',
      customer: 'Ahmad Khan',
      items: [
        { name: 'Laptop Dell XPS 13', qty: 1, price: 85000 },
        { name: 'Mouse', qty: 2, price: 1500 }
      ],
      subtotal: 88000,
      discount: 5000,
      tax: 14110,
      total: 97110,
      paymentMethod: 'Card',
      status: 'completed',
      user: 'admin'
    },
    {
      id: 'TXN-002',
      date: '2024-01-20',
      time: '15:45',
      customer: 'Walk-in Customer',
      items: [
        { name: 'Office Chair', qty: 1, price: 12000 }
      ],
      subtotal: 12000,
      discount: 0,
      tax: 2040,
      total: 14040,
      paymentMethod: 'Cash',
      status: 'completed',
      user: 'admin'
    },
    {
      id: 'TXN-003',
      date: '2024-01-19',
      time: '11:20',
      customer: 'Sarah Ahmed',
      items: [
        { name: 'iPhone 15', qty: 1, price: 250000 }
      ],
      subtotal: 250000,
      discount: 10000,
      tax: 40800,
      total: 280800,
      paymentMethod: 'Bank Transfer',
      status: 'completed',
      user: 'admin'
    }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && transaction.date === '2024-01-20') ||
      (dateFilter === 'yesterday' && transaction.date === '2024-01-19');
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    return matchesSearch && matchesDate && matchesStatus;
  });

  const viewReceipt = (transaction) => {
    setSelectedTransaction(transaction);
    setShowReceiptModal(true);
  };

  const printReceipt = () => {
    window.print();
  };

  // Summary stats
  const totalSales = transactions.reduce((sum, txn) => sum + txn.total, 0);
  const todaySales = transactions
    .filter(txn => txn.date === '2024-01-20')
    .reduce((sum, txn) => sum + txn.total, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Transaction History</h1>
          <p className="text-gray-600">View and manage sales transactions</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Today's Sales</div>
          <div className="text-2xl font-bold text-green-600">Rs. {todaySales.toLocaleString()}</div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search by transaction ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<FaSearch className="text-gray-400" />}
              className="flex-1 min-w-64"
            />
            
            <Select
              placeholder="Date Filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-48"
              startContent={<FaCalendarAlt />}
            >
              <SelectItem key="all" value="all">All Dates</SelectItem>
              <SelectItem key="today" value="today">Today</SelectItem>
              <SelectItem key="yesterday" value="yesterday">Yesterday</SelectItem>
              <SelectItem key="week" value="week">This Week</SelectItem>
            </Select>
            
            <Select
              placeholder="Status Filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48"
              startContent={<FaFilter />}
            >
              <SelectItem key="all" value="all">All Status</SelectItem>
              <SelectItem key="completed" value="completed">Completed</SelectItem>
              <SelectItem key="pending" value="pending">Pending</SelectItem>
              <SelectItem key="cancelled" value="cancelled">Cancelled</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardBody>
          <Table aria-label="Transactions table">
            <TableHeader>
              <TableColumn>TRANSACTION ID</TableColumn>
              <TableColumn>DATE & TIME</TableColumn>
              <TableColumn>CUSTOMER</TableColumn>
              <TableColumn>ITEMS</TableColumn>
              <TableColumn>TOTAL</TableColumn>
              <TableColumn>PAYMENT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>USER</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono font-semibold">{transaction.id}</TableCell>
                  <TableCell>
                    <div>
                      <div>{new Date(transaction.date).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">{transaction.time}</div>
                    </div>
                  </TableCell>
                  <TableCell>{transaction.customer}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {transaction.items.length} item(s)
                      <div className="text-xs text-gray-500">
                        {transaction.items[0].name}
                        {transaction.items.length > 1 && ` +${transaction.items.length - 1} more`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">Rs. {transaction.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat">
                      {transaction.paymentMethod}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={
                        transaction.status === 'completed' ? 'success' :
                        transaction.status === 'pending' ? 'warning' : 'danger'
                      }
                    >
                      {transaction.status}
                    </Chip>
                  </TableCell>
                  <TableCell>{transaction.user}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                        onClick={() => viewReceipt(transaction)}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="secondary"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setTimeout(printReceipt, 100);
                        }}
                      >
                        <FaPrint />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Receipt Modal */}
      <Modal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} size="2xl">
        <ModalContent>
          <ModalHeader>Transaction Receipt</ModalHeader>
          <ModalBody>
            {selectedTransaction && (
              <div className="space-y-4" id="receipt">
                {/* Shop Header */}
                <div className="text-center border-b pb-4">
                  <h2 className="text-2xl font-bold">RK & Co</h2>
                  <p className="text-sm text-gray-600">Point of Sales System</p>
                  <p className="text-sm">Contact: +92-XXX-XXXXXXX</p>
                </div>

                {/* Transaction Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Transaction ID:</strong> {selectedTransaction.id}</p>
                    <p><strong>Date:</strong> {new Date(selectedTransaction.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {selectedTransaction.time}</p>
                  </div>
                  <div>
                    <p><strong>Customer:</strong> {selectedTransaction.customer}</p>
                    <p><strong>Cashier:</strong> {selectedTransaction.user}</p>
                    <p><strong>Payment:</strong> {selectedTransaction.paymentMethod}</p>
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
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>Rs. {item.price.toLocaleString()}</TableCell>
                          <TableCell>Rs. {(item.qty * item.price).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rs. {selectedTransaction.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-Rs. {selectedTransaction.discount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Tax:</span>
                    <span>Rs. {selectedTransaction.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t mt-2 pt-2">
                    <span>TOTAL:</span>
                    <span>Rs. {selectedTransaction.total.toLocaleString()}</span>
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
            <Button color="primary" startContent={<FaPrint />} onPress={printReceipt}>
              Print Receipt
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default History;
