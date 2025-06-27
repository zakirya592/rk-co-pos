
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Chip,
  Tabs,
  Tab
} from '@nextui-org/react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Customers = () => {
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'Ahmad Khan',
      contact: '03001234567',
      email: 'ahmad@example.com',
      address: 'House 123, Street 5, Lahore',
      type: 'wholesale',
      balance: 15000,
      totalPurchases: 250000,
      lastPurchase: '2024-01-15'
    },
    {
      id: 2,
      name: 'Sarah Ahmed',
      contact: '03009876543',
      email: 'sarah@example.com',
      address: 'Flat 45, Block A, Karachi',
      type: 'retail',
      balance: -5000,
      totalPurchases: 85000,
      lastPurchase: '2024-01-20'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    type: 'retail'
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact.includes(searchTerm)
  );

  const handleAddCustomer = () => {
    const customer = {
      id: Date.now(),
      ...newCustomer,
      balance: 0,
      totalPurchases: 0,
      lastPurchase: null
    };
    
    setCustomers([...customers, customer]);
    setNewCustomer({
      name: '',
      contact: '',
      email: '',
      address: '',
      type: 'retail'
    });
    setShowAddModal(false);
  };

  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  // Sample purchase history for demo
  const purchaseHistory = [
    { id: 1, date: '2024-01-20', items: 'Laptop, Mouse', amount: 87000, payment: 'partial' },
    { id: 2, date: '2024-01-15', items: 'Chair, Desk', amount: 25000, payment: 'paid' },
    { id: 3, date: '2024-01-10', items: 'Phone Case', amount: 1500, payment: 'paid' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
          <p className="text-gray-600">Manage customer information and purchase history</p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
          startContent={<FaPlus />}
          onClick={() => setShowAddModal(true)}
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
              <TableColumn>CUSTOMER</TableColumn>
              <TableColumn>CONTACT</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>BALANCE</TableColumn>
              <TableColumn>TOTAL PURCHASES</TableColumn>
              <TableColumn>LAST PURCHASE</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <div className="font-semibold">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FaPhone className="text-gray-400" />
                      {customer.contact}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" color={customer.type === 'wholesale' ? 'secondary' : 'primary'}>
                      {customer.type}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className={customer.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      Rs. {Math.abs(customer.balance).toLocaleString()}
                      {customer.balance < 0 && ' (Due)'}
                    </span>
                  </TableCell>
                  <TableCell>Rs. {customer.totalPurchases.toLocaleString()}</TableCell>
                  <TableCell>
                    {customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        isIconOnly 
                        size="sm" 
                        variant="light" 
                        color="primary"
                        onClick={() => viewCustomerDetails(customer)}
                      >
                        <FaEye />
                      </Button>
                      <Button isIconOnly size="sm" variant="light" color="warning">
                        <FaEdit />
                      </Button>
                      <Button isIconOnly size="sm" variant="light" color="danger">
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

      {/* Add Customer Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} size="2xl">
        <ModalContent>
          <ModalHeader>Add New Customer</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Customer Name"
                placeholder="Enter customer name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                startContent={<FaUser />}
                variant="bordered"
                required
              />
              
              <Input
                label="Contact Number"
                placeholder="03001234567"
                value={newCustomer.contact}
                onChange={(e) => setNewCustomer({...newCustomer, contact: e.target.value})}
                startContent={<FaPhone />}
                variant="bordered"
                required
              />

              <Input
                label="Email"
                placeholder="customer@example.com"
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                variant="bordered"
              />

              <Select
                label="Customer Type"
                value={newCustomer.type}
                onChange={(e) => setNewCustomer({...newCustomer, type: e.target.value})}
                variant="bordered"
                required
              >
                <SelectItem key="retail" value="retail">Retail</SelectItem>
                <SelectItem key="wholesale" value="wholesale">Wholesale</SelectItem>
              </Select>

              <Input
                label="Address"
                placeholder="Enter customer address"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                startContent={<FaMapMarkerAlt />}
                variant="bordered"
                className="md:col-span-2"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              onPress={handleAddCustomer}
            >
              Add Customer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Customer Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} size="3xl">
        <ModalContent>
          <ModalHeader>Customer Details</ModalHeader>
          <ModalBody>
            {selectedCustomer && (
              <Tabs>
                <Tab key="info" title="Information">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700">Name</h4>
                        <p>{selectedCustomer.name}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Contact</h4>
                        <p>{selectedCustomer.contact}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Email</h4>
                        <p>{selectedCustomer.email}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">Type</h4>
                        <Chip color={selectedCustomer.type === 'wholesale' ? 'secondary' : 'primary'}>
                          {selectedCustomer.type}
                        </Chip>
                      </div>
                      <div className="md:col-span-2">
                        <h4 className="font-semibold text-gray-700">Address</h4>
                        <p>{selectedCustomer.address}</p>
                      </div>
                    </div>
                  </div>
                </Tab>
                <Tab key="history" title="Purchase History">
                  <Table aria-label="Purchase history">
                    <TableHeader>
                      <TableColumn>DATE</TableColumn>
                      <TableColumn>ITEMS</TableColumn>
                      <TableColumn>AMOUNT</TableColumn>
                      <TableColumn>STATUS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {purchaseHistory.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                          <TableCell>{purchase.items}</TableCell>
                          <TableCell>Rs. {purchase.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip size="sm" color={purchase.payment === 'paid' ? 'success' : 'warning'}>
                              {purchase.payment}
                            </Chip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Tab>
              </Tabs>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onPress={() => setShowDetailsModal(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Customers;
