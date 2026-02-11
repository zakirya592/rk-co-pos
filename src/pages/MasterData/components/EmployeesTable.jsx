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

const EmployeesTable = ({ data, onRefresh }) => {
  const [editingId, setEditingId] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [editedData, setEditedData] = useState({
    name: "",
    mobileNo: "",
    code: "",
    description: "",
  });
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    mobileNo: "",
    code: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  
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

  const handleEdit = (employee) => {
    setEditingId(employee._id);
    setEditedData({
      name: employee.name || "",
      mobileNo: employee.mobileNo || employee.phoneNumber || "",
      code: employee.code || "",
      description: employee.description || employee.position || "",
    });
    onEditModalOpen();
  };

  const handleView = async (employeeId) => {
    try {
      const response = await userRequest.get(`/employees/${employeeId}`);
      // Handle nested structure: data.data.employee (singular)
      const employee = response.data?.data?.employee || 
                      response.data?.data || 
                      response.data;
      setViewingEmployee(employee);
      onViewModalOpen();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch employee details"
      );
    }
  };

  const closeEditModal = () => {
    setEditingId(null);
    setEditedData({ name: "", mobileNo: "", code: "", description: "" });
    onEditModalChange(false);
  };

  const closeCreateModal = () => {
    setNewEmployee({ name: "", mobileNo: "", code: "", description: "" });
    onCreateModalChange(false);
  };

  const handleSave = async (id) => {
    if (!editedData.name.trim()) {
      toast.error("Please enter name");
      return;
    }

    try {
      setIsSubmitting(true);
      await userRequest.put(`/employees/${id}`, {
        name: editedData.name,
        mobileNo: editedData.mobileNo,
        code: editedData.code,
        description: editedData.description,
      });
      toast.success("Employee updated successfully");
      onRefresh();
      closeEditModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update employee"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!newEmployee.name.trim()) {
      toast.error("Please enter name");
      return;
    }

    try {
      setIsCreating(true);
      await userRequest.post("/employees", {
        name: newEmployee.name,
        mobileNo: newEmployee.mobileNo,
        code: newEmployee.code,
        description: newEmployee.description,
      });
      toast.success("Employee created successfully");
      closeCreateModal();
      onRefresh();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create employee"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;

    try {
      setIsDeleting(true);
      await userRequest.delete(`/employees/${employeeToDelete._id}`);
      toast.success("Employee deleted successfully");
      onRefresh();
      onDeleteModalChange(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete employee"
      );
    } finally {
      setIsDeleting(false);
      setEmployeeToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderCell = (employee, columnKey) => {
    switch (columnKey) {
      case "name":
        return <span className="font-medium">{employee.name || "—"}</span>;
      case "mobileNo":
        return (
          <span>{employee.mobileNo || employee.phoneNumber || "—"}</span>
        );
      case "code":
        return <span>{employee.code || "—"}</span>;
      case "description":
        return (
          <span className="max-w-xs truncate block">
            {employee.description || employee.position || "—"}
          </span>
        );
      case "createdAt":
        return formatDate(employee.createdAt);
      case "updatedAt":
        return formatDate(employee.updatedAt);
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Employee actions">
                <DropdownItem
                  key="view"
                  startContent={<Eye className="h-4 w-4" />}
                  onPress={() => handleView(employee._id)}
                >
                  View Details
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<Edit className="h-4 w-4" />}
                  onPress={() => handleEdit(employee)}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  color="danger"
                  className="text-danger"
                  startContent={<Trash2 className="h-4 w-4" />}
                  onPress={() => {
                    setEmployeeToDelete(employee);
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
        <h2 className="text-lg font-semibold">Employees Management</h2>
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
            Add Employee
          </Button>
        </div>
      </div>

      <Table aria-label="Employees table">
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
          emptyContent="No employees found"
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
              <ModalHeader>Add New Employee</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Name"
                    placeholder="Enter name"
                    value={newEmployee.name}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, name: e.target.value })
                    }
                    isRequired
                    fullWidth
                  />
                  <Input
                    label="Mobile No"
                    placeholder="Enter mobile number"
                    value={newEmployee.mobileNo}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        mobileNo: e.target.value,
                      })
                    }
                    fullWidth
                  />
                  <Input
                    label="Code"
                    placeholder="Enter code"
                    value={newEmployee.code}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, code: e.target.value })
                    }
                    fullWidth
                  />
                  <Textarea
                    label="Description"
                    placeholder="Enter description"
                    value={newEmployee.description}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
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
                  {isCreating ? "Creating..." : "Create Employee"}
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
              <ModalHeader>Edit Employee</ModalHeader>
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
              <ModalHeader>Employee Details</ModalHeader>
              <ModalBody>
                {viewingEmployee && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-lg font-semibold">
                        {viewingEmployee.name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mobile No</p>
                      <p className="text-lg">
                        {viewingEmployee.mobileNo ||
                          viewingEmployee.phoneNumber ||
                          "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Code</p>
                      <p className="text-lg">
                        {viewingEmployee.code || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-lg">
                        {viewingEmployee.description ||
                          viewingEmployee.position ||
                          "—"}
                      </p>
                    </div>
                    {viewingEmployee.createdAt && (
                      <div>
                        <p className="text-sm text-gray-500">Created At</p>
                        <p className="text-sm">{formatDate(viewingEmployee.createdAt)}</p>
                      </div>
                    )}
                    {viewingEmployee.updatedAt && (
                      <div>
                        <p className="text-sm text-gray-500">Updated At</p>
                        <p className="text-sm">{formatDate(viewingEmployee.updatedAt)}</p>
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
              <ModalHeader>Delete Employee</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this employee?</p>
                {employeeToDelete?.name && (
                  <p className="text-sm font-medium mt-2">"{employeeToDelete.name}"</p>
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

export default EmployeesTable;
