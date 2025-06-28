import React, { useMemo, useState } from 'react';
import {
    Card,
    CardBody,
    Button,
    Input,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Tooltip,
    Spinner
} from '@nextui-org/react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useQuery } from 'react-query';
import ViewUserDetails from './ViewUserDetails';
import AddUser from './AddUser';
import UpdateUser from './UpdateUser';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const fetchUsers = async () => {
    const res = await userRequest.get("/users");
    return res.data.data;
};

const User = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        role: '',
        password: ''
    });
    const [updatedUser, setUpdatedUser] = useState({
        id: '',
        name: '',
        email: '',
        role: '',
        password: ''
    });
    const { data: users = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers
    });

    const filteredUsers = Array.isArray(users)
        ? users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const handleAdduser = async () => {
        try {
            await userRequest.post("/users", {
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                password: newUser.password,
            });
            setNewUser({
                name: "",
                email: "",
                role: "admin",
                password: "",
            });
            setShowAddModal(false);
            toast.success("User added successfully!");
            refetch();
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message || "Failed to add user.");
        }
    };


    const viewUserDetails = (user) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    const handleEditUser = (user) => {
    //   setUpdatedUser({
    //     name: user.name,
    //     email: user.email,
    //     password: "", 
    //     role: user.role || "", 
    //   });
    setUpdatedUser(user)
      setShowUpdateModal(true);
    };

    const handleUpdateUser = async () => {    
        try {
            await userRequest.put(`/users/${updatedUser?._id}`, {
              name: updatedUser.name,
              email: updatedUser.email,
              role: updatedUser.role,
              password: updatedUser.password,
            });
            setShowUpdateModal(false);
            toast.success("User updated successfully!");
            refetch();
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message || "Failed to update user.");
        }
    };

    const handleDeleteProduct = (user) => {
      Swal.fire({
        title: "Are you sure?",
        text: `You will not be able to recover this ${user?.name || ""}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await userRequest.delete(`/users/${user?._id || ""}`);
            toast.success("The user has been deleted.");
            refetch();
          } catch (error) {
            toast.error(error?.response?.data?.message ||  "Failed to delete the User.");
          }
        }
      });
    };

    const bottomContent = useMemo(
        () => (
            <div className="flex justify-between items-center mt-4">
                <span className="text-small text-default-400">
                    Total: {filteredUsers.length} User
                </span>
            </div>
        ),
        [filteredUsers.length,]
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Users</h1>
                    <p className="text-gray-600">Manage user accounts and roles</p>
                </div>
                <Button
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
                    startContent={<FaPlus />}
                    onClick={() => setShowAddModal(true)}
                >
                    Add User
                </Button>
            </div>

            {/* Search */}
            <Card>
                <CardBody>
                    <Input
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        startContent={<FaSearch className="text-gray-400" />}
                        variant="bordered"
                    />
                </CardBody>
            </Card>


            <Table aria-label="Users table" bottomContent={bottomContent}>
                <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>EMAIL</TableColumn>
                    <TableColumn>ROLE</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody
                    isLoading={isLoading}
                    loadingContent={
                        <div className="flex justify-center items-center py-8">
                            <Spinner color="success" size="lg" />
                        </div>
                    }
                    emptyContent={
                        <div className="text-center text-gray-500 py-8">
                            No User found
                        </div>
                    }>
                    {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="font-semibold">{user.name}</div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm text-gray-500">{user.email}</div>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    size="sm"
                                    color={user.role === "admin" ? "secondary" : "primary"}
                                >
                                    {user.role}
                                </Chip>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Tooltip content="View">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            color="primary"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowDetailsModal(true);
                                            }}
                                        >
                                            <FaEye />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content="Update">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            color="warning"
                                            onClick={() => {
                                                handleEditUser(user);
                                            }}
                                        >
                                            <FaEdit />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content="Delete">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            color="danger"
                                            onClick={() => {
                                                handleDeleteProduct(user);
                                            }}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </Tooltip>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>


            {/* Add User Modal */}
            <AddUser
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                newUser={newUser}
                setNewUser={setNewUser}
                handleAddProduct={handleAdduser}
            />

            {/* User Details Modal */}
            <ViewUserDetails
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                user={selectedUser}
            />

            {/* Update User Modal */}
            <UpdateUser
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                handleUpdateuser={handleUpdateUser}
                user={updatedUser}
                updatedUser={updatedUser}
                setUpdatedUser={setUpdatedUser}
            />
        </div>
    );
};

export default User;