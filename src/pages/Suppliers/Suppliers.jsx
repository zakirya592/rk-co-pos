import React, { useState } from 'react';
import {
    Card,
    CardBody,
    Button,
    Input,
    Chip,
    Spinner,
    Tooltip,
    Image,
    Table,
    TableBody,
    TableHeader,
    TableColumn,
    TableRow,
    TableCell,
} from '@nextui-org/react';
import { FaPlus, FaEdit, FaTrash, FaImage } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useQuery, useQueryClient } from 'react-query';
import userRequest from '../../utils/userRequest';
import { useNavigate } from 'react-router-dom';

const fetchSuppliers = async () => {
    const res = await userRequest.get("/suppliers");
    return res?.data;
};

const Suppliers = () => {
    const navigate = useNavigate();
    const { data: suppliers = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['suppliers'],
        queryFn: fetchSuppliers
    });


    const handleAddSupplier = async () => {
        try {
            navigate('/suppliers/add');
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message || "Failed to add supplier.");
        }
    };

    const handleDeleteSupplier = (supplier) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You will not be able to recover this supplier ${supplier?.name || ""}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await userRequest.delete(`/suppliers/${supplier?._id || ""}/permanent`);
                    toast.success("The supplier has been deleted.");
                    refetch();
                } catch (error) {
                    toast.error(error?.response?.data?.message || "Failed to delete the supplier.");
                }
            }
        });
    };
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-800">Suppliers</h1>
                    </div>
                    <p className="text-gray-600">Manage suppliers information</p>
                </div>
                <div className="flex">
                    <Chip
                        color="primary"
                        variant="flat"
                        className="text-base font-semibold px-3 py-4 mt-1"
                        startContent={
                            <span role="img" aria-label="count" className="mr-1">
                                👤
                            </span>
                        }
                    >
                        {suppliers.length} Supplier{suppliers.length !== 1 && "s"}
                    </Chip>
                    <Button
                        className="bg-gradient-to-r ms-2 from-blue-500 to-purple-600 text-white font-semibold"
                        startContent={<FaPlus />}
                        onPress={handleAddSupplier}
                    >
                        Add Supplier
                    </Button>
                </div>
            </div>

            {/* Suppliers Grid */}
            <Table aria-label="Suppliers table" className="overflow-x-auto">
                <TableHeader>
                    <TableColumn>Sl No</TableColumn>
                    <TableColumn>Image</TableColumn>
                    <TableColumn>Name</TableColumn>
                    <TableColumn>Email</TableColumn>
                    <TableColumn>Phone</TableColumn>
                    <TableColumn>Address</TableColumn>
                    <TableColumn>Actions</TableColumn>
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
                            No Product found
                        </div>
                    }
                >
                    {suppliers.map((supplier, index) => (
                        <TableRow key={supplier._id}>
                            <TableCell>
                                {index + 1}
                            </TableCell>
                            <TableCell>
                                {supplier.image ? (
                                    <img
                                        src={supplier.image}
                                        alt={supplier.name}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                ) : (
                                    <FaImage className="text-gray-300 text-2xl" />
                                )}
                            </TableCell>
                            <TableCell>{supplier.name}</TableCell>
                            <TableCell>{supplier.email}</TableCell>
                            <TableCell>{supplier.phoneNumber}</TableCell>
                            <TableCell>{supplier.address}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Tooltip content="Edit Supplier" placement="top">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            color="primary"
                                            onPress={() => navigate(`/suppliers/${supplier._id}/edit`)}
                                        >
                                            <FaEdit />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip content="Delete Supplier" placement="top">
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            className="text-red-500"
                                            onPress={() => handleDeleteSupplier(supplier)}
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
        </div>
    );
};

export default Suppliers;
