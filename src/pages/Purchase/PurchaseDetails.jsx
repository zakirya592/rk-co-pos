import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Divider,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@nextui-org/react';
import { FaArrowLeft, FaPrint, FaDownload, FaEdit } from 'react-icons/fa';
import userRequest from '../../utils/userRequest';

const PurchaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        const response = await userRequest.get(`/purchases/${id}`);
        if (response.data.status === 'success') {
          setPurchase(response.data.data);
        } else {
          throw new Error('Failed to load purchase data');
        }
      } catch (err) {
        setError('Failed to fetch purchase details');
        console.error('Error fetching purchase:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchase();
  }, [id]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-danger">
        {error}
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="p-4 text-center">
        Purchase not found
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="flat"
          startContent={<FaArrowLeft />}
          onPress={() => navigate(-1)}
        >
          Back to Purchases
        </Button>
        <div className="flex gap-2">
          <Button
            variant="flat"
            onPress={() => navigate('/Navigation')}
          >
            Dashboard
          </Button>
          {/* <Button color="primary" startContent={<FaPrint />}>
            Print
          </Button>
          <Button color="secondary" startContent={<FaDownload />}>
            Download
          </Button> */}
          <Button
            color="warning"
            startContent={<FaEdit />}
            onPress={() => navigate(`/purchases/edit/${purchase._id}`)}
          >
            Edit
            </Button>
        </div>
          </div>

      <Card className="mb-6">
        <CardHeader className="flex justify-between items-center">
              <div className="flex flex-col md:flex-row md:items-center justify-between w-full">
                <div>
                  <h2 className="text-2xl font-bold">
                    Purchase #{purchase.invoiceNumber || purchase._id}
                  </h2>
                  <p className="text-sm text-default-500">
                    ID: {purchase._id}
                  </p>
                  {purchase.referCode && (
                    <p className="text-sm font-semibold text-blue-600">
                      Refer Code: {purchase.referCode}
                    </p>
                  )}
                </div>
                <Chip
                  color={getStatusColor(purchase.status)}
                  variant="flat"
                  size="lg"
                  className="mt-2 md:mt-0"
                >
                  {purchase.status?.toUpperCase() || "N/A"}
                </Chip>
              </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Supplier Information</h3>
              <div className="space-y-1">
                <p className="font-medium text-default-800">
                  {purchase.supplier?.name || "N/A"}
                </p>
                {purchase.supplier?.email && (
                  <p className="text-default-600 text-sm">
                    {purchase.supplier.email}
                  </p>
                )}
                {purchase.supplier?.phone && (
                  <p className="text-default-500 text-sm">
                    {purchase.supplier.phone}
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Warehouse</h3>
              <div className="space-y-1">
                <p className="font-medium text-default-800">
                  {purchase.warehouse?.name || "N/A"}
                </p>
                {purchase.warehouse?.code && (
                  <p className="text-default-500 text-sm">
                    Code: {purchase.warehouse.code}
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Purchase Details</h3>
              <div className="space-y-2">
                {purchase.referCode && (
                  <div>
                    <p className="text-sm text-default-500">Refer Code</p>
                    <p className="text-default-800 font-semibold text-blue-600">
                      {purchase.referCode}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-default-500">Purchase Date</p>
                  <p className="text-default-800">
                    {new Date(purchase.purchaseDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Status</p>
                  <Chip 
                    color={getStatusColor(purchase.status)}
                    size="sm"
                    variant="flat"
                  >
                    {purchase.status?.toUpperCase() || "N/A"}
                  </Chip>
                </div>
                <div>
                  <p className="text-sm text-default-500">Currency</p>
                  <p className="text-default-800">
                    {purchase.currency?.name} ({purchase.currency?.symbol})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-default-500">Exchange Rate</p>
                  <p className="text-default-800">{purchase.currencyExchangeRate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-4">Items</h3>
            <Table aria-label="Purchase items" isStriped>
              <TableHeader>
                <TableColumn>PRODUCT</TableColumn>
                <TableColumn>QUANTITY</TableColumn>
                <TableColumn>RATE</TableColumn>
                <TableColumn>RETAIL</TableColumn>
                <TableColumn>WHOLESALE</TableColumn>
                <TableColumn>TOTAL</TableColumn>
              </TableHeader>
              <TableBody>
                {purchase.items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {item.product?.name || "N/A"}
                        </p>
                        {item.product?._id && (
                          <p className="text-default-500 text-xs">
                            ID: {item.product._id}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.quantity || 0}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{purchase.currency?.symbol || "Rs"}{item.purchaseRate?.toLocaleString() || "0.00"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {purchase.currency?.symbol || "Rs"}{item.retailRate?.toLocaleString() || "0.00"}
                    </TableCell>
                    <TableCell>
                      {purchase.currency?.symbol || "Rs"}{item.wholesaleRate?.toLocaleString() || "0.00"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {purchase.currency?.symbol || "Rs"}{item.itemTotal?.toLocaleString() || "0.00"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-8 flex justify-end">
            <div className="w-full md:w-1/3 space-y-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-default-600">Total Quantity:</span>
                  <span className="font-medium">
                    {purchase.totalQuantity || 0} items
                  </span>
                </div>
                <Divider className="my-1" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-primary">
                    {purchase.currency?.symbol || "Rs"}
                    {purchase.totalAmount?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
        <CardFooter>
          <div className="w-full">
            {purchase.notes && (
              <div className="mt-4">
                <h4 className="font-semibold mb-1">Notes</h4>
                <p className="text-default-600">{purchase.notes}</p>
              </div>
            )}
            <div className="mt-4 text-sm text-default-500">
              <div className="space-y-1 flex justify-between">
                <div>
                  <p className="text-xs text-default-500">Created</p>
                  <p className="text-sm">
                    {new Date(purchase.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {purchase.updatedAt && (
                  <div>
                    <p className="text-xs text-default-500">Last Updated</p>
                    <p className="text-sm">
                      {new Date(purchase.updatedAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PurchaseDetails;
