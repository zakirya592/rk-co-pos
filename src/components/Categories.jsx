
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip
} from '@nextui-org/react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaTags } from 'react-icons/fa';

const Categories = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: 'Electronics',
      description: 'Electronic devices and accessories',
      productCount: 25,
      createdDate: '2024-01-01'
    },
    {
      id: 2,
      name: 'Furniture',
      description: 'Office and home furniture',
      productCount: 15,
      createdDate: '2024-01-02'
    },
    {
      id: 3,
      name: 'Clothing',
      description: 'Apparel and fashion items',
      productCount: 8,
      createdDate: '2024-01-03'
    },
    {
      id: 4,
      name: 'Books',
      description: 'Educational and general books',
      productCount: 45,
      createdDate: '2024-01-04'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    const category = {
      id: Date.now(),
      ...newCategory,
      productCount: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };
    
    setCategories([...categories, category]);
    setNewCategory({ name: '', description: '' });
    setShowAddModal(false);
  };

  const handleEditCategory = () => {
    setCategories(categories.map(cat =>
      cat.id === selectedCategory.id
        ? { ...cat, name: newCategory.name, description: newCategory.description }
        : cat
    ));
    setShowEditModal(false);
    setSelectedCategory(null);
    setNewCategory({ name: '', description: '' });
  };

  const handleDeleteCategory = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description
    });
    setShowEditModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-600">Manage product categories</p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
          startContent={<FaPlus />}
          onClick={() => setShowAddModal(true)}
        >
          Add Category
        </Button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardBody className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                    <FaTags className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{category.name}</h3>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Products:</span>
                  <Chip size="sm" color="primary">
                    {category.productCount}
                  </Chip>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-sm">{new Date(category.createdDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="light"
                  color="warning"
                  startContent={<FaEdit />}
                  onClick={() => openEditModal(category)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  startContent={<FaTrash />}
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  Delete
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Categories Table View */}
      <Card>
        <CardBody>
          <Table aria-label="Categories table">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>DESCRIPTION</TableColumn>
              <TableColumn>PRODUCTS</TableColumn>
              <TableColumn>CREATED DATE</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-semibold">{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    <Chip size="sm" color="primary">
                      {category.productCount} items
                    </Chip>
                  </TableCell>
                  <TableCell>{new Date(category.createdDate).toLocaleDateString()}</TableCell>
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
                        onClick={() => handleDeleteCategory(category.id)}
                      >
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

      {/* Add Category Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalContent>
          <ModalHeader>Add New Category</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Category Name"
                placeholder="Enter category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                variant="bordered"
                required
              />
              
              <Input
                label="Description"
                placeholder="Enter category description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                variant="bordered"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              onPress={handleAddCategory}
            >
              Add Category
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Category Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        <ModalContent>
          <ModalHeader>Edit Category</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Category Name"
                placeholder="Enter category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                variant="bordered"
                required
              />
              
              <Input
                label="Description"
                placeholder="Enter category description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                variant="bordered"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              onPress={handleEditCategory}
            >
              Update Category
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Categories;
