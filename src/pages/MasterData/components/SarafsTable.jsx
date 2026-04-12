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

const SarafsTable = ({ data, onRefresh }) => {
  const [editingId, setEditingId] = useState(null);
  const [viewingSaraf, setViewingSaraf] = useState(null);
  const [editedData, setEditedData] = useState({
    name: "",
    mobileNo: "",
    code: "",
    description: "",
  });
  const [newSaraf, setNewSaraf] = useState({
    name: "",
    mobileNo: "",
    code: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [sarafToDelete, setSarafToDelete] = useState(null);

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

  const handleEdit = (saraf) => {
    setEditingId(saraf._id);
    setEditedData({
      name: saraf.name || "",
      mobileNo: saraf.mobileNo || saraf.phoneNumber || "",
      code: saraf.code || "",
      description: saraf.description || "",
    });
    onEditModalOpen();
  };

  const handleView = async (sarafId) => {
    try {
      const response = await userRequest.get(`/sarafs/${sarafId}`);
      const saraf =
        response.data?.data?.saraf ||
        response.data?.data ||
        response.data;
      setViewingSaraf(saraf);
      onViewModalOpen();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch saraf details"
      );
    }
  };

  const closeEditModal = () => {
    setEditingId(null);
    setEditedData({ name: "", mobileNo: "", code: "", description: "" });
    onEditModalChange(false);
  };

  const closeCreateModal = () => {
    setNewSaraf({ name: "", mobileNo: "", code: "", description: "" });
    onCreateModalChange(false);
  };

  const handleSave = async (id) => {
    if (!editedData.name.trim()) {
      toast.error("Please enter name");
      return;
    }

    try {
      setIsSubmitting(true);
      await userRequest.put(`/sarafs/${id}`, {
        name: editedData.name,
        mobileNo: editedData.mobileNo,
        code: editedData.code,
        description: editedData.description,
      });
      toast.success("Saraf updated successfully");
      onRefresh();
      closeEditModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update saraf"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!newSaraf.name.trim()) {
      toast.error("Please enter name");
      return;
    }

    try {
      setIsCreating(true);
      await userRequest.post("/sarafs", {
        name: newSaraf.name,
        mobileNo: newSaraf.mobileNo,
        code: newSaraf.code,
        description: newSaraf.description,
      });
      toast.success("Saraf created successfully");
      closeCreateModal();
      onRefresh();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create saraf"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!sarafToDelete) return;

    try {
      setIsDeleting(true);
      await userRequest.delete(`/sarafs/${sarafToDelete._id}`);
      toast.success("Saraf deleted successfully");
      onRefresh();
      onDeleteModalChange(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete saraf"
      );
    } finally {
      setIsDeleting(false);
      setSarafToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderCell = (saraf, columnKey) => {
    switch (columnKey) {
      case "name":
        return <span className="font-medium">{saraf.name || "—"}</span>;
      case "mobileNo":
        return <span>{saraf.mobileNo || saraf.phoneNumber || "—"}</span>;
      case "code":
        return <span>{saraf.code || "—"}</span>;
      case "description":
        return (
          <span className="font-medium max-w-xs truncate block">
            {saraf.description || "—"}
          </span>
        );
      case "createdAt":
        return formatDate(saraf.createdAt);
      case "updatedAt":
        return formatDate(saraf.updatedAt);
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Saraf actions">
                <DropdownItem
                  key="view"
                  startContent={<Eye className="h-4 w-4" />}
                  onPress={() => handleView(saraf._id)}
                >
                  View Details
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<Edit className="h-4 w-4" />}
                  onPress={() => handleEdit(saraf)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
                  startContent={<Trash2 className="h-4 w-4" />}
                  onPress={() => {
                    setSarafToDelete(saraf);
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
        <h2 className="text-lg font-semibold">Sarafs Management</h2>
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
            Add Saraf
          </Button>
        </div>
      </div>

      <Table aria-label="Sarafs table">
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
          emptyContent="No sarafs found"
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

      <Modal isOpen={isCreateModalOpen} onOpenChange={onCreateModalChange} size="lg">
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Add Saraf</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Name"
                    placeholder="Enter name"
                    value={newSaraf.name}
                    onChange={(e) =>
                      setNewSaraf({ ...newSaraf, name: e.target.value })
                    }
                    isRequired
                    fullWidth
                  />
                  <Input
                    label="Mobile No"
                    placeholder="Enter mobile number"
                    value={newSaraf.mobileNo}
                    onChange={(e) =>
                      setNewSaraf({
                        ...newSaraf,
                        mobileNo: e.target.value,
                      })
                    }
                    fullWidth
                  />
                  <Input
                    label="Code"
                    placeholder="Enter code"
                    value={newSaraf.code}
                    onChange={(e) =>
                      setNewSaraf({ ...newSaraf, code: e.target.value })
                    }
                    fullWidth
                  />
                  <Textarea
                    label="Description"
                    placeholder="Enter description"
                    value={newSaraf.description}
                    onChange={(e) =>
                      setNewSaraf({
                        ...newSaraf,
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
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditModalOpen} onOpenChange={onEditModalChange} size="lg">
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Edit Saraf</ModalHeader>
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

      <Modal isOpen={isViewModalOpen} onOpenChange={onViewModalChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Saraf Details</ModalHeader>
              <ModalBody>
                {viewingSaraf && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-lg font-semibold">
                        {viewingSaraf.name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mobile No</p>
                      <p className="text-lg">
                        {viewingSaraf.mobileNo ||
                          viewingSaraf.phoneNumber ||
                          "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Code</p>
                      <p className="text-lg">{viewingSaraf.code || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-lg">
                        {viewingSaraf.description || "—"}
                      </p>
                    </div>
                    {viewingSaraf.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500">Created At</p>
                        <p className="text-sm">
                          {formatDate(viewingSaraf.createdAt)}
                        </p>
                      </div>
                    )}
                    {viewingSaraf.updatedAt && (
                      <div>
                        <p className="text-sm text-gray-500">Updated At</p>
                        <p className="text-sm">
                          {formatDate(viewingSaraf.updatedAt)}
                        </p>
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

      <Modal isOpen={isDeleteModalOpen} onOpenChange={onDeleteModalChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete Saraf</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this saraf?</p>
                {sarafToDelete?.name && (
                  <p className="text-sm font-medium mt-2">
                    &quot;{sarafToDelete.name}&quot;
                  </p>
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

export default SarafsTable;
