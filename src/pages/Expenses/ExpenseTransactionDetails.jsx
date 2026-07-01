import React from 'react';
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
} from '@nextui-org/react';
import {
  FaArrowLeft,
  FaEdit,
  FaReceipt,
  FaUniversity,
  FaWallet,
} from 'react-icons/fa';
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

const VOUCHER_STATUS_COLORS = {
  completed: 'success',
  posted: 'success',
  approved: 'success',
  draft: 'default',
  pending: 'warning',
  cancelled: 'danger',
};

const METHOD_LABELS = {
  cash: 'Cash',
  online: 'Online',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  bank: 'Bank',
  bank_transfer: 'Bank Transfer',
  mobile_payment: 'Mobile Payment',
  check: 'Check',
  other: 'Other',
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

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : format(date, 'dd MMM yyyy, hh:mm a');
};

const renderField = (label, value) => (
  <div key={label}>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value ?? '—'}</p>
  </div>
);

const renderEntityLink = (entity, basePath, labelKey = 'name') => {
  if (!entity) return '—';
  const label = entity[labelKey] || entity.referCode || entity.code || '—';
  if (entity._id && basePath) {
    return (
      <Link to={`${basePath}/${entity._id}`} className="text-primary hover:underline">
        {label}
      </Link>
    );
  }
  return label;
};

const ProcurementCategoryDetails = ({ details, currency }) => (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {renderField('Invoice Number', details.invoiceNo)}
      {renderField('Purchase Order', details.purchaseOrderNo)}
      <div>
        <p className="text-sm text-gray-500">Supplier</p>
        <p className="font-medium">
          {renderEntityLink(details.supplier, '/suppliers/details')}
        </p>
      </div>
      {renderField('Due Date', formatDate(details.dueDate))}
      {renderField('Payment Method', details.paymentMethod)}
    </div>
    {details.products?.length > 0 && (
      <Table aria-label="Procurement products" removeWrapper>
        <TableHeader>
          <TableColumn>PRODUCT</TableColumn>
          <TableColumn>QTY</TableColumn>
          <TableColumn>UNIT PRICE</TableColumn>
          <TableColumn>TOTAL</TableColumn>
        </TableHeader>
        <TableBody>
          {details.products.map((item, index) => (
            <TableRow key={item._id || index}>
              <TableCell>{item.product?.name || item.name || '—'}</TableCell>
              <TableCell>{item.quantity ?? '—'}</TableCell>
              <TableCell>{formatMoney(item.unitPrice, currency)}</TableCell>
              <TableCell>
                {formatMoney(
                  item.totalPrice ?? item.total ?? (item.quantity || 0) * (item.unitPrice || 0),
                  currency
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )}
  </>
);

const WarehouseCategoryDetails = ({ details }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <p className="text-sm text-gray-500">Warehouse</p>
      <p className="font-medium">{details.warehouse?.name || '—'}</p>
    </div>
    {renderField('Expense Sub Type', details.expenseSubType)}
    {renderField('Period', details.period)}
    {renderField('Description', details.description)}
  </div>
);

const LogisticsCategoryDetails = ({ details }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <p className="text-sm text-gray-500">Transporter</p>
      <p className="font-medium">
        {renderEntityLink(details.transporter, '/transporter-details')}
      </p>
    </div>
    {renderField('Route', details.route)}
    {renderField('Shipment Reference', details.shipmentReference || details.referCode)}
    {renderField('Delivery Date', formatDate(details.deliveryDate))}
  </div>
);

const SalesDistributionCategoryDetails = ({ details }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {renderField('Expense Type', details.expenseType)}
    {renderField('Expense Sub Type', details.expenseSubType)}
    {renderField('Description', details.description)}
    <div>
      <p className="text-sm text-gray-500">Customer</p>
      <p className="font-medium">
        {renderEntityLink(details.customer, '/customers')}
      </p>
    </div>
  </div>
);

const OperationalCategoryDetails = ({ details }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {renderField('Department', details.department)}
    {renderField('Expense Sub Type', details.expenseSubType)}
    {renderField('Description', details.description)}
    {renderField('Notes', details.notes)}
  </div>
);

const MiscellaneousCategoryDetails = ({ details }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {renderField('Expense Sub Type', details.expenseSubType)}
    {renderField('Description', details.description)}
    {renderField('Notes', details.notes)}
  </div>
);

const FinancialCategoryDetails = ({ details, currency }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {renderField('Expense Sub Type', details.expenseSubType?.replace(/_/g, ' '))}
    {renderField('Transaction Date', formatDate(details.transactionDate))}
    {renderField('Payment Method', details.paymentMethod)}
    <div>
      <p className="text-sm text-gray-500">Linked Bank Account</p>
      <p className="font-medium">{details.linkedBankAccount?.accountName || '—'}</p>
    </div>
    {renderField('Bank Charges', formatMoney(details.bankCharges, currency))}
    {renderField('Transaction Fees', formatMoney(details.transactionFees, currency))}
  </div>
);

const CategoryDetailsSection = ({ expenseType, categoryDetails, currency }) => {
  if (!categoryDetails || Object.keys(categoryDetails).length === 0) {
    return <p className="text-sm text-gray-500">No category details available.</p>;
  }

  switch (expenseType) {
    case 'procurement':
      return <ProcurementCategoryDetails details={categoryDetails} currency={currency} />;
    case 'warehouse':
      return <WarehouseCategoryDetails details={categoryDetails} />;
    case 'logistics':
      return <LogisticsCategoryDetails details={categoryDetails} />;
    case 'sales_distribution':
      return <SalesDistributionCategoryDetails details={categoryDetails} />;
    case 'operational':
      return <OperationalCategoryDetails details={categoryDetails} />;
    case 'miscellaneous':
      return <MiscellaneousCategoryDetails details={categoryDetails} />;
    case 'financial':
      return <FinancialCategoryDetails details={categoryDetails} currency={currency} />;
    default:
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(categoryDetails)
            .filter(([, value]) => value !== null && typeof value !== 'object')
            .map(([key, value]) =>
              renderField(
                key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
                String(value)
              )
            )}
        </div>
      );
  }
};

const getExpenseDisplayTitle = (record, typeLabel) => {
  if (!record) return `${typeLabel} Expense`;
  if (record.referCode) return record.referCode;
  if (record.invoiceNo && record.purchaseOrderNo) {
    return `PO ${record.purchaseOrderNo} / Inv ${record.invoiceNo}`;
  }
  if (record.invoiceNo) return `Invoice ${record.invoiceNo}`;
  if (record.purchaseOrderNo) return `PO ${record.purchaseOrderNo}`;
  return `${typeLabel} Expense`;
};

const resolveExpenseAmount = (summary, record) => {
  const fromRecord = record?.totalAmount ?? record?.totalCost;
  if (summary?.expenseAmount) return summary.expenseAmount;
  return fromRecord || 0;
};

const resolvePaymentSummary = (summary, record) => {
  const expenseAmount = resolveExpenseAmount(summary, record);
  const paidViaVouchers = summary?.paidViaVouchers ?? 0;
  const paidViaFinancial =
    summary?.paidViaFinancialPayments ?? summary?.paidViaFinancial ?? 0;
  const totalPaid = summary?.totalPaid ?? paidViaVouchers + paidViaFinancial;
  const remainingBalance =
    summary?.remainingBalance != null && summary.expenseAmount
      ? summary.remainingBalance
      : Math.max(0, expenseAmount - totalPaid);

  return {
    expenseAmount,
    paidViaVouchers,
    paidViaFinancial,
    totalPaid,
    remainingBalance,
  };
};

const fetchExpenseTransactionDetails = async ({ queryKey }) => {
  const [_, id, expenseType] = queryKey;
  const res = await userRequest.get(`/expenses/${id}/details`, {
    params: { expenseType },
  });
  return res.data?.data || res.data;
};

const ExpenseTransactionDetails = () => {
  const { expenseTypeSlug, id } = useParams();
  const navigate = useNavigate();
  const expenseType = slugToExpenseType(expenseTypeSlug);
  const typeLabel = getExpenseTypeLabel(expenseType);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['expense-transaction-details', id, expenseType],
    queryFn: fetchExpenseTransactionDetails,
    enabled: Boolean(id && expenseType),
    onError: (error) => {
      toast.error(
        error.response?.data?.message || 'Failed to load expense transaction details'
      );
    },
  });

  const rawExpense = data?.expense;
  const categoryDetails = data?.categoryDetails;
  const expenseRecord = rawExpense || categoryDetails;
  const transactions = data?.transactions || {};
  const summary = data?.summary || {};
  const bankPaymentVouchers = transactions.bankPaymentVouchers || [];
  const financialPayments = transactions.financialPayments || [];
  const currency = expenseRecord?.currency;
  const paymentSummary = resolvePaymentSummary(summary, expenseRecord);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !expenseRecord) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[400px] gap-3 p-4">
        <p className="text-danger">Expense transactions not found or failed to load</p>
        <Button
          color="primary"
          onPress={() => navigate(getExpenseListPath(expenseType))}
        >
          Back to {typeLabel} Expenses
        </Button>
      </div>
    );
  }

  const paymentStatus =
    (summary.paymentStatus && summary.paymentStatus !== 'unknown'
      ? summary.paymentStatus
      : null) ||
    expenseRecord.paymentStatus ||
    expenseRecord.status;
  const statusColor = PAYMENT_STATUS_COLORS[paymentStatus?.toLowerCase()] || 'default';
  const displayTitle = getExpenseDisplayTitle(expenseRecord, typeLabel);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
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
              <h1 className="text-2xl font-bold">{displayTitle}</h1>
              <p className="text-sm text-gray-500">
                {typeLabel} · Transaction & Payment Details
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-100">
          <CardBody className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Expense Amount</p>
            <p className="text-2xl font-bold text-indigo-700 mt-1">
              {formatMoney(paymentSummary.expenseAmount, currency)}
            </p>
          </CardBody>
        </Card>
        <Card className="border border-gray-100">
          <CardBody className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Paid via Vouchers</p>
            <p className="text-2xl font-bold text-teal-700 mt-1">
              {formatMoney(paymentSummary.paidViaVouchers, currency)}
            </p>
          </CardBody>
        </Card>
        <Card className="border border-gray-100">
          <CardBody className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Paid</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatMoney(paymentSummary.totalPaid, currency)}
            </p>
          </CardBody>
        </Card>
        <Card className="border border-gray-100">
          <CardBody className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Remaining Balance</p>
            <p
              className={`text-2xl font-bold mt-1 ${
                paymentSummary.remainingBalance > 0 ? 'text-amber-600' : 'text-gray-700'
              }`}
            >
              {formatMoney(paymentSummary.remainingBalance, currency)}
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 border border-gray-100">
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Expense Information</h2>
            <Chip color={statusColor} variant="flat" size="sm" className="capitalize">
              {paymentStatus || '—'}
            </Chip>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Refer Code', expenseRecord.referCode)}
              {renderField('Purchase Order', expenseRecord.purchaseOrderNo)}
              {renderField('Invoice Number', expenseRecord.invoiceNo)}
              {renderField('Description', expenseRecord.description)}
              {renderField(
                'Amount',
                formatMoney(
                  expenseRecord.totalAmount ?? expenseRecord.totalCost,
                  currency
                )
              )}
              {renderField('Currency', currency?.code || currency?.name || '—')}
              {renderField('Payment Method', expenseRecord.paymentMethod)}
              {renderField('Due Date', formatDate(expenseRecord.dueDate))}
              {renderField('Created', formatDateTime(expenseRecord.createdAt))}
              {renderField('Last Updated', formatDateTime(expenseRecord.updatedAt))}
            </div>
            {expenseRecord.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="text-sm bg-gray-50 p-3 rounded-md">{expenseRecord.notes}</p>
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="border border-gray-100">
          <CardHeader>
            <h2 className="text-lg font-semibold">Payment Summary</h2>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expense Amount</span>
              <span className="font-medium">
                {formatMoney(paymentSummary.expenseAmount, currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Paid via Vouchers</span>
              <span className="font-medium">
                {formatMoney(paymentSummary.paidViaVouchers, currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Financial Payments</span>
              <span className="font-medium">
                {formatMoney(paymentSummary.paidViaFinancial, currency)}
              </span>
            </div>
            <Divider />
            <div className="flex justify-between text-sm font-semibold">
              <span>Total Paid</span>
              <span className="text-green-600">
                {formatMoney(paymentSummary.totalPaid, currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Remaining</span>
              <span
                className={
                  paymentSummary.remainingBalance > 0 ? 'text-amber-600' : 'text-gray-700'
                }
              >
                {formatMoney(paymentSummary.remainingBalance, currency)}
              </span>
            </div>
            <Divider />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Bank Payment Vouchers</span>
              <span className="font-medium">{summary.bankPaymentVoucherCount ?? bankPaymentVouchers.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Financial Payments</span>
              <span className="font-medium">{financialPayments.length}</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {categoryDetails && Object.keys(categoryDetails).length > 0 && (
      <Card className="mb-6 border border-gray-100">
        <CardHeader>
          <h2 className="text-lg font-semibold">{typeLabel} Details</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <CategoryDetailsSection
            expenseType={expenseType}
            categoryDetails={categoryDetails}
            currency={currency}
          />
        </CardBody>
      </Card>
      )}

      <Card className="mb-6 border border-gray-100">
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaUniversity className="text-teal-600" />
            <h2 className="text-lg font-semibold">Bank Payment Vouchers</h2>
          </div>
          <span className="text-sm text-gray-500">{bankPaymentVouchers.length} voucher(s)</span>
        </CardHeader>
        <Divider />
        <CardBody className="p-0">
          <Table
            aria-label="Bank payment vouchers"
            classNames={{ wrapper: 'min-h-[120px]' }}
          >
            <TableHeader>
              <TableColumn>VOUCHER #</TableColumn>
              <TableColumn>DATE</TableColumn>
              <TableColumn>BANK ACCOUNT</TableColumn>
              <TableColumn>PAYEE</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
              <TableColumn>METHOD</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No bank payment vouchers linked to this expense">
              {bankPaymentVouchers.map((voucher, index) => (
                <TableRow key={voucher._id || voucher.voucherNumber || index}>
                  <TableCell>
                    <span className="font-medium text-sm">
                      {voucher.voucherNumber || '—'}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(voucher.voucherDate)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {voucher.bankAccount?.accountName || '—'}
                      </span>
                      {voucher.bankAccount?.bankName && (
                        <span className="text-xs text-gray-500">
                          {voucher.bankAccount.bankName}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {voucher.payeeName || voucher.payee?.name || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatMoney(voucher.amount, voucher.currency || currency)}
                  </TableCell>
                  <TableCell className="capitalize">
                    {METHOD_LABELS[voucher.paymentMethod] || voucher.paymentMethod || '—'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={VOUCHER_STATUS_COLORS[voucher.status?.toLowerCase()] || 'default'}
                      className="capitalize"
                    >
                      {voucher.status || '—'}
                    </Chip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {bankPaymentVouchers.some((v) => v.entries?.length > 0) && (
        <Card className="mb-6 border border-gray-100">
          <CardHeader>
            <h2 className="text-lg font-semibold">Voucher Entries</h2>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-6">
            {bankPaymentVouchers
              .filter((v) => v.entries?.length > 0)
              .map((voucher, vIndex) => (
                <div key={voucher._id || vIndex}>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    {voucher.voucherNumber || `Voucher ${vIndex + 1}`}
                  </p>
                  <Table aria-label={`Entries for ${voucher.voucherNumber}`} removeWrapper>
                    <TableHeader>
                      <TableColumn>ACCOUNT</TableColumn>
                      <TableColumn>DESCRIPTION</TableColumn>
                      <TableColumn>DEBIT</TableColumn>
                      <TableColumn>CREDIT</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {voucher.entries.map((entry, eIndex) => (
                        <TableRow key={entry._id || eIndex}>
                          <TableCell>{entry.accountName || entry.account?.name || '—'}</TableCell>
                          <TableCell>{entry.description || '—'}</TableCell>
                          <TableCell className="text-red-600">
                            {entry.debit ? formatMoney(entry.debit, currency) : '—'}
                          </TableCell>
                          <TableCell className="text-green-600">
                            {entry.credit ? formatMoney(entry.credit, currency) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
          </CardBody>
        </Card>
      )}

      <Card className="border border-gray-100">
        <CardHeader className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaWallet className="text-purple-600" />
            <h2 className="text-lg font-semibold">Financial Payments</h2>
          </div>
          <span className="text-sm text-gray-500">{financialPayments.length} payment(s)</span>
        </CardHeader>
        <Divider />
        <CardBody className="p-0">
          <Table
            aria-label="Financial payments"
            classNames={{ wrapper: 'min-h-[120px]' }}
          >
            <TableHeader>
              <TableColumn>DATE</TableColumn>
              <TableColumn>REFERENCE</TableColumn>
              <TableColumn>DESCRIPTION</TableColumn>
              <TableColumn>METHOD</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
              <TableColumn>USER</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No financial payments linked to this expense">
              {financialPayments.map((payment, index) => (
                <TableRow key={payment._id || payment.referCode || index}>
                  <TableCell>{formatDate(payment.date || payment.paymentDate)}</TableCell>
                  <TableCell>
                    <span className="font-medium text-sm">
                      {payment.referCode || payment.reference || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{payment.description || '—'}</span>
                  </TableCell>
                  <TableCell>
                    {METHOD_LABELS[payment.method || payment.paymentMethod] ||
                      payment.method ||
                      payment.paymentMethod ||
                      '—'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatMoney(
                      payment.amount ?? payment.credit ?? payment.debit,
                      payment.currency || currency
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{payment.user?.name || '—'}</span>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={payment.status === 'active' ? 'success' : 'default'}
                      className="capitalize"
                    >
                      {payment.status || '—'}
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

export default ExpenseTransactionDetails;
