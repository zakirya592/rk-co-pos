import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@nextui-org/react';
import { FaArrowLeft, FaEdit, FaUsers } from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const SalesDistributionExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const response = await userRequest.get(`/expenses/sales-distribution/${id}`);
        setExpense(response.data.data);
      } catch (error) {
        console.error('Error fetching sales distribution expense details:', error);
        toast.error('Failed to load expense details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'PPP');
    } catch (error) {
      return 'N/A';
    }
  };

  const formatMoney = (value, currency = expense?.currency) => {
    const symbol = currency?.symbol || currency?.code || '';
    if (value === null || value === undefined) return `${symbol} 0.00`;
    return `${symbol} ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-3">
        <p className="text-danger">Expense not found or failed to load</p>
        <Button color="primary" onPress={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const utilities = [
    { label: 'Commission', value: expense.commissionAmount },
    { label: 'Customer Discounts', value: expense.customerDiscounts },
    { label: 'Credit Loss', value: expense.creditLoss },
    { label: 'Bad Debts', value: expense.badDebts },
    { label: 'Promotional Cost', value: expense.promotionalCost },
    { label: 'Marketing Cost', value: expense.marketingCost },
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Button isIconOnly variant="light" className="mr-2" onPress={() => navigate(-1)}>
            <FaArrowLeft />
          </Button>
          <div className="flex items-center gap-2">
            <FaUsers className="text-xl text-primary" />
            <h1 className="text-2xl font-bold">Sales Distribution Expense Details</h1>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="flat"
            onPress={() => navigate('/Navigation')}
          >
            Dashboard
          </Button>
          <Button color="primary" variant="flat" startContent={<FaEdit />} onPress={() => navigate(`/expenses/sales-distribution/edit/${id}`)}>
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">General Information</h2>
            <Chip color={expense.isActive ? 'success' : 'danger'} variant="flat">
              {expense.isActive ? 'ACTIVE' : 'INACTIVE'}
            </Chip>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Salesperson</p>
                <p className="font-medium">{expense.salesperson?.name || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sales Team</p>
                <p className="font-medium">{expense.salesTeam || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Period</p>
                <p className="font-medium">
                  {formatDate(expense.salesPeriod?.startDate)} - {formatDate(expense.salesPeriod?.endDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium capitalize">{expense.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Expense Type</p>
                <p className="font-medium capitalize">{expense.expenseType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{expense.customer?.name || '—'}</p>
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
            <CardBody className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-600">Sales Amount</span><span className="font-medium">{formatMoney(expense.salesAmount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Commission Rate</span><span className="font-medium">{Number(expense.commissionRate || 0).toFixed(2)}%</span></div>
              {utilities.map((u) => (
                <div key={u.label} className="flex justify-between"><span className="text-gray-600">{u.label}</span><span className="font-medium">{formatMoney(u.value)}</span></div>
              ))}
              <Divider />
              <div className="flex justify-between text-lg font-bold"><span>Total Cost</span><span>{formatMoney(expense.totalCost)}</span></div>
              <div className="text-right text-xs text-gray-500">PKR {Number(expense.amountInPKR || 0).toLocaleString()}</div>
              {expense?.exchangeRate && expense.exchangeRate !== 1 && (
                <div className="text-xs text-gray-500 text-right">Exchange Rate: 1 {expense.currency?.code} = {Number(expense.exchangeRate).toFixed(2)} PKR</div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Breakdown</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <Table aria-label="Breakdown table">
            <TableHeader>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
            </TableHeader>
            <TableBody>
              {utilities.map((u) => (
                <TableRow key={u.label}>
                  <TableCell>{u.label}</TableCell>
                  <TableCell>{formatMoney(u.value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 w-full mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium mb-1">Created</p>
            <p className="text-xs text-gray-500">{expense.createdAt ? format(new Date(expense.createdAt), 'PPpp') : ''}</p>
          </div>
          {expense.updatedAt && (
            <div className="text-end">
              <p className="font-medium mb-1">Last Updated</p>
              <p className="text-xs text-gray-500">{format(new Date(expense.updatedAt), 'PPpp')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesDistributionExpenseDetails;
