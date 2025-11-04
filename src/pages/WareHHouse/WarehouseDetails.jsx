import React, { useEffect, useState } from "react";
import StockTransferModal from "./StockTransferModal";
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
import { useParams, useNavigate } from "react-router-dom";
import userRequest from "../../utils/userRequest";

const WarehouseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      const res = await userRequest.get(`/stock-transfers/by-location/warehouse/${id}`);
      const payload = res?.data || {};
      const transfers = payload?.data || [];
      const purchases = payload?.purchases || [];
      const availableStock = payload?.availableStockByProduct || [];

      // Build a map of productId -> product object from any transfer items AND purchase items
      const productIdToProduct = new Map();
      
      // Extract products from transfers
      transfers.forEach((t) => {
        (t.items || []).forEach((it) => {
          const prod = it?.product;
          if (prod && prod._id && !productIdToProduct.has(prod._id)) {
            productIdToProduct.set(prod._id, prod);
          }
        });
      });

      // Extract products from purchases
      purchases.forEach((purchase) => {
        (purchase.items || []).forEach((it) => {
          const prod = it?.product;
          if (prod && prod._id && !productIdToProduct.has(prod._id)) {
            productIdToProduct.set(prod._id, prod);
          }
        });
      });

      // Merge availability onto product objects; fall back to minimal object if needed
      const productsData = availableStock.map((row) => {
        const prod = productIdToProduct.get(row.product) || { _id: row.product, name: "Unknown" };
        return {
          ...prod,
          availableStockAtWarehouse: row.availableAtLocation ?? 0,
        };
      });

      // If no availableStock but we have products from transfers/purchases, include them too
      if (productsData.length === 0) {
        productIdToProduct.forEach((prod) => {
          if (!productsData.find(p => p._id === prod._id)) {
            productsData.push({
              ...prod,
              availableStockAtWarehouse: prod.countInStock ?? 0,
            });
          }
        });
      }

      // Enrich category/supplier/currency when present (object vs id safe)
      const enrichedProducts = await Promise.all(
        productsData.map(async (product) => {
          const categoryPromise = !product.category
            ? Promise.resolve(null)
            : typeof product.category === "object"
            ? Promise.resolve(product.category)
            : fetchDetailsById("categories", product.category, "categories");

          const supplierPromise = !product.supplier
            ? Promise.resolve(null)
            : typeof product.supplier === "object"
            ? Promise.resolve(product.supplier)
            : fetchDetailsById("suppliers", product.supplier, "suppliers");

          const currencyPromise = !product.currency
            ? Promise.resolve(null)
            : typeof product.currency === "object"
            ? Promise.resolve(product.currency)
            : fetchDetailsById("currencies", product.currency, "currencies");

          const [category, supplier, currency] = await Promise.all([
            categoryPromise,
            supplierPromise,
            currencyPromise,
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
          Warehouse Products
        </h1>
        <div className="flex gap-3">
          <Button
            className="bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold"
            onClick={() => navigate(`/damage-products/warehouse/${id}`)}
          >
            Damage Products
          </Button>
          <div className="flex gap-2">
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
              onClick={() => setIsStockTransferOpen(true)}
            >
              Add Stock Transfer
            </Button>
            <Button
              variant="flat"
              onClick={() => navigate(`/stock-transfers/warehouse/${id}`)}
            >
              Stock Transfers
            </Button>
          </div>
        </div>
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
          <TableColumn>Stock</TableColumn>
          <TableColumn>Damaged Qty</TableColumn>
          <TableColumn>Returned Qty</TableColumn>
          <TableColumn>Sold Out Qty</TableColumn>
          <TableColumn>Total Amount</TableColumn>
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
              <TableCell>{product.availableStockAtWarehouse ?? product.countInStock ?? 0}</TableCell>
              <TableCell>{product.damagedQuantity || 0}</TableCell>
              <TableCell>{product.returnedQuantity || 0}</TableCell>
              <TableCell>{product.soldOutQuantity || 0}</TableCell>
              <TableCell>
                {product.currency?.symbol} {Math.round(product.purchaseRate * (product.availableStockAtWarehouse ?? product.countInStock ?? 0))}
              </TableCell>
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

export default WarehouseDetails;
