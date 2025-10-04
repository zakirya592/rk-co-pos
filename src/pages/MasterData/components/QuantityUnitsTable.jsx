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
import { Plus, MoreVertical, Edit, Trash2, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import userRequest from "../../../utils/userRequest";

const QuantityUnitsTable = ({ data, onRefresh }) => {
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({ name: "", isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
  const [unitToDelete, setUnitToDelete] = useState(null);
  const [newUnit, setNewUnit] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleEdit = (unit) => {
    setEditingId(unit._id);
    setEditedData({
      name: unit.name,
      isActive: unit.isActive !== false, // default to true if undefined
    });
    onEditModalOpen();
  };

  const closeEditModal = () => {
    setEditingId(null);
    onEditModalChange(false);
  };

  const handleSave = async (id) => {
    try {
      setIsSubmitting(true);
      await userRequest.put(`/quantity-units/${id}`, {
        name: editedData.name,
        isActive: editedData.isActive,
      });
      toast.success("Quantity unit updated successfully");
      onRefresh();
      closeEditModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update quantity unit"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!unitToDelete) return;

    try {
      setIsDeleting(true);
      await userRequest.delete(`/quantity-units/${unitToDelete._id}`);
      toast.success("Quantity unit deleted successfully");
      onRefresh();
      onDeleteModalChange(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete quantity unit"
      );
    } finally {
      setIsDeleting(false);
      setUnitToDelete(null);
    }
  };

  const handleCreate = async () => {
    if (!newUnit.trim()) {
      toast.error("Please enter a unit name");
      return;
    }

    try {
      setIsCreating(true);
      await userRequest.post("/quantity-units", {
        name: newUnit,
      });
      toast.success("Quantity unit created successfully");
      setNewUnit("");
      onRefresh();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create quantity unit"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderCell = (unit, columnKey) => {
    switch (columnKey) {
      case "id":
        return unit.id || "—";
      case "name":
        return editingId === unit._id ? (
          <Input
            size="sm"
            value={editedData.name}
            onChange={(e) =>
              setEditedData({ ...editedData, name: e.target.value })
            }
            className="w-40"
            autoFocus
          />
        ) : (
          unit.name
        );
      case "isActive":
        if (editingId === unit._id) {
          return (
            <Checkbox
              isSelected={editedData.isActive}
              onValueChange={(isSelected) =>
                setEditedData({ ...editedData, isActive: isSelected })
              }
            />
          );
        }
        return (
          <Chip
            size="sm"
            color={unit.isActive ? "success" : "danger"}
            variant="flat"
          >
            {unit.isActive ? "Active" : "Inactive"}
          </Chip>
        );
      case "createdAt":
        return formatDate(unit.createdAt);
      case "updatedAt":
        return formatDate(unit.updatedAt);
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Quantity unit actions">
                <DropdownItem
                  key="edit"
                  startContent={<Edit className="h-4 w-4" />}
                  onPress={() => handleEdit(unit)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
                  startContent={<Trash2 className="h-4 w-4" />}
                  onPress={() => {
                    setUnitToDelete(unit);
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
        <h2 className="text-lg font-semibold">Quantity Units</h2>
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
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          size="sm"
          placeholder="New unit name"
          value={newUnit}
          onChange={(e) => setNewUnit(e.target.value)}
          className="w-full sm:w-64"
        />
        <Button
          size="sm"
          color="primary"
          isLoading={isCreating}
          onPress={handleCreate}
          startContent={<Plus className="h-4 w-4" />}
        >
          Add Unit
        </Button>
      </div>

      <Table aria-label="Quantity units table">
        <TableHeader>
          <TableColumn key="name">NAME</TableColumn>
          <TableColumn key="isActive">STATUS</TableColumn>
          <TableColumn key="actions" className="w-24">
            ACTIONS
          </TableColumn>
        </TableHeader>
        <TableBody items={data}>
          {(item) => (
            <TableRow key={item._id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onOpenChange={onEditModalChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit Quantity Unit</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Name"
                    value={editedData.name}
                    onChange={(e) =>
                      setEditedData({ ...editedData, name: e.target.value })
                    }
                    fullWidth
                  />
                  <Checkbox
                    isSelected={editedData.isActive}
                    onValueChange={(isSelected) =>
                      setEditedData({ ...editedData, isActive: isSelected })
                    }
                  >
                    Active
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onOpenChange={onDeleteModalChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete Quantity Unit</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete "{unitToDelete?.name}"?</p>
                <p className="text-sm text-foreground-500">
                  This action cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                  isDisabled={isSubmitting}
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

export default QuantityUnitsTable;
