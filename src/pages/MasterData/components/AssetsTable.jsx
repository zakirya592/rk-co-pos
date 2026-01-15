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

const AssetsTable = ({ data, onRefresh }) => {
  const [editingId, setEditingId] = useState(null);
  const [viewingAsset, setViewingAsset] = useState(null);
  const [editedData, setEditedData] = useState({ 
    name: "", 
    assetType: "current", 
    value: "" 
  });
  const [newAsset, setNewAsset] = useState({ 
    name: "", 
    assetType: "current", 
    value: "" 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  
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

  const assetTypes = [
    { key: "fixed", label: "Fixed" },
    { key: "current", label: "Current" },
    { key: "intangible", label: "Intangible" },
    { key: "other", label: "Other" },
  ];

  const getAssetTypeColor = (type) => {
    switch (type) {
      case "fixed":
        return "primary";
      case "current":
        return "success";
      case "intangible":
        return "warning";
      case "other":
        return "default";
      default:
        return "default";
    }
  };

  const handleEdit = (asset) => {
    setEditingId(asset._id);
    setEditedData({
      name: asset.name || "",
      assetType: asset.assetType || "current",
      value: asset.value?.toString() || "",
    });
    onEditModalOpen();
  };

  const handleView = async (assetId) => {
    try {
      const response = await userRequest.get(`/assets/${assetId}`);
      // Handle nested structure: data.data.asset (singular)
      const asset = response.data?.data?.asset || response.data?.data || response.data;
      setViewingAsset(asset);
      onViewModalOpen();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch asset details"
      );
    }
  };

  const closeEditModal = () => {
    setEditingId(null);
    setEditedData({ name: "", assetType: "current", value: "" });
    onEditModalChange(false);
  };

  const closeCreateModal = () => {
    setNewAsset({ name: "", assetType: "current", value: "" });
    onCreateModalChange(false);
  };

  const handleSave = async (id) => {
    if (!editedData.name.trim()) {
      toast.error("Please enter asset name");
      return;
    }
    if (!editedData.value || parseFloat(editedData.value) <= 0) {
      toast.error("Please enter a valid value");
      return;
    }

    try {
      setIsSubmitting(true);
      await userRequest.put(`/assets/${id}`, {
        name: editedData.name,
        assetType: editedData.assetType,
        value: editedData.value,
      });
      toast.success("Asset updated successfully");
      onRefresh();
      closeEditModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update asset"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!newAsset.name.trim()) {
      toast.error("Please enter asset name");
      return;
    }
    if (!newAsset.value || parseFloat(newAsset.value) <= 0) {
      toast.error("Please enter a valid value");
      return;
    }

    try {
      setIsCreating(true);
      await userRequest.post("/assets", {
        name: newAsset.name,
        assetType: newAsset.assetType,
        value: newAsset.value,
      });
      toast.success("Asset created successfully");
      closeCreateModal();
      onRefresh();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create asset"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!assetToDelete) return;

    try {
      setIsDeleting(true);
      await userRequest.delete(`/assets/${assetToDelete._id}`);
      toast.success("Asset deleted successfully");
      onRefresh();
      onDeleteModalChange(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete asset"
      );
    } finally {
      setIsDeleting(false);
      setAssetToDelete(null);
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

  const renderCell = (asset, columnKey) => {
    switch (columnKey) {
      case "name":
        return <span className="font-medium">{asset.name || "—"}</span>;
      case "assetType":
        return (
          <Chip
            size="sm"
            color={getAssetTypeColor(asset.assetType)}
            variant="flat"
          >
            {asset.assetType
              ? asset.assetType.charAt(0).toUpperCase() +
                asset.assetType.slice(1)
              : "—"}
          </Chip>
        );
      case "value":
        return <span>{formatCurrency(asset.value)}</span>;
      case "createdAt":
        return formatDate(asset.createdAt);
      case "updatedAt":
        return formatDate(asset.updatedAt);
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Asset actions">
                <DropdownItem
                  key="view"
                  startContent={<Eye className="h-4 w-4" />}
                  onPress={() => handleView(asset._id)}
                >
                  View Details
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<Edit className="h-4 w-4" />}
                  onPress={() => handleEdit(asset)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
                  startContent={<Trash2 className="h-4 w-4" />}
                  onPress={() => {
                    setAssetToDelete(asset);
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
        <h2 className="text-lg font-semibold">Assets Management</h2>
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
            Add Asset
          </Button>
        </div>
      </div>

      <Table aria-label="Assets table">
        <TableHeader>
          <TableColumn key="name">NAME</TableColumn>
          <TableColumn key="assetType">TYPE</TableColumn>
          <TableColumn key="value">VALUE</TableColumn>
          <TableColumn key="createdAt">CREATED AT</TableColumn>
          <TableColumn key="updatedAt">UPDATED AT</TableColumn>
          <TableColumn key="actions" className="w-24">
            ACTIONS
          </TableColumn>
        </TableHeader>
        <TableBody 
          items={Array.isArray(data) ? data : []} 
          emptyContent="No assets found"
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
      <Modal isOpen={isCreateModalOpen} onOpenChange={onCreateModalChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add New Asset</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Asset Name"
                    placeholder="Enter asset name"
                    value={newAsset.name}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, name: e.target.value })
                    }
                    isRequired
                    fullWidth
                  />
                  <Select
                    label="Asset Type"
                    placeholder="Select asset type"
                    selectedKeys={[newAsset.assetType]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0];
                      setNewAsset({ ...newAsset, assetType: selected });
                    }}
                    isRequired
                  >
                    {assetTypes.map((type) => (
                      <SelectItem key={type.key} value={type.key}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="Value"
                    type="number"
                    placeholder="Enter asset value"
                    value={newAsset.value}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, value: e.target.value })
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
                  {isCreating ? "Creating..." : "Create Asset"}
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
              <ModalHeader>Edit Asset</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Asset Name"
                    value={editedData.name}
                    onChange={(e) =>
                      setEditedData({ ...editedData, name: e.target.value })
                    }
                    isRequired
                    fullWidth
                  />
                  <Select
                    label="Asset Type"
                    selectedKeys={[editedData.assetType]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0];
                      setEditedData({ ...editedData, assetType: selected });
                    }}
                    isRequired
                  >
                    {assetTypes.map((type) => (
                      <SelectItem key={type.key} value={type.key}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="Value"
                    type="number"
                    value={editedData.value}
                    onChange={(e) =>
                      setEditedData({ ...editedData, value: e.target.value })
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
              <ModalHeader>Asset Details</ModalHeader>
              <ModalBody>
                {viewingAsset && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-lg font-semibold">{viewingAsset.name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Asset Type</p>
                      <Chip
                        size="sm"
                        color={getAssetTypeColor(viewingAsset.assetType)}
                        variant="flat"
                      >
                        {viewingAsset.assetType
                          ? viewingAsset.assetType.charAt(0).toUpperCase() +
                            viewingAsset.assetType.slice(1)
                          : "—"}
                      </Chip>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Value</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(viewingAsset.value)}
                      </p>
                    </div>
                    {viewingAsset.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500">Created At</p>
                        <p className="text-sm">{formatDate(viewingAsset.createdAt)}</p>
                      </div>
                    )}
                    {viewingAsset.updatedAt && (
                      <div>
                        <p className="text-sm text-gray-500">Updated At</p>
                        <p className="text-sm">{formatDate(viewingAsset.updatedAt)}</p>
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
              <ModalHeader>Delete Asset</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete "{assetToDelete?.name}"?</p>
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

export default AssetsTable;
