import React, { useState, useEffect } from "react";
import { Card, CardBody, Input, Select, SelectItem, Button, Textarea, Switch } from "@nextui-org/react";
import { FaImage, FaTrash, FaPlus } from "react-icons/fa";
import userRequest from "../../utils/userRequest";
import { useQuery } from "react-query";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const UpdateProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [product, setProduct] = useState(null);

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
  //Add warehouse fetch function
  const fetchWarehouses = async () => {
    const res = await userRequest.get("/warehouses");
    return res.data.data || [];
  };

  const { data: suppliers = [], isLoading: isSuppliersLoading } = useQuery(
    ["suppliers"],
    fetchSuppliers
  );

  const { data: currencies = [], isLoading: isCurrenciesLoading } = useQuery(
    ["currencies"],
    fetchCurrencies
  );

  const { data: Warehouses = [], isLoading: isfetchWarehousesLoading } =
    useQuery(["Warehouses"], fetchWarehouses);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await userRequest.get(`/products/${id}`);
        const productData = res.data.data;
        setProduct(productData);
        setProduct({
          ...productData,
          currency: productData.currency?._id || productData.currency,
          supplier: productData.supplier?._id || productData.supplier,
          warehouse: productData.warehouse?._id || productData.warehouse,
        });
        setIsCustomColor(!["white", "black"].includes(productData?.color?.toLowerCase()));
        setIsCustomSize(!["small", "medium", "large"].includes(productData?.size?.toLowerCase()));
      } catch (error) {
        toast.error("Failed to fetch product details");
        navigate("/products");
      }
    };
    fetchProduct();
  }, [id, navigate]);

  // Fetch categories
  const fetchCategories = async () => {
    const res = await userRequest.get("/categories");
    return res.data.data || [];
  };

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery(
    ["categories"],
    fetchCategories
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
    setProduct({ ...product, image: file });
  };

  const getCategoryId = () => {
    if (!product.category) return "";
    return typeof product.category === "object"
      ? product.category._id
      : product.category;
  };
  // Handle update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product) return;

    setLoading(true);
    try {
      const formData = new FormData();

      // Helper to safely append only meaningful values
      const safeAppend = (key, value) => {
        if (value === undefined || value === null) return;
        // allow zero/false but skip empty strings
        if (typeof value === "string" && value.trim() === "") return;
        formData.append(key, value);
      };

      // Resolve IDs from possible populated objects
      const categoryId = typeof product.category === "object" && product.category !== null
        ? product.category._id
        : product.category;
      const currencyId = typeof product.currency === "object" && product.currency !== null
        ? product.currency._id
        : product.currency;
      const supplierId = typeof product.supplier === "object" && product.supplier !== null
        ? product.supplier._id
        : product.supplier;
      const warehouseId = typeof product.warehouse === "object" && product.warehouse !== null
        ? product.warehouse._id
        : product.warehouse;

      // Whitelist fields to avoid sending nested/derived fields like reviews, ratings, etc.
      safeAppend("name", product.name);
      safeAppend("category", categoryId);
      safeAppend("color", product.color);
      safeAppend("size", product.size);
      safeAppend("currency", currencyId);
      safeAppend("supplier", supplierId);
      safeAppend("warehouse", warehouseId);

      // Numeric fields (coerce to number-like strings only if valid)
      const num = (v) => {
        const n = v === "" ? NaN : Number(v);
        return Number.isFinite(n) ? String(n) : null;
      };
      const int = (v) => {
        const n = v === "" ? NaN : parseInt(v, 10);
        return Number.isFinite(n) ? String(n) : null;
        };

      safeAppend("purchaseRate", num(product.purchaseRate));
      safeAppend("saleRate", num(product.saleRate));
      safeAppend("wholesaleRate", num(product.wholesaleRate));
      safeAppend("retailRate", num(product.retailRate));
      safeAppend("countInStock", int(product.countInStock));
      safeAppend("soldOutQuantity", int(product.soldOutQuantity));
      safeAppend("additionalUnit", product.additionalUnit);
      safeAppend("packingUnit", product.packingUnit);
      safeAppend("pouchesOrPieces", int(product.pouchesOrPieces));

      // Boolean field
      if (typeof product.isActive === "boolean") {
        formData.append("isActive", String(product.isActive));
      }

      // Description
      safeAppend("description", product.description);

      // Image: only append if it's a File (avoid sending existing URL or empty string)
      if (product.image instanceof File) {
        formData.append("image", product.image);
      }

      // Note: Intentionally NOT sending fields like reviews, ratings, __v, createdAt, updatedAt

      console.log("Submitting product update with fields:", [...formData.keys()]);
      await userRequest.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product updated successfully!");
      navigate("/products");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        "Failed to update product."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!product) return (
    <>
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading Product data ...</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="p-2 sm:p-2 md:p-6 space-y-6">
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-wrap justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Update Product</h2>
              <Button
                type="submit"
                color="primary"
                className="bg-gradient-to-r w-auto from-blue-500 to-purple-600 text-white font-semibold"
                startContent={<FaPlus />}
                isLoading={loading}
              >
                Update Product
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={
                  <span>
                    Product Name{" "}
                    <span className="text-red-500 font-bold">*</span>
                  </span>
                }
                labelPlacement="outside"
                placeholder="Enter product name"
                value={product.name}
                onChange={(e) =>
                  setProduct({ ...product, name: e.target.value })
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
                selectedKeys={getCategoryId() ? [getCategoryId()] : []}
                value={product.category?._id || product.category}
                onChange={(e) =>
                  setProduct({ ...product, category: e.target.value })
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
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap">
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
                            setProduct({ ...product, size: "" });
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

                <div className="flex flex-wrap gap-2 mt-5 ms-4">
                  {["Small", "Medium", "Large"].map((sizeOption) => (
                    <label key={sizeOption} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={product.size === sizeOption}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProduct({ ...product, size: sizeOption });
                          } else {
                            setProduct({ ...product, size: "" });
                          }
                        }}
                        disabled={isCustomSize}
                      />
                      <span className="text-sm">{sizeOption}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-7 bg-gradient-to-r from-purple-50 via-white to-purple-50 border border-purple-100 p-5 rounded-xl shadow-md">
              <div className="flex flex-col gap-4">
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
                            setProduct({ ...product, color: "" });
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

                <div className="flex flex-wrap gap-2 mt-5 ms-4">
                  {["Black", "White"].map((colorOption) => (
                    <label
                      key={colorOption}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={product.color === colorOption}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProduct({ ...product, color: colorOption });
                          } else {
                            setProduct({ ...product, color: "" });
                          }
                        }}
                        disabled={isCustomColor}
                      />
                      <span className="text-sm">{colorOption}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mt-10">
              <Select
                label={
                  <span>
                    Currency
                    <span className="text-red-500 font-bold ms-1">*</span>
                  </span>
                }
                labelPlacement="outside"
                placeholder="Select currency"
                selectedKeys={product.currency ? [product.currency] : []}
                value={product.currency}
                onChange={(e) =>
                  setProduct({ ...product, currency: e.target.value })
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

              <Select
                label={
                  <span>
                    Supplier
                    <span className="text-red-500 font-bold ms-1">*</span>
                  </span>
                }
                labelPlacement="outside"
                placeholder="Select Supplier"
                selectedKeys={product.supplier ? [product.supplier] : []}
                value={product.supplier}
                onChange={(e) =>
                  setProduct({ ...product, supplier: e.target.value })
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

              <Select
                label={
                  <span>
                    Warehouses
                    <span className="text-red-500 font-bold ms-1">*</span>
                  </span>
                }
                labelPlacement="outside"
                placeholder="Select Warehouses"
                selectedKeys={product.warehouse ? [product.warehouse] : []}
                value={product.warehouse}
                onChange={(e) =>
                  setProduct({ ...product, warehouse: e.target.value })
                }
                variant="bordered"
                className="md:col-span-2"
              >
                {Warehouses.map((warehouse) => (
                  <SelectItem key={warehouse._id} value={warehouse._id}>
                    {warehouse?.name || ""}
                  </SelectItem>
                ))}
              </Select>

              {/* Size Selection */}
              <Input
                label="Custom Size"
                labelPlacement="outside"
                placeholder="Enter size"
                value={isCustomSize ? product.size : ""}
                onChange={(e) =>
                  setProduct({ ...product, size: e.target.value })
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
                value={isCustomColor ? product.color : ""}
                onChange={(e) =>
                  setProduct({ ...product, color: e.target.value })
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
                label={
                  <span>
                    purchase Rate
                    <span className="text-red-500 font-bold ms-1">*</span>
                  </span>
                }
                labelPlacement="outside"
                placeholder="0.00"
                type="number"
                value={product.purchaseRate}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    purchaseRate: e.target.value,
                  })
                }
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
                value={product.saleRate}
                onChange={(e) =>
                  setProduct({ ...product, saleRate: e.target.value })
                }
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
                value={product.wholesaleRate}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    wholesaleRate: e.target.value,
                  })
                }
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
                value={product.retailRate}
                onChange={(e) =>
                  setProduct({ ...product, retailRate: e.target.value })
                }
                variant="bordered"
              />

              {/* <Input
                label="Available Quantity"
                labelPlacement="outside"
                placeholder="0"
                type="number"
                value={product.availableQuantity}
                onChange={(e) =>
                  setProduct({
                    ...product,
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
                value={product.countInStock}
                onChange={(e) =>
                  setProduct({
                    ...product,
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
                value={product.soldOutQuantity}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    soldOutQuantity: e.target.value,
                  })
                }
                variant="bordered"
              />
              <Input
                label="Quantity Unit"
                labelPlacement="outside"
                placeholder="quantity unit"
                value={product.additionalUnit}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    additionalUnit: e.target.value,
                  })
                }
                variant="bordered"
              />
              <Input
                label="packaging unit"
                labelPlacement="outside"
                placeholder="packaging unit"
                value={product.packingUnit}
                onChange={(e) =>
                  setProduct({
                    ...product,
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
                value={product.pouchesOrPieces}
                onChange={(e) =>
                  setProduct({
                    ...product,
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
                    isSelected={product.isActive}
                    onValueChange={(value) =>
                      setProduct({
                        ...product,
                        isActive: value,
                      })
                    }
                  />
                  <span className="text-sm text-gray-600">
                    {product.isActive ? "Active" : "Inactive"}
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
                value={product.description}
                onChange={(e) =>
                  setProduct({
                    ...product,
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
                  {!product.image ? (
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
                          product.image instanceof File
                            ? URL.createObjectURL(product.image)
                            : product.image
                        }
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 shadow hover:bg-red-100 transition-colors"
                        onClick={() => setProduct({ ...product, image: "" })}
                        title="Remove image"
                      >
                        <FaTrash className="text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="bordered"
                onClick={() => navigate("/products")}
              >
                Cancel
              </Button>
            </div> */}
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default UpdateProductForm;
