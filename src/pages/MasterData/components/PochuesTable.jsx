import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Checkbox,
  Spinner,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { toast } from "react-hot-toast";
import { Plus, MoreVertical, Edit, Trash2, RefreshCw } from "lucide-react";
import userRequest from "../../../utils/userRequest";

const PochuesTable = ({ data: initialData, packingUnits = [], onRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingPochue, setEditingPochue] = useState(null);
  const [pochueToDelete, setPochueToDelete] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPochue, setNewPochue] = useState({
    name: "",
    isActive: true,
    packingUnit: "",
  });
  const [editedData, setEditedData] = useState({
    name: "",
    isActive: true,
    packingUnit: "",
  });

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

  // Handle Enter key: move to next field or submit
  const handleEnterKey = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const form = e.target.closest('[role="dialog"]');
    if (!form) return;

    const elements = Array.from(form.querySelectorAll('input, select')).filter(
      (el) =>
        !el.disabled &&
        el.type !== "hidden" &&
        el.tabIndex !== -1 &&
        typeof el.focus === "function"
    );

    const index = elements.indexOf(e.target);
    if (index === -1) return;

    const next = elements[index + 1];
    if (next) {
      next.focus();
    } else {
      // Last field: trigger submit button
      const submitButton = form.querySelector('button[color="primary"]');
      if (submitButton && !isSubmitting && newPochue.name.trim() && newPochue.packingUnit) {
        handleAdd();
      }
    }
  };

  const handleAdd = async () => {
    if (!newPochue.packingUnit) {
      toast.error("Please select a packing unit");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await userRequest.post("/pochues", {
        name: newPochue.name,
        isActive: newPochue.isActive,
        packingUnit: newPochue.packingUnit,
      });
      toast.success("Pochue added successfully");
      onRefresh();
      setNewPochue({ name: "", isActive: true, packingUnit: "" });
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add pochue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (pochue) => {
    setEditingPochue(pochue);
    setEditedData({
      name: pochue.name,
      isActive: pochue.isActive,
      packingUnit: pochue.packingUnit?._id || "",
    });
    onEditModalOpen();
  };

  const closeEditModal = () => {
    setEditingPochue(null);
    onEditModalChange(false);
  };

  const handleSave = async () => {
    if (!editingPochue || !editedData.packingUnit) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await userRequest.put(`/pochues/${editingPochue._id}`, {
        name: editedData.name,
        isActive: editedData.isActive,
        packingUnit: editedData.packingUnit,
      });
      toast.success("Pochue updated successfully");
      onRefresh();
      closeEditModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update pochue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pochueToDelete) return;
    
    try {
      setIsDeleting(true);
      await userRequest.delete(`/pochues/${pochueToDelete._id}`);
      toast.success("Pochue deleted successfully");
      onRefresh();
      onDeleteModalChange(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete pochue");
    } finally {
      setIsDeleting(false);
      setPochueToDelete(null);
    }
  };

  const renderCell = (pochue, columnKey) => {
    switch (columnKey) {
      case "name":
        return pochue.name;
      case "packingUnit":
        return pochue.packingUnit?.name || "N/A";
      case "status":
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${pochue.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {pochue.isActive ? 'Active' : 'Inactive'}
          </span>
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  startContent={<Edit className="h-4 w-4" />}
                  onPress={() => handleEdit(pochue)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  startContent={<Trash2 className="h-4 w-4" />}
                  className="text-danger"
                  color="danger"
                  onPress={() => {
                    setPochueToDelete(pochue);
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
        <h2 className="text-lg font-semibold">Pochues</h2>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            color="primary"
            onPress={() => setIsAddModalOpen(true)}
            startContent={<Plus className="h-4 w-4" />}
          >
            Add New
          </Button>
          <Button
            size="sm"
            color="primary"
            variant="light"
            startContent={<RefreshCw className="h-4 w-4" />}
            onPress={onRefresh}
            isDisabled={isSubmitting || isDeleting}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Table 
        aria-label="Pochues table"
        classNames={{
          wrapper: initialData?.length === 0 ? 'min-h-[200px]' : '',
        }}
      >
        <TableHeader>
          <TableColumn key="name">NAME</TableColumn>
          <TableColumn key="packingUnit">PACKING UNIT</TableColumn>
          <TableColumn key="status">STATUS</TableColumn>
          <TableColumn key="actions" className="w-24">
            ACTIONS
          </TableColumn>
        </TableHeader>
        <TableBody 
          items={initialData || []}
          emptyContent={
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-foreground-500">No data available</p>
              <p className="text-sm text-foreground-400">Add a new pochue to get started</p>
            </div>
          }
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

      {/* Add New Modal */}
      <Modal isOpen={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add New Pochue</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    label="Name"
                    value={newPochue.name}
                    onChange={(e) =>
                      setNewPochue({ ...newPochue, name: e.target.value })
                    }
                    onKeyDown={handleEnterKey}
                  />
                  <Select
                    label="Packing Unit"
                    placeholder="Select a packing unit"
                    className="w-full"
                    selectedKeys={newPochue.packingUnit ? [newPochue.packingUnit] : []}
                    onChange={(e) =>
                      setNewPochue({ ...newPochue, packingUnit: e.target.value })
                    }
                    onKeyDown={handleEnterKey}
                    isRequired
                  >
                    {packingUnits?.map((unit) => (
                      <SelectItem key={unit._id} value={unit._id}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </Select>
                  <Checkbox
                    isSelected={newPochue.isActive}
                    onValueChange={(value) =>
                      setNewPochue({ ...newPochue, isActive: value })
                    }
                  >
                    Active
                  </Checkbox>
                </div>
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
                  color="primary"
                  onPress={handleAdd}
                  isDisabled={!newPochue.name.trim()}
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Pochue"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onOpenChange={onEditModalChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit Pochue</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    label="Name"
                    value={editedData.name}
                    onChange={(e) =>
                      setEditedData({ ...editedData, name: e.target.value })
                    }
                  />
                  <Select
                    label="Packing Unit"
                    placeholder="Select a packing unit"
                    className="w-full"
                    selectedKeys={editedData.packingUnit ? [editedData.packingUnit] : []}
                    onChange={(e) =>
                      setEditedData({ ...editedData, packingUnit: e.target.value })
                    }
                    isRequired
                  >
                    {packingUnits?.map((unit) => (
                      <SelectItem key={unit._id} value={unit._id}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </Select>
                  <Checkbox
                    isSelected={editedData.isActive}
                    onValueChange={(value) =>
                      setEditedData({ ...editedData, isActive: value })
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
                  onPress={handleSave}
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
              <ModalHeader>Delete Pochue</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete "{pochueToDelete?.name}"?</p>
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

export default PochuesTable;
