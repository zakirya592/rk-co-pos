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
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useQuery } from 'react-query';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Link, useNavigate } from "react-router-dom";

const fetchProcurementExpenses = async ({ queryKey }) => {
  const [_, page] = queryKey;
  const res = await userRequest.get(`/expenses/procurement?page=${page || 1}`);
  return res.data;
};

const ProcurementExpenses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [totalPages, setTotalPages] = useState(1);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["procurementExpenses", page],
    queryFn: fetchProcurementExpenses,
    onSuccess: (data) => {
      setTotalPages(data.pages || 1);
      setTotalExpenses(data.total || 0);
    },
  });

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this expense!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    });

    if (result.isConfirmed) {
      try {
        await userRequest.delete(`/expenses/procurement/${id}`);
        toast.success('Expense deleted successfully');
        refetch();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete expense');
      }
    }
  };

  const filteredItems = useMemo(() => {
    if (!response?.data) return [];
    
    return response.data.filter(expense => 
      expense.purchaseOrderNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [response?.data, searchTerm]);

  const renderCell = React.useCallback((expense, columnKey) => {
    switch (columnKey) {
      case 'purchaseOrderNo':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{expense.purchaseOrderNo || 'N/A'}</p>
          </div>
        );
      case 'invoiceNo':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">{expense.invoiceNo || 'N/A'}</p>
          </div>
        );
      case 'supplier':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">{expense.supplier?.name || 'N/A'}</p>
          </div>
        );
      case 'totalCost':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">PKR {expense.totalCost?.toLocaleString() || '0'}</p>
          </div>
        );
      case 'paymentStatus':
        return (
          <Chip
            className="capitalize"
            color={
              expense.paymentStatus === 'paid' 
                ? 'success' 
                : expense.paymentStatus === 'pending' 
                ? 'warning' 
                : 'danger'
            }
            size="sm"
            variant="flat"
          >
            {expense.paymentStatus || 'N/A'}
          </Chip>
        );
      case 'dueDate':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">
              {expense.dueDate ? new Date(expense.dueDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        );
      case 'actions':
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <Link to={`/expenses/procurement/${expense._id}`}>
                  <FaEye className="text-blue-500" />
                </Link>
              </span>
            </Tooltip>
            <Tooltip content="Edit expense">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <Link to={`/expenses/procurement/edit/${expense._id}`}>
                  <FaEdit className="text-yellow-500" />
                </Link>
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete expense">
              <span 
                className="text-lg text-danger cursor-pointer active:opacity-50"
                onClick={() => handleDelete(expense._id)}
              >
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
    { name: 'PURCHASE ORDER', uid: 'purchaseOrderNo' },
    { name: 'INVOICE NO', uid: 'invoiceNo' },
    { name: 'SUPPLIER', uid: 'supplier' },
    { name: 'TOTAL COST', uid: 'totalCost' },
    { name: 'PAYMENT STATUS', uid: 'paymentStatus' },
    { name: 'DUE DATE', uid: 'dueDate' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500">Error loading procurement expenses</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Procurement Expenses</h1>
        <Button
          color="primary"
          endContent={<FaPlus />}
          onPress={() => navigate('/expenses/procurement/add')}
        >
          Add New Expense
        </Button>
      </div>

      <Card className="mb-4">
        <CardBody>
          <div className="flex justify-between items-center">
            <Input
              className="w-1/3"
              placeholder="Search by PO, Invoice, or Supplier..."
              startContent={<FaSearch className="text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                Total: {totalExpenses} expenses
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Table
            aria-label="Procurement expenses table"
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
            classNames={{
              wrapper: "min-h-[400px]",
            }}
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
              emptyContent={"No procurement expenses found"}
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

export default ProcurementExpenses;
