import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Button,
  Link,
} from '@nextui-org/react';
import { FaUser, FaPhone, FaMapMarkerAlt, FaBox, FaWarehouse } from 'react-icons/fa';
import { MdEmail } from "react-icons/md";
import toast from 'react-hot-toast';
import userRequest from '../../utils/userRequest';
import { useNavigate } from 'react-router-dom';

const AddCustomerPage = () => {
  const navigate = useNavigate();
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
      toast.success("Customer added successfully!");
      navigate('/customers');
      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to add customer.");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Customer</h1>
        {/* <Link href="/customers" color="primary" className="text-sm">
          Back to Customers
        </Link> */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            color="danger"
            onPress={() => navigate("/customers")}
            variant="flat"
          >
            Back
          </Button>
          <Button color="primary" onPress={handleSubmit} isLoading={loading}>
            Save Customer
          </Button>
        </div>
      </div>

      <Card>
        <CardBody>
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
              value={newCustomer.email}
              onChange={handleInputChange}
              name="email"
              startContent={<MdEmail />}
              variant="bordered"
            />

            <Input
              label="Address"
              placeholder="Enter address"
              value={newCustomer.address}
              onChange={handleInputChange}
              name="address"
              startContent={<FaMapMarkerAlt />}
              variant="bordered"
            />

            <Select
              label="Customer Type"
              value={newCustomer.type}
              onChange={(e) => handleInputChange(e)}
              name="type"
              startContent={<FaBox />}
              variant="bordered"
            >
              <SelectItem key="retail" value="retail">
                Retail
              </SelectItem>
              <SelectItem key="wholesale" value="wholesale">
                Wholesale
              </SelectItem>
            </Select>
          </div>

          {/* <div className="flex justify-end gap-4 mt-6">
            <Button
              color="danger"
              onClick={() => navigate("/customers")}
              variant="flat"
            >
              Cancel
            </Button>
            <Button color="primary" onClick={handleSubmit} isLoading={loading}>
              Save Customer
            </Button>
          </div> */}
        </CardBody>
      </Card>
    </div>
  );
};

export default AddCustomerPage;
