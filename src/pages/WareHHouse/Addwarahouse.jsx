import React, { useState } from 'react';
import { Input, Select, SelectItem, Button } from '@nextui-org/react';

export default function Addwarahouse() {
  const [form, setForm] = useState({
    name: '',
    code: '',
    branch: '',
    address: '',
    country: '',
    state: '',
    city: '',
    zip: '',
    manager: '',
    phone: '',
    email: '',
    status: 'active',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSelectChange = (e) => {
    setForm({ ...form, status: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic here
    console.log(form);
  };

  return (
    <div className="p-2 sm:p-2 md:p-6 space-y-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap  justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Add New Warehouse</h2>
          <Button
            type="submit"
            color="primary"
            className="bg-gradient-to-r w-auto from-blue-500 to-purple-600 text-white font-semibold"
          >
            Add Warehouse
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
            label="Branch/Shop Linked"
            labelPlacement="outside"
            placeholder="Enter Branch/Shop name"
            name="branch"
            value={form.branch}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            label="Address"
            labelPlacement="outside"
            placeholder="Enter Warehouse address"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            label="Country"
            labelPlacement="outside"
            placeholder="Enter Country"
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
            label="City"
            labelPlacement="outside"
            placeholder="Enter City"
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            label="Zip Code"
            labelPlacement="outside"
            placeholder="Enter Zip Code"
            name="zip"
            value={form.zip}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            label="Manager / Contact Person"
            labelPlacement="outside"
            placeholder="Enter Manager name"
            name="manager"
            value={form.manager}
            onChange={handleChange}
            className="w-full"
          />
          <Input
            label="Phone Number"
            labelPlacement="outside"
            placeholder="Enter Phone number"
            name="phone"
            type="tel"
            value={form.phone}
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
          <Select
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
          </Select>
        </div>
      </form>
    </div>
  );
}
