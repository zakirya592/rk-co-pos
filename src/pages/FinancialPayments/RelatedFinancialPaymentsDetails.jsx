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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 border border-gray-100">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="text-sm text-gray-500">Mobile No</p>
                <p className="font-medium">{account.mobileNo || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Related Model</p>
                <p className="font-medium">{modelLabel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Currency</p>
                <p className="font-medium">
                  {currency?.name || "—"}
                  {currency?.code ? ` (${currency.code})` : ""}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{account.description || "—"}</p>
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

        <Card className="border border-gray-100">
          <CardHeader>
            <h2 className="text-lg font-semibold">Balance Summary</h2>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Calculated Balance</span>
              <span className="font-medium">
                {formatMoney(summary?.calculatedBalance, currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Balance Difference</span>
              <span
                className={`font-medium ${
                  summary?.balanceDifference ? "text-amber-600" : ""
                }`}
              >
                {formatMoney(summary?.balanceDifference, currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Net Movement</span>
              <span className="font-medium">
                {formatMoney(summary?.netMovement, currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Transactions</span>
              <span className="font-medium">
                {summary?.transactionCount ?? 0}
              </span>
            </div>
          </CardBody>
        </Card>
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
                    <TableCell>
                      {SOURCE_LABELS[source] || source}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {formatMoney(stats.debit, currency)}
                    </TableCell>
                    <TableCell className="text-green-600">
                      {formatMoney(stats.credit, currency)}
                    </TableCell>
                    <TableCell>{stats.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}

      <Card className="border border-gray-100">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Transactions</h2>
          {pagination?.total != null && (
            <span className="text-sm text-gray-500">
              {pagination.total} total
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
              <TableColumn>VOUCHER</TableColumn>
              <TableColumn>SOURCE</TableColumn>
              <TableColumn>METHOD</TableColumn>
              <TableColumn>DESCRIPTION</TableColumn>
              <TableColumn>DEBIT</TableColumn>
              <TableColumn>CREDIT</TableColumn>
              <TableColumn>RUNNING BALANCE</TableColumn>
              <TableColumn>USER</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No transactions found">
              {transactions.map((tx, index) => (
                <TableRow key={`${tx.sourceId}-${tx.reference}-${index}`}>
                  <TableCell>{formatDate(tx.date)}</TableCell>
                  <TableCell>
                    <span className="font-medium text-sm">
                      {tx.reference || tx.referCode || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{tx.code || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" className="capitalize">
                      {SOURCE_LABELS[tx.source] || tx.source}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {METHOD_LABELS[tx.method] || tx.method || "—"}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{tx.description || "—"}</span>
                  </TableCell>
                  <TableCell className="text-red-600">
                    {tx.debit ? formatMoney(tx.debit, tx.currency || currency) : "—"}
                  </TableCell>
                  <TableCell className="text-green-600">
                    {tx.credit
                      ? formatMoney(tx.credit, tx.currency || currency)
                      : "—"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatMoney(tx.runningBalance, tx.currency || currency)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{tx.user?.name || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={tx.status === "active" ? "success" : "warning"}
                      variant="flat"
                      className="capitalize"
                    >
                      {tx.status || "—"}
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

export default RelatedFinancialPaymentsDetails;
