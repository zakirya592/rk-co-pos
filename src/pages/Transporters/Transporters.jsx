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

const fetchTransporters = async ({ queryKey }) => {
  const [_, page] = queryKey;
  const res = await userRequest.get(`/transporters?page=${page || 1}`);
  return res.data;
};

const Transporters = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [totalPages, setTotalPages] = useState(1);
  const [totalTransporters, setTotalTransporters] = useState(0);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["transporters", page],
    queryFn: fetchTransporters,
    onSuccess: (data) => {
      setTotalPages(data.pages);
      setTotalTransporters(data.total);
    },
  });

  const transporters = response?.data || [];

  const filteredItems = useMemo(() => {
    if (!Array.isArray(transporters)) return [];
    return transporters.filter(
      (transporter) =>
        transporter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transporter.email && transporter.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (transporter.contactPerson && transporter.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [transporters, searchTerm]);

  const handleDeleteTransporter = (transporter) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover ${transporter?.name || "this transporter"}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userRequest.delete(`/transporters/${transporter?._id || ""}`);
          refetch();
          toast.success("The transporter has been deleted.");
        } catch (error) {
          toast.error(
            error?.response?.data?.message || "Failed to delete the transporter."
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
            Total: {totalTransporters} Transporter{totalTransporters !== 1 ? 's' : ''}
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
    [totalTransporters, page, totalPages]
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Transporters Management</h1>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
          startContent={<FaPlus />}
          onPress={() => navigate("/add-transporter")}
        >
          Add Transporter
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <Input
            placeholder="Search transporters by name, email or contact person..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<FaSearch className="text-gray-400" />}
            variant="bordered"
          />
        </CardBody>
      </Card>

      <Table aria-label="Transporters table" bottomContent={bottomContent} bottomContentPlacement='outside'>
        <TableHeader>
          <TableColumn>S.No</TableColumn>
          <TableColumn>NAME</TableColumn>
          <TableColumn>CONTACT PERSON</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>PHONE</TableColumn>
          <TableColumn>ADDRESS</TableColumn>
          <TableColumn>CITY</TableColumn>
          <TableColumn>COUNTRY</TableColumn>
          <TableColumn>VEHICLE TYPES</TableColumn>
          <TableColumn>COMMISSION RATE</TableColumn>
          <TableColumn>RATING</TableColumn>
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
            <div className="text-center text-gray-500 py-8">No transporters found</div>
          }
        >
          {filteredItems.map((transporter, index) => (
            <TableRow key={transporter._id}>
              <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
              <TableCell className='text-nowrap'>
                <div className="font-semibold whitespace-nowrap">
                  {transporter?.name || ""}
                </div>
              </TableCell>
              <TableCell className='text-nowrap'>{transporter?.contactPerson || "-"}</TableCell>
              <TableCell className='text-nowrap'>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {transporter?.email || "-"}
                </div>
              </TableCell>
              <TableCell className='text-nowrap'>{transporter?.phoneNumber || "-"}</TableCell>
              <TableCell className="max-w-[150px] truncate text-nowrap" title={transporter?.address || ''}>
                {transporter?.address || "-"}
              </TableCell>
              <TableCell className='text-nowrap'>{transporter?.city || "-"}</TableCell>
              <TableCell>{transporter?.country || "-"}</TableCell>
              <TableCell>
                <div className="flex flex-nowrap gap-1 max-w-[300px] text-nowrap">
                  {transporter?.vehicleTypes?.map((type, i) => (
                    <Chip key={i} size="sm" color="primary" variant="flat" className="mb-1">
                      {type}
                    </Chip>
                  )) || "-"}
                </div>
              </TableCell>
              <TableCell className='text-nowrap'>{transporter?.commissionRate ? `${transporter.commissionRate}%` : "-"}</TableCell>
              <TableCell className='text-nowrap'>
                <div className="flex items-center text-nowrap">
                  {Array(5).fill(0).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < (transporter?.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Chip color={transporter?.isActive ? "success" : "danger"} variant="flat">
                  {transporter?.isActive ? "Active" : "Inactive"}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Tooltip content="View Details">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => navigate(`/transporter-details/${transporter._id}`)}
                    >
                      <FaEye className="text-blue-500" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Edit">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => navigate(`/update-transporter/${transporter._id}`)}
                    >
                      <FaEdit className="text-yellow-500" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Delete">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleDeleteTransporter(transporter)}
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
  );
};

export default Transporters;
