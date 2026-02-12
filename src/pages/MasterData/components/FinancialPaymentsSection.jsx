import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@nextui-org/react";
import userRequest from "../../../utils/userRequest";

/**
 * Fetches and displays financial payments related to a specific model (Asset, Income, etc.)
 * API: GET /financial-payments/related/{relatedModel}/{relatedId}
 */
const FinancialPaymentsSection = ({ relatedModel, relatedId }) => {
  const [payments, setPayments] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [results, setResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!relatedModel || !relatedId) return;

    const fetchPayments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await userRequest.get(
          `/financial-payments/related/${relatedModel}/${relatedId}`
        );
        const paymentsList =
          data?.data?.financialPayments ||
          data?.financialPayments ||
          data?.data ||
          [];
        setPayments(Array.isArray(paymentsList) ? paymentsList : []);
        setTotalAmount(data?.totalAmount ?? 0);
        setResults(data?.results ?? paymentsList?.length ?? 0);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch payments");
        setPayments([]);
        setTotalAmount(0);
        setResults(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [relatedModel, relatedId]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatCurrency = (value) => {
    if (value == null) return "0.00";
    return parseFloat(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatMethod = (method) => {
    if (!method) return "—";
    return String(method).charAt(0).toUpperCase() + String(method).slice(1);
  };

  if (!relatedModel || !relatedId) return null;

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        Related Financial Payments
      </h4>
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
              Total: <strong>{formatCurrency(totalAmount)}</strong>
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
                <TableColumn key="amount">AMOUNT</TableColumn>
                <TableColumn key="method">METHOD</TableColumn>
                <TableColumn key="paymentDate">DATE</TableColumn>
                <TableColumn key="description">DESCRIPTION</TableColumn>
              </TableHeader>
              <TableBody items={payments} emptyContent="No payments">
                {(payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>{payment.referCode || "—"}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>{formatMethod(payment.method)}</TableCell>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {payment.description || "—"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialPaymentsSection;
