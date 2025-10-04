import React, { useState } from 'react';
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
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import userRequest from '../../../utils/userRequest';
import { Edit, MoreVertical, RefreshCw, Trash2 } from 'lucide-react';

const PackingUnitsTable = ({ data, quantityUnits, onRefresh }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: '', quantityUnit: '' });
  const [unitToDelete, setUnitToDelete] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [editedData, setEditedData] = useState({ name: '', quantityUnit: '' });
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onOpenChange: onDeleteModalChange } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onOpenChange: onEditModalChange } = useDisclosure();

  const handleEdit = (unit) => {
    setEditingUnit(unit);
    setEditedData({
      name: unit.name,
      quantityUnit: unit.quantityUnit._id,
    });
    onEditModalOpen();
  };

  const closeEditModal = () => {
    setEditingUnit(null);
    onEditModalChange(false);
  };

  const handleSave = async (id) => {
    try {
      setIsSubmitting(true);
      await userRequest.put(`/packing-units/${id}`, {
        name: editedData.name,
        quantityUnit: editedData.quantityUnit,
      });
      toast.success('Packing unit updated successfully');
      onRefresh();
      closeEditModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update packing unit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!newUnit.name.trim() || !newUnit.quantityUnit) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsCreating(true);
      await userRequest.post("/packing-units", {
        name: newUnit.name,
        quantityUnit: newUnit.quantityUnit,
      });
      toast.success('Packing unit created successfully');
      setNewUnit({ name: '', quantityUnit: '' });
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create packing unit');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!unitToDelete) return;
    
    try {
      setIsDeleting(true);
      await userRequest.delete(`/packing-units/${unitToDelete._id}`);
      toast.success('Packing unit deleted successfully');
      onRefresh();
      onDeleteModalChange(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete packing unit');
    } finally {
      setIsDeleting(false);
      setUnitToDelete(null);
    }
  };

  const renderCell = (item, columnKey) => {
    switch (columnKey) {
      case 'name':
        return item.name;
      case 'quantityUnit':
        return item.quantityUnit?.name || 'N/A';
      case 'status':
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {item.isActive ? 'Active' : 'Inactive'}
          </span>
        );
      case 'actions':
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
                  onPress={() => handleEdit(item)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  startContent={<Trash2 className="h-4 w-4" />}
                  className="text-danger"
                  color="danger"
                  onPress={() => {
                    setUnitToDelete(item);
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
        <h2 className="text-lg font-semibold">Packing Units</h2>
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

      <div className="flex gap-2 mb-4">
        <Input
          size="sm"
          placeholder="New packing unit name"
          value={newUnit.name}
          onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
          className="w-full"
        />
        <Select
          size="sm"
          placeholder="Select quantity unit"
          className="w-full"
          selectedKeys={newUnit.quantityUnit ? [newUnit.quantityUnit] : []}
          onChange={(e) => setNewUnit({ ...newUnit, quantityUnit: e.target.value })}
        >
          {quantityUnits.map((unit) => (
            <SelectItem key={unit._id} value={unit._id}>
              {unit.name}
            </SelectItem>
          ))}
        </Select>
        <Button
          color="primary"
          className='w-1/3'
          size="sm"
          onPress={handleCreate}
          isDisabled={!newUnit.name.trim() || !newUnit.quantityUnit || isCreating}
        >
          {isCreating ? 'Adding...' : 'Add'}
        </Button>
      </div>

      <Table 
        aria-label="Packing units table"
        classNames={{
          wrapper: data?.length === 0 ? 'min-h-[200px]' : '',
        }}
      >
        <TableHeader>
          <TableColumn key="name">NAME</TableColumn>
          <TableColumn key="quantityUnit">QUANTITY UNIT</TableColumn>
          <TableColumn key="status">STATUS</TableColumn>
          <TableColumn key="actions" className="w-24">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody 
          items={data || []}
          emptyContent={
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-foreground-500">No data available</p>
              <p className="text-sm text-foreground-400">Add a new packing unit to get started</p>
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

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onOpenChange={onEditModalChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit Packing Unit</ModalHeader>
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
                    label="Quantity Unit"
                    selectedKeys={[editedData.quantityUnit]}
                    onChange={(e) =>
                      setEditedData({ ...editedData, quantityUnit: e.target.value })
                    }
                  >
                    {quantityUnits.map((qtyUnit) => (
                      <SelectItem key={qtyUnit._id} value={qtyUnit._id}>
                        {qtyUnit.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={closeEditModal} isDisabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleSave(editingUnit._id)}
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
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
              <ModalHeader>Delete Packing Unit</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this packing unit?</p>
                <p className="text-sm text-foreground-500">
                  This action cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} isDisabled={isDeleting}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={handleDelete}
                  isLoading={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PackingUnitsTable;
