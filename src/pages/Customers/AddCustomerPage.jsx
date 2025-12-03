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
    country: "",
    state: "",
    city: "",
    deliveryAddress: "",
    manager: "",
    type: "retail",
    cnicNumber: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setnewCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await userRequest.post("/customers", {
        name: newCustomer.name,
        email: newCustomer.email,
        phoneNumber: newCustomer.contact,
        address: newCustomer.address,
        customerType: newCustomer.type,
        cnicNumber: newCustomer.cnicNumber,
        country: newCustomer.country,
        state: newCustomer.state,
        city: newCustomer.city,
        deliveryAddress: newCustomer.deliveryAddress,
        manager: newCustomer.manager,
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
            variant="flat"
            onPress={() => navigate('/Navigation')}
            isDisabled={loading}
          >
            Dashboard
          </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            {/* <Input
              label="Address"
              placeholder="Enter address"
              value={newCustomer.address}
              onChange={handleInputChange}
              name="address"
              startContent={<FaMapMarkerAlt />}
              variant="bordered"
            /> */}

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
          <div className="flex gap-2 mt-3">
            <Input
              label="CNIC"
              labelPlacement="outside"
              placeholder="Enter CNIC "
              value={newCustomer.cnicNumber}
              onChange={(e) =>
                setnewCustomer({ ...newCustomer, cnicNumber: e.target.value })
              }
              variant="bordered"
            />
            <Input
              label="Manager Name"
              labelPlacement="outside"
              placeholder="Enter manager name"
              value={newCustomer.manager}
              onChange={(e) =>
                setnewCustomer({ ...newCustomer, manager: e.target.value })
              }
              variant="bordered"
            />
            {/* <Select
              label="Manager"

              placeholder="Select the Party Manager"
              value={newCustomer.manager || ""}
              onValueChange={(value) =>
                setnewCustomer({ ...newCustomer, manager: value })
              }
              className="w-64"
            // startContent={<FaCalendarAlt />}
            >
              <SelectItem key="Customer" value="Customer">
                Customer
              </SelectItem>
              <SelectItem key="active" value="active">
                Active
              </SelectItem>
              <SelectItem key="Internal" value="Internal">
                Internal
              </SelectItem>
            </Select> */}
          </div>
          <div className="mt-8">
            <div className="mb-2 rounded-lg px-4 py-2 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
              <h2 className="text-lg font-semibold text-purple-700">Address</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Country"
                placeholder="Enter country"
                value={newCustomer.country}
                onChange={(e) =>
                  setnewCustomer({ ...newCustomer, country: e.target.value })
                }
                variant="bordered"
              />
              <Input
                label="State"
                placeholder="Enter state"
                value={newCustomer.state}
                onChange={(e) =>
                  setnewCustomer({ ...newCustomer, state: e.target.value })
                }
                variant="bordered"
              />
              <Input
                label="City"
                placeholder="Enter city"
                value={newCustomer.city}
                onChange={(e) =>
                  setnewCustomer({ ...newCustomer, city: e.target.value })
                }
                variant="bordered"
              />
            </div>
            <Input
              className="mt-7"
              label="Address"
              placeholder="Enter full address"
              value={newCustomer.address}
              onChange={(e) =>
                setnewCustomer({ ...newCustomer, address: e.target.value })
              }
              variant="bordered"
            />
            <div className="mt-10">
              <Input
                label="Delivery Address"
                placeholder="Enter Delivery full address"
                value={newCustomer.deliveryAddress}
                onChange={(e) =>
                  setnewCustomer({
                    ...newCustomer,
                    deliveryAddress: e.target.value,
                  })
                }
                variant="bordered"
              />
            </div>
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
