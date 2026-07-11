import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
import { FaArrowLeft, FaEdit, FaReceipt } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import {
  getExpenseDetailsPath,
  getExpenseListPath,
  getExpenseTypeLabel,
  slugToExpenseType,
} from './utils/expenseRoutes';

const PAYMENT_STATUS_COLORS = {
  paid: 'success',
  pending: 'warning',
  partial: 'secondary',
  overdue: 'danger',
};

const PAYMENT_SOURCES = new Set([
  'bankPaymentVoucher',
  'financialPayment',
  'cashPaymentVoucher',
  'journalPaymentVoucher',
]);

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

const renderField = (label, value) => {
  if (value === null || value === undefined || value === '' || value === '—') return null;
  return (
    <div key={label}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
};

const renderEntityLink = (entity, basePath, labelKey = 'name') => {
  if (!entity) return null;
  const label = entity[labelKey] || entity.referCode || entity.code;
  if (!label) return null;
  if (entity._id && basePath) {
    return (
      <Link to={`${basePath}/${entity._id}`} className="text-primary hover:underline">
        {label}
      </Link>
    );
  }
  return label;
};

const getExpenseDisplayTitle = (expense, categoryDetails, typeLabel) => {
  if (expense?.referCode) return expense.referCode;
  if (categoryDetails?.invoiceNo) return categoryDetails.invoiceNo;
  if (categoryDetails?.purchaseOrderNo) return categoryDetails.purchaseOrderNo;
  return `${typeLabel} Expense`;
};

const getExpenseSubtitle = (categoryDetails, typeLabel) => {
  const parts = [typeLabel];
  if (categoryDetails?.supplier?.name) parts.push(categoryDetails.supplier.name);
  return parts.join(' · ');
};

const mapLedgerRow = (tx) => {
  const amount = tx.amount ?? tx.debit ?? tx.credit ?? 0;
  const isPayment = PAYMENT_SOURCES.has(tx.source);

  return {
    ...tx,
    debit: isPayment ? 0 : amount,
    credit: isPayment ? amount : 0,
    typeLabel: isPayment ? 'Payment' : 'Expense',
  };
};

const buildBalanceDueRows = (rows) => {
  let balanceDue = 0;

  return [...rows]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((row) => {
      balanceDue += row.debit - row.credit;
      return { ...row, balanceDue: Math.max(0, balanceDue) };
    });
};

const CategoryInfoFields = ({ expenseType, categoryDetails, currency }) => {
  if (!categoryDetails) return null;

  switch (expenseType) {
    case 'procurement':
      return (
        <>
          {renderField('Purchase Order', categoryDetails.purchaseOrderNo)}
          <div>
            <p className="text-sm text-gray-500">Supplier</p>
            <p className="font-medium">
              {renderEntityLink(categoryDetails.supplier, '/suppliers/details') || '—'}
            </p>
          </div>
          {renderField('Due Date', formatDate(categoryDetails.dueDate))}
          {categoryDetails.products?.length > 0 && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 mb-1">Products</p>
              <div className="space-y-1">
                {categoryDetails.products.map((item, index) => (
                  <p key={item._id || index} className="text-sm">
                    {item.product?.name || '—'} × {item.quantity ?? 1}
                    {' — '}
                    {formatMoney(item.totalPrice ?? item.quantity * item.unitPrice, currency)}
                  </p>
                ))}
              </div>
            </div>
          )}
        </>
      );
    case 'warehouse':
      return (
        <>
          {renderField('Warehouse', categoryDetails.warehouse?.name)}
          {renderField('Sub Type', categoryDetails.expenseSubType)}
          {renderField('Period', categoryDetails.period)}
        </>
      );
    case 'logistics':
      return (
        <>
          <div>
            <p className="text-sm text-gray-500">Transporter</p>
            <p className="font-medium">
              {renderEntityLink(categoryDetails.transporter, '/transporter-details') || '—'}
            </p>
          </div>
          {renderField('Route', categoryDetails.route)}
          {renderField('Delivery Date', formatDate(categoryDetails.deliveryDate))}
        </>
      );
    case 'sales_distribution':
      return (
        <>
          {renderField('Sub Type', categoryDetails.expenseSubType)}
          <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-medium">
              {renderEntityLink(categoryDetails.customer, '/customers') || '—'}
            </p>
          </div>
        </>
      );
    case 'operational':
      return (
        <>
          {renderField('Department', categoryDetails.department)}
          {renderField('Sub Type', categoryDetails.expenseSubType)}
        </>
      );
    case 'miscellaneous':
      return <>{renderField('Sub Type', categoryDetails.expenseSubType)}</>;
    case 'financial':
      return (
        <>
          {renderField('Sub Type', categoryDetails.expenseSubType?.replace(/_/g, ' '))}
          {renderField('Bank Account', categoryDetails.linkedBankAccount?.accountName)}
        </>
      );
    default:
      return null;
  }
};

const fetchExpenseTransactionDetails = async ({ queryKey }) => {
  const [_, id, expenseType, page] = queryKey;
  const res = await userRequest.get(`/expenses/${id}/details`, {
    params: { expenseType, page: page || 1 },
  });
  return res.data?.data || res.data;
};

const ExpenseTransactionDetails = () => {
  const { expenseTypeSlug, id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const expenseType = slugToExpenseType(expenseTypeSlug);
  const typeLabel = getExpenseTypeLabel(expenseType);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['expense-transaction-details', id, expenseType, page],
    queryFn: fetchExpenseTransactionDetails,
    enabled: Boolean(id && expenseType),
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to load expense transaction details'
      );
    },
  });

  const expense = data?.expense;
  const categoryDetails = data?.categoryDetails;
  const summary = data?.summary || {};
  const ledger = data?.ledger || {};
  const rawTransactions = ledger.transactions || ledger.recentTransactions || [];
  const pagination = ledger.pagination;
  const currency = expense?.currency || categoryDetails?.currency;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || (!expense && !categoryDetails)) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[400px] gap-3 p-4">
        <p className="text-danger">Expense not found or failed to load</p>
        <Button color="primary" onPress={() => navigate(getExpenseListPath(expenseType))}>
          Back to {typeLabel} Expenses
        </Button>
      </div>
    );
  }

  const paymentStatus =
    summary.paymentStatus ||
    expense?.status ||
    categoryDetails?.paymentStatus ||
    'pending';
  const statusColor = PAYMENT_STATUS_COLORS[paymentStatus?.toLowerCase()] || 'default';

  const expenseAmount =
    summary.expenseAmount ?? expense?.totalAmount ?? categoryDetails?.totalCost ?? 0;
  const paidAmount = summary.totalPaid ?? summary.paidAmount ?? 0;
  const remainingBalance =
    summary.remainingBalance ?? Math.max(0, expenseAmount - paidAmount);

  const mappedTransactions = buildBalanceDueRows(rawTransactions.map(mapLedgerRow));
  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Button
            isIconOnly
            variant="light"
            className="mr-2"
            onPress={() => navigate(getExpenseDetailsPath(expenseType, id))}
          >
            <FaArrowLeft />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FaReceipt className="text-indigo-600 text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {getExpenseDisplayTitle(expense, categoryDetails, typeLabel)}
              </h1>
              <p className="text-sm text-gray-500">
                {getExpenseSubtitle(categoryDetails, typeLabel)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="flat" onPress={() => refetch()}>
            Refresh
          </Button>
          <Button
            variant="flat"
            onPress={() => navigate(getExpenseDetailsPath(expenseType, id))}
          >
            Expense Details
          </Button>
          <Button
            color="primary"
            variant="flat"
            startContent={<FaEdit />}
            onPress={() => navigate(`${getExpenseListPath(expenseType)}/edit/${id}`)}
          >
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border border-gray-100">
          <CardBody className="p-4 text-center sm:text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Expense</p>
            <p className="text-2xl font-bold text-indigo-700 mt-1">
              {formatMoney(expenseAmount, currency)}
            </p>
          </CardBody>
        </Card>
        <Card className="border border-gray-100">
          <CardBody className="p-4 text-center sm:text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Paid</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatMoney(paidAmount, currency)}
            </p>
          </CardBody>
        </Card>
        <Card className="border border-gray-100">
          <CardBody className="p-4 text-center sm:text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Remaining</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                remainingBalance > 0 ? 'text-amber-600' : 'text-gray-700'
              }`}
            >
              {formatMoney(remainingBalance, currency)}
            </p>
            <Chip color={statusColor} variant="flat" size="sm" className="capitalize mt-2">
              {paymentStatus}
            </Chip>
          </CardBody>
        </Card>
      </div>

      <Card className="mb-6 border border-gray-100">
        <CardHeader>
          <h2 className="text-lg font-semibold">Details</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderField('Refer Code', expense?.referCode)}
            {renderField('Invoice', categoryDetails?.invoiceNo)}
            {renderField('Description', expense?.description)}
            {renderField('Payment Method', expense?.paymentMethod || categoryDetails?.paymentMethod)}
            {renderField('Expense Date', formatDate(expense?.expenseDate || categoryDetails?.createdAt))}
            {renderField('Created By', expense?.createdBy?.name)}
            <CategoryInfoFields
              expenseType={expenseType}
              categoryDetails={categoryDetails}
              currency={currency}
            />
          </div>
        </CardBody>
      </Card>

      <Card className="border border-gray-100">
        <CardHeader className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Payment History</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Expense in debit · Payments in credit
            </p>
          </div>
          {pagination?.total != null && (
            <span className="text-sm text-gray-500">{pagination.total} entries</span>
          )}
        </CardHeader>
        <Divider />
        <CardBody className="p-0">
          <Table
            aria-label="Payment history"
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
            classNames={{ wrapper: 'min-h-[120px]' }}
          >
            <TableHeader>
              <TableColumn>DATE</TableColumn>
              <TableColumn>REFERENCE</TableColumn>
              <TableColumn>DESCRIPTION</TableColumn>
              <TableColumn>DEBIT</TableColumn>
              <TableColumn>CREDIT</TableColumn>
              <TableColumn>BALANCE DUE</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No transactions yet">
              {mappedTransactions.map((tx, index) => (
                <TableRow key={`${tx.sourceId}-${tx.reference}-${index}`}>
                  <TableCell>{formatDate(tx.date)}</TableCell>
                  <TableCell>
                    <span className="font-medium text-sm">{tx.reference || '—'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{tx.description || tx.typeLabel}</span>
                  </TableCell>
                  <TableCell className="text-red-600 font-medium">
                    {tx.debit ? formatMoney(tx.debit, currency) : '—'}
                  </TableCell>
                  <TableCell className="text-green-600 font-medium">
                    {tx.credit ? formatMoney(tx.credit, currency) : '—'}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatMoney(tx.balanceDue, currency)}
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

export default ExpenseTransactionDetails;
