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

const IncomesTable = ({ data, onRefresh }) => {
  const [editingId, setEditingId] = useState(null);
  const [viewingIncome, setViewingIncome] = useState(null);
  const [editedData, setEditedData] = useState({ 
    description: "", 
    amount: "", 
    sourceType: "sale"
  });
  const [newIncome, setNewIncome] = useState({ 
    description: "", 
    amount: "", 
    sourceType: "sale"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState(null);
  
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

  const sourceTypes = [
    { key: "sale", label: "Sale" },
    { key: "service", label: "Service" },
    { key: "investment", label: "Investment" },
    { key: "other", label: "Other" },
  ];

  const getSourceTypeColor = (type) => {
    switch (type) {
      case "sale":
        return "success";
      case "service":
        return "primary";
      case "investment":
        return "warning";
      case "other":
        return "default";
      default:
        return "default";
    }
  };

  const handleEdit = (income) => {
    setEditingId(income._id);
    setEditedData({
      description: income.description || "",
      sourceType: income.sourceType || "sale",
      amount: income.amount?.toString() || "",
    });
    onEditModalOpen();
  };

  const handleView = async (incomeId) => {
    try {
      const response = await userRequest.get(`/incomes/${incomeId}`);
      // Handle nested structure: data.data.income (singular)
      const income = response.data?.data?.income || response.data?.data || response.data;
      setViewingIncome(income);
      onViewModalOpen();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch income details"
      );
    }
  };

  const closeEditModal = () => {
    setEditingId(null);
    setEditedData({ description: "", amount: "", sourceType: "sale" });
    onEditModalChange(false);
  };

  const closeCreateModal = () => {
    setNewIncome({ description: "", amount: "", sourceType: "sale" });
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
      await userRequest.put(`/incomes/${id}`, {
        description: editedData.description,
        amount: editedData.amount,
        sourceType: editedData.sourceType,
      });
      toast.success("Income updated successfully");
      onRefresh();
      closeEditModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update income"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!newIncome.description.trim()) {
      toast.error("Please enter description");
      return;
    }
    if (!newIncome.amount || parseFloat(newIncome.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsCreating(true);
      await userRequest.post("/incomes", {
        description: newIncome.description,
        amount: newIncome.amount,
        sourceType: newIncome.sourceType,
      });
      toast.success("Income created successfully");
      closeCreateModal();
      onRefresh();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create income"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!incomeToDelete) return;

    try {
      setIsDeleting(true);
      await userRequest.delete(`/incomes/${incomeToDelete._id}`);
      toast.success("Income deleted successfully");
      onRefresh();
      onDeleteModalChange(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete income"
      );
    } finally {
      setIsDeleting(false);
      setIncomeToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatCurrency = (value) => {
    if (!value) return "0.00";
    return parseFloat(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const renderCell = (income, columnKey) => {
    switch (columnKey) {
      case "description":
        return (
          <span className="font-medium max-w-xs truncate block">
            {income.description || "—"}
          </span>
        );
      case "sourceType":
        return (
          <Chip
            size="sm"
            color={getSourceTypeColor(income.sourceType)}
            variant="flat"
          >
            {income.sourceType
              ? income.sourceType.charAt(0).toUpperCase() +
                income.sourceType.slice(1)
              : "—"}
          </Chip>
        );
      case "amount":
        return <span className="font-semibold">{formatCurrency(income.amount)}</span>;
      case "createdAt":
        return formatDate(income.createdAt);
      case "updatedAt":
        return formatDate(income.updatedAt);
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Income actions">
                <DropdownItem
                  key="view"
                  startContent={<Eye className="h-4 w-4" />}
                  onPress={() => handleView(income._id)}
                >
                  View Details
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<Edit className="h-4 w-4" />}
                  onPress={() => handleEdit(income)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
                  startContent={<Trash2 className="h-4 w-4" />}
                  onPress={() => {
                    setIncomeToDelete(income);
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
        <h2 className="text-lg font-semibold">Incomes Management</h2>
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
            Add Income
          </Button>
        </div>
      </div>

      <Table aria-label="Incomes table">
        <TableHeader>
          <TableColumn key="description">DESCRIPTION</TableColumn>
          <TableColumn key="sourceType">SOURCE TYPE</TableColumn>
          <TableColumn key="amount">AMOUNT</TableColumn>
          <TableColumn key="createdAt">CREATED AT</TableColumn>
          <TableColumn key="updatedAt">UPDATED AT</TableColumn>
          <TableColumn key="actions" className="w-24">
            ACTIONS
          </TableColumn>
        </TableHeader>
        <TableBody 
          items={Array.isArray(data) ? data : []} 
          emptyContent="No incomes found"
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
              <ModalHeader>Add New Income</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Textarea
                    label="Description"
                    placeholder="Enter income description"
                    value={newIncome.description}
                    onChange={(e) =>
                      setNewIncome({ ...newIncome, description: e.target.value })
                    }
                    isRequired
                    minRows={3}
                    fullWidth
                  />
                  <Select
                    label="Source Type"
                    placeholder="Select source type"
                    selectedKeys={[newIncome.sourceType]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0];
                      setNewIncome({ ...newIncome, sourceType: selected });
                    }}
                    isRequired
                  >
                    {sourceTypes.map((type) => (
                      <SelectItem key={type.key} value={type.key}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="Amount"
                    type="number"
                    placeholder="Enter income amount"
                    value={newIncome.amount}
                    onChange={(e) =>
                      setNewIncome({ ...newIncome, amount: e.target.value })
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
                  {isCreating ? "Creating..." : "Create Income"}
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
              <ModalHeader>Edit Income</ModalHeader>
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
                    label="Source Type"
                    selectedKeys={[editedData.sourceType]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0];
                      setEditedData({ ...editedData, sourceType: selected });
                    }}
                    isRequired
                  >
                    {sourceTypes.map((type) => (
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
              <ModalHeader>Income Details</ModalHeader>
              <ModalBody>
                {viewingIncome && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-lg font-semibold">{viewingIncome.description || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Source Type</p>
                      <Chip
                        size="sm"
                        color={getSourceTypeColor(viewingIncome.sourceType)}
                        variant="flat"
                      >
                        {viewingIncome.sourceType
                          ? viewingIncome.sourceType.charAt(0).toUpperCase() +
                            viewingIncome.sourceType.slice(1)
                          : "—"}
                      </Chip>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(viewingIncome.amount)}
                      </p>
                    </div>
                    {viewingIncome.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500">Created At</p>
                        <p className="text-sm">{formatDate(viewingIncome.createdAt)}</p>
                      </div>
                    )}
                    {viewingIncome.updatedAt && (
                      <div>
                        <p className="text-sm text-gray-500">Updated At</p>
                        <p className="text-sm">{formatDate(viewingIncome.updatedAt)}</p>
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
              <ModalHeader>Delete Income</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this income?</p>
                {incomeToDelete?.description && (
                  <p className="text-sm font-medium mt-2">"{incomeToDelete.description}"</p>
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

export default IncomesTable;
