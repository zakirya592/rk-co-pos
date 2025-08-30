import React, { useState, useEffect } from "react";
import { Input, Button, Select, SelectItem } from "@nextui-org/react";
import userRequest from "../../utils/userRequest";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateShopPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    latitude: "",
    longitude: "",
    contactPerson: "",
    phoneNumber: "",
    email: "",
    shopType: "",
    openingHours: "",
    status: "active",
    branch: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchShop() {
      try {
        const response = await userRequest.get(`/shops/${id}`);
        const data = response?.data?.data;        
        setForm({
          name: data.name || "",
          code: data.code || "",
          address: data.location?.address || "",
          country: data.location?.country || "",
          state: data.location?.state || "",
          city: data.location?.city || "",
          zipCode: data.location?.zipCode || "",
          latitude: data.location?.latitude || "",
          longitude: data.location?.longitude || "",
          contactPerson: data.contactPerson || "",
          phoneNumber: data.phoneNumber || "",
          email: data.email || "",
          shopType: data.shopType || "",
          openingHours: data.openingHours || "",
        //   status: data.status || "active",
          branch: data.branch || "",
        });
      } catch (error) {
        toast.error("Failed to fetch shop details.");
      }
    }
    if (id) fetchShop();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userRequest.put(`/shops/${id}`, {
        name: form.name,
        code: form.code,
        location: {
          address: form.address,
          country: form.country,
          state: form.state,
          city: form.city,
          zipCode: form.zipCode,
            coordinates: {
              latitude: '',
              longitude: ''
            }
        },
        contactPerson: form.contactPerson,
        phoneNumber: form.phoneNumber,
        email: form.email,
        shopType: form.shopType,
        openingHours: form.openingHours,
        // status: form.status,
        branch: form.branch,
      });
      setLoading(false);
      toast.success("Shop updated successfully!");
      navigate("/shop");
    } catch (error) {
      setLoading(false);
      toast.error(
        error?.response?.data?.message || error.message || "Failed to update shop."
      );
    }
  };

  return (
    <div className="p-2 sm:p-2 md:p-6 space-y-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Update Shop</h2>
          <Button
            type="submit"
            color="primary"
            isLoading={loading}
            className="bg-gradient-to-r w-auto from-blue-500 to-purple-600 text-white font-semibold"
          >
            {loading ? "Updating..." : "Update Shop"}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label={
              <>
                Shop Name <span className="text-red-500">*</span>
              </>
            }
            labelPlacement="outside"
            placeholder="Enter shop name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            label={
              <>
                Code <span className="text-red-500">*</span>
              </>
            }
            labelPlacement="outside"
            placeholder="Enter code"
            name="code"
            value={form.code}
            onChange={handleChange}
            required
          />
          <Input
            label={
              <>
                Address <span className="text-red-500">*</span>
              </>
            }
            labelPlacement="outside"
            placeholder="Enter address"
            name="address"
            value={form.address}
            onChange={handleChange}
          />
          <Input
            label="Country"
            labelPlacement="outside"
            placeholder="Enter country"
            name="country"
            value={form.country}
            onChange={handleChange}
          />
          <Input
            label="State"
            labelPlacement="outside"
            placeholder="Enter state"
            name="state"
            value={form.state}
            onChange={handleChange}
          />
          <Input
            label="City"
            labelPlacement="outside"
            placeholder="Enter city"
            name="city"
            value={form.city}
            onChange={handleChange}
          />
          <Input
            label="Zip Code"
            labelPlacement="outside"
            placeholder="Enter zip code"
            name="zipCode"
            value={form.zipCode}
            onChange={handleChange}
          />
          <Input
            label="Contact Person"
            labelPlacement="outside"
            placeholder="Enter contact person"
            name="contactPerson"
            value={form.contactPerson}
            onChange={handleChange}
          />
          <Input
            label="Phone Number"
            labelPlacement="outside"
            placeholder="Enter phone number"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
          />
          <Input
            label="Email"
            labelPlacement="outside"
            placeholder="Enter email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <Select
            label="Shop Type"
              value={form.shopType}
              selectedKeys={form.shopType ? [form.shopType] : []}
              labelPlacement="outside"
              placeholder="Enter shop type"
              onChange={handleChange}
              name="shopType"
              required
          >
            <SelectItem key="retail" value="retail">
              Retail
            </SelectItem>
            <SelectItem key="wholesale" value="wholesale">
              Wholesale
            </SelectItem>
          </Select>
          <Input
            label="Opening Hours"
            labelPlacement="outside"
            placeholder="Enter opening hours"
            name="openingHours"
            value={form.openingHours}
            onChange={handleChange}
          />
        </div>
      </form>
    </div>
  );
}
