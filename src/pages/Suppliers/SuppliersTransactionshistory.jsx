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

    // Add this fetch function
    const fetchCategories = async () => {
        const response = await userRequest.get(`/supplier-journey/${id}/summary`);
        return response.data || [];
    };

    const { data: transactionss = [], isLoading: isCategoriesLoading } = useQuery(
        ["customer-transactions", id],
        fetchCategories
    );

    const recentActivity = transactionss?.recentActivity || [];


    return (
        <div>
            <Card>
                <h3 className="text-lg font-bold mx-3 my-4">Transaction History</h3>
                <CardBody>
                    <Table aria-label="Customer Transaction History" >
                        <TableHeader>
                            <TableColumn>S.No</TableColumn>
                            <TableColumn>Reference</TableColumn>
                            <TableColumn>Date</TableColumn>
                            <TableColumn>Payment Method</TableColumn>
                            <TableColumn>Amount</TableColumn>
                            <TableColumn>Status</TableColumn>
                            <TableColumn>User</TableColumn>
                            <TableColumn>Notes</TableColumn>
                        </TableHeader>
                        <TableBody
                            isLoading={isCategoriesLoading}
                            loadingContent={
                                <div className="flex justify-center items-center py-8">
                                    <Spinner color="success" size="lg" />
                                </div>
                            }
                            emptyContent={
                                <div className="text-center text-gray-500 py-8">
                                    No Transaction found
                                </div>
                            }
                        >
                            {recentActivity.map((transaction, index) => {
                                const isPayment = !!transaction.payment;
                                const userdata = !!transaction.user || transaction.user;
                                return (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            {isPayment
                                                ? transaction.payment.transactionId
                                                : transaction.invoiceNumber || "—"}
                                        </TableCell>
                                        <TableCell>
                                            {isPayment
                                                ? new Date(
                                                    transaction.payment.date
                                                ).toLocaleDateString()
                                                : transaction.createdAt
                                                    ? new Date(transaction.createdAt).toLocaleDateString()
                                                    : "—"}
                                        </TableCell>
                                        <TableCell>{transaction.payment.method}</TableCell>
                                        <TableCell>{transaction?.payment.amount || "0"}</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="sm"
                                                color={
                                                    transaction?.payment.status === "partial"
                                                        ? "danger"
                                                        : transaction?.payment.status === "completed"
                                                            ? "success"
                                                            : "warning"
                                                }
                                                variant="flat"
                                            >
                                                {transaction?.payment.status || ""}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            {userdata
                                                ? transaction.user.name
                                                : transaction?.grandTotal || ""}
                                        </TableCell>
                                        <TableCell>{transaction.notes || ""}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    );
}

export default SuppliersTransactionshistory;
