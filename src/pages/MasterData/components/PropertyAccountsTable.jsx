import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Input,
  Checkbox,
  Chip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { Plus, MoreVertical, Edit, Trash2, RefreshCw, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import userRequest from "../../../utils/userRequest";

const PropertyAccountsTable = ({ data, onRefresh }) => {
  const [editingId, setEditingId] = useState(null);
  const [viewingProperty, setViewingProperty] = useState(null);
  const [editedData, setEditedData] = useState({ 
    propertyName: "", 
    location: "", 
    value: "",
    isRented: false
  });
  const [newProperty, setNewProperty] = useState({ 
    propertyName: "", 
    location: "", 
    value: "",
    isRented: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onOpenChange: onDeleteModalChange,
  } = useDisclosure();
  const {
    isOpen: isEditModalOpen,
    onOpen: onEditModalOpen,
    onOpenChange: onEditModalChange,
  } = useDisclosure();
  const {
    isOpen: isViewModalOpen,
    onOpen: onViewModalOpen,
    onOpenChange: onViewModalChange,
  } = useDisclosure();
  const {
    isOpen: isCreateModalOpen,
    onOpen: onCreateModalOpen,
    onOpenChange: onCreateModalChange,
  } = useDisclosure();

  const handleEdit = (property) => {
    setEditingId(property._id);
    setEditedData({
      propertyName: property.propertyName || "",
      location: property.location || "",
      value: property.value?.toString() || "",
      isRented: property.isRented === true || property.isRented === "true",
    });
    onEditModalOpen();
  };

  const handleView = async (propertyId) => {
    try {
      const response = await userRequest.get(`/property-accounts/${propertyId}`);
      // Handle nested structure: data.data.propertyAccount (singular)
      const property = response.data?.data?.propertyAccount || 
                      response.data?.data?.property || 
                      response.data?.data || 
                      response.data;
      setViewingProperty(property);
      onViewModalOpen();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch property account details"
      );
    }
  };

  const closeEditModal = () => {
    setEditingId(null);
    setEditedData({ propertyName: "", location: "", value: "", isRented: false });
    onEditModalChange(false);
  };

  const closeCreateModal = () => {
    setNewProperty({ propertyName: "", location: "", value: "", isRented: false });
    onCreateModalChange(false);
  };

  const handleSave = async (id) => {
    if (!editedData.propertyName.trim()) {
      toast.error("Please enter property name");
      return;
    }
    if (!editedData.value || parseFloat(editedData.value) < 0) {
      toast.error("Please enter a valid value");
      return;
    }

    try {
      setIsSubmitting(true);
      await userRequest.put(`/property-accounts/${id}`, {
        propertyName: editedData.propertyName,
        location: editedData.location,
        value: editedData.value,
        isRented: editedData.isRented,
      });
      toast.success("Property account updated successfully");
      onRefresh();
      closeEditModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update property account"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!newProperty.propertyName.trim()) {
      toast.error("Please enter property name");
      return;
    }
    if (!newProperty.value || parseFloat(newProperty.value) < 0) {
      toast.error("Please enter a valid value");
      return;
    }

    try {
      setIsCreating(true);
      await userRequest.post("/property-accounts", {
        propertyName: newProperty.propertyName,
        location: newProperty.location,
        value: newProperty.value,
        isRented: newProperty.isRented,
      });
      toast.success("Property account created successfully");
      closeCreateModal();
      onRefresh();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create property account"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!propertyToDelete) return;

    try {
      setIsDeleting(true);
      await userRequest.delete(`/property-accounts/${propertyToDelete._id}`);
      toast.success("Property account deleted successfully");
      onRefresh();
      onDeleteModalChange(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete property account"
      );
    } finally {
      setIsDeleting(false);
      setPropertyToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "0.00";
    return parseFloat(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const renderCell = (property, columnKey) => {
    switch (columnKey) {
      case "propertyName":
        return <span className="font-medium">{property.propertyName || "—"}</span>;
      case "location":
        return <span>{property.location || "—"}</span>;
      case "value":
        return <span className="font-semibold">{formatCurrency(property.value)}</span>;
      case "isRented":
        return (
          <Chip
            size="sm"
            color={property.isRented === true || property.isRented === "true" ? "success" : "default"}
            variant="flat"
          >
            {property.isRented === true || property.isRented === "true" ? "Rented" : "Not Rented"}
          </Chip>
        );
      case "createdAt":
        return formatDate(property.createdAt);
      case "updatedAt":
        return formatDate(property.updatedAt);
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Property account actions">
                <DropdownItem
                  key="view"
                  startContent={<Eye className="h-4 w-4" />}
                  onPress={() => handleView(property._id)}
                >
                  View Details
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<Edit className="h-4 w-4" />}
                  onPress={() => handleEdit(property)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
                  startContent={<Trash2 className="h-4 w-4" />}
                  onPress={() => {
                    setPropertyToDelete(property);
                    onDeleteModalOpen();
                  }}
                >
                  Delete
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Property Accounts Management</h2>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="light"
            color="primary"
            startContent={<RefreshCw className="h-4 w-4" />}
            onPress={onRefresh}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            color="primary"
            startContent={<Plus className="h-4 w-4" />}
            onPress={onCreateModalOpen}
          >
            Add Property Account
          </Button>
        </div>
      </div>

      <Table aria-label="Property accounts table">
        <TableHeader>
          <TableColumn key="propertyName">PROPERTY NAME</TableColumn>
          <TableColumn key="location">LOCATION</TableColumn>
          <TableColumn key="value">VALUE</TableColumn>
          <TableColumn key="isRented">RENTAL STATUS</TableColumn>
          <TableColumn key="createdAt">CREATED AT</TableColumn>
          <TableColumn key="updatedAt">UPDATED AT</TableColumn>
          <TableColumn key="actions" className="w-24">
            ACTIONS
          </TableColumn>
        </TableHeader>
        <TableBody 
          items={Array.isArray(data) ? data : []} 
          emptyContent="No property accounts found"
        >
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onOpenChange={onCreateModalChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add New Property Account</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Property Name"
                    placeholder="Enter property name"
                    value={newProperty.propertyName}
                    onChange={(e) =>
                      setNewProperty({ ...newProperty, propertyName: e.target.value })
                    }
                    isRequired
                    fullWidth
                  />
                  <Input
                    label="Location"
                    placeholder="Enter property location"
                    value={newProperty.location}
                    onChange={(e) =>
                      setNewProperty({ ...newProperty, location: e.target.value })
                    }
                    fullWidth
                  />
                  <Input
                    label="Value"
                    type="number"
                    placeholder="Enter property value"
                    value={newProperty.value}
                    onChange={(e) =>
                      setNewProperty({ ...newProperty, value: e.target.value })
                    }
                    isRequired
                    min="0"
                    step="0.01"
                    fullWidth
                  />
                  <Checkbox
                    isSelected={newProperty.isRented}
                    onValueChange={(isSelected) =>
                      setNewProperty({ ...newProperty, isRented: isSelected })
                    }
                  >
                    Is Rented
                  </Checkbox>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={closeCreateModal}
                  isDisabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleCreate}
                  isLoading={isCreating}
                >
                  {isCreating ? "Creating..." : "Create Property Account"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onOpenChange={onEditModalChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit Property Account</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Property Name"
                    value={editedData.propertyName}
                    onChange={(e) =>
                      setEditedData({ ...editedData, propertyName: e.target.value })
                    }
                    isRequired
                    fullWidth
                  />
                  <Input
                    label="Location"
                    value={editedData.location}
                    onChange={(e) =>
                      setEditedData({ ...editedData, location: e.target.value })
                    }
                    fullWidth
                  />
                  <Input
                    label="Value"
                    type="number"
                    value={editedData.value}
                    onChange={(e) =>
                      setEditedData({ ...editedData, value: e.target.value })
                    }
                    isRequired
                    min="0"
                    step="0.01"
                    fullWidth
                  />
                  <Checkbox
                    isSelected={editedData.isRented}
                    onValueChange={(isSelected) =>
                      setEditedData({ ...editedData, isRented: isSelected })
                    }
                  >
                    Is Rented
                  </Checkbox>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={closeEditModal}
                  isDisabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleSave(editingId)}
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={isViewModalOpen} onOpenChange={onViewModalChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Property Account Details</ModalHeader>
              <ModalBody>
                {viewingProperty && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Property Name</p>
                      <p className="text-lg font-semibold">{viewingProperty.propertyName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-lg">{viewingProperty.location || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Value</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(viewingProperty.value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rental Status</p>
                      <Chip
                        size="sm"
                        color={viewingProperty.isRented === true || viewingProperty.isRented === "true" ? "success" : "default"}
                        variant="flat"
                      >
                        {viewingProperty.isRented === true || viewingProperty.isRented === "true" ? "Rented" : "Not Rented"}
                      </Chip>
                    </div>
                    {viewingProperty.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500">Created At</p>
                        <p className="text-sm">{formatDate(viewingProperty.createdAt)}</p>
                      </div>
                    )}
                    {viewingProperty.updatedAt && (
                      <div>
                        <p className="text-sm text-gray-500">Updated At</p>
                        <p className="text-sm">{formatDate(viewingProperty.updatedAt)}</p>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onOpenChange={onDeleteModalChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete Property Account</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this property account?</p>
                {propertyToDelete?.propertyName && (
                  <p className="text-sm font-medium mt-2">"{propertyToDelete.propertyName}"</p>
                )}
                <p className="text-sm text-foreground-500">
                  This action cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                  isDisabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={handleDelete}
                  isLoading={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PropertyAccountsTable;
