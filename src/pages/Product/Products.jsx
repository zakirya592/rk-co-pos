import React, { useState } from 'react';
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
  Pagination
} from '@nextui-org/react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaImage } from 'react-icons/fa';
import AddProductModal from './AddProductModal';
import ViewProductModal from './ViewProductModal';
import EditProductModal from './EditProductModal';
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const PRODUCTS_PER_PAGE = 5;

const Products = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Laptop Dell XPS 13',
      category: 'Electronics',
      retailPrice: 85000,
      wholesalePrice: 80000,
      stock: 15,
      barcode: '1234567890123',
      status: 'active',
      image: ''
    },
    {
      id: 2,
      name: 'Office Chair',
      category: 'Furniture',
      retailPrice: 12000,
      wholesalePrice: 10000,
      stock: 8,
      barcode: '1234567890124',
      status: 'active',
      image: ''
    }
  ]);

  const [categories] = useState(['Electronics', 'Furniture', 'Clothing', 'Books', 'Sports']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    retailPrice: '',
    wholesalePrice: '',
    stock: '',
    barcode: '',
    description: '',
    image: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewProduct, setViewProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProduct({ ...newProduct, image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handleAddProduct = () => {
    const product = {
      id: Date.now(),
      ...newProduct,
      retailPrice: parseFloat(newProduct.retailPrice),
      wholesalePrice: parseFloat(newProduct.wholesalePrice),
      stock: parseInt(newProduct.stock),
      status: "active",
    };

    setProducts([...products, product]);
    setNewProduct({
      name: "",
      category: "",
      retailPrice: "",
      wholesalePrice: "",
      stock: "",
      barcode: "",
      description: "",
      image: "",
    });
    setShowAddModal(false);
    setCurrentPage(1); // Go to first page after adding
    toast.success("Product added successfully!"); // <-- Show toast
  };

  // Handle update product
  const handleUpdateProduct = () => {
    setProducts(products.map(p =>
      p.id === editProduct.id
        ? { ...editProduct, retailPrice: parseFloat(editProduct.retailPrice), wholesalePrice: parseFloat(editProduct.wholesalePrice), stock: parseInt(editProduct.stock) }
        : p
    ));
    toast.success("Product Updated successfully!"); 
    setEditProduct(null);
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
    }).then((result) => {
      if (result.isConfirmed) {
        setProducts(products.filter((product) => product.id !== id));
        toast.success("The product has been deleted.");
      }
    });
  };

  const getStockColor = (stock) => {
    if (stock <= 5) return 'danger';
    if (stock <= 10) return 'warning';
    return 'success';
  };

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
          onClick={() => setShowAddModal(true)}
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
            >
              <SelectItem key="" value="">
                All Categories
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Products Table */}
      <Card>
        <CardBody>
          <Table aria-label="Products table">
            <TableHeader>
              <TableColumn>IMAGE</TableColumn>
              <TableColumn>NAME</TableColumn>
              <TableColumn>CATEGORY</TableColumn>
              <TableColumn>RETAIL PRICE</TableColumn>
              <TableColumn>WHOLESALE PRICE</TableColumn>
              <TableColumn>STOCK</TableColumn>
              <TableColumn>BARCODE</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id}>
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
                  <TableCell className="font-semibold">
                    {product.name}
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="primary">
                      {product.category}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    Rs. {product.retailPrice.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    Rs. {product.wholesalePrice.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" color={getStockColor(product.stock)}>
                      {product.stock} units
                    </Chip>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {product.barcode}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                        onClick={() => setViewProduct(product)}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="warning"
                        onClick={() => setEditProduct(product)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-small text-default-400">
              Total: {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </span>
            <Pagination
              isCompact
              total={totalPages}
              page={currentPage}
              onChange={setCurrentPage}
              showControls
              showShadow
              color="primary"
            />
          </div>
        </CardBody>
      </Card>

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
      />
    </div>
  );
};

export default Products;
