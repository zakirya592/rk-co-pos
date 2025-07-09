import React, { useState } from 'react';
import { Input, Button, Card, CardBody, Spinner } from '@nextui-org/react';
import { FaSave, FaArrowLeft, FaImage, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import userRequest from '../../utils/userRequest';

const AddSupplier = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    image: null
  });

  const handleAdd = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newSupplier.name);
      formData.append("email", newSupplier.email);
      formData.append("phoneNumber", newSupplier.phoneNumber);
      formData.append("address", newSupplier.address);
      if (newSupplier.image) {
        formData.append("image", newSupplier.image);
      }

      await userRequest.post("/suppliers", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.success("Supplier added successfully!");
      navigate('/suppliers');
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error.message || "Failed to add supplier."
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
    setNewSupplier({ ...newSupplier, image: file });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        {/* <Button
          variant="flat"
          startContent={<FaArrowLeft />}
          onPress={() => navigate("/suppliers")}
        >
          Back
        </Button> */}
        <h1 className="text-2xl font-bold">Add New Supplier</h1>
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
            onPress={handleAdd}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
              <Input
                label="Name"
                labelPlacement="outside"
                placeholder="Enter supplier name"
                value={newSupplier.name}
                onChange={(e) =>
                  setNewSupplier({ ...newSupplier, name: e.target.value })
                }
                variant="bordered"
                required
              />
              <Input
                label="Email"
                labelPlacement="outside"
                placeholder="Enter email address"
                type="email"
                value={newSupplier.email}
                onChange={(e) =>
                  setNewSupplier({ ...newSupplier, email: e.target.value })
                }
                variant="bordered"
                required
              />
              <Input
                label="Phone Number"
                labelPlacement="outside"
                placeholder="Enter phone number"
                type="tel"
                value={newSupplier.phoneNumber}
                onChange={(e) =>
                  setNewSupplier({
                    ...newSupplier,
                    phoneNumber: e.target.value,
                  })
                }
                variant="bordered"
                required
              />
              <Input
                label="Address"
                labelPlacement="outside"
                placeholder="Enter address"
                value={newSupplier.address}
                onChange={(e) =>
                  setNewSupplier({ ...newSupplier, address: e.target.value })
                }
                variant="bordered"
                required
              />
              <div className="mt-4">
                <label className="font-medium">Supplier Image</label>
                <div className="relative mt-2">
                  {!newSupplier.image ? (
                    <label
                      htmlFor="supplier-image-upload"
                      className="flex flex-col w-32 text-sm items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-32 cursor-pointer hover:border-blue-400 transition-colors"
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
                          newSupplier.image instanceof File
                            ? URL.createObjectURL(newSupplier.image)
                            : newSupplier.image
                        }
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-100 transition-colors"
                        onClick={() =>
                          setNewSupplier({ ...newSupplier, image: null })
                        }
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

export default AddSupplier;
