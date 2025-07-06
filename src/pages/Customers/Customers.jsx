
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
  Spinner
} from '@nextui-org/react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye,  FaPhone, } from 'react-icons/fa';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import AddCustomer from './AddCustomer';
import UpdateCustomer from './UpdateCustomer';
import CustomerDetails from './CustomerDetails';
import userRequest from '../../utils/userRequest';

const fetchCustomers = async (search = '', page = 1) => {
    const res = await userRequest.get(`/customers?search=${search}&page=${page}`);
    return res.data;
};

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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
        <Button
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold mt-3 sm:mt-3 md:mt-0 lg:mt-0"
          startContent={<FaPlus />}
          onPress={() => setShowAddModal(true)}
        >
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <Input
            placeholder="Search customers by name or contact..."
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
              <TableColumn>CONTACT</TableColumn>
              <TableColumn>TYPE</TableColumn>
              {/* <TableColumn>BALANCE</TableColumn> */}
              {/* <TableColumn>TOTAL PURCHASES</TableColumn>
              <TableColumn>LAST PURCHASE</TableColumn> */}
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
                  <TableCell>
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold">{customer.name}</div>
                      <div className="text-sm text-gray-500">
                        {customer.email}
                      </div>
                    </div>
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
                  {/* <TableCell>
                    <span
                      className={
                        customer.balance >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      Rs. {Math.abs(customer.balance).toLocaleString()}
                      {customer.balance < 0 && " (Due)"}
                    </span>
                  </TableCell> */}
                  {/* <TableCell>
                    Rs. {customer.totalPurchases.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {customer.lastPurchase
                      ? new Date(customer.lastPurchase).toLocaleDateString()
                      : "Never"}
                  </TableCell> */}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                        onPress={() => viewCustomerDetails(customer)}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="warning"
                        onPress={() => {
                          setSelectedCustomer(customer);
                          setShowEditModal(true);
                        }}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleDeleteCustomer(customer)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Customer Form Modals */}
      <AddCustomer
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        refetch={refetch}
      />
      <UpdateCustomer
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={refetch}
        customer={selectedCustomer}
      />

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
