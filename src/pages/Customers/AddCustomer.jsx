import React, { useState } from 'react';
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
import { MdEmail } from "react-icons/md";
import toast from 'react-hot-toast';
import userRequest from '../../utils/userRequest';

const AddCustomer = ({ isOpen, onClose, refetch }) => {
  const [loading, setLoading] = useState(false);
  const [newCustomer, setnewCustomer] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
    type: "retail",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setnewCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async() => {
    setLoading(true)
    try {
      await userRequest.post("/customers", {
         name: newCustomer.name,
         email: newCustomer.email,
         phoneNumber: newCustomer.contact,
         address: newCustomer.address,
         customerType: newCustomer.type,
       });
       
      setnewCustomer({
        name: "",
        contact: "",
        email: "",
        address: "",
        type: "retail",
      });
      onClose();
      toast.success("Customer added successfully!");
      refetch();
      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to add customer.");
      setLoading(false);
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
        <ModalHeader>Add New Customer</ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              placeholder="Enter customer name"
              value={newCustomer.name}
              onChange={handleInputChange}
              name="name"
              startContent={<FaUser />}
              variant="bordered"
              required
            />

            <Input
              label="Contact Number"
              placeholder="03001234567"
              value={newCustomer.contact}
              onChange={handleInputChange}
              name="contact"
              startContent={<FaPhone />}
              variant="bordered"
              required
            />

            <Input
              label="Email"
              placeholder="customer@example.com"
              startContent={<MdEmail />}
              type="email"
              value={newCustomer.email}
              onChange={handleInputChange}
              name="email"
              variant="bordered"
            />

            <Select
              label="Customer Type"
              value={newCustomer.type}
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
              value={newCustomer.address}
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
            onPress={handleSubmit}
            isLoading={loading}
          >
            Add Customer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddCustomer;
