import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Card,
  CardBody,
} from "@nextui-org/react";
import { Plus, MoreVertical, Edit, Trash2, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import userRequest from "../../../utils/userRequest";
import { getFinancialPaymentsDetailsPath } from "../utils/financialPaymentsRoutes";

const PAYMENT_METHODS = [
  { key: "cash", label: "Cash" },
  { key: "online", label: "Online" },
  { key: "credit_card", label: "Credit Card" },
  { key: "debit_card", label: "Debit Card" },
  { key: "bank_transfer", label: "Bank Transfer" },
  { key: "mobile_payment", label: "Mobile Payment" },
];

const getCurrencyIdValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return String(value._id);
  return "";
};

const formatMoney = (value, currency) => {
  const symbol = currency?.symbol || currency?.code || "";
  if (value === null || value === undefined) return `${symbol} 0.00`;
  return `${symbol} ${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const normalizePaymentRow = (row) => {
  if (!row) return row;
  if (row._id) return row;
  return {
    ...row,
    _id: row.sourceId,
    referCode: row.referCode || row.reference,
    paymentDate: row.paymentDate || row.date || row.metadata?.paymentDate,
    amount: row.amount ?? row.credit ?? row.debit,
  };
};

const isLedgerResponse = (payload) =>
  Boolean(
    payload?.summary &&
      (Array.isArray(payload?.transactions) ||
        Array.isArray(payload?.recentTransactions))
  );

/**
 * Fetches and displays financial payments related to a specific model (Asset, Employee, etc.)
 * Supports Create (POST), Update (PUT), Delete (DELETE)
 */
const FinancialPaymentsSection = ({ relatedModel, relatedId, currencyId }) => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [ledgerData, setLedgerData] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [results, setResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [isCurrenciesLoading, setIsCurrenciesLoading] = useState(false);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(
    getCurrencyIdValue(currencyId)
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editingPayment, setEditingPayment] = useState(null);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "",
    amount: "",
    method: "cash",
  });
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    paymentDate: "",
    method: "cash",
    isActive: true,
  });

  const summary = ledgerData?.summary;
  const currency = ledgerData?.currency;

  const fetchCurrencies = useCallback(async () => {
    setIsCurrenciesLoading(true);
    try {
      const { data } = await userRequest.get("/currencies");
      const currencyList =
        data?.data?.currencies || data?.data || data?.currencies || [];
      const normalizedList = Array.isArray(currencyList) ? currencyList : [];
      setCurrencies(normalizedList);

      const pkrCurrency = normalizedList.find((item) => item?.code === "PKR");
      const incomingCurrencyId = getCurrencyIdValue(currencyId);
      const fallbackCurrencyId =
        incomingCurrencyId || pkrCurrency?._id || normalizedList?.[0]?._id || "";

      setSelectedCurrencyId((prev) => {
        const normalizedPrev = getCurrencyIdValue(prev);
        const hasPrevInList = normalizedList.some(
          (item) => String(item?._id) === normalizedPrev
        );
        if (hasPrevInList) return normalizedPrev;
        return String(fallbackCurrencyId);
      });
    } catch (err) {
      setCurrencies([]);
    } finally {
      setIsCurrenciesLoading(false);
    }
  }, [currencyId]);

  const fetchPayments = useCallback(async () => {
    if (!relatedModel || !relatedId) return;

    setIsLoading(true);
    setError(null);
    try {
      const requestConfig = selectedCurrencyId
        ? {
            params: {
              currency: selectedCurrencyId,
            },
          }
        : undefined;
      const { data } = await userRequest.get(
        `/financial-payments/related/${relatedModel}/${relatedId}`,
        requestConfig
      );
      const payload = data?.data || data;

      if (isLedgerResponse(payload)) {
        setLedgerData(payload);
        const txList =
          payload.recentTransactions?.length > 0
            ? payload.recentTransactions
            : payload.transactions || [];
        setPayments(txList.map(normalizePaymentRow));
        setTotalAmount(payload.summary?.currentBalance ?? 0);
        setResults(payload.summary?.transactionCount ?? txList.length ?? 0);
      } else {
        setLedgerData(null);
        const paymentsList =
          payload?.financialPayments || (Array.isArray(payload) ? payload : []);
        setPayments(Array.isArray(paymentsList) ? paymentsList : []);
        setTotalAmount(data?.totalAmount ?? 0);
        setResults(data?.results ?? paymentsList?.length ?? 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch payments");
      setLedgerData(null);
      setPayments([]);
      setTotalAmount(0);
      setResults(0);
    } finally {
      setIsLoading(false);
    }
  }, [relatedModel, relatedId, selectedCurrencyId]);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  useEffect(() => {
    const normalizedIncomingCurrencyId = getCurrencyIdValue(currencyId);
    if (normalizedIncomingCurrencyId) {
      setSelectedCurrencyId((prev) => prev || normalizedIncomingCurrencyId);
    }
  }, [currencyId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return Number.isNaN(date.getTime())
      ? "—"
      : format(date, "dd MMM yyyy HH:mm");
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const formatCurrency = (value, rowCurrency) => {
    if (ledgerData) {
      return formatMoney(value, rowCurrency || currency);
    }
    if (value == null) return "0.00";
    return parseFloat(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatMethod = (method) => {
    if (!method) return "—";
    const found = PAYMENT_METHODS.find((m) => m.key === method);
    return found
      ? found.label
      : String(method).charAt(0).toUpperCase() + String(method).slice(1);
  };

  const formatEffect = (effect) => {
    if (effect === "subtract") return "Debit";
    if (effect === "add") return "Credit";
    if (!effect) return "—";
    return String(effect);
  };

  const openLedgerDetails = () => {
    navigate(getFinancialPaymentsDetailsPath(relatedModel, relatedId));
  };

  const resetCreateForm = () => {
    setCreateForm({ name: "", amount: "", method: "cash" });
    setIsCreateOpen(false);
  };

  const openEditModal = (payment) => {
    const normalized = normalizePaymentRow(payment);
    setEditingPayment(normalized);
    setEditForm({
      description: normalized.description || "",
      amount: normalized.amount?.toString() || "",
      paymentDate: formatDateForInput(normalized.paymentDate),
      method: normalized.method || "cash",
      isActive: normalized.isActive !== false,
    });
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setEditingPayment(null);
    setEditForm({
      description: "",
      amount: "",
      paymentDate: "",
      method: "cash",
      isActive: true,
    });
    setIsEditOpen(false);
  };

  const handleCreate = async () => {
    if (!createForm.name?.trim()) {
      toast.error("Please enter name");
      return;
    }
    if (!createForm.amount || parseFloat(createForm.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await userRequest.post("/financial-payments", {
        name: createForm.name.trim(),
        amount: parseFloat(createForm.amount),
        method: createForm.method,
        relatedModel,
        relatedId,
      });
      toast.success("Payment created successfully");
      fetchPayments();
      resetCreateForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingPayment) return;
    const amountNum = parseFloat(editForm.amount);
    if (
      editForm.amount === "" ||
      (typeof amountNum === "number" && amountNum <= 0)
    ) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(editForm.amount),
        method: editForm.method,
        isActive: editForm.isActive,
      };
      if (editForm.description !== undefined)
        payload.description = editForm.description;
      if (editForm.paymentDate)
        payload.paymentDate = new Date(editForm.paymentDate).toISOString();

      await userRequest.put(
        `/financial-payments/${editingPayment._id}`,
        payload
      );
      toast.success("Payment updated successfully");
      fetchPayments();
      closeEditModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPayment) return;

    setIsSubmitting(true);
    try {
      await userRequest.delete(`/financial-payments/${deletingPayment._id}`);
      toast.success("Payment deleted successfully");
      fetchPayments();
      setIsDeleteOpen(false);
      setDeletingPayment(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!relatedModel || !relatedId) return null;

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
        <h4 className="text-sm font-semibold text-gray-700">
          Related Financial Payments
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            size="sm"
            aria-label="Currency"
            placeholder="Select currency"
            selectedKeys={
              selectedCurrencyId ? new Set([selectedCurrencyId]) : new Set()
            }
            isLoading={isCurrenciesLoading}
            className="min-w-[220px]"
            onSelectionChange={(keys) => {
              if (keys === "all") return;
              const selected = Array.from(keys)[0];
              setSelectedCurrencyId(selected ? String(selected) : "");
            }}
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
          <Button
            size="sm"
            variant="flat"
            startContent={<ExternalLink className="h-4 w-4" />}
            onPress={openLedgerDetails}
          >
            View Full Ledger
          </Button>
          <Button
            size="sm"
            color="primary"
            startContent={<Plus className="h-4 w-4" />}
            onPress={() => setIsCreateOpen(true)}
          >
            Add Payment
          </Button>
        </div>
      </div>

      {ledgerData && summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Card className="border border-gray-100">
            <CardBody className="p-3">
              <p className="text-xs text-gray-500">Current Balance</p>
              <p className="text-lg font-bold text-teal-700">
                {formatMoney(summary.currentBalance, currency)}
              </p>
            </CardBody>
          </Card>
          <Card className="border border-gray-100">
            <CardBody className="p-3">
              <p className="text-xs text-gray-500">Total Debit</p>
              <p className="text-lg font-bold text-red-600">
                {formatMoney(summary.totalDebit, currency)}
              </p>
            </CardBody>
          </Card>
          <Card className="border border-gray-100">
            <CardBody className="p-3">
              <p className="text-xs text-gray-500">Total Credit</p>
              <p className="text-lg font-bold text-green-600">
                {formatMoney(summary.totalCredit, currency)}
              </p>
            </CardBody>
          </Card>
          <Card className="border border-gray-100">
            <CardBody className="p-3">
              <p className="text-xs text-gray-500">Transactions</p>
              <p className="text-lg font-bold">{summary.transactionCount ?? 0}</p>
            </CardBody>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner size="md" />
        </div>
      ) : error ? (
        <p className="text-sm text-amber-600 py-2">{error}</p>
      ) : payments.length === 0 ? (
        <p className="text-sm text-gray-500 py-2">No related payments found.</p>
      ) : (
        <>
          <div className="flex gap-4 mb-3 text-sm">
            <span className="text-gray-600">
              <strong>{results}</strong> payment(s)
            </span>
            <span className="text-gray-600">
              {ledgerData ? "Balance" : "Total"}:{" "}
              <strong>{formatCurrency(totalAmount, currency)}</strong>
            </span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table
              aria-label="Related financial payments"
              removeWrapper
              classNames={{
                th: "bg-gray-50 text-gray-700 text-xs font-semibold",
                td: "text-sm",
              }}
            >
              <TableHeader>
                <TableColumn key="referCode">REF. CODE</TableColumn>
                {ledgerData && (
                  <TableColumn key="voucher">VOUCHER</TableColumn>
                )}
                <TableColumn key="amount">AMOUNT</TableColumn>
                {ledgerData ? (
                  <>
                    <TableColumn key="debit">DEBIT</TableColumn>
                    <TableColumn key="credit">CREDIT</TableColumn>
                    <TableColumn key="runningBalance">BALANCE</TableColumn>
                  </>
                ) : (
                  <TableColumn key="effect">EFFECT</TableColumn>
                )}
                <TableColumn key="method">METHOD</TableColumn>
                <TableColumn key="paymentDate">DATE</TableColumn>
                <TableColumn key="description">DESCRIPTION</TableColumn>
                <TableColumn key="actions" className="w-16">
                  ACTIONS
                </TableColumn>
              </TableHeader>
              <TableBody items={payments} emptyContent="No payments">
                {(payment) => (
                  <TableRow key={payment._id || payment.sourceId}>
                    <TableCell>
                      {payment.referCode || payment.reference || "—"}
                    </TableCell>
                    {ledgerData && (
                      <TableCell>{payment.code || "—"}</TableCell>
                    )}
                    <TableCell className="font-medium">
                      {formatCurrency(
                        payment.amount,
                        payment.currency || currency
                      )}
                    </TableCell>
                    {ledgerData ? (
                      <>
                        <TableCell className="text-red-600">
                          {payment.debit
                            ? formatCurrency(
                                payment.debit,
                                payment.currency || currency
                              )
                            : "—"}
                        </TableCell>
                        <TableCell className="text-green-600">
                          {payment.credit
                            ? formatCurrency(
                                payment.credit,
                                payment.currency || currency
                              )
                            : "—"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(
                            payment.runningBalance,
                            payment.currency || currency
                          )}
                        </TableCell>
                      </>
                    ) : (
                      <TableCell>{formatEffect(payment.effect)}</TableCell>
                    )}
                    <TableCell>{formatMethod(payment.method)}</TableCell>
                    <TableCell>
                      {formatDate(
                        payment.paymentDate ||
                          payment.date ||
                          payment.metadata?.paymentDate
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {payment.description || "—"}
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Payment actions">
                          <DropdownItem
                            key="edit"
                            startContent={<Edit className="h-4 w-4" />}
                            onPress={() => openEditModal(payment)}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            color="danger"
                            className="text-danger"
                            startContent={<Trash2 className="h-4 w-4" />}
                            onPress={() => {
                              setDeletingPayment(normalizePaymentRow(payment));
                              setIsDeleteOpen(true);
                            }}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {ledgerData && (summary?.transactionCount ?? 0) > payments.length && (
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                variant="light"
                color="primary"
                onPress={openLedgerDetails}
              >
                View all {summary.transactionCount} transactions
              </Button>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onClose={resetCreateForm}
      >
        <ModalContent>
          <ModalHeader>Add Payment</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Name"
                placeholder="e.g. Income adjustment"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                isRequired
                fullWidth
              />
              <Input
                type="number"
                label="Amount"
                placeholder="0.00"
                value={createForm.amount}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, amount: e.target.value }))
                }
                isRequired
                fullWidth
                min="0"
                step="0.01"
              />
              <Select
                label="Method"
                selectedKeys={createForm.method ? [createForm.method] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  if (selected)
                    setCreateForm((prev) => ({ ...prev, method: selected }));
                }}
                fullWidth
              >
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.key}>{m.label}</SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={resetCreateForm}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleCreate}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        onClose={closeEditModal}
      >
        <ModalContent>
          <ModalHeader>Edit Payment</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Textarea
                label="Description"
                placeholder="e.g. Updated description for this payment"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                minRows={2}
                fullWidth
              />
              <Input
                type="number"
                label="Amount"
                placeholder="0.00"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, amount: e.target.value }))
                }
                isRequired
                fullWidth
                min="0"
                step="0.01"
              />
              <Input
                type="datetime-local"
                label="Payment Date"
                value={editForm.paymentDate}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    paymentDate: e.target.value,
                  }))
                }
                fullWidth
              />
              <Select
                label="Method"
                selectedKeys={editForm.method ? [editForm.method] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  if (selected)
                    setEditForm((prev) => ({ ...prev, method: selected }));
                }}
                fullWidth
              >
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.key}>{m.label}</SelectItem>
                ))}
              </Select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm text-gray-600">
                  Active
                </label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={closeEditModal}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleUpdate}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onClose={() => setDeletingPayment(null)}
      >
        <ModalContent>
          <ModalHeader>Delete Payment</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete this payment?
              {deletingPayment?.referCode && (
                <span className="block mt-2 font-medium">
                  Ref: {deletingPayment.referCode} –{" "}
                  {formatCurrency(deletingPayment?.amount, currency)}
                </span>
              )}
            </p>
            <p className="text-sm text-foreground-500 mt-2">
              This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setIsDeleteOpen(false);
                setDeletingPayment(null);
              }}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default FinancialPaymentsSection;
