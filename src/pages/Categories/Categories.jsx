import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Spinner,
  Tooltip
} from '@nextui-org/react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaTags } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import userRequest from '../../utils/userRequest';
import AddCategoryModal from './AddCategoryModal';
import UpdateCategoryModal from './UpdateCategoryModal';


const fetchCategories = async () => {
  const res = await userRequest.get("/categories");
  return res.data.data;
};

const fetchProducts = async () => {
  const res = await userRequest.get("/products", {
    params: { page: 1, search: "" }, // adjust as needed
  });
  return res.data.data || [];
};

const Categories = () => {
  const navigate = useNavigate();

  const { data: categoriess = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: fetchProducts,
  });


  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });
  const [editCategory, seteditCategory] = useState({
    name: "",
    description: "",
  });

  const filteredCategories = categoriess.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = async () => {
    try {
      await userRequest.post("/categories", {
        name: newCategory.name,
        description: newCategory.description,
      });
      setNewCategory({ name: "", description: "" });
      refetch()
      setShowAddModal(false);
      toast.success("Categorie added successfully!");
      refetch();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error.message || "Failed to add categorie."
      );
    }
  };

  const handleEditCategory = async () => {
    try {
      await userRequest.put(`/categories/${selectedCategory?._id}`, {
        name: editCategory.name,
        description: editCategory.description,
      });
      setShowEditModal(false);
      setSelectedCategory(null);
      seteditCategory({ name: "", description: "" });
      toast.success("Category updated successfully!");
      refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to update user.");
    }
  };

  const handleDeleteCategory = (category) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover this ${category?.name || ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userRequest.delete(`/categories/${category?._id || ""}`);
          toast.success("The category has been deleted.");
          refetch();
        } catch (error) {
          toast.error(error?.response?.data?.message || "Failed to delete the category.");
        }
      }
    });
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    seteditCategory({
      name: category.name,
      description: category.description,
    });
    setShowEditModal(true);
  };

  const getProductCountForCategory = (categoryId) => {
    return products.filter(
      (product) => product.category && product.category._id === categoryId
    ).length;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
          </div>
          <p className="text-gray-600">Manage product categories</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="flat"
            onPress={() => navigate('/Navigation')}
          >
            Dashboard
          </Button>
          <Chip
            color="primary"
            variant="flat"
            className="text-base font-semibold px-3 py-4 mt-1"
            startContent={
              <span role="img" aria-label="count" className="mr-1">
                📦
              </span>
            }
          >
            {filteredCategories.length}{" "}
            {filteredCategories.length === 1 ? "Category" : "Categories"}
          </Chip>
          <Button
            className="bg-gradient-to-r ms-2 from-blue-500 to-purple-600 text-white font-semibold"
            startContent={<FaPlus />}
            onPress={() => setShowAddModal(true)}
          >
            Add Category
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<FaSearch className="text-gray-400" />}
            variant="bordered"
          />
        </CardBody>
      </Card>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner color="success" size="lg" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No Categories found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card
              key={category._id}
              className="hover:shadow-lg transition-shadow"
            >
              <div className="px-3 pt-2 flex flex-row justify-between">
                <h6 className="text-xl font-bold">Sl No</h6>
                <p>{filteredCategories.indexOf(category) + 1}</p>
              </div>
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                      <FaTags className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{category.name}</h3>
                      <p className="text-gray-600 text-sm">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Products:</span>
                    <Chip size="sm" color="primary">
                      {getProductCountForCategory(category._id)}
                    </Chip>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-sm">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Tooltip content="Edit Category" placement="top">
                    <Button
                      size="sm"
                      variant="light"
                      color="warning"
                      startContent={<FaEdit />}
                      onClick={() => openEditModal(category)}
                    >
                      Edit
                    </Button>
                  </Tooltip>
                  <Tooltip content="Delete Category" placement="top">
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      startContent={<FaTrash />}
                      onClick={() => handleDeleteCategory(category)}
                    >
                      Delete
                    </Button>
                  </Tooltip>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Categories Table View */}

      {/* <Table aria-label="Categories table">
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>DESCRIPTION</TableColumn>
          <TableColumn>PRODUCTS</TableColumn>
          <TableColumn>CREATED DATE</TableColumn>
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
              No Categories found
            </div>
          }
        >
          {filteredCategories.map((category) => (
            <TableRow key={category._id}>
              <TableCell className="font-semibold">{category.name}</TableCell>
              <TableCell>{category.description}</TableCell>
              <TableCell>
                <Chip size="sm" color="primary">
                  {category.productCount} items
                </Chip>
              </TableCell>
              <TableCell>
                {new Date(category.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="warning"
                    onClick={() => openEditModal(category)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onClick={() => handleDeleteCategory(category)}
                  >
                    <FaTrash />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table> */}

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        onAddCategory={handleAddCategory}
      />

      {/* Update Category Modal */}
      <UpdateCategoryModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        editCategory={editCategory}
        seteditCategory={seteditCategory}
        onUpdateCategory={handleEditCategory}
      />
    </div>
  );
};

export default Categories;
