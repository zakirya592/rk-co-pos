import React from 'react';
import { Select, SelectItem, Chip } from "@nextui-org/react";

function CustomerSelectionModal({

  customers = [],
  selectedCustomer,
  setSelectedCustomer,
}) {
  const handleSelectionChange = (e) => {
    const selectedId = e.target.value;
    const customer = customers.find(c => c._id === selectedId);
    if (customer) {
      setSelectedCustomer(customer);
      // if (onClose) onClose();
    }
  };
  

  return (
    <Select
      label="Select Customer"
      placeholder="Search customer..."
      selectedKeys={selectedCustomer ? [selectedCustomer] : []}
      onChange={handleSelectionChange}
      className="w-full"
      size="sm"
      variant="bordered"
      renderValue={(items) => {
        if (!items[0]?.value) return null;
        const customer = customers.find((c) => c._id === items[0].value);
        if (!customer) return null;

        return (
          <div className="flex items-center gap-2">
            <span>{customer.name}</span>
            <Chip
              size="sm"
              color={
                customer.customerType === "wholesale" ? "secondary" : "primary"
              }
              variant="flat"
            >
              {customer.customerType}
            </Chip>
          </div>
        );
      }}
    >
      {customers.map((customer) => (
        <SelectItem
          key={customer._id}
          value={customer._id}
          textValue={`${customer.name} (${customer.phoneNumber || "No phone"})`}
        >
          <div className="flex flex-col">
            <span className="font-medium">{customer.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {customer.phoneNumber || "No phone"}
              </span>
              <Chip
                size="sm"
                color={
                  customer.customerType === "wholesale"
                    ? "secondary"
                    : "primary"
                }
                variant="flat"
                className="ml-1"
              >
                {customer.customerType}
              </Chip>
            </div>
          </div>
        </SelectItem>
      ))}
    </Select>
  );
}

export default CustomerSelectionModal;