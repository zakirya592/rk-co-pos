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
  Select,
  SelectItem,
  Chip,
  Pagination,
  Spinner,
  Tooltip,
} from "@nextui-org/react";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaImage } from 'react-icons/fa';
import AddProductModal from './AddProductModal';
import ViewProductModal from './ViewProductModal';
import EditProductModal from './EditProductModal';
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useQuery, useQueryClient } from 'react-query';
import userRequest from '../../utils/userRequest';


const fetchProducts = async (key, searchTerm, currentPage) => {
  const res = await userRequest.get("/products", {
    params: {
      search: searchTerm,
      page: currentPage,
    },
  });
  return {
    products: res.data.data || [],
    total: res.data.results || 0,
  };
};

// Add this fetch function
const fetchCategories = async () => {
  const res = await userRequest.get("/categories");
  return res.data.data || [];
};

const Products = () => {
  // Fetch categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery(
    ["categories"],
    fetchCategories
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    countInStock: "",
    description: "",
    image: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewProduct, setViewProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["products", searchTerm, currentPage],
    () => fetchProducts("products", searchTerm, currentPage),
    { keepPreviousData: true }
  );

  const products = data?.products || [];
  const totalProducts = data?.total || 0;

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewProduct({ ...newProduct, image: file });
  };
  // Add this in Products.jsx
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditProduct({ ...editProduct, image: file });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "" ||
      (product.category && product.category._id === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(totalProducts / rowsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  //  Handle add product
  const handleAddProduct = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("price", newProduct.price);
      formData.append("description", newProduct.description);
      formData.append("category", newProduct.category);
      formData.append("countInStock", newProduct.countInStock);
      formData.append("image", newProduct.image);

      await userRequest.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowAddModal(false);
      setCurrentPage(1);
      setNewProduct({
        name: "",
        category: "",
        price: "",
        countInStock: "",
        description: "",
        image: "",
      });
      toast.success("Product added successfully!");
      queryClient.invalidateQueries(["products"]); // Refetch products
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message ||"Failed to add product.");
    }
  };

  // Handle update product
  const handleUpdateProduct = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editProduct.name);
      formData.append("price", editProduct.price);
      formData.append("description", editProduct.description);
      formData.append("category", typeof editProduct.category === "object" && editProduct.category !== null ? editProduct.category._id : editProduct.category);
      formData.append("countInStock", editProduct.countInStock);
      formData.append("image", editProduct.image);

      await userRequest.put(`/products/${editProduct?._id || ""}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product updated successfully!");
      setEditProduct(null);
      queryClient.invalidateQueries(["products"]);
    } catch (error) {
      toast.error(
        error?.response?.data.message ||
          error.message ||
          "Failed to update product."
      );
    }
  };

  // Handle delete product
  const handleDeleteProduct = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover this ${id}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userRequest.delete(`/products/${id}`);
          toast.success("The product has been deleted.");
          queryClient.invalidateQueries(["products"]);
        } catch (error) {
          toast.error("Failed to delete the product.");
        }
      }
    });
  };
  const getStockColor = (countInStock) => {
    if (countInStock <= 5) return "danger";
    if (countInStock <= 10) return "warning";
    return "success";
  };

  const bottomContent = useMemo(
    () => (
      <div className="flex justify-between items-center mt-4">
        <span className="text-small text-default-400">
          Total: {totalProducts} {totalProducts === 1 ? "product" : "products"}
        </span>
        <div className="flex items-center gap-4">
          <Pagination
            isCompact
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            showControls
            showShadow
            color="primary"
            classNames={{
              wrapper: "gap-1",
              item: "bg-transparent text-gray-700 hover:bg-green-50",
              cursor: "bg-green-600 text-white font-medium",
            }}
          />
          <label className="flex items-center gap-2 text-default-400 text-small">
            Rows per page:
            <Select
              className="w-20"
              selectedKeys={[String(rowsPerPage)]}
              onSelectionChange={(keys) => {
                const value = Number(Array.from(keys)[0]);
                setRowsPerPage(value);
                setCurrentPage(1);
              }}
              variant="bordered"
              size="sm"
            >
              <SelectItem key="5" value="5">
                5
              </SelectItem>
              <SelectItem key="10" value="10">
                10
              </SelectItem>
              <SelectItem key="15" value="15">
                15
              </SelectItem>
            </Select>
          </label>
        </div>
      </div>
    ),
    [totalPages, currentPage, rowsPerPage, totalProducts]
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
          startContent={<FaPlus />}
          onPress={() => setShowAddModal(true)}
        >
          Add Product
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              className="flex-1"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              startContent={<FaSearch className="text-gray-400" />}
              variant="bordered"
            />
            <Select
              placeholder="Filter by category"
              className="md:w-64"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              variant="bordered"
              isLoading={isCategoriesLoading}
            >
              <SelectItem key="" value="">
                All Categories
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Products Table */}
      <Table aria-label="Products table" bottomContent={bottomContent}>
        <TableHeader>
          <TableColumn>IMAGE</TableColumn>
          <TableColumn>NAME</TableColumn>
          <TableColumn>CATEGORY</TableColumn>
          <TableColumn>price</TableColumn>
          {/* <TableColumn>WHOLESALE price</TableColumn> */}
          <TableColumn>STOCK</TableColumn>
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
              No Product found
            </div>
          }
        >
          {paginatedProducts.map((product) => (
            <TableRow key={product._id}>
              <TableCell>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <FaImage className="text-gray-300 text-2xl" />
                )}
              </TableCell>
              <TableCell className="font-semibold">{product.name}</TableCell>
              <TableCell>
                <Chip size="sm" variant="flat" color="primary">
                  {/* {categoryMap[product.category]?.name || "Unknown"} */}
                  {product.category.name}
                </Chip>
                {/* Optionally show description below */}
                {/* <div className="text-xs text-gray-400">{categoryMap[product.category]?.description}</div> */}
              </TableCell>
              <TableCell>{product.price}</TableCell>
              <TableCell>
                <Chip size="sm" color={getStockColor(product.countInStock)}>
                  {product.countInStock} units
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Tooltip content="View Product" placement="top">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="primary"
                      onPress={() => setViewProduct(product)}
                    >
                      <FaEye />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Edit Product" placement="top">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="warning"
                      onPress={() => setEditProduct(product)}
                    >
                      <FaEdit />
                    </Button>
                  </Tooltip>

                  <Tooltip content="Delete Product" placement="top">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDeleteProduct(product._id)}
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

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        categories={categories}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        handleAddProduct={handleAddProduct}
        handleImageChange={handleImageChange}
      />

      {/* View Product Modal */}
      <ViewProductModal
        isOpen={!!viewProduct}
        onClose={() => setViewProduct(null)}
        viewProduct={viewProduct}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={!!editProduct}
        onClose={() => setEditProduct(null)}
        categories={categories}
        editProduct={editProduct}
        setEditProduct={setEditProduct}
        handleUpdateProduct={handleUpdateProduct}
        handleImageChange={handleEditImageChange}
      />
    </div>
  );
};

export default Products;
