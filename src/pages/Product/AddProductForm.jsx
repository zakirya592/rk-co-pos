import React, { useState } from "react";
import { Card, CardBody, Input, Select, SelectItem, Button, Textarea, Switch } from "@nextui-org/react";
import { FaImage, FaTrash, FaShoppingCart, FaBox, FaBoxes, FaTruck, FaPlus } from "react-icons/fa";
import userRequest from "../../utils/userRequest";
import { useQuery } from "react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddProductForm = () => {
  const [loading, setLoading] = useState(false);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [isCustomSize, setIsCustomSize] = useState(false);
  const navigate = useNavigate();
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    countInStock: "",
    category: "",
    purchaseRate: "",
    saleRate: "",
    wholesaleRate: "",
    retailRate: "",
    size: "",
    color: "",
    barcode: "",
    availableQuantity: "",
    soldOutQuantity: "",
    packingUnit: "",
    pouchesOrPieces: "",
    additionalUnit: "",
    isActive: "active",
    description: "",
    location: "",
    supplier: "",
    currency: "",
    image: "",
  });

  // Add this fetch function
  const fetchCategories = async () => {
    const res = await userRequest.get("/categories");
    return res.data.data || [];
  };

  // Add suppliers fetch function
  const fetchSuppliers = async () => {
    const res = await userRequest.get("/suppliers");
    return res?.data || [];
  };

  // Add currencies fetch function
  const fetchCurrencies = async () => {
    const res = await userRequest.get("/currencies");
    return res.data.data || [];
  };

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery(
    ["categories"],
    fetchCategories
  );

  const { data: suppliers = [], isLoading: isSuppliersLoading } = useQuery(
    ["suppliers"],
    fetchSuppliers
  );

  const { data: currencies = [], isLoading: isCurrenciesLoading } = useQuery(
    ["currencies"],
    fetchCurrencies
  );


  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSize = 4 * 1024 * 1024; // 4MB in bytes

    if (file.size > maxSize) {
      toast.error("Image is greater than 4MB. Please upload a smaller image.");
      return;
    }
    setNewProduct({ ...newProduct, image: file });
  };



  //  Handle add product
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(newProduct.currency, "newProduct.currency");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("price", newProduct.price);
      formData.append("purchaseRate", newProduct.purchaseRate);
      formData.append("saleRate", newProduct.saleRate);
      formData.append("wholesaleRate", newProduct.wholesaleRate);
      formData.append("retailRate", newProduct.retailRate);
      formData.append("size", newProduct.size);
      formData.append("color", newProduct.color);
      formData.append("barcode", newProduct.barcode);
      formData.append("availableQuantity", newProduct.availableQuantity);
      formData.append("soldOutQuantity", newProduct.soldOutQuantity);
      formData.append("packingUnit", newProduct.packingUnit);
      formData.append("additionalUnit", newProduct.additionalUnit);
      formData.append("pouchesOrPieces", newProduct.pouchesOrPieces);
      formData.append("description", newProduct.description);
      formData.append("category", newProduct.category);
      formData.append("countInStock", newProduct.countInStock);
      formData.append("currency", newProduct.currency);
      formData.append("supplier", newProduct.supplier);
      formData.append("location", newProduct.location);
      formData.append("isActive", newProduct.isActive === "active");
      formData.append("image", newProduct.image);

      await userRequest.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNewProduct({
        name: "",
        price: "",
        countInStock: "",
        category: "",
        purchaseRate: "",
        saleRate: "",
        wholesaleRate: "",
        retailRate: "",
        size: "",
        color: "",
        barcode: "",
        availableQuantity: "",
        soldOutQuantity: "",
        packingUnit: "",
        pouchesOrPieces: "",
        additionalUnit: "",
        isActive: "active",
        description: "",
        image: "",
      });
      toast.success("Product added successfully!");
      setLoading(false);
      navigate("/products");
    } catch (error) {
      setLoading(false);
      console.log(error, "reer");
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        "Failed to add product."
      );
    }
  };

  return (
    <div className="p-2 sm:p-2 md:p-6 space-y-6">
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-wrap  justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add New Product</h2>
              <Button
                type="submit"
                color="primary"
                //   className="w-auto mt-3 md:mt-0 sm:mt-3"
                className="bg-gradient-to-r w-auto from-blue-500 to-purple-600 text-white font-semibold"
                startContent={<FaPlus />}
                isLoading={loading}
              >
                Add Product
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                // label="Product Name"
                label={
                  <span>
                    Product Name{" "}
                    <span className="text-red-500 font-bold">*</span>
                  </span>
                }
                labelPlacement="outside"
                placeholder="Enter product name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                variant="bordered"
                required
              />
              <Select
                label={
                  <span>
                    Category
                    <span className="text-red-500 font-bold ms-1">*</span>
                  </span>
                }
                labelPlacement="outside"
                placeholder="Select category"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
                variant="bordered"
                required
              >
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="mt-7 bg-gradient-to-r from-blue-50 via-white to-blue-50 border border-blue-100 p-5 rounded-xl shadow-md">
              <div className="flex flex-col gap-4 ">
                {/* Header Row */}
                <div className="flex items-center justify-between flex-wrap">
                  {/* Section Title with Icon */}
                  <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                    Size Options
                  </h2>

                  {/* Custom Size Toggle */}
                  <div className="flex items-center gap-3 mt-3 md:mt-0 sm:mt-3">
                    <label
                      htmlFor="custom-size-toggle"
                      className="flex items-center cursor-pointer select-none"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="custom-size-toggle"
                          checked={isCustomSize}
                          onChange={() => {
                            setIsCustomSize(!isCustomSize);
                            setNewProduct({ ...newProduct, size: "" });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors"></div>
                        <div className="absolute top-0.5 left-0.5 h-4 w-4 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-700">
                        Custom Size
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Predefined Sizes - Single Select */}
              <div className="flex flex-wrap gap-2 mt-5 ms-4">
                {["Small", "Medium", "Large"].map((sizeOption) => (
                  <label key={sizeOption} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newProduct.size === sizeOption}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewProduct({ ...newProduct, size: sizeOption });
                        } else {
                          setNewProduct({ ...newProduct, size: "" });
                        }
                      }}
                      disabled={isCustomSize}
                    />
                    <span className="text-sm">{sizeOption}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="flex flex-col mt-5 gap-4 bg-gradient-to-r from-purple-50 via-white to-purple-50 border border-purple-100 p-5 rounded-xl shadow-md">
              {/* Header Row */}
              <div className="flex items-center justify-between flex-wrap">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                  Color Selection
                </h2>

                {/* Custom Color Toggle */}
                <div className="flex items-center gap-3 mt-3 md:mt-0 sm:mt-3">
                  <label
                    htmlFor="custom-color-toggle"
                    className="flex items-center cursor-pointer select-none"
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="custom-color-toggle"
                        checked={isCustomColor}
                        onChange={() => {
                          setIsCustomColor(!isCustomColor);
                          setNewProduct({ ...newProduct, color: "" });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-purple-500 transition-colors"></div>
                      <div className="absolute top-0.5 left-0.5 h-4 w-4 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-700">
                      Custom Color
                    </span>
                  </label>
                </div>
              </div>

              {/* Predefined Colors */}
              <div className="flex flex-wrap gap-3 ms-4">
                {["White", "Black"].map((colorOption) => (
                  <label key={colorOption} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newProduct.color === colorOption}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewProduct({
                            ...newProduct,
                            color: colorOption,
                          });
                        } else {
                          setNewProduct({ ...newProduct, color: "" });
                        }
                      }}
                      disabled={isCustomColor}
                    />
                    <span className="text-sm capitalize">{colorOption}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mt-10">
              <Select
                // label="Currency"
                label={
                  <span>
                    Currency
                    <span className="text-red-500 font-bold ms-1">*</span>
                  </span>
                }
                labelPlacement="outside"
                placeholder="Select currency"
                value={newProduct.currency}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, currency: e.target.value })
                }
                variant="bordered"
                className="md:col-span-2"
                showSearch
              >
                {currencies.map((currency) => (
                  <SelectItem
                    key={currency._id}
                    value={currency._id}
                    textValue={`${currency.name} ${currency.symbol}`}
                  >
                    {currency.name} {currency.symbol}
                  </SelectItem>
                ))}
              </Select>

              {/* <Input
                  label="Price"
                  labelPlacement="outside"
                  placeholder="0.00"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  variant="bordered"
                /> */}
              <Select
                label={
                  <span>
                    Supplier
                    <span className="text-red-500 font-bold ms-1">*</span>
                  </span>
                }
                labelPlacement="outside"
                placeholder="Select Supplier"
                //   selectedKeys={[selectedSupplier]}
                value={newProduct.supplier}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, supplier: e.target.value })
                }
                variant="bordered"
                className="md:col-span-2"
              >
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </Select>

              {/* <Input
                  label="Location"
                  labelPlacement="outside"
                  placeholder="Your Location"
                  type="text"
                  value={newProduct.location}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, location: e.target.value })
                  }
                  variant="bordered"
                /> */}
              {/* Size Selection */}
              <Input
                label="Custom Size"
                labelPlacement="outside"
                placeholder="Enter size"
                value={isCustomSize ? newProduct.size : ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, size: e.target.value })
                }
                variant="bordered"
                disabled={!isCustomSize}
                className={`transition-colors ${
                  !isCustomSize
                    ? "bg-gray-100 cursor-not-allowed text-gray-400 rounded-xl border border-gray-200"
                    : "bg-white "
                }`}
              />
              {/* Custom Color Input */}
              <Input
                label="Custom Color"
                labelPlacement="outside"
                placeholder="Enter color"
                value={isCustomColor ? newProduct.color : ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, color: e.target.value })
                }
                variant="bordered"
                disabled={!isCustomColor}
                className={`transition-colors ${
                  !isCustomColor
                    ? "bg-gray-100 cursor-not-allowed text-gray-400 rounded-xl border border-gray-200"
                    : "bg-white "
                }`}
              />

              {/* Pricing */}
              <Input
                // label="Purchase Rate"
                label={
                  <span>
                    purchase Rate
                    <span className="text-red-500 font-bold ms-1">*</span>
                  </span>
                }
                labelPlacement="outside"
                placeholder="0.00"
                type="number"
                value={newProduct.purchaseRate}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    purchaseRate: e.target.value,
                  })
                }
                // startContent={selectedCurrencySymbol}
                variant="bordered"
              />
              <Input
                label={
                  <span>
                    Sale Rate
                    <span className="text-red-500 font-bold ms-1">*</span>
                  </span>
                }
                labelPlacement="outside"
                placeholder="0.00"
                type="number"
                value={newProduct.saleRate}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, saleRate: e.target.value })
                }
                // startContent={selectedCurrencySymbol}
                variant="bordered"
              />
              <Input
                label={
                  <span>
                    Whole Sale Rate
                    <span className="text-red-500 font-bold ms-1">*</span>
                  </span>
                }
                labelPlacement="outside"
                placeholder="0.00"
                type="number"
                value={newProduct.wholesaleRate}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    wholesaleRate: e.target.value,
                  })
                }
                // startContent={selectedCurrencySymbol}
                variant="bordered"
              />
              <Input
                label={
                  <span>
                    Retail Rate
                    <span className="text-red-500 font-bold ms-1">*</span>
                  </span>
                }
                labelPlacement="outside"
                placeholder="0.00"
                type="number"
                value={newProduct.retailRate}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, retailRate: e.target.value })
                }
                // startContent={selectedCurrencySymbol}
                variant="bordered"
              />

              {/* <Input
                label="Available Quantity"
                labelPlacement="outside"
                placeholder="0"
                type="number"
                value={newProduct.availableQuantity}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    availableQuantity: e.target.value,
                  })
                }
                variant="bordered"
              /> */}

              <Input
                label={
                  <span>
                    Stock Quantity
                    <span className="text-red-500 font-bold ms-1">*</span>
                  </span>
                }
                labelPlacement="outside"
                placeholder="0"
                type="number"
                value={newProduct.countInStock}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    countInStock: e.target.value,
                  })
                }
                variant="bordered"
              />

              <Input
                label="Sold Out Quantity"
                labelPlacement="outside"
                placeholder="0"
                type="number"
                value={newProduct.soldOutQuantity}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    soldOutQuantity: e.target.value,
                  })
                }
                variant="bordered"
              />
              <Input
                label="Quantity Unit"
                labelPlacement="outside"
                placeholder="quantity unit"
                value={newProduct.additionalUnit}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    additionalUnit: e.target.value,
                  })
                }
                variant="bordered"
              />
              <Input
                label="packaging unit"
                labelPlacement="outside"
                placeholder="packaging unit"
                value={newProduct.packingUnit}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    packingUnit: e.target.value,
                  })
                }
                variant="bordered"
              />
              <Input
                label="Pouches or Nos"
                labelPlacement="outside"
                type="number"
                placeholder="Enter pouches or nos"
                value={newProduct.pouchesOrPieces}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    pouchesOrPieces: e.target.value,
                  })
                }
                variant="bordered"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mt-3">
              {/* Description */}
              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="flex items-center gap-2">
                  <Switch
                    label="Active"
                    isSelected={newProduct.isActive === "active"}
                    onValueChange={(value) =>
                      setNewProduct({
                        ...newProduct,
                        isActive: value ? "active" : "inactive",
                      })
                    }
                  />
                  <span className="text-sm text-gray-600">
                    {newProduct.isActive === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <Textarea
                label={
                  <span>
                    Description
                    <span className="text-red-500 font-bold ms-1">*</span>
                  </span>
                }
                labelPlacement="outside"
                placeholder="Enter product description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    description: e.target.value,
                  })
                }
                variant="bordered"
                minRows={3}
                className="md:col-span-5"
              />

              {/* Image upload */}
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700">
                  Product Image
                </label>
                <div className="relative">
                  {!newProduct.image ? (
                    <label
                      htmlFor="product-image-upload"
                      className="flex flex-col w-32 text-sm items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-32 cursor-pointer hover:border-blue-400 transition-colors"
                    >
                      <FaImage className="text-4xl text-gray-300 mb-2" />
                      <span className="text-gray-500">
                        Click to upload image
                      </span>
                      <input
                        id="product-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  ) : (
                    <div className="relative w-32 h-32">
                      <img
                        src={
                          newProduct.image instanceof File
                            ? URL.createObjectURL(newProduct.image)
                            : newProduct.image
                        }
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-100 transition-colors"
                        onClick={() =>
                          setNewProduct({ ...newProduct, image: "" })
                        }
                        title="Remove image"
                      >
                        <FaTrash className="text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default AddProductForm;
