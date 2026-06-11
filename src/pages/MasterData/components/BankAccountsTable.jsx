import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
import { Plus, RefreshCw } from 'lucide-react';
import { FaSearch, FaToggleOn, FaToggleOff, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useQuery } from 'react-query';
import userRequest from '../../../utils/userRequest';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const fetchBankAccounts = async ({ queryKey }) => {
  const [_, page] = queryKey;
  const res = await userRequest.get(`/bank-accounts?page=${page || 1}`);
  const d = res?.data || {};

  let items = [];
  let pages = d.pages || 1;
  let count = d.count || d.total || d.results || 0;

  if (Array.isArray(d?.data?.bankAccounts)) {
    items = d.data.bankAccounts;
    count = d.results ?? items.length;
  } else if (Array.isArray(d?.data)) {
    items = d.data;
    count = items.length;
  }

  return { data: items, pages, count };
};

const BankAccountsTable = ({ onRefresh }) => {
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

  const handleRefresh = () => {
    refetch();
    onRefresh?.();
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this bank account!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await userRequest.delete(`/bank-accounts/${id}`);
          return response;
        } catch (error) {
          Swal.showValidationMessage(
            error.response?.data?.message || 'Failed to delete bank account'
          );
          throw error;
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        toast.success(
          result.value?.data?.message || 'Bank account deleted successfully'
        );
        handleRefresh();
      }
    });
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
        return <span className="text-sm">{acc.bankName || '—'}</span>;
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
              <p className="text-xs text-gray-500">
                Opening: {Number(acc.openingBalance).toLocaleString()}
              </p>
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
            <Tooltip content="View Details">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => navigate(`/bank-accounts/${acc._id}/details`)}
              >
                <FaEye className="text-teal-600" />
              </span>
            </Tooltip>
            <Tooltip content="Edit">
              <span
                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                onClick={() => navigate(`/bank-accounts/update/${acc._id}`)}
              >
                <FaEdit className="text-blue-500" />
              </span>
            </Tooltip>
            <Tooltip color="danger" content="Delete Account">
              <span
                className="text-lg text-danger cursor-pointer active:opacity-50"
                onClick={() => handleDelete(acc._id)}
              >
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
      <div className="flex justify-center items-center py-12">
        <p className="text-red-500">Error loading bank accounts</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Bank Accounts Management</h2>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="light"
            color="primary"
            startContent={<RefreshCw className="h-4 w-4" />}
            onPress={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            color="primary"
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => navigate('/bank-accounts/add')}
          >
            Add Bank Account
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Input
          className="max-w-md"
          placeholder="Search by account, bank, branch, type, IBAN, SWIFT, contact..."
          startContent={<FaSearch className="text-gray-400" />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
        />
        <span className="text-sm text-gray-500">Total: {totalCount} accounts</span>
      </div>

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
        classNames={{ wrapper: 'min-h-[300px]' }}
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
          emptyContent="No bank accounts found"
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
    </div>
  );
};

export default BankAccountsTable;
