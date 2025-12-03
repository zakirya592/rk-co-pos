import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Spinner,
  Tooltip,
  Select,
  SelectItem,
} from "@nextui-org/react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTags,
  FaLayerGroup,
  FaSitemap,
  FaSync,
} from "react-icons/fa";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import userRequest from "../../utils/userRequest";
import AddCategoryModal from "./AddCategoryModal";
import UpdateCategoryModal from "./UpdateCategoryModal";
import AddSubcategoryModal from "./AddSubcategoryModal";

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

const fetchSubcategories = async () => {
  const res = await userRequest.get("/subcategories");
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

  const {
    data: subcategories = [],
    isLoading: isSubcategoriesLoading,
    refetch: refetchSubcategories,
  } = useQuery({
    queryKey: ["subcategories"],
    queryFn: fetchSubcategories,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [activePanel, setActivePanel] = useState("categories");
  const [subSearchTerm, setSubSearchTerm] = useState("");
  const [subcategoryCategoryFilter, setSubcategoryCategoryFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });
  const [editCategory, seteditCategory] = useState({
    name: "",
    description: "",
  });
  const [newSubcategory, setNewSubcategory] = useState({
    name: "",
    description: "",
    category: "",
  });

  const filteredCategories = categoriess.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubcategories = subcategories.filter((subcategory) => {
    const matchesSearch =
      subcategory.name.toLowerCase().includes(subSearchTerm.toLowerCase()) ||
      subcategory.description?.toLowerCase().includes(subSearchTerm.toLowerCase()) ||
      subcategory.category?.name?.toLowerCase().includes(subSearchTerm.toLowerCase());

    const matchesCategory =
      subcategoryCategoryFilter === "all" ||
      subcategory.category?._id === subcategoryCategoryFilter;

    return matchesSearch && matchesCategory;
  });

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

  const handleAddSubcategory = async () => {
    if (!newSubcategory.name.trim() || !newSubcategory.category) {
      toast.error("Subcategory name and parent category are required.");
      return;
    }

    try {
      await userRequest.post("/subcategories", {
        name: newSubcategory.name,
        category: newSubcategory.category,
        description: newSubcategory.description,
      });
      toast.success("Subcategory added successfully!");
      setShowAddSubModal(false);
      setNewSubcategory({ name: "", description: "", category: "" });
      refetchSubcategories();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to add subcategory."
      );
    }
  };

  const handleDeleteSubcategory = (subcategory) => {
    Swal.fire({
      title: "Delete subcategory?",
      text: `This will remove ${subcategory?.name || "the subcategory"} permanently.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Keep it",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userRequest.delete(`/subcategories/${subcategory?._id}`);
          toast.success("Subcategory deleted.");
          refetchSubcategories();
        } catch (error) {
          toast.error(
            error?.response?.data?.message ||
              "Failed to delete the subcategory."
          );
        }
      }
    });
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

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderCategoriesSection = () => (
    <div className="space-y-6">
      <Card className="shadow-sm border border-gray-100">
        <CardBody className="space-y-1">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="text-sm uppercase text-gray-500 tracking-wide">
                Foundations
              </p>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <FaLayerGroup className="text-blue-500" />
                Categories
              </h1>
              <p className="text-gray-600">
                Organize your catalog by managing high level groupings.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="flat" onPress={() => navigate('/Navigation')}>
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
        </CardBody>
      </Card>

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

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner color="success" size="lg" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No Categories found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card
              key={category._id}
              className="hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="px-4 pt-4 flex flex-row justify-between text-sm text-gray-500">
                <span>Sl No</span>
                <span>{filteredCategories.indexOf(category) + 1}</span>
              </div>
              <CardBody className="p-6 space-y-5">
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
                    <Chip size="sm" color="primary" variant="flat">
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
    </div>
  );

  const renderSubcategoriesSection = () => (
    <div className="space-y-6">
      <Card className="shadow-sm border border-gray-100">
        <CardBody className="space-y-1">
          <div className="flex flex-wrap justify-between gap-4 items-center">
            <div>
              <p className="text-sm uppercase text-gray-500 tracking-wide">
                Linked Collections
              </p>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <FaSitemap className="text-emerald-500" />
                Subcategories
              </h2>
              <p className="text-gray-600">
                Curate focused product groups mapped to a parent category.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button
                variant="flat"
                startContent={<FaSync />}
                onPress={() => refetchSubcategories()}
              >
                Refresh
              </Button>
              <Button
                className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white"
                startContent={<FaPlus />}
                onPress={() => setShowAddSubModal(true)}
              >
                Add Subcategory
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <Input
              placeholder="Search subcategories, descriptions or parent categories..."
              value={subSearchTerm}
              onChange={(e) => setSubSearchTerm(e.target.value)}
              startContent={<FaSearch className="text-gray-400" />}
              variant="bordered"
            />
            <Select
              label="Filter by category"
              placeholder="All categories"
              value={subcategoryCategoryFilter}
              onChange={(e) => setSubcategoryCategoryFilter(e.target.value)}
              variant="bordered"
            >
              <SelectItem key="all" value="all">
                All categories
              </SelectItem>
              {categoriess.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      {isSubcategoriesLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner color="primary" size="lg" />
        </div>
      ) : filteredSubcategories.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No subcategories found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSubcategories.map((subcategory) => (
            <Card
              key={subcategory._id}
              className="border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <CardBody className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase text-gray-500 mb-1">
                      Subcategory
                    </p>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {subcategory.name}
                    </h3>
                  </div>
                  <Chip
                    size="sm"
                    color={subcategory.isActive ? "success" : "danger"}
                    variant="flat"
                  >
                    {subcategory.isActive ? "Active" : "Inactive"}
                  </Chip>
                </div>

                <p className="text-gray-600 text-sm">
                  {subcategory.description || "No description available."}
                </p>

                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase text-gray-500">
                      Parent Category
                    </p>
                    <p className="font-semibold text-gray-800">
                      {subcategory.category?.name || "—"}
                    </p>
                    <span className="text-xs text-gray-500">
                      {subcategory.category?.description || "—"}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase text-gray-500">Created</p>
                    <p className="font-semibold">{formatDate(subcategory.createdAt)}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Tooltip content="Delete subcategory" placement="top">
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      startContent={<FaTrash />}
                      onClick={() => handleDeleteSubcategory(subcategory)}
                    >
                      Remove
                    </Button>
                  </Tooltip>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-72 w-full">
          <Card className="h-full border border-gray-100 shadow-sm">
            <CardBody className="space-y-3">
              <p className="text-xs uppercase text-gray-500 tracking-wide">
                Views
              </p>
              {[
                { key: "categories", title: "Categories", icon: <FaLayerGroup /> },
                { key: "subcategories", title: "Subcategories", icon: <FaSitemap /> },
              ].map((item) => {
                const isActive = activePanel === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActivePanel(item.key)}
                    className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-300 text-blue-800"
                        : "border-gray-200 hover:border-blue-200"
                    }`}
                  >
                    <span
                      className={`text-lg ${
                        isActive ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        {item.key === "categories"
                          ? "Primary grouping"
                          : "Nested collections"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </CardBody>
          </Card>
        </aside>

        <section className="flex-1">
          {activePanel === "categories"
            ? renderCategoriesSection()
            : renderSubcategoriesSection()}
        </section>
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        onAddCategory={handleAddCategory}
      />

      <AddSubcategoryModal
        isOpen={showAddSubModal}
        onClose={() => setShowAddSubModal(false)}
        categories={categoriess}
        newSubcategory={newSubcategory}
        setNewSubcategory={setNewSubcategory}
        onAddSubcategory={handleAddSubcategory}
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
