import React, { useMemo, useState } from 'react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Pagination,
  Spinner,
  Tooltip,
} from "@nextui-org/react";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Select, SelectItem } from "@nextui-org/react";
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import userRequest from '../../utils/userRequest';
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const fetchPurchases = async (key, searchTerm, currentPage) => {
  const res = await userRequest.get("/purchases", {
    params: {
      search: searchTerm,
      page: currentPage,
    },
  });
  return {
    purchases: res.data.data || [],
    total: res.data.totalPurchases || 0,
    totalPages: res.data.totalPages || 1,
    currentPage: res.data.currentPage || 1,
  };
};

const Purchases = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery(
    ["purchases", searchTerm, currentPage],
    () => fetchPurchases("purchases", searchTerm, currentPage),
    { keepPreviousData: true }
  );

  const purchases = data?.purchases || [];
  const totalPurchases = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // Calculate total payments by payment method
  const paymentMethodTotals = useMemo(() => {
    const totals = {};
    purchases.forEach(purchase => {
      const method = purchase.paymentMethod || 'unknown';
      const amount = purchase.totalAmount || 0;
      totals[method] = (totals[method] || 0) + amount;
    });
    return totals;
  }, [purchases]);
  
  // Format payment method for display
  const formatPaymentMethod = (method) => {
    if (!method) return 'Unknown';
    return method.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePurchase = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: isDeleting ? 'Deleting...' : 'Yes, delete it!',
      cancelButtonText: "No, cancel!",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          setIsDeleting(true);
          await userRequest.delete(`/purchases/${id}`);
          await queryClient.invalidateQueries("purchases");
        //   toast.success("Purchase deleted successfully!");
        } catch (error) {
          toast.error("Failed to delete purchase.");
          throw error;
        } finally {
          setIsDeleting(false);
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed && !isDeleting) {
        toast.success(
          "Purchase deleted successfully"
        );
        refetch();
      }
    });
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const bottomContent = useMemo(
    () => (
      <div className="flex justify-between items-center mt-4">
        <span className="text-small text-default-400">
          Total: {totalPurchases} {totalPurchases === 1 ? 'purchase' : 'purchases'}
        </span>
        <div className="flex items-center gap-4">
          <Pagination
            isCompact
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            showControls
            showShadow
            color="primary"
            classNames={{
              wrapper: "gap-1",
              item: "bg-transparent text-gray-700 hover:bg-green-50",
              cursor: "bg-green-600 text-white font-medium",
            }}
          />
          <label className="flex items-center gap-2 text-default-400 text-small">
            Rows per page:
            <Select
              className="w-20"
              selectedKeys={[String(rowsPerPage)]}
              onSelectionChange={(keys) => {
                const value = Number(Array.from(keys)[0]);
                setRowsPerPage(value);
                setCurrentPage(1);
              }}
              variant="bordered"
              size="sm"
            >
              <SelectItem key="5" value="5">
                5
              </SelectItem>
              <SelectItem key="10" value="10">
                10
              </SelectItem>
              <SelectItem key="15" value="15">
                15
              </SelectItem>
            </Select>
          </label>
        </div>
      </div>
    ),
    [totalPages, currentPage, rowsPerPage, totalPurchases]
  );

  

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold mb-4 my-auto">Purchases</h1>
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(paymentMethodTotals).map(([method, total]) => (
              <Card key={method} className="border border-gray-200">
                <CardBody className="p-4">
                  <p className="text-sm text-gray-500">
                    {formatPaymentMethod(method)}
                  </p>
                  <p className="text-lg font-semibold">
                    {purchases[0]?.currency?.symbol || "$"}
                    {total?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
        <div className="flex items-start my-auto">
          <Button
            color="primary"
            startContent={<FaPlus />}
            onPress={() => navigate("/purchases/new")}
            className="mt-6"
          >
            Add New Purchase
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex gap-4 items-center">
          <Input
            placeholder="Search purchases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<FaSearch className="text-gray-400" />}
            className="max-w-xs"
            variant="bordered"
          />
        </div>
      </div>

      <div className="">
        <Table
          aria-label="Purchases table"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
        >
          <TableHeader>
            <TableColumn>INVOICE #</TableColumn>
            <TableColumn>DATE</TableColumn>
            <TableColumn>SUPPLIER</TableColumn>
            <TableColumn>WAREHOUSE</TableColumn>
            <TableColumn>PRODUCTS</TableColumn>
            <TableColumn>QUANTITY</TableColumn>
            <TableColumn>PURCHASE RATE</TableColumn>
            <TableColumn>RETAIL RATE</TableColumn>
            <TableColumn>WHOLESALE RATE</TableColumn>
            <TableColumn>TOTAL AMOUNT</TableColumn>
            <TableColumn>CURRENCY</TableColumn>
            <TableColumn>PAYMENT METHOD</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={isLoading}
            loadingContent={
              <div className="flex justify-center items-center py-8">
                <Spinner color="success" size="lg" />
              </div>
            }
            emptyContent={
              <div className="text-center text-gray-500 py-8">
                No Purchases found
              </div>
            }
          >
            {purchases.map((purchase) => (
              <TableRow key={purchase._id}>
                <TableCell>
                  <div className="font-medium">{purchase.invoiceNumber || "N/A"}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{formatDate(purchase.purchaseDate)}</div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{purchase.supplier?.name || "N/A"}</div>
                    {purchase.supplier?.email && (
                      <div className="text-xs text-gray-500">{purchase.supplier.email}</div>
                    )}
                    {purchase.supplier?.phoneNumber && (
                      <div className="text-xs text-gray-500">{purchase.supplier.phoneNumber}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{purchase.warehouse?.name || "N/A"}</div>
                    {purchase.warehouse?.code && (
                      <div className="text-xs text-gray-500">Code: {purchase.warehouse.code}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    {purchase.items?.map((item, index) => (
                      <div key={index} className="text-sm mb-1">
                        {item.product?.name || "Unknown Product"}
                      </div>
                    )) || "No items"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    {purchase.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {purchase.currency?.symbol || "$"}
                    {purchase.items?.[0]?.purchaseRate?.toFixed(2) || "N/A"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {purchase.currency?.symbol || "$"}
                    {purchase.items?.[0]?.retailRate?.toFixed(2) || "N/A"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {purchase.currency?.symbol || "$"}
                    {purchase.items?.[0]?.wholesaleRate?.toFixed(2) || "N/A"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {purchase.currency?.symbol || "$"}
                    {purchase.totalAmount?.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{purchase.currency?.code || "N/A"}</div>
                    {purchase.currencyExchangeRate && (
                      <div className="text-xs text-gray-500">
                        Rate: {purchase.currencyExchangeRate}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Chip color="primary" variant="flat">
                    {purchase.paymentMethod
                      ? purchase.paymentMethod.replace(/_/g, " ").toUpperCase()
                      : "N/A"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Chip color={getStatusColor(purchase.status)} variant="flat">
                    {purchase.status?.toUpperCase() || "N/A"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Tooltip content="View Details">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onClick={() =>
                          navigate(`/purchases/Details/${purchase._id}`)
                        }
                      >
                        <FaEye className="text-blue-500" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Edit">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onClick={() =>
                          navigate(`/purchases/edit/${purchase._id}`)
                        }
                      >
                        <FaEdit className="text-yellow-500" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Delete">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onClick={() => handleDeletePurchase(purchase._id)}
                      >
                        <FaTrash className="text-red-500" />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Purchases;