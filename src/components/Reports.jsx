
import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tabs,
  Tab
} from '@nextui-org/react';
import { FaDownload, FaPrint, FaCalendarAlt, FaChartBar, FaDollarSign, FaUsers, FaBoxes } from 'react-icons/fa';

const Reports = () => {
  const [dateRange, setDateRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sample data for reports
  const salesSummary = {
    totalSales: 125000,
    totalTransactions: 45,
    averageTransaction: 2778,
    totalCustomers: 28,
    totalItems: 156
  };

  const dailySales = [
    { date: '2024-01-20', sales: 15000, transactions: 8, items: 25 },
    { date: '2024-01-19', sales: 22000, transactions: 12, items: 35 },
    { date: '2024-01-18', sales: 18000, transactions: 9, items: 28 }
  ];

  const topProducts = [
    { name: 'Laptop Dell XPS 13', sold: 5, revenue: 425000 },
    { name: 'iPhone 15', sold: 3, revenue: 750000 },
    { name: 'Office Chair', sold: 8, revenue: 96000 }
  ];

  const userSales = [
    { user: 'admin', sales: 85000, transactions: 32 },
    { user: 'staff1', sales: 40000, transactions: 13 }
  ];

  const paymentMethods = [
    { method: 'Cash', amount: 75000, percentage: 60 },
    { method: 'Card', amount: 35000, percentage: 28 },
    { method: 'Bank Transfer', amount: 15000, percentage: 12 }
  ];

  const inventoryReport = [
    { product: 'Laptop Dell XPS 13', currentStock: 10, minStock: 5, status: 'good' },
    { product: 'iPhone 15', currentStock: 2, minStock: 5, status: 'low' },
    { product: 'Office Chair', currentStock: 0, minStock: 3, status: 'out' }
  ];

  const getStockStatus = (current, min) => {
    if (current === 0) return { color: 'danger', text: 'Out of Stock' };
    if (current <= min) return { color: 'warning', text: 'Low Stock' };
    return { color: 'success', text: 'In Stock' };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-600">Sales analytics and business insights</p>
        </div>
        <div className="flex gap-2">
          <Button startContent={<FaDownload />} variant="bordered">
            Export
          </Button>
          <Button startContent={<FaPrint />} variant="bordered">
            Print
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-4 items-end">
            <Select
              label="Date Range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-48"
            >
              <SelectItem key="today" value="today">Today</SelectItem>
              <SelectItem key="yesterday" value="yesterday">Yesterday</SelectItem>
              <SelectItem key="week" value="week">This Week</SelectItem>
              <SelectItem key="month" value="month">This Month</SelectItem>
              <SelectItem key="custom" value="custom">Custom Range</SelectItem>
            </Select>
            
            {dateRange === 'custom' && (
              <>
                <Input
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </>
            )}
            
            <Button color="primary" startContent={<FaCalendarAlt />}>
              Apply Filter
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardBody className="text-center p-4">
            <FaDollarSign className="text-3xl text-green-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">Rs. {salesSummary.totalSales.toLocaleString()}</h3>
            <p className="text-gray-600">Total Sales</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center p-4">
            <FaChartBar className="text-3xl text-blue-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{salesSummary.totalTransactions}</h3>
            <p className="text-gray-600">Transactions</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center p-4">
            <FaDollarSign className="text-3xl text-purple-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">Rs. {salesSummary.averageTransaction.toLocaleString()}</h3>
            <p className="text-gray-600">Avg Transaction</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center p-4">
            <FaUsers className="text-3xl text-orange-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{salesSummary.totalCustomers}</h3>
            <p className="text-gray-600">Customers</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center p-4">
            <FaBoxes className="text-3xl text-teal-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold">{salesSummary.totalItems}</h3>
            <p className="text-gray-600">Items Sold</p>
          </CardBody>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Card>
        <CardBody>
          <Tabs>
            <Tab key="sales" title="Sales Report">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Daily Sales</h3>
                <Table aria-label="Daily sales">
                  <TableHeader>
                    <TableColumn>DATE</TableColumn>
                    <TableColumn>SALES</TableColumn>
                    <TableColumn>TRANSACTIONS</TableColumn>
                    <TableColumn>ITEMS SOLD</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {dailySales.map((day, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                        <TableCell>Rs. {day.sales.toLocaleString()}</TableCell>
                        <TableCell>{day.transactions}</TableCell>
                        <TableCell>{day.items}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Tab>
            
            <Tab key="products" title="Product Report">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Top Selling Products</h3>
                <Table aria-label="Top products">
                  <TableHeader>
                    <TableColumn>PRODUCT</TableColumn>
                    <TableColumn>QUANTITY SOLD</TableColumn>
                    <TableColumn>REVENUE</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.sold}</TableCell>
                        <TableCell>Rs. {product.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Tab>
            
            <Tab key="users" title="User Report">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sales by User</h3>
                <Table aria-label="User sales">
                  <TableHeader>
                    <TableColumn>USER</TableColumn>
                    <TableColumn>TOTAL SALES</TableColumn>
                    <TableColumn>TRANSACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {userSales.map((user, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-semibold">{user.user}</TableCell>
                        <TableCell>Rs. {user.sales.toLocaleString()}</TableCell>
                        <TableCell>{user.transactions}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Tab>
            
            <Tab key="payments" title="Payment Methods">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payment Method Breakdown</h3>
                <Table aria-label="Payment methods">
                  <TableHeader>
                    <TableColumn>METHOD</TableColumn>
                    <TableColumn>AMOUNT</TableColumn>
                    <TableColumn>PERCENTAGE</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {paymentMethods.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>Rs. {payment.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip size="sm" color="primary">
                            {payment.percentage}%
                          </Chip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Tab>
            
            <Tab key="inventory" title="Inventory Report">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Stock Status</h3>
                <Table aria-label="Inventory status">
                  <TableHeader>
                    <TableColumn>PRODUCT</TableColumn>
                    <TableColumn>CURRENT STOCK</TableColumn>
                    <TableColumn>MIN STOCK</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {inventoryReport.map((item, index) => {
                      const status = getStockStatus(item.currentStock, item.minStock);
                      return (
                        <TableRow key={index}>
                          <TableCell>{item.product}</TableCell>
                          <TableCell>{item.currentStock}</TableCell>
                          <TableCell>{item.minStock}</TableCell>
                          <TableCell>
                            <Chip size="sm" color={status.color}>
                              {status.text}
                            </Chip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};

export default Reports;
