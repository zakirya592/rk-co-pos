import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Input,
  Button,
  Select,
  SelectItem,
  Textarea,
  Chip,
  Divider,
  Spinner,
} from '@nextui-org/react';
import { useForm, Controller } from 'react-hook-form';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const vehicleTypes = [
  { label: "Truck", value: "truck" },
  { label: "Van", value: "van" },
  // { label: "Pickup Truck", value: "Pickup" },
  // { label: "Trailer", value: "TRAILER" },
  { label: "Container", value: "container" },
  { label: "Ship", value: "ship" },
  { label: "Plane", value: "plane" },
];

const paymentTerms = [
  { label: "Advance", value: "advance" },
  { label: "Credit", value: "credit" },
  { label: "On Delivery", value: "on_delivery" },
  { label: "Credit 15", value: "credit_30" },
  { label: "Credit 30", value: "credit_60" },
];

const AddTransporterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState([]);
  const [routes, setRoutes] = useState([
    { origin: '', destination: '', estimatedDays: '', ratePerKg: '' }
  ]);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      contactPerson: '',
      phoneNumber: '',
      email: '',
      address: '',
      city: '',
      country: 'Pakistan',
      commissionRate: '',
      paymentTerms: 'advance',
      rating: 0,
      // isActive: true,
    },
  });

  const handleVehicleTypeChange = (e) => {
    const value = e.target.value;
    setSelectedVehicleTypes(
      selectedVehicleTypes.includes(value)
        ? selectedVehicleTypes.filter((type) => type !== value)
        : [...selectedVehicleTypes, value]
    );
  };

  const handleRouteChange = (index, field, value) => {
    const updatedRoutes = [...routes];
    updatedRoutes[index] = { ...updatedRoutes[index], [field]: value };
    setRoutes(updatedRoutes);
  };

  const addRoute = () => {
    setRoutes([...routes, { origin: '', destination: '', estimatedDays: '', ratePerKg: '' }]);
  };

  const removeRoute = (index) => {
    const updatedRoutes = routes.filter((_, i) => i !== index);
    setRoutes(updatedRoutes);
  };

  const onSubmit = async (data) => {
    if (selectedVehicleTypes.length === 0) {
      toast.error('Please select at least one vehicle type');
      return;
    }

    const validRoutes = routes.filter(
      (route) => route.origin && route.destination && route.estimatedDays && route.ratePerKg
    );

    if (validRoutes.length === 0) {
      toast.error('Please add at least one valid route');
      return;
    }

    const transporterData = {
      ...data,
      vehicleTypes: selectedVehicleTypes,
      routes: validRoutes,
      commissionRate: parseFloat(data.commissionRate) || 0,
      rating: parseInt(data.rating, 10) || 0,
      // isActive: data.isActive === 'true',
    };

    setIsLoading(true);
    try {
      await userRequest.post('/transporters', transporterData);
      toast.success('Transporter added successfully');
      navigate('/transporters');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add transporter');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Transporter</h1>
        <Button
          color="primary"
          variant="light"
          onPress={() => navigate("/transporters")}
        >
          Back to List
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardBody className="space-y-4 p-6">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

              <Controller
                name="name"
                control={control}
                rules={{ required: "Name is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    // 
                    label="Transporter Name"
                    placeholder="Enter transporter name"
                    isRequired
                    isInvalid={!!errors.name}
                    errorMessage={errors.name?.message}
                  />
                )}
              />

              <Controller
                name="contactPerson"
                control={control}
                rules={{ required: "Contact person is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    
                    label="Contact Person"
                    placeholder="Enter contact person name"
                    isRequired
                    isInvalid={!!errors.contactPerson}
                    errorMessage={errors.contactPerson?.message}
                  />
                )}
              />

              <Controller
                name="phoneNumber"
                control={control}
                rules={{ required: "Phone number is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Phone Number"
                    placeholder="Enter phone number"
                    
                    isRequired
                    isInvalid={!!errors.phoneNumber}
                    errorMessage={errors.phoneNumber?.message}
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                rules={{
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Email"
                    type="email"
                    placeholder="Enter email address"
                    
                    isInvalid={!!errors.email}
                    errorMessage={errors.email?.message}
                  />
                )}
              />

              <Controller
                name="address"
                control={control}
                rules={{ required: "Address is required" }}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    label="Address"
                    placeholder="Enter full address"
                    
                    isRequired
                    isInvalid={!!errors.address}
                    errorMessage={errors.address?.message}
                  />
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="city"
                  control={control}
                  rules={{ required: "City is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="City"
                      placeholder="Enter city"
                      isRequired
                      isInvalid={!!errors.city}
                      
                      errorMessage={errors.city?.message}
                    />
                  )}
                />

                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Country"
                      
                      placeholder="Enter country"
                      // isReadOnly
                    />
                  )}
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4 p-6">
              <h2 className="text-lg font-semibold mb-4">
                Business Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Types <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {vehicleTypes.map((type) => (
                    <Chip
                      key={type.value}
                      color={
                        selectedVehicleTypes.includes(type.value)
                          ? "primary"
                          : "default"
                      }
                      variant={
                        selectedVehicleTypes.includes(type.value)
                          ? "solid"
                          : "bordered"
                      }
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedVehicleTypes(
                          selectedVehicleTypes.includes(type.value)
                            ? selectedVehicleTypes.filter(
                                (t) => t !== type.value
                              )
                            : [...selectedVehicleTypes, type.value]
                        )
                      }
                    >
                      {type.label}
                    </Chip>
                  ))}
                </div>
                {selectedVehicleTypes.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Please select at least one vehicle type
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="commissionRate"
                  control={control}
                  rules={{
                    required: "Commission rate is required",
                    min: { value: 0, message: "Must be 0 or greater" },
                    max: { value: 100, message: "Must be 100 or less" },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Commission Rate %"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0.00"
                      isRequired
                      isInvalid={!!errors.commissionRate}
                      errorMessage={errors.commissionRate?.message}
                      endContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">%</span>
                        </div>
                      }
                    />
                  )}
                />

                <Controller
                  name="paymentTerms"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Payment Terms"
                      isRequired
                      defaultSelectedKeys={["advance"]}
                    >
                      {paymentTerms.map((term) => (
                        <SelectItem key={term.value} value={term.value}>
                          {term.label}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Rating"
                      defaultSelectedKeys={["0"]}
                    >
                      {[0, 1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {Array(num).fill("★").join("") || "Not rated"}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />

                {/* <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Status"
                      defaultSelectedKeys={["true"]}
                    >
                      <SelectItem key="true" value="true">
                        Active
                      </SelectItem>
                      <SelectItem key="false" value="false">
                        Inactive
                      </SelectItem>
                    </Select>
                  )}
                /> */}
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="mb-6">
          <CardBody className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Routes</h2>
              <Button
                color="primary"
                variant="light"
                startContent={<FaPlus />}
                onPress={addRoute}
              >
                Add Route
              </Button>
            </div>

            <div className="space-y-4">
              {routes.map((route, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
                >
                  <Input
                    label="Origin"
                    value={route.origin}
                    onChange={(e) =>
                      handleRouteChange(index, "origin", e.target.value)
                    }
                    placeholder="e.g., Karachi"
                    className="md:col-span-3"
                  />
                  <Input
                    label="Destination"
                    value={route.destination}
                    onChange={(e) =>
                      handleRouteChange(index, "destination", e.target.value)
                    }
                    placeholder="e.g., Lahore"
                    className="md:col-span-3"
                  />
                  <Input
                    label="Estimated Days"
                    type="number"
                    min="1"
                    value={route.estimatedDays}
                    onChange={(e) =>
                      handleRouteChange(index, "estimatedDays", e.target.value)
                    }
                    placeholder="e.g., 2"
                    className="md:col-span-2"
                  />
                  <Input
                    label="Rate per Kg (PKR)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={route.ratePerKg}
                    onChange={(e) =>
                      handleRouteChange(index, "ratePerKg", e.target.value)
                    }
                    placeholder="e.g., 12.50"
                    className="md:col-span-2"
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">PKR</span>
                      </div>
                    }
                  />
                  <div className="flex justify-end md:col-span-2">
                    {routes.length > 1 && (
                      <Button
                        isIconOnly
                        color="danger"
                        variant="light"
                        onPress={() => removeRoute(index)}
                      >
                        <FaTrash className="text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            color="default"
            variant="light"
            onPress={() => navigate("/transporters")}
            isDisabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            type="submit"
            isDisabled={isLoading}
            isLoading={isLoading}
          >
            {isLoading ? "Saving..." : "Save Transporter"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddTransporterPage;
