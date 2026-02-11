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

const LiabilitiesTable = ({ data, onRefresh }) => {
  const [editingId, setEditingId] = useState(null);
  const [viewingLiability, setViewingLiability] = useState(null);
  const [editedData, setEditedData] = useState({
    name: "",
    mobileNo: "",
    code: "",
    description: "",
  });
  const [newLiability, setNewLiability] = useState({
    name: "",
    mobileNo: "",
    code: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [liabilityToDelete, setLiabilityToDelete] = useState(null);
  
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

  const handleEdit = (liability) => {
    setEditingId(liability._id);
    setEditedData({
      name: liability.name || "",
      mobileNo: liability.mobileNo || liability.phoneNumber || "",
      code: liability.code || "",
      description: liability.description || "",
    });
    onEditModalOpen();
  };

  const handleView = async (liabilityId) => {
    try {
      const response = await userRequest.get(`/liabilities/${liabilityId}`);
      // Handle nested structure: data.data.liability (singular)
      const liability = response.data?.data?.liability || response.data?.data || response.data;
      setViewingLiability(liability);
      onViewModalOpen();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch liability details"
      );
    }
  };

  const closeEditModal = () => {
    setEditingId(null);
    setEditedData({ name: "", mobileNo: "", code: "", description: "" });
    onEditModalChange(false);
  };

  const closeCreateModal = () => {
    setNewLiability({ name: "", mobileNo: "", code: "", description: "" });
    onCreateModalChange(false);
  };

  const handleSave = async (id) => {
    if (!editedData.name.trim()) {
      toast.error("Please enter name");
      return;
    }

    try {
      setIsSubmitting(true);
      await userRequest.put(`/liabilities/${id}`, {
        name: editedData.name,
        mobileNo: editedData.mobileNo,
        code: editedData.code,
        description: editedData.description,
      });
      toast.success("Liability updated successfully");
      onRefresh();
      closeEditModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update liability"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!newLiability.name.trim()) {
      toast.error("Please enter name");
      return;
    }

    try {
      setIsCreating(true);
      await userRequest.post("/liabilities", {
        name: newLiability.name,
        mobileNo: newLiability.mobileNo,
        code: newLiability.code,
        description: newLiability.description,
      });
      toast.success("Liability created successfully");
      closeCreateModal();
      onRefresh();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create liability"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!liabilityToDelete) return;

    try {
      setIsDeleting(true);
      await userRequest.delete(`/liabilities/${liabilityToDelete._id}`);
      toast.success("Liability deleted successfully");
      onRefresh();
      onDeleteModalChange(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete liability"
      );
    } finally {
      setIsDeleting(false);
      setLiabilityToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderCell = (liability, columnKey) => {
    switch (columnKey) {
      case "name":
        return <span className="font-medium">{liability.name || "—"}</span>;
      case "mobileNo":
        return <span>{liability.mobileNo || liability.phoneNumber || "—"}</span>;
      case "code":
        return <span>{liability.code || "—"}</span>;
      case "description":
        return (
          <span className="font-medium max-w-xs truncate block">
            {liability.description || "—"}
          </span>
        );
      case "createdAt":
        return formatDate(liability.createdAt);
      case "updatedAt":
        return formatDate(liability.updatedAt);
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Liability actions">
                <DropdownItem
                  key="view"
                  startContent={<Eye className="h-4 w-4" />}
                  onPress={() => handleView(liability._id)}
                >
                  View Details
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<Edit className="h-4 w-4" />}
                  onPress={() => handleEdit(liability)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
                  startContent={<Trash2 className="h-4 w-4" />}
                  onPress={() => {
                    setLiabilityToDelete(liability);
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
        <h2 className="text-lg font-semibold">Liabilities Management</h2>
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
            Add Liability
          </Button>
        </div>
      </div>

      <Table aria-label="Liabilities table">
        <TableHeader>
          <TableColumn key="name">NAME</TableColumn>
          <TableColumn key="mobileNo">MOBILE NO</TableColumn>
          <TableColumn key="code">CODE</TableColumn>
          <TableColumn key="description">DESCRIPTION</TableColumn>
          <TableColumn key="createdAt">CREATED AT</TableColumn>
          <TableColumn key="updatedAt">UPDATED AT</TableColumn>
          <TableColumn key="actions" className="w-24">
            ACTIONS
          </TableColumn>
        </TableHeader>
        <TableBody 
          items={Array.isArray(data) ? data : []} 
          emptyContent="No liabilities found"
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
              <ModalHeader>Add New Liability</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Name"
                    placeholder="Enter name"
                    value={newLiability.name}
                    onChange={(e) =>
                      setNewLiability({ ...newLiability, name: e.target.value })
                    }
                    isRequired
                    fullWidth
                  />
                  <Input
                    label="Mobile No"
                    placeholder="Enter mobile number"
                    value={newLiability.mobileNo}
                    onChange={(e) =>
                      setNewLiability({
                        ...newLiability,
                        mobileNo: e.target.value,
                      })
                    }
                    fullWidth
                  />
                  <Input
                    label="Code"
                    placeholder="Enter code"
                    value={newLiability.code}
                    onChange={(e) =>
                      setNewLiability({ ...newLiability, code: e.target.value })
                    }
                    fullWidth
                  />
                  <Textarea
                    label="Description"
                    placeholder="Enter description"
                    value={newLiability.description}
                    onChange={(e) =>
                      setNewLiability({
                        ...newLiability,
                        description: e.target.value,
                      })
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
                  {isCreating ? "Creating..." : "Create Liability"}
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
              <ModalHeader>Edit Liability</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Name"
                    value={editedData.name}
                    onChange={(e) =>
                      setEditedData({ ...editedData, name: e.target.value })
                    }
                    isRequired
                    fullWidth
                  />
                  <Input
                    label="Mobile No"
                    value={editedData.mobileNo}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        mobileNo: e.target.value,
                      })
                    }
                    fullWidth
                  />
                  <Input
                    label="Code"
                    value={editedData.code}
                    onChange={(e) =>
                      setEditedData({ ...editedData, code: e.target.value })
                    }
                    fullWidth
                  />
                  <Textarea
                    label="Description"
                    value={editedData.description}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        description: e.target.value,
                      })
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
              <ModalHeader>Liability Details</ModalHeader>
              <ModalBody>
                {viewingLiability && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-lg font-semibold">
                        {viewingLiability.name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mobile No</p>
                      <p className="text-lg">
                        {viewingLiability.mobileNo ||
                          viewingLiability.phoneNumber ||
                          "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Code</p>
                      <p className="text-lg">
                        {viewingLiability.code || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-lg">
                        {viewingLiability.description || "—"}
                      </p>
                    </div>
                    {viewingLiability.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500">Created At</p>
                        <p className="text-sm">{formatDate(viewingLiability.createdAt)}</p>
                      </div>
                    )}
                    {viewingLiability.updatedAt && (
                      <div>
                        <p className="text-sm text-gray-500">Updated At</p>
                        <p className="text-sm">{formatDate(viewingLiability.updatedAt)}</p>
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
              <ModalHeader>Delete Liability</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this liability?</p>
                {liabilityToDelete?.description && (
                  <p className="text-sm font-medium mt-2">"{liabilityToDelete.description}"</p>
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

export default LiabilitiesTable;
