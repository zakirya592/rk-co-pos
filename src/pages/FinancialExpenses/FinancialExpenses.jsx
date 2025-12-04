import React, { useMemo, useState } from 'react';
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
  Chip,
  Tooltip,
  Spinner,
  Pagination,
} from '@nextui-org/react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaMoneyBill } from 'react-icons/fa';
import { useQuery } from 'react-query';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';

const fetchFinancialExpenses = async ({ queryKey }) => {
  const [_, page] = queryKey;
  const res = await userRequest.get(`/expenses/financial?page=${page || 1}`);
  const d = res.data || {};
  // Normalize into a consistent shape used by other modules
  let items = [];
  let pages = d.pages || 1;
  let count = d.count || d.total || 0;

  if (Array.isArray(d?.data)) {
    items = d.data;
    count = d.count || d.total || items.length;
  } else if (Array.isArray(d?.data?.expenses)) {
    items = d.data.expenses;
    count = d.results || items.length;
  }

  return { data: items, pages, count };
};

const FinancialExpenses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['financialExpenses', page],
    queryFn: fetchFinancialExpenses,
    onSuccess: (data) => {
      setTotalPages(data.pages || 1);
      setTotalExpenses(data.count || 0);
    },
  });

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this financial expense!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    });

    if (result.isConfirmed) {
      try {
        await userRequest.delete(`/expenses/financial/${id}`);
        toast.success('Financial expense deleted successfully');
        refetch();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete expense');
      }
    }
  };

  const filteredItems = useMemo(() => {
    if (!response?.data) return [];
    const t = searchTerm.toLowerCase();

    return response.data.filter((expense) => {
      return (
        (expense.expenseSubType || '').toLowerCase().includes(t) ||
        (expense.paymentMethod || '').toLowerCase().includes(t) ||
        (expense.notes || '').toLowerCase().includes(t) ||
        (expense.currency?.code || '').toLowerCase().includes(t) ||
        (expense.linkedBankAccount?.accountName || '').toLowerCase().includes(t) ||
        (expense.linkedBankAccount?.accountNumber || '').toLowerCase().includes(t)
      );
    });
  }, [response?.data, searchTerm]);

  const renderCell = React.useCallback((expense, columnKey) => {
    switch (columnKey) {
      case 'subtype':
        return (
          <Chip className="capitalize" color="secondary" size="sm" variant="flat">
            {expense.expenseSubType || 'N/A'}
          </Chip>
        );
      case 'bank':
        return (
          <div className="flex flex-col text-sm">
            <span>{expense.linkedBankAccount?.accountName || '—'}</span>
            {expense.linkedBankAccount?.accountNumber && (
              <span className="text-xs text-gray-500">{expense.linkedBankAccount.accountNumber}</span>
            )}
          </div>
        );
      case 'amount':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">
              {(expense.currency?.symbol || 'Rs')} {Number(expense.totalCost || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">PKR {Number(expense.amountInPKR || 0).toLocaleString()}</p>
          </div>
        );
      case 'payment':
        return (
          <Chip className="capitalize" color="primary" size="sm" variant="flat">
            {expense.paymentMethod || 'N/A'}
          </Chip>
        );
      case 'date':
        return (
          <span className="text-sm">
            {expense.transactionDate ? new Date(expense.transactionDate).toLocaleDateString() : '—'}
          </span>
        );
      case 'actions':
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <Link to={`/expenses/financial/${expense._id}`}>
                  <FaEye className="text-blue-500" />
                </Link>
              </span>
            </Tooltip>
            <Tooltip content="Edit expense">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <Link to={`/expenses/financial/edit/${expense._id}`}>
                  <FaEdit className="text-yellow-500" />
                </Link>
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete expense">
              <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => handleDelete(expense._id)}>
                <FaTrash />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return null;
    }
  }, []);

  const headerColumns = [
    { name: 'EXPENSE TYPE', uid: 'subtype' },
    { name: 'BANK ACCOUNT', uid: 'bank' },
    { name: 'AMOUNT', uid: 'amount' },
    { name: 'PAYMENT', uid: 'payment' },
    { name: 'DATE', uid: 'date' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  if (isError) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500">Error loading financial expenses</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <FaMoneyBill className="text-2xl mr-2 text-primary" />
          <h1 className="text-2xl font-bold">Financial Expenses</h1>
        </div>
        <Button color="primary" endContent={<FaPlus />} onPress={() => navigate('/expenses/financial/add')}>
          Add New Expense
        </Button>
      </div>

      <Card className="mb-4">
        <CardBody>
          <div className="flex justify-between items-center">
            <Input
              className="w-1/3"
              placeholder="Search by type, bank, payment method, notes, or currency..."
              startContent={<FaSearch className="text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Total: {totalExpenses} expenses</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Table
            aria-label="Financial expenses table"
            bottomContent={
              totalPages > 1 && (
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={totalPages}
                    onChange={(newPage) => setPage(newPage)}
                  />
                </div>
              )
            }
            classNames={{ wrapper: 'min-h-[400px]' }}
          >
            <TableHeader columns={headerColumns}>
              {(column) => (
                <TableColumn key={column.uid} align={column.uid === 'actions' ? 'center' : 'start'}>
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody items={filteredItems || []} emptyContent={'No financial expenses found'} loadingContent={<Spinner />} loadingState={isLoading ? 'loading' : 'idle'}>
              {(item) => (
                <TableRow key={item._id}>
                  {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default FinancialExpenses;
