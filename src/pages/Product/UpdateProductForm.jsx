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

  const { data: suppliers = [], isLoading: isSuppliersLoading } = useQuery(
    ["suppliers"],
    fetchSuppliers
  );

  const { data: currencies = [], isLoading: isCurrenciesLoading } = useQuery(
    ["currencies"],
    fetchCurrencies
  );

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
        });
        setIsCustomColor(!["white", "black"].includes(productData?.color?.toLowerCase()));
        setIsCustomSize(!["small", "medium", "large"].includes(productData?.size?.toLowerCase()));
        // setSelectedCurrency(res.data.data.currency || "₨");
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
      console.log(formData, "formData");
      
      // Handle category specially since it might be an object or string
      formData.append("category", typeof product.category === "object" && product.category !== null ? product.category._id : product.category);
      // Append other fields
      Object.keys(product).forEach(key => {
        if (key !== "_id" && key !== "category") {
          formData.append(key, product[key]);
        }
      });

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

  if (!product) return <div>Loading...</div>;

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
                label="Product Name"
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
                label="Category"
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
              <Input
                label="Barcode"
                labelPlacement="outside"
                placeholder="Enter barcode"
                value={product.barcode}
                onChange={(e) =>
                  setProduct({ ...product, barcode: e.target.value })
                }
                variant="bordered"
              />

              <Select
                label="Currency"
                labelPlacement="outside"
                placeholder="Select currency"
                selectedKeys={
                  product.currency ? [product.currency] : []
                }
                value={product.currency}
                // onChange={(e) => {
                //   const selectedCurrency = currencies.find(c => c.code === e.target.value);
                //   setProduct({ ...product, currency: selectedCurrency });
                // }}
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

              <Input
                label="Price"
                labelPlacement="outside"
                placeholder="0.00"
                type="number"
                value={product.price}
                onChange={(e) =>
                  setProduct({ ...product, price: e.target.value })
                }
                variant="bordered"
              />
              <Select
                label="Supplier"
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

              <Input
                label="Location"
                labelPlacement="outside"
                placeholder="Your Location"
                type="text"
                value={product.location}
                onChange={(e) =>
                  setProduct({ ...product, location: e.target.value })
                }
                variant="bordered"
              />
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
                label="Purchase Rate"
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
                label="Sale Rate"
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
                label="Whole Sale Rate"
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
                label="Retail Rate"
                labelPlacement="outside"
                placeholder="0.00"
                type="number"
                value={product.retailRate}
                onChange={(e) =>
                  setProduct({ ...product, retailRate: e.target.value })
                }
                variant="bordered"
              />

              <Input
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
              />

              <Input
                label="Stock Quantity"
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
                label="Description"
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
