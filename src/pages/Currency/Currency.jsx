import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Spinner,
  Tooltip
} from '@nextui-org/react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaMoneyBillWave } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useQuery } from 'react-query';
import userRequest from '../../utils/userRequest';
import AddCurrencyModal from "./AddCurrencyModal";
import UpdateCurrencyModal from './UpdateCurrencyModal';

const fetchCurrencies = async () => {
  const res = await userRequest.get("/currencies");
  return res.data.data;
};

const Currency = () => {
  const { data: currencies = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['currencies'],
    queryFn: fetchCurrencies
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [newCurrency, setNewCurrency] = useState({
    name: '',
    symbol: '',
  });
  const [editCurrency, setEditCurrency] = useState({
    name: "",
    symbol: "",
  });
  
  const handleAddCurrency = async () => {
    try {
      await userRequest.post("/currencies", {
        name: newCurrency.name,
        symbol: newCurrency.symbol,
      });
      setNewCurrency({ name: "", symbol: ""});
      refetch();
      setShowAddModal(false);
      toast.success("Currency added successfully!");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error.message || "Failed to add currency."
      );
    }
  };

  const handleEditCurrency = async () => {
    try {
      await userRequest.put(`/currencies/${selectedCurrency?._id}`, {
        name: editCurrency.name,
        symbol: editCurrency.symbol,
      });
      setShowEditModal(false);
      setSelectedCurrency(null);
      setEditCurrency({ name: "", symbol: "" });
      toast.success("Currency updated successfully!");
      refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to update currency.");
    }
  };

  const handleDeleteCurrency = (currency) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover this ${currency?.name || ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userRequest.delete(`/currencies/${currency?._id || ""}`);
          toast.success("The currency has been deleted.");
          refetch();
        } catch (error) {
          toast.error(error?.response?.data?.message || "Failed to delete the currency.");
        }
      }
    });
  };

  const openEditModal = (currency) => {
    setSelectedCurrency(currency);
    setEditCurrency({
      name: currency.name,
      symbol: currency.symbol,
    });
    setShowEditModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">Currencies</h1>
          </div>
          <p className="text-gray-600">Manage different currencies</p>
        </div>
        <div className="flex">
          <Chip
            color="primary"
            variant="flat"
            className="text-base font-semibold px-3 py-4 mt-1"
            startContent={
              <span role="img" aria-label="count" className="mr-1">
                💰
              </span>
            }
          >
            {currencies.length} Currency
            {currencies.length !== 1 && "s"}
          </Chip>
          <Button
            className="bg-gradient-to-r ms-2 from-blue-500 to-purple-600 text-white font-semibold"
            startContent={<FaPlus />}
            onPress={() => setShowAddModal(true)}
          >
            Add Currency
          </Button>
        </div>
      </div>

      {/* Currencies Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner color="success" size="lg" />
        </div>
      ) : currencies.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No Currencies found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currencies.map((currency) => (
            <Card
              key={currency._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FaMoneyBillWave className="text-2xl text-green-500" />
                    <div>
                      <h3 className="font-semibold text-lg">
                        <span className="text-green-500">Name: </span>
                        {currency.name}
                      </h3>
                      <p className="text-gray-600">
                        <span className="text-green-500">Symbol: </span>
                        {currency.symbol}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      isIconOnly
                      variant="light"
                      className="text-blue-500"
                      onPress={() => openEditModal(currency)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      isIconOnly
                      variant="light"
                      className="text-red-500"
                      onPress={() => handleDeleteCurrency(currency)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
                <div className="text-gray-600 mt-2">
                  <p>
                    Date: {new Date(currency.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-2">{currency.description}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

       <AddCurrencyModal
             isOpen={showAddModal}
             onClose={() => setShowAddModal(false)}
             newCurrency={newCurrency}
             setNewCurrency={setNewCurrency}
             onAddCurrency={handleAddCurrency}
           />
     
           {/* Update Currency Modal */}
           <UpdateCurrencyModal
             isOpen={showEditModal}
             onClose={() => setShowEditModal(false)}
             editCurrency={editCurrency}
             setEditCurrency={setEditCurrency}
             onEditCurrency={handleEditCurrency}
           />



    </div>
  );
};

export default Currency;
