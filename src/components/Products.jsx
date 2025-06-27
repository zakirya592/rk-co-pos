
import React, { useState, useEffect } from 'react';
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Chip,
  Pagination
} from '@nextui-org/react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

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
      status: 'active'
    },
    {
      id: 2,
      name: 'Office Chair',
      category: 'Furniture',
      retailPrice: 12000,
      wholesalePrice: 10000,
      stock: 8,
      barcode: '1234567890124',
      status: 'active'
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
    description: ''
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    const product = {
      id: Date.now(),
      ...newProduct,
      retailPrice: parseFloat(newProduct.retailPrice),
      wholesalePrice: parseFloat(newProduct.wholesalePrice),
      stock: parseInt(newProduct.stock),
      status: 'active'
    };
    
    setProducts([...products, product]);
    setNewProduct({
      name: '',
      category: '',
      retailPrice: '',
      wholesalePrice: '',
      stock: '',
      barcode: '',
      description: ''
    });
    setShowAddModal(false);
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
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<FaSearch className="text-gray-400" />}
              variant="bordered"
            />
            <Select
              placeholder="Filter by category"
              className="md:w-64"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              variant="bordered"
            >
              <SelectItem key="" value="">All Categories</SelectItem>
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
              <TableColumn>NAME</TableColumn>
              <TableColumn>CATEGORY</TableColumn>
              <TableColumn>RETAIL PRICE</TableColumn>
              <TableColumn>WHOLESALE PRICE</TableColumn>
              <TableColumn>STOCK</TableColumn>
              <TableColumn>BARCODE</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-semibold">{product.name}</TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="primary">
                      {product.category}
                    </Chip>
                  </TableCell>
                  <TableCell>Rs. {product.retailPrice.toLocaleString()}</TableCell>
                  <TableCell>Rs. {product.wholesalePrice.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip size="sm" color={getStockColor(product.stock)}>
                      {product.stock} units
                    </Chip>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{product.barcode}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button isIconOnly size="sm" variant="light" color="primary">
                        <FaEye />
                      </Button>
                      <Button isIconOnly size="sm" variant="light" color="warning">
                        <FaEdit />
                      </Button>
                      <Button isIconOnly size="sm" variant="light" color="danger">
                        <FaTrash />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Add Product Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-xl font-bold">Add New Product</h2>
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Product Name"
                placeholder="Enter product name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                variant="bordered"
                required
              />
              
              <Select
                label="Category"
                placeholder="Select category"
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                variant="bordered"
                required
              >
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </Select>

              <Input
                label="Retail Price"
                placeholder="0.00"
                type="number"
                value={newProduct.retailPrice}
                onChange={(e) => setNewProduct({...newProduct, retailPrice: e.target.value})}
                startContent="Rs."
                variant="bordered"
                required
              />

              <Input
                label="Wholesale Price"
                placeholder="0.00"
                type="number"
                value={newProduct.wholesalePrice}
                onChange={(e) => setNewProduct({...newProduct, wholesalePrice: e.target.value})}
                startContent="Rs."
                variant="bordered"
                required
              />

              <Input
                label="Stock Quantity"
                placeholder="0"
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                variant="bordered"
                required
              />

              <Input
                label="Barcode"
                placeholder="Enter barcode"
                value={newProduct.barcode}
                onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                variant="bordered"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="light" 
              onPress={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              onPress={handleAddProduct}
            >
              Add Product
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Products;
