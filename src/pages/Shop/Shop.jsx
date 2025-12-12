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

const fetchShops = async ({ queryKey }) => {
  const [_, page] = queryKey;
  const res = await userRequest.get(`/shops?page=${page || 1}`);
  return res.data;
};

const Shop = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [totalPages, setTotalPages] = useState(1);
  const [totalShops, setTotalShops] = useState(0);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["shops", page],
    queryFn: fetchShops,
    onSuccess: (data) => {
      setTotalPages(data.totalPages);
      setTotalShops(data.totalShops);
    },
  });

  const shops = response?.data || [];

  const filteredItems = useMemo(() => {
    if (!Array.isArray(shops)) return [];
    return shops.filter(
      (shop) =>
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shop.email && shop.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (shop.referCode && shop.referCode.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [shops, searchTerm]);

  const handleDeleteShop = (shop) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover this ${shop?.name || ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userRequest.delete(`/shops/${shop?._id || ""}`);
          refetch();
          toast.success("The shop has been deleted.");
        } catch (error) {
          toast.error(
            error?.response?.data?.message || "Failed to delete the shop."
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
            Total: {totalShops} Shop{totalShops !== 1 ? 's' : ''}
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
    [totalShops, page, totalPages]
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Shop Management</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="flat"
            onPress={() => navigate('/Navigation')}
          >
            Dashboard
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
            startContent={<FaPlus />}
            onPress={() => navigate("/add-shop")}
          >
            Add Shop
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <Input
            placeholder="Search shops by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<FaSearch className="text-gray-400" />}
            variant="bordered"
          />
        </CardBody>
      </Card>

      <Table aria-label="Shops table" bottomContent={bottomContent} bottomContentPlacement='outside'>
        <TableHeader>
          <TableColumn>S.No</TableColumn>
          <TableColumn>NAME</TableColumn>
          <TableColumn>REFER CODE</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>CODE</TableColumn>
          <TableColumn>SHOP TYPE</TableColumn>
          <TableColumn>OPENING HOURS</TableColumn>
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
            <div className="text-center text-gray-500 py-8">No Shop found</div>
          }
        >
          {filteredItems.map((shop, index) => (
            <TableRow key={shop._id}>
              <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
              <TableCell>
                <div className="font-semibold whitespace-nowrap">
                  {shop?.name || ""}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-semibold text-blue-600 whitespace-nowrap">
                  {shop?.referCode || "N/A"}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {shop?.email || ""}
                </div>
              </TableCell>
              <TableCell>
                <Chip
                  size="sm"
                  color={shop.role === "admin" ? "secondary" : "primary"}
                >
                  {shop?.code || ""}
                </Chip>
              </TableCell>
              <TableCell>
                <Chip
                  size="sm"
                  color={shop.shopType === "retail" ? "secondary" : "primary"}
                >
                  {shop?.shopType || ""}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {shop?.openingHours || ""}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {shop?.location?.country || ""}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {shop?.location?.state || ""}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {shop?.location?.city || ""}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {shop?.phoneNumber || ""}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {shop?.contactPerson || ""}
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
                      onPress={() => navigate(`/ShopDetails/shop/${shop._id}`)}
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
                        navigate(`/update-shop/${shop?._id}`);
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
                        handleDeleteShop(shop);
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

export default Shop;
