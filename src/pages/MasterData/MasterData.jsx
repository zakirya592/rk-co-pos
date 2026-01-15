import React, { useState } from 'react';
import { Tabs, Tab, Card, CardBody, Button } from '@nextui-org/react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import QuantityUnitsTable from './components/QuantityUnitsTable';
import PackingUnitsTable from './components/PackingUnitsTable';
import userRequest from '../../utils/userRequest';
import PochuesTable from './components/PochuesTable';
import AssetsTable from './components/AssetsTable';
import { 
  FaBoxes, 
  FaLayerGroup, 
  FaTags,
  FaDollarSign,
  FaChartLine,
  FaFileInvoice,
  FaHandshake,
  FaWallet,
  FaCoins,
  FaUserTie,
  FaUsers,
  FaBuilding,
  FaBook
} from 'react-icons/fa';

const MasterData = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("quantity-units");
  const [selectedSidebarItem, setSelectedSidebarItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data for all tables
  const { data: quantityUnitsData, refetch: refetchQuantityUnits } = useQuery(
    'quantityUnits',
    async () => {
      const { data } = await userRequest.get("/quantity-units");
      return data.data;
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch quantity units');
      },
    }
  );

  const { data: packingUnitsData, refetch: refetchPackingUnits } = useQuery(
    'packingUnits',
    async () => {
      const { data } = await userRequest.get("/packing-units");
      return data.data;
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch packing units');
      },
    }
  );

  const { data: productsData, refetch: refetchProducts } = useQuery(
    'products',
    async () => {
      const { data } = await userRequest.get("/pochues");
      return data.data;
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch products');
      },
    }
  );

  const { data: assetsData, refetch: refetchAssets } = useQuery(
    'assets',
    async () => {
      const { data } = await userRequest.get("/assets");
      // Handle nested structure: data.data.assets
      if (data?.data?.assets && Array.isArray(data.data.assets)) {
        return data.data.assets;
      }
      // Fallback for other response structures
      if (Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch assets');
      },
    }
  );

  const handleTabChange = (key) => {
    setSelectedTab(key);
  };

  const refetchAll = () => {
    refetchQuantityUnits();
    refetchPackingUnits();
    refetchProducts();
    refetchAssets();
  };

  const sidebarItems = [
    { key: 'assets', label: 'Assets', icon: <FaDollarSign /> },
    { key: 'income', label: 'Income', icon: <FaChartLine /> },
    { key: 'liability', label: 'Liability', icon: <FaFileInvoice /> },
    { key: 'partnership', label: 'Partnership', icon: <FaHandshake /> },
    { key: 'cashbook', label: 'Cashbook', icon: <FaWallet /> },
    { key: 'capital', label: 'Capital', icon: <FaCoins /> },
    { key: 'owner', label: 'Owner', icon: <FaUserTie /> },
    { key: 'employee', label: 'Employee', icon: <FaUsers /> },
    { key: 'property-accounts', label: 'Property Accounts', icon: <FaBuilding /> },
  ];

  const renderSidebarContent = () => {
    if (!selectedSidebarItem) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Select an option from the sidebar to view details</p>
        </div>
      );
    }

    const item = sidebarItems.find(i => i.key === selectedSidebarItem);
    
    // Render Assets table when assets is selected
    if (selectedSidebarItem === 'assets') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            {item?.icon}
            {item?.label}
          </h2>
          <Card>
            <CardBody>
              <AssetsTable
                data={Array.isArray(assetsData) ? assetsData : []}
                onRefresh={refetchAll}
              />
            </CardBody>
          </Card>
        </div>
      );
    }
    
    // For other items, show placeholder
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          {item?.icon}
          {item?.label}
        </h2>
        <Card>
          <CardBody>
            <p className="text-gray-600">
              {item?.label} management section. This feature is coming soon.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Master Data</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">Existing Options</p>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedTab("quantity-units");
                    setSelectedSidebarItem(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    selectedTab === "quantity-units" && !selectedSidebarItem
                      ? "bg-teal-100 text-teal-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaBoxes />
                  Quantity Units
                </button>
                <button
                  onClick={() => {
                    setSelectedTab("packing-units");
                    setSelectedSidebarItem(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    selectedTab === "packing-units" && !selectedSidebarItem
                      ? "bg-teal-100 text-teal-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaLayerGroup />
                  Packing Units
                </button>
                <button
                  onClick={() => {
                    setSelectedTab("pochues");
                    setSelectedSidebarItem(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    selectedTab === "pochues" && !selectedSidebarItem
                      ? "bg-teal-100 text-teal-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FaTags />
                  Pochues
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">New Options</p>
              <div className="space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setSelectedSidebarItem(item.key);
                      setSelectedTab(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      selectedSidebarItem === item.key
                        ? "bg-teal-100 text-teal-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Master Data Management</h1>
            <Button
              variant="flat"
              onPress={() => navigate('/Navigation')}
            >
              Dashboard
            </Button>
          </div>

          {selectedSidebarItem ? (
            renderSidebarContent()
          ) : (
            <Card className="w-full">
              <CardBody className="p-0">
                <Tabs
                  aria-label="Master data tabs"
                  selectedKey={selectedTab}
                  onSelectionChange={handleTabChange}
                  className="px-4 pt-2"
                  variant="underlined"
                >
                  <Tab key="quantity-units" title="Quantity Units">
                    <div className="p-4">
                      <QuantityUnitsTable
                        data={quantityUnitsData || []}
                        onRefresh={refetchAll}
                      />
                    </div>
                  </Tab>
                  <Tab key="packing-units" title="Packing Units">
                    <div className="p-4">
                      <PackingUnitsTable
                        data={packingUnitsData || []}
                        quantityUnits={quantityUnitsData || []}
                        onRefresh={refetchAll}
                      />
                    </div>
                  </Tab>
                  <Tab key="pochues" title="Pochues">
                    <div className="p-4">
                      <PochuesTable
                        data={productsData || []}
                        packingUnits={packingUnitsData || []}
                        onRefresh={refetchAll}
                      />
                    </div>
                  </Tab>
                </Tabs>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterData;
