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

const PartnershipAccountsTable = ({ data, onRefresh }) => {
  const [editingId, setEditingId] = useState(null);
  const [viewingPartnership, setViewingPartnership] = useState(null);
  const [editedData, setEditedData] = useState({
    name: "",
    mobileNo: "",
    code: "",
    description: "",
  });
  const [newPartnership, setNewPartnership] = useState({
    name: "",
    mobileNo: "",
    code: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [partnershipToDelete, setPartnershipToDelete] = useState(null);
  
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

  const handleEdit = (partnership) => {
    setEditingId(partnership._id);
    setEditedData({
      name: partnership.name || partnership.partnerName || "",
      mobileNo: partnership.mobileNo || partnership.phoneNumber || "",
      code: partnership.code || "",
      description: partnership.description || "",
    });
    onEditModalOpen();
  };

  const handleView = async (partnershipId) => {
    try {
      const response = await userRequest.get(`/partnership-accounts/${partnershipId}`);
      // Handle nested structure: data.data.partnershipAccount (singular)
      const partnership = response.data?.data?.partnershipAccount || 
                          response.data?.data?.partnership || 
                          response.data?.data || 
                          response.data;
      setViewingPartnership(partnership);
      onViewModalOpen();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch partnership account details"
      );
    }
  };

  const closeEditModal = () => {
    setEditingId(null);
    setEditedData({ name: "", mobileNo: "", code: "", description: "" });
    onEditModalChange(false);
  };

  const closeCreateModal = () => {
    setNewPartnership({ name: "", mobileNo: "", code: "", description: "" });
    onCreateModalChange(false);
  };

  const handleSave = async (id) => {
    if (!editedData.name.trim()) {
      toast.error("Please enter name");
      return;
    }

    try {
      setIsSubmitting(true);
      await userRequest.put(`/partnership-accounts/${id}`, {
        name: editedData.name,
        mobileNo: editedData.mobileNo,
        code: editedData.code,
        description: editedData.description,
      });
      toast.success("Partnership account updated successfully");
      onRefresh();
      closeEditModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update partnership account"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!newPartnership.name.trim()) {
      toast.error("Please enter name");
      return;
    }

    try {
      setIsCreating(true);
      await userRequest.post("/partnership-accounts", {
        name: newPartnership.name,
        mobileNo: newPartnership.mobileNo,
        code: newPartnership.code,
        description: newPartnership.description,
      });
      toast.success("Partnership account created successfully");
      closeCreateModal();
      onRefresh();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create partnership account"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!partnershipToDelete) return;

    try {
      setIsDeleting(true);
      await userRequest.delete(`/partnership-accounts/${partnershipToDelete._id}`);
      toast.success("Partnership account deleted successfully");
      onRefresh();
      onDeleteModalChange(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete partnership account"
      );
    } finally {
      setIsDeleting(false);
      setPartnershipToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderCell = (partnership, columnKey) => {
    switch (columnKey) {
      case "name":
        return (
          <span className="font-medium">
            {partnership.name || partnership.partnerName || "—"}
          </span>
        );
      case "mobileNo":
        return (
          <span>
            {partnership.mobileNo || partnership.phoneNumber || "—"}
          </span>
        );
      case "code":
        return <span>{partnership.code || "—"}</span>;
      case "description":
        return (
          <span className="max-w-xs truncate block">
            {partnership.description || "—"}
          </span>
        );
      case "createdAt":
        return formatDate(partnership.createdAt);
      case "updatedAt":
        return formatDate(partnership.updatedAt);
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Partnership account actions">
                <DropdownItem
                  key="view"
                  startContent={<Eye className="h-4 w-4" />}
                  onPress={() => handleView(partnership._id)}
                >
                  View Details
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<Edit className="h-4 w-4" />}
                  onPress={() => handleEdit(partnership)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
                  startContent={<Trash2 className="h-4 w-4" />}
                  onPress={() => {
                    setPartnershipToDelete(partnership);
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
        <h2 className="text-lg font-semibold">Partnership Accounts Management</h2>
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
            Add Partnership Account
          </Button>
        </div>
      </div>

      <Table aria-label="Partnership accounts table">
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
          emptyContent="No partnership accounts found"
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
              <ModalHeader>Add New Partnership Account</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Name"
                    placeholder="Enter name"
                    value={newPartnership.name}
                    onChange={(e) =>
                      setNewPartnership({ ...newPartnership, name: e.target.value })
                    }
                    isRequired
                    fullWidth
                  />
                  <Input
                    label="Mobile No"
                    placeholder="Enter mobile number"
                    value={newPartnership.mobileNo}
                    onChange={(e) =>
                      setNewPartnership({
                        ...newPartnership,
                        mobileNo: e.target.value,
                      })
                    }
                    fullWidth
                  />
                  <Input
                    label="Code"
                    placeholder="Enter code"
                    value={newPartnership.code}
                    onChange={(e) =>
                      setNewPartnership({ ...newPartnership, code: e.target.value })
                    }
                    fullWidth
                  />
                  <Textarea
                    label="Description"
                    placeholder="Enter description"
                    value={newPartnership.description}
                    onChange={(e) =>
                      setNewPartnership({
                        ...newPartnership,
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
                  {isCreating ? "Creating..." : "Create Partnership Account"}
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
              <ModalHeader>Edit Partnership Account</ModalHeader>
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
              <ModalHeader>Partnership Account Details</ModalHeader>
              <ModalBody>
                {viewingPartnership && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-lg font-semibold">
                        {viewingPartnership.name ||
                          viewingPartnership.partnerName ||
                          "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mobile No</p>
                      <p className="text-lg">
                        {viewingPartnership.mobileNo ||
                          viewingPartnership.phoneNumber ||
                          "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Code</p>
                      <p className="text-lg">
                        {viewingPartnership.code || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-lg">
                        {viewingPartnership.description || "—"}
                      </p>
                    </div>
                    {viewingPartnership.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500">Created At</p>
                        <p className="text-sm">{formatDate(viewingPartnership.createdAt)}</p>
                      </div>
                    )}
                    {viewingPartnership.updatedAt && (
                      <div>
                        <p className="text-sm text-gray-500">Updated At</p>
                        <p className="text-sm">{formatDate(viewingPartnership.updatedAt)}</p>
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
              <ModalHeader>Delete Partnership Account</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this partnership account?</p>
                {partnershipToDelete?.partnerName && (
                  <p className="text-sm font-medium mt-2">"{partnershipToDelete.partnerName}"</p>
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

export default PartnershipAccountsTable;
