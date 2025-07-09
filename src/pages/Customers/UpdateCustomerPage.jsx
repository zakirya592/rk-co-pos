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
import { useParams, useNavigate } from 'react-router-dom';

const UpdateCustomerPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
    type: "retail",
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await userRequest.get(`/customers/${id}`);
        // setCustomer(response.data.data);
        console.log(response.data.data);
         setCustomer({
           name: response.data.data.name || "",
           contact: response.data.data.phoneNumber || "",
           email: response.data.data.email || "",
           address: response.data.data.address || "",
           type: response.data.data.customerType || "retail",
         });
      } catch (error) {
        toast.error("Failed to fetch customer details");
        navigate('/customers');
      }
    };
    fetchCustomer();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async() => {
    setLoading(true)
    try {
      await userRequest.put(`/customers/${id}`, {
         name: customer.name,
         email: customer.email,
         phoneNumber: customer.contact,
         address: customer.address,
         customerType: customer.type,
      });
      toast.success("Customer updated successfully!");
      navigate('/customers');
      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to update customer.");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Customer</h1>
        <div className="flex justify-end gap-4 mt-6">
          <Button
            color="danger"
            onPress={() => navigate("/customers")}
            variant="flat"
          >
            Back to Customers
          </Button>
          <Button color="primary" onPress={handleSubmit} isLoading={loading}>
            Update Customer
          </Button>
        </div>
      </div>

      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              placeholder="Enter customer name"
              value={customer.name}
              onChange={handleInputChange}
              name="name"
              startContent={<FaUser />}
              variant="bordered"
              required
            />

            <Input
              label="Contact Number"
              placeholder="03001234567"
              value={customer.contact}
              onChange={handleInputChange}
              name="contact"
              startContent={<FaPhone />}
              variant="bordered"
              required
            />

            <Input
              label="Email"
              placeholder="customer@example.com"
              value={customer.email}
              onChange={handleInputChange}
              name="email"
              startContent={<MdEmail />}
              variant="bordered"
            />

            <Input
              label="Address"
              placeholder="Enter address"
              value={customer.address}
              onChange={handleInputChange}
              name="address"
              startContent={<FaMapMarkerAlt />}
              variant="bordered"
            />

            <Select
              label="Customer Type"
              value={customer.type}
              onChange={(e) => handleInputChange(e)}
              selectedKeys={customer.type ? [customer.type] : []}
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
        </CardBody>
      </Card>
    </div>
  );
};

export default UpdateCustomerPage;
