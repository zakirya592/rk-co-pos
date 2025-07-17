import { Card, CardBody, Chip, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react';
import React from 'react'
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import userRequest from '../../utils/userRequest';

function Transactionshistory() {
    const { id } = useParams();

    // Add this fetch function
    const fetchCategories = async () => {
      const res = await userRequest.get(`/payments/customer/${id}/transactions`);
      return res.data.data.transactions || [];
    };

      const { data: transactionss = [], isLoading: isCategoriesLoading } =
        useQuery(["customer-transactions"], fetchCategories);


    return (
        <div>
            <Card>
                <h3 className="text-lg font-bold mx-3 my-4">Transaction History</h3>
                <CardBody>
                    <Table aria-label="Customer Transaction History">
                        <TableHeader>
                            <TableColumn>Type</TableColumn>
                            <TableColumn>Reference</TableColumn>
                            <TableColumn>Date</TableColumn>
                            <TableColumn>Payment Method</TableColumn>
                            <TableColumn>Amount</TableColumn>
                            {/* <TableColumn>Status</TableColumn>
                            <TableColumn>Balance After</TableColumn> */}
                            <TableColumn>Remaining Balance</TableColumn>
                            <TableColumn>Notes</TableColumn>
                        </TableHeader>
                        <TableBody  isLoading={isCategoriesLoading}
                                  loadingContent={
                                    <div className="flex justify-center items-center py-8">
                                      <Spinner color="success" size="lg" />
                                    </div>
                                  }
                                  emptyContent={
                                    <div className="text-center text-gray-500 py-8">
                                      No Transaction found
                                    </div>
                                  }>
                            {transactionss.map((transaction, index) => (
                                <TableRow key={index}>
                                    <TableCell>{transaction.type}</TableCell>
                                    <TableCell>{transaction.reference}</TableCell>
                                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{transaction.paymentMethod}</TableCell>
                                    <TableCell>{transaction.amount}</TableCell>
                                    {/* <TableCell>
                                        <Chip
                                            size="sm"
                                            color={transaction.status === 'overdue' ? 'danger' : transaction.status === 'paid' ? 'success' : 'warning'}
                                            variant="flat"
                                        >
                                            {transaction.status}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>{transaction.balanceAfter}</TableCell> */}
                                    <TableCell>{transaction.remainingBalance}</TableCell>
                                    <TableCell>{transaction.notes}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    );
}

export default Transactionshistory;