import React, { useMemo, useState, useEffect } from "react";
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Spinner,
  Pagination,
  Card,
  CardBody,
  Input,
} from "@nextui-org/react";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { useQuery } from "react-query";
import userRequest from "../../utils/userRequest";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const fetchShips = async ({ queryKey }) => {
  const [_, page] = queryKey;
  const res = await userRequest.get(`/shipments`);
  return res.data;
};

const Shipment = () => {
  const navigate = useNavigate();
  const [isShipsLoading, setisShipsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const [totalPages, setTotalPages] = useState(1);
  const [totalShips, setTotalShips] = useState(0);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["ships", page],
    queryFn: fetchShips,
    onSuccess: (data) => {
      setTotalPages(data.totalPages);
      setTotalShips(data.total);
    },
  });

  const ships = response?.data || [];

  const bottomContent = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-small text-default-400">
            Total: {totalShips} shipment{totalShips !== 1 ? "s" : ""}
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
    [totalShips, page, totalPages]
  );

  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchData = async () => {
    setisShipsLoading(true);
    try {
      const response = await userRequest.get('/shipments');
      const result = response.data;
      if (result.status === 'success') {
        setShipments(result.data);
      }
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast.error('Failed to load shipments');
    } finally {
      setisShipsLoading(false);
    }
  };

  // Filter shipments based on search term
  const filteredShipments = useMemo(() => {
    if (!searchTerm.trim()) return shipments;
    
    const term = searchTerm.toLowerCase().trim();
    return shipments.filter(shipment => 
      (shipment.shipmentId && shipment.shipmentId.toString().toLowerCase().includes(term)) ||
      (shipment.trackingNumber && shipment.trackingNumber.toString().toLowerCase().includes(term))
    );
  }, [shipments, searchTerm]);

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleDeleteShip = (shipment) => {

    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover this ${shipment?.batchNo || ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setisShipsLoading(true)
        try {
          await userRequest.delete(`/shipments/${shipment?._id || ""}`);
          refetch();
          fetchData()
          setShipments(shipments.filter((ship) => ship._id !== shipment._id));
          setisShipsLoading(false)
          toast.success("The shipment has been deleted.");
        } catch (error) {
          toast.error(
            error?.response?.data?.message || "Failed to delete the shipment."
          );
        }
      }
    });
  };
  // Function to get status badge styling
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Shipments Management
            </h1>
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
              onPress={() => navigate("/shipments/add")}
            >
              Add Shipment
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardBody>
          <Input
            placeholder="Search by Shipment ID or Tracking #"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<FaSearch className="text-gray-400" />}
            variant="bordered"
          />
        </CardBody>
        {searchTerm && (
          <div className="text-sm text-gray-600 ms-5 mb-2">
            Found {filteredShipments.length} shipment
            {filteredShipments.length !== 1 ? "s" : ""} matching "{searchTerm}"
          </div>
        )}
      </Card>

      <Table
        aria-label="Ships table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
      >
        <TableHeader>
          <TableColumn>Shipment ID</TableColumn>
          <TableColumn>Batch No</TableColumn>
          <TableColumn>Origin</TableColumn>
          <TableColumn>Destination</TableColumn>
          <TableColumn>Warehouse</TableColumn>
          <TableColumn>Supplier</TableColumn>
          <TableColumn>Transporter</TableColumn>
          <TableColumn>Products</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Shipment Date</TableColumn>
          <TableColumn>Estimated Arrival</TableColumn>
          <TableColumn>Tracking Number</TableColumn>
          <TableColumn>Total Weight</TableColumn>
          <TableColumn>Currency</TableColumn>
          <TableColumn>Notes</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={isShipsLoading}
          loadingContent={
            <div className="flex justify-center items-center py-8">
              <Spinner color="success" size="lg" />
            </div>
          }
          emptyContent={
            <div className="text-center text-gray-500 py-8">
              No shipment found
            </div>
          }
        >
          {filteredShipments.map((shipment, index) => (
            <TableRow key={shipment._id} className="text-nowrap">
              <TableCell className="text-nowrap">
                {shipment.shipmentId}
              </TableCell>
              <TableCell className="text-nowrap">{shipment.batchNo}</TableCell>
              <TableCell className="text-nowrap">
                {`${shipment.origin.country}`}
              </TableCell>
              <TableCell className="text-nowrap">
                {`${shipment.destination.country}`}
              </TableCell>
              <TableCell className="text-nowrap">
                {shipment.destination.warehouse?.name}
              </TableCell>
              <TableCell className="text-nowrap">
                {shipment.supplier?.name}
              </TableCell>
              <TableCell className="text-nowrap">
                {shipment.transporter?.name}
              </TableCell>
              <TableCell className="text-nowrap">
                {shipment.products.map((item) => (
                  <div key={item._id}>
                    {item.product.name} - Qty: {item.quantity} - Unit Price:{" "}
                    {item.unitPrice}
                  </div>
                ))}
              </TableCell>
              <TableCell className="text-nowrap">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(
                    shipment.status
                  )}`}
                >
                  {shipment.status
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </TableCell>
              <TableCell className="text-nowrap">
                {new Date(shipment.shipmentDate).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-nowrap">
                {new Date(shipment.estimatedArrival).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-nowrap">
                {shipment.trackingNumber}
              </TableCell>
              <TableCell className="text-nowrap">
                {shipment.totalWeight}
              </TableCell>
              <TableCell className="text-nowrap">
                {shipment.currency?.code}
              </TableCell>
              <TableCell className="text-nowrap">{shipment.notes}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Tooltip content="Edit Shipment" placement="top">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="warning"
                      onPress={() =>
                        navigate(`/shipments/update/${shipment._id}`)
                      }
                    >
                      <FaEdit />
                    </Button>
                  </Tooltip>

                  <Tooltip content="Delete Shipment" placement="top">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDeleteShip(shipment)}
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

export default Shipment;
