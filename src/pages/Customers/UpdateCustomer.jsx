import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Button,
} from '@nextui-org/react';
import { FaUser, FaPhone, FaMapMarkerAlt, FaBox, FaWarehouse } from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import { MdEmail } from 'react-icons/md';

const UpdateCustomer = ({ isOpen, onClose, onSubmit, customer }) => {

  const [loading, setLoading] = useState(false);
  const [updatedCustomer, setupdatedCustomer] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    type: 'retail'
  });

  useEffect(() => {
    if (customer) {
      setupdatedCustomer({
        name: customer.name,
        contact: customer.phoneNumber,
        email: customer.email,
        address: customer.address,
        type: customer.customerType,
      });
    }
  }, [customer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setupdatedCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditCustomer = async () => {
    setLoading(true);
    try {
      await userRequest.put(`/customers/${customer?._id || ""}`, {
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        phoneNumber: updatedCustomer.contact,
        address: updatedCustomer.address,
        customerType: updatedCustomer.type,
      });
      setupdatedCustomer({
        id: "",
        name: "",
        contact: "",
        email: "",
        address: "",
        type: "retail",
      });

      onClose()
      toast.success("Customer updated successfully!");
      onSubmit();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(error?.response?.data?.message || error.message || "Failed to update customer.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      backdrop="opaque"
      isDismissable={false}
      hideCloseButton={false}
    >
      <ModalContent>
        <ModalHeader>Update Customer</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              placeholder="Enter customer name"
              value={updatedCustomer.name}
              onChange={handleInputChange}
              name="name"
              startContent={<FaUser />}
              variant="bordered"
              required
            />

            <Input
              label="Contact Number"
              placeholder="03001234567"
              value={updatedCustomer.contact}
              onChange={handleInputChange}
              name="contact"
              startContent={<FaPhone />}
              variant="bordered"
              required
            />

            <Input
              label="Email"
              placeholder="customer@example.com"
              type="email"
              startContent={<MdEmail />}
              value={updatedCustomer.email}
              onChange={handleInputChange}
              name="email"
              variant="bordered"
            />

            <Select
              label="Customer Type"
              value={updatedCustomer.type}
              selectedKeys={updatedCustomer.type ? [updatedCustomer.type] : []}
              onChange={handleInputChange}
              startContent={<FaUser />}
              name="type"
              variant="bordered"
              required
            >
              <SelectItem key="retail" value="retail" startContent={<FaBox className="text-gray-500" />}>
                Retail
              </SelectItem>
              <SelectItem key="wholesale" value="wholesale" startContent={<FaWarehouse className="text-gray-500" />}>
                Wholesale
              </SelectItem>
            </Select>

            <Input
              label="Address"
              placeholder="Enter customer address"
              value={updatedCustomer.address}
              onChange={handleInputChange}
              name="address"
              startContent={<FaMapMarkerAlt />}
              variant="bordered"
              className="md:col-span-2"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            onPress={handleEditCustomer}
            isLoading={loading}
          >
            Update Customer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateCustomer;
