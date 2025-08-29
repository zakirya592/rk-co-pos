import React, { useEffect, useState } from 'react';
import { Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from '@nextui-org/react';
import { useParams } from 'react-router-dom';
import userRequest from '../../utils/userRequest';

const WarehouseDetails = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await userRequest.get(`/warehouses/${id}/products`);
        setProducts(res.data.data || []);
      } catch (err) {
        setError('Failed to fetch products');
      }
      setLoading(false);
    };
    fetchProducts();
  }, [id]);

//   if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Warehouse Products
      </h1>
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
              No Warehouse found
            </div>
          }
        >
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>
                <Chip>{product.category?.name}</Chip>
              </TableCell>
              <TableCell>
                <Chip>{product.color || ""}</Chip>
              </TableCell>
              <TableCell>{product.size || ""}</TableCell>
              <TableCell>{product.supplier?.name}</TableCell>
              <TableCell>
                {product.currency?.symbol} {product.currency?.code}
              </TableCell>
              <TableCell>{product.purchaseRate}</TableCell>
              <TableCell>{product.saleRate}</TableCell>
              <TableCell>{product.countInStock}</TableCell>
              <TableCell>{product.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WarehouseDetails;
