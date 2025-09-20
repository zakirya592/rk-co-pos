import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Divider,
  Spinner,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Badge,
} from '@nextui-org/react';
import { FaArrowLeft, FaEdit, FaPrint, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { GiShoppingBag } from 'react-icons/gi';
import { BsCurrencyDollar } from 'react-icons/bs';
import { RiFileList3Line } from 'react-icons/ri';
import userRequest from '../../utils/userRequest';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const ProcurementExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('details');

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const response = await userRequest.get(`/expenses/procurement/${id}`);
        setExpense(response.data.data);
      } catch (error) {
        console.error('Error fetching expense details:', error);
        toast.error('Failed to load expense details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  // const handlePrint = () => {
  //   window.print();
  // };

  // const handleExportPDF = () => {
  //   // Implement PDF export logic
  //   toast.success('Exporting to PDF...');
  // };

  // const handleExportExcel = () => {
  //   // Implement Excel export logic
  //   toast.success('Exporting to Excel...');
  // };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-danger">Expense not found or failed to load</p>
        <Button 
          className="mt-4" 
          color="primary" 
          onPress={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'danger';
      case 'partial':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'PPP');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  // Safely format currency values
  const formatCurrency = (value, currency = expense?.currency) => {
    const currencySymbol = currency?.symbol || currency?.code || '';
    if (value === null || value === undefined) return `${currencySymbol} 0.00`;
    return `${currencySymbol} ${Number(value).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Button
            isIconOnly
            variant="light"
            className="mr-2"
            onPress={() => navigate(-1)}
          >
            <FaArrowLeft />
          </Button>
          <h1 className="text-2xl font-bold">Procurement Expense Details</h1>
        </div>
        
        <div className="flex gap-2">
          <Button
            color="primary"
            variant="flat"
            startContent={<FaEdit />}
            onPress={() => navigate(`/expenses/procurement/edit/${id}`)}
          >
            Edit
          </Button>
          {/* <Button
            color="default"
            variant="flat"
            startContent={<FaPrint />}
            onPress={handlePrint}
          >
            Print
          </Button>
          <Button
            color="danger"
            variant="flat"
            startContent={<FaFilePdf />}
            onPress={handleExportPDF}
          >
            PDF
          </Button>
          <Button
            color="success"
            variant="flat"
            startContent={<FaFileExcel />}
            onPress={handleExportExcel}
          >
            Excel
          </Button> */}
        </div>
      </div>

      <Tabs 
        selectedKey={selectedTab}
        onSelectionChange={setSelectedTab}
        className="mb-4"
      >
        <Tab 
          key="details" 
          title={
            <div className="flex items-center space-x-2">
              <RiFileList3Line />
              <span>Details</span>
            </div>
          } 
        />
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Order Information</h2>
            <Chip color={getStatusColor(expense.paymentStatus)} variant="flat">
              {expense.paymentStatus?.toUpperCase()}
            </Chip>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Purchase Order</p>
                <p className="font-medium">{expense.purchaseOrderNo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Invoice Number</p>
                <p className="font-medium">{expense.invoiceNo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Supplier</p>
                <p className="font-medium">
                  {expense?.supplier?._id ? (
                    <Link 
                      to={`/suppliers/${expense.supplier._id}`}
                      className="text-primary hover:underline"
                    >
                      {expense.supplier.name || 'Unnamed Supplier'}
                    </Link>
                  ) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium">
                  {expense.createdAt ? formatDate(expense.createdAt) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium">
                  {expense.dueDate ? formatDate(expense.dueDate) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium capitalize">{expense.paymentMethod || 'N/A'}</p>
              </div>
            </div>

            {expense.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="text-sm bg-gray-50 p-3 rounded-md">{expense.notes}</p>
              </div>
            )}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Financial Summary</h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(expense?.totalCost)}
                </span>
              </div>
              
              {expense.importDuty > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Import Duty</span>
                  <span className="font-medium">
                    {formatCurrency(expense?.importDuty)}
                  </span>
                </div>
              )}
              
              {expense.packagingCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Packaging</span>
                  <span className="font-medium">
                    {formatCurrency(expense?.packagingCost)}
                  </span>
                </div>
              )}
              
              {expense.handlingCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Handling</span>
                  <span className="font-medium">
                    {formatCurrency(expense?.handlingCost)}
                  </span>
                </div>
              )}
              
              <Divider />
              
              {/* <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span>
                  {formatCurrency(expense?.amountInPKR)}
                </span>
              </div>
              
              {expense?.exchangeRate && expense.exchangeRate !== 1 && (
                <div className="text-sm text-gray-500 text-right">
                  Exchange Rate: 1 {expense.currency?.code || 'USD'} = {Number(expense.exchangeRate).toFixed(2)} PKR
                </div>
              )} */}
            </CardBody>
          </Card>

          {/* <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-3">
              <Button
                fullWidth
                variant="flat"
                color="primary"
                startContent={<GiShoppingBag />}
                onPress={() => navigate(`/purchase-orders/create?expenseId=${expense._id}`)}
              >
                Create Purchase Order
              </Button>
              
              <Button
                fullWidth
                variant="flat"
                color="success"
                startContent={<BsCurrencyDollar />}
                isDisabled={expense.paymentStatus === 'paid'}
                onPress={() => navigate(`/expenses/procurement/${id}/payment`)}
              >
                Record Payment
              </Button>
            </CardBody>
          </Card> */}
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Products</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <Table aria-label="Products table">
            <TableHeader>
              <TableColumn>PRODUCT</TableColumn>
              <TableColumn>QUANTITY</TableColumn>
              <TableColumn>UNIT PRICE</TableColumn>
              <TableColumn>TOTAL</TableColumn>
            </TableHeader>
            <TableBody>
              {expense.products?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {item.product?.name || 'Product not found'}
                      </span>
                      {item.product?.sku && (
                        <span className="text-xs text-gray-500">SKU: {item.product.sku}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item?.quantity || 0}</TableCell>
                  <TableCell>
                    {formatCurrency(item?.unitPrice)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency((item?.quantity || 0) * (item?.unitPrice || 0))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
          <div>
            <p className="font-medium mb-1">Created By</p>
            <p>{expense.createdBy?.name || 'System'}</p>
            <p className="text-xs text-gray-500">
              {expense.createdAt ? format(new Date(expense.createdAt), 'PPpp') : ''}
            </p>
          </div>
          {expense.updatedAt && (
            <div className='text-end'>
              <p className="font-medium mb-1">Last Updated</p>
              <p>{expense.updatedBy?.name || 'System'}</p>
              <p className="text-xs text-gray-500">
                {format(new Date(expense.updatedAt), 'PPpp')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcurementExpenseDetails;
