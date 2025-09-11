import React, { useEffect, useState } from "react";
// import StockTransferModal from "./StockTransferModal";
import {
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
} from "@nextui-org/react";
import { useParams } from "react-router-dom";
import userRequest from "../../utils/userRequest";
import StockTransferModal from "../WareHHouse/StockTransferModal";

const ShopDetails = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStockTransferOpen, setIsStockTransferOpen] = useState(false);

  // ✅ Cache for suppliers, categories, currencies
  const detailsCache = {
    categories: {},
    suppliers: {},
    currencies: {},
  };

  const fetchDetailsById = async (endpoint, entityId, cacheKey) => {
    if (!entityId) return null;

    // ✅ Use cache if available
    if (detailsCache[cacheKey][entityId]) {
      return detailsCache[cacheKey][entityId];
    }

    try {
      const res = await userRequest.get(`/${endpoint}/${entityId}`);
      const data = res.data?.data || res.data; // handle both shapes

      if (data) {
        detailsCache[cacheKey][entityId] = data;
        return data;
      }
    } catch (err) {
      console.error(`❌ Failed to fetch ${endpoint}/${entityId}`, err);
    }

    return null;
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await userRequest.get(`/products/location/shop/${id}`);
      let productsData = res.data.data || [];

      const enrichedProducts = await Promise.all(
        productsData.map(async (product) => {
          const [category, supplier, currency] = await Promise.all([
            product.category
              ? fetchDetailsById("categories", product.category, "categories")
              : null,
            product.supplier
              ? fetchDetailsById("suppliers", product.supplier, "suppliers")
              : null,
            product.currency
              ? fetchDetailsById("currencies", product.currency, "currencies")
              : null,
          ]);

          return {
            ...product,
            category,
            supplier,
            currency,
          };
        })
      );

      setProducts(enrichedProducts);
    } catch (err) {
      setError("Failed to fetch products");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [id]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Shop Products
        </h1>
        <Button
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
          onClick={() => setIsStockTransferOpen(true)}
        >
          Stock Transfer
        </Button>
      </div>

      <Table
        aria-label="Warehouse Products"
        className="w-full overflow-x-scroll"
      >
        <TableHeader>
          <TableColumn>Name</TableColumn>
          <TableColumn>Category</TableColumn>
          <TableColumn>Color</TableColumn>
          <TableColumn>Size</TableColumn>
          <TableColumn>Supplier</TableColumn>
          <TableColumn>Currency</TableColumn>
          <TableColumn>Purchase Rate</TableColumn>
          <TableColumn>Sale Rate</TableColumn>
          <TableColumn>Stock</TableColumn>
          <TableColumn>Description</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={loading}
          loadingContent={
            <div className="flex justify-center items-center py-8">
              <Spinner color="success" size="lg" />
            </div>
          }
          emptyContent={
            <div className="text-center text-gray-500 py-8">
              No products found
            </div>
          }
        >
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>
                <Chip>{product.category?.name || "Unknown Category"}</Chip>
              </TableCell>
              <TableCell>
                <Chip>{product.color || "N/A"}</Chip>
              </TableCell>
              <TableCell>{product.size || "N/A"}</TableCell>
              <TableCell>
                {product.supplier?.name || "Unknown Supplier"}
              </TableCell>
              <TableCell>
                {product.currency?.symbol} {product.currency?.code || ""}
              </TableCell>
              <TableCell>{product.purchaseRate}</TableCell>
              <TableCell>{product.saleRate}</TableCell>
              <TableCell>{product.currentStock}</TableCell>
              <TableCell>{product.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <StockTransferModal
        isOpen={isStockTransferOpen}
        onClose={() => setIsStockTransferOpen(false)}
        products={products}
        fromWarehouseId={id}
        apirefresh={fetchProducts}
      />
    </div>
  );
};

export default ShopDetails;
