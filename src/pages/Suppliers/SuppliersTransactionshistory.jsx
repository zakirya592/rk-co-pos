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
    
    const fetchSupplierData = async () => {
        const response = await userRequest.get(`supplier-journey/${id}`);
        return response.data || {};
    };

    const fetchSupplierPayments = async () => {
        const response = await userRequest.get(`supplier-journey/${id}/payments`);
        return response.data || {};
    };

    const { data: supplierData = {}, isLoading: isDataLoading } = useQuery(
        ["supplier-data", id],
        fetchSupplierData
    );

    const { data: paymentData = {}, isLoading: isPaymentLoading } = useQuery(
        ["supplier-payments", id],
        fetchSupplierPayments
    );

    console.log(supplierData, "supplier data");
    console.log(paymentData, "payment data");


    return (
      <div>
        {/* Supplier Summary */}
        <Card className="mb-6">
          <h3 className="text-lg font-bold mx-3 my-4">Supplier Summary</h3>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {supplierData?.summary?.productCount || "0"}
                </div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {supplierData?.summary?.totalQuantity || "0"}
                </div>
                <div className="text-sm text-gray-600">Total Quantity</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {supplierData?.summary?.totalAmount?.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-gray-600">Total Amount</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {supplierData?.summary?.soldQuantity || "0"}
                </div>
                <div className="text-sm text-gray-600">Sold Quantity</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {supplierData?.summary?.soldAmount?.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-gray-600">Sold Amount</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">
                  {supplierData?.summary?.paidAmount?.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-gray-600">Paid Amount</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {supplierData?.summary?.remainingBalance?.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-gray-600">Remaining Balance</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Payment Summary */}
        <Card className="mb-6">
          <h3 className="text-lg font-bold mx-3 my-4">Payment Summary</h3>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {paymentData?.totalPayments?.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-gray-600">Total Payments</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {paymentData?.paymentsByStatus?.completed?.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-gray-600">Completed Payments</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {(paymentData?.paymentsByStatus?.pending || 0) + (paymentData?.paymentsByStatus?.partial || 0)}
                </div>
                <div className="text-sm text-gray-600">Pending/Partial Payments</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <h3 className="text-lg font-bold mx-3 my-4">Product Details</h3>
          <CardBody>
            <Table aria-label="Supplier Product Details">
              <TableHeader>
                <TableColumn>#</TableColumn>
                <TableColumn>PRODUCT NAME</TableColumn>
                <TableColumn>CATEGORY</TableColumn>
                <TableColumn>AVAILABLE QUANTITY</TableColumn>
                <TableColumn>SOLD QUANTITY</TableColumn>
                <TableColumn>PURCHASE RATE</TableColumn>
                <TableColumn>TOTAL VALUE</TableColumn>
                <TableColumn>SOLD VALUE</TableColumn>
                <TableColumn>PACKING UNIT</TableColumn>
              </TableHeader>
              <TableBody
                isLoading={isDataLoading}
                loadingContent={
                  <div className="flex justify-center items-center py-8">
                    <Spinner color="success" size="lg" />
                  </div>
                }
                emptyContent={
                  <div className="text-center text-gray-500 py-8">
                    No products found
                  </div>
                }
              >
                {(supplierData?.products || []).map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <span className="font-semibold">{product?.name || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" color="primary" variant="flat">
                        {product?.category || "—"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{product?.availableQuantity || "0"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-green-600">{product?.soldQuantity || "0"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{product?.purchaseRate || "0"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-blue-600">
                        {product?.totalValue?.toLocaleString() || "0"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {product?.soldValue?.toLocaleString() || "0"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {product?.packingUnit || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

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
                <TableColumn>PAID AMOUNT</TableColumn>
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
                        {payment?.paidAmount?.toLocaleString() || "0"}
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
