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
  Tooltip,
  Spinner,
  Pagination,
} from '@nextui-org/react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useQuery } from 'react-query';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Link, useNavigate } from "react-router-dom";
import { TbListDetails } from 'react-icons/tb';

const fetchUsers = async ({ queryKey }) => {
  const [_, page] = queryKey;
  const res = await userRequest.get(`/warehouses?page=${page || 1}`);
  return res.data;
};

const Warehouse = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [totalPages, setTotalPages] = useState(1);
  const [totalWarehouses, setTotalWarehouses] = useState(0);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["warehouses", page],
    queryFn: fetchUsers,
    onSuccess: (data) => {
      setTotalPages(data.totalPages);
      setTotalWarehouses(data.totalWarehouses);
    },
  });

  const warehouses = response?.data || [];

  const filteredItems = useMemo(() => {
    if (!Array.isArray(warehouses)) return [];
    return warehouses.filter(
      (warehouse) =>
        warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (warehouse.email && warehouse.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [warehouses, searchTerm]);

  const handleDeleteProduct = (user) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover this ${user?.name || ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userRequest.delete(`/warehouses/${user?._id || ""}`);
          toast.success("The Warehouse has been deleted.");
          refetch();
        } catch (error) {
          toast.error(
            error?.response?.data?.message || "Failed to delete the Warehouse."
          );
        }
      }
    });
  };

  const bottomContent = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-small text-default-400">
            Total: {totalWarehouses} Warehouse{totalWarehouses !== 1 ? 's' : ''}
          </span>
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={page}
            total={totalPages}
            onChange={setPage}
            classNames={{
              cursor: "bg-navy-700 text-black",
            }}
          />

        </div>
      </div>
    ),
    [totalWarehouses, page, totalPages]
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Warehouse Management
          </h1>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
          startContent={<FaPlus />}
          onPress={() => navigate("/add-warehouse")}
        >
          Add Warehouse
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<FaSearch className="text-gray-400" />}
            variant="bordered"
          />
        </CardBody>
      </Card>

      <Table
        aria-label="Warehouse table"
        bottomContentPlacement="outside"
        bottomContent={bottomContent}
        // className="w-full overflow-x-scroll"
      >
        <TableHeader>
          <TableColumn>S.No</TableColumn>
          <TableColumn>NAME</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>CODE</TableColumn>
          <TableColumn>BRANCH</TableColumn>
          <TableColumn>COUNTRY</TableColumn>
          <TableColumn>STATE</TableColumn>
          <TableColumn>CITY</TableColumn>
          <TableColumn>PHONE NUMBER</TableColumn>
          <TableColumn>PERSON</TableColumn>
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
              No Warehouse found
            </div>
          }
        >
          {filteredItems.map((warehouse, index) => (
            <TableRow key={warehouse._id}>
              <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
              <TableCell>
                <div className="font-semibold whitespace-nowrap">
                  {warehouse?.name || ""}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-500">
                  {warehouse?.email || ""}
                </div>
              </TableCell>
              <TableCell>
                <Chip
                  size="sm"
                  color={warehouse.role === "admin" ? "secondary" : "primary"}
                >
                  {warehouse?.code || ""}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {warehouse?.branch || ""}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {warehouse?.country || ""}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {warehouse?.state || ""}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {warehouse?.city || ""}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {warehouse?.phoneNumber || ""}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {warehouse?.contactPerson || ""}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Tooltip content="View Details">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="primary"
                      onPress={() =>
                        navigate(`/warehousedetails/warehouse/${warehouse._id}`)
                      }
                    >
                      <TbListDetails />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Update">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="warning"
                      onPress={() => {
                        navigate(`/update-warehouse/${warehouse?._id}`);
                      }}
                    >
                      <FaEdit />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Delete">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => {
                        handleDeleteProduct(warehouse);
                      }}
                    >
                      <FaTrash />
                    </Button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Warehouse;