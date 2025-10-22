import {
    Card,
    CardBody,
    Chip,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@nextui-org/react";
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import userRequest from "../../utils/userRequest";


function SuppliersTransactionshistory() {
    const { id } = useParams();

    const fetchSupplierPayments = async () => {
        const response = await userRequest.get(`supplier-journey/${id}/payments`);
        return response.data || {};
    };

    const { data: paymentData = {}, isLoading: isPaymentLoading } = useQuery(
        ["supplier-payments", id],
        fetchSupplierPayments
    );

    console.log(paymentData, "payment data");


    return (
      <div>
        {/* Payment Transactions Table */}
        <Card className="mt-6">
          <h3 className="text-lg font-bold mx-3 my-4">Payment Transactions</h3>
          <CardBody>
            <Table aria-label="Payment Transactions">
              <TableHeader>
                <TableColumn>#</TableColumn>
                <TableColumn>TRANSACTION ID</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>PAYMENT METHOD</TableColumn>
                <TableColumn>AMOUNT</TableColumn>
                <TableColumn>ADVANCE PAYMENT</TableColumn>
                <TableColumn>REMAINING BALANCE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>USER</TableColumn>
                <TableColumn>NOTES</TableColumn>
              </TableHeader>
              <TableBody
                isLoading={isPaymentLoading}
                loadingContent={
                  <div className="flex justify-center items-center py-8">
                    <Spinner color="success" size="lg" />
                  </div>
                }
                emptyContent={
                  <div className="text-center text-gray-500 py-8">
                    No payment transactions found
                  </div>
                }
              >
                {(paymentData?.paymentEntries || []).map((payment, index) => (
                  <TableRow key={payment._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {payment?.payment?.transactionId || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {payment?.payment?.date 
                        ? new Date(payment.payment.date).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" color="secondary" variant="flat" className="capitalize">
                        {payment?.payment?.method || "—"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {payment?.payment?.amount?.toLocaleString() || "0"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-blue-600">
                        {payment?.advancePayment?.toLocaleString() || "0"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${
                        payment?.remainingBalance < 0 
                          ? "text-red-600" 
                          : payment?.remainingBalance > 0 
                          ? "text-orange-600" 
                          : "text-green-600"
                      }`}>
                        {payment?.remainingBalance?.toLocaleString() || "0"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={
                          payment?.payment?.status === "partial"
                            ? "warning"
                            : payment?.payment?.status === "completed"
                            ? "success"
                            : "default"
                        }
                        variant="flat"
                        className="capitalize"
                      >
                        {payment?.payment?.status || "—"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{payment?.user?.name || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={payment?.notes || ""}>
                        {payment?.notes || "—"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    );
}

export default SuppliersTransactionshistory;
