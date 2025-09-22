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
import { FaArrowLeft, FaEdit, FaMoneyBill } from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const MiscellaneousExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const response = await userRequest.get(`/expenses/miscellaneous/${id}`);
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

  const breakdown = [
    { label: 'Marketing', key: 'marketingCost' },
    { label: 'Promotions', key: 'promotionCost' },
    { label: 'Entertainment', key: 'entertainmentCost' },
    { label: 'Hospitality', key: 'hospitalityCost' },
    { label: 'Unexpected Costs', key: 'unexpectedCosts' },
    { label: 'Adjustments', key: 'adjustments' },
    { label: 'Legal Fees', key: 'legalFees' },
    { label: 'Consulting Fees', key: 'consultingFees' },
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Button isIconOnly variant="light" className="mr-2" onPress={() => navigate(-1)}>
            <FaArrowLeft />
          </Button>
          <div className="flex items-center gap-2">
            <FaMoneyBill className="text-xl text-primary" />
            <h1 className="text-2xl font-bold">Miscellaneous Expense Details</h1>
          </div>
        </div>

        <div className="flex gap-2">
          <Button color="primary" variant="flat" startContent={<FaEdit />} onPress={() => navigate(`/expenses/miscellaneous/edit/${id}`)}>
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
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium capitalize">{expense.expenseSubType || 'misc'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium capitalize">{expense.paymentMethod || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-sm bg-gray-50 p-3 rounded-md">{expense.description || '—'}</p>
              </div>
            </div>

            {expense.notes && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="text-sm bg-gray-50 p-3 rounded-md">{expense.notes}</p>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Financial Summary</h2>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-3">
            {breakdown.map((item) => (
              <div key={item.key} className="flex justify-between">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium">{formatMoney(expense[item.key])}</span>
              </div>
            ))}
            <Divider />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Cost</span>
              <span>{formatMoney(expense.totalCost)}</span>
            </div>
            <div className="text-right text-xs text-gray-500">PKR {Number(expense.amountInPKR || 0).toLocaleString()}</div>
            {expense?.exchangeRate && expense.exchangeRate !== 1 && (
              <div className="text-xs text-gray-500 text-right">Exchange Rate: 1 {expense.currency?.code} = {Number(expense.exchangeRate).toFixed(2)} PKR</div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Breakdown Table</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <Table aria-label="Breakdown table">
            <TableHeader>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
            </TableHeader>
            <TableBody>
              {breakdown.map((item) => (
                <TableRow key={item.key}>
                  <TableCell>{item.label}</TableCell>
                  <TableCell>{formatMoney(expense[item.key])}</TableCell>
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

export default MiscellaneousExpenseDetails;
