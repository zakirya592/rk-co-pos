import React, { useState, useEffect } from "react";
import { Card, CardBody, Button, Input, Spinner } from "@nextui-org/react";
import { FaPlus, FaTrash } from "react-icons/fa";
import userRequest from "../../utils/userRequest";
import toast from "react-hot-toast";

const fetchInventory = async () => {
  const res = await userRequest.get("/inventory");
  return res.data || [];
};

const Warehouse = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: "", quantity: 0 });

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const data = await fetchInventory();
        setInventory(data);
      } catch (error) {
        toast.error("Failed to fetch inventory.");
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, []);

  const addProduct = async () => {
    try {
      const res = await userRequest.post("/inventory", newProduct);
      setInventory([...inventory, res.data]);
      setNewProduct({ name: "", quantity: 0 });
      toast.success("Product added successfully!");
    } catch (error) {
      toast.error("Failed to add product.");
    }
  };

  const removeProduct = async (id) => {
    try {
      await userRequest.delete(`/inventory/${id}`);
      setInventory(inventory.filter((item) => item._id !== id));
      toast.success("Product removed successfully!");
    } catch (error) {
      toast.error("Failed to remove product.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Warehouse Management</h1>
      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold mb-2">Add New Product</h2>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Quantity"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
            />
            <Button onPress={addProduct} startContent={<FaPlus />}>
              Add
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner color="success" size="lg" />
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold mb-2">Current Inventory</h2>
              <ul>
                {inventory.map((item) => (
                  <li key={item._id} className="flex justify-between items-center p-2 border-b">
                    <span>{item.name} - {item.quantity}</span>
                    <Button
                      color="danger"
                      onPress={() => removeProduct(item._id)}
                      isIconOnly
                      size="sm"
                    >
                      <FaTrash />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Warehouse;