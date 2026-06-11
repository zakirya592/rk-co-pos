import React, { useState } from 'react';
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
  Pagination,
} from '@nextui-org/react';
import { FaArrowLeft, FaEdit, FaUniversity } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const SOURCE_LABELS = {
  bankPaymentVoucher: 'Bank Payment',
  journalPaymentVoucher: 'Journal Payment',
  cashPaymentVoucher: 'Cash Payment',
  sarafEntryVoucher: 'Saraf Entry',
  bankAccountTransfer: 'Bank Transfer',
  openingBalanceVoucher: 'Opening Balance',
};

const formatMoney = (value, currency) => {
  const symbol = currency?.symbol || currency?.code || '';
  if (value === null || value === undefined) return `${symbol} 0.00`;
  return `${symbol} ${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : format(date, 'dd MMM yyyy');
};

const fetchBankAccountDetails = async ({ queryKey }) => {
  const [_, id, page] = queryKey;
  const res = await userRequest.get(`/bank-accounts/${id}/details?page=${page || 1}`);
  return res.data?.data || res.data;
};

const BankAccountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['bank-account-details', id, page],
    queryFn: fetchBankAccountDetails,
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to load bank account details');
    },
  });

  const account = data?.bankAccount;
  const summary = data?.summary;
  const pendingActivity = data?.pendingActivity;
  const reconciliation = data?.reconciliation;
  const transactions = data?.transactions || data?.recentTransactions || [];
  const pagination = data?.pagination;
  const currency = account?.currency;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !account) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[400px] gap-3 p-4">
        <p className="text-danger">Bank account not found or failed to load</p>
        <Button color="primary" onPress={() => navigate('/master-data?section=bank-accounts')}>
          Back to Bank Accounts
        </Button>
      </div>
    );
  }

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Button
            isIconOnly
            variant="light"
            className="mr-2"
            onPress={() => navigate('/master-data?section=bank-accounts')}
          >
            <FaArrowLeft />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <FaUniversity className="text-teal-600 text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{account.accountName}</h1>
              <p className="text-sm text-gray-500">
                {account.bankName} · {account.referCode || account.accountNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="flat" onPress={() => refetch()}>
            Refresh
          </Button>
          <Button
            color="primary"
            variant="flat"
            startContent={<FaEdit />}
            onPress={() => navigate(`/bank-accounts/update/${id}`)}
          >
            Edit Account
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-100">
          <CardBody className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Current Balance</p>
            <p className="text-2xl font-bold text-teal-700 mt-1">
              {formatMoney(summary?.currentBalance ?? account.balance, currency)}
            </p>
          </CardBody>
        </Card>
        <Card className="border border-gray-100">
          <CardBody className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Opening Balance</p>
            <p className="text-2xl font-bold mt-1">
              {formatMoney(summary?.openingBalance ?? account.openingBalance, currency)}
            </p>
          </CardBody>
        </Card>
        <Card className="border border-gray-100">
          <CardBody className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Debit</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {formatMoney(summary?.totalDebit, currency)}
            </p>
          </CardBody>
        </Card>
        <Card className="border border-gray-100">
          <CardBody className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Credit</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatMoney(summary?.totalCredit, currency)}
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 border border-gray-100">
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Account Information</h2>
            <Chip color={account.isActive ? 'success' : 'danger'} variant="flat" size="sm">
              {account.isActive ? 'Active' : 'Inactive'}
            </Chip>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Account Number</p>
                <p className="font-medium">{account.accountNumber || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Refer Code</p>
                <p className="font-medium">{account.referCode || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bank Name</p>
                <p className="font-medium">{account.bankName || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Branch</p>
                <p className="font-medium">
                  {account.branchName || '—'}
                  {account.branchCode ? ` (${account.branchCode})` : ''}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="font-medium capitalize">{account.accountType || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Currency</p>
                <p className="font-medium">
                  {currency?.name || '—'}
                  {currency?.code ? ` (${currency.code})` : ''}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">SWIFT Code</p>
                <p className="font-medium">{account.swiftCode || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">IBAN</p>
                <p className="font-medium break-all">{account.iban || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact Person</p>
                <p className="font-medium">{account.contactPerson || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact Number</p>
                <p className="font-medium">{account.contactNumber || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDate(account.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{formatDate(account.updatedAt)}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card className="border border-gray-100">
            <CardHeader>
              <h2 className="text-lg font-semibold">Balance Summary</h2>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Calculated Balance</span>
                <span className="font-medium">{formatMoney(summary?.calculatedBalance, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Balance Difference</span>
                <span className={`font-medium ${summary?.balanceDifference ? 'text-amber-600' : ''}`}>
                  {formatMoney(summary?.balanceDifference, currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Net Movement</span>
                <span className="font-medium">{formatMoney(summary?.netMovement, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transactions</span>
                <span className="font-medium">{summary?.transactionCount ?? 0}</span>
              </div>
              <Divider />
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transfers Out</span>
                <span className="font-medium">{formatMoney(summary?.transfers?.out, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transfers In</span>
                <span className="font-medium">{formatMoney(summary?.transfers?.in, currency)}</span>
              </div>
            </CardBody>
          </Card>

          {pendingActivity && (
            <Card className="border border-gray-100">
              <CardHeader>
                <h2 className="text-lg font-semibold">Pending Activity</h2>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank Payments</span>
                  <span>{pendingActivity.bankPaymentVouchers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Journal Payments</span>
                  <span>{pendingActivity.journalPaymentVouchers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cash Payments</span>
                  <span>{pendingActivity.cashPaymentVouchers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saraf Entries</span>
                  <span>{pendingActivity.sarafEntryVouchers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank Transfers</span>
                  <span>{pendingActivity.bankAccountTransfers}</span>
                </div>
                <Divider />
                <div className="flex justify-between font-semibold">
                  <span>Total Pending</span>
                  <span>{pendingActivity.total}</span>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {summary?.bySource && (
        <Card className="mb-6 border border-gray-100">
          <CardHeader>
            <h2 className="text-lg font-semibold">Activity by Source</h2>
          </CardHeader>
          <Divider />
          <CardBody className="overflow-x-auto">
            <Table aria-label="Activity by source" removeWrapper>
              <TableHeader>
                <TableColumn>SOURCE</TableColumn>
                <TableColumn>DEBIT</TableColumn>
                <TableColumn>CREDIT</TableColumn>
                <TableColumn>COUNT</TableColumn>
              </TableHeader>
              <TableBody>
                {Object.entries(summary.bySource).map(([source, stats]) => (
                  <TableRow key={source}>
                    <TableCell>{SOURCE_LABELS[source] || source}</TableCell>
                    <TableCell className="text-red-600">{formatMoney(stats.debit, currency)}</TableCell>
                    <TableCell className="text-green-600">{formatMoney(stats.credit, currency)}</TableCell>
                    <TableCell>{stats.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      {reconciliation?.latestReconciliation && (
        <Card className="mb-6 border border-gray-100">
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Latest Reconciliation</h2>
            <Chip size="sm" variant="flat" className="capitalize">
              {reconciliation.latestReconciliation.status}
            </Chip>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Voucher</p>
                <p className="font-medium">{reconciliation.latestReconciliation.voucherNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statement Date</p>
                <p className="font-medium">
                  {formatDate(reconciliation.latestReconciliation.statementDate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statement Balance</p>
                <p className="font-medium">
                  {formatMoney(reconciliation.latestReconciliation.statementBalance, currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Difference</p>
                <p className="font-medium">
                  {formatMoney(reconciliation.latestReconciliation.difference, currency)}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Total reconciliations: {reconciliation.totalReconciliations}
            </p>
          </CardBody>
        </Card>
      )}

      <Card className="border border-gray-100">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Transactions</h2>
          {pagination?.total != null && (
            <span className="text-sm text-gray-500">{pagination.total} total</span>
          )}
        </CardHeader>
        <Divider />
        <CardBody className="p-0">
          <Table
            aria-label="Bank account transactions"
            bottomContent={
              totalPages > 1 && (
                <div className="flex w-full justify-center py-4">
                  <Pagination
                    isCompact
                    showControls
                    color="primary"
                    page={page}
                    total={totalPages}
                    onChange={setPage}
                  />
                </div>
              )
            }
            classNames={{ wrapper: 'min-h-[200px]' }}
          >
            <TableHeader>
              <TableColumn>DATE</TableColumn>
              <TableColumn>REFERENCE</TableColumn>
              <TableColumn>SOURCE</TableColumn>
              <TableColumn>DESCRIPTION</TableColumn>
              <TableColumn>COUNTERPART</TableColumn>
              <TableColumn>DEBIT</TableColumn>
              <TableColumn>CREDIT</TableColumn>
              <TableColumn>RUNNING BALANCE</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No transactions found">
              {transactions.map((tx, index) => (
                <TableRow key={`${tx.sourceId}-${tx.reference}-${index}`}>
                  <TableCell>{formatDate(tx.date)}</TableCell>
                  <TableCell>
                    <span className="font-medium text-sm">{tx.reference || '—'}</span>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" className="capitalize">
                      {SOURCE_LABELS[tx.source] || tx.source}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{tx.description || '—'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{tx.counterpart || '—'}</span>
                  </TableCell>
                  <TableCell className="text-red-600">
                    {tx.debit ? formatMoney(tx.debit, currency) : '—'}
                  </TableCell>
                  <TableCell className="text-green-600">
                    {tx.credit ? formatMoney(tx.credit, currency) : '—'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatMoney(tx.runningBalance, currency)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={tx.status === 'completed' ? 'success' : 'warning'}
                      variant="flat"
                      className="capitalize"
                    >
                      {tx.status || '—'}
                    </Chip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default BankAccountDetails;
