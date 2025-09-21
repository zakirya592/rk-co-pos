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
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaTruck } from 'react-icons/fa';
import { useQuery } from 'react-query';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Link, useNavigate } from "react-router-dom";

const fetchLogisticsExpenses = async ({ queryKey }) => {
  const [_, page] = queryKey;
  const res = await userRequest.get(`/expenses/logistics?page=${page || 1}`);
  return res.data;
};

const LogisticsExpenses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["logisticsExpenses", page],
    queryFn: fetchLogisticsExpenses,
    onSuccess: (data) => {
      setTotalPages(data.pages || 1);
      setTotalExpenses(data.total || data.count || 0);
    },
  });

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this logistics expense!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    });

    if (result.isConfirmed) {
      try {
        await userRequest.delete(`/expenses/logistics/${id}`);
        toast.success('Logistics expense deleted successfully');
        refetch();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete logistics expense');
      }
    }
  };

  const filteredItems = useMemo(() => {
    if (!response?.data) return [];
    return response.data.filter(expense =>
      (expense.route || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.vehicleContainerNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.transportStatus || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [response?.data, searchTerm]);

  const renderCell = React.useCallback((expense, columnKey) => {
    switch (columnKey) {
      case 'route':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">{expense.route || 'N/A'}</p>
            <p className="text-xs text-gray-500">Vehicle: {expense.vehicleContainerNo || 'N/A'}</p>
          </div>
        );
      case 'period':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">
              {expense.departureDate ? new Date(expense.departureDate).toLocaleDateString() : 'N/A'}
              {' - '}
              {expense.arrivalDate ? new Date(expense.arrivalDate).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 capitalize">{expense.transportStatus || 'status unknown'}</p>
          </div>
        );
      case 'amount':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">
              {(expense.currency?.symbol || '$')} {(expense.totalCost?.toLocaleString?.() ?? (expense.totalCost || 0))}
            </p>
            <p className="text-xs text-gray-500">
              PKR {(expense.amountInPKR?.toLocaleString?.() ?? (expense.amountInPKR || 0))}
            </p>
          </div>
        );
      case 'payment':
        return (
          <div className="flex flex-col">
            <Chip className="capitalize" color="primary" size="sm" variant="flat">
              {expense.paymentMethod || 'N/A'}
            </Chip>
          </div>
        );
      case 'actions':
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <Link to={`/expenses/logistics/${expense._id}`}>
                  <FaEye className="text-blue-500" />
                </Link>
              </span>
            </Tooltip>
            <Tooltip content="Edit expense">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <Link to={`/expenses/logistics/edit/${expense._id}`}>
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
    { name: 'ROUTE', uid: 'route' },
    { name: 'PERIOD & STATUS', uid: 'period' },
    { name: 'AMOUNT', uid: 'amount' },
    { name: 'PAYMENT', uid: 'payment' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  if (isError) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500">Error loading logistics expenses</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <FaTruck className="text-2xl mr-2 text-primary" />
          <h1 className="text-2xl font-bold">Logistics Expenses</h1>
        </div>
        <Button color="primary" endContent={<FaPlus />} onPress={() => navigate('/expenses/logistics/add')}>
          Add New Expense
        </Button>
      </div>

      <Card className="mb-4">
        <CardBody>
          <div className="flex justify-between items-center">
            <Input
              className="w-1/3"
              placeholder="Search by route, vehicle, or status..."
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
            aria-label="Logistics expenses table"
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
            classNames={{ wrapper: "min-h-[400px]" }}
          >
            <TableHeader columns={headerColumns}>
              {(column) => (
                <TableColumn key={column.uid} align={column.uid === 'actions' ? 'center' : 'start'}>
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={filteredItems || []}
              emptyContent={"No logistics expenses found"}
              loadingContent={<Spinner />}
              loadingState={isLoading ? "loading" : "idle"}
            >
              {(item) => (
                <TableRow key={item._id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default LogisticsExpenses;
