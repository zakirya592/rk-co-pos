
import React, { useState } from 'react';
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
  Spinner,
  Tooltip
} from '@nextui-org/react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaPhone, } from 'react-icons/fa';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import CustomerDetails from './CustomerDetails';
import userRequest from '../../utils/userRequest';
import { TbListDetails } from 'react-icons/tb';

const fetchCustomers = async (search = '', page = 1) => {
  const normalized = (search || '').trim();
  const normalizedRef = normalized.toUpperCase(); // backend codes look like CM-0001
  const query = new URLSearchParams({
    search: normalized,
    referCode: normalizedRef, // send referCode explicitly so backend can filter by code
    page: String(page),
  });

  const res = await userRequest.get(`/customers?${query.toString()}`);
  return res.data;
};

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const navigate = useNavigate();

  const {
    data: customersData = [],
    isLoading,
    refetch,
  } = useQuery(["customers", searchTerm, currentPage], () =>
    fetchCustomers(searchTerm, currentPage)
  );

  const customers = customersData?.data || [];
  const totalPages = customersData?.totalPages || 1;



  const handleDeleteCustomer = (Customer) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover this ${Customer?.name || ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userRequest.delete(`/customers/${Customer?._id || ""}`);
          toast.success("The Customer has been deleted.");
          refetch();
        } catch (error) {
          toast.error(
            error?.response?.data?.message || "Failed to delete the Customer."
          );
        }
      }
    });
  };

  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  // Sample purchase history for demo
  const purchaseHistory = [
    {
      id: 1,
      date: "2024-01-20",
      items: "Laptop, Mouse",
      amount: 87000,
      payment: "partial",
    },
    {
      id: 2,
      date: "2024-01-15",
      items: "Chair, Desk",
      amount: 25000,
      payment: "paid",
    },
    {
      id: 3,
      date: "2024-01-10",
      items: "Phone Case",
      amount: 1500,
      payment: "paid",
    },
  ];

  return (
    <div className="p-1 sm:p-1 md:p-6 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between flex-col md:flex-row sm:flex-col lg:flex-row">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
          <p className="text-gray-600">
            Manage customer information and purchase history
          </p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-3 md:mt-0 lg:mt-0">
          <Button
            variant="flat"
            onPress={() => navigate('/Navigation')}
          >
            Dashboard
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
            startContent={<FaPlus />}
            onPress={() => navigate("/customers/add")}
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <Input
            placeholder="Search customers by name, contact, or refer code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<FaSearch className="text-gray-400" />}
            variant="bordered"
          />
        </CardBody>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardBody>
          <Table aria-label="Customers table">
            <TableHeader>
              <TableColumn>Sl No</TableColumn>
              <TableColumn>CUSTOMER</TableColumn>
              <TableColumn>REFER CODE</TableColumn>
              <TableColumn>CONTACT</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>MANAGER</TableColumn>
              <TableColumn>CNIC</TableColumn>
              <TableColumn>ADDRESS</TableColumn>
              <TableColumn>DELIVERY ADDRESS</TableColumn>
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
                  No Customer found
                </div>
              }
            >
              {customers.map((customer, index) => (
                <TableRow key={customer._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold">{customer.name}</div>
                      <div className="text-sm text-gray-500">
                        {customer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.referCode || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-400" />
                      {customer.phoneNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={
                        customer.customerType === "wholesale"
                          ? "secondary"
                          : "primary"
                      }
                    >
                      {customer.customerType}
                    </Chip>
                  </TableCell>

                  <TableCell>{customer.manager}</TableCell>
                  <TableCell>{customer.cnicNumber}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.deliveryAddress}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                        onPress={() => viewCustomerDetails(customer)}
                      >
                        <FaEye />
                      </Button> */}
                      <Tooltip content="View Details">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="primary"
                          onPress={() => navigate(`/customers/${customer._id}`)}
                        >
                          <TbListDetails />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Edit">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="warning"
                          onPress={() =>
                            navigate(`/customers/edit/${customer._id}`)
                          }
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
                          onPress={() => handleDeleteCustomer(customer)}
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
        </CardBody>
      </Card>

      {/* Customer Details Modal */}
      <CustomerDetails
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        customer={selectedCustomer}
        purchaseHistory={purchaseHistory}
      />
    </div>
  );
};

export default Customers;
