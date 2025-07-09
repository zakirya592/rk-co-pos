import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, Button, Card, CardBody, Spinner } from '@nextui-org/react';
import { FaSave, FaArrowLeft, FaTrash, FaImage } from 'react-icons/fa';
import toast from 'react-hot-toast';
import userRequest from '../../utils/userRequest';

const UpdateSupplier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [supplier, setSupplier] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    image: null
  });

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const res = await userRequest.get(`/suppliers/${id}`);
        setSupplier(res.data || {});
      } catch (error) {
        toast.error(
          error?.response?.data?.message || error.message || "Failed to fetch supplier details"
        );
        navigate('/suppliers');
      }
    };
    fetchSupplier();
  }, [id, navigate]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", supplier.name);
      formData.append("email", supplier.email);
      formData.append("phoneNumber", supplier.phoneNumber);
      formData.append("address", supplier.address);
      if (supplier.image) {
        formData.append("image", supplier.image);
      }

      await userRequest.put(`/suppliers/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.success("Supplier updated successfully!");
      navigate('/suppliers');
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error.message || "Failed to update supplier."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSize = 4 * 1024 * 1024; // 4MB in bytes

    if (file.size > maxSize) {
      alert("Image is greater than 4MB. Please upload a smaller image.");
      return;
    }
    setSupplier({ ...supplier, image: file });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
       
        <h1 className="text-2xl font-bold">Update Supplier</h1>
        <div className="flex justify-end gap-4">
          <Button
            variant="flat"
            startContent={<FaArrowLeft />}
            onPress={() => navigate("/suppliers")}
            isDisabled={loading}
          >
            Back
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            onPress={handleUpdate}
            isDisabled={loading}
            startContent={loading ? <Spinner /> : <FaSave />}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Card>
        <CardBody>
          <div className="space-y-6">
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Name"
                placeholder="Enter supplier name"
                value={supplier.name}
                onChange={(e) =>
                  setSupplier({ ...supplier, name: e.target.value })
                }
                variant="bordered"
                required
              />
              <Input
                label="Email"
                placeholder="Enter email address"
                type="email"
                value={supplier.email}
                onChange={(e) =>
                  setSupplier({ ...supplier, email: e.target.value })
                }
                variant="bordered"
                required
              />
              <Input
                label="Phone Number"
                placeholder="Enter phone number"
                type="tel"
                value={supplier.phoneNumber}
                onChange={(e) =>
                  setSupplier({ ...supplier, phoneNumber: e.target.value })
                }
                variant="bordered"
                required
              />
              <Input
                label="Address"
                placeholder="Enter address"
                value={supplier.address}
                onChange={(e) =>
                  setSupplier({ ...supplier, address: e.target.value })
                }
                variant="bordered"
                required
              />
              <div className="flex flex-col">
                <label className="font-medium text-gray-700">
                  Supplier Image
                </label>
                <div className="relative w-32 h-32">
                  {!supplier.image ? (
                    <label
                      htmlFor="supplier-image-upload"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-32 cursor-pointer hover:border-blue-400 transition"
                    >
                      <FaImage className="text-4xl text-gray-300 mb-2" />
                      <span className="text-gray-500">
                        Click to upload image
                      </span>
                      <input
                        id="supplier-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  ) : (
                    <div className="relative w-32 h-32">
                      <img
                        src={
                          supplier.image instanceof File
                            ? URL.createObjectURL(supplier.image)
                            : supplier.image
                        }
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-100"
                        onClick={() => setSupplier({ ...supplier, image: "" })}
                        title="Remove image"
                      >
                        <FaTrash className="text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default UpdateSupplier;
