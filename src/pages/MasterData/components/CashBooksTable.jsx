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
  Select,
  SelectItem,
  Chip,
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

const CashBooksTable = ({ data, onRefresh }) => {
  const [editingId, setEditingId] = useState(null);
  const [viewingCashBook, setViewingCashBook] = useState(null);
  const [editedData, setEditedData] = useState({ 
    description: "", 
    amount: "", 
    type: "debit"
  });
  const [newCashBook, setNewCashBook] = useState({ 
    description: "", 
    amount: "", 
    type: "debit"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [cashBookToDelete, setCashBookToDelete] = useState(null);
  
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

  const cashBookTypes = [
    { key: "debit", label: "Debit" },
    { key: "credit", label: "Credit" },
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case "debit":
        return "danger";
      case "credit":
        return "success";
      default:
        return "default";
    }
  };

  const handleEdit = (cashBook) => {
    setEditingId(cashBook._id);
    setEditedData({
      description: cashBook.description || "",
      type: cashBook.type || "debit",
      amount: cashBook.amount?.toString() || "",
    });
    onEditModalOpen();
  };

  const handleView = async (cashBookId) => {
    try {
      const response = await userRequest.get(`/cash-books/${cashBookId}`);
      // Handle nested structure: data.data.cashBook (singular)
      const cashBook = response.data?.data?.cashBook || 
                      response.data?.data || 
                      response.data;
      setViewingCashBook(cashBook);
      onViewModalOpen();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch cash book details"
      );
    }
  };

  const closeEditModal = () => {
    setEditingId(null);
    setEditedData({ description: "", amount: "", type: "debit" });
    onEditModalChange(false);
  };

  const closeCreateModal = () => {
    setNewCashBook({ description: "", amount: "", type: "debit" });
    onCreateModalChange(false);
  };

  const handleSave = async (id) => {
    if (!editedData.description.trim()) {
      toast.error("Please enter description");
      return;
    }
    if (!editedData.amount || parseFloat(editedData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsSubmitting(true);
      await userRequest.put(`/cash-books/${id}`, {
        description: editedData.description,
        amount: editedData.amount,
        type: editedData.type,
      });
      toast.success("Cash book entry updated successfully");
      onRefresh();
      closeEditModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update cash book entry"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!newCashBook.description.trim()) {
      toast.error("Please enter description");
      return;
    }
    if (!newCashBook.amount || parseFloat(newCashBook.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsCreating(true);
      await userRequest.post("/cash-books", {
        description: newCashBook.description,
        amount: newCashBook.amount,
        type: newCashBook.type,
      });
      toast.success("Cash book entry created successfully");
      closeCreateModal();
      onRefresh();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create cash book entry"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!cashBookToDelete) return;

    try {
      setIsDeleting(true);
      await userRequest.delete(`/cash-books/${cashBookToDelete._id}`);
      toast.success("Cash book entry deleted successfully");
      onRefresh();
      onDeleteModalChange(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete cash book entry"
      );
    } finally {
      setIsDeleting(false);
      setCashBookToDelete(null);
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

  const renderCell = (cashBook, columnKey) => {
    switch (columnKey) {
      case "description":
        return (
          <span className="font-medium max-w-xs truncate block">
            {cashBook.description || "—"}
          </span>
        );
      case "type":
        return (
          <Chip
            size="sm"
            color={getTypeColor(cashBook.type)}
            variant="flat"
          >
            {cashBook.type
              ? cashBook.type.charAt(0).toUpperCase() +
                cashBook.type.slice(1)
              : "—"}
          </Chip>
        );
      case "amount":
        return <span className="font-semibold">{formatCurrency(cashBook.amount)}</span>;
      case "createdAt":
        return formatDate(cashBook.createdAt);
      case "updatedAt":
        return formatDate(cashBook.updatedAt);
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Cash book actions">
                <DropdownItem
                  key="view"
                  startContent={<Eye className="h-4 w-4" />}
                  onPress={() => handleView(cashBook._id)}
                >
                  View Details
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<Edit className="h-4 w-4" />}
                  onPress={() => handleEdit(cashBook)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
                  startContent={<Trash2 className="h-4 w-4" />}
                  onPress={() => {
                    setCashBookToDelete(cashBook);
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
        <h2 className="text-lg font-semibold">Cash Books Management</h2>
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
            Add Cash Book Entry
          </Button>
        </div>
      </div>

      <Table aria-label="Cash books table">
        <TableHeader>
          <TableColumn key="description">DESCRIPTION</TableColumn>
          <TableColumn key="type">TYPE</TableColumn>
          <TableColumn key="amount">AMOUNT</TableColumn>
          <TableColumn key="createdAt">CREATED AT</TableColumn>
          <TableColumn key="updatedAt">UPDATED AT</TableColumn>
          <TableColumn key="actions" className="w-24">
            ACTIONS
          </TableColumn>
        </TableHeader>
        <TableBody 
          items={Array.isArray(data) ? data : []} 
          emptyContent="No cash book entries found"
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
              <ModalHeader>Add New Cash Book Entry</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Textarea
                    label="Description"
                    placeholder="Enter cash book entry description"
                    value={newCashBook.description}
                    onChange={(e) =>
                      setNewCashBook({ ...newCashBook, description: e.target.value })
                    }
                    isRequired
                    minRows={3}
                    fullWidth
                  />
                  <Select
                    label="Type"
                    placeholder="Select type"
                    selectedKeys={[newCashBook.type]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0];
                      setNewCashBook({ ...newCashBook, type: selected });
                    }}
                    isRequired
                  >
                    {cashBookTypes.map((type) => (
                      <SelectItem key={type.key} value={type.key}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="Amount"
                    type="number"
                    placeholder="Enter amount"
                    value={newCashBook.amount}
                    onChange={(e) =>
                      setNewCashBook({ ...newCashBook, amount: e.target.value })
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
              <ModalHeader>Edit Cash Book Entry</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Textarea
                    label="Description"
                    value={editedData.description}
                    onChange={(e) =>
                      setEditedData({ ...editedData, description: e.target.value })
                    }
                    isRequired
                    minRows={3}
                    fullWidth
                  />
                  <Select
                    label="Type"
                    selectedKeys={[editedData.type]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0];
                      setEditedData({ ...editedData, type: selected });
                    }}
                    isRequired
                  >
                    {cashBookTypes.map((type) => (
                      <SelectItem key={type.key} value={type.key}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="Amount"
                    type="number"
                    value={editedData.amount}
                    onChange={(e) =>
                      setEditedData({ ...editedData, amount: e.target.value })
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
              <ModalHeader>Cash Book Entry Details</ModalHeader>
              <ModalBody>
                {viewingCashBook && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-lg font-semibold">{viewingCashBook.description || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <Chip
                        size="sm"
                        color={getTypeColor(viewingCashBook.type)}
                        variant="flat"
                      >
                        {viewingCashBook.type
                          ? viewingCashBook.type.charAt(0).toUpperCase() +
                            viewingCashBook.type.slice(1)
                          : "—"}
                      </Chip>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(viewingCashBook.amount)}
                      </p>
                    </div>
                    {viewingCashBook.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500">Created At</p>
                        <p className="text-sm">{formatDate(viewingCashBook.createdAt)}</p>
                      </div>
                    )}
                    {viewingCashBook.updatedAt && (
                      <div>
                        <p className="text-sm text-gray-500">Updated At</p>
                        <p className="text-sm">{formatDate(viewingCashBook.updatedAt)}</p>
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
              <ModalHeader>Delete Cash Book Entry</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this cash book entry?</p>
                {cashBookToDelete?.description && (
                  <p className="text-sm font-medium mt-2">"{cashBookToDelete.description}"</p>
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

export default CashBooksTable;
