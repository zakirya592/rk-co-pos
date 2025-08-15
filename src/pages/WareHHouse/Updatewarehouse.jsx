import React, { useEffect, useState } from 'react';
import { Input, Select, SelectItem, Button,  } from '@nextui-org/react';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

export default function Updatewarehouse() {
  const navigate = useNavigate();
  const {id} = useParams();
  const [form, setForm] = useState({
    name: "",
    code: "",
    branch: "",
    // address: '',
    country: "",
    state: "",
    city: "",
    zipCode: "",
    contactPerson: "",
    phoneNumber: "",
    email: "",
    // status: 'active',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (e) => {
    setForm({ ...form, status: e.target.value });
  };

  useEffect(() => {
   const getpaiid = async () => {
    try {
      const res = await userRequest.get(`/warehouses/${id}`);
      setForm(res.data.data);
    } catch (error) {
      console.log(error);
    }
   }
   getpaiid();
  }, [id])
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userRequest.put(`/warehouses/${id}`, {
        name: form.name,
        code: form.code,
        branch: form.branch,
        country: form.country,
        state: form.state,
        city: form.city,
        zipCode: form.zipCode,
        contactPerson: form.contactPerson,
        phoneNumber: form.phoneNumber,
        email: form.email,
      });
      setLoading(false);
      setForm({
        ...form,
        name: "",
        code: "",
        branch: "",
        country: "",
        state: "",
        city: "",
        zipCode: "",
        contactPerson: "",
        phoneNumber: "",
        email: "",
      });
      navigate("/warehouse");
      toast.success("Warehouse update successfully!");
    } catch (error) {
      setLoading(false);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to update warehouses."
      );
    }
  };

  return (
    <div className="p-2 sm:p-2 md:p-6 space-y-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap  justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Update Warehouse</h2>
          <Button
            type="submit"
            color="primary"
            isLoading={loading}
            className="bg-gradient-to-r w-auto from-blue-500 to-purple-600 text-white font-semibold"
          >
            {loading ? "Updating..." : "Update Warehouse"}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Warehouse Name"
            labelPlacement="outside"
            placeholder="Enter Warehouse name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full"
          />
          <Input
            label="Warehouse Code"
            labelPlacement="outside"
            placeholder="Enter Warehouse code"
            name="code"
            value={form.code}
            onChange={handleChange}
            required
            className="w-full"
          />
          <Input
            label="branch/Shop Linked"
            labelPlacement="outside"
            placeholder="Enter branch/Shop name"
            name="branch"
            value={form.branch}
            onChange={handleChange}
            className="w-full"
          />
          {/* <Input
            label="Address"
            labelPlacement="outside"
            placeholder="Enter Warehouse address"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full"
          /> */}
          <Input
            label="country"
            labelPlacement="outside"
            placeholder="Enter country"
            name="country"
            value={form.country}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            label="State"
            labelPlacement="outside"
            placeholder="Enter State"
            name="state"
            value={form.state}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            label="city"
            labelPlacement="outside"
            placeholder="Enter city"
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            label="zipCode Code"
            labelPlacement="outside"
            placeholder="Enter zipCode Code"
            name="zipCode"
            value={form.zipCode}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            label="manager / Contact Person"
            labelPlacement="outside"
            placeholder="Enter manager name"
            name="contactPerson"
            value={form.contactPerson}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            label="phone Number"
            labelPlacement="outside"
            placeholder="Enter phone number"
            name="phoneNumber"
            type="tel"
            value={form.phoneNumber}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            label="Email"
            labelPlacement="outside"
            placeholder="Enter Email address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full"
          />
          {/* <Select
            label="Status"
            labelPlacement="outside"
            placeholder="Select status"
            name="status"
            value={form.status}
            onChange={handleSelectChange}
            className="w-full"
          >
            <SelectItem key="active" value="active">
              Active
            </SelectItem>
            <SelectItem key="inactive" value="inactive">
              Inactive
            </SelectItem>
          </Select> */}
        </div>
      </form>
    </div>
  );
}
