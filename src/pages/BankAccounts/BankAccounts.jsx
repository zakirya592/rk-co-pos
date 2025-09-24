import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Link,
} from '@nextui-org/react';
import { FaSearch, FaUniversity, FaToggleOn, FaToggleOff, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { useQuery } from 'react-query';
import userRequest from '../../utils/userRequest';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

// Fetcher: normalizes the API to a common shape
const fetchBankAccounts = async ({ queryKey }) => {
  const [_, page] = queryKey;
  const res = await userRequest.get(`/bank-accounts?page=${page || 1}`);
  const d = res?.data || {};

  // Expected sample:
  // {
  //   status: 'success',
  //   results: 1,
  //   data: { bankAccounts: [ ... ] }
  // }
  let items = [];
  let pages = d.pages || 1; // if backend supports pagination
  let count = d.count || d.total || d.results || 0;

  if (Array.isArray(d?.data?.bankAccounts)) {
    items = d.data.bankAccounts;
    count = d.results ?? items.length;
  } else if (Array.isArray(d?.data)) {
    // fallback if API returns data as array directly
    items = d.data;
    count = items.length;
  }

  return { data: items, pages, count };
};

const BankAccounts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['bank-accounts', page],
    queryFn: fetchBankAccounts,
    onSuccess: (data) => {
      setTotalPages(data.pages || 1);
      setTotalCount(data.count || 0);
    },
  });

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this bank account!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    });

    if (result.isConfirmed) {
      try {
      const response =  await userRequest.delete(`/bank-accounts/${id}`);
        toast.success(response?.data?.message || 'Bank account deactivated successfully');
        refetch();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete bank account');
      }
    }
  };

  const filteredItems = useMemo(() => {
    const list = response?.data || [];
    const t = searchTerm.trim().toLowerCase();
    if (!t) return list;

    return list.filter((acc) => {
      return (
        (acc.accountName || '').toLowerCase().includes(t) ||
        (acc.accountNumber || '').toLowerCase().includes(t) ||
        (acc.bankName || '').toLowerCase().includes(t) ||
        (acc.branchName || '').toLowerCase().includes(t) ||
        (acc.accountType || '').toLowerCase().includes(t) ||
        (acc.swiftCode || '').toLowerCase().includes(t) ||
        (acc.iban || '').toLowerCase().includes(t) ||
        (acc.contactPerson || '').toLowerCase().includes(t) ||
        (acc.contactNumber || '').toLowerCase().includes(t)
      );
    });
  }, [response?.data, searchTerm]);

  const headerColumns = [
    { name: 'ACCOUNT', uid: 'account' },
    { name: 'BANK', uid: 'bank' },
    { name: 'BRANCH', uid: 'branch' },
    { name: 'TYPE', uid: 'type' },
    { name: 'BALANCE', uid: 'balance' },
    { name: 'ACTIVE', uid: 'active' },
    { name: 'ACTIONS', uid: 'actions' },
  ];

  const renderCell = (acc, columnKey) => {
    switch (columnKey) {
      case 'account':
        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">{acc.accountName || '—'}</span>
            {acc.accountNumber && (
              <span className="text-xs text-gray-500">{acc.accountNumber}</span>
            )}
          </div>
        );
      case 'bank':
        return (
          <div className="flex flex-col text-sm">
            <span>{acc.bankName || "—"}</span>
          </div>
        );
      case 'branch':
        return (
          <div className="flex flex-col text-sm">
            <span>{acc.branchName || '—'}</span>
            {acc.branchCode && (
              <span className="text-xs text-gray-500">{acc.branchCode}</span>
            )}
          </div>
        );
      case 'type':
        return (
          <Chip className="capitalize" color="secondary" size="sm" variant="flat">
            {acc.accountType || '—'}
          </Chip>
        );
      case 'balance':
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">{Number(acc.balance || 0).toLocaleString()}</p>
            {acc.openingBalance != null && (
              <p className="text-xs text-gray-500">Opening: {Number(acc.openingBalance).toLocaleString()}</p>
            )}
          </div>
        );
      case 'active':
        return (
          <Tooltip content={acc.isActive ? 'Active' : 'Inactive'}>
            <span className="text-lg text-default-400">
              {acc.isActive ? (
                <FaToggleOn className="text-green-500" />
              ) : (
                <FaToggleOff className="text-gray-400" />
              )}
            </span>
          </Tooltip>
        );
      case 'actions':
        return (
          <div className="flex items-center space-x-2">
            <Tooltip content="Edit">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => navigate(`/bank-accounts/update/${acc._id}`)}
              >
                <FaEdit className="text-blue-500" />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete Account">
              <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => handleDelete(acc._id)}>
                <FaTrash />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return null;
    }
  };

  if (isError) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500">Error loading bank accounts</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <FaUniversity className="text-2xl mr-2 text-primary" />
          <h1 className="text-2xl font-bold">Bank Accounts</h1>
        </div>
        <Button
          color="primary"
          onPress={() => navigate('/bank-accounts/add')}
          startContent={<FaPlus />}
        >
          Add New Account
        </Button>
      </div>

      <Card className="mb-4">
        <CardBody>
          <div className="flex justify-between items-center">
            <Input
              className="w-1/3"
              placeholder="Search by account, bank, branch, type, IBAN, SWIFT, contact..."
              startContent={<FaSearch className="text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Total: {totalCount} accounts</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Table
            aria-label="Bank accounts table"
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
            <TableBody
              items={filteredItems || []}
              emptyContent={'No bank accounts found'}
              loadingContent={<Spinner />}
              loadingState={isLoading ? 'loading' : 'idle'}
            >
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

export default BankAccounts;
