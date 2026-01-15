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
  Textarea,
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

const OwnersTable = ({ data, onRefresh }) => {
  const [editingId, setEditingId] = useState(null);
  const [viewingOwner, setViewingOwner] = useState(null);
  const [editedData, setEditedData] = useState({ 
    name: "", 
    phoneNumber: "", 
    address: ""
  });
  const [newOwner, setNewOwner] = useState({ 
    name: "", 
    phoneNumber: "", 
    address: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);
  
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

  const handleEdit = (owner) => {
    setEditingId(owner._id);
    setEditedData({
      name: owner.name || "",
      phoneNumber: owner.phoneNumber || "",
      address: owner.address || "",
    });
    onEditModalOpen();
  };

  const handleView = async (ownerId) => {
    try {
      const response = await userRequest.get(`/owners/${ownerId}`);
      // Handle nested structure: data.data.owner (singular)
      const owner = response.data?.data?.owner || 
                   response.data?.data || 
                   response.data;
      setViewingOwner(owner);
      onViewModalOpen();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch owner details"
      );
    }
  };

  const closeEditModal = () => {
    setEditingId(null);
    setEditedData({ name: "", phoneNumber: "", address: "" });
    onEditModalChange(false);
  };

  const closeCreateModal = () => {
    setNewOwner({ name: "", phoneNumber: "", address: "" });
    onCreateModalChange(false);
  };

  const handleSave = async (id) => {
    if (!editedData.name.trim()) {
      toast.error("Please enter owner name");
      return;
    }

    try {
      setIsSubmitting(true);
      await userRequest.put(`/owners/${id}`, {
        name: editedData.name,
        phoneNumber: editedData.phoneNumber,
        address: editedData.address,
      });
      toast.success("Owner updated successfully");
      onRefresh();
      closeEditModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update owner"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!newOwner.name.trim()) {
      toast.error("Please enter owner name");
      return;
    }

    try {
      setIsCreating(true);
      await userRequest.post("/owners", {
        name: newOwner.name,
        phoneNumber: newOwner.phoneNumber,
        address: newOwner.address,
      });
      toast.success("Owner created successfully");
      closeCreateModal();
      onRefresh();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create owner"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!ownerToDelete) return;

    try {
      setIsDeleting(true);
      await userRequest.delete(`/owners/${ownerToDelete._id}`);
      toast.success("Owner deleted successfully");
      onRefresh();
      onDeleteModalChange(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete owner"
      );
    } finally {
      setIsDeleting(false);
      setOwnerToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderCell = (owner, columnKey) => {
    switch (columnKey) {
      case "name":
        return <span className="font-medium">{owner.name || "—"}</span>;
      case "phoneNumber":
        return <span>{owner.phoneNumber || "—"}</span>;
      case "address":
        return (
          <span className="max-w-xs truncate block">
            {owner.address || "—"}
          </span>
        );
      case "createdAt":
        return formatDate(owner.createdAt);
      case "updatedAt":
        return formatDate(owner.updatedAt);
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Owner actions">
                <DropdownItem
                  key="view"
                  startContent={<Eye className="h-4 w-4" />}
                  onPress={() => handleView(owner._id)}
                >
                  View Details
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<Edit className="h-4 w-4" />}
                  onPress={() => handleEdit(owner)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
                  startContent={<Trash2 className="h-4 w-4" />}
                  onPress={() => {
                    setOwnerToDelete(owner);
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
        <h2 className="text-lg font-semibold">Owners Management</h2>
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
            Add Owner
          </Button>
        </div>
      </div>

      <Table aria-label="Owners table">
        <TableHeader>
          <TableColumn key="name">NAME</TableColumn>
          <TableColumn key="phoneNumber">PHONE NUMBER</TableColumn>
          <TableColumn key="address">ADDRESS</TableColumn>
          <TableColumn key="createdAt">CREATED AT</TableColumn>
          <TableColumn key="updatedAt">UPDATED AT</TableColumn>
          <TableColumn key="actions" className="w-24">
            ACTIONS
          </TableColumn>
        </TableHeader>
        <TableBody 
          items={Array.isArray(data) ? data : []} 
          emptyContent="No owners found"
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
              <ModalHeader>Add New Owner</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Owner Name"
                    placeholder="Enter owner name"
                    value={newOwner.name}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, name: e.target.value })
                    }
                    isRequired
                    fullWidth
                  />
                  <Input
                    label="Phone Number"
                    placeholder="Enter phone number"
                    value={newOwner.phoneNumber}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, phoneNumber: e.target.value })
                    }
                    fullWidth
                  />
                  <Textarea
                    label="Address"
                    placeholder="Enter owner address"
                    value={newOwner.address}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, address: e.target.value })
                    }
                    minRows={3}
                    fullWidth
                  />
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
                  {isCreating ? "Creating..." : "Create Owner"}
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
              <ModalHeader>Edit Owner</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Owner Name"
                    value={editedData.name}
                    onChange={(e) =>
                      setEditedData({ ...editedData, name: e.target.value })
                    }
                    isRequired
                    fullWidth
                  />
                  <Input
                    label="Phone Number"
                    value={editedData.phoneNumber}
                    onChange={(e) =>
                      setEditedData({ ...editedData, phoneNumber: e.target.value })
                    }
                    fullWidth
                  />
                  <Textarea
                    label="Address"
                    value={editedData.address}
                    onChange={(e) =>
                      setEditedData({ ...editedData, address: e.target.value })
                    }
                    minRows={3}
                    fullWidth
                  />
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
              <ModalHeader>Owner Details</ModalHeader>
              <ModalBody>
                {viewingOwner && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-lg font-semibold">{viewingOwner.name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-lg">{viewingOwner.phoneNumber || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-lg">{viewingOwner.address || "—"}</p>
                    </div>
                    {viewingOwner.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500">Created At</p>
                        <p className="text-sm">{formatDate(viewingOwner.createdAt)}</p>
                      </div>
                    )}
                    {viewingOwner.updatedAt && (
                      <div>
                        <p className="text-sm text-gray-500">Updated At</p>
                        <p className="text-sm">{formatDate(viewingOwner.updatedAt)}</p>
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
              <ModalHeader>Delete Owner</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this owner?</p>
                {ownerToDelete?.name && (
                  <p className="text-sm font-medium mt-2">"{ownerToDelete.name}"</p>
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

export default OwnersTable;
