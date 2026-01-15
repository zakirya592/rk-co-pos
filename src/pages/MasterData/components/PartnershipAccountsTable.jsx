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

const PartnershipAccountsTable = ({ data, onRefresh }) => {
  const [editingId, setEditingId] = useState(null);
  const [viewingPartnership, setViewingPartnership] = useState(null);
  const [editedData, setEditedData] = useState({ 
    partnerName: "", 
    phoneNumber: "", 
    sharePercentage: "",
    openingBalance: ""
  });
  const [newPartnership, setNewPartnership] = useState({ 
    partnerName: "", 
    phoneNumber: "", 
    sharePercentage: "",
    openingBalance: ""
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
      partnerName: partnership.partnerName || "",
      phoneNumber: partnership.phoneNumber || "",
      sharePercentage: partnership.sharePercentage?.toString() || "",
      openingBalance: partnership.openingBalance?.toString() || "",
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
    setEditedData({ partnerName: "", phoneNumber: "", sharePercentage: "", openingBalance: "" });
    onEditModalChange(false);
  };

  const closeCreateModal = () => {
    setNewPartnership({ partnerName: "", phoneNumber: "", sharePercentage: "", openingBalance: "" });
    onCreateModalChange(false);
  };

  const handleSave = async (id) => {
    if (!editedData.partnerName.trim()) {
      toast.error("Please enter partner name");
      return;
    }
    if (!editedData.sharePercentage || parseFloat(editedData.sharePercentage) < 0 || parseFloat(editedData.sharePercentage) > 100) {
      toast.error("Please enter a valid share percentage (0-100)");
      return;
    }
    if (!editedData.openingBalance || parseFloat(editedData.openingBalance) < 0) {
      toast.error("Please enter a valid opening balance");
      return;
    }

    try {
      setIsSubmitting(true);
      await userRequest.put(`/partnership-accounts/${id}`, {
        partnerName: editedData.partnerName,
        phoneNumber: editedData.phoneNumber,
        sharePercentage: editedData.sharePercentage,
        openingBalance: editedData.openingBalance,
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
    if (!newPartnership.partnerName.trim()) {
      toast.error("Please enter partner name");
      return;
    }
    if (!newPartnership.sharePercentage || parseFloat(newPartnership.sharePercentage) < 0 || parseFloat(newPartnership.sharePercentage) > 100) {
      toast.error("Please enter a valid share percentage (0-100)");
      return;
    }
    if (!newPartnership.openingBalance || parseFloat(newPartnership.openingBalance) < 0) {
      toast.error("Please enter a valid opening balance");
      return;
    }

    try {
      setIsCreating(true);
      await userRequest.post("/partnership-accounts", {
        partnerName: newPartnership.partnerName,
        phoneNumber: newPartnership.phoneNumber,
        sharePercentage: newPartnership.sharePercentage,
        openingBalance: newPartnership.openingBalance,
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

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "0.00";
    return parseFloat(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPercentage = (value) => {
    if (!value && value !== 0) return "0.00";
    return `${parseFloat(value).toFixed(2)}%`;
  };

  const renderCell = (partnership, columnKey) => {
    switch (columnKey) {
      case "partnerName":
        return <span className="font-medium">{partnership.partnerName || "—"}</span>;
      case "phoneNumber":
        return <span>{partnership.phoneNumber || "—"}</span>;
      case "sharePercentage":
        return (
          <Chip size="sm" color="primary" variant="flat">
            {formatPercentage(partnership.sharePercentage)}
          </Chip>
        );
      case "openingBalance":
        return <span className="font-semibold">{formatCurrency(partnership.openingBalance)}</span>;
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
          <TableColumn key="partnerName">PARTNER NAME</TableColumn>
          <TableColumn key="phoneNumber">PHONE NUMBER</TableColumn>
          <TableColumn key="sharePercentage">SHARE PERCENTAGE</TableColumn>
          <TableColumn key="openingBalance">OPENING BALANCE</TableColumn>
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
                    label="Partner Name"
                    placeholder="Enter partner name"
                    value={newPartnership.partnerName}
                    onChange={(e) =>
                      setNewPartnership({ ...newPartnership, partnerName: e.target.value })
                    }
                    isRequired
                    fullWidth
                  />
                  <Input
                    label="Phone Number"
                    placeholder="Enter phone number"
                    value={newPartnership.phoneNumber}
                    onChange={(e) =>
                      setNewPartnership({ ...newPartnership, phoneNumber: e.target.value })
                    }
                    fullWidth
                  />
                  <Input
                    label="Share Percentage"
                    type="number"
                    placeholder="Enter share percentage (0-100)"
                    value={newPartnership.sharePercentage}
                    onChange={(e) =>
                      setNewPartnership({ ...newPartnership, sharePercentage: e.target.value })
                    }
                    isRequired
                    min="0"
                    max="100"
                    step="0.01"
                    fullWidth
                    description="Enter percentage between 0 and 100"
                  />
                  <Input
                    label="Opening Balance"
                    type="number"
                    placeholder="Enter opening balance"
                    value={newPartnership.openingBalance}
                    onChange={(e) =>
                      setNewPartnership({ ...newPartnership, openingBalance: e.target.value })
                    }
                    isRequired
                    min="0"
                    step="0.01"
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
                    label="Partner Name"
                    value={editedData.partnerName}
                    onChange={(e) =>
                      setEditedData({ ...editedData, partnerName: e.target.value })
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
                  <Input
                    label="Share Percentage"
                    type="number"
                    value={editedData.sharePercentage}
                    onChange={(e) =>
                      setEditedData({ ...editedData, sharePercentage: e.target.value })
                    }
                    isRequired
                    min="0"
                    max="100"
                    step="0.01"
                    fullWidth
                    description="Enter percentage between 0 and 100"
                  />
                  <Input
                    label="Opening Balance"
                    type="number"
                    value={editedData.openingBalance}
                    onChange={(e) =>
                      setEditedData({ ...editedData, openingBalance: e.target.value })
                    }
                    isRequired
                    min="0"
                    step="0.01"
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
                      <p className="text-sm text-gray-500">Partner Name</p>
                      <p className="text-lg font-semibold">{viewingPartnership.partnerName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-lg">{viewingPartnership.phoneNumber || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Share Percentage</p>
                      <Chip size="sm" color="primary" variant="flat">
                        {formatPercentage(viewingPartnership.sharePercentage)}
                      </Chip>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Opening Balance</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(viewingPartnership.openingBalance)}
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
