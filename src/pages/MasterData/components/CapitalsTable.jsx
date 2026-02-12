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
import FinancialPaymentsSection from "./FinancialPaymentsSection";

const CapitalsTable = ({ data, onRefresh }) => {
  const [editingId, setEditingId] = useState(null);
  const [viewingCapital, setViewingCapital] = useState(null);
  const [editedData, setEditedData] = useState({
    name: "",
    mobileNo: "",
    code: "",
    description: "",
  });
  const [newCapital, setNewCapital] = useState({
    name: "",
    mobileNo: "",
    code: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [capitalToDelete, setCapitalToDelete] = useState(null);
  
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

  const handleEdit = (capital) => {
    setEditingId(capital._id);
    setEditedData({
      name: capital.name || "",
      mobileNo: capital.mobileNo || capital.phoneNumber || "",
      code: capital.code || "",
      description: capital.description || "",
    });
    onEditModalOpen();
  };

  const handleView = async (capitalId) => {
    try {
      const response = await userRequest.get(`/capitals/${capitalId}`);
      // Handle nested structure: data.data.capital (singular)
      const capital = response.data?.data?.capital || 
                     response.data?.data || 
                     response.data;
      setViewingCapital(capital);
      onViewModalOpen();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch capital details"
      );
    }
  };

  const closeEditModal = () => {
    setEditingId(null);
    setEditedData({ name: "", mobileNo: "", code: "", description: "" });
    onEditModalChange(false);
  };

  const closeCreateModal = () => {
    setNewCapital({ name: "", mobileNo: "", code: "", description: "" });
    onCreateModalChange(false);
  };

  const handleSave = async (id) => {
    if (!editedData.name.trim()) {
      toast.error("Please enter name");
      return;
    }

    try {
      setIsSubmitting(true);
      await userRequest.put(`/capitals/${id}`, {
        name: editedData.name,
        mobileNo: editedData.mobileNo,
        code: editedData.code,
        description: editedData.description,
      });
      toast.success("Capital entry updated successfully");
      onRefresh();
      closeEditModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update capital entry"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!newCapital.name.trim()) {
      toast.error("Please enter name");
      return;
    }

    try {
      setIsCreating(true);
      await userRequest.post("/capitals", {
        name: newCapital.name,
        mobileNo: newCapital.mobileNo,
        code: newCapital.code,
        description: newCapital.description,
      });
      toast.success("Capital entry created successfully");
      closeCreateModal();
      onRefresh();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create capital entry"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!capitalToDelete) return;

    try {
      setIsDeleting(true);
      await userRequest.delete(`/capitals/${capitalToDelete._id}`);
      toast.success("Capital entry deleted successfully");
      onRefresh();
      onDeleteModalChange(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete capital entry"
      );
    } finally {
      setIsDeleting(false);
      setCapitalToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderCell = (capital, columnKey) => {
    switch (columnKey) {
      case "name":
        return <span className="font-medium">{capital.name || "—"}</span>;
      case "mobileNo":
        return <span>{capital.mobileNo || capital.phoneNumber || "—"}</span>;
      case "code":
        return <span>{capital.code || "—"}</span>;
      case "description":
        return (
          <span className="font-medium max-w-xs truncate block">
            {capital.description || "—"}
          </span>
        );
      case "createdAt":
        return formatDate(capital.createdAt);
      case "updatedAt":
        return formatDate(capital.updatedAt);
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Capital actions">
                <DropdownItem
                  key="view"
                  startContent={<Eye className="h-4 w-4" />}
                  onPress={() => handleView(capital._id)}
                >
                  View Details
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<Edit className="h-4 w-4" />}
                  onPress={() => handleEdit(capital)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
                  startContent={<Trash2 className="h-4 w-4" />}
                  onPress={() => {
                    setCapitalToDelete(capital);
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
        <h2 className="text-lg font-semibold">Capitals Management</h2>
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
            Add Capital Entry
          </Button>
        </div>
      </div>

      <Table aria-label="Capitals table">
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
          emptyContent="No capital entries found"
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
              <ModalHeader>Add New Capital Entry</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Name"
                    placeholder="Enter name"
                    value={newCapital.name}
                    onChange={(e) =>
                      setNewCapital({ ...newCapital, name: e.target.value })
                    }
                    isRequired
                    fullWidth
                  />
                  <Input
                    label="Mobile No"
                    placeholder="Enter mobile number"
                    value={newCapital.mobileNo}
                    onChange={(e) =>
                      setNewCapital({
                        ...newCapital,
                        mobileNo: e.target.value,
                      })
                    }
                    fullWidth
                  />
                  <Input
                    label="Code"
                    placeholder="Enter code"
                    value={newCapital.code}
                    onChange={(e) =>
                      setNewCapital({ ...newCapital, code: e.target.value })
                    }
                    fullWidth
                  />
                  <Textarea
                    label="Description"
                    placeholder="Enter description"
                    value={newCapital.description}
                    onChange={(e) =>
                      setNewCapital({
                        ...newCapital,
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
                  {isCreating ? "Creating..." : "Create Entry"}
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
              <ModalHeader>Edit Capital Entry</ModalHeader>
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
              <ModalHeader>Capital Entry Details</ModalHeader>
              <ModalBody>
                {viewingCapital && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-lg font-semibold">
                        {viewingCapital.name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mobile No</p>
                      <p className="text-lg">
                        {viewingCapital.mobileNo ||
                          viewingCapital.phoneNumber ||
                          "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Code</p>
                      <p className="text-lg">
                        {viewingCapital.code || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-lg">
                        {viewingCapital.description || "—"}
                      </p>
                    </div>
                    {viewingCapital.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500">Created At</p>
                        <p className="text-sm">{formatDate(viewingCapital.createdAt)}</p>
                      </div>
                    )}
                    {viewingCapital.updatedAt && (
                      <div>
                        <p className="text-sm text-gray-500">Updated At</p>
                        <p className="text-sm">{formatDate(viewingCapital.updatedAt)}</p>
                      </div>
                    )}
                    <FinancialPaymentsSection
                      relatedModel="Capital"
                      relatedId={viewingCapital._id}
                    />
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
              <ModalHeader>Delete Capital Entry</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this capital entry?</p>
                {capitalToDelete?.description && (
                  <p className="text-sm font-medium mt-2">"{capitalToDelete.description}"</p>
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

export default CapitalsTable;
