import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Select,
  SelectItem,
} from "@nextui-org/react";
import { FaArrowLeft, FaWallet } from "react-icons/fa";
import { useQuery } from "react-query";
import { format } from "date-fns";
import userRequest from "../../utils/userRequest";
import toast from "react-hot-toast";
import {
  getMasterDataBackPath,
  RELATED_MODEL_LABELS,
} from "../MasterData/utils/financialPaymentsRoutes";

const SOURCE_LABELS = {
  financialPayment: "Financial Payment",
  bankPaymentVoucher: "Bank Payment",
  journalPaymentVoucher: "Journal Payment",
  cashPaymentVoucher: "Cash Payment",
  sarafEntryVoucher: "Saraf Entry",
  bankAccountTransfer: "Bank Transfer",
  openingBalanceVoucher: "Opening Balance",
};

const METHOD_LABELS = {
  cash: "Cash",
  online: "Online",
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  bank_transfer: "Bank Transfer",
  mobile_payment: "Mobile Payment",
  other: "Other",
};

const formatMoney = (value, currency) => {
  const symbol = currency?.symbol || currency?.code || "";
  if (value === null || value === undefined) return `${symbol} 0.00`;
  return `${symbol} ${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : format(date, "dd MMM yyyy");
};

const getTransactionDetails = (tx) => {
  const parts = [];
  if (tx.code) parts.push(tx.code);
  const method = METHOD_LABELS[tx.method] || tx.method;
  if (method) parts.push(method);
  if (parts.length) return parts.join(" · ");
  return tx.description || SOURCE_LABELS[tx.source] || tx.source || "—";
};

const getTransactionSortKey = (tx) => {
  const date = new Date(tx.date).getTime() || 0;
  const ref = String(tx.reference || tx.referCode || "");
  const refNum = Number(ref.match(/(\d+)$/)?.[1]) || 0;
  return { date, refNum, ref };
};

const buildRunningBalanceRows = (
  transactions,
  { openingBalance = 0, currentBalance, page = 1 } = {}
) => {
  if (!transactions.length) return [];

  const sortNewestFirst = (items) =>
    [...items].sort((a, b) => {
      const aKey = getTransactionSortKey(a);
      const bKey = getTransactionSortKey(b);
      if (aKey.date !== bKey.date) return bKey.date - aKey.date;
      if (aKey.refNum !== bKey.refNum) return bKey.refNum - aKey.refNum;
      return bKey.ref.localeCompare(aKey.ref);
    });

  const sortOldestFirst = (items) =>
    [...items].sort((a, b) => {
      const aKey = getTransactionSortKey(a);
      const bKey = getTransactionSortKey(b);
      if (aKey.date !== bKey.date) return aKey.date - bKey.date;
      if (aKey.refNum !== bKey.refNum) return aKey.refNum - bKey.refNum;
      return aKey.ref.localeCompare(bKey.ref);
    });

  if (page === 1 && currentBalance != null) {
    let balance = Number(currentBalance);
    return sortNewestFirst(transactions).map((tx) => {
      const row = { ...tx, runningBalance: balance };
      const credit = Number(tx.credit) || 0;
      const debit = Number(tx.debit) || 0;
      balance = balance - credit + debit;
      return row;
    });
  }

  let balance = Number(openingBalance) || 0;
  const withBalance = sortOldestFirst(transactions).map((tx) => {
    const credit = Number(tx.credit) || 0;
    const debit = Number(tx.debit) || 0;
    balance += credit - debit;
    return { ...tx, runningBalance: balance };
  });

  return withBalance.reverse();
};

const fetchRelatedFinancialPayments = async ({ queryKey }) => {
  const [_, relatedModel, relatedId, page, currencyId] = queryKey;
  const params = { page: page || 1 };
  if (currencyId) params.currency = currencyId;

  const res = await userRequest.get(
    `/financial-payments/related/${relatedModel}/${relatedId}`,
    { params }
  );
  return res.data?.data || res.data;
};

const RelatedFinancialPaymentsDetails = () => {
  const { relatedModel, relatedId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [currencies, setCurrencies] = useState([]);
  const [isCurrenciesLoading, setIsCurrenciesLoading] = useState(false);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState("");

  const fetchCurrencies = useCallback(async () => {
    setIsCurrenciesLoading(true);
    try {
      const { data } = await userRequest.get("/currencies");
      const currencyList =
        data?.data?.currencies || data?.data || data?.currencies || [];
      const normalizedList = Array.isArray(currencyList) ? currencyList : [];
      setCurrencies(normalizedList);

      const pkrCurrency = normalizedList.find((item) => item?.code === "PKR");
      const defaultId = pkrCurrency?._id || normalizedList[0]?._id || "";
      setSelectedCurrencyId((prev) => prev || String(defaultId));
    } catch (err) {
      setCurrencies([]);
    } finally {
      setIsCurrenciesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "related-financial-payments",
      relatedModel,
      relatedId,
      page,
      selectedCurrencyId,
    ],
    queryFn: fetchRelatedFinancialPayments,
    enabled: Boolean(relatedModel && relatedId && selectedCurrencyId),
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to load financial ledger"
      );
    },
  });

  const account = data?.account;
  const summary = data?.summary;
  const transactions = data?.transactions || data?.recentTransactions || [];
  const pagination = data?.pagination;
  const currency = data?.currency || account?.currency;

  const handleCurrencyChange = (keys) => {
    if (keys === "all") return;
    const selected = Array.from(keys)[0];
    setSelectedCurrencyId(selected ? String(selected) : "");
    setPage(1);
  };

  if (isCurrenciesLoading || (selectedCurrencyId && isLoading)) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !account) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[400px] gap-3 p-4">
        <p className="text-danger">Financial ledger not found or failed to load</p>
        <Button
          color="primary"
          onPress={() => navigate(getMasterDataBackPath(relatedModel))}
        >
          Back to Master Data
        </Button>
      </div>
    );
  }

  const totalPages = pagination?.totalPages || 1;
  const modelLabel = RELATED_MODEL_LABELS[relatedModel] || relatedModel;
  const ledgerTransactions = buildRunningBalanceRows(transactions, {
    openingBalance: summary?.openingBalance ?? 0,
    currentBalance: summary?.currentBalance,
    page,
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Button
            isIconOnly
            variant="light"
            className="mr-2"
            onPress={() => navigate(getMasterDataBackPath(relatedModel))}
          >
            <FaArrowLeft />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <FaWallet className="text-teal-600 text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{account.name}</h1>
              <p className="text-sm text-gray-500">
                {modelLabel} · {account.referCode || account.code || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {currencies.length > 0 && (
            <Select
              size="sm"
              aria-label="Currency"
              selectedKeys={
                selectedCurrencyId ? new Set([selectedCurrencyId]) : new Set()
              }
              isLoading={isCurrenciesLoading}
              className="min-w-[200px]"
              onSelectionChange={handleCurrencyChange}
              renderValue={(items) => {
                const selectedItem = items?.[0];
                return selectedItem?.textValue || "Select currency";
              }}
            >
              {currencies.map((item) => (
                <SelectItem
                  key={item._id}
                  textValue={`${item.code || ""} - ${item.name || ""}`}
                >
                  {item.code} - {item.name}
                </SelectItem>
              ))}
            </Select>
          )}
          <Button variant="flat" onPress={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border border-gray-100">
          <CardBody className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Current Balance
            </p>
            <p className="text-2xl font-bold text-teal-700 mt-1">
              {formatMoney(summary?.currentBalance, currency)}
            </p>
          </CardBody>
        </Card>
        <Card className="border border-gray-100">
          <CardBody className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Opening Balance
            </p>
            <p className="text-2xl font-bold mt-1">
              {formatMoney(summary?.openingBalance, currency)}
            </p>
          </CardBody>
        </Card>
        <Card className="border border-gray-100">
          <CardBody className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total Debit
            </p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {formatMoney(summary?.totalDebit, currency)}
            </p>
          </CardBody>
        </Card>
        <Card className="border border-gray-100">
          <CardBody className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total Credit
            </p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatMoney(summary?.totalCredit, currency)}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card className="mb-6 border border-gray-100">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Account Information</h2>
          <Chip
            color={account.isActive ? "success" : "danger"}
            variant="flat"
            size="sm"
          >
            {account.isActive ? "Active" : "Inactive"}
          </Chip>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{account.name || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Refer Code</p>
              <p className="font-medium">{account.referCode || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Code</p>
              <p className="font-medium">{account.code || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Currency</p>
              <p className="font-medium">
                {currency?.name || "—"}
                {currency?.code ? ` (${currency.code})` : ""}
              </p>
            </div>
            {account.description && (
              <div className="sm:col-span-2 lg:col-span-4">
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{account.description}</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <Card className="border border-gray-100">
        <CardHeader className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Transactions</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Debit = money out · Credit = money in
            </p>
          </div>
          {pagination?.total != null && (
            <span className="text-sm text-gray-500">
              {pagination.total} entries
            </span>
          )}
        </CardHeader>
        <Divider />
        <CardBody className="p-0">
          <Table
            aria-label="Financial payment transactions"
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
            classNames={{ wrapper: "min-h-[200px]" }}
          >
            <TableHeader>
              <TableColumn>DATE</TableColumn>
              <TableColumn>REFERENCE</TableColumn>
              <TableColumn>DETAILS</TableColumn>
              <TableColumn>DEBIT</TableColumn>
              <TableColumn>CREDIT</TableColumn>
              <TableColumn>BALANCE</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No transactions found">
              {ledgerTransactions.map((tx, index) => (
                <TableRow key={`${tx.sourceId}-${tx.reference}-${index}`}>
                  <TableCell>{formatDate(tx.date)}</TableCell>
                  <TableCell>
                    <span className="font-medium text-sm">
                      {tx.reference || tx.referCode || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{getTransactionDetails(tx)}</span>
                  </TableCell>
                  <TableCell className="text-red-600 font-medium">
                    {tx.debit ? formatMoney(tx.debit, tx.currency || currency) : "—"}
                  </TableCell>
                  <TableCell className="text-green-600 font-medium">
                    {tx.credit
                      ? formatMoney(tx.credit, tx.currency || currency)
                      : "—"}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatMoney(tx.runningBalance, tx.currency || currency)}
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

export default RelatedFinancialPaymentsDetails;
